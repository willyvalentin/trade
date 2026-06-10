import {
  buildAvanzaExecutionHandoff,
  type AvanzaExecutionHandoff,
} from "@/lib/avanza-execution-handoff";
import {
  pickNextExecutionIntent,
  type ExecutionCandidatePickerResult,
} from "@/lib/execution-candidate-picker";
import {
  createExecutionLifecycleSnapshot,
  transitionExecutionLifecycle,
  type ExecutionLifecycleSnapshot,
} from "@/lib/execution-state-machine";
import type { ExecutionIntent, ExecutionMode } from "@/lib/execution";
import {
  buildSellExecutionIntentsForLivePositions,
  type LivePositionExitMonitorInput,
  type LivePositionSellExecutionIntent,
} from "@/lib/live-position-exit-monitor";

export type ExecutionOrchestratorStatus =
  | "no_action"
  | "candidate_selected"
  | "handoff_ready"
  | "handoff_blocked"
  | "invalid_candidate";

export type ExecutionOrchestratorInput = {
  livePositions?: readonly LivePositionExitMonitorInput[];
  candidateIntents?: readonly ExecutionIntent[];
  mode?: ExecutionMode | null;
  createdAt?: string | null;
};

export type ExecutionOrchestratorResult = {
  status: ExecutionOrchestratorStatus;
  selectedIntent: ExecutionIntent | null;
  liveExitIntents: LivePositionSellExecutionIntent[];
  allCandidateIntents: ExecutionIntent[];
  pickerResult: ExecutionCandidatePickerResult;
  handoff: AvanzaExecutionHandoff | null;
  lifecycle: ExecutionLifecycleSnapshot;
  transitionErrors: string[];
};

function normalizeCreatedAt(value: string | null | undefined) {
  return typeof value === "string" &&
    value.trim() &&
    Number.isFinite(Date.parse(value))
    ? value.trim()
    : new Date().toISOString();
}

function livePositionsWithDefaults(input: ExecutionOrchestratorInput) {
  return (input.livePositions ?? []).map((position) => ({
    ...position,
    ...(position.mode ? {} : { mode: input.mode }),
    ...(position.createdAt ? {} : { createdAt: input.createdAt }),
  }));
}

function statusFromHandoff(
  handoff: AvanzaExecutionHandoff | null,
): ExecutionOrchestratorStatus {
  if (!handoff) {
    return "candidate_selected";
  }

  if (handoff.status === "ready") {
    return "handoff_ready";
  }

  if (handoff.status === "blocked") {
    return "handoff_blocked";
  }

  return "invalid_candidate";
}

function createLifecycleForSelectedIntent(
  selectedIntent: ExecutionIntent,
  handoff: AvanzaExecutionHandoff,
  createdAt: string,
) {
  const transitionErrors: string[] = [];
  let lifecycle = createExecutionLifecycleSnapshot({
    createdAt,
    mode: selectedIntent.mode,
    action: selectedIntent.action,
    triggerType: selectedIntent.trigger_type,
    intentId: selectedIntent.intent_id,
    recommendationId: selectedIntent.trading_package.recommendation_id,
    positionId: selectedIntent.trading_package.live_position_id,
  });

  const createIntent = transitionExecutionLifecycle(lifecycle, "create_intent", {
    createdAt,
    intentId: selectedIntent.intent_id,
    recommendationId: selectedIntent.trading_package.recommendation_id,
    positionId: selectedIntent.trading_package.live_position_id,
    mode: selectedIntent.mode,
    action: selectedIntent.action,
    triggerType: selectedIntent.trigger_type,
    message: "Execution intent created.",
  });

  if (createIntent.ok) {
    lifecycle = createIntent.snapshot;
  } else {
    transitionErrors.push(createIntent.error);
  }

  const selectCandidate = transitionExecutionLifecycle(
    lifecycle,
    "select_candidate",
    {
      createdAt,
      intentId: selectedIntent.intent_id,
      message: "Execution candidate selected.",
    },
  );

  if (selectCandidate.ok) {
    lifecycle = selectCandidate.snapshot;
  } else {
    transitionErrors.push(selectCandidate.error);
  }

  const createHandoff = transitionExecutionLifecycle(lifecycle, "create_handoff", {
    createdAt,
    intentId: selectedIntent.intent_id,
    handoffVersion: handoff.version,
    message: "Avanza execution handoff created.",
    metadata: {
      handoff_status: handoff.status,
      can_prepare_order: handoff.canPrepareOrder,
      can_submit_final_order: handoff.canSubmitFinalOrder,
    },
  });

  if (createHandoff.ok) {
    lifecycle = createHandoff.snapshot;
  } else {
    transitionErrors.push(createHandoff.error);
  }

  return { lifecycle, transitionErrors };
}

export function runExecutionOrchestrator(
  input: ExecutionOrchestratorInput = {},
): ExecutionOrchestratorResult {
  const createdAt = normalizeCreatedAt(input.createdAt);
  const liveExitIntents = buildSellExecutionIntentsForLivePositions(
    livePositionsWithDefaults(input),
  );
  const allCandidateIntents = [
    ...liveExitIntents,
    ...(input.candidateIntents ?? []),
  ];
  const pickerResult = pickNextExecutionIntent(allCandidateIntents);
  const selectedIntent = pickerResult.selectedIntent;

  if (!selectedIntent) {
    return {
      status: "no_action",
      selectedIntent: null,
      liveExitIntents,
      allCandidateIntents,
      pickerResult,
      handoff: null,
      lifecycle: createExecutionLifecycleSnapshot({
        createdAt,
        mode: input.mode,
      }),
      transitionErrors: [],
    };
  }

  const handoff = buildAvanzaExecutionHandoff(selectedIntent, { createdAt });
  const { lifecycle, transitionErrors } = createLifecycleForSelectedIntent(
    selectedIntent,
    handoff,
    createdAt,
  );

  return {
    status: statusFromHandoff(handoff),
    selectedIntent,
    liveExitIntents,
    allCandidateIntents,
    pickerResult,
    handoff,
    lifecycle,
    transitionErrors,
  };
}

export function hasExecutableHandoff(result: ExecutionOrchestratorResult) {
  return (
    result.handoff?.status === "ready" &&
    result.handoff.canPrepareOrder === true
  );
}
