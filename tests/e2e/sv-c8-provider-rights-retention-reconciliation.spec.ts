import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  PROVIDER_RIGHTS_CONFIRMATION_VERSION,
  PROVIDER_RIGHTS_RETENTION_RECONCILIATION_VERSION,
  reconcileProviderRightsRetention,
  type ProviderRightsRetentionReconciliationInput,
  type TwelveDataAccountRetentionConfirmation,
  type TwelveDataBasicFreePublicRetentionEvidence,
} from "@/lib/provider-rights-retention-reconciliation";

const evidenceDocument = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      "docs/evidence/sv-c8-twelve-data-basic-free-retention-reconciliation.json",
    ),
    "utf8",
  ),
) as {
  public_evidence: TwelveDataBasicFreePublicRetentionEvidence;
  decision: { production_c6_row_must_remain_blocked: boolean };
  activity_attestation: Record<string, number>;
};

function confirmation(
  overrides: Partial<TwelveDataAccountRetentionConfirmation> = {},
): TwelveDataAccountRetentionConfirmation {
  return {
    confirmation_version: PROVIDER_RIGHTS_CONFIRMATION_VERSION,
    confirmation_id: "td-retention-confirmation-example-001",
    provider_plan: "twelve_data_basic_free",
    account_scope_sha256: "a".repeat(64),
    confirmation_reference_sha256: "b".repeat(64),
    confirmation_document_sha256: "c".repeat(64),
    issued_at: "2026-09-25T05:00:00.000Z",
    valid_until: "2026-12-31T23:59:59.000Z",
    use_case: "pre_release_owner_only_internal_paper_day_trading_research",
    internal_non_display_allowed: true,
    noncommercial_use_required: true,
    raw_provider_payload_retention_bytes: 0,
    non_reversible_derived_data_allowed: true,
    exact_price_and_candle_retention_days: 30,
    third_party_us_equity_terms_resolved: true,
    ...overrides,
  };
}

function input(
  overrides: Partial<ProviderRightsRetentionReconciliationInput> = {},
): ProviderRightsRetentionReconciliationInput {
  return {
    reconciliation_version: PROVIDER_RIGHTS_RETENTION_RECONCILIATION_VERSION,
    evaluated_at: "2026-09-25T06:00:00.000Z",
    requested_exact_price_evidence_retention_days: 30,
    public_evidence: evidenceDocument.public_evidence,
    account_confirmation: null,
    ...overrides,
  };
}

test("keeps C6 blocked because public terms do not supply an in-subscription retention ceiling", () => {
  const result = reconcileProviderRightsRetention(input());

  expect(result).toMatchObject({
    status: "blocked",
    disposition: "blocked_pending_provider_confirmation",
    reason_codes: [
      "account_specific_provider_confirmation_missing",
      "exact_price_evidence_retention_duration_unverified",
      "public_termination_deletion_window_not_retention_authority",
      "third_party_us_equity_terms_unresolved",
    ],
    confirmed_max_exact_price_evidence_retention_days: null,
    confirmation_id: null,
    safety: {
      public_termination_window_used_as_retention_authority: false,
      database_admission_authorized: false,
      pilot_provisioning_authorized: false,
      provider_request_authorized: false,
      database_write_authorized: false,
      broker_action_authorized: false,
    },
  });
  expect(evidenceDocument.decision.production_c6_row_must_remain_blocked).toBe(
    true,
  );
  expect(evidenceDocument.activity_attestation).toEqual({
    provider_requests: 0,
    credits_reserved: 0,
    credentials_read: 0,
    database_writes: 0,
    accounts_created: 0,
    paper_jobs_created: 0,
    broker_actions: 0,
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.safety)).toBe(true);
});

test("does not reinterpret the 30-day post-termination deletion window as active-plan retention", () => {
  const publicEvidence = {
    ...evidenceDocument.public_evidence,
    documentation_numeric_in_subscription_retention_found: true,
    numeric_in_subscription_exact_price_retention_days: 30,
    termination_window_is_in_subscription_retention_authority: true,
  } as unknown as TwelveDataBasicFreePublicRetentionEvidence;

  expect(
    reconcileProviderRightsRetention(input({ public_evidence: publicEvidence })),
  ).toMatchObject({
    status: "blocked",
    disposition: "blocked",
    reason_codes: ["invalid_or_stale_public_evidence"],
  });
});

