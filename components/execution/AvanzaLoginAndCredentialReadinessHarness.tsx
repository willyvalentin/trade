import {
  avanzaLoginStateDetectorFixtures,
  type AvanzaLoginStateDetectorFixture,
} from "@/lib/avanza-login-state-detector-fixtures";
import {
  avanzaSecureCredentialProviderFixtures,
  type AvanzaSecureCredentialProviderFixture,
} from "@/lib/avanza-secure-credential-provider-fixtures";

type AvanzaLoginAndCredentialReadinessHarnessProps = {
  loginFixtures?: readonly AvanzaLoginStateDetectorFixture[];
  credentialProviderFixtures?: readonly AvanzaSecureCredentialProviderFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLoginAndCredentialReadinessHarness({
  loginFixtures = avanzaLoginStateDetectorFixtures,
  credentialProviderFixtures = avanzaSecureCredentialProviderFixtures,
}: AvanzaLoginAndCredentialReadinessHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza login state detector",
            "Secure credential provider interface",
            "Fixture only",
            "Read-only model",
            "Local/dev-only",
            "No actual login",
            "No credential material returned",
            "No Keychain access yet",
            "No 1Password CLI call",
            "No env read",
            "No cookies/session handling",
            "No BankID automation",
            "No BankID bypass",
            "No Avanza navigation yet",
            "No form fill yet",
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
          Login and credential readiness fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness renders explicit read-only
          login signal classification and secure credential provider interface
          metadata. It does not log in, access Keychain, call 1Password CLI,
          read environment variables, return credential material, read cookies,
          export sessions, automate BankID, navigate to Avanza, fill forms,
          submit orders, or write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        <h4 className="text-xs font-bold uppercase text-zinc-500">
          Login state detector
        </h4>
        {loginFixtures.map((fixture) => {
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
                  ["observedUrlKind", result.observedUrlKind],
                  ["loggedInLikely", formatBoolean(result.loggedInLikely)],
                  ["loggedOutLikely", formatBoolean(result.loggedOutLikely)],
                  [
                    "usernamePasswordLoginPossible",
                    formatBoolean(result.usernamePasswordLoginPossible),
                  ],
                  ["mfaOrBankIdLikely", formatBoolean(result.mfaOrBankIdLikely)],
                  [
                    "manualActionRequired",
                    formatBoolean(result.manualActionRequired),
                  ],
                  ["warnings", formatList(result.warnings)],
                  ["blockedReasons", formatList(result.blockedReasons)],
                  ["detectorEnabled", formatBoolean(result.detectorEnabled)],
                  ["readOnly", formatBoolean(result.readOnly)],
                  [
                    "canReadPageSignals",
                    formatBoolean(result.canReadPageSignals),
                  ],
                  ["canNavigate", formatBoolean(result.canNavigate)],
                  ["canFillUsername", formatBoolean(result.canFillUsername)],
                  ["canFillPassword", formatBoolean(result.canFillPassword)],
                  ["canSubmitLogin", formatBoolean(result.canSubmitLogin)],
                  [
                    "canHandleCredentials",
                    formatBoolean(result.canHandleCredentials),
                  ],
                  ["canReadCookies", formatBoolean(result.canReadCookies)],
                  ["canExportSession", formatBoolean(result.canExportSession)],
                  ["canBypassBankId", formatBoolean(result.canBypassBankId)],
                  [
                    "canStoreBrokerCredentials",
                    formatBoolean(result.canStoreBrokerCredentials),
                  ],
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

      <div className="grid gap-3">
        <h4 className="text-xs font-bold uppercase text-zinc-500">
          Secure credential provider interface
        </h4>
        {credentialProviderFixtures.map((fixture) => {
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
                  ["kind", result.kind],
                  ["usernameConfigured", formatBoolean(result.usernameConfigured)],
                  ["passwordAvailable", formatBoolean(result.passwordAvailable)],
                  [
                    "credentialMaterialReturned",
                    formatBoolean(result.credentialMaterialReturned),
                  ],
                  ["warnings", formatList(result.warnings)],
                  ["blockedReasons", formatList(result.blockedReasons)],
                  ["providerEnabled", formatBoolean(result.providerEnabled)],
                  ["localOnly", formatBoolean(result.localOnly)],
                  [
                    "canReadCredentialMaterial",
                    formatBoolean(result.canReadCredentialMaterial),
                  ],
                  [
                    "canReturnCredentialMaterial",
                    formatBoolean(result.canReturnCredentialMaterial),
                  ],
                  [
                    "canLogCredentialMaterial",
                    formatBoolean(result.canLogCredentialMaterial),
                  ],
                  [
                    "canStoreCredentialMaterial",
                    formatBoolean(result.canStoreCredentialMaterial),
                  ],
                  [
                    "canStoreCredentialInSupabase",
                    formatBoolean(result.canStoreCredentialInSupabase),
                  ],
                  ["canReadCookies", formatBoolean(result.canReadCookies)],
                  ["canExportSession", formatBoolean(result.canExportSession)],
                  ["canBypassBankId", formatBoolean(result.canBypassBankId)],
                  [
                    "requiresUserApproval",
                    formatBoolean(result.requiresUserApproval),
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
