import { createHash } from "node:crypto";

import { POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION } from "@/lib/post-trade-live-read-only-macos-process-driver-design";

export const SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY = deepFreeze({
  observerKind: "scoped_macos_process_observer",
  observerId: "ture.execution.scoped-macos-process-observer.fixture.v1",
  platform: "macos",
  implementationMode: "fixture_only",
  sourceModel: "injected_fixture",
  policyVersion: 1,
} as const);

export const SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID = "first_live_read_only_no_expected_children_v1" as const;
export const SCOPED_MACOS_PROCESS_OBSERVER_OPERATION = "observe_scoped_process_lifecycle" as const;
export const SCOPED_MACOS_PROCESS_OBSERVER_EVALUATED_AT = "2026-07-17T10:00:05.000Z" as const;
export const SCOPED_MACOS_PROCESS_OBSERVER_ISSUED_AT = "2026-07-17T10:00:00.000Z" as const;
export const SCOPED_MACOS_PROCESS_OBSERVER_EXPIRES_AT = "2026-07-17T10:00:30.000Z" as const;

const PROCESS_INSTANCE_CAPABILITY_PROVENANCE = new WeakSet<object>();
const PROCESS_GROUP_CAPABILITY_PROVENANCE = new WeakSet<object>();

export const SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:scoped-macos-process-observer:identity:v1",
  policy: "ture:scoped-macos-process-observer:policy:v1",
  processInstanceCapability: "ture:scoped-macos-process-observer:process-instance-capability:v1",
  processGroupCapability: "ture:scoped-macos-process-observer:process-group-capability:v1",
  request: "ture:scoped-macos-process-observer:request:v1",
  fixture: "ture:scoped-macos-process-observer:fixture:v1",
  containmentEvidence: "ture:scoped-macos-process-observer:containment-evidence:v1",
  terminationEvidence: "ture:scoped-macos-process-observer:termination-evidence:v1",
  compatibility: "ture:scoped-macos-process-observer:compatibility:v1",
  result: "ture:scoped-macos-process-observer:result:v1",
} as const);

export type ScopedObserverValidationResult<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; errors: readonly string[] }>;
export type ObserverAuthorityClassification = "fixture_structural_only" | "live_non_authoritative" | "live_authoritative";
export type ObservationCompletenessClassification =
  | "complete_fixture_structure"
  | "incomplete_parent_state"
  | "incomplete_direct_child_state"
  | "incomplete_descendant_state"
  | "incomplete_process_group_state"
  | "incomplete_termination_state"
  | "incomplete_multiple"
  | "contradictory"
  | "unsupported";
export type ScopedObserverLifecycleState =
  | "request_validated"
  | "fixture_snapshot_accepted"
  | "fixture_snapshot_rejected"
  | "classification_completed"
  | "structurally_compatible"
  | "structurally_blocked"
  | "structurally_ambiguous"
  | "expired"
  | "incomplete"
  | "unsupported";
export type ParentProcessState =
  | "not_observed"
  | "running_expected_identity"
  | "exited_success"
  | "exited_failure"
  | "terminated_by_external_actor"
  | "identity_mismatch"
  | "state_unavailable"
  | "ambiguous";
export type DirectChildClassification =
  | "none_observed"
  | "expected_reviewed_child"
  | "unexpected_child"
  | "browser_child"
  | "gui_child"
  | "url_opener_child"
  | "credential_helper_child"
  | "daemonization_candidate"
  | "unknown_child"
  | "ambiguous_child";
export type DescendantClassification =
  | "none_observed"
  | "unexpected_descendant"
  | "detached_descendant"
  | "process_group_escape"
  | "browser_descendant"
  | "gui_descendant"
  | "url_opener_descendant"
  | "credential_helper_descendant"
  | "daemonized_descendant"
  | "unknown_descendant"
  | "ambiguous_descendant";
export type ProcessGroupMembershipState = "same_scoped_group" | "different_group" | "group_unavailable" | "group_not_applicable" | "ambiguous";
export type DetachedDescendantState =
  | "not_detached"
  | "session_detached"
  | "group_detached"
  | "session_and_group_detached"
  | "detachment_unknown"
  | "not_applicable";
export type ProcessGroupEscapeState = "no_escape_modeled" | "escape_modeled" | "escape_state_unavailable" | "escape_state_ambiguous" | "not_applicable";
export type FixtureProcessSemanticKind =
  | "scoped_parent"
  | "browser"
  | "gui_application"
  | "url_opener"
  | "credential_helper"
  | "daemon_candidate"
  | "generic_child"
  | "unknown";
export type DaemonizationState =
  | "not_modeled"
  | "double_fork_pattern_modeled"
  | "session_detachment_modeled"
  | "parent_exit_with_surviving_descendant_modeled"
  | "background_survivor_modeled"
  | "daemonization_ambiguous"
  | "state_unavailable";
export type StructuralDisposition = "compatible_fixture" | "blocked_fixture" | "ambiguous_fixture";
export type ParentTerminationState = "modeled_exited" | "modeled_running" | "modeled_unknown" | "modeled_contradictory";

export type ScopedMacosProcessObserverPolicy = Readonly<{
  policyId: typeof SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID;
  policyVersion: 1;
  operation: typeof SCOPED_MACOS_PROCESS_OBSERVER_OPERATION;
  platform: "macos";
  oneActiveProcessOnly: true;
  retryPolicy: "none";
  expectedChildPolicy: "no_children_expected";
  unexpectedChildDisposition: "block_or_ambiguous";
  requireExactBoundarySession: true;
  requireExactProcessInstanceCapability: true;
  requireProcessGroupCapabilityWhenApplicable: true;
  requireSameSessionEvidence: true;
  requireFreshEvidence: true;
  requireCompleteParentState: true;
  requireCompleteDirectChildState: true;
  requireCompleteDescendantState: true;
  requireCompleteProcessGroupState: true;
  allowDetachedDescendants: false;
  allowProcessGroupEscape: false;
  allowBrowserChildren: false;
  allowGuiChildren: false;
  allowUrlOpeners: false;
  allowCredentialHelpers: false;
  allowDaemonization: false;
  allowUnknownChildren: false;
  authoritativeObserverRequiredForFutureLiveUse: true;
  fixtureMayProveContainment: false;
  fixtureMayProveTermination: false;
  fixtureMayEnableProcessStart: false;
  fixtureMayEnableRunner: false;
  maxNodes: 64;
  maxEdges: 63;
  maxDepth: 16;
  requestValiditySeconds: 30;
  fixtureObservationWindowSeconds: 10;
  evidenceAgeSeconds: 15;
  policyFingerprintAlgorithm: "sha256";
  policyFingerprint: string;
}>;

