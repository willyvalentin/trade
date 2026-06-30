import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFirstFillOnlyPocExecutionDryRunAdapterDecision,
  type FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest,
} from "../../lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton";
import {
  buildFirstFillOnlyPocManualRunSetupDecision,
  type FirstRealAvanzaFillOnlyPocManualRunSetupDecision,
} from "../../lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const simulationDocPath = join(
  repoRoot,
  "docs/first-real-avanza-fill-only-poc-execution-dry-run-simulation.md",
);
const skeletonPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton.ts",
);
const now = "2026-06-30T14:30:00.000Z";

const allExecutionCapabilitiesFalse = {
  can_access_avanza: false,
  can_launch_browser: false,
  can_query_dom: false,
  can_fill_fields: false,
  can_click_review: false,
  can_click_final_confirm: false,
  can_submit_order: false,
} as const;

function validApproval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-30T14:00:00.000Z",
      ends_at: "2026-06-30T15:00:00.000Z",
      evaluated_at: "2026-06-30T14:30:00.000Z",
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
        recommendation_id: "rec-first-fill-only-execution-simulation-001",
        recommendation_fingerprint:
          "first-fill-only-execution-simulation-fp-001",
        ticker: "GME",
        quantity: 1,
        order_type: "limit",
        entry_price: 800,
        limit_price: 800,
        stop_price: 760,
        target_price: 900,
        created_at: "2026-06-30T14:25:00.000Z",
        expires_at: "2026-06-30T14:45:00.000Z",
        stale_after: "2026-06-30T14:40:00.000Z",
        broker_target_label: "First fill-only execution simulation fixture",
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

type SimulationRequestOverrides = Partial<
  Omit<
    FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest,
    | "approval_snapshot"
    | "payload_snapshot"
    | "selector_readiness_snapshot"
    | "operator_approval_snapshot"
    | "manual_run_setup_decision_snapshot"
  >
> & {
  approval_snapshot?: Partial<FirstFillOnlyPocApprovalStateInput> | null;
  dry_run?: DryRunOverrides;
  manual_run_setup_decision_snapshot?:
    | FirstRealAvanzaFillOnlyPocManualRunSetupDecision
    | null;
};

function simulationRequest(
  overrides: SimulationRequestOverrides = {},
): FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest {
  const {
    approval_snapshot: approvalOverride,
    dry_run: dryRunOverride,
    manual_run_setup_decision_snapshot: manualOverride,
    ...requestOverrides
  } = overrides;
  const harness = dryRun(dryRunOverride);
  const approval =
    approvalOverride === null ? null : validApproval(approvalOverride);
  const operatorSetup = {
    setup_decision: "operator_setup_ready_for_manual_run_setup",
    operator_present: true,
    manual_login_ready: true,
    avanza_page_opened_by_operator: true,
    credentials_or_2fa_handled_by_operator: true,
    kill_switch_cancel_plan_ready: true,
    account_verified: true,
    instrument_verified: true,
  } as const;
  const evidencePlan = {
    evidence_plan_acknowledged: true,
    screenshot_redaction_acknowledged: true,
    planned_artifacts: [
      "manual_operator_notes",
      "execution_dry_run_simulation_report",
    ],
  } as const;
  const requestedActions = {
    review_click_requested: false,
    final_confirm_requested: false,
    order_submit_requested: false,
  } as const;
  const base = {
    execution_dry_run_adapter_enabled: true,
    approval_snapshot: approval,
    operator_setup_snapshot: operatorSetup,
    payload_snapshot: harness.static_payload,
    selector_readiness_snapshot: harness.selector_readiness,
    operator_approval_snapshot: harness.operator_approval,
    intended_amount_sek: 800,
    intended_price: 800,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    requested_actions: requestedActions,
  } satisfies FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest;
  const manualDecision =
    manualOverride === undefined
      ? buildFirstFillOnlyPocManualRunSetupDecision({
          manual_run_setup_adapter_enabled: true,
          approval_snapshot: approval,
          operator_setup_evidence_snapshot: operatorSetup,
          payload_snapshot: harness.static_payload,
          selector_readiness_snapshot: harness.selector_readiness,
          operator_approval_snapshot: harness.operator_approval,
          intended_amount_sek: 800,
          intended_price: 800,
          cap_sek: 1000,
          evidence_plan: evidencePlan,
          requested_actions: requestedActions,
        })
      : manualOverride;

  return {
    ...base,
    manual_run_setup_decision_snapshot: manualDecision,
    ...requestOverrides,
  };
}

