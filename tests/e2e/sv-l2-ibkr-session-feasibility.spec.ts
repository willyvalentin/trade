import { expect, test } from "@playwright/test";

import {
  assessIbkrPaperSessionFeasibility,
  IBKR_SESSION_FEASIBILITY_VERSION,
  IBKR_SESSION_PROBE_RECEIPT_VERSION,
  type IbkrSessionFeasibilityInput,
} from "@/lib/ibkr-session-feasibility";

function input(
  overrides: Partial<IbkrSessionFeasibilityInput> = {},
): IbkrSessionFeasibilityInput {
  return {
    feasibility_version: IBKR_SESSION_FEASIBILITY_VERSION,
    evaluated_at: "2026-09-25T14:05:00.000Z",
    receipt: {
      receipt_version: IBKR_SESSION_PROBE_RECEIPT_VERSION,
      receipt_id: "11111111-1111-4111-8111-111111111111",
      owner_user_id: "22222222-2222-4222-8222-222222222222",
      broker_account_id: "paper-account-1",
      account_mode: "paper",
      transport: "web_api",
      observed_at: "2026-09-25T14:00:00.000Z",
      expires_at: "2026-09-25T14:10:00.000Z",
      authentication: {
        method: "first_party_oauth_1a",
        credential_values_in_receipt: false,
        authenticated_session_observed: true,
        brokerage_session_initialized: true,
        operator_reauthentication_required: false,
        session_recovery_tested: true,
      },
      account_readback: {
        account_list_read: true,
        target_account_matched: true,
        paper_account_confirmed: true,
        buying_power_read: true,
        positions_read: true,
        open_orders_read: true,
        executions_read: true,
        stock_trading_permission_confirmed: true,
        market_data_permission_confirmed: true,
      },
      hosting: {
        connection_owner: "persistent_server_worker",
        server_owned_secrets: true,
        single_active_broker_session_enforced: true,
        health_check_observed: true,
        restart_recovery_tested: true,
      },
      constraints: {
        global_requests_per_second: 10,
        endpoint_pacing_modeled: true,
        daily_maintenance_modeled: true,
        order_submission_enabled: false,
        live_fallback_enabled: false,
        recommendation_market_data_enabled: false,
      },
    },
    ...overrides,
  };
}

test("admits complete Web API paper readback without granting broker authority", () => {
  const result = assessIbkrPaperSessionFeasibility(input());

  expect(result).toMatchObject({
    status: "completed",
    disposition: "read_only_feasible",
    reason_codes: ["paper_read_only_capabilities_observed"],
    evidence_gaps: [],
    account_mode: "paper",
    transport: "web_api",
    admitted_read_capabilities: [
      "accounts",
      "buying_power",
      "executions",
      "open_orders",
      "positions",
    ],
    safety: {
      paper_only: true,
      supplied_receipt_only: true,
      environment_verified_by_this_function: false,
      broker_transport_present: false,
      credential_read_authorized: false,
      order_submission_authorized: false,
      order_modification_authorized: false,
      order_cancellation_authorized: false,
      live_account_authorized: false,
      provider_request_authorized: false,
      database_write_authorized: false,
    },
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.safety)).toBe(true);
  expect(Object.isFrozen(result.admitted_read_capabilities)).toBe(true);
});

test("keeps missing recovery explicit and requires operator restoration", () => {
  const request = input();
  const result = assessIbkrPaperSessionFeasibility({
    ...request,
    receipt: {
      ...request.receipt,
      authentication: {
        ...request.receipt.authentication,
        operator_reauthentication_required: true,
        session_recovery_tested: false,
      },
      hosting: {
        ...request.receipt.hosting,
        restart_recovery_tested: false,
      },
    },
  });

  expect(result).toMatchObject({
    status: "completed",
    disposition: "read_only_feasible_operator_restore_required",
    reason_codes: [
      "paper_read_only_capabilities_observed_recovery_incomplete",
    ],
    evidence_gaps: [
      "operator_reauthentication_required",
      "session_recovery_unverified",
      "worker_restart_recovery_unverified",
    ],
  });
});

test("admits the IB Gateway authentication shape only with a persistent owner", () => {
  const request = input();
  const result = assessIbkrPaperSessionFeasibility({
    ...request,
    receipt: {
      ...request.receipt,
      transport: "tws_api_ib_gateway",
      authentication: {
        ...request.receipt.authentication,
        method: "ib_gateway_interactive",
        operator_reauthentication_required: true,
      },
    },
  });

  expect(result).toMatchObject({
    status: "completed",
    disposition: "read_only_feasible",
    transport: "tws_api_ib_gateway",
    evidence_gaps: ["operator_reauthentication_required"],
  });
});

test("blocks browser and short-lived function connection ownership", () => {
  for (const connectionOwner of [
    "browser",
    "serverless_request_handler",
  ] as const) {
    const request = input();
    const result = assessIbkrPaperSessionFeasibility({
      ...request,
      receipt: {
        ...request.receipt,
        hosting: {
          ...request.receipt.hosting,
          connection_owner: connectionOwner,
        },
      },
    });
    expect(result).toMatchObject({
      status: "blocked",
      reason_codes: ["persistent_connection_owner_required"],
      admitted_read_capabilities: [],
    });
  }
});

