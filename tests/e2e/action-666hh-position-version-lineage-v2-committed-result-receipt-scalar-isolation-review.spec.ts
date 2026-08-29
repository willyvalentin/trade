import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hh-position-version-lineage-v2-committed-result-receipt-scalar-isolation-review.md";
const evidencePath =
  "docs/evidence/action-666hh-position-version-lineage-v2-committed-result-receipt-scalar-isolation-review.json";
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
  "tests/e2e/action-666hh-position-version-lineage-v2-committed-result-receipt-scalar-isolation-review.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const otherOwner = "3f2504e0-4f89-41d3-9a0c-0305e82c3302";
const firstPositionId = "550e8400-e29b-41d4-a716-446655440000";
const secondPositionId = "550e8400-e29b-41d4-a716-446655440001";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function loadComparator() {
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
  return sandbox.exports as {
    PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError:
      new () => Error;
    comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      left: unknown,
      right: unknown,
    ): { equivalent: boolean };
  };
}

function validReceipt(
  positionId: string,
  ownerId: string,
  disposition: "created" | "replayed",
  digest: string,
) {
  return Object.freeze({
    canonicalCommandDigest: digest,
    disposition,
    initialHistoryIdentity: `${positionId}:${ownerId}:1`,
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
  expect(verdict.equivalent).toBe(expected);
}

test("666HH isolates each individually valid receipt scalar and preserves argument-order symmetry", () => {
  const comparator = loadComparator();
  const baseline = validReceipt(firstPositionId, owner, "created", "a".repeat(64));
  const equalDistinct = Object.freeze({
    positionVersion: 1 as const,
    positionId: firstPositionId,
    initialHistoryIdentity: `${firstPositionId}:${owner}:1`,
    disposition: "created" as const,
    canonicalCommandDigest: "a".repeat(64),
  });
  const isolatedMismatches = [
    {
      field: "canonicalCommandDigest",
      receipt: validReceipt(firstPositionId, owner, "created", "b".repeat(64)),
    },
    {
      field: "disposition",
      receipt: validReceipt(firstPositionId, owner, "replayed", "a".repeat(64)),
    },
    {
      field: "initialHistoryIdentity",
      receipt: validReceipt(firstPositionId, otherOwner, "created", "a".repeat(64)),
    },
  ] as const;

  const equivalentForward =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      baseline,
      equalDistinct,
    );
  const equivalentReverse =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      equalDistinct,
      baseline,
    );

  expectFreshFrozenVerdict(equivalentForward, true);
  expectFreshFrozenVerdict(equivalentReverse, true);
  expect(equivalentForward).not.toBe(equivalentReverse);

  for (const { field, receipt } of isolatedMismatches) {
    const changedFields = Reflect.ownKeys(baseline).filter(
      (key) => baseline[key as keyof typeof baseline] !== receipt[key as keyof typeof receipt],
    );
    expect(changedFields).toEqual([field]);

    const forward =
      comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
        baseline,
        receipt,
      );
    const reverse =
      comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
        receipt,
        baseline,
      );

    expectFreshFrozenVerdict(forward, false);
    expectFreshFrozenVerdict(reverse, false);
    expect(forward).not.toBe(reverse);
    expect(forward).not.toBe(baseline);
    expect(reverse).not.toBe(receipt);
  }
});

test("666HH preserves the coupled position identity invariant and malformed version rejection", () => {
  const comparator = loadComparator();
  const baseline = validReceipt(firstPositionId, owner, "created", "a".repeat(64));
  const literalPositionOnlyChange = Object.freeze({
    ...baseline,
    positionId: secondPositionId,
  });
  const canonicalChangedPosition = validReceipt(
    secondPositionId,
    owner,
    "created",
    "a".repeat(64),
  );
  const versionTwo = Object.freeze({ ...baseline, positionVersion: 2 });

  expect(Reflect.ownKeys(baseline).filter(
    (key) => baseline[key as keyof typeof baseline] !== literalPositionOnlyChange[key as keyof typeof literalPositionOnlyChange],
  )).toEqual(["positionId"]);
  expect(() =>
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      baseline,
      literalPositionOnlyChange,
    ),
  ).toThrow(
    comparator.PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError,
  );
  expect(() =>
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      literalPositionOnlyChange,
      baseline,
    ),
  ).toThrow(
    comparator.PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError,
  );

  const changedPositionFields = Reflect.ownKeys(baseline).filter(
    (key) => baseline[key as keyof typeof baseline] !== canonicalChangedPosition[key as keyof typeof canonicalChangedPosition],
  );
  expect(changedPositionFields).toEqual(["initialHistoryIdentity", "positionId"]);
  const forward =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      baseline,
      canonicalChangedPosition,
    );
  const reverse =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      canonicalChangedPosition,
      baseline,
    );
  expectFreshFrozenVerdict(forward, false);
  expectFreshFrozenVerdict(reverse, false);
  expect(forward).not.toBe(reverse);

  for (const [left, right] of [
    [baseline, versionTwo],
    [versionTwo, baseline],
  ]) {
    expect(() =>
      comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(left, right),
    ).toThrow(
      comparator.PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError,
    );
  }
});

test("666HH remains source-only and is registered once without reopening runtime", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "8f6052c54644b98d912dc290662acafc33588cad",
    protected_main_tree: "20b91a884aa249569815037fc305a7bbd13de3ab",
    exact_main_ci_run: 33276551554,
    exact_main_ci_conclusion: "success",
    selection_action: "ACTION_666HG",
  });
  expect(evidence.review).toMatchObject({
    type: "independent_source_only_immutable_committed_result_receipt_scalar_isolation_review",
    comparator_source_changed: false,
    literal_single_scalar_mismatches_return_false_in_both_orders: [
      "canonicalCommandDigest",
      "disposition",
      "initialHistoryIdentity",
    ],
    position_id_literal_single_scalar_change_fails_closed: true,
    position_id_canonical_change_requires_history_identity_companion: true,
    canonical_changed_position_identity_returns_false_in_both_orders: true,
    equal_distinct_receipts_return_true_in_both_orders: true,
    position_version_outside_v1_fails_closed: true,
    verdict_is_fresh_frozen_and_scalar_only: true,
    verdict_receipt_aliasing: false,
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
  expect(source(roadmapPath)).toMatch(/Action 666HH/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HH/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
