import { createHash } from "node:crypto";

import {
  INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
  runInternalPaperReplayExecution,
  type InternalPaperReplayExecutionInput,
  type InternalPaperReplayExecutionResult,
} from "@/lib/internal-paper-replay-execution";

export const INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_VERSION =
  "internal_paper_execution_feasibility_stress_v1" as const;
export const INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_MANIFEST_VERSION =
  "internal_paper_execution_feasibility_stress_manifest_v1" as const;
export const INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_RESULT_VERSION =
  "internal_paper_execution_feasibility_stress_result_v1" as const;

export type InternalPaperExecutionFeasibilityScenario = Readonly<{
  scenario_id: string;
  latency_ms: number;
  max_volume_participation_bps: number;
}>;

export type InternalPaperExecutionFeasibilityStressManifest = Readonly<{
  manifest_version: typeof INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_MANIFEST_VERSION;
  matrix_id: string;
  frozen_at: string;
  stress_scope: "latency_and_volume_participation_only_v1";
  baseline_scenario_id: string;
  base_execution_input_digest: string;
  market_evidence_digest: string;
  order_account_cost_digest: string;
  scenarios: InternalPaperExecutionFeasibilityScenario[];
  manifest_digest: string;
}>;

export type InternalPaperExecutionFeasibilityStressManifestInput = Readonly<{
  matrix_id: string;
  frozen_at: string;
  base_execution: InternalPaperReplayExecutionInput;
  scenarios: ReadonlyArray<InternalPaperExecutionFeasibilityScenario>;
}>;

export type InternalPaperExecutionFeasibilityStressInput = Readonly<{
  stress_version: typeof INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_VERSION;
  manifest: InternalPaperExecutionFeasibilityStressManifest;
  base_execution: InternalPaperReplayExecutionInput;
  scenarios: ReadonlyArray<InternalPaperExecutionFeasibilityScenario>;
}>;

type Authority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_promote_strategy: false;
  can_execute_broker_action: false;
}>;

type ScenarioResult =
  | Readonly<{
      scenario_id: string;
      status: "completed";
      execution_result_digest: string;
      requested_quantity: number;
      filled_quantity: number;
      unfilled_quantity: number;
      fill_occurred_at: string;
      fill_candle_id: string;
      costed_fill_price: number;
      modeled_execution_cost: number;
      realized_net_pnl: number;
    }>
  | Readonly<{
      scenario_id: string;
      status: "unfilled" | "rejected";
      reason: string;
      execution_result_digest: string;
      requested_quantity: number;
      filled_quantity: 0;
      unfilled_quantity: number;
    }>;

type BlockReason =
  | "stress_identity_invalid"
  | "stress_manifest_digest_mismatch"
  | "stress_manifest_input_mismatch"
  | "stress_execution_blocked";

export type InternalPaperExecutionFeasibilityStressResult =
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_RESULT_VERSION;
      stress_version: typeof INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_VERSION;
      status: "blocked";
      reason_codes: BlockReason[];
      matrix_id: string | null;
      manifest_digest: string | null;
      blocked_scenario_id: string | null;
      underlying_reason: string | null;
      authority: Authority;
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_RESULT_VERSION;
      stress_version: typeof INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_VERSION;
      status: "completed";
      reason_codes: [];
      scientific_disposition: "execution_feasibility_diagnostic_not_strategy_accepted";
      matrix_id: string;
      manifest_digest: string;
      baseline_scenario_id: string;
      scenarios: ScenarioResult[];
      summary: Readonly<{
        full_fill_count: number;
        partial_fill_count: number;
        unfilled_count: number;
        rejected_count: number;
      }>;
      evidence_limits: readonly [
        "single_frozen_order_not_strategy_evaluation",
        "minute_bar_open_proxy_not_quote_execution",
        "market_impact_and_cancel_uncertainty_not_modeled",
        "historical_source_rights_not_independently_verified",
        "no_forward_shadow_acceptance",
        "no_automatic_policy_promotion",
      ];
      authority: Authority;
      result_digest: string;
    }>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const MAX_LATENCY_MS = 30 * 60_000;
const AUTHORITY: Authority = {
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_promote_strategy: false,
  can_execute_broker_action: false,
};
const EVIDENCE_LIMITS = [
  "single_frozen_order_not_strategy_evaluation",
  "minute_bar_open_proxy_not_quote_execution",
  "market_impact_and_cancel_uncertainty_not_modeled",
  "historical_source_rights_not_independently_verified",
  "no_forward_shadow_acceptance",
  "no_automatic_policy_promotion",
] as const;

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

