import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { relativePlanEvidence } from "../fixtures/relative-plan-context-evidence";
import { buildRelativePlanContextOutcomeComparison } from "@/lib/scanner-relative-plan-context-outcomes";
import { buildRecommendationLearningBaselineReadiness } from "@/lib/recommendation-learning-baseline-readiness";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { recommendationDecisionFeatureVectorFromScannerCandidate } from "@/lib/recommendation-decision-feature-vector";
import { recommendationResearchLearningSourceProvenance } from "@/lib/completed-input-learning-provenance";
import { computeRecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import { buildCanonicalOutcomeProviderCoverageReceipt } from "@/lib/recommendation-outcome-canonical-coverage";
import { runRecommendationOutcomeEvaluation } from "@/lib/recommendation-outcome-evaluation-runner";

async function source(populationMissing = false, outcome: "win" | "loss" | "no_entry" | "neither" | "ambiguous" = "win",
  context: Parameters<typeof relativePlanEvidence>[0] = {}) {
  const { record, run, observed } = await relativePlanEvidence({ ...context, rankedCount: 4, missing: populationMissing });
  const snapshots = observed.map(candidate => {
    const decision = record.candidates.find(row => row.ticker === candidate.ticker)!;
    const original = decision.data.input_snapshot!;
    return buildRecommendationSnapshot({ ticker: candidate.ticker, scan_run_id: record.scan_run_fingerprint,
      recommended_at: record.decision_timestamp, app_timestamp: record.decision_timestamp, source_mode: "research_only",
      data_mode: "research_only", is_visible: false, is_real: true, side: "long", entry_low: 99, entry_high: 100,
      entry: 99.5, stop: 96, target: 108, planned_risk_reward: 2.5, freshness: "fresh",
      payload: { research_capture_version: "completed_input_research_capture_v1", research_purpose: "learning_acceleration",
        scanner_input_policy_version: "completed_daily_intraday_input_v1", scanner_decision_input_snapshot: original,
        decision_timestamp: record.decision_timestamp, data_timestamp: original.current_session!.latest_bar_started_at,
        candidate_id: decision.candidate_id, candidate_decision_id: decision.candidate_id,
        candidate_decision_disposition: decision.disposition, candidate_decision_linkage_status: "verified",
        candidate_decision_linkage_version: "research_snapshot_candidate_decision_linkage_v2",
        provider_source: "twelve_data", provider_version: null, build_marker: "synthetic_closed_shadow_test",
        market_data_adapter_version: "automation_scan_market_data_adapter_v1",
        recommendation_publish_policy_version: record.learning_attribution.recommendation_publish_policy_version,
        intraday_indicator_response_identity: original.current_session!.response_identity,
        decision_feature_vector: recommendationDecisionFeatureVectorFromScannerCandidate(candidate, Date.parse(record.decision_timestamp) / 1000),
      } });
  });
  for (const snapshot of snapshots) expect(recommendationResearchLearningSourceProvenance(snapshot, [run]).blockers).toEqual([]);
  const outcomes = snapshots.map((snapshot, i) => {
    const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot)!;
    const start = Date.parse(anchor.evaluation_anchor_start_at);
    const wins = outcome === "win" && i !== 0;
    const candles = Array.from({ length: 12 }, (_, bar) => ({ timestamp: new Date(start + bar * 300000).toISOString(),
      open: outcome === "no_entry" ? 105 : 100, high: outcome === "no_entry" ? 106 : wins ? 109 : 101,
      low: outcome === "no_entry" ? 104 : wins ? 99 : 95, close: outcome === "no_entry" ? 105 : wins ? 108 : 96, volume: 1000,
      ...(outcome === "neither" ? { high: 101, low: 99, close: 100.5 } : {}),
      ...(outcome === "ambiguous" ? { high: 109, low: 95, close: 100 } : {}),
    }));
    const result = computeRecommendationOutcome({ snapshot, horizon: "60m", evaluated_at: new Date(start + 3600000),
      candles, current_price: candles.at(-1)!.close,
      provider: "twelve_data", source: "intraday_candles", data_completeness: "complete" }).outcome;
    const coverage = buildCanonicalOutcomeProviderCoverageReceipt({ candles,
      request: { interval: "5min", horizon: "60m", start_at: anchor.evaluation_anchor_start_at,
        end_at: new Date(start + 3600000).toISOString(), decision_timestamp: anchor.decision_timestamp,
        evaluation_anchor_start_at: anchor.evaluation_anchor_start_at, decision_to_anchor_seconds: anchor.decision_to_anchor_seconds,
        decision_timestamp_interval_aligned: anchor.decision_timestamp_interval_aligned }, result: { status: "available", provider: "twelve_data" } });
    return { ...result, payload_json: { ...result.payload_json, canonical_provider_coverage: coverage } };
  });
  return { scanRun: run, scanRuns: [run], snapshots, outcomes };
}

