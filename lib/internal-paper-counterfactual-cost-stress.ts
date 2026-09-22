import { createHash } from "node:crypto";

import {
  buildInternalPaperCounterfactualFamilyManifest,
  INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION,
  runInternalPaperCounterfactualFamily,
  type InternalPaperCounterfactualFamilyInput,
  type InternalPaperCounterfactualInterventionDimension,
} from "@/lib/internal-paper-counterfactual-family";
import type { InternalPaperReplayExperimentPartition } from "@/lib/internal-paper-replay-experiment";

export const INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_VERSION =
  "internal_paper_counterfactual_cost_stress_v1" as const;
export const INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_MANIFEST_VERSION =
  "internal_paper_counterfactual_cost_stress_manifest_v1" as const;
export const INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_RESULT_VERSION =
  "internal_paper_counterfactual_cost_stress_result_v1" as const;

export type InternalPaperCounterfactualCostScenarioInput = Readonly<{
  scenario_id: string;
  family: InternalPaperCounterfactualFamilyInput;
}>;

type CostAssumptions = Readonly<{
  spread_bps: number;
  slippage_bps: number;
  commission_per_order: number;
}>;

type ScenarioBinding = Readonly<{
  scenario_id: string;
  family_id: string;
  family_manifest_digest: string;
  cost_fill_scenario_id: string;
  cost_assumptions: CostAssumptions;
  cost_assumption_digest: string;
}>;

type VariantBinding = Readonly<{
  variant_id: string;
  intervention_dimension: InternalPaperCounterfactualInterventionDimension;
  candidate_policy_lineage_digest: string;
  baseline_intervention_digest: string;
  candidate_intervention_digest: string;
  candidate_market_evidence_digest: string;
}>;

export type InternalPaperCounterfactualCostStressManifest = Readonly<{
  manifest_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_MANIFEST_VERSION;
  matrix_id: string;
  frozen_at: string;
  stress_scope: "spread_slippage_commission_only_v1";
  shared_opportunity_population_digest: string;
  shared_opportunity_count: number;
  shared_source_lineage_digest: string;
  shared_baseline_fingerprint: string;
  shared_evaluation_charter_fingerprint: string;
  shared_budget_digest: string;
  shared_execution_policy_digest: string;
  partitions: InternalPaperCounterfactualFamilyInput["manifest"]["partitions"];
  variants: VariantBinding[];
  scenarios: ScenarioBinding[];
  manifest_digest: string;
}>;

export type InternalPaperCounterfactualCostStressManifestInput = Readonly<{
  matrix_id: string;
  frozen_at: string;
  scenarios: ReadonlyArray<InternalPaperCounterfactualCostScenarioInput>;
}>;

export type InternalPaperCounterfactualCostStressInput = Readonly<{
  stress_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_VERSION;
  manifest: InternalPaperCounterfactualCostStressManifest;
  scenarios: ReadonlyArray<InternalPaperCounterfactualCostScenarioInput>;
}>;

type Authority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_promote_strategy: false;
  can_execute_broker_action: false;
}>;

type PartitionStress = Readonly<{
  partition: InternalPaperReplayExperimentPartition;
  scenario_count: number;
  minimum_paired_net_pnl_delta: number;
  maximum_paired_execution_cost_delta: number;
  worst_paired_maximum_drawdown_delta: number;
  scenarios_with_positive_net_pnl_delta: number;
  positive_net_pnl_in_every_scenario: boolean;
}>;

export type InternalPaperCounterfactualCostStressVariantResult = Readonly<{
  variant_id: string;
  intervention_dimension: InternalPaperCounterfactualInterventionDimension;
  scenarios: ReadonlyArray<
    Readonly<{
      scenario_id: string;
      family_result_digest: string;
      candidate_result_digest: string;
      partitions: ReadonlyArray<
        Readonly<{
          partition: InternalPaperReplayExperimentPartition;
          opportunity_count: number;
          rejected_count: number;
          no_trade_count: number;
          paired_net_pnl_delta: number;
          paired_execution_cost_delta: number;
          paired_maximum_drawdown_delta: number;
        }>
      >;
    }>
  >;
  partition_stress: PartitionStress[];
}>;

export type InternalPaperCounterfactualCostStressBlockReason =
  | "cost_stress_identity_invalid"
  | "cost_stress_manifest_digest_mismatch"
  | "cost_stress_manifest_input_mismatch"
  | "cost_stress_family_blocked"
  | "cost_stress_variant_result_mismatch";

