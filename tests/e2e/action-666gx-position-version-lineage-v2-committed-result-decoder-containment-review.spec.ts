import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666gx-position-version-lineage-v2-committed-result-decoder-containment-review.md";
const evidencePath =
  "docs/evidence/action-666gx-position-version-lineage-v2-committed-result-decoder-containment-review.json";
const decoderPath =
  "lib/server/position-version-lineage-v2-writer-strict-committed-result-decoder.ts";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const preflightPath =
  "lib/position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gx-position-version-lineage-v2-committed-result-decoder-containment-review.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const positionId = "550e8400-e29b-41d4-a716-446655440000";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function loadSourceContract() {
  const transpiled = ts.transpileModule(source(sourceContractPath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: sourceContractPath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: sourceContractPath });
  return sandbox.exports as Record<string, unknown>;
}

function loadDecoder() {
  const sourceContract = loadSourceContract();
  const transpiled = ts.transpileModule(source(decoderPath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: decoderPath,
  }).outputText;
  const sandbox = {
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      if (
        specifier ===
        "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract"
      ) {
        return sourceContract;
      }
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: decoderPath });
  return sandbox.exports as {
    PositionVersionLineageV2WriterStrictCommittedResultDecoderError: new () => Error;
    decodePositionVersionLineageV2WriterCommittedResult(
      rawResult: unknown,
      authenticatedServerOwner: unknown,
    ): {
      disposition: "created" | "replayed";
      initialHistoryIdentity: string;
      positionId: string;
      positionVersion: 1;
    };
  };
}

function validRawResult(disposition: "created" | "replayed") {
  return {
    position_version: 1,
    initial_history_identity: `${positionId}:${owner}:1`,
    disposition,
    position_id: positionId,
  };
}

test("666GX independently decodes only the exact detached committed-result boundary", () => {
  const decoder = loadDecoder();

  for (const disposition of ["created", "replayed"] as const) {
    const raw = validRawResult(disposition);
    const decoded = decoder.decodePositionVersionLineageV2WriterCommittedResult(raw, owner);

    expect(decoded).toEqual({
      disposition,
      initialHistoryIdentity: `${positionId}:${owner}:1`,
      positionId,
      positionVersion: 1,
    });
    expect(Object.isFrozen(decoded)).toBe(true);
    expect(decoded).not.toBe(raw);

    raw.disposition = disposition === "created" ? "replayed" : "created";
    expect(decoded.disposition).toBe(disposition);
  }
});

test("666GX independently rejects widened and malformed result material before decoding", () => {
  const decoder = loadDecoder();
  const accessorResult = validRawResult("created") as Record<string, unknown>;
  Object.defineProperty(accessorResult, "position_id", {
    enumerable: true,
    get: () => positionId,
  });

  const malformed: unknown[] = [
    null,
    [validRawResult("created")],
    { ...validRawResult("created"), legacy_snapshot_id: "forbidden" },
    { ...validRawResult("created"), [Symbol("unexpected")]: "unexpected" },
    { disposition: "created", position_id: positionId, position_version: 1 },
    Object.create(validRawResult("created")),
    Object.assign(Object.create({}), validRawResult("created")),
    accessorResult,
    { ...validRawResult("created"), disposition: "pending" },
    { ...validRawResult("created"), position_id: positionId.toUpperCase() },
    { ...validRawResult("created"), position_version: 2 },
    { ...validRawResult("created"), initial_history_identity: `${positionId}:${owner}:2` },
  ];

  for (const value of malformed) {
    expect(() => decoder.decodePositionVersionLineageV2WriterCommittedResult(value, owner)).toThrow(
      decoder.PositionVersionLineageV2WriterStrictCommittedResultDecoderError,
    );
  }

  expect(() =>
    decoder.decodePositionVersionLineageV2WriterCommittedResult(validRawResult("created"), owner.toUpperCase()),
  ).toThrow(decoder.PositionVersionLineageV2WriterStrictCommittedResultDecoderError);
});

test("666GX stays independent, source-only and registered once without reopening runtime", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];
  const decoderSource = source(decoderPath);

  expect(evidence.reviewed_revision).toMatchObject({
    protected_main_commit: "8d05408b9473196301c246e789be70781369c367",
    exact_main_ci_conclusion: "success",
    post_merge_candidate_provenance: "matched",
  });
  expect(evidence.review_scope).toMatchObject({
    returned_value: "new_frozen_committed_result",
    runtime_unwired: true,
    execution_authority: false,
  });
  expect(evidence.review_scope.required_rejections).toEqual(
    expect.arrayContaining(["legacy_or_extra_fields", "inherited_or_accessor_fields", "custom_prototype"]),
  );
  expect(evidence.decision).toMatchObject({
    decoder_change_authorized: false,
    transport_implemented: false,
    database_operation_present: false,
    writer_invocation_present: false,
    runtime_activation_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(decoderSource).toMatch(/^import "server-only";/);
  expect(decoderSource).not.toMatch(
    /process\.env|fetch\(|postgres|supabase|node:(?:net|http|https)|next\/server/i,
  );
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/no implementation change/i);
  expect(documentation).toMatch(/not\s+transport, credential, database, writer/i);
  expect(source(roadmapPath)).toMatch(/Action 666GX/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GX/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
