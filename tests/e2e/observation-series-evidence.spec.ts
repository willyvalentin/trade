import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type {
  ObservationCycleReadback,
  ObservationCycleReceipt,
} from "../../lib/observation-cycle-receipt";
import {
  observationSeriesEvidenceReadbackFromUnknown,
} from "../../lib/observation-series-evidence";
import { buildObservationSeriesEvidenceReadback } from "../../lib/server/observation-series-evidence-builder";
import {
  buildObservationSeriesSlotAdmission,
  observationSeriesControlFromEnvironment,
} from "../../lib/observation-series-control";

const ownerUserId = "00000000-0000-4000-8000-000000000001";
const buildIdentity = {
  schema_version: "scheduled_scan_deployment_identity_v1" as const,
  deploy_id: "6ab1797d8ee5580008985f39",
  deploy_context: "production" as const,
  commit_ref: "a".repeat(40),
  site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
};

function control(overrides: Record<string, string> = {}) {
  const environment: Record<string, string> = {
    TURE_OBSERVATION_SERIES_ENABLED: "true",
    TURE_OBSERVATION_SERIES_DATE: "2026-09-28",
    TURE_OBSERVATION_SERIES_START_SLOT_UTC: "2026-09-28T13:30:00.000Z",
    TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: "2026-09-28T14:00:00.000Z",
    TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: "2",
    TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "16",
    ...overrides,
  };
  return observationSeriesControlFromEnvironment({
    get: (name) => environment[name],
  });
}

function attemptRow({
  slot,
  currentControl = control(),
  attemptFingerprint,
  identity = buildIdentity,
}: {
  slot: string;
  currentControl?: ReturnType<typeof control>;
  attemptFingerprint?: string;
  identity?: typeof buildIdentity;
}) {
  const suffix = slot.replace(/\D/g, "");
  return {
    attempt_fingerprint:
      attemptFingerprint ?? `scheduled_scan_attempt_${suffix}`,
    source: "netlify_scheduled_function",
    mode: "scheduled",
    scheduled_function_fired_at: slot,
    utc_timestamp: slot,
    payload_json: {
      scheduled_slot_started_at_utc: slot,
      scheduled_slot_identity_source: "netlify_event_next_run",
      build_deployment_identity: identity,
      observation_series_control: currentControl,
      observation_series_slot_admission: buildObservationSeriesSlotAdmission({
        control: currentControl,
        scheduledSlotStartedAtUtc: slot,
      }),
    },
  };
}

