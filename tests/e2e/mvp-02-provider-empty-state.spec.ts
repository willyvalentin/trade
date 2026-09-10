import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { shouldRenderReadOnlyHandoffPreviewInDashboard } from "../../lib/avanza-read-only-handoff-preview-visibility";
import { buildRecommendationEmptyStateSummary } from "../../lib/recommendation-empty-state";
import { buildScanPipelineObservabilitySummary } from "../../lib/scan-pipeline-observability";

const observedAt = "2026-09-10T14:05:00.000Z";
const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function observabilityForLatestScan(result: string) {
  return buildScanPipelineObservabilitySummary({
    visible_recommendations: [],
    intake_results: [],
    scan_logs: [
      {
        created_at: observedAt,
        result,
        candidates_scanned: 12,
        pre_market_candidates: [],
      },
    ],
    market_session: { phase: "regular", risk_level: "low" },
    now: observedAt,
  });
}

function emptyStateForLatestScan(result: string) {
  return buildRecommendationEmptyStateSummary({
    visible_recommendations: [],
    intake_results: [],
    observability_summary: observabilityForLatestScan(result),
    market_session: {
      phase: "regular",
      risk_level: "low",
      market_is_open: true,
    },
    has_refresh_control: true,
    now: observedAt,
  });
}

test("MVP-02 surfaces the latest provider failure instead of a generic no-trade state", () => {
  const unavailable = emptyStateForLatestScan("provider_error");
  const rateLimited = emptyStateForLatestScan("provider_rate_limited");

  expect(unavailable).toMatchObject({
    status: "provider_unavailable",
    title: "Market data provider is unavailable",
    primary_reason: {
      reason_id: "provider_unavailable",
      label: "Provider unavailable",
    },
  });
  expect(unavailable.body).toContain("not presenting a guessed or stale setup");
  expect(rateLimited.primary_reason).toMatchObject({
    reason_id: "provider_rate_limited",
    label: "Provider rate limit reached",
  });
  expect(unavailable.suggested_actions).toContainEqual({
    action_id: "reload_dashboard_data",
    label: "Reload dashboard data",
    message:
      "Use the existing Recommendations refresh control to reload the latest dashboard state. It does not create a new scan.",
    priority: "secondary",
  });
});

test("MVP-02 keeps a completed no-high-quality scan distinct from optional diagnostic gaps", () => {
  const observability = observabilityForLatestScan("no_high_quality_setup");
  const emptyState = buildRecommendationEmptyStateSummary({
    visible_recommendations: [],
    intake_results: [],
    observability_summary: observability,
    market_session: {
      phase: "regular",
      risk_level: "low",
      market_is_open: true,
    },
    now: observedAt,
  });

  expect(observability.unknown_metrics).toContain("scan duration");
  expect(emptyState).toMatchObject({
    status: "no_high_quality_setups",
    title: "No high-quality setups right now",
    primary_reason: {
      reason_id: "no_high_quality_setup",
      label: "No high-quality setups",
    },
  });
});

test("MVP-02 still treats an absent scan as unavailable data", () => {
  const observability = buildScanPipelineObservabilitySummary({
    visible_recommendations: [],
    intake_results: [],
    market_session: { phase: "regular", risk_level: "low" },
    now: observedAt,
  });
  const emptyState = buildRecommendationEmptyStateSummary({
    visible_recommendations: [],
    intake_results: [],
    observability_summary: observability,
    market_session: {
      phase: "regular",
      risk_level: "low",
      market_is_open: true,
    },
    now: observedAt,
  });

  expect(observability.status).toBe("unknown");
  expect(emptyState.status).toBe("data_unavailable");
});

test("MVP-02 never turns an unclassified completed scan into a no-trade claim", () => {
  const emptyState = emptyStateForLatestScan("unknown");

  expect(emptyState).toMatchObject({
    status: "data_unavailable",
    primary_reason: {
      reason_id: "source_data_unavailable",
    },
  });
});

test("MVP-02 explains a closed market and tells the user to wait for the regular session", () => {
  const emptyState = buildRecommendationEmptyStateSummary({
    visible_recommendations: [],
    intake_results: [],
    observability_summary: observabilityForLatestScan("no_high_quality_setup"),
    market_session: {
      phase: "closed",
      risk_level: "low",
      market_is_open: false,
    },
    has_refresh_control: true,
    now: observedAt,
  });

  expect(emptyState).toMatchObject({
    status: "market_not_ideal",
    primary_reason: {
      reason_id: "market_session_not_ideal",
      message: "Current session is closed with low risk.",
    },
    market_session_note: "Current session: closed / low risk.",
  });
  expect(emptyState.suggested_actions).toContainEqual({
    action_id: "wait_for_regular_session",
    label: "Wait for regular session",
    message: "Let the regular intraday window reopen before forcing a new idea.",
    priority: "secondary",
  });
});

test("MVP-02 treats closing-soon and holiday sessions as inactive", () => {
  for (const phase of ["closing_soon", "holiday"] as const) {
    const emptyState = buildRecommendationEmptyStateSummary({
      visible_recommendations: [],
      intake_results: [],
      observability_summary: observabilityForLatestScan("no_high_quality_setup"),
      market_session: {
        phase,
        risk_level: "low",
        market_is_open: false,
      },
      now: observedAt,
    });

    expect(emptyState.status).toBe("market_not_ideal");
    expect(emptyState.suggested_actions).toContainEqual(
      expect.objectContaining({ action_id: "wait_for_regular_session" }),
    );
  }
});

test("MVP-02 does not tell the user to wait for an already-open regular session", () => {
  const emptyState = buildRecommendationEmptyStateSummary({
    visible_recommendations: [],
    intake_results: [],
    observability_summary: observabilityForLatestScan("no_high_quality_setup"),
    market_session: {
      phase: "regular",
      risk_level: "high",
      market_is_open: true,
    },
    now: observedAt,
  });

  expect(emptyState.status).toBe("market_not_ideal");
  expect(emptyState.suggested_actions).not.toContainEqual(
    expect.objectContaining({ action_id: "wait_for_regular_session" }),
  );
});

test("MVP-02 keeps a static handoff fixture out of a no-trade dashboard", async () => {
  expect(
    shouldRenderReadOnlyHandoffPreviewInDashboard({
      activeDashboardTab: "Recommendations",
      hasSelectedRecommendationPreview: false,
      showDominantRecommendationEmptyState: false,
    }),
  ).toBe(false);
  expect(
    shouldRenderReadOnlyHandoffPreviewInDashboard({
      activeDashboardTab: "Recommendations",
      hasSelectedRecommendationPreview: true,
      showDominantRecommendationEmptyState: true,
    }),
  ).toBe(false);
  expect(
    shouldRenderReadOnlyHandoffPreviewInDashboard({
      activeDashboardTab: "Live Day Trades",
      hasSelectedRecommendationPreview: true,
      showDominantRecommendationEmptyState: false,
    }),
  ).toBe(false);
  expect(
    shouldRenderReadOnlyHandoffPreviewInDashboard({
      activeDashboardTab: "Recommendations",
      hasSelectedRecommendationPreview: true,
      showDominantRecommendationEmptyState: false,
    }),
  ).toBe(true);

  const tradeApp = await source("app/trade-app.tsx");
  expect(tradeApp).toContain("const shouldRenderAvanzaHandoffPreview =");
  expect(tradeApp).toContain("shouldRenderReadOnlyHandoffPreviewInDashboard({");
  expect(tradeApp).toContain("{shouldRenderAvanzaHandoffPreview && (");
});
