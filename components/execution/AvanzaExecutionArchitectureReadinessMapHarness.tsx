import {
  avanzaExecutionArchitectureReadinessMapFixtures,
  type AvanzaExecutionArchitectureReadinessMapFixture,
} from "@/lib/avanza-execution-architecture-readiness-map-fixtures";

type Props = {
  fixtures?: readonly AvanzaExecutionArchitectureReadinessMapFixture[];
};

const summaryBadges = [
  "Sharp Semi Auto Execution Architecture Readiness Map",
  "Fixture/model only",
  "Login stack summarized",
  "Pre-submit order chain summarized",
  "Settlement reconciliation chain summarized",
  "Safety boundaries summarized",
  "Next recommended actions summarized",
  "Production not ready",
  "No Avanza execution",
  "No real navigation",
  "No form fill",
  "No final KÖP/SÄLJ click",
  "No order submission",
  "No cookies/session",
  "No BankID automation",
  "No credential exposure",
  "No Trade UI execution wiring",
  "No API route wiring",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "mapOnly",
  "canExecuteAvanzaActions",
  "canNavigateAvanza",
  "canFillOrderFields",
  "canClickFinalBuy",
  "canClickFinalSell",
  "canSubmitOrder",
  "canReadCookies",
  "canExportSession",
  "canAutomateBankId",
  "canExposeCredentials",
  "canWriteSupabase",
  "canWireTradeUi",
  "canWireApiRoute",
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

  return String(value);
}

export function AvanzaExecutionArchitectureReadinessMapHarness({
  fixtures = avanzaExecutionArchitectureReadinessMapFixtures,
}: Props) {
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {summaryBadges.map((badge) => (
          <span
            className="rounded-full border border-violet-300/20 bg-violet-300/10 px-2.5 py-1 text-xs font-semibold text-violet-100"
            key={badge}
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {fixtures.map((fixture) => {
          const { map, item, boundary, nextAction } = fixture;

          return (
            <article
              className="grid gap-3 rounded-md border border-white/10 bg-zinc-950/70 p-4"
              data-fixture-id={fixture.fixtureId}
              key={fixture.fixtureId}
            >
              <div>
                <p className="text-xs font-bold uppercase text-zinc-500">
                  {fixture.fixtureId}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                  {fixture.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  {item?.summary ?? boundary?.notes ?? nextAction?.rationale ?? map.summary}
                </p>
              </div>

              <dl className="grid gap-2 text-xs text-zinc-300 sm:grid-cols-2">
                {[
                  ["expectedState", fixture.expectedState],
                  ["mapStatus", map.status],
                  ["productionReadiness", map.productionReadiness],
                  ["area", item?.area ?? nextAction?.area ?? "safety_governance"],
                  ["status", item?.status ?? boundary?.status ?? nextAction?.priority],
                  ["riskLevel", item?.riskLevel ?? "n/a"],
                  [
                    "nextRecommendedAction",
                    item?.nextRecommendedAction ?? nextAction?.title ?? "n/a",
                  ],
                  ["canProceedToLocalDev", formatValue(item?.canProceedToLocalDev)],
                  ["canProceedToTradeUi", formatValue(item?.canProceedToTradeUi)],
                  ["canProceedToApiRoute", formatValue(item?.canProceedToApiRoute)],
                  ["canProceedToProduction", formatValue(item?.canProceedToProduction)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-semibold text-zinc-500">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              {item ? (
                <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-300">
                  <p>
                    <span className="font-semibold text-zinc-500">
                      completedArtifacts:{" "}
                    </span>
                    {formatValue(item.completedArtifacts)}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">
                      missingArtifacts:{" "}
                    </span>
                    {formatValue(item.missingArtifacts)}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">
                      blockers:{" "}
                    </span>
                    {formatValue(item.blockers)}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">
                      warnings:{" "}
                    </span>
                    {formatValue(item.warnings)}
                  </p>
                </div>
              ) : null}

              {boundary ? (
                <div className="grid gap-1 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-300">
                  <p>
                    <span className="font-semibold text-zinc-500">
                      boundary:{" "}
                    </span>
                    {boundary.label}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">
                      required:{" "}
                    </span>
                    {formatValue(boundary.required)}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">
                      enforcedInDocs:{" "}
                    </span>
                    {formatValue(boundary.enforcedInDocs)}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">
                      enforcedInTests:{" "}
                    </span>
                    {formatValue(boundary.enforcedInTests)}
                  </p>
                </div>
              ) : null}

              {nextAction ? (
                <div className="grid gap-1 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-300">
                  <p>
                    <span className="font-semibold text-zinc-500">
                      nextAction:{" "}
                    </span>
                    {nextAction.title}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">
                      shouldDoBeforeRealExecution:{" "}
                    </span>
                    {formatValue(nextAction.shouldDoBeforeRealExecution)}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">
                      shouldDoBeforeTradeUiIntegration:{" "}
                    </span>
                    {formatValue(nextAction.shouldDoBeforeTradeUiIntegration)}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">
                      forbiddenUntilComplete:{" "}
                    </span>
                    {formatValue(nextAction.forbiddenUntilComplete)}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Safety flags
                </h4>
                <dl className="grid gap-1 text-xs text-zinc-300 sm:grid-cols-2">
                  {safetyFlagKeys.map((key) => (
                    <div className="flex justify-between gap-3" key={key}>
                      <dt className="text-zinc-500">{key}</dt>
                      <dd>{formatValue(map.safetyFlags[key])}</dd>
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
