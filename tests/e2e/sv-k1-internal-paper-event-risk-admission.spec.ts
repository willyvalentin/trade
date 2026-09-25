import { expect, test } from "@playwright/test";

import {
  evaluateInternalPaperEventRiskAdmission,
  INTERNAL_PAPER_EVENT_RISK_ADMISSION_VERSION,
  INTERNAL_PAPER_EVENT_RISK_POLICY_VERSION,
  INTERNAL_PAPER_EVENT_RISK_SNAPSHOT_VERSION,
  INTERNAL_PAPER_EVENT_RISK_TYPES,
  verifyInternalPaperEventRiskAdmissionDigest,
  type InternalPaperEventRiskAdmissionInput,
  type InternalPaperEventRiskEventRevision,
  type InternalPaperEventRiskRule,
  type InternalPaperEventRiskType,
} from "@/lib/internal-paper-event-risk-admission";

const DECISION_AT = "2026-09-25T15:00:00.000Z";

function rules(): InternalPaperEventRiskRule[] {
  const actions: Record<
    InternalPaperEventRiskType,
    Pick<InternalPaperEventRiskRule, "action" | "size_multiplier_bps">
  > = {
    earnings: { action: "deny", size_multiplier_bps: 0 },
    company_guidance: { action: "reduce", size_multiplier_bps: 5_000 },
    macro_cpi: { action: "deny", size_multiplier_bps: 0 },
    macro_fomc: { action: "deny", size_multiplier_bps: 0 },
    macro_jobs: { action: "deny", size_multiplier_bps: 0 },
    ex_dividend: { action: "reduce", size_multiplier_bps: 5_000 },
    stock_split: { action: "deny", size_multiplier_bps: 0 },
    trading_halt: { action: "deny", size_multiplier_bps: 0 },
    options_expiration: { action: "reduce", size_multiplier_bps: 7_500 },
    sector_event: { action: "reduce", size_multiplier_bps: 7_500 },
    other_material: { action: "deny", size_multiplier_bps: 0 },
  };
  return INTERNAL_PAPER_EVENT_RISK_TYPES.map((eventType) => ({
    rule_id: `rule-${eventType}`,
    event_type: eventType,
    lead_seconds: 86_400,
    lag_seconds: 3_600,
    ...actions[eventType],
  }));
}

function revision(
  overrides: Partial<InternalPaperEventRiskEventRevision> = {},
): InternalPaperEventRiskEventRevision {
  return {
    logical_event_id: "earnings-aapl-q3",
    revision_id: "earnings-aapl-q3-r1",
    revision_sequence: 1,
    event_type: "earnings",
    scope: "ticker",
    ticker: "AAPL",
    sector: null,
    status: "scheduled",
    starts_at: "2026-09-25T15:30:00.000Z",
    ends_at: "2026-09-25T16:00:00.000Z",
    revision_published_at: "2026-09-25T14:45:00.000Z",
    observed_at: "2026-09-25T14:59:00.000Z",
    provider: "licensed-calendar-fixture",
    provider_dataset_version: "fixture-2026-09-25-v1",
    ...overrides,
  };
}

function input(
  revisions: InternalPaperEventRiskEventRevision[] = [],
  mutate: (value: InternalPaperEventRiskAdmissionInput) => InternalPaperEventRiskAdmissionInput =
    (value) => value,
): InternalPaperEventRiskAdmissionInput {
  const base: InternalPaperEventRiskAdmissionInput = {
    admission_version: INTERNAL_PAPER_EVENT_RISK_ADMISSION_VERSION,
    policy: {
      policy_version: INTERNAL_PAPER_EVENT_RISK_POLICY_VERSION,
      policy_id: "sv-k1-policy-2026-09-25",
      effective_from: "2026-09-25T00:00:00.000Z",
      expires_at: "2026-09-26T00:00:00.000Z",
      max_snapshot_age_seconds: 300,
      required_event_types: [...INTERNAL_PAPER_EVENT_RISK_TYPES],
      rules: rules(),
    },
    snapshot: {
      snapshot_version: INTERNAL_PAPER_EVENT_RISK_SNAPSHOT_VERSION,
      snapshot_id: "sv-k1-aapl-2026-09-25-1500",
      target_ticker: "AAPL",
      target_sector: "technology",
      decision_at: DECISION_AT,
      observed_at: "2026-09-25T14:59:00.000Z",
      coverage: INTERNAL_PAPER_EVENT_RISK_TYPES.map((eventType) => {
        const typeRevisions = revisions.filter(
          (item) => item.event_type === eventType,
        );
        return {
          event_type: eventType,
          target_ticker: "AAPL",
          target_sector: "technology",
          provider: "licensed-calendar-fixture",
          provider_dataset_version: "fixture-2026-09-25-v1",
          observed_at: "2026-09-25T14:59:00.000Z",
          event_window_start: "2026-09-24T00:00:00.000Z",
          event_window_end: "2026-09-26T23:59:59.000Z",
          search_complete: true,
          reported_revision_count: typeRevisions.length,
          reported_logical_event_count: new Set(
            typeRevisions.map((item) => item.logical_event_id),
          ).size,
          entitlement_reference: "fixture-entitlement",
          retention_rights_reference: "fixture-retention",
        };
      }),
      event_revisions: revisions,
    },
  };
  return mutate(base);
}

