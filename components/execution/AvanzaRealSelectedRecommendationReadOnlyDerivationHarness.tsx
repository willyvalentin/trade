import {
  avanzaRealSelectedRecommendationReadOnlyDerivationFixtures,
  type AvanzaRealSelectedRecommendationReadOnlyDerivationFixture,
} from "@/lib/avanza-real-selected-recommendation-read-only-derivation-fixtures";

type AvanzaRealSelectedRecommendationReadOnlyDerivationHarnessProps = {
  fixtures?: readonly AvanzaRealSelectedRecommendationReadOnlyDerivationFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatPresence(value: unknown, presentLabel: string, absentLabel: string) {
  return value == null ? absentLabel : presentLabel;
}

export function AvanzaRealSelectedRecommendationReadOnlyDerivationHarness({
  fixtures = avanzaRealSelectedRecommendationReadOnlyDerivationFixtures,
}: AvanzaRealSelectedRecommendationReadOnlyDerivationHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Real selectedRecommendation read-only derivation",
            "Derivation fixture only",
            "Explicit input only",
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
          Real selectedRecommendation read-only derivation fixtures
        </h3>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Static derivation fixture states only. This harness does not fetch,
          call the bridge, read app state, read route state, read real
          selectedRecommendation state, derive app or route preview state, wire
          Trade UI, write execution records, or enable execution.
        </p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Fixture states: no_input, guard_blocked, invalid_input,
          adapter_rejected, derived_preview_failed, read_only_preview_ready.
          The read_only_preview_ready fixture is read-only/model-only, not
          active.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.derivationResult;
          const summary = result.normalizedInputSummary;
          const previewState = result.previewState;
          const readyCopy =
            result.status === "read_only_preview_ready"
              ? "read_only_preview_ready is read-only/model-only, not active"
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
                    {result.reason}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    {readyCopy}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {result.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fixture id", fixture.id],
                  ["Derivation status", result.status],
                  ["Expected status", fixture.expectedStatus],
                  ["sourceMode", result.sourceMode],
                  [
                    "normalizedInputSummary",
                    formatPresence(
                      result.normalizedInputSummary,
                      "normalizedInputSummary present",
                      "normalizedInputSummary absent",
                    ),
                  ],
                  [
                    "previewState",
                    formatPresence(
                      result.previewState,
                      "previewState present",
                      "previewState absent",
                    ),
                  ],
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
                    formatBoolean(result.canRenderReadOnlyPreview),
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

              {summary ? (
                <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-2 text-xs text-zinc-400">
                  <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                    normalizedInputSummary
                  </p>
                  <p className="mt-1">
                    {summary.ticker ?? summary.symbol ?? "ticker unavailable"}
                    {summary.direction ? ` / ${summary.direction}` : ""}
                    {summary.quantity ? ` / quantity ${summary.quantity}` : ""}
                    {summary.confidence
                      ? ` / confidence ${summary.confidence}`
                      : ""}
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
