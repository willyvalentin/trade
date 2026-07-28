import { createHash } from "node:crypto";

import {
  DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
  parseDatabentoExplicitNanosecondInstantV1,
} from "./databento-explicit-nanosecond-instant-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1 =
  "market_context_diagnostic_decision_time_context_feature_snapshot_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V1 =
  "market_context_diagnostic_context_feature_envelope_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_POINT_IN_TIME_POLICY_V1 =
  "market_context_diagnostic_context_point_in_time_policy_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_TRUST_ROOT_V1 =
  "market_context_diagnostic_context_trust_root_v1" as const;

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1 = {
  diagnostic_only: true,
  official_ohlcv: false,
  canonical_performance_eligible: false,
  causal_claimed: false,
  outcome_explanation_claimed: false,
  live_ranking_effect: false,
  automatic_model_input_allowed: false,
} as const;

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_TAXONOMY_V1 = [
  "mapped",
  "insufficient_data",
  "conflicting",
  "not_point_in_time_safe",
] as const;

export type MarketContextDiagnosticContextTaxonomyV1 =
  (typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_TAXONOMY_V1)[number];

export type MarketContextDiagnosticContextSnapshotInputV1 = {
  contract_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1;
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
  external_trust_root_digest: string;
  normalized_dataset: {
    identity: string;
    dataset_digest: string;
    output_tree_digest: string;
    lineage_digest: string;
    manifest_digest: string;
  };
  replay: {
    identity: string;
    dataset_digest: string;
    output_tree_digest: string;
    manifest_digest: string;
    core_evidence_digest: string;
  };
  calendar: {
    identity: string;
    digest: string;
  };
  policy_bundle: {
    diagnostic_candle_policy: string;
    replay_contract: string;
    replay_schedule: string;
    market_context_contract: string;
    market_context_thresholds: string;
    watermark_policy: string;
    watermark_status: "empirically_unvalidated";
    instant_parser: typeof DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1;
  };
  source_decision_sha256: string;
  source_decision: unknown;
};

type JsonRecord = Record<string, unknown>;

export type MarketContextDiagnosticContextSnapshotV1 = {
  contract_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1;
  envelope_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V1;
  taxonomy: MarketContextDiagnosticContextTaxonomyV1;
  decision_identity: MarketContextDiagnosticContextSnapshotInputV1["decision_identity"];
  decision_unix_ns: string;
  decision_source: MarketContextDiagnosticContextSnapshotInputV1["decision_source"];
  point_in_time: {
    policy_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_POINT_IN_TIME_POLICY_V1;
    latest_finalized_bucket_unix_ns: string | null;
    provider_timestamp_after_decision_count: number;
    future_input_points_passed_to_core: number;
    record_finalization_violation_count: number;
    current_full_day_aggregation_used: boolean;
    excluded_future_candle_count: number;
    excluded_future_gap_count: number;
    excluded_later_session_row_count: number;
  };
  context: null | {
    regime_classification: string;
    evidence_strength: string;
    calibrated_probability: false;
    regime_components: JsonRecord;
    sector_contexts: unknown[];
    sector_rankability: {
      rankable_count: number;
      not_rankable_count: number;
    };
    breadth: {
      state: unknown;
      not_full_market_breadth: true;
      declared_sector_etf_count: 11;
    };
    volatility_and_context: {
      volatility_state: unknown;
      intraday_context: unknown;
      multi_day_context: unknown;
      spy_qqq_agreement: unknown;
    };
    available_candle_window: {
      session_id: string;
      finalized_minute_count: number;
      observed_candle_count: number;
      prior_session_count: number;
      current_full_day_aggregation_used: false;
    };
    gaps_and_coverage: {
      explicit_gap_count: number;
      benchmark_gap_count: number;
      sector_gap_count: number;
      coverage: unknown;
      freshness: unknown;
      forward_fill_used: false;
      pending_buckets_counted_as_missing: false;
    };
    provider_context_timestamps: unknown[];
    reason_codes: string[];
    quality_flags: string[];
  };
  identities: {
    external_trust_root_digest: string;
    normalized_dataset: MarketContextDiagnosticContextSnapshotInputV1["normalized_dataset"];
    replay: MarketContextDiagnosticContextSnapshotInputV1["replay"];
    source_decision_sha256: string;
    calendar: MarketContextDiagnosticContextSnapshotInputV1["calendar"];
    policy_bundle: MarketContextDiagnosticContextSnapshotInputV1["policy_bundle"];
  };
  reason_codes: string[];
  boundary: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1;
  feature_snapshot_digest: string;
};

