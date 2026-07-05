import {
  avanzaExplicitInternalVisibleDisabledPrepareShellFixtures,
  type AvanzaExplicitInternalVisibleDisabledPrepareShellFixture,
} from "@/lib/avanza-explicit-internal-visible-disabled-prepare-shell-fixtures";

type AvanzaExplicitInternalVisibleDisabledPrepareShellHarnessProps = {
  fixtures?: readonly AvanzaExplicitInternalVisibleDisabledPrepareShellFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatOptional(value: string | number | undefined) {
  return value === undefined ? "absent" : String(value);
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaExplicitInternalVisibleDisabledPrepareShellHarness({
  fixtures = avanzaExplicitInternalVisibleDisabledPrepareShellFixtures,
}: AvanzaExplicitInternalVisibleDisabledPrepareShellHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Explicit internal visible disabled prepare shell",
            "Fixture only",
            "Explicit input only",
            "Internal/dev-only",
            "Disabled",
            "Not production ready",
            "Manual confirmation required in Avanza",
            "No Trade UI wiring",
            "No active prepare button",
            "No active handoff",
            "No API route call",
            "No bridge calls",
            "No localhost fetch",
            "No polling",
            "No Avanza/browser control",
            "No execution",
            "No real fill",
            "No order submission",
            "Never clicks review",
            "Never clicks confirm",
            "Never submits order",
            "User must confirm",
            "Final human click required",
            "Controls disabled",
            "Gate locked",
            "No broker action",
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
          Explicit internal visible disabled prepare shell fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness renders explicit
          internal/dev-only visible disabled shell model output and does not read
          Trade UI state, call the API route, fetch localhost, call a bridge,
          control a browser, fill forms, click review, click confirm, submit
          orders, handle credentials, or write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.modelResult;

          return (
            <article
              className="rounded-md border border-white/10 bg-white/[0.02] p-3"
              key={fixture.fixtureId}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.fixtureId}: {fixture.label}
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
                  ["Fixture id", fixture.fixtureId],
                  ["Expected status", fixture.expectedStatus],
                  ["Status", result.status],
                  ["Label", result.label],
                  ["Mode", result.mode],
                  ["Reason", result.reason],
                  ["visibleShellId", formatOptional(result.visibleShellId)],
                  ["createdAt", formatOptional(result.createdAt)],
                  ["shellId", formatOptional(result.shellId)],
                  ["prepareIntentId", formatOptional(result.prepareIntentId)],
                  [
                    "sourceRecommendationId",
                    formatOptional(result.sourceRecommendationId),
                  ],
                  ["packageId", formatOptional(result.packageId)],
                  ["side", formatOptional(result.side)],
                  ["ticker", formatOptional(result.ticker)],
                  ["symbol", formatOptional(result.symbol)],
                  ["quantity", formatOptional(result.quantity)],
                  ["orderType", formatOptional(result.orderType)],
                  ["limitPrice", formatOptional(result.limitPrice)],
                  ["accountLabel", formatOptional(result.accountLabel)],
                  ["warnings", formatList(result.warnings)],
                  ["blockedReasons", formatList(result.blockedReasons)],
                  ["copy", formatList(result.copy)],
                  ["userMustConfirm", formatBoolean(result.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(result.finalHumanClickRequired),
                  ],
                  [
                    "visibleShellEnabled",
                    formatBoolean(result.visibleShellEnabled),
                  ],
                  [
                    "canRenderVisibleShell",
                    formatBoolean(result.canRenderVisibleShell),
                  ],
                  ["canClickPrepare", formatBoolean(result.canClickPrepare)],
                  ["canCallApiRoute", formatBoolean(result.canCallApiRoute)],
                  ["canCallBridge", formatBoolean(result.canCallBridge)],
                  [
                    "canFetchLocalhost",
                    formatBoolean(result.canFetchLocalhost),
                  ],
                  ["canControlBrowser", formatBoolean(result.canControlBrowser)],
                  ["canFillForm", formatBoolean(result.canFillForm)],
                  ["canClickReview", formatBoolean(result.canClickReview)],
                  ["canClickConfirm", formatBoolean(result.canClickConfirm)],
                  ["canSubmitOrder", formatBoolean(result.canSubmitOrder)],
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
                  ["controlsEnabled", formatBoolean(result.controlsEnabled)],
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
