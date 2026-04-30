/**
 * POST /api/chat/feedback — يحفظ تقييم المستخدم لرد المساعد (👍 / 👎).
 * يُستخدم لاحقاً لتحسين النموذج (RLHF / fine-tuning) بنمط ChatGPT.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, adminAuth } from "@/src/lib/firebase-admin";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";

export const runtime = "nodejs";

const FeedbackSchema = z.object({
  messageId: z.string().min(1).max(200),
  conversationId: z.string().max(200).optional().nullable(),
  messageRating: z.enum(["up", "down"]),
  reason: z.string().max(2000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { key: "chat-feedback", limit: 30, windowMs: 60_000 });
  if (!limited.success) return rateLimitResponse();

  let userId: string | null = null;
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      const decoded = await adminAuth.verifyIdToken(token);
      userId = decoded.uid;
    }
  } catch {
    /* anonymous feedback allowed */
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }

  const { messageId, conversationId, messageRating, reason } = parsed.data;

  try {
    await adminDb.collection("messageFeedback").add({
      messageId,
      conversationId: conversationId || null,
      userId,
      messageRating,
      reason: reason || null,
      createdAt: new Date().toISOString(),
      userAgent: req.headers.get("user-agent")?.slice(0, 200) || null,
    });
  } catch (err) {
    return NextResponse.json({ error: "storage_failed", detail: String(err).slice(0, 200) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
