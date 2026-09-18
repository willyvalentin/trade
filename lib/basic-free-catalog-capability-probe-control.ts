export const BASIC_FREE_CATALOG_CAPABILITY_PROBE_CONTROL_VERSION =
  "basic_free_catalog_capability_probe_control_v1" as const;
export const BASIC_FREE_CATALOG_CAPABILITY_PROBE_OUTPUT_SIZE = 100 as const;

export type BasicFreeCatalogCapabilityProbeControlStatus =
  | "disabled"
  | "ready"
  | "target_date_missing"
  | "target_date_invalid"
  | "evaluation_date_invalid"
  | "outside_target_date";

export type BasicFreeCatalogCapabilityProbeControl = {
  control_version: typeof BASIC_FREE_CATALOG_CAPABILITY_PROBE_CONTROL_VERSION;
  status: BasicFreeCatalogCapabilityProbeControlStatus;
  catalog_only_enforced: boolean;
  capability_probe_may_proceed: boolean;
  target_trading_date: string | null;
  evaluated_trading_date: string | null;
  requested_output_size: typeof BASIC_FREE_CATALOG_CAPABILITY_PROBE_OUTPUT_SIZE;
  maximum_provider_credits: 1;
  reason_codes: string[];
};

export type BasicFreeCatalogCapabilityProbeControlInput = {
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
  status: BasicFreeCatalogCapabilityProbeControlStatus;
  catalogOnlyEnforced: boolean;
  capabilityProbeMayProceed: boolean;
  targetTradingDate: string | null;
  evaluatedTradingDate: string | null;
  reasonCode: string;
}): BasicFreeCatalogCapabilityProbeControl {
  return {
    control_version: BASIC_FREE_CATALOG_CAPABILITY_PROBE_CONTROL_VERSION,
    status: input.status,
    catalog_only_enforced: input.catalogOnlyEnforced,
    capability_probe_may_proceed: input.capabilityProbeMayProceed,
    target_trading_date: input.targetTradingDate,
    evaluated_trading_date: input.evaluatedTradingDate,
    requested_output_size: BASIC_FREE_CATALOG_CAPABILITY_PROBE_OUTPUT_SIZE,
    maximum_provider_credits: 1,
    reason_codes: [input.reasonCode],
  };
}

/**
 * One deliberately bounded provider-capability probe. The output size is a
 * fixed measurement target, not a discovered provider limit. If configured
 * incorrectly it remains catalog-only and cannot fall through to a normal
 * scheduled scan.
 */
export function buildBasicFreeCatalogCapabilityProbeControl(
  input: BasicFreeCatalogCapabilityProbeControlInput,
): BasicFreeCatalogCapabilityProbeControl {
  const env = input.env ?? process.env;
  const enabled = booleanTrue(
    env.TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED,
  );
  const targetTradingDate = tradingDateOrNull(
    env.TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE,
  );
  const evaluatedTradingDate = tradingDateOrNull(input.tradingDate);

  if (!enabled) {
    return result({
      status: "disabled",
      catalogOnlyEnforced: false,
      capabilityProbeMayProceed: false,
      targetTradingDate,
      evaluatedTradingDate,
      reasonCode: "basic_free_catalog_capability_probe_disabled",
    });
  }

  if (!env.TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE?.trim()) {
    return result({
      status: "target_date_missing",
      catalogOnlyEnforced: true,
      capabilityProbeMayProceed: false,
      targetTradingDate: null,
      evaluatedTradingDate,
      reasonCode: "basic_free_catalog_capability_probe_target_date_missing",
    });
  }

  if (targetTradingDate === null) {
    return result({
      status: "target_date_invalid",
      catalogOnlyEnforced: true,
      capabilityProbeMayProceed: false,
      targetTradingDate: null,
      evaluatedTradingDate,
      reasonCode: "basic_free_catalog_capability_probe_target_date_invalid",
    });
  }

  if (evaluatedTradingDate === null) {
    return result({
      status: "evaluation_date_invalid",
      catalogOnlyEnforced: true,
      capabilityProbeMayProceed: false,
      targetTradingDate,
      evaluatedTradingDate: null,
      reasonCode: "basic_free_catalog_capability_probe_evaluation_date_invalid",
    });
  }

  if (evaluatedTradingDate !== targetTradingDate) {
    return result({
      status: "outside_target_date",
      catalogOnlyEnforced: true,
      capabilityProbeMayProceed: false,
      targetTradingDate,
      evaluatedTradingDate,
      reasonCode: "basic_free_catalog_capability_probe_outside_target_date",
    });
  }

  return result({
    status: "ready",
    catalogOnlyEnforced: true,
    capabilityProbeMayProceed: true,
    targetTradingDate,
    evaluatedTradingDate,
    reasonCode: "basic_free_catalog_capability_probe_ready",
  });
}
