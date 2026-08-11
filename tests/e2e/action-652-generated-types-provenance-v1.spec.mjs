// Provider-free executable evidence oracle; no Supabase connection is made.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const root = new URL("../../", import.meta.url);
const manifestUrl = new URL(
  "docs/evidence/action-652-generated-types-provenance-v1/provenance-contract-v1.json",
  root,
);
const manifest = JSON.parse(readFileSync(manifestUrl, "utf8"));

const EXPECTED_SOURCES = new Map([
  [
    "docs/evidence/action-652-current-catalog-migration-contract-v5/contract-registry-v5.json",
    "9ca9dcbc53e5ac1c4dc3ccf825168104278c82a202c90f6b93da801a5fd1ec10",
  ],
  [
    "docs/evidence/action-652-current-catalog-migration-contract-v5/registry-identities.json",
    "6ebb3d1aa493b9d9300d890e374195bde944055c8f998b5d70fa6d89940d96e4",
  ],
  [
    "docs/proofs/execution-record-audit-table-migration-retry-dry-run-output.txt",
    "e06da9a13bc3e427ef1fd82f50d59f973a226cdd818157de4a5052ba2fa500bb",
  ],
  [
    "docs/supabase-generated-types-target-decision.md",
    "b723b44aa3e27d6c141f920ef4b3fe10061a61bcf8062ab3a2ad5dc50a4c6120",
  ],
  [
    "lib/server/action-652-current-catalog-migration-evidence-contract-v5.mts",
    "2dd4b21312fc6476fc88006fe2eda3a90f3135be7a1243363f423231a9c4aca1",
  ],
  [
    "lib/supabase-database.types.ts",
    "5a74e8de579628387d90e414fb434a80d8481fcd53526310e9b3a8e3754d8a6c",
  ],
]);

const EXPECTED_COMMAND =
  "supabase gen types typescript --linked --schema public > lib/supabase-database.types.ts";
const EXPECTED_RECEIPT =
  "792cc8b4d0aa547b0a97a0cea52bb84ec00ec40f2f756ec144fdbcdb111b6d7a";
const EXPECTED_BASE = "7749a7260e9db7362d7c6ae0a38af45322cfd7b3";
const EXPECTED_TREE = "d6e00d31404e84b338fc4782d212dfa60e25fb70";
const EXPECTED_OBSERVED_AT = "2026-08-11T11:23:40Z";
const EXPECTED_SOURCE_COMMIT = "129b03d94a60dec01e4e45b58eef3df52e4d46d2";
const EXPECTED_SOURCE_TREE = "92d9cd4cd961a0cb65224a835a80d5f2017edded";
const EXPECTED_VALIDATOR =
  "2dd4b21312fc6476fc88006fe2eda3a90f3135be7a1243363f423231a9c4aca1";
const EXPECTED_REGISTRY =
  "9ca9dcbc53e5ac1c4dc3ccf825168104278c82a202c90f6b93da801a5fd1ec10";
const EXPECTED_LINKED_CONFIG =
  "e26ba91a384eadd78a09a063c7784642834e19293f23cf07d8f44a97b4125ce8";
const EXPECTED_AUTHORITY = {
  organization: "Valentin Labs",
  project: "Trade",
  project_ref: "ekdyopdrrkphlrsilyoo",
  effective_role: "supabase_read_only_user",
  transaction_read_only: "on",
  default_transaction_read_only: "on",
};
const EXPECTED_COUNTS = {
  schemas: 1,
  tables: 30,
  views: 0,
  columns: 645,
  primary_keys: 30,
  foreign_keys: 17,
  functions: 21,
  enums: 0,
  composites: 0,
};
const EXPECTED_REQUIRED_SYMBOLS = [
  "export type Database",
  "execution_record_audit_events",
  "execution_records",
];
const EXPECTED_CLOSURE_CONDITIONS = [
  "independent_review_no_findings",
  "exact_scope_merge",
  "manifest_and_output_main_reachable",
  "exact_main_ci_success",
];
const EXPECTED_SCOPE_LIMITS = [
  "database_mutation",
  "migration_application",
  "rls_behavior_proof",
  "tenant_owner_binding_proof",
  "release_identity_proof",
  "production_smoke_proof",
  "runtime_authority",
];

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const gitBlobSha1 = (bytes) =>
  createHash("sha1")
    .update(Buffer.from(`blob ${bytes.length}\0`, "utf8"))
    .update(bytes)
    .digest("hex");
