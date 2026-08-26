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
]);
const criticalSmokeTests = Object.freeze([
  "tests/e2e/action-307k-proxy-runtime-crash-isolation.spec.ts",
  "tests/e2e/action-652n-auth-route-origin-csrf-remediation.spec.ts",
  "tests/e2e/api-auth-middleware-boundary-audit.spec.ts",
]);
const ciContractSmokeTests = Object.freeze([
  "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts",
  "tests/e2e/action-660k-cost-bounded-provider-free-verification.spec.ts",
  "tests/e2e/action-660l-next-security-release-gate.spec.ts",
]);
const documentationExtensions = Object.freeze([".md", ".mdx", ".txt"]);
const sourcePathRules = Object.freeze([
  Object.freeze({
    paths: Object.freeze([
      ".github/workflows/",
      "scripts/action-660j-",
      "scripts/action-660k-",
    ]),
    command: "Draft CI contract smoke",
  }),
  Object.freeze({
    paths: Object.freeze([
      "app/api/auth/",
      "lib/application-session",
      "lib/application-mutation-guard",
      "lib/trade-auth",
      "proxy.ts",
    ]),
    command: "Authenticated boundary",
  }),
]);

function command(label, runner, args, nodeOptions = null) {
  return Object.freeze({
    label,
    runner,
    args: Object.freeze(args),
    node_options: nodeOptions,
  });
}

function playwright(label, tests, reactServer = true) {
  return command(
    label,
    "playwright",
    ["test", ...tests, "--workers=1"],
    reactServer ? "--conditions=react-server" : null,
  );
}

const draftCriticalSmokeCommand = playwright(
  "Draft critical security smoke",
  criticalSmokeTests,
  false,
);
const draftCiContractSmokeCommand = playwright(
  "Draft CI contract smoke",
  ciContractSmokeTests,
  false,
);

export function isFullSha(value) {
  return typeof value === "string" && fullShaPattern.test(value);
}

function plannedCommandsByLabel() {
  const result = new Map();
  for (const plannedCommand of Object.values(providerFreeVerificationPlan).flat()) {
    if (result.has(plannedCommand.label)) {
      throw new Error(`Duplicate provider-free command label: ${plannedCommand.label}`);
    }
    result.set(plannedCommand.label, plannedCommand);
  }
  return result;
}

function registeredTestCommands() {
  const result = new Map();
  for (const plannedCommand of Object.values(providerFreeVerificationPlan).flat()) {
    for (const argument of plannedCommand.args) {
      if (!argument.startsWith("tests/")) {
        continue;
      }
      if (result.has(argument)) {
        throw new Error(`Duplicate provider-free test registration: ${argument}`);
      }
      result.set(argument, plannedCommand);
    }
  }
  return result;
}

function targetedTestCommand(testPath, plannedCommand) {
  switch (plannedCommand.runner) {
    case "playwright":
      return command(
        `Affected registered test: ${testPath}`,
        "playwright",
        ["test", testPath, "--workers=1"],
        plannedCommand.node_options,
      );
    case "node":
      return command(
        `Affected registered test: ${testPath}`,
        "node",
        [testPath],
        plannedCommand.node_options,
      );
    default:
      throw new Error(`Unsupported targeted test runner: ${plannedCommand.runner}`);
  }
}

function isDocumentationPath(changedPath) {
  return (
    changedPath.startsWith("docs/") ||
    documentationExtensions.some((extension) => changedPath.endsWith(extension))
  );
}

export function selectDraftCommands(changedPaths) {
  if (
    !Array.isArray(changedPaths) ||
    changedPaths.some((entry) => typeof entry !== "string")
  ) {
    throw new TypeError("changedPaths must be an array of strings");
  }

  const plannedByLabel = plannedCommandsByLabel();
  const testsByPath = registeredTestCommands();
  const selected = new Map();
  const select = (plannedCommand) => {
    selected.set(plannedCommand.label, plannedCommand);
  };

  for (const label of alwaysRunLabels) {
    const plannedCommand = plannedByLabel.get(label);
    if (!plannedCommand) {
      throw new Error(`Missing required Draft command: ${label}`);
    }
    select(plannedCommand);
  }
  select(draftCriticalSmokeCommand);

  let requireBroadContainment = false;
  for (const changedPath of new Set(changedPaths)) {
    const registeredTestCommand = testsByPath.get(changedPath);
    if (registeredTestCommand) {
      if (!criticalSmokeTests.includes(changedPath)) {
        select(targetedTestCommand(changedPath, registeredTestCommand));
      }
      continue;
    }

    const matchedRule = sourcePathRules.find((rule) =>
      rule.paths.some((sourcePath) => changedPath.startsWith(sourcePath)),
    );
    if (matchedRule) {
      const plannedCommand =
        matchedRule.command === "Draft CI contract smoke"
          ? draftCiContractSmokeCommand
          : plannedByLabel.get(matchedRule.command);
      if (!plannedCommand) {
        throw new Error(`Missing Draft source rule command: ${matchedRule.command}`);
      }
      select(plannedCommand);
      continue;
    }

    if (!isDocumentationPath(changedPath)) {
      requireBroadContainment = true;
    }
  }

  if (requireBroadContainment) {
    const broadContainment = plannedByLabel.get("Browser and server containment");
    if (!broadContainment) {
      throw new Error("Missing broad Draft containment fallback");
    }
    select(broadContainment);
  }

  return Object.freeze([...selected.values()]);
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
