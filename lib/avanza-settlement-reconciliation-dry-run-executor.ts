import type {
  AvanzaSettlementNoteActionContract,
} from "./avanza-settlement-note-action-contract";
import type {
  AvanzaSettlementExtractionSchemaResult,
} from "./avanza-settlement-note-extraction-schema";
import type {
  AvanzaSettlementNoteRouteContract,
  AvanzaSettlementTradeReference,
} from "./avanza-settlement-note-route-contract";
import type {
  AvanzaSettlementReconciliationPreview,
} from "./avanza-settlement-reconciliation-mapping";

export type AvanzaSettlementReconciliationDryRunStatus =
  | "disabled"
  | "dry_run_ready"
  | "dry_run_passed"
  | "dry_run_blocked"
  | "dry_run_waiting_for_route"
  | "dry_run_waiting_for_action_contract"
  | "dry_run_waiting_for_extraction_schema"
  | "dry_run_waiting_for_mapping"
  | "dry_run_manual_review_required"
  | "dry_run_error"
  | "unknown";

export type AvanzaSettlementReconciliationDryRunStepStatus =
  | "planned"
  | "simulated"
  | "skipped"
  | "blocked"
  | "blocked_route"
  | "blocked_action_contract"
  | "blocked_extraction_schema"
  | "blocked_mapping"
  | "manual_review_required"
  | "error";

export type AvanzaSettlementReconciliationDryRunMode =
  | "disabled"
  | "settlement_dry_run_model"
  | "local_dev_dry_run";

export type AvanzaSettlementReconciliationDryRunStepType =
  | "validate_trade_reference"
  | "validate_settlement_route"
  | "validate_settlement_actions"
  | "validate_extraction_schema"
  | "validate_reconciliation_mapping"
  | "simulate_manual_review_gate"
  | "stop_before_reconciliation_write";

export type AvanzaSettlementReconciliationDryRunValueSource =
  | "none"
  | "trade_reference"
  | "settlement_route"
  | "settlement_action_contract"
  | "extraction_schema"
  | "reconciliation_mapping"
  | "user_review";

export type AvanzaSettlementReconciliationDryRunSafetyFlags = {
  dryRunEnabled: boolean;
  canDryRun: boolean;
  canExecuteSettlementRoute: false;
  canExecuteSettlementActions: false;
  canNavigateToTransactions: false;
  canOpenSettlementNote: false;
  canReadSettlementDocument: false;
  canDownloadPdf: false;
  canUseOcr: false;
  canExtractValues: false;
  canBuildReconciliationPreview: boolean;
  canApplyReconciliation: false;
  canWriteExecutionRecord: false;
  canWriteTradeResult: false;
  canWriteStatistics: false;
  canWriteAuditMetadata: false;
  canWriteSupabase: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  requiresManualReview: true;
  userMustConfirm: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaSettlementReconciliationDryRunStepReport = {
  stepId: string;
  stepType: AvanzaSettlementReconciliationDryRunStepType;
  label: string;
  dryRunStatus: AvanzaSettlementReconciliationDryRunStepStatus;
  wouldTargetSignalText?: string;
  wouldUseValueSource: AvanzaSettlementReconciliationDryRunValueSource;
  safeDisplayValue?: string;
  executableNow: false;
  realBrowserAction: false;
  writesInThisTask: false;
  expectedResult: string;
  blockedReason?: string;
};

export type AvanzaSettlementReconciliationDryRunReport =
  AvanzaSettlementReconciliationDryRunSafetyFlags & {
    dryRunId: string;
    createdAt: string;
    mode: AvanzaSettlementReconciliationDryRunMode;
    status: AvanzaSettlementReconciliationDryRunStatus;
    label: string;
    reason: string;
    side: "buy" | "sell" | "unknown";
    ticker: string;
    instrumentName?: string;
    quantity?: number;
    estimatedTradeDate?: string;
    expectedSettlementDate?: string;
    settlementRouteReady: boolean;
    settlementActionPlanReady: boolean;
    extractionSchemaReady: boolean;
    reconciliationPreviewReady: boolean;
    manualReviewRequired: true;
    expectedExtractionTargets: string[];
    expectedReconciliationTargets: string[];
    stepReports: AvanzaSettlementReconciliationDryRunStepReport[];
    nextExpectedState: string;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaSettlementReconciliationDryRunSafetyFlags;
  };

export type AvanzaSettlementReconciliationDryRunReportInput = {
  mode?: AvanzaSettlementReconciliationDryRunMode;
  dryRunEnabled?: boolean;
  tradeReference?: unknown;
  settlementNoteRouteContract?: unknown;
  settlementNoteActionContract?: unknown;
  extractionSchemaResult?: unknown;
  reconciliationPreview?: unknown;
  now?: string;
  dryRunId?: string;
  forceError?: boolean;
  forceUnknown?: boolean;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|account\s*number|accountnumber|bankid|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token|order\s*id|orderid/i;

const expectedExtractionTargets = [
  "courtage",
  "fxRate / växelkurs",
  "settlementAmount / likvidbelopp",
  "quantity",
  "executionPrice",
  "tradeDate",
  "settlementDate",
  "currency",
] as const;

const expectedReconciliationTargets = [
  "execution_record",
  "trade_result",
  "statistics",
  "audit_metadata",
] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function safeStringArray(values: unknown) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function isTradeReference(value: unknown): value is AvanzaSettlementTradeReference {
  return isPlainObject(value) && typeof value.side === "string";
}

function isRouteContract(
  value: unknown,
): value is AvanzaSettlementNoteRouteContract {
  return (
    isPlainObject(value) &&
    typeof value.routeContractId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.steps)
  );
}

function isActionContract(
  value: unknown,
): value is AvanzaSettlementNoteActionContract {
  return (
    isPlainObject(value) &&
    typeof value.contractId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.actions)
  );
}

