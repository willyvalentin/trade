import {
  avanzaTradeUiPrepareIntentFixtures,
  type AvanzaTradeUiPrepareIntentFixture,
} from "@/lib/avanza-trade-ui-prepare-intent-fixtures";

type AvanzaTradeUiPrepareIntentHarnessProps = {
  fixtures?: readonly AvanzaTradeUiPrepareIntentFixture[];
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

export function AvanzaTradeUiPrepareIntentHarness({
  fixtures = avanzaTradeUiPrepareIntentFixtures,
}: AvanzaTradeUiPrepareIntentHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Trade UI prepare intent",
            "Fixture only",
            "Explicit input only",
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
          Trade UI prepare intent fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness renders explicit model output
          and does not read Trade UI state, call the API route, fetch localhost,
          call a bridge, control a browser, fill forms, click review, click
          confirm, submit orders, handle credentials, or write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.result;

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
                  ["Expected status", fixture.expectedStatus],
                  ["Status", result.status],
                  ["Label", result.label],
                  ["Mode", result.mode],
                  ["prepareIntentId", formatOptional(result.prepareIntentId)],
                  ["createdAt", result.createdAt],
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
                  ["userMustConfirm", formatBoolean(result.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(result.finalHumanClickRequired),
                  ],
                  ["prepareEnabled", formatBoolean(result.prepareEnabled)],
                  ["canRenderPrepare", formatBoolean(result.canRenderPrepare)],
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
