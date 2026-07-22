import { expect, test } from "@playwright/test";

import {
  validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response";

const now = new Date("2026-07-23T15:00:30.000Z");

function productionShapedResponse() {
  const authorization = {
    authorization_id: "manual_canary_authorization_postgrest_fixture",
    issued_at: "2026-07-23T15:00:00.123+00:00",
    expires_at: "2026-07-23T15:01:00.123+00:00",
    consumed_at: null,
    status: "issued",
    request_fingerprint: "postgrest_fixture_fingerprint",
    execution_id: "postgrest_fixture_execution",
    claim_id: "postgrest_fixture_claim",
    ticker: "AAPL",
    interval: "5min",
    requested_start: "2026-07-23T14:30:00+00:00",
    requested_end: "2026-07-23T15:00:00+00:00",
    calendar_contract_version: "us_equity_market_calendar_v1",
    calendar_fingerprint: "postgrest_fixture_calendar",
    budget_policy_version: "continuous_intelligence_credit_ledger_v1",
    policy_total_credits: 377,
    policy_hard_reserve_credits: 57,
    policy_normal_planned_max_credits: 320,
    estimated_credits: 1,
    canary_contract_version: "continuous_intelligence_shadow_collector_canary_v1",
    claim_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1",
    deployment_commit: "a".repeat(40),
    deployment_build_marker: "continuous_intelligence_shadow_canary_function_foundation_v1",
    purpose: "one_manual_shadow_canary_attempt",
    contract_version: "continuous_intelligence_shadow_canary_manual_authorization_v1",
  };
  return {
    contract_version: "continuous_intelligence_shadow_canary_manual_authorization_v1",
    issued: true,
    authorization,
    execution_lease: {
      execution_lease_id: "manual_canary_execution_lease_postgrest_fixture",
      authorization_id: authorization.authorization_id,
      issued_at: authorization.issued_at,
      expires_at: authorization.expires_at,
      consumed_at: null,
      status: "issued",
      request_fingerprint: authorization.request_fingerprint,
      execution_id: authorization.execution_id,
      claim_id: authorization.claim_id,
      ticker: authorization.ticker,
      interval: authorization.interval,
      requested_start: authorization.requested_start,
      requested_end: authorization.requested_end,
      policy_total_credits: authorization.policy_total_credits,
      policy_hard_reserve_credits: authorization.policy_hard_reserve_credits,
      policy_normal_planned_max_credits: authorization.policy_normal_planned_max_credits,
      estimated_credits: authorization.estimated_credits,
      contract_version: "continuous_intelligence_shadow_canary_manual_execution_lease_v1",
    },
    authorization_token: "x".repeat(43),
    raw_token_returned_once: true,
    provider_calls_executed: false,
    claims_created: false,
    attempts_begun: false,
    audit_or_ledger_writes_executed: false,
  };
}

function validate(body: ReturnType<typeof productionShapedResponse>) {
  return validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse({
    http_status: 200,
    body,
    now,
    expected: {
      authorization_id: body.authorization.authorization_id,
      execution_lease_id: body.execution_lease.execution_lease_id,
    },
  });
}

test("Action 600 accepts the observed PostgREST timestamp serialization and exact bounded pair shape", () => {
  const body = productionShapedResponse();
  expect(validate(body)).toEqual({ ok: true, diagnostic_code: null, terminal_status: null });
});

test("Action 600 enumerates representative strict rejection branches without credentials", () => {
  const cases = [
    {
      name: "wrapper",
      body: [] as unknown as ReturnType<typeof productionShapedResponse>,
      expected: { diagnostic_code: "issuance_response_schema_mismatch", validation_stage: "response_shape" },
    },
    {
      name: "authorization identity",
      body: (() => {
        const body = productionShapedResponse();
        body.authorization.authorization_id = "substituted_authorization";
        return body;
      })(),
      expected: { diagnostic_code: "issuance_response_binding_mismatch", validation_stage: "authorization_identity" },
    },
    {
      name: "lease identity",
      body: (() => {
        const body = productionShapedResponse();
        body.execution_lease.execution_lease_id = "substituted_lease";
        return body;
      })(),
      expected: { diagnostic_code: "issuance_response_binding_mismatch", validation_stage: "lease_identity" },
    },
    {
      name: "shared binding",
      body: (() => {
        const body = productionShapedResponse();
        body.execution_lease.request_fingerprint = "different_fingerprint";
        return body;
      })(),
      expected: { diagnostic_code: "issuance_response_binding_mismatch", validation_stage: "shared_binding" },
    },
    {
      name: "timestamp",
      body: (() => {
        const body = productionShapedResponse();
        body.execution_lease.issued_at = "2026-07-23 15:00:00";
        return body;
      })(),
      expected: { diagnostic_code: "issuance_response_invalid_timestamp", validation_stage: "timestamp_normalization" },
    },
    {
      name: "policy",
      body: (() => {
        const body = productionShapedResponse();
        body.authorization.policy_normal_planned_max_credits = 319;
        body.execution_lease.policy_normal_planned_max_credits = 319;
        return body;
      })(),
      expected: { diagnostic_code: "issuance_response_binding_mismatch", validation_stage: "bounded_contract" },
    },
  ];

  for (const item of cases) {
    const result = validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse({
      http_status: 200,
      body: item.body,
      now,
      expected: {
        authorization_id: "manual_canary_authorization_postgrest_fixture",
        execution_lease_id: "manual_canary_execution_lease_postgrest_fixture",
      },
    });
    expect(result, item.name).toMatchObject({ ok: false, ...item.expected });
  }
});
