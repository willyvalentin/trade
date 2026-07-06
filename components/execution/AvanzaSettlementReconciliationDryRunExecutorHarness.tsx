import {
  avanzaSettlementReconciliationDryRunExecutorFixtures,
  type AvanzaSettlementReconciliationDryRunExecutorFixture,
} from "@/lib/avanza-settlement-reconciliation-dry-run-executor-fixtures";

type Props = {
  fixtures?: readonly AvanzaSettlementReconciliationDryRunExecutorFixture[];
};

const summaryBadges = [
  "Avanza settlement reconciliation dry-run executor",
  "Fixture/model only",
  "Dry-run only",
  "Full post-trade reconciliation path simulated",
  "Courtage extraction target simulated",
  "FX/växelkurs extraction target simulated",
  "Settlement amount target simulated",
  "Reconciliation targets simulated",
  "Manual review required",
  "No real Avanza navigation",
  "No PDF/download/read",
  "No OCR",
  "No value extraction",
  "No reconciliation write",
  "No Supabase write",
  "No cookies/session",
  "No BankID automation",
  "No Trade UI wiring",
  "No API route wiring",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "dryRunEnabled",
  "canDryRun",
  "canExecuteSettlementRoute",
  "canExecuteSettlementActions",
  "canNavigateToTransactions",
  "canOpenSettlementNote",
  "canReadSettlementDocument",
  "canDownloadPdf",
  "canUseOcr",
  "canExtractValues",
  "canBuildReconciliationPreview",
  "canApplyReconciliation",
  "canWriteExecutionRecord",
  "canWriteTradeResult",
  "canWriteStatistics",
  "canWriteAuditMetadata",
  "canWriteSupabase",
  "canReadCookies",
  "canExportSession",
  "canAutomateBankId",
  "canBypassBankId",
  "requiresManualReview",
  "userMustConfirm",
  "controlsEnabled",
  "gateLocked",
] as const;

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "n/a";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "none";

  return String(value);
}

export function AvanzaSettlementReconciliationDryRunExecutorHarness({
  fixtures = avanzaSettlementReconciliationDryRunExecutorFixtures,
}: Props) {
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
                {[
                  ["expectedStatus", fixture.expectedStatus],
                  ["status", report.status],
                  ["dryRunId", report.dryRunId],
                  ["mode", report.mode],
                  ["side", report.side],
                  ["ticker", report.ticker],
                  ["instrumentName", formatValue(report.instrumentName)],
                  ["quantity", formatValue(report.quantity)],
                  ["estimatedTradeDate", formatValue(report.estimatedTradeDate)],
                  [
                    "expectedSettlementDate",
                    formatValue(report.expectedSettlementDate),
                  ],
                  [
                    "settlementRouteReady",
                    formatValue(report.settlementRouteReady),
                  ],
                  [
                    "settlementActionPlanReady",
                    formatValue(report.settlementActionPlanReady),
                  ],
                  [
                    "extractionSchemaReady",
                    formatValue(report.extractionSchemaReady),
                  ],
                  [
                    "reconciliationPreviewReady",
                    formatValue(report.reconciliationPreviewReady),
                  ],
                  [
                    "manualReviewRequired",
                    formatValue(report.manualReviewRequired),
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-semibold text-zinc-500">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-300">
                <p>
                  <span className="font-semibold text-zinc-500">
                    expectedExtractionTargets:{" "}
                  </span>
                  {formatValue(report.expectedExtractionTargets)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">
                    expectedReconciliationTargets:{" "}
                  </span>
                  {formatValue(report.expectedReconciliationTargets)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">
                    nextExpectedState:{" "}
                  </span>
                  {report.nextExpectedState}
                </p>
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

              <div className="grid gap-2">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Dry-run steps
                </h4>
                {report.stepReports.map((step) => (
                  <div
                    className="rounded-md border border-white/10 bg-white/[0.025] p-3 text-xs text-zinc-300"
                    key={`${fixture.fixtureId}-${step.stepId}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-100">
                        {step.label}
                      </p>
                      <p className="text-zinc-500">{step.dryRunStatus}</p>
                    </div>
                    <dl className="mt-2 grid gap-1 sm:grid-cols-2">
                      <div>
                        <dt className="text-zinc-500">stepType</dt>
                        <dd>{step.stepType}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">wouldUseValueSource</dt>
                        <dd>{step.wouldUseValueSource}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">wouldTargetSignalText</dt>
                        <dd>{formatValue(step.wouldTargetSignalText)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">safeDisplayValue</dt>
                        <dd>{formatValue(step.safeDisplayValue)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">executableNow</dt>
                        <dd>{formatValue(step.executableNow)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">realBrowserAction</dt>
                        <dd>{formatValue(step.realBrowserAction)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">writesInThisTask</dt>
                        <dd>{formatValue(step.writesInThisTask)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">blockedReason</dt>
                        <dd>{formatValue(step.blockedReason)}</dd>
                      </div>
                    </dl>
                    <p className="mt-2 text-zinc-400">{step.expectedResult}</p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
