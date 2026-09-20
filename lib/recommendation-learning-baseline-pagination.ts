export const RECOMMENDATION_LEARNING_BASELINE_SOURCE_MAX_ROWS = 10_000;
export const RECOMMENDATION_LEARNING_BASELINE_SOURCE_PAGE_SIZE = 1_000;

export type RecommendationLearningBaselineSourceRow = Record<string, unknown>;

export type RecommendationLearningBaselineSourcePage = {
  data: readonly RecommendationLearningBaselineSourceRow[] | null;
  error: unknown | null;
};

function stableJson(value: unknown, ancestors = new Set<object>()): string | null {
  if (value === null) return "null";

  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "boolean":
      return value ? "true" : "false";
    case "number":
      return Number.isFinite(value) ? JSON.stringify(value) : null;
    case "object":
      break;
    default:
      return null;
  }

  if (ancestors.has(value)) return null;
  ancestors.add(value);

  try {
    if (Array.isArray(value)) {
      const entries = value.map((entry) => stableJson(entry, ancestors));
      return entries.some((entry) => entry === null)
        ? null
        : `[${entries.join(",")}]`;
    }

    const record = value as Record<string, unknown>;
    const prototype = Object.getPrototypeOf(record);
    if (prototype !== Object.prototype && prototype !== null) return null;

    const entries: string[] = [];
    for (const key of Object.keys(record).sort()) {
      const entry = stableJson(record[key], ancestors);
      if (entry === null) return null;
      entries.push(`${JSON.stringify(key)}:${entry}`);
    }
    return `{${entries.join(",")}}`;
  } finally {
    ancestors.delete(value);
  }
}

/**
 * Returns true only when two complete, deterministically ordered source reads
 * contain the exact same JSON-safe records. A baseline freeze is rare enough
 * to afford this second server read: count equality alone cannot detect a
 * same-size update that occurs between paginated requests.
 */
export function recommendationLearningBaselineSourceRowsAreStable(
  firstRead: readonly RecommendationLearningBaselineSourceRow[],
  secondRead: readonly RecommendationLearningBaselineSourceRow[],
): boolean {
  return firstRead.length === secondRead.length &&
    firstRead.every((row, index) => {
      const first = stableJson(row);
      const second = stableJson(secondRead[index]);
      return first !== null && first === second;
    });
}

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
