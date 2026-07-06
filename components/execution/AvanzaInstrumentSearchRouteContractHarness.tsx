import {
  avanzaInstrumentSearchRouteContractFixtures,
  type AvanzaInstrumentSearchRouteContractFixture,
} from "@/lib/avanza-instrument-search-route-contract-fixtures";

type Props = {
  fixtures?: readonly AvanzaInstrumentSearchRouteContractFixture[];
};

function b(value: boolean) {
  return value ? "true" : "false";
}

function list(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaInstrumentSearchRouteContractHarness({
  fixtures = avanzaInstrumentSearchRouteContractFixtures,
}: Props) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza instrument search route contract",
            "Fixture/model only",
            "Contract only",
            "BUY instrument route modeled",
            "SELL instrument route modeled",
            "Instrument verification modeled",
            "Planned actions are not executable yet",
            "No real search execution",
            "No real Avanza navigation",
            "No click",
            "No BUY/SELL entry click",
            "No order submission",
            "No cookies/session",
            "No BankID automation",
            "No Trade UI wiring",
            "No API route wiring",
            "Final human confirmation required",
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
        <p className="mt-3 text-xs leading-5 text-zinc-400">
          Static route plans only. The route models search, verification, and
          BUY/SELL entry-button location, then stops before any entry click.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const route = fixture.routeContract;

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
                    {route.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {route.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["routeContractId", route.routeContractId],
                  ["mode", route.mode],
                  ["status", route.status],
                  ["side", route.side],
                  ["ticker", route.ticker],
                  ["instrumentName", route.instrumentName],
                  ["expectedMarket", route.expectedMarket],
                  ["expectedCurrency", route.expectedCurrency],
                  ["expectedInstrumentType", route.expectedInstrumentType],
                  ["expectedIsin", route.expectedIsin],
                  ["nextExpectedState", route.nextExpectedState],
                  ["warnings", list(route.warnings)],
                  ["blockedReasons", list(route.blockedReasons)],
                  ["canCreateSearchRoute", b(route.canCreateSearchRoute)],
                  ["canExecuteSearchRoute", b(route.canExecuteSearchRoute)],
                  ["canOpenSearch", b(route.canOpenSearch)],
                  ["canFillSearchQuery", b(route.canFillSearchQuery)],
                  ["canWaitForResults", b(route.canWaitForResults)],
                  [
                    "canSelectMatchingInstrument",
                    b(route.canSelectMatchingInstrument),
                  ],
                  ["canNavigateToInstrument", b(route.canNavigateToInstrument)],
                  [
                    "canVerifyInstrumentIdentity",
                    b(route.canVerifyInstrumentIdentity),
                  ],
                  ["canLocateBuySellButtons", b(route.canLocateBuySellButtons)],
                  ["canClickBuyEntry", b(route.canClickBuyEntry)],
                  ["canClickSellEntry", b(route.canClickSellEntry)],
                  ["canSubmitOrder", b(route.canSubmitOrder)],
                  ["canReadCookies", b(route.canReadCookies)],
                  ["canExportSession", b(route.canExportSession)],
                  ["canAutomateBankId", b(route.canAutomateBankId)],
                  ["canBypassBankId", b(route.canBypassBankId)],
                  ["userMustConfirm", b(route.userMustConfirm)],
                  ["finalHumanClickRequired", b(route.finalHumanClickRequired)],
                  ["controlsEnabled", b(route.controlsEnabled)],
                  ["gateLocked", b(route.gateLocked)],
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

              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                {route.steps.map((step) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={step.stepId}
                  >
                    <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {step.type}
                    </p>
                    <p className="mt-1 font-semibold text-zinc-200">
                      {step.label}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                      {step.reason}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`targetSignalText=${step.targetSignalText ?? "none"} valueSource=${step.valueSource} safeDisplayValue=${step.safeDisplayValue ?? "none"}`}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`executableInThisTask=${b(step.executableInThisTask)} dryRunOnly=${b(step.dryRunOnly)} requiresHumanAction=${b(step.requiresHumanAction)} forbidden=${b(step.forbidden)}`}
                    </p>
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
