"use client";

import { useState } from "react";

import { Detail } from "@/components/execution/handoff-modal-shared";
import {
  buildSemiAutoAgentDevFlowReview,
  type SemiAutoAgentDevFlowReviewSafetyCheck,
} from "@/lib/semi-auto-agent-dev-flow-review";
import {
  appendSemiAutoAgentLocalDevFlowEvent,
  buildSemiAutoAgentLocalDevFlowEvent,
  readSemiAutoAgentLocalDevFlowEvents,
} from "@/lib/semi-auto-agent-local-dev-flow-store";
import type { SemiAutoAgentHandoffPreviewResult } from "@/lib/semi-auto-agent-handoff-preview";
import type { SemiAutoAgentResultCaptureStubResult } from "@/lib/semi-auto-agent-result-capture-stub";

export type SemiAutoAgentDevFlowReviewPanelProps = {
  agentCommandValue: (
    value: string | number | boolean | null | undefined,
  ) => string;
  captureResult: SemiAutoAgentResultCaptureStubResult | null;
  formatShares: (value: number | null | undefined) => string;
  preview: SemiAutoAgentHandoffPreviewResult;
  shortPayloadId: (value: string | null) => string;
};

function stateTone(status: string) {
  if (status === "waiting_for_manual_confirmation" || status === "completed_local") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (
    status === "payload_blocked" ||
    status === "broker_rejected_local" ||
    status === "failed_local" ||
    status === "timeout_local"
  ) {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (status === "unknown_needs_review" || status === "cancelled_local") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

function SafetyCheckPill({
  agentCommandValue,
  check,
}: {
  agentCommandValue: SemiAutoAgentDevFlowReviewPanelProps["agentCommandValue"];
  check: SemiAutoAgentDevFlowReviewSafetyCheck;
}) {
  const tone = check.passed
    ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
    : "border-amber-300/25 bg-amber-300/10 text-amber-100";

  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-zinc-200">{check.label}</p>
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${tone}`}
        >
          {check.passed ? "Passed" : "Review"}
        </span>
      </div>
      <p className="mt-2 font-mono text-xs text-zinc-400">
        {agentCommandValue(check.value)}
      </p>
    </div>
  );
}

export function SemiAutoAgentDevFlowReviewPanel({
  agentCommandValue,
  captureResult,
  formatShares,
  preview,
  shortPayloadId,
}: SemiAutoAgentDevFlowReviewPanelProps) {
  const review = buildSemiAutoAgentDevFlowReview(preview, captureResult);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  function saveLocalDevFlowEvent() {
    const event = buildSemiAutoAgentLocalDevFlowEvent(review, {
      now: new Date(),
    });
    const saved = appendSemiAutoAgentLocalDevFlowEvent(event);
    const readResult = readSemiAutoAgentLocalDevFlowEvents();

    setSavedCount(readResult.items.length);
    setSaveMessage(
      saved
        ? "Saved locally only. Not sent to Supabase, not an audit record, and no broker action was taken."
        : "Local save was not available. Nothing was sent to Supabase, no audit record was written, and no broker action was taken.",
    );
  }

  return (
    <div className="rounded-md border border-sky-300/15 bg-sky-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
              Dev/local review only
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
              Semi-auto dev flow review
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only review of the local semi-auto flow. No Avanza order was
            placed, no broker submit was attempted, and final confirmation
            remains manual.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${stateTone(
            review.state.status,
          )}`}
        >
          {agentCommandValue(review.state.status)}
        </span>
      </div>

      {!review.hasActivePreview ? (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-400">
          Quiet empty state: choose a ready semi-auto handoff to inspect the
          local dev flow.
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Payload" value={shortPayloadId(review.payloadId)} />
            <Detail label="Ticker" value={review.ticker ?? "—"} />
            <Detail label="Action" value={agentCommandValue(review.action)} />
            <Detail label="Quantity" value={formatShares(review.quantity)} />
            <Detail
              label="Mock Adapter"
              value={agentCommandValue(review.adapterStatus)}
            />
            <Detail
              label="Manual Waiting"
              value={agentCommandValue(
                review.state.status === "waiting_for_manual_confirmation",
              )}
            />
            <Detail
              label="Local Result"
              value={agentCommandValue(review.localResultStatus)}
            />
            <Detail
              label="Terminal Outcome"
              value={agentCommandValue(review.terminalOutcome)}
            />
            <Detail
              label="Terminal"
              value={agentCommandValue(review.state.terminal)}
            />
          </div>

          <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100">
              Safety invariant checklist
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {review.safetyChecks.map((check) => (
                <SafetyCheckPill
                  agentCommandValue={agentCommandValue}
                  check={check}
                  key={check.label}
                />
              ))}
            </div>
          </div>

          {review.blockedReasons.length > 0 && (
            <div className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                Blocked or stale reasons
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                {review.blockedReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {review.warnings.length > 0 && (
            <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                Warnings
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                {review.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100">
                  Local dev flow persistence
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Save this review snapshot to browser localStorage only. Not
                  sent to Supabase, not an audit record, and no broker action.
                </p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  saveLocalDevFlowEvent();
                }}
                className="min-h-10 rounded-md border border-sky-300/30 bg-sky-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-sky-100 transition hover:border-sky-200/50 hover:bg-sky-300/15"
              >
                Save local dev flow event
              </button>
            </div>
            {saveMessage && (
              <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
                {saveMessage}
                {savedCount !== null
                  ? ` Latest local dev flow event count: ${savedCount}.`
                  : ""}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
