import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { ScheduledScanProviderCreditBudget } from "@/lib/scheduled-scan-ticker-cap";
import { getNyMarketTime } from "@/lib/market-session";

export const OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION =
  "observation_cycle_admission_v2" as const;
export const LEGACY_OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION =
  "observation_cycle_admission_v1" as const;
export const OBSERVATION_CYCLE_MINIMUM_CADENCE_MINUTES = 15;
export const OBSERVATION_CYCLE_MAX_RETRY_BACKOFF_MINUTES = 60;
const observationCycleFingerprintPattern = /^[a-z0-9_:.\-]{12,240}$/;

export type ObservationCycleAdmissionPreconditionReason =
  | "market_session_not_provider_confirmed_open"
  | "scan_window_clock_mismatch"
  | "outside_regular_generation_segment"
  | "legacy_power_hour_gate_rejected";

export type ObservationCycleAdmissionReceipt = Readonly<{
  policy_version:
    | typeof OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION
    | typeof LEGACY_OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION;
  decision: "request_current_data" | "no_request" | "reject";
  request_current_data: boolean;
  evaluated_at: string;
  next_eligible_at: string | null;
  reason_codes: readonly string[];
  facts: Readonly<{
    session: Readonly<{
      status: "verified_open" | "rejected";
    }>;
    freshness: Readonly<{
      status: "fresh" | "degraded" | "stale" | "unavailable" | "unknown";
      latest_observed_at: string | null;
      age_minutes: number | null;
    }>;
    coverage: Readonly<{
      status: "complete" | "partial" | "empty" | "unknown";
      expected_candidate_count: number | null;
      observed_candidate_count: number | null;
    }>;
    candidate_state: Readonly<{
      status: "active" | "watch" | "no_trade" | "empty" | "unknown";
      visible_count: number;
      strong_count: number;
      needs_review_count: number;
      raw_candidate_count: number | null;
    }>;
    material_change: Readonly<{
      status: "observed" | "not_observed" | "unknown";
      basis: "candidate_decision_comparison" | "unavailable";
    }>;
    provider_budget: Readonly<{
      status: "bounded" | "unbounded" | "invalid";
      policy_version: string | null;
      plan_mode: string | null;
      max_known_credits_per_scan: number | null;
      atomic_reservation_required: true;
    }>;
    retry_backoff: Readonly<{
      consecutive_retryable_failures: number;
      delay_minutes: number;
      next_eligible_at: string | null;
      cadence_anchor_at: string | null;
      cadence_anchor_source:
        | "none"
        | "recommendation_scan_run"
        | "observation_cycle_receipt";
      includes_pre_run_failure: boolean;
    }>;
  }>;
  authority: Readonly<{
    calls_provider: false;
    reserves_provider_credits: false;
    changes_ranking: false;
    publishes_candidate: false;
    executes_broker_order: false;
  }>;
}>;

export type ObservationCyclePreRunFailure = Readonly<{
  cycle_fingerprint: string;
  finalized_at: string;
}>;

type BuildObservationCycleAdmissionInput = Readonly<{
  now: Date;
  sessionVerifiedOpen: boolean;
  preconditionReason?: ObservationCycleAdmissionPreconditionReason | null;
  recentScanRuns: readonly RecommendationScanRun[];
  recentPreRunFailures: readonly ObservationCyclePreRunFailure[] | null;
  providerBudget: ScheduledScanProviderCreditBudget | null;
}>;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function finiteNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function finiteInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function enumOrNull<T extends string>(value: unknown, options: readonly T[]) {
  return typeof value === "string" && options.includes(value as T)
    ? (value as T)
    : null;
}

function isoOrNull(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds)
    ? new Date(milliseconds).toISOString()
    : null;
}

function uniqueReasonCodes(values: readonly (string | null | undefined)[]) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function sameTradingDateRuns(
  runs: readonly RecommendationScanRun[],
  now: Date,
) {
  const nyDate = getNyMarketTime(now).ny_date;

  return runs
    .filter((run) => run.trading_date === nyDate)
    .filter((run) => isoOrNull(run.observed_at) !== null)
    .sort(
      (first, second) =>
        Date.parse(second.observed_at) - Date.parse(first.observed_at),
    );
}

