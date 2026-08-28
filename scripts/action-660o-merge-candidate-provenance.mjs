import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const WORKFLOW_PATH = ".github/workflows/milestone-a-ci.yml";
const ARTIFACT_PREFIX = "merge-candidate-provenance";
const FULL_CI_JOB_PREFIX = "provider-free-verification / ";
const FULL_CI_SHARDS = Object.freeze([
  "foundation",
  "replay-lineage",
  "snapshot-admission",
  "snapshot-issuance",
  "non-forgeable-authority",
  "lossless-scalar",
]);
const FULL_SHA = /^[0-9a-f]{40}$/;

function fail(message) {
  throw new Error(message);
}

function expectSha(value, label) {
  if (typeof value !== "string" || !FULL_SHA.test(value)) {
    fail(`${label} must be a lowercase 40-character Git SHA`);
  }
  return value;
}

function expectPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 1) {
    fail(`${label} must be a positive integer`);
  }
  return value;
}

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function commitMetadata() {
  const sha = expectSha(git(["rev-parse", "HEAD"]), "checked-out SHA");
  const treeSha = expectSha(
    git(["rev-parse", "HEAD^{tree}"]),
    "checked-out tree SHA",
  );
  const parents = git(["show", "-s", "--format=%P", "HEAD"])
    .split(" ")
    .filter(Boolean)
    .map((value) => expectSha(value, "checked-out parent SHA"));
  const workflowBlobSha = expectSha(
    git(["rev-parse", `HEAD:${WORKFLOW_PATH}`]),
    "workflow blob SHA",
  );
  return {
    sha,
    tree_sha: treeSha,
    parent_shas: parents,
    workflow_blob_sha: workflowBlobSha,
  };
}

function eventPayload() {
  if (!process.env.GITHUB_EVENT_PATH) {
    fail("GITHUB_EVENT_PATH is required");
  }
  return JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
}

function appendOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    writeFileSync(outputPath, `${name}=${String(value)}\n`, { flag: "a" });
  }
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function durationSeconds(startedAt, completedAt) {
  if (!startedAt || !completedAt) return null;
  const milliseconds = Date.parse(completedAt) - Date.parse(startedAt);
  return Number.isFinite(milliseconds) && milliseconds >= 0
    ? Math.round(milliseconds / 1000)
    : null;
}

export function candidateArtifactName({ prNumber, baseSha, headSha, treeSha }) {
  expectPositiveInteger(prNumber, "PR number");
  expectSha(baseSha, "candidate base SHA");
  expectSha(headSha, "candidate head SHA");
  expectSha(treeSha, "candidate tree SHA");
  return `${ARTIFACT_PREFIX}-pr-${prNumber}-base-${baseSha}-head-${headSha}-tree-${treeSha}`;
}

export function fullCiJobTimings(jobs) {
  if (!Array.isArray(jobs)) fail("workflow jobs must be an array");
  const relevant = jobs
    .filter((job) => job?.name?.startsWith(FULL_CI_JOB_PREFIX))
    .map((job) => ({
      shard: job.name.slice(FULL_CI_JOB_PREFIX.length),
      conclusion: job.conclusion ?? null,
      started_at: job.started_at ?? null,
      completed_at: job.completed_at ?? null,
      duration_seconds: durationSeconds(job.started_at, job.completed_at),
    }))
    .sort((left, right) => left.shard.localeCompare(right.shard));

  const expected = [...FULL_CI_SHARDS].sort();
  if (
    relevant.length !== expected.length ||
    JSON.stringify(relevant.map((job) => job.shard)) !==
      JSON.stringify(expected)
  ) {
    fail("Full CI job set is incomplete or unexpected");
  }
  if (relevant.some((job) => job.conclusion !== "success")) {
    fail(
      "every Full CI shard must be successful before provenance is captured",
    );
  }
  if (relevant.some((job) => job.duration_seconds === null)) {
    fail("every Full CI shard must report a valid duration");
  }
  return Object.freeze({
    jobs: Object.freeze(relevant),
    total_runner_seconds: relevant.reduce(
      (total, job) => total + (job.duration_seconds ?? 0),
      0,
    ),
  });
}

