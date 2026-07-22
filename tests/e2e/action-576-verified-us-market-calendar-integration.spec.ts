import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryActivationReadiness,
  buildContinuousIntelligenceShadowCanaryMarketCalendarReadinessFacts,
  type ContinuousIntelligenceShadowCanaryActivationReadinessInput,
} from "../../lib/continuous-intelligence-shadow-canary-activation-readiness";
import {
  buildContinuousIntelligenceShadowCanaryDiagnostics,
  buildContinuousIntelligenceShadowCanaryPreflight,
  buildContinuousIntelligenceShadowCanaryRange,
} from "../../lib/continuous-intelligence-shadow-collector-canary";
import {
  buildUsEquityMarketCalendarDiagnostics,
  buildUsEquityMarketCalendarEvaluation,
  computeUsEquityMarketCalendarFingerprint,
  getCalendarCoverageStatus,
  getLatestCompletedRegularSessionRange,
  getUsEquityMarketSession,
  isUsEquityRegularTradingDay,
  usEquityMarketCalendarDataset,
  usEquityMarketCalendarValidation,
  validateUsEquityMarketCalendarDataset,
  type UsEquityMarketCalendarDataset,
} from "../../lib/us-equity-market-calendar";

const calendarPath = "lib/us-equity-market-calendar.ts";
const datasetPath = "data/us-equity-market-calendar.json";
const canaryRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/route.ts";
const preflightRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/preflight/route.ts";
const readinessRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/activation-readiness/route.ts";
const canaryFunctionPath = "netlify/functions/scheduled-shadow-collector-canary.ts";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function dataset() {
  if (!usEquityMarketCalendarDataset) throw new Error("Expected verified calendar fixture.");
  return structuredClone(usEquityMarketCalendarDataset);
}

function reseal(value: UsEquityMarketCalendarDataset) {
  value.dataset_fingerprint = computeUsEquityMarketCalendarFingerprint(value);
  return value;
}

function preflight(now: Date) {
  return buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    calendar: buildUsEquityMarketCalendarEvaluation(now),
    enabled_flag: "true",
    kill_switch: "false",
    provider_configured: true,
    provider_metadata_status: "within_budget",
    daily_usage: { status: "available", run_count: 0, estimated_credits: 0 },
  });
}

function readinessInput(
  now: Date,
  overrides: Partial<ContinuousIntelligenceShadowCanaryActivationReadinessInput> = {},
): ContinuousIntelligenceShadowCanaryActivationReadinessInput {
  return {
    now,
    deployment: {
      audit_route_present: true,
      ledger_route_present: true,
      ledger_reconcile_route_present: true,
      canary_route_present: true,
      canary_preflight_route_present: true,
      canary_function_foundation_present: true,
      expected_contract_versions_present: true,
    },
    schema: {
      probe_status: "available",
      probe_contract_version: "continuous_intelligence_shadow_canary_readiness_probe_v1",
      audit_table_available: true,
      ledger_table_available: true,
      claim_table_available: true,
      claim_rpc_available: true,
      begin_attempt_rpc_available: true,
      finalize_attempt_rpc_available: true,
      lifecycle_rpcs_public_executable: false,
      lifecycle_rpcs_anon_executable: false,
      lifecycle_rpcs_authenticated_executable: false,
      lifecycle_rpcs_service_role_executable: true,
      audit_canary_entry_kind_constrained: true,
      audit_no_effect_constraint_available: true,
      ledger_canary_entry_kind_constrained: true,
      ledger_zero_reserve_constraint_available: true,
      claim_status_constraint_available: true,
    },
    flags: {
      durable_audit: "enabled",
      credit_ledger: "enabled",
      canary: "disabled",
      kill_switch: "enabled",
    },
    provider_budget: {
      provider_configured: true,
      metadata_status: "within_budget",
      policy_total_credits: 377,
      policy_hard_reserve_credits: 57,
      policy_normal_planned_max_credits: 320,
      one_credit_normal_allocation_authorized: true,
      hard_reserve_preserved: true,
      execution_ready_reserve_consumed: false,
    },
    market_calendar: buildContinuousIntelligenceShadowCanaryMarketCalendarReadinessFacts(
      buildUsEquityMarketCalendarEvaluation(now),
    ),
    schedule: {
      function_foundation_present: true,
      repository_schedule_declaration: "absent",
      deployment_schedule_declaration: "absent",
      remote_schedule_active: "absent",
      duplicate_schedule_mechanism: "absent",
      future_frequency_selection: "absent",
    },
    manual_canary_evidence_verified: false,
    ...overrides,
  };
}

