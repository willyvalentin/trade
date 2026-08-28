import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666gt-position-version-lineage-v2-writer-canonical-command-digest-builder.md";
const evidencePath =
  "docs/evidence/action-666gt-position-version-lineage-v2-writer-canonical-command-digest-builder.json";
const builderPath =
  "lib/server/position-version-lineage-v2-writer-canonical-command-digest.ts";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const preflightPath =
  "lib/position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gt-position-version-lineage-v2-writer-canonical-command-digest-builder.spec.ts";

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
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE: string;
  };
}

function loadBuilder() {
  const sourceContract = loadSourceContract();
  const transpiled = ts.transpileModule(source(builderPath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: builderPath,
  }).outputText;
  const sandbox = {
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      if (specifier === "node:crypto") return { createHash };
      if (
        specifier ===
        "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract"
      ) {
        return sourceContract;
      }
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: builderPath });
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_CANONICAL_COMMAND_DIGEST_BUILDER_VERSION: string;
    PositionVersionLineageV2WriterCanonicalCommandDigestInputError: new () => Error;
    buildPositionVersionLineageV2WriterCanonicalCommandDigest(input: unknown): string;
  };
}

function validInput() {
  const sourceContract = loadSourceContract();
  return {
    authenticated_server_owner: "0d6f1d77-067d-4fca-9b73-1b70664c0001",
    contract_version:
      sourceContract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
    opaque_recommendation_reference: "9a86db1f-8ba1-4d2c-8a89-cfa2d07ba002",
    routine_signature:
      sourceContract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
  };
}

test("666GT emits the one exact SHA-256 digest for the frozen lexically sorted projection", () => {
  const builder = loadBuilder();
  const input = validInput();
  const canonicalJson = JSON.stringify({
    authenticated_server_owner: input.authenticated_server_owner,
    contract_version: input.contract_version,
    opaque_recommendation_reference: input.opaque_recommendation_reference,
    routine_signature: input.routine_signature,
  });
  const expected = createHash("sha256").update(canonicalJson, "utf8").digest("hex");

  expect(
    builder.POSITION_VERSION_LINEAGE_V2_WRITER_CANONICAL_COMMAND_DIGEST_BUILDER_VERSION,
  ).toBe("position_version_lineage_v2_writer_canonical_command_digest_builder_v1");
  expect(canonicalJson).toBe(
    "{\"authenticated_server_owner\":\"0d6f1d77-067d-4fca-9b73-1b70664c0001\",\"contract_version\":\"position_version_lineage_v2_writer_private_non_data_api_command_port_source_contract_v1\",\"opaque_recommendation_reference\":\"9a86db1f-8ba1-4d2c-8a89-cfa2d07ba002\",\"routine_signature\":\"private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)\"}",
  );
  expect(builder.buildPositionVersionLineageV2WriterCanonicalCommandDigest(input)).toBe(expected);
  expect(expected).toMatch(/^[a-f0-9]{64}$/);
});

test("666GT rejects widened, malformed and non-canonical input before digest construction", () => {
  const builder = loadBuilder();
  const input = validInput();
  const accessorInput = { ...input } as Record<string, unknown>;
  Object.defineProperty(accessorInput, "authenticated_server_owner", {
    enumerable: true,
    get: () => input.authenticated_server_owner,
  });
  const inheritedInput = Object.create(input);

  const invalidInputs: unknown[] = [
    null,
    [],
    { ...input, canonical_command_digest: "a".repeat(64) },
    { ...input, contract_version: "other" },
    { ...input, routine_signature: "private.other(uuid,uuid,text)" },
    { ...input, authenticated_server_owner: input.authenticated_server_owner.toUpperCase() },
    { ...input, opaque_recommendation_reference: "not-a-uuid" },
    accessorInput,
    inheritedInput,
  ];

  for (const invalidInput of invalidInputs) {
    expect(() => builder.buildPositionVersionLineageV2WriterCanonicalCommandDigest(invalidInput)).toThrow(
      "invalid_position_version_lineage_v2_writer_canonical_command_digest_input",
    );
  }
});

test("666GT stays server-only, source-only, unbound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const builderSource = source(builderPath);
  const evidence = JSON.parse(source(evidencePath));
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.predecessor).toMatchObject({
    action: "ACTION_666GS",
    protected_main_commit: "c859f1782aed392242190bc5c7618a10f85e9f0c",
    exact_main_ci_conclusion: "success",
    post_merge_candidate_provenance: "matched",
  });
  expect(evidence.implementation).toMatchObject({
    server_only: true,
    runtime_unwired: true,
    serialization: "utf8_json_object_with_lexically_sorted_keys",
    digest: "sha256_lowercase_hex",
  });
  expect(evidence.decision).toMatchObject({
    transport_implemented: false,
    credential_resolution_implemented: false,
    database_operation_present: false,
    writer_invocation_present: false,
    route_or_ui_binding_present: false,
    runtime_activation_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(builderSource).toMatch(/^import "server-only";/);
  expect(builderSource).not.toMatch(
    /\b(?:fetch|createClient|execute_sql|insert|delete|select|rpc|connect|listen)\s*\(/,
  );
  expect(builderSource).not.toMatch(
    /process\.env|from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/,
  );
  expect(source(preflightPath)).toContain(
    "deterministicV2CanonicalCommandDigestImplemented: false",
  );
  expect(documentation).toMatch(/No caller-supplied digest/i);
  expect(documentation).toMatch(/no private routine/i);
  expect(source(roadmapPath)).toMatch(/Action 666GT/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GT/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
