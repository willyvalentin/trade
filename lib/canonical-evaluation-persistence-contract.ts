import {
  projectHistoricalSyntheticDecision,
  projectRecommendationBatchDecision,
  projectRecommendationOutcomeBundle,
  projectRecommendationSnapshotDecision,
  projectScannerCandidateDecision,
  type CanonicalProjectedOutcome,
  type CanonicalProjection,
  type CanonicalProjectionMetadata,
  type CanonicalProjectionResult,
  type CanonicalProjectionSource,
} from "@/lib/canonical-evaluation-projection-adapters";
import type {
  CanonicalConfidence,
  CanonicalCoverage,
  CanonicalEvaluationVersions,
  CanonicalPrimaryOutcomeSelection,
  CanonicalRecommendationDecision,
  CanonicalSampleType,
} from "@/lib/canonical-recommendation-evaluation";
import {
  selectCanonicalPrimaryOutcome,
  validateCanonicalConfidence,
  validateCanonicalEvaluationVersions,
} from "@/lib/canonical-recommendation-evaluation";
import type { RecommendationBatch } from "@/lib/recommendation-batch-memory";
import type { SelectedCandidateBuildDiagnostic } from "@/lib/recommendation-build-diagnostics";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { ScannerCandidate } from "@/lib/scanner";
import type { ReplayWithSignalPackageResult } from "@/lib/replay-with-signal-package-result-model";

export const CANONICAL_EVALUATION_PERSISTENCE_CONTRACT_VERSION =
  "canonical_evaluation_persistence_v1" as const;
export const CANONICAL_EVALUATION_STORAGE_PAYLOAD_VERSION =
  "canonical_evaluation_storage_payload_v1" as const;
export const CANONICAL_EVALUATION_SCHEMA_PROPOSAL_VERSION =
  "canonical_evaluation_schema_proposal_v1" as const;

export type CanonicalPersistenceStatus =
  | "ready"
  | "conflicting"
  | "unmappable";

export type CanonicalLegacyReadinessStatus =
  | CanonicalPersistenceStatus
  | "incomplete_but_preservable";

export type CanonicalPersistenceDiagnosticSeverity =
  | "conflict"
  | "missing"
  | "invalid"
  | "info";

export type CanonicalPersistenceDiagnostic = {
  code: string;
  severity: CanonicalPersistenceDiagnosticSeverity;
  field: string;
  message: string;
  evidence_sources: string[];
};

export type CanonicalPersistenceResult<T> = {
  status: CanonicalPersistenceStatus;
  value: T | null;
  diagnostics: CanonicalPersistenceDiagnostic[];
};

export type CanonicalPersistenceDecisionKind =
  | "recommendation"
  | "rejection"
  | "no_trade"
  | "historical_synthetic";

export type CanonicalPersistenceLineageNode = {
  id: string;
  fingerprint: string | null;
};

export type CanonicalPersistenceLineage = {
  candidate: CanonicalPersistenceLineageNode | null;
  scan_run: CanonicalPersistenceLineageNode | null;
  batch: CanonicalPersistenceLineageNode | null;
  snapshot: CanonicalPersistenceLineageNode | null;
  recommendation_id: string | null;
  outcome_ids: string[];
};

export type CanonicalPersistenceDecisionContext = {
  regime: string | null;
  sector: string | null;
  ticker: string | null;
  setup: string | null;
  window: string | null;
  captured_at: string;
  reason_codes: string[];
};

export type CanonicalPersistenceProviderContext = {
  provider: string | null;
  source_timestamp: string | null;
  freshness: string | null;
  candle_interval: string | null;
  primary_coverage: CanonicalCoverage | null;
  reason_codes: string[];
};

export type CanonicalPersistenceTradePlan = {
  side: "long" | "short";
  entry: number;
  stop: number;
  target: number;
  entry_policy: "immediate_at_recommendation" | "touch_after_recommendation";
};

export type CanonicalPersistenceReplayMetadata = {
  replay_id: string;
  replayed_at: string;
  source_type: "historical_synthetic" | "shadow" | "diagnostic";
  source_commit: string;
  deterministic_input_hash: string;
  lookahead_safety_passed: boolean;
  provider_call_executed: false;
  persistence_write_executed: false;
};

export type CanonicalPersistenceEvaluation = {
  evaluator_input_identity: string | null;
  trade_plan: CanonicalPersistenceTradePlan | null;
  horizons: CanonicalProjectedOutcome[];
  primary_selection:
    | CanonicalPrimaryOutcomeSelection<CanonicalProjectedOutcome>
    | null;
  primary_outcome_id: string | null;
  diagnostic_outcome_ids: string[];
  replay: CanonicalPersistenceReplayMetadata | null;
  reproducible: boolean;
  quality_metrics_eligible: boolean;
  reason_codes: string[];
};

export type CanonicalEvaluationPersistenceEnvelope = {
  contract_version: typeof CANONICAL_EVALUATION_PERSISTENCE_CONTRACT_VERSION;
  decision_kind: CanonicalPersistenceDecisionKind;
  source: CanonicalProjectionSource;
  source_namespace: string;
  canonical_identity: string;
  producer_decision_id: string;
  decision_timestamp: string;
  sample_type: CanonicalSampleType;
  decision: CanonicalRecommendationDecision;
  confidence: CanonicalConfidence;
  versions: CanonicalEvaluationVersions;
  lineage: CanonicalPersistenceLineage;
  decision_context: CanonicalPersistenceDecisionContext;
  provider_context: CanonicalPersistenceProviderContext;
  evaluation: CanonicalPersistenceEvaluation;
  idempotency_identity: string;
  inactive_readiness_only: true;
};

export type BuildCanonicalPersistenceEnvelopeInput = {
  projection: CanonicalProjectionResult;
  decision_kind: CanonicalPersistenceDecisionKind;
  metrics_context?: {
    ticker: string | null;
    setup: string | null;
    window: string | null;
  };
  context_reason_codes?: string[];
  provider_source_timestamp?: string | null;
  candle_interval?: string | null;
  provider_reason_codes?: string[];
  evaluator_input_identity?: string | null;
  trade_plan?: CanonicalPersistenceTradePlan | null;
  replay?: CanonicalPersistenceReplayMetadata | null;
  evaluation_reason_codes?: string[];
};

export type CanonicalEvaluationStoragePayload = {
  storage_contract_version: typeof CANONICAL_EVALUATION_STORAGE_PAYLOAD_VERSION;
  target_relation: "canonical_evaluation_decisions_proposed";
  write_enabled: false;
  canonical_identity: string;
  producer_decision_id: string;
  source_namespace: string;
  decision_timestamp: string;
  decision_kind: CanonicalPersistenceDecisionKind;
  sample_type: CanonicalSampleType;
  candidate_id: string | null;
  scan_run_id: string | null;
  scan_run_fingerprint: string | null;
  batch_id: string | null;
  batch_fingerprint: string | null;
  snapshot_id: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  numeric_confidence: number | null;
  confidence_label: string | null;
  engine_version: string;
  scoring_version: string;
  ranking_version: string;
  setup_taxonomy_version: string;
  confidence_contract_version: string;
  evaluator_version: string;
  provider_contract_version: string;
  git_commit: string;
  build_identity: string;
  regime_at_decision: string | null;
  sector_at_decision: string | null;
  provider: string | null;
  provider_source_timestamp: string | null;
  freshness: string | null;
  candle_interval: string | null;
  expected_candle_count: number | null;
  observed_candle_count: number | null;
  coverage_reason_codes: string[];
  evaluator_input_identity: string | null;
  primary_horizon: "15m" | "30m" | "60m" | null;
  primary_outcome_id: string | null;
  diagnostic_outcome_ids: string[];
  lineage_json: CanonicalPersistenceLineage;
  versions_json: CanonicalEvaluationVersions;
  decision_context_json: CanonicalPersistenceDecisionContext;
  provider_context_json: CanonicalPersistenceProviderContext;
  evaluation_json: CanonicalPersistenceEvaluation;
  replay_metadata_json: CanonicalPersistenceReplayMetadata | null;
  envelope_json: CanonicalEvaluationPersistenceEnvelope;
  idempotency_key: string;
  inactive_readiness_only: true;
};

export type CanonicalPersistenceRoundTripResult = {
  status: CanonicalPersistenceStatus;
  envelope: CanonicalEvaluationPersistenceEnvelope | null;
  storage_payload: CanonicalEvaluationStoragePayload | null;
  readback_projection: CanonicalProjectionResult | null;
  canonical_result_equal: boolean;
  difference_codes: string[];
  diagnostics: CanonicalPersistenceDiagnostic[];
};

