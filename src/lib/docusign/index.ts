// Picks the e-sign provider: real DocuSign when credentials are configured,
// otherwise the local mock (so dev works out of the box).

import { ESignProvider } from "./provider";
import { MockESignProvider } from "./mock";
import { DocuSignProvider, docuSignConfigFromEnv } from "./docusign";

export * from "./provider";

export function getESignProvider(): ESignProvider {
  const cfg = docuSignConfigFromEnv();
  return cfg ? new DocuSignProvider(cfg) : new MockESignProvider();
}

export function eSignProviderName(): "mock" | "docusign" {
  return docuSignConfigFromEnv() ? "docusign" : "mock";
}
