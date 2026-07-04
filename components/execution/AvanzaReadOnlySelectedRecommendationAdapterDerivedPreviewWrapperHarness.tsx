import {
  avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures,
  type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixture,
} from "@/lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures";

type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarnessProps =
  {
    fixtures?: readonly AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixture[];
  };

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatPreviewState(value: unknown) {
  return value == null ? "previewState is null" : "previewState present";
}

export function AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness({
  fixtures = avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures,
}: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Adapter/derived-preview wrapper",
            "Wrapper fixture only",
            "Adapter normalization uses static fixtures only",
            "Derived-preview builder uses static fixtures only",
            "No real selectedRecommendation state is read from app or route",
            "No real selectedRecommendation state is rendered",
            "No real app or route preview state is derived",
            "Read-only previewState may appear for ready fixture",
            "No bridge calls",
            "No localhost fetch",
            "No polling",
            "No execution",
            "Controls disabled",
            "Gate locked",
          ].map((copy) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={copy}
            >
              {copy}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-100">
          Adapter/derived-preview wrapper fixtures
        </h3>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Static wrapper states only. This harness does not fetch, call the
          bridge, read app state, read real selectedRecommendation state, derive
          app or route preview state, or enable execution. Adapter
          normalization and derived-preview output are limited to pure wrapper
          results built from static fixtures.
        </p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Fixture states: no_input, blocked, invalid_input, adapter_rejected,
          adapter_normalized_static_fixture, derived_preview_failed,
          read_only_preview_ready.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.wrapperResult;
          const summary = result.normalizedInputSummary;
          const preview = result.previewState;

          return (
            <article
              className="rounded-md border border-white/10 bg-white/[0.02] p-3"
              key={fixture.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {result.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {result.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Wrapper status", result.status],
                  ["Expected state", fixture.expectedState],
                  ["sourceMode", result.sourceMode],
                  ["previewState", formatPreviewState(result.previewState)],
                  [
                    "previewDisplayState",
                    preview ? preview.displayState : "n/a",
                  ],
                  [
                    "previewGate",
                    preview ? preview.preActivationGate.gateStatus : "n/a",
                  ],
                  [
                    "canRenderReadOnlyPreview",
                    formatBoolean(result.canRenderReadOnlyPreview),
                  ],
                  ["canCallBridge", formatBoolean(result.canCallBridge)],
                  [
                    "canFetchLocalhost",
                    formatBoolean(result.canFetchLocalhost),
                  ],
                  ["canPoll", formatBoolean(result.canPoll)],
                  ["canExecute", formatBoolean(result.canExecute)],
                  [
                    "controlsEnabled",
                    formatBoolean(result.controlsEnabled),
                  ],
                  ["gateLocked", formatBoolean(result.gateLocked)],
                  ["hasTicker", summary ? formatBoolean(summary.hasTicker) : "n/a"],
                  [
                    "hasQuantity",
                    summary ? formatBoolean(summary.hasQuantity) : "n/a",
                  ],
                  [
                    "hasTradeSide",
                    summary ? formatBoolean(summary.hasTradeSide) : "n/a",
                  ],
                ].map(([label, value]) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={label}
                  >
                    <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {label}
                    </dt>
                    <dd className="mt-1 font-semibold text-zinc-200">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {summary ? (
                <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-2 text-xs text-zinc-400">
                  <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                    normalizedInputSummary
                  </p>
                  <p className="mt-1">
                    {summary.ticker ?? "ticker unavailable"}
                    {summary.company ? ` / ${summary.company}` : ""}
                  </p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
