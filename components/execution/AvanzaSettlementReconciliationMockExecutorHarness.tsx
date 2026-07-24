import {
  avanzaSettlementReconciliationMockExecutorFixtures,
  type AvanzaSettlementReconciliationMockExecutorFixture,
} from "@/lib/avanza-settlement-reconciliation-mock-executor-fixtures";

type Props = {
  fixtures?: readonly AvanzaSettlementReconciliationMockExecutorFixture[];
};

const summaryBadges = [
  "Avanza settlement reconciliation mock executor",
  "Fixture/model only",
  "Mock only",
  "Simulated Avanza settlement state only",
  "Full post-trade reconciliation path simulated",
  "BUY settlement mock reaches manual review",
  "SELL settlement mock reaches manual review",
  "Transaction matching simulated",
  "Avräkningsnota simulated",
  "Courtage mocked",
  "FX/växelkurs mocked",
  "Settlement amount mocked",
  "Reconciliation preview simulated",
  "Manual review required",
  "No real Avanza navigation",
  "No PDF/download/read",
  "No OCR",
  "No real value extraction",
  "No reconciliation write",
  "No Supabase write",
  "No cookies/session",
  "No BankID automation",
  "No Trade UI wiring",
  "No API route wiring",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "mockExecutorEnabled",
  "mockOnly",
  "canExecuteMockActions",
  "canExecuteRealBrowserActions",
  "canNavigateRealBrowser",
  "canOpenSettlementNoteReal",
  "canReadSettlementDocumentReal",
  "canDownloadPdfReal",
  "canUseOcrReal",
  "canExtractValuesReal",
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
  "valuesAreMaskedOrSynthetic",
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

export function AvanzaSettlementReconciliationMockExecutorHarness({
  fixtures = avanzaSettlementReconciliationMockExecutorFixtures,
}: Props) {
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
                {[
                  ["expectedStatus", fixture.expectedStatus],
                  ["status", report.status],
                  ["reportId", report.reportId],
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
                  ["initialPageStateKind", report.initialPageStateKind],
                  ["finalPageStateKind", report.finalPageStateKind],
                  ["transactionMatched", formatValue(report.transactionMatched)],
                  [
                    "settlementNoteAvailable",
                    formatValue(report.settlementNoteAvailable),
                  ],
                  [
                    "settlementValuesModeled",
                    formatValue(report.settlementValuesModeled),
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
                    mockedExtractedValues:{" "}
                  </span>
                  {formatValue(
                    report.mockedExtractedValues.map(
                      (value) => `${value.label}=${value.safeDisplayValue}`,
                    ),
                  )}
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
                  Mock action reports
                </h4>
                {report.actionReports.map((action) => (
                  <div
                    className="rounded-md border border-white/10 bg-white/[0.025] p-3 text-xs text-zinc-300"
                    key={`${fixture.fixtureId}-${action.actionId}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-100">
                        {action.label}
                      </p>
                      <p className="text-zinc-500">{action.executionStatus}</p>
                    </div>
                    <dl className="mt-2 grid gap-1 sm:grid-cols-2">
                      <div>
                        <dt className="text-zinc-500">actionType</dt>
                        <dd>{action.actionType}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">simulatedValueSource</dt>
                        <dd>{action.simulatedValueSource}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">simulatedTargetText</dt>
                        <dd>{formatValue(action.simulatedTargetText)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">safeDisplayValue</dt>
                        <dd>{formatValue(action.safeDisplayValue)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">
                          containsCredentialMaterial
                        </dt>
                        <dd>{formatValue(action.containsCredentialMaterial)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">realBrowserAction</dt>
                        <dd>{formatValue(action.realBrowserAction)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">documentRead</dt>
                        <dd>{formatValue(action.documentRead)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">ocrUsed</dt>
                        <dd>{formatValue(action.ocrUsed)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">
                          valueExtractedFromRealDocument
                        </dt>
                        <dd>
                          {formatValue(action.valueExtractedFromRealDocument)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">writesInThisTask</dt>
                        <dd>{formatValue(action.writesInThisTask)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">blockedReason</dt>
                        <dd>{formatValue(action.blockedReason)}</dd>
                      </div>
                    </dl>
                    <p className="mt-2 text-zinc-400">{action.expectedResult}</p>
                    <p className="mt-1 text-zinc-500">
                      {action.actualMockResult}
                    </p>
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
