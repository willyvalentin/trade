"use client";

import type {
  ExecutionAuthority,
  ExecutionMode,
} from "@/lib/execution";

export type ExecutionSettingsPanelProps = {
  automaticExecutionEnabled: boolean;
  executionAuthority: ExecutionAuthority;
  executionMode: ExecutionMode;
  executionModeMessage: string;
  onSelectExecutionMode: (mode: ExecutionMode) => void;
};

export function ExecutionSettingsPanel({
  automaticExecutionEnabled,
  executionAuthority,
  executionMode,
  executionModeMessage,
  onSelectExecutionMode,
}: ExecutionSettingsPanelProps) {
  return (
    <section className="mt-6 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-emerald-100">
            Execution Mode
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Choose how Ture labels future Avanza handoffs. This build is
            read-only: no broker connection, order preparation, or KÖP/SÄLJ
            submission is implemented.
          </p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-black/25 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          {executionMode === "automatic" ? "Automatic" : "Semi-auto"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          aria-pressed={executionMode === "semi_automatic"}
          onClick={() => onSelectExecutionMode("semi_automatic")}
          className={`rounded-md border p-4 text-left transition ${
            executionMode === "semi_automatic"
              ? "border-emerald-300/45 bg-emerald-300/10"
              : "border-white/10 bg-black/25 hover:border-white/25"
          }`}
        >
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-white">
              Semi-automatic
            </span>
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
              Default
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Recommended
            </span>
          </span>
          <span className="mt-3 block text-sm leading-6 text-zinc-400">
            Ture may prepare Avanza order details in the future, but the user
            must manually press final KÖP/SÄLJ.
          </span>
        </button>

        <button
          type="button"
          aria-pressed={executionMode === "automatic"}
          disabled={!automaticExecutionEnabled}
          onClick={() => onSelectExecutionMode("automatic")}
          className={`rounded-md border p-4 text-left transition ${
            executionMode === "automatic"
              ? "border-amber-300/45 bg-amber-300/10"
              : "border-white/10 bg-black/25 hover:border-white/25"
          } ${automaticExecutionEnabled ? "" : "cursor-not-allowed opacity-60"}`}
        >
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-white">
              Automatic
            </span>
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              Advanced
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Experimental
            </span>
            {!automaticExecutionEnabled && (
              <span className="rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                Locked
              </span>
            )}
          </span>
          <span className="mt-3 block text-sm leading-6 text-zinc-400">
            Ture may later be allowed to submit final KÖP/SÄLJ automatically
            when safety checks pass.
          </span>
        </button>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Authority
          </div>
          <div className="mt-1 text-zinc-200">
            {executionAuthority.final_confirmation_actor === "agent"
              ? "Agent final confirmation"
              : "Human final confirmation"}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Prepare Order
          </div>
          <div className="mt-1 text-zinc-200">
            {executionAuthority.can_prepare_broker_form ? "Allowed" : "Blocked"}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Final Submit
          </div>
          <div className="mt-1 text-zinc-200">
            {executionAuthority.allowFinalSubmit ? "Allowed by mode" : "Manual only"}
          </div>
        </div>
      </div>

      {!automaticExecutionEnabled && (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Automatic mode is visible for planning, but locked unless
          NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION is set to true.
        </p>
      )}

      {executionModeMessage && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {executionModeMessage}
        </p>
      )}
    </section>
  );
}
