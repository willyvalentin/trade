import {
  AvanzaSettingsPassiveExecutionReadinessPanel,
} from "@/components/execution/AvanzaSettingsPassiveExecutionReadinessPanel";
import type {
  AvanzaSettingsPassiveExecutionReadinessFixture,
} from "@/lib/avanza-settings-passive-execution-readiness-fixtures";
import {
  avanzaSettingsPassiveExecutionReadinessFixtures,
} from "@/lib/avanza-settings-passive-execution-readiness-fixtures";

type AvanzaSettingsPassiveExecutionReadinessPanelHarnessProps = {
  fixtures?: readonly AvanzaSettingsPassiveExecutionReadinessFixture[];
};

const harnessBadges = [
  "Avanza Settings passive execution readiness panel",
  "Fixture/model only",
  "Passive Settings UI only",
  "No active handoff",
  "No prepare action",
  "No buy/sell CTA",
  "No browser automation",
  "No API route call",
  "No fetch/polling",
  "No smoke test from UI",
  "No credential access",
  "No cookies/session",
  "No BankID automation",
  "No order submission",
  "No final KÖP/SÄLJ click",
  "Not production ready",
] as const;

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "n/a";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "none";

  return String(value);
}

export function AvanzaSettingsPassiveExecutionReadinessPanelHarness({
  fixtures = avanzaSettingsPassiveExecutionReadinessFixtures,
}: AvanzaSettingsPassiveExecutionReadinessPanelHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {harnessBadges.map((badge) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={badge}
            >
              {badge}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-100">
          Settings readiness panel fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static Settings panel models only. This harness confirms the Settings
          app can show passive readiness without reading Trade UI state, calling
          APIs, fetching, polling, running smoke tests, accessing credentials,
          controlling a browser, submitting orders, clicking final KÖP/SÄLJ, or
          writing execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const { model } = fixture;

          return (
            <article
              className="grid gap-3 rounded-md border border-white/10 bg-white/[0.02] p-3"
              data-fixture-id={fixture.fixtureId}
              key={fixture.fixtureId}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.fixtureId}: {fixture.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {model.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {fixture.expectedStatus}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", model.status],
                  ["source", model.source],
                  ["profileReady", formatValue(model.profileReady)],
                  ["loginModeled", formatValue(model.loginModeled)],
                  ["instrumentSearchModeled", formatValue(model.instrumentSearchModeled)],
                  ["orderPrepModeled", formatValue(model.orderPrepModeled)],
                  ["settlementModeled", formatValue(model.settlementModeled)],
                  ["tradeUiExecutionWired", formatValue(model.tradeUiExecutionWired)],
                  ["apiRouteWired", formatValue(model.apiRouteWired)],
                  ["browserAutomationWired", formatValue(model.browserAutomationWired)],
                  ["smokeTestRunnableFromUi", formatValue(model.smokeTestRunnableFromUi)],
                  ["warnings", formatValue(model.warnings)],
                  ["blockedReasons", formatValue(model.blockedReasons)],
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

              <AvanzaSettingsPassiveExecutionReadinessPanel model={model} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
