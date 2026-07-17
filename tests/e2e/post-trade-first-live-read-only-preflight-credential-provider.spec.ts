import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
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
  mapAuthorizationCompatibilityToCredentialProviderBoundary,
  mapExecutionBoundaryCompatibilityToCredentialProviderBoundary,
  validateCleanupPlan,
  validateCredentialProviderEvidence,
  validateEnvironmentInjectionPlan,
  validateOpaqueCredentialProviderInterface,
  validateOpaqueCredentialHandle,
  validateOpaqueSecretSlot,
  validateProviderContract,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID,
} from "../../lib/post-trade-first-live-read-only-preflight-credential-provider-core";
import {
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
} from "../../lib/post-trade-first-live-read-only-preflight-execution-boundary-contract";
import {
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "../../lib/post-trade-staging-migration-deployment-gate-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-first-live-read-only-preflight-credential-provider-core.ts";
const boundaryPath = "lib/post-trade-first-live-read-only-preflight-credential-provider.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function handleWithFingerprint(input: ReturnType<typeof buildOpaqueCredentialHandle>) {
  const core = { ...input };
  delete (core as Partial<typeof input>).handleFingerprint;
  delete (core as Partial<typeof input>).handleFingerprintAlgorithm;
  return { ...input, handleFingerprintAlgorithm: "sha256" as const, handleFingerprint: buildOpaqueCredentialHandleFingerprint(core) };
}

function slotWithFingerprint(input: ReturnType<typeof buildOpaqueSecretSlot>) {
  const core = { ...input };
  delete (core as Partial<typeof input>).slotFingerprint;
  delete (core as Partial<typeof input>).slotFingerprintAlgorithm;
  return { ...input, slotFingerprintAlgorithm: "sha256" as const, slotFingerprint: buildOpaqueSecretSlotFingerprint(core) };
}

function envPlanWithFingerprint(input: ReturnType<typeof buildEnvironmentInjectionPlan>) {
  const core = { ...input };
  delete (core as Partial<typeof input>).planFingerprint;
  delete (core as Partial<typeof input>).planFingerprintAlgorithm;
  return { ...input, planFingerprintAlgorithm: "sha256" as const, planFingerprint: buildEnvironmentInjectionPlanFingerprint(core) };
}

function cleanupWithFingerprint(input: ReturnType<typeof buildCleanupPlan>) {
  const core = { ...input };
  delete (core as Partial<typeof input>).cleanupFingerprint;
  delete (core as Partial<typeof input>).cleanupFingerprintAlgorithm;
  return { ...input, cleanupFingerprintAlgorithm: "sha256" as const, cleanupFingerprint: buildCleanupPlanFingerprint(core) };
}

function evidenceWithFingerprint(input: ReturnType<typeof buildCredentialProviderEvidence>) {
  const core = { ...input };
  delete (core as Partial<typeof input>).evidenceFingerprint;
  delete (core as Partial<typeof input>).evidenceFingerprintAlgorithm;
  return { ...input, evidenceFingerprintAlgorithm: "sha256" as const, evidenceFingerprint: buildCredentialProviderEvidenceFingerprint(core) };
}

