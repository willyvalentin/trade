import {
  DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
  parseDatabentoExplicitNanosecondInstantV1,
} from "./databento-explicit-nanosecond-instant-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
  createMarketContextDiagnosticContextSnapshotV1,
  deriveMarketContextDiagnosticTrustRootV1,
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
  type MarketContextDiagnosticContextSnapshotInputV1,
  type MarketContextDiagnosticContextSnapshotV1,
  type MarketContextDiagnosticContextTaxonomyV1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1,
  marketContextDiagnosticTrustedSourceRegistryEqualV1,
  validateMarketContextDiagnosticTrustedSourceRegistryV1,
  type MarketContextDiagnosticSourceBundleV1,
  type MarketContextDiagnosticTrustedSourceAuthorityV1,
  type MarketContextDiagnosticTrustedSourceRegistryAnchorV1,
} from "./diagnostic-context-trusted-source-registry-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2 =
  "market_context_diagnostic_decision_time_context_feature_snapshot_v2" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_RESULT_V2 =
  "market_context_diagnostic_decision_time_context_feature_result_v2" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V2 =
  "market_context_diagnostic_context_feature_envelope_v2" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2 =
  "market_context_diagnostic_context_finalized_bucket_policy_v2" as const;

const FORBIDDEN_AUTHORITY_CLAIMS = new Set([
  "canonical",
  "verified",
  "trusted",
  "point_in_time_safe",
  "complete",
  "sufficient",
  "official_ohlcv",
  "performance_eligible",
  "outcome_explanatory",
  "causal",
  "model_input_allowed",
  "live_ranking_effect",
]);

export type MarketContextDiagnosticContextSnapshotRequestV2 = {
  contract_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2;
  decision_identity: {
    external_decision_id: string;
    session_id: string;
    symbol_identity: string | null;
    opportunity_set_identity: string | null;
  };
  decision_unix_ns: string;
  decision_source: {
    contract: string;
    version: string;
  };
  normalized_dataset: MarketContextDiagnosticSourceBundleV1["normalized_dataset"];
  replay: MarketContextDiagnosticSourceBundleV1["replay"];
  calendar: MarketContextDiagnosticSourceBundleV1["calendar"];
  policy_bundle: MarketContextDiagnosticSourceBundleV1["policy_bundle"];
  source_decision_sha256: string;
};

export type MarketContextDiagnosticContextSnapshotDependenciesV2 = {
  enabled: boolean;
  authority?: MarketContextDiagnosticTrustedSourceAuthorityV1;
};

type RegistryBinding = {
  authority_version:
    | typeof MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1
    | null;
  registry_identity: string | null;
  registry_version:
    | typeof MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1
    | null;
  registry_digest: string | null;
  verification_status:
    | "verified"
    | "not_read_default_off"
    | "authority_missing"
    | "lookup_failed"
    | "invalid"
    | "mismatch";
};

export type MarketContextDiagnosticContextSnapshotV2 = Omit<
  MarketContextDiagnosticContextSnapshotV1,
  | "contract_version"
  | "envelope_version"
  | "point_in_time"
  | "identities"
  | "feature_snapshot_digest"
> & {
  contract_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2;
  result_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_RESULT_V2;
  envelope_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V2;
  point_in_time: MarketContextDiagnosticContextSnapshotV1["point_in_time"] & {
    finalization_policy_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2;
    candle_bucket_end_after_finalized_boundary_count: number;
    finalization_timestamp_after_decision_count: number;
    pending_buckets_counted_as_missing: false;
  };
  identities: {
    trusted_source_registry: RegistryBinding;
    normalized_dataset: MarketContextDiagnosticContextSnapshotRequestV2["normalized_dataset"];
    replay: MarketContextDiagnosticContextSnapshotRequestV2["replay"];
    source_decision_sha256: string;
    calendar: MarketContextDiagnosticContextSnapshotRequestV2["calendar"];
    policy_bundle: MarketContextDiagnosticContextSnapshotRequestV2["policy_bundle"];
  };
  compatibility: {
    predecessor_contract: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1;
    predecessor_snapshots_implicitly_remediated: false;
  };
  feature_snapshot_digest: string;
};

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isUnixNs(value: unknown): value is string {
  return typeof value === "string" && /^(0|[1-9]\d*)$/.test(value);
}

