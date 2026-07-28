import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const evidencePath =
  "docs/evidence/action-667m5b-calibration-extension-metadata-gate.json";
const calendarPath =
  "docs/evidence/market-context-xnys-calibration-calendar-2026-v1.json";

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stable).join(",")}]`;
  }
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) =>
      left < right ? -1 : left > right ? 1 : 0,
    )
    .map(
      ([key, child]) =>
        `${JSON.stringify(key)}:${stable(child)}`,
    )
    .join(",")}}`;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

type SessionQuote = {
  date: string;
  estimated_records: number;
  billable_dbn_bytes: number;
  estimated_cost_usd: number;
};

type MetadataGateEvidence = {
  evidence_digest: string;
  scope_digest: string;
  quote_digest: string;
  decision_material: {
    scope: Record<string, unknown>;
    official_calendar: {
      session_count: number;
      all_regular_full_sessions: boolean;
      session_inventory: string[];
      independence_day_observed: Record<string, unknown>;
    };
    provider_metadata_snapshot: {
      dataset_discovery: Record<string, unknown>;
      entitlement_range: Record<string, unknown>;
      schema: Record<string, unknown>;
      publisher: Record<string, unknown>;
      symbology: Record<string, unknown>;
      conditions: {
        requested_session_count: number;
        available_session_count: number;
        degraded_session_count: number;
        partial_session_count: number;
        missing_or_unknown_session_count: number;
        all_sessions_available: boolean;
        session_conditions: Array<{
          date: string;
          condition: string;
        }>;
      };
      aggregate_quote: Record<string, unknown>;
      per_session_quote: SessionQuote[];
      daily_to_aggregate_reconciliation: Record<string, unknown>;
    };
    pilot_comparison: {
      parity: Record<string, unknown>;
      per_session_means: Record<string, unknown>;
      candidate_extremes: Record<string, unknown>;
    };
    future_submission_caps: Record<string, unknown>;
    license_and_usage: Record<string, unknown>;
    future_m5c_preconditions: Record<string, unknown>;
    inactive_m5c_authorization_phrase: string;
    execution: Record<string, unknown>;
    statuses: Record<string, unknown>;
  };
};

type CalendarEvidence = {
  canonical_json_sha256: string;
  canonical_json_material: {
    artifact_version: string;
    candidate_start: string;
    candidate_end_exclusive: string;
    exchange_timezone: string;
    excluded_dates: Array<Record<string, unknown>>;
    sessions: Array<{
      date: string;
      open_explicit_instant: string;
      close_explicit_instant: string;
      early_close: boolean;
      session_type: string;
    }>;
    session_count: number;
    all_regular_full_sessions: boolean;
  };
};

const evidenceRaw = readFileSync(evidencePath);
const evidence = JSON.parse(
  evidenceRaw.toString("utf8"),
) as MetadataGateEvidence;
const calendarRaw = readFileSync(calendarPath);
const calendar = JSON.parse(
  calendarRaw.toString("utf8"),
) as CalendarEvidence;

test("M.5B evidence, scope, quote, and calendar digests are exact", () => {
  expect(sha256(stable(evidence.decision_material))).toBe(
    evidence.evidence_digest,
  );
  expect(sha256(stable(evidence.decision_material.scope))).toBe(
    evidence.scope_digest,
  );
  expect(
    sha256(
      stable(
        evidence.decision_material.provider_metadata_snapshot,
      ),
    ),
  ).toBe(evidence.quote_digest);
  expect(
    sha256(stable(calendar.canonical_json_material)),
  ).toBe(calendar.canonical_json_sha256);
  expect(evidence.evidence_digest).toBe(
    "7e6a22ba285bb48c02f4de300137b8651ea791d56fd11ac7d3965a396f6faf6b",
  );
  expect(evidence.scope_digest).toBe(
    "a06af7191b00fc024f0b11757894764995f1e76d8aa82a31bc9cf9b2a06b1c20",
  );
  expect(evidence.quote_digest).toBe(
    "7afc4ee2400f2448996ba623fc4805cf210ff9a03c17dfacb77fca49e4ca4eab",
  );
});

test("official XNYS inventory contains exactly fifteen full sessions", () => {
  expect(calendar.canonical_json_material).toMatchObject({
    artifact_version:
      "market_context_xnys_calibration_calendar_2026_v1",
    candidate_start: "2026-06-26T00:00:00Z",
    candidate_end_exclusive: "2026-07-20T00:00:00Z",
    exchange_timezone: "America/New_York",
    session_count: 15,
    all_regular_full_sessions: true,
  });
  expect(
    calendar.canonical_json_material.sessions.map(
      (session) => session.date,
    ),
  ).toEqual(
    evidence.decision_material.official_calendar
      .session_inventory,
  );
  expect(calendar.canonical_json_material.sessions).toHaveLength(15);
  expect(
    calendar.canonical_json_material.sessions.every(
      (session) =>
        session.open_explicit_instant.endsWith("T13:30:00Z") &&
        session.close_explicit_instant.endsWith("T20:00:00Z") &&
        session.early_close === false &&
        session.session_type === "regular",
    ),
  ).toBe(true);
  expect(
    calendar.canonical_json_material.excluded_dates,
  ).toContainEqual({
    date: "2026-07-03",
    reason: "exchange_holiday_independence_day_observed",
    is_session: false,
  });
});

