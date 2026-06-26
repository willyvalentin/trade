import {
  classifyDayTradeScanWindow,
  normalizeDayTradeScanWindow,
  type DayTradeScanWindow,
} from "@/lib/day-trade-scan-orchestration";
import { getNewYorkDateString, type IntradayScanWindow } from "@/lib/intraday-scan-window";
import { getNyMarketTime } from "@/lib/market-session";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { ScanLogEntry } from "@/lib/scan-logs";
import type { ActiveScanTrace } from "@/lib/active-scan-trace";
import {
  classifyOfficialScanWindowAttempt,
  officialScanAttemptServesWindow,
  officialScanRunEvidence,
} from "@/lib/official-scan-window-completion";
import type {
  CandidateBuildRejectionCategory,
  CandidateBuildRejectionReason,
  SelectedCandidateBuildDiagnostic,
  SelectedToBuiltDropOffSummary,
} from "@/lib/recommendation-build-diagnostics";
import type { ReferenceRefreshDiagnostics } from "@/lib/reference-refresh-diagnostics";

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
  selected_to_built_drop_off: SelectedToBuiltDropOffSummary | null;
  selected_candidate_build_diagnostics: SelectedCandidateBuildDiagnostic[];
  empty_scan_reason: string | null;
  rejection_summary: ScheduledScanRejectionSummary | null;
  reference_refresh: ReferenceRefreshDiagnostics | null;
  payload_json: Record<string, unknown>;
};

export type ScheduledScanRejectionSummary = {
  empty_scan_reason: string | null;
  top_rejection_reasons: string[];
  examples_by_reason: Record<string, string[]>;
  below_target_category: string | null;
  below_target_explanation: string | null;
  next_best_fix: string | null;
};

export type ScheduledScanTimelineEntry = {
  utc_timestamp: string;
  ny_timestamp: string | null;
  source: string;
  source_type: "scan_attempt" | "scan_log" | "scan_run" | "retained_readback";
  readback_kind: "actual_scan" | "retained_review_batch" | null;
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
  empty_scan_reason: string | null;
  rejection_summary: ScheduledScanRejectionSummary | null;
  selected_to_built_drop_off: SelectedToBuiltDropOffSummary | null;
  selected_candidate_build_diagnostics: SelectedCandidateBuildDiagnostic[];
  reference_refresh: ReferenceRefreshDiagnostics | null;
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

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function numericRecordFromUnknown<T extends string>(
  value: unknown,
): Partial<Record<T, number>> {
  const candidate = objectOrNull(value);
  if (!candidate) return {};

  return Object.fromEntries(
    Object.entries(candidate)
      .map(([key, recordValue]) => [key, numberOrNull(recordValue)] as const)
      .filter((entry): entry is readonly [string, number] => entry[1] !== null),
  ) as Partial<Record<T, number>>;
}

function stringArrayRecordFromUnknown<T extends string>(
  value: unknown,
): Partial<Record<T, string[]>> {
  const candidate = objectOrNull(value);
  if (!candidate) return {};

  return Object.fromEntries(
    Object.entries(candidate)
      .map(([key, recordValue]) => [
        key,
        Array.isArray(recordValue)
          ? recordValue.filter((item): item is string => typeof item === "string")
          : [],
      ] as const)
      .filter(([, recordValue]) => recordValue.length > 0),
  ) as Partial<Record<T, string[]>>;
}

function outputBelowTargetCategoryFromUnknown(
  value: unknown,
): SelectedToBuiltDropOffSummary["output_below_target_reason_category"] {
  const text = textOrNull(value);
  if (
    text === "healthy_caution" ||
    text === "data_quality" ||
    text === "safety" ||
    text === "builder_limit" ||
    text === "implementation_bottleneck"
  ) {
    return text;
  }

  return "unknown";
}

function selectedToBuiltFromUnknown(
  value: unknown,
): SelectedToBuiltDropOffSummary | null {
  const candidate = objectOrNull(value);
  if (!candidate) return null;

  return {
    selected_count: numberOrNull(candidate.selected_count) ?? 0,
    built_count: numberOrNull(candidate.built_count) ?? 0,
    rejected_count: numberOrNull(candidate.rejected_count) ?? 0,
    rejection_counts: numericRecordFromUnknown<CandidateBuildRejectionReason>(
      candidate.rejection_counts,
    ),
    category_counts: numericRecordFromUnknown<CandidateBuildRejectionCategory>(
      candidate.category_counts,
    ),
    examples_by_reason:
      stringArrayRecordFromUnknown<CandidateBuildRejectionReason>(
        candidate.examples_by_reason,
      ),
    output_below_target_reason_category: outputBelowTargetCategoryFromUnknown(
      candidate.output_below_target_reason_category,
    ),
    output_below_target_explanation:
      textOrNull(candidate.output_below_target_explanation) ??
      "Output is below target and needs additional diagnostics.",
  };
}

function selectedBuildDiagnosticsFromUnknown(
  value: unknown,
): SelectedCandidateBuildDiagnostic[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is SelectedCandidateBuildDiagnostic =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { ticker?: unknown }).ticker === "string" &&
          typeof (item as { rejection_reason?: unknown }).rejection_reason ===
            "string",
      )
    : [];
}

