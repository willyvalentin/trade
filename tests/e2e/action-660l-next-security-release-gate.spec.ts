import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repositoryRoot = path.resolve(__dirname, "../..");
const evidencePath =
  "docs/evidence/action-660l-next-security-release-gate.json";
const contractPath = "docs/action-660l-next-security-release-gate.md";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const draftRunnerPath = "scripts/action-660k-run-draft-ci.mjs";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const evidenceSha256 =
  "b7ad4d3aced53da86e54ed03d205dbbcc68588b3554a26c44edd65a6db692e5a";

const sourcePaths = [
  "package.json",
  "package-lock.json",
  "AGENTS.md",
  ".github/workflows/milestone-a-ci.yml",
  "proxy.ts",
  registrationPath,
  runnerPath,
  draftRunnerPath,
  "tests/e2e/action-307k-proxy-runtime-crash-isolation.spec.ts",
  "tests/e2e/action-652n-auth-route-origin-csrf-remediation.spec.ts",
  "tests/e2e/api-auth-middleware-boundary-audit.spec.ts",
  "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts",
  "tests/e2e/action-660k-cost-bounded-provider-free-verification.spec.ts",
  "docs/evidence/action-666db-current-main-position-version-schema-reconciliation.json",
  "tests/e2e/action-666db-current-main-position-version-schema-reconciliation.spec.ts",
  contractPath,
  "docs/ture-current-state-ledger.md",
  "docs/ture-master-roadmap.md",
] as const;

type PlannedCommand = {
  label: string;
  runner: "node" | "npm" | "playwright" | "tsc";
  args: string[];
  node_options: string | null;
};

type ShardRunnerModule = {
  providerFreeVerificationPlan: Record<string, PlannedCommand[]>;
};

type DraftRunnerModule = {
  selectDraftCommands: (changedPaths: unknown) => PlannedCommand[];
};

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

async function sourceHashes() {
  return Object.fromEntries(
    await Promise.all(
      sourcePaths.map(async (sourcePath) => [
        sourcePath,
        sha256(await source(sourcePath)),
      ]),
    ),
  );
}

function expectedEvidence(sources: Record<string, string>) {
  return {
    contract_version: "action_660l_next_security_release_gate_v1",
    observed_at: "2026-08-20",
    authority: {
      base_main_commit: "6ef40e52eb7139e1e8c238f8a1d44385c0d1cf8a",
      base_main_tree: "2f4d282dd3fc867d96b5dac2dcdcc59c50d6f8a7",
      base_exact_main_ci_run: 32372291563,
      required_check: "provider-free-verification",
      last_verified_production_commit:
        "f463644ddeb7f49fa8b80924d9103ea8970ccae4",
      last_verified_production_deploy: "6a7b9e45ceb7e100087c55fa",
      merge_authorized: false,
      production_deployment_authorized: false,
      provider_mutation_performed: false,
    },
    baseline: {
      next: "16.2.6",
      eslint_config_next: "16.2.6",
      sharp: "0.34.5",
      postcss: "8.5.14",
      nanoid: "3.3.12",
      production_dependency_high_findings: 4,
      release_blocking_advisory: "GHSA-6gpp-xcg3-4w24",
      proxy_auth_boundary_present: true,
      i18n_routing_present: false,
      server_actions_present: false,
      rewrites_present: false,
    },
    candidate: {
      next: "16.3.1",
      eslint_config_next: "16.3.1",
      sharp: "0.35.3",
      postcss: "8.5.23",
      nanoid: "3.3.18",
      full_audit_total_findings: 0,
      build_completed: true,
      static_pages_generated: 33,
      typescript_completed: true,
      lint_errors: 0,
      lint_existing_warnings: 7,
    },
    proxy_reconciliation: {
      baseline_passes: 21,
      baseline_failures: 6,
      uncorrected_candidate_passes: 21,
      uncorrected_candidate_failures: 6,
      corrected_candidate_passes: 17,
      corrected_candidate_failures: 0,
      stale_expectations_corrected: 6,
      proxy_runtime_source_changed: false,
      ordinary_api_requires_session: true,
      canonical_public_paths_are_exact: true,
      secret_leakage_observed: false,
      side_effect_observed: false,
    },
    ci: {
      workflow_changed: false,
      draft_quick_route_preserved: true,
      draft_quick_can_authorize_merge: false,
      full_ready_and_main_audit_label: "Production dependency audit",
      full_ready_and_main_build_label: "Production build",
      audit_command: ["npm", "audit", "--audit-level=high", "--no-fund"],
      build_command: ["npm", "run", "build"],
      focused_proxy_tests: [
        "tests/e2e/action-307k-proxy-runtime-crash-isolation.spec.ts",
        "tests/e2e/action-652n-auth-route-origin-csrf-remediation.spec.ts",
        "tests/e2e/api-auth-middleware-boundary-audit.spec.ts",
      ],
      action_oracle:
        "tests/e2e/action-660l-next-security-release-gate.spec.ts",
      registered_exactly_once: true,
    },
    sources,
    delivery: {
      draft_quick_ci_observed_green: false,
      draft_protected_aggregate_observed_failure: false,
      ready_exact_head_full_ci_observed_green: false,
      independent_review_no_findings: false,
      operator_approval_exact_pr_and_head: false,
      ordinary_protected_merge: false,
      exact_main_full_ci_observed_green: false,
      production_deployment_performed: false,
    },
  };
}

