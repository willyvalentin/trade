import type { AvanzaAgentRequest } from "@/lib/avanza-agent-adapter";
import type {
  AvanzaAgentBridgeEnvelope,
  AvanzaAgentBridgeEnvelopeValidationResult,
} from "@/lib/avanza-agent-bridge";
import { Detail } from "@/components/execution/handoff-modal-shared";

export type BridgeRequestEnvelopePreviewProps = {
  agentCommandValue: (
    value: string | number | boolean | null | undefined,
  ) => string;
  envelope: AvanzaAgentBridgeEnvelope | null;
  envelopeValidation: AvanzaAgentBridgeEnvelopeValidationResult | null;
  envelopeValidationStatus: "ok" | "warning" | "invalid";
  getTransportDisplayLabel: (
    transport: AvanzaAgentBridgeEnvelope["transport"],
  ) => string;
  previewError?: string | null;
  request: AvanzaAgentRequest;
  requestValidationTone: (status: "ok" | "warning" | "invalid") => string;
  shortPayloadId: (value: string | null) => string;
  ticker: string;
};

export function BridgeRequestEnvelopePreview({
  agentCommandValue,
  envelope,
  envelopeValidation,
  envelopeValidationStatus,
  getTransportDisplayLabel,
  previewError,
  request,
  requestValidationTone,
  shortPayloadId,
  ticker,
}: BridgeRequestEnvelopePreviewProps) {
  return (
    <div className="rounded-md border border-violet-300/15 bg-violet-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-violet-300/30 bg-violet-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-violet-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-violet-100">
              Bridge request envelope
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Local boundary payload a future external Avanza agent bridge would
            receive. No transport is connected, the envelope is not sent
            anywhere, and this is not a live order.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${requestValidationTone(
            envelopeValidationStatus,
          )}`}
        >
          {envelopeValidationStatus === "ok"
            ? "Valid"
            : envelopeValidationStatus === "warning"
              ? "Warnings"
              : "Unavailable"}
        </span>
      </div>

      {envelope ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Envelope Version" value={envelope.version} />
            <Detail label="Envelope" value={shortPayloadId(envelope.envelopeId)} />
            <Detail label="Type" value={agentCommandValue(envelope.type)} />
            <Detail
              label="Transport"
              value={getTransportDisplayLabel(envelope.transport)}
            />
            <Detail
              label="Request"
              value={shortPayloadId(envelope.requestId ?? null)}
            />
            <Detail label="Payload Version" value={request.version} />
            <Detail
              label="Payload Mode"
              value={agentCommandValue(request.mode)}
            />
            <Detail
              label="Payload Action"
              value={agentCommandValue(request.action)}
            />
            <Detail label="Payload Ticker" value={ticker} />
          </div>

          <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-400">
            Transport is {getTransportDisplayLabel(envelope.transport)}. This
            preview does not call bridge.sendRequest, create progress events,
            write diagnostics, or contact Avanza.
          </p>

          {envelopeValidation &&
            (envelopeValidation.errors.length > 0 ||
              envelopeValidation.warnings.length > 0) && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {envelopeValidation.errors.length > 0 && (
                  <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                      Envelope errors
                    </p>
                    <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                      {envelopeValidation.errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {envelopeValidation.warnings.length > 0 && (
                  <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                      Envelope warnings
                    </p>
                    <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                      {envelopeValidation.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
            <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
              Envelope JSON - diagnostics only
            </summary>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
              {JSON.stringify(envelope, null, 2)}
            </pre>
          </details>
        </>
      ) : (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          {previewError ?? "Bridge request envelope preview is unavailable."}
        </p>
      )}
    </div>
  );
}
