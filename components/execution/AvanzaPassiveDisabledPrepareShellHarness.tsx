import {
  AvanzaPassiveDisabledPrepareShell,
} from "@/components/execution/AvanzaPassiveDisabledPrepareShell";
import {
  avanzaPassiveDisabledPrepareShellFixtures,
  type AvanzaPassiveDisabledPrepareShellFixture,
} from "@/lib/avanza-passive-disabled-prepare-shell-fixtures";

type AvanzaPassiveDisabledPrepareShellHarnessProps = {
  fixtures?: readonly AvanzaPassiveDisabledPrepareShellFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

export function AvanzaPassiveDisabledPrepareShellHarness({
  fixtures = avanzaPassiveDisabledPrepareShellFixtures,
}: AvanzaPassiveDisabledPrepareShellHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Passive disabled prepare shell",
            "Fixture only",
            "Explicit input only",
            "No Trade UI wiring",
            "No active prepare button",
            "No active handoff",
            "No API route call",
            "No bridge calls",
            "No localhost fetch",
            "No polling",
            "No Avanza/browser control",
            "No execution",
            "No real fill",
            "No order submission",
            "Never clicks review",
            "Never clicks confirm",
            "Never submits order",
            "User must confirm",
            "Final human click required",
            "Controls disabled",
            "Gate locked",
            "Internal preview",
            "Disabled",
            "No broker action",
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
          Passive disabled prepare shell fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness passes explicit disabled
          internal prepare shell metadata into a passive visual component. It
          does not read Trade UI state, call the API route, fetch localhost,
          call a bridge, control a browser, fill forms, click review, click
          confirm, submit orders, handle credentials, or write execution
          records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const model = fixture.modelResult;

          return (
            <article
              className="grid gap-3 rounded-md border border-white/10 bg-white/[0.02] p-3"
              key={fixture.fixtureId}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.fixtureId}: {fixture.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    {fixture.expectedStatus}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {model.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fixture id", fixture.fixtureId],
                  ["Expected status", fixture.expectedStatus],
                  ["Component status", model.status],
                  ["Source shell status", model.sourceShellStatus ?? "absent"],
                  ["canRenderComponent", formatBoolean(model.canRenderComponent)],
                  ["canClickPrepare", formatBoolean(model.canClickPrepare)],
                  ["canCallApiRoute", formatBoolean(model.canCallApiRoute)],
                  ["canCallBridge", formatBoolean(model.canCallBridge)],
                  ["canFetchLocalhost", formatBoolean(model.canFetchLocalhost)],
                  ["canControlBrowser", formatBoolean(model.canControlBrowser)],
                  ["canSubmitOrder", formatBoolean(model.canSubmitOrder)],
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

              <AvanzaPassiveDisabledPrepareShell
                label={fixture.label}
                modelResult={model}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
