import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY,
  CREDENTIAL_SOURCE_EVALUATED_AT,
  CREDENTIAL_SOURCE_EXPIRES_AT,
  CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS,
  FUTURE_KEYCHAIN_REFERENCE_POLICY_ID,
  NO_CREDENTIAL_POLICY_ID,
  buildCredentialFixtureAuthorizationLink,
  buildCredentialPurposeDefinition,
  buildCredentialReferenceFixtureRequest,
  buildCredentialSessionCapability,
  buildCredentialSourceAdapterIdentityFingerprint,
  buildCredentialSourceCompatibilitySummary,
  buildCredentialSourceFixtureAdapter,
  buildCredentialSourcePolicy,
  buildCredentialSourcePolicyRegistry,
  buildFixtureCredentialReferenceCapability,
  buildFixtureNoCredentialRequirementCapability,
  buildNoCredentialFixtureRequest,
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

function expectInvalid(result: { ok: true } | { ok: false; errors: readonly string[] }, expected?: string) {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors.length).toBeGreaterThan(0);
    if (expected) expect(result.errors).toContain(expected);
  }
}

function expectThrowsSanitized(callback: () => unknown) {
  expect(callback).toThrow(/credential_source_/u);
  try {
    callback();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    expect(message).not.toMatch(/super-secret|Bearer|PRIVATE KEY|password=|api_key=|access_token=|refresh_token=|token-fragment/u);
  }
}

function noCredentialFixture(operation: "collect_git_version" | "collect_supabase_cli_version" = "collect_git_version") {
  const session = buildCredentialSessionCapability({ intendedPurpose: "no_credential_required" });
  const proof = buildFixtureNoCredentialRequirementCapability({ boundarySessionId: session.boundarySessionId, operation });
  const request = buildNoCredentialFixtureRequest({ operation, credentialSessionCapability: session, noCredentialRequirementCapability: proof });
  return { proof, request, session };
}

function referenceFixture(purpose: Exclude<CredentialPurpose, "no_credential_required"> = "future_supabase_cli_authentication") {
  const session = buildCredentialSessionCapability({ intendedPurpose: purpose });
  const reference = buildFixtureCredentialReferenceCapability({ boundarySessionId: session.boundarySessionId, purpose });
  const request = buildCredentialReferenceFixtureRequest({ purpose, credentialSessionCapability: session, credentialReferenceCapability: reference });
  const authorization = buildCredentialFixtureAuthorizationLink({ boundarySessionId: session.boundarySessionId, purpose, operation: "future_authentication_operation" });
  return { authorization, reference, request, session };
}

function clone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input)) as T;
}

