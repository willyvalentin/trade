import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInputStrategy } from "./first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper";

export const firstRealAvanzaFillOnlyPocQuantityBasedProofFilePath =
  "tmp/avanza-fill-only-proof/latest-quantity-based-result.json";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type FirstRealAvanzaFillOnlyPocLiveProofInput = {
  timestamp?: string;
  selected_input_strategy: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInputStrategy;
  structured_runner_result: unknown;
  stdout_truncated_or_unverifiable?: boolean;
  previous_run_status?: string | null;
};

export type FirstRealAvanzaFillOnlyPocLiveProofDocument = {
  proof_version: "first_real_avanza_fill_only_poc_live_proof_v1";
  timestamp: string;
  result_status:
    | "quantity_based_live_fill_attempt_result_captured"
    | "quantity_based_live_fill_attempt_result_truncated_or_unverifiable";
  run_marked_successful: boolean;
  selected_input_strategy: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInputStrategy;
  proof_file_path: typeof firstRealAvanzaFillOnlyPocQuantityBasedProofFilePath;
  structured_runner_result: JsonValue;
  required_fields: {
    timestamp: true;
    selected_input_strategy: true;
    preflight_or_visible_state_verification_result: true;
    quantity_fill_attempted: true;
    quantity_fill_verified: true;
    quantity_candidate_diagnostics_if_failed: true;
    price_fill_attempted: true;
    price_fill_verified: true;
    total_read: true;
    total_valid: true;
    evidence_ids: true;
    stopped_before_granska_kop: true;
    no_review_modal: true;
    no_final_confirmation: true;
    no_order_placement: true;
    errors_blockers_warnings: true;
  };
  safety_confirmations: {
    local_file_only: true;
    no_avanza_access: true;
    no_field_fill: true;
    no_click: true;
    no_review_or_final_or_submit: true;
    no_order_placement: true;
    no_credentials_cookies_storage_or_session_data: true;
    no_raw_page_text: true;
    not_successful_when_stdout_truncated: true;
  };
};

const omittedSensitiveValue = "[omitted-sensitive-or-raw-observation]";

const sensitiveKeyPattern =
  /(^|[_-])(cookie|cookies|localstorage|sessionstorage|bankid|credential|credentials|password|secret|token|auth|raw|html|dom|page_text|visible_text|raw_page_text)([_-]|$)/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function sanitizeProofValue(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return Number.isNaN(value) ? null : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeProofValue(item));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sensitiveKeyPattern.test(key)
          ? omittedSensitiveValue
          : sanitizeProofValue(nestedValue),
      ]),
    );
  }

  return String(value);
}

function structuredResultMarkedSuccessful(value: unknown): boolean {
  if (!isPlainObject(value)) {
    return false;
  }

  const blockers = value.errors_blockers_warnings;
  const blockerList =
    isPlainObject(blockers) && Array.isArray(blockers.blockers)
      ? blockers.blockers
      : [];

  return (
    value.status ===
      "final_live_execute_attempt_explicit_invocation_trigger_plan_created" &&
    value.trigger_plan_created === true &&
    blockerList.length === 0 &&
    value.no_order_placement === true
  );
}

