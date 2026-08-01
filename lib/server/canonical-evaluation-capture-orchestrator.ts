import "server-only";

import {
  projectRecommendationOutcomeBundle,
  type CanonicalProjection,
  type CanonicalProjectionMetadata,
  type CanonicalProjectionResult,
} from "@/lib/canonical-evaluation-projection-adapters";
import {
  buildCanonicalEvaluationPersistenceEnvelope,
  buildCanonicalEvaluationStoragePayload,
  projectCanonicalStoragePayloadThrough664B,
  type CanonicalEvaluationPersistenceEnvelope,
  type CanonicalEvaluationStoragePayload,
  type CanonicalPersistenceTradePlan,
} from "@/lib/canonical-evaluation-persistence-contract";
import type { RecommendationBatch } from "@/lib/recommendation-batch-memory";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  CANONICAL_EVALUATION_WRITER_FEATURE_FLAG,
  CANONICAL_EVALUATION_WRITER_KILL_SWITCH,
  digestCanonicalEvaluationSemanticPayload,
  resolveCanonicalEvaluationWriterGate,
  validateCanonicalEvaluationStorageWritePayload,
  writeCanonicalEvaluationStorage,
  type CanonicalEvaluationStorageDatabase,
  type CanonicalEvaluationStorageInsert,
  type CanonicalEvaluationStorageWriterResult,
  type CanonicalEvaluationWriterGateEnvironment,
} from "@/lib/server/canonical-evaluation-storage-writer";

export const CANONICAL_EVALUATION_CAPTURE_ORCHESTRATOR_VERSION =
  "canonical_evaluation_capture_orchestrator_v1" as const;
export const CANONICAL_EVALUATION_CAPTURE_SOURCE =
  "completed_recommendation_snapshot_outcome_bundle" as const;

export type CompletedRecommendationOutcomeCaptureInput = {
  snapshot: RecommendationSnapshot;
  outcomes: RecommendationOutcome[];
  batch?: RecommendationBatch | null;
  scan_run?: RecommendationScanRun | null;
  metadata: CanonicalProjectionMetadata;
  provider_source_timestamp: string;
  candle_interval: string;
  evaluator_input_identity: string;
  trade_plan: CanonicalPersistenceTradePlan;
  context_reason_codes?: string[];
  provider_reason_codes?: string[];
  evaluation_reason_codes?: string[];
};

export type CanonicalEvaluationCaptureStatus =
  | "disabled"
  | "kill_switch_engaged"
  | "conflicting"
  | "unmappable"
  | "incomplete_not_quality_eligible"
  | "would_insert"
  | "inserted"
  | "idempotent_no_effect"
  | "semantic_conflict";

export type CanonicalEvaluationCapturePlan = {
  orchestrator_version: typeof CANONICAL_EVALUATION_CAPTURE_ORCHESTRATOR_VERSION;
  source: typeof CANONICAL_EVALUATION_CAPTURE_SOURCE;
  projection: CanonicalProjectionResult;
  envelope: CanonicalEvaluationPersistenceEnvelope;
  storage_payload: CanonicalEvaluationStoragePayload;
  prepared_semantic_sha256: string;
};

export type CanonicalEvaluationCapturePreparation =
  | {
      status: "would_insert";
      ok: true;
      plan: CanonicalEvaluationCapturePlan;
      reason_codes: [];
    }
  | {
      status:
        | "conflicting"
        | "unmappable"
        | "incomplete_not_quality_eligible";
      ok: false;
      plan: null;
      reason_codes: string[];
    };

export type CanonicalEvaluationCaptureReadbackResult =
  | {
      status: "found";
      row: CanonicalEvaluationStorageInsert;
    }
  | {
      status: "not_found";
      row: null;
    }
  | {
      status: "error";
      row: null;
      error_code: string;
    };

export type CanonicalEvaluationCaptureDatabase =
  CanonicalEvaluationStorageDatabase & {
    scope: "disposable_local_postgres";
    readCanonicalEvaluation(
      canonicalIdentity: string,
    ): Promise<CanonicalEvaluationCaptureReadbackResult>;
  };

