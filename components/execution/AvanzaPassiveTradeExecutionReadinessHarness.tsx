import type {
  AvanzaPassiveTradeExecutionReadinessFixture,
} from "@/lib/avanza-passive-trade-execution-readiness-fixtures";
import {
  avanzaPassiveTradeExecutionReadinessFixtures,
} from "@/lib/avanza-passive-trade-execution-readiness-fixtures";

type AvanzaPassiveTradeExecutionReadinessHarnessProps = {
  fixtures?: readonly AvanzaPassiveTradeExecutionReadinessFixture[];
};

const harnessBadges = [
  "Avanza passive trade execution readiness",
  "Fixture/model only",
  "Recommendation readiness modeled",
  "Live-position exit readiness modeled",
  "Entry BUY readiness modeled",
  "Exit SELL readiness modeled",
  "Settlement readiness modeled",
  "Local-dev only",
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

const safetyFlagKeys = [
  "readinessOnly",
  "canShowReadiness",
  "canStartHandoff",
  "canPrepareOrder",
  "canRunSmokeTestFromUi",
  "canCallApiRoute",
  "canFetch",
  "canPoll",
  "canUseBrowserAutomation",
  "canAccessCredentials",
  "canReadCookies",
  "canExportSession",
  "canAutomateBankId",
  "canSubmitOrder",
  "canClickFinalBuy",
  "canClickFinalSell",
  "canWriteSupabase",
  "canClaimProductionReady",
  "userMustConfirm",
  "finalHumanClickRequired",
  "controlsEnabled",
  "gateLocked",
] as const;

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "n/a";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "none";

  return String(value);
}

export function AvanzaPassiveTradeExecutionReadinessHarness({
  fixtures = avanzaPassiveTradeExecutionReadinessFixtures,
}: AvanzaPassiveTradeExecutionReadinessHarnessProps) {
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
          Passive trade readiness fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static recommendation and live-position-like metadata only. This
          harness models theoretical readiness without Trade UI card wiring,
          handoff controls, prepare actions, API calls, browser automation,
          credential access, smoke test invocation, order submission, or
          Supabase writes.
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
                  {model.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", model.status],
                  ["label", model.label],
                  ["reason", model.reason],
                  ["source", model.source],
                  ["intent", model.intent],
                  ["ticker", formatValue(model.ticker)],
                  ["instrumentName", formatValue(model.instrumentName)],
                  ["side", model.side],
                  ["quantity", formatValue(model.quantity)],
                  ["limitPrice", formatValue(model.limitPrice)],
                  ["orderType", model.orderType],
                  [
                    "canTheoreticallyPrepareOrder",
                    formatValue(model.canTheoreticallyPrepareOrder),
                  ],
                  ["profileReady", formatValue(model.profileReady)],
                  ["loginModeled", formatValue(model.loginModeled)],
                  [
                    "instrumentSearchModeled",
                    formatValue(model.instrumentSearchModeled),
                  ],
                  ["orderPrepModeled", formatValue(model.orderPrepModeled)],
                  ["settlementModeled", formatValue(model.settlementModeled)],
                  ["localDevOnly", formatValue(model.localDevOnly)],
                  ["recommendationId", formatValue(model.recommendationId)],
                  ["positionId", formatValue(model.positionId)],
                  ["blockers", formatValue(model.blockers)],
                  ["warnings", formatValue(model.warnings)],
                  ["nextPassiveStep", model.nextPassiveStep],
                  ["hardStops", formatValue(model.hardStops)],
                ].map(([label, value]) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={label}
                  >
                    <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words font-semibold text-zinc-200">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Safety flags
                </h4>
                <dl className="grid gap-1 text-xs text-zinc-300 sm:grid-cols-2">
                  {safetyFlagKeys.map((key) => (
                    <div className="flex justify-between gap-3" key={key}>
                      <dt className="text-zinc-500">{key}</dt>
                      <dd>{formatValue(model.safetyFlags[key])}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
