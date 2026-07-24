import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const action645ExpectedCommit = "c7fc1f06019f1afff58c9f146a1f0576ef6447dc";
export const action645SiteId = "2b582e03-ac97-4371-8051-558d9980fb94";
export const action645Action643Window = Object.freeze({
  market_date: "2026-07-24",
  start: "2026-07-24T13:30:00.000Z",
  end: "2026-07-24T14:00:00.000Z",
  cadence: "regular_session_30m_1400Z",
});
export const action645ForbiddenMigrationVersions = Object.freeze([
  "20260708000000",
  "20260708001000",
  "20260710000000",
]);
export const action645RequiredMigrationVersion = "20260724001000";

const builderPath = "/tmp/ture-action-643-build-request.cjs";
const usagePath = "https://trade.valentinlabs.com/api/automation/continuous-intelligence/shadow-collector/canary/usage-accounting?utc_date=2026-07-24";

function isCommit(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/.test(value);
}

function isZeroScope(value) {
  return value && value.attempts === 0 && value.estimated_credits === 0;
}

function safeError(error) {
  return error instanceof Error ? error.name : "unknown_error";
}

function normalizeUsage(body) {
  const usage = body?.usage_accounting;
  if (!usage || typeof usage !== "object") return null;
  const scope = (value) => (
    value && typeof value === "object" && Number.isInteger(value.attempts) && Number.isInteger(value.estimated_credits)
      ? { attempts: value.attempts, estimated_credits: value.estimated_credits }
      : null
  );
  return {
    status: usage.status,
    scheduled: scope(usage.scheduled_shadow_collector_canary),
    manual: scope(usage.bounded_manual_proof),
    reconciliation: scope(usage.historical_manual_usage_reconciliation),
    total_ledger: scope(usage.total_ledger),
    claim_capacity: scope(usage.claim_capacity),
    provider_calls_executed: body.provider_calls_executed === false ? 0 : null,
    durable_writes_executed: body.durable_writes_executed === false ? 0 : null,
    schedule_changes: body.schedule_changes === false ? 0 : null,
  };
}

