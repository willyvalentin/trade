import {
  avanzaTerminalLoginSmokeScriptFixtures,
  type AvanzaTerminalLoginSmokeScriptFixture,
} from "@/lib/avanza-terminal-login-smoke-script-fixtures";

type AvanzaTerminalLoginSmokeScriptHarnessProps = {
  fixtures?: readonly AvanzaTerminalLoginSmokeScriptFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaTerminalLoginSmokeScriptHarness({
  fixtures = avanzaTerminalLoginSmokeScriptFixtures,
}: AvanzaTerminalLoginSmokeScriptHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza terminal login smoke script",
            "Fixture/model only",
            "Terminal-only",
            "Explicit env opt-in required",
            "Manual local confirmation required",
            "Real-run requires extra flag",
            "CI blocked",
            "No Trade UI wiring",
            "No API route wiring",
            "No raw username shown",
            "No raw password shown",
            "No credential logging",
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
          Terminal script fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static safe reports only. This route does not run the terminal script,
          open a browser, resolve credentials, read cookies/session, automate
          BankID, submit orders, or click final KÖP/SÄLJ.
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
                  [
                    "credentialRuntimeBundleUsed",
                    formatBoolean(report.credentialRuntimeBundleUsed),
                  ],
                  ["usernameUsed", formatBoolean(report.usernameUsed)],
                  ["passwordUsed", formatBoolean(report.passwordUsed)],
                  ["loggedInLikely", formatBoolean(report.loggedInLikely)],
                  [
                    "bankIdOrMfaDetected",
                    formatBoolean(report.bankIdOrMfaDetected),
                  ],
                  ["warnings", formatList(report.warnings)],
                  ["blockedReasons", formatList(report.blockedReasons)],
                  [
                    "credentialMaterialReturnedToUi",
                    formatBoolean(report.credentialMaterialReturnedToUi),
                  ],
                  [
                    "credentialMaterialLogged",
                    formatBoolean(report.credentialMaterialLogged),
                  ],
                  ["cookiesRead", formatBoolean(report.cookiesRead)],
                  ["sessionExported", formatBoolean(report.sessionExported)],
                  ["orderSubmitted", formatBoolean(report.orderSubmitted)],
                  [
                    "finalBuySellClicked",
                    formatBoolean(report.finalBuySellClicked),
                  ],
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
                    "credentialValuesVisibleInReports",
                    formatBoolean(report.credentialValuesVisibleInReports),
                  ],
                  [
                    "canLogCredentialMaterial",
                    formatBoolean(report.canLogCredentialMaterial),
                  ],
                  ["userMustConfirm", formatBoolean(report.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(report.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", formatBoolean(report.controlsEnabled)],
                  ["gateLocked", formatBoolean(report.gateLocked)],
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
