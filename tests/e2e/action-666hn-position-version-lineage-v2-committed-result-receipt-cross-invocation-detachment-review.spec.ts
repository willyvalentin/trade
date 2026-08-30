import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hn-position-version-lineage-v2-committed-result-receipt-cross-invocation-detachment-review.md";
const evidencePath =
  "docs/evidence/action-666hn-position-version-lineage-v2-committed-result-receipt-cross-invocation-detachment-review.json";
const comparatorPath =
  "lib/server/position-version-lineage-v2-writer-immutable-committed-result-receipt-equivalence-comparator.ts";
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
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest =
  "tests/e2e/action-666hn-position-version-lineage-v2-committed-result-receipt-cross-invocation-detachment-review.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const positionId = "550e8400-e29b-41d4-a716-446655440000";
const errorName =
  "PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError";
const errorMessage =
  "invalid_position_version_lineage_v2_writer_immutable_committed_result_receipt_equivalence_input";

type Verdict = { equivalent: boolean };
type Comparator = {
  PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError:
    new () => Error;
  comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
    left: unknown,
    right: unknown,
  ): Verdict;
};

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function loadComparator(): Comparator {
  const transpiled = ts.transpileModule(source(comparatorPath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: comparatorPath,
  }).outputText;
  const sandbox = {
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: comparatorPath });
  return sandbox.exports as Comparator;
}

function validReceipt(canonicalCommandDigest = "a".repeat(64)) {
  return Object.freeze({
    canonicalCommandDigest,
    disposition: "created" as const,
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1 as const,
  });
}

type CapturedOutcome =
  | Readonly<{ kind: "verdict"; value: Verdict }>
  | Readonly<{ kind: "error"; value: Error }>;

function captureOutcome(
  comparator: Comparator,
  left: unknown,
  right: unknown,
): CapturedOutcome {
  try {
    return {
      kind: "verdict",
      value:
        comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
          left,
          right,
        ),
    };
  } catch (error) {
    expect(error).toBeInstanceOf(
      comparator.PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError,
    );
    expect(error).toMatchObject({ name: errorName, message: errorMessage });
    return { kind: "error", value: error as Error };
  }
}

test("666HN interleaves valid and rejected comparisons without outcome aliasing", () => {
  const comparator = loadComparator();
  const equalLeft = validReceipt();
  const equalRight = validReceipt();
  const nonEquivalent = validReceipt("b".repeat(64));
  const malformed = { ...equalLeft };
  const noncanonical = Object.freeze({
    ...equalLeft,
    canonicalCommandDigest: "A".repeat(64),
  });
  const inputs = [equalLeft, equalRight, nonEquivalent, malformed, noncanonical];
  const sequence = [
    { kind: "verdict", equivalent: true, left: equalLeft, right: equalRight },
    { kind: "error", left: malformed, right: equalRight },
    { kind: "verdict", equivalent: false, left: equalLeft, right: nonEquivalent },
    { kind: "error", left: equalRight, right: noncanonical },
  ] as const;
  const verdicts: Verdict[] = [];
  const errors: Error[] = [];

  for (let cycle = 0; cycle < 3; cycle += 1) {
    for (const expected of sequence) {
      const outcome = captureOutcome(comparator, expected.left, expected.right);

      expect(outcome.kind).toBe(expected.kind);
      if (expected.kind === "verdict") {
        if (outcome.kind !== "verdict") throw new Error("expected a verdict");
        expect(outcome.value).toEqual({ equivalent: expected.equivalent });
        expect(Object.isFrozen(outcome.value)).toBe(true);
        expect(Reflect.ownKeys(outcome.value)).toEqual(["equivalent"]);
        verdicts.push(outcome.value);
      } else {
        if (outcome.kind !== "error") throw new Error("expected an error");
        expect(outcome.value.name).toBe(errorName);
        expect(outcome.value.message).toBe(errorMessage);
        errors.push(outcome.value);
      }
    }
  }

  expect(verdicts).toHaveLength(6);
  expect(errors).toHaveLength(6);
  const outcomes: unknown[] = [...verdicts, ...errors];
  expect(new Set(outcomes).size).toBe(outcomes.length);
  for (const outcome of outcomes) {
    expect(inputs).not.toContain(outcome);
  }
});

test("666HN remains source-only and is registered once without reopening runtime", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "19da367f8f6c4869465820c2b972ee94947546c8",
    protected_main_tree: "c68875db6ab2fe18479bb2ee1c23e1b2af3a7960",
    exact_main_ci_run: 33294282312,
    exact_main_ci_conclusion: "success",
    selection_action: "ACTION_666HM",
  });
  expect(evidence.review).toMatchObject({
    type: "independent_source_only_immutable_committed_result_receipt_cross_invocation_outcome_detachment_review",
    comparator_source_changed: false,
    interleaved_cycles: 3,
    calls_per_cycle: 4,
    valid_calls: 6,
    rejected_calls: 6,
    valid_verdicts_are_fresh_frozen_scalars: true,
    rejected_errors_are_fresh_dedicated_comparator_errors: true,
    invalid_input_in_both_argument_slots: true,
    outcome_input_aliasing: false,
    cross_outcome_aliasing: false,
    dedicated_error_public_name: errorName,
    dedicated_error_message: errorMessage,
  });
  expect(evidence.containment).toEqual({
    decoded_result_or_command_reconstruction_present: false,
    receipt_consumer_or_storage_present: false,
    transport_credential_or_owner_resolution_present: false,
    database_writer_provider_broker_or_runtime_binding_present: false,
    route_ui_or_deployment_authority_present: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    netlify_change_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(source(comparatorPath)).toMatch(/^import "server-only";/);
  expect(source(comparatorPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(receiptPath)).toMatch(/^import "server-only";/);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/source-only review/i);
  expect(documentation).toMatch(/no CI deduplication is\s+authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HN/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HN/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
