import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { buildFirstFillOnlyPocExecutionDryRunAdapterDecision } from "../../lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton";
import {
  buildFirstFillOnlyPocGatedRealBrowserFillOnlyRunDecision,
  firstRealAvanzaFillOnlyPocGatedRealBrowserRunAbortConditions,
  firstRealAvanzaFillOnlyPocGatedRealBrowserRunPlannedPhases,
  type FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest,
} from "../../lib/first-real-avanza-fill-only-poc-gated-real-browser-fill-only-run-adapter";
import { buildFirstFillOnlyPocManualRunSetupDecision } from "../../lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const simulationPath = join(
  repoRoot,
  "tests/e2e/first-real-avanza-fill-only-poc-gated-real-browser-fill-only-run-simulation.spec.ts",
);
const adapterPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-gated-real-browser-fill-only-run-adapter.ts",
);
const now = "2026-06-30T17:30:00.000Z";

function approval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-30T17:00:00.000Z",
      ends_at: "2026-06-30T18:00:00.000Z",
      evaluated_at: now,
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

function payload(
  overrides: Partial<SemiAutoAvanzaAgentPayload> = {},
): SemiAutoAvanzaAgentPayload {
  return {
    ...buildSemiAutoRecommendationBuyPayload(
      {
        recommendation_id: "rec-first-fill-only-gated-run-simulation-001",
        recommendation_fingerprint:
          "first-fill-only-gated-run-simulation-fp-001",
        ticker: "GME",
        quantity: 1,
        order_type: "limit",
        entry_price: 800,
        limit_price: 800,
        stop_price: 760,
        target_price: 900,
        created_at: "2026-06-30T17:25:00.000Z",
        expires_at: "2026-06-30T17:45:00.000Z",
        stale_after: "2026-06-30T17:40:00.000Z",
        broker_target_label: "First fill-only gated run simulation fixture",
      },
      { now },
    ).payload,
    ...overrides,
  };
}

type SimulationOverrides = Partial<
  Omit<
    FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest,
    | "approval_snapshot"
    | "payload_snapshot"
    | "selector_readiness_snapshot"
    | "operator_approval_snapshot"
    | "manual_run_setup_decision_snapshot"
    | "execution_dry_run_decision_snapshot"
  >
> & {
  approval_snapshot?: Partial<FirstFillOnlyPocApprovalStateInput> | null;
  dry_run?: {
    static_payload?: Partial<FirstFillOnlyPocDryRunDecisionInput["static_payload"]>;
    selector_readiness?: Partial<
      FirstFillOnlyPocDryRunDecisionInput["selector_readiness"]
    >;
    operator_approval?: Partial<
      FirstFillOnlyPocDryRunDecisionInput["operator_approval"]
    >;
  };
};

