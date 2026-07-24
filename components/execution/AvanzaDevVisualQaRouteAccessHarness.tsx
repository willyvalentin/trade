import {
  avanzaDevVisualQaRouteAccessFixtures,
  type AvanzaDevVisualQaRouteAccessFixture,
} from "@/lib/avanza-dev-visual-qa-route-access-fixtures";

type AvanzaDevVisualQaRouteAccessHarnessProps = {
  fixtures?: readonly AvanzaDevVisualQaRouteAccessFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

export function AvanzaDevVisualQaRouteAccessHarness({
  fixtures = avanzaDevVisualQaRouteAccessFixtures,
}: AvanzaDevVisualQaRouteAccessHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Route access fixture only",
            "No route is created",
            "Not linked from main navigation",
            "No bridge calls",
            "No localhost fetch",
            "No execution",
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
          Dev-only visual QA route access fixtures
        </h3>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Static access decisions only. This harness does not fetch, call the
          bridge, read app state, create a route, link navigation, or enable
          execution.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const decision = fixture.accessDecision;

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
                  ["Access status", decision.status],
                  ["Expected state", fixture.expectedState],
                  ["canExposeRoute", formatBoolean(decision.canExposeRoute)],
                  [
                    "canRenderFixtureGallery",
                    formatBoolean(decision.canRenderFixtureGallery),
                  ],
                  [
                    "canLinkFromMainNavigation",
                    formatBoolean(decision.canLinkFromMainNavigation),
                  ],
                  [
                    "canUseRealSelectedRecommendationState",
                    formatBoolean(decision.canUseRealSelectedRecommendationState),
                  ],
                  ["canCallBridge", formatBoolean(decision.canCallBridge)],
                  [
                    "canFetchLocalhost",
                    formatBoolean(decision.canFetchLocalhost),
                  ],
                  ["canExecute", formatBoolean(decision.canExecute)],
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
