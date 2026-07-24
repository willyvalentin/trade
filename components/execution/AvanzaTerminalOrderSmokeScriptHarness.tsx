import {
  avanzaTerminalOrderSmokeScriptFixtures,
  type AvanzaTerminalOrderSmokeScriptFixture,
} from "@/lib/avanza-terminal-order-smoke-script-fixtures";

type AvanzaTerminalOrderSmokeScriptHarnessProps = {
  fixtures?: readonly AvanzaTerminalOrderSmokeScriptFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaTerminalOrderSmokeScriptHarness({
  fixtures = avanzaTerminalOrderSmokeScriptFixtures,
}: AvanzaTerminalOrderSmokeScriptHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza terminal order smoke script",
            "Fixture/model only",
            "Terminal-only",
            "Explicit env opt-in required",
            "Manual local confirmation required",
            "Real-run requires extra flag",
            "CI blocked",
            "Review-ready maximum endpoint",
            "No Trade UI wiring",
            "No API route wiring",
            "No raw fill values shown",
            "No account numbers/order ids shown",
            "No cookies/session",
            "BankID forbidden/manual-action only",
            "No order submission",
            "No final KÖP/SÄLJ click",
            "Not production ready",
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
          Terminal order script fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static safe reports only. This route does not run the terminal script,
          open a browser, read cookies/session, automate BankID, submit orders,
          or click final KÖP/SÄLJ.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const report = fixture.report;

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
                    {fixture.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {report.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["status", report.status],
                  ["label", report.label],
                  ["reason", report.reason],
                  ["mode", report.mode],
                  ["side", report.side],
                  ["ticker", report.ticker],
                  ["envOptInPresent", formatBoolean(fixture.envOptInPresent)],
                  [
                    "manualLocalConfirmationPresent",
                    formatBoolean(fixture.manualLocalConfirmationPresent),
                  ],
                  [
                    "realRunFlagPresent",
                    formatBoolean(fixture.realRunFlagPresent),
                  ],
                  ["smokeTestExecuted", formatBoolean(report.smokeTestExecuted)],
                  [
                    "realPlaywrightPageUsed",
                    formatBoolean(report.realPlaywrightPageUsed),
                  ],
                  ["searchExecuted", formatBoolean(report.searchExecuted)],
                  [
                    "instrumentSelected",
                    formatBoolean(report.instrumentSelected),
                  ],
                  [
                    "instrumentVerificationPassed",
                    formatBoolean(report.instrumentVerificationPassed),
                  ],
                  [
                    "orderFieldsPrepared",
                    formatBoolean(report.orderFieldsPrepared),
                  ],
                  ["orderReviewReady", formatBoolean(report.orderReviewReady)],
                  [
                    "finalHumanActionRequired",
                    formatBoolean(report.finalHumanActionRequired),
                  ],
                  ["orderSubmitted", formatBoolean(report.orderSubmitted)],
                  [
                    "finalBuySellClicked",
                    formatBoolean(report.finalBuySellClicked),
                  ],
                  ["cookiesRead", formatBoolean(report.cookiesRead)],
                  ["sessionExported", formatBoolean(report.sessionExported)],
                  ["bankIdAutomated", formatBoolean(report.bankIdAutomated)],
                  ["tradeUiWired", formatBoolean(report.tradeUiWired)],
                  ["apiRouteWired", formatBoolean(report.apiRouteWired)],
                  ["ciExecution", formatBoolean(report.ciExecution)],
                  ["canRunInCi", formatBoolean(report.canRunInCi)],
                  ["canAutomateBankId", formatBoolean(report.canAutomateBankId)],
                  ["canBypassBankId", formatBoolean(report.canBypassBankId)],
                  ["canReadCookies", formatBoolean(report.canReadCookies)],
                  ["canExportSession", formatBoolean(report.canExportSession)],
                  ["canSubmitOrder", formatBoolean(report.canSubmitOrder)],
                  ["canClickFinalBuy", formatBoolean(report.canClickFinalBuy)],
                  ["canClickFinalSell", formatBoolean(report.canClickFinalSell)],
                  ["canWireTradeUi", formatBoolean(report.canWireTradeUi)],
                  ["canWireApiRoute", formatBoolean(report.canWireApiRoute)],
                  [
                    "valueVisibleInReports",
                    formatBoolean(report.valueVisibleInReports),
                  ],
                  ["userMustConfirm", formatBoolean(report.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(report.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", formatBoolean(report.controlsEnabled)],
                  ["gateLocked", formatBoolean(report.gateLocked)],
                  ["warnings", formatList(report.warnings)],
                  ["blockedReasons", formatList(report.blockedReasons)],
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
