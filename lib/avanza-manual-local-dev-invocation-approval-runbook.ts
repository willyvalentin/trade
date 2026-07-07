import type {
  AvanzaDisabledLocalDevBridgeRunnerReport,
} from "./avanza-disabled-local-dev-bridge-runner";
import type {
  AvanzaLocalDevBridgeActivationChecklist,
} from "./avanza-local-dev-bridge-activation-checklist";
import type {
  AvanzaLocalDevBridgeReadinessCheckpoint,
} from "./avanza-local-dev-bridge-readiness-checkpoint";
import type {
  AvanzaModelOnlyLocalDevBridgeDryRunReport,
} from "./avanza-model-only-local-dev-bridge-dry-runner";

export type AvanzaManualLocalDevInvocationApprovalRunbookStatus =
  | "ready_for_manual_review"
  | "review_incomplete"
  | "approved_for_invocation_adapter_design"
  | "blocked_missing_checkpoint"
  | "blocked_missing_evidence"
  | "blocked_safety_risk"
  | "real_run_forbidden"
  | "production_forbidden"
  | "unknown";

export type AvanzaManualLocalDevInvocationApprovalItemStatus =
  | "pending"
  | "passed"
  | "failed"
  | "blocked"
  | "forbidden"
  | "not_applicable"
  | "unknown";

export type AvanzaManualLocalDevInvocationApprovalLevel =
  | "none"
  | "review_only"
  | "approved_for_disabled_invocation_adapter_design"
  | "approved_for_model_only_invocation_adapter_design"
  | "runtime_invocation_forbidden"
  | "real_run_forbidden"
  | "unknown";

export type AvanzaManualLocalDevInvocationApprovalEvidenceKind =
  | "bridge_readiness_checkpoint"
  | "model_only_dry_run_report"
  | "disabled_runner_report"
  | "activation_checklist"
  | "operator_attestation"
  | "safety_review_note"
  | "redacted_log"
  | "redacted_screenshot"
  | "none";

export type AvanzaManualLocalDevInvocationApprovalGateStatus =
  | "locked"
  | "review_required"
  | "approved_for_design_only"
  | "model_only"
  | "forbidden"
  | "unknown";

export type AvanzaManualLocalDevInvocationApprovalItem = {
  itemId: string;
  status: AvanzaManualLocalDevInvocationApprovalItemStatus;
  label: string;
  purpose: string;
  required: boolean;
  evidenceKind: AvanzaManualLocalDevInvocationApprovalEvidenceKind;
  evidenceRequired: boolean;
  evidenceForbidden: boolean;
  passedBy: string[];
  blockedReason?: string;
  warning?: string;
};

export type AvanzaManualLocalDevInvocationApprovalEvidence = {
  evidenceId: string;
  kind: AvanzaManualLocalDevInvocationApprovalEvidenceKind;
  label: string;
  safeSummary: string;
  accepted: boolean;
  forbidden: boolean;
  forbiddenReason?: string;
  redactionRequired: boolean;
  mayContainSensitiveData: boolean;
  allowedToPersist: boolean;
};

export type AvanzaManualLocalDevInvocationApprovalGate = {
  gateId: string;
  status: AvanzaManualLocalDevInvocationApprovalGateStatus;
  label: string;
  purpose: string;
  currentlyAllows: string[];
  currentlyBlocks: string[];
  unlockRequires: string[];
  forbiddenActions: string[];
};

