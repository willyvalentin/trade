import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { AvanzaExecutionHandoff } from "../../lib/avanza-execution-handoff";
import {
  buildExecutionLifecycleModalCopy,
  buildExecutionLifecycleDebugSummary,
  buildExecutionLifecycleUiState,
  getExecutionLifecycleCtaState,
  getExecutionLifecycleSeverity,
  getExecutionLifecycleStatusLabel,
} from "../../lib/execution-lifecycle-ui-state-adapter";
import {
  buildExecutionUiStatusFromLifecycle,
  buildExecutionUiStatusFromOrchestratorResult,
} from "../../lib/execution-ui-status";
import {
  getExecutionAuthorityForMode,
  getExecutionTriggerPriority,
  type ExecutionAction,
  type ExecutionIntent,
  type ExecutionMode,
  type ExecutionTriggerType,
} from "../../lib/execution";
import {
  createExecutionLifecycleSnapshot,
  type ExecutionLifecycleState,
} from "../../lib/execution-state-machine";
import {
  runExecutionOrchestrator,
  type ExecutionOrchestratorResult,
} from "../../lib/execution-orchestrator";

const root = process.cwd();
const adapterPath = join(root, "lib/execution-lifecycle-ui-state-adapter.ts");
const tradeAppPath = join(root, "app/trade-app.tsx");
const sandboxFixtureCardPath = join(
  root,
  "components/execution/execution-sandbox-fixture-card.tsx",
);
const handoffPreviewModalPath = join(
  root,
  "components/execution/execution-handoff-preview-modal.tsx",
);

const forbiddenAdapterFragments = [
  "server-only",
  "execution-record-audit-writer",
  "execution-lifecycle-transition-service",
  "transitionExecutionLifecycleOnServer",
  "transitionExecutionLifecycleAndAppendAuditEvent",
  "SUPABASE_SERVICE_ROLE",
  "process.env",
  "createClient",
  "supabase",
  "fetch(",
  "localStorage",
  "sessionStorage",
  "window.",
  "document.",
  ".insert(",
  ".update(",
  ".delete(",
  ".upsert(",
  ".select(",
];

function read(path: string) {
  return readFileSync(path, "utf8");
}

function createIntent(
  overrides: Partial<ExecutionIntent> & {
    action?: ExecutionAction;
    mode?: ExecutionMode;
    trigger_type?: ExecutionTriggerType;
  } = {},
): ExecutionIntent {
  const mode = overrides.mode ?? "semi_automatic";
  const action = overrides.action ?? "buy";
  const triggerType = overrides.trigger_type ?? "entry_recommendation_ready";

  return {
    intent_version: "1.0",
    intent_id: overrides.intent_id ?? `intent-${action}-${mode}-${triggerType}`,
    created_at: overrides.created_at ?? "2026-06-27T08:00:00.000Z",
    mode,
    authority: overrides.authority ?? getExecutionAuthorityForMode(mode),
    action,
    trigger_type: triggerType,
    trigger_priority:
      overrides.trigger_priority ?? getExecutionTriggerPriority(triggerType),
    broker_hint: "AVANZA",
    source: overrides.source ?? "recommendation",
    trading_package: {
      package_version: "1.0",
      recommendation_id: action === "buy" ? "rec-adapter-001" : null,
      live_position_id: action === "sell" ? "position-adapter-001" : null,
      ticker: "ture",
      market: "US",
      quantity: 10,
      order_type: "limit",
      limit_price: 123.45,
      stop_loss: action === "sell" ? 110 : null,
      target_price: action === "sell" ? 140 : null,
      expires_at: "2026-06-27T20:00:00.000Z",
      payload_id: "payload-adapter-001",
      payload_fingerprint: "payload-fingerprint-adapter-001",
      ...overrides.trading_package,
    },
    safety_warnings: overrides.safety_warnings ?? [],
    broker_result: overrides.broker_result ?? null,
    ...overrides,
  };
}

function createLifecycle(state: ExecutionLifecycleState, action: ExecutionAction = "buy") {
  return createExecutionLifecycleSnapshot({
    lifecycleId: `lifecycle-adapter-${state}-${action}`,
    initialState: state,
    createdAt: "2026-06-27T08:00:00.000Z",
    mode: "semi_automatic",
    action,
    triggerType:
      action === "buy" ? "entry_recommendation_ready" : "exit_target_reached",
    intentId: `intent-adapter-${state}-${action}`,
  });
}

