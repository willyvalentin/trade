import {
  avanzaLocalBrowserAgentRuntimeFixtures,
  type AvanzaLocalBrowserAgentRuntimeFixture,
} from "@/lib/avanza-local-browser-agent-runtime-fixtures";

type AvanzaLocalBrowserAgentRuntimeHarnessProps = {
  fixtures?: readonly AvanzaLocalBrowserAgentRuntimeFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLocalBrowserAgentRuntimeHarness({
  fixtures = avanzaLocalBrowserAgentRuntimeFixtures,
}: AvanzaLocalBrowserAgentRuntimeHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Local browser agent runtime",
            "Fixture only",
            "Local/dev-only",
            "No Avanza navigation yet",
            "No login yet",
            "No credential handling yet",
            "No form fill yet",
            "No API route call",
            "No fetch",
            "No order submission",
            "No final KÖP/SÄLJ click",
            "Final human confirmation required",
            "BankID bypass forbidden",
            "Controls disabled",
            "Gate locked",
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
          Local browser agent runtime fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness renders the first
          active-direction Sharp Semi Auto runtime layer as explicit local/dev
          model output. It does not launch a browser, connect to a browser,
          navigate to Avanza, log in, handle credentials, read cookies, export
          sessions, fill forms, click final KÖP/SÄLJ, submit orders, call an API
          route, fetch, or write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.modelResult;

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
                    {result.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {result.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fixture id", fixture.fixtureId],
                  ["Expected status", fixture.expectedStatus],
                  ["Status", result.status],
                  ["Label", result.label],
                  ["Mode", result.mode],
                  ["Reason", result.reason],
                  ["runtimeId", result.runtimeId],
                  ["createdAt", result.createdAt],
                  ["browserProvider", result.browserProvider],
                  ["localOnly", formatBoolean(result.localOnly)],
                  ["warnings", formatList(result.warnings)],
                  ["blockedReasons", formatList(result.blockedReasons)],
                  ["runtimeEnabled", formatBoolean(result.runtimeEnabled)],
                  ["localDevOnly", formatBoolean(result.localDevOnly)],
                  ["canLaunchBrowser", formatBoolean(result.canLaunchBrowser)],
                  [
                    "canConnectToExistingBrowser",
                    formatBoolean(result.canConnectToExistingBrowser),
                  ],
                  ["canNavigate", formatBoolean(result.canNavigate)],
                  ["canReadPage", formatBoolean(result.canReadPage)],
                  ["canFillForm", formatBoolean(result.canFillForm)],
                  ["canClick", formatBoolean(result.canClick)],
                  [
                    "canClickFinalBuy",
                    formatBoolean(result.canClickFinalBuy),
                  ],
                  [
                    "canClickFinalSell",
                    formatBoolean(result.canClickFinalSell),
                  ],
                  ["canSubmitOrder", formatBoolean(result.canSubmitOrder)],
                  [
                    "canHandleCredentials",
                    formatBoolean(result.canHandleCredentials),
                  ],
                  ["canReadCookies", formatBoolean(result.canReadCookies)],
                  ["canExportSession", formatBoolean(result.canExportSession)],
                  ["canBypassBankId", formatBoolean(result.canBypassBankId)],
                  [
                    "canWriteSupabaseExecution",
                    formatBoolean(result.canWriteSupabaseExecution),
                  ],
                  ["userMustConfirm", formatBoolean(result.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(result.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", formatBoolean(result.controlsEnabled)],
                  ["gateLocked", formatBoolean(result.gateLocked)],
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
