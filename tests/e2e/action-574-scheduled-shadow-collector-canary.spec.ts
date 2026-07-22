import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryReceipt,
  buildContinuousIntelligenceShadowCanaryDiagnostics,
  buildContinuousIntelligenceShadowCanaryLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryPreflight,
  buildContinuousIntelligenceShadowCanaryRange,
  continuousIntelligenceShadowCollectorCanaryAllowlist,
  continuousIntelligenceShadowCollectorCanaryFlagName,
  continuousIntelligenceShadowCollectorCanaryKillSwitchName,
  continuousIntelligenceShadowCollectorCanaryLimits,
  executeContinuousIntelligenceShadowCanary,
  isContinuousIntelligenceShadowCanaryEnabled,
  isContinuousIntelligenceShadowCanaryKillSwitchOff,
  recheckContinuousIntelligenceShadowCanaryRuntime,
} from "../../lib/continuous-intelligence-shadow-collector-canary";
import {
  buildContinuousIntelligenceShadowCanaryExecutionId,
  createContinuousIntelligenceShadowCanaryClaimStore,
  type ContinuousIntelligenceShadowCanaryClaimDatabase,
  type ContinuousIntelligenceShadowCanaryClaimRow,
} from "../../lib/continuous-intelligence-shadow-canary-claim-store";
import { buildUsEquityMarketCalendarEvaluation } from "../../lib/us-equity-market-calendar";

const functionPath = "netlify/functions/scheduled-shadow-collector-canary.ts";
const routePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/route.ts";
const preflightRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/preflight/route.ts";
const claimMigrationPath = "supabase/migrations/20260721002000_create_continuous_intelligence_shadow_canary_daily_claims.sql";
const claimPersistencePath = "lib/server/continuous-intelligence-shadow-canary-claim-persistence.ts";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function preflight(overrides: Partial<Parameters<typeof buildContinuousIntelligenceShadowCanaryPreflight>[0]> = {}) {
  return buildContinuousIntelligenceShadowCanaryPreflight({
    now: new Date("2026-07-21T15:15:00.000Z"),
    calendar: buildUsEquityMarketCalendarEvaluation(
      new Date("2026-07-21T15:15:00.000Z"),
    ),
    enabled_flag: "true",
    kill_switch: "false",
    provider_configured: true,
    provider_metadata_status: "within_budget",
    daily_usage: { status: "available", run_count: 0, estimated_credits: 0 },
    ...overrides,
  });
}

test("Action 574 flags fail closed and cannot be enabled by prior action flags", () => {
  expect(continuousIntelligenceShadowCollectorCanaryFlagName).toBe("TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED");
  expect(continuousIntelligenceShadowCollectorCanaryKillSwitchName).toBe("TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH");
  for (const value of [undefined, null, "", "false", "enabled"]) expect(isContinuousIntelligenceShadowCanaryEnabled(value)).toBe(false);
  for (const value of [undefined, null, "", "true", "malformed"]) expect(isContinuousIntelligenceShadowCanaryKillSwitchOff(value)).toBe(false);
  expect(isContinuousIntelligenceShadowCanaryEnabled("true")).toBe(true);
  expect(isContinuousIntelligenceShadowCanaryKillSwitchOff("0")).toBe(true);
  expect(preflight({ enabled_flag: undefined }).blockers).toContain("canary_disabled");
  expect(preflight({ kill_switch: undefined }).blockers).toContain("canary_kill_switch_active");
});

test("Action 574 uses only AAPL and a completed bounded New York range", () => {
  const now = new Date("2026-07-21T15:15:00.000Z");
  const range = buildContinuousIntelligenceShadowCanaryRange({
    now,
    calendar: buildUsEquityMarketCalendarEvaluation(now),
  });
  expect(continuousIntelligenceShadowCollectorCanaryAllowlist).toEqual(["AAPL"]);
  expect(range).toMatchObject({ ticker: "AAPL", interval: "5min" });
  expect(new Date(range?.end ?? 0).getTime() - new Date(range?.start ?? 0).getTime()).toBe(30 * 60 * 1000);
  const outsideCoverage = new Date("2029-07-19T15:15:00.000Z");
  expect(buildContinuousIntelligenceShadowCanaryRange({
    now: outsideCoverage,
    calendar: buildUsEquityMarketCalendarEvaluation(outsideCoverage),
  })).toBeNull();
});

