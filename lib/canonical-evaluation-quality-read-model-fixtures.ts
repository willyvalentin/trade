import {
  buildCanonicalEvaluationStoragePayload,
  type CanonicalEvaluationPersistenceEnvelope,
} from "@/lib/canonical-evaluation-persistence-contract";
import {
  action664cHistoricalEnvelopeResult,
  action664cNoTradeEnvelopeResult,
  action664cProviderGapEnvelopeResult,
  action664cRejectedEnvelopeResult,
  action664cShadowEnvelopeResult,
} from "@/lib/canonical-evaluation-persistence-fixtures";
import {
  action664eResearchInput,
  action664eVisibleInput,
} from "@/lib/canonical-evaluation-capture-fixtures";
import { prepareCompletedRecommendationOutcomeCapture } from "@/lib/server/canonical-evaluation-capture-orchestrator";
import {
  validateCanonicalEvaluationStorageWritePayload,
  type CanonicalEvaluationStorageInsert,
} from "@/lib/server/canonical-evaluation-storage-writer";

function insertFromEnvelope(
  result: {
    status: string;
    value: CanonicalEvaluationPersistenceEnvelope | null;
  },
  fixtureName: string,
) {
  if (result.status !== "ready" || !result.value) {
    throw new Error(`${fixtureName}_envelope_not_ready`);
  }
  const storage = buildCanonicalEvaluationStoragePayload(result.value);
  if (storage.status !== "ready" || !storage.value) {
    throw new Error(`${fixtureName}_storage_not_ready`);
  }
  const validation = validateCanonicalEvaluationStorageWritePayload(
    storage.value,
  );
  if (!validation.ok) {
    throw new Error(`${fixtureName}_writer_payload_not_ready`);
  }
  return structuredClone(validation.insert);
}

function insertFromCompletedBundle(
  input: typeof action664eVisibleInput,
  fixtureName: string,
) {
  const preparation = prepareCompletedRecommendationOutcomeCapture(input);
  if (preparation.status !== "would_insert" || !preparation.plan) {
    throw new Error(
      `${fixtureName}_capture_not_ready:${preparation.status}:${preparation.reason_codes.join(",")}`,
    );
  }
  const validation = validateCanonicalEvaluationStorageWritePayload(
    preparation.plan.storage_payload,
  );
  if (!validation.ok) {
    throw new Error(`${fixtureName}_writer_payload_not_ready`);
  }
  return structuredClone(validation.insert);
}

export const action664fVisibleRow = insertFromCompletedBundle(
  action664eVisibleInput,
  "visible",
);
export const action664fResearchRow = insertFromCompletedBundle(
  action664eResearchInput,
  "research",
);
export const action664fShadowRow = insertFromEnvelope(
  action664cShadowEnvelopeResult,
  "shadow",
);
export const action664fHistoricalRow = insertFromEnvelope(
  action664cHistoricalEnvelopeResult,
  "historical",
);
export const action664fRejectedRow = insertFromEnvelope(
  action664cRejectedEnvelopeResult,
  "rejected",
);
export const action664fNoTradeRow = insertFromEnvelope(
  action664cNoTradeEnvelopeResult,
  "no_trade",
);
export const action664fProviderGapRow = insertFromEnvelope(
  action664cProviderGapEnvelopeResult,
  "provider_gap",
);

export const action664fAllSampleRows = [
  action664fVisibleRow,
  action664fResearchRow,
  action664fShadowRow,
  action664fHistoricalRow,
  action664fRejectedRow,
  action664fNoTradeRow,
].map((row) => structuredClone(row));