test("original source and canonical outcomes change measured K=3 results, never the model or original cohort", async () => {
  const input = await source();
  const bytes = JSON.stringify(input);
  const result = buildRelativePlanContextOutcomeComparison(input);
  expect(result.candidates.map(row => [row.ticker, row.outcome_reason])).toEqual(input.snapshots.map(row => [row.ticker, null]));
  expect(result).toMatchObject({ status: "linked_complete", original_population_count: 4, canonical_outcome_count: 4,
    missing_outcome_count: 0, population_complete: true, primary_horizon: "60m", quality_improvement_claimed: false });
  expect(result.baseline.precision_at_3.value).toBeCloseTo(2 / 3);
  expect(result.challenger.precision_at_3.value).toBe(1);
  expect(result.precision_delta).toBeCloseTo(1 / 3);
  expect(result.baseline.expectancy_r.value).toBeLessThan(result.challenger.expectancy_r.value!);
  expect(result.baseline.precision_at_3.status).toBe("not_publishable");
  expect(result.reason_codes).toContain("prospective_baseline_contract_and_full_charter_required");
  expect(JSON.stringify(input)).toBe(bytes);
  expect(buildRelativePlanContextOutcomeComparison(JSON.parse(bytes))).toEqual(result);
});

test("both unfavorable and untriggered entry outcomes retain their honest canonical semantics", async () => {
  const losses = buildRelativePlanContextOutcomeComparison(await source(false, "loss"));
  expect(losses.candidates.every(row => row.terminal_outcome === "stop_before_target" && row.r_result === -1)).toBe(true);
  expect(losses.baseline.precision_at_3.value).toBe(0);
  expect(losses.challenger.expectancy_r.value).toBe(-1);
  const noEntry = buildRelativePlanContextOutcomeComparison(await source(false, "no_entry"));
  expect(noEntry.candidates.every(row => row.terminal_outcome === "no_entry" && row.r_result === 0)).toBe(true);
  expect(noEntry.baseline.no_entry_count).toBe(3);
  expect(noEntry.baseline.expectancy_r.value).toBe(0);
});