export type InternalPaperCounterfactualCostStressResult =
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_RESULT_VERSION;
      stress_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_VERSION;
      status: "blocked";
      reason_codes: InternalPaperCounterfactualCostStressBlockReason[];
      matrix_id: string | null;
      manifest_digest: string | null;
      blocked_scenario_id: string | null;
      authority: Authority;
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_RESULT_VERSION;
      stress_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_VERSION;
      status: "completed";
      reason_codes: [];
      scientific_disposition:
        "replay_cost_stress_diagnostic_not_strategy_accepted";
      matrix_id: string;
      manifest_digest: string;
      variants: InternalPaperCounterfactualCostStressVariantResult[];
      evidence_limits: readonly [
        "bounded_repository_cost_stress_only",
        "no_fill_latency_or_market_impact_uncertainty",
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
const PARTITIONS = [
  "training",
  "validation",
  "held_out",
  "walk_forward",
] as const;
const AUTHORITY = {
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_promote_strategy: false,
  can_execute_broker_action: false,
} as const;
const EVIDENCE_LIMITS = [
  "bounded_repository_cost_stress_only",
  "no_fill_latency_or_market_impact_uncertainty",
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

function familyMatchesInput(family: InternalPaperCounterfactualFamilyInput) {
  if (family.family_version !== INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION) {
    return false;
  }
  const rebuilt = buildInternalPaperCounterfactualFamilyManifest({
    family_id: family.manifest.family_id,
    frozen_at: family.manifest.frozen_at,
    cost_fill_scenario_id: family.manifest.cost_fill_scenario_id,
    variants: family.variants,
  });
  return rebuilt?.manifest_digest === family.manifest.manifest_digest;
}

function firstBaseline(family: InternalPaperCounterfactualFamilyInput) {
  return family.variants[0]!.experiment.baseline;
}

function budgetProjection(family: InternalPaperCounterfactualFamilyInput) {
  const account = firstBaseline(family).account;
  return {
    initial_cash: account.initial_cash,
    per_trade_risk_cap: account.per_trade_risk_cap,
    daily_loss_cap: account.daily_loss_cap,
    target_exit_fraction_bps: account.target_exit_fraction_bps,
  };
}

function costAssumptions(
  family: InternalPaperCounterfactualFamilyInput,
): CostAssumptions {
  const account = firstBaseline(family).account;
  return {
    spread_bps: account.spread_bps,
    slippage_bps: account.slippage_bps,
    commission_per_order: account.commission_per_order,
  };
}

function variantBindings(family: InternalPaperCounterfactualFamilyInput) {
  return family.manifest.variants.map(
    ({
      variant_id,
      intervention_dimension,
      candidate_policy_lineage_digest,
      baseline_intervention_digest,
      candidate_intervention_digest,
      candidate_market_evidence_digest,
    }) => ({
      variant_id,
      intervention_dimension,
      candidate_policy_lineage_digest,
      baseline_intervention_digest,
      candidate_intervention_digest,
      candidate_market_evidence_digest,
    }),
  );
}

function logicalOpportunityPopulation(
  family: InternalPaperCounterfactualFamilyInput,
) {
  const manifest = family.variants[0]!.experiment.manifest;
  return manifest.sessions.map(
    ({
      sequence,
      trading_date,
      session_open,
      session_close,
      partition,
      opportunity_set_digest,
      opportunity_count,
    }) => ({
      sequence,
      trading_date,
      session_open,
      session_close,
      partition,
      opportunity_set_digest,
      opportunity_count,
    }),
  );
}

function unsignedManifest(
  manifest: InternalPaperCounterfactualCostStressManifest,
) {
  const { manifest_digest: manifestDigest, ...unsigned } = manifest;
  void manifestDigest;
  return unsigned;
}

/**
 * Freezes multiple H.1 families that differ only in spread, slippage and
 * commission. Opportunity population, strategy interventions, market evidence,
 * capital/risk budgets and fill policy must remain byte-identical.
 */
export function buildInternalPaperCounterfactualCostStressManifest(
  input: InternalPaperCounterfactualCostStressManifestInput,
): InternalPaperCounterfactualCostStressManifest | null {
  if (
    !UUID_PATTERN.test(input.matrix_id) ||
    !explicitInstant(input.frozen_at) ||
    input.scenarios.length < 2 ||
    input.scenarios.length > 6 ||
    new Set(input.scenarios.map(({ scenario_id }) => scenario_id)).size !==
      input.scenarios.length ||
    input.scenarios.some(
      ({ scenario_id, family }) =>
        !UUID_PATTERN.test(scenario_id) ||
        !familyMatchesInput(family) ||
        Date.parse(input.frozen_at) < Date.parse(family.manifest.frozen_at),
    )
  ) {
    return null;
  }

  const ordered = [...input.scenarios].sort((left, right) =>
    left.scenario_id.localeCompare(right.scenario_id),
  );
  const first = ordered[0]!.family;
  const firstVariants = variantBindings(first);
  const firstOpportunityPopulation = logicalOpportunityPopulation(first);
  const sharedOpportunityPopulationDigest = digest(firstOpportunityPopulation);
  const sharedBudgetDigest = digest(budgetProjection(first));
  const sharedExecutionPolicyDigest = digest(
    firstBaseline(first).execution_policy,
  );
  if (
    new Set(ordered.map(({ family }) => family.manifest.family_id)).size !==
      ordered.length ||
    new Set(
      ordered.map(({ family }) => family.manifest.cost_fill_scenario_id),
    ).size !== ordered.length ||
    new Set(
      ordered.map(({ family }) => digest(costAssumptions(family))),
    ).size !== ordered.length ||
    ordered.some(({ family }) =>
      digest(logicalOpportunityPopulation(family)) !==
        sharedOpportunityPopulationDigest ||
      family.manifest.shared_baseline.source_lineage_digest !==
        first.manifest.shared_baseline.source_lineage_digest ||
      family.manifest.shared_baseline.experiment_baseline_fingerprint !==
        first.manifest.shared_baseline.experiment_baseline_fingerprint ||
      family.manifest.shared_baseline.evaluation_charter_fingerprint !==
        first.manifest.shared_baseline.evaluation_charter_fingerprint ||
      digest(family.manifest.partitions) !== digest(first.manifest.partitions) ||
      digest(variantBindings(family)) !== digest(firstVariants) ||
      digest(budgetProjection(family)) !== sharedBudgetDigest ||
      digest(firstBaseline(family).execution_policy) !==
        sharedExecutionPolicyDigest,
    )
  ) {
    return null;
  }

  const scenarios = ordered.map(({ scenario_id, family }) => {
    const assumptions = costAssumptions(family);
    return {
      scenario_id,
      family_id: family.manifest.family_id,
      family_manifest_digest: family.manifest.manifest_digest,
      cost_fill_scenario_id: family.manifest.cost_fill_scenario_id,
      cost_assumptions: assumptions,
      cost_assumption_digest: digest(assumptions),
    } satisfies ScenarioBinding;
  });
  const unsigned = {
    manifest_version: INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_MANIFEST_VERSION,
    matrix_id: input.matrix_id,
    frozen_at: input.frozen_at,
    stress_scope: "spread_slippage_commission_only_v1" as const,
    shared_opportunity_population_digest: sharedOpportunityPopulationDigest,
    shared_opportunity_count: firstOpportunityPopulation.reduce(
      (sum, { opportunity_count: count }) => sum + count,
      0,
    ),
    shared_source_lineage_digest:
      first.manifest.shared_baseline.source_lineage_digest,
    shared_baseline_fingerprint:
      first.manifest.shared_baseline.experiment_baseline_fingerprint,
    shared_evaluation_charter_fingerprint:
      first.manifest.shared_baseline.evaluation_charter_fingerprint,
    shared_budget_digest: sharedBudgetDigest,
    shared_execution_policy_digest: sharedExecutionPolicyDigest,
    partitions: first.manifest.partitions,
    variants: firstVariants,
    scenarios,
  } as const;
  return { ...unsigned, manifest_digest: digest(unsigned) };
}

function blocked(
  input: InternalPaperCounterfactualCostStressInput,
  reasons: InternalPaperCounterfactualCostStressBlockReason[],
  blockedScenarioId: string | null = null,
): InternalPaperCounterfactualCostStressResult {
  return terminal({
    result_version: INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_RESULT_VERSION,
    stress_version: INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_VERSION,
    status: "blocked" as const,
    reason_codes: Array.from(new Set(reasons)).sort(),
    matrix_id: UUID_PATTERN.test(input.manifest.matrix_id)
      ? input.manifest.matrix_id
      : null,
    manifest_digest: SHA256_PATTERN.test(input.manifest.manifest_digest)
      ? input.manifest.manifest_digest
      : null,
    blocked_scenario_id: blockedScenarioId,
    authority: AUTHORITY,
  });
}

function round(value: number) {
  return Number(value.toFixed(6));
}

export function verifyInternalPaperCounterfactualCostStressDigest(
  result: InternalPaperCounterfactualCostStressResult,
) {
  const { result_digest: resultDigest, ...payload } = result;
  return SHA256_PATTERN.test(resultDigest) && digest(payload) === resultDigest;
}

/**
 * Reruns every frozen scenario and reports diagnostic worst-case paired deltas.
 * A positive diagnostic never promotes a strategy or changes runtime policy.
 */
export function runInternalPaperCounterfactualCostStress(
  input: InternalPaperCounterfactualCostStressInput,
): InternalPaperCounterfactualCostStressResult {
  if (
    input.stress_version !== INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_VERSION ||
    input.manifest.manifest_version !==
      INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_MANIFEST_VERSION ||
    !UUID_PATTERN.test(input.manifest.matrix_id)
  ) {
    return blocked(input, ["cost_stress_identity_invalid"]);
  }
  if (
    !SHA256_PATTERN.test(input.manifest.manifest_digest) ||
    digest(unsignedManifest(input.manifest)) !== input.manifest.manifest_digest
  ) {
    return blocked(input, ["cost_stress_manifest_digest_mismatch"]);
  }
  const rebuilt = buildInternalPaperCounterfactualCostStressManifest({
    matrix_id: input.manifest.matrix_id,
    frozen_at: input.manifest.frozen_at,
    scenarios: input.scenarios,
  });
  if (!rebuilt || rebuilt.manifest_digest !== input.manifest.manifest_digest) {
    return blocked(input, ["cost_stress_manifest_input_mismatch"]);
  }

  const inputById = new Map(
    input.scenarios.map((scenario) => [scenario.scenario_id, scenario]),
  );
  const completed = [] as Array<{
    scenario_id: string;
    result: Extract<
      ReturnType<typeof runInternalPaperCounterfactualFamily>,
      { status: "completed" }
    >;
  }>;
  for (const binding of input.manifest.scenarios) {
    const result = runInternalPaperCounterfactualFamily(
      inputById.get(binding.scenario_id)!.family,
    );
    if (result.status !== "completed") {
      return blocked(input, ["cost_stress_family_blocked"], binding.scenario_id);
    }
    completed.push({ scenario_id: binding.scenario_id, result });
  }

  const variants: InternalPaperCounterfactualCostStressVariantResult[] = [];
  for (const binding of input.manifest.variants) {
    const scenarioResults = completed.map(({ scenario_id, result }) => {
      const variant = result.variants.find(
        (item) => item.variant_id === binding.variant_id,
      );
      if (!variant) return null;
      return {
        scenario_id,
        family_result_digest: result.result_digest,
        candidate_result_digest: variant.candidate_result_digest,
        partitions: variant.partitions.map((partition) => ({
          partition: partition.partition,
          opportunity_count: partition.opportunity_count,
          rejected_count: partition.candidate.rejected_count,
          no_trade_count: partition.candidate.no_trade_count,
          paired_net_pnl_delta: partition.paired_deltas.realized_net_pnl,
          paired_execution_cost_delta: partition.paired_deltas.execution_cost,
          paired_maximum_drawdown_delta:
            partition.paired_deltas.maximum_drawdown,
        })),
      };
    });
    if (scenarioResults.some((result) => result === null)) {
      return blocked(input, ["cost_stress_variant_result_mismatch"]);
    }
    const exact = scenarioResults as Exclude<
      (typeof scenarioResults)[number],
      null
    >[];
    const partitionStress = PARTITIONS.map((partition) => {
      const values = exact.map(
        (scenario) =>
          scenario.partitions.find((item) => item.partition === partition)!,
      );
      const netPnl = values.map(
        ({ paired_net_pnl_delta }) => paired_net_pnl_delta,
      );
      return {
        partition,
        scenario_count: values.length,
        minimum_paired_net_pnl_delta: round(Math.min(...netPnl)),
        maximum_paired_execution_cost_delta: round(
          Math.max(
            ...values.map(
              ({ paired_execution_cost_delta }) => paired_execution_cost_delta,
            ),
          ),
        ),
        worst_paired_maximum_drawdown_delta: round(
          Math.max(
            ...values.map(
              ({ paired_maximum_drawdown_delta }) =>
                paired_maximum_drawdown_delta,
            ),
          ),
        ),
        scenarios_with_positive_net_pnl_delta: netPnl.filter(
          (value) => value > 0,
        ).length,
        positive_net_pnl_in_every_scenario: netPnl.every((value) => value > 0),
      } satisfies PartitionStress;
    });
    variants.push({
      variant_id: binding.variant_id,
      intervention_dimension: binding.intervention_dimension,
      scenarios: exact,
      partition_stress: partitionStress,
    });
  }

  return terminal({
    result_version: INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_RESULT_VERSION,
    stress_version: INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_VERSION,
    status: "completed" as const,
    reason_codes: [] as [],
    scientific_disposition:
      "replay_cost_stress_diagnostic_not_strategy_accepted" as const,
    matrix_id: input.manifest.matrix_id,
    manifest_digest: input.manifest.manifest_digest,
    variants,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}