const allowedInputKeys = new Set([
  "contract_version",
  "decision_identity",
  "decision_unix_ns",
  "decision_source",
  "external_trust_root_digest",
  "normalized_dataset",
  "replay",
  "calendar",
  "policy_bundle",
  "source_decision_sha256",
  "source_decision",
]);

const forbiddenCallerKeys = new Set([
  "point_in_time_safe",
  "complete",
  "sufficient",
  "canonical",
  "performance_eligible",
  "official_ohlcv",
  "outcome_explanatory",
]);

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  const candidate = record(value);
  if (candidate) {
    return Object.fromEntries(
      Object.entries(candidate)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)]),
    );
  }
  return value;
}

export function stableMarketContextDiagnosticContextJsonV1(value: unknown) {
  return JSON.stringify(stableValue(value));
}

export function marketContextDiagnosticContextSha256V1(value: unknown) {
  return createHash("sha256")
    .update(stableMarketContextDiagnosticContextJsonV1(value))
    .digest("hex");
}

function sha256String(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isUnixNs(value: unknown): value is string {
  return typeof value === "string" && /^(0|[1-9]\d*)$/.test(value);
}

function finiteNonnegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? [...value]
    : [];
}

function sortedUnique(values: string[]) {
  return [...new Set(values)].sort();
}

function sortedObjects(values: unknown[], key: string) {
  return [...values].sort((left, right) =>
    String(record(left)?.[key] ?? "").localeCompare(
      String(record(right)?.[key] ?? ""),
    ),
  );
}

export function deriveMarketContextDiagnosticTrustRootV1(
  input: Pick<
    MarketContextDiagnosticContextSnapshotInputV1,
    | "normalized_dataset"
    | "replay"
    | "calendar"
    | "decision_source"
    | "source_decision_sha256"
  >,
) {
  return marketContextDiagnosticContextSha256V1({
    trust_root_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_TRUST_ROOT_V1,
    normalized_dataset: input.normalized_dataset,
    replay: input.replay,
    calendar: input.calendar,
    decision_source: input.decision_source,
    source_decision_sha256: input.source_decision_sha256,
  });
}

function validationReasonCodes(value: unknown): string[] {
  const input = record(value);
  if (!input) return ["snapshot_input_not_object"];
  const reasons: string[] = [];
  for (const key of Object.keys(input)) {
    if (forbiddenCallerKeys.has(key)) {
      reasons.push(`caller_declaration_forbidden:${key}`);
    } else if (!allowedInputKeys.has(key)) {
      reasons.push(`snapshot_input_unknown_field:${key}`);
    }
  }
  if (
    input.contract_version !==
    MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1
  ) {
    reasons.push("snapshot_contract_version_mismatch");
  }
  const identity = record(input.decision_identity);
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
  if (!isUnixNs(input.decision_unix_ns)) {
    reasons.push("decision_unix_ns_malformed");
  }
  const source = record(input.decision_source);
  if (
    !source ||
    typeof source.contract !== "string" ||
    source.contract.length === 0 ||
    typeof source.version !== "string" ||
    source.version.length === 0
  ) {
    reasons.push("decision_source_identity_invalid");
  }
  const normalized = record(input.normalized_dataset);
  const replay = record(input.replay);
  const calendar = record(input.calendar);
  const requiredDigests = [
    input.external_trust_root_digest,
    input.source_decision_sha256,
    normalized?.dataset_digest,
    normalized?.output_tree_digest,
    normalized?.lineage_digest,
    normalized?.manifest_digest,
    replay?.dataset_digest,
    replay?.output_tree_digest,
    replay?.manifest_digest,
    replay?.core_evidence_digest,
    calendar?.digest,
  ];
  if (requiredDigests.some((digest) => !isSha256(digest))) {
    reasons.push("required_digest_invalid");
  }
  if (
    !normalized ||
    typeof normalized.identity !== "string" ||
    !replay ||
    typeof replay.identity !== "string" ||
    !calendar ||
    typeof calendar.identity !== "string"
  ) {
    reasons.push("source_identity_invalid");
  }
  const policy = record(input.policy_bundle);
  if (
    !policy ||
    policy.watermark_status !== "empirically_unvalidated" ||
    policy.instant_parser !== DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1
  ) {
    reasons.push("policy_bundle_invalid");
  }
  return sortedUnique(reasons);
}

