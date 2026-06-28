import type { SemiAutoAgentHandoffPreviewResult } from "@/lib/semi-auto-agent-handoff-preview";

export type SemiAutoAgentResultCaptureStubStatus =
  | "user_confirmed"
  | "user_cancelled"
  | "broker_rejected"
  | "unknown_needs_review"
  | "failed"
  | "timeout"
  | "capture_not_available";

export type SemiAutoAgentResultCaptureStubOption = {
  status: SemiAutoAgentResultCaptureStubStatus;
  label: string;
  description: string;
};

export type SemiAutoAgentResultCaptureStubResult = {
  status: SemiAutoAgentResultCaptureStubStatus;
  label: string;
  message: string;
  payload_id: string | null;
  payload_fingerprint: string | null;
  ticker: string | null;
  action: "buy" | "sell" | null;
  quantity: number | null;
  captured_at: string;
  local_only: true;
  mock_only: true;
  no_avanza_confirmation_captured: true;
  no_broker_order_submitted_by_ture: true;
  automatic_submit_enabled: false;
  supabase_write_attempted: false;
  audit_writer_invoked: false;
  trade_stats_pnl_mutated: false;
};

export const semiAutoAgentResultCaptureStubOptions: readonly SemiAutoAgentResultCaptureStubOption[] =
  [
    {
      status: "user_confirmed",
      label: "User confirmed manually",
      description: "Local stub state for a manually confirmed broker action.",
    },
    {
      status: "user_cancelled",
      label: "User cancelled",
      description: "Local stub state for a user-cancelled broker flow.",
    },
    {
      status: "broker_rejected",
      label: "Broker rejected",
      description: "Local stub state for a rejected broker confirmation.",
    },
    {
      status: "unknown_needs_review",
      label: "Unknown / needs review",
      description: "Local stub state for an unclear broker outcome.",
    },
    {
      status: "failed",
      label: "Failed",
      description: "Local stub state for a failed capture flow.",
    },
    {
      status: "timeout",
      label: "Timeout",
      description: "Local stub state for a timed-out capture flow.",
    },
    {
      status: "capture_not_available",
      label: "Capture not available",
      description: "Local stub state when no safe capture channel exists.",
    },
  ];

function validTimestamp(value: string | Date | undefined): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" && Number.isFinite(Date.parse(value))) {
    return value;
  }

  return new Date(0).toISOString();
}

export function canShowSemiAutoAgentResultCaptureStub(
  preview: SemiAutoAgentHandoffPreviewResult,
): boolean {
  return (
    preview.status === "ready" &&
    preview.adapterResult?.status === "waiting_for_manual_confirmation" &&
    preview.payloadResult?.status === "ready"
  );
}

export function buildSemiAutoAgentResultCaptureStubResult(
  preview: SemiAutoAgentHandoffPreviewResult,
  status: SemiAutoAgentResultCaptureStubStatus,
  options: { now?: string | Date } = {},
): SemiAutoAgentResultCaptureStubResult {
  const option = semiAutoAgentResultCaptureStubOptions.find(
    (item) => item.status === status,
  );
  const adapter = preview.adapterResult;
  const payload = preview.payloadResult?.payload ?? null;
  const label = option?.label ?? "Unknown / needs review";

  return {
    status,
    label,
    message: `${label} recorded as a local stub only. No Avanza confirmation was captured and no broker order was submitted by Ture.`,
    payload_id: payload?.payload_id ?? adapter?.payload_id ?? null,
    payload_fingerprint:
      payload?.payload_fingerprint ?? adapter?.payload_fingerprint ?? null,
    ticker: payload?.ticker ?? adapter?.ticker ?? null,
    action: payload?.action ?? adapter?.action ?? null,
    quantity: payload?.quantity ?? adapter?.quantity ?? null,
    captured_at: validTimestamp(options.now),
    local_only: true,
    mock_only: true,
    no_avanza_confirmation_captured: true,
    no_broker_order_submitted_by_ture: true,
    automatic_submit_enabled: false,
    supabase_write_attempted: false,
    audit_writer_invoked: false,
    trade_stats_pnl_mutated: false,
  };
}