export type CanonicalLegacyReadinessInput = {
  fixture_id: string;
  source: CanonicalProjectionSource;
  source_record_id: string | null;
  observed_at: string | null;
  raw_payload: Record<string, unknown> | null;
  projection: CanonicalProjectionResult | null;
  envelope_result?: CanonicalPersistenceResult<CanonicalEvaluationPersistenceEnvelope> | null;
  preservation_policy: "none" | "raw_audit_only";
  quality_metrics_required: boolean;
  reason_codes?: string[];
};

export type CanonicalLegacyReadinessItem = {
  fixture_id: string;
  source: CanonicalProjectionSource;
  sample_type: CanonicalSampleType | "unknown";
  status: CanonicalLegacyReadinessStatus;
  canonical_identity: string | null;
  source_record_id: string | null;
  reason_codes: string[];
};

export type CanonicalLegacyReadinessCount = {
  total: number;
  ready: number;
  conflicting: number;
  unmappable: number;
  incomplete_but_preservable: number;
};

export type CanonicalLegacyReadinessReport = {
  contract_version: typeof CANONICAL_EVALUATION_PERSISTENCE_CONTRACT_VERSION;
  fixture_only: true;
  production_rows_read: 0;
  production_rows_written: 0;
  totals: CanonicalLegacyReadinessCount;
  by_source: Record<string, CanonicalLegacyReadinessCount>;
  by_sample_type: Record<string, CanonicalLegacyReadinessCount>;
  reason_code_counts: Record<string, number>;
  items: CanonicalLegacyReadinessItem[];
};

const explicitInstantPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const fullCommitPattern = /^[0-9a-f]{40}$/;
const supportedSourceNamespaces = [
  "recommendation_snapshot",
  "scanner_candidate",
  "recommendation_batch",
  "historical_replay",
] as const;

function textOrNull(value: unknown) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function canonicalInstant(value: unknown) {
  const text = textOrNull(value);
  if (!text || !explicitInstantPattern.test(text)) return null;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function persistenceDiagnostic(
  code: string,
  severity: CanonicalPersistenceDiagnosticSeverity,
  field: string,
  message: string,
  evidenceSources: string[] = [],
): CanonicalPersistenceDiagnostic {
  return {
    code,
    severity,
    field,
    message,
    evidence_sources: uniqueSorted(evidenceSources),
  };
}

function diagnosticsFromProjection(
  projection: CanonicalProjectionResult,
): CanonicalPersistenceDiagnostic[] {
  return projection.diagnostics.map((item) => ({
    code: item.code,
    severity:
      item.severity === "conflict"
        ? "conflict"
        : item.severity === "missing"
          ? "missing"
          : item.severity === "unsupported"
            ? "invalid"
            : "info",
    field: item.field,
    message: item.message,
    evidence_sources: [...item.evidence_sources],
  }));
}

function resultStatus(
  diagnostics: CanonicalPersistenceDiagnostic[],
): Exclude<CanonicalPersistenceStatus, "ready"> {
  return diagnostics.some((item) => item.severity === "conflict")
    ? "conflicting"
    : "unmappable";
}

function failure<T>(
  diagnostics: CanonicalPersistenceDiagnostic[],
): CanonicalPersistenceResult<T> {
  return {
    status: resultStatus(diagnostics),
    value: null,
    diagnostics: diagnostics.sort((first, second) =>
      first.code.localeCompare(second.code),
    ),
  };
}

function lineageFromProjection(
  projection: CanonicalProjection,
): CanonicalPersistenceLineage {
  return {
    candidate: projection.relations.candidate_id
      ? {
          id: projection.relations.candidate_id,
          fingerprint: null,
        }
      : null,
    scan_run: projection.relations.scan_run_id
      ? {
          id: projection.relations.scan_run_id,
          fingerprint: projection.relations.scan_run_fingerprint,
        }
      : null,
    batch: projection.relations.batch_id
      ? {
          id: projection.relations.batch_id,
          fingerprint: projection.relations.batch_fingerprint,
        }
      : null,
    snapshot: projection.relations.snapshot_id
      ? {
          id: projection.relations.snapshot_id,
          fingerprint: projection.relations.snapshot_fingerprint,
        }
      : null,
    recommendation_id: projection.relations.recommendation_id,
    outcome_ids: uniqueSorted(projection.relations.outcome_ids),
  };
}

function expectedDecisionKind(sampleType: CanonicalSampleType) {
  if (sampleType === "no_trade") return "no_trade" as const;
  if (sampleType === "rejected_candidate") return "rejection" as const;
  if (sampleType === "historical_synthetic") {
    return "historical_synthetic" as const;
  }
  return "recommendation" as const;
}

function validateTradePlan(
  plan: CanonicalPersistenceTradePlan | null,
  diagnostics: CanonicalPersistenceDiagnostic[],
) {
  if (!plan) return;
  const validNumbers =
    finiteNumber(plan.entry) &&
    finiteNumber(plan.stop) &&
    finiteNumber(plan.target);
  const validGeometry =
    validNumbers &&
    (plan.side === "long"
      ? plan.stop < plan.entry && plan.entry < plan.target
      : plan.target < plan.entry && plan.entry < plan.stop);

  if (!validGeometry) {
    diagnostics.push(
      persistenceDiagnostic(
        "invalid_trade_plan",
        "invalid",
        "evaluation.trade_plan",
        "Trade plan must have finite side-consistent entry, stop, and target.",
      ),
    );
  }
}

function validateReplay(
  replay: CanonicalPersistenceReplayMetadata | null,
  sampleType: CanonicalSampleType,
  diagnostics: CanonicalPersistenceDiagnostic[],
) {
  if (sampleType === "historical_synthetic" && !replay) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_historical_replay_metadata",
        "missing",
        "evaluation.replay",
        "Historical synthetic decisions require explicit replay metadata.",
      ),
    );
    return;
  }
  if (!replay) return;

  if (
    !textOrNull(replay.replay_id) ||
    !canonicalInstant(replay.replayed_at) ||
    !fullCommitPattern.test(replay.source_commit) ||
    !textOrNull(replay.deterministic_input_hash)
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "invalid_replay_metadata",
        "invalid",
        "evaluation.replay",
        "Replay metadata is incomplete or noncanonical.",
      ),
    );
  }
  if (!replay.lookahead_safety_passed) {
    diagnostics.push(
      persistenceDiagnostic(
        "replay_lookahead_safety_not_passed",
        "conflict",
        "evaluation.replay.lookahead_safety_passed",
        "Replay cannot be quality-eligible without lookahead safety.",
      ),
    );
  }
  if (
    replay.provider_call_executed !== false ||
    replay.persistence_write_executed !== false
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "replay_inactive_boundary_conflict",
        "conflict",
        "evaluation.replay",
        "664C replay metadata must prove no provider call and no persistence write.",
      ),
    );
  }
}

