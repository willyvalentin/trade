import "server-only";

export {
  buildCleanupPlan,
  buildCleanupPlanFingerprint,
  buildCredentialProviderBoundaryDecision,
  buildCredentialProviderEvidence,
  buildCredentialProviderEvidenceFingerprint,
  buildCredentialProviderRegistry,
  buildCredentialRequiredOperationSubset,
  buildDefaultProviderBoundaryResult,
  buildEnvironmentInjectionPlan,
  buildEnvironmentInjectionPlanFingerprint,
  buildInertCredentialProviderBoundaryPlan,
  buildOpaqueCredentialHandle,
  buildOpaqueCredentialHandleFingerprint,
  buildOpaqueSecretSlot,
  buildOpaqueSecretSlotFingerprint,
  buildProviderContractFingerprint,
  mapAuthorizationCompatibilityToCredentialProviderBoundary,
  mapExecutionBoundaryCompatibilityToCredentialProviderBoundary,
  validateCleanupPlan,
  validateCredentialProviderEvidence,
  validateEnvironmentInjectionPlan,
  validateOpaqueCredentialProviderInterface,
  validateOpaqueCredentialHandle,
  validateOpaqueSecretSlot,
  validateProviderContract,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_PROVIDER_CONTRACT_VERSION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_PROVIDER_EVIDENCE_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_CONTRACT_VERSION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID,
  type CleanupClassification,
  type CleanupPlan,
  type CredentialProviderBoundaryClassification,
  type CredentialProviderEvidence,
  type EnvironmentInjectionPlan,
  type OpaqueCredentialHandle,
  type OpaqueCredentialProviderInterface,
  type OpaqueSecretSlot,
  type ProviderBoundaryDecision,
  type ProviderBoundaryResult,
} from "@/lib/post-trade-first-live-read-only-preflight-credential-provider-core";

import {
  buildDefaultProviderBoundaryResult,
  type OpaqueCredentialProviderInterface,
  type ProviderBoundaryResult,
} from "@/lib/post-trade-first-live-read-only-preflight-credential-provider-core";

export type PostTradeFirstLiveReadOnlyPreflightCredentialProviderBoundary = {
  providerInjected: boolean;
  providerIdentity: OpaqueCredentialProviderInterface["providerIdentity"] | "none";
  providerInvoked: false;
  credentialAccessed: false;
  result: ProviderBoundaryResult;
};

export function createPostTradeFirstLiveReadOnlyPreflightCredentialProviderBoundary(
  provider?: OpaqueCredentialProviderInterface,
): PostTradeFirstLiveReadOnlyPreflightCredentialProviderBoundary {
  return {
    providerInjected: Boolean(provider),
    providerIdentity: provider?.providerIdentity ?? "none",
    providerInvoked: false,
    credentialAccessed: false,
    result: buildDefaultProviderBoundaryResult(),
  };
}
