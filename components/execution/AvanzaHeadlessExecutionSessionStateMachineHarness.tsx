import type {
  AvanzaHeadlessExecutionSessionStateMachineFixture,
} from "@/lib/avanza-headless-execution-session-state-machine-fixtures";
import {
  avanzaHeadlessExecutionSessionStateMachineFixtures,
} from "@/lib/avanza-headless-execution-session-state-machine-fixtures";

type AvanzaHeadlessExecutionSessionStateMachineHarnessProps = {
  fixtures?: readonly AvanzaHeadlessExecutionSessionStateMachineFixture[];
};

const harnessBadges = [
  "Avanza headless execution session state machine",
  "Fixture/model only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Recommendation BUY session modeled",
  "Live-position SELL session modeled",
  "Plan-to-review lifecycle modeled",
  "Waiting for manual final confirmation",
  "User final click observed, agent final click forbidden",
  "Settlement reconciliation pending",
  "Invalid transitions rejected",
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
  "No order submission by agent",
  "No final KÖP/SÄLJ click by agent",
  "No Supabase write",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "stateMachineOnly",
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

export function AvanzaHeadlessExecutionSessionStateMachineHarness({
  fixtures = avanzaHeadlessExecutionSessionStateMachineFixtures,
}: AvanzaHeadlessExecutionSessionStateMachineHarnessProps) {
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
          Headless execution session fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static state-machine metadata only. This models future Execution
          Agent lifecycle states after a headless plan is built, while the
          Trade UI remains visually simple and inactive.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const { session } = fixture;

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
                  {session.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", session.status],
                  ["sessionId", session.sessionId],
                  ["contractId", session.contractId],
                  ["planId", session.planId],
                  ["selectorId", session.selectorId],
                  ["source", session.source],
                  ["intent", session.intent],
                  ["ticker", session.ticker],
                  ["side", session.side],
                  ["quantity", session.quantity],
                  ["limitPrice", session.limitPrice],
                  ["orderType", session.orderType],
                  ["mode", session.mode],
                  ["currentStepId", session.currentStepId],
                  ["warnings", formatValue(session.warnings)],
                  ["blockedReasons", formatValue(session.blockedReasons)],
                  [
                    "transition statuses",
                    formatValue(
                      fixture.transitions.map(
                        (transition) =>
                          `${transition.fromStatus}->${transition.toStatus}:${transition.status}`,
                      ),
                    ),
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
                  Event log
                </h4>
                <div className="grid gap-2">
                  {session.eventLog.map((event) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                      key={event.eventId}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-200">
                          {event.type}: {event.reason}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 font-semibold text-zinc-300">
                          {event.actor}
                        </span>
                      </div>
                      <dl className="mt-2 grid gap-1 text-zinc-300 sm:grid-cols-2">
                        {[
                          ["userVisible", event.userVisible],
                          ["payloadSummary", event.payloadSummary],
                          ["safeMetadata", event.safeMetadata],
                          ["forbidden", event.forbidden],
                        ].map(([label, value]) => (
                          <div className="flex justify-between gap-3" key={String(label)}>
                            <dt className="text-zinc-500">{String(label)}</dt>
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
                      <dd>{formatValue(session.safetyFlags[key])}</dd>
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