function coverageFact(run: RecommendationScanRun | null) {
  const record = objectOrNull(run?.payload_json?.candidate_decision_record);
  const coverage = objectOrNull(record?.coverage);
  const expected = finiteNonNegativeInteger(coverage?.expected_candidate_count);
  const observed = finiteNonNegativeInteger(coverage?.observed_candidate_count);
  const fullMembership = coverage?.full_membership_captured === true;

  if (expected === null || observed === null || observed > expected) {
    return {
      status: "unknown" as const,
      expected_candidate_count: null,
      observed_candidate_count: null,
    };
  }
  if (expected === 0) {
    return {
      status: "empty" as const,
      expected_candidate_count: expected,
      observed_candidate_count: observed,
    };
  }
  return {
    status:
      fullMembership && observed === expected
        ? ("complete" as const)
        : ("partial" as const),
    expected_candidate_count: expected,
    observed_candidate_count: observed,
  };
}

function candidateStateFact(run: RecommendationScanRun | null) {
  const visibleCount = run?.counts?.visible_recommendation_count ?? 0;
  const strongCount = run?.counts?.strong_count ?? 0;
  const needsReviewCount = run?.counts?.needs_review_count ?? 0;
  const rawCandidateCount = run?.raw_candidate_count ?? null;
  const status =
    visibleCount > 0 || strongCount > 0
      ? ("active" as const)
      : needsReviewCount > 0 || (run?.counts?.valid_count ?? 0) > 0
        ? ("watch" as const)
        : run?.status === "empty" && (rawCandidateCount ?? 0) > 0
          ? ("no_trade" as const)
          : run?.status === "empty" && rawCandidateCount === 0
            ? ("empty" as const)
            : ("unknown" as const);

  return {
    status,
    visible_count: visibleCount,
    strong_count: strongCount,
    needs_review_count: needsReviewCount,
    raw_candidate_count: rawCandidateCount,
  };
}

function candidateDecisionSignature(run: RecommendationScanRun | null) {
  const record = objectOrNull(run?.payload_json?.candidate_decision_record);
  const finalDecision = objectOrNull(record?.final_decision);
  const candidates = Array.isArray(record?.candidates) ? record.candidates : null;
  if (!record || !finalDecision || !candidates) return null;

  const rows = candidates.flatMap((candidate) => {
    const row = objectOrNull(candidate);
    const ticker =
      typeof row?.ticker === "string" ? row.ticker.trim().toUpperCase() : "";
    const disposition =
      typeof row?.disposition === "string" ? row.disposition.trim() : "";
    const ranking = objectOrNull(row?.ranking);
    const rank = finiteNonNegativeInteger(ranking?.rank);
    const score =
      typeof ranking?.score === "number" && Number.isFinite(ranking.score)
        ? Math.round(ranking.score * 100) / 100
        : null;
    return ticker && disposition
      ? [`${ticker}:${disposition}:${rank ?? "none"}:${score ?? "none"}`]
      : [];
  });
  if (rows.length !== candidates.length) return null;

  const disposition =
    typeof finalDecision.disposition === "string"
      ? finalDecision.disposition.trim()
      : "";
  if (!disposition) return null;
  return `${disposition}|${rows.sort().join("|")}`;
}

function materialChangeFact(
  latest: RecommendationScanRun | null,
  previous: RecommendationScanRun | null,
) {
  const latestSignature = candidateDecisionSignature(latest);
  const previousSignature = candidateDecisionSignature(previous);
  if (!latestSignature || !previousSignature) {
    return { status: "unknown" as const, basis: "unavailable" as const };
  }
  return {
    status:
      latestSignature === previousSignature
        ? ("not_observed" as const)
        : ("observed" as const),
    basis: "candidate_decision_comparison" as const,
  };
}

