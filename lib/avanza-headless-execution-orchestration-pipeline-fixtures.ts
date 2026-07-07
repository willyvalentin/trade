import type {
  AvanzaHeadlessExecutionContractInput,
} from "./avanza-headless-execution-data-contract";
import {
  runAvanzaHeadlessExecutionOrchestrationPipeline,
  type AvanzaHeadlessExecutionOrchestrationReport,
  type AvanzaHeadlessExecutionOrchestrationStatus,
} from "./avanza-headless-execution-orchestration-pipeline";

export type AvanzaHeadlessExecutionOrchestrationPipelineFixtureId =
  | "recommendation_buy_orchestration_ready"
  | "live_position_sell_orchestration_ready"
  | "exit_outranks_entry_orchestration"
  | "stop_loss_exit_orchestration_selected"
  | "target_exit_orchestration_selected"
  | "no_candidates"
  | "all_candidates_blocked"
  | "selector_blocked"
  | "plan_blocked"
  | "session_blocked"
  | "profile_incomplete_warning"
  | "login_unknown_next_step"
  | "login_ready_next_step"
  | "settlement_expectation_carried_through"
  | "ui_hidden_under_surface"
  | "no_order_submission"
  | "final_human_click_required"
  | "bankid_forbidden"
  | "cookies_session_forbidden"
  | "supabase_write_forbidden";

