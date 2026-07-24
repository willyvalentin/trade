import type {
  AvanzaHeadlessExecutionDataContractFixture,
} from "@/lib/avanza-headless-execution-data-contract-fixtures";
import {
  avanzaHeadlessExecutionDataContractFixtures,
} from "@/lib/avanza-headless-execution-data-contract-fixtures";

type AvanzaHeadlessExecutionDataContractHarnessProps = {
  fixtures?: readonly AvanzaHeadlessExecutionDataContractFixture[];
};

const harnessBadges = [
  "Avanza headless execution data contract",
  "Fixture/model only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Recommendation entry BUY contract modeled",
  "Live-position exit SELL contract modeled",
  "Settlement expectation modeled",
  "Human final KÖP/SÄLJ required",
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
  "headlessOnly",
  "visibleInUi",
  "canRenderVisualBadge",
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

export function AvanzaHeadlessExecutionDataContractHarness({
  fixtures = avanzaHeadlessExecutionDataContractFixtures,
}: AvanzaHeadlessExecutionDataContractHarnessProps) {
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
          Headless execution data fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static under-the-surface metadata only. These contracts are intended
          for a future Execution Agent read path while the Trade UI remains
          visually simple: no visible card clutter, no active handoff, no
          prepare action, no API route call, no browser automation, no
          credential/session handling, no order submission, and no Supabase
          write.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const { contract } = fixture;

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
                    {contract.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {contract.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", contract.status],
                  ["label", contract.label],
                  ["reason", contract.reason],
                  ["source", contract.source],
                  ["intent", contract.intent],
                  ["ticker", formatValue(contract.ticker)],
                  ["side", contract.side],
                  ["quantity", formatValue(contract.quantity)],
                  ["limitPrice", formatValue(contract.limitPrice)],
                  ["orderType", contract.orderType],
                  [
                    "canBeUsedByAgentLater",
                    formatValue(contract.canBeUsedByAgentLater),
                  ],
                  ["missingFields", formatValue(contract.missingFields)],
                  ["blockers", formatValue(contract.blockers)],
                  ["warnings", formatValue(contract.warnings)],
                  [
                    "agentReadableInstructions",
                    formatValue(contract.agentReadableInstructions),
                  ],
                  [
                    "humanConfirmationRequirement",
                    contract.humanConfirmationRequirement,
                  ],
                  ["forbiddenActions", formatValue(contract.forbiddenActions)],
                  [
                    "settlementExpectation",
                    formatValue(contract.settlementExpectation),
                  ],
                  ["auditMetadata", formatValue(contract.auditMetadata)],
                ].map(([label, value]) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={String(label)}
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
                      <dd>{formatValue(contract.safetyFlags[key])}</dd>
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
