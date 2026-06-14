import {
  getAvanzaDryRunSafetyLabels,
  summarizeAvanzaDryRunOrderInput,
} from "@/lib/avanza-dry-run-request-contract";
import {
  summarizeExecutionIntentToAvanzaDryRunResult,
  type ExecutionIntentToAvanzaDryRunResult,
} from "@/lib/execution-intent-to-avanza-dry-run";
import { Detail } from "@/components/execution/handoff-modal-shared";

export type AvanzaDryRunRequestPreviewProps = {
  agentCommandValue: (
    value: string | number | boolean | null | undefined,
  ) => string;
  formatCurrency: (value: number | null | undefined) => string;
  formatShares: (value: number | null | undefined) => string;
  preview: ExecutionIntentToAvanzaDryRunResult;
  requestValidationTone: (status: "ok" | "warning" | "invalid") => string;
  shortPayloadId: (value: string | null) => string;
};

export function AvanzaDryRunRequestPreview({
  agentCommandValue,
  formatCurrency,
  formatShares,
  preview,
  requestValidationTone,
  shortPayloadId,
}: AvanzaDryRunRequestPreviewProps) {
  return (
    <div className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
              Avanza dry-run request preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only preview. No Avanza runner exists. No broker submission.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${requestValidationTone(
            preview.ok ? (preview.warnings.length > 0 ? "warning" : "ok") : "invalid",
          )}`}
        >
          {preview.ok
            ? preview.warnings.length > 0
              ? "Warnings"
              : "Valid"
            : "Unavailable"}
        </span>
      </div>

      {preview.request ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Action"
              value={agentCommandValue(preview.request.action)}
            />
            <Detail label="Ticker" value={preview.request.instrument.ticker} />
            <Detail
              label="Instrument"
              value={preview.request.instrument.name ?? "—"}
            />
            <Detail
              label="Quantity"
              value={formatShares(preview.request.quantity)}
            />
            <Detail label="Price" value={formatCurrency(preview.request.price)} />
            <Detail
              label="Order Mode"
              value={agentCommandValue(preview.request.orderMode)}
            />
            <Detail
              label="Account Policy"
              value={agentCommandValue(preview.request.accountPolicy)}
            />
            <Detail
              label="Stop Policy"
              value={agentCommandValue(preview.request.stopPolicy)}
            />
            <Detail
              label="Source Recommendation"
              value={shortPayloadId(
                preview.request.sourceRecommendationId ?? null,
              )}
            />
            <Detail
              label="Execution Intent"
              value={shortPayloadId(preview.request.executionIntentId ?? null)}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {getAvanzaDryRunSafetyLabels(preview.request).map((label) => (
              <span
                className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100"
                key={label}
              >
                {label}
              </span>
            ))}
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
              Final confirm disabled
            </span>
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
              Manual account review
            </span>
          </div>

          <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-400">
            {summarizeAvanzaDryRunOrderInput(preview.request)}. This preview
            does not create a browser runner, navigate to Avanza, submit orders,
            create broker results, write Supabase, or mutate trades.
          </p>
        </>
      ) : (
        <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
            Dry-run request unavailable
          </p>
          <p className="mt-2 text-xs leading-5 text-zinc-300">
            {summarizeExecutionIntentToAvanzaDryRunResult(preview)}
          </p>
        </div>
      )}

      {(preview.errors.length > 0 || preview.warnings.length > 0) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {preview.errors.length > 0 && (
            <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                Dry-run errors
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                {preview.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {preview.warnings.length > 0 && (
            <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                Dry-run warnings
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                {preview.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
