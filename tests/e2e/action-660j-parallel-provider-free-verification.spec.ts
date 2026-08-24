import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const contractPath = "docs/action-660j-parallel-provider-free-verification.md";
const cacheContractPath = "docs/action-660n-lockfile-bound-npm-download-cache.md";
const cacheEvidencePath =
  "docs/evidence/action-660n-lockfile-bound-npm-download-cache.json";
const contractSha256 =
  "816d1353541e3a703791644c2354a2edf7e47252fd656eba420e98a1792cec40";

type PlannedCommand = {
  label: string;
  runner: "node" | "npm" | "playwright" | "tsc";
  args: string[];
  node_options: string | null;
};

function command(
  label: string,
  runner: PlannedCommand["runner"],
  args: string[],
  nodeOptions: string | null = null,
): PlannedCommand {
  return { label, runner, args, node_options: nodeOptions };
}

function playwright(label: string, files: string[], reactServer = true) {
  return command(
    label,
    "playwright",
    ["test", ...files, "--workers=1"],
    reactServer ? "--conditions=react-server" : null,
  );
}

const foundationTests = [
  "tests/e2e/action-650-production-data-access-containment.spec.ts",
  "tests/e2e/action-307k-proxy-runtime-crash-isolation.spec.ts",
  "tests/e2e/action-652n-auth-route-origin-csrf-remediation.spec.ts",
  "tests/e2e/api-auth-middleware-boundary-audit.spec.ts",
  "tests/e2e/action-652b-authenticated-browser-data-migration.spec.ts",
  "tests/e2e/action-652f-server-client-containment.spec.ts",
  "tests/e2e/action-660f-dashboard-owner-relation-disambiguation.spec.ts",
  "tests/e2e/action-660g-ma15-verified-production-reclosure.spec.ts",
  "tests/e2e/action-660h-manual-ma13-merge-control.spec.ts",
  "tests/e2e/action-660i-ma13-verified-branch-protection-closure.spec.ts",
  "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts",
  "tests/e2e/action-660k-cost-bounded-provider-free-verification.spec.ts",
  "tests/e2e/action-660l-next-security-release-gate.spec.ts",
  "tests/e2e/action-660m-current-production-reclosure.spec.ts",
  "tests/e2e/action-666cr-current-main-roadmap-ledger-reconciliation.spec.ts",
  "tests/e2e/action-666da-current-main-track2-milestone-b-reconciliation.spec.ts",
  "tests/e2e/action-666db-current-main-position-version-schema-reconciliation.spec.ts",
  "tests/e2e/action-666dc-position-version-schema-migration-design-and-read-only-backfill-preflight.spec.ts",
  "tests/e2e/action-666dd-authorized-position-version-read-only-backfill-inventory-execution.spec.ts",
  "tests/e2e/action-666de-deterministic-recommendation-lineage-backfill-contract.spec.ts",
  "tests/e2e/action-666df-canonical-recommendation-identity-reconciliation.spec.ts",
  "tests/e2e/action-666dg-append-only-position-version-history-decision.spec.ts",
  "tests/e2e/action-666dh-position-version-history-source-migration-design.spec.ts",
  "tests/e2e/action-666di-position-version-history-source-migration-bytes.spec.ts",
  "tests/e2e/action-666dj-position-version-history-isolated-staging-apply-and-catalog-proof.spec.ts",
  "tests/e2e/action-666dk-position-version-history-authorized-production-apply-and-catalog-proof.spec.ts",
  "tests/e2e/action-666dl-position-version-history-generated-types-and-ma09-provenance-refresh.spec.ts",
  "tests/e2e/action-666dm-market-observation-provenance.spec.ts",
  "tests/e2e/action-666dn-market-observation-readback-boundary.spec.ts",
  "tests/e2e/action-666do-market-price-attestation-boundary.spec.ts",
  "tests/e2e/action-666dp-durable-exit-queue-source-migration-design.spec.ts",
  "tests/e2e/action-666dq-transactional-recommendation-position-handoff-design.spec.ts",
  "tests/e2e/action-666dr-transactional-recommendation-position-writer-source-contract.spec.ts",
  "tests/e2e/action-666ds-transactional-recommendation-position-writer-static-implementation-boundary.spec.ts",
  "tests/e2e/action-666dt-transactional-recommendation-position-writer-implementation-preflight.spec.ts",
  "tests/e2e/action-666du-transactional-recommendation-position-writer-transaction-capability-contract.spec.ts",
  "tests/e2e/action-666dv-transactional-recommendation-position-writer-authenticated-server-owner-context-contract.spec.ts",
  "tests/e2e/action-666dw-transactional-recommendation-position-writer-durable-idempotency-storage-contract.spec.ts",
  "tests/e2e/action-666dx-transactional-recommendation-position-writer-owner-bound-position-effect-contract.spec.ts",
  "tests/e2e/action-666dy-transactional-recommendation-position-writer-commit-visible-result-contract.spec.ts",
  "tests/e2e/action-666dz-transactional-recommendation-position-writer-failure-atomicity-contract.spec.ts",
  "tests/e2e/action-666ea-transactional-recommendation-position-writer-admission-bundle-contract.spec.ts",
  "tests/e2e/action-666eb-transactional-recommendation-position-writer-implementation-authority-decision.spec.ts",
  "tests/e2e/action-666ec-transactional-recommendation-position-writer-private-server-adapter.spec.ts",
  "tests/e2e/action-666ed-transactional-recommendation-position-writer-owner-bound-command-port-preflight.spec.ts",
  "tests/e2e/action-666ee-position-version-lineage-additive-migration-package.spec.ts",
  "tests/e2e/action-666ef-position-version-lineage-isolated-staging-apply-and-catalog-proof.spec.ts",
  "tests/e2e/action-666eg-position-version-lineage-production-apply-decision-and-preflight.spec.ts",
  "tests/e2e/action-666eh-position-version-lineage-authorized-production-apply-and-catalog-proof.spec.ts",
  "tests/e2e/action-666ei-position-version-lineage-owner-bound-backfill-admission-preflight.spec.ts",
  "tests/e2e/action-666ej-position-version-lineage-control-character-projection-provenance-reconciliation.spec.ts",
];

