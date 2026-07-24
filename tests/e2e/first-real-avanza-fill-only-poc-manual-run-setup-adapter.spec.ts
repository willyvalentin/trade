import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFirstFillOnlyPocManualRunSetupDecision,
  firstRealAvanzaFillOnlyPocManualRunSetupCapabilityFlags,
  type FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest,
} from "../../lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const adapterPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter.ts",
);
const now = "2026-06-30T10:30:00.000Z";

function validApproval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-30T10:00:00.000Z",
      ends_at: "2026-06-30T11:00:00.000Z",
      evaluated_at: "2026-06-30T10:30:00.000Z",
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

function buyPayload(
  overrides: Partial<SemiAutoAvanzaAgentPayload> = {},
): SemiAutoAvanzaAgentPayload {
  return {
    ...buildSemiAutoRecommendationBuyPayload(
      {
        recommendation_id: "rec-first-fill-only-manual-setup-adapter-001",
        recommendation_fingerprint:
          "first-fill-only-manual-setup-adapter-fp-001",
        ticker: "GME",
        quantity: 1,
        order_type: "limit",
        entry_price: 800,
        limit_price: 800,
        stop_price: 760,
        target_price: 900,
        created_at: "2026-06-30T10:25:00.000Z",
        expires_at: "2026-06-30T10:45:00.000Z",
        stale_after: "2026-06-30T10:40:00.000Z",
        broker_target_label: "First fill-only manual setup adapter fixture",
      },
      { now },
    ).payload,
    ...overrides,
  };
}

type DryRunOverrides = {
  static_payload?: Partial<FirstFillOnlyPocDryRunDecisionInput["static_payload"]>;
  selector_readiness?: Partial<
    FirstFillOnlyPocDryRunDecisionInput["selector_readiness"]
  >;
  operator_approval?: Partial<
    FirstFillOnlyPocDryRunDecisionInput["operator_approval"]
  >;
};

function dryRun(overrides: DryRunOverrides = {}): FirstFillOnlyPocDryRunDecisionInput {
  const base: FirstFillOnlyPocDryRunDecisionInput = {
    static_payload: {
      payload: buyPayload(),
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
      approval_decision: "approved_for_first_fill_only_poc",
      account_human_verified: true,
      instrument_human_verified: true,
      price_currency_human_verified: true,
    },
  };

  return {
    ...base,
    static_payload: {
      ...base.static_payload,
      ...overrides.static_payload,
    },
    selector_readiness: {
      ...base.selector_readiness,
      ...overrides.selector_readiness,
    },
    operator_approval: {
      ...base.operator_approval,
      ...overrides.operator_approval,
    },
  };
}

type SafeRequestOverrides = Partial<
  Omit<
    FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest,
    | "approval_snapshot"
    | "payload_snapshot"
    | "selector_readiness_snapshot"
    | "operator_approval_snapshot"
  >
> & {
  approval_snapshot?: Partial<FirstFillOnlyPocApprovalStateInput> | null;
  dry_run?: DryRunOverrides;
};

function safeRequest(
  overrides: SafeRequestOverrides = {},
): FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest {
  const {
    approval_snapshot: approvalOverride,
    dry_run: dryRunOverride,
    ...requestOverrides
  } = overrides;
  const harness = dryRun(dryRunOverride);

  return {
    manual_run_setup_adapter_enabled: true,
    approval_snapshot:
      approvalOverride === null ? null : validApproval(approvalOverride),
    operator_setup_evidence_snapshot: {
      setup_decision: "operator_setup_ready_for_manual_run_setup",
      operator_present: true,
      manual_login_ready: true,
      avanza_page_opened_by_operator: true,
      credentials_or_2fa_handled_by_operator: true,
      kill_switch_cancel_plan_ready: true,
      account_verified: true,
      instrument_verified: true,
    },
    payload_snapshot: harness.static_payload,
    selector_readiness_snapshot: harness.selector_readiness,
    operator_approval_snapshot: harness.operator_approval,
    intended_amount_sek: 800,
    intended_price: 800,
    cap_sek: 1000,
    evidence_plan: {
      evidence_plan_acknowledged: true,
      screenshot_redaction_acknowledged: true,
      planned_artifacts: ["manual_operator_notes"],
    },
    requested_actions: {
      review_click_requested: false,
      final_confirm_requested: false,
      order_submit_requested: false,
    },
    ...requestOverrides,
  };
}

const falseCapabilityFlags = {
  can_access_avanza: false,
  can_launch_browser: false,
  can_query_dom: false,
  can_fill_fields: false,
  can_click_review: false,
  can_click_final_confirm: false,
  can_submit_order: false,
} as const;

