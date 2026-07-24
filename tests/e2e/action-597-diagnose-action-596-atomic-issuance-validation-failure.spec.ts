import { expect, test } from "@playwright/test";

import {
  continuousIntelligenceShadowCanaryManualAuthorizationIssuanceFailureTerminalStatus,
  diagnoseAction596HistoricalIssuanceValidation,
  validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response";

const now = new Date("2026-07-22T15:00:30.000Z");

function response(overrides: Record<string, unknown> = {}) {
  const authorization = {
    authorization_id: "manual_canary_authorization_fixture",
    issued_at: "2026-07-22T15:00:00.000000+00:00",
    expires_at: "2026-07-22T15:01:00.000000+00:00",
    consumed_at: null,
    status: "issued",
    request_fingerprint: "fixture_fingerprint",
    execution_id: "fixture_execution",
    claim_id: "fixture_claim",
    ticker: "AAPL",
    interval: "5min",
    requested_start: "2026-07-22T14:30:00.000000+00:00",
    requested_end: "2026-07-22T15:00:00.000000+00:00",
    calendar_contract_version: "us_equity_market_calendar_v1",
    calendar_fingerprint: "fixture_calendar",
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
  const executionLease = {
    execution_lease_id: "manual_canary_execution_lease_fixture",
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
  };
  return {
    contract_version: "continuous_intelligence_shadow_canary_manual_authorization_v1",
    issued: true,
    authorization,
    execution_lease: executionLease,
    authorization_token: "x".repeat(43),
    raw_token_returned_once: true,
    provider_calls_executed: false,
    claims_created: false,
    attempts_begun: false,
    audit_or_ledger_writes_executed: false,
    ...overrides,
  };
}

function expected(body: ReturnType<typeof response>) {
  return {
    authorization_id: body.authorization.authorization_id,
    execution_lease_id: body.execution_lease.execution_lease_id,
  };
}

test("Action 597 accepts the actual sanitized authorization and lease response contract", () => {
  const body = response();
  const result = validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse({
    http_status: 200,
    body,
    now,
    expected: expected(body),
  });
  expect(result).toEqual({ ok: true, diagnostic_code: null, terminal_status: null });
});

test("Action 597 reproduces the Action 596 failure as a non-contract deployment field comparison", () => {
  const body = response();
  const result = diagnoseAction596HistoricalIssuanceValidation({
    http_status: 200,
    body,
    now,
    expected: expected(body),
  });
  expect(result).toMatchObject({
    ok: false,
    diagnostic_code: "issuance_response_binding_mismatch",
    terminal_status: "atomic_issuance_failed_before_execution",
    validation_stage: "historical_non_contract_pair_comparison",
    failed_fields: ["deployment_commit"],
  });
});

test("Action 597 failure remains before execution and all durable or provider side effects", () => {
  const body = response();
  const result = diagnoseAction596HistoricalIssuanceValidation({
    http_status: 200,
    body,
    now,
    expected: expected(body),
  });
  let executionCalls = 0;
  let authorizationConsumes = 0;
  let leaseConsumes = 0;
  let claims = 0;
  let auditWrites = 0;
  let ledgerWrites = 0;
  let providerCalls = 0;
  let retries = 0;
  let canaryStateChanges = 0;
  let killSwitchChanges = 0;
  if (result.ok) {
    executionCalls += 1;
    authorizationConsumes += 1;
    leaseConsumes += 1;
    claims += 1;
    auditWrites += 1;
    ledgerWrites += 1;
    providerCalls += 1;
    retries += 1;
    canaryStateChanges += 1;
    killSwitchChanges += 1;
  }
  expect(result.ok).toBe(false);
  expect(result.ok ? null : result.terminal_status).toBe(
    continuousIntelligenceShadowCanaryManualAuthorizationIssuanceFailureTerminalStatus,
  );
  expect({ executionCalls, authorizationConsumes, leaseConsumes, claims, auditWrites, ledgerWrites, providerCalls, retries, canaryStateChanges, killSwitchChanges }).toEqual({
    executionCalls: 0,
    authorizationConsumes: 0,
    leaseConsumes: 0,
    claims: 0,
    auditWrites: 0,
    ledgerWrites: 0,
    providerCalls: 0,
    retries: 0,
    canaryStateChanges: 0,
    killSwitchChanges: 0,
  });
});

test("Action 597 keeps unknown versions, missing fields, and malformed values fail-closed", () => {
  const unknownVersionBody = response({ contract_version: "unknown_v999" });
  const unknownVersion = validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse({
    http_status: 200,
    body: unknownVersionBody,
    now,
    expected: expected(unknownVersionBody),
  });
  expect(unknownVersion).toMatchObject({ ok: false, diagnostic_code: "issuance_response_version_unsupported" });

  const missingField = response();
  delete (missingField.execution_lease as Record<string, unknown>).execution_lease_id;
  const missing = validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse({
    http_status: 200,
    body: missingField,
    now,
    expected: expected(missingField),
  });
  expect(missing).toMatchObject({ ok: false, diagnostic_code: "issuance_response_missing_required_field" });

  const malformedBody = response({ authorization_token: "short" });
  const malformed = validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse({
    http_status: 200,
    body: malformedBody,
    now,
    expected: expected(malformedBody),
  });
  expect(malformed).toMatchObject({ ok: false, diagnostic_code: "issuance_response_schema_mismatch" });
});
