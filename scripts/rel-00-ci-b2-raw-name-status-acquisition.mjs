import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  classifyChangeSet,
  parseNameStatusZ,
} from "./rel-00-ci-b1-change-classifier.mjs";

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(moduleDirectory, "..");
const revisionPattern = /^[0-9a-f]{40}$/;
const encoder = new TextEncoder();
const trustedGitExecutable = "/usr/bin/git";
const isolatedGitEnvironment = Object.freeze({
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_OPTIONAL_LOCKS: "0",
  GIT_PAGER: "cat",
  GIT_TERMINAL_PROMPT: "0",
  LANG: "C",
  LC_ALL: "C",
  PATH: "/usr/bin:/bin",
});

export const rawNameStatusAcquisitionPolicy = Object.freeze({
  contract_version: "trade.rel00.ci-b2.raw-name-status-acquisition.v1",
  maximum_stdout_bytes: 1024 * 1024,
  trusted_git_executable: trustedGitExecutable,
  inherited_git_environment: false,
  git_prefix: Object.freeze(["--no-pager", "--no-replace-objects"]),
  rename_policy: "disabled_with_--no-renames",
  diff_options: Object.freeze([
    "--no-ext-diff",
    "--no-textconv",
    "--no-renames",
    "--name-status",
    "-z",
  ]),
});

function canonicalRevision(value) {
  return typeof value === "string" && revisionPattern.test(value) ? value : null;
}

function canonicalInputRevisions(input) {
  if (!input || typeof input !== "object") {
    return { baseRevision: null, expectedRevision: null, reason: null };
  }
  try {
    return {
      baseRevision: canonicalRevision(input.base_revision),
      expectedRevision: canonicalRevision(input.expected_revision),
      reason: null,
    };
  } catch {
    return {
      baseRevision: null,
      expectedRevision: null,
      reason: "input_property_access_failed",
    };
  }
}

function sameBytes(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
}

function clonedBytes(value) {
  return value instanceof Uint8Array ? new Uint8Array(value) : null;
}

