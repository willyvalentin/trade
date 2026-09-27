import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildRecommendationEvaluationCharterInput,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import { buildCanonicalOutcomeProviderCoverageReceipt } from "@/lib/recommendation-outcome-canonical-coverage";
import { buildRecommendationOutcomeEvaluationAnchor } from "@/lib/recommendation-outcome-evaluation-anchor";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { scannerClockPriorShadowForwardPlanProfile } from "@/lib/scanner-clock-prior-shadow-forward-plan-profile";
import type { ScannerClockPriorShadowForwardDecisionPlanReceipt } from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import { SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION } from "@/lib/scanner-clock-prior-shadow-evidence-reuse";
import {
  SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  assessScannerClockPriorShadowForwardOutcomeAdmission,
  SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_OUTCOME_ADMISSION_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_OUTCOME_POLICY_VERSION,
} from "@/lib/server/scanner-clock-prior-shadow-forward-outcome-admission";
import {
  createScannerClockPriorShadowForwardOutcomeAdmissionService,
  scannerClockPriorShadowForwardOutcomeAdmissionAuthority,
  type ScannerClockPriorShadowForwardOutcomeAdmissionDependencies,
} from "@/lib/server/scanner-clock-prior-shadow-forward-outcome-admission-service";
import {
  buildScannerClockPriorShadowForwardDecisionPlan,
  buildScannerClockPriorShadowPolicyReference,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";
import { scannerClockPriorShadowEvaluationCharterDefinition } from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";

const ownerUserId = "11111111-1111-4111-8111-111111111111";
const decidedAt = "2026-09-28T13:45:00.000Z";
const sourceAt = "2026-09-28T13:44:00.000Z";
const segmentKey = "clock-prior:all-us-equities";

const charterInput = buildRecommendationEvaluationCharterInput({
  ownerUserId,
  segmentKey,
  policy: {
    recommendation_publish_policy_version: "recommendation_publish_policy_v1",
    canonical_evaluation_versions: {
      engine_version: "engine_v1",
      scoring_version: "scoring_v1",
      ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
      setup_taxonomy_version: "setup_v1",
      confidence_contract_version: "confidence_v1",
      evaluator_version: "evaluator_v1",
      provider_contract_version: "provider_v1",
      git_commit: "fixture-commit",
      build_identity: "fixture-build",
    },
  },
  charter: scannerClockPriorShadowEvaluationCharterDefinition,
});
if (!charterInput) throw new Error("charter fixture must build");
const charter: RecommendationEvaluationCharter = {
  ...charterInput,
  charter_id: "22222222-2222-4222-8222-222222222222",
  created_at: "2026-09-27T08:00:00.000Z",
};
const policyReference = buildScannerClockPriorShadowPolicyReference({
  charter,
  createdAt: charter.created_at,
});
if (!policyReference) throw new Error("policy reference fixture must build");
const plan = buildScannerClockPriorShadowForwardDecisionPlan({
  created_at: "2026-09-27T08:01:00.000Z",
  owner_user_id: ownerUserId,
  segment_key: segmentKey,
  hypothesis: charter.charter.hypothesis,
  evaluation_charter_id: charter.charter_id,
  evaluation_charter_fingerprint: charter.charter_fingerprint,
  policy_reference: policyReference,
  baseline_ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  candidate_ranking_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
  primary_k: scannerClockPriorShadowForwardPlanProfile.primary_k,
  windows: scannerClockPriorShadowForwardPlanProfile.windows,
  thresholds: scannerClockPriorShadowForwardPlanProfile.thresholds,
});
if (!plan) throw new Error("plan fixture must build");
const planReceipt: ScannerClockPriorShadowForwardDecisionPlanReceipt = {
  plan_id: "33333333-3333-4333-8333-333333333333",
  plan_fingerprint: plan.plan_fingerprint,
  owner_user_id: ownerUserId,
  plan,
  recorded_at: "2026-09-27T08:02:00.000Z",
};

function snapshot(index: number): RecommendationSnapshot {
  const fingerprint = `snapshot-${index}`;
  const candidateId = `candidate-${index}`;
  const anchor = buildRecommendationOutcomeEvaluationAnchor(decidedAt);
  return {
    id: `snapshot-id-${index}`,
    snapshot_fingerprint: fingerprint,
    recommendation_id: null,
    scan_run_id: "scan-fingerprint-1",
    ticker: `T${String(index).padStart(3, "0")}`,
    company_name: "Fixture",
    recommended_at: decidedAt,
    app_timestamp: decidedAt,
    window: "morning",
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
    entry_low: 99,
    entry_high: 101,
    stop: 96,
    target: 108,
    side: "long",
    risk_per_share: 4,
    reward_per_share: 8,
    planned_risk_reward: 2,
    confidence: 0.7,
    score: 70,
    rating: "valid",
    label: "research only",
    type: "VWAP_RECLAIM",
    rationale: "fixture",
    reason: "fixture",
    catalyst: "fixture",
    primary_risk: "fixture",
    market_data_snapshot: null,
    quote_price: 100,
    volume: 1_000_000,
    liquidity: "high",
    spread: 0.01,
    freshness: "fresh",
    data_age_minutes: 1,
    intake_quality_json: null,
    scan_observability_json: null,
    empty_state_json: null,
    quality_json: null,
    payload_json: {
      visibility_status: "research_only",
      not_live_trade_signal: true,
      visible_in_primary_recommendations: false,
      research_only: true,
      learning_scope: "research_only",
      clock_prior_shadow_evidence_sample: true,
      clock_prior_shadow_evidence_reuse_version:
        SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION,
      candidate_id: candidateId,
      candidate_decision_id: candidateId,
      candidate_decision_disposition: "ranked_not_selected",
      candidate_decision_linkage_status: "verified",
      scan_run_fingerprint: "scan-fingerprint-1",
      batch_fingerprint: "batch-1",
      sample_quality: "good",
      provider_source: "twelve_data",
      data_timestamp: sourceAt,
      explicit_metadata_gaps: [],
      outcome_evaluation_anchor: anchor,
    },
    was_taken: false,
    linked_position_id: null,
    created_at: decidedAt,
    updated_at: decidedAt,
  };
}

function completeOutcome(value: RecommendationSnapshot): RecommendationOutcome {
  const anchor = buildRecommendationOutcomeEvaluationAnchor(value.recommended_at);
  if (anchor.status !== "anchored") throw new Error("anchor fixture must build");
  const startAt = anchor.evaluation_anchor_start_at;
  const candles = Array.from({ length: 12 }, (_, index) => ({
    timestamp: new Date(Date.parse(startAt) + index * 5 * 60_000).toISOString(),
    open: 100,
    high: 101,
    low: 99,
    close: 100,
  }));
  const coverage = buildCanonicalOutcomeProviderCoverageReceipt({
    candles,
    request: {
      interval: "5min",
      start_at: startAt,
      end_at: new Date(Date.parse(startAt) + 60 * 60_000).toISOString(),
      horizon: "60m",
      decision_timestamp: anchor.decision_timestamp,
      evaluation_anchor_start_at: anchor.evaluation_anchor_start_at,
      decision_to_anchor_seconds: anchor.decision_to_anchor_seconds,
      decision_timestamp_interval_aligned:
        anchor.decision_timestamp_interval_aligned,
    },
    result: { status: "available", provider: "twelve_data" },
  });
  return {
    id: `outcome-${value.snapshot_fingerprint}`,
    snapshot_id: value.id,
    snapshot_fingerprint: value.snapshot_fingerprint,
    recommendation_id: null,
    ticker: value.ticker,
    side: "long",
    recommended_at: value.recommended_at,
    evaluated_at: "2026-09-28T14:46:00.000Z",
    horizon: "60m",
    status: "neither_hit",
    entry: 100,
    stop: 96,
    target: 108,
    entry_triggered: true,
    entry_triggered_at: decidedAt,
    target_hit: false,
    target_hit_at: null,
    stop_hit: false,
    stop_hit_at: null,
    first_terminal_event: "neither",
    best_price_after_recommendation: 101,
    worst_price_after_recommendation: 99,
    best_r: 0.25,
    worst_r: -0.25,
    eod_price: null,
    eod_r: null,
    current_price: 100,
    current_r: 0,
    max_favorable_excursion: 1,
    max_adverse_excursion: 1,
    time_to_entry_minutes: 0,
    time_to_target_minutes: null,
    time_to_stop_minutes: null,
    source: "intraday_candles",
    provider: "twelve_data",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: { canonical_provider_coverage: coverage },
    created_at: "2026-09-28T14:46:00.000Z",
    updated_at: "2026-09-28T14:46:00.000Z",
  };
}

function assess(
  snapshots: RecommendationSnapshot[],
  outcomes: RecommendationOutcome[] = [],
  evaluatedAt = "2026-09-28T15:00:00.000Z",
) {
  return assessScannerClockPriorShadowForwardOutcomeAdmission({
    evaluatedAt,
    plan,
    snapshots,
    outcomes,
  });
}

test("admits only the exact mature incomplete 60m backlog", () => {
  const first = snapshot(1);
  const second = snapshot(2);
  const result = assess([first, second], [completeOutcome(first)]);

  expect(result).toMatchObject({
    contract_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_OUTCOME_ADMISSION_VERSION,
    outcome_policy_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_OUTCOME_POLICY_VERSION,
    status: "admitted",
    reason_codes: ["mature_incomplete_primary_outcomes_present"],
    plan_fingerprint: plan.plan_fingerprint,
    primary_horizon: "60m",
    cohort: {
      admitted_snapshot_count: 2,
      complete_primary_outcome_count: 1,
      due_incomplete_snapshot_count: 1,
      not_yet_due_snapshot_count: 0,
      due_snapshot_fingerprints: [second.snapshot_fingerprint],
      next_maturity_at: null,
    },
    series: {
      maximum_snapshots_per_attempt: 4,
      required_attempts: 1,
      maximum_provider_credits: 4,
    },
  });
  expect(Object.values(result.authority).every((value) => value === false)).toBe(
    true,
  );
});

test("distinguishes immature snapshots from a completed cohort", () => {
  const value = snapshot(1);
  expect(assess([value], [], "2026-09-28T14:30:00.000Z")).toMatchObject({
    status: "not_yet_due",
    reason_codes: ["primary_outcome_horizon_not_yet_elapsed"],
    cohort: {
      due_incomplete_snapshot_count: 0,
      not_yet_due_snapshot_count: 1,
      next_maturity_at: "2026-09-28T14:45:00.000Z",
    },
    series: { required_attempts: 0, maximum_provider_credits: 0 },
  });
  expect(assess([value], [completeOutcome(value)])).toMatchObject({
    status: "no_outcome_collection_needed",
    cohort: { complete_primary_outcome_count: 1 },
    series: { required_attempts: 0, maximum_provider_credits: 0 },
  });
});

test("ignores outcomes for non-clock-prior snapshots from the same scan", () => {
  const target = snapshot(1);
  const visible = snapshot(2);
  const payload = { ...visible.payload_json };
  delete payload.clock_prior_shadow_evidence_sample;
  delete payload.clock_prior_shadow_evidence_reuse_version;
  const unrelated = {
    ...visible,
    source_mode: "live",
    data_mode: "live",
    is_visible: true,
    status: "visible" as const,
    payload_json: payload,
  };

  expect(assess([target, unrelated], [completeOutcome(unrelated)])).toMatchObject({
    status: "admitted",
    cohort: {
      admitted_snapshot_count: 1,
      due_incomplete_snapshot_count: 1,
      due_snapshot_fingerprints: [target.snapshot_fingerprint],
    },
  });
});

test("fails closed on duplicate canonical rows and rejected cohort lineage", () => {
  const value = snapshot(1);
  const first = completeOutcome(value);
  expect(assess([value], [first, { ...first, id: "duplicate" }])).toMatchObject({
    status: "blocked",
    reason_codes: ["duplicate_60m_outcome"],
  });

  expect(assess([{
    ...value,
    payload_json: { ...value.payload_json, sample_quality: "partial" },
  }])).toMatchObject({
    status: "blocked",
    reason_codes: ["clock_prior_snapshot_admission_rejected"],
  });
});

test("blocks a backlog larger than the predeclared bounded series", () => {
  const snapshots = Array.from({ length: 65 }, (_, index) => snapshot(index));
  expect(assess(snapshots)).toMatchObject({
    status: "blocked",
    reason_codes: ["outcome_backlog_exceeds_bounded_series_capacity"],
    series: { required_attempts: 0, maximum_provider_credits: 0 },
  });
});

function serviceDependencies(
  overrides: Partial<
    ScannerClockPriorShadowForwardOutcomeAdmissionDependencies
  > = {},
): ScannerClockPriorShadowForwardOutcomeAdmissionDependencies {
  return {
    readPlans: async () => ({
      status: "available",
      receipts: [planReceipt],
      safe_blocker: null,
    }),
    readEvidence: async () => ({
      status: "available",
      snapshots: [snapshot(1)],
      outcomes: [],
      source_counts: {
        window_scan_rows: 1,
        clock_prior_scan_rows: 1,
        window_snapshot_rows: 1,
        linked_snapshot_rows: 1,
        window_outcome_rows: 0,
        linked_outcome_rows: 0,
      },
      safe_blocker: null,
    }),
    assess: assessScannerClockPriorShadowForwardOutcomeAdmission,
    ...overrides,
  };
}

test("the service binds one exact plan and bounded evidence to the owner", async () => {
  const service = createScannerClockPriorShadowForwardOutcomeAdmissionService(
    serviceDependencies(),
  );
  const result = await service.read({
    ownerUserId,
    now: new Date("2026-09-28T15:00:00.000Z"),
  });

  expect(result).toMatchObject({
    status: "available",
    plan_receipt: planReceipt,
    admission: {
      status: "admitted",
      cohort: { due_incomplete_snapshot_count: 1 },
      series: { required_attempts: 1, maximum_provider_credits: 4 },
    },
    source_counts: {
      linked_snapshot_rows: 1,
      linked_outcome_rows: 0,
    },
    authority: scannerClockPriorShadowForwardOutcomeAdmissionAuthority,
  });
});

test("the service fails closed before evidence read on owner mismatch", async () => {
  let evidenceRead = false;
  const service = createScannerClockPriorShadowForwardOutcomeAdmissionService(
    serviceDependencies({
      readPlans: async () => ({
        status: "available",
        receipts: [{
          ...planReceipt,
          owner_user_id: "44444444-4444-4444-8444-444444444444",
        }],
        safe_blocker: null,
      }),
      readEvidence: async () => {
        evidenceRead = true;
        return serviceDependencies().readEvidence(ownerUserId, plan);
      },
    }),
  );

  await expect(service.read({ ownerUserId })).resolves.toMatchObject({
    status: "conflicting",
    admission: null,
    safe_blocker:
      "clock_prior_forward_outcome_admission_plan_owner_mismatched",
  });
  expect(evidenceRead).toBe(false);
});

test("the owner readback route is session-bound, uncached, and read-only", () => {
  const route = readFileSync(resolve(
    process.cwd(),
    "app/api/app/scanner-clock-prior-shadow-forward-outcome-admission/route.ts",
  ), "utf8");

  expect(route).toContain("requireApplicationSession");
  expect(route).toContain("session.owner_user_id");
  expect(route).toContain('export const dynamic = "force-dynamic"');
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);
  expect(route).not.toContain("runRecommendationOutcomeEvaluation");
  expect(route).not.toContain("persistRecommendationOutcome");
  expect(route).not.toContain("publishCandidate");
  expect(route).not.toContain("broker");

  const evidence = readFileSync(resolve(
    process.cwd(),
    "lib/server/scanner-clock-prior-shadow-forward-evidence.ts",
  ), "utf8");
  const ownerFilters = evidence.match(/\.eq\("owner_user_id", owner\)/g) ?? [];
  expect(ownerFilters.length).toBeGreaterThanOrEqual(3);
  expect(evidence).toContain('select("*", { count: "exact" })');
  expect(evidence).toContain("MAXIMUM_WINDOW_SNAPSHOT_ROWS + 1");
  expect(evidence).toContain("MAXIMUM_WINDOW_OUTCOME_ROWS + 1");
});
