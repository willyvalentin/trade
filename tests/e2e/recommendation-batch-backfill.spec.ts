import { expect, test } from "@playwright/test";

import {
  buildRecommendationBatchBackfillChunks,
  fetchChunkedRecommendationBatchBackfillRows,
  MAX_RECOMMENDATION_BATCH_BACKFILL_FINGERPRINTS,
  RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE,
  RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP,
} from "../../lib/recommendation-batch-backfill";

test.describe("recommendation batch scan-run backfill chunking", () => {
  test("does not query when there are no missing fingerprints", async () => {
    const queriedChunks: string[][] = [];

    const result = await fetchChunkedRecommendationBatchBackfillRows(
      [],
      async (chunk) => {
        queriedChunks.push([...chunk]);
        return { data: chunk };
      },
    );

    expect(result.ok).toBe(true);
    expect(result.chunks).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(result.backfillSkipped).toBe(false);
    expect(queriedChunks).toEqual([]);
  });

  test("queries once when missing fingerprints fit in one bounded chunk", async () => {
    const queriedChunks: string[][] = [];

    const result = await fetchChunkedRecommendationBatchBackfillRows(
      ["scan-a", "scan-b"],
      async (chunk) => {
        queriedChunks.push([...chunk]);
        return {
          data: chunk.map((fingerprint) => ({
            batch_fingerprint: `batch-${fingerprint}`,
            scan_run_fingerprint: fingerprint,
          })),
        };
      },
    );

    expect(result.ok).toBe(true);
    expect(result.backfillSkipped).toBe(false);
    expect(result.chunks).toEqual([["scan-a", "scan-b"]]);
    expect(queriedChunks).toEqual([["scan-a", "scan-b"]]);
    expect(result.rows).toEqual([
      { batch_fingerprint: "batch-scan-a", scan_run_fingerprint: "scan-a" },
      { batch_fingerprint: "batch-scan-b", scan_run_fingerprint: "scan-b" },
    ]);
  });

  test("queries multiple bounded chunks for large missing fingerprint lists", async () => {
    const fingerprints = Array.from(
      { length: RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE + 3 },
      (_, index) => `scan-${index}`,
    );
    const queriedChunks: string[][] = [];

    const result = await fetchChunkedRecommendationBatchBackfillRows(
      fingerprints,
      async (chunk) => {
        queriedChunks.push([...chunk]);
        return { data: chunk.map((fingerprint) => ({ fingerprint })) };
      },
    );

    expect(result.ok).toBe(true);
    expect(result.backfillSkipped).toBe(false);
    expect(result.chunks).toHaveLength(2);
    expect(result.chunks[0]).toHaveLength(
      RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE,
    );
    expect(result.chunks[1]).toHaveLength(3);
    expect(queriedChunks).toEqual(result.chunks);
    expect(result.rows).toHaveLength(fingerprints.length);
    expect(result.rows.at(0)).toEqual({ fingerprint: "scan-0" });
    expect(result.rows.at(-1)).toEqual({
      fingerprint: `scan-${fingerprints.length - 1}`,
    });
  });

  test("splits 20 missing fingerprints into four conservative chunks", async () => {
    const fingerprints = Array.from(
      { length: MAX_RECOMMENDATION_BATCH_BACKFILL_FINGERPRINTS },
      (_, index) => `scan-${index}`,
    );
    const queriedChunks: string[][] = [];

    const result = await fetchChunkedRecommendationBatchBackfillRows(
      fingerprints,
      async (chunk) => {
        queriedChunks.push([...chunk]);
        return { data: chunk.map((fingerprint) => ({ fingerprint })) };
      },
    );

    expect(RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE).toBe(5);
    expect(MAX_RECOMMENDATION_BATCH_BACKFILL_FINGERPRINTS).toBe(20);
    expect(result.ok).toBe(true);
    expect(result.backfillSkipped).toBe(false);
    expect(result.chunks).toHaveLength(4);
    expect(result.chunks.every((chunk) => chunk.length === 5)).toBe(true);
    expect(queriedChunks).toEqual(result.chunks);
    expect(result.rows).toHaveLength(20);
  });

  test("skips oversized missing fingerprint lists before querying", async () => {
    const fingerprints = Array.from(
      { length: RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP + 4 },
      (_, index) => `scan-${index}`,
    );
    const queriedFingerprints: string[] = [];

    const result = await fetchChunkedRecommendationBatchBackfillRows(
      fingerprints,
      async (chunk) => {
        queriedFingerprints.push(...chunk);
        return { data: chunk };
      },
    );

    expect(result.ok).toBe(true);
    expect(result.requestedFingerprintCount).toBe(
      RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP + 4,
    );
    expect(result.cappedFingerprintCount).toBe(0);
    expect(result.fingerprintsCapped).toBe(true);
    expect(result.backfillSkipped).toBe(true);
    expect(result.chunks).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(queriedFingerprints).toEqual([]);
  });

  test("skip metadata stays count-only for oversized lists", () => {
    const plan = buildRecommendationBatchBackfillChunks([
      "scan-a",
      "scan-b",
      ...Array.from(
        { length: RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP },
        (_, index) => `scan-extra-${index}`,
      ),
    ]);

    expect(plan.requestedFingerprintCount).toBe(
      RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP + 2,
    );
    expect(plan.cappedFingerprintCount).toBe(0);
    expect(plan.cap).toBe(RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP);
    expect(plan.chunkSize).toBe(RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE);
    expect(plan.fingerprintsCapped).toBe(true);
    expect(plan.backfillSkipped).toBe(true);
    expect(plan.chunks).toEqual([]);
  });

  test("normalizes and de-duplicates fingerprints while preserving first-seen order", () => {
    const plan = buildRecommendationBatchBackfillChunks([
      " scan-a ",
      "",
      "scan-b",
      "scan-a",
      "   ",
      "scan-c",
    ]);

    expect(plan.requestedFingerprintCount).toBe(3);
    expect(plan.backfillSkipped).toBe(false);
    expect(plan.chunks).toEqual([["scan-a", "scan-b", "scan-c"]]);
  });

  test("returns no partial rows when a chunk fails", async () => {
    const error = new Error("chunk failed");
    const result = await fetchChunkedRecommendationBatchBackfillRows(
      ["scan-a", "scan-b", "scan-c"],
      async (chunk, index) =>
        index === 0 ? { data: chunk.map((fingerprint) => ({ fingerprint })) } : { error },
      { chunkSize: 2 },
    );

    expect(result.ok).toBe(false);
    expect(result.backfillSkipped).toBe(false);
    expect(result.error).toBe(error);
    expect(result.rows).toEqual([]);
  });

  test("helper module stays dependency-free and client-safe", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(
      "lib/recommendation-batch-backfill.ts",
      "utf8",
    );

    expect(source).not.toContain("server-only");
    expect(source).not.toContain("@supabase/");
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("SERVICE_ROLE");
    expect(source).not.toContain("fetch(");
  });
});
