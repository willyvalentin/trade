import {
  Detail,
  SafetyLabelList,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientBrokerExecutionResultPreviewResult } from "@/lib/avanza-localhost-bridge-client";

type BrokerExecutionResultPreviewProps = {
  canCheck: boolean;
  formatTimestamp: (value: string | null | undefined) => string;
  hasCaptureOrEligibilityEvidence: boolean;
  isRunning: boolean;
  message: string;
  noExecutionRecord: boolean;
  noRealBrokerExecutionResult: boolean;
  noSupabaseWrite: boolean;
  noTradeMutation: boolean;
  onCheck: () => void;
  result: LocalhostBridgeClientBrokerExecutionResultPreviewResult | null;
};

export function BrokerExecutionResultPreview({
  canCheck,
  formatTimestamp,
  hasCaptureOrEligibilityEvidence,
  isRunning,
  message,
  noExecutionRecord,
  noRealBrokerExecutionResult,
  noSupabaseWrite,
  noTradeMutation,
  onCheck,
  result,
}: BrokerExecutionResultPreviewProps) {
  const previewResult = result?.response?.brokerExecutionResultPreview ?? null;
  const previewShape = previewResult?.preview ?? null;
  const previewAvailable =
    previewResult?.ok === true && previewResult.status === "preview_available";
  const partialOnly = previewResult?.status === "partial_only";
  const duplicateRisk = previewResult?.status === "duplicate_risk";
  const notEligible = previewResult?.status === "not_eligible";
  const blocked = previewResult?.status === "blocked";
  const failed = previewResult?.status === "failed";
  const previewOnly =
    previewResult?.metadata?.previewOnly === true ||
    previewShape?.metadata?.previewOnly === true;
  const hasBlockers =
    Boolean(result?.errors.length) ||
    Boolean(previewResult?.blockers.length) ||
    Boolean(previewResult?.errors.length);
  const hasWarnings =
    Boolean(result?.warnings.length) ||
    Boolean(previewResult?.warnings.length);

  return (
    <div className="rounded-md border border-fuchsia-300/15 bg-fuchsia-300/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-100">
              BrokerExecutionResult conversion preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only stub check. Preview only. No real BrokerExecutionResult
            created.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200 hover:bg-fuchsia-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning ? "Checking..." : "Check BrokerExecutionResult preview stub"}
        </button>
      </div>

      <SafetyLabelList
        labels={[
          "BrokerExecutionResult preview only",
          "Not a real BrokerExecutionResult",
          "No execution record",
          "No Supabase write",
          "No trade mutation",
          "Stub only",
        ]}
        tone="fuchsia"
      />

      {!hasCaptureOrEligibilityEvidence && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Real preview conversion requires eligible broker confirmation capture
          evidence. This stub check may still return synthetic local metadata.
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

          {previewAvailable && (
            <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
              Preview available. Ready for future execution-record boundary
              design. No real BrokerExecutionResult was created.
            </p>
          )}
          {partialOnly && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Partial only: no preview conversion.
            </p>
          )}
          {duplicateRisk && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Duplicate risk. Idempotency review required before any future
              conversion boundary.
            </p>
          )}
          {notEligible && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Not eligible.
            </p>
          )}
          {blocked && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Preview blocked.{" "}
              {previewResult?.blockers[0] ??
                previewResult?.errors[0] ??
                "Preview conversion is blocked."}
            </p>
          )}
          {failed && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Preview failed.
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
            <Detail
              label="Preview available"
              value={previewAvailable ? "Yes" : "No"}
            />
            <Detail label="Partial only" value={partialOnly ? "Yes" : "No"} />
            <Detail
              label="Duplicate risk"
              value={duplicateRisk ? "Yes" : "No"}
            />
            <Detail
              label="Preview shape"
              value={previewShape ? "Present" : "None"}
            />
          </div>

          {previewShape && (
            <div className="mt-3 rounded-md border border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-100">
                BrokerExecutionResult-shaped preview data
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Broker" value={previewShape.broker} />
                <Detail
                  label="Action"
                  value={formatAgentCommandValue(previewShape.action)}
                />
                <Detail label="Ticker" value={previewShape.ticker} />
                <Detail label="Quantity" value={String(previewShape.quantity)} />
                <Detail label="Price" value={String(previewShape.price)} />
                <Detail
                  label="Fees"
                  value={
                    typeof previewShape.fees === "number"
                      ? String(previewShape.fees)
                      : "n/a"
                  }
                />
                <Detail
                  label="Total Amount"
                  value={
                    typeof previewShape.totalAmount === "number"
                      ? String(previewShape.totalAmount)
                      : "n/a"
                  }
                />
                <Detail
                  label="Timestamp"
                  value={
                    previewShape.timestamp
                      ? formatTimestamp(previewShape.timestamp)
                      : "n/a"
                  }
                />
                <Detail
                  label="Broker order id"
                  value={previewShape.brokerOrderId ?? "n/a"}
                />
                <Detail
                  label="Source capture fingerprint"
                  value={previewShape.sourceCaptureFingerprint}
                />
              </div>
            </div>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="PreviewOnly" value={previewOnly ? "Yes" : "No"} />
            <Detail
              label="Not BrokerExecutionResult"
              value={noRealBrokerExecutionResult ? "Yes" : "No"}
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

          {previewResult?.labels.length ? (
            <SafetyLabelList labels={previewResult.labels} tone="fuchsia" />
          ) : null}

          {(hasBlockers || hasWarnings) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {hasBlockers && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Preview blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.errors,
                      ...(previewResult?.blockers ?? []),
                      ...(previewResult?.errors ?? []),
                    ].map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {hasWarnings && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Preview warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[...result.warnings, ...(previewResult?.warnings ?? [])].map(
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
