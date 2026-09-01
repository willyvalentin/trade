import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const contractPath = "docs/rel-00-ci-b2-raw-name-status-acquisition-contract.md";
const evidencePath =
  "docs/evidence/rel-00-ci-b2-raw-name-status-acquisition-fixtures.json";
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const selectorPath = "scripts/action-660k-run-draft-ci.mjs";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const acquisitionPath = "scripts/rel-00-ci-b2-raw-name-status-acquisition.mjs";
const thisTest = "tests/e2e/rel-00-ci-b2-raw-name-status-acquisition.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

type GitResult = {
  error?: unknown;
  signal?: string | null;
  status?: number | null;
  stdout?: Uint8Array | null;
};

type AcquisitionRuntime = {
  acquireRawNameStatusZ: (
    input: { base_revision: string; expected_revision: string },
    runGit?: (args: readonly string[]) => GitResult,
  ) => Record<string, unknown>;
  rawNameStatusAcquisitionPolicy: Record<string, unknown>;
};

let acquisition: AcquisitionRuntime;
const evidence = JSON.parse(source(evidencePath));

function utf8(value: string) {
  return new TextEncoder().encode(value);
}

function success(stdout: Uint8Array): GitResult {
  return { status: 0, signal: null, stdout };
}

function makeGitRunner({
  mergeBase,
  rawNameStatus,
  override,
}: {
  mergeBase: string;
  rawNameStatus: Uint8Array;
  override?: (args: readonly string[]) => GitResult | null;
}) {
  const calls: string[][] = [];
  const runner = (args: readonly string[]): GitResult => {
    calls.push([...args]);
    const overridden = override?.(args);
    if (overridden !== null && overridden !== undefined) {
      return overridden;
    }
    if (args.includes("rev-parse")) {
      const operand = args.at(-1) ?? "";
      const revision = operand.slice(0, -"^{commit}".length);
      return success(utf8(`${revision}\n`));
    }
    if (args.includes("merge-base")) {
      return success(utf8(`${mergeBase}\n`));
    }
    if (args.includes("diff")) {
      return success(rawNameStatus);
    }
    throw new Error("unexpected Git command");
  };
  return { calls, runner };
}

function expectedCommands(baseRevision: string, expectedRevision: string, mergeBase: string) {
  const prefix = ["--no-pager", "--no-replace-objects"];
  return [
    [...prefix, "rev-parse", "--verify", "--quiet", `${baseRevision}^{commit}`],
    [...prefix, "rev-parse", "--verify", "--quiet", `${expectedRevision}^{commit}`],
    [...prefix, "merge-base", "--all", baseRevision, expectedRevision],
    [...prefix, "rev-parse", "--verify", "--quiet", `${mergeBase}^{commit}`],
    [
      ...prefix,
      "diff",
      "--no-ext-diff",
      "--no-textconv",
      "--no-renames",
      "--name-status",
      "-z",
      mergeBase,
      expectedRevision,
      "--",
    ],
  ];
}

function expectBlocked(observation: Record<string, unknown>, reason: string) {
  expect(observation).toMatchObject({
    outcome: "broad_containment_required",
    reason,
    effective_tier: 3,
    effective_disposition: "broad_containment",
    fast_path_eligible: false,
    activation_eligible: false,
    selector_connected: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
  });
  expect(observation.records).toEqual([]);
  expect(observation.raw_name_status_z).toBeNull();
}

test.beforeAll(async () => {
  acquisition = (await import(
    pathToFileURL(resolve(root, acquisitionPath)).href,
  )) as AcquisitionRuntime;
});

