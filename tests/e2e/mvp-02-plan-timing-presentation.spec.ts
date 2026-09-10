import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildRecommendationCardTiming } from "@/components/recommendations/recommendation-card-display-mapper";

const repositoryRoot = path.resolve(__dirname, "../..");

test.describe("MVP-02 plan timing presentation", () => {
  test("shows a known price-source timestamp and stored expiry in New York time", () => {
    const timing = buildRecommendationCardTiming({
      createdAtRaw: "2026-09-10T13:00:00.000Z",
      expiresAtRaw: "2026-09-10T14:15:00.000Z",
      planReferencePrice: {
        reference_price_provider: "Licensed market feed",
        reference_price_timestamp: "2026-09-10T13:30:00.000Z",
      },
      scanWindow: "morning_momentum",
    });

    expect(timing.sourceLabel).toBe("Licensed market feed");
    expect(timing.sourceTimestampStatus).toBe("known");
    expect(timing.sourceTimestampLabel).toContain("Sep");
    expect(timing.sourceTimestampLabel).toContain("EDT");
    expect(timing.expiryStatus).toBe("stored");
    expect(timing.expiryLabel).toContain("10:15 AM EDT");
  });

  test("labels missing source time and derives expiry only from valid recommendation data", () => {
    const timing = buildRecommendationCardTiming({
      createdAtRaw: "2026-09-10T13:00:00.000Z",
      expiresAtRaw: null,
      planReferencePrice: null,
      scanWindow: "opening",
    });

    expect(timing.sourceLabel).toBe("Not available");
    expect(timing.sourceTimestampStatus).toBe("unavailable");
    expect(timing.sourceTimestampLabel).toBe("Not available");
    expect(timing.expiryStatus).toBe("derived");
    expect(timing.expiryLabel).toContain("9:30 AM EDT");

    expect(
      buildRecommendationCardTiming({
        createdAtRaw: null,
        expiresAtRaw: "not-a-time",
        planReferencePrice: {
          reference_price_timestamp: "not-a-time",
        },
        scanWindow: null,
      }),
    ).toMatchObject({
      expiryLabel: "Not available",
      expiryStatus: "unavailable",
      sourceTimestampLabel: "Not available",
      sourceTimestampStatus: "unavailable",
    });
  });

  test("renders complete target and data-timing details before a manual trade is recorded", async () => {
    const details = await readFile(
      path.join(
        repositoryRoot,
        "components/recommendations/RecommendationDetailsModal.tsx",
      ),
      "utf8",
    );

    expect(details).toContain('title="Data Timing"');
    expect(details).toContain('label: "Target 2", value: recommendation.target2');
    expect(details).toContain('label: "Price Source"');
    expect(details).toContain('label: "Source Time"');
    expect(details).toContain('"Expires (Derived)"');
    expect(details).toContain("Revalidate this setup");
  });
});
