import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY,
  CREDENTIAL_SOURCE_EVALUATED_AT,
  CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS,
  FUTURE_KEYCHAIN_REFERENCE_POLICY_ID,
  NO_CREDENTIAL_POLICY_ID,
  buildCredentialPurposeDefinition,
  buildCredentialReferenceFixtureRequest,
  buildCredentialSessionCapability,
  buildCredentialSourceAdapterIdentityFingerprint,
  buildCredentialSourceCompatibilitySummary,
  buildCredentialSourceFixtureAdapter,
  buildCredentialSourceFutureLivePlan,
  buildCredentialSourcePolicy,
  buildCredentialSourcePolicyRegistry,
  buildCredentialFixtureAuthorizationLink,
  buildFixtureCredentialReferenceCapability,
  buildFixtureNoCredentialRequirementCapability,
  buildNoCredentialFixtureRequest,
  classifyCredentialSource,
  classifySecretPresence,
  validateCredentialReferenceFixtureRequest,
  validateCredentialSessionCapability,
  validateCredentialSourceAdapterIdentity,
  validateCredentialSourcePolicy,
  validateCredentialFixtureAuthorizationLink,
  validateCurrentOperationCredentialCompatibility,
  validateFixtureCredentialReferenceCapability,
  validateFixtureNoCredentialRequirementCapability,
  validateNoCredentialFixtureRequest,
  type CredentialPurpose,
} from "../../lib/post-trade-credential-source-adapter-boundary-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-credential-source-adapter-boundary-core.ts";
const boundaryPath = "lib/post-trade-credential-source-adapter-boundary.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function expectInvalid(result: { ok: true } | { ok: false; errors: readonly string[] }) {
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.errors.length).toBeGreaterThan(0);
}

function noCredentialFixture(operation: "collect_git_version" | "collect_supabase_cli_version" = "collect_git_version") {
  const session = buildCredentialSessionCapability({ intendedPurpose: "no_credential_required" });
  const proof = buildFixtureNoCredentialRequirementCapability({ boundarySessionId: session.boundarySessionId, operation });
  const request = buildNoCredentialFixtureRequest({ operation, credentialSessionCapability: session, noCredentialRequirementCapability: proof });
  const adapter = buildCredentialSourceFixtureAdapter();
  return { adapter, proof, request, session };
}

function referenceFixture(purpose: Exclude<CredentialPurpose, "no_credential_required"> = "future_supabase_cli_authentication") {
  const session = buildCredentialSessionCapability({ intendedPurpose: purpose });
  const reference = buildFixtureCredentialReferenceCapability({ boundarySessionId: session.boundarySessionId, purpose });
  const request = buildCredentialReferenceFixtureRequest({ purpose, credentialSessionCapability: session, credentialReferenceCapability: reference });
  const adapter = buildCredentialSourceFixtureAdapter();
  return { adapter, reference, request, session };
}

const falseEvidence = {
  fixtureOnly: true,
  authoritativeLive: false,
  secretMaterialPresent: false,
  credentialAccessed: false,
  credentialRead: false,
  credentialDecrypted: false,
  credentialDelivered: false,
  leaseIssuedLive: false,
  leaseActivatedLive: false,
  keychainAccessAttempted: false,
  keychainItemRead: false,
  keychainItemModified: false,
  keychainItemDeleted: false,
  environmentRead: false,
  environmentCredentialInjected: false,
  argvCredentialInjected: false,
  stdinCredentialInjected: false,
  filesystemRead: false,
  credentialFileCreated: false,
  credentialHelperInvoked: false,
  networkBrokerContacted: false,
  authorizationConsumed: false,
  cleanupAttemptedLive: false,
  cleanupCompletedLive: false,
  provesCredentialCleanupLive: false,
  revocationAttemptedLive: false,
  credentialRevokedLive: false,
  provesRevocationLive: false,
  enablesCredentialAccess: false,
  enablesProcessStart: false,
  enablesPreflightRunner: false,
} as const;

