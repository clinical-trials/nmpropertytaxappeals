// E-signature provider abstraction. The rest of the app talks to this
// interface; whether it's DocuSign or the local mock is decided in index.ts by
// environment configuration.

export type EnvelopeDocument = {
  name: string;
  /** Rendered document HTML (snapshot). */
  html: string;
};

export type CreateEnvelopeInput = {
  agreementId: string;
  signerName: string;
  signerEmail: string;
  /** The signing packet — e.g. services agreement + agent authorization. */
  documents: EnvelopeDocument[];
  /** IP we captured when the signer requested the envelope. */
  requestIp?: string | null;
  /** Where the signer returns after signing (embedded flow). */
  returnUrl: string;
};

export type CreateEnvelopeResult = {
  provider: "mock" | "docusign";
  envelopeId: string;
  /** URL to redirect the signer to in order to sign. */
  signingUrl: string;
  status: string;
};

export interface ESignProvider {
  readonly name: "mock" | "docusign";
  createEnvelope(input: CreateEnvelopeInput): Promise<CreateEnvelopeResult>;
}