const clone = (value) => structuredClone(value);
const readRepoFile = (path) => readFileSync(new URL(path, root));
const exactKeys = (value, expected) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  JSON.stringify(Object.keys(value).sort()) ===
    JSON.stringify([...expected].sort());
const hex = (value, length) =>
  typeof value === "string" &&
  value.length === length &&
  /^[0-9a-f]+$/u.test(value);

function validate(candidate, reader = readRepoFile) {
  try {
    if (
      !exactKeys(candidate, [
        "contract_version",
        "evidence_status",
        "observed_at",
        "authority",
        "source_receipt",
        "generator",
        "output",
        "repository_sources",
        "delivery",
        "scope_limits",
      ])
    ) {
      return false;
    }
    if (
      candidate.contract_version !==
        "trade.action652.generated-types-provenance.v1" ||
      candidate.evidence_status !== "repository_pinned_delivery_candidate" ||
      candidate.observed_at !== EXPECTED_OBSERVED_AT
    ) {
      return false;
    }
    if (
      !exactKeys(candidate.authority, Object.keys(EXPECTED_AUTHORITY)) ||
      Object.entries(EXPECTED_AUTHORITY).some(
        ([key, value]) => candidate.authority[key] !== value,
      )
    ) {
      return false;
    }
    if (
      !exactKeys(candidate.generator, [
        "cli_version",
        "generation_mode",
        "schema_set",
        "command",
        "command_sha256",
        "linked_config_attestation_sha256",
      ]) ||
      candidate.generator.cli_version !== "2.107.0" ||
      candidate.generator.generation_mode !== "linked" ||
      JSON.stringify(candidate.generator.schema_set) !==
        JSON.stringify(["public"]) ||
      candidate.generator.command !== EXPECTED_COMMAND ||
      sha256(Buffer.from(`${candidate.generator.command}\n`, "utf8")) !==
        candidate.generator.command_sha256 ||
      candidate.generator.linked_config_attestation_sha256 !==
        EXPECTED_LINKED_CONFIG ||
      /(?:service[_-]?role|password|token|db-url)/iu.test(
        candidate.generator.command,
      )
    ) {
      return false;
    }
    if (
      !exactKeys(candidate.source_receipt, [
        "contract_version",
        "sha256",
        "source_commit",
        "source_tree",
        "production_validator_sha256",
        "production_registry_sha256",
        "complete",
        "truncated",
        "counts",
        "catalog_manifest_sha256",
        "catalog_aggregate_sha256",
      ]) ||
      candidate.source_receipt.contract_version !==
        "trade.action652.catalog-typegen-evidence.v5" ||
      candidate.source_receipt.sha256 !== EXPECTED_RECEIPT ||
      candidate.source_receipt.source_commit !== EXPECTED_SOURCE_COMMIT ||
      candidate.source_receipt.source_tree !== EXPECTED_SOURCE_TREE ||
      candidate.source_receipt.production_validator_sha256 !==
        EXPECTED_VALIDATOR ||
      candidate.source_receipt.production_registry_sha256 !==
        EXPECTED_REGISTRY ||
      !candidate.source_receipt.complete ||
      candidate.source_receipt.truncated ||
      candidate.source_receipt.catalog_manifest_sha256 !==
        "69ed3224421ff32cdc0b400d70c8c1116f5bf5eea8b68197ead83e6767b08885" ||
      candidate.source_receipt.catalog_aggregate_sha256 !==
        "b004f8ae915103bef0ddc55365af6211df45dc2026a8d39531c305e880375200"
    ) {
      return false;
    }
    const counts = candidate.source_receipt.counts;
    if (
      !exactKeys(counts, Object.keys(EXPECTED_COUNTS)) ||
      Object.entries(EXPECTED_COUNTS).some(
        ([key, value]) => counts[key] !== value,
      )
    ) {
      return false;
    }
    if (
      !exactKeys(candidate.delivery, [
        "reconciliation_base_commit",
        "reconciliation_base_tree",
        "gate",
        "pre_delivery_verified_count",
        "post_delivery_verified_count",
        "total_gate_count",
        "closure_conditions",
      ]) ||
      candidate.delivery.reconciliation_base_commit !== EXPECTED_BASE ||
      candidate.delivery.reconciliation_base_tree !== EXPECTED_TREE ||
      candidate.delivery.gate !== "MA-09" ||
      candidate.delivery.pre_delivery_verified_count !== 8 ||
      candidate.delivery.post_delivery_verified_count !== 9 ||
      candidate.delivery.total_gate_count !== 15 ||
      JSON.stringify(candidate.delivery.closure_conditions) !==
        JSON.stringify(EXPECTED_CLOSURE_CONDITIONS)
    ) {
      return false;
    }
    if (
      !exactKeys(candidate.scope_limits, EXPECTED_SCOPE_LIMITS) ||
      Object.values(candidate.scope_limits).some((value) => value !== false)
    ) {
      return false;
    }
    const sources = candidate.repository_sources;
    if (
      !Array.isArray(sources) ||
      sources.length !== EXPECTED_SOURCES.size ||
      new Set(sources.map((entry) => entry.path)).size !== sources.length ||
      sources.some((entry) => !exactKeys(entry, ["path", "sha256"]))
    ) {
      return false;
    }
    for (const [path, expectedHash] of EXPECTED_SOURCES) {
      const entry = sources.find((item) => item.path === path);
      if (
        !entry ||
        entry.sha256 !== expectedHash ||
        sha256(reader(path)) !== expectedHash
      ) {
        return false;
      }
    }
    if (
      !exactKeys(candidate.output, [
        "path",
        "sha256",
        "git_blob_sha1",
        "required_symbols",
      ]) ||
      candidate.output.path !== "lib/supabase-database.types.ts" ||
      candidate.output.sha256 !== EXPECTED_SOURCES.get(candidate.output.path) ||
      JSON.stringify(candidate.output.required_symbols) !==
        JSON.stringify(EXPECTED_REQUIRED_SYMBOLS)
    ) {
      return false;
    }
    const outputBytes = reader(candidate.output.path);
    if (
      sha256(outputBytes) !== candidate.output.sha256 ||
      gitBlobSha1(outputBytes) !== candidate.output.git_blob_sha1 ||
      !candidate.output.required_symbols.every((symbol) =>
        outputBytes.includes(Buffer.from(symbol, "utf8")),
      )
    ) {
      return false;
    }
    return (
      hex(candidate.generator.command_sha256, 64) &&
      hex(candidate.generator.linked_config_attestation_sha256, 64) &&
      hex(candidate.source_receipt.source_commit, 40) &&
      hex(candidate.source_receipt.source_tree, 40) &&
      candidate.source_receipt.production_validator_sha256 ===
        EXPECTED_SOURCES.get(
          "lib/server/action-652-current-catalog-migration-evidence-contract-v5.mts",
        ) &&
      candidate.source_receipt.production_registry_sha256 ===
        EXPECTED_SOURCES.get(
          "docs/evidence/action-652-current-catalog-migration-contract-v5/contract-registry-v5.json",
        )
    );
  } catch {
    return false;
  }
}

