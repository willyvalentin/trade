import {
  formatAvanzaPrepareHandoffPreviewStatus,
  type AvanzaPrepareHandoffPreviewModel,
} from "@/lib/avanza-prepare-handoff-preview";

type AvanzaPrepareHandoffPreviewShellProps = {
  model: AvanzaPrepareHandoffPreviewModel;
};

export function AvanzaPrepareHandoffPreviewShell({
  model,
}: AvanzaPrepareHandoffPreviewShellProps) {
  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              {formatAvanzaPrepareHandoffPreviewStatus(model.status)}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              {formatAvanzaPrepareHandoffPreviewStatus(model.secondaryStatus)}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            {model.title}
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-300">
            {model.description}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {model.disabledReason}
          </p>
        </div>
        <button
          className="inline-flex min-h-9 cursor-not-allowed items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500"
          disabled
          type="button"
        >
          {model.ctaLabel}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {model.safetyCopy.map((copy) => (
          <span
            className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
            key={copy}
          >
            {copy}
          </span>
        ))}
      </div>

      <ol className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-5">
        {model.futureFlowSteps.map((step, index) => (
          <li
            className="rounded-md border border-white/10 bg-white/[0.025] p-2"
            key={step}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
              Step {index + 1}
            </span>
            <span className="mt-1 block">{step}</span>
          </li>
        ))}
      </ol>

      <ul className="mt-3 grid gap-1 text-xs leading-5 text-zinc-500 sm:grid-cols-3">
        {model.advisoryNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
}