export type FixtureProcessInstanceCapability = Readonly<{
  capabilityKind: "process_instance";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  processLaunchIdentityFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  observedLive: false;
  factoryProvenance: "fixture_process_instance_capability_factory_v1";
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type FixtureProcessGroupCapability = Readonly<{
  capabilityKind: "process_group";
  capabilityVersion: 1;
  capabilityId: string;
  boundarySessionId: string;
  processGroupIdentityFingerprint: string;
  linkedProcessInstanceCapabilityId: string;
  linkedProcessInstanceCapabilityFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  fixtureOnly: true;
  observedLive: false;
  factoryProvenance: "fixture_process_group_capability_factory_v1";
  capabilityFingerprintAlgorithm: "sha256";
  capabilityFingerprint: string;
}>;

export type ScopedProcessObservationRequest = Readonly<{
  requestKind: "scoped_process_observation";
  requestVersion: 1;
  requestId: string;
  boundarySessionId: string;
  observerIdentityFingerprint: string;
  observerPolicyId: typeof SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID;
  operation: typeof SCOPED_MACOS_PROCESS_OBSERVER_OPERATION;
  processInstanceCapability: FixtureProcessInstanceCapability;
  processGroupCapability: FixtureProcessGroupCapability;
  requestedAt: string;
  expiresAt: string;
  attempt: 1;
  retryPolicy: "none";
  expectedChildPolicy: "no_children_expected";
  requestFingerprintAlgorithm: "sha256";
  requestFingerprint: string;
}>;

export type FixtureProcessNode = Readonly<{
  nodeRef: string;
  role: "parent" | "direct_child" | "descendant";
  semanticKind: FixtureProcessSemanticKind;
  parentState?: ParentProcessState;
  parentCapabilityFingerprint?: string;
  groupRef: string;
  sessionAttachment: "same_session" | "detached" | "unknown";
  groupMembership: ProcessGroupMembershipState;
  detachedState: DetachedDescendantState;
  escapeState: ProcessGroupEscapeState;
  daemonizationState: DaemonizationState;
  terminationState: "running" | "exited" | "unknown" | "contradictory";
}>;

export type FixtureProcessRelationship = Readonly<{
  parentNodeRef: string;
  childNodeRef: string;
  relation: "direct_child";
}>;

export type ScopedProcessObservationFixture = Readonly<{
  fixtureKind: "scoped_process_observation_fixture";
  fixtureVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  fixtureId: string;
  boundarySessionId: string;
  requestId: string;
  processInstanceCapabilityId: string;
  processGroupCapabilityId: string;
  observationWindow: Readonly<{
    startedAt: string;
    endedAt: string;
    capturedAt: string;
    expiresAt: string;
  }>;
  parentNodeRef: string;
  childObservationSet: Readonly<{
    completeness: "modeled_complete" | "modeled_incomplete";
    directChildNodeRefs: readonly string[];
  }>;
  descendantObservationSet: Readonly<{
    completeness: "modeled_complete" | "modeled_incomplete";
    descendantNodeRefs: readonly string[];
  }>;
  processGroupObservationSet: Readonly<{
    completeness: "modeled_complete" | "modeled_incomplete" | "not_applicable";
    scopedGroupRef: string;
  }>;
  nodes: readonly FixtureProcessNode[];
  relationships: readonly FixtureProcessRelationship[];
  fixtureFingerprintAlgorithm: "sha256";
  fixtureFingerprint: string;
}>;

export type SanitizedChildSummary = Readonly<{
  classification: DirectChildClassification;
  observedDirectChildCount: number;
  sanitizedNodeLabels: readonly string[];
}>;
export type SanitizedDescendantSummary = Readonly<{
  classification: DescendantClassification;
  observedDescendantCount: number;
  sanitizedNodeLabels: readonly string[];
}>;
export type SanitizedProcessGroupSummary = Readonly<{
  parentMembership: ProcessGroupMembershipState;
  anyMismatchModeled: boolean;
  rawProcessGroupIdsExposed: false;
}>;

export type SanitizedContainmentEvidence = Readonly<{
  evidenceKind: "sanitized_containment_evidence";
  evidenceVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  provesContainment: false;
  boundarySessionId: string;
  requestId: string;
  observerIdentityFingerprint: string;
  observerPolicyFingerprint: string;
  processInstanceCapabilityFingerprint: string;
  processGroupCapabilityFingerprint: string;
  observationFixtureFingerprint: string;
  evaluatedAt: string;
  expiresAt: string;
  authority: "fixture_structural_only";
  completeness: ObservationCompletenessClassification;
  structuralDisposition: StructuralDisposition;
  parentState: ParentProcessState;
  directChildSummary: SanitizedChildSummary;
  descendantSummary: SanitizedDescendantSummary;
  processGroupSummary: SanitizedProcessGroupSummary;
  detachedDescendantState: DetachedDescendantState;
  processGroupEscapeState: ProcessGroupEscapeState;
  daemonizationState: DaemonizationState;
  blockingReasons: readonly string[];
  ambiguityReasons: readonly string[];
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type SanitizedTerminationVerificationEvidence = Readonly<{
  evidenceKind: "sanitized_termination_verification_evidence";
  evidenceVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  provesTermination: false;
  terminationVerifiedLive: false;
  boundarySessionId: string;
  requestId: string;
  evaluatedAt: string;
  expiresAt: string;
  authority: "fixture_structural_only";
  completeness: ObservationCompletenessClassification;
  parentTerminationState: ParentTerminationState;
  survivingDirectChildState: "none_modeled" | "one_or_more_modeled" | "unknown";
  survivingDescendantState: "none_modeled" | "one_or_more_modeled" | "unknown";
  detachedSurvivorState: "none_modeled" | "one_or_more_modeled" | "unknown";
  structuralDisposition: StructuralDisposition;
  blockingReasons: readonly string[];
  ambiguityReasons: readonly string[];
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type ScopedObserverCompatibilitySummary = Readonly<{
  compatibilityKind: "scoped_macos_process_observer_compatibility";
  observerIdentityFingerprint: string;
  processExecutor: "compatible";
  liveDriverDesign: "fixture_observer_structurally_compatible_but_not_live_driver_enabling";
  trustedResolver: "compatible_and_not_a_resolver_replacement";
  cliVersionCollector: "compatible_and_does_not_run_version_commands";
  credentialBoundary: "compatible_and_no_credential_access";
  authorization: "compatible_and_no_authorization_issue_or_consumption";
  runner: "fixture_observer_structurally_compatible_but_not_live_runner_enabling";
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  compatibilityFingerprintAlgorithm: "sha256";
  compatibilityFingerprint: string;
}>;

export type ScopedProcessObservationFixtureResult = Readonly<{
  resultKind: "scoped_process_observation_fixture_result";
  resultVersion: 1;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  boundarySessionId: string;
  requestId: string;
  observerIdentity: typeof SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY;
  observerIdentityFingerprint: string;
  observerPolicyId: typeof SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID;
  observerPolicyFingerprint: string;
  authority: "fixture_structural_only";
  completeness: ObservationCompletenessClassification;
  lifecycleState: ScopedObserverLifecycleState;
  structuralDisposition: StructuralDisposition;
  containmentEvidence: SanitizedContainmentEvidence;
  terminationVerificationEvidence: SanitizedTerminationVerificationEvidence;
  compatibility: ScopedObserverCompatibilitySummary;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

export type ScopedMacosFixtureObserverAdapter = Readonly<{
  adapterKind: "scoped_macos_fixture_observer_adapter";
  fixtureOnly: true;
  observedLive: false;
  observeFixture: (input: Readonly<{
    request: ScopedProcessObservationRequest;
    fixture: ScopedProcessObservationFixture;
    evaluatedAt: string;
  }>) => ScopedProcessObservationFixtureResult;
}>;

export function buildScopedMacosProcessObserverPolicy(): ScopedMacosProcessObserverPolicy {
  const core = {
    policyId: SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID,
    policyVersion: 1,
    operation: SCOPED_MACOS_PROCESS_OBSERVER_OPERATION,
    platform: "macos",
    oneActiveProcessOnly: true,
    retryPolicy: "none",
    expectedChildPolicy: "no_children_expected",
    unexpectedChildDisposition: "block_or_ambiguous",
    requireExactBoundarySession: true,
    requireExactProcessInstanceCapability: true,
    requireProcessGroupCapabilityWhenApplicable: true,
    requireSameSessionEvidence: true,
    requireFreshEvidence: true,
    requireCompleteParentState: true,
    requireCompleteDirectChildState: true,
    requireCompleteDescendantState: true,
    requireCompleteProcessGroupState: true,
    allowDetachedDescendants: false,
    allowProcessGroupEscape: false,
    allowBrowserChildren: false,
    allowGuiChildren: false,
    allowUrlOpeners: false,
    allowCredentialHelpers: false,
    allowDaemonization: false,
    allowUnknownChildren: false,
    authoritativeObserverRequiredForFutureLiveUse: true,
    fixtureMayProveContainment: false,
    fixtureMayProveTermination: false,
    fixtureMayEnableProcessStart: false,
    fixtureMayEnableRunner: false,
    maxNodes: 64,
    maxEdges: 63,
    maxDepth: 16,
    requestValiditySeconds: 30,
    fixtureObservationWindowSeconds: 10,
    evidenceAgeSeconds: 15,
  } satisfies Omit<ScopedMacosProcessObserverPolicy, "policyFingerprintAlgorithm" | "policyFingerprint">;
  return deepFreeze({ ...core, policyFingerprintAlgorithm: "sha256", policyFingerprint: fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.policy, core) });
}

export const SCOPED_MACOS_PROCESS_OBSERVER_POLICY_REGISTRY = deepFreeze({
  registryKind: "scoped_macos_process_observer_policy_registry",
  registryVersion: 1,
  observerIdentityFingerprint: fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.identity, SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY),
  policies: [buildScopedMacosProcessObserverPolicy()],
  policyMergingAllowed: false,
  policyInheritanceAllowed: false,
  callerOverridesAllowed: false,
} as const);

export function buildFixtureProcessInstanceCapability(input: {
  capabilityId?: string;
  boundarySessionId?: string;
  processLaunchIdentityFingerprint?: string;
  issuedAt?: string;
  expiresAt?: string;
} = {}): FixtureProcessInstanceCapability {
  const core = {
    capabilityKind: "process_instance",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? "fixture_process_instance_capability_001",
    boundarySessionId: input.boundarySessionId ?? POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION,
    processLaunchIdentityFingerprint: input.processLaunchIdentityFingerprint ?? sha256("fixture-launch-identity"),
    issuedAt: input.issuedAt ?? SCOPED_MACOS_PROCESS_OBSERVER_ISSUED_AT,
    expiresAt: input.expiresAt ?? SCOPED_MACOS_PROCESS_OBSERVER_EXPIRES_AT,
    fixtureOnly: true,
    observedLive: false,
    factoryProvenance: "fixture_process_instance_capability_factory_v1",
  } satisfies Omit<FixtureProcessInstanceCapability, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = deepFreeze({ ...core, capabilityFingerprintAlgorithm: "sha256", capabilityFingerprint: fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.processInstanceCapability, core) } satisfies FixtureProcessInstanceCapability);
  PROCESS_INSTANCE_CAPABILITY_PROVENANCE.add(capability);
  return capability;
}

export function buildFixtureProcessGroupCapability(
  processInstanceCapability: FixtureProcessInstanceCapability = buildFixtureProcessInstanceCapability(),
  input: {
    capabilityId?: string;
    processGroupIdentityFingerprint?: string;
    issuedAt?: string;
    expiresAt?: string;
  } = {},
): FixtureProcessGroupCapability {
  const core = {
    capabilityKind: "process_group",
    capabilityVersion: 1,
    capabilityId: input.capabilityId ?? "fixture_process_group_capability_001",
    boundarySessionId: processInstanceCapability.boundarySessionId,
    processGroupIdentityFingerprint: input.processGroupIdentityFingerprint ?? sha256("fixture-process-group-identity"),
    linkedProcessInstanceCapabilityId: processInstanceCapability.capabilityId,
    linkedProcessInstanceCapabilityFingerprint: processInstanceCapability.capabilityFingerprint,
    issuedAt: input.issuedAt ?? SCOPED_MACOS_PROCESS_OBSERVER_ISSUED_AT,
    expiresAt: input.expiresAt ?? SCOPED_MACOS_PROCESS_OBSERVER_EXPIRES_AT,
    fixtureOnly: true,
    observedLive: false,
    factoryProvenance: "fixture_process_group_capability_factory_v1",
  } satisfies Omit<FixtureProcessGroupCapability, "capabilityFingerprintAlgorithm" | "capabilityFingerprint">;
  const capability = deepFreeze({ ...core, capabilityFingerprintAlgorithm: "sha256", capabilityFingerprint: fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.processGroupCapability, core) } satisfies FixtureProcessGroupCapability);
  PROCESS_GROUP_CAPABILITY_PROVENANCE.add(capability);
  return capability;
}