function referenceRefreshFromUnknown(
  value: unknown,
): ReferenceRefreshDiagnostics | null {
  const candidate = objectOrNull(value);
  if (!candidate) return null;
  const examples = objectOrNull(candidate.reference_refresh_examples_by_ticker);
  const attempts = Array.isArray(candidate.reference_refresh_attempts)
    ? candidate.reference_refresh_attempts
        .map((item) => objectOrNull(item))
        .filter((item): item is Record<string, unknown> => item !== null)
        .map((item) => ({
          ticker:
            typeof item.ticker === "string" && item.ticker.trim()
              ? item.ticker
              : "UNKNOWN",
          provider_symbol:
            typeof item.provider_symbol === "string" ? item.provider_symbol : null,
          source_attempted:
            typeof item.source_attempted === "string"
              ? item.source_attempted
              : "unknown",
          timestamp: isoOrNull(item.timestamp),
          price: numberOrNull(item.price),
          provider: typeof item.provider === "string" ? item.provider : null,
          read_path: typeof item.read_path === "string" ? item.read_path : null,
          ny_trading_date:
            typeof item.ny_trading_date === "string" ? item.ny_trading_date : null,
          accepted: Boolean(item.accepted),
          rejection_reason:
            typeof item.rejection_reason === "string"
              ? item.rejection_reason
              : null,
          provider_message:
            typeof item.provider_message === "string"
              ? item.provider_message
              : null,
        }))
    : [];

  return {
    reference_refresh_attempted_count:
      numberOrNull(candidate.reference_refresh_attempted_count) ?? 0,
    reference_refresh_success_count:
      numberOrNull(candidate.reference_refresh_success_count) ?? 0,
    reference_refresh_failed_count:
      numberOrNull(candidate.reference_refresh_failed_count) ?? 0,
    reference_refresh_skipped_budget_count:
      numberOrNull(candidate.reference_refresh_skipped_budget_count) ?? 0,
    reference_refresh_source_counts: numericRecordFromUnknown<string>(
      candidate.reference_refresh_source_counts,
    ) as Record<string, number>,
    reference_refresh_accepted_source_counts: numericRecordFromUnknown<string>(
      candidate.reference_refresh_accepted_source_counts,
    ) as Record<string, number>,
    reference_refresh_rejected_source_counts: numericRecordFromUnknown<string>(
      candidate.reference_refresh_rejected_source_counts,
    ) as Record<string, number>,
    reference_refresh_failure_reasons: numericRecordFromUnknown<string>(
      candidate.reference_refresh_failure_reasons,
    ) as ReferenceRefreshDiagnostics["reference_refresh_failure_reasons"],
    reference_refresh_failure_examples: stringArrayRecordFromUnknown<string>(
      candidate.reference_refresh_failure_examples,
    ) as ReferenceRefreshDiagnostics["reference_refresh_failure_examples"],
    reference_refresh_attempts:
      attempts as ReferenceRefreshDiagnostics["reference_refresh_attempts"],
    reference_refresh_examples_by_ticker: {
      attempted:
        Array.isArray(examples?.attempted)
          ? examples.attempted.filter((item): item is string => typeof item === "string")
          : [],
      rescued:
        Array.isArray(examples?.rescued)
          ? examples.rescued.filter((item): item is string => typeof item === "string")
          : [],
      failed:
        Array.isArray(examples?.failed)
          ? examples.failed.filter((item): item is string => typeof item === "string")
          : [],
      skipped_budget:
        Array.isArray(examples?.skipped_budget)
          ? examples.skipped_budget.filter(
              (item): item is string => typeof item === "string",
            )
          : [],
    },
    reference_refresh_final_references:
      (objectOrNull(candidate.reference_refresh_final_references) as ReferenceRefreshDiagnostics["reference_refresh_final_references"] | null) ??
      {},
    reference_refresh_rescued_from_scanner_cache_reference_too_old_count:
      numberOrNull(
        candidate.reference_refresh_rescued_from_scanner_cache_reference_too_old_count,
      ) ?? 0,
    reference_refresh_remaining_stale_reference_blocks:
      numberOrNull(candidate.reference_refresh_remaining_stale_reference_blocks) ?? 0,
  };
}

