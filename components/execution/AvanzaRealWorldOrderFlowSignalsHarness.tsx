import {
  avanzaRealWorldOrderFlowSignalFixtures,
  type AvanzaRealWorldOrderFlowSignalFixture,
} from "@/lib/avanza-real-world-order-flow-signals-fixtures";

type AvanzaRealWorldOrderFlowSignalsHarnessProps = {
  fixtures?: readonly AvanzaRealWorldOrderFlowSignalFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaRealWorldOrderFlowSignalsHarness({
  fixtures = avanzaRealWorldOrderFlowSignalFixtures,
}: AvanzaRealWorldOrderFlowSignalsHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza real-world order flow signals",
            "Based on sanitized user-provided buy-flow material",
            "Fixture/model only",
            "BUY flow recognized",
            "SELL flow modeled from same structure",
            "Order panel recognized",
            "Review step recognized",
            "Success confirmation recognized",
            "Failed confirmation recognized",
            "Order list/detail recognized",
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
          Sanitized BUY/SELL order-flow signal fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static signal pack results only. BUY is based on sanitized
          user-provided buy-flow material. SELL is modeled from the same flow
          structure with sell labels. These fixtures do not fill fields, click,
          submit orders, read cookies/session, automate BankID, or write
          execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const signalPack = fixture.signalPack;

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
                    {signalPack.finalActionDetected
                      ? "Final action text is detected for human-boundary planning only and remains forbidden for automation."
                      : "Order-flow cue is available as a sanitized planning signal only."}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {signalPack.step}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedSide", fixture.expectedSide],
                  ["expectedStep", fixture.expectedStep],
                  ["signalPackId", signalPack.signalPackId],
                  ["source", signalPack.source],
                  ["observedUrlKind", signalPack.observedUrlKind],
                  ["side", signalPack.side],
                  ["step", signalPack.step],
                  ["visibleTexts", formatList(signalPack.visibleTexts)],
                  ["buttonTexts", formatList(signalPack.buttonTexts)],
                  ["formLabels", formatList(signalPack.formLabels)],
                  ["fieldLabels", formatList(signalPack.fieldLabels)],
                  ["tabs", formatList(signalPack.tabs)],
                  ["statusTexts", formatList(signalPack.statusTexts)],
                  [
                    "confirmationTexts",
                    formatList(signalPack.confirmationTexts),
                  ],
                  ["warningTexts", formatList(signalPack.warningTexts)],
                  ["failureTexts", formatList(signalPack.failureTexts)],
                  ["successTexts", formatList(signalPack.successTexts)],
                  [
                    "finalActionDetected",
                    formatBoolean(signalPack.finalActionDetected),
                  ],
                  [
                    "finalActionForbidden",
                    formatBoolean(signalPack.finalActionForbidden),
                  ],
                  ["warnings", formatList(signalPack.warnings)],
                  ["blockedReasons", formatList(signalPack.blockedReasons)],
                  ["sanitized", formatBoolean(signalPack.sanitized)],
                  [
                    "containsCredentials",
                    formatBoolean(signalPack.containsCredentials),
                  ],
                  [
                    "containsPassword",
                    formatBoolean(signalPack.containsPassword),
                  ],
                  [
                    "containsPersonalIdentityNumber",
                    formatBoolean(signalPack.containsPersonalIdentityNumber),
                  ],
                  [
                    "containsAccountNumber",
                    formatBoolean(signalPack.containsAccountNumber),
                  ],
                  ["containsCookie", formatBoolean(signalPack.containsCookie)],
                  [
                    "containsSessionToken",
                    formatBoolean(signalPack.containsSessionToken),
                  ],
                  [
                    "containsBankIdQr",
                    formatBoolean(signalPack.containsBankIdQr),
                  ],
                  ["containsOrderId", formatBoolean(signalPack.containsOrderId)],
                  [
                    "canUseForOrderPlanning",
                    formatBoolean(signalPack.canUseForOrderPlanning),
                  ],
                  [
                    "canUseForSelectorPlanning",
                    formatBoolean(signalPack.canUseForSelectorPlanning),
                  ],
                  [
                    "canFillOrderFields",
                    formatBoolean(signalPack.canFillOrderFields),
                  ],
                  ["canClickBuy", formatBoolean(signalPack.canClickBuy)],
                  ["canClickSell", formatBoolean(signalPack.canClickSell)],
                  ["canSubmitOrder", formatBoolean(signalPack.canSubmitOrder)],
                  ["canReadCookies", formatBoolean(signalPack.canReadCookies)],
                  ["canExportSession", formatBoolean(signalPack.canExportSession)],
                  [
                    "canAutomateBankId",
                    formatBoolean(signalPack.canAutomateBankId),
                  ],
                  [
                    "canBypassBankId",
                    formatBoolean(signalPack.canBypassBankId),
                  ],
                  [
                    "userMustConfirm",
                    formatBoolean(signalPack.userMustConfirm),
                  ],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(signalPack.finalHumanClickRequired),
                  ],
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