test.describe("first fill-only POC manual run setup adapter", () => {
  test("defaults to disabled", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision();

    expect(decision.status).toBe("disabled");
    expect(decision.manual_run_setup_adapter_enabled).toBe(false);
    expect(decision.blocked_reasons).toContain(
      "manual_run_setup_adapter_disabled",
    );
  });

  test("disabled result has all capability flags false", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision();

    expect(decision.capability_flags).toEqual(falseCapabilityFlags);
    expect(decision.capability_flags).toEqual(
      firstRealAvanzaFillOnlyPocManualRunSetupCapabilityFlags,
    );
  });

  test("enabled without approval blocks", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      safeRequest({ approval_snapshot: null }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("approval_snapshot_missing");
    expect(decision.blocked_reasons).toContain("approval:not_approved_yet");
  });

  test("enabled without operator setup evidence blocks", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      safeRequest({ operator_setup_evidence_snapshot: null }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "operator_setup_evidence_missing",
    );
  });

  test("enabled with skeleton blocked blocks", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      safeRequest({
        operator_setup_evidence_snapshot: {
          setup_decision: "operator_setup_ready_for_manual_run_setup",
          operator_present: true,
          manual_login_ready: true,
          avanza_page_opened_by_operator: true,
          credentials_or_2fa_handled_by_operator: true,
          kill_switch_cancel_plan_ready: false,
          account_verified: true,
          instrument_verified: true,
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.skeleton_decision?.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "skeleton:operator_setup:kill_switch_cancel_plan_missing",
    );
  });

  test("enabled with invalid guard or harness blocks", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      safeRequest({
        dry_run: {
          static_payload: {
            order_form: "stop_loss",
            order_type: "stop_loss",
          },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("dry_run:order_type_not_limit");
    expect(decision.blocked_reasons).toContain(
      "fill_only_guard:stop_loss_deferred_for_first_poc",
    );
  });

  test("enabled with cap above 1000 SEK blocks", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      safeRequest({
        cap_sek: 1001,
        dry_run: {
          static_payload: { max_amount_cap_sek: 1001 },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("cap_exceeds_policy");
  });

  test("enabled with wrong side blocks", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      safeRequest({
        dry_run: {
          static_payload: {
            side: "sell",
            payload: buyPayload({ side: "sell" }),
          },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("side_not_buy");
  });

  test("enabled with wrong order type blocks", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      safeRequest({
        dry_run: {
          static_payload: {
            order_type: "market",
            payload: buyPayload({ order_type: "market" }),
          },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "order_type_not_limit_or_avancerad",
    );
  });

  test("enabled with review click requested blocks", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      safeRequest({
        requested_actions: { review_click_requested: true },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("review_click_requested");
  });

  test("enabled with final confirm requested blocks", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      safeRequest({
        requested_actions: { final_confirm_requested: true },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("final_confirm_requested");
  });

  test("enabled with safe snapshots can return ready for manual setup", () => {
    const decision =
      buildFirstFillOnlyPocManualRunSetupDecision(safeRequest());

    expect(decision.status).toBe("ready_for_fill_only_manual_setup");
    expect(decision.ready_for_fill_only_manual_setup).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
  });

  test("ready result still has all capability flags false", () => {
    const decision =
      buildFirstFillOnlyPocManualRunSetupDecision(safeRequest());

    expect(decision.capability_flags).toEqual(falseCapabilityFlags);
  });

  test("ready result exposes planned instructions", () => {
    const decision =
      buildFirstFillOnlyPocManualRunSetupDecision(safeRequest());

    expect(decision.planned_instructions.map((step) => step.key)).toEqual([
      "verify_instrument",
      "verify_account",
      "verify_buy_side",
      "verify_limit_avancerad",
      "planned_fill_amount",
      "planned_fill_price",
      "read_total_amount",
      "stop_before_review",
    ]);
    expect(
      decision.planned_instructions.find(
        (step) => step.key === "planned_fill_amount",
      )?.value,
    ).toBe(800);
  });

  test("ready result stop point is before review", () => {
    const decision =
      buildFirstFillOnlyPocManualRunSetupDecision(safeRequest());

    expect(decision.stop_point).toBe("before_review_button");
    expect(
      decision.planned_instructions.find(
        (step) => step.key === "stop_before_review",
      )?.mode,
    ).toBe("hard_stop");
  });

  test("ready result exposes evidence requirements", () => {
    const decision =
      buildFirstFillOnlyPocManualRunSetupDecision(safeRequest());

    expect(decision.evidence_requirements).toEqual(
      expect.arrayContaining([
        "before_screenshot",
        "after_fill_screenshot",
        "guard_decision_output",
        "manual_run_setup_decision_output",
        "screenshot_redaction_statement",
        "manual_operator_notes",
      ]),
    );
  });

  test("ready result exposes forbidden selectors", () => {
    const decision =
      buildFirstFillOnlyPocManualRunSetupDecision(safeRequest());

    expect(decision.forbidden_selectors).toEqual(
      expect.arrayContaining([
        'button[data-e2e="confirmOrderButton"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
        'button[data-e2e="orderButton"][data-mint-button-theme="buy"]',
      ]),
    );
  });

  test("planned instructions do not imply order placement", () => {
    const decision =
      buildFirstFillOnlyPocManualRunSetupDecision(safeRequest());
    const instructionText = decision.planned_instructions
      .map((step) => `${step.key} ${step.label}`)
      .join(" ")
      .toLowerCase();

    expect(instructionText).not.toContain("submit");
    expect(instructionText).not.toContain("place order");
    expect(instructionText).not.toContain("bekräfta");
    expect(instructionText).not.toContain("confirm");
  });

  test("module imports remain pure and local", () => {
    const source = readFileSync(adapterPath, "utf8");

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
      ".click(",
      ".locator(",
      ".goto(",
      "avanza.se",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
