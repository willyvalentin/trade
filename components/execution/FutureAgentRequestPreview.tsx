import type {
  AvanzaAgentAdapterValidationResult,
  AvanzaAgentRequest,
} from "@/lib/avanza-agent-adapter";
import { Detail } from "@/components/execution/handoff-modal-shared";

export type FutureAgentRequestPreviewProps = {
  agentCommandValue: (
    value: string | number | boolean | null | undefined,
  ) => string;
  executionDevToolsEnabled: boolean;
  formatShares: (value: number | null | undefined) => string;
  previewError?: string | null;
  request: AvanzaAgentRequest | null;
  requestValidation: AvanzaAgentAdapterValidationResult | null;
  requestValidationStatus: "ok" | "warning" | "invalid";
  requestValidationTone: (status: "ok" | "warning" | "invalid") => string;
  shortPayloadId: (value: string | null) => string;
  ticker: string;
  quantity: number | null | undefined;
};

export function FutureAgentRequestPreview({
  agentCommandValue,
  executionDevToolsEnabled,
  formatShares,
  previewError,
  request,
  requestValidation,
  requestValidationStatus,
  requestValidationTone,
  shortPayloadId,
  ticker,
  quantity,
}: FutureAgentRequestPreviewProps) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
            Future agent request
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Preview of the typed payload Ture would send to a future Avanza
            browser agent. No broker agent is connected in this build, and this
            preview is not a live order.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${requestValidationTone(
            requestValidationStatus,
          )}`}
        >
          {requestValidationStatus === "ok"
            ? "Valid"
            : requestValidationStatus === "warning"
              ? "Warnings"
              : "Unavailable"}
        </span>
      </div>

      {request ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Version" value={request.version} />
            <Detail label="Request" value={shortPayloadId(request.requestId)} />
            <Detail label="Broker" value={agentCommandValue(request.broker)} />
            <Detail label="Mode" value={agentCommandValue(request.mode)} />
            <Detail label="Action" value={agentCommandValue(request.action)} />
            <Detail label="Ticker" value={ticker} />
            <Detail label="Quantity" value={formatShares(quantity)} />
            <Detail
              label="Manual Final"
              value={agentCommandValue(request.requireManualFinalConfirmation)}
            />
            <Detail
              label="Auto Submit"
              value={agentCommandValue(request.allowAutomaticFinalSubmit)}
            />
          </div>

          <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
            {request.mode === "automatic"
              ? "Automatic final submit authority is enabled only when handoff safety checks pass. No broker agent is connected in this build."
              : "Manual final confirmation required. A future agent may fill the order form, but you must press final KÖP/SÄLJ."}
          </p>

          {requestValidation &&
            (requestValidation.errors.length > 0 ||
              requestValidation.warnings.length > 0) && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {requestValidation.errors.length > 0 && (
                  <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                      Errors
                    </p>
                    <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                      {requestValidation.errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {requestValidation.warnings.length > 0 && (
                  <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                      Warnings
                    </p>
                    <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                      {requestValidation.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          {executionDevToolsEnabled && (
            <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
              <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                Request JSON - future-agent payload only
              </summary>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
                {JSON.stringify(request, null, 2)}
              </pre>
            </details>
          )}
        </>
      ) : (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          {previewError ??
            "Future agent request preview is unavailable for this handoff."}
        </p>
      )}
    </div>
  );
}
