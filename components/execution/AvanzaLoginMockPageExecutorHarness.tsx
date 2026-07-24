import {
  avanzaLoginMockPageExecutorFixtures,
  type AvanzaLoginMockPageExecutorFixture,
} from "@/lib/avanza-login-mock-page-executor-fixtures";

type AvanzaLoginMockPageExecutorHarnessProps = {
  fixtures?: readonly AvanzaLoginMockPageExecutorFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLoginMockPageExecutorHarness({
  fixtures = avanzaLoginMockPageExecutorFixtures,
}: AvanzaLoginMockPageExecutorHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza login mock page executor",
            "Fixture only",
            "Mock only",
            "Simulated page state only",
            "No real browser actions",
            "No actual Avanza navigation",
            "No actual login",
            "No credential material",
            "No password values",
            "No real form fill",
            "No real click",
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
          Login mock page executor fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static mock-page results only. The mock executor consumes login action
          contract and dry-run report output, then simulates private/company
          login actions against an in-memory page model. It never uses
          Playwright, never navigates to Avanza, never reads credential
          material, never fills a real form, never clicks a real button, and
          never submits login or orders.
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Fixture statuses include mock_executed, mock_missing_credentials,
          mock_bankid_or_mfa_stop, mock_blocked, mock_error, and unknown.
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
                  ["reportId", report.reportId],
                  ["createdAt", report.createdAt],
                  ["mode", report.mode],
                  ["status", report.status],
                  ["label", report.label],
                  ["reason", report.reason],
                  ["initialPageStateKind", report.initialPageStateKind],
                  ["finalPageStateKind", report.finalPageStateKind],
                  ["warnings", formatList(report.warnings)],
                  ["blockedReasons", formatList(report.blockedReasons)],
                  [
                    "mockExecutorEnabled",
                    formatBoolean(report.mockExecutorEnabled),
                  ],
                  ["mockOnly", formatBoolean(report.mockOnly)],
                  [
                    "canExecuteMockActions",
                    formatBoolean(report.canExecuteMockActions),
                  ],
                  [
                    "canExecuteRealBrowserActions",
                    formatBoolean(report.canExecuteRealBrowserActions),
                  ],
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
                  [
                    "canFillUsernameReal",
                    formatBoolean(report.canFillUsernameReal),
                  ],
                  [
                    "canFillPasswordReal",
                    formatBoolean(report.canFillPasswordReal),
                  ],
                  ["canClickReal", formatBoolean(report.canClickReal)],
                  [
                    "canClickLoginSubmitReal",
                    formatBoolean(report.canClickLoginSubmitReal),
                  ],
                  ["canAutomateBankId", formatBoolean(report.canAutomateBankId)],
                  ["canBypassBankId", formatBoolean(report.canBypassBankId)],
                  ["canReadCookies", formatBoolean(report.canReadCookies)],
                  ["canExportSession", formatBoolean(report.canExportSession)],
                  [
                    "canNavigateRealBrowser",
                    formatBoolean(report.canNavigateRealBrowser),
                  ],
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
                        ["executionStatus", action.executionStatus],
                        ["simulatedTargetText", action.simulatedTargetText],
                        ["simulatedValueSource", action.simulatedValueSource],
                        [
                          "containsCredentialMaterial",
                          formatBoolean(action.containsCredentialMaterial),
                        ],
                        [
                          "realBrowserAction",
                          formatBoolean(action.realBrowserAction),
                        ],
                        ["expectedResult", action.expectedResult],
                        ["actualMockResult", action.actualMockResult],
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
