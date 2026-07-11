// Mock e-sign provider. Lets the entire engagement flow run locally without
// DocuSign credentials: it "creates an envelope" and routes the signer to a
// local page that renders the agreement and captures a signature + IP, mirroring
// an embedded DocuSign signing ceremony.

import { ESignProvider, CreateEnvelopeInput, CreateEnvelopeResult } from "./provider";

export class MockESignProvider implements ESignProvider {
  readonly name = "mock" as const;

  async createEnvelope(
    input: CreateEnvelopeInput
  ): Promise<CreateEnvelopeResult> {
    const envelopeId = `mock-${Math.random().toString(36).slice(2, 10)}-${Date.now()
      .toString(36)}`;
    // Local signing page simulates the DocuSign ceremony for this agreement.
    const signingUrl = `/agreement/${input.agreementId}/sign?env=${envelopeId}`;
    return {
      provider: "mock",
      envelopeId,
      signingUrl,
      status: "sent",
    };
  }
}
