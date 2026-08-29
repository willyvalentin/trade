import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hc-position-version-lineage-v2-committed-result-receipt-cross-result-detachment-review.md";
const evidencePath =
  "docs/evidence/action-666hc-position-version-lineage-v2-committed-result-receipt-cross-result-detachment-review.json";
const receiptPath =
  "lib/server/position-version-lineage-v2-writer-immutable-committed-result-receipt.ts";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const preflightPath =
  "lib/position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666hc-position-version-lineage-v2-committed-result-receipt-cross-result-detachment-review.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const createdPositionId = "550e8400-e29b-41d4-a716-446655440000";
const replayedPositionId = "550e8400-e29b-41d4-a716-446655440001";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function loadReceiptProjector() {
  const transpiled = ts.transpileModule(source(receiptPath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: receiptPath,
  }).outputText;
  const sandbox = {
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: receiptPath });
  return sandbox.exports as {
    PositionVersionLineageV2WriterImmutableCommittedResultReceiptError: new () => Error;
    projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
      decodedResult: unknown,
      canonicalCommandDigest: unknown,
    ): {
      canonicalCommandDigest: string;
      disposition: "created" | "replayed";
      initialHistoryIdentity: string;
      positionId: string;
      positionVersion: 1;
    };
  };
}

function decodedResult(
  disposition: "created" | "replayed",
  positionId: string,
) {
  return Object.freeze({
    disposition,
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1 as const,
  });
}

function expectFrozenScalarReceipt(receipt: Record<string, unknown>) {
  expect(Object.isFrozen(receipt)).toBe(true);
  expect(Reflect.ownKeys(receipt)).toEqual([
    "canonicalCommandDigest",
    "disposition",
    "initialHistoryIdentity",
    "positionId",
    "positionVersion",
  ]);
  expect(Object.values(receipt).every((value) => typeof value !== "object")).toBe(true);
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(receipt))) {
    expect("value" in descriptor).toBe(true);
    expect(descriptor.writable).toBe(false);
    expect(descriptor.configurable).toBe(false);
  }
}

test("666HC independently verifies detached fresh receipts across two decoded results", () => {
  const receiptProjector = loadReceiptProjector();
  const created = decodedResult("created", createdPositionId);
  const replayed = decodedResult("replayed", replayedPositionId);
  const createdReceipt =
    receiptProjector.projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
      created,
      "a".repeat(64),
    );
  const replayedReceipt =
    receiptProjector.projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
      replayed,
      "b".repeat(64),
    );

  expectFrozenScalarReceipt(createdReceipt);
  expectFrozenScalarReceipt(replayedReceipt);
  expect(createdReceipt).toMatchObject({
    canonicalCommandDigest: "a".repeat(64),
    disposition: "created",
    positionId: createdPositionId,
  });
  expect(replayedReceipt).toMatchObject({
    canonicalCommandDigest: "b".repeat(64),
    disposition: "replayed",
    positionId: replayedPositionId,
  });
  expect(new Set([created, replayed, createdReceipt, replayedReceipt]).size).toBe(4);
  expect(createdReceipt).not.toBe(replayedReceipt);
});

test("666HC proves mutations cannot cross inputs or receipts and malformed material fails closed", () => {
  const receiptProjector = loadReceiptProjector();
  const created = decodedResult("created", createdPositionId);
  const replayed = decodedResult("replayed", replayedPositionId);
  const createdReceipt =
    receiptProjector.projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
      created,
      "a".repeat(64),
    );
  const replayedReceipt =
    receiptProjector.projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
      replayed,
      "b".repeat(64),
    );

  expect(Reflect.set(createdReceipt, "positionId", replayedPositionId)).toBe(false);
  expect(Reflect.set(replayedReceipt, "disposition", "created")).toBe(false);
  expect(createdReceipt.positionId).toBe(createdPositionId);
  expect(replayedReceipt.disposition).toBe("replayed");
  for (const [result, digest] of [
    [{ ...created }, "a".repeat(64)],
    [created, "A".repeat(64)],
  ]) {
    expect(() =>
      receiptProjector.projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
        result,
        digest,
      ),
    ).toThrow(receiptProjector.PositionVersionLineageV2WriterImmutableCommittedResultReceiptError);
  }
});

test("666HC stays source-only and is registered once without reopening runtime", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "890780febf87bfdc9ccfa8ed51992166401d2d9e",
    protected_main_tree: "2b2fb3e4c2ebb5be0b746a82d34ccf82c3d616b1",
    exact_main_ci_run: 33257591597,
    exact_main_ci_conclusion: "success",
    receipt_detachment_selection_action: "ACTION_666HB",
  });
  expect(evidence.review).toMatchObject({
    type: "independent_source_only_immutable_committed_result_receipt_cross_result_detachment_review",
    implementation_source_changed: false,
    all_receipts_fresh: true,
    cross_receipt_aliasing: false,
  });
  expect(evidence.containment).toEqual({
    receipt_consumer_or_storage_present: false,
    transport_credential_or_owner_resolution_present: false,
    database_writer_provider_broker_or_runtime_binding_present: false,
    route_ui_or_deployment_authority_present: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(source(receiptPath)).toMatch(/^import "server-only";/);
  expect(source(receiptPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/independent verification only/i);
  expect(documentation).toMatch(/no CI deduplication is\s+authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HC/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HC/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
