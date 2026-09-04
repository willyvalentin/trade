import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const contractPath = "docs/rel-00-ci-b7-docs-only-ready-activation.md";
const activationEvidencePath =
  "docs/evidence/rel-00-ci-b7-docs-only-ready-activation.json";
const classifierPath = "scripts/rel-00-ci-b7-docs-only-classifier.mjs";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest = "tests/e2e/rel-00-ci-b7-docs-only-ready-activation.spec.ts";
const base = "a".repeat(40);
const candidate = "b".repeat(40);

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

type GitResult = {
  error?: unknown;
  signal?: string | null;
  status?: number | null;
  stdout?: Uint8Array | null;
};

type ClassifierRuntime = {
  classifyDocsOnlyReadyChange: (
    input: { base_revision: string; candidate_revision: string },
    runGit?: (args: readonly string[]) => GitResult,
  ) => Record<string, unknown>;
  docsOnlyReadyPolicy: Record<string, unknown>;
};

let classifier: ClassifierRuntime;

function bytes(value: string) {
  return new TextEncoder().encode(value);
}

function success(stdout = new Uint8Array()) {
  return { status: 0, signal: null, stdout };
}

function fakeGit({ raw, numstat, externalReference = false, override }: {
  raw: string;
  numstat: string;
  externalReference?: boolean;
  override?: (args: readonly string[]) => GitResult | undefined;
}) {
  return (args: readonly string[]) => {
    const overridden = override?.(args);
    if (overridden) return overridden;
    if (args.includes("rev-parse")) {
      const operand = args.at(-1) ?? "";
      return success(bytes(`${operand.slice(0, -"^{commit}".length)}\n`));
    }
    if (args.includes("merge-base")) return success();
    if (args.includes("grep")) {
      return externalReference ? success(bytes("app/page.tsx\n")) : { status: 1, signal: null, stdout: bytes("") };
    }
    if (args.includes("--raw")) return success(bytes(raw));
    if (args.includes("--numstat")) return success(bytes(numstat));
    if (args.includes("--check")) return success();
    throw new Error(`unexpected command: ${args.join(" ")}`);
  };
}

test.beforeAll(async () => {
  classifier = (await import(pathToFileURL(resolve(root, classifierPath)).href)) as ClassifierRuntime;
});

test("CI-B7 keeps an exact, fail-closed docs-only route with scheduled main Full CI", () => {
  const workflow = source(workflowPath);
  const contract = source(contractPath);
  const activationEvidence = JSON.parse(source(activationEvidencePath));
  const registration = JSON.parse(source(registrationPath)) as string[];
  const classifierSource = source(classifierPath);

  expect(classifier.docsOnlyReadyPolicy).toMatchObject({
    disposition_when_eligible: "docs_only",
    disposition_when_uncertain: "full",
    accepted_statuses: ["A", "M"],
    content_rule: "git_numstat_must_not_report_binary_content",
    ci_deduplication_authorized: false,
    main_full_ci_required: false,
  });
  expect(activationEvidence).toMatchObject({
    contract_version: "trade.rel00.ci-b7.docs-only-ready.v1",
    status: "approved_activation_candidate_pending_ready_full_ci",
    historical_pre_activation: {
      protected_main_commit: "08d67297fe83e609596ea5deae6425d8f67ff532",
      protected_check: "provider-free-verification",
    },
    authority: {
      branch_protection_change: false,
      required_check_rename_or_rebinding: false,
      ready_main_ci_deduplication_authorized: true,
      netlify_or_runtime_change: false,
      provider_broker_deployment_or_production_authority: false,
    },
    ci_b8_observation: {
      minimum_calendar_days: 14,
      minimum_eligible_merged_pull_requests: 10,
      decision_before_both_thresholds: "not_authorized",
    },
  });
  expect(createHash("sha256").update(workflow, "utf8").digest("hex")).toBe(
    activationEvidence.activation_candidate.workflow_sha256,
  );
  expect(
    execFileSync("git", ["hash-object", workflowPath], { cwd: root, encoding: "utf8" }).trim(),
  ).toBe(activationEvidence.activation_candidate.workflow_blob_sha);
  expect(workflow).toContain("ready-docs-only-classification:");
  expect(workflow).toContain("rel-00-ci-b7-docs-only-classifier.mjs --github-output");
  expect(workflow).toContain("needs.ready-docs-only-classification.outputs.disposition != 'docs_only'");
  expect(workflow).toContain("READY_DOCS_ONLY_RESULT");
  expect(workflow).toContain("READY_DOCS_ONLY_DISPOSITION");
  expect(workflow).toContain("needs.provider-free-verification-shard.result == 'success'");
  expect(workflow).toContain("github.event_name == 'push'");
  for (const shard of [
    "foundation",
    "replay-lineage",
    "snapshot-admission",
    "snapshot-issuance",
    "non-forgeable-authority",
    "lossless-scalar",
  ]) {
    expect(workflow).toContain(`- ${shard}`);
  }
  expect(workflow).not.toContain("merge_group:");
  expect(contract).toContain("14 calendar days");
  expect(contract).toContain("at least 10 eligible merged plain-documentation pull requests");
  expect(contract).toContain("post-merge attestation");
  expect(classifierSource).toContain('trustedGitExecutable = "/usr/bin/git"');
  expect(classifierSource).toContain("--no-renames");
  expect(classifierSource).toContain("--no-textconv");
  expect(classifierSource).not.toContain("fetch(");
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});

