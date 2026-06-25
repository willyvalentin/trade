import {
  classifyDayTradeScanWindow,
  normalizeDayTradeScanWindow,
  type DayTradeScanWindow,
} from "@/lib/day-trade-scan-orchestration";
import { getNewYorkDateString, type IntradayScanWindow } from "@/lib/intraday-scan-window";
import { getNyMarketTime } from "@/lib/market-session";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { ScanLogEntry } from "@/lib/scan-logs";

export type ScheduledScanAttemptOutcome =
  | "scheduled_function_fired"
  | "route_received"
  | "skipped"
  | "failed"
  | "scanned"
  | "request_failed";

export type ScheduledScanAttemptMode = "scheduled" | "manual" | "diagnostic";

export type ScheduledScanAttempt = {
  id?: string | null;
  attempt_fingerprint: string;
  created_at: string;
  trading_date: string | null;
  source: string;
  mode: ScheduledScanAttemptMode;
  outcome: ScheduledScanAttemptOutcome;
  allowed: boolean | null;
  route_received_at: string | null;
  scheduled_function_fired_at: string | null;
  utc_timestamp: string;
  ny_timestamp: string | null;
  official_window: DayTradeScanWindow;
  intraday_scan_window: string | null;
  orchestration_decision: string | null;
  skip_reason: string | null;
  message: string | null;
  http_status: number | null;
  raw_count: number | null;
  ranked_count: number | null;
  selected_count: number | null;
  built_count: number | null;
  published_count: number | null;
  recommendations_created: number | null;
  batch_fingerprint: string | null;
  scan_run_fingerprint: string | null;
  scheduled_scan_run_id: string | null;
  payload_json: Record<string, unknown>;
};

export type ScheduledScanTimelineEntry = {
  utc_timestamp: string;
  ny_timestamp: string | null;
  source: string;
  mode: ScheduledScanAttemptMode | string;
  official_window: DayTradeScanWindow | string;
  intraday_scan_window: string | null;
  outcome: string;
  allowed: boolean | null;
  reason: string | null;
  raw_count: number | null;
  ranked_count: number | null;
  selected_count: number | null;
  built_count: number | null;
  published_count: number | null;
  batch_fingerprint: string | null;
  scan_run_fingerprint: string | null;
};

export type ScheduledScanAttemptInput = Partial<ScheduledScanAttempt> & {
  attempt_fingerprint?: string | null;
  route_received_at?: string | null;
  scheduled_function_fired_at?: string | null;
  utc_timestamp?: string | null;
  source?: string | null;
  mode?: string | null;
  outcome?: string | null;
  intraday_scan_window?: IntradayScanWindow | string | null;
};