function validateLineage(
  sampleType: CanonicalSampleType,
  sourceNamespace: string,
  producerDecisionId: string,
  lineage: CanonicalPersistenceLineage,
  diagnostics: CanonicalPersistenceDiagnostic[],
) {
  const requireNode = (
    node: CanonicalPersistenceLineageNode | null,
    code: string,
    field: string,
  ) => {
    if (!node?.id) {
      diagnostics.push(
        persistenceDiagnostic(
          code,
          "missing",
          field,
          `${field} is required for ${sampleType}.`,
        ),
      );
    }
  };

  if (
    sampleType === "visible" ||
    sampleType === "research_only" ||
    sampleType === "shadow"
  ) {
    requireNode(lineage.candidate, "missing_candidate_lineage", "lineage.candidate");
    requireNode(lineage.scan_run, "missing_scan_run_lineage", "lineage.scan_run");
    requireNode(lineage.batch, "missing_batch_lineage", "lineage.batch");
    if (sourceNamespace === "recommendation_snapshot") {
      requireNode(lineage.snapshot, "missing_snapshot_lineage", "lineage.snapshot");
      if (!lineage.recommendation_id) {
        diagnostics.push(
          persistenceDiagnostic(
            "missing_recommendation_lineage",
            "missing",
            "lineage.recommendation_id",
            "Snapshot-backed recommendation requires recommendation lineage.",
          ),
        );
      }
    }
  }

  if (sampleType === "rejected_candidate") {
    requireNode(lineage.candidate, "missing_candidate_lineage", "lineage.candidate");
    requireNode(lineage.scan_run, "missing_scan_run_lineage", "lineage.scan_run");
    requireNode(lineage.batch, "missing_batch_lineage", "lineage.batch");
    if (lineage.snapshot || lineage.recommendation_id) {
      diagnostics.push(
        persistenceDiagnostic(
          "rejected_candidate_snapshot_lineage_conflict",
          "conflict",
          "lineage.snapshot",
          "Rejected candidate cannot claim a published snapshot/recommendation lineage.",
        ),
      );
    }
  }

  if (sampleType === "no_trade") {
    requireNode(lineage.scan_run, "missing_scan_run_lineage", "lineage.scan_run");
    requireNode(lineage.batch, "missing_batch_lineage", "lineage.batch");
    if (lineage.snapshot || lineage.recommendation_id || lineage.outcome_ids.length > 0) {
      diagnostics.push(
        persistenceDiagnostic(
          "no_trade_recommendation_lineage_conflict",
          "conflict",
          "lineage",
          "No-trade decision cannot claim recommendation snapshot/outcome lineage.",
        ),
      );
    }
  }

  if (sampleType === "historical_synthetic") {
    requireNode(lineage.candidate, "missing_candidate_lineage", "lineage.candidate");
  }

  if (
    sourceNamespace === "recommendation_snapshot" &&
    lineage.recommendation_id &&
    lineage.recommendation_id !== producerDecisionId
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "recommendation_identity_lineage_conflict",
        "conflict",
        "lineage.recommendation_id",
        "Recommendation lineage differs from producer decision ID.",
      ),
    );
  }
}

function evaluationFromInput(
  input: BuildCanonicalPersistenceEnvelopeInput,
  diagnostics: CanonicalPersistenceDiagnostic[],
): CanonicalPersistenceEvaluation {
  const projection = input.projection.projection;
  const horizons = projection.outcome_rows.map((row) => ({
    ...row,
    coverage: {
      ...row.coverage,
      reason_codes: [...row.coverage.reason_codes],
    },
  }));
  const selection = projection.primary_outcome
    ? structuredClone(projection.primary_outcome)
    : null;
  const primaryOutcomeId =
    selection?.status === "selected"
      ? selection.primary_outcome?.outcome.id ?? null
      : null;
  const diagnosticOutcomeIds =
    selection?.diagnostic_outcomes.map((item) => item.outcome.id) ??
    horizons.map((row) => row.id);
  const evaluatorInputIdentity = textOrNull(input.evaluator_input_identity);
  const hasEvaluationRows = horizons.length > 0;
  const requiresEvaluatorInput =
    hasEvaluationRows ||
    projection.sample_type === "historical_synthetic";

  if (requiresEvaluatorInput && !evaluatorInputIdentity) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_evaluator_input_identity",
        "missing",
        "evaluation.evaluator_input_identity",
        "Evaluable horizons and historical replay require explicit evaluator input identity.",
      ),
    );
  }
  if (hasEvaluationRows && !input.trade_plan) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_trade_plan",
        "missing",
        "evaluation.trade_plan",
        "Outcome horizons require the explicit evaluated trade plan.",
      ),
    );
  }
  validateTradePlan(input.trade_plan ?? null, diagnostics);
  validateReplay(input.replay ?? null, projection.sample_type as CanonicalSampleType, diagnostics);

  const primaryComplete =
    selection?.status === "selected" &&
    selection.primary_outcome?.coverage.status === "complete";
  const reproducible =
    Boolean(evaluatorInputIdentity) &&
    Boolean(input.provider_source_timestamp) &&
    Boolean(input.candle_interval) &&
    (primaryComplete || projection.sample_type === "historical_synthetic") &&
    (input.replay?.lookahead_safety_passed ?? true);
  const qualityMetricsEligible =
    reproducible &&
    projection.sample_type !== "no_trade" &&
    projection.sample_type !== "rejected_candidate";
  const reasonCodes = uniqueSorted([
    ...(input.evaluation_reason_codes ?? []),
    ...(selection?.reason_codes ?? []),
    ...(primaryComplete ? [] : hasEvaluationRows ? ["primary_outcome_incomplete"] : []),
    ...(reproducible ? [] : ["outcome_not_reproducible"]),
    ...(qualityMetricsEligible ? [] : ["quality_metrics_not_eligible"]),
  ]);

  return {
    evaluator_input_identity: evaluatorInputIdentity,
    trade_plan: input.trade_plan ? { ...input.trade_plan } : null,
    horizons,
    primary_selection: selection,
    primary_outcome_id: primaryOutcomeId,
    diagnostic_outcome_ids: uniqueSorted(diagnosticOutcomeIds),
    replay: input.replay ? { ...input.replay } : null,
    reproducible,
    quality_metrics_eligible: qualityMetricsEligible,
    reason_codes: reasonCodes,
  };
}

export function buildCanonicalEvaluationPersistenceEnvelope(
  input: BuildCanonicalPersistenceEnvelopeInput,
): CanonicalPersistenceResult<CanonicalEvaluationPersistenceEnvelope> {
  const projection = input.projection;
  const diagnostics = diagnosticsFromProjection(projection);

  if (projection.status !== "mapped") {
    diagnostics.push(
      persistenceDiagnostic(
        `projection_${projection.status}`,
        projection.status === "conflicting" ? "conflict" : "missing",
        "projection",
        "Only a mapped Action 664B projection can enter the persistence envelope.",
      ),
    );
    return failure(diagnostics);
  }

  const value = projection.projection;
  if (
    !value.decision ||
    !value.canonical_identity ||
    !value.producer_decision_id ||
    !value.decision_timestamp ||
    !value.sample_type ||
    !value.versions
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "mapped_projection_missing_canonical_core",
        "conflict",
        "projection",
        "Mapped projection is missing canonical decision fields.",
      ),
    );
    return failure(diagnostics);
  }

  if (!supportedSourceNamespaces.includes(
    value.source_namespace as (typeof supportedSourceNamespaces)[number],
  )) {
    diagnostics.push(
      persistenceDiagnostic(
        "unsupported_persistence_source_namespace",
        "invalid",
        "source_namespace",
        "Source namespace has no inactive readback adapter.",
      ),
    );
  }

  const expectedKind = expectedDecisionKind(value.sample_type);
  if (input.decision_kind !== expectedKind) {
    diagnostics.push(
      persistenceDiagnostic(
        "decision_kind_sample_type_conflict",
        "conflict",
        "decision_kind",
        `Sample type ${value.sample_type} requires decision kind ${expectedKind}.`,
      ),
    );
  }

  const lineage = lineageFromProjection(value);
  validateLineage(
    value.sample_type,
    value.source_namespace,
    value.producer_decision_id,
    lineage,
    diagnostics,
  );

  const capturedAt = canonicalInstant(value.decision_timestamp);
  if (!capturedAt) {
    diagnostics.push(
      persistenceDiagnostic(
        "invalid_decision_context_timestamp",
        "invalid",
        "decision_context.captured_at",
        "Decision context timestamp must be an explicit instant.",
      ),
    );
  }
  if (!textOrNull(value.context.regime)) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_regime_at_decision",
        "missing",
        "decision_context.regime",
        "Regime must be explicitly present for persistence readiness.",
      ),
    );
  }
  if (
    !textOrNull(value.context.sector) &&
    value.sample_type !== "no_trade"
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_sector_at_decision",
        "missing",
        "decision_context.sector",
        "Sector must be explicit except for market-level no-trade decisions.",
      ),
    );
  }

  const providerSourceTimestamp = canonicalInstant(
    input.provider_source_timestamp,
  );
  const candleInterval = textOrNull(input.candle_interval);
  const hasOutcomeRows = value.outcome_rows.length > 0;
  const requiresProviderEvaluationContext =
    hasOutcomeRows || value.sample_type === "historical_synthetic";

  if (requiresProviderEvaluationContext && !providerSourceTimestamp) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_provider_source_timestamp",
        "missing",
        "provider_context.source_timestamp",
        "Evaluable data requires an explicit provider source timestamp.",
      ),
    );
  }
  if (requiresProviderEvaluationContext && !candleInterval) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_candle_interval",
        "missing",
        "provider_context.candle_interval",
        "Evaluable data requires an explicit candle interval contract.",
      ),
    );
  }

  const evaluation = evaluationFromInput(input, diagnostics);
  if (diagnostics.some((item) => item.severity !== "info")) {
    return failure(diagnostics);
  }

  const envelope: CanonicalEvaluationPersistenceEnvelope = {
    contract_version: CANONICAL_EVALUATION_PERSISTENCE_CONTRACT_VERSION,
    decision_kind: input.decision_kind,
    source: value.source,
    source_namespace: value.source_namespace,
    canonical_identity: value.canonical_identity,
    producer_decision_id: value.producer_decision_id,
    decision_timestamp: value.decision_timestamp,
    sample_type: value.sample_type,
    decision: structuredClone(value.decision),
    confidence: { ...value.confidence },
    versions: { ...value.versions },
    lineage,
    decision_context: {
      regime: textOrNull(value.context.regime),
      sector: textOrNull(value.context.sector),
      ticker: textOrNull(input.metrics_context?.ticker),
      setup: textOrNull(input.metrics_context?.setup),
      window: textOrNull(input.metrics_context?.window),
      captured_at: capturedAt as string,
      reason_codes: uniqueSorted([
        ...(input.context_reason_codes ?? []),
        ...(!value.context.sector && value.sample_type === "no_trade"
          ? ["sector_not_applicable_no_trade"]
          : []),
      ]),
    },
    provider_context: {
      provider: textOrNull(value.context.provider),
      source_timestamp: providerSourceTimestamp,
      freshness: textOrNull(value.context.freshness),
      candle_interval: candleInterval,
      primary_coverage: value.context.provider_coverage
        ? structuredClone(value.context.provider_coverage)
        : null,
      reason_codes: uniqueSorted([
        ...(input.provider_reason_codes ?? []),
        ...(value.context.provider_coverage?.reason_codes ?? []),
        ...(!value.context.provider_coverage
          ? ["provider_coverage_not_available"]
          : []),
      ]),
    },
    evaluation,
    idempotency_identity: `canonical_evaluation:v1:${value.canonical_identity}`,
    inactive_readiness_only: true,
  };

  return {
    status: "ready",
    value: envelope,
    diagnostics: diagnostics.sort((first, second) =>
      first.code.localeCompare(second.code),
    ),
  };
}

