import {
  avanzaLoginActionContractFixtures,
  type AvanzaLoginActionContractFixture,
} from "@/lib/avanza-login-action-contract-fixtures";

type AvanzaLoginActionContractHarnessProps = {
  fixtures?: readonly AvanzaLoginActionContractFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLoginActionContractHarness({
  fixtures = avanzaLoginActionContractFixtures,
}: AvanzaLoginActionContractHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza login action contract",
            "Fixture only",
            "Contract only",
            "Planned actions are not executable yet",
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
          Login action contract fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static contract-model results only. The contract can translate route
          plans into future local-dev dry-run actions such as
          click_username_password_method, click_company_toggle, fill_username,
          fill_password, and click_login_submit, but every action remains
          dry-run only and non-executable in this task.
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Fixture statuses include action_plan_ready, waiting_for_credentials,
          and bankid_or_mfa_manual_action_required.
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
                  ["routeFixtureId", fixture.routeFixtureId ?? "none"],
                  ["contractId", contract.contractId],
                  ["mode", contract.mode],
                  ["status", contract.status],
                  ["label", contract.label],
                  ["reason", contract.reason],
                  ["customerType", contract.customerType],
                  ["loginMethod", contract.loginMethod],
                  ["nextExpectedPageState", contract.nextExpectedPageState],
                  ["warnings", formatList(contract.warnings)],
                  ["blockedReasons", formatList(contract.blockedReasons)],
                  ["contractEnabled", formatBoolean(contract.contractEnabled)],
                  [
                    "canCreateActionPlan",
                    formatBoolean(contract.canCreateActionPlan),
                  ],
                  ["canExecuteActions", formatBoolean(contract.canExecuteActions)],
                  [
                    "canClickUsernamePasswordMethod",
                    formatBoolean(contract.canClickUsernamePasswordMethod),
                  ],
                  [
                    "canClickPrivateToggle",
                    formatBoolean(contract.canClickPrivateToggle),
                  ],
                  [
                    "canClickCompanyToggle",
                    formatBoolean(contract.canClickCompanyToggle),
                  ],
                  ["canFillUsername", formatBoolean(contract.canFillUsername)],
                  ["canFillPassword", formatBoolean(contract.canFillPassword)],
                  [
                    "canClickLoginSubmit",
                    formatBoolean(contract.canClickLoginSubmit),
                  ],
                  [
                    "canHandleCredentialMaterial",
                    formatBoolean(contract.canHandleCredentialMaterial),
                  ],
                  [
                    "canReadCredentialMaterial",
                    formatBoolean(contract.canReadCredentialMaterial),
                  ],
                  [
                    "canReturnCredentialMaterial",
                    formatBoolean(contract.canReturnCredentialMaterial),
                  ],
                  [
                    "canLogCredentialMaterial",
                    formatBoolean(contract.canLogCredentialMaterial),
                  ],
                  ["canAutomateBankId", formatBoolean(contract.canAutomateBankId)],
                  ["canBypassBankId", formatBoolean(contract.canBypassBankId)],
                  ["canReadCookies", formatBoolean(contract.canReadCookies)],
                  ["canExportSession", formatBoolean(contract.canExportSession)],
                  ["canNavigate", formatBoolean(contract.canNavigate)],
                  ["canClick", formatBoolean(contract.canClick)],
                  ["canFillForm", formatBoolean(contract.canFillForm)],
                  ["canSubmitLogin", formatBoolean(contract.canSubmitLogin)],
                  ["canSubmitOrder", formatBoolean(contract.canSubmitOrder)],
                  ["userMustConfirm", formatBoolean(contract.userMustConfirm)],
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

              <div className="mt-3 grid gap-2">
                <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                  Planned actions
                </p>
                {contract.actions.map((action) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                    key={action.actionId}
                  >
                    <p className="font-semibold text-zinc-100">
                      {action.type}: {action.label}
                    </p>
                    <p className="mt-1 leading-5 text-zinc-400">
                      {action.reason}
                    </p>
                    <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ["targetSignalText", action.targetSignalText ?? "none"],
                        ["valueSource", action.valueSource],
                        [
                          "containsCredentialMaterial",
                          formatBoolean(action.containsCredentialMaterial),
                        ],
                        [
                          "executableInThisTask",
                          formatBoolean(action.executableInThisTask),
                        ],
                        ["dryRunOnly", formatBoolean(action.dryRunOnly)],
                        [
                          "requiresSecureCredentialProvider",
                          formatBoolean(action.requiresSecureCredentialProvider),
                        ],
                        [
                          "requiresHumanAction",
                          formatBoolean(action.requiresHumanAction),
                        ],
                        ["forbidden", formatBoolean(action.forbidden)],
                        ["expectedResult", action.expectedResult],
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
