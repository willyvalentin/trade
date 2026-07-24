import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { AvanzaExecutionHandoff } from "../../lib/avanza-execution-handoff";
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
  getExecutionLifecycleDisplayLabel,
  transitionExecutionLifecycle,
  type ExecutionLifecycleState,
} from "../../lib/execution-state-machine";
import {
  runExecutionOrchestrator,
  type ExecutionOrchestratorResult,
} from "../../lib/execution-orchestrator";

const root = process.cwd();
const uiStatusPath = join(root, "lib/execution-ui-status.ts");
const stateMachinePath = join(root, "lib/execution-state-machine.ts");
const plannedAdapterPath = join(
  root,
  "lib/execution-lifecycle-ui-state-adapter.ts",
);
const planPath = join(
  root,
  "docs/execution-lifecycle-state-adapter-refactor-plan.md",
);

const forbiddenClientSafeFragments = [
  "server-only",
  "execution-record-audit-writer",
  "execution-lifecycle-transition-service",
  "transitionExecutionLifecycleOnServer",
  "transitionExecutionLifecycleAndAppendAuditEvent",
  "SUPABASE_SERVICE_ROLE",
  "createClient",
  "supabase",
  "fetch(",
  "localStorage",
  "sessionStorage",
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
      recommendation_id: action === "buy" ? "rec-baseline-001" : null,
      live_position_id: action === "sell" ? "position-baseline-001" : null,
      ticker: "ture",
      market: "US",
      quantity: 10,
      order_type: "limit",
      limit_price: 123.45,
      stop_loss: action === "sell" ? 110 : null,
      target_price: action === "sell" ? 140 : null,
      expires_at: "2026-06-27T20:00:00.000Z",
      payload_id: "payload-baseline-001",
      payload_fingerprint: "payload-fingerprint-baseline-001",
      ...overrides.trading_package,
    },
    safety_warnings: overrides.safety_warnings ?? [],
    broker_result: overrides.broker_result ?? null,
    ...overrides,
  };
}

