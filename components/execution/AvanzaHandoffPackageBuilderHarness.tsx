import {
  avanzaHandoffPackageBuilderFixtures,
  type AvanzaHandoffPackageBuilderFixture,
} from "@/lib/avanza-handoff-package-builder-fixtures";

type AvanzaHandoffPackageBuilderHarnessProps = {
  fixtures?: readonly AvanzaHandoffPackageBuilderFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatOptional(value: string | number | undefined) {
  return value === undefined ? "absent" : String(value);
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

function formatPackagePresence(
  status: AvanzaHandoffPackageBuilderFixture["result"]["status"],
  hasPackage: boolean,
) {
  return `${status}: ${hasPackage ? "package present" : "package absent"}`;
}

export function AvanzaHandoffPackageBuilderHarness({
  fixtures = avanzaHandoffPackageBuilderFixtures,
}: AvanzaHandoffPackageBuilderHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza handoff package builder",
            "Fixture only",
            "Explicit input only",
            "No Trade UI wiring",
            "No bridge calls",
            "No localhost fetch",
            "No polling",
            "No Avanza/browser control",
            "No execution",
            "No order submission",
            "Controls disabled",
            "Gate locked",
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
          Avanza handoff package builder fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness does not read Trade UI
          state, does not fetch, does not call a bridge, does not control a
          browser, does not submit orders, and does not write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.result;
          const handoffPackage = result.package;

          return (
            <article
              className="rounded-md border border-white/10 bg-white/[0.02] p-3"
              key={fixture.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {result.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {result.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fixture id", fixture.id],
                  ["Expected status", fixture.expectedStatus],
                  ["Status", result.status],
                  [
                    "Package",
                    formatPackagePresence(result.status, Boolean(handoffPackage)),
                  ],
                  [
                    "canProceedToHandoff",
                    formatBoolean(result.canProceedToHandoff),
                  ],
                  ["canPrepareFill", formatBoolean(result.canPrepareFill)],
                  ["canCallBridge", formatBoolean(result.canCallBridge)],
                  [
                    "canFetchLocalhost",
                    formatBoolean(result.canFetchLocalhost),
                  ],
                  ["canPoll", formatBoolean(result.canPoll)],
                  ["canExecute", formatBoolean(result.canExecute)],
                  ["controlsEnabled", formatBoolean(result.controlsEnabled)],
                  ["gateLocked", formatBoolean(result.gateLocked)],
                  ["warnings", formatList(result.warnings)],
                  ["blockedReasons", formatList(result.blockedReasons)],
                  ["packageId", formatOptional(handoffPackage?.packageId)],
                  ["ticker", formatOptional(handoffPackage?.ticker)],
                  ["symbol", formatOptional(handoffPackage?.symbol)],
                  ["side", formatOptional(handoffPackage?.side)],
                  ["quantity", formatOptional(handoffPackage?.quantity)],
                  ["orderType", formatOptional(handoffPackage?.orderType)],
                  ["limitPrice", formatOptional(handoffPackage?.limitPrice)],
                  ["stopLoss", formatOptional(handoffPackage?.stopLoss)],
                  ["target", formatOptional(handoffPackage?.target)],
                  ["timeInForce", formatOptional(handoffPackage?.timeInForce)],
                  ["accountLabel", formatOptional(handoffPackage?.accountLabel)],
                  [
                    "sourceRecommendationId",
                    formatOptional(handoffPackage?.sourceRecommendationId),
                  ],
                  ["confidence", formatOptional(handoffPackage?.confidence)],
                  ["riskSummary", formatOptional(handoffPackage?.riskSummary)],
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
