import "server-only";

import {
  type CanonicalCompletedImprovementCaptureBindingLookup,
} from "@/lib/server/canonical-completed-improvement-evidence-capture";
import {
  parseCanonicalExplicitInstant,
} from "@/lib/server/canonical-model-improvement-upstream-verification";
import {
  canonicalModelImprovementDigest,
  type CanonicalModelImprovementPreviousBindingLookup,
} from "@/lib/server/canonical-model-improvement-proposal";

export const CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION =
  "canonical_improvement_binding_snapshot_v1" as const;
export const CANONICAL_IMPROVEMENT_BINDING_ENTRY_VERSION =
  "canonical_improvement_binding_entry_v1" as const;
export const CANONICAL_IMPROVEMENT_BINDING_STORE_VERSION =
  "canonical_improvement_binding_store_v1" as const;
export const CANONICAL_IMPROVEMENT_BINDING_AUTHORITY_VERSION =
  "canonical_improvement_binding_snapshot_authority_v1" as const;
export const CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION =
  "canonical_improvement_binding_owner_boundary_v1" as const;
export const CANONICAL_IMPROVEMENT_BINDING_LOOKUP_RESULT_VERSION =
  "canonical_improvement_binding_lookup_result_v1" as const;
export const CANONICAL_IMPROVEMENT_BINDING_ENTRY_TYPES = [
  "previous_binding",
  "capture_binding",
] as const;
export const CANONICAL_IMPROVEMENT_BINDING_LOOKUP_STATUSES = [
  "found",
  "absent",
  "conflicting",
  "not_effective",
  "invalid_snapshot",
] as const;
export const DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_ENABLED = false;
export const DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_KILL_SWITCH_ENGAGED = true;

const fullShaPattern = /^[a-f0-9]{64}$/;
const identityPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,255}$/;

type CanonicalImprovementBindingEntryType =
  (typeof CANONICAL_IMPROVEMENT_BINDING_ENTRY_TYPES)[number];
type CanonicalImprovementBindingLookupStatus =
  (typeof CANONICAL_IMPROVEMENT_BINDING_LOOKUP_STATUSES)[number];
type CanonicalImprovementBindingSubjectType =
  | "proposal"
  | "experiment"
  | "capture";

type CanonicalImprovementBindingSafety = {
  shadow_only: true;
  live_ranking_effect: false;
  automatic_training_allowed: false;
  automatic_change_allowed: false;
  automatic_promotion_allowed: false;
  external_ai_canonical_truth_authority: false;
  synthetic_evidence: true;
  not_publishable: true;
};

const safety = {
  shadow_only: true,
  live_ranking_effect: false,
  automatic_training_allowed: false,
  automatic_change_allowed: false,
  automatic_promotion_allowed: false,
  external_ai_canonical_truth_authority: false,
  synthetic_evidence: true,
  not_publishable: true,
} as const;

export type CanonicalImprovementBindingEntry = {
  entry_version: typeof CANONICAL_IMPROVEMENT_BINDING_ENTRY_VERSION;
  entry_identity: string;
  entry_type: CanonicalImprovementBindingEntryType;
  canonical_lookup_key: string;
  bound_identity_type: CanonicalImprovementBindingSubjectType;
  bound_identity: string;
  observed_binding_digest: string;
  verified_state: "verified";
  source_evidence_namespace:
    | "canonical_previous_binding_evidence"
    | "canonical_capture_binding_evidence";
  source_evidence_digest: string;
  effective_at: string;
  entry_digest_algorithm: "sha256_canonical_json_v1";
  entry_digest: string;
};

export type CanonicalImprovementBindingSnapshotPredecessor =
  | {
      state: "genesis";
      previous_snapshot_digest: null;
      previous_publication_sequence: null;
      previous_publication_epoch: null;
    }
  | {
      state: "linked";
      previous_snapshot_digest: string;
      previous_publication_sequence: number;
      previous_publication_epoch: number;
    };

export type CanonicalImprovementBindingSnapshot = {
  snapshot_version: typeof CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION;
  snapshot_identity: string;
  owner_authority_identity: string;
  publication_sequence: number;
  publication_epoch: number;
  predecessor: CanonicalImprovementBindingSnapshotPredecessor;
  published_at: string;
  effective_at: string;
  entry_inventory: CanonicalImprovementBindingEntry[];
  entry_inventory_digest: string;
  expected_external_trust_root: string;
  snapshot_digest_algorithm: "sha256_canonical_json_v1";
  snapshot_digest: string;
};

export type CanonicalImprovementBindingSnapshotAuthority = {
  authority_version: typeof CANONICAL_IMPROVEMENT_BINDING_AUTHORITY_VERSION;
  authority_identity: string;
  owner_boundary_identity: string;
  expected_snapshot_identity: string;
  expected_snapshot_digest: string;
  expected_owner_authority_identity: string;
  expected_publication_sequence: number;
  expected_publication_epoch: number;
  expected_predecessor_digest: string | null;
  expected_external_trust_root: string;
  authority_digest_algorithm: "sha256_canonical_json_v1";
  authority_digest: string;
};

export type CanonicalImprovementBindingOwnerDependency = {
  owner_boundary_version:
    typeof CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION;
  owner_boundary_identity: string;
  read_expected_authority: () => CanonicalImprovementBindingSnapshotAuthority;
  read_verified_snapshot: () => unknown;
};