test("blocks stale, future and overlong probe windows", () => {
  const request = input();
  expect(
    assessIbkrPaperSessionFeasibility({
      ...request,
      evaluated_at: "2026-09-25T14:11:00.000Z",
    }),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["stale_or_invalid_probe_window"],
  });

  expect(
    assessIbkrPaperSessionFeasibility({
      ...request,
      evaluated_at: "2026-09-25T13:59:00.000Z",
    }),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["stale_or_invalid_probe_window"],
  });

  expect(
    assessIbkrPaperSessionFeasibility({
      ...request,
      receipt: {
        ...request.receipt,
        expires_at: "2026-09-25T14:16:00.000Z",
      },
    }),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["stale_or_invalid_probe_window"],
  });
});

test("blocks missing account identity, readback and stock permission evidence", () => {
  const request = input();
  const result = assessIbkrPaperSessionFeasibility({
    ...request,
    receipt: {
      ...request.receipt,
      account_readback: {
        ...request.receipt.account_readback,
        target_account_matched: false,
        positions_read: false,
        stock_trading_permission_confirmed: false,
      },
    },
  });

  expect(result).toMatchObject({
    status: "blocked",
    reason_codes: [
      "positions_not_read",
      "stock_trading_permission_not_confirmed",
      "target_account_not_matched",
    ],
  });
});

test("blocks authentication mismatch and a token without brokerage initialization", () => {
  const request = input();
  const result = assessIbkrPaperSessionFeasibility({
    ...request,
    receipt: {
      ...request.receipt,
      authentication: {
        ...request.receipt.authentication,
        method: "ib_gateway_interactive",
        brokerage_session_initialized: false,
      },
    },
  });

  expect(result).toMatchObject({
    status: "blocked",
    reason_codes: [
      "brokerage_session_not_initialized",
      "transport_authentication_mismatch",
    ],
  });
});

test("blocks unsafe pacing, missing maintenance handling and active order paths", () => {
  const request = input();
  const unsafe = {
    ...request,
    receipt: {
      ...request.receipt,
      constraints: {
        ...request.receipt.constraints,
        global_requests_per_second: 11,
        endpoint_pacing_modeled: false,
        daily_maintenance_modeled: false,
        order_submission_enabled: true,
        live_fallback_enabled: true,
        recommendation_market_data_enabled: true,
      },
    },
  };
  const result = assessIbkrPaperSessionFeasibility(unsafe);

  expect(result).toMatchObject({
    status: "blocked",
    reason_codes: [
      "daily_maintenance_not_modeled",
      "endpoint_pacing_not_modeled",
      "global_pacing_budget_invalid",
      "live_fallback_must_remain_disabled",
      "order_submission_must_remain_disabled",
      "recommendation_market_data_out_of_scope",
    ],
  });
});

test("reports market-data entitlement as a gap without inventing recommendation data", () => {
  const request = input();
  const result = assessIbkrPaperSessionFeasibility({
    ...request,
    receipt: {
      ...request.receipt,
      account_readback: {
        ...request.receipt.account_readback,
        market_data_permission_confirmed: false,
      },
    },
  });

  expect(result).toMatchObject({
    status: "completed",
    disposition: "read_only_feasible",
    evidence_gaps: ["market_data_permission_unverified"],
  });
});

test("rejects extra secret fields and accessor-backed inputs before evaluation", () => {
  const request = input();
  const withSecret = {
    ...request,
    receipt: { ...request.receipt, password: "must-not-be-here" },
  };
  expect(assessIbkrPaperSessionFeasibility(withSecret)).toMatchObject({
    status: "blocked",
    reason_codes: ["invalid_probe_receipt"],
  });

  const accessorBacked = Object.create(null, {
    evaluated_at: {
      enumerable: true,
      get() {
        throw new Error("must not execute");
      },
    },
    feasibility_version: {
      enumerable: true,
      value: IBKR_SESSION_FEASIBILITY_VERSION,
    },
    receipt: { enumerable: true, value: request.receipt },
  });
  expect(assessIbkrPaperSessionFeasibility(accessorBacked)).toMatchObject({
    status: "blocked",
    reason_codes: ["invalid_feasibility_envelope"],
  });
});

test("rejects truthy scalar substitutions for observed boolean evidence", () => {
  const request = input();
  const malformed = {
    ...request,
    receipt: {
      ...request.receipt,
      account_readback: {
        ...request.receipt.account_readback,
        positions_read: "true",
      },
    },
  };

  expect(assessIbkrPaperSessionFeasibility(malformed)).toMatchObject({
    status: "blocked",
    reason_codes: ["invalid_probe_receipt"],
  });
});

test("is deterministic for equivalent supplied evidence", () => {
  const first = assessIbkrPaperSessionFeasibility(input());
  const second = assessIbkrPaperSessionFeasibility(input());

  expect(second.input_digest).toBe(first.input_digest);
  expect(second.result_digest).toBe(first.result_digest);
});
