import type { ScheduledScanInvocationReceipt } from "@/lib/scheduled-scan-invocation-receipt";

export const OBSERVATION_SERIES_EVIDENCE_READBACK_VERSION =
  "observation_series_evidence_readback_v1" as const;

export type ObservationSeriesOperationalClassification =
  | "pass"
  | "in_progress"
  | "fail"
  | "inconclusive";

export type ObservationSeriesEvidenceReadback = Readonly<{
  readback_version: typeof OBSERVATION_SERIES_EVIDENCE_READBACK_VERSION;
  status: "available" | "unavailable";
  reason_codes: readonly string[];
  series: Readonly<{
    series_id: string;
    control_version: "observation_series_control_v1";
    trading_date: string;
    starts_at_utc: string;
    expires_at_utc: string;
    max_attempts: number;
    max_provider_credits: number;
    evaluated_at: string;
    build_deployment_identity: ScheduledScanInvocationReceipt["build_deployment_identity"];
    operational: Readonly<{
      classification: ObservationSeriesOperationalClassification;
      terminal_reason:
        | "not_terminal"
        | "publication_observed"
        | "failure_stop_reached"
        | "attempt_cap_reached"
        | "credit_cap_reached"
        | "expired"
        | "evidence_invalid";
      lineage_status: "attributed" | "invalid";
      reason_codes: readonly string[];
    }>;
    counts: Readonly<{
      scheduled_attempts: number;
      attributed_receipts: number;
      missing_receipts: number;
      orphan_receipts: number;
      duplicate_receipts: number;
      active_cycles: number;
      completed_cycles: number;
      rejected_cycles: number;
      failed_cycles: number;
      consecutive_failures: number;
      admitted_current_data_cycles: number;
      provider_attempted_cycles: number;
      reserved_provider_credits: number;
      provider_successes: number;
      provider_errors: number;
      stale_inputs: number;
      raw_candidates: number;
      ranked_candidates: number;
      selected_candidates: number;
      built_recommendations: number;
      published_recommendations: number;
      no_trade_cycles: number;
    }>;
    quality: Readonly<{
      classification: "not_evaluated" | "insufficient_forward_evidence";
      completed_evaluation_cycles: number;
      published_recommendations: number;
      evidence_gaps: readonly string[];
    }>;
    authority: Readonly<{
      arms_scheduler: false;
      calls_provider: false;
      reserves_provider_credits: false;
      changes_ranking: false;
      publishes_candidate: false;
      executes_paper_trade: false;
      executes_broker_order: false;
    }>;
  }> | null;
}>;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function positiveInteger(value: unknown) {
  const parsed = nonNegativeInteger(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function stringArrayOrNull(value: unknown) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return null;
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function canonicalIso(value: unknown) {
  const text = textOrNull(value);
  if (!text) return null;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === text
    ? text
    : null;
}

export function unavailableObservationSeriesEvidenceReadback(
  reasonCode: string,
): ObservationSeriesEvidenceReadback {
  return Object.freeze({
    readback_version: OBSERVATION_SERIES_EVIDENCE_READBACK_VERSION,
    status: "unavailable",
    reason_codes: Object.freeze([reasonCode]),
    series: null,
  });
}

function authorityIsInert(value: unknown) {
  const candidate = objectOrNull(value);
  return Boolean(
    candidate &&
      candidate.arms_scheduler === false &&
      candidate.calls_provider === false &&
      candidate.reserves_provider_credits === false &&
      candidate.changes_ranking === false &&
      candidate.publishes_candidate === false &&
      candidate.executes_paper_trade === false &&
      candidate.executes_broker_order === false,
  );
}

function seriesEnvelopeIsValid(series: Record<string, unknown>) {
  const startsAt = canonicalIso(series.starts_at_utc);
  const expiresAt = canonicalIso(series.expires_at_utc);
  const maxAttempts = positiveInteger(series.max_attempts);
  const maxCredits = positiveInteger(series.max_provider_credits);
  const durationMinutes =
    startsAt && expiresAt
      ? (Date.parse(expiresAt) - Date.parse(startsAt)) / 60_000
      : null;
  return Boolean(
    series.control_version === "observation_series_control_v1" &&
      /^observation_series_[a-f0-9]{16}$/.test(String(series.series_id ?? "")) &&
      /^\d{4}-\d{2}-\d{2}$/.test(String(series.trading_date ?? "")) &&
      startsAt &&
      expiresAt &&
      Date.parse(startsAt) % (15 * 60_000) === 0 &&
      Date.parse(expiresAt) % (15 * 60_000) === 0 &&
      durationMinutes !== null &&
      durationMinutes > 0 &&
      durationMinutes <= 390 &&
      maxAttempts !== null &&
      maxAttempts <= 26 &&
      maxAttempts <= durationMinutes / 15 &&
      maxCredits !== null &&
      maxCredits % 8 === 0 &&
      maxCredits <= maxAttempts * 8,
  );
}

export function observationSeriesEvidenceReadbackFromUnknown(
  value: unknown,
): ObservationSeriesEvidenceReadback {
  const readback = objectOrNull(value);
  const reasonCodes = stringArrayOrNull(readback?.reason_codes);
  if (
    readback?.readback_version !==
      OBSERVATION_SERIES_EVIDENCE_READBACK_VERSION ||
    (readback.status !== "available" && readback.status !== "unavailable") ||
    !reasonCodes
  ) {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_evidence_readback_invalid",
    );
  }
  if (readback.status === "unavailable") {
    return readback.series === null
      ? unavailableObservationSeriesEvidenceReadback(
          reasonCodes[0] ?? "observation_series_evidence_unavailable",
        )
      : unavailableObservationSeriesEvidenceReadback(
          "observation_series_evidence_readback_invalid",
        );
  }

  const series = objectOrNull(readback.series);
  const operational = objectOrNull(series?.operational);
  const counts = objectOrNull(series?.counts);
  const quality = objectOrNull(series?.quality);
  const buildIdentity = objectOrNull(series?.build_deployment_identity);
  const operationalReasons = stringArrayOrNull(operational?.reason_codes);
  const evidenceGaps = stringArrayOrNull(quality?.evidence_gaps);
  const integerKeys = [
    "scheduled_attempts",
    "attributed_receipts",
    "missing_receipts",
    "orphan_receipts",
    "duplicate_receipts",
    "active_cycles",
    "completed_cycles",
    "rejected_cycles",
    "failed_cycles",
    "consecutive_failures",
    "admitted_current_data_cycles",
    "provider_attempted_cycles",
    "reserved_provider_credits",
    "provider_successes",
    "provider_errors",
    "stale_inputs",
    "raw_candidates",
    "ranked_candidates",
    "selected_candidates",
    "built_recommendations",
    "published_recommendations",
    "no_trade_cycles",
  ] as const;
  const countsValid = Boolean(
    counts && integerKeys.every((key) => nonNegativeInteger(counts[key]) !== null),
  );
  const evaluatedAt = canonicalIso(series?.evaluated_at);
  const identityIsValid = Boolean(
    buildIdentity &&
      buildIdentity.schema_version === "scheduled_scan_deployment_identity_v1" &&
      buildIdentity.deploy_context === "production" &&
      /^[0-9a-f]{24}$/.test(String(buildIdentity.deploy_id ?? "")) &&
      /^[0-9a-f]{40}$/.test(String(buildIdentity.commit_ref ?? "")) &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        String(buildIdentity.site_id ?? ""),
      ),
  );
  const classification = String(operational?.classification ?? "");
  const terminalReason = String(operational?.terminal_reason ?? "");
  const lineageStatus = String(operational?.lineage_status ?? "");
  const passIsConsistent =
    classification !== "pass" ||
    (lineageStatus === "attributed" &&
      terminalReason !== "not_terminal" &&
      terminalReason !== "evidence_invalid" &&
      counts?.missing_receipts === 0 &&
      counts?.orphan_receipts === 0 &&
      counts?.duplicate_receipts === 0 &&
      counts?.active_cycles === 0);
  const qualityCountsAreConsistent =
    quality?.published_recommendations === counts?.published_recommendations &&
    typeof quality?.completed_evaluation_cycles === "number" &&
    typeof counts?.completed_cycles === "number" &&
    quality.completed_evaluation_cycles <= counts.completed_cycles;

  if (
    !series ||
    !seriesEnvelopeIsValid(series) ||
    !operational ||
    !counts ||
    !quality ||
    !evaluatedAt ||
    !identityIsValid ||
    !operationalReasons ||
    !evidenceGaps ||
    !countsValid ||
    !["pass", "in_progress", "fail", "inconclusive"].includes(classification) ||
    ![
      "not_terminal",
      "publication_observed",
      "failure_stop_reached",
      "attempt_cap_reached",
      "credit_cap_reached",
      "expired",
      "evidence_invalid",
    ].includes(terminalReason) ||
    !["attributed", "invalid"].includes(lineageStatus) ||
    !["not_evaluated", "insufficient_forward_evidence"].includes(
      String(quality.classification),
    ) ||
    nonNegativeInteger(quality.completed_evaluation_cycles) === null ||
    nonNegativeInteger(quality.published_recommendations) === null ||
    !passIsConsistent ||
    !qualityCountsAreConsistent ||
    !authorityIsInert(series.authority)
  ) {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_evidence_readback_invalid",
    );
  }

  return value as ObservationSeriesEvidenceReadback;
}
