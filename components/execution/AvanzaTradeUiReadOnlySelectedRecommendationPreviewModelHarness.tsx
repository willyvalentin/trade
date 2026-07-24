import {
  avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures,
  type AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixture,
} from "@/lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures";

type AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarnessProps = {
  fixtures?: readonly AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatPreviewState(value: unknown) {
  return value == null ? "previewState absent" : "previewState present";
}

export function AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness({
  fixtures = avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures,
}: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Trade UI read-only selectedRecommendation preview model",
            "Preview model fixture only",
            "Default-off",
            "Explicit input/config only",
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
          Trade UI read-only selectedRecommendation preview model fixtures
        </h3>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Static model fixture states only. This harness does not fetch, call
          the bridge, read app state, read route state, read real
          selectedRecommendation state, derive app or route preview state, wire
          Trade UI, write execution records, or enable execution.
        </p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Fixture states: hidden_default, disabled_config,
          no_selected_recommendation, guard_blocked, invalid_input,
          adapter_rejected, derived_preview_failed, read_only_preview_ready.
          The read_only_preview_ready fixture is passive/read-only/model-only,
          not active.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const model = fixture.modelResult;
          const previewState = model.previewState;
          const readyCopy =
            model.status === "read_only_preview_ready"
              ? "read_only_preview_ready is passive/read-only/model-only, not active"
              : "not renderable";

          return (
            <article
              className="rounded-md border border-white/10 bg-white/[0.02] p-3"
              key={fixture.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.id}: {fixture.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {model.reason}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    {readyCopy}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {model.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fixture id", fixture.id],
                  ["Fixture label", fixture.label],
                  ["Model status", model.status],
                  ["Expected status", fixture.expectedStatus],
                  ["sourceMode", model.sourceMode],
                  ["previewState", formatPreviewState(model.previewState)],
                  [
                    "previewDisplayState",
                    previewState ? previewState.displayState : "n/a",
                  ],
                  [
                    "previewGate",
                    previewState
                      ? previewState.preActivationGate.gateStatus
                      : "n/a",
                  ],
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
                  [
                    "controlsEnabled",
                    formatBoolean(model.controlsEnabled),
                  ],
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
            </article>
          );
        })}
      </div>
    </section>
  );
}

