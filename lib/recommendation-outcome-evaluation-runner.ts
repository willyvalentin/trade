import {
  computeRecommendationOutcome,
  recommendationOutcomesJson,
  type RecommendationOutcome,
  type RecommendationOutcomeCandle,
  type RecommendationOutcomeHorizon,
  type RecommendationOutcomePersistenceResult,
} from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export type RecommendationOutcomeEvaluationRunStatus =
  | "idle"
  | "ready"
  | "running"
  | "completed"
  | "partial"
  | "blocked"
  | "failed"
  | "unknown";

export type RecommendationOutcomeEvaluationCandidateStatus =
  | "pending"
  | "evaluated"
  | "incomplete_data"
  | "missing_snapshot_fields"
  | "missing_candles"
  | "provider_error"
  | "skipped"
  | "unknown";

export type RecommendationOutcomeEvaluationWarning = {
  warning_id: string;
  snapshot_fingerprint: string | null;
  ticker: string | null;
  horizon: RecommendationOutcomeHorizon;
  message: string;
};

export type RecommendationOutcomeCandleRequest = {
  request_id: string;
  snapshot_id: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  ticker: string;
  horizon: RecommendationOutcomeHorizon;
  start_at: string;
  end_at: string;
  interval: "5min" | "15min";
};

export type RecommendationOutcomeCandleResult = {
  request: RecommendationOutcomeCandleRequest;
  status: "available" | "missing_candles" | "provider_error" | "skipped";
  candles: RecommendationOutcomeCandle[];
  provider: string | null;
  error: string | null;
  warnings: string[];
};

export type RecommendationOutcomeEvaluationCandidate = {
  candidate_id: string;
  snapshot_id: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  ticker: string | null;
  horizon: RecommendationOutcomeHorizon;
  status: RecommendationOutcomeEvaluationCandidateStatus;
  candle_request: RecommendationOutcomeCandleRequest | null;
  candle_count: number;
  outcome_id: string | null;
  outcome_status: RecommendationOutcome["status"] | null;
  persistence_mode: RecommendationOutcomePersistenceResult["mode"] | "unknown";
  warnings: string[];
  error: string | null;
};

export type RecommendationOutcomeEvaluationResult = {
  candidate: RecommendationOutcomeEvaluationCandidate;
  outcome: RecommendationOutcome | null;
  persistence: RecommendationOutcomePersistenceResult | null;
};

export type RecommendationOutcomeEvaluationRun = {
  run_id: string;
  run_version: "1.0";
  status: RecommendationOutcomeEvaluationRunStatus;
  started_at: string;
  completed_at: string | null;
  horizons: RecommendationOutcomeHorizon[];
  source: "manual" | "auto" | "api" | "unknown";
  provider: string | null;
  eligible_snapshot_count: number;
  evaluated_snapshot_count: number;
  incomplete_snapshot_count: number;
  missing_candle_count: number;
  provider_error_count: number;
  persisted_outcome_count: number;
  candidates: RecommendationOutcomeEvaluationCandidate[];
  outcomes: RecommendationOutcome[];
  warnings: RecommendationOutcomeEvaluationWarning[];
  summary: string;
};

export type RecommendationOutcomeEvaluationRunnerOptions = {
  snapshots: RecommendationSnapshot[];
  existingOutcomes?: RecommendationOutcome[];
  horizons?: RecommendationOutcomeHorizon[];
  now?: Date | string | null;
  source?: RecommendationOutcomeEvaluationRun["source"];
  provider?: string | null;
  maxSnapshots?: number;
  fetchCandles?: (
    request: RecommendationOutcomeCandleRequest,
  ) => Promise<RecommendationOutcomeCandleResult>;
  persistOutcome?: (
    outcome: RecommendationOutcome,
  ) => Promise<RecommendationOutcomePersistenceResult>;
};

export const recommendationOutcomeEvaluationRunStorageKey =
  "trade-recommendation-outcome-evaluation-runs-v1";

const defaultHorizons: RecommendationOutcomeHorizon[] = ["15m", "30m", "60m"];
const defaultMaxSnapshots = 6;

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function horizonMs(horizon: RecommendationOutcomeHorizon) {
  if (horizon === "15m") return 15 * 60 * 1000;
  if (horizon === "30m") return 30 * 60 * 1000;
  if (horizon === "60m") return 60 * 60 * 1000;
  return null;
}

function hasRequiredSnapshotFields(snapshot: RecommendationSnapshot) {
  return Boolean(
    snapshot.snapshot_fingerprint &&
      snapshot.ticker &&
      snapshot.recommended_at &&
      snapshot.entry !== null &&
      snapshot.stop !== null &&
      snapshot.target !== null &&
      (snapshot.side === "long" || snapshot.side === "short"),
  );
}