test("Action 576 accepts the pinned reviewed dataset and its deterministic fingerprint", () => {
  expect(usEquityMarketCalendarValidation).toMatchObject({
    status: "verified",
    errors: [],
    computed_fingerprint: "fnv1a32:6aa61e36",
  });
  expect(usEquityMarketCalendarDataset).toMatchObject({
    coverage_start: "2026-01-01",
    coverage_end: "2028-12-31",
    timezone: "America/New_York",
    provenance: {
      source_category: "repository_pinned_official_exchange_calendar",
      review_status: "reviewed",
    },
  });
});

test("Action 576 rejects malformed contracts, timezone, provenance, and fingerprints", () => {
  const malformed = dataset();
  malformed.contract_version = "wrong" as UsEquityMarketCalendarDataset["contract_version"];
  expect(validateUsEquityMarketCalendarDataset(reseal(malformed)).errors).toContain("contract_version_invalid");

  const wrongTimezone = dataset();
  wrongTimezone.timezone = "UTC" as UsEquityMarketCalendarDataset["timezone"];
  expect(validateUsEquityMarketCalendarDataset(reseal(wrongTimezone)).errors).toContain("timezone_invalid");

  const missingProvenance = dataset() as unknown as Record<string, unknown>;
  delete missingProvenance.provenance;
  expect(validateUsEquityMarketCalendarDataset(missingProvenance).errors).toContain("provenance_missing");

  const mismatched = dataset();
  mismatched.exceptions[0].reason = "mutated after review";
  expect(validateUsEquityMarketCalendarDataset(mismatched).errors).toContain("dataset_fingerprint_mismatch");
});

test("Action 576 rejects duplicate, unsorted, invalid, and unjustified weekend sessions", () => {
  const duplicate = dataset();
  duplicate.exceptions.splice(1, 0, structuredClone(duplicate.exceptions[0]));
  expect(validateUsEquityMarketCalendarDataset(reseal(duplicate)).errors).toContain("exception_date_duplicate");

  const unsorted = dataset();
  [unsorted.exceptions[0], unsorted.exceptions[1]] = [unsorted.exceptions[1], unsorted.exceptions[0]];
  expect(validateUsEquityMarketCalendarDataset(reseal(unsorted)).errors).toContain("exception_dates_unsorted");

  const invalidRange = dataset();
  const early = invalidRange.exceptions.find((item) => item.session_type === "early_close_session");
  if (!early) throw new Error("Expected early-close fixture.");
  early.open_local_time = "14:00";
  early.close_local_time = "13:00";
  expect(validateUsEquityMarketCalendarDataset(reseal(invalidRange)).errors).toContain("early_close_range_invalid");

  const weekend = dataset();
  weekend.exceptions.push({ market_date: "2026-07-18", session_type: "early_close_session", open_local_time: "09:30", close_local_time: "13:00", reason: "Test weekend" });
  weekend.exceptions.sort((first, second) => first.market_date.localeCompare(second.market_date));
  expect(validateUsEquityMarketCalendarDataset(reseal(weekend)).errors).toContain("weekend_open_unjustified");
});

