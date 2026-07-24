import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const rolloutDocPath = join(
  root,
  "docs/execution-record-audit-writer-runtime-persistence-production-rollout.md",
);
const rolloutApprovalDocPath = join(
  root,
  "docs/execution-record-audit-writer-runtime-persistence-production-rollout-approval-request.md",
);
const transitionBoundaryPath = join(
  root,
  "lib/server/execution-lifecycle-transition-service.ts",
);
const lifecycleCallerPath = join(
  root,
  "lib/server/execution-record-audit-writer-lifecycle-caller.ts",
);
const lifecycleHookPath = join(
  root,
  "lib/server/execution-record-audit-writer-lifecycle-hook.ts",
);
const productionWritePathPath = join(
  root,
  "lib/server/execution-record-audit-writer-production-write-path.ts",
);
const runtimeMonitoringPath = join(
  root,
  "lib/server/execution-record-audit-writer-runtime-monitoring.ts",
);

const rolloutApprovalMarker = "action_887_approved_server_only_path";
const transitionBoundaryImport = "execution-lifecycle-transition-service";
const lifecycleCallerImport = "execution-record-audit-writer-lifecycle-caller";
const lifecycleHookImport = "execution-record-audit-writer-lifecycle-hook";
const productionWritePathImport =
  "execution-record-audit-writer-production-write-path";
const runtimeMonitoringImport =
  "execution-record-audit-writer-runtime-monitoring";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function listSourceFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") {
        return [];
      }

      return listSourceFiles(path);
    }

    if (!/\.(tsx?|jsx?|mjs|cjs)$/.test(entry)) {
      return [];
    }

    return [path];
  });
}

function matchingFiles(roots: string[], fragment: string): string[] {
  return roots
    .flatMap((entry) => listSourceFiles(join(root, entry)))
    .filter((path) => read(path).includes(fragment))
    .map((path) => relative(root, path))
    .sort();
}

test("Action 887 rollout proof document records approved blocked boundaries", () => {
  const rolloutDoc = read(rolloutDocPath);
  const approvalDoc = read(rolloutApprovalDocPath);

  expect(rolloutDoc).toContain("Action 887");
  expect(rolloutDoc).toContain(
    "audit_writer_runtime_persistence_production_rollout_completed_server_only_path",
  );
  expect(rolloutDoc).toContain(rolloutApprovalMarker);
  expect(rolloutDoc).toContain("server-only");
  expect(rolloutDoc).toContain("audit-only");
  expect(rolloutDoc).toContain("insert-only");
  expect(rolloutDoc).toContain("runtime monitoring enabled");
  expect(rolloutDoc).toContain("no downstream mutation");
  expect(rolloutDoc).toContain("No UI/browser/client invocation");
  expect(rolloutDoc).toContain("No market-loop/scanner/automation invocation");
  expect(rolloutDoc).toContain("No broker/Avanza behavior");
  expect(rolloutDoc).toContain("No automatic mode");
  expect(approvalDoc).toContain("Approve Action 887");
});

test("Action 887 rollout metadata is present only in the server-only lifecycle chain", () => {
  const boundarySource = read(transitionBoundaryPath);
  const callerSource = read(lifecycleCallerPath);
  const hookSource = read(lifecycleHookPath);
  const writePathSource = read(productionWritePathPath);
  const monitoringSource = read(runtimeMonitoringPath);

  for (const source of [boundarySource, callerSource, hookSource]) {
    expect(source.startsWith('import "server-only";')).toBe(true);
    expect(source).toContain("productionRolloutApproved: true");
    expect(source).toContain(rolloutApprovalMarker);
    expect(source).not.toContain("browserClientInvocationAllowed: true");
    expect(source).not.toContain("uiBrowserInvocationAllowed: true");
    expect(source).not.toContain("marketLoopInvocationAllowed: true");
    expect(source).not.toContain("scannerAutomationInvocationAllowed: true");
    expect(source).not.toContain("brokerAvanzaAllowed: true");
    expect(source).not.toContain("brokerAvanzaBehaviorAllowed: true");
    expect(source).not.toContain("automaticModeAllowed: true");
    expect(source).not.toContain("downstreamMutationAllowed: true");
    expect(source).not.toContain("retryLoopAllowed: true");
  }

  expect(boundarySource).toContain("broaderProductionRolloutAllowed: false");
  expect(writePathSource).toContain(runtimeMonitoringImport);
  expect(writePathSource).toContain(
    "recordExecutionRecordAuditWriterRuntimeMonitoringEvent",
  );
  expect(monitoringSource.startsWith('import "server-only";')).toBe(true);
  expect(monitoringSource).not.toContain(".insert(");
  expect(monitoringSource).not.toContain(".select(");
});

test("Action 887 rollout does not create UI, route, market, scanner, or automation imports", () => {
  const uiRoots = ["app", "components", "hooks"];
  const runtimeRoots = ["app", "components", "hooks", "scripts"];

  for (const fragment of [
    transitionBoundaryImport,
    lifecycleCallerImport,
    lifecycleHookImport,
    productionWritePathImport,
    runtimeMonitoringImport,
    rolloutApprovalMarker,
  ]) {
    expect(matchingFiles(uiRoots, fragment)).toEqual([]);
  }

  const marketScannerMatches = runtimeRoots
    .flatMap((entry) => listSourceFiles(join(root, entry)))
    .filter((path) => /market|scan|scanner|automation|avanza|broker/i.test(relative(root, path)))
    .filter((path) =>
      [
        transitionBoundaryImport,
        lifecycleCallerImport,
        lifecycleHookImport,
        productionWritePathImport,
        runtimeMonitoringImport,
        rolloutApprovalMarker,
      ].some((fragment) => read(path).includes(fragment)),
    )
    .map((path) => relative(root, path));

  expect(marketScannerMatches).toEqual([]);
});
