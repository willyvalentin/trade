import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ff-position-version-lineage-v2-writer-private-non-data-api-transport-dependency-lockfile-source-installation.md";
const evidencePath =
  "docs/evidence/action-666ff-position-version-lineage-v2-writer-private-non-data-api-transport-dependency-lockfile-source-installation.json";
const packagePath = "package.json";
const packageLockPath = "package-lock.json";
const action666fcModulePath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ff-position-version-lineage-v2-writer-private-non-data-api-transport-dependency-lockfile-source-installation.spec.ts";
const evidenceSha256 =
  "00825412016cb25e9b1e71c11f4639da2ae0c8799df579fd1925d6f253b9995b";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666FF locks exactly the reviewed direct driver and type companion", () => {
  const manifest = JSON.parse(source(packagePath)) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const lockfile = JSON.parse(source(packageLockPath)) as {
    packages?: Record<string, Record<string, unknown>>;
  };

  expect(manifest.dependencies?.pg).toBe("8.23.0");
  expect(manifest.devDependencies?.["@types/pg"]).toBe("8.23.1");
  expect(lockfile.packages?.[""]?.dependencies).toMatchObject({ pg: "8.23.0" });
  expect(lockfile.packages?.[""]?.devDependencies).toMatchObject({
    "@types/pg": "8.23.1",
  });
  expect(lockfile.packages?.["node_modules/pg"]).toMatchObject({
    version: "8.23.0",
    engines: { node: ">= 16.0.0" },
  });
  expect(lockfile.packages?.["node_modules/@types/pg"]).toMatchObject({
    version: "8.23.1",
    dev: true,
  });
  expect(lockfile.packages?.["node_modules/pg-native"]).toBeUndefined();
});

test("666FF binds the exact-main predecessor and confines authority to source dependencies", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "9fa3df157821fe7e5e5bdada455916cd44c6ecc4",
    exact_main_ci_run: 32859794644,
    exact_main_ci_conclusion: "success",
    action_666fe_evidence_path:
      "docs/evidence/action-666fe-position-version-lineage-v2-writer-private-non-data-api-transport-dependency-and-credential-design.json",
  });
  expect(evidence.dependency_lockfile_source_proof).toEqual({
    runtime_manifest_dependency: {
      package_name: "pg",
      exact_version: "8.23.0",
      lockfile_package_path: "node_modules/pg",
      declared_node_engine: ">= 16.0.0",
    },
    development_manifest_dependency: {
      package_name: "@types/pg",
      exact_version: "8.23.1",
      lockfile_package_path: "node_modules/@types/pg",
    },
    package_lock_only_generation: true,
    direct_postgresql_driver_installed_in_manifest: true,
    native_driver_installed: false,
  });
  expect(evidence.authority_limits).toEqual({
    transport_module_implemented: false,
    application_driver_import_added: false,
    credential_provisioned_or_read: false,
    database_connection_opened: false,
    database_query_or_mutation: false,
    writer_invoked: false,
    v2_adapter_implemented: false,
    runtime_wiring: false,
    route_or_ui_wiring: false,
    provider_or_broker_contact: false,
    production_deployment: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_v2_writer_private_non_data_api_transport_dependency_lockfile_source_installation",
    transport_implementation_admitted: false,
    reason:
      "only_the_previously_frozen_exact_dependency_entries_and_lockfile_graph_are_added",
    next_bounded_objective:
      "position_version_lineage_v2_writer_private_non_data_api_transport_credential_provisioning_and_connection_admission_preflight",
    runtime_activation_authorized: false,
  });
});

test("666FF leaves the V2 transport runtime fail-closed", () => {
  expect(source(action666fcModulePath)).not.toMatch(
    /from\s+["']pg["']|require\(["']pg["']\)|process\.env|\b(?:connect|query)\s*\(/,
  );
});

test("666FF is source-only, roadmap-bound and registered once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).toMatch(/no secret/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ff/i);
  expect(source(ledgerPath)).toMatch(/action 666ff/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
