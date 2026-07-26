#!/usr/bin/env node
/** Runs the frozen Action 659C scenario matrix with observable local progress. */
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const path = process.argv[2];
if (!new Set(["source", "bundle"]).has(path)) throw new Error("path must be source or bundle");
const start = Number.parseInt(process.argv[3] ?? "0", 10);
const count = Number.parseInt(process.argv[4] ?? "36", 10);

const scenarios = [
  ["supported", "missing_service_role_dml"], ["supported", "broad_service_role_access"],
  ["supported", "anon_access_restored"], ["supported", "authenticated_access_restored"],
  ["supported", "public_access_restored"], ["supported", "rls_disabled"],
  ["supported", "combined_acl_rls_drift"],
  ["failures", "missing_02000_history"], ["failures", "03000_history_present"],
  ["failures", "forbidden_history"], ["failures", "recovery_not_required"],
  ["failures", "missing_target_table"], ["failures", "extra_partitioned_public_table"],
  ["failures", "owner_drift"], ["failures", "policy_drift"],
  ["failures", "missing_append_only_function"], ["failures", "missing_append_only_trigger"],
  ["failures", "altered_append_only_trigger"], ["failures", "action_652_rpc_drift"],
  ["failures", "forced_postcondition_failure"], ["failures", "forced_bundle_pre_history_failure"],
  ["unknown", "extra_scope_table"], ["unknown", "altered_append_only_function"],
  ["unknown", "unknown_append_only_trigger"], ["unknown", "unknown_role_select_bundle"],
  ["unknown", "unknown_role_dml"], ["unknown", "unknown_role_column_privilege"],
  ["unknown", "known_role_column_privilege"], ["unknown", "unknown_runtime_membership"],
  ["unknown", "unknown_role_without_privileges"], ["unknown", "table_owner_column_privilege"],
  ["unknown", "irrelevant_schema_table"], ["unknown", "whitespace_equivalent_append_only_function"],
  ["unknown", "internal_constraint_trigger"], ["unknown", "public_view_sequence_extension"],
  ["unknown", "documented_login_limiter_exception"],
];
const harness = fileURLToPath(new URL("./action-659c-local-recovery-validation.mjs", import.meta.url));
const results = [];
const selected = scenarios.slice(start, start + count);
function runScenario([group, id]) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [harness, group, id, path], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code) => {
      const parsed = stdout.trim() ? JSON.parse(stdout.trim()) : { status: "failed", failed_ids: [id], stderr: stderr.trim() };
      resolve({ id, status: code === 0 ? parsed.status : "failed", failed_ids: parsed.failed_ids });
    });
  });
}
for (let index = 0; index < selected.length; index += 2) {
  const batch = await Promise.all(selected.slice(index, index + 2).map(runScenario));
  results.push(...batch);
  console.log(JSON.stringify({ path, start, completed: results.length, total: selected.length, ids: batch.map((result) => result.id), statuses: batch.map((result) => result.status) }));
  if (batch.some((result) => result.status !== "passed")) break;
}
const digest = createHash("sha256").update(JSON.stringify(results)).digest("hex");
const report = { path, start, total: selected.length, executed: results.length, passed: results.filter((result) => result.status === "passed").length, failed: results.filter((result) => result.status !== "passed").length, result_set_digest: digest, results };
const reportPath = join(tmpdir(), `action-659c-${path}-${start}-${count}.json`);
writeFileSync(reportPath, JSON.stringify(report), "utf8");
console.log(JSON.stringify({ ...report, report_path: reportPath }));
process.exitCode = results.length === selected.length && results.every((result) => result.status === "passed") ? 0 : 1;
