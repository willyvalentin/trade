import {
  avanzaLoginLocalDevExecutorFixtures,
  type AvanzaLoginLocalDevExecutorFixture,
} from "@/lib/avanza-login-local-dev-executor-fixtures";

type AvanzaLoginLocalDevExecutorHarnessProps = {
  fixtures?: readonly AvanzaLoginLocalDevExecutorFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLoginLocalDevExecutorHarness({
  fixtures = avanzaLoginLocalDevExecutorFixtures,
}: AvanzaLoginLocalDevExecutorHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza login local-dev executor",
            "Fixture/mock only",
            "Injected dependencies only",
            "No Trade UI wiring",
            "No raw credentials",
            "Credential references only",
            "No cookies/session",
            "BankID forbidden/manual-action only",
            "No order submission",
            "No final KÖP/SÄLJ click",
            "Local/dev-only",
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
          Login local-dev executor fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static local-dev executor reports only. The executor contract can
          call injected page-action functions, but this harness never runs a
          browser action, never reads credential material, never navigates to
          Avanza, never handles cookies/session, and never submits orders.
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Fixture statuses include ready, executed, missing_credentials,
          bankid_or_mfa_stop, page_action_failed, blocked, error, and unknown.
          Report fields include actionReports, valueReference,
          containsCredentialMaterial, realBrowserActionAttempted, and
          canResolveCredentialMaterial.
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Fixture IDs include successful_private_injected_execution_report,
          successful_company_injected_execution_report,
          dry_run_true_blocks_execution, missing_credentials,
          bankid_or_mfa_stop, click_username_password_method_failed,
          fill_username_failed, fill_password_failed, and
          click_login_submit_failed.
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
                  ["executorId", report.executorId],
                  ["createdAt", report.createdAt],
                  ["mode", report.mode],
                  ["status", report.status],
                  ["label", report.label],
                  ["reason", report.reason],
                  ["warnings", formatList(report.warnings)],
                  ["blockedReasons", formatList(report.blockedReasons)],
                  ["executorEnabled", formatBoolean(report.executorEnabled)],
                  ["localDevOnly", formatBoolean(report.localDevOnly)],
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
                  [
                    "canFillUsernameReference",
                    formatBoolean(report.canFillUsernameReference),
                  ],
                  [
                    "canFillPasswordReference",
                    formatBoolean(report.canFillPasswordReference),
                  ],
                  [
                    "canClickLoginSubmit",
                    formatBoolean(report.canClickLoginSubmit),
                  ],
                  [
                    "canResolveCredentialMaterial",
                    formatBoolean(report.canResolveCredentialMaterial),
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
                        ["actionStatus", action.actionStatus],
                        ["targetText", action.targetText],
                        ["targetLabel", action.targetLabel],
                        ["valueReference", action.valueReference],
                        [
                          "containsCredentialMaterial",
                          formatBoolean(action.containsCredentialMaterial),
                        ],
                        [
                          "realBrowserActionAttempted",
                          formatBoolean(action.realBrowserActionAttempted),
                        ],
                        ["expectedResult", action.expectedResult],
                        ["actualResult", action.actualResult],
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