function rejectionSnapshot(
  input: unknown,
  taxonomy: MarketContextDiagnosticContextTaxonomyV1,
  reasons: string[],
): MarketContextDiagnosticContextSnapshotV1 {
  const candidate = record(input);
  const identity = record(candidate?.decision_identity);
  const safeIdentity = {
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
  const material = {
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
    envelope_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V1,
    taxonomy,
    decision_identity: safeIdentity,
    decision_unix_ns:
      typeof candidate?.decision_unix_ns === "string"
        ? candidate.decision_unix_ns
        : "invalid",
    decision_source: {
      contract: "invalid",
      version: "invalid",
    },
    point_in_time: {
      policy_version:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_POINT_IN_TIME_POLICY_V1,
      latest_finalized_bucket_unix_ns: null,
      provider_timestamp_after_decision_count: 0,
      future_input_points_passed_to_core: 0,
      record_finalization_violation_count: 0,
      current_full_day_aggregation_used: false,
      excluded_future_candle_count: 0,
      excluded_future_gap_count: 0,
      excluded_later_session_row_count: 0,
    },
    context: null,
    identities: {
      external_trust_root_digest: "",
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
        watermark_status: "empirically_unvalidated" as const,
        instant_parser: DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      },
    },
    reason_codes: sortedUnique(reasons),
    boundary: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
  };
  return {
    ...material,
    feature_snapshot_digest: marketContextDiagnosticContextSha256V1(material),
  };
}

function parseProviderTimestamp(
  value: unknown,
  decisionNs: bigint,
  field: string,
  reasons: string[],
) {
  const parsed = parseDatabentoExplicitNanosecondInstantV1(value, field);
  if (!parsed.ok) {
    reasons.push(`provider_timestamp_invalid:${field}`);
    return;
  }
  if (BigInt(parsed.unix_nanoseconds) > decisionNs) {
    reasons.push(`provider_timestamp_after_decision:${field}`);
  }
}

