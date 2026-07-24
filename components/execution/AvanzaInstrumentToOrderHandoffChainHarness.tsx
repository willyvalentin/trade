import {
  avanzaInstrumentToOrderHandoffChainFixtures,
  type AvanzaInstrumentToOrderHandoffChainFixture,
} from "@/lib/avanza-instrument-to-order-handoff-chain-fixtures";

type Props = {
  fixtures?: readonly AvanzaInstrumentToOrderHandoffChainFixture[];
};

function b(value: boolean) {
  return value ? "true" : "false";
}

function list(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

function maybe(value: string | number | undefined) {
  return value === undefined ? "none" : String(value);
}

export function AvanzaInstrumentToOrderHandoffChainHarness({
  fixtures = avanzaInstrumentToOrderHandoffChainFixtures,
}: Props) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza instrument search to order ticket handoff chain",
            "Fixture/model only",
            "Full pre-submit chain modeled",
            "Execution package to instrument search modeled",
            "Instrument verification modeled",
            "Verified instrument to order ticket modeled",
            "BUY handoff chain modeled",
            "SELL handoff chain modeled",
            "Planned steps are not executable yet",
            "No real search execution",
            "No real Avanza navigation",
            "No real form fill",
            "No click",
            "No BUY/SELL entry click",
            "No final KÖP/SÄLJ click",
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
          Static chain state only. The model links execution package, instrument
          search contracts, verified instrument handoff, order ticket field
          plan, and order ticket action contract, then stops before final
          KÖP/SÄLJ.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const chain = fixture.chain;
          const verified = chain.verifiedInstrumentState;

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
                    {chain.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {chain.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["chainId", chain.chainId],
                  ["mode", chain.mode],
                  ["status", chain.status],
                  ["side", chain.side],
                  ["ticker", chain.ticker],
                  ["instrumentName", maybe(chain.instrumentName)],
                  ["quantity", maybe(chain.quantity)],
                  ["orderType", chain.orderType],
                  ["limitPrice", maybe(chain.limitPrice)],
                  ["nextExpectedState", chain.nextExpectedState],
                  ["warnings", list(chain.warnings)],
                  ["blockedReasons", list(chain.blockedReasons)],
                  ["chainEnabled", b(chain.chainEnabled)],
                  ["canBuildChain", b(chain.canBuildChain)],
                  ["canExecuteChain", b(chain.canExecuteChain)],
                  ["canSearchInstrument", b(chain.canSearchInstrument)],
                  ["canNavigateToInstrument", b(chain.canNavigateToInstrument)],
                  ["canVerifyInstrument", b(chain.canVerifyInstrument)],
                  ["canOpenBuyEntry", b(chain.canOpenBuyEntry)],
                  ["canOpenSellEntry", b(chain.canOpenSellEntry)],
                  ["canBuildOrderFieldPlan", b(chain.canBuildOrderFieldPlan)],
                  [
                    "canBuildOrderActionContract",
                    b(chain.canBuildOrderActionContract),
                  ],
                  ["canFillOrderFields", b(chain.canFillOrderFields)],
                  ["canClickFinalBuy", b(chain.canClickFinalBuy)],
                  ["canClickFinalSell", b(chain.canClickFinalSell)],
                  ["canSubmitOrder", b(chain.canSubmitOrder)],
                  ["canReadCookies", b(chain.canReadCookies)],
                  ["canExportSession", b(chain.canExportSession)],
                  ["canAutomateBankId", b(chain.canAutomateBankId)],
                  ["canBypassBankId", b(chain.canBypassBankId)],
                  ["userMustConfirm", b(chain.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    b(chain.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", b(chain.controlsEnabled)],
                  ["gateLocked", b(chain.gateLocked)],
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

              <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-xs">
                <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                  verifiedInstrumentState
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["verificationId", verified.verificationId],
                    ["status", verified.status],
                    ["ticker", verified.ticker],
                    ["instrumentName", maybe(verified.instrumentName)],
                    ["expectedMarket", maybe(verified.expectedMarket)],
                    ["observedMarket", maybe(verified.observedMarket)],
                    ["expectedCurrency", maybe(verified.expectedCurrency)],
                    ["observedCurrency", maybe(verified.observedCurrency)],
                    [
                      "expectedInstrumentType",
                      maybe(verified.expectedInstrumentType),
                    ],
                    [
                      "observedInstrumentType",
                      maybe(verified.observedInstrumentType),
                    ],
                    ["expectedIsin", maybe(verified.expectedIsin)],
                    ["observedIsin", maybe(verified.observedIsin)],
                    [
                      "instrumentIdentityMatched",
                      b(verified.instrumentIdentityMatched),
                    ],
                    ["marketplaceMatched", b(verified.marketplaceMatched)],
                    ["shortNameMatched", b(verified.shortNameMatched)],
                    [
                      "isinMatchedOrUnavailable",
                      b(verified.isinMatchedOrUnavailable),
                    ],
                    ["buyButtonLocated", b(verified.buyButtonLocated)],
                    ["sellButtonLocated", b(verified.sellButtonLocated)],
                    ["warnings", list(verified.warnings)],
                    ["blockedReasons", list(verified.blockedReasons)],
                  ].map(([label, value]) => (
                    <div
                      className="rounded-md border border-white/10 bg-white/[0.02] p-2"
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
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                {chain.steps.map((step) => (
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
