import {
  avanzaExplicitInternalDisabledActionShellFixtures,
  type AvanzaExplicitInternalDisabledActionShellFixture,
} from "@/lib/avanza-explicit-internal-disabled-action-shell-fixtures";
import {
  AvanzaPassiveDisabledActionShell,
} from "./AvanzaPassiveDisabledActionShell";

type AvanzaExplicitInternalDisabledActionShellHarnessProps = {
  fixtures?: readonly AvanzaExplicitInternalDisabledActionShellFixture[];
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

export function AvanzaExplicitInternalDisabledActionShellHarness({
  fixtures = avanzaExplicitInternalDisabledActionShellFixtures,
}: AvanzaExplicitInternalDisabledActionShellHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Explicit internal disabled action shell",
            "Fixture only",
            "Explicit input only",
            "Internal/dev-only",
            "Disabled by default",
            "Passive component",
            "No Trade UI wiring",
            "No active prepare button",
            "No active handoff",
            "No API route call",
            "No fetch",
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
            "No broker action",
            "Not production ready",
            "Manual confirmation required in Avanza",
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
          Explicit internal disabled action shell fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness renders explicit
          internal/dev-only disabled action shell model output and does not read
          Trade UI state, call an API route, fetch localhost, call a bridge,
          poll, control a browser, fill forms, click review, click confirm,
          submit orders, handle credentials, or write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const result = fixture.modelResult;

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
                    {result.reason}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {result.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fixture id", fixture.fixtureId],
                  ["Expected status", fixture.expectedStatus],
                  ["Status", result.status],
                  ["Label", result.label],
                  ["Mode", result.mode],
                  ["Reason", result.reason],
                  ["actionShellId", formatOptional(result.actionShellId)],
                  ["createdAt", formatOptional(result.createdAt)],
                  ["apiCallIntentId", formatOptional(result.apiCallIntentId)],
                  ["visibleShellId", formatOptional(result.visibleShellId)],
                  [
                    "sourceRecommendationId",
                    formatOptional(result.sourceRecommendationId),
                  ],
                  ["packageId", formatOptional(result.packageId)],
                  ["side", formatOptional(result.side)],
                  ["ticker", formatOptional(result.ticker)],
                  ["symbol", formatOptional(result.symbol)],
                  ["quantity", formatOptional(result.quantity)],
                  ["orderType", formatOptional(result.orderType)],
                  ["limitPrice", formatOptional(result.limitPrice)],
                  ["accountLabel", formatOptional(result.accountLabel)],
                  ["copy", formatList(result.copy)],
                  ["warnings", formatList(result.warnings)],
                  ["blockedReasons", formatList(result.blockedReasons)],
                  ["userMustConfirm", formatBoolean(result.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(result.finalHumanClickRequired),
                  ],
                  [
                    "actionShellEnabled",
                    formatBoolean(result.actionShellEnabled),
                  ],
                  [
                    "canRenderActionShell",
                    formatBoolean(result.canRenderActionShell),
                  ],
                  ["canClickAction", formatBoolean(result.canClickAction)],
                  ["canCallApiRoute", formatBoolean(result.canCallApiRoute)],
                  ["canFetch", formatBoolean(result.canFetch)],
                  [
                    "canFetchLocalhost",
                    formatBoolean(result.canFetchLocalhost),
                  ],
                  ["canCallBridge", formatBoolean(result.canCallBridge)],
                  ["canControlBrowser", formatBoolean(result.canControlBrowser)],
                  ["canFillForm", formatBoolean(result.canFillForm)],
                  ["canClickReview", formatBoolean(result.canClickReview)],
                  ["canClickConfirm", formatBoolean(result.canClickConfirm)],
                  ["canSubmitOrder", formatBoolean(result.canSubmitOrder)],
                  [
                    "canHandleCredentials",
                    formatBoolean(result.canHandleCredentials),
                  ],
                  ["canReadCookies", formatBoolean(result.canReadCookies)],
                  ["canReadBankId", formatBoolean(result.canReadBankId)],
                  [
                    "canWriteSupabaseExecution",
                    formatBoolean(result.canWriteSupabaseExecution),
                  ],
                  ["controlsEnabled", formatBoolean(result.controlsEnabled)],
                  ["gateLocked", formatBoolean(result.gateLocked)],
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

              <div className="mt-3">
                <AvanzaPassiveDisabledActionShell
                  label={`${fixture.fixtureId}: passive component`}
                  modelResult={result}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
