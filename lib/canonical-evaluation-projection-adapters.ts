import {
  buildCanonicalRecommendationDecision,
  classifyCanonicalCoverage,
  selectCanonicalPrimaryOutcome,
  validateCanonicalConfidence,
  validateCanonicalEvaluationVersions,
  validateCanonicalSampleType,
  type CanonicalConfidence,
  type CanonicalConfidenceLabel,
  type CanonicalCoverage,
  type CanonicalCoverageInput,
  type CanonicalEvaluationVersions,
  type CanonicalHorizonOutcome,
  type CanonicalPrimaryOutcomeSelection,
  type CanonicalRecommendationDecision,
  type CanonicalSampleType,
} from "@/lib/canonical-recommendation-evaluation";
import type { RecommendationBatch } from "@/lib/recommendation-batch-memory";
import type { SelectedCandidateBuildDiagnostic } from "@/lib/recommendation-build-diagnostics";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type {
  ScannerCandidateRankingResult,
  ScannerCandidateRankingSummary,
} from "@/lib/scanner-candidate-ranking";
import type { ScannerCandidate } from "@/lib/scanner";
import type { ReplayWithSignalPackageResult } from "@/lib/replay-with-signal-package-result-model";

export const CANONICAL_EVALUATION_PROJECTION_CONTRACT_VERSION =
  "canonical_evaluation_projection_v1" as const;

export type CanonicalProjectionStatus =
  | "mapped"
  | "conflicting"
  | "unmappable";

export type CanonicalProjectionSource =
  | "scanner_candidate"
  | "recommendation_batch"
  | "recommendation_scan_run"
  | "recommendation_snapshot"
  | "recommendation_outcome_bundle"
  | "historical_replay";

export type CanonicalProjectionDiagnosticSeverity =
  | "conflict"
  | "missing"
  | "unsupported"
  | "info";

export type CanonicalProjectionDiagnostic = {
  code: string;
  severity: CanonicalProjectionDiagnosticSeverity;
  field: string;
  message: string;
  evidence_sources: string[];
};

export type CanonicalProjectionRelations = {
  candidate_id: string | null;
  batch_id: string | null;
  batch_fingerprint: string | null;
  scan_run_id: string | null;
  scan_run_fingerprint: string | null;
  snapshot_id: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  outcome_ids: string[];
};

export type CanonicalProjectionContext = {
  regime: string | null;
  sector: string | null;
  freshness: string | null;
  provider: string | null;
  provider_coverage: CanonicalCoverage | null;
};

export type CanonicalProjectionMetadata = {
  producer_decision_id?: string | null;
  decision_timestamp?: string | null;
  sample_type?: unknown;
  numeric_confidence?: number | null;
  confidence_label?: CanonicalConfidenceLabel | string | null;
  versions?: CanonicalEvaluationVersions | null;
  candidate_id?: string | null;
  batch_id?: string | null;
  batch_fingerprint?: string | null;
  scan_run_id?: string | null;
  scan_run_fingerprint?: string | null;
  snapshot_id?: string | null;
  snapshot_fingerprint?: string | null;
  recommendation_id?: string | null;
  regime?: string | null;
  sector?: string | null;
  freshness?: string | null;
  provider?: string | null;
  provider_coverage?: CanonicalCoverage | null;
};

export type CanonicalProjectedOutcome = {
  id: string;
  snapshot_id: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  horizon: "15m" | "30m" | "60m";
  status: string;
  coverage: CanonicalCoverage;
  source: string;
  provider: string | null;
  entry_triggered: boolean | null;
  target_hit: boolean | null;
  stop_hit: boolean | null;
  first_terminal_event: string;
  best_r: number | null;
  worst_r: number | null;
  current_r: number | null;
  max_favorable_excursion: number | null;
  max_adverse_excursion: number | null;
};

export type CanonicalProjection = {
  contract_version: typeof CANONICAL_EVALUATION_PROJECTION_CONTRACT_VERSION;
  source: CanonicalProjectionSource;
  source_namespace: string;
  producer_decision_id: string | null;
  decision_timestamp: string | null;
  canonical_identity: string | null;
  sample_type: CanonicalSampleType | null;
  decision: CanonicalRecommendationDecision | null;
  confidence: CanonicalConfidence;
  versions: CanonicalEvaluationVersions | null;
  relations: CanonicalProjectionRelations;
  context: CanonicalProjectionContext;
  outcome_rows: CanonicalProjectedOutcome[];
  primary_outcome: CanonicalPrimaryOutcomeSelection<CanonicalProjectedOutcome> | null;
  evaluation_readiness:
    | "evaluable"
    | "not_evaluable"
    | "incomplete"
    | "not_applicable";
};

export type CanonicalProjectionResult = {
  status: CanonicalProjectionStatus;
  projection: CanonicalProjection;
  diagnostics: CanonicalProjectionDiagnostic[];
};

export type CanonicalProjectionCoverageCount = {
  total: number;
  mapped: number;
  conflicting: number;
  unmappable: number;
};

export type CanonicalProjectionCoverageSummary = {
  contract_version: typeof CANONICAL_EVALUATION_PROJECTION_CONTRACT_VERSION;
  overall: CanonicalProjectionCoverageCount;
  by_source: Record<string, CanonicalProjectionCoverageCount>;
  by_sample_type: Record<string, CanonicalProjectionCoverageCount>;
};

type Evidence<T> = {
  source: string;
  value: T | null | undefined;
};

type FinalizeProjectionInput = {
  source: CanonicalProjectionSource;
  sourceNamespace: string;
  decisionIds: Evidence<string>[];
  decisionTimestamps: Evidence<string>[];
  sampleTypes: Evidence<unknown>[];
  numericConfidences: Evidence<number>[];
  confidenceLabels: Evidence<string>[];
  versions: Evidence<CanonicalEvaluationVersions>[];
  relations: CanonicalProjectionRelations;
  context: CanonicalProjectionContext;
  outcomeRows?: CanonicalProjectedOutcome[];
  primaryOutcome?: CanonicalPrimaryOutcomeSelection<CanonicalProjectedOutcome> | null;
  evaluationReadiness?: CanonicalProjection["evaluation_readiness"];
  diagnostics?: CanonicalProjectionDiagnostic[];
};