function isExtractionSchema(
  value: unknown,
): value is AvanzaSettlementExtractionSchemaResult {
  return (
    isPlainObject(value) &&
    typeof value.schemaId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.extractionTargets)
  );
}

function isReconciliationPreview(
  value: unknown,
): value is AvanzaSettlementReconciliationPreview {
  return (
    isPlainObject(value) &&
    typeof value.previewId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.fields)
  );
}

function sideFrom(value: unknown): "buy" | "sell" | "unknown" {
  if (!isPlainObject(value)) return "unknown";
  return value.side === "buy" ? "buy" : value.side === "sell" ? "sell" : "unknown";
}

function statusLabel(status: AvanzaSettlementReconciliationDryRunStatus) {
  switch (status) {
    case "disabled":
      return "Settlement reconciliation dry-run disabled";
    case "dry_run_ready":
      return "Settlement reconciliation dry-run ready";
    case "dry_run_passed":
      return "Settlement reconciliation dry-run passed";
    case "dry_run_blocked":
      return "Settlement reconciliation dry-run blocked";
    case "dry_run_waiting_for_route":
      return "Settlement reconciliation dry-run waiting for route";
    case "dry_run_waiting_for_action_contract":
      return "Settlement reconciliation dry-run waiting for action contract";
    case "dry_run_waiting_for_extraction_schema":
      return "Settlement reconciliation dry-run waiting for extraction schema";
    case "dry_run_waiting_for_mapping":
      return "Settlement reconciliation dry-run waiting for mapping";
    case "dry_run_manual_review_required":
      return "Settlement reconciliation dry-run manual review required";
    case "dry_run_error":
      return "Settlement reconciliation dry-run error";
    case "unknown":
      return "Settlement reconciliation dry-run unknown";
  }
}

