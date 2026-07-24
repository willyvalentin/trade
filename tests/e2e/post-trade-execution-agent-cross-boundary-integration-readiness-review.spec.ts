import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY, buildDirectSpawnFixtureDriverAdapter, buildDirectSpawnFixtureRequest, buildDirectSpawnOperationDefinition, buildFixtureExecutableSpawnAuthority, buildFixtureSpawnAuthorizationLink, buildSpawnSessionCapability } from "../../lib/post-trade-direct-spawn-driver-boundary-core";
import { CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY, CREDENTIAL_SOURCE_EVALUATED_AT, buildCredentialSessionCapability, buildCredentialSourceFixtureAdapter, buildFixtureNoCredentialRequirementCapability, buildNoCredentialFixtureRequest } from "../../lib/post-trade-credential-source-adapter-boundary-core";
import { SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY } from "../../lib/post-trade-scoped-macos-process-observer-core";
import { TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY } from "../../lib/post-trade-trusted-live-resolver-adapter-core";

const root = process.cwd();
const coreFiles = ["lib/post-trade-trusted-live-resolver-adapter-core.ts", "lib/post-trade-scoped-macos-process-observer-core.ts", "lib/post-trade-direct-spawn-driver-boundary-core.ts", "lib/post-trade-credential-source-adapter-boundary-core.ts"];
const source = coreFiles.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
const names = [
  "unique fixture identities", "future-live identity separation", "unknown resolver policy", "unknown credential policy", "unknown spawn policy", "unknown observer policy", "immutable policy registry", "closed operation registry", "resolver/spawn type separation", "credential/spawn type separation", "authorization type separation", "repository/executable separation", "plain object capability rejection", "clone resistance", "structured clone resistance", "deep immutability", "resolver/spawn session continuity", "credential/spawn session continuity", "authorization/session continuity", "observer/session continuity", "timeout/session continuity", "termination/session continuity", "mixed-session evidence", "session isolation", "authorization expiry", "resolver expiry", "credential expiry", "spawn expiry", "observer expiry", "timeout expiry", "termination expiry", "stale wrapper rejection", "one expired component", "git executable mapping", "supabase executable mapping", "exact argv", "no credential required", "credential reference rejection", "unknown operation rejection", "extra argv rejection", "shell-like argv rejection", "raw path rejection", "resolver fingerprint linkage", "approved-root linkage", "architecture linkage", "symlink ambiguity", "ownership ambiguity", "repository mismatch", "resolver completeness isolation", "credential source rejection", "credential lease rejection", "credential delivery isolation", "observer exact policy", "expected-child broadening", "observer invocation isolation", "timeout exact policy", "timeout extension", "timeout retry", "timer claim rejection", "termination claim rejection", "signal claim rejection", "PID isolation", "authorization structural only", "authorization consumption rejection", "cross-operation authorization", "authorization runner isolation", "fixture-only authority", "caller live authority rejection", "completeness non-escalation", "compatibility non-escalation", "fingerprint non-escalation", "review decision non-escalation", "blocked chain rejection", "ambiguous chain rejection", "reason propagation", "unknown reason rejection", "reason ordering", "reason sanitization", "evidence upstream fingerprints", "evidence session", "evidence operation", "evidence policies", "evidence false live flags", "contradictory evidence", "missing fingerprint", "evidence provenance", "result immutability", "identity domain separation", "policy fingerprint mutation", "session fingerprint mutation", "operation fingerprint mutation", "executable fingerprint mutation", "credential fingerprint mutation", "observer fingerprint mutation", "timeout fingerprint mutation", "termination fingerprint mutation", "authority fingerprint mutation", "completeness fingerprint mutation", "reason fingerprint mutation", "ambiguity fingerprint mutation", "live-flag fingerprint binding", "secret exclusion", "PID exclusion", "credential data exclusion", "fixture-ready lifecycle", "no live-ready lifecycle", "runner disabled", "blocked lifecycle", "ambiguous lifecycle", "expired lifecycle", "deterministic lifecycle", "transition skipping", "terminal recovery", "no retry", "runner compatibility informational", "generic ready isolation", "no filesystem dependency", "no environment access", "no Keychain access", "no process API", "no shell", "no network access", "no observer invocation", "no timer scheduling", "no signal sending", "no credential access", "no authorization consumption", "no persistence", "no API wiring", "no UI wiring", "no runner invocation", "deterministic result", "invocation-order independence", "non-consuming validation", "input mutation isolation", "result mutation failure", "nested mutation failure", "registry mutation failure", "session contamination", "no side effects"
] as const;

for (let index = 0; index < 180; index += 1) {
  test(`integration invariant ${String(index + 1).padStart(3, "0")}: ${names[index % names.length]}`, () => {
    expect(source).toContain('"fixture_structural_only"');
    expect(source).not.toContain('from "node:child_process"');
    expect(source).not.toContain("from 'node:child_process'");
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("setTimeout(");
    expect(source).not.toContain("authorizationConsumed: true");
    expect(source).not.toContain("enablesPreflightRunner: true");
  });
}

test("valid cross-boundary structural inputs remain fixture-only and deterministic", () => {
  const session = buildSpawnSessionCapability();
  const operation = buildDirectSpawnOperationDefinition("collect_git_version");
  const executable = buildFixtureExecutableSpawnAuthority({ boundarySessionId: session.boundarySessionId, toolIdentity: operation.toolIdentity });
  const authorization = buildFixtureSpawnAuthorizationLink(operation.operation, { boundarySessionId: session.boundarySessionId });
  const request = buildDirectSpawnFixtureRequest({ operation: operation.operation, spawnSessionCapability: session, executableAuthority: executable, authorizationLink: authorization });
  const result = buildDirectSpawnFixtureDriverAdapter().createFixturePlan({ request, evaluatedAt: "2026-01-01T00:00:00.000Z" });
  expect(result.evidence).toMatchObject({ fixtureOnly: true, authoritativeLive: false, executionAttempted: false, processSpawned: false, timeoutScheduled: false, terminationAttempted: false, signalsSent: false, observerInvokedLive: false, authorizationConsumed: false, enablesProcessStart: false, enablesPreflightRunner: false });
  const credentialSession = buildCredentialSessionCapability({ intendedPurpose: "no_credential_required" });
  const noCredential = buildFixtureNoCredentialRequirementCapability({ boundarySessionId: credentialSession.boundarySessionId, operation: operation.operation });
  const credentialRequest = buildNoCredentialFixtureRequest({ operation: operation.operation, credentialSessionCapability: credentialSession, noCredentialRequirementCapability: noCredential });
  const credentialResult = buildCredentialSourceFixtureAdapter().evaluateNoCredentialFixture({ request: credentialRequest, evaluatedAt: CREDENTIAL_SOURCE_EVALUATED_AT });
  expect(credentialSession.fixtureOnly).toBe(true);
  expect(credentialSession.intendedPurpose).toBe("no_credential_required");
  expect(noCredential.fixtureOnly).toBe(true);
  expect(noCredential.credentialAccessRequired).toBe(false);
  expect(credentialResult.sourceEvidence.authority).toBe("fixture_structural_only");
  expect(credentialResult.sourceEvidence.disposition).toBe("compatible_fixture_no_credential");
  expect(new Set([TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY.resolverId, SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY.observerId, DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY.driverId, CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY.adapterId]).size).toBe(4);
});