test.describe("SV-K1 point-in-time internal-paper event-risk admission", () => {
  test("admits only after complete target-specific coverage of every frozen event type", () => {
    const result = evaluateInternalPaperEventRiskAdmission(input());

    expect(result).toMatchObject({
      status: "completed",
      disposition: "admitted",
      size_multiplier_bps: 10_000,
      reason_codes: ["no_applicable_event_risk"],
      covered_event_types: [...INTERNAL_PAPER_EVENT_RISK_TYPES],
      matched_events: [],
    });
    expect(verifyInternalPaperEventRiskAdmissionDigest(result)).toBe(true);
  });

  test("denies a ticker earnings event inside the explicit policy window", () => {
    const result = evaluateInternalPaperEventRiskAdmission(input([revision()]));

    expect(result).toMatchObject({
      status: "completed",
      disposition: "denied",
      size_multiplier_bps: 0,
      reason_codes: ["event_risk_denied"],
      matched_events: [
        {
          logical_event_id: "earnings-aapl-q3",
          revision_id: "earnings-aapl-q3-r1",
          event_type: "earnings",
          matched_rule_ids: ["rule-earnings"],
          action: "deny",
        },
      ],
    });
  });

  test("uses the most restrictive matching event and minimum explicit size multiplier", () => {
    const result = evaluateInternalPaperEventRiskAdmission(
      input([
        revision({
          logical_event_id: "opex-2026-09-25",
          revision_id: "opex-2026-09-25-r1",
          event_type: "options_expiration",
          scope: "market",
          ticker: null,
        }),
        revision({
          logical_event_id: "technology-conference",
          revision_id: "technology-conference-r1",
          event_type: "sector_event",
          scope: "sector",
          ticker: null,
          sector: "technology",
        }),
        revision({
          logical_event_id: "aapl-guidance",
          revision_id: "aapl-guidance-r1",
          event_type: "company_guidance",
        }),
      ]),
    );

    expect(result).toMatchObject({
      status: "completed",
      disposition: "reduced",
      size_multiplier_bps: 5_000,
      reason_codes: ["event_risk_reduced"],
    });
    expect(result.matched_events).toHaveLength(3);
  });

  test("uses only the latest known revision and honors a point-in-time cancellation", () => {
    const first = revision();
    const cancelled = revision({
      revision_id: "earnings-aapl-q3-r2",
      revision_sequence: 2,
      status: "cancelled",
      revision_published_at: "2026-09-25T14:50:00.000Z",
    });
    const result = evaluateInternalPaperEventRiskAdmission(
      input([first, cancelled]),
    );

    expect(result).toMatchObject({
      status: "completed",
      disposition: "admitted",
      size_multiplier_bps: 10_000,
      matched_events: [],
    });
  });

  test("fails closed on missing, duplicate, stale or incomplete coverage", () => {
    const missing = input([], (value) => ({
      ...value,
      snapshot: {
        ...value.snapshot,
        coverage: value.snapshot.coverage.slice(1),
      },
    }));
    expect(evaluateInternalPaperEventRiskAdmission(missing)).toMatchObject({
      status: "blocked",
      disposition: "unavailable",
      reason_codes: expect.arrayContaining(["required_coverage_missing"]),
    });

    const duplicate = input([], (value) => ({
      ...value,
      snapshot: {
        ...value.snapshot,
        coverage: [...value.snapshot.coverage, value.snapshot.coverage[0]!],
      },
    }));
    expect(evaluateInternalPaperEventRiskAdmission(duplicate)).toMatchObject({
      status: "blocked",
      reason_codes: expect.arrayContaining(["coverage_duplicate"]),
    });

    for (const coverageMutation of [
      { observed_at: "2026-09-25T14:54:59.000Z" },
      { search_complete: false },
      { event_window_end: "2026-09-25T15:30:00.000Z" },
    ]) {
      const invalid = input([], (value) => ({
        ...value,
        snapshot: {
          ...value.snapshot,
          coverage: value.snapshot.coverage.map((item, index) =>
            index === 0 ? { ...item, ...coverageMutation } : item,
          ),
        },
      }));
      expect(evaluateInternalPaperEventRiskAdmission(invalid)).toMatchObject({
        status: "blocked",
        reason_codes: expect.arrayContaining([
          "coverage_invalid_or_incomplete",
        ]),
      });
    }
  });

  test("rejects future, cross-target and count-mismatched event evidence", () => {
    for (const invalidRevision of [
      revision({ observed_at: "2026-09-25T15:00:00.001Z" }),
      revision({ ticker: "MSFT" }),
    ]) {
      expect(
        evaluateInternalPaperEventRiskAdmission(input([invalidRevision])),
      ).toMatchObject({
        status: "blocked",
        reason_codes: expect.arrayContaining([
          "event_revision_invalid_or_not_point_in_time",
        ]),
      });
    }

    const mismatch = input([revision()], (value) => ({
      ...value,
      snapshot: {
        ...value.snapshot,
        coverage: value.snapshot.coverage.map((item) =>
          item.event_type === "earnings"
            ? { ...item, reported_revision_count: 0 }
            : item,
        ),
      },
    }));
    expect(evaluateInternalPaperEventRiskAdmission(mismatch)).toMatchObject({
      status: "blocked",
      reason_codes: expect.arrayContaining(["coverage_count_mismatch"]),
    });
  });

  test("rejects ambiguous revision ordering instead of selecting a convenient version", () => {
    const ambiguous = revision({
      revision_id: "earnings-aapl-q3-r2",
      revision_sequence: 2,
    });
    expect(
      evaluateInternalPaperEventRiskAdmission(
        input([revision(), ambiguous]),
      ),
    ).toMatchObject({
      status: "blocked",
      reason_codes: expect.arrayContaining(["event_revision_chain_invalid"]),
    });

    const incomplete = revision({
      revision_id: "earnings-aapl-q3-r2",
      revision_sequence: 2,
      revision_published_at: "2026-09-25T14:50:00.000Z",
    });
    expect(
      evaluateInternalPaperEventRiskAdmission(input([incomplete])),
    ).toMatchObject({
      status: "blocked",
      reason_codes: expect.arrayContaining(["event_revision_chain_incomplete"]),
    });
  });

  test("enforces exact policy completeness, validity interval and numeric bounds", () => {
    const missingType = input([], (value) => ({
      ...value,
      policy: {
        ...value.policy,
        required_event_types: value.policy.required_event_types.slice(1),
      },
    }));
    const expired = input([], (value) => ({
      ...value,
      policy: {
        ...value.policy,
        expires_at: DECISION_AT,
      },
    }));
    const malformed = input([], (value) => ({
      ...value,
      policy: {
        ...value.policy,
        rules: value.policy.rules.map((item, index) =>
          index === 0 ? { ...item, lead_seconds: Number.NaN } : item,
        ),
      },
    }));

    for (const invalid of [missingType, expired, malformed]) {
      expect(evaluateInternalPaperEventRiskAdmission(invalid)).toMatchObject({
        status: "blocked",
        disposition: "unavailable",
        reason_codes: ["event_risk_policy_invalid"],
      });
    }
    expect(
      evaluateInternalPaperEventRiskAdmission(malformed).input_digest,
    ).not.toBe(evaluateInternalPaperEventRiskAdmission(input()).input_digest);
  });

  test("keeps boundary risk inclusive, results immutable and every side-effect authority false", () => {
    const boundary = revision({
      starts_at: "2026-09-26T15:00:00.000Z",
      ends_at: "2026-09-26T16:00:00.000Z",
    });
    const result = evaluateInternalPaperEventRiskAdmission(input([boundary]));

    expect(result.disposition).toBe("denied");
    expect(Object.values(result.authority)).toEqual([
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.matched_events)).toBe(true);
    expect(Object.isFrozen(result.matched_events[0])).toBe(true);
    expect(verifyInternalPaperEventRiskAdmissionDigest(result)).toBe(true);
  });
});