test("incoherent outcome candles cannot become canonical winning or losing learning labels", async () => {
  const input = await source();
  const originalBytes = JSON.stringify(input);
  const snapshot = input.snapshots[0];
  const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot)!;
  const start = Date.parse(anchor.evaluation_anchor_start_at);
  for (const [fault, invalid] of [
    ["winning_close_above_high", { open: 100, high: 109, low: 99, close: 120 }],
    ["winning_open_above_high", { open: 120, high: 109, low: 99, close: 100 }],
    ["losing_negative_close", { open: 100, high: 101, low: 95, close: -1 }],
    ["losing_close_below_low", { open: 100, high: 101, low: 95, close: 90 }],
    ["losing_inverted_range", { open: 100, high: 94, low: 95, close: 96 }],
  ] as const) {
    const candles = Array.from({ length: 12 }, (_, index) => ({
      timestamp: new Date(start + index * 300000).toISOString(),
      volume: 1000,
      ...(index === 1 ? invalid : { open: 100, high: 101, low: 99, close: 100 }),
    }));
    let requests = 0;
    // The owner-bound route exposes already admitted hidden research sources
    // to this visible-only runner. Keep the stored original hidden and intact.
    const run = await runRecommendationOutcomeEvaluation({ snapshots: [{ ...snapshot, is_visible: true }], horizons: ["60m"],
      now: new Date(start + 3900000), maxCandleRequests: 1,
      fetchCandles: async request => { requests += 1; return { request, candles,
        status: "available", provider: "twelve_data", error: null, warnings: [] }; },
      persistOutcome: async outcome => ({ status: "saved", mode: "supabase", outcome, error: null }),
    });
    expect(requests, fault).toBe(1);
    const result = buildRelativePlanContextOutcomeComparison({ ...input,
      outcomes: [run.outcomes[0], ...input.outcomes.slice(1)] });
    expect(result.canonical_outcome_count, `${fault}: ${JSON.stringify({
      status: run.outcomes[0].status, coverage: run.outcomes[0].payload_json.canonical_provider_coverage,
      mark: run.outcomes[0].payload_json.canonical_horizon_price_mark,
    })}`).toBe(3);
    expect(result).toMatchObject({ original_population_count: 4, missing_outcome_count: 1,
      population_complete: false, precision_delta: null });
    expect(result.candidates[0]).toMatchObject({ outcome_status: "missing", r_result: null, positive_outcome: null });
    expect(result.baseline.precision_at_3.value).toBeNull();
    expect(result.challenger.expectancy_r.value).toBeNull();
    expect(run.outcomes[0].payload_json.canonical_provider_coverage).toMatchObject({
      freshness: "unknown", observed_candle_count: 11, malformed_candle_count: 1,
      blockers: expect.arrayContaining(["malformed_candle_observed", "candle_coverage_incomplete"]),
    });
    expect(JSON.stringify(input)).toBe(originalBytes);
  }
});

test("neither-hit uses measured horizon R, while ambiguous intrabar order remains unresolved", async () => {
  const input = await source(false, "neither");
  const result = buildRelativePlanContextOutcomeComparison(input);
  expect(result.candidates.map(row => ({ terminal: row.terminal_outcome, reason: row.outcome_reason })))
    .toEqual(input.outcomes.map(() => ({ terminal: "neither", reason: null })));
  expect(result.baseline.expectancy_r.value).toBe(input.outcomes[0].current_r);
  const unmeasured = buildRelativePlanContextOutcomeComparison({ ...input,
    outcomes: input.outcomes.map(row => ({ ...row, current_r: null, eod_r: null })) });
  expect(unmeasured.canonical_outcome_count).toBe(0);
  expect(unmeasured.baseline.expectancy_r.value).toBeNull();
  const ambiguous = buildRelativePlanContextOutcomeComparison(await source(false, "ambiguous"));
  expect(ambiguous.canonical_outcome_count).toBe(0);
  expect(ambiguous.selected_60m_receipt_count).toBe(4);
  expect(ambiguous.candidates.every(row => row.outcome_id !== null)).toBe(true);
  expect(ambiguous.precision_delta).toBeNull();
  expect(ambiguous.candidates.every(row => row.r_result === null && row.positive_outcome === null)).toBe(true);
});