const supportedHorizons = ["15m", "30m", "60m"] as const;
const versionFields = [
  "engine_version",
  "scoring_version",
  "ranking_version",
  "setup_taxonomy_version",
  "confidence_contract_version",
  "evaluator_version",
  "provider_contract_version",
  "git_commit",
  "build_identity",
] as const;
const projectionBlockingDiagnosticCodes = new Set([
  "batch_is_context_not_single_decision",
  "missing_candidate_id",
  "numeric_confidence_not_probability",
  "rejected_candidate_missing_joinable_batch",
  "scan_run_is_context_not_recommendation_decision",
  "unsupported_confidence_label",
  "unsupported_sample_type_evidence",
]);

function textOrNull(value: unknown) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function finiteNumberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function diagnostic(
  code: string,
  severity: CanonicalProjectionDiagnosticSeverity,
  field: string,
  message: string,
  evidenceSources: string[] = [],
): CanonicalProjectionDiagnostic {
  return {
    code,
    severity,
    field,
    message,
    evidence_sources: uniqueSorted(evidenceSources),
  };
}

function canonicalInstant(value: unknown) {
  const text = textOrNull(value);
  if (
    !text ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      text,
    )
  ) {
    return null;
  }

  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function resolveTextEvidence(
  field: string,
  evidence: Evidence<string>[],
  diagnostics: CanonicalProjectionDiagnostic[],
  options: { required: boolean; timestamp?: boolean } = { required: false },
) {
  const present = evidence
    .map((item) => ({
      source: item.source,
      value: options.timestamp
        ? canonicalInstant(item.value)
        : textOrNull(item.value),
      rawPresent: item.value !== null && item.value !== undefined,
    }))
    .filter((item) => item.value !== null);
  const invalid = evidence.filter(
    (item) =>
      item.value !== null &&
      item.value !== undefined &&
      (options.timestamp
        ? canonicalInstant(item.value) === null
        : textOrNull(item.value) === null),
  );

  if (invalid.length > 0) {
    diagnostics.push(
      diagnostic(
        `invalid_${field}`,
        "unsupported",
        field,
        `${field} contains a noncanonical value.`,
        invalid.map((item) => item.source),
      ),
    );
  }

  const values = uniqueSorted(
    present.map((item) => item.value).filter((value): value is string => !!value),
  );

  if (values.length > 1) {
    diagnostics.push(
      diagnostic(
        `conflicting_${field}`,
        "conflict",
        field,
        `${field} has contradictory explicit values.`,
        present.map((item) => item.source),
      ),
    );
    return null;
  }

  if (values.length === 0 && options.required) {
    diagnostics.push(
      diagnostic(
        `missing_${field}`,
        "missing",
        field,
        `${field} is required and was not present.`,
        evidence
          .filter(
            (item) => item.value !== null && item.value !== undefined,
          )
          .map((item) => item.source),
      ),
    );
  }

  return values[0] ?? null;
}

function resolveSampleTypeEvidence(
  evidence: Evidence<unknown>[],
  diagnostics: CanonicalProjectionDiagnostic[],
) {
  const valid: Array<{ source: string; value: CanonicalSampleType }> = [];

  for (const item of evidence) {
    if (item.value === null || item.value === undefined) continue;
    const result = validateCanonicalSampleType(item.value);
    if (result.ok) {
      valid.push({ source: item.source, value: result.value });
    } else {
      diagnostics.push(
        diagnostic(
          "unsupported_sample_type_evidence",
          "unsupported",
          "sample_type",
          "Sample-type evidence is not a canonical exclusive value.",
          [item.source],
        ),
      );
    }
  }

  const values = uniqueSorted(valid.map((item) => item.value));
  if (values.length > 1) {
    diagnostics.push(
      diagnostic(
        "conflicting_sample_type",
        "conflict",
        "sample_type",
        "Multiple exclusive sample types are asserted for one decision.",
        valid.map((item) => item.source),
      ),
    );
    return null;
  }

  if (values.length === 0) {
    diagnostics.push(
      diagnostic(
        "missing_sample_type",
        "missing",
        "sample_type",
        "No explicit exclusive sample type can be projected.",
      ),
    );
    return null;
  }

  return values[0] as CanonicalSampleType;
}

function resolveNumericConfidence(
  evidence: Evidence<number>[],
  diagnostics: CanonicalProjectionDiagnostic[],
) {
  const present = evidence
    .map((item) => ({
      source: item.source,
      value: finiteNumberOrNull(item.value),
    }))
    .filter((item): item is { source: string; value: number } => item.value !== null);
  const values = Array.from(new Set(present.map((item) => item.value))).sort(
    (first, second) => first - second,
  );

  if (values.length > 1) {
    diagnostics.push(
      diagnostic(
        "conflicting_numeric_confidence",
        "conflict",
        "numeric_confidence",
        "Numeric confidence has contradictory explicit values.",
        present.map((item) => item.source),
      ),
    );
    return null;
  }

  const value = values[0] ?? null;
  if (value !== null && (value < 0 || value > 1)) {
    diagnostics.push(
      diagnostic(
        "numeric_confidence_not_probability",
        "unsupported",
        "numeric_confidence",
        "Numeric confidence is not a probability in [0,1]; it was not rescaled.",
        present.map((item) => item.source),
      ),
    );
    return null;
  }

  return value;
}

