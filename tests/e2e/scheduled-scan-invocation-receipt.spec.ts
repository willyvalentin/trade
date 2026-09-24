import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  decisionBuildCommitForScheduledInvocation,
  mergeScheduledScanAttemptPayload,
  scheduledScanInvocationReceiptFromAttempt,
} from "@/lib/scheduled-scan-invocation-receipt";

const deployedCommit = "0123456789abcdef0123456789abcdef01234567";
const deployedIdentity = {
  schema_version: "scheduled_scan_deployment_identity_v1",
  deploy_id: "6ab550def4c6774430f3c9ca",
  deploy_context: "production",
  commit_ref: deployedCommit,
  site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
} as const;

function invocationPayload() {
  return {
    execution_boundary: "scheduler_disabled_normal_scan_one_shot",
    scheduled_slot_started_at_utc: "2026-09-24T16:30:00.000Z",
    scheduled_slot_identity_source: "netlify_event_next_run",
    build_deployment_identity: deployedIdentity,
    netlify_deploy: {
      deploy_id: deployedIdentity.deploy_id,
      deploy_context: "production",
      deploy_published: false,
    },
  };
}

test.describe("scheduled scan invocation receipt", () => {
  test("preserves a validated scheduler slot and generated build identity through route persistence", () => {
    const receipt = scheduledScanInvocationReceiptFromAttempt({
      source: "netlify_scheduled_function",
      mode: "scheduled",
      payload: invocationPayload(),
    });

    expect(receipt).not.toBeNull();
    const merged = mergeScheduledScanAttemptPayload({
      invocationReceipt: receipt,
      routePayload: {
        scheduled_slot_started_at_utc: "2026-09-24T16:45:00.000Z",
        build_deployment_identity: null,
        active_scan_trace: { status: "empty" },
      },
    });

    expect(merged).toMatchObject({
      scheduled_slot_started_at_utc: "2026-09-24T16:30:00.000Z",
      build_deployment_identity: deployedIdentity,
      active_scan_trace: { status: "empty" },
      scheduled_scan_invocation_receipt: {
        receipt_version: "scheduled_scan_invocation_receipt_v1",
        scheduled_slot_identity_source: "netlify_event_next_run",
      },
    });
    expect(
      decisionBuildCommitForScheduledInvocation({
        invocationReceipt: receipt,
        runtimeBuildCommit: null,
      }),
    ).toBe(deployedCommit);
  });

  test("fails closed on a manual-style, malformed or noncanonical scheduler envelope", () => {
    const cases = [
      { source: "manual", mode: "scheduled", payload: invocationPayload() },
      {
        source: "netlify_scheduled_function",
        mode: "scheduled",
        payload: {
          ...invocationPayload(),
          scheduled_slot_started_at_utc: "2026-09-24T16:31:00.000Z",
        },
      },
      {
        source: "netlify_scheduled_function",
        mode: "scheduled",
        payload: {
          ...invocationPayload(),
          build_deployment_identity: {
            ...deployedIdentity,
            commit_ref: "not-a-commit",
          },
        },
      },
    ];

    for (const input of cases) {
      expect(scheduledScanInvocationReceiptFromAttempt(input)).toBeNull();
    }
  });

  test("uses a runtime build commit only outside a validated scheduled invocation", () => {
    expect(
      decisionBuildCommitForScheduledInvocation({
        invocationReceipt: null,
        runtimeBuildCommit: deployedCommit,
      }),
    ).toBe(deployedCommit);
  });

  test("wires the durable receipt into both scheduler persistence and route admission", () => {
    const repositoryRoot = resolve(__dirname, "../..");
    const scheduledFunction = readFileSync(
      resolve(repositoryRoot, "netlify/functions/scheduled-scan.ts"),
      "utf8",
    );
    const privateRoute = readFileSync(
      resolve(repositoryRoot, "app/api/automation/run-scan/route.ts"),
      "utf8",
    );

    expect(scheduledFunction).toContain(
      "build_deployment_identity: buildDeploymentIdentity",
    );
    expect(privateRoute).toContain("readScheduledScanInvocationReceipt(");
    expect(privateRoute).toContain("scheduled_invocation_receipt_unavailable");
    expect(privateRoute).toContain("scheduledInvocationReceipt,");
  });
});
