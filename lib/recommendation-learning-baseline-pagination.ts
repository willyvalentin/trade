export const RECOMMENDATION_LEARNING_BASELINE_SOURCE_MAX_ROWS = 10_000;
export const RECOMMENDATION_LEARNING_BASELINE_SOURCE_PAGE_SIZE = 1_000;

export type RecommendationLearningBaselineSourceRow = Record<string, unknown>;

export type RecommendationLearningBaselineSourcePage = {
  data: readonly RecommendationLearningBaselineSourceRow[] | null;
  error: unknown | null;
};

/**
 * Reads one bounded, owner-scoped evidence population without relying on a
 * provider's default response-size cap. The caller must use a deterministic
 * total order and verify the count again after this read before treating the
 * result as a complete baseline source.
 */
export async function readCompleteRecommendationLearningBaselineSourcePages({
  expectedRowCount,
  readPage,
}: {
  expectedRowCount: number;
  readPage: (
    from: number,
    to: number,
  ) => PromiseLike<RecommendationLearningBaselineSourcePage>;
}): Promise<RecommendationLearningBaselineSourceRow[] | null> {
  if (
    !Number.isSafeInteger(expectedRowCount) ||
    expectedRowCount < 0 ||
    expectedRowCount > RECOMMENDATION_LEARNING_BASELINE_SOURCE_MAX_ROWS
  ) {
    return null;
  }

  const rows: RecommendationLearningBaselineSourceRow[] = [];
  const rowIds = new Set<string>();

  for (
    let from = 0;
    from < expectedRowCount;
    from += RECOMMENDATION_LEARNING_BASELINE_SOURCE_PAGE_SIZE
  ) {
    const to = Math.min(
      from + RECOMMENDATION_LEARNING_BASELINE_SOURCE_PAGE_SIZE - 1,
      expectedRowCount - 1,
    );
    const page = await readPage(from, to);
    const expectedPageLength = to - from + 1;
    if (
      page.error ||
      !Array.isArray(page.data) ||
      page.data.length !== expectedPageLength
    ) {
      return null;
    }

    for (const row of page.data) {
      if (
        typeof row !== "object" ||
        row === null ||
        Array.isArray(row) ||
        typeof row.id !== "string" ||
        row.id.length < 1 ||
        rowIds.has(row.id)
      ) {
        return null;
      }
      rowIds.add(row.id);
      rows.push(row);
    }
  }

  return rows.length === expectedRowCount && rowIds.size === expectedRowCount
    ? rows
    : null;
}
