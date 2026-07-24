export type AvanzaLocalDevExecutionRunbookStatus =
  | "disabled"
  | "runbook_ready"
  | "waiting_for_login_smoke"
  | "waiting_for_order_smoke"
  | "waiting_for_operator_confirmation"
  | "blocked"
  | "forbidden"
  | "unknown";

export type AvanzaLocalDevExecutionRunbookStepType =
  | "review_safety_boundaries"
  | "verify_local_environment"
  | "verify_credentials_configured"
  | "run_login_smoke_model_or_dry_run"
  | "optional_run_login_real_smoke"
  | "review_login_result"
  | "run_order_chain_model_or_dry_run"
  | "optional_prepare_order_chain_real_smoke"
  | "verify_review_ready_stop"
  | "confirm_no_final_click"
  | "document_findings"
  | "stop";

export type AvanzaLocalDevExecutionRunbookArea =
  | "login"
  | "order_prep"
  | "settlement"
  | "safety"
  | "operator"
  | "unknown";

export type AvanzaLocalDevExecutionRunbookSafetyFlags = {
  runbookOnly: true;
  canExecuteLoginSmoke: false;
  canExecuteOrderSmoke: false;
  canWireTradeUi: false;
  canWireApiRoute: false;
  canNavigateFromAppRuntime: false;
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

export type AvanzaLocalDevExecutionRunbookStep = {
  stepId: string;
  type: AvanzaLocalDevExecutionRunbookStepType;
  area: AvanzaLocalDevExecutionRunbookArea;
  label: string;
  reason: string;
  commandReference?: string;
  requiresManualConfirmation: boolean;
  optional: boolean;
  executableInThisTask: false;
  forbidden: boolean;
  expectedOutcome: string;
  stopCondition: string;
};

export type AvanzaLocalDevExecutionRunbook = {
  runbookId: string;
  createdAt: string;
  status: AvanzaLocalDevExecutionRunbookStatus;
  label: string;
  summary: string;
  steps: AvanzaLocalDevExecutionRunbookStep[];
  prerequisites: string[];
  forbiddenActions: string[];
  allowedLocalDevActions: string[];
  operatorChecklist: string[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaLocalDevExecutionRunbookSafetyFlags;
};

export type AvanzaLocalDevExecutionRunbookInput = {
  runbookId?: string;
  now?: string;
  enabled?: boolean;
  isCi?: boolean;
  isLocalDev?: boolean;
  explicitEnvGatesReady?: boolean;
  credentialsConfigured?: boolean;
  operatorConfirmed?: boolean;
  loginSmokeReviewed?: boolean;
  orderSmokeReviewed?: boolean;
  statusOverride?: AvanzaLocalDevExecutionRunbookStatus;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";

export const avanzaLocalDevExecutionRunbookSafetyFlags:
  AvanzaLocalDevExecutionRunbookSafetyFlags = {
    runbookOnly: true,
    canExecuteLoginSmoke: false,
    canExecuteOrderSmoke: false,
    canWireTradeUi: false,
    canWireApiRoute: false,
    canNavigateFromAppRuntime: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canSubmitOrder: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canWriteSupabase: false,
    canClaimProductionReady: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  return text ? text : undefined;
}

function safeTextArray(values: unknown) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function step(
  type: AvanzaLocalDevExecutionRunbookStepType,
  area: AvanzaLocalDevExecutionRunbookArea,
  label: string,
  reason: string,
  expectedOutcome: string,
  stopCondition: string,
  options: {
    commandReference?: string;
    requiresManualConfirmation?: boolean;
    optional?: boolean;
    forbidden?: boolean;
  } = {},
): AvanzaLocalDevExecutionRunbookStep {
  return {
    stepId: type,
    type,
    area,
    label,
    reason,
    commandReference: options.commandReference,
    requiresManualConfirmation: options.requiresManualConfirmation === true,
    optional: options.optional === true,
    executableInThisTask: false,
    forbidden: options.forbidden === true,
    expectedOutcome,
    stopCondition,
  };
}

function buildSteps(): AvanzaLocalDevExecutionRunbookStep[] {
  return [
    step(
      "review_safety_boundaries",
      "safety",
      "Review safety boundaries",
      "The operator starts by confirming the runbook is guidance only.",
      "No real execution in this task is permitted.",
      "Stop if any boundary would be weakened.",
      { requiresManualConfirmation: true },
    ),
    step(
      "verify_local_environment",
      "operator",
      "Verify local environment",
      "The sequence is only for local development and must remain blocked in CI.",
      "Local dev context and explicit gates are understood.",
      "Stop if CI or shared runtime is detected.",
    ),
    step(
      "verify_credentials_configured",
      "login",
      "Verify Avanza Settings profile and credential readiness",
      "Credentials must be configured through the secure provider path before any separate real smoke is considered.",
      "Credential readiness is confirmed without exposing secret material.",
      "Stop if credentials are missing, logged, exported, or stored in app state.",
    ),
    step(
      "run_login_smoke_model_or_dry_run",
      "login",
      "Run login model or dry-run",
      "The safe login layer can be inspected without a real page or session export.",
      "Login feasibility is summarized at model or dry-run level.",
      "Stop before any app-runtime navigation or session handling.",
      { commandReference: "login smoke model/dry-run reference" },
    ),
    step(
      "optional_run_login_real_smoke",
      "login",
      "Optional local login real smoke only with gates",
      "A separate terminal-only login smoke may be considered only after explicit approval and local gates.",
      "If separately approved, the result stops at login detection.",
      "Stop before cookies, session export, BankID automation, or app wiring.",
      {
        commandReference: "terminal-only login smoke reference",
        requiresManualConfirmation: true,
        optional: true,
      },
    ),
    step(
      "review_login_result",
      "login",
      "Review login result",
      "The operator reviews whether login readiness is sufficient for order-prep planning.",
      "Result is documented without credential or session material.",
      "Stop if login requires BankID automation or unsafe credential handling.",
      { requiresManualConfirmation: true },
    ),
    step(
      "run_order_chain_model_or_dry_run",
      "order_prep",
      "Run order chain model or dry-run",
      "Order-prep smoke remains model or dry-run unless a separate real path is approved.",
      "Search, instrument handoff, and order field readiness are summarized.",
      "Stop before any real final action.",
      { commandReference: "order chain model/dry-run reference" },
    ),
    step(
      "optional_prepare_order_chain_real_smoke",
      "order_prep",
      "Optional prepare-only real order chain smoke",
      "A real order-prep smoke is a future separately approved path and no terminal script is added here.",
      "If separately approved later, the maximum endpoint is review-ready.",
      "Stop before final KÖP/SÄLJ, order submission, or confirmation capture.",
      {
        commandReference: "future prepare-only order chain reference",
        requiresManualConfirmation: true,
        optional: true,
      },
    ),
    step(
      "verify_review_ready_stop",
      "order_prep",
      "Verify review-ready stop",
      "Review-ready is the maximum allowed order-prep endpoint.",
      "The order-prep chain stops with final human action required.",
      "Stop if any automated final action appears.",
      { requiresManualConfirmation: true },
    ),
    step(
      "confirm_no_final_click",
      "safety",
      "Confirm no final KÖP/SÄLJ click",
      "The final buy or sell action remains human-only and outside this system.",
      "No final click is performed, modeled as allowed, or captured.",
      "Stop immediately if final action automation is requested.",
      { requiresManualConfirmation: true, forbidden: true },
    ),
    step(
      "document_findings",
      "operator",
      "Document findings",
      "The operator records local observations without secrets, sessions, or execution records.",
      "Findings are written as local notes or docs only.",
      "Stop before any Supabase execution write.",
    ),
    step(
      "stop",
      "operator",
      "Stop",
      "The runbook ends before order submission, final click, or production readiness.",
      "No active execution path has been added.",
      "Stop here unless a new approval gate is opened.",
      { requiresManualConfirmation: true },
    ),
  ];
}

function deriveStatus(
  input: Required<Pick<
    AvanzaLocalDevExecutionRunbookInput,
    | "enabled"
    | "isCi"
    | "isLocalDev"
    | "explicitEnvGatesReady"
    | "credentialsConfigured"
    | "operatorConfirmed"
    | "loginSmokeReviewed"
    | "orderSmokeReviewed"
  >> & { statusOverride?: AvanzaLocalDevExecutionRunbookStatus },
): AvanzaLocalDevExecutionRunbookStatus {
  if (input.statusOverride) return input.statusOverride;
  if (!input.enabled) return "disabled";
  if (input.isCi || !input.isLocalDev) return "blocked";
  if (!input.explicitEnvGatesReady || !input.credentialsConfigured) {
    return "blocked";
  }
  if (!input.operatorConfirmed) return "waiting_for_operator_confirmation";
  if (!input.loginSmokeReviewed) return "waiting_for_login_smoke";
  if (!input.orderSmokeReviewed) return "waiting_for_order_smoke";

  return "runbook_ready";
}

function labelForStatus(status: AvanzaLocalDevExecutionRunbookStatus) {
  switch (status) {
    case "runbook_ready":
      return "Local-dev execution runbook ready";
    case "waiting_for_login_smoke":
      return "Waiting for login smoke review";
    case "waiting_for_order_smoke":
      return "Waiting for order-prep smoke review";
    case "waiting_for_operator_confirmation":
      return "Waiting for operator confirmation";
    case "blocked":
      return "Local-dev execution runbook blocked";
    case "forbidden":
      return "Local-dev execution runbook forbidden";
    case "unknown":
      return "Local-dev execution runbook unknown";
    case "disabled":
    default:
      return "Local-dev execution runbook disabled";
  }
}

export function buildAvanzaLocalDevExecutionRunbook(
  input: AvanzaLocalDevExecutionRunbookInput = {},
): AvanzaLocalDevExecutionRunbook {
  const normalized = {
    enabled: input.enabled === true,
    isCi: input.isCi === true,
    isLocalDev: input.isLocalDev === true,
    explicitEnvGatesReady: input.explicitEnvGatesReady === true,
    credentialsConfigured: input.credentialsConfigured === true,
    operatorConfirmed: input.operatorConfirmed === true,
    loginSmokeReviewed: input.loginSmokeReviewed === true,
    orderSmokeReviewed: input.orderSmokeReviewed === true,
    statusOverride: input.statusOverride,
  };
  const status = deriveStatus(normalized);
  const blockedReasons = [
    ...safeTextArray(input.blockedReasons),
    ...(normalized.enabled ? [] : ["Runbook input is disabled."]),
    ...(normalized.isCi ? ["CI is blocked for this runbook."] : []),
    ...(normalized.isLocalDev ? [] : ["Local-dev environment is not confirmed."]),
    ...(normalized.explicitEnvGatesReady
      ? []
      : ["Explicit local-dev gates are not confirmed."]),
    ...(normalized.credentialsConfigured
      ? []
      : ["Credential readiness is not confirmed."]),
  ];

  return {
    runbookId:
      safeText(input.runbookId) ?? "avanza-local-dev-execution-runbook",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    status,
    label: labelForStatus(status),
    summary:
      "Fixture/model-only operator runbook for login plus order-prep smoke tests. It documents sequence and safety gates without adding real execution.",
    steps: buildSteps(),
    prerequisites: [
      "Local dev environment only.",
      "CI blocked.",
      "Explicit env gates reviewed outside this task.",
      "Manual operator confirmation required.",
      "Avanza credentials configured via secure provider only.",
      "BankID path avoided for automation.",
      "No Trade UI wiring.",
      "No API route wiring.",
    ],
    forbiddenActions: [
      "No final KÖP/SÄLJ click.",
      "No order submission.",
      "No cookies/session export.",
      "No BankID automation.",
      "No credential logging or exposure.",
      "No Supabase writes.",
      "No production readiness claim.",
    ],
    allowedLocalDevActions: [
      "Review safety boundaries.",
      "Inspect login model or dry-run output.",
      "Inspect order chain model or dry-run output.",
      "Optionally plan a separately approved terminal-only login smoke.",
      "Document findings without secret or session material.",
    ],
    operatorChecklist: [
      "Confirm this is runbook-only guidance.",
      "Confirm local dev context and CI block.",
      "Confirm secure credential provider readiness.",
      "Review login smoke result before order-prep smoke.",
      "Review order-prep smoke result at review-ready stop only.",
      "Confirm no final KÖP/SÄLJ click.",
      "Confirm no order submission.",
      "Record findings and stop.",
    ],
    warnings: [
      ...safeTextArray(input.warnings),
      "Order terminal smoke script is intentionally not added yet.",
      "Review-ready is the maximum order-prep endpoint.",
      "Settlement reconciliation is a separate post-trade path.",
      "Not production ready.",
    ],
    blockedReasons:
      status === "blocked" || status === "disabled" ? blockedReasons : [],
    safetyFlags: avanzaLocalDevExecutionRunbookSafetyFlags,
  };
}
