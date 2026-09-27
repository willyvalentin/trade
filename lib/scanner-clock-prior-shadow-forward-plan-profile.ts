export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_PLAN_PROFILE_VERSION =
  "scanner_clock_prior_shadow_forward_plan_profile_v1" as const;

export const scannerClockPriorShadowForwardPlanProfile = Object.freeze({
  primary_k: 3 as const,
  windows: Object.freeze({
    held_out: Object.freeze({
      start_at: "2026-09-28T13:30:00.000Z",
      end_at: "2026-10-10T00:00:00.000Z",
      minimum_opportunity_sets: 30,
      minimum_ranked_candidates: 30,
      minimum_trading_days: 8,
    }),
    walk_forward: Object.freeze({
      start_at: "2026-10-12T13:30:00.000Z",
      end_at: "2026-10-24T00:00:00.000Z",
      minimum_opportunity_sets: 30,
      minimum_ranked_candidates: 30,
      minimum_trading_days: 8,
    }),
  }),
  thresholds: Object.freeze({
    continue_minimum_precision_delta: 0.03,
    reject_maximum_precision_delta: 0,
  }),
});