export type CanonicalEvaluationCaptureDatabaseFactory =
  () => CanonicalEvaluationCaptureDatabase | null;

export type CanonicalEvaluationCaptureParity = {
  status: "matched" | "conflicting" | "not_performed";
  canonical_identity_equal: boolean;
  sample_type_equal: boolean;
  confidence_equal: boolean;
  lineage_equal: boolean;
  versions_equal: boolean;
  primary_outcome_equal: boolean;
  quality_eligibility_equal: boolean;
  diagnostic_horizon_count_equal: boolean;
  difference_codes: string[];
};

export type CanonicalEvaluationCaptureDatabaseActivity = {
  client_constructions: number;
  identity_reads: number;
  full_readbacks: number;
  insert_attempts: number;
};

export type CanonicalEvaluationCaptureResult = {
  status: CanonicalEvaluationCaptureStatus;
  ok: boolean;
  orchestrator_version: typeof CANONICAL_EVALUATION_CAPTURE_ORCHESTRATOR_VERSION;
  source: typeof CANONICAL_EVALUATION_CAPTURE_SOURCE;
  canonical_identity: string | null;
  reason_codes: string[];
  database_activity: CanonicalEvaluationCaptureDatabaseActivity;
  parity: CanonicalEvaluationCaptureParity;
  writer_result: CanonicalEvaluationStorageWriterResult | null;
};

