import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ha-position-version-lineage-v2-committed-result-receipt-containment-review.md";
const evidencePath =
  "docs/evidence/action-666ha-position-version-lineage-v2-committed-result-receipt-containment-review.json";
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
  "tests/e2e/action-666ha-position-version-lineage-v2-committed-result-receipt-containment-review.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const positionId = "550e8400-e29b-41d4-a716-446655440000";

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

function decodedResult(disposition: "created" | "replayed") {
  return Object.freeze({
    disposition,
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1 as const,
  });
}

test("666HA independently verifies fresh frozen receipts for both admitted dispositions", () => {
  const receiptProjector = loadReceiptProjector();
  const created = decodedResult("created");
  const replayed = decodedResult("replayed");
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

  expect(createdReceipt).toEqual({
    canonicalCommandDigest: "a".repeat(64),
    disposition: "created",
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1,
  });
  expect(replayedReceipt).toEqual({
    canonicalCommandDigest: "b".repeat(64),
    disposition: "replayed",
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1,
  });
  expect(createdReceipt).not.toBe(created);
  expect(replayedReceipt).not.toBe(replayed);
  expect(createdReceipt).not.toBe(replayedReceipt);
  expect(Object.isFrozen(createdReceipt)).toBe(true);
  expect(Object.isFrozen(replayedReceipt)).toBe(true);
});

test("666HA independently verifies malformed material fails closed before receipt projection", () => {
  const receiptProjector = loadReceiptProjector();
  const valid = decodedResult("created");
  const accessorResult = Object.freeze({
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1,
    get disposition() {
      return "created";
    },
  });
  const inheritedResult = Object.freeze(Object.assign(Object.create({}), valid));
  const invalidResults = [
    null,
    [valid],
    { ...valid },
    Object.freeze({ ...valid, canonicalCommandDigest: "a".repeat(64) }),
    Object.freeze({ ...valid, legacySnapshotId: "forbidden" }),
    Object.freeze({ ...valid, initialHistoryIdentity: `${positionId}:${owner}:2` }),
    Object.freeze({ ...valid, [Symbol("unexpected")]: "unexpected" }),
    accessorResult,
    inheritedResult,
  ];

  for (const value of invalidResults) {
    expect(() =>
      receiptProjector.projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
        value,
        "a".repeat(64),
      ),
    ).toThrow(receiptProjector.PositionVersionLineageV2WriterImmutableCommittedResultReceiptError);
  }

  for (const invalidDigest of [null, "a".repeat(63), "A".repeat(64), "g".repeat(64)]) {
    expect(() =>
      receiptProjector.projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
        valid,
        invalidDigest,
      ),
    ).toThrow(receiptProjector.PositionVersionLineageV2WriterImmutableCommittedResultReceiptError);
  }
});

test("666HA stays independent, source-only and registered once without reopening runtime", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "ba5ea10fa975d05c1a47a08aba313bfe73d984f3",
    protected_main_tree: "2f0a73fe4064242df06780440274c56ccd4715b3",
    exact_main_ci_run: 33250948002,
    exact_main_ci_conclusion: "success",
    receipt_implementation_action: "ACTION_666GZ",
  });
  expect(evidence.review).toMatchObject({
    type: "independent_source_only_receipt_containment_review",
    implementation_source_changed: false,
    verified_output: "fresh_frozen_five_scalar_in_memory_committed_result_receipt",
  });
  expect(evidence.containment).toEqual({
    transport_operation_present: false,
    credential_or_identity_resolution_present: false,
    database_writer_or_durable_receipt_operation_present: false,
    adapter_route_ui_or_runtime_binding_present: false,
    provider_broker_deployment_or_execution_authority: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(source(receiptPath)).toMatch(/^import "server-only";/);
  expect(source(receiptPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/independent verification only/i);
  expect(documentation).toMatch(/no CI deduplication is authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HA/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HA/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
