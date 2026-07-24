import {
  avanzaRealWorldLoginSignalFixtures,
  type AvanzaRealWorldLoginSignalFixture,
} from "@/lib/avanza-real-world-login-signals-fixtures";

type AvanzaRealWorldLoginSignalsHarnessProps = {
  fixtures?: readonly AvanzaRealWorldLoginSignalFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaRealWorldLoginSignalsHarness({
  fixtures = avanzaRealWorldLoginSignalFixtures,
}: AvanzaRealWorldLoginSignalsHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza real-world login signal pack",
            "Based on sanitized user-provided visual material",
            "Fixture only",
            "No credentials",
            "No password values",
            "No personnummer",
            "No account numbers",
            "No cookies/session",
            "No BankID QR",
            "Username/password flow recognized",
            "Private login flow recognized",
            "Company login flow recognized",
            "BankID options detected but forbidden",
            "No actual login",
            "No credential handling",
            "No form fill",
            "No click",
            "No Avanza navigation",
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
          Sanitized login-flow signal fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static signal pack results only. These fixtures capture sanitized
          visible login-flow cues such as Användarnamn och lösenord, Privatkund,
          Företag, Visa QR-kod, Öppna BankID på samma enhet, and Logga in på
          företagswebben. Company cue: Logga in på företagswebben. They do not
          navigate, log in, handle credentials, fill forms, click, automate
          BankID, bypass BankID, submit orders, or write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const signalPack = fixture.signalPack;

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
                    {signalPack.bankIdOptionsDetected
                      ? "BankID option is detected for manual-boundary planning only and remains forbidden for automation."
                      : "Username/password or login-page cue is available as a sanitized planning signal only."}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {signalPack.flowKind}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedFlowKind", fixture.expectedFlowKind],
                  ["expectedCustomerType", fixture.expectedCustomerType],
                  ["expectedLoginMethod", fixture.expectedLoginMethod],
                  ["signalPackId", signalPack.signalPackId],
                  ["source", signalPack.source],
                  ["observedUrlKind", signalPack.observedUrlKind],
                  ["customerType", signalPack.customerType],
                  ["loginMethod", signalPack.loginMethod],
                  ["flowKind", signalPack.flowKind],
                  ["visibleTexts", formatList(signalPack.visibleTexts)],
                  ["toggleLabels", formatList(signalPack.toggleLabels)],
                  ["buttonTexts", formatList(signalPack.buttonTexts)],
                  ["formLabels", formatList(signalPack.formLabels)],
                  ["inputLabels", formatList(signalPack.inputLabels)],
                  ["inputTypes", formatList(signalPack.inputTypes)],
                  ["secondaryActions", formatList(signalPack.secondaryActions)],
                  [
                    "bankIdOptionsDetected",
                    formatBoolean(signalPack.bankIdOptionsDetected),
                  ],
                  [
                    "usernamePasswordOptionDetected",
                    formatBoolean(signalPack.usernamePasswordOptionDetected),
                  ],
                  [
                    "companyLoginDetected",
                    formatBoolean(signalPack.companyLoginDetected),
                  ],
                  [
                    "privateLoginDetected",
                    formatBoolean(signalPack.privateLoginDetected),
                  ],
                  ["warnings", formatList(signalPack.warnings)],
                  ["blockedReasons", formatList(signalPack.blockedReasons)],
                  ["sanitized", formatBoolean(signalPack.sanitized)],
                  [
                    "containsCredentials",
                    formatBoolean(signalPack.containsCredentials),
                  ],
                  [
                    "containsPassword",
                    formatBoolean(signalPack.containsPassword),
                  ],
                  [
                    "containsPersonalIdentityNumber",
                    formatBoolean(signalPack.containsPersonalIdentityNumber),
                  ],
                  [
                    "containsAccountNumber",
                    formatBoolean(signalPack.containsAccountNumber),
                  ],
                  ["containsCookie", formatBoolean(signalPack.containsCookie)],
                  [
                    "containsSessionToken",
                    formatBoolean(signalPack.containsSessionToken),
                  ],
                  [
                    "containsBankIdQr",
                    formatBoolean(signalPack.containsBankIdQr),
                  ],
                  [
                    "canUseForLoginPlanning",
                    formatBoolean(signalPack.canUseForLoginPlanning),
                  ],
                  [
                    "canUseForSelectorPlanning",
                    formatBoolean(signalPack.canUseForSelectorPlanning),
                  ],
                  [
                    "canAutomateBankId",
                    formatBoolean(signalPack.canAutomateBankId),
                  ],
                  [
                    "canBypassBankId",
                    formatBoolean(signalPack.canBypassBankId),
                  ],
                  [
                    "canSubmitLogin",
                    formatBoolean(signalPack.canSubmitLogin),
                  ],
                  [
                    "canHandleCredentials",
                    formatBoolean(signalPack.canHandleCredentials),
                  ],
                  [
                    "canFillLoginForm",
                    formatBoolean(signalPack.canFillLoginForm),
                  ],
                  [
                    "userMustConfirm",
                    formatBoolean(signalPack.userMustConfirm),
                  ],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(signalPack.finalHumanClickRequired),
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
