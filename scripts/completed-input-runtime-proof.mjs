// CLOSED proof: packaged scheduler -> real route -> real PostgREST/Postgres ->
// production receipt parser/readback. Auth/calendar inputs are synthetic; no
// external market provider, production database or broker may be contacted.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { AsyncLocalStorage } from "node:async_hooks";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, buildSync } from "esbuild";
import { setTimeout as syntheticDelay } from "node:timers/promises";

const root = process.cwd();
const cold = process.argv.includes("--cold");
const existingPremarketSetup = process.argv.includes("--existing-premarket-setup");
const expandedPremarketSetup = process.argv.includes("--existing-premarket-budget8");
const rotationDay = process.argv.includes("--rotation-day");
const prospectiveEnrollment = process.argv.includes("--prospective-enrollment");
const lateOriginalOutcomes = process.argv.includes("--late-original-outcomes");
const fullOriginalHistorySetup = process.argv.includes("--full-original-history-setup");
const budgetedHistorySetup = process.argv.includes("--budgeted-history-setup");
const historyPreparationApp = process.argv.includes("--history-preparation-app");
const cappedHistoryPreparation = process.argv.includes("--capped-history-preparation");
let historyReadFault = null, historyReadFaultApplied = false, historyReadFirstRow = null;
let historyReadAbortController = null;
const historyReadControls = [];
assert(!cappedHistoryPreparation || budgetedHistorySetup && !historyPreparationApp &&
  !process.argv.some(value=>value.startsWith("--history-preparation-fault=")),
  "Capped history reads retain the same actual budgeted original session and claims");
assert(!historyPreparationApp || budgetedHistorySetup && !process.argv.some(value=>value.startsWith("--history-preparation-fault=")),
  "Installed app integration uses the same full-original budgeted preparation, not a new fixture population");
const originalOutcomeContinuation = process.argv.includes("--original-outcome-continuation");
const originalSourceReadControls = process.argv.includes("--original-source-read-controls");
assert(!originalSourceReadControls || budgetedHistorySetup,
  "Source-read controls retain the actual original budgeted session");
assert(!originalOutcomeContinuation || budgetedHistorySetup,
  "Original outcome continuation follows the actual budgeted full original session, never seeded source rows");
const historyPreparationFault = process.argv.find(value=>value.startsWith("--history-preparation-fault="))?.split("=")[1];
assert(!historyPreparationFault || budgetedHistorySetup && ["rate_limit","provider_identity","cache_write","reservation","finalization","daily_limit","abort","deadline","concurrent","terminal_resume"].includes(historyPreparationFault),
  "Preparation fault uses only its isolated actual acquisition/budget boundary");
assert(!budgetedHistorySetup || fullOriginalHistorySetup,
  "Budgeted history is the actual same original-source composition, not another schedule or ranking arm");
assert(!fullOriginalHistorySetup || cold && rotationDay && prospectiveEnrollment &&
  !existingPremarketSetup && !expandedPremarketSetup && !lateOriginalOutcomes &&
  !process.argv.includes("--legacy-retention-baseline") && !process.argv.some(value=>[
    "--acquisition-baseline", "--minimum-order-baseline", "--first-observation-baseline", "--fair-order-baseline",
    "--regular-session-baseline", "--first-closed-bar-baseline", "--omitted-pair-baseline",
    "--point-in-time-context",
  ].includes(value)), "Full original history is a separately costed original-source feasibility arm, not a live preparation policy");
assert(!expandedPremarketSetup || existingPremarketSetup && rotationDay && prospectiveEnrollment &&
  !lateOriginalOutcomes && !process.argv.includes("--legacy-retention-baseline"),
  "Eight-call preparation is one isolated source-capacity arm, not an outcome or live policy");
assert(!lateOriginalOutcomes || rotationDay && prospectiveEnrollment && existingPremarketSetup &&
  !process.argv.includes("--legacy-retention-baseline"),
  "Late outcome coverage retains the actual original prepared population, not a manufactured source");
assert(!prospectiveEnrollment || rotationDay && process.argv.includes("--cold"),
  "Original-population enrollment consumes the unchanged full-session CLOSED source");
const benchmarkReuse = process.argv.includes("--benchmark-reuse");
assert(!existingPremarketSetup || cold && (benchmarkReuse || rotationDay),
  "Actual pre-market preparation is separately disclosed, never relabelled as cold zero-setup acquisition");
const charterComposition = process.argv.includes("--charter-composition");
const historyOnlySetup = process.argv.includes("--history-only-setup");
const legacyHistorySetup = process.argv.includes("--legacy-history-setup");
const legacyRetentionBaseline = process.argv.includes("--legacy-retention-baseline");
assert(!legacyRetentionBaseline || legacyHistorySetup || existingPremarketSetup,
  "The retained predecessor is only the same actual legacy acquisition baseline");
assert(!legacyHistorySetup || charterComposition && !historyOnlySetup,
  "Legacy retention consumes its actual existing fetch, never another preparation route");
const setupCompositionDiagnostic = process.argv.includes("--setup-composition-diagnostic");
assert(!setupCompositionDiagnostic || charterComposition,
  "Setup diagnosis emits only this synthetic original-source information set");
assert(!historyOnlySetup || charterComposition,
  "History-only setup is its frozen original-source composition, not a cold or live preparation job");
assert(!charterComposition || benchmarkReuse && !cold && !rotationDay &&
  !process.argv.some(value=>["--mixed-history","--benchmark-reuse-invalid","--benchmark-reuse-baseline"].includes(value)),
  "Charter composition retains the existing original prewarmed two-slot source and discloses setup cost");
const mixedHistory = process.argv.includes("--mixed-history");
const invalidMixedHistory = process.argv.includes("--mixed-history-invalid");
const acquisitionBaseline = process.argv.includes("--acquisition-baseline");
const minimumOrderBaseline = process.argv.includes("--minimum-order-baseline");
const firstObservationBaseline = process.argv.includes("--first-observation-baseline");
const firstObservationBaselineRevision = "e54c9cf36baf31d5548e307fc7ff7b2c5c06a5a7";
const fairOrderBaseline = process.argv.includes("--fair-order-baseline");
const fairOrderBaselineRevision = "bdb3da00";
const minimumOrderBaselineRevision = "6726ba67a9aaa276bfa9cfde7b246354bebcf872";
const acquisitionBaselineRevision = "43fa089e2c7410f10834e148179dda1564765e46";
const regularSessionBaseline = process.argv.includes("--regular-session-baseline");
const regularSessionBaselineRevision = "f9640dcb57b22cab1bfb305143382bafffe133cc";
assert(!regularSessionBaseline || rotationDay && !acquisitionBaseline && !minimumOrderBaseline && !firstObservationBaseline && !fairOrderBaseline);
const firstClosedBarBaseline = process.argv.includes("--first-closed-bar-baseline");
const firstClosedBarBaselineRevision = "3007a456af1584d3e0ed7c09f5ae600fa46124ed";
assert(!firstClosedBarBaseline || rotationDay && !regularSessionBaseline && !acquisitionBaseline && !minimumOrderBaseline && !firstObservationBaseline && !fairOrderBaseline);
const omittedPairBaseline = process.argv.includes("--omitted-pair-baseline");
const omittedPairBaselineRevision = "4b41d066953b7b23cf582b43f0c50a9222355e64";
assert(!omittedPairBaseline || rotationDay && !firstClosedBarBaseline && !regularSessionBaseline && !acquisitionBaseline && !minimumOrderBaseline && !firstObservationBaseline && !fairOrderBaseline);
assert(!mixedHistory || benchmarkReuse && !cold);
assert(!acquisitionBaseline || mixedHistory || rotationDay);
assert(!minimumOrderBaseline || (mixedHistory || rotationDay) && !acquisitionBaseline);
assert(!firstObservationBaseline || rotationDay && !acquisitionBaseline && !minimumOrderBaseline);
assert(!fairOrderBaseline || rotationDay && !acquisitionBaseline && !minimumOrderBaseline && !firstObservationBaseline);
assert(!invalidMixedHistory || mixedHistory && !acquisitionBaseline);
const invalidBenchmarkReuse = process.argv.includes("--benchmark-reuse-invalid");
const baselineBenchmarkReuse = process.argv.includes("--benchmark-reuse-baseline");
// Branch ancestor with the exact verified predecessor tree 640df041; unlike
// the original local cherry-pick source, this commit travels with this branch.
const reuseBaselineRevision = "92374a300f986a4241ba41a1a35a83b5335caf2e";
assert(!(invalidBenchmarkReuse && baselineBenchmarkReuse) &&
  (!(invalidBenchmarkReuse || baselineBenchmarkReuse) || benchmarkReuse));
const wrongPolicy = process.argv.includes("--wrong-policy");
const diagnoseOutcomes = process.argv.includes("--diagnose-outcomes");
const nextSessionOutcomes = process.argv.includes("--next-session-outcomes");
const pagedOutcomeReads = process.argv.includes("--paged-outcome-reads");
assert(!pagedOutcomeReads || nextSessionOutcomes, "Paged reads use the same original cross-date population");
assert(!nextSessionOutcomes || diagnoseOutcomes && !cold && !rotationDay && !process.argv.includes("--publication-clock"),
  "Cross-date continuation retains the existing six original hidden sources and four-request first pass");
const relativePlan60m = process.argv.includes("--relative-plan-60m");
assert(!relativePlan60m || diagnoseOutcomes && !process.argv.includes("--opening") && !wrongPolicy,
  "Mature relative-plan outcomes require their own unchanged original-input CLOSED scenario");
const opening = process.argv.includes("--opening");
const closing = process.argv.includes("--closing");
assert(!closing || cold && !opening && !wrongPolicy && !diagnoseOutcomes,
  "Closing analysis is one isolated cold input path, not outcome/forward acceptance");
const publicationClock = process.argv.includes("--publication-clock");
const publishedOriginalLearning = process.argv.includes("--published-original-learning");
const contextLatency = process.argv.includes("--context-latency");
assert(!publishedOriginalLearning || publicationClock && cold && !closing && !contextLatency,
  "Published learning retains the existing isolated normal publication population");
const pointInTimeContext = process.argv.includes("--point-in-time-context");
assert(!pointInTimeContext || cold && !wrongPolicy,
  "Point-in-time context proof requires the actual bounded cold input path");
const contextBudgetTimeout = process.argv.includes("--context-budget-timeout");
const staleBenchmark = process.argv.includes("--benchmark-stale");
const partialBenchmark = process.argv.includes("--benchmark-partial");
assert(!(staleBenchmark && partialBenchmark) && (!(staleBenchmark || partialBenchmark) ||
  cold && !wrongPolicy && !opening && !closing && !diagnoseOutcomes && !contextLatency),
  "Benchmark fitness is one isolated cold original-input scenario");
const scannerRateLimit = process.argv.includes("--scanner-rate-limit");
const intradayRateLimit = process.argv.includes("--intraday-rate-limit");
const acquisitionRateLimit = scannerRateLimit || intradayRateLimit;
const expectContextTimeout = process.argv.includes("--expect-context-timeout") || contextBudgetTimeout;
assert(!contextLatency || publicationClock && cold,
  "Context latency exercises the isolated normal cold publication path");
assert(!expectContextTimeout || contextLatency);
assert(!acquisitionRateLimit || contextLatency && !expectContextTimeout);
assert(!(scannerRateLimit && intradayRateLimit), "Inject one acquisition failure boundary only");
const benchmarkDelayMs = contextBudgetTimeout || acquisitionRateLimit ? 30000 : 9000;
assert(!publicationClock || cold && !opening && !wrongPolicy && !diagnoseOutcomes,
  "Publication clock proof is one isolated cold normal scanner path");
assert(!opening || cold, "Opening proof has no pre-session warm-history acquisition");
assert(!existingPremarketSetup || !process.argv.some(value=>[
  "--acquisition-baseline", "--minimum-order-baseline", "--first-observation-baseline", "--fair-order-baseline",
  "--regular-session-baseline", "--first-closed-bar-baseline", "--omitted-pair-baseline",
  "--benchmark-reuse-invalid", "--benchmark-reuse-baseline", "--wrong-policy", "--opening", "--closing",
  "--publication-clock", "--point-in-time-context", "--benchmark-stale", "--benchmark-partial",
].includes(value)), "Actual pre-market preparation uses only the unchanged original regular-session comparison");
const slot = rotationDay ? "2026-10-01T13:30:00.000Z" : closing ? "2026-10-01T19:45:00.000Z" : opening ? "2026-10-01T13:45:00.000Z" : "2026-10-01T17:30:00.000Z";
const expiry = rotationDay ? "2026-10-01T20:00:00.000Z" : new Date(Date.parse(slot) + 900000).toISOString();
const nextSlot = new Date(Date.parse(expiry) + 900000).toISOString();
const futureBoundary = new Date(Date.parse(slot) + (relativePlan60m || publishedOriginalLearning || nextSessionOutcomes ? 4500000 : 1800000)).toISOString();
const zeroLatestVolume = process.argv.includes("--zero-latest-volume");
const fractionalPrice = process.argv.includes("--fractional-price");
assert(!fractionalPrice || cold && !publicationClock && !rotationDay && !diagnoseOutcomes && !wrongPolicy,
  "Fractional-price fitness uses only the original cold scheduler/provider boundary, never a new cohort or policy");
assert(!zeroLatestVolume || cold && !wrongPolicy, "Zero-volume proof requires the cold valid-input scenario");
const missingLatestVolume = process.argv.includes("--missing-latest-volume");
assert(!missingLatestVolume || cold && !wrongPolicy && !zeroLatestVolume && !diagnoseOutcomes,
  "Missing-volume proof requires its own cold acquisition scenario");
assert(!benchmarkReuse || !wrongPolicy && !opening && !closing && !diagnoseOutcomes &&
  !publicationClock && !contextLatency && !staleBenchmark && !partialBenchmark && !zeroLatestVolume && !missingLatestVolume,
  "Benchmark reuse is a separately frozen cold/warm two-slot acquisition proof");
assert(!rotationDay || cold && !benchmarkReuse && !mixedHistory && !invalidMixedHistory &&
  !wrongPolicy && !opening && !closing && !diagnoseOutcomes && !publicationClock &&
  !contextLatency && !staleBenchmark && !partialBenchmark && !zeroLatestVolume && !missingLatestVolume,
  "Full-day rotation keeps its own zero-setup original population and unchanged flat provider fixture");