function validateEnvelopeConsistency(
  envelope: CanonicalEvaluationPersistenceEnvelope,
) {
  const diagnostics: CanonicalPersistenceDiagnostic[] = [];
  if (
    envelope.contract_version !==
    CANONICAL_EVALUATION_PERSISTENCE_CONTRACT_VERSION
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "persistence_contract_version_conflict",
        "conflict",
        "contract_version",
        "Envelope contract version differs from the active inactive-readiness contract.",
      ),
    );
  }
  if (
    envelope.canonical_identity !== envelope.decision.identity.value ||
    envelope.producer_decision_id !== envelope.decision.identity.decision_id ||
    envelope.decision_timestamp !== envelope.decision.identity.decided_at ||
    envelope.sample_type !== envelope.decision.sample_type ||
    JSON.stringify(envelope.confidence) !==
      JSON.stringify(envelope.decision.confidence) ||
    JSON.stringify(envelope.versions) !==
      JSON.stringify(envelope.decision.versions)
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "envelope_decision_core_conflict",
        "conflict",
        "decision",
        "Envelope flat decision fields differ from the embedded canonical decision.",
      ),
    );
  }
  if (envelope.decision_kind !== expectedDecisionKind(envelope.sample_type)) {
    diagnostics.push(
      persistenceDiagnostic(
        "envelope_decision_kind_conflict",
        "conflict",
        "decision_kind",
        "Envelope decision kind contradicts its sample type.",
      ),
    );
  }
  if (
    !supportedSourceNamespaces.includes(
      envelope.source_namespace as (typeof supportedSourceNamespaces)[number],
    )
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "unsupported_persistence_source_namespace",
        "invalid",
        "source_namespace",
        "Envelope source namespace has no inactive readback adapter.",
      ),
    );
  }
  const confidenceValidation = validateCanonicalConfidence(
    envelope.confidence,
  );
  if (!confidenceValidation.ok) {
    diagnostics.push(
      ...confidenceValidation.errors.map((code) =>
        persistenceDiagnostic(
          code,
          "invalid",
          "confidence",
          "Envelope confidence violates the canonical contract.",
        ),
      ),
    );
  }
  const versionsValidation = validateCanonicalEvaluationVersions(
    envelope.versions,
  );
  if (!versionsValidation.ok) {
    diagnostics.push(
      ...versionsValidation.errors.map((code) =>
        persistenceDiagnostic(
          code,
          "invalid",
          "versions",
          "Envelope versions violate the canonical contract.",
        ),
      ),
    );
  }
  validateLineage(
    envelope.sample_type,
    envelope.source_namespace,
    envelope.producer_decision_id,
    envelope.lineage,
    diagnostics,
  );
  validateTradePlan(envelope.evaluation.trade_plan, diagnostics);
  validateReplay(
    envelope.evaluation.replay,
    envelope.sample_type,
    diagnostics,
  );
  if (!canonicalInstant(envelope.decision_context.captured_at)) {
    diagnostics.push(
      persistenceDiagnostic(
        "invalid_decision_context_timestamp",
        "invalid",
        "decision_context.captured_at",
        "Envelope decision context timestamp is not canonical.",
      ),
    );
  }
  if (!textOrNull(envelope.decision_context.regime)) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_regime_at_decision",
        "missing",
        "decision_context.regime",
        "Envelope must retain regime at decision time.",
      ),
    );
  }
  if (
    !textOrNull(envelope.decision_context.sector) &&
    envelope.sample_type !== "no_trade"
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_sector_at_decision",
        "missing",
        "decision_context.sector",
        "Envelope must retain sector except for market-level no-trade.",
      ),
    );
  }
  const requiresEvaluationContext =
    envelope.evaluation.horizons.length > 0 ||
    envelope.sample_type === "historical_synthetic";
  if (
    requiresEvaluationContext &&
    !canonicalInstant(envelope.provider_context.source_timestamp)
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_provider_source_timestamp",
        "missing",
        "provider_context.source_timestamp",
        "Evaluable envelope requires provider source timestamp.",
      ),
    );
  }
  if (
    requiresEvaluationContext &&
    !textOrNull(envelope.provider_context.candle_interval)
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_candle_interval",
        "missing",
        "provider_context.candle_interval",
        "Evaluable envelope requires candle interval.",
      ),
    );
  }
  if (
    requiresEvaluationContext &&
    !textOrNull(envelope.evaluation.evaluator_input_identity)
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_evaluator_input_identity",
        "missing",
        "evaluation.evaluator_input_identity",
        "Evaluable envelope requires evaluator input identity.",
      ),
    );
  }
  if (
    envelope.evaluation.horizons.length > 0 &&
    !envelope.evaluation.trade_plan
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "missing_trade_plan",
        "missing",
        "evaluation.trade_plan",
        "Stored horizon rows require their evaluated trade plan.",
      ),
    );
  }
  const recomputedSelection = selectCanonicalPrimaryOutcome(
    envelope.evaluation.horizons.map((row) => ({
      horizon: row.horizon,
      coverage: row.coverage,
      outcome: row,
    })),
  );
  const storedSelection = envelope.evaluation.primary_selection;
  if (
    (storedSelection === null &&
      envelope.evaluation.horizons.length > 0) ||
    (storedSelection !== null &&
      JSON.stringify({
        status: storedSelection.status,
        primary_horizon: storedSelection.primary_horizon,
        canonical_outcome_count: storedSelection.canonical_outcome_count,
        reason_codes: storedSelection.reason_codes,
      }) !==
        JSON.stringify({
          status: recomputedSelection.status,
          primary_horizon: recomputedSelection.primary_horizon,
          canonical_outcome_count: recomputedSelection.canonical_outcome_count,
          reason_codes: recomputedSelection.reason_codes,
        }))
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "stored_primary_selection_conflict",
        "conflict",
        "evaluation.primary_selection",
        "Stored primary selection differs from deterministic 664A recomputation.",
      ),
    );
  }
  if (
    JSON.stringify(uniqueSorted(envelope.lineage.outcome_ids)) !==
    JSON.stringify(
      uniqueSorted(envelope.evaluation.horizons.map((row) => row.id)),
    )
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "lineage_outcome_ids_conflict",
        "conflict",
        "lineage.outcome_ids",
        "Outcome lineage differs from stored horizon rows.",
      ),
    );
  }
  if (
    envelope.idempotency_identity !==
    `canonical_evaluation:v1:${envelope.canonical_identity}`
  ) {
    diagnostics.push(
      persistenceDiagnostic(
        "idempotency_identity_conflict",
        "conflict",
        "idempotency_identity",
        "Idempotency identity must derive exactly from canonical identity.",
      ),
    );
  }
  if (envelope.inactive_readiness_only !== true) {
    diagnostics.push(
      persistenceDiagnostic(
        "inactive_readiness_boundary_conflict",
        "conflict",
        "inactive_readiness_only",
        "664C envelopes must remain explicitly inactive.",
      ),
    );
  }

  return diagnostics;
}