function exactKeys(
  value: unknown,
  expected: readonly string[],
  path: string,
  reasons: string[],
) {
  const candidate = record(value);
  if (!candidate) {
    reasons.push(`closed_schema_not_object:${path}`);
    return null;
  }
  const expectedSet = new Set(expected);
  for (const key of Object.keys(candidate)) {
    if (!expectedSet.has(key)) reasons.push(`closed_schema_unknown_field:${path}.${key}`);
  }
  for (const key of expected) {
    if (!(key in candidate)) reasons.push(`closed_schema_missing_field:${path}.${key}`);
  }
  return candidate;
}

function forbiddenClaimReasons(value: unknown) {
  const reasons: string[] = [];
  const seen = new Set<object>();
  function visit(candidate: unknown, path: string) {
    if (candidate === null || typeof candidate !== "object") return;
    if (seen.has(candidate)) {
      reasons.push(`caller_input_cycle_rejected:${path}`);
      return;
    }
    seen.add(candidate);
    if (Array.isArray(candidate)) {
      candidate.forEach((item, index) => visit(item, `${path}[${index}]`));
    } else {
      for (const [key, child] of Object.entries(candidate as JsonRecord)) {
        if (FORBIDDEN_AUTHORITY_CLAIMS.has(key)) {
          reasons.push(`caller_authority_claim_forbidden:${path}.${key}`);
        }
        visit(child, `${path}.${key}`);
      }
    }
    seen.delete(candidate);
  }
  visit(value, "$");
  return reasons;
}

