#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { providerFreeVerificationPlan } from "./action-660j-run-provider-free-ci-shard.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const fullShaPattern = /^[0-9a-f]{40}$/;
const alwaysRunLabels = Object.freeze([
  "Lint",
  "TypeScript",
  "Browser and server containment",
]);

export function isFullSha(value) {
  return typeof value === "string" && fullShaPattern.test(value);
}

export function selectDraftCommands(changedPaths) {
  if (
    !Array.isArray(changedPaths) ||
    changedPaths.some((entry) => typeof entry !== "string")
  ) {
    throw new TypeError("changedPaths must be an array of strings");
  }

  const changed = new Set(changedPaths);
  const selected = [];
  for (const plannedCommand of Object.values(providerFreeVerificationPlan).flat()) {
    const includesChangedTest = plannedCommand.args.some(
      (argument) => argument.startsWith("tests/") && changed.has(argument),
    );
    if (
      alwaysRunLabels.includes(plannedCommand.label) ||
      includesChangedTest
    ) {
      selected.push(plannedCommand);
    }
  }
  return Object.freeze(selected);
}

function checkedGit(args) {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    shell: false,
  });
  if (result.error || result.signal || result.status !== 0) {
    throw result.error ?? new Error(result.stderr || "git command failed");
  }
  return result.stdout.trim();
}

function changedPathsBetween(baseRevision, expectedRevision) {
  const mergeBase = checkedGit(["merge-base", baseRevision, expectedRevision]);
  if (!isFullSha(mergeBase)) {
    throw new Error("Unable to resolve an exact merge base");
  }
  const output = checkedGit([
    "diff",
    "--name-only",
    "--diff-filter=ACMR",
    mergeBase,
    expectedRevision,
    "--",
  ]);
  return output === "" ? [] : output.split("\n");
}

function executableFor(runner) {
  switch (runner) {
    case "node":
      return process.execPath;
    case "npm":
      return "npm";
    case "playwright":
      return path.join(repositoryRoot, "node_modules", ".bin", "playwright");
    case "tsc":
      return path.join(repositoryRoot, "node_modules", ".bin", "tsc");
    default:
      throw new Error(`Unsupported runner: ${runner}`);
  }
}

function runCommand(plannedCommand) {
  process.stdout.write(`::group::${plannedCommand.label}\n`);
  const environment = { ...process.env };
  if (plannedCommand.node_options === null) {
    delete environment.NODE_OPTIONS;
  } else {
    environment.NODE_OPTIONS = plannedCommand.node_options;
  }
  const result = spawnSync(
    executableFor(plannedCommand.runner),
    plannedCommand.args,
    {
      cwd: repositoryRoot,
      env: environment,
      shell: false,
      stdio: "inherit",
    },
  );
  process.stdout.write("::endgroup::\n");
  if (result.error) {
    process.stderr.write(`${result.error.message}\n`);
    return 1;
  }
  return result.signal || result.status !== 0 ? (result.status ?? 1) : 0;
}

function main() {
  const [baseRevision, expectedRevision] = process.argv.slice(2);
  if (!isFullSha(baseRevision) || !isFullSha(expectedRevision)) {
    process.stderr.write("Draft verification requires two exact 40-character SHAs\n");
    return 2;
  }
  if (checkedGit(["rev-parse", "HEAD"]) !== expectedRevision) {
    process.stderr.write("Draft verification HEAD does not match expected revision\n");
    return 2;
  }

  const changedPaths = changedPathsBetween(baseRevision, expectedRevision);
  const selectedCommands = selectDraftCommands(changedPaths);
  process.stdout.write(
    `${JSON.stringify({
      changed_paths: changedPaths,
      selected_labels: selectedCommands.map((entry) => entry.label),
    })}\n`,
  );
  for (const plannedCommand of selectedCommands) {
    const status = runCommand(plannedCommand);
    if (status !== 0) {
      return status;
    }
  }
  return 0;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main();
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : "Draft verification failed"}\n`,
    );
    process.exitCode = 1;
  }
}
