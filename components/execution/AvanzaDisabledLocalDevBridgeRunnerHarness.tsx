import type {
  AvanzaDisabledLocalDevBridgeRunnerFixture,
} from "@/lib/avanza-disabled-local-dev-bridge-runner-fixtures";
import {
  avanzaDisabledLocalDevBridgeRunnerFixtures,
} from "@/lib/avanza-disabled-local-dev-bridge-runner-fixtures";

type AvanzaDisabledLocalDevBridgeRunnerHarnessProps = {
  fixtures?: readonly AvanzaDisabledLocalDevBridgeRunnerFixture[];
};

const harnessBadges = [
  "Avanza disabled local-dev bridge runner",
  "Fixture/model only",
  "Disabled skeleton only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Bridge contract accepted only as model input",
  "Activation checklist required",
  "Disabled runner design approval does not open runtime",
  "Bridge gate still locked",
  "Smoke runner invocation blocked",
  "Terminal script invocation blocked",
  "Browser automation gate locked",
  "Credential access gate locked",
  "Cookies/session forbidden",
  "BankID automation forbidden",
  "Order submission forbidden",
  "Final KÖP/SÄLJ human-only",
  "Supabase writes locked",
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
  "runnerSkeletonOnly",
  "disabledOnly",
  "headlessOnly",
  "visibleInUi",
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

export function AvanzaDisabledLocalDevBridgeRunnerHarness({
  fixtures = avanzaDisabledLocalDevBridgeRunnerFixtures,
}: AvanzaDisabledLocalDevBridgeRunnerHarnessProps) {
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
          Disabled local-dev bridge runner fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static runner-report metadata only. Bridge contract and activation
          checklist inputs can produce a disabled report, but runtime, smoke
          runners, terminal scripts, browser automation, credentials, cookies,
          order submission, final KÖP/SÄLJ, and Supabase writes remain blocked.
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
                  ["bridgeContractId", report.bridgeContractId],
                  ["checklistId", report.checklistId],
                  ["requestKind", report.requestKind],
                  ["selectedTicker", report.selectedTicker],
                  ["selectedSide", report.selectedSide],
                  ["selectedQuantity", report.selectedQuantity],
                  ["selectedLimitPrice", report.selectedLimitPrice],
                  ["warnings", report.warnings],
                  ["blockedReasons", report.blockedReasons],
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
                  Disabled steps
                </h4>
                <div className="grid gap-2">
                  {report.disabledSteps.map((step) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                      key={`${fixture.fixtureId}-${step.stepId}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-200">
                          {step.stepId}: {step.label}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 font-semibold text-zinc-300">
                          {step.status}
                        </span>
                      </div>
                      <p className="mt-2 text-zinc-400">{step.purpose}</p>
                      <p className="mt-1 text-zinc-500">
                        currentlyCalls: {formatValue(step.currentlyCalls)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        wouldCallLater: {formatValue(step.wouldCallLater)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        blockedReason: {formatValue(step.blockedReason)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        forbiddenActions: {formatValue(step.forbiddenActions)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <h4 className="font-semibold text-zinc-200">
                    Would require before invocation
                  </h4>
                  <p className="mt-2 text-zinc-400">
                    {formatValue(report.wouldRequireBeforeInvocation)}
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <h4 className="font-semibold text-zinc-200">
                    Forbidden actions
                  </h4>
                  <p className="mt-2 text-zinc-400">
                    {formatValue(report.forbiddenActions)}
                  </p>
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
                        {formatValue(report.safetyFlags[key])}
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