function resolveConfidenceLabel(
  evidence: Evidence<string>[],
  diagnostics: CanonicalProjectionDiagnostic[],
) {
  const present = evidence
    .map((item) => ({
      source: item.source,
      value: textOrNull(item.value)?.toLowerCase() ?? null,
    }))
    .filter((item): item is { source: string; value: string } => item.value !== null);
  const valid = present.filter((item) =>
    ["low", "medium", "high"].includes(item.value),
  );
  const invalid = present.filter(
    (item) => !["low", "medium", "high"].includes(item.value),
  );

  if (invalid.length > 0) {
    diagnostics.push(
      diagnostic(
        "unsupported_confidence_label",
        "unsupported",
        "confidence_label",
        "Categorical confidence label is not low, medium, or high.",
        invalid.map((item) => item.source),
      ),
    );
  }

  const values = uniqueSorted(valid.map((item) => item.value));
  if (values.length > 1) {
    diagnostics.push(
      diagnostic(
        "conflicting_confidence_label",
        "conflict",
        "confidence_label",
        "Confidence label has contradictory explicit values.",
        valid.map((item) => item.source),
      ),
    );
    return null;
  }

  return (values[0] as CanonicalConfidenceLabel | undefined) ?? null;
}

function versionsEqual(
  first: CanonicalEvaluationVersions,
  second: CanonicalEvaluationVersions,
) {
  return versionFields.every((field) => first[field] === second[field]);
}

function resolveVersions(
  evidence: Evidence<CanonicalEvaluationVersions>[],
  diagnostics: CanonicalProjectionDiagnostic[],
) {
  const present = evidence.filter(
    (item): item is { source: string; value: CanonicalEvaluationVersions } =>
      item.value !== null && item.value !== undefined,
  );

  if (present.length === 0) {
    diagnostics.push(
      diagnostic(
        "missing_versions_metadata",
        "missing",
        "versions",
        "Complete first-class versions metadata is required.",
      ),
    );
    return null;
  }

  const first = present[0].value;
  if (present.some((item) => !versionsEqual(first, item.value))) {
    diagnostics.push(
      diagnostic(
        "conflicting_versions_metadata",
        "conflict",
        "versions",
        "Version metadata differs across explicit evidence sources.",
        present.map((item) => item.source),
      ),
    );
    return null;
  }

  const validation = validateCanonicalEvaluationVersions(first);
  if (!validation.ok) {
    diagnostics.push(
      ...validation.errors.map((error) =>
        diagnostic(
          error,
          "unsupported",
          "versions",
          "Version metadata does not satisfy the canonical contract.",
          present.map((item) => item.source),
        ),
      ),
    );
    return null;
  }

  return validation.value;
}

function versionsFromPayload(
  payload: Record<string, unknown>,
): CanonicalEvaluationVersions | null {
  const candidate = recordOrNull(payload.canonical_evaluation_versions);
  if (!candidate) return null;

  return Object.fromEntries(
    versionFields.map((field) => [field, candidate[field]]),
  ) as CanonicalEvaluationVersions;
}

function payloadSampleEvidence(
  payload: Record<string, unknown>,
  prefix: string,
): Evidence<unknown>[] {
  return [
    { source: `${prefix}.sample_type`, value: payload.sample_type },
    {
      source: `${prefix}.visibility_status`,
      value:
        payload.visibility_status === "visible" ||
        payload.visibility_status === "research_only"
          ? payload.visibility_status
          : null,
    },
    {
      source: `${prefix}.shadow_sample`,
      value: payload.shadow_sample === true ? "shadow" : null,
    },
    {
      source: `${prefix}.historical_synthetic`,
      value:
        payload.historical_synthetic === true
          ? "historical_synthetic"
          : null,
    },
  ];
}

function emptyRelations(): CanonicalProjectionRelations {
  return {
    candidate_id: null,
    batch_id: null,
    batch_fingerprint: null,
    scan_run_id: null,
    scan_run_fingerprint: null,
    snapshot_id: null,
    snapshot_fingerprint: null,
    recommendation_id: null,
    outcome_ids: [],
  };
}

function projectionContext(
  input: Partial<CanonicalProjectionContext>,
): CanonicalProjectionContext {
  return {
    regime: textOrNull(input.regime),
    sector: textOrNull(input.sector),
    freshness: textOrNull(input.freshness),
    provider: textOrNull(input.provider),
    provider_coverage: input.provider_coverage ?? null,
  };
}

function finalizeProjection(
  input: FinalizeProjectionInput,
): CanonicalProjectionResult {
  const diagnostics = [...(input.diagnostics ?? [])];
  const decisionId = resolveTextEvidence(
    "producer_decision_id",
    input.decisionIds,
    diagnostics,
    { required: true },
  );
  const decisionTimestamp = resolveTextEvidence(
    "decision_timestamp",
    input.decisionTimestamps,
    diagnostics,
    { required: true, timestamp: true },
  );
  const sampleType = resolveSampleTypeEvidence(input.sampleTypes, diagnostics);
  const numericConfidence = resolveNumericConfidence(
    input.numericConfidences,
    diagnostics,
  );
  const confidenceLabel = resolveConfidenceLabel(
    input.confidenceLabels,
    diagnostics,
  );
  const confidence: CanonicalConfidence = {
    numeric_confidence: numericConfidence,
    numeric_confidence_scale: "probability_0_1",
    confidence_label: confidenceLabel,
  };
  const confidenceValidation = validateCanonicalConfidence(confidence);
  const versions = resolveVersions(input.versions, diagnostics);

  if (!confidenceValidation.ok) {
    diagnostics.push(
      ...confidenceValidation.errors.map((error) =>
        diagnostic(
          error,
          "unsupported",
          "confidence",
          "Confidence evidence does not satisfy the canonical contract.",
        ),
      ),
    );
  }

  let decision: CanonicalRecommendationDecision | null = null;
  if (
    decisionId &&
    decisionTimestamp &&
    sampleType &&
    versions &&
    confidenceValidation.ok
  ) {
    const result = buildCanonicalRecommendationDecision({
      identity: {
        source_namespace: input.sourceNamespace,
        decision_id: decisionId,
        decided_at: decisionTimestamp,
      },
      sample_type: sampleType,
      versions,
      confidence: confidenceValidation.value,
    });

    if (result.ok) {
      decision = result.value;
    } else {
      diagnostics.push(
        ...result.errors.map((error) =>
          diagnostic(
            error,
            "unsupported",
            "canonical_decision",
            "Canonical decision validation failed.",
          ),
        ),
      );
    }
  }

  const hasConflict = diagnostics.some(
    (item) => item.severity === "conflict",
  );
  const hasProjectionBlocker = diagnostics.some((item) =>
    projectionBlockingDiagnosticCodes.has(item.code),
  );
  const status: CanonicalProjectionStatus = hasConflict
    ? "conflicting"
    : decision && !hasProjectionBlocker
      ? "mapped"
      : "unmappable";

  return {
    status,
    projection: {
      contract_version: CANONICAL_EVALUATION_PROJECTION_CONTRACT_VERSION,
      source: input.source,
      source_namespace: input.sourceNamespace,
      producer_decision_id: decisionId,
      decision_timestamp: decisionTimestamp,
      canonical_identity: decision?.identity.value ?? null,
      sample_type: sampleType,
      decision,
      confidence,
      versions,
      relations: {
        ...input.relations,
        outcome_ids: uniqueSorted(input.relations.outcome_ids),
      },
      context: input.context,
      outcome_rows: input.outcomeRows ?? [],
      primary_outcome: input.primaryOutcome ?? null,
      evaluation_readiness: input.evaluationReadiness ?? "not_applicable",
    },
    diagnostics: diagnostics.sort(
      (first, second) =>
        first.code.localeCompare(second.code) ||
        first.field.localeCompare(second.field),
    ),
  };
}