test("provider discovery, entitlement, publisher, and symbols are exact", () => {
  const snapshot =
    evidence.decision_material.provider_metadata_snapshot;
  expect(snapshot.dataset_discovery).toMatchObject({
    method: "range_less_metadata.list_datasets",
    exact_ascii_membership: true,
    duplicate_dataset_ids: false,
  });
  expect(snapshot.entitlement_range).toMatchObject({
    start: "2023-03-28T00:00:00.000000000Z",
    end_exclusive: "2026-07-27T04:00:00.000000000Z",
    candidate_scope_covered: true,
  });
  expect(snapshot.schema).toMatchObject({
    exact_trades_membership: true,
  });
  expect(snapshot.publisher).toMatchObject({
    publisher_id: 95,
    dataset: "EQUS.MINI",
    exact_dataset_publisher_match: true,
  });
  expect(snapshot.symbology).toMatchObject({
    resolved_symbol_count: 13,
    partial_symbol_count: 0,
    not_found_symbol_count: 0,
    exact_13_of_13: true,
    one_mapping_interval_per_symbol: true,
    provider_instrument_ids_persisted: false,
  });
});

test("all calendar sessions are available and quote reconciles", () => {
  const snapshot =
    evidence.decision_material.provider_metadata_snapshot;
  expect(snapshot.conditions).toMatchObject({
    requested_session_count: 15,
    available_session_count: 15,
    degraded_session_count: 0,
    partial_session_count: 0,
    missing_or_unknown_session_count: 0,
    all_sessions_available: true,
  });
  expect(snapshot.conditions.session_conditions).toHaveLength(15);
  expect(
    snapshot.conditions.session_conditions.every(
      (condition) => condition.condition === "available",
    ),
  ).toBe(true);
  expect(snapshot.aggregate_quote).toMatchObject({
    estimated_records: 1_903_887,
    billable_dbn_bytes: 91_386_576,
    estimated_cost_usd: 0.510662287474,
    declared_compressed_transfer_bytes: null,
    compressed_transfer_status:
      "not_exposed_by_metadata_endpoints",
  });
  expect(snapshot.per_session_quote).toHaveLength(15);
  expect(snapshot.daily_to_aggregate_reconciliation).toMatchObject({
    record_sum: 1_903_887,
    record_sum_matches: true,
    billable_byte_sum: 91_386_576,
    billable_byte_sum_matches: true,
    cost_reconciled_with_provider_rounding: true,
  });
});

test("pilot comparison, caps, license, and M.5C boundary remain explicit", () => {
  expect(evidence.decision_material.pilot_comparison.parity).toEqual({
    symbols_identical: true,
    publisher_identical: true,
    dataset_schema_encoding_identical: true,
    adjustment_state_identical: true,
  });
  expect(
    evidence.decision_material.pilot_comparison
      .candidate_extremes,
  ).toMatchObject({
    highest_record_session: {
      date: "2026-06-26",
      estimated_records: 151_216,
    },
    lowest_record_session: {
      date: "2026-07-10",
      estimated_records: 98_971,
    },
  });
  expect(evidence.decision_material.future_submission_caps).toMatchObject({
    all_in_cost_usd: 0.75,
    billable_dbn_bytes: 134_217_728,
    declared_compressed_transfer_bytes: 67_108_864,
    local_total_requirement_bytes: 2_147_483_648,
    estimated_cost_within_cap: true,
    billable_bytes_within_cap: true,
    compressed_transfer_within_cap:
      "not_testable_before_batch_manifest",
  });
  expect(evidence.decision_material.license_and_usage).toMatchObject({
    license_sufficient: true,
    redistribution_allowed: false,
    corporate_actions_included: false,
    new_legal_inference_made: false,
  });
  expect(
    evidence.decision_material.inactive_m5c_authorization_phrase,
  ).toContain("exakt en Databento batch submission");
  expect(
    evidence.decision_material.inactive_m5c_authorization_phrase,
  ).toContain("Ingen market-datafil får laddas ned");
});

test("no purchase, download, authorization, identifier, or raw data was persisted", () => {
  expect(evidence.decision_material.execution).toMatchObject({
    authenticated_metadata_calls: 54,
    batch_submissions: 0,
    timeseries_record_requests: 0,
    downloads: 0,
    purchases: 0,
    automatic_retries_requested: 0,
    credential_value_logged_or_persisted: false,
    account_billing_request_or_job_identifiers_persisted: false,
    raw_records_received: 0,
  });
  expect(evidence.decision_material.statuses).toEqual({
    action_667m5b_metadata_gate_completed: true,
    action_667m5b_entitlement_verified: true,
    action_667m5b_exactly_fifteen_sessions_verified: true,
    action_667m5b_all_sessions_available: true,
    action_667m5b_exact_quote_available: true,
    action_667m5c_calibration_batch_submission_ready: true,
    batch_submission_authorized: false,
    download_authorized: false,
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
  });
  const combined = `${evidenceRaw.toString("utf8")}\n${calendarRaw.toString("utf8")}`;
  for (const forbidden of [
    /"api_key"\s*:/i,
    /"credential_value"\s*:/i,
    /"account_id"\s*:/i,
    /"billing_id"\s*:/i,
    /"request_id"\s*:/i,
    /"job_id"\s*:/i,
    /"raw_records"\s*:/i,
  ]) {
    expect(combined).not.toMatch(forbidden);
  }
});
