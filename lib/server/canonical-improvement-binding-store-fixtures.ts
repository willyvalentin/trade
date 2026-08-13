import "server-only";

import {
  action666ajCapturedRequest,
  action666ajStableAuthority,
} from "@/lib/server/canonical-completed-improvement-evidence-capture-fixtures";
import {
  createCanonicalCompletedImprovementCaptureHarness,
} from "@/lib/server/canonical-completed-improvement-evidence-capture";
import {
  createCanonicalImprovementProposalReplayHarness,
  canonicalCompletedImprovementEvidenceBundleDigest,
} from "@/lib/server/canonical-model-improvement-input-adapter";
import {
  action666vStableImprovementFixture,
} from "@/lib/server/canonical-model-improvement-proposal-fixtures";
import {
  action666aqDependencies,
  action666aqProposalReadyRequest,
} from "@/lib/server/canonical-governed-improvement-end-to-end-replay-fixtures";
import {
  createCanonicalGovernedImprovementEndToEndReplayHarness,
} from "@/lib/server/canonical-governed-improvement-end-to-end-replay";
import {
  canonicalModelImprovementDigest,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION,
  createCanonicalImprovementBindingEntry,
  createCanonicalImprovementBindingLookupAdapters,
  createCanonicalImprovementBindingSnapshot,
  createCanonicalImprovementBindingSnapshotAuthority,
  createCanonicalImprovementBindingStoreHarness,
  type CanonicalImprovementBindingEntry,
  type CanonicalImprovementBindingOwnerDependency,
  type CanonicalImprovementBindingSnapshot,
  type CanonicalImprovementBindingSnapshotAuthority,
} from "@/lib/server/canonical-improvement-binding-store";

export const action666axLookupAsOf =
  "2026-07-28T12:00:00.000000000Z";
export const action666axOwnerAuthorityIdentity =
  "owner:trade-intelligence-binding-snapshots";
export const action666axOwnerBoundaryIdentity =
  "owner-boundary:trade-intelligence-binding-snapshots";
export const action666axAuthorityIdentity =
  "authority:trade-intelligence-binding-snapshots";
export const action666axExternalTrustRoot =
  action666vStableImprovementFixture.trustBoundary.registry.root_digest;

const sourceDigest = canonicalModelImprovementDigest({
  source: "action_666ax_synthetic_binding_source",
});

function previousEntries() {
  const proposals =
    action666vStableImprovementFixture.post.payload.proposal_candidates.map(
      (proposal) =>
        createCanonicalImprovementBindingEntry({
          entry_type: "previous_binding",
          bound_identity_type: "proposal",
          bound_identity: proposal.proposal_identity,
          observed_binding_digest: proposal.semantic_digest,
          source_evidence_namespace:
            "canonical_previous_binding_evidence",
          source_evidence_digest: sourceDigest,
          effective_at: "2026-07-28T00:00:00.000000000Z",
        }),
    );
  const plan =
    action666vStableImprovementFixture.post.payload.experiment_plan;
  if (plan) {
    proposals.push(
      createCanonicalImprovementBindingEntry({
        entry_type: "previous_binding",
        bound_identity_type: "experiment",
        bound_identity: plan.plan_identity,
        observed_binding_digest: plan.semantic_digest,
        source_evidence_namespace:
          "canonical_previous_binding_evidence",
        source_evidence_digest: sourceDigest,
        effective_at: "2026-07-28T00:00:00.000000000Z",
      }),
    );
  }
  return proposals;
}

function snapshot(
  entries: CanonicalImprovementBindingEntry[] = [],
  overrides: Partial<{
    publication_sequence: number;
    publication_epoch: number;
    predecessor: CanonicalImprovementBindingSnapshot["predecessor"];
    published_at: string;
    effective_at: string;
    expected_external_trust_root: string;
  }> = {},
) {
  return createCanonicalImprovementBindingSnapshot({
    owner_authority_identity: action666axOwnerAuthorityIdentity,
    publication_sequence: overrides.publication_sequence ?? 1,
    publication_epoch: overrides.publication_epoch ?? 1,
    predecessor: overrides.predecessor ?? {
      state: "genesis",
      previous_snapshot_digest: null,
      previous_publication_sequence: null,
      previous_publication_epoch: null,
    },
    published_at:
      overrides.published_at ?? "2026-07-27T20:00:00.000000000Z",
    effective_at:
      overrides.effective_at ?? "2026-07-27T20:00:00.000000000Z",
    entry_inventory: entries,
    expected_external_trust_root:
      overrides.expected_external_trust_root ??
      action666axExternalTrustRoot,
  });
}