function metadataVersionsEvidence(
  metadata: CanonicalProjectionMetadata | null | undefined,
  payload: Record<string, unknown> | null,
  payloadSource: string,
): Evidence<CanonicalEvaluationVersions>[] {
  return [
    {
      source: "projection_metadata.versions",
      value: metadata?.versions,
    },
    {
      source: `${payloadSource}.canonical_evaluation_versions`,
      value: payload ? versionsFromPayload(payload) : null,
    },
  ];
}

function snapshotSampleEvidence(
  snapshot: RecommendationSnapshot,
  metadata: CanonicalProjectionMetadata | null | undefined,
) {
  const evidence: Evidence<unknown>[] = [
    {
      source: "projection_metadata.sample_type",
      value: metadata?.sample_type,
    },
    {
      source: "snapshot.is_visible",
      value: snapshot.is_visible ? "visible" : null,
    },
    {
      source: "snapshot.status",
      value: snapshot.status === "visible" ? "visible" : null,
    },
    {
      source: "snapshot.source_mode",
      value:
        snapshot.source_mode === "research_only" ? "research_only" : null,
    },
    {
      source: "snapshot.data_mode",
      value:
        snapshot.data_mode === "research_only" ? "research_only" : null,
    },
    ...payloadSampleEvidence(snapshot.payload_json, "snapshot.payload_json"),
  ];

  return evidence;
}

function snapshotConfidenceEvidence(
  snapshot: RecommendationSnapshot,
  metadata: CanonicalProjectionMetadata | null | undefined,
) {
  return {
    numeric: [
      {
        source: "projection_metadata.numeric_confidence",
        value: metadata?.numeric_confidence,
      },
      {
        source: "snapshot.confidence",
        value: finiteNumberOrNull(snapshot.confidence),
      },
    ] satisfies Evidence<number>[],
    label: [
      {
        source: "projection_metadata.confidence_label",
        value: metadata?.confidence_label,
      },
      {
        source: "snapshot.payload_json.confidence_label",
        value: textOrNull(snapshot.payload_json.confidence_label),
      },
    ] satisfies Evidence<string>[],
  };
}

function coverageFromOutcome(
  outcome: RecommendationOutcome,
): CanonicalCoverage {
  const payloadCoverage = recordOrNull(
    outcome.payload_json.canonical_provider_coverage,
  );
  const expected = finiteNumberOrNull(payloadCoverage?.expected_candle_count);
  const observed = finiteNumberOrNull(payloadCoverage?.observed_candle_count);
  const providerStatus = textOrNull(payloadCoverage?.provider_status);
  const freshness = textOrNull(payloadCoverage?.freshness);
  const malformed = finiteNumberOrNull(payloadCoverage?.malformed_candle_count);
  const blockers = Array.isArray(payloadCoverage?.blockers)
    ? payloadCoverage.blockers.filter(
        (item): item is string => typeof item === "string",
      )
    : outcome.blockers;
  const input: CanonicalCoverageInput = {
    provider_status:
      providerStatus === "available" ||
      providerStatus === "gap" ||
      providerStatus === "error" ||
      providerStatus === "unavailable" ||
      providerStatus === "not_requested"
        ? providerStatus
        : outcome.provider
          ? "available"
          : "not_requested",
    freshness:
      freshness === "fresh" ||
      freshness === "stale" ||
      freshness === "unknown"
        ? freshness
        : "unknown",
    expected_candle_count:
      expected !== null && Number.isInteger(expected) ? expected : null,
    observed_candle_count:
      observed !== null && Number.isInteger(observed) ? observed : 0,
    plan_complete:
      outcome.entry !== null &&
      outcome.stop !== null &&
      outcome.target !== null,
    malformed_candle_count:
      malformed !== null && Number.isInteger(malformed) ? malformed : 0,
    blockers,
  };

  if (outcome.data_completeness !== "complete") {
    input.blockers = [
      ...(input.blockers ?? []),
      `legacy_data_completeness_${outcome.data_completeness}`,
    ];
  }

  return classifyCanonicalCoverage(input);
}

