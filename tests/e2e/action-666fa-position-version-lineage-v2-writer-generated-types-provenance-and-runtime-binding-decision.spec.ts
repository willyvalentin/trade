import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fa-position-version-lineage-v2-writer-generated-types-provenance-and-runtime-binding-decision.md";
const evidencePath =
  "docs/evidence/action-666fa-position-version-lineage-v2-writer-generated-types-provenance-and-runtime-binding-decision.json";
const typePath = "lib/supabase-database.types.ts";
const adapterPath =
  "lib/server/transactional-recommendation-position-writer-private-adapter.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fa-position-version-lineage-v2-writer-generated-types-provenance-and-runtime-binding-decision.spec.ts";
const evidenceSha256 =
  "19564349886787699bd24640e19f743824d33a587b311ccfb9c3fd56905763bc";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function gitBlobSha1(value: string) {
  return createHash("sha1")
    .update(Buffer.from(`blob ${Buffer.byteLength(value, "utf8")}\0`, "utf8"))
    .update(value, "utf8")
    .digest("hex");
}

test("666FA binds the exact-green predecessor and current generated public output", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);
  const types = source(typePath);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "90ff57128f4b793cad1e9c5bdf3b03395dfed8ef",
    exact_main_ci_run: 32823346526,
    exact_main_ci_conclusion: "success",
    action_666ez_evidence_path:
      "docs/evidence/action-666ez-position-version-lineage-v2-writer-production-apply-and-catalog-proof.json",
  });
  expect(sha256(types)).toBe(evidence.type_generation.repository_output_sha256);
  expect(gitBlobSha1(types)).toBe(
    evidence.type_generation.repository_output_git_blob_sha1,
  );
  expect(Buffer.byteLength(types, "utf8")).toBe(
    evidence.type_generation.generated_type_bytes,
  );
});

test("666FA exposes only the public lineage projection delta", () => {
  const evidence = JSON.parse(source(evidencePath));
  const types = source(typePath);

  expect(evidence.type_generation).toMatchObject({
    transport: "operator_authorized_project_scoped_read_only",
    response_shape: "exact_object_types_string",
    response_content_retained: false,
    in_memory_byte_identical_before_write: true,
    public_lineage_field_delta_exact: true,
    private_schema_in_generated_output: false,
    v2_writer_routine_in_generated_output: false,
    v2_receipt_relation_in_generated_output: false,
  });
  for (const field of [
    "durable_recommendation_version: number | null",
    "position_version: number | null",
    "recommendation_identity: string | null",
    "recommendation_normative_digest: string | null",
    "recommendation_projection_contract: string | null",
    "recommendation_version: number | null",
  ]) {
    expect(types).toContain(field);
  }
  expect(types).not.toContain("private:");
  expect(types).not.toContain("position_version_lineage_v2_writer");
  expect(types).not.toContain("position_version_lineage_receipts");
});

test("666FA keeps the private adapter inert and declines runtime activation", () => {
  const evidence = JSON.parse(source(evidencePath));
  const adapter = source(adapterPath);

  expect(adapter).toContain('import "server-only"');
  expect(adapter).toContain("OwnerBoundPositionCommandPort");
  expect(adapter).not.toMatch(/createClient|\.rpc\(|from\(/);
  expect(evidence.runtime_binding_decision).toEqual({
    existing_private_adapter_server_only: true,
    existing_private_adapter_inert: true,
    v2_writer_binding_implemented: false,
    route_or_ui_binding_implemented: false,
    runtime_binding_authorized: false,
    blocking_reason:
      "private_writer_surface_is_excluded_from_public_generated_types_and_requires_a_separate_server_only_command_port_admission_preflight",
  });
  expect(evidence.authority_limits).toEqual({
    database_mutation: false,
    migration_application: false,
    writer_invoked: false,
    backfill_performed: false,
    runtime_wiring: false,
    route_or_ui_wiring: false,
    provider_or_broker_contact: false,
    production_deployment: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_v2_writer_generated_types_provenance_refresh_and_runtime_binding_decision",
    next_bounded_objective:
      "position_version_lineage_v2_writer_private_command_port_runtime_binding_admission_preflight",
    runtime_binding_authorized: false,
  });
});

test("666FA is secret-free, roadmap-bound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/generated.*types|types.*generated/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fa/i);
  expect(source(ledgerPath)).toMatch(/action 666fa/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