export type CanonicalImprovementBindingLookupResult = {
  result_version:
    typeof CANONICAL_IMPROVEMENT_BINDING_LOOKUP_RESULT_VERSION;
  store_version: typeof CANONICAL_IMPROVEMENT_BINDING_STORE_VERSION;
  status: CanonicalImprovementBindingLookupStatus;
  lookup_namespace:
    | "previous_proposal_binding"
    | "previous_experiment_binding"
    | "capture_identity_binding";
  lookup_identity: string;
  canonical_lookup_key: string;
  as_of: string | null;
  snapshot_identity: string | null;
  snapshot_digest: string;
  publication_sequence: number | null;
  publication_epoch: number | null;
  owner_boundary_identity: string;
  authority_identity: string | null;
  authority_digest: string | null;
  expected_external_trust_root: string | null;
  entry_identity: string | null;
  entry_digest: string | null;
  observed_binding_digest: string | null;
  reason_codes: string[];
  result_digest_algorithm: "sha256_canonical_json_v1";
  result_digest: string;
} & CanonicalImprovementBindingSafety;

export type CanonicalImprovementBindingStoreCounters = {
  request_reads: number;
  snapshot_reads: number;
  clones: number;
  authority_lookups: number;
  entry_lookups: number;
  digest_operations: number;
  downstream_aj_ac_aq_executions: number;
};

export type CanonicalImprovementBindingLookupAdapters = {
  previous_binding_lookup: CanonicalModelImprovementPreviousBindingLookup;
  capture_binding_lookup: CanonicalCompletedImprovementCaptureBindingLookup;
};

type SnapshotValidation = {
  valid: boolean;
  snapshot: CanonicalImprovementBindingSnapshot | null;
  observed_snapshot_identity: string | null;
  observed_snapshot_digest: string;
  observed_publication_sequence: number | null;
  observed_publication_epoch: number | null;
  owner_boundary_identity: string;
  authority_identity: string | null;
  authority_digest: string | null;
  expected_external_trust_root: string | null;
  reason_codes: string[];
};

const snapshotKeys = [
  "snapshot_version",
  "snapshot_identity",
  "owner_authority_identity",
  "publication_sequence",
  "publication_epoch",
  "predecessor",
  "published_at",
  "effective_at",
  "entry_inventory",
  "entry_inventory_digest",
  "expected_external_trust_root",
  "snapshot_digest_algorithm",
  "snapshot_digest",
] as const;
const entryKeys = [
  "entry_version",
  "entry_identity",
  "entry_type",
  "canonical_lookup_key",
  "bound_identity_type",
  "bound_identity",
  "observed_binding_digest",
  "verified_state",
  "source_evidence_namespace",
  "source_evidence_digest",
  "effective_at",
  "entry_digest_algorithm",
  "entry_digest",
] as const;
const authorityKeys = [
  "authority_version",
  "authority_identity",
  "owner_boundary_identity",
  "expected_snapshot_identity",
  "expected_snapshot_digest",
  "expected_owner_authority_identity",
  "expected_publication_sequence",
  "expected_publication_epoch",
  "expected_predecessor_digest",
  "expected_external_trust_root",
  "authority_digest_algorithm",
  "authority_digest",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort();
}

