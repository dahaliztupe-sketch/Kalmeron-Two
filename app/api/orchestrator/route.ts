import { NextRequest, NextResponse } from 'next/server';
import { orchestratorWithCheckpoint } from '@/src/ai/orchestrator/graph';
import { HumanMessage } from '@langchain/core/messages';
import { runWithLearningContext } from '@/src/lib/learning/context';
import { adminAuth } from '@/src/lib/firebase-admin';
import { getMemberRole } from '@/src/lib/workspaces/workspaces';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { createRequestLogger } from '@/src/lib/logger';
import xss from 'xss';

export const runtime = 'nodejs';

/**
 * POST /api/orchestrator
 *
 * Authoritative orchestrator entry point. Previously this route accepted
 * `userId` and `workspaceId` from the request body with no token check,
 * which let any caller impersonate any user/workspace and burn LLM credits
 * against their account. Closed 2026-04-25.
 *
 * The caller MUST provide a Firebase ID token in `Authorization: Bearer`.
 * The userId and workspaceId are now derived from the verified token and a
 * server-side workspace-membership check; client-supplied values are
 * ignored.
 */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const log = createRequestLogger(requestId);

  // 1. Auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7).trim());
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  // 2. Rate limit (per-user)
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000, userId });
  if (!rl.success) return rateLimitResponse();

  // 3. Parse + sanitize input (workspaceId is verified for membership)
  let body: { message?: unknown; workspaceId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const message = xss(String(body.message ?? '').slice(0, 10000));
  const requestedWorkspaceId = xss(String(body.workspaceId ?? '').slice(0, 128));
  if (!message.trim()) {
    return NextResponse.json({ error: 'message_required' }, { status: 400 });
  }

  let workspaceId = '';
  if (requestedWorkspaceId) {
    try {
      const role = await getMemberRole(requestedWorkspaceId, userId);
      if (!role) {
        return NextResponse.json({ error: 'forbidden_workspace' }, { status: 403 });
      }
      workspaceId = requestedWorkspaceId;
    } catch (err) {
      log.warn({ err, workspaceId: requestedWorkspaceId }, 'orchestrator_workspace_check_failed');
      return NextResponse.json({ error: 'workspace_check_failed' }, { status: 500 });
    }
  }

  try {
    const result = await runWithLearningContext(
      { workspaceId, task: message },
      () =>
        orchestratorWithCheckpoint.invoke(
          {
            messages: [new HumanMessage(message)],
            task: message,
            workspaceId,
            intermediateResults: {},
          },
          {
            configurable: {
              thread_id: userId,
            },
          }
        )
    );

    const lastMessage = result.messages[result.messages.length - 1];
    return NextResponse.json(
      {
        response: lastMessage?.content ?? '',
        agentsUsed: Object.keys(result.intermediateResults || {}),
      },
      { headers: { 'X-Request-ID': requestId } },
    );
  } catch (error) {
    log.error({ err: error }, 'orchestrator_failed');
    return NextResponse.json(
      { error: 'orchestrator_failed' },
      { status: 500, headers: { 'X-Request-ID': requestId } },
    );
  }
}
