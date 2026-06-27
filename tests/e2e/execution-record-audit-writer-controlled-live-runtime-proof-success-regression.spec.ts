import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const proofPath = join(
  root,
  "docs/proofs/execution-record-audit-writer-controlled-live-runtime-proof.txt",
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
const writerPath = join(root, "lib/server/execution-record-audit-writer.ts");
const adapterPath = join(
  root,
  "lib/server/execution-record-audit-writer-service-role-adapter.ts",
);
const routePath = join(root, "app/api/execution/audit/writer/route.ts");
const thisSpecPath = relative(root, __filename);

const controlledRuntimeProofStatus =
  "controlled_live_runtime_proof_final_retry_completed_success_inserted_no_select";
const controlledExecutionRecordId =
  "5d682086-4195-40ec-ba80-a0a1b39a6923";
const transitionBoundaryImport = "execution-lifecycle-transition-service";
const lifecycleCallerImport = "execution-record-audit-writer-lifecycle-caller";
const lifecycleHookImport = "execution-record-audit-writer-lifecycle-hook";
const productionWritePathImport =
  "execution-record-audit-writer-production-write-path";
const inMemoryProofHarnessImport =
  "execution-record-audit-writer-in-memory-runtime-proof-harness";
const dryRunProofHarnessImport =
  "execution-record-audit-writer-dry-run-runtime-proof-harness";
const writerRouteLiteral = "/api/execution/audit/writer";

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

test("Action 879 proof artifact locks the successful controlled live runtime envelope", () => {
  const proof = read(proofPath);

  expect(proof).toContain("Action 879 Controlled Live Runtime Proof Final Retry Addendum");
  expect(proof).toContain(controlledExecutionRecordId);
  expect(proof).toContain('"nextPublicSupabaseUrlPresent": true');
  expect(proof).toContain('"acceptedServiceRoleAliasPresent": true');
  expect(proof).toContain('"serviceRoleValuePrinted": false');
  expect(proof).toContain('"boundaryStatus": "transition_completed"');
  expect(proof).toContain('"auditCallerStatus": "completed"');
  expect(proof).toContain('"hookStatus": "completed"');
  expect(proof).toContain('"writePathStatus": "completed"');
  expect(proof).toContain('"writerStatus": "success"');
  expect(proof).toContain('"writerOk": true');
  expect(proof).toContain('"dryRunStatus": "ready"');
  expect(proof).toContain('"adapterStatus": "success"');
  expect(proof).toContain('"inserted": true');
  expect(proof).toContain('"auditEventId": "unconfirmed_without_select"');
  expect(proof).toContain('"diagnosticsCategory": null');
  expect(proof).toContain('"diagnosticsCode": null');
  expect(proof).toContain('"retryLoopAllowed": false');
  expect(proof).toContain('"uiBrowserInvocationAllowed": false');
  expect(proof).toContain('"scannerAutomationInvocationAllowed": false');
  expect(proof).toContain('"brokerAvanzaBehaviorAllowed": false');
  expect(proof).toContain('"automaticModeAllowed": false');
  expect(proof).toContain('"downstreamMutationAllowed": false');
  expect(proof).toContain('"broaderProductionRolloutAllowed": false');
  expect(proof).toContain(controlledRuntimeProofStatus);
});

test("Action 879 proof keeps row id unconfirmed without select or table dump", () => {
  const proof = read(proofPath);

  expect(proof).toContain("no broad table dump or post-insert select was run");
  expect(proof).toContain("audit event id remains `unconfirmed_without_select`");
  expect(proof).toContain("no update/delete/upsert/select");
  expect(proof).not.toContain("auditEventId\": \"00000000-");
  expect(proof).not.toMatch(/select \* from public\.execution_record_audit_events/i);
  expect(proof).not.toMatch(/from\("execution_record_audit_events"\)\.select/i);
});

test("Action 879 proof records env presence as booleans only and no service-role value", () => {
  const proof = read(proofPath);

  expect(proof).toContain('"nextPublicSupabaseUrlPresent": true');
  expect(proof).toContain('"acceptedServiceRoleAliasPresent": true');
  expect(proof).toContain('"serviceRoleValuePrinted": false');
  expect(proof).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY\s*=/);
  expect(proof).not.toMatch(/SUPABASE_SERVICE_ROLE_SECRET\s*=/);
  expect(proof).not.toMatch(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
});

test("controlled live runtime proof chain remains server-only and insert-only", () => {
  const boundarySource = read(transitionBoundaryPath);
  const callerSource = read(lifecycleCallerPath);
  const hookSource = read(lifecycleHookPath);
  const writePathSource = read(productionWritePathPath);
  const writerSource = read(writerPath);
  const adapterSource = read(adapterPath);

  for (const source of [
    boundarySource,
    callerSource,
    hookSource,
    writePathSource,
  ]) {
    expect(source.startsWith('import "server-only";')).toBe(true);
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("new Request(");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("window.");
    expect(source).not.toContain("document.");
    expect(source).not.toContain("retry(");
    expect(source).not.toContain("retryLoopAllowed: true");
  }

  expect(boundarySource).toContain(lifecycleCallerImport);
  expect(callerSource).toContain(lifecycleHookImport);
  expect(hookSource).toContain(productionWritePathImport);
  expect(writePathSource).toContain("appendExecutionRecordAuditEvent");
  expect(adapterSource).toContain('.from("execution_record_audit_events")');
  expect(adapterSource).toContain(".insert(input.insert)");

  for (const source of [
    boundarySource,
    callerSource,
    hookSource,
    writePathSource,
    writerSource,
    adapterSource,
  ]) {
    expect(source).not.toContain(".update(");
    expect(source).not.toContain(".delete(");
    expect(source).not.toContain(".upsert(");
  }

  expect(boundarySource).not.toContain(".select(");
  expect(callerSource).not.toContain(".select(");
  expect(hookSource).not.toContain(".select(");
  expect(writePathSource).not.toContain(".select(");
  expect(writerSource).not.toContain(".select(");
  expect(adapterSource).not.toContain(".select(");
});

test("controlled live runtime proof success path is absent from UI, app shell, route invocation, and proof harness runtime", () => {
  const appShellRoots = ["app", "components", "hooks"];
  const fragments = [
    transitionBoundaryImport,
    lifecycleCallerImport,
    lifecycleHookImport,
    productionWritePathImport,
    inMemoryProofHarnessImport,
    dryRunProofHarnessImport,
    writerRouteLiteral,
  ];

  for (const fragment of fragments) {
    const matches = matchingFiles(appShellRoots, fragment).filter(
      (path) => path !== "app/api/execution/audit/writer/route.ts",
    );

    expect(matches).toEqual([]);
  }

  expect(read(routePath)).not.toContain(transitionBoundaryImport);
  expect(read(routePath)).not.toContain(lifecycleCallerImport);
  expect(read(routePath)).not.toContain(lifecycleHookImport);
  expect(read(routePath)).not.toContain(productionWritePathImport);
});

test("controlled live runtime proof success path is absent from market scanner automation and broker behavior", () => {
  const runtimeRoots = ["app", "components", "hooks", "lib", "scripts"];
  const watchedFragments = [
    transitionBoundaryImport,
    lifecycleCallerImport,
    lifecycleHookImport,
    productionWritePathImport,
    inMemoryProofHarnessImport,
    dryRunProofHarnessImport,
  ];
  const matches = runtimeRoots
    .flatMap((entry) => listSourceFiles(join(root, entry)))
    .filter((path) => /market|scan|scanner|automation|avanza|broker/i.test(
      relative(root, path),
    ))
    .filter((path) =>
      watchedFragments.some((fragment) => read(path).includes(fragment)),
    )
    .map((path) => relative(root, path));

  expect(matches).toEqual([]);
});

test("controlled live runtime proof success path exposes no public service-role surface", () => {
  const sourceFiles = ["app", "components", "hooks", "lib", "scripts"]
    .flatMap((entry) => listSourceFiles(join(root, entry)))
    .map((path) => [relative(root, path), read(path)] as const);

  const publicServiceMatches = sourceFiles
    .filter(([path]) => path !== thisSpecPath)
    .filter(([, source]) =>
      new RegExp("NEXT" + "_PUBLIC_.*SERVICE|SERVICE.*NEXT" + "_PUBLIC", "i")
        .test(source),
    )
    .map(([path]) => path);
  const serviceRoleAssignmentMatches = sourceFiles
    .filter(([path]) => path !== thisSpecPath)
    .filter(([, source]) =>
      /SUPABASE_SERVICE_ROLE(KEY|_SECRET)?\s*=/.test(source),
    )
    .map(([path]) => path);
  const jwtLookingMatches = sourceFiles
    .filter(([path]) => path !== thisSpecPath)
    .filter(([, source]) =>
      /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(source),
    )
    .map(([path]) => path);

  expect(publicServiceMatches).toEqual([]);
  expect(serviceRoleAssignmentMatches).toEqual([]);
  expect(jwtLookingMatches).toEqual([]);
});

test("controlled live runtime proof success path contains no downstream trade stats pnl mutation signals", () => {
  const watchedSources = [
    read(transitionBoundaryPath),
    read(lifecycleCallerPath),
    read(lifecycleHookPath),
    read(productionWritePathPath),
    read(writerPath),
  ].join("\n");

  for (const forbidden of [
    "mutateTrade",
    "updateTrade",
    "updateStats",
    "profitLoss",
    "pnl",
    "PNL",
    "submitBrokerOrder",
    "captureBrokerResult",
    "runScanner",
    "runAutomation",
    "automaticModeAllowed: true",
    "downstreamMutationAllowed: true",
    "tradeStatsPnlMutationAllowed: true",
  ]) {
    expect(watchedSources).not.toContain(forbidden);
  }
});
