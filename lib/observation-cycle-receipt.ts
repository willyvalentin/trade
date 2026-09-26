import type { ActiveScanTrace } from "@/lib/active-scan-trace";
import type { ScanLogEntry } from "@/lib/scan-logs";
import type { ScheduledScanInvocationReceipt } from "@/lib/scheduled-scan-invocation-receipt";

export const OBSERVATION_CYCLE_RECEIPT_VERSION =
  "observation_cycle_receipt_v1" as const;
export const OBSERVATION_CYCLE_READBACK_VERSION =
  "observation_cycle_readback_v1" as const;
export const SCHEDULED_SCAN_OBSERVATION_POLICY_VERSION =
  "scheduled_scan_observation_cycle_v1" as const;

export type ObservationCycleStatus =
  | "active"
  | "completed"
  | "rejected"
  | "failed";

export type ObservationCycleDisposition =
  | "pending"
  | "no_request"
  | "rejected_data"
  | "evaluated"
  | "published"
  | "no_trade"
  | "failed";

export type ObservationCycleReceipt = Readonly<{
  receipt_version: typeof OBSERVATION_CYCLE_RECEIPT_VERSION;
  cycle_fingerprint: string;
  owner_user_id: string;
  source_attempt_fingerprint: string;
  cycle_status: ObservationCycleStatus;
  disposition: ObservationCycleDisposition;
  observation_policy_version: typeof SCHEDULED_SCAN_OBSERVATION_POLICY_VERSION;
  receipt_generated_at: string;
  finalized_at: string | null;
  scan_run_fingerprint: string | null;
  trigger: Readonly<{
    status: "received";
    kind: "netlify_schedule" | "automation_route" | "manual_diagnostic";
    occurred_at: string;
    route_received_at: string;
    scheduled_slot_started_at_utc: string | null;
    build_deployment_identity: Readonly<Record<string, unknown>> | null;
  }>;
  admission: Readonly<{
    status: "admitted" | "rejected" | "unknown";
    policy_version: string | null;
    market_status: string | null;
    market_session: string | null;
    reason_codes: readonly string[];
  }>;
  provider_request: Readonly<{
    status: "attempted" | "not_attempted" | "unknown";
    attempted_tickers: number;
    reserved_credits: number;
    provider_credit_policy_version: string | null;
  }>;
  provider_response: Readonly<{
    status: "observed" | "partial" | "failed" | "not_observed" | "unknown";
    success_count: number;
    error_count: number;
    empty_response_count: number;
    latest_error_type: string | null;
  }>;
  freshness: Readonly<{
    status: "fresh" | "degraded" | "stale" | "not_evaluated" | "unknown";
    stale_count: number;
    reason_codes: readonly string[];
  }>;
  discovery_evaluation: Readonly<{
    status: "completed" | "not_attempted" | "rejected" | "failed" | "unknown";
    raw_candidate_count: number;
    ranked_count: number;
    selected_count: number;
    built_count: number;
  }>;
  publication: Readonly<{
    status: "published" | "no_trade" | "not_attempted" | "rejected" | "failed" | "unknown";
    published_count: number;
    recommendations_created: number;
    policy_version: string | null;
    reason_codes: readonly string[];
  }>;
  decision: Readonly<{
    outcome: string;
    reason_codes: readonly string[];
  }>;
  authority: Readonly<{
    can_arm_scheduler: false;
    can_call_provider: false;
    can_change_ranking: false;
    can_publish: false;
    can_execute_paper: false;
    can_execute_broker: false;
  }>;
}>;

export type ObservationCycleReadback = Readonly<{
  readback_version: typeof OBSERVATION_CYCLE_READBACK_VERSION;
  status: "available" | "partial" | "unavailable";
  receipts: readonly ObservationCycleReceipt[];
  invalid_row_count: number;
  reason_codes: readonly string[];
}>;