export function action666axOwnerDependency(
  verifiedSnapshot: unknown,
  authority?: CanonicalImprovementBindingSnapshotAuthority,
): CanonicalImprovementBindingOwnerDependency {
  const expectedAuthority =
    authority ??
    createCanonicalImprovementBindingSnapshotAuthority({
      authority_identity: action666axAuthorityIdentity,
      owner_boundary_identity: action666axOwnerBoundaryIdentity,
      snapshot:
        verifiedSnapshot as CanonicalImprovementBindingSnapshot,
    });
  return {
    owner_boundary_version:
      CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION,
    owner_boundary_identity: action666axOwnerBoundaryIdentity,
    expected_authority_identity: expectedAuthority.authority_identity,
    expected_authority_digest: expectedAuthority.authority_digest,
    read_expected_authority: () => expectedAuthority,
    read_verified_snapshot: () => verifiedSnapshot,
  };
}

export const action666axEmptySnapshot = snapshot();
export const action666axPreviousBindingSnapshot = snapshot(
  previousEntries(),
);
export const action666axEmptyOwnerDependency = action666axOwnerDependency(
  action666axEmptySnapshot,
);
export const action666axPreviousOwnerDependency =
  action666axOwnerDependency(action666axPreviousBindingSnapshot);

export function action666axStore(
  dependency: CanonicalImprovementBindingOwnerDependency =
    action666axEmptyOwnerDependency,
) {
  const harness = createCanonicalImprovementBindingStoreHarness({
    enabled: true,
    kill_switch_engaged: false,
    owner_dependency: dependency,
  });
  if (!harness.store) {
    throw new Error("action_666ax_store_unavailable");
  }
  return harness.store;
}

export function action666axAdapters(
  dependency: CanonicalImprovementBindingOwnerDependency =
    action666axEmptyOwnerDependency,
  asOf: string = action666axLookupAsOf,
) {
  return createCanonicalImprovementBindingLookupAdapters({
    store: action666axStore(dependency),
    as_of: asOf,
  });
}

export function action666axPreviousCollisionSnapshot() {
  const entries = previousEntries().map((entry, index) => {
    if (index !== 0) return entry;
    return createCanonicalImprovementBindingEntry({
      entry_type: entry.entry_type,
      bound_identity_type: entry.bound_identity_type as
        | "proposal"
        | "experiment",
      bound_identity: entry.bound_identity,
      observed_binding_digest: "c".repeat(64),
      source_evidence_namespace:
        "canonical_previous_binding_evidence",
      source_evidence_digest: entry.source_evidence_digest,
      effective_at: entry.effective_at,
    });
  });
  return snapshot(entries);
}

export function action666axFutureSnapshot() {
  return snapshot([], {
    published_at: "2026-07-29T00:00:00.000000000Z",
    effective_at: "2026-07-29T00:00:00.000000000Z",
  });
}

export function action666axRollbackPair() {
  const predecessor = action666axEmptySnapshot;
  const current = snapshot([], {
    publication_sequence: 2,
    publication_epoch: 2,
    predecessor: {
      state: "linked",
      previous_snapshot_digest: predecessor.snapshot_digest,
      previous_publication_sequence: 1,
      previous_publication_epoch: 1,
    },
  });
  const authority = createCanonicalImprovementBindingSnapshotAuthority({
    authority_identity: action666axAuthorityIdentity,
    owner_boundary_identity: action666axOwnerBoundaryIdentity,
    snapshot: current,
  });
  return {
    current,
    predecessor,
    rollback_dependency: action666axOwnerDependency(
      predecessor,
      authority,
    ),
  };
}

function recomputeSnapshotDigest(
  value: CanonicalImprovementBindingSnapshot,
) {
  const payload = structuredClone(value);
  delete (payload as Partial<CanonicalImprovementBindingSnapshot>)
    .snapshot_digest;
  value.snapshot_digest = canonicalModelImprovementDigest(payload);
  return value;
}

export function action666axTrustRootSubstitution() {
  const substituted = structuredClone(action666axEmptySnapshot);
  substituted.expected_external_trust_root = "f".repeat(64);
  recomputeSnapshotDigest(substituted);
  return action666axOwnerDependency(
    substituted,
    createCanonicalImprovementBindingSnapshotAuthority({
      authority_identity: action666axAuthorityIdentity,
      owner_boundary_identity: action666axOwnerBoundaryIdentity,
      snapshot: action666axEmptySnapshot,
    }),
  );
}

export function action666axDuplicateSnapshot() {
  const entry = previousEntries()[0];
  const duplicate = snapshot([entry, entry]);
  return action666axOwnerDependency(duplicate);
}

export function action666axCrossTypeCollisionSnapshot() {
  const previous = previousEntries()[0];
  const capture = createCanonicalImprovementBindingEntry({
    entry_type: "capture_binding",
    bound_identity_type: "capture",
    bound_identity: previous.bound_identity,
    observed_binding_digest: "d".repeat(64),
    source_evidence_namespace: "canonical_capture_binding_evidence",
    source_evidence_digest: sourceDigest,
    effective_at: "2026-07-28T00:00:00.000000000Z",
  });
  const colliding = snapshot([previous, capture]);
  return action666axOwnerDependency(colliding);
}

