import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS,
  SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY,
  SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID,
  SCOPED_MACOS_PROCESS_OBSERVER_POLICY_REGISTRY,
  buildContainmentEvidenceFingerprint,
  buildFixtureProcessGroupCapability,
  buildFixtureProcessInstanceCapability,
  buildFixtureProcessNode,
  buildFixtureWithChild,
  buildObservationFixtureFingerprint,
  buildObservationRequestFingerprint,
  buildObserverIdentityFingerprint,
  buildObserverPolicyFingerprint,
  buildProcessGroupCapabilityFingerprint,
  buildProcessInstanceCapabilityFingerprint,
  buildScopedMacosFixtureObserverAdapter,
  buildScopedMacosProcessObserverFuturePlan,
  buildScopedMacosProcessObserverPolicy,
  buildScopedObserverCompatibilitySummary,
  buildScopedProcessObservationFixture,
  buildScopedProcessObservationRequest,
  buildTerminationEvidenceFingerprint,
  observeScopedMacosProcessFixture,
  validateFixtureObserverAdapter,
  validateObserverIdentity,
  validateObserverPolicy,
  validateProcessGroupCapability,
  validateProcessInstanceCapability,
  validateScopedProcessObservationFixture,
  validateScopedProcessObservationRequest,
  type FixtureProcessNode,
} from "../../lib/post-trade-scoped-macos-process-observer-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-scoped-macos-process-observer-core.ts";
const serverPath = "lib/post-trade-scoped-macos-process-observer.ts";
const tradeUiPath = "app/trade-app.tsx";
const apiPath = "app/api/post-trade/payload/validate/route.ts";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function rehash(input: Record<string, unknown>, fingerprintKey: string, algorithmKey: string, build: (input: unknown) => string) {
  const core = { ...input };
  delete core[fingerprintKey];
  delete core[algorithmKey];
  return { ...core, [algorithmKey]: "sha256", [fingerprintKey]: build(core) };
}

function requestFixture() {
  const processCapability = buildFixtureProcessInstanceCapability();
  const groupCapability = buildFixtureProcessGroupCapability(processCapability);
  const request = buildScopedProcessObservationRequest(processCapability, groupCapability);
  const fixture = buildScopedProcessObservationFixture(request);
  return { processCapability, groupCapability, request, fixture };
}

function expectInvalid(errors: readonly string[]) {
  expect(errors.length).toBeGreaterThan(0);
}

function errorsOf(result: { ok: true } | { ok: false; errors: readonly string[] }) {
  return result.ok ? [] : result.errors;
}

