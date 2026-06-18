import type { ReactNode } from "react";

import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { FinalSettlementNoteMatchingResult } from "@/lib/final-settlement-note-matching-contract";

type FinalSettlementNoteMatchPreviewProps = {
  canRun: boolean;
  isRunning: boolean;
  message: string;
  onRun: () => void;
  result: FinalSettlementNoteMatchingResult | null;
  unavailableReason?: string | null;
};

type Tone = "amber" | "emerald" | "rose" | "sky" | "violet";

function toneClassName(tone: Tone) {
  switch (tone) {
    case "emerald":
      return "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100";
    case "amber":
      return "border-amber-300/20 bg-amber-300/[0.06] text-amber-100";
    case "rose":
      return "border-rose-300/20 bg-rose-300/[0.06] text-rose-100";
    case "sky":
      return "border-sky-300/20 bg-sky-300/[0.06] text-sky-100";
    case "violet":
      return "border-violet-300/20 bg-violet-300/[0.06] text-violet-100";
  }
}

function headingClassName(tone: Tone) {
  switch (tone) {
    case "emerald":
      return "text-emerald-100";
    case "amber":
      return "text-amber-100";
    case "rose":
      return "text-rose-100";
    case "sky":
      return "text-sky-100";
    case "violet":
      return "text-violet-100";
  }
}

function StatusTone({ result }: { result: FinalSettlementNoteMatchingResult }) {
  if (result.status === "matched") {
    return (
      <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
        Match appears strong. Finalization, persistence, execution-record
        creation, and trade mutation remain disabled.
      </p>
    );
  }

  if (
    result.status === "needs_review" ||
    result.status === "insufficient_data" ||
    result.status === "duplicate_candidates"
  ) {
    return (
      <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
        Match requires review. No record was finalized, persisted, created, or
        used to mutate trade state.
      </p>
    );
  }

  return (
    <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
      Match is blocked by mismatch metadata. No finalization, persistence,
      execution-record creation, or trade mutation occurred.
    </p>
  );
}

