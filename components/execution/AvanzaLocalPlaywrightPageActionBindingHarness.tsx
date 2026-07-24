import {
  avanzaLocalPlaywrightPageActionBindingFixtures,
  type AvanzaLocalPlaywrightPageActionBindingFixture,
} from "@/lib/avanza-local-playwright-page-action-binding-fixtures";

type AvanzaLocalPlaywrightPageActionBindingHarnessProps = {
  fixtures?: readonly AvanzaLocalPlaywrightPageActionBindingFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLocalPlaywrightPageActionBindingHarness({
  fixtures = avanzaLocalPlaywrightPageActionBindingFixtures,
}: AvanzaLocalPlaywrightPageActionBindingHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza local Playwright page action binding",
            "Fixture/mock only",
            "Injected Playwright-like page only",
            "Local/dev-only",
            "No Trade UI wiring",
            "No automatic Avanza navigation",
            "No raw credentials shown",
            "Fill values hidden in reports",
            "No cookies/session",
            "No BankID automation",
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
          Playwright page action binding fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static model states only. No Playwright package is imported here, no
          page action runs during render, and fixture output never includes fill
          values or credential material.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const state = fixture.state;

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
                  ["actionType", state.actionType],
                  ["valueUsed", formatBoolean(state.valueUsed)],
                  ["valueVisible", formatBoolean(state.valueVisible)],
                  ["snapshotRedacted", formatBoolean(state.snapshotRedacted)],
                  ["warnings", formatList(state.warnings)],
                  ["blockedReasons", formatList(state.blockedReasons)],
                  ["bindingEnabled", formatBoolean(state.bindingEnabled)],
                  ["localDevOnly", formatBoolean(state.localDevOnly)],
                  ["canClickByText", formatBoolean(state.canClickByText)],
                  ["canFillByLabel", formatBoolean(state.canFillByLabel)],
                  ["canWaitForState", formatBoolean(state.canWaitForState)],
                  [
                    "canReadPageSnapshot",
                    formatBoolean(state.canReadPageSnapshot),
                  ],
                  ["canNavigate", formatBoolean(state.canNavigate)],
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