function createBlockedResult(
  handoffStatus: AvanzaExecutionHandoff["status"],
): ExecutionOrchestratorResult {
  const intent = createIntent();
  const handoff = {
    version: "avanza_execution_handoff_v2",
    createdAt: "2026-06-27T08:00:00.000Z",
    broker: "avanza",
    status: handoffStatus,
    mode: intent.mode,
    action: intent.action,
    triggerType: intent.trigger_type,
    intent,
    authority: intent.authority,
    safetyChecks: [],
    canPrepareOrder: false,
    canSubmitFinalOrder: false,
    blockedReason:
      handoffStatus === "invalid_intent"
        ? "Execution intent id is missing."
        : "Quantity is missing or not positive.",
  } satisfies AvanzaExecutionHandoff;

  return {
    status: handoffStatus === "blocked" ? "handoff_blocked" : "invalid_candidate",
    selectedIntent: intent,
    liveExitIntents: [],
    allCandidateIntents: [intent],
    pickerResult: {
      selectedIntent: intent,
      validIntents: [intent],
      invalidIntents: [],
      reason: "selected_only_valid_candidate",
    },
    handoff,
    lifecycle: createLifecycle("handoff_created"),
    transitionErrors: [],
  } satisfies ExecutionOrchestratorResult;
}

