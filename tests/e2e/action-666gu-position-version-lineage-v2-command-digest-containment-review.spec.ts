import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666gu-position-version-lineage-v2-command-digest-containment-review.md";
const evidencePath =
  "docs/evidence/action-666gu-position-version-lineage-v2-command-digest-containment-review.json";
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
  "tests/e2e/action-666gu-position-version-lineage-v2-command-digest-containment-review.spec.ts";

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
  return sandbox.exports as Record<string, string>;
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
    buildPositionVersionLineageV2WriterCanonicalCommandDigest(input: unknown): string;
  };
}

function validInput() {
  const contract = loadSourceContract();
  return {
    contract_version:
      contract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
    routine_signature:
      contract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
    authenticated_server_owner: "0d6f1d77-067d-4fca-9b73-1b70664c0001",
    opaque_recommendation_reference: "9a86db1f-8ba1-4d2c-8a89-cfa2d07ba002",
  };
}

test("666GU independently reproduces the order-invariant four-field digest", () => {
  const builder = loadBuilder();
  const input = validInput();
  const reorderedInput = {
    opaque_recommendation_reference: input.opaque_recommendation_reference,
    authenticated_server_owner: input.authenticated_server_owner,
    routine_signature: input.routine_signature,
    contract_version: input.contract_version,
  };
  const canonicalJson = JSON.stringify({
    authenticated_server_owner: input.authenticated_server_owner,
    contract_version: input.contract_version,
    opaque_recommendation_reference: input.opaque_recommendation_reference,
    routine_signature: input.routine_signature,
  });
  const expected = createHash("sha256").update(canonicalJson, "utf8").digest("hex");

  expect(builder.buildPositionVersionLineageV2WriterCanonicalCommandDigest(input)).toBe(expected);
  expect(builder.buildPositionVersionLineageV2WriterCanonicalCommandDigest(reorderedInput)).toBe(
    expected,
  );
  expect(expected).toMatch(/^[a-f0-9]{64}$/);
});

test("666GU independently rejects every widened command category and malformed shape", () => {
  const builder = loadBuilder();
  const input = validInput();
  const accessorInput = { ...input } as Record<string, unknown>;
  Object.defineProperty(accessorInput, "opaque_recommendation_reference", {
    enumerable: true,
    get: () => input.opaque_recommendation_reference,
  });

  const invalidInputs: unknown[] = [
    { ...input, canonical_command_digest: "a".repeat(64) },
    { ...input, price: "1" },
    { ...input, quantity: "1" },
    { ...input, position_identity: "position-1" },
    { ...input, policy: "override" },
    { ...input, timestamp: "2026-08-28T00:00:00.000Z" },
    { contract_version: input.contract_version },
    Object.create(input),
    accessorInput,
    { ...input, contract_version: "wrong" },
    { ...input, routine_signature: "private.other(uuid,uuid,text)" },
    { ...input, authenticated_server_owner: input.authenticated_server_owner.toUpperCase() },
  ];

  for (const invalidInput of invalidInputs) {
    expect(() => builder.buildPositionVersionLineageV2WriterCanonicalCommandDigest(invalidInput)).toThrow(
      "invalid_position_version_lineage_v2_writer_canonical_command_digest_input",
    );
  }
});

test("666GU stays independent, source-only and registered once without reopening runtime", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];
  const builderSource = source(builderPath);

  expect(evidence.reviewed_revision).toMatchObject({
    protected_main_commit: "5d9247c28c0c3cbfb6887ab339d2f3164aa0c67b",
    exact_main_ci_conclusion: "success",
    post_merge_candidate_provenance: "matched",
  });
  expect(evidence.review_scope.required_rejections).toEqual(
    expect.arrayContaining(["caller_supplied_digest", "price", "timestamp", "accessor_field"]),
  );
  expect(evidence.decision).toMatchObject({
    builder_change_authorized: false,
    transport_implemented: false,
    database_operation_present: false,
    writer_invocation_present: false,
    runtime_activation_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(builderSource).toMatch(/^import "server-only";/);
  expect(builderSource).not.toMatch(
    /process\.env|from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/,
  );
  expect(source(preflightPath)).toContain(
    "deterministicV2CanonicalCommandDigestImplemented: false",
  );
  expect(documentation).toMatch(/no implementation change/i);
  expect(documentation).toMatch(/not\s+transport, credential, database, writer/i);
  expect(source(roadmapPath)).toMatch(/Action 666GU/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GU/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