test("Action 574 requires durable daily usage and enforces two-run/two-credit caps", () => {
  expect(preflight({ daily_usage: { status: "schema_unavailable", run_count: null, estimated_credits: null } }).blockers).toContain("daily_usage_unavailable");
  expect(preflight({ daily_usage: { status: "available", run_count: 1, estimated_credits: 1 } }).eligible).toBe(true);
  expect(preflight({ daily_usage: { status: "available", run_count: 2, estimated_credits: 1 } }).blockers).toContain("daily_run_limit_reached");
  expect(preflight({ daily_usage: { status: "available", run_count: 1, estimated_credits: 2 } }).blockers).toContain("daily_credit_limit_reached");
  expect(continuousIntelligenceShadowCollectorCanaryLimits.reserve_credits).toBe(0);
});

test("Action 574 has authenticated no-store canary routes and an unscheduled function foundation", () => {
  const fn = read(functionPath);
  const route = read(routePath);
  const preflightRoute = read(preflightRoutePath);
  expect(fn).toContain("export default async function handler");
  expect(fn).not.toContain("schedule:");
  expect(fn).not.toContain("cron");
  expect(route).toContain("export async function POST");
  expect(route).toContain("x-automation-secret");
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).not.toContain("operatorAuthorization");
  expect(route).toContain("claim.claim_id !== lifecycleIdentity.claim_id");
  expect(route.match(/claim_id: lifecycleIdentity\.claim_id/g)).toHaveLength(3);
  expect(preflightRoute).toContain("export async function POST");
  expect(preflightRoute).not.toContain("getIntradayCandlesWithDiagnostics");
  expect(route.indexOf("claimContinuousIntelligenceShadowCanaryDailyCapacity({")).toBeLessThan(
    route.indexOf("recheckContinuousIntelligenceShadowCanaryRuntime(preflight)"),
  );
  expect(route.indexOf("recheckContinuousIntelligenceShadowCanaryRuntime(preflight)")).toBeLessThan(
    route.indexOf("beginContinuousIntelligenceShadowCanaryAttempt({"),
  );
  expect(route.indexOf("beginContinuousIntelligenceShadowCanaryAttempt({")).toBeLessThan(
    route.indexOf("executeContinuousIntelligenceShadowCanary({"),
  );
  expect(route.indexOf("executeContinuousIntelligenceShadowCanary({")).toBeLessThan(
    route.indexOf("finalizeContinuousIntelligenceShadowCanaryDailyClaim({"),
  );
  expect(route.indexOf("finalizeContinuousIntelligenceShadowCanaryDailyClaim({")).toBeLessThan(
    route.indexOf("persistBoundedShadowCollectorProofAudit(receipt)"),
  );
});

