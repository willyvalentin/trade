import type { ActiveScanTrace } from "@/lib/active-scan-trace";
import type {
  SelectedCandidateBuildDiagnostic,
  SelectedToBuiltDropOffSummary,
} from "@/lib/recommendation-build-diagnostics";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { ScanLogEntry } from "@/lib/scan-logs";

export type OfficialScanWindowAttemptClassification =
  | "published_official_batch"
  | "meaningful_no_trade_valid"
  | "empty_initial_tick_retry_allowed"
  | "not_serving";

export type OfficialScanWindowAttemptEvidence = {
  allowed?: boolean | null;
  outcome?: string | null;
  status?: string | null;
  reason?: string | null;
  raw_count?: number | string | null;
  ranked_count?: number | string | null;
  selected_count?: number | string | null;
  built_count?: number | string | null;
  published_count?: number | string | null;
  recommendations_created?: number | string | null;
  visible_recommendation_count?: number | string | null;
  batch_fingerprint?: string | null;
  scan_run_fingerprint?: string | null;
  selected_to_built_drop_off?: SelectedToBuiltDropOffSummary | null;
  selected_candidate_build_diagnostics?: SelectedCandidateBuildDiagnostic[] | null;
  reference_refresh?: {
    reference_refresh_attempted_count?: number | null;
    reference_refresh_success_count?: number | null;
    reference_refresh_failed_count?: number | null;
  } | null;
  active_scan_trace?: ActiveScanTrace | null;
  scan_observability?: unknown;
};

function textOrNull(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function maxMetric(...values: unknown[]) {
  const numbers = values
    .map(numberOrNull)
    .filter((value): value is number => value !== null);

  return numbers.length > 0 ? Math.max(...numbers) : null;
}

function zeroOrNull(value: number | null) {
  return value === null || value === 0;
}

function hasText(value: unknown) {
  return textOrNull(value) !== null;
}

function traceFromUnknown(value: unknown): ActiveScanTrace | null {
  return objectOrNull(value) ? (value as ActiveScanTrace) : null;
}

function dropOffFromUnknown(value: unknown): SelectedToBuiltDropOffSummary | null {
  return objectOrNull(value) ? (value as SelectedToBuiltDropOffSummary) : null;
}

function diagnosticsFromUnknown(value: unknown): SelectedCandidateBuildDiagnostic[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is SelectedCandidateBuildDiagnostic =>
          objectOrNull(item) !== null &&
          typeof (item as { ticker?: unknown }).ticker === "string" &&
          typeof (item as { rejection_reason?: unknown }).rejection_reason ===
            "string",
      )
    : [];
}

function evidenceReason(input: OfficialScanWindowAttemptEvidence) {
  return textOrNull(input.reason) ?? textOrNull(input.status);
}

function hasPublishedBatch(input: OfficialScanWindowAttemptEvidence) {
  const trace = input.active_scan_trace;
  const publishedCount = maxMetric(
    input.published_count,
    input.recommendations_created,
    input.visible_recommendation_count,
    trace?.final?.recommendations_published_count,
    trace?.final?.recommendations_created,
    trace?.final?.recommendations_served,
  );

  return Boolean(
    textOrNull(input.batch_fingerprint) ??
      textOrNull(trace?.final?.batch_fingerprint) ??
      (publishedCount !== null && publishedCount > 0),
  );
}

function hasDropOffRejections(dropOff: SelectedToBuiltDropOffSummary | null) {
  if (!dropOff || dropOff.selected_count <= 0) return false;

  return (
    Object.values(dropOff.rejection_counts).some((value) => Number(value) > 0) ||
    Object.values(dropOff.examples_by_reason).some(
      (examples) => Array.isArray(examples) && examples.length > 0,
    ) ||
    (dropOff.output_below_target_reason_category !== "unknown" &&
      hasText(dropOff.output_below_target_explanation))
  );
}

