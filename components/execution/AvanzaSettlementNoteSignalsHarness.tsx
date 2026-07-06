import {
  avanzaSettlementNoteSignalFixtures,
  type AvanzaSettlementNoteSignalFixture,
} from "@/lib/avanza-real-world-settlement-note-signals-fixtures";

type AvanzaSettlementNoteSignalsHarnessProps = {
  fixtures?: readonly AvanzaSettlementNoteSignalFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaSettlementNoteSignalsHarness({
  fixtures = avanzaSettlementNoteSignalFixtures,
}: AvanzaSettlementNoteSignalsHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza settlement note / order information signals",
            "Based on sanitized user-provided settlement-flow material",
            "Fixture/model only",
            "Min ekonomi recognized",
            "Transaktioner recognized",
            "Transaction list recognized",
            "Matching BUY/SELL transaction modeled",
            "Transaction detail panel recognized",
            "Avräkningsnota recognized",
            "Courtage / FX / settlement labels recognized",
            "No real Avanza navigation",
            "No PDF/download/read",
            "No OCR",
            "No value extraction",
            "No trade reconciliation write",
            "No cookies/session",
            "No BankID automation",
            "No Trade UI wiring",
            "No API route wiring",
            "Not production ready",
          ].map((copy) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={copy}
            >
              {copy}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-100">
          Sanitized settlement-note signal fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static signal pack results only. The flow models Min ekonomi,
          Transaktioner, transaction rows, transaction details, Avräkningsnota,
          and settlement labels as future reconciliation targets. It does not
          navigate Avanza, download/read PDFs, run OCR, extract values, or write
          trade reconciliation records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const signalPack = fixture.signalPack;

          return (
            <article
              className="rounded-md border border-white/10 bg-white/[0.02] p-3"
              key={fixture.fixtureId}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.fixtureId}: {fixture.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    Settlement-note cue is available as sanitized planning data
                    only. Real navigation, document reading, extraction, and
                    reconciliation writes remain blocked.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {signalPack.step}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedSide", fixture.expectedSide],
                  ["expectedStep", fixture.expectedStep],
                  ["signalPackId", signalPack.signalPackId],
                  ["source", signalPack.source],
                  ["observedUrlKind", signalPack.observedUrlKind],
                  ["side", signalPack.side],
                  ["step", signalPack.step],
                  ["visibleTexts", formatList(signalPack.visibleTexts)],
                  ["buttonTexts", formatList(signalPack.buttonTexts)],
                  ["tabTexts", formatList(signalPack.tabTexts)],
                  ["tableHeaders", formatList(signalPack.tableHeaders)],
                  ["rowTexts", formatList(signalPack.rowTexts)],
                  ["detailPanelTexts", formatList(signalPack.detailPanelTexts)],
                  ["documentTexts", formatList(signalPack.documentTexts)],
                  [
                    "settlementValueLabels",
                    formatList(signalPack.settlementValueLabels),
                  ],
                  ["feeLabels", formatList(signalPack.feeLabels)],
                  ["fxLabels", formatList(signalPack.fxLabels)],
                  [
                    "transactionDateTexts",
                    formatList(signalPack.transactionDateTexts),
                  ],
                  [
                    "settlementDateTexts",
                    formatList(signalPack.settlementDateTexts),
                  ],
                  [
                    "instrumentIdentityTexts",
                    formatList(signalPack.instrumentIdentityTexts),
                  ],
                  ["statusTexts", formatList(signalPack.statusTexts)],
                  ["warningTexts", formatList(signalPack.warningTexts)],
                  [
                    "minEkonomiDetected",
                    formatBoolean(signalPack.minEkonomiDetected),
                  ],
                  [
                    "transactionsDetected",
                    formatBoolean(signalPack.transactionsDetected),
                  ],
                  [
                    "transactionListDetected",
                    formatBoolean(signalPack.transactionListDetected),
                  ],
                  [
                    "matchingTransactionDetected",
                    formatBoolean(signalPack.matchingTransactionDetected),
                  ],
                  [
                    "transactionDetailPanelDetected",
                    formatBoolean(signalPack.transactionDetailPanelDetected),
                  ],
                  [
                    "settlementNoteDetected",
                    formatBoolean(signalPack.settlementNoteDetected),
                  ],
                  [
                    "settlementValuesDetected",
                    formatBoolean(signalPack.settlementValuesDetected),
                  ],
                  ["warnings", formatList(signalPack.warnings)],
                  ["blockedReasons", formatList(signalPack.blockedReasons)],
                  ["sanitized", formatBoolean(signalPack.sanitized)],
                  [
                    "containsCredentials",
                    formatBoolean(signalPack.containsCredentials),
                  ],
                  [
                    "containsPassword",
                    formatBoolean(signalPack.containsPassword),
                  ],
                  [
                    "containsPersonalIdentityNumber",
                    formatBoolean(signalPack.containsPersonalIdentityNumber),
                  ],
                  [
                    "containsAccountNumber",
                    formatBoolean(signalPack.containsAccountNumber),
                  ],
                  ["containsCookie", formatBoolean(signalPack.containsCookie)],
                  [
                    "containsSessionToken",
                    formatBoolean(signalPack.containsSessionToken),
                  ],
                  [
                    "containsBankIdQr",
                    formatBoolean(signalPack.containsBankIdQr),
                  ],
                  ["containsOrderId", formatBoolean(signalPack.containsOrderId)],
                  [
                    "containsSensitiveAmounts",
                    formatBoolean(signalPack.containsSensitiveAmounts),
                  ],
                  [
                    "canUseForSettlementPlanning",
                    formatBoolean(signalPack.canUseForSettlementPlanning),
                  ],
                  [
                    "canUseForSelectorPlanning",
                    formatBoolean(signalPack.canUseForSelectorPlanning),
                  ],
                  [
                    "canNavigateToTransactions",
                    formatBoolean(signalPack.canNavigateToTransactions),
                  ],
                  [
                    "canSelectTransaction",
                    formatBoolean(signalPack.canSelectTransaction),
                  ],
                  [
                    "canOpenSettlementNote",
                    formatBoolean(signalPack.canOpenSettlementNote),
                  ],
                  [
                    "canReadSettlementDocument",
                    formatBoolean(signalPack.canReadSettlementDocument),
                  ],
                  [
                    "canExtractSettlementValues",
                    formatBoolean(signalPack.canExtractSettlementValues),
                  ],
                  [
                    "canWriteTradeReconciliation",
                    formatBoolean(signalPack.canWriteTradeReconciliation),
                  ],
                  ["canReadCookies", formatBoolean(signalPack.canReadCookies)],
                  ["canExportSession", formatBoolean(signalPack.canExportSession)],
                  [
                    "canAutomateBankId",
                    formatBoolean(signalPack.canAutomateBankId),
                  ],
                  [
                    "canBypassBankId",
                    formatBoolean(signalPack.canBypassBankId),
                  ],
                  [
                    "userMustConfirm",
                    formatBoolean(signalPack.userMustConfirm),
                  ],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(signalPack.finalHumanClickRequired),
                  ],
                ].map(([label, value]) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={label}
                  >
                    <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {label}
                    </dt>
                    <dd className="mt-1 font-semibold text-zinc-200">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