function claimDatabase(): ContinuousIntelligenceShadowCanaryClaimDatabase & {
  rows: Map<string, ContinuousIntelligenceShadowCanaryClaimRow>;
} {
  const rows = new Map<string, ContinuousIntelligenceShadowCanaryClaimRow>();
  return {
    rows,
    async claim(input) {
      const existing = [...rows.values()].find((row) => row.execution_id === input.execution_id);
      if (existing) {
        return { data: { claimed: true, idempotent: true, claim_id: existing.claim_id, claim_status: existing.status, blocker: null }, error: null };
      }
      const dayRows = [...rows.values()].filter((row) => row.utc_day === input.utc_day);
      if (dayRows.length >= 2) return { data: { claimed: false, idempotent: false, claim_id: null, claim_status: null, blocker: "daily_run_limit_reached" }, error: null };
      if (dayRows.reduce((sum, row) => sum + row.estimated_credits, 0) + input.estimated_credits > 2) {
        return { data: { claimed: false, idempotent: false, claim_id: null, claim_status: null, blocker: "daily_credit_limit_reached" }, error: null };
      }
      rows.set(input.claim_id, {
        ...input,
        contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1",
        status: "claimed",
        provider_attempted: false,
        source_receipt_id: null,
        created_at: "2026-07-21T15:15:00.000Z",
        finalized_at: null,
      });
      return { data: { claimed: true, idempotent: false, claim_id: input.claim_id, claim_status: "claimed", blocker: null }, error: null };
    },
    async beginAttempt(input) {
      const row = rows.get(input.claim_id);
      if (
        !row ||
        row.execution_id !== input.execution_id ||
        row.request_fingerprint !== input.request_fingerprint ||
        row.contract_version !== input.expected_contract_version
      ) {
        return { data: { attempt_status: "daily_usage_unavailable", claim_id: null, claim_status: null }, error: null };
      }
      if (row.status === "claimed") {
        rows.set(row.claim_id, { ...row, status: "attempted", provider_attempted: true });
        return { data: { attempt_status: "attempt_started", claim_id: row.claim_id, claim_status: "attempted" }, error: null };
      }
      const attemptStatus = row.status === "attempted"
        ? "attempt_in_progress" as const
        : row.status === "completed"
          ? "already_completed" as const
          : "already_failed" as const;
      return { data: { attempt_status: attemptStatus, claim_id: row.claim_id, claim_status: row.status }, error: null };
    },
    async finalize(input) {
      const row = rows.get(input.claim_id);
      if (
        !row ||
        row.execution_id !== input.execution_id ||
        row.request_fingerprint !== input.request_fingerprint ||
        row.contract_version !== input.expected_contract_version
      ) return { data: { finalization_status: "daily_usage_unavailable", claim_id: null, claim_status: null, provider_attempted: null }, error: null };
      if (row.status === "attempted") {
        const updated = { ...row, status: input.status, provider_attempted: input.provider_attempted, source_receipt_id: input.source_receipt_id, finalized_at: input.finalized_at };
        rows.set(input.claim_id, updated);
        return { data: { finalization_status: "finalized", claim_id: input.claim_id, claim_status: updated.status, provider_attempted: updated.provider_attempted }, error: null };
      }
      if (row.status === "completed") return { data: { finalization_status: "already_completed", claim_id: row.claim_id, claim_status: row.status, provider_attempted: row.provider_attempted }, error: null };
      if (row.status === "failed") return { data: { finalization_status: "already_failed", claim_id: row.claim_id, claim_status: row.status, provider_attempted: row.provider_attempted }, error: null };
      return { data: { finalization_status: "invalid_transition", claim_id: row.claim_id, claim_status: null, provider_attempted: null }, error: null };
    },
  };
}

test("Action 574 atomically bounds claims across independent runtimes and keeps duplicate claims idempotent", async () => {
  const database = claimDatabase();
  const attempts = Array.from({ length: 12 }, (_, index) => {
    const store = createContinuousIntelligenceShadowCanaryClaimStore(database);
    const executionId = `canary-execution-${index}`;
    return store.claim({ claim_id: `canary-claim-${index}`, execution_id: executionId, request_fingerprint: `AAPL|5min|${index}`, utc_day: "2026-07-21", estimated_credits: 1 });
  });
  const results = await Promise.all(attempts);
  expect(results.filter((result) => result.claimed)).toHaveLength(2);
  expect(database.rows.size).toBe(2);
  expect([...database.rows.values()].reduce((sum, row) => sum + row.estimated_credits, 0)).toBe(2);

  const first = [...database.rows.values()][0];
  const duplicate = await createContinuousIntelligenceShadowCanaryClaimStore(database).claim({
    claim_id: "different-claim-id",
    execution_id: first.execution_id,
    request_fingerprint: first.request_fingerprint,
    utc_day: first.utc_day,
    estimated_credits: 1,
  });
  expect(duplicate).toMatchObject({ status: "already_claimed", claimed: true, idempotent: true, claim_id: first.claim_id });
  expect(database.rows.size).toBe(2);
});

