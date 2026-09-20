import { expect, test } from "@playwright/test";

import {
  readCompleteRecommendationLearningBaselineSourcePages,
  recommendationLearningBaselineSourceRowsAreStable,
  RECOMMENDATION_LEARNING_BASELINE_SOURCE_MAX_ROWS,
  RECOMMENDATION_LEARNING_BASELINE_SOURCE_PAGE_SIZE,
} from "@/lib/recommendation-learning-baseline-pagination";

function rows(count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: `row-${index}` }));
}

test("baseline source pagination reads every deterministic page through the immutable storage bound", async () => {
  const source = rows(RECOMMENDATION_LEARNING_BASELINE_SOURCE_PAGE_SIZE * 2 + 7);
  const calls: Array<readonly [number, number]> = [];

  const result = await readCompleteRecommendationLearningBaselineSourcePages({
    expectedRowCount: source.length,
    async readPage(from, to) {
      calls.push([from, to]);
      return { data: source.slice(from, to + 1), error: null };
    },
  });

  expect(result).toEqual(source);
  expect(calls).toEqual([
    [0, 999],
    [1000, 1999],
    [2000, 2006],
  ]);
});

test("baseline source pagination fails closed on a short page, duplicate identity or a source over the storage bound", async () => {
  const shortPage = await readCompleteRecommendationLearningBaselineSourcePages({
    expectedRowCount: RECOMMENDATION_LEARNING_BASELINE_SOURCE_PAGE_SIZE + 1,
    async readPage(from, to) {
      return { data: rows(to - from), error: null };
    },
  });
  expect(shortPage).toBeNull();

  const duplicate = await readCompleteRecommendationLearningBaselineSourcePages({
    expectedRowCount: 2,
    async readPage() {
      return { data: [{ id: "same" }, { id: "same" }], error: null };
    },
  });
  expect(duplicate).toBeNull();

  let oversizedReadAttempted = false;
  const oversized = await readCompleteRecommendationLearningBaselineSourcePages({
    expectedRowCount: RECOMMENDATION_LEARNING_BASELINE_SOURCE_MAX_ROWS + 1,
    async readPage() {
      oversizedReadAttempted = true;
      return { data: [], error: null };
    },
  });
  expect(oversized).toBeNull();
  expect(oversizedReadAttempted).toBe(false);
});

test("baseline source stability rejects same-size changes during a paginated freeze read", () => {
  const firstRead = [
    {
      id: "scan-one",
      payload_json: { decision: { score: 72, reasons: ["fresh"] } },
    },
    { id: "scan-two", status: "published" },
  ];
  const equivalentSecondRead = [
    {
      payload_json: { decision: { reasons: ["fresh"], score: 72 } },
      id: "scan-one",
    },
    { status: "published", id: "scan-two" },
  ];

  expect(
    recommendationLearningBaselineSourceRowsAreStable(
      firstRead,
      equivalentSecondRead,
    ),
  ).toBe(true);
  expect(
    recommendationLearningBaselineSourceRowsAreStable(firstRead, [
      {
        id: "scan-one",
        payload_json: { decision: { score: 73, reasons: ["fresh"] } },
      },
      { id: "scan-two", status: "published" },
    ]),
  ).toBe(false);
  expect(
    recommendationLearningBaselineSourceRowsAreStable(firstRead, [
      { id: "scan-two", status: "published" },
      {
        id: "scan-one",
        payload_json: { decision: { score: 72, reasons: ["fresh"] } },
      },
    ]),
  ).toBe(false);
});
