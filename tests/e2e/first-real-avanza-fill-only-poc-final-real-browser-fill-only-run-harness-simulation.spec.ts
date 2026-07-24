import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { buildFirstFillOnlyPocExecutionDryRunAdapterDecision } from "../../lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton";
import {
  buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision,
  firstRealAvanzaFillOnlyPocFinalRealBrowserRunAbortConditions,
  firstRealAvanzaFillOnlyPocFinalRealBrowserRunEvidenceRequirements,
  firstRealAvanzaFillOnlyPocFinalRealBrowserRunPlannedPhases,
  type FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessRequest,
} from "../../lib/first-real-avanza-fill-only-poc-final-real-browser-fill-only-run-harness";
import { buildFirstFillOnlyPocManualRunSetupDecision } from "../../lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const simulationPath = join(
  repoRoot,
  "tests/e2e/first-real-avanza-fill-only-poc-final-real-browser-fill-only-run-harness-simulation.spec.ts",
);
const harnessPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-final-real-browser-fill-only-run-harness.ts",
);
const now = "2026-06-30T18:15:00.000Z";

function approval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-30T18:00:00.000Z",
      ends_at: "2026-06-30T19:00:00.000Z",
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
        recommendation_id:
          "rec-first-fill-only-final-browser-harness-simulation-001",
        recommendation_fingerprint:
          "first-fill-only-final-browser-harness-simulation-fp-001",
        ticker: "GME",
        quantity: 2,
        order_type: "limit",
        entry_price: 21.98,
        limit_price: 21.98,
        stop_price: 20,
        target_price: 25,
        created_at: "2026-06-30T18:05:00.000Z",
        expires_at: "2026-06-30T18:50:00.000Z",
        stale_after: "2026-06-30T18:45:00.000Z",
        broker_target_label:
          "First fill-only final browser harness local simulation fixture",
      },
      { now },
    ).payload,
    ...overrides,
  };
}

type SimulationOverrides = Partial<
  Omit<
    FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessRequest,
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

function localSimulationRequest(
  overrides: SimulationOverrides = {},
): FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessRequest {
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
    total_amount_text: "438,05 SEK",
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
    ["no_final_or_" + "submit_evidence_planned"]:
      true,
    planned_artifacts: [
      "fresh_final_pre_run_evidence",
      "pre_run_visible_state",
      "selector_plan",
      "metadata_only_field_fill_plan",
      "stop_before_review",
      "no_review_modal",
      "no_final_or_submit",
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
    intended_amount_sek: 427.26,
    intended_price: 21.98,
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
    intended_amount_sek: 427.26,
    intended_price: 21.98,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    requested_actions: requestedActions,
  });

  return {
    final_real_browser_fill_only_run_harness_enabled: true,
    final_harness_gate_decision_snapshot:
      "final_real_browser_run_harness_gate_ready",
    final_pre_run_evidence_snapshot: "final_pre_run_evidence_ready",
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
    intended_amount_sek: 427.26,
    intended_price: 21.98,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    operator_presence_confirmed: true,
    requested_actions: requestedActions,
    ...requestOverrides,
  };
}