function validateRequest(value: unknown) {
  const reasons = forbiddenClaimReasons(value);
  const input = exactKeys(
    value,
    [
      "contract_version",
      "decision_identity",
      "decision_unix_ns",
      "decision_source",
      "normalized_dataset",
      "replay",
      "calendar",
      "policy_bundle",
      "source_decision_sha256",
    ],
    "$",
    reasons,
  );
  if (!input) return [...new Set(reasons)].sort();
  if (
    input.contract_version !==
    MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2
  ) {
    reasons.push("snapshot_contract_version_mismatch");
  }
  const identity = exactKeys(
    input.decision_identity,
    [
      "external_decision_id",
      "session_id",
      "symbol_identity",
      "opportunity_set_identity",
    ],
    "$.decision_identity",
    reasons,
  );
  if (
    !identity ||
    typeof identity.external_decision_id !== "string" ||
    identity.external_decision_id.length === 0 ||
    typeof identity.session_id !== "string" ||
    identity.session_id.length === 0 ||
    !(
      identity.symbol_identity === null ||
      typeof identity.symbol_identity === "string"
    ) ||
    !(
      identity.opportunity_set_identity === null ||
      typeof identity.opportunity_set_identity === "string"
    )
  ) {
    reasons.push("decision_identity_invalid");
  }
  const source = exactKeys(
    input.decision_source,
    ["contract", "version"],
    "$.decision_source",
    reasons,
  );
  if (
    !source ||
    typeof source.contract !== "string" ||
    source.contract.length === 0 ||
    typeof source.version !== "string" ||
    source.version.length === 0
  ) {
    reasons.push("decision_source_invalid");
  }
  const normalized = exactKeys(
    input.normalized_dataset,
    [
      "identity",
      "dataset_digest",
      "output_tree_digest",
      "lineage_digest",
      "manifest_digest",
    ],
    "$.normalized_dataset",
    reasons,
  );
  const replay = exactKeys(
    input.replay,
    [
      "identity",
      "dataset_digest",
      "output_tree_digest",
      "manifest_digest",
      "core_evidence_digest",
    ],
    "$.replay",
    reasons,
  );
  const calendar = exactKeys(
    input.calendar,
    ["identity", "digest"],
    "$.calendar",
    reasons,
  );
  const policy = exactKeys(
    input.policy_bundle,
    [
      "diagnostic_candle_policy",
      "replay_contract",
      "replay_schedule",
      "market_context_contract",
      "market_context_thresholds",
      "watermark_policy",
      "provisional_watermark_ns",
      "watermark_status",
      "instant_parser",
    ],
    "$.policy_bundle",
    reasons,
  );
  const stringFields = [
    normalized?.identity,
    replay?.identity,
    calendar?.identity,
    source?.contract,
    source?.version,
    ...(policy ? Object.values(policy) : []),
  ];
  const digests = [
    normalized?.dataset_digest,
    normalized?.output_tree_digest,
    normalized?.lineage_digest,
    normalized?.manifest_digest,
    replay?.dataset_digest,
    replay?.output_tree_digest,
    replay?.manifest_digest,
    replay?.core_evidence_digest,
    calendar?.digest,
    input.source_decision_sha256,
  ];
  if (
    stringFields.some(
      (item) => typeof item !== "string" || item.length === 0,
    )
  ) {
    reasons.push("source_identity_invalid");
  }
  if (digests.some((item) => !isSha256(item))) {
    reasons.push("required_digest_invalid");
  }
  if (
    !policy ||
    policy.watermark_status !== "empirically_unvalidated" ||
    policy.instant_parser !== DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1 ||
    !isUnixNs(policy.provisional_watermark_ns) ||
    BigInt(policy.provisional_watermark_ns) <= BigInt(0)
  ) {
    reasons.push("policy_bundle_invalid");
  }
  if (!isUnixNs(input.decision_unix_ns)) {
    reasons.push("decision_unix_ns_malformed");
  }
  return [...new Set(reasons)].sort();
}

function registryBinding(
  anchor: MarketContextDiagnosticTrustedSourceRegistryAnchorV1 | null,
  status: RegistryBinding["verification_status"],
): RegistryBinding {
  return {
    authority_version:
      anchor === null
        ? null
        : MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1,
    registry_identity: anchor?.registry_identity ?? null,
    registry_version: anchor?.registry_version ?? null,
    registry_digest: anchor?.registry_digest ?? null,
    verification_status: status,
  };
}

function safeRequestIdentity(value: unknown) {
  const input = record(value);
  const identity = record(input?.decision_identity);
  return {
    external_decision_id:
      typeof identity?.external_decision_id === "string"
        ? identity.external_decision_id
        : "invalid",
    session_id:
      typeof identity?.session_id === "string" ? identity.session_id : "invalid",
    symbol_identity:
      typeof identity?.symbol_identity === "string"
        ? identity.symbol_identity
        : null,
    opportunity_set_identity:
      typeof identity?.opportunity_set_identity === "string"
        ? identity.opportunity_set_identity
        : null,
  };
}

