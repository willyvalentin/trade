import type {
  AvanzaInvocationAdapterDesignCheckpointFixture,
} from "@/lib/avanza-invocation-adapter-design-checkpoint-fixtures";
import {
  avanzaInvocationAdapterDesignCheckpointFixtures,
} from "@/lib/avanza-invocation-adapter-design-checkpoint-fixtures";

type AvanzaInvocationAdapterDesignCheckpointHarnessProps = {
  fixtures?: readonly AvanzaInvocationAdapterDesignCheckpointFixture[];
};

const harnessBadges = [
  "Avanza invocation adapter design checkpoint",
  "Fixture/model only",
  "Design review only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Disabled adapter contract reviewed",
  "Payload validator reviewed",
  "Safe payload shape validated",
  "Sensitive payload rejected",
  "Runtime invocation not approved",
  "Invocation boundary locked",
  "Smoke runner invocation locked",
  "Terminal script invocation locked",
  "Browser automation locked",
  "Credential access locked",
  "Cookies/session forbidden",
  "BankID automation forbidden",
  "Order submission forbidden",
  "Final KÖP/SÄLJ human-only",
  "Supabase writes locked",
  "Trade UI execution locked",
  "API route activation locked",
  "Production readiness blocked",
  "No visible Trade UI changes",
  "No active handoff",
  "No prepare action",
  "No buy/sell CTA",
  "No browser automation now",
  "No API route call",
  "No fetch/polling",
  "No credential access now",
  "No order submission",
  "No final KÖP/SÄLJ click",
  "No Supabase write",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "checkpointOnly",
  "designReviewOnly",
  "headlessOnly",
  "visibleInUi",
  "canApproveRuntimeInvocation",
  "canCrossInvocationBoundaryNow",
  "canInvokeSmokeRunnerNow",
  "canRunTerminalScriptNow",
  "canUseBrowserAutomationNow",
  "canStartHandoff",
  "canPrepareOrderNow",
  "canRunSmokeTestFromUi",
  "canCallApiRoute",
  "canFetch",
  "canPoll",
  "canAccessCredentials",
  "canCarryCredentials",
  "canReadCookies",
  "canExportSession",
  "canCarrySessionTokens",
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

export function AvanzaInvocationAdapterDesignCheckpointHarness({
  fixtures = avanzaInvocationAdapterDesignCheckpointFixtures,
}: AvanzaInvocationAdapterDesignCheckpointHarnessProps) {
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
          Invocation adapter design checkpoint fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static checkpoint reports only. The checkpoint can mark design review
          readiness, but runtime, real-run, production, Trade UI, bridge, API,
          credential, browser, order, and Supabase capabilities remain locked.
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
                  ["readyForDesignReview", checkpoint.readyForDesignReview],
                  ["readyForRuntime", checkpoint.readyForRuntime],
                  ["readyForRealRun", checkpoint.readyForRealRun],
                  ["readyForProduction", checkpoint.readyForProduction],
                  [
                    "validatedPayloadSummary",
                    checkpoint.validatedPayloadSummary,
                  ],
                  [
                    "rejectedPayloadSummary",
                    checkpoint.rejectedPayloadSummary,
                  ],
                  [
                    "nextAllowedDesignStep",
                    checkpoint.nextAllowedDesignStep,
                  ],
                  ["nextForbiddenSteps", checkpoint.nextForbiddenSteps],
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
                <h4 className="text-xs font-semibold text-zinc-200">Layers</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {checkpoint.layers.map((layer) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                      key={`${fixture.fixtureId}-${layer.layer}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-200">
                          {layer.layer}: {layer.label}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 font-semibold text-zinc-300">
                          {layer.status}
                        </span>
                      </div>
                      <p className="mt-2 text-zinc-400">{layer.summary}</p>
                      <p className="mt-1 text-zinc-500">
                        evidence: {formatValue(layer.evidence)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        invokesRuntimeBehavior:{" "}
                        {formatValue(layer.invokesRuntimeBehavior)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        visibleInUi: {formatValue(layer.visibleInUi)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        warnings: {formatValue(layer.warnings)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        blockedReasons: {formatValue(layer.blockedReasons)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">Gates</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {checkpoint.gates.map((gate) => (
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
                      <p className="mt-1 text-zinc-500">
                        currentlyAllows: {formatValue(gate.currentlyAllows)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        currentlyBlocks: {formatValue(gate.currentlyBlocks)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        unlockRequires: {formatValue(gate.unlockRequires)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        forbiddenActions: {formatValue(gate.forbiddenActions)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Safety flags
                </h4>
                <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  {safetyFlagKeys.map((key) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2"
                      key={`${fixture.fixtureId}-${key}`}
                    >
                      <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                        {key}
                      </dt>
                      <dd className="mt-1 font-semibold text-zinc-200">
                        {formatValue(checkpoint.safetyFlags[key])}
                      </dd>
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