function projectOutcomeRows(
  outcomes: RecommendationOutcome[],
): {
  rows: CanonicalProjectedOutcome[];
  selection: CanonicalPrimaryOutcomeSelection<CanonicalProjectedOutcome>;
  diagnostics: CanonicalProjectionDiagnostic[];
} {
  const diagnostics: CanonicalProjectionDiagnostic[] = [];
  const rows: CanonicalProjectedOutcome[] = [];

  for (const outcome of outcomes) {
    if (
      !supportedHorizons.includes(
        outcome.horizon as (typeof supportedHorizons)[number],
      )
    ) {
      diagnostics.push(
        diagnostic(
          "unsupported_outcome_horizon",
          "unsupported",
          "outcome.horizon",
          "Only 15m, 30m, and 60m can participate in primary selection.",
          [`outcome:${outcome.id}`],
        ),
      );
      continue;
    }

    rows.push({
      id: outcome.id,
      snapshot_id: outcome.snapshot_id,
      snapshot_fingerprint: outcome.snapshot_fingerprint,
      recommendation_id: outcome.recommendation_id,
      horizon: outcome.horizon as CanonicalProjectedOutcome["horizon"],
      status: outcome.status,
      coverage: coverageFromOutcome(outcome),
      source: outcome.source,
      provider: outcome.provider,
      entry_triggered: outcome.entry_triggered,
      target_hit: outcome.target_hit,
      stop_hit: outcome.stop_hit,
      first_terminal_event: outcome.first_terminal_event,
      best_r: outcome.best_r,
      worst_r: outcome.worst_r,
      current_r: outcome.current_r,
      max_favorable_excursion: outcome.max_favorable_excursion,
      max_adverse_excursion: outcome.max_adverse_excursion,
    });
  }

  const selectionRows: CanonicalHorizonOutcome<CanonicalProjectedOutcome>[] =
    rows.map((row) => ({
      horizon: row.horizon,
      coverage: row.coverage,
      outcome: row,
    }));
  const selection = selectCanonicalPrimaryOutcome(selectionRows);

  for (const reasonCode of selection.reason_codes) {
    if (reasonCode.startsWith("duplicate_")) {
      diagnostics.push(
        diagnostic(
          reasonCode,
          "conflict",
          "outcomes",
          "Duplicate horizon rows are retained and block primary selection.",
          rows
            .filter((row) => reasonCode.includes(row.horizon))
            .map((row) => `outcome:${row.id}`),
        ),
      );
    }
  }

  return { rows, selection, diagnostics };
}

function snapshotRelationDiagnostics(input: {
  snapshot: RecommendationSnapshot;
  batch?: RecommendationBatch | null;
  scanRun?: RecommendationScanRun | null;
  outcomes?: RecommendationOutcome[];
}) {
  const diagnostics: CanonicalProjectionDiagnostic[] = [];
  const { snapshot, batch, scanRun, outcomes = [] } = input;

  if (batch) {
    const joinedById = batch.recommendation_snapshot_ids.includes(snapshot.id);
    const joinedByFingerprint =
      batch.recommendation_snapshot_fingerprints.includes(
        snapshot.snapshot_fingerprint,
      );
    if (!joinedById && !joinedByFingerprint) {
      diagnostics.push(
        diagnostic(
          "snapshot_batch_membership_conflict",
          "conflict",
          "relations.batch",
          "Provided batch does not list the snapshot by ID or fingerprint.",
          ["snapshot", "batch"],
        ),
      );
    }
    if (
      snapshot.scan_run_id &&
      batch.scan_run_id &&
      snapshot.scan_run_id !== batch.scan_run_id
    ) {
      diagnostics.push(
        diagnostic(
          "snapshot_batch_scan_run_conflict",
          "conflict",
          "relations.scan_run_id",
          "Snapshot and batch refer to different scan runs.",
          ["snapshot.scan_run_id", "batch.scan_run_id"],
        ),
      );
    }
  }

  if (
    scanRun &&
    snapshot.scan_run_id &&
    snapshot.scan_run_id !== scanRun.id
  ) {
    diagnostics.push(
      diagnostic(
        "snapshot_scan_run_conflict",
        "conflict",
        "relations.scan_run_id",
        "Snapshot and supplied scan run IDs differ.",
        ["snapshot.scan_run_id", "scan_run.id"],
      ),
    );
  }

  for (const outcome of outcomes) {
    if (
      outcome.snapshot_id &&
      outcome.snapshot_id !== snapshot.id &&
      outcome.snapshot_fingerprint !== snapshot.snapshot_fingerprint
    ) {
      diagnostics.push(
        diagnostic(
          "outcome_snapshot_relation_conflict",
          "conflict",
          "relations.outcome_ids",
          "Outcome does not join to the supplied snapshot.",
          [`outcome:${outcome.id}`, "snapshot"],
        ),
      );
    }
    if (
      outcome.recommendation_id &&
      snapshot.recommendation_id &&
      outcome.recommendation_id !== snapshot.recommendation_id
    ) {
      diagnostics.push(
        diagnostic(
          "outcome_recommendation_relation_conflict",
          "conflict",
          "relations.recommendation_id",
          "Outcome and snapshot recommendation IDs differ.",
          [`outcome:${outcome.id}`, "snapshot"],
        ),
      );
    }
  }

  return diagnostics;
}

