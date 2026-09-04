import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(moduleDirectory, "..");
const revisionPattern = /^[0-9a-f]{40}$/;
const rawHeaderPattern =
  /^:([0-7]{6}) ([0-7]{6}) ([0-9a-f]{40}) ([0-9a-f]{40}) ([AM])$/;
const plainDocumentationPathPattern =
  /^docs\/(?!evidence\/|ture-|rel-00-)[^\u0000-\u001f\u007f-\u009f]+\.(?:md|mdx|rst|adoc|txt)$/;
const maxOutputBytes = 1024 * 1024;
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
const gitPrefix = Object.freeze(["--no-pager", "--no-replace-objects"]);
const diffSafetyOptions = Object.freeze([
  "--no-ext-diff",
  "--no-textconv",
  "--no-renames",
]);

export const docsOnlyReadyPolicy = Object.freeze({
  contract_version: "trade.rel00.ci-b7.docs-only-ready.v1",
  disposition_when_eligible: "docs_only",
  disposition_when_uncertain: "full",
  accepted_statuses: Object.freeze(["A", "M"]),
  accepted_modes: Object.freeze({ added: ["000000", "100644"], modified: ["100644", "100644"] }),
  accepted_path_rule:
    "docs prose only, excluding evidence, roadmap, and program-control documents",
  accepted_suffixes: Object.freeze(["md", "mdx", "rst", "adoc", "txt"]),
  content_rule: "git_numstat_must_not_report_binary_content",
  reference_rule:
    "each changed path must have no static reference outside docs in the exact candidate",
  empty_or_ambiguous_change_rule: "full",
  ci_deduplication_authorized: false,
  main_full_ci_required: false,
});

function result(disposition, reason, records = []) {
  return Object.freeze({
    contract_version: docsOnlyReadyPolicy.contract_version,
    disposition,
    reason,
    records: Object.freeze(records.map((record) => Object.freeze({ ...record }))),
    exact_revision_verified: false,
    full_ci_deduplication_authorized: false,
    main_full_ci_required: false,
  });
}

function canonicalRevision(value) {
  return typeof value === "string" && revisionPattern.test(value) ? value : null;
}

function toBytes(value) {
  return value instanceof Uint8Array ? new Uint8Array(value) : null;
}

function commandResult(runGit, args) {
  let observed;
  try {
    observed = runGit(Object.freeze([...args]));
  } catch {
    return { ok: false, reason: "git_runner_threw" };
  }
  if (!observed || typeof observed !== "object") {
    return { ok: false, reason: "git_runner_returned_invalid_result" };
  }
  const { error, signal, status, stdout } = observed;
  if (error !== null && error !== undefined) return { ok: false, reason: "git_runner_error" };
  if (signal !== null && signal !== undefined) return { ok: false, reason: "git_runner_signalled" };
  if (status !== 0) return { ok: false, reason: "git_runner_nonzero_exit" };
  const bytes = toBytes(stdout);
  if (bytes === null || bytes.length > maxOutputBytes) {
    return { ok: false, reason: "git_runner_stdout_invalid" };
  }
  return { ok: true, stdout: bytes };
}

function readOnlyGit(args) {
  return spawnSync(trustedGitExecutable, args, {
    cwd: repositoryRoot,
    encoding: null,
    env: isolatedGitEnvironment,
    maxBuffer: maxOutputBytes,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 10_000,
  });
}

function splitNul(bytes) {
  if (bytes.length === 0 || bytes.at(-1) !== 0) return null;
  const tokens = [];
  let start = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] !== 0) continue;
    if (index === start) return null;
    let token;
    try {
      token = new TextDecoder("utf-8", { fatal: true }).decode(bytes.slice(start, index));
    } catch {
      return null;
    }
    tokens.push(token);
    start = index + 1;
  }
  return tokens;
}

function validPath(path) {
  if (typeof path !== "string" || !plainDocumentationPathPattern.test(path)) return false;
  return !path.split("/").some((segment) => segment === "" || segment === "." || segment === "..");
}

function parseRawRecords(bytes) {
  const tokens = splitNul(bytes);
  if (!tokens || tokens.length === 0 || tokens.length % 2 !== 0) return null;
  const records = [];
  for (let index = 0; index < tokens.length; index += 2) {
    const header = rawHeaderPattern.exec(tokens[index]);
    const path = tokens[index + 1];
    if (!header || !validPath(path)) return null;
    const [, oldMode, newMode, , , status] = header;
    const validModes =
      (status === "A" && oldMode === "000000" && newMode === "100644") ||
      (status === "M" && oldMode === "100644" && newMode === "100644");
    if (!validModes) return null;
    records.push({ status, path, old_mode: oldMode, new_mode: newMode });
  }
  return records;
}