export function buildCandidateProvenance({
  pullRequest,
  githubSha,
  githubRef,
  commit,
  workflowSha,
  runId,
  runAttempt,
  fullCi,
}) {
  const prNumber = expectPositiveInteger(pullRequest?.number, "PR number");
  const baseSha = expectSha(pullRequest?.base?.sha, "PR base SHA");
  const headSha = expectSha(pullRequest?.head?.sha, "PR head SHA");
  const candidateSha = expectSha(githubSha, "GitHub candidate SHA");
  const candidateTreeSha = expectSha(commit?.tree_sha, "candidate tree SHA");
  const candidateParents = commit?.parent_shas;
  const workflowCommitSha = expectSha(workflowSha, "workflow SHA");

  if (githubRef !== `refs/pull/${prNumber}/merge`) {
    fail("candidate provenance requires GitHub's pull-request merge ref");
  }
  if (commit?.sha !== candidateSha) {
    fail("checked-out candidate SHA does not match GITHUB_SHA");
  }
  if (
    !Array.isArray(candidateParents) ||
    candidateParents.length !== 2 ||
    candidateParents[0] !== baseSha ||
    candidateParents[1] !== headSha
  ) {
    fail("candidate parents must exactly bind the current base and PR head");
  }
  const runner = fullCiJobTimings(
    (fullCi?.jobs ?? []).map((job) => ({
      name: `${FULL_CI_JOB_PREFIX}${job.shard ?? ""}`,
      conclusion: job.conclusion,
      started_at: job.started_at,
      completed_at: job.completed_at,
    })),
  );
  if (fullCi?.total_runner_seconds !== runner.total_runner_seconds) {
    fail("Full CI runner total does not match its shard evidence");
  }

  const artifactName = candidateArtifactName({
    prNumber,
    baseSha,
    headSha,
    treeSha: candidateTreeSha,
  });
  return Object.freeze({
    schema_version: "merge_candidate_provenance_poc_v1",
    event: "pull_request",
    status: "candidate_full_ci_success",
    pr: Object.freeze({
      number: prNumber,
      head_sha: headSha,
      base_sha: baseSha,
    }),
    candidate: Object.freeze({
      sha: candidateSha,
      tree_sha: candidateTreeSha,
      parent_shas: Object.freeze([...candidateParents]),
    }),
    workflow: Object.freeze({
      path: WORKFLOW_PATH,
      commit_sha: workflowCommitSha,
      file_blob_sha: expectSha(commit?.workflow_blob_sha, "workflow blob SHA"),
    }),
    full_ci: Object.freeze({
      result: "success",
      run_id: expectPositiveInteger(runId, "workflow run ID"),
      run_attempt: expectPositiveInteger(runAttempt, "workflow run attempt"),
      ...runner,
    }),
    artifact_name: artifactName,
  });
}

export function compareMainToCandidate({ main, record, exactMainResult }) {
  const mismatches = [];
  const mainSha = expectSha(main?.sha, "main SHA");
  const mainTreeSha = expectSha(main?.tree_sha, "main tree SHA");
  const mainParents = main?.parent_shas;
  if (!Array.isArray(mainParents) || mainParents.length !== 2) {
    mismatches.push("main_commit_is_not_a_two-parent_merge_commit");
  }
  if (record?.schema_version !== "merge_candidate_provenance_poc_v1") {
    mismatches.push("candidate_provenance_schema_is_unknown");
  }
  if (record?.full_ci?.result !== "success") {
    mismatches.push("candidate_full_ci_is_not_successful");
  }
  if (record?.candidate?.tree_sha !== mainTreeSha) {
    mismatches.push("candidate_tree_does_not_match_main_tree");
  }
  if (
    JSON.stringify(record?.candidate?.parent_shas) !==
    JSON.stringify(mainParents)
  ) {
    mismatches.push("candidate_parents_do_not_match_main_parents");
  }
  if (record?.workflow?.file_blob_sha !== main?.workflow_blob_sha) {
    mismatches.push("workflow_file_blob_does_not_match_candidate");
  }
  if (exactMainResult !== "success") {
    mismatches.push("exact_main_full_ci_did_not_succeed");
  }
  return Object.freeze({
    schema_version: "merge_candidate_post_merge_poc_v1",
    status: mismatches.length === 0 ? "matched" : "mismatch_or_uncertain",
    safety_disposition:
      "exact_main_full_ci_retained_during_poc_no_deduplication_authorized",
    main: Object.freeze({
      sha: mainSha,
      tree_sha: mainTreeSha,
      parent_shas: Array.isArray(mainParents)
        ? Object.freeze([...mainParents])
        : [],
    }),
    candidate: record?.candidate ?? null,
    exact_main_full_ci_result: exactMainResult,
    mismatches: Object.freeze(mismatches),
  });
}

