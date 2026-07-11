// Real DocuSign provider via the eSignature REST API with JWT (impersonation)
// auth — no interactive login. Activated only when DocuSign env vars are set
// (see index.ts). Embedded signing is used so the signer stays on our domain
// and returns to `returnUrl`; the DocuSign Connect webhook is the source of
// truth for completion (and carries the signer's IP in the certificate).

import { SignJWT, importPKCS8 } from "jose";
import { ESignProvider, CreateEnvelopeInput, CreateEnvelopeResult } from "./provider";

type DocuSignConfig = {
  integrationKey: string;
  userId: string;
  accountId: string;
  privateKey: string;
  authServer: string;
  basePath: string;
};

function normalizePem(raw: string): string {
  // Support single-line \n-escaped keys from .env.
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

export class DocuSignProvider implements ESignProvider {
  readonly name = "docusign" as const;
  private cfg: DocuSignConfig;

  constructor(cfg: DocuSignConfig) {
    this.cfg = cfg;
  }

  private async accessToken(): Promise<string> {
    const key = await importPKCS8(normalizePem(this.cfg.privateKey), "RS256");
    const assertion = await new SignJWT({
      scope: "signature impersonation",
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(this.cfg.integrationKey)
      .setSubject(this.cfg.userId)
      .setAudience(this.cfg.authServer)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(key);

    const res = await fetch(`https://${this.cfg.authServer}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    if (!res.ok) {
      throw new Error(`DocuSign token error ${res.status}: ${await res.text()}`);
    }
    const json = (await res.json()) as { access_token: string };
    return json.access_token;
  }

  async createEnvelope(
    input: CreateEnvelopeInput
  ): Promise<CreateEnvelopeResult> {
    const token = await this.accessToken();
    const acct = `${this.cfg.basePath}/v2.1/accounts/${this.cfg.accountId}`;
    const clientUserId = input.agreementId; // ties embedded signer to our record

    const documents = input.documents.map((doc, i) => ({
      documentId: String(i + 1),
      name: doc.name,
      fileExtension: "html",
      documentBase64: Buffer.from(doc.html, "utf8").toString("base64"),
    }));

    // Anchor tabs (/sig1/, /date1/, /sig2/, /date2/, ...) resolve across all
    // documents that contain the anchor string.
    const signHereTabs = input.documents.map((_, i) => ({
      anchorString: `/sig${i + 1}/`,
      anchorUnits: "pixels",
      anchorXOffset: "0",
      anchorYOffset: "0",
    }));
    const dateSignedTabs = input.documents.map((_, i) => ({
      anchorString: `/date${i + 1}/`,
      anchorUnits: "pixels",
    }));

    const envRes = await fetch(`${acct}/envelopes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailSubject: "Your NM Tax Appeals engagement — please sign",
        status: "sent",
        documents,
        recipients: {
          signers: [
            {
              email: input.signerEmail,
              name: input.signerName,
              recipientId: "1",
              clientUserId,
              tabs: { signHereTabs, dateSignedTabs },
            },
          ],
        },
      }),
    });
    if (!envRes.ok) {
      throw new Error(
        `DocuSign envelope error ${envRes.status}: ${await envRes.text()}`
      );
    }
    const env = (await envRes.json()) as { envelopeId: string; status: string };

    // Embedded signing URL.
    const viewRes = await fetch(
      `${acct}/envelopes/${env.envelopeId}/views/recipient`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnUrl: input.returnUrl,
          authenticationMethod: "none",
          email: input.signerEmail,
          userName: input.signerName,
          clientUserId,
        }),
      }
    );
    if (!viewRes.ok) {
      throw new Error(
        `DocuSign recipient view error ${viewRes.status}: ${await viewRes.text()}`
      );
    }
    const view = (await viewRes.json()) as { url: string };

    return {
      provider: "docusign",
      envelopeId: env.envelopeId,
      signingUrl: view.url,
      status: env.status,
    };
  }
}

export function docuSignConfigFromEnv(): DocuSignConfig | null {
  const {
    DOCUSIGN_INTEGRATION_KEY,
    DOCUSIGN_USER_ID,
    DOCUSIGN_ACCOUNT_ID,
    DOCUSIGN_PRIVATE_KEY,
    DOCUSIGN_AUTH_SERVER,
    DOCUSIGN_BASE_PATH,
  } = process.env;
  if (
    !DOCUSIGN_INTEGRATION_KEY ||
    !DOCUSIGN_USER_ID ||
    !DOCUSIGN_ACCOUNT_ID ||
    !DOCUSIGN_PRIVATE_KEY
  ) {
    return null;
  }
  return {
    integrationKey: DOCUSIGN_INTEGRATION_KEY,
    userId: DOCUSIGN_USER_ID,
    accountId: DOCUSIGN_ACCOUNT_ID,
    privateKey: DOCUSIGN_PRIVATE_KEY,
    authServer: DOCUSIGN_AUTH_SERVER || "account-d.docusign.com",
    basePath: DOCUSIGN_BASE_PATH || "https://demo.docusign.net/restapi",
  };
}