function simulationRequest(
  overrides: SimulationOverrides = {},
): FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest {
  const {
    approval_snapshot: approvalOverride,
    dry_run: dryRunOverride,
    ...requestOverrides
  } = overrides;
  const approvalSnapshot =
    approvalOverride === null ? null : approval(approvalOverride);
  const staticPayload = {
    payload: payload(dryRunOverride?.static_payload?.payload ?? {}),
    order_form: "avancerad",
    requested_action: "fill_only",
    max_amount_cap_sek: 1000,
    currency: "SEK",
    order_type: "limit",
    side: "buy",
    ...dryRunOverride?.static_payload,
  } satisfies FirstFillOnlyPocDryRunDecisionInput["static_payload"];
  const selectorReadiness = {
    available_selector_keys: getRequiredFirstFillOnlySelectorKeys(),
    requested_selectors: [],
    sizing_mode: "amount",
    total_amount_selector_available: true,
    total_amount_text: "800 SEK",
    generated_selector_strategy_used: false,
    validation_errors: [],
    review_click_requested: false,
    ...dryRunOverride?.selector_readiness,
  } satisfies FirstFillOnlyPocDryRunDecisionInput["selector_readiness"];
  const operatorApproval = {
    approval_decision: "approved_for_first_fill_only_poc",
    account_human_verified: true,
    instrument_human_verified: true,
    price_currency_human_verified: true,
    ...dryRunOverride?.operator_approval,
  } satisfies FirstFillOnlyPocDryRunDecisionInput["operator_approval"];
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
    real_browser_skeleton_evidence_acknowledged: true,
    pre_run_visible_state_evidence_planned: true,
    intended_values_evidence_planned: true,
    selector_plan_evidence_planned: true,
    stop_before_review_evidence_planned: true,
    no_review_modal_evidence_planned: true,
    no_final_or_submit_evidence_planned: true,
    planned_artifacts: [
      "local_simulation_report",
      "planned_phase_snapshot",
      "field_fill_metadata_snapshot",
      "abort_condition_snapshot",
      "evidence_requirement_snapshot",
    ],
  } as const;
  const requestedActions = {
    review_click_requested: false,
    review_modal_requested: false,
    final_confirm_requested: false,
    order_submit_requested: false,
    order_placement_requested: false,
    credential_or_session_handling_requested: false,
    browser_launch_requested: false,
    avanza_access_requested: false,
    dom_query_requested: false,
    field_fill_requested: false,
    sell_requested: false,
    stop_loss_requested: false,
    glidande_requested: false,
    account_change_requested: false,
    side_switch_requested: false,
    steppers_requested: false,
    select_all_account_requested: false,
    browser_unattended_run_requested: false,
  } as const;
  const manualDecision = buildFirstFillOnlyPocManualRunSetupDecision({
    manual_run_setup_adapter_enabled: true,
    approval_snapshot: approvalSnapshot,
    operator_setup_evidence_snapshot: operatorSetup,
    payload_snapshot: staticPayload,
    selector_readiness_snapshot: selectorReadiness,
    operator_approval_snapshot: operatorApproval,
    intended_amount_sek: 800,
    intended_price: 800,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    requested_actions: requestedActions,
  });
  const executionDecision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision({
    execution_dry_run_adapter_enabled: true,
    manual_run_setup_decision_snapshot: manualDecision,
    approval_snapshot: approvalSnapshot,
    operator_setup_snapshot: operatorSetup,
    payload_snapshot: staticPayload,
    selector_readiness_snapshot: selectorReadiness,
    operator_approval_snapshot: operatorApproval,
    intended_amount_sek: 800,
    intended_price: 800,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    requested_actions: requestedActions,
  });

  return {
    real_browser_fill_only_run_adapter_enabled: true,
    run_gate_decision_snapshot: "real_browser_fill_only_run_gate_ready",
    real_browser_run_approval_snapshot:
      "real_browser_run_approved_for_fill_only",
    real_browser_adapter_safety_gate_decision:
      "real_browser_adapter_safety_gate_ready",
    manual_avanza_login_confirmed: true,
    account_verification_confirmed: true,
    instrument_verification_confirmed: true,
    real_browser_adapter_enabled: true,
    manual_run_setup_decision_snapshot: manualDecision,
    execution_dry_run_decision_snapshot: executionDecision,
    approval_snapshot: approvalSnapshot,
    operator_setup_snapshot: operatorSetup,
    payload_snapshot: staticPayload,
    selector_readiness_snapshot: selectorReadiness,
    operator_approval_snapshot: operatorApproval,
    intended_amount_sek: 800,
    intended_price: 800,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    operator_presence_confirmed: true,
    requested_actions: requestedActions,
    ...requestOverrides,
  };
}

