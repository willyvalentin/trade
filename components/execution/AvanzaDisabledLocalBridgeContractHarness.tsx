import {
  avanzaDisabledLocalBridgeContractFixtures,
  type AvanzaDisabledLocalBridgeContractFixture,
} from "@/lib/avanza-disabled-local-bridge-contract-fixtures";

type AvanzaDisabledLocalBridgeContractHarnessProps = {
  fixtures?: readonly AvanzaDisabledLocalBridgeContractFixture[];
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

export function AvanzaDisabledLocalBridgeContractHarness({
  fixtures = avanzaDisabledLocalBridgeContractFixtures,
}: AvanzaDisabledLocalBridgeContractHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Disabled local bridge contract",
            "Fixture only",
            "Explicit input only",
            "No Trade UI wiring",
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
            "Controls disabled by default",
            "Gate locked by default",
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
          Disabled local bridge contract fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness renders explicit disabled
          local bridge contract states for a future fill-only Avanza browser
          agent. It does not read Trade UI state, does not fetch, does not call
          a bridge, does not control a browser, does not fill forms, does not
          click review or confirm, does not submit orders, and does not write
          execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const response = fixture.response;
          const request = response.request;

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
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    {fixture.id}: {fixture.expectedSurface}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {response.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {response.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fixture id", fixture.id],
                  ["Expected status", fixture.expectedStatus],
                  ["Status", response.status],
                  ["Label", response.label],
                  ["Request", request ? "request present" : "request absent"],
                  [
                    "bridgeRequestId",
                    formatOptional(request?.bridgeRequestId),
                  ],
                  ["createdAt", formatOptional(request?.createdAt)],
                  ["broker", formatOptional(request?.broker)],
                  ["action", formatOptional(request?.action)],
                  ["mode", formatOptional(request?.mode)],
                  ["packageId", formatOptional(request?.packageId)],
                  [
                    "adapterRequestId",
                    formatOptional(request?.adapterRequestId),
                  ],
                  ["side", formatOptional(request?.side)],
                  ["ticker", formatOptional(request?.ticker)],
                  ["symbol", formatOptional(request?.symbol)],
                  ["quantity", formatOptional(request?.quantity)],
                  ["orderType", formatOptional(request?.orderType)],
                  ["limitPrice", formatOptional(request?.limitPrice)],
                  ["accountLabel", formatOptional(request?.accountLabel)],
                  [
                    "userMustConfirm",
                    formatBoolean(response.userMustConfirm),
                  ],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(response.finalHumanClickRequired),
                  ],
                  ["bridgeEnabled", formatBoolean(response.bridgeEnabled)],
                  ["canCallBridge", formatBoolean(response.canCallBridge)],
                  [
                    "canFetchLocalhost",
                    formatBoolean(response.canFetchLocalhost),
                  ],
                  [
                    "canControlBrowser",
                    formatBoolean(response.canControlBrowser),
                  ],
                  ["canFillForm", formatBoolean(response.canFillForm)],
                  ["canClickReview", formatBoolean(response.canClickReview)],
                  ["canClickConfirm", formatBoolean(response.canClickConfirm)],
                  ["canSubmitOrder", formatBoolean(response.canSubmitOrder)],
                  [
                    "canHandleCredentials",
                    formatBoolean(response.canHandleCredentials),
                  ],
                  ["canReadCookies", formatBoolean(response.canReadCookies)],
                  ["canReadBankId", formatBoolean(response.canReadBankId)],
                  [
                    "canWriteSupabaseExecution",
                    formatBoolean(response.canWriteSupabaseExecution),
                  ],
                  ["controlsEnabled", formatBoolean(response.controlsEnabled)],
                  ["gateLocked", formatBoolean(response.gateLocked)],
                  ["warnings", formatList(response.warnings)],
                  ["blockedReasons", formatList(response.blockedReasons)],
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