function completedVariant(
  suffix: string,
  mutatePrimary: (
    outcome: (typeof action664eVisibleInput.outcomes)[number],
  ) => void,
) {
  const input = structuredClone(action664eVisibleInput);
  const decisionTimestamp = `2026-07-08T1${suffix.slice(-1)}:32:00.000Z`;
  input.snapshot.id = `snapshot-${suffix}`;
  input.snapshot.snapshot_fingerprint = `snapshot-fingerprint-${suffix}`;
  input.snapshot.recommendation_id = `recommendation-${suffix}`;
  input.snapshot.recommended_at = decisionTimestamp;
  input.metadata.producer_decision_id = input.snapshot.recommendation_id;
  input.metadata.decision_timestamp = decisionTimestamp;
  input.metadata.snapshot_id = input.snapshot.id;
  input.metadata.snapshot_fingerprint = input.snapshot.snapshot_fingerprint;
  input.metadata.recommendation_id = input.snapshot.recommendation_id;
  input.metadata.candidate_id = `candidate-${suffix}`;
  input.metadata.batch_id = `batch-${suffix}`;
  input.metadata.batch_fingerprint = `batch-fingerprint-${suffix}`;
  input.metadata.scan_run_id = `scan-run-${suffix}`;
  input.metadata.scan_run_fingerprint = `scan-run-fingerprint-${suffix}`;
  input.snapshot.scan_run_id = input.metadata.scan_run_id;
  input.evaluator_input_identity = `eval_input:v1:${suffix}`;
  input.batch = input.batch
    ? {
        ...input.batch,
        id: input.metadata.batch_id,
        batch_fingerprint: input.metadata.batch_fingerprint,
        scan_run_id: input.metadata.scan_run_id,
        scan_run_fingerprint: input.metadata.scan_run_fingerprint,
        recommendation_snapshot_ids: [input.snapshot.id],
        recommendation_snapshot_fingerprints: [
          input.snapshot.snapshot_fingerprint,
        ],
      }
    : null;
  input.scan_run = input.scan_run
    ? {
        ...input.scan_run,
        id: input.metadata.scan_run_id,
        run_fingerprint: input.metadata.scan_run_fingerprint,
      }
    : null;
  input.outcomes = input.outcomes.map((outcome) => ({
    ...outcome,
    id: `outcome-${suffix}-${outcome.horizon}`,
    snapshot_id: input.snapshot.id,
    snapshot_fingerprint: input.snapshot.snapshot_fingerprint,
    recommendation_id: input.snapshot.recommendation_id,
    recommended_at: decisionTimestamp,
  }));
  const primary = input.outcomes.find((outcome) => outcome.horizon === "60m");
  if (!primary) throw new Error(`${suffix}_primary_fixture_missing`);
  mutatePrimary(primary);
  return insertFromCompletedBundle(input, suffix);
}

export const action664fAmbiguousRow = completedVariant(
  "ambiguous-1",
  (outcome) => {
    outcome.status = "unknown";
    outcome.target_hit = true;
    outcome.stop_hit = true;
    outcome.first_terminal_event = "unknown";
  },
);

export const action664fNonReproducibleRow = completedVariant(
  "non-reproducible-2",
  (outcome) => {
    outcome.best_r = null;
    outcome.max_favorable_excursion = null;
  },
);

export const action664fParityMismatchRow = completedVariant(
  "parity-mismatch-3",
  () => {},
);
action664fParityMismatchRow.regime_at_decision = "tampered_regime";

export const action664fTamperedEnvelopeRow = completedVariant(
  "tampered-envelope-4",
  () => {},
);
action664fTamperedEnvelopeRow.persistence_envelope.decision_context.reason_codes =
  ["tampered_after_digest"];
action664fTamperedEnvelopeRow.decision_context_json = structuredClone(
  action664fTamperedEnvelopeRow.persistence_envelope.decision_context,
);

export const action664fDuplicateHorizonRow = completedVariant(
  "duplicate-horizon-5",
  () => {},
);
const duplicatedHorizon = structuredClone(
  action664fDuplicateHorizonRow.persistence_envelope.evaluation.horizons.find(
    (outcome) => outcome.horizon === "60m",
  ),
);
if (!duplicatedHorizon) throw new Error("duplicate_horizon_source_missing");
duplicatedHorizon.id = "outcome-read-model-duplicate-60m";
action664fDuplicateHorizonRow.persistence_envelope.evaluation.horizons.push(
  duplicatedHorizon,
);
action664fDuplicateHorizonRow.persistence_envelope.lineage.outcome_ids.push(
  duplicatedHorizon.id,
);
action664fDuplicateHorizonRow.diagnostic_horizons_json =
  structuredClone(
    action664fDuplicateHorizonRow.persistence_envelope.evaluation.horizons,
  );
action664fDuplicateHorizonRow.evaluation_json = structuredClone(
  action664fDuplicateHorizonRow.persistence_envelope.evaluation,
);
action664fDuplicateHorizonRow.lineage_json = structuredClone(
  action664fDuplicateHorizonRow.persistence_envelope.lineage,
);

export function cloneAction664fRows(
  rows: CanonicalEvaluationStorageInsert[],
) {
  return structuredClone(rows);
}
