import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientExecutionRecordEligibilityResult } from "@/lib/avanza-localhost-bridge-client";

type ExecutionRecordEligibilityPreviewProps = {
  canCheck: boolean;
  candidateIsPreviewOnly: boolean;
  hasPreviewCandidate: boolean;
  isRunning: boolean;
  message: string;
  noBrokerExecutionResult: boolean;
  noExecutionRecord: boolean;
  noSupabaseWrite: boolean;
  noTradeMutation: boolean;
  onCheck: () => void;
  result: LocalhostBridgeClientExecutionRecordEligibilityResult | null;
};

export function ExecutionRecordEligibilityPreview({
  canCheck,
  candidateIsPreviewOnly,
  hasPreviewCandidate,
  isRunning,
  message,
  noBrokerExecutionResult,
  noExecutionRecord,
  noSupabaseWrite,
  noTradeMutation,
  onCheck,
  result,
}: ExecutionRecordEligibilityPreviewProps) {
  const eligibility = result?.response?.executionRecordEligibility ?? null;
  const eligible = eligibility?.ok === true && eligibility.status === "eligible";
  const duplicateRisk = eligibility?.status === "duplicate_risk";
  const notEligible = eligibility?.status === "not_eligible";
  const blocked = eligibility?.status === "blocked";
  const failed = eligibility?.status === "failed";
  const hasBlockers =
    Boolean(result?.errors.length) ||
    Boolean(eligibility?.blockers.length) ||
    Boolean(eligibility?.errors.length);
  const hasWarnings =
    Boolean(result?.warnings.length) ||
    Boolean(eligibility?.warnings.length);

  return (
    <div className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
              Execution record eligibility preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only eligibility check. No execution record. No Supabase write.
            No trade mutation.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning ? "Checking..." : "Check execution-record eligibility stub"}
        </button>
      </div>

      <SafetyLabelList
        labels={[
          "Execution record eligibility only",
          "No execution record",
          "No Supabase write",
          "No trade mutation",
          "No BrokerExecutionResult",
          "Stub only",
        ]}
        tone="emerald"
      />

      {!hasPreviewCandidate && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Real execution-record eligibility requires a non-preview
          BrokerExecutionResult candidate. This stub check may still return
          synthetic local metadata.
        </p>
      )}

      {candidateIsPreviewOnly && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Latest candidate is preview-only; default eligibility should block it
          unless the stub returns a synthetic eligible response.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      {result && (
        <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
          <p className="text-sm leading-6 text-zinc-200">{result.summary}</p>

          {eligible && (
            <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
              Eligible for future local execution record creation. Ready for
              future local execution record preview design. No execution record
              was created.
            </p>
          )}

          {duplicateRisk && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Duplicate risk detected. Idempotency review is required before
              any future local execution record preview design.
            </p>
          )}

          {notEligible && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Not eligible.
            </p>
          )}

          {blocked && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Blocked: not eligible.{" "}
              {eligibility?.blockers[0] ??
                eligibility?.errors[0] ??
                "Execution record eligibility is blocked."}
            </p>
          )}

          {failed && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Execution record eligibility check failed.
            </p>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Status"
              value={result.status ? formatAgentCommandValue(result.status) : "unknown"}
            />
            <Detail label="Client OK" value={result.ok ? "Yes" : "No"} />
            <Detail
              label="HTTP"
              value={result.statusCode ? String(result.statusCode) : "n/a"}
            />
            <Detail label="Elapsed" value={`${result.elapsedMs}ms`} />
            <Detail label="Eligible" value={eligible ? "Yes" : "No"} />
            <Detail
              label="Duplicate risk"
              value={duplicateRisk ? "Yes" : "No"}
            />
            <Detail
              label="Record fingerprint"
              value={eligibility?.recordFingerprint ?? "n/a"}
            />
            <Detail
              label="Candidate"
              value={hasPreviewCandidate ? "Present" : "None"}
            />
          </div>

          {eligibility?.reasons.length ? (
            <div className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">
                Eligibility reasons
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                {eligibility.reasons.map((reason) => (
                  <li key={reason}>{formatAgentCommandLabel(reason)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {eligibility?.labels.length ? (
            <SafetyLabelList labels={eligibility.labels} tone="emerald" />
          ) : null}

          {result.response?.metadata && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Detail
                label="No BrokerExecutionResult"
                value={noBrokerExecutionResult ? "Yes" : "No"}
              />
              <Detail
                label="No Execution Record"
                value={noExecutionRecord ? "Yes" : "No"}
              />
              <Detail
                label="No Supabase Write"
                value={noSupabaseWrite ? "Yes" : "No"}
              />
              <Detail
                label="No Trade Mutation"
                value={noTradeMutation ? "Yes" : "No"}
              />
            </div>
          )}

          {(hasBlockers || hasWarnings) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {hasBlockers && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Eligibility blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.errors,
                      ...(eligibility?.blockers ?? []),
                      ...(eligibility?.errors ?? []),
                    ].map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {hasWarnings && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Eligibility warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[...result.warnings, ...(eligibility?.warnings ?? [])].map(
                      (warning) => (
                        <li key={warning}>{warning}</li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
