import type {
  AvanzaDisabledLocalDevInvocationAdapterContract,
  AvanzaDisabledLocalDevInvocationAdapterTarget,
} from "./avanza-disabled-local-dev-invocation-adapter-contract";

export type AvanzaDisabledInvocationAdapterPayloadValidationStatus =
  | "valid_for_design_review"
  | "invalid_missing_adapter_contract"
  | "invalid_missing_request_shape"
  | "invalid_missing_safe_payload"
  | "invalid_sensitive_payload_detected"
  | "invalid_runtime_capability_detected"
  | "invalid_invocation_boundary_crossed"
  | "blocked"
  | "forbidden"
  | "unknown";

export type AvanzaDisabledInvocationAdapterPayloadFieldStatus =
  | "allowed"
  | "missing"
  | "redacted"
  | "forbidden"
  | "unsafe"
  | "unknown";

export type AvanzaDisabledInvocationAdapterPayloadForbiddenField =
  | "raw_credentials"
  | "cookies"
  | "session_tokens"
  | "account_numbers"
  | "order_ids"
  | "bankid_artifacts"
  | "unredacted_screenshots"
  | "broker_confirmations_raw"
  | "api_route_reference"
  | "smoke_script_reference"
  | "browser_runtime_handle"
  | "supabase_write_payload"
  | "unknown";

export type AvanzaDisabledInvocationAdapterPayloadCandidate = {
  requestId?: unknown;
  target?: unknown;
  terminalOnly?: unknown;
  localDevOnly?: unknown;
  modelOnlyDefault?: unknown;
  selectedTicker?: unknown;
  selectedSide?: unknown;
  selectedQuantity?: unknown;
  selectedLimitPrice?: unknown;
  requestKind?: unknown;
  dryRunId?: unknown;
  bridgeContractId?: unknown;
  checklistOrRunbookId?: unknown;
  checkpointId?: unknown;
  safePayloadSummary?: unknown;
  raw_credentials?: unknown;
  cookies?: unknown;
  session_tokens?: unknown;
  account_numbers?: unknown;
  order_ids?: unknown;
  bankid_artifacts?: unknown;
  unredacted_screenshots?: unknown;
  broker_confirmations_raw?: unknown;
  api_route_reference?: unknown;
  smoke_script_reference?: unknown;
  browser_runtime_handle?: unknown;
  supabase_write_payload?: unknown;
  canApproveRuntimeInvocation?: unknown;
  canCrossInvocationBoundaryNow?: unknown;
  canInvokeTargetNow?: unknown;
  canInvokeSmokeRunnerNow?: unknown;
  canRunTerminalScriptNow?: unknown;
  canUseBrowserAutomationNow?: unknown;
  canCallApiRoute?: unknown;
  canAccessCredentials?: unknown;
  canSubmitOrder?: unknown;
  canWriteSupabase?: unknown;
};

export type AvanzaDisabledInvocationAdapterPayloadFieldValidation = {
  fieldId: string;
  label: string;
  status: AvanzaDisabledInvocationAdapterPayloadFieldStatus;
  required: boolean;
  valuePresent: boolean;
  redactionRequired: boolean;
  redacted: boolean;
  forbidden: boolean;
  reason: string;
};

