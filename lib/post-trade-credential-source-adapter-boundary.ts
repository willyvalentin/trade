import "server-only";

import {
  CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY,
  buildCredentialSourceCompatibilitySummary,
  buildCredentialSourceFixtureAdapter,
  buildCredentialSourceFutureLivePlan,
  validateCredentialSourceAdapterIdentity,
  type CredentialSourceFixtureAdapter,
  type CredentialSourceValidationResult,
} from "@/lib/post-trade-credential-source-adapter-boundary-core";

export const CREDENTIAL_SOURCE_ADAPTER_SERVER_BOUNDARY_ID =
  "post_trade_credential_source_adapter_server_fixture_boundary_v1" as const;

export type CredentialSourceAdapterServerBoundary = Readonly<{
  boundaryId: typeof CREDENTIAL_SOURCE_ADAPTER_SERVER_BOUNDARY_ID;
  serverOnly: true;
  fixtureOnly: true;
  defaultLiveCredentialAdapterPresent: false;
  ambientAuthorityPresent: false;
  exposesCredentialReader: false;
  exposesSecretReader: false;
  exposesTokenReader: false;
  exposesPasswordReader: false;
  exposesKeychainLookup: false;
  exposesEnvironmentLookup: false;
  exposesFileLookup: false;
  canAccessKeychain: false;
  canReadEnvironment: false;
  canReadCredentialFiles: false;
  canInvokeCredentialHelpers: false;
  canIssueLiveLease: false;
  canDeliverCredential: false;
  canConsumeAuthorization: false;
  enablesCredentialAccess: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  compatibility: ReturnType<typeof buildCredentialSourceCompatibilitySummary>;
  futurePlan: ReturnType<typeof buildCredentialSourceFutureLivePlan>;
}>;

export function buildCredentialSourceAdapterServerBoundary(): CredentialSourceAdapterServerBoundary {
  return {
    boundaryId: CREDENTIAL_SOURCE_ADAPTER_SERVER_BOUNDARY_ID,
    serverOnly: true,
    fixtureOnly: true,
    defaultLiveCredentialAdapterPresent: false,
    ambientAuthorityPresent: false,
    exposesCredentialReader: false,
    exposesSecretReader: false,
    exposesTokenReader: false,
    exposesPasswordReader: false,
    exposesKeychainLookup: false,
    exposesEnvironmentLookup: false,
    exposesFileLookup: false,
    canAccessKeychain: false,
    canReadEnvironment: false,
    canReadCredentialFiles: false,
    canInvokeCredentialHelpers: false,
    canIssueLiveLease: false,
    canDeliverCredential: false,
    canConsumeAuthorization: false,
    enablesCredentialAccess: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    compatibility: buildCredentialSourceCompatibilitySummary(),
    futurePlan: buildCredentialSourceFutureLivePlan(),
  } as const;
}

export function createCredentialSourceFixtureBoundary(): Readonly<{
  boundary: CredentialSourceAdapterServerBoundary;
  adapter: CredentialSourceFixtureAdapter;
  identityValidation: CredentialSourceValidationResult<typeof CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY>;
  liveCredentialAccessEnabled: false;
}> {
  const adapter = buildCredentialSourceFixtureAdapter();
  return {
    boundary: buildCredentialSourceAdapterServerBoundary(),
    adapter,
    identityValidation: validateCredentialSourceAdapterIdentity(adapter.identity),
    liveCredentialAccessEnabled: false,
  } as const;
}