function emptyCounters(): CanonicalImprovementBindingStoreCounters {
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

function digest(
  value: unknown,
  counters?: CanonicalImprovementBindingStoreCounters,
) {
  if (counters) counters.digest_operations += 1;
  return canonicalModelImprovementDigest(value);
}

function safeObservedDigest(
  value: unknown,
  counters: CanonicalImprovementBindingStoreCounters,
) {
  try {
    return digest(value, counters);
  } catch {
    return digest({ invalid_snapshot_unserializable: true }, counters);
  }
}

function canonicalInstant(value: string) {
  const parsed = parseCanonicalExplicitInstant(value);
  if (!parsed) return null;
  const billion = BigInt(1_000_000_000);
  let seconds = parsed.epoch_nanoseconds / billion;
  let fraction = parsed.epoch_nanoseconds % billion;
  if (fraction < BigInt(0)) {
    seconds -= BigInt(1);
    fraction += billion;
  }
  const milliseconds = Number(seconds * BigInt(1_000));
  if (!Number.isSafeInteger(milliseconds)) return null;
  const base = new Date(milliseconds).toISOString().slice(0, 19);
  return {
    canonical: `${base}.${fraction.toString().padStart(9, "0")}Z`,
    epoch_nanoseconds: parsed.epoch_nanoseconds,
  };
}

function validIdentity(value: unknown): value is string {
  return typeof value === "string" && identityPattern.test(value);
}

function validPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function entryLookupKey(
  subjectType: CanonicalImprovementBindingSubjectType,
  identity: string,
) {
  return `${subjectType}:${identity}`;
}

export function canonicalImprovementBindingEntryIdentity(input: {
  entry_type: CanonicalImprovementBindingEntryType;
  bound_identity_type: CanonicalImprovementBindingSubjectType;
  bound_identity: string;
}) {
  return `binding-entry:${input.entry_type}:${entryLookupKey(
    input.bound_identity_type,
    input.bound_identity,
  )}`;
}

export function canonicalImprovementBindingSnapshotIdentity(input: {
  owner_authority_identity: string;
  publication_sequence: number;
  publication_epoch: number;
}) {
  return `binding-snapshot:${input.owner_authority_identity}:${input.publication_epoch}:${input.publication_sequence}`;
}

function entryPayload(
  entry: Omit<CanonicalImprovementBindingEntry, "entry_digest">,
) {
  return entry;
}

export function createCanonicalImprovementBindingEntry(input: {
  entry_type: CanonicalImprovementBindingEntryType;
  bound_identity_type: CanonicalImprovementBindingSubjectType;
  bound_identity: string;
  observed_binding_digest: string;
  source_evidence_namespace:
    | "canonical_previous_binding_evidence"
    | "canonical_capture_binding_evidence";
  source_evidence_digest: string;
  effective_at: string;
}): CanonicalImprovementBindingEntry {
  const expectedSubject =
    input.entry_type === "capture_binding"
      ? ["capture"]
      : ["proposal", "experiment"];
  const instant = canonicalInstant(input.effective_at);
  if (
    !expectedSubject.includes(input.bound_identity_type) ||
    !validIdentity(input.bound_identity) ||
    !fullShaPattern.test(input.observed_binding_digest) ||
    !fullShaPattern.test(input.source_evidence_digest) ||
    !instant ||
    (input.entry_type === "capture_binding" &&
      input.source_evidence_namespace !==
        "canonical_capture_binding_evidence") ||
    (input.entry_type === "previous_binding" &&
      input.source_evidence_namespace !==
        "canonical_previous_binding_evidence")
  ) {
    throw new Error("canonical_improvement_binding_entry_invalid");
  }
  const payload = {
    entry_version: CANONICAL_IMPROVEMENT_BINDING_ENTRY_VERSION,
    entry_identity: canonicalImprovementBindingEntryIdentity(input),
    entry_type: input.entry_type,
    canonical_lookup_key: entryLookupKey(
      input.bound_identity_type,
      input.bound_identity,
    ),
    bound_identity_type: input.bound_identity_type,
    bound_identity: input.bound_identity,
    observed_binding_digest: input.observed_binding_digest,
    verified_state: "verified" as const,
    source_evidence_namespace: input.source_evidence_namespace,
    source_evidence_digest: input.source_evidence_digest,
    effective_at: instant.canonical,
    entry_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...payload,
    entry_digest: digest(entryPayload(payload)),
  });
}

function inventoryDigest(entries: CanonicalImprovementBindingEntry[]) {
  return digest({
    entry_version: CANONICAL_IMPROVEMENT_BINDING_ENTRY_VERSION,
    entries: entries.map((entry) => ({
      entry_identity: entry.entry_identity,
      entry_digest: entry.entry_digest,
    })),
  });
}

export function createCanonicalImprovementBindingSnapshot(input: {
  owner_authority_identity: string;
  publication_sequence: number;
  publication_epoch: number;
  predecessor: CanonicalImprovementBindingSnapshotPredecessor;
  published_at: string;
  effective_at: string;
  entry_inventory: CanonicalImprovementBindingEntry[];
  expected_external_trust_root: string;
}): CanonicalImprovementBindingSnapshot {
  const published = canonicalInstant(input.published_at);
  const effective = canonicalInstant(input.effective_at);
  if (
    !validIdentity(input.owner_authority_identity) ||
    !validPositiveInteger(input.publication_sequence) ||
    !validPositiveInteger(input.publication_epoch) ||
    !published ||
    !effective ||
    published.epoch_nanoseconds > effective.epoch_nanoseconds ||
    !fullShaPattern.test(input.expected_external_trust_root)
  ) {
    throw new Error("canonical_improvement_binding_snapshot_invalid");
  }
  const entries = input.entry_inventory
    .map((entry) => structuredClone(entry))
    .sort((first, second) =>
      first.entry_identity.localeCompare(second.entry_identity),
    );
  const payload = {
    snapshot_version: CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION,
    snapshot_identity: canonicalImprovementBindingSnapshotIdentity(input),
    owner_authority_identity: input.owner_authority_identity,
    publication_sequence: input.publication_sequence,
    publication_epoch: input.publication_epoch,
    predecessor: structuredClone(input.predecessor),
    published_at: published.canonical,
    effective_at: effective.canonical,
    entry_inventory: entries,
    entry_inventory_digest: inventoryDigest(entries),
    expected_external_trust_root: input.expected_external_trust_root,
    snapshot_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...payload,
    snapshot_digest: digest(payload),
  });
}

export function createCanonicalImprovementBindingSnapshotAuthority(input: {
  authority_identity: string;
  owner_boundary_identity: string;
  snapshot: CanonicalImprovementBindingSnapshot;
}): CanonicalImprovementBindingSnapshotAuthority {
  if (
    !validIdentity(input.authority_identity) ||
    !validIdentity(input.owner_boundary_identity)
  ) {
    throw new Error("canonical_improvement_binding_authority_invalid");
  }
  const payload = {
    authority_version: CANONICAL_IMPROVEMENT_BINDING_AUTHORITY_VERSION,
    authority_identity: input.authority_identity,
    owner_boundary_identity: input.owner_boundary_identity,
    expected_snapshot_identity: input.snapshot.snapshot_identity,
    expected_snapshot_digest: input.snapshot.snapshot_digest,
    expected_owner_authority_identity:
      input.snapshot.owner_authority_identity,
    expected_publication_sequence: input.snapshot.publication_sequence,
    expected_publication_epoch: input.snapshot.publication_epoch,
    expected_predecessor_digest:
      input.snapshot.predecessor.previous_snapshot_digest,
    expected_external_trust_root:
      input.snapshot.expected_external_trust_root,
    authority_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...payload,
    authority_digest: digest(payload),
  });
}

