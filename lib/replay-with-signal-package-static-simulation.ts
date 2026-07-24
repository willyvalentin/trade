import {
  buildAmbiguousIntrabarReplayWithSignalPackageResult,
  buildBlockedReplayWithSignalPackageResult,
  buildNoEntryReplayWithSignalPackageResult,
  buildOpenAtWindowEndReplayWithSignalPackageResult,
  buildStopHitReplayWithSignalPackageResult,
  buildTargetHitReplayWithSignalPackageResult,
  type ReplayWithSignalPackageDirection,
  type ReplayWithSignalPackageResult,
  type ReplayWithSignalPackageResultInput,
} from "@/lib/replay-with-signal-package-result-model";

export type ReplaySimulationCandle = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number | null;
};

export type ReplaySignalPackageInput = {
  candidate_id: string;
  source_type: string;
  source_row_id: string | null;
  ticker: string;
  interval: string;
  trading_day: string;
  analysis_cutoff: string | null;
  direction: ReplayWithSignalPackageDirection;
  planned_entry: number;
  planned_stop: number;
  planned_target: number;
};

export type ReplaySimulationInput = {
  source_verification: string;
  signal_package: ReplaySignalPackageInput;
  candles: ReplaySimulationCandle[];
  expected_candle_rows?: number;
  conservative_same_candle_rule: true;
};

type RiskGeometry = {
  risk: number;
  targetReward: number;
};

function toResultInput(
  input: ReplaySimulationInput,
  overrides: Partial<ReplayWithSignalPackageResultInput> = {},
): ReplayWithSignalPackageResultInput {
  const signal = input.signal_package;

  return {
    source_verification: input.source_verification,
    candidate_id: signal.candidate_id,
    source_type: signal.source_type,
    source_row_id: signal.source_row_id,
    ticker: signal.ticker,
    interval: signal.interval,
    trading_day: signal.trading_day,
    analysis_cutoff: signal.analysis_cutoff,
    direction: signal.direction,
    planned_entry: signal.planned_entry,
    planned_stop: signal.planned_stop,
    planned_target: signal.planned_target,
    candles_read: input.candles.length,
    candles_verified: input.candles.length,
    lookahead_safety_passed: false,
    ...overrides,
  };
}

function sortedCandles(candles: ReplaySimulationCandle[]) {
  return [...candles].sort((left, right) =>
    left.timestamp.localeCompare(right.timestamp),
  );
}

function candlesAfterCutoff(
  candles: ReplaySimulationCandle[],
  analysisCutoff: string,
) {
  const cutoffTime = Date.parse(analysisCutoff);

  return sortedCandles(candles).filter(
    (candle) => Date.parse(candle.timestamp) > cutoffTime,
  );
}

function riskGeometry(
  direction: ReplayWithSignalPackageDirection,
  entry: number,
  stop: number,
  target: number,
): RiskGeometry | null {
  const risk = direction === "long" ? entry - stop : stop - entry;
  const targetReward = direction === "long" ? target - entry : entry - target;

  if (!Number.isFinite(risk) || !Number.isFinite(targetReward)) return null;
  if (risk <= 0 || targetReward <= 0) return null;

  return {
    risk,
    targetReward,
  };
}

function touchesEntry(
  direction: ReplayWithSignalPackageDirection,
  candle: ReplaySimulationCandle,
  entry: number,
) {
  return direction === "long" ? candle.high >= entry : candle.low <= entry;
}

function touchesStop(
  direction: ReplayWithSignalPackageDirection,
  candle: ReplaySimulationCandle,
  stop: number,
) {
  return direction === "long" ? candle.low <= stop : candle.high >= stop;
}

function touchesTarget(
  direction: ReplayWithSignalPackageDirection,
  candle: ReplaySimulationCandle,
  target: number,
) {
  return direction === "long" ? candle.high >= target : candle.low <= target;
}

function signedMove(
  direction: ReplayWithSignalPackageDirection,
  entry: number,
  exit: number,
) {
  return direction === "long" ? exit - entry : entry - exit;
}

