import {
  avanzaSettlementNoteActionContractFixtures,
  type AvanzaSettlementNoteActionContractFixture,
} from "@/lib/avanza-settlement-note-action-contract-fixtures";

type Props = {
  fixtures?: readonly AvanzaSettlementNoteActionContractFixture[];
};

function b(value: boolean) {
  return value ? "true" : "false";
}

function list(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaSettlementNoteActionContractHarness({
  fixtures = avanzaSettlementNoteActionContractFixtures,
}: Props) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza settlement note action contract",
            "Fixture/model only",
            "Contract only",
            "Settlement action plan modeled",
            "Matching transaction action modeled",
            "Avräkningsnota action modeled",
            "Planned actions are not executable yet",
            "No real Avanza navigation",
            "No document read",
            "No OCR",
            "No value extraction",
            "No reconciliation write",
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
        <p className="mt-3 text-xs leading-5 text-zinc-400">
          Static action plans only. Matching a transaction and locating
          Avräkningsnota are modeled, but every action remains non-executable
          and stops before document read.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const contract = fixture.actionContract;

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
                    {contract.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {contract.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["contractId", contract.contractId],
                  ["mode", contract.mode],
                  ["status", contract.status],
                  ["label", contract.label],
                  ["side", contract.side],
                  ["ticker", contract.ticker],
                  ["instrumentName", contract.instrumentName],
                  ["quantity", String(contract.quantity)],
                  ["estimatedTradeDate", contract.estimatedTradeDate],
                  ["expectedSettlementDate", contract.expectedSettlementDate],
                  [
                    "nextExpectedSettlementState",
                    contract.nextExpectedSettlementState,
                  ],
                  ["warnings", list(contract.warnings)],
                  ["blockedReasons", list(contract.blockedReasons)],
                  ["canCreateActionPlan", b(contract.canCreateActionPlan)],
                  ["canExecuteActions", b(contract.canExecuteActions)],
                  ["canClickMinEkonomi", b(contract.canClickMinEkonomi)],
                  [
                    "canClickTransactionsTab",
                    b(contract.canClickTransactionsTab),
                  ],
                  ["canFilterTransactions", b(contract.canFilterTransactions)],
                  [
                    "canLocateMatchingTransaction",
                    b(contract.canLocateMatchingTransaction),
                  ],
                  [
                    "canOpenTransactionDetailPanel",
                    b(contract.canOpenTransactionDetailPanel),
                  ],
                  [
                    "canLocateSettlementNote",
                    b(contract.canLocateSettlementNote),
                  ],
                  ["canOpenSettlementNote", b(contract.canOpenSettlementNote)],
                  [
                    "canReadSettlementDocument",
                    b(contract.canReadSettlementDocument),
                  ],
                  [
                    "canExtractSettlementValues",
                    b(contract.canExtractSettlementValues),
                  ],
                  [
                    "canWriteTradeReconciliation",
                    b(contract.canWriteTradeReconciliation),
                  ],
                  ["canReadCookies", b(contract.canReadCookies)],
                  ["canExportSession", b(contract.canExportSession)],
                  ["canAutomateBankId", b(contract.canAutomateBankId)],
                  ["canBypassBankId", b(contract.canBypassBankId)],
                  ["userMustConfirm", b(contract.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    b(contract.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", b(contract.controlsEnabled)],
                  ["gateLocked", b(contract.gateLocked)],
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

              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                {contract.actions.map((action) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={action.actionId}
                  >
                    <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {action.type}
                    </p>
                    <p className="mt-1 font-semibold text-zinc-200">
                      {action.label}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                      {action.reason}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`targetSignalText=${action.targetSignalText ?? "none"} valueSource=${action.valueSource} safeDisplayValue=${action.safeDisplayValue ?? "none"}`}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`containsCredentialMaterial=${b(action.containsCredentialMaterial)} executableInThisTask=${b(action.executableInThisTask)} dryRunOnly=${b(action.dryRunOnly)} requiresHumanAction=${b(action.requiresHumanAction)} forbidden=${b(action.forbidden)}`}
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