function validateEntry(
  value: unknown,
  reasons: string[],
): CanonicalImprovementBindingEntry | null {
  if (!isRecord(value) || !exactKeys(value, entryKeys)) {
    reasons.push("snapshot_entry_schema_invalid");
    return null;
  }
  const entry = value as CanonicalImprovementBindingEntry;
  if (
    entry.entry_version !== CANONICAL_IMPROVEMENT_BINDING_ENTRY_VERSION
  ) {
    reasons.push("snapshot_entry_version_invalid");
  }
  if (
    !CANONICAL_IMPROVEMENT_BINDING_ENTRY_TYPES.includes(
      entry.entry_type as CanonicalImprovementBindingEntryType,
    )
  ) {
    reasons.push("snapshot_entry_type_unknown");
    return null;
  }
  const allowedSubjects =
    entry.entry_type === "capture_binding"
      ? ["capture"]
      : ["proposal", "experiment"];
  if (
    !allowedSubjects.includes(entry.bound_identity_type) ||
    !validIdentity(entry.bound_identity)
  ) {
    reasons.push("snapshot_entry_subject_invalid");
  }
  const expectedKey = entryLookupKey(
    entry.bound_identity_type,
    entry.bound_identity,
  );
  if (entry.canonical_lookup_key !== expectedKey) {
    reasons.push("snapshot_entry_lookup_key_mismatch");
  }
  if (
    entry.entry_identity !==
    canonicalImprovementBindingEntryIdentity(entry)
  ) {
    reasons.push("snapshot_entry_identity_mismatch");
  }
  if (
    !fullShaPattern.test(entry.observed_binding_digest) ||
    !fullShaPattern.test(entry.source_evidence_digest)
  ) {
    reasons.push("snapshot_entry_digest_format_invalid");
  }
  if (
    entry.verified_state !== "verified" ||
    entry.entry_digest_algorithm !== "sha256_canonical_json_v1"
  ) {
    reasons.push("snapshot_entry_verification_state_invalid");
  }
  if (
    (entry.entry_type === "capture_binding" &&
      entry.source_evidence_namespace !==
        "canonical_capture_binding_evidence") ||
    (entry.entry_type === "previous_binding" &&
      entry.source_evidence_namespace !==
        "canonical_previous_binding_evidence")
  ) {
    reasons.push("snapshot_entry_source_namespace_mismatch");
  }
  const instant = canonicalInstant(entry.effective_at);
  if (!instant || instant.canonical !== entry.effective_at) {
    reasons.push("snapshot_entry_effective_instant_invalid");
  }
  const payload = structuredClone(entry) as CanonicalImprovementBindingEntry;
  delete (payload as Partial<CanonicalImprovementBindingEntry>).entry_digest;
  if (entry.entry_digest !== digest(payload)) {
    reasons.push("snapshot_entry_digest_mismatch");
  }
  return entry;
}

function validateAuthority(
  value: unknown,
  boundaryIdentity: string,
  reasons: string[],
): value is CanonicalImprovementBindingSnapshotAuthority {
  if (!isRecord(value) || !exactKeys(value, authorityKeys)) {
    reasons.push("snapshot_authority_schema_invalid");
    return false;
  }
  const authority = value as CanonicalImprovementBindingSnapshotAuthority;
  if (
    authority.authority_version !==
      CANONICAL_IMPROVEMENT_BINDING_AUTHORITY_VERSION ||
    authority.authority_digest_algorithm !== "sha256_canonical_json_v1"
  ) {
    reasons.push("snapshot_authority_version_invalid");
  }
  if (
    !validIdentity(authority.authority_identity) ||
    !validIdentity(authority.owner_boundary_identity) ||
    authority.owner_boundary_identity !== boundaryIdentity
  ) {
    reasons.push("snapshot_authority_identity_mismatch");
  }
  if (
    !fullShaPattern.test(authority.expected_snapshot_digest) ||
    !fullShaPattern.test(authority.expected_external_trust_root) ||
    (authority.expected_predecessor_digest !== null &&
      !fullShaPattern.test(authority.expected_predecessor_digest))
  ) {
    reasons.push("snapshot_authority_digest_format_invalid");
  }
  if (
    !validPositiveInteger(authority.expected_publication_sequence) ||
    !validPositiveInteger(authority.expected_publication_epoch)
  ) {
    reasons.push("snapshot_authority_epoch_invalid");
  }
  const payload = structuredClone(
    authority,
  ) as CanonicalImprovementBindingSnapshotAuthority;
  delete (
    payload as Partial<CanonicalImprovementBindingSnapshotAuthority>
  ).authority_digest;
  if (authority.authority_digest !== digest(payload)) {
    reasons.push("snapshot_authority_digest_mismatch");
  }
  return reasons.length === 0;
}