const directory = mkdtempSync(join(tmpdir(), "ture-input-runtime-proof-"));
const database = `ture-input-runtime-db-${process.pid}`;
const api = `ture-input-runtime-api-${process.pid}`;
const network = `ture-input-runtime-net-${process.pid}`;
const owner = "00000000-0000-4000-8000-000000000001";
const identity = {
  schema_version: "scheduled_scan_deployment_identity_v1",
  deploy_id: "a".repeat(24), deploy_context: "production",
  commit_ref: "a".repeat(40), site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
};
const OriginalDate = globalThis.Date;
const originalFetch = globalThis.fetch;
let originalSourceReadFault = null;
let originalSourceReadFaultApplied = false;
const originalSignalTimeout = AbortSignal.timeout;
const originalLog = console.log;
const originalEnvironment = { ...process.env };
let externalRequests = 0;
let externalBenchmarkRequests = 0;
const syntheticRequestEvidence = [];
let syntheticPublicationCount = 0;
let clock = 0;
let durationStartedAt = null;
let pendingSyntheticTransports = 0;
let futureOutcomePlans = [];
let benchmarkReuseEvidence = null;
let preparationFaultController = null;
let historyAppServer = null;
let historyAppRequest = null;
let historyAppBoundaryEvidence = null;
let historyOwnerPrincipalFault = false;
const originalAsyncLocalStorage = globalThis.AsyncLocalStorage;
const fixtureNow = () => clock + (durationStartedAt === null ? 0 : Math.round(performance.now() - durationStartedAt));
const logs = [];
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const dockerLogs = (name) => {
  const result = spawnSync("docker", ["logs", name], { encoding: "utf8" });
  return `${result.stdout ?? ""}${result.stderr ?? ""}`.slice(-6000);
};
const sql = (statement) => execFileSync("docker", ["exec", "-i", database, "psql", "-h", "127.0.0.1", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-At"], { input: statement, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();

try {
  const generated = join(directory, ".generated");
  mkdirSync(generated);
  mkdirSync(join(directory, "functions"));
  writeFileSync(join(generated, "scheduled-scan-deployment-identity.json"), JSON.stringify(identity));
  const options = { bundle: true, platform: "node", format: "cjs", conditions: ["react-server"], alias: { "@": root }, logLevel: "silent" };
  if (historyPreparationApp) {
    // Use the installed framework's real request/cookie stores, never stub
    // requireApplicationSession, owner verification, proxy or history operation.
    const rootRequire = createRequire(resolve(root, "package.json"));
    await build({ ...options, plugins: [{ name: "same-installed-next-request-runtime", setup(builder) {
      builder.onResolve({ filter: /^next\// }, args=>({ path: rootRequire.resolve(args.path === "next/navigation"
        ? "next/dist/client/components/navigation.react-server" : args.path), external: true }));
    } }], stdin: { resolveDir: root, contents: `
      export { POST } from './app/api/app/completed-session-history/route';
      export { proxy } from './proxy';
      export { createApplicationSession } from './lib/application-session-core';` },
    outfile: join(generated, "history-app.cjs") });
  }
  // Before/after comparison uses the exact original committed product modules
  // in memory; neither product checkout nor fixtures/cohort are rewritten.
  const baselinePlugin = { name: "frozen-original-benchmark-allocation", setup(builder) {
    builder.onLoad({ filter: /\/lib\/(scanner|recommendation-generator|market-regime|completed-benchmark-reuse|intraday-indicator-refresh-admission)\.ts$/ }, args => ({
      contents: execFileSync("git", ["show", `${omittedPairBaseline ? omittedPairBaselineRevision : firstClosedBarBaseline ? firstClosedBarBaselineRevision : regularSessionBaseline ? regularSessionBaselineRevision : fairOrderBaseline ? fairOrderBaselineRevision : firstObservationBaseline ? firstObservationBaselineRevision : minimumOrderBaseline ? minimumOrderBaselineRevision : acquisitionBaseline ? acquisitionBaselineRevision : reuseBaselineRevision}:${args.path.slice(root.length + 1)}`], {cwd:root,encoding:"utf8"}),
      loader:"ts", resolveDir:join(root,"lib") }));
  } };
  await build({ ...options, ...(baselineBenchmarkReuse || acquisitionBaseline || minimumOrderBaseline || firstObservationBaseline || fairOrderBaseline || regularSessionBaseline || firstClosedBarBaseline || omittedPairBaseline ? {plugins:[baselinePlugin]} : {}),
    entryPoints: [resolve(root, "app/api/automation/run-scan/route.ts")], outfile: join(generated, "scheduled-scan-runtime.cjs") });
  if (diagnoseOutcomes || publishedOriginalLearning || charterComposition || lateOriginalOutcomes || fullOriginalHistorySetup) buildSync({ ...options, entryPoints: [resolve(root, "app/api/recommendations/evaluate-outcomes/route.ts")], outfile: join(generated, "outcome-route.cjs") });
  buildSync({ ...options, entryPoints: [resolve(root, "netlify/functions/scheduled-scan.ts")], outfile: join(directory, "functions/scheduled.cjs") });
  if(nextSessionOutcomes) {
    buildSync({ ...options, entryPoints: [resolve(root, "netlify/functions/scheduled-outcome-evaluation.ts")],
      outfile: join(directory, "functions/scheduled-outcomes.cjs") });
    writeFileSync(join(generated,"scheduled-outcome-evaluation-runtime.cjs"),readFileSync(join(generated,"outcome-route.cjs")));
  }
  await build({ ...options, ...(legacyRetentionBaseline ? {plugins:[{name:"legacy-retention-predecessor",setup(builder) {
    builder.onLoad({filter:/\/lib\/(scanner|market-data)\.ts$/},args=>({
      contents:execFileSync("git",["show",`3c736f99:${args.path.slice(root.length+1)}`],{cwd:root,encoding:"utf8"}),
      loader:"ts",resolveDir:join(root,"lib")}));
  }}]} : expandedPremarketSetup ? {plugins:[{name:"frozen-existing-premarket-capacity-arm",setup(builder) {
    // Only the existing preparation entry in this diagnostic reader receives
    // the six-call scanner cap. The scheduled product bundle is unchanged.
    builder.onLoad({filter:/\/lib\/recommendation-generator\.ts$/},args=>{
      const source=readFileSync(args.path,"utf8");
      const baseline="maxFreshProviderCalls: source === \"scheduled\" ? 2 : 1,";
      assert.equal(source.split(baseline).length,2,"The frozen preparation cap must match exactly once");
      return {contents:source.replace(baseline,"maxFreshProviderCalls: source === \"scheduled\" ? 6 : 1,"),
        loader:"ts",resolveDir:join(root,"lib")};
    });
  }}]} : {}), stdin: {
    resolveDir: root,
    contents: `export { observationSeriesControlFromEnvironment, buildObservationSeriesSlotAdmission } from './lib/observation-series-control';
      export { buildObservationCycleReceipt, buildObservationCycleReadback } from './lib/observation-cycle-receipt';
      export { buildObservationSeriesEvidenceReadback } from './lib/server/observation-series-evidence-builder';
      export { SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT as contract } from './lib/scanner-provider-credit-allocation-live-experiment';
      export { buildScannerProviderCreditAllocationRuntimeAdmission } from './lib/scanner-provider-credit-allocation-runtime-admission';
      export { buildScannerProviderCreditAllocationExecutionPlan } from './lib/scanner-provider-credit-allocation-plan';
      export { scannerUniverseTickers } from './lib/scanner-universe';
      export { scanMarket } from './lib/scanner';
      ${fullOriginalHistorySetup ? "export { readCompletedDailyContext } from './lib/scanner-completed-daily-context';" : ""}
      ${budgetedHistorySetup ? "export { prepareCompletedSessionHistories, COMPLETED_SESSION_HISTORY_PREPARATION_VERSION } from './lib/server/completed-session-history-preparation';" : ""}
      ${fullOriginalHistorySetup ? "export { createRelativePlanProspectiveService } from './lib/server/relative-plan-prospective-service';" : ""}
      ${existingPremarketSetup ? "export { generateRecommendations } from './lib/recommendation-generator';" : ""}
      export { readOwnedCompletedBenchmarkReuse, isValidCompletedBenchmarkReuse } from './lib/completed-benchmark-reuse';
      export { readCompletedMarketRegime } from './lib/market-regime';
      export { buildRealScannerBaseCandidateSelection } from './lib/real-scanner-candidate-generation';
      export { getUsEquityMarketSession } from './lib/us-equity-market-calendar';
      export { getIntradayScanWindow } from './lib/intraday-scan-window';
      export { readRecommendationLearningBaselineSource } from './lib/server/application-data-access';
      export { parseRecommendationLearningBaselineSource } from './lib/recommendation-learning-baseline-source';
      export { buildRecommendationLearningBaselineReadiness } from './lib/recommendation-learning-baseline-readiness';
      export { buildRecommendationLearningBaselineSegmentation } from './lib/recommendation-learning-baseline-segments';
      export { buildRecommendationLearningEvaluationPlans } from './lib/recommendation-learning-evaluation-plan';
      export { recommendationDecisionSourceProvenanceFromSnapshot } from './lib/recommendation-decision-source-provenance';
      export { recommendationResearchLearningSourceProvenance } from './lib/completed-input-learning-provenance';
      export { buildRelativePlanCharterObservations } from './lib/server/relative-plan-charter-observations';
      export { buildRecommendationIntakeQualityProvenance } from './lib/recommendation-intake-quality-provenance';
      ${charterComposition ? `export { createRelativePlanProspectiveService } from './lib/server/relative-plan-prospective-service';
      export { buildRelativePlanProspectivePlan, relativePlanCanonicalBuildIdentity, relativePlanSemanticFingerprint } from './lib/server/relative-plan-prospective-comparison';` : ""}
      ${prospectiveEnrollment ? `export { buildRelativePlanProspectiveEnrollment } from './lib/server/relative-plan-prospective-enrollment';
      export { buildRelativePlanProspectivePlan, relativePlanCanonicalBuildIdentity, RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION } from './lib/server/relative-plan-prospective-comparison';
      export { buildRelativePlanContextShadow } from './lib/scanner-relative-plan-context-shadow';` : ""}
      export { recommendationScanRunFromPersistenceRow } from './lib/recommendation-scan-run';
      export { candidateDecisionRecordFromScanRun } from './lib/candidate-decision-readback';
      export { decisionLineageReceiptFromScanRun } from './lib/decision-lineage-receipt';
      export { selectCompletedInputResearchSamples } from './lib/completed-input-research-selection';
      export { buildScannerProviderCreditAllocationReconciliation } from './lib/scanner-provider-credit-allocation-reconciliation';`,
  }, outfile: join(generated, "reader.cjs") });
  const require = createRequire(import.meta.url);
  const readers = require(join(generated, "reader.cjs"));
  const contract = readers.contract;
  const environment = {
    SITE_ID: identity.site_id, AUTOMATION_SECRET: "closed-fixture-automation-only",
    NEXT_PUBLIC_SUPABASE_URL: "https://closed-fixture.supabase.invalid",
    TURE_APPLICATION_OWNER_USER_ID: owner, TWELVE_DATA_PLAN_MODE: "free",
    TURE_DISABLE_SCHEDULED_FUNCTIONS: "true", TURE_OBSERVATION_SERIES_ENABLED: "true",
    TURE_OBSERVATION_SERIES_DATE: contract.trading_date,
    TURE_OBSERVATION_SERIES_START_SLOT_UTC: slot,
    TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: benchmarkReuse ? nextSlot : expiry,
    TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: rotationDay ? "26" : benchmarkReuse ? "2" : "1",
    TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: rotationDay ? "208" : benchmarkReuse ? "16" : "8",
    TURE_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED: "false",
    TURE_SCANNER_INPUT_POLICY_VERSION: wrongPolicy ? "unknown_input_policy" : "completed_daily_intraday_input_v1",
    TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "false",
    TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "false",
    TURE_NORMAL_SCAN_ONE_SHOT_ENABLED: "false", TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED: "false",
    TURE_INTERNAL_PAPER_WORKER_ENABLED: "false",
    TURE_LEARNING_ACCELERATION_ENABLED: diagnoseOutcomes || closing || rotationDay || charterComposition ? "true" : "false",
    TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "800", TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8",
    TWELVE_DATA_API_KEY: "synthetic-boundary-only",
    OPENAI_API_KEY: "synthetic-boundary-only-no-ai-calls-permitted",
    ...(publicationClock ? { TURE_SCHEDULED_SCAN_SKIP_OPENAI: "true" } : {}),
    ...(historyPreparationApp ? { NODE_ENV: "production", TRADE_APP_PASSWORD: "isolated-history-app-only",
      TURE_APPLICATION_ORIGIN: "https://trade.valentinlabs.com", URL: "https://trade.valentinlabs.com" } : {}),
  };
  // No credentials from the invoking environment may leak into this runtime.
  for (const name of Object.keys(process.env)) {
    if (/SUPABASE|POLYGON|TWELVE_DATA|OPENAI|TURE_|PROVIDER_PLAN|AUTOMATION_SECRET/.test(name)) delete process.env[name];
  }
  Object.assign(process.env, environment);
  const jwtSecret = "local-proof-signing-secret-not-a-production-credential";
  const basis = [Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"), Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")].join(".");
  process.env.SUPABASE_SERVICE_ROLE_KEY = `${basis}.${createHmac("sha256", jwtSecret).update(basis).digest("base64url")}`;
  const control = readers.observationSeriesControlFromEnvironment({ get: (name) => process.env[name] });
  assert.equal(control.status, "ready");
  // An internal Docker Desktop network suppresses published host ports. Use a
  // dedicated bridge without outbound masquerading; the Node fetch boundary
  // additionally refuses every origin except this fixture's local Data API.
  docker("network", "create", "--driver", "bridge", "--opt", "com.docker.network.bridge.enable_ip_masquerade=false", network);
  docker("run", "--pull=missing", "--rm", "-d", "--name", database, "--network", network, "-e", "POSTGRES_PASSWORD=closed-proof-only", "postgres:16-alpine");
  for (let attempt = 0; ; attempt++) {
    try { sql("select 1;"); break; } catch (error) {
      if (attempt >= 60) throw error;
      await new Promise((done) => setTimeout(done, 250));
    }
  }
  const migrations = [
    "20260519000000_create_legacy_baseline_schema_draft.sql",
    "20260528000000_create_recommendation_snapshots.sql",
    "20260528001000_create_recommendation_outcomes.sql",
    ...(diagnoseOutcomes || publishedOriginalLearning || charterComposition || lateOriginalOutcomes || fullOriginalHistorySetup ? ["20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql"] : []),
    "20260528002000_create_recommendation_scan_runs.sql",
    "20260528003000_create_recommendation_batches.sql",
    "20260614000000_create_execution_records.sql",
    "20260724001500_create_transactional_open_position_command.sql",
    "20260811163228_add_fail_closed_application_owner_foundation.sql",
    "20260625000000_create_scheduled_scan_attempts.sql",
    "20260926091134_sv_a2_observation_cycle_receipts.sql",
    "20260915222537_basic_free_discovery_credit_reservations.sql",
    "20260917135646_if2_basic_free_daily_observation_claim.sql",
    ...(nextSessionOutcomes ? ["20260918233411_if4_after_market_outcome_evaluation_receipts.sql"] : []),
    ...(charterComposition || fullOriginalHistorySetup ? ["20261002213547_if4_relative_plan_prospective_comparison.sql",
      "20261002233358_if4_relative_plan_trained_probability_model.sql",
      "20261003015239_if4_relative_plan_charter_result.sql"] : []),
  ];
  // Source schema/owner constraints and real reservation functions, all isolated.
  sql(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create role authenticator login password 'closed-proof-only'; grant anon, service_role to authenticator;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$;
    insert into auth.users values('${owner}'),('00000000-0000-4000-8000-000000000002');
    ${migrations.map(file=>readFileSync(resolve(root,"supabase/migrations",file),"utf8")).join("\n")}
    grant usage on schema public to service_role; grant all on all tables in schema public to service_role;
    insert into market_calendar_cache(cache_date,provider,is_open_day,reason,day_type,market_open_time,market_close_time,raw,updated_at)
      values('2026-10-01','polygon',true,'Synthetic CLOSED calendar','trading_day','09:30','16:00','{}',
        '${rotationDay ? "2026-10-01T13:00:00Z" : "2026-10-01T17:30:00Z"}');
    insert into user_settings(owner_user_id) values('${owner}');`);
  globalThis.Date = class extends OriginalDate {
    constructor(...args) { super(...(args.length ? args : [fixtureNow()])); }
    static now() { return fixtureNow(); }
  };
  docker("run", "--pull=missing", "--rm", "-d", "--name", api, "--network", network, "-p", "127.0.0.1::3000",
    "-e", `PGRST_DB_URI=postgres://authenticator:closed-proof-only@${database}:5432/postgres`,
    ...(cappedHistoryPreparation ? ["-e", "PGRST_DB_MAX_ROWS=10"] : []),
    "-e", "PGRST_DB_ANON_ROLE=anon", "-e", `PGRST_JWT_SECRET=${jwtSecret}`,
    "ghcr.io/postgrest/postgrest@sha256:5922bde07147b82b1c9d8f749e48c1e5b99ebb233f3888bb7ab65f07cf4ac82d");
  const port = docker("port", api, "3000/tcp").split(":").at(-1);
  const apiOrigin = `http://127.0.0.1:${port}`;
  for (let attempt = 0; ; attempt++) {
    try { const response = await originalFetch(apiOrigin); if (!response.ok) throw new Error(`api_not_ready:${await response.text()}`); break; } catch (error) {
      if (attempt >= 60) throw error;
      await new Promise((done) => setTimeout(done, 250));
    }
  }
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    if (url.origin === "https://api.twelvedata.com" && url.pathname === "/time_series") {
      externalRequests++;
      if (["SPY", "QQQ"].includes(url.searchParams.get("symbol"))) externalBenchmarkRequests++;
      if(contextLatency) {
        pendingSyntheticTransports++;
        try { await syntheticDelay(
          ["SPY","QQQ"].includes(url.searchParams.get("symbol")) ? benchmarkDelayMs : 1800,
          undefined, {signal:init?.signal});
        } finally { pendingSyntheticTransports--; }
      }
      if((scannerRateLimit || intradayRateLimit && url.searchParams.get("interval") === "5min") &&
        !["SPY","QQQ"].includes(url.searchParams.get("symbol"))) {
        return Response.json({status:"error",code:429,message:"Synthetic API credits rate limit"},{status:429});
      }
      const interval = url.searchParams.get("interval");
      const benchmark = ["SPY", "QQQ"].includes(url.searchParams.get("symbol"));
      syntheticRequestEvidence.push({ ticker: url.searchParams.get("symbol"), interval,
        requested_at: new OriginalDate(clock).toISOString(),
        start_date: url.searchParams.get("start_date"), end_date: url.searchParams.get("end_date") });
      if(historyPreparationFault==="rate_limit") return Response.json({status:"error",code:429,message:"Synthetic CLOSED credit limit"},{status:429});
      if(historyPreparationFault==="abort") preparationFaultController.abort();
      if(historyPreparationFault==="deadline") await syntheticDelay(2000,undefined,{signal:init?.signal});
      if(historyPreparationFault==="concurrent") await syntheticDelay(100,undefined,{signal:init?.signal});
      if (benchmark) assert.equal(url.searchParams.get("adjust"),
        existingPremarketSetup && clock===OriginalDate.parse("2026-10-01T13:00:00Z") ? null : "splits");
      const intraday = interval !== "1day";
      const values = [];
      if (intraday) {
        assert.equal(interval,"5min");
        const providerEnd=lateOriginalOutcomes || fullOriginalHistorySetup || nextSessionOutcomes ? Math.min(clock,OriginalDate.parse("2026-10-01T20:00:00Z")) : clock;
        for (let time=OriginalDate.parse("2026-10-01T13:30:00Z"); time<providerEnd; time+=300000) {
          const datetime=new Intl.DateTimeFormat("sv-SE",{timeZone:"America/New_York",
            year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new OriginalDate(time));
          const latestClosed = time + 300000 <= clock && time + 600000 > clock;
          const volume = missingLatestVolume && latestClosed ? " " : zeroLatestVolume && latestClosed ? "0" : "1000";
          const index=(time-OriginalDate.parse("2026-10-01T13:30:00Z"))/300000;
          const close=100+index*0.06;
          const futurePlan=relativePlan60m || publishedOriginalLearning || nextSessionOutcomes || charterComposition || lateOriginalOutcomes || fullOriginalHistorySetup ? futureOutcomePlans.find(plan=>plan.ticker===url.searchParams.get("symbol")) : null;
          const anchor=futurePlan ? Math.ceil(OriginalDate.parse(futurePlan.payload_json.decision_timestamp)/300000)*300000 : null;
          if(futurePlan && time>=anchor) {
            // Explicitly synthetic future bars, supplied only at the provider
            // boundary after the unchanged original plans have been persisted.
            // One entry-only candle precedes each favorable/unfavorable terminal.
            const entry=Number(futurePlan.entry), stop=Number(futurePlan.stop), target=Number(futurePlan.target);
            const risk=entry-stop, terminal=time>=anchor+300000;
            assert(risk>0 && target>entry);
            values.unshift({datetime,open:String(entry),volume:"1000",
              high:String(terminal && futurePlan.synthetic_win ? target+risk*0.1 : entry+risk*0.1),
              low:String(terminal && !futurePlan.synthetic_win ? stop-risk*0.1 : entry-risk*0.1),
              close:String(terminal ? futurePlan.synthetic_win ? target : stop : entry)});
          } else values.unshift(fractionalPrice
            ? {datetime,open:"100.0041",high:"100.0042",low:"100.0040",close:"100.0041",volume}
            : publicationClock
            ? {datetime,open:String(close-0.05),high:String(close+0.1),low:String(close-0.1),close:String(close),volume:String(1000+index*40)}
            : {datetime,open:"100",high:"101",low:"99",close:"100",volume});
        }
      } else {
        const day=new OriginalDate(staleBenchmark && benchmark ? "2026-05-26T00:00:00Z" : "2026-09-30T00:00:00Z");
        while(values.length<60) {
          const date=day.toISOString().slice(0,10);
          if(readers.getUsEquityMarketSession(date).session_close) values.unshift({datetime:date,open:"100",high:"103",low:"99",close:"101",volume:"1000"});
          day.setUTCDate(day.getUTCDate()-1);
        }
        if (partialBenchmark && benchmark) {
          values.shift();
          values.push({datetime:"2026-10-01",open:"100",high:"1001",low:"99",close:"1000",volume:"1000"});
        }
      }
      return Response.json({meta:{symbol:historyPreparationFault==="provider_identity" ||
        historyPreparationFault==="terminal_resume" && externalRequests===1 ? "WRONG":url.searchParams.get("symbol"),interval,exchange_timezone:"America/New_York"},values});
    }
    if (url.origin !== environment.NEXT_PUBLIC_SUPABASE_URL) throw new Error(`Unexpected external boundary: ${url.hostname}`);
    if (url.pathname === `/auth/v1/admin/users/${owner}`) return Response.json({ user: {
      id: historyOwnerPrincipalFault ? "00000000-0000-4000-8000-000000000002" : owner,
      aud: "authenticated", role: "authenticated" } });
    if (!url.pathname.startsWith("/rest/v1/")) throw new Error("Unexpected fixture API path");
    const request=new Request(input,init);
    let requestBody=!["GET","HEAD"].includes(request.method)?await request.text():null;
    const isPublication=publicationClock && url.pathname==="/rest/v1/recommendations" && request.method==="POST";
    if(isPublication) {
      // Only the isolated database boundary models persistence's later clock.
      // Scanner, gates, generator, SDK, actual insert and readback are real.
      clock+=200;
      const payload=JSON.parse(requestBody);
      requestBody=JSON.stringify(payload.map(row=>({...row,created_at:new Date().toISOString()})));
      // supabase-js's explicit insert column list otherwise omits the added
      // fixture database-clock value and invokes the real wall-clock default.
      const columns=url.searchParams.get("columns");
      if(columns) url.searchParams.set("columns",columns+',"created_at"');
    }
    const response=await originalFetch(`${apiOrigin}${url.pathname.slice("/rest/v1".length)}${url.search}`, {
      method:request.method,headers:request.headers,
      ...(requestBody!==null?{body:requestBody}:{})
    });
    if(historyReadFault && url.pathname==="/rest/v1/scanner_cache" && ["GET","HEAD"].includes(request.method)) {
      const laterPage=(url.searchParams.get("ticker")??"").startsWith("gt.") ||
        url.searchParams.getAll("ticker").some(value=>value.startsWith("gt."));
      if(historyReadFault==="second_page_error" && laterPage) {
        historyReadFaultApplied=true;
        return Response.json({message:"synthetic_history_page_failure"},{status:503});
      }
      if(historyReadFault==="final_count_drift" && request.method==="HEAD") {
        historyReadFaultApplied=true;
        const headers=new Headers(response.headers); headers.set("content-range","*/17");
        return new Response(null,{status:response.status,headers});
      }
      if(request.method==="GET") {
        const rows=await response.json(), headers=new Headers(response.headers);
        if(!laterPage) historyReadFirstRow=rows[0];
        const apply=laterPage ? ["remaining_count_drift","empty_tail","duplicate_identity"].includes(historyReadFault)
          : ["missing_count","unselected_identity","initial_count_limit","deadline","abort"].includes(historyReadFault);
        if(apply) {
          historyReadFaultApplied=true;
          if(historyReadFault==="missing_count") headers.delete("content-range");
          if(historyReadFault==="unselected_identity") rows[0].ticker="UNSELECTED";
          if(historyReadFault==="initial_count_limit") headers.set("content-range","0-9/257");
          if(historyReadFault==="remaining_count_drift") headers.set("content-range","0-5/7");
          if(historyReadFault==="empty_tail") rows.length=0;
          if(historyReadFault==="duplicate_identity") rows[0]=historyReadFirstRow;
          if(historyReadFault==="deadline") await syntheticDelay(6000,undefined,{signal:init?.signal});
          if(historyReadFault==="abort") historyReadAbortController.abort();
        }
        return Response.json(rows,{status:response.status,headers});
      }
    }
    if(originalSourceReadFault && url.pathname==="/rest/v1/recommendation_batches" &&
        ["GET","HEAD"].includes(request.method)) {
      const laterPage=url.searchParams.has("id");
      if(originalSourceReadFault==="second_page" && laterPage) {
        originalSourceReadFaultApplied=true;
        return Response.json({message:"synthetic_second_source_page_failure"},{status:503});
      }
      if(originalSourceReadFault==="verification_error" && request.method==="HEAD") {
        originalSourceReadFaultApplied=true;
        return Response.json({message:"synthetic_source_verification_failure"},{status:503});
      }
      if(!originalSourceReadFaultApplied && request.method==="GET" && !laterPage) {
        originalSourceReadFaultApplied=true;
        if(originalSourceReadFault==="deadline") await syntheticDelay(6000,undefined,{signal:init?.signal});
        if(originalSourceReadFault==="source_population_changed") {
          sql(`insert into recommendation_batches(id,batch_fingerprint,trading_date,owner_user_id,batch_type)
            values('ture_source_read_control_drift','ture_source_read_control_drift','2026-10-01','${owner}','diagnostic');`);
        } else if(["missing_count","truncated_page","wrong_owner"].includes(originalSourceReadFault)) {
          const rows=await response.json(), headers=new Headers(response.headers);
          if(originalSourceReadFault==="missing_count") headers.delete("content-range");
          if(originalSourceReadFault==="truncated_page") rows.pop();
          if(originalSourceReadFault==="wrong_owner") rows[0].owner_user_id="00000000-0000-4000-8000-000000000002";
          return Response.json(rows,{status:response.status,headers});
        }
      }
    }
    if(isPublication) clock+=236;
    return response;
  };
  console.log = (...items) => logs.push(items);
  globalThis.Netlify = { env: { get: (name) => process.env[name] } };
  // Warm history is acquired by the actual scanner/SDK, not seeded JSON.
  // Its sixteen (two-slot proof: thirty-two) synthetic requests are separate
  // setup, never hidden in scan cost or treated as free historical coverage.
  clock=OriginalDate.parse("2026-10-01T17:00:00Z");
  let setupRequests=0;
  let setupIntradayRequests=0;
  let existingPremarketEvidence=null;
  let fullOriginalHistoryEvidence=null;
  if (historyPreparationApp) {
    globalThis.AsyncLocalStorage = AsyncLocalStorage;
    const rootRequire = createRequire(resolve(root, "package.json"));
    const { NextRequest } = rootRequire("next/server");
    const { createRequestStoreForAPI } = rootRequire("next/dist/server/async-storage/request-store");
    const { createWorkStore } = rootRequire("next/dist/server/async-storage/work-store");
    const { workAsyncStorage } = rootRequire("next/dist/server/app-render/work-async-storage.external");
    const { workUnitAsyncStorage } = rootRequire("next/dist/server/app-render/work-unit-async-storage.external");
    const appRuntime = () => {
      delete require.cache[require.resolve(join(generated,"history-app.cjs"))];
      return require(join(generated,"history-app.cjs"));
    };
    const dispatch = async (request, useProxy = true) => {
      const app = appRuntime();
      if (useProxy) {
        const boundary = await app.proxy(request);
        if (boundary.headers.get("x-middleware-next") !== "1") return boundary;
      }
      const store = createRequestStoreForAPI(request, { pathname: request.nextUrl.pathname, search: request.nextUrl.search },
        { tags: [], expirationsByCacheKind: new Map() }, undefined, undefined, undefined);
      const work = createWorkStore({ page: "/api/app/completed-session-history/route", buildId: "isolated-closed",
        deploymentId: "isolated-closed", previouslyRevalidatedTags: [], renderOpts: { supportsDynamicResponse: true,
          cacheLifeProfiles: {}, cacheComponents: false, experimental: {}, staticPageGenerationTimeout: 60 } });
      return workAsyncStorage.run(work, () => workUnitAsyncStorage.run(store, () => app.POST(request)));
    };
    historyAppServer = createServer(async (incoming, outgoing) => {
      try {
        const chunks = []; for await (const chunk of incoming) chunks.push(chunk);
        const request = new NextRequest(`${environment.TURE_APPLICATION_ORIGIN}${incoming.url}`, { method: incoming.method,
          headers: incoming.headers, body: Buffer.concat(chunks) });
        const response = await dispatch(request);
        outgoing.writeHead(response.status, Object.fromEntries(response.headers));
        outgoing.end(Buffer.from(await response.arrayBuffer()));
      } catch (error) { outgoing.writeHead(500); outgoing.end(String(error)); }
    });
    await new Promise(done => historyAppServer.listen(0, "127.0.0.1", done));
    const endpoint = `http://127.0.0.1:${historyAppServer.address().port}/api/app/completed-session-history`;
    clock = OriginalDate.parse("2026-10-01T12:45:00.000Z");
    const token = await appRuntime().createApplicationSession();
    assert(token);
    const validHeaders = { cookie: `trade_auth=${token}`, origin: environment.TURE_APPLICATION_ORIGIN,
      "content-type": "application/json" };
    const send = async ({ headers = validHeaders, body = "{}", query = "" } = {}) => {
      const response = await originalFetch(endpoint + query, { method: "POST", headers, body });
      assert.equal(response.headers.get("cache-control"), "no-store");
      return { status: response.status, result: await response.json() };
    };
    assert.equal((await send({ headers: { "content-type": "application/json", origin: validHeaders.origin } })).status, 401);
    assert.equal((await send({ headers: { ...validHeaders, cookie: "trade_auth=invalid" } })).status, 401);
    assert.equal((await send({ headers: { ...validHeaders, origin: "https://foreign.invalid" } })).status, 403);
    assert.equal((await send({ headers: { cookie: validHeaders.cookie, "content-type": "application/json" } })).status, 403);
    historyOwnerPrincipalFault = true;
    assert.equal((await send()).status, 401);
    historyOwnerPrincipalFault = false;
    process.env.TURE_APPLICATION_OWNER_USER_ID = "00000000-0000-4000-8000-000000000002";
    assert.equal((await send()).status, 401);
    process.env.TURE_APPLICATION_OWNER_USER_ID = owner;
    const initialClock = clock;
    clock += 8 * 3600000;
    assert.equal((await send()).status, 401, "Expired operator sessions cannot acquire history");
    clock = initialClock;
    for (const body of ["", "null", "[]", '"{}"', "{broken}", '{"tickers":["WINNER"]}',
      '{"owner_user_id":"other"}', '{"date":"2026-10-02"}', '{"daily_budget":800}', " ".repeat(257) + "{}"])
      assert.equal((await send({ body })).status, 400);
    assert.equal((await send({ query: "?tickers=WINNER" })).status, 400);
    assert.equal((await send({ headers: { ...validHeaders, "content-type": "text/plain" } })).status, 400);
    assert.equal((await send({ body: new Uint8Array([123, 125, 255]) })).status, 400);
    for (const headers of [{ "content-type": "application/json", origin: validHeaders.origin },
      { ...validHeaders, origin: "https://foreign.invalid" }]) {
      const response = await dispatch(new NextRequest(`${environment.TURE_APPLICATION_ORIGIN}/api/app/completed-session-history`,
        { method: "POST", headers, body: "{}" }), false);
      assert.equal(response.status, headers.cookie ? 403 : 401, "The route is protected even without the proxy");
    }
    const cancelled = new AbortController(); cancelled.abort();
    const stopped = await dispatch(new NextRequest(`${environment.TURE_APPLICATION_ORIGIN}/api/app/completed-session-history`,
      { method: "POST", headers: validHeaders, body: "{}", signal: cancelled.signal }));
    assert.equal(stopped.status, 422);
    assert.equal((await stopped.json()).blocker, "history_preparation_aborted");
    assert.equal(externalRequests, 0);
    assert.equal(Number(sql("select count(*) from basic_free_discovery_credit_reservations;")), 0);
    assert.equal(Number(sql("select count(*) from scanner_cache;")), 0);
    historyAppRequest = async () => {
      const response = await send({ headers: { ...validHeaders,
        cookie: `trade_auth=${await appRuntime().createApplicationSession()}` } });
      assert.equal(response.status, response.result.status === "blocked" ? 422 : 200);
      return response.result;
    };
    historyAppBoundaryEvidence = { path: "/api/app/completed-session-history", transport: "actual_loopback_http",
      framework_request_cookie_stores: "installed_next_runtime", real_proxy_session_and_owner_verification: true,
      negative_requests_zero_provider_and_reservations: true, route_defense_without_proxy: true,
      arbitrary_population_owner_date_budget_and_query_rejected: true, bounded_empty_request_body: true,
      cancelled_request_zero_acquisition: true,
      restarted_route_per_request: true, no_scheduler_hook_added: true, hosted_runtime_verified: false };
  }
  const legacySetupCandidates=[];
  let legacySetupFingerprint=null;
  if(!cold && !wrongPolicy) {
    const selected=readers.buildRealScannerBaseCandidateSelection({scanWindow:readers.getIntradayScanWindow(new Date("2026-10-01T17:30:00Z")),requestedScanBudget:8,
      selectionMode:"scheduled_rotating",now:new OriginalDate("2026-10-01T17:30:00Z")}).candidates;
    assert.equal(selected.length,8);
    const secondSelected=benchmarkReuse ? readers.buildRealScannerBaseCandidateSelection({scanWindow:readers.getIntradayScanWindow(new OriginalDate(expiry)),requestedScanBudget:8,
      selectionMode:"scheduled_rotating",now:new OriginalDate(expiry)}).candidates : [];
    if(benchmarkReuse) assert.equal(secondSelected.length,8);
    const setupPopulation=[...new Map([...(mixedHistory ? selected.slice(4) : selected),
      ...(mixedHistory ? secondSelected.slice(4) : secondSelected)].map(candidate=>[candidate.ticker,candidate])).values()];
    // This invokes the existing real scanner cap, not a seeded cache or new
    // preparation endpoint. One credit acquires validated daily history but
    // cannot also acquire an intraday context that expires before our decisions.
    for(const candidate of setupPopulation) {
      const observed=await readers.scanMarket([candidate],{source:"scheduled",maxFreshProviderCalls:historyOnlySetup||legacyHistorySetup?1:2,
        freshProviderCallPacingMs:0,...(!legacyHistorySetup ? {completedDailyContextPolicyVersion:"completed_daily_intraday_input_v1"} : {})});
      if(legacyHistorySetup) legacySetupCandidates.push(...observed);
    }
    setupRequests=externalRequests;
    setupIntradayRequests=syntheticRequestEvidence.filter(request=>request.interval!=="1day").length;
    assert.equal(setupRequests,setupPopulation.length*(historyOnlySetup||legacyHistorySetup?1:2));
    assert.equal(setupIntradayRequests,historyOnlySetup||legacyHistorySetup?0:setupPopulation.length);
    if(legacyHistorySetup) {
      // UUID/default insertion time are physical rows, not legacy information.
      // Keep every candidate, derived value and original updated-at clock.
      const rows=JSON.parse(sql("select jsonb_agg((to_jsonb(t)-'id'-'created_at') || jsonb_build_object('raw',raw-'completed_daily_context') order by ticker) from scanner_cache t;"));
      legacySetupFingerprint=`sha256:${readers.relativePlanSemanticFingerprint({candidates:legacySetupCandidates,cache:rows})}`;
      process.stderr.write(JSON.stringify({legacy_setup_requests:setupRequests,legacy_original_information:legacySetupFingerprint,
        retained_daily_contexts:Number(sql("select count(*) from scanner_cache where raw ? 'completed_daily_context';")),
        ...(setupCompositionDiagnostic?{legacy_candidates:legacySetupCandidates,legacy_cache:rows}:{})})+"\n");
    }
    if(invalidMixedHistory) sql(`update scanner_cache set raw=jsonb_set(raw,
      '{completed_daily_context,content_sha256}','"invalid-fixture-history-digest"');`);
  }
  if(existingPremarketSetup) {
    clock=OriginalDate.parse("2026-10-01T13:00:00Z");
    const preUniverse=readers.buildRealScannerBaseCandidateSelection({scanWindow:"pre_market",now:new OriginalDate(clock)});
    const prepared=await readers.generateRecommendations({ownerUserId:owner,sessionType:"morning",
      scanWindow:"pre_market",targetCount:0,source:"scheduled",skipOpenAi:true});
    assert.equal(prepared.inserted_count,0);
    assert.deepEqual(prepared.recommendations,[]);
    const retained=JSON.parse(sql("select coalesce(jsonb_agg(raw->'completed_daily_context' order by ticker),'[]') from scanner_cache where raw ? 'completed_daily_context';"));
    const regular=readers.buildRealScannerBaseCandidateSelection({scanWindow:readers.getIntradayScanWindow(new OriginalDate(slot)),
      requestedScanBudget:8,selectionMode:"scheduled_rotating",now:new OriginalDate(slot)});
    setupRequests=externalRequests;
    setupIntradayRequests=syntheticRequestEvidence.filter(request=>request.interval!=="1day").length;
    assert.equal(setupRequests,expandedPremarketSetup?8:4);
    assert.equal(setupIntradayRequests,expandedPremarketSetup?3:1);
    existingPremarketEvidence={scope:"actual_existing_generator_synthetic_provider_sql_sdk_not_live_preparation_policy",
      history_retention:legacyRetentionBaseline?"original_legacy_without_raw_history":"validated_already_paid_legacy_history",
      ...(expandedPremarketSetup?{capacity_arm_version:"existing_premarket_eight_call_closed_capacity_arm_v1",
        preparation_whole_request_cap:8,scanner_request_cap:6,product_policy_changed:false}:{}),
      setup_intraday_requests:setupIntradayRequests,
      original_universe:preUniverse.candidates.map(candidate=>candidate.ticker),requests:structuredClone(syntheticRequestEvidence),
      retained_daily_contexts:retained.map(context=>({symbol:context.symbol,captured_at:context.captured_at,
        latest_completed_market_date:context.latest_completed_market_date})),
      first_regular_population:regular.candidates.map(candidate=>candidate.ticker),
      first_regular_prepared_overlap:regular.candidates.filter(candidate=>retained.some(context=>context.symbol===candidate.ticker)).map(candidate=>candidate.ticker),
      returned_watchlist:prepared.pre_market_candidates,publication_count:0};
    originalLog(JSON.stringify({existing_premarket_evidence:existingPremarketEvidence}));
  }
  if(historyPreparationFault==="concurrent") {
    clock=OriginalDate.parse("2026-10-01T12:45:00Z");
    process.env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET="16";
    const overlapping=await Promise.all([readers.prepareCompletedSessionHistories(),readers.prepareCompletedSessionHistories()]);
    assert.equal(overlapping.filter(pass=>pass.status==="partial").length,1);
    assert.equal(overlapping.filter(pass=>pass.blocker==="attempt_in_progress").length,1);
    assert(overlapping.every(pass=>pass.original_members.length===95));
    assert.equal(externalRequests,8);
    assert.equal(new Set(syntheticRequestEvidence.map(row=>row.ticker)).size,8);
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const restarted=require(join(generated,"reader.cjs"));
    const same=await restarted.prepareCompletedSessionHistories();
    assert.equal(same.blocker,"per_minute_credit_limit_reached");
    assert.equal(externalRequests,8);
    clock+=60000;
    const later=await restarted.prepareCompletedSessionHistories();
    assert.equal(later.status,"partial");
    assert.equal(later.original_members.filter(row=>row.status==="available").length,8);
    assert.equal(later.original_members.filter(row=>row.status==="acquired").length,8);
    assert.equal(externalRequests,16);
    assert.equal(new Set(syntheticRequestEvidence.map(row=>row.ticker)).size,16);
    const claims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
    assert.equal(claims.length,16);
    assert(claims.every(row=>row.requested_credits===1&&row.status==="completed"&&row.finalized_at));
    assert.equal(Number(sql("select max(credits) from (select sum(requested_credits) credits from basic_free_discovery_credit_reservations group by minute_bucket) t;")),8);
    fullOriginalHistoryEvidence={original_population_count:95,overlapping,same_minute_restart:same,later_minute_restart:later,
      synthetic_provider_requests:externalRequests,unique_requested_tickers:16,repeated_provider_requests:0,
      reserved_credits:16,finalized_credits:16,maximum_minute_credits:8,physical_claims:claims};
  } else if(historyPreparationFault==="terminal_resume") {
    clock=OriginalDate.parse("2026-10-01T12:45:00Z");
    process.env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET="16";
    const first=await readers.prepareCompletedSessionHistories();
    assert.equal(first.blocker,"history_preparation_attributable_context_unavailable");
    assert.equal(externalRequests,1);
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const restarted=require(join(generated,"reader.cjs"));
    const resumeControls=[];
    const checkResumeBlocked=async(fault)=>{
      const before=externalRequests;
      const claimsBefore=sql("select count(*) from basic_free_discovery_credit_reservations;");
      const pass=await restarted.prepareCompletedSessionHistories();
      assert.equal(pass.status,"blocked",JSON.stringify(pass));
      assert.equal(pass.requested_credits,0);
      assert.equal(externalRequests,before);
      assert.equal(sql("select count(*) from basic_free_discovery_credit_reservations;"),claimsBefore);
      assert.deepEqual(pass.original_members.map(row=>row.ticker),first.original_members.map(row=>row.ticker));
      resumeControls.push({fault,blocker:pass.blocker,provider_requests:0,new_claims:0,original_population_count:95});
    };
    sql("update public.basic_free_discovery_credit_reservations set finalized_at='2026-10-01T12:50:00Z' where status='failed';");
    await checkResumeBlocked("future_finalization_same_minute");
    sql("update public.basic_free_discovery_credit_reservations set finalized_at='2026-10-01T12:45:00Z' where status='failed';");
    const same=await restarted.prepareCompletedSessionHistories();
    clock+=60000;
    sql("revoke select on public.basic_free_discovery_credit_reservations from service_role;");
    await checkResumeBlocked("unavailable_owner_ledger");
    sql("grant select on public.basic_free_discovery_credit_reservations to service_role;");
    sql("update public.basic_free_discovery_credit_reservations set finalized_at='2026-10-01T12:50:00Z' where status='failed';");
    await checkResumeBlocked("future_finalization");
    sql("update public.basic_free_discovery_credit_reservations set finalized_at='2026-10-01T12:45:00Z' where status='failed';");
    sql("update public.basic_free_discovery_credit_reservations set finalized_at='2026-10-01T12:44:00Z' where status='failed';");
    await checkResumeBlocked("pre_claim_finalization");
    sql("update public.basic_free_discovery_credit_reservations set finalized_at='2026-10-01T12:45:00Z' where status='failed';");
    process.env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET="15";
    await checkResumeBlocked("budget_drift");
    process.env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET="16";
    sql("update public.basic_free_discovery_credit_reservations set status='attempted',finalized_at=null where status='failed';");
    await checkResumeBlocked("prior_attempt_in_progress");
    sql("update public.basic_free_discovery_credit_reservations set status='completed',finalized_at='2026-10-01T12:45:00Z' where status='attempted';");
    await checkResumeBlocked("completed_missing_source");
    sql("update public.basic_free_discovery_credit_reservations set status='failed' where status='completed' and execution_fingerprint like '%|' || '"+first.original_members[0].ticker+"';");
    const later=await restarted.prepareCompletedSessionHistories();
    assert.equal(externalRequests,16,"A finalized failed source must not strand the other original histories");
    assert.equal(same.blocker,"per_minute_credit_limit_reached");
    assert.equal(same.requested_credits,7);
    assert.equal(later.status,"partial");
    assert.equal(later.requested_credits,8);
    assert.equal(later.original_members.filter(row=>row.status==="available").length,7);
    assert.equal(later.original_members.filter(row=>row.status==="acquired").length,8);
    const failedTicker=first.original_members[0].ticker;
    for(const pass of [same,later]) {
      assert.equal(pass.original_members[0].status,"blocked");
      assert.equal(pass.original_members[0].claim_id,first.original_members[0].claim_id);
      assert.deepEqual(pass.original_members.map(row=>row.ticker),first.original_members.map(row=>row.ticker));
    }
    assert.equal(syntheticRequestEvidence.filter(row=>row.ticker===failedTicker).length,1);
    const exhausted=await restarted.prepareCompletedSessionHistories();
    assert.equal(exhausted.blocker,"daily_credit_limit_reached");
    assert.equal(exhausted.requested_credits,0);
    assert.equal(externalRequests,16);
    const claims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
    assert.equal(claims.length,16);
    assert.equal(claims.filter(row=>row.status==="failed"&&row.finalized_at).length,1);
    assert.equal(claims.filter(row=>row.status==="completed"&&row.finalized_at).length,15);
    assert.equal(Number(sql("select max(credits) from (select sum(requested_credits) credits from basic_free_discovery_credit_reservations group by minute_bucket) t;")),8);
    fullOriginalHistoryEvidence={fault:historyPreparationFault,first,same_minute_restart:same,later_minute_restart:later,
      exhausted,original_population_count:95,synthetic_provider_requests:16,unique_requested_tickers:16,
      repeated_provider_requests:0,reserved_credits:16,failed_credits:1,finalized_credits:16,
      maximum_minute_credits:8,persisted_histories:15,missing_failed_source_preserved:true,
      physical_claims:claims,resume_controls:resumeControls,publications:0,broker_actions:0};
  } else if(historyPreparationFault) {
    clock=OriginalDate.parse("2026-10-01T12:45:00Z");
    process.env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET="1";
    if(historyPreparationFault==="reservation") sql("revoke execute on function public.claim_basic_free_discovery_credit_reservation(text,text,uuid,date,timestamptz,boolean,smallint,smallint,smallint,text) from service_role;");
    if(historyPreparationFault==="finalization") sql("revoke execute on function public.finalize_basic_free_discovery_credit_reservation_attempt(text,text,text,text,timestamptz) from service_role;");
    if(historyPreparationFault==="cache_write") sql("revoke insert,update on public.scanner_cache from service_role;");
    preparationFaultController=new AbortController();
    if(historyPreparationFault==="deadline") AbortSignal.timeout=(ms)=>originalSignalTimeout(ms===45000?1000:ms);
    const first=await readers.prepareCompletedSessionHistories({signal:preparationFaultController.signal});
    assert.equal(first.status,"blocked",JSON.stringify(first));
    assert.equal(first.original_members.length,95);
    assert.equal(externalRequests,historyPreparationFault==="reservation"?0:1);
    const afterFirst=externalRequests;
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const restarted=require(join(generated,"reader.cjs"));
    const same=await restarted.prepareCompletedSessionHistories();
    clock+=60000;
    const later=await restarted.prepareCompletedSessionHistories();
    assert.equal(same.status,"blocked"); assert.equal(later.status,"blocked");
    assert.equal(externalRequests,afterFirst,"Failure/restart in a later minute may not buy another history or disappear from cost");
    let repair=null;
    if(historyPreparationFault==="finalization") {
      sql("grant execute on function public.finalize_basic_free_discovery_credit_reservation_attempt(text,text,text,text,timestamptz) to service_role;");
      repair=await restarted.prepareCompletedSessionHistories();
      assert.equal(repair.blocker,"daily_credit_limit_reached");
      assert.equal(repair.original_members.filter(row=>row.status==="available").length,1);
      assert.equal(externalRequests,afterFirst,"Repair finalizes the actual persisted source, not a repeated provider request");
    }
    const claims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
    assert.equal(claims.length,historyPreparationFault==="reservation"?0:1);
    assert(claims.every(row=>row.requested_credits===1&&row.status===(historyPreparationFault==="daily_limit"||historyPreparationFault==="finalization"?"completed":"failed")));
    fullOriginalHistoryEvidence={fault:historyPreparationFault,first,same_minute_restart:same,later_minute_restart:later,
      ...(repair?{cached_finalization_repair:repair}:{}),reserved_credits:claims.reduce((sum,row)=>sum+row.requested_credits,0),
      physical_claims:claims,synthetic_provider_requests:externalRequests,repeated_provider_requests:0,
      persisted_histories:Number(sql("select count(*) from scanner_cache where raw ? 'completed_daily_context';")),
      original_population_count:95,publications:0,broker_actions:0};
  } else if(fullOriginalHistorySetup) {
    // Select from the frozen deterministic schedule BEFORE acquiring any data.
    // This is the full original day population, never a future winner/source subset.
    const originalSlots=Array.from({length:26},(_,index)=>{
      const now=new OriginalDate(OriginalDate.parse(slot)+index*900000);
      const candidates=readers.buildRealScannerBaseCandidateSelection({
        scanWindow:readers.getIntradayScanWindow(now),requestedScanBudget:8,
        selectionMode:"scheduled_rotating",now}).candidates;
      assert.equal(candidates.length,8);
      return {slot:now.toISOString(),candidates};
    });
    const originalUniverse=[...new Map(originalSlots.flatMap(row=>row.candidates)
      .map(candidate=>[candidate.ticker,candidate])).values()];
    assert.equal(originalUniverse.length,95);
    clock=OriginalDate.parse("2026-10-01T12:45:00.000Z");
    // The completed-input scanner correctly rejects a pre-open current-session
    // request, even at a one-credit cap. Do not relax that product guard. The
    // existing legacy one-call acquisition now retains the same validated raw
    // history from its already-paid response and needs no current-price claim.
    await assert.rejects(readers.scanMarket([originalUniverse[0]],{source:"scheduled",maxFreshProviderCalls:1,
      freshProviderCallPacingMs:0,completedDailyContextPolicyVersion:"completed_daily_intraday_input_v1"}),
    /completed_context_current_session_unavailable/);
    assert.equal(externalRequests,0);
    const preparationPasses=[];
    if(budgetedHistorySetup) {
      const origin=clock;
      const prepare = () => historyAppRequest ? historyAppRequest() : readers.prepareCompletedSessionHistories();
      assert.equal((await readers.prepareCompletedSessionHistories({tickers:["WINNER"],owner_user_id:owner})).blocker,"history_preparation_request_invalid");
      assert.equal(externalRequests,0,"Caller-selected populations or owner identities are never acquisition authority");
      for(let index=0;index<12;index++) {
        clock=origin+index*60000;
        delete require.cache[require.resolve(join(generated,"reader.cjs"))];
        const resumed=require(join(generated,"reader.cjs"));
        if(cappedHistoryPreparation && index===2) {
          assert.equal(Number(sql("select count(*) from scanner_cache;")),16);
          const claimsBefore=sql("select jsonb_agg(t order by claim_id) from basic_free_discovery_credit_reservations t;");
          const requestsBefore=externalRequests;
          for(const fault of ["second_page_error","missing_count","remaining_count_drift","empty_tail",
            "duplicate_identity","unselected_identity","initial_count_limit","final_count_drift","deadline","abort"]) {
            historyReadFault=fault; historyReadFaultApplied=false;
            historyReadAbortController=new AbortController();
            const blocked=await resumed.prepareCompletedSessionHistories({signal:historyReadAbortController.signal});
            assert(historyReadFaultApplied,fault);
            assert.equal(blocked.blocker,fault==="abort"?"history_preparation_aborted":"history_preparation_cache_unavailable",JSON.stringify({fault,blocked}));
            assert.equal(blocked.requested_credits,0); assert.equal(blocked.reserved_credits,0);
            assert.equal(externalRequests,requestsBefore);
            assert.equal(sql("select jsonb_agg(t order by claim_id) from basic_free_discovery_credit_reservations t;"),claimsBefore);
            historyReadControls.push({fault,blocker:blocked.blocker,provider_requests:0,reserved_credits:0,claims_unchanged:true});
            historyReadFault=null;
          }
        }
        const pass=await (historyAppRequest ? historyAppRequest() : resumed.prepareCompletedSessionHistories());
        if(cappedHistoryPreparation) {
          const stored=Number(sql("select count(*) from scanner_cache;"));
          const bounded=await originalFetch(`${apiOrigin}/scanner_cache?select=ticker`,{
            headers:{Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`}});
          assert.equal(bounded.status,200);
          assert.equal((await bounded.json()).length,Math.min(stored,10));
          if(pass.blocker) console.error(JSON.stringify({ capped_history_preparation_reproduction: {
            pass:index+1,actual_api_cap:10,stored_histories:stored,requested_credits:pass.requested_credits,
            reserved_credits:pass.reserved_credits,blocker:pass.blocker,
            original_population_count:pass.original_members.length,actual_provider_requests:0,production_actions:0 } }));
        }
        assert.equal(pass.blocker,null,JSON.stringify(pass));
        assert.equal(pass.original_members.length,95);
        assert.deepEqual(pass.original_members.map(row=>row.ticker),originalUniverse.map(row=>row.ticker));
        assert.equal(pass.reserved_credits,index===11?7:8);
        assert.equal(pass.finalized_credits,pass.reserved_credits);
        preparationPasses.push(pass);
        if(index===0) {
          const before=externalRequests;
          sql("revoke execute on function public.finalize_basic_free_discovery_credit_reservation_attempt(text,text,text,text,timestamptz) from service_role;");
          assert.equal((await prepare()).blocker,"history_preparation_finalization_unproven");
          assert.equal(externalRequests,before,"Unproven cached finalization must block new acquisitions");
          sql("grant execute on function public.finalize_basic_free_discovery_credit_reservation_attempt(text,text,text,text,timestamptz) to service_role;");
          const limited=await prepare();
          assert.equal(limited.status,"blocked");
          assert.equal(limited.blocker,"per_minute_credit_limit_reached");
          assert.equal(limited.original_members.filter(row=>row.status==="available").length,8);
          assert.equal(externalRequests,before);
          assert.equal(Number(sql("select sum(requested_credits) from basic_free_discovery_credit_reservations;")),8);
          process.env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET="799";
          assert.equal((await prepare()).blocker,"basic_free_credit_reservation_unavailable");
          assert.equal(externalRequests,before,"Changing the declared daily budget may not sidestep its durable lock");
          process.env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET="800";
        }
      }
      const before=externalRequests;
      const complete=await prepare();
      assert.equal(complete.status,"complete"); assert.equal(complete.requested_credits,0);
      assert.equal(externalRequests,before);
      if(cappedHistoryPreparation) {
        assert.equal(complete.original_members.filter(row=>row.status==="available").length,95);
        sql("alter role authenticator set pgrst.db_max_rows='1000'; notify pgrst,'reload config';");
        let restored=false;
        for(let index=0;index<30;index++) {
          const response=await originalFetch(`${apiOrigin}/scanner_cache?select=ticker`,{
            headers:{Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`}});
          if(response.ok && (await response.json()).length===95) { restored=true; break; }
          await syntheticDelay(100);
        }
        assert(restored,"Only the preparation phase uses a real cap; later original charter contracts remain unchanged");
      }
      const controller=new AbortController(); controller.abort();
      assert.equal((await readers.prepareCompletedSessionHistories({signal:controller.signal})).blocker,"history_preparation_aborted");
      const plan=process.env.TWELVE_DATA_PLAN_MODE;
      process.env.TWELVE_DATA_PLAN_MODE="grow";
      assert.equal((await prepare()).blocker,"history_preparation_owner_plan_or_budget_unavailable");
      process.env.TWELVE_DATA_PLAN_MODE=plan;
      const first=JSON.parse(sql("select row_to_json(t) from scanner_cache t order by ticker limit 1;"));
      sql(`update scanner_cache set raw=jsonb_set(raw,'{completed_daily_context,content_sha256}','"corrupted-paid-context"') where ticker='${first.ticker}';`);
      const uncertain=await prepare();
      assert.equal(uncertain.status,"blocked"); assert.equal(uncertain.original_members.find(row=>row.ticker===first.ticker).status,"blocked");
      assert.equal(externalRequests,before,"A corrupt/uncertain prior paid source may not buy a retry in another minute");
      sql(`update scanner_cache set raw='${JSON.stringify(first.raw).replaceAll("'","''")}'::jsonb where ticker='${first.ticker}';`);
      assert.equal((await prepare()).status,"complete");
      const savedClock=clock;
      clock=OriginalDate.parse("2026-10-01T13:30:00Z");
      assert.equal((await prepare()).blocker,"history_preparation_session_unavailable");
      clock=OriginalDate.parse("2026-10-03T12:45:00Z");
      assert.equal((await prepare()).blocker,"history_preparation_session_unavailable");
      clock=savedClock;
      assert.equal(externalRequests,before);
      const paid=JSON.parse(sql("select jsonb_agg(t order by minute_bucket,execution_fingerprint) from basic_free_discovery_credit_reservations t;"));
      assert.equal(paid.length,95); assert(paid.every(row=>row.requested_credits===1&&row.status==="completed"&&row.finalized_at));
      assert.equal(Number(sql("select max(credits) from (select sum(requested_credits) credits from basic_free_discovery_credit_reservations group by minute_bucket) t;")),8);
      assert.equal(Number(sql("select count(*) from scanner_cache where latest_close is not null or updated_at <> (raw->'completed_daily_context'->>'latest_completed_at')::timestamptz;")),0,
        "History-only acquisition may not freshen a derived price or its legacy clock");
    } else for(const [index,candidate] of originalUniverse.entries()) {
      clock=OriginalDate.parse("2026-10-01T12:45:00.000Z")+Math.floor(index/8)*60000;
      await readers.scanMarket([candidate],{source:"scheduled",maxFreshProviderCalls:1,freshProviderCallPacingMs:0});
    }
    setupRequests=externalRequests;
    setupIntradayRequests=syntheticRequestEvidence.filter(request=>request.interval!=="1day").length;
    assert.equal(setupRequests,95); assert.equal(setupIntradayRequests,0);
    const retained=JSON.parse(sql("select coalesce(jsonb_agg(raw->'completed_daily_context' order by ticker),'[]') from scanner_cache where raw ? 'completed_daily_context';"));
    assert.equal(retained.length,95);
    assert.deepEqual(retained.map(context=>context.symbol).sort(),originalUniverse.map(candidate=>candidate.ticker).sort());
    const perMinute=new Map();
    for(const request of syntheticRequestEvidence) {
      assert.equal(request.interval,"1day");
      assert(OriginalDate.parse(request.requested_at)<OriginalDate.parse(slot));
      perMinute.set(request.requested_at,(perMinute.get(request.requested_at)??0)+1);
    }
    assert([...perMinute.values()].every(count=>count<=8));
    for(const context of retained) {
      assert.equal(context.latest_completed_market_date,"2026-09-30");
      assert(await readers.readCompletedDailyContext(context,context.symbol,new OriginalDate(slot)));
    }
    const retainedExample=retained[0],requestsBeforeValidation=externalRequests;
    assert.equal(await readers.readCompletedDailyContext(retainedExample,retainedExample.symbol,
      new OriginalDate("2026-10-02T13:30:00Z")),null,"Yesterday's split basis cannot become today's current history");
    for(const changed of [
      {...retainedExample,content_sha256:"wrong-content-digest"},
      {...retainedExample,symbol:"WRONG"},
      {...retainedExample,response_identity:{...retainedExample.response_identity,payload_sha256:"wrong-response-digest"}},
    ]) assert.equal(await readers.readCompletedDailyContext(changed,retainedExample.symbol,new OriginalDate(slot)),null);
    assert.equal(externalRequests,requestsBeforeValidation,"Negative history validation cannot refresh a provider");
    fullOriginalHistoryEvidence={scope:budgetedHistorySetup
      ? "actual_budgeted_history_sql_sdk_full_original_history_synthetic_not_live"
      : "actual_legacy_scanner_sql_sdk_full_original_history_synthetic_not_live",
      preparation_policy:budgetedHistorySetup ? readers.COMPLETED_SESSION_HISTORY_PREPARATION_VERSION
        : "existing_legacy_one_call_retained_history_not_current_input",
      normalized_preopen_guard:"completed_context_current_session_unavailable",
      original_universe:originalUniverse.map(candidate=>candidate.ticker),
      original_slots:originalSlots.map(row=>({slot:row.slot,tickers:row.candidates.map(candidate=>candidate.ticker)})),
      setup_requests:95,setup_intraday_requests:0,maximum_requests_in_modeled_minute:Math.max(...perMinute.values()),
      setup_credit_reservations:budgetedHistorySetup?95:0,
      setup_budget_scope:budgetedHistorySetup?"actual_isolated_durable_owner_bound_reservation":"modeled_request_cap_not_production_durable_reservation",
      ...(budgetedHistorySetup?{preparation_passes:preparationPasses,restarted_batches:12,
        minute_budget_blocked_without_provider:true,corrupted_paid_history_retry_blocked:true,
        legacy_derived_price_unchanged:true,unproven_cached_finalization_blocks_acquisition:true,
        daily_budget_drift_blocked_without_provider:true}:{}),
      ...(cappedHistoryPreparation?{preparation_response_cap:10,complete_cached_follow_up_members:95,
        complete_cached_follow_up_requests:0,preparation_source_read_controls:historyReadControls}:{}),
      requests:structuredClone(syntheticRequestEvidence),retained_daily_contexts:retained.map(context=>({
        symbol:context.symbol,captured_at:context.captured_at,latest_completed_market_date:context.latest_completed_market_date})),
      same_day_digest_identity_rejections:3,next_day_basis_rejected:true,validation_provider_requests:0,
      product_policy_changed:false,quality_improvement_claimed:false,provider_entitlement_proven:false};
  }
  externalRequests=0;
  externalBenchmarkRequests=0;
  const scheduledRequestEvidenceOffset=syntheticRequestEvidence.length;
  const scheduler = require(join(directory, "functions/scheduled.cjs")).default;
  if(historyPreparationFault) {
    assert.equal(Number(sql("select count(*) from recommendations;")),0);
    assert.equal(Number(sql("select count(*) from recommendation_scan_runs;")),0);
    assert.equal(Number(sql("select count(*) from positions;")),0);
    originalLog(JSON.stringify({evidence_mode:"synthetic_closed_actual_history_acquisition_sql_sdk_failure",
      ...(historyPreparationFault==="concurrent"?{preparation_concurrency_evidence:fullOriginalHistoryEvidence}
        :{preparation_failure_evidence:fullOriginalHistoryEvidence}),actual_provider_requests:0,
      production_actions:0,publications:0,broker_actions:0,cleanup:"inert"}));
  } else if(rotationDay) {
    assert.equal(setupRequests,fullOriginalHistorySetup?95:existingPremarketSetup?(expandedPremarketSetup?8:4):0);
    const slots=[];
    const observations=new Map();
    const eligible=readers.scannerUniverseTickers.filter(ticker=>ticker.enabled && ticker.tradable).map(ticker=>ticker.ticker).sort();
    const runFingerprints=new Set();
    const attemptFingerprints=new Set();
    let previousOriginalRun=null;
    for(let index=0;index<26;index++) {
      const sourceSlot=new OriginalDate(OriginalDate.parse(slot)+index*900000).toISOString();
      const followingSlot=new OriginalDate(OriginalDate.parse(sourceSlot)+900000).toISOString();
      clock=OriginalDate.parse(sourceSlot)+20000;
      const selected=readers.buildRealScannerBaseCandidateSelection({
        scanWindow:readers.getIntradayScanWindow(new OriginalDate(sourceSlot)),requestedScanBudget:8,
        selectionMode:"scheduled_rotating",now:new OriginalDate(sourceSlot)}).candidates;
      assert.equal(selected.length,8);
      const before=externalRequests, benchmarkBefore=externalBenchmarkRequests;
      const attemptedBefore=Number(sql("select count(*) from scheduled_scan_attempts;"));
      const runsBefore=Number(sql("select count(*) from recommendation_scan_runs;"));
      const claimCountBefore=Number(sql("select count(*) from basic_free_discovery_credit_reservations;"));
      const reusePreflight=previousOriginalRun?{
        original_status:previousOriginalRun.status,
        original_window:previousOriginalRun.window,
        original_observed_at:previousOriginalRun.observed_at,
        completed_benchmark_capsules_valid:!!await readers.readCompletedMarketRegime(previousOriginalRun.payload_json.market_regime,new OriginalDate(clock)),
        owned_reuse_admitted:!!await readers.readOwnedCompletedBenchmarkReuse({row:previousOriginalRun,owner,now:new OriginalDate(clock)}),
      }:null;
      const result=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:followingSlot})}),
        {deploy:{id:identity.deploy_id,context:"production",published:true}});
      const resultBody=result.status===204?null:await result.json();
      const requestCount=externalRequests-before, benchmarkCalls=externalBenchmarkRequests-benchmarkBefore;
      assert(requestCount<=8,"No slot may exceed the unchanged whole-scan cap");
      const attemptCount=Number(sql("select count(*) from scheduled_scan_attempts;"))-attemptedBefore;
      const runCount=Number(sql("select count(*) from recommendation_scan_runs;"))-runsBefore;
      const claimCount=Number(sql("select count(*) from basic_free_discovery_credit_reservations;"))-claimCountBefore;
      assert(attemptCount<=1 && runCount<=1 && claimCount<=1,"One attributable attempt/run/reservation per original slot");
      const attempt=attemptCount?JSON.parse(sql("select row_to_json(t) from scheduled_scan_attempts t order by utc_timestamp desc,id desc limit 1;")):null;
      const run=runCount?JSON.parse(sql("select row_to_json(t) from recommendation_scan_runs t order by observed_at desc,id desc limit 1;")):null;
      const claim=claimCount?JSON.parse(sql("select row_to_json(t) from basic_free_discovery_credit_reservations t order by created_at desc,id desc limit 1;")):null;
      if(attempt) {
        assert(!attemptFingerprints.has(attempt.attempt_fingerprint));
        attemptFingerprints.add(attempt.attempt_fingerprint);
      }
      if(claim) {
        assert.equal(claim.requested_credits,8); assert(claim.finalized_at);
        assert(["completed","failed"].includes(claim.status));
      }
      const decision=run?readers.candidateDecisionRecordFromScanRun(run):null;
      if(run) {
        assert(decision && readers.decisionLineageReceiptFromScanRun(run,decision),
          `Missing/mismatched original decision lineage at ${sourceSlot}`);
        assert(!runFingerprints.has(run.run_fingerprint)); runFingerprints.add(run.run_fingerprint);
        assert.equal(attempt.scan_run_fingerprint,run.run_fingerprint);
        assert.equal(decision.candidates.length,8);
        assert.deepEqual(decision.candidates.map(candidate=>candidate.ticker).sort(),selected.map(candidate=>candidate.ticker).sort());
        assert(OriginalDate.parse(run.observed_at)<=OriginalDate.parse(decision.decision_timestamp));
        assert(OriginalDate.parse(decision.decision_timestamp)<=OriginalDate.parse(run.completed_at));
        const acquisition=run.payload_json.active_scan_trace.market_data_fetch.completed_input_acquisition;
        if(omittedPairBaseline) {
          assert.equal(acquisition.policy_version,"completed_input_omitted_first_pair_guard_v1");
          assert.deepEqual(acquisition.original_members.map(member=>member.ticker),selected.map(candidate=>candidate.ticker));
          assert.deepEqual([...acquisition.acquisition_order].sort((a,b)=>a-b),[0,1,2,3,4,5,6,7]);
        }
        else if(acquisitionBaseline || !minimumOrderBaseline && !firstObservationBaseline && !fairOrderBaseline) assert.equal(acquisition,undefined);
        else {
          assert.equal(acquisition.policy_version,firstObservationBaseline?"completed_input_first_observation_guard_v1":minimumOrderBaseline?"completed_input_minimum_requests_first_v1":"completed_input_fair_cost_ties_v1");
          assert.deepEqual(acquisition.original_members.map(member=>member.ticker),selected.map(candidate=>candidate.ticker));
        }
        for(const candidate of decision.candidates.filter(candidate=>candidate.data.freshness==="fresh")) {
          assert(OriginalDate.parse(candidate.data.input_snapshot.current_session.captured_at)<=OriginalDate.parse(decision.decision_timestamp));
          assert(OriginalDate.parse(candidate.data.input_snapshot.historical_context.captured_at)<=OriginalDate.parse(decision.decision_timestamp));
          if(fullOriginalHistorySetup) {
            const prepared=fullOriginalHistoryEvidence.retained_daily_contexts.find(row=>row.symbol===candidate.ticker);
            assert.equal(candidate.data.input_snapshot.historical_context.captured_at,prepared.captured_at,
              "Regular use must retain the actual original pre-open capture clock");
            assert(OriginalDate.parse(candidate.data.input_snapshot.current_session.captured_at)>=OriginalDate.parse(sourceSlot),
              "Historical setup must never masquerade as the current regular-session price");
          }
        }
      }
      const members=selected.map(candidate=>{
        const original=decision?.candidates.find(member=>member.ticker===candidate.ticker);
        const fresh=original?.data.freshness==="fresh";
        const previous=observations.get(candidate.ticker)??{ticker:candidate.ticker,selected:0,fresh:0,missing:0,revisit_missing:0,first_complete_slot:null};
        if(!fresh && previous.selected>0) previous.revisit_missing++;
        previous.selected++; previous.fresh+=Number(fresh); previous.missing+=Number(!fresh);
        if(fresh && previous.first_complete_slot===null) previous.first_complete_slot=sourceSlot;
        observations.set(candidate.ticker,previous);
        return {ticker:candidate.ticker,freshness:original?.data.freshness??"no_decision",gap_codes:original?.data.gap_codes??[]};
      });
      slots.push({slot:sourceSlot,http_status:result.status,attempts:attemptCount,runs:runCount,reservations:claimCount,
        outcome:attempt?.outcome??null,skip_reason:attempt?.skip_reason??null,
        decision_disposition:decision?.final_decision.disposition??null,no_trade_reason:decision?.final_decision.no_trade_reason??null,
        requests:requestCount,benchmark_requests:benchmarkCalls,stock_requests:requestCount-benchmarkCalls,
        fresh_members:members.filter(member=>member.freshness==="fresh").length,members,
        synthetic_request_evidence:syntheticRequestEvidence.slice(scheduledRequestEvidenceOffset+before,scheduledRequestEvidenceOffset+externalRequests),
        intraday_session_admission_policy_version:run?.payload_json.active_scan_trace.market_data_fetch.intraday_session_admission_policy_version??null,
        provider_observations:run?.payload_json.active_scan_trace.market_data_fetch.candidate_observations??[],
        acquisition:run?.payload_json.active_scan_trace.market_data_fetch.completed_input_acquisition??null,
        benchmark_reuse_preflight:reusePreflight,
        ...(attemptCount===0 || runCount===0 ? {bounded_result:resultBody} : {})});
      previousOriginalRun=run;
    }
    const scheduledRequests=externalRequests;
    const allPaidClaims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
    const preparationClaims=allPaidClaims.filter(claim=>claim.execution_fingerprint.startsWith("completed_session_history_preparation_v1|"));
    assert.equal(preparationClaims.length,budgetedHistorySetup?95:0);
    const totalClaims=allPaidClaims.filter(claim=>!preparationClaims.includes(claim));
    const cycles=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from observation_cycle_receipts t;"));
    const cycleReadback=readers.buildObservationCycleReadback(cycles);
    assert.equal(cycleReadback.invalid_row_count,0);
    assert(totalClaims.reduce((sum,claim)=>sum+claim.requested_credits,0)<=208);
    assert(totalClaims.every(claim=>claim.status!=="reserved" && claim.finalized_at));
    assert.equal(Number(sql("select count(*) from recommendations;")),0);
    assert.equal(Number(sql("select count(*) from positions;")),0);
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const restarted=require(join(generated,"reader.cjs"));
    const owned=await restarted.readRecommendationLearningBaselineSource(owner);
    assert.equal(owned.status,"available","Actual full-population SDK read must not truncate or silently exclude a row");
    const source=restarted.parseRecommendationLearningBaselineSource(owned.data);
    assert(source && source.scanRuns.length===runFingerprints.size);
    assert.deepEqual(source.scanRuns.map(run=>run.run_fingerprint).sort(),[...runFingerprints].sort());
    for(const run of source.scanRuns) {
      const decision=restarted.candidateDecisionRecordFromScanRun(run);
      assert(decision && restarted.decisionLineageReceiptFromScanRun(run,decision));
    }
    const wrongOwner=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
    assert.equal(wrongOwner.data.recommendation_scan_runs.length,0);
    let enrollmentEvidence=null;
    let lateOutcomeEvidence=null;
    if(prospectiveEnrollment) {
      // Synthetic controlled chronology ONLY: this does not fabricate an
      // actual pre-forward database seal or retrospectively enroll market data.
      const frozenAt="2026-09-25T12:00:00.000Z";
      const plan=restarted.buildRelativePlanProspectivePlan({owner_user_id:owner,
        source_revision:{commit_ref:identity.commit_ref,build_identity:restarted.relativePlanCanonicalBuildIdentity,
          deploy_id:identity.deploy_id},windows:{
          training:{start_at:"2026-09-28T13:30:00.000Z",end_at:"2026-09-29T20:00:00.000Z"},
          held_out:{start_at:slot,end_at:expiry},
          walk_forward:{start_at:"2026-10-05T13:30:00.000Z",end_at:"2026-10-06T20:00:00.000Z"},
        }},frozenAt);
      assert(plan);
      const freeze={contract_version:restarted.RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION,
        freeze_id:"22222222-2222-4222-8222-222222222222",owner_user_id:owner,frozen_at:frozenAt,plan};
      const readEnrollment=(ownedSource=source,currentOwner=owner)=>restarted.buildRelativePlanProspectiveEnrollment({
        owner:currentOwner,freeze,source:ownedSource,now:new OriginalDate(OriginalDate.parse(expiry)+3600000)});
      const enrollment=readEnrollment(); assert(enrollment);
      assert.deepEqual(readEnrollment(),enrollment,"Restarted unchanged original source retains membership and exclusions");
      assert.equal(readEnrollment(source,"00000000-0000-4000-8000-000000000002"),null);
      const decisionEvidence=source.scanRuns.map(run=>{
        const record=restarted.candidateDecisionRecordFromScanRun(run);
        const shadow=restarted.buildRelativePlanContextShadow(record);
        return {fingerprint:run.run_fingerprint,decision_at:record.decision_timestamp,
          original_population_count:shadow.original_population_count,status:shadow.status,
          assessed_count:shadow.assessed_count,unassessed_count:shadow.unassessed_count,
          members:shadow.candidates.map(member=>({candidate_id:member.candidate_id,ticker:member.ticker,
            context_status:member.context_status,reason:member.reason})),
          exclusion:enrollment.diagnostics.find(row=>row.fingerprint===run.run_fingerprint)?.reason??null};
      }).sort((a,b)=>a.decision_at.localeCompare(b.decision_at));
      const enrolledDecisions=enrollment.partitions.flatMap(partition=>partition.decisions);
      assert.equal(enrolledDecisions.length+enrollment.diagnostics.length,source.scanRuns.length);
      assert.equal(decisionEvidence.reduce((sum,row)=>sum+row.original_population_count,0),208);
      assert(enrolledDecisions.every(row=>decisionEvidence.find(original=>original.fingerprint===row.fingerprint)?.status==="comparable"));
      enrollmentEvidence={evidence_scope:"synthetic_controlled_original_source_composition_not_database_forward_seal",
        source_decisions:source.scanRuns.length,original_member_observations:208,
        enrolled_decisions:enrolledDecisions.length,excluded_decisions:enrollment.diagnostics.length,
        partitions:enrollment.partitions.map(partition=>({partition:partition.partition,
          enrolled_decision_count:partition.enrolled_decision_count,required_decisions:partition.required_decisions,
          original_population_count:partition.original_population_count,missing_outcome_count:partition.missing_outcome_count,
          original_membership_fingerprint:partition.original_membership_fingerprint})),
        diagnostics:enrollment.diagnostics,decisions:decisionEvidence,
        actual_provider_requests:0,quality_improvement_claimed:false};
      if(expandedPremarketSetup) {
        const session=readers.getUsEquityMarketSession("2026-10-01");
        assert.equal(session.verification_status,"verified");
        const complete=decisionEvidence.filter(row=>row.status==="comparable").map(row=>({
          fingerprint:row.fingerprint,decision_at:row.decision_at,
          original_population_count:row.original_population_count,
          required_horizon_end_at:new OriginalDate(Math.ceil(OriginalDate.parse(row.decision_at)/300000)*300000+3600000).toISOString(),
          original_tickers:row.members.map(member=>member.ticker),
        }));
        const eligible=complete.filter(row=>OriginalDate.parse(row.required_horizon_end_at)<=OriginalDate.parse(session.session_close));
        existingPremarketEvidence.capacity_question={original_decisions:26,original_member_observations:208,
          session_close:session.session_close,complete_original_decisions:complete,
          regular_horizon_eligible_decisions:eligible,
          disposition:eligible.length?"source_feasibility_only_requires_actual_canonical_outcomes":"reject_no_earlier_full_regular_horizon",
          quality_improvement_claimed:false,product_policy_changed:false};
      }
      if(lateOriginalOutcomes || fullOriginalHistorySetup) {
        const session=readers.getUsEquityMarketSession("2026-10-01");
        assert.equal(session.verification_status,"verified");
        const eligible=decisionEvidence.filter(row=>row.status==="comparable" &&
          Math.ceil(OriginalDate.parse(row.decision_at)/300000)*300000+3600000<=OriginalDate.parse(session.session_close));
        if(lateOriginalOutcomes) assert.equal(enrolledDecisions.length,1);
        // Fixed original chronological enrollment, never favorable outcomes or
        // a caller-built cohort. All other 25 source decisions remain present.
        const original=fullOriginalHistorySetup?eligible[0]:decisionEvidence.find(row=>row.status==="comparable");
        if(fullOriginalHistorySetup) {
          fullOriginalHistoryEvidence.source_capacity={complete_decisions:decisionEvidence.filter(row=>row.status==="comparable").length,
            regular_horizon_eligible_decisions:eligible.map(row=>({fingerprint:row.fingerprint,decision_at:row.decision_at})),
            first_eligible_original_decision:original??null};
          process.stderr.write(JSON.stringify({full_original_history_capacity:fullOriginalHistoryEvidence.source_capacity})+"\n");
          assert(original,"Full preparation must supply an earlier complete ORIGINAL population with a regular 60m horizon");
        } else assert.equal(original.decision_at,"2026-10-01T19:30:20.000Z");
        const anchorStart=new OriginalDate(Math.ceil(OriginalDate.parse(original.decision_at)/300000)*300000).toISOString();
        const horizonEnd=new OriginalDate(OriginalDate.parse(anchorStart)+3600000).toISOString();
        futureOutcomePlans=source.snapshots.filter(snapshot=>snapshot.scan_run_id===original.fingerprint)
          .map((snapshot,index)=>({...snapshot,synthetic_win:index%2===0}));
        assert.equal(futureOutcomePlans.length,8);
        assert.deepEqual(futureOutcomePlans.map(row=>row.ticker).sort(),original.members.map(row=>row.ticker).sort());
        const batch=JSON.parse(sql(`select to_jsonb(t) from recommendation_batches t where scan_run_fingerprint='${original.fingerprint}';`));
        assert.equal(batch.owner_user_id,owner);
        clock=fullOriginalHistorySetup?OriginalDate.parse(horizonEnd):OriginalDate.parse("2026-10-01T20:45:00Z");
        const passes=[];
        for(let index=0;index<2;index++) {
          const before=externalRequests;
          delete require.cache[require.resolve(join(generated,"outcome-route.cjs"))];
          const evaluated=await require(join(generated,"outcome-route.cjs")).POST(new Request("http://closed-fixture/api/recommendations/evaluate-outcomes",{
            method:"POST",headers:{"x-automation-secret":environment.AUTOMATION_SECRET,"Content-Type":"application/json"},
            body:JSON.stringify({mode:"official_live_today",batch_fingerprint:batch.batch_fingerprint,
              horizons:["60m"],max_candle_requests:4,max_batches:1}),
          }));
          const body=await evaluated.json();
          assert.equal(evaluated.status,200,JSON.stringify(body));
          assert.equal(externalRequests-before,4);
          assert.equal(body.eligible_snapshot_count,index===0?8:4);
          assert.equal(body.batch_fingerprint,batch.batch_fingerprint);
          assert.equal(body.persistence_status,"success",body.persistence_error);
          const databaseRows=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
          assert(databaseRows.every(row=>row.owner_user_id===owner && row.horizon==="60m"));
          passes.push({requests:externalRequests-before,selected_batch_fingerprint:body.batch_fingerprint,
            eligible_snapshot_count:body.eligible_snapshot_count,persisted_outcome_count:body.persisted_outcome_count,
            persistence_status:body.persistence_status,outcomes_created_count:body.outcomes_created_count,
            outcomes_updated_count:body.outcomes_updated_count,physical_database_rows:databaseRows.length,
            results:body.candidates.filter(candidate=>candidate.candle_request).map(candidate=>({
              ticker:candidate.ticker,status:candidate.status,error:candidate.error,
              candle_count:candidate.candle_count,candle_request:candidate.candle_request,
              outcome_status:candidate.outcome_status,persistence_mode:candidate.persistence_mode,
            })),
            requested_tickers:syntheticRequestEvidence.slice(scheduledRequestEvidenceOffset+before,
              scheduledRequestEvidenceOffset+externalRequests).map(request=>request.ticker)});
        }
        delete require.cache[require.resolve(join(generated,"reader.cjs"))];
        const refreshed=require(join(generated,"reader.cjs"));
        const updated=await refreshed.readRecommendationLearningBaselineSource(owner);
        const updatedSource=refreshed.parseRecommendationLearningBaselineSource(updated.data);
        assert(updatedSource && updatedSource.scanRuns.length===26);
        const physicalRows=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
        assert.equal(physicalRows.length,8);
        assert.equal(updatedSource.outcomes.length,physicalRows.length);
        assert.deepEqual(physicalRows.map(row=>row.snapshot_fingerprint).sort(),futureOutcomePlans.map(row=>row.snapshot_fingerprint).sort());
        assert.equal(session.session_type,"regular_session");
        const coverages=physicalRows.map(row=>({ticker:row.ticker,status:row.status,
          coverage:row.payload_json.canonical_provider_coverage,
          retained_candle_count:row.payload_json.counterfactual_candles?.length??0}));
        for(const row of coverages) {
          assert(["target_before_stop","stop_before_target"].includes(row.status));
          assert.equal(row.coverage.expected_candle_count,12);
          assert.equal(row.coverage.observed_candle_count,fullOriginalHistorySetup?12:5);
          assert.equal(row.coverage.freshness,fullOriginalHistorySetup?"fresh":"unknown");
          if(fullOriginalHistorySetup) assert.deepEqual(row.coverage.blockers,[]);
          else assert(row.coverage.blockers.includes("candle_coverage_incomplete"));
          assert.equal(row.retained_candle_count,fullOriginalHistorySetup?12:5);
          assert.equal(row.coverage.decision_timestamp,original.decision_at);
          assert.equal(row.coverage.evaluation_anchor_start_at,anchorStart);
          assert.equal(row.coverage.required_horizon_end_at,horizonEnd);
        }
        if(fullOriginalHistorySetup) for(const outcome of physicalRows) {
          assert(OriginalDate.parse(outcome.evaluated_at)>=OriginalDate.parse(horizonEnd));
          assert(OriginalDate.parse(horizonEnd)<=OriginalDate.parse(session.session_close));
          assert(outcome.payload_json.counterfactual_candles.every(candle=>
            OriginalDate.parse(candle.timestamp)>=OriginalDate.parse(session.session_open) &&
            OriginalDate.parse(candle.timestamp)+300000<=OriginalDate.parse(session.session_close)),
          "Canonical horizon must contain only actual regular-session fixture bars");
        }
        assert.deepEqual(updatedSource.scanRuns.map(run=>run.run_fingerprint).sort(),[...runFingerprints].sort());
        const link=refreshed.buildRecommendationLearningBaselineReadiness(updatedSource).relative_plan_context_outcomes
          .find(row=>row.scan_run_fingerprint===original.fingerprint);
        assert.equal(link.original_population_count,8);
        assert.equal(link.canonical_outcome_count,fullOriginalHistorySetup?8:0,
          "Only a full canonical 60m regular-session horizon can supply usable labels");
        assert.equal(link.missing_outcome_count,fullOriginalHistorySetup?0:8);
        assert.equal(link.status,fullOriginalHistorySetup?"linked_complete":"evidence_incomplete");
        assert.equal(link.population_complete,fullOriginalHistorySetup);
        for(const value of [link.baseline.precision_at_3.value,link.baseline.expectancy_r.value,
          link.challenger.precision_at_3.value,link.challenger.expectancy_r.value,link.precision_delta]) {
          if(fullOriginalHistorySetup) assert(Number.isFinite(value));
          else assert.equal(value,null);
        }
        assert.equal((await refreshed.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002")).data.recommendation_outcomes.length,0);
        // Actual isolated DB write clocks must be inside the read boundary.
        // This synthetic late read is not a real pre-forward database seal.
        const updatedEnrollment=refreshed.buildRelativePlanProspectiveEnrollment({owner,freeze,source:updatedSource,
          now:new OriginalDate(Math.max(OriginalDate.parse("2026-10-07T21:00:00Z"),OriginalDate.now()))});
        const held=updatedEnrollment.partitions.find(row=>row.partition==="held_out");
        assert.equal(held.enrolled_decision_count,fullOriginalHistorySetup?enrolledDecisions.length:1);
        assert.equal(held.missing_outcome_count,fullOriginalHistorySetup?(enrolledDecisions.length-1)*8:8);
        assert.deepEqual(updatedEnrollment.diagnostics,enrollment.diagnostics);
        lateOutcomeEvidence={scope:"actual_original_source_route_adapter_sql_sdk_regular_session_only_synthetic_not_live",
          original_scan_run_fingerprint:original.fingerprint,decision_timestamp:original.decision_at,
          session_close:session.session_close,evaluation_anchor_start_at:coverages[0].coverage.evaluation_anchor_start_at,
          required_horizon_end_at:coverages[0].coverage.required_horizon_end_at,
          available_regular_minutes:(OriginalDate.parse(session.session_close)-OriginalDate.parse(coverages[0].coverage.evaluation_anchor_start_at))/60000,
          original_members:original.members,persisted_coverage:coverages,
          outcome_passes:passes,separate_synthetic_outcome_requests:externalRequests-scheduledRequests,
          original_source_decisions:updatedSource.scanRuns.length,physical_database_outcome_rows:physicalRows.length,
          owner_read_outcome_rows:updatedSource.outcomes.length,
          canonical_outcome_count:link.canonical_outcome_count,missing_outcome_count:link.missing_outcome_count,
          disposition:link.status,population_complete:link.population_complete,precision_delta:link.precision_delta,
          baseline_precision_at_3:link.baseline.precision_at_3.value,shadow_precision_at_3:link.challenger.precision_at_3.value,
          baseline_expectancy_r:link.baseline.expectancy_r.value,shadow_expectancy_r:link.challenger.expectancy_r.value,
          original_membership_stable:true,quality_improvement_claimed:false};
        if(fullOriginalHistorySetup) {
          fullOriginalHistoryEvidence.canonical_outcome_evidence=lateOutcomeEvidence;
          fullOriginalHistoryEvidence.final_prospective_partitions=updatedEnrollment.partitions.map(partition=>({
            partition:partition.partition,enrolled_decision_count:partition.enrolled_decision_count,
            original_population_count:partition.original_population_count,missing_outcome_count:partition.missing_outcome_count,
            status:partition.status}));
          // Controlled historical fixture only, not a pre-forward DB seal or
          // useful thirty-decision market cohort. Exercise the real full-charter
          // consumer on EVERY original source, not a handmade eight-row source.
          sql(`insert into relative_plan_prospective_comparisons(id,owner_user_id,model_version,plan_fingerprint,plan_json,frozen_at)
            values('${freeze.freeze_id}','${owner}','${plan.model_version}','${plan.plan_fingerprint}',
              '${JSON.stringify(plan).replaceAll("'","''")}'::jsonb,'${frozenAt}');`);
          const asOf=new OriginalDate(Math.max(OriginalDate.parse("2026-10-07T21:00:00Z"),OriginalDate.now()));
          const charterRead=await refreshed.createRelativePlanProspectiveService().read(owner,asOf);
          assert.equal(charterRead.status,"available",charterRead.blocker);
          const measured=charterRead.learning.full_charter.partitions.find(partition=>partition.partition==="held_out");
          assert.equal(measured.quality.original_population_count,enrolledDecisions.length*8);
          assert.equal(charterRead.learning.partitions.find(partition=>partition.partition==="held_out").canonical_outcome_count,8);
          assert.equal(measured.operational.reliability.admitted_attempt_count,26);
          assert.equal(measured.operational.cost.reserved_provider_credits,208);
          assert.equal(charterRead.learning.full_charter.computed_disposition,"evidence_incomplete");
          assert.equal(charterRead.learning.terminal_quality_decision,null);
          assert.equal(charterRead.learning.trained_probability_model,null);
          assert.equal(charterRead.learning.quality_improvement_claimed,false);
          assert.equal((await refreshed.createRelativePlanProspectiveService().read("00000000-0000-4000-8000-000000000002",asOf)).learning,null);
          const immutableSnapshot=updatedSource.snapshots.find(row=>row.scan_run_id===original.fingerprint);
          const beforeNegativeRequests=externalRequests;
          sql(`update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{provider_source}',
            '"wrong_provider"'::jsonb) where id='${immutableSnapshot.id}';`);
          const tampered=await refreshed.createRelativePlanProspectiveService().read(owner,asOf);
          assert.equal(tampered.status,"available",tampered.blocker);
          const tamperedHeld=tampered.learning.partitions.find(partition=>partition.partition==="held_out");
          assert.equal(tamperedHeld.original_population_count,enrolledDecisions.length*8);
          assert.equal(tamperedHeld.original_membership_fingerprint,held.original_membership_fingerprint);
          assert.equal(tamperedHeld.canonical_outcome_count,7);
          assert.equal(tamperedHeld.missing_outcome_count,held.missing_outcome_count+1);
          const invalidLink=tampered.learning.legacy_baseline_readiness.relative_plan_context_outcomes
            .find(row=>row.scan_run_fingerprint===original.fingerprint);
          assert.equal(invalidLink.population_complete,false); assert.equal(invalidLink.precision_delta,null);
          assert.equal(invalidLink.baseline.precision_at_3.value,null);
          assert.equal(tampered.learning.terminal_quality_decision,null);
          sql(`update recommendation_snapshots set payload_json='${JSON.stringify(immutableSnapshot.payload_json).replaceAll("'","''")}'::jsonb
            where id='${immutableSnapshot.id}';`);
          const restored=await refreshed.createRelativePlanProspectiveService().read(owner,asOf);
          assert.deepEqual(restored.learning,charterRead.learning);
          assert.equal(externalRequests,beforeNegativeRequests);
          assert.deepEqual(JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;")),physicalRows);
          fullOriginalHistoryEvidence.full_charter_evidence={original_population_count:measured.quality.original_population_count,
            canonical_outcome_count:8,missing_outcome_count:held.missing_outcome_count,
            operational_attempts:measured.operational.reliability.admitted_attempt_count,
            reserved_scheduled_provider_credits:measured.operational.cost.reserved_provider_credits,
            disposition:charterRead.learning.full_charter.computed_disposition,
            missing_dimensions:charterRead.learning.full_charter.missing_dimensions,
            wrong_owner_learning:null,tampered_source_canonical_outcomes:7,tampered_source_missing_outcomes:tamperedHeld.missing_outcome_count,
            original_membership_stable:true,restored_charter_unchanged:true,negative_readback_provider_requests:0,
            trained_probability_model:null,terminal_quality_decision:null,quality_improvement_claimed:false};
          fullOriginalHistoryEvidence.remaining_quality_gate="full_forward_charter_and_sealed_probability_model_not_established";
          fullOriginalHistoryEvidence.total_separate_synthetic_data_requests=setupRequests+externalRequests;
          if(originalSourceReadControls) {
            clock=OriginalDate.parse("2026-10-01T20:45:00Z");
            const sourceControls=[];
            const originalOutcomeRows=sql("select coalesce(jsonb_agg(t order by id),'[]') from recommendation_outcomes t;");
            for(const fault of ["second_page","missing_count","truncated_page","wrong_owner",
              "source_population_changed","verification_error","deadline","source_read_limit"]) {
              originalSourceReadFault=fault; originalSourceReadFaultApplied=false;
              if(fault==="source_read_limit") sql(`insert into recommendation_batches(id,batch_fingerprint,trading_date,owner_user_id,batch_type)
                select 'ture_source_read_control_'||n,'ture_source_read_control_'||n,'2026-10-01','${owner}','diagnostic'
                from generate_series(1,175) n;`);
              const before=externalRequests;
              delete require.cache[require.resolve(join(generated,"outcome-route.cjs"))];
              const response=await require(join(generated,"outcome-route.cjs")).POST(new Request("http://closed-fixture/api/recommendations/evaluate-outcomes",{
                method:"POST",headers:{"x-automation-secret":environment.AUTOMATION_SECRET,"Content-Type":"application/json"},
                body:JSON.stringify({mode:"official_live_today",horizons:["60m"],max_candle_requests:4,max_batches:1}),
              }));
              const body=await response.json();
              assert.equal(response.status,200,JSON.stringify(body));
              assert.equal(body.status,"failed",JSON.stringify({fault,body}));
              assert.equal(externalRequests,before,"Incomplete source reads cannot perform outcome provider work");
              assert.equal(sql("select coalesce(jsonb_agg(t order by id),'[]') from recommendation_outcomes t;"),originalOutcomeRows);
              assert(originalSourceReadFaultApplied || fault==="source_read_limit");
              sourceControls.push({fault,status:body.status,blocker:body.persistence_error,provider_requests:0,outcomes_unchanged:true});
              originalSourceReadFault=null;
              sql("delete from recommendation_batches where id like 'ture_source_read_control_%';");
              assert.equal(Number(sql("select count(*) from recommendation_batches;")),26);
            }
            fullOriginalHistoryEvidence.original_source_read_controls=sourceControls;
            sql(`insert into recommendation_batches(id,batch_fingerprint,trading_date,owner_user_id,batch_type) values
              ('ture_source_owner_control','ture_source_owner_control','2026-10-01','00000000-0000-4000-8000-000000000002','official'),
              ('ture_source_date_control','ture_source_date_control','2026-10-02','${owner}','official');`);
            const beforeIsolation=externalRequests;
            delete require.cache[require.resolve(join(generated,"outcome-route.cjs"))];
            const isolatedResponse=await require(join(generated,"outcome-route.cjs")).POST(new Request("http://closed-fixture/api/recommendations/evaluate-outcomes",{
              method:"POST",headers:{"x-automation-secret":environment.AUTOMATION_SECRET,"Content-Type":"application/json"},
              body:JSON.stringify({mode:"official_live_today",horizons:["60m"],max_candle_requests:0,max_batches:1}),
            }));
            const isolatedBody=await isolatedResponse.json();
            assert.equal(isolatedResponse.status,200,JSON.stringify(isolatedBody));
            // Pending candidates count as attempted budget-deferred work, not
            // an empty source. Preserve the runner's truthful partial receipt.
            assert.equal(isolatedBody.status,"partial");
            assert.equal(isolatedBody.effective_budget_limit,0);
            assert.equal(isolatedBody.candle_requests_executed,0);
            assert(isolatedBody.pending_provider_budget_count>0);
            assert.equal(isolatedBody.outcome_provider_budget_status,"deferred_by_budget");
            assert.equal(isolatedBody.same_day_official_batch_revisit.original_source_read.original_batches_read,26);
            assert.equal(externalRequests,beforeIsolation);
            assert.equal(sql("select coalesce(jsonb_agg(t order by id),'[]') from recommendation_outcomes t;"),originalOutcomeRows);
            assert.equal(Number(sql("select count(*) from recommendation_batches;")),28);
            fullOriginalHistoryEvidence.original_source_read_isolation={actual_other_owner_rows:1,actual_other_date_rows:1,
              original_batches_read:26,provider_requests:0,outcomes_unchanged:true};
            sql("delete from recommendation_batches where id in ('ture_source_owner_control','ture_source_date_control');");
          }
          if(originalOutcomeContinuation) {
            // Diagnose the EXISTING no-fingerprint source selection. Do not
            // hand-pick later batches, seed outcomes or change its provider cap.
            clock=OriginalDate.parse("2026-10-01T20:45:00Z");
            const continuationPasses=[];
            const continuationStart=externalRequests;
            for(let index=0;index<60;index++) {
              const before=externalRequests;
              delete require.cache[require.resolve(join(generated,"outcome-route.cjs"))];
              const response=await require(join(generated,"outcome-route.cjs")).POST(new Request("http://closed-fixture/api/recommendations/evaluate-outcomes",{
                method:"POST",headers:{"x-automation-secret":environment.AUTOMATION_SECRET,"Content-Type":"application/json"},
                body:JSON.stringify({mode:"official_live_today",horizons:["60m"],max_candle_requests:4,max_batches:1}),
              }));
              const body=await response.json();
              assert.equal(response.status,200,JSON.stringify(body));
              assert(externalRequests-before<=4,"Continuation cannot increase its unchanged per-pass request cap");
              continuationPasses.push({requests:externalRequests-before,status:body.status,
                eligible_snapshot_count:body.eligible_snapshot_count,persisted_outcome_count:body.persisted_outcome_count,
                source_selection:body.same_day_official_batch_revisit,persistence_status:body.persistence_status});
              if(externalRequests===before) break;
            }
            assert(continuationPasses.length<60,"Bounded diagnostic must reach a truthful source-selection stop");
            delete require.cache[require.resolve(join(generated,"reader.cjs"))];
            const resumed=require(join(generated,"reader.cjs"));
            const completeSource=resumed.parseRecommendationLearningBaselineSource((await resumed.readRecommendationLearningBaselineSource(owner)).data);
            assert(completeSource && completeSource.scanRuns.length===26);
            const nextRead=await resumed.createRelativePlanProspectiveService().read(owner,asOf);
            assert.equal(nextRead.status,"available",nextRead.blocker);
            const heldRead=nextRead.learning.partitions.find(partition=>partition.partition==="held_out");
            assert.equal(heldRead.original_population_count,176);
            assert.equal(heldRead.original_membership_fingerprint,held.original_membership_fingerprint);
            assert.equal(nextRead.learning.terminal_quality_decision,null);
            assert.equal(nextRead.learning.quality_improvement_claimed,false);
            const originalBatches=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from (select owner_user_id,batch_fingerprint,scan_run_fingerprint from recommendation_batches) t;"))
              .filter(row=>row.owner_user_id===owner&&runFingerprints.has(row.scan_run_fingerprint));
            assert.equal(originalBatches.length,26);
            const sourceRead=continuationPasses.at(-1).source_selection?.original_source_read;
            const discovered=new Set(sourceRead?.original_batch_fingerprints??
              continuationPasses.at(-1).source_selection?.selected_batch_fingerprints??[]);
            const unvisited=originalBatches.filter(row=>!discovered.has(row.batch_fingerprint)).map(row=>({
              batch_fingerprint:row.batch_fingerprint,scan_run_fingerprint:row.scan_run_fingerprint,
              complete_regular_horizon_eligible:eligible.some(decision=>decision.fingerprint===row.scan_run_fingerprint),
            }));
            const enrolledCoverage=heldRead.decisions.flatMap(decision=>decision.comparison.candidates.map(row=>{
              const outcome=completeSource.outcomes.find(value=>value.id===row.outcome_id);
              const retained=outcome?.payload_json.counterfactual_candles??[];
              return {scan_run_fingerprint:decision.fingerprint,candidate_id:row.candidate_id,ticker:row.ticker,
                outcome_status:row.outcome_status,outcome_reason:row.outcome_reason,outcome_id:row.outcome_id,
                stored_status:outcome?.status??null,current_r:outcome?.current_r??null,eod_r:outcome?.eod_r??null,
                entry:outcome?.entry??null,stop:outcome?.stop??null,side:outcome?.side??null,
                provider_coverage:outcome?.payload_json.canonical_provider_coverage??null,
                retained_candle_count:retained.length,last_retained_candle:retained.at(-1)??null};
            }));
            assert.equal(enrolledCoverage.length,176);
            assert.equal(new Set(enrolledCoverage.map(row=>row.candidate_id)).size,176);
            const measuredNeither=heldRead.decisions.flatMap(decision=>decision.comparison.candidates)
              .filter(row=>row.outcome_status==="resolved" && row.terminal_outcome==="neither");
            assert.equal(measuredNeither.length,126);
            for(const member of measuredNeither) {
              const outcome=completeSource.outcomes.find(value=>value.id===member.outcome_id);
              const mark=outcome.payload_json.canonical_horizon_price_mark;
              const coverage=outcome.payload_json.canonical_provider_coverage;
              assert.equal(mark.contract_version,"canonical_horizon_price_mark_v1");
              assert.equal(mark.status,"available");
              assert.equal(mark.marked_at,coverage.required_horizon_end_at);
              assert.equal(OriginalDate.parse(mark.candle_started_at)+300000,OriginalDate.parse(mark.marked_at));
              assert.equal(outcome.current_price,mark.price);
              assert.equal(outcome.current_r,(mark.price-outcome.entry)/(outcome.entry-outcome.stop));
              assert.equal(member.r_result,outcome.current_r);
              assert.equal(outcome.payload_json.horizon_filter_policy_version,"fully_closed_original_horizon_candles_v1");
              assert(outcome.payload_json.counterfactual_candles.every(candle=>
                OriginalDate.parse(candle.timestamp)+300000<=OriginalDate.parse(mark.marked_at)));
            }
            const reasonCounts={};
            for(const row of enrolledCoverage) {
              const reason=row.outcome_reason??row.outcome_status;
              reasonCounts[reason]=(reasonCounts[reason]??0)+1;
            }
            const remainingMissingness=heldRead.decisions.flatMap(decision=>{
              const missing=decision.comparison.candidates.filter(row=>row.outcome_status!=="resolved");
              if(missing.length===0) return [];
              const anchorAt=Math.ceil(OriginalDate.parse(decision.decision_at)/300000)*300000;
              return [{scan_run_fingerprint:decision.fingerprint,decision_at:decision.decision_at,
                original_population_count:decision.original_population_count,missing_count:missing.length,
                evaluation_anchor_start_at:new OriginalDate(anchorAt).toISOString(),
                required_horizon_end_at:new OriginalDate(anchorAt+3600000).toISOString(),
                session_close:session.session_close,
                full_regular_horizon:anchorAt+3600000<=OriginalDate.parse(session.session_close),
                members:missing.map(member=>({candidate_id:member.candidate_id,ticker:member.ticker,
                  reason:member.outcome_reason,snapshot_fingerprint:member.snapshot_fingerprint,
                  persisted_original_60m:completeSource.outcomes.filter(outcome=>
                    outcome.snapshot_fingerprint===member.snapshot_fingerprint && outcome.horizon==="60m")
                    .map(outcome=>({id:outcome.id,status:outcome.status,coverage:outcome.payload_json.canonical_provider_coverage}))})),
              }];
            });
            assert.equal(remainingMissingness.reduce((sum,row)=>sum+row.missing_count,0),heldRead.missing_outcome_count);
            const continuedCharter=nextRead.learning.full_charter;
            const continuedHeld=continuedCharter.partitions.find(partition=>partition.partition==="held_out");
            assert.equal(continuedHeld.original_population_count,heldRead.original_population_count);
            assert.equal(continuedHeld.original_membership_fingerprint,heldRead.original_membership_fingerprint);
            assert.equal(continuedCharter.computed_disposition,"evidence_incomplete");
            assert.equal(continuedCharter.terminal_quality_decision,null);
            fullOriginalHistoryEvidence.original_outcome_continuation={
              scope:"synthetic_actual_unselected_outcome_route_sql_sdk_not_quality_or_live",
              passes:continuationPasses,separate_synthetic_requests:externalRequests-continuationStart,
              original_decisions:completeSource.scanRuns.length,original_population_count:heldRead.original_population_count,
              canonical_outcome_count:heldRead.canonical_outcome_count,missing_outcome_count:heldRead.missing_outcome_count,
              persisted_neither_horizon_marks_verified:measuredNeither.length,
              remaining_missingness:remainingMissingness,
              original_full_charter:{
                disposition:continuedCharter.computed_disposition,
                original_population_count:continuedHeld.original_population_count,
                enrolled_decision_count:continuedHeld.enrolled_decision_count,required_decisions:continuedHeld.required_decisions,
                trading_day_count:continuedHeld.quality.trading_day_count,
                outcome_coverage:continuedHeld.quality.outcome_coverage,
                evidence_missingness:continuedHeld.quality.evidence_missingness,
                baseline_precision:continuedHeld.quality.baseline.precision_at_3,
                challenger_precision:continuedHeld.quality.challenger.precision_at_3,
                paired_precision_interval:continuedHeld.quality.paired_precision_interval,
                thresholds:continuedHeld.thresholds.checks,
                missing_dimensions:continuedHeld.missing_dimensions,
                measured_limit_failures:continuedHeld.measured_limit_failures,
                terminal_quality_decision:null,quality_improvement_claimed:false,
              },
              physical_outcomes:completeSource.outcomes.length,
              original_batch_count:originalBatches.length,unvisited_original_batches:unvisited,
              original_source_read:sourceRead??null,
              original_member_fingerprint:heldRead.original_membership_fingerprint,
              enrolled_coverage_diagnostic:{reason_counts:reasonCounts,members:enrolledCoverage},
              // Retain EVERY original identity and missingness reason without
              // duplicating full ranking/charter objects in the CLI transport.
              original_decision_coverage:nextRead.learning.legacy_baseline_readiness.relative_plan_context_outcomes.map(comparison=>({
                scan_run_fingerprint:comparison.scan_run_fingerprint,
                candidates:comparison.candidates.map(row=>({candidate_id:row.candidate_id,ticker:row.ticker,
                  snapshot_fingerprint:row.snapshot_fingerprint,outcome_id:row.outcome_id,
                  outcome_status:row.outcome_status,outcome_reason:row.outcome_reason,
                  terminal_outcome:row.terminal_outcome,r_result:row.r_result})),
              })),
              terminal_quality_decision:null,quality_improvement_claimed:false,
            };
            fullOriginalHistoryEvidence.total_separate_synthetic_data_requests=setupRequests+externalRequests;
          }
        }
      }
    }
    const beforeCleanup=externalRequests;
    clock=OriginalDate.parse(expiry)+20000;
    // First exercise automatic expiry while the fixture's series flag is still on.
    const expired=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:nextSlot})}),
      {deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(expired.status,204);
    process.env.TURE_OBSERVATION_SERIES_ENABLED="false";
    const disabled=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:nextSlot})}),
      {deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(disabled.status,204); assert.equal(externalRequests,beforeCleanup);
    assert.equal(Number(sql("select count(*) from scheduled_scan_attempts;")),attemptFingerprints.size);
    const tickerCoverage=[...observations.values()].sort((a,b)=>a.ticker.localeCompare(b.ticker));
    originalLog(JSON.stringify({evidence_mode:"synthetic_closed_packaged_input_runtime_actual_source_schema",
      scenario:fullOriginalHistorySetup?"full_session_original_universe_history_preparation":existingPremarketSetup?"full_session_existing_premarket_preparation":"full_session_cold_rotation",acquisition_mode:omittedPairBaseline?"otherwise_omitted_first_pair_guard":acquisitionBaseline?"original_order":firstObservationBaseline?"first_observation_guard":minimumOrderBaseline?"minimum_requests_first":fairOrderBaseline?"fair_cost_ties":firstClosedBarBaseline?"original_order_first_closed_bar":"original_order_regular_session_reuse",
      baseline_revision:acquisitionBaselineRevision,minimum_order_baseline_revision:minimumOrderBaselineRevision,
      original_slots:26,original_member_observations:26*8,eligible_tickers:eligible,slots,ticker_coverage:tickerCoverage,
      selected_unique_tickers:tickerCoverage.length,ever_complete_tickers:tickerCoverage.filter(ticker=>ticker.fresh>0).length,
      never_complete_tickers:tickerCoverage.filter(ticker=>ticker.fresh===0).map(ticker=>ticker.ticker),
      unselected_eligible_tickers:eligible.filter(ticker=>!observations.has(ticker)),
      fresh_member_observations:slots.reduce((sum,item)=>sum+item.fresh_members,0),
      revisit_missing_observations:tickerCoverage.reduce((sum,item)=>sum+item.revisit_missing,0),
      attempts:attemptFingerprints.size,cycles:cycles.length,scan_runs:runFingerprints.size,
      reservations:totalClaims.length,reserved_credits:totalClaims.reduce((sum,claim)=>sum+claim.requested_credits,0),
      setup_synthetic_requests:setupRequests,scheduled_synthetic_requests:scheduledRequests,
      synthetic_benchmark_requests:externalBenchmarkRequests,restarted_owner_read:true,wrong_owner_runs:0,
      ...(prospectiveEnrollment?{prospective_enrollment_evidence:enrollmentEvidence}:{}),
      ...(existingPremarketSetup?{existing_premarket_evidence:existingPremarketEvidence}:{}),
      ...(lateOriginalOutcomes?{late_original_outcome_evidence:lateOutcomeEvidence}:{}),
      ...(fullOriginalHistorySetup?{full_original_history_evidence:fullOriginalHistoryEvidence}:{}),
      ...(historyPreparationApp?{history_app_boundary_evidence:historyAppBoundaryEvidence}:{}),
      actual_provider_requests:0,production_actions:0,publications:0,broker_actions:0,cleanup:"inert"}));
  } else {
  clock = OriginalDate.parse(slot) + 20000;
  if(contextLatency) durationStartedAt = performance.now();
  const response = await scheduler(new Request("http://closed-scheduler", {method:"POST", body:JSON.stringify({next_run:expiry})}), {deploy:{id:identity.deploy_id,context:"production",published:true}});
  const boundedDurationMs = durationStartedAt === null ? null : Math.round(performance.now() - durationStartedAt);
  durationStartedAt = null;
  const body = await response.json();
  assert.equal(pendingSyntheticTransports,0,"All owned transports must settle before terminal readback");
  const rows = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from scheduled_scan_attempts t;"));
  const receipts = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from observation_cycle_receipts t;"));
  const scanRuns = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from recommendation_scan_runs t;"));
  const record = scanRuns[0]?.payload_json.candidate_decision_record;
  const lineage = scanRuns[0]?.payload_json.decision_lineage_receipt;
  const claims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
  const researchSnapshots=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_snapshots t;"));
  if(relativePlan60m || publishedOriginalLearning || nextSessionOutcomes) futureOutcomePlans=researchSnapshots.map((snapshot,index)=>({...snapshot,synthetic_win:index%2===0}));
  let outcomeChainEvidence = null;
  let charterCompositionEvidence = null;
  if(wrongPolicy) {
    assert.equal(response.status,503);
    assert.equal(externalRequests,0);
    assert.equal(claims.length,0);
    assert.equal(scanRuns.length,0);
  } else if(staleBenchmark) {
    assert.equal(response.status,500,JSON.stringify({body,logs:logs.slice(-15)}));
    assert.equal(rows.length,1); assert.equal(receipts.length,1);
    assert.notEqual(rows[0].outcome,"scanned");
    assert.equal(scanRuns.length,0); assert.equal(researchSnapshots.length,0);
    assert.equal(claims.length,1); assert.equal(claims[0].requested_credits,8);
    assert.equal(claims[0].status,"failed"); assert(claims[0].finalized_at);
    assert.equal(externalRequests,8);
    assert.equal(Number(sql("select count(*) from recommendations;")),0);
    assert(logs.some(items=>JSON.stringify(items).includes("market_regime_completed_daily_input_unavailable")));
  } else if(acquisitionRateLimit) {
    assert.equal(response.status,500);
    assert.equal(rows.length,1); assert.equal(receipts.length,1);
    assert.equal(rows[0].skip_reason,"provider_rate_limited");
    assert.equal(receipts[0].cycle_status,"rejected");
    assert.equal(receipts[0].receipt_json.disposition,"rejected_data");
    assert.equal(scanRuns.length,0); assert.equal(researchSnapshots.length,0);
    assert.equal(claims.length,1); assert.equal(claims[0].requested_credits,8);
    assert.equal(claims[0].status,"failed"); assert(claims[0].finalized_at);
    assert.equal(externalRequests,intradayRateLimit ? 4 : 3);
    assert(boundedDurationMs < 10000,"Early scanner failure must not wait for the route deadline");
    assert.equal(Number(sql("select count(*) from recommendations;")),0);
  } else if(expectContextTimeout) {
    assert.equal(response.status,200);
    assert.equal(rows.length,1); assert.equal(receipts.length,1);
    assert.equal(rows[0].skip_reason,"timeout_budget_exceeded");
    assert.equal(receipts[0].cycle_status,"failed");
    assert.equal(receipts[0].receipt_json.discovery_evaluation.raw_candidate_count,3);
    assert.equal(receipts[0].receipt_json.discovery_evaluation.ranked_count,0);
    assert.equal(scanRuns.length,0); assert.equal(researchSnapshots.length,0);
    assert.equal(claims.length,1); assert.equal(claims[0].requested_credits,8);
    assert.equal(claims[0].status,"failed"); assert(claims[0].finalized_at);
    assert.equal(externalRequests,8);
    assert.equal(Number(sql("select count(*) from recommendations;")),0);
  } else {
    assert.equal(response.status,200,JSON.stringify({body,logs:logs.slice(-15)}).slice(-12000));
    assert.equal(rows.length,1);
    assert.equal(receipts.length,1);
    assert.equal(receipts[0].cycle_status,"completed");
    assert.equal(scanRuns.length,1);
    assert.equal(claims.length,1);
    assert.equal(claims[0].requested_credits,8);
    assert.equal(claims[0].status,"completed");
    assert(claims[0].finalized_at);
    assert.equal(externalRequests,8);
    const regimeEvidence=scanRuns[0].payload_json.market_regime?.input_evidence;
    assert.equal(regimeEvidence?.policy_version,"completed_daily_market_regime_input_v1",
      "Original benchmark source policy must survive actual database persistence");
    for (const symbol of ["spy","qqq"]) {
      assert.equal(regimeEvidence[symbol].latest_completed_market_date,"2026-09-30");
      assert.equal(regimeEvidence[symbol].latest_completed_at,"2026-09-30T20:00:00.000Z");
      assert(regimeEvidence[symbol].response_identity.payload_byte_length>0);
      assert.match(regimeEvidence[symbol].content_sha256,/^sha256:[a-f0-9]{64}$/);
      assert(OriginalDate.parse(regimeEvidence[symbol].captured_at)<=OriginalDate.parse(record.decision_timestamp));
    }
    if (partialBenchmark) {
      assert.equal(scanRuns[0].payload_json.market_regime.spy.close,101);
      assert.equal(scanRuns[0].payload_json.market_regime.regime,"risk_off");
      assert.equal(regimeEvidence.spy.candles.length,59);
    }
    // Actual restarted SDK + owner decoder, not only direct SQL inspection.
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const benchmarkReader=require(join(generated,"reader.cjs"));
    const benchmarkRead=await benchmarkReader.readRecommendationLearningBaselineSource(owner);
    const benchmarkSource=benchmarkReader.parseRecommendationLearningBaselineSource(benchmarkRead.data);
    assert(benchmarkSource && benchmarkSource.scanRuns.length===1);
    assert.deepEqual(benchmarkSource.scanRuns[0].payload_json.market_regime.input_evidence,regimeEvidence);
    const benchmarkWrongOwner=await benchmarkReader.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
    assert.equal(benchmarkWrongOwner.data.recommendation_scan_runs.length,0);
    const cycle=readers.buildObservationCycleReadback(receipts);
    assert.equal(cycle.status,"available");
    assert.equal(cycle.invalid_row_count,0);
    assert.equal(record.record_version,"candidate_decision_record_v4");
    assert.equal(record.candidates.length,8);
    assert.equal(record.versions.input_policy_version,"completed_daily_intraday_input_v1");
    assert.equal(record.final_decision.disposition,publicationClock && !closing?"recommendations_published":"no_trade");
    if(closing) {
      assert.equal(scanRuns[0].payload_json.analysis_policy_version,"regular_session_analysis_v1");
      assert.equal(scanRuns[0].payload_json.power_hour_publish_allowed,false);
      assert.equal(record.final_decision.no_trade_reason,"power_hour_publication_withheld");
      assert.equal(Number(sql("select count(*) from recommendations;")),0);
      assert.equal(researchSnapshots.length,3);
      assert.deepEqual(readers.candidateDecisionRecordFromScanRun(scanRuns[0]),record);
      assert.deepEqual(readers.decisionLineageReceiptFromScanRun(scanRuns[0],record),lineage);
      for(const row of researchSnapshots) {
        assert.equal(row.source_mode,"research_only");
        assert.equal(row.status,"hidden");
        assert.equal(row.recommendation_id,null);
        const candidate=record.candidates.find(c=>c.candidate_id===row.payload_json.candidate_id);
        assert(candidate && candidate.data.freshness==="fresh");
        assert.deepEqual(row.payload_json.scanner_decision_input_snapshot,candidate.data.input_snapshot);
      }
      delete require.cache[require.resolve(join(generated,"reader.cjs"))];
      const restarted=require(join(generated,"reader.cjs"));
      const read=await restarted.readRecommendationLearningBaselineSource(owner);
      const source=restarted.parseRecommendationLearningBaselineSource(read.data);
      assert(source);
      assert.equal(source.snapshots.length,3);
      assert.equal(source.outcomes.length,0,"Late inputs cannot fabricate complete future horizons");
      assert.equal(source.scanRuns.length,1);
      assert.deepEqual(restarted.candidateDecisionRecordFromScanRun(source.scanRuns[0]),record);
      const readiness=restarted.buildRecommendationLearningBaselineReadiness(source);
      assert.equal(readiness.status,"not_ready");
      assert.equal(Object.values(readiness.decision_population).slice(0,4).reduce((sum,count)=>sum+count,0),8);
      const wrongOwner=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
      assert.equal(wrongOwner.data.recommendation_snapshots.length,0);
      assert.equal(wrongOwner.data.recommendation_scan_runs.length,0);
    }
    if(pointInTimeContext) {
      const context = scanRuns[0].payload_json.market_regime_context;
      assert(context,"Observed synthetic benchmark classification must reach the original run");
      assert(OriginalDate.parse(context.captured_at)<=OriginalDate.parse(record.decision_timestamp),
        `Original context must precede decision: captured=${context.captured_at}, decision=${record.decision_timestamp}`);
      if(publicationClock) assert(researchSnapshots.length>0,
        "Published or hidden research snapshots must exercise the original context binding");
      else assert.equal(researchSnapshots.length,0,"Unavailable plans must not manufacture research snapshots");
      for(const snapshot of researchSnapshots) assert.deepEqual(snapshot.payload_json.market_regime_context,context,
        "Each original snapshot must share the exact original run context, not a later reconstructed clock");
      originalLog(JSON.stringify({point_in_time_market_context_proof:"passed",context_captured_at:context.captured_at,
        original_decision_at:record.decision_timestamp,snapshot_count:researchSnapshots.length,
        final_disposition:record.final_decision.disposition,actual_provider_requests:0,production_actions:0}));
    }
    if(publicationClock && !closing) {
      const published=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendations t;"));
      assert(published.length>0,JSON.stringify({body,logs:logs.slice(-30)}).slice(-16000));
      syntheticPublicationCount=published.length;
      assert.deepEqual(readers.candidateDecisionRecordFromScanRun(scanRuns[0]),record);
      assert.deepEqual(readers.decisionLineageReceiptFromScanRun(scanRuns[0],record),lineage);
      assert.equal(record.decision_clock?.contract_version,"pre_publication_decision_clock_v1");
      for(const row of published) {
        const candidate=record.candidates.find(c=>c.ticker===row.ticker && c.disposition==="published");
        assert(candidate?.data.input_snapshot);
        if(publishedOriginalLearning) {
          const originalSnapshot=benchmarkSource.snapshots.find(snapshot=>snapshot.recommendation_id===row.id);
          assert(originalSnapshot,"The original published snapshot must survive the restarted owned reader");
          assert.deepEqual(originalSnapshot.payload_json.scanner_decision_input_snapshot,candidate.data.input_snapshot,
            "Publication must not discard its original normalized decision inputs");
          assert.equal(originalSnapshot.payload_json.decision_timestamp,record.decision_timestamp);
        }
        assert.equal(candidate.data.freshness,"fresh");
        assert.deepEqual(candidate.data.gap_codes,[]);
        for(const [column,feature] of [["entry_low","proposed_entry_low"],["entry_high","proposed_entry_high"],
          ["stop_loss","proposed_stop_loss"],["target_1","proposed_target_1"]]) {
          assert.equal(Number(row[column]),candidate.data.input_snapshot.features[feature]);
        }
        assert(OriginalDate.parse(record.decision_timestamp)<=OriginalDate.parse(row.created_at),
          `Explicit decision must precede publication: decision=${record.decision_timestamp}, published=${row.created_at}`);
        assert(OriginalDate.parse(row.created_at)<=OriginalDate.parse(scanRuns[0].completed_at),
          `Publication precedes completion: published=${row.created_at}, completed=${scanRuns[0].completed_at}, modeled=${new Date().toISOString()}`);
      }
      assert(OriginalDate.parse(record.decision_clock.input_capture_timestamp)<=OriginalDate.parse(record.decision_timestamp));
      assert.equal(record.coverage.pre_truncation_capture_evidence.point_in_time_cutoff,record.decision_timestamp);
      for(const key of ["input_capture_timestamp","decision_timestamp","contract_version"]) {
        const changed=structuredClone(scanRuns[0]);
        changed.payload_json.candidate_decision_record.decision_clock[key]="untrusted-clock";
        assert.equal(readers.candidateDecisionRecordFromScanRun(changed),null);
      }
      originalLog(JSON.stringify({publication_clock_proof:"passed",synthetic_publication_count:published.length,
        decision_timestamp:record.decision_timestamp,published_at:published.map(row=>row.created_at),
        completed_at:scanRuns[0].completed_at,actual_provider_requests:0,production_actions:0}));
    }
    assert.equal(scanRuns[0].payload_json.scanner_clock_prior_shadow_comparison ?? null,null);
    assert.equal(scanRuns[0].payload_json.scanner_intraday_liquidity_shadow_comparison ?? null,null);
    assert.equal(record.candidates.filter(c=>c.data.freshness==="fresh").length,
      missingLatestVolume?0:mixedHistory?(minimumOrderBaseline&&!invalidMixedHistory?5:3):cold?3:6);
    if(fractionalPrice) {
      const observed=record.candidates.filter(candidate=>candidate.data.freshness==="fresh");
      assert.equal(observed.length,3,"Valid fractional-price sources must remain fully observed without extra requests");
      for(const member of observed) {
        assert.equal(member.data.input_snapshot.features.latest_close,100.0041);
        assert.equal(member.data.input_snapshot.intraday_indicators.latestPrice,100.0041);
        assert.equal(member.data.input_snapshot.intraday_indicators.priceBasis,"provider_closed_bar_price_v1");
      }
      assert.deepEqual(readers.candidateDecisionRecordFromScanRun(scanRuns[0]),record);
      const originalCache=sql("select jsonb_agg(to_jsonb(t) order by ticker) from scanner_cache t;");
      const selection=readers.buildRealScannerBaseCandidateSelection({scanWindow:readers.getIntradayScanWindow(new Date(slot)),
        requestedScanBudget:8,selectionMode:"scheduled_rotating",now:new Date(slot)}).candidates;
      assert.deepEqual(selection.map(row=>row.ticker),record.candidates.map(row=>row.ticker));
      const requestedBefore=externalRequests;
      const noAcquisition={source:"scheduled",maxFreshProviderCalls:0,freshProviderCallPacingMs:0,
        completedDailyContextPolicyVersion:"completed_daily_intraday_input_v1"};
      for(const restart of [false,true]) {
        if(restart) delete require.cache[require.resolve(join(generated,"reader.cjs"))];
        const consumer=restart?require(join(generated,"reader.cjs")):readers;
        const cached=await consumer.scanMarket(selection,noAcquisition);
        const fresh=cached.filter(row=>row.current_session_evidence && row.intraday_indicator_stale===false);
        assert.deepEqual(fresh.map(row=>row.ticker).sort(),observed.map(row=>row.ticker).sort());
        for(const candidate of fresh) {
          assert.equal(candidate.latest_close,100.0041);
          assert.equal(candidate.intraday_indicators.latestPrice,100.0041);
          assert.equal(candidate.intraday_indicators.priceBasis,"provider_closed_bar_price_v1");
        }
        assert.equal(externalRequests,requestedBefore);
        assert.equal(sql("select jsonb_agg(to_jsonb(t) order by ticker) from scanner_cache t;"),originalCache);
      }
      const priorClock=clock;
      clock+=360000;
      const stale=await require(join(generated,"reader.cjs")).scanMarket(selection,noAcquisition);
      assert(stale.every(row=>!row.current_session_evidence && row.latest_close===undefined),
        "Exact price precision must not grant stale current-price permission");
      assert.equal(externalRequests,requestedBefore);
      clock=priorClock;
      originalLog(JSON.stringify({fractional_price_fitness:"passed",original_population_count:8,
        fresh_inputs:observed.length,retained_latest_price:100.0041,scheduled_synthetic_requests:externalRequests,
        fresh_cache_and_restart_exact_price:true,cache_rows_unchanged:true,stale_reuse_blocked:true,
        actual_provider_requests:0,production_actions:0,quality_improvement_claimed:false}));
    }
    if(missingLatestVolume) {
      assert.equal(researchSnapshots.length,0,"A missing provider volume cannot create completed-input research sources");
      assert(record.candidates.every(candidate => !candidate.data.input_snapshot ||
        candidate.data.input_snapshot.current_session === null &&
        candidate.data.input_snapshot.intraday_indicators === null &&
        candidate.data.input_snapshot.features.latest_close === null),
        "Missing volume must not be normalized into a complete decision input");
    }
    assert(record.candidates.every(c=>c.data.source_timestamp===null || Date.parse(c.data.source_timestamp)<=Date.parse(record.decision_timestamp)));
    assert.equal(lineage.scan_run_fingerprint,scanRuns[0].run_fingerprint);
    if(diagnoseOutcomes) {
      assert.equal(researchSnapshots.length,cold?3:6,
        "Fresh, non-published versioned inputs must retain research sources throughout the regular session");
      for(const row of researchSnapshots) {
        const payload=row.payload_json, decision=record.candidates.find(c=>c.candidate_id===payload.candidate_id);
        assert(decision);
        assert.equal(OriginalDate.parse(row.recommended_at),OriginalDate.parse(record.decision_timestamp));
        assert.equal(row.status,"hidden");
        assert.equal(row.source_mode,"research_only");
        assert.equal(row.recommendation_id,null);
        assert.equal(payload.research_capture_version,"completed_input_research_capture_v1");
        assert.equal(payload.scanner_input_policy_version,"completed_daily_intraday_input_v1");
        assert.deepEqual(payload.scanner_decision_input_snapshot,decision.data.input_snapshot);
        assert.equal(payload.data_timestamp,decision.data.source_timestamp);
        assert.notEqual(payload.clock_prior_shadow_evidence_sample,true);
        assert.notEqual(payload.intraday_liquidity_shadow_evidence_sample,true);
        const quality=row.intake_quality_json;
        assert.equal(quality?.result_kind,"recommendation_intake_quality");
        assert.equal(quality.result_version,"1.2");
        assert.equal(quality.status,"incomplete");
        assert.equal(quality.grade,"unknown");
        assert.equal(quality.accepted_for_visible_list,false);
        assert.equal(quality.checks.find(check=>check.check_id==="liquidity_spread")?.status,"incomplete");
        assert(quality.warnings.some(warning=>warning.reason_id==="spread_unavailable"),
          "Absent original spread must remain unknown, never a passing research liquidity assessment");
        assert.equal(quality.result_id,`recommendation-intake-research-${payload.candidate_id}`);
        assert.equal(quality.recommendation_id,null);
        assert.equal(quality.internal_only,true);
        assert.equal(quality.ticker,row.ticker);
        assert.equal(quality.direction,"long");
        assert.equal(quality.evaluated_at,record.decision_timestamp);
        assert.equal(quality.data_age_minutes,
          Math.max(0,Math.round((OriginalDate.parse(record.decision_timestamp)-OriginalDate.parse(payload.data_timestamp))/60000)),
          "Intake diagnostics retain whole-minute age semantics; source timestamps remain exact");
        assert.equal(quality.risk_reward_ratio,(row.target-row.entry)/(row.entry-row.stop));
        assert.equal(quality.checks.find(check=>check.check_id==="duplicate_risk")?.status,"not_applicable");
        assert.equal(quality.checks.find(check=>check.check_id==="risk_controls_context")?.status,"not_applicable");
        const average=payload.scanner_decision_input_snapshot.intraday_indicators.averageVolume;
        if(average!==null && average>0 && average<50000)
          assert(quality.warnings.some(warning=>warning.reason_id==="volume_low"),"Original low-volume evidence must survive assessment");
        if(zeroLatestVolume)
          assert(quality.warnings.some(warning=>warning.reason_id==="volume_contracting"),
            "Original latest zero must reach intake as weak current volume, not an older positive bar");
      }
      // Adversarial source admission on the actual persisted v4 decision, not
      // a parallel fabricated decision schema. Full runtime happy path above.
      const candidateInputs=researchSnapshots.map(row=>{
        const p=row.payload_json,f=p.scanner_decision_input_snapshot.features;
        return {ticker:row.ticker,company_name:row.company_name,sector:p.sector,
          setup_type:p.setup_type,tier:p.tier,score:{value:row.score,reasons:[],warnings:[],tier:p.tier},signals:[],warnings:[],
          data_source:p.market_data_source,provider_source:p.provider_source,market_data_timestamp:p.data_timestamp,
          reference_price_timestamp:p.data_timestamp,stale:false,intraday_indicator_response_identity:p.intraday_indicator_response_identity,
          decision_feature_vector:p.decision_feature_vector,
          entry_low:f.proposed_entry_low,entry_high:f.proposed_entry_high,stop_loss:f.proposed_stop_loss,
          target_1:f.proposed_target_1,target_2:f.proposed_target_2,risk_reward:f.proposed_risk_reward};
      });
      const select=(r=record,c=candidateInputs,excluded=[])=>readers.selectCompletedInputResearchSamples({record:r,candidates:c,excludedTickers:excluded,maxSamples:8});
      assert.equal(select().length,researchSnapshots.length);
      assert.equal(select(record,candidateInputs,[candidateInputs[0].ticker]).length,researchSnapshots.length-1);
      const mutations=[
        r=>{r.candidates.find(c=>c.ticker===candidateInputs[0].ticker).candidate_id="wrong";},
        r=>{r.candidates.find(c=>c.ticker===candidateInputs[0].ticker).data.input_snapshot.current_session.symbol="OTHER";},
        r=>{r.candidates.find(c=>c.ticker===candidateInputs[0].ticker).data.freshness="stale";},
        r=>{r.candidates.find(c=>c.ticker===candidateInputs[0].ticker).data.source_timestamp="2026-10-01T18:00:00.000Z";},
        r=>{r.candidates.find(c=>c.ticker===candidateInputs[0].ticker).data.input_snapshot.features.proposed_stop_loss=1;},
        r=>{r.candidates.push(structuredClone(r.candidates.find(c=>c.ticker===candidateInputs[0].ticker)));},
      ];
      for(const mutate of mutations) {const r=structuredClone(record);mutate(r);assert.equal(select(r).length,researchSnapshots.length-1);}
      for(const mutate of [c=>{c[0].stale=true;},c=>{c[0].reference_price_timestamp="2026-10-01T17:20:00.000Z";},
        c=>{c[0].stop_loss=1;},c=>{c[0].decision_feature_vector.feature_values.latest_price=1;},
        c=>{c[0].intraday_indicator_response_identity.payload_sha256=`sha256:${"f".repeat(64)}`;},
        c=>{c.push(structuredClone(c[0]));}]) {
        const c=structuredClone(candidateInputs);mutate(c);assert.equal(select(record,c).length,researchSnapshots.length-1);
      }
      assert.deepEqual(select({...record,record_version:"candidate_decision_record_v3"}),[]);
      assert.deepEqual(select({...record,decision_timestamp:"2026-10-01T20:00:00.000Z"}),[]);
    }
    if (zeroLatestVolume) {
      const fresh = record.candidates.filter(candidate => candidate.data.freshness === "fresh");
      assert.equal(fresh.length, 3);
      for (const candidate of fresh) {
        const indicators = candidate.data.input_snapshot.intraday_indicators;
        assert.equal(indicators.latestVolume, 0, "Original latest zero volume must survive persisted decision inputs");
        // The opening slot has only three closed bars; later slots have the
        // full twelve-bar descriptive window. Neither implies a 24-bar ratio.
        const meanBars = opening ? 3 : 12;
        assert.equal(indicators.averageVolume, Math.round(1000 * (meanBars - 1) / meanBars),
          "The mean must retain zero and the actual opening/later observation count");
        assert.equal(indicators.recentVolumeRatio, null);
        assert.equal(indicators.volumeTrend, "unknown");
      }
    }
    // Restart the actual owner reader independently of mutable scanner caches.
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const restarted=require(join(generated,"reader.cjs"));
    const ownerRead=await restarted.readRecommendationLearningBaselineSource(owner);
    assert.equal(ownerRead.status,"available");
    assert.equal(ownerRead.data.recommendation_scan_runs.length,1);
    const restored=restarted.recommendationScanRunFromPersistenceRow(ownerRead.data.recommendation_scan_runs[0]);
    assert.deepEqual(restarted.candidateDecisionRecordFromScanRun(restored),record);
    assert.deepEqual(restarted.decisionLineageReceiptFromScanRun(restored,record),lineage);
    const otherRead=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
    assert.equal(otherRead.status,"available");
    assert.equal(otherRead.data.recommendation_scan_runs.length,0);
    if(publishedOriginalLearning) {
      const originalSource=restarted.parseRecommendationLearningBaselineSource(ownerRead.data);
      assert(originalSource);
      assert.equal(originalSource.snapshots.length,3);
      assert(originalSource.snapshots.every(snapshot=>snapshot.is_visible && snapshot.recommendation_id));
      for(const snapshot of originalSource.snapshots) {
        const provenance=restarted.recommendationResearchLearningSourceProvenance(snapshot,originalSource.scanRuns);
        assert.equal(provenance.status,"admissible",JSON.stringify(provenance));
        assert.equal(provenance.original_decision_timestamp,record.decision_timestamp);
        assert.equal(provenance.source_timestamp,snapshot.payload_json.original_source_timestamp);
        assert.notEqual(provenance.decision_timestamp,provenance.original_decision_timestamp,
          "Publication must retain its distinct real clock");
      }
      clock=OriginalDate.parse(futureBoundary);
      const before=externalRequests;
      const evaluate=()=>require(join(generated,"outcome-route.cjs")).POST(new Request("http://closed-fixture/api/recommendations/evaluate-outcomes",{
        method:"POST",headers:{"x-automation-secret":environment.AUTOMATION_SECRET,"Content-Type":"application/json"},
        body:JSON.stringify({mode:"official_live_today",horizons:["60m"],max_candle_requests:3,max_batches:1}),
      }));
      // Real persisted mutations must stop at the loader before acquisition.
      for(const fault of ["entry_low","risk_per_share","original_source_timestamp","decision_timestamp","published_input_capture_version","scanner_decision_input_snapshot"]) {
        const value=["entry_low","risk_per_share"].includes(fault) ? "0" : JSON.stringify(
          ["published_input_capture_version","scanner_decision_input_snapshot"].includes(fault) ? "unknown_capture" : "2026-10-01T20:00:00.000Z");
        sql(`update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{${fault}}','${value}'::jsonb);`);
        const response=await evaluate(),result=await response.json();
        assert.equal(response.status,200,JSON.stringify(result));
        assert.equal(result.eligible_snapshot_count,0,JSON.stringify(result));
        assert.equal(externalRequests,before);
        for(const row of researchSnapshots) sql(`update recommendation_snapshots set payload_json='${JSON.stringify(row.payload_json).replaceAll("'","''")}'::jsonb where id='${row.id}';`);
      }
      sql("update recommendation_scan_runs set payload_json=payload_json-'decision_lineage_receipt';");
      const unbound=await evaluate(),unboundBody=await unbound.json();
      assert.equal(unbound.status,200);
      assert.equal(unboundBody.eligible_snapshot_count,0);
      assert.equal(externalRequests,before);
      sql(`update recommendation_scan_runs set payload_json='${JSON.stringify(scanRuns[0].payload_json).replaceAll("'","''")}'::jsonb where id='${scanRuns[0].id}';`);
      const result=await evaluate(),resultBody=await result.json();
      assert.equal(result.status,200,JSON.stringify(resultBody));
      const read=await restarted.readRecommendationLearningBaselineSource(owner);
      const source=restarted.parseRecommendationLearningBaselineSource(read.data);
      assert(source);
      const readiness=restarted.buildRecommendationLearningBaselineReadiness(source);
      const comparison=readiness.relative_plan_context_outcomes[0];
      assert.equal(resultBody.persistence_status,"success",JSON.stringify({status:resultBody.persistence_status,error:resultBody.persistence_error}));
      assert.equal(source.outcomes.length,3);
      assert.equal(externalRequests-before,3);
      assert.equal(comparison.original_population_count,8);
      assert.equal(comparison.canonical_outcome_count,3,JSON.stringify(comparison));
      assert.equal(comparison.missing_outcome_count,5);
      assert.equal(comparison.population_complete,false);
      assert.equal(comparison.precision_delta,null);
      assert.equal(comparison.quality_improvement_claimed,false);
      assert.equal(readiness.decision_time_source_provenance.completed_input_published_snapshot_count,3);
      assert.equal(readiness.status,"not_ready");
      const charter=restarted.buildRelativePlanCharterObservations({scanRun:source.scanRuns[0],source,now:new OriginalDate(clock)});
      assert(charter);
      assert.equal(charter.rows.length,8);
      for(const snapshot of source.snapshots) {
        const row=charter.rows.find(row=>row.candidate_id===snapshot.payload_json.candidate_id);
        assert.equal(row.metadata_scope.setup,"explicit_original_published_snapshot");
        assert.equal(row.setup,snapshot.type);
      }
      assert.equal(charter.status,"evidence_incomplete");
      assert.equal(charter.quality_improvement_claimed,false);
      const persisted=JSON.stringify(source.outcomes);
      delete require.cache[require.resolve(join(generated,"outcome-route.cjs"))];
      assert.equal((await evaluate()).status,200);
      assert.equal(externalRequests-before,3);
      assert.equal(JSON.stringify(restarted.parseRecommendationLearningBaselineSource((await restarted.readRecommendationLearningBaselineSource(owner)).data).outcomes),persisted);
      assert.equal((await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002")).data.recommendation_outcomes.length,0);
      assert.equal(Number(sql("select count(*) from recommendations;")),3);
      assert.equal(Number(sql("select count(*) from recommendation_snapshots where status='hidden';")),0);
      originalLog(JSON.stringify({published_original_learning_proof:"passed",original_population:8,
        canonical_published_outcomes:3,missing_original_members:5,separate_synthetic_outcome_requests:3,
        distinct_original_publication_clocks:true,restarted_owned_read:true,completed_repeat_requests:0,
        original_publications_unchanged:true,actual_provider_requests:0,production_actions:0,broker_actions:0,
        quality_improvement_claimed:false}));
      // Return to the existing original-slot deduplication assertion. Future
      // outcome acquisition is separately counted above, not scan budget.
      externalRequests=before;
      clock=OriginalDate.parse(slot)+20000;
    }
    if(diagnoseOutcomes) {
      assert.equal(ownerRead.data.recommendation_snapshots.length,researchSnapshots.length);
      assert.equal(otherRead.data.recommendation_snapshots.length,0);
      // A separate, explicit synthetic future boundary supplies outcome bars.
      // Exercise the real authenticated route, eligibility, runner, provider
      // adapter, persistence and owner readback; never flip stored visibility.
      clock=OriginalDate.parse(futureBoundary);
      const before=externalRequests;
      const outcomeMultiplier=nextSessionOutcomes?3:1;
      const evaluate=()=>require(join(generated,"outcome-route.cjs")).POST(new Request("http://closed-fixture/api/recommendations/evaluate-outcomes",{
        method:"POST",headers:{"x-automation-secret":environment.AUTOMATION_SECRET,"Content-Type":"application/json"},
        body:JSON.stringify({mode:"official_live_today",horizons:nextSessionOutcomes?["15m","30m","60m"]:[relativePlan60m ? "60m" : "15m"],max_candle_requests:4,max_batches:1}),
      }));
      // Persist a conflicting source timestamp, then exercise the real loader.
      // No provider call or outcome may occur; restore only these isolated rows.
      sql("update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{data_timestamp}','\"2026-10-01T20:00:00.000Z\"'::jsonb);");
      const rejected=await evaluate();
      const rejectedBody=await rejected.json();
      assert.equal(rejected.status,200);
      assert.equal(rejectedBody.eligible_snapshot_count,0);
      assert.equal(externalRequests,before);
      assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),0);
      for(const row of researchSnapshots) sql(`update recommendation_snapshots set payload_json='${JSON.stringify(row.payload_json).replaceAll("'","''")}'::jsonb where id='${row.id}';`);
      // Persisted execution geometry must remain the original decision plan,
      // not merely keep its midpoint while changing its entry bounds or R.
      for(const field of ["entry_low","entry_high","risk_per_share","reward_per_share","risk_reward"]) {
        if(field==="risk_reward") sql("update recommendation_snapshots set risk_reward=risk_reward+1;");
        else sql(`update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{${field}}',to_jsonb(coalesce((payload_json->>'${field}')::numeric,0)+1));`);
        const drifted=await evaluate(),driftedBody=await drifted.json();
        assert.equal(drifted.status,200);
        assert.equal(driftedBody.eligible_snapshot_count,0,`Stored ${field} drift must reject sources before outcome acquisition`);
        assert.equal(externalRequests,before);
        assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),0);
        for(const row of researchSnapshots) sql(`update recommendation_snapshots set risk_reward=${row.risk_reward},payload_json='${JSON.stringify(row.payload_json).replaceAll("'","''")}'::jsonb where id='${row.id}';`);
      }
      // A valid source without its exact durable lineage is not attributable.
      // Missing or cross-run lineage must stop before future candle acquisition.
      const originalRunPayload=scanRuns[0].payload_json;
      for(const invalidRunPayload of [
        Object.fromEntries(Object.entries(originalRunPayload).filter(([name])=>name!=="decision_lineage_receipt")),
        {...originalRunPayload,decision_lineage_receipt:{...originalRunPayload.decision_lineage_receipt,scan_run_fingerprint:"wrong_run"}},
      ]) {
        sql(`update recommendation_scan_runs set payload_json='${JSON.stringify(invalidRunPayload).replaceAll("'","''")}'::jsonb where id='${scanRuns[0].id}';`);
        const noLineage=await evaluate(),noLineageBody=await noLineage.json();
        assert.equal(noLineage.status,200);
        assert.equal(noLineageBody.eligible_snapshot_count,0,"Missing or wrong-run lineage must reject all input-attributed research sources");
        assert.equal(externalRequests,before);
        assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),0);
      }
      sql(`update recommendation_scan_runs set payload_json='${JSON.stringify(originalRunPayload).replaceAll("'","''")}'::jsonb where id='${scanRuns[0].id}';`);
      const outcomeResponse=await evaluate();
      const outcomeBody=await outcomeResponse.json();
      assert.equal(outcomeResponse.status,200,JSON.stringify({outcomeBody,logs:logs.slice(-5)}));
      const outcomes=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
      assert.equal(outcomes.length,Math.min(4,researchSnapshots.length)*outcomeMultiplier,JSON.stringify({status:outcomeBody.status,
        summary:outcomeBody.summary,eligible:outcomeBody.eligible_snapshot_count,reasons:outcomeBody.ineligible_reasons,
        batches:JSON.parse(sql("select coalesce(jsonb_agg(jsonb_build_object('id',id,'batch_type',batch_type,'status',status,'capture_version',payload_json->>'completed_input_research_capture_version')),'[]') from recommendation_batches;"))}));
      assert.equal(externalRequests-before,Math.min(4,researchSnapshots.length));
      assert(outcomes.every(row=>researchSnapshots.some(snapshot=>snapshot.snapshot_fingerprint===row.snapshot_fingerprint)));
      const futureRead=await restarted.readRecommendationLearningBaselineSource(owner);
      assert.equal(futureRead.data.recommendation_outcomes.length,outcomes.length);
      const otherFuture=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
      assert.equal(otherFuture.data.recommendation_outcomes.length,0);
      assert.equal(Number(sql("select count(*) from recommendation_snapshots where status <> 'hidden';")),0);
      outcomeChainEvidence={synthetic_future_boundary:futureBoundary,
        research_sources:researchSnapshots.length,persisted_outcomes:outcomes.length,
        separate_synthetic_outcome_requests:externalRequests-before,
        unobservable_population_members:8-researchSnapshots.length,
        outcome_budget_pending_sources:researchSnapshots.length-new Set(outcomes.map(row=>row.snapshot_fingerprint)).size};
      // The counts above describe the first four-request pass. Resume after a
      // route restart: finish only deferred sources, retaining the original
      // completed rows. A third pass must perform no acquisition or rewrite.
      if(nextSessionOutcomes) {
        clock=OriginalDate.parse("2026-10-05T17:30:20.000Z");
        process.env.TURE_DISABLE_SCHEDULED_FUNCTIONS="false";
        process.env.TURE_OBSERVATION_SERIES_ENABLED="false";
        const oldToday=await evaluate(),oldBody=await oldToday.json();
        assert.equal(oldToday.status,200);
        assert.equal(oldBody.eligible_snapshot_count,0,"The unchanged today's-only caller must reproduce the dated scope, not silently become historical");
        assert.equal(externalRequests-before,4);
        sql(`insert into recommendation_batches(id,batch_fingerprint,trading_date,owner_user_id,batch_type) values
          ('ture_backlog_other_owner','ture_backlog_other_owner','2026-10-01','00000000-0000-4000-8000-000000000002','official'),
          ('ture_backlog_expired','ture_backlog_expired','2026-09-28','${owner}','official'),
          ('ture_backlog_future','ture_backlog_future','2026-10-06','${owner}','official');`);
        const rejectedScopes=[];
        for(const fault of ["unknown_scope","direct_call","frozen_one_shot","frozen_series","global_disabled"]) {
          if(fault==="frozen_one_shot") process.env.TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED="true";
          if(fault==="frozen_series") process.env.TURE_OUTCOME_EVALUATION_SERIES_ENABLED="true";
          if(fault==="global_disabled") process.env.TURE_DISABLE_SCHEDULED_FUNCTIONS="true";
          const response=await require(join(generated,"outcome-route.cjs")).POST(new Request("http://closed-fixture/api/recommendations/evaluate-outcomes",{
            method:"POST",headers:{"x-automation-secret":environment.AUTOMATION_SECRET,"Content-Type":"application/json"},
            body:JSON.stringify({mode:"official_live_today",original_source_scope:fault==="unknown_scope"?"unknown":"trailing_seven_ny_dates_v1",
              ...(fault==="direct_call"?{}:{scheduled_function_fired_at_utc:"2026-10-05T17:30:20.000Z",
                scheduled_slot_at_utc:"2026-10-05T17:30:00.000Z",scheduled_outcome_evaluation_attempt_fingerprint:"scheduled_outcome_evaluation_scopefixture"})}),
          }));
          assert.equal(response.status,400,fault);
          assert.equal((await response.json()).code,"original_outcome_source_scope_invalid",fault);
          rejectedScopes.push(fault);
          process.env.TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED="false";
          process.env.TURE_OUTCOME_EVALUATION_SERIES_ENABLED="false";
          process.env.TURE_DISABLE_SCHEDULED_FUNCTIONS="false";
        }
        assert.equal(Number(sql("select count(*) from scheduled_outcome_evaluation_attempts;")),0);
        assert.equal(externalRequests-before,4);
        outcomeChainEvidence.cross_date_source_controls={same_day_predecessor_missing_sources:2,
          other_owner_excluded:true,expired_original_source_excluded:true,future_source_excluded:true,
          rejected_scopes:rejectedScopes,invalid_scope_requests:0};
      }
      delete require.cache[require.resolve(join(generated,"outcome-route.cjs"))];
      const invokeNextSession=()=>require(join(directory,"functions/scheduled-outcomes.cjs")).default(
        new Request("http://closed-fixture/.netlify/functions/scheduled-outcome-evaluation",{
          method:"POST",body:JSON.stringify({next_run:new OriginalDate(Math.floor(clock/900000)*900000+900000).toISOString()})}),
        {deploy:{id:identity.deploy_id,context:"production",published:true},site:{id:identity.site_id}});
      if(nextSessionOutcomes) {
        const waitForApiCap=async(expected)=>{
          for(let index=0;index<30;index++) {
            const response=await originalFetch(`${apiOrigin}/recommendation_outcomes?select=id`,{
              headers:{Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`}});
            if(response.ok && (await response.json()).length===expected) return;
            await syntheticDelay(100);
          }
          throw new Error(`isolated_api_row_cap_not_observed:${expected}`);
        };
        // Real PostgREST configuration, not a mocked SDK/store or invented
        // rows: the twelve already persisted labels exceed this API cap.
        sql("alter role authenticator set pgrst.db_max_rows='10'; notify pgrst,'reload config';");
        await waitForApiCap(10);
        const corruptRow=outcomes[0];
        if(!pagedOutcomeReads) sql(`update recommendation_outcomes set horizon='unknown' where id='${corruptRow.id}';`);
        const cappedResponse=await invokeNextSession(),cappedBody=await cappedResponse.json();
        if(pagedOutcomeReads) {
          assert.equal(cappedBody.status,"completed", "An API page boundary must not strand the exact pending original outcomes");
          assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),18);
          assert.equal(externalRequests-before,6);
          assert.equal(cappedBody.scheduled_outcome_evaluation_receipt.cost.candle_requests_executed,2);
          outcomeChainEvidence.cross_date_source_controls.complete_capped_outcome_read=true;
        } else {
          assert.equal(cappedResponse.status,200,JSON.stringify(cappedBody));
          assert.equal(cappedBody.persistence_error,"original_outcome_identity_invalid");
          assert.equal(cappedBody.status,"failed");
          assert.equal(cappedBody.scheduled_outcome_evaluation_receipt.failures.first_blocker,"original_outcome_identity_invalid");
          assert.equal(externalRequests-before,4);
          assert.equal(Number(sql("select count(*) from basic_free_discovery_credit_reservations where trading_date='2026-10-05';")),0);
          assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),12);
          sql(`update recommendation_outcomes set horizon='${corruptRow.horizon}' where id='${corruptRow.id}';`);
          sql("alter role authenticator set pgrst.db_max_rows='1000'; notify pgrst,'reload config';");
          await waitForApiCap(12);
          outcomeChainEvidence.cross_date_source_controls.invalid_original_outcome_rejected=true;
        }
        clock=OriginalDate.parse("2026-10-05T17:45:20.000Z");
      }
      const concurrentResponses=nextSessionOutcomes?await Promise.all([invokeNextSession(),invokeNextSession()]):null;
      if(concurrentResponses) assert.deepEqual(concurrentResponses.map(response=>response.status).sort(),[200,202]);
      const resumedResponse=concurrentResponses?concurrentResponses.find(response=>response.status===200):await evaluate(),resumedBody=await resumedResponse.json();
      assert.equal(resumedResponse.status,200,JSON.stringify(resumedBody));
      const resumedRows=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
      assert.equal(resumedRows.length,researchSnapshots.length*outcomeMultiplier,"Budget-deferred sources must resume");
      assert.equal(externalRequests-before,researchSnapshots.length,"Completed sources must not acquire data again");
      for(const initial of outcomes) assert.deepEqual(resumedRows.find(row=>row.id===initial.id),initial);
      const completedRows=resumedRows.sort((a,b)=>a.id.localeCompare(b.id));
      delete require.cache[require.resolve(join(generated,"outcome-route.cjs"))];
      const repeatedResponse=await (nextSessionOutcomes?invokeNextSession():evaluate()),repeatedBody=await repeatedResponse.json();
      assert.equal(repeatedResponse.status,200,JSON.stringify(repeatedBody));
      assert.equal(externalRequests-before,researchSnapshots.length);
      const repeatedRows=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
      assert.deepEqual(repeatedRows.sort((a,b)=>a.id.localeCompare(b.id)),completedRows);
      const resumedRead=await restarted.readRecommendationLearningBaselineSource(owner);
      assert.equal(resumedRead.status,"available",JSON.stringify(resumedRead));
      assert.equal(resumedRead.data.recommendation_outcomes.length,researchSnapshots.length*outcomeMultiplier);
      assert.equal((await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002")).data.recommendation_outcomes.length,0);
      outcomeChainEvidence.resumption={persisted_outcomes:resumedRows.length,
        additional_synthetic_outcome_requests:(resumedRows.length-outcomes.length)/outcomeMultiplier,
        completed_repeat_requests:0,prior_outcomes_unchanged:true};
      if(nextSessionOutcomes) {
        const attempts=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from scheduled_outcome_evaluation_attempts t;"));
        const credits=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t where trading_date='2026-10-05';"));
        assert.equal(attempts.length,2);
        const completedAttempt=attempts.find(attempt=>attempt.status==="completed" && attempt.receipt_json.cost.candle_requests_executed===2);
        assert(completedAttempt,JSON.stringify(attempts));
        assert.equal(completedAttempt.request_json.original_source_window.from_trading_date,"2026-09-29");
        assert.equal(completedAttempt.receipt_json.cost.candle_requests_executed,2);
        assert.equal(credits.length,1);
        assert.equal(credits[0].requested_credits,4);
        assert.equal(credits[0].status,"completed",JSON.stringify(credits));
        assert(credits[0].finalized_at && credits[0].provider_attempted);
        assert.equal(resumedBody.same_day_official_batch_revisit.same_day_official_batches_discovered,0);
        assert.equal(resumedBody.same_day_official_batch_revisit.original_source_read.original_batches_read,1);
        assert.equal(Number(sql("select count(*) from recommendation_batches;")),4);
        sql("delete from recommendation_batches where id in ('ture_backlog_other_owner','ture_backlog_expired','ture_backlog_future');");
        const lateRows=resumedRows.filter(row=>!outcomes.some(prior=>prior.id===row.id));
        assert.equal(lateRows.length,6);
        assert(lateRows.every(row=>row.evaluated_at.startsWith("2026-10-05") && row.created_at.startsWith("2026-10-05")),
          "Late original labels retain the actual later evaluation/record clock, never the original decision date");
        const lateRequests=syntheticRequestEvidence.filter(request=>request.requested_at.startsWith("2026-10-05"));
        assert.equal(lateRequests.length,2);
        assert(lateRequests.every(request=>request.start_date.startsWith("2026-10-01") && request.end_date.startsWith("2026-10-01")),
          "Recovery must request the original decision-day horizon, not current prices");
        clock=OriginalDate.parse("2026-10-05T18:00:20.000Z");
        delete require.cache[require.resolve(join(generated,"scheduled-outcome-evaluation-runtime.cjs"))];
        const completedResponse=await require(join(directory,"functions/scheduled-outcomes.cjs")).default(
          new Request("http://closed-fixture/.netlify/functions/scheduled-outcome-evaluation",{
            method:"POST",body:JSON.stringify({next_run:"2026-10-05T18:15:00.000Z"})}),
          {deploy:{id:identity.deploy_id,context:"production",published:true},site:{id:identity.site_id}});
        const completedBody=await completedResponse.json();
        assert.equal(completedResponse.status,200,JSON.stringify(completedBody));
        assert.equal(externalRequests-before,6);
        assert.equal(Number(sql("select count(*) from scheduled_outcome_evaluation_attempts;")),3);
        assert.equal(Number(sql("select count(*) from basic_free_discovery_credit_reservations where trading_date='2026-10-05';")),1);
        assert.deepEqual(JSON.parse(sql("select coalesce(jsonb_agg(t order by id),'[]') from recommendation_outcomes t;")),completedRows);
        if(pagedOutcomeReads) {
          const cappedRead=await restarted.readRecommendationLearningBaselineSource(owner);
          assert.equal(cappedRead.status,"available",JSON.stringify(cappedRead));
          assert.equal(cappedRead.data.recommendation_outcomes.length,18,
            "The restarted learning consumer must retain all outcomes while the cap is still ten");
          outcomeChainEvidence.cross_date_source_controls.capped_learning_read_complete=true;
          sql("alter role authenticator set pgrst.db_max_rows='1000'; notify pgrst,'reload config';");
          // Restore isolated configuration only after the restarted downstream
          // learning read has consumed all original labels under the cap.
          for(let index=0;index<30;index++) {
            const response=await originalFetch(`${apiOrigin}/recommendation_outcomes?select=id`,{
              headers:{Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`}});
            if(response.ok && (await response.json()).length===18) break;
            assert(index<29,"isolated_api_cap_cleanup_missing");
            await syntheticDelay(100);
          }
        }
        outcomeChainEvidence.resumption.next_session={policy_version:"trailing_seven_ny_dates_v1",
          original_date:"2026-10-01",evaluation_date:"2026-10-05",scheduled_attempts:3,
          reserved_credits:4,synthetic_requests:2,previous_outcomes_unchanged:true,
          repeat_requests:0,completed_next_slot_requests:0,original_horizon_retained:true,
          late_label_clock_retained:true,original_members:8};
        outcomeChainEvidence.cross_date_source_controls.concurrent_delivery_claims=1;
        process.env.TURE_DISABLE_SCHEDULED_FUNCTIONS="true";
        process.env.TURE_OBSERVATION_SERIES_ENABLED="true";
      }
      // Restarted owner read -> actual decoder -> actual baseline/evaluation
      // consumers. No source-version fabrication or readiness promotion.
      const learningEvidence=async()=>{
        const read=await restarted.readRecommendationLearningBaselineSource(owner);
        const source=restarted.parseRecommendationLearningBaselineSource(read.data);
        assert(source,"Actual owner read must decode all retained research rows");
        const readiness=restarted.buildRecommendationLearningBaselineReadiness(source);
        const segmentation=restarted.buildRecommendationLearningBaselineSegmentation(source);
        const plans=restarted.buildRecommendationLearningEvaluationPlans({...source,segmentation});
        assert.equal(plans.plans.length,1);
        assert.equal(plans.plans[0].outcome_population.research_primary_outcome_count,
          readiness.counterfactual_coverage.research_candidate_outcomes_collected);
        assert.equal(readiness.status,"not_ready");
        assert.equal(plans.plans[0].status,"not_freeze_eligible");
        assert.equal(plans.plans[0].metrics,null);
        assert(readiness.blockers.includes("completed_input_research_requires_prospective_baseline_contract"));
        assert.equal(readiness.decision_population.not_evaluated_candidate_count,
          record.candidates.filter(candidate=>candidate.disposition==="not_evaluated").length);
        assert.equal(Object.values(readiness.decision_population).slice(0,4).reduce((sum,count)=>sum+count,0),8,
          "The full candidate denominator survives; stale rejections are not mislabeled unobserved members");
        assert.equal(readiness.visible_outcomes.primary_outcome_count,0);
        assert.equal(readiness.confidence_calibration.numeric_probability_sample_count,0);
        return {source,readiness,plans};
      };
      const learning=await learningEvidence();
      if(nextSessionOutcomes) {
        const originalCutoff=restarted.buildRelativePlanCharterObservations({scanRun:learning.source.scanRuns[0],source:learning.source,
          now:new OriginalDate(futureBoundary)});
        assert.equal(originalCutoff.comparison.canonical_outcome_count,4,
          "Later recorded original labels cannot leak into an earlier as-of training/evaluation cut");
        assert.equal(originalCutoff.rows.length,8);
        assert.equal(originalCutoff.quality_improvement_claimed,false);
        outcomeChainEvidence.cross_date_source_controls.late_labels_excluded_from_original_cutoff=true;
      }
      const outcomeLink=learning.readiness.relative_plan_context_outcomes;
      assert.equal(outcomeLink.length,1);
      assert.equal(outcomeLink[0].contract_version,"relative_plan_context_canonical_outcomes_v1");
      assert.equal(outcomeLink[0].scan_run_fingerprint,record.scan_run_fingerprint);
      assert.equal(outcomeLink[0].original_population_count,8);
      assert.equal(outcomeLink[0].candidates.length,8);
      assert.equal(outcomeLink[0].selected_60m_receipt_count,relativePlan60m || nextSessionOutcomes ? researchSnapshots.length : 0);
      assert.equal(outcomeLink[0].canonical_outcome_count,relativePlan60m || nextSessionOutcomes ? researchSnapshots.length : 0,
        "A retained fifteen-minute outcome cannot replace the frozen sixty-minute primary horizon");
      assert.equal(outcomeLink[0].missing_outcome_count,relativePlan60m || nextSessionOutcomes ? 8-researchSnapshots.length : 8);
      assert.equal(outcomeLink[0].status,"evidence_incomplete");
      assert.equal(outcomeLink[0].population_complete,false);
      assert.equal(outcomeLink[0].baseline.precision_at_3.value,null);
      assert.equal(outcomeLink[0].challenger.expectancy_r.value,null);
      assert.equal(outcomeLink[0].precision_delta,null);
      assert.equal(outcomeLink[0].quality_improvement_claimed,false);
      if(relativePlan60m) {
        assert(outcomeLink[0].candidates.some(row=>row.terminal_outcome==="target_before_stop" && row.r_result>0));
        assert(outcomeLink[0].candidates.some(row=>row.terminal_outcome==="stop_before_target" && row.r_result===-1));
        assert(outcomeLink[0].candidates.filter(row=>row.outcome_status==="missing").every(row=>row.r_result===null && row.positive_outcome===null));
      }
      assert.deepEqual((await learningEvidence()).readiness.relative_plan_context_outcomes,outcomeLink);
      const shadow=learning.readiness.relative_plan_context_shadow;
      assert.equal(shadow.length,1,"Actual persisted owner read exposes the original decision's shadow diagnostic");
      assert.equal(shadow[0].comparison_version,"relative_plan_context_shadow_v1");
      assert.equal(shadow[0].scan_run_fingerprint,record.scan_run_fingerprint);
      assert.equal(shadow[0].decision_timestamp,record.decision_timestamp);
      assert.equal(shadow[0].original_population_count,8);
      assert.equal(shadow[0].candidates.length,8,"Unobserved original members survive Postgres/SDK/learning restart");
      assert.equal(shadow[0].assessed_count+shadow[0].unassessed_count,8);
      assert.equal(shadow[0].live_ranking_effect,false);
      assert.equal(shadow[0].publication_effect,false);
      assert.equal(shadow[0].quality_improvement_claimed,false);
      assert.notEqual(shadow[0].status,"conflicting");
      const expectedAssessed=opening?0:researchSnapshots.length;
      assert.equal(shadow[0].status,opening?"unavailable":"partial");
      assert.equal(shadow[0].assessed_count,expectedAssessed,
        "Every complete original 60m context is assessed; an opening window is never rescaled into an hour");
      assert.equal(shadow[0].unassessed_count,8-expectedAssessed,
        "Missing or short-window original members remain explicit, never dropped or imputed");
      if(opening) assert.equal(shadow[0].candidates.filter(c=>c.reason==="short_closed_range_window").length,
        researchSnapshots.length,"Valid short-window sources keep their precise unassessed reason");
      assert.deepEqual((await learningEvidence()).readiness.relative_plan_context_shadow,shadow,
        "Repeated actual durable read cannot recompute the original plan/input from mutable cache");
      assert.equal(learning.source.snapshots.filter(snapshot=>snapshot.intake_quality_json?.result_kind==="recommendation_intake_quality").length,researchSnapshots.length,
        "Each retained completed-input research source must keep its original intake assessment through owner readback");
      assert.equal(learning.readiness.intake_quality_provenance.status,"complete");
      assert.equal(learning.readiness.intake_quality_provenance.valid_receipt_count,researchSnapshots.length);
      const reordered = learning.source.snapshots.map(snapshot=>({ ...snapshot,
        intake_quality_json:Object.fromEntries(Object.entries(snapshot.intake_quality_json).reverse()) }));
      assert.equal(restarted.buildRecommendationIntakeQualityProvenance(reordered).status,"complete",
        "JSONB key order must not invalidate the same assessment");
      const mixed = restarted.buildRecommendationIntakeQualityProvenance([
        ...learning.source.snapshots,
        {intake_quality_json:{...researchSnapshots[0].intake_quality_json,result_version:"1.1"}},
      ]);
      assert.equal(mixed.status,"mixed");
      assert.deepEqual(mixed.result_versions,["1.1","1.2"]);
      for(const snapshot of learning.source.snapshots)
        assert.deepEqual(snapshot.intake_quality_json,researchSnapshots.find(row=>row.id===snapshot.id).intake_quality_json,
          "Outcome evaluation and restart may not recompute or upgrade the original assessment");
      // Missing or malformed diagnostics remain measurement gaps, not a reason
      // to hide canonical outcomes or grant publication/freeze authority.
      for(const [value,status,blocker] of [
        ["null","not_recorded","outcome_sample_intake_quality_not_recorded"],
        ["'{}'::jsonb","incomplete","outcome_sample_intake_quality_incomplete"],
        ["intake_quality_json || '{\"status\":\"accepted\",\"grade\":\"A\",\"accepted_for_visible_list\":true}'::jsonb",
          "incomplete","outcome_sample_intake_quality_incomplete"],
        ["intake_quality_json || '{\"evaluated_at\":\"2026-10-01T20:00:00.000Z\"}'::jsonb",
          "incomplete","outcome_sample_intake_quality_incomplete"],
        ["intake_quality_json || '{\"result_id\":\"recommendation-intake-research-wrong-candidate\"}'::jsonb",
          "incomplete","outcome_sample_intake_quality_incomplete"],
        ["intake_quality_json || '{\"warnings\":[],\"checks\":[]}'::jsonb",
          "incomplete","outcome_sample_intake_quality_incomplete"],
        ["intake_quality_json || '{\"risk_reward_ratio\":99}'::jsonb",
          "incomplete","outcome_sample_intake_quality_incomplete"],
      ]){
        sql(`update recommendation_snapshots set intake_quality_json=${value};`);
        const missing=await learningEvidence();
        assert.equal(missing.readiness.intake_quality_provenance.status,status);
        assert.equal(missing.readiness.intake_quality_provenance.accepted_for_visible_list_count,0);
        assert(missing.readiness.blockers.includes(blocker));
        assert.equal(missing.readiness.counterfactual_coverage.research_candidate_outcomes_collected,researchSnapshots.length);
        for(const row of researchSnapshots)
          sql(`update recommendation_snapshots set intake_quality_json='${JSON.stringify(row.intake_quality_json).replaceAll("'","''")}'::jsonb where id='${row.id}';`);
      }
      assert.equal(learning.readiness.counterfactual_coverage.research_candidate_outcomes_collected,researchSnapshots.length,
        "Retained exact-input canonical research outcomes must reach learning without an invented upstream version");
      assert.equal(learning.readiness.decision_time_source_provenance.upstream_provider_version_unavailable_count,researchSnapshots.length);
      assert(learning.source.snapshots.every(snapshot=>snapshot.payload_json.provider_version===null));
      assert(learning.source.snapshots.every(snapshot=>restarted.recommendationDecisionSourceProvenanceFromSnapshot(snapshot).status==="incomplete"),
        "Legacy v1 provenance must remain strict");
      // Persist tampering after outcomes exist, then use actual owner readback.
      // Stored outcomes cannot re-authorize corrupted original inputs/lineage.
      const negativeUpdates=[
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{is_demo}', 'true'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{is_mock}', 'true'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{provider_source}', '\"wrong_provider\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{provider_version}', '\"invented_upstream_version\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{intraday_indicator_response_identity}', 'null'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{decision_feature_vector,feature_values,latest_price}', '999999'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{decision_feature_vector,feature_values,intraday_vwap}', '999999'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{decision_feature_vector,contract_version}', '\"recommendation_decision_feature_vector_v1\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{build_marker}', '\"wrong_build\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{market_data_adapter_version}', '\"wrong_adapter\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{data_timestamp}', '\"2026-10-01T20:00:00.000Z\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{scanner_decision_input_snapshot,features,proposed_entry_low}', '999999'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{research_capture_version}', '\"wrong_capture_version\"'::jsonb);",
      ];
      for(const update of negativeUpdates){
        sql(update);
        const rejectedLearning=await learningEvidence();
        assert.equal(rejectedLearning.readiness.counterfactual_coverage.research_candidate_outcomes_collected,0);
        assert.equal(rejectedLearning.readiness.relative_plan_context_outcomes[0].canonical_outcome_count,0);
        for(const row of researchSnapshots) sql(`update recommendation_snapshots set payload_json='${JSON.stringify(row.payload_json).replaceAll("'","''")}'::jsonb where id='${row.id}';`);
      }
      for(const invalidRunPayload of [
        Object.fromEntries(Object.entries(originalRunPayload).filter(([name])=>name!=="decision_lineage_receipt")),
        {...originalRunPayload,decision_lineage_receipt:{...originalRunPayload.decision_lineage_receipt,scan_run_fingerprint:"wrong_run"}},
      ]){
        sql(`update recommendation_scan_runs set payload_json='${JSON.stringify(invalidRunPayload).replaceAll("'","''")}'::jsonb where id='${scanRuns[0].id}';`);
        assert.equal((await learningEvidence()).readiness.counterfactual_coverage.research_candidate_outcomes_collected,0);
      }
      sql(`update recommendation_scan_runs set payload_json='${JSON.stringify(originalRunPayload).replaceAll("'","''")}'::jsonb where id='${scanRuns[0].id}';`);
      const restoredLearning=await learningEvidence();
      assert.equal(restoredLearning.readiness.counterfactual_coverage.research_candidate_outcomes_collected,researchSnapshots.length);
      const duplicateSources={...learning.source,scanRuns:[...learning.source.scanRuns,...learning.source.scanRuns]};
      assert.equal(restarted.buildRecommendationLearningBaselineReadiness(duplicateSources).counterfactual_coverage.research_candidate_outcomes_collected,0);
      const duplicateOutcomes={...learning.source,outcomes:[...learning.source.outcomes,...learning.source.outcomes]};
      assert.equal(restarted.buildRecommendationLearningBaselineReadiness(duplicateOutcomes).counterfactual_coverage.research_candidate_outcomes_collected,0);
      const otherSource=restarted.parseRecommendationLearningBaselineSource((await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002")).data);
      assert(otherSource);
      assert.equal(restarted.buildRecommendationLearningBaselineReadiness(otherSource).decision_records.attributable_count,0);
      assert.equal(externalRequests-before,researchSnapshots.length);
      assert.deepEqual(JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;")).sort((a,b)=>a.id.localeCompare(b.id)),completedRows);
      outcomeChainEvidence.learning_admission={
        readiness_version:learning.readiness.contract_version,
        plan_version:learning.plans.contract_version,
        relative_plan_context_shadow:{
          comparison_version:shadow[0].comparison_version,
          status:shadow[0].status,
          original_population_count:shadow[0].original_population_count,
          assessed_count:shadow[0].assessed_count,
          unassessed_count:shadow[0].unassessed_count,
          restart_stable:true,
          actual_provider_requests:0,
          live_ranking_effect:false,
          publication_effect:false,
          quality_improvement_claimed:false,
        },
        relative_plan_context_outcomes:{
          contract_version:outcomeLink[0].contract_version,
          primary_horizon:outcomeLink[0].primary_horizon,status:outcomeLink[0].status,
          original_population_count:outcomeLink[0].original_population_count,
          selected_60m_receipt_count:outcomeLink[0].selected_60m_receipt_count,
          resolved_60m_outcomes:outcomeLink[0].canonical_outcome_count,
          missing_outcomes:outcomeLink[0].missing_outcome_count,
          positive_labels:outcomeLink[0].candidates.filter(row=>row.positive_outcome===true).length,
          negative_terminal_labels:outcomeLink[0].candidates.filter(row=>row.terminal_outcome==="stop_before_target").length,
          precision_delta:outcomeLink[0].precision_delta,
          baseline_precision:outcomeLink[0].baseline.precision_at_3.value,
          challenger_expectancy_r:outcomeLink[0].challenger.expectancy_r.value,
          restart_stable:true,full_charter_accepted:false,
          actual_provider_requests:0,live_ranking_effect:false,publication_effect:false,
          quality_improvement_claimed:false,
        },
        canonical_research_outcomes:researchSnapshots.length,
        retained_intake_assessments:learning.readiness.intake_quality_provenance.valid_receipt_count,
        intake_assessment_provenance:learning.readiness.intake_quality_provenance.status,
        intake_assessment_versions:learning.readiness.intake_quality_provenance.result_versions,
        intake_assessment_statuses:learning.readiness.intake_quality_provenance.result_statuses,
        intake_assessment_grades:learning.readiness.intake_quality_provenance.grades,
        original_intake_assessments_unchanged:true,
        contradictory_intake_assessments_rejected:true,
        assessment_key_order_preserved:true,
        mixed_assessment_versions_segmented:true,
        upstream_provider_version_unavailable:researchSnapshots.length,
        unresolved_population_members:8-researchSnapshots.length,
        freeze_status:learning.readiness.status,
        actual_provider_requests:0,
        legacy_source_gate_unchanged:true,
        tampered_source_and_lineage_admitted:0,
      };
      externalRequests=before;
      clock=OriginalDate.parse(slot)+20000;
    }
    const duplicate=await scheduler(new Request("http://closed-scheduler",{method:"POST",
      body:JSON.stringify({next_run:expiry})}),{deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(duplicate.status,204);
    assert.equal(externalRequests,8);
  }
  if(benchmarkReuse) {
    assert.equal(record.candidates.length,8); // The first complete original population is never replaced.
    const firstFresh=record.candidates.filter(candidate=>candidate.data.freshness==="fresh").length;
    assert.equal(firstFresh,mixedHistory?(minimumOrderBaseline&&!invalidMixedHistory?5:3):cold?3:6);
    const originalRegime=scanRuns[0].payload_json.market_regime;
    if(invalidBenchmarkReuse) sql(`update recommendation_scan_runs set payload_json=jsonb_set(payload_json,
      '{market_regime,input_evidence,qqq,content_sha256}','"invalid-fixture-digest"') where id='${scanRuns[0].id}';`);
    const firstRequests=externalRequests;
    assert.equal(externalBenchmarkRequests,2);
    clock=OriginalDate.parse(expiry)+20000;
    externalRequests=0;
    externalBenchmarkRequests=0;
    const second=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:nextSlot})}),
      {deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(second.status,200,JSON.stringify({body:await second.json(),logs:logs.slice(-15)}).slice(-12000));
    const allRuns=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_scan_runs t;"));
    assert.equal(allRuns.length,2);
    const secondRun=allRuns.find(run=>run.id!==scanRuns[0].id);
    const secondDecision=readers.candidateDecisionRecordFromScanRun(secondRun);
    assert(secondDecision && readers.decisionLineageReceiptFromScanRun(secondRun,secondDecision));
    assert.equal(secondDecision.candidates.length,8);
    for (const [source,decision,sourceSlot] of [[scanRuns[0],record,slot],[secondRun,secondDecision,expiry]]) {
      const originalSelection=readers.buildRealScannerBaseCandidateSelection({
        scanWindow:readers.getIntradayScanWindow(new OriginalDate(sourceSlot)),requestedScanBudget:8,
        selectionMode:"scheduled_rotating",now:new OriginalDate(sourceSlot)}).candidates;
      assert.deepEqual(decision.candidates.map(candidate=>candidate.ticker).sort(),
        originalSelection.map(candidate=>candidate.ticker).sort());
      if(mixedHistory) {
        const plan=source.payload_json.active_scan_trace.market_data_fetch.completed_input_acquisition;
        if(!minimumOrderBaseline) assert.equal(plan,undefined);
        else {
          assert.equal(plan.policy_version,minimumOrderBaseline?"completed_input_minimum_requests_first_v1":"completed_input_fair_cost_ties_v1");
          assert.equal(plan.provider_call_cap,sourceSlot===slot?6:8);
          assert.deepEqual(plan.original_members.map(member=>member.ticker),originalSelection.map(candidate=>candidate.ticker));
          assert.deepEqual(plan.original_members.map(member=>member.ticker_index),[0,1,2,3,4,5,6,7]);
          const offset=Math.floor(OriginalDate.parse(sourceSlot)/900000)%8;
          const costs=invalidMixedHistory?[2,2,2,2,2,2,2,2]:[2,2,2,2,1,1,1,1];
          const expectedOrder=[0,1,2,3,4,5,6,7].sort((a,b)=>costs[a]-costs[b] ||
            (minimumOrderBaseline?a-b:(a-offset+8)%8-(b-offset+8)%8));
          assert.deepEqual(plan.acquisition_order,expectedOrder);
          if(!minimumOrderBaseline) assert.equal(plan.cost_tie_offset,offset);
          assert.deepEqual(plan.original_members.map(member=>member.estimated_requests),invalidMixedHistory?[2,2,2,2,2,2,2,2]:[2,2,2,2,1,1,1,1]);
          for(const member of plan.original_members) {
            assert.equal(member.current_context_sha256,null);
            assert.equal(member.historical_captured_at,member.estimated_requests===1?"2026-10-01T17:00:00.000Z":null);
            if(member.estimated_requests===1) {
              const original=decision.candidates.find(candidate=>candidate.ticker===member.ticker);
              assert.equal(original.data.input_snapshot.historical_context.content_sha256,member.historical_context_sha256);
              assert.equal(original.data.input_snapshot.historical_context.captured_at,member.historical_captured_at);
            } else assert.equal(member.historical_context_sha256,null);
          }
        }
      }
      assert(OriginalDate.parse(source.observed_at)<=OriginalDate.parse(decision.decision_timestamp));
      assert(OriginalDate.parse(decision.decision_timestamp)<=OriginalDate.parse(source.completed_at));
    }
    const expectReuse=!invalidBenchmarkReuse && !baselineBenchmarkReuse;
    const fresh=secondDecision.candidates.filter(candidate=>candidate.data.freshness==="fresh").length;
    assert.equal(fresh,mixedHistory?(minimumOrderBaseline&&!invalidMixedHistory?6:4):cold?(expectReuse?4:3):(expectReuse?8:6),JSON.stringify({
      selected:secondDecision.candidates.map(candidate=>({ticker:candidate.ticker,freshness:candidate.data.freshness,
        daily:candidate.data.input_snapshot?.historical_context?.captured_at,
        current:candidate.data.input_snapshot?.current_session?.latest_bar_started_at,gaps:candidate.data.gap_codes})),
      trace:logs.filter(items=>JSON.stringify(items).includes("fresh_call_admission")),
    }).slice(-6000));
    assert.equal(externalRequests,8);
    assert.equal(externalBenchmarkRequests,expectReuse?0:2);
    const retained=secondRun.payload_json.market_regime.input_evidence;
    if(expectReuse) {
      assert.equal(retained.reuse.source_scan_run_id,scanRuns[0].id);
      assert.equal(retained.reuse.source_scan_run_fingerprint,scanRuns[0].run_fingerprint);
      assert.equal(retained.reuse.original_classified_at,originalRegime.input_evidence.evaluated_at);
      assert.equal(retained.reuse.scanner_provider_call_cap,8);
      assert.equal(retained.reuse.benchmark_provider_calls,0);
      assert.deepEqual(retained.spy,originalRegime.input_evidence.spy);
      assert.deepEqual(retained.qqq,originalRegime.input_evidence.qqq);
    } else assert.equal(retained.reuse,undefined);
    const allClaims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
    assert.equal(allClaims.length,2);
    assert(allClaims.every(claim=>claim.requested_credits===8 && claim.status==="completed" && claim.finalized_at));
    const allAttempts=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from scheduled_scan_attempts t;"));
    const allCycles=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from observation_cycle_receipts t;"));
    assert.equal(allAttempts.length,2);
    assert.equal(allCycles.length,2);
    assert(allCycles.every(cycle=>cycle.cycle_status==="completed"));
    assert(allCycles.every(cycle=>cycle.receipt_json.provider_request.reserved_credits===8),
      "Every cycle must retain its whole finalized reservation, including separately acquired benchmarks");
    const cycleReadback=readers.buildObservationCycleReadback(allCycles);
    assert.equal(cycleReadback.status,"available"); assert.equal(cycleReadback.invalid_row_count,0);
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const restarted=require(join(generated,"reader.cjs"));
    const owned=await restarted.readRecommendationLearningBaselineSource(owner);
    const source=restarted.parseRecommendationLearningBaselineSource(owned.data);
    assert(source && source.scanRuns.length===2);
    assert.deepEqual(source.scanRuns.find(run=>run.id===secondRun.id).payload_json.market_regime.input_evidence,retained);
    const latestOwned=owned.data.recommendation_scan_runs.find(run=>run.id===secondRun.id);
    const restartedReuse=await restarted.readOwnedCompletedBenchmarkReuse({row:latestOwned,owner,now:new OriginalDate(clock)});
    assert(restartedReuse && await restarted.isValidCompletedBenchmarkReuse(restartedReuse,new OriginalDate(clock)),
      JSON.stringify({data_mode:latestOwned?.data_mode,status:latestOwned?.status,owner:latestOwned?.owner_user_id,
        input_policy:secondDecision.versions.input_policy_version,observed_at:latestOwned?.observed_at,
        completed_at:latestOwned?.completed_at,decision_timestamp:secondDecision.decision_timestamp}));
    assert.equal(await restarted.isValidCompletedBenchmarkReuse(structuredClone(restartedReuse),new OriginalDate(clock)),false);
    assert.deepEqual(restartedReuse.market_regime.input_evidence.spy,retained.spy);
    assert.deepEqual(restartedReuse.market_regime.input_evidence.qqq,retained.qqq);
    const other=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
    assert.equal(other.data.recommendation_scan_runs.length,0);
    const secondDuplicate=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:nextSlot})}),
      {deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(secondDuplicate.status,204); assert.equal(externalRequests,8);
    benchmarkReuseEvidence={mode:baselineBenchmarkReuse?"original_committed_baseline":invalidBenchmarkReuse?"invalid_original_falls_back":"validated_owner_reuse",
      baseline_revision:mixedHistory?acquisitionBaselineRevision:reuseBaselineRevision,
      history_start:existingPremarketSetup?"existing_premarket_paid_setup":mixedHistory?"mixed":cold?"cold":"prewarmed",
      ...(mixedHistory ? {acquisition_mode:minimumOrderBaseline?"minimum_requests_first":"original_order"} : {}),
      ...(mixedHistory ? {historical_context_integrity:invalidMixedHistory?"tampered":"valid"} : {}),
      first_scan_requests:firstRequests,second_scan_requests:externalRequests,
      first_fresh_inputs:firstFresh,second_fresh_inputs:fresh,original_members_per_decision:8,
      attempts:allAttempts.length,cycles:allCycles.length,reservations:allClaims.length,
      reserved_credits:allClaims.reduce((sum,claim)=>sum+claim.requested_credits,0),benchmark_calls_second:externalBenchmarkRequests,
      original_source_clocks_unchanged:expectReuse,restarted_owner_read:true,wrong_owner_runs:0};
    if(charterComposition) {
      assert.equal(setupRequests,historyOnlySetup||legacyHistorySetup?16:32); assert.equal(firstFresh,6); assert.equal(fresh,8);
      assert.equal(source.snapshots.length,14,"Actual generator retains the six partial and eight complete original sources");
      const frozenAt="2026-09-25T12:00:00.000Z";
      const plan=restarted.buildRelativePlanProspectivePlan({owner_user_id:owner,
        source_revision:{commit_ref:identity.commit_ref,build_identity:restarted.relativePlanCanonicalBuildIdentity,
          deploy_id:identity.deploy_id},windows:{
          training:{start_at:"2026-09-28T13:30:00.000Z",end_at:"2026-09-29T20:00:00.000Z"},
          held_out:{start_at:slot,end_at:nextSlot},
          walk_forward:{start_at:"2026-10-05T13:30:00.000Z",end_at:"2026-10-06T20:00:00.000Z"},
        }},frozenAt); assert(plan);
      // Isolated historical admin fixture ONLY. No real pre-forward database
      // freeze/model witness, market-quality acceptance or refitting is claimed.
      sql(`insert into relative_plan_prospective_comparisons(id,owner_user_id,model_version,plan_fingerprint,plan_json,frozen_at)
        values('22222222-2222-4222-8222-222222222222','${owner}','${plan.model_version}','${plan.plan_fingerprint}',
          '${JSON.stringify(plan).replaceAll("'","''")}'::jsonb,'${frozenAt}');`);
      const asOf=new OriginalDate(Math.max(OriginalDate.parse("2026-10-07T21:00:00.000Z"),OriginalDate.now()));
      const read=()=>restarted.createRelativePlanProspectiveService().read(owner,asOf);
      const before=await read(); assert.equal(before.status,"available",before.blocker);
      const heldBefore=before.learning.partitions.find(partition=>partition.partition==="held_out");
      assert.equal(heldBefore.enrolled_decision_count,1); assert.equal(heldBefore.original_population_count,8);
      assert.equal(heldBefore.missing_outcome_count,8);
      assert.equal(before.learning.diagnostics.length,1);
      assert.equal(before.learning.diagnostics[0].fingerprint,record.scan_run_fingerprint);
      assert.equal(before.learning.diagnostics[0].reason,"original_complete_assessed_population_unavailable");
      const originalIds=secondDecision.candidates.map(member=>member.candidate_id).sort();
      const beforeCharter=before.learning.full_charter.partitions.find(partition=>partition.partition==="held_out");
      assert.deepEqual(beforeCharter.observations[0].rows.map(row=>row.candidate_id).sort(),originalIds);
      assert.equal(beforeCharter.operational.reliability.admitted_attempt_count,2);
      assert.equal(beforeCharter.operational.cost.reserved_provider_credits,16,JSON.stringify({
        operational:beforeCharter.operational,
        attempt_credit_summaries:allAttempts.map(attempt=>({
          keys:Object.keys(attempt.payload_json),
          normal:attempt.payload_json.basic_free_scheduled_scan_credit_reservation??null,
          series:attempt.payload_json.observation_series_credit_reservation??null,
        })),
      }));
      futureOutcomePlans=source.snapshots.map((snapshot,index)=>({...snapshot,synthetic_win:index%2===0}));
      clock=OriginalDate.parse(expiry)+4500000;
      const scanRequests=externalRequests;
      const evaluate=()=>require(join(generated,"outcome-route.cjs")).POST(new Request("http://closed-fixture/api/recommendations/evaluate-outcomes",{
        method:"POST",headers:{"x-automation-secret":environment.AUTOMATION_SECRET,"Content-Type":"application/json"},
        body:JSON.stringify({mode:"official_live_today",horizons:["60m"],max_candle_requests:4,max_batches:1}),
      }));
      const outcomePasses=[];
      for(let index=0;index<4;index++) {
        const initial=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
        const creditsBefore=externalRequests;
        delete require.cache[require.resolve(join(generated,"outcome-route.cjs"))];
        const evaluated=await evaluate(),body=await evaluated.json();
        assert.equal(evaluated.status,200,JSON.stringify(body));
        const current=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
        assert(externalRequests-creditsBefore<=4);
        for(const prior of initial) assert.deepEqual(current.find(row=>row.id===prior.id),prior);
        outcomePasses.push({requests:externalRequests-creditsBefore,persisted_outcomes:current.length});
      }
      assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),14);
      assert.equal(externalRequests-scanRequests,14);
      const completedOutcomes=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
      const completedRequests=externalRequests;
      const repeated=await evaluate(); assert.equal(repeated.status,200); assert.equal(externalRequests,completedRequests);
      assert.deepEqual(JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;")),completedOutcomes);
      delete require.cache[require.resolve(join(generated,"reader.cjs"))];
      const refreshed=require(join(generated,"reader.cjs"));
      const after=await refreshed.createRelativePlanProspectiveService().read(owner,asOf);
      assert.equal(after.status,"available",after.blocker);
      const held=after.learning.partitions.find(partition=>partition.partition==="held_out");
      assert.equal(held.enrolled_decision_count,1); assert.equal(held.original_population_count,8);
      assert.equal(held.canonical_outcome_count,8); assert.equal(held.missing_outcome_count,0);
      assert.equal(held.original_membership_fingerprint,heldBefore.original_membership_fingerprint);
      const charter=after.learning.full_charter,measured=charter.partitions.find(partition=>partition.partition==="held_out");
      assert.deepEqual(measured.observations[0].rows.map(row=>row.candidate_id).sort(),originalIds);
      assert.equal(measured.quality.outcome_coverage.value,1);
      assert.equal(measured.quality.original_population_count,8);
      assert.equal(charter.computed_disposition,"evidence_incomplete");
      assert.equal(charter.terminal_quality_decision,null); assert.equal(after.learning.terminal_quality_decision,null);
      assert.equal(after.learning.trained_probability_model,null);
      assert.equal(after.learning.quality_improvement_claimed,false);
      assert(charter.missing_dimensions.includes("held_out_durably_frozen_training_probability_model_required"));
      assert.equal((await refreshed.createRelativePlanProspectiveService().read("00000000-0000-4000-8000-000000000002",asOf)).learning,null);
      const heldRows=held.decisions[0].comparison.candidates;
      assert.equal(heldRows.filter(row=>row.terminal_outcome==="target_before_stop").length,4);
      assert.equal(heldRows.filter(row=>row.terminal_outcome==="stop_before_target").length,4);
      const readActual=()=>refreshed.createRelativePlanProspectiveService().read(owner,asOf);
      const originalSnapshot=source.snapshots.find(snapshot=>snapshot.scan_run_id===secondRun.run_fingerprint);
      assert(originalSnapshot);
      const jsonSql=value=>`'${JSON.stringify(value).replaceAll("'","''")}'::jsonb`;
      for(const path of ["{provider_source}","{scanner_decision_input_snapshot,features,proposed_entry_low}"]) {
        sql(`update recommendation_snapshots set payload_json=jsonb_set(payload_json,'${path}',
          ${path==="{provider_source}" ? `'"wrong_provider"'::jsonb` : "'999999'::jsonb"}) where id='${originalSnapshot.id}';`);
        const changed=await readActual(); assert.equal(changed.status,"available",changed.blocker);
        const partial=changed.learning.partitions.find(partition=>partition.partition==="held_out");
        assert.equal(partial.enrolled_decision_count,1); assert.equal(partial.original_population_count,8);
        assert.equal(partial.original_membership_fingerprint,held.original_membership_fingerprint);
        assert.equal(partial.canonical_outcome_count,7); assert.equal(partial.missing_outcome_count,1);
        assert.equal(partial.baseline.precision_at_3,null); assert.equal(partial.challenger.expectancy_r,null);
        assert.equal(changed.learning.terminal_quality_decision,null);
        sql(`update recommendation_snapshots set payload_json=${jsonSql(originalSnapshot.payload_json)} where id='${originalSnapshot.id}';`);
      }
      const originalRunPayload=secondRun.payload_json;
      for(const invalidRunPayload of [
        Object.fromEntries(Object.entries(originalRunPayload).filter(([name])=>name!=="decision_lineage_receipt")),
        {...originalRunPayload,decision_lineage_receipt:{...originalRunPayload.decision_lineage_receipt,scan_run_fingerprint:"wrong_run"}},
      ]) {
        sql(`update recommendation_scan_runs set payload_json=${jsonSql(invalidRunPayload)} where id='${secondRun.id}';`);
        const invalid=await readActual(); assert.equal(invalid.status,"available",invalid.blocker);
        const rejected=invalid.learning.partitions.find(partition=>partition.partition==="held_out");
        assert.equal(rejected.enrolled_decision_count,0); assert.equal(rejected.canonical_outcome_count,0);
        assert(invalid.learning.diagnostics.some(row=>row.fingerprint===secondRun.run_fingerprint &&
          row.reason==="original_decision_or_lineage_missing_ambiguous"));
        assert.equal(invalid.learning.terminal_quality_decision,null);
      }
      sql(`update recommendation_scan_runs set payload_json=${jsonSql(originalRunPayload)} where id='${secondRun.id}';`);
      const originalAttempt=allAttempts.find(attempt=>attempt.scan_run_fingerprint===secondRun.run_fingerprint);
      assert(originalAttempt);
      const invalidCredit={...originalAttempt.payload_json,
        basic_free_scheduled_scan_credit_reservation:{...originalAttempt.payload_json.basic_free_scheduled_scan_credit_reservation,
          finalization_status:"invalid_transition",finalization_proven:false,safe_blocker:"invalid_transition"}};
      sql(`update scheduled_scan_attempts set payload_json=${jsonSql(invalidCredit)} where id='${originalAttempt.id}';`);
      const uncertain=await readActual(); assert.equal(uncertain.status,"available",uncertain.blocker);
      const uncertainRuntime=uncertain.learning.full_charter.partitions.find(partition=>partition.partition==="held_out").operational;
      assert.equal(uncertainRuntime.reliability.completed_attempt_count,2);
      assert.equal(uncertainRuntime.cost.reserved_provider_credits,null);
      assert(uncertainRuntime.blockers.includes("relative_plan_operational_exact_finalized_credit_evidence_incomplete"));
      sql(`update scheduled_scan_attempts set payload_json=${jsonSql(originalAttempt.payload_json)} where id='${originalAttempt.id}';`);
      const beforeRecording=new OriginalDate(Math.min(...completedOutcomes.map(row=>OriginalDate.parse(row.created_at)))-1);
      const historicalRead=await refreshed.createRelativePlanProspectiveService().read(owner,beforeRecording);
      assert.equal(historicalRead.status,"available",historicalRead.blocker);
      const unrecorded=historicalRead.learning.partitions.find(partition=>partition.partition==="held_out");
      assert.equal(unrecorded.enrolled_decision_count,1); assert.equal(unrecorded.original_population_count,8);
      assert.equal(unrecorded.canonical_outcome_count,0); assert.equal(unrecorded.missing_outcome_count,8);
      const restored=await readActual(); assert.equal(restored.status,"available",restored.blocker);
      assert.deepEqual(restored.learning,after.learning,"All original membership, outcomes and charter measurements survive restored isolated tampering");
      assert.deepEqual(JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;")),completedOutcomes);
      assert.equal(externalRequests,completedRequests,"Readback and isolated negative controls cannot acquire market data");
      const originalInputInformation=[record,secondDecision].map(decision=>({
        scan_run_fingerprint:decision.scan_run_fingerprint,decision_timestamp:decision.decision_timestamp,
        decision_clock:decision.decision_clock,versions:decision.versions,candidates:decision.candidates,
      }));
      charterCompositionEvidence={evidence_scope:"synthetic_actual_original_source_and_canonical_outcomes_not_forward_seal",
        setup_mode:legacyHistorySetup?"existing_legacy_fetch_retained_history":historyOnlySetup?"existing_one_credit_history_only":"existing_two_credit_history_and_intraday",
        ...(legacyHistorySetup?{legacy_original_information:legacySetupFingerprint}:{}),
        setup_intraday_requests:setupIntradayRequests,
        original_member_ids:[record,secondDecision].flatMap(decision=>decision.candidates.map(member=>member.candidate_id)),
        original_input_fingerprint:`sha256:${restarted.relativePlanSemanticFingerprint(originalInputInformation)}`,
        original_decision_fingerprints:originalInputInformation.map(information=>
          `sha256:${restarted.relativePlanSemanticFingerprint(information)}`),
        ...(setupCompositionDiagnostic?{original_input_information:originalInputInformation}:{}),
        setup_requests:setupRequests,scheduled_requests:16,separate_synthetic_outcome_requests:14,outcome_passes:outcomePasses,
        source_decisions:2,source_research_snapshots:14,retained_original_members:16,enrolled_decisions:1,
        excluded_partial_decisions:1,original_enrolled_population:8,canonical_enrolled_outcomes:8,
        original_membership_stable:true,completed_repeat_requests:0,prior_outcomes_unchanged:true,
        positive_enrolled_outcomes:4,negative_enrolled_outcomes:4,wrong_owner_learning:null,
        tampered_source_missing_outcomes:1,tampered_lineage_enrolled_decisions:0,
        unproven_finalization_cost:null,unrecorded_as_of_outcomes:0,restored_charter_unchanged:true,
        operational_attempts:measured.operational.reliability.admitted_attempt_count,
        reserved_provider_credits:measured.operational.cost.reserved_provider_credits,
        disposition:charter.computed_disposition,missing_dimensions:charter.missing_dimensions,
        observed_context_blockers:measured.observations[0].rows.map(row=>({ticker:row.ticker,blockers:row.blockers})),
        trained_model:null,terminal_quality_decision:null,quality_improvement_claimed:false};
      externalRequests=scanRequests;
    }
  }
  assert.equal(Number(sql("select count(*) from recommendations;")),syntheticPublicationCount);
  assert.equal(Number(sql("select count(*) from positions;")),0);
  // Disable/expiry are exercised by the real scheduled entrypoint, not a mock.
  process.env.TURE_OBSERVATION_SERIES_ENABLED="false";
  clock=OriginalDate.parse(expiry)+20000;
  const cleanup=await scheduler(new Request("http://closed-scheduler",{method:"POST",
    body:JSON.stringify({next_run:nextSlot})}),{deploy:{id:identity.deploy_id,context:"production",published:true}});
  assert.equal(cleanup.status,204);
  assert.equal(Number(sql("select count(*) from scheduled_scan_attempts;")),benchmarkReuse?2:1);
  assert.equal(Number(sql("select count(*) from recommendations;")),syntheticPublicationCount);
  originalLog(JSON.stringify({evidence_mode:"synthetic_closed_packaged_input_runtime_actual_source_schema",
    scenario:benchmarkReuse?"retained_benchmark_two_slot":closing?"closing_research_only":wrongPolicy?"invalid_policy":opening?"opening_cold_history":cold?"cold_history":"warm_history_restart",
    ...(closing?{late_publication_withheld:true,original_research_sources:researchSnapshots.length}:{}),
    setup_synthetic_requests:setupRequests,scheduled_synthetic_requests:benchmarkReuse?
      benchmarkReuseEvidence.first_scan_requests+benchmarkReuseEvidence.second_scan_requests:externalRequests,
    ...(benchmarkReuse ? {benchmark_reuse_evidence:benchmarkReuseEvidence} : {}),
    ...(charterComposition ? {charter_composition_evidence:charterCompositionEvidence} : {}),
    ...(existingPremarketSetup ? {existing_premarket_evidence:existingPremarketEvidence} : {}),
    attempts:benchmarkReuse?benchmarkReuseEvidence.attempts:rows.length,
    cycles:benchmarkReuse?benchmarkReuseEvidence.cycles:receipts.length,
    claims:benchmarkReuse?benchmarkReuseEvidence.reservations:claims.length,decision_version:record?.record_version,
    fresh_inputs:benchmarkReuse?benchmarkReuseEvidence.second_fresh_inputs:record?.candidates.filter(c=>c.data.freshness==="fresh").length,
    ...(diagnoseOutcomes ? {outcome_chain_evidence:outcomeChainEvidence,outcome_chain_diagnostic:{learning_acceleration_enabled:true,
      candidate_population:record?.candidates.length,
      research_snapshot_count:researchSnapshots.length,
      research_snapshots:researchSnapshots.map(row=>({ticker:row.ticker,
        candidate_id:row.payload_json?.candidate_id??null,
        input_policy_version:row.payload_json?.scanner_input_policy_version??null,
        research_purpose:row.payload_json?.research_purpose??null,
        decision_input_snapshot_present:row.payload_json?.scanner_decision_input_snapshot!==undefined,
        source_timestamp:row.payload_json?.data_timestamp??null,
        freshness:record?.candidates.find(candidate=>candidate.candidate_id===row.payload_json?.candidate_id)?.data.freshness??null}))}} : {}),
    ...(zeroLatestVolume ? { zero_latest_volume_inputs:record.candidates.filter(candidate=>candidate.data.input_snapshot?.intraday_indicators?.latestVolume===0).length } : {}),
    ...(missingLatestVolume ? {missing_volume_research_sources:researchSnapshots.length} : {}),
    ...((staleBenchmark || partialBenchmark) ? {benchmark_input_fitness:staleBenchmark?"stale_rejected_not_no_trade":"partial_current_bar_discarded",
      retained_market_regime_input_policy:scanRuns[0]?.payload_json.market_regime?.input_evidence?.policy_version??null,
      terminal_reservation_status:claims[0]?.status,decision_count:scanRuns.length} : {}),
    ...(contextLatency ? {context_latency_proof:intradayRateLimit?"preserved_intraday_rate_limit":scannerRateLimit?"preserved_scanner_rate_limit":expectContextTimeout?"reproduced_timeout":"completed",
      bounded_duration_ms:boundedDurationMs,route_budget_ms:23000,cleanup_reserve_ms:3000,
      synthetic_scanner_delay_ms:1800,synthetic_benchmark_delay_ms:benchmarkDelayMs,
      pending_synthetic_transports:pendingSyntheticTransports} : {}),
    actual_provider_requests:0,production_actions:0,publications:syntheticPublicationCount,
    production_publications:0,broker_actions:0,cleanup:"inert"}));
  if(diagnoseOutcomes && !wrongPolicy) {
    assert.equal(researchSnapshots.length,cold?3:6,
      "Fresh, non-published versioned inputs must retain research outcome sources during a regular afternoon session");
  }
  }

} catch (error) {
  try { originalLog(docker("inspect", "--format", "{{json .HostConfig.PortBindings}} {{json .NetworkSettings.Ports}} {{.State.Status}} {{.State.Error}}", api)); } catch { /* May not exist. */ }
  originalLog(dockerLogs(api));
  throw error;
} finally {
  if (historyAppServer) {
    historyAppServer.closeAllConnections();
    await new Promise(done => historyAppServer.close(done));
  }
  if (originalAsyncLocalStorage === undefined) Reflect.deleteProperty(globalThis, "AsyncLocalStorage");
  else globalThis.AsyncLocalStorage = originalAsyncLocalStorage;
  globalThis.Date = OriginalDate; globalThis.fetch = originalFetch; console.log = originalLog;
  AbortSignal.timeout = originalSignalTimeout;
  Reflect.deleteProperty(globalThis, "Netlify");
  for (const name of Object.keys(process.env)) if (!(name in originalEnvironment)) delete process.env[name];
  Object.assign(process.env, originalEnvironment);
  for (const name of [api, database]) { try { docker("stop", name); } catch { /* May not have started. */ } }
  try { docker("network", "rm", network); } catch { /* May not have been created. */ }
  rmSync(directory, { recursive: true, force: true });
}
