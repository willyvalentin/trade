import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import {
  buildMarketContextDiagnosticReplayScheduleV1,
  MARKET_CONTEXT_DIAGNOSTIC_METRIC_DERIVATION_V1,
  MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_REPLAY_MARKERS,
  MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1,
  stableDiagnosticReplayJsonV1,
  type MarketContextDiagnosticReplayCalendarSessionV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-replay-schedule-v1";

type CalendarArtifact = {
  canonical_json_material: {
    sessions: MarketContextDiagnosticReplayCalendarSessionV1[];
  };
};

function calendarSessions() {
  const paths = [
    "docs/evidence/market-context-xnys-calibration-calendar-2026-v1.json",
    "docs/evidence/market-context-xnys-acquisition-calendar-2026-v1.json",
  ];
  return paths
    .flatMap((path) => {
      const artifact = JSON.parse(
        readFileSync(path, "utf8"),
      ) as CalendarArtifact;
      return artifact.canonical_json_material.sessions;
    })
    .sort((first, second) => first.date.localeCompare(second.date));
}

function canonicalEvidenceDigest(value: unknown) {
  return createHash("sha256")
    .update(stableDiagnosticReplayJsonV1(value))
    .digest("hex");
}

function fileSha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("M.5I schedule is exactly 60 point-in-time decisions", () => {
  const schedule =
    buildMarketContextDiagnosticReplayScheduleV1(calendarSessions());

  expect(MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1).toBe(
    "market_context_diagnostic_replay_schedule_2026_20_sessions_v1",
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1).toBe(
    "market_context_real_diagnostic_historical_shadow_replay_v1",
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_METRIC_DERIVATION_V1).toBe(
    "market_context_diagnostic_metric_derivation_v1",
  );
  expect(schedule).toHaveLength(60);
  expect(new Set(schedule.map((decision) => decision.decision_id)).size).toBe(
    60,
  );
  expect(
    schedule.filter((decision) =>
      decision.session_date.startsWith("2026-07"),
    )[0],
  ).toMatchObject({
    eastern_time: "10:30:02",
    decision_timestamp: "2026-07-01T14:30:02.000Z",
    finalized_minute_count: 60,
    provisional_watermark_ns: "2000000000",
  });
  expect(schedule.at(-1)).toMatchObject({
    session_date: "2026-07-24",
    eastern_time: "15:30:02",
    decision_timestamp: "2026-07-24T19:30:02.000Z",
    finalized_minute_count: 360,
  });
});

test("schedule is deterministic under calendar input reversal", () => {
  const sessions = calendarSessions();
  const canonical =
    buildMarketContextDiagnosticReplayScheduleV1(sessions);
  const reversed =
    buildMarketContextDiagnosticReplayScheduleV1([...sessions].reverse());

  expect(stableDiagnosticReplayJsonV1(reversed)).toBe(
    stableDiagnosticReplayJsonV1(canonical),
  );
});

test("schedule fails closed on missing, early-close, or duration drift", () => {
  const missing = calendarSessions();
  missing.pop();
  expect(() =>
    buildMarketContextDiagnosticReplayScheduleV1(missing),
  ).toThrow("market_context_diagnostic_replay_schedule_session_drift");

  const earlyClose = structuredClone(calendarSessions());
  earlyClose[0]!.early_close = true as false;
  expect(() =>
    buildMarketContextDiagnosticReplayScheduleV1(earlyClose),
  ).toThrow("market_context_diagnostic_replay_schedule_non_regular");

  const durationDrift = structuredClone(calendarSessions());
  durationDrift[0]!.close_unix_ns = durationDrift[0]!.open_unix_ns;
  expect(() =>
    buildMarketContextDiagnosticReplayScheduleV1(durationDrift),
  ).toThrow("market_context_diagnostic_replay_schedule_duration_drift");
});

test("diagnostic markers prohibit official, performance, probability, and live claims", () => {
  expect(MARKET_CONTEXT_DIAGNOSTIC_REPLAY_MARKERS).toEqual({
    diagnostic_all_reported_trades: true,
    official_ohlcv_claimed: false,
    canonical_performance_eligible: false,
    sale_condition_semantics_available: false,
    watermark_status: "empirically_unvalidated",
    shadow_only: true,
    live_ranking_effect: false,
    calibrated_probability: false,
  });
});

test("M.5I sanitized evidence is canonical and reconciles the replay", () => {
  const evidence = JSON.parse(
    readFileSync(
      "docs/evidence/action-667m5i-real-diagnostic-shadow-replay.json",
      "utf8",
    ),
  );
  expect(canonicalEvidenceDigest(evidence.decision_material)).toBe(
    evidence.evidence_digest,
  );
  expect(evidence.decision_material.statuses).toMatchObject({
    action_667m5i_diagnostic_replay_completed: true,
    action_667m5i_sixty_decisions_reconciled: true,
    action_667m5i_point_in_time_safety_passed: true,
    action_667m5i_two_run_determinism_passed: true,
    action_667m5i_cross_timezone_determinism_passed: true,
    action_667m5i_replay_evidence_ready: true,
    action_667m5j_replay_freeze_ready: true,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
  expect(evidence.decision_material.replay.decision_count).toBe(60);
  expect(
    evidence.decision_material.replay.performance_metrics_computed,
  ).toEqual([]);
  expect(
    evidence.decision_material.point_in_time
      .future_input_points_passed_to_core,
  ).toBe(0);
  expect(
    fileSha256(
      evidence.decision_material.implementation_bindings.schedule_path,
    ),
  ).toBe(
    evidence.decision_material.implementation_bindings.schedule_sha256,
  );
  expect(
    fileSha256(
      evidence.decision_material.implementation_bindings.runner_path,
    ),
  ).toBe(
    evidence.decision_material.implementation_bindings.runner_sha256,
  );
});

test("M.5I implementation has no provider, database, or live consumer import", () => {
  const implementation = readFileSync(
    "scripts/market_context_diagnostic_replay_v1.ts",
    "utf8",
  );
  const schedule = readFileSync(
    "lib/market-context-intelligence-lab/diagnostic-replay-schedule-v1.ts",
    "utf8",
  );
  expect(`${implementation}\n${schedule}`).not.toMatch(
    /from\s+["'][^"']*(?:databento|supabase|scanner|recommendation|publication|capture|database)[^"']*["']/i,
  );
  expect(implementation).not.toContain("DATABENTO_API_KEY");
  expect(implementation).not.toContain("canonical_outcomes:");
});
