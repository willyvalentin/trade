import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  boundedShadowCollectorExecutionProofFingerprint,
  parseBoundedShadowCollectorExecutionProofRequest,
} from "../../lib/bounded-shadow-collector-execution-proof";
import {
  buildContinuousIntelligenceShadowCanaryExecutionId,
  continuousIntelligenceShadowCanaryClaimContractVersion,
  type ContinuousIntelligenceShadowCanaryLifecycleIdentity,
} from "../../lib/continuous-intelligence-shadow-canary-claim-store";
import {
  buildContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId,
  buildContinuousIntelligenceShadowCanaryReceiptId,
} from "../../lib/continuous-intelligence-shadow-collector-canary";
import {
  parseContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus,
  statusForContinuousIntelligenceShadowCanaryManualExecutionAdmission,
} from "../../lib/continuous-intelligence-shadow-canary-manual-execution-lease";

const root = path.resolve(__dirname, "../..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");
const manualAuthorizationRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/route.ts";
const manualExecutionRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution/route.ts";
const persistencePath = "lib/server/continuous-intelligence-shadow-canary-manual-authorization-persistence.ts";

function request() {
  const parsed = parseBoundedShadowCollectorExecutionProofRequest({
    tickers: ["AAPL"],
    interval: "5min",
    start: "2026-07-23T20:30:00.000Z",
    end: "2026-07-23T21:00:00.000Z",
  }, { now: new Date("2026-07-23T21:00:00.000Z") });
  if (!parsed.ok) throw new Error("Expected a canonical bounded request.");
  return parsed.value;
}

function baseLifecycle(): ContinuousIntelligenceShadowCanaryLifecycleIdentity {
  const canonicalRequest = request();
  const requestFingerprint = boundedShadowCollectorExecutionProofFingerprint(canonicalRequest);
  const utcDay = "2026-07-23";
  const executionId = buildContinuousIntelligenceShadowCanaryExecutionId({ utc_day: utcDay, request_fingerprint: requestFingerprint });
  return {
    claim_id: `canary_claim_${executionId}`,
    execution_id: executionId,
    request_fingerprint: requestFingerprint,
    expected_contract_version: continuousIntelligenceShadowCanaryClaimContractVersion,
    utc_day: utcDay,
    source_receipt_id: buildContinuousIntelligenceShadowCanaryReceiptId(canonicalRequest),
  };
}

function authorizationId(suffix: string) {
  return `manual_canary_authorization_00000000-0000-4000-8000-${suffix}`;
}

function attemptIdentity(suffix: string) {
  const identity = buildContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity({
    lifecycle_identity: baseLifecycle(),
    authorization_id: authorizationId(suffix),
  });
  if (!identity) throw new Error("Expected a canonical manual admission identity.");
  return identity;
}

test("Action 615 scopes manual admission identity to the server-issued authorization without changing scheduled identity", () => {
  const action604 = attemptIdentity("000000000604");
  const action609 = attemptIdentity("000000000609");
  const action613 = attemptIdentity("000000000613");
  const repeated613 = attemptIdentity("000000000613");
  const canonicalRequest = request();

  expect(new Set([action604.claim_id, action609.claim_id, action613.claim_id]).size).toBe(3);
  expect(new Set([action604.execution_id, action609.execution_id, action613.execution_id]).size).toBe(3);
  expect(action613).toEqual(repeated613);
  expect(buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({ request: canonicalRequest, lifecycle_identity: action613 }))
    .toBe(buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({ request: canonicalRequest, lifecycle_identity: repeated613 }));
  expect(buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({ request: canonicalRequest, lifecycle_identity: action604 }))
    .not.toBe(buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({ request: canonicalRequest, lifecycle_identity: action609 }));
  expect(action613.execution_id).not.toContain("raw-token");
  expect(action613.claim_id).not.toContain("raw-token");
  expect(buildContinuousIntelligenceShadowCanaryReceiptId(canonicalRequest)).toBe(baseLifecycle().source_receipt_id);
});

test("Action 615 fails closed for malformed manual identity and retains exact typed daily usage status", () => {
  const valid = attemptIdentity("000000000615");
  expect(buildContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity({
    lifecycle_identity: baseLifecycle(),
    authorization_id: "manual_canary_authorization_not-a-uuid",
  })).toBeNull();
  expect(buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({
    request: request(),
    lifecycle_identity: { ...valid, claim_id: "canary_claim_wrong" },
  })).toBeNull();

  expect(parseContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus("daily_usage_unavailable"))
    .toBe("daily_usage_unavailable");
  expect(statusForContinuousIntelligenceShadowCanaryManualExecutionAdmission("daily_usage_unavailable")).toBe(503);
  expect(parseContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus("unexpected_status")).toBeNull();
  expect(statusForContinuousIntelligenceShadowCanaryManualExecutionAdmission("unavailable")).toBe(503);
});

test("Action 615 preserves typed daily usage failure through the persistence adapter and blocks before provider entry", () => {
  const issuance = read(manualAuthorizationRoutePath);
  const execution = read(manualExecutionRoutePath);
  const persistence = read(persistencePath);

  expect(issuance).toContain("buildContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity");
  expect(execution).toContain("buildContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity");
  expect(execution).toContain("failure_category: admission.status");
  expect(execution).toContain("statusForContinuousIntelligenceShadowCanaryManualExecutionAdmission(admission.status)");
  expect(execution.indexOf('if (admission.status !== "attempt_started")')).toBeLessThan(
    execution.lastIndexOf("executeContinuousIntelligenceShadowCanary"),
  );
  expect(persistence).toContain("parseContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus");
  expect(persistence).not.toContain('raw.admission_status === "daily_usage_unavailable"');
});