test("Action 576 selects only completed regular-session blocks", () => {
  expect(getUsEquityMarketSession("2026-07-22")).toMatchObject({
    session_type: "regular_session",
    session_open: "2026-07-22T13:30:00.000Z",
    session_close: "2026-07-22T20:00:00.000Z",
  });
  expect(getLatestCompletedRegularSessionRange(new Date("2026-07-22T13:00:00.000Z"), 30)).toMatchObject({ market_date: "2026-07-21", start: "2026-07-21T19:30:00.000Z", end: "2026-07-21T20:00:00.000Z" });
  expect(getLatestCompletedRegularSessionRange(new Date("2026-07-22T13:30:00.000Z"), 30)).toMatchObject({ market_date: "2026-07-21" });
  expect(getLatestCompletedRegularSessionRange(new Date("2026-07-22T13:59:59.000Z"), 30)).toMatchObject({ market_date: "2026-07-21" });
  expect(getLatestCompletedRegularSessionRange(new Date("2026-07-22T14:00:00.000Z"), 30)).toMatchObject({ market_date: "2026-07-22", start: "2026-07-22T13:30:00.000Z", end: "2026-07-22T14:00:00.000Z" });
  expect(getLatestCompletedRegularSessionRange(new Date("2026-07-22T19:59:59.000Z"), 30)).toMatchObject({ start: "2026-07-22T19:00:00.000Z", end: "2026-07-22T19:30:00.000Z" });
  expect(getLatestCompletedRegularSessionRange(new Date("2026-07-22T20:00:00.000Z"), 30)).toMatchObject({ start: "2026-07-22T19:30:00.000Z", end: "2026-07-22T20:00:00.000Z" });
  expect(getLatestCompletedRegularSessionRange(new Date("2026-07-22T22:00:00.000Z"), 30)).toMatchObject({ start: "2026-07-22T19:30:00.000Z", end: "2026-07-22T20:00:00.000Z" });
});

test("Action 576 converts New York sessions across both DST transitions", () => {
  expect(getUsEquityMarketSession("2026-03-06").session_open).toBe("2026-03-06T14:30:00.000Z");
  expect(getUsEquityMarketSession("2026-03-09").session_open).toBe("2026-03-09T13:30:00.000Z");
  expect(getUsEquityMarketSession("2026-10-30").session_open).toBe("2026-10-30T13:30:00.000Z");
  expect(getUsEquityMarketSession("2026-11-02").session_open).toBe("2026-11-02T14:30:00.000Z");
});

test("Action 576 handles weekends, verified holidays, observed holidays, and special closures", () => {
  expect(getUsEquityMarketSession("2026-07-18").session_type).toBe("closed_weekend");
  expect(getUsEquityMarketSession("2026-07-19").session_type).toBe("closed_weekend");
  expect(getUsEquityMarketSession("2026-01-01")).toMatchObject({ session_type: "closed_holiday", closed_reason: "New Year's Day" });
  expect(getUsEquityMarketSession("2026-07-03")).toMatchObject({ session_type: "closed_holiday", closed_reason: "Independence Day observed" });
  expect(getLatestCompletedRegularSessionRange(new Date("2026-07-19T16:00:00.000Z"), 30)).toMatchObject({ market_date: "2026-07-17", end: "2026-07-17T20:00:00.000Z" });

  const special = dataset();
  special.exceptions.push({ market_date: "2026-07-23", session_type: "closed_special", reason: "Verified special closure fixture" });
  special.exceptions.sort((first, second) => first.market_date.localeCompare(second.market_date));
  expect(getUsEquityMarketSession("2026-07-23", reseal(special))).toMatchObject({ session_type: "closed_special", closed_reason: "Verified special closure fixture" });
});

