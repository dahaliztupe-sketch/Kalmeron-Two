// @ts-nocheck
/**
 * Electronic signature (DocuSign) light client.
 * Required env for live execution:
 *   DOCUSIGN_ACCESS_TOKEN
 *   DOCUSIGN_ACCOUNT_ID
 *   DOCUSIGN_BASE_URI       (e.g. https://demo.docusign.net/restapi or production)
 *
 * Falls back to a safe simulation when not configured.
 */

export type ESignResult<T = unknown> =
  | { ok: true; result?: T; noop?: boolean }
  | { ok: false; error: string };

export function esignConfigured(): boolean {
  return Boolean(
    process.env.DOCUSIGN_ACCESS_TOKEN &&
      process.env.DOCUSIGN_ACCOUNT_ID &&
      process.env.DOCUSIGN_BASE_URI,
  );
}

export interface SendForSignatureInput {
  documentName: string;
  documentBase64: string; // PDF bytes base64-encoded
  recipientEmail: string;
  recipientName: string;
  emailSubject?: string;
}

export async function sendForSignature(input: SendForSignatureInput): Promise<ESignResult> {
  if (!esignConfigured()) {
    return {
      ok: true,
      noop: true,
      result: {
        simulated: true,
        envelopeId: `env_sim_${Date.now()}`,
        status: 'sent',
        recipient: input.recipientEmail,
        message: 'وضع المحاكاة: لم يُربط حساب DocuSign بعد.',
      },
    };
  }
  try {
    const url = `${process.env.DOCUSIGN_BASE_URI}/v2.1/accounts/${process.env.DOCUSIGN_ACCOUNT_ID}/envelopes`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DOCUSIGN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailSubject: input.emailSubject || `للتوقيع: ${input.documentName}`,
        documents: [
          {
            documentBase64: input.documentBase64,
            name: input.documentName,
            fileExtension: 'pdf',
            documentId: '1',
          },
        ],
        recipients: {
          signers: [
            {
              email: input.recipientEmail,
              name: input.recipientName,
              recipientId: '1',
              routingOrder: '1',
              tabs: { signHereTabs: [{ documentId: '1', pageNumber: '1', xPosition: '100', yPosition: '100' }] },
            },
          ],
        },
        status: 'sent',
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j?.message || `docusign_http_${r.status}` };
    return { ok: true, result: j };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'esign_request_failed' };
  }
}

export function esignStatus() {
  return {
    configured: esignConfigured(),
    requiredEnv: ['DOCUSIGN_ACCESS_TOKEN', 'DOCUSIGN_ACCOUNT_ID', 'DOCUSIGN_BASE_URI'],
  };
}
