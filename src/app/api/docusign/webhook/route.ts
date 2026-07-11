import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { completeEngagement } from "@/lib/engagement";

/**
 * DocuSign Connect webhook — source of truth for real signings.
 *
 * Configure a Connect subscription (Envelope > Recipient Signing Complete /
 * Envelope Completed) pointing at {APP_BASE_URL}/api/docusign/webhook with an
 * HMAC key matching DOCUSIGN_CONNECT_HMAC_KEY. The signer's IP is available in
 * the envelope's certificate of completion.
 */
function verifyHmac(rawBody: string, signatureHeader: string | null): boolean {
  const key = process.env.DOCUSIGN_CONNECT_HMAC_KEY;
  if (!key) return true; // not configured -> skip (dev)
  if (!signatureHeader) return false;
  const computed = createHmac("sha256", key)
    .update(rawBody, "utf8")
    .digest("base64");
  try {
    return timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(signatureHeader)
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-docusign-signature-1");
  if (!verifyHmac(raw, sig)) {
    return NextResponse.json({ error: "bad_signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // DocuSign JSON Connect: { event, data: { envelopeId, envelopeSummary } }
  const event: string | undefined = payload?.event;
  const envelopeId: string | undefined =
    payload?.data?.envelopeId ?? payload?.envelopeId;
  const status: string | undefined =
    payload?.data?.envelopeSummary?.status ?? payload?.status;

  const isComplete =
    event === "envelope-completed" || status === "completed";

  // Our clientUserId == agreementId (set when creating the envelope), surfaced
  // on the signer recipient.
  const agreementId: string | undefined =
    payload?.data?.envelopeSummary?.recipients?.signers?.[0]?.clientUserId;

  // Signer IP from the certificate/recipient event, if present.
  const signerIp: string | undefined =
    payload?.data?.envelopeSummary?.recipients?.signers?.[0]?.ipAddress;

  if (isComplete && agreementId) {
    await completeEngagement({
      agreementId,
      envelopeId,
      signerIp,
      source: "docusign_webhook",
    });
  }

  return NextResponse.json({ ok: true });
}