test("Action 576 respects early closes and never requests beyond 13:00 ET", () => {
  const session = getUsEquityMarketSession("2026-11-27");
  const range = getLatestCompletedRegularSessionRange(new Date("2026-11-27T20:00:00.000Z"), 30);
  expect(session).toMatchObject({ session_type: "early_close_session", early_close: true, session_close: "2026-11-27T18:00:00.000Z" });
  expect(range).toMatchObject({ market_date: "2026-11-27", start: "2026-11-27T17:30:00.000Z", end: "2026-11-27T18:00:00.000Z" });

  const short = dataset();
  short.coverage_start = "2026-01-02";
  short.exceptions = [{ market_date: "2026-01-02", session_type: "early_close_session", open_local_time: "09:30", close_local_time: "09:45", reason: "Verified short-session fixture" }];
  expect(getLatestCompletedRegularSessionRange(new Date("2026-01-02T16:00:00.000Z"), 30, reseal(short))).toMatchObject({ status: "unavailable", safe_blocker: "range_unavailable" });
});

test("Action 576 applies bounded coverage and explicit freshness semantics", () => {
  expect(getCalendarCoverageStatus("2026-07-22")).toMatchObject({ coverage_status: "covered", verification_status: "verified", freshness_status: "current" });
  expect(getCalendarCoverageStatus("2028-02-01")).toMatchObject({ verification_status: "verified", freshness_status: "expiring_soon" });
  expect(getCalendarCoverageStatus("2028-07-02")).toMatchObject({ verification_status: "stale", freshness_status: "expiring_soon" });
  expect(getCalendarCoverageStatus("2025-12-31")).toMatchObject({ coverage_status: "before_coverage", verification_status: "unavailable", freshness_status: "expired" });
  expect(getCalendarCoverageStatus("2029-01-01")).toMatchObject({ coverage_status: "after_coverage", verification_status: "unavailable", freshness_status: "expired" });
  expect(getUsEquityMarketSession("2029-01-01").session_type).toBe("unknown");
  expect(getUsEquityMarketSession("2026-07-22", null)).toMatchObject({ verification_status: "invalid", freshness_status: "unverified", session_type: "unknown" });
});

test("Action 576 canary preflight consumes only the verified completed range", () => {
  const now = new Date("2026-07-22T15:15:00.000Z");
  const result = preflight(now);
  expect(result).toMatchObject({
    eligible: true,
    request: { ticker: "AAPL", interval: "5min", start: "2026-07-22T14:30:00.000Z", end: "2026-07-22T15:00:00.000Z" },
    market_calendar: { verification_status: "verified", session_type: "regular_session", early_close: false },
    no_effect_boundary: { provider_calls_executed: false, durable_writes_executed: false, schedule_changes: false },
  });
  expect(buildContinuousIntelligenceShadowCanaryRange({ now, calendar: result.market_calendar })).toEqual(result.request);

  const staleNow = new Date("2028-07-05T15:15:00.000Z");
  expect(preflight(staleNow)).toMatchObject({ eligible: false, blockers: expect.arrayContaining(["canary_market_calendar_unavailable", "canary_range_unavailable"]) });
});