function createLifecycle(state: ExecutionLifecycleState, action: ExecutionAction = "buy") {
  return createExecutionLifecycleSnapshot({
    lifecycleId: `lifecycle-${state}-${action}`,
    initialState: state,
    createdAt: "2026-06-27T08:00:00.000Z",
    mode: "semi_automatic",
    action,
    triggerType:
      action === "buy" ? "entry_recommendation_ready" : "exit_target_reached",
    intentId: `intent-${state}-${action}`,
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

test.describe("execution lifecycle UI state baseline", () => {
  test("locks lifecycle display labels, severities, CTA metadata, and readiness copy", () => {
    const expectations: Array<{
      state: ExecutionLifecycleState;
      label: string;
      severity: string;
      badgeTone: string;
      title: string;
      ctaType: string;
      canPrepareOrder: boolean;
      blockedReason?: string;
    }> = [
      {
        state: "idle",
        label: "IDLE",
        severity: "neutral",
        badgeTone: "muted",
        title: "Idle",
        ctaType: "none",
        canPrepareOrder: false,
      },
      {
        state: "intent_created",
        label: "INTENT CREATED",
        severity: "info",
        badgeTone: "info",
        title: "Intent created",
        ctaType: "none",
        canPrepareOrder: false,
      },
      {
        state: "candidate_selected",
        label: "CANDIDATE SELECTED",
        severity: "info",
        badgeTone: "info",
        title: "Execution candidate selected",
        ctaType: "none",
        canPrepareOrder: false,
      },
      {
        state: "handoff_created",
        label: "HANDOFF READY",
        severity: "info",
        badgeTone: "info",
        title: "Avanza handoff ready",
        ctaType: "prepare_avanza_order",
        canPrepareOrder: true,
      },
      {
        state: "broker_order_preparing",
        label: "PREPARING",
        severity: "info",
        badgeTone: "info",
        title: "Preparing Avanza order",
        ctaType: "none",
        canPrepareOrder: false,
      },
      {
        state: "waiting_for_manual_confirmation",
        label: "MANUAL CONFIRMATION",
        severity: "warning",
        badgeTone: "warning",
        title: "Waiting for manual confirmation",
        ctaType: "waiting_manual_buy",
        canPrepareOrder: false,
      },
      {
        state: "broker_order_submitting",
        label: "SUBMITTING",
        severity: "info",
        badgeTone: "info",
        title: "Submitting broker order",
        ctaType: "none",
        canPrepareOrder: false,
      },
      {
        state: "broker_result_captured",
        label: "RESULT CAPTURED",
        severity: "success",
        badgeTone: "success",
        title: "Broker result captured",
        ctaType: "none",
        canPrepareOrder: false,
      },
      {
        state: "completed",
        label: "COMPLETED",
        severity: "success",
        badgeTone: "success",
        title: "Execution completed",
        ctaType: "none",
        canPrepareOrder: false,
      },
      {
        state: "failed",
        label: "FAILED",
        severity: "danger",
        badgeTone: "danger",
        title: "Execution failed",
        ctaType: "review_required",
        canPrepareOrder: false,
        blockedReason: "The execution lifecycle failed and needs review.",
      },
      {
        state: "cancelled",
        label: "CANCELLED",
        severity: "warning",
        badgeTone: "warning",
        title: "Execution cancelled",
        ctaType: "none",
        canPrepareOrder: false,
        blockedReason: "The execution lifecycle was cancelled.",
      },
      {
        state: "unknown",
        label: "UNKNOWN",
        severity: "warning",
        badgeTone: "warning",
        title: "Execution unknown",
        ctaType: "review_required",
        canPrepareOrder: false,
        blockedReason: "The execution lifecycle state is unknown and needs review.",
      },
    ];

    for (const expected of expectations) {
      const status = buildExecutionUiStatusFromLifecycle(
        createLifecycle(expected.state),
      );

      expect(status).toMatchObject({
        visible: expected.state !== "idle",
        label: expected.label,
        severity: expected.severity,
        badgeTone: expected.badgeTone,
        title: expected.title,
        ctaType: expected.ctaType,
        canPrepareOrder: expected.canPrepareOrder,
        canSubmitFinalOrder: false,
      });

      if (expected.blockedReason) {
        expect(status.blockedReason).toBe(expected.blockedReason);
      } else {
        expect(status.blockedReason).toBeUndefined();
      }
    }
  });

  test("locks manual-confirmation CTA distinction for buy and sell lifecycles", () => {
    expect(
      buildExecutionUiStatusFromLifecycle(
        createLifecycle("waiting_for_manual_confirmation", "buy"),
      ),
    ).toMatchObject({
      ctaType: "waiting_manual_buy",
      action: "buy",
      description:
        "The Avanza order requires manual confirmation before final submission.",
    });

    expect(
      buildExecutionUiStatusFromLifecycle(
        createLifecycle("waiting_for_manual_confirmation", "sell"),
      ),
    ).toMatchObject({
      ctaType: "waiting_manual_sell",
      action: "sell",
      description:
        "The Avanza order requires manual confirmation before final submission.",
    });
  });

  test("locks orchestrator status labels, severity, CTA state, and disabled reasons", () => {
    const noAction = buildExecutionUiStatusFromOrchestratorResult(
      runExecutionOrchestrator({ createdAt: "2026-06-27T08:00:00.000Z" }),
    );

    expect(noAction).toEqual({
      visible: false,
      severity: "neutral",
      badgeTone: "muted",
      label: "NO ACTION",
      title: "No execution action",
      description: "Ture has no execution action ready.",
      ctaType: "none",
      canPrepareOrder: false,
      canSubmitFinalOrder: false,
    });

    const semiAutomatic = buildExecutionUiStatusFromOrchestratorResult(
      runExecutionOrchestrator({
        candidateIntents: [createIntent()],
        createdAt: "2026-06-27T08:00:00.000Z",
      }),
    );

    expect(semiAutomatic).toMatchObject({
      visible: true,
      severity: "info",
      badgeTone: "info",
      label: "ENTRY READY",
      title: "Buy action ready",
      ctaType: "prepare_avanza_order",
      ctaLabel: "Prepare in Avanza",
      action: "buy",
      mode: "semi_automatic",
      triggerType: "entry_recommendation_ready",
      ticker: "TURE",
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
    });

    const automatic = buildExecutionUiStatusFromOrchestratorResult(
      runExecutionOrchestrator({
        candidateIntents: [createIntent({ mode: "automatic" })],
        createdAt: "2026-06-27T08:00:00.000Z",
      }),
    );

    expect(automatic).toMatchObject({
      visible: true,
      severity: "info",
      label: "ENTRY READY",
      ctaType: "automatic_ready",
      ctaLabel: "Automatic execution ready",
      mode: "automatic",
      canPrepareOrder: true,
      canSubmitFinalOrder: true,
    });

    const blocked = buildExecutionUiStatusFromOrchestratorResult(
      createBlockedResult("blocked"),
    );

    expect(blocked).toMatchObject({
      visible: true,
      severity: "danger",
      badgeTone: "danger",
      label: "BLOCKED",
      title: "Execution handoff blocked",
      ctaType: "blocked",
      canPrepareOrder: false,
      canSubmitFinalOrder: false,
      blockedReason: "Quantity is missing or not positive.",
    });

    const invalid = buildExecutionUiStatusFromOrchestratorResult(
      createBlockedResult("invalid_intent"),
    );

    expect(invalid).toMatchObject({
      visible: true,
      severity: "warning",
      badgeTone: "warning",
      label: "REVIEW REQUIRED",
      title: "Execution intent needs review",
      ctaType: "review_required",
      canPrepareOrder: false,
      canSubmitFinalOrder: false,
      blockedReason: "Execution intent id is missing.",
    });
  });

  test("locks modal core summary copy source values", () => {
    const status = buildExecutionUiStatusFromOrchestratorResult(
      runExecutionOrchestrator({
        candidateIntents: [createIntent()],
        createdAt: "2026-06-27T08:00:00.000Z",
      }),
    );

    expect({
      statusLabel: status.label,
      statusTitle: status.title,
      statusDescription: status.description,
    }).toEqual({
      statusLabel: "ENTRY READY",
      statusTitle: "Buy action ready",
      statusDescription:
        "Ture selected an entry recommendation and prepared a buy execution handoff.",
    });
  });

  test("locks lifecycle state-machine semantics used by UI status derivation", () => {
    let snapshot = createExecutionLifecycleSnapshot({
      lifecycleId: "lifecycle-baseline-sequence",
      createdAt: "2026-06-27T08:00:00.000Z",
      mode: "semi_automatic",
      action: "buy",
      triggerType: "entry_recommendation_ready",
    });

    const sequence = [
      ["create_intent", "intent_created"],
      ["select_candidate", "candidate_selected"],
      ["create_handoff", "handoff_created"],
      ["start_broker_preparation", "broker_order_preparing"],
      ["wait_for_manual_confirmation", "waiting_for_manual_confirmation"],
      ["capture_broker_result", "broker_result_captured"],
      ["complete_execution", "completed"],
    ] as const;

    for (const [eventType, expectedState] of sequence) {
      const result = transitionExecutionLifecycle(snapshot, eventType, {
        createdAt: "2026-06-27T08:01:00.000Z",
        message: `Baseline ${eventType}`,
      });

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.snapshot.currentState).toBe(expectedState);
        expect(getExecutionLifecycleDisplayLabel(expectedState)).toBeTruthy();
        snapshot = result.snapshot;
      }
    }

    const invalid = transitionExecutionLifecycle(snapshot, "create_intent", {
      createdAt: "2026-06-27T08:02:00.000Z",
    });

    expect(invalid).toMatchObject({
      ok: false,
      snapshot,
      error: "Cannot transition from terminal state completed.",
    });
  });

  test("keeps current UI-derived status output debug-safe and metadata-light", () => {
    const status = buildExecutionUiStatusFromLifecycle(
      createLifecycle("handoff_created"),
    );
    const keys = Object.keys(status).sort();

    expect(keys).toEqual([
      "action",
      "badgeTone",
      "canPrepareOrder",
      "canSubmitFinalOrder",
      "ctaType",
      "description",
      "label",
      "mode",
      "severity",
      "title",
      "triggerType",
      "visible",
    ]);

    expect(JSON.stringify(status)).not.toMatch(
      /service[_-]?role|SUPABASE|execution_record_audit_events|secret|token/i,
    );
  });

  test("keeps current client-safe lifecycle UI helpers free of server and write-path imports", () => {
    const sources = [
      ["lib/execution-ui-status.ts", read(uiStatusPath)],
      ["lib/execution-state-machine.ts", read(stateMachinePath)],
    ] as const;

    for (const [path, source] of sources) {
      for (const fragment of forbiddenClientSafeFragments) {
        expect(source, `${path} must not include ${fragment}`).not.toContain(
          fragment,
        );
      }
    }
  });

  test("documents and preserves the implemented adapter boundary", () => {
    const plan = read(planPath);

    expect(read(plannedAdapterPath)).not.toContain("server-only");
    expect(plan).toContain("lib/execution-lifecycle-ui-state-adapter.ts");
    expect(plan).toContain("no service-role imports");
    expect(plan).toContain("no audit writer server module imports");
    expect(plan).toContain("no localStorage/sessionStorage access");
  });
});
