import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repositoryRoot = path.resolve(__dirname, "../..");
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const scriptPath = "scripts/action-660o-merge-candidate-provenance.mjs";
const contractPath = "docs/ci-merge-candidate-provenance-poc.md";

const sha = (character: string) => character.repeat(40);

type ProvenanceModule =
  typeof import("../../scripts/action-660o-merge-candidate-provenance.mjs");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

async function provenanceModule() {
  return import(
    pathToFileURL(path.join(repositoryRoot, scriptPath)).href
  ) as Promise<ProvenanceModule>;
}

function candidateInput() {
  const baseSha = sha("a");
  const headSha = sha("b");
  const candidateSha = sha("c");
  const treeSha = sha("d");
  const workflowSha = sha("e");
  const workflowBlobSha = sha("f");
  const jobs = [
    "foundation",
    "replay-lineage",
    "snapshot-admission",
    "snapshot-issuance",
    "non-forgeable-authority",
    "lossless-scalar",
  ].map((shard, index) => ({
    name: `provider-free-verification / ${shard}`,
    conclusion: "success",
    started_at: `2026-08-26T00:${String(index).padStart(2, "0")}:00Z`,
    completed_at: `2026-08-26T00:${String(index).padStart(2, "0")}:10Z`,
  }));
  return {
    baseSha,
    headSha,
    candidateSha,
    treeSha,
    workflowSha,
    workflowBlobSha,
    jobs,
  };
}

test("binds a candidate artifact to PR, base, head, tree and successful six-shard Full CI", async () => {
  const { buildCandidateProvenance, fullCiJobTimings, candidateArtifactName } =
    await provenanceModule();
  const input = candidateInput();
  const fullCi = fullCiJobTimings(input.jobs);
  const record = buildCandidateProvenance({
    pullRequest: {
      number: 42,
      base: { sha: input.baseSha },
      head: { sha: input.headSha },
    },
    githubSha: input.candidateSha,
    githubRef: "refs/pull/42/merge",
    commit: {
      sha: input.candidateSha,
      tree_sha: input.treeSha,
      parent_shas: [input.baseSha, input.headSha],
      workflow_blob_sha: input.workflowBlobSha,
    },
    workflowSha: input.workflowSha,
    runId: 9001,
    runAttempt: 1,
    fullCi,
  });

  expect(record.full_ci.total_runner_seconds).toBe(60);
  expect(record.candidate.parent_shas).toEqual([input.baseSha, input.headSha]);
  expect(record.artifact_name).toBe(
    candidateArtifactName({
      prNumber: 42,
      baseSha: input.baseSha,
      headSha: input.headSha,
      treeSha: input.treeSha,
    }),
  );
  expect(() =>
    buildCandidateProvenance({
      pullRequest: {
        number: 42,
        base: { sha: input.baseSha },
        head: { sha: input.headSha },
      },
      githubSha: input.candidateSha,
      githubRef: "refs/pull/42/merge",
      commit: {
        ...record.candidate,
        parent_shas: [input.baseSha, sha("9")],
        workflow_blob_sha: input.workflowBlobSha,
      },
      workflowSha: input.workflowSha,
      runId: 9001,
      runAttempt: 1,
      fullCi,
    }),
  ).toThrow("candidate parents");
});

test("only accepts an exact main tree, parent set, workflow blob and successful exact-main result", async () => {
  const { buildCandidateProvenance, compareMainToCandidate, fullCiJobTimings } =
    await provenanceModule();
  const input = candidateInput();
  const record = buildCandidateProvenance({
    pullRequest: {
      number: 42,
      base: { sha: input.baseSha },
      head: { sha: input.headSha },
    },
    githubSha: input.candidateSha,
    githubRef: "refs/pull/42/merge",
    commit: {
      sha: input.candidateSha,
      tree_sha: input.treeSha,
      parent_shas: [input.baseSha, input.headSha],
      workflow_blob_sha: input.workflowBlobSha,
    },
    workflowSha: input.workflowSha,
    runId: 9001,
    runAttempt: 1,
    fullCi: fullCiJobTimings(input.jobs),
  });
  const main = {
    sha: sha("1"),
    tree_sha: input.treeSha,
    parent_shas: [input.baseSha, input.headSha],
    workflow_blob_sha: input.workflowBlobSha,
  };
  expect(
    compareMainToCandidate({ main, record, exactMainResult: "success" }).status,
  ).toBe("matched");
  expect(
    compareMainToCandidate({
      main: { ...main, tree_sha: sha("2") },
      record,
      exactMainResult: "success",
    }).mismatches,
  ).toContain("candidate_tree_does_not_match_main_tree");
  expect(
    compareMainToCandidate({
      main: { ...main, workflow_blob_sha: sha("3") },
      record,
      exactMainResult: "success",
    }).mismatches,
  ).toContain("workflow_file_blob_does_not_match_candidate");
  expect(
    compareMainToCandidate({
      main: { ...main, parent_shas: [input.baseSha, sha("4")] },
      record,
      exactMainResult: "success",
    }).mismatches,
  ).toContain("candidate_parents_do_not_match_main_parents");
  expect(
    compareMainToCandidate({
      main: { ...main, parent_shas: [input.headSha] },
      record,
      exactMainResult: "success",
    }).mismatches,
  ).toContain("main_commit_is_not_a_two-parent_merge_commit");
  expect(
    compareMainToCandidate({ main, record: null, exactMainResult: "success" })
      .status,
  ).toBe("mismatch_or_uncertain");
  expect(
    compareMainToCandidate({ main, record, exactMainResult: "failure" })
      .mismatches,
  ).toContain("exact_main_full_ci_did_not_succeed");
});

test("keeps Draft CI, required aggregate and exact-main Full CI unchanged while adding POC-only evidence jobs", async () => {
  const workflow = await source(workflowPath);
  const contract = await source(contractPath);
  expect(workflow).toContain("actions: read");
  expect(workflow).toContain("pull-requests: read");
  expect(workflow).toContain("ref: ${{ github.event.pull_request.head.sha }}");
  expect(workflow).toContain("ref: ${{ github.sha }}");
  expect(workflow).toContain("EXPECTED_REVISION: ${{ github.sha }}");
  expect(workflow).toContain("merge-candidate-provenance:");
  expect(workflow).toContain("post-merge-candidate-provenance:");
  expect(workflow).toContain("needs:\n      - provider-free-verification");
  expect(workflow).toContain("name: provider-free-verification");
  expect(workflow).toContain('run: test "$SHARD_RESULT" = "success"');
  expect(await source(scriptPath)).toContain(
    "exact_main_full_ci_retained_during_poc_no_deduplication_authorized",
  );
  expect(workflow).not.toContain("merge_group:");
  expect(contract).toContain("does not reduce, skip, replace, or authorize");
  expect(contract).toContain("mismatch_or_uncertain");
  expect(contract).toContain("Full exact-main CI has already run");
  expect(contract).toContain("Create a merge commit");
});
