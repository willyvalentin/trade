import {
  avanzaHardDisabledSourceToPreviewIntegrationFixtures,
  type AvanzaHardDisabledSourceToPreviewIntegrationFixture,
} from "@/lib/avanza-hard-disabled-source-to-preview-integration-fixtures";

type AvanzaHardDisabledSourceToPreviewIntegrationHarnessProps = {
  fixtures?: readonly AvanzaHardDisabledSourceToPreviewIntegrationFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatModelResult(value: unknown) {
  return value == null ? "modelResult absent" : "modelResult present";
}

export function AvanzaHardDisabledSourceToPreviewIntegrationHarness({
  fixtures = avanzaHardDisabledSourceToPreviewIntegrationFixtures,
}: AvanzaHardDisabledSourceToPreviewIntegrationHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "hard-disabled source-to-preview integration",
            "Integration fixture only",
            "Explicit input only",
            "No real selectedRecommendation state is read",
            "No real selectedRecommendation state is rendered",
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
          Hard-disabled source-to-preview integration fixtures
        </h3>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Static integration results only. This harness does not fetch, call the
          bridge, read app state, read route state, read real
          selectedRecommendation state, derive previewState from app or route
          state, wire Trade UI, write execution records, or enable execution.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.integrationResult;

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
                  ["Integration status", result.status],
                  ["Expected status", fixture.expectedStatus],
                  ["sourceStatus", result.sourceStatus],
                  [
                    "previewModelStatus",
                    result.previewModelStatus ?? "null",
                  ],
                  ["sourceName", result.sourceName],
                  ["sourceKind", result.sourceKind],
                  ["modelResult", formatModelResult(result.modelResult)],
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
