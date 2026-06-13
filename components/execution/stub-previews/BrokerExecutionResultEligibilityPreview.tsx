import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientBrokerExecutionResultEligibilityResult } from "@/lib/avanza-localhost-bridge-client";
import type { AvanzaBrokerExecutionResultEligibilityResult } from "@/lib/avanza-broker-execution-result-eligibility";

type BrokerExecutionResultEligibilityPreviewProps = {
  blocked: boolean;
  canCheck: boolean;
  duplicateRisk: boolean;
  eligible: boolean;
  failed: boolean;
  hasCaptureEvidence: boolean;
  isRunning: boolean;
  message: string;
  noBrokerExecutionResult: boolean;
  noExecutionRecord: boolean;
  noSupabaseWrite: boolean;
  noTradeMutation: boolean;
  notEligible: boolean;
  onCheck: () => void;
  partialOnly: boolean;
  result: LocalhostBridgeClientBrokerExecutionResultEligibilityResult | null;
  eligibility?: AvanzaBrokerExecutionResultEligibilityResult | null;
};

export function BrokerExecutionResultEligibilityPreview({
  blocked,
  canCheck,
  duplicateRisk,
  eligibility,
  eligible,
  failed,
  hasCaptureEvidence,
  isRunning,
  message,
  noBrokerExecutionResult,
  noExecutionRecord,
  noSupabaseWrite,
  noTradeMutation,
  notEligible,
  onCheck,
  partialOnly,
  result,
}: BrokerExecutionResultEligibilityPreviewProps) {
  return (
    <div className="rounded-md border border-violet-300/15 bg-violet-300/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-violet-300/30 bg-violet-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-violet-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-violet-100">
              BrokerExecutionResult eligibility preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only eligibility check. No BrokerExecutionResult. No execution
            record. No Supabase write. No trade mutation.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-violet-100 transition hover:border-violet-200 hover:bg-violet-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning
            ? "Checking..."
            : "Check BrokerExecutionResult eligibility stub"}
        </button>
      </div>

      <SafetyLabelList
        labels={[
          "Eligibility check only",
          "No BrokerExecutionResult created",
          "No execution record",
          "No Supabase write",
          "No trade mutation",
          "Stub only",
        ]}
        tone="violet"
      />

      {!hasCaptureEvidence && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Real eligibility requires broker confirmation capture evidence. This
          stub check may still return synthetic local metadata.
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
              Eligible for future BrokerExecutionResult conversion. Ready for
              future BrokerExecutionResult conversion preview design. No
              conversion happened.
            </p>
          )}

          {partialOnly && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Partial only: manual review required.
            </p>
          )}

          {duplicateRisk && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Duplicate risk detected. Conversion remains blocked until
              idempotency review.
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
                "Eligibility check blocked conversion."}
            </p>
          )}

          {failed && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Eligibility check failed.
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
            <Detail label="Partial only" value={partialOnly ? "Yes" : "No"} />
            <Detail
              label="Duplicate risk"
              value={duplicateRisk ? "Yes" : "No"}
            />
            <Detail
              label="Evidence fingerprint"
              value={eligibility?.evidenceFingerprint ?? "n/a"}
            />
          </div>

          {eligibility?.reasons.length ? (
            <div className="mt-3 rounded-md border border-violet-300/20 bg-violet-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-violet-100">
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
            <SafetyLabelList labels={eligibility.labels} tone="violet" />
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

          {(result.errors.length > 0 ||
            result.warnings.length > 0 ||
            (eligibility?.blockers.length ?? 0) > 0 ||
            (eligibility?.warnings.length ?? 0) > 0 ||
            (eligibility?.errors.length ?? 0) > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(result.errors.length > 0 ||
                (eligibility?.blockers.length ?? 0) > 0 ||
                (eligibility?.errors.length ?? 0) > 0) && (
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
              {(result.warnings.length > 0 ||
                (eligibility?.warnings.length ?? 0) > 0) && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Eligibility warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.warnings,
                      ...(eligibility?.warnings ?? []),
                    ].map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
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
