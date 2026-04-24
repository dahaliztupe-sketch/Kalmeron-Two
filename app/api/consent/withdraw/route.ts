import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { withdrawConsent, type ConsentType, type ConsentSource } from '@/src/lib/consent/state';
import { extractClientInfo } from '@/src/lib/audit/log';

export const runtime = 'nodejs';

const Body = z.object({
  workspaceId: z.string().optional(),
  consentType: z.enum([
    'tos', 'privacy', 'marketing_email',
    'whatsapp_outreach', 'data_export', 'ai_training_optout',
  ]),
  policyVersion: z.string().min(1).max(80),
  source: z.enum(['signup', 'settings', 'modal', 'api']),
});

export const POST = guardedRoute(
  async ({ userId, body, req }) => {
    const client = extractClientInfo(req);
    const id = await withdrawConsent({
      userId: userId!,
      workspaceId: body.workspaceId,
      consentType: body.consentType as ConsentType,
      policyVersion: body.policyVersion,
      source: body.source as ConsentSource,
      ip: client.ip,
      userAgent: client.userAgent,
    });
    return NextResponse.json({ ok: true, id });
  },
  {
    requireAuth: true,
    schema: Body,
    rateLimit: { limit: 30, windowMs: 60_000 },
    audit: { action: 'revoke', resource: 'consent' },
  },
);