const intelligenceTests = [
  "tests/e2e/action-664a-canonical-recommendation-evaluation.spec.ts",
  "tests/e2e/action-664b-canonical-evaluation-projection-adapters.spec.ts",
  "tests/e2e/action-664c-canonical-evaluation-persistence-contract.spec.ts",
  "tests/e2e/action-664d-additive-evaluation-storage.spec.ts",
  "tests/e2e/action-664e-canonical-capture-orchestrator.spec.ts",
  "tests/e2e/action-664f-canonical-quality-read-model.spec.ts",
  "tests/e2e/action-664g-canonical-quality-metrics.spec.ts",
  "tests/e2e/action-664h-canonical-quality-scorecard.spec.ts",
  "tests/e2e/action-664j-foundation-review-remediation.spec.ts",
];

const shardNames = [
  "foundation",
  "replay-lineage",
  "snapshot-admission",
  "snapshot-issuance",
  "non-forgeable-authority",
  "lossless-scalar",
];

const expectedPlan: Record<string, PlannedCommand[]> = {
  foundation: [
    command("Lint", "npm", ["run", "lint", "--", "--max-warnings=8"]),
    command("TypeScript", "tsc", ["--noEmit", "--incremental", "false"]),
    command("Production dependency audit", "npm", [
      "audit",
      "--audit-level=high",
      "--no-fund",
    ]),
    command("Production build", "npm", ["run", "build"]),
    playwright("Browser and server containment", foundationTests, false),
    playwright(
      "Authenticated boundary",
      ["tests/e2e/action-652-authentication-boundary.spec.ts"],
      false,
    ),
    command("Catalog and migration evidence contract V5", "node", [
      "tests/e2e/action-652-current-catalog-migration-evidence-contract-v5.spec.ts",
    ]),
    command("Catalog evidence independent oracle", "node", [
      "tests/e2e/action-652-current-catalog-migration-evidence-contract-v5-independent.spec.ts",
    ]),
    command("Catalog evidence portability oracle", "node", [
      "tests/e2e/action-652-current-catalog-migration-evidence-contract-v5-portability.spec.ts",
    ]),
    command("Generated-types provenance V1", "node", [
      "tests/e2e/action-652-generated-types-provenance-v1.spec.mjs",
    ]),
    command("Generated-types provenance V2", "node", [
      "tests/e2e/action-660-ma09-generated-types-provenance-v2.spec.mjs",
    ]),
    playwright("Provider-free intelligence contract", intelligenceTests),
    playwright("Predictive explanation foundation", [
      "tests/e2e/action-666m-predictive-outcome-explanation.spec.ts",
      "tests/e2e/action-666cj-current-main-predictive-explanation-freeze.spec.ts",
    ]),
    playwright("Model-improvement proposal foundation", [
      "tests/e2e/action-666v-governed-model-improvement-proposal.spec.ts",
      "tests/e2e/action-666ck-current-main-model-improvement-proposal-freeze.spec.ts",
    ]),
    playwright("Completed improvement evidence adapter", [
      "tests/e2e/action-666ac-completed-improvement-evidence-adapter.spec.ts",
      "tests/e2e/action-666cl-current-main-improvement-evidence-adapter-freeze.spec.ts",
    ]),
    playwright("Completed improvement evidence capture", [
      "tests/e2e/action-666aj-completed-improvement-evidence-capture.spec.ts",
      "tests/e2e/action-666cm-current-main-completed-improvement-evidence-capture-freeze.spec.ts",
    ]),
    playwright("Frozen improvement binding store", [
      "tests/e2e/action-666ax-improvement-binding-store.spec.ts",
      "tests/e2e/action-666co-current-main-frozen-improvement-binding-store-freeze.spec.ts",
    ]),
  ],
  "replay-lineage": [
    playwright("Governed improvement end-to-end replay", [
      "tests/e2e/action-666aq-governed-improvement-end-to-end-replay.spec.ts",
      "tests/e2e/action-666cn-current-main-governed-improvement-end-to-end-replay-freeze.spec.ts",
    ]),
    playwright("Provenance-bound observation verification", [
      "tests/e2e/action-666cu-current-main-provenance-bound-observation-verification.spec.ts",
      "tests/e2e/action-666cu-current-main-provenance-bound-observation-verification-freeze.spec.ts",
    ]),
    playwright("Private atomic observation authority", [
      "tests/e2e/action-666cv-current-main-private-atomic-observation-authority.spec.ts",
      "tests/e2e/action-666cv-current-main-private-atomic-observation-authority-freeze.spec.ts",
    ]),
    playwright("Integrity and provenance separation", [
      "tests/e2e/action-666cw-current-main-integrity-provenance-separated-observation-authority.spec.ts",
      "tests/e2e/action-666cw-current-main-integrity-provenance-separated-observation-authority-freeze.spec.ts",
    ]),
    playwright("Callback-free atomic observation", [
      "tests/e2e/action-666cx-current-main-callback-free-atomic-observation.spec.ts",
      "tests/e2e/action-666cx-current-main-callback-free-atomic-observation-freeze.spec.ts",
    ]),
    playwright("Lossless immutable byte snapshot", [
      "tests/e2e/action-666cy-current-main-lossless-immutable-byte-snapshot.spec.ts",
      "tests/e2e/action-666cy-current-main-lossless-immutable-byte-snapshot-freeze.spec.ts",
    ]),
    playwright("Lossless immutable byte snapshot authority", [
      "tests/e2e/action-666cz-current-main-lossless-immutable-byte-snapshot-authority.spec.ts",
      "tests/e2e/action-666cz-current-main-lossless-immutable-byte-snapshot-authority-freeze.spec.ts",
    ]),
  ],
  "snapshot-admission": [
    playwright("Governed binding snapshot admission", [
      "tests/e2e/action-666bd-governed-binding-snapshot-admission.spec.ts",
      "tests/e2e/action-666cp-current-main-governed-binding-snapshot-admission-freeze.spec.ts",
    ]),
  ],
  "snapshot-issuance": [
    playwright("Governed binding snapshot issuance", [
      "tests/e2e/action-666bq-governed-binding-snapshot-issuance-successor.spec.ts",
      "tests/e2e/action-666cq-current-main-governed-binding-snapshot-issuance-freeze.spec.ts",
    ]),
  ],
  "non-forgeable-authority": [
    playwright("Non-forgeable observation authority", [
      "tests/e2e/action-666cs-current-main-non-forgeable-observation-authority.spec.ts",
      "tests/e2e/action-666cs-current-main-non-forgeable-observation-authority-freeze.spec.ts",
    ]),
  ],
  "lossless-scalar": [
    playwright("Lossless invalid-scalar observation", [
      "tests/e2e/action-666ct-current-main-lossless-invalid-scalar-observation.spec.ts",
      "tests/e2e/action-666ct-current-main-lossless-invalid-scalar-observation-freeze.spec.ts",
    ]),
  ],
};

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function blockBetween(text: string, start: string, end?: string) {
  const startMarker = `  ${start}:`;
  const endMarker = end ? `  ${end}:` : null;
  const startIndex = text.indexOf(startMarker);
  const endIndex = endMarker ? text.indexOf(endMarker) : text.length;
  if (startIndex < 0 || endIndex <= startIndex) {
    throw new Error(`Missing or reordered job block: ${start}`);
  }
  return text.slice(startIndex, endIndex);
}

