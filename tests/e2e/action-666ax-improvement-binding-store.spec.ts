import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666ax-golden-improvement-binding-store-report.json";
import {
  action666axAdapters,
  action666axAuthorityIdentity,
  action666axCaptureCollisionSnapshot,
  action666axCapturedWithStore,
  action666axCrossTypeCollisionSnapshot,
  action666axDuplicateSnapshot,
  action666axEmptyOwnerDependency,
  action666axEmptySnapshot,
  action666axFutureSnapshot,
  action666axGoldenLookupScenarios,
  action666axLookupAsOf,
  action666axMappedWithStore,
  action666axMatchingCaptureSnapshot,
  action666axOwnerDependency,
  action666axOwnerBoundaryIdentity,
  action666axPreviousBindingSnapshot,
  action666axPreviousCollisionSnapshot,
  action666axPreviousOwnerDependency,
  action666axReplayWithStore,
  action666axRollbackPair,
  action666axStore,
  action666axTrustRootSubstitution,
} from "@/lib/server/canonical-improvement-binding-store-fixtures";
import {
  CANONICAL_IMPROVEMENT_BINDING_ENTRY_TYPES,
  CANONICAL_IMPROVEMENT_BINDING_LOOKUP_STATUSES,
  CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION,
  CANONICAL_IMPROVEMENT_BINDING_STORE_VERSION,
  DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_ENABLED,
  DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_KILL_SWITCH_ENGAGED,
  canonicalImprovementBindingSnapshotIdentity,
  createCanonicalImprovementBindingLookupAdapters,
  createCanonicalImprovementBindingSnapshotAuthority,
  createCanonicalImprovementBindingStoreHarness,
  type CanonicalImprovementBindingSnapshotAuthority,
  type CanonicalImprovementBindingStoreCounters,
  type CanonicalImprovementBindingSnapshot,
} from "@/lib/server/canonical-improvement-binding-store";
import {
  action666vStableImprovementFixture,
} from "@/lib/server/canonical-model-improvement-proposal-fixtures";
import {
  canonicalModelImprovementDigest,
} from "@/lib/server/canonical-model-improvement-proposal";

function zeroCounters(): CanonicalImprovementBindingStoreCounters {
  return {
    request_reads: 0,
    snapshot_reads: 0,
    clones: 0,
    authority_lookups: 0,
    entry_lookups: 0,
    digest_operations: 0,
    downstream_aj_ac_aq_executions: 0,
  };
}

function proposalIdentity() {
  return action666vStableImprovementFixture.post.payload
    .proposal_candidates[0].proposal_identity;
}

function rehashSnapshot(
  snapshot: CanonicalImprovementBindingSnapshot,
): CanonicalImprovementBindingSnapshot {
  const payload = structuredClone(snapshot);
  delete (payload as Partial<CanonicalImprovementBindingSnapshot>)
    .snapshot_digest;
  snapshot.snapshot_digest = canonicalModelImprovementDigest(payload);
  return snapshot;
}

function rehashAuthority(
  authority: CanonicalImprovementBindingSnapshotAuthority,
): CanonicalImprovementBindingSnapshotAuthority {
  const payload = structuredClone(authority);
  delete (
    payload as Partial<CanonicalImprovementBindingSnapshotAuthority>
  ).authority_digest;
  authority.authority_digest = canonicalModelImprovementDigest(payload);
  return authority;
}

