import {
  avanzaExecutionSettingsProfileFixtures,
  type AvanzaExecutionSettingsProfileFixture,
} from "@/lib/avanza-execution-settings-profile-fixtures";

type AvanzaExecutionSettingsProfileHarnessProps = {
  fixtures?: readonly AvanzaExecutionSettingsProfileFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaExecutionSettingsProfileHarness({
  fixtures = avanzaExecutionSettingsProfileFixtures,
}: AvanzaExecutionSettingsProfileHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Ture Avanza execution settings profile",
            "Fixture only",
            "User selects Privat or Företag in Ture Settings",
            "Username/password login only",
            "BankID forbidden",
            "Secure credential provider modeled",
            "No credential material shown",
            "No password returned",
            "No Supabase credential storage",
            "No localStorage credential storage",
            "No actual login",
            "No form fill",
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
          Execution settings profile fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness models how Ture Settings can
          record Privat or Företag, username/password-only login intent, and a
          secure credential provider choice. It never shows username values,
          returns passwords, reads credential material, logs secrets, persists
          credentials, logs in, fills forms, clicks, submits orders, automates
          BankID, bypasses BankID, or writes execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const profile = fixture.profile;

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
                    {profile.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {profile.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["profileId", profile.profileId],
                  ["status", profile.status],
                  ["label", profile.label],
                  ["customerType", profile.customerType],
                  ["loginMethod", profile.loginMethod],
                  ["credentialStorageKind", profile.credentialStorageKind],
                  [
                    "usernameConfigured",
                    formatBoolean(profile.usernameConfigured),
                  ],
                  [
                    "passwordConfigured",
                    formatBoolean(profile.passwordConfigured),
                  ],
                  [
                    "credentialMaterialPresent",
                    formatBoolean(profile.credentialMaterialPresent),
                  ],
                  [
                    "credentialMaterialReturned",
                    formatBoolean(profile.credentialMaterialReturned),
                  ],
                  [
                    "canUseForPrivateLogin",
                    formatBoolean(profile.canUseForPrivateLogin),
                  ],
                  [
                    "canUseForCompanyLogin",
                    formatBoolean(profile.canUseForCompanyLogin),
                  ],
                  [
                    "canUseUsernamePasswordLogin",
                    formatBoolean(profile.canUseUsernamePasswordLogin),
                  ],
                  ["bankIdForbidden", formatBoolean(profile.bankIdForbidden)],
                  ["warnings", formatList(profile.warnings)],
                  ["blockedReasons", formatList(profile.blockedReasons)],
                  ["profileEnabled", formatBoolean(profile.profileEnabled)],
                  ["localOnly", formatBoolean(profile.localOnly)],
                  [
                    "canConfigureCustomerType",
                    formatBoolean(profile.canConfigureCustomerType),
                  ],
                  [
                    "canConfigureUsername",
                    formatBoolean(profile.canConfigureUsername),
                  ],
                  [
                    "canConfigurePasswordReference",
                    formatBoolean(profile.canConfigurePasswordReference),
                  ],
                  [
                    "canReadCredentialMaterial",
                    formatBoolean(profile.canReadCredentialMaterial),
                  ],
                  [
                    "canReturnCredentialMaterial",
                    formatBoolean(profile.canReturnCredentialMaterial),
                  ],
                  [
                    "canLogCredentialMaterial",
                    formatBoolean(profile.canLogCredentialMaterial),
                  ],
                  [
                    "canStoreCredentialMaterialInSupabase",
                    formatBoolean(profile.canStoreCredentialMaterialInSupabase),
                  ],
                  [
                    "canStoreCredentialMaterialInLocalStorage",
                    formatBoolean(
                      profile.canStoreCredentialMaterialInLocalStorage,
                    ),
                  ],
                  [
                    "canUseMacosKeychain",
                    formatBoolean(profile.canUseMacosKeychain),
                  ],
                  [
                    "canUseOnePasswordCli",
                    formatBoolean(profile.canUseOnePasswordCli),
                  ],
                  [
                    "canUseEnvironmentVariableDevOnly",
                    formatBoolean(profile.canUseEnvironmentVariableDevOnly),
                  ],
                  [
                    "canUseManualPrompt",
                    formatBoolean(profile.canUseManualPrompt),
                  ],
                  [
                    "canAutomateBankId",
                    formatBoolean(profile.canAutomateBankId),
                  ],
                  ["canBypassBankId", formatBoolean(profile.canBypassBankId)],
                  ["canSubmitLogin", formatBoolean(profile.canSubmitLogin)],
                  ["canFillLoginForm", formatBoolean(profile.canFillLoginForm)],
                  ["canSubmitOrder", formatBoolean(profile.canSubmitOrder)],
                  ["userMustConfirm", formatBoolean(profile.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(profile.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", formatBoolean(profile.controlsEnabled)],
                  ["gateLocked", formatBoolean(profile.gateLocked)],
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
