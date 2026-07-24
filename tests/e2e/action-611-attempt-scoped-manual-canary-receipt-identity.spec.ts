import { expect, test } from "@playwright/test";

import {
  buildBoundedShadowCollectorExecutionProofBlockedResult,
  buildBoundedShadowCollectorExecutionProofPlan,
  boundedShadowCollectorExecutionProofFingerprint,
  createBoundedShadowCollectorExecutionProofRuntime,
  parseBoundedShadowCollectorExecutionProofRequest,
} from "../../lib/bounded-shadow-collector-execution-proof";
import { buildBoundedShadowCollectorLiveProofReceipt } from "../../lib/bounded-shadow-collector-live-proof-receipt";
import { type ContinuousIntelligenceCreditLedgerEntry } from "../../lib/continuous-intelligence-credit-ledger";
import {
  createContinuousIntelligenceCreditLedgerStore,
  type ContinuousIntelligenceCreditLedgerDatabase,
} from "../../lib/continuous-intelligence-credit-ledger-store";
import {
  createBoundedShadowCollectorProofAuditStore,
  type BoundedShadowCollectorProofAuditDatabase,
  type BoundedShadowCollectorProofAuditRow,
} from "../../lib/bounded-shadow-collector-proof-audit-store";
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

const now = new Date("2026-07-23T15:00:00.000Z");

function fixture() {
  const parsed = parseBoundedShadowCollectorExecutionProofRequest({
    tickers: ["AAPL"],
    interval: "5min",
    start: "2026-07-22T20:30:00.000Z",
    end: "2026-07-22T21:00:00.000Z",
  }, { now });
  if (!parsed.ok) throw new Error("Expected a bounded manual request fixture.");
  const plan = buildBoundedShadowCollectorExecutionProofPlan({
    now,
    provider_metadata_status: "within_budget",
    proof_ticker: "AAPL",
  });
  const preflight = createBoundedShadowCollectorExecutionProofRuntime().preflight({
    request: parsed.value,
    budget_plan: plan.budget_plan,
    provider_configured: true,
    provider_metadata_status: "within_budget",
    execution_feature_enabled: true,
    ticker_input_source: plan.ticker_input_source,
    evaluation_now: plan.evaluation_now,
  });
  if (!preflight.request_fingerprint) throw new Error("Expected a canonical request fingerprint.");
  return { request: parsed.value, preflight };
}

function lifecycle(input: { utc_day: string; request_fingerprint: string }) {
  const executionId = buildContinuousIntelligenceShadowCanaryExecutionId(input);
  return {
    claim_id: `canary_claim_${executionId}`,
    execution_id: executionId,
    request_fingerprint: input.request_fingerprint,
    expected_contract_version: continuousIntelligenceShadowCanaryClaimContractVersion,
    utc_day: input.utc_day,
    source_receipt_id: "scheduled-identity-is-not-used-for-manual-proofs",
  } as const satisfies ContinuousIntelligenceShadowCanaryLifecycleIdentity;
}

function manualAuthorizationId(suffix: string) {
  return `manual_canary_authorization_00000000-0000-4000-8000-${suffix}`;
}

function manualLifecycle(input: {
  identity: ContinuousIntelligenceShadowCanaryLifecycleIdentity;
  authorization_id: string;
}) {
  const identity = buildContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity({
    lifecycle_identity: input.identity,
    authorization_id: input.authorization_id,
  });
  if (!identity) throw new Error("Expected a canonical manual admission lifecycle identity.");
  return identity;
}

function manualReceipt(input: {
  identity: ReturnType<typeof manualLifecycle>;
  generated_at: Date;
}) {
  const { request, preflight } = fixture();
  const receiptId = buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({
    request,
    lifecycle_identity: input.identity,
  });
  if (!receiptId) throw new Error("Expected a canonical manual attempt receipt ID.");
  return buildBoundedShadowCollectorLiveProofReceipt({
    request,
    preflight,
    result: buildBoundedShadowCollectorExecutionProofBlockedResult(
      "provider_failure",
      preflight.request_fingerprint,
      "Provider request failed safely.",
      1,
    ),
    operator_authorization_verified: true,
    authorization_consumed: true,
    receipt_id: receiptId,
    now: input.generated_at,
    entry_kind: "bounded_manual_proof",
    daily_claim_id: input.identity.claim_id,
    daily_claim_status: "completed",
    daily_claim_execution_id: input.identity.execution_id,
  });
}

function auditDatabase() {
  const rows = new Map<string, BoundedShadowCollectorProofAuditRow>();
  const database: BoundedShadowCollectorProofAuditDatabase = {
    async insert(row) {
      if (rows.has(row.receipt_id)) return { data: null, error: { code: "23505" } };
      rows.set(row.receipt_id, structuredClone(row));
      return { data: { receipt_id: row.receipt_id }, error: null };
    },
    async findByReceiptId(receiptId) {
      return { data: rows.get(receiptId) ?? null, error: null };
    },
    async latest() {
      return { data: [...rows.values()].at(-1) ?? null, error: null };
    },
  };
  return { database, rows };
}

