import {
  AvanzaTradeUiReadOnlySelectedRecommendationPreview,
} from "@/components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview";
import {
  avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures,
  type AvanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixture,
} from "@/lib/avanza-trade-ui-read-only-selected-recommendation-preview-component-fixtures";

type AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarnessProps = {
  fixtures?: readonly AvanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatPreviewState(value: unknown) {
  return value == null ? "previewState absent" : "previewState visible";
}

export function AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness({
  fixtures = avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures,
}: AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Passive Trade UI read-only selectedRecommendation preview",
            "Component fixture only",
            "Explicit modelResult only",
            "Default-off",
            "No real selectedRecommendation state is read",
            "No real selectedRecommendation state is rendered",
            "No app/route preview state is derived",
            "No Trade UI wiring",
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
          Passive Trade UI read-only selectedRecommendation preview fixtures
        </h3>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Static component fixtures only. This harness passes explicit
          modelResult fixtures into the passive component. It does not fetch,
          call the bridge, read app state, read route state, read real
          selectedRecommendation state, derive app or route preview state, wire
          Trade UI, write execution records, or enable execution.
        </p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {
            "previewState visible only for read_only_preview_ready. previewState absent/null for every other status. read_only_preview_ready is passive/read-only/model-only and not active."
          }
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const model = fixture.modelResult;
          const readyLabel =
            fixture.expectedRenderMode === "passive_preview_ready"
              ? "read_only_preview_ready is passive/read-only/model-only and not active"
              : "safe passive status";

          return (
            <article
              className="grid gap-3 rounded-md border border-white/10 bg-white/[0.02] p-3"
              key={fixture.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.id}: {fixture.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    {readyLabel}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {fixture.expectedRenderMode}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fixture id", fixture.id],
                  ["Fixture label", fixture.label],
                  ["Model status", model.status],
                  ["Expected status", fixture.expectedStatus],
                  ["Expected render mode", fixture.expectedRenderMode],
                  ["previewState", formatPreviewState(model.previewState)],
                  [
                    "canRenderReadOnlyPreview",
                    formatBoolean(model.canRenderReadOnlyPreview),
                  ],
                  [
                    "canProceedToHandoff",
                    formatBoolean(model.canProceedToHandoff),
                  ],
                  ["canCallBridge", formatBoolean(model.canCallBridge)],
                  [
                    "canFetchLocalhost",
                    formatBoolean(model.canFetchLocalhost),
                  ],
                  ["canPoll", formatBoolean(model.canPoll)],
                  ["canExecute", formatBoolean(model.canExecute)],
                  ["controlsEnabled", formatBoolean(model.controlsEnabled)],
                  ["gateLocked", formatBoolean(model.gateLocked)],
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

              <AvanzaTradeUiReadOnlySelectedRecommendationPreview
                label={fixture.label}
                modelResult={model}
                title="Passive Trade UI read-only selectedRecommendation preview"
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
