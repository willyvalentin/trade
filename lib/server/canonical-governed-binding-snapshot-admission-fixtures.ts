import "server-only";

import {
  action666ajAuthority,
} from "@/lib/server/canonical-completed-improvement-evidence-capture-fixtures";
import {
  action666aqInsufficientEvidenceRequest,
  action666aqNoChangeRequest,
  action666aqProposalReadyRequest,
  action666aqResearchOnlyRequest,
} from "@/lib/server/canonical-governed-improvement-end-to-end-replay-fixtures";
import {
  action666axCapturedWithStore,
} from "@/lib/server/canonical-improvement-binding-store-fixtures";
import {
  action666vCalibrationRegressionFixture,
  action666vInsufficientFixture,
  action666vNoChangeFixture,
  action666vStableImprovementFixture,
} from "@/lib/server/canonical-model-improvement-proposal-fixtures";
import {
  canonicalModelImprovementDigest,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  CANONICAL_BINDING_BACKED_REPLAY_REQUEST_VERSION,
  CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION,
  createCanonicalBindingBackedImprovementReplayHarness,
  createCanonicalBindingSnapshotJsonSource,
  createCanonicalBindingSnapshotAdmissionAuthority,
  createCanonicalExternalImprovementBindingEntry,
  createCanonicalExternalImprovementBindingSnapshot,
  type CanonicalBindingBackedReplayRequest,
  type CanonicalBindingSnapshotAdmissionAuthority,
  type CanonicalBindingSnapshotAdmissionDependencies,
  type CanonicalExternalImprovementBindingEntry,
  type CanonicalExternalImprovementBindingSnapshot,
} from "@/lib/server/canonical-governed-binding-snapshot-admission";

type Fixture =
  | typeof action666vStableImprovementFixture
  | typeof action666vNoChangeFixture
  | typeof action666vCalibrationRegressionFixture
  | typeof action666vInsufficientFixture;

export const action666bdLookupAsOf =
  "2026-07-28T12:00:00.000000000Z";
export const action666bdCapturedAt =
  "2026-07-28T10:00:00.000000000Z";
export const action666bdEvidenceCutoff =
  "2026-07-28T09:59:59.999999999Z";
export const action666bdEffectiveAt =
  "2026-07-28T10:00:00.000000000Z";
export const action666bdOwnerAuthorityIdentity =
  "owner:governed-binding-admission";
export const action666bdOwnerBoundaryIdentity =
  "owner-boundary:governed-binding-admission";
export const action666bdAdmissionAuthorityIdentity =
  "authority:governed-binding-admission";

const sourceSectionDigest = canonicalModelImprovementDigest({
  source_namespace: "action_666bd_synthetic_binding_source",
  source_contract_version: "action_666bd_synthetic_binding_source_v1",
});

function asFixture(value: Fixture) {
  return value as typeof action666vStableImprovementFixture;
}

export function action666bdExternalSnapshot(
  fixture: Fixture = action666vStableImprovementFixture,
  entries: CanonicalExternalImprovementBindingEntry[] = [],
  overrides: Partial<{
    publication_sequence: number;
    publication_epoch: number;
    predecessor: CanonicalExternalImprovementBindingSnapshot["predecessor"];
    captured_at: string;
    evidence_cutoff: string;
    effective_at: string;
  }> = {},
) {
  const captureAuthority = action666ajAuthority(asFixture(fixture));
  return createCanonicalExternalImprovementBindingSnapshot({
    owner_authority_identity: action666bdOwnerAuthorityIdentity,
    registry_authority_identity:
      captureAuthority.proposal_registry_authority_identity,
    authority_manifest_digest:
      captureAuthority.proposal_registry_manifest_digest,
    authority_root_digest:
      captureAuthority.proposal_registry_root_digest,
    publication_sequence: overrides.publication_sequence ?? 1,
    publication_epoch: overrides.publication_epoch ?? 1,
    predecessor: overrides.predecessor ?? {
      state: "genesis",
      previous_snapshot_digest: null,
      previous_publication_sequence: null,
      previous_publication_epoch: null,
    },
    captured_at: overrides.captured_at ?? action666bdCapturedAt,
    evidence_cutoff:
      overrides.evidence_cutoff ?? action666bdEvidenceCutoff,
    effective_at: overrides.effective_at ?? action666bdEffectiveAt,
    entry_inventory: entries,
  });
}