function validateEvidence(
  value: unknown,
  sources: Record<string, string>,
) {
  expect(value).toEqual(expectedEvidence(sources));
}

test("pins exact security-release evidence and every governed source", async () => {
  const rawEvidence = await source(evidencePath);
  const evidence = JSON.parse(rawEvidence) as unknown;
  const sources = await sourceHashes();

  expect(sha256(rawEvidence)).toBe(evidenceSha256);
  validateEvidence(evidence, sources);

  const packageJson = JSON.parse(await source("package.json"));
  const lock = JSON.parse(await source("package-lock.json"));
  expect(packageJson.dependencies.next).toBe("16.3.1");
  expect(packageJson.devDependencies["eslint-config-next"]).toBe("16.3.1");
  expect(lock.packages["node_modules/next"].version).toBe("16.3.1");
  expect(lock.packages["node_modules/sharp"].version).toBe("0.35.3");
  expect(lock.packages["node_modules/postcss"].version).toBe("8.5.23");
  expect(lock.packages["node_modules/nanoid"].version).toBe("3.3.18");
});

test("runs one full audit/build gate while keeping Draft feedback non-authoritative", async () => {
  const shardModule = (await import(
    pathToFileURL(path.join(repositoryRoot, runnerPath)).href
  )) as ShardRunnerModule;
  const draftModule = (await import(
    pathToFileURL(path.join(repositoryRoot, draftRunnerPath)).href
  )) as DraftRunnerModule;
  const foundation = shardModule.providerFreeVerificationPlan.foundation;

  expect(foundation.filter((entry) => entry.label === "Production dependency audit"))
    .toEqual([
      {
        label: "Production dependency audit",
        runner: "npm",
        args: ["audit", "--audit-level=high", "--no-fund"],
        node_options: null,
      },
    ]);
  expect(foundation.filter((entry) => entry.label === "Production build"))
    .toEqual([
      {
        label: "Production build",
        runner: "npm",
        args: ["run", "build"],
        node_options: null,
      },
    ]);

  const browserGroup = foundation.find(
    (entry) => entry.label === "Browser and server containment",
  );
  expect(browserGroup?.args).toEqual(
    expect.arrayContaining([
      "tests/e2e/action-307k-proxy-runtime-crash-isolation.spec.ts",
      "tests/e2e/action-652n-auth-route-origin-csrf-remediation.spec.ts",
      "tests/e2e/api-auth-middleware-boundary-audit.spec.ts",
      "tests/e2e/action-660l-next-security-release-gate.spec.ts",
    ]),
  );

  expect(
    draftModule
      .selectDraftCommands(["package.json", "package-lock.json"])
      .map((entry) => entry.label),
  ).toEqual(["Lint", "TypeScript", "Browser and server containment"]);

  const registration = JSON.parse(await source(registrationPath)) as string[];
  for (const requiredPath of [
    "tests/e2e/action-307k-proxy-runtime-crash-isolation.spec.ts",
    "tests/e2e/action-652n-auth-route-origin-csrf-remediation.spec.ts",
    "tests/e2e/api-auth-middleware-boundary-audit.spec.ts",
    "tests/e2e/action-660l-next-security-release-gate.spec.ts",
  ]) {
    expect(registration.filter((entry) => entry === requiredPath)).toHaveLength(1);
  }
});