export type ObservationCycleReceiptPersistenceRecord = Readonly<{
  receipt_version: typeof OBSERVATION_CYCLE_RECEIPT_VERSION;
  cycle_fingerprint: string;
  owner_user_id: string;
  source_attempt_fingerprint: string;
  trigger_kind: ObservationCycleReceipt["trigger"]["kind"];
  cycle_status: ObservationCycleStatus;
  disposition: ObservationCycleDisposition;
  observation_policy_version: typeof SCHEDULED_SCAN_OBSERVATION_POLICY_VERSION;
  scheduled_slot_at: string | null;
  triggered_at: string;
  route_received_at: string;
  finalized_at: string | null;
  scan_run_fingerprint: string | null;
  receipt_json: ObservationCycleReceipt;
  updated_at: string;
}>;

type BuildObservationCycleReceiptInput = Readonly<{
  ownerUserId: string;
  attemptFingerprint: string;
  source: string | null;
  mode: "scheduled" | "manual" | "diagnostic";
  outcome:
    | "scheduled_function_fired"
    | "route_received"
    | "skipped"
    | "failed"
    | "scanned"
    | "request_failed";
  allowed: boolean | null;
  routeReceivedAtUtc: string;
  scheduledFunctionFiredAtUtc: string | null;
  orchestrationDecision: string | null;
  skipReason: string | null;
  scanLog: ScanLogEntry | null;
  activeScanTrace: ActiveScanTrace | null;
  scanRunFingerprint: string | null;
  scheduledInvocationReceipt: ScheduledScanInvocationReceipt | null;
}>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const cycleFingerprintPattern = /^[a-z0-9_:.\-]{12,240}$/;
const quarterHourMilliseconds = 15 * 60 * 1000;

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

function isoOrNull(value: unknown) {
  const text = textOrNull(value);
  if (!text) return null;
  const milliseconds = Date.parse(text);
  if (!Number.isFinite(milliseconds)) return null;
  return new Date(milliseconds).toISOString();
}

function canonicalQuarterHourOrNull(value: unknown) {
  const timestamp = isoOrNull(value);
  if (!timestamp) return null;
  return Date.parse(timestamp) % quarterHourMilliseconds === 0 ? timestamp : null;
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function enumOrNull<T extends string>(value: unknown, options: readonly T[]) {
  return typeof value === "string" && options.includes(value as T)
    ? (value as T)
    : null;
}

function stringArrayOrNull(value: unknown) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return null;
  }
  return value.map((item) => item.trim()).filter((item) => item.length > 0);
}

