import { getNewYorkDateString } from "@/lib/intraday-scan-window";
import type {
  LiveMarketTrialRunbookLocalState,
  LiveMarketTrialRunbookMode,
  LiveMarketTrialRunbookOutcome,
} from "@/lib/live-market-trial-runbook";
import { TRADE_LIVE_MARKET_TRIAL_RUNBOOK_STORAGE_KEY } from "@/lib/persistence/local-storage-keys";

const text = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();

  if (
    normalized === "" ||
    normalized.toLowerCase() === "null" ||
    normalized.toLowerCase() === "undefined"
  ) {
    return fallback;
  }

  return normalized;
};

export function createDefaultLiveMarketTrialRunbookState(
  now = new Date(),
): LiveMarketTrialRunbookLocalState {
  return {
    trial_date: getNewYorkDateString(now),
    selected_mode: "observation_only",
    checklist_completion: {},
    notes: "",
    trial_outcome: "none",
    ended_at: null,
  };
}

export function normalizeLiveMarketTrialRunbookMode(
  value: unknown,
): LiveMarketTrialRunbookMode {
  if (
    value === "observation_only" ||
    value === "recommendation_logging" ||
    value === "optional_manual_paper_tracking"
  ) {
    return value;
  }

  return "observation_only";
}

export function normalizeLiveMarketTrialRunbookOutcome(
  value: unknown,
): LiveMarketTrialRunbookOutcome {
  if (
    value === "no_trade_valid" ||
    value === "recommendations_logged" ||
    value === "paper_trade_completed" ||
    value === "blocked" ||
    value === "needs_review" ||
    value === "none"
  ) {
    return value;
  }

  return "none";
}

export function normalizeLiveMarketTrialRunbookState(
  value: unknown,
): LiveMarketTrialRunbookLocalState {
  const fallback = createDefaultLiveMarketTrialRunbookState();

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Record<string, unknown>;
  const completion =
    record.checklist_completion && typeof record.checklist_completion === "object"
      ? Object.fromEntries(
          Object.entries(record.checklist_completion as Record<string, unknown>)
            .filter(([key]) => key.trim().length > 0)
            .map(([key, completed]) => [key, completed === true]),
        )
      : {};

  return {
    trial_date: text(record.trial_date, fallback.trial_date),
    selected_mode: normalizeLiveMarketTrialRunbookMode(record.selected_mode),
    checklist_completion: completion,
    notes: text(record.notes).slice(0, 2000),
    trial_outcome: normalizeLiveMarketTrialRunbookOutcome(record.trial_outcome),
    ended_at: text(record.ended_at) || null,
  };
}

export function readLiveMarketTrialRunbookState(): LiveMarketTrialRunbookLocalState {
  if (typeof window === "undefined") {
    return createDefaultLiveMarketTrialRunbookState();
  }

  try {
    const stored = window.localStorage.getItem(
      TRADE_LIVE_MARKET_TRIAL_RUNBOOK_STORAGE_KEY,
    );

    return stored
      ? normalizeLiveMarketTrialRunbookState(JSON.parse(stored))
      : createDefaultLiveMarketTrialRunbookState();
  } catch {
    return createDefaultLiveMarketTrialRunbookState();
  }
}

export function writeLiveMarketTrialRunbookState(
  state: LiveMarketTrialRunbookLocalState,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      TRADE_LIVE_MARKET_TRIAL_RUNBOOK_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    // Local trial runbook notes must never block the app.
  }
}