export function projectRecommendationSnapshotDecision(input: {
  snapshot: RecommendationSnapshot;
  batch?: RecommendationBatch | null;
  scan_run?: RecommendationScanRun | null;
  outcomes?: RecommendationOutcome[];
  metadata?: CanonicalProjectionMetadata | null;
}): CanonicalProjectionResult {
  const { snapshot, batch, scan_run: scanRun, outcomes = [], metadata } = input;
  const payload = snapshot.payload_json;
  const confidenceEvidence = snapshotConfidenceEvidence(snapshot, metadata);
  const outcomeProjection = projectOutcomeRows(outcomes);
  const diagnostics = [
    ...snapshotRelationDiagnostics({ snapshot, batch, scanRun, outcomes }),
    ...outcomeProjection.diagnostics,
  ];
  const payloadRegime = textOrNull(payload.market_regime ?? payload.regime);
  const payloadSector = textOrNull(payload.sector);
  const provider = textOrNull(
    payload.provider ?? payload.reference_price_provider,
  );

  return finalizeProjection({
    source: "recommendation_snapshot",
    sourceNamespace: "recommendation_snapshot",
    decisionIds: [
      {
        source: "projection_metadata.producer_decision_id",
        value: metadata?.producer_decision_id,
      },
      {
        source: "snapshot.recommendation_id",
        value: snapshot.recommendation_id,
      },
    ],
    decisionTimestamps: [
      {
        source: "projection_metadata.decision_timestamp",
        value: metadata?.decision_timestamp,
      },
      {
        source: "snapshot.recommended_at",
        value: snapshot.recommended_at,
      },
    ],
    sampleTypes: snapshotSampleEvidence(snapshot, metadata),
    numericConfidences: confidenceEvidence.numeric,
    confidenceLabels: confidenceEvidence.label,
    versions: metadataVersionsEvidence(
      metadata,
      payload,
      "snapshot.payload_json",
    ),
    relations: {
      candidate_id: textOrNull(
        metadata?.candidate_id ?? payload.candidate_id,
      ),
      batch_id: textOrNull(metadata?.batch_id ?? batch?.id),
      batch_fingerprint: textOrNull(
        metadata?.batch_fingerprint ?? batch?.batch_fingerprint,
      ),
      scan_run_id: textOrNull(
        metadata?.scan_run_id ?? snapshot.scan_run_id ?? scanRun?.id,
      ),
      scan_run_fingerprint: textOrNull(
        metadata?.scan_run_fingerprint ??
          batch?.scan_run_fingerprint ??
          scanRun?.run_fingerprint,
      ),
      snapshot_id: snapshot.id,
      snapshot_fingerprint: snapshot.snapshot_fingerprint,
      recommendation_id: snapshot.recommendation_id,
      outcome_ids: outcomes.map((outcome) => outcome.id),
    },
    context: projectionContext({
      regime: metadata?.regime ?? payloadRegime,
      sector: metadata?.sector ?? payloadSector,
      freshness: metadata?.freshness ?? snapshot.freshness,
      provider: metadata?.provider ?? provider,
      provider_coverage:
        metadata?.provider_coverage ??
        outcomeProjection.selection.primary_outcome?.coverage ??
        null,
    }),
    outcomeRows: outcomeProjection.rows,
    primaryOutcome: outcomeProjection.selection,
    evaluationReadiness:
      outcomes.length === 0
        ? "not_evaluable"
        : outcomeProjection.selection.status === "selected"
          ? "evaluable"
          : "incomplete",
    diagnostics,
  });
}

export function projectRecommendationOutcomeBundle(input: {
  snapshot: RecommendationSnapshot;
  outcomes: RecommendationOutcome[];
  batch?: RecommendationBatch | null;
  scan_run?: RecommendationScanRun | null;
  metadata?: CanonicalProjectionMetadata | null;
}): CanonicalProjectionResult {
  const result = projectRecommendationSnapshotDecision(input);

  return {
    ...result,
    projection: {
      ...result.projection,
      source: "recommendation_outcome_bundle",
    },
  };
}

export function projectScannerCandidateDecision(input: {
  candidate: ScannerCandidate;
  ranking?: ScannerCandidateRankingResult | null;
  ranking_summary?: ScannerCandidateRankingSummary | null;
  build_diagnostic?: SelectedCandidateBuildDiagnostic | null;
  batch?: RecommendationBatch | null;
  scan_run?: RecommendationScanRun | null;
  metadata?: CanonicalProjectionMetadata | null;
}): CanonicalProjectionResult {
  const {
    candidate,
    ranking,
    ranking_summary: rankingSummary,
    build_diagnostic: buildDiagnostic,
    batch,
    scan_run: scanRun,
    metadata,
  } = input;
  const diagnostics: CanonicalProjectionDiagnostic[] = [];

  for (const [source, ticker] of [
    ["ranking.ticker", ranking?.ticker],
    ["build_diagnostic.ticker", buildDiagnostic?.ticker],
  ] as const) {
    if (
      textOrNull(ticker) &&
      textOrNull(ticker)?.toUpperCase() !== candidate.ticker.toUpperCase()
    ) {
      diagnostics.push(
        diagnostic(
          "candidate_ticker_relation_conflict",
          "conflict",
          "relations.candidate_id",
          "Candidate-related sources refer to different tickers.",
          ["candidate.ticker", source],
        ),
      );
    }
  }

  const rejected = buildDiagnostic ? !buildDiagnostic.built : false;
  const sampleTypes: Evidence<unknown>[] = [
    {
      source: "projection_metadata.sample_type",
      value: metadata?.sample_type,
    },
    {
      source: "build_diagnostic.built",
      value: rejected ? "rejected_candidate" : null,
    },
  ];

  if (rejected && !batch) {
    diagnostics.push(
      diagnostic(
        "rejected_candidate_missing_joinable_batch",
        "missing",
        "relations.batch_id",
        "Rejected candidate cannot be related to a recommendation batch.",
        ["build_diagnostic"],
      ),
    );
  }
  if (
    batch &&
    metadata?.batch_id &&
    metadata.batch_id !== batch.id
  ) {
    diagnostics.push(
      diagnostic(
        "candidate_batch_relation_conflict",
        "conflict",
        "relations.batch_id",
        "Candidate metadata and supplied batch IDs differ.",
        ["projection_metadata.batch_id", "batch.id"],
      ),
    );
  }
  if (
    batch &&
    metadata?.batch_fingerprint &&
    metadata.batch_fingerprint !== batch.batch_fingerprint
  ) {
    diagnostics.push(
      diagnostic(
        "candidate_batch_fingerprint_conflict",
        "conflict",
        "relations.batch_fingerprint",
        "Candidate metadata and supplied batch fingerprints differ.",
        ["projection_metadata.batch_fingerprint", "batch.batch_fingerprint"],
      ),
    );
  }

  const candidateId = textOrNull(metadata?.candidate_id);
  if (!candidateId) {
    diagnostics.push(
      diagnostic(
        "missing_candidate_id",
        "missing",
        "relations.candidate_id",
        "ScannerCandidate has no durable candidate ID.",
      ),
    );
  }

  return finalizeProjection({
    source: "scanner_candidate",
    sourceNamespace: "scanner_candidate",
    decisionIds: [
      {
        source: "projection_metadata.producer_decision_id",
        value: metadata?.producer_decision_id,
      },
    ],
    decisionTimestamps: [
      {
        source: "projection_metadata.decision_timestamp",
        value: metadata?.decision_timestamp,
      },
      {
        source: "ranking_summary.generated_at",
        value: rankingSummary?.generated_at,
      },
    ],
    sampleTypes,
    numericConfidences: [
      {
        source: "projection_metadata.numeric_confidence",
        value: metadata?.numeric_confidence,
      },
    ],
    confidenceLabels: [
      {
        source: "projection_metadata.confidence_label",
        value: metadata?.confidence_label,
      },
    ],
    versions: metadataVersionsEvidence(metadata, null, "candidate"),
    relations: {
      candidate_id: candidateId,
      batch_id: textOrNull(metadata?.batch_id ?? batch?.id),
      batch_fingerprint: textOrNull(
        metadata?.batch_fingerprint ?? batch?.batch_fingerprint,
      ),
      scan_run_id: textOrNull(
        metadata?.scan_run_id ?? batch?.scan_run_id ?? scanRun?.id,
      ),
      scan_run_fingerprint: textOrNull(
        metadata?.scan_run_fingerprint ??
          batch?.scan_run_fingerprint ??
          scanRun?.run_fingerprint,
      ),
      snapshot_id: textOrNull(metadata?.snapshot_id),
      snapshot_fingerprint: textOrNull(metadata?.snapshot_fingerprint),
      recommendation_id: textOrNull(metadata?.recommendation_id),
      outcome_ids: [],
    },
    context: projectionContext({
      regime: metadata?.regime,
      sector: metadata?.sector ?? candidate.sector,
      freshness:
        metadata?.freshness ??
        (candidate.intraday_indicator_stale === true
          ? "stale"
          : candidate.intraday_indicator_stale === false
            ? "fresh"
            : null),
      provider:
        metadata?.provider ?? candidate.reference_price_provider ?? null,
      provider_coverage: metadata?.provider_coverage ?? null,
    }),
    evaluationReadiness:
      metadata?.provider_coverage?.status === "complete"
        ? "evaluable"
        : "not_evaluable",
    diagnostics,
  });
}

