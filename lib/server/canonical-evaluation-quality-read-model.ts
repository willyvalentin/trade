import "server-only";

import {
  buildCanonicalEvaluationStoragePayload,
  type CanonicalEvaluationPersistenceEnvelope,
} from "@/lib/canonical-evaluation-persistence-contract";
import {
  selectCanonicalPrimaryOutcome,
  type CanonicalPrimaryHorizon,
  type CanonicalSampleType,
} from "@/lib/canonical-recommendation-evaluation";
import {
  CANONICAL_EVALUATION_STORAGE_RELATION,
  digestCanonicalEvaluationSemanticPayload,
  validateCanonicalEvaluationStorageWritePayload,
  type CanonicalEvaluationStorageInsert,
} from "@/lib/server/canonical-evaluation-storage-writer";

export const CANONICAL_EVALUATION_QUALITY_READ_MODEL_VERSION =
  "canonical_evaluation_quality_read_model_v1" as const;

export const CANONICAL_EVALUATION_READ_COLUMNS = [
  "storage_contract_version",
  "envelope_contract_version",
  "lineage_contract_version",
  "canonical_identity",
  "semantic_payload_sha256",
  "idempotency_key",
  "producer_decision_id",
  "source_namespace",
  "decision_timestamp",
  "decision_kind",
  "sample_type",
  "candidate_id",
  "scan_run_id",
  "scan_run_fingerprint",
  "batch_id",
  "batch_fingerprint",
  "snapshot_id",
  "snapshot_fingerprint",
  "recommendation_id",
  "numeric_confidence",
  "confidence_label",
  "engine_version",
  "scoring_version",
  "ranking_version",
  "setup_taxonomy_version",
  "confidence_contract_version",
  "evaluator_version",
  "provider_contract_version",
  "git_commit",
  "build_identity",
  "regime_at_decision",
  "sector_at_decision",
  "provider",
  "provider_source_timestamp",
  "freshness",
  "candle_interval",
  "expected_candle_count",
  "observed_candle_count",
  "coverage_reason_codes",
  "evaluator_input_identity",
  "primary_horizon",
  "primary_outcome_id",
  "diagnostic_outcome_ids",
  "reproducible",
  "quality_metrics_eligible",
  "lineage_json",
  "versions_json",
  "decision_context_json",
  "provider_context_json",
  "evaluation_json",
  "replay_metadata_json",
  "diagnostic_horizons_json",
  "persistence_envelope",
] as const satisfies readonly (keyof CanonicalEvaluationStorageInsert)[];

export const CANONICAL_EVALUATION_READ_COLUMN_LIST =
  CANONICAL_EVALUATION_READ_COLUMNS.join(",");

export type CanonicalEvaluationEligibilityStatus =
  | "eligible"
  | "incomplete"
  | "ambiguous"
  | "non_reproducible"
  | "parity_mismatch"
  | "sample_type_excluded"
  | "counterfactual_not_evaluable"
  | "conflicting";

export type CanonicalEvaluationCohort =
  | "visible_recommendation_quality"
  | "research_only_recommendation_quality"
  | "shadow_recommendation_quality"
  | "historical_synthetic_recommendation_quality"
  | "rejected_candidate_counterfactual"
  | "no_trade_counterfactual";

export type CanonicalTerminalOutcome =
  | "target_before_stop"
  | "stop_before_target"
  | "no_entry"
  | "neither"
  | "ambiguous_same_candle"
  | "incomplete";

export type CanonicalTargetBeforeStopStatus =
  | "yes"
  | "no"
  | "ambiguous"
  | "not_applicable";

export type CanonicalEvaluationMetricsCandidate = {
  read_model_version: typeof CANONICAL_EVALUATION_QUALITY_READ_MODEL_VERSION;
  canonical_identity: string;
  sample_type: CanonicalSampleType;
  cohort: CanonicalEvaluationCohort;
  primary_horizon: CanonicalPrimaryHorizon | null;
  terminal_outcome: CanonicalTerminalOutcome;
  r_result: number | null;
  mfe_r: number | null;
  mae_r: number | null;
  max_favorable_excursion: number | null;
  max_adverse_excursion: number | null;
  target_before_stop: CanonicalTargetBeforeStopStatus;
  numeric_confidence: number | null;
  confidence_probability_semantics: "probability_0_1" | null;
  setup: string | null;
  window: string | null;
  regime: string | null;
  sector: string | null;
  ticker: string | null;
  decision_timestamp: string;
  decision_day: string;
  versions: {
    engine: string;
    scoring: string;
    ranking: string;
    evaluator: string;
    provider: string;
  };
  coverage: {
    status: string | null;
    expected_candle_count: number | null;
    observed_candle_count: number | null;
    freshness: string | null;
  };
  parity_verified: boolean;
  reproducible: boolean;
  standard_visible_quality_eligible: boolean;
  cohort_quality_eligible: boolean;
  eligibility_status: CanonicalEvaluationEligibilityStatus;
  reason_codes: string[];
  diagnostic_horizons: CanonicalEvaluationPersistenceEnvelope["evaluation"]["horizons"];
};