function validateSnapshot(input: {
  raw: unknown;
  authority: CanonicalImprovementBindingSnapshotAuthority | null;
  boundaryIdentity: string;
  counters: CanonicalImprovementBindingStoreCounters;
}): SnapshotValidation {
  const reasons: string[] = [];
  const rawRecord = isRecord(input.raw) ? input.raw : null;
  const observedSnapshotIdentity =
    rawRecord && typeof rawRecord.snapshot_identity === "string"
      ? rawRecord.snapshot_identity
      : null;
  const observedPublicationSequence =
    rawRecord &&
    Number.isSafeInteger(rawRecord.publication_sequence)
      ? Number(rawRecord.publication_sequence)
      : null;
  const observedPublicationEpoch =
    rawRecord && Number.isSafeInteger(rawRecord.publication_epoch)
      ? Number(rawRecord.publication_epoch)
      : null;
  const authorityIdentity =
    input.authority &&
    typeof input.authority.authority_identity === "string"
      ? input.authority.authority_identity
      : null;
  const authorityDigest =
    input.authority &&
    typeof input.authority.authority_digest === "string"
      ? input.authority.authority_digest
      : null;
  const expectedExternalTrustRoot =
    input.authority &&
    typeof input.authority.expected_external_trust_root === "string"
      ? input.authority.expected_external_trust_root
      : null;
  const observedSnapshotDigest = safeObservedDigest(
    input.raw,
    input.counters,
  );
  if (
    !input.authority ||
    !validateAuthority(
      input.authority,
      input.boundaryIdentity,
      reasons,
    )
  ) {
    return {
      valid: false,
      snapshot: null,
      observed_snapshot_identity: observedSnapshotIdentity,
      observed_snapshot_digest: observedSnapshotDigest,
      observed_publication_sequence: observedPublicationSequence,
      observed_publication_epoch: observedPublicationEpoch,
      owner_boundary_identity: input.boundaryIdentity,
      authority_identity: authorityIdentity,
      authority_digest: authorityDigest,
      expected_external_trust_root: expectedExternalTrustRoot,
      reason_codes: uniqueSorted(reasons),
    };
  }
  if (!isRecord(input.raw) || !exactKeys(input.raw, snapshotKeys)) {
    reasons.push("snapshot_schema_invalid");
    return {
      valid: false,
      snapshot: null,
      observed_snapshot_identity: observedSnapshotIdentity,
      observed_snapshot_digest: observedSnapshotDigest,
      observed_publication_sequence: observedPublicationSequence,
      observed_publication_epoch: observedPublicationEpoch,
      owner_boundary_identity: input.boundaryIdentity,
      authority_identity: authorityIdentity,
      authority_digest: authorityDigest,
      expected_external_trust_root: expectedExternalTrustRoot,
      reason_codes: uniqueSorted(reasons),
    };
  }
  const snapshot = input.raw as CanonicalImprovementBindingSnapshot;
  if (
    snapshot.snapshot_version !==
      CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION ||
    snapshot.snapshot_digest_algorithm !== "sha256_canonical_json_v1"
  ) {
    reasons.push("snapshot_version_invalid");
  }
  if (
    !validPositiveInteger(snapshot.publication_sequence) ||
    !validPositiveInteger(snapshot.publication_epoch)
  ) {
    reasons.push("snapshot_epoch_invalid");
  }
  const published = canonicalInstant(snapshot.published_at);
  const effective = canonicalInstant(snapshot.effective_at);
  if (
    !published ||
    !effective ||
    published.canonical !== snapshot.published_at ||
    effective.canonical !== snapshot.effective_at ||
    published.epoch_nanoseconds > effective.epoch_nanoseconds
  ) {
    reasons.push("snapshot_temporal_contract_invalid");
  }
  if (
    snapshot.snapshot_identity !==
    canonicalImprovementBindingSnapshotIdentity(snapshot)
  ) {
    reasons.push("snapshot_identity_mismatch");
  }
  if (
    snapshot.publication_sequence === 1 ||
    snapshot.publication_epoch === 1
  ) {
    if (
      snapshot.publication_sequence !== 1 ||
      snapshot.publication_epoch !== 1 ||
      snapshot.predecessor.state !== "genesis" ||
      snapshot.predecessor.previous_snapshot_digest !== null ||
      snapshot.predecessor.previous_publication_sequence !== null ||
      snapshot.predecessor.previous_publication_epoch !== null
    ) {
      reasons.push("snapshot_genesis_contract_invalid");
    }
  } else if (
    snapshot.predecessor.state !== "linked" ||
    !fullShaPattern.test(
      snapshot.predecessor.previous_snapshot_digest ?? "",
    ) ||
    snapshot.predecessor.previous_publication_sequence !==
      snapshot.publication_sequence - 1 ||
    snapshot.predecessor.previous_publication_epoch === null ||
    snapshot.predecessor.previous_publication_epoch >=
      snapshot.publication_epoch
  ) {
    reasons.push("snapshot_predecessor_contract_invalid");
  }
  if (!Array.isArray(snapshot.entry_inventory)) {
    reasons.push("snapshot_entry_inventory_missing");
  } else {
    const entries = snapshot.entry_inventory
      .map((entry) => validateEntry(entry, reasons))
      .filter(
        (entry): entry is CanonicalImprovementBindingEntry =>
          entry !== null,
      );
    const identities = new Map<string, string>();
    const keys = new Map<string, string>();
    const crossTypes = new Map<string, string>();
    for (const entry of entries) {
      const priorIdentity = identities.get(entry.entry_identity);
      if (priorIdentity) {
        reasons.push(
          priorIdentity === entry.entry_digest
            ? "snapshot_entry_identity_duplicate"
            : "snapshot_entry_identity_conflicting_bytes",
        );
      }
      identities.set(entry.entry_identity, entry.entry_digest);
      const typedKey = `${entry.entry_type}:${entry.canonical_lookup_key}`;
      const priorKey = keys.get(typedKey);
      if (priorKey) {
        reasons.push(
          priorKey === entry.entry_digest
            ? "snapshot_lookup_key_duplicate"
            : "snapshot_lookup_key_conflicting_bytes",
        );
      }
      keys.set(typedKey, entry.entry_digest);
      const priorType = crossTypes.get(entry.bound_identity);
      if (priorType && priorType !== entry.entry_type) {
        reasons.push("snapshot_cross_type_identity_collision");
      }
      crossTypes.set(entry.bound_identity, entry.entry_type);
    }
    const ordered = [...entries].sort((first, second) =>
      first.entry_identity.localeCompare(second.entry_identity),
    );
    if (
      entries.some(
        (entry, index) =>
          entry.entry_identity !== ordered[index]?.entry_identity,
      )
    ) {
      reasons.push("snapshot_entry_inventory_not_canonical");
    }
    if (snapshot.entry_inventory_digest !== inventoryDigest(ordered)) {
      reasons.push("snapshot_entry_inventory_digest_mismatch");
    }
  }
  const payload = structuredClone(
    snapshot,
  ) as CanonicalImprovementBindingSnapshot;
  delete (
    payload as Partial<CanonicalImprovementBindingSnapshot>
  ).snapshot_digest;
  if (snapshot.snapshot_digest !== digest(payload)) {
    reasons.push("snapshot_digest_mismatch");
  }
  const authority = input.authority;
  if (
    snapshot.snapshot_identity !== authority.expected_snapshot_identity ||
    snapshot.snapshot_digest !== authority.expected_snapshot_digest ||
    snapshot.owner_authority_identity !==
      authority.expected_owner_authority_identity ||
    snapshot.publication_sequence !==
      authority.expected_publication_sequence ||
    snapshot.publication_epoch !== authority.expected_publication_epoch ||
    snapshot.predecessor.previous_snapshot_digest !==
      authority.expected_predecessor_digest
  ) {
    reasons.push("snapshot_authority_binding_mismatch");
  }
  if (
    snapshot.expected_external_trust_root !==
      authority.expected_external_trust_root
  ) {
    reasons.push("snapshot_external_trust_root_mismatch");
  }
  return {
    valid: reasons.length === 0,
    snapshot: reasons.length === 0 ? deepFreeze(structuredClone(snapshot)) : null,
    observed_snapshot_identity: observedSnapshotIdentity,
    observed_snapshot_digest:
      reasons.length === 0
        ? snapshot.snapshot_digest
        : observedSnapshotDigest,
    observed_publication_sequence: observedPublicationSequence,
    observed_publication_epoch: observedPublicationEpoch,
    owner_boundary_identity: input.boundaryIdentity,
    authority_identity: authorityIdentity,
    authority_digest: authorityDigest,
    expected_external_trust_root: expectedExternalTrustRoot,
    reason_codes: uniqueSorted(reasons),
  };
}