test("Action 574 migration owns atomic day locking and retains failed attempted claims", () => {
  const migration = read(claimMigrationPath);
  expect(migration).toContain("pg_advisory_xact_lock");
  expect(migration).toContain("run_count >= 2");
  expect(migration).toContain("credit_count + p_estimated_credits > 2");
  expect(migration).toContain("execution_id text not null unique");
  expect(migration).toContain("status in ('claimed', 'attempted', 'completed', 'failed')");
  expect(migration).toContain("begin_continuous_intelligence_shadow_canary_attempt");
  expect(migration).toContain("and status = 'claimed'");
  expect(migration).toContain("set status = 'attempted'");
  expect(migration).toContain("finalize_continuous_intelligence_shadow_canary_attempt");
  expect(migration).toContain("p_terminal_status not in ('completed', 'failed')");
  expect(migration).toContain("and execution_id = p_execution_id");
  expect(migration).toContain("and request_fingerprint = p_request_fingerprint");
  expect(migration).toContain("and contract_version = p_expected_contract_version");
  expect(migration).toContain("grant execute on function public.finalize_continuous_intelligence_shadow_canary_attempt");
  expect(migration).toContain("to service_role");
  const persistence = read(claimPersistencePath);
  expect(persistence).toContain("continuousIntelligenceShadowCanaryFinalizeAttemptRpcName");
  expect(persistence).not.toContain('.update({');
  expect(migration).not.toContain("delete from public.continuous_intelligence_shadow_canary_daily_claims");
});

test("Action 574 failed provider capacity remains consumed and cannot be reused", async () => {
  const database = claimDatabase();
  const store = createContinuousIntelligenceShadowCanaryClaimStore(database);
  const first = await store.claim({ claim_id: "failed-claim", execution_id: "failed-execution", request_fingerprint: "failed-fingerprint", utc_day: "2026-07-21", estimated_credits: 1 });
  expect(first.claimed).toBe(true);
  expect(await store.beginAttempt({ claim_id: "failed-claim", execution_id: "failed-execution", request_fingerprint: "failed-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1" })).toMatchObject({ status: "attempt_started", provider_execution_allowed: true });
  expect(await store.finalize({ claim_id: "failed-claim", execution_id: "failed-execution", request_fingerprint: "failed-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1", status: "failed", provider_attempted: true, source_receipt_id: "failed-receipt", finalized_at: "2026-07-21T15:16:00.000Z" })).toMatchObject({ status: "finalized", finalization_proven: true, claim_status: "failed" });
  expect(database.rows.get("failed-claim")).toMatchObject({ status: "failed", provider_attempted: true, source_receipt_id: "failed-receipt" });
  expect((await store.claim({ claim_id: "second-claim", execution_id: "second-execution", request_fingerprint: "second-fingerprint", utc_day: "2026-07-21", estimated_credits: 1 })).claimed).toBe(true);
  expect(await store.claim({ claim_id: "third-claim", execution_id: "third-execution", request_fingerprint: "third-fingerprint", utc_day: "2026-07-21", estimated_credits: 1 })).toMatchObject({ claimed: false, status: "daily_run_limit_reached" });
  expect(await store.beginAttempt({ claim_id: "failed-claim", execution_id: "failed-execution", request_fingerprint: "failed-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1" })).toMatchObject({ status: "already_failed", provider_execution_allowed: false });
});

test("Action 574 begin-attempt grants one provider entrant across concurrent runtimes", async () => {
  const database = claimDatabase();
  const claimStore = createContinuousIntelligenceShadowCanaryClaimStore(database);
  await claimStore.claim({ claim_id: "race-claim", execution_id: "race-execution", request_fingerprint: "race-fingerprint", utc_day: "2026-07-21", estimated_credits: 1 });
  let providerCalls = 0;
  const submit = async () => {
    const attempt = await createContinuousIntelligenceShadowCanaryClaimStore(database).beginAttempt({
      claim_id: "race-claim",
      execution_id: "race-execution",
      request_fingerprint: "race-fingerprint",
      expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1",
    });
    if (attempt.provider_execution_allowed) providerCalls += 1;
    return attempt;
  };
  const results = await Promise.all(Array.from({ length: 12 }, submit));
  expect(results.filter((result) => result.status === "attempt_started")).toHaveLength(1);
  expect(results.filter((result) => result.status === "attempt_in_progress")).toHaveLength(11);
  expect(providerCalls).toBe(1);
  expect(database.rows.get("race-claim")).toMatchObject({ status: "attempted", provider_attempted: true });
});

