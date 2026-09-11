import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  applicationDashboardReadPath,
  isMvp01cStagingDashboardFailureProbe,
  mvp01cDashboardFailureProbeEnvironmentVariable,
  mvp01cDashboardFailureProbeQueryParameter,
  mvp01cDashboardFailureProbeQueryValue,
} from "../../lib/application-dashboard-failure-probe";
import {
  applicationCanonicalProductionOrigin,
  applicationCanonicalStagingOrigin,
} from "../../lib/application-platform-contract";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test.describe("MVP-01 dashboard states", () => {
  test("limits the controlled failed-first-read probe to the enabled dedicated staging host", () => {
    const stagingEnvironment = {
      NODE_ENV: "production",
      TURE_APPLICATION_ORIGIN: applicationCanonicalStagingOrigin,
      URL: applicationCanonicalStagingOrigin,
      [mvp01cDashboardFailureProbeEnvironmentVariable]: "enabled",
    };
    const failureSearch = `?${mvp01cDashboardFailureProbeQueryParameter}=${mvp01cDashboardFailureProbeQueryValue}`;
    const stagingRequest = new Request(
      `${applicationCanonicalStagingOrigin}/api/app/dashboard${failureSearch}`,
    );

    expect(
      isMvp01cStagingDashboardFailureProbe(stagingRequest, stagingEnvironment),
    ).toBe(true);
    expect(
      isMvp01cStagingDashboardFailureProbe(stagingRequest, {
        ...stagingEnvironment,
        [mvp01cDashboardFailureProbeEnvironmentVariable]: undefined,
      }),
    ).toBe(false);
    expect(
      isMvp01cStagingDashboardFailureProbe(
        new Request(
          `${applicationCanonicalProductionOrigin}/api/app/dashboard${failureSearch}`,
        ),
        {
          ...stagingEnvironment,
          TURE_APPLICATION_ORIGIN: applicationCanonicalProductionOrigin,
          URL: applicationCanonicalProductionOrigin,
        },
      ),
    ).toBe(false);
    expect(
      isMvp01cStagingDashboardFailureProbe(
        new Request(`${applicationCanonicalStagingOrigin}/api/app/dashboard`),
        stagingEnvironment,
      ),
    ).toBe(false);
  });

  test("adds the probe request only for the exact staging URL selected by the browser", () => {
    const failureSearch = `?${mvp01cDashboardFailureProbeQueryParameter}=${mvp01cDashboardFailureProbeQueryValue}`;

    expect(
      applicationDashboardReadPath({
        origin: applicationCanonicalStagingOrigin,
        search: failureSearch,
      }),
    ).toBe(`/api/app/dashboard${failureSearch}`);
    expect(
      applicationDashboardReadPath({
        origin: applicationCanonicalProductionOrigin,
        search: failureSearch,
      }),
    ).toBe("/api/app/dashboard");
    expect(
      applicationDashboardReadPath({
        origin: applicationCanonicalStagingOrigin,
        search: "",
      }),
    ).toBe("/api/app/dashboard");
  });

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
});
