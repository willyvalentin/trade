import {
  avanzaRealSelectedRecommendationReadOnlyConnectionFixtures,
  type AvanzaRealSelectedRecommendationReadOnlyConnectionFixture,
} from "@/lib/avanza-real-selected-recommendation-read-only-connection-fixtures";

type AvanzaRealSelectedRecommendationReadOnlyConnectionHarnessProps = {
  fixtures?: readonly AvanzaRealSelectedRecommendationReadOnlyConnectionFixture[];
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

  return "explicit fixture object";
}

function formatOptionalResult(value: unknown) {
  return value == null ? "absent" : "present";
}

export function AvanzaRealSelectedRecommendationReadOnlyConnectionHarness({
  fixtures = avanzaRealSelectedRecommendationReadOnlyConnectionFixtures,
}: AvanzaRealSelectedRecommendationReadOnlyConnectionHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "real selectedRecommendation read-only connection",
            "Connection fixture only",
            "Explicit candidate input only",
            "No Trade UI state is read",
            "No real selectedRecommendation state is read from app/route",
            "No real selectedRecommendation state is rendered from app/route",
            "No previewState is derived",
            "No Trade UI wiring",
            "Fixture-only dev route section",
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
          Real selectedRecommendation read-only connection fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Supported statuses: connection_disabled,
          selected_recommendation_unavailable, selected_recommendation_invalid,
          selected_recommendation_ready_read_only,
          preview_ready_read_only_blocked, preview_ready_read_only.
        </p>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Static fixture model results only. This harness does not fetch, call
          the bridge, read app state, read route state, read real
          selectedRecommendation state from app or route, derive previewState
          from app or route state, wire Trade UI, write execution records, or
          enable execution.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.connectionResult;

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
                  ["Fixture id", fixture.id],
                  ["Fixture label", fixture.label],
                  ["Expected status", fixture.expectedStatus],
                  ["Status", result.status],
                  [
                    "Source status",
                    result.selectedRecommendationSourceStatus,
                  ],
                  ["Integration status", result.integrationStatus],
                  ["Source name", result.sourceName],
                  ["Source kind", result.sourceKind],
                  [
                    "Explicit candidate",
                    formatCandidate(fixture.selectedRecommendationCandidate),
                  ],
                  [
                    "Normalized summary",
                    formatOptionalResult(
                      result.normalizedSelectedRecommendationSummary,
                    ),
                  ],
                  ["modelResult", formatOptionalResult(result.modelResult)],
                  [
                    "canRenderPreview",
                    formatBoolean(result.canRenderPreview),
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