test("CI-B7 admits only regular, unreferenced prose documentation", () => {
  const raw = `:100644 100644 ${"1".repeat(40)} ${"2".repeat(40)} M\u0000docs/guide.md\u0000`;
  const numstat = "2\t1\tdocs/guide.md\u0000";
  const admitted = classifier.classifyDocsOnlyReadyChange(
    { base_revision: base, candidate_revision: candidate },
    fakeGit({ raw, numstat }),
  );
  expect(admitted).toMatchObject({
    disposition: "docs_only",
    reason: "verified_plain_documentation",
    exact_revision_verified: true,
    full_ci_deduplication_authorized: false,
    main_full_ci_required: false,
    records: [{ status: "M", path: "docs/guide.md", old_mode: "100644", new_mode: "100644" }],
  });
});

test("CI-B7 fails closed for control paths, unsafe metadata, binary output, references and acquisition faults", () => {
  const cases = [
    {
      raw: `:100644 100644 ${"1".repeat(40)} ${"2".repeat(40)} M\u0000docs/rel-00-plan.md\u0000`,
      numstat: "2\t1\tdocs/rel-00-plan.md\u0000",
      reason: "raw_change_metadata_invalid",
    },
    {
      raw: `:100755 100755 ${"1".repeat(40)} ${"2".repeat(40)} M\u0000docs/guide.md\u0000`,
      numstat: "2\t1\tdocs/guide.md\u0000",
      reason: "raw_change_metadata_invalid",
    },
    {
      raw: `:100644 100644 ${"1".repeat(40)} ${"2".repeat(40)} M\u0000docs/guide.md\u0000`,
      numstat: "-\t-\tdocs/guide.md\u0000",
      reason: "content_kind_or_path_set_unverified",
    },
  ];
  for (const fixture of cases) {
    expect(
      classifier.classifyDocsOnlyReadyChange(
        { base_revision: base, candidate_revision: candidate },
        fakeGit(fixture),
      ),
    ).toMatchObject({ disposition: "full", reason: fixture.reason, exact_revision_verified: false });
  }

  const raw = `:100644 100644 ${"1".repeat(40)} ${"2".repeat(40)} M\u0000docs/guide.md\u0000`;
  const numstat = "2\t1\tdocs/guide.md\u0000";
  expect(
    classifier.classifyDocsOnlyReadyChange(
      { base_revision: base, candidate_revision: candidate },
      fakeGit({ raw, numstat, externalReference: true }),
    ),
  ).toMatchObject({ disposition: "full", reason: "external_reference_found" });
  expect(
    classifier.classifyDocsOnlyReadyChange(
      { base_revision: base, candidate_revision: candidate },
      fakeGit({
        raw,
        numstat,
        override: (args) => args.includes("rev-parse") ? success(bytes(`${base}\n`)) : undefined,
      }),
    ),
  ).toMatchObject({ disposition: "full", reason: "revision_identity_unverified" });
});