function rejectionSnapshot(
  value: unknown,
  taxonomy: MarketContextDiagnosticContextTaxonomyV1,
  reasons: string[],
  binding: RegistryBinding,
): MarketContextDiagnosticContextSnapshotV2 {
  const input = record(value);
  const pointInTime = {
    policy_version:
      "market_context_diagnostic_context_point_in_time_policy_v1" as const,
    latest_finalized_bucket_unix_ns: null,
    provider_timestamp_after_decision_count: 0,
    future_input_points_passed_to_core: 0,
    record_finalization_violation_count: 0,
    current_full_day_aggregation_used: false,
    excluded_future_candle_count: 0,
    excluded_future_gap_count: 0,
    excluded_later_session_row_count: 0,
    finalization_policy_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2,
    candle_bucket_end_after_finalized_boundary_count: 0,
    finalization_timestamp_after_decision_count: 0,
    pending_buckets_counted_as_missing: false as const,
  };
  const material = {
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
    result_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_RESULT_V2,
    envelope_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V2,
    taxonomy,
    decision_identity: safeRequestIdentity(value),
    decision_unix_ns:
      typeof input?.decision_unix_ns === "string"
        ? input.decision_unix_ns
        : "invalid",
    decision_source: {
      contract: "invalid",
      version: "invalid",
    },
    point_in_time: pointInTime,
    context: null,
    identities: {
      trusted_source_registry: binding,
      normalized_dataset: {
        identity: "invalid",
        dataset_digest: "",
        output_tree_digest: "",
        lineage_digest: "",
        manifest_digest: "",
      },
      replay: {
        identity: "invalid",
        dataset_digest: "",
        output_tree_digest: "",
        manifest_digest: "",
        core_evidence_digest: "",
      },
      source_decision_sha256: "",
      calendar: { identity: "invalid", digest: "" },
      policy_bundle: {
        diagnostic_candle_policy: "invalid",
        replay_contract: "invalid",
        replay_schedule: "invalid",
        market_context_contract: "invalid",
        market_context_thresholds: "invalid",
        watermark_policy: "invalid",
        provisional_watermark_ns: "invalid",
        watermark_status: "empirically_unvalidated" as const,
        instant_parser: DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      },
    },
    reason_codes: [...new Set(reasons)].sort(),
    boundary: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
    compatibility: {
      predecessor_contract:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
      predecessor_snapshots_implicitly_remediated: false as const,
    },
  };
  return {
    ...material,
    feature_snapshot_digest:
      marketContextDiagnosticContextSha256V1(material),
  };
}

function parseInstant(
  value: unknown,
  field: string,
  maximumNs: bigint,
  reason: string,
  reasons: string[],
) {
  const parsed = parseDatabentoExplicitNanosecondInstantV1(value, field);
  if (!parsed.ok) {
    reasons.push(`${reason}_invalid:${field}`);
    return null;
  }
  if (BigInt(parsed.unix_nanoseconds) > maximumNs) {
    reasons.push(`${reason}:${field}`);
  }
  return BigInt(parsed.unix_nanoseconds);
}

