import {
  AvanzaTradeCardExecutionReadinessBadge,
} from "@/components/execution/AvanzaTradeCardExecutionReadinessBadge";
import type {
  AvanzaTradeCardExecutionReadinessAdapterFixture,
} from "@/lib/avanza-trade-card-execution-readiness-adapter-fixtures";
import {
  avanzaTradeCardExecutionReadinessAdapterFixtures,
} from "@/lib/avanza-trade-card-execution-readiness-adapter-fixtures";

type PreviewScenarioId =
  | "recommendation_buy_ready_badge"
  | "live_position_sell_exit_ready_badge"
  | "incomplete_profile_badge"
  | "market_order_blocked_badge"
  | "missing_quantity_badge"
  | "missing_limit_price_badge"
  | "local_dev_only_badge";

type PreviewScenario = {
  id: PreviewScenarioId;
  label: string;
  copy: string;
  cardType: "Recommendation card badge preview" | "Live-position card badge preview";
  ticker: string;
  meta: readonly string[];
};

type AvanzaTradeCardExecutionReadinessVisualPreviewProps = {
  fixtures?: readonly AvanzaTradeCardExecutionReadinessAdapterFixture[];
};

const previewScenarios: readonly PreviewScenario[] = [
  {
    cardType: "Recommendation card badge preview",
    copy: "Fixture recommendation BUY card with the default-off readiness badge shown for visual QA only.",
    id: "recommendation_buy_ready_badge",
    label: "Recommendation BUY card with readiness badge",
    meta: ["BUY modeled", "Read-only", "No active handoff"],
    ticker: "NOKIA",
  },
  {
    cardType: "Live-position card badge preview",
    copy: "Fixture live-position SELL/exit card with the default-off readiness badge shown for visual QA only.",
    id: "live_position_sell_exit_ready_badge",
    label: "Live-position SELL/exit card with readiness badge",
    meta: ["SELL/exit modeled", "Read-only", "No order submission"],
    ticker: "VOLV B",
  },
  {
    cardType: "Recommendation card badge preview",
    copy: "Incomplete profile card with warning badge for settings review visibility only.",
    id: "incomplete_profile_badge",
    label: "Incomplete profile card with warning badge",
    meta: ["Warning badge", "Settings review only", "Controls disabled"],
    ticker: "NOKIA",
  },
  {
    cardType: "Recommendation card badge preview",
    copy: "Blocked market-order card proving unsafe order modes stay blocked.",
    id: "market_order_blocked_badge",
    label: "Blocked market-order card",
    meta: ["Blocked", "Market order forbidden", "Gate locked"],
    ticker: "NOKIA",
  },
  {
    cardType: "Recommendation card badge preview",
    copy: "Missing quantity card proving incomplete package data cannot proceed.",
    id: "missing_quantity_badge",
    label: "Missing quantity/limit-price card",
    meta: ["Missing quantity", "Manual review required", "No prepare action"],
    ticker: "NOKIA",
  },
  {
    cardType: "Recommendation card badge preview",
    copy: "Missing limit-price card proving limit price is required for passive readiness.",
    id: "missing_limit_price_badge",
    label: "Missing quantity/limit-price card",
    meta: ["Missing limit price", "Manual review required", "No buy/sell CTA"],
    ticker: "NOKIA",
  },
  {
    cardType: "Recommendation card badge preview",
    copy: "Local-dev-only info card proving the preview is not a production readiness claim.",
    id: "local_dev_only_badge",
    label: "Local-dev-only info card",
    meta: ["Dev QA only", "Fixture/model only", "Not production ready"],
    ticker: "QA-FIXTURE",
  },
] as const;

function fixtureById(
  fixtures: readonly AvanzaTradeCardExecutionReadinessAdapterFixture[],
  fixtureId: PreviewScenarioId,
) {
  const fixture = fixtures.find((item) => item.fixtureId === fixtureId);

  if (!fixture) {
    throw new Error(`Missing Trade card readiness badge visual fixture: ${fixtureId}`);
  }

  return fixture;
}

export function AvanzaTradeCardExecutionReadinessVisualPreview({
  fixtures = avanzaTradeCardExecutionReadinessAdapterFixtures,
}: AvanzaTradeCardExecutionReadinessVisualPreviewProps) {
  return (
    <section className="grid gap-3">
      {previewScenarios.map((scenario) => {
        const fixture = fixtureById(fixtures, scenario.id);

        return (
          <article
            className="grid gap-3 rounded-md border border-white/10 bg-black/20 p-3"
            data-preview-scenario={scenario.id}
            key={`${scenario.id}-${scenario.label}`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-zinc-500">
                  {scenario.cardType}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                  {scenario.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  {scenario.copy}
                </p>
              </div>
              <span className="w-fit rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                {scenario.ticker}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {scenario.meta.map((item) => (
                <span
                  className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>

            <AvanzaTradeCardExecutionReadinessBadge result={fixture.result} />
          </article>
        );
      })}
    </section>
  );
}