export function buildCanonicalEvaluationStoragePayload(
  envelope: CanonicalEvaluationPersistenceEnvelope,
): CanonicalPersistenceResult<CanonicalEvaluationStoragePayload> {
  const diagnostics = validateEnvelopeConsistency(envelope);
  if (diagnostics.length > 0) return failure(diagnostics);
  const coverage = envelope.provider_context.primary_coverage;
  const versions = envelope.versions;

  return {
    status: "ready",
    value: {
      storage_contract_version: CANONICAL_EVALUATION_STORAGE_PAYLOAD_VERSION,
      target_relation: "canonical_evaluation_decisions_proposed",
      write_enabled: false,
      canonical_identity: envelope.canonical_identity,
      producer_decision_id: envelope.producer_decision_id,
      source_namespace: envelope.source_namespace,
      decision_timestamp: envelope.decision_timestamp,
      decision_kind: envelope.decision_kind,
      sample_type: envelope.sample_type,
      candidate_id: envelope.lineage.candidate?.id ?? null,
      scan_run_id: envelope.lineage.scan_run?.id ?? null,
      scan_run_fingerprint: envelope.lineage.scan_run?.fingerprint ?? null,
      batch_id: envelope.lineage.batch?.id ?? null,
      batch_fingerprint: envelope.lineage.batch?.fingerprint ?? null,
      snapshot_id: envelope.lineage.snapshot?.id ?? null,
      snapshot_fingerprint: envelope.lineage.snapshot?.fingerprint ?? null,
      recommendation_id: envelope.lineage.recommendation_id,
      numeric_confidence: envelope.confidence.numeric_confidence,
      confidence_label: envelope.confidence.confidence_label,
      engine_version: versions.engine_version,
      scoring_version: versions.scoring_version,
      ranking_version: versions.ranking_version,
      setup_taxonomy_version: versions.setup_taxonomy_version,
      confidence_contract_version: versions.confidence_contract_version,
      evaluator_version: versions.evaluator_version,
      provider_contract_version: versions.provider_contract_version,
      git_commit: versions.git_commit,
      build_identity: versions.build_identity,
      regime_at_decision: envelope.decision_context.regime,
      sector_at_decision: envelope.decision_context.sector,
      provider: envelope.provider_context.provider,
      provider_source_timestamp: envelope.provider_context.source_timestamp,
      freshness: envelope.provider_context.freshness,
      candle_interval: envelope.provider_context.candle_interval,
      expected_candle_count: coverage?.expected_candle_count ?? null,
      observed_candle_count: coverage?.observed_candle_count ?? null,
      coverage_reason_codes: [...(coverage?.reason_codes ?? [])],
      evaluator_input_identity:
        envelope.evaluation.evaluator_input_identity,
      primary_horizon:
        envelope.evaluation.primary_selection?.primary_horizon ?? null,
      primary_outcome_id: envelope.evaluation.primary_outcome_id,
      diagnostic_outcome_ids: [
        ...envelope.evaluation.diagnostic_outcome_ids,
      ],
      lineage_json: structuredClone(envelope.lineage),
      versions_json: { ...versions },
      decision_context_json: structuredClone(envelope.decision_context),
      provider_context_json: structuredClone(envelope.provider_context),
      evaluation_json: structuredClone(envelope.evaluation),
      replay_metadata_json: envelope.evaluation.replay
        ? { ...envelope.evaluation.replay }
        : null,
      envelope_json: structuredClone(envelope),
      idempotency_key: envelope.idempotency_identity,
      inactive_readiness_only: true,
    },
    diagnostics: [],
  };
}

function storageConsistencyDiagnostics(
  payload: CanonicalEvaluationStoragePayload,
) {
  const envelope = payload.envelope_json;
  const diagnostics: CanonicalPersistenceDiagnostic[] = [];
  const conflicts: Array<[boolean, string]> = [
    [payload.canonical_identity !== envelope.canonical_identity, "canonical_identity"],
    [
      payload.producer_decision_id !== envelope.producer_decision_id,
      "producer_decision_id",
    ],
    [payload.sample_type !== envelope.sample_type, "sample_type"],
    [payload.decision_timestamp !== envelope.decision_timestamp, "decision_timestamp"],
    [payload.idempotency_key !== envelope.idempotency_identity, "idempotency_key"],
    [payload.write_enabled !== false, "write_enabled"],
    [payload.inactive_readiness_only !== true, "inactive_readiness_only"],
  ];

  for (const [conflict, field] of conflicts) {
    if (conflict) {
      diagnostics.push(
        persistenceDiagnostic(
          `storage_${field}_conflict`,
          "conflict",
          field,
          `Storage field ${field} differs from the canonical envelope.`,
        ),
      );
    }
  }

  return diagnostics;
}

function projectionMetadataFromEnvelope(
  envelope: CanonicalEvaluationPersistenceEnvelope,
): CanonicalProjectionMetadata {
  return {
    producer_decision_id: envelope.producer_decision_id,
    decision_timestamp: envelope.decision_timestamp,
    sample_type: envelope.sample_type,
    numeric_confidence: envelope.confidence.numeric_confidence,
    confidence_label: envelope.confidence.confidence_label,
    versions: { ...envelope.versions },
    candidate_id: envelope.lineage.candidate?.id ?? null,
    batch_id: envelope.lineage.batch?.id ?? null,
    batch_fingerprint: envelope.lineage.batch?.fingerprint ?? null,
    scan_run_id: envelope.lineage.scan_run?.id ?? null,
    scan_run_fingerprint: envelope.lineage.scan_run?.fingerprint ?? null,
    snapshot_id: envelope.lineage.snapshot?.id ?? null,
    snapshot_fingerprint: envelope.lineage.snapshot?.fingerprint ?? null,
    recommendation_id: envelope.lineage.recommendation_id,
    regime: envelope.decision_context.regime,
    sector: envelope.decision_context.sector,
    freshness: envelope.provider_context.freshness,
    provider: envelope.provider_context.provider,
    provider_coverage: envelope.provider_context.primary_coverage,
  };
}

function readbackSnapshot(
  envelope: CanonicalEvaluationPersistenceEnvelope,
): RecommendationSnapshot {
  const visible = envelope.sample_type === "visible";
  const research = envelope.sample_type === "research_only";

  return {
    id: envelope.lineage.snapshot?.id ?? "missing_snapshot_id",
    snapshot_fingerprint:
      envelope.lineage.snapshot?.fingerprint ?? "missing_snapshot_fingerprint",
    recommendation_id: envelope.lineage.recommendation_id,
    scan_run_id: envelope.lineage.scan_run?.id ?? null,
    company_name: null,
    recommended_at: envelope.decision_timestamp,
    app_timestamp: envelope.decision_timestamp,
    ticker: envelope.decision_context.ticker,
    window:
      envelope.decision_context.window === "morning" ||
      envelope.decision_context.window === "midday" ||
      envelope.decision_context.window === "power_hour"
        ? envelope.decision_context.window
        : "unknown",
    status: visible ? "visible" : research ? "hidden" : "unknown",
    source_mode: research ? "research_only" : "canonical_readback",
    data_mode: research ? "research_only" : "canonical_readback",
    market_session_phase: null,
    market_session_risk: null,
    market_session_source: null,
    is_visible: visible,
    is_demo: false,
    is_mock: false,
    is_real: false,
    entry: envelope.evaluation.trade_plan?.entry ?? null,
    entry_low: null,
    entry_high: null,
    stop: envelope.evaluation.trade_plan?.stop ?? null,
    target: envelope.evaluation.trade_plan?.target ?? null,
    side: envelope.evaluation.trade_plan?.side ?? "unknown",
    risk_per_share: null,
    reward_per_share: null,
    planned_risk_reward: null,
    confidence: envelope.confidence.numeric_confidence,
    score: null,
    rating: null,
    label: null,
    type: envelope.decision_context.setup,
    rationale: null,
    reason: null,
    catalyst: null,
    primary_risk: null,
    market_data_snapshot: null,
    quote_price: null,
    volume: null,
    liquidity: null,
    spread: null,
    freshness: envelope.provider_context.freshness,
    data_age_minutes: null,
    intake_quality_json: null,
    scan_observability_json: null,
    empty_state_json: null,
    quality_json: null,
    payload_json: {
      sample_type: envelope.sample_type,
      confidence_label: envelope.confidence.confidence_label,
      canonical_evaluation_versions: { ...envelope.versions },
      candidate_id: envelope.lineage.candidate?.id ?? null,
      market_regime: envelope.decision_context.regime,
      sector: envelope.decision_context.sector,
      provider: envelope.provider_context.provider,
    },
    was_taken: false,
    linked_position_id: null,
    created_at: envelope.decision_timestamp,
    updated_at: envelope.decision_timestamp,
  };
}