test.describe("Action 532 credential source boundary security review", () => {
  test("exported identity, policies, purposes and domains are exact and immutable", () => {
    expect(CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY.adapterId).toBe("ture.execution.credential-source-adapter-boundary.fixture.v1");
    expect(CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY).toMatchObject({
      adapterKind: "credential_source_adapter_boundary",
      platform: "macos",
      implementationMode: "fixture_only",
      secretMaterialMode: "forbidden",
      sourceModel: "injected_fixture_metadata",
      policyVersion: 1,
    });
    expect(Object.isFrozen(CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY)).toBe(true);
    expect(buildCredentialSourcePolicyRegistry().map((policy) => policy.policyId)).toEqual([NO_CREDENTIAL_POLICY_ID, FUTURE_KEYCHAIN_REFERENCE_POLICY_ID]);
    expect(buildCredentialPurposeDefinition("no_credential_required")).toMatchObject({ audience: "none", scope: "none", currentOperationAllowed: true });
    expect(buildCredentialPurposeDefinition("future_supabase_cli_authentication")).toMatchObject({ audience: "future_supabase_cli_process", scope: "future_supabase_read_only_auth_scope", currentOperationAllowed: false });
    expect(buildCredentialPurposeDefinition("future_git_remote_authentication")).toMatchObject({ audience: "future_git_remote_process", scope: "future_git_remote_read_only_scope", currentOperationAllowed: false });
    expect(Object.keys(CREDENTIAL_SOURCE_FINGERPRINT_DOMAINS)).toHaveLength(16);
  });

  test("production boundary has no live credential, environment, filesystem, process, network or provider dependency", () => {
    const implementation = `${source(corePath)}\n${source(boundaryPath)}`;
    expect(implementation).not.toMatch(/process\.env|node:fs|from ['"]fs['"]|fs\/promises|readFile\(|child_process|spawn\(|exec\(|execFile\(|fork\(|keytar|osascript|AppleScript|fetch\(|axios|localStorage|sessionStorage|Supabase client/u);
    expect(implementation).not.toMatch(/\bgetCredential\(|\breadCredential\(|\breadSecret\(|\breadToken\(|\breadPassword\(|\bgetKeychainItem\(|\bfindKeychainItem\(|\bloadCredentialFile\(|\bresolveEnvironmentSecret\(|git credential|OAuth|cookie\(|document\.cookie/u);
    expect(implementation).not.toMatch(/authoritativeLive: true|secretMaterialPresent: true|credentialAccessed: true|credentialRead: true|credentialDecrypted: true|credentialDelivered: true|leaseIssuedLive: true|leaseActivatedLive: true|keychainAccessAttempted: true|keychainItemRead: true|keychainItemModified: true|keychainItemDeleted: true|environmentRead: true|environmentCredentialInjected: true|argvCredentialInjected: true|stdinCredentialInjected: true|filesystemRead: true|credentialFileCreated: true|credentialHelperInvoked: true|networkBrokerContacted: true|authorizationConsumed: true|cleanupAttemptedLive: true|cleanupCompletedLive: true|provesCredentialCleanupLive: true|revocationAttemptedLive: true|credentialRevokedLive: true|provesRevocationLive: true|enablesCredentialAccess: true|enablesProcessStart: true|enablesPreflightRunner: true/u);
  });

  test("server-only wrapper is not imported by API route or Trade UI", () => {
    expect(source(boundaryPath).startsWith('import "server-only";')).toBe(true);
    expect(source(apiPath)).not.toContain("post-trade-credential-source-adapter-boundary");
    expect(source(tradeUiPath)).not.toContain("post-trade-credential-source-adapter-boundary");
  });

  test("capability provenance rejects forgery, cloning, cross-type substitution and mutation", () => {
    const { proof, request, session } = noCredentialFixture("collect_git_version");
    const { authorization, reference } = referenceFixture("future_supabase_cli_authentication");

    expectInvalid(validateCredentialSessionCapability({ ...session }));
    expectInvalid(validateCredentialSessionCapability(clone(session)));
    expectInvalid(validateFixtureNoCredentialRequirementCapability({ ...proof }, "collect_git_version"));
    expectInvalid(validateFixtureNoCredentialRequirementCapability(structuredClone(proof), "collect_git_version"));
    expectInvalid(validateFixtureCredentialReferenceCapability({ ...reference }, "future_supabase_cli_authentication"));
    expectInvalid(validateFixtureCredentialReferenceCapability(clone(reference), "future_supabase_cli_authentication"));
    expectInvalid(validateCredentialFixtureAuthorizationLink({ ...authorization }, "future_supabase_cli_authentication"));
    expectInvalid(validateNoCredentialFixtureRequest({ ...request, noCredentialRequirementCapability: reference }));
    expectInvalid(validateCredentialReferenceFixtureRequest({ ...referenceFixture().request, credentialReferenceCapability: proof }));
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(proof)).toBe(true);
    expect(Object.isFrozen(reference)).toBe(true);
  });

  test("session, expiry, policy, purpose and operation substitutions fail closed", () => {
    const { proof, request, session } = noCredentialFixture("collect_git_version");
    const expiredSession = buildCredentialSessionCapability({ intendedPurpose: "no_credential_required", expiresAt: "2026-07-17T10:39:00.000Z" });
    const otherSession = buildCredentialSessionCapability({ intendedPurpose: "no_credential_required", boundarySessionId: "other_fixture_session" });
    expectInvalid(validateCredentialSessionCapability(expiredSession), "credential_session_expired");
    expectInvalid(validateCredentialSessionCapability(otherSession), "session_mismatch");
    expectInvalid(validateNoCredentialFixtureRequest({ ...request, credentialPolicyId: FUTURE_KEYCHAIN_REFERENCE_POLICY_ID }));
    expectInvalid(validateNoCredentialFixtureRequest({ ...request, purpose: "future_supabase_cli_authentication" }));
    expectInvalid(validateNoCredentialFixtureRequest({ ...request, operation: "run_git_status" }));
    expectInvalid(validateNoCredentialFixtureRequest({ ...request, credentialSessionCapability: session, noCredentialRequirementCapability: buildFixtureNoCredentialRequirementCapability({ operation: "collect_supabase_cli_version" }) }));
    expectInvalid(validateFixtureNoCredentialRequirementCapability(proof, "collect_supabase_cli_version"), "operation_mismatch");
  });

  test("future credential references cannot attach to current version operations", () => {
    expectInvalid(validateCurrentOperationCredentialCompatibility("collect_git_version", "macos_keychain_reference_fixture"), "credential_not_allowed_for_operation");
    expectInvalid(validateCurrentOperationCredentialCompatibility("collect_supabase_cli_version", "macos_keychain_reference_fixture"), "credential_not_allowed_for_operation");
    expectInvalid(validateCurrentOperationCredentialCompatibility("collect_git_version", "unsupported_credential_helper"));
    expectInvalid(validateNoCredentialFixtureRequest({ ...noCredentialFixture().request, credentialReferenceCapability: referenceFixture().reference }));
  });

  test("future purposes, audience and scope are exact and cannot be wildcarded or broadened", () => {
    expectThrowsSanitized(() => buildCredentialPurposeDefinition("admin" as never));
    expectThrowsSanitized(() => buildCredentialSessionCapability({ intendedPurpose: "*" as never }));
    expectThrowsSanitized(() => buildFixtureCredentialReferenceCapability({ purpose: "no_credential_required" as never }));
    const supabase = referenceFixture("future_supabase_cli_authentication");
    expectInvalid(validateFixtureCredentialReferenceCapability(supabase.reference, "future_git_remote_authentication"), "purpose_mismatch");
    expectInvalid(validateFixtureCredentialReferenceCapability({ ...supabase.reference, audienceFingerprint: "future_*_process" }, "future_supabase_cli_authentication"));
    expectInvalid(validateFixtureCredentialReferenceCapability({ ...supabase.reference, scopeFingerprint: "admin_write_deploy_scope" }, "future_supabase_cli_authentication"));
    expectInvalid(validateCredentialReferenceFixtureRequest({ ...supabase.request, purpose: "future_git_remote_authentication" }));
  });

  test("authorization link remains fixture-only and cannot consume or authorize live credential access", () => {
    const { authorization } = referenceFixture("future_supabase_cli_authentication");
    expect(validateCredentialFixtureAuthorizationLink(authorization, "future_supabase_cli_authentication").ok).toBe(true);
    expectInvalid(validateCredentialFixtureAuthorizationLink({ ...authorization, authorizationConsumed: true }, "future_supabase_cli_authentication"), "fixture_claimed_authorization_consumption");
    expectInvalid(validateCredentialFixtureAuthorizationLink({ ...authorization, authorizesCredentialAccessLive: true }, "future_supabase_cli_authentication"), "fixture_claimed_credential_access");
    expectThrowsSanitized(() => buildCredentialFixtureAuthorizationLink({ authorizationConsumed: true } as never));
  });

  test("valid fixture results are nonauthoritative and cannot enable credential access, process start, runner, cleanup or revocation proof", () => {
    const adapter = buildCredentialSourceFixtureAdapter();
    const result = adapter.evaluateCredentialReferenceFixture({ request: referenceFixture().request, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
    expect(result).toMatchObject({
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
    });
    expect(result.lease).toMatchObject({ renewable: false, replayable: false, leaseIssuedLive: false, leaseActivatedLive: false, authority: "fixture_structural_only" });
    expect(result.cleanupEvidence).toMatchObject({ cleanupAttemptedLive: false, cleanupCompletedLive: false, provesCredentialCleanupLive: false });
    expect(result.revocationEvidence).toMatchObject({ revocationAttemptedLive: false, credentialRevokedLive: false, provesRevocationLive: false });
  });

  test("compatibility remains informational and non-enabling", () => {
    expect(buildCredentialSourceCompatibilitySummary()).toMatchObject({
      directSpawnDriver: "current_version_operations_require_no_credentials",
      cliVersionCollector: "version_operations_require_no_credentials",
      authorization: "fixture_link_structural_no_consumption_no_live_access",
      runner: "fixture_credential_source_structurally_compatible_but_not_live_runner_enabling",
      enablesCredentialAccess: false,
      enablesExecution: false,
      enablesProcessStart: false,
      enablesPreflightRunner: false,
    });
  });

  test("deterministic fingerprints bind identity, policy, session, purpose, audience, scope, blocking and false evidence flags", () => {
    const identity = buildCredentialSourceAdapterIdentityFingerprint();
    expect(identity).toMatch(/^[a-f0-9]{64}$/u);
    expect(validateCredentialSourceAdapterIdentity({ ...CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY, policyVersion: 2 }).ok).toBe(false);
    expect(validateCredentialSourcePolicy({ ...buildCredentialSourcePolicy(NO_CREDENTIAL_POLICY_ID), oneShotOnly: false }).ok).toBe(false);
    const sessionA = buildCredentialSessionCapability({ capabilityId: "fixture_credential_session_a" });
    const sessionB = buildCredentialSessionCapability({ capabilityId: "fixture_credential_session_b" });
    expect(sessionA.capabilityFingerprint).not.toBe(sessionB.capabilityFingerprint);
    const referenceA = buildFixtureCredentialReferenceCapability({ audienceFingerprint: "a".repeat(64), scopeFingerprint: "b".repeat(64) });
    const referenceB = buildFixtureCredentialReferenceCapability({ audienceFingerprint: "c".repeat(64), scopeFingerprint: "b".repeat(64) });
    const referenceC = buildFixtureCredentialReferenceCapability({ audienceFingerprint: "a".repeat(64), scopeFingerprint: "d".repeat(64) });
    expect(referenceA.capabilityFingerprint).not.toBe(referenceB.capabilityFingerprint);
    expect(referenceA.capabilityFingerprint).not.toBe(referenceC.capabilityFingerprint);
    const adapter = buildCredentialSourceFixtureAdapter();
    const valid = adapter.evaluateNoCredentialFixture({ request: noCredentialFixture().request, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
    const blocked = adapter.evaluateNoCredentialFixture({ request: { ...noCredentialFixture().request, attempt: 2 } as never, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
    expect(valid.resultFingerprint).not.toBe(blocked.resultFingerprint);
  });
});

const prohibitedKeyCases = [
  "Password",
  "api-key",
  "access_token",
  "refresh token",
  "secretValue",
  "private-key",
  "client secret",
  "session-cookie",
  "authorization header",
  "credential value",
  "keychain-account",
  "keychain_service",
  "environment value",
  "credential path",
  "argv credential",
  "authorization consumed",
  "lease issued live",
  "cleanup completed live",
  "credential revoked live",
  "enables preflight runner",
];

for (const key of prohibitedKeyCases) {
  test(`review rejects normalized prohibited key ${key}`, () => {
    expectInvalid(validateNoCredentialFixtureRequest({ ...noCredentialFixture().request, nested: [{ [key]: false }] } as never), "secret_material_detected");
  });
}

const sensitiveValueCases = [
  "Authorization: Bearer token-fragment",
  "Bearer token-fragment",
  "eyJaaaaaaaa.eyJbbbbbbbb.cccccccccc",
  "-----BEGIN PRIVATE KEY-----",
  "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----",
  "password=super-secret",
  "api key=super-secret",
  "access_token=super-secret",
  "refresh-token=super-secret",
  "https://user:super-secret@example.test/path",
  "base64 secret",
  "hex_secret",
  "A".repeat(90),
  "Bearer%20token-fragment",
  "pa\u200Bssword=super-secret",
  "ＡＰＩ key=super-secret",
];

for (const value of sensitiveValueCases) {
  test(`review rejects sensitive value shape #${sensitiveValueCases.indexOf(value) + 1} without echo`, () => {
    const result = validateNoCredentialFixtureRequest({
      ...noCredentialFixture().request,
      nested: [{ harmless: value }],
    } as never);
    expectInvalid(result, "secret_material_detected");
    if (!result.ok) expect(result.errors.join(" ")).not.toContain(value);
  });
}

const sourceCases: Array<[string, unknown]> = [
  ["environment delivery", { environmentDeliveryAllowed: true }],
  ["argv delivery", { argvDeliveryAllowed: true }],
  ["stdin delivery", { stdinDeliveryAllowed: true }],
  ["filesystem delivery", { filesystemDeliveryAllowed: true }],
  ["credential helper", { credentialHelperAllowed: true }],
  ["Keychain access", { keychainAccessAllowed: true }],
  ["browser session", { browserSessionAllowed: true }],
  ["network broker", { networkBrokerAllowed: true }],
  ["live lease", { leaseIssuedLive: true }],
  ["renewable lease", { renewable: true }],
  ["replayable lease", { replayable: true }],
  ["live cleanup", { cleanupCompletedLive: true }],
  ["cleanup proof", { provesCredentialCleanupLive: true }],
  ["live revocation", { credentialRevokedLive: true }],
  ["revocation proof", { provesRevocationLive: true }],
  ["credential access", { credentialAccessed: true }],
  ["process start", { enablesProcessStart: true }],
  ["runner enablement", { enablesPreflightRunner: true }],
];

for (const [name, patch] of sourceCases) {
  test(`review rejects ${name} escalation`, () => {
    const result = validateNoCredentialFixtureRequest({ ...noCredentialFixture().request, nested: [patch] } as never);
    expectInvalid(result);
  });
}

test.describe("Action 532 malformed and oversized input safety", () => {
  test("cyclic object fails closed without value echo", () => {
    const cyclic: Record<string, unknown> = { requestKind: "no_credential_fixture_request" };
    cyclic.self = cyclic;
    const result = validateNoCredentialFixtureRequest(cyclic);
    expectInvalid(result);
    if (!result.ok) expect(result.errors.join(" ")).not.toContain("self");
  });

  test("excessive depth, node count, array size and string size fail closed", () => {
    let deep: Record<string, unknown> = { leaf: "ok" };
    for (let index = 0; index < 30; index += 1) deep = { next: deep };
    expectInvalid(validateNoCredentialFixtureRequest({ ...noCredentialFixture().request, extra: deep } as never), "secret_material_detected");
    expectInvalid(validateNoCredentialFixtureRequest({ ...noCredentialFixture().request, extra: Array.from({ length: 300 }, (_, index) => index) } as never), "secret_material_detected");
    expectInvalid(validateNoCredentialFixtureRequest({ ...noCredentialFixture().request, extra: "x".repeat(513) } as never), "secret_material_detected");
  });

  test("builder exports reject unsafe material before hashing and errors are sanitized", () => {
    expectThrowsSanitized(() => buildCredentialSourceAdapterIdentityFingerprint({ harmless: "password=super-secret" }));
    expectThrowsSanitized(() => buildCredentialSessionCapability({ capabilityId: "password=super-secret" }));
    expectThrowsSanitized(() => buildFixtureCredentialReferenceCapability({ keychainService: "service" } as never));
    expectThrowsSanitized(() => buildFixtureNoCredentialRequirementCapability({ operation: "deploy_write" as never }));
    expectThrowsSanitized(() => buildCredentialFixtureAuthorizationLink({ authorizationConsumed: true } as never));
    expectThrowsSanitized(() => buildNoCredentialFixtureRequest({ apiKey: "super-secret" } as never));
    expectThrowsSanitized(() => buildCredentialReferenceFixtureRequest({ purpose: "admin" as never }));
  });

  test("secret-like rejected values are not returned, persisted or fingerprinted in results", () => {
    const result = validateNoCredentialFixtureRequest({
      ...noCredentialFixture().request,
      nested: [{ harmless: "password=super-secret" }],
    } as never);
    expectInvalid(result, "secret_material_detected");
    expect(JSON.stringify(result)).not.toContain("super-secret");
    const fixture = buildCredentialSourceFixtureAdapter().evaluateNoCredentialFixture({
      request: { ...noCredentialFixture().request, nested: [{ harmless: "password=super-secret" }] } as never,
      evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT,
    });
    expect(JSON.stringify(fixture)).not.toContain("super-secret");
    expect(fixture.sourceEvidence.secretPresence).toBe("secret_material_detected");
    expect(fixture.sourceEvidence.completeness).toBe("secret_material_detected");
  });

  test("classifiers do not treat secret-bearing input as absent", () => {
    expect(classifySecretPresence({ harmless: "password=super-secret" })).toBe("secret_material_detected");
    expect(classifySecretPresence({ referenceIdentityFingerprint: "a".repeat(64) }, true)).toBe("secret_reference_metadata_only");
  });

  test("identical inputs are deterministic and invocation order does not contaminate sessions", () => {
    const adapter = buildCredentialSourceFixtureAdapter();
    const first = adapter.evaluateNoCredentialFixture({ request: noCredentialFixture("collect_git_version").request, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
    const second = adapter.evaluateNoCredentialFixture({ request: noCredentialFixture("collect_git_version").request, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
    expect(first).toEqual(second);
    const supabase = adapter.evaluateNoCredentialFixture({ request: noCredentialFixture("collect_supabase_cli_version").request, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
    expect(supabase.resultFingerprint).not.toBe(first.resultFingerprint);
  });

  test("expired and malformed evaluatedAt values fail closed", () => {
    const { request } = noCredentialFixture();
    expectInvalid(validateNoCredentialFixtureRequest(request, "2026-07-17T10:40:31.000Z"), "request_expired");
    expectInvalid(validateNoCredentialFixtureRequest(request, "not-a-date"));
    expect(CREDENTIAL_SOURCE_EXPIRES_AT).toBe("2026-07-17T10:40:30.000Z");
  });

  test("ambient time and randomness are absent from production boundary", () => {
    const implementation = `${source(corePath)}\n${source(boundaryPath)}`;
    expect(implementation).not.toMatch(/Date\.now|new Date\(|performance\.now|process\.uptime|setTimeout|setInterval|Math\.random|crypto\.randomUUID/u);
  });

  test("review docs do not overclaim live credential readiness", () => {
    const docs = `${source("docs/credential-source-adapter-boundary.md")}\n${source("docs/credential-source-adapter-boundary-checkpoint.md")}`;
    expect(docs).toContain("fixture-only");
    expect(docs).toContain("metadata-only");
    expect(docs).not.toMatch(/Keychain is queried|credential is delivered|lease is issued|cleanup is proven|revocation is proven|live staging is ready/u);
  });
});