export function createMarketContextDiagnosticContextSnapshotV1(
  value: unknown,
): MarketContextDiagnosticContextSnapshotV1 {
  const validation = validationReasonCodes(value);
  if (validation.length > 0) {
    const taxonomy = validation.some(
      (reason) =>
        reason === "decision_unix_ns_malformed" ||
        reason.startsWith("caller_declaration_forbidden:"),
    )
      ? "not_point_in_time_safe"
      : "conflicting";
    return rejectionSnapshot(value, taxonomy, validation);
  }
  const input = value as MarketContextDiagnosticContextSnapshotInputV1;
  if (
    deriveMarketContextDiagnosticTrustRootV1(input) !==
    input.external_trust_root_digest
  ) {
    return rejectionSnapshot(input, "conflicting", [
      "external_trust_root_digest_mismatch",
    ]);
  }
  if (
    sha256String(stableMarketContextDiagnosticContextJsonV1(input.source_decision)) !==
    input.source_decision_sha256
  ) {
    return rejectionSnapshot(input, "conflicting", [
      "source_decision_digest_mismatch",
    ]);
  }

  const source = record(input.source_decision);
  const schedule = record(source?.schedule);
  const audit = record(source?.adapter_audit);
  const evaluation = record(source?.evaluation);
  const v2 = record(evaluation?.v2_evaluation);
  const markers = record(source?.markers);
  if (!source || !schedule || !audit || !evaluation || !v2 || !markers) {
    return rejectionSnapshot(input, "insufficient_data", [
      "source_decision_structure_incomplete",
    ]);
  }

  const pitReasons: string[] = [];
  if (
    schedule.decision_id !== input.decision_identity.external_decision_id ||
    audit.decision_id !== input.decision_identity.external_decision_id
  ) {
    pitReasons.push("decision_identity_source_mismatch");
  }
  if (
    schedule.session_date !== input.decision_identity.session_id ||
    schedule.decision_unix_ns !== input.decision_unix_ns
  ) {
    pitReasons.push("decision_schedule_source_mismatch");
  }
  const decisionNs = BigInt(input.decision_unix_ns);
  const scheduleTimestamp = parseDatabentoExplicitNanosecondInstantV1(
    schedule.decision_timestamp,
    "schedule.decision_timestamp",
  );
  if (
    !scheduleTimestamp.ok ||
    scheduleTimestamp.unix_nanoseconds !== input.decision_unix_ns
  ) {
    pitReasons.push("decision_timestamp_representation_mismatch");
  }
  const providerTimestamps = Array.isArray(v2.provider_timestamps)
    ? v2.provider_timestamps
    : [];
  providerTimestamps.forEach((item, index) => {
    const provider = record(item);
    parseProviderTimestamp(
      provider?.source_timestamp,
      decisionNs,
      `provider_timestamps.${index}.source_timestamp`,
      pitReasons,
    );
    parseProviderTimestamp(
      provider?.received_timestamp,
      decisionNs,
      `provider_timestamps.${index}.received_timestamp`,
      pitReasons,
    );
  });
  const pointInTimeAudit = record(evaluation.point_in_time_audit);
  const observationTimes = Array.isArray(pointInTimeAudit?.observation_times)
    ? pointInTimeAudit.observation_times
    : [];
  observationTimes.forEach((item, index) =>
    parseProviderTimestamp(
      record(item)?.observation_timestamp,
      decisionNs,
      `point_in_time_audit.observation_times.${index}.observation_timestamp`,
      pitReasons,
    ),
  );
  const auditProviderTimes = Array.isArray(pointInTimeAudit?.provider_times)
    ? pointInTimeAudit.provider_times
    : [];
  auditProviderTimes.forEach((item, index) => {
    parseProviderTimestamp(
      record(item)?.source_timestamp,
      decisionNs,
      `point_in_time_audit.provider_times.${index}.source_timestamp`,
      pitReasons,
    );
    parseProviderTimestamp(
      record(item)?.received_timestamp,
      decisionNs,
      `point_in_time_audit.provider_times.${index}.received_timestamp`,
      pitReasons,
    );
  });
  for (const field of [
    "maximum_provider_received_unix_ns",
    "maximum_provider_source_unix_ns",
  ] as const) {
    if (!isUnixNs(audit[field]) || BigInt(audit[field]) > decisionNs) {
      pitReasons.push(`${field}_after_decision_or_invalid`);
    }
  }
  const zeroCounterFields = [
    "provider_timestamp_after_decision_count",
    "future_input_points_passed_to_core",
    "record_finalization_violation_count",
  ] as const;
  for (const field of zeroCounterFields) {
    if (audit[field] !== 0) pitReasons.push(`${field}_nonzero`);
  }
  if (audit.current_full_day_aggregation_used !== false) {
    pitReasons.push("current_full_day_aggregation_forbidden");
  }
  const watermarkNs = isUnixNs(schedule.provisional_watermark_ns)
    ? BigInt(schedule.provisional_watermark_ns)
    : null;
  const latestFinalizedBucketNs =
    watermarkNs === null ? null : (decisionNs - watermarkNs).toString();
  if (
    watermarkNs === null ||
    watermarkNs <= BigInt(0) ||
    !finiteNonnegativeInteger(audit.current_session_finalized_minute_count) ||
    !finiteNonnegativeInteger(audit.current_session_future_candles_excluded) ||
    !finiteNonnegativeInteger(audit.current_session_future_gaps_excluded) ||
    !finiteNonnegativeInteger(audit.later_session_rows_excluded)
  ) {
    pitReasons.push("point_in_time_counter_or_watermark_invalid");
  }
  if (
    markers.diagnostic_all_reported_trades !== true ||
    markers.official_ohlcv_claimed !== false ||
    markers.canonical_performance_eligible !== false ||
    markers.sale_condition_semantics_available !== false ||
    markers.watermark_status !== "empirically_unvalidated" ||
    markers.live_ranking_effect !== false ||
    markers.shadow_only !== true ||
    markers.calibrated_probability !== false
  ) {
    pitReasons.push("diagnostic_boundary_marker_drift");
  }
  if (pitReasons.length > 0) {
    return rejectionSnapshot(input, "not_point_in_time_safe", pitReasons);
  }

  const classification =
    typeof v2.classification === "string"
      ? v2.classification
      : "insufficient_data";
  const taxonomy: MarketContextDiagnosticContextTaxonomyV1 =
    classification === "insufficient_data"
      ? "insufficient_data"
      : classification === "conflicting_context"
        ? "conflicting"
        : "mapped";
  const dimensions = record(v2.dimensions) ?? {};
  const sectors = Array.isArray(v2.sector_context)
    ? sortedObjects(v2.sector_context, "sector_id")
    : [];
  const rankableCount = sectors.filter(
    (sector) => record(sector)?.rank_status === "ranked",
  ).length;
  const contextReasonCodes = sortedUnique([
    ...stringArray(v2.reason_codes),
    ...stringArray(audit.diagnostic_reason_codes),
  ]);
  const explicitGapCount =
    Number(audit.current_session_gap_count ?? 0);
  const material = {
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
    envelope_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V1,
    taxonomy,
    decision_identity: structuredClone(input.decision_identity),
    decision_unix_ns: input.decision_unix_ns,
    decision_source: structuredClone(input.decision_source),
    point_in_time: {
      policy_version:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_POINT_IN_TIME_POLICY_V1,
      latest_finalized_bucket_unix_ns: latestFinalizedBucketNs,
      provider_timestamp_after_decision_count: 0,
      future_input_points_passed_to_core: 0,
      record_finalization_violation_count: 0,
      current_full_day_aggregation_used: false,
      excluded_future_candle_count:
        audit.current_session_future_candles_excluded as number,
      excluded_future_gap_count:
        audit.current_session_future_gaps_excluded as number,
      excluded_later_session_row_count:
        audit.later_session_rows_excluded as number,
    },
    context: {
      regime_classification: classification,
      evidence_strength:
        typeof v2.evidence_strength === "string"
          ? v2.evidence_strength
          : "insufficient",
      calibrated_probability: false as const,
      regime_components: structuredClone(dimensions),
      sector_contexts: structuredClone(sectors),
      sector_rankability: {
        rankable_count: rankableCount,
        not_rankable_count: sectors.length - rankableCount,
      },
      breadth: {
        state: dimensions.breadth_state ?? "insufficient_data",
        not_full_market_breadth: true as const,
        declared_sector_etf_count: 11 as const,
      },
      volatility_and_context: {
        volatility_state: dimensions.volatility_state ?? "insufficient_data",
        intraday_context: dimensions.intraday_context ?? "insufficient_data",
        multi_day_context: dimensions.multi_day_context ?? "insufficient_data",
        spy_qqq_agreement:
          dimensions.spy_qqq_agreement ?? "insufficient_data",
      },
      available_candle_window: {
        session_id: input.decision_identity.session_id,
        finalized_minute_count:
          audit.current_session_finalized_minute_count as number,
        observed_candle_count:
          audit.current_session_observed_candle_count as number,
        prior_session_count: audit.prior_session_count as number,
        current_full_day_aggregation_used: false as const,
      },
      gaps_and_coverage: {
        explicit_gap_count: explicitGapCount,
        benchmark_gap_count: Number(audit.benchmark_gap_count ?? 0),
        sector_gap_count: Number(audit.sector_gap_count ?? 0),
        coverage: structuredClone(v2.coverage ?? null),
        freshness: structuredClone(v2.freshness ?? null),
        forward_fill_used: false as const,
        pending_buckets_counted_as_missing: false as const,
      },
      provider_context_timestamps: structuredClone(
        sortedObjects(providerTimestamps, "source_id"),
      ),
      reason_codes: contextReasonCodes,
      quality_flags: sortedUnique([
        "diagnostic_all_reported_trades",
        "not_official_ohlcv",
        "not_full_market_breadth",
        "sale_condition_semantics_unavailable",
        "watermark_empirically_unvalidated",
        ...(explicitGapCount > 0 ? ["explicit_gaps_present"] : []),
      ]),
    },
    identities: {
      external_trust_root_digest: input.external_trust_root_digest,
      normalized_dataset: structuredClone(input.normalized_dataset),
      replay: structuredClone(input.replay),
      source_decision_sha256: input.source_decision_sha256,
      calendar: structuredClone(input.calendar),
      policy_bundle: structuredClone(input.policy_bundle),
    },
    reason_codes: contextReasonCodes,
    boundary: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
  };
  return {
    ...material,
    feature_snapshot_digest: marketContextDiagnosticContextSha256V1(material),
  };
}

