import {
  avanzaLoginDryRunExecutorFixtures,
  type AvanzaLoginDryRunExecutorFixture,
} from "@/lib/avanza-login-dry-run-executor-fixtures";

type AvanzaLoginDryRunExecutorHarnessProps = {
  fixtures?: readonly AvanzaLoginDryRunExecutorFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLoginDryRunExecutorHarness({
  fixtures = avanzaLoginDryRunExecutorFixtures,
}: AvanzaLoginDryRunExecutorHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza login dry-run executor",
            "Fixture only",
            "Dry-run only",
            "No actual navigation",
            "No actual login",
            "No credential material",
            "No password values",
            "No form fill",
            "No click",
            "No cookies/session",
            "BankID forbidden/manual-action only",
            "No order submission",
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
          Login dry-run executor fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static executor-model results only. The dry-run report consumes the
          login action contract and checks whether a future local-dev login
          sequence is internally coherent without running browser actions,
          reading credential material, filling fields, clicking, navigating,
          reading cookies, or submitting orders.
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Fixture statuses include dry_run_passed, dry_run_missing_credentials,
          dry_run_bankid_or_mfa_stop, dry_run_blocked, dry_run_error, and
          unknown.
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
                  ["routeFixtureId", fixture.routeFixtureId ?? "none"],
                  ["dryRunId", report.dryRunId],
                  ["createdAt", report.createdAt],
                  ["mode", report.mode],
                  ["status", report.status],
                  ["label", report.label],
                  ["reason", report.reason],
                  ["customerType", report.customerType],
                  ["loginMethod", report.loginMethod],
                  ["nextExpectedPageState", report.nextExpectedPageState],
                  ["warnings", formatList(report.warnings)],
                  ["blockedReasons", formatList(report.blockedReasons)],
                  ["dryRunEnabled", formatBoolean(report.dryRunEnabled)],
                  ["canDryRun", formatBoolean(report.canDryRun)],
                  ["canExecuteActions", formatBoolean(report.canExecuteActions)],
                  [
                    "canReadCredentialMaterial",
                    formatBoolean(report.canReadCredentialMaterial),
                  ],
                  [
                    "canReturnCredentialMaterial",
                    formatBoolean(report.canReturnCredentialMaterial),
                  ],
                  [
                    "canLogCredentialMaterial",
                    formatBoolean(report.canLogCredentialMaterial),
                  ],
                  ["canFillUsername", formatBoolean(report.canFillUsername)],
                  ["canFillPassword", formatBoolean(report.canFillPassword)],
                  ["canClick", formatBoolean(report.canClick)],
                  [
                    "canClickLoginSubmit",
                    formatBoolean(report.canClickLoginSubmit),
                  ],
                  ["canAutomateBankId", formatBoolean(report.canAutomateBankId)],
                  ["canBypassBankId", formatBoolean(report.canBypassBankId)],
                  ["canReadCookies", formatBoolean(report.canReadCookies)],
                  ["canExportSession", formatBoolean(report.canExportSession)],
                  ["canNavigate", formatBoolean(report.canNavigate)],
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
                <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                  Action reports
                </p>
                {report.actionReports.map((action) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                    key={`${fixture.fixtureId}-${action.actionId}`}
                  >
                    <p className="font-semibold text-zinc-100">
                      {action.actionType}: {action.label}
                    </p>
                    <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ["actionId", action.actionId],
                        ["actionType", action.actionType],
                        ["dryRunStatus", action.dryRunStatus],
                        [
                          "wouldTargetSignalText",
                          action.wouldTargetSignalText,
                        ],
                        [
                          "wouldUseCredentialReference",
                          formatBoolean(action.wouldUseCredentialReference),
                        ],
                        [
                          "containsCredentialMaterial",
                          formatBoolean(action.containsCredentialMaterial),
                        ],
                        ["executableNow", formatBoolean(action.executableNow)],
                        ["expectedResult", action.expectedResult],
                        ["blockedReason", action.blockedReason],
                      ].map(([label, value]) => (
                        <div
                          className="rounded border border-white/10 bg-white/[0.02] p-2"
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
