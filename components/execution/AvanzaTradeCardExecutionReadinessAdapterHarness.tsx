import {
  AvanzaTradeCardExecutionReadinessBadge,
} from "@/components/execution/AvanzaTradeCardExecutionReadinessBadge";
import type {
  AvanzaTradeCardExecutionReadinessAdapterFixture,
} from "@/lib/avanza-trade-card-execution-readiness-adapter-fixtures";
import {
  avanzaTradeCardExecutionReadinessAdapterFixtures,
} from "@/lib/avanza-trade-card-execution-readiness-adapter-fixtures";

type AvanzaTradeCardExecutionReadinessAdapterHarnessProps = {
  fixtures?: readonly AvanzaTradeCardExecutionReadinessAdapterFixture[];
};

const harnessBadges = [
  "Avanza Trade card execution readiness adapter",
  "Fixture/model only",
  "Read-only badge only",
  "Recommendation BUY badge modeled",
  "Live-position SELL/exit badge modeled",
  "No active handoff",
  "No prepare action",
  "No buy/sell CTA",
  "No onClick action",
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
  "adapterOnly",
  "readOnly",
  "canRenderBadge",
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

export function AvanzaTradeCardExecutionReadinessAdapterHarness({
  fixtures = avanzaTradeCardExecutionReadinessAdapterFixtures,
}: AvanzaTradeCardExecutionReadinessAdapterHarnessProps) {
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
          Read-only trade card readiness fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static card metadata only. These badges prepare future passive
          recommendation/live-position card visibility without handoff controls,
          prepare actions, browser automation, API calls, smoke test invocation,
          credential access, order submission, or Supabase writes.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const { result } = fixture;

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
                    {result.tooltip}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {result.severity}
                </span>
              </div>

              <AvanzaTradeCardExecutionReadinessBadge result={result} />

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["label", result.label],
                  ["shortLabel", result.shortLabel],
                  ["severity", result.severity],
                  ["ctaType", result.ctaType],
                  ["tooltip", result.tooltip],
                  ["source", result.source],
                  ["intent", result.intent],
                  ["ticker", formatValue(result.ticker)],
                  ["side", formatValue(result.side)],
                  ["badges", result.badges.map((badge) => badge.label)],
                  ["warnings", result.warnings],
                  ["blockedReasons", result.blockedReasons],
                  ["showOnRecommendationCard", result.showOnRecommendationCard],
                  ["showOnLivePositionCard", result.showOnLivePositionCard],
                ].map(([label, value]) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={String(label)}
                  >
                    <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words font-semibold text-zinc-200">
                      {formatValue(value)}
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
                      <dd>{formatValue(result.safetyFlags[key])}</dd>
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