function hasReferenceRefreshDiagnostics(
  input: OfficialScanWindowAttemptEvidence,
) {
  const referenceRefresh = input.reference_refresh;
  return (
    (referenceRefresh?.reference_refresh_attempted_count ?? 0) > 0 ||
    (referenceRefresh?.reference_refresh_success_count ?? 0) > 0 ||
    (referenceRefresh?.reference_refresh_failed_count ?? 0) > 0
  );
}

function hasClearNoTradeReason(reason: string | null) {
  if (!reason) return false;
  return ![
    "empty",
    "unknown",
    "scheduled_scan_started",
    "route_received",
    "same_window_cooldown",
    "not_official_scan_window",
    "market_closed_retained_batch",
  ].includes(reason);
}

function hasMeaningfulNoTradeDiagnostics(input: OfficialScanWindowAttemptEvidence) {
  const trace = input.active_scan_trace;
  const dropOff =
    input.selected_to_built_drop_off ?? trace?.final?.selected_to_built_drop_off ?? null;
  const buildDiagnostics =
    input.selected_candidate_build_diagnostics ??
    trace?.final?.selected_candidate_build_diagnostics ??
    [];
  const rankedCount = maxMetric(
    input.ranked_count,
    trace?.ranking?.ranked_count,
    trace?.final?.ranked_candidates_count,
  );
  const selectedCount = maxMetric(
    input.selected_count,
    dropOff?.selected_count,
    trace?.ranking?.selected_count,
  );
  const reason = evidenceReason(input) ?? textOrNull(trace?.final?.no_publish_reason);

  return (
    !hasPublishedBatch(input) &&
    ((rankedCount ?? 0) > 0 || (selectedCount ?? 0) > 0) &&
    (hasDropOffRejections(dropOff) ||
      buildDiagnostics.length > 0 ||
      hasReferenceRefreshDiagnostics(input) ||
      hasClearNoTradeReason(reason))
  );
}

export function classifyOfficialScanWindowAttempt(
  input: OfficialScanWindowAttemptEvidence,
): OfficialScanWindowAttemptClassification {
  if (hasPublishedBatch(input)) {
    return "published_official_batch";
  }

  if (hasMeaningfulNoTradeDiagnostics(input)) {
    return "meaningful_no_trade_valid";
  }

  const trace = input.active_scan_trace;
  const reason = evidenceReason(input) ?? textOrNull(trace?.final?.no_publish_reason);
  const rawCount = maxMetric(
    input.raw_count,
    trace?.raw_candidates?.raw_candidate_count,
    trace?.final?.candidates_generated,
  );
  const rankedCount = maxMetric(
    input.ranked_count,
    trace?.ranking?.ranked_count,
    trace?.final?.ranked_candidates_count,
  );
  const selectedCount = maxMetric(
    input.selected_count,
    input.selected_to_built_drop_off?.selected_count,
    trace?.ranking?.selected_count,
  );
  const builtCount = maxMetric(
    input.built_count,
    input.selected_to_built_drop_off?.built_count,
    trace?.final?.recommendations_built_count,
  );
  const publishedCount = maxMetric(
    input.published_count,
    input.recommendations_created,
    input.visible_recommendation_count,
    trace?.final?.recommendations_published_count,
    trace?.final?.recommendations_created,
  );
  const buildDiagnostics =
    input.selected_candidate_build_diagnostics ??
    trace?.final?.selected_candidate_build_diagnostics ??
    [];

  if (
    (input.allowed === null || input.allowed === undefined) &&
    reason === "empty" &&
    zeroOrNull(rawCount) &&
    zeroOrNull(rankedCount) &&
    zeroOrNull(selectedCount) &&
    zeroOrNull(builtCount) &&
    zeroOrNull(publishedCount) &&
    !textOrNull(input.batch_fingerprint) &&
    !textOrNull(trace?.final?.batch_fingerprint) &&
    !input.selected_to_built_drop_off &&
    !trace?.final?.selected_to_built_drop_off &&
    buildDiagnostics.length === 0 &&
    !hasReferenceRefreshDiagnostics(input)
  ) {
    return "empty_initial_tick_retry_allowed";
  }

  return "not_serving";
}