const checks = [];
const check = (name, operation) => {
  let passed = false;
  try {
    passed = Boolean(operation());
  } catch {
    passed = false;
  }
  checks.push({ name, passed });
};

check("baseline provenance valid", () => validate(manifest));
check("source set exact", () =>
  manifest.repository_sources.every(
    (entry) => EXPECTED_SOURCES.get(entry.path) === entry.sha256,
  ),
);
check("observed timestamp mutation rejected", () => {
  const value = clone(manifest);
  value.observed_at = "2099-01-01T00:00:00Z";
  return !validate(value);
});
check("authority metadata mutation rejected", () => {
  const value = clone(manifest);
  value.authority.organization = "forged";
  value.authority.project = "forged";
  return !validate(value);
});
check("command mutation rejected", () => {
  const value = clone(manifest);
  value.generator.command += " ";
  return !validate(value);
});
check("project mutation rejected", () => {
  const value = clone(manifest);
  value.authority.project_ref = "forged";
  return !validate(value);
});
check("schema mutation rejected", () => {
  const value = clone(manifest);
  value.generator.schema_set = ["private"];
  return !validate(value);
});
check("receipt mutation rejected", () => {
  const value = clone(manifest);
  value.source_receipt.sha256 = "f".repeat(64);
  return !validate(value);
});
check("source identity mutation rejected", () => {
  const value = clone(manifest);
  value.source_receipt.source_commit = "f".repeat(40);
  value.source_receipt.source_tree = "f".repeat(40);
  return !validate(value);
});
check("validator digest mutation rejected", () => {
  const value = clone(manifest);
  value.source_receipt.production_validator_sha256 = "f".repeat(64);
  return !validate(value);
});
check("registry digest mutation rejected", () => {
  const value = clone(manifest);
  value.source_receipt.production_registry_sha256 = "f".repeat(64);
  return !validate(value);
});
check("linked config mutation rejected", () => {
  const value = clone(manifest);
  value.generator.linked_config_attestation_sha256 = "f".repeat(64);
  return !validate(value);
});
check("zero-count dimension mutation rejected", () => {
  const value = clone(manifest);
  value.source_receipt.counts.views = 99;
  value.source_receipt.counts.enums = 99;
  value.source_receipt.counts.composites = 99;
  return !validate(value);
});
check("reconciliation base mutation rejected", () => {
  const value = clone(manifest);
  value.delivery.reconciliation_base_commit = "f".repeat(40);
  return !validate(value);
});
check("gate arithmetic mutation rejected", () => {
  const value = clone(manifest);
  value.delivery.post_delivery_verified_count = 10;
  return !validate(value);
});
check("runtime authority mutation rejected", () => {
  const value = clone(manifest);
  value.scope_limits.runtime_authority = true;
  return !validate(value);
});
check("closure conditions mutation rejected", () => {
  const value = clone(manifest);
  value.delivery.closure_conditions = ["a", "b", "c", "d"];
  return !validate(value);
});
check("required output symbols mutation rejected", () => {
  const value = clone(manifest);
  value.output.required_symbols = [];
  return !validate(value);
});
check("scope key mutation rejected", () => {
  const value = clone(manifest);
  value.scope_limits.unreviewed_authority = false;
  return !validate(value);
});
check("repository source shape mutation rejected", () => {
  const value = clone(manifest);
  value.repository_sources[0].unreviewed = false;
  return !validate(value);
});
check("generated output mutation rejected", () =>
  !validate(manifest, (path) => {
    const bytes = readRepoFile(path);
    return path === manifest.output.path
      ? Buffer.concat([bytes, Buffer.from(" ", "utf8")])
      : bytes;
  }),
);

const failures = checks.filter((entry) => !entry.passed);
console.log(
  JSON.stringify(
    {
      protocol: "trade.action652.generated-types-provenance-oracle.v1",
      passed: failures.length === 0,
      check_count: checks.length,
      failed_check_count: failures.length,
      checks,
    },
    null,
    2,
  ),
);
if (failures.length > 0) process.exit(1);