export type AvanzaDisabledInvocationAdapterPayloadSafetyFlags = {
  validatorOnly: true;
  designReviewOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canApproveRuntimeInvocation: false;
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
  canCarryCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canCarrySessionTokens: false;
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

export type AvanzaDisabledInvocationAdapterPayloadValidationReport = {
  validationId: string;
  createdAt: string;
  status: AvanzaDisabledInvocationAdapterPayloadValidationStatus;
  label: string;
  reason: string;
  adapterContractId?: string;
  target?: AvanzaDisabledLocalDevInvocationAdapterTarget;
  requestId?: string;
  fieldValidations: AvanzaDisabledInvocationAdapterPayloadFieldValidation[];
  allowedPayloadSummary: string[];
  forbiddenPayloadDetected: AvanzaDisabledInvocationAdapterPayloadForbiddenField[];
  missingRequiredFields: string[];
  unsafeCapabilitiesDetected: string[];
  invocationBoundaryStatus: "locked" | "crossed" | "unknown";
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaDisabledInvocationAdapterPayloadSafetyFlags;
};

export type AvanzaDisabledInvocationAdapterPayloadValidationInput = {
  validationId?: string;
  adapterContract?: AvanzaDisabledLocalDevInvocationAdapterContract;
  payloadCandidate?: AvanzaDisabledInvocationAdapterPayloadCandidate;
  now?: string;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

const requiredAllowedFields = [
  "requestId",
  "target",
  "terminalOnly",
  "localDevOnly",
  "modelOnlyDefault",
  "selectedTicker",
  "selectedSide",
  "selectedQuantity",
  "selectedLimitPrice",
  "requestKind",
  "dryRunId",
  "bridgeContractId",
  "checklistOrRunbookId",
  "checkpointId",
  "safePayloadSummary",
] as const;

const forbiddenFields = [
  "raw_credentials",
  "cookies",
  "session_tokens",
  "account_numbers",
  "order_ids",
  "bankid_artifacts",
  "unredacted_screenshots",
  "broker_confirmations_raw",
  "api_route_reference",
  "smoke_script_reference",
  "browser_runtime_handle",
  "supabase_write_payload",
] as const;

const runtimeCapabilityFields = [
  "canApproveRuntimeInvocation",
  "canCrossInvocationBoundaryNow",
  "canInvokeTargetNow",
  "canInvokeSmokeRunnerNow",
  "canRunTerminalScriptNow",
  "canUseBrowserAutomationNow",
  "canCallApiRoute",
  "canAccessCredentials",
  "canSubmitOrder",
  "canWriteSupabase",
] as const;

function safetyFlags(): AvanzaDisabledInvocationAdapterPayloadSafetyFlags {
  return {
    canAccessCredentials: false,
    canApproveRuntimeInvocation: false,
    canAutomateBankId: false,
    canCallApiRoute: false,
    canCarryCredentials: false,
    canCarrySessionTokens: false,
    canClaimProductionReady: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canCrossInvocationBoundaryNow: false,
    canExportSession: false,
    canFetch: false,
    canInvokeSmokeRunnerNow: false,
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
    designReviewOnly: true,
    finalHumanClickRequired: true,
    gateLocked: true,
    headlessOnly: true,
    userMustConfirm: true,
    validatorOnly: true,
    visibleInUi: false,
  };
}

function valuePresent(value: unknown) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;

  return true;
}

function isTrue(value: unknown) {
  return value === true;
}

function fieldValidation(
  fieldId: string,
  label: string,
  status: AvanzaDisabledInvocationAdapterPayloadFieldStatus,
  required: boolean,
  value: unknown,
  reason: string,
  redactionRequired = false,
): AvanzaDisabledInvocationAdapterPayloadFieldValidation {
  return {
    fieldId,
    forbidden: status === "forbidden" || status === "unsafe",
    label,
    reason,
    redacted: status === "redacted",
    redactionRequired,
    required,
    status,
    valuePresent: valuePresent(value),
  };
}

function buildFieldValidations(
  payload: AvanzaDisabledInvocationAdapterPayloadCandidate | undefined,
) {
  const allowed = requiredAllowedFields.map((field) =>
    fieldValidation(
      field,
      field,
      valuePresent(payload?.[field]) ? "allowed" : "missing",
      true,
      payload?.[field],
      valuePresent(payload?.[field])
        ? "Allowed design-review payload field is present."
        : "Required design-review payload field is missing.",
    ),
  );

  const forbidden = forbiddenFields.map((field) =>
    fieldValidation(
      field,
      field,
      valuePresent(payload?.[field]) ? "forbidden" : "allowed",
      false,
      payload?.[field],
      valuePresent(payload?.[field])
        ? "Forbidden sensitive payload field is present."
        : "Forbidden sensitive payload field is absent.",
      true,
    ),
  );

  const runtime = runtimeCapabilityFields.map((field) =>
    fieldValidation(
      field,
      field,
      isTrue(payload?.[field]) ? "unsafe" : "allowed",
      false,
      payload?.[field],
      isTrue(payload?.[field])
        ? "Runtime capability is true and must be blocked."
        : "Runtime capability is absent or false.",
    ),
  );

  return [...allowed, ...forbidden, ...runtime];
}

function statusDetails(
  status: AvanzaDisabledInvocationAdapterPayloadValidationStatus,
) {
  if (status === "valid_for_design_review") {
    return {
      label: "Valid for design review",
      reason:
        "Payload is complete enough for disabled adapter design review and cannot invoke runtime.",
    };
  }
  if (status === "invalid_missing_adapter_contract") {
    return {
      label: "Invalid: missing adapter contract",
      reason: "Disabled invocation adapter contract is required.",
    };
  }
  if (status === "invalid_missing_request_shape") {
    return {
      label: "Invalid: missing request shape",
      reason: "Adapter contract request shape is required.",
    };
  }
  if (status === "invalid_missing_safe_payload") {
    return {
      label: "Invalid: missing safe payload",
      reason: "Safe payload summary and required design-review fields are missing.",
    };
  }
  if (status === "invalid_sensitive_payload_detected") {
    return {
      label: "Invalid: sensitive payload detected",
      reason: "Payload contains forbidden sensitive fields.",
    };
  }
  if (status === "invalid_runtime_capability_detected") {
    return {
      label: "Invalid: runtime capability detected",
      reason: "Payload exposes runtime capability that must remain false.",
    };
  }
  if (status === "invalid_invocation_boundary_crossed") {
    return {
      label: "Invalid: invocation boundary crossed",
      reason: "Payload attempts to cross invocation boundary.",
    };
  }
  if (status === "blocked") {
    return {
      label: "Blocked payload validation",
      reason: "Adapter contract is not ready for design-review validation.",
    };
  }
  if (status === "forbidden") {
    return {
      label: "Forbidden payload validation",
      reason: "Payload validation request is forbidden.",
    };
  }

  return {
    label: "Unknown payload validation",
    reason: "Unknown inputs remain locked.",
  };
}

function allowedPayloadSummary(
  payload: AvanzaDisabledInvocationAdapterPayloadCandidate | undefined,
) {
  const summary = payload?.safePayloadSummary;
  if (Array.isArray(summary)) return summary.map(String);
  if (typeof summary === "string" && summary.trim().length > 0) {
    return [summary];
  }

  return [];
}

export function validateAvanzaDisabledInvocationAdapterPayload(
  input: AvanzaDisabledInvocationAdapterPayloadValidationInput = {},
): AvanzaDisabledInvocationAdapterPayloadValidationReport {
  const validationId =
    input.validationId ?? "avanza-disabled-invocation-adapter-payload-validator";
  const createdAt = input.now ?? defaultCreatedAt;
  const fieldValidations = buildFieldValidations(input.payloadCandidate);
  const forbiddenPayloadDetected = forbiddenFields.filter((field) =>
    valuePresent(input.payloadCandidate?.[field]),
  );
  const missingRequiredFields = requiredAllowedFields.filter(
    (field) => !valuePresent(input.payloadCandidate?.[field]),
  );
  const unsafeCapabilitiesDetected = runtimeCapabilityFields.filter((field) =>
    isTrue(input.payloadCandidate?.[field]),
  );
  const invocationBoundaryCrossed = Boolean(
    input.payloadCandidate?.canInvokeTargetNow ||
      input.payloadCandidate?.canRunTerminalScriptNow ||
      input.payloadCandidate?.canUseBrowserAutomationNow ||
      input.payloadCandidate?.canCrossInvocationBoundaryNow,
  );
  const safeSummary = allowedPayloadSummary(input.payloadCandidate);
  const blockedReasons: string[] = [];
  const warnings: string[] = [];

  let status: AvanzaDisabledInvocationAdapterPayloadValidationStatus =
    "valid_for_design_review";

  if (!input.adapterContract) {
    status = "invalid_missing_adapter_contract";
    blockedReasons.push("Adapter contract missing.");
  } else if (!input.adapterContract.requestShape) {
    status = "invalid_missing_request_shape";
    blockedReasons.push("Adapter contract request shape missing.");
  } else if (input.adapterContract.status !== "disabled_contract_ready") {
    status = "blocked";
    blockedReasons.push("Adapter contract is not disabled_contract_ready.");
  } else if (safeSummary.length === 0 || missingRequiredFields.length > 0) {
    status = "invalid_missing_safe_payload";
    blockedReasons.push("Safe payload summary or required fields are missing.");
  } else if (forbiddenPayloadDetected.length > 0) {
    status = "invalid_sensitive_payload_detected";
    blockedReasons.push("Forbidden sensitive payload detected.");
  } else if (invocationBoundaryCrossed) {
    status = "invalid_invocation_boundary_crossed";
    blockedReasons.push("Payload attempts to cross invocation boundary.");
  } else if (unsafeCapabilitiesDetected.length > 0) {
    status = "invalid_runtime_capability_detected";
    blockedReasons.push("Runtime capability detected.");
  } else {
    warnings.push("Valid for design review only; runtime remains locked.");
  }

  const details = statusDetails(status);

  return {
    adapterContractId: input.adapterContract?.adapterContractId,
    allowedPayloadSummary: safeSummary,
    blockedReasons,
    createdAt,
    fieldValidations,
    forbiddenPayloadDetected,
    invocationBoundaryStatus: invocationBoundaryCrossed ? "crossed" : "locked",
    label: details.label,
    missingRequiredFields,
    reason: details.reason,
    requestId:
      typeof input.payloadCandidate?.requestId === "string"
        ? input.payloadCandidate.requestId
        : input.adapterContract?.requestShape?.requestId,
    safetyFlags: safetyFlags(),
    status,
    target: input.adapterContract?.target,
    unsafeCapabilitiesDetected,
    validationId,
    warnings,
  };
}