function finalizationReasons(
  sourceDecision: unknown,
  request: MarketContextDiagnosticContextSnapshotRequestV2,
) {
  const reasons: string[] = [];
  const source = record(sourceDecision);
  const schedule = record(source?.schedule);
  const evaluation = record(source?.evaluation);
  const v2 = record(evaluation?.v2_evaluation);
  const audit = record(source?.adapter_audit);
  const pointInTime = record(evaluation?.point_in_time_audit);
  if (!source || !schedule || !evaluation || !v2 || !audit || !pointInTime) {
    return {
      latestFinalizedBucketNs: null,
      reasons: ["trusted_source_decision_structure_incomplete"],
    };
  }
  const decisionNs = BigInt(request.decision_unix_ns);
  if (
    schedule.decision_id !== request.decision_identity.external_decision_id ||
    schedule.session_date !== request.decision_identity.session_id ||
    schedule.decision_unix_ns !== request.decision_unix_ns
  ) {
    reasons.push("trusted_decision_identity_or_session_mismatch");
  }
  const decisionTimestamp = parseDatabentoExplicitNanosecondInstantV1(
    schedule.decision_timestamp,
    "schedule.decision_timestamp",
  );
  if (
    !decisionTimestamp.ok ||
    decisionTimestamp.unix_nanoseconds !== request.decision_unix_ns
  ) {
    reasons.push("trusted_decision_timestamp_mismatch");
  }
  if (
    !isUnixNs(schedule.provisional_watermark_ns) ||
    BigInt(schedule.provisional_watermark_ns) <= BigInt(0) ||
    schedule.provisional_watermark_ns !==
      request.policy_bundle.provisional_watermark_ns
  ) {
    return {
      latestFinalizedBucketNs: null,
      reasons: [...reasons, "watermark_policy_value_invalid_or_mismatch"].sort(),
    };
  }
  const watermarkNs = BigInt(schedule.provisional_watermark_ns);
  const latestFinalizedBucketNs = decisionNs - watermarkNs;
  if (latestFinalizedBucketNs < BigInt(0)) {
    reasons.push("latest_finalized_bucket_before_unix_epoch");
  }

  const observationTimes = Array.isArray(pointInTime.observation_times)
    ? pointInTime.observation_times
    : [];
  observationTimes.forEach((item, index) => {
    const observation = record(item);
    const bucketEnd = parseInstant(
      observation?.observation_timestamp,
      `point_in_time_audit.observation_times.${index}.observation_timestamp`,
      latestFinalizedBucketNs,
      "candle_bucket_end_after_finalized_boundary",
      reasons,
    );
    if (bucketEnd !== null && bucketEnd + watermarkNs > decisionNs) {
      reasons.push(
        `finalization_timestamp_after_decision:point_in_time_audit.observation_times.${index}`,
      );
    }
  });

  const providerCollections = [
    {
      values: Array.isArray(v2.provider_timestamps)
        ? v2.provider_timestamps
        : [],
      path: "v2_evaluation.provider_timestamps",
    },
    {
      values: Array.isArray(pointInTime.provider_times)
        ? pointInTime.provider_times
        : [],
      path: "point_in_time_audit.provider_times",
    },
  ];
  for (const collection of providerCollections) {
    collection.values.forEach((item, index) => {
      const provider = record(item);
      parseInstant(
        provider?.source_timestamp,
        `${collection.path}.${index}.source_timestamp`,
        decisionNs,
        "provider_source_timestamp_after_decision",
        reasons,
      );
      parseInstant(
        provider?.received_timestamp,
        `${collection.path}.${index}.received_timestamp`,
        decisionNs,
        "provider_received_timestamp_after_decision",
        reasons,
      );
    });
  }
  for (const field of [
    "maximum_provider_received_unix_ns",
    "maximum_provider_source_unix_ns",
  ] as const) {
    if (!isUnixNs(audit[field]) || BigInt(audit[field]) > decisionNs) {
      reasons.push(`${field}_after_decision_or_invalid`);
    }
  }
  if (audit.current_full_day_aggregation_used !== false) {
    reasons.push("current_full_day_aggregation_forbidden");
  }
  if (
    audit.provider_timestamp_after_decision_count !== 0 ||
    audit.future_input_points_passed_to_core !== 0 ||
    audit.record_finalization_violation_count !== 0
  ) {
    reasons.push("trusted_point_in_time_counter_nonzero");
  }
  return {
    latestFinalizedBucketNs,
    reasons: [...new Set(reasons)].sort(),
  };
}

function sourceBundle(
  request: MarketContextDiagnosticContextSnapshotRequestV2,
): MarketContextDiagnosticSourceBundleV1 {
  return {
    normalized_dataset: request.normalized_dataset,
    replay: request.replay,
    calendar: request.calendar,
    policy_bundle: request.policy_bundle,
  };
}

