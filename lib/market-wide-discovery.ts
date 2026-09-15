import "server-only";

import {
  getTwelveDataMarketMovers,
  type TwelveDataMarketMoverDirection,
} from "@/lib/market-data";
import {
  buildDynamicMarketMoversSelection,
  type DynamicMarketMoversSource,
  type DynamicMarketMoversSelection,
} from "@/lib/dynamic-market-movers";
import {
  blockMarketWideDiscoveryAdmissionForReservation,
  buildMarketWideDiscoveryAdmission,
  type MarketWideDiscoveryAdmission,
  type MarketWideDiscoveryAttemptOutcome,
  type MarketWideDiscoveryDirection,
  type MarketWideDiscoveryPreviousAttempt,
} from "@/lib/market-wide-discovery-policy";
import { buildProviderPlanProfile, type ProviderPlanProfileEnv } from "@/lib/provider-plan-profile";
import {
  getNewYorkDateString,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import {
  buildMarketWideDiscoveryCreditReservationClaimId,
  marketWideDiscoveryCreditReservationContractVersion,
  type MarketWideDiscoveryCreditReservationFinalization,
  type MarketWideDiscoveryCreditReservationInput,
  type MarketWideDiscoveryCreditReservationPreparation,
} from "@/lib/market-wide-discovery-credit-reservation-store";
import {
  finalizeMarketWideDiscoveryCreditReservation,
  prepareMarketWideDiscoveryCreditReservation,
} from "@/lib/server/market-wide-discovery-credit-reservation-persistence";
import { classifyMarketDataProviderFailure } from "@/lib/provider-response-observation";
import { OperationAbortedError, throwIfAborted } from "@/lib/operation-abort";

export const MARKET_WIDE_DISCOVERY_SUMMARY_VERSION =
  "market_wide_discovery_summary_v3" as const;

export type MarketWideDiscoveryCreditReservationSummary = {
  contract_version: typeof marketWideDiscoveryCreditReservationContractVersion;
  status:
    | "not_required"
    | MarketWideDiscoveryCreditReservationPreparation["status"];
  trading_date: string | null;
  requested_credits: number | null;
  declared_daily_credit_budget: number | null;
  reserved_credits: number | null;
  remaining_credits: number | null;
  idempotent: boolean | null;
  finalization_status:
    | "not_started"
    | MarketWideDiscoveryCreditReservationFinalization["status"];
  finalization_proven: boolean | null;
};

export type MarketWideDiscoverySummary = {
  summary_version: typeof MARKET_WIDE_DISCOVERY_SUMMARY_VERSION;
  summary_kind: "market_wide_discovery";
  generated_at: string;
  scan_window: IntradayScanWindow | "unknown";
  admission: MarketWideDiscoveryAdmission;
  attempt: {
    attempted_at: string | null;
    outcome: MarketWideDiscoveryAttemptOutcome;
    provider_response_observed: boolean;
  };
  credit_reservation: MarketWideDiscoveryCreditReservationSummary;
  dynamic_intake: DynamicMarketMoversSelection["summary"];
  warnings: string[];
  gaps: string[];
};

export type MarketWideDiscoveryResult = {
  summary: MarketWideDiscoverySummary;
  dynamic_movers: DynamicMarketMoversSelection;
};

export type DiscoverMarketWideDiscoveryInput = {
  scanWindow?: IntradayScanWindow | "unknown" | null;
  selectedBudget?: number | null;
  previousAttempt?: MarketWideDiscoveryPreviousAttempt | null;
  /**
   * Callers running a simulation or diagnostic must opt out even when the
   * deployment-level discovery switch is enabled. This prevents a test path
   * from spending provider credits or being mistaken for live evidence.
   */
  runtimeEnabled?: boolean;
  /**
   * The dynamic provider is only eligible within a durable, owner-bound scan
   * execution. Diagnostic or unbound calls deliberately receive no request.
   */
  ownerUserId?: string | null;
  executionFingerprint?: string | null;
  env?: ProviderPlanProfileEnv;
  now?: Date;
  signal?: AbortSignal;
  fetchMarketMovers?: (
    direction: TwelveDataMarketMoverDirection,
    options: { signal?: AbortSignal },
  ) => ReturnType<typeof getTwelveDataMarketMovers>;
  creditReservation?: {
    prepare: (
      input: MarketWideDiscoveryCreditReservationInput,
    ) => Promise<MarketWideDiscoveryCreditReservationPreparation>;
    finalize: (input: {
      claim_id: string;
      execution_fingerprint: string;
      status: "completed" | "failed";
      finalized_at: string;
    }) => Promise<MarketWideDiscoveryCreditReservationFinalization>;
  };
};

export async function discoverMarketWideDiscovery(
  input: DiscoverMarketWideDiscoveryInput = {},
): Promise<MarketWideDiscoveryResult> {
  throwIfAborted(input.signal);
  const now = input.now ?? new Date();
  const env = input.env ?? process.env;
  const plan = buildProviderPlanProfile(env);
  const admission = buildMarketWideDiscoveryAdmission({
    planMode: plan.effective_mode,
    runtimeEnabled:
      input.runtimeEnabled ??
      env.TURE_MARKET_WIDE_DISCOVERY_ENABLED === "true",
    dailyCreditBudget: finiteNonNegative(
      env.TURE_MARKET_WIDE_DISCOVERY_DAILY_CREDIT_BUDGET,
    ),
    previousAttempt: input.previousAttempt,
    now,
  });
  const scanWindow = input.scanWindow ?? "unknown";
  const selectedBudget = finitePositive(input.selectedBudget) ?? 50;
  const tradingDate = getNewYorkDateString(now);
  const defaultReservation = notRequiredReservation();

  if (!admission.safe_to_request_dynamic_movers) {
    return buildResult({
      now,
      scanWindow,
      admission,
      dynamicMovers: buildDynamicMarketMoversSelection({
        scanWindow,
        selectedBudget,
        now,
      }),
      attemptedAt: null,
      outcome: "not_attempted",
      providerResponseObserved: false,
      creditReservation: defaultReservation,
      warnings: [],
      gaps: [admission.reason_codes[0] ?? "dynamic_movers_not_admitted"],
    });
  }

  const declaredDailyCreditBudget = admission.declared_daily_credit_budget;
  const ownerUserId = text(input.ownerUserId);
  const executionFingerprint = text(input.executionFingerprint);
  if (
    declaredDailyCreditBudget === null ||
    ownerUserId === null ||
    executionFingerprint === null
  ) {
    const reservation = unavailableReservation({
      tradingDate,
      requestedCredits: admission.requested_credits,
      declaredDailyCreditBudget,
    });
    return buildResult({
      now,
      scanWindow,
      admission: blockMarketWideDiscoveryAdmissionForReservation(
        admission,
        "daily_credit_reservation_unavailable",
      ),
      dynamicMovers: buildDynamicMarketMoversSelection({
        scanWindow,
        selectedBudget,
        now,
      }),
      attemptedAt: null,
      outcome: "not_attempted",
      providerResponseObserved: false,
      creditReservation: reservation,
      warnings: [],
      gaps: ["daily_credit_reservation_unavailable"],
    });
  }

  const reservationInput: MarketWideDiscoveryCreditReservationInput = {
    claim_id: buildMarketWideDiscoveryCreditReservationClaimId({
      trading_date: tradingDate,
      execution_fingerprint: executionFingerprint,
    }),
    execution_fingerprint: executionFingerprint,
    owner_user_id: ownerUserId,
    trading_date: tradingDate,
    requested_credits: admission.requested_credits,
    declared_daily_credit_budget: declaredDailyCreditBudget,
  };
  const reservationLifecycle = input.creditReservation ?? {
    prepare: prepareMarketWideDiscoveryCreditReservation,
    finalize: finalizeMarketWideDiscoveryCreditReservation,
  };
  const preparation = await prepareReservation(
    reservationLifecycle,
    reservationInput,
  );
  const preparedReservation = reservationSummary({
    preparation,
    tradingDate,
    requestedCredits: admission.requested_credits,
    declaredDailyCreditBudget,
    finalization: null,
  });

  if (!preparation.provider_execution_allowed || !preparation.claim_id) {
    const blocker = reservationBlocker(preparation.status);
    return buildResult({
      now,
      scanWindow,
      admission: blockMarketWideDiscoveryAdmissionForReservation(
        admission,
        blocker,
      ),
      dynamicMovers: buildDynamicMarketMoversSelection({
        scanWindow,
        selectedBudget,
        now,
      }),
      attemptedAt: null,
      outcome: "not_attempted",
      providerResponseObserved: false,
      creditReservation: preparedReservation,
      warnings: [],
      gaps: [reservationGap(preparation.status)],
    });
  }

  const fetchMarketMovers = input.fetchMarketMovers ?? getTwelveDataMarketMovers;
  const attemptedAt = now.toISOString();

  try {
    const responses = await Promise.all(
      admission.directions.map((direction) =>
        fetchMarketMovers(direction, { signal: input.signal }),
      ),
    );
    const movers: Array<{
      ticker: string;
      company_name: string | null;
      source: DynamicMarketMoversSource;
      source_rank: number;
      percent_change: number | null;
      volume: number | null;
      price: number | null;
      fetched_at: string;
      provider: string;
      tradable: boolean;
      context_only: boolean;
      warnings: string[];
    }> = responses.flatMap((response) =>
      response.movers.map((mover) => ({
        ticker: mover.symbol,
        company_name: mover.name,
        source: sourceForDirection(response.direction),
        source_rank: mover.rank,
        percent_change: mover.percent_change,
        volume: mover.volume,
        price: mover.last,
        fetched_at: response.fetched_at,
        provider: "twelve_data",
        tradable: true,
        context_only: false,
        warnings: [],
      })),
    );
    const dynamicMovers = buildDynamicMarketMoversSelection({
      scanWindow,
      providerResult: {
        provider: "twelve_data",
        status: movers.length > 0 ? "available" : "partial",
        fetched_at: attemptedAt,
        movers,
      },
      selectedBudget,
      now,
    });

    const finalization = await finalizeReservation(
      reservationLifecycle,
      reservationInput,
      "completed",
    );
    const creditReservation = reservationSummary({
      preparation,
      tradingDate,
      requestedCredits: admission.requested_credits,
      declaredDailyCreditBudget,
      finalization,
    });

    return buildResult({
      now,
      scanWindow,
      admission,
      dynamicMovers,
      attemptedAt,
      outcome: movers.length > 0 ? "available" : "empty",
      providerResponseObserved: true,
      creditReservation,
      warnings: withReservationFinalizationGap(
        dynamicMovers.summary.warnings.map((warning) => warning.warning_id),
        finalization,
      ),
      gaps: withReservationFinalizationGap(dynamicMovers.summary.gaps, finalization),
    });
  } catch (error) {
    const finalization = await finalizeReservation(
      reservationLifecycle,
      reservationInput,
      "failed",
    );
    if (error instanceof OperationAbortedError) throw error;
    const providerFailure = classifyMarketDataProviderFailure(error);
    const outcome: MarketWideDiscoveryAttemptOutcome = providerFailure.outcome;
    const dynamicMovers = buildDynamicMarketMoversSelection({
      scanWindow,
      providerResult: {
        provider: "twelve_data",
        status: "error",
        fetched_at: attemptedAt,
        error: outcome,
      },
      selectedBudget,
      now,
    });

    const creditReservation = reservationSummary({
      preparation,
      tradingDate,
      requestedCredits: admission.requested_credits,
      declaredDailyCreditBudget,
      finalization,
    });

    return buildResult({
      now,
      scanWindow,
      admission,
      dynamicMovers,
      attemptedAt,
      outcome,
      providerResponseObserved: providerFailure.provider_response_observed,
      creditReservation,
      warnings: withReservationFinalizationGap([outcome], finalization),
      gaps: withReservationFinalizationGap([outcome], finalization),
    });
  }
}

function buildResult({
  now,
  scanWindow,
  admission,
  dynamicMovers,
  attemptedAt,
  outcome,
  providerResponseObserved,
  creditReservation,
  warnings,
  gaps,
}: {
  now: Date;
  scanWindow: IntradayScanWindow | "unknown";
  admission: MarketWideDiscoveryAdmission;
  dynamicMovers: DynamicMarketMoversSelection;
  attemptedAt: string | null;
  outcome: MarketWideDiscoveryAttemptOutcome;
  providerResponseObserved: boolean;
  creditReservation: MarketWideDiscoveryCreditReservationSummary;
  warnings: string[];
  gaps: string[];
}): MarketWideDiscoveryResult {
  return {
    summary: {
      summary_version: MARKET_WIDE_DISCOVERY_SUMMARY_VERSION,
      summary_kind: "market_wide_discovery",
      generated_at: now.toISOString(),
      scan_window: scanWindow,
      admission,
      attempt: {
        attempted_at: attemptedAt,
        outcome,
        provider_response_observed: providerResponseObserved,
      },
      credit_reservation: creditReservation,
      dynamic_intake: dynamicMovers.summary,
      warnings: unique(warnings),
      gaps: unique(gaps),
    },
    dynamic_movers: dynamicMovers,
  };
}

function notRequiredReservation(): MarketWideDiscoveryCreditReservationSummary {
  return {
    contract_version: marketWideDiscoveryCreditReservationContractVersion,
    status: "not_required",
    trading_date: null,
    requested_credits: null,
    declared_daily_credit_budget: null,
    reserved_credits: null,
    remaining_credits: null,
    idempotent: null,
    finalization_status: "not_started",
    finalization_proven: null,
  };
}

function unavailableReservation(input: {
  tradingDate: string;
  requestedCredits: number;
  declaredDailyCreditBudget: number | null;
}): MarketWideDiscoveryCreditReservationSummary {
  return {
    contract_version: marketWideDiscoveryCreditReservationContractVersion,
    status: "reservation_unavailable",
    trading_date: input.tradingDate,
    requested_credits: input.requestedCredits,
    declared_daily_credit_budget: input.declaredDailyCreditBudget,
    reserved_credits: null,
    remaining_credits: null,
    idempotent: null,
    finalization_status: "not_started",
    finalization_proven: null,
  };
}

function reservationSummary(input: {
  preparation: MarketWideDiscoveryCreditReservationPreparation;
  tradingDate: string;
  requestedCredits: number;
  declaredDailyCreditBudget: number;
  finalization: MarketWideDiscoveryCreditReservationFinalization | null;
}): MarketWideDiscoveryCreditReservationSummary {
  return {
    contract_version: marketWideDiscoveryCreditReservationContractVersion,
    status: input.preparation.status,
    trading_date: input.tradingDate,
    requested_credits: input.requestedCredits,
    declared_daily_credit_budget: input.declaredDailyCreditBudget,
    reserved_credits: input.preparation.reserved_credits,
    remaining_credits: input.preparation.remaining_credits,
    idempotent: input.preparation.idempotent,
    finalization_status: input.finalization?.status ?? "not_started",
    finalization_proven: input.finalization?.finalization_proven ?? null,
  };
}

async function prepareReservation(
  lifecycle: NonNullable<DiscoverMarketWideDiscoveryInput["creditReservation"]>,
  input: MarketWideDiscoveryCreditReservationInput,
) {
  try {
    return await lifecycle.prepare(input);
  } catch {
    return unavailablePreparation();
  }
}

async function finalizeReservation(
  lifecycle: NonNullable<DiscoverMarketWideDiscoveryInput["creditReservation"]>,
  input: MarketWideDiscoveryCreditReservationInput,
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
      safe_blocker: "daily_credit_reservation_unavailable",
    };
  }
}