export function officialScanAttemptServesWindow(
  input: OfficialScanWindowAttemptEvidence,
) {
  const classification = classifyOfficialScanWindowAttempt(input);
  return (
    classification === "published_official_batch" ||
    classification === "meaningful_no_trade_valid"
  );
}

export function officialScanRunEvidence(
  scanRun: RecommendationScanRun,
): OfficialScanWindowAttemptEvidence {
  const payload = scanRun.payload_json ?? {};
  const trace = traceFromUnknown(payload.active_scan_trace);
  const buildRejectionDiagnostics = objectOrNull(
    payload.build_rejection_diagnostics,
  );

  return {
    allowed: trace?.should_scan_now ?? null,
    outcome: scanRun.status,
    status: scanRun.status,
    reason:
      textOrNull(payload.empty_scan_reason) ??
      textOrNull(trace?.final?.no_publish_reason) ??
      scanRun.status,
    raw_count: scanRun.raw_candidate_count,
    ranked_count:
      trace?.ranking?.ranked_count ?? trace?.final?.ranked_candidates_count ?? null,
    selected_count: trace?.ranking?.selected_count ?? null,
    built_count: trace?.final?.recommendations_built_count ?? null,
    published_count: trace?.final?.recommendations_published_count ?? null,
    recommendations_created: trace?.final?.recommendations_created ?? null,
    visible_recommendation_count: scanRun.counts.visible_recommendation_count,
    batch_fingerprint: trace?.final?.batch_fingerprint ?? null,
    scan_run_fingerprint: trace?.final?.scan_run_fingerprint ?? scanRun.run_fingerprint,
    selected_to_built_drop_off:
      dropOffFromUnknown(payload.selected_to_built_drop_off) ??
      dropOffFromUnknown(buildRejectionDiagnostics?.selected_to_built_drop_off) ??
      trace?.final?.selected_to_built_drop_off ??
      null,
    selected_candidate_build_diagnostics: [
      ...diagnosticsFromUnknown(payload.selected_candidate_build_diagnostics),
      ...diagnosticsFromUnknown(
        buildRejectionDiagnostics?.selected_candidate_build_diagnostics,
      ),
      ...(trace?.final?.selected_candidate_build_diagnostics ?? []),
    ],
    reference_refresh: objectOrNull(payload.reference_refresh),
    active_scan_trace: trace,
    scan_observability: payload.scan_observability,
  };
}

export function officialScanRunServesWindow(scanRun: RecommendationScanRun) {
  return officialScanAttemptServesWindow(officialScanRunEvidence(scanRun));
}

export function officialScanLogServesWindow(scanLog: ScanLogEntry) {
  return officialScanAttemptServesWindow({
    allowed: scanLog.day_trade_scan_orchestration?.should_scan_now ?? null,
    outcome: scanLog.result,
    status: scanLog.result,
    reason: scanLog.no_publish_reason ?? scanLog.message,
    raw_count:
      scanLog.real_scanner_candidate_generation?.universe.candidates_generated ??
      scanLog.candidates_scanned ??
      null,
    ranked_count: scanLog.ranked_candidates_count,
    selected_count: scanLog.scanner_candidate_ranking?.selected_count ?? null,
    built_count: scanLog.recommendations_built_count,
    published_count: scanLog.recommendations_published_count,
    recommendations_created: scanLog.recommendations_created,
    batch_fingerprint: scanLog.active_scan_trace?.final?.batch_fingerprint ?? null,
    scan_run_fingerprint:
      scanLog.active_scan_trace?.final?.scan_run_fingerprint ?? null,
    selected_to_built_drop_off: scanLog.selected_to_built_drop_off ?? null,
    selected_candidate_build_diagnostics:
      scanLog.selected_candidate_build_diagnostics ?? [],
    reference_refresh: scanLog.reference_refresh ?? null,
    active_scan_trace: scanLog.active_scan_trace ?? null,
  });
}
