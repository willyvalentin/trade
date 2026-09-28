import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  checkRecommendationLearningSchema,
  recommendationLearningTables,
} from "@/lib/recommendation-learning-schema";

test("starts every read-only schema probe concurrently and reports in contract order", async () => {
  const started: string[] = [];
  const releases = new Map<
    string,
    (result: { error?: unknown }) => void
  >();
  const client = {
    from: (table: string) => ({
      select: () => ({
        limit: () =>
          new Promise<{ error?: unknown }>((resolve) => {
            started.push(table);
            releases.set(table, resolve);
          }),
      }),
    }),
  };

  const pending = checkRecommendationLearningSchema({
    supabaseClient: client,
  });
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(started).toEqual([...recommendationLearningTables]);
  for (const table of recommendationLearningTables) {
    releases.get(table)?.({});
  }

  await expect(pending).resolves.toMatchObject({
    schema_ready: true,
    existing_tables: [...recommendationLearningTables],
    missing_tables: [],
    last_schema_error: null,
  });
});

test("overlaps schema readiness with expiration housekeeping before generation", () => {
  const source = readFileSync(
    resolve(process.cwd(), "app/api/automation/run-scan/route.ts"),
    "utf8",
  );
  const start = source.indexOf(
    "const [schemaCheck, expiredRecommendationsResult] = await Promise.all([",
  );
  const end = source.indexOf("activeScanTrace.updateSchemaCheck(schemaCheck);", start);
  const preGenerationPreflight = source.slice(start, end);

  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  expect(preGenerationPreflight).toContain("checkRecommendationLearningSchema({");
  expect(preGenerationPreflight).toContain(
    "archiveExpiredRecommendations(ownerUserId)",
  );
});