export type CanonicalEvaluationReadQuery = {
  decided_at_or_after: string;
  decided_before: string;
  sample_types?: CanonicalSampleType[];
  limit: number;
};

export type CanonicalEvaluationReadResult =
  | {
      status: "ok";
      rows: CanonicalEvaluationStorageInsert[];
      reason_codes: [];
    }
  | {
      status: "error";
      rows: [];
      reason_codes: string[];
    };

export type CanonicalEvaluationReadOnlyRepository = {
  readonly relation: typeof CANONICAL_EVALUATION_STORAGE_RELATION;
  readonly access: "select_only";
  selectCanonicalEvaluations(
    query: CanonicalEvaluationReadQuery,
  ): Promise<CanonicalEvaluationReadResult>;
};

type CanonicalEvaluationSelectResponse = {
  data: CanonicalEvaluationStorageInsert[] | null;
  error: { code?: string | null } | null;
};

type CanonicalEvaluationSelectBuilder = {
  gte(column: "decision_timestamp", value: string): CanonicalEvaluationSelectBuilder;
  lt(column: "decision_timestamp", value: string): CanonicalEvaluationSelectBuilder;
  in(
    column: "sample_type",
    values: CanonicalSampleType[],
  ): CanonicalEvaluationSelectBuilder;
  order(
    column: "decision_timestamp",
    options: { ascending: boolean },
  ): CanonicalEvaluationSelectBuilder;
  limit(value: number): PromiseLike<CanonicalEvaluationSelectResponse>;
};

type CanonicalEvaluationReadOnlyClient = {
  from(table: typeof CANONICAL_EVALUATION_STORAGE_RELATION): {
    select(
      columns: typeof CANONICAL_EVALUATION_READ_COLUMN_LIST,
    ): CanonicalEvaluationSelectBuilder;
  };
};

function safeReasonCode(value: unknown) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(value)
    ? value
    : "read_repository_error";
}

export function createCanonicalEvaluationReadOnlyRepository(
  client: CanonicalEvaluationReadOnlyClient,
): CanonicalEvaluationReadOnlyRepository {
  return {
    relation: CANONICAL_EVALUATION_STORAGE_RELATION,
    access: "select_only",
    async selectCanonicalEvaluations(query) {
      if (
        !Number.isInteger(query.limit) ||
        query.limit < 1 ||
        query.limit > 10_000
      ) {
        return {
          status: "error",
          rows: [],
          reason_codes: ["invalid_read_limit"],
        };
      }

      let request = client
        .from(CANONICAL_EVALUATION_STORAGE_RELATION)
        .select(CANONICAL_EVALUATION_READ_COLUMN_LIST)
        .gte("decision_timestamp", query.decided_at_or_after)
        .lt("decision_timestamp", query.decided_before);

      if (query.sample_types && query.sample_types.length > 0) {
        request = request.in("sample_type", [...query.sample_types]);
      }

      const { data, error } = await request
        .order("decision_timestamp", { ascending: true })
        .limit(query.limit);

      if (error || !data) {
        return {
          status: "error",
          rows: [],
          reason_codes: [safeReasonCode(error?.code)],
        };
      }

      return {
        status: "ok",
        rows: structuredClone(data),
        reason_codes: [],
      };
    },
  };
}

type StatusCounts = Record<CanonicalEvaluationEligibilityStatus, number>;

export type CanonicalEvaluationCoverageBucket = StatusCounts & {
  expected: number;
  excluded: number;
};

