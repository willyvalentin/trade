import {
  avanzaSettlementNoteExtractionSchemaFixtures,
  type AvanzaSettlementNoteExtractionSchemaFixture,
} from "@/lib/avanza-settlement-note-extraction-schema-fixtures";

type Props = {
  fixtures?: readonly AvanzaSettlementNoteExtractionSchemaFixture[];
};

function b(value: boolean) {
  return value ? "true" : "false";
}

function list(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaSettlementNoteExtractionSchemaHarness({
  fixtures = avanzaSettlementNoteExtractionSchemaFixtures,
}: Props) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza settlement note extraction schema",
            "Fixture/model only",
            "Extraction targets only",
            "Courtage target modeled",
            "FX/växelkurs target modeled",
            "Settlement amount target modeled",
            "Trade/settlement dates modeled",
            "No PDF/download/read",
            "No OCR",
            "No value extraction",
            "No reconciliation write",
            "No Supabase write",
            "Manual review required",
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
          Static extraction-target schema only. Exact courtage, FX/växelkurs,
          settlement amount, quantity, price, currency, trade date, and
          settlement date are modeled as future values to review.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const schema = fixture.schema;

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
                    {schema.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {schema.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["schemaId", schema.schemaId],
                  ["status", schema.status],
                  ["label", schema.label],
                  ["side", schema.side],
                  ["ticker", schema.ticker],
                  ["instrumentName", schema.instrumentName],
                  ["currency", schema.currency],
                  ["warnings", list(schema.warnings)],
                  ["blockedReasons", list(schema.blockedReasons)],
                  ["schemaEnabled", b(schema.schemaEnabled)],
                  [
                    "canDefineExtractionTargets",
                    b(schema.canDefineExtractionTargets),
                  ],
                  [
                    "canReadSettlementDocument",
                    b(schema.canReadSettlementDocument),
                  ],
                  ["canDownloadPdf", b(schema.canDownloadPdf)],
                  ["canUseOcr", b(schema.canUseOcr)],
                  ["canExtractValues", b(schema.canExtractValues)],
                  [
                    "canMapToReconciliation",
                    b(schema.canMapToReconciliation),
                  ],
                  [
                    "canWriteTradeReconciliation",
                    b(schema.canWriteTradeReconciliation),
                  ],
                  ["canWriteSupabase", b(schema.canWriteSupabase)],
                  ["canReadCookies", b(schema.canReadCookies)],
                  ["canExportSession", b(schema.canExportSession)],
                  ["canAutomateBankId", b(schema.canAutomateBankId)],
                  ["canBypassBankId", b(schema.canBypassBankId)],
                  [
                    "valuesAreMaskedOrSynthetic",
                    b(schema.valuesAreMaskedOrSynthetic),
                  ],
                  ["userMustConfirm", b(schema.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    b(schema.finalHumanClickRequired),
                  ],
                  ["controlsEnabled", b(schema.controlsEnabled)],
                  ["gateLocked", b(schema.gateLocked)],
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
                {schema.extractionTargets.map((target) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={target.key}
                  >
                    <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {target.key}
                    </p>
                    <p className="mt-1 font-semibold text-zinc-200">
                      {target.label}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`valueKind=${target.valueKind} required=${b(target.required)} valuePresent=${b(target.valuePresent)}`}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`extractedInThisTask=${b(target.extractedInThisTask)} requiresManualReview=${b(target.requiresManualReview)} sensitive=${b(target.sensitive)} forbidden=${b(target.forbidden)}`}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`sourceLabelCandidates=${list(target.sourceLabelCandidates)} safeDisplayValue=${target.safeDisplayValue ?? "none"}`}
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
