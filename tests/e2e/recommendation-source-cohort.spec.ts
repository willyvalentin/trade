import { expect, test } from "@playwright/test";

import {
  buildRecommendationSourceCohortProvenance,
  buildRecommendationSourceCohortReceipt,
  recommendationSourceCohortReceiptFromUnknown,
} from "@/lib/recommendation-source-cohort";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";

const RECORDED_AT = "2026-09-20T14:30:00.000Z";

function completeSourcePayload(overrides: Record<string, unknown> = {}) {
  return {
    provider_source: "twelve_data",
    market_data_source: "twelve_data",
    source_feed_class: "us_equities_intraday_indicators",
    provider_plan_profile_mode: "basic_free_configured",
    observed_provider_entitlement_profile: "basic_free_observed",
    source_coverage_scope: "us_equities:one_minute:eligible_universe",
    data_timestamp: "2026-09-20T14:29:00.000Z",
    provider_response_id: "response-identity-test-v1",
    market_data_adapter_version: "automation_scan_market_data_adapter_v1",
    build_marker: "test-build-marker-v1",
    source_request_cost_credits: 1,
    source_response_quality_disposition: "accepted",
    ...overrides,
  };
}

function snapshotFromPayload(payload: Record<string, unknown>) {
  return buildRecommendationSnapshot({
    ticker: "TST",
    recommended_at: RECORDED_AT,
    app_timestamp: RECORDED_AT,
    created_at: RECORDED_AT,
    entry: 100,
    stop: 96,
    target: 108,
    side: "long",
    payload,
  });
}

test.describe("recommendation source cohorts", () => {
  test("records a vendor-neutral complete cohort without granting ranking or publication authority", () => {
    const receipt = buildRecommendationSourceCohortReceipt({
      payload: completeSourcePayload(),
      receiptTimestamp: RECORDED_AT,
    });

    expect(receipt).toMatchObject({
      receipt_kind: "recommendation_source_cohort",
      status: "complete",
      provider_source: "twelve_data",
      feed_class: "us_equities_intraday_indicators",
      configured_entitlement_profile: "basic_free_configured",
      observed_entitlement_profile: "basic_free_observed",
      coverage_scope: "us_equities:one_minute:eligible_universe",
      request_cost_credits: 1,
      response_quality_disposition: "accepted",
      blockers: [],
      can_change_ranking_or_publication: false,
    });
    expect(receipt.cohort_key).toContain("basic_free_observed");
  });

  test("does not infer feed, observed entitlement, cost, or response quality from adjacent source fields", () => {
    const receipt = buildRecommendationSourceCohortReceipt({
      payload: {
        provider_source: "twelve_data",
        market_data_source: "twelve_data",
        provider_plan_profile_mode: "basic_free_configured",
        data_timestamp: "2026-09-20T14:29:00.000Z",
        market_data_adapter_version: "automation_scan_market_data_adapter_v1",
        build_marker: "test-build-marker-v1",
      },
      receiptTimestamp: RECORDED_AT,
    });

    expect(receipt).toMatchObject({
      status: "incomplete",
      cohort_key: null,
      configured_entitlement_profile: "basic_free_configured",
      observed_entitlement_profile: null,
      request_cost_credits: null,
      response_quality_disposition: null,
    });
    expect(receipt.blockers).toEqual(expect.arrayContaining([
      "feed_class_missing",
      "observed_entitlement_profile_missing",
      "coverage_scope_missing",
      "request_cost_credits_missing_or_invalid",
      "response_quality_disposition_missing_or_invalid",
    ]));
  });

  test("keeps a source timestamp after its receipt out of a complete cohort", () => {
    const receipt = buildRecommendationSourceCohortReceipt({
      payload: completeSourcePayload({
        data_timestamp: "2026-09-20T14:31:00.000Z",
      }),
      receiptTimestamp: RECORDED_AT,
    });

    expect(receipt).toMatchObject({ status: "incomplete" });
    expect(receipt.blockers).toContain("upstream_timestamp_after_receipt");
  });

  test("persists a truthful unavailable receipt when a snapshot contains no source facts", () => {
    const snapshot = snapshotFromPayload({ confidence_label: "high" });
    const receipt = recommendationSourceCohortReceiptFromUnknown(
      snapshot.payload_json.source_cohort_receipt,
    );

    expect(receipt).toMatchObject({
      status: "unavailable",
      cohort_key: null,
      blockers: ["source_metadata_not_recorded"],
      can_change_ranking_or_publication: false,
    });
  });

  test("rejects a stored receipt that changes source facts without updating its cohort identity", () => {
    const receipt = buildRecommendationSourceCohortReceipt({
      payload: completeSourcePayload(),
      receiptTimestamp: RECORDED_AT,
    });
    const forged = {
      ...receipt,
      observed_entitlement_profile: "different_observed_entitlement",
    };

    expect(recommendationSourceCohortReceiptFromUnknown(forged)).toBeNull();
  });

  test("keeps incomplete, missing, and mixed source cohorts out of one baseline population", () => {
    const complete = snapshotFromPayload(completeSourcePayload());
    const incomplete = snapshotFromPayload(
      completeSourcePayload({ source_request_cost_credits: undefined }),
    );
    const changedSource = snapshotFromPayload(
      completeSourcePayload({
        provider_source: "future_provider",
        market_data_source: "future_provider",
      }),
    );

    expect(buildRecommendationSourceCohortProvenance([
      complete,
      incomplete,
    ])).toMatchObject({
      status: "incomplete",
      complete_receipt_count: 1,
      incomplete_receipt_count: 1,
    });
    expect(buildRecommendationSourceCohortProvenance([
      complete,
      changedSource,
    ])).toMatchObject({
      status: "mixed",
      complete_receipt_count: 2,
      cohort_keys: expect.any(Array),
    });
    expect(buildRecommendationSourceCohortProvenance([
      { ...complete, payload_json: {} },
    ])).toMatchObject({
      status: "not_recorded",
      missing_receipt_count: 1,
    });
  });
});