function result(input: {
  status: CanonicalImprovementBindingLookupStatus;
  namespace: CanonicalImprovementBindingLookupResult["lookup_namespace"];
  identity: string;
  canonicalLookupKey: string;
  asOf: string | null;
  validation: SnapshotValidation;
  entry: CanonicalImprovementBindingEntry | null;
  reasonCodes: string[];
  counters: CanonicalImprovementBindingStoreCounters;
}) {
  const snapshot = input.validation.snapshot;
  const payload = {
    result_version: CANONICAL_IMPROVEMENT_BINDING_LOOKUP_RESULT_VERSION,
    store_version: CANONICAL_IMPROVEMENT_BINDING_STORE_VERSION,
    status: input.status,
    lookup_namespace: input.namespace,
    lookup_identity: input.identity,
    canonical_lookup_key: input.canonicalLookupKey,
    as_of: input.asOf,
    snapshot_identity:
      snapshot?.snapshot_identity ??
      input.validation.observed_snapshot_identity,
    snapshot_digest: input.validation.observed_snapshot_digest,
    publication_sequence:
      snapshot?.publication_sequence ??
      input.validation.observed_publication_sequence,
    publication_epoch:
      snapshot?.publication_epoch ??
      input.validation.observed_publication_epoch,
    owner_boundary_identity: input.validation.owner_boundary_identity,
    authority_identity: input.validation.authority_identity,
    authority_digest: input.validation.authority_digest,
    expected_external_trust_root:
      input.validation.expected_external_trust_root,
    entry_identity: input.entry?.entry_identity ?? null,
    entry_digest: input.entry?.entry_digest ?? null,
    observed_binding_digest:
      input.entry?.observed_binding_digest ?? null,
    reason_codes: uniqueSorted(input.reasonCodes),
    result_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...payload,
    result_digest: digest(payload, input.counters),
  });
}