export function simulateReplayWithSignalPackage(
  input: ReplaySimulationInput,
): ReplayWithSignalPackageResult {
  const signal = input.signal_package;

  if (input.candles.length === 0) {
    return buildBlockedReplayWithSignalPackageResult({
      ...toResultInput(input),
      execution_status: "blocked_missing_candles",
      blockers: ["missing_candles"],
    });
  }

  if (!signal.analysis_cutoff) {
    return buildBlockedReplayWithSignalPackageResult({
      ...toResultInput(input),
      execution_status: "blocked_missing_analysis_cutoff",
      blockers: ["missing_analysis_cutoff"],
    });
  }

  if (
    input.expected_candle_rows !== undefined &&
    input.candles.length !== input.expected_candle_rows
  ) {
    return buildBlockedReplayWithSignalPackageResult({
      ...toResultInput(input),
      execution_status: "blocked_candle_verification_failed",
      blockers: ["expected_candle_rows_mismatch"],
    });
  }

  const geometry = riskGeometry(
    signal.direction,
    signal.planned_entry,
    signal.planned_stop,
    signal.planned_target,
  );
  if (!geometry) {
    return buildBlockedReplayWithSignalPackageResult({
      ...toResultInput(input),
      execution_status: "blocked_signal_package_validation_failed",
      blockers: ["invalid_risk_geometry"],
    });
  }

  const eligibleCandles = candlesAfterCutoff(input.candles, signal.analysis_cutoff);
  if (eligibleCandles.length === 0) {
    return buildBlockedReplayWithSignalPackageResult({
      ...toResultInput(input),
      execution_status: "blocked_missing_candles",
      blockers: ["no_post_cutoff_candles"],
    });
  }

  let entryTimestamp: string | null = null;
  let entryTouched = false;

  for (const candle of eligibleCandles) {
    if (!entryTouched) {
      entryTouched = touchesEntry(signal.direction, candle, signal.planned_entry);
      if (!entryTouched) continue;
      entryTimestamp = candle.timestamp;
    }

    const stopTouched = touchesStop(signal.direction, candle, signal.planned_stop);
    const targetTouched = touchesTarget(
      signal.direction,
      candle,
      signal.planned_target,
    );

    if (stopTouched && targetTouched) {
      return buildAmbiguousIntrabarReplayWithSignalPackageResult({
        ...toResultInput(input, {
          lookahead_safety_passed: true,
          entry_timestamp: entryTimestamp,
          exit_timestamp: candle.timestamp,
          gross_price_move: -geometry.risk,
          gross_r_multiple: -1,
        }),
      });
    }

    if (targetTouched) {
      return buildTargetHitReplayWithSignalPackageResult({
        ...toResultInput(input, {
          lookahead_safety_passed: true,
          entry_timestamp: entryTimestamp,
          exit_timestamp: candle.timestamp,
          gross_price_move: geometry.targetReward,
          gross_r_multiple: geometry.targetReward / geometry.risk,
        }),
      });
    }

    if (stopTouched) {
      return buildStopHitReplayWithSignalPackageResult({
        ...toResultInput(input, {
          lookahead_safety_passed: true,
          entry_timestamp: entryTimestamp,
          exit_timestamp: candle.timestamp,
          gross_price_move: -geometry.risk,
          gross_r_multiple: -1,
        }),
      });
    }
  }

  if (!entryTouched) {
    return buildNoEntryReplayWithSignalPackageResult({
      ...toResultInput(input, {
        lookahead_safety_passed: true,
      }),
    });
  }

  const lastCandle = eligibleCandles[eligibleCandles.length - 1];
  const openMove = signedMove(
    signal.direction,
    signal.planned_entry,
    lastCandle.close,
  );

  return buildOpenAtWindowEndReplayWithSignalPackageResult({
    ...toResultInput(input, {
      lookahead_safety_passed: true,
      entry_timestamp: entryTimestamp,
      exit_timestamp: lastCandle.timestamp,
      gross_price_move: openMove,
      gross_r_multiple: openMove / geometry.risk,
    }),
  });
}
