import type {
  AvanzaDisabledInvocationAdapterPayloadValidatorFixture,
} from "@/lib/avanza-disabled-invocation-adapter-payload-validator-fixtures";
import {
  avanzaDisabledInvocationAdapterPayloadValidatorFixtures,
} from "@/lib/avanza-disabled-invocation-adapter-payload-validator-fixtures";

type AvanzaDisabledInvocationAdapterPayloadValidatorHarnessProps = {
  fixtures?: readonly AvanzaDisabledInvocationAdapterPayloadValidatorFixture[];
};

const harnessBadges = [
  "Avanza disabled invocation adapter payload validator",
  "Fixture/model only",
  "Design review only",
  "Hidden under the surface",
  "Agent-readable, UI-hidden",
  "Safe payload validation modeled",
  "Sensitive payload forbidden",
  "Runtime capability blocked",
  "Invocation boundary locked",
  "Smoke runner invocation locked",
  "Terminal script invocation locked",
  "Browser automation locked",
  "Credential access locked",
  "Cookies/session forbidden",
  "BankID automation forbidden",
  "Order submission forbidden",
  "Final KÖP/SÄLJ human-only",
  "Supabase writes locked",
  "Trade UI execution locked",
  "API route activation locked",
  "No visible Trade UI changes",
  "No active handoff",
  "No prepare action",
  "No buy/sell CTA",
  "No browser automation now",
  "No API route call",
  "No fetch/polling",
  "No credential access now",
  "No order submission",
  "No final KÖP/SÄLJ click",
  "No Supabase write",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "validatorOnly",
  "designReviewOnly",
  "headlessOnly",
  "visibleInUi",
  "canApproveRuntimeInvocation",
  "canCrossInvocationBoundaryNow",
  "canInvokeSmokeRunnerNow",
  "canRunTerminalScriptNow",
  "canUseBrowserAutomationNow",
  "canStartHandoff",
  "canPrepareOrderNow",
  "canRunSmokeTestFromUi",
  "canCallApiRoute",
  "canFetch",
  "canPoll",
  "canAccessCredentials",
  "canCarryCredentials",
  "canReadCookies",
  "canExportSession",
  "canCarrySessionTokens",
  "canAutomateBankId",
  "canSubmitOrder",
  "canClickFinalBuy",
  "canClickFinalSell",
  "canWriteSupabase",
  "canClaimProductionReady",
  "userMustConfirm",
  "finalHumanClickRequired",
  "controlsEnabled",
  "gateLocked",
] as const;

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "n/a";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "none";
  if (typeof value === "object") return JSON.stringify(value);

  return String(value);
}

export function AvanzaDisabledInvocationAdapterPayloadValidatorHarness({
  fixtures = avanzaDisabledInvocationAdapterPayloadValidatorFixtures,
}: AvanzaDisabledInvocationAdapterPayloadValidatorHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {harnessBadges.map((badge) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={badge}
            >
              {badge}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-100">
          Disabled invocation adapter payload validator fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static validation reports only. Valid payloads are valid for design
          review, not runtime approval, and every runtime capability remains
          false with the invocation boundary locked.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const { report } = fixture;

          return (
            <article
              className="grid gap-3 rounded-md border border-white/10 bg-white/[0.02] p-3"
              data-fixture-id={fixture.fixtureId}
              key={fixture.fixtureId}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.fixtureId}: {fixture.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    Expected state: {fixture.expectedStatus}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {report.status}
                </span>
              </div>

              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["status", report.status],
                  ["label", report.label],
                  ["reason", report.reason],
                  ["adapterContractId", report.adapterContractId],
                  ["target", report.target],
                  ["requestId", report.requestId],
                  ["allowedPayloadSummary", report.allowedPayloadSummary],
                  [
                    "forbiddenPayloadDetected",
                    report.forbiddenPayloadDetected,
                  ],
                  ["missingRequiredFields", report.missingRequiredFields],
                  [
                    "unsafeCapabilitiesDetected",
                    report.unsafeCapabilitiesDetected,
                  ],
                  ["invocationBoundaryStatus", report.invocationBoundaryStatus],
                  ["warnings", report.warnings],
                  ["blockedReasons", report.blockedReasons],
                ].map(([label, value]) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={String(label)}
                  >
                    <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words font-semibold text-zinc-200">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Field validations
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {report.fieldValidations.map((field) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2 text-xs"
                      key={`${fixture.fixtureId}-${field.fieldId}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-200">
                          {field.fieldId}: {field.label}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 font-semibold text-zinc-300">
                          {field.status}
                        </span>
                      </div>
                      <p className="mt-2 text-zinc-400">{field.reason}</p>
                      <p className="mt-1 text-zinc-500">
                        required: {formatValue(field.required)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        valuePresent: {formatValue(field.valuePresent)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        redactionRequired:{" "}
                        {formatValue(field.redactionRequired)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        redacted: {formatValue(field.redacted)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        forbidden: {formatValue(field.forbidden)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Safety flags
                </h4>
                <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  {safetyFlagKeys.map((key) => (
                    <div
                      className="rounded-md border border-white/10 bg-black/20 p-2"
                      key={`${fixture.fixtureId}-${key}`}
                    >
                      <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                        {key}
                      </dt>
                      <dd className="mt-1 font-semibold text-zinc-200">
                        {formatValue(report.safetyFlags[key])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