test("missing population or outcomes never become negative labels or a complete comparison", async () => {
  const input = await source(true);
  const partial = buildRelativePlanContextOutcomeComparison(input);
  expect(partial).toMatchObject({ status: "evidence_incomplete", original_population_count: 8, canonical_outcome_count: 4,
    missing_outcome_count: 4, precision_delta: null, population_complete: false });
  expect(partial.candidates.filter(row => row.outcome_status === "missing").every(row => row.positive_outcome === null && row.r_result === null)).toBe(true);
  expect(partial.baseline.precision_at_3.value).toBeNull();
  expect(partial.baseline.expectancy_r.value).toBeNull();
  const empty = buildRelativePlanContextOutcomeComparison({ ...input, outcomes: [] });
  expect(empty.canonical_outcome_count).toBe(0);
  expect(empty.missing_outcome_count).toBe(8);
  expect(empty.baseline.resolved_count).toBe(0);
});

test("duplicate, cross-source, altered geometry and shifted coverage cannot admit a winning label", async () => {
  const input = await source();
  for (const patch of [
    { outcomes: [...input.outcomes, input.outcomes[0]] },
    { outcomes: input.outcomes.map(row => ({ ...row, id: input.outcomes[0].id })) },
    { snapshots: [...input.snapshots, input.snapshots[0]] },
    { scanRuns: [...input.scanRuns, input.scanRun] },
    { outcomes: input.outcomes.map(row => ({ ...row, snapshot_id: "wrong_source" })) },
    { outcomes: input.outcomes.map(row => ({ ...row, target: 999 })) },
  ]) {
    const result = buildRelativePlanContextOutcomeComparison({ ...input, ...patch });
    expect(result.status).toBe("conflicting"); expect(result.precision_delta).toBeNull();
  }
  const incomplete = buildRelativePlanContextOutcomeComparison({ ...input,
    outcomes: input.outcomes.map(row => ({ ...row, payload_json: { ...row.payload_json, canonical_provider_coverage: null } })) });
  expect(incomplete.canonical_outcome_count).toBe(0);
  expect(incomplete.precision_delta).toBeNull();
});

test("factual outcomes do not turn short or fifteen-minute original contexts into an assessed comparison", async () => {
  for (const context of [{ now: new Date("2026-10-02T14:00:00.000Z") }, { interval: "15min" as const }]) {
    const result = buildRelativePlanContextOutcomeComparison(await source(false, "win", context));
    expect(result.status).toBe("evidence_incomplete");
    expect(result.context_assessed_count).toBeLessThan(result.original_population_count);
    expect(result.precision_delta).toBeNull();
    expect(result.baseline.expectancy_r.value).toBeNull();
    expect(result.candidates.some(row => row.context_status === "unassessed")).toBe(true);
  }
});

test("the actual learning read preserves outcome-linked diagnostics without granting baseline freeze authority", async () => {
  const input = await source(true);
  const read = buildRecommendationLearningBaselineReadiness({ scanRuns: input.scanRuns, snapshots: input.snapshots, outcomes: input.outcomes });
  expect(read.relative_plan_context_outcomes?.[0]).toEqual(buildRelativePlanContextOutcomeComparison(input));
  expect(read.status).toBe("not_ready");
  expect(read.blockers).toContain("completed_input_research_requires_prospective_baseline_contract");
});

test("a shorter horizon or premature sixty-minute receipt cannot replace the frozen primary horizon", async () => {
  const input = await source();
  for (const outcomes of [
    input.outcomes.map(row => ({ ...row, horizon: "15m" as const })),
    input.outcomes.map(row => ({ ...row, evaluated_at: input.scanRun.observed_at })),
    input.outcomes.map(row => ({ ...row, source: "latest_price" })),
    input.outcomes.map(row => ({ ...row, provider: "wrong_provider" })),
    input.outcomes.map(row => ({ ...row, payload_json: { ...row.payload_json,
      canonical_provider_coverage: { ...(row.payload_json.canonical_provider_coverage as Record<string, unknown>), horizon: "30m" } } })),
  ]) {
    const result = buildRelativePlanContextOutcomeComparison({ ...input, outcomes });
    expect(result.canonical_outcome_count).toBe(0);
    expect(result.precision_delta).toBeNull();
    expect(result.candidates.every(row => row.positive_outcome === null && row.r_result === null)).toBe(true);
  }
});