export function action666bdAuthority(
  snapshot: CanonicalExternalImprovementBindingSnapshot,
) {
  return createCanonicalBindingSnapshotAdmissionAuthority({
    authority_identity: action666bdAdmissionAuthorityIdentity,
    owner_boundary_identity: action666bdOwnerBoundaryIdentity,
    snapshot,
  });
}

export function action666bdRequest(
  request = action666aqProposalReadyRequest,
): CanonicalBindingBackedReplayRequest {
  return {
    request_version: CANONICAL_BINDING_BACKED_REPLAY_REQUEST_VERSION,
    source_namespace: "binding_backed_governed_improvement_replay",
    admission_identity: `admission:${request.completed_capture_request.producer_capture_identity}`,
    lookup_as_of: action666bdLookupAsOf,
    end_to_end_request: request,
  };
}

export function action666bdDependencies(
  fixture: Fixture = action666vStableImprovementFixture,
  snapshot: unknown = action666bdExternalSnapshot(fixture),
  authority?: CanonicalBindingSnapshotAdmissionAuthority,
): CanonicalBindingSnapshotAdmissionDependencies {
  const snapshotJson = JSON.stringify(snapshot);
  if (snapshotJson === undefined) {
    throw new Error("action_666bd_snapshot_not_json_serializable");
  }
  return action666bdDependenciesFromJson(
    snapshotJson,
    authority ??
      action666bdAuthority(
        snapshot as CanonicalExternalImprovementBindingSnapshot,
      ),
    fixture,
  );
}

export function action666bdDependenciesFromJson(
  snapshotJson: string,
  expectedAuthority: CanonicalBindingSnapshotAdmissionAuthority,
  fixture: Fixture = action666vStableImprovementFixture,
): CanonicalBindingSnapshotAdmissionDependencies {
  const captureAuthority = action666ajAuthority(asFixture(fixture));
  return {
    authority_dependency: {
      owner_boundary_version:
        CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION,
      owner_boundary_identity: action666bdOwnerBoundaryIdentity,
      expected_authority_identity:
        expectedAuthority.authority_identity,
      expected_authority_digest: expectedAuthority.authority_digest,
      read_expected_authority: () => expectedAuthority,
    },
    snapshot_dependency:
      createCanonicalBindingSnapshotJsonSource(snapshotJson),
    capture_authority: captureAuthority,
    expected_capture_authority_identity:
      captureAuthority.authority_identity,
    expected_capture_authority_digest:
      captureAuthority.authority_digest,
  };
}

export function action666bdReplay(
  request = action666bdRequest(),
  dependencies = action666bdDependencies(),
) {
  const harness = action666bdHarness(dependencies);
  if (!harness.replay) {
    throw new Error("action_666bd_replay_unavailable");
  }
  return harness.replay(request);
}

export function action666bdHarness(
  dependencies = action666bdDependencies(),
) {
  return createCanonicalBindingBackedImprovementReplayHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies,
  });
}

export const action666bdProposalReadyRequest = action666bdRequest();
export const action666bdNoChangeRequest = action666bdRequest(
  action666aqNoChangeRequest,
);
export const action666bdResearchOnlyRequest = action666bdRequest(
  action666aqResearchOnlyRequest,
);
export const action666bdInsufficientEvidenceRequest =
  action666bdRequest(action666aqInsufficientEvidenceRequest);

export const action666bdProposalReadyDependencies =
  action666bdDependencies();
export const action666bdNoChangeDependencies =
  action666bdDependencies(action666vNoChangeFixture);
export const action666bdResearchOnlyDependencies =
  action666bdDependencies(action666vCalibrationRegressionFixture);
export const action666bdInsufficientEvidenceDependencies =
  action666bdDependencies(action666vInsufficientFixture);

