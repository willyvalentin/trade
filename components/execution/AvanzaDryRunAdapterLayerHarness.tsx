import {
  avanzaDryRunAdapterLayerFixtures,
  type AvanzaDryRunAdapterLayerFixture,
} from "@/lib/avanza-dry-run-adapter-layer-fixtures";

type AvanzaDryRunAdapterLayerHarnessProps = {
  fixtures?: readonly AvanzaDryRunAdapterLayerFixture[];
};

const progressEventNames = [
  "request_received",
  "package_validated",
  "broker_context_checked_mock",
  "form_mapping_checked_mock",
  "manual_review_required",
  "dry_run_completed",
  "dry_run_failed",
  "dry_run_cancelled",
] as const;

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatOptional(value: string | number | undefined) {
  return value === undefined ? "absent" : String(value);
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaDryRunAdapterLayerHarness({
  fixtures = avanzaDryRunAdapterLayerFixtures,
}: AvanzaDryRunAdapterLayerHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza dry-run adapter layer",
            "Fixture only",
            "Explicit input only",
            "No Trade UI wiring",
            "No bridge calls",
            "No localhost fetch",
            "No polling",
            "No Avanza/browser control",
            "No execution",
            "No real fill",
            "No order submission",
            "Never clicks review",
            "Never clicks confirm",
            "User must confirm",
            "Final human click required",
            "Controls disabled by default",
            "Gate locked by default",
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
          Avanza dry-run adapter layer fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness renders explicit dry-run
          adapter model states and display-only progress events. It does not
          read Trade UI state, does not fetch, does not call a bridge, does not
          control a browser, does not fill forms, does not click review or
          confirm, does not submit orders, and does not write execution records.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {progressEventNames.map((event) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={event}
            >
              {event}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.result;
          const request = result.adapterRequest;

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
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    {fixture.id}: {fixture.expectedSurface}
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
                  ["Expected status", fixture.expectedStatus],
                  ["Status", result.status],
                  ["Label", result.label],
                  ["Scenario", result.scenario],
                  ["runId", formatOptional(result.runId)],
                  ["Request", request ? "request present" : "request absent"],
                  ["requestId", formatOptional(request?.requestId)],
                  ["broker", formatOptional(request?.broker)],
                  ["mode", formatOptional(request?.mode)],
                  ["side", formatOptional(request?.side)],
                  ["ticker", formatOptional(request?.ticker)],
                  ["symbol", formatOptional(request?.symbol)],
                  ["quantity", formatOptional(request?.quantity)],
                  ["packageId", formatOptional(request?.packageId)],
                  [
                    "sourceRecommendationId",
                    formatOptional(request?.sourceRecommendationId),
                  ],
                  ["canStartDryRun", formatBoolean(result.canStartDryRun)],
                  ["canFillForm", formatBoolean(result.canFillForm)],
                  ["canClickReview", formatBoolean(result.canClickReview)],
                  ["canClickConfirm", formatBoolean(result.canClickConfirm)],
                  ["canSubmitOrder", formatBoolean(result.canSubmitOrder)],
                  ["canCallBridge", formatBoolean(result.canCallBridge)],
                  [
                    "canFetchLocalhost",
                    formatBoolean(result.canFetchLocalhost),
                  ],
                  [
                    "canControlBrowser",
                    formatBoolean(result.canControlBrowser),
                  ],
                  [
                    "canHandleCredentials",
                    formatBoolean(result.canHandleCredentials),
                  ],
                  ["canReadCookies", formatBoolean(result.canReadCookies)],
                  ["canReadBankId", formatBoolean(result.canReadBankId)],
                  [
                    "canWriteSupabaseExecution",
                    formatBoolean(result.canWriteSupabaseExecution),
                  ],
                  ["userMustConfirm", formatBoolean(result.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(result.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", formatBoolean(result.controlsEnabled)],
                  ["gateLocked", formatBoolean(result.gateLocked)],
                  ["warnings", formatList(result.warnings)],
                  ["blockedReasons", formatList(result.blockedReasons)],
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

              <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-2">
                <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                  Progress events
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.progressEvents.length > 0 ? (
                    result.progressEvents.map((event) => (
                      <span
                        className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
                        key={`${fixture.id}-${event.type}`}
                      >
                        {event.type}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400">
                      none
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