function freshnessFact(run: RecommendationScanRun | null, now: Date) {
  const observedAt = isoOrNull(run?.observed_at);
  const ageMinutes = observedAt
    ? Math.floor((now.getTime() - Date.parse(observedAt)) / 60_000)
    : null;
  const providerUnavailable =
    run?.provider_statuses?.some(
      (status) => status.status === "unavailable" || status.status === "unknown",
    ) ?? false;
  const providerPartial =
    run?.provider_statuses?.some((status) => status.status === "partial") ?? false;
  const status =
    !run || ageMinutes === null || ageMinutes < 0
      ? ("unknown" as const)
      : run.status === "failed" || providerUnavailable
        ? ("unavailable" as const)
        : run.status === "stale" || (run.stale_candidate_count ?? 0) > 0
          ? ("stale" as const)
          : run.status === "partial" ||
              run.status === "degraded" ||
              providerPartial ||
              (run.incomplete_data_candidate_count ?? 0) > 0
            ? ("degraded" as const)
            : run.status === "completed" || run.status === "empty"
              ? ("fresh" as const)
              : ("unknown" as const);
  return {
    status,
    latest_observed_at: observedAt,
    age_minutes: ageMinutes,
  };
}

function providerBudgetFact(budget: ScheduledScanProviderCreditBudget | null) {
  const maximum = budget?.max_known_credits_per_scan ?? null;
  const bounded =
    budget?.enforced === true &&
    maximum !== null &&
    Number.isInteger(maximum) &&
    maximum > 0;
  const status = bounded
    ? ("bounded" as const)
    : budget === null || budget.max_known_credits_per_scan === null
      ? ("unbounded" as const)
      : ("invalid" as const);
  return {
    status,
    policy_version: budget?.policy_version ?? null,
    plan_mode: budget?.plan_mode ?? null,
    max_known_credits_per_scan: maximum,
    atomic_reservation_required: true as const,
  };
}

function retryableFailure(run: RecommendationScanRun) {
  return (
    run.status === "failed" ||
    run.status === "partial" ||
    run.status === "degraded" ||
    run.status === "stale" ||
    run.status === "unknown"
  );
}

type RetryHistoryEvent = Readonly<{
  occurred_at: string;
  retryable_failure: boolean;
  source: "recommendation_scan_run" | "observation_cycle_receipt";
  fingerprint: string;
}>;

function sameTradingDatePreRunFailures(
  failures: readonly ObservationCyclePreRunFailure[],
  now: Date,
) {
  const nyDate = getNyMarketTime(now).ny_date;
  const seen = new Map<string, string>();
  const valid: ObservationCyclePreRunFailure[] = [];
  let invalid = false;

  for (const failure of failures) {
    const fingerprint = textOrNull(failure.cycle_fingerprint);
    const finalizedAt = isoOrNull(failure.finalized_at);
    if (
      !fingerprint ||
      !observationCycleFingerprintPattern.test(fingerprint) ||
      !finalizedAt ||
      Date.parse(finalizedAt) > now.getTime()
    ) {
      invalid = true;
      continue;
    }
    if (getNyMarketTime(new Date(finalizedAt)).ny_date !== nyDate) continue;
    const previousTimestamp = seen.get(fingerprint);
    if (previousTimestamp && previousTimestamp !== finalizedAt) {
      invalid = true;
      continue;
    }
    if (previousTimestamp) continue;
    seen.set(fingerprint, finalizedAt);
    valid.push({ cycle_fingerprint: fingerprint, finalized_at: finalizedAt });
  }

  return { valid, invalid };
}

function retryHistoryEvents({
  runs,
  preRunFailures,
}: {
  runs: readonly RecommendationScanRun[];
  preRunFailures: readonly ObservationCyclePreRunFailure[];
}) {
  return [
    ...runs.map(
      (run): RetryHistoryEvent => ({
        occurred_at: new Date(run.observed_at).toISOString(),
        retryable_failure: retryableFailure(run),
        source: "recommendation_scan_run",
        fingerprint: run.run_fingerprint,
      }),
    ),
    ...preRunFailures.map(
      (failure): RetryHistoryEvent => ({
        occurred_at: failure.finalized_at,
        retryable_failure: true,
        source: "observation_cycle_receipt",
        fingerprint: failure.cycle_fingerprint,
      }),
    ),
  ].sort((first, second) => {
    const timeDifference =
      Date.parse(second.occurred_at) - Date.parse(first.occurred_at);
    return timeDifference !== 0
      ? timeDifference
      : first.fingerprint.localeCompare(second.fingerprint);
  });
}

