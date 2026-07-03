const futureFlowSteps = [
  "Ture validates the trade package.",
  "Ture checks read-only Avanza readiness.",
  "Ture prepares the order form.",
  "Ture stops before Granska köp.",
  "User manually reviews in Avanza.",
];

export function AvanzaPrepareHandoffPreviewShell() {
  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              Preview only
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Not enabled
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            Prepare Avanza handoff
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-300">
            Future semi-auto handoff shell. Total-read remains
            unresolved/advisory, and manual review is required in Avanza.
          </p>
        </div>
        <button
          className="inline-flex min-h-9 cursor-not-allowed items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500"
          disabled
          type="button"
        >
          Prepare Avanza handoff
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Ture will not click Granska köp",
          "Ture will not submit an order",
          "Manual review required in Avanza",
        ].map((copy) => (
          <span
            className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
            key={copy}
          >
            {copy}
          </span>
        ))}
      </div>

      <ol className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-5">
        {futureFlowSteps.map((step, index) => (
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
    </section>
  );
}
