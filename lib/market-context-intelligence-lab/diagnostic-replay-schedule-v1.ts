import { createHash } from "node:crypto";

export const MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1 =
  "market_context_diagnostic_replay_schedule_2026_20_sessions_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1 =
  "market_context_real_diagnostic_historical_shadow_replay_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_METRIC_DERIVATION_V1 =
  "market_context_diagnostic_metric_derivation_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_REPLAY_DATASET_ID =
  "eq_us_mini_diagnostic_all_reported_trades_20_sessions_1m_v1" as const;

export const MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SESSION_DATES = [
  "2026-06-26",
  "2026-06-29",
  "2026-06-30",
  "2026-07-01",
  "2026-07-02",
  "2026-07-06",
  "2026-07-07",
  "2026-07-08",
  "2026-07-09",
  "2026-07-10",
  "2026-07-13",
  "2026-07-14",
  "2026-07-15",
  "2026-07-16",
  "2026-07-17",
  "2026-07-20",
  "2026-07-21",
  "2026-07-22",
  "2026-07-23",
  "2026-07-24",
] as const;

export const MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SLOTS = [
  {
    slot_id: "103002_et",
    eastern_time: "10:30:02",
    minutes_after_open: 60,
    finalized_minute_count: 60,
  },
  {
    slot_id: "123002_et",
    eastern_time: "12:30:02",
    minutes_after_open: 180,
    finalized_minute_count: 180,
  },
  {
    slot_id: "153002_et",
    eastern_time: "15:30:02",
    minutes_after_open: 360,
    finalized_minute_count: 360,
  },
] as const;

export const MARKET_CONTEXT_DIAGNOSTIC_REPLAY_MARKERS = {
  diagnostic_all_reported_trades: true,
  official_ohlcv_claimed: false,
  canonical_performance_eligible: false,
  sale_condition_semantics_available: false,
  watermark_status: "empirically_unvalidated",
  shadow_only: true,
  live_ranking_effect: false,
  calibrated_probability: false,
} as const;

export type MarketContextDiagnosticReplayCalendarSessionV1 = {
  date: string;
  open_unix_ns: string;
  close_unix_ns: string;
  early_close: false;
  session_type: "regular";
};

export type MarketContextDiagnosticDecisionScheduleEntryV1 = {
  schedule_version: typeof MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1;
  decision_id: string;
  session_date: string;
  slot_id: typeof MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SLOTS[number]["slot_id"];
  eastern_time: string;
  decision_timestamp: string;
  decision_unix_ns: string;
  finalized_minute_count: number;
  provisional_watermark_ns: "2000000000";
};

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stable(child)]),
    );
  }
  return value;
}

export function stableDiagnosticReplayJsonV1(value: unknown) {
  return JSON.stringify(stable(value));
}

export function diagnosticReplaySha256V1(value: unknown) {
  return createHash("sha256")
    .update(stableDiagnosticReplayJsonV1(value))
    .digest("hex");
}

function unixNsToIso(value: bigint) {
  const nanosecondsPerMillisecond = BigInt(1_000_000);
  if (value % nanosecondsPerMillisecond !== BigInt(0)) {
    throw new Error(
      "market_context_diagnostic_replay_schedule_non_millisecond_instant",
    );
  }
  return new Date(Number(value / nanosecondsPerMillisecond)).toISOString();
}

export function buildMarketContextDiagnosticReplayScheduleV1(
  sessions: MarketContextDiagnosticReplayCalendarSessionV1[],
): MarketContextDiagnosticDecisionScheduleEntryV1[] {
  const canonicalSessions = [...sessions].sort((first, second) =>
    first.date.localeCompare(second.date),
  );
  if (
    canonicalSessions.length !== 20 ||
    stableDiagnosticReplayJsonV1(
      canonicalSessions.map((session) => session.date),
    ) !==
      stableDiagnosticReplayJsonV1(
        MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SESSION_DATES,
      )
  ) {
    throw new Error(
      "market_context_diagnostic_replay_schedule_session_drift",
    );
  }

  const decisions = canonicalSessions.flatMap((session) => {
    if (session.early_close || session.session_type !== "regular") {
      throw new Error(
        `market_context_diagnostic_replay_schedule_non_regular:${session.date}`,
      );
    }
    const open = BigInt(session.open_unix_ns);
    const close = BigInt(session.close_unix_ns);
    if (
      close - open !==
      BigInt(390) * BigInt("60000000000")
    ) {
      throw new Error(
        `market_context_diagnostic_replay_schedule_duration_drift:${session.date}`,
      );
    }
    return MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SLOTS.map((slot) => {
      const decision =
        open +
        BigInt(slot.minutes_after_open) * BigInt("60000000000") +
        BigInt("2000000000");
      if (decision >= close) {
        throw new Error(
          `market_context_diagnostic_replay_schedule_outside_session:${session.date}:${slot.slot_id}`,
        );
      }
      return {
        schedule_version: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1,
        decision_id: `${session.date}_${slot.slot_id}`,
        session_date: session.date,
        slot_id: slot.slot_id,
        eastern_time: slot.eastern_time,
        decision_timestamp: unixNsToIso(decision),
        decision_unix_ns: decision.toString(),
        finalized_minute_count: slot.finalized_minute_count,
        provisional_watermark_ns: "2000000000" as const,
      };
    });
  });
  if (
    decisions.length !== 60 ||
    new Set(decisions.map((decision) => decision.decision_id)).size !== 60
  ) {
    throw new Error(
      "market_context_diagnostic_replay_schedule_not_sixty_unique_decisions",
    );
  }
  return decisions;
}
