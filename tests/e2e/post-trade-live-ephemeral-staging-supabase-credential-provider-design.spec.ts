import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildAuthenticationEvidence,
  buildAuthenticationEvidenceFingerprint,
  buildCapabilityHandoffFingerprint,
  buildCapabilityHandoffMetadata,
  buildCleanupPolicy,
  buildCleanupPolicyFingerprint,
  buildCredentialInjectionPolicy,
  buildCredentialResolutionRequest,
  buildCredentialResolutionResult,
  buildCredentialSourceRegistry,
  buildInertLiveProviderImplementationPlan,
  buildInjectionPolicyFingerprint,
  buildLeaseLifecyclePolicy,
  buildLifecyclePolicyFingerprint,
  buildPrivateLeasePolicy,
  buildPrivateLeasePolicyFingerprint,
  buildProviderDesignFingerprint,
  buildProviderImplementationDesign,
  buildResolutionRequestFingerprint,
  buildResolutionResultFingerprint,
  buildSourceAvailabilityEvidence,
  buildSourceAvailabilityEvidenceFingerprint,
  buildSourceRegistryFingerprint,
  validateAuthenticationEvidence,
  validateAuthorizationCompatibility,
  validateCapabilityHandoffMetadata,
  validateCleanupPolicy,
  validateCredentialInjectionPolicy,
  validateCredentialResolutionRequest,
  validateCredentialResolutionResult,
  validateCredentialSourceRegistry,
  validateExecutionBoundaryCompatibility,
  validateLeaseLifecycleTransition,
  validateOpaqueBoundaryCompatibility,
  validatePrivateLeasePolicy,
  validateProviderDesignCompatibility,
  validateProviderImplementationDesign,
  validateRunnerPlanCompatibility,
  validateSourceAvailabilityEvidence,
  POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID,
} from "../../lib/post-trade-live-ephemeral-staging-supabase-credential-provider-design";
import {
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
} from "../../lib/post-trade-first-live-read-only-preflight-execution-boundary-contract";
import {
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "../../lib/post-trade-staging-migration-deployment-gate-core";

const repoRoot = process.cwd();
const designPath = "lib/post-trade-live-ephemeral-staging-supabase-credential-provider-design.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function withFingerprint<T extends Record<string, unknown>>(
  input: T,
  fingerprintKey: keyof T,
  algorithmKey: keyof T,
  builder: (input: unknown) => string,
) {
  const core = { ...input };
  delete core[fingerprintKey];
  delete core[algorithmKey];
  return { ...input, [algorithmKey]: "sha256", [fingerprintKey]: builder(core) };
}

