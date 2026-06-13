import type {
  LocalhostBridgeClientBrokerExecutionResultPreviewResult,
  LocalhostBridgeClientExecutionRecordEligibilityResult,
} from "@/lib/avanza-localhost-bridge-client";

export type ExecutionSandboxQaStatus = "pass" | "warn" | "fail" | "pending";

export type ExecutionSandboxQaItem = {
  label: string;
  status: ExecutionSandboxQaStatus;
  message: string;
};

export function buildBrokerExecutionPreviewReadinessItems({
  blocked,
  duplicateRisk,
  failed,
  hasRun,
  noExecutionRecord,
  noRealBrokerExecutionResult,
  noSupabaseWrite,
  noTradeMutation,
  notEligible,
  partialOnly,
  previewAvailable,
  previewResult,
}: {
  blocked: boolean;
  duplicateRisk: boolean;
  failed: boolean;
  hasRun: boolean;
  noExecutionRecord: boolean;
  noRealBrokerExecutionResult: boolean;
  noSupabaseWrite: boolean;
  noTradeMutation: boolean;
  notEligible: boolean;
  partialOnly: boolean;
  previewAvailable: boolean;
  previewResult:
    | NonNullable<
        LocalhostBridgeClientBrokerExecutionResultPreviewResult["response"]
      >["brokerExecutionResultPreview"]
    | null;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "BrokerExecutionResult preview status",
      status: hasRun
        ? previewAvailable
          ? "pass"
          : partialOnly || duplicateRisk || notEligible
            ? "warn"
            : blocked || failed
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest BrokerExecutionResult preview status: ${previewResult?.status ?? "unknown"}.`
        : "No BrokerExecutionResult preview stub check has been run in this modal session.",
    },
    {
      label: "BrokerExecutionResult preview available",
      status: hasRun ? (previewAvailable ? "pass" : "warn") : "pending",
      message: previewAvailable
        ? "Ready for future execution-record boundary design. No real BrokerExecutionResult was created."
        : partialOnly
          ? "Partial only: conversion preview unavailable."
          : duplicateRisk
            ? "Duplicate risk: idempotency review required."
            : blocked
              ? (previewResult?.blockers[0] ?? "Preview blocked.")
              : "BrokerExecutionResult preview has not produced preview-shaped data.",
    },
    {
      label: "BrokerExecutionResult preview partial only",
      status: hasRun ? (partialOnly ? "warn" : "pass") : "pending",
      message: partialOnly
        ? "Partial only: conversion preview unavailable."
        : hasRun
          ? "Latest preview check did not report partial-only evidence."
          : "No BrokerExecutionResult preview response available yet.",
    },
    {
      label: "BrokerExecutionResult preview duplicate risk",
      status: hasRun ? (duplicateRisk ? "warn" : "pass") : "pending",
      message: duplicateRisk
        ? "Duplicate risk: idempotency review required."
        : hasRun
          ? "Latest preview check did not report duplicate risk."
          : "No BrokerExecutionResult preview response available yet.",
    },
    {
      label: "Preview no real BrokerExecutionResult",
      status: hasRun
        ? noRealBrokerExecutionResult
          ? "pass"
          : "fail"
        : "pending",
      message: noRealBrokerExecutionResult
        ? "No real BrokerExecutionResult was created."
        : "No preview no-real-BrokerExecutionResult metadata is available yet.",
    },
    {
      label: "Preview no execution record",
      status: hasRun ? (noExecutionRecord ? "pass" : "fail") : "pending",
      message: noExecutionRecord
        ? "No execution record was created."
        : "No preview no-execution-record metadata is available yet.",
    },
    {
      label: "Preview no Supabase write",
      status: hasRun ? (noSupabaseWrite ? "pass" : "fail") : "pending",
      message: noSupabaseWrite
        ? "No Supabase write occurred."
        : "No preview no-Supabase-write metadata is available yet.",
    },
    {
      label: "Preview no trade mutation",
      status: hasRun ? (noTradeMutation ? "pass" : "fail") : "pending",
      message: noTradeMutation
        ? "No trade mutation occurred."
        : "No preview no-trade-mutation metadata is available yet.",
    },
  ];
}

export function buildExecutionRecordEligibilityReadinessItems({
  blocked,
  duplicateRisk,
  eligible,
  failed,
  hasRun,
  noBrokerExecutionResult,
  noExecutionRecord,
  noSupabaseWrite,
  noTradeMutation,
  notEligible,
  result,
}: {
  blocked: boolean;
  duplicateRisk: boolean;
  eligible: boolean;
  failed: boolean;
  hasRun: boolean;
  noBrokerExecutionResult: boolean;
  noExecutionRecord: boolean;
  noSupabaseWrite: boolean;
  noTradeMutation: boolean;
  notEligible: boolean;
  result:
    | NonNullable<
        LocalhostBridgeClientExecutionRecordEligibilityResult["response"]
      >["executionRecordEligibility"]
    | null;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "Execution record eligibility status",
      status: hasRun
        ? eligible
          ? "pass"
          : duplicateRisk || notEligible
            ? "warn"
            : blocked || failed
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest execution-record eligibility status: ${result?.status ?? "unknown"}.`
        : "No execution-record eligibility stub check has been run in this modal session.",
    },
    {
      label: "Execution record eligible",
      status: hasRun ? (eligible ? "pass" : "warn") : "pending",
      message: eligible
        ? "Ready for future local execution record preview design. No execution record was created."
        : duplicateRisk
          ? "Duplicate risk: idempotency review required."
          : blocked
            ? (result?.blockers[0] ?? "Execution-record eligibility blocked.")
            : notEligible
              ? "Not eligible for execution-record boundary preview."
              : "Execution-record eligibility has not produced an eligible result.",
    },
    {
      label: "Execution record duplicate risk",
      status: hasRun ? (duplicateRisk ? "warn" : "pass") : "pending",
      message: duplicateRisk
        ? "Duplicate risk detected. Future record creation would require idempotency review."
        : hasRun
          ? "Latest eligibility check did not report duplicate risk."
          : "No execution-record eligibility response available yet.",
    },
    {
      label: "Execution eligibility no BrokerExecutionResult",
      status: hasRun ? (noBrokerExecutionResult ? "pass" : "fail") : "pending",
      message: noBrokerExecutionResult
        ? "No BrokerExecutionResult was created by this eligibility check."
        : "No execution-record no-BrokerExecutionResult metadata is available yet.",
    },
    {
      label: "Execution eligibility no execution record",
      status: hasRun ? (noExecutionRecord ? "pass" : "fail") : "pending",
      message: noExecutionRecord
        ? "No execution record was created."
        : "No execution-record no-record metadata is available yet.",
    },
    {
      label: "Execution eligibility no Supabase write",
      status: hasRun ? (noSupabaseWrite ? "pass" : "fail") : "pending",
      message: noSupabaseWrite
        ? "No Supabase write occurred."
        : "No execution-record no-Supabase-write metadata is available yet.",
    },
    {
      label: "Execution eligibility no trade mutation",
      status: hasRun ? (noTradeMutation ? "pass" : "fail") : "pending",
      message: noTradeMutation
        ? "No trade mutation occurred."
        : "No execution-record no-trade-mutation metadata is available yet.",
    },
  ];
}
