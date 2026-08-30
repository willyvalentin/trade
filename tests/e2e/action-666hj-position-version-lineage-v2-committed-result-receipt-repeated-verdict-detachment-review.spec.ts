import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hj-position-version-lineage-v2-committed-result-receipt-repeated-verdict-detachment-review.md";
const evidencePath =
  "docs/evidence/action-666hj-position-version-lineage-v2-committed-result-receipt-repeated-verdict-detachment-review.json";
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
  "tests/e2e/action-666hj-position-version-lineage-v2-committed-result-receipt-repeated-verdict-detachment-review.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const positionId = "550e8400-e29b-41d4-a716-446655440000";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function loadComparator() {
  const transpiled = ts.transpileModule(source(comparatorPath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: comparatorPath,
  }).outputText;
  const sandbox = {
    Object,
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: comparatorPath });
  return sandbox.exports as {
    comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      left: unknown,
      right: unknown,
    ): { equivalent: boolean };
  };
}

function validReceipt(digest: string) {
  return Object.freeze({
    canonicalCommandDigest: digest,
    disposition: "created" as const,
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1 as const,
  });
}

function expectFreshFrozenVerdict(
  verdict: Record<string, unknown>,
  expected: boolean,
) {
  expect(verdict).toEqual({ equivalent: expected });
  expect(Reflect.ownKeys(verdict)).toEqual(["equivalent"]);
  expect(Object.isFrozen(verdict)).toBe(true);
  expect(Object.getOwnPropertyDescriptor(verdict, "equivalent")).toMatchObject({
    enumerable: true,
    configurable: false,
    writable: false,
  });
  expect(Reflect.set(verdict, "equivalent", !expected)).toBe(false);
}

test("666HJ repeatedly returns detached frozen verdicts for canonical receipt pairs", () => {
  const comparator = loadComparator();
  const baseline = validReceipt("a".repeat(64));
  const equalDistinct = Object.freeze({
    positionVersion: 1 as const,
    positionId,
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    disposition: "created" as const,
    canonicalCommandDigest: "a".repeat(64),
  });
  const nonEquivalent = validReceipt("b".repeat(64));
  const cases = [
    { left: baseline, right: equalDistinct, expected: true },
    { left: equalDistinct, right: baseline, expected: true },
    { left: baseline, right: nonEquivalent, expected: false },
    { left: nonEquivalent, right: baseline, expected: false },
  ] as const;
  const verdicts: Record<string, unknown>[] = [];

  for (const { left, right, expected } of cases) {
    for (let invocation = 0; invocation < 3; invocation += 1) {
      const verdict =
        comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
          left,
          right,
        );
      expectFreshFrozenVerdict(verdict, expected);
      expect(verdict).not.toBe(left);
      expect(verdict).not.toBe(right);
      verdicts.push(verdict);
    }
  }

  expect(new Set(verdicts).size).toBe(verdicts.length);
});

test("666HJ remains source-only and is registered once without reopening runtime", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "e0e3a914ebca6ec2543d831ed5e6a14403fa5d7b",
    protected_main_tree: "df667b7ca20a9e8e7f2892a86dfce4e5af494e50",
    exact_main_ci_run: 33282570519,
    exact_main_ci_conclusion: "success",
    selection_action: "ACTION_666HI",
  });
  expect(evidence.review).toMatchObject({
    type: "independent_source_only_immutable_committed_result_receipt_repeated_verdict_detachment_review",
    comparator_source_changed: false,
    equal_distinct_receipts_return_true_in_both_orders: true,
    valid_non_equivalent_receipts_return_false_in_both_orders: true,
    calls_per_argument_order: 3,
    every_verdict_is_distinct_frozen_and_scalar_only: true,
    verdict_receipt_aliasing: false,
    cross_verdict_aliasing: false,
  });
  expect(evidence.containment).toEqual({
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
  expect(documentation).toMatch(/source-only/i);
  expect(documentation).toMatch(/no CI deduplication is\s+authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HJ/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HJ/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