export function createMarketContextDiagnosticContextSnapshotV2(
  value: unknown,
  dependencies: MarketContextDiagnosticContextSnapshotDependenciesV2,
): MarketContextDiagnosticContextSnapshotV2 {
  const validation = validateRequest(value);
  const anchor = dependencies.authority?.expected_registry_anchor ?? null;
  if (validation.length > 0) {
    return rejectionSnapshot(
      value,
      validation.some(
        (reason) =>
          reason.startsWith("caller_authority_claim_forbidden:") ||
          reason === "decision_unix_ns_malformed",
      )
        ? "not_point_in_time_safe"
        : "conflicting",
      validation,
      registryBinding(anchor, "invalid"),
    );
  }
  const request = value as MarketContextDiagnosticContextSnapshotRequestV2;
  if (!dependencies.enabled) {
    return rejectionSnapshot(
      request,
      "insufficient_data",
      ["snapshot_factory_default_off"],
      registryBinding(anchor, "not_read_default_off"),
    );
  }
  const authority = dependencies.authority;
  if (
    !authority ||
    authority.authority_version !==
      MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1
  ) {
    return rejectionSnapshot(
      request,
      "conflicting",
      ["trusted_source_authority_missing_or_invalid"],
      registryBinding(null, "authority_missing"),
    );
  }

  let registryValue: unknown;
  try {
    registryValue = structuredClone(authority.read_registry());
  } catch {
    return rejectionSnapshot(
      request,
      "conflicting",
      ["trusted_source_registry_lookup_failed"],
      registryBinding(authority.expected_registry_anchor, "lookup_failed"),
    );
  }
  if (!validateMarketContextDiagnosticTrustedSourceRegistryV1(registryValue)) {
    return rejectionSnapshot(
      request,
      "conflicting",
      ["trusted_source_registry_invalid"],
      registryBinding(authority.expected_registry_anchor, "invalid"),
    );
  }
  const registry = registryValue;
  const actualAnchor = {
    registry_identity: registry.registry_identity,
    registry_version: registry.registry_version,
    registry_digest: registry.registry_digest,
  };
  if (
    !marketContextDiagnosticTrustedSourceRegistryEqualV1(
      actualAnchor,
      authority.expected_registry_anchor,
    )
  ) {
    return rejectionSnapshot(
      request,
      "conflicting",
      ["trusted_source_registry_anchor_mismatch"],
      registryBinding(authority.expected_registry_anchor, "mismatch"),
    );
  }
  const verifiedBinding = registryBinding(actualAnchor, "verified");
  if (
    !marketContextDiagnosticTrustedSourceRegistryEqualV1(
      request.decision_source,
      registry.decision_source,
    ) ||
    !marketContextDiagnosticTrustedSourceRegistryEqualV1(
      sourceBundle(request),
      registry.source_bundle,
    )
  ) {
    return rejectionSnapshot(
      request,
      "conflicting",
      ["trusted_source_bundle_mismatch"],
      verifiedBinding,
    );
  }
  const expectedDecisionDigest =
    registry.decision_digests[request.decision_identity.external_decision_id];
  if (
    expectedDecisionDigest === undefined ||
    expectedDecisionDigest !== request.source_decision_sha256
  ) {
    return rejectionSnapshot(
      request,
      "conflicting",
      ["trusted_source_decision_digest_mismatch"],
      verifiedBinding,
    );
  }

  let resolution;
  try {
    resolution = structuredClone(
      authority.read_decision(
        request.decision_identity.external_decision_id,
      ),
    );
  } catch {
    return rejectionSnapshot(
      request,
      "conflicting",
      ["trusted_source_decision_lookup_failed"],
      verifiedBinding,
    );
  }
  if (resolution.status !== "resolved") {
    return rejectionSnapshot(
      request,
      "insufficient_data",
      ["trusted_source_decision_not_found"],
      verifiedBinding,
    );
  }
  if (
    resolution.source_decision_sha256 !== expectedDecisionDigest ||
    marketContextDiagnosticContextSha256V1(resolution.source_decision) !==
      expectedDecisionDigest
  ) {
    return rejectionSnapshot(
      request,
      "conflicting",
      ["trusted_source_decision_content_mismatch"],
      verifiedBinding,
    );
  }

  const finalization = finalizationReasons(
    resolution.source_decision,
    request,
  );
  if (finalization.reasons.length > 0) {
    return rejectionSnapshot(
      request,
      "not_point_in_time_safe",
      finalization.reasons,
      verifiedBinding,
    );
  }

  const v1InputMaterial = {
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
    decision_identity: request.decision_identity,
    decision_unix_ns: request.decision_unix_ns,
    decision_source: request.decision_source,
    normalized_dataset: request.normalized_dataset,
    replay: request.replay,
    calendar: request.calendar,
    policy_bundle: request.policy_bundle,
    source_decision_sha256: request.source_decision_sha256,
    source_decision: resolution.source_decision,
  };
  const v1Input: MarketContextDiagnosticContextSnapshotInputV1 = {
    ...v1InputMaterial,
    external_trust_root_digest:
      deriveMarketContextDiagnosticTrustRootV1(v1InputMaterial),
  };
  const predecessor = createMarketContextDiagnosticContextSnapshotV1(v1Input);
  const reasons = [...predecessor.reason_codes];
  const pointInTime = {
    ...predecessor.point_in_time,
    latest_finalized_bucket_unix_ns:
      finalization.latestFinalizedBucketNs?.toString() ?? null,
    finalization_policy_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2,
    candle_bucket_end_after_finalized_boundary_count: 0,
    finalization_timestamp_after_decision_count: 0,
    pending_buckets_counted_as_missing: false as const,
  };
  const material = {
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
    result_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_RESULT_V2,
    envelope_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V2,
    taxonomy: predecessor.taxonomy,
    decision_identity: predecessor.decision_identity,
    decision_unix_ns: predecessor.decision_unix_ns,
    decision_source: predecessor.decision_source,
    point_in_time: pointInTime,
    context: predecessor.context,
    identities: {
      trusted_source_registry: verifiedBinding,
      normalized_dataset: structuredClone(request.normalized_dataset),
      replay: structuredClone(request.replay),
      source_decision_sha256: request.source_decision_sha256,
      calendar: structuredClone(request.calendar),
      policy_bundle: structuredClone(request.policy_bundle),
    },
    reason_codes: reasons,
    boundary: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
    compatibility: {
      predecessor_contract:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
      predecessor_snapshots_implicitly_remediated: false as const,
    },
  };
  return {
    ...material,
    feature_snapshot_digest:
      marketContextDiagnosticContextSha256V1(material),
  };
}

