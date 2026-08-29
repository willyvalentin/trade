import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666gz-position-version-lineage-v2-writer-immutable-committed-result-receipt.md";
const evidencePath =
  "docs/evidence/action-666gz-position-version-lineage-v2-writer-immutable-committed-result-receipt.json";
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
  "tests/e2e/action-666gz-position-version-lineage-v2-writer-immutable-committed-result-receipt.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const positionId = "550e8400-e29b-41d4-a716-446655440000";
const digest = "a".repeat(64);

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

function validDecodedResult(disposition: "created" | "replayed") {
  return Object.freeze({
    disposition,
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1 as const,
  });
}

test("666GZ projects only a fresh frozen receipt from decoded result scalars and canonical digest", () => {
  const receiptProjector = loadReceiptProjector();

  for (const disposition of ["created", "replayed"] as const) {
    const decoded = validDecodedResult(disposition);
    const receipt = receiptProjector.projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
      decoded,
      digest,
    );

    expect(receipt).toEqual({
      canonicalCommandDigest: digest,
      disposition,
      initialHistoryIdentity: `${positionId}:${owner}:1`,
      positionId,
      positionVersion: 1,
    });
    expect(receipt).not.toBe(decoded);
    expect(Object.isFrozen(receipt)).toBe(true);
  }
});

test("666GZ fails closed for mutable, widened or malformed results and digest claims", () => {
  const receiptProjector = loadReceiptProjector();
  const decoded = validDecodedResult("created");
  const accessorResult = Object.freeze({
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1,
    get disposition() {
      return "created";
    },
  });
  const inheritedResult = Object.freeze(Object.assign(Object.create({}), decoded));
  const malformedResults = [
    null,
    [decoded],
    { ...decoded },
    Object.freeze({ ...decoded, legacySnapshotId: "forbidden" }),
    Object.freeze({ ...decoded, disposition: "pending" }),
    Object.freeze({ ...decoded, positionId: positionId.toUpperCase() }),
    Object.freeze({ ...decoded, initialHistoryIdentity: `${positionId}:${owner}:2` }),
    Object.freeze({ ...decoded, [Symbol("unexpected")]: "unexpected" }),
    accessorResult,
    inheritedResult,
  ];

  for (const value of malformedResults) {
    expect(() =>
      receiptProjector.projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(value, digest),
    ).toThrow(receiptProjector.PositionVersionLineageV2WriterImmutableCommittedResultReceiptError);
  }

  for (const invalidDigest of [null, "", digest.toUpperCase(), `${digest}0`, "g".repeat(64)]) {
    expect(() =>
      receiptProjector.projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
        decoded,
        invalidDigest,
      ),
    ).toThrow(receiptProjector.PositionVersionLineageV2WriterImmutableCommittedResultReceiptError);
  }
});

test("666GZ remains source-only and registered once without admitting runtime authority", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "d96861314792bb53ca5e092b78f6752cee67be8a",
    protected_main_tree: "39b24cfd56c7d5bd41ca907afd5c6118a778c433",
    exact_main_ci_run: 33247908969,
    exact_main_ci_conclusion: "success",
    selection_action: "ACTION_666GY",
  });
  expect(evidence.implementation.receipt_fields).toEqual([
    "canonicalCommandDigest",
    "disposition",
    "initialHistoryIdentity",
    "positionId",
    "positionVersion",
  ]);
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
  expect(documentation).toMatch(/opens no\s+connection/i);
  expect(documentation).toMatch(/no CI deduplication is authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666GZ/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GZ/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
