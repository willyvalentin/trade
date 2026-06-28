export const RECENT_RECOMMENDATION_SNAPSHOTS_READ_LIMIT = 100;
export const RECENT_RECOMMENDATION_OUTCOMES_READ_LIMIT = 100;

export type RecentRecommendationReadbackFallbackSource =
  | "local_storage"
  | "previous_state";

export type RecentRecommendationReadbackFallback<T> = {
  items: T[];
  source: RecentRecommendationReadbackFallbackSource;
};

export function resolveRecentRecommendationReadbackFailure<T>(input: {
  isInitialLoad: boolean;
  localItems: T[];
  previousItems: T[];
}): RecentRecommendationReadbackFallback<T> {
  if (input.isInitialLoad) {
    return {
      items: input.localItems,
      source: "local_storage",
    };
  }

  return {
    items: input.previousItems,
    source: "previous_state",
  };
}

export const RECENT_RECOMMENDATION_READBACK_STABILIZATION_BOUNDARY = {
  readOnly: true,
  manualSupabaseCall: false,
  serviceRoleAdapterCall: false,
  providerCall: false,
  scanRouteInvocation: false,
  brokerOrAvanzaBehavior: false,
  automaticOrderBehavior: false,
} as const;