function parseNumstatPaths(bytes) {
  const tokens = splitNul(bytes);
  if (!tokens || tokens.length === 0) return null;
  const paths = new Set();
  for (const token of tokens) {
    const firstTab = token.indexOf("\t");
    const secondTab = token.indexOf("\t", firstTab + 1);
    if (firstTab < 1 || secondTab < firstTab + 2) return null;
    const additions = token.slice(0, firstTab);
    const deletions = token.slice(firstTab + 1, secondTab);
    const path = token.slice(secondTab + 1);
    if (!/^\d+$/.test(additions) || !/^\d+$/.test(deletions) || !validPath(path)) {
      return null;
    }
    if (paths.has(path)) return null;
    paths.add(path);
  }
  return paths;
}

function outputMatchesRevision(bytes, revision) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes).trim() === revision;
  } catch {
    return false;
  }
}

function revisionArgs(revision) {
  return [...gitPrefix, "rev-parse", "--verify", "--quiet", `${revision}^{commit}`];
}

function diffArgs(kind, baseRevision, candidateRevision) {
  return [
    ...gitPrefix,
    "diff",
    ...diffSafetyOptions,
    "--no-abbrev",
    kind,
    "-z",
    baseRevision,
    candidateRevision,
    "--",
  ];
}

function hasExternalReference(runGit, candidateRevision, path) {
  let observed;
  try {
    observed = runGit(
      Object.freeze([
        ...gitPrefix,
        "grep",
        "-l",
        "-F",
        path,
        candidateRevision,
        "--",
        ":(exclude)docs/**",
      ]),
    );
  } catch {
    return null;
  }
  if (!observed || typeof observed !== "object" || observed.error || observed.signal) return null;
  if (observed.status === 1) return false;
  if (observed.status !== 0) return null;
  const bytes = toBytes(observed.stdout);
  return bytes && bytes.length > 0 ? true : null;
}

export function classifyDocsOnlyReadyChange(input, runGit = readOnlyGit) {
  const baseRevision = canonicalRevision(input?.base_revision);
  const candidateRevision = canonicalRevision(input?.candidate_revision);
  if (!baseRevision || !candidateRevision) return result("full", "revision_input_invalid");

  for (const revision of [baseRevision, candidateRevision]) {
    const verified = commandResult(runGit, revisionArgs(revision));
    if (!verified.ok || !outputMatchesRevision(verified.stdout, revision)) {
      return result("full", "revision_identity_unverified");
    }
  }
  const ancestry = commandResult(runGit, [
    ...gitPrefix,
    "merge-base",
    "--is-ancestor",
    baseRevision,
    candidateRevision,
  ]);
  if (!ancestry.ok) return result("full", "base_is_not_candidate_ancestor");

  const raw = commandResult(runGit, diffArgs("--raw", baseRevision, candidateRevision));
  const records = raw.ok ? parseRawRecords(raw.stdout) : null;
  if (!records) return result("full", "raw_change_metadata_invalid");

  const numstat = commandResult(runGit, diffArgs("--numstat", baseRevision, candidateRevision));
  const numstatPaths = numstat.ok ? parseNumstatPaths(numstat.stdout) : null;
  if (
    !numstatPaths ||
    numstatPaths.size !== records.length ||
    records.some((record) => !numstatPaths.has(record.path))
  ) {
    return result("full", "content_kind_or_path_set_unverified", records);
  }

  const whitespace = commandResult(runGit, [
    ...gitPrefix,
    "diff",
    ...diffSafetyOptions,
    "--check",
    baseRevision,
    candidateRevision,
    "--",
  ]);
  if (!whitespace.ok) return result("full", "diff_check_failed", records);

  for (const record of records) {
    const referenced = hasExternalReference(runGit, candidateRevision, record.path);
    if (referenced !== false) {
      return result("full", referenced === true ? "external_reference_found" : "reference_check_unverified", records);
    }
  }

  return Object.freeze({
    ...result("docs_only", "verified_plain_documentation", records),
    exact_revision_verified: true,
  });
}

function appendGithubOutput(outputPath, classification) {
  appendFileSync(
    outputPath,
    `disposition=${classification.disposition}\nreason=${classification.reason}\n`,
    { encoding: "utf8" },
  );
}

function main() {
  const [mode, ...args] = process.argv.slice(2);
  if (mode === "--github-output" && args.length === 3) {
    const [outputPath, baseRevision, candidateRevision] = args;
    const classification = classifyDocsOnlyReadyChange({
      base_revision: baseRevision,
      candidate_revision: candidateRevision,
    });
    appendGithubOutput(outputPath, classification);
    console.log(JSON.stringify(classification));
    return;
  }
  if (mode === "--assert-docs-only" && args.length === 2) {
    const [baseRevision, candidateRevision] = args;
    const classification = classifyDocsOnlyReadyChange({
      base_revision: baseRevision,
      candidate_revision: candidateRevision,
    });
    console.log(JSON.stringify(classification));
    if (classification.disposition !== "docs_only") {
      throw new Error(`docs-only verification failed closed: ${classification.reason}`);
    }
    return;
  }
  throw new Error(
    "usage: rel-00-ci-b7-docs-only-classifier.mjs (--github-output <path> <base> <candidate> | --assert-docs-only <base> <candidate>)",
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
