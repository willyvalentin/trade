import {
  avanzaSettlementReconciliationMappingFixtures,
  type AvanzaSettlementReconciliationMappingFixture,
} from "@/lib/avanza-settlement-reconciliation-mapping-fixtures";

type Props = {
  fixtures?: readonly AvanzaSettlementReconciliationMappingFixture[];
};

function b(value: boolean) {
  return value ? "true" : "false";
}

function list(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaSettlementReconciliationMappingHarness({
  fixtures = avanzaSettlementReconciliationMappingFixtures,
}: Props) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza settlement reconciliation mapping",
            "Fixture/model only",
            "Reconciliation preview only",
            "Courtage mapped",
            "FX mapped",
            "Settlement amount mapped",
            "PnL adjustment modeled",
            "Writes are forbidden",
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
          Static reconciliation preview only. Exact settlement-note costs and FX
          can be mapped to future execution, trade result, statistics, and audit
          metadata targets, but no write is available here.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const preview = fixture.preview;

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
                    {preview.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {preview.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["fixtureId", fixture.fixtureId],
                  ["expectedStatus", fixture.expectedStatus],
                  ["previewId", preview.previewId],
                  ["status", preview.status],
                  ["label", preview.label],
                  ["ticker", preview.ticker ?? "missing"],
                  ["side", preview.side ?? "unknown"],
                  ["pnlImpactMode", preview.pnlImpactMode],
                  ["warnings", list(preview.warnings)],
                  ["blockedReasons", list(preview.blockedReasons)],
                  ["mappingEnabled", b(preview.mappingEnabled)],
                  [
                    "canBuildReconciliationPreview",
                    b(preview.canBuildReconciliationPreview),
                  ],
                  ["canApplyReconciliation", b(preview.canApplyReconciliation)],
                  [
                    "canWriteExecutionRecord",
                    b(preview.canWriteExecutionRecord),
                  ],
                  ["canWriteTradeResult", b(preview.canWriteTradeResult)],
                  ["canWriteStatistics", b(preview.canWriteStatistics)],
                  ["canWriteAuditMetadata", b(preview.canWriteAuditMetadata)],
                  ["canWriteSupabase", b(preview.canWriteSupabase)],
                  [
                    "canReadSettlementDocument",
                    b(preview.canReadSettlementDocument),
                  ],
                  ["canUseOcr", b(preview.canUseOcr)],
                  [
                    "valuesAreMaskedOrSynthetic",
                    b(preview.valuesAreMaskedOrSynthetic),
                  ],
                  ["requiresManualReview", b(preview.requiresManualReview)],
                  ["userMustConfirm", b(preview.userMustConfirm)],
                  ["controlsEnabled", b(preview.controlsEnabled)],
                  ["gateLocked", b(preview.gateLocked)],
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
                {preview.fields.map((field) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={field.key}
                  >
                    <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {field.key}
                    </p>
                    <p className="mt-1 font-semibold text-zinc-200">
                      {field.label}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`sourceValueKey=${field.sourceValueKey} targetPath=${field.targetPath} valueKind=${field.valueKind}`}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`required=${b(field.required)} valuePresent=${b(field.valuePresent)} mappedInThisTask=${b(field.mappedInThisTask)} writesInThisTask=${b(field.writesInThisTask)}`}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {`requiresManualReview=${b(field.requiresManualReview)} safeDisplayValue=${field.safeDisplayValue ?? "none"} warning=${field.warning ?? "none"}`}
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