export function action666axCapturedWithStore(
  dependency: CanonicalImprovementBindingOwnerDependency =
    action666axEmptyOwnerDependency,
) {
  const adapters = action666axAdapters(dependency);
  const harness = createCanonicalCompletedImprovementCaptureHarness({
    enabled: true,
    kill_switch_engaged: false,
    authority: action666ajStableAuthority,
    previous_binding_lookup: adapters.previous_binding_lookup,
    capture_binding_lookup: adapters.capture_binding_lookup,
  });
  if (!harness.capture) {
    throw new Error("action_666ax_capture_unavailable");
  }
  return harness.capture(action666ajCapturedRequest);
}

export function action666axMatchingCaptureSnapshot() {
  const first = action666axCapturedWithStore();
  if (first.status !== "captured") {
    throw new Error("action_666ax_initial_capture_failed");
  }
  const entry = createCanonicalImprovementBindingEntry({
    entry_type: "capture_binding",
    bound_identity_type: "capture",
    bound_identity: first.capture.capture_identity,
    observed_binding_digest: first.capture.semantic_binding_digest,
    source_evidence_namespace: "canonical_capture_binding_evidence",
    source_evidence_digest: first.capture.capture_digest,
    effective_at: "2026-07-28T00:00:00.000000000Z",
  });
  return snapshot([entry]);
}

export function action666axCaptureCollisionSnapshot() {
  const first = action666axCapturedWithStore();
  if (first.status !== "captured") {
    throw new Error("action_666ax_initial_capture_failed");
  }
  const entry = createCanonicalImprovementBindingEntry({
    entry_type: "capture_binding",
    bound_identity_type: "capture",
    bound_identity: first.capture.capture_identity,
    observed_binding_digest: "e".repeat(64),
    source_evidence_namespace: "canonical_capture_binding_evidence",
    source_evidence_digest: first.capture.capture_digest,
    effective_at: "2026-07-28T00:00:00.000000000Z",
  });
  return snapshot([entry]);
}

export function action666axMappedWithStore() {
  const captured = action666axCapturedWithStore();
  if (captured.status !== "captured") {
    throw new Error("action_666ax_capture_for_adapter_failed");
  }
  const adapters = action666axAdapters();
  const harness = createCanonicalImprovementProposalReplayHarness({
    enabled: true,
    kill_switch_engaged: false,
    previous_binding_lookup: adapters.previous_binding_lookup,
  });
  if (!harness.replay) {
    throw new Error("action_666ax_adapter_unavailable");
  }
  return harness.replay({
    bundle: captured.capture.bundle,
    expected_bundle_digest:
      canonicalCompletedImprovementEvidenceBundleDigest(
        captured.capture.bundle,
      ),
  });
}

export function action666axReplayWithStore() {
  const adapters = action666axAdapters();
  const dependencies = action666aqDependencies(
    action666vStableImprovementFixture,
    {
      capture_previous_binding_lookup:
        adapters.previous_binding_lookup,
      adapter_previous_binding_lookup:
        adapters.previous_binding_lookup,
      proposal_previous_binding_lookup:
        adapters.previous_binding_lookup,
      capture_binding_lookup: adapters.capture_binding_lookup,
    },
  );
  const harness =
    createCanonicalGovernedImprovementEndToEndReplayHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies,
    });
  if (!harness.replay) {
    throw new Error("action_666ax_replay_unavailable");
  }
  return harness.replay(action666aqProposalReadyRequest);
}

export const action666axGoldenLookupScenarios = [
  {
    name: "absent_first_capture",
    run: () =>
      action666axStore().lookup_capture_binding({
        capture_identity: "capture:synthetic-first",
        as_of: action666axLookupAsOf,
      }),
  },
  {
    name: "matching_previous_binding",
    run: () => {
      const proposal =
        action666vStableImprovementFixture.post.payload
          .proposal_candidates[0];
      return action666axStore(
        action666axPreviousOwnerDependency,
      ).lookup_previous_binding({
        binding_identity_type: "proposal",
        binding_identity: proposal.proposal_identity,
        as_of: action666axLookupAsOf,
      });
    },
  },
  {
    name: "future_snapshot",
    run: () =>
      action666axStore(
        action666axOwnerDependency(action666axFutureSnapshot()),
      ).lookup_capture_binding({
        capture_identity: "capture:future",
        as_of: action666axLookupAsOf,
      }),
  },
  {
    name: "trust_root_substitution",
    run: () =>
      action666axStore(
        action666axTrustRootSubstitution(),
      ).lookup_capture_binding({
        capture_identity: "capture:substitution",
        as_of: action666axLookupAsOf,
      }),
  },
  {
    name: "rollback_attempt",
    run: () =>
      action666axStore(
        action666axRollbackPair().rollback_dependency,
      ).lookup_capture_binding({
        capture_identity: "capture:rollback",
        as_of: action666axLookupAsOf,
      }),
  },
  {
    name: "duplicate_inventory",
    run: () =>
      action666axStore(
        action666axDuplicateSnapshot(),
      ).lookup_previous_binding({
        binding_identity_type: "proposal",
        binding_identity:
          action666vStableImprovementFixture.post.payload
            .proposal_candidates[0].proposal_identity,
        as_of: action666axLookupAsOf,
      }),
  },
] as const;