export type CanonicalEvaluationCaptureOptions = {
  env?: CanonicalEvaluationWriterGateEnvironment;
  mode?: "diagnostic" | "capture";
  databaseFactory?: CanonicalEvaluationCaptureDatabaseFactory;
};

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isExplicit(value: unknown) {
  return value !== undefined;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function emptyParity(): CanonicalEvaluationCaptureParity {
  return {
    status: "not_performed",
    canonical_identity_equal: false,
    sample_type_equal: false,
    confidence_equal: false,
    lineage_equal: false,
    versions_equal: false,
    primary_outcome_equal: false,
    quality_eligibility_equal: false,
    diagnostic_horizon_count_equal: false,
    difference_codes: [],
  };
}

function emptyActivity(): CanonicalEvaluationCaptureDatabaseActivity {
  return {
    client_constructions: 0,
    identity_reads: 0,
    full_readbacks: 0,
    insert_attempts: 0,
  };
}

function baseResult(
  status: CanonicalEvaluationCaptureStatus,
  canonicalIdentity: string | null,
  reasonCodes: string[],
): CanonicalEvaluationCaptureResult {
  return {
    status,
    ok:
      status === "would_insert" ||
      status === "inserted" ||
      status === "idempotent_no_effect",
    orchestrator_version: CANONICAL_EVALUATION_CAPTURE_ORCHESTRATOR_VERSION,
    source: CANONICAL_EVALUATION_CAPTURE_SOURCE,
    canonical_identity: canonicalIdentity,
    reason_codes: uniqueSorted(reasonCodes),
    database_activity: emptyActivity(),
    parity: emptyParity(),
    writer_result: null,
  };
}

function explicitSourceDiagnostics(
  input: CompletedRecommendationOutcomeCaptureInput,
) {
  const missing: string[] = [];
  const conflicts: string[] = [];
  const { metadata, snapshot } = input;

  if (!isText(metadata.producer_decision_id)) {
    missing.push("missing_explicit_producer_decision_id");
  }
  if (!isText(metadata.decision_timestamp)) {
    missing.push("missing_explicit_decision_timestamp");
  }
  if (
    metadata.sample_type !== "visible" &&
    metadata.sample_type !== "research_only"
  ) {
    conflicts.push("unsupported_completed_bundle_sample_type");
  }
  if (!isExplicit(metadata.numeric_confidence)) {
    missing.push("missing_explicit_numeric_confidence");
  }
  if (!isExplicit(metadata.confidence_label)) {
    missing.push("missing_explicit_confidence_label");
  }
  if (!metadata.versions) {
    missing.push("missing_explicit_versions");
  }
  if (!isText(metadata.candidate_id)) {
    missing.push("missing_explicit_candidate_id");
  }
  if (!isText(metadata.batch_id) || !isText(metadata.batch_fingerprint)) {
    missing.push("missing_explicit_batch_lineage");
  }
  if (
    !isText(metadata.scan_run_id) ||
    !isText(metadata.scan_run_fingerprint)
  ) {
    missing.push("missing_explicit_scan_run_lineage");
  }
  if (!isText(metadata.snapshot_id)) {
    missing.push("missing_explicit_snapshot_id");
  }
  if (!isText(metadata.snapshot_fingerprint)) {
    missing.push("missing_explicit_snapshot_fingerprint");
  }
  if (!isText(metadata.recommendation_id)) {
    missing.push("missing_explicit_recommendation_id");
  }
  if (!isText(input.provider_source_timestamp)) {
    missing.push("missing_provider_source_timestamp");
  }
  if (!isText(input.candle_interval)) {
    missing.push("missing_candle_interval");
  }
  if (!isText(input.evaluator_input_identity)) {
    missing.push("missing_evaluator_input_identity");
  }

  if (
    isText(metadata.producer_decision_id) &&
    snapshot.recommendation_id !== metadata.producer_decision_id
  ) {
    conflicts.push("producer_decision_id_snapshot_conflict");
  }
  if (
    isText(metadata.snapshot_id) &&
    metadata.snapshot_id !== snapshot.id
  ) {
    conflicts.push("snapshot_id_conflict");
  }
  if (
    isText(metadata.snapshot_fingerprint) &&
    metadata.snapshot_fingerprint !== snapshot.snapshot_fingerprint
  ) {
    conflicts.push("snapshot_fingerprint_conflict");
  }
  if (
    isText(metadata.recommendation_id) &&
    metadata.recommendation_id !== snapshot.recommendation_id
  ) {
    conflicts.push("recommendation_lineage_conflict");
  }

  return {
    missing: uniqueSorted(missing),
    conflicts: uniqueSorted(conflicts),
  };
}

function projectionReasonCodes(projection: CanonicalProjectionResult) {
  return uniqueSorted(projection.diagnostics.map((item) => item.code));
}

export function prepareCompletedRecommendationOutcomeCapture(
  sourceInput: CompletedRecommendationOutcomeCaptureInput,
): CanonicalEvaluationCapturePreparation {
  let input: CompletedRecommendationOutcomeCaptureInput;

  try {
    input = structuredClone(sourceInput);
  } catch {
    return {
      status: "unmappable",
      ok: false,
      plan: null,
      reason_codes: ["source_bundle_not_structured_cloneable"],
    };
  }

  if (!Array.isArray(input.outcomes) || input.outcomes.length === 0) {
    return {
      status: "incomplete_not_quality_eligible",
      ok: false,
      plan: null,
      reason_codes: ["completed_bundle_has_no_outcomes"],
    };
  }

  const explicitDiagnostics = explicitSourceDiagnostics(input);
  if (explicitDiagnostics.conflicts.length > 0) {
    return {
      status: "conflicting",
      ok: false,
      plan: null,
      reason_codes: explicitDiagnostics.conflicts,
    };
  }
  if (explicitDiagnostics.missing.length > 0) {
    return {
      status: "unmappable",
      ok: false,
      plan: null,
      reason_codes: explicitDiagnostics.missing,
    };
  }

  const projection = projectRecommendationOutcomeBundle({
    snapshot: input.snapshot,
    outcomes: input.outcomes,
    batch: input.batch,
    scan_run: input.scan_run,
    metadata: input.metadata,
  });

  if (projection.status === "conflicting") {
    return {
      status: "conflicting",
      ok: false,
      plan: null,
      reason_codes: projectionReasonCodes(projection),
    };
  }
  if (projection.status !== "mapped") {
    return {
      status: "unmappable",
      ok: false,
      plan: null,
      reason_codes: projectionReasonCodes(projection),
    };
  }
  if (
    projection.projection.source !== "recommendation_outcome_bundle" ||
    projection.projection.evaluation_readiness !== "evaluable" ||
    projection.projection.primary_outcome?.status !== "selected" ||
    projection.projection.primary_outcome.primary_outcome?.coverage.status !==
      "complete"
  ) {
    return {
      status: "incomplete_not_quality_eligible",
      ok: false,
      plan: null,
      reason_codes: uniqueSorted([
        "completed_primary_outcome_unavailable",
        ...projection.projection.primary_outcome?.reason_codes ?? [],
      ]),
    };
  }

  const envelopeResult = buildCanonicalEvaluationPersistenceEnvelope({
    projection,
    decision_kind: "recommendation",
    metrics_context: {
      ticker: input.snapshot.ticker,
      setup: input.snapshot.type,
      window: input.snapshot.window,
    },
    context_reason_codes: input.context_reason_codes,
    provider_source_timestamp: input.provider_source_timestamp,
    candle_interval: input.candle_interval,
    provider_reason_codes: input.provider_reason_codes,
    evaluator_input_identity: input.evaluator_input_identity,
    trade_plan: input.trade_plan,
    evaluation_reason_codes: input.evaluation_reason_codes,
  });

  if (!envelopeResult.value || envelopeResult.status !== "ready") {
    return {
      status:
        envelopeResult.status === "conflicting"
          ? "conflicting"
          : "unmappable",
      ok: false,
      plan: null,
      reason_codes: uniqueSorted(
        envelopeResult.diagnostics.map((item) => item.code),
      ),
    };
  }
  if (!envelopeResult.value.evaluation.quality_metrics_eligible) {
    return {
      status: "incomplete_not_quality_eligible",
      ok: false,
      plan: null,
      reason_codes: uniqueSorted([
        "canonical_envelope_not_quality_eligible",
        ...envelopeResult.value.evaluation.reason_codes,
      ]),
    };
  }

  const storageResult = buildCanonicalEvaluationStoragePayload(
    envelopeResult.value,
  );
  if (!storageResult.value || storageResult.status !== "ready") {
    return {
      status:
        storageResult.status === "conflicting"
          ? "conflicting"
          : "unmappable",
      ok: false,
      plan: null,
      reason_codes: uniqueSorted(
        storageResult.diagnostics.map((item) => item.code),
      ),
    };
  }

  const writerValidation = validateCanonicalEvaluationStorageWritePayload(
    storageResult.value,
  );
  if (!writerValidation.ok) {
    return {
      status: "conflicting",
      ok: false,
      plan: null,
      reason_codes: uniqueSorted([
        "writer_payload_not_ready",
        ...writerValidation.reason_codes,
      ]),
    };
  }

  return {
    status: "would_insert",
    ok: true,
    plan: {
      orchestrator_version:
        CANONICAL_EVALUATION_CAPTURE_ORCHESTRATOR_VERSION,
      source: CANONICAL_EVALUATION_CAPTURE_SOURCE,
      projection,
      envelope: structuredClone(envelopeResult.value),
      storage_payload: structuredClone(storageResult.value),
      prepared_semantic_sha256:
        writerValidation.semantic_payload_sha256,
    },
    reason_codes: [],
  };
}

function storagePayloadFromReadback(
  row: CanonicalEvaluationStorageInsert,
): CanonicalEvaluationStoragePayload {
  return {
    storage_contract_version: row.storage_contract_version,
    target_relation: "canonical_evaluation_decisions_proposed",
    write_enabled: false,
    canonical_identity: row.canonical_identity,
    producer_decision_id: row.producer_decision_id,
    source_namespace: row.source_namespace,
    decision_timestamp: row.decision_timestamp,
    decision_kind: row.decision_kind,
    sample_type: row.sample_type,
    candidate_id: row.candidate_id,
    scan_run_id: row.scan_run_id,
    scan_run_fingerprint: row.scan_run_fingerprint,
    batch_id: row.batch_id,
    batch_fingerprint: row.batch_fingerprint,
    snapshot_id: row.snapshot_id,
    snapshot_fingerprint: row.snapshot_fingerprint,
    recommendation_id: row.recommendation_id,
    numeric_confidence: row.numeric_confidence,
    confidence_label: row.confidence_label,
    engine_version: row.engine_version,
    scoring_version: row.scoring_version,
    ranking_version: row.ranking_version,
    setup_taxonomy_version: row.setup_taxonomy_version,
    confidence_contract_version: row.confidence_contract_version,
    evaluator_version: row.evaluator_version,
    provider_contract_version: row.provider_contract_version,
    git_commit: row.git_commit,
    build_identity: row.build_identity,
    regime_at_decision: row.regime_at_decision,
    sector_at_decision: row.sector_at_decision,
    provider: row.provider,
    provider_source_timestamp: row.provider_source_timestamp,
    freshness: row.freshness,
    candle_interval: row.candle_interval,
    expected_candle_count: row.expected_candle_count,
    observed_candle_count: row.observed_candle_count,
    coverage_reason_codes: [...row.coverage_reason_codes],
    evaluator_input_identity: row.evaluator_input_identity,
    primary_horizon: row.primary_horizon,
    primary_outcome_id: row.primary_outcome_id,
    diagnostic_outcome_ids: [...row.diagnostic_outcome_ids],
    lineage_json: structuredClone(row.lineage_json),
    versions_json: structuredClone(row.versions_json),
    decision_context_json: structuredClone(row.decision_context_json),
    provider_context_json: structuredClone(row.provider_context_json),
    evaluation_json: structuredClone(row.evaluation_json),
    replay_metadata_json: row.replay_metadata_json
      ? structuredClone(row.replay_metadata_json)
      : null,
    envelope_json: structuredClone(row.persistence_envelope),
    idempotency_key: row.idempotency_key,
    inactive_readiness_only: true,
  };
}

function expectedRelations(
  envelope: CanonicalEvaluationPersistenceEnvelope,
) {
  return {
    candidate_id: envelope.lineage.candidate?.id ?? null,
    batch_id: envelope.lineage.batch?.id ?? null,
    batch_fingerprint: envelope.lineage.batch?.fingerprint ?? null,
    scan_run_id: envelope.lineage.scan_run?.id ?? null,
    scan_run_fingerprint: envelope.lineage.scan_run?.fingerprint ?? null,
    snapshot_id: envelope.lineage.snapshot?.id ?? null,
    snapshot_fingerprint: envelope.lineage.snapshot?.fingerprint ?? null,
    recommendation_id: envelope.lineage.recommendation_id,
    outcome_ids: [...envelope.lineage.outcome_ids],
  };
}

function primarySignature(
  projection: CanonicalProjection,
) {
  return {
    status: projection.primary_outcome?.status ?? null,
    horizon: projection.primary_outcome?.primary_horizon ?? null,
    outcome_id:
      projection.primary_outcome?.primary_outcome?.outcome.id ?? null,
    canonical_outcome_count:
      projection.primary_outcome?.canonical_outcome_count ?? 0,
  };
}

function expectedPrimarySignature(
  envelope: CanonicalEvaluationPersistenceEnvelope,
) {
  return {
    status: envelope.evaluation.primary_selection?.status ?? null,
    horizon:
      envelope.evaluation.primary_selection?.primary_horizon ?? null,
    outcome_id: envelope.evaluation.primary_outcome_id,
    canonical_outcome_count:
      envelope.evaluation.primary_selection?.canonical_outcome_count ?? 0,
  };
}

function canonicalJsonValue(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (Array.isArray(value)) {
    return value.map((item) => canonicalJsonValue(item));
  }
  if (typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(record)
      .sort()
      .map((key) => [key, canonicalJsonValue(record[key])]),
  );
}

function jsonEqual(first: unknown, second: unknown) {
  return (
    JSON.stringify(canonicalJsonValue(first)) ===
    JSON.stringify(canonicalJsonValue(second))
  );
}

function parityFromReadback(
  plan: CanonicalEvaluationCapturePlan,
  row: CanonicalEvaluationStorageInsert,
): CanonicalEvaluationCaptureParity {
  let payload: CanonicalEvaluationStoragePayload;

  try {
    payload = storagePayloadFromReadback(structuredClone(row));
  } catch {
    return {
      ...emptyParity(),
      status: "conflicting",
      difference_codes: ["stored_row_not_structured_cloneable"],
    };
  }

  const validation =
    validateCanonicalEvaluationStorageWritePayload(payload);
  if (!validation.ok) {
    return {
      ...emptyParity(),
      status: "conflicting",
      difference_codes: uniqueSorted([
        "stored_payload_not_canonical",
        ...validation.reason_codes,
      ]),
    };
  }

  const adapterReadback =
    projectCanonicalStoragePayloadThrough664B(payload);
  if (
    !adapterReadback.value ||
    adapterReadback.status !== "ready" ||
    adapterReadback.value.status !== "mapped"
  ) {
    return {
      ...emptyParity(),
      status: "conflicting",
      difference_codes: uniqueSorted([
        "stored_adapter_readback_not_mapped",
        ...adapterReadback.diagnostics.map((item) => item.code),
      ]),
    };
  }

  const actual = adapterReadback.value.projection;
  const expected = plan.envelope;
  const checks = {
    canonical_identity_equal:
      actual.canonical_identity === expected.canonical_identity,
    sample_type_equal: actual.sample_type === expected.sample_type,
    confidence_equal: jsonEqual(actual.confidence, expected.confidence),
    lineage_equal: jsonEqual(
      actual.relations,
      expectedRelations(expected),
    ),
    versions_equal: jsonEqual(actual.versions, expected.versions),
    primary_outcome_equal: jsonEqual(
      primarySignature(actual),
      expectedPrimarySignature(expected),
    ),
    quality_eligibility_equal:
      payload.envelope_json.evaluation.quality_metrics_eligible ===
      expected.evaluation.quality_metrics_eligible,
    diagnostic_horizon_count_equal:
      actual.outcome_rows.length === expected.evaluation.horizons.length,
  };
  const differenceCodes = Object.entries(checks)
    .filter(([, equal]) => !equal)
    .map(([field]) => `readback_${field.replace(/_equal$/, "")}_mismatch`)
    .sort();

  return {
    status: differenceCodes.length === 0 ? "matched" : "conflicting",
    ...checks,
    difference_codes: differenceCodes,
  };
}

function validatePlanIntegrity(plan: CanonicalEvaluationCapturePlan) {
  const reasonCodes: string[] = [];
  const writerValidation = validateCanonicalEvaluationStorageWritePayload(
    plan.storage_payload,
  );

  if (!writerValidation.ok) {
    reasonCodes.push(
      "prepared_storage_payload_not_ready",
      ...writerValidation.reason_codes,
    );
  } else if (
    writerValidation.semantic_payload_sha256 !==
    plan.prepared_semantic_sha256
  ) {
    reasonCodes.push("prepared_semantic_digest_conflict");
  }

  if (
    digestCanonicalEvaluationSemanticPayload(plan.envelope) !==
    plan.prepared_semantic_sha256
  ) {
    reasonCodes.push("prepared_envelope_tampered");
  }
  if (
    plan.storage_payload.canonical_identity !==
      plan.envelope.canonical_identity ||
    plan.projection.projection.canonical_identity !==
      plan.envelope.canonical_identity
  ) {
    reasonCodes.push("prepared_identity_conflict");
  }

  return uniqueSorted(reasonCodes);
}

function countedDatabase(
  database: CanonicalEvaluationCaptureDatabase,
  activity: CanonicalEvaluationCaptureDatabaseActivity,
): CanonicalEvaluationCaptureDatabase {
  return {
    scope: "disposable_local_postgres",
    async readByCanonicalIdentity(canonicalIdentity) {
      activity.identity_reads += 1;
      return database.readByCanonicalIdentity(canonicalIdentity);
    },
    async insert(value) {
      activity.insert_attempts += 1;
      return database.insert(value);
    },
    async readCanonicalEvaluation(canonicalIdentity) {
      activity.full_readbacks += 1;
      return database.readCanonicalEvaluation(canonicalIdentity);
    },
  };
}

function mapPreparationFailure(
  preparation: Exclude<
    CanonicalEvaluationCapturePreparation,
    { status: "would_insert" }
  >,
) {
  return baseResult(
    preparation.status,
    null,
    preparation.reason_codes,
  );
}

export async function executeCanonicalEvaluationCapturePlan(
  sourcePlan: CanonicalEvaluationCapturePlan,
  options: CanonicalEvaluationCaptureOptions = {},
): Promise<CanonicalEvaluationCaptureResult> {
  const gate = resolveCanonicalEvaluationWriterGate(options.env);

  if (gate.status === "feature_flag_disabled") {
    return baseResult("disabled", null, ["capture_feature_flag_disabled"]);
  }
  if (gate.status === "kill_switch_engaged") {
    return baseResult(
      "kill_switch_engaged",
      null,
      ["capture_kill_switch_engaged"],
    );
  }

  let plan: CanonicalEvaluationCapturePlan;
  try {
    plan = structuredClone(sourcePlan);
  } catch {
    return baseResult(
      "unmappable",
      null,
      ["prepared_plan_not_structured_cloneable"],
    );
  }

  const integrityReasons = validatePlanIntegrity(plan);
  if (integrityReasons.length > 0) {
    return baseResult(
      "conflicting",
      plan.envelope?.canonical_identity ?? null,
      integrityReasons,
    );
  }

  if (options.mode !== "capture") {
    return baseResult(
      "would_insert",
      plan.envelope.canonical_identity,
      [],
    );
  }

  const database = options.databaseFactory?.() ?? null;
  const activity = emptyActivity();
  activity.client_constructions = database ? 1 : 0;

  if (!database || database.scope !== "disposable_local_postgres") {
    const result = baseResult(
      "unmappable",
      plan.envelope.canonical_identity,
      ["disposable_local_postgres_database_required"],
    );
    result.database_activity = activity;
    return result;
  }

  const localDatabase = countedDatabase(database, activity);
  const writerResult = await writeCanonicalEvaluationStorage(
    plan.storage_payload,
    {
      env: {
        [CANONICAL_EVALUATION_WRITER_FEATURE_FLAG]: "true",
        [CANONICAL_EVALUATION_WRITER_KILL_SWITCH]: "false",
      },
      database: localDatabase,
    },
  );

  if (writerResult.status === "semantic_conflict") {
    const result = baseResult(
      "semantic_conflict",
      plan.envelope.canonical_identity,
      writerResult.reason_codes,
    );
    result.database_activity = activity;
    result.writer_result = writerResult;
    return result;
  }
  if (
    writerResult.status !== "inserted" &&
    writerResult.status !== "idempotent_no_effect"
  ) {
    const result = baseResult(
      writerResult.status === "rejected_unmappable"
        ? "conflicting"
        : "unmappable",
      plan.envelope.canonical_identity,
      writerResult.reason_codes,
    );
    result.database_activity = activity;
    result.writer_result = writerResult;
    return result;
  }

  const readback = await localDatabase.readCanonicalEvaluation(
    plan.envelope.canonical_identity,
  );
  if (readback.status !== "found") {
    const result = baseResult(
      "unmappable",
      plan.envelope.canonical_identity,
      [
        readback.status === "error"
          ? readback.error_code
          : "stored_row_missing_after_write",
      ],
    );
    result.database_activity = activity;
    result.writer_result = writerResult;
    return result;
  }

  const parity = parityFromReadback(plan, readback.row);
  const result = baseResult(
    parity.status === "matched"
      ? writerResult.status
      : "conflicting",
    plan.envelope.canonical_identity,
    parity.difference_codes,
  );
  result.database_activity = activity;
  result.parity = parity;
  result.writer_result = writerResult;
  return result;
}

export async function captureCompletedRecommendationOutcomeBundle(
  input: CompletedRecommendationOutcomeCaptureInput,
  options: CanonicalEvaluationCaptureOptions = {},
): Promise<CanonicalEvaluationCaptureResult> {
  const gate = resolveCanonicalEvaluationWriterGate(options.env);

  if (gate.status === "feature_flag_disabled") {
    return baseResult("disabled", null, ["capture_feature_flag_disabled"]);
  }
  if (gate.status === "kill_switch_engaged") {
    return baseResult(
      "kill_switch_engaged",
      null,
      ["capture_kill_switch_engaged"],
    );
  }

  const preparation =
    prepareCompletedRecommendationOutcomeCapture(input);
  if (!preparation.ok) {
    return mapPreparationFailure(preparation);
  }

  return executeCanonicalEvaluationCapturePlan(
    preparation.plan,
    options,
  );
}