export function projectRecommendationBatchDecision(input: {
  batch: RecommendationBatch;
  scan_run?: RecommendationScanRun | null;
  metadata?: CanonicalProjectionMetadata | null;
}): CanonicalProjectionResult {
  const { batch, scan_run: scanRun, metadata } = input;
  const noTrade = batch.status === "no_trade_valid";
  const diagnostics: CanonicalProjectionDiagnostic[] = [];

  if (!noTrade) {
    diagnostics.push(
      diagnostic(
        "batch_is_context_not_single_decision",
        "missing",
        "producer_decision_id",
        "A normal batch can contain multiple recommendation decisions; project its snapshots.",
        ["batch.status"],
      ),
    );
  }

  return finalizeProjection({
    source: "recommendation_batch",
    sourceNamespace: "recommendation_batch",
    decisionIds: [
      {
        source: "projection_metadata.producer_decision_id",
        value: metadata?.producer_decision_id,
      },
      {
        source: "batch.id",
        value: noTrade ? batch.id : null,
      },
    ],
    decisionTimestamps: [
      {
        source: "projection_metadata.decision_timestamp",
        value: metadata?.decision_timestamp,
      },
      {
        source: "batch.observed_at",
        value: noTrade ? batch.observed_at : null,
      },
    ],
    sampleTypes: [
      {
        source: "projection_metadata.sample_type",
        value: metadata?.sample_type,
      },
      {
        source: "batch.status",
        value: noTrade ? "no_trade" : null,
      },
      ...payloadSampleEvidence(batch.payload_json, "batch.payload_json"),
    ],
    numericConfidences: [
      {
        source: "projection_metadata.numeric_confidence",
        value: metadata?.numeric_confidence,
      },
    ],
    confidenceLabels: [
      {
        source: "projection_metadata.confidence_label",
        value: metadata?.confidence_label,
      },
    ],
    versions: metadataVersionsEvidence(
      metadata,
      batch.payload_json,
      "batch.payload_json",
    ),
    relations: {
      ...emptyRelations(),
      batch_id: batch.id,
      batch_fingerprint: batch.batch_fingerprint,
      scan_run_id: textOrNull(
        metadata?.scan_run_id ?? batch.scan_run_id ?? scanRun?.id,
      ),
      scan_run_fingerprint: textOrNull(
        metadata?.scan_run_fingerprint ??
          batch.scan_run_fingerprint ??
          scanRun?.run_fingerprint,
      ),
      outcome_ids: [],
    },
    context: projectionContext({
      regime: metadata?.regime ?? textOrNull(batch.payload_json.market_regime),
      sector: metadata?.sector,
      freshness: metadata?.freshness ?? batch.freshness_status,
      provider:
        metadata?.provider ?? textOrNull(batch.payload_json.provider),
      provider_coverage: metadata?.provider_coverage ?? null,
    }),
    evaluationReadiness:
      noTrade && metadata?.provider_coverage?.status === "complete"
        ? "evaluable"
        : noTrade
          ? "not_evaluable"
          : "not_applicable",
    diagnostics: noTrade
      ? [
          ...diagnostics,
          ...(metadata?.provider_coverage
            ? []
            : [
                diagnostic(
                  "no_trade_counterfactual_not_evaluable",
                  "info",
                  "provider_coverage",
                  "No-trade decision lacks complete counterfactual coverage.",
                ),
              ]),
        ]
      : diagnostics,
  });
}

