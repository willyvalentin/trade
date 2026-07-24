import {
  buildAvanzaHeadlessExecutionContract,
  type AvanzaHeadlessExecutionContract,
  type AvanzaHeadlessExecutionContractInput,
  type AvanzaHeadlessExecutionContractStatus,
} from "./avanza-headless-execution-data-contract";

export type AvanzaHeadlessExecutionDataContractFixtureId =
  | "recommendation_entry_buy_ready_headless"
  | "live_position_exit_sell_ready_headless"
  | "missing_ticker"
  | "missing_side"
  | "missing_quantity"
  | "missing_limit_price"
  | "market_order_blocked"
  | "incomplete_profile_warning"
  | "settlement_expectation_present"
  | "human_final_click_required"
  | "forbidden_order_submission"
  | "forbidden_bankid_automation"
  | "forbidden_cookies_session"
  | "forbidden_supabase_write"
  | "ui_hidden_under_surface";

export type AvanzaHeadlessExecutionDataContractFixture = {
  fixtureId: AvanzaHeadlessExecutionDataContractFixtureId;
  label: string;
  expectedStatus: AvanzaHeadlessExecutionContractStatus;
  contract: AvanzaHeadlessExecutionContract;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const readyInput: AvanzaHeadlessExecutionContractInput = {
  confidence: 0.82,
  entryPrice: 58.2,
  instrumentName: "Nokia Oyj",
  intent: "entry_buy",
  isin: "FI0009000681",
  limitPrice: 58.4,
  marketPlace: "Stockholm",
  orderType: "limit",
  profileReady: true,
  quantity: 120,
  readinessModeled: true,
  recommendationId: "rec-headless-buy-001",
  rewardRisk: 2.4,
  settlementModeled: true,
  side: "buy",
  source: "recommendation",
  stopLoss: 54.8,
  targetPrice: 66.8,
  ticker: "NOKIA",
};

function fixture(
  fixtureId: AvanzaHeadlessExecutionDataContractFixtureId,
  label: string,
  expectedStatus: AvanzaHeadlessExecutionContractStatus,
  input: AvanzaHeadlessExecutionContractInput,
): AvanzaHeadlessExecutionDataContractFixture {
  return {
    contract: buildAvanzaHeadlessExecutionContract({
      ...readyInput,
      ...input,
      contractId: `fixture-${fixtureId}`,
      now: fixtureNow,
    }),
    expectedStatus,
    fixtureId,
    label,
  };
}

export const avanzaHeadlessExecutionDataContractFixtures:
  AvanzaHeadlessExecutionDataContractFixture[] = [
    fixture(
      "recommendation_entry_buy_ready_headless",
      "Recommendation entry BUY ready headless contract",
      "ready_headless",
      {
        warnings: ["Recommendation entry BUY contract modeled."],
      },
    ),
    fixture(
      "live_position_exit_sell_ready_headless",
      "Live-position exit SELL ready headless contract",
      "ready_headless",
      {
        confidence: 0.74,
        entryPrice: 278.5,
        instrumentName: "Volvo B",
        intent: "exit_sell",
        isin: "SE0000115446",
        limitPrice: 286.2,
        positionId: "position-headless-sell-001",
        quantity: 40,
        recommendationId: undefined,
        rewardRisk: 1.8,
        side: "sell",
        source: "live_position",
        stopLoss: 266.4,
        targetPrice: 286.2,
        ticker: "VOLV B",
        warnings: ["Live-position exit SELL contract modeled."],
      },
    ),
    fixture("missing_ticker", "Missing ticker", "missing_ticker", {
      ticker: undefined,
    }),
    fixture("missing_side", "Missing side", "missing_side", {
      side: "unknown",
    }),
    fixture("missing_quantity", "Missing quantity", "missing_quantity", {
      quantity: undefined,
    }),
    fixture("missing_limit_price", "Missing limit price", "missing_limit_price", {
      limitPrice: undefined,
    }),
    fixture("market_order_blocked", "Market order blocked", "blocked", {
      orderType: "market_forbidden",
    }),
    fixture(
      "incomplete_profile_warning",
      "Incomplete profile warning",
      "ready_headless",
      {
        profileReady: false,
      },
    ),
    fixture(
      "settlement_expectation_present",
      "Settlement expectation present",
      "ready_headless",
      {
        warnings: ["Settlement expectation modeled for avräkningsnota reconciliation."],
      },
    ),
    fixture(
      "human_final_click_required",
      "Human final click required",
      "ready_headless",
      {
        warnings: ["Human final KÖP/SÄLJ required."],
      },
    ),
    fixture("forbidden_order_submission", "Forbidden order submission", "blocked", {
      blockers: ["Order submission by the agent is forbidden."],
    }),
    fixture(
      "forbidden_bankid_automation",
      "Forbidden BankID automation",
      "blocked",
      {
        blockers: ["BankID automation is forbidden."],
      },
    ),
    fixture(
      "forbidden_cookies_session",
      "Forbidden cookies/session",
      "blocked",
      {
        blockers: ["Cookie/session handling is forbidden."],
      },
    ),
    fixture("forbidden_supabase_write", "Forbidden Supabase write", "blocked", {
      blockers: ["Supabase execution writes are forbidden in this task."],
    }),
    fixture(
      "ui_hidden_under_surface",
      "UI hidden under surface",
      "local_dev_only",
      {
        readinessModeled: false,
        warnings: ["UI hidden under surface; contract remains agent-readable only."],
      },
    ),
  ];