function occurrenceCount(text: string, needle: string) {
  return text.split(needle).length - 1;
}

test("preserves exact serial coverage in six closed static shard plans", async () => {
  const rawPlan = execFileSync(
    process.execPath,
    [path.join(repositoryRoot, runnerPath), "--plan"],
    { encoding: "utf8" },
  );
  const plan = JSON.parse(rawPlan) as Record<string, PlannedCommand[]>;

  expect(Object.keys(plan)).toEqual(shardNames);
  expect(plan).toEqual(expectedPlan);

  const referencedFiles = Object.values(plan)
    .flat()
    .flatMap((plannedCommand) =>
      plannedCommand.args.filter((argument) => argument.startsWith("tests/")),
    );
  const registeredFiles = JSON.parse(
    await source(registrationPath),
  ) as string[];
  expect(registeredFiles).toEqual(referencedFiles);
  expect(new Set(referencedFiles).size).toBe(referencedFiles.length);
  for (const relativePath of referencedFiles) {
    await expect(access(path.join(repositoryRoot, relativePath))).resolves.toBeUndefined();
  }

  for (const plannedCommand of Object.values(plan).flat()) {
    expect(["node", "npm", "playwright", "tsc"]).toContain(
      plannedCommand.runner,
    );
    if (plannedCommand.runner === "playwright") {
      expect(plannedCommand.args.at(-1)).toBe("--workers=1");
      expect(plannedCommand.node_options).toBe(
        plannedCommand.label === "Browser and server containment" ||
          plannedCommand.label === "Authenticated boundary"
          ? null
          : "--conditions=react-server",
      );
    } else {
      expect(plannedCommand.node_options).toBeNull();
    }
  }

  const invalid = spawnSync(
    process.execPath,
    [path.join(repositoryRoot, runnerPath), "unexpected-shard"],
    { encoding: "utf8" },
  );
  expect(invalid.status).toBe(2);
  expect(invalid.stderr).toContain(
    "Unknown provider-free verification shard: unexpected-shard",
  );
});