function isOutcomePending(outcome: RecommendationOutcome | undefined) {
  if (!outcome) {
    return true;
  }

  return (
    outcome.status === "pending" ||
    outcome.status === "incomplete" ||
    outcome.status === "unknown" ||
    outcome.status === "invalid"
  );
}

function createRunId(startedAt: string) {
  return `rec_out_eval_${stableHash(startedAt)}`;
}

function buildCandleRequest({
  snapshot,
  horizon,
  now,
}: {
  snapshot: RecommendationSnapshot;
  horizon: RecommendationOutcomeHorizon;
  now: Date;
}): { request: RecommendationOutcomeCandleRequest | null; warnings: string[] } {
  const warnings: string[] = [];
  const ticker = snapshot.ticker?.trim().toUpperCase() ?? "";
  const recommendedAt = toDate(snapshot.recommended_at);
  const fixedHorizonMs = horizonMs(horizon);

  if (horizon === "eod") {
    warnings.push(
      "EOD candle window is not safely known in this runner yet; use fixed intraday horizons for now.",
    );
    return { request: null, warnings };
  }

  if (horizon === "next_open") {
    warnings.push(
      "Next-open candle window is not safely known in this runner yet.",
    );
    return { request: null, warnings };
  }

  if (!ticker || !recommendedAt || !fixedHorizonMs) {
    if (!fixedHorizonMs) {
      warnings.push("Evaluation horizon is unknown.");
    }
    return { request: null, warnings };
  }

  const requestedEnd = new Date(recommendedAt.getTime() + fixedHorizonMs);
  const end = requestedEnd.getTime() > now.getTime() ? now : requestedEnd;

  if (end.getTime() <= recommendedAt.getTime()) {
    warnings.push("Horizon has not elapsed yet; candle window is not ready.");
    return { request: null, warnings };
  }

  return {
    request: {
      request_id: `candle_${stableHash(
        `${snapshot.snapshot_fingerprint}|${horizon}`,
      )}`,
      snapshot_id: snapshot.id,
      snapshot_fingerprint: snapshot.snapshot_fingerprint,
      recommendation_id: snapshot.recommendation_id,
      ticker,
      horizon,
      start_at: recommendedAt.toISOString(),
      end_at: end.toISOString(),
      interval: "5min",
    },
    warnings,
  };
}

function warning(
  snapshot: RecommendationSnapshot,
  horizon: RecommendationOutcomeHorizon,
  warningId: string,
  message: string,
): RecommendationOutcomeEvaluationWarning {
  return {
    warning_id: warningId,
    snapshot_fingerprint: snapshot.snapshot_fingerprint,
    ticker: snapshot.ticker,
    horizon,
    message,
  };
}

function summarizeRun(run: Omit<RecommendationOutcomeEvaluationRun, "summary">) {
  if (run.status === "blocked") {
    return "Outcome evaluation is blocked because there are no eligible recommendation snapshots.";
  }

  if (run.status === "failed") {
    return "Outcome evaluation failed for all eligible snapshots.";
  }

  if (run.status === "partial") {
    return "Outcome evaluation completed partially; some snapshots need more candle data or provider recovery.";
  }

  if (run.status === "completed") {
    return "Outcome evaluation completed for eligible recent recommendation snapshots.";
  }

  return "Outcome evaluation is ready.";
}

