import {
  avanzaPageStateDetectorFixtures,
  type AvanzaPageStateDetectorFixture,
} from "@/lib/avanza-page-state-detector-fixtures";

type AvanzaPageStateDetectorHarnessProps = {
  fixtures?: readonly AvanzaPageStateDetectorFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaPageStateDetectorHarness({
  fixtures = avanzaPageStateDetectorFixtures,
}: AvanzaPageStateDetectorHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza page/state detector",
            "Fixture only",
            "Snapshot model",
            "Local/dev-only",
            "No real Avanza navigation",
            "No login",
            "No credential handling",
            "No cookie/session handling",
            "No form fill",
            "No click",
            "No final KÖP/SÄLJ click",
            "No order submission",
            "BankID/MFA requires manual action",
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
          Avanza page/state detector fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness renders explicit page
          snapshot and signal classification. It does not navigate to Avanza,
          log in, handle credentials, read cookies, export sessions, fill
          forms, click, submit orders, automate BankID, or write execution
          records.
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
                  ["Reason", result.reason],
                  ["detectionId", result.detectionId],
                  ["createdAt", result.createdAt],
                  ["mode", result.mode],
                  ["urlKind", result.urlKind],
                  ["isAvanza", formatBoolean(result.isAvanza)],
                  ["isLoginPage", formatBoolean(result.isLoginPage)],
                  ["isLoggedInLikely", formatBoolean(result.isLoggedInLikely)],
                  [
                    "isInstrumentPageLikely",
                    formatBoolean(result.isInstrumentPageLikely),
                  ],
                  [
                    "isOrderTicketLikely",
                    formatBoolean(result.isOrderTicketLikely),
                  ],
                  [
                    "isOrderReviewLikely",
                    formatBoolean(result.isOrderReviewLikely),
                  ],
                  [
                    "isOrderConfirmationLikely",
                    formatBoolean(result.isOrderConfirmationLikely),
                  ],
                  [
                    "isBankIdOrMfaLikely",
                    formatBoolean(result.isBankIdOrMfaLikely),
                  ],
                  [
                    "manualActionRequired",
                    formatBoolean(result.manualActionRequired),
                  ],
                  ["warnings", formatList(result.warnings)],
                  ["blockedReasons", formatList(result.blockedReasons)],
                  ["detectorEnabled", formatBoolean(result.detectorEnabled)],
                  ["readOnly", formatBoolean(result.readOnly)],
                  ["canReadSnapshot", formatBoolean(result.canReadSnapshot)],
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
                  ["canWriteSupabase", formatBoolean(result.canWriteSupabase)],
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