function activeTraceFromPayload(payload: Record<string, unknown>): ActiveScanTrace | null {
  const trace = objectOrNull(payload.active_scan_trace);
  return trace ? (trace as ActiveScanTrace) : null;
}

function referenceRefreshAttempted(
  referenceRefresh: ReferenceRefreshDiagnostics | null,
) {
  return referenceRefresh
    ? {
        reference_refresh_attempted_count:
          referenceRefresh.reference_refresh_attempted_count,
        reference_refresh_success_count:
          referenceRefresh.reference_refresh_success_count,
        reference_refresh_failed_count:
          referenceRefresh.reference_refresh_failed_count,
      }
    : null;
}

export function buildEmptyScanReason(
  dropOff: SelectedToBuiltDropOffSummary | null,
): string | null {
  const topReason =
    Object.entries(dropOff?.rejection_counts ?? {})
      .filter(([, value]) => numberOrNull(value) !== null && Number(value) > 0)
      .sort((first, second) => Number(second[1]) - Number(first[1]))[0]?.[0] ??
    null;

  if (
    topReason === "missing_fresh_reference_price" ||
    topReason === "missing_reference_source" ||
    topReason === "missing_reference_timestamp"
  ) {
    return "empty_due_to_missing_fresh_reference";
  }
  if (
    topReason === "scanner_cache_reference_too_old" ||
    topReason === "stale_reference_price" ||
    topReason === "stale_market_data" ||
    topReason === "future_reference_timestamp"
  ) {
    return "empty_due_to_stale_reference";
  }
  if (topReason === "provider_data_unavailable") {
    return "empty_due_to_provider_data_unavailable";
  }
  if (topReason === "invalid_risk_geometry" || topReason === "weak_risk_reward") {
    return "empty_due_to_risk_geometry";
  }
  if (
    topReason === "below_publish_threshold" ||
    topReason === "ranking_selected_but_not_qualified" ||
    topReason === "not_selected_by_ranking"
  ) {
    return "empty_due_to_thresholds";
  }
  if (topReason === "fallback_builder_limit_reached") {
    return "empty_due_to_builder_limit";
  }
  if (dropOff && Object.keys(dropOff.rejection_counts).length > 1) {
    return "empty_due_to_mixed_rejections";
  }

  return null;
}