export function buildScopedProcessObservationRequest(
  processInstanceCapability: FixtureProcessInstanceCapability = buildFixtureProcessInstanceCapability(),
  processGroupCapability: FixtureProcessGroupCapability = buildFixtureProcessGroupCapability(processInstanceCapability),
  input: { requestId?: string; requestedAt?: string; expiresAt?: string } = {},
): ScopedProcessObservationRequest {
  const core = {
    requestKind: "scoped_process_observation",
    requestVersion: 1,
    requestId: input.requestId ?? "scoped_process_observation_request_001",
    boundarySessionId: processInstanceCapability.boundarySessionId,
    observerIdentityFingerprint: buildObserverIdentityFingerprint(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY),
    observerPolicyId: SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID,
    operation: SCOPED_MACOS_PROCESS_OBSERVER_OPERATION,
    processInstanceCapability,
    processGroupCapability,
    requestedAt: input.requestedAt ?? SCOPED_MACOS_PROCESS_OBSERVER_ISSUED_AT,
    expiresAt: input.expiresAt ?? SCOPED_MACOS_PROCESS_OBSERVER_EXPIRES_AT,
    attempt: 1,
    retryPolicy: "none",
    expectedChildPolicy: "no_children_expected",
  } satisfies Omit<ScopedProcessObservationRequest, "requestFingerprintAlgorithm" | "requestFingerprint">;
  return deepFreeze({ ...core, requestFingerprintAlgorithm: "sha256", requestFingerprint: fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.request, core) });
}

export function buildFixtureProcessNode(patch: Partial<FixtureProcessNode> = {}): FixtureProcessNode {
  return deepFreeze({
    nodeRef: "fixture_process_node_parent_001",
    role: "parent",
    semanticKind: "scoped_parent",
    parentState: "running_expected_identity",
    parentCapabilityFingerprint: buildFixtureProcessInstanceCapability().capabilityFingerprint,
    groupRef: "fixture_process_group_ref_scoped_001",
    sessionAttachment: "same_session",
    groupMembership: "same_scoped_group",
    detachedState: "not_applicable",
    escapeState: "not_applicable",
    daemonizationState: "not_modeled",
    terminationState: "running",
    ...patch,
  });
}

export function buildScopedProcessObservationFixture(
  request: ScopedProcessObservationRequest = buildScopedProcessObservationRequest(),
  patch: Partial<Omit<ScopedProcessObservationFixture, "fixtureFingerprintAlgorithm" | "fixtureFingerprint">> = {},
): ScopedProcessObservationFixture {
  const parent = buildFixtureProcessNode({
    parentCapabilityFingerprint: request.processInstanceCapability.capabilityFingerprint,
    groupRef: "fixture_process_group_ref_scoped_001",
  });
  const core = {
    fixtureKind: "scoped_process_observation_fixture",
    fixtureVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    fixtureId: "scoped_process_observation_fixture_001",
    boundarySessionId: request.boundarySessionId,
    requestId: request.requestId,
    processInstanceCapabilityId: request.processInstanceCapability.capabilityId,
    processGroupCapabilityId: request.processGroupCapability.capabilityId,
    observationWindow: {
      startedAt: SCOPED_MACOS_PROCESS_OBSERVER_ISSUED_AT,
      endedAt: "2026-07-17T10:00:04.000Z",
      capturedAt: "2026-07-17T10:00:04.000Z",
      expiresAt: SCOPED_MACOS_PROCESS_OBSERVER_EXPIRES_AT,
    },
    parentNodeRef: parent.nodeRef,
    childObservationSet: {
      completeness: "modeled_complete",
      directChildNodeRefs: [],
    },
    descendantObservationSet: {
      completeness: "modeled_complete",
      descendantNodeRefs: [],
    },
    processGroupObservationSet: {
      completeness: "modeled_complete",
      scopedGroupRef: "fixture_process_group_ref_scoped_001",
    },
    nodes: [parent],
    relationships: [],
    ...patch,
  } satisfies Omit<ScopedProcessObservationFixture, "fixtureFingerprintAlgorithm" | "fixtureFingerprint">;
  return deepFreeze({ ...core, fixtureFingerprintAlgorithm: "sha256", fixtureFingerprint: fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.fixture, core) });
}

export function buildFixtureWithChild(
  semanticKind: FixtureProcessSemanticKind,
  patch: Partial<FixtureProcessNode> = {},
  request: ScopedProcessObservationRequest = buildScopedProcessObservationRequest(),
): ScopedProcessObservationFixture {
  const base = buildScopedProcessObservationFixture(request);
  const child = buildFixtureProcessNode({
    nodeRef: "fixture_process_node_child_001",
    role: "direct_child",
    semanticKind,
    parentState: undefined,
    groupRef: "fixture_process_group_ref_scoped_001",
    terminationState: "running",
    ...patch,
  });
  return buildScopedProcessObservationFixture(request, {
    nodes: [base.nodes[0], child],
    relationships: [{ parentNodeRef: base.parentNodeRef, childNodeRef: child.nodeRef, relation: "direct_child" }],
    childObservationSet: { completeness: "modeled_complete", directChildNodeRefs: [child.nodeRef] },
    descendantObservationSet: { completeness: "modeled_complete", descendantNodeRefs: [child.nodeRef] },
  });
}

