import type {
  AvanzaHeadlessExecutionOrchestrationPipelineFixture,
} from "@/lib/avanza-headless-execution-orchestration-pipeline-fixtures";
import {
  avanzaHeadlessExecutionOrchestrationPipelineFixtures,
} from "@/lib/avanza-headless-execution-orchestration-pipeline-fixtures";

type AvanzaHeadlessExecutionOrchestrationPipelineHarnessProps = {
  fixtures?: readonly AvanzaHeadlessExecutionOrchestrationPipelineFixture[];
};

const harnessBadges = [
  "Avanza headless execution orchestration pipeline",
  "Fixture/model only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Contract-to-selector-to-plan-to-session modeled",
  "Recommendation BUY orchestration modeled",
  "Live-position SELL orchestration modeled",
  "Exit priority modeled",
  "Stop-loss priority modeled",
  "Session initialized to plan-ready",
  "Next theoretical agent step modeled",
  "Final KÖP/SÄLJ human-only",
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
  "orchestrationOnly",
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

export function AvanzaHeadlessExecutionOrchestrationPipelineHarness({
  fixtures = avanzaHeadlessExecutionOrchestrationPipelineFixtures,
}: AvanzaHeadlessExecutionOrchestrationPipelineHarnessProps) {
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
          Headless execution orchestration fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static orchestration metadata only. This connects contract selection,
          plan building, and session initialization while keeping the Trade UI
          visually simple and inactive.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const { report } = fixture;

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
                    Expected state: {fixture.expectedStatus}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {report.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", report.status],
                  ["label", report.label],
                  ["reason", report.reason],
                  ["mode", report.mode],
                  ["selectedContractId", report.selectedContractId],
                  ["selectedSource", report.selectedSource],
                  ["selectedIntent", report.selectedIntent],
                  ["selectedTicker", report.selectedTicker],
                  ["selectedSide", report.selectedSide],
                  ["selectedQuantity", report.selectedQuantity],
                  ["selectedLimitPrice", report.selectedLimitPrice],
                  ["selectorResult", report.selectorResult?.status],
                  ["plan", report.plan?.status],
                  ["session", report.session?.status],
                  ["nextTheoreticalAgentStep", report.nextTheoreticalAgentStep],
                  ["warnings", formatValue(report.warnings)],
                  ["blockedReasons", formatValue(report.blockedReasons)],
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
                  Agent-readable summary
                </h4>
                <p className="text-xs leading-5 text-zinc-400">
                  {report.agentReadableSummary}
                </p>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Stages
                </h4>
                <div className="grid gap-2">
                  {report.stages.map((stage) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                      key={`${fixture.fixtureId}-${stage.stage}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-200">
                          {stage.stage}: {stage.label}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 font-semibold text-zinc-300">
                          {stage.status}
                        </span>
                      </div>
                      <p className="mt-2 text-zinc-400">{stage.safeSummary}</p>
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
                      <dd>{formatValue(report.safetyFlags[key])}</dd>
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
