import "server-only";

import {
  getTwelveDataStockCatalogPage,
  type TwelveDataStockCatalogPage,
} from "@/lib/market-data";
import {
  blockBasicFreeDiscoveryAdmissionForReservation,
  buildBasicFreeDiscoveryAdmission,
  type BasicFreeCatalogReferenceMode,
  type BasicFreeCatalogOutputSize,
  type BasicFreeDiscoveryAdmission,
  type BasicFreeDiscoveryAttemptOutcome,
  type BasicFreeDiscoveryPreviousAttempt,
} from "@/lib/basic-free-discovery-policy";
import { buildProviderPlanProfile, type ProviderPlanProfileEnv } from "@/lib/provider-plan-profile";
import {
  getNewYorkDateString,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import {
  basicFreeDiscoveryCreditReservationContractVersion,
  buildBasicFreeDiscoveryCreditReservationClaimId,
  type BasicFreeDiscoveryCreditReservationFinalization,
  type BasicFreeDiscoveryCreditReservationInput,
  type BasicFreeDiscoveryCreditReservationPreparation,
} from "@/lib/basic-free-discovery-credit-reservation-store";
import {
  finalizeBasicFreeDiscoveryCreditReservation,
  prepareBasicFreeDiscoveryCreditReservation,
} from "@/lib/server/basic-free-discovery-credit-reservation-persistence";
import { buildMarketWideSymbolMaster } from "@/lib/market-wide-symbol-master";
import { classifyMarketDataProviderFailure } from "@/lib/provider-response-observation";
import { OperationAbortedError, throwIfAborted } from "@/lib/operation-abort";

export const BASIC_FREE_DISCOVERY_SUMMARY_VERSION =
  "basic_free_catalog_observation_summary_v2" as const;

export type BasicFreeDiscoveryCreditReservationSummary = {
  contract_version: typeof basicFreeDiscoveryCreditReservationContractVersion;
  status:
    | "not_required"
    | BasicFreeDiscoveryCreditReservationPreparation["status"];
  trading_date: string | null;
  minute_bucket: string | null;
  requested_credits: number | null;
  declared_daily_credit_budget: number | null;
  declared_per_minute_credit_budget: number | null;
  daily_reserved_credits: number | null;
  daily_remaining_credits: number | null;
  minute_reserved_credits: number | null;
  minute_remaining_credits: number | null;
  idempotent: boolean | null;
  finalization_status:
    | "not_started"
    | BasicFreeDiscoveryCreditReservationFinalization["status"];
  finalization_proven: boolean | null;
};

export type BasicFreeDiscoverySummary = {
  summary_version: typeof BASIC_FREE_DISCOVERY_SUMMARY_VERSION;
  summary_kind: "basic_free_catalog_observation";
  reference_mode: BasicFreeCatalogReferenceMode;
  generated_at: string;
  trading_date: string;
  scan_window: IntradayScanWindow | "unknown";
  admission: BasicFreeDiscoveryAdmission;
  attempt: {
    attempted_at: string | null;
    outcome: BasicFreeDiscoveryAttemptOutcome;
    provider_response_observed: boolean;
  };
  credit_reservation: BasicFreeDiscoveryCreditReservationSummary;
  catalog: {
    provider: "twelve_data";
    endpoint: "/stocks";
    requested_output_size: BasicFreeCatalogOutputSize;
    decoded_response_json_bytes: number | null;
    observed_record_count: number;
    provider_catalog_count: number | null;
    eligible_record_count: number;
    rejected_record_count: number;
    collection_complete: false;
    discovery_feed_allowed: false;
  };
  warnings: string[];
  gaps: string[];
};

export type BasicFreeDiscoveryResult = {
  summary: BasicFreeDiscoverySummary;
};

export type DiscoverBasicFreeCatalogObservationInput = {
  scanWindow?: IntradayScanWindow | "unknown" | null;
  previousAttempt?: BasicFreeDiscoveryPreviousAttempt | null;
  runtimeEnabled?: boolean;
  ownerUserId?: string | null;
  executionFingerprint?: string | null;
  env?: ProviderPlanProfileEnv;
  now?: Date;
  signal?: AbortSignal;
  referenceMode?: BasicFreeCatalogReferenceMode;
  catalogOutputSize?: BasicFreeCatalogOutputSize;
  fetchCatalogPage?: (options: {
    signal?: AbortSignal;
    outputSize?: BasicFreeCatalogOutputSize;
  }) => Promise<TwelveDataStockCatalogPage>;
  creditReservation?: {
    prepare: (
      input: BasicFreeDiscoveryCreditReservationInput,
    ) => Promise<BasicFreeDiscoveryCreditReservationPreparation>;
    finalize: (input: {
      claim_id: string;
      execution_fingerprint: string;
      status: "completed" | "failed";
      finalized_at: string;
    }) => Promise<BasicFreeDiscoveryCreditReservationFinalization>;
  };
};

/**
 * Observes a single Basic Free-compatible /stocks page. This is not a
 * candidate source: the result is reference-only and hard-codes a partial
 * catalog boundary so it cannot become a scanner-universe expansion.
 */
export async function observeBasicFreeCatalog(
  input: DiscoverBasicFreeCatalogObservationInput = {},
): Promise<BasicFreeDiscoveryResult> {
  throwIfAborted(input.signal);
  const now = input.now ?? new Date();
  const env = input.env ?? process.env;
  const plan = buildProviderPlanProfile(env);
  const tradingDate = getNewYorkDateString(now);
  const referenceMode = input.referenceMode ?? "catalog_observation";
  const catalogOutputSize = input.catalogOutputSize ?? 8;
  const admission = buildBasicFreeDiscoveryAdmission({
    planMode: plan.effective_mode,
    runtimeEnabled:
      input.runtimeEnabled ??
      env.TURE_BASIC_FREE_CATALOG_OBSERVATION_ENABLED === "true",
    dailyCreditBudget: finitePositive(
      env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET,
    ),
    perMinuteCreditBudget: finitePositive(
      env.TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET,
    ),
    previousAttempt: input.previousAttempt,
    referenceMode,
    catalogOutputSize,
    tradingDate,
  });
  const scanWindow = input.scanWindow ?? "unknown";
  const defaultReservation = notRequiredReservation();

  if (!admission.safe_to_request_catalog) {
    return buildResult({
      now,
      tradingDate,
      scanWindow,
      admission,
      attemptedAt: null,
      outcome: "not_attempted",
      providerResponseObserved: false,
      creditReservation: defaultReservation,
      catalog: unavailableCatalog(catalogOutputSize),
      referenceMode,
      warnings: [],
      gaps: [
        admission.reason_codes[0] ?? "basic_free_catalog_observation_not_admitted",
        "catalog_observation_is_not_candidate_discovery",
      ],
    });
  }

  const declaredDailyCreditBudget = admission.declared_daily_credit_budget;
  const declaredPerMinuteCreditBudget =
    admission.declared_per_minute_credit_budget;
  const ownerUserId = text(input.ownerUserId);
  const executionFingerprint = text(input.executionFingerprint);
  const minuteBucket = minuteBucketFor(now);
  if (
    declaredDailyCreditBudget === null ||
    declaredPerMinuteCreditBudget === null ||
    ownerUserId === null ||
    executionFingerprint === null
  ) {
    return buildResult({
      now,
      tradingDate,
      scanWindow,
      admission: blockBasicFreeDiscoveryAdmissionForReservation(
        admission,
        "basic_free_credit_reservation_unavailable",
      ),
      attemptedAt: null,
      outcome: "not_attempted",
      providerResponseObserved: false,
      creditReservation: unavailableReservation({
        tradingDate,
        minuteBucket,
        declaredDailyCreditBudget,
        declaredPerMinuteCreditBudget,
      }),
      catalog: unavailableCatalog(catalogOutputSize),
      referenceMode,
      warnings: [],
      gaps: [
        "basic_free_credit_reservation_unavailable",
        "catalog_observation_is_not_candidate_discovery",
      ],
    });
  }

  const reservationInput: BasicFreeDiscoveryCreditReservationInput = {
    claim_id: buildBasicFreeDiscoveryCreditReservationClaimId({
      trading_date: tradingDate,
      execution_fingerprint: executionFingerprint,
    }),
    execution_fingerprint: executionFingerprint,
    owner_user_id: ownerUserId,
    trading_date: tradingDate,
    minute_bucket: minuteBucket,
    catalog_observation: true,
    requested_credits: admission.request.credits_per_request,
    declared_daily_credit_budget: declaredDailyCreditBudget,
    declared_per_minute_credit_budget: declaredPerMinuteCreditBudget,
  };
  const reservationLifecycle = input.creditReservation ?? {
    prepare: prepareBasicFreeDiscoveryCreditReservation,
    finalize: finalizeBasicFreeDiscoveryCreditReservation,
  };
  const preparation = await prepareReservation(reservationLifecycle, reservationInput);
  const preparedReservation = reservationSummary({
    preparation,
    tradingDate,
    minuteBucket,
    declaredDailyCreditBudget,
    declaredPerMinuteCreditBudget,
    finalization: null,
  });

  if (!preparation.provider_execution_allowed || !preparation.claim_id) {
    return buildResult({
      now,
      tradingDate,
      scanWindow,
      admission: blockBasicFreeDiscoveryAdmissionForReservation(
        admission,
        reservationBlocker(preparation.status),
      ),
      attemptedAt: null,
      outcome: "not_attempted",
      providerResponseObserved: false,
      creditReservation: preparedReservation,
      catalog: unavailableCatalog(catalogOutputSize),
      referenceMode,
      warnings: [],
      gaps: [
        reservationGap(preparation.status),
        "catalog_observation_is_not_candidate_discovery",
      ],
    });
  }

  const fetchCatalogPage = input.fetchCatalogPage ?? getTwelveDataStockCatalogPage;
  const attemptedAt = now.toISOString();

  try {
    const catalogPage = await fetchCatalogPage({
      signal: input.signal,
      outputSize: catalogOutputSize,
    });
    const catalog = catalogSummary(catalogPage, catalogOutputSize);
    const finalization = await finalizeReservation(
      reservationLifecycle,
      reservationInput,
      "completed",
    );
    const creditReservation = reservationSummary({
      preparation,
      tradingDate,
      minuteBucket,
      declaredDailyCreditBudget,
      declaredPerMinuteCreditBudget,
      finalization,
    });
    const outcome: BasicFreeDiscoveryAttemptOutcome =
      catalog.observed_record_count > 0 ? "available" : "empty";

    return buildResult({
      now,
      tradingDate,
      scanWindow,
      admission,
      attemptedAt,
      outcome,
      providerResponseObserved: true,
      creditReservation,
      catalog,
      referenceMode,
      warnings: withReservationFinalizationGap([], finalization),
      gaps: withReservationFinalizationGap(
        [
          "catalog_observation_is_not_candidate_discovery",
          "catalog_collection_not_complete",
          ...(catalog.provider_catalog_count === null
            ? ["provider_catalog_count_missing"]
            : []),
        ],
        finalization,
      ),
    });
  } catch (error) {
    const finalization = await finalizeReservation(
      reservationLifecycle,
      reservationInput,
      "failed",
    );
    if (error instanceof OperationAbortedError) throw error;
    const providerFailure = classifyMarketDataProviderFailure(error);
    const outcome = providerFailure.outcome as BasicFreeDiscoveryAttemptOutcome;

    return buildResult({
      now,
      tradingDate,
      scanWindow,
      admission,
      attemptedAt,
      outcome,
      providerResponseObserved: providerFailure.provider_response_observed,
      creditReservation: reservationSummary({
        preparation,
        tradingDate,
        minuteBucket,
        declaredDailyCreditBudget,
        declaredPerMinuteCreditBudget,
        finalization,
      }),
      catalog: unavailableCatalog(catalogOutputSize),
      referenceMode,
      warnings: withReservationFinalizationGap([outcome], finalization),
      gaps: withReservationFinalizationGap(
        [outcome, "catalog_observation_is_not_candidate_discovery"],
        finalization,
      ),
    });
  }
}

function buildResult(input: {
  now: Date;
  tradingDate: string;
  scanWindow: IntradayScanWindow | "unknown";
  admission: BasicFreeDiscoveryAdmission;
  attemptedAt: string | null;
  outcome: BasicFreeDiscoveryAttemptOutcome;
  providerResponseObserved: boolean;
  creditReservation: BasicFreeDiscoveryCreditReservationSummary;
  catalog: BasicFreeDiscoverySummary["catalog"];
  referenceMode: BasicFreeDiscoverySummary["reference_mode"];
  warnings: string[];
  gaps: string[];
}): BasicFreeDiscoveryResult {
  return {
    summary: {
      summary_version: BASIC_FREE_DISCOVERY_SUMMARY_VERSION,
      summary_kind: "basic_free_catalog_observation",
      reference_mode: input.referenceMode,
      generated_at: input.now.toISOString(),
      trading_date: input.tradingDate,
      scan_window: input.scanWindow,
      admission: input.admission,
      attempt: {
        attempted_at: input.attemptedAt,
        outcome: input.outcome,
        provider_response_observed: input.providerResponseObserved,
      },
      credit_reservation: input.creditReservation,
      catalog: input.catalog,
      warnings: unique(input.warnings),
      gaps: unique(input.gaps),
    },
  };
}

function unavailableCatalog(
  requestedOutputSize: BasicFreeCatalogOutputSize,
): BasicFreeDiscoverySummary["catalog"] {
  return {
    provider: "twelve_data",
    endpoint: "/stocks",
    requested_output_size: requestedOutputSize,
    decoded_response_json_bytes: null,
    observed_record_count: 0,
    provider_catalog_count: null,
    eligible_record_count: 0,
    rejected_record_count: 0,
    collection_complete: false,
    discovery_feed_allowed: false,
  };
}

function catalogSummary(
  page: TwelveDataStockCatalogPage,
  requestedOutputSize: BasicFreeCatalogOutputSize,
): BasicFreeDiscoverySummary["catalog"] {
  const master = buildMarketWideSymbolMaster({
    provider: "twelve_data",
    fetched_at: page.fetched_at,
    response: { data: page.records },
    provider_catalog_count: page.provider_catalog_count,
    pagination: {
      first_page: 1,
      last_page: null,
      pages_fetched: 1,
      total_pages: null,
      has_next_page: null,
    },
  });

  return {
    provider: "twelve_data",
    endpoint: "/stocks",
    requested_output_size: requestedOutputSize,
    decoded_response_json_bytes: finiteNonNegativeInteger(
      page.decoded_response_json_bytes,
    ),
    observed_record_count: page.records.length,
    provider_catalog_count: page.provider_catalog_count,
    eligible_record_count: master.summary.eligible_record_count,
    rejected_record_count: master.summary.rejected_record_count,
    collection_complete: false,
    discovery_feed_allowed: false,
  };
}

function notRequiredReservation(): BasicFreeDiscoveryCreditReservationSummary {
  return {
    contract_version: basicFreeDiscoveryCreditReservationContractVersion,
    status: "not_required",
    trading_date: null,
    minute_bucket: null,
    requested_credits: null,
    declared_daily_credit_budget: null,
    declared_per_minute_credit_budget: null,
    daily_reserved_credits: null,
    daily_remaining_credits: null,
    minute_reserved_credits: null,
    minute_remaining_credits: null,
    idempotent: null,
    finalization_status: "not_started",
    finalization_proven: null,
  };
}

function unavailableReservation(input: {
  tradingDate: string;
  minuteBucket: string;
  declaredDailyCreditBudget: number | null;
  declaredPerMinuteCreditBudget: number | null;
}): BasicFreeDiscoveryCreditReservationSummary {
  return {
    contract_version: basicFreeDiscoveryCreditReservationContractVersion,
    status: "reservation_unavailable",
    trading_date: input.tradingDate,
    minute_bucket: input.minuteBucket,
    requested_credits: 1,
    declared_daily_credit_budget: input.declaredDailyCreditBudget,
    declared_per_minute_credit_budget: input.declaredPerMinuteCreditBudget,
    daily_reserved_credits: null,
    daily_remaining_credits: null,
    minute_reserved_credits: null,
    minute_remaining_credits: null,
    idempotent: null,
    finalization_status: "not_started",
    finalization_proven: null,
  };
}

function reservationSummary(input: {
  preparation: BasicFreeDiscoveryCreditReservationPreparation;
  tradingDate: string;
  minuteBucket: string;
  declaredDailyCreditBudget: number;
  declaredPerMinuteCreditBudget: number;
  finalization: BasicFreeDiscoveryCreditReservationFinalization | null;
}): BasicFreeDiscoveryCreditReservationSummary {
  return {
    contract_version: basicFreeDiscoveryCreditReservationContractVersion,
    status: input.preparation.status,
    trading_date: input.tradingDate,
    minute_bucket: input.minuteBucket,
    requested_credits: 1,
    declared_daily_credit_budget: input.declaredDailyCreditBudget,
    declared_per_minute_credit_budget: input.declaredPerMinuteCreditBudget,
    daily_reserved_credits: input.preparation.daily_reserved_credits,
    daily_remaining_credits: input.preparation.daily_remaining_credits,
    minute_reserved_credits: input.preparation.minute_reserved_credits,
    minute_remaining_credits: input.preparation.minute_remaining_credits,
    idempotent: input.preparation.idempotent,
    finalization_status: input.finalization?.status ?? "not_started",
    finalization_proven: input.finalization?.finalization_proven ?? null,
  };
}

async function prepareReservation(
  lifecycle: NonNullable<DiscoverBasicFreeCatalogObservationInput["creditReservation"]>,
  input: BasicFreeDiscoveryCreditReservationInput,
) {
  try {
    return await lifecycle.prepare(input);
  } catch {
    return unavailablePreparation();
  }
}

async function finalizeReservation(
  lifecycle: NonNullable<DiscoverBasicFreeCatalogObservationInput["creditReservation"]>,
  input: BasicFreeDiscoveryCreditReservationInput,
  status: "completed" | "failed",
) {
  try {
    return await lifecycle.finalize({
      claim_id: input.claim_id,
      execution_fingerprint: input.execution_fingerprint,
      status,
      finalized_at: new Date().toISOString(),
    });
  } catch {
    return {
      status: "reservation_unavailable" as const,
      finalization_proven: false,
      safe_blocker: "basic_free_credit_reservation_unavailable",
    };
  }
}

function unavailablePreparation(): BasicFreeDiscoveryCreditReservationPreparation {
  return {
    status: "reservation_unavailable",
    provider_execution_allowed: false,
    claim_id: null,
    idempotent: null,
    daily_reserved_credits: null,
    daily_remaining_credits: null,
    minute_reserved_credits: null,
    minute_remaining_credits: null,
    safe_blocker: "basic_free_credit_reservation_unavailable",
  };
}

function reservationBlocker(
  status: BasicFreeDiscoveryCreditReservationPreparation["status"],
) {
  if (status === "daily_catalog_observation_already_claimed") return status;
  if (status === "daily_credit_limit_reached") return status;
  if (status === "per_minute_credit_limit_reached") return status;
  if (status === "attempt_in_progress") {
    return "credit_reservation_attempt_in_progress" as const;
  }
  if (status === "already_completed" || status === "already_failed") {
    return "credit_reservation_already_finalized" as const;
  }
  return "basic_free_credit_reservation_unavailable" as const;
}

function reservationGap(
  status: BasicFreeDiscoveryCreditReservationPreparation["status"],
) {
  if (status === "daily_catalog_observation_already_claimed") return status;
  if (status === "daily_credit_limit_reached") return status;
  if (status === "per_minute_credit_limit_reached") return status;
  if (status === "attempt_in_progress") {
    return "credit_reservation_attempt_in_progress";
  }
  if (status === "already_completed" || status === "already_failed") {
    return "credit_reservation_already_finalized";
  }
  return "basic_free_credit_reservation_unavailable";
}

function withReservationFinalizationGap(
  values: string[],
  finalization: BasicFreeDiscoveryCreditReservationFinalization,
) {
  return finalization.finalization_proven
    ? values
    : [...values, "basic_free_credit_reservation_finalization_unavailable"];
}

function minuteBucketFor(now: Date) {
  return new Date(Math.floor(now.getTime() / 60_000) * 60_000).toISOString();
}

function finitePositive(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function finiteNonNegativeInteger(value: unknown) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
    ? value
    : null;
}

function text(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function unique(values: string[]) {
  return [...new Set(values)];
}
