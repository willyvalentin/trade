import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const evidenceRaw = readFileSync(
  "docs/evidence/action-667m5c-calibration-batch-submission.json",
);
const evidence = JSON.parse(evidenceRaw.toString("utf8")) as {
  evidence_digest: string;
  decision_material: {
    attempt: Record<string, unknown>;
    failure_diagnosis: Record<string, unknown>;
    fresh_pre_submission_values: Record<string, unknown>;
    external_effects: Record<string, unknown>;
    statuses: Record<string, unknown>;
    next_boundary: Record<string, unknown>;
  };
};

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

test("M.5C fail-closed evidence digest is exact", () => {
  expect(
    createHash("sha256")
      .update(stable(evidence.decision_material))
      .digest("hex"),
  ).toBe(evidence.evidence_digest);
  expect(evidence.evidence_digest).toBe(
    "22b3735acd6073f772e2e88bb056d3ba6a8473a52d59be3b7d3cd85f21335992",
  );
});

test("nanosecond parser failure is explicit and claims no fresh quote", () => {
  expect(evidence.decision_material.attempt).toMatchObject({
    result: "failed_closed_before_submission",
    failure_type: "ValueError",
    automatic_retry_performed: false,
  });
  expect(
    evidence.decision_material.failure_diagnosis,
  ).toMatchObject({
    stage: "fresh_entitlement_range_validation",
    root_cause:
      "local_explicit_instant_parser_rejected_provider_nanosecond_fraction",
    provider_instant_shape:
      "explicit_utc_with_nine_fractional_digits",
    provider_or_scope_drift_identified: false,
    remediation_or_resume_performed_in_this_action: false,
  });
  expect(
    evidence.decision_material.fresh_pre_submission_values,
  ).toMatchObject({
    fresh_quote_available: false,
    fresh_billable_bytes_available: false,
    fresh_entitlement_admitted: false,
    quote_age_at_submission_seconds: null,
    estimated_cost_usd: null,
    billable_bytes: null,
    m5b_quote_reused_for_submission: false,
  });
});

test("zero submission, download, identity, and downstream authority are preserved", () => {
  expect(evidence.decision_material.external_effects).toEqual({
    authenticated_metadata_calls: 3,
    batch_job_catalog_calls: 0,
    batch_submission_calls: 0,
    new_batch_submissions: 0,
    job_detail_calls: 0,
    polls: 0,
    support_files_downloaded: 0,
    market_data_files_downloaded: 0,
    timeseries_record_requests: 0,
    streaming_calls: 0,
    purchases: 0,
    control_file_created: false,
    calibration_directory_created: false,
    credential_value_logged_or_persisted: false,
    provider_job_identity_obtained_logged_or_persisted: false,
  });
  expect(evidence.decision_material.statuses).toEqual({
    action_667m5c_pre_submission_admission_passed: false,
    action_667m5c_batch_submitted: false,
    action_667m5c_submission_scope_verified: false,
    action_667m5c_batch_terminal_ready: false,
    new_batch_submissions: 0,
    support_files_downloaded: 0,
    market_data_files_downloaded: 0,
    download_authorized: false,
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
  });
  expect(evidence.decision_material.next_boundary).toMatchObject({
    new_or_resumed_operator_authorization_required: true,
    no_automatic_retry: true,
  });
  const raw = evidenceRaw.toString("utf8");
  for (const forbidden of [
    /"api_key"\s*:/i,
    /"job_id"\s*:/i,
    /"account_id"\s*:/i,
    /"billing_id"\s*:/i,
    /"request_id"\s*:/i,
  ]) {
    expect(raw).not.toMatch(forbidden);
  }
});
