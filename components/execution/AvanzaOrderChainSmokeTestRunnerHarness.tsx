import type {
  AvanzaOrderChainSmokeTestRunnerFixture,
} from "@/lib/avanza-order-chain-smoke-test-runner-fixtures";
import {
  avanzaOrderChainSmokeTestRunnerFixtures,
} from "@/lib/avanza-order-chain-smoke-test-runner-fixtures";

type AvanzaOrderChainSmokeTestRunnerHarnessProps = {
  fixtures?: readonly AvanzaOrderChainSmokeTestRunnerFixture[];
};

const summaryBadges = [
  "Avanza order chain smoke test runner",
  "Fixture/model only",
  "Manual local terminal only",
  "Explicit env opt-in required",
  "CI blocked",
  "Injected dependencies only",
  "Search/instrument/order-prep smoke path",
  "Review-ready stop modeled",
  "Final human action required",
  "No Trade UI wiring",
  "No API route wiring",
  "No final KÖP/SÄLJ click",
  "No order submission",
  "No cookies/session",
  "No BankID automation",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "runnerEnabled",
  "localDevOnly",
  "canRunInCi",
  "requiresExplicitEnvOptIn",
  "explicitEnvOptInPresent",
  "requiresManualTerminalRun",
  "manualTerminalRunConfirmed",
  "canUseRealPlaywrightPage",
  "canUseOrderChainExecutor",
  "canSearchInstrument",
  "canPrepareOrderFields",
  "canReachOrderReview",
  "canClickFinalBuy",
  "canClickFinalSell",
  "canSubmitOrder",
  "canReadCookies",
  "canExportSession",
  "canAutomateBankId",
  "canBypassBankId",
  "canWireTradeUi",
  "canWireApiRoute",
  "valueVisibleInReports",
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

export function AvanzaOrderChainSmokeTestRunnerHarness({
  fixtures = avanzaOrderChainSmokeTestRunnerFixtures,
}: AvanzaOrderChainSmokeTestRunnerHarnessProps) {
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {summaryBadges.map((badge) => (
          <span
            className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100"
            key={badge}
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {fixtures.map((fixture) => {
          const { report } = fixture;

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
                  {report.label}. {report.reason}
                </p>
              </div>

              <dl className="grid gap-2 text-xs text-zinc-300 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-zinc-500">expectedStatus</dt>
                  <dd>{fixture.expectedStatus}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">status</dt>
                  <dd>{report.status}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">mode</dt>
                  <dd>{report.mode}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">side</dt>
                  <dd>{report.side}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">ticker</dt>
                  <dd>{report.ticker}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">instrumentName</dt>
                  <dd>{formatValue(report.instrumentName)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    smokeTestExecuted
                  </dt>
                  <dd>{formatValue(report.smokeTestExecuted)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    realPlaywrightPageUsed
                  </dt>
                  <dd>{formatValue(report.realPlaywrightPageUsed)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">searchExecuted</dt>
                  <dd>{formatValue(report.searchExecuted)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    instrumentSelected
                  </dt>
                  <dd>{formatValue(report.instrumentSelected)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    instrumentVerificationPassed
                  </dt>
                  <dd>{formatValue(report.instrumentVerificationPassed)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    orderFieldsPrepared
                  </dt>
                  <dd>{formatValue(report.orderFieldsPrepared)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">orderReviewReady</dt>
                  <dd>{formatValue(report.orderReviewReady)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    finalHumanActionRequired
                  </dt>
                  <dd>{formatValue(report.finalHumanActionRequired)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">orderSubmitted</dt>
                  <dd>{formatValue(report.orderSubmitted)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">
                    finalBuySellClicked
                  </dt>
                  <dd>{formatValue(report.finalBuySellClicked)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">cookiesRead</dt>
                  <dd>{formatValue(report.cookiesRead)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">sessionExported</dt>
                  <dd>{formatValue(report.sessionExported)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">bankIdAutomated</dt>
                  <dd>{formatValue(report.bankIdAutomated)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">tradeUiWired</dt>
                  <dd>{formatValue(report.tradeUiWired)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">apiRouteWired</dt>
                  <dd>{formatValue(report.apiRouteWired)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">ciExecution</dt>
                  <dd>{formatValue(report.ciExecution)}</dd>
                </div>
              </dl>

              <div className="grid gap-2 text-xs text-zinc-300">
                <p>
                  <span className="font-semibold text-zinc-500">warnings: </span>
                  {formatValue(report.warnings)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">
                    blockedReasons:{" "}
                  </span>
                  {formatValue(report.blockedReasons)}
                </p>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Safety flags
                </h4>
                <dl className="grid gap-1 text-xs text-zinc-300 sm:grid-cols-2">
                  {safetyFlagKeys.map((key) => (
                    <div className="flex justify-between gap-3" key={key}>
                      <dt className="text-zinc-500">{key}</dt>
                      <dd>{formatValue(report.safetyFlags[key])}</dd>
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