test.describe("first fill-only POC execution dry-run simulation", () => {
  test("local positive simulation reaches ready while keeping all capabilities false", () => {
    const decision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision(
      simulationRequest(),
    );

    expect(decision.status).toBe("ready_for_execution_dry_run_setup");
    expect(decision.ready_for_execution_dry_run_setup).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
    expect(decision.capability_flags).toEqual(allExecutionCapabilitiesFalse);
    expect(decision.safety_confirmations.no_real_avanza_access).toBe(true);
    expect(decision.safety_confirmations.no_browser_launch).toBe(true);
    expect(decision.safety_confirmations.no_dom_query).toBe(true);
    expect(decision.safety_confirmations.no_field_fill).toBe(true);
    expect(decision.safety_confirmations.no_review_click).toBe(true);
    expect(decision.safety_confirmations.no_final_confirm).toBe(true);
    expect(decision.safety_confirmations.no_order_submit).toBe(true);
  });

  test("local positive simulation exposes planned metadata and stops before review", () => {
    const decision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision(
      simulationRequest(),
    );

    expect(decision.planned_dry_run_steps.map((step) => step.key)).toEqual([
      "verify_operator_browser_state",
      "verify_instrument",
      "verify_account",
      "verify_buy_side",
      "verify_limit_avancerad",
      "prepare_amount_fill_instruction",
      "prepare_price_fill_instruction",
      "prepare_total_read_instruction",
      "stop_before_review",
    ]);
    expect(decision.stop_point).toBe("before_review_button");
    expect(
      decision.planned_dry_run_steps.find(
        (step) => step.key === "prepare_amount_fill_instruction",
      )?.value,
    ).toBe(800);
    expect(
      decision.planned_dry_run_steps.find(
        (step) => step.key === "prepare_price_fill_instruction",
      )?.value,
    ).toBe(800);
    expect(
      decision.planned_dry_run_steps.find(
        (step) => step.key === "stop_before_review",
      )?.mode,
    ).toBe("hard_stop");
  });

  test("adapter disabled stays disabled", () => {
    const decision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision({
      ...simulationRequest(),
      execution_dry_run_adapter_enabled: false,
    });

    expect(decision.status).toBe("disabled");
    expect(decision.capability_flags).toEqual(allExecutionCapabilitiesFalse);
    expect(decision.blocked_reasons).toContain(
      "execution_dry_run_adapter_disabled",
    );
  });

  test("missing manual run setup readiness blocks", () => {
    const disabledManualDecision = buildFirstFillOnlyPocManualRunSetupDecision();
    const decision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision(
      simulationRequest({
        manual_run_setup_decision_snapshot: disabledManualDecision,
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("manual_run_setup:disabled");
    expect(decision.capability_flags).toEqual(allExecutionCapabilitiesFalse);
  });

  test("review requested fails safety without enabling clicks", () => {
    const decision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision(
      simulationRequest({
        requested_actions: { review_click_requested: true },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("review_click_requested");
    expect(decision.capability_flags.can_click_review).toBe(false);
  });

  test("final confirmation requested fails safety without enabling submit", () => {
    const decision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision(
      simulationRequest({
        requested_actions: { final_confirm_requested: true },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("final_confirm_requested");
    expect(decision.capability_flags.can_click_final_confirm).toBe(false);
    expect(decision.capability_flags.can_submit_order).toBe(false);
  });

  test("cap above 1000 SEK blocks", () => {
    const decision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision(
      simulationRequest({
        cap_sek: 1001,
        dry_run: {
          static_payload: { max_amount_cap_sek: 1001 },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("cap_exceeds_policy");
  });

  test("wrong side blocks", () => {
    const decision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision(
      simulationRequest({
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

  test("wrong order type blocks", () => {
    const decision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision(
      simulationRequest({
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

  test("simulation proof doc records status and next action", () => {
    const source = readFileSync(simulationDocPath, "utf8");

    expect(source).toContain(
      "first_real_avanza_fill_only_poc_execution_dry_run_simulation_added",
    );
    expect(source).toContain(
      "Action 1040 - Add First Fill-Only POC Real Browser Adapter Safety Gate",
    );
    expect(source).toContain("ready_for_execution_dry_run_setup");
    expect(source).toContain("can_access_avanza: false");
    expect(source).toContain("can_submit_order: false");
  });

  test("skeleton source remains pure and non-executing", () => {
    const source = readFileSync(skeletonPath, "utf8");

    for (const forbidden of [
      "puppeteer",
      "chromium.launch",
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
      "run-scan",
      "audit-writer",
      ".click(",
      ".locator(",
      ".goto(",
      "avanza.se",
      "submitOrder",
      "placeOrder",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
