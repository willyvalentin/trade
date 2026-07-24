import {
  buildAvanzaLocalDevExecutionRunbook,
  type AvanzaLocalDevExecutionRunbook,
  type AvanzaLocalDevExecutionRunbookInput,
  type AvanzaLocalDevExecutionRunbookStatus,
} from "./avanza-local-dev-execution-runbook";

export type AvanzaLocalDevExecutionRunbookFixtureId =
  | "runbook_ready"
  | "waiting_for_login_smoke"
  | "waiting_for_order_smoke"
  | "blocked_by_ci"
  | "missing_credential_readiness"
  | "final_click_forbidden"
  | "order_submit_forbidden"
  | "bankid_forbidden"
  | "cookies_session_forbidden"
  | "trade_ui_wiring_forbidden"
  | "api_route_wiring_forbidden"
  | "production_not_ready";

export type AvanzaLocalDevExecutionRunbookFixture = {
  fixtureId: AvanzaLocalDevExecutionRunbookFixtureId;
  label: string;
  expectedStatus: AvanzaLocalDevExecutionRunbookStatus;
  runbook: AvanzaLocalDevExecutionRunbook;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const readyInput: AvanzaLocalDevExecutionRunbookInput = {
  enabled: true,
  isCi: false,
  isLocalDev: true,
  explicitEnvGatesReady: true,
  credentialsConfigured: true,
  operatorConfirmed: true,
  loginSmokeReviewed: true,
  orderSmokeReviewed: true,
  now: fixtureNow,
};

function fixture(
  fixtureId: AvanzaLocalDevExecutionRunbookFixtureId,
  label: string,
  expectedStatus: AvanzaLocalDevExecutionRunbookStatus,
  input: AvanzaLocalDevExecutionRunbookInput = {},
): AvanzaLocalDevExecutionRunbookFixture {
  return {
    fixtureId,
    label,
    expectedStatus,
    runbook: buildAvanzaLocalDevExecutionRunbook({
      ...readyInput,
      ...input,
      runbookId: `fixture-${fixtureId}`,
      now: fixtureNow,
    }),
  };
}

export const avanzaLocalDevExecutionRunbookFixtures:
  AvanzaLocalDevExecutionRunbookFixture[] = [
    fixture("runbook_ready", "Runbook ready", "runbook_ready"),
    fixture(
      "waiting_for_login_smoke",
      "Waiting for login smoke",
      "waiting_for_login_smoke",
      { loginSmokeReviewed: false, orderSmokeReviewed: false },
    ),
    fixture(
      "waiting_for_order_smoke",
      "Waiting for order-prep smoke",
      "waiting_for_order_smoke",
      { orderSmokeReviewed: false },
    ),
    fixture("blocked_by_ci", "Blocked by CI", "blocked", {
      isCi: true,
      isLocalDev: false,
      blockedReasons: ["CI is forbidden for login plus order-prep smoke tests."],
    }),
    fixture(
      "missing_credential_readiness",
      "Missing credential readiness",
      "blocked",
      {
        credentialsConfigured: false,
        blockedReasons: ["Secure credential provider readiness is missing."],
      },
    ),
    fixture("final_click_forbidden", "Final click forbidden", "forbidden", {
      statusOverride: "forbidden",
      blockedReasons: ["Final KÖP/SÄLJ click is forbidden."],
    }),
    fixture("order_submit_forbidden", "Order submit forbidden", "forbidden", {
      statusOverride: "forbidden",
      blockedReasons: ["Order submission is forbidden."],
    }),
    fixture("bankid_forbidden", "BankID forbidden", "forbidden", {
      statusOverride: "forbidden",
      blockedReasons: ["BankID automation is forbidden."],
    }),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "forbidden",
      {
        statusOverride: "forbidden",
        blockedReasons: ["Cookies/session export is forbidden."],
      },
    ),
    fixture(
      "trade_ui_wiring_forbidden",
      "Trade UI wiring forbidden",
      "forbidden",
      {
        statusOverride: "forbidden",
        blockedReasons: ["Trade UI wiring is forbidden in this runbook."],
      },
    ),
    fixture(
      "api_route_wiring_forbidden",
      "API route wiring forbidden",
      "forbidden",
      {
        statusOverride: "forbidden",
        blockedReasons: ["API route wiring is forbidden in this runbook."],
      },
    ),
    fixture(
      "production_not_ready",
      "Production not ready",
      "forbidden",
      {
        statusOverride: "forbidden",
        blockedReasons: ["Production readiness is not claimed."],
      },
    ),
  ];
