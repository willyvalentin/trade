import {
  AvanzaTradeCardExecutionReadinessVisualPreview,
} from "@/components/execution/AvanzaTradeCardExecutionReadinessVisualPreview";
import type {
  AvanzaTradeCardExecutionReadinessAdapterFixture,
} from "@/lib/avanza-trade-card-execution-readiness-adapter-fixtures";
import {
  avanzaTradeCardExecutionReadinessAdapterFixtures,
} from "@/lib/avanza-trade-card-execution-readiness-adapter-fixtures";

type AvanzaTradeCardExecutionReadinessVisualPreviewHarnessProps = {
  fixtures?: readonly AvanzaTradeCardExecutionReadinessAdapterFixture[];
};

const harnessBadges = [
  "Trade card readiness badge visual preview",
  "Dev QA only",
  "Feature flag remains default-off",
  "Fixture/model only",
  "Recommendation card badge preview",
  "Live-position card badge preview",
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

export function AvanzaTradeCardExecutionReadinessVisualPreviewHarness({
  fixtures = avanzaTradeCardExecutionReadinessAdapterFixtures,
}: AvanzaTradeCardExecutionReadinessVisualPreviewHarnessProps) {
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
          Read-only badge enabled-state visual QA
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture cards only. This previews how the Trade card execution
          readiness badge would look if the default-off feature flag were
          conceptually enabled in dev QA; it does not change the production
          flag, activate default Trade UI behavior, call APIs, fetch, poll,
          start browser automation, invoke smoke tests, access credentials,
          handle cookies/session, automate BankID, submit orders, click final
          KÖP/SÄLJ, or write Supabase.
        </p>
      </div>

      <AvanzaTradeCardExecutionReadinessVisualPreview fixtures={fixtures} />
    </section>
  );
}