test("REL-00 CI-B2 remains source-only and preserves the protected Full-CI contract", () => {
  const contract = source(contractPath);
  const workflow = source(workflowPath);
  const selector = source(selectorPath);
  const registration = JSON.parse(source(registrationPath)) as string[];
  const acquisitionSource = source(acquisitionPath);

  expect(evidence).toMatchObject({
    contract_version: "trade.rel00.ci-b2.raw-name-status-acquisition.v1",
    workstream: "REL-00",
    substage: "CI-B2",
    status: "source_only_not_activated",
    baseline: {
      protected_main_commit: "7ca4543c3c4eea5503f047d1df4865e29b8b9ee2",
      protected_main_tree: "b122ec34ff947ceabcd5957a52e7049b624961eb",
      ci_b1_exact_main_run_id: 33545954916,
      ci_b1_post_merge_provenance: "matched",
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
  });
  expect(acquisition.rawNameStatusAcquisitionPolicy).toMatchObject({
    maximum_stdout_bytes: 1024 * 1024,
    rename_policy: "disabled_with_--no-renames",
    trusted_git_executable: "/usr/bin/git",
    inherited_git_environment: false,
  });
  expect(contract).toContain("does not serialize a PR artifact");
  expect(contract).toContain("CI-B7 remains the separately authorized decision");
  expect(workflow).toContain("name: draft-provider-free-verification");
  expect(workflow).toContain("name: provider-free-verification");
  expect(
    createHash("sha256").update(workflow, "utf8").digest("hex"),
  ).toBe(evidence.baseline.workflow_sha256);
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
  expect(selector).not.toContain("rel-00-ci-b2-raw-name-status-acquisition");
  expect(acquisitionSource).not.toMatch(/(?:action-660k|\.github\/workflows|fetch\s*\()/);
  expect(acquisitionSource).not.toMatch(/(?:skip_ci|full_ci_exempt|merge_authority)/);
  expect(acquisitionSource).toContain("env: isolatedGitEnvironment");
  expect(acquisitionSource).toContain("GIT_CONFIG_NOSYSTEM");
  expect(acquisitionSource).not.toContain("process.env");
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});

test("REL-00 CI-B2 captures byte-identical NUL output with fixed commands and Tier-3 containment", () => {
  const fixture = evidence.fixtures[0];
  const rawNameStatus = new Uint8Array(
    Buffer.from(fixture.raw_name_status_hex, "hex"),
  );
  const { calls, runner } = makeGitRunner({
    mergeBase: fixture.merge_base,
    rawNameStatus,
  });
  const observation = acquisition.acquireRawNameStatusZ(
    {
      base_revision: fixture.base_revision,
      expected_revision: fixture.expected_revision,
    },
    runner,
  );

  expect(calls).toEqual(
    expectedCommands(
      fixture.base_revision,
      fixture.expected_revision,
      fixture.merge_base,
    ),
  );
  expect(observation).toMatchObject({
    outcome: "acquired",
    base_revision: fixture.base_revision,
    expected_revision: fixture.expected_revision,
    merge_base: fixture.merge_base,
    raw_name_status_length: rawNameStatus.length,
    effective_tier: 3,
    effective_disposition: "broad_containment",
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
  expect(observation.raw_name_status_sha256).toMatch(/^[0-9a-f]{64}$/);
  expect(observation.raw_name_status_z).toEqual(rawNameStatus);
  expect(observation.raw_name_status_z).not.toBe(rawNameStatus);
  expect(observation.records).toHaveLength(1);
  expect(observation.records).toMatchObject([
    {
      status: "M",
      old_path: "docs/line\nbreak and space.md",
      new_path: "docs/line\nbreak and space.md",
      metadata_verified: false,
      reference_verified: false,
      import_graph_verified: false,
      owned_test_mapping_verified: false,
    },
  ]);

  rawNameStatus[0] = 0;
  expect((observation.raw_name_status_z as Uint8Array)[0]).toBe("M".charCodeAt(0));
  const callerMutation = observation.raw_name_status_z as Uint8Array;
  callerMutation[0] = "A".charCodeAt(0);
  expect((observation.raw_name_status_z as Uint8Array)[0]).toBe("M".charCodeAt(0));
  expect(observation.raw_name_status_sha256).toBe(
    createHash("sha256")
      .update(Buffer.from(fixture.raw_name_status_hex, "hex"))
      .digest("hex"),
  );
  expect(calls.flat()).not.toContain("status");
  expect(calls.flat()).not.toContain("--name-only");
  expect(calls.flat()).not.toContain("--diff-filter");
});

test("REL-00 CI-B2 binds the local Git context despite hostile ambient Git redirection", () => {
  const originalGitDir = process.env.GIT_DIR;
  process.env.GIT_DIR = "/definitely-not-the-trade-repository";
  try {
    const observation = acquisition.acquireRawNameStatusZ({
      base_revision: "8127c4d294a36d0e442fa1b10df451f15cdf0c28",
      expected_revision: "7ca4543c3c4eea5503f047d1df4865e29b8b9ee2",
    });
    expect(observation).toMatchObject({
      outcome: "acquired",
      merge_base: "8127c4d294a36d0e442fa1b10df451f15cdf0c28",
      raw_name_status_length: 620,
      raw_name_status_sha256:
        "2d77693b744e683f05abb5baffb82c767bf402cb9f3a544151987a6a200c6f7b",
      effective_tier: 3,
      effective_disposition: "broad_containment",
      fast_path_eligible: false,
      activation_eligible: false,
    });
  } finally {
    if (originalGitDir === undefined) {
      delete process.env.GIT_DIR;
    } else {
      process.env.GIT_DIR = originalGitDir;
    }
  }
});

test("REL-00 CI-B2 preserves dangerous R/C and control-character bytes as contained evidence", () => {
  for (const fixture of evidence.fixtures.slice(1)) {
    const rawNameStatus = new Uint8Array(
      Buffer.from(fixture.raw_name_status_hex, "hex"),
    );
    const { runner } = makeGitRunner({
      mergeBase: fixture.merge_base,
      rawNameStatus,
    });
    const observation = acquisition.acquireRawNameStatusZ(
      {
        base_revision: fixture.base_revision,
        expected_revision: fixture.expected_revision,
      },
      runner,
    );
    expect(observation).toMatchObject({
      outcome: "acquired",
      effective_tier: 3,
      effective_disposition: "broad_containment",
      fast_path_eligible: false,
      activation_eligible: false,
    });
    expect((observation.records as Array<Record<string, unknown>>).map((record) => record.status)).toEqual(
      fixture.expected_statuses,
    );
  }
});

test("REL-00 CI-B2 fails closed for malformed identity, runner, merge-base and raw-byte input", () => {
  const fixture = evidence.fixtures[0];
  const validRaw = new Uint8Array(Buffer.from(fixture.raw_name_status_hex, "hex"));

  const noCall = () => {
    throw new Error("invalid revisions must not invoke Git");
  };
  expectBlocked(
    acquisition.acquireRawNameStatusZ(
      { base_revision: "HEAD", expected_revision: fixture.expected_revision },
      noCall,
    ),
    "revisions_must_be_canonical_lowercase_commit_oids",
  );
  expectBlocked(
    acquisition.acquireRawNameStatusZ(
      {
        base_revision: fixture.base_revision.replace(/^1/, "A"),
        expected_revision: fixture.expected_revision,
      },
      noCall,
    ),
    "revisions_must_be_canonical_lowercase_commit_oids",
  );
  expectBlocked(
    acquisition.acquireRawNameStatusZ(
      new Proxy({}, {
        get() {
          throw new Error("hostile input getter");
        },
      }) as never,
      noCall,
    ),
    "input_property_access_failed",
  );
  expectBlocked(
    acquisition.acquireRawNameStatusZ(
      { base_revision: fixture.base_revision, expected_revision: fixture.expected_revision },
      null as never,
    ),
    "git_runner_must_be_a_function",
  );
  expectBlocked(
    acquisition.acquireRawNameStatusZ(
      { base_revision: fixture.base_revision, expected_revision: fixture.expected_revision },
      () =>
        new Proxy({}, {
          get() {
            throw new Error("hostile Git result getter");
          },
        }) as GitResult,
    ),
    "git_runner_result_property_access_failed",
  );

  const cases: Array<{
    id: string;
    override: (args: readonly string[]) => GitResult | null;
    reason: string;
  }> = [
    {
      id: "nonzero-revision-verification",
      override: (args) => (args.includes("rev-parse") ? { status: 1, stdout: utf8("") } : null),
      reason: "git_runner_nonzero_exit",
    },
    {
      id: "runner-signal",
      override: (args) => (args.includes("merge-base") ? { status: null, signal: "SIGTERM", stdout: utf8("") } : null),
      reason: "git_runner_signalled",
    },
    {
      id: "runner-error",
      override: (args) => (args.includes("diff") ? { status: null, error: new Error("blocked") } : null),
      reason: "git_runner_error",
    },
    {
      id: "ambiguous-merge-base",
      override: (args) =>
        args.includes("merge-base")
          ? success(utf8(`${fixture.merge_base}\n${fixture.base_revision}\n`))
          : null,
      reason: "git_merge_base_ambiguous_or_invalid",
    },
    {
      id: "raw-output-is-not-bytes",
      override: (args) => (args.includes("diff") ? { status: 0, stdout: "M\u0000docs/a.md\u0000" as never } : null),
      reason: "git_runner_stdout_not_bytes",
    },
    {
      id: "empty-raw-output",
      override: (args) => (args.includes("diff") ? success(utf8("")) : null),
      reason: "empty_name_status_output",
    },
    {
      id: "missing-terminal-nul",
      override: (args) => (args.includes("diff") ? success(utf8("M\u0000docs/a.md")) : null),
      reason: "name_status_output_not_nul_terminated",
    },
    {
      id: "invalid-utf8",
      override: (args) => (args.includes("diff") ? success(new Uint8Array([0x4d, 0, 0xff, 0])) : null),
      reason: "name_status_output_rejected_by_ci_b1_parser",
    },
    {
      id: "truncated-rename",
      override: (args) => (args.includes("diff") ? success(utf8("R100\u0000docs/old.md\u0000")) : null),
      reason: "name_status_output_rejected_by_ci_b1_parser",
    },
  ];

  for (const fixtureCase of cases) {
    const { runner } = makeGitRunner({
      mergeBase: fixture.merge_base,
      rawNameStatus: validRaw,
      override: fixtureCase.override,
    });
    expectBlocked(
      acquisition.acquireRawNameStatusZ(
        {
          base_revision: fixture.base_revision,
          expected_revision: fixture.expected_revision,
        },
        runner,
      ),
      fixtureCase.reason,
    );
  }

  const oversized = new Uint8Array(1024 * 1024 + 1);
  oversized[0] = "M".charCodeAt(0);
  oversized[1] = 0;
  oversized[oversized.length - 1] = 0;
  const { runner } = makeGitRunner({
    mergeBase: fixture.merge_base,
    rawNameStatus: oversized,
  });
  expectBlocked(
    acquisition.acquireRawNameStatusZ(
      { base_revision: fixture.base_revision, expected_revision: fixture.expected_revision },
      runner,
    ),
    "git_runner_stdout_exceeds_cap",
  );
});
