import type {
  AvanzaInstrumentToOrderLocalDevExecutorFixture,
} from "@/lib/avanza-instrument-to-order-local-dev-executor-fixtures";
import {
  avanzaInstrumentToOrderLocalDevExecutorFixtures,
} from "@/lib/avanza-instrument-to-order-local-dev-executor-fixtures";

type AvanzaInstrumentToOrderLocalDevExecutorHarnessProps = {
  fixtures?: readonly AvanzaInstrumentToOrderLocalDevExecutorFixture[];
};

const summaryBadges = [
  "Avanza instrument-to-order local-dev executor",
  "Fixture/mock only",
  "Injected dependencies only",
  "Local/dev-only",
  "Search execution via injected dependency modeled",
  "Instrument verification via snapshot modeled",
  "Order field preparation via injected dependency modeled",
  "Review-ready state modeled",
  "Fill values hidden in reports",
  "Final human action required",
  "No Trade UI wiring",
  "No API route wiring",
  "No automatic app-runtime Avanza navigation",
  "No final KÖP/SÄLJ click",
  "No order submission",
  "No cookies/session",
  "No BankID automation",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "executorEnabled",
  "localDevOnly",
  "canExecuteLocalDevActions",
  "canSearchInstrument",
  "canFillSearchInput",
  "canSelectSearchResult",
  "canReadInstrumentVerificationSnapshot",
  "canLocateBuySellEntry",
  "canFillOrderFields",
  "canReadOrderReviewSnapshot",
  "canClickFinalBuy",
  "canClickFinalSell",
  "canSubmitOrder",
  "canReadCookies",
  "canExportSession",
  "canAutomateBankId",
  "canBypassBankId",
  "userMustConfirm",
  "finalHumanClickRequired",
  "controlsEnabled",
  "gateLocked",
] as const;

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "n/a";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "none";

  return String(value);
}

export function AvanzaInstrumentToOrderLocalDevExecutorHarness({
  fixtures = avanzaInstrumentToOrderLocalDevExecutorFixtures,
}: AvanzaInstrumentToOrderLocalDevExecutorHarnessProps) {
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {summaryBadges.map((badge) => (
          <span
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100"
            key={badge}
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {fixtures.map((fixture) => {
          const { report } = fixture;

          return (
            <article
              className="grid gap-3 rounded-md border border-white/10 bg-zinc-950/70 p-4"
              data-fixture-id={fixture.fixtureId}
              key={fixture.fixtureId}
            >
              <div>
                <p className="text-xs font-bold uppercase text-zinc-500">
                  {fixture.fixtureId}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                  {fixture.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  {report.label}. {report.reason}
                </p>
              </div>

              <dl className="grid gap-2 text-xs text-zinc-300 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-zinc-500">expectedStatus</dt>
                  <dd>{fixture.expectedStatus}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">status</dt>
                  <dd>{report.status}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">side</dt>
                  <dd>{report.side}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">ticker</dt>
                  <dd>{report.ticker}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">instrumentName</dt>
                  <dd>{formatValue(report.instrumentName)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">quantity</dt>
                  <dd>{formatValue(report.quantity)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">orderType</dt>
                  <dd>{report.orderType}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">limitPrice</dt>
                  <dd>{formatValue(report.limitPrice)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">searchExecuted</dt>
                  <dd>{formatValue(report.searchExecuted)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    instrumentSelected
                  </dt>
                  <dd>{formatValue(report.instrumentSelected)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    instrumentVerificationRead
                  </dt>
                  <dd>{formatValue(report.instrumentVerificationRead)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    instrumentVerificationPassed
                  </dt>
                  <dd>{formatValue(report.instrumentVerificationPassed)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    buySellEntryLocated
                  </dt>
                  <dd>{formatValue(report.buySellEntryLocated)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    orderFieldsPrepared
                  </dt>
                  <dd>{formatValue(report.orderFieldsPrepared)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">orderReviewReady</dt>
                  <dd>{formatValue(report.orderReviewReady)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    finalHumanActionRequired
                  </dt>
                  <dd>{formatValue(report.finalHumanActionRequired)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">orderSubmitted</dt>
                  <dd>{formatValue(report.orderSubmitted)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    finalBuySellClicked
                  </dt>
                  <dd>{formatValue(report.finalBuySellClicked)}</dd>
                </div>
              </dl>

              <div className="grid gap-2 text-xs text-zinc-300">
                <p>
                  <span className="font-semibold text-zinc-500">warnings: </span>
                  {formatValue(report.warnings)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">
                    blockedReasons:{" "}
                  </span>
                  {formatValue(report.blockedReasons)}
                </p>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Safety flags
                </h4>
                <dl className="grid gap-1 text-xs text-zinc-300 sm:grid-cols-2">
                  {safetyFlagKeys.map((key) => (
                    <div className="flex justify-between gap-3" key={key}>
                      <dt className="text-zinc-500">{key}</dt>
                      <dd>{formatValue(report.safetyFlags[key])}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="grid gap-2">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Action reports
                </h4>
                {report.actionReports.map((action) => (
                  <div
                    className="rounded-md border border-white/10 bg-white/[0.025] p-3 text-xs text-zinc-300"
                    key={`${fixture.fixtureId}-${action.actionId}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-100">
                        {action.label}
                      </p>
                      <p className="text-zinc-500">{action.executionStatus}</p>
                    </div>
                    <dl className="mt-2 grid gap-1 sm:grid-cols-2">
                      <div>
                        <dt className="text-zinc-500">actionType</dt>
                        <dd>{action.actionType}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">valueSource</dt>
                        <dd>{action.valueSource}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">valueUsed</dt>
                        <dd>{formatValue(action.valueUsed)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">valueVisible</dt>
                        <dd>{formatValue(action.valueVisible)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">realBrowserAction</dt>
                        <dd>{formatValue(action.realBrowserAction)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">orderSubmitted</dt>
                        <dd>{formatValue(action.orderSubmitted)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">finalBuySellClicked</dt>
                        <dd>{formatValue(action.finalBuySellClicked)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">safeDisplayValue</dt>
                        <dd>{formatValue(action.safeDisplayValue)}</dd>
                      </div>
                    </dl>
                    <p className="mt-2 text-zinc-400">
                      expected: {action.expectedResult}
                    </p>
                    {action.actualResult ? (
                      <p className="mt-1 text-zinc-400">
                        actual: {action.actualResult}
                      </p>
                    ) : null}
                    {action.blockedReason ? (
                      <p className="mt-1 text-zinc-400">
                        blocked: {action.blockedReason}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
