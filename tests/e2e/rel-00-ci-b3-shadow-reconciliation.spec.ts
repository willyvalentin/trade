import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const contractPath = "docs/rel-00-ci-b3-shadow-reconciliation-contract.md";
const evidencePath =
  "docs/evidence/rel-00-ci-b3-shadow-reconciliation-fixtures.json";
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const selectorPath = "scripts/action-660k-run-draft-ci.mjs";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const reconciliationPath = "scripts/rel-00-ci-b3-shadow-reconciliation.mjs";
const thisTest = "tests/e2e/rel-00-ci-b3-shadow-reconciliation.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

type ShadowRuntime = {
  buildShadowReconciliationReceipt: (
    ciB2Observation: unknown,
    legacyLabels?: unknown,
  ) => Record<string, unknown>;
  shadowReconciliationPolicy: Record<string, unknown>;
};

type Fixture = {
  id: string;
  base_revision: string;
  expected_revision: string;
  merge_base: string;
  raw_name_status_hex: string;
  legacy_labels: string[];
  expected_statuses: string[];
};

let reconciliation: ShadowRuntime;
const evidence = JSON.parse(source(evidencePath)) as {
  baseline: { full_shards: string[]; workflow_sha256: string };
  fixtures: Fixture[];
};

function digest(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function rawBytesFor(fixture: Fixture) {
  return new Uint8Array(Buffer.from(fixture.raw_name_status_hex, "hex"));
}

function validB2Observation(fixture: Fixture, rawBytes = rawBytesFor(fixture)) {
  return {
    contract_version: "trade.rel00.ci-b2.raw-name-status-acquisition.v1",
    outcome: "acquired",
    reason: null,
    base_revision: fixture.base_revision,
    expected_revision: fixture.expected_revision,
    merge_base: fixture.merge_base,
    raw_name_status_length: rawBytes.length,
    raw_name_status_sha256: digest(rawBytes),
    raw_name_status_z: rawBytes,
    effective_tier: 3,
    effective_disposition: "broad_containment",
    manual_review_required: true,
    metadata_verified: false,
    reference_verified: false,
    import_graph_verified: false,
    owned_test_mapping_verified: false,
    fast_path_eligible: false,
    activation_eligible: false,
    selector_connected: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
  };
}

function expectDeeplyFrozen(value: unknown, seen = new WeakSet<object>()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return;
  }
  seen.add(value);
  expect(Object.isFrozen(value)).toBe(true);
  for (const key of Reflect.ownKeys(value)) {
    expectDeeplyFrozen((value as Record<PropertyKey, unknown>)[key], seen);
  }
}

function expectNoRawBytes(value: unknown, seen = new WeakSet<object>()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return;
  }
  seen.add(value);
  expect(value).not.toBeInstanceOf(Uint8Array);
  for (const key of Reflect.ownKeys(value)) {
    expect(key).not.toBe("raw_name_status_z");
    expectNoRawBytes((value as Record<PropertyKey, unknown>)[key], seen);
  }
}

function expectContainment(receipt: Record<string, unknown>, reason?: string) {
  expect(receipt).toMatchObject({
    contract_version: "trade.rel00.ci-b3.shadow-reconciliation.v1",
    outcome: "broad_containment_required",
    effective_tier: 3,
    effective_disposition: "broad_containment",
    manual_review_required: true,
    metadata_verified: false,
    reference_verified: false,
    import_graph_verified: false,
    owned_test_mapping_verified: false,
    fast_path_eligible: false,
    activation_eligible: false,
    selector_connected: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
    reconciliation_status: "not_comparable_non_authoritative",
    input_binding: null,
    reparse: null,
    legacy_label_snapshot: null,
  });
  if (reason) {
    expect(receipt.reason).toBe(reason);
  }
  expectDeeplyFrozen(receipt);
  expectNoRawBytes(receipt);
}

test.beforeAll(async () => {
  reconciliation = (await import(
    pathToFileURL(resolve(root, reconciliationPath)).href,
  )) as ShadowRuntime;
});