function terminal<T extends object>(value: T): T & { result_digest: string } {
  return { ...value, result_digest: digest(value) };
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function validScenario(scenario: InternalPaperExecutionFeasibilityScenario) {
  return (
    UUID_PATTERN.test(scenario.scenario_id) &&
    Number.isSafeInteger(scenario.latency_ms) &&
    scenario.latency_ms >= 0 &&
    scenario.latency_ms <= MAX_LATENCY_MS &&
    Number.isSafeInteger(scenario.max_volume_participation_bps) &&
    scenario.max_volume_participation_bps >= 1 &&
    scenario.max_volume_participation_bps <= 10_000
  );
}

function unsignedManifest(
  manifest: InternalPaperExecutionFeasibilityStressManifest,
) {
  const { manifest_digest: manifestDigest, ...unsigned } = manifest;
  void manifestDigest;
  return unsigned;
}

/** Freeze one opportunity before comparing deterministic execution assumptions. */
export function buildInternalPaperExecutionFeasibilityStressManifest(
  input: InternalPaperExecutionFeasibilityStressManifestInput,
): InternalPaperExecutionFeasibilityStressManifest | null {
  const { base_execution: base, scenarios } = input;
  if (
    !UUID_PATTERN.test(input.matrix_id) ||
    !explicitInstant(input.frozen_at) ||
    base.execution_version !== INTERNAL_PAPER_REPLAY_EXECUTION_VERSION ||
    base.policy.time_in_force !== "ioc" ||
    !explicitInstant(base.base_replay.dataset.point_in_time_as_of) ||
    Date.parse(input.frozen_at) <
      Date.parse(base.base_replay.dataset.point_in_time_as_of) ||
    scenarios.length < 2 ||
    scenarios.length > 6 ||
    scenarios.some((scenario) => !validScenario(scenario)) ||
    new Set(scenarios.map(({ scenario_id }) => scenario_id)).size !==
      scenarios.length ||
    new Set(
      scenarios.map(({ latency_ms, max_volume_participation_bps }) =>
        `${latency_ms}:${max_volume_participation_bps}`,
      ),
    ).size !== scenarios.length
  ) {
    return null;
  }

  const baseline = scenarios.find(
    ({ latency_ms, max_volume_participation_bps }) =>
      latency_ms === base.policy.latency_ms &&
      max_volume_participation_bps ===
        base.policy.max_volume_participation_bps,
  );
  if (!baseline) return null;

  const ordered = [...scenarios].sort((left, right) =>
    left.scenario_id.localeCompare(right.scenario_id),
  );
  const unsigned = {
    manifest_version:
      INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_MANIFEST_VERSION,
    matrix_id: input.matrix_id,
    frozen_at: input.frozen_at,
    stress_scope: "latency_and_volume_participation_only_v1" as const,
    baseline_scenario_id: baseline.scenario_id,
    base_execution_input_digest: digest(base),
    market_evidence_digest: digest({
      dataset: base.base_replay.dataset,
      candles: base.base_replay.candles,
    }),
    order_account_cost_digest: digest({
      order_id: base.order_id,
      entry: base.base_replay.entry,
      account: base.base_replay.account,
    }),
    scenarios: ordered,
  };
  return { ...unsigned, manifest_digest: digest(unsigned) };
}

function blocked(
  input: InternalPaperExecutionFeasibilityStressInput,
  reason: BlockReason,
  blockedScenarioId: string | null = null,
  underlyingReason: string | null = null,
): InternalPaperExecutionFeasibilityStressResult {
  return terminal({
    result_version: INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_RESULT_VERSION,
    stress_version: INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_VERSION,
    status: "blocked" as const,
    reason_codes: [reason],
    matrix_id: UUID_PATTERN.test(input.manifest.matrix_id)
      ? input.manifest.matrix_id
      : null,
    manifest_digest: SHA256_PATTERN.test(input.manifest.manifest_digest)
      ? input.manifest.manifest_digest
      : null,
    blocked_scenario_id: blockedScenarioId,
    underlying_reason: underlyingReason,
    authority: AUTHORITY,
  });
}

function reportScenario(
  scenarioId: string,
  result: Exclude<InternalPaperReplayExecutionResult, { status: "blocked" }>,
): ScenarioResult | null {
  if (result.status !== "completed") {
    return {
      scenario_id: scenarioId,
      status: result.status,
      reason: result.reason,
      execution_result_digest: result.result_digest,
      requested_quantity: result.requested_quantity,
      filled_quantity: 0,
      unfilled_quantity: result.requested_quantity,
    };
  }
  if (result.replay.status !== "completed") return null;
  const entryFill = result.replay.events.find(
    (event) => event.event_type === "entry_fill",
  );
  if (!entryFill) return null;
  // Disclosure only: these costs are already reflected by the replay's fill
  // prices and realized net P&L, so consumers must not subtract them again.
  const modeledCost = result.replay.events.reduce(
    (sum, event) =>
      sum + event.spread_cost + event.slippage_cost + event.commission,
    0,
  );
  return {
    scenario_id: scenarioId,
    status: "completed",
    execution_result_digest: result.result_digest,
    requested_quantity: result.requested_quantity,
    filled_quantity: result.filled_quantity,
    unfilled_quantity: result.unfilled_quantity,
    fill_occurred_at: result.fill_occurred_at,
    fill_candle_id: result.fill_candle_id,
    costed_fill_price: entryFill.fill_price,
    modeled_execution_cost: Number(modeledCost.toFixed(6)),
    realized_net_pnl: result.replay.final_state.realized_net_pnl,
  };
}

export function verifyInternalPaperExecutionFeasibilityStressDigest(
  result: InternalPaperExecutionFeasibilityStressResult,
) {
  const { result_digest: resultDigest, ...payload } = result;
  return SHA256_PATTERN.test(resultDigest) && digest(payload) === resultDigest;
}

/** Provider-free diagnostic only: one order, one market tape, no promotion. */
export function runInternalPaperExecutionFeasibilityStress(
  input: InternalPaperExecutionFeasibilityStressInput,
): InternalPaperExecutionFeasibilityStressResult {
  if (
    input.stress_version !== INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_VERSION ||
    input.manifest.manifest_version !==
      INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_MANIFEST_VERSION ||
    !UUID_PATTERN.test(input.manifest.matrix_id)
  ) {
    return blocked(input, "stress_identity_invalid");
  }
  if (
    !SHA256_PATTERN.test(input.manifest.manifest_digest) ||
    digest(unsignedManifest(input.manifest)) !== input.manifest.manifest_digest
  ) {
    return blocked(input, "stress_manifest_digest_mismatch");
  }
  const rebuilt = buildInternalPaperExecutionFeasibilityStressManifest({
    matrix_id: input.manifest.matrix_id,
    frozen_at: input.manifest.frozen_at,
    base_execution: input.base_execution,
    scenarios: input.scenarios,
  });
  if (!rebuilt || rebuilt.manifest_digest !== input.manifest.manifest_digest) {
    return blocked(input, "stress_manifest_input_mismatch");
  }

  const scenarios: ScenarioResult[] = [];
  for (const binding of input.manifest.scenarios) {
    const result = runInternalPaperReplayExecution({
      ...input.base_execution,
      policy: {
        ...input.base_execution.policy,
        latency_ms: binding.latency_ms,
        max_volume_participation_bps: binding.max_volume_participation_bps,
      },
    });
    if (result.status === "blocked") {
      return blocked(
        input,
        "stress_execution_blocked",
        binding.scenario_id,
        result.reason,
      );
    }
    const reported = reportScenario(binding.scenario_id, result);
    if (!reported) {
      return blocked(
        input,
        "stress_execution_blocked",
        binding.scenario_id,
        "completed_execution_missing_replay_evidence",
      );
    }
    scenarios.push(reported);
  }

  return terminal({
    result_version: INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_RESULT_VERSION,
    stress_version: INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_VERSION,
    status: "completed" as const,
    reason_codes: [] as [],
    scientific_disposition:
      "execution_feasibility_diagnostic_not_strategy_accepted" as const,
    matrix_id: input.manifest.matrix_id,
    manifest_digest: input.manifest.manifest_digest,
    baseline_scenario_id: input.manifest.baseline_scenario_id,
    scenarios,
    summary: {
      full_fill_count: scenarios.filter(
        (scenario) =>
          scenario.status === "completed" && scenario.unfilled_quantity === 0,
      ).length,
      partial_fill_count: scenarios.filter(
        (scenario) =>
          scenario.status === "completed" && scenario.unfilled_quantity > 0,
      ).length,
      unfilled_count: scenarios.filter(
        (scenario) => scenario.status === "unfilled",
      ).length,
      rejected_count: scenarios.filter(
        (scenario) => scenario.status === "rejected",
      ).length,
    },
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}
