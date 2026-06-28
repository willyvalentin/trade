import { Detail } from "@/components/execution/handoff-modal-shared";
import type { SemiAutoAgentHandoffPreviewResult } from "@/lib/semi-auto-agent-handoff-preview";

export type SemiAutoAgentHandoffPreviewProps = {
  agentCommandValue: (
    value: string | number | boolean | null | undefined,
  ) => string;
  formatCurrency: (value: number | null | undefined) => string;
  formatShares: (value: number | null | undefined) => string;
  preview: SemiAutoAgentHandoffPreviewResult;
  shortPayloadId: (value: string | null) => string;
};

function previewTone(status: SemiAutoAgentHandoffPreviewResult["status"]) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "blocked") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

export function SemiAutoAgentHandoffPreview({
  agentCommandValue,
  formatCurrency,
  formatShares,
  preview,
  shortPayloadId,
}: SemiAutoAgentHandoffPreviewProps) {
  const adapter = preview.adapterResult;
  const prepared = adapter?.prepared_order_summary ?? null;
  const payload = preview.payloadResult?.payload ?? null;

  return (
    <div className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
            Mock semi-auto agent preview
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            This is a non-executing semi-auto preview. No Avanza order has been
            placed, no automatic submit is enabled, and final broker
            confirmation remains manual.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${previewTone(
            preview.status,
          )}`}
        >
          {agentCommandValue(
            adapter?.status ?? preview.status,
          )}
        </span>
      </div>

      {adapter && payload ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Adapter" value={agentCommandValue(adapter.adapter_mode)} />
            <Detail label="Payload" value={shortPayloadId(payload.payload_id)} />
            <Detail label="Ticker" value={payload.ticker} />
            <Detail label="Action" value={agentCommandValue(payload.action)} />
            <Detail label="Quantity" value={formatShares(payload.quantity)} />
            <Detail label="Order Type" value={agentCommandValue(payload.order_type)} />
            <Detail
              label="Entry"
              value={formatCurrency(prepared?.entry_price ?? payload.entry_price)}
            />
            <Detail
              label="Limit"
              value={formatCurrency(prepared?.limit_price ?? payload.limit_price)}
            />
            <Detail label="Stop" value={formatCurrency(payload.stop_price)} />
            <Detail label="Target" value={formatCurrency(payload.target_price)} />
            <Detail
              label="Risk"
              value={formatCurrency(payload.total_planned_risk)}
            />
            <Detail
              label="Manual Final"
              value={agentCommandValue(
                adapter.manual_final_confirmation_required,
              )}
            />
            <Detail
              label="Auto Submit Attempted"
              value={agentCommandValue(adapter.automatic_submit_attempted)}
            />
            <Detail
              label="Auto Submit Allowed"
              value={agentCommandValue(adapter.automatic_submit_allowed)}
            />
          </div>

          <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
            {preview.message}
          </p>

          {(adapter.errors.length > 0 || adapter.warnings.length > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {adapter.errors.length > 0 && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {adapter.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {adapter.warnings.length > 0 && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {adapter.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          {preview.message}
        </p>
      )}
    </div>
  );
}