test("keeps the protected aggregate identity fail-closed over every shard", async () => {
  const workflow = await source(workflowPath);
  const jobsStart = workflow.indexOf("\njobs:\n");
  expect(jobsStart).toBeGreaterThanOrEqual(0);
  const jobIds = workflow
    .slice(jobsStart + 1)
    .split("\n")
    .filter((line) => /^  [a-z0-9-]+:$/.test(line))
    .map((line) => line.trim().slice(0, -1));
  expect(jobIds).toEqual([
    "draft-provider-free-verification",
    "provider-free-verification-shard",
    "provider-free-verification",
  ]);

  const draftJob = blockBetween(
    workflow,
    "draft-provider-free-verification",
    "provider-free-verification-shard",
  );

  const shardJob = blockBetween(
    workflow,
    "provider-free-verification-shard",
    "provider-free-verification",
  );
  const aggregateJob = blockBetween(workflow, "provider-free-verification");

  expect(shardJob).toContain(
    "name: provider-free-verification / ${{ matrix.shard }}",
  );
  expect(draftJob).toContain("name: draft-provider-free-verification");
  expect(draftJob).toContain(
    "if: ${{ github.event_name == 'pull_request' && github.event.pull_request.draft == true }}",
  );
  expect(shardJob).toContain(
    "if: ${{ github.event_name == 'push' || github.event.pull_request.draft == false }}",
  );
  expect(shardJob).toContain("timeout-minutes: 60");
  expect(shardJob).toContain("fail-fast: false");
  const workflowShards = shardJob
    .split("\n")
    .filter((line) => /^          - [a-z0-9-]+$/.test(line))
    .map((line) => line.trim().slice(2));
  expect(workflowShards).toEqual(shardNames);

  for (const required of [
    "ref: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.sha || github.sha }}",
    "EXPECTED_REVISION: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.sha || github.sha }}",
    'run: test "$(git rev-parse HEAD)" = "$EXPECTED_REVISION"',
    "persist-credentials: false",
    "node-version: 24.19.0",
    "cache: npm",
    "cache-dependency-path: package-lock.json",
    "run: npm ci --ignore-scripts --no-audit --no-fund",
    'run: node scripts/action-660j-run-provider-free-ci-shard.mjs "${{ matrix.shard }}"',
    "git diff --exit-code",
    "git diff --cached --exit-code",
  ]) {
    expect(occurrenceCount(shardJob, required)).toBe(1);
  }

  expect(aggregateJob).toContain("name: provider-free-verification");
  expect(aggregateJob).toContain("if: ${{ always() }}");
  expect(aggregateJob).toContain("- provider-free-verification-shard");
  expect(aggregateJob).toContain(
    "SHARD_RESULT: ${{ needs.provider-free-verification-shard.result }}",
  );
  expect(aggregateJob).toContain('run: test "$SHARD_RESULT" = "success"');
  expect(aggregateJob).not.toContain("continue-on-error");

  for (const result of ["failure", "cancelled", "skipped", "timed_out"]) {
    const shellCheck = spawnSync(
      "/bin/sh",
      ["-c", 'test "$SHARD_RESULT" = "success"'],
      { env: { ...process.env, SHARD_RESULT: result } },
    );
    expect(shellCheck.status).not.toBe(0);
  }
  expect(
    spawnSync("/bin/sh", ["-c", 'test "$SHARD_RESULT" = "success"'], {
      env: { ...process.env, SHARD_RESULT: "success" },
    }).status,
  ).toBe(0);
});