test("contradictory terminal facts never become winning labels or zero-exposure outcomes", async () => {
  const input = await source();
  for (const outcomes of [
    input.outcomes.map(row => ({ ...row, entry_triggered: false })),
    input.outcomes.map(row => ({ ...row, first_terminal_event: "unknown" as const })),
    input.outcomes.map(row => ({ ...row, target_hit: true, stop_hit: true })),
    input.outcomes.map(row => ({ ...row, status: "incomplete" as const })),
  ]) {
    const result = buildRelativePlanContextOutcomeComparison({ ...input, outcomes });
    expect(result.canonical_outcome_count).toBe(0);
    expect(result.precision_delta).toBeNull();
  }
});

test("the supplied decision must be the same original decision used by source provenance", async () => {
  const input = await source();
  const other = await relativePlanEvidence({ rankedCount: 4, missing: false, range: 9 });
  // Same stable run identity, conflicting original point-in-time decision.
  expect(other.run.run_fingerprint).toBe(input.scanRun.run_fingerprint);
  const result = buildRelativePlanContextOutcomeComparison({ ...input, scanRuns: [other.run] });
  expect(result.status).toBe("conflicting");
  expect(result.canonical_outcome_count).toBe(0);
  expect(result.precision_delta).toBeNull();
});

test("the opportunity-set day stays bound to the original New York decision day", async () => {
  const input = await source();
  const shifted = { ...input.scanRun, trading_date: "2026-10-01" };
  const result = buildRelativePlanContextOutcomeComparison({ ...input, scanRun: shifted, scanRuns: [shifted] });
  expect(result.status).toBe("conflicting");
  expect(result.canonical_outcome_count).toBe(0);
  expect(result.precision_delta).toBeNull();
});

test("JSONB key order preserves the same original decision and outcomes", async () => {
  const input = await source();
  const reordered = JSON.parse(JSON.stringify(input.scanRun, (_key, value) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).reverse()) : value));
  expect(buildRelativePlanContextOutcomeComparison({ ...input, scanRuns: [reordered] }))
    .toEqual(buildRelativePlanContextOutcomeComparison(input));
});

test("mature mixed outcomes survive actual isolated persistence and restarted owner learning without losing missing members", () => {
  test.setTimeout(120000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs",
    "--diagnose-outcomes", "--relative-plan-60m"], { cwd: process.cwd(), encoding: "utf8", timeout: 100000 });
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence = JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
  expect(evidence.outcome_chain_evidence).toMatchObject({ research_sources: 6, persisted_outcomes: 4,
    separate_synthetic_outcome_requests: 4, unobservable_population_members: 2, outcome_budget_pending_sources: 2,
    resumption: { persisted_outcomes: 6, additional_synthetic_outcome_requests: 2,
      completed_repeat_requests: 0, prior_outcomes_unchanged: true },
    learning_admission: { relative_plan_context_outcomes: {
      contract_version: "relative_plan_context_canonical_outcomes_v1", primary_horizon: "60m",
      status: "evidence_incomplete", original_population_count: 8,
      selected_60m_receipt_count: 6, resolved_60m_outcomes: 6, missing_outcomes: 2,
      positive_labels: 3, negative_terminal_labels: 3, baseline_precision: null,
      challenger_expectancy_r: null, precision_delta: null, restart_stable: true,
      full_charter_accepted: false, actual_provider_requests: 0,
      live_ranking_effect: false, publication_effect: false, quality_improvement_claimed: false,
    }, freeze_status: "not_ready", tampered_source_and_lineage_admitted: 0 } });
  expect(evidence).toMatchObject({ actual_provider_requests: 0, production_actions: 0,
    publications: 0, production_publications: 0, broker_actions: 0, cleanup: "inert" });
});
