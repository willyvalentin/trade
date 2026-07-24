import {
  avanzaOrderTicketFieldContractFixtures,
  type AvanzaOrderTicketFieldContractFixture,
} from "@/lib/avanza-order-ticket-field-contract-fixtures";

type AvanzaOrderTicketFieldContractHarnessProps = {
  fixtures?: readonly AvanzaOrderTicketFieldContractFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaOrderTicketFieldContractHarness({
  fixtures = avanzaOrderTicketFieldContractFixtures,
}: AvanzaOrderTicketFieldContractHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza BUY/SELL order ticket field contract",
            "Fixture/model only",
            "Limit orders only",
            "BUY preparation modeled",
            "SELL preparation modeled",
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
          Order ticket field contract fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static field-plan results only. The contract maps explicit package
          input into safe display fields for future review. It does not fill
          Avanza fields, click, submit orders, read cookies/session, automate
          BankID, or write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const fieldPlan = fixture.fieldPlan;

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
                    {fieldPlan.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {fieldPlan.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["fieldPlanId", fieldPlan.fieldPlanId],
                  ["status", fieldPlan.status],
                  ["side", fieldPlan.side],
                  ["ticker", fieldPlan.ticker],
                  ["quantity", fieldPlan.quantity ?? "missing"],
                  ["orderType", fieldPlan.orderType],
                  ["limitPrice", fieldPlan.limitPrice ?? "missing"],
                  ["timeInForce", fieldPlan.timeInForce],
                  ["warnings", formatList(fieldPlan.warnings)],
                  ["blockedReasons", formatList(fieldPlan.blockedReasons)],
                  ["fieldPlanEnabled", formatBoolean(fieldPlan.fieldPlanEnabled)],
                  ["canMapFields", formatBoolean(fieldPlan.canMapFields)],
                  ["canFillFields", formatBoolean(fieldPlan.canFillFields)],
                  ["canClickBuy", formatBoolean(fieldPlan.canClickBuy)],
                  ["canClickSell", formatBoolean(fieldPlan.canClickSell)],
                  ["canSubmitOrder", formatBoolean(fieldPlan.canSubmitOrder)],
                  [
                    "canUseMarketOrder",
                    formatBoolean(fieldPlan.canUseMarketOrder),
                  ],
                  [
                    "canUseLimitOrder",
                    formatBoolean(fieldPlan.canUseLimitOrder),
                  ],
                  ["canPrepareBuy", formatBoolean(fieldPlan.canPrepareBuy)],
                  ["canPrepareSell", formatBoolean(fieldPlan.canPrepareSell)],
                  ["canReadCookies", formatBoolean(fieldPlan.canReadCookies)],
                  [
                    "canExportSession",
                    formatBoolean(fieldPlan.canExportSession),
                  ],
                  [
                    "canAutomateBankId",
                    formatBoolean(fieldPlan.canAutomateBankId),
                  ],
                  [
                    "canBypassBankId",
                    formatBoolean(fieldPlan.canBypassBankId),
                  ],
                  [
                    "userMustConfirm",
                    formatBoolean(fieldPlan.userMustConfirm),
                  ],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(fieldPlan.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", formatBoolean(fieldPlan.controlsEnabled)],
                  ["gateLocked", formatBoolean(fieldPlan.gateLocked)],
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

              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {fieldPlan.fields.map((field) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={field.key}
                  >
                    <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {field.label}
                    </p>
                    <p className="mt-1 font-semibold text-zinc-200">
                      {field.safeDisplayValue}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`required=${formatBoolean(field.required)} filledByAgentInThisTask=${formatBoolean(field.filledByAgentInThisTask)} review=${formatBoolean(field.requiresUserReview)} forbidden=${formatBoolean(field.forbidden)}`}
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
