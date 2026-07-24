import {
  avanzaSelectedRecommendationSourceExtractionFixtures,
  type AvanzaSelectedRecommendationSourceExtractionFixture,
} from "@/lib/avanza-selected-recommendation-source-extraction-fixtures";

type AvanzaSelectedRecommendationSourceExtractionHarnessProps = {
  fixtures?: readonly AvanzaSelectedRecommendationSourceExtractionFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatCandidate(value: unknown) {
  if (value === undefined) {
    return "undefined";
  }

  if (value === null) {
    return "null";
  }

  if (typeof value !== "object") {
    return typeof value;
  }

  return "explicit object";
}

export function AvanzaSelectedRecommendationSourceExtractionHarness({
  fixtures = avanzaSelectedRecommendationSourceExtractionFixtures,
}: AvanzaSelectedRecommendationSourceExtractionHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "selectedRecommendation source extraction",
            "Source fixture only",
            "Explicit candidate input only",
            "No real selectedRecommendation state is read",
            "No real selectedRecommendation state is rendered",
            "No previewState is derived",
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
          selectedRecommendation source extraction fixtures
        </h3>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Static source extraction results only. This harness does not fetch,
          call the bridge, read app state, read route state, read real
          selectedRecommendation state, call the preview model, derive
          previewState, or enable execution.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.extractionResult;

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
                  ["Extraction status", result.status],
                  ["Expected status", fixture.expectedStatus],
                  ["sourceName", result.sourceName],
                  ["sourceKind", result.sourceKind],
                  ["candidateInput", formatCandidate(fixture.candidateInput)],
                  [
                    "hasSelectedRecommendationLikeInput",
                    formatBoolean(Boolean(result.selectedRecommendationLikeInput)),
                  ],
                  [
                    "hasNormalizedSourceSummary",
                    formatBoolean(Boolean(result.normalizedSourceSummary)),
                  ],
                  [
                    "canProceedToPreviewModel",
                    formatBoolean(result.canProceedToPreviewModel),
                  ],
                  [
                    "canProceedToHandoff",
                    formatBoolean(result.canProceedToHandoff),
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

              {result.normalizedSourceSummary ? (
                <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(result.normalizedSourceSummary).map(
                    ([label, value]) => (
                      <div
                        className="rounded-md border border-emerald-400/20 bg-emerald-400/[0.04] p-2"
                        key={label}
                      >
                        <dt className="font-mono text-[10px] font-bold uppercase text-emerald-200/80">
                          {label}
                        </dt>
                        <dd className="mt-1 font-semibold text-emerald-50">
                          {String(value)}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