export function buildScopedObserverCompatibilitySummary(): ScopedObserverCompatibilitySummary {
  const core = {
    compatibilityKind: "scoped_macos_process_observer_compatibility",
    observerIdentityFingerprint: buildObserverIdentityFingerprint(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY),
    processExecutor: "compatible",
    liveDriverDesign: "fixture_observer_structurally_compatible_but_not_live_driver_enabling",
    trustedResolver: "compatible_and_not_a_resolver_replacement",
    cliVersionCollector: "compatible_and_does_not_run_version_commands",
    credentialBoundary: "compatible_and_no_credential_access",
    authorization: "compatible_and_no_authorization_issue_or_consumption",
    runner: "fixture_observer_structurally_compatible_but_not_live_runner_enabling",
    enablesProcessStart: false,
    enablesPreflightRunner: false,
  } satisfies Omit<ScopedObserverCompatibilitySummary, "compatibilityFingerprintAlgorithm" | "compatibilityFingerprint">;
  return deepFreeze({ ...core, compatibilityFingerprintAlgorithm: "sha256", compatibilityFingerprint: fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.compatibility, core) });
}

export function observeScopedMacosProcessFixture(input: Readonly<{
  request: ScopedProcessObservationRequest;
  fixture: ScopedProcessObservationFixture;
  evaluatedAt: string;
}>): ScopedProcessObservationFixtureResult {
  const requestValidation = validateScopedProcessObservationRequest(input.request, input.evaluatedAt);
  const fixtureValidation = validateScopedProcessObservationFixture(input.fixture, input.request, input.evaluatedAt);
  const blockingReasons = [...requestValidation.errors, ...fixtureValidation.errors].filter(isBlockingReason);
  const ambiguityReasons = [...requestValidation.errors, ...fixtureValidation.errors].filter((reason) => !isBlockingReason(reason));
  const graph = classifyGraph(input.fixture);
  blockingReasons.push(...graph.blockingReasons);
  ambiguityReasons.push(...graph.ambiguityReasons);

  const completeness = computeCompleteness(input.fixture, blockingReasons, ambiguityReasons);
  const structuralDisposition: StructuralDisposition =
    blockingReasons.length > 0 ? "blocked_fixture" : ambiguityReasons.length > 0 ? "ambiguous_fixture" : "compatible_fixture";
  const lifecycleState: ScopedObserverLifecycleState =
    structuralDisposition === "compatible_fixture" ? "structurally_compatible" : structuralDisposition === "blocked_fixture" ? "structurally_blocked" : "structurally_ambiguous";

  const containmentEvidence = buildContainmentEvidence(input.request, input.fixture, input.evaluatedAt, completeness, structuralDisposition, graph, blockingReasons, ambiguityReasons);
  const terminationVerificationEvidence = buildTerminationEvidence(input.request, input.fixture, input.evaluatedAt, completeness, structuralDisposition, graph, blockingReasons, ambiguityReasons);
  const compatibility = buildScopedObserverCompatibilitySummary();
  const core = {
    resultKind: "scoped_process_observation_fixture_result",
    resultVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    boundarySessionId: input.request.boundarySessionId,
    requestId: input.request.requestId,
    observerIdentity: SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY,
    observerIdentityFingerprint: buildObserverIdentityFingerprint(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY),
    observerPolicyId: SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID,
    observerPolicyFingerprint: buildScopedMacosProcessObserverPolicy().policyFingerprint,
    authority: "fixture_structural_only",
    completeness,
    lifecycleState,
    structuralDisposition,
    containmentEvidence,
    terminationVerificationEvidence,
    compatibility,
  } satisfies Omit<ScopedProcessObservationFixtureResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({ ...core, resultFingerprintAlgorithm: "sha256", resultFingerprint: fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.result, core) });
}

export function buildScopedMacosFixtureObserverAdapter(): ScopedMacosFixtureObserverAdapter {
  return deepFreeze({
    adapterKind: "scoped_macos_fixture_observer_adapter",
    fixtureOnly: true,
    observedLive: false,
    observeFixture: observeScopedMacosProcessFixture,
  });
}

export function buildScopedMacosProcessObserverFuturePlan() {
  return deepFreeze({
    planKind: "scoped_macos_process_observer_future_plan",
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    liveImplementationPresent: false,
    requiresNewAction: true,
    requiresStaticSecurityReview: true,
    requiresDependencyReview: true,
    requiresMacosApiSelectionReview: true,
    requiresRawIdentifierContainmentReview: true,
    requiresAuthorityReview: true,
    requiresCompletenessReview: true,
    requiresTerminationVerificationReview: true,
    requiresStagingOnlyValidation: true,
    requiresFinalLiveGateApproval: true,
    selectedLiveMechanism: "not_selected",
    containsExecutableCode: false,
    importsProcessObservationMechanism: false,
  } as const);
}

export function validateObserverIdentity(input: unknown): ScopedObserverValidationResult<typeof SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY> {
  return exact(input, SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY, "observer_identity");
}

export function validateObserverPolicy(input: unknown): ScopedObserverValidationResult<ScopedMacosProcessObserverPolicy> {
  return exact(input, buildScopedMacosProcessObserverPolicy(), "observer_policy", "policyFingerprint", "policyFingerprintAlgorithm", SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.policy);
}

export function validateProcessInstanceCapability(input: unknown, evaluatedAt: string = SCOPED_MACOS_PROCESS_OBSERVER_EVALUATED_AT): ScopedObserverValidationResult<FixtureProcessInstanceCapability> {
  const errors = validateShape(input, buildFixtureProcessInstanceCapability(), "process_instance_capability", "capabilityFingerprint", "capabilityFingerprintAlgorithm", SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.processInstanceCapability);
  if (isRecord(input)) {
    if (!PROCESS_INSTANCE_CAPABILITY_PROVENANCE.has(input)) errors.push("capability_untrusted_provenance");
    if (!isCapabilityId(input.capabilityId, "fixture_process_instance_capability_")) errors.push("capability_invalid");
    if (!isBoundarySession(input.boundarySessionId)) errors.push("capability_session_mismatch");
    if (!isSha256(input.processLaunchIdentityFingerprint)) errors.push("capability_invalid");
    validateTimeRange(input.issuedAt, input.expiresAt, evaluatedAt, errors, "capability");
    if (hasProhibitedProcessInput(input)) errors.push("prohibited_process_identifier");
    if (input.factoryProvenance !== "fixture_process_instance_capability_factory_v1") errors.push("capability_invalid");
  }
  return validation(input, errors);
}

export function validateProcessGroupCapability(input: unknown, processInstanceCapability: FixtureProcessInstanceCapability, evaluatedAt: string = SCOPED_MACOS_PROCESS_OBSERVER_EVALUATED_AT): ScopedObserverValidationResult<FixtureProcessGroupCapability> {
  const errors = validateShape(input, buildFixtureProcessGroupCapability(processInstanceCapability), "process_group_capability", "capabilityFingerprint", "capabilityFingerprintAlgorithm", SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.processGroupCapability);
  if (isRecord(input)) {
    if (!PROCESS_GROUP_CAPABILITY_PROVENANCE.has(input)) errors.push("process_group_capability_untrusted_provenance");
    if (!isCapabilityId(input.capabilityId, "fixture_process_group_capability_")) errors.push("process_group_capability_required");
    if (input.boundarySessionId !== processInstanceCapability.boundarySessionId) errors.push("process_group_capability_mismatch");
    if (input.linkedProcessInstanceCapabilityId !== processInstanceCapability.capabilityId) errors.push("process_group_capability_mismatch");
    if (input.linkedProcessInstanceCapabilityFingerprint !== processInstanceCapability.capabilityFingerprint) errors.push("process_group_capability_mismatch");
    if (!isSha256(input.processGroupIdentityFingerprint)) errors.push("process_group_capability_mismatch");
    validateTimeRange(input.issuedAt, input.expiresAt, evaluatedAt, errors, "capability");
    if (hasProhibitedProcessInput(input)) errors.push("prohibited_process_identifier");
    if (input.factoryProvenance !== "fixture_process_group_capability_factory_v1") errors.push("process_group_capability_mismatch");
  }
  return validation(input, errors);
}