function textOrNull(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isoOrNull(value: unknown) {
  const text = textOrNull(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function normalizeMode(value: unknown): ScheduledScanAttemptMode {
  if (value === "manual" || value === "diagnostic") return value;
  return "scheduled";
}

function normalizeOutcome(value: unknown): ScheduledScanAttemptOutcome {
  if (
    value === "scheduled_function_fired" ||
    value === "route_received" ||
    value === "skipped" ||
    value === "failed" ||
    value === "scanned" ||
    value === "request_failed"
  ) {
    return value;
  }

  return "route_received";
}

function timestampFor(input: ScheduledScanAttemptInput) {
  return (
    isoOrNull(input.route_received_at) ??
    isoOrNull(input.scheduled_function_fired_at) ??
    isoOrNull(input.utc_timestamp) ??
    new Date().toISOString()
  );
}

export function buildScheduledScanAttemptFingerprint(input: {
  scheduledFunctionFiredAt?: string | null;
  routeReceivedAt?: string | null;
  source?: string | null;
}) {
  const anchor =
    isoOrNull(input.scheduledFunctionFiredAt) ??
    isoOrNull(input.routeReceivedAt) ??
    new Date().toISOString();
  return `scheduled_scan_attempt_${stableHash(
    [input.source ?? "unknown", anchor, Math.random().toString(36)].join("|"),
  )}`;
}

export function buildScheduledScanAttemptRecord(
  input: ScheduledScanAttemptInput,
): Record<string, unknown> {
  const utcTimestamp = timestampFor(input);
  const timestampDate = new Date(utcTimestamp);
  const nyTime = getNyMarketTime(timestampDate);
  const officialWindow =
    input.official_window && input.official_window !== "unknown"
      ? normalizeDayTradeScanWindow(input.official_window)
      : classifyDayTradeScanWindow({ now: timestampDate });
  const attemptFingerprint =
    textOrNull(input.attempt_fingerprint) ??
    buildScheduledScanAttemptFingerprint({
      scheduledFunctionFiredAt: input.scheduled_function_fired_at,
      routeReceivedAt: input.route_received_at,
      source: input.source,
    });

  return {
    attempt_fingerprint: attemptFingerprint,
    trading_date: textOrNull(input.trading_date) ?? getNewYorkDateString(timestampDate),
    source: textOrNull(input.source) ?? "unknown",
    mode: normalizeMode(input.mode),
    outcome: normalizeOutcome(input.outcome),
    allowed: typeof input.allowed === "boolean" ? input.allowed : null,
    route_received_at: isoOrNull(input.route_received_at),
    scheduled_function_fired_at: isoOrNull(input.scheduled_function_fired_at),
    utc_timestamp: utcTimestamp,
    ny_timestamp: `${nyTime.ny_date} ${nyTime.ny_time} America/New_York`,
    official_window: officialWindow,
    intraday_scan_window: textOrNull(input.intraday_scan_window),
    orchestration_decision: textOrNull(input.orchestration_decision),
    skip_reason: textOrNull(input.skip_reason),
    message: textOrNull(input.message),
    http_status: numberOrNull(input.http_status),
    raw_count: numberOrNull(input.raw_count),
    ranked_count: numberOrNull(input.ranked_count),
    selected_count: numberOrNull(input.selected_count),
    built_count: numberOrNull(input.built_count),
    published_count: numberOrNull(input.published_count),
    recommendations_created: numberOrNull(input.recommendations_created),
    batch_fingerprint: textOrNull(input.batch_fingerprint),
    scan_run_fingerprint: textOrNull(input.scan_run_fingerprint),
    scheduled_scan_run_id: textOrNull(input.scheduled_scan_run_id),
    payload_json:
      input.payload_json && typeof input.payload_json === "object"
        ? input.payload_json
        : {},
  };
}

export function scheduledScanAttemptFromRow(
  row: Record<string, unknown>,
): ScheduledScanAttempt | null {
  const attemptFingerprint = textOrNull(row.attempt_fingerprint);
  const utcTimestamp = isoOrNull(row.utc_timestamp ?? row.route_received_at ?? row.created_at);

  if (!attemptFingerprint || !utcTimestamp) return null;

  return {
    id: textOrNull(row.id),
    attempt_fingerprint: attemptFingerprint,
    created_at: isoOrNull(row.created_at) ?? utcTimestamp,
    trading_date: textOrNull(row.trading_date),
    source: textOrNull(row.source) ?? "unknown",
    mode: normalizeMode(row.mode),
    outcome: normalizeOutcome(row.outcome),
    allowed: typeof row.allowed === "boolean" ? row.allowed : null,
    route_received_at: isoOrNull(row.route_received_at),
    scheduled_function_fired_at: isoOrNull(row.scheduled_function_fired_at),
    utc_timestamp: utcTimestamp,
    ny_timestamp: textOrNull(row.ny_timestamp),
    official_window: normalizeDayTradeScanWindow(textOrNull(row.official_window)),
    intraday_scan_window: textOrNull(row.intraday_scan_window),
    orchestration_decision: textOrNull(row.orchestration_decision),
    skip_reason: textOrNull(row.skip_reason),
    message: textOrNull(row.message),
    http_status: numberOrNull(row.http_status),
    raw_count: numberOrNull(row.raw_count),
    ranked_count: numberOrNull(row.ranked_count),
    selected_count: numberOrNull(row.selected_count),
    built_count: numberOrNull(row.built_count),
    published_count: numberOrNull(row.published_count),
    recommendations_created: numberOrNull(row.recommendations_created),
    batch_fingerprint: textOrNull(row.batch_fingerprint),
    scan_run_fingerprint: textOrNull(row.scan_run_fingerprint),
    scheduled_scan_run_id: textOrNull(row.scheduled_scan_run_id),
    payload_json:
      row.payload_json && typeof row.payload_json === "object"
        ? (row.payload_json as Record<string, unknown>)
        : {},
  };
}

function timelineFromAttempt(
  attempt: ScheduledScanAttempt,
): ScheduledScanTimelineEntry {
  return {
    utc_timestamp: attempt.utc_timestamp,
    ny_timestamp: attempt.ny_timestamp,
    source: attempt.source,
    mode: attempt.mode,
    official_window: attempt.official_window,
    intraday_scan_window: attempt.intraday_scan_window,
    outcome: attempt.outcome,
    allowed: attempt.allowed,
    reason: attempt.skip_reason ?? attempt.message,
    raw_count: attempt.raw_count,
    ranked_count: attempt.ranked_count,
    selected_count: attempt.selected_count,
    built_count: attempt.built_count,
    published_count: attempt.published_count ?? attempt.recommendations_created,
    batch_fingerprint: attempt.batch_fingerprint,
    scan_run_fingerprint: attempt.scan_run_fingerprint,
  };
}

function timelineFromScanLog(scanLog: ScanLogEntry): ScheduledScanTimelineEntry | null {
  const timestamp = isoOrNull(scanLog.created_at);
  if (!timestamp) return null;
  const nyTime = getNyMarketTime(new Date(timestamp));
  const outcome =
    scanLog.result === "recommendation_created"
      ? "scanned"
      : scanLog.result === "provider_error" || scanLog.result === "openai_error"
        ? "failed"
        : "skipped";

  return {
    utc_timestamp: timestamp,
    ny_timestamp: `${nyTime.ny_date} ${nyTime.ny_time} America/New_York`,
    source: scanLog.source,
    mode: scanLog.diagnostic_mode ? "diagnostic" : scanLog.source,
    official_window: classifyDayTradeScanWindow({ now: timestamp }),
    intraday_scan_window: scanLog.scan_window,
    outcome,
    allowed: scanLog.day_trade_scan_orchestration?.should_scan_now ?? null,
    reason: scanLog.no_publish_reason ?? scanLog.message,
    raw_count:
      scanLog.real_scanner_candidate_generation?.universe.candidates_generated ??
      scanLog.candidates_scanned ??
      null,
    ranked_count: scanLog.ranked_candidates_count ?? null,
    selected_count: scanLog.scanner_candidate_ranking?.selected_count ?? null,
    built_count: scanLog.recommendations_built_count ?? null,
    published_count:
      scanLog.recommendations_published_count ?? scanLog.recommendations_created,
    batch_fingerprint: scanLog.active_scan_trace?.final.batch_fingerprint ?? null,
    scan_run_fingerprint:
      scanLog.active_scan_trace?.final.scan_run_fingerprint ?? null,
  };
}

function timelineFromScanRun(
  scanRun: RecommendationScanRun,
): ScheduledScanTimelineEntry | null {
  const timestamp = isoOrNull(scanRun.observed_at);
  if (!timestamp) return null;
  const nyTime = getNyMarketTime(new Date(timestamp));
  const trace =
    scanRun.payload_json.active_scan_trace &&
    typeof scanRun.payload_json.active_scan_trace === "object"
      ? (scanRun.payload_json.active_scan_trace as {
          final?: {
            decision?: string | null;
            no_publish_reason?: string | null;
            batch_fingerprint?: string | null;
            scan_run_fingerprint?: string | null;
            ranked_candidates_count?: number | null;
            recommendations_built_count?: number | null;
            recommendations_published_count?: number | null;
          };
          ranking?: { selected_count?: number | null };
          raw_candidates?: { raw_candidate_count?: number | null };
          should_scan_now?: boolean | null;
        })
      : null;

  return {
    utc_timestamp: timestamp,
    ny_timestamp: `${nyTime.ny_date} ${nyTime.ny_time} America/New_York`,
    source: "recommendation_scan_runs",
    mode: "scheduled",
    official_window: normalizeDayTradeScanWindow(scanRun.window),
    intraday_scan_window: scanRun.window,
    outcome:
      scanRun.counts.visible_recommendation_count > 0 ||
      (trace?.final?.recommendations_published_count ?? 0) > 0
        ? "scanned"
        : scanRun.status === "failed"
          ? "failed"
          : "skipped",
    allowed: trace?.should_scan_now ?? null,
    reason: trace?.final?.no_publish_reason ?? scanRun.status,
    raw_count: scanRun.raw_candidate_count ?? trace?.raw_candidates?.raw_candidate_count ?? null,
    ranked_count: trace?.final?.ranked_candidates_count ?? null,
    selected_count: trace?.ranking?.selected_count ?? null,
    built_count: trace?.final?.recommendations_built_count ?? null,
    published_count:
      trace?.final?.recommendations_published_count ??
      scanRun.counts.visible_recommendation_count,
    batch_fingerprint: trace?.final?.batch_fingerprint ?? null,
    scan_run_fingerprint: trace?.final?.scan_run_fingerprint ?? scanRun.run_fingerprint,
  };
}

export function buildScheduledScanTimelineToday({
  attempts,
  scanLogs,
  scanRuns,
  tradingDate,
  limit = 10,
}: {
  attempts: ScheduledScanAttempt[];
  scanLogs: ScanLogEntry[];
  scanRuns: RecommendationScanRun[];
  tradingDate: string;
  limit?: number;
}): ScheduledScanTimelineEntry[] {
  const entries = [
    ...attempts.map(timelineFromAttempt),
    ...scanLogs.map(timelineFromScanLog).filter((entry): entry is ScheduledScanTimelineEntry => entry !== null),
    ...scanRuns.map(timelineFromScanRun).filter((entry): entry is ScheduledScanTimelineEntry => entry !== null),
  ].filter(
    (entry) =>
      getNewYorkDateString(new Date(entry.utc_timestamp)) === tradingDate,
  );
  const byKey = new Map<string, ScheduledScanTimelineEntry>();

  for (const entry of entries) {
    const key =
      entry.scan_run_fingerprint ??
      entry.batch_fingerprint ??
      `${entry.utc_timestamp}:${entry.source}:${entry.outcome}`;
    const existing = byKey.get(key);
    if (!existing || entry.utc_timestamp > existing.utc_timestamp) {
      byKey.set(key, entry);
    }
  }

  return Array.from(byKey.values())
    .sort((first, second) => second.utc_timestamp.localeCompare(first.utc_timestamp))
    .slice(0, limit);
}
