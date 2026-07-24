import {
  avanzaLocalPlaywrightOrderPageActionBindingFixtures,
  type AvanzaLocalPlaywrightOrderPageActionBindingFixture,
} from "@/lib/avanza-local-playwright-order-page-action-binding-fixtures";

type Props = {
  fixtures?: readonly AvanzaLocalPlaywrightOrderPageActionBindingFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

const safetyCopy = [
  "Avanza local Playwright order/search page action binding",
  "Fixture/mock only",
  "Injected Playwright-like page only",
  "Local/dev-only",
  "Search actions modeled",
  "Instrument verification snapshots modeled",
  "BUY/SELL entry location modeled",
  "Order field fill actions modeled",
  "Order review snapshot modeled",
  "Fill values hidden in reports",
  "No automatic Avanza navigation",
  "No final KÖP/SÄLJ click",
  "No order submission",
  "No cookies/session",
  "No BankID automation",
  "No Trade UI wiring",
  "No API route wiring",
  "Not production ready",
] as const;

export function AvanzaLocalPlaywrightOrderPageActionBindingHarness({
  fixtures = avanzaLocalPlaywrightOrderPageActionBindingFixtures,
}: Props) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {safetyCopy.map((copy) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={copy}
            >
              {copy}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-100">
          Order/search page action binding fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static model states only. No Playwright package is imported here, no
          page action runs during render, and fixture output never includes fill
          values, credentials, cookies, or session material.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const state = fixture.state;

          return (
            <article
              className="rounded-md border border-white/10 bg-white/[0.02] p-3"
              data-fixture-id={fixture.fixtureId}
              key={fixture.fixtureId}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.fixtureId}: {fixture.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {state.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {state.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["bindingId", state.bindingId],
                  ["createdAt", state.createdAt],
                  ["mode", state.mode],
                  ["status", state.status],
                  ["label", state.label],
                  ["reason", state.reason],
                  ["actionType", state.actionType],
                  ["valueUsed", formatBoolean(state.valueUsed)],
                  ["valueVisible", formatBoolean(state.valueVisible)],
                  ["located", formatBoolean(state.located)],
                  ["snapshotRedacted", formatBoolean(state.snapshotRedacted)],
                  ["warnings", formatList(state.warnings)],
                  ["blockedReasons", formatList(state.blockedReasons)],
                  ["bindingEnabled", formatBoolean(state.bindingEnabled)],
                  ["localDevOnly", formatBoolean(state.localDevOnly)],
                  ["canClickByText", formatBoolean(state.canClickByText)],
                  ["canFillByLabel", formatBoolean(state.canFillByLabel)],
                  [
                    "canFillSearchInput",
                    formatBoolean(state.canFillSearchInput),
                  ],
                  [
                    "canWaitForSearchResults",
                    formatBoolean(state.canWaitForSearchResults),
                  ],
                  [
                    "canSelectSearchResultByText",
                    formatBoolean(state.canSelectSearchResultByText),
                  ],
                  [
                    "canReadInstrumentVerificationSnapshot",
                    formatBoolean(state.canReadInstrumentVerificationSnapshot),
                  ],
                  [
                    "canLocateBuySellEntry",
                    formatBoolean(state.canLocateBuySellEntry),
                  ],
                  [
                    "canFillOrderField",
                    formatBoolean(state.canFillOrderField),
                  ],
                  [
                    "canWaitForOrderReviewState",
                    formatBoolean(state.canWaitForOrderReviewState),
                  ],
                  [
                    "canReadOrderReviewSnapshot",
                    formatBoolean(state.canReadOrderReviewSnapshot),
                  ],
                  [
                    "canNavigateAutomatically",
                    formatBoolean(state.canNavigateAutomatically),
                  ],
                  ["canReadCookies", formatBoolean(state.canReadCookies)],
                  ["canExportSession", formatBoolean(state.canExportSession)],
                  ["canSubmitOrder", formatBoolean(state.canSubmitOrder)],
                  ["canClickFinalBuy", formatBoolean(state.canClickFinalBuy)],
                  ["canClickFinalSell", formatBoolean(state.canClickFinalSell)],
                  ["canAutomateBankId", formatBoolean(state.canAutomateBankId)],
                  ["canBypassBankId", formatBoolean(state.canBypassBankId)],
                  [
                    "credentialValuesVisibleInReports",
                    formatBoolean(state.credentialValuesVisibleInReports),
                  ],
                  [
                    "canLogCredentialMaterial",
                    formatBoolean(state.canLogCredentialMaterial),
                  ],
                  ["userMustConfirm", formatBoolean(state.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(state.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", formatBoolean(state.controlsEnabled)],
                  ["gateLocked", formatBoolean(state.gateLocked)],
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
