import type {
  AvanzaLocalDevExecutionRunbookFixture,
} from "@/lib/avanza-local-dev-execution-runbook-fixtures";
import {
  avanzaLocalDevExecutionRunbookFixtures,
} from "@/lib/avanza-local-dev-execution-runbook-fixtures";

type AvanzaLocalDevExecutionRunbookHarnessProps = {
  fixtures?: readonly AvanzaLocalDevExecutionRunbookFixture[];
};

const summaryBadges = [
  "Avanza local-dev execution runbook",
  "Fixture/model only",
  "Operator sequence only",
  "Login smoke sequence summarized",
  "Order-prep smoke sequence summarized",
  "Safety boundaries summarized",
  "No real execution in this task",
  "No Trade UI wiring",
  "No API route wiring",
  "No app-runtime navigation",
  "No cookies/session",
  "No BankID automation",
  "No order submission",
  "No final KÖP/SÄLJ click",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "runbookOnly",
  "canExecuteLoginSmoke",
  "canExecuteOrderSmoke",
  "canWireTradeUi",
  "canWireApiRoute",
  "canNavigateFromAppRuntime",
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

  return String(value);
}

export function AvanzaLocalDevExecutionRunbookHarness({
  fixtures = avanzaLocalDevExecutionRunbookFixtures,
}: AvanzaLocalDevExecutionRunbookHarnessProps) {
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {summaryBadges.map((badge) => (
          <span
            className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-xs font-semibold text-sky-100"
            key={badge}
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {fixtures.map((fixture) => {
          const { runbook } = fixture;

          return (
            <article
              className="grid gap-3 rounded-md border border-white/10 bg-zinc-950/70 p-4"
              data-fixture-id={fixture.fixtureId}
              key={fixture.fixtureId}
            >
              <div>
                <p className="text-xs font-bold uppercase text-zinc-500">
                  {fixture.fixtureId}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                  {fixture.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  {runbook.label}. {runbook.summary}
                </p>
              </div>

              <dl className="grid gap-2 text-xs text-zinc-300 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-zinc-500">expectedStatus</dt>
                  <dd>{fixture.expectedStatus}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">status</dt>
                  <dd>{runbook.status}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">runbookId</dt>
                  <dd>{runbook.runbookId}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">createdAt</dt>
                  <dd>{runbook.createdAt}</dd>
                </div>
              </dl>

              <div className="grid gap-2 text-xs text-zinc-300">
                <p>
                  <span className="font-semibold text-zinc-500">
                    prerequisites:{" "}
                  </span>
                  {formatValue(runbook.prerequisites)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">
                    forbiddenActions:{" "}
                  </span>
                  {formatValue(runbook.forbiddenActions)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">
                    allowedLocalDevActions:{" "}
                  </span>
                  {formatValue(runbook.allowedLocalDevActions)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">
                    operatorChecklist:{" "}
                  </span>
                  {formatValue(runbook.operatorChecklist)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">warnings: </span>
                  {formatValue(runbook.warnings)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">
                    blockedReasons:{" "}
                  </span>
                  {formatValue(runbook.blockedReasons)}
                </p>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Operator sequence
                </h4>
                <ol className="grid gap-2 text-xs text-zinc-300">
                  {runbook.steps.map((step) => (
                    <li className="grid gap-1" key={step.stepId}>
                      <span className="font-semibold text-zinc-200">
                        {step.label}
                      </span>
                      <span className="text-zinc-500">
                        {step.type} / {step.area}
                      </span>
                      <span>{step.reason}</span>
                      <span>expectedOutcome: {step.expectedOutcome}</span>
                      <span>stopCondition: {step.stopCondition}</span>
                      <span>
                        requiresManualConfirmation:{" "}
                        {formatValue(step.requiresManualConfirmation)}
                      </span>
                      <span>optional: {formatValue(step.optional)}</span>
                      <span>
                        executableInThisTask:{" "}
                        {formatValue(step.executableInThisTask)}
                      </span>
                      <span>forbidden: {formatValue(step.forbidden)}</span>
                      {step.commandReference ? (
                        <span>commandReference: {step.commandReference}</span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Safety flags
                </h4>
                <dl className="grid gap-1 text-xs text-zinc-300 sm:grid-cols-2">
                  {safetyFlagKeys.map((key) => (
                    <div className="flex justify-between gap-3" key={key}>
                      <dt className="text-zinc-500">{key}</dt>
                      <dd>{formatValue(runbook.safetyFlags[key])}</dd>
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