test.describe("post-trade first-live read-only preflight opaque credential-provider boundary", () => {
  test("default boundary is inert and structural readiness does not access credentials or enable execution", () => {
    const result = buildDefaultProviderBoundaryResult();
    const ready = buildCredentialProviderBoundaryDecision();

    expect(result.providerStatus).toBe("not_resolved");
    expect(result.credentialHandleCreated).toBe(false);
    expect(result.credentialAccessed).toBe(false);
    expect(result.secretInjected).toBe(false);
    expect(result.authenticationAttempted).toBe(false);
    expect(result.runnerExecutionEnabled).toBe(false);
    expect(result.deploymentEnabled).toBe(false);
    expect(result.remoteMutation).toBe(false);
    expect(result.sqlExecuted).toBe(false);
    expect(result.migrationsApplied).toBe(0);
    expect(result.rowsCreated).toBe(0);
    expect(ready.decision).toBe("structurally_ready_no_credential_access");
    expect(ready.credentialAccessed).toBe(false);
    expect(ready.runnerExecutionEnabled).toBe(false);
  });

  test("provider registry accepts only the exact preferred provider and rejects broad provider classes", () => {
    const registry = buildCredentialProviderRegistry();
    expect(validateProviderContract(registry).valid).toBe(true);
    expect(registry.preferredProviderIdentity).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER);
    expect(registry.rejectedProviderIdentities).toEqual(expect.arrayContaining([
      "caller",
      "manual",
      "pasted_token",
      "raw_environment",
      "source_control",
      "browser_login",
      "device_code",
      "interactive_login",
      "command_argument",
      "production_credential",
      "generic",
      "unknown",
    ]));
    expect(registry.requiresNonInteractive).toBe(true);
    expect(registry.requiresStagingOnly).toBe(true);
    expect(registry.prohibitsCommandLineCredentialArgument).toBe(true);
  });

  test("provider registry and interface reject aliases, self-assertions, and secret-shaped metadata", () => {
    const registry = buildCredentialProviderRegistry();
    const canonicalProvider = {
      providerIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
      createOrValidateOpaqueHandle: () => ({ opaque: true }),
      prepareOpaqueSecretSlotLease: () => ({ opaque: true }),
      confirmLeaseCleanup: () => ({ opaque: true }),
      classifyProviderAvailability: () => ({ opaque: true }),
    };

    expect(validateOpaqueCredentialProviderInterface(canonicalProvider).valid).toBe(true);

    const rejectedProviderIdentities = [
      "reviewed_ephemeral_staging_supabase_cli_credential_provider_v1_extra",
      "prefix_reviewed_ephemeral_staging_supabase_cli_credential_provider_v1",
      POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER.toUpperCase(),
      "caller",
      "manual",
      "pasted_token",
      "raw_environment",
      "dotenv",
      "source_control",
      "browser_login",
      "device_code",
      "interactive_login",
      "command_argument",
      "url_embedded_credential",
      "shared_global_credential",
      "production_credential",
      "generic",
      "unknown",
    ];

    for (const providerIdentity of rejectedProviderIdentities) {
      expect(validateProviderContract({ ...registry, preferredProviderIdentity: providerIdentity }).valid, `contract:${providerIdentity}`).toBe(false);
      expect(validateOpaqueCredentialProviderInterface({ ...canonicalProvider, providerIdentity }).valid, `interface:${providerIdentity}`).toBe(false);
    }

    const rejectedInterfaces = [
      { ...canonicalProvider, ready: true },
      { ...canonicalProvider, verified: true },
      { ...canonicalProvider, authenticated: true },
      { ...canonicalProvider, credentialValid: true },
      { ...canonicalProvider, cleanupConfirmed: true },
      { ...canonicalProvider, runnerExecutionEnabled: true },
      { ...canonicalProvider, arbitraryMetadata: { authority: "self_asserted" } },
      { ...canonicalProvider, token: "access token value" },
      { ...canonicalProvider, serviceRoleKey: "x" },
      { ...canonicalProvider, rawEnvironment: { X: "Y" } },
      { ...canonicalProvider, credentialFile: "/Users/example/credential.json" },
      { ...canonicalProvider, createOrValidateOpaqueHandle: true },
      { ...canonicalProvider, nested: new Map() },
      (() => {
        const cyclic: Record<string, unknown> = { ...canonicalProvider };
        cyclic.self = cyclic;
        return cyclic;
      })(),
    ];

    for (const item of rejectedInterfaces) {
      expect(validateOpaqueCredentialProviderInterface(item).valid).toBe(false);
    }
  });

  test("canonical handle, slot, environment plan, cleanup plan, and evidence contain no credential values", () => {
    const handle = buildOpaqueCredentialHandle();
    const slot = buildOpaqueSecretSlot();
    const plan = buildEnvironmentInjectionPlan();
    const cleanup = buildCleanupPlan();
    const evidence = buildCredentialProviderEvidence();
    const serialized = JSON.stringify({ handle, slot, plan, cleanup, evidence });

    expect(validateOpaqueCredentialHandle(handle).valid).toBe(true);
    expect(validateOpaqueSecretSlot(slot).valid).toBe(true);
    expect(validateEnvironmentInjectionPlan(plan).valid).toBe(true);
    expect(validateCleanupPlan(cleanup).valid).toBe(true);
    expect(validateCredentialProviderEvidence(evidence).valid).toBe(true);
    expect(serialized).not.toMatch(/access[_-]?token|refresh[_-]?token|service[_-]?role|anon[_-]?key|api[_-]?key|password|postgres(?:ql)?:\/\/|authorization:\s*bearer|bearer\s+[a-z0-9._-]+|cookie|session token|private key|client secret|keychain|\/Users\/|\/home\/|eyJ/i);
    expect(evidence.authenticationSuccessClaimed).toBe(false);
    expect(evidence.remoteReachabilityClaimed).toBe(false);
  });

  test("credential-required operation subset is exact and not broad", () => {
    expect(buildCredentialRequiredOperationSubset()).toEqual([
      "preflight_supabase_linked_project",
      "preflight_supabase_migration_history",
    ]);
    expect(buildCredentialRequiredOperationSubset().some((operation) => operation.includes("git"))).toBe(false);
    expect(buildCredentialRequiredOperationSubset().some((operation) => operation.includes("*"))).toBe(false);
  });

  test("opaque handle rejects unsafe providers, secret fields, bad targets, broad scope, and live claims", () => {
    const canonical = buildOpaqueCredentialHandle();
    const cases = [
      { name: "generic provider", input: handleWithFingerprint({ ...canonical, providerIdentity: "generic" as never }) },
      { name: "caller provider", input: handleWithFingerprint({ ...canonical, providerIdentity: "caller" as never }) },
      { name: "manual provider", input: handleWithFingerprint({ ...canonical, providerIdentity: "manual" as never }) },
      { name: "pasted provider", input: handleWithFingerprint({ ...canonical, providerIdentity: "pasted_token" as never }) },
      { name: "raw env provider", input: handleWithFingerprint({ ...canonical, providerIdentity: "raw_environment" as never }) },
      { name: "browser provider", input: handleWithFingerprint({ ...canonical, providerIdentity: "browser_login" as never }) },
      { name: "device code provider", input: handleWithFingerprint({ ...canonical, providerIdentity: "device_code" as never }) },
      { name: "command argument provider", input: handleWithFingerprint({ ...canonical, providerIdentity: "command_argument" as never }) },
      { name: "production provider", input: handleWithFingerprint({ ...canonical, providerIdentity: "production_credential" as never }) },
      { name: "raw token", input: { ...canonical, rawToken: "access token value" } },
      { name: "service role", input: { ...canonical, serviceRoleKey: "x" } },
      { name: "api key", input: { ...canonical, apiKey: "x" } },
      { name: "password", input: { ...canonical, password: "x" } },
      { name: "connection", input: { ...canonical, connectionString: "postgres://example" } },
      { name: "auth header", input: { ...canonical, authorizationHeader: "Authorization: Bearer abc" } },
      { name: "cookie", input: { ...canonical, cookieValue: "cookie=value" } },
      { name: "session", input: { ...canonical, sessionToken: "x" } },
      { name: "private key", input: { ...canonical, privateKey: "x" } },
      { name: "client secret", input: { ...canonical, clientSecret: "x" } },
      { name: "credential file", input: { ...canonical, credentialFile: "/tmp/credential" } },
      { name: "keychain path", input: { ...canonical, keychainPath: "login/key" } },
      { name: "raw env", input: { ...canonical, rawEnvironment: { X: "Y" } } },
      { name: "bankid", input: { ...canonical, BankID: "x" } },
      { name: "home path", input: handleWithFingerprint({ ...canonical, credentialHandleId: "/Users/example/credential" as never }) },
      { name: "jwt id", input: handleWithFingerprint({ ...canonical, credentialHandleId: "eyJabc.def.ghi" as never }) },
      { name: "base64 id", input: handleWithFingerprint({ ...canonical, credentialHandleId: "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo1234567890QUJDREVGR0g=" as never }) },
      { name: "secret text id", input: handleWithFingerprint({ ...canonical, credentialHandleId: "credential-file-access-token" as never }) },
      { name: "overlong id", input: handleWithFingerprint({ ...canonical, credentialHandleId: "x".repeat(161) as never }) },
      { name: "expired", input: handleWithFingerprint({ ...canonical, expiresAtIso: "2026-07-14T11:59:00.000Z" as never }) },
      { name: "revoked", input: handleWithFingerprint({ ...canonical, revoked: true as never }) },
      { name: "future issued", input: handleWithFingerprint({ ...canonical, issuedAtIso: "2026-07-14T12:10:00.000Z" as never }) },
      { name: "production", input: handleWithFingerprint({ ...canonical, targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF as never }) },
      { name: "alternate", input: handleWithFingerprint({ ...canonical, targetStagingProjectRef: "aaaaaaaaaaaaaaaaaaaa" as never }) },
      { name: "wildcard scope", input: handleWithFingerprint({ ...canonical, allowedOperationIdentities: ["preflight_supabase_*"] }) },
      { name: "git scope", input: handleWithFingerprint({ ...canonical, allowedOperationIdentities: [...canonical.allowedOperationIdentities, "preflight_git_current_branch"] }) },
      { name: "local scope", input: handleWithFingerprint({ ...canonical, allowedOperationIdentities: [...canonical.allowedOperationIdentities, "preflight_local_migration_inventory"] }) },
      { name: "migration content scope", input: handleWithFingerprint({ ...canonical, allowedOperationIdentities: [...canonical.allowedOperationIdentities, "preflight_migration_content_observation"] }) },
      { name: "catalog scope", input: handleWithFingerprint({ ...canonical, allowedOperationIdentities: [...canonical.allowedOperationIdentities, "preflight_catalog_rls_policy_metadata"] }) },
      { name: "unrelated supabase", input: handleWithFingerprint({ ...canonical, allowedOperationIdentities: [...canonical.allowedOperationIdentities, "preflight_supabase_unrelated"] }) },
      { name: "duplicate operation", input: handleWithFingerprint({ ...canonical, allowedOperationIdentities: [...canonical.allowedOperationIdentities, canonical.allowedOperationIdentities[0]!] }) },
      { name: "missing operation", input: handleWithFingerprint({ ...canonical, allowedOperationIdentities: canonical.allowedOperationIdentities.slice(1) }) },
      { name: "multiple sessions", input: handleWithFingerprint({ ...canonical, oneBoundarySession: false as never }) },
      { name: "multiple runner", input: handleWithFingerprint({ ...canonical, oneRunnerInvocation: false as never }) },
      { name: "exportable", input: handleWithFingerprint({ ...canonical, nonExportable: false as never }) },
      { name: "loggable", input: handleWithFingerprint({ ...canonical, nonLoggable: false as never }) },
      { name: "interactive", input: handleWithFingerprint({ ...canonical, interactiveAuthAllowed: true as never }) },
      { name: "browser", input: handleWithFingerprint({ ...canonical, browserAuthAllowed: true as never }) },
      { name: "argument injection", input: handleWithFingerprint({ ...canonical, commandArgumentInjectionAllowed: true as never }) },
      { name: "reuse", input: handleWithFingerprint({ ...canonical, reuseAllowed: true as never }) },
      { name: "live auth claim", input: handleWithFingerprint({ ...canonical, authenticationSuccessClaimed: true as never }) },
      { name: "reachability claim", input: handleWithFingerprint({ ...canonical, remoteReachabilityClaimed: true as never }) },
    ];
    for (const item of cases) {
      expect(validateOpaqueCredentialHandle(item.input).valid, item.name).toBe(false);
    }
  });

  test("secret slot and environment plan reject unsafe injection scope", () => {
    const slot = buildOpaqueSecretSlot();
    const plan = buildEnvironmentInjectionPlan();
    const cases = [
      { name: "slot serialization", valid: validateOpaqueSecretSlot(slotWithFingerprint({ ...slot, serializationProhibited: false as never })).valid },
      { name: "slot fingerprinting", valid: validateOpaqueSecretSlot(slotWithFingerprint({ ...slot, fingerprintingProhibited: false as never })).valid },
      { name: "slot git use", valid: validateOpaqueSecretSlot(slotWithFingerprint({ ...slot, gitOperationUseProhibited: false as never })).valid },
      { name: "slot cleanup", valid: validateOpaqueSecretSlot(slotWithFingerprint({ ...slot, cleanupRequired: false as never })).valid },
      { name: "slot env name", valid: validateOpaqueSecretSlot({ ...slot, environmentVariableName: "SUPABASE_STAGING_SERVICE_ROLE_KEY" }).valid },
      { name: "slot secret name", valid: validateOpaqueSecretSlot({ ...slot, secretName: "staging-service-role" }).valid },
      { name: "slot keychain", valid: validateOpaqueSecretSlot({ ...slot, keychainPath: "login/key" }).valid },
      { name: "slot credential path", valid: validateOpaqueSecretSlot({ ...slot, credentialFile: "/Users/example/credential.json" }).valid },
      { name: "slot descriptor", valid: validateOpaqueSecretSlot({ ...slot, fileDescriptor: 9 }).valid },
      { name: "env not empty", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, startsFromEmptyEnvironment: false as never })).valid },
      { name: "env inherited", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, inheritedFullEnvironment: true as never })).valid },
      { name: "env arbitrary key", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, arbitraryEnvironmentKey: true as never })).valid },
      { name: "env argument", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, commandLineCredentialArgument: true as never })).valid },
      { name: "env url", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, urlCredential: true as never })).valid },
      { name: "env git", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, gitCredentialInjection: true as never })).valid },
      { name: "env credential", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, containsCredentialValue: true as never })).valid },
      { name: "env raw value", valid: validateEnvironmentInjectionPlan({ ...plan, rawEnvironmentValue: "Authorization: Bearer abc" }).valid },
      { name: "env secret name", valid: validateEnvironmentInjectionPlan({ ...plan, realEnvironmentName: "SUPABASE_STAGING_SERVICE_ROLE_KEY" }).valid },
      { name: "env two operations", valid: validateEnvironmentInjectionPlan({ ...plan, operationIdentities: plan.operationIdentity ? [plan.operationIdentity, "preflight_supabase_migration_history"] : [] }).valid },
      { name: "env operation", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, operationIdentity: "preflight_git_current_branch" })).valid },
      { name: "env timeout cleanup", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, cleanupAfterTimeoutRequired: false as never })).valid },
      { name: "env prompt cleanup", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, cleanupAfterPromptDetectionRequired: false as never })).valid },
      { name: "env secret cleanup", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, cleanupAfterSecretDetectionRequired: false as never })).valid },
      { name: "env reuse ambiguous", valid: validateEnvironmentInjectionPlan(envPlanWithFingerprint({ ...plan, reuseAfterAmbiguousResultAllowed: true as never })).valid },
    ];
    for (const item of cases) {
      expect(item.valid, item.name).toBe(false);
    }
    expect(JSON.stringify(plan)).not.toContain(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_SECRET_SLOT_ID.replace("opaque_secret_slot", "real_env_name"));
  });

  test("cleanup confirmed is valid and cleanup failure or ambiguity blocks", () => {
    expect(validateCleanupPlan(buildCleanupPlan("cleanup_confirmed")).valid).toBe(true);
    for (const classification of ["cleanup_failed", "cleanup_ambiguous", "cleanup_not_attempted", "cleanup_not_required"] as const) {
      const cleanup = buildCleanupPlan(classification);
      expect(validateCleanupPlan(cleanup).valid, classification).toBe(false);
      expect(cleanup.invalidatesBoundarySession).toBe(true);
      expect(cleanup.blocksFurtherCredentialUse).toBe(true);
      expect(cleanup.blocksRunnerReadiness).toBe(true);
      expect(cleanup.prohibitsRetry).toBe(true);
      expect(cleanup.requiresManualReview).toBe(true);
      expect(cleanup.preventsAuthorizationReuse).toBe(true);
    }

    const cleanup = buildCleanupPlan("cleanup_confirmed");
    const cleanupCases = [
      { name: "wrong lease", input: cleanupWithFingerprint({ ...cleanup, leaseId: "other" as never }) },
      { name: "wrong handle", input: cleanupWithFingerprint({ ...cleanup, credentialHandleId: "other" as never }) },
      { name: "wrong operation", input: cleanupWithFingerprint({ ...cleanup, operationIdentity: "preflight_supabase_migration_history" }) },
      { name: "wrong confirmation", input: cleanupWithFingerprint({ ...cleanup, providerConfirmationIdentity: "other" as never }) },
      { name: "stale cleanup", input: cleanupWithFingerprint({ ...cleanup, cleanupTimestampIso: "2026-07-14T11:59:59.000Z" as never }) },
      { name: "future cleanup", input: cleanupWithFingerprint({ ...cleanup, cleanupTimestampIso: "2026-07-14T12:10:00.000Z" as never }) },
      { name: "slot not cleared", input: cleanupWithFingerprint({ ...cleanup, secretSlotCleared: false }) },
      { name: "env not cleared", input: cleanupWithFingerprint({ ...cleanup, environmentReferenceCleared: false }) },
      { name: "exported copy", input: cleanupWithFingerprint({ ...cleanup, noExportedCopy: false as never }) },
      { name: "logged copy", input: cleanupWithFingerprint({ ...cleanup, noLoggedCopy: false as never }) },
      { name: "serialized copy", input: cleanupWithFingerprint({ ...cleanup, noSerializedCopy: false as never }) },
      { name: "reusable", input: cleanupWithFingerprint({ ...cleanup, reusableLease: true as never }) },
    ];
    for (const item of cleanupCases) {
      expect(validateCleanupPlan(item.input).valid, item.name).toBe(false);
    }
  });

  test("authorization and execution-boundary compatibility remain pure and fail closed on mismatches", () => {
    const evidence = buildCredentialProviderEvidence();
    expect(mapAuthorizationCompatibilityToCredentialProviderBoundary(evidence).valid).toBe(true);
    expect(mapExecutionBoundaryCompatibilityToCredentialProviderBoundary(evidence).valid).toBe(true);
    const cases = [
      { name: "auth id", input: evidenceWithFingerprint({ ...evidence, authorizationArtifactId: "other" as never }) },
      { name: "fingerprint", input: evidenceWithFingerprint({ ...evidence, authorizationArtifactFingerprint: "0".repeat(64) }) },
      { name: "run id", input: evidenceWithFingerprint({ ...evidence, preflightRunId: "other" as never }) },
      { name: "operation id", input: evidenceWithFingerprint({ ...evidence, preflightOperationId: "other" as never }) },
      { name: "boundary session", input: evidenceWithFingerprint({ ...evidence, boundarySessionId: "other" as never }) },
      { name: "staging", input: evidenceWithFingerprint({ ...evidence, targetStagingProjectRef: "aaaaaaaaaaaaaaaaaaaa" as never }) },
      { name: "subset", input: evidenceWithFingerprint({ ...evidence, allowedOperationIdentities: [evidence.allowedOperationIdentities[0]!] }) },
      { name: "access claim", input: evidenceWithFingerprint({ ...evidence, credentialAccessed: true as never }) },
      { name: "generic ready", input: { ...evidence, ready: true } },
      { name: "generic verified", input: { ...evidence, verified: true } },
      { name: "generic authenticated", input: { ...evidence, authenticated: true } },
      { name: "credential valid", input: { ...evidence, credentialValid: true } },
      { name: "secret field", input: { ...evidence, bearerToken: "Bearer abc" } },
      { name: "cleanup policy mismatch", input: evidenceWithFingerprint({ ...evidence, cleanupRequired: false as never }) },
    ];
    for (const item of cases) {
      expect(validateCredentialProviderEvidence(item.input).valid, item.name).toBe(false);
      expect(buildCredentialProviderBoundaryDecision(item.input).decision, item.name).toBe("blocked");
    }
  });

  test("fingerprints are deterministic and reject partial, prefix, malformed, unsupported, cyclic, and production data", () => {
    const handle = buildOpaqueCredentialHandle();
    const slot = buildOpaqueSecretSlot();
    const plan = buildEnvironmentInjectionPlan();
    const cleanup = buildCleanupPlan();
    const evidence = buildCredentialProviderEvidence();
    const cyclic: Record<string, unknown> = { ...evidence };
    cyclic.self = cyclic;

    expect(buildOpaqueCredentialHandleFingerprint({ ...handle, allowedOperationIdentities: handle.allowedOperationIdentities.slice(1) })).not.toBe(handle.handleFingerprint);
    expect(buildOpaqueSecretSlotFingerprint({ ...slot, providerIdentity: "other" })).not.toBe(slot.slotFingerprint);
    expect(buildEnvironmentInjectionPlanFingerprint({ ...plan, cleanupAfterTimeoutRequired: false })).not.toBe(plan.planFingerprint);
    expect(buildCleanupPlanFingerprint({ ...cleanup, cleanupConfirmed: false })).not.toBe(cleanup.cleanupFingerprint);
    expect(buildCredentialProviderEvidenceFingerprint({ ...evidence, allowedOperationIdentities: evidence.allowedOperationIdentities.slice(1) })).not.toBe(evidence.evidenceFingerprint);
    expect(validateCredentialProviderEvidence({ ...evidence, evidenceFingerprint: evidence.evidenceFingerprint.slice(0, 16) }).valid).toBe(false);
    expect(validateCredentialProviderEvidence({ ...evidence, evidenceFingerprint: `${evidence.evidenceFingerprint.slice(0, 63)}x` }).valid).toBe(false);
    expect(validateCredentialProviderEvidence({ ...evidence, evidenceFingerprint: "not-a-fingerprint" }).valid).toBe(false);
    expect(validateCredentialProviderEvidence({ ...evidence, nested: new Map() }).valid).toBe(false);
    expect(validateCredentialProviderEvidence(cyclic).valid).toBe(false);
    expect(validateCredentialProviderEvidence({ ...evidence, nested: { project: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF } }).valid).toBe(false);
    expect(validateCredentialProviderEvidence({ ...evidence, targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF }).valid).toBe(true);
  });

  test("fixture provider shape is never invoked by default and cannot return secret-shaped metadata", () => {
    let calls = 0;
    const fakeProvider = {
      providerIdentity: POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
      createOrValidateOpaqueHandle: () => {
        calls += 1;
        return { token: "never" };
      },
    };
    expect(calls).toBe(0);
    expect(fakeProvider.providerIdentity).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER);
    expect(validateOpaqueCredentialHandle({ ...buildOpaqueCredentialHandle(), token: "never" }).valid).toBe(false);
    expect(calls).toBe(0);
  });

  test("inert plan contains no credential, environment value, command, SQL, deployment, retry, or provider invocation", () => {
    const plan = buildInertCredentialProviderBoundaryPlan();
    const serialized = JSON.stringify(plan);
    expect(plan.containsCredential).toBe(false);
    expect(plan.containsEnvironmentValue).toBe(false);
    expect(plan.containsCommand).toBe(false);
    expect(plan.containsSql).toBe(false);
    expect(plan.containsDeployment).toBe(false);
    expect(plan.containsAutomaticReattempt).toBe(false);
    expect(plan.invokesProvider).toBe(false);
    expect(plan.accessesCredential).toBe(false);
    expect(plan.runnerExecutionEnabled).toBe(false);
    expect(serialized).not.toMatch(/access[_-]?token|service[_-]?role|password|postgres:\/\/|supabase\s+(db|migration)|git\s+(status|diff)|select\s+\*|insert\s+into|deploy\s+--|retry/i);
  });

  test("source files do not read env/files/keychain, call providers, spawn commands, persist, consume, or wire API/UI/runtime", () => {
    const core = readSource(corePath);
    const boundary = readSource(boundaryPath);
    const api = readSource(apiPath);
    const tradeUi = readSource(tradeUiPath);

    expect(boundary).toContain('import "server-only"');
    expect(boundary).toContain("providerInvoked: false");
    expect(boundary).toContain("credentialAccessed: false");
    expect(core).not.toMatch(/process\.env|readFile|fs\.|keychain|createClient\(|node:child_process|spawn\(|exec\(|execFile\(|supabase\s+(db|migration)|git\s+(status|diff|rev-parse)|select\s+\*|insert\s+into|deployMigration\(|consumeAuthorization\(|consumeReadiness\(|localStorage|sessionStorage|runAvanza|launchBrowser|browser\.newPage/i);
    expect(boundary).not.toMatch(/process\.env|readFile|fs\.|keychain|createClient\(|node:child_process|spawn\(|exec\(|execFile\(|\.createOrValidateOpaqueHandle\(|\.prepareOpaqueSecretSlotLease\(|\.confirmLeaseCleanup\(|\.classifyProviderAvailability\(/i);
    expect(api).not.toContain("post-trade-first-live-read-only-preflight-credential-provider");
    expect(tradeUi).not.toContain("post-trade-first-live-read-only-preflight-credential-provider");
  });
});
