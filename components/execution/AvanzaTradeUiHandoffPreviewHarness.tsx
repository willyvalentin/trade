import {
  AvanzaTradeUiHandoffPreview,
} from "@/components/execution/AvanzaTradeUiHandoffPreview";
import {
  avanzaTradeUiHandoffPreviewFixtures,
  type AvanzaTradeUiHandoffPreviewFixture,
} from "@/lib/avanza-trade-ui-handoff-preview-fixtures";

type AvanzaTradeUiHandoffPreviewHarnessProps = {
  fixtures?: readonly AvanzaTradeUiHandoffPreviewFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatPackagePresence(hasPackage: boolean) {
  return hasPackage ? "package present" : "package absent";
}

export function AvanzaTradeUiHandoffPreviewHarness({
  fixtures = avanzaTradeUiHandoffPreviewFixtures,
}: AvanzaTradeUiHandoffPreviewHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Trade UI handoff preview",
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
          Trade UI handoff preview fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness passes explicit handoff
          preview models into a read-only component. It does not read Trade UI
          state, does not call the handoff package builder from runtime UI, does
          not fetch, does not call a bridge, does not control a browser, does
          not submit orders, and does not write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const model = fixture.modelResult;

          return (
            <article
              className="grid gap-3 rounded-md border border-white/10 bg-white/[0.02] p-3"
              key={fixture.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.id}: {fixture.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    {fixture.expectedRenderMode}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {fixture.expectedStatus}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fixture id", fixture.id],
                  ["Fixture label", fixture.label],
                  ["Model status", model.status],
                  ["Expected status", fixture.expectedStatus],
                  ["Expected render mode", fixture.expectedRenderMode],
                  ["Package", formatPackagePresence(Boolean(model.package))],
                  ["canPrepareFill", formatBoolean(model.canPrepareFill)],
                  ["canProceedToHandoff", formatBoolean(model.canProceedToHandoff)],
                  ["canCallBridge", formatBoolean(model.canCallBridge)],
                  ["canFetchLocalhost", formatBoolean(model.canFetchLocalhost)],
                  ["canPoll", formatBoolean(model.canPoll)],
                  ["canExecute", formatBoolean(model.canExecute)],
                  ["controlsEnabled", formatBoolean(model.controlsEnabled)],
                  ["gateLocked", formatBoolean(model.gateLocked)],
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

              <AvanzaTradeUiHandoffPreview
                label={fixture.label}
                modelResult={model}
                title="Trade UI handoff preview"
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