export async function runRecommendationOutcomeEvaluation(
  options: RecommendationOutcomeEvaluationRunnerOptions,
): Promise<RecommendationOutcomeEvaluationRun> {
  const startedAt = (toDate(options.now ?? null) ?? new Date()).toISOString();
  const now = new Date(startedAt);
  const horizons = options.horizons?.length ? options.horizons : defaultHorizons;
  const existingOutcomes = options.existingOutcomes ?? [];
  const maxSnapshots = options.maxSnapshots ?? defaultMaxSnapshots;
  const sortedSnapshots = [...options.snapshots]
    .filter((snapshot) => snapshot.is_visible !== false)
    .sort((first, second) => {
      const firstTime = toDate(first.recommended_at)?.getTime() ?? 0;
      const secondTime = toDate(second.recommended_at)?.getTime() ?? 0;
      return secondTime - firstTime;
    })
    .slice(0, maxSnapshots);
  const candidates: RecommendationOutcomeEvaluationCandidate[] = [];
  const outcomes: RecommendationOutcome[] = [];
  const warnings: RecommendationOutcomeEvaluationWarning[] = [];

  if (sortedSnapshots.length === 0) {
    const blockedRun = {
      run_id: createRunId(startedAt),
      run_version: "1.0" as const,
      status: "blocked" as const,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      horizons,
      source: options.source ?? "unknown",
      provider: options.provider ?? null,
      eligible_snapshot_count: 0,
      evaluated_snapshot_count: 0,
      incomplete_snapshot_count: 0,
      missing_candle_count: 0,
      provider_error_count: 0,
      persisted_outcome_count: 0,
      candidates,
      outcomes,
      warnings,
    };

    return { ...blockedRun, summary: summarizeRun(blockedRun) };
  }

  for (const snapshot of sortedSnapshots) {
    for (const horizon of horizons) {
      const existingOutcome = existingOutcomes.find(
        (outcome) =>
          outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint &&
          outcome.horizon === horizon,
      );

      if (!isOutcomePending(existingOutcome)) {
        candidates.push({
          candidate_id: `${snapshot.snapshot_fingerprint}:${horizon}`,
          snapshot_id: snapshot.id,
          snapshot_fingerprint: snapshot.snapshot_fingerprint,
          recommendation_id: snapshot.recommendation_id,
          ticker: snapshot.ticker,
          horizon,
          status: "skipped",
          candle_request: null,
          candle_count: 0,
          outcome_id: existingOutcome?.id ?? null,
          outcome_status: existingOutcome?.status ?? null,
          persistence_mode: "unknown",
          warnings: ["Outcome already has a terminal or completed status."],
          error: null,
        });
        continue;
      }

      if (!hasRequiredSnapshotFields(snapshot)) {
        const result = computeRecommendationOutcome({
          snapshot,
          horizon,
          evaluated_at: now,
          source: "snapshot_only",
          data_completeness: "none",
          warnings: ["Required snapshot fields are missing."],
        });
        const persistence = options.persistOutcome
          ? await options.persistOutcome(result.outcome)
          : null;

        outcomes.push(result.outcome);
        candidates.push({
          candidate_id: `${snapshot.snapshot_fingerprint}:${horizon}`,
          snapshot_id: snapshot.id,
          snapshot_fingerprint: snapshot.snapshot_fingerprint,
          recommendation_id: snapshot.recommendation_id,
          ticker: snapshot.ticker,
          horizon,
          status: "missing_snapshot_fields",
          candle_request: null,
          candle_count: 0,
          outcome_id: result.outcome.id,
          outcome_status: result.outcome.status,
          persistence_mode: persistence?.mode ?? "unknown",
          warnings: result.outcome.warnings,
          error: result.outcome.blockers[0] ?? null,
        });
        warnings.push(
          warning(
            snapshot,
            horizon,
            "missing_snapshot_fields",
            "Required snapshot fields are missing.",
          ),
        );
        continue;
      }

      const { request, warnings: requestWarnings } = buildCandleRequest({
        snapshot,
        horizon,
        now,
      });

      if (!request || !options.fetchCandles) {
        const reason = !options.fetchCandles
          ? "Candle provider is unavailable."
          : requestWarnings[0] ?? "Candle request is not ready.";
        const result = computeRecommendationOutcome({
          snapshot,
          horizon,
          evaluated_at: now,
          source: "snapshot_only",
          data_completeness: "none",
          warnings: [reason],
        });
        const persistence = options.persistOutcome
          ? await options.persistOutcome(result.outcome)
          : null;

        outcomes.push(result.outcome);
        candidates.push({
          candidate_id: `${snapshot.snapshot_fingerprint}:${horizon}`,
          snapshot_id: snapshot.id,
          snapshot_fingerprint: snapshot.snapshot_fingerprint,
          recommendation_id: snapshot.recommendation_id,
          ticker: snapshot.ticker,
          horizon,
          status: !options.fetchCandles ? "provider_error" : "missing_candles",
          candle_request: request,
          candle_count: 0,
          outcome_id: result.outcome.id,
          outcome_status: result.outcome.status,
          persistence_mode: persistence?.mode ?? "unknown",
          warnings: result.outcome.warnings,
          error: reason,
        });
        warnings.push(
          warning(snapshot, horizon, "missing_candles", reason),
        );
        continue;
      }

      const candleResult = await options.fetchCandles(request);

      if (candleResult.status !== "available" || candleResult.candles.length === 0) {
        const reason =
          candleResult.error ??
          candleResult.warnings[0] ??
          "No post-recommendation candles were returned.";
        const result = computeRecommendationOutcome({
          snapshot,
          horizon,
          evaluated_at: now,
          source: "intraday_candles",
          provider: candleResult.provider,
          data_completeness: "none",
          warnings: [reason, ...candleResult.warnings],
        });
        const persistence = options.persistOutcome
          ? await options.persistOutcome(result.outcome)
          : null;

        outcomes.push(result.outcome);
        candidates.push({
          candidate_id: `${snapshot.snapshot_fingerprint}:${horizon}`,
          snapshot_id: snapshot.id,
          snapshot_fingerprint: snapshot.snapshot_fingerprint,
          recommendation_id: snapshot.recommendation_id,
          ticker: snapshot.ticker,
          horizon,
          status:
            candleResult.status === "provider_error"
              ? "provider_error"
              : "missing_candles",
          candle_request: request,
          candle_count: candleResult.candles.length,
          outcome_id: result.outcome.id,
          outcome_status: result.outcome.status,
          persistence_mode: persistence?.mode ?? "unknown",
          warnings: result.outcome.warnings,
          error: reason,
        });
        warnings.push(
          warning(
            snapshot,
            horizon,
            candleResult.status === "provider_error"
              ? "provider_error"
              : "missing_candles",
            reason,
          ),
        );
        continue;
      }

      const result = computeRecommendationOutcome({
        snapshot,
        horizon,
        evaluated_at: now,
        source: "intraday_candles",
        provider: candleResult.provider,
        data_completeness: "complete",
        candles: candleResult.candles,
        warnings: candleResult.warnings,
      });
      const persistence = options.persistOutcome
        ? await options.persistOutcome(result.outcome)
        : null;

      outcomes.push(result.outcome);
      candidates.push({
        candidate_id: `${snapshot.snapshot_fingerprint}:${horizon}`,
        snapshot_id: snapshot.id,
        snapshot_fingerprint: snapshot.snapshot_fingerprint,
        recommendation_id: snapshot.recommendation_id,
        ticker: snapshot.ticker,
        horizon,
        status: result.can_compute_terminal_events
          ? "evaluated"
          : "incomplete_data",
        candle_request: request,
        candle_count: candleResult.candles.length,
        outcome_id: result.outcome.id,
        outcome_status: result.outcome.status,
        persistence_mode: persistence?.mode ?? "unknown",
        warnings: result.outcome.warnings,
        error: persistence?.error ?? null,
      });
    }
  }

  const evaluatedCount = candidates.filter(
    (candidate) => candidate.status === "evaluated",
  ).length;
  const incompleteCount = candidates.filter(
    (candidate) =>
      candidate.status === "incomplete_data" ||
      candidate.status === "missing_snapshot_fields",
  ).length;
  const missingCandleCount = candidates.filter(
    (candidate) => candidate.status === "missing_candles",
  ).length;
  const providerErrorCount = candidates.filter(
    (candidate) => candidate.status === "provider_error",
  ).length;
  const persistedOutcomeCount = candidates.filter(
    (candidate) => candidate.persistence_mode !== "unknown",
  ).length;
  const attemptedCount = candidates.filter(
    (candidate) => candidate.status !== "skipped",
  ).length;
  const status: RecommendationOutcomeEvaluationRunStatus =
    attemptedCount === 0
      ? "blocked"
      : evaluatedCount === attemptedCount
        ? "completed"
        : evaluatedCount > 0
          ? "partial"
          : providerErrorCount > 0 && missingCandleCount + incompleteCount === 0
            ? "failed"
            : "partial";
  const completedRun = {
    run_id: createRunId(startedAt),
    run_version: "1.0" as const,
    status,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    horizons,
    source: options.source ?? "unknown",
    provider: options.provider ?? null,
    eligible_snapshot_count: sortedSnapshots.length,
    evaluated_snapshot_count: evaluatedCount,
    incomplete_snapshot_count: incompleteCount,
    missing_candle_count: missingCandleCount,
    provider_error_count: providerErrorCount,
    persisted_outcome_count: persistedOutcomeCount,
    candidates,
    outcomes,
    warnings,
  };

  return { ...completedRun, summary: summarizeRun(completedRun) };
}

export function recommendationOutcomeEvaluationRunJson(
  run: RecommendationOutcomeEvaluationRun,
) {
  return JSON.stringify(
    {
      ...run,
      outcomes_json: JSON.parse(recommendationOutcomesJson(run.outcomes)),
    },
    null,
    2,
  );
}

export function readRecommendationOutcomeEvaluationRunsFromLocalStorage(
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
) {
  if (!storage) {
    return [];
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(recommendationOutcomeEvaluationRunStorageKey) ?? "[]",
    );
    return Array.isArray(parsed) ? (parsed as RecommendationOutcomeEvaluationRun[]) : [];
  } catch {
    return [];
  }
}

export function writeRecommendationOutcomeEvaluationRunToLocalStorage(
  run: RecommendationOutcomeEvaluationRun,
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
) {
  if (!storage) {
    return;
  }

  try {
    const existingRuns = readRecommendationOutcomeEvaluationRunsFromLocalStorage(
      storage,
    );
    storage.setItem(
      recommendationOutcomeEvaluationRunStorageKey,
      JSON.stringify([run, ...existingRuns].slice(0, 25)),
    );
  } catch {
    // Diagnostics are best-effort only.
  }
}
