import type {
  AvanzaHeadlessExecutionContractSelectorFixture,
} from "@/lib/avanza-headless-execution-contract-selector-fixtures";
import {
  avanzaHeadlessExecutionContractSelectorFixtures,
} from "@/lib/avanza-headless-execution-contract-selector-fixtures";

type AvanzaHeadlessExecutionContractSelectorHarnessProps = {
  fixtures?: readonly AvanzaHeadlessExecutionContractSelectorFixture[];
};

const harnessBadges = [
  "Avanza headless execution contract selector",
  "Fixture/model only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Exits outrank entries",
  "Stop-loss outranks target",
  "Target outranks entry",
  "Recommendation entry BUY selection modeled",
  "Live-position exit SELL selection modeled",
  "No visible Trade UI changes",
  "No active handoff",
  "No prepare action",
  "No buy/sell CTA",
  "No browser automation",
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
  "selectorOnly",
  "headlessOnly",
  "visibleInUi",
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
  if (typeof value === "object") return JSON.stringify(value);

  return String(value);
}

export function AvanzaHeadlessExecutionContractSelectorHarness({
  fixtures = avanzaHeadlessExecutionContractSelectorFixtures,
}: AvanzaHeadlessExecutionContractSelectorHarnessProps) {
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
          Headless selector fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static selector metadata only. This ranks UI-hidden recommendation and
          live-position contracts for a future Execution Agent read path while
          keeping the Trade UI visually simple and inactive.
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
                    {result.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {result.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", result.status],
                  ["label", result.label],
                  ["reason", result.reason],
                  [
                    "selectedCandidate",
                    result.selectedCandidate?.contract.contractId ?? "none",
                  ],
                  ["eligibleCount", result.eligibleCount],
                  ["blockedCount", result.blockedCount],
                  ["entryCount", result.entryCount],
                  ["exitCount", result.exitCount],
                  ["stopLossExitCount", result.stopLossExitCount],
                  ["targetExitCount", result.targetExitCount],
                  ["candidates", formatValue(result.candidates.map((item) => item.candidateId))],
                  ["agentReadableSummary", result.agentReadableSummary],
                  ["warnings", formatValue(result.warnings)],
                  ["blockedReasons", formatValue(result.blockedReasons)],
                  [
                    "selectionReason",
                    result.selectedCandidate?.priorityReason ??
                      fixture.expectedSelectionReason,
                  ],
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