export type CanonicalEvaluationCoverageDiagnostics = {
  total_input_rows: number;
  unique_canonical_identities: number;
  unique_days: number;
  unique_tickers: number;
  duplicate_identity_count: number;
  horizon_inflation_count: number;
  parity_verified: number;
  reproducible: number;
  by_cohort: Record<string, CanonicalEvaluationCoverageBucket>;
  by_sample_type: Record<string, CanonicalEvaluationCoverageBucket>;
  by_window: Record<string, CanonicalEvaluationCoverageBucket>;
  by_day: Record<string, CanonicalEvaluationCoverageBucket>;
  warning_codes: string[];
  aggregate_publication: {
    cohort: null;
    denominator: null;
    publishable: false;
    reason_codes: ["aggregate_cohort_undefined", "aggregate_denominator_undefined"];
  };
};

export type CanonicalEvaluationQualityReadModel = {
  read_model_version: typeof CANONICAL_EVALUATION_QUALITY_READ_MODEL_VERSION;
  candidates: CanonicalEvaluationMetricsCandidate[];
  diagnostics: CanonicalEvaluationCoverageDiagnostics;
  standard_visible_quality_identity_count: number;
  standard_visible_quality_identities: string[];
};

const counterfactualSamples = new Set<CanonicalSampleType>([
  "rejected_candidate",
  "no_trade",
]);

function cohortFor(sampleType: CanonicalSampleType): CanonicalEvaluationCohort {
  switch (sampleType) {
    case "visible":
      return "visible_recommendation_quality";
    case "research_only":
      return "research_only_recommendation_quality";
    case "shadow":
      return "shadow_recommendation_quality";
    case "historical_synthetic":
      return "historical_synthetic_recommendation_quality";
    case "rejected_candidate":
      return "rejected_candidate_counterfactual";
    case "no_trade":
      return "no_trade_counterfactual";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function canonicalJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalJson(value[key])]),
    );
  }
  return value;
}