export function action666bdPreviousBindingCollisionDependencies() {
  const proposal =
    action666vStableImprovementFixture.post.payload
      .proposal_candidates[0];
  const entry = createCanonicalExternalImprovementBindingEntry({
    entry_type: "previous_binding",
    bound_identity_type: "proposal",
    bound_identity: proposal.proposal_identity,
    observed_binding_digest: "c".repeat(64),
    expected_binding_digest: "c".repeat(64),
    source_evidence_namespace:
      "canonical_previous_binding_evidence",
    source_section_digest: sourceSectionDigest,
    effective_at: action666bdEvidenceCutoff,
  });
  return action666bdDependencies(
    action666vStableImprovementFixture,
    action666bdExternalSnapshot(
      action666vStableImprovementFixture,
      [entry],
    ),
  );
}

export function action666bdCaptureBindingCollisionDependencies() {
  const capture = action666axCapturedWithStore();
  if (capture.status !== "captured") {
    throw new Error("action_666bd_capture_fixture_unavailable");
  }
  const entry = createCanonicalExternalImprovementBindingEntry({
    entry_type: "capture_binding",
    bound_identity_type: "capture",
    bound_identity: capture.capture.capture_identity,
    observed_binding_digest: "d".repeat(64),
    expected_binding_digest: "d".repeat(64),
    source_evidence_namespace:
      "canonical_capture_binding_evidence",
    source_section_digest: sourceSectionDigest,
    effective_at: action666bdEvidenceCutoff,
  });
  return action666bdDependencies(
    action666vStableImprovementFixture,
    action666bdExternalSnapshot(
      action666vStableImprovementFixture,
      [entry],
    ),
  );
}

function recomputeSnapshot(
  snapshot: CanonicalExternalImprovementBindingSnapshot,
) {
  const payload = structuredClone(snapshot);
  delete (
    payload as Partial<CanonicalExternalImprovementBindingSnapshot>
  ).snapshot_digest;
  snapshot.snapshot_digest = canonicalModelImprovementDigest(payload);
  return snapshot;
}

function recomputeEntry(
  entry: CanonicalExternalImprovementBindingEntry,
) {
  const payload = structuredClone(entry);
  delete (
    payload as Partial<CanonicalExternalImprovementBindingEntry>
  ).entry_digest;
  entry.entry_digest = canonicalModelImprovementDigest(payload);
  return entry;
}

function recomputeInventory(
  snapshot: CanonicalExternalImprovementBindingSnapshot,
) {
  snapshot.entry_inventory_digest = canonicalModelImprovementDigest({
    inventory_version: "canonical_external_binding_inventory_v1",
    entries: snapshot.entry_inventory.map((item) => ({
      entry_identity: item.entry_identity,
      entry_digest: item.entry_digest,
    })),
  });
  return recomputeSnapshot(snapshot);
}

export function action666bdIncompleteSnapshotDependencies() {
  const snapshot = structuredClone(action666bdExternalSnapshot());
  delete (
    snapshot as Partial<CanonicalExternalImprovementBindingSnapshot>
  ).entry_inventory;
  return action666bdDependencies(
    action666vStableImprovementFixture,
    snapshot,
    action666bdAuthority(action666bdExternalSnapshot()),
  );
}

export function action666bdAuthorityConflictDependencies() {
  const expected = action666bdExternalSnapshot();
  const changed = structuredClone(expected);
  changed.authority_root_digest = "e".repeat(64);
  recomputeSnapshot(changed);
  return action666bdDependencies(
    action666vStableImprovementFixture,
    changed,
    action666bdAuthority(expected),
  );
}

export function action666bdSelfConsistentReplacementDependencies() {
  const changed = structuredClone(action666bdExternalSnapshot());
  changed.authority_root_digest = "e".repeat(64);
  changed.authority_manifest_digest = "f".repeat(64);
  recomputeSnapshot(changed);
  return action666bdDependencies(
    action666vStableImprovementFixture,
    changed,
    action666bdAuthority(changed),
  );
}

export function action666bdSnapshotDigestMismatchDependencies() {
  const changed = structuredClone(action666bdExternalSnapshot());
  changed.snapshot_digest = "f".repeat(64);
  return action666bdDependencies(
    action666vStableImprovementFixture,
    changed,
    action666bdAuthority(action666bdExternalSnapshot()),
  );
}