export function validateScopedProcessObservationRequest(input: unknown, evaluatedAt: string = SCOPED_MACOS_PROCESS_OBSERVER_EVALUATED_AT): { ok: boolean; errors: readonly string[] } {
  const processCap = isRecord(input) && isRecord(input.processInstanceCapability) ? input.processInstanceCapability as unknown as FixtureProcessInstanceCapability : buildFixtureProcessInstanceCapability();
  const groupCap = isRecord(input) && isRecord(input.processGroupCapability) ? input.processGroupCapability as unknown as FixtureProcessGroupCapability : buildFixtureProcessGroupCapability(processCap as FixtureProcessInstanceCapability);
  const expected = buildScopedProcessObservationRequest(processCap as FixtureProcessInstanceCapability, groupCap as FixtureProcessGroupCapability);
  const errors = validateShape(input, expected, "observation_request", "requestFingerprint", "requestFingerprintAlgorithm", SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.request);
  if (!isRecord(input)) return { ok: false, errors };
  errors.push(...validationErrors(validateProcessInstanceCapability(input.processInstanceCapability, evaluatedAt)));
  errors.push(...validationErrors(validateProcessGroupCapability(input.processGroupCapability, input.processInstanceCapability as FixtureProcessInstanceCapability, evaluatedAt)));
  if (input.requestKind !== "scoped_process_observation") errors.push("request_invalid");
  if (input.requestVersion !== 1) errors.push("request_invalid");
  if (!isRequestId(input.requestId)) errors.push("request_invalid");
  if (input.boundarySessionId !== (input.processInstanceCapability as Record<string, unknown>).boundarySessionId) errors.push("capability_session_mismatch");
  if (input.boundarySessionId !== (input.processGroupCapability as Record<string, unknown>).boundarySessionId) errors.push("capability_session_mismatch");
  if (input.observerIdentityFingerprint !== buildObserverIdentityFingerprint(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY)) errors.push("observer_identity_mismatch");
  if (input.observerPolicyId !== SCOPED_MACOS_PROCESS_OBSERVER_POLICY_ID) errors.push("observer_policy_unknown");
  if (input.operation !== SCOPED_MACOS_PROCESS_OBSERVER_OPERATION) errors.push("operation_mismatch");
  if (input.attempt !== 1) errors.push("retry_not_allowed");
  if (input.retryPolicy !== "none") errors.push("retry_not_allowed");
  if (input.expectedChildPolicy !== "no_children_expected") errors.push("unexpected_direct_child");
  validateTimeRange(input.requestedAt, input.expiresAt, evaluatedAt, errors, "request");
  if (hasProhibitedProcessInput(input)) errors.push("prohibited_process_identifier");
  return { ok: errors.length === 0, errors: sorted(errors) };
}

export function validateScopedProcessObservationFixture(input: unknown, request: ScopedProcessObservationRequest, evaluatedAt: string = SCOPED_MACOS_PROCESS_OBSERVER_EVALUATED_AT): { ok: boolean; errors: readonly string[] } {
  const expected = buildScopedProcessObservationFixture(request);
  const errors = validateShape(input, expected, "observation_fixture", "fixtureFingerprint", "fixtureFingerprintAlgorithm", SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.fixture, false);
  if (!isRecord(input)) return { ok: false, errors };
  if (input.fixtureKind !== "scoped_process_observation_fixture") errors.push("fixture_invalid");
  if (input.fixtureVersion !== 1) errors.push("fixture_invalid");
  if (input.fixtureOnly !== true) errors.push("fixture_claimed_live_observation");
  if (input.observedLive !== false) errors.push("fixture_claimed_live_observation");
  if (input.authoritativeLive !== false) errors.push("fixture_claimed_live_authority");
  if (input.boundarySessionId !== request.boundarySessionId) errors.push("evidence_session_inconsistent");
  if (input.requestId !== request.requestId) errors.push("evidence_session_inconsistent");
  if (input.processInstanceCapabilityId !== request.processInstanceCapability.capabilityId) errors.push("capability_invalid");
  if (input.processGroupCapabilityId !== request.processGroupCapability.capabilityId) errors.push("process_group_capability_mismatch");
  if (hasProhibitedProcessInput(input)) errors.push("prohibited_process_identifier");
  const window = isRecord(input.observationWindow) ? input.observationWindow : {};
  validateObservationWindow(window, evaluatedAt, errors);
  errors.push(...validateGraph(input));
  return { ok: errors.length === 0, errors: sorted(errors) };
}

export function validateFixtureObserverAdapter(input: unknown): ScopedObserverValidationResult<ScopedMacosFixtureObserverAdapter> {
  const errors: string[] = [];
  const allowed = ["adapterKind", "fixtureOnly", "observedLive", "observeFixture"];
  if (!isRecord(input)) return { ok: false, errors: ["adapter_invalid"] };
  for (const key of Object.keys(input)) if (!allowed.includes(key)) errors.push(`unknown_adapter_field:${key}`);
  if (input.adapterKind !== "scoped_macos_fixture_observer_adapter") errors.push("adapter_invalid");
  if (input.fixtureOnly !== true || input.observedLive !== false) errors.push("adapter_invalid");
  if (typeof input.observeFixture !== "function") errors.push("adapter_invalid");
  return validation(input, errors);
}

export const buildObserverIdentityFingerprint = (input: unknown) => fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.identity, input);
export const buildObserverPolicyFingerprint = (input: unknown) => fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.policy, input);
export const buildProcessInstanceCapabilityFingerprint = (input: unknown) => fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.processInstanceCapability, input);
export const buildProcessGroupCapabilityFingerprint = (input: unknown) => fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.processGroupCapability, input);
export const buildObservationRequestFingerprint = (input: unknown) => fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.request, input);
export const buildObservationFixtureFingerprint = (input: unknown) => fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.fixture, input);
export const buildContainmentEvidenceFingerprint = (input: unknown) => fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.containmentEvidence, input);
export const buildTerminationEvidenceFingerprint = (input: unknown) => fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.terminationEvidence, input);

function buildContainmentEvidence(
  request: ScopedProcessObservationRequest,
  fixture: ScopedProcessObservationFixture,
  evaluatedAt: string,
  completeness: ObservationCompletenessClassification,
  structuralDisposition: StructuralDisposition,
  graph: GraphClassification,
  blockingReasons: readonly string[],
  ambiguityReasons: readonly string[],
): SanitizedContainmentEvidence {
  const core = {
    evidenceKind: "sanitized_containment_evidence",
    evidenceVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    provesContainment: false,
    boundarySessionId: request.boundarySessionId,
    requestId: request.requestId,
    observerIdentityFingerprint: buildObserverIdentityFingerprint(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY),
    observerPolicyFingerprint: buildScopedMacosProcessObserverPolicy().policyFingerprint,
    processInstanceCapabilityFingerprint: request.processInstanceCapability.capabilityFingerprint,
    processGroupCapabilityFingerprint: request.processGroupCapability.capabilityFingerprint,
    observationFixtureFingerprint: fixture.fixtureFingerprint,
    evaluatedAt,
    expiresAt: fixture.observationWindow.expiresAt,
    authority: "fixture_structural_only",
    completeness,
    structuralDisposition,
    parentState: graph.parentState,
    directChildSummary: {
      classification: graph.directChildClassification,
      observedDirectChildCount: graph.directChildRefs.length,
      sanitizedNodeLabels: graph.directChildRefs.map(sanitizeNodeLabel),
    },
    descendantSummary: {
      classification: graph.descendantClassification,
      observedDescendantCount: graph.descendantRefs.length,
      sanitizedNodeLabels: graph.descendantRefs.map(sanitizeNodeLabel),
    },
    processGroupSummary: {
      parentMembership: graph.parentGroupMembership,
      anyMismatchModeled: graph.anyGroupMismatch,
      rawProcessGroupIdsExposed: false,
    },
    detachedDescendantState: graph.detachedDescendantState,
    processGroupEscapeState: graph.processGroupEscapeState,
    daemonizationState: graph.daemonizationState,
    blockingReasons: sorted(blockingReasons),
    ambiguityReasons: sorted(ambiguityReasons),
  } satisfies Omit<SanitizedContainmentEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return deepFreeze({ ...core, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.containmentEvidence, core) });
}

