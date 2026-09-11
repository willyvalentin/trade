import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test.describe("MVP-01 dashboard states", () => {
  test("keeps loading, unavailable data, and an honest empty state distinct", async () => {
    const recommendationsTab = await source(
      "components/recommendations/RecommendationsTab.tsx",
    );

    expect(recommendationsTab).toContain("function RecommendationSkeletonCard");
    expect(recommendationsTab).toContain("isLoading ? (");
    expect(recommendationsTab).toContain(") : loadError ? (");
    expect(recommendationsTab).toContain('role="alert"');
    expect(recommendationsTab).toContain(
      "Recommendations are temporarily unavailable",
    );
    expect(recommendationsTab).toContain("No current setup is");
    expect(recommendationsTab).toContain(
      "shown, so wait for a successful refresh before making a manual trade.",
    );
    expect(recommendationsTab).toContain("TRY AGAIN");
    expect(recommendationsTab).toContain(") : emptyState.show ? (");
  });

  test("only presents the unavailable state when no successful recommendation read exists", async () => {
    const tradeApp = await source("app/trade-app.tsx");

    expect(tradeApp).toContain("const recommendationLoadError =");
    expect(tradeApp).toContain("recommendationsStatusUpdatedAt === null");
    expect(tradeApp).toContain("? islandRefreshState.recommendations.error");
    expect(tradeApp).toContain("loadError={recommendationLoadError}");
    expect(tradeApp).toContain(
      'void refreshIslands(["market_status", "recommendations"], "manual")',
    );
    expect(tradeApp).toContain(
      '{updatedAt ? "Refresh issue" : "Data unavailable"}',
    );
    expect(tradeApp).toContain(
      '{updatedAt ? "Previous data kept" : "No current data shown"}',
    );
  });

  test("keeps the temporary staging probe diagnosis authenticated and values-free", async () => {
    const route = await source("app/api/app/dashboard/probe-readiness/route.ts");

    expect(route).toContain("requireApplicationSession");
    expect(route).toContain("applicationSessionUnauthorizedResponse");
    expect(route).toContain("process.env.SITE_ID");
    expect(route).toContain(
      "process.env.MVP_01C_STAGING_DASHBOARD_FAILURE_PROBE === \"enabled\"",
    );
    expect(route).toContain("values_returned: false");
    expect(route).not.toContain("process.env.MVP_01C_STAGING_DASHBOARD_FAILURE_PROBE,");
  });
});
