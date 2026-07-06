import type {
  AvanzaHeadlessAgentPlanBuilderFixture,
} from "@/lib/avanza-headless-agent-plan-builder-fixtures";
import {
  avanzaHeadlessAgentPlanBuilderFixtures,
} from "@/lib/avanza-headless-agent-plan-builder-fixtures";

type AvanzaHeadlessAgentPlanBuilderHarnessProps = {
  fixtures?: readonly AvanzaHeadlessAgentPlanBuilderFixture[];
};

const harnessBadges = [
  "Avanza headless agent plan builder",
  "Fixture/model only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Recommendation BUY plan modeled",
  "Live-position SELL plan modeled",
  "Login path planned only",
  "Instrument search planned only",
  "Limit order preparation planned only",
  "Stop before final confirmation",
  "Human final KÖP/SÄLJ required",
  "Settlement reconciliation planned",
  "No visible Trade UI changes",
  "No active handoff",
  "No prepare action",
  "No buy/sell CTA",
  "No browser automation now",
  "No API route call",
  "No fetch/polling",
  "No credential access",
  "No cookies/session",
  "No BankID automation",
  "No order submission",
  "No final KÖP/SÄLJ click",
  "No Supabase write",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "planOnly",
  "headlessOnly",
  "visibleInUi",
  "canStartHandoff",
  "canPrepareOrderNow",
  "canRunSmokeTestFromUi",
  "canCallApiRoute",
  "canFetch",
  "canPoll",
  "canUseBrowserAutomationNow",
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
  if (typeof value === "object") return JSON.stringify(value);

  return String(value);
}

export function AvanzaHeadlessAgentPlanBuilderHarness({
  fixtures = avanzaHeadlessAgentPlanBuilderFixtures,
}: AvanzaHeadlessAgentPlanBuilderHarnessProps) {
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
          Headless agent plan fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static plan metadata only. This converts selected UI-hidden execution
          contracts into future Avanza preparation plans for an Execution Agent
          read path while keeping the Trade UI visually simple and inactive.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const { plan } = fixture;

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
                    {plan.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {plan.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", plan.status],
                  ["label", plan.label],
                  ["reason", plan.reason],
                  ["source", plan.source],
                  ["intent", plan.intent],
                  ["ticker", plan.ticker],
                  ["side", plan.side],
                  ["quantity", plan.quantity],
                  ["limitPrice", plan.limitPrice],
                  ["orderType", plan.orderType],
                  ["profileReady", plan.profileReady],
                  ["loginKnown", plan.loginKnown],
                  ["customerType", plan.customerType],
                  ["selectedContractId", plan.selectedContractId],
                  ["selectorId", plan.selectorId],
                  ["forbiddenActions", formatValue(plan.forbiddenActions)],
                  ["manualRequirements", formatValue(plan.manualRequirements)],
                  ["agentReadableSummary", plan.agentReadableSummary],
                  ["settlementExpectation", plan.settlementExpectation],
                  ["warnings", formatValue(plan.warnings)],
                  ["blockedReasons", formatValue(plan.blockedReasons)],
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
                <h4 className="text-xs font-semibold text-zinc-200">Steps</h4>
                <div className="grid gap-2">
                  {plan.steps.map((item) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                      key={item.stepId}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-200">
                          {item.type}: {item.label}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 font-semibold text-zinc-300">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 leading-5 text-zinc-400">
                        {item.agentInstruction}
                      </p>
                      <dl className="mt-2 grid gap-1 text-zinc-300 sm:grid-cols-2">
                        {[
                          ["userVisible", item.userVisible],
                          ["requiresHuman", item.requiresHuman],
                          ["forbidden", item.forbidden],
                          ["safeToExecuteLater", item.safeToExecuteLater],
                          ["stopCondition", item.stopCondition],
                          ["expectedInput", item.expectedInput],
                          ["expectedOutput", item.expectedOutput],
                        ].map(([label, value]) => (
                          <div className="flex justify-between gap-3" key={String(label)}>
                            <dt className="text-zinc-500">{label}</dt>
                            <dd className="text-right">{formatValue(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Safety flags
                </h4>
                <dl className="grid gap-1 text-xs text-zinc-300 sm:grid-cols-2">
                  {safetyFlagKeys.map((key) => (
                    <div className="flex justify-between gap-3" key={key}>
                      <dt className="text-zinc-500">{key}</dt>
                      <dd>{formatValue(plan.safetyFlags[key])}</dd>
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