function buildSafetyFlags(options: {
  dryRunEnabled: boolean;
  canDryRun?: boolean;
  canBuildReconciliationPreview?: boolean;
}): AvanzaSettlementReconciliationDryRunSafetyFlags {
  return {
    dryRunEnabled: options.dryRunEnabled,
    canDryRun: options.canDryRun === true,
    canExecuteSettlementRoute: false,
    canExecuteSettlementActions: false,
    canNavigateToTransactions: false,
    canOpenSettlementNote: false,
    canReadSettlementDocument: false,
    canDownloadPdf: false,
    canUseOcr: false,
    canExtractValues: false,
    canBuildReconciliationPreview:
      options.canBuildReconciliationPreview === true,
    canApplyReconciliation: false,
    canWriteExecutionRecord: false,
    canWriteTradeResult: false,
    canWriteStatistics: false,
    canWriteAuditMetadata: false,
    canWriteSupabase: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    requiresManualReview: true,
    userMustConfirm: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function step(
  stepId: string,
  stepType: AvanzaSettlementReconciliationDryRunStepType,
  label: string,
  dryRunStatus: AvanzaSettlementReconciliationDryRunStepStatus,
  expectedResult: string,
  options: {
    wouldTargetSignalText?: string;
    wouldUseValueSource?: AvanzaSettlementReconciliationDryRunValueSource;
    safeDisplayValue?: string;
    blockedReason?: string;
  } = {},
): AvanzaSettlementReconciliationDryRunStepReport {
  return {
    stepId,
    stepType,
    label,
    dryRunStatus,
    wouldTargetSignalText: options.wouldTargetSignalText,
    wouldUseValueSource: options.wouldUseValueSource ?? "none",
    safeDisplayValue: options.safeDisplayValue,
    executableNow: false,
    realBrowserAction: false,
    writesInThisTask: false,
    expectedResult,
    blockedReason: options.blockedReason,
  };
}

function skippedSteps(startAfter: AvanzaSettlementReconciliationDryRunStepType) {
  const allSteps: Array<[
    AvanzaSettlementReconciliationDryRunStepType,
    string,
    AvanzaSettlementReconciliationDryRunValueSource,
  ]> = [
    ["validate_settlement_route", "Validate settlement route", "settlement_route"],
    [
      "validate_settlement_actions",
      "Validate settlement actions",
      "settlement_action_contract",
    ],
    [
      "validate_extraction_schema",
      "Validate extraction schema",
      "extraction_schema",
    ],
    [
      "validate_reconciliation_mapping",
      "Validate reconciliation mapping",
      "reconciliation_mapping",
    ],
    ["simulate_manual_review_gate", "Simulate manual review gate", "user_review"],
    [
      "stop_before_reconciliation_write",
      "Stop before reconciliation write",
      "reconciliation_mapping",
    ],
  ];
  const startIndex = allSteps.findIndex(([stepType]) => stepType === startAfter);

  return allSteps.slice(Math.max(startIndex + 1, 0)).map(([stepType, label, source]) =>
    step(
      `skipped_${stepType}`,
      stepType,
      label,
      "skipped",
      "Skipped because an earlier dry-run requirement is not ready.",
      { wouldUseValueSource: source },
    ),
  );
}

function baseReport(
  input: AvanzaSettlementReconciliationDryRunReportInput,
  status: AvanzaSettlementReconciliationDryRunStatus,
  reason: string,
  options: {
    tradeReference?: AvanzaSettlementTradeReference;
    route?: AvanzaSettlementNoteRouteContract;
    action?: AvanzaSettlementNoteActionContract;
    schema?: AvanzaSettlementExtractionSchemaResult;
    preview?: AvanzaSettlementReconciliationPreview;
    stepReports?: AvanzaSettlementReconciliationDryRunStepReport[];
    warnings?: string[];
    blockedReasons?: string[];
    canDryRun?: boolean;
    canBuildReconciliationPreview?: boolean;
    nextExpectedState?: string;
  } = {},
): AvanzaSettlementReconciliationDryRunReport {
  const safetyFlags = buildSafetyFlags({
    dryRunEnabled: input.dryRunEnabled === true,
    canDryRun: options.canDryRun,
    canBuildReconciliationPreview: options.canBuildReconciliationPreview,
  });
  const source = options.tradeReference ?? options.route ?? options.schema ?? options.preview;

  return {
    ...safetyFlags,
    dryRunId: safeText(input.dryRunId) ?? "avanza-settlement-reconciliation-dry-run",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode: input.mode ?? "disabled",
    status,
    label: statusLabel(status),
    reason,
    side: sideFrom(source),
    ticker:
      safeText(options.tradeReference?.ticker) ??
      safeText(options.route?.ticker) ??
      safeText(options.schema?.ticker) ??
      safeText(options.preview?.ticker) ??
      "missing",
    instrumentName:
      safeText(options.tradeReference?.instrumentName) ??
      safeText(options.route?.instrumentName) ??
      safeText(options.schema?.instrumentName),
    quantity:
      safeNumber(options.tradeReference?.quantity) ??
      safeNumber(options.route?.quantity),
    estimatedTradeDate:
      safeText(options.tradeReference?.estimatedTradeDate) ??
      safeText(options.route?.estimatedTradeDate),
    expectedSettlementDate:
      safeText(options.tradeReference?.expectedSettlementDate) ??
      safeText(options.route?.expectedSettlementDate),
    settlementRouteReady: options.route?.status === "settlement_note_ready",
    settlementActionPlanReady: options.action?.status === "action_plan_ready",
    extractionSchemaReady:
      options.schema?.status === "extraction_target_ready" ||
      options.schema?.status === "mapped_for_reconciliation",
    reconciliationPreviewReady:
      options.preview?.status === "mapping_ready" ||
      options.preview?.status === "reconciliation_preview_ready",
    manualReviewRequired: true,
    expectedExtractionTargets: [...expectedExtractionTargets],
    expectedReconciliationTargets: [...expectedReconciliationTargets],
    stepReports: options.stepReports ?? [
      step(
        "disabled",
        "validate_trade_reference",
        "No settlement reconciliation dry-run",
        status === "disabled" ? "skipped" : "blocked",
        reason,
        { blockedReason: options.blockedReasons?.[0] },
      ),
    ],
    nextExpectedState:
      options.nextExpectedState ??
      "Keep settlement reconciliation dry-run fixture/model only.",
    warnings: [
      ...safeStringArray(options.route?.warnings),
      ...safeStringArray(options.action?.warnings),
      ...safeStringArray(options.schema?.warnings),
      ...safeStringArray(options.preview?.warnings),
      ...(options.warnings ?? []),
    ],
    blockedReasons: [
      ...safeStringArray(options.route?.blockedReasons),
      ...safeStringArray(options.action?.blockedReasons),
      ...safeStringArray(options.schema?.blockedReasons),
      ...safeStringArray(options.preview?.blockedReasons),
      ...(options.blockedReasons ?? []),
    ],
    safetyFlags,
  };
}

function completeStepReports(input: {
  tradeReference: AvanzaSettlementTradeReference;
  route: AvanzaSettlementNoteRouteContract;
  action: AvanzaSettlementNoteActionContract;
  schema: AvanzaSettlementExtractionSchemaResult;
  preview: AvanzaSettlementReconciliationPreview;
}) {
  return [
    step(
      "validate_trade_reference",
      "validate_trade_reference",
      "Validate executed trade reference",
      "simulated",
      "Executed trade reference is present for dry-run only.",
      {
        wouldUseValueSource: "trade_reference",
        safeDisplayValue: safeText(input.tradeReference.ticker),
      },
    ),
    step(
      "validate_settlement_route",
      "validate_settlement_route",
      "Validate settlement note route",
      "simulated",
      "Settlement note route contract is coherent, but not executable.",
      {
        wouldUseValueSource: "settlement_route",
        wouldTargetSignalText: "Transaktioner",
        safeDisplayValue: input.route.status,
      },
    ),
    step(
      "validate_settlement_actions",
      "validate_settlement_actions",
      "Validate settlement note action contract",
      "simulated",
      "Settlement action contract is coherent, but actions are not executable.",
      {
        wouldUseValueSource: "settlement_action_contract",
        wouldTargetSignalText: "Avräkningsnota",
        safeDisplayValue: input.action.status,
      },
    ),
    step(
      "validate_extraction_schema",
      "validate_extraction_schema",
      "Validate extraction schema",
      "simulated",
      "Courtage, FX/växelkurs, settlement amount, dates, quantity, price, and currency targets are modeled only.",
      {
        wouldUseValueSource: "extraction_schema",
        safeDisplayValue: input.schema.status,
      },
    ),
    step(
      "validate_reconciliation_mapping",
      "validate_reconciliation_mapping",
      "Validate reconciliation mapping",
      "simulated",
      "Execution record, trade result, statistics, and audit metadata targets are modeled only.",
      {
        wouldUseValueSource: "reconciliation_mapping",
        safeDisplayValue: input.preview.status,
      },
    ),
    step(
      "simulate_manual_review_gate",
      "simulate_manual_review_gate",
      "Simulate manual review gate",
      "manual_review_required",
      "Manual review remains required before any future reconciliation.",
      {
        wouldUseValueSource: "user_review",
        safeDisplayValue: "manualReviewRequired=true",
      },
    ),
    step(
      "stop_before_reconciliation_write",
      "stop_before_reconciliation_write",
      "Stop before reconciliation write",
      "manual_review_required",
      "Dry-run stops before any reconciliation write or Supabase write.",
      {
        wouldUseValueSource: "reconciliation_mapping",
        safeDisplayValue: "writesInThisTask=false",
      },
    ),
  ];
}

export function buildAvanzaSettlementReconciliationDryRunReport(
  input: AvanzaSettlementReconciliationDryRunReportInput = {},
): AvanzaSettlementReconciliationDryRunReport {
  if (input.forceError === true) {
    return baseReport(input, "dry_run_error", "Settlement dry-run error.", {
      blockedReasons: ["Forced error fixture."],
    });
  }

  if (input.forceUnknown === true) {
    return baseReport(input, "unknown", "Settlement dry-run status unknown.", {
      blockedReasons: ["Forced unknown fixture."],
    });
  }

  if (input.dryRunEnabled !== true || input.mode === "disabled") {
    return baseReport(
      input,
      "disabled",
      "Settlement reconciliation dry-run disabled.",
      { blockedReasons: ["Dry-run disabled."] },
    );
  }

  if (!isTradeReference(input.tradeReference)) {
    return baseReport(
      input,
      "dry_run_blocked",
      "Settlement reconciliation dry-run requires an executed trade reference.",
      {
        stepReports: [
          step(
            "validate_trade_reference",
            "validate_trade_reference",
            "Validate executed trade reference",
            "blocked",
            "Executed trade reference is missing.",
            {
              wouldUseValueSource: "trade_reference",
              blockedReason: "Missing executed trade reference.",
            },
          ),
          ...skippedSteps("validate_settlement_route"),
        ],
        blockedReasons: ["Missing executed trade reference."],
      },
    );
  }

  const tradeReference = input.tradeReference;

  if (!isRouteContract(input.settlementNoteRouteContract)) {
    return baseReport(
      input,
      "dry_run_waiting_for_route",
      "Settlement reconciliation dry-run waits for settlement route contract.",
      {
        tradeReference,
        stepReports: [
          step(
            "validate_trade_reference",
            "validate_trade_reference",
            "Validate executed trade reference",
            "simulated",
            "Executed trade reference is present for dry-run only.",
            {
              wouldUseValueSource: "trade_reference",
              safeDisplayValue: safeText(tradeReference.ticker),
            },
          ),
          step(
            "validate_settlement_route",
            "validate_settlement_route",
            "Validate settlement note route",
            "blocked_route",
            "Settlement note route contract is missing.",
            {
              wouldUseValueSource: "settlement_route",
              blockedReason: "Missing settlement note route contract.",
            },
          ),
          ...skippedSteps("validate_settlement_route"),
        ],
        blockedReasons: ["Missing settlement note route contract."],
      },
    );
  }

  const route = input.settlementNoteRouteContract;
  const routeReady = route.status === "settlement_note_ready";

  if (!routeReady) {
    return baseReport(input, "dry_run_waiting_for_route", route.reason, {
      tradeReference,
      route,
      stepReports: [
        step(
          "validate_trade_reference",
          "validate_trade_reference",
          "Validate executed trade reference",
          "simulated",
          "Executed trade reference is present for dry-run only.",
          {
            wouldUseValueSource: "trade_reference",
            safeDisplayValue: safeText(tradeReference.ticker),
          },
        ),
        step(
          "validate_settlement_route",
          "validate_settlement_route",
          "Validate settlement note route",
          "blocked_route",
          "Settlement route has not reached settlement_note_ready.",
          {
            wouldUseValueSource: "settlement_route",
            safeDisplayValue: route.status,
            blockedReason: "Settlement route not ready.",
          },
        ),
        ...skippedSteps("validate_settlement_route"),
      ],
      blockedReasons: ["Settlement route not ready."],
    });
  }

  if (!isActionContract(input.settlementNoteActionContract)) {
    return baseReport(
      input,
      "dry_run_waiting_for_action_contract",
      "Settlement reconciliation dry-run waits for action contract.",
      {
        tradeReference,
        route,
        stepReports: [
          step(
            "validate_trade_reference",
            "validate_trade_reference",
            "Validate executed trade reference",
            "simulated",
            "Executed trade reference is present for dry-run only.",
            { wouldUseValueSource: "trade_reference" },
          ),
          step(
            "validate_settlement_route",
            "validate_settlement_route",
            "Validate settlement note route",
            "simulated",
            "Settlement route is ready in the model.",
            { wouldUseValueSource: "settlement_route", safeDisplayValue: route.status },
          ),
          step(
            "validate_settlement_actions",
            "validate_settlement_actions",
            "Validate settlement note action contract",
            "blocked_action_contract",
            "Settlement note action contract is missing.",
            {
              wouldUseValueSource: "settlement_action_contract",
              blockedReason: "Missing settlement action contract.",
            },
          ),
          ...skippedSteps("validate_settlement_actions"),
        ],
        blockedReasons: ["Missing settlement action contract."],
      },
    );
  }

  const action = input.settlementNoteActionContract;

  if (action.status !== "action_plan_ready") {
    return baseReport(input, "dry_run_waiting_for_action_contract", action.reason, {
      tradeReference,
      route,
      action,
      stepReports: [
        step(
          "validate_trade_reference",
          "validate_trade_reference",
          "Validate executed trade reference",
          "simulated",
          "Executed trade reference is present for dry-run only.",
          { wouldUseValueSource: "trade_reference" },
        ),
        step(
          "validate_settlement_route",
          "validate_settlement_route",
          "Validate settlement note route",
          "simulated",
          "Settlement route is ready in the model.",
          { wouldUseValueSource: "settlement_route", safeDisplayValue: route.status },
        ),
        step(
          "validate_settlement_actions",
          "validate_settlement_actions",
          "Validate settlement note action contract",
          "blocked_action_contract",
          "Settlement action contract has not reached action_plan_ready.",
          {
            wouldUseValueSource: "settlement_action_contract",
            safeDisplayValue: action.status,
            blockedReason: "Settlement action contract not ready.",
          },
        ),
        ...skippedSteps("validate_settlement_actions"),
      ],
      blockedReasons: ["Settlement action contract not ready."],
    });
  }

  if (!isExtractionSchema(input.extractionSchemaResult)) {
    return baseReport(
      input,
      "dry_run_waiting_for_extraction_schema",
      "Settlement reconciliation dry-run waits for extraction schema.",
      {
        tradeReference,
        route,
        action,
        stepReports: [
          ...completeStepReports({
            tradeReference,
            route,
            action,
            schema: {
              schemaId: "missing",
              createdAt: defaultCreatedAt,
              status: "waiting_for_note",
              label: "Missing extraction schema",
              reason: "Missing extraction schema.",
              side: "unknown",
              ticker: "missing",
              instrumentName: "missing",
              currency: "missing",
              extractionTargets: [],
              warnings: [],
              blockedReasons: [],
              schemaEnabled: true,
              canDefineExtractionTargets: false,
              canReadSettlementDocument: false,
              canDownloadPdf: false,
              canUseOcr: false,
              canExtractValues: false,
              canMapToReconciliation: false,
              canWriteTradeReconciliation: false,
              canWriteSupabase: false,
              canReadCookies: false,
              canExportSession: false,
              canAutomateBankId: false,
              canBypassBankId: false,
              valuesAreMaskedOrSynthetic: true,
              userMustConfirm: true,
              finalHumanClickRequired: true,
              controlsEnabled: false,
              gateLocked: true,
              safetyFlags: {
                schemaEnabled: true,
                canDefineExtractionTargets: false,
                canReadSettlementDocument: false,
                canDownloadPdf: false,
                canUseOcr: false,
                canExtractValues: false,
                canMapToReconciliation: false,
                canWriteTradeReconciliation: false,
                canWriteSupabase: false,
                canReadCookies: false,
                canExportSession: false,
                canAutomateBankId: false,
                canBypassBankId: false,
                valuesAreMaskedOrSynthetic: true,
                userMustConfirm: true,
                finalHumanClickRequired: true,
                controlsEnabled: false,
                gateLocked: true,
              },
            },
            preview: {
              previewId: "missing",
              createdAt: defaultCreatedAt,
              status: "waiting_for_extraction",
              label: "Missing reconciliation preview",
              reason: "Missing reconciliation preview.",
              fields: [],
              pnlImpactMode: "none",
              warnings: [],
              blockedReasons: [],
              mappingEnabled: true,
              canBuildReconciliationPreview: false,
              canApplyReconciliation: false,
              canWriteExecutionRecord: false,
              canWriteTradeResult: false,
              canWriteStatistics: false,
              canWriteAuditMetadata: false,
              canWriteSupabase: false,
              canReadSettlementDocument: false,
              canUseOcr: false,
              valuesAreMaskedOrSynthetic: true,
              requiresManualReview: true,
              userMustConfirm: true,
              controlsEnabled: false,
              gateLocked: true,
              safetyFlags: {
                mappingEnabled: true,
                canBuildReconciliationPreview: false,
                canApplyReconciliation: false,
                canWriteExecutionRecord: false,
                canWriteTradeResult: false,
                canWriteStatistics: false,
                canWriteAuditMetadata: false,
                canWriteSupabase: false,
                canReadSettlementDocument: false,
                canUseOcr: false,
                valuesAreMaskedOrSynthetic: true,
                requiresManualReview: true,
                userMustConfirm: true,
                controlsEnabled: false,
                gateLocked: true,
              },
            },
          }).map((report) =>
            report.stepType === "validate_extraction_schema"
              ? {
                  ...report,
                  dryRunStatus: "blocked_extraction_schema" as const,
                  blockedReason: "Missing extraction schema.",
                }
              : report.stepType === "validate_reconciliation_mapping" ||
                  report.stepType === "simulate_manual_review_gate" ||
                  report.stepType === "stop_before_reconciliation_write"
                ? { ...report, dryRunStatus: "skipped" as const }
                : report,
          ),
        ],
        blockedReasons: ["Missing extraction schema."],
      },
    );
  }

  const schema = input.extractionSchemaResult;
  const schemaReady =
    schema.status === "extraction_target_ready" ||
    schema.status === "mapped_for_reconciliation";

  if (!schemaReady) {
    return baseReport(input, "dry_run_waiting_for_extraction_schema", schema.reason, {
      tradeReference,
      route,
      action,
      schema,
      stepReports: [
        step(
          "validate_trade_reference",
          "validate_trade_reference",
          "Validate executed trade reference",
          "simulated",
          "Executed trade reference is present for dry-run only.",
          { wouldUseValueSource: "trade_reference" },
        ),
        step(
          "validate_settlement_route",
          "validate_settlement_route",
          "Validate settlement note route",
          "simulated",
          "Settlement route is ready in the model.",
          { wouldUseValueSource: "settlement_route", safeDisplayValue: route.status },
        ),
        step(
          "validate_settlement_actions",
          "validate_settlement_actions",
          "Validate settlement note action contract",
          "simulated",
          "Settlement action contract is ready in the model.",
          {
            wouldUseValueSource: "settlement_action_contract",
            safeDisplayValue: action.status,
          },
        ),
        step(
          "validate_extraction_schema",
          "validate_extraction_schema",
          "Validate extraction schema",
          "blocked_extraction_schema",
          "Extraction schema targets are not ready.",
          {
            wouldUseValueSource: "extraction_schema",
            safeDisplayValue: schema.status,
            blockedReason: "Extraction schema not ready.",
          },
        ),
        ...skippedSteps("validate_extraction_schema"),
      ],
      blockedReasons: ["Extraction schema not ready."],
    });
  }

  if (!isReconciliationPreview(input.reconciliationPreview)) {
    return baseReport(
      input,
      "dry_run_waiting_for_mapping",
      "Settlement reconciliation dry-run waits for reconciliation mapping.",
      {
        tradeReference,
        route,
        action,
        schema,
        stepReports: [
          step(
            "validate_trade_reference",
            "validate_trade_reference",
            "Validate executed trade reference",
            "simulated",
            "Executed trade reference is present for dry-run only.",
            { wouldUseValueSource: "trade_reference" },
          ),
          step(
            "validate_settlement_route",
            "validate_settlement_route",
            "Validate settlement note route",
            "simulated",
            "Settlement route is ready in the model.",
            { wouldUseValueSource: "settlement_route", safeDisplayValue: route.status },
          ),
          step(
            "validate_settlement_actions",
            "validate_settlement_actions",
            "Validate settlement note action contract",
            "simulated",
            "Settlement action contract is ready in the model.",
            {
              wouldUseValueSource: "settlement_action_contract",
              safeDisplayValue: action.status,
            },
          ),
          step(
            "validate_extraction_schema",
            "validate_extraction_schema",
            "Validate extraction schema",
            "simulated",
            "Extraction schema targets are ready in the model.",
            { wouldUseValueSource: "extraction_schema", safeDisplayValue: schema.status },
          ),
          step(
            "validate_reconciliation_mapping",
            "validate_reconciliation_mapping",
            "Validate reconciliation mapping",
            "blocked_mapping",
            "Reconciliation mapping preview is missing.",
            {
              wouldUseValueSource: "reconciliation_mapping",
              blockedReason: "Missing reconciliation mapping preview.",
            },
          ),
          ...skippedSteps("validate_reconciliation_mapping"),
        ],
        blockedReasons: ["Missing reconciliation mapping preview."],
      },
    );
  }

  const preview = input.reconciliationPreview;
  const previewReady =
    preview.status === "mapping_ready" ||
    preview.status === "reconciliation_preview_ready";

  if (!previewReady) {
    return baseReport(input, "dry_run_waiting_for_mapping", preview.reason, {
      tradeReference,
      route,
      action,
      schema,
      preview,
      stepReports: [
        ...completeStepReports({ tradeReference, route, action, schema, preview }).map(
          (report) =>
            report.stepType === "validate_reconciliation_mapping"
              ? {
                  ...report,
                  dryRunStatus: "blocked_mapping" as const,
                  blockedReason: "Reconciliation mapping not ready.",
                }
              : report.stepType === "simulate_manual_review_gate" ||
                  report.stepType === "stop_before_reconciliation_write"
                ? { ...report, dryRunStatus: "skipped" as const }
                : report,
        ),
      ],
      blockedReasons: ["Reconciliation mapping not ready."],
    });
  }

  const status =
    input.mode === "local_dev_dry_run"
      ? "dry_run_passed"
      : "dry_run_manual_review_required";

  return baseReport(input, status, "Settlement reconciliation dry-run passed as model only.", {
    tradeReference,
    route,
    action,
    schema,
    preview,
    stepReports: completeStepReports({
      tradeReference,
      route,
      action,
      schema,
      preview,
    }),
    warnings: [
      "No settlement values are extracted in this task.",
      "No reconciliation writes are applied in this task.",
      "Manual review remains required before any future apply step.",
    ],
    canDryRun: true,
    canBuildReconciliationPreview: true,
    nextExpectedState:
      "Manual review required; stop before reconciliation write or Supabase write.",
  });
}
