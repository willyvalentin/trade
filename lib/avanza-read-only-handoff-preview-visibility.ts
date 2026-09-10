type ReadOnlyHandoffPreviewVisibilityInput = {
  activeDashboardTab: string | null;
  hasSelectedRecommendationPreview: boolean;
  showDominantRecommendationEmptyState: boolean;
};

/**
 * Static handoff fixtures are useful only in an explicitly admitted preview.
 * They must never compete with a truthful customer-facing no-trade state.
 */
export function shouldRenderReadOnlyHandoffPreviewInDashboard({
  activeDashboardTab,
  hasSelectedRecommendationPreview,
  showDominantRecommendationEmptyState,
}: ReadOnlyHandoffPreviewVisibilityInput) {
  return (
    activeDashboardTab === "Recommendations" &&
    hasSelectedRecommendationPreview &&
    !showDominantRecommendationEmptyState
  );
}