function consecutiveRetryableFailures(events: readonly RetryHistoryEvent[]) {
  let count = 0;
  for (const event of events) {
    if (!event.retryable_failure) break;
    count += 1;
  }
  return count;
}

function cadenceMinutes(input: {
  failures: number;
}) {
  if (input.failures > 0) {
    return Math.min(
      OBSERVATION_CYCLE_MAX_RETRY_BACKOFF_MINUTES,
      OBSERVATION_CYCLE_MINIMUM_CADENCE_MINUTES * 2 ** (input.failures - 1),
    );
  }
  return OBSERVATION_CYCLE_MINIMUM_CADENCE_MINUTES;
}

function freezeReceipt(
  receipt: Omit<ObservationCycleAdmissionReceipt, "authority">,
): ObservationCycleAdmissionReceipt {
  return Object.freeze({
    ...receipt,
    reason_codes: Object.freeze([...receipt.reason_codes]),
    facts: Object.freeze({
      session: Object.freeze({ ...receipt.facts.session }),
      freshness: Object.freeze({ ...receipt.facts.freshness }),
      coverage: Object.freeze({ ...receipt.facts.coverage }),
      candidate_state: Object.freeze({ ...receipt.facts.candidate_state }),
      material_change: Object.freeze({ ...receipt.facts.material_change }),
      provider_budget: Object.freeze({ ...receipt.facts.provider_budget }),
      retry_backoff: Object.freeze({ ...receipt.facts.retry_backoff }),
    }),
    authority: Object.freeze({
      calls_provider: false,
      reserves_provider_credits: false,
      changes_ranking: false,
      publishes_candidate: false,
      executes_broker_order: false,
    }),
  });
}

