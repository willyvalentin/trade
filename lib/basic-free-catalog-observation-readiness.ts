import "server-only";

import {
  buildBasicFreeCatalogOneShotControl,
  type BasicFreeCatalogOneShotControl,
} from "@/lib/basic-free-catalog-one-shot-control";
import {
  buildBasicFreeDiscoveryAdmission,
  type BasicFreeDiscoveryAdmission,
} from "@/lib/basic-free-discovery-policy";
import { getNewYorkDateString } from "@/lib/intraday-scan-window";
import {
  buildProviderPlanProfile,
  type ProviderPlanProfile,
  type ProviderPlanProfileEnv,
} from "@/lib/provider-plan-profile";

export const BASIC_FREE_CATALOG_OBSERVATION_READINESS_VERSION =
  "basic_free_catalog_observation_readiness_v1" as const;

export type BasicFreeCatalogObservationReadiness = {
  readiness_version: typeof BASIC_FREE_CATALOG_OBSERVATION_READINESS_VERSION;
  evaluated_trading_date: string;
  provider_profile: Pick<
    ProviderPlanProfile,
    "effective_mode" | "source" | "plan_mode_mismatch"
  >;
  admission: Pick<
    BasicFreeDiscoveryAdmission,
    | "policy_version"
    | "status"
    | "runtime_enabled"
    | "plan_eligibility"
    | "endpoint"
    | "declared_daily_credit_budget"
    | "declared_per_minute_credit_budget"
    | "reason_codes"
    | "coverage_contract"
  >;
  one_shot_control: BasicFreeCatalogOneShotControl;
  status: "blocked" | "contained_ready";
  blockers: string[];
  provider_request_authority: "not_granted_by_readiness";
};

function finitePositiveInteger(value: string | undefined) {
  if (value === undefined || !/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Produces a server-owned, secret-free readiness projection for the explicitly
 * bounded Basic Free catalog observation. It does not read durable reservation
 * state and it never grants request authority; the scheduled route still owns
 * session checks, idempotency, durable reservation and provider invocation.
 */
export function buildBasicFreeCatalogObservationReadiness(input: {
  env?: ProviderPlanProfileEnv;
  now?: Date;
} = {}): BasicFreeCatalogObservationReadiness {
  const env = input.env ?? process.env;
  const now = input.now ?? new Date();
  const evaluatedTradingDate = getNewYorkDateString(now);
  const providerPlanProfile = buildProviderPlanProfile(env);
  const admission = buildBasicFreeDiscoveryAdmission({
    planMode: providerPlanProfile.effective_mode,
    runtimeEnabled: env.TURE_BASIC_FREE_CATALOG_OBSERVATION_ENABLED === "true",
    dailyCreditBudget: finitePositiveInteger(
      env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET,
    ),
    perMinuteCreditBudget: finitePositiveInteger(
      env.TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET,
    ),
    tradingDate: evaluatedTradingDate,
  });
  const oneShotControl = buildBasicFreeCatalogOneShotControl({
    env,
    tradingDate: evaluatedTradingDate,
  });
  const containedReady =
    admission.safe_to_request_catalog &&
    oneShotControl.catalog_only_enforced &&
    oneShotControl.catalog_observation_may_proceed;
  const blockers = [
    ...(admission.safe_to_request_catalog ? [] : admission.reason_codes),
    ...(oneShotControl.catalog_observation_may_proceed
      ? []
      : oneShotControl.reason_codes),
  ];

  return {
    readiness_version: BASIC_FREE_CATALOG_OBSERVATION_READINESS_VERSION,
    evaluated_trading_date: evaluatedTradingDate,
    provider_profile: {
      effective_mode: providerPlanProfile.effective_mode,
      source: providerPlanProfile.source,
      plan_mode_mismatch: providerPlanProfile.plan_mode_mismatch,
    },
    admission: {
      policy_version: admission.policy_version,
      status: admission.status,
      runtime_enabled: admission.runtime_enabled,
      plan_eligibility: admission.plan_eligibility,
      endpoint: admission.endpoint,
      declared_daily_credit_budget: admission.declared_daily_credit_budget,
      declared_per_minute_credit_budget: admission.declared_per_minute_credit_budget,
      reason_codes: admission.reason_codes,
      coverage_contract: admission.coverage_contract,
    },
    one_shot_control: oneShotControl,
    status: containedReady ? "contained_ready" : "blocked",
    blockers,
    provider_request_authority: "not_granted_by_readiness",
  };
}