export function createMarketContextDiagnosticContextSnapshotBatchV1(
  inputs: unknown[],
): MarketContextDiagnosticContextSnapshotV1[] {
  const seen = new Map<string, string>();
  const snapshots = inputs.map((input) => {
    const candidate = record(input);
    const identity = record(candidate?.decision_identity);
    const id =
      typeof identity?.external_decision_id === "string"
        ? identity.external_decision_id
        : "invalid";
    const inputDigest = marketContextDiagnosticContextSha256V1(input);
    if (seen.has(id)) {
      return rejectionSnapshot(input, "conflicting", [
        seen.get(id) === inputDigest
          ? "duplicate_decision_identity"
          : "decision_identity_collision",
      ]);
    }
    seen.set(id, inputDigest);
    return createMarketContextDiagnosticContextSnapshotV1(input);
  });
  return snapshots.sort((left, right) =>
    left.decision_identity.external_decision_id.localeCompare(
      right.decision_identity.external_decision_id,
    ),
  );
}

export function verifyMarketContextDiagnosticContextSnapshotV1(
  snapshot: MarketContextDiagnosticContextSnapshotV1,
  trustedInput: unknown,
) {
  const expected = createMarketContextDiagnosticContextSnapshotV1(trustedInput);
  return (
    stableMarketContextDiagnosticContextJsonV1(snapshot) ===
    stableMarketContextDiagnosticContextJsonV1(expected)
  );
}

export function toMarketContextDiagnosticIntelligenceEnvelopeV1(
  snapshot: MarketContextDiagnosticContextSnapshotV1,
) {
  return {
    envelope_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V1,
    feature_contract_version: snapshot.contract_version,
    taxonomy: snapshot.taxonomy,
    decision_identity: snapshot.decision_identity,
    decision_unix_ns: snapshot.decision_unix_ns,
    feature_snapshot_digest: snapshot.feature_snapshot_digest,
    external_trust_root_digest:
      snapshot.identities.external_trust_root_digest,
    context: snapshot.context,
    point_in_time: snapshot.point_in_time,
    reason_codes: snapshot.reason_codes,
    boundary: snapshot.boundary,
    verification_required_before_consumption: true,
    canonical_binding_ready: false,
  } as const;
}