function coveragePayload(
  coverage: CanonicalCoverage,
  envelope: CanonicalEvaluationPersistenceEnvelope,
) {
  return {
    provider_status:
      coverage.status === "provider_gap"
        ? "gap"
        : envelope.provider_context.provider
          ? "available"
          : "not_requested",
    freshness:
      coverage.status === "stale"
        ? "stale"
        : envelope.provider_context.freshness === "fresh"
          ? "fresh"
          : "unknown",
    expected_candle_count: coverage.expected_candle_count,
    observed_candle_count: coverage.observed_candle_count,
    malformed_candle_count: coverage.reason_codes.includes("malformed_candles")
      ? 1
      : 0,
    blockers: coverage.reason_codes.includes("evaluation_blockers")
      ? ["stored_evaluation_blocker"]
      : [],
  };
}

function readbackOutcome(
  row: CanonicalProjectedOutcome,
  envelope: CanonicalEvaluationPersistenceEnvelope,
): RecommendationOutcome {
  const plan = envelope.evaluation.trade_plan;
  const complete = row.coverage.status === "complete";

  return {
    id: row.id,
    snapshot_id: row.snapshot_id,
    snapshot_fingerprint: row.snapshot_fingerprint,
    recommendation_id: row.recommendation_id,
    ticker: envelope.decision_context.ticker,
    side: plan?.side ?? "unknown",
    recommended_at: envelope.decision_timestamp,
    evaluated_at:
      envelope.provider_context.source_timestamp ?? envelope.decision_timestamp,
    horizon: row.horizon,
    status: row.status as RecommendationOutcome["status"],
    entry: plan?.entry ?? null,
    stop: plan?.stop ?? null,
    target: plan?.target ?? null,
    entry_triggered: row.entry_triggered,
    entry_triggered_at: null,
    target_hit: row.target_hit,
    target_hit_at: null,
    stop_hit: row.stop_hit,
    stop_hit_at: null,
    first_terminal_event:
      row.first_terminal_event as RecommendationOutcome["first_terminal_event"],
    best_price_after_recommendation: null,
    worst_price_after_recommendation: null,
    best_r: row.best_r,
    worst_r: row.worst_r,
    eod_price: null,
    eod_r: null,
    current_price: null,
    current_r: row.current_r,
    max_favorable_excursion: row.max_favorable_excursion,
    max_adverse_excursion: row.max_adverse_excursion,
    time_to_entry_minutes: null,
    time_to_target_minutes: null,
    time_to_stop_minutes: null,
    source: row.source,
    provider: row.provider,
    data_completeness: complete ? "complete" : "partial",
    warnings: [],
    blockers: row.coverage.reason_codes.includes("evaluation_blockers")
      ? ["stored_evaluation_blocker"]
      : [],
    payload_json: {
      canonical_provider_coverage: coveragePayload(row.coverage, envelope),
    },
    created_at:
      envelope.provider_context.source_timestamp ?? envelope.decision_timestamp,
    updated_at:
      envelope.provider_context.source_timestamp ?? envelope.decision_timestamp,
  };
}

function readbackCandidate(
  envelope: CanonicalEvaluationPersistenceEnvelope,
): ScannerCandidate {
  return {
    ticker: envelope.lineage.candidate?.id ?? "MISSING",
    company_name: "Canonical readback",
    sector: envelope.decision_context.sector ?? "unknown",
    mock_current_price: 0,
    mock_trend: "unknown",
    mock_volume_context: "unknown",
    mock_support: 0,
    mock_resistance: 0,
    mock_news_context: "unknown",
    intraday_indicator_stale:
      envelope.provider_context.freshness === "stale",
    reference_price_provider: envelope.provider_context.provider,
    reference_price_timestamp: envelope.provider_context.source_timestamp,
  };
}

function readbackBatch(
  envelope: CanonicalEvaluationPersistenceEnvelope,
): RecommendationBatch {
  const noTrade = envelope.sample_type === "no_trade";

  return {
    id: envelope.lineage.batch?.id ?? envelope.producer_decision_id,
    batch_fingerprint:
      envelope.lineage.batch?.fingerprint ?? envelope.producer_decision_id,
    trading_date: envelope.decision_timestamp.slice(0, 10),
    window: "unknown",
    batch_type: noTrade ? "official" : "diagnostic",
    status: noTrade ? "no_trade_valid" : "blocked",
    serving_decision: noTrade ? "no_trade_valid" : null,
    freshness_status: envelope.provider_context.freshness,
    published_at: null,
    served_at: null,
    observed_at: envelope.decision_timestamp,
    expires_at: null,
    scan_run_id: envelope.lineage.scan_run?.id ?? null,
    scan_run_fingerprint: envelope.lineage.scan_run?.fingerprint ?? null,
    recommendation_snapshot_ids: [],
    recommendation_snapshot_fingerprints: [],
    recommendation_tickers: [],
    recommendation_count: 0,
    strong_count: 0,
    valid_count: 0,
    experimental_count: 0,
    rejected_count:
      envelope.sample_type === "rejected_candidate" ? 1 : 0,
    incomplete_count: 0,
    unknown_tier_count: 0,
    target_status: noTrade ? "no_trade_valid" : "unknown",
    gap_to_target: null,
    overflow_above_target: null,
    source_mode: "canonical_readback",
    data_mode: "canonical_readback",
    market_session_phase: null,
    warnings: [],
    gaps: [],
    metadata_score: 100,
    payload_json: {
      sample_type: envelope.sample_type,
      canonical_evaluation_versions: { ...envelope.versions },
      market_regime: envelope.decision_context.regime,
      provider: envelope.provider_context.provider,
    },
    created_at: envelope.decision_timestamp,
    updated_at: envelope.decision_timestamp,
  };
}

function readbackBuildDiagnostic(
  envelope: CanonicalEvaluationPersistenceEnvelope,
): SelectedCandidateBuildDiagnostic {
  return {
    ticker: envelope.lineage.candidate?.id ?? "MISSING",
    side: envelope.evaluation.trade_plan?.side ?? "unknown",
    score: null,
    tier: null,
    setup_type: null,
    source: "canonical_readback",
    reference_price_status: envelope.provider_context.freshness,
    reference_price_source: envelope.provider_context.provider,
    reference_price_read_path: "canonical_readback",
    reference_price_age_minutes: null,
    vwap_status: null,
    momentum_status: null,
    volume_status: null,
    risk_geometry_status: null,
    enough_data_to_build_plan: false,
    built: false,
    rejection_reason: "not_selected_by_ranking",
    rejection_category: "quality",
    explanation: "Canonical rejected-candidate readback.",
  };
}

function readbackReplay(
  envelope: CanonicalEvaluationPersistenceEnvelope,
): ReplayWithSignalPackageResult {
  const plan = envelope.evaluation.trade_plan;
  const replay = envelope.evaluation.replay;

  return {
    execution_status: "replay_with_signal_package_completed",
    outcome_status: "open_at_window_end",
    counterfactual_result_available: envelope.evaluation.reproducible,
    source_verification:
      envelope.provider_context.provider ?? "canonical_readback",
    candidate_id: envelope.lineage.candidate?.id ?? "MISSING",
    source_type: "historical_synthetic",
    source_row_id: null,
    ticker: envelope.lineage.candidate?.id ?? "MISSING",
    interval: envelope.provider_context.candle_interval ?? "unknown",
    trading_day: envelope.decision_timestamp.slice(0, 10),
    analysis_cutoff: envelope.decision_timestamp,
    direction: plan?.side ?? "long",
    planned_entry: plan?.entry ?? 0,
    planned_stop: plan?.stop ?? 0,
    planned_target: plan?.target ?? 0,
    candles_read:
      envelope.provider_context.primary_coverage?.observed_candle_count ?? 0,
    candles_verified:
      envelope.provider_context.primary_coverage?.observed_candle_count ?? 0,
    lookahead_safety_passed: replay?.lookahead_safety_passed ?? false,
    entry_touched: false,
    stop_touched: false,
    target_touched: false,
    entry_timestamp: null,
    exit_timestamp: null,
    exit_reason: null,
    gross_price_move: null,
    gross_r_multiple: null,
    replay_executed: true,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendation_rows_mutated: false,
    supabase_write_executed: false,
    provider_call_executed: false,
    blockers: [],
    warnings: [],
  };
}

