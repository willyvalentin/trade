const routeStatusItems = [
  "Dev-only visual QA route",
  "Fixture-only",
  "Not linked from main navigation",
  "No real selectedRecommendation state",
  "No Trade UI state",
  "No bridge calls",
  "No localhost fetch",
  "No polling",
  "No execution",
  "Controls disabled",
  "Gate locked",
  "Total-read advisory",
] as const;

export function AvanzaDevVisualQaRouteStatusPanel() {
  return (
    <section className="rounded-md border border-white/10 bg-white/[0.025] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-zinc-500">
            Route isolation status
          </p>
          <h2 className="mt-1 text-sm font-semibold text-zinc-100">
            Dev-only visual QA route
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-400">
            Static fixture-only status. This panel does not fetch, call the
            bridge, read Trade UI state, read real selectedRecommendation
            state, or enable execution.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
          Passive
        </span>
      </div>

      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        {routeStatusItems.map((item) => (
          <div
            className="rounded-md border border-white/10 bg-black/20 p-2"
            key={item}
          >
            <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
              Status
            </dt>
            <dd className="mt-1 font-semibold text-zinc-200">{item}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
