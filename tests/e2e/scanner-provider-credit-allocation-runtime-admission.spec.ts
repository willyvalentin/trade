import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV,
  buildScannerProviderCreditAllocationRuntimeAdmission,
  scannerProviderCreditAllocationRuntimeAdmissionFromEnvironment,
  scannerProviderCreditAllocationRuntimeAdmissionFromUnknown,
} from "@/lib/scanner-provider-credit-allocation-runtime-admission";
import { SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT } from "@/lib/scanner-provider-credit-allocation-live-experiment";
import {
  SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
  SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
} from "@/lib/scanner-provider-credit-allocation-plan";
import type { ScheduledScanInvocationReceipt } from "@/lib/scheduled-scan-invocation-receipt";

const revision = "a".repeat(40);
const experimentId =
  SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.experiment_id;
const repositoryRoot = path.resolve(__dirname, "../..");

function receipt(
  slot = "2026-10-01T14:45:00.000Z",
  commit = revision,
): ScheduledScanInvocationReceipt {
  return {
    receipt_version: "scheduled_scan_invocation_receipt_v1",
    scheduled_slot_started_at_utc: slot,
    scheduled_slot_identity_source: "netlify_event_next_run",
    build_deployment_identity: {
      schema_version: "scheduled_scan_deployment_identity_v1",
      deploy_id: "a".repeat(24),
      deploy_context: "production",
      commit_ref: commit,
      site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
    },
    durable_invocation_payload: {},
  };
}

function environment(values: Record<string, string>) {
  return { get: (name: string) => values[name] };
}

test("defaults to the baseline policy with no runtime authority", () => {
  const admission =
    scannerProviderCreditAllocationRuntimeAdmissionFromEnvironment({
      environment: environment({}),
      requestSource: "netlify_scheduled_function",
      scheduledInvocationReceipt: receipt(),
      now: new Date("2026-10-01T14:45:30.000Z"),
    });

  expect(admission).toMatchObject({
    status: "disabled",
    selected_policy_version: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    scheduled_invocation_bound: true,
    authority: {
      can_select_allocation_policy: false,
      can_call_provider: false,
      can_reserve_provider_credit: false,
      can_change_ranking_or_publication: false,
      can_lower_threshold: false,
      can_publish_candidate: false,
      can_execute_broker_action: false,
    },
  });
});

test("admits the challenger only for the exact scheduler receipt, slot and revision", () => {
  const admission =
    scannerProviderCreditAllocationRuntimeAdmissionFromEnvironment({
      environment: environment({
        [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV]: "true",
        [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV]: experimentId,
        [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV]:
          revision,
      }),
      requestSource: "netlify_scheduled_function",
      scheduledInvocationReceipt: receipt(),
      now: new Date("2026-10-01T14:45:30.000Z"),
    });

  expect(admission).toMatchObject({
    status: "admitted",
    arm: "challenger",
    pair: 1,
    scheduled_slot_utc: "2026-10-01T14:45:00.000Z",
    selected_policy_version: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    expected_revision: revision,
    deployed_revision: revision,
    authority: { can_select_allocation_policy: true },
  });
  expect(admission.admission_fingerprint).toMatch(/^[0-9a-f]{64}$/);
});

test("fails closed to baseline for manual source, missing receipt or revision drift", () => {
  const enabled = {
    [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV]: "true",
    [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV]: experimentId,
    [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV]:
      revision,
  };
  const blocked = [
    scannerProviderCreditAllocationRuntimeAdmissionFromEnvironment({
      environment: environment(enabled),
      requestSource: "manual",
      scheduledInvocationReceipt: receipt(),
      now: new Date("2026-10-01T14:45:30.000Z"),
    }),
    scannerProviderCreditAllocationRuntimeAdmissionFromEnvironment({
      environment: environment(enabled),
      requestSource: "netlify_scheduled_function",
      scheduledInvocationReceipt: null,
      now: new Date("2026-10-01T14:45:30.000Z"),
    }),
    scannerProviderCreditAllocationRuntimeAdmissionFromEnvironment({
      environment: environment(enabled),
      requestSource: "netlify_scheduled_function",
      scheduledInvocationReceipt: receipt(
        "2026-10-01T14:45:00.000Z",
        "b".repeat(40),
      ),
      now: new Date("2026-10-01T14:45:30.000Z"),
    }),
  ];

  expect(blocked.every((item) => item.status === "blocked")).toBe(true);
  expect(
    blocked.every(
      (item) =>
        item.selected_policy_version ===
          SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION &&
        item.authority.can_select_allocation_policy === false,
    ),
  ).toBe(true);
  expect(blocked[0].reason_codes).toContain(
    "runtime_allocation_scheduled_invocation_required",
  );
});

test("strict readback rejects any altered or extra runtime admission field", () => {
  const admission = buildScannerProviderCreditAllocationRuntimeAdmission({
    enabled: true,
    experimentId,
    scheduledInvocationBound: true,
    scheduledSlotUtc: "2026-10-01T14:30:00.000Z",
    now: new Date("2026-10-01T14:30:30.000Z"),
    expectedRevision: revision,
    deployedRevision: revision,
  });
  expect(
    scannerProviderCreditAllocationRuntimeAdmissionFromUnknown(admission),
  ).toEqual(admission);
  expect(
    scannerProviderCreditAllocationRuntimeAdmissionFromUnknown({
      ...admission,
      selected_policy_version:
        SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    }),
  ).toBeNull();
  expect(
    scannerProviderCreditAllocationRuntimeAdmissionFromUnknown({
      ...admission,
      extra: true,
    }),
  ).toBeNull();
  expect(
    scannerProviderCreditAllocationRuntimeAdmissionFromUnknown({
      ...admission,
      admission_fingerprint: "0".repeat(64),
    }),
  ).toBeNull();
});

test("normal route persists the exact scheduler-bound admission without executing it", () => {
  const routeSource = readFileSync(
    path.join(repositoryRoot, "app/api/automation/run-scan/route.ts"),
    "utf8",
  );
  const traceSource = readFileSync(
    path.join(repositoryRoot, "lib/active-scan-trace.ts"),
    "utf8",
  );
  const receiptSource = readFileSync(
    path.join(repositoryRoot, "lib/observation-cycle-receipt.ts"),
    "utf8",
  );

  expect(routeSource).toContain(
    "scannerProviderCreditAllocationRuntimeAdmissionFromEnvironment",
  );
  expect(routeSource).toContain("scheduledInvocationReceipt,");
  expect(routeSource).toContain(
    "provider_credit_allocation_runtime_admission:",
  );
  expect(traceSource).toContain(
    "provider_credit_allocation_runtime_admission: ScannerProviderCreditAllocationRuntimeAdmission | null",
  );
  expect(receiptSource).toContain(
    "scannerProviderCreditAllocationRuntimeAdmissionFromUnknown",
  );
  expect(receiptSource).toContain(
    "provider_credit_allocation_runtime_admission?: ScannerProviderCreditAllocationRuntimeAdmission",
  );

  // This CLOSED slice records policy-selection authority only. The scanner
  // execution path is deliberately unchanged until plan/actual reconciliation
  // and cache-demand snapshotting are delivered together.
  expect(routeSource).not.toContain(
    "allocationPolicyVersion: providerCreditAllocationRuntimeAdmission.selected_policy_version",
  );
});
