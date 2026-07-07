import type {
  AvanzaManualLocalDevInvocationApprovalRunbookFixture,
} from "@/lib/avanza-manual-local-dev-invocation-approval-runbook-fixtures";
import {
  avanzaManualLocalDevInvocationApprovalRunbookFixtures,
} from "@/lib/avanza-manual-local-dev-invocation-approval-runbook-fixtures";

type AvanzaManualLocalDevInvocationApprovalRunbookHarnessProps = {
  fixtures?: readonly AvanzaManualLocalDevInvocationApprovalRunbookFixture[];
};

const harnessBadges = [
  "Avanza manual local-dev invocation approval runbook",
  "Fixture/model only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Manual review required",
  "Invocation boundary stop confirmed",
  "Approval for design only modeled",
  "Runtime invocation not approved",
  "Real run forbidden",
  "Production readiness forbidden",
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
  "UI simplicity protected",
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
  "runbookOnly",
  "approvalModelOnly",
  "headlessOnly",
  "visibleInUi",
  "canApproveInvocationAdapterDesign",
  "canOpenLocalDevBridgeGate",
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

export function AvanzaManualLocalDevInvocationApprovalRunbookHarness({
  fixtures = avanzaManualLocalDevInvocationApprovalRunbookFixtures,
}: AvanzaManualLocalDevInvocationApprovalRunbookHarnessProps) {
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
          Manual local-dev invocation approval fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static approval evidence model only. The runbook can approve a future
          disabled or model-only invocation adapter design, but cannot open the
          bridge gate, invoke smoke runners, import terminal scripts, start
          browser automation, call APIs, access credentials, submit orders,
          click final KÖP/SÄLJ, or write Supabase.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const { runbook } = fixture;

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
                  {runbook.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", runbook.status],
                  ["label", runbook.label],
                  ["summary", runbook.summary],
                  ["approvalLevel", runbook.approvalLevel],
                  ["approvedNextDesignStep", runbook.approvedNextDesignStep],
                  [
                    "explicitlyForbiddenNextSteps",
                    runbook.explicitlyForbiddenNextSteps,
                  ],
                  ["warnings", runbook.warnings],
                  ["blockedReasons", runbook.blockedReasons],
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
                <h4 className="text-xs font-semibold text-zinc-200">Items</h4>
                <div className="grid gap-2">
                  {runbook.items.map((item) => (
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
                        evidenceKind: {item.evidenceKind}
                      </p>
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
                  Evidence
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {runbook.evidence.map((evidence) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                      key={`${fixture.fixtureId}-${evidence.evidenceId}`}
                    >
                      <p className="font-semibold text-zinc-200">
                        {evidence.kind}: {evidence.label}
                      </p>
                      <p className="mt-2 text-zinc-400">
                        {evidence.safeSummary}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        accepted: {formatValue(evidence.accepted)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        forbidden: {formatValue(evidence.forbidden)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        redactionRequired:{" "}
                        {formatValue(evidence.redactionRequired)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        mayContainSensitiveData:{" "}
                        {formatValue(evidence.mayContainSensitiveData)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        allowedToPersist:{" "}
                        {formatValue(evidence.allowedToPersist)}
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
                  {runbook.approvalGates.map((gate) => (
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
                        {formatValue(runbook.safetyFlags[key])}
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
