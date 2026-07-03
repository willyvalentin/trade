import type {
  AvanzaHandoffPackagePreview,
} from "@/lib/avanza-handoff-package-preview";
import type {
  AvanzaHandoffPreActivationGate,
} from "@/lib/avanza-handoff-pre-activation-gate";
import type {
  AvanzaHandoffSafetyBoundarySummary,
} from "@/lib/avanza-handoff-safety-boundary-summary";
import type {
  AvanzaHandoffPreviewSourceModeModel,
} from "@/lib/avanza-handoff-preview-source-mode";
import type {
  AvanzaSelectedRecommendationHandoffContract,
  AvanzaSelectedRecommendationHandoffEligibilitySummary,
} from "@/lib/avanza-selected-recommendation-handoff-contract";
import {
  summarizeAvanzaSelectedRecommendationHandoffContract,
} from "@/lib/avanza-selected-recommendation-handoff-contract";

type AvanzaHandoffPackagePreviewCardProps = {
  contract?: AvanzaSelectedRecommendationHandoffContract;
  eligibilitySummary?: AvanzaSelectedRecommendationHandoffEligibilitySummary;
  preActivationGate?: AvanzaHandoffPreActivationGate;
  preview: AvanzaHandoffPackagePreview;
  safetyBoundarySummary?: AvanzaHandoffSafetyBoundarySummary;
  sourceMode?: AvanzaHandoffPreviewSourceModeModel;
};

function formatValue(value: string | null) {
  return value ?? "Advisory gap";
}

export function AvanzaHandoffPackagePreviewCard({
  contract,
  eligibilitySummary,
  preActivationGate,
  preview,
  safetyBoundarySummary,
  sourceMode,
}: AvanzaHandoffPackagePreviewCardProps) {
  const resolvedEligibilitySummary =
    eligibilitySummary ??
    (contract ? summarizeAvanzaSelectedRecommendationHandoffContract(contract) : null);
  const rows = [
    ["Ticker", preview.ticker ?? "Missing ticker"],
    ["Instrument", preview.instrumentDisplayName],
    ["Side", preview.side],
    ["Quantity strategy", preview.quantityStrategy],
    ["Quantity", formatValue(preview.quantity)],
    ["Limit price", formatValue(preview.limitPrice)],
    ["Account", preview.accountDisplayLabel],
    ["Order mode", preview.orderMode],
    ["Boundary", preview.boundary],
    ["Readiness", preview.readinessSummaryStatus],
  ] as const;

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
            {preview.actionLabel}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Package preview only. Manual review required in Avanza.
          </p>
        </div>
        <button
          className="inline-flex min-h-9 cursor-not-allowed items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500"
          disabled
          type="button"
        >
          {preview.actionLabel}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "No order placement",
          "Ture will not click Granska köp",
          "Ture will not submit an order",
          preview.manualReviewRequired
            ? "Manual review required"
            : "Manual review status unknown",
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

      {preview.blocked && (
        <p className="mt-3 rounded-md border border-red-300/20 bg-red-500/10 p-2 text-xs font-semibold text-red-100">
          Blocked preview: {preview.blockedReason}
        </p>
      )}

      {sourceMode && (
        <div className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-2 text-xs leading-5 text-zinc-400">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-zinc-200">{sourceMode.label}</p>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
              {sourceMode.status}
            </span>
          </div>
          <p className="mt-1">{sourceMode.reason}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span>Selected recommendation wiring: disabled</span>
            <span>No real recommendation state is read</span>
          </div>
        </div>
      )}

      {preActivationGate && (
        <div className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-2 text-xs leading-5 text-zinc-400">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-zinc-200">
              {preActivationGate.label}
            </p>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
              {preActivationGate.gateStatus}
            </span>
          </div>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {preActivationGate.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>Reason: {reason}</li>
            ))}
          </ul>
          <p className="mt-2 text-zinc-500">
            No gate result is production readiness.
          </p>
        </div>
      )}

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        {rows.map(([label, value]) => (
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

      <ul className="mt-3 grid gap-1 text-xs leading-5 text-zinc-500">
        {preview.advisoryNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      {safetyBoundarySummary && (
        <details className="mt-3 rounded-md border border-white/10 bg-white/[0.02] p-2 text-xs leading-5 text-zinc-400">
          <summary className="cursor-default font-semibold text-zinc-200">
            {safetyBoundarySummary.label}
          </summary>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {safetyBoundarySummary.boundaries.map((boundary) => (
              <li
                className="flex items-start justify-between gap-2"
                key={boundary.id}
              >
                <span>{boundary.label}</span>
                <span
                  className={
                    boundary.status === "enforced"
                      ? "font-semibold text-emerald-200"
                      : "font-semibold text-amber-200"
                  }
                >
                  {boundary.status}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-zinc-500">
            Total-read unresolved/advisory remains advisory.
          </p>
        </details>
      )}

      {contract && (
        <div className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-2">
          {resolvedEligibilitySummary && (
            <div className="mb-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-amber-100">
                    {resolvedEligibilitySummary.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {resolvedEligibilitySummary.shortCopy}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
                  {resolvedEligibilitySummary.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                <span>Ready {resolvedEligibilitySummary.readyCount}</span>
                <span>Blocked {resolvedEligibilitySummary.blockedCount}</span>
                <span>Advisory {resolvedEligibilitySummary.advisoryCount}</span>
                <span>Unknown {resolvedEligibilitySummary.unknownCount}</span>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-zinc-200">
              Selected recommendation contract
            </p>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
              {contract.status}
            </span>
          </div>
          <ul className="mt-2 grid gap-1 text-xs leading-5 text-zinc-400 sm:grid-cols-2">
            {contract.items.map((item) => (
              <li className="flex items-start justify-between gap-2" key={item.id}>
                <span>{item.label}</span>
                <span
                  className={
                    item.status === "ready"
                      ? "font-semibold text-emerald-200"
                      : item.status === "blocked"
                        ? "font-semibold text-red-200"
                        : "font-semibold text-amber-200"
                  }
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