function equalJson(first: unknown, second: unknown) {
  return JSON.stringify(canonicalJson(first)) === JSON.stringify(canonicalJson(second));
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function finiteOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function targetR(envelope: CanonicalEvaluationPersistenceEnvelope) {
  const plan = envelope.evaluation.trade_plan;
  if (!plan) return null;
  const risk = Math.abs(plan.entry - plan.stop);
  const reward = Math.abs(plan.target - plan.entry);
  return risk > 0 ? reward / risk : null;
}

function terminalMetrics(
  status: string,
  envelope: CanonicalEvaluationPersistenceEnvelope,
  row: CanonicalEvaluationPersistenceEnvelope["evaluation"]["horizons"][number],
) {
  const sameCandleAmbiguous =
    status === "ambiguous_same_candle" ||
    (row.target_hit === true &&
      row.stop_hit === true &&
      row.first_terminal_event !== "target_hit" &&
      row.first_terminal_event !== "stop_hit");

  if (sameCandleAmbiguous) {
    return {
      terminal_outcome: "ambiguous_same_candle" as const,
      r_result: null,
      target_before_stop: "ambiguous" as const,
    };
  }
  if (status === "target_before_stop" || status === "target_hit") {
    return {
      terminal_outcome: "target_before_stop" as const,
      r_result: targetR(envelope),
      target_before_stop: "yes" as const,
    };
  }
  if (status === "stop_before_target" || status === "stop_hit") {
    return {
      terminal_outcome: "stop_before_target" as const,
      r_result: -1,
      target_before_stop: "no" as const,
    };
  }
  if (status === "entry_not_triggered" || status === "no_entry") {
    return {
      terminal_outcome: "no_entry" as const,
      r_result: 0,
      target_before_stop: "not_applicable" as const,
    };
  }
  if (
    status === "neither_hit" ||
    status === "neither" ||
    status === "expired" ||
    status === "entry_triggered"
  ) {
    return {
      terminal_outcome: "neither" as const,
      r_result: finiteOrNull(row.current_r),
      target_before_stop: "not_applicable" as const,
    };
  }
  return {
    terminal_outcome: "incomplete" as const,
    r_result: null,
    target_before_stop: "not_applicable" as const,
  };
}

function normalizedParityReasonCodes(
  row: CanonicalEvaluationStorageInsert,
  expected: CanonicalEvaluationStorageInsert,
) {
  return CANONICAL_EVALUATION_READ_COLUMNS.filter(
    (field) =>
      field !== "semantic_payload_sha256" &&
      !equalJson(row[field], expected[field]),
  ).map((field) => `normalized_${field}_mismatch`);
}

function failedCandidate(
  row: CanonicalEvaluationStorageInsert,
  status: CanonicalEvaluationEligibilityStatus,
  reasonCodes: string[],
  options: {
    parity_verified?: boolean;
    reproducible?: boolean;
  } = {},
): CanonicalEvaluationMetricsCandidate {
  const envelope = row.persistence_envelope;
  return {
    read_model_version: CANONICAL_EVALUATION_QUALITY_READ_MODEL_VERSION,
    canonical_identity: row.canonical_identity,
    sample_type: row.sample_type,
    cohort: cohortFor(row.sample_type),
    primary_horizon: null,
    terminal_outcome: "incomplete",
    r_result: null,
    mfe_r: null,
    mae_r: null,
    max_favorable_excursion: null,
    max_adverse_excursion: null,
    target_before_stop: "not_applicable",
    numeric_confidence: row.numeric_confidence,
    confidence_probability_semantics: null,
    setup: envelope?.decision_context?.setup ?? null,
    window: envelope?.decision_context?.window ?? null,
    regime: row.regime_at_decision,
    sector: row.sector_at_decision,
    ticker: envelope?.decision_context?.ticker ?? null,
    decision_timestamp: row.decision_timestamp,
    decision_day: row.decision_timestamp.slice(0, 10),
    versions: {
      engine: row.engine_version,
      scoring: row.scoring_version,
      ranking: row.ranking_version,
      evaluator: row.evaluator_version,
      provider: row.provider_contract_version,
    },
    coverage: {
      status: envelope?.provider_context?.primary_coverage?.status ?? null,
      expected_candle_count: row.expected_candle_count,
      observed_candle_count: row.observed_candle_count,
      freshness: row.freshness,
    },
    parity_verified: options.parity_verified ?? false,
    reproducible: options.reproducible ?? false,
    standard_visible_quality_eligible: false,
    cohort_quality_eligible: false,
    eligibility_status: status,
    reason_codes: uniqueSorted(reasonCodes),
    diagnostic_horizons: Array.isArray(envelope?.evaluation?.horizons)
      ? structuredClone(envelope.evaluation.horizons)
      : [],
  };
}

function projectOne(
  row: CanonicalEvaluationStorageInsert,
  duplicateCount: number,
): CanonicalEvaluationMetricsCandidate {
  if (duplicateCount > 1) {
    return failedCandidate(row, "conflicting", [
      "duplicated_canonical_identity",
    ]);
  }

  let envelope: CanonicalEvaluationPersistenceEnvelope;
  try {
    envelope = structuredClone(row.persistence_envelope);
  } catch {
    return failedCandidate(row, "conflicting", [
      "persistence_envelope_not_cloneable",
    ]);
  }

  const horizonCounts = new Map<string, number>();
  for (const horizon of envelope.evaluation.horizons) {
    horizonCounts.set(
      horizon.horizon,
      (horizonCounts.get(horizon.horizon) ?? 0) + 1,
    );
  }
  const duplicatedHorizons = [...horizonCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([horizon]) => horizon)
    .sort();
  if (duplicatedHorizons.length > 0) {
    return failedCandidate(row, "conflicting", [
      "horizon_inflation_detected",
      ...duplicatedHorizons.map((horizon) => `duplicate_${horizon}_horizon`),
    ]);
  }

  const storage = buildCanonicalEvaluationStoragePayload(envelope);
  if (storage.status !== "ready" || !storage.value) {
    const storageReasonCodes = storage.diagnostics.map((item) => item.code);
    return failedCandidate(row, "conflicting", [
      "persistence_envelope_not_canonical",
      ...(storageReasonCodes.some((code) => code.startsWith("duplicate_"))
        ? ["horizon_inflation_detected"]
        : []),
      ...storageReasonCodes,
    ]);
  }
  const validation = validateCanonicalEvaluationStorageWritePayload(storage.value);
  if (!validation.ok) {
    return failedCandidate(row, "conflicting", [
      "persistence_envelope_not_writer_ready",
      ...validation.reason_codes,
    ]);
  }

  const digest = digestCanonicalEvaluationSemanticPayload(envelope);
  if (digest !== row.semantic_payload_sha256) {
    return failedCandidate(row, "parity_mismatch", [
      "semantic_payload_digest_mismatch",
    ]);
  }
  const parityReasons = normalizedParityReasonCodes(row, validation.insert);
  if (parityReasons.length > 0) {
    return failedCandidate(row, "parity_mismatch", parityReasons);
  }

  const selection = selectCanonicalPrimaryOutcome(
    envelope.evaluation.horizons.map((horizon) => ({
      horizon: horizon.horizon,
      coverage: horizon.coverage,
      outcome: horizon,
    })),
  );
  const duplicateReasons = selection.reason_codes.filter((code) =>
    code.startsWith("duplicate_"),
  );
  if (duplicateReasons.length > 0) {
    return failedCandidate(row, "conflicting", [
      "horizon_inflation_detected",
      ...duplicateReasons,
    ]);
  }

  if (selection.status !== "selected" || !selection.primary_outcome) {
    const counterfactual = counterfactualSamples.has(row.sample_type);
    return failedCandidate(
      row,
      counterfactual ? "counterfactual_not_evaluable" : "incomplete",
      [
        ...(counterfactual
          ? ["counterfactual_opportunity_set_not_evaluable"]
          : ["no_complete_primary_horizon"]),
        ...selection.reason_codes,
      ],
      { parity_verified: true },
    );
  }

  const primary = selection.primary_outcome.outcome;
  const terminal = terminalMetrics(primary.status, envelope, primary);
  const coverage = primary.coverage;
  const ambiguous = terminal.terminal_outcome === "ambiguous_same_candle";
  const reproducibilityReasons = [
    ...(!envelope.evaluation.reproducible
      ? ["stored_outcome_not_reproducible"]
      : []),
    ...(!envelope.evaluation.evaluator_input_identity
      ? ["missing_evaluator_input_identity"]
      : []),
    ...(!envelope.provider_context.source_timestamp
      ? ["missing_provider_source_timestamp"]
      : []),
    ...(!envelope.provider_context.candle_interval
      ? ["missing_candle_interval"]
      : []),
    ...(finiteOrNull(primary.best_r) === null ? ["missing_mfe_r"] : []),
    ...(finiteOrNull(primary.worst_r) === null ? ["missing_mae_r"] : []),
    ...(primary.entry_triggered === null ? ["missing_entry_trigger_state"] : []),
  ];

  let eligibilityStatus: CanonicalEvaluationEligibilityStatus = "eligible";
  const reasons: string[] = [];
  if (coverage.status !== "complete") {
    eligibilityStatus = "incomplete";
    reasons.push("primary_coverage_not_complete", ...coverage.reason_codes);
  } else if (ambiguous) {
    eligibilityStatus = "ambiguous";
    reasons.push("target_and_stop_same_candle_ambiguous");
  } else if (reproducibilityReasons.length > 0) {
    eligibilityStatus = "non_reproducible";
    reasons.push(...reproducibilityReasons);
  } else if (
    !counterfactualSamples.has(row.sample_type) &&
    !row.quality_metrics_eligible
  ) {
    eligibilityStatus = "sample_type_excluded";
    reasons.push("stored_quality_metrics_eligibility_false");
  }

  const cohortEligible = eligibilityStatus === "eligible";
  return {
    read_model_version: CANONICAL_EVALUATION_QUALITY_READ_MODEL_VERSION,
    canonical_identity: row.canonical_identity,
    sample_type: row.sample_type,
    cohort: cohortFor(row.sample_type),
    primary_horizon: selection.primary_horizon,
    terminal_outcome: terminal.terminal_outcome,
    r_result: terminal.r_result,
    mfe_r: finiteOrNull(primary.best_r),
    mae_r: finiteOrNull(primary.worst_r),
    max_favorable_excursion: finiteOrNull(primary.max_favorable_excursion),
    max_adverse_excursion: finiteOrNull(primary.max_adverse_excursion),
    target_before_stop: terminal.target_before_stop,
    numeric_confidence: row.numeric_confidence,
    confidence_probability_semantics:
      envelope.confidence.numeric_confidence_scale,
    setup: envelope.decision_context.setup,
    window: envelope.decision_context.window,
    regime: envelope.decision_context.regime,
    sector: envelope.decision_context.sector,
    ticker: envelope.decision_context.ticker,
    decision_timestamp: row.decision_timestamp,
    decision_day: row.decision_timestamp.slice(0, 10),
    versions: {
      engine: row.engine_version,
      scoring: row.scoring_version,
      ranking: row.ranking_version,
      evaluator: row.evaluator_version,
      provider: row.provider_contract_version,
    },
    coverage: {
      status: coverage.status,
      expected_candle_count: coverage.expected_candle_count,
      observed_candle_count: coverage.observed_candle_count,
      freshness: row.freshness,
    },
    parity_verified: true,
    reproducible: reproducibilityReasons.length === 0,
    standard_visible_quality_eligible:
      cohortEligible && row.sample_type === "visible",
    cohort_quality_eligible: cohortEligible,
    eligibility_status: eligibilityStatus,
    reason_codes: uniqueSorted(reasons),
    diagnostic_horizons: selection.diagnostic_outcomes.map((item) =>
      structuredClone(item.outcome),
    ),
  };
}

function emptyStatusCounts(): StatusCounts {
  return {
    eligible: 0,
    incomplete: 0,
    ambiguous: 0,
    non_reproducible: 0,
    parity_mismatch: 0,
    sample_type_excluded: 0,
    counterfactual_not_evaluable: 0,
    conflicting: 0,
  };
}

function addBucket(
  target: Record<string, CanonicalEvaluationCoverageBucket>,
  key: string | null,
  candidate: CanonicalEvaluationMetricsCandidate,
) {
  const normalizedKey = key ?? "unknown";
  target[normalizedKey] ??= {
    expected: 0,
    excluded: 0,
    ...emptyStatusCounts(),
  };
  const bucket = target[normalizedKey];
  bucket.expected += 1;
  bucket[candidate.eligibility_status] += 1;
  if (candidate.eligibility_status !== "eligible") bucket.excluded += 1;
}

export function buildCanonicalEvaluationQualityReadModel(
  inputRows: CanonicalEvaluationStorageInsert[],
): CanonicalEvaluationQualityReadModel {
  const rows = structuredClone(inputRows);
  const grouped = new Map<string, CanonicalEvaluationStorageInsert[]>();
  for (const row of rows) {
    const values = grouped.get(row.canonical_identity) ?? [];
    values.push(row);
    grouped.set(row.canonical_identity, values);
  }

  const candidates = [...grouped.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([, values]) => projectOne(values[0], values.length));

  const byCohort: Record<string, CanonicalEvaluationCoverageBucket> = {};
  const bySampleType: Record<string, CanonicalEvaluationCoverageBucket> = {};
  const byWindow: Record<string, CanonicalEvaluationCoverageBucket> = {};
  const byDay: Record<string, CanonicalEvaluationCoverageBucket> = {};
  for (const candidate of candidates) {
    addBucket(byCohort, candidate.cohort, candidate);
    addBucket(bySampleType, candidate.sample_type, candidate);
    addBucket(byWindow, candidate.window, candidate);
    addBucket(byDay, candidate.decision_day, candidate);
  }

  const duplicateIdentityCount = [...grouped.values()].filter(
    (values) => values.length > 1,
  ).length;
  const horizonInflationCount = candidates.filter((candidate) =>
    candidate.reason_codes.includes("horizon_inflation_detected"),
  ).length;
  const visible = candidates.filter(
    (candidate) => candidate.standard_visible_quality_eligible,
  );

  return {
    read_model_version: CANONICAL_EVALUATION_QUALITY_READ_MODEL_VERSION,
    candidates,
    diagnostics: {
      total_input_rows: rows.length,
      unique_canonical_identities: grouped.size,
      unique_days: new Set(candidates.map((candidate) => candidate.decision_day))
        .size,
      unique_tickers: new Set(
        candidates
          .map((candidate) => candidate.ticker)
          .filter((ticker): ticker is string => Boolean(ticker)),
      ).size,
      duplicate_identity_count: duplicateIdentityCount,
      horizon_inflation_count: horizonInflationCount,
      parity_verified: candidates.filter((candidate) => candidate.parity_verified)
        .length,
      reproducible: candidates.filter((candidate) => candidate.reproducible)
        .length,
      by_cohort: byCohort,
      by_sample_type: bySampleType,
      by_window: byWindow,
      by_day: byDay,
      warning_codes: uniqueSorted([
        ...(duplicateIdentityCount > 0
          ? ["duplicated_canonical_identity"]
          : []),
        ...(horizonInflationCount > 0 ? ["horizon_inflation_detected"] : []),
      ]),
      aggregate_publication: {
        cohort: null,
        denominator: null,
        publishable: false,
        reason_codes: [
          "aggregate_cohort_undefined",
          "aggregate_denominator_undefined",
        ],
      },
    },
    standard_visible_quality_identity_count: visible.length,
    standard_visible_quality_identities: visible.map(
      (candidate) => candidate.canonical_identity,
    ),
  };
}
