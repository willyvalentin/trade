#!/usr/bin/env node
/**
 * Action 666IU — local-only B-03 private V2 writer capability proof.
 *
 * This is deliberately not application runtime code. It creates a fresh,
 * internal Docker PostgreSQL instance, applies only the reviewed V2 writer
 * migration to a minimal compatible schema, and destroys every local resource
 * before returning a value-free receipt. It never reads deployment settings,
 * contacts a provider, publishes a host port, or targets staging/production.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const actionId = "ACTION_666IU";
const root = resolve(import.meta.dirname, "..");
const reviewedMigrationRelativePath =
  "supabase/migrations/20260824195409_position_version_lineage_v2_writer_storage_routine_package.sql";
const replayRepairMigrationRelativePath =
  "supabase/migrations/20260901000000_fix_position_version_lineage_v2_writer_replay_qualification.sql";
const reviewedMigrationPath = resolve(root, reviewedMigrationRelativePath);
const replayRepairMigrationPath = resolve(root, replayRepairMigrationRelativePath);
const routineSignature =
  "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)";
const localPostgresImageTag = "postgres:16-alpine";
const ownerId = "00000000-0000-4000-8000-000000000001";
const eligibleRecommendationId = "00000000-0000-4000-8000-000000000101";
const rejectedRecommendationId = "00000000-0000-4000-8000-000000000102";
const createdDigest = "a".repeat(64);
const rejectedDigest = "b".repeat(64);
const entropy = randomUUID().replaceAll("-", "").slice(0, 12);
const container = `ture-b03-666iu-${entropy}`;
const network = `ture-b03-666iu-net-${entropy}`;
const containerAuthenticationMaterial = randomBytes(32).toString("hex");
const writerAuthenticationMaterial = randomBytes(32).toString("hex");

let networkCreated = false;
let containerStarted = false;
let failureLabel = "none";
let failureDetail = "none";

function fail(label) {
  failureLabel = label;
  throw new Error(`${actionId}_${label}`);
}

function recordSafeDiagnostic(diagnostic) {
  failureDetail = diagnostic
    .replaceAll(containerAuthenticationMaterial, "[redacted]")
    .replaceAll(writerAuthenticationMaterial, "[redacted]")
    .replace(/'(?:''|[^'])*'/gu, "'[redacted]'")
    .replace(/\b[0-9a-f]{24,}\b/giu, "[redacted]")
    .replace(/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/giu, "[redacted]")
    .split(/\r?\n/u)
    .filter((line) => /^(?:ERROR|DETAIL|HINT|psql):/u.test(line.trim()))
    .join(" ")
    .slice(0, 240) || "unclassified_local_postgresql_failure";
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) fail(label);
}

function runDocker(args, { input, allowFailure = false, environment } = {}) {
  const result = spawnSync("docker", args, {
    cwd: root,
    encoding: "utf8",
    env: environment ? { ...process.env, ...environment } : process.env,
    input,
    maxBuffer: 1024 * 1024,
  });

  if (result.error) {
    fail("local_docker_command_failed");
  }

  if (!allowFailure && result.status !== 0) {
    const diagnostic = `${result.stderr ?? ""}\n${result.stdout ?? ""}`;
    recordSafeDiagnostic(diagnostic);
    if (/password authentication failed/iu.test(diagnostic)) {
      fail("local_writer_authentication_failed");
    }
    if (/role .* does not exist/iu.test(diagnostic)) {
      fail("local_role_missing");
    }
    if (/permission denied/iu.test(diagnostic)) {
      fail("local_privilege_denied");
    }
    if (/could not connect|connection refused/iu.test(diagnostic)) {
      fail("local_postgresql_connection_failed");
    }
    if (/action_666er_receipt_binding_conflict/iu.test(diagnostic)) {
      fail("writer_receipt_binding_conflict");
    }
    if (/action_666er_existing_position_without_matching_receipt/iu.test(diagnostic)) {
      fail("writer_existing_position_without_receipt");
    }
    if (/action_666er_recommendation_not_eligible_for_position/iu.test(diagnostic)) {
      fail("writer_recommendation_not_eligible");
    }
    if (/action_666er_receipt_reservation_unavailable/iu.test(diagnostic)) {
      fail("writer_receipt_reservation_unavailable");
    }
    if (/action_666er_invalid_owner_bound_command/iu.test(diagnostic)) {
      fail("writer_invalid_owner_bound_command");
    }
    if (/column reference .* is ambiguous/iu.test(diagnostic)) {
      fail("local_column_reference_ambiguous");
    }
    if (/prepared statement .* does not exist/iu.test(diagnostic)) {
      fail("local_prepared_statement_missing");
    }
    if (/must be owner/iu.test(diagnostic)) {
      fail("local_owner_requirement_failed");
    }
    if (/current transaction is aborted/iu.test(diagnostic)) {
      fail("local_transaction_aborted");
    }
    if (/action_666er_owned_recommendation_not_found/iu.test(diagnostic)) {
      fail("writer_owned_recommendation_not_found");
    }
    if (/action_666er_recommendation_lineage_not_v2_complete/iu.test(diagnostic)) {
      fail("writer_lineage_not_v2_complete");
    }
    if (/already exists/iu.test(diagnostic)) {
      fail("local_substrate_conflict");
    }
    if (/syntax error/iu.test(diagnostic)) {
      fail("local_sql_syntax_error");
    }
    if (/does not exist/iu.test(diagnostic)) {
      fail("local_required_object_missing");
    }
    fail("local_docker_command_failed");
  }

  return result;
}

function sqlAsPostgres(statement, allowFailure = false) {
  return runDocker(
    [
      "exec",
      "-i",
      container,
      "psql",
      "-X",
      "-qAt",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
      "-d",
      "postgres",
    ],
    { input: statement, allowFailure },
  );
}

function sqlAsWriter(
  statement,
  allowFailure = false,
  verboseErrors = false,
) {
  return runDocker(
    [
      "exec",
      "-i",
      "--env",
      "PGPASSWORD",
      container,
      "psql",
      "-X",
      "-qAt",
      "-v",
      "ON_ERROR_STOP=1",
      ...(verboseErrors ? ["-v", "VERBOSITY=verbose"] : []),
      "-h",
      "127.0.0.1",
      "-U",
      "b03_writer",
      "-d",
      "postgres",
    ],
    {
      input: statement,
      allowFailure,
      environment: { PGPASSWORD: writerAuthenticationMaterial },
    },
  );
}

function resolveImmutableLocalPostgresImage() {
  const image = runDocker(
    ["image", "inspect", "--format", "{{.Id}}", localPostgresImageTag],
    { allowFailure: true },
  );
  if (image.status !== 0) {
    recordSafeDiagnostic(`${image.stderr ?? ""}\n${image.stdout ?? ""}`);
    fail("local_postgresql_image_unavailable");
  }

  const imageId = image.stdout.trim();
  if (!/^sha256:[0-9a-f]{64}$/iu.test(imageId)) {
    fail("local_postgresql_image_identity_invalid");
  }
  return imageId;
}

function waitForPostgres() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const connection = sqlAsPostgres("select 1;", true);
    const logs = runDocker(["logs", container], { allowFailure: true });
    const readyMarkers = `${logs.stdout ?? ""}\n${logs.stderr ?? ""}`.match(
      /database system is ready to accept connections/gu,
    );
    if (connection.status === 0 && readyMarkers?.length >= 2) return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 125);
  }

  fail("local_postgresql_final_readiness_timeout");
}

function writerInvocation(recommendationId, digest) {
  return `
    prepare action_666iu_writer_call(uuid, uuid, text) as
      select disposition, position_id, position_version, initial_history_identity
      from private.write_owner_bound_recommendation_position_v2($1, $2, $3);
    execute action_666iu_writer_call(
      '${ownerId}'::uuid,
      '${recommendationId}'::uuid,
      '${digest}'::text
    );
    deallocate action_666iu_writer_call;
  `;
}

function parseWriterResult(output, expectedDisposition) {
  const rows = output.trim().split(/\r?\n/u).filter(Boolean);
  if (rows.length !== 1) fail("writer_result_row_shape");

  const [disposition, positionId, positionVersion, initialHistoryIdentity] =
    rows[0].split("|");

  if (
    disposition !== expectedDisposition ||
    !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/iu.test(positionId) ||
    positionVersion !== "1" ||
    initialHistoryIdentity !== `${positionId}:${ownerId}:1`
  ) {
    fail("writer_result_contract");
  }

  return { positionId, initialHistoryIdentity };
}

function assertDenied(result, label) {
  if (result.status === 0) fail(label);
}

function cleanup() {
  let complete = true;

  if (containerStarted) {
    const result = runDocker(["rm", "-f", container], { allowFailure: true });
    complete = complete && result.status === 0;
  }

  if (networkCreated) {
    const result = runDocker(["network", "rm", network], { allowFailure: true });
    complete = complete && result.status === 0;
  }

  return complete;
}

function bootstrapSql() {
  return `
    create schema extensions;
    create extension pgcrypto with schema extensions;

    create role anon nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
    create role authenticated nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
    create role service_role nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
    create role b03_sandbox_definer nologin
      nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
    create role b03_writer login password '${writerAuthenticationMaterial}'
      nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls connection limit 1;

    revoke all on database postgres from public;
    grant connect on database postgres to b03_writer;
    revoke all on schema public from public;
    revoke all on schema public from b03_writer;

    create table public.recommendations (
      id uuid primary key,
      owner_user_id uuid not null,
      recommendation_version bigint,
      recommendation_identity text,
      recommendation_normative_digest text,
      recommendation_projection_contract text,
      status text,
      ticker text,
      company_name text,
      entry_low numeric,
      stop_loss numeric,
      target_1 numeric,
      target_2 numeric,
      unique (id, owner_user_id)
    );

    create table public.positions (
      id uuid primary key,
      owner_user_id uuid not null,
      recommendation_id uuid not null,
      ticker text,
      company_name text,
      entry_price numeric,
      position_size numeric,
      current_stop numeric,
      target_1 numeric,
      target_2 numeric,
      status text,
      execution_metadata jsonb,
      position_version bigint not null,
      durable_recommendation_version bigint,
      recommendation_identity text,
      recommendation_normative_digest text,
      recommendation_projection_contract text,
      unique (id, owner_user_id)
    );

    create table public.position_version_history (
      position_id uuid not null,
      owner_user_id uuid not null,
      position_version bigint not null,
      recommendation_id uuid not null,
      durable_recommendation_version bigint not null,
      recommendation_identity text not null,
      recommendation_normative_digest text not null,
      position_state_frame jsonb not null,
      position_state_digest text not null,
      primary key (position_id, position_version)
    );
  `;
}

function seedAndGrantSql() {
  return `
    grant create, usage on schema public to b03_sandbox_definer;
    alter schema private owner to b03_sandbox_definer;
    alter table public.recommendations owner to b03_sandbox_definer;
    alter table public.positions owner to b03_sandbox_definer;
    alter table public.position_version_history owner to b03_sandbox_definer;
    alter table private.owner_bound_position_command_idempotency_v2
      owner to b03_sandbox_definer;
    alter function ${routineSignature} owner to b03_sandbox_definer;
    revoke create on schema public from b03_sandbox_definer;
    grant usage on schema extensions to b03_sandbox_definer;

    insert into public.recommendations (
      id,
      owner_user_id,
      recommendation_version,
      recommendation_identity,
      recommendation_normative_digest,
      recommendation_projection_contract,
      status,
      ticker,
      company_name,
      entry_low,
      stop_loss,
      target_1,
      target_2
    ) values
      (
        '${eligibleRecommendationId}'::uuid,
        '${ownerId}'::uuid,
        1,
        'action-666iu-eligible-fixture',
        '${"c".repeat(64)}',
        'legacy_recommendation_normative_projection_v2',
        'new',
        'B03',
        'Action 666IU sandbox fixture',
        100,
        90,
        110,
        120
      ),
      (
        '${rejectedRecommendationId}'::uuid,
        '${ownerId}'::uuid,
        1,
        'action-666iu-rejected-fixture',
        '${"d".repeat(64)}',
        'legacy_recommendation_normative_projection_v2',
        'rejected',
        'B03X',
        'Action 666IU rejection fixture',
        100,
        90,
        110,
        120
      );

    revoke all on schema private from service_role;
    revoke all on function ${routineSignature} from service_role;
    revoke all on schema private from b03_writer;
    grant usage on schema public to b03_writer;
    revoke all on all tables in schema public from b03_writer;
    revoke all on all tables in schema private from b03_writer;
    revoke all on function ${routineSignature} from b03_writer;
    grant usage on schema private to b03_writer;
    grant execute on function ${routineSignature} to b03_writer;
  `;
}

function assertLeastPrivilege() {
  const proof = sqlAsWriter(`
    select case when
      has_schema_privilege(current_user, 'private', 'USAGE')
      and has_function_privilege(
        current_user,
        '${routineSignature}'::regprocedure,
        'EXECUTE'
      )
      and not has_function_privilege(
        'service_role',
        '${routineSignature}'::regprocedure,
        'EXECUTE'
      )
      and not has_table_privilege(current_user, 'public.recommendations', 'SELECT')
      and not has_table_privilege(current_user, 'public.recommendations', 'INSERT')
      and not has_table_privilege(current_user, 'public.recommendations', 'UPDATE')
      and not has_table_privilege(current_user, 'public.recommendations', 'DELETE')
      and not has_table_privilege(current_user, 'public.positions', 'SELECT')
      and not has_table_privilege(current_user, 'public.positions', 'INSERT')
      and not has_table_privilege(current_user, 'public.positions', 'UPDATE')
      and not has_table_privilege(current_user, 'public.positions', 'DELETE')
      and not has_table_privilege(
        current_user,
        'private.owner_bound_position_command_idempotency_v2',
        'SELECT'
      )
    then 'least_privilege_proven'
    else 'least_privilege_not_proven'
    end;
  `).stdout.trim();

  assertEqual(proof, "least_privilege_proven", "least_privilege_contract");
  assertDenied(
    sqlAsWriter("select * from public.recommendations;", true),
    "direct_recommendation_access_not_denied",
  );
  assertDenied(
    sqlAsWriter("set role b03_sandbox_definer;", true),
    "definer_assumption_not_denied",
  );
}

function assertRejectedInvocationRolledBack() {
  const expectedRejection = sqlAsWriter(
    writerInvocation(rejectedRecommendationId, rejectedDigest),
    true,
    true,
  );
  const rejectionDiagnostic =
    `${expectedRejection.stderr ?? ""}\n${expectedRejection.stdout ?? ""}`;
  if (
    expectedRejection.status === 0 ||
    !/ERROR:\s+55000:\s+action_666er_recommendation_not_eligible_for_position/iu.test(
      rejectionDiagnostic,
    )
  ) {
    recordSafeDiagnostic(
      rejectionDiagnostic,
    );
    fail("rejected_invocation_not_expected_ineligibility");
  }

  const proof = sqlAsPostgres(`
    select case when
      not exists (
        select 1
        from private.owner_bound_position_command_idempotency_v2
        where opaque_recommendation_reference = '${rejectedRecommendationId}'::uuid
      )
      and not exists (
        select 1
        from public.positions
        where recommendation_id = '${rejectedRecommendationId}'::uuid
      )
      and not exists (
        select 1
        from public.position_version_history
        where recommendation_id = '${rejectedRecommendationId}'::uuid
      )
      and exists (
        select 1
        from public.recommendations
        where id = '${rejectedRecommendationId}'::uuid
          and status = 'rejected'
      )
    then 'rejected_invocation_rolled_back'
    else 'rejected_invocation_persisted'
    end;
  `).stdout.trim();

  assertEqual(proof, "rejected_invocation_rolled_back", "rollback_contract");
}

function assertNoAuthenticationMaterialIn(output) {
  if (
    output.includes(containerAuthenticationMaterial) ||
    output.includes(writerAuthenticationMaterial)
  ) {
    fail("authentication_material_disclosed");
  }
}

function main() {
  if (process.env.B03_LOCAL_SANDBOX !== "1") {
    process.stderr.write(
      `${actionId} requires B03_LOCAL_SANDBOX=1 and performs no action otherwise.\n`,
    );
    return 2;
  }

  let receipt;
  let failure = false;
  let stage = "not_started";

  try {
    stage = "resolve_immutable_local_postgresql_image";
    const localPostgresImageId = resolveImmutableLocalPostgresImage();
    stage = "create_internal_network";
    runDocker(["network", "create", "--internal", network]);
    networkCreated = true;

    stage = "start_local_postgresql";
    runDocker([
      "run",
      "-d",
      "--rm",
      "--pull=never",
      "--name",
      container,
      "--network",
      network,
      "--env",
      "POSTGRES_PASSWORD",
      localPostgresImageId,
    ], {
      environment: { POSTGRES_PASSWORD: containerAuthenticationMaterial },
    });
    containerStarted = true;

    stage = "wait_for_local_postgresql";
    waitForPostgres();
    stage = "verify_private_network";
    const publishedHostPorts = runDocker([
      "inspect",
      "--format",
      "{{json .NetworkSettings.Ports}}",
      container,
    ]).stdout.trim();
    let portMappings;
    try {
      portMappings = JSON.parse(publishedHostPorts);
    } catch {
      fail("host_port_catalog_unreadable");
    }
    if (
      portMappings !== null &&
      Object.values(portMappings).some((mapping) => mapping !== null)
    ) {
      fail("host_port_published");
    }
    stage = "verify_internal_network_flag";
    assertEqual(
      runDocker(["network", "inspect", "--format", "{{.Internal}}", network])
        .stdout.trim(),
      "true",
      "network_not_internal",
    );

    stage = "bootstrap_local_substrate";
    sqlAsPostgres(bootstrapSql());
    stage = "apply_reviewed_v2_migration";
    sqlAsPostgres(readFileSync(reviewedMigrationPath, "utf8"));
    stage = "apply_forward_replay_repair";
    sqlAsPostgres(readFileSync(replayRepairMigrationPath, "utf8"));
    stage = "seed_and_constrain_local_roles";
    sqlAsPostgres(seedAndGrantSql());

    stage = "verify_least_privilege";
    assertLeastPrivilege();

    stage = "invoke_created_writer_call";
    const created = parseWriterResult(
      sqlAsWriter(writerInvocation(eligibleRecommendationId, createdDigest)).stdout,
      "created",
    );
    stage = "invoke_replayed_writer_call";
    const replayed = parseWriterResult(
      sqlAsWriter(writerInvocation(eligibleRecommendationId, createdDigest)).stdout,
      "replayed",
    );
    assertEqual(
      replayed.positionId,
      created.positionId,
      "replay_position_identity_changed",
    );
    assertEqual(
      replayed.initialHistoryIdentity,
      created.initialHistoryIdentity,
      "replay_history_identity_changed",
    );
    stage = "verify_rejected_writer_rollback";
    assertRejectedInvocationRolledBack();

    stage = "assemble_value_free_receipt";
    receipt = {
      action_id: actionId,
      scope: "local_ephemeral_postgresql_sandbox_only",
      reviewed_migration: {
        path: reviewedMigrationRelativePath,
        sha256: createHash("sha256")
          .update(readFileSync(reviewedMigrationPath, "utf8"), "utf8")
          .digest("hex"),
      },
      forward_replay_repair: {
        path: replayRepairMigrationRelativePath,
        sha256: createHash("sha256")
          .update(readFileSync(replayRepairMigrationPath, "utf8"), "utf8")
          .digest("hex"),
      },
      internal_network_without_host_port: true,
      local_image_selected_by_immutable_id: true,
      process_generated_authentication_material_not_logged_or_persisted_in_repository_or_receipt:
        true,
      security_definer_identity:
        "b03_sandbox_definer_nologin_owns_only_local_substrate",
      dedicated_writer_identity: "b03_writer_login_no_table_privileges",
      private_loopback_writer_routine: routineSignature,
      created_then_replayed: true,
      replay_reused_committed_identifiers: true,
      direct_table_access_denied: true,
      rejected_invocation_rejected_with_expected_sqlstate_and_message: true,
      rejected_invocation_rolled_back: true,
      staging_or_production_targeted: false,
      provider_or_broker_contacted: false,
    };
    assertNoAuthenticationMaterialIn(JSON.stringify(receipt));
  } catch {
    failure = true;
  }

  const cleanupSucceeded = cleanup();
  if (failure || !cleanupSucceeded || !receipt) {
    process.stderr.write(
      `${actionId} local sandbox did not produce a complete value-free receipt at ${stage}:${failureLabel}.\n`,
    );
    process.stderr.write(`${actionId} safe diagnostic: ${failureDetail}\n`);
    return 1;
  }

  console.log(
    JSON.stringify({
      ...receipt,
      rollback_cleanup: "container_and_internal_network_destroyed",
    }),
  );
  return 0;
}

process.exitCode = main();
