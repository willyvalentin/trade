import type {
  AvanzaLocalDevBridgeReadinessCheckpointFixture,
} from "@/lib/avanza-local-dev-bridge-readiness-checkpoint-fixtures";
import {
  avanzaLocalDevBridgeReadinessCheckpointFixtures,
} from "@/lib/avanza-local-dev-bridge-readiness-checkpoint-fixtures";

type AvanzaLocalDevBridgeReadinessCheckpointHarnessProps = {
  fixtures?: readonly AvanzaLocalDevBridgeReadinessCheckpointFixture[];
};

const harnessBadges = [
  "Avanza local-dev bridge readiness checkpoint",
  "Fixture/model only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Invocation boundary reached model-only",
  "Cannot cross invocation boundary now",
  "Bridge contract ready",
  "Activation checklist ready",
  "Disabled runner skeleton ready",
  "Model-only dry-run ready",
  "Smoke runner invocation blocked",
  "Terminal script invocation blocked",
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
  "headlessOnly",
  "visibleInUi",
  "canCrossInvocationBoundaryNow",
  "canOpenLocalDevBridgeGate",
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

export function AvanzaLocalDevBridgeReadinessCheckpointHarness({
  fixtures = avanzaLocalDevBridgeReadinessCheckpointFixtures,
}: AvanzaLocalDevBridgeReadinessCheckpointHarnessProps) {
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
          Local-dev bridge readiness checkpoint fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static checkpoint metadata only. The checkpoint summarizes the
          under-surface bridge stack at the exact invocation boundary and keeps
          runtime invocation, smoke runners, terminal scripts, browser
          automation, credentials, API calls, order behavior, final KÖP/SÄLJ,
          and Supabase writes locked.
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
                  ["completedCapabilities", checkpoint.completedCapabilities],
                  ["simulatedCapabilities", checkpoint.simulatedCapabilities],
                  ["blockedCapabilities", checkpoint.blockedCapabilities],
                  ["forbiddenCapabilities", checkpoint.forbiddenCapabilities],
                  ["nextAllowedDesignStep", checkpoint.nextAllowedDesignStep],
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
                <h4 className="text-xs font-semibold text-zinc-200">
                  Invocation boundary
                </h4>
                <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["status", checkpoint.invocationBoundary.status],
                    ["label", checkpoint.invocationBoundary.label],
                    ["summary", checkpoint.invocationBoundary.summary],
                    ["reachedBy", checkpoint.invocationBoundary.reachedBy],
                    ["stopReason", checkpoint.invocationBoundary.stopReason],
                    ["canCrossNow", checkpoint.invocationBoundary.canCrossNow],
                    [
                      "crossingRequires",
                      checkpoint.invocationBoundary.crossingRequires,
                    ],
                    [
                      "crossingForbiddenActions",
                      checkpoint.invocationBoundary.crossingForbiddenActions,
                    ],
                  ].map(([label, value]) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2"
                      key={`${fixture.fixtureId}-boundary-${label}`}
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
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">Layers</h4>
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
                      <p className="mt-1 text-zinc-500">
                        evidence: {formatValue(item.evidence)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        invokesRuntimeBehavior:{" "}
                        {formatValue(item.invokesRuntimeBehavior)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        visibleInUi: {formatValue(item.visibleInUi)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        warnings: {formatValue(item.warnings)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        blockedReasons: {formatValue(item.blockedReasons)}
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
