import { expect, test } from "@playwright/test";

import frozenFixtureReadinessReport from "../../docs/action-664c-fixture-readiness-report.json";
import {
  buildCanonicalEvaluationStoragePayload,
  canonicalEvaluationSchemaProposal,
  projectCanonicalStoragePayloadThrough664B,
  roundTripCanonicalEvaluationPersistence,
} from "../../lib/canonical-evaluation-persistence-contract";
import {
  action664cBrokenLineageEnvelopeResult,
  action664cCompleteRoundTrip,
  action664cDuplicateHorizonEnvelopeResult,
  action664cFixtureReadinessReport,
  action664cGoldenTradePlan,
  action664cHistoricalEnvelopeResult,
  action664cIncompleteVersionsEnvelopeResult,
  action664cInvalidConfidenceEnvelopeResult,
  action664cMissingDecisionEnvelopeResult,
  action664cNoTradeEnvelopeResult,
  action664cProviderGapEnvelopeResult,
  action664cRejectedEnvelopeResult,
  action664cResearchEnvelopeResult,
  action664cSampleConflictEnvelopeResult,
  action664cShadowEnvelopeResult,
  action664cVisibleEnvelopeResult,
} from "../../lib/canonical-evaluation-persistence-fixtures";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function diagnosticCodes(result: {
  diagnostics: Array<{ code: string }>;
}) {
  return result.diagnostics.map((item) => item.code);
}

function requireEnvelope(
  result: typeof action664cVisibleEnvelopeResult,
) {
  expect(result.status).toBe("ready");
  expect(result.value).not.toBeNull();
  if (!result.value) throw new Error("Expected ready envelope fixture.");
  return result.value;
}

