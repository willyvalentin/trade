"use client";

import { useState } from "react";

import { Detail } from "@/components/execution/handoff-modal-shared";
import type { SemiAutoAgentHandoffPreviewResult } from "@/lib/semi-auto-agent-handoff-preview";
import {
  buildSemiAutoAgentResultCaptureStubResult,
  canShowSemiAutoAgentResultCaptureStub,
  semiAutoAgentResultCaptureStubOptions,
  type SemiAutoAgentResultCaptureStubResult,
  type SemiAutoAgentResultCaptureStubStatus,
} from "@/lib/semi-auto-agent-result-capture-stub";

export type SemiAutoAgentResultCaptureStubProps = {
  agentCommandValue: (
    value: string | number | boolean | null | undefined,
  ) => string;
  onResultChange?: (result: SemiAutoAgentResultCaptureStubResult | null) => void;
  formatShares: (value: number | null | undefined) => string;
  preview: SemiAutoAgentHandoffPreviewResult;
  result?: SemiAutoAgentResultCaptureStubResult | null;
  shortPayloadId: (value: string | null) => string;
};

function resultTone(status: SemiAutoAgentResultCaptureStubStatus) {
  if (status === "user_confirmed") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (
    status === "broker_rejected" ||
    status === "failed" ||
    status === "timeout"
  ) {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (status === "user_cancelled" || status === "capture_not_available") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

export function SemiAutoAgentResultCaptureStub({
  agentCommandValue,
  formatShares,
  onResultChange,
  preview,
  result: controlledResult,
  shortPayloadId,
}: SemiAutoAgentResultCaptureStubProps) {
  const [localResult, setLocalResult] =
    useState<SemiAutoAgentResultCaptureStubResult | null>(null);
  const result = controlledResult === undefined ? localResult : controlledResult;
  const canCapture = canShowSemiAutoAgentResultCaptureStub(preview);
  const disabledReason =
    preview.message || "Result capture stub waits for a valid semi-auto preview.";

  function selectResult(status: SemiAutoAgentResultCaptureStubStatus) {
    if (!canCapture) {
      return;
    }

    const nextResult = buildSemiAutoAgentResultCaptureStubResult(
      preview,
      status,
      {
        now: new Date(),
      },
    );

    setLocalResult(nextResult);
    onResultChange?.(nextResult);
  }

  return (
    <div className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              Local stub only
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
              Semi-auto result capture stub
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Use this to test the future result-capture flow. No Avanza
            confirmation was captured, no broker order was submitted by Ture,
            and no automatic submit is enabled.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
          {canCapture ? "Ready for local stub" : "Blocked"}
        </span>
      </div>

      {!canCapture && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Capture options are disabled because the semi-auto prepare preview is
          not waiting for manual confirmation. {disabledReason}
        </p>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {semiAutoAgentResultCaptureStubOptions.map((option) => (
          <button
            key={option.status}
            type="button"
            disabled={!canCapture}
            onClick={(event) => {
              event.stopPropagation();
              selectResult(option.status);
            }}
            className="min-h-24 rounded-md border border-white/10 bg-black/25 p-3 text-left transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.025] disabled:text-zinc-600"
          >
            <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
              {option.label}
            </span>
            <span className="mt-2 block text-xs leading-5 text-zinc-400">
              {option.description}
            </span>
          </button>
        ))}
      </div>

      {result && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                Local stub result
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {result.message}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${resultTone(
                result.status,
              )}`}
            >
              {agentCommandValue(result.status)}
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Payload" value={shortPayloadId(result.payload_id)} />
            <Detail label="Ticker" value={result.ticker ?? "—"} />
            <Detail label="Action" value={agentCommandValue(result.action)} />
            <Detail label="Quantity" value={formatShares(result.quantity)} />
            <Detail label="Local Only" value={agentCommandValue(result.local_only)} />
            <Detail label="Mock Only" value={agentCommandValue(result.mock_only)} />
            <Detail
              label="No Avanza Confirmation"
              value={agentCommandValue(result.no_avanza_confirmation_captured)}
            />
            <Detail
              label="No Broker Submit"
              value={agentCommandValue(
                result.no_broker_order_submitted_by_ture,
              )}
            />
            <Detail
              label="Auto Submit Enabled"
              value={agentCommandValue(result.automatic_submit_enabled)}
            />
            <Detail
              label="Supabase Write"
              value={agentCommandValue(result.supabase_write_attempted)}
            />
            <Detail
              label="Audit Writer"
              value={agentCommandValue(result.audit_writer_invoked)}
            />
            <Detail
              label="Trade/PnL Mutation"
              value={agentCommandValue(result.trade_stats_pnl_mutated)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