test("binds npm download caching to the committed lockfile without weakening verification", async () => {
  const workflow = await source(workflowPath);
  const draftJob = blockBetween(
    workflow,
    "draft-provider-free-verification",
    "provider-free-verification-shard",
  );
  const shardJob = blockBetween(
    workflow,
    "provider-free-verification-shard",
    "provider-free-verification",
  );
  const [cacheContract, cacheEvidenceRaw] = await Promise.all([
    source(cacheContractPath),
    source(cacheEvidencePath),
  ]);
  const cacheEvidence = JSON.parse(cacheEvidenceRaw);
  const packageLockSha256 = createHash("sha256")
    .update(await source("package-lock.json"))
    .digest("hex");
  const workflowSha256 = createHash("sha256").update(workflow).digest("hex");

  expect(cacheEvidence).toEqual({
    contract_version: "action_660n_lockfile_bound_npm_download_cache_v1",
    authority: {
      base_main_commit: "0ce325d49ad3951cc898070b005fa1d224ef118a",
      base_main_tree: "5cee9a86bdf86bc0117255cb23a9be34e8631b73",
      branch_protection_change: false,
      production_deployment_authority: false,
    },
    lockfile_binding: {
      setup_action: "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
      cache_input: "npm",
      cache_dependency_path: "package-lock.json",
      package_lock_sha256: packageLockSha256,
      workflow_sha256: workflowSha256,
      cached_material: "npm_download_cache_only",
      node_modules_cached: false,
      locked_install_command: "npm ci --ignore-scripts --no-audit --no-fund",
    },
    routes: {
      draft_job: "draft-provider-free-verification",
      full_matrix_job: "provider-free-verification-shard",
      draft_and_full_use_same_lockfile_binding: true,
      full_matrix_shard_count: 6,
      protected_aggregate: "provider-free-verification",
    },
    preserved_controls: {
      draft_vs_ready_gating: true,
      exact_revision_identity_checks: true,
      clean_tree_checks: true,
      npm_ci_ignore_scripts: true,
      fail_closed_aggregate: true,
      branch_protection_behavior: true,
    },
    delivery: {
      cache_hit_observed: false,
      draft_ci_observed: false,
      ready_exact_head_ci_observed: false,
      exact_main_ci_observed: false,
      production_deployment_authorized: false,
    },
  });
  expect(cacheContract).toContain("Action 660N");
  expect(cacheContract).toContain(cacheEvidencePath);
  expect(cacheContract).toContain(cacheEvidence.authority.base_main_commit);
  expect(cacheContract).toContain(cacheEvidence.authority.base_main_tree);
  expect(cacheContract).toContain("does not cache\n`node_modules`");

  for (const job of [draftJob, shardJob]) {
    expect(occurrenceCount(job, "cache: npm")).toBe(1);
    expect(occurrenceCount(job, "cache-dependency-path: package-lock.json")).toBe(1);
    expect(job).not.toContain("package-manager-cache: false");
    expect(occurrenceCount(job, "npm ci --ignore-scripts --no-audit --no-fund")).toBe(1);
    expect(job.indexOf("cache: npm")).toBeLessThan(
      job.indexOf("npm ci --ignore-scripts --no-audit --no-fund"),
    );
    expect(job.indexOf("Verify exact")).toBeLessThan(job.indexOf("cache: npm"));
    expect(job.indexOf("npm ci --ignore-scripts --no-audit --no-fund")).toBeLessThan(
      job.indexOf("Verify tracked source remained unchanged"),
    );
  }

  const aggregateJob = blockBetween(workflow, "provider-free-verification");
  expect(aggregateJob).toContain('run: test "$SHARD_RESULT" = "success"');
  expect(aggregateJob).not.toContain("continue-on-error");
});

