import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("dashboard preserves full quality evidence while bounding heavy read concurrency", () => {
  const source = readFileSync(
    join(root, "lib/server/application-data-access.ts"),
    "utf8",
  );
  const heavyReadComment = source.indexOf(
    "These four readbacks contain large, durable JSON evidence",
  );
  const scanRunRead = source.indexOf('.from("recommendation_scan_runs")', heavyReadComment);
  const batchRead = source.indexOf('.from("recommendation_batches")', heavyReadComment);
  const snapshotRead = source.indexOf('.from("recommendation_snapshots")', heavyReadComment);
  const outcomeRead = source.indexOf('.from("recommendation_outcomes")', heavyReadComment);

  expect(heavyReadComment).toBeGreaterThan(-1);
  expect(scanRunRead).toBeGreaterThan(heavyReadComment);
  expect(batchRead).toBeGreaterThan(scanRunRead);
  expect(snapshotRead).toBeGreaterThan(batchRead);
  expect(outcomeRead).toBeGreaterThan(snapshotRead);
  expect(source.slice(batchRead, snapshotRead)).toContain("]);");
  expect(source).toContain("RECENT_RECOMMENDATION_SNAPSHOTS_READ_LIMIT");
  expect(source).toContain("RECENT_RECOMMENDATION_OUTCOMES_READ_LIMIT");
});

test("migration indexes the two reproduced timeout query shapes", () => {
  const migration = readFileSync(
    join(
      root,
      "supabase/migrations/20260929012000_dashboard_evidence_readback_performance.sql",
    ),
    "utf8",
  );

  expect(migration).toContain(
    "recommendation_batches_owner_published_at_nulls_last_idx",
  );
  expect(migration).toContain("published_at desc nulls last");
  expect(migration).toContain(
    "scheduled_scan_attempts_observation_series_latest_idx",
  );
  expect(migration).toContain(
    "scheduled_function_fired_at desc nulls last",
  );
  expect(migration).toContain("observation_series_control_v1");
  expect(migration).not.toMatch(/insert|update|delete|truncate/i);
});
