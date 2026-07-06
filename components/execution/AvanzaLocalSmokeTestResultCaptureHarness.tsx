import type {
  AvanzaLocalSmokeTestResultCaptureFixture,
} from "@/lib/avanza-local-smoke-test-result-capture-fixtures";
import {
  avanzaLocalSmokeTestResultCaptureFixtures,
} from "@/lib/avanza-local-smoke-test-result-capture-fixtures";

type AvanzaLocalSmokeTestResultCaptureHarnessProps = {
  fixtures?: readonly AvanzaLocalSmokeTestResultCaptureFixture[];
};

const summaryBadges = [
  "Avanza local smoke test checklist and result capture",
  "Fixture/model only",
  "Safe result capture only",
  "Login checklist modeled",
  "Order-prep checklist modeled",
  "Settlement checklist modeled",
  "Review-ready outcome captured",
  "Manual review required",
  "No raw credentials",
  "No cookies/session",
  "No account numbers/order ids",
  "No unredacted screenshots",
  "No final KÖP/SÄLJ click",
  "No order submission",
  "No Trade UI wiring",
  "No API route wiring",
  "Not production ready",
] as const;

const safetyFlagKeys = [
  "resultCaptureOnly",
  "canRunSmokeTest",
  "canStoreRawCredentials",
  "canStoreCookies",
  "canStoreSessionTokens",
  "canStoreAccountNumbers",
  "canStoreOrderIds",
  "canStoreScreenshotsUnredacted",
  "canClickFinalBuy",
  "canClickFinalSell",
  "canSubmitOrder",
  "canWireTradeUi",
  "canWireApiRoute",
  "canWriteSupabase",
  "canClaimProductionReady",
  "requiresManualReview",
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

export function AvanzaLocalSmokeTestResultCaptureHarness({
  fixtures = avanzaLocalSmokeTestResultCaptureFixtures,
}: AvanzaLocalSmokeTestResultCaptureHarnessProps) {
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {summaryBadges.map((badge) => (
          <span
            className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100"
            key={badge}
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {fixtures.map((fixture) => {
          const { result } = fixture;

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
                  {result.label}. {result.summary}
                </p>
              </div>

              <dl className="grid gap-2 text-xs text-zinc-300 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-zinc-500">expectedStatus</dt>
                  <dd>{fixture.expectedStatus}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">status</dt>
                  <dd>{result.status}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">area</dt>
                  <dd>{result.area}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">resultId</dt>
                  <dd>{result.resultId}</dd>
                </div>
              </dl>

              <div className="grid gap-2 text-xs text-zinc-300">
                <p>
                  <span className="font-semibold text-zinc-500">
                    safeObservations:{" "}
                  </span>
                  {formatValue(result.safeObservations)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">warnings: </span>
                  {formatValue(result.warnings)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">
                    blockedReasons:{" "}
                  </span>
                  {formatValue(result.blockedReasons)}
                </p>
                <p>
                  <span className="font-semibold text-zinc-500">
                    nextRecommendedAction:{" "}
                  </span>
                  {result.nextRecommendedAction}
                </p>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Checklist
                </h4>
                <ol className="grid gap-2 text-xs text-zinc-300">
                  {result.checklist.map((item) => (
                    <li className="grid gap-1" key={item.itemId}>
                      <span className="font-semibold text-zinc-200">
                        {item.label}
                      </span>
                      <span className="text-zinc-500">
                        {item.itemId} / {item.area} / {item.status}
                      </span>
                      <span>{item.description}</span>
                      <span>evidenceKind: {item.evidenceKind}</span>
                      <span>
                        forbiddenEvidence: {formatValue(item.forbiddenEvidence)}
                      </span>
                      {item.safeEvidenceNote ? (
                        <span>safeEvidenceNote: {item.safeEvidenceNote}</span>
                      ) : null}
                      {item.warning ? <span>warning: {item.warning}</span> : null}
                      {item.blockedReason ? (
                        <span>blockedReason: {item.blockedReason}</span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <h4 className="text-xs font-semibold text-zinc-200">
                  Safety flags
                </h4>
                <dl className="grid gap-1 text-xs text-zinc-300 sm:grid-cols-2">
                  {safetyFlagKeys.map((key) => (
                    <div className="flex justify-between gap-3" key={key}>
                      <dt className="text-zinc-500">{key}</dt>
                      <dd>{formatValue(result.safetyFlags[key])}</dd>
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
