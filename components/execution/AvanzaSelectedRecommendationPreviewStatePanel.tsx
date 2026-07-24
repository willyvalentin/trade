import type {
  AvanzaSelectedRecommendationPreviewState,
} from "@/lib/avanza-selected-recommendation-preview-state";

type AvanzaSelectedRecommendationPreviewStatePanelProps = {
  previewState: AvanzaSelectedRecommendationPreviewState;
};

function formatState(value: string) {
  return value.replaceAll("_", " ");
}

function statusClass(status: string) {
  if (status === "ready" || status === "preview_ready_locked") {
    return "text-emerald-200";
  }

  if (status === "blocked") {
    return "text-red-200";
  }

  if (status === "advisory" || status === "advisory_gaps") {
    return "text-amber-200";
  }

  return "text-zinc-300";
}

export function AvanzaSelectedRecommendationPreviewStatePanel({
  previewState,
}: AvanzaSelectedRecommendationPreviewStatePanelProps) {
  const packageRows = previewState.packagePreview
    ? [
        ["Ticker", previewState.packagePreview.ticker ?? "Missing ticker"],
        ["Instrument", previewState.packagePreview.instrumentDisplayName],
        ["Side", previewState.packagePreview.side],
        ["Quantity strategy", previewState.packagePreview.quantityStrategy],
        ["Quantity", previewState.packagePreview.quantity ?? "Advisory gap"],
        ["Limit price", previewState.packagePreview.limitPrice ?? "Advisory gap"],
        ["Account", previewState.packagePreview.accountDisplayLabel],
        ["Boundary", previewState.packagePreview.boundary],
      ]
    : [];
  const blockedItems = previewState.selectedRecommendationContract.items.filter(
    (item) => item.status === "blocked",
  );
  const advisoryItems = previewState.selectedRecommendationContract.items.filter(
    (item) => item.status === "advisory",
  );

  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Display state: {formatState(previewState.displayState)}
            </span>
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              Preview only
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            Selected recommendation preview state
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Fixture/test renderer only. Not execution-ready and no active
            controls are available.
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.025] p-2 text-xs leading-5 text-zinc-400">
          <p className="font-semibold text-zinc-200">
            {previewState.sourceMode.label}
          </p>
          <p className="mt-1">{previewState.sourceMode.status}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Read-only model",
          "No active handoff button",
          "No order placement",
          "Ture will not click Granska köp",
          "Total-read unresolved/advisory",
        ].map((copy) => (
          <span
            className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
            key={copy}
          >
            {copy}
          </span>
        ))}
      </div>

      {previewState.packagePreview ? (
        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
          {packageRows.map(([label, value]) => (
            <div
              className="rounded-md border border-white/10 bg-white/[0.025] p-2"
              key={label}
            >
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                {label}
              </dt>
              <dd className="mt-1 font-semibold text-zinc-200">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 rounded-md border border-red-300/20 bg-red-500/10 p-2 text-xs font-semibold text-red-100">
          No package preview is available because no recommendation is selected.
        </p>
      )}

      <div className="mt-3 grid gap-3 text-xs lg:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-white/[0.025] p-2">
          <p className="font-semibold text-zinc-200">
            {previewState.eligibilitySummary.label}
          </p>
          <p className="mt-1 leading-5 text-zinc-400">
            {previewState.eligibilitySummary.shortCopy}
          </p>
          <p
            className={`mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${statusClass(
              previewState.eligibilitySummary.status,
            )}`}
          >
            {previewState.eligibilitySummary.status}
          </p>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.025] p-2">
          <p className="font-semibold text-zinc-200">
            {previewState.preActivationGate.label}
          </p>
          <p className="mt-1 leading-5 text-zinc-400">
            {previewState.preActivationGate.reasons[0] ?? "No gate reason"}
          </p>
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
            {previewState.preActivationGate.gateStatus}
          </p>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.025] p-2">
          <p className="font-semibold text-zinc-200">Key blockers/advisories</p>
          <ul className="mt-1 space-y-1 leading-5 text-zinc-400">
            {[...blockedItems, ...advisoryItems].slice(0, 5).map((item) => (
              <li className="flex items-start justify-between gap-2" key={item.id}>
                <span>{item.label}</span>
                <span className={statusClass(item.status)}>{item.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Total-read remains advisory. This panel renders fixture/test states only
        and does not read selected recommendation app state.
      </p>
    </section>
  );
}