function nextBestFixForCategory(category: string | null) {
  if (category === "data_quality") {
    return "Refresh provider/reference-price inputs before the next official scan.";
  }
  if (category === "safety") {
    return "Inspect rejected plans for invalid entry/stop/target geometry before changing thresholds.";
  }
  if (category === "builder_limit") {
    return "Review builder/session limits if the selected set is otherwise valid.";
  }
  if (category === "implementation_bottleneck") {
    return "Add missing exact rejection instrumentation for the selected candidates.";
  }
  if (category === "healthy_caution") {
    return "No immediate fix; the scanner avoided forcing low-quality output.";
  }

  return "Inspect selected candidate diagnostics for missing data or builder gaps.";
}

export function buildScheduledScanRejectionSummary({
  dropOff,
  emptyScanReason,
}: {
  dropOff: SelectedToBuiltDropOffSummary | null;
  emptyScanReason?: string | null;
}): ScheduledScanRejectionSummary | null {
  if (!dropOff || dropOff.selected_count === 0) return null;

  const topRejectionReasons = Object.entries(dropOff.rejection_counts)
    .filter(([, value]) => Number(value) > 0)
    .sort((first, second) => Number(second[1]) - Number(first[1]))
    .slice(0, 5)
    .map(([reason, value]) => `${reason}:${value}`);
  const examplesByReason = Object.fromEntries(
    Object.entries(dropOff.examples_by_reason)
      .filter(([, examples]) => Array.isArray(examples) && examples.length > 0)
      .map(([reason, examples]) => [reason, examples ?? []]),
  );
  const category = dropOff.output_below_target_reason_category;

  return {
    empty_scan_reason: emptyScanReason ?? buildEmptyScanReason(dropOff),
    top_rejection_reasons: topRejectionReasons,
    examples_by_reason: examplesByReason,
    below_target_category: category,
    below_target_explanation: dropOff.output_below_target_explanation,
    next_best_fix: nextBestFixForCategory(category),
  };
}

function dropOffFromPayload(payload: Record<string, unknown>) {
  const trace = activeTraceFromPayload(payload);
  return (
    selectedToBuiltFromUnknown(payload.selected_to_built_drop_off) ??
    selectedToBuiltFromUnknown(
      objectOrNull(payload.build_rejection_diagnostics)?.selected_to_built_drop_off,
    ) ??
    trace?.final.selected_to_built_drop_off ??
    null
  );
}

function buildDiagnosticsFromPayload(payload: Record<string, unknown>) {
  const trace = activeTraceFromPayload(payload);
  return [
    ...selectedBuildDiagnosticsFromUnknown(payload.selected_candidate_build_diagnostics),
    ...selectedBuildDiagnosticsFromUnknown(
      objectOrNull(payload.build_rejection_diagnostics)
        ?.selected_candidate_build_diagnostics,
    ),
    ...(trace?.final.selected_candidate_build_diagnostics ?? []),
  ];
}

