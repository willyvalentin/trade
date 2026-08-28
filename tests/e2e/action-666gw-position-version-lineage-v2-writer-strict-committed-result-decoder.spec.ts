import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666gw-position-version-lineage-v2-writer-strict-committed-result-decoder.md";
const evidencePath =
  "docs/evidence/action-666gw-position-version-lineage-v2-writer-strict-committed-result-decoder.json";
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
  "tests/e2e/action-666gw-position-version-lineage-v2-writer-strict-committed-result-decoder.spec.ts";

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
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_RESULT_MAPPING: {
      wireColumns: readonly string[];
      initialPositionVersion: 1;
    };
  };
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
      positionId: string;
      positionVersion: 1;
      initialHistoryIdentity: string;
    };
  };
}

function validRawResult(disposition: "created" | "replayed") {
  return {
    disposition,
    initial_history_identity: `${positionId}:${owner}:1`,
    position_id: positionId,
    position_version: 1,
  };
}

test("666GW decodes only the frozen created and replayed committed-result shape", () => {
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
  }
});

test("666GW fails closed for widened, inherited, accessor and malformed result material", () => {
  const decoder = loadDecoder();
  const accessorResult = validRawResult("created") as Record<string, unknown>;
  Object.defineProperty(accessorResult, "disposition", {
    enumerable: true,
    get() {
      return "created";
    },
  });

  const inheritedResult = Object.create(validRawResult("created"));
  const customPrototypeResult = Object.assign(Object.create({}), validRawResult("created"));
  const symbolResult = {
    ...validRawResult("created"),
    [Symbol("unexpected")]: "unexpected",
  };
  const malformed = [
    null,
    [validRawResult("created")],
    { ...validRawResult("created"), legacy_snapshot_id: "forbidden" },
    { ...validRawResult("created"), disposition: "pending" },
    { ...validRawResult("created"), position_id: positionId.toUpperCase() },
    { ...validRawResult("created"), position_version: 2 },
    { ...validRawResult("created"), initial_history_identity: `${positionId}:${owner}:2` },
    accessorResult,
    inheritedResult,
    customPrototypeResult,
    symbolResult,
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

test("666GW remains source-only and registered once without admitting runtime authority", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "18888a7bc28a28d96ca059a328ded947e7be68a0",
    protected_main_tree: "74929caae798ad26f37f1cfd27b105a9fb679770",
    exact_main_ci_run: 33217044246,
    exact_main_ci_conclusion: "success",
    selection_action: "ACTION_666GV",
  });
  expect(evidence.implementation.accepted_wire_columns).toEqual([
    "disposition",
    "position_id",
    "position_version",
    "initial_history_identity",
  ]);
  expect(evidence.containment).toEqual({
    transport_operation_present: false,
    credential_resolution_present: false,
    database_or_writer_operation_present: false,
    owner_resolution_present: false,
    adapter_route_ui_or_runtime_binding_present: false,
    provider_broker_deployment_or_execution_authority: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(source(decoderPath)).toContain('import "server-only"');
  expect(source(decoderPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/does not resolve an authenticated owner/i);
  expect(documentation).toMatch(/no CI deduplication is authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666GW/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GW/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