test("Action 574 begin-attempt blocks terminal, missing, mismatched, and database-failure states", async () => {
  const database = claimDatabase();
  const store = createContinuousIntelligenceShadowCanaryClaimStore(database);
  await store.claim({ claim_id: "completed-claim", execution_id: "completed-execution", request_fingerprint: "completed-fingerprint", utc_day: "2026-07-21", estimated_credits: 1 });
  await store.beginAttempt({ claim_id: "completed-claim", execution_id: "completed-execution", request_fingerprint: "completed-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1" });
  await store.finalize({ claim_id: "completed-claim", execution_id: "completed-execution", request_fingerprint: "completed-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1", status: "completed", provider_attempted: true, source_receipt_id: "completed-receipt", finalized_at: "2026-07-21T15:16:00.000Z" });
  expect(await store.beginAttempt({ claim_id: "completed-claim", execution_id: "completed-execution", request_fingerprint: "completed-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1" })).toMatchObject({ status: "already_completed", provider_execution_allowed: false });
  expect(await store.beginAttempt({ claim_id: "completed-claim", execution_id: "wrong-execution", request_fingerprint: "completed-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1" })).toMatchObject({ status: "daily_usage_unavailable", provider_execution_allowed: false });
  expect(await store.beginAttempt({ claim_id: "missing-claim", execution_id: "missing-execution", request_fingerprint: "missing-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1" })).toMatchObject({ status: "daily_usage_unavailable", provider_execution_allowed: false });

  const failingDatabase = { ...database, async beginAttempt() { return { data: null, error: { code: "database_error" } }; } };
  expect(await createContinuousIntelligenceShadowCanaryClaimStore(failingDatabase).beginAttempt({ claim_id: "completed-claim", execution_id: "completed-execution", request_fingerprint: "completed-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1" })).toMatchObject({ status: "daily_usage_unavailable", provider_execution_allowed: false });
});

