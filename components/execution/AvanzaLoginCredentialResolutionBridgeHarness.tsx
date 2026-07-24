import {
  avanzaLoginCredentialResolutionBridgeFixtures,
  type AvanzaLoginCredentialResolutionBridgeFixture,
} from "@/lib/avanza-login-credential-resolution-bridge-fixtures";

type AvanzaLoginCredentialResolutionBridgeHarnessProps = {
  fixtures?: readonly AvanzaLoginCredentialResolutionBridgeFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaLoginCredentialResolutionBridgeHarness({
  fixtures = avanzaLoginCredentialResolutionBridgeFixtures,
}: AvanzaLoginCredentialResolutionBridgeHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza login credential resolution bridge",
            "Fixture/mock only",
            "Injected credential dependency only",
            "Local/dev-only",
            "Credential references resolved internally only",
            "No raw username shown",
            "No raw password shown",
            "No credential logging",
            "No Supabase credential storage",
            "No localStorage credential storage",
            "No environment fallback",
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
          Credential resolution bridge fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static safe reports only. This harness never renders runtime bundles,
          raw username values, raw password values, credential material,
          Keychain commands, environment fallback, Supabase credential storage,
          localStorage credential storage, BankID automation, browser control,
          or order submission.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const report = fixture.result.safeReport;

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
                  ["reportId", report.reportId],
                  ["createdAt", report.createdAt],
                  ["status", report.status],
                  ["label", report.label],
                  ["reason", report.reason],
                  ["usernameResolved", formatBoolean(report.usernameResolved)],
                  ["passwordResolved", formatBoolean(report.passwordResolved)],
                  [
                    "credentialMaterialPresent",
                    formatBoolean(report.credentialMaterialPresent),
                  ],
                  [
                    "credentialMaterialReturnedToUi",
                    formatBoolean(report.credentialMaterialReturnedToUi),
                  ],
                  [
                    "credentialMaterialLogged",
                    formatBoolean(report.credentialMaterialLogged),
                  ],
                  [
                    "credentialMaterialStoredInSupabase",
                    formatBoolean(report.credentialMaterialStoredInSupabase),
                  ],
                  [
                    "credentialMaterialStoredInLocalStorage",
                    formatBoolean(report.credentialMaterialStoredInLocalStorage),
                  ],
                  ["warnings", formatList(report.warnings)],
                  ["blockedReasons", formatList(report.blockedReasons)],
                  ["bridgeEnabled", formatBoolean(report.bridgeEnabled)],
                  ["localDevOnly", formatBoolean(report.localDevOnly)],
                  ["canResolveUsername", formatBoolean(report.canResolveUsername)],
                  ["canResolvePassword", formatBoolean(report.canResolvePassword)],
                  [
                    "canReturnRuntimeBundle",
                    formatBoolean(report.canReturnRuntimeBundle),
                  ],
                  [
                    "canReturnCredentialMaterialToUi",
                    formatBoolean(report.canReturnCredentialMaterialToUi),
                  ],
                  [
                    "canLogCredentialMaterial",
                    formatBoolean(report.canLogCredentialMaterial),
                  ],
                  [
                    "canStoreCredentialMaterialInSupabase",
                    formatBoolean(report.canStoreCredentialMaterialInSupabase),
                  ],
                  [
                    "canStoreCredentialMaterialInLocalStorage",
                    formatBoolean(
                      report.canStoreCredentialMaterialInLocalStorage,
                    ),
                  ],
                  [
                    "canUseEnvironmentFallback",
                    formatBoolean(report.canUseEnvironmentFallback),
                  ],
                  [
                    "credentialValuesVisibleInReports",
                    formatBoolean(report.credentialValuesVisibleInReports),
                  ],
                  ["canAutomateBankId", formatBoolean(report.canAutomateBankId)],
                  ["canBypassBankId", formatBoolean(report.canBypassBankId)],
                  ["canSubmitLogin", formatBoolean(report.canSubmitLogin)],
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