test("Action 576 readiness advances only for a verified fresh calendar", () => {
  const now = new Date("2026-07-22T14:30:00.000Z");
  const ready = buildContinuousIntelligenceShadowCanaryActivationReadiness(readinessInput(now));
  expect(ready).toMatchObject({ readiness_status: "ready", decision: "ready_for_one_manual_canary_attempt", market_calendar_facts: { verified_calendar_ready: true, provenance_available: true, early_close_awareness_available: true } });
  expect(ready.recommended_next_action).toContain("Observe production preflight");

  const laterReview = buildContinuousIntelligenceShadowCanaryActivationReadiness(readinessInput(now, { manual_canary_evidence_verified: true }));
  expect(laterReview.decision).toBe("ready_for_schedule_activation_review");

  const staleNow = new Date("2028-07-05T15:15:00.000Z");
  const stale = buildContinuousIntelligenceShadowCanaryActivationReadiness(readinessInput(staleNow));
  expect(stale).toMatchObject({ decision: "ready_for_preflight_observation", market_calendar_facts: { verification_status: "stale", verified_calendar_ready: false } });
  expect(stale.recommended_next_action).toContain("Refresh the pinned verified US market calendar");

  const missingProvenance = readinessInput(now);
  missingProvenance.market_calendar = { ...missingProvenance.market_calendar, provenance_available: false };
  const missingProvenanceResult = buildContinuousIntelligenceShadowCanaryActivationReadiness(missingProvenance);
  expect(missingProvenanceResult.market_calendar_facts.verified_calendar_ready).toBe(false);
  expect(missingProvenanceResult.recommended_next_action).toContain("Integrate or repair");

  const unknownSchedule = readinessInput(now);
  unknownSchedule.schedule = { ...unknownSchedule.schedule, remote_schedule_active: "unknown" };
  const unknownScheduleResult = buildContinuousIntelligenceShadowCanaryActivationReadiness(unknownSchedule);
  expect(unknownScheduleResult).toMatchObject({ decision: "ready_for_preflight_observation", blockers: ["schedule_state_unverified"] });
  expect(unknownScheduleResult.recommended_next_action).toContain("sanitized deployment schedule-state signals");

  const migrationsMissing = readinessInput(now);
  migrationsMissing.schema = {
    ...migrationsMissing.schema,
    probe_status: "schema_unavailable",
    audit_table_available: false,
  };
  expect(buildContinuousIntelligenceShadowCanaryActivationReadiness(migrationsMissing).recommended_next_action).toContain("Apply the approved Actions 572-575 migrations");

  const flagsMissing = readinessInput(now);
  flagsMissing.flags = { ...flagsMissing.flags, durable_audit: "disabled" };
  expect(buildContinuousIntelligenceShadowCanaryActivationReadiness(flagsMissing).recommended_next_action).toContain("Configure durable audit and credit-ledger flags");
});

test("Action 576 exposes sanitized passive diagnostics without the dataset", () => {
  expect(buildUsEquityMarketCalendarDiagnostics(new Date("2026-07-22T15:15:00.000Z"))).toEqual(expect.objectContaining({
    contract_version: "us_equity_market_calendar_v1",
    dataset_fingerprint: "fnv1a32:6aa61e36",
    verification_status: "verified",
    coverage_start: "2026-01-01",
    coverage_end: "2028-12-31",
    early_close_awareness_available: true,
    holiday_awareness_available: true,
    latest_completed_range_status: "available",
    provider_calls_inferred: false,
    durable_writes_inferred: false,
    schedule_changed: false,
  }));
});