function buildTerminationEvidence(
  request: ScopedProcessObservationRequest,
  fixture: ScopedProcessObservationFixture,
  evaluatedAt: string,
  completeness: ObservationCompletenessClassification,
  structuralDisposition: StructuralDisposition,
  graph: GraphClassification,
  blockingReasons: readonly string[],
  ambiguityReasons: readonly string[],
): SanitizedTerminationVerificationEvidence {
  const core = {
    evidenceKind: "sanitized_termination_verification_evidence",
    evidenceVersion: 1,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    provesTermination: false,
    terminationVerifiedLive: false,
    boundarySessionId: request.boundarySessionId,
    requestId: request.requestId,
    evaluatedAt,
    expiresAt: fixture.observationWindow.expiresAt,
    authority: "fixture_structural_only",
    completeness,
    parentTerminationState: graph.parentTerminationState,
    survivingDirectChildState: graph.directChildRefs.length > 0 ? "one_or_more_modeled" : "none_modeled",
    survivingDescendantState: graph.descendantRefs.length > 0 ? "one_or_more_modeled" : "none_modeled",
    detachedSurvivorState: graph.detachedDescendantState === "not_detached" || graph.detachedDescendantState === "not_applicable" ? "none_modeled" : "one_or_more_modeled",
    structuralDisposition,
    blockingReasons: sorted(blockingReasons),
    ambiguityReasons: sorted(ambiguityReasons),
  } satisfies Omit<SanitizedTerminationVerificationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return deepFreeze({ ...core, evidenceFingerprintAlgorithm: "sha256", evidenceFingerprint: fingerprint(SCOPED_MACOS_OBSERVER_FINGERPRINT_DOMAINS.terminationEvidence, core) });
}

type GraphClassification = Readonly<{
  parentState: ParentProcessState;
  parentTerminationState: ParentTerminationState;
  parentGroupMembership: ProcessGroupMembershipState;
  directChildClassification: DirectChildClassification;
  descendantClassification: DescendantClassification;
  directChildRefs: readonly string[];
  descendantRefs: readonly string[];
  anyGroupMismatch: boolean;
  detachedDescendantState: DetachedDescendantState;
  processGroupEscapeState: ProcessGroupEscapeState;
  daemonizationState: DaemonizationState;
  blockingReasons: readonly string[];
  ambiguityReasons: readonly string[];
}>;

function classifyGraph(fixture: ScopedProcessObservationFixture): GraphClassification {
  const nodes = fixture.nodes;
  const parent = nodes.find((node) => node.nodeRef === fixture.parentNodeRef);
  const directChildRefs = fixture.childObservationSet.directChildNodeRefs;
  const descendantRefs = deriveDescendants(fixture, fixture.parentNodeRef);
  const relevant = nodes.filter((node) => node.nodeRef !== fixture.parentNodeRef && descendantRefs.includes(node.nodeRef));
  const blockingReasons: string[] = [];
  const ambiguityReasons: string[] = [];
  let directChildClassification: DirectChildClassification = directChildRefs.length === 0 ? "none_observed" : "unexpected_child";
  let descendantClassification: DescendantClassification = descendantRefs.length === 0 ? "none_observed" : "unexpected_descendant";
  let detachedDescendantState: DetachedDescendantState = "not_applicable";
  let processGroupEscapeState: ProcessGroupEscapeState = "not_applicable";
  let daemonizationState: DaemonizationState = "not_modeled";

  for (const node of relevant) {
    const direct = directChildRefs.includes(node.nodeRef);
    if (direct) directChildClassification = childClassificationFor(node.semanticKind);
    descendantClassification = pickDescendantClassification(descendantClassification, descendantClassificationFor(node));
    if (node.groupMembership === "different_group") {
      blockingReasons.push("process_group_escape_detected_in_fixture");
      processGroupEscapeState = "escape_modeled";
    }
    if (node.groupMembership === "group_unavailable") ambiguityReasons.push("incomplete_process_group_state");
    if (node.groupMembership === "ambiguous") ambiguityReasons.push("process_group_escape_state_unknown");
    if (node.detachedState !== "not_detached" && node.detachedState !== "not_applicable") {
      if (node.detachedState === "detachment_unknown") ambiguityReasons.push("detachment_state_unknown");
      else blockingReasons.push("detached_descendant_detected_in_fixture");
      detachedDescendantState = node.detachedState;
    }
    if (node.daemonizationState !== "not_modeled") {
      if (node.daemonizationState === "daemonization_ambiguous") ambiguityReasons.push("daemonization_state_unknown");
      else if (node.daemonizationState === "state_unavailable") ambiguityReasons.push("incomplete_termination_state");
      else blockingReasons.push("daemonization_detected_in_fixture");
      daemonizationState = node.daemonizationState;
    }
    blockingReasons.push(...blockingReasonsForSemantic(node.semanticKind));
  }
  if (directChildRefs.length > 0) blockingReasons.push("unexpected_direct_child");
  if (descendantRefs.length > 0) blockingReasons.push("unexpected_descendant");
  if (fixture.childObservationSet.completeness !== "modeled_complete") ambiguityReasons.push("incomplete_direct_child_state");
  if (fixture.descendantObservationSet.completeness !== "modeled_complete") ambiguityReasons.push("incomplete_descendant_state");
  if (fixture.processGroupObservationSet.completeness !== "modeled_complete") ambiguityReasons.push("incomplete_process_group_state");
  if (parent?.parentState === "state_unavailable") ambiguityReasons.push("parent_state_unavailable");
  if (parent?.parentState === "ambiguous") ambiguityReasons.push("fixture_relationship_ambiguous");
  if (parent?.parentState === "identity_mismatch") blockingReasons.push("parent_identity_mismatch");

  return deepFreeze({
    parentState: parent?.parentState ?? "not_observed",
    parentTerminationState: parentTerminationState(parent),
    parentGroupMembership: parent?.groupMembership ?? "group_unavailable",
    directChildClassification,
    descendantClassification,
    directChildRefs,
    descendantRefs,
    anyGroupMismatch: nodes.some((node) => node.groupMembership === "different_group"),
    detachedDescendantState,
    processGroupEscapeState,
    daemonizationState,
    blockingReasons: sorted(blockingReasons),
    ambiguityReasons: sorted(ambiguityReasons),
  });
}