function receipt({
  slot,
  attemptFingerprint,
  cycleStatus = "completed",
  disposition = "no_trade",
  reservedCredits = 8,
  publishedCount = 0,
  identity = buildIdentity,
}: {
  slot: string;
  attemptFingerprint?: string;
  cycleStatus?: ObservationCycleReceipt["cycle_status"];
  disposition?: ObservationCycleReceipt["disposition"];
  reservedCredits?: number;
  publishedCount?: number;
  identity?: Record<string, unknown> | null;
}): ObservationCycleReceipt {
  const suffix = slot.replace(/\D/g, "");
  const fingerprint =
    attemptFingerprint ?? `scheduled_scan_attempt_${suffix}`;
  const isActive = cycleStatus === "active";
  return {
    receipt_version: "observation_cycle_receipt_v1",
    cycle_fingerprint: fingerprint,
    owner_user_id: ownerUserId,
    source_attempt_fingerprint: fingerprint,
    cycle_status: cycleStatus,
    disposition: isActive ? "pending" : disposition,
    observation_policy_version: "scheduled_scan_observation_cycle_v1",
    receipt_generated_at: slot,
    finalized_at: isActive ? null : slot,
    scan_run_fingerprint: cycleStatus === "completed" ? `scan_run_${suffix}` : null,
    trigger: {
      status: "received",
      kind: "netlify_schedule",
      occurred_at: slot,
      route_received_at: slot,
      scheduled_slot_started_at_utc: slot,
      build_deployment_identity: identity,
    },
    admission: {
      status: "admitted",
      policy_version: "observation_cycle_admission_v2",
      market_status: "open",
      market_session: "regular",
      reason_codes: [],
      policy_receipt: {
        decision: "request_current_data",
      } as ObservationCycleReceipt["admission"]["policy_receipt"],
    },
    provider_request: {
      status: reservedCredits > 0 ? "attempted" : "not_attempted",
      attempted_tickers: reservedCredits,
      reserved_credits: reservedCredits,
      provider_credit_policy_version: "basic_free_scheduled_scan_credit_guard_v1",
    },
    provider_response: {
      status: cycleStatus === "failed" ? "failed" : "observed",
      success_count: cycleStatus === "completed" ? reservedCredits : 0,
      error_count: cycleStatus === "failed" ? 1 : 0,
      empty_response_count: 0,
      latest_error_type: cycleStatus === "failed" ? "provider_failure" : null,
    },
    freshness: {
      status: cycleStatus === "completed" ? "fresh" : "not_evaluated",
      stale_count: 0,
      reason_codes: [],
    },
    discovery_evaluation: {
      status: cycleStatus === "completed" ? "completed" : "failed",
      raw_candidate_count: cycleStatus === "completed" ? 3 : 0,
      ranked_count: cycleStatus === "completed" ? 1 : 0,
      selected_count: publishedCount,
      built_count: publishedCount,
    },
    publication: {
      status: publishedCount > 0 ? "published" : "no_trade",
      published_count: publishedCount,
      recommendations_created: publishedCount,
      policy_version: "selective_test_v1",
      reason_codes: publishedCount > 0 ? [] : ["quality_bar_not_met"],
    },
    decision: {
      outcome: publishedCount > 0 ? "published" : "no_trade",
      reason_codes: publishedCount > 0 ? [] : ["quality_bar_not_met"],
    },
    authority: {
      can_arm_scheduler: false,
      can_call_provider: false,
      can_change_ranking: false,
      can_publish: false,
      can_execute_paper: false,
      can_execute_broker: false,
    },
  };
}

function readback(receipts: ObservationCycleReceipt[]): ObservationCycleReadback {
  return {
    readback_version: "observation_cycle_readback_v1",
    status: "available",
    receipts,
    invalid_row_count: 0,
    reason_codes: [],
  };
}

test("an expired fully attributed no-trade series passes delivery without claiming quality", () => {
  const currentControl = control();
  const slots = ["2026-09-28T13:30:00.000Z", "2026-09-28T13:45:00.000Z"];
  const result = buildObservationSeriesEvidenceReadback({
    ownerUserId,
    control: currentControl,
    scheduledAttemptRows: slots.map((slot) =>
      attemptRow({ slot, currentControl }),
    ),
    observationCycleReadback: readback(slots.map((slot) => receipt({ slot }))),
    now: new Date("2026-09-28T14:01:00.000Z"),
  });

  expect(result.status).toBe("available");
  expect(result.series?.operational).toMatchObject({
    classification: "pass",
    terminal_reason: "attempt_cap_reached",
    lineage_status: "attributed",
  });
  expect(result.series?.counts).toMatchObject({
    scheduled_attempts: 2,
    attributed_receipts: 2,
    missing_receipts: 0,
    reserved_provider_credits: 16,
    raw_candidates: 6,
    ranked_candidates: 2,
    published_recommendations: 0,
    no_trade_cycles: 2,
  });
  expect(result.series?.quality.classification).toBe(
    "insufficient_forward_evidence",
  );
  expect(result.series?.quality.evidence_gaps).toContain(
    "single_observation_series_cannot_establish_strategy_quality",
  );
  expect(Object.values(result.series?.authority ?? {}).every((value) => value === false)).toBe(true);
});