test("preserves the fail-closed proxy and separate production authority", async () => {
  const proxySource = await source("proxy.ts");
  const crashIsolation = await source(
    "tests/e2e/action-307k-proxy-runtime-crash-isolation.spec.ts",
  );
  const boundaryAudit = await source(
    "tests/e2e/api-auth-middleware-boundary-audit.spec.ts",
  );
  const contract = await source(contractPath);
  const ledger = await source("docs/ture-current-state-ledger.md");
  const roadmap = await source("docs/ture-master-roadmap.md");

  expect(proxySource).toContain('pathname === "/api/runtime-health/ping"');
  expect(proxySource).toContain('pathname.startsWith("/api/historical-backfill/")');
  expect(proxySource).toContain("application_session_required");
  expect(crashIsolation).toContain('expectProxyAuthRequired("/api/ping307h/")');
  expect(crashIsolation).toContain('expectProxyAuthRequired("/api/symbol-metadata")');
  expect(boundaryAudit).toContain("expect(hb307cPingResponse.status).toBe(401)");
  expect(boundaryAudit).toContain(
    "expect(routePublicationDiagnosticSlashResponse.status).toBe(401)",
  );

  for (const text of [contract, ledger, roadmap]) {
    expect(text).toContain("Action 660L");
    expect(text).toContain("6ef40e52eb7139e1e8c238f8a1d44385c0d1cf8a");
    expect(text).toContain("f463644ddeb7f49fa8b80924d9103ea8970ccae4");
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
    expect(text).not.toMatch(/(?:github_pat_|ghp_|postgres(?:ql)?:\/\/)/i);
  }
  expect(contract).toContain("`production_deployment_authorized:false`");
  expect(contract).toContain(
    "Production deployment remains a separate later decision.",
  );
});

test("rejects evidence deletion, extras and authority/security forgery", async () => {
  const raw = JSON.parse(
    await source(evidencePath),
  ) as ReturnType<typeof expectedEvidence>;
  const sources = await sourceHashes();
  const mutations: Array<
    (value: ReturnType<typeof expectedEvidence>) => void
  > = [
    (value) => {
      Reflect.deleteProperty(
        value.authority,
        "production_deployment_authorized",
      );
    },
    (value) => {
      value.authority.production_deployment_authorized = true;
    },
    (value) => {
      value.authority.merge_authorized = true;
    },
    (value) => {
      value.candidate.next = "16.2.6";
    },
    (value) => {
      value.candidate.full_audit_total_findings = 1;
    },
    (value) => {
      value.proxy_reconciliation.proxy_runtime_source_changed = true;
    },
    (value) => {
      Reflect.deleteProperty(value.sources, "package-lock.json");
    },
    (value) => {
      value.sources.unexpected = "0".repeat(64);
    },
    (value) => {
      Object.assign(value, { unexpected: true });
    },
  ];

  for (const mutate of mutations) {
    const candidate = structuredClone(raw);
    mutate(candidate);
    expect(() => validateEvidence(candidate, sources)).toThrow();
  }
});
