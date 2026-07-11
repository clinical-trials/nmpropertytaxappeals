import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/ip";
import { eSignProviderName } from "@/lib/docusign";
import { completeEngagement } from "@/lib/engagement";

const schema = z.object({ agreementId: z.string().min(1) });

/**
 * Mock signing completion. Only valid when the app runs in mock e-sign mode;
 * with real DocuSign, completion is confirmed by the Connect webhook instead.
 */
export async function POST(req: NextRequest) {
  if (eSignProviderName() !== "mock") {
    return NextResponse.json({ error: "not_in_mock_mode" }, { status: 400 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const ip = getClientIp(req);
  await completeEngagement({
    agreementId: parsed.data.agreementId,
    signerIp: ip,
    source: "mock",
  });

  return NextResponse.json({ ok: true });
}