test("a publication stops the series but remains insufficient quality evidence", () => {
  const currentControl = control();
  const slot = "2026-09-28T13:30:00.000Z";
  const result = buildObservationSeriesEvidenceReadback({
    ownerUserId,
    control: currentControl,
    scheduledAttemptRows: [attemptRow({ slot, currentControl })],
    observationCycleReadback: readback([
      receipt({ slot, disposition: "published", publishedCount: 1 }),
    ]),
    now: new Date("2026-09-28T13:32:00.000Z"),
  });

  expect(result.series?.operational.classification).toBe("pass");
  expect(result.series?.operational.terminal_reason).toBe(
    "publication_observed",
  );
  expect(result.series?.counts.published_recommendations).toBe(1);
  expect(result.series?.quality.classification).toBe(
    "insufficient_forward_evidence",
  );
});

test("the current claim may be briefly in progress, then fails if its receipt never arrives", () => {
  const currentControl = control();
  const slot = "2026-09-28T13:30:00.000Z";
  const input = {
    ownerUserId,
    control: currentControl,
    scheduledAttemptRows: [attemptRow({ slot, currentControl })],
    observationCycleReadback: readback([]),
  };

  const bounded = buildObservationSeriesEvidenceReadback({
    ...input,
    now: new Date("2026-09-28T13:31:00.000Z"),
  });
  expect(bounded.series?.operational.classification).toBe("in_progress");
  expect(bounded.series?.counts.missing_receipts).toBe(1);

  const escaped = buildObservationSeriesEvidenceReadback({
    ...input,
    now: new Date("2026-09-28T13:32:00.000Z"),
  });
  expect(escaped.series?.operational.classification).toBe("fail");
  expect(escaped.series?.operational.terminal_reason).toBe("evidence_invalid");
});

test("cross-build receipts and parser tampering fail closed", () => {
  const currentControl = control();
  const slot = "2026-09-28T13:30:00.000Z";
  const differentIdentity = {
    ...buildIdentity,
    deploy_id: "6ab1797d8ee5580008985f40",
  };
  const invalid = buildObservationSeriesEvidenceReadback({
    ownerUserId,
    control: currentControl,
    scheduledAttemptRows: [attemptRow({ slot, currentControl })],
    observationCycleReadback: readback([
      receipt({ slot, identity: differentIdentity }),
    ]),
    now: new Date("2026-09-28T13:32:00.000Z"),
  });
  expect(invalid.series?.operational.classification).toBe("fail");
  expect(invalid.series?.operational.lineage_status).toBe("invalid");

  const valid = buildObservationSeriesEvidenceReadback({
    ownerUserId,
    control: currentControl,
    scheduledAttemptRows: [attemptRow({ slot, currentControl })],
    observationCycleReadback: readback([receipt({ slot })]),
    now: new Date("2026-09-28T14:01:00.000Z"),
  });
  expect(observationSeriesEvidenceReadbackFromUnknown(valid).status).toBe(
    "available",
  );
  expect(
    observationSeriesEvidenceReadbackFromUnknown({
      ...valid,
      series: {
        ...valid.series,
        authority: {
          ...valid.series?.authority,
          executes_broker_order: true,
        },
      },
    }).status,
  ).toBe("unavailable");
});

test("the authenticated dashboard exposes the read-only series report and UI", () => {
  const dataAccess = readFileSync(
    resolve(process.cwd(), "lib/server/application-data-access.ts"),
    "utf8",
  );
  const serverReader = readFileSync(
    resolve(
      process.cwd(),
      "lib/server/observation-series-evidence-readback.ts",
    ),
    "utf8",
  );
  const app = readFileSync(resolve(process.cwd(), "app/trade-app.tsx"), "utf8");

  expect(dataAccess).toContain("readLatestObservationSeriesEvidence(owner)");
  expect(dataAccess).toContain("observation_series_evidence_readback");
  expect(serverReader).toContain('.eq("owner_user_id", owner)');
  expect(serverReader).toContain('{ count: "exact" }');
  expect(serverReader).not.toContain(".insert(");
  expect(serverReader).not.toContain(".update(");
  expect(serverReader).not.toContain(".delete(");
  expect(app).toContain("observationSeriesEvidenceReadbackFromUnknown");
  expect(app).toContain('data-testid="observation-series-evidence"');
  expect(app).toContain("Operational delivery");
});