test("REL-00 CI-B3 remains source-only and preserves the protected Full-CI contract", () => {
  const contract = source(contractPath);
  const workflow = source(workflowPath);
  const selector = source(selectorPath);
  const registration = JSON.parse(source(registrationPath)) as string[];
  const reconciliationSource = source(reconciliationPath);

  expect(evidence).toMatchObject({
    contract_version: "trade.rel00.ci-b3.shadow-reconciliation.v1",
    workstream: "REL-00",
    substage: "CI-B3",
    status: "source_only_not_activated",
    baseline: {
      protected_main_commit: "5ceeb1e52b86d76a8e601096b9fbb979934240e7",
      protected_main_tree: "7f421d3ae6c4d5f3ea4a35ae370e8e71242b8006",
      ci_b2_ready_run_id: 33552767496,
      ci_b2_exact_main_run_id: 33555929549,
      ci_b2_post_merge_provenance: "matched",
      protected_check: "provider-free-verification",
    },
    authority: {
      draft_selector_activation: false,
      workflow_change: false,
      required_check_change: false,
      branch_protection_change: false,
      ready_main_full_ci_change: false,
      ci_deduplication_authorized: false,
      runtime_or_deployment_authority: false,
    },
    shadow_policy: {
      raw_bytes_in_receipt: false,
      git_or_network_invocation: false,
      selector_or_test_plan: false,
      effective_tier: 3,
      effective_disposition: "broad_containment",
    },
  });
  expect(reconciliation.shadowReconciliationPolicy).toMatchObject({
    contract_version: "trade.rel00.ci-b3.shadow-reconciliation.v1",
    required_b2_contract_version:
      "trade.rel00.ci-b2.raw-name-status-acquisition.v1",
    parser_contract_version: "trade.rel00.ci-b1.change-classification.v1",
    maximum_raw_name_status_bytes: 1024 * 1024,
    maximum_legacy_label_count: 32,
    maximum_legacy_label_length: 160,
  });
  expect(contract).toContain("It does not call Git");
  expect(contract).toContain("CI-B7");
  expect(workflow).toContain("name: draft-provider-free-verification");
  expect(workflow).toContain("name: provider-free-verification");
  expect(createHash("sha256").update(workflow, "utf8").digest("hex")).toBe(
    evidence.baseline.workflow_sha256,
  );
  expect(evidence.baseline.full_shards).toEqual([
    "foundation",
    "replay-lineage",
    "snapshot-admission",
    "snapshot-issuance",
    "non-forgeable-authority",
    "lossless-scalar",
  ]);
  for (const shard of evidence.baseline.full_shards) {
    expect(workflow).toContain(`- ${shard}`);
  }
  expect(selector).not.toContain("rel-00-ci-b3-shadow-reconciliation");
  expect(reconciliationSource).toContain(
    "./rel-00-ci-b1-change-classifier.mjs",
  );
  expect(reconciliationSource).not.toMatch(
    /(?:node:child_process|node:fs|spawnSync|execSync|process\.|fetch\s*\(|action-660k-run-draft-ci|rel-00-ci-b2-raw-name-status-acquisition)/,
  );
  expect(reconciliationSource).not.toMatch(
    /(?:skip_ci|full_ci_exempt|merge_authority)/,
  );
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});

test("REL-00 CI-B3 creates detached Tier-3 receipts without raw bytes", () => {
  const fixture = evidence.fixtures[0];
  const rawBytes = rawBytesFor(fixture);
  const labels = [...fixture.legacy_labels];
  const observation = validB2Observation(fixture, rawBytes);
  const receipt = reconciliation.buildShadowReconciliationReceipt(
    observation,
    labels,
  );

  expect(receipt).toMatchObject({
    contract_version: "trade.rel00.ci-b3.shadow-reconciliation.v1",
    outcome: "shadow_receipt_created",
    reason: null,
    input_binding: {
      base_revision: fixture.base_revision,
      expected_revision: fixture.expected_revision,
      merge_base: fixture.merge_base,
      raw_name_status_length: rawBytes.length,
      raw_name_status_sha256: digest(rawBytes),
    },
    reparse: {
      parser_contract_version: "trade.rel00.ci-b1.change-classification.v1",
      invariant: "tier_3_broad_containment",
      records: [
        {
          status: "M",
          old_path: "docs/line\nbreak and space.md",
          new_path: "docs/line\nbreak and space.md",
        },
      ],
    },
    legacy_label_snapshot: {
      status: "captured_non_authoritative_not_comparable",
      labels,
    },
    reconciliation_status: "not_comparable_non_authoritative",
    effective_tier: 3,
    effective_disposition: "broad_containment",
    manual_review_required: true,
    metadata_verified: false,
    reference_verified: false,
    import_graph_verified: false,
    owned_test_mapping_verified: false,
    fast_path_eligible: false,
    activation_eligible: false,
    selector_connected: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
  });
  expectDeeplyFrozen(receipt);
  expectNoRawBytes(receipt);

  rawBytes[0] = "A".charCodeAt(0);
  labels[0] = "mutated-after-receipt";
  expect(receipt.input_binding).toMatchObject({
    raw_name_status_sha256: digest(Buffer.from(fixture.raw_name_status_hex, "hex")),
  });
  expect(receipt.legacy_label_snapshot).toMatchObject({
    labels: fixture.legacy_labels,
  });

  const second = reconciliation.buildShadowReconciliationReceipt(
    validB2Observation(fixture),
    fixture.legacy_labels,
  );
  expect(second).toEqual(receipt);
  expect(second).not.toBe(receipt);
  expect(second.input_binding).not.toBe(receipt.input_binding);
  expect(second.reparse).not.toBe(receipt.reparse);
  expect(second.legacy_label_snapshot).not.toBe(receipt.legacy_label_snapshot);
  expect(
    (second.reparse as { records: unknown[] }).records,
  ).not.toBe((receipt.reparse as { records: unknown[] }).records);
});

test("REL-00 CI-B3 preserves R/C, newline and C1 paths in fresh contained reparses", () => {
  const expectations = new Map<string, { old_path: string; new_path: string }>([
    [
      "rename-preserves-both-paths",
      {
        old_path: "docs/old.md",
        new_path: "app/api/auth/login/route.ts",
      },
    ],
    [
      "copy-preserves-both-paths",
      {
        old_path: "docs/source.md",
        new_path: "docs/copy.md",
      },
    ],
    [
      "c1-control-character-path-is-preserved-and-contained",
      {
        old_path: "docs/line\u0085break.md",
        new_path: "docs/line\u0085break.md",
      },
    ],
  ]);

  for (const fixture of evidence.fixtures.slice(1)) {
    const receipt = reconciliation.buildShadowReconciliationReceipt(
      validB2Observation(fixture),
      fixture.legacy_labels,
    );
    expect(receipt).toMatchObject({
      outcome: "shadow_receipt_created",
      effective_tier: 3,
      effective_disposition: "broad_containment",
      manual_review_required: true,
      fast_path_eligible: false,
      activation_eligible: false,
    });
    const records = (receipt.reparse as { records: Array<Record<string, unknown>> })
      .records;
    expect(records.map((record) => record.status)).toEqual(fixture.expected_statuses);
    expect(records).toMatchObject([expectations.get(fixture.id) ?? {}]);
    expectNoRawBytes(receipt);
  }
});

test("REL-00 CI-B3 fails closed for invalid CI-B2 bindings and malformed fresh raw bytes", () => {
  const fixture = evidence.fixtures[0];
  const validRaw = rawBytesFor(fixture);
  const variants: Array<{
    name: string;
    observation: Record<string, unknown>;
    reason: string;
  }> = [
    {
      name: "wrong contract",
      observation: {
        ...validB2Observation(fixture),
        contract_version: "trade.rel00.ci-b2.wrong.v1",
      },
      reason: "b2_contract_or_outcome_invalid",
    },
    {
      name: "wrong outcome",
      observation: { ...validB2Observation(fixture), outcome: "blocked" },
      reason: "b2_contract_or_outcome_invalid",
    },
    {
      name: "non-null reason",
      observation: { ...validB2Observation(fixture), reason: "stale" },
      reason: "b2_contract_or_outcome_invalid",
    },
    {
      name: "noncanonical revision",
      observation: {
        ...validB2Observation(fixture),
        base_revision: fixture.base_revision.replace(/^1/, "A"),
      },
      reason: "b2_revision_binding_invalid",
    },
    {
      name: "wrong raw length",
      observation: {
        ...validB2Observation(fixture),
        raw_name_status_length: validRaw.length + 1,
      },
      reason: "b2_raw_length_mismatch",
    },
    {
      name: "wrong raw digest",
      observation: {
        ...validB2Observation(fixture),
        raw_name_status_sha256: "0".repeat(64),
      },
      reason: "b2_raw_digest_mismatch",
    },
    {
      name: "empty raw bytes",
      observation: validB2Observation(fixture, new Uint8Array()),
      reason: "b2_raw_binding_invalid",
    },
    {
      name: "oversized raw bytes",
      observation: validB2Observation(fixture, new Uint8Array(1024 * 1024 + 1)),
      reason: "b2_raw_binding_invalid",
    },
    {
      name: "oversized actual raw bytes disguised by a small scalar length",
      observation: {
        ...validB2Observation(fixture, new Uint8Array(1024 * 1024 + 1)),
        raw_name_status_length: 1,
      },
      reason: "b2_raw_length_mismatch",
    },
    {
      name: "nonbytes raw input",
      observation: {
        ...validB2Observation(fixture),
        raw_name_status_z: "M\\0docs/guide.md\\0",
      },
      reason: "b2_raw_bytes_invalid",
    },
    {
      name: "authority flag drift",
      observation: {
        ...validB2Observation(fixture),
        fast_path_eligible: true,
      },
      reason: "b2_authority_flags_invalid",
    },
    {
      name: "malformed parsable binding",
      observation: validB2Observation(
        fixture,
        new Uint8Array(["M".charCodeAt(0), 0]),
      ),
      reason: "b1_reparse_or_classification_failed",
    },
  ];

  for (const variant of variants) {
    expectContainment(
      reconciliation.buildShadowReconciliationReceipt(variant.observation),
      variant.reason,
    );
  }
});

test("REL-00 CI-B3 reads a CI-B2 raw-byte getter once, ignores records, and contains hostile access", () => {
  const fixture = evidence.fixtures[0];
  const rawBytes = rawBytesFor(fixture);
  const observation = validB2Observation(fixture);
  let rawReads = 0;
  let recordsReads = 0;
  Object.defineProperty(observation, "raw_name_status_z", {
    configurable: true,
    enumerable: true,
    get() {
      rawReads += 1;
      return rawBytes;
    },
  });
  Object.defineProperty(observation, "records", {
    configurable: true,
    enumerable: true,
    get() {
      recordsReads += 1;
      throw new Error("CI-B3 must not inspect CI-B2 records");
    },
  });

  const receipt = reconciliation.buildShadowReconciliationReceipt(observation);
  expect(receipt.outcome).toBe("shadow_receipt_created");
  expect(rawReads).toBe(1);
  expect(recordsReads).toBe(0);

  const throwingRaw = validB2Observation(fixture);
  Object.defineProperty(throwingRaw, "raw_name_status_z", {
    configurable: true,
    enumerable: true,
    get() {
      throw new Error("hostile raw getter");
    },
  });
  expectContainment(
    reconciliation.buildShadowReconciliationReceipt(throwingRaw),
    "b2_observation_property_access_failed",
  );
  expectContainment(
    reconciliation.buildShadowReconciliationReceipt(
      new Proxy({}, {
        get() {
          throw new Error("hostile CI-B2 proxy");
        },
      }),
    ),
    "b2_observation_property_access_failed",
  );
  const revokedObservation = Proxy.revocable({}, {});
  revokedObservation.revoke();
  expectContainment(
    reconciliation.buildShadowReconciliationReceipt(revokedObservation.proxy),
    "b2_observation_property_access_failed",
  );
});

test("REL-00 CI-B3 captures only valid, exact non-authoritative legacy labels", () => {
  const fixture = evidence.fixtures[0];
  const receipt = reconciliation.buildShadowReconciliationReceipt(
    validB2Observation(fixture),
  );
  expect(receipt).toMatchObject({
    outcome: "shadow_receipt_created",
    legacy_label_snapshot: { status: "not_supplied", labels: [] },
  });

  const validLabels = ["docs-only", "exact-as-is: A/B"];
  const labelled = reconciliation.buildShadowReconciliationReceipt(
    validB2Observation(fixture),
    validLabels,
  );
  expect(labelled).toMatchObject({
    outcome: "shadow_receipt_created",
    legacy_label_snapshot: {
      status: "captured_non_authoritative_not_comparable",
      labels: validLabels,
    },
    reconciliation_status: "not_comparable_non_authoritative",
  });

  for (const labels of [
    ["duplicate", "duplicate"],
    [""],
    ["line\nbreak"],
    ["unicode-å"],
    ["x".repeat(161)],
    Array.from({ length: 33 }, (_, index) => `label-${index}`),
  ]) {
    expectContainment(
      reconciliation.buildShadowReconciliationReceipt(
        validB2Observation(fixture),
        labels,
      ),
      "legacy_label_snapshot_invalid",
    );
  }

  const hostileLabels = new Proxy([], {
    get() {
      throw new Error("hostile label proxy");
    },
  });
  expectContainment(
    reconciliation.buildShadowReconciliationReceipt(
      validB2Observation(fixture),
      hostileLabels,
    ),
    "legacy_label_snapshot_invalid",
  );
  const revokedLabels = Proxy.revocable([], {});
  revokedLabels.revoke();
  expectContainment(
    reconciliation.buildShadowReconciliationReceipt(
      validB2Observation(fixture),
      revokedLabels.proxy,
    ),
    "legacy_label_snapshot_invalid",
  );
});
