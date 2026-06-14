import { Detail } from "@/components/execution/handoff-modal-shared";
import type { AvanzaAgentResult } from "@/lib/avanza-agent-adapter";

export type ExecutionLifecycleStatusPanelProps = {
  agentCommandValue: (value: string | number | boolean | null | undefined) => string;
  agentRunStoreMessage: string;
  agentRunnerError: string;
  agentRunnerResult: AvanzaAgentResult | null;
  canRunPreparationStub: boolean;
  currentLifecycleLabel: string;
  currentLifecycleToneClassName: string;
  executionDevToolsEnabled: boolean;
  onRunPreparationStub: () => void;
  preparationButtonLabel: string;
  preparationStatusMessage: string;
  preparationStubError: string;
  preparationStubMessage: string;
  shortPayloadId: (value: string | null) => string;
};

export function ExecutionLifecycleStatusPanel({
  agentCommandValue,
  agentRunStoreMessage,
  agentRunnerError,
  agentRunnerResult,
  canRunPreparationStub,
  currentLifecycleLabel,
  currentLifecycleToneClassName,
  executionDevToolsEnabled,
  onRunPreparationStub,
  preparationButtonLabel,
  preparationStatusMessage,
  preparationStubError,
  preparationStubMessage,
  shortPayloadId,
}: ExecutionLifecycleStatusPanelProps) {
  return (
    <div className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
            Avanza preparation stub
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {executionDevToolsEnabled
              ? "This button only advances local preview state. It does not open Avanza, prepare a real order, submit KÖP/SÄLJ, or save anything."
              : "Avanza preparation is not connected in this build."}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${currentLifecycleToneClassName}`}
        >
          {currentLifecycleLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-zinc-500">
          {preparationStatusMessage}
        </p>
        <button
          type="button"
          disabled={!canRunPreparationStub}
          onClick={(event) => {
            event.stopPropagation();
            onRunPreparationStub();
          }}
          className="min-h-10 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/50 hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
        >
          {preparationButtonLabel}
        </button>
      </div>

      {!executionDevToolsEnabled && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-400">
          Execution dev tools are disabled in this build. The future Avanza
          bridge is not connected, and no local bridge-backed diagnostics runner
          will run from this modal.
        </p>
      )}

      {preparationStubMessage && (
        <p className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] p-3 text-sm leading-6 text-cyan-100">
          {preparationStubMessage}
        </p>
      )}

      {preparationStubError && (
        <p className="mt-3 rounded-md border border-rose-300/25 bg-rose-300/[0.08] p-3 text-sm leading-6 text-rose-100">
          {preparationStubError}
        </p>
      )}

      {executionDevToolsEnabled && agentRunnerError && (
        <p className="mt-3 rounded-md border border-rose-300/25 bg-rose-300/[0.08] p-3 text-sm leading-6 text-rose-100">
          {agentRunnerError}
        </p>
      )}

      {executionDevToolsEnabled && agentRunStoreMessage && (
        <p className="mt-3 rounded-md border border-sky-300/20 bg-sky-300/[0.06] p-3 text-sm leading-6 text-sky-100">
          {agentRunStoreMessage}
        </p>
      )}

      {executionDevToolsEnabled && agentRunnerResult && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                Bridge-backed diagnostics runner result
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {agentRunnerResult.error ??
                  agentRunnerResult.rawSummary ??
                  "Bridge-backed diagnostics runner finished without broker action."}
              </p>
            </div>
            <span className="w-fit rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              {agentCommandValue(agentRunnerResult.status)}
            </span>
          </div>

          <p className="mt-3 rounded-md border border-cyan-300/15 bg-cyan-300/[0.06] p-3 text-xs leading-5 text-cyan-100">
            Bridge-backed diagnostics runner only. Echo bridge and no-op bridge
            are local protocol tools only. Avanza was not opened, no order was
            prepared or submitted, and no broker result was created.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Request"
              value={shortPayloadId(agentRunnerResult.requestId)}
            />
            <Detail
              label="Progress Events"
              value={String(agentRunnerResult.progressEvents.length)}
            />
            <Detail
              label="Broker Result"
              value={
                agentRunnerResult.brokerResult
                  ? "Unexpected result present"
                  : "Absent"
              }
            />
            <Detail
              label="Raw Summary"
              value={agentRunnerResult.rawSummary ?? "—"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
