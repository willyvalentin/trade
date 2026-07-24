import {
  avanzaMacosKeychainCredentialProviderFixtures,
  type AvanzaMacosKeychainCredentialProviderFixture,
} from "@/lib/avanza-macos-keychain-credential-provider-fixtures";

type AvanzaMacosKeychainCredentialProviderHarnessProps = {
  fixtures?: readonly AvanzaMacosKeychainCredentialProviderFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaMacosKeychainCredentialProviderHarness({
  fixtures = avanzaMacosKeychainCredentialProviderFixtures,
}: AvanzaMacosKeychainCredentialProviderHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza macOS Keychain credential provider",
            "Fixture/mock only",
            "Injected Keychain dependency only",
            "Local/dev-only",
            "Credential references only",
            "No raw password shown",
            "No raw username shown",
            "No credential logging",
            "No Supabase credential storage",
            "No localStorage credential storage",
            "No environment fallback by default",
            "No BankID automation",
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
          macOS Keychain credential provider fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static provider-contract scenarios only. The harness renders safe
          reference metadata from explicit fixtures, never reads Keychain, never
          logs credential material, never exposes raw username or password
          values, never stores credentials in Supabase or localStorage, never
          falls back to environment variables, and never performs login, BankID,
          browser, or order actions.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const state = fixture.state;

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
                    {state.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {state.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["provider", state.provider],
                  ["providerId", state.providerId],
                  ["mode", state.mode],
                  ["status", state.status],
                  ["label", state.label],
                  ["reason", state.reason],
                  ["warnings", formatList(state.warnings)],
                  ["blockedReasons", formatList(state.blockedReasons)],
                  ["providerEnabled", formatBoolean(state.providerEnabled)],
                  ["localDevOnly", formatBoolean(state.localDevOnly)],
                  [
                    "canCheckAvailability",
                    formatBoolean(state.canCheckAvailability),
                  ],
                  [
                    "canCheckCredentialExists",
                    formatBoolean(state.canCheckCredentialExists),
                  ],
                  [
                    "canWriteCredentialReference",
                    formatBoolean(state.canWriteCredentialReference),
                  ],
                  [
                    "canReadCredentialMaterial",
                    formatBoolean(state.canReadCredentialMaterial),
                  ],
                  [
                    "canReturnCredentialMaterialToUi",
                    formatBoolean(state.canReturnCredentialMaterialToUi),
                  ],
                  [
                    "canLogCredentialMaterial",
                    formatBoolean(state.canLogCredentialMaterial),
                  ],
                  [
                    "canStoreCredentialMaterialInSupabase",
                    formatBoolean(state.canStoreCredentialMaterialInSupabase),
                  ],
                  [
                    "canStoreCredentialMaterialInLocalStorage",
                    formatBoolean(
                      state.canStoreCredentialMaterialInLocalStorage,
                    ),
                  ],
                  [
                    "canUseEnvironmentFallback",
                    formatBoolean(state.canUseEnvironmentFallback),
                  ],
                  [
                    "credentialValuesVisibleInReports",
                    formatBoolean(state.credentialValuesVisibleInReports),
                  ],
                  ["canAutomateBankId", formatBoolean(state.canAutomateBankId)],
                  ["canBypassBankId", formatBoolean(state.canBypassBankId)],
                  ["canSubmitLogin", formatBoolean(state.canSubmitLogin)],
                  ["canSubmitOrder", formatBoolean(state.canSubmitOrder)],
                  ["userMustConfirm", formatBoolean(state.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(state.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", formatBoolean(state.controlsEnabled)],
                  ["gateLocked", formatBoolean(state.gateLocked)],
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
                  Safe credential references only
                </p>
                {state.references.length > 0 ? (
                  state.references.map((reference) => (
                    <dl
                      className="grid gap-2 rounded-md border border-white/10 bg-black/20 p-2 text-xs sm:grid-cols-2 lg:grid-cols-4"
                      key={`${fixture.fixtureId}-${reference.kind}-${reference.safeDisplayName}`}
                    >
                      {[
                        ["kind", reference.kind],
                        ["customerType", reference.customerType],
                        [
                          "safeDisplayName",
                          reference.safeDisplayName ?? "reference configured",
                        ],
                        [
                          "maskedAccountHint",
                          reference.maskedAccountHint ?? "configured",
                        ],
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
                  ))
                ) : (
                  <p className="rounded-md border border-white/10 bg-black/20 p-2 text-xs text-zinc-400">
                    No credential references configured.
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