function openStore(input: {
  validation: SnapshotValidation;
  counters: CanonicalImprovementBindingStoreCounters;
}) {
  const invalidLookupRequest = (
    namespace: CanonicalImprovementBindingLookupResult["lookup_namespace"],
    identity: string,
    key: string,
  ) => {
    input.counters.request_reads += 1;
    return result({
      status: "conflicting",
      namespace,
      identity,
      canonicalLookupKey: key,
      asOf: null,
      validation: input.validation,
      entry: null,
      reasonCodes: ["lookup_request_schema_invalid"],
      counters: input.counters,
    });
  };
  const lookup = (
    namespace: CanonicalImprovementBindingLookupResult["lookup_namespace"],
    identity: string,
    subjectType: CanonicalImprovementBindingSubjectType,
    entryType: CanonicalImprovementBindingEntryType,
    asOfValue: string,
  ): CanonicalImprovementBindingLookupResult => {
    input.counters.request_reads += 1;
    const key = entryLookupKey(subjectType, identity);
    const asOf = canonicalInstant(asOfValue);
    if (!input.validation.valid || !input.validation.snapshot) {
      return result({
        status: "invalid_snapshot",
        namespace,
        identity,
        canonicalLookupKey: key,
        asOf: asOf?.canonical ?? null,
        validation: input.validation,
        entry: null,
        reasonCodes: input.validation.reason_codes,
        counters: input.counters,
      });
    }
    if (!validIdentity(identity)) {
      return result({
        status: "conflicting",
        namespace,
        identity,
        canonicalLookupKey: key,
        asOf: asOf?.canonical ?? null,
        validation: input.validation,
        entry: null,
        reasonCodes: ["lookup_identity_invalid"],
        counters: input.counters,
      });
    }
    if (!asOf) {
      return result({
        status: "not_effective",
        namespace,
        identity,
        canonicalLookupKey: key,
        asOf: null,
        validation: input.validation,
        entry: null,
        reasonCodes: ["lookup_as_of_not_explicit_instant"],
        counters: input.counters,
      });
    }
    const snapshot = input.validation.snapshot;
    const published = canonicalInstant(snapshot.published_at)!;
    const effective = canonicalInstant(snapshot.effective_at)!;
    if (
      asOf.epoch_nanoseconds < published.epoch_nanoseconds ||
      asOf.epoch_nanoseconds < effective.epoch_nanoseconds
    ) {
      return result({
        status: "not_effective",
        namespace,
        identity,
        canonicalLookupKey: key,
        asOf: asOf.canonical,
        validation: input.validation,
        entry: null,
        reasonCodes: ["snapshot_not_effective_at_lookup"],
        counters: input.counters,
      });
    }
    input.counters.entry_lookups += 1;
    const matches = snapshot.entry_inventory.filter(
      (entry) =>
        entry.entry_type === entryType &&
        entry.canonical_lookup_key === key,
    );
    if (matches.length > 1) {
      return result({
        status: "conflicting",
        namespace,
        identity,
        canonicalLookupKey: key,
        asOf: asOf.canonical,
        validation: input.validation,
        entry: null,
        reasonCodes: ["lookup_multiple_entries"],
        counters: input.counters,
      });
    }
    const entry = matches[0] ?? null;
    if (!entry) {
      return result({
        status: "absent",
        namespace,
        identity,
        canonicalLookupKey: key,
        asOf: asOf.canonical,
        validation: input.validation,
        entry: null,
        reasonCodes: [],
        counters: input.counters,
      });
    }
    const entryEffective = canonicalInstant(entry.effective_at)!;
    if (asOf.epoch_nanoseconds < entryEffective.epoch_nanoseconds) {
      return result({
        status: "not_effective",
        namespace,
        identity,
        canonicalLookupKey: key,
        asOf: asOf.canonical,
        validation: input.validation,
        entry,
        reasonCodes: ["entry_not_effective_at_lookup"],
        counters: input.counters,
      });
    }
    return result({
      status: "found",
      namespace,
      identity,
      canonicalLookupKey: key,
      asOf: asOf.canonical,
      validation: input.validation,
      entry,
      reasonCodes: [],
      counters: input.counters,
    });
  };
  return deepFreeze({
    store_version: CANONICAL_IMPROVEMENT_BINDING_STORE_VERSION,
    validation_status: input.validation.valid
      ? ("valid" as const)
      : ("invalid_snapshot" as const),
    validation_reason_codes: input.validation.reason_codes,
    snapshot_identity:
      input.validation.snapshot?.snapshot_identity ??
      input.validation.observed_snapshot_identity,
    snapshot_digest: input.validation.observed_snapshot_digest,
    owner_boundary_identity: input.validation.owner_boundary_identity,
    authority_identity: input.validation.authority_identity,
    authority_digest: input.validation.authority_digest,
    expected_external_trust_root:
      input.validation.expected_external_trust_root,
    lookup_previous_binding: (request: {
      binding_identity_type: "proposal" | "experiment";
      binding_identity: string;
      as_of: string;
    }) => {
      if (
        !isRecord(request) ||
        !exactKeys(request, [
          "binding_identity_type",
          "binding_identity",
          "as_of",
        ]) ||
        (request.binding_identity_type !== "proposal" &&
          request.binding_identity_type !== "experiment")
      ) {
        return invalidLookupRequest(
          "previous_proposal_binding",
          isRecord(request) && typeof request.binding_identity === "string"
            ? request.binding_identity
            : "invalid:lookup-identity",
          "invalid:lookup-key",
        );
      }
      return lookup(
        request.binding_identity_type === "proposal"
          ? "previous_proposal_binding"
          : "previous_experiment_binding",
        request.binding_identity,
        request.binding_identity_type,
        "previous_binding",
        request.as_of,
      );
    },
    lookup_capture_binding: (request: {
      capture_identity: string;
      as_of: string;
    }) => {
      if (
        !isRecord(request) ||
        !exactKeys(request, ["capture_identity", "as_of"])
      ) {
        return invalidLookupRequest(
          "capture_identity_binding",
          isRecord(request) && typeof request.capture_identity === "string"
            ? request.capture_identity
            : "invalid:lookup-identity",
          "invalid:lookup-key",
        );
      }
      return lookup(
        "capture_identity_binding",
        request.capture_identity,
        "capture",
        "capture_binding",
        request.as_of,
      );
    },
    ...safety,
  });
}