export function projectCanonicalStoragePayloadThrough664B(
  payload: CanonicalEvaluationStoragePayload,
): CanonicalPersistenceResult<CanonicalProjectionResult> {
  const diagnostics = storageConsistencyDiagnostics(payload);
  if (diagnostics.length > 0) return failure(diagnostics);
  const envelope = payload.envelope_json;
  const metadata = projectionMetadataFromEnvelope(envelope);
  let projection: CanonicalProjectionResult;

  if (envelope.source_namespace === "recommendation_snapshot") {
    const snapshot = readbackSnapshot(envelope);
    const outcomes = envelope.evaluation.horizons.map((row) =>
      readbackOutcome(row, envelope),
    );
    projection =
      outcomes.length > 0
        ? projectRecommendationOutcomeBundle({
            snapshot,
            outcomes,
            metadata,
          })
        : projectRecommendationSnapshotDecision({ snapshot, metadata });
  } else if (envelope.source_namespace === "scanner_candidate") {
    projection = projectScannerCandidateDecision({
      candidate: readbackCandidate(envelope),
      build_diagnostic:
        envelope.sample_type === "rejected_candidate"
          ? readbackBuildDiagnostic(envelope)
          : null,
      batch:
        envelope.sample_type === "rejected_candidate"
          ? readbackBatch(envelope)
          : null,
      metadata,
    });
  } else if (envelope.source_namespace === "recommendation_batch") {
    projection = projectRecommendationBatchDecision({
      batch: readbackBatch(envelope),
      metadata,
    });
  } else if (envelope.source_namespace === "historical_replay") {
    projection = projectHistoricalSyntheticDecision({
      replay: readbackReplay(envelope),
      metadata,
    });
  } else {
    return failure([
      persistenceDiagnostic(
        "unsupported_readback_source_namespace",
        "invalid",
        "source_namespace",
        "Storage payload cannot be projected through a 664B adapter.",
      ),
    ]);
  }

  return {
    status:
      projection.status === "mapped"
        ? "ready"
        : projection.status === "conflicting"
          ? "conflicting"
          : "unmappable",
    value: projection.status === "mapped" ? projection : null,
    diagnostics:
      projection.status === "mapped"
        ? []
        : diagnosticsFromProjection(projection),
  };
}

function comparableProjection(projection: CanonicalProjection) {
  return {
    source_namespace: projection.source_namespace,
    canonical_identity: projection.canonical_identity,
    producer_decision_id: projection.producer_decision_id,
    decision_timestamp: projection.decision_timestamp,
    sample_type: projection.sample_type,
    confidence: projection.confidence,
    versions: projection.versions,
    relations: projection.relations,
    context: projection.context,
    outcome_rows: [...projection.outcome_rows]
      .sort(
        (first, second) =>
          first.horizon.localeCompare(second.horizon) ||
          first.id.localeCompare(second.id),
      )
      .map((row) => ({
        id: row.id,
        snapshot_id: row.snapshot_id,
        snapshot_fingerprint: row.snapshot_fingerprint,
        recommendation_id: row.recommendation_id,
        horizon: row.horizon,
        status: row.status,
        coverage: row.coverage,
        source: row.source,
        provider: row.provider,
        entry_triggered: row.entry_triggered,
        target_hit: row.target_hit,
        stop_hit: row.stop_hit,
        first_terminal_event: row.first_terminal_event,
        best_r: row.best_r,
        worst_r: row.worst_r,
        current_r: row.current_r,
        max_favorable_excursion: row.max_favorable_excursion,
        max_adverse_excursion: row.max_adverse_excursion,
      })),
    primary: projection.primary_outcome
      ? {
          status: projection.primary_outcome.status,
          primary_horizon: projection.primary_outcome.primary_horizon,
          canonical_outcome_count:
            projection.primary_outcome.canonical_outcome_count,
          reason_codes: projection.primary_outcome.reason_codes,
        }
      : null,
  };
}

function projectionDifferenceCodes(
  expected: CanonicalProjection,
  actual: CanonicalProjection,
) {
  const expectedComparable = comparableProjection(expected);
  const actualComparable = comparableProjection(actual);
  const differences: string[] = [];

  for (const key of Object.keys(expectedComparable) as Array<
    keyof typeof expectedComparable
  >) {
    if (
      JSON.stringify(expectedComparable[key]) !==
      JSON.stringify(actualComparable[key])
    ) {
      differences.push(`round_trip_${String(key)}_mismatch`);
    }
  }

  return differences;
}

export function roundTripCanonicalEvaluationPersistence(
  envelope: CanonicalEvaluationPersistenceEnvelope,
): CanonicalPersistenceRoundTripResult {
  const storageResult = buildCanonicalEvaluationStoragePayload(envelope);
  if (storageResult.status !== "ready" || !storageResult.value) {
    return {
      status: storageResult.status,
      envelope,
      storage_payload: null,
      readback_projection: null,
      canonical_result_equal: false,
      difference_codes: ["storage_payload_not_ready"],
      diagnostics: storageResult.diagnostics,
    };
  }

  const readbackResult = projectCanonicalStoragePayloadThrough664B(
    storageResult.value,
  );
  if (readbackResult.status !== "ready" || !readbackResult.value) {
    return {
      status: readbackResult.status,
      envelope,
      storage_payload: storageResult.value,
      readback_projection: null,
      canonical_result_equal: false,
      difference_codes: ["adapter_readback_not_ready"],
      diagnostics: readbackResult.diagnostics,
    };
  }

  const expectedProjection: CanonicalProjection = {
    contract_version: "canonical_evaluation_projection_v1",
    source: envelope.source,
    source_namespace: envelope.source_namespace,
    producer_decision_id: envelope.producer_decision_id,
    decision_timestamp: envelope.decision_timestamp,
    canonical_identity: envelope.canonical_identity,
    sample_type: envelope.sample_type,
    decision: envelope.decision,
    confidence: envelope.confidence,
    versions: envelope.versions,
    relations: {
      candidate_id: envelope.lineage.candidate?.id ?? null,
      batch_id: envelope.lineage.batch?.id ?? null,
      batch_fingerprint: envelope.lineage.batch?.fingerprint ?? null,
      scan_run_id: envelope.lineage.scan_run?.id ?? null,
      scan_run_fingerprint: envelope.lineage.scan_run?.fingerprint ?? null,
      snapshot_id: envelope.lineage.snapshot?.id ?? null,
      snapshot_fingerprint: envelope.lineage.snapshot?.fingerprint ?? null,
      recommendation_id: envelope.lineage.recommendation_id,
      outcome_ids: envelope.lineage.outcome_ids,
    },
    context: {
      regime: envelope.decision_context.regime,
      sector: envelope.decision_context.sector,
      freshness: envelope.provider_context.freshness,
      provider: envelope.provider_context.provider,
      provider_coverage: envelope.provider_context.primary_coverage,
    },
    outcome_rows: envelope.evaluation.horizons,
    primary_outcome: envelope.evaluation.primary_selection,
    evaluation_readiness:
      envelope.evaluation.primary_selection?.status === "selected"
        ? "evaluable"
        : envelope.evaluation.horizons.length > 0
          ? "incomplete"
          : "not_evaluable",
  };
  const actualDifferences = projectionDifferenceCodes(
    expectedProjection,
    readbackResult.value.projection,
  );
  const diagnostics = actualDifferences.map((code) =>
    persistenceDiagnostic(
      code,
      "conflict",
      "round_trip",
      "Storage readback differs from the canonical persistence envelope.",
    ),
  );

  return {
    status: actualDifferences.length === 0 ? "ready" : "conflicting",
    envelope,
    storage_payload: storageResult.value,
    readback_projection: readbackResult.value,
    canonical_result_equal: actualDifferences.length === 0,
    difference_codes: actualDifferences,
    diagnostics,
  };
}

