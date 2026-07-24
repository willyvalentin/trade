import {
  avanzaLoginRoutePlannerFixtures,
  type AvanzaLoginRoutePlannerFixture,
} from "@/lib/avanza-login-route-planner-fixtures";

type AvanzaLoginRoutePlannerHarnessProps = {
  fixtures?: readonly AvanzaLoginRoutePlannerFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLoginRoutePlannerHarness({
  fixtures = avanzaLoginRoutePlannerFixtures,
}: AvanzaLoginRoutePlannerHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza login route planner",
            "Fixture only",
            "Route model only",
            "Privat/Företag from Ture Settings",
            "Username/password only",
            "BankID forbidden",
            "Planned steps are not executable yet",
            "No actual navigation",
            "No actual login",
            "No credential material",
            "No form fill",
            "No click",
            "No cookies/session",
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
          Login route plan fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static route-model results only. The planner can describe private and
          company username/password paths, including Användarnamn och lösenord,
          Företag, Användarnamn, Lösenord, and Logga in signals, but every
          planned action remains disabled and non-executable in this task.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const plan = fixture.plan;

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
                    {plan.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {plan.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["routePlanId", plan.routePlanId],
                  ["mode", plan.mode],
                  ["status", plan.status],
                  ["label", plan.label],
                  ["reason", plan.reason],
                  ["customerType", plan.customerType],
                  ["loginMethod", plan.loginMethod],
                  ["nextExpectedPageState", plan.nextExpectedPageState],
                  ["warnings", formatList(plan.warnings)],
                  ["blockedReasons", formatList(plan.blockedReasons)],
                  ["routePlanningEnabled", formatBoolean(plan.routePlanningEnabled)],
                  ["canPlanLoginRoute", formatBoolean(plan.canPlanLoginRoute)],
                  [
                    "canSelectPrivateToggle",
                    formatBoolean(plan.canSelectPrivateToggle),
                  ],
                  [
                    "canSelectCompanyToggle",
                    formatBoolean(plan.canSelectCompanyToggle),
                  ],
                  [
                    "canSelectUsernamePasswordMethod",
                    formatBoolean(plan.canSelectUsernamePasswordMethod),
                  ],
                  ["canFillUsername", formatBoolean(plan.canFillUsername)],
                  ["canFillPassword", formatBoolean(plan.canFillPassword)],
                  ["canSubmitLogin", formatBoolean(plan.canSubmitLogin)],
                  [
                    "canHandleCredentialMaterial",
                    formatBoolean(plan.canHandleCredentialMaterial),
                  ],
                  ["canAutomateBankId", formatBoolean(plan.canAutomateBankId)],
                  ["canBypassBankId", formatBoolean(plan.canBypassBankId)],
                  ["canReadCookies", formatBoolean(plan.canReadCookies)],
                  ["canExportSession", formatBoolean(plan.canExportSession)],
                  ["canNavigate", formatBoolean(plan.canNavigate)],
                  ["canClick", formatBoolean(plan.canClick)],
                  ["canFillForm", formatBoolean(plan.canFillForm)],
                  ["canSubmitOrder", formatBoolean(plan.canSubmitOrder)],
                  ["userMustConfirm", formatBoolean(plan.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(plan.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", formatBoolean(plan.controlsEnabled)],
                  ["gateLocked", formatBoolean(plan.gateLocked)],
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
                  Planned steps
                </p>
                {plan.steps.map((step) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                    key={step.stepId}
                  >
                    <p className="font-semibold text-zinc-100">
                      {step.type}: {step.label}
                    </p>
                    <p className="mt-1 leading-5 text-zinc-400">{step.reason}</p>
                    <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ["targetSignalText", step.targetSignalText ?? "none"],
                        ["expectedResult", step.expectedResult],
                        [
                          "allowedInThisTask",
                          formatBoolean(step.allowedInThisTask),
                        ],
                        [
                          "requiresHumanAction",
                          formatBoolean(step.requiresHumanAction),
                        ],
                        ["forbidden", formatBoolean(step.forbidden)],
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
