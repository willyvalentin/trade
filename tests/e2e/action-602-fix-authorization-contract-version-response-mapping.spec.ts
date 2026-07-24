import { expect, test } from "@playwright/test";

import {
  continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
  parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord,
  sanitizeContinuousIntelligenceShadowCanaryManualAuthorization,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  continuousIntelligenceShadowCanaryManualExecutionLeaseContractVersion,
} from "../../lib/continuous-intelligence-shadow-canary-manual-execution-lease";
import {
  validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response";

const now = new Date("2026-07-23T15:00:30.000Z");

function authorizationRecord(contractVersion: string = continuousIntelligenceShadowCanaryManualAuthorizationContractVersion) {
  return parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord({
    authorization_id: "manual_canary_authorization_action_602",
    contract_version: contractVersion,
    purpose: "one_manual_shadow_canary_attempt",
    issued_at: "2026-07-23T15:00:00.123+00:00",
    expires_at: "2026-07-23T15:01:00.123+00:00",
    consumed_at: null,
    authorization_status: "issued",
    request_fingerprint: "action_602_fingerprint",
    execution_id: "action_602_execution",
    claim_id: "action_602_claim",
    ticker: "AAPL",
    market_interval: "5min",
    requested_start: "2026-07-23T14:30:00+00:00",
    requested_end: "2026-07-23T15:00:00+00:00",
    calendar_contract_version: "us_equity_market_calendar_v1",
    calendar_fingerprint: "action_602_calendar",
    budget_policy_version: "continuous_intelligence_credit_ledger_v1",
    policy_total_credits: 377,
    policy_hard_reserve_credits: 57,
    policy_normal_planned_max_credits: 320,
    estimated_credits: 1,
    canary_contract_version: "continuous_intelligence_shadow_collector_canary_v1",
    claim_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1",
    deployment_commit: "a".repeat(40),
    deployment_build_marker: "continuous_intelligence_shadow_canary_function_foundation_v1",
  });
}

function response() {
  const authorization = authorizationRecord();
  if (!authorization) throw new Error("fixture authorization must parse");
  const publicAuthorization = sanitizeContinuousIntelligenceShadowCanaryManualAuthorization(authorization);
  return {
    contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
    issued: true,
    authorization: publicAuthorization,
    execution_lease: {
      execution_lease_id: "manual_canary_execution_lease_action_602",
      authorization_id: publicAuthorization.authorization_id,
      issued_at: publicAuthorization.issued_at,
      expires_at: publicAuthorization.expires_at,
      consumed_at: null,
      status: "issued",
      request_fingerprint: publicAuthorization.request_fingerprint,
      execution_id: publicAuthorization.execution_id,
      claim_id: publicAuthorization.claim_id,
      ticker: "AAPL",
      interval: "5min",
      requested_start: publicAuthorization.requested_start,
      requested_end: publicAuthorization.requested_end,
      policy_total_credits: 377,
      policy_hard_reserve_credits: 57,
      policy_normal_planned_max_credits: 320,
      estimated_credits: 1,
      contract_version: continuousIntelligenceShadowCanaryManualExecutionLeaseContractVersion,
    },
    authorization_token: "x".repeat(43),
    raw_token_returned_once: true,
    provider_calls_executed: false,
    claims_created: false,
    attempts_begun: false,
    audit_or_ledger_writes_executed: false,
  };
}

function validate(body: unknown) {
  return validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse({
    http_status: 200,
    body,
    now,
    expected: {
      authorization_id: "manual_canary_authorization_action_602",
      execution_lease_id: "manual_canary_execution_lease_action_602",
    },
  });
}

test("Action 602 emits the one canonical authorization version at the public response boundary", () => {
  const record = authorizationRecord();
  expect(record).not.toBeNull();
  expect(sanitizeContinuousIntelligenceShadowCanaryManualAuthorization(record!)).toMatchObject({
    contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
  });
  expect(validate(response())).toEqual({ ok: true, diagnostic_code: null, terminal_status: null });
});

test("Action 602 preserves strict unsupported, missing, and malformed authorization-version rejection", () => {
  expect(authorizationRecord("unsupported_authorization_v2")).toBeNull();

  const canonical = response();
  const unsupported = {
    ...canonical,
    authorization: {
      ...canonical.authorization,
      contract_version: "unsupported_authorization_v2",
    },
  };
  expect(validate(unsupported)).toMatchObject({
    ok: false,
    diagnostic_code: "issuance_response_version_unsupported",
    validation_stage: "authorization_contract",
  });

  const authorizationWithoutContractVersion = Object.fromEntries(
    Object.entries(canonical.authorization).filter(([key]) => key !== "contract_version"),
  );
  const missing = {
    ...canonical,
    authorization: authorizationWithoutContractVersion,
  };
  expect(validate(missing)).toMatchObject({
    ok: false,
    diagnostic_code: "issuance_response_version_unsupported",
    validation_stage: "authorization_contract",
  });

  const malformed = {
    ...canonical,
    authorization: { ...canonical.authorization, contract_version: 1 },
  };
  expect(validate(malformed)).toMatchObject({
    ok: false,
    diagnostic_code: "issuance_response_version_unsupported",
    validation_stage: "authorization_contract",
  });
});

test("Action 602 preserves the separate lease version and no-effect issuance contract", () => {
  const body = response();
  expect(body.execution_lease.contract_version).toBe(
    continuousIntelligenceShadowCanaryManualExecutionLeaseContractVersion,
  );
  expect(body).toMatchObject({
    provider_calls_executed: false,
    claims_created: false,
    attempts_begun: false,
    audit_or_ledger_writes_executed: false,
  });
});