function InlineList({
  emptyLabel,
  items,
  title,
  tone,
}: {
  emptyLabel: string;
  items: string[];
  title: string;
  tone: Tone;
}) {
  return (
    <div className={`mt-3 rounded-md border p-3 ${toneClassName(tone)}`}>
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${headingClassName(tone)}`}
      >
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-xs leading-5 text-zinc-300">{emptyLabel}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
          {items.map((item) => (
            <li key={item}>{formatAgentCommandLabel(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ResultSection({
  children,
  title,
  tone,
}: {
  children: ReactNode;
  title: string;
  tone: Tone;
}) {
  return (
    <div className={`mt-3 rounded-md border p-3 ${toneClassName(tone)}`}>
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${headingClassName(tone)}`}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function GateRows({ result }: { result: FinalSettlementNoteMatchingResult }) {
  return (
    <div className="mt-3 grid gap-2">
      {result.hardGateResults.map((gate) => (
        <div
          className="rounded-md border border-white/10 bg-black/25 p-3"
          key={gate.gate}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-100">
              {formatAgentCommandLabel(gate.gate)}
            </p>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
                gate.passed
                  ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                  : "border-rose-300/20 bg-rose-300/10 text-rose-100"
              }`}
            >
              {gate.passed ? "Passed" : "Blocked"}
            </span>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Required" value={gate.required ? "Yes" : "No"} />
            <Detail
              label="Mismatch reason"
              value={
                gate.mismatchReason
                  ? formatAgentCommandValue(gate.mismatchReason)
                  : "n/a"
              }
            />
            <Detail
              label="Expected"
              value={formatAgentCommandValue(
                gate.comparison?.expectedValuePreview,
              )}
            />
            <Detail
              label="Actual"
              value={formatAgentCommandValue(
                gate.comparison?.actualValuePreview,
              )}
            />
          </div>
          {gate.comparison?.notes && (
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              {gate.comparison.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function SignalRows({ result }: { result: FinalSettlementNoteMatchingResult }) {
  return (
    <div className="mt-3 grid gap-2">
      {result.softSignalResults.map((signal) => (
        <div
          className="rounded-md border border-white/10 bg-black/25 p-3"
          key={signal.signal}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-100">
              {formatAgentCommandLabel(signal.signal)}
            </p>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
                signal.requiresReview
                  ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                  : signal.supportive === true
                    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                    : "border-sky-300/20 bg-sky-300/10 text-sky-100"
              }`}
            >
              {signal.requiresReview
                ? "Review"
                : signal.supportive === true
                  ? "Supportive"
                  : "Metadata"}
            </span>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Present" value={signal.present ? "Yes" : "No"} />
            <Detail
              label="Supportive"
              value={
                signal.supportive == null
                  ? "n/a"
                  : signal.supportive
                    ? "Yes"
                    : "No"
              }
            />
            <Detail
              label="Expected"
              value={formatAgentCommandValue(
                signal.comparison?.expectedValuePreview,
              )}
            />
            <Detail
              label="Actual"
              value={formatAgentCommandValue(
                signal.comparison?.actualValuePreview,
              )}
            />
          </div>
          {signal.comparison?.notes && (
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              {signal.comparison.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function FinalSettlementNoteMatchPreview({
  canRun,
  isRunning,
  message,
  onRun,
  result,
  unavailableReason,
}: FinalSettlementNoteMatchPreviewProps) {
  return (
    <details className="rounded-md border border-sky-300/15 bg-sky-300/[0.04] p-4">
      <summary className="cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
        Final Settlement Note Match Preview
      </summary>

      <div className="mt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
                Match Preview Only
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                Dev fixture / sandbox only
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Read-only preview of a final settlement note match result. This
              does not finalize a trade, persist data, create an execution
              record, mutate trade state, or interact with Avanza.
            </p>
          </div>

          <button
            className="rounded-md border border-sky-300/30 bg-sky-300/10 px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRun || isRunning}
            onClick={onRun}
            type="button"
          >
            {isRunning
              ? "Running final note match preview..."
              : "Run final note match preview"}
          </button>
        </div>

        <SafetyLabelList
          labels={[
            "Dev preview only",
            "Match result only",
            "Not finalization",
            "Not persistence approval",
            "Not execution record",
            "Does not mutate trade state",
            "safeToFinalize=false",
            "safeToPersist=false",
            "safeToMutateTrade=false",
            "Automatic mode disabled",
            "Manual broker confirmation boundary still applies",
          ]}
          tone="fuchsia"
        />

        {unavailableReason && (
          <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
            {unavailableReason}
          </p>
        )}

        {message && (
          <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
            {message}
          </p>
        )}

        {result && (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
            <StatusTone result={result} />

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Detail
                label="Match status"
                value={formatAgentCommandValue(result.status)}
              />
              <Detail
                label="Confidence"
                value={formatAgentCommandValue(result.confidence)}
              />
              <Detail label="Matched" value={result.matched ? "Yes" : "No"} />
              <Detail
                label="Lifecycle suggestion"
                value={formatAgentCommandValue(
                  result.lifecycleTransitionSuggestion,
                )}
              />
              <Detail
                label="Safe to finalize"
                value={result.safeToFinalize ? "True" : "False"}
              />
              <Detail
                label="Safe to persist"
                value={result.safeToPersist ? "True" : "False"}
              />
              <Detail
                label="Safe to mutate trade"
                value={result.safeToMutateTrade ? "True" : "False"}
              />
              <Detail
                label="Execution record"
                value={result.executionRecordCreated ? "Created" : "Not created"}
              />
            </div>

            <ResultSection title="Lifecycle metadata only" tone="sky">
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Lifecycle transition suggestion is displayed as metadata only.
                This preview does not transition lifecycle state, finalize a
                trade, persist a record, create an execution record, append
                audit, mutate trade state, run browser automation, or interact
                with Avanza.
              </p>
            </ResultSection>

            <ResultSection title="Hard gates" tone="sky">
              <GateRows result={result} />
            </ResultSection>

            <ResultSection title="Soft signals" tone="violet">
              <SignalRows result={result} />
            </ResultSection>

            <div className="grid gap-3 lg:grid-cols-2">
              <InlineList
                emptyLabel="No mismatch reasons."
                items={result.mismatchReasons}
                title="Mismatch reasons"
                tone="rose"
              />
              <InlineList
                emptyLabel="No duplicate reasons."
                items={result.duplicateReasons}
                title="Duplicate reasons"
                tone="amber"
              />
              <InlineList
                emptyLabel="No review flags."
                items={result.reviewFlags}
                title="Review flags"
                tone="violet"
              />
              <InlineList
                emptyLabel="No warnings."
                items={result.warnings}
                title="Warnings"
                tone="amber"
              />
            </div>

            <ResultSection title="Partial-fill and missing data" tone="amber">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Partial-fill status"
                  value={formatAgentCommandValue(
                    result.partialFillMatchingStatus,
                  )}
                />
                <Detail
                  label="Insufficient data"
                  value={
                    result.status === "insufficient_data" ? "Present" : "None"
                  }
                />
                <Detail
                  label="Hard gates blocked"
                  value={String(
                    result.hardGateResults.filter((gate) => gate.blocked)
                      .length,
                  )}
                />
                <Detail
                  label="Soft reviews"
                  value={String(
                    result.softSignalResults.filter(
                      (signal) => signal.requiresReview,
                    ).length,
                  )}
                />
              </div>
            </ResultSection>

            <ResultSection title="Evidence comparison" tone="emerald">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Provisional evidence" value="Immediate readback fixture" />
                <Detail label="Final note evidence" value="Settlement note fixture" />
                <Detail label="Note reference" value="AVZ-FINAL-NOTE-FIXTURE-001" />
                <Detail label="Instrument" value="Ericsson B / ERIC B" />
                <Detail label="Side" value="buy" />
                <Detail label="Quantity" value="12 vs 12" />
                <Detail label="Price" value="86.5 SEK vs 86.5 SEK" />
                <Detail label="Currency" value="SEK" />
                <Detail label="Account/category" value="Masked ISK / ****1234" />
                <Detail label="Execution time" value="10:00 vs 10:03" />
                <Detail label="Market/venue" value="XSTO" />
                <Detail label="Order type" value="limit" />
              </div>
            </ResultSection>

            <ResultSection title="Provenance and source comparison" tone="sky">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Handoff fingerprint"
                  value="final-note-match-dev-fixture-handoff-001"
                />
                <Detail
                  label="Provisional fingerprint"
                  value="final-note-match-dev-fixture-immediate-evidence-001"
                />
                <Detail
                  label="Final note fingerprint"
                  value="final-note-match-dev-fixture-final-evidence-001"
                />
                <Detail
                  label="Source"
                  value="production safe candidate fixture"
                />
              </div>
            </ResultSection>

            <ResultSection title="Safety policy" tone="rose">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Matching implementation"
                  value={
                    result.safetyPolicy.matchingImplementationEnabled
                      ? "Pure validator only"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Finalization"
                  value={
                    result.safetyPolicy.finalizationImplementationEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Capture"
                  value={
                    result.safetyPolicy.captureImplementationEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Execution record creation"
                  value={
                    result.safetyPolicy.executionRecordCreationEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Persistence attempted"
                  value={result.persistenceAttempted ? "Attempted" : "Not attempted"}
                />
                <Detail
                  label="Finalization attempted"
                  value={result.finalizationAttempted ? "Attempted" : "Not attempted"}
                />
                <Detail
                  label="Trade mutation attempted"
                  value={result.tradeMutationAttempted ? "Attempted" : "Not attempted"}
                />
                <Detail
                  label="Browser automation"
                  value={
                    result.browserAutomationAttempted
                      ? "Attempted"
                      : "Not attempted"
                  }
                />
              </div>
            </ResultSection>
          </div>
        )}
      </div>
    </details>
  );
}