function emptyReadinessCount(): CanonicalLegacyReadinessCount {
  return {
    total: 0,
    ready: 0,
    conflicting: 0,
    unmappable: 0,
    incomplete_but_preservable: 0,
  };
}

function incrementReadiness(
  count: CanonicalLegacyReadinessCount,
  status: CanonicalLegacyReadinessStatus,
) {
  count.total += 1;
  count[status] += 1;
}

function rawPreservationReady(input: CanonicalLegacyReadinessInput) {
  return (
    input.preservation_policy === "raw_audit_only" &&
    Boolean(textOrNull(input.source_record_id)) &&
    Boolean(canonicalInstant(input.observed_at)) &&
    input.raw_payload !== null
  );
}

export function analyzeCanonicalLegacyReadinessItem(
  input: CanonicalLegacyReadinessInput,
): CanonicalLegacyReadinessItem {
  const projection = input.projection;
  const projectionReasons = projection
    ? projection.diagnostics.map((item) => item.code)
    : ["missing_projection"];
  const envelopeReasons =
    input.envelope_result?.diagnostics.map((item) => item.code) ?? [];
  let status: CanonicalLegacyReadinessStatus;

  if (
    projection?.status === "conflicting" ||
    input.envelope_result?.status === "conflicting"
  ) {
    status = "conflicting";
  } else if (
    projection?.status === "mapped" &&
    (!input.envelope_result || input.envelope_result.status === "ready")
  ) {
    const qualityIncomplete =
      input.quality_metrics_required &&
      input.envelope_result?.value?.evaluation.quality_metrics_eligible !== true;
    status =
      qualityIncomplete && rawPreservationReady(input)
        ? "incomplete_but_preservable"
        : qualityIncomplete
          ? "unmappable"
          : "ready";
  } else if (rawPreservationReady(input)) {
    status = "incomplete_but_preservable";
  } else {
    status = "unmappable";
  }

  const reasonCodes = uniqueSorted([
    ...(input.reason_codes ?? []),
    ...projectionReasons,
    ...envelopeReasons,
    ...(status === "incomplete_but_preservable"
      ? ["legacy_raw_audit_preservation_only"]
      : []),
  ]);

  return {
    fixture_id: input.fixture_id,
    source: input.source,
    sample_type: projection?.projection.sample_type ?? "unknown",
    status,
    canonical_identity: projection?.projection.canonical_identity ?? null,
    source_record_id: textOrNull(input.source_record_id),
    reason_codes: reasonCodes,
  };
}

export function buildCanonicalLegacyReadinessReport(
  inputs: CanonicalLegacyReadinessInput[],
): CanonicalLegacyReadinessReport {
  const items = inputs
    .map(analyzeCanonicalLegacyReadinessItem)
    .sort((first, second) => first.fixture_id.localeCompare(second.fixture_id));
  const totals = emptyReadinessCount();
  const bySource = new Map<string, CanonicalLegacyReadinessCount>();
  const bySampleType = new Map<string, CanonicalLegacyReadinessCount>();
  const reasonCodeCounts = new Map<string, number>();

  for (const item of items) {
    incrementReadiness(totals, item.status);
    const sourceCount = bySource.get(item.source) ?? emptyReadinessCount();
    const sampleCount =
      bySampleType.get(item.sample_type) ?? emptyReadinessCount();
    incrementReadiness(sourceCount, item.status);
    incrementReadiness(sampleCount, item.status);
    bySource.set(item.source, sourceCount);
    bySampleType.set(item.sample_type, sampleCount);
    for (const reasonCode of item.reason_codes) {
      reasonCodeCounts.set(
        reasonCode,
        (reasonCodeCounts.get(reasonCode) ?? 0) + 1,
      );
    }
  }

  return {
    contract_version: CANONICAL_EVALUATION_PERSISTENCE_CONTRACT_VERSION,
    fixture_only: true,
    production_rows_read: 0,
    production_rows_written: 0,
    totals,
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
    reason_code_counts: Object.fromEntries(
      Array.from(reasonCodeCounts.entries()).sort(([first], [second]) =>
        first.localeCompare(second),
      ),
    ),
    items,
  };
}

export const canonicalEvaluationSchemaProposal = {
  proposal_version: CANONICAL_EVALUATION_SCHEMA_PROPOSAL_VERSION,
  status: "proposal_only",
  migration_created: false,
  writer_enabled: false,
  dual_write_enabled: false,
  target_relation: "canonical_evaluation_decisions",
  fields: [
    { name: "canonical_identity", type: "text", nullable: true },
    { name: "producer_decision_id", type: "text", nullable: true },
    { name: "source_namespace", type: "text", nullable: true },
    { name: "decision_timestamp", type: "timestamptz", nullable: true },
    { name: "decision_kind", type: "text", nullable: true },
    { name: "sample_type", type: "text", nullable: true },
    { name: "candidate_id", type: "text", nullable: true },
    { name: "scan_run_id", type: "text", nullable: true },
    { name: "scan_run_fingerprint", type: "text", nullable: true },
    { name: "batch_id", type: "text", nullable: true },
    { name: "batch_fingerprint", type: "text", nullable: true },
    { name: "snapshot_id", type: "text", nullable: true },
    { name: "snapshot_fingerprint", type: "text", nullable: true },
    { name: "recommendation_id", type: "text", nullable: true },
    { name: "numeric_confidence", type: "double precision", nullable: true },
    { name: "confidence_label", type: "text", nullable: true },
    { name: "regime_at_decision", type: "text", nullable: true },
    { name: "sector_at_decision", type: "text", nullable: true },
    { name: "provider", type: "text", nullable: true },
    { name: "provider_source_timestamp", type: "timestamptz", nullable: true },
    { name: "freshness", type: "text", nullable: true },
    { name: "candle_interval", type: "text", nullable: true },
    { name: "expected_candle_count", type: "integer", nullable: true },
    { name: "observed_candle_count", type: "integer", nullable: true },
    { name: "evaluator_input_identity", type: "text", nullable: true },
    { name: "primary_horizon", type: "text", nullable: true },
    { name: "primary_outcome_id", type: "text", nullable: true },
    { name: "versions_json", type: "jsonb", nullable: true },
    { name: "lineage_json", type: "jsonb", nullable: true },
    { name: "decision_context_json", type: "jsonb", nullable: true },
    { name: "provider_context_json", type: "jsonb", nullable: true },
    { name: "evaluation_json", type: "jsonb", nullable: true },
    { name: "replay_metadata_json", type: "jsonb", nullable: true },
    { name: "envelope_json", type: "jsonb", nullable: true },
  ],
  constraints: [
    "sample_type is null or in canonical six-value set",
    "numeric_confidence is null or between 0 and 1 inclusive",
    "confidence_label is null or in low/medium/high",
    "observed_candle_count and expected_candle_count are null or non-negative",
    "write activation requires canonical_identity, producer_decision_id, source_namespace, decision_timestamp, sample_type, and complete versions",
    "no_trade cannot reference snapshot, recommendation, or outcome lineage",
    "rejected_candidate requires candidate, scan-run, and batch lineage",
    "primary_horizon is null or 15m/30m/60m",
  ],
  indexes: [
    "unique partial index on canonical_identity where canonical_identity is not null",
    "unique partial index on evaluator_input_identity where evaluator_input_identity is not null",
    "btree on decision_timestamp",
    "btree on sample_type and decision_timestamp",
    "btree on candidate_id, scan_run_id, batch_id, snapshot_id, recommendation_id",
    "GIN on lineage_json, versions_json, evaluation_json",
  ],
  lineage_keys: [
    "candidate_id",
    "scan_run_id",
    "scan_run_fingerprint",
    "batch_id",
    "batch_fingerprint",
    "snapshot_id",
    "snapshot_fingerprint",
    "recommendation_id",
    "primary_outcome_id",
  ],
  idempotency: {
    key: "canonical_evaluation:v1:<canonical_identity>",
    conflict_policy: "reject_semantic_difference_never_overwrite",
    retry_policy: "identical_payload_is_no_effect",
  },
  rollback_no_effect: {
    additive_nullable_only: true,
    existing_writers_unchanged: true,
    existing_readers_unchanged: true,
    inactive_dual_write_default: true,
    rollback:
      "disable future gated writer and ignore/drop additive relation without touching legacy rows",
  },
} as const;
