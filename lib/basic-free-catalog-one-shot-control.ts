export const BASIC_FREE_CATALOG_ONE_SHOT_CONTROL_VERSION =
  "basic_free_catalog_one_shot_control_v1" as const;

export type BasicFreeCatalogOneShotControlStatus =
  | "disabled"
  | "ready"
  | "target_date_missing"
  | "target_date_invalid"
  | "evaluation_date_invalid"
  | "outside_target_date";

export type BasicFreeCatalogOneShotControl = {
  control_version: typeof BASIC_FREE_CATALOG_ONE_SHOT_CONTROL_VERSION;
  status: BasicFreeCatalogOneShotControlStatus;
  catalog_only_enforced: boolean;
  catalog_observation_may_proceed: boolean;
  target_trading_date: string | null;
  evaluated_trading_date: string | null;
  reason_codes: string[];
};

export type BasicFreeCatalogOneShotControlInput = {
  env?: Record<string, string | undefined>;
  tradingDate: string;
};

function booleanTrue(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function tradingDateOrNull(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function result(input: {
  status: BasicFreeCatalogOneShotControlStatus;
  catalogOnlyEnforced: boolean;
  catalogObservationMayProceed: boolean;
  targetTradingDate: string | null;
  evaluatedTradingDate: string | null;
  reasonCode: string;
}): BasicFreeCatalogOneShotControl {
  return {
    control_version: BASIC_FREE_CATALOG_ONE_SHOT_CONTROL_VERSION,
    status: input.status,
    catalog_only_enforced: input.catalogOnlyEnforced,
    catalog_observation_may_proceed: input.catalogObservationMayProceed,
    target_trading_date: input.targetTradingDate,
    evaluated_trading_date: input.evaluatedTradingDate,
    reason_codes: [input.reasonCode],
  };
}

/**
 * A deliberately short-lived execution envelope for the one Basic Free
 * catalog observation used to verify IF-2 receipt plumbing. It is off unless
 * explicitly enabled, and a malformed or stale date remains catalog-only so
 * it cannot fall through to a normal scheduled scan.
 */
export function buildBasicFreeCatalogOneShotControl(
  input: BasicFreeCatalogOneShotControlInput,
): BasicFreeCatalogOneShotControl {
  const env = input.env ?? process.env;
  const enabled = booleanTrue(
    env.TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED,
  );
  const targetTradingDate = tradingDateOrNull(
    env.TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_DATE,
  );
  const evaluatedTradingDate = tradingDateOrNull(input.tradingDate);

  if (!enabled) {
    return result({
      status: "disabled",
      catalogOnlyEnforced: false,
      catalogObservationMayProceed: false,
      targetTradingDate,
      evaluatedTradingDate,
      reasonCode: "basic_free_catalog_one_shot_disabled",
    });
  }

  if (!env.TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_DATE?.trim()) {
    return result({
      status: "target_date_missing",
      catalogOnlyEnforced: true,
      catalogObservationMayProceed: false,
      targetTradingDate: null,
      evaluatedTradingDate,
      reasonCode: "basic_free_catalog_one_shot_target_date_missing",
    });
  }

  if (targetTradingDate === null) {
    return result({
      status: "target_date_invalid",
      catalogOnlyEnforced: true,
      catalogObservationMayProceed: false,
      targetTradingDate: null,
      evaluatedTradingDate,
      reasonCode: "basic_free_catalog_one_shot_target_date_invalid",
    });
  }

  if (evaluatedTradingDate === null) {
    return result({
      status: "evaluation_date_invalid",
      catalogOnlyEnforced: true,
      catalogObservationMayProceed: false,
      targetTradingDate,
      evaluatedTradingDate: null,
      reasonCode: "basic_free_catalog_one_shot_evaluation_date_invalid",
    });
  }

  if (evaluatedTradingDate !== targetTradingDate) {
    return result({
      status: "outside_target_date",
      catalogOnlyEnforced: true,
      catalogObservationMayProceed: false,
      targetTradingDate,
      evaluatedTradingDate,
      reasonCode: "basic_free_catalog_one_shot_outside_target_date",
    });
  }

  return result({
    status: "ready",
    catalogOnlyEnforced: true,
    catalogObservationMayProceed: true,
    targetTradingDate,
    evaluatedTradingDate,
    reasonCode: "basic_free_catalog_one_shot_ready",
  });
}
