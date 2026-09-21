import { expect, test } from "@playwright/test";

import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildCurrentDecisionStrategyReference } from "@/lib/decision-strategy-registry";
import {
  buildInternalPaperEntryCommand,
  INTERNAL_PAPER_ENTRY_COMMAND_VERSION,
  INTERNAL_PAPER_FILL_MODEL_VERSION,
} from "@/lib/internal-paper-entry";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";
const SCAN_ID = "scan-run-2026-09-21-opening";
const SCAN_FINGERPRINT = "scan-fingerprint-2026-09-21-opening";
const DECISION_AT = "2026-09-21T14:31:00.000Z";

function decision(): CandidateDecisionRecord {
  return {
    record_version: "candidate_decision_record_v3",
    record_kind: "candidate_decision_record",
    scan_run_id: SCAN_ID,
    scan_run_fingerprint: SCAN_FINGERPRINT,
    decision_timestamp: DECISION_AT,
    strategy_reference: buildCurrentDecisionStrategyReference(
      "scanner_universe_v1",
    ),
    versions: {
      scanner_version: "scanner_v1",
      universe_version: "scanner_universe_v1",
      scoring_version: "day_trade_score_v1",
      ranking_version: "scanner_candidate_ranking_v1",
      build_version: "test-build-v1",
      provider_contract_version: "twelve_data_market_data_v1",
    },
    learning_attribution: {} as CandidateDecisionRecord["learning_attribution"],
    coverage: {
      expected_candidate_count: 2,
      observed_candidate_count: 2,
      ranked_candidate_count: 2,
      full_membership_declared: true,
      full_membership_captured: true,
      membership_reason_codes: [],
      pre_truncation_capture_evidence: null,
    },
    candidates: [
      {
        candidate_id: `scanner_candidate:v1:${SCAN_ID}:AAPL`,
        ticker: "AAPL",
        company_name: "Apple",
        sector: "Technology",
        disposition: "published",
        eligibility: "eligible",
        reason_codes: [],
        data: {
          provider_source: "twelve_data",
          source_timestamp: "2026-09-21T14:30:00.000Z",
          freshness: "fresh",
          indicator_source: "fresh",
          gap_codes: [],
        },
        ranking: {
          rank: 1,
          score: 91,
          tier: "strong",
          selected: true,
          selection_bucket: "publishable",
          rank_reason: "fixture",
          tie_break_key: "AAPL",
          components: {} as NonNullable<
            CandidateDecisionRecord["candidates"][number]["ranking"]
          >["components"],
          warnings: [],
          gaps: [],
        },
        build: {
          built: true,
          rejection_reason: null,
          explanation: "fixture",
        },
      },
    ],
    final_decision: {
      disposition: "recommendations_published",
      published_tickers: ["AAPL"],
      no_trade_reason: null,
      recommendation_build_path: "published",
    },
  };
}

function snapshot() {
  return buildRecommendationSnapshot({
    recommendation_id: "recommendation-aapl",
    scan_run_id: SCAN_FINGERPRINT,
    ticker: "AAPL",
    company_name: "Apple",
    recommended_at: DECISION_AT,
    app_timestamp: DECISION_AT,
    source_mode: "supabase",
    data_mode: "live",
    is_visible: true,
    is_demo: false,
    is_mock: false,
    is_real: true,
    entry: 100,
    stop: 95,
    target: 112,
    side: "long",
    freshness: "fresh",
  });
}

function build(overrides: Partial<Parameters<typeof buildInternalPaperEntryCommand>[0]> = {}) {
  return buildInternalPaperEntryCommand({
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    scan_run_id: SCAN_ID,
    decision: decision(),
    snapshot: snapshot(),
    eligible_symbols: ["AAPL", "MSFT"],
    quantity: 10,
    ...overrides,
  });
}

test.describe("SV-C1 internal-paper entry admission", () => {
  test("binds one real published decision to a brokerless whole-share command", () => {
    expect(build()).toEqual({
      status: "ready",
      reason_codes: [],
      command: expect.objectContaining({
        command_version: INTERNAL_PAPER_ENTRY_COMMAND_VERSION,
        fill_model_version: INTERNAL_PAPER_FILL_MODEL_VERSION,
        owner_user_id: OWNER_ID,
        account_id: ACCOUNT_ID,
        scan_run_id: SCAN_ID,
        scan_run_fingerprint: SCAN_FINGERPRINT,
        ticker: "AAPL",
        quantity: 10,
        arrival_price: 100,
        stop_price: 95,
        target_price: 112,
      }),
    });
  });

  test("preserves explicit no-trade as a valuable zero-command result", () => {
    const noTrade = decision();
    noTrade.final_decision = {
      disposition: "no_trade",
      published_tickers: [],
      no_trade_reason: "below_publish_threshold",
      recommendation_build_path: null,
    };

    expect(build({ decision: noTrade })).toEqual({
      status: "no_trade",
      reason_codes: ["decision_not_publishable"],
      command: null,
    });
  });

  test("fails closed for stale evidence, forged snapshot linkage and oversized pilot scope", () => {
    const stale = decision();
    stale.candidates[0].data.freshness = "stale";
    const forgedSnapshot = {
      ...snapshot(),
      scan_run_id: "different-scan",
    };

    expect(
      build({
        decision: stale,
        snapshot: forgedSnapshot,
        eligible_symbols: Array.from({ length: 11 }, (_, index) => `T${index}`),
      }),
    ).toMatchObject({
      status: "blocked",
      command: null,
      reason_codes: [
        "decision_candidate_data_not_fresh",
        "pilot_symbol_scope_invalid",
        "snapshot_identity_mismatch",
      ],
    });
  });

  test("does not convert demo, mock or non-live snapshots into paper orders", () => {
    expect(
      build({
        snapshot: {
          ...snapshot(),
          source_mode: "demo",
          data_mode: "mock",
          is_real: false,
          is_demo: true,
        },
      }),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["snapshot_not_real_live_evidence"],
      command: null,
    });
  });
});