export type AvanzaManualLocalDevInvocationApprovalSafetyFlags = {
  runbookOnly: true;
  approvalModelOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canApproveInvocationAdapterDesign: boolean;
  canOpenLocalDevBridgeGate: false;
  canCrossInvocationBoundaryNow: false;
  canInvokeSmokeRunnerNow: false;
  canRunTerminalScriptNow: false;
  canUseBrowserAutomationNow: false;
  canStartHandoff: false;
  canPrepareOrderNow: false;
  canRunSmokeTestFromUi: false;
  canCallApiRoute: false;
  canFetch: false;
  canPoll: false;
  canAccessCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canSubmitOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canWriteSupabase: false;
  canClaimProductionReady: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaManualLocalDevInvocationApprovalRunbookInput = {
  runbookId?: string;
  bridgeReadinessCheckpoint?: AvanzaLocalDevBridgeReadinessCheckpoint;
  modelOnlyDryRunReport?: AvanzaModelOnlyLocalDevBridgeDryRunReport;
  disabledRunnerReport?: AvanzaDisabledLocalDevBridgeRunnerReport;
  activationChecklist?: AvanzaLocalDevBridgeActivationChecklist;
  evidence?: AvanzaManualLocalDevInvocationApprovalEvidence[];
  operatorReviewed?: boolean;
  safetyReviewed?: boolean;
  evidenceReviewed?: boolean;
  invocationAdapterDesignRequested?: boolean;
  modelOnlyAdapterDesignRequested?: boolean;
  runtimeInvocationRequested?: boolean;
  realRunRequested?: boolean;
  productionReadinessRequested?: boolean;
  now?: string;
};

export type AvanzaManualLocalDevInvocationApprovalRunbook = {
  runbookId: string;
  createdAt: string;
  status: AvanzaManualLocalDevInvocationApprovalRunbookStatus;
  label: string;
  summary: string;
  approvalLevel: AvanzaManualLocalDevInvocationApprovalLevel;
  items: AvanzaManualLocalDevInvocationApprovalItem[];
  evidence: AvanzaManualLocalDevInvocationApprovalEvidence[];
  approvalGates: AvanzaManualLocalDevInvocationApprovalGate[];
  approvedNextDesignStep: string;
  explicitlyForbiddenNextSteps: string[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaManualLocalDevInvocationApprovalSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

const forbiddenNextSteps = [
  "runtime invocation",
  "real Avanza run",
  "production readiness claim",
  "smoke runner invocation",
  "terminal script invocation",
  "browser automation",
  "credential access",
  "cookie/session read or export",
  "BankID automation",
  "order submission",
  "final KOP/SALJ agent click",
  "Supabase execution write",
  "Trade UI active handoff",
  "API route activation",
] as const;

const lockedRuntimeActions = [
  "Smoke runner invocation blocked",
  "Terminal script invocation blocked",
  "Browser automation locked",
  "Credential access locked",
  "Cookies/session forbidden",
  "BankID automation forbidden/manual-only",
  "Order submission forbidden",
  "Final KÖP/SÄLJ human-only",
  "Supabase writes locked",
  "Trade UI execution locked",
  "API route activation locked",
] as const;

export function buildAvanzaManualLocalDevInvocationApprovalEvidence(
  evidence: AvanzaManualLocalDevInvocationApprovalEvidence,
): AvanzaManualLocalDevInvocationApprovalEvidence {
  const forbidden =
    evidence.forbidden ||
    (evidence.mayContainSensitiveData && evidence.redactionRequired);

  return {
    ...evidence,
    accepted: evidence.accepted && !forbidden,
    allowedToPersist: evidence.allowedToPersist && !forbidden,
    forbidden,
    forbiddenReason: forbidden
      ? evidence.forbiddenReason ??
        "Sensitive or unredacted evidence is rejected by the manual runbook."
      : evidence.forbiddenReason,
  };
}

function statusDetails(
  status: AvanzaManualLocalDevInvocationApprovalRunbookStatus,
) {
  if (status === "approved_for_invocation_adapter_design") {
    return {
      label: "Approved for invocation adapter design only",
      summary:
        "Manual review evidence is complete enough to design a disabled or model-only invocation adapter, but runtime invocation remains forbidden.",
    };
  }
  if (status === "ready_for_manual_review") {
    return {
      label: "Ready for manual review",
      summary:
        "The bridge readiness checkpoint exists and the operator can review evidence before any future design-only adapter task.",
    };
  }
  if (status === "review_incomplete") {
    return {
      label: "Manual review incomplete",
      summary:
        "The runbook exists, but operator, safety, or evidence review is incomplete.",
    };
  }
  if (status === "blocked_missing_checkpoint") {
    return {
      label: "Blocked: missing checkpoint",
      summary:
        "A bridge readiness checkpoint is required before invocation adapter design can be reviewed.",
    };
  }
  if (status === "blocked_missing_evidence") {
    return {
      label: "Blocked: missing evidence review",
      summary: "Evidence review is required before design-only approval.",
    };
  }
  if (status === "blocked_safety_risk") {
    return {
      label: "Blocked: safety risk",
      summary:
        "A runtime action, unsafe evidence item, or invocation request would cross the locked boundary.",
    };
  }
  if (status === "real_run_forbidden") {
    return {
      label: "Real run forbidden",
      summary: "Real Avanza runs remain forbidden by this runbook.",
    };
  }
  if (status === "production_forbidden") {
    return {
      label: "Production readiness forbidden",
      summary: "Production readiness cannot be approved by this runbook.",
    };
  }

  return {
    label: "Unknown manual approval runbook",
    summary: "Unknown inputs are treated as locked.",
  };
}

function item(
  itemId: string,
  status: AvanzaManualLocalDevInvocationApprovalItemStatus,
  label: string,
  purpose: string,
  evidenceKind: AvanzaManualLocalDevInvocationApprovalEvidenceKind,
  required = true,
  evidenceRequired = true,
  passedBy: string[] = [],
  blockedReason?: string,
  warning?: string,
): AvanzaManualLocalDevInvocationApprovalItem {
  return {
    blockedReason,
    evidenceForbidden: status === "forbidden",
    evidenceKind,
    evidenceRequired,
    itemId,
    label,
    passedBy,
    purpose,
    required,
    status,
    warning,
  };
}

function buildEvidence(
  input: AvanzaManualLocalDevInvocationApprovalRunbookInput,
) {
  const evidence = [
    input.bridgeReadinessCheckpoint &&
      buildAvanzaManualLocalDevInvocationApprovalEvidence({
        accepted: true,
        allowedToPersist: true,
        evidenceId: input.bridgeReadinessCheckpoint.checkpointId,
        forbidden: false,
        kind: "bridge_readiness_checkpoint",
        label: "Bridge readiness checkpoint",
        mayContainSensitiveData: false,
        redactionRequired: false,
        safeSummary: "Model-only checkpoint reviewed at invocation boundary.",
      }),
    input.modelOnlyDryRunReport &&
      buildAvanzaManualLocalDevInvocationApprovalEvidence({
        accepted: true,
        allowedToPersist: true,
        evidenceId: input.modelOnlyDryRunReport.dryRunId,
        forbidden: false,
        kind: "model_only_dry_run_report",
        label: "Model-only dry-run report",
        mayContainSensitiveData: false,
        redactionRequired: false,
        safeSummary: "Dry-run report stops before runtime invocation.",
      }),
    input.disabledRunnerReport &&
      buildAvanzaManualLocalDevInvocationApprovalEvidence({
        accepted: true,
        allowedToPersist: true,
        evidenceId: input.disabledRunnerReport.runnerId,
        forbidden: false,
        kind: "disabled_runner_report",
        label: "Disabled runner report",
        mayContainSensitiveData: false,
        redactionRequired: false,
        safeSummary: "Disabled runner skeleton remains report-only.",
      }),
    input.activationChecklist &&
      buildAvanzaManualLocalDevInvocationApprovalEvidence({
        accepted: true,
        allowedToPersist: true,
        evidenceId: input.activationChecklist.checklistId,
        forbidden: false,
        kind: "activation_checklist",
        label: "Activation checklist",
        mayContainSensitiveData: false,
        redactionRequired: false,
        safeSummary: "Checklist approves design review only.",
      }),
    ...(
      input.evidence?.map(
        buildAvanzaManualLocalDevInvocationApprovalEvidence,
      ) ?? []
    ),
  ].filter(Boolean);

  return evidence as AvanzaManualLocalDevInvocationApprovalEvidence[];
}

function buildItems(
  input: AvanzaManualLocalDevInvocationApprovalRunbookInput,
  evidence: AvanzaManualLocalDevInvocationApprovalEvidence[],
): AvanzaManualLocalDevInvocationApprovalItem[] {
  const hasEvidence = (
    kind: AvanzaManualLocalDevInvocationApprovalEvidenceKind,
  ) => evidence.some((entry) => entry.kind === kind && entry.accepted);
  const reviewStatus = (flag?: boolean) => (flag ? "passed" : "pending");
  const checkpointPassed = Boolean(input.bridgeReadinessCheckpoint);
  const boundaryConfirmed =
    input.bridgeReadinessCheckpoint?.invocationBoundary.status ===
    "reached_model_only";

  return [
    item(
      "bridge_readiness_checkpoint_reviewed",
      checkpointPassed ? "passed" : "blocked",
      "Bridge readiness checkpoint reviewed",
      "Confirm the local-dev bridge readiness checkpoint exists.",
      "bridge_readiness_checkpoint",
      true,
      true,
      checkpointPassed ? [input.bridgeReadinessCheckpoint!.checkpointId] : [],
      checkpointPassed ? undefined : "Bridge readiness checkpoint missing.",
    ),
    item(
      "invocation_boundary_stop_confirmed",
      boundaryConfirmed ? "passed" : "blocked",
      "Invocation boundary stop confirmed",
      "Confirm the model-only chain stops at the invocation boundary.",
      "bridge_readiness_checkpoint",
      true,
      true,
      boundaryConfirmed ? ["dry_run_completed_to_invocation_boundary"] : [],
      boundaryConfirmed ? undefined : "Invocation boundary stop not confirmed.",
    ),
    item(
      "model_only_dry_run_report_reviewed",
      hasEvidence("model_only_dry_run_report") ? "passed" : "pending",
      "Model-only dry-run report reviewed",
      "Review the dry-run report without invoking runtime.",
      "model_only_dry_run_report",
      true,
      true,
      input.modelOnlyDryRunReport ? [input.modelOnlyDryRunReport.dryRunId] : [],
    ),
    item(
      "disabled_runner_report_reviewed",
      hasEvidence("disabled_runner_report") ? "passed" : "pending",
      "Disabled runner report reviewed",
      "Review the disabled runner report without calling it.",
      "disabled_runner_report",
      true,
      true,
      input.disabledRunnerReport ? [input.disabledRunnerReport.runnerId] : [],
    ),
    item(
      "activation_checklist_reviewed",
      hasEvidence("activation_checklist") ? "passed" : "pending",
      "Activation checklist reviewed",
      "Review checklist evidence for design-only approval.",
      "activation_checklist",
      true,
      true,
      input.activationChecklist ? [input.activationChecklist.checklistId] : [],
    ),
    item(
      "operator_review_completed",
      reviewStatus(input.operatorReviewed),
      "Operator review completed",
      "Human/operator review is required before design-only approval.",
      "operator_attestation",
      true,
      true,
      input.operatorReviewed ? ["operatorReviewed"] : [],
    ),
    item(
      "safety_review_completed",
      reviewStatus(input.safetyReviewed),
      "Safety review completed",
      "Safety review is required before design-only approval.",
      "safety_review_note",
      true,
      true,
      input.safetyReviewed ? ["safetyReviewed"] : [],
    ),
    item(
      "evidence_review_completed",
      reviewStatus(input.evidenceReviewed),
      "Evidence review completed",
      "Evidence must be accepted and redacted before design-only approval.",
      "redacted_log",
      true,
      true,
      input.evidenceReviewed ? ["evidenceReviewed"] : [],
    ),
    ...lockedRuntimeActions.map((labelText) =>
      item(
        labelText
          .toLowerCase()
          .replaceAll("/", "_")
          .replaceAll(" ", "_")
          .replaceAll("ö", "o")
          .replaceAll("ä", "a")
          .replaceAll("å", "a"),
        "passed",
        labelText,
        "Confirm this runtime path remains locked or forbidden.",
        "none",
        true,
        false,
        ["hard_safety_flag"],
      ),
    ),
    item(
      "ui_simplicity_protected",
      "passed",
      "UI simplicity protected",
      "Ture UI remains minimal and visually simple.",
      "none",
      true,
      false,
      ["route_fixture_only"],
    ),
    item(
      "production_readiness_blocked",
      "passed",
      "Production readiness blocked",
      "This runbook cannot approve production readiness.",
      "none",
      true,
      false,
      ["hard_safety_flag"],
    ),
  ];
}

function buildApprovalGates(
  status: AvanzaManualLocalDevInvocationApprovalRunbookStatus,
) {
  const designAllowed = status === "approved_for_invocation_adapter_design";

  return [
    {
      currentlyAllows: designAllowed
        ? ["disabled/model-only invocation adapter design"]
        : ["manual review only"],
      currentlyBlocks: [
        "runtime invocation",
        "smoke runner invocation",
        "terminal script invocation",
        "browser automation",
        "API route call",
        "credential access",
        "order submission",
      ],
      forbiddenActions: [...forbiddenNextSteps],
      gateId: "manual_invocation_adapter_design_gate",
      label: "Manual invocation adapter design gate",
      purpose:
        "Separates human review evidence from any future design-only adapter task.",
      status: designAllowed ? "approved_for_design_only" : "review_required",
      unlockRequires: [
        "operatorReviewed true",
        "safetyReviewed true",
        "evidenceReviewed true",
        "invocationAdapterDesignRequested true",
        "runtimeInvocationRequested false",
        "realRunRequested false",
        "productionReadinessRequested false",
      ],
    },
    {
      currentlyAllows: ["model-only reporting"],
      currentlyBlocks: ["crossing invocation boundary"],
      forbiddenActions: [...forbiddenNextSteps],
      gateId: "runtime_invocation_gate",
      label: "Runtime invocation gate",
      purpose: "Keeps smoke runners, scripts, browser automation, and APIs locked.",
      status: "forbidden",
      unlockRequires: ["separate future approval task"],
    },
  ] satisfies AvanzaManualLocalDevInvocationApprovalGate[];
}

function hasForbiddenEvidence(
  evidence: AvanzaManualLocalDevInvocationApprovalEvidence[],
) {
  return evidence.some((entry) => entry.forbidden || entry.mayContainSensitiveData);
}

function baseSafetyFlags(
  canApproveInvocationAdapterDesign: boolean,
): AvanzaManualLocalDevInvocationApprovalSafetyFlags {
  return {
    approvalModelOnly: true,
    canAccessCredentials: false,
    canAutomateBankId: false,
    canApproveInvocationAdapterDesign,
    canCallApiRoute: false,
    canClaimProductionReady: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canCrossInvocationBoundaryNow: false,
    canExportSession: false,
    canFetch: false,
    canInvokeSmokeRunnerNow: false,
    canOpenLocalDevBridgeGate: false,
    canPoll: false,
    canPrepareOrderNow: false,
    canReadCookies: false,
    canRunSmokeTestFromUi: false,
    canRunTerminalScriptNow: false,
    canStartHandoff: false,
    canSubmitOrder: false,
    canUseBrowserAutomationNow: false,
    canWriteSupabase: false,
    controlsEnabled: false,
    finalHumanClickRequired: true,
    gateLocked: true,
    headlessOnly: true,
    runbookOnly: true,
    userMustConfirm: true,
    visibleInUi: false,
  };
}

function approvalLevel(
  status: AvanzaManualLocalDevInvocationApprovalRunbookStatus,
  modelOnlyAdapterDesignRequested?: boolean,
): AvanzaManualLocalDevInvocationApprovalLevel {
  if (status === "real_run_forbidden") return "real_run_forbidden";
  if (status === "blocked_safety_risk") return "runtime_invocation_forbidden";
  if (status !== "approved_for_invocation_adapter_design") return "review_only";

  return modelOnlyAdapterDesignRequested
    ? "approved_for_model_only_invocation_adapter_design"
    : "approved_for_disabled_invocation_adapter_design";
}

export function buildAvanzaManualLocalDevInvocationApprovalRunbook(
  input: AvanzaManualLocalDevInvocationApprovalRunbookInput = {},
): AvanzaManualLocalDevInvocationApprovalRunbook {
  const runbookId =
    input.runbookId ?? "avanza-manual-local-dev-invocation-approval-runbook";
  const createdAt = input.now ?? defaultCreatedAt;
  const evidence = buildEvidence(input);
  const blockedReasons: string[] = [];
  const warnings: string[] = [];

  let status: AvanzaManualLocalDevInvocationApprovalRunbookStatus =
    "ready_for_manual_review";

  if (input.productionReadinessRequested) {
    status = "production_forbidden";
    blockedReasons.push("Production readiness remains forbidden.");
  } else if (input.realRunRequested) {
    status = "real_run_forbidden";
    blockedReasons.push("Real Avanza run remains forbidden.");
  } else if (input.runtimeInvocationRequested) {
    status = "blocked_safety_risk";
    blockedReasons.push("Runtime invocation requested while gate is locked.");
  } else if (!input.bridgeReadinessCheckpoint) {
    status = "blocked_missing_checkpoint";
    blockedReasons.push("Bridge readiness checkpoint is required.");
  } else if (hasForbiddenEvidence(evidence)) {
    status = "blocked_safety_risk";
    blockedReasons.push("Sensitive or unredacted evidence was rejected.");
  } else if (
    input.invocationAdapterDesignRequested &&
    (!input.operatorReviewed || !input.safetyReviewed || !input.evidenceReviewed)
  ) {
    status = input.evidenceReviewed ? "review_incomplete" : "blocked_missing_evidence";
    blockedReasons.push(
      "Operator, safety, and evidence review are all required before design-only approval.",
    );
  } else if (
    input.invocationAdapterDesignRequested &&
    input.operatorReviewed &&
    input.safetyReviewed &&
    input.evidenceReviewed
  ) {
    status = "approved_for_invocation_adapter_design";
    warnings.push("Approval is for design only, not runtime invocation.");
  } else if (
    input.operatorReviewed ||
    input.safetyReviewed ||
    input.evidenceReviewed
  ) {
    status = "review_incomplete";
    blockedReasons.push("Manual review is not complete.");
  }

  const details = statusDetails(status);
  const canApproveInvocationAdapterDesign =
    status === "approved_for_invocation_adapter_design";
  const level = approvalLevel(status, input.modelOnlyAdapterDesignRequested);
  const approvedNextDesignStep = canApproveInvocationAdapterDesign
    ? input.modelOnlyAdapterDesignRequested
      ? "model_only_invocation_adapter_design"
      : "disabled_invocation_adapter_design"
    : "manual_review_required";

  return {
    approvalGates: buildApprovalGates(status),
    approvalLevel: level,
    approvedNextDesignStep,
    blockedReasons,
    createdAt,
    evidence,
    explicitlyForbiddenNextSteps: [...forbiddenNextSteps],
    items: buildItems(input, evidence),
    label: details.label,
    runbookId,
    safetyFlags: baseSafetyFlags(canApproveInvocationAdapterDesign),
    status,
    summary: details.summary,
    warnings,
  };
}
