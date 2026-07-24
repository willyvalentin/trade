import type {
  AvanzaHeadlessExecutionArchitectureCheckpointFixture,
} from "@/lib/avanza-headless-execution-architecture-checkpoint-fixtures";
import {
  avanzaHeadlessExecutionArchitectureCheckpointFixtures,
} from "@/lib/avanza-headless-execution-architecture-checkpoint-fixtures";

type AvanzaHeadlessExecutionArchitectureCheckpointHarnessProps = {
  fixtures?: readonly AvanzaHeadlessExecutionArchitectureCheckpointFixture[];
};

const harnessBadges = [
  "Avanza headless execution architecture checkpoint",
  "Fixture/model only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Complete headless chain reviewed",
  "Contract layer ready",
  "Selector layer ready",
  "Plan builder layer ready",
  "Session state machine ready",
  "Orchestration pipeline ready",
  "Local-dev bridge gate not open",
  "Browser automation gate locked",
  "Trade UI execution gate locked",
  "API route execution gate locked",
  "Final KÖP/SÄLJ human-only",
  "Order submission forbidden",
  "BankID automation forbidden",
  "Cookies/session forbidden",
  "Supabase writes locked",
  "Production readiness blocked",
  "UI remains visually simple",
  "No visible Trade UI changes",
  "No active handoff",
  "No prepare action",
  "No buy/sell CTA",
  "No browser automation now",
  "No API route call",
  "No fetch/polling",
  "No credential access",
  "No order submission",
  "No final KÖP/SÄLJ click",
  "No Supabase write",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "checkpointOnly",
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
  "canExecute",
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

export function AvanzaHeadlessExecutionArchitectureCheckpointHarness({
  fixtures = avanzaHeadlessExecutionArchitectureCheckpointFixtures,
}: AvanzaHeadlessExecutionArchitectureCheckpointHarnessProps) {
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
          Headless architecture checkpoint fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static checkpoint metadata only. This summarizes the complete
          under-surface agent brain loop and the activation gates that remain
          locked before any local-dev execution bridge work.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const { checkpoint } = fixture;

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
                  {checkpoint.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", checkpoint.status],
                  ["label", checkpoint.label],
                  ["summary", checkpoint.summary],
                  ["nextRecommendedAction", checkpoint.nextRecommendedAction],
                  ["readyCapabilities", checkpoint.readyCapabilities],
                  ["blockedCapabilities", checkpoint.blockedCapabilities],
                  ["warnings", checkpoint.warnings],
                  ["blockedReasons", checkpoint.blockedReasons],
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
                  Layers
                </h4>
                <div className="grid gap-2">
                  {checkpoint.layers.map((item) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                      key={`${fixture.fixtureId}-${item.layer}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-200">
                          {item.layer}: {item.label}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 font-semibold text-zinc-300">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-zinc-400">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Activation gates
                </h4>
                <div className="grid gap-2">
                  {checkpoint.activationGates.map((gate) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                      key={`${fixture.fixtureId}-${gate.gateId}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-200">
                          {gate.gateId}: {gate.label}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 font-semibold text-zinc-300">
                          {gate.status}
                        </span>
                      </div>
                      <p className="mt-2 text-zinc-400">{gate.purpose}</p>
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
                      <dd>{formatValue(checkpoint.safetyFlags[key])}</dd>
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