test("Action 574 finalization is exact-identity, attempted-only, single-winner, and terminal", async () => {
  const database = claimDatabase();
  const store = createContinuousIntelligenceShadowCanaryClaimStore(database);
  const completedIdentity = { claim_id: "finalize-completed", execution_id: "finalize-completed-execution", request_fingerprint: "finalize-completed-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1" as const };
  await store.claim({ ...completedIdentity, utc_day: "2026-07-21", estimated_credits: 1 });
  const terminalInput = { ...completedIdentity, status: "completed" as const, provider_attempted: true, source_receipt_id: "finalize-completed-receipt", finalized_at: "2026-07-21T15:16:00.000Z" };

  expect(await store.finalize(terminalInput)).toMatchObject({ status: "invalid_transition", finalization_proven: false });
  await store.beginAttempt(completedIdentity);
  expect(await store.finalize({ ...terminalInput, execution_id: "wrong-execution" })).toMatchObject({ status: "daily_usage_unavailable", finalization_proven: false });
  expect(await store.finalize({ ...terminalInput, request_fingerprint: "wrong-fingerprint" })).toMatchObject({ status: "daily_usage_unavailable", finalization_proven: false });
  expect(await store.finalize({ ...terminalInput, expected_contract_version: "wrong-contract" as never })).toMatchObject({ status: "daily_usage_unavailable", finalization_proven: false });

  const concurrent = await Promise.all([
    createContinuousIntelligenceShadowCanaryClaimStore(database).finalize(terminalInput),
    createContinuousIntelligenceShadowCanaryClaimStore(database).finalize(terminalInput),
  ]);
  expect(concurrent.filter((result) => result.status === "finalized")).toHaveLength(1);
  expect(concurrent.filter((result) => result.status === "already_completed")).toHaveLength(1);
  expect(await store.finalize({ ...terminalInput, status: "failed" })).toMatchObject({ status: "already_completed", claim_status: "completed" });
  expect(database.rows.get(completedIdentity.claim_id)).toMatchObject({ status: "completed", source_receipt_id: "finalize-completed-receipt" });

  const failedIdentity = { claim_id: "finalize-failed", execution_id: "finalize-failed-execution", request_fingerprint: "finalize-failed-fingerprint", expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1" as const };
  await store.claim({ ...failedIdentity, utc_day: "2026-07-21", estimated_credits: 1 });
  await store.beginAttempt(failedIdentity);
  expect(await store.finalize({ ...failedIdentity, status: "failed", provider_attempted: false, source_receipt_id: "finalize-failed-receipt", finalized_at: "2026-07-21T15:17:00.000Z" })).toMatchObject({ status: "finalized", claim_status: "failed", provider_attempted: false });
  expect(await store.finalize({ ...failedIdentity, status: "completed", provider_attempted: true, source_receipt_id: "overwrite-receipt", finalized_at: "2026-07-21T15:18:00.000Z" })).toMatchObject({ status: "already_failed", claim_status: "failed", provider_attempted: false });
  expect(database.rows.get(failedIdentity.claim_id)).toMatchObject({ status: "failed", provider_attempted: false, source_receipt_id: "finalize-failed-receipt" });
});

test("Action 574 post-begin pre-provider failure is retained without fabricating provider entry", async () => {
  const original = preflight();
  const lifecycleIdentity = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({ preflight: original, now: new Date("2026-07-21T15:15:00.000Z") });
  if (!lifecycleIdentity) throw new Error("Expected canary lifecycle identity.");
  const database = claimDatabase();
  const store = createContinuousIntelligenceShadowCanaryClaimStore(database);
  const claim = await store.claim({ ...lifecycleIdentity, estimated_credits: 1 });
  if (!claim.claimed) throw new Error("Expected durable claim.");
  const attempt = await store.beginAttempt(lifecycleIdentity);
  if (!attempt.provider_execution_allowed) throw new Error("Expected attempt start.");
  const runtimeRecheck = recheckContinuousIntelligenceShadowCanaryRuntime(original);
  let providerCalls = 0;
  const execution = await executeContinuousIntelligenceShadowCanary({
    preflight: original,
    lifecycle_identity: lifecycleIdentity,
    runtime_recheck: { ...runtimeRecheck, eligible: false, status: "blocked", safe_blocker: "canary_runtime_busy" },
    provider: async () => {
      providerCalls += 1;
      throw new Error("Provider must not be entered.");
    },
  });
  expect(execution.result).toMatchObject({ ok: false, blocker: "internal_execution_failure", provider_request_count: 0 });
  expect(providerCalls).toBe(0);
  const finalization = await store.finalize({ ...lifecycleIdentity, status: "failed", provider_attempted: false, source_receipt_id: "pre-provider-failure-receipt", finalized_at: "2026-07-21T15:16:00.000Z" });
  expect(finalization).toMatchObject({ status: "finalized", claim_status: "failed", provider_attempted: false });
  const receipt = buildContinuousIntelligenceShadowCanaryReceipt({ execution, claim, claim_status: finalization.finalization_proven ? finalization.claim_status : attempt.claim_status, now: new Date("2026-07-21T15:16:00.000Z") });
  expect(receipt).toMatchObject({ daily_claim_status: "failed", provider_attempt_occurred: false, provider_request_count: 0 });

  const unavailableFinalization = await createContinuousIntelligenceShadowCanaryClaimStore({ ...database, async finalize() { return { data: null, error: { code: "database_error" } }; } }).finalize({ ...lifecycleIdentity, status: "failed", provider_attempted: false, source_receipt_id: "unproven-receipt", finalized_at: "2026-07-21T15:17:00.000Z" });
  const conservativeReceipt = buildContinuousIntelligenceShadowCanaryReceipt({ execution, claim, claim_status: unavailableFinalization.finalization_proven ? unavailableFinalization.claim_status : attempt.claim_status, now: new Date("2026-07-21T15:17:00.000Z") });
  expect(conservativeReceipt).toMatchObject({ daily_claim_status: "attempted", provider_attempt_occurred: false });
});

test("Action 574 receipt is frozen from the exact execution context and explicitly identifies canary source", async () => {
  const original = preflight();
  const lifecycleIdentity = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({ preflight: original, now: new Date("2026-07-21T15:15:00.000Z") });
  if (!lifecycleIdentity) throw new Error("Expected canary lifecycle identity.");
  const runtimeRecheck = recheckContinuousIntelligenceShadowCanaryRuntime(original);
  const workloadId = original.canonical_execution_context?.proof_preflight.planner.authorization?.workload_id;
  const execution = await executeContinuousIntelligenceShadowCanary({
    preflight: original,
    lifecycle_identity: lifecycleIdentity,
    runtime_recheck: runtimeRecheck,
    provider: async () => ({
      provider: "twelve_data",
      provider_call_count: 1,
      estimated_credits: 1,
      actual_credits: 1,
      provider_outcome: "success",
      provider_status: "available",
      provider_error_category: null,
      fallback_used: false,
      response_structurally_valid: true,
      retry_count: 0,
      rate_limited: false,
      candles: [{ timestamp: Date.parse("2026-07-21T15:05:00.000Z") / 1000, open: 100, high: 101, low: 99, close: 100.5, volume: 10 }],
    }),
  });
  if (original.canonical_execution_context?.proof_preflight.planner.authorization) {
    original.canonical_execution_context.proof_preflight.planner.authorization.workload_id = "mutated-after-execution";
    original.canonical_execution_context.proof_preflight.provider.metadata_status = "unresolved";
  }
  const receipt = buildContinuousIntelligenceShadowCanaryReceipt({
    execution,
    claim: { status: "claimed", claimed: true, idempotent: false, claim_id: lifecycleIdentity.claim_id, claim_status: "claimed", safe_blocker: null },
    claim_status: "completed",
    now: new Date("2026-07-21T15:16:00.000Z"),
  });
  expect(receipt).toMatchObject({
    entry_kind: "scheduled_shadow_collector_canary",
    daily_claim_id: lifecycleIdentity.claim_id,
    daily_claim_status: "completed",
    provider_metadata_status: "within_budget",
    planner: { authorization: { workload_id: workloadId } },
    safe_operator_message: "Scheduled shadow canary completed with sanitized candle aggregates.",
  });
  expect(JSON.stringify(receipt)).not.toContain("mutated-after-execution");
});

test("Action 574 canary receipt construction contains no reconstructed provider or planner authority", () => {
  const source = read("lib/continuous-intelligence-shadow-collector-canary.ts");
  const receiptBuilder = source.slice(
    source.indexOf("export function buildContinuousIntelligenceShadowCanaryReceipt"),
    source.indexOf("export function buildContinuousIntelligenceShadowCanaryReceiptId"),
  );
  expect(receiptBuilder).not.toContain('provider_metadata_status: "within_budget"');
  expect(receiptBuilder).not.toContain("provider_configured: true");
  expect(receiptBuilder).not.toContain("buildBoundedShadowCollectorExecutionProofPlan");
  expect(receiptBuilder).toContain("context.proof_preflight");
});

test("Action 574 deterministic execution ids bind one UTC day and request fingerprint", () => {
  const first = buildContinuousIntelligenceShadowCanaryExecutionId({ utc_day: "2026-07-21", request_fingerprint: "AAPL|5min|range" });
  expect(buildContinuousIntelligenceShadowCanaryExecutionId({ utc_day: "2026-07-21", request_fingerprint: "AAPL|5min|range" })).toBe(first);
  expect(buildContinuousIntelligenceShadowCanaryExecutionId({ utc_day: "2026-07-22", request_fingerprint: "AAPL|5min|range" })).not.toBe(first);
});

test("Action 574 diagnostics expose the durable single-winner provider-entry contract", () => {
  expect(buildContinuousIntelligenceShadowCanaryDiagnostics()).toMatchObject({
    schedule_active: "unknown",
    atomic_daily_claim_required: true,
    atomic_begin_attempt_required: true,
    atomic_finalization_required: true,
    finalization_identity_bound: true,
    direct_finalization_update_allowed: false,
    provider_entry_grant: "attempt_started_only",
    terminal_claim_retry_allowed: false,
    cross_instance_cap_enforced_by_database: true,
    process_local_lock_is_daily_cap_authority: false,
  });
});