export function createMarketContextDiagnosticContextSnapshotBatchV2(
  requests: unknown[],
  dependencies: MarketContextDiagnosticContextSnapshotDependenciesV2,
) {
  const seen = new Map<string, string>();
  return requests
    .map((request) => {
      const candidate = record(request);
      const identity = record(candidate?.decision_identity);
      const id =
        typeof identity?.external_decision_id === "string"
          ? identity.external_decision_id
          : "invalid";
      const digest = marketContextDiagnosticContextSha256V1(request);
      if (seen.has(id)) {
        return rejectionSnapshot(
          request,
          "conflicting",
          [
            seen.get(id) === digest
              ? "duplicate_decision_identity"
              : "decision_identity_collision",
          ],
          registryBinding(
            dependencies.authority?.expected_registry_anchor ?? null,
            "invalid",
          ),
        );
      }
      seen.set(id, digest);
      return createMarketContextDiagnosticContextSnapshotV2(
        request,
        dependencies,
      );
    })
    .sort((left, right) =>
      left.decision_identity.external_decision_id.localeCompare(
        right.decision_identity.external_decision_id,
      ),
    );
}

export function verifyMarketContextDiagnosticContextSnapshotV2(
  snapshot: MarketContextDiagnosticContextSnapshotV2,
  request: unknown,
  dependencies: MarketContextDiagnosticContextSnapshotDependenciesV2,
) {
  return (
    stableMarketContextDiagnosticContextJsonV1(snapshot) ===
    stableMarketContextDiagnosticContextJsonV1(
      createMarketContextDiagnosticContextSnapshotV2(request, dependencies),
    )
  );
}