test.describe("execution lifecycle UI state adapter", () => {
  test("reproduces baseline lifecycle labels, severities, CTA state, and disabled reasons", () => {
    const expectations: Array<{
      state: ExecutionLifecycleState;
      label: string;
      severity: string;
      ctaType: string;
      ctaEnabled: boolean;
      canPrepareOrder: boolean;
      disabledReason: string | null;
    }> = [
      {
        state: "idle",
        label: "IDLE",
        severity: "neutral",
        ctaType: "none",
        ctaEnabled: false,
        canPrepareOrder: false,
        disabledReason: "No lifecycle action is available.",
      },
      {
        state: "handoff_created",
        label: "HANDOFF READY",
        severity: "info",
        ctaType: "prepare_avanza_order",
        ctaEnabled: true,
        canPrepareOrder: true,
        disabledReason: null,
      },
      {
        state: "waiting_for_manual_confirmation",
        label: "MANUAL CONFIRMATION",
        severity: "warning",
        ctaType: "waiting_manual_buy",
        ctaEnabled: false,
        canPrepareOrder: false,
        disabledReason: "Manual confirmation is required before continuing.",
      },
      {
        state: "completed",
        label: "COMPLETED",
        severity: "success",
        ctaType: "none",
        ctaEnabled: false,
        canPrepareOrder: false,
        disabledReason: "No lifecycle action is available.",
      },
      {
        state: "failed",
        label: "FAILED",
        severity: "danger",
        ctaType: "review_required",
        ctaEnabled: false,
        canPrepareOrder: false,
        disabledReason: "The execution lifecycle failed and needs review.",
      },
      {
        state: "unknown",
        label: "UNKNOWN",
        severity: "warning",
        ctaType: "review_required",
        ctaEnabled: false,
        canPrepareOrder: false,
        disabledReason: "The execution lifecycle state is unknown and needs review.",
      },
    ];

    for (const expected of expectations) {
      const lifecycle = createLifecycle(expected.state);
      const baseline = buildExecutionUiStatusFromLifecycle(lifecycle);
      const adapter = buildExecutionLifecycleUiState({
        source: "lifecycle",
        lifecycle,
      });

      expect(adapter).toMatchObject({
        source: "lifecycle",
        visible: baseline.visible,
        statusLabel: expected.label,
        lifecycleLabel: expect.any(String),
        lifecycleState: expected.state,
        severity: expected.severity,
        badgeTone: baseline.badgeTone,
        title: baseline.title,
        description: baseline.description,
        canPrepareOrder: expected.canPrepareOrder,
        canSubmitFinalOrder: false,
        disabledReason: expected.disabledReason,
        manualConfirmationRequired:
          expected.state === "waiting_for_manual_confirmation",
        terminal: ["completed", "failed", "unknown"].includes(expected.state),
      });
      expect(adapter.cta).toEqual({
        type: expected.ctaType,
        label: baseline.ctaLabel ?? (expected.ctaType === "none" ? null : expect.any(String)),
        enabled: expected.ctaEnabled,
        disabledReason: expected.disabledReason,
      });
      expect(adapter.summaryRows.length).toBeGreaterThanOrEqual(5);
      expect(adapter.debugMetadata.statusLabel).toBe(expected.label);
    }
  });

  test("preserves manual-confirmation CTA split for buy and sell lifecycles", () => {
    const buy = buildExecutionLifecycleUiState({
      source: "lifecycle",
      lifecycle: createLifecycle("waiting_for_manual_confirmation", "buy"),
    });
    const sell = buildExecutionLifecycleUiState({
      source: "lifecycle",
      lifecycle: createLifecycle("waiting_for_manual_confirmation", "sell"),
    });

    expect(buy.cta).toMatchObject({
      type: "waiting_manual_buy",
      label: "Waiting for manual buy confirmation",
      enabled: false,
    });
    expect(sell.cta).toMatchObject({
      type: "waiting_manual_sell",
      label: "Waiting for manual sell confirmation",
      enabled: false,
    });
    expect(buy.manualConfirmationRequired).toBe(true);
    expect(sell.manualConfirmationRequired).toBe(true);
  });

  test("reproduces orchestrator status behavior and automatic display without enabling runtime behavior", () => {
    const semiResult = runExecutionOrchestrator({
      candidateIntents: [createIntent()],
      createdAt: "2026-06-27T08:00:00.000Z",
    });
    const semiBaseline = buildExecutionUiStatusFromOrchestratorResult(semiResult);
    const semiAdapter = buildExecutionLifecycleUiState({
      source: "orchestrator",
      result: semiResult,
    });

    expect(semiAdapter).toMatchObject({
      source: "orchestrator",
      statusLabel: semiBaseline.label,
      severity: semiBaseline.severity,
      cta: {
        type: "prepare_avanza_order",
        label: "Prepare in Avanza",
        enabled: true,
        disabledReason: null,
      },
      statusSurface: {
        label: semiBaseline.label,
        title: semiBaseline.title,
        description: semiBaseline.description,
        ctaType: "prepare_avanza_order",
        ctaLabel: "Prepare in Avanza",
        canPrepareOrder: true,
        canSubmitFinalOrder: false,
      },
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
      readinessHint: "Execution handoff is ready for preparation.",
    });

    const automaticResult = runExecutionOrchestrator({
      candidateIntents: [createIntent({ mode: "automatic" })],
      createdAt: "2026-06-27T08:00:00.000Z",
    });
    const automaticAdapter = buildExecutionLifecycleUiState({
      source: "orchestrator",
      result: automaticResult,
    });

    expect(automaticAdapter).toMatchObject({
      statusLabel: "ENTRY READY",
      cta: {
        type: "automatic_ready",
        label: "Automatic execution ready",
        enabled: true,
        disabledReason: null,
      },
      canPrepareOrder: true,
      canSubmitFinalOrder: true,
      readinessHint: "Final order submission is available.",
    });
    expect(JSON.stringify(automaticAdapter)).not.toMatch(
      /submit_order|click_buy|click_sell|confirm_order|brokerResult/i,
    );
  });

  test("preserves blocked and invalid disabled reasons", () => {
    const blocked = buildExecutionLifecycleUiState({
      source: "orchestrator",
      result: createBlockedResult("blocked"),
    });
    const invalid = buildExecutionLifecycleUiState({
      source: "orchestrator",
      result: createBlockedResult("invalid_intent"),
    });

    expect(blocked).toMatchObject({
      statusLabel: "BLOCKED",
      severity: "danger",
      cta: {
        type: "blocked",
        label: "Blocked",
        enabled: false,
        disabledReason: "Quantity is missing or not positive.",
      },
      disabledReason: "Quantity is missing or not positive.",
      readinessHint: "Quantity is missing or not positive.",
    });
    expect(invalid).toMatchObject({
      statusLabel: "REVIEW REQUIRED",
      severity: "warning",
      cta: {
        type: "review_required",
        label: "Review required",
        enabled: false,
        disabledReason: "Execution intent id is missing.",
      },
      disabledReason: "Execution intent id is missing.",
      readinessHint: "Execution intent id is missing.",
    });
  });

  test("exposes small pure selector helpers", () => {
    const lifecycle = createLifecycle("handoff_created");
    const status = buildExecutionUiStatusFromLifecycle(lifecycle);

    expect(getExecutionLifecycleStatusLabel(status)).toBe("HANDOFF READY");
    expect(getExecutionLifecycleSeverity(status)).toBe("info");
    expect(getExecutionLifecycleCtaState(status)).toEqual({
      type: "prepare_avanza_order",
      label: "Prepare in Avanza",
      enabled: true,
      disabledReason: null,
    });
    expect(
      buildExecutionLifecycleDebugSummary({
        source: "status",
        status,
        lifecycle,
      }),
    ).toEqual({
      source: "status",
      visible: true,
      statusLabel: "HANDOFF READY",
      lifecycleState: "handoff_created",
      severity: "info",
      ctaType: "prepare_avanza_order",
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
      manualConfirmationRequired: false,
      terminal: false,
    });
    expect(buildExecutionLifecycleModalCopy({ status, lifecycle })).toEqual({
      statusLabel: "HANDOFF READY",
      statusTitle: status.title,
      statusDescription: status.description,
      readinessHint: "Execution handoff is ready for preparation.",
    });
  });

  test("preserves modal core summary copy and readiness output", () => {
    const semiResult = runExecutionOrchestrator({
      candidateIntents: [createIntent()],
      createdAt: "2026-06-27T08:00:00.000Z",
    });
    const baseline = buildExecutionUiStatusFromOrchestratorResult(semiResult);
    const modalCopy = buildExecutionLifecycleModalCopy({
      status: baseline,
      lifecycle: semiResult.lifecycle,
    });

    expect(modalCopy).toEqual({
      statusLabel: baseline.label,
      statusTitle: baseline.title,
      statusDescription: baseline.description,
      readinessHint: "Execution handoff is ready for preparation.",
    });
    expect(JSON.stringify(modalCopy)).not.toMatch(
      /service[_-]?role|SUPABASE|execution_record_audit_events|secret|token/i,
    );
  });

  test("returns deterministic and debug-safe output for identical inputs", () => {
    const lifecycle = createLifecycle("handoff_created");
    const first = buildExecutionLifecycleUiState({ source: "lifecycle", lifecycle });
    const second = buildExecutionLifecycleUiState({ source: "lifecycle", lifecycle });

    expect(first).toEqual(second);
    expect(JSON.stringify(first)).not.toMatch(
      /service[_-]?role|SUPABASE|execution_record_audit_events|secret|token/i,
    );
  });

  test("keeps adapter source client-safe and free of server/write-path imports", () => {
    const source = read(adapterPath);

    for (const fragment of forbiddenAdapterFragments) {
      expect(source, `adapter must not include ${fragment}`).not.toContain(
        fragment,
      );
    }
  });

  test("wires adapter into exactly one read-only sandbox fixture status surface", () => {
    const source = read(tradeAppPath);
    const sandboxSource = read(sandboxFixtureCardPath);
    const liveStatusSurfaceStart = source.indexOf("statusSurface={");
    const liveStatusSurfaceEnd = source.indexOf("function sellAgentCommandTone");
    const liveStatusSurfaceSource = source.slice(
      liveStatusSurfaceStart,
      liveStatusSurfaceEnd,
    );

    expect(
      (sandboxSource.match(/buildExecutionLifecycleUiState/g) ?? []).length,
    ).toBe(2);
    expect(sandboxSource).toContain(
      'buildExecutionLifecycleUiState } from "@/lib/execution-lifecycle-ui-state-adapter";',
    );
    expect(source).toContain(
      'from "@/components/execution/execution-sandbox-fixture-card"',
    );
    expect(sandboxSource).toContain("buildExecutionLifecycleUiState({");
    expect(sandboxSource).toContain('source: "orchestrator"');
    expect(sandboxSource).toContain("result: orchestratorResult");
    expect(sandboxSource).toContain("status={uiState.statusSurface}");
    expect(sandboxSource).not.toContain("const uiStatusForSurface");
    expect(sandboxSource).toContain("onViewHandoff");
    expect(sandboxSource).not.toContain("useEffect(");
    expect(sandboxSource).not.toContain("localStorage");
    expect(sandboxSource).not.toContain("fetch(");
    expect(liveStatusSurfaceSource).toContain("status={liveExecutionStatus}");
    expect(liveStatusSurfaceSource).not.toContain("uiStatusForSurface");
  });

  test("wires modal copy adapter into exactly one modal core summary surface", () => {
    const source = read(tradeAppPath);
    const modalSource = read(handoffPreviewModalPath);
    const coreSummaryStart = modalSource.indexOf("coreSummaryProps={{");
    const coreSummaryEnd = modalSource.indexOf("executionBrokerCaptureStubPanelProps");
    const coreSummarySource = modalSource.slice(coreSummaryStart, coreSummaryEnd);

    expect(
      (modalSource.match(/buildExecutionLifecycleModalCopy/g) ?? []).length,
    ).toBe(2);
    expect(source).toContain(
      'from "@/components/execution/execution-handoff-preview-modal"',
    );
    expect(source).not.toContain("function ExecutionHandoffPreviewModal");
    expect(modalSource).toContain("const modalCopy = buildExecutionLifecycleModalCopy({");
    expect(coreSummarySource).toContain("statusDescription: modalCopy.statusDescription");
    expect(coreSummarySource).toContain("statusLabel: modalCopy.statusLabel");
    expect(coreSummarySource).toContain("statusTitle: modalCopy.statusTitle");
    expect(coreSummarySource).not.toContain("localStorage");
    expect(coreSummarySource).not.toContain("SUPABASE_SERVICE_ROLE");
  });
});