function outputDigest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function blockedObservation({ baseRevision, expectedRevision, mergeBase = null, reason }) {
  return Object.freeze({
    contract_version: rawNameStatusAcquisitionPolicy.contract_version,
    outcome: "broad_containment_required",
    reason,
    base_revision: baseRevision,
    expected_revision: expectedRevision,
    merge_base: mergeBase,
    raw_name_status_length: null,
    raw_name_status_sha256: null,
    raw_name_status_z: null,
    records: Object.freeze([]),
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
}

function acquiredObservation({ baseRevision, expectedRevision, mergeBase, rawBytes, records }) {
  const stableRawBytes = new Uint8Array(rawBytes);
  const observation = {
    contract_version: rawNameStatusAcquisitionPolicy.contract_version,
    outcome: "acquired",
    reason: null,
    base_revision: baseRevision,
    expected_revision: expectedRevision,
    merge_base: mergeBase,
    raw_name_status_length: stableRawBytes.length,
    raw_name_status_sha256: outputDigest(stableRawBytes),
    records,
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
  Object.defineProperty(observation, "raw_name_status_z", {
    configurable: false,
    enumerable: true,
    get() {
      return new Uint8Array(stableRawBytes);
    },
  });
  return Object.freeze(observation);
}

function runLocalReadOnlyGit(args) {
  return spawnSync(trustedGitExecutable, args, {
    cwd: repositoryRoot,
    encoding: null,
    env: isolatedGitEnvironment,
    maxBuffer: rawNameStatusAcquisitionPolicy.maximum_stdout_bytes,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 10_000,
  });
}

function commandResult(runGit, args) {
  let result;
  try {
    result = runGit(Object.freeze([...args]));
  } catch {
    return { ok: false, reason: "git_runner_threw" };
  }

  if (!result || typeof result !== "object") {
    return { ok: false, reason: "git_runner_returned_invalid_result" };
  }
  let error;
  let signal;
  let status;
  let stdoutValue;
  try {
    ({ error, signal, status, stdout: stdoutValue } = result);
  } catch {
    return { ok: false, reason: "git_runner_result_property_access_failed" };
  }
  if (error !== null && error !== undefined) {
    return { ok: false, reason: "git_runner_error" };
  }
  if (signal !== null && signal !== undefined) {
    return { ok: false, reason: "git_runner_signalled" };
  }
  if (status !== 0) {
    return { ok: false, reason: "git_runner_nonzero_exit" };
  }

  let stdout;
  try {
    stdout = clonedBytes(stdoutValue);
  } catch {
    return { ok: false, reason: "git_runner_result_property_access_failed" };
  }
  if (stdout === null) {
    return { ok: false, reason: "git_runner_stdout_not_bytes" };
  }
  if (stdout.length > rawNameStatusAcquisitionPolicy.maximum_stdout_bytes) {
    return { ok: false, reason: "git_runner_stdout_exceeds_cap" };
  }
  return { ok: true, stdout };
}

function revisionVerificationArgs(revision) {
  return [
    ...rawNameStatusAcquisitionPolicy.git_prefix,
    "rev-parse",
    "--verify",
    "--quiet",
    `${revision}^{commit}`,
  ];
}

function mergeBaseArgs(baseRevision, expectedRevision) {
  return [
    ...rawNameStatusAcquisitionPolicy.git_prefix,
    "merge-base",
    "--all",
    baseRevision,
    expectedRevision,
  ];
}

function nameStatusDiffArgs(mergeBase, expectedRevision) {
  return [
    ...rawNameStatusAcquisitionPolicy.git_prefix,
    "diff",
    ...rawNameStatusAcquisitionPolicy.diff_options,
    mergeBase,
    expectedRevision,
    "--",
  ];
}

function verifiedRevision(runGit, revision) {
  const result = commandResult(runGit, revisionVerificationArgs(revision));
  if (!result.ok) {
    return result;
  }
  return sameBytes(result.stdout, encoder.encode(`${revision}\n`))
    ? { ok: true, revision }
    : { ok: false, reason: "git_revision_verification_mismatch" };
}

function singleMergeBase(result) {
  if (!result.ok) {
    return result;
  }
  const decoded = new TextDecoder("utf-8", { fatal: true });
  let value;
  try {
    value = decoded.decode(result.stdout);
  } catch {
    return { ok: false, reason: "git_merge_base_not_utf8" };
  }
  if (!/^[0-9a-f]{40}\n$/.test(value)) {
    return { ok: false, reason: "git_merge_base_ambiguous_or_invalid" };
  }
  return { ok: true, revision: value.slice(0, -1) };
}

/**
 * Acquires only raw, NUL-terminated `git diff --name-status -z` bytes for
 * exact immutable revisions. This is a source-only, non-operational evidence
 * seam: every result remains effective Tier 3 and cannot emit a test plan.
 */
export function acquireRawNameStatusZ(input, runGit = runLocalReadOnlyGit) {
  const inputRevisions = canonicalInputRevisions(input);
  const { baseRevision, expectedRevision } = inputRevisions;
  if (inputRevisions.reason !== null) {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      reason: inputRevisions.reason,
    });
  }
  if (baseRevision === null || expectedRevision === null) {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      reason: "revisions_must_be_canonical_lowercase_commit_oids",
    });
  }
  if (typeof runGit !== "function") {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      reason: "git_runner_must_be_a_function",
    });
  }

  const verifiedBase = verifiedRevision(runGit, baseRevision);
  if (!verifiedBase.ok) {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      reason: verifiedBase.reason,
    });
  }
  const verifiedHead = verifiedRevision(runGit, expectedRevision);
  if (!verifiedHead.ok) {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      reason: verifiedHead.reason,
    });
  }

  const mergeBase = singleMergeBase(
    commandResult(runGit, mergeBaseArgs(baseRevision, expectedRevision)),
  );
  if (!mergeBase.ok) {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      reason: mergeBase.reason,
    });
  }
  const verifiedMergeBase = verifiedRevision(runGit, mergeBase.revision);
  if (!verifiedMergeBase.ok) {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      mergeBase: mergeBase.revision,
      reason: verifiedMergeBase.reason,
    });
  }

  const rawResult = commandResult(
    runGit,
    nameStatusDiffArgs(mergeBase.revision, expectedRevision),
  );
  if (!rawResult.ok) {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      mergeBase: mergeBase.revision,
      reason: rawResult.reason,
    });
  }
  if (rawResult.stdout.length === 0) {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      mergeBase: mergeBase.revision,
      reason: "empty_name_status_output",
    });
  }
  if (rawResult.stdout.at(-1) !== 0) {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      mergeBase: mergeBase.revision,
      reason: "name_status_output_not_nul_terminated",
    });
  }

  let records;
  try {
    records = parseNameStatusZ(rawResult.stdout);
  } catch {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      mergeBase: mergeBase.revision,
      reason: "name_status_output_rejected_by_ci_b1_parser",
    });
  }
  if (records.length === 0) {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      mergeBase: mergeBase.revision,
      reason: "empty_name_status_records",
    });
  }

  let classification;
  try {
    classification = classifyChangeSet(records);
    if (
      !classification ||
      typeof classification !== "object" ||
      classification.effective_tier !== 3 ||
      classification.fast_path_eligible !== false ||
      classification.activation_eligible !== false
    ) {
      return blockedObservation({
        baseRevision,
        expectedRevision,
        mergeBase: mergeBase.revision,
        reason: "ci_b1_classification_invariant_failed",
      });
    }
  } catch {
    return blockedObservation({
      baseRevision,
      expectedRevision,
      mergeBase: mergeBase.revision,
      reason: "ci_b1_classification_rejected",
    });
  }

  return acquiredObservation({
    baseRevision,
    expectedRevision,
    mergeBase: mergeBase.revision,
    rawBytes: rawResult.stdout,
    records,
  });
}