function adapterValue(resultValue: CanonicalImprovementBindingLookupResult) {
  if (resultValue.status === "absent") return null;
  if (
    resultValue.status === "found" &&
    resultValue.observed_binding_digest
  ) {
    return { semantic_digest: resultValue.observed_binding_digest };
  }
  throw new Error(`canonical_binding_store_${resultValue.status}`);
}

export function createCanonicalImprovementBindingLookupAdapters(input: {
  store: ReturnType<typeof openStore>;
  as_of: string;
}): CanonicalImprovementBindingLookupAdapters {
  return deepFreeze({
    previous_binding_lookup: {
      lookup_proposal_binding: (identity) =>
        adapterValue(
          input.store.lookup_previous_binding({
            binding_identity_type: "proposal",
            binding_identity: identity,
            as_of: input.as_of,
          }),
        ),
      lookup_experiment_binding: (identity) =>
        adapterValue(
          input.store.lookup_previous_binding({
            binding_identity_type: "experiment",
            binding_identity: identity,
            as_of: input.as_of,
          }),
        ),
    },
    capture_binding_lookup: {
      lookup_capture_binding: (identity) =>
        adapterValue(
          input.store.lookup_capture_binding({
            capture_identity: identity,
            as_of: input.as_of,
          }),
        ),
    },
  });
}

export function createCanonicalImprovementBindingStoreHarness(input: {
  enabled?: boolean;
  kill_switch_engaged?: boolean;
  owner_dependency?: CanonicalImprovementBindingOwnerDependency;
  counters?: CanonicalImprovementBindingStoreCounters;
} = {}) {
  const enabled =
    input.enabled ?? DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_ENABLED;
  const killSwitch =
    input.kill_switch_engaged ??
    DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_KILL_SWITCH_ENGAGED;
  const counters = input.counters ?? emptyCounters();
  if (!enabled || killSwitch) {
    return deepFreeze({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      store: null,
      counters,
      ...safety,
    });
  }
  const dependency = input.owner_dependency;
  if (
    !dependency ||
    dependency.owner_boundary_version !==
      CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION ||
    !validIdentity(dependency.owner_boundary_identity)
  ) {
    return deepFreeze({
      enabled: true as const,
      status: "unavailable" as const,
      store: null,
      reason_codes: ["binding_owner_dependency_missing_or_invalid"],
      counters,
      ...safety,
    });
  }
  let authority: CanonicalImprovementBindingSnapshotAuthority | null = null;
  let rawSnapshot: unknown = null;
  try {
    counters.authority_lookups += 1;
    authority = dependency.read_expected_authority();
    counters.snapshot_reads += 1;
    rawSnapshot = dependency.read_verified_snapshot();
    counters.clones += 1;
    rawSnapshot = structuredClone(rawSnapshot);
  } catch {
    const validation: SnapshotValidation = {
      valid: false,
      snapshot: null,
      observed_snapshot_identity: null,
      observed_snapshot_digest: safeObservedDigest(
        { snapshot_read_failed: true },
        counters,
      ),
      observed_publication_sequence: null,
      observed_publication_epoch: null,
      owner_boundary_identity: dependency.owner_boundary_identity,
      authority_identity: null,
      authority_digest: null,
      expected_external_trust_root: null,
      reason_codes: ["binding_owner_dependency_read_failed"],
    };
    return {
      enabled: true as const,
      status: "ready" as const,
      store: openStore({ validation, counters }),
      counters,
      ...safety,
    };
  }
  const validation = validateSnapshot({
    raw: rawSnapshot,
    authority,
    boundaryIdentity: dependency.owner_boundary_identity,
    counters,
  });
  return {
    enabled: true as const,
    status: "ready" as const,
    store: openStore({ validation, counters }),
    counters,
    ...safety,
  };
}

export function canonicalImprovementBindingSnapshotDigest(
  snapshot: CanonicalImprovementBindingSnapshot,
) {
  return snapshot.snapshot_digest;
}