export type AvanzaHeadlessExecutionOrchestrationPipelineFixture = {
  fixtureId: AvanzaHeadlessExecutionOrchestrationPipelineFixtureId;
  label: string;
  expectedStatus: AvanzaHeadlessExecutionOrchestrationStatus;
  report: AvanzaHeadlessExecutionOrchestrationReport;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const recommendationBuy: AvanzaHeadlessExecutionContractInput = {
  confidence: 0.84,
  entryPrice: 58.2,
  instrumentName: "Nokia Oyj",
  intent: "entry_buy",
  isin: "FI0009000681",
  limitPrice: 58.4,
  marketPlace: "Stockholm",
  orderType: "limit",
  profileReady: true,
  quantity: 120,
  recommendationId: "rec-orchestration-buy-001",
  rewardRisk: 2.6,
  side: "buy",
  source: "recommendation",
  stopLoss: 54.8,
  targetPrice: 66.8,
  ticker: "NOKIA",
};

const livePositionSell: AvanzaHeadlessExecutionContractInput = {
  confidence: 0.76,
  instrumentName: "Volvo B",
  intent: "exit_sell",
  isin: "SE0000115446",
  limitPrice: 286.2,
  marketPlace: "Stockholm",
  orderType: "limit",
  positionId: "position-orchestration-sell-001",
  profileReady: true,
  quantity: 40,
  rewardRisk: 1.8,
  side: "sell",
  source: "live_position",
  stopLoss: 266.4,
  targetPrice: 286.2,
  ticker: "VOLV B",
  warnings: ["Target exit candidate modeled."],
};

const stopLossSell: AvanzaHeadlessExecutionContractInput = {
  ...livePositionSell,
  limitPrice: 265.8,
  positionId: "position-orchestration-stop-loss-001",
  stopLoss: 266.4,
  targetPrice: 291.2,
  warnings: ["Stop-loss exit candidate modeled."],
};

function run(
  fixtureId: AvanzaHeadlessExecutionOrchestrationPipelineFixtureId,
  input: Parameters<typeof runAvanzaHeadlessExecutionOrchestrationPipeline>[0],
) {
  return runAvanzaHeadlessExecutionOrchestrationPipeline({
    orchestrationId: fixtureId,
    now: fixtureNow,
    ...input,
  });
}

function fixture(
  fixtureId: AvanzaHeadlessExecutionOrchestrationPipelineFixtureId,
  label: string,
  expectedStatus: AvanzaHeadlessExecutionOrchestrationStatus,
  report: AvanzaHeadlessExecutionOrchestrationReport,
): AvanzaHeadlessExecutionOrchestrationPipelineFixture {
  return { expectedStatus, fixtureId, label, report };
}

export const avanzaHeadlessExecutionOrchestrationPipelineFixtures:
  AvanzaHeadlessExecutionOrchestrationPipelineFixture[] = [
    fixture(
      "recommendation_buy_orchestration_ready",
      "Recommendation BUY orchestration ready",
      "ready_orchestration",
      run("recommendation_buy_orchestration_ready", {
        customerType: "private",
        loginKnown: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "live_position_sell_orchestration_ready",
      "Live-position SELL orchestration ready",
      "ready_orchestration",
      run("live_position_sell_orchestration_ready", {
        customerType: "private",
        livePositions: [livePositionSell],
        loginKnown: true,
        profileReady: true,
      }),
    ),
    fixture(
      "exit_outranks_entry_orchestration",
      "Exit outranks entry orchestration",
      "ready_orchestration",
      run("exit_outranks_entry_orchestration", {
        customerType: "private",
        livePositions: [livePositionSell],
        loginKnown: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "stop_loss_exit_orchestration_selected",
      "Stop-loss priority orchestration selected",
      "ready_orchestration",
      run("stop_loss_exit_orchestration_selected", {
        customerType: "private",
        livePositions: [livePositionSell, stopLossSell],
        loginKnown: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "target_exit_orchestration_selected",
      "Target exit orchestration selected",
      "ready_orchestration",
      run("target_exit_orchestration_selected", {
        customerType: "private",
        livePositions: [livePositionSell],
        loginKnown: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "no_candidates",
      "No candidates",
      "no_candidates",
      run("no_candidates", { profileReady: true }),
    ),
    fixture(
      "all_candidates_blocked",
      "All candidates blocked",
      "all_candidates_blocked",
      run("all_candidates_blocked", {
        livePositions: [{ ...livePositionSell, blockers: ["Risk blocked."] }],
        profileReady: true,
        recommendations: [{ ...recommendationBuy, blockers: ["Risk blocked."] }],
      }),
    ),
    fixture(
      "selector_blocked",
      "Selector blocked",
      "selector_blocked",
      run("selector_blocked", {
        mode: "automatic_forbidden",
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "plan_blocked",
      "Plan blocked",
      "plan_blocked",
      run("plan_blocked", {
        forcePlanBlocked: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "session_blocked",
      "Session blocked",
      "session_blocked",
      run("session_blocked", {
        forceSessionBlocked: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "profile_incomplete_warning",
      "Profile incomplete warning",
      "ready_orchestration",
      run("profile_incomplete_warning", {
        loginKnown: true,
        profileReady: false,
        recommendations: [{ ...recommendationBuy, profileReady: false }],
      }),
    ),
    fixture(
      "login_unknown_next_step",
      "Login unknown next step",
      "ready_orchestration",
      run("login_unknown_next_step", {
        customerType: "private",
        loginKnown: false,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "login_ready_next_step",
      "Login ready next step",
      "ready_orchestration",
      run("login_ready_next_step", {
        customerType: "company",
        loginKnown: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "settlement_expectation_carried_through",
      "Settlement expectation carried through",
      "ready_orchestration",
      run("settlement_expectation_carried_through", {
        livePositions: [livePositionSell],
        loginKnown: true,
        profileReady: true,
      }),
    ),
    fixture(
      "ui_hidden_under_surface",
      "UI hidden under surface",
      "ready_orchestration",
      run("ui_hidden_under_surface", {
        loginKnown: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "no_order_submission",
      "No order submission",
      "ready_orchestration",
      run("no_order_submission", {
        loginKnown: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "final_human_click_required",
      "Final human click required",
      "ready_orchestration",
      run("final_human_click_required", {
        loginKnown: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "bankid_forbidden",
      "BankID forbidden",
      "ready_orchestration",
      run("bankid_forbidden", {
        loginKnown: false,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "ready_orchestration",
      run("cookies_session_forbidden", {
        loginKnown: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
    fixture(
      "supabase_write_forbidden",
      "Supabase write forbidden",
      "ready_orchestration",
      run("supabase_write_forbidden", {
        loginKnown: true,
        profileReady: true,
        recommendations: [recommendationBuy],
      }),
    ),
  ];
