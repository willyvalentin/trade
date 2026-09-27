import type { RecommendationEvaluationCharterDefinition } from "@/lib/recommendation-evaluation-charter";
import { SETUP_TYPES } from "@/lib/setup-types";

export const SCANNER_CLOCK_PRIOR_SHADOW_EVALUATION_CHARTER_PROFILE_VERSION =
  "scanner_clock_prior_shadow_evaluation_charter_profile_v1" as const;

export const scannerClockPriorShadowEvaluationCharterDefinition =
  Object.freeze({
    contract_version: "recommendation_evaluation_charter_v1",
    hypothesis:
      "Removing named clock-window contributions from ranking improves same-population precision at K=3 by at least 0.03 without reducing expectancy below 0.20R or weakening calibration, coverage, reliability, cost, feasibility or concentration safeguards.",
    eligible_universe:
      "Every point-in-time US equity candidate, rejection and explicit no_trade decision admitted to the same complete Basic Free scanner opportunity set under the frozen baseline policy; stale, partial, duplicated or cross-policy evidence is excluded and reported as missing or conflicting.",
    setup_slices: [...SETUP_TYPES].sort((left, right) =>
      left.localeCompare(right)
    ),
    regime_slices: [
      "neutral",
      "risk_off",
      "risk_on",
      "unavailable_or_invalid",
    ],
    outcome_rules: {
      primary_horizon: "60m",
      diagnostic_horizons: ["15m", "30m", "60m"],
      semantics:
        "Use one owner-bound canonical 60m outcome per immutable decision after a valid entry trigger. Retain visible, research, rejected and explicit no_trade decisions in the declared population; never fabricate a return when no entry triggers, pool diagnostic horizons, or read evidence created after the decision.",
    },
    evaluation_window: {
      minimum_complete_decisions: 60,
      held_out_decision_count: 30,
      walk_forward_decision_count: 30,
    },
    thresholds: {
      minimum_precision_at_k: 0.55,
      minimum_expectancy_r: 0.2,
      maximum_calibration_error: 0.15,
      minimum_outcome_coverage: 0.9,
      maximum_missingness: 0.1,
      maximum_provider_credits_per_decision: 8,
      minimum_reliability: 0.95,
    },
    concentration_limits: {
      maximum_single_ticker_share: 0.2,
      maximum_single_sector_share: 0.35,
      maximum_single_setup_share: 0.6,
      maximum_single_regime_share: 0.7,
    },
    feasibility_inputs: {
      spread: "unavailable_disclosed",
      liquidity: "required",
      volatility: "required",
      halt_risk: "unavailable_disclosed",
      trigger_attainment: "required",
      conservative_slippage: "unavailable_disclosed",
    },
  } satisfies RecommendationEvaluationCharterDefinition);

export const scannerClockPriorShadowEvaluationCharterAuthority = Object.freeze({
  can_request_provider_data: false,
  can_reserve_provider_credits: false,
  can_change_ranking_or_publication: false,
  can_promote_policy: false,
  can_publish_candidate: false,
  can_create_paper_position: false,
  can_execute_broker_action: false,
});