test.describe("first fill-only POC gated real browser fill-only run simulation", () => {
  test("local positive simulation reaches ready while performing no execution", () => {
    const decision =
      buildFirstFillOnlyPocGatedRealBrowserFillOnlyRunDecision(
        simulationRequest(),
      );

    expect(decision.status).toBe("ready_for_fill_only_browser_run");
    expect(decision.ready_for_fill_only_browser_run).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
    expect(decision.capability_flags).toMatchObject({
      can_launch_browser: false,
      can_access_avanza_without_user_session: false,
      can_handle_credentials: false,
      can_read_session_data: false,
      can_click_review: false,
      can_click_final_confirm: false,
      can_submit_order: false,
      can_place_order: false,
      can_execute_field_fill: false,
    });
    expect(decision.capability_flags.can_prepare_field_fill_plan).toBe(true);
    expect(decision.safety_confirmations).toMatchObject({
      no_actual_browser_run_this_action: true,
      no_avanza_access_this_action: true,
      no_browser_automation_this_action: true,
      no_dom_query_this_action: true,
      no_review_click: true,
      no_review_modal: true,
      no_final_confirm: true,
      no_submit_or_order_placement: true,
    });
  });

  test("local positive simulation exposes phases, field metadata, aborts, and evidence", () => {
    const decision =
      buildFirstFillOnlyPocGatedRealBrowserFillOnlyRunDecision(
        simulationRequest(),
      );

    expect(decision.planned_phases.map((phase) => phase.key)).toEqual(
      firstRealAvanzaFillOnlyPocGatedRealBrowserRunPlannedPhases.map(
        (phase) => phase.key,
      ),
    );
    expect(decision.planned_phases.map((phase) => phase.key)).toEqual([
      "verify_operator_presence",
      "verify_manual_login_confirmed",
      "verify_account_confirmed",
      "verify_instrument_confirmed",
      "verify_visible_order_form_state",
      "verify_buy_side",
      "verify_advanced_limit_order_type",
      "prepare_amount_field_fill",
      "prepare_price_field_fill",
      "read_total_amount",
      "verify_cap_after_total_parse",
      "capture_evidence",
      "stop_before_review",
    ]);
    expect(decision.field_fill_plan).toMatchObject({
      amount: { value: 800, mode: "metadata_only_no_fill" },
      price: { value: 800, mode: "metadata_only_no_fill" },
      total: { value: null, mode: "metadata_only_no_read" },
      mode: "metadata_only_no_browser_execution",
    });
    expect(decision.abort_conditions).toEqual(
      firstRealAvanzaFillOnlyPocGatedRealBrowserRunAbortConditions,
    );
    expect(decision.evidence_requirements).toEqual(
      expect.arrayContaining([
        "pre_run_visible_state_evidence",
        "amount_and_price_intended_values",
        "selector_plan",
        "stop_before_review_evidence",
        "no_review_modal_evidence",
        "no_final_or_submit_evidence",
      ]),
    );
    expect(decision.stop_point).toBe("before_review_button");
  });

  test("negative scenarios block or fail safety before any execution capability is enabled", () => {
    const scenarios: Array<{
      label: string;
      request: SimulationOverrides;
      expected: string;
    }> = [
      {
        label: "run gate not ready",
        request: { run_gate_decision_snapshot: "not_ready" },
        expected: "run_gate:not_ready",
      },
      {
        label: "wrong approval",
        request: { real_browser_run_approval_snapshot: "not_approved" },
        expected: "real_browser_run_approval:not_approved_for_fill_only",
      },
      {
        label: "operator absent",
        request: { operator_presence_confirmed: false },
        expected: "operator_presence:not_confirmed",
      },
      {
        label: "manual login missing",
        request: { manual_avanza_login_confirmed: false },
        expected: "manual_avanza_login:not_confirmed",
      },
      {
        label: "account unverified",
        request: { account_verification_confirmed: false },
        expected: "account_verification:not_confirmed",
      },
      {
        label: "instrument unverified",
        request: { instrument_verification_confirmed: false },
        expected: "instrument_verification:not_confirmed",
      },
      {
        label: "cap above policy",
        request: {
          cap_sek: 1001,
          dry_run: { static_payload: { max_amount_cap_sek: 1001 } },
        },
        expected: "cap_exceeds_policy",
      },
      {
        label: "wrong side",
        request: {
          dry_run: {
            static_payload: {
              side: "sell",
              payload: payload({ side: "sell" }),
            },
          },
        },
        expected: "side_not_buy",
      },
      {
        label: "wrong order type",
        request: {
          dry_run: {
            static_payload: {
              order_type: "market",
              payload: payload({ order_type: "market" }),
            },
          },
        },
        expected: "order_type_not_limit_or_avancerad",
      },
      {
        label: "review requested",
        request: { requested_actions: { review_click_requested: true } },
        expected: "review_click_requested",
      },
      {
        label: "final requested",
        request: { requested_actions: { final_confirm_requested: true } },
        expected: "final_confirm_requested",
      },
      {
        label: "placement requested",
        request: { requested_actions: { order_placement_requested: true } },
        expected: "order_submit_or_placement_requested",
      },
      {
        label: "credential handling requested",
        request: {
          requested_actions: {
            credential_or_session_handling_requested: true,
          },
        },
        expected: "credential_or_session_handling_requested",
      },
      {
        label: "sell requested",
        request: { requested_actions: { sell_requested: true } },
        expected: "sell_requested",
      },
      {
        label: "Stop Loss requested",
        request: { requested_actions: { stop_loss_requested: true } },
        expected: "stop_loss_requested",
      },
      {
        label: "Glidande requested",
        request: { requested_actions: { glidande_requested: true } },
        expected: "glidande_requested",
      },
    ];

    for (const scenario of scenarios) {
      const decision =
        buildFirstFillOnlyPocGatedRealBrowserFillOnlyRunDecision(
          simulationRequest(scenario.request),
        );

      expect(
        decision.ready_for_fill_only_browser_run,
        scenario.label,
      ).toBe(false);
      expect(decision.blocked_reasons, scenario.label).toContain(
        scenario.expected,
      );
      expect(decision.capability_flags.can_execute_field_fill).toBe(false);
      expect(decision.capability_flags.can_click_review).toBe(false);
      expect(decision.capability_flags.can_click_final_confirm).toBe(false);
      expect(decision.capability_flags.can_submit_order).toBe(false);
      expect(decision.capability_flags.can_place_order).toBe(false);
    }
  });

  test("adapter disabled remains disabled in simulation", () => {
    const decision =
      buildFirstFillOnlyPocGatedRealBrowserFillOnlyRunDecision(
        simulationRequest({
          real_browser_fill_only_run_adapter_enabled: false,
        }),
      );

    expect(decision.status).toBe("disabled");
    expect(decision.ready_for_fill_only_browser_run).toBe(false);
    expect(decision.capability_flags.can_prepare_field_fill_plan).toBe(false);
  });

  test("simulation and adapter sources remain local-only and non-executing", () => {
    const adapterSource = readFileSync(adapterPath, "utf8");
    const simulationSource = readFileSync(simulationPath, "utf8");
    const adapterForbidden = [
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
    ];

    for (const token of adapterForbidden) {
      expect(adapterSource).not.toContain(token);
    }

    expect(simulationSource).toContain(
      "local positive simulation reaches ready while performing no execution",
    );
    expect(simulationSource).not.toMatch(/\bpage\.(goto|click|locator)\(/);
    expect(simulationSource).not.toMatch(/\bbrowser\.(newPage|newContext)\(/);
    expect(simulationSource).not.toMatch(/\bcontext\.storageState\(/);
  });
});