export function projectRecommendationScanRunDecision(input: {
  scan_run: RecommendationScanRun;
  metadata?: CanonicalProjectionMetadata | null;
}): CanonicalProjectionResult {
  const { scan_run: scanRun, metadata } = input;

  return finalizeProjection({
    source: "recommendation_scan_run",
    sourceNamespace: "recommendation_scan_run",
    decisionIds: [
      {
        source: "projection_metadata.producer_decision_id",
        value: metadata?.producer_decision_id,
      },
    ],
    decisionTimestamps: [
      {
        source: "projection_metadata.decision_timestamp",
        value: metadata?.decision_timestamp,
      },
    ],
    sampleTypes: [
      {
        source: "projection_metadata.sample_type",
        value: metadata?.sample_type,
      },
    ],
    numericConfidences: [],
    confidenceLabels: [],
    versions: metadataVersionsEvidence(
      metadata,
      scanRun.payload_json,
      "scan_run.payload_json",
    ),
    relations: {
      ...emptyRelations(),
      scan_run_id: scanRun.id,
      scan_run_fingerprint: scanRun.run_fingerprint,
    },
    context: projectionContext({
      regime: metadata?.regime ?? textOrNull(scanRun.payload_json.market_regime),
      sector: metadata?.sector,
      freshness:
        metadata?.freshness ??
        (scanRun.status === "stale" ? "stale" : null),
      provider: metadata?.provider,
      provider_coverage: metadata?.provider_coverage ?? null,
    }),
    diagnostics: [
      diagnostic(
        "scan_run_is_context_not_recommendation_decision",
        "missing",
        "producer_decision_id",
        "A scan run is pipeline context and cannot identify one recommendation decision.",
        ["scan_run.id", "scan_run.run_fingerprint"],
      ),
    ],
  });
}

export function projectHistoricalSyntheticDecision(input: {
  replay: ReplayWithSignalPackageResult;
  metadata?: CanonicalProjectionMetadata | null;
}): CanonicalProjectionResult {
  const { replay, metadata } = input;
  const explicitHistorical = replay.source_type === "historical_synthetic";
  const diagnostics: CanonicalProjectionDiagnostic[] = [];

  if (!replay.lookahead_safety_passed) {
    diagnostics.push(
      diagnostic(
        "historical_replay_lookahead_safety_not_passed",
        "conflict",
        "decision_timestamp",
        "Historical replay cannot be canonical while lookahead safety is unproven.",
        ["replay.lookahead_safety_passed"],
      ),
    );
  }
  if (!replay.counterfactual_result_available) {
    diagnostics.push(
      diagnostic(
        "historical_replay_counterfactual_unavailable",
        "missing",
        "provider_coverage",
        "Historical replay has no evaluable counterfactual result.",
        ["replay.counterfactual_result_available"],
      ),
    );
  }

  return finalizeProjection({
    source: "historical_replay",
    sourceNamespace: "historical_replay",
    decisionIds: [
      {
        source: "projection_metadata.producer_decision_id",
        value: metadata?.producer_decision_id,
      },
      {
        source: "replay.candidate_id",
        value: replay.candidate_id,
      },
    ],
    decisionTimestamps: [
      {
        source: "projection_metadata.decision_timestamp",
        value: metadata?.decision_timestamp,
      },
      {
        source: "replay.analysis_cutoff",
        value: replay.analysis_cutoff,
      },
    ],
    sampleTypes: [
      {
        source: "projection_metadata.sample_type",
        value: metadata?.sample_type,
      },
      {
        source: "replay.source_type",
        value: explicitHistorical ? "historical_synthetic" : null,
      },
    ],
    numericConfidences: [
      {
        source: "projection_metadata.numeric_confidence",
        value: metadata?.numeric_confidence,
      },
    ],
    confidenceLabels: [
      {
        source: "projection_metadata.confidence_label",
        value: metadata?.confidence_label,
      },
    ],
    versions: metadataVersionsEvidence(metadata, null, "replay"),
    relations: {
      ...emptyRelations(),
      candidate_id: replay.candidate_id,
    },
    context: projectionContext({
      regime: metadata?.regime,
      sector: metadata?.sector,
      freshness: metadata?.freshness,
      provider: metadata?.provider ?? replay.source_verification,
      provider_coverage: metadata?.provider_coverage ?? null,
    }),
    evaluationReadiness: replay.counterfactual_result_available
      ? "evaluable"
      : "not_evaluable",
    diagnostics,
  });
}

function emptyCoverageCount(): CanonicalProjectionCoverageCount {
  return {
    total: 0,
    mapped: 0,
    conflicting: 0,
    unmappable: 0,
  };
}

function incrementCoverageCount(
  target: CanonicalProjectionCoverageCount,
  status: CanonicalProjectionStatus,
) {
  target.total += 1;
  target[status] += 1;
}

export function aggregateCanonicalProjectionCoverage(
  results: CanonicalProjectionResult[],
): CanonicalProjectionCoverageSummary {
  const overall = emptyCoverageCount();
  const bySource = new Map<string, CanonicalProjectionCoverageCount>();
  const bySampleType = new Map<string, CanonicalProjectionCoverageCount>();

  for (const result of results) {
    incrementCoverageCount(overall, result.status);
    const source = result.projection.source;
    const sampleType = result.projection.sample_type ?? "unknown";
    const sourceCount = bySource.get(source) ?? emptyCoverageCount();
    const sampleCount = bySampleType.get(sampleType) ?? emptyCoverageCount();
    incrementCoverageCount(sourceCount, result.status);
    incrementCoverageCount(sampleCount, result.status);
    bySource.set(source, sourceCount);
    bySampleType.set(sampleType, sampleCount);
  }

  return {
    contract_version: CANONICAL_EVALUATION_PROJECTION_CONTRACT_VERSION,
    overall,
    by_source: Object.fromEntries(
      Array.from(bySource.entries()).sort(([first], [second]) =>
        first.localeCompare(second),
      ),
    ),
    by_sample_type: Object.fromEntries(
      Array.from(bySampleType.entries()).sort(([first], [second]) =>
        first.localeCompare(second),
      ),
    ),
  };
}
