import {
  AvanzaExecutionSettingsProfilePanel,
} from "@/components/execution/AvanzaExecutionSettingsProfilePanel";
import {
  avanzaExecutionSettingsProfileUiFixtures,
  type AvanzaExecutionSettingsProfileUiFixture,
} from "@/lib/avanza-execution-settings-profile-ui-fixtures";

type AvanzaExecutionSettingsProfilePanelHarnessProps = {
  fixtures?: readonly AvanzaExecutionSettingsProfileUiFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

export function AvanzaExecutionSettingsProfilePanelHarness({
  fixtures = avanzaExecutionSettingsProfileUiFixtures,
}: AvanzaExecutionSettingsProfilePanelHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Ture Settings Avanza profile panel",
            "Passive settings UI only",
            "No raw username field",
            "No raw password field",
            "No credential material shown",
            "No password storage",
            "No Supabase credential storage",
            "No localStorage credential storage",
            "No Keychain access from UI",
            "No smoke test from UI",
            "No login from UI",
            "No browser automation",
            "No API route call",
            "No order submission",
            "Final KÖP/SÄLJ human-only",
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
        <p className="mt-3 text-xs leading-5 text-zinc-400">
          Fixture/model-only harness for the passive Settings UI scaffold. The
          panels below use modeled customer type and credential reference
          booleans only; no username/password values exist here.
        </p>
      </div>

      <AvanzaExecutionSettingsProfilePanel
        initialCustomerType="unknown"
        title="Avanza Execution Profile fixture panel"
      />

      <div className="grid gap-3">
        {fixtures.map((fixture) => (
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
                  {fixture.expectedRenderState}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                {fixture.profile.status}
              </span>
            </div>
            <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["fixtureId", fixture.fixtureId],
                ["expectedStatus", fixture.expectedStatus],
                ["customerType", fixture.profile.customerType],
                ["loginMethod", "Username/password only"],
                ["BankID", "forbidden"],
                ["credentialProvider", "macOS Keychain"],
                [
                  "username reference configured",
                  formatBoolean(fixture.usernameReferenceConfigured),
                ],
                [
                  "password reference configured",
                  formatBoolean(fixture.passwordReferenceConfigured),
                ],
                ["profile readiness", fixture.profile.label],
                ["credentialMaterialPresent", "false"],
                ["credentialMaterialReturned", "false"],
                ["password", "never stored"],
                ["Supabase credential storage", "forbidden"],
                ["localStorage credential storage", "forbidden"],
                ["Smoke test", "terminal-only"],
                ["Order submission", "unavailable"],
                ["Final KÖP/SÄLJ", "human-only"],
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
        ))}
      </div>
    </section>
  );
}
