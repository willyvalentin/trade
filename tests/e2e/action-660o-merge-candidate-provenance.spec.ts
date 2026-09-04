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

test("only accepts an exact main tree, parent set and workflow blob covered by successful candidate CI", async () => {
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
    compareMainToCandidate({ main, record }).status,
  ).toBe("matched");
  expect(
    compareMainToCandidate({
      main: { ...main, tree_sha: sha("2") },
      record,
    }).mismatches,
  ).toContain("candidate_tree_does_not_match_main_tree");
  expect(
    compareMainToCandidate({
      main: { ...main, workflow_blob_sha: sha("3") },
      record,
    }).mismatches,
  ).toContain("workflow_file_blob_does_not_match_candidate");
  expect(
    compareMainToCandidate({
      main: { ...main, parent_shas: [input.baseSha, sha("4")] },
      record,
    }).mismatches,
  ).toContain("candidate_parents_do_not_match_main_parents");
  expect(
    compareMainToCandidate({
      main: { ...main, parent_shas: [input.headSha] },
      record,
      exactMainResult: "success",
    }).mismatches,
  ).toContain("main_commit_is_not_a_two-parent_merge_commit");
  expect(compareMainToCandidate({ main, record: null }).status).toBe(
    "mismatch_or_uncertain",
  );
});

test("uses only a fully bound merged PR when the commit association endpoint is empty", async () => {
  const { matchingMergedPullRequest } = await provenanceModule();
  const input = candidateInput();
  const main = {
    sha: sha("1"),
    parent_shas: [input.baseSha, input.headSha],
  };
  const matching = {
    number: 42,
    state: "closed",
    merged_at: "2026-08-26T00:00:00Z",
    merge_commit_sha: main.sha,
    base: { sha: input.baseSha },
    head: { sha: input.headSha },
  };

  expect(matchingMergedPullRequest([], main)).toBeNull();
  expect(matchingMergedPullRequest([matching], main)).toEqual(matching);
  expect(
    matchingMergedPullRequest(
      [{ ...matching, base: { sha: sha("9") } }],
      main,
    ),
  ).toBeNull();
  expect(
    matchingMergedPullRequest(
      [{ ...matching, head: { sha: sha("8") } }],
      main,
    ),
  ).toBeNull();
});

test("keeps Ready CI as the merge gate while attesting main against the tested candidate", async () => {
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
  expect(workflow).toContain('test "$SHARD_RESULT" = "success"');
  expect(workflow).toContain(
    "needs.provider-free-verification-shard.result == 'success'",
  );
  expect(workflow).toContain('cron: "17 3 * * 1-5"');
  expect(workflow).toContain("workflow_dispatch:");
  expect(workflow).toContain("post-merge-candidate-provenance / POC (attestation)");
  expect(workflow).toContain('test "$SHARD_RESULT" = "skipped"');
  expect(await source(scriptPath)).toContain(
    "candidate_full_ci_tree_and_workflow_attested",
  );
  expect(await source(scriptPath)).toContain(
    "pulls?state=closed&base=main&sort=updated&direction=desc&per_page=100",
  );
  expect(await source(scriptPath)).toContain("closed_main_fallback");
  expect(workflow).not.toContain("merge_group:");
  expect(contract).toContain("same matrix is not run\na second time");
  expect(contract).toContain("mismatch_or_uncertain");
  expect(contract).toContain("weekday scheduled\nfull CI");
  expect(contract).toContain("Create a merge commit");
});