export function action666bdFutureSnapshotDependencies() {
  const snapshot = action666bdExternalSnapshot(
    action666vStableImprovementFixture,
    [],
    {
      captured_at: "2026-07-29T10:00:00.000000000Z",
      evidence_cutoff: "2026-07-29T09:59:59.999999999Z",
      effective_at: "2026-07-29T10:00:00.000000000Z",
    },
  );
  return action666bdDependencies(
    action666vStableImprovementFixture,
    snapshot,
  );
}

export function action666bdDuplicateEntriesDependencies() {
  const proposal =
    action666vStableImprovementFixture.post.payload
      .proposal_candidates[0];
  const entry = createCanonicalExternalImprovementBindingEntry({
    entry_type: "previous_binding",
    bound_identity_type: "proposal",
    bound_identity: proposal.proposal_identity,
    observed_binding_digest: proposal.semantic_digest,
    expected_binding_digest: proposal.semantic_digest,
    source_evidence_namespace:
      "canonical_previous_binding_evidence",
    source_section_digest: sourceSectionDigest,
    effective_at: action666bdEvidenceCutoff,
  });
  const validSnapshot = action666bdExternalSnapshot(
    action666vStableImprovementFixture,
    [entry],
  );
  const authority = action666bdAuthority(validSnapshot);
  const snapshot = structuredClone(validSnapshot);
  snapshot.entry_inventory.push(structuredClone(entry));
  recomputeInventory(snapshot);
  return action666bdDependencies(
    action666vStableImprovementFixture,
    snapshot,
    authority,
  );
}

export function action666bdCrossTypeCollisionDependencies() {
  const identity = "capture:cross-type-collision";
  const previous = createCanonicalExternalImprovementBindingEntry({
    entry_type: "previous_binding",
    bound_identity_type: "proposal",
    bound_identity: identity,
    observed_binding_digest: "a".repeat(64),
    expected_binding_digest: "a".repeat(64),
    source_evidence_namespace:
      "canonical_previous_binding_evidence",
    source_section_digest: sourceSectionDigest,
    effective_at: action666bdEvidenceCutoff,
  });
  const capture = createCanonicalExternalImprovementBindingEntry({
    entry_type: "capture_binding",
    bound_identity_type: "capture",
    bound_identity: identity,
    observed_binding_digest: "b".repeat(64),
    expected_binding_digest: "b".repeat(64),
    source_evidence_namespace:
      "canonical_capture_binding_evidence",
    source_section_digest: sourceSectionDigest,
    effective_at: action666bdEvidenceCutoff,
  });
  const validSnapshot = action666bdExternalSnapshot(
    action666vStableImprovementFixture,
    [previous],
  );
  const authority = action666bdAuthority(validSnapshot);
  const snapshot = structuredClone(validSnapshot);
  snapshot.entry_inventory.push(structuredClone(capture));
  snapshot.entry_inventory.sort((first, second) =>
    first.entry_identity.localeCompare(second.entry_identity),
  );
  recomputeInventory(snapshot);
  return action666bdDependencies(
    action666vStableImprovementFixture,
    snapshot,
    authority,
  );
}

export function action666bdPredecessorMismatchDependencies() {
  const predecessor = action666bdExternalSnapshot();
  const current = action666bdExternalSnapshot(
    action666vStableImprovementFixture,
    [],
    {
      publication_sequence: 2,
      publication_epoch: 2,
      predecessor: {
        state: "linked",
        previous_snapshot_digest: predecessor.snapshot_digest,
        previous_publication_sequence: 1,
        previous_publication_epoch: 1,
      },
    },
  );
  const changed = structuredClone(current);
  changed.predecessor.previous_snapshot_digest = "f".repeat(64);
  recomputeSnapshot(changed);
  return action666bdDependencies(
    action666vStableImprovementFixture,
    changed,
    action666bdAuthority(current),
  );
}

