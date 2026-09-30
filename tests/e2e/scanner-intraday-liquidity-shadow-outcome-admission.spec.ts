import { expect, test } from "@playwright/test";
import {
  assessScannerIntradayLiquidityShadowOutcomeAdmission,
  SCANNER_INTRADAY_LIQUIDITY_SHADOW_OUTCOME_ADMISSION_VERSION,
} from "@/lib/scanner-intraday-liquidity-shadow-outcome-admission";
import {
  SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION,
  SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION_V1,
} from "@/lib/scanner-intraday-liquidity-shadow-evidence-contract";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function snapshot(
  overrides: Partial<RecommendationSnapshot> = {},
  payloadOverrides: Record<string, unknown> = {},
): RecommendationSnapshot {
  return {
    id: "snapshot-shadow-aapl",
    snapshot_fingerprint: "snapshot-shadow-aapl-fingerprint",
    recommendation_id: null,
    scan_run_id: "scan-run-001",
    ticker: "AAPL",
    company_name: "Apple Inc.",
    recommended_at: "2026-09-25T14:30:00.000Z",
    app_timestamp: "2026-09-25T14:30:00.000Z",
    window: "midday",
    status: "hidden",
    source_mode: "research_only",
    data_mode: "research_only",
    market_session_phase: "regular",
    market_session_risk: "normal",
    market_session_source: "calendar",
    is_visible: false,
    is_demo: false,
    is_mock: false,
    is_real: true,
    entry: 100,
    entry_low: 99.5,
    entry_high: 100.5,
    stop: 98,
    target: 105,
    side: "long",
    risk_per_share: 2,
    reward_per_share: 5,
    planned_risk_reward: 2.5,
    confidence: 70,
    score: 70,
    rating: "B",
    label: "learning only",
    type: "RESEARCH_SAMPLE",
    rationale: "fixture",
    reason: "intraday_liquidity_shadow_full_population_research",
    catalyst: "fixture",
    primary_risk: "fixture",
    market_data_snapshot: null,
    quote_price: null,
    volume: null,
    liquidity: null,
    spread: null,
    freshness: "fresh",
    data_age_minutes: 0,
    intake_quality_json: null,
    scan_observability_json: null,
    empty_state_json: null,
    quality_json: null,
    payload_json: {
      visibility_status: "research_only",
      not_live_signal: true,
      not_live_trade_signal: true,
      visible_in_primary_recommendations: false,
      research_purpose: "intraday_liquidity_shadow_full_population",
      intraday_liquidity_shadow_evidence_sample: true,
      intraday_liquidity_shadow_evidence_capture_version:
        SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION,
      research_only: true,
      learning_scope: "research_only",
      candidate_id: "candidate-aapl",
      candidate_decision_id: "candidate-aapl",
      candidate_decision_disposition: "ranked_not_selected",
      candidate_decision_linkage_status: "verified",
      scan_run_fingerprint: "scan-run-001",
      batch_fingerprint: "batch-001",
      sample_quality: "good",
      provider_source: "twelve_data",
      data_timestamp: "2026-09-25T14:29:00.000Z",
      explicit_metadata_gaps: [],
      ...payloadOverrides,
    },
    was_taken: false,
    linked_position_id: null,
    created_at: "2026-09-25T14:30:00.000Z",
    updated_at: "2026-09-25T14:30:00.000Z",
    ...overrides,
  };
}

test.describe("intraday liquidity shadow outcome admission", () => {
  test("admits only the exact contained full-population cohort", () => {
    expect(
      assessScannerIntradayLiquidityShadowOutcomeAdmission(snapshot()),
    ).toEqual({
      admission_version:
        SCANNER_INTRADAY_LIQUIDITY_SHADOW_OUTCOME_ADMISSION_VERSION,
      status: "admitted",
      reason_codes: [],
      snapshot_fingerprint: "snapshot-shadow-aapl-fingerprint",
      scan_run_fingerprint: "scan-run-001",
      candidate_decision_id: "candidate-aapl",
      provider_requests_authorized: 0,
      live_ranking_effect: false,
      publication_effect: false,
      execution_effect: false,
      quality_improvement_claimed: false,
    });
  });

  test("retains outcome admission for immutable v1 snapshots after v2 capture ships", () => {
    const result = assessScannerIntradayLiquidityShadowOutcomeAdmission(
      snapshot({}, {
        intraday_liquidity_shadow_evidence_capture_version:
          SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION_V1,
      }),
    );

    expect(result).toMatchObject({
      admission_version:
        SCANNER_INTRADAY_LIQUIDITY_SHADOW_OUTCOME_ADMISSION_VERSION,
      status: "admitted",
      reason_codes: [],
    });
  });

  test("rejects unknown capture versions", () => {
    const result = assessScannerIntradayLiquidityShadowOutcomeAdmission(
      snapshot({}, {
        intraday_liquidity_shadow_evidence_capture_version:
          "scanner_intraday_liquidity_shadow_evidence_capture_v3",
      }),
    );

    expect(result.status).toBe("rejected");
    expect(result.reason_codes).toContain("capture_contract_mismatch");
  });

  test("does not admit unrelated research snapshots", () => {
    const result = assessScannerIntradayLiquidityShadowOutcomeAdmission(
      snapshot({}, {
        research_purpose: "learning_acceleration",
        intraday_liquidity_shadow_evidence_sample: false,
      }),
    );

    expect(result.status).toBe("not_applicable");
  });

  test("rejects lineage drift", () => {
    const result = assessScannerIntradayLiquidityShadowOutcomeAdmission(
      snapshot({}, { candidate_decision_id: "candidate-other" }),
    );

    expect(result.status).toBe("rejected");
    expect(result.reason_codes).toContain("candidate_decision_lineage_mismatch");
  });

  test("rejects incomplete point-in-time evidence", () => {
    const result = assessScannerIntradayLiquidityShadowOutcomeAdmission(
      snapshot({}, { explicit_metadata_gaps: ["source_timestamp_unavailable"] }),
    );

    expect(result.status).toBe("rejected");
    expect(result.reason_codes).toContain("point_in_time_evidence_incomplete");
  });

  test("rejects any attempt to make the research sample visible", () => {
    const result = assessScannerIntradayLiquidityShadowOutcomeAdmission(
      snapshot({ is_visible: true }),
    );

    expect(result.status).toBe("rejected");
    expect(result.reason_codes).toContain("research_containment_mismatch");
  });

  test("wires the exact admission into loading, eligibility and diagnostics without opening generic research", () => {
    const route = readFileSync(
      resolve(process.cwd(), "app/api/recommendations/evaluate-outcomes/route.ts"),
      "utf8",
    );

    expect(route).toContain(
      "function isOfficialOutcomeEvaluationSnapshot(snapshot: RecommendationSnapshot)",
    );
    expect(route).toContain(
      ".filter(isOfficialOutcomeEvaluationSnapshot)",
    );
    expect(route).toContain(
      'liquidityShadowOutcomeAdmission.status === "admitted"',
    );
    expect(route).toContain(
      'reasons.push("intraday_liquidity_shadow_evidence_rejected")',
    );
    expect(route).toContain(
      "eligible_intraday_liquidity_shadow_snapshot_count",
    );
    expect(route).toContain(
      "intraday_liquidity_shadow_samples_evaluated",
    );
    expect(route).toContain(
      "SCANNER_INTRADAY_LIQUIDITY_SHADOW_OUTCOME_ADMISSION_VERSION",
    );
    expect(route).toContain(
      "!shouldIncludeLearningAccelerationOutcomeSample({",
    );
  });
});
