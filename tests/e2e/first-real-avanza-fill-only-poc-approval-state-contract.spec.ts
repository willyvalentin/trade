import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  evaluateFirstFillOnlyPocApprovalState,
  firstFillOnlyPocApprovalDecisionStatuses,
  type FirstFillOnlyPocApprovalStateInput,
} from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import { buildFirstFillOnlyPocDryRunDecision } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";

const repoRoot = process.cwd();
const contractPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-approval-state-contract.ts",
);
const harnessPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-dry-run-harness.ts",
);
const now = "2026-06-29T16:30:00.000Z";

function validApproval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-29T16:00:00.000Z",
      ends_at: "2026-06-29T17:00:00.000Z",
      evaluated_at: "2026-06-29T16:30:00.000Z",
    },
    operator_present: true,
    max_amount_cap_sek: 1000,
    scope: {
      buy_only: true,
      order_type: "limit",
      sizing_mode: "amount",
      stop_point: "before_granska_kop",
      review_click_allowed: false,
      review_click_requested: false,
      final_confirm_allowed: false,
      final_confirm_requested: false,
      credentials_or_2fa_handling_allowed: false,
      unattended_run_allowed: false,
    },
    acknowledgements: {
      no_final_confirm: true,
      no_review_click_first_poc: true,
      no_credentials_or_2fa_handling: true,
      no_unattended_run: true,
      account_human_verified: true,
      instrument_human_verified: true,
      kill_switch_cancel_plan: true,
      evidence_plan: true,
    },
  };

  return {
    ...base,
    ...overrides,
    approval_window: {
      ...base.approval_window,
      ...overrides.approval_window,
    },
    scope: {
      ...base.scope,
      ...overrides.scope,
    },
    acknowledgements: {
      ...base.acknowledgements,
      ...overrides.acknowledgements,
    },
  };
}

function harnessPayload() {
  return buildSemiAutoRecommendationBuyPayload(
    {
      recommendation_id: "rec-first-fill-approval-contract-001",
      recommendation_fingerprint: "first-fill-approval-contract-fp-001",
      ticker: "GME",
      quantity: 1,
      order_type: "limit",
      entry_price: 800,
      limit_price: 800,
      stop_price: 760,
      target_price: 900,
      created_at: "2026-06-29T16:25:00.000Z",
      expires_at: "2026-06-29T16:45:00.000Z",
      stale_after: "2026-06-29T16:40:00.000Z",
      broker_target_label: "First fill-only POC approval contract fixture",
    },
    { now },
  ).payload;
}