export function buildObservationCycleAdmission(
  input: BuildObservationCycleAdmissionInput,
): ObservationCycleAdmissionReceipt {
  const evaluatedAt = input.now.toISOString();
  const runs = sameTradingDateRuns(input.recentScanRuns, input.now);
  const latest = runs[0] ?? null;
  const previous = runs[1] ?? null;
  const preRunFailureHistory =
    input.recentPreRunFailures === null
      ? { valid: [] as ObservationCyclePreRunFailure[], invalid: true }
      : sameTradingDatePreRunFailures(input.recentPreRunFailures, input.now);
  const retryEvents = retryHistoryEvents({
    runs,
    preRunFailures: preRunFailureHistory.valid,
  });
  const cadenceAnchor = retryEvents[0] ?? null;
  const freshness = freshnessFact(latest, input.now);
  const coverage = coverageFact(latest);
  const candidateState = candidateStateFact(latest);
  const materialChange = materialChangeFact(latest, previous);
  const providerBudget = providerBudgetFact(input.providerBudget);
  const failures = consecutiveRetryableFailures(retryEvents);
  const delayMinutes = cadenceMinutes({ failures });
  const cadenceAnchorAt = cadenceAnchor?.occurred_at ?? null;
  const nextEligibleAt = cadenceAnchorAt
    ? new Date(Date.parse(cadenceAnchorAt) + delayMinutes * 60_000).toISOString()
    : null;
  const historyTimestampInvalid =
    freshness.age_minutes !== null && freshness.age_minutes < 0;
  const preconditionReason = input.preconditionReason ?? null;
  const rejectedReason =
    !input.sessionVerifiedOpen
      ? preconditionReason ?? "market_session_not_provider_confirmed_open"
      : preconditionReason
        ? preconditionReason
        : providerBudget.status !== "bounded"
          ? "provider_budget_not_bounded"
          : preRunFailureHistory.invalid
            ? "observation_attempt_history_invalid_or_unavailable"
            : historyTimestampInvalid
              ? "observation_history_future_timestamp"
              : null;
  const due =
    cadenceAnchor === null ||
    (nextEligibleAt !== null && input.now.getTime() >= Date.parse(nextEligibleAt));
  const decision = rejectedReason
    ? ("reject" as const)
    : due
      ? ("request_current_data" as const)
      : ("no_request" as const);
  const dueReason =
    cadenceAnchor === null
      ? "initial_observation_required"
      : failures > 0
        ? cadenceAnchor?.source === "observation_cycle_receipt"
          ? "pre_run_failure_backoff_elapsed"
          : "retry_backoff_elapsed"
        : candidateState.status === "active" || candidateState.status === "watch"
          ? "candidate_follow_up_due"
          : freshness.status === "stale" || freshness.status === "degraded"
            ? "data_quality_refresh_due"
            : coverage.status !== "complete"
              ? "coverage_refresh_due"
              : materialChange.status === "observed"
                ? "material_change_follow_up_due"
                : "periodic_observation_due";
  const reasonCodes = uniqueReasonCodes([
    rejectedReason,
    decision === "request_current_data" ? dueReason : null,
    decision === "no_request" ? "observation_not_due" : null,
    providerBudget.status === "bounded"
      ? "atomic_provider_credit_reservation_required"
      : null,
    freshness.status === "unknown" ? "prior_freshness_unknown" : null,
    coverage.status === "unknown" ? "prior_coverage_unknown" : null,
    materialChange.status === "unknown" ? "material_change_unknown" : null,
  ]);

  return freezeReceipt({
    policy_version: OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION,
    decision,
    request_current_data: decision === "request_current_data",
    evaluated_at: evaluatedAt,
    next_eligible_at: nextEligibleAt,
    reason_codes: reasonCodes,
    facts: {
      session: {
        status: input.sessionVerifiedOpen ? "verified_open" : "rejected",
      },
      freshness,
      coverage,
      candidate_state: candidateState,
      material_change: materialChange,
      provider_budget: providerBudget,
      retry_backoff: {
        consecutive_retryable_failures: failures,
        delay_minutes: delayMinutes,
        next_eligible_at: nextEligibleAt,
        cadence_anchor_at: cadenceAnchorAt,
        cadence_anchor_source: cadenceAnchor?.source ?? "none",
        includes_pre_run_failure: retryEvents
          .slice(0, failures)
          .some((event) => event.source === "observation_cycle_receipt"),
      },
    },
  });
}