test("freezes the bounded baseline and forbids production authority", async () => {
  const contract = await source(contractPath);
  expect(createHash("sha256").update(contract).digest("hex")).toBe(
    contractSha256,
  );
  expect(contract).toContain(
    "`960b88f85f3ad7be10c4b848c40127d63a21390b`, tree",
  );
  expect(contract).toContain(
    "`40b6384cfe95ee8a9e46980d5a5f861f6dc062a1`",
  );
  expect(contract).toContain(
    "Push-triggered exact-main run `32196042641`, job `95900159342`",
  );
  expect(contract).toContain("125 minutes of serial");
  expect(contract).toContain("`production_deployment_authority:false`");
  expect(contract).toContain(
    "Production deployment is neither required nor authorized.",
  );
  expect(contract).toContain("No branch-protection configuration change");
  expect(contract).toContain(
    "exact protected name `provider-free-verification`",
  );

  for (const text of [contract, await source(runnerPath)]) {
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
    for (const prohibitedFragment of [
      ["gh", "p_"].join(""),
      ["github", "_pat_"].join(""),
      ["post", "gres://"].join(""),
      ["postgres", "ql://"].join(""),
    ]) {
      expect(text).not.toContain(prohibitedFragment);
    }
    expect(text).not.toMatch(
      new RegExp(`${["Bear", "er"].join("")}\\s+`, "i"),
    );
  }
});
