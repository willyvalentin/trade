import {
  buildAvanzaInstrumentToOrderDryRunReport,
  type AvanzaInstrumentToOrderDryRunReport,
  type AvanzaInstrumentToOrderDryRunStatus,
} from "./avanza-instrument-to-order-dry-run-executor";
import {
  avanzaInstrumentToOrderHandoffChainFixtures,
} from "./avanza-instrument-to-order-handoff-chain-fixtures";
import type {
  AvanzaInstrumentToOrderHandoffChain,
  AvanzaVerifiedInstrumentHandoffState,
} from "./avanza-instrument-to-order-handoff-chain";

export type AvanzaInstrumentToOrderDryRunExecutorFixtureId =
  | "disabled"
  | "waiting_for_chain"
  | "blocked_chain"
  | "instrument_verification_failed"
  | "order_field_plan_failed"
  | "buy_dry_run_passed_to_final_human_action"
  | "sell_dry_run_passed_to_final_human_action"
  | "stop_before_final_kop"
  | "stop_before_final_salj"
  | "search_simulated_not_executed"
  | "navigation_simulated_not_executed"
  | "order_fields_simulated_not_filled"
  | "review_simulated_not_clicked"
  | "order_submission_forbidden"
  | "final_buy_sell_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaInstrumentToOrderDryRunExecutorFixture = {
  fixtureId: AvanzaInstrumentToOrderDryRunExecutorFixtureId;
  label: string;
  expectedStatus: AvanzaInstrumentToOrderDryRunStatus;
  report: AvanzaInstrumentToOrderDryRunReport;
};

function handoffChain(fixtureId: string): AvanzaInstrumentToOrderHandoffChain {
  const fixture = avanzaInstrumentToOrderHandoffChainFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing handoff chain fixture: ${fixtureId}`);
  }

  return fixture.chain;
}

function fixture(
  fixtureId: AvanzaInstrumentToOrderDryRunExecutorFixtureId,
  label: string,
  expectedStatus: AvanzaInstrumentToOrderDryRunStatus,
  options: {
    handoffChain?: AvanzaInstrumentToOrderHandoffChain;
    verifiedInstrumentState?: AvanzaVerifiedInstrumentHandoffState;
    forceError?: boolean;
    forceUnknown?: boolean;
    dryRunEnabled?: boolean;
  } = {},
): AvanzaInstrumentToOrderDryRunExecutorFixture {
  const report = buildAvanzaInstrumentToOrderDryRunReport({
    dryRunEnabled: options.dryRunEnabled ?? true,
    dryRunId: fixtureId,
    forceError: options.forceError,
    forceUnknown: options.forceUnknown,
    handoffChain: options.handoffChain,
    mode: "chain_dry_run_model",
    now: "2026-07-06T12:00:00.000Z",
    verifiedInstrumentState: options.verifiedInstrumentState,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    report,
  };
}

const completeBuyChain = handoffChain("complete_buy_handoff_chain_ready");
const completeSellChain = handoffChain("complete_sell_handoff_chain_ready");
const failedVerifiedInstrumentState: AvanzaVerifiedInstrumentHandoffState = {
  ...completeBuyChain.verifiedInstrumentState,
  blockedReasons: ["Instrument identity did not pass the dry-run check."],
  instrumentIdentityMatched: false,
  status: "verification_blocked",
};

export const avanzaInstrumentToOrderDryRunExecutorFixtures:
  AvanzaInstrumentToOrderDryRunExecutorFixture[] = [
    fixture("disabled", "Disabled dry-run executor", "disabled", {
      dryRunEnabled: false,
    }),
    fixture(
      "waiting_for_chain",
      "Waiting for handoff chain",
      "dry_run_waiting_for_chain",
    ),
    fixture("blocked_chain", "Blocked handoff chain", "dry_run_blocked", {
      handoffChain: handoffChain("invalid_execution_package"),
    }),
    fixture(
      "instrument_verification_failed",
      "Instrument verification failed",
      "dry_run_instrument_verification_failed",
      {
        handoffChain: completeBuyChain,
        verifiedInstrumentState: failedVerifiedInstrumentState,
      },
    ),
    fixture(
      "order_field_plan_failed",
      "Order field/action plan failed",
      "dry_run_order_plan_failed",
      {
        handoffChain: handoffChain("waiting_for_order_action_contract"),
      },
    ),
    fixture(
      "buy_dry_run_passed_to_final_human_action",
      "BUY dry-run passed to final human action",
      "dry_run_final_human_action_required",
      { handoffChain: completeBuyChain },
    ),
    fixture(
      "sell_dry_run_passed_to_final_human_action",
      "SELL dry-run passed to final human action",
      "dry_run_final_human_action_required",
      { handoffChain: completeSellChain },
    ),
    fixture(
      "stop_before_final_kop",
      "Stop before final KÖP",
      "dry_run_final_human_action_required",
      { handoffChain: handoffChain("stop_before_final_kop") },
    ),
    fixture(
      "stop_before_final_salj",
      "Stop before final SÄLJ",
      "dry_run_final_human_action_required",
      { handoffChain: handoffChain("stop_before_final_salj") },
    ),
    fixture(
      "search_simulated_not_executed",
      "Search simulated but not executed",
      "dry_run_final_human_action_required",
      { handoffChain: handoffChain("search_execution_forbidden") },
    ),
    fixture(
      "navigation_simulated_not_executed",
      "Navigation simulated but not executed",
      "dry_run_final_human_action_required",
      { handoffChain: handoffChain("navigation_forbidden") },
    ),
    fixture(
      "order_fields_simulated_not_filled",
      "Order fields simulated but not filled",
      "dry_run_final_human_action_required",
      { handoffChain: handoffChain("form_fill_forbidden") },
    ),
    fixture(
      "review_simulated_not_clicked",
      "Review simulated but not clicked",
      "dry_run_final_human_action_required",
      { handoffChain: completeBuyChain },
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "dry_run_final_human_action_required",
      { handoffChain: handoffChain("order_submission_forbidden") },
    ),
    fixture(
      "final_buy_sell_forbidden",
      "Final BUY/SELL click forbidden",
      "dry_run_final_human_action_required",
      { handoffChain: completeBuyChain },
    ),
    fixture(
      "cookie_session_forbidden",
      "Cookie/session forbidden",
      "dry_run_final_human_action_required",
      { handoffChain: handoffChain("cookie_session_forbidden") },
    ),
    fixture(
      "bankid_forbidden",
      "BankID forbidden",
      "dry_run_final_human_action_required",
      { handoffChain: handoffChain("bankid_forbidden") },
    ),
    fixture("error", "Error fixture", "dry_run_error", {
      forceError: true,
    }),
    fixture("unknown", "Unknown fixture", "unknown", {
      forceUnknown: true,
    }),
  ];