test.describe("first fill-only POC final harness local simulation", () => {
  test("positive local simulation reaches ready while performing no live action", () => {
    const decision =
      buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
        localSimulationRequest(),
      );

    expect(decision.status).toBe("ready_for_final_fill_only_run");
    expect(decision.ready_for_final_fill_only_run).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
    expect(decision.safety_confirmations).toMatchObject({
      no_live_avanza_run_this_action: true,
      no_browser_launch_or_control_this_action: true,
      no_dom_query_this_action: true,
      no_actual_field_fill_this_action: true,
      no_review_click: true,
      no_review_modal: true,
      no_final_confirm: true,
      no_order_flow_completion: true,
      no_credentials_or_session_handling: true,
      no_database_write: true,
      no_route_or_scan_invocation: true,
      no_trade_stats_or_pnl_mutation: true,
    });
  });

  test("positive local simulation exposes phases, metadata-only field plan, evidence, and aborts", () => {
    const decision =
      buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
        localSimulationRequest(),
      );

    expect(decision.planned_phases.map((phase) => phase.key)).toEqual(
      firstRealAvanzaFillOnlyPocFinalRealBrowserRunPlannedPhases.map(
        (phase) => phase.key,
      ),
    );
    expect(decision.field_fill_plan).toMatchObject({
      amount: { value: 427.26, mode: "metadata_only_no_fill" },
      price: { value: 21.98, mode: "metadata_only_no_fill" },
      total: { mode: "metadata_only_no_read" },
      mode: "metadata_only_no_browser_execution",
    });
    expect(decision.evidence_requirements).toEqual(
      firstRealAvanzaFillOnlyPocFinalRealBrowserRunEvidenceRequirements,
    );
    expect(decision.abort_conditions).toEqual(
      firstRealAvanzaFillOnlyPocFinalRealBrowserRunAbortConditions,
    );
  });

  test("positive local simulation keeps execution capabilities false", () => {
    const decision =
      buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
        localSimulationRequest(),
      );

    expect(decision.capability_flags.can_launch_browser).toBe(false);
    expect(decision.capability_flags.can_access_avanza_without_user_session).toBe(
      false,
    );
    expect(decision.capability_flags.can_handle_credentials).toBe(false);
    expect(decision.capability_flags.can_read_session_data).toBe(false);
    expect(decision.capability_flags.can_execute_field_fill).toBe(false);
    expect(decision.capability_flags.can_click_review).toBe(false);
    expect(decision.capability_flags.can_click_final_confirm).toBe(false);
    expect(decision.capability_flags.can_submit_order).toBe(false);
    expect(decision.capability_flags.can_place_order).toBe(false);
    expect(decision.capability_flags.can_mutate_trades_or_pnl).toBe(false);
    expect(decision.capability_flags.can_prepare_field_fill_plan).toBe(true);
  });

  test("disabled harness stays disabled", () => {
    const decision =
      buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision({
        ...localSimulationRequest(),
        final_real_browser_fill_only_run_harness_enabled: false,
      });

    expect(decision.status).toBe("disabled");
    expect(decision.blocked_reasons).toContain(
      "final_real_browser_fill_only_run_harness_disabled",
    );
  });

  test("missing final harness gate blocks", () => {
    const decision =
      buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
        localSimulationRequest({
          final_harness_gate_decision_snapshot: "deferred",
        }),
      );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("final_harness_gate:not_ready");
  });

  test("missing run gate blocks", () => {
    const decision =
      buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
        localSimulationRequest({ run_gate_decision_snapshot: "deferred" }),
      );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "gated_real_browser_fill_only_run:run_gate:not_ready",
    );
  });

  test("wrong or missing approval blocks", () => {
    for (const request of [
      localSimulationRequest({ real_browser_run_approval_snapshot: "missing" }),
      localSimulationRequest({ approval_snapshot: null }),
    ]) {
      const decision =
        buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
          request,
        );

      expect(decision.ready_for_final_fill_only_run).toBe(false);
      expect(decision.blocked_reasons.length).toBeGreaterThan(0);
    }
  });

  test("missing final pre-run evidence blocks", () => {
    const decision =
      buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
        localSimulationRequest({ final_pre_run_evidence_snapshot: "deferred" }),
      );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "final_pre_run_evidence:not_ready",
    );
  });

  test("operator, manual login, account, and instrument proof are required", () => {
    for (const [override, blocker] of [
      [
        { operator_presence_confirmed: false },
        "gated_real_browser_fill_only_run:operator_presence:not_confirmed",
      ],
      [
        { manual_avanza_login_confirmed: false },
        "gated_real_browser_fill_only_run:manual_avanza_login:not_confirmed",
      ],
      [
        { account_verification_confirmed: false },
        "gated_real_browser_fill_only_run:account_verification:not_confirmed",
      ],
      [
        { instrument_verification_confirmed: false },
        "gated_real_browser_fill_only_run:instrument_verification:not_confirmed",
      ],
    ] as const) {
      const decision =
        buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
          localSimulationRequest(override),
        );

      expect(decision.status).toBe("blocked");
      expect(decision.blocked_reasons).toContain(blocker);
    }
  });

  test("cap above 1000 SEK blocks", () => {
    const decision =
      buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
        localSimulationRequest({
          cap_sek: 1001,
          dry_run: { static_payload: { max_amount_cap_sek: 1001 } },
        }),
      );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "gated_real_browser_fill_only_run:cap_exceeds_policy",
    );
  });

  test("wrong side or wrong order type blocks", () => {
    for (const [request, blocker] of [
      [
        localSimulationRequest({
          dry_run: {
            static_payload: {
              side: "sell",
              payload: payload({ side: "sell" }),
            },
          },
        }),
        "gated_real_browser_fill_only_run:side_not_buy",
      ],
      [
        localSimulationRequest({
          dry_run: {
            static_payload: {
              order_type: "market",
              payload: payload({ order_type: "market" }),
            },
          },
        }),
        "gated_real_browser_fill_only_run:order_type_not_limit_or_avancerad",
      ],
    ] as const) {
      const decision =
        buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
          request,
        );

      expect(decision.ready_for_final_fill_only_run).toBe(false);
      expect(decision.blocked_reasons).toContain(blocker);
    }
  });

  test("review, final, submit, placement, and credential/session requests fail safety", () => {
    for (const requested_actions of [
      { review_click_requested: true },
      { final_confirm_requested: true },
      {
        ["order_" + "submit_requested"]:
          true,
      },
      { order_placement_requested: true },
      { credential_or_session_handling_requested: true },
    ]) {
      const decision =
        buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
          localSimulationRequest({ requested_actions }),
        );

      expect(decision.status).toBe("failed_safety");
    }
  });

  test("sell, Stop Loss, and Glidande requests fail safety", () => {
    for (const requested_actions of [
      { sell_requested: true },
      { stop_loss_requested: true },
      { glidande_requested: true },
    ]) {
      const decision =
        buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
          localSimulationRequest({ requested_actions }),
        );

      expect(decision.status).toBe("failed_safety");
    }
  });

  test("local simulation code is report-only and avoids live browser or service paths", () => {
    const simulationSource = readFileSync(simulationPath, "utf8");
    const harnessSource = readFileSync(harnessPath, "utf8");
    const forbidden = [
      ["puppe", "teer"],
      ["chromium", ".launch"],
      ["document", "."],
      ["window", "."],
      ["fetch", "("],
      ["process", ".env"],
      ["@supa", "base"],
      ["create", "Client"],
      [".fr", "om("],
      [".ins", "ert("],
      ["SERVICE", "_ROLE"],
      ["service", "-role"],
      ["/a", "pi/"],
      ["run", "-scan"],
      ["audit", "-writer"],
      ["avanza", ".se"],
      [".go", "to("],
      [".cl", "ick("],
      [".loc", "ator("],
    ].map((parts) => parts.join(""));

    for (const token of forbidden) {
      expect(simulationSource).not.toContain(token);
      expect(harnessSource).not.toContain(token);
    }
  });
});