export function matchingMergedPullRequest(pullRequests, main) {
  if (!Array.isArray(pullRequests)) return null;
  const parents = main?.parent_shas;
  if (!Array.isArray(parents) || parents.length !== 2) return null;
  return (
    pullRequests.find(
      (candidate) =>
        candidate?.state === "closed" &&
        candidate?.merged_at &&
        candidate?.merge_commit_sha === main.sha &&
        candidate?.base?.sha === parents[0] &&
        candidate?.head?.sha === parents[1],
    ) ?? null
  );
}

async function githubApi(pathname) {
  const token = process.env.GITHUB_TOKEN;
  const apiUrl = process.env.GITHUB_API_URL;
  if (!token || !apiUrl || !process.env.GITHUB_REPOSITORY) {
    fail("GitHub API token, URL and repository are required");
  }
  const response = await fetch(`${apiUrl}${pathname}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    fail(`GitHub API ${pathname} failed with ${response.status}`);
  }
  return response.json();
}

async function workflowJobs(runId) {
  const response = await githubApi(
    `/repos/${process.env.GITHUB_REPOSITORY}/actions/runs/${runId}/jobs?per_page=100`,
  );
  return response.jobs;
}

async function captureCandidate(outputPath) {
  const payload = eventPayload();
  if (
    process.env.GITHUB_EVENT_NAME !== "pull_request" ||
    payload.pull_request?.draft
  ) {
    fail("candidate capture is only valid for a Ready pull request");
  }
  const fullCi = fullCiJobTimings(
    await workflowJobs(process.env.GITHUB_RUN_ID),
  );
  const record = buildCandidateProvenance({
    pullRequest: payload.pull_request,
    githubSha: process.env.GITHUB_SHA,
    githubRef: process.env.GITHUB_REF,
    commit: commitMetadata(),
    workflowSha: process.env.GITHUB_WORKFLOW_SHA,
    runId: Number(process.env.GITHUB_RUN_ID),
    runAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
    fullCi,
  });
  writeJson(outputPath, record);
  appendOutput("artifact_name", record.artifact_name);
  appendOutput("candidate_sha", record.candidate.sha);
  appendOutput("candidate_tree_sha", record.candidate.tree_sha);
  console.log(JSON.stringify(record, null, 2));
}

function discovery(status, details = {}) {
  return {
    schema_version: "merge_candidate_discovery_poc_v1",
    status,
    safety_disposition:
      "exact_main_full_ci_retained_during_poc_no_deduplication_authorized",
    ...details,
  };
}

async function discoverCandidate(outputPath) {
  const main = commitMetadata();
  const exactMainResult = process.env.EXACT_MAIN_FULL_CI_RESULT ?? "unknown";
  let result;
  if (main.parent_shas.length !== 2) {
    result = discovery("uncertain_non_merge_commit", {
      main,
      exact_main_full_ci_result: exactMainResult,
    });
  } else {
    const pullRequests = await githubApi(
      `/repos/${process.env.GITHUB_REPOSITORY}/commits/${main.sha}/pulls`,
    );
    let pullRequest = matchingMergedPullRequest(pullRequests, main);
    let pullRequestDiscoverySource = "commit_association";
    if (!pullRequest) {
      const recentlyClosedMainPullRequests = await githubApi(
        `/repos/${process.env.GITHUB_REPOSITORY}/pulls?state=closed&base=main&sort=updated&direction=desc&per_page=100`,
      );
      pullRequest = matchingMergedPullRequest(
        recentlyClosedMainPullRequests,
        main,
      );
      pullRequestDiscoverySource = "closed_main_fallback";
    }
    if (!pullRequest) {
      result = discovery("uncertain_no_matching_merged_pr", {
        main,
        exact_main_full_ci_result: exactMainResult,
        pr_discovery_sources: [
          "commit_association",
          "closed_main_fallback",
        ],
      });
    } else {
      const artifactName = candidateArtifactName({
        prNumber: pullRequest.number,
        baseSha: main.parent_shas[0],
        headSha: main.parent_shas[1],
        treeSha: main.tree_sha,
      });
      const runs = await githubApi(
        `/repos/${process.env.GITHUB_REPOSITORY}/actions/runs?event=pull_request&head_sha=${main.parent_shas[1]}&per_page=100`,
      );
      let match = null;
      for (const run of runs.workflow_runs ?? []) {
        if (run.path !== WORKFLOW_PATH || run.conclusion !== "success")
          continue;
        const artifacts = await githubApi(
          `/repos/${process.env.GITHUB_REPOSITORY}/actions/runs/${run.id}/artifacts?per_page=100`,
        );
        if (
          (artifacts.artifacts ?? []).some(
            (artifact) => artifact.name === artifactName && !artifact.expired,
          )
        ) {
          match = { run_id: run.id, artifact_name: artifactName };
          break;
        }
      }
      result = match
        ? discovery("candidate_artifact_found", {
            main,
            pr_number: pullRequest.number,
            pr_discovery_source: pullRequestDiscoverySource,
            exact_main_full_ci_result: exactMainResult,
            ...match,
          })
        : discovery("uncertain_candidate_artifact_missing", {
            main,
            pr_number: pullRequest.number,
            pr_discovery_source: pullRequestDiscoverySource,
            exact_main_full_ci_result: exactMainResult,
            artifact_name: artifactName,
          });
    }
  }
  writeJson(outputPath, result);
  appendOutput("comparison_status", result.status);
  appendOutput("provenance_run_id", result.run_id ?? "");
  appendOutput("provenance_artifact_name", result.artifact_name ?? "");
  console.log(JSON.stringify(result, null, 2));
}

async function verifyMain(recordPath, discoveryPath, outputPath) {
  const current = commitMetadata();
  const found = JSON.parse(readFileSync(discoveryPath, "utf8"));
  let report;
  if (found.status !== "candidate_artifact_found") {
    report = discovery(found.status, {
      main: current,
      exact_main_full_ci_result:
        process.env.EXACT_MAIN_FULL_CI_RESULT ?? "unknown",
      discovery: found,
    });
  } else {
    const record = JSON.parse(readFileSync(recordPath, "utf8"));
    report = compareMainToCandidate({
      main: current,
      record,
      exactMainResult: process.env.EXACT_MAIN_FULL_CI_RESULT ?? "unknown",
    });
    report = {
      ...report,
      pr_number: found.pr_number,
      candidate_full_ci_run_id: record.full_ci.run_id,
      candidate_full_ci_runner_seconds: record.full_ci.total_runner_seconds,
      exact_main_full_ci_runner_seconds: fullCiJobTimings(
        await workflowJobs(process.env.GITHUB_RUN_ID),
      ).total_runner_seconds,
    };
  }
  writeJson(outputPath, report);
  appendOutput("comparison_status", report.status);
  console.log(JSON.stringify(report, null, 2));
}

async function main() {
  const [mode, ...args] = process.argv.slice(2);
  if (mode === "capture" && args.length === 1) {
    await captureCandidate(args[0]);
    return;
  }
  if (mode === "discover" && args.length === 1) {
    await discoverCandidate(args[0]);
    return;
  }
  if (mode === "verify" && args.length === 3) {
    await verifyMain(args[0], args[1], args[2]);
    return;
  }
  fail(
    "usage: action-660o-merge-candidate-provenance.mjs <capture|discover|verify> <paths...>",
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
