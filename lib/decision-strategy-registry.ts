export const DECISION_STRATEGY_REFERENCE_VERSION =
  "decision_strategy_reference_v1" as const;
export const DECISION_STRATEGY_REGISTRY_VERSION =
  "decision_strategy_registry_v1" as const;

export const CURRENT_DECISION_STRATEGY_ID =
  "intraday_long_multi_setup_quality_ranker" as const;
export const CURRENT_DECISION_STRATEGY_VERSION = "1.0.0" as const;
export const CURRENT_DECISION_STRATEGY_ROLLBACK_IDENTITY =
  `${CURRENT_DECISION_STRATEGY_ID}@${CURRENT_DECISION_STRATEGY_VERSION}` as const;

export const CURRENT_SYMBOL_SELECTION_POLICY_ID =
  "rotating_scanner_universe" as const;
export const CURRENT_SYMBOL_SELECTION_POLICY_VERSION =
  "scanner_universe_selection_v1" as const;

export const CURRENT_STRATEGY_DEFAULT_SCAN_BUDGET = 50 as const;
export const CURRENT_STRATEGY_MAX_SCAN_BUDGET = 100 as const;
export const CURRENT_STRATEGY_MAX_PUBLISHED_OPPORTUNITIES = 3 as const;

export type DecisionStrategyReference = {
  reference_version: typeof DECISION_STRATEGY_REFERENCE_VERSION;
  registry_version: typeof DECISION_STRATEGY_REGISTRY_VERSION;
  strategy_id: typeof CURRENT_DECISION_STRATEGY_ID;
  strategy_version: typeof CURRENT_DECISION_STRATEGY_VERSION;
  rollback_identity: typeof CURRENT_DECISION_STRATEGY_ROLLBACK_IDENTITY;
  lifecycle_status: "research_only";
  direction: "long_only";
  signal_policy: "deterministic_multi_setup_quality_ranking";
  model_dependency: "not_applicable";
  symbol_selection: {
    policy_id: typeof CURRENT_SYMBOL_SELECTION_POLICY_ID;
    policy_version: typeof CURRENT_SYMBOL_SELECTION_POLICY_VERSION;
    observed_universe_version: string;
    default_scan_budget: typeof CURRENT_STRATEGY_DEFAULT_SCAN_BUDGET;
    max_scan_budget: typeof CURRENT_STRATEGY_MAX_SCAN_BUDGET;
    coverage_claim: "bounded_scanner_universe_not_market_wide";
  };
  publication: {
    forced_minimum: 0;
    max_opportunities: typeof CURRENT_STRATEGY_MAX_PUBLISHED_OPPORTUNITIES;
  };
};

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

/**
 * Identifies the deterministic strategy that the current scanner actually
 * executes. This is deliberately separate from the publication-policy version:
 * a threshold/presentation policy is not a strategy identity. The reference
 * carries no execution authority and makes no market-wide coverage claim.
 */
export function buildCurrentDecisionStrategyReference(
  observedUniverseVersion: string,
): DecisionStrategyReference {
  const normalizedUniverseVersion = textOrNull(observedUniverseVersion);

  if (!normalizedUniverseVersion) {
    throw new Error("decision_strategy_observed_universe_version_missing");
  }

  return {
    reference_version: DECISION_STRATEGY_REFERENCE_VERSION,
    registry_version: DECISION_STRATEGY_REGISTRY_VERSION,
    strategy_id: CURRENT_DECISION_STRATEGY_ID,
    strategy_version: CURRENT_DECISION_STRATEGY_VERSION,
    rollback_identity: CURRENT_DECISION_STRATEGY_ROLLBACK_IDENTITY,
    lifecycle_status: "research_only",
    direction: "long_only",
    signal_policy: "deterministic_multi_setup_quality_ranking",
    model_dependency: "not_applicable",
    symbol_selection: {
      policy_id: CURRENT_SYMBOL_SELECTION_POLICY_ID,
      policy_version: CURRENT_SYMBOL_SELECTION_POLICY_VERSION,
      observed_universe_version: normalizedUniverseVersion,
      default_scan_budget: CURRENT_STRATEGY_DEFAULT_SCAN_BUDGET,
      max_scan_budget: CURRENT_STRATEGY_MAX_SCAN_BUDGET,
      coverage_claim: "bounded_scanner_universe_not_market_wide",
    },
    publication: {
      forced_minimum: 0,
      max_opportunities: CURRENT_STRATEGY_MAX_PUBLISHED_OPPORTUNITIES,
    },
  };
}

/**
 * Stored JSON is untrusted. Accept only the exact registered strategy and the
 * universe version captured by the same decision record. Unknown strategy
 * versions fail closed until this registry is deliberately extended.
 */
export function decisionStrategyReferenceFromUnknown(
  value: unknown,
  expectedUniverseVersion: string,
): DecisionStrategyReference | null {
  const reference = objectOrNull(value);
  const symbolSelection = objectOrNull(reference?.symbol_selection);
  const publication = objectOrNull(reference?.publication);
  const expected = buildCurrentDecisionStrategyReference(expectedUniverseVersion);

  if (
    reference?.reference_version !== expected.reference_version ||
    reference.registry_version !== expected.registry_version ||
    reference.strategy_id !== expected.strategy_id ||
    reference.strategy_version !== expected.strategy_version ||
    reference.rollback_identity !== expected.rollback_identity ||
    reference.lifecycle_status !== expected.lifecycle_status ||
    reference.direction !== expected.direction ||
    reference.signal_policy !== expected.signal_policy ||
    reference.model_dependency !== expected.model_dependency ||
    !symbolSelection ||
    symbolSelection.policy_id !== expected.symbol_selection.policy_id ||
    symbolSelection.policy_version !== expected.symbol_selection.policy_version ||
    symbolSelection.observed_universe_version !==
      expected.symbol_selection.observed_universe_version ||
    symbolSelection.default_scan_budget !==
      expected.symbol_selection.default_scan_budget ||
    symbolSelection.max_scan_budget !== expected.symbol_selection.max_scan_budget ||
    symbolSelection.coverage_claim !== expected.symbol_selection.coverage_claim ||
    !publication ||
    publication.forced_minimum !== expected.publication.forced_minimum ||
    publication.max_opportunities !== expected.publication.max_opportunities
  ) {
    return null;
  }

  return expected;
}