function ledgerDatabase() {
  const byReceipt = new Map<string, ContinuousIntelligenceCreditLedgerEntry>();
  const database: ContinuousIntelligenceCreditLedgerDatabase = {
    async insert(entry) {
      if (
        byReceipt.has(entry.source_receipt_id) ||
        [...byReceipt.values()].some((row) => row.ledger_entry_id === entry.ledger_entry_id)
      ) {
        return { data: null, error: { code: "23505" } };
      }
      byReceipt.set(entry.source_receipt_id, structuredClone(entry));
      return { data: { ledger_entry_id: entry.ledger_entry_id }, error: null };
    },
    async update(entry) {
      byReceipt.set(entry.source_receipt_id, structuredClone(entry));
      return { data: { ledger_entry_id: entry.ledger_entry_id }, error: null };
    },
    async findBySourceReceiptId(receiptId) {
      return { data: byReceipt.get(receiptId) ?? null, error: null };
    },
    async findByLedgerEntryId(entryId) {
      return { data: [...byReceipt.values()].find((row) => row.ledger_entry_id === entryId) ?? null, error: null };
    },
    async latest() {
      return { data: [...byReceipt.values()].at(-1) ?? null, error: null };
    },
    async listCanaryEntriesForUtcDay() {
      return { data: [], error: null };
    },
  };
  return { database, byReceipt };
}

test("Action 611 makes manual receipt identity attempt-scoped while retaining scheduled identity", () => {
  const { request, preflight } = fixture();
  const action604 = manualLifecycle({
    identity: lifecycle({ utc_day: "2026-07-22", request_fingerprint: preflight.request_fingerprint }),
    authorization_id: manualAuthorizationId("000000000604"),
  });
  const action609 = manualLifecycle({
    identity: lifecycle({ utc_day: "2026-07-23", request_fingerprint: preflight.request_fingerprint }),
    authorization_id: manualAuthorizationId("000000000609"),
  });
  const action604Id = buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({ request, lifecycle_identity: action604 });
  const action609Id = buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({ request, lifecycle_identity: action609 });

  expect(action604Id).not.toBeNull();
  expect(action609Id).not.toBeNull();
  expect(action604Id).not.toBe(action609Id);
  expect(action604Id).toBe(buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({ request, lifecycle_identity: action604 }));
  expect(action604Id).toContain(action604.execution_id);
  expect(action604Id).not.toContain("token");
  expect(action604Id).not.toContain("lease");

  const scheduledId = buildContinuousIntelligenceShadowCanaryReceiptId(request);
  expect(scheduledId).toBe(`canary_receipt_${boundedShadowCollectorExecutionProofFingerprint(request).replaceAll("|", "_").replaceAll(":", "-").slice(0, 96)}`);
  expect(scheduledId).not.toContain("manual_canary_receipt");
});

test("Action 611 fails closed for missing or malformed manual claim identity", () => {
  const { request, preflight } = fixture();
  const valid = manualLifecycle({
    identity: lifecycle({ utc_day: "2026-07-23", request_fingerprint: preflight.request_fingerprint }),
    authorization_id: manualAuthorizationId("000000000611"),
  });
  expect(buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({
    request,
    lifecycle_identity: { ...valid, claim_id: "canary_claim_other" },
  })).toBeNull();
  expect(buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({
    request,
    lifecycle_identity: { ...valid, request_fingerprint: "other-request" },
  })).toBeNull();
  expect(buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({
    request,
    lifecycle_identity: { ...valid, execution_id: "other-execution" },
  })).toBeNull();
});

test("Action 611 persists audit and ledger separately for identical windows on different claims", async () => {
  const { preflight } = fixture();
  const action604 = manualReceipt({
    identity: manualLifecycle({
      identity: lifecycle({ utc_day: "2026-07-22", request_fingerprint: preflight.request_fingerprint }),
      authorization_id: manualAuthorizationId("000000000604"),
    }),
    generated_at: new Date("2026-07-22T21:01:00.000Z"),
  });
  const action609 = manualReceipt({
    identity: manualLifecycle({
      identity: lifecycle({ utc_day: "2026-07-23", request_fingerprint: preflight.request_fingerprint }),
      authorization_id: manualAuthorizationId("000000000609"),
    }),
    generated_at: new Date("2026-07-23T00:49:03.995Z"),
  });
  const audits = auditDatabase();
  const ledgers = ledgerDatabase();
  const auditStore = createBoundedShadowCollectorProofAuditStore(audits.database);
  const ledgerStore = createContinuousIntelligenceCreditLedgerStore(ledgers.database);

  for (const receipt of [action604, action609]) {
    expect(await auditStore.persist(receipt)).toMatchObject({ status: "persisted", persisted: true });
    expect(await ledgerStore.persist({
      receipt,
      durable_audit: { status: "persisted", persisted: true },
      now: new Date("2030-01-01T00:00:00.000Z"),
    })).toMatchObject({ status: "persisted", persisted: true });
  }

  const repeated = await ledgerStore.persist({
    receipt: action609,
    durable_audit: { status: "persisted", persisted: true },
    now: new Date("2031-01-01T00:00:00.000Z"),
  });
  expect(repeated).toMatchObject({ status: "already_persisted", persisted: true, idempotent: true });
  expect(audits.rows.size).toBe(2);
  expect(ledgers.byReceipt.size).toBe(2);

  const action609Ledger = ledgers.byReceipt.get(action609.receipt_id);
  expect(action609Ledger).toMatchObject({
    source_receipt_id: action609.receipt_id,
    ledger_entry_id: `credit_ledger_${action609.receipt_id}`,
    entry_kind: "bounded_manual_proof",
    durable_audit_persisted: true,
    generated_at: action609.generated_at,
  });
  expect(audits.rows.get(action609.receipt_id)?.daily_claim_id).toBe(action609.daily_claim_id);
  expect(JSON.stringify({ audit: action609, ledger: action609Ledger })).not.toMatch(/token|lease|secret|raw/i);

  const conflictingAttempt = {
    ...action609,
    receipt_id: action604.receipt_id,
  };
  expect(await ledgerStore.persist({
    receipt: conflictingAttempt,
    durable_audit: { status: "persisted", persisted: true },
  })).toMatchObject({ status: "validation_failed", persisted: false });
  expect(ledgers.byReceipt.size).toBe(2);
});