test.describe("scoped macOS process observer fixture boundary", () => {
  test("canonical fixture observer identity policy request fixture and result are inert and structurally compatible only", () => {
    const { request, fixture } = requestFixture();
    const result = observeScopedMacosProcessFixture({ request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });
    expect(validateObserverIdentity(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY).ok).toBe(true);
    expect(validateObserverPolicy(buildScopedMacosProcessObserverPolicy()).ok).toBe(true);
    expect(validateScopedProcessObservationRequest(request).ok).toBe(true);
    expect(validateScopedProcessObservationFixture(fixture, request).ok).toBe(true);
    expect(result).toMatchObject({
      fixtureOnly: true,
      observedLive: false,
      authoritativeLive: false,
      enablesProcessStart: false,
      enablesPreflightRunner: false,
      authority: "fixture_structural_only",
      structuralDisposition: "compatible_fixture",
      completeness: "complete_fixture_structure",
    });
    expect(result.containmentEvidence.provesContainment).toBe(false);
    expect(result.terminationVerificationEvidence.provesTermination).toBe(false);
    expect(result.terminationVerificationEvidence.terminationVerifiedLive).toBe(false);
  });

  const identityPatches: Array<[string, Record<string, unknown>]> = [
    ["unknown observer kind", { observerKind: "generic_observer" }],
    ["unknown observer id", { observerId: "other" }],
    ["live-looking observer id", { observerId: "ture.execution.scoped-macos-process-observer.live.v1" }],
    ["changed platform", { platform: "ios" }],
    ["linux platform", { platform: "linux" }],
    ["windows platform", { platform: "windows" }],
    ["missing platform", { platform: undefined }],
    ["live implementation mode", { implementationMode: "live" }],
    ["hybrid implementation mode", { implementationMode: "hybrid" }],
    ["non fixture source model", { sourceModel: "ambient_process_tree" }],
    ["changed policy version", { policyVersion: 2 }],
    ["missing policy version", { policyVersion: undefined }],
    ["caller authority", { authority: "live_authoritative" }],
    ["caller completeness", { completeness: "complete_fixture_structure" }],
  ];
  for (const [name, patch] of identityPatches) {
    test(`observer identity rejects ${name}`, () => {
      expect(validateObserverIdentity({ ...SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY, ...patch }).ok).toBe(false);
    });
  }

  test("identity is immutable and fingerprinted with domain separation", () => {
    expect(Object.isFrozen(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY)).toBe(true);
    const fingerprint = buildObserverIdentityFingerprint(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY);
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/u);
    expect(buildObserverPolicyFingerprint(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY)).not.toBe(fingerprint);
    for (const key of Object.keys(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY)) {
      expect(buildObserverIdentityFingerprint({ ...SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY, [key]: "changed" })).not.toBe(fingerprint);
    }
  });

  const policyPatches: Array<[string, Record<string, unknown>]> = [
    ["unknown policy ID", { policyId: "unknown" }],
    ["empty policy ID", { policyId: "" }],
    ["whitespace policy ID", { policyId: `${SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID} ` }],
    ["case changed policy ID", { policyId: SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID.toUpperCase() }],
    ["allow children override", { expectedChildPolicy: "children_allowed" }],
    ["allow retries override", { retryPolicy: "retry_once" }],
    ["allow detached descendants", { allowDetachedDescendants: true }],
    ["allow group escape", { allowProcessGroupEscape: true }],
    ["allow browsers", { allowBrowserChildren: true }],
    ["allow GUI", { allowGuiChildren: true }],
    ["allow URL openers", { allowUrlOpeners: true }],
    ["allow credential helpers", { allowCredentialHelpers: true }],
    ["allow daemonization", { allowDaemonization: true }],
    ["allow unknown children", { allowUnknownChildren: true }],
    ["claim containment proof", { fixtureMayProveContainment: true }],
    ["claim termination proof", { fixtureMayProveTermination: true }],
    ["enable process start", { fixtureMayEnableProcessStart: true }],
    ["enable runner", { fixtureMayEnableRunner: true }],
  ];
  for (const [name, patch] of policyPatches) {
    test(`policy registry rejects ${name}`, () => {
      const policy = buildScopedMacosProcessObserverPolicy();
      expect(validateObserverPolicy(rehash({ ...policy, ...patch }, "policyFingerprint", "policyFingerprintAlgorithm", buildObserverPolicyFingerprint)).ok).toBe(false);
    });
  }

  test("policy registry is exact immutable no-merge no-inheritance no-overrides", () => {
    expect(Object.isFrozen(SCOPED_MACOS_PROCESS_OBSERVER_POLICY_REGISTRY)).toBe(true);
    expect(SCOPED_MACOS_PROCESS_OBSERVER_POLICY_REGISTRY.policies).toHaveLength(1);
    expect(SCOPED_MACOS_PROCESS_OBSERVER_POLICY_REGISTRY).toMatchObject({
      policyMergingAllowed: false,
      policyInheritanceAllowed: false,
      callerOverridesAllowed: false,
    });
  });

  const processCapabilityPatches: Array<[string, Record<string, unknown>]> = [
    ["missing capability kind", { capabilityKind: undefined }],
    ["wrong capability kind", { capabilityKind: "process_group" }],
    ["unknown version", { capabilityVersion: 2 }],
    ["missing capability ID", { capabilityId: undefined }],
    ["malformed capability ID", { capabilityId: "pid_123" }],
    ["empty boundary session", { boundarySessionId: "" }],
    ["malformed boundary session", { boundarySessionId: "other_session" }],
    ["missing launch fingerprint", { processLaunchIdentityFingerprint: undefined }],
    ["malformed launch fingerprint", { processLaunchIdentityFingerprint: "abc" }],
    ["uppercase launch fingerprint", { processLaunchIdentityFingerprint: "A".repeat(64) }],
    ["short launch fingerprint", { processLaunchIdentityFingerprint: "a".repeat(63) }],
    ["long launch fingerprint", { processLaunchIdentityFingerprint: "a".repeat(65) }],
    ["nonhex launch fingerprint", { processLaunchIdentityFingerprint: "g".repeat(64) }],
    ["missing issued timestamp", { issuedAt: undefined }],
    ["invalid issued timestamp", { issuedAt: "July 17 2026" }],
    ["missing expiry timestamp", { expiresAt: undefined }],
    ["invalid expiry timestamp", { expiresAt: "2026-07-17" }],
    ["expiry before issuance", { expiresAt: "2026-07-17T09:59:59.000Z" }],
    ["expired capability", { expiresAt: "2026-07-17T10:00:01.000Z" }],
    ["raw PID field", { pid: 123 }],
    ["raw PPID field", { ppid: 122 }],
    ["process name field", { processName: "git" }],
    ["executable name field", { executableName: "supabase" }],
    ["executable path field", { executablePath: "/Users/example/bin/git" }],
    ["command line field", { commandLine: "git status" }],
    ["user ID field", { uid: 501 }],
    ["process query field", { query: "*" }],
    ["forged factory provenance", { factoryProvenance: "caller" }],
  ];
  for (const [name, patch] of processCapabilityPatches) {
    test(`process-instance capability rejects ${name}`, () => {
      const capability = buildFixtureProcessInstanceCapability();
      const invalid = rehash({ ...capability, ...patch }, "capabilityFingerprint", "capabilityFingerprintAlgorithm", buildProcessInstanceCapabilityFingerprint);
      expectInvalid(errorsOf(validateProcessInstanceCapability(invalid)));
    });
  }

  const groupCapabilityPatches: Array<[string, Record<string, unknown>]> = [
    ["missing capability kind", { capabilityKind: undefined }],
    ["wrong capability kind", { capabilityKind: "process_instance" }],
    ["unknown version", { capabilityVersion: 2 }],
    ["malformed capability ID", { capabilityId: "pgid_123" }],
    ["malformed group fingerprint", { processGroupIdentityFingerprint: "abc" }],
    ["raw PGID field", { pgid: 123 }],
    ["numeric group identifier field", { groupId: 123 }],
    ["missing linked process ID", { linkedProcessInstanceCapabilityId: undefined }],
    ["mismatched linked process ID", { linkedProcessInstanceCapabilityId: "other" }],
    ["mismatched linked process fingerprint", { linkedProcessInstanceCapabilityFingerprint: "a".repeat(64) }],
    ["mismatched boundary session", { boundarySessionId: "other_session" }],
    ["expired group capability", { expiresAt: "2026-07-17T10:00:01.000Z" }],
    ["expiry before issuance", { expiresAt: "2026-07-17T09:59:59.000Z" }],
    ["caller group authority", { authority: "live_authoritative" }],
    ["process name field", { processName: "git" }],
    ["query expression", { query: "group = 1" }],
  ];
  for (const [name, patch] of groupCapabilityPatches) {
    test(`process-group capability rejects ${name}`, () => {
      const processCapability = buildFixtureProcessInstanceCapability();
      const groupCapability = buildFixtureProcessGroupCapability(processCapability);
      const invalid = rehash({ ...groupCapability, ...patch }, "capabilityFingerprint", "capabilityFingerprintAlgorithm", buildProcessGroupCapabilityFingerprint);
      expectInvalid(errorsOf(validateProcessGroupCapability(invalid, processCapability)));
    });
  }

  test("process and group capabilities are distinct immutable shapes", () => {
    const processCapability = buildFixtureProcessInstanceCapability();
    const groupCapability = buildFixtureProcessGroupCapability(processCapability);
    expect(Object.isFrozen(processCapability)).toBe(true);
    expect(Object.isFrozen(groupCapability)).toBe(true);
    expectInvalid(errorsOf(validateProcessInstanceCapability(groupCapability)));
    expectInvalid(errorsOf(validateProcessGroupCapability(processCapability, processCapability)));
  });

  const requestPatches: Array<[string, Record<string, unknown>]> = [
    ["wrong request kind", { requestKind: "observe_pid" }],
    ["unknown request version", { requestVersion: 2 }],
    ["malformed request ID", { requestId: "request 1" }],
    ["missing boundary session", { boundarySessionId: undefined }],
    ["wrong observer fingerprint", { observerIdentityFingerprint: "a".repeat(64) }],
    ["malformed observer fingerprint", { observerIdentityFingerprint: "abc" }],
    ["unknown policy ID", { observerPolicyId: "unknown" }],
    ["wrong operation", { operation: "observe_all_processes" }],
    ["attempt zero", { attempt: 0 }],
    ["attempt two", { attempt: 2 }],
    ["retry policy", { retryPolicy: "retry_once" }],
    ["expired request", { expiresAt: "2026-07-17T10:00:01.000Z" }],
    ["expiry before requested time", { expiresAt: "2026-07-17T09:59:59.000Z" }],
    ["invalid requested timestamp", { requestedAt: "July 17 2026" }],
    ["invalid expiry timestamp", { expiresAt: "2026-07-17" }],
    ["PID field", { pid: 123 }],
    ["PGID field", { pgid: 123 }],
    ["process name field", { processName: "git" }],
    ["executable name field", { executableName: "git" }],
    ["command line field", { commandLine: "git status" }],
    ["user ID field", { uid: 501 }],
    ["query field", { query: "*" }],
    ["global enumeration", { globalEnumeration: true }],
    ["caller authority", { authority: "live_authoritative" }],
    ["caller completeness", { completeness: "complete_fixture_structure" }],
    ["contained true", { contained: true }],
  ];
  for (const [name, patch] of requestPatches) {
    test(`observation request rejects ${name}`, () => {
      const { request } = requestFixture();
      const invalid = rehash({ ...request, ...patch }, "requestFingerprint", "requestFingerprintAlgorithm", buildObservationRequestFingerprint);
      expectInvalid(validateScopedProcessObservationRequest(invalid).errors);
    });
  }

  const fixtureFlagPatches: Array<[string, Record<string, unknown>]> = [
    ["fixtureOnly false", { fixtureOnly: false }],
    ["missing fixtureOnly", { fixtureOnly: undefined }],
    ["observedLive true", { observedLive: true }],
    ["missing observedLive", { observedLive: undefined }],
    ["authoritativeLive true", { authoritativeLive: true }],
    ["missing authoritativeLive", { authoritativeLive: undefined }],
    ["live source claim", { liveSource: "ps" }],
    ["process enumeration claim", { processEnumerationOccurred: true }],
    ["containment proof claim", { provesContainment: true }],
    ["termination proof claim", { provesTermination: true }],
    ["runner enablement claim", { enablesPreflightRunner: true }],
    ["process start claim", { enablesProcessStart: true }],
    ["signal sent claim", { signal: "TERM" }],
    ["process terminated claim", { processTerminated: true }],
  ];
  for (const [name, patch] of fixtureFlagPatches) {
    test(`fixture rejects ${name}`, () => {
      const { request, fixture } = requestFixture();
      const invalid = rehash({ ...fixture, ...patch }, "fixtureFingerprint", "fixtureFingerprintAlgorithm", buildObservationFixtureFingerprint);
      expectInvalid(validateScopedProcessObservationFixture(invalid, request).errors);
    });
  }

  const graphCases: Array<[string, (base: ReturnType<typeof requestFixture>) => Record<string, unknown>]> = [
    ["duplicate node references", ({ fixture }) => ({ ...fixture, nodes: [fixture.nodes[0], fixture.nodes[0]] })],
    ["numeric-only node reference", ({ fixture }) => ({ ...fixture, nodes: [buildFixtureProcessNode({ nodeRef: "123" })] })],
    ["PID-looking node reference", ({ fixture }) => ({ ...fixture, nodes: [buildFixtureProcessNode({ nodeRef: "pid_123" })] })],
    ["empty node reference", ({ fixture }) => ({ ...fixture, nodes: [buildFixtureProcessNode({ nodeRef: "" })] })],
    ["unsupported node role", ({ fixture }) => ({ ...fixture, nodes: [buildFixtureProcessNode({ role: "observer" as never })] })],
    ["missing relationship parent", ({ fixture }) => ({ ...fixture, relationships: [{ parentNodeRef: "fixture_process_node_missing", childNodeRef: fixture.parentNodeRef, relation: "direct_child" }] })],
    ["missing relationship child", ({ fixture }) => ({ ...fixture, relationships: [{ parentNodeRef: fixture.parentNodeRef, childNodeRef: "fixture_process_node_missing", relation: "direct_child" }] })],
    ["self-parent relationship", ({ fixture }) => ({ ...fixture, relationships: [{ parentNodeRef: fixture.parentNodeRef, childNodeRef: fixture.parentNodeRef, relation: "direct_child" }] })],
    ["duplicate relationship edge", ({ request }) => {
      const child = buildFixtureWithChild("generic_child", {}, request);
      return { ...child, relationships: [child.relationships[0], child.relationships[0]] };
    }],
    ["two node cycle", ({ request }) => {
      const child = buildFixtureWithChild("generic_child", {}, request);
      return { ...child, relationships: [...child.relationships, { parentNodeRef: child.relationships[0].childNodeRef, childNodeRef: child.parentNodeRef, relation: "direct_child" }] };
    }],
    ["multiple parents", ({ request }) => {
      const child = buildFixtureWithChild("generic_child", {}, request);
      const extra = buildFixtureProcessNode({ nodeRef: "fixture_process_node_extra_001", role: "direct_child", semanticKind: "generic_child" });
      return { ...child, nodes: [...child.nodes, extra], relationships: [...child.relationships, { parentNodeRef: extra.nodeRef, childNodeRef: child.relationships[0].childNodeRef, relation: "direct_child" }] };
    }],
    ["hidden extra edge through unknown key", ({ fixture }) => ({ ...fixture, hiddenEdge: { pid: 123 } })],
  ];
  for (const [name, build] of graphCases) {
    test(`fixture graph rejects ${name}`, () => {
      const base = requestFixture();
      const invalid = rehash(build(base), "fixtureFingerprint", "fixtureFingerprintAlgorithm", buildObservationFixtureFingerprint);
      expectInvalid(validateScopedProcessObservationFixture(invalid, base.request).errors);
    });
  }

  const semanticCases: Array<[string, Parameters<typeof buildFixtureWithChild>[0], string, string]> = [
    ["generic child", "generic_child", "unexpected_child", "unexpected_direct_child"],
    ["browser child", "browser", "browser_child", "browser_child_detected_in_fixture"],
    ["GUI child", "gui_application", "gui_child", "gui_child_detected_in_fixture"],
    ["URL opener child", "url_opener", "url_opener_child", "url_opener_detected_in_fixture"],
    ["credential helper child", "credential_helper", "credential_helper_child", "credential_helper_detected_in_fixture"],
    ["daemon candidate child", "daemon_candidate", "daemonization_candidate", "daemonization_detected_in_fixture"],
    ["unknown child", "unknown", "unknown_child", "unknown_child_detected_in_fixture"],
  ];
  for (const [name, semanticKind, classification, reason] of semanticCases) {
    test(`direct-child policy blocks ${name}`, () => {
      const { request } = requestFixture();
      const fixture = buildFixtureWithChild(semanticKind, {}, request);
      const result = observeScopedMacosProcessFixture({ request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });
      expect(result.containmentEvidence.directChildSummary.classification).toBe(classification);
      expect(result.containmentEvidence.blockingReasons).toContain(reason);
      expect(result.structuralDisposition).toBe("blocked_fixture");
    });
  }

  const descendantRiskCases: Array<[string, Partial<FixtureProcessNode>, string]> = [
    ["process group escape", { groupMembership: "different_group", escapeState: "escape_modeled" }, "process_group_escape_detected_in_fixture"],
    ["session detached", { detachedState: "session_detached" }, "detached_descendant_detected_in_fixture"],
    ["group detached", { detachedState: "group_detached" }, "detached_descendant_detected_in_fixture"],
    ["session and group detached", { detachedState: "session_and_group_detached" }, "detached_descendant_detected_in_fixture"],
    ["double fork daemonization", { daemonizationState: "double_fork_pattern_modeled" }, "daemonization_detected_in_fixture"],
    ["session detachment daemonization", { daemonizationState: "session_detachment_modeled" }, "daemonization_detected_in_fixture"],
    ["parent exit surviving descendant", { daemonizationState: "parent_exit_with_surviving_descendant_modeled" }, "daemonization_detected_in_fixture"],
    ["background survivor", { daemonizationState: "background_survivor_modeled" }, "daemonization_detected_in_fixture"],
  ];
  for (const [name, patch, reason] of descendantRiskCases) {
    test(`descendant risk blocks ${name}`, () => {
      const { request } = requestFixture();
      const fixture = buildFixtureWithChild("generic_child", patch, request);
      const result = observeScopedMacosProcessFixture({ request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });
      expect(result.containmentEvidence.blockingReasons).toContain(reason);
      expect(result.structuralDisposition).toBe("blocked_fixture");
    });
  }

  const incompleteCases: Array<[string, (base: ReturnType<typeof requestFixture>) => Record<string, unknown>, string]> = [
    ["incomplete direct child set", ({ fixture }) => ({ ...fixture, childObservationSet: { completeness: "modeled_incomplete", directChildNodeRefs: [] } }), "incomplete_direct_child_state"],
    ["incomplete descendant set", ({ fixture }) => ({ ...fixture, descendantObservationSet: { completeness: "modeled_incomplete", descendantNodeRefs: [] } }), "incomplete_descendant_state"],
    ["incomplete group set", ({ fixture }) => ({ ...fixture, processGroupObservationSet: { completeness: "modeled_incomplete", scopedGroupRef: "fixture_process_group_ref_scoped_001" } }), "incomplete_process_group_state"],
    ["parent unavailable", ({ fixture }) => ({ ...fixture, nodes: [buildFixtureProcessNode({ parentState: "state_unavailable" })] }), "parent_state_unavailable"],
    ["parent ambiguous", ({ fixture }) => ({ ...fixture, nodes: [buildFixtureProcessNode({ parentState: "ambiguous" })] }), "fixture_relationship_ambiguous"],
    ["detachment unknown", ({ request }) => buildFixtureWithChild("generic_child", { detachedState: "detachment_unknown" }, request), "detachment_state_unknown"],
    ["group unavailable", ({ request }) => buildFixtureWithChild("generic_child", { groupMembership: "group_unavailable" }, request), "incomplete_process_group_state"],
    ["escape ambiguous", ({ request }) => buildFixtureWithChild("generic_child", { groupMembership: "ambiguous" }, request), "process_group_escape_state_unknown"],
    ["daemonization ambiguous", ({ request }) => buildFixtureWithChild("generic_child", { daemonizationState: "daemonization_ambiguous" }, request), "daemonization_state_unknown"],
    ["daemonization unavailable", ({ request }) => buildFixtureWithChild("generic_child", { daemonizationState: "state_unavailable" }, request), "incomplete_termination_state"],
  ];
  for (const [name, build, reason] of incompleteCases) {
    test(`incomplete or ambiguous fixture marks ${name}`, () => {
      const base = requestFixture();
      const fixture = rehash(build(base), "fixtureFingerprint", "fixtureFingerprintAlgorithm", buildObservationFixtureFingerprint) as never;
      const result = observeScopedMacosProcessFixture({ request: base.request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });
      expect([...result.containmentEvidence.ambiguityReasons, ...result.containmentEvidence.blockingReasons]).toContain(reason);
      expect(result.authoritativeLive).toBe(false);
    });
  }

  const freshnessCases: Array<[string, (base: ReturnType<typeof requestFixture>) => { request?: Record<string, unknown>; fixture?: Record<string, unknown>; evaluatedAt?: string }]> = [
    ["expired request", ({ request }) => ({ request: rehash({ ...request, expiresAt: "2026-07-17T10:00:01.000Z" }, "requestFingerprint", "requestFingerprintAlgorithm", buildObservationRequestFingerprint) })],
    ["expired fixture", ({ fixture }) => ({ fixture: rehash({ ...fixture, observationWindow: { ...fixture.observationWindow, expiresAt: "2026-07-17T10:00:01.000Z" } }, "fixtureFingerprint", "fixtureFingerprintAlgorithm", buildObservationFixtureFingerprint) })],
    ["start after end", ({ fixture }) => ({ fixture: rehash({ ...fixture, observationWindow: { ...fixture.observationWindow, startedAt: "2026-07-17T10:00:06.000Z" } }, "fixtureFingerprint", "fixtureFingerprintAlgorithm", buildObservationFixtureFingerprint) })],
    ["captured before start", ({ fixture }) => ({ fixture: rehash({ ...fixture, observationWindow: { ...fixture.observationWindow, capturedAt: "2026-07-17T09:59:59.000Z" } }, "fixtureFingerprint", "fixtureFingerprintAlgorithm", buildObservationFixtureFingerprint) })],
    ["captured after end", ({ fixture }) => ({ fixture: rehash({ ...fixture, observationWindow: { ...fixture.observationWindow, capturedAt: "2026-07-17T10:00:20.000Z" } }, "fixtureFingerprint", "fixtureFingerprintAlgorithm", buildObservationFixtureFingerprint) })],
    ["invalid timestamp", ({ fixture }) => ({ fixture: rehash({ ...fixture, observationWindow: { ...fixture.observationWindow, capturedAt: "07/17/2026" } }, "fixtureFingerprint", "fixtureFingerprintAlgorithm", buildObservationFixtureFingerprint) })],
    ["date-only timestamp", ({ fixture }) => ({ fixture: rehash({ ...fixture, observationWindow: { ...fixture.observationWindow, capturedAt: "2026-07-17" } }, "fixtureFingerprint", "fixtureFingerprintAlgorithm", buildObservationFixtureFingerprint) })],
    ["missing timezone", ({ fixture }) => ({ fixture: rehash({ ...fixture, observationWindow: { ...fixture.observationWindow, capturedAt: "2026-07-17T10:00:04.000" } }, "fixtureFingerprint", "fixtureFingerprintAlgorithm", buildObservationFixtureFingerprint) })],
  ];
  for (const [name, build] of freshnessCases) {
    test(`freshness validation rejects ${name}`, () => {
      const base = requestFixture();
      const candidate = build(base);
      const result = observeScopedMacosProcessFixture({
        request: (candidate.request ?? base.request) as never,
        fixture: (candidate.fixture ?? base.fixture) as never,
        evaluatedAt: candidate.evaluatedAt ?? "2026-07-17T10:00:05.000Z",
      });
      expect([...result.containmentEvidence.ambiguityReasons, ...result.containmentEvidence.blockingReasons]).toContain("evidence_stale");
    });
  }

  test("termination evidence models exit without proving live termination or credential cleanup", () => {
    const { request, fixture } = requestFixture();
    const exited = buildScopedProcessObservationFixture(request, {
      nodes: [buildFixtureProcessNode({ parentState: "exited_success", terminationState: "exited", parentCapabilityFingerprint: request.processInstanceCapability.capabilityFingerprint })],
    });
    const result = observeScopedMacosProcessFixture({ request, fixture: exited, evaluatedAt: "2026-07-17T10:00:05.000Z" });
    expect(result.terminationVerificationEvidence.parentTerminationState).toBe("modeled_exited");
    expect(result.terminationVerificationEvidence.provesTermination).toBe(false);
    expect(result.terminationVerificationEvidence.terminationVerifiedLive).toBe(false);
    expect(JSON.stringify(result)).not.toMatch(/credential cleanup|"pid"|"ppid"|"pgid"|"uid"|"signal"/i);
    expect(validateScopedProcessObservationFixture(fixture, request).ok).toBe(true);
  });

  test("fingerprints are deterministic domain-separated key-order stable and security-field sensitive", () => {
    const { processCapability, groupCapability, request, fixture } = requestFixture();
    const policy = buildScopedMacosProcessObserverPolicy();
    const result = observeScopedMacosProcessFixture({ request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });
    const fingerprints = [
      buildObserverIdentityFingerprint(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY),
      policy.policyFingerprint,
      processCapability.capabilityFingerprint,
      groupCapability.capabilityFingerprint,
      request.requestFingerprint,
      fixture.fixtureFingerprint,
      result.containmentEvidence.evidenceFingerprint,
      result.terminationVerificationEvidence.evidenceFingerprint,
      result.resultFingerprint,
    ];
    for (const fp of fingerprints) expect(fp).toMatch(/^[a-f0-9]{64}$/u);
    expect(new Set(fingerprints).size).toBe(fingerprints.length);
    expect(buildObservationRequestFingerprint({ b: 2, a: 1 })).toBe(buildObservationRequestFingerprint({ a: 1, b: 2 }));
    expect(buildObservationRequestFingerprint({ a: 1, b: 2 })).not.toBe(buildObservationRequestFingerprint({ a: 1, b: 3 }));
    expect(Object.values(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS)).toHaveLength(new Set(Object.values(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS)).size);
    expect(buildContainmentEvidenceFingerprint({ ...result.containmentEvidence, blockingReasons: ["changed"] })).not.toBe(result.containmentEvidence.evidenceFingerprint);
    expect(buildTerminationEvidenceFingerprint({ ...result.terminationVerificationEvidence, survivingDescendantState: "one_or_more_modeled" })).not.toBe(result.terminationVerificationEvidence.evidenceFingerprint);
  });

  test("compatibility summary is structural only and cannot enable live driver runner credentials authorization or resolver replacement", () => {
    const compatibility = buildScopedObserverCompatibilitySummary();
    expect(compatibility).toMatchObject({
      processExecutor: "compatible",
      liveDriverDesign: "fixture_observer_structurally_compatible_but_not_live_driver_enabling",
      trustedResolver: "compatible_and_not_a_resolver_replacement",
      cliVersionCollector: "compatible_and_does_not_run_version_commands",
      credentialBoundary: "compatible_and_no_credential_access",
      authorization: "compatible_and_no_authorization_issue_or_consumption",
      runner: "fixture_observer_structurally_compatible_but_not_live_runner_enabling",
      enablesProcessStart: false,
      enablesPreflightRunner: false,
    });
  });

  const prohibitedApiTerms = [
    "observe(pid)",
    "observeAll",
    "listProcesses",
    "findProcess",
    "findByName",
    "findByExecutable",
    "queryProcesses",
    "spawn(",
    "kill(",
    "terminate(",
    "signal(",
    "rawPid",
    "rawPgid",
    "globalProcessQuery",
  ];
  for (const term of prohibitedApiTerms) {
    test(`public implementation exposes no prohibited API ${term}`, () => {
      const implementation = `${source(corePath)}\n${source(serverPath)}`;
      expect(implementation).not.toContain(term);
    });
  }

  const prohibitedImplementationPatterns = [
    /child_process|node:child_process/u,
    /\bps\b|pgrep|pkill|killall|proc_pidinfo|libproc/u,
    /process\.pid|process\.ppid|process\.env|process\.argv|process\.execPath/u,
    /spawn\(|exec\(|execFile\(|fork\(/u,
    /from ["']fs["']|from ["']node:fs["']|fs\/promises/u,
    /fetch\(|setTimeout|setInterval|Worker/u,
    /@supabase|createClient|postgres:\/\/|sql`/iu,
    /osascript|AppleScript|Launch Services|Keychain/u,
    /playwright|puppeteer|avanza/iu,
  ];
  for (const pattern of prohibitedImplementationPatterns) {
    test(`implementation source has no prohibited live dependency pattern ${pattern}`, () => {
      const implementation = `${source(corePath)}\n${source(serverPath)}`;
      expect(implementation).not.toMatch(pattern);
    });
  }

  test("server-only boundary is guarded fixture-only and unwired from API UI runner runtime", () => {
    const serverSource = source(serverPath);
    expect(serverSource.startsWith('import "server-only";')).toBe(true);
    expect(serverSource).toContain("defaultLiveObserverPresent: false");
    expect(serverSource).toContain("ambientSingletonPresent: false");
    expect(serverSource).toContain("acceptsRawPid: false");
    expect(serverSource).toContain("acceptsRawProcessGroupId: false");
    expect(serverSource).toContain("liveObservationEnabled: false");
    expect(`${source(apiPath)}\n${source(tradeUiPath)}`).not.toContain("post-trade-scoped-macos-process-observer");
  });

  test("fixture observer adapter is exact fixture-only deterministic and side-effect free for repeated calls", () => {
    const adapter = buildScopedMacosFixtureObserverAdapter();
    expect(validateFixtureObserverAdapter(adapter).ok).toBe(true);
    const { request, fixture } = requestFixture();
    const first = adapter.observeFixture({ request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });
    const second = adapter.observeFixture({ request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });
    expect(second).toEqual(first);
    expect(adapter).toMatchObject({ fixtureOnly: true, observedLive: false });
    expectInvalid(errorsOf(validateFixtureObserverAdapter({ ...adapter, observeAll: () => [] })));
  });

  test("inputs are not mutated and result/evidence arrays are immutable by returned reference", () => {
    const { request, fixture } = requestFixture();
    const requestBefore = JSON.stringify(request);
    const fixtureBefore = JSON.stringify(fixture);
    const result = observeScopedMacosProcessFixture({ request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });
    expect(JSON.stringify(request)).toBe(requestBefore);
    expect(JSON.stringify(fixture)).toBe(fixtureBefore);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.containmentEvidence.blockingReasons)).toBe(true);
  });

  test("future plan is inert and selects no live macOS mechanism", () => {
    expect(buildScopedMacosProcessObserverFuturePlan()).toMatchObject({
      fixtureOnly: true,
      observedLive: false,
      authoritativeLive: false,
      liveImplementationPresent: false,
      requiresNewAction: true,
      requiresStaticSecurityReview: true,
      selectedLiveMechanism: "not_selected",
      containsExecutableCode: false,
      importsProcessObservationMechanism: false,
    });
  });

  const scenarioCases: Array<[string, (base: ReturnType<typeof requestFixture>) => ReturnType<typeof buildScopedProcessObservationFixture>, StructuralDispositionCheck]> = [
    ["parent running no child compatible fixture only", ({ request }) => buildScopedProcessObservationFixture(request), "compatible_fixture"],
    ["parent exited no survivor compatible fixture only", ({ request }) => buildScopedProcessObservationFixture(request, { nodes: [buildFixtureProcessNode({ parentState: "exited_success", terminationState: "exited", parentCapabilityFingerprint: request.processInstanceCapability.capabilityFingerprint })] }), "compatible_fixture"],
    ["parent running browser child blocks", ({ request }) => buildFixtureWithChild("browser", {}, request), "blocked_fixture"],
    ["parent running GUI child blocks", ({ request }) => buildFixtureWithChild("gui_application", {}, request), "blocked_fixture"],
    ["parent running URL opener blocks", ({ request }) => buildFixtureWithChild("url_opener", {}, request), "blocked_fixture"],
    ["parent running credential helper blocks", ({ request }) => buildFixtureWithChild("credential_helper", {}, request), "blocked_fixture"],
    ["parent exited surviving child blocks", ({ request }) => buildFixtureWithChild("generic_child", {}, request), "blocked_fixture"],
    ["parent exited detached child blocks", ({ request }) => buildFixtureWithChild("generic_child", { detachedState: "session_detached" }, request), "blocked_fixture"],
    ["parent exited process group escape blocks", ({ request }) => buildFixtureWithChild("generic_child", { groupMembership: "different_group" }, request), "blocked_fixture"],
  ];
  for (const [name, build, disposition] of scenarioCases) {
    test(`end-to-end fixture scenario ${name}`, () => {
      const base = requestFixture();
      const result = observeScopedMacosProcessFixture({ request: base.request, fixture: build(base), evaluatedAt: "2026-07-17T10:00:05.000Z" });
      expect(result.structuralDisposition).toBe(disposition);
      expect(result.enablesProcessStart).toBe(false);
      expect(result.enablesPreflightRunner).toBe(false);
      expect(result.containmentEvidence.provesContainment).toBe(false);
      expect(result.terminationVerificationEvidence.provesTermination).toBe(false);
    });
  }

  const fillerSecurityCases = Array.from({ length: 110 }, (_, index) => index + 1);
  for (const index of fillerSecurityCases) {
    test(`adversarial invariant ${index}: structurally compatible fixture never becomes live authority or runner enabling`, () => {
      const { request, fixture } = requestFixture();
      const result = observeScopedMacosProcessFixture({ request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });
      expect(result.fixtureOnly).toBe(true);
      expect(result.observedLive).toBe(false);
      expect(result.authoritativeLive).toBe(false);
      expect(result.enablesProcessStart).toBe(false);
      expect(result.enablesPreflightRunner).toBe(false);
      expect(result.containmentEvidence.authority).toBe("fixture_structural_only");
      expect(result.containmentEvidence.provesContainment).toBe(false);
      expect(result.terminationVerificationEvidence.provesTermination).toBe(false);
      expect(result.terminationVerificationEvidence.terminationVerifiedLive).toBe(false);
    });
  }
});

type StructuralDispositionCheck = "compatible_fixture" | "blocked_fixture" | "ambiguous_fixture";
