import { expect, test } from "@playwright/test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const migrationName = "20260720001000_create_git_runner_authority_consumption_rpcs.sql";
const storageMigrationName = "20260720000000_create_git_runner_authority_consumption_storage.sql";
const migrationPath = join(repoRoot, "supabase", "migrations", migrationName);
const migrationSql = readFileSync(migrationPath, "utf8");
const normalizedSql = migrationSql.replace(/\s+/g, " ").toLowerCase();
const executableSql = migrationSql
  .replace(/--.*$/gmu, "")
  .replace(/'([^']|'')*'/gu, "''")
  .replace(/\s+/g, " ")
  .toLowerCase();

const functionNames = [
  "register_git_runner_authority_package",
  "claim_git_runner_authority_consumer",
  "consume_git_runner_authority_stage",
  "record_git_runner_authority_stage_completion",
  "terminalize_git_runner_authority_failure",
  "terminalize_git_runner_authority_ambiguous_failure",
  "terminalize_git_runner_authority_expiry",
  "revoke_git_runner_authority_package",
  "finalize_git_runner_authority_aggregate",
  "read_git_runner_authority_consumption_state",
] as const;

const mutationFunctionNames = functionNames.filter(
  (name) => name !== "read_git_runner_authority_consumption_state",
);

const exactStageIdentities = [
  "git_repository_root_v1",
  "git_object_format_v1",
  "git_head_before_v1",
  "git_branch_state_v1",
  "git_porcelain_status_v1",
  "git_head_after_v1",
] as const;

function expectSqlContains(fragment: string) {
  expect(normalizedSql, `missing SQL fragment: ${fragment}`).toContain(
    fragment.toLowerCase().replace(/\s+/g, " "),
  );
}

function functionSql(functionName: string) {
  const start = migrationSql.indexOf(`create function public.${functionName}(`);
  expect(start, `missing function ${functionName}`).toBeGreaterThanOrEqual(0);
  const rest = migrationSql.slice(start);
  const nextFunction = rest.indexOf("\ncreate function public.", 1);
  const revokeBlock = rest.indexOf("\nrevoke execute", 1);
  const endCandidates = [nextFunction, revokeBlock].filter((index) => index > 0);
  const end = endCandidates.length > 0 ? Math.min(...endCandidates) : rest.length;
  return rest.slice(0, end);
}

function strippedFunctionSql(functionName: string) {
  return functionSql(functionName)
    .replace(/--.*$/gmu, "")
    .replace(/'([^']|'')*'/gu, "''")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function expectFunctionContains(functionName: string, fragment: string) {
  expect(
    functionSql(functionName).replace(/\s+/g, " ").toLowerCase(),
    `missing ${fragment} in ${functionName}`,
  ).toContain(fragment.toLowerCase().replace(/\s+/g, " "));
}

function normalizedFunctionSql(functionName: string) {
  return functionSql(functionName).replace(/\s+/g, " ").toLowerCase();
}

function expectFragmentOrder(functionName: string, earlier: string, later: string) {
  const sql = normalizedFunctionSql(functionName);
  const earlierIndex = sql.indexOf(earlier.toLowerCase().replace(/\s+/g, " "));
  const laterIndex = sql.indexOf(later.toLowerCase().replace(/\s+/g, " "));

  expect(earlierIndex, `missing earlier fragment in ${functionName}: ${earlier}`).toBeGreaterThanOrEqual(0);
  expect(laterIndex, `missing later fragment in ${functionName}: ${later}`).toBeGreaterThanOrEqual(0);
  expect(earlierIndex, `${earlier} must appear before ${later} in ${functionName}`).toBeLessThan(laterIndex);
}

