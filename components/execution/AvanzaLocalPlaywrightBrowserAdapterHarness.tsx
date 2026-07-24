import {
  avanzaLocalPlaywrightBrowserAdapterFixtures,
  type AvanzaLocalPlaywrightBrowserAdapterFixture,
} from "@/lib/avanza-local-playwright-browser-adapter-fixtures";

type AvanzaLocalPlaywrightBrowserAdapterHarnessProps = {
  fixtures?: readonly AvanzaLocalPlaywrightBrowserAdapterFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLocalPlaywrightBrowserAdapterHarness({
  fixtures = avanzaLocalPlaywrightBrowserAdapterFixtures,
}: AvanzaLocalPlaywrightBrowserAdapterHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Local Playwright browser adapter",
            "Fixture only",
            "Local/dev-only",
            "Adapter model + callable contract",
            "No browser launch during render",
            "No Avanza navigation yet",
            "No login yet",
            "No credential handling",
            "No cookie/session handling",
            "No form fill yet",
            "No click yet",
            "No final KÖP/SÄLJ click",
            "No order submission",
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
          Local Playwright browser adapter fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness renders the local/dev
          Playwright adapter contract without launching a browser, connecting to
          a browser, navigating to Avanza, logging in, handling credentials,
          reading cookies, exporting sessions, filling forms, clicking final
          KÖP/SÄLJ, submitting orders, fetching, or writing execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.modelResult;
          const snapshot = result.pageSnapshot;

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
                  ["Reason", result.reason],
                  ["adapterId", result.adapterId],
                  ["mode", result.mode],
                  ["provider", result.provider],
                  ["localOnly", formatBoolean(result.localOnly)],
                  ["allowedOrigins", formatList(result.allowedOrigins)],
                  ["createdAt", result.createdAt],
                  ["now", result.now],
                  ["warnings", formatList(result.warnings)],
                  ["blockedReasons", formatList(result.blockedReasons)],
                  ["adapterEnabled", formatBoolean(result.adapterEnabled)],
                  ["localDevOnly", formatBoolean(result.localDevOnly)],
                  ["canLaunchBrowser", formatBoolean(result.canLaunchBrowser)],
                  [
                    "canConnectToExistingBrowser",
                    formatBoolean(result.canConnectToExistingBrowser),
                  ],
                  [
                    "canReadPageSnapshot",
                    formatBoolean(result.canReadPageSnapshot),
                  ],
                  ["canNavigate", formatBoolean(result.canNavigate)],
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
                  ["snapshotId", snapshot?.snapshotId ?? "none"],
                  ["observedUrl", snapshot?.observedUrl ?? "none"],
                  ["snapshotTitle", snapshot?.title ?? "none"],
                  [
                    "snapshotTextSignals",
                    snapshot ? formatList(snapshot.textSignals) : "none",
                  ],
                  [
                    "snapshotFormSignals",
                    snapshot ? formatList(snapshot.formSignals) : "none",
                  ],
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