export function evaluateAction645Preflight(input) {
  const blockers = [];
  const warnings = [];
  const expectedCommit = input.expected_commit;
  const windowEnd = Date.parse(action645Action643Window.end);
  const now = input.now instanceof Date && Number.isFinite(input.now.getTime()) ? input.now : null;
  const availability = input.availability ?? {};
  if (!now || !isCommit(expectedCommit) || Object.values(availability).some((value) => value !== true)) {
    blockers.push("preflight_dependency_unavailable");
  }

  const git = input.git;
  if (!git || git.branch !== "main" || !isCommit(git.local_head) || !isCommit(git.origin_main_head) || !isCommit(git.github_default_head)) {
    blockers.push("git_identity_unavailable");
  } else if (git.local_head !== git.origin_main_head || git.local_head !== git.github_default_head) {
    blockers.push("git_identity_mismatch");
  }
  if (git?.working_tree?.includes("deno.lock")) warnings.push("deno_lock_untracked_preserved");

  const deploy = input.netlify_deploy;
  if (!deploy || deploy.state !== "ready" || deploy.context !== "production" || deploy.branch !== "main" || deploy.plugin_state !== "success" || deploy.error_message !== null || !isCommit(deploy.commit_ref)) {
    blockers.push("deployment_unhealthy");
  } else if (deploy.commit_ref !== git?.github_default_head) {
    blockers.push("deployment_identity_mismatch");
  }
  if (!deploy || deploy.secrets_scan_matches !== 0 || deploy.enhanced_secrets_scan_matches !== 0) {
    blockers.push("deployment_secret_scan_failed");
  }

  if (input.deployment_assertion !== deploy?.commit_ref) blockers.push("assertion_mismatch");

  const schema = input.supabase;
  if (!schema || schema.lint_ok !== true || schema.required_migration_applied !== true) blockers.push("production_schema_unhealthy");
  if (schema?.forbidden_migrations_present === true) blockers.push("forbidden_migration_detected");

  const usage = input.usage;
  if (!usage || usage.status !== "available" || !isZeroScope(usage.scheduled) || !isZeroScope(usage.manual) || !isZeroScope(usage.reconciliation) || !isZeroScope(usage.total_ledger) || !isZeroScope(usage.claim_capacity)) {
    blockers.push("usage_not_clean");
  }
  if (!usage || usage.provider_calls_executed !== 0 || usage.durable_writes_executed !== 0 || usage.schedule_changes !== 0) {
    blockers.push("usage_effect_counter_unavailable");
  }

  const builder = input.builder;
  if (!builder || builder.exists !== true || builder.deployment_commit !== expectedCommit || builder.window_matches !== true) {
    blockers.push("builder_stale");
  }

  if (now && now.getTime() < windowEnd) blockers.push("window_not_completed");

  const precedence = [
    ["preflight_dependency_unavailable", "preflight_unavailable"],
    ["git_identity_unavailable", "preflight_unavailable"],
    ["git_identity_mismatch", "git_identity_mismatch"],
    ["deployment_unhealthy", "deployment_identity_mismatch"],
    ["deployment_secret_scan_failed", "deployment_identity_mismatch"],
    ["deployment_identity_mismatch", "deployment_identity_mismatch"],
    ["assertion_mismatch", "assertion_mismatch"],
    ["forbidden_migration_detected", "forbidden_migration_detected"],
    ["production_schema_unhealthy", "production_schema_unhealthy"],
    ["usage_not_clean", "usage_not_clean"],
    ["usage_effect_counter_unavailable", "preflight_unavailable"],
    ["window_not_completed", "window_not_completed"],
    ["builder_stale", "builder_stale"],
  ];
  const status = precedence.find(([blocker]) => blockers.includes(blocker))?.[1] ?? "preflight_ready";
  const recommended_next_action = status === "preflight_ready"
    ? "request_explicit_authorization_for_one_scheduled_dry_run"
    : status === "window_not_completed"
      ? "wait_until_action_643_window_completed_then_rerun_read_only_preflight"
      : "resolve_reported_blockers_without_bypassing_safety_gates_then_rerun_preflight";

  return {
    status,
    blockers,
    warnings,
    identities: {
      expected_commit: expectedCommit,
      local_head: git?.local_head ?? null,
      origin_main_head: git?.origin_main_head ?? null,
      github_default_head: git?.github_default_head ?? null,
      published_deploy_commit: deploy?.commit_ref ?? null,
      deployment_assertion: input.deployment_assertion ?? null,
      local_relation_to_origin: git?.local_relation_to_origin ?? "unknown",
      working_tree_status: git?.working_tree ?? null,
    },
    timing: {
      now_utc: now?.toISOString() ?? null,
      window_end_utc: action645Action643Window.end,
      window_complete: now ? now.getTime() >= windowEnd : false,
      remaining_ms: now ? Math.max(0, windowEnd - now.getTime()) : null,
    },
    usage: usage ?? null,
    builder: builder ?? null,
    netlify_deployment: deploy ?? null,
    supabase: schema ?? null,
    effects: {
      production_mutations_attempted: false,
      production_dry_run_requests_sent: 0,
      provider_calls_triggered_by_preflight: 0,
      claims_created_by_preflight: 0,
      durable_writes_by_preflight: 0,
      schedule_changes_by_preflight: 0,
    },
    recommended_next_action,
  };
}

async function run(command, args, { include_stderr = false } = {}) {
  const { stdout, stderr } = await execFileAsync(command, args, { cwd: process.cwd(), maxBuffer: 2_000_000 });
  return (include_stderr ? `${stdout}\n${stderr}` : stdout).trim();
}

async function readBuilder() {
  try {
    const source = await readFile(builderPath, "utf8");
    const commits = [...new Set(source.match(/[0-9a-f]{40}/g) ?? [])];
    return {
      exists: true,
      path: builderPath,
      deployment_commit: commits.length === 1 ? commits[0] : null,
      window_matches: source.includes(action645Action643Window.start) && source.includes(action645Action643Window.end) && source.includes(action645Action643Window.cadence),
    };
  } catch {
    return { exists: false, path: builderPath, deployment_commit: null, window_matches: false };
  }
}