function declaredArgumentTypes(functionName: string) {
  const declaration = new RegExp(
    `^create function public\\.${functionName}\\(([\\s\\S]*?)\\) returns table`,
    "mu",
  ).exec(migrationSql);
  expect(declaration, `missing declaration for ${functionName}`).not.toBeNull();
  return declaration![1]
    .split(/,\n/u)
    .map((parameter) => parameter.trim())
    .filter(Boolean)
    .map((parameter) => parameter.split(/\s+/u).slice(1).join(" "));
}

function signatureArgumentTypes(prefix: "revoke execute on function" | "comment on function", functionName: string) {
  const signature = new RegExp(`${prefix} public\\.${functionName}\\(([^)]*)\\)`, "u").exec(
    migrationSql,
  );
  expect(signature, `missing ${prefix} signature for ${functionName}`).not.toBeNull();
  return signature![1].split(/,\s*/u).filter(Boolean);
}

test.describe("Action 626 Git runner authority consumption RPC migration", () => {
  test("migration file identity is exact and timestamp has no collision", () => {
    expect(existsSync(migrationPath)).toBe(true);
    expect(existsSync(join(repoRoot, "supabase", "migrations", storageMigrationName))).toBe(true);

    const matchingTimestamp = readdirSync(join(repoRoot, "supabase", "migrations"))
      .filter((name) => name.startsWith("20260720001000"));
    expect(matchingTimestamp).toEqual([migrationName]);
  });

  test("migration creates exactly the approved RPC function inventory", () => {
    const functionMatches = Array.from(
      migrationSql.matchAll(/^create function public\.([a-z0-9_]+)\(/gmu),
      (match) => match[1],
    );

    expect(functionMatches.sort()).toEqual([...functionNames].sort());
    expect(new Set(functionMatches).size).toBe(functionNames.length);
    expect(normalizedSql).not.toContain("create or replace function");
  });

  for (const functionName of functionNames) {
    test(`${functionName} is security-definer with fixed search path and no dynamic SQL`, () => {
      const sql = strippedFunctionSql(functionName);

      expect(sql).toContain("language plpgsql security definer set search_path = pg_catalog, public");
      expect(sql).not.toMatch(/\bexecute\s+\w/u);
      expect(sql).not.toContain("format(");
      expect(sql).not.toContain("raise ");
      expect(sql).not.toContain("sqlerrm");
      expect(sql).not.toContain("sqlstate");
      expect(sql).not.toContain(" jsonb");
      expect(sql).not.toContain(" json ");
      expect(sql).not.toContain("http");
      expect(sql).not.toContain("net.");
      expect(sql).not.toContain("cron");
    });
  }

  test("all public, anon, and authenticated execute privileges are explicitly revoked", () => {
    for (const functionName of functionNames) {
      expectSqlContains(`revoke execute on function public.${functionName}`);
    }
    expect(executableSql).not.toContain("grant execute");
    expect(executableSql).not.toContain("grant all");
  });

  test("revoke and comment signatures exactly match function declarations", () => {
    for (const functionName of functionNames) {
      const declaredTypes = declaredArgumentTypes(functionName);

      expect(signatureArgumentTypes("revoke execute on function", functionName)).toEqual(declaredTypes);
      expect(signatureArgumentTypes("comment on function", functionName)).toEqual(declaredTypes);
    }
  });

  test("migration does not create policies, triggers, tables, or runtime grants", () => {
    expect(executableSql).not.toContain("create table");
    expect(executableSql).not.toContain("alter table");
    expect(executableSql).not.toContain("create policy");
    expect(executableSql).not.toContain("enable row level security");
    expect(executableSql).not.toContain("create trigger");
    expect(executableSql).not.toContain("notify ");
  });

  test("register function validates exact source-controlled identities and fixed expiry", () => {
    const name = "register_git_runner_authority_package";

    expectFunctionContains(name, "p_schema_identity <> 'ture.execution.dormant-git-runner-authority-consumption-storage.schema-family.v1'");
    expectFunctionContains(name, "p_package_contract_identity <> 'ture.execution.pure-dormant-git-runner-authority-package-contract.fixture.v1'");
    expectFunctionContains(name, "p_capability_set_identity <> 'ture.execution.read-only-git-repository-observation-capability-set.v1'");
    expectFunctionContains(name, "p_expiry_policy_identity <> 'ture.execution.dormant-git-runner-authority-expiry-policy.v1'");
    expectFunctionContains(name, "p_freshness_policy_identity <> 'ture.execution.dormant-git-runner-authority-freshness-policy.v1'");
    expectFunctionContains(name, "p_sequence_identity <> 'ture.execution.read-only-git-repository-observation.sequence.root-object-format-head-branch-status-head.v1'");
    expectFunctionContains(name, "p_executable_identity <> '/usr/bin/git'");
    expectFunctionContains(name, "p_platform <> 'macos'");
    expectFunctionContains(name, "p_expires_at <> p_issued_at + interval '30 seconds'");
  });

  test("register function atomically creates one package, six stages, and first audit event", () => {
    const name = "register_git_runner_authority_package";

    expectFunctionContains(name, "insert into public.git_runner_authority_consumption_records");
    expectFunctionContains(name, "insert into public.git_runner_authority_consumption_stages");
    expectFunctionContains(name, "insert into public.git_runner_authority_consumption_audit_events");
    expectFunctionContains(name, "0, 0, 6, 1");
    expectFunctionContains(name, "next_audit_sequence");
    expectFunctionContains(name, "'register_package', 'transition_permitted', 'package_registered'");
    for (const stageIdentity of exactStageIdentities) {
      expectFunctionContains(name, `'${stageIdentity}'`);
    }
  });

  test("register function rejects duplicate identities and reused fingerprints without upsert", () => {
    const name = "register_git_runner_authority_package";

    expectFunctionContains(name, "duplicate_registration_rejected");
    expectFunctionContains(name, "package_identity_conflict_rejected");
    expectFunctionContains(name, "package_fingerprint_reuse_rejected");
    expect(strippedFunctionSql(name)).not.toContain("on conflict do update");
    expect(strippedFunctionSql(name)).not.toContain("on conflict do nothing");
  });

  for (const functionName of mutationFunctionNames) {
    test(`${functionName} returns closed non-authoritative transition posture`, () => {
      const sql = functionSql(functionName);

      expect(sql).toContain("storage_committed boolean");
      expect(sql).toContain("storage_ambiguous boolean");
      expect(sql).toContain("runtime_activated boolean");
      expect(sql).toContain("authority text");
      expect(sql).toContain("toctou_eliminated boolean");
      expect(sql).toContain("false, 'none', false");
      expect(sql).toContain("'transition_rejected'");
      expect(sql).not.toContain("'runtime_activated', true");
    });
  }

  test("claim function uses row lock and compare-and-swap before claiming a consumer", () => {
    const name = "claim_git_runner_authority_consumer";

    expectFunctionContains(name, "for update");
    expectFunctionContains(name, "r.transition_version <> p_expected_transition_version");
    expectFunctionContains(name, "r.state_fingerprint <> p_current_state_fingerprint");
    expectFunctionContains(name, "r.state <> 'issued'");
    expectFunctionContains(name, "r.active_consumer_id is not null");
    expectFunctionContains(name, "set state = 'active'");
    expectFunctionContains(name, "active_consumer_fingerprint = p_consumer_fingerprint");
    expectFunctionContains(name, "'claim_consumer', 'transition_permitted', 'consumer_claimed'");
  });

  test("consume-stage function enforces exact six-stage order and prior completion", () => {
    const name = "consume_git_runner_authority_stage";

    for (const [index, stageIdentity] of exactStageIdentities.entries()) {
      expectFunctionContains(name, `(p_stage_index = ${index} and p_stage_identity = '${stageIdentity}')`);
    }
    expectFunctionContains(name, "r.current_stage_index <> p_stage_index");
    expectFunctionContains(name, "stage_order_rejected");
    expectFunctionContains(name, "p_stage_index > 0");
    expectFunctionContains(name, "prior_stage.completion_recorded is distinct from true");
    expectFunctionContains(name, "stage_already_consumed");
    expectFunctionContains(name, "'consume_stage', 'transition_permitted', 'stage_authority_consumed'");
  });

  test("stage-completion function permits only closed accepted and terminal outcomes", () => {
    const name = "record_git_runner_authority_stage_completion";

    expectFunctionContains(name, "p_stage_outcome = 'accepted'");
    expectFunctionContains(name, "p_stage_outcome = 'accepted_detached_observation' and p_stage_index = 3");
    expectFunctionContains(name, "p_stage_outcome in ('rejected', 'process_failed')");
    expectFunctionContains(name, "p_stage_outcome = 'ambiguous_process_state'");
    expectFunctionContains(name, "v_terminal := p_stage_outcome in ('rejected', 'process_failed', 'ambiguous_process_state')");
    expectFunctionContains(name, "when p_stage_outcome = 'ambiguous_process_state' then 'ambiguous_failed_terminal'");
    expectFunctionContains(name, "when p_stage_outcome in ('rejected', 'process_failed') then 'stage_failed_terminal'");
    expectFunctionContains(name, "v_event_reason := coalesce(v_terminal_reason, 'stage_completion_recorded')");
  });

  test("stage-completion function rejects all outcomes at or after package expiry before mutation", () => {
    const name = "record_git_runner_authority_stage_completion";

    expectFunctionContains(name, "if p_completed_at >= r.expires_at then");
    expectFunctionContains(name, "'transition_rejected', 'package_expired'");
    expectFragmentOrder(name, "if p_completed_at >= r.expires_at then", "select * into s");
    expectFragmentOrder(name, "if p_completed_at >= r.expires_at then", "update public.git_runner_authority_consumption_stages");
    expectFragmentOrder(name, "if p_completed_at >= r.expires_at then", "update public.git_runner_authority_consumption_records");
    expectFragmentOrder(name, "if p_completed_at >= r.expires_at then", "insert into public.git_runner_authority_consumption_audit_events");
    for (const outcome of [
      "p_stage_outcome = 'accepted'",
      "p_stage_outcome = 'accepted_detached_observation'",
      "p_stage_outcome in ('rejected', 'process_failed')",
      "p_stage_outcome = 'ambiguous_process_state'",
    ]) {
      expectFunctionContains(name, outcome);
    }
  });

  test("terminalization functions are closed to failure, ambiguity, expiry, and revoke outcomes", () => {
    expectFunctionContains("terminalize_git_runner_authority_failure", "set state = 'failed_consumed'");
    expectFunctionContains("terminalize_git_runner_authority_failure", "'terminalize_failure', 'transition_permitted', 'stage_failed_terminal'");
    expectFunctionContains("terminalize_git_runner_authority_ambiguous_failure", "set state = 'ambiguous_failed_consumed'");
    expectFunctionContains("terminalize_git_runner_authority_ambiguous_failure", "'terminalize_ambiguous_failure', 'transition_permitted', 'ambiguous_failed_terminal'");
    expectFunctionContains("terminalize_git_runner_authority_expiry", "set state = 'expired'");
    expectFunctionContains("terminalize_git_runner_authority_expiry", "p_observed_at < r.expires_at");
    expectFunctionContains("revoke_git_runner_authority_package", "set state = 'revoked'");
    expectFunctionContains("revoke_git_runner_authority_package", "'revoke_package', 'transition_permitted', 'package_revoked_terminal'");
  });

  test("failure terminalization rejects at or after package expiry before mutation and audit", () => {
    const name = "terminalize_git_runner_authority_failure";

    expectFunctionContains(name, "if p_observed_at >= r.expires_at then");
    expectFunctionContains(name, "'transition_rejected', 'package_expired'");
    expectFunctionContains(name, "r.consumed_stage_count < 1");
    expectFragmentOrder(name, "if p_observed_at >= r.expires_at then", "r.active_consumer_fingerprint <> p_consumer_fingerprint");
    expectFragmentOrder(name, "if p_observed_at >= r.expires_at then", "update public.git_runner_authority_consumption_records");
    expectFragmentOrder(name, "if p_observed_at >= r.expires_at then", "insert into public.git_runner_authority_consumption_audit_events");
  });

  test("ambiguous terminalization rejects at or after package expiry before stage lookup and audit", () => {
    const name = "terminalize_git_runner_authority_ambiguous_failure";

    expectFunctionContains(name, "if p_observed_at >= r.expires_at then");
    expectFunctionContains(name, "'transition_rejected', 'package_expired'");
    expectFunctionContains(name, "p_process_request_fingerprint !~ '^[0-9a-f]{64}$'");
    expectFunctionContains(name, "not s.consumed or s.completion_recorded");
    expectFragmentOrder(name, "if p_observed_at >= r.expires_at then", "select * into s");
    expectFragmentOrder(name, "if p_observed_at >= r.expires_at then", "update public.git_runner_authority_consumption_records");
    expectFragmentOrder(name, "if p_observed_at >= r.expires_at then", "insert into public.git_runner_authority_consumption_audit_events");
  });

  test("revocation rejects at or after package expiry before revoked state and audit", () => {
    const name = "revoke_git_runner_authority_package";

    expectFunctionContains(name, "if p_observed_at >= r.expires_at then");
    expectFunctionContains(name, "'transition_rejected', 'package_expired'");
    expectFragmentOrder(name, "if p_observed_at >= r.expires_at then", "set state = 'revoked'");
    expectFragmentOrder(name, "if p_observed_at >= r.expires_at then", "insert into public.git_runner_authority_consumption_audit_events");
    expectFunctionContains(name, "'revoke_package', 'transition_permitted', 'package_revoked_terminal'");
  });

  test("unaffected mutation RPCs retain their approved expiry posture", () => {
    expectFunctionContains("register_git_runner_authority_package", "p_observed_at >= p_expires_at");
    expectFunctionContains("claim_git_runner_authority_consumer", "p_observed_at >= r.expires_at");
    expectFunctionContains("consume_git_runner_authority_stage", "p_observed_at >= r.expires_at");
    expectFunctionContains("finalize_git_runner_authority_aggregate", "p_observed_at >= r.expires_at");
    expectFunctionContains("terminalize_git_runner_authority_expiry", "p_observed_at < r.expires_at");
    expect(normalizedFunctionSql("terminalize_git_runner_authority_expiry")).not.toContain("p_observed_at >= r.expires_at");
  });

  test("aggregate finalization requires all six accepted stages under row locks", () => {
    const name = "finalize_git_runner_authority_aggregate";

    expectFunctionContains(name, "order by gs.stage_index");
    expectFunctionContains(name, "for update");
    expectFunctionContains(name, "and gs.consumed = true");
    expectFunctionContains(name, "and gs.completion_recorded = true");
    expectFunctionContains(name, "and gs.stage_reason = 'stage_completion_recorded'");
    expectFunctionContains(name, "or (gs.stage_index = 3 and gs.stage_outcome = 'accepted_detached_observation')");
    expectFunctionContains(name, "v_stage_count <> 6");
    expectFunctionContains(name, "set state = 'consumed'");
    expectFunctionContains(name, "'finalize_aggregate', 'transition_permitted', 'sequence_consumed'");
  });

  test("read function exposes bounded state and stage fields only", () => {
    const sql = functionSql("read_git_runner_authority_consumption_state");

    expect(sql).toContain("returns table");
    expect(sql).toContain("stage_record_fingerprint text");
    expect(sql).toContain("runtime_activated boolean");
    expect(sql).toContain("authority text");
    expect(sql).toContain("toctou_eliminated boolean");
    expect(sql).not.toContain("audit_events");
    expect(sql).not.toContain("active_consumer_id");
    expect(sql).not.toContain("created_at");
    expect(sql).not.toContain("updated_at");
  });

  test("read function returns one deterministic not-found row instead of a bare zero-row query", () => {
    const name = "read_git_runner_authority_consumption_state";

    expectFunctionContains(name, "select * into r");
    expectFunctionContains(name, "if not found then");
    expectFunctionContains(name, "'authority_consumption_state_not_found', 'authority_consumption_state_not_found'");
    expectFunctionContains(name, "'authority_consumption_state_found'::text");
    expectFunctionContains(name, "'read_rejected', 'input_contract_rejected'");
    expectFunctionContains(name, "'read_rejected', 'storage_operation_rejected'");
    expectFragmentOrder(name, "if not found then", "'authority_consumption_state_found'::text");
    expectFragmentOrder(name, "'authority_consumption_state_not_found', 'authority_consumption_state_not_found'", "'authority_consumption_state_found'::text");
    expect(normalizedFunctionSql(name)).not.toContain("left join public.git_runner_authority_consumption_stages");
  });

  test("read found and not-found branches preserve inert authority posture", () => {
    const name = "read_git_runner_authority_consumption_state";

    expectFunctionContains(name, "false, 'none', false");
    expectFunctionContains(name, "r.consumption_key");
    expectFunctionContains(name, "r.authority_package_id");
    expectFunctionContains(name, "r.state_fingerprint");
    expectFunctionContains(name, "null::smallint");
    expectFunctionContains(name, "null::text");
  });

  test("every transition path writes an audit event with inert runtime posture", () => {
    for (const functionName of mutationFunctionNames) {
      const sql = functionSql(functionName);

      expect(sql).toContain("insert into public.git_runner_authority_consumption_audit_events");
      expect(sql).toContain("runtime_activated, authority, toctou_eliminated");
      expect(sql).toContain("false, 'none', false");
    }
  });

  test("all mutable transitions use row locks and expected transition fingerprints", () => {
    for (const functionName of mutationFunctionNames.filter((name) => name !== "register_git_runner_authority_package")) {
      expectFunctionContains(functionName, "for update");
      expectFunctionContains(functionName, "p_expected_transition_version");
      expectFunctionContains(functionName, "p_current_state_fingerprint");
      expectFunctionContains(functionName, "state_fingerprint = p_current_state_fingerprint");
    }
  });

  test("all fingerprint-bearing RPCs require lowercase SHA-256-shaped fingerprints", () => {
    for (const functionName of functionNames.filter((name) => name !== "read_git_runner_authority_consumption_state")) {
      expect(strippedFunctionSql(functionName)).toContain("!~ ''");
      expect(functionSql(functionName)).toContain("^[0-9a-f]{64}$");
    }
  });

  test("migration contains no application, runner, process, credential, network, or deployment wiring", () => {
    const forbiddenExecutableFragments = [
      "child_process",
      "spawn(",
      "exec(",
      "process.env",
      "keychain",
      "keytar",
      "fetch(",
      "axios",
      "avanza",
      "runtime_caller",
      "run_scan",
      "deployment",
      "credentials_used",
    ];

    for (const fragment of forbiddenExecutableFragments) {
      expect(executableSql).not.toContain(fragment);
    }
  });

  test("function comments preserve non-authorization and dormant posture", () => {
    for (const functionName of functionNames) {
      expectSqlContains(`comment on function public.${functionName}`);
    }
    expect(normalizedSql).toContain("no application caller exists");
    expect(normalizedSql).toContain("no git execution");
    expect(normalizedSql).toContain("raw path");
    expect(normalizedSql).toContain("no unrestricted audit history");
  });
});