function objectValue(value: unknown, key: string): unknown {
  return isPlainObject(value) ? value[key] : undefined;
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function findRunnerCall(value: unknown, method: string): Record<string, unknown> | null {
  const runnerCalls = arrayValue(objectValue(value, "runner_calls"));
  const runnerCall = runnerCalls.find(
    (call) => isPlainObject(call) && call.method === method,
  );

  return isPlainObject(runnerCall) ? runnerCall : null;
}

function bridgeMetadataForCall(call: Record<string, unknown> | null): Record<
  string,
  unknown
> | null {
  const diagnostics = objectValue(call, "diagnostics");
  const metadata = objectValue(diagnostics, "metadata");

  return isPlainObject(metadata) ? metadata : null;
}

function bridgeReportForCall(call: Record<string, unknown> | null): Record<
  string,
  unknown
> | null {
  const diagnostics = objectValue(call, "diagnostics");
  const report = objectValue(diagnostics, "report");

  return isPlainObject(report) ? report : null;
}

function firstString(values: unknown[]): string | null {
  const value = values.find((item) => typeof item === "string" && item.length > 0);

  return typeof value === "string" ? value : null;
}

function quantityDiagnosticsFromRunnerCall(
  call: Record<string, unknown> | null,
): Record<string, unknown> | null {
  const metadata = bridgeMetadataForCall(call);

  if (!metadata) {
    return null;
  }

  return {
    quantity_candidate_count: metadata.quantity_candidate_count ?? null,
    selected_selector: metadata.quantity_selected_selector ?? null,
    selected_id: metadata.quantity_selected_id ?? null,
    selected_field_group: metadata.quantity_selected_field_group ?? null,
    field_discovery_matched:
      metadata.quantity_field_discovery_matched ?? null,
    selected_quantity_candidate_metadata:
      metadata.quantity_selected_candidate ?? metadata.selected_candidate ?? null,
    candidate_hidden: metadata.quantity_candidate_hidden ?? null,
    candidate_disabled: metadata.quantity_candidate_disabled ?? null,
    candidate_readonly: metadata.quantity_candidate_readonly ?? null,
    before_value:
      metadata.quantity_before_value_normalized ??
      metadata.before_value_normalized ??
      null,
    after_attempted_value:
      metadata.quantity_after_value_normalized ??
      metadata.after_value_normalized ??
      null,
    readback_source:
      metadata.quantity_readback_source_used ??
      metadata.readback_source_used ??
      null,
    expected_normalized_value: metadata.quantity_expected_normalized ?? null,
    observed_normalized_value: metadata.quantity_observed_normalized ?? null,
    exact_internal_blocker_reason:
      metadata.exact_blocker_reason ??
      firstString(arrayValue(objectValue(objectValue(call, "diagnostics"), "blockers"))) ??
      null,
  };
}

function enrichStructuredRunnerResult(value: unknown): unknown {
  if (!isPlainObject(value)) {
    return value;
  }

  const verifyCall = findRunnerCall(value, "verifyVisibleOrderFormState");
  const amountCall = findRunnerCall(value, "fillAmountField");
  const quantityCall = findRunnerCall(value, "fillQuantityField");
  const priceCall = findRunnerCall(value, "fillPriceField");
  const totalCall = findRunnerCall(value, "readTotalAmount");
  const evidenceCall = findRunnerCall(value, "captureEvidence");
  const stopCall = findRunnerCall(value, "stopBeforeReview");
  const quantityDiagnostics =
    isPlainObject(value.quantity_candidate_diagnostics_if_failed) &&
    Object.keys(value.quantity_candidate_diagnostics_if_failed).length > 1
      ? value.quantity_candidate_diagnostics_if_failed
      : quantityDiagnosticsFromRunnerCall(quantityCall);
  const quantityReport = bridgeReportForCall(quantityCall);

  return {
    ...value,
    quantity_candidate_diagnostics_if_failed:
      quantityDiagnostics ?? value.quantity_candidate_diagnostics_if_failed ?? null,
    bridge_runner_call_diagnostics: {
      ...(isPlainObject(value.bridge_runner_call_diagnostics)
        ? value.bridge_runner_call_diagnostics
        : {}),
      verifyVisibleOrderFormState: verifyCall?.diagnostics ?? null,
      fillAmountField: amountCall?.diagnostics ?? null,
      fillQuantityField: quantityCall?.diagnostics ?? null,
      fillPriceField: priceCall?.diagnostics ?? null,
      readTotalAmount: totalCall?.diagnostics ?? null,
      captureEvidence: evidenceCall?.diagnostics ?? null,
      stopBeforeReview: stopCall?.diagnostics ?? null,
    },
    quantity_fill_verified:
      value.quantity_fill_verified ??
      quantityReport?.quantity_fill_verified ??
      quantityCall?.ok === true,
  };
}

export function buildFirstRealAvanzaFillOnlyPocLiveProofDocument(
  input: FirstRealAvanzaFillOnlyPocLiveProofInput,
): FirstRealAvanzaFillOnlyPocLiveProofDocument {
  const resultStatus = input.stdout_truncated_or_unverifiable
    ? "quantity_based_live_fill_attempt_result_truncated_or_unverifiable"
    : "quantity_based_live_fill_attempt_result_captured";
  const runMarkedSuccessful =
    resultStatus === "quantity_based_live_fill_attempt_result_captured" &&
    structuredResultMarkedSuccessful(input.structured_runner_result);
  const enrichedStructuredRunnerResult = enrichStructuredRunnerResult(
    input.structured_runner_result,
  );

  return {
    proof_version: "first_real_avanza_fill_only_poc_live_proof_v1",
    timestamp: input.timestamp ?? new Date().toISOString(),
    result_status: resultStatus,
    run_marked_successful: runMarkedSuccessful,
    selected_input_strategy: input.selected_input_strategy,
    proof_file_path: firstRealAvanzaFillOnlyPocQuantityBasedProofFilePath,
    structured_runner_result: sanitizeProofValue(enrichedStructuredRunnerResult),
    required_fields: {
      timestamp: true,
      selected_input_strategy: true,
      preflight_or_visible_state_verification_result: true,
      quantity_fill_attempted: true,
      quantity_fill_verified: true,
      quantity_candidate_diagnostics_if_failed: true,
      price_fill_attempted: true,
      price_fill_verified: true,
      total_read: true,
      total_valid: true,
      evidence_ids: true,
      stopped_before_granska_kop: true,
      no_review_modal: true,
      no_final_confirmation: true,
      no_order_placement: true,
      errors_blockers_warnings: true,
    },
    safety_confirmations: {
      local_file_only: true,
      no_avanza_access: true,
      no_field_fill: true,
      no_click: true,
      no_review_or_final_or_submit: true,
      no_order_placement: true,
      no_credentials_cookies_storage_or_session_data: true,
      no_raw_page_text: true,
      not_successful_when_stdout_truncated: true,
    },
  };
}

export function writeFirstRealAvanzaFillOnlyPocLiveProofFile(
  input: FirstRealAvanzaFillOnlyPocLiveProofInput,
  proofFilePath: string = firstRealAvanzaFillOnlyPocQuantityBasedProofFilePath,
): FirstRealAvanzaFillOnlyPocLiveProofDocument {
  const proofDocument = buildFirstRealAvanzaFillOnlyPocLiveProofDocument(input);
  const resolvedProofFilePath = resolve(process.cwd(), proofFilePath);

  mkdirSync(dirname(resolvedProofFilePath), { recursive: true });
  writeFileSync(
    resolvedProofFilePath,
    `${JSON.stringify(proofDocument, null, 2)}\n`,
    "utf8",
  );

  return proofDocument;
}
