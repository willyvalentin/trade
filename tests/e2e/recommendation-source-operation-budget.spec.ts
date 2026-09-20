import { expect, test } from "@playwright/test";

import {
  buildRecommendationSourceOperationBudgetReceipt,
  recommendationSourceOperationBudgetReceiptFromUnknown,
} from "@/lib/recommendation-source-operation-budget";

const RECEIPT_AT = "2026-09-20T14:30:00.000Z";

function completePayload(overrides: Record<string, unknown> = {}) {
  return {
    source_operation_time_band: "regular",
    source_operation_budget_policy_version:
      "recommendation_source_operation_budget_policy_v1",
    source_operation_time_band_credit_budget: 100,
    source_operation_committed_credits_before_operation: 60,
    source_operation_cost_credits: 5,
    source_operation_reserved_retry_credits: 10,
    source_operation_maximum_attempt_count: 3,
    source_operation_attempt_number: 1,
    source_operation_backoff_until: null,
    ...overrides,
  };
}

function receipt(payload: Record<string, unknown>) {
  return buildRecommendationSourceOperationBudgetReceipt({
    payload,
    receiptTimestamp: RECEIPT_AT,
  });
}

test.describe("recommendation source operation budget receipts", () => {
  test("records explicit time-band capacity and retry headroom without authorizing a request", () => {
    expect(receipt(completePayload())).toMatchObject({
      receipt_kind: "recommendation_source_operation_budget",
      status: "complete",
      operation_disposition: "planned_within_budget",
      operation_time_band: "regular",
      available_credits_before_operation: 40,
      available_credits_after_operation: 35,
      retry_headroom_after_operation: 25,
      blockers: [],
      can_issue_source_request: false,
      can_change_ranking_or_publication: false,
    });
  });

  test("fails closed for active backoff, exhausted capacity, and an unreserved retry", () => {
    expect(
      receipt(
        completePayload({
          source_operation_backoff_until: "2026-09-20T14:31:00.000Z",
        }),
      ),
    ).toMatchObject({
      status: "complete",
      operation_disposition: "backoff_active",
      blockers: ["backoff_active_at_receipt"],
    });
    expect(
      receipt(
        completePayload({ source_operation_committed_credits_before_operation: 98 }),
      ),
    ).toMatchObject({
      status: "complete",
      operation_disposition: "budget_exhausted",
      blockers: ["operation_cost_exceeds_available_budget"],
    });
    expect(
      receipt(
        completePayload({ source_operation_reserved_retry_credits: 0 }),
      ),
    ).toMatchObject({
      status: "complete",
      operation_disposition: "retry_headroom_exhausted",
      blockers: ["retry_reserve_missing_for_remaining_attempts"],
    });
  });

  test("does not silently repair missing or contradictory planning facts", () => {
    expect(receipt({})).toMatchObject({
      status: "unavailable",
      operation_disposition: "unavailable",
      blockers: ["source_operation_budget_not_recorded"],
    });
    expect(
      receipt(
        completePayload({
          source_operation_attempt_number: 4,
        }),
      ),
    ).toMatchObject({
      status: "complete",
      operation_disposition: "ambiguous",
      blockers: ["attempt_number_exceeds_maximum"],
    });
    expect(
      receipt(
        completePayload({
          source_operation_backoff_until: "not-a-timestamp",
        }),
      ),
    ).toMatchObject({
      status: "incomplete",
      operation_disposition: "unavailable",
      blockers: ["backoff_until_missing_or_invalid"],
    });
  });

  test("rejects stored receipts whose derived capacity or authority was forged", () => {
    const accepted = receipt(completePayload());

    expect(
      recommendationSourceOperationBudgetReceiptFromUnknown({
        ...accepted,
        retry_headroom_after_operation: 99,
      }),
    ).toBeNull();
    expect(
      recommendationSourceOperationBudgetReceiptFromUnknown({
        ...accepted,
        operation_disposition: "budget_exhausted",
      }),
    ).toBeNull();
    expect(
      recommendationSourceOperationBudgetReceiptFromUnknown({
        ...accepted,
        can_issue_source_request: true,
      }),
    ).toBeNull();
  });
});