export function action666bdEvidenceAfterCutoffDependencies() {
  const entry = createCanonicalExternalImprovementBindingEntry({
    entry_type: "previous_binding",
    bound_identity_type: "proposal",
    bound_identity: "proposal:future-evidence",
    observed_binding_digest: "a".repeat(64),
    expected_binding_digest: "a".repeat(64),
    source_evidence_namespace:
      "canonical_previous_binding_evidence",
    source_section_digest: sourceSectionDigest,
    effective_at: action666bdEvidenceCutoff,
  });
  const validSnapshot = action666bdExternalSnapshot(
      action666vStableImprovementFixture,
      [entry],
    );
  const authority = action666bdAuthority(validSnapshot);
  const snapshot = structuredClone(validSnapshot);
  snapshot.entry_inventory[0].effective_at =
    "2026-07-28T10:00:00.000000000Z";
  recomputeEntry(snapshot.entry_inventory[0]);
  recomputeInventory(snapshot);
  return action666bdDependencies(
    action666vStableImprovementFixture,
    snapshot,
    authority,
  );
}

export function action666bdStatusDigestConflictDependencies() {
  const proposal =
    action666vStableImprovementFixture.post.payload
      .proposal_candidates[0];
  const entry = createCanonicalExternalImprovementBindingEntry({
    entry_type: "previous_binding",
    bound_identity_type: "proposal",
    bound_identity: proposal.proposal_identity,
    observed_binding_digest: proposal.semantic_digest,
    expected_binding_digest: proposal.semantic_digest,
    source_evidence_namespace:
      "canonical_previous_binding_evidence",
    source_section_digest: sourceSectionDigest,
    effective_at: action666bdEvidenceCutoff,
  });
  const validSnapshot = action666bdExternalSnapshot(
      action666vStableImprovementFixture,
      [entry],
    );
  const authority = action666bdAuthority(validSnapshot);
  const snapshot = structuredClone(validSnapshot);
  snapshot.entry_inventory[0].expected_binding_digest = "f".repeat(64);
  recomputeEntry(snapshot.entry_inventory[0]);
  recomputeInventory(snapshot);
  return action666bdDependencies(
    action666vStableImprovementFixture,
    snapshot,
    authority,
  );
}

export function action666bdCallerAuthorityRequest() {
  return {
    ...action666bdProposalReadyRequest,
    expected_authority_root: "a".repeat(64),
    trusted_registry_payload: {},
    approved: true,
    live: true,
    automatic_training_allowed: true,
    automatic_promotion_allowed: true,
  };
}

export function action666bdReorderedRequest() {
  const request = structuredClone(action666bdProposalReadyRequest);
  request.end_to_end_request = Object.fromEntries(
    Object.entries(request.end_to_end_request).reverse(),
  ) as typeof request.end_to_end_request;
  return Object.fromEntries(
    Object.entries(request).reverse(),
  ) as CanonicalBindingBackedReplayRequest;
}

export function action666bdGetterSnapshotDependencies() {
  const dependencies = action666bdDependencies();
  return {
    ...dependencies,
    snapshot_dependency: Object.freeze({
      source_contract_version:
        "canonical_external_binding_snapshot_source_v1" as const,
    }),
  };
}

export const action666bdGoldenScenarios = [
  {
    name: "proposal_ready",
    request: action666bdProposalReadyRequest,
    dependencies: action666bdProposalReadyDependencies,
  },
  {
    name: "no_change",
    request: action666bdNoChangeRequest,
    dependencies: action666bdNoChangeDependencies,
  },
  {
    name: "research_only",
    request: action666bdResearchOnlyRequest,
    dependencies: action666bdResearchOnlyDependencies,
  },
  {
    name: "insufficient_evidence",
    request: action666bdInsufficientEvidenceRequest,
    dependencies: action666bdInsufficientEvidenceDependencies,
  },
  {
    name: "previous_binding_collision",
    request: action666bdProposalReadyRequest,
    dependencies: action666bdPreviousBindingCollisionDependencies(),
  },
  {
    name: "capture_binding_collision",
    request: action666bdProposalReadyRequest,
    dependencies: action666bdCaptureBindingCollisionDependencies(),
  },
  {
    name: "incomplete_snapshot",
    request: action666bdProposalReadyRequest,
    dependencies: action666bdIncompleteSnapshotDependencies(),
  },
  {
    name: "authority_conflict",
    request: action666bdProposalReadyRequest,
    dependencies: action666bdAuthorityConflictDependencies(),
  },
  {
    name: "point_in_time_violation",
    request: action666bdProposalReadyRequest,
    dependencies: action666bdFutureSnapshotDependencies(),
  },
] as const;
