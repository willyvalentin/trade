import { createHash } from "node:crypto";

export const action643ScheduledDryRunBuilderContractVersion =
  "action_643_scheduled_dry_run_request_builder_v1";

export const action643ScheduledDryRunContract = Object.freeze({
  market_date: "2026-07-24",
  market_window: Object.freeze({
    start: "2026-07-24T13:30:00.000Z",
    end: "2026-07-24T14:00:00.000Z",
  }),
  cadence_slot: "regular_session_30m_1400Z",
  ticker: "AAPL",
  interval: "5min",
  execution_mode: "dry_run",
  policy: Object.freeze({
    total_credits: 377,
    hard_reserve_credits: 57,
    normal_planned_max_credits: 320,
  }),
});

const scheduledAdmissionContractVersion =
  "continuous_intelligence_shadow_canary_scheduled_admission_v1";
const schedulerContractVersion =
  "continuous_intelligence_shadow_canary_scheduler_v1";
const dryRunContractVersion =
  "continuous_intelligence_shadow_canary_scheduled_dry_run_v1";
const scheduledExecutionPolicyVersion =
  "continuous_intelligence_shadow_canary_scheduled_execution_policy_v1";
const plannerProfile = "continuous_intelligence_budget_plan_v1";

function canonicalUtcTimestamp(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const instant = Date.parse(value);
  return Number.isFinite(instant) && new Date(instant).toISOString() === value ? value : null;
}

function shortStableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function invalid(code) {
  return Object.freeze({ ok: false, code });
}

/**
 * Pure local construction for the only Action 643 request shape. This builder
 * intentionally has no route, credential, transport, persistence, or runtime
 * configuration dependency.
 */
export function buildAction643ScheduledDryRunRequest(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return invalid("input_invalid");
  const expectedKeys = ["deployment_commit", "expected_deployment_commit", "market_date", "market_window", "cadence_slot", "execution_mode", "now_utc"];
  if (Object.keys(input).length !== expectedKeys.length || expectedKeys.some((key) => !(key in input))) return invalid("input_shape_invalid");
  const deploymentCommit = input.deployment_commit;
  const expectedDeploymentCommit = input.expected_deployment_commit;
  if (typeof deploymentCommit !== "string" || !/^[0-9a-f]{40}$/.test(deploymentCommit)) return invalid("deployment_commit_invalid");
  if (typeof expectedDeploymentCommit !== "string" || !/^[0-9a-f]{40}$/.test(expectedDeploymentCommit)) return invalid("expected_deployment_commit_invalid");
  if (deploymentCommit !== expectedDeploymentCommit) return invalid("deployment_identity_stale");
  if (input.execution_mode !== "dry_run") return invalid("execution_mode_not_dry_run");

  const contract = action643ScheduledDryRunContract;
  if (input.market_date !== contract.market_date) return invalid("market_date_mismatch");
  if (!input.market_window || typeof input.market_window !== "object" || Array.isArray(input.market_window)) return invalid("market_window_invalid");
  const start = canonicalUtcTimestamp(input.market_window.start);
  const end = canonicalUtcTimestamp(input.market_window.end);
  if (!start || !end || Date.parse(end) - Date.parse(start) !== 30 * 60 * 1000) return invalid("market_window_invalid");
  if (start !== contract.market_window.start || end !== contract.market_window.end) return invalid("market_window_mismatch");
  if (input.cadence_slot !== contract.cadence_slot) return invalid("cadence_mismatch");
  if (input.now_utc !== undefined) {
    const now = canonicalUtcTimestamp(input.now_utc);
    if (!now) return invalid("cutoff_timestamp_invalid");
    if (Date.parse(now) < Date.parse(end)) return invalid("window_not_completed");
  } else {
    return invalid("cutoff_timestamp_missing");
  }

  const occurrenceSource = [
    deploymentCommit,
    schedulerContractVersion,
    contract.market_date,
    start,
    end,
    contract.cadence_slot,
    contract.ticker,
    contract.interval,
    plannerProfile,
  ].join("|");
  const occurrenceId = `scheduled_canary_occurrence_${contract.market_date.replaceAll("-", "")}_1400_${shortStableHash(occurrenceSource)}`;
  const payload = Object.freeze({
    contract_version: scheduledAdmissionContractVersion,
    source: "scheduled",
    deployment_commit: deploymentCommit,
    scheduler_contract_version: schedulerContractVersion,
    market_date: contract.market_date,
    market_window: Object.freeze({ start, end }),
    cadence_slot: contract.cadence_slot,
    ticker: contract.ticker,
    interval: contract.interval,
    planner_profile: plannerProfile,
    occurrence_id: occurrenceId,
    requested_at: end,
    expected_policy: Object.freeze({ ...contract.policy }),
    dry_run_contract_version: dryRunContractVersion,
    execution_mode: "dry_run",
    policy_version: scheduledExecutionPolicyVersion,
  });
  const requestFingerprint = `action_643_scheduled_dry_run_${createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 24)}`;
  return Object.freeze({
    ok: true,
    builder_contract_version: action643ScheduledDryRunBuilderContractVersion,
    payload,
    occurrence_id: occurrenceId,
    request_fingerprint: requestFingerprint,
  });
}