test.describe("Action 666AX frozen improvement binding snapshot and read-only store", () => {
  test("freezes exact contract taxonomies and immutable snapshot bytes", () => {
    expect(CANONICAL_IMPROVEMENT_BINDING_ENTRY_TYPES).toEqual([
      "previous_binding",
      "capture_binding",
    ]);
    expect(CANONICAL_IMPROVEMENT_BINDING_LOOKUP_STATUSES).toEqual([
      "found",
      "absent",
      "conflicting",
      "not_effective",
      "invalid_snapshot",
    ]);
    expect(action666axEmptySnapshot.snapshot_version).toBe(
      CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION,
    );
    expect(Object.isFrozen(action666axEmptySnapshot)).toBe(true);
    expect(Object.isFrozen(action666axEmptySnapshot.entry_inventory)).toBe(
      true,
    );
  });

  test("returns deterministic absent and found results bound to snapshot and entry", () => {
    const absent = action666axStore().lookup_capture_binding({
      capture_identity: "capture:first",
      as_of: action666axLookupAsOf,
    });
    expect(absent).toMatchObject({
      status: "absent",
      snapshot_identity: action666axEmptySnapshot.snapshot_identity,
      snapshot_digest: action666axEmptySnapshot.snapshot_digest,
      entry_identity: null,
      observed_binding_digest: null,
    });
    const found = action666axStore(
      action666axPreviousOwnerDependency,
    ).lookup_previous_binding({
      binding_identity_type: "proposal",
      binding_identity: proposalIdentity(),
      as_of: action666axLookupAsOf,
    });
    expect(found).toMatchObject({
      status: "found",
      snapshot_identity:
        action666axPreviousBindingSnapshot.snapshot_identity,
      snapshot_digest:
        action666axPreviousBindingSnapshot.snapshot_digest,
      observed_binding_digest:
        action666vStableImprovementFixture.post.payload
          .proposal_candidates[0].semantic_digest,
      reason_codes: [],
    });
    expect(found.entry_identity).not.toBeNull();
    expect(found.entry_digest).toMatch(/^[a-f0-9]{64}$/);
  });

  test("canonicalizes offset-equivalent as-of instants identically", () => {
    const store = action666axStore();
    const utc = store.lookup_capture_binding({
      capture_identity: "capture:offset-parity",
      as_of: "2026-07-28T12:00:00.123456789Z",
    });
    const offset = store.lookup_capture_binding({
      capture_identity: "capture:offset-parity",
      as_of: "2026-07-28T14:00:00.123456789+02:00",
    });
    expect(offset).toEqual(utc);
    expect(offset.as_of).toBe("2026-07-28T12:00:00.123456789Z");
  });

  test("fails closed for naive, malformed, and future visibility", () => {
    const naive = action666axStore().lookup_capture_binding({
      capture_identity: "capture:naive",
      as_of: "2026-07-28T12:00:00",
    });
    expect(naive).toMatchObject({
      status: "not_effective",
      reason_codes: ["lookup_as_of_not_explicit_instant"],
    });
    const future = action666axStore(
      action666axOwnerDependency(action666axFutureSnapshot()),
    ).lookup_capture_binding({
      capture_identity: "capture:future",
      as_of: action666axLookupAsOf,
    });
    expect(future).toMatchObject({
      status: "not_effective",
      reason_codes: ["snapshot_not_effective_at_lookup"],
    });
  });

  test("rejects external-root substitution and rollback against a newer epoch", () => {
    const substituted = action666axStore(
      action666axTrustRootSubstitution(),
    ).lookup_capture_binding({
      capture_identity: "capture:substituted",
      as_of: action666axLookupAsOf,
    });
    expect(substituted.status).toBe("invalid_snapshot");
    expect(substituted.reason_codes).toContain(
      "snapshot_authority_binding_mismatch",
    );
    expect(substituted.reason_codes).toContain(
      "snapshot_external_trust_root_mismatch",
    );
    expect(substituted.snapshot_identity).not.toBeNull();
    expect(substituted.authority_identity).not.toBeNull();
    expect(substituted.authority_digest).toMatch(/^[a-f0-9]{64}$/);
    expect(substituted.expected_external_trust_root).toMatch(
      /^[a-f0-9]{64}$/,
    );

    const rollback = action666axStore(
      action666axRollbackPair().rollback_dependency,
    ).lookup_capture_binding({
      capture_identity: "capture:rollback",
      as_of: action666axLookupAsOf,
    });
    expect(rollback).toMatchObject({
      status: "invalid_snapshot",
    });
    expect(rollback.reason_codes).toContain(
      "snapshot_authority_binding_mismatch",
    );
  });

  test("rejects duplicate keys and cross-type identity collisions", () => {
    const duplicate = action666axStore(
      action666axDuplicateSnapshot(),
    ).lookup_previous_binding({
      binding_identity_type: "proposal",
      binding_identity: proposalIdentity(),
      as_of: action666axLookupAsOf,
    });
    expect(duplicate.status).toBe("invalid_snapshot");
    expect(duplicate.reason_codes).toEqual(
      expect.arrayContaining([
        "snapshot_entry_identity_duplicate",
        "snapshot_lookup_key_duplicate",
      ]),
    );
    const crossType = action666axStore(
      action666axCrossTypeCollisionSnapshot(),
    ).lookup_previous_binding({
      binding_identity_type: "proposal",
      binding_identity: proposalIdentity(),
      as_of: action666axLookupAsOf,
    });
    expect(crossType).toMatchObject({ status: "invalid_snapshot" });
    expect(crossType.reason_codes).toContain(
      "snapshot_cross_type_identity_collision",
    );
  });

  test("rejects unknown entry type and caller authority fields through closed schemas", () => {
    const changed = structuredClone(action666axPreviousBindingSnapshot);
    (
      changed.entry_inventory[0] as unknown as Record<string, unknown>
    ).entry_type = "unknown_binding";
    const invalid = action666axStore(
      action666axOwnerDependency(changed),
    ).lookup_previous_binding({
      binding_identity_type: "proposal",
      binding_identity: proposalIdentity(),
      as_of: action666axLookupAsOf,
    });
    expect(invalid.status).toBe("invalid_snapshot");
    expect(invalid.reason_codes).toContain("snapshot_entry_type_unknown");

    const callerAuthority = action666axStore().lookup_capture_binding({
      capture_identity: "capture:caller-authority",
      as_of: action666axLookupAsOf,
      expected_snapshot_root: "a".repeat(64),
      owner_approval: true,
    } as never);
    expect(callerAuthority).toMatchObject({
      status: "conflicting",
      reason_codes: ["lookup_request_schema_invalid"],
    });
  });

  test("AJ captures with absent, matching previous, and matching capture bindings", () => {
    expect(action666axCapturedWithStore()).toMatchObject({
      status: "captured",
      reason_codes: [],
    });
    expect(
      action666axCapturedWithStore(
        action666axPreviousOwnerDependency,
      ),
    ).toMatchObject({
      status: "captured",
      reason_codes: [],
    });
    const matchingCapture = action666axMatchingCaptureSnapshot();
    expect(
      action666axCapturedWithStore(
        action666axOwnerDependency(matchingCapture),
      ),
    ).toMatchObject({
      status: "captured",
      reason_codes: [],
    });
  });

  test("AJ distinguishes previous-binding and capture-binding collisions", () => {
    const previous = action666axCapturedWithStore(
      action666axOwnerDependency(
        action666axPreviousCollisionSnapshot(),
      ),
    );
    expect(previous.status).toBe("conflicting");
    expect(previous.reason_codes).toContain(
      "previous_binding_semantic_collision",
    );
    const capture = action666axCapturedWithStore(
      action666axOwnerDependency(
        action666axCaptureCollisionSnapshot(),
      ),
    );
    expect(capture.status).toBe("conflicting");
    expect(capture.reason_codes).toContain(
      "capture_identity_semantic_collision",
    );
  });

  test("AC maps and AQ replays deterministically through exact lookup adapters", () => {
    expect(action666axMappedWithStore()).toMatchObject({
      status: "mapped",
      reason_codes: [],
    });
    const first = action666axReplayWithStore();
    const second = action666axReplayWithStore();
    expect(first).toMatchObject({
      status: "completed",
      proposal_status: "proposal_ready",
      live_ranking_effect: false,
      automatic_promotion_allowed: false,
      external_ai_canonical_truth_authority: false,
    });
    expect(second).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  test("lookup adapters expose no write, append, rotate, approve, or persistence surface", () => {
    const store = action666axStore();
    expect(Object.keys(store).sort()).toEqual(
      [
        "automatic_change_allowed",
        "automatic_promotion_allowed",
        "automatic_training_allowed",
        "authority_digest",
        "authority_identity",
        "expected_external_trust_root",
        "external_ai_canonical_truth_authority",
        "live_ranking_effect",
        "lookup_capture_binding",
        "lookup_previous_binding",
        "not_publishable",
        "owner_boundary_identity",
        "shadow_only",
        "snapshot_digest",
        "snapshot_identity",
        "store_version",
        "synthetic_evidence",
        "validation_reason_codes",
        "validation_status",
      ].sort(),
    );
    const adapters = action666axAdapters();
    expect(Object.keys(adapters).sort()).toEqual([
      "capture_binding_lookup",
      "previous_binding_lookup",
    ]);
    expect(
      Object.keys(adapters.previous_binding_lookup).sort(),
    ).toEqual([
      "lookup_experiment_binding",
      "lookup_proposal_binding",
    ]);
    expect(Object.keys(adapters.capture_binding_lookup)).toEqual([
      "lookup_capture_binding",
    ]);
  });

  test("default-off and kill switch perform true zero work", () => {
    expect(DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_ENABLED).toBe(false);
    expect(
      DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_KILL_SWITCH_ENGAGED,
    ).toBe(true);
    for (const options of [
      { enabled: false, kill_switch_engaged: false },
      { enabled: true, kill_switch_engaged: true },
    ]) {
      const counters = zeroCounters();
      let dependencyReads = 0;
      const input = {
        ...options,
        counters,
        get owner_dependency(): never {
          dependencyReads += 1;
          throw new Error("disabled_store_must_not_read_dependency");
        },
      };
      const harness =
        createCanonicalImprovementBindingStoreHarness(input);
      expect(harness.store).toBeNull();
      expect(dependencyReads).toBe(0);
      expect(counters).toEqual(zeroCounters());
      expect(harness.external_ai_canonical_truth_authority).toBe(false);
    }
  });

  test("runtime activation requires literal true and literal false before dependency reads", () => {
    const closedEnabledValues: unknown[] = [
      undefined,
      null,
      false,
      0,
      1,
      "true",
      {},
      [],
    ];
    const closedKillSwitchValues: unknown[] = [
      undefined,
      null,
      true,
      0,
      1,
      "false",
      {},
      [],
    ];
    for (const [enabled, kill_switch_engaged] of [
      ...closedEnabledValues.map((value) => [value, false]),
      ...closedKillSwitchValues.map((value) => [true, value]),
    ]) {
      let dependencyReads = 0;
      const options = {
        enabled,
        kill_switch_engaged,
        get owner_dependency(): never {
          dependencyReads += 1;
          throw new Error("closed_gate_dependency_read");
        },
      };
      const harness = createCanonicalImprovementBindingStoreHarness(
        options as never,
      );
      expect(harness.store).toBeNull();
      expect(harness.enabled).toBe(false);
      expect(dependencyReads).toBe(0);
      expect(harness.counters).toEqual(zeroCounters());
    }
  });

  test("active options and owner dependency shells are exact and descriptor safe", () => {
    const invalidOptions: unknown[] = [
      {
        enabled: true,
        kill_switch_engaged: false,
        owner_dependency: action666axEmptyOwnerDependency,
        unexpected: true,
      },
    ];
    const hidden = {
      enabled: true,
      kill_switch_engaged: false,
      owner_dependency: action666axEmptyOwnerDependency,
    };
    Object.defineProperty(hidden, "hidden", { value: true });
    invalidOptions.push(hidden);
    const symbol = {
      enabled: true,
      kill_switch_engaged: false,
      owner_dependency: action666axEmptyOwnerDependency,
    };
    Object.defineProperty(symbol, Symbol("extra"), {
      value: true,
      enumerable: true,
    });
    invalidOptions.push(symbol);
    for (const options of invalidOptions) {
      const harness = createCanonicalImprovementBindingStoreHarness(
        options as never,
      );
      expect(harness).toMatchObject({
        enabled: true,
        status: "unavailable",
        store: null,
        reason_codes: [
          "binding_owner_dependency_runtime_shape_conflicting",
        ],
      });
      expect(harness.counters).toEqual(zeroCounters());
    }
    const proxiedOptions =
      createCanonicalImprovementBindingStoreHarness(
        new Proxy(
          {
            enabled: true,
            kill_switch_engaged: false,
            owner_dependency: action666axEmptyOwnerDependency,
          },
          {},
        ),
      );
    expect(proxiedOptions).toMatchObject({
      enabled: false,
      status: "disabled",
      store: null,
    });
    expect(proxiedOptions.counters).toEqual(zeroCounters());

    const invalidDependencies: unknown[] = [
      {
        ...action666axEmptyOwnerDependency,
        unexpected: true,
      },
      new Proxy(action666axEmptyOwnerDependency, {}),
    ];
    const accessor = {
      ...action666axEmptyOwnerDependency,
    };
    Object.defineProperty(accessor, "read_verified_snapshot", {
      enumerable: true,
      get() {
        throw new Error("owner_dependency_accessor_read");
      },
    });
    invalidDependencies.push(accessor);
    for (const dependency of invalidDependencies) {
      const harness = createCanonicalImprovementBindingStoreHarness({
        enabled: true,
        kill_switch_engaged: false,
        owner_dependency: dependency as never,
      });
      expect(harness.status).toBe("unavailable");
      expect(harness.store).toBeNull();
      expect(harness.counters).toEqual(zeroCounters());
    }
  });

  test("counters are private snapshots and caller counters are never mutated", () => {
    const callerCounters = zeroCounters();
    const harness = createCanonicalImprovementBindingStoreHarness({
      enabled: true,
      kill_switch_engaged: false,
      owner_dependency: action666axEmptyOwnerDependency,
      counters: callerCounters,
    });
    expect(harness.status).toBe("ready");
    expect(harness.store).not.toBeNull();
    expect(callerCounters).toEqual(zeroCounters());
    const beforeLookup = harness.counters;
    expect(Object.isFrozen(beforeLookup)).toBe(true);
    harness.store!.lookup_capture_binding({
      capture_identity: "capture:private-counter",
      as_of: action666axLookupAsOf,
    });
    expect(callerCounters).toEqual(zeroCounters());
    expect(beforeLookup.request_reads).toBe(0);
    expect(harness.counters.request_reads).toBe(1);
    expect(harness.counters.entry_lookups).toBe(1);
  });

  test("construction snapshots owner methods, authority, and verified snapshot bytes", () => {
    const snapshotBytes = structuredClone(action666axEmptySnapshot);
    const authority =
      createCanonicalImprovementBindingSnapshotAuthority({
        authority_identity: action666axAuthorityIdentity,
        owner_boundary_identity: action666axOwnerBoundaryIdentity,
        snapshot: snapshotBytes,
      });
    const dependency = action666axOwnerDependency(
      snapshotBytes,
      authority,
    );
    const harness = createCanonicalImprovementBindingStoreHarness({
      enabled: true,
      kill_switch_engaged: false,
      owner_dependency: dependency,
    });
    expect(harness.store?.validation_status).toBe("valid");
    dependency.read_expected_authority = () => {
      throw new Error("mutated_authority_reader");
    };
    dependency.read_verified_snapshot = () => {
      throw new Error("mutated_snapshot_reader");
    };
    snapshotBytes.snapshot_identity = "binding-snapshot:mutated:1:1";
    const result = harness.store!.lookup_capture_binding({
      capture_identity: "capture:construction-snapshot",
      as_of: action666axLookupAsOf,
    });
    expect(result).toMatchObject({
      status: "absent",
      snapshot_identity: action666axEmptySnapshot.snapshot_identity,
    });
  });

  test("authority and snapshot runtime surfaces reject proxies, accessors, symbols, and hidden keys without throwing", () => {
    const cleanAuthority =
      createCanonicalImprovementBindingSnapshotAuthority({
        authority_identity: action666axAuthorityIdentity,
        owner_boundary_identity: action666axOwnerBoundaryIdentity,
        snapshot: action666axEmptySnapshot,
      });
    const malformedSnapshots: unknown[] = [
      new Proxy(action666axEmptySnapshot, {}),
    ];
    const accessorSnapshot = structuredClone(action666axEmptySnapshot);
    Object.defineProperty(accessorSnapshot, "snapshot_identity", {
      enumerable: true,
      get() {
        throw new Error("snapshot_accessor_read");
      },
    });
    malformedSnapshots.push(accessorSnapshot);
    const hiddenSnapshot = structuredClone(action666axEmptySnapshot);
    Object.defineProperty(hiddenSnapshot, "hidden", { value: true });
    malformedSnapshots.push(hiddenSnapshot);
    const symbolSnapshot = structuredClone(action666axEmptySnapshot);
    Object.defineProperty(symbolSnapshot, Symbol("extra"), {
      value: true,
      enumerable: true,
    });
    malformedSnapshots.push(symbolSnapshot);
    const sparseSnapshot = structuredClone(action666axEmptySnapshot);
    sparseSnapshot.entry_inventory.length = 2;
    malformedSnapshots.push(sparseSnapshot);
    for (const malformed of malformedSnapshots) {
      const dependency = {
        ...action666axEmptyOwnerDependency,
        read_expected_authority: () => cleanAuthority,
        read_verified_snapshot: () => malformed,
      };
      const harness = createCanonicalImprovementBindingStoreHarness({
        enabled: true,
        kill_switch_engaged: false,
        owner_dependency: dependency,
      });
      expect(harness.status).toBe("ready");
      expect(harness.store?.validation_status).toBe("invalid_snapshot");
      expect(() =>
        harness.store!.lookup_capture_binding({
          capture_identity: "capture:malformed-runtime",
          as_of: action666axLookupAsOf,
        }),
      ).not.toThrow();
    }
    const proxyAuthority = new Proxy(cleanAuthority, {});
    const authorityHarness =
      createCanonicalImprovementBindingStoreHarness({
        enabled: true,
        kill_switch_engaged: false,
        owner_dependency: {
          ...action666axEmptyOwnerDependency,
          read_expected_authority: () => proxyAuthority,
        },
      });
    expect(authorityHarness.store?.validation_status).toBe(
      "invalid_snapshot",
    );
    expect(authorityHarness.counters.snapshot_reads).toBe(0);
  });

  test("semantically invalid authorities fail before every snapshot read", () => {
    const cleanAuthority =
      createCanonicalImprovementBindingSnapshotAuthority({
        authority_identity: action666axAuthorityIdentity,
        owner_boundary_identity: action666axOwnerBoundaryIdentity,
        snapshot: action666axEmptySnapshot,
      });
    const mutations: Array<{
      name: string;
      expectedReason: string;
      rehash?: false;
      mutate: (authority: Record<string, unknown>) => void;
    }> = [
      {
        name: "authority digest",
        expectedReason: "snapshot_authority_digest_mismatch",
        rehash: false,
        mutate: (authority) => {
          authority.authority_digest = "0".repeat(64);
        },
      },
      {
        name: "authority version",
        expectedReason: "snapshot_authority_version_invalid",
        mutate: (authority) => {
          authority.authority_version = "wrong";
        },
      },
      {
        name: "authority identity",
        expectedReason: "snapshot_authority_identity_mismatch",
        mutate: (authority) => {
          authority.authority_identity = "x";
        },
      },
      {
        name: "owner boundary identity",
        expectedReason: "snapshot_authority_identity_mismatch",
        mutate: (authority) => {
          authority.owner_boundary_identity =
            "binding-owner-boundary:unexpected";
        },
      },
      {
        name: "expected snapshot identity",
        expectedReason: "snapshot_authority_expected_identity_invalid",
        mutate: (authority) => {
          authority.expected_snapshot_identity =
            "binding-snapshot:unexpected:1:1";
        },
      },
      {
        name: "expected snapshot digest",
        expectedReason: "snapshot_authority_digest_format_invalid",
        mutate: (authority) => {
          authority.expected_snapshot_digest = "not-a-digest";
        },
      },
      {
        name: "expected owner identity",
        expectedReason: "snapshot_authority_expected_identity_invalid",
        mutate: (authority) => {
          authority.expected_owner_authority_identity = "bad owner";
        },
      },
      {
        name: "publication sequence",
        expectedReason: "snapshot_authority_epoch_invalid",
        mutate: (authority) => {
          authority.expected_publication_sequence = 0;
        },
      },
      {
        name: "publication epoch",
        expectedReason: "snapshot_authority_epoch_invalid",
        mutate: (authority) => {
          authority.expected_publication_epoch = 0;
        },
      },
      {
        name: "predecessor digest",
        expectedReason: "snapshot_authority_digest_format_invalid",
        mutate: (authority) => {
          authority.expected_predecessor_digest = "not-a-digest";
        },
      },
      {
        name: "external root",
        expectedReason: "snapshot_authority_digest_format_invalid",
        mutate: (authority) => {
          authority.expected_external_trust_root = "not-a-digest";
        },
      },
      {
        name: "digest algorithm",
        expectedReason: "snapshot_authority_version_invalid",
        mutate: (authority) => {
          authority.authority_digest_algorithm = "wrong";
        },
      },
    ];
    for (const mutation of mutations) {
      const authority = structuredClone(
        cleanAuthority,
      ) as CanonicalImprovementBindingSnapshotAuthority;
      mutation.mutate(authority as unknown as Record<string, unknown>);
      if (mutation.rehash !== false) rehashAuthority(authority);
      let snapshotReaderCalls = 0;
      const harness = createCanonicalImprovementBindingStoreHarness({
        enabled: true,
        kill_switch_engaged: false,
        owner_dependency: {
          ...action666axEmptyOwnerDependency,
          read_expected_authority: () => authority,
          read_verified_snapshot: () => {
            snapshotReaderCalls += 1;
            throw new Error("snapshot_reader_must_not_run");
          },
        },
      });
      expect(snapshotReaderCalls, mutation.name).toBe(0);
      expect(harness.store?.validation_status, mutation.name).toBe(
        "invalid_snapshot",
      );
      expect(
        harness.store?.validation_reason_codes,
        mutation.name,
      ).toContain(mutation.expectedReason);
      expect(harness.counters.snapshot_reads, mutation.name).toBe(0);
      expect(harness.counters.clones, mutation.name).toBe(0);
      expect(
        harness.counters.downstream_aj_ac_aq_executions,
        mutation.name,
      ).toBe(0);
    }
  });

  test("self-consistent malformed owner identities fail closed before snapshot access", () => {
    const invalidOwnerIdentities: unknown[] = [
      "",
      "  ",
      "ab",
      "a".repeat(257),
      "bad owner",
      null,
      true,
      42,
      {},
      [],
    ];
    const cleanAuthority =
      createCanonicalImprovementBindingSnapshotAuthority({
        authority_identity: action666axAuthorityIdentity,
        owner_boundary_identity: action666axOwnerBoundaryIdentity,
        snapshot: action666axEmptySnapshot,
      });
    for (const invalidOwnerIdentity of invalidOwnerIdentities) {
      const snapshot = structuredClone(action666axEmptySnapshot);
      (
        snapshot as unknown as Record<string, unknown>
      ).owner_authority_identity = invalidOwnerIdentity;
      snapshot.snapshot_identity =
        canonicalImprovementBindingSnapshotIdentity(
          snapshot as CanonicalImprovementBindingSnapshot,
        );
      rehashSnapshot(snapshot);
      expect(() =>
        createCanonicalImprovementBindingSnapshotAuthority({
          authority_identity: action666axAuthorityIdentity,
          owner_boundary_identity: action666axOwnerBoundaryIdentity,
          snapshot,
        }),
      ).toThrow("canonical_improvement_binding_authority_invalid");

      const authority = structuredClone(cleanAuthority);
      (
        authority as unknown as Record<string, unknown>
      ).expected_owner_authority_identity = invalidOwnerIdentity;
      authority.expected_snapshot_identity = snapshot.snapshot_identity;
      authority.expected_snapshot_digest = snapshot.snapshot_digest;
      rehashAuthority(authority);
      let snapshotReaderCalls = 0;
      const harness = createCanonicalImprovementBindingStoreHarness({
        enabled: true,
        kill_switch_engaged: false,
        owner_dependency: {
          ...action666axEmptyOwnerDependency,
          read_expected_authority: () => authority,
          read_verified_snapshot: () => {
            snapshotReaderCalls += 1;
            return snapshot;
          },
        },
      });
      expect(snapshotReaderCalls).toBe(0);
      expect(harness.store?.validation_status).toBe("invalid_snapshot");
      expect(harness.store?.validation_reason_codes).toContain(
        "snapshot_authority_expected_identity_invalid",
      );
      expect(harness.counters.snapshot_reads).toBe(0);
      expect(harness.counters.clones).toBe(0);

      const malformedExpectedSnapshotIdentity = structuredClone(
        cleanAuthority,
      );
      (
        malformedExpectedSnapshotIdentity as unknown as Record<
          string,
          unknown
        >
      ).expected_snapshot_identity = invalidOwnerIdentity;
      rehashAuthority(malformedExpectedSnapshotIdentity);
      let expectedIdentitySnapshotReaderCalls = 0;
      const expectedIdentityHarness =
        createCanonicalImprovementBindingStoreHarness({
          enabled: true,
          kill_switch_engaged: false,
          owner_dependency: {
            ...action666axEmptyOwnerDependency,
            read_expected_authority: () =>
              malformedExpectedSnapshotIdentity,
            read_verified_snapshot: () => {
              expectedIdentitySnapshotReaderCalls += 1;
              return action666axEmptySnapshot;
            },
          },
        });
      expect(expectedIdentitySnapshotReaderCalls).toBe(0);
      expect(
        expectedIdentityHarness.store?.validation_reason_codes,
      ).toContain("snapshot_authority_expected_identity_invalid");
      expect(expectedIdentityHarness.counters.snapshot_reads).toBe(0);
      expect(expectedIdentityHarness.counters.clones).toBe(0);
    }
  });

  test("predecessor schema is exact even under self-consistent snapshot and authority digests", () => {
    const changed = structuredClone(action666axEmptySnapshot);
    (
      changed.predecessor as unknown as Record<string, unknown>
    ).unexpected = true;
    const payload = structuredClone(changed);
    delete (payload as Partial<CanonicalImprovementBindingSnapshot>)
      .snapshot_digest;
    changed.snapshot_digest = canonicalModelImprovementDigest(payload);
    const authority =
      createCanonicalImprovementBindingSnapshotAuthority({
        authority_identity: action666axAuthorityIdentity,
        owner_boundary_identity: action666axOwnerBoundaryIdentity,
        snapshot: changed,
      });
    const store = action666axStore(
      action666axOwnerDependency(changed, authority),
    );
    expect(store.validation_status).toBe("invalid_snapshot");
    expect(store.validation_reason_codes).toContain(
      "snapshot_predecessor_schema_invalid",
    );
  });

  test("lookup request surfaces reject malformed and proxy inputs without throwing", () => {
    const store = action666axStore();
    const malformed: unknown[] = [
      null,
      {},
      {
        capture_identity: "capture:extra",
        as_of: action666axLookupAsOf,
        unexpected: true,
      },
      new Proxy(
        {
          capture_identity: "capture:proxy",
          as_of: action666axLookupAsOf,
        },
        {},
      ),
    ];
    const accessor = {
      as_of: action666axLookupAsOf,
    } as Record<string, unknown>;
    Object.defineProperty(accessor, "capture_identity", {
      enumerable: true,
      get() {
        throw new Error("lookup_accessor_read");
      },
    });
    malformed.push(accessor);
    for (const request of malformed) {
      expect(() =>
        store.lookup_capture_binding(request as never),
      ).not.toThrow();
      expect(store.lookup_capture_binding(request as never)).toMatchObject({
        status: "conflicting",
        reason_codes: ["lookup_request_schema_invalid"],
      });
    }
  });

  test("lookup adapters capture the store methods and as-of value at construction", () => {
    const store = action666axStore();
    const input = {
      store,
      as_of: action666axLookupAsOf,
    };
    const adapters = createCanonicalImprovementBindingLookupAdapters(input);
    input.as_of = "not-an-instant";
    expect(
      adapters.capture_binding_lookup.lookup_capture_binding(
        "capture:adapter-snapshot",
      ),
    ).toBeNull();
    expect(() =>
      createCanonicalImprovementBindingLookupAdapters(
        new Proxy(
          {
            store,
            as_of: action666axLookupAsOf,
          },
          {},
        ),
      ),
    ).toThrow("canonical_binding_lookup_adapter_input_conflicting");
  });

  test("input order and frozen owner bytes do not change deterministic results", () => {
    const frozen = structuredClone(action666axEmptySnapshot);
    Object.freeze(frozen.entry_inventory);
    Object.freeze(frozen);
    const before = JSON.stringify(frozen);
    const first = action666axStore(
      action666axOwnerDependency(frozen),
    ).lookup_capture_binding({
      capture_identity: "capture:deterministic",
      as_of: action666axLookupAsOf,
    });
    const reordered = Object.fromEntries(
      Object.entries(frozen).reverse(),
    );
    const second = action666axStore(
      action666axOwnerDependency(
        reordered,
        action666axOwnerDependency(frozen).read_expected_authority(),
      ),
    ).lookup_capture_binding({
      capture_identity: "capture:deterministic",
      as_of: action666axLookupAsOf,
    });
    expect(second).toEqual(first);
    expect(JSON.stringify(frozen)).toBe(before);
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  test("golden report is deterministic synthetic evidence without performance claims", () => {
    const scenarios = action666axGoldenLookupScenarios.map(
      (scenario) => {
        const lookup = scenario.run();
        return {
          name: scenario.name,
          status: lookup.status,
          result_digest: lookup.result_digest,
        };
      },
    );
    const capture = action666axCapturedWithStore();
    const adapter = action666axMappedWithStore();
    const replay = action666axReplayWithStore();
    const actual = {
      report_version:
        "action_666ax_golden_improvement_binding_store_report_v1",
      snapshot_version:
        CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION,
      store_version: CANONICAL_IMPROVEMENT_BINDING_STORE_VERSION,
      evidence_classification: "synthetic_fixture_only",
      performance_claimed: false,
      publishable: false,
      scenarios,
      interop: {
        aj_capture_status: capture.status,
        ac_adapter_status: adapter.status,
        aq_replay_status: replay.status,
        aq_proposal_status: replay.proposal_status,
      },
      safety: {
        shadow_only: true,
        live_ranking_effect: false,
        automatic_training_allowed: false,
        automatic_change_allowed: false,
        automatic_promotion_allowed: false,
        external_ai_canonical_truth_authority: false,
        synthetic_evidence: true,
        not_publishable: true,
      },
    };
    if (process.env.ACTION_666AX_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666AX_GOLDEN=${JSON.stringify(actual)}`);
    }
    expect(goldenReport).toEqual(actual);
  });

  test("foundation remains server-only and absent from live consumers", () => {
    const root = process.cwd();
    const implementation =
      "lib/server/canonical-improvement-binding-store.ts";
    const text = fs.readFileSync(
      path.join(root, implementation),
      "utf8",
    );
    expect(text).toContain('import "server-only";');
    expect(text).not.toMatch(
      /\.(insert|update|delete|upsert)\s*\(|\b(writeFile|appendFile|fetch)\s*\(/,
    );
    const importingLiveFiles: string[] = [];
    for (const liveRoot of ["app", "components", "pages"]) {
      const absolute = path.join(root, liveRoot);
      if (!fs.existsSync(absolute)) continue;
      const pending = [absolute];
      while (pending.length > 0) {
        const current = pending.pop()!;
        for (const entry of fs.readdirSync(current, {
          withFileTypes: true,
        })) {
          const nested = path.join(current, entry.name);
          if (entry.isDirectory()) pending.push(nested);
          else if (
            /\.[cm]?[jt]sx?$/.test(entry.name) &&
            fs
              .readFileSync(nested, "utf8")
              .includes("canonical-improvement-binding-store")
          ) {
            importingLiveFiles.push(path.relative(root, nested));
          }
        }
      }
    }
    expect(importingLiveFiles).toEqual([]);
  });
});
