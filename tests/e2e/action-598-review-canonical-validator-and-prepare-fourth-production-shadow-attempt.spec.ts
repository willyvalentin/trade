import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  continuousIntelligenceShadowCanaryManualAuthorizationIssuanceFailureTerminalStatus,
  validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response";

const now = new Date("2026-07-23T15:00:30.000Z");
const routePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/route.ts";

function response() {
  const authorization = {
    authorization_id: "manual_canary_authorization_fixture",
    issued_at: "2026-07-23T15:00:00.000000+00:00",
    expires_at: "2026-07-23T15:01:00.000000+00:00",
    consumed_at: null,
    status: "issued",
    request_fingerprint: "fixture_fingerprint",
    execution_id: "fixture_execution",
    claim_id: "fixture_claim",
    ticker: "AAPL",
    interval: "5min",
    requested_start: "2026-07-23T14:30:00.000000+00:00",
    requested_end: "2026-07-23T15:00:00.000000+00:00",
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
  return {
    contract_version: "continuous_intelligence_shadow_canary_manual_authorization_v1",
    issued: true,
    authorization,
    execution_lease: {
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
    },
    authorization_token: "x".repeat(43),
    raw_token_returned_once: true,
    provider_calls_executed: false,
    claims_created: false,
    attempts_begun: false,
    audit_or_ledger_writes_executed: false,
  };
}

function expected(body: ReturnType<typeof response>) {
  return {
    authorization_id: body.authorization.authorization_id,
    execution_lease_id: body.execution_lease.execution_lease_id,
  };
}

function validate(body: ReturnType<typeof response>, expectedIds = expected(body)) {
  return validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse({
    http_status: 200,
    body,
    now,
    expected: expectedIds,
  });
}

test("Action 598 real issuance route invokes the canonical validator before exposing the token response", () => {
  const route = readFileSync(resolve(process.cwd(), routePath), "utf8");
  const importIndex = route.indexOf("validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse");
  const responseIndex = route.indexOf("const response = {");
  const validationIndex = route.indexOf("const validation = validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse");
  const semanticFailureIndex = route.indexOf("Manual canary issuance response failed semantic validation.");
  const successIndex = route.indexOf("return json(response);");
  expect(importIndex).toBeGreaterThan(-1);
  expect(responseIndex).toBeGreaterThan(-1);
  expect(validationIndex).toBeGreaterThan(responseIndex);
  expect(semanticFailureIndex).toBeGreaterThan(validationIndex);
  expect(successIndex).toBeGreaterThan(semanticFailureIndex);
  expect(route).toContain("terminal_status: validation.terminal_status");
  expect(route).toContain("diagnostic_code: validation.diagnostic_code");
  expect((route.match(/issueContinuousIntelligenceShadowCanaryManualAuthorizationWithLease/g) ?? []).length).toBe(2);
  expect(route).not.toContain("retry");
  expect(route).not.toContain("executeContinuousIntelligenceShadowCanary");
  expect(route).not.toContain("getIntradayCandlesWithDiagnostics");
  expect(route).not.toContain("persistBoundedShadowCollectorProofAudit");
  expect(route).not.toContain("persistContinuousIntelligenceCreditLedger");
  expect(route).not.toContain("process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED =");
  expect(route).not.toContain("process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH =");
});

test("Action 598 accepts the public response without a lease deployment_commit", () => {
  const body = response();
  expect("deployment_commit" in body.execution_lease).toBe(false);
  expect(validate(body)).toEqual({ ok: true, diagnostic_code: null, terminal_status: null });
});

test("Action 598 keeps genuine shared and persisted identity mismatches fail-closed", () => {
  const sharedMismatch = response();
  sharedMismatch.execution_lease.authorization_id = "different_authorization";
  expect(validate(sharedMismatch)).toMatchObject({
    ok: false,
    diagnostic_code: "issuance_response_binding_mismatch",
    validation_stage: "shared_binding",
    failed_fields: ["authorization_id"],
  });

  const authorizationIdMismatch = response();
  expect(validate(authorizationIdMismatch, {
    ...expected(authorizationIdMismatch),
    authorization_id: "other_persisted_authorization",
  })).toMatchObject({
    ok: false,
    diagnostic_code: "issuance_response_binding_mismatch",
    validation_stage: "authorization_identity",
    failed_fields: ["authorization_id"],
  });

  const leaseIdMismatch = response();
  expect(validate(leaseIdMismatch, {
    ...expected(leaseIdMismatch),
    execution_lease_id: "other_persisted_lease",
  })).toMatchObject({
    ok: false,
    diagnostic_code: "issuance_response_binding_mismatch",
    validation_stage: "lease_identity",
    failed_fields: ["execution_lease_id"],
  });
});

test("Action 598 maps HTTP 200 semantic failures to the terminal diagnostic before any next-stage effect", () => {
  const body = response();
  body.execution_lease.request_fingerprint = "mismatched_fingerprint";
  const result = validate(body);
  let executionCalls = 0;
  let consumes = 0;
  let claims = 0;
  let auditWrites = 0;
  let ledgerWrites = 0;
  let usageWrites = 0;
  let providerCalls = 0;
  let retries = 0;
  let canaryChanges = 0;
  let killSwitchChanges = 0;
  if (result.ok) {
    executionCalls += 1;
    consumes += 2;
    claims += 1;
    auditWrites += 1;
    ledgerWrites += 1;
    usageWrites += 1;
    providerCalls += 1;
    retries += 1;
    canaryChanges += 1;
    killSwitchChanges += 1;
  }
  expect(result).toMatchObject({
    ok: false,
    diagnostic_code: "issuance_response_binding_mismatch",
    terminal_status: continuousIntelligenceShadowCanaryManualAuthorizationIssuanceFailureTerminalStatus,
  });
  expect({ executionCalls, consumes, claims, auditWrites, ledgerWrites, usageWrites, providerCalls, retries, canaryChanges, killSwitchChanges }).toEqual({
    executionCalls: 0,
    consumes: 0,
    claims: 0,
    auditWrites: 0,
    ledgerWrites: 0,
    usageWrites: 0,
    providerCalls: 0,
    retries: 0,
    canaryChanges: 0,
    killSwitchChanges: 0,
  });
});

test("Action 598 has no public nonce, digest, or signature contract to compare", () => {
  const serialized = JSON.stringify(response());
  expect(serialized).not.toContain("nonce");
  expect(serialized).not.toContain("digest");
  expect(serialized).not.toContain("signature");
  expect(serialized).not.toContain("token_hash");
});
