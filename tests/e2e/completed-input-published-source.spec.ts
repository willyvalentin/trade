import { expect, test } from "@playwright/test";
import { relativePlanEvidence } from "../fixtures/relative-plan-context-evidence";
import { attachCompletedInputPublishedEvidence, completedInputPublishedSnapshotMatchesDecision } from "@/lib/completed-input-published-source";
import { buildRecommendationSnapshot, recommendationSnapshotFromPersistenceRow } from "@/lib/recommendation-snapshot";
import { recommendationResearchLearningSourceProvenance } from "@/lib/completed-input-learning-provenance";
import { recommendationDecisionFeatureVectorFromScannerCandidate } from "@/lib/recommendation-decision-feature-vector";
import { computeRecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import { buildCanonicalOutcomeProviderCoverageReceipt } from "@/lib/recommendation-outcome-canonical-coverage";
import { buildRelativePlanContextOutcomeComparison } from "@/lib/scanner-relative-plan-context-outcomes";

async function originalPublication() {
  const evidence = await relativePlanEvidence({ now: new Date("2026-10-02T17:00:20.000Z"), publishedTickers: ["AAA"] });
  const candidate = evidence.record.candidates.find(row => row.ticker === "AAA")!;
  const input = candidate.data.input_snapshot!;
  const snapshot = buildRecommendationSnapshot({ recommendation_id: "original-publication", ticker: "AAA",
    scan_run_id: evidence.record.scan_run_fingerprint, recommended_at: "2026-10-02T17:00:20.050Z",
    app_timestamp: "2026-10-02T17:00:20.050Z", source_mode: "supabase", data_mode: "supabase_record",
    is_visible: true, is_real: true, side: "long", entry_low: 99, entry_high: 100, entry: 99.5,
    stop: 96, target: 108, planned_risk_reward: 2.5, type: "original_setup", confidence: "strong",
    payload: { data_timestamp: evidence.record.decision_timestamp, provider_source: "twelve_data", provider_version: null,
      candidate_id: candidate.candidate_id, candidate_decision_id: candidate.candidate_id,
      candidate_decision_disposition: "published", candidate_decision_linkage_status: "verified",
      build_marker: "synthetic_closed_shadow_test", market_data_adapter_version: "automation_scan_market_data_adapter_v1",
      recommendation_publish_policy_version: evidence.record.learning_attribution.recommendation_publish_policy_version,
      intraday_indicator_response_identity: input.current_session!.response_identity,
      decision_feature_vector: recommendationDecisionFeatureVectorFromScannerCandidate(evidence.observed[0], Date.parse(evidence.record.decision_timestamp) / 1000),
      recommendation: { id: "original-publication", ticker: "AAA", created_at: "2026-10-02T17:00:20.050Z", setup_type: "original_setup" },
    } });
  return { ...evidence, snapshot, captured: attachCompletedInputPublishedEvidence(snapshot, evidence.record) };
}

test("new published capture preserves original input and geometry through the actual persistence decoder", async () => {
  const { snapshot, captured, record, run } = await originalPublication();
  const originalBytes = JSON.stringify(snapshot);
  expect(completedInputPublishedSnapshotMatchesDecision(captured, record)).toBe(true);
  const decoded = recommendationSnapshotFromPersistenceRow({ id: captured.id,
    snapshot_fingerprint: captured.snapshot_fingerprint, recommendation_id: captured.recommendation_id,
    scan_run_id: captured.scan_run_id, ticker: captured.ticker, recommended_at: captured.recommended_at,
    status: "visible", source_mode: "supabase", data_mode: "supabase_record", entry: captured.entry,
    stop: captured.stop, target: captured.target, risk_reward: captured.planned_risk_reward,
    payload_json: JSON.parse(JSON.stringify(captured.payload_json)) })!;
  expect(completedInputPublishedSnapshotMatchesDecision(decoded, record)).toBe(true);
  expect(decoded).toMatchObject({ entry_low: 99, entry_high: 100, type: "original_setup", confidence: "strong" });
  expect(decoded.snapshot_fingerprint).toBe(snapshot.snapshot_fingerprint);
  expect(decoded.payload_json.data_timestamp).toBe(record.decision_timestamp);
  expect(decoded.payload_json.original_source_timestamp).toBe(record.candidates[0].data.source_timestamp);
  expect(recommendationResearchLearningSourceProvenance(decoded, [run])).toMatchObject({ status: "admissible",
    original_decision_timestamp: record.decision_timestamp, decision_timestamp: snapshot.recommended_at,
    upstream_provider_version_status: "unavailable" });
  expect(JSON.stringify(snapshot)).toBe(originalBytes);
});

test("old publication is not retroactively admitted on the new normalized basis", async () => {
  const { snapshot, run } = await originalPublication();
  expect(recommendationResearchLearningSourceProvenance(snapshot, [run]).status).toBe("incomplete");
  expect(snapshot.payload_json.published_input_capture_version).toBeUndefined();
});

test("capture rejects wrong geometry, future inputs, changed horizons and mixed source identities", async () => {
  const { captured, record, run } = await originalPublication();
  for (const mutate of [
    (s: typeof captured) => { s.entry_low = 98; },
    (s: typeof captured) => { s.risk_per_share = 10; },
    (s: typeof captured) => { s.payload_json.original_source_timestamp = "2026-10-02T20:00:00Z"; },
    (s: typeof captured) => { s.payload_json.data_timestamp = "2026-10-02T20:00:00Z"; },
    (s: typeof captured) => { s.payload_json.decision_timestamp = s.recommended_at; },
    (s: typeof captured) => { s.payload_json.candidate_id = "wrong-candidate"; },
    (s: typeof captured) => { s.payload_json.published_input_capture_version = "unknown_capture"; },
    (s: typeof captured) => { s.payload_json.research_capture_version = "completed_input_research_capture_v1"; },
    (s: typeof captured) => { s.is_visible = false; },
    (s: typeof captured) => { s.is_real = false; },
    (s: typeof captured) => { s.type = "forged_setup"; },
    (s: typeof captured) => { s.scan_run_id = "wrong-run"; },
    (s: typeof captured) => { s.payload_json.diagnostic_run = true; },
    (s: typeof captured) => { (s.payload_json.scanner_decision_input_snapshot as Record<string, unknown>).features = {}; },
    (s: typeof captured) => { (s.payload_json.outcome_evaluation_anchor as Record<string, unknown>).evaluation_anchor_start_at = "2026-10-02T17:10:00Z"; },
  ]) {
    const changed = structuredClone(captured);
    mutate(changed);
    expect(completedInputPublishedSnapshotMatchesDecision(changed, record)).toBe(false);
    expect(recommendationResearchLearningSourceProvenance(changed, [run]).status).toBe("incomplete");
  }
  expect(recommendationResearchLearningSourceProvenance(captured, []).status).toBe("incomplete");
  expect(recommendationResearchLearningSourceProvenance(captured, [run, run]).status).toBe("incomplete");
});

test("a publication crossing the next closed-bar boundary keeps its legacy source instead of shifting original labels", async () => {
  const { snapshot, record } = await originalPublication();
  const changed = buildRecommendationSnapshot({ ...snapshot, recommended_at: "2026-10-02T17:05:00.050Z",
    payload: { ...snapshot.payload_json, recommendation: { id: snapshot.recommendation_id,
      ticker: snapshot.ticker, created_at: "2026-10-02T17:05:00.050Z", setup_type: snapshot.type } } });
  expect(attachCompletedInputPublishedEvidence(changed, record)).toBe(changed);
  expect(changed.payload_json.published_input_capture_version).toBeUndefined();
});

test("published and hidden original members share the canonical comparison without discarding missing members or double-counting", async () => {
  const { captured, record, run, observed } = await originalPublication();
  const decision = record.candidates.find(row => row.ticker === "ZZZ")!;
  const input = decision.data.input_snapshot!;
  const hidden = buildRecommendationSnapshot({ ticker: "ZZZ", scan_run_id: record.scan_run_fingerprint,
    recommended_at: record.decision_timestamp, app_timestamp: record.decision_timestamp,
    source_mode: "research_only", data_mode: "research_only", is_visible: false, is_real: true, side: "long",
    entry: 99.5, entry_low: 99, entry_high: 100, stop: 96, target: 108, planned_risk_reward: 2.5,
    payload: { research_capture_version: "completed_input_research_capture_v1", research_purpose: "learning_acceleration",
      scanner_input_policy_version: record.versions.input_policy_version, scanner_decision_input_snapshot: input,
      decision_timestamp: record.decision_timestamp, data_timestamp: input.current_session!.latest_bar_started_at,
      candidate_id: decision.candidate_id, candidate_decision_id: decision.candidate_id,
      candidate_decision_disposition: decision.disposition, candidate_decision_linkage_status: "verified",
      provider_source: "twelve_data", provider_version: null, build_marker: "synthetic_closed_shadow_test",
      market_data_adapter_version: "automation_scan_market_data_adapter_v1",
      recommendation_publish_policy_version: record.learning_attribution.recommendation_publish_policy_version,
      intraday_indicator_response_identity: input.current_session!.response_identity,
      decision_feature_vector: recommendationDecisionFeatureVectorFromScannerCandidate(observed[1], Date.parse(record.decision_timestamp) / 1000),
    } });
  expect(recommendationResearchLearningSourceProvenance(hidden, [run]).status).toBe("admissible");
  const snapshots = [captured, hidden];
  const outcomes = snapshots.map((snapshot, index) => {
    const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot)!;
    const start = Date.parse(anchor.evaluation_anchor_start_at);
    const candles = Array.from({ length: 12 }, (_, bar) => ({ timestamp: new Date(start + bar * 300000).toISOString(),
      open: 100, high: index === 0 ? 109 : 101, low: index === 0 ? 99 : 95, close: index === 0 ? 108 : 96, volume: 1000 }));
    const result = computeRecommendationOutcome({ snapshot, horizon: "60m", evaluated_at: new Date(start + 3600000),
      candles, current_price: candles.at(-1)!.close, provider: "twelve_data", source: "intraday_candles",
      data_completeness: "complete" }).outcome;
    const coverage = buildCanonicalOutcomeProviderCoverageReceipt({ candles,
      request: { interval: "5min", horizon: "60m", start_at: anchor.evaluation_anchor_start_at,
        end_at: new Date(start + 3600000).toISOString(), decision_timestamp: anchor.decision_timestamp,
        evaluation_anchor_start_at: anchor.evaluation_anchor_start_at, decision_to_anchor_seconds: anchor.decision_to_anchor_seconds,
        decision_timestamp_interval_aligned: anchor.decision_timestamp_interval_aligned },
      result: { status: "available", provider: "twelve_data" } });
    return { ...result, payload_json: { ...result.payload_json, canonical_provider_coverage: coverage } };
  });
  const source = { scanRun: run, scanRuns: [run], snapshots, outcomes };
  const bytes = JSON.stringify(source);
  const comparison = buildRelativePlanContextOutcomeComparison(source);
  expect(comparison).toMatchObject({ original_population_count: 8, canonical_outcome_count: 2,
    missing_outcome_count: 6, population_complete: false, precision_delta: null, quality_improvement_claimed: false });
  expect(comparison.candidates.find(row => row.ticker === "AAA")).toMatchObject({ outcome_status: "resolved", terminal_outcome: "target_before_stop" });
  expect(comparison.candidates.find(row => row.ticker === "ZZZ")).toMatchObject({ outcome_status: "resolved", terminal_outcome: "stop_before_target" });
  expect(JSON.stringify(source)).toBe(bytes);
  expect(buildRelativePlanContextOutcomeComparison(JSON.parse(bytes))).toEqual(comparison);
  const duplicate = buildRelativePlanContextOutcomeComparison({ ...source, snapshots: [...snapshots, structuredClone(captured)] });
  expect(duplicate.status).toBe("conflicting");
  expect(duplicate.canonical_outcome_count).toBe(1);
});
