import {
  avanzaOrderTicketActionContractFixtures,
  type AvanzaOrderTicketActionContractFixture,
} from "@/lib/avanza-order-ticket-action-contract-fixtures";

type AvanzaOrderTicketActionContractHarnessProps = {
  fixtures?: readonly AvanzaOrderTicketActionContractFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaOrderTicketActionContractHarness({
  fixtures = avanzaOrderTicketActionContractFixtures,
}: AvanzaOrderTicketActionContractHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza order ticket action contract",
            "Fixture/model only",
            "Contract only",
            "BUY action plan modeled",
            "SELL action plan modeled",
            "Limit orders only",
            "Planned actions are not executable yet",
            "No real form fill",
            "No click",
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
        <h3 className="mt-3 text-sm font-semibold text-zinc-100">
          Order ticket action contract fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static action-plan results only. The contract translates an explicit
          order ticket field plan into future preparation steps. It does not
          fill Avanza fields, click, submit orders, read cookies/session,
          automate BankID, call an API route, or write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const contract = fixture.contract;

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
                    {contract.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {contract.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["contractId", contract.contractId],
                  ["mode", contract.mode],
                  ["status", contract.status],
                  ["side", contract.side],
                  ["ticker", contract.ticker],
                  ["quantity", contract.quantity ?? "missing"],
                  ["orderType", contract.orderType],
                  ["limitPrice", contract.limitPrice ?? "missing"],
                  ["nextExpectedOrderState", contract.nextExpectedOrderState],
                  ["warnings", formatList(contract.warnings)],
                  ["blockedReasons", formatList(contract.blockedReasons)],
                  ["contractEnabled", formatBoolean(contract.contractEnabled)],
                  [
                    "canCreateActionPlan",
                    formatBoolean(contract.canCreateActionPlan),
                  ],
                  [
                    "canExecuteActions",
                    formatBoolean(contract.canExecuteActions),
                  ],
                  ["canSelectBuySide", formatBoolean(contract.canSelectBuySide)],
                  [
                    "canSelectSellSide",
                    formatBoolean(contract.canSelectSellSide),
                  ],
                  ["canSelectAccount", formatBoolean(contract.canSelectAccount)],
                  ["canFillTicker", formatBoolean(contract.canFillTicker)],
                  [
                    "canConfirmInstrument",
                    formatBoolean(contract.canConfirmInstrument),
                  ],
                  ["canFillQuantity", formatBoolean(contract.canFillQuantity)],
                  [
                    "canSelectLimitOrder",
                    formatBoolean(contract.canSelectLimitOrder),
                  ],
                  [
                    "canFillLimitPrice",
                    formatBoolean(contract.canFillLimitPrice),
                  ],
                  [
                    "canSelectTimeInForce",
                    formatBoolean(contract.canSelectTimeInForce),
                  ],
                  ["canReviewOrder", formatBoolean(contract.canReviewOrder)],
                  ["canClickFinalBuy", formatBoolean(contract.canClickFinalBuy)],
                  [
                    "canClickFinalSell",
                    formatBoolean(contract.canClickFinalSell),
                  ],
                  ["canSubmitOrder", formatBoolean(contract.canSubmitOrder)],
                  [
                    "canUseMarketOrder",
                    formatBoolean(contract.canUseMarketOrder),
                  ],
                  ["canReadCookies", formatBoolean(contract.canReadCookies)],
                  [
                    "canExportSession",
                    formatBoolean(contract.canExportSession),
                  ],
                  [
                    "canAutomateBankId",
                    formatBoolean(contract.canAutomateBankId),
                  ],
                  [
                    "canBypassBankId",
                    formatBoolean(contract.canBypassBankId),
                  ],
                  [
                    "userMustConfirm",
                    formatBoolean(contract.userMustConfirm),
                  ],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(contract.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", formatBoolean(contract.controlsEnabled)],
                  ["gateLocked", formatBoolean(contract.gateLocked)],
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
                {contract.actions.map((action) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={action.actionId}
                  >
                    <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {action.type}
                    </p>
                    <p className="mt-1 font-semibold text-zinc-200">
                      {action.label}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                      {action.reason}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`valueSource=${action.valueSource} safeDisplayValue=${action.safeDisplayValue ?? "none"} targetSignalText=${action.targetSignalText ?? "none"}`}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`containsCredentialMaterial=${formatBoolean(action.containsCredentialMaterial)} executableInThisTask=${formatBoolean(action.executableInThisTask)} dryRunOnly=${formatBoolean(action.dryRunOnly)} requiresHumanAction=${formatBoolean(action.requiresHumanAction)} forbidden=${formatBoolean(action.forbidden)}`}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                      {action.expectedResult}
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
