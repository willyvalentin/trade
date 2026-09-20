import { expect, test } from "@playwright/test";

import {
  buildRecommendationSourceObservationIntegrityReceipt,
  recommendationSourceObservationIntegrityReceiptFromUnknown,
} from "@/lib/recommendation-source-observation-integrity";

const RECEIPT_AT = "2026-09-20T14:30:00.000Z";

function completePayload(overrides: Record<string, unknown> = {}) {
  return {
    source_observation_time_band: "regular",
    source_observation_integrity_policy_version:
      "recommendation_source_observation_integrity_policy_v1",
    source_maximum_upstream_age_seconds: 120,
    source_maximum_response_latency_seconds: 10,
    source_expected_record_count: 500,
    source_observed_record_count: 500,
    source_upstream_timestamp: "2026-09-20T14:29:00.000Z",
    source_request_started_at: "2026-09-20T14:29:01.000Z",
    source_response_received_at: "2026-09-20T14:29:03.000Z",
    ...overrides,
  };
}

function receipt(payload: Record<string, unknown>) {
  return buildRecommendationSourceObservationIntegrityReceipt({
    payload,
    receiptTimestamp: RECEIPT_AT,
  });
}

test.describe("recommendation source observation integrity receipts", () => {
  test("records a complete accepted regular-session observation only from explicit facts", () => {
    expect(receipt(completePayload())).toMatchObject({
      receipt_kind: "recommendation_source_observation_integrity",
      status: "complete",
      quality_disposition: "accepted",
      observation_time_band: "regular",
      upstream_age_seconds: 60,
      response_latency_seconds: 2,
      blockers: [],
      can_change_ranking_or_publication: false,
    });
  });

  test("labels incomplete coverage as partial rather than accepting a claimed success", () => {
    const integrityReceipt = receipt(
      completePayload({ source_observed_record_count: 499 }),
    );

    expect(integrityReceipt).toMatchObject({
      status: "complete",
      quality_disposition: "partial",
      blockers: ["observed_coverage_below_expected"],
    });
  });

  test("labels over-age source data stale and slow responses delayed", () => {
    expect(
      receipt(
        completePayload({
          source_upstream_timestamp: "2026-09-20T14:27:59.000Z",
        }),
      ),
    ).toMatchObject({
      status: "complete",
      quality_disposition: "stale",
      blockers: ["upstream_age_exceeds_policy"],
    });
    expect(
      receipt(
        completePayload({
          source_response_received_at: "2026-09-20T14:29:12.000Z",
        }),
      ),
    ).toMatchObject({
      status: "complete",
      quality_disposition: "delayed",
      blockers: ["response_latency_exceeds_policy"],
    });
  });

  test("treats contradictory timestamps and over-coverage as ambiguous", () => {
    expect(
      receipt(
        completePayload({
          source_request_started_at: "2026-09-20T14:29:04.000Z",
          source_response_received_at: "2026-09-20T14:29:03.000Z",
        }),
      ),
    ).toMatchObject({
      status: "incomplete",
      quality_disposition: "ambiguous",
      blockers: ["request_started_after_response"],
    });
    expect(
      receipt(completePayload({ source_observed_record_count: 501 })),
    ).toMatchObject({
      status: "complete",
      quality_disposition: "ambiguous",
      blockers: ["observed_coverage_exceeds_expected"],
    });
  });

  test("does not invent an accepted observation when source facts are absent", () => {
    expect(receipt({})).toMatchObject({
      status: "unavailable",
      quality_disposition: "unavailable",
      blockers: ["source_observation_not_recorded"],
    });
  });

  test("rejects a stored receipt whose derived quality or timestamps were forged", () => {
    const accepted = receipt(completePayload());

    expect(
      recommendationSourceObservationIntegrityReceiptFromUnknown({
        ...accepted,
        quality_disposition: "stale",
      }),
    ).toBeNull();
    expect(
      recommendationSourceObservationIntegrityReceiptFromUnknown({
        ...accepted,
        upstream_age_seconds: 1,
      }),
    ).toBeNull();
    expect(
      recommendationSourceObservationIntegrityReceiptFromUnknown({
        ...accepted,
        observation_time_band: "unrecognized_band",
      }),
    ).toBeNull();
  });
});