function uniqueReasonCodes(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function isTerminalOutcome(outcome: BuildObservationCycleReceiptInput["outcome"]) {
  return outcome !== "route_received" && outcome !== "scheduled_function_fired";
}

function triggerKind(input: BuildObservationCycleReceiptInput) {
  if (input.source === "netlify_scheduled_function" && input.mode === "scheduled") {
    return "netlify_schedule" as const;
  }
  if (input.mode === "diagnostic" || input.mode === "manual") {
    return "manual_diagnostic" as const;
  }
  return "automation_route" as const;
}

function terminalTimestamp(input: BuildObservationCycleReceiptInput) {
  if (!isTerminalOutcome(input.outcome)) return null;
  const routeReceivedAt = isoOrNull(input.routeReceivedAtUtc);
  const candidates = [
    isoOrNull(input.scanLog?.created_at),
    isoOrNull(input.activeScanTrace?.generated_at),
    new Date().toISOString(),
  ].filter(
    (candidate): candidate is string =>
      candidate !== null &&
      routeReceivedAt !== null &&
      Date.parse(candidate) >= Date.parse(routeReceivedAt),
  );
  return candidates.sort((first, second) =>
    second.localeCompare(first),
  )[0] ?? null;
}

function classifyReceipt(input: BuildObservationCycleReceiptInput) {
  const trace = input.activeScanTrace;
  const terminal = isTerminalOutcome(input.outcome);
  const requestAttempted =
    (trace?.market_data_fetch.attempted_tickers ?? 0) > 0 ||
    (trace?.market_data_fetch.provider_calls_reserved_count ?? 0) > 0;
  const successCount =
    (trace?.market_data_fetch.quote_success_count ?? 0) +
    (trace?.market_data_fetch.candle_success_count ?? 0);
  const errorCount =
    (trace?.market_data_fetch.quote_error_count ?? 0) +
    (trace?.market_data_fetch.candle_error_count ?? 0);
  const emptyResponseCount = trace?.market_data_fetch.empty_response_count ?? 0;
  const staleCount = trace?.market_data_fetch.stale_count ?? 0;
  const publishedCount =
    trace?.final.recommendations_published_count ??
    input.scanLog?.recommendations_published_count ??
    input.scanLog?.recommendations_created ??
    0;
  const recommendationsCreated =
    trace?.final.recommendations_created ??
    input.scanLog?.recommendations_created ??
    0;
  const rankingAttempted = trace?.ranking.ranking_attempted === true;
  const admissionStatus =
    input.allowed === true
      ? ("admitted" as const)
      : input.allowed === false
        ? ("rejected" as const)
        : ("unknown" as const);
  const providerRequestStatus = requestAttempted
    ? ("attempted" as const)
    : terminal
      ? ("not_attempted" as const)
      : ("unknown" as const);
  const providerResponseStatus =
    successCount > 0 && errorCount + emptyResponseCount > 0
      ? ("partial" as const)
      : successCount > 0
        ? ("observed" as const)
        : requestAttempted && terminal
          ? ("failed" as const)
          : terminal
            ? ("not_observed" as const)
            : ("unknown" as const);
  const freshnessStatus =
    staleCount > 0
      ? ("stale" as const)
      : providerResponseStatus === "partial"
        ? ("degraded" as const)
        : providerResponseStatus === "observed"
          ? ("fresh" as const)
          : providerRequestStatus === "not_attempted"
            ? ("not_evaluated" as const)
            : ("unknown" as const);
  const discoveryStatus = rankingAttempted
    ? ("completed" as const)
    : admissionStatus === "rejected"
      ? ("not_attempted" as const)
      : providerResponseStatus === "failed"
        ? ("failed" as const)
        : terminal
          ? ("rejected" as const)
          : ("unknown" as const);
  const publicationStatus =
    publishedCount > 0
      ? ("published" as const)
      : input.outcome === "failed" || input.outcome === "request_failed"
        ? ("failed" as const)
        : rankingAttempted && terminal
          ? ("no_trade" as const)
          : freshnessStatus === "stale"
            ? ("rejected" as const)
            : terminal
              ? ("not_attempted" as const)
              : ("unknown" as const);
  const disposition: ObservationCycleDisposition = !terminal
    ? "pending"
    : input.outcome === "failed" || input.outcome === "request_failed"
      ? "failed"
      : publishedCount > 0
        ? "published"
        : rankingAttempted
          ? "no_trade"
          : requestAttempted
            ? "rejected_data"
            : "no_request";
  const cycleStatus: ObservationCycleStatus = !terminal
    ? "active"
    : disposition === "failed"
      ? "failed"
      : disposition === "no_request" || disposition === "rejected_data"
        ? "rejected"
        : "completed";

  return {
    trace,
    terminal,
    requestAttempted,
    successCount,
    errorCount,
    emptyResponseCount,
    staleCount,
    publishedCount,
    recommendationsCreated,
    admissionStatus,
    providerRequestStatus,
    providerResponseStatus,
    freshnessStatus,
    discoveryStatus,
    publicationStatus,
    disposition,
    cycleStatus,
  };
}

export function buildObservationCycleReceipt(
  input: BuildObservationCycleReceiptInput,
): ObservationCycleReceiptPersistenceRecord | null {
  const ownerUserId = textOrNull(input.ownerUserId)?.toLowerCase() ?? null;
  const attemptFingerprint = textOrNull(input.attemptFingerprint)?.toLowerCase() ?? null;
  const routeReceivedAt = isoOrNull(input.routeReceivedAtUtc);
  const triggeredAt =
    isoOrNull(input.scheduledFunctionFiredAtUtc) ?? routeReceivedAt;
  if (
    !ownerUserId ||
    !uuidPattern.test(ownerUserId) ||
    !attemptFingerprint ||
    !cycleFingerprintPattern.test(attemptFingerprint) ||
    !routeReceivedAt ||
    !triggeredAt ||
    Date.parse(triggeredAt) > Date.parse(routeReceivedAt)
  ) {
    return null;
  }

  const classification = classifyReceipt(input);
  const finalizedAt = terminalTimestamp(input);
  if (classification.terminal && !finalizedAt) return null;
  const scheduledSlot = input.scheduledInvocationReceipt
    ?.scheduled_slot_started_at_utc ?? null;
  const receiptGeneratedAt = finalizedAt ?? routeReceivedAt;
  const admissionReasons = uniqueReasonCodes([
    classification.trace?.scheduled_gate_block_reason,
    classification.trace?.generation_block_reason,
    input.allowed === false ? input.skipReason : null,
  ]);
  const freshnessReasons = uniqueReasonCodes([
    classification.staleCount > 0 ? "provider_data_stale" : null,
    classification.providerResponseStatus === "partial"
      ? "provider_response_partial"
      : null,
    classification.providerResponseStatus === "failed"
      ? "provider_response_unavailable"
      : null,
  ]);
  const publicationReasons = uniqueReasonCodes([
    input.skipReason,
    classification.trace?.final.no_publish_reason,
    classification.trace?.final.ranked_candidates_not_published_reason,
    classification.trace?.final.zero_candidate_reason,
  ]);
  const decisionReasons = uniqueReasonCodes([
    ...admissionReasons,
    ...freshnessReasons,
    ...publicationReasons,
    classification.trace?.market_data_fetch.latest_provider_error_type,
  ]);
  const kind = triggerKind(input);

  const receipt: ObservationCycleReceipt = Object.freeze({
    receipt_version: OBSERVATION_CYCLE_RECEIPT_VERSION,
    cycle_fingerprint: attemptFingerprint,
    owner_user_id: ownerUserId,
    source_attempt_fingerprint: attemptFingerprint,
    cycle_status: classification.cycleStatus,
    disposition: classification.disposition,
    observation_policy_version: SCHEDULED_SCAN_OBSERVATION_POLICY_VERSION,
    receipt_generated_at: receiptGeneratedAt,
    finalized_at: finalizedAt,
    scan_run_fingerprint:
      textOrNull(input.scanRunFingerprint) ??
      textOrNull(classification.trace?.final.scan_run_fingerprint),
    trigger: Object.freeze({
      status: "received",
      kind,
      occurred_at: triggeredAt,
      route_received_at: routeReceivedAt,
      scheduled_slot_started_at_utc: scheduledSlot,
      build_deployment_identity:
        input.scheduledInvocationReceipt?.build_deployment_identity ?? null,
    }),
    admission: Object.freeze({
      status: classification.admissionStatus,
      policy_version:
        textOrNull(classification.trace?.scheduled_gate_policy_version) ??
        textOrNull(input.orchestrationDecision),
      market_status: textOrNull(classification.trace?.market_status),
      market_session: textOrNull(classification.trace?.market_session),
      reason_codes: Object.freeze(admissionReasons),
    }),
    provider_request: Object.freeze({
      status: classification.providerRequestStatus,
      attempted_tickers:
        classification.trace?.market_data_fetch.attempted_tickers ?? 0,
      reserved_credits:
        classification.trace?.market_data_fetch.provider_calls_reserved_count ?? 0,
      provider_credit_policy_version:
        textOrNull(
          classification.trace?.market_data_fetch.provider_credit_policy_version,
        ),
    }),
    provider_response: Object.freeze({
      status: classification.providerResponseStatus,
      success_count: classification.successCount,
      error_count: classification.errorCount,
      empty_response_count: classification.emptyResponseCount,
      latest_error_type: textOrNull(
        classification.trace?.market_data_fetch.latest_provider_error_type,
      ),
    }),
    freshness: Object.freeze({
      status: classification.freshnessStatus,
      stale_count: classification.staleCount,
      reason_codes: Object.freeze(freshnessReasons),
    }),
    discovery_evaluation: Object.freeze({
      status: classification.discoveryStatus,
      raw_candidate_count:
        classification.trace?.raw_candidates.raw_candidate_count ??
        input.scanLog?.candidates_scanned ??
        0,
      ranked_count:
        classification.trace?.ranking.ranked_count ??
        input.scanLog?.ranked_candidates_count ??
        0,
      selected_count: classification.trace?.ranking.selected_count ?? 0,
      built_count:
        classification.trace?.final.recommendations_built_count ??
        input.scanLog?.recommendations_built_count ??
        0,
    }),
    publication: Object.freeze({
      status: classification.publicationStatus,
      published_count: classification.publishedCount,
      recommendations_created: classification.recommendationsCreated,
      policy_version:
        textOrNull(classification.trace?.final.publish_policy_version) ??
        textOrNull(input.scanLog?.recommendation_publish_policy_version),
      reason_codes: Object.freeze(publicationReasons),
    }),
    decision: Object.freeze({
      outcome: input.outcome,
      reason_codes: Object.freeze(decisionReasons),
    }),
    authority: Object.freeze({
      can_arm_scheduler: false,
      can_call_provider: false,
      can_change_ranking: false,
      can_publish: false,
      can_execute_paper: false,
      can_execute_broker: false,
    }),
  });

  return Object.freeze({
    receipt_version: receipt.receipt_version,
    cycle_fingerprint: receipt.cycle_fingerprint,
    owner_user_id: receipt.owner_user_id,
    source_attempt_fingerprint: receipt.source_attempt_fingerprint,
    trigger_kind: receipt.trigger.kind,
    cycle_status: receipt.cycle_status,
    disposition: receipt.disposition,
    observation_policy_version: receipt.observation_policy_version,
    scheduled_slot_at: receipt.trigger.scheduled_slot_started_at_utc,
    triggered_at: receipt.trigger.occurred_at,
    route_received_at: receipt.trigger.route_received_at,
    finalized_at: receipt.finalized_at,
    scan_run_fingerprint: receipt.scan_run_fingerprint,
    receipt_json: receipt,
    updated_at: receipt.receipt_generated_at,
  });
}

function authorityIsInert(value: unknown) {
  const authority = objectOrNull(value);
  return Boolean(
    authority &&
      authority.can_arm_scheduler === false &&
      authority.can_call_provider === false &&
      authority.can_change_ranking === false &&
      authority.can_publish === false &&
      authority.can_execute_paper === false &&
      authority.can_execute_broker === false,
  );
}

export function observationCycleReceiptFromUnknown(
  value: unknown,
): ObservationCycleReceipt | null {
  const receipt = objectOrNull(value);
  const trigger = objectOrNull(receipt?.trigger);
  const admission = objectOrNull(receipt?.admission);
  const providerRequest = objectOrNull(receipt?.provider_request);
  const providerResponse = objectOrNull(receipt?.provider_response);
  const freshness = objectOrNull(receipt?.freshness);
  const discovery = objectOrNull(receipt?.discovery_evaluation);
  const publication = objectOrNull(receipt?.publication);
  const decision = objectOrNull(receipt?.decision);
  const cycleStatus = enumOrNull(receipt?.cycle_status, [
    "active",
    "completed",
    "rejected",
    "failed",
  ] as const);
  const disposition = enumOrNull(receipt?.disposition, [
    "pending",
    "no_request",
    "rejected_data",
    "evaluated",
    "published",
    "no_trade",
    "failed",
  ] as const);
  const triggerKindValue = enumOrNull(trigger?.kind, [
    "netlify_schedule",
    "automation_route",
    "manual_diagnostic",
  ] as const);
  const admissionStatus = enumOrNull(admission?.status, [
    "admitted",
    "rejected",
    "unknown",
  ] as const);
  const providerRequestStatus = enumOrNull(providerRequest?.status, [
    "attempted",
    "not_attempted",
    "unknown",
  ] as const);
  const providerResponseStatus = enumOrNull(providerResponse?.status, [
    "observed",
    "partial",
    "failed",
    "not_observed",
    "unknown",
  ] as const);
  const freshnessStatus = enumOrNull(freshness?.status, [
    "fresh",
    "degraded",
    "stale",
    "not_evaluated",
    "unknown",
  ] as const);
  const discoveryStatus = enumOrNull(discovery?.status, [
    "completed",
    "not_attempted",
    "rejected",
    "failed",
    "unknown",
  ] as const);
  const publicationStatus = enumOrNull(publication?.status, [
    "published",
    "no_trade",
    "not_attempted",
    "rejected",
    "failed",
    "unknown",
  ] as const);
  const cycleFingerprint = textOrNull(receipt?.cycle_fingerprint)?.toLowerCase();
  const ownerUserId = textOrNull(receipt?.owner_user_id)?.toLowerCase();
  const sourceAttemptFingerprint = textOrNull(
    receipt?.source_attempt_fingerprint,
  )?.toLowerCase();
  const generatedAt = isoOrNull(receipt?.receipt_generated_at);
  const finalizedAt =
    receipt?.finalized_at === null ? null : isoOrNull(receipt?.finalized_at);
  const triggeredAt = isoOrNull(trigger?.occurred_at);
  const routeReceivedAt = isoOrNull(trigger?.route_received_at);
  const scheduledSlot =
    trigger?.scheduled_slot_started_at_utc === null
      ? null
      : canonicalQuarterHourOrNull(trigger?.scheduled_slot_started_at_utc);
  const admissionReasons = stringArrayOrNull(admission?.reason_codes);
  const freshnessReasons = stringArrayOrNull(freshness?.reason_codes);
  const publicationReasons = stringArrayOrNull(publication?.reason_codes);
  const decisionReasons = stringArrayOrNull(decision?.reason_codes);
  const decisionOutcome = textOrNull(decision?.outcome);

  if (
    receipt?.receipt_version !== OBSERVATION_CYCLE_RECEIPT_VERSION ||
    receipt.observation_policy_version !==
      SCHEDULED_SCAN_OBSERVATION_POLICY_VERSION ||
    !cycleStatus ||
    !disposition ||
    !trigger ||
    trigger.status !== "received" ||
    !triggerKindValue ||
    !admissionStatus ||
    !providerRequestStatus ||
    !providerResponseStatus ||
    !freshnessStatus ||
    !discoveryStatus ||
    !publicationStatus ||
    !cycleFingerprint ||
    !sourceAttemptFingerprint ||
    !ownerUserId ||
    !cycleFingerprintPattern.test(cycleFingerprint) ||
    !cycleFingerprintPattern.test(sourceAttemptFingerprint) ||
    !uuidPattern.test(ownerUserId) ||
    !generatedAt ||
    !triggeredAt ||
    !routeReceivedAt ||
    Date.parse(triggeredAt) > Date.parse(routeReceivedAt) ||
    (cycleStatus === "active" ? finalizedAt !== null : finalizedAt === null) ||
    (finalizedAt !== null && Date.parse(routeReceivedAt) > Date.parse(finalizedAt)) ||
    (trigger?.scheduled_slot_started_at_utc !== null && !scheduledSlot) ||
    !admissionReasons ||
    !freshnessReasons ||
    !publicationReasons ||
    !decisionReasons ||
    !decisionOutcome ||
    !authorityIsInert(receipt.authority)
  ) {
    return null;
  }

  const attemptedTickers = nonNegativeInteger(providerRequest?.attempted_tickers);
  const reservedCredits = nonNegativeInteger(providerRequest?.reserved_credits);
  const successCount = nonNegativeInteger(providerResponse?.success_count);
  const errorCount = nonNegativeInteger(providerResponse?.error_count);
  const emptyResponseCount = nonNegativeInteger(
    providerResponse?.empty_response_count,
  );
  const staleCount = nonNegativeInteger(freshness?.stale_count);
  const rawCandidateCount = nonNegativeInteger(discovery?.raw_candidate_count);
  const rankedCount = nonNegativeInteger(discovery?.ranked_count);
  const selectedCount = nonNegativeInteger(discovery?.selected_count);
  const builtCount = nonNegativeInteger(discovery?.built_count);
  const publishedCount = nonNegativeInteger(publication?.published_count);
  const recommendationsCreated = nonNegativeInteger(
    publication?.recommendations_created,
  );

  if (
    attemptedTickers === null ||
    reservedCredits === null ||
    successCount === null ||
    errorCount === null ||
    emptyResponseCount === null ||
    staleCount === null ||
    rawCandidateCount === null ||
    rankedCount === null ||
    selectedCount === null ||
    builtCount === null ||
    publishedCount === null ||
    recommendationsCreated === null ||
    (disposition === "published" &&
      (publicationStatus !== "published" || publishedCount === 0)) ||
    (disposition === "no_trade" &&
      (publicationStatus !== "no_trade" || publishedCount !== 0)) ||
    (disposition === "no_request" && providerRequestStatus !== "not_attempted") ||
    (cycleStatus === "active" && disposition !== "pending")
  ) {
    return null;
  }

  return Object.freeze({
    receipt_version: OBSERVATION_CYCLE_RECEIPT_VERSION,
    cycle_fingerprint: cycleFingerprint,
    owner_user_id: ownerUserId,
    source_attempt_fingerprint: sourceAttemptFingerprint,
    cycle_status: cycleStatus,
    disposition,
    observation_policy_version: SCHEDULED_SCAN_OBSERVATION_POLICY_VERSION,
    receipt_generated_at: generatedAt,
    finalized_at: finalizedAt,
    scan_run_fingerprint: textOrNull(receipt.scan_run_fingerprint),
    trigger: Object.freeze({
      status: "received",
      kind: triggerKindValue,
      occurred_at: triggeredAt,
      route_received_at: routeReceivedAt,
      scheduled_slot_started_at_utc: scheduledSlot,
      build_deployment_identity:
        objectOrNull(trigger.build_deployment_identity) ?? null,
    }),
    admission: Object.freeze({
      status: admissionStatus,
      policy_version: textOrNull(admission?.policy_version),
      market_status: textOrNull(admission?.market_status),
      market_session: textOrNull(admission?.market_session),
      reason_codes: Object.freeze(admissionReasons),
    }),
    provider_request: Object.freeze({
      status: providerRequestStatus,
      attempted_tickers: attemptedTickers,
      reserved_credits: reservedCredits,
      provider_credit_policy_version: textOrNull(
        providerRequest?.provider_credit_policy_version,
      ),
    }),
    provider_response: Object.freeze({
      status: providerResponseStatus,
      success_count: successCount,
      error_count: errorCount,
      empty_response_count: emptyResponseCount,
      latest_error_type: textOrNull(providerResponse?.latest_error_type),
    }),
    freshness: Object.freeze({
      status: freshnessStatus,
      stale_count: staleCount,
      reason_codes: Object.freeze(freshnessReasons),
    }),
    discovery_evaluation: Object.freeze({
      status: discoveryStatus,
      raw_candidate_count: rawCandidateCount,
      ranked_count: rankedCount,
      selected_count: selectedCount,
      built_count: builtCount,
    }),
    publication: Object.freeze({
      status: publicationStatus,
      published_count: publishedCount,
      recommendations_created: recommendationsCreated,
      policy_version: textOrNull(publication?.policy_version),
      reason_codes: Object.freeze(publicationReasons),
    }),
    decision: Object.freeze({
      outcome: decisionOutcome,
      reason_codes: Object.freeze(decisionReasons),
    }),
    authority: Object.freeze({
      can_arm_scheduler: false,
      can_call_provider: false,
      can_change_ranking: false,
      can_publish: false,
      can_execute_paper: false,
      can_execute_broker: false,
    }),
  });
}

function receiptFromPersistenceRow(value: unknown) {
  const row = objectOrNull(value);
  const receipt = observationCycleReceiptFromUnknown(row?.receipt_json);
  if (
    !row ||
    !receipt ||
    row.receipt_version !== receipt.receipt_version ||
    row.cycle_fingerprint !== receipt.cycle_fingerprint ||
    row.owner_user_id !== receipt.owner_user_id ||
    row.source_attempt_fingerprint !== receipt.source_attempt_fingerprint ||
    row.trigger_kind !== receipt.trigger.kind ||
    row.cycle_status !== receipt.cycle_status ||
    row.disposition !== receipt.disposition ||
    row.observation_policy_version !== receipt.observation_policy_version ||
    isoOrNull(row.triggered_at) !== receipt.trigger.occurred_at ||
    isoOrNull(row.route_received_at) !== receipt.trigger.route_received_at ||
    (row.finalized_at === null ? null : isoOrNull(row.finalized_at)) !==
      receipt.finalized_at ||
    (row.scheduled_slot_at === null
      ? null
      : canonicalQuarterHourOrNull(row.scheduled_slot_at)) !==
      receipt.trigger.scheduled_slot_started_at_utc
  ) {
    return null;
  }
  return receipt;
}

export function buildObservationCycleReadback(
  rows: readonly unknown[],
): ObservationCycleReadback {
  const receipts = rows
    .map(receiptFromPersistenceRow)
    .filter((receipt): receipt is ObservationCycleReceipt => receipt !== null)
    .sort((first, second) =>
      second.receipt_generated_at.localeCompare(first.receipt_generated_at),
    );
  const invalidRowCount = rows.length - receipts.length;
  return Object.freeze({
    readback_version: OBSERVATION_CYCLE_READBACK_VERSION,
    status: invalidRowCount === 0 ? "available" : "partial",
    receipts: Object.freeze(receipts),
    invalid_row_count: invalidRowCount,
    reason_codes: Object.freeze(
      invalidRowCount === 0 ? [] : ["observation_cycle_receipt_invalid"],
    ),
  });
}

export function observationCycleReadbackFromUnknown(
  value: unknown,
): ObservationCycleReadback {
  const readback = objectOrNull(value);
  const status = enumOrNull(readback?.status, [
    "available",
    "partial",
    "unavailable",
  ] as const);
  const rows = Array.isArray(readback?.receipts) ? readback.receipts : null;
  const invalidRowCount = nonNegativeInteger(readback?.invalid_row_count);
  const reasonCodes = stringArrayOrNull(readback?.reason_codes);
  if (
    readback?.readback_version !== OBSERVATION_CYCLE_READBACK_VERSION ||
    !status ||
    !rows ||
    invalidRowCount === null ||
    !reasonCodes
  ) {
    return Object.freeze({
      readback_version: OBSERVATION_CYCLE_READBACK_VERSION,
      status: "unavailable",
      receipts: Object.freeze([]),
      invalid_row_count: 0,
      reason_codes: Object.freeze(["observation_cycle_readback_invalid"]),
    });
  }

  const receipts = rows
    .map(observationCycleReceiptFromUnknown)
    .filter((receipt): receipt is ObservationCycleReceipt => receipt !== null);
  if (receipts.length !== rows.length) {
    return Object.freeze({
      readback_version: OBSERVATION_CYCLE_READBACK_VERSION,
      status: "unavailable",
      receipts: Object.freeze([]),
      invalid_row_count: invalidRowCount + (rows.length - receipts.length),
      reason_codes: Object.freeze(["observation_cycle_readback_invalid"]),
    });
  }

  return Object.freeze({
    readback_version: OBSERVATION_CYCLE_READBACK_VERSION,
    status,
    receipts: Object.freeze(receipts),
    invalid_row_count: invalidRowCount,
    reason_codes: Object.freeze(reasonCodes),
  });
}