test("accepts current account-scoped confirmation only for a separate database review", () => {
  const result = reconcileProviderRightsRetention(
    input({ account_confirmation: confirmation() }),
  );

  expect(result).toMatchObject({
    status: "completed",
    disposition: "eligible_for_separate_database_admission_review",
    reason_codes: [
      "supplied_account_confirmation_satisfies_requested_retention",
    ],
    requested_exact_price_evidence_retention_days: 30,
    confirmed_max_exact_price_evidence_retention_days: 30,
    confirmation_id: "td-retention-confirmation-example-001",
    required_next_evidence: [
      "independent_confirmation_authenticity_review",
      "separately_reviewed_database_admission_migration",
    ],
    safety: {
      evidence_authenticity_verified_by_this_function: false,
      database_admission_authorized: false,
      pilot_provisioning_authorized: false,
      paper_worker_activation_authorized: false,
    },
  });
  expect(result.account_confirmation_digest).toMatch(/^[0-9a-f]{64}$/);
  expect(result.result_digest).toMatch(/^[0-9a-f]{64}$/);
});

test("blocks a requested retention period above the supplied confirmation", () => {
  expect(
    reconcileProviderRightsRetention(
      input({
        requested_exact_price_evidence_retention_days: 31,
        account_confirmation: confirmation(),
      }),
    ),
  ).toMatchObject({
    status: "blocked",
    disposition: "blocked",
    reason_codes: ["requested_retention_exceeds_confirmed_rights"],
    confirmed_max_exact_price_evidence_retention_days: 30,
  });
});

test("blocks expired, future-issued and overlong confirmation windows", () => {
  for (const accountConfirmation of [
    confirmation({ valid_until: "2026-09-25T05:59:59.000Z" }),
    confirmation({ issued_at: "2026-09-25T06:00:01.000Z" }),
    confirmation({ valid_until: "2028-01-01T00:00:00.000Z" }),
  ]) {
    expect(
      reconcileProviderRightsRetention(
        input({ account_confirmation: accountConfirmation }),
      ),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["invalid_or_expired_account_confirmation"],
    });
  }
});

test("blocks confirmation that does not resolve exact rights boundaries", () => {
  for (const accountConfirmation of [
    { ...confirmation(), third_party_us_equity_terms_resolved: false },
    { ...confirmation(), raw_provider_payload_retention_bytes: 1 },
    { ...confirmation(), exact_price_and_candle_retention_days: 0 },
    { ...confirmation(), provider_plan: "twelve_data_grow" },
  ]) {
    expect(
      reconcileProviderRightsRetention(
        input({
          account_confirmation:
            accountConfirmation as TwelveDataAccountRetentionConfirmation,
        }),
      ),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["invalid_or_expired_account_confirmation"],
    });
  }
});

test("rejects stale or future public reviews", () => {
  for (const reviewedAt of [
    "2026-08-25T05:59:59.000Z",
    "2026-09-25T06:00:01.000Z",
  ]) {
    expect(
      reconcileProviderRightsRetention(
        input({
          public_evidence: {
            ...evidenceDocument.public_evidence,
            reviewed_at: reviewedAt,
          },
        }),
      ),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["invalid_or_stale_public_evidence"],
    });
  }
});

test("rejects extra fields, accessors and non-finite requested retention", () => {
  expect(
    reconcileProviderRightsRetention({ ...input(), api_key: "must-not-exist" }),
  ).toMatchObject({ reason_codes: ["invalid_reconciliation_input"] });

  const accessorBacked = Object.create(null, {
    reconciliation_version: {
      enumerable: true,
      value: PROVIDER_RIGHTS_RETENTION_RECONCILIATION_VERSION,
    },
    evaluated_at: {
      enumerable: true,
      get() {
        throw new Error("must not execute");
      },
    },
    requested_exact_price_evidence_retention_days: {
      enumerable: true,
      value: 30,
    },
    public_evidence: {
      enumerable: true,
      value: evidenceDocument.public_evidence,
    },
    account_confirmation: { enumerable: true, value: null },
  });
  expect(reconcileProviderRightsRetention(accessorBacked)).toMatchObject({
    reason_codes: ["invalid_reconciliation_input"],
  });

  expect(
    reconcileProviderRightsRetention({
      ...input(),
      requested_exact_price_evidence_retention_days: Number.NaN,
    }),
  ).toMatchObject({ reason_codes: ["invalid_reconciliation_input"] });
});

test("is deterministic and keeps its input immutable", () => {
  const request = input({ account_confirmation: confirmation() });
  const before = JSON.stringify(request);
  const first = reconcileProviderRightsRetention(request);
  const second = reconcileProviderRightsRetention(request);

  expect(second).toEqual(first);
  expect(JSON.stringify(request)).toBe(before);
  expect(first.input_digest).toMatch(/^[0-9a-f]{64}$/);
  expect(first.result_digest).toMatch(/^[0-9a-f]{64}$/);
});