function referenceRefreshFromPayload(payload: Record<string, unknown>) {
  return referenceRefreshFromUnknown(payload.reference_refresh);
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
  const inputPayload =
    input.payload_json && typeof input.payload_json === "object"
      ? input.payload_json
      : {};
  const dropOff =
    selectedToBuiltFromUnknown(input.selected_to_built_drop_off) ??
    dropOffFromPayload(inputPayload);
  const buildDiagnostics =
    input.selected_candidate_build_diagnostics?.length
      ? input.selected_candidate_build_diagnostics
      : buildDiagnosticsFromPayload(inputPayload);
  const emptyScanReason =
    textOrNull(input.empty_scan_reason) ?? buildEmptyScanReason(dropOff);
  const rejectionSummary =
    input.rejection_summary ??
    buildScheduledScanRejectionSummary({
      dropOff,
      emptyScanReason,
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
    payload_json: {
      ...inputPayload,
      selected_to_built_drop_off: dropOff,
      selected_candidate_build_diagnostics: buildDiagnostics,
      reference_refresh:
        referenceRefreshFromUnknown(input.reference_refresh) ??
        referenceRefreshFromPayload(inputPayload),
      empty_scan_reason: emptyScanReason,
      rejection_summary: rejectionSummary,
      build_rejection_diagnostics: {
        selected_count: dropOff?.selected_count ?? input.selected_count ?? null,
        built_count: dropOff?.built_count ?? input.built_count ?? null,
        published_count: input.published_count ?? input.recommendations_created ?? null,
        selected_to_built_drop_off: dropOff,
        selected_candidate_build_diagnostics: buildDiagnostics,
        rejection_summary: rejectionSummary,
      },
    },
  };
}

export function scheduledScanAttemptFromRow(
  row: Record<string, unknown>,
): ScheduledScanAttempt | null {
  const attemptFingerprint = textOrNull(row.attempt_fingerprint);
  const utcTimestamp = isoOrNull(row.utc_timestamp ?? row.route_received_at ?? row.created_at);

  if (!attemptFingerprint || !utcTimestamp) return null;

  const payload =
    row.payload_json && typeof row.payload_json === "object"
      ? (row.payload_json as Record<string, unknown>)
      : {};
  const dropOff = dropOffFromPayload(payload);
  const buildDiagnostics = buildDiagnosticsFromPayload(payload);
  const emptyScanReason =
    textOrNull(payload.empty_scan_reason) ?? buildEmptyScanReason(dropOff);
  const rejectionSummary =
    objectOrNull(payload.rejection_summary) as ScheduledScanRejectionSummary | null;

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
    selected_to_built_drop_off: dropOff,
    selected_candidate_build_diagnostics: buildDiagnostics,
    empty_scan_reason: emptyScanReason,
    rejection_summary:
      rejectionSummary ??
      buildScheduledScanRejectionSummary({
        dropOff,
        emptyScanReason,
      }),
    payload_json: payload,
    reference_refresh: referenceRefreshFromPayload(payload),
  };
}

function timelineFromAttempt(
  attempt: ScheduledScanAttempt,
): ScheduledScanTimelineEntry {
  const classification = classifyOfficialScanWindowAttempt({
    allowed: attempt.allowed,
    outcome: attempt.outcome,
    status: attempt.outcome,
    reason: attempt.skip_reason ?? attempt.empty_scan_reason ?? attempt.message,
    raw_count: attempt.raw_count,
    ranked_count: attempt.ranked_count,
    selected_count: attempt.selected_count,
    built_count: attempt.built_count,
    published_count: attempt.published_count,
    recommendations_created: attempt.recommendations_created,
    batch_fingerprint: attempt.batch_fingerprint,
    scan_run_fingerprint: attempt.scan_run_fingerprint,
    selected_to_built_drop_off: attempt.selected_to_built_drop_off,
    selected_candidate_build_diagnostics:
      attempt.selected_candidate_build_diagnostics,
    reference_refresh: referenceRefreshAttempted(attempt.reference_refresh),
    active_scan_trace: activeTraceFromPayload(attempt.payload_json),
  });
  const isActualScan = officialScanAttemptServesWindow({
    allowed: attempt.allowed,
    outcome: attempt.outcome,
    status: attempt.outcome,
    reason: attempt.skip_reason ?? attempt.empty_scan_reason ?? attempt.message,
    raw_count: attempt.raw_count,
    ranked_count: attempt.ranked_count,
    selected_count: attempt.selected_count,
    built_count: attempt.built_count,
    published_count: attempt.published_count,
    recommendations_created: attempt.recommendations_created,
    batch_fingerprint: attempt.batch_fingerprint,
    scan_run_fingerprint: attempt.scan_run_fingerprint,
    selected_to_built_drop_off: attempt.selected_to_built_drop_off,
    selected_candidate_build_diagnostics:
      attempt.selected_candidate_build_diagnostics,
    reference_refresh: referenceRefreshAttempted(attempt.reference_refresh),
    active_scan_trace: activeTraceFromPayload(attempt.payload_json),
  });

  return {
    utc_timestamp: attempt.utc_timestamp,
    ny_timestamp: attempt.ny_timestamp,
    source: attempt.source,
    source_type: "scan_attempt",
    readback_kind: isActualScan ? "actual_scan" : null,
    mode: attempt.mode,
    official_window: attempt.official_window,
    intraday_scan_window: attempt.intraday_scan_window,
    outcome: attempt.outcome,
    allowed: attempt.allowed,
    reason:
      classification === "empty_initial_tick_retry_allowed"
        ? "empty_initial_tick_retry_allowed"
        : attempt.skip_reason ?? attempt.empty_scan_reason ?? attempt.message,
    raw_count: attempt.raw_count,
    ranked_count: attempt.ranked_count,
    selected_count: attempt.selected_count,
    built_count: attempt.built_count,
    published_count:
      attempt.outcome === "scanned"
        ? attempt.published_count ?? attempt.recommendations_created
        : 0,
    batch_fingerprint: attempt.batch_fingerprint,
    scan_run_fingerprint: attempt.scan_run_fingerprint,
    empty_scan_reason: attempt.empty_scan_reason,
    rejection_summary: attempt.rejection_summary,
    selected_to_built_drop_off: attempt.selected_to_built_drop_off,
    selected_candidate_build_diagnostics:
      attempt.selected_candidate_build_diagnostics,
    reference_refresh: attempt.reference_refresh,
  };
}