function validateGraph(input: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const nodes = Array.isArray(input.nodes) ? input.nodes.filter(isRecord) as unknown as FixtureProcessNode[] : [];
  const relationships = Array.isArray(input.relationships) ? input.relationships.filter(isRecord) as unknown as FixtureProcessRelationship[] : [];
  if (!Array.isArray(input.nodes)) errors.push("fixture_relationship_ambiguous");
  if (!Array.isArray(input.relationships)) errors.push("fixture_relationship_ambiguous");
  if (nodes.length > 64) errors.push("fixture_relationship_ambiguous");
  if (relationships.length > 63) errors.push("fixture_relationship_ambiguous");
  const nodeRefs = new Set<string>();
  const parentRefs = nodes.filter((node) => node.role === "parent").map((node) => node.nodeRef);
  if (parentRefs.length !== 1) errors.push("parent_state_unavailable");
  for (const node of nodes) {
    if (!isFixtureNodeRef(node.nodeRef)) errors.push("prohibited_process_identifier");
    if (nodeRefs.has(node.nodeRef)) errors.push("fixture_relationship_ambiguous");
    nodeRefs.add(node.nodeRef);
    if (!["parent", "direct_child", "descendant"].includes(node.role)) errors.push("fixture_relationship_ambiguous");
    if (!["scoped_parent", "browser", "gui_application", "url_opener", "credential_helper", "daemon_candidate", "generic_child", "unknown"].includes(node.semanticKind)) errors.push("child_semantic_classification_unknown");
    if (hasProhibitedProcessInput(node)) errors.push("prohibited_process_identifier");
    if (node.parentState === "identity_mismatch") errors.push("parent_identity_mismatch");
    if (node.groupMembership === "different_group") errors.push("process_group_escape_detected_in_fixture");
  }
  const edgeKeys = new Set<string>();
  const childParents = new Map<string, string>();
  for (const edge of relationships) {
    const key = `${edge.parentNodeRef}->${edge.childNodeRef}`;
    if (edge.parentNodeRef === edge.childNodeRef) errors.push("fixture_relationship_ambiguous");
    if (edgeKeys.has(key)) errors.push("fixture_relationship_ambiguous");
    edgeKeys.add(key);
    if (!nodeRefs.has(edge.parentNodeRef) || !nodeRefs.has(edge.childNodeRef)) errors.push("fixture_relationship_ambiguous");
    if (childParents.has(edge.childNodeRef) && childParents.get(edge.childNodeRef) !== edge.parentNodeRef) errors.push("fixture_relationship_ambiguous");
    childParents.set(edge.childNodeRef, edge.parentNodeRef);
  }
  if (hasCycle(relationships)) errors.push("fixture_relationship_ambiguous");
  if (maxDepth(relationships, String(input.parentNodeRef)) > 16) errors.push("fixture_relationship_ambiguous");
  const derived = deriveDescendants(input as ScopedProcessObservationFixture, String(input.parentNodeRef));
  const modeledDescendants = isRecord(input.descendantObservationSet) && Array.isArray(input.descendantObservationSet.descendantNodeRefs)
    ? input.descendantObservationSet.descendantNodeRefs
    : [];
  for (const ref of derived) if (!modeledDescendants.includes(ref)) errors.push("incomplete_descendant_state");
  const modeledChildren = isRecord(input.childObservationSet) && Array.isArray(input.childObservationSet.directChildNodeRefs)
    ? input.childObservationSet.directChildNodeRefs
    : [];
  const derivedDirectChildren = relationships
    .filter((edge) => edge.parentNodeRef === input.parentNodeRef)
    .map((edge) => edge.childNodeRef);
  for (const ref of derivedDirectChildren) if (!modeledChildren.includes(ref)) errors.push("incomplete_direct_child_state");
  for (const ref of modeledChildren) if (!relationships.some((edge) => edge.parentNodeRef === input.parentNodeRef && edge.childNodeRef === ref)) errors.push("fixture_relationship_ambiguous");
  return sorted(errors);
}

function computeCompleteness(fixture: ScopedProcessObservationFixture, blockingReasons: readonly string[], ambiguityReasons: readonly string[]): ObservationCompletenessClassification {
  if (blockingReasons.includes("parent_state_contradictory")) return "contradictory";
  const incomplete = new Set<ObservationCompletenessClassification>();
  if (!fixture.nodes.some((node) => node.nodeRef === fixture.parentNodeRef && node.role === "parent")) incomplete.add("incomplete_parent_state");
  if (fixture.childObservationSet.completeness !== "modeled_complete") incomplete.add("incomplete_direct_child_state");
  if (fixture.descendantObservationSet.completeness !== "modeled_complete") incomplete.add("incomplete_descendant_state");
  if (fixture.processGroupObservationSet.completeness !== "modeled_complete") incomplete.add("incomplete_process_group_state");
  if (ambiguityReasons.includes("incomplete_termination_state")) incomplete.add("incomplete_termination_state");
  if (incomplete.size > 1) return "incomplete_multiple";
  return incomplete.values().next().value ?? "complete_fixture_structure";
}

function childClassificationFor(kind: FixtureProcessSemanticKind): DirectChildClassification {
  if (kind === "browser") return "browser_child";
  if (kind === "gui_application") return "gui_child";
  if (kind === "url_opener") return "url_opener_child";
  if (kind === "credential_helper") return "credential_helper_child";
  if (kind === "daemon_candidate") return "daemonization_candidate";
  if (kind === "unknown") return "unknown_child";
  return "unexpected_child";
}

function descendantClassificationFor(node: FixtureProcessNode): DescendantClassification {
  if (node.groupMembership === "different_group" || node.escapeState === "escape_modeled") return "process_group_escape";
  if (node.detachedState !== "not_detached" && node.detachedState !== "not_applicable") return "detached_descendant";
  if (node.daemonizationState !== "not_modeled") return "daemonized_descendant";
  if (node.semanticKind === "credential_helper") return "credential_helper_descendant";
  if (node.semanticKind === "url_opener") return "url_opener_descendant";
  if (node.semanticKind === "browser") return "browser_descendant";
  if (node.semanticKind === "gui_application") return "gui_descendant";
  if (node.semanticKind === "unknown") return "unknown_descendant";
  return "unexpected_descendant";
}

function pickDescendantClassification(current: DescendantClassification, next: DescendantClassification): DescendantClassification {
  const order: DescendantClassification[] = [
    "none_observed",
    "unexpected_descendant",
    "unknown_descendant",
    "gui_descendant",
    "browser_descendant",
    "url_opener_descendant",
    "credential_helper_descendant",
    "daemonized_descendant",
    "detached_descendant",
    "process_group_escape",
    "ambiguous_descendant",
  ];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}

function blockingReasonsForSemantic(kind: FixtureProcessSemanticKind): string[] {
  if (kind === "browser") return ["browser_child_detected_in_fixture"];
  if (kind === "gui_application") return ["gui_child_detected_in_fixture"];
  if (kind === "url_opener") return ["url_opener_detected_in_fixture"];
  if (kind === "credential_helper") return ["credential_helper_detected_in_fixture"];
  if (kind === "daemon_candidate") return ["daemonization_detected_in_fixture"];
  if (kind === "unknown") return ["unknown_child_detected_in_fixture"];
  if (kind === "generic_child") return ["unexpected_direct_child"];
  return [];
}

function parentTerminationState(parent: FixtureProcessNode | undefined): ParentTerminationState {
  if (!parent) return "modeled_unknown";
  if (parent.parentState === "running_expected_identity") return "modeled_running";
  if (["exited_success", "exited_failure", "terminated_by_external_actor"].includes(String(parent.parentState))) return "modeled_exited";
  if (parent.parentState === "ambiguous") return "modeled_contradictory";
  return "modeled_unknown";
}

function deriveDescendants(fixture: ScopedProcessObservationFixture, parentRef: string): string[] {
  const descendants = new Set<string>();
  const visit = (ref: string) => {
    for (const edge of fixture.relationships) {
      if (edge.parentNodeRef !== ref || descendants.has(edge.childNodeRef)) continue;
      descendants.add(edge.childNodeRef);
      visit(edge.childNodeRef);
    }
  };
  visit(parentRef);
  return [...descendants].sort();
}

function hasCycle(edges: readonly FixtureProcessRelationship[]): boolean {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const children = new Map<string, string[]>();
  for (const edge of edges) children.set(edge.parentNodeRef, [...(children.get(edge.parentNodeRef) ?? []), edge.childNodeRef]);
  const visit = (ref: string): boolean => {
    if (visiting.has(ref)) return true;
    if (visited.has(ref)) return false;
    visiting.add(ref);
    for (const child of children.get(ref) ?? []) if (visit(child)) return true;
    visiting.delete(ref);
    visited.add(ref);
    return false;
  };
  return [...children.keys()].some(visit);
}

function maxDepth(edges: readonly FixtureProcessRelationship[], root: string): number {
  const children = new Map<string, string[]>();
  for (const edge of edges) children.set(edge.parentNodeRef, [...(children.get(edge.parentNodeRef) ?? []), edge.childNodeRef]);
  const visiting = new Set<string>();
  const visit = (ref: string, depth: number): number => {
    if (visiting.has(ref)) return depth;
    visiting.add(ref);
    const max = Math.max(depth, ...(children.get(ref) ?? []).map((child) => visit(child, depth + 1)));
    visiting.delete(ref);
    return max;
  };
  return visit(root, 0);
}

