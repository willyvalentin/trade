import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

export const ACTION_664_FOUNDATION_TEST_COMMAND_VERSION =
  "action_664_foundation_test_command_v1";
export const ACTION_664_REQUIRED_NODE_CONDITION = "react-server";

const testDirectory = path.join(process.cwd(), "tests", "e2e");
const actionSpecs = readdirSync(testDirectory)
  .filter((name) => /^action-664[a-j].*\.spec\.ts$/.test(name))
  .sort()
  .map((name) => path.join("tests", "e2e", name));

if (actionSpecs.length === 0) {
  throw new Error("No Action 664A-J test specifications were found.");
}

const existingNodeOptions = process.env.NODE_OPTIONS?.trim() ?? "";
const requiredCondition = `--conditions=${ACTION_664_REQUIRED_NODE_CONDITION}`;
const nodeOptions = existingNodeOptions
  .split(/\s+/)
  .filter(Boolean);
if (!nodeOptions.includes(requiredCondition)) nodeOptions.push(requiredCondition);

const executable =
  process.platform === "win32"
    ? path.join("node_modules", ".bin", "playwright.cmd")
    : path.join("node_modules", ".bin", "playwright");
const result = spawnSync(
  executable,
  ["test", ...actionSpecs, "--workers=1", ...process.argv.slice(2)],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_OPTIONS: nodeOptions.join(" "),
      PLAYWRIGHT_SKIP_WEB_SERVER: "true",
    },
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