test.describe("credential source adapter boundary canonical behavior", () => {
  test("server wrapper is server-only and exposes no live credential reader", () => {
    const boundarySource = source(boundaryPath);
    expect(boundarySource.startsWith('import "server-only";')).toBe(true);
    expect(boundarySource).not.toMatch(/\bgetCredential\(|\breadSecret\(|\breadToken\(|\breadPassword\(|process\.env|node:fs/u);
  });

  test("exact identity is fixture-only and immutable", () => {
    expect(validateCredentialSourceAdapterIdentity(CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY).ok).toBe(true);
    expect(CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY.adapterId).toBe("ture.execution.credential-source-adapter-boundary.fixture.v1");
    expect(Object.isFrozen(CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY)).toBe(true);
    expect(buildCredentialSourceAdapterIdentityFingerprint()).toMatch(/^[a-f0-9]{64}$/u);
  });

  test("policy registry contains no-credential and future fixture-reference policies only", () => {
    const registry = buildCredentialSourcePolicyRegistry();
    expect(registry.map((policy) => policy.policyId)).toEqual([NO_CREDENTIAL_POLICY_ID, FUTURE_KEYCHAIN_REFERENCE_POLICY_ID]);
    for (const policy of registry) {
      expect(validateCredentialSourcePolicy(policy).ok).toBe(true);
      expect(policy.secretMaterialAllowed).toBe(false);
      expect(policy.environmentDeliveryAllowed).toBe(false);
      expect(policy.argvDeliveryAllowed).toBe(false);
      expect(policy.stdinDeliveryAllowed).toBe(false);
      expect(policy.filesystemDeliveryAllowed).toBe(false);
      expect(policy.keychainAccessAllowed).toBe(false);
      expect(policy.credentialHelperAllowed).toBe(false);
      expect(policy.fixtureMayEnableRunner).toBe(false);
    }
  });

  test("current Git and Supabase version operations evaluate as no-credential compatible", () => {
    for (const operation of ["collect_git_version", "collect_supabase_cli_version"] as const) {
      const { adapter, request } = noCredentialFixture(operation);
      const result = adapter.evaluateNoCredentialFixture({ request, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
      expect(result).toMatchObject(falseEvidence);
      expect(result.sourceEvidence.disposition).toBe("compatible_fixture_no_credential");
      expect(result.sourceEvidence.secretPresence).toBe("confirmed_absent");
      expect(result.sourceEvidence.sourceClassification).toBe("none");
      expect(result.lease.disposition).toBe("compatible_fixture_no_credential");
      expect(result.cleanupEvidence.cleanupPlanState).toBe("not_required");
      expect(result.revocationEvidence.revocationPlanState).toBe("not_required");
      expect(result.compatibility.runner).toBe("fixture_credential_source_structurally_compatible_but_not_live_runner_enabling");
    }
  });

  test("future reference fixture is metadata-only and no-live", () => {
    const { adapter, request } = referenceFixture("future_supabase_cli_authentication");
    const result = adapter.evaluateCredentialReferenceFixture({ request, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
    expect(result).toMatchObject(falseEvidence);
    expect(result.sourceEvidence.disposition).toBe("compatible_fixture_reference_no_secret");
    expect(result.sourceEvidence.secretPresence).toBe("secret_reference_metadata_only");
    expect(result.sourceEvidence.sourceClassification).toBe("macos_keychain_reference_fixture");
    expect(result.lease.leaseIssuedLive).toBe(false);
  });

  test("production files contain no prohibited live credential or execution dependency", () => {
    const combined = `${source(corePath)}\n${source(boundaryPath)}`;
    expect(combined).not.toMatch(/process\.env|node:fs|from ['"]fs['"]|fs\/promises|child_process|spawn\(|exec\(|execFile\(|fork\(|security find|security add|security delete|osascript/u);
    expect(combined).not.toMatch(/\bgetCredential\(|\breadSecret\(|\breadToken\(|\breadPassword\(|Bearer /u);
    expect(combined).not.toMatch(/authoritativeLive: true|secretMaterialPresent: true|credentialAccessed: true|credentialRead: true|credentialDecrypted: true|credentialDelivered: true|leaseIssuedLive: true|leaseActivatedLive: true|keychainAccessAttempted: true|keychainItemRead: true|environmentRead: true|environmentCredentialInjected: true|argvCredentialInjected: true|stdinCredentialInjected: true|filesystemRead: true|credentialFileCreated: true|credentialHelperInvoked: true|networkBrokerContacted: true|authorizationConsumed: true|cleanupAttemptedLive: true|cleanupCompletedLive: true|provesCredentialCleanupLive: true|revocationAttemptedLive: true|credentialRevokedLive: true|provesRevocationLive: true|enablesCredentialAccess: true|enablesProcessStart: true|enablesPreflightRunner: true/u);
  });

  test("API and Trade UI do not import credential source boundary", () => {
    expect(source(apiPath)).not.toContain("post-trade-credential-source-adapter-boundary");
    expect(source(tradeUiPath)).not.toContain("post-trade-credential-source-adapter-boundary");
  });

  test("future live plan is inert and does not select a credential API", () => {
    expect(buildCredentialSourceFutureLivePlan()).toMatchObject({
      fixtureOnly: true,
      liveCredentialAdapterPresent: false,
      selectedKeychainApi: "not_selected",
      keychainAccessImplemented: false,
      credentialHelperImplemented: false,
      environmentFallbackImplemented: false,
      credentialFileFallbackImplemented: false,
    });
  });
});

const identityPatches: Array<[string, Record<string, unknown>]> = [
  ["adapter kind", { adapterKind: "credential_reader" }],
  ["adapter id", { adapterId: "ture.execution.credential-source-adapter-boundary.live.v1" }],
  ["platform", { platform: "linux" }],
  ["implementation mode", { implementationMode: "live" }],
  ["secret mode", { secretMaterialMode: "allowed" }],
  ["source model", { sourceModel: "environment" }],
  ["policy version", { policyVersion: 2 }],
  ["authority", { authority: "live_credential_reference_authority" }],
  ["completeness", { completeness: "complete_reference_fixture_structure" }],
];

for (const [name, patch] of identityPatches) {
  test(`identity rejects changed ${name}`, () => {
    expectInvalid(validateCredentialSourceAdapterIdentity({ ...CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY, ...patch }));
  });
}

const policyPatches: Array<[string, Record<string, unknown>]> = [
  ["unknown policy", { policyId: "unknown" }],
  ["secret material", { secretMaterialAllowed: true }],
  ["environment delivery", { environmentDeliveryAllowed: true }],
  ["argv delivery", { argvDeliveryAllowed: true }],
  ["stdin delivery", { stdinDeliveryAllowed: true }],
  ["filesystem delivery", { filesystemDeliveryAllowed: true }],
  ["helper", { credentialHelperAllowed: true }],
  ["keychain", { keychainAccessAllowed: true }],
  ["persistence", { persistenceAllowed: true }],
  ["logging", { loggingAllowed: true }],
  ["retry", { retryPolicy: "retry_once" }],
  ["renewable", { renewable: true }],
  ["runner", { fixtureMayEnableRunner: true }],
];

for (const [name, patch] of policyPatches) {
  test(`policy rejects ${name} override`, () => {
    expectInvalid(validateCredentialSourcePolicy({ ...buildCredentialSourcePolicy(NO_CREDENTIAL_POLICY_ID), ...patch }));
  });
}

test.describe("capability provenance and request rejection", () => {
  test("capabilities reject plain/spread/json/structured clone and cross-type substitution", () => {
    const { session, proof } = noCredentialFixture();
    const { reference } = referenceFixture();
    expect(validateCredentialSessionCapability(session).ok).toBe(true);
    expectInvalid(validateCredentialSessionCapability({ ...session }));
    expectInvalid(validateCredentialSessionCapability(JSON.parse(JSON.stringify(session))));
    if (typeof structuredClone === "function") expectInvalid(validateCredentialSessionCapability(structuredClone(session)));
    expectInvalid(validateFixtureNoCredentialRequirementCapability({ ...proof }));
    expectInvalid(validateFixtureCredentialReferenceCapability({ ...reference }));
    expectInvalid(validateFixtureCredentialReferenceCapability(proof as unknown));
    expectInvalid(validateFixtureNoCredentialRequirementCapability(reference as unknown));
    expectInvalid(validateFixtureCredentialReferenceCapability(session as unknown));
  });

  test("capabilities are deeply frozen and session/purpose/operation bound", () => {
    const { proof, session } = noCredentialFixture("collect_supabase_cli_version");
    const { reference } = referenceFixture("future_git_remote_authentication");
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(proof)).toBe(true);
    expect(Object.isFrozen(reference)).toBe(true);
    expectInvalid(validateFixtureNoCredentialRequirementCapability(proof, "collect_git_version"));
    expectInvalid(validateFixtureCredentialReferenceCapability(reference, "future_supabase_cli_authentication"));
    expectInvalid(validateCredentialSessionCapability(buildCredentialSessionCapability({ boundarySessionId: "other_session" })));
  });

  test("no-credential request rejects credential reference and future reference request rejects no-credential proof", () => {
    const { request } = noCredentialFixture();
    const { reference } = referenceFixture();
    expectInvalid(validateNoCredentialFixtureRequest({ ...request, credentialReferenceCapability: reference }));
    expectInvalid(validateCredentialReferenceFixtureRequest({ ...referenceFixture().request, noCredentialRequirementCapability: buildFixtureNoCredentialRequirementCapability() }));
  });
});

const forbiddenKeys = [
  "password", "passphrase", "token", "accessToken", "refreshToken", "apiKey", "secret", "secretValue", "privateKey", "clientSecret",
  "sessionCookie", "authorizationHeader", "bearer", "credential", "credentialValue", "keychainResult", "environmentValue", "fileContent",
  "stdinValue", "argvCredential", "encryptedSecret", "encodedSecret", "base64Secret", "hexSecret", "keychainAccount", "keychainPassword",
  "credentialFile", "credentialPath", "env", "environment", "processEnv", "authorizationConsumed", "credentialAccessed", "credentialRead",
  "credentialDelivered", "leaseIssuedLive", "cleanupCompletedLive", "credentialRevokedLive", "enablesCredentialAccess", "enablesProcessStart",
  "enablesPreflightRunner",
];

for (const key of forbiddenKeys) {
  test(`request rejects forbidden key ${key}`, () => {
    const { request } = noCredentialFixture();
    expectInvalid(validateNoCredentialFixtureRequest({ ...request, nested: { [key]: true } }));
  });
}

const sensitiveValues = [
  "Authorization: Bearer abc.def.ghi",
  "eyJaaaaaaaaaaaaaaaaaaaaaaaa.eyJbbbbbbbbbbbbbbbbbbbb.cccccccccccccccccccccc",
  "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----",
  "password=super-secret",
  "api_key=abc123",
  "access_token=abc123",
  "refresh_token=abc123",
  "https://user:pass@example.test",
  "base64_secret: abc",
  "hex_secret: ffffff",
  "A".repeat(90),
];

for (const value of sensitiveValues) {
  test(`request rejects sensitive value without echo ${value.slice(0, 12)}`, () => {
    const { request } = noCredentialFixture();
    const result = validateNoCredentialFixtureRequest({ ...request, note: value });
    expectInvalid(result);
    if (!result.ok) expect(JSON.stringify(result.errors)).not.toContain(value);
  });
}

const sourceCases: Array<[string, string]> = [
  ["unsupported_environment_source", "environment_source_forbidden"],
  ["unsupported_file_source", "file_source_forbidden"],
  ["unsupported_credential_helper", "credential_helper_forbidden"],
  ["unsupported_browser_session", "browser_session_forbidden"],
  ["unsupported_network_broker", "network_broker_forbidden"],
  ["unknown", "unsupported_credential_source"],
];

for (const [classification] of sourceCases) {
  test(`source classification ${classification} is not compatible with current operations`, () => {
    expect(classifyCredentialSource(classification)).toBe(classification);
    expectInvalid(validateCurrentOperationCredentialCompatibility("collect_git_version", classifyCredentialSource(classification)));
  });
}

test.describe("generated credential-source adversarial matrix", () => {
  const generatedCases = Array.from({ length: 230 }, (_, index) => index + 1);
  for (const index of generatedCases) {
    test(`generated no-secret invariant #${index}`, () => {
      const operation = index % 2 === 0 ? "collect_git_version" : "collect_supabase_cli_version";
      const first = noCredentialFixture(operation);
      const second = noCredentialFixture(operation);
      const firstResult = first.adapter.evaluateNoCredentialFixture({ request: first.request, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
      const secondResult = first.adapter.evaluateNoCredentialFixture({ request: first.request, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
      const otherResult = second.adapter.evaluateNoCredentialFixture({ request: second.request, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
      expect(firstResult).toEqual(secondResult);
      expect(firstResult.resultFingerprint).toBe(secondResult.resultFingerprint);
      expect(firstResult).toMatchObject(falseEvidence);
      expect(otherResult).toMatchObject(falseEvidence);
      expect(firstResult.compatibility.enablesCredentialAccess).toBe(false);
      expect(firstResult.compatibility.enablesProcessStart).toBe(false);
      expect(firstResult.compatibility.enablesPreflightRunner).toBe(false);
      expect(Object.isFrozen(firstResult)).toBe(true);
      expect(() => Object.assign(firstResult as unknown as Record<string, unknown>, { credentialAccessed: true })).toThrow();
    });
  }
});

test.describe("fingerprints and compatibility", () => {
  for (const [name, domain] of Object.entries(CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS)) {
    test(`fingerprint domain ${name} is source-controlled`, () => {
      expect(domain).toMatch(/^ture:credential-source-adapter-boundary:/u);
    });
  }

  test("purpose, source, audience and scope classifications are deterministic", () => {
    expect(buildCredentialPurposeDefinition("no_credential_required")).toMatchObject({ audience: "none", scope: "none" });
    expect(buildCredentialPurposeDefinition("future_supabase_cli_authentication")).toMatchObject({ audience: "future_supabase_cli_process", scope: "future_supabase_read_only_auth_scope" });
    expect(buildCredentialPurposeDefinition("future_git_remote_authentication")).toMatchObject({ audience: "future_git_remote_process", scope: "future_git_remote_read_only_scope" });
    expect(classifySecretPresence({ ok: true })).toBe("confirmed_absent");
    expect(classifySecretPresence({ ok: true }, true)).toBe("secret_reference_metadata_only");
  });

  test("authorization link is fixture-only and cannot consume authorization", () => {
    const link = buildCredentialFixtureAuthorizationLink();
    expect(validateCredentialFixtureAuthorizationLink(link).ok).toBe(true);
    expectInvalid(validateCredentialFixtureAuthorizationLink({ ...link }));
    expectInvalid(validateCredentialFixtureAuthorizationLink({ ...link, authorizationConsumed: true }));
    expectInvalid(validateCredentialFixtureAuthorizationLink({ ...link, authorizesCredentialAccessLive: true }));
  });

  test("compatibility is structural and non-enabling", () => {
    expect(buildCredentialSourceCompatibilitySummary()).toMatchObject({
      directSpawnDriver: "current_version_operations_require_no_credentials",
      trustedResolver: "credential_boundary_does_not_resolve_paths",
      processObserver: "no_credential_helper_or_keychain_child_expected",
      processExecutor: "no_credential_delivery_to_executor",
      cliVersionCollector: "version_operations_require_no_credentials",
      authorization: "fixture_link_structural_no_consumption_no_live_access",
      runner: "fixture_credential_source_structurally_compatible_but_not_live_runner_enabling",
      enablesCredentialAccess: false,
      enablesExecution: false,
      enablesProcessStart: false,
      enablesPreflightRunner: false,
    });
  });
});
