import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildCurrentDecisionStrategyReference } from "@/lib/decision-strategy-registry";
import {
  buildInternalPaperDecisionHandoff,
  INTERNAL_PAPER_HANDOFF_CONTEXT_VERSION,
  type InternalPaperHandoffAccountContext,
} from "@/lib/internal-paper-handoff";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  INTERNAL_PAPER_WORKER_ENABLED_FLAG,
  SCHEDULED_FUNCTIONS_DISABLE_FLAG,
  internalPaperWorkerHostEnabled,
  internalPaperWorkerScheduledEvent,
} from "../../netlify/functions/scheduled-internal-paper-worker";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";
const SCAN_ID = "scan-c4";
const SCAN_FINGERPRINT = "scan-c4-fingerprint";
const DECISION_AT = "2026-09-22T14:31:00.000Z";

function decision(): CandidateDecisionRecord {
  return {
    record_version: "candidate_decision_record_v3",
    record_kind: "candidate_decision_record",
    scan_run_id: SCAN_ID,
    scan_run_fingerprint: SCAN_FINGERPRINT,
    decision_timestamp: DECISION_AT,
    strategy_reference: buildCurrentDecisionStrategyReference("scanner_universe_v1"),
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
      expected_candidate_count: 1,
      observed_candidate_count: 1,
      ranked_candidate_count: 1,
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
          source_timestamp: "2026-09-22T14:30:00.000Z",
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
        build: { built: true, rejection_reason: null, explanation: "fixture" },
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

function account(): InternalPaperHandoffAccountContext {
  const strategy = decision().strategy_reference!;
  return {
    context_version: INTERNAL_PAPER_HANDOFF_CONTEXT_VERSION,
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    status: "ready",
    config_version: "pilot-v1",
    strategy_id: strategy.strategy_id,
    strategy_version: strategy.strategy_version,
    strategy_rollback_identity: strategy.rollback_identity,
    symbol_selection_policy_id: strategy.symbol_selection.policy_id,
    symbol_selection_policy_version: strategy.symbol_selection.policy_version,
    observed_universe_version: strategy.symbol_selection.observed_universe_version,
    eligible_symbols: ["AAPL", "MSFT"],
    cash_balance: 100_000,
    per_trade_risk_cap: 501,
    spread_bps: 10,
    slippage_bps: 10,
    commission_per_order: 1,
  };
}

function build(overrides: Partial<Parameters<typeof buildInternalPaperDecisionHandoff>[0]> = {}) {
  const currentSnapshot = snapshot();
  return buildInternalPaperDecisionHandoff({
    owner_user_id: OWNER_ID,
    scan_run_id: SCAN_ID,
    decision: decision(),
    decision_lineage_status: "reconstructable",
    scan_run_persisted: true,
    snapshots: [currentSnapshot],
    persisted_snapshot_fingerprints: [currentSnapshot.snapshot_fingerprint],
    account: account(),
    ...overrides,
  });
}

test.describe("SV-C4 decision handoff and dormant worker host", () => {
  test("sizes and queues one persisted top-ranked entry within cash and risk caps", () => {
    expect(build()).toMatchObject({
      status: "ready",
      selected_ticker: "AAPL",
      quantity: 97,
      job: {
        work_kind: "entry",
        owner_user_id: OWNER_ID,
        account_id: ACCOUNT_ID,
        payload: { ticker: "AAPL", quantity: 97 },
      },
    });
  });

  test("turns an exact persisted no-trade decision into a zero-effect job", () => {
    const noTrade = decision();
    noTrade.candidates = [];
    noTrade.final_decision = {
      disposition: "no_trade",
      published_tickers: [],
      no_trade_reason: "below_publish_threshold",
      recommendation_build_path: null,
    };
    expect(build({ decision: noTrade, snapshots: [], persisted_snapshot_fingerprints: [] }))
      .toMatchObject({
        status: "ready",
        selected_ticker: null,
        quantity: null,
        job: { work_kind: "no_trade" },
      });
  });

  test("fails closed for incomplete persistence, paused accounts and strategy drift", () => {
    expect(build({ scan_run_persisted: false })).toMatchObject({
      status: "blocked",
      reason_codes: ["handoff_persistence_incomplete"],
    });
    expect(build({ account: { ...account(), status: "paused" } })).toMatchObject({
      status: "blocked",
      reason_codes: ["handoff_account_not_ready"],
    });
    expect(
      build({ account: { ...account(), strategy_version: "different" } }),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["handoff_account_scope_mismatch"],
    });
  });

  test("requires both explicit gates and an authentic bounded schedule event", () => {
    const values = new Map<string, string>();
    const environment = { get: (name: string) => values.get(name) };
    expect(internalPaperWorkerHostEnabled(environment)).toBe(false);
    values.set(INTERNAL_PAPER_WORKER_ENABLED_FLAG, "true");
    expect(internalPaperWorkerHostEnabled(environment)).toBe(false);
    values.set(SCHEDULED_FUNCTIONS_DISABLE_FLAG, "false");
    expect(internalPaperWorkerHostEnabled(environment)).toBe(true);

    expect(
      internalPaperWorkerScheduledEvent({
        next_run: "2026-09-22T14:45:00.000Z",
        delivered_at: new Date("2026-09-22T14:30:30.000Z"),
      }),
    ).toBe("2026-09-22T14:30:00.000Z");
    expect(
      internalPaperWorkerScheduledEvent({
        next_run: null,
        delivered_at: new Date("2026-09-22T14:30:30.000Z"),
      }),
    ).toBeNull();
  });

  test("keeps the deployed host inert before loading database runtime", () => {
    const source = readFileSync(
      resolve(process.cwd(), "netlify/functions/scheduled-internal-paper-worker.ts"),
      "utf8",
    );
    const gate = source.indexOf("if (!internalPaperWorkerHostEnabled(Netlify.env))");
    const runtime = source.indexOf("runtimeRequire(");
    expect(gate).toBeGreaterThan(0);
    expect(runtime).toBeGreaterThan(gate);
    expect(source).toContain('schedule: "*/15 13-21 * * 1-5"');
    expect(source).toContain("scheduled-internal-paper-worker-runtime.cjs");
    expect(source).not.toContain("twelve_data");
    expect(source).not.toContain("broker");

    const route = readFileSync(
      resolve(process.cwd(), "app/api/automation/run-scan/route.ts"),
      "utf8",
    );
    expect(route).toContain('"TURE_INTERNAL_PAPER_HANDOFF_ENABLED"');
    expect(route).toContain('"TURE_INTERNAL_PAPER_ACCOUNT_ID"');
    expect(route.indexOf("persistAutomationArtifacts({")).toBeLessThan(
      route.indexOf("handoffPersistedDecisionToInternalPaper({"),
    );

    const migration = readFileSync(
      resolve(
        process.cwd(),
        "supabase/migrations/20260922062854_sv_c4_internal_paper_handoff_context.sql",
      ),
      "utf8",
    );
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = pg_catalog, public");
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("to service_role");
    expect(migration).not.toContain("insert into");
  });
});