async function readAutomationSecret() {
  const source = await readFile(".env.local", "utf8");
  const line = source.split(/\r?\n/).find((value) => value.startsWith("AUTOMATION_SECRET="));
  if (!line) throw new Error("automation_secret_unavailable");
  const value = line.slice("AUTOMATION_SECRET=".length).trim().replace(/^['\"]|['\"]$/g, "");
  if (!value) throw new Error("automation_secret_unavailable");
  return value;
}

async function collectProductionState() {
  const availability = {};
  const git = {};
  try {
    git.branch = await run("git", ["branch", "--show-current"]);
    git.local_head = await run("git", ["rev-parse", "HEAD"]);
    git.origin_main_head = await run("git", ["rev-parse", "origin/main"]);
    git.github_default_head = (await run("git", ["ls-remote", "--symref", "origin", "HEAD"])).split("\n").at(-1)?.split("\t")[0] ?? null;
    const [behind, ahead] = (await run("git", ["rev-list", "--left-right", "--count", "HEAD...origin/main"])).split(/\s+/).map(Number);
    git.local_relation_to_origin = behind === 0 && ahead === 0 ? "equal" : behind > 0 && ahead === 0 ? "behind" : behind === 0 && ahead > 0 ? "ahead" : "diverged";
    git.working_tree = await run("git", ["status", "--short"]);
    availability.git = true;
  } catch { availability.git = false; }

  let netlifyDeploy = null;
  let deploymentAssertion = null;
  try {
    const site = JSON.parse(await run("netlify", ["api", "getSite", "--data", JSON.stringify({ site_id: action645SiteId })]));
    const deploy = JSON.parse(await run("netlify", ["api", "getDeploy", "--data", JSON.stringify({ deploy_id: site.published_deploy.id })]));
    const scan = deploy.deploy_validations_report?.secret_scan_result ?? {};
    netlifyDeploy = {
      state: deploy.state,
      context: deploy.context,
      branch: deploy.branch,
      plugin_state: deploy.plugin_state,
      error_message: deploy.error_message,
      commit_ref: deploy.commit_ref,
      deployment_timestamp: deploy.published_at,
      secrets_scan_matches: Array.isArray(scan.secretsScanMatches) ? scan.secretsScanMatches.length : null,
      enhanced_secrets_scan_matches: Array.isArray(scan.enhancedSecretsScanMatches) ? scan.enhancedSecretsScanMatches.length : null,
    };
    const env = JSON.parse(await run("netlify", ["env:get", "TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT", "--context", "production", "--site", action645SiteId, "--json"]));
    deploymentAssertion = env.TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT ?? null;
    availability.netlify = true;
  } catch { availability.netlify = false; }

  let supabase = null;
  try {
    const lint = await run("supabase", ["db", "lint", "--linked"], { include_stderr: true });
    const migrations = await run("supabase", ["migration", "list", "--linked"], { include_stderr: true });
    const remoteApplied = (version) => migrations.split(/\r?\n/).some((line) => {
      const columns = line.split("|").map((value) => value.trim());
      return columns[0] === version && columns[1] === version;
    });
    supabase = {
      lint_ok: lint.includes("No schema errors found"),
      required_migration_applied: remoteApplied(action645RequiredMigrationVersion),
      forbidden_migrations_present: action645ForbiddenMigrationVersions.some(remoteApplied),
    };
    availability.supabase = true;
  } catch { availability.supabase = false; }

  let usage = null;
  try {
    const secret = await readAutomationSecret();
    const response = await fetch(usagePath, { headers: { "x-automation-secret": secret } });
    usage = normalizeUsage(await response.json());
    availability.usage = response.status === 200 && usage !== null;
  } catch { availability.usage = false; }

  const builder = await readBuilder();
  availability.builder = true;
  return { availability, git, netlifyDeploy, deploymentAssertion, supabase, usage, builder };
}

async function main() {
  const state = await collectProductionState();
  const report = evaluateAction645Preflight({
    expected_commit: action645ExpectedCommit,
    now: new Date(),
    availability: state.availability,
    git: state.git,
    netlify_deploy: state.netlifyDeploy,
    deployment_assertion: state.deploymentAssertion,
    supabase: state.supabase,
    usage: state.usage,
    builder: state.builder,
  });
  console.log(JSON.stringify(report, null, 2));
  console.log(`Action 645: ${report.status}; blockers=${report.blockers.join(",") || "none"}; next=${report.recommended_next_action}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((error) => {
    console.log(JSON.stringify({ status: "preflight_unavailable", blockers: ["preflight_dependency_unavailable"], error_category: safeError(error) }, null, 2));
    process.exitCode = 1;
  });
}