export function observationCycleAdmissionFromUnknown(
  value: unknown,
): ObservationCycleAdmissionReceipt | null {
  const receipt = objectOrNull(value);
  const facts = objectOrNull(receipt?.facts);
  const session = objectOrNull(facts?.session);
  const freshness = objectOrNull(facts?.freshness);
  const coverage = objectOrNull(facts?.coverage);
  const candidateState = objectOrNull(facts?.candidate_state);
  const materialChange = objectOrNull(facts?.material_change);
  const providerBudget = objectOrNull(facts?.provider_budget);
  const retryBackoff = objectOrNull(facts?.retry_backoff);
  const authority = objectOrNull(receipt?.authority);
  const evaluatedAt = isoOrNull(receipt?.evaluated_at);
  const nextEligibleAt =
    receipt?.next_eligible_at === null ? null : isoOrNull(receipt?.next_eligible_at);
  const rawReasonCodes = Array.isArray(receipt?.reason_codes)
    ? receipt.reason_codes
    : null;
  const reasonCodes = rawReasonCodes?.flatMap((reason) => {
    const normalized = textOrNull(reason);
    return normalized ? [normalized] : [];
  }) ?? null;
  const retryNextEligibleAt =
    retryBackoff?.next_eligible_at === null
      ? null
      : isoOrNull(retryBackoff?.next_eligible_at);
  const policyVersion = enumOrNull(receipt?.policy_version, [
    OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION,
    LEGACY_OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION,
  ] as const);
  const decision = enumOrNull(receipt?.decision, [
    "request_current_data",
    "no_request",
    "reject",
  ] as const);
  const sessionStatus = enumOrNull(session?.status, [
    "verified_open",
    "rejected",
  ] as const);
  const freshnessStatus = enumOrNull(freshness?.status, [
    "fresh",
    "degraded",
    "stale",
    "unavailable",
    "unknown",
  ] as const);
  const coverageStatus = enumOrNull(coverage?.status, [
    "complete",
    "partial",
    "empty",
    "unknown",
  ] as const);
  const candidateStateStatus = enumOrNull(candidateState?.status, [
    "active",
    "watch",
    "no_trade",
    "empty",
    "unknown",
  ] as const);
  const materialChangeStatus = enumOrNull(materialChange?.status, [
    "observed",
    "not_observed",
    "unknown",
  ] as const);
  const materialChangeBasis = enumOrNull(materialChange?.basis, [
    "candidate_decision_comparison",
    "unavailable",
  ] as const);
  const providerBudgetStatus = enumOrNull(providerBudget?.status, [
    "bounded",
    "unbounded",
    "invalid",
  ] as const);
  const latestObservedAt =
    freshness?.latest_observed_at === null
      ? null
      : isoOrNull(freshness?.latest_observed_at);
  const ageMinutes =
    freshness?.age_minutes === null
      ? null
      : finiteInteger(freshness?.age_minutes);
  const expectedCandidateCount =
    coverage?.expected_candidate_count === null
      ? null
      : finiteNonNegativeInteger(coverage?.expected_candidate_count);
  const observedCandidateCount =
    coverage?.observed_candidate_count === null
      ? null
      : finiteNonNegativeInteger(coverage?.observed_candidate_count);
  const visibleCount = finiteNonNegativeInteger(candidateState?.visible_count);
  const strongCount = finiteNonNegativeInteger(candidateState?.strong_count);
  const needsReviewCount = finiteNonNegativeInteger(
    candidateState?.needs_review_count,
  );
  const rawCandidateCount =
    candidateState?.raw_candidate_count === null
      ? null
      : finiteNonNegativeInteger(candidateState?.raw_candidate_count);
  const maximumKnownCredits =
    providerBudget?.max_known_credits_per_scan === null
      ? null
      : finiteNonNegativeInteger(providerBudget?.max_known_credits_per_scan);
  const consecutiveFailures = finiteNonNegativeInteger(
    retryBackoff?.consecutive_retryable_failures,
  );
  const delayMinutes = finiteNonNegativeInteger(retryBackoff?.delay_minutes);
  const cadenceAnchorAt =
    policyVersion === LEGACY_OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION
      ? latestObservedAt
      : retryBackoff?.cadence_anchor_at === null
        ? null
        : isoOrNull(retryBackoff?.cadence_anchor_at);
  const cadenceAnchorSource =
    policyVersion === LEGACY_OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION
      ? latestObservedAt
        ? ("recommendation_scan_run" as const)
        : ("none" as const)
      : enumOrNull(retryBackoff?.cadence_anchor_source, [
          "none",
          "recommendation_scan_run",
          "observation_cycle_receipt",
        ] as const);
  const includesPreRunFailure =
    policyVersion === LEGACY_OBSERVATION_CYCLE_ADMISSION_POLICY_VERSION
      ? false
      : retryBackoff?.includes_pre_run_failure === true
        ? true
        : retryBackoff?.includes_pre_run_failure === false
          ? false
          : null;

  if (
    !policyVersion ||
    !decision ||
    receipt?.request_current_data !== (decision === "request_current_data") ||
    !evaluatedAt ||
    !rawReasonCodes ||
    !reasonCodes ||
    reasonCodes.length !== rawReasonCodes.length ||
    new Set(reasonCodes).size !== reasonCodes.length ||
    !facts ||
    !session ||
    !sessionStatus ||
    !freshness ||
    !freshnessStatus ||
    (freshness.latest_observed_at !== null && !latestObservedAt) ||
    (freshness.age_minutes !== null && ageMinutes === null) ||
    !coverage ||
    !coverageStatus ||
    (coverage.expected_candidate_count !== null && expectedCandidateCount === null) ||
    (coverage.observed_candidate_count !== null && observedCandidateCount === null) ||
    (expectedCandidateCount !== null &&
      observedCandidateCount !== null &&
      observedCandidateCount > expectedCandidateCount) ||
    !candidateState ||
    !candidateStateStatus ||
    visibleCount === null ||
    strongCount === null ||
    needsReviewCount === null ||
    (candidateState.raw_candidate_count !== null && rawCandidateCount === null) ||
    !materialChange ||
    !materialChangeStatus ||
    !materialChangeBasis ||
    !providerBudget ||
    !providerBudgetStatus ||
    (providerBudget.max_known_credits_per_scan !== null &&
      maximumKnownCredits === null) ||
    (providerBudgetStatus === "bounded" &&
      (maximumKnownCredits === null || maximumKnownCredits <= 0)) ||
    providerBudget.atomic_reservation_required !== true ||
    !retryBackoff ||
    consecutiveFailures === null ||
    delayMinutes === null ||
    delayMinutes < OBSERVATION_CYCLE_MINIMUM_CADENCE_MINUTES ||
    delayMinutes > OBSERVATION_CYCLE_MAX_RETRY_BACKOFF_MINUTES ||
    !cadenceAnchorSource ||
    includesPreRunFailure === null ||
    nextEligibleAt !== retryNextEligibleAt ||
    (latestObservedAt === null) !== (ageMinutes === null) ||
    (cadenceAnchorSource === "none") !== (cadenceAnchorAt === null) ||
    (nextEligibleAt === null) !== (cadenceAnchorAt === null) ||
    (nextEligibleAt !== null &&
      Date.parse(nextEligibleAt) !==
        Date.parse(cadenceAnchorAt as string) + delayMinutes * 60_000) ||
    (includesPreRunFailure && consecutiveFailures === 0) ||
    ((decision === "request_current_data" || decision === "no_request") &&
      (sessionStatus !== "verified_open" || providerBudgetStatus !== "bounded")) ||
    !authority ||
    authority.calls_provider !== false ||
    authority.reserves_provider_credits !== false ||
    authority.changes_ranking !== false ||
    authority.publishes_candidate !== false ||
    authority.executes_broker_order !== false
  ) {
    return null;
  }

  return freezeReceipt({
    policy_version: policyVersion,
    decision,
    request_current_data: decision === "request_current_data",
    evaluated_at: evaluatedAt,
    next_eligible_at: nextEligibleAt,
    reason_codes: reasonCodes,
    facts: {
      session: { status: sessionStatus },
      freshness: {
        status: freshnessStatus,
        latest_observed_at: latestObservedAt,
        age_minutes: ageMinutes,
      },
      coverage: {
        status: coverageStatus,
        expected_candidate_count: expectedCandidateCount,
        observed_candidate_count: observedCandidateCount,
      },
      candidate_state: {
        status: candidateStateStatus,
        visible_count: visibleCount,
        strong_count: strongCount,
        needs_review_count: needsReviewCount,
        raw_candidate_count: rawCandidateCount,
      },
      material_change: {
        status: materialChangeStatus,
        basis: materialChangeBasis,
      },
      provider_budget: {
        status: providerBudgetStatus,
        policy_version: textOrNull(providerBudget.policy_version),
        plan_mode: textOrNull(providerBudget.plan_mode),
        max_known_credits_per_scan: maximumKnownCredits,
        atomic_reservation_required: true,
      },
      retry_backoff: {
        consecutive_retryable_failures: consecutiveFailures,
        delay_minutes: delayMinutes,
        next_eligible_at: retryNextEligibleAt,
        cadence_anchor_at: cadenceAnchorAt,
        cadence_anchor_source: cadenceAnchorSource,
        includes_pre_run_failure: includesPreRunFailure,
      },
    },
  });
}