test.describe("first fill-only POC approval state contract", () => {
  test("exports the approval decision statuses", () => {
    expect(firstFillOnlyPocApprovalDecisionStatuses).toEqual([
      "not_approved_yet",
      "approved_for_stub_only",
      "approved_for_first_fill_only_poc",
      "deferred_pending_operator_setup",
      "blocked_by_safety_condition",
      "cancelled_by_operator",
    ]);
  });

  test("default state is not_approved_yet", () => {
    const state = evaluateFirstFillOnlyPocApprovalState();

    expect(state.status).toBe("not_approved_yet");
    expect(state.default_state).toBe("not_approved_yet");
    expect(state.real_dry_run_approved).toBe(false);
    expect(state.stub_only_approved).toBe(false);
  });

  test("stub-only approval does not approve real dry-run", () => {
    const state = evaluateFirstFillOnlyPocApprovalState({
      requested_decision: "approved_for_stub_only",
    });

    expect(state.status).toBe("approved_for_stub_only");
    expect(state.stub_only_approved).toBe(true);
    expect(state.real_dry_run_approved).toBe(false);
  });

  test("real approval requires explicit user approval", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ explicit_user_approval: false }),
    );

    expect(state.status).toBe("blocked_by_safety_condition");
    expect(state.blocking_reasons).toContain("explicit_user_approval_missing");
  });

  test("real approval requires user/operator present", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ operator_present: false }),
    );

    expect(state.blocking_reasons).toContain("operator_not_present");
  });

  test("real approval requires cap less than or equal to 1000 SEK", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(validApproval());

    expect(state.status).toBe("approved_for_first_fill_only_poc");
    expect(state.max_amount_cap_sek).toBe(1000);
    expect(state.real_dry_run_approved).toBe(true);
  });

  test("cap above 1000 blocks", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ max_amount_cap_sek: 1001 }),
    );

    expect(state.status).toBe("blocked_by_safety_condition");
    expect(state.blocking_reasons).toContain("cap_exceeds_policy");
  });

  test("missing cap blocks", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ max_amount_cap_sek: null }),
    );

    expect(state.blocking_reasons).toContain("cap_missing");
  });

  test("scope must be buy-only", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ scope: { buy_only: false } }),
    );

    expect(state.blocking_reasons).toContain("scope_not_buy_only");
  });

  test("order type must be Limit/Avancerad", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ scope: { order_type: "market" } }),
    );

    expect(state.blocking_reasons).toContain("order_type_not_limit");
  });

  test("sizing mode must be amount-based by default", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ scope: { sizing_mode: "quantity" } }),
    );

    expect(state.blocking_reasons).toContain("sizing_mode_not_amount_based");
  });

  test("stop point must be before Granska kop", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ scope: { stop_point: "after_granska_kop" } }),
    );

    expect(state.blocking_reasons).toContain("stop_point_not_before_review");
  });

  test("any review click allowed or requested blocks", () => {
    const allowed = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ scope: { review_click_allowed: true } }),
    );
    const missingAck = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ acknowledgements: { no_review_click_first_poc: false } }),
    );

    expect(allowed.blocking_reasons).toContain(
      "review_click_allowed_or_requested",
    );
    expect(missingAck.blocking_reasons).toContain(
      "review_click_allowed_or_requested",
    );
  });

  test("any final confirm allowed or requested blocks", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ scope: { final_confirm_requested: true } }),
    );

    expect(state.blocking_reasons).toContain(
      "final_confirm_allowed_or_requested",
    );
  });

  test("credentials/2FA handling allowed blocks", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ scope: { credentials_or_2fa_handling_allowed: true } }),
    );

    expect(state.blocking_reasons).toContain(
      "credentials_or_2fa_handling_allowed",
    );
  });

  test("unattended run allowed blocks", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ scope: { unattended_run_allowed: true } }),
    );

    expect(state.blocking_reasons).toContain("unattended_run_allowed");
  });

  test("missing account/instrument verification blocks", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({
        acknowledgements: {
          account_human_verified: false,
          instrument_human_verified: false,
        },
      }),
    );

    expect(state.blocking_reasons).toEqual(
      expect.arrayContaining([
        "account_not_human_verified",
        "instrument_not_human_verified",
      ]),
    );
  });

  test("missing kill switch/cancel plan blocks", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ acknowledgements: { kill_switch_cancel_plan: false } }),
    );

    expect(state.blocking_reasons).toContain(
      "kill_switch_cancel_plan_missing",
    );
  });

  test("missing evidence plan blocks", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({ acknowledgements: { evidence_plan: false } }),
    );

    expect(state.blocking_reasons).toContain("evidence_plan_missing");
  });

  test("outside approval window blocks", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(
      validApproval({
        approval_window: { evaluated_at: "2026-06-29T18:00:00.000Z" },
      }),
    );

    expect(state.blocking_reasons).toContain(
      "approval_window_outside_current_time",
    );
  });

  test("valid explicit approval can return approved_for_first_fill_only_poc", () => {
    const state = evaluateFirstFillOnlyPocApprovalState(validApproval());

    expect(state.status).toBe("approved_for_first_fill_only_poc");
    expect(state.real_dry_run_approved).toBe(true);
    expect(state.stub_only_approved).toBe(false);
    expect(state.blocking_reasons).toEqual([]);
  });

  test("approval contract remains pure", () => {
    const source = readFileSync(contractPath, "utf8");

    for (const forbidden of [
      "@playwright/test",
      "playwright",
      "puppeteer",
      "chromium",
      "document.",
      "window.",
      "fetch(",
      "process.env",
      "@supabase",
      "createClient",
      ".from(",
      ".insert(",
      "SERVICE_ROLE",
      "service-role",
      "/api/",
      "provider",
      "run-scan",
      "audit-writer",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });

  test("harness uses the shared approval contract type", () => {
    const source = readFileSync(harnessPath, "utf8");

    expect(source).toContain(
      "first-real-avanza-fill-only-poc-approval-state-contract",
    );
  });

  test("harness still returns not_approved when approval contract is not approved", () => {
    const approval = evaluateFirstFillOnlyPocApprovalState();
    const decision = buildFirstFillOnlyPocDryRunDecision({
      static_payload: {
        payload: harnessPayload(),
        order_form: "avancerad",
        requested_action: "fill_only",
        max_amount_cap_sek: 1000,
        currency: "SEK",
        order_type: "limit",
        side: "buy",
      },
      selector_readiness: {
        available_selector_keys: getRequiredFirstFillOnlySelectorKeys(),
        requested_selectors: [],
        sizing_mode: "amount",
        total_amount_selector_available: true,
        total_amount_text: "800 SEK",
        generated_selector_strategy_used: false,
        validation_errors: [],
        review_click_requested: false,
      },
      operator_approval: {
        approval_decision: approval.status,
        account_human_verified: true,
        instrument_human_verified: true,
        price_currency_human_verified: true,
      },
    });

    expect(approval.status).toBe("not_approved_yet");
    expect(decision.status).toBe("not_approved");
  });
});