test.describe("post-trade live ephemeral staging Supabase credential provider design", () => {
  test("canonical design is exact, no-access, non-interactive, staging-only, one-operation, and no-retry", () => {
    const design = buildProviderImplementationDesign();
    const registry = buildCredentialSourceRegistry();
    const request = buildCredentialResolutionRequest();
    const result = buildCredentialResolutionResult();
    const lease = buildPrivateLeasePolicy();
    const injection = buildCredentialInjectionPolicy();
    const cleanup = buildCleanupPolicy();
    const availability = buildSourceAvailabilityEvidence();
    const auth = buildAuthenticationEvidence();
    const handoff = buildCapabilityHandoffMetadata();
    const serialized = JSON.stringify(design);

    const designValidation = validateProviderImplementationDesign(design);
    const registryValidation = validateCredentialSourceRegistry(registry);
    const requestValidation = validateCredentialResolutionRequest(request);
    const resultValidation = validateCredentialResolutionResult(result);
    const leaseValidation = validatePrivateLeasePolicy(lease);
    const injectionValidation = validateCredentialInjectionPolicy(injection);
    const cleanupValidation = validateCleanupPolicy(cleanup);
    const availabilityValidation = validateSourceAvailabilityEvidence(availability);
    const authValidation = validateAuthenticationEvidence(auth);
    const handoffValidation = validateCapabilityHandoffMetadata(handoff);
    const compatibilityValidation = validateProviderDesignCompatibility(design);

    expect(designValidation.valid, designValidation.blockingReasons.join(",")).toBe(true);
    expect(registryValidation.valid, registryValidation.blockingReasons.join(",")).toBe(true);
    expect(requestValidation.valid, requestValidation.blockingReasons.join(",")).toBe(true);
    expect(resultValidation.valid, resultValidation.blockingReasons.join(",")).toBe(true);
    expect(leaseValidation.valid, leaseValidation.blockingReasons.join(",")).toBe(true);
    expect(injectionValidation.valid, injectionValidation.blockingReasons.join(",")).toBe(true);
    expect(cleanupValidation.valid, cleanupValidation.blockingReasons.join(",")).toBe(true);
    expect(availabilityValidation.valid, availabilityValidation.blockingReasons.join(",")).toBe(true);
    expect(authValidation.valid, authValidation.blockingReasons.join(",")).toBe(true);
    expect(handoffValidation.valid, handoffValidation.blockingReasons.join(",")).toBe(true);
    expect(compatibilityValidation.valid, compatibilityValidation.blockingReasons.join(",")).toBe(true);
    expect(design.providerIdentity).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER);
    expect(design.preferredSourceIdentity).toBe(POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID);
    expect(design.targetStagingProjectRef).toBe(POST_TRADE_STAGING_MIGRATION_PROJECT_REF);
    expect(request.nonInteractive).toBe(true);
    expect(request.singleOperation).toBe(true);
    expect(request.retryAllowed).toBe(false);
    expect(result.authenticationSuccessClaimed).toBe(false);
    expect(lease.cryptographicZeroizationClaimed).toBe(false);
    expect(serialized).not.toMatch(/access[_-]?token|refresh[_-]?token|service[_-]?role|anon[_-]?key|api[_-]?key|password|postgres(?:ql)?:\/\/|authorization:\s*bearer|bearer\s+[a-z0-9._-]+|cookie|session token|private key|client secret|\/Users\/|\/home\/|eyJ/i);
  });

  test("source registry rejects unsafe source models and aliases", () => {
    const registry = buildCredentialSourceRegistry();
    const rejected = [
      "raw_environment",
      "dotenv",
      "process_environment",
      "source_control",
      "pasted_token",
      "command_argument",
      "url_embedded",
      "browser_auth",
      "device_code",
      "interactive_login",
      "keychain_generic",
      "keychain_caller_selected",
      "os_credential_caller_selected",
      "ci_secret_unreviewed",
      "cli_authenticated_context_unproven",
      "credential_helper",
      "gui_auth",
      "url_opener",
      "mfa_prompt",
      "credential_prompt",
      "token_prompt",
      "project_link_prompt",
      "confirmation_prompt",
      "shared_global_auth",
      "globally_shared_credential",
      "production_credential",
      "generic",
      "unknown",
      "reviewed_macos_keychain_ephemeral_staging_supabase_source_v1_extra",
      POST_TRADE_LIVE_EPHEMERAL_STAGING_SUPABASE_PREFERRED_SOURCE_ID.toUpperCase(),
    ];

    for (const source of rejected) {
      expect(validateCredentialSourceRegistry(withFingerprint({ ...registry, preferredSourceIdentity: source }, "registryFingerprint", "registryFingerprintAlgorithm", buildSourceRegistryFingerprint)).valid, source).toBe(false);
    }
    expect(registry.rejectsAlreadyAuthenticatedCliContextByDefault).toBe(true);
    expect(registry.cliContextAcceptedOnlyIfSeparatelyProven).toBe(true);
    expect(validateCredentialSourceRegistry({ ...registry, keychainItemName: "local-user-item" }).valid).toBe(false);
    expect(validateCredentialSourceRegistry({ ...registry, callerSelectedSource: true }).valid).toBe(false);
  });

  test("resolution request rejects broad operations, production scope, time ambiguity, and unsafe auth modes", () => {
    const request = buildCredentialResolutionRequest();
    const cases = [
      { name: "two operations", input: { ...request, allowedOperationIdentities: ["preflight_supabase_linked_project", "preflight_supabase_migration_history"] } },
      { name: "git operation", input: withFingerprint({ ...request, allowedOperationIdentity: "preflight_git_current_branch" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "unreviewed supabase", input: withFingerprint({ ...request, allowedOperationIdentity: "preflight_supabase_unrelated" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "production", input: withFingerprint({ ...request, targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "expired", input: withFingerprint({ ...request, expiresAtIso: "2026-07-15T08:59:59.000Z" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "future", input: withFingerprint({ ...request, requestedAtIso: "2026-07-15T09:10:00.000Z" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "excessive validity", input: withFingerprint({ ...request, expiresAtIso: "2026-07-15T10:00:00.000Z" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "browser", input: withFingerprint({ ...request, browserAuthAllowed: true }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "device", input: withFingerprint({ ...request, deviceCodeAllowed: true }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "argument", input: withFingerprint({ ...request, commandArgumentAllowed: true }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "retry", input: withFingerprint({ ...request, retryAllowed: true }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "wildcard", input: withFingerprint({ ...request, allowedOperationIdentity: "*" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "broad family", input: withFingerprint({ ...request, allowedOperationIdentity: "preflight_supabase_*" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "local operation", input: withFingerprint({ ...request, allowedOperationIdentity: "preflight_local_config" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "catalog operation", input: withFingerprint({ ...request, allowedOperationIdentity: "preflight_catalog_rls_state" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "alternate project", input: withFingerprint({ ...request, targetStagingProjectRef: "aaaaaaaaaaaaaaaaaaaa" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "slot override", input: withFingerprint({ ...request, secretSlotId: "caller_selected_secret_slot" }, "requestFingerprint", "requestFingerprintAlgorithm", buildResolutionRequestFingerprint) },
      { name: "secret metadata", input: { ...request, serviceRoleKey: "x" } },
    ];

    for (const item of cases) {
      expect(validateCredentialResolutionRequest(item.input).valid, item.name).toBe(false);
    }
  });

  test("resolution result, availability evidence, and authentication evidence remain non-secret and non-authoritative", () => {
    const result = buildCredentialResolutionResult();
    const availability = buildSourceAvailabilityEvidence();
    const auth = buildAuthenticationEvidence();
    const resultCases = [
      { name: "auth success", valid: validateCredentialResolutionResult(withFingerprint({ ...result, authenticationSuccessClaimed: true }, "resultFingerprint", "resultFingerprintAlgorithm", buildResolutionResultFingerprint)).valid },
      { name: "source unavailable", valid: validateCredentialResolutionResult(buildCredentialResolutionResult("credential_source_unavailable")).valid },
      { name: "token field", valid: validateCredentialResolutionResult({ ...result, accessToken: "x" }).valid },
      { name: "env name", valid: validateSourceAvailabilityEvidence({ ...availability, environmentVariableName: "SUPABASE_STAGING_SERVICE_ROLE_KEY" }).valid },
      { name: "source details", valid: validateSourceAvailabilityEvidence({ ...availability, sourceItemName: "local-user-item" }).valid },
      { name: "account details", valid: validateSourceAvailabilityEvidence({ ...availability, accountName: "local-user" }).valid },
      { name: "path details", valid: validateSourceAvailabilityEvidence({ ...availability, credentialPath: "/Users/local/secret" }).valid },
      { name: "credential validity", valid: validateSourceAvailabilityEvidence(withFingerprint({ ...availability, credentialValidityClaimed: true }, "availabilityFingerprint", "availabilityFingerprintAlgorithm", buildSourceAvailabilityEvidenceFingerprint)).valid },
      { name: "result token metadata", valid: validateCredentialResolutionResult({ ...result, tokenHash: "not-allowed" }).valid },
      { name: "result keychain item", valid: validateCredentialResolutionResult({ ...result, keychainItemName: "local-user-item" }).valid },
      { name: "result raw output", valid: validateCredentialResolutionResult({ ...result, rawSourceOutput: "opaque output" }).valid },
      { name: "token validity", valid: validateAuthenticationEvidence(withFingerprint({ ...auth, tokenValidityClaimed: true }, "authEvidenceFingerprint", "authEvidenceFingerprintAlgorithm", buildAuthenticationEvidenceFingerprint)).valid },
      { name: "prompt", valid: validateAuthenticationEvidence(buildAuthenticationEvidence("authentication_prompt_detected")).valid },
      { name: "missing auth", valid: validateAuthenticationEvidence(buildAuthenticationEvidence("authentication_missing")).valid },
      { name: "scope mismatch", valid: validateAuthenticationEvidence(buildAuthenticationEvidence("authentication_scope_mismatch")).valid },
      { name: "account ownership", valid: validateAuthenticationEvidence({ ...auth, accountOwnershipConfirmed: true }).valid },
      { name: "production denial", valid: validateAuthenticationEvidence({ ...auth, productionAccessDeniedClaimed: true }).valid },
    ];

    for (const item of resultCases) {
      expect(item.valid, item.name).toBe(false);
    }
  });

  test("private lease, injection, cleanup, and handoff policies block unsafe execution surfaces", () => {
    const lease = buildPrivateLeasePolicy();
    const injection = buildCredentialInjectionPolicy();
    const cleanup = buildCleanupPolicy();
    const handoff = buildCapabilityHandoffMetadata();
    const cases = [
      { name: "zeroization", valid: validatePrivateLeasePolicy(withFingerprint({ ...lease, cryptographicZeroizationClaimed: true }, "policyFingerprint", "policyFingerprintAlgorithm", buildPrivateLeasePolicyFingerprint)).valid },
      { name: "global cache", valid: validatePrivateLeasePolicy(withFingerprint({ ...lease, globalCacheAllowed: true }, "policyFingerprint", "policyFingerprintAlgorithm", buildPrivateLeasePolicyFingerprint)).valid },
      { name: "module global", valid: validatePrivateLeasePolicy(withFingerprint({ ...lease, moduleGlobalStorageAllowed: true }, "policyFingerprint", "policyFingerprintAlgorithm", buildPrivateLeasePolicyFingerprint)).valid },
      { name: "persistence", valid: validatePrivateLeasePolicy(withFingerprint({ ...lease, persistenceAllowed: true }, "policyFingerprint", "policyFingerprintAlgorithm", buildPrivateLeasePolicyFingerprint)).valid },
      { name: "secret detection", valid: validatePrivateLeasePolicy(withFingerprint({ ...lease, invalidAfterSecretDetection: false }, "policyFingerprint", "policyFingerprintAlgorithm", buildPrivateLeasePolicyFingerprint)).valid },
      { name: "auth rejection", valid: validatePrivateLeasePolicy(withFingerprint({ ...lease, invalidAfterAuthenticationRejection: false }, "policyFingerprint", "policyFingerprintAlgorithm", buildPrivateLeasePolicyFingerprint)).valid },
      { name: "second lease", valid: validatePrivateLeasePolicy(withFingerprint({ ...lease, noSecondLeaseFromResolutionResult: false }, "policyFingerprint", "policyFingerprintAlgorithm", buildPrivateLeasePolicyFingerprint)).valid },
      { name: "lease retry", valid: validatePrivateLeasePolicy(withFingerprint({ ...lease, retryAllowed: true }, "policyFingerprint", "policyFingerprintAlgorithm", buildPrivateLeasePolicyFingerprint)).valid },
      { name: "zeroized marker", valid: validatePrivateLeasePolicy({ ...lease, zeroized: true }).valid },
      { name: "all copies marker", valid: validatePrivateLeasePolicy({ ...lease, allCopiesRemoved: true }).valid },
      { name: "injection shell", valid: validateCredentialInjectionPolicy(withFingerprint({ ...injection, shellAllowed: true }, "injectionFingerprint", "injectionFingerprintAlgorithm", buildInjectionPolicyFingerprint)).valid },
      { name: "injection git", valid: validateCredentialInjectionPolicy(withFingerprint({ ...injection, operationIdentity: "preflight_git_current_branch" }, "injectionFingerprint", "injectionFingerprintAlgorithm", buildInjectionPolicyFingerprint)).valid },
      { name: "injection argument", valid: validateCredentialInjectionPolicy(withFingerprint({ ...injection, commandLineArgumentAllowed: true }, "injectionFingerprint", "injectionFingerprintAlgorithm", buildInjectionPolicyFingerprint)).valid },
      { name: "injection url", valid: validateCredentialInjectionPolicy(withFingerprint({ ...injection, urlCredentialAllowed: true }, "injectionFingerprint", "injectionFingerprintAlgorithm", buildInjectionPolicyFingerprint)).valid },
      { name: "injection stdin", valid: validateCredentialInjectionPolicy(withFingerprint({ ...injection, stdinAllowed: true }, "injectionFingerprint", "injectionFingerprintAlgorithm", buildInjectionPolicyFingerprint)).valid },
      { name: "injection config", valid: validateCredentialInjectionPolicy(withFingerprint({ ...injection, configFileAllowed: true }, "injectionFingerprint", "injectionFingerprintAlgorithm", buildInjectionPolicyFingerprint)).valid },
      { name: "injection inherited", valid: validateCredentialInjectionPolicy(withFingerprint({ ...injection, inheritedEnvironmentAllowed: true }, "injectionFingerprint", "injectionFingerprintAlgorithm", buildInjectionPolicyFingerprint)).valid },
      { name: "injection catalog", valid: validateCredentialInjectionPolicy(withFingerprint({ ...injection, catalogAdapterAllowed: true }, "injectionFingerprint", "injectionFingerprintAlgorithm", buildInjectionPolicyFingerprint)).valid },
      { name: "injection production", valid: validateCredentialInjectionPolicy(withFingerprint({ ...injection, productionProjectAllowed: true }, "injectionFingerprint", "injectionFingerprintAlgorithm", buildInjectionPolicyFingerprint)).valid },
      { name: "second operation", valid: validateCredentialInjectionPolicy(withFingerprint({ ...injection, secondOperationAllowed: true }, "injectionFingerprint", "injectionFingerprintAlgorithm", buildInjectionPolicyFingerprint)).valid },
      { name: "cleanup no timeout", valid: validateCleanupPolicy(withFingerprint({ ...cleanup, cleanupAfterTimeout: false }, "cleanupFingerprint", "cleanupFingerprintAlgorithm", buildCleanupPolicyFingerprint)).valid },
      { name: "cleanup assertion", valid: validateCleanupPolicy(withFingerprint({ ...cleanup, callerAssertionAccepted: true }, "cleanupFingerprint", "cleanupFingerprintAlgorithm", buildCleanupPolicyFingerprint)).valid },
      { name: "cleanup zeroization", valid: validateCleanupPolicy(withFingerprint({ ...cleanup, provesMemoryZeroization: true }, "cleanupFingerprint", "cleanupFingerprintAlgorithm", buildCleanupPolicyFingerprint)).valid },
      { name: "handoff callback", valid: validateCapabilityHandoffMetadata(withFingerprint({ ...handoff, genericCallbackAllowed: true }, "handoffFingerprint", "handoffFingerprintAlgorithm", buildCapabilityHandoffFingerprint)).valid },
      { name: "handoff export", valid: validateCapabilityHandoffMetadata(withFingerprint({ ...handoff, secretExportAllowed: true }, "handoffFingerprint", "handoffFingerprintAlgorithm", buildCapabilityHandoffFingerprint)).valid },
    ];

    for (const item of cases) {
      expect(item.valid, item.name).toBe(false);
    }
  });

  test("lease lifecycle is exact and rejects rollback, second use, and cleanup bypass", () => {
    const policy = buildLeaseLifecyclePolicy();
    expect(buildLifecyclePolicyFingerprint(policy)).toBe(buildLifecyclePolicyFingerprint(buildLeaseLifecyclePolicy()));
    for (const [from, to] of policy.allowedTransitions) {
      expect(validateLeaseLifecycleTransition(from, to).valid, `${from}->${to}`).toBe(true);
    }
    const rejected = [
      ["cleanup_confirmed", "resolved"],
      ["cleanup_confirmed", "leased"],
      ["cleanup_failed", "in_use"],
      ["cleanup_ambiguous", "leased"],
      ["leased", "leased"],
      ["in_use", "resolved"],
      ["in_use", "in_use"],
      ["resolved", "cleanup_confirmed"],
      ["resolved", "resolved"],
      ["expired", "resolved"],
      ["revoked", "resolved"],
      ["invalid", "leased"],
      ["cleanup_required", "cleanup_confirmed"],
    ] as const;
    for (const [from, to] of rejected) {
      expect(validateLeaseLifecycleTransition(from, to).valid, `${from}->${to}`).toBe(false);
    }
  });

  test("fingerprints are deterministic and reject partial, malformed, unsupported, cyclic, and production data", () => {
    const registry = buildCredentialSourceRegistry();
    const request = buildCredentialResolutionRequest();
    const result = buildCredentialResolutionResult();
    const lease = buildPrivateLeasePolicy();
    const cleanup = buildCleanupPolicy();
    const auth = buildAuthenticationEvidence();
    const handoff = buildCapabilityHandoffMetadata();
    const design = buildProviderImplementationDesign();
    const cyclic: Record<string, unknown> = { ...design };
    cyclic.self = cyclic;

    expect(buildSourceRegistryFingerprint({ ...registry, preferredSourceIdentity: "other" })).not.toBe(registry.registryFingerprint);
    expect(buildResolutionRequestFingerprint({ ...request, allowedOperationIdentity: "preflight_supabase_migration_history" })).not.toBe(request.requestFingerprint);
    expect(buildResolutionResultFingerprint({ ...result, leaseState: "expired" })).not.toBe(result.resultFingerprint);
    expect(buildPrivateLeasePolicyFingerprint({ ...lease, invalidAfterTimeout: false })).not.toBe(lease.policyFingerprint);
    expect(buildCleanupPolicyFingerprint({ ...cleanup, cleanupAfterPromptDetection: false })).not.toBe(cleanup.cleanupFingerprint);
    expect(buildAuthenticationEvidenceFingerprint({ ...auth, noPromptConfirmed: false })).not.toBe(auth.authEvidenceFingerprint);
    expect(buildCapabilityHandoffFingerprint({ ...handoff, oneUse: false })).not.toBe(handoff.handoffFingerprint);
    expect(buildProviderDesignFingerprint({ ...design, preferredSourceIdentity: "other" })).not.toBe(design.designFingerprint);
    expect(validateProviderImplementationDesign({ ...design, designFingerprint: design.designFingerprint.slice(0, 16) }).valid).toBe(false);
    expect(validateProviderImplementationDesign({ ...design, designFingerprint: `${design.designFingerprint.slice(0, 63)}x` }).valid).toBe(false);
    expect(validateProviderImplementationDesign({ ...design, nested: new Map() }).valid).toBe(false);
    expect(validateProviderImplementationDesign(cyclic).valid).toBe(false);
    expect(validateProviderImplementationDesign({ ...design, nested: { project: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF } }).valid).toBe(false);
  });

  test("compatibility validators preserve opaque boundary, execution boundary, authorization, and runner constraints", () => {
    const design = buildProviderImplementationDesign();
    expect(validateOpaqueBoundaryCompatibility(design).valid).toBe(true);
    expect(validateExecutionBoundaryCompatibility(design).valid).toBe(true);
    expect(validateAuthorizationCompatibility(design).valid).toBe(true);
    expect(validateRunnerPlanCompatibility(design).valid).toBe(true);
    const cases = [
      { name: "provider", input: { ...design, providerIdentity: "generic" } },
      { name: "source", input: { ...design, preferredSourceIdentity: "generic" } },
      { name: "operation", input: { ...design, request: buildCredentialResolutionRequest("preflight_supabase_migration_history") } },
      { name: "cleanup", input: { ...design, cleanupPolicy: withFingerprint({ ...design.cleanupPolicy, policyId: "other" }, "cleanupFingerprint", "cleanupFingerprintAlgorithm", buildCleanupPolicyFingerprint) } },
      { name: "injection", input: { ...design, handoffMetadata: withFingerprint({ ...design.handoffMetadata, environmentPolicyIdentity: "other" }, "handoffFingerprint", "handoffFingerprintAlgorithm", buildCapabilityHandoffFingerprint) } },
      { name: "registry", input: { ...design, sourceRegistry: withFingerprint({ ...design.sourceRegistry, rejectedSourceIdentities: [] }, "registryFingerprint", "registryFingerprintAlgorithm", buildSourceRegistryFingerprint) } },
      { name: "export", input: { ...design, handoffMetadata: withFingerprint({ ...design.handoffMetadata, secretExportAllowed: true }, "handoffFingerprint", "handoffFingerprintAlgorithm", buildCapabilityHandoffFingerprint) } },
      { name: "staging", input: { ...design, targetStagingProjectRef: "aaaaaaaaaaaaaaaaaaaa" } },
    ];
    for (const item of cases) {
      expect(validateProviderDesignCompatibility(item.input as never).valid, item.name).toBe(false);
    }
  });

  test("future implementation plan and source files remain inert and unwired", () => {
    const plan = buildInertLiveProviderImplementationPlan();
    const source = readSource(designPath);
    const api = readSource(apiPath);
    const tradeUi = readSource(tradeUiPath);
    const serialized = JSON.stringify(plan);

    expect(plan.accessesSource).toBe(false);
    expect(plan.accessesCredential).toBe(false);
    expect(plan.invokesProvider).toBe(false);
    expect(plan.authenticates).toBe(false);
    expect(plan.spawnsProcess).toBe(false);
    expect(serialized).not.toMatch(/access[_-]?token|service[_-]?role|password|postgres:\/\/|select\s+\*|insert\s+into|deploy\s+--|retry/i);
    expect(source).not.toMatch(/process\.env|readFile|fs\.|createClient\(|node:child_process|spawn\(|exec\(|execFile\(|supabase\s+(db|migration)|git\s+(status|diff|rev-parse)|select\s+\*|insert\s+into|deployMigration\(|consumeAuthorization\(|consumeReadiness\(|localStorage|sessionStorage|runAvanza|launchBrowser|browser\.newPage/i);
    expect(api).not.toContain("post-trade-live-ephemeral-staging-supabase-credential-provider-design");
    expect(tradeUi).not.toContain("post-trade-live-ephemeral-staging-supabase-credential-provider-design");
  });
});
