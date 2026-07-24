import {
  avanzaLoginLocalDevCredentialExecutorFixtures,
  type AvanzaLoginLocalDevCredentialExecutorFixture,
} from "@/lib/avanza-login-local-dev-credential-executor-fixtures";

type AvanzaLoginLocalDevCredentialExecutorHarnessProps = {
  fixtures?: readonly AvanzaLoginLocalDevCredentialExecutorFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLoginLocalDevCredentialExecutorHarness({
  fixtures = avanzaLoginLocalDevCredentialExecutorFixtures,
}: AvanzaLoginLocalDevCredentialExecutorHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza local-dev login executor with credential bundle",
            "Fixture/mock only",
            "Injected dependencies only",
            "Local/dev-only",
            "Runtime credential bundle used internally only",
            "No raw username shown",
            "No raw password shown",
            "No credential logging",
            "No Supabase credential storage",
            "No localStorage credential storage",
            "No cookies/session",
            "BankID forbidden/manual-action only",
            "No order submission",
            "No final KÖP/SÄLJ click",
            "No Trade UI wiring",
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
          Local-dev credential executor fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static safe reports only. Runtime credential bundle values are never
          rendered by this harness. The section shows action status, usage
          booleans, safety flags, warnings, and blocked reasons only.
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
                    {report.reason}
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
                  ["reportId", report.reportId],
                  ["createdAt", report.createdAt],
                  ["mode", report.mode],
                  ["status", report.status],
                  ["label", report.label],
                  ["usernameUsed", formatBoolean(report.usernameUsed)],
                  ["passwordUsed", formatBoolean(report.passwordUsed)],
                  [
                    "credentialMaterialReturnedToUi",
                    formatBoolean(report.credentialMaterialReturnedToUi),
                  ],
                  [
                    "credentialMaterialLogged",
                    formatBoolean(report.credentialMaterialLogged),
                  ],
                  [
                    "credentialMaterialStoredInSupabase",
                    formatBoolean(report.credentialMaterialStoredInSupabase),
                  ],
                  [
                    "credentialMaterialStoredInLocalStorage",
                    formatBoolean(report.credentialMaterialStoredInLocalStorage),
                  ],
                  ["warnings", formatList(report.warnings)],
                  ["blockedReasons", formatList(report.blockedReasons)],
                  ["executorEnabled", formatBoolean(report.executorEnabled)],
                  ["localDevOnly", formatBoolean(report.localDevOnly)],
                  [
                    "canUseRuntimeCredentialBundle",
                    formatBoolean(report.canUseRuntimeCredentialBundle),
                  ],
                  [
                    "canExecuteLocalDevActions",
                    formatBoolean(report.canExecuteLocalDevActions),
                  ],
                  [
                    "canClickUsernamePasswordMethod",
                    formatBoolean(report.canClickUsernamePasswordMethod),
                  ],
                  [
                    "canClickCustomerToggle",
                    formatBoolean(report.canClickCustomerToggle),
                  ],
                  ["canFillUsername", formatBoolean(report.canFillUsername)],
                  ["canFillPassword", formatBoolean(report.canFillPassword)],
                  [
                    "canClickLoginSubmit",
                    formatBoolean(report.canClickLoginSubmit),
                  ],
                  [
                    "canReturnCredentialMaterialToUi",
                    formatBoolean(report.canReturnCredentialMaterialToUi),
                  ],
                  [
                    "canLogCredentialMaterial",
                    formatBoolean(report.canLogCredentialMaterial),
                  ],
                  [
                    "canStoreCredentialMaterialInSupabase",
                    formatBoolean(report.canStoreCredentialMaterialInSupabase),
                  ],
                  [
                    "canStoreCredentialMaterialInLocalStorage",
                    formatBoolean(
                      report.canStoreCredentialMaterialInLocalStorage,
                    ),
                  ],
                  ["canAutomateBankId", formatBoolean(report.canAutomateBankId)],
                  ["canBypassBankId", formatBoolean(report.canBypassBankId)],
                  ["canReadCookies", formatBoolean(report.canReadCookies)],
                  ["canExportSession", formatBoolean(report.canExportSession)],
                  ["canSubmitOrder", formatBoolean(report.canSubmitOrder)],
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

              <div className="mt-3 grid gap-2">
                <p className="text-xs font-semibold text-zinc-300">
                  actionReports
                </p>
                {report.actionReports.map((action) => (
                  <dl
                    className="grid gap-2 rounded-md border border-white/10 bg-black/20 p-2 text-xs sm:grid-cols-2 lg:grid-cols-4"
                    key={`${fixture.fixtureId}-${action.actionId}`}
                  >
                    {[
                      ["actionId", action.actionId],
                      ["actionType", action.actionType],
                      ["actionStatus", action.actionStatus],
                      ["label", action.label],
                      ["targetText", action.targetText],
                      ["targetLabel", action.targetLabel],
                      ["valueSource", action.valueSource],
                      ["usernameUsed", formatBoolean(action.usernameUsed)],
                      ["passwordUsed", formatBoolean(action.passwordUsed)],
                      [
                        "credentialMaterialReturnedToUi",
                        formatBoolean(action.credentialMaterialReturnedToUi),
                      ],
                      [
                        "credentialMaterialLogged",
                        formatBoolean(action.credentialMaterialLogged),
                      ],
                      [
                        "credentialMaterialStoredInSupabase",
                        formatBoolean(
                          action.credentialMaterialStoredInSupabase,
                        ),
                      ],
                      [
                        "credentialMaterialStoredInLocalStorage",
                        formatBoolean(
                          action.credentialMaterialStoredInLocalStorage,
                        ),
                      ],
                      [
                        "containsCredentialMaterial",
                        formatBoolean(action.containsCredentialMaterial),
                      ],
                      [
                        "dependencyInvoked",
                        formatBoolean(action.dependencyInvoked),
                      ],
                      ["expectedResult", action.expectedResult],
                      ["actualResult", action.actualResult],
                      ["blockedReason", action.blockedReason],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                          {label}
                        </dt>
                        <dd className="mt-1 font-semibold text-zinc-200">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
