import {
  avanzaRealWorldInstrumentSearchSignalFixtures,
  type AvanzaRealWorldInstrumentSearchSignalFixture,
} from "@/lib/avanza-real-world-instrument-search-signals-fixtures";

type Props = {
  fixtures?: readonly AvanzaRealWorldInstrumentSearchSignalFixture[];
};

function b(value: boolean) {
  return value ? "true" : "false";
}

function list(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaRealWorldInstrumentSearchSignalsHarness({
  fixtures = avanzaRealWorldInstrumentSearchSignalFixtures,
}: Props) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza real-world instrument search signals",
            "Based on sanitized user-provided search screenshots",
            "Fixture/model only",
            "Search button recognized",
            "Search panel recognized",
            "Search input recognized",
            "Search results recognized",
            "Matching instrument recognized",
            "Instrument detail page recognized",
            "Instrument verification section recognized",
            "BUY/SELL entry buttons recognized",
            "No real search execution",
            "No real Avanza navigation",
            "No click",
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
          Static sanitized signal packs only. No search execution, navigation,
          form fill, click behavior, order submission, cookie/session handling,
          BankID automation, Trade UI wiring, or API route wiring is added.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const pack = fixture.signalPack;

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
                    {pack.step}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {pack.observedUrlKind}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStep", fixture.expectedStep],
                  ["signalPackId", pack.signalPackId],
                  ["source", pack.source],
                  ["step", pack.step],
                  ["side", pack.side],
                  ["visibleTexts", list(pack.visibleTexts)],
                  ["buttonTexts", list(pack.buttonTexts)],
                  ["inputLabels", list(pack.inputLabels)],
                  ["inputPlaceholders", list(pack.inputPlaceholders)],
                  ["resultTexts", list(pack.resultTexts)],
                  ["instrumentIdentityTexts", list(pack.instrumentIdentityTexts)],
                  ["verificationTexts", list(pack.verificationTexts)],
                  ["entryButtonTexts", list(pack.entryButtonTexts)],
                  ["warningTexts", list(pack.warningTexts)],
                  ["searchAvailable", b(pack.searchAvailable)],
                  ["searchPanelDetected", b(pack.searchPanelDetected)],
                  ["searchInputDetected", b(pack.searchInputDetected)],
                  ["searchResultsDetected", b(pack.searchResultsDetected)],
                  [
                    "matchingInstrumentDetected",
                    b(pack.matchingInstrumentDetected),
                  ],
                  ["instrumentPageDetected", b(pack.instrumentPageDetected)],
                  [
                    "instrumentVerificationDetected",
                    b(pack.instrumentVerificationDetected),
                  ],
                  ["buyButtonDetected", b(pack.buyButtonDetected)],
                  ["sellButtonDetected", b(pack.sellButtonDetected)],
                  ["canVerifyInstrument", b(pack.canVerifyInstrument)],
                  ["canOpenSearch", b(pack.canOpenSearch)],
                  ["canFillSearch", b(pack.canFillSearch)],
                  ["canSelectSearchResult", b(pack.canSelectSearchResult)],
                  ["canNavigateToInstrument", b(pack.canNavigateToInstrument)],
                  ["canClickBuy", b(pack.canClickBuy)],
                  ["canClickSell", b(pack.canClickSell)],
                  ["canSubmitOrder", b(pack.canSubmitOrder)],
                  ["canReadCookies", b(pack.canReadCookies)],
                  ["canExportSession", b(pack.canExportSession)],
                  ["canAutomateBankId", b(pack.canAutomateBankId)],
                  ["canBypassBankId", b(pack.canBypassBankId)],
                  ["userMustConfirm", b(pack.userMustConfirm)],
                  ["finalHumanClickRequired", b(pack.finalHumanClickRequired)],
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