function timelineFromScanLog(scanLog: ScanLogEntry): ScheduledScanTimelineEntry | null {
  const timestamp = isoOrNull(scanLog.created_at);
  if (!timestamp) return null;
  const nyTime = getNyMarketTime(new Date(timestamp));
  const officialWindow = classifyDayTradeScanWindow({ now: timestamp });
  const outcome =
    scanLog.result === "recommendation_created"
      ? "scanned"
      : scanLog.result === "provider_error" || scanLog.result === "openai_error"
        ? "failed"
        : "skipped";
  const dropOff = scanLog.selected_to_built_drop_off ?? null;
  const emptyScanReason = buildEmptyScanReason(dropOff);
  const rejectionSummary = buildScheduledScanRejectionSummary({
    dropOff,
    emptyScanReason,
  });
  const traceBatchFingerprint =
    scanLog.active_scan_trace?.final.batch_fingerprint ?? null;
  const traceScanRunFingerprint =
    scanLog.active_scan_trace?.final.scan_run_fingerprint ?? null;
  const publishedCount =
    scanLog.recommendations_published_count ?? scanLog.recommendations_created;
  const isRetainedReadback =
    outcome === "scanned" &&
    (officialWindow === "closed" || officialWindow === "outside_window") &&
    !traceBatchFingerprint &&
    !traceScanRunFingerprint &&
    (publishedCount ?? 0) > 0;

  return {
    utc_timestamp: timestamp,
    ny_timestamp: `${nyTime.ny_date} ${nyTime.ny_time} America/New_York`,
    source: isRetainedReadback ? "review/readback" : scanLog.source,
    source_type: isRetainedReadback ? "retained_readback" : "scan_log",
    readback_kind: isRetainedReadback ? "retained_review_batch" : null,
    mode: scanLog.diagnostic_mode ? "diagnostic" : scanLog.source,
    official_window: officialWindow,
    intraday_scan_window: scanLog.scan_window,
    outcome: isRetainedReadback ? "retained_review_batch" : outcome,
    allowed: scanLog.day_trade_scan_orchestration?.should_scan_now ?? null,
    reason: isRetainedReadback
      ? "market_closed_retained_batch"
      : emptyScanReason ?? scanLog.no_publish_reason ?? scanLog.message,
    raw_count:
      scanLog.real_scanner_candidate_generation?.universe.candidates_generated ??
      scanLog.candidates_scanned ??
      null,
    ranked_count: scanLog.ranked_candidates_count ?? null,
    selected_count: scanLog.scanner_candidate_ranking?.selected_count ?? null,
    built_count: scanLog.recommendations_built_count ?? null,
    published_count: publishedCount,
    batch_fingerprint: traceBatchFingerprint,
    scan_run_fingerprint: traceScanRunFingerprint,
    empty_scan_reason: emptyScanReason,
    rejection_summary: rejectionSummary,
    selected_to_built_drop_off: dropOff,
    selected_candidate_build_diagnostics:
      scanLog.selected_candidate_build_diagnostics ?? [],
    reference_refresh: scanLog.reference_refresh ?? null,
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
            selected_candidate_build_diagnostics?:
              | SelectedCandidateBuildDiagnostic[]
              | null;
            selected_to_built_drop_off?: SelectedToBuiltDropOffSummary | null;
          };
          ranking?: {
            ranked_count?: number | null;
            selected_count?: number | null;
          };
          raw_candidates?: { raw_candidate_count?: number | null };
          should_scan_now?: boolean | null;
        })
      : null;
  const dropOff =
    dropOffFromPayload(scanRun.payload_json) ??
    trace?.final?.selected_to_built_drop_off ??
    null;
  const emptyScanReason = buildEmptyScanReason(dropOff);
  const rejectionSummary = buildScheduledScanRejectionSummary({
    dropOff,
    emptyScanReason,
  });
  const buildDiagnostics =
    buildDiagnosticsFromPayload(scanRun.payload_json).length > 0
      ? buildDiagnosticsFromPayload(scanRun.payload_json)
      : trace?.final?.selected_candidate_build_diagnostics ?? [];
  const referenceRefresh = referenceRefreshFromPayload(scanRun.payload_json);
  const publishedCount =
    trace?.final?.recommendations_published_count ??
    scanRun.counts.visible_recommendation_count;
  const officialWindow = normalizeDayTradeScanWindow(scanRun.window);
  const isRetainedReadback =
    (officialWindow === "closed" || officialWindow === "outside_window") &&
    publishedCount > 0 &&
    !trace?.final?.batch_fingerprint;
  const publishedScanProduced =
    !isRetainedReadback &&
    (publishedCount > 0 || (trace?.final?.batch_fingerprint ?? null) !== null);
  const actualScanProduced =
    !isRetainedReadback &&
    officialScanAttemptServesWindow(officialScanRunEvidence(scanRun));
  const classification = classifyOfficialScanWindowAttempt(
    officialScanRunEvidence(scanRun),
  );

  return {
    utc_timestamp: timestamp,
    ny_timestamp: `${nyTime.ny_date} ${nyTime.ny_time} America/New_York`,
    source: isRetainedReadback
      ? "review/readback"
      : "recommendation_scan_runs",
    source_type: isRetainedReadback ? "retained_readback" : "scan_run",
    readback_kind: isRetainedReadback
      ? "retained_review_batch"
      : actualScanProduced
        ? "actual_scan"
        : null,
    mode: "scheduled",
    official_window: officialWindow,
    intraday_scan_window: scanRun.window,
    outcome:
      isRetainedReadback
        ? "retained_review_batch"
        : publishedScanProduced
        ? "scanned"
        : scanRun.status === "failed"
          ? "failed"
          : "skipped",
    allowed: trace?.should_scan_now ?? null,
    reason: isRetainedReadback
      ? "market_closed_retained_batch"
      : classification === "empty_initial_tick_retry_allowed"
        ? "empty_initial_tick_retry_allowed"
        : emptyScanReason ?? trace?.final?.no_publish_reason ?? scanRun.status,
    raw_count: scanRun.raw_candidate_count ?? trace?.raw_candidates?.raw_candidate_count ?? null,
    ranked_count:
      trace?.ranking?.ranked_count ??
      trace?.final?.ranked_candidates_count ??
      scanRun.raw_candidate_count ??
      null,
    selected_count: trace?.ranking?.selected_count ?? null,
    built_count: trace?.final?.recommendations_built_count ?? null,
    published_count: publishedCount,
    batch_fingerprint: trace?.final?.batch_fingerprint ?? null,
    scan_run_fingerprint: trace?.final?.scan_run_fingerprint ?? scanRun.run_fingerprint,
    empty_scan_reason: emptyScanReason,
    rejection_summary: rejectionSummary,
    selected_to_built_drop_off: dropOff,
    selected_candidate_build_diagnostics: buildDiagnostics,
    reference_refresh: referenceRefresh,
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
