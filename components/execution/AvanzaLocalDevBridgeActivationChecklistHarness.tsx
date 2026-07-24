import type {
  AvanzaLocalDevBridgeActivationChecklistFixture,
} from "@/lib/avanza-local-dev-bridge-activation-checklist-fixtures";
import {
  avanzaLocalDevBridgeActivationChecklistFixtures,
} from "@/lib/avanza-local-dev-bridge-activation-checklist-fixtures";

type AvanzaLocalDevBridgeActivationChecklistHarnessProps = {
  fixtures?: readonly AvanzaLocalDevBridgeActivationChecklistFixture[];
};

const harnessBadges = [
  "Avanza local-dev bridge activation checklist",
  "Fixture/model only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Manual review required",
  "Disabled runner design approval modeled",
  "Bridge gate still locked",
  "Smoke runner invocation blocked",
  "Terminal-only future path",
  "Env opt-in required",
  "Manual terminal confirmation required",
  "Separate real-run flag required",
  "Browser automation gate locked",
  "Credential access gate locked",
  "Cookies/session forbidden",
  "BankID automation forbidden",
  "Order submission forbidden",
  "Final KÖP/SÄLJ human-only",
  "Supabase writes locked",
  "Trade UI execution locked",
  "API route execution locked",
  "UI simplicity protected",
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
  "checklistOnly",
  "headlessOnly",
  "visibleInUi",
  "canApproveDisabledRunnerDesign",
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

export function AvanzaLocalDevBridgeActivationChecklistHarness({
  fixtures = avanzaLocalDevBridgeActivationChecklistFixtures,
}: AvanzaLocalDevBridgeActivationChecklistHarnessProps) {
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
          Local-dev bridge activation checklist fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static checklist metadata only. Disabled runner design approval can be
          modeled for review, but bridge runtime, smoke runners, terminal
          scripts, browser automation, credentials, order submission, final
          KÖP/SÄLJ, and Supabase writes remain blocked.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const { checklist } = fixture;

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
                  {checklist.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", checklist.status],
                  ["label", checklist.label],
                  ["summary", checklist.summary],
                  ["approvalLevel", checklist.approvalLevel],
                  [
                    "readyForDisabledRunnerDesign",
                    checklist.readyForDisabledRunnerDesign,
                  ],
                  ["readyForModelOnlyDryRun", checklist.readyForModelOnlyDryRun],
                  ["readyForRealRun", checklist.readyForRealRun],
                  ["warnings", checklist.warnings],
                  ["blockedReasons", checklist.blockedReasons],
                  ["nextRecommendedAction", checklist.nextRecommendedAction],
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
                  Checklist items
                </h4>
                <div className="grid gap-2">
                  {checklist.items.map((item) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                      key={`${fixture.fixtureId}-${item.itemId}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-200">
                          {item.itemId}: {item.label}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 font-semibold text-zinc-300">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-zinc-400">{item.purpose}</p>
                      <p className="mt-1 text-zinc-500">
                        evidenceRequired: {formatValue(item.evidenceRequired)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        evidenceForbidden: {formatValue(item.evidenceForbidden)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        passedBy: {formatValue(item.passedBy)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        blockedReason: {formatValue(item.blockedReason)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Approval gates
                </h4>
                <div className="grid gap-2">
                  {checklist.approvalGates.map((gate) => (
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
                        allows: {formatValue(gate.currentlyAllows)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        blocks: {formatValue(gate.currentlyBlocks)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        unlockRequires: {formatValue(gate.unlockRequires)}
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
                        {formatValue(checklist.safetyFlags[key])}
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
