import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666iu-b03-local-sandbox-v2-writer-capability-proof.md";
const evidencePath =
  "docs/evidence/action-666iu-b03-local-sandbox-v2-writer-capability-proof.json";
const harnessPath = "scripts/action-666iu-b03-local-sandbox-v2-writer.mjs";
const reviewedMigrationPath =
  "supabase/migrations/20260824195409_position_version_lineage_v2_writer_storage_routine_package.sql";
const replayRepairMigrationPath =
  "supabase/migrations/20260901000000_fix_position_version_lineage_v2_writer_replay_qualification.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const plannedApplicationTransportPath =
  "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts";
const thisTest =
  "tests/e2e/action-666iu-b03-local-sandbox-v2-writer-capability-proof.spec.ts";
const evidenceSha256 = "ba0e9fdcc2dedf7582e18abdb5fa47b902aac0dc8e85e49b50b1881c14a5acf4";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666IU records one local-only replay repair and sandbox behavior proof", () => {
  const evidenceRaw = source(evidencePath);
  const evidence = JSON.parse(evidenceRaw);
  const action = source(actionPath);
  const harness = source(harnessPath);
  const reviewedMigration = source(reviewedMigrationPath);
  const replayRepairMigration = source(replayRepairMigrationPath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(sha256(evidenceRaw)).toBe(evidenceSha256);
  expect(evidence.contract_version).toBe(
    "trade.action666iu.b03-local-sandbox-private-v2-writer-capability-proof.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666IU");
  expect(evidence.scope).toEqual({
    local_ephemeral_postgresql_sandbox_only: true,
    remote_staging_targeted: false,
    production_targeted: false,
    provider_or_broker_contacted: false,
    application_runtime_bound: false,
    route_or_ui_bound: false,
    deployment_or_netlify_changed: false,
  });
  expect(evidence.reviewed_migration).toEqual({
    path: reviewedMigrationPath,
    sha256: sha256(reviewedMigration),
    routine_signature:
      "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
  });
  expect(evidence.forward_replay_repair).toEqual({
    path: replayRepairMigrationPath,
    sha256: sha256(replayRepairMigration),
    original_replay_output_parameter_collision_detected_in_local_sandbox: true,
    historical_migration_rewritten: false,
  });
  expect(evidence.execution_receipt).toEqual({
    status: "completed_value_free_local_sandbox_run",
    created_then_replayed: true,
    replay_reused_committed_identifiers: true,
    direct_table_access_denied: true,
    rejected_invocation_rejected_with_expected_sqlstate_and_message: true,
    rejected_invocation_rolled_back: true,
    container_and_network_destroyed: true,
  });

  expect(replayRepairMigration).toContain(
    "create or replace function private.write_owner_bound_recommendation_position_v2",
  );
  expect(replayRepairMigration).toContain("security definer");
  expect(replayRepairMigration).toContain("set search_path = ''");
  expect(replayRepairMigration).toContain(
    "from public.positions as position_record",
  );
  expect(replayRepairMigration).toContain(
    "position_record.position_version = 1",
  );
  expect(replayRepairMigration).toContain(
    "from public.position_version_history as history_record",
  );
  expect(replayRepairMigration).toContain(
    "history_record.position_id =",
  );
  expect(replayRepairMigration).toContain(
    "history_record.position_version = 1",
  );
  expect(replayRepairMigration).not.toMatch(/drop\s+function/iu);
  expect(reviewedMigration).toContain(
    "from public.position_version_history\n        where position_id =",
  );

  expect(harness).toContain('process.env.B03_LOCAL_SANDBOX !== "1"');
  expect(harness).toContain('"postgres:16-alpine"');
  expect(harness).toContain('"--pull=never"');
  expect(harness).toContain(
    '"image", "inspect", "--format", "{{.Id}}", localPostgresImageTag',
  );
  expect(harness).toContain("local_image_selected_by_immutable_id: true");
  expect(harness).toContain("database system is ready to accept connections");
  expect(harness).toContain("local_postgresql_final_readiness_timeout");
  expect(harness).toMatch(/"--env",\s+"POSTGRES_PASSWORD"/u);
  expect(harness).toMatch(/"--env",\s+"PGPASSWORD"/u);
  expect(harness).not.toContain(
    "`POSTGRES_PASSWORD=${containerAuthenticationMaterial}`",
  );
  expect(harness).not.toContain(
    "`PGPASSWORD=${writerAuthenticationMaterial}`",
  );
  expect(harness).toContain('"network", "create", "--internal"');
  expect(harness).toContain("b03_sandbox_definer nologin");
  expect(harness).toContain("b03_writer login");
  expect(harness).toContain("grant execute on function ${routineSignature} to b03_writer");
  expect(harness).toContain("revoke all on function ${routineSignature} from service_role");
  expect(harness).toContain("replay_reused_committed_identifiers: true");
  expect(harness).toContain("VERBOSITY=verbose");
  expect(harness).toContain(
    "action_666er_recommendation_not_eligible_for_position",
  );
  expect(harness).toContain("rejected_invocation_rolled_back: true");
  expect(harness).toContain("container_and_internal_network_destroyed");
  expect(harness).not.toMatch(
    /(?:supabase\s+(?:db|migration|link|push)|netlify|fetch\s*\(|https?:\/\/|postgres(?:ql)?:\/\/)/iu,
  );
  expect(harness).not.toMatch(/["'](?:-p|--publish)["']/u);
  expect(harness).not.toContain("process.env.SUPABASE_");
  expect(harness).not.toContain("process.env.NEXT_PUBLIC_");

  expect(existsSync(resolve(root, plannedApplicationTransportPath))).toBe(false);
  expect(`${action}\n${evidenceRaw}`).toMatch(/local.*sandbox/i);
  expect(`${action}\n${evidenceRaw}`).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/Action 666IU/i);
  expect(source(ledgerPath)).toMatch(/ACTION 666IU/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});