test.describe("Action 664C inactive persistence and lineage contract", () => {
  test("all six sample types produce ready inactive envelopes", () => {
    const results = [
      action664cVisibleEnvelopeResult,
      action664cResearchEnvelopeResult,
      action664cShadowEnvelopeResult,
      action664cHistoricalEnvelopeResult,
      action664cRejectedEnvelopeResult,
      action664cNoTradeEnvelopeResult,
    ];

    expect(results.map((result) => result.status)).toEqual([
      "ready",
      "ready",
      "ready",
      "ready",
      "ready",
      "ready",
    ]);
    expect(results.map((result) => result.value?.sample_type)).toEqual([
      "visible",
      "research_only",
      "shadow",
      "historical_synthetic",
      "rejected_candidate",
      "no_trade",
    ]);
    expect(
      results.every(
        (result) => result.value?.inactive_readiness_only === true,
      ),
    ).toBe(true);
  });

  test("envelope contains canonical decision, confidence, versions, context, provider, evaluation, and lineage", () => {
    const envelope = requireEnvelope(action664cVisibleEnvelopeResult);

    expect(envelope).toMatchObject({
      contract_version: "canonical_evaluation_persistence_v1",
      decision_kind: "recommendation",
      source_namespace: "recommendation_snapshot",
      canonical_identity:
        "rec_decision:v1:recommendation_snapshot:recommendation-visible-001:1783517520000",
      producer_decision_id: "recommendation-visible-001",
      decision_timestamp: "2026-07-08T13:32:00.000Z",
      sample_type: "visible",
      confidence: {
        numeric_confidence: 0.78,
        numeric_confidence_scale: "probability_0_1",
        confidence_label: null,
      },
      lineage: {
        candidate: { id: "candidate-visible-001" },
        scan_run: {
          id: "scan-run-001",
          fingerprint: "scan-run-fingerprint-001",
        },
        batch: {
          id: "batch-001",
          fingerprint: "batch-fingerprint-001",
        },
        snapshot: {
          id: "snapshot-visible-001",
          fingerprint: "snapshot-fingerprint-visible-001",
        },
        recommendation_id: "recommendation-visible-001",
      },
      decision_context: {
        regime: "risk_on",
        sector: "Technology",
        captured_at: "2026-07-08T13:32:00.000Z",
      },
      provider_context: {
        provider: "golden_provider",
        source_timestamp: "2026-07-08T14:32:00.000Z",
        freshness: "fresh",
        candle_interval: "5m",
        primary_coverage: {
          status: "complete",
          expected_candle_count: 12,
          observed_candle_count: 12,
        },
      },
      evaluation: {
        evaluator_input_identity:
          "eval_input:v1:golden-provider:2026-07-08T14:32:00.000Z",
        trade_plan: action664cGoldenTradePlan,
        primary_outcome_id: "outcome-snapshot-visible-001-60m",
        reproducible: true,
        quality_metrics_eligible: true,
      },
      inactive_readiness_only: true,
    });
    expect(envelope.versions.git_commit).toHaveLength(40);
    expect(envelope.evaluation.horizons).toHaveLength(3);
    expect(envelope.evaluation.diagnostic_outcome_ids).toHaveLength(2);
  });

  test("storage payload is additive, explicit, idempotent, and write-disabled", () => {
    const envelope = requireEnvelope(action664cVisibleEnvelopeResult);
    const result = buildCanonicalEvaluationStoragePayload(envelope);

    expect(result.status).toBe("ready");
    expect(result.value).toMatchObject({
      storage_contract_version: "canonical_evaluation_storage_payload_v1",
      target_relation: "canonical_evaluation_decisions_proposed",
      write_enabled: false,
      inactive_readiness_only: true,
      canonical_identity: envelope.canonical_identity,
      producer_decision_id: envelope.producer_decision_id,
      sample_type: "visible",
      candidate_id: "candidate-visible-001",
      scan_run_id: "scan-run-001",
      batch_id: "batch-001",
      snapshot_id: "snapshot-visible-001",
      recommendation_id: "recommendation-visible-001",
      numeric_confidence: 0.78,
      expected_candle_count: 12,
      observed_candle_count: 12,
      primary_horizon: "60m",
      idempotency_key: `canonical_evaluation:v1:${envelope.canonical_identity}`,
    });
  });

  test("complete envelope round-trips through storage and the Action 664B adapter without canonical drift", () => {
    expect(action664cCompleteRoundTrip).not.toBeNull();
    expect(action664cCompleteRoundTrip).toMatchObject({
      status: "ready",
      canonical_result_equal: true,
      difference_codes: [],
    });
    expect(
      action664cCompleteRoundTrip?.readback_projection?.projection
        .canonical_identity,
    ).toBe(
      action664cVisibleEnvelopeResult.value?.canonical_identity,
    );
  });

  test("all six sample envelopes survive inactive storage/adaptor round-trip", () => {
    const envelopes = [
      action664cVisibleEnvelopeResult,
      action664cResearchEnvelopeResult,
      action664cShadowEnvelopeResult,
      action664cHistoricalEnvelopeResult,
      action664cRejectedEnvelopeResult,
      action664cNoTradeEnvelopeResult,
    ].map(requireEnvelope);
    const roundTrips = envelopes.map(roundTripCanonicalEvaluationPersistence);

    expect(roundTrips.map((result) => result.status)).toEqual([
      "ready",
      "ready",
      "ready",
      "ready",
      "ready",
      "ready",
    ]);
    expect(
      roundTrips.map((result) => result.canonical_result_equal),
    ).toEqual([true, true, true, true, true, true]);
  });

  test("missing decision ID fails closed before envelope creation", () => {
    expect(action664cMissingDecisionEnvelopeResult.status).toBe("unmappable");
    expect(action664cMissingDecisionEnvelopeResult.value).toBeNull();
    expect(diagnosticCodes(action664cMissingDecisionEnvelopeResult)).toContain(
      "missing_producer_decision_id",
    );
  });

  test("sample-type contradiction remains conflicting", () => {
    expect(action664cSampleConflictEnvelopeResult.status).toBe("conflicting");
    expect(diagnosticCodes(action664cSampleConflictEnvelopeResult)).toContain(
      "conflicting_sample_type",
    );
  });

  test("confidence outside [0,1] is unmappable and never rescaled", () => {
    expect(action664cInvalidConfidenceEnvelopeResult.status).toBe(
      "unmappable",
    );
    expect(diagnosticCodes(action664cInvalidConfidenceEnvelopeResult)).toContain(
      "numeric_confidence_not_probability",
    );
  });

  test("incomplete versions metadata is unmappable and never defaulted", () => {
    expect(action664cIncompleteVersionsEnvelopeResult.status).toBe(
      "unmappable",
    );
    expect(
      diagnosticCodes(action664cIncompleteVersionsEnvelopeResult),
    ).toContain("invalid_provider_contract_version");
  });

  test("broken candidate-to-batch lineage blocks the envelope", () => {
    expect(action664cBrokenLineageEnvelopeResult.status).toBe("unmappable");
    expect(diagnosticCodes(action664cBrokenLineageEnvelopeResult)).toContain(
      "missing_batch_lineage",
    );
  });

  test("provider gap is preservable but cannot become a quality-metric outcome", () => {
    const envelope = requireEnvelope(action664cProviderGapEnvelopeResult);

    expect(envelope.evaluation.primary_selection).toMatchObject({
      status: "incomplete",
      primary_horizon: null,
      canonical_outcome_count: 0,
    });
    expect(envelope.evaluation.reproducible).toBe(false);
    expect(envelope.evaluation.quality_metrics_eligible).toBe(false);
    expect(envelope.evaluation.reason_codes).toEqual(
      expect.arrayContaining([
        "primary_outcome_incomplete",
        "provider_gap_preserved",
        "quality_metrics_not_eligible",
      ]),
    );
    expect(envelope.evaluation.horizons[0].coverage.status).toBe(
      "provider_gap",
    );
  });

  test("duplicate horizon conflict prevents persistence readiness", () => {
    expect(action664cDuplicateHorizonEnvelopeResult.status).toBe(
      "conflicting",
    );
    expect(
      diagnosticCodes(action664cDuplicateHorizonEnvelopeResult),
    ).toContain("duplicate_60m_outcome");
  });

  test("historical synthetic envelope retains replay safety and evaluator input identity", () => {
    const envelope = requireEnvelope(action664cHistoricalEnvelopeResult);

    expect(envelope.evaluation).toMatchObject({
      evaluator_input_identity:
        "eval_input:v1:historical-candidate-001:2026-06-01",
      reproducible: true,
      quality_metrics_eligible: true,
      replay: {
        source_type: "historical_synthetic",
        lookahead_safety_passed: true,
        provider_call_executed: false,
        persistence_write_executed: false,
      },
    });
  });

  test("storage tampering conflicts before Action 664B readback", () => {
    const envelope = requireEnvelope(action664cVisibleEnvelopeResult);
    const storage = buildCanonicalEvaluationStoragePayload(envelope);
    expect(storage.value).not.toBeNull();
    if (!storage.value) return;

    const tampered = {
      ...storage.value,
      sample_type: "shadow" as const,
    };
    const result = projectCanonicalStoragePayloadThrough664B(tampered);

    expect(result.status).toBe("conflicting");
    expect(diagnosticCodes(result)).toContain(
      "storage_sample_type_conflict",
    );
  });

  test("storage builder revalidates lineage after envelope construction", () => {
    const envelope = clone(requireEnvelope(action664cVisibleEnvelopeResult));
    envelope.lineage.batch = null;
    const result = buildCanonicalEvaluationStoragePayload(envelope);

    expect(result.status).toBe("unmappable");
    expect(result.value).toBeNull();
    expect(diagnosticCodes(result)).toContain("missing_batch_lineage");
  });

  test("fixture-only readiness report has deterministic totals and no production access", () => {
    expect(action664cFixtureReadinessReport).toMatchObject({
      contract_version: "canonical_evaluation_persistence_v1",
      fixture_only: true,
      production_rows_read: 0,
      production_rows_written: 0,
      totals: {
        total: 14,
        ready: 7,
        conflicting: 2,
        unmappable: 4,
        incomplete_but_preservable: 1,
      },
    });
    expect(action664cFixtureReadinessReport.by_source).toEqual({
      historical_replay: {
        total: 1,
        ready: 1,
        conflicting: 0,
        unmappable: 0,
        incomplete_but_preservable: 0,
      },
      recommendation_batch: {
        total: 1,
        ready: 1,
        conflicting: 0,
        unmappable: 0,
        incomplete_but_preservable: 0,
      },
      recommendation_outcome_bundle: {
        total: 4,
        ready: 2,
        conflicting: 1,
        unmappable: 1,
        incomplete_but_preservable: 0,
      },
      recommendation_snapshot: {
        total: 6,
        ready: 1,
        conflicting: 1,
        unmappable: 3,
        incomplete_but_preservable: 1,
      },
      scanner_candidate: {
        total: 2,
        ready: 2,
        conflicting: 0,
        unmappable: 0,
        incomplete_but_preservable: 0,
      },
    });
    expect(frozenFixtureReadinessReport.totals).toEqual(
      action664cFixtureReadinessReport.totals,
    );
    expect(frozenFixtureReadinessReport.by_source).toEqual(
      action664cFixtureReadinessReport.by_source,
    );
    expect(frozenFixtureReadinessReport.by_sample_type).toEqual(
      action664cFixtureReadinessReport.by_sample_type,
    );
    expect(frozenFixtureReadinessReport.reason_code_counts).toEqual(
      action664cFixtureReadinessReport.reason_code_counts,
    );
  });

  test("readiness report separates preservable legacy evidence from quality-ready rows", () => {
    const preservable = action664cFixtureReadinessReport.items.find(
      (item) =>
        item.fixture_id ===
        "14_legacy_preservable_not_quality_usable",
    );

    expect(preservable).toMatchObject({
      status: "incomplete_but_preservable",
      sample_type: "visible",
      source_record_id: "snapshot-legacy-preservable-001",
    });
    expect(preservable?.reason_codes).toEqual(
      expect.arrayContaining([
        "invalid_provider_contract_version",
        "legacy_quality_fields_incomplete",
        "legacy_raw_audit_preservation_only",
      ]),
    );
    expect(
      action664cFixtureReadinessReport.reason_code_counts
        .reproducible_outcome,
    ).toBe(2);
  });

  test("schema proposal is additive, nullable, indexed, idempotent, and inactive", () => {
    expect(canonicalEvaluationSchemaProposal).toMatchObject({
      proposal_version: "canonical_evaluation_schema_proposal_v1",
      status: "proposal_only",
      migration_created: false,
      writer_enabled: false,
      dual_write_enabled: false,
      rollback_no_effect: {
        additive_nullable_only: true,
        existing_writers_unchanged: true,
        existing_readers_unchanged: true,
        inactive_dual_write_default: true,
      },
    });
    expect(
      canonicalEvaluationSchemaProposal.fields.every(
        (field) => field.nullable,
      ),
    ).toBe(true);
    expect(canonicalEvaluationSchemaProposal.constraints).toContain(
      "sample_type is null or in canonical six-value set",
    );
    expect(canonicalEvaluationSchemaProposal.indexes).toContain(
      "unique partial index on canonical_identity where canonical_identity is not null",
    );
    expect(canonicalEvaluationSchemaProposal.idempotency).toEqual({
      key: "canonical_evaluation:v1:<canonical_identity>",
      conflict_policy: "reject_semantic_difference_never_overwrite",
      retry_policy: "identical_payload_is_no_effect",
    });
  });

  test("builders, round-trip, and readiness analysis are deterministic and input-immutable", () => {
    const original = requireEnvelope(action664cVisibleEnvelopeResult);
    const frozen = deepFreeze(clone(original));
    const first = roundTripCanonicalEvaluationPersistence(frozen);
    const second = roundTripCanonicalEvaluationPersistence(frozen);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(frozen).toEqual(original);
    expect(JSON.stringify(action664cFixtureReadinessReport)).toBe(
      JSON.stringify(clone(action664cFixtureReadinessReport)),
    );
  });
});