test("Action 576 passive canary diagnostics distinguish artifact validation from current observation", () => {
  const unobserved = buildContinuousIntelligenceShadowCanaryDiagnostics();
  expect(unobserved).toMatchObject({
    market_calendar_dataset_validation_status: "not_observed",
    market_calendar_verification_status: "not_observed",
    market_calendar_current_coverage_status: "not_observed",
    market_calendar_freshness_status: "not_observed",
    market_calendar_early_close_awareness: "not_observed",
    market_calendar_holiday_awareness: "not_observed",
    market_calendar_latest_completed_range_status: "not_observed",
  });

  const artifactOnly = buildContinuousIntelligenceShadowCanaryDiagnostics({
    dataset_validation_status: usEquityMarketCalendarValidation.status,
  });
  expect(artifactOnly).toMatchObject({
    market_calendar_dataset_validation_status: "verified",
    market_calendar_verification_status: "not_observed",
    market_calendar_current_coverage_status: "not_observed",
  });

  const mismatched = dataset();
  mismatched.exceptions[0].reason = "fingerprint mismatch fixture";
  const invalidValidation = validateUsEquityMarketCalendarDataset(mismatched);
  const invalid = buildContinuousIntelligenceShadowCanaryDiagnostics({
    dataset_validation_status: invalidValidation.status,
  });
  expect(invalid).toMatchObject({
    market_calendar_dataset_validation_status: "invalid",
    market_calendar_verification_status: "invalid",
    market_calendar_current_coverage_status: "not_observed",
  });

  const stale = buildContinuousIntelligenceShadowCanaryDiagnostics({
    dataset_validation_status: usEquityMarketCalendarValidation.status,
    calendar_evaluation: buildUsEquityMarketCalendarEvaluation(
      new Date("2028-07-05T15:15:00.000Z"),
    ),
  });
  expect(stale).toMatchObject({
    market_calendar_verification_status: "stale",
    market_calendar_current_coverage_status: "covered",
    market_calendar_freshness_status: "expiring_soon",
    market_calendar_latest_completed_range_status: "unavailable",
  });

  const outsideCoverage = buildContinuousIntelligenceShadowCanaryDiagnostics({
    dataset_validation_status: usEquityMarketCalendarValidation.status,
    calendar_evaluation: buildUsEquityMarketCalendarEvaluation(
      new Date("2029-01-02T15:15:00.000Z"),
    ),
  });
  expect(outsideCoverage).toMatchObject({
    market_calendar_verification_status: "unavailable",
    market_calendar_current_coverage_status: "after_coverage",
    market_calendar_freshness_status: "expired",
    market_calendar_holiday_awareness: false,
    market_calendar_latest_completed_range_status: "unavailable",
  });

  const observed = buildContinuousIntelligenceShadowCanaryDiagnostics({
    dataset_validation_status: usEquityMarketCalendarValidation.status,
    calendar_evaluation: buildUsEquityMarketCalendarEvaluation(
      new Date("2026-07-22T15:15:00.000Z"),
    ),
  });
  expect(observed).toMatchObject({
    market_calendar_dataset_validation_status: "verified",
    market_calendar_verification_status: "verified",
    market_calendar_current_coverage_status: "covered",
    market_calendar_freshness_status: "current",
    market_calendar_early_close_awareness: true,
    market_calendar_holiday_awareness: true,
    market_calendar_latest_completed_range_status: "available",
    market_calendar_provider_calls_inferred: false,
    market_calendar_durable_writes_inferred: false,
    market_calendar_schedule_changed: false,
  });
});

test("Action 576 production integration is fixed-source and has no planning side effects", () => {
  const calendarSource = read(calendarPath);
  const datasetSource = read(datasetPath);
  const canaryRoute = read(canaryRoutePath);
  const preflightRoute = read(preflightRoutePath);
  const readinessRoute = read(readinessRoutePath);
  const canaryFunction = read(canaryFunctionPath);
  const tradeApp = read("app/trade-app.tsx");

  expect(calendarSource).not.toMatch(/\bfetch\s*\(|getIntradayCandles|supabase|\.from\s*\(|\.rpc\s*\(/i);
  expect(datasetSource).not.toMatch(/https?:\/\//);
  expect(canaryRoute).toContain("buildUsEquityMarketCalendarEvaluation(now)");
  expect(preflightRoute).toContain("buildUsEquityMarketCalendarEvaluation(now)");
  expect(readinessRoute).toContain("buildUsEquityMarketCalendarEvaluation(now)");
  expect(canaryRoute).not.toContain("calendar: { available: false");
  expect(preflightRoute).not.toContain("calendar: { available: false");
  expect(readinessRoute).not.toMatch(/source_configured:\s*false|source_verified:\s*false/);
  expect(preflightRoute).not.toMatch(/getIntradayCandles|claimContinuous|persistBounded|persistContinuous/);
  expect(readinessRoute).not.toMatch(/getIntradayCandles|claimContinuous|beginContinuous|finalizeContinuous|persistBounded|persistContinuous/);
  expect(canaryFunction).not.toContain("schedule:");
  expect(canaryFunction).not.toContain("cron");
  expect(tradeApp).not.toContain("us-equity-market-calendar.ts");
  expect(isUsEquityRegularTradingDay("2026-07-22")).toBe(true);
});