function validateObservationWindow(window: Record<string, unknown>, evaluatedAt: string, errors: string[]): void {
  for (const key of ["startedAt", "endedAt", "capturedAt", "expiresAt"]) if (!isIso(window[key])) errors.push("evidence_stale");
  if (isIso(window.startedAt) && isIso(window.endedAt) && window.startedAt > window.endedAt) errors.push("evidence_stale");
  if (isIso(window.startedAt) && isIso(window.capturedAt) && window.capturedAt < window.startedAt) errors.push("evidence_stale");
  if (isIso(window.endedAt) && isIso(window.capturedAt) && window.capturedAt > window.endedAt) errors.push("evidence_stale");
  if (isIso(window.expiresAt) && isIso(evaluatedAt) && evaluatedAt > window.expiresAt) errors.push("evidence_stale");
}

function validateTimeRange(issuedAt: unknown, expiresAt: unknown, evaluatedAt: string, errors: string[], prefix: "request" | "capability"): void {
  if (!isIso(issuedAt) || !isIso(expiresAt)) {
    errors.push(prefix === "request" ? "request_invalid" : "capability_invalid");
    if (prefix === "request") errors.push("evidence_stale");
    return;
  }
  if (expiresAt <= issuedAt) {
    errors.push(prefix === "request" ? "request_expired" : "capability_expired");
    if (prefix === "request") errors.push("evidence_stale");
  }
  if (isIso(evaluatedAt) && evaluatedAt > expiresAt) {
    errors.push(prefix === "request" ? "request_expired" : "capability_expired");
    if (prefix === "request") errors.push("evidence_stale");
  }
}

function exact<T>(input: unknown, expected: T, prefix: string, fingerprintKey?: string, algorithmKey?: string, domain?: string): ScopedObserverValidationResult<T> {
  const errors = validateShape(input, expected, prefix, fingerprintKey, algorithmKey, domain);
  if (stableStringify(input) !== stableStringify(expected)) errors.push(`${prefix}_not_exact`);
  return validation(input, errors);
}

function validateShape(input: unknown, expected: unknown, prefix: string, fingerprintKey?: string, algorithmKey?: string, domain?: string, requireExactValues = true): string[] {
  const errors: string[] = [];
  if (!isRecord(input) || !isRecord(expected)) return [`${prefix}_invalid`];
  for (const key of Object.keys(input)) if (!Object.keys(expected).includes(key)) errors.push(`unknown_${prefix}_field:${key}`);
  for (const key of Object.keys(expected)) if (!Object.keys(input).includes(key)) errors.push(`missing_${prefix}_field:${key}`);
  if (hasSensitiveMaterial(input)) errors.push("sensitive_material_present");
  if (fingerprintKey && algorithmKey && domain) {
    if (input[algorithmKey] !== "sha256") errors.push("fingerprint_invalid");
    if (!isSha256(input[fingerprintKey])) errors.push("fingerprint_invalid");
    const core = { ...input };
    delete core[fingerprintKey];
    delete core[algorithmKey];
    if (isSha256(input[fingerprintKey]) && input[fingerprintKey] !== fingerprint(domain, core)) errors.push("fingerprint_invalid");
  }
  if (requireExactValues) {
    for (const key of Object.keys(expected)) {
      if (key === fingerprintKey || key === algorithmKey) continue;
      if (stableStringify(input[key]) !== stableStringify(expected[key])) errors.push(`${prefix}_field_mismatch:${key}`);
    }
  }
  return sorted(errors);
}

function validation<T>(input: unknown, errors: readonly string[]): ScopedObserverValidationResult<T> {
  if (errors.length > 0) return deepFreeze({ ok: false, errors: sorted(errors) });
  return deepFreeze({ ok: true, value: input as T });
}

function validationErrors(result: ScopedObserverValidationResult<unknown>): readonly string[] {
  return result.ok ? [] : result.errors;
}

function isBlockingReason(reason: string): boolean {
  return ![
    "parent_state_unavailable",
    "incomplete_direct_child_state",
    "incomplete_descendant_state",
    "incomplete_process_group_state",
    "incomplete_termination_state",
    "detachment_state_unknown",
    "process_group_escape_state_unknown",
    "daemonization_state_unknown",
    "child_semantic_classification_unknown",
    "evidence_stale",
    "evidence_session_inconsistent",
    "fixture_relationship_ambiguous",
  ].includes(reason);
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function isSha256(input: unknown): input is string {
  return typeof input === "string" && /^[a-f0-9]{64}$/u.test(input);
}

function isIso(input: unknown): input is string {
  return typeof input === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(input) && !Number.isNaN(Date.parse(input));
}

function isBoundarySession(input: unknown): input is string {
  return input === POST_TRADE_LIVE_READ_ONLY_MACOS_PROCESS_DRIVER_BOUNDARY_SESSION;
}

function isCapabilityId(input: unknown, prefix: string): boolean {
  return typeof input === "string" && input.startsWith(prefix) && /^[a-z0-9_]+$/u.test(input);
}

function isRequestId(input: unknown): boolean {
  return typeof input === "string" && /^scoped_process_observation_request_[0-9]{3}$/u.test(input);
}

function isFixtureNodeRef(input: unknown): boolean {
  return typeof input === "string" && /^fixture_process_node_[a-z0-9_]+$/u.test(input) && !/^\d+$/u.test(input) && !/^pid[_-]?\d+$/iu.test(input);
}

function hasProhibitedProcessInput(input: unknown): boolean {
  const prohibited = new Set([
    "pid",
    "ppid",
    "pgid",
    "uid",
    "processName",
    "executableName",
    "executablePath",
    "commandLine",
    "command",
    "query",
    "globalEnumeration",
    "contained",
    "terminated",
    "safe",
    "authority",
    "runnerEnabled",
    "processStart",
    "signal",
    "retryCount",
    "sameGroup",
    "escaped",
    "detached",
    "daemonized",
  ]);
  const seen = new WeakSet<object>();
  const visit = (value: unknown): boolean => {
    if (value === null || typeof value !== "object") return false;
    if (seen.has(value)) return false;
    seen.add(value);
    if (Array.isArray(value)) return value.some(visit);
    const record = value as Record<string, unknown>;
    return Object.keys(record).some((key) => prohibited.has(key) || visit(record[key]));
  };
  return visit(input);
}

function hasSensitiveMaterial(input: unknown): boolean {
  const seen = new WeakSet<object>();
  const visit = (value: unknown): boolean => {
    if (typeof value === "string") return /(\/users\/|\\users\\|path=|path:|process listing|command line|access[_ -]?token|refresh[_ -]?token|service[_ -]?role|anon[_ -]?key|api[_ -]?key|password|connection[_ -]?string|postgres:\/\/|authorization header|bearer|cookie|session[_ -]?(token|secret|cookie)|private[_ -]?key|client[_ -]?secret|keychain|bankid|jwt|eyj[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+)/iu.test(value);
    if (value === null || typeof value !== "object") return false;
    if (seen.has(value)) return false;
    seen.add(value);
    if (Array.isArray(value)) return value.some(visit);
    return Object.values(value as Record<string, unknown>).some(visit);
  };
  return visit(input);
}

function sanitizeNodeLabel(ref: string): string {
  return `fixture_node_${sha256(ref).slice(0, 12)}`;
}

function sorted(input: readonly string[]): string[] {
  return [...new Set(input)].sort();
}

function stableStringify(input: unknown): string {
  const stack = new WeakSet<object>();
  const normalize = (value: unknown): unknown => {
    if (value === null || typeof value !== "object") return value;
    if (stack.has(value)) throw new Error("cyclic input is not supported");
    stack.add(value);
    if (Array.isArray(value)) {
      const mapped = value.map(normalize);
      stack.delete(value);
      return mapped;
    }
    const record = value as Record<string, unknown>;
    const mapped = Object.fromEntries(Object.keys(record).sort().map((key) => [key, normalize(record[key])]));
    stack.delete(value);
    return mapped;
  };
  return JSON.stringify(normalize(input));
}

function fingerprint(domain: string, input: unknown): string {
  return sha256(`${domain}:${stableStringify(input)}`);
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function deepFreeze<T>(input: T): T {
  if (input === null || typeof input !== "object") return input;
  Object.freeze(input);
  for (const value of Object.values(input as Record<string, unknown>)) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) deepFreeze(value);
  }
  return input;
}
