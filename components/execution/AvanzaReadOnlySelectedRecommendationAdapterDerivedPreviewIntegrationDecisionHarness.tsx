import {
  avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtures,
  type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixture,
} from "@/lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-fixtures";

type AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarnessProps =
  {
    fixtures?: readonly AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixture[];
  };

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

export function AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness({
  fixtures = avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtures,
}: AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Adapter/derived-preview integration decision",
            "Decision fixture only",
            "No adapter is called",
            "No derived-preview builder is called",
            "No real selectedRecommendation state is read from app or route",
            "No real preview state is derived",
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
          Adapter/derived-preview integration decision fixtures
        </h3>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Static integration decisions only. This harness does not fetch, call
          the bridge, read app state, read real selectedRecommendation state,
          call the adapter, call the derived-preview builder, derive real
          preview state, or enable execution.
        </p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Fixture states: no_input, blocked_derivation_decision, invalid_input,
          adapter_review_required, integration_allowed.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const decision = fixture.decision;

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
                    {decision.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {decision.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Integration decision status", decision.status],
                  ["Expected state", fixture.expectedState],
                  ["sourceMode", decision.sourceMode],
                  [
                    "canReviewAdapter",
                    formatBoolean(decision.canReviewAdapter),
                  ],
                  [
                    "canNormalizeInput",
                    formatBoolean(decision.canNormalizeInput),
                  ],
                  [
                    "canCallDerivedPreviewBuilder",
                    formatBoolean(decision.canCallDerivedPreviewBuilder),
                  ],
                  [
                    "canRenderReadOnlyPreview",
                    formatBoolean(decision.canRenderReadOnlyPreview),
                  ],
                  [
                    "canUseFixtureFallback",
                    formatBoolean(decision.canUseFixtureFallback),
                  ],
                  ["canCallBridge", formatBoolean(decision.canCallBridge)],
                  [
                    "canFetchLocalhost",
                    formatBoolean(decision.canFetchLocalhost),
                  ],
                  ["canPoll", formatBoolean(decision.canPoll)],
                  ["canExecute", formatBoolean(decision.canExecute)],
                  [
                    "controlsEnabled",
                    formatBoolean(decision.controlsEnabled),
                  ],
                  ["gateLocked", formatBoolean(decision.gateLocked)],
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