function unavailablePreparation(): MarketWideDiscoveryCreditReservationPreparation {
  return {
    status: "reservation_unavailable",
    provider_execution_allowed: false,
    claim_id: null,
    idempotent: null,
    reserved_credits: null,
    remaining_credits: null,
    safe_blocker: "daily_credit_reservation_unavailable",
  };
}

function reservationBlocker(
  status: MarketWideDiscoveryCreditReservationPreparation["status"],
) {
  if (status === "daily_credit_limit_reached") {
    return "daily_credit_limit_reached" as const;
  }
  if (status === "attempt_in_progress") {
    return "credit_reservation_attempt_in_progress" as const;
  }
  if (status === "already_completed" || status === "already_failed") {
    return "credit_reservation_already_finalized" as const;
  }
  return "daily_credit_reservation_unavailable" as const;
}

function reservationGap(
  status: MarketWideDiscoveryCreditReservationPreparation["status"],
) {
  return reservationBlocker(status);
}

function withReservationFinalizationGap(
  values: string[],
  finalization: MarketWideDiscoveryCreditReservationFinalization,
) {
  return finalization.finalization_proven
    ? values
    : [...values, "daily_credit_reservation_finalization_unavailable"];
}

function sourceForDirection(
  direction: MarketWideDiscoveryDirection,
): DynamicMarketMoversSource {
  return direction === "losers" ? "top_loser" : "top_gainer";
}

function finiteNonNegative(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
}

function finitePositive(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.round(value))
    : null;
}

function text(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.length > 0))).sort();
}
