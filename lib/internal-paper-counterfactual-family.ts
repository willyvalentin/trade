import { createHash } from "node:crypto";

import {
  buildInternalPaperReplayExperimentManifest,
  INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
  runInternalPaperReplayExperiment,
  type InternalPaperReplayExperimentInput,
  type InternalPaperReplayExperimentPartition,
  type InternalPaperReplayExperimentPartitionResult,
} from "@/lib/internal-paper-replay-experiment";

export const INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION =
  "internal_paper_counterfactual_family_v1" as const;
export const INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_MANIFEST_VERSION =
  "internal_paper_counterfactual_family_manifest_v1" as const;
export const INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_RESULT_VERSION =
  "internal_paper_counterfactual_family_result_v1" as const;

export type InternalPaperCounterfactualInterventionDimension =
  | "admission"
  | "entry"
  | "stop"
  | "exit"
  | "sizing";

export type InternalPaperCounterfactualVariantInput = Readonly<{
  variant_id: string;
  intervention_dimension: InternalPaperCounterfactualInterventionDimension;
  experiment: InternalPaperReplayExperimentInput;
}>;

type SharedBaselineBinding = Readonly<{
  corpus_id: string;
  corpus_manifest_digest: string;
  corpus_input_digest: string;
  account_policy_digest: string;
  execution_policy_digest: string;
  source_lineage_digest: string;
  experiment_baseline_fingerprint: string;
  evaluation_charter_fingerprint: string;
  opportunity_population_digest: string;
  opportunity_count: number;
}>;

export type InternalPaperCounterfactualVariantBinding = Readonly<{
  variant_id: string;
  intervention_dimension: InternalPaperCounterfactualInterventionDimension;
  experiment_id: string;
  experiment_manifest_digest: string;
  candidate_corpus_id: string;
  candidate_corpus_manifest_digest: string;
  candidate_policy_lineage_digest: string;
  candidate_input_digest: string;
  candidate_market_evidence_digest: string;
  baseline_intervention_digest: string;
  candidate_intervention_digest: string;
  portfolio_identity: string;
}>;

export type InternalPaperCounterfactualFamilyManifest = Readonly<{
  manifest_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_MANIFEST_VERSION;
  family_id: string;
  frozen_at: string;
  cost_fill_scenario_id: string;
  portfolio_isolation: "pure_replay_per_variant_no_shared_capital_v1";
  shared_baseline: SharedBaselineBinding;
  partitions: ReadonlyArray<
    Readonly<{
      partition: InternalPaperReplayExperimentPartition;
      trading_dates: string[];
      opportunity_count: number;
    }>
  >;
  variants: InternalPaperCounterfactualVariantBinding[];
  manifest_digest: string;
}>;

export type InternalPaperCounterfactualFamilyManifestInput = Readonly<{
  family_id: string;
  frozen_at: string;
  cost_fill_scenario_id: string;
  variants: ReadonlyArray<InternalPaperCounterfactualVariantInput>;
}>;

export type InternalPaperCounterfactualFamilyInput = Readonly<{
  family_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION;
  manifest: InternalPaperCounterfactualFamilyManifest;
  variants: ReadonlyArray<InternalPaperCounterfactualVariantInput>;
}>;

type Authority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_promote_strategy: false;
  can_execute_broker_action: false;
}>;

export type InternalPaperCounterfactualVariantResult = Readonly<{
  variant_id: string;
  intervention_dimension: InternalPaperCounterfactualInterventionDimension;
  portfolio_identity: string;
  experiment_id: string;
  experiment_result_digest: string;
  baseline_result_digest: string;
  candidate_result_digest: string;
  partitions: ReadonlyArray<
    InternalPaperReplayExperimentPartitionResult & {
      opportunity_count: number;
    }
  >;
}>;

export type InternalPaperCounterfactualFamilyBlockReason =
  | "counterfactual_family_identity_invalid"
  | "counterfactual_family_manifest_digest_mismatch"
  | "counterfactual_family_manifest_input_mismatch"
  | "counterfactual_variant_experiment_blocked"
  | "counterfactual_variant_opportunity_denominator_mismatch"
  | "shared_baseline_result_mismatch";

export type InternalPaperCounterfactualFamilyResult =
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_RESULT_VERSION;
      family_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION;
      status: "blocked";
      reason_codes: InternalPaperCounterfactualFamilyBlockReason[];
      family_id: string | null;
      manifest_digest: string | null;
      blocked_variant_id: string | null;
      authority: Authority;
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_RESULT_VERSION;
      family_version: typeof INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION;
      status: "completed";
      reason_codes: [];
      scientific_disposition:
        "replay_counterfactual_family_not_strategy_accepted";
      family_id: string;
      manifest_digest: string;
      shared_baseline_result_digest: string;
      variants: InternalPaperCounterfactualVariantResult[];
      evidence_limits: readonly [
        "single_frozen_cost_fill_scenario_only",
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
const DIMENSIONS = ["admission", "entry", "stop", "exit", "sizing"] as const;
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
  "single_frozen_cost_fill_scenario_only",
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

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function nonemptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function terminal<T extends object>(value: T): T & { result_digest: string } {
  return { ...value, result_digest: digest(value) };
}

function manifestWithoutDigest(manifest: InternalPaperCounterfactualFamilyManifest) {
  const { manifest_digest: manifestDigest, ...unsigned } = manifest;
  void manifestDigest;
  return unsigned;
}

type ProjectionDimension = InternalPaperCounterfactualInterventionDimension;

function corpusProjections(
  corpus: InternalPaperReplayExperimentInput["baseline"],
) {
  const rows = corpus.sessions.flatMap((session) =>
    session.decisions.map((item) => {
      const execution = item.execution;
      const entry = execution?.base_replay.entry ?? null;
      return {
        identity: {
          trading_date: session.trading_date,
          scan_run_id: item.decision.scan_run_id,
          scan_run_fingerprint: item.decision.scan_run_fingerprint,
        },
        admission: {
          final_disposition: item.decision.final_decision.disposition,
          published_tickers: [...item.decision.final_decision.published_tickers].sort(),
          no_trade_reason: item.decision.final_decision.no_trade_reason,
          candidates: item.decision.candidates
            .map((candidate) => ({
              candidate_id: candidate.candidate_id,
              ticker: candidate.ticker.trim().toUpperCase(),
              disposition: candidate.disposition,
              eligibility: candidate.eligibility,
              reason_codes: [...candidate.reason_codes].sort(),
            }))
            .sort((left, right) =>
              left.candidate_id.localeCompare(right.candidate_id),
            ),
          execution_present: execution !== null,
          rejection_reason_codes: [...item.rejection_reason_codes].sort(),
        },
        entry: execution
          ? {
              arrival_price: entry!.arrival_price,
              submitted_at: entry!.submitted_at,
              order_type: execution.policy.order_type,
              time_in_force: execution.policy.time_in_force,
              limit_price: execution.policy.limit_price,
              latency_ms: execution.policy.latency_ms,
              max_volume_participation_bps:
                execution.policy.max_volume_participation_bps,
              minimum_fill_quantity: execution.policy.minimum_fill_quantity,
              maximum_order_quantity: execution.policy.maximum_order_quantity,
            }
          : null,
        stop: execution ? { stop_price: entry!.stop_price } : null,
        exit: execution
          ? {
              target_price: entry!.target_price,
              target_exit_fraction_bps:
                execution.base_replay.account.target_exit_fraction_bps,
            }
          : null,
        sizing: execution ? { quantity: entry!.quantity } : null,
        market_evidence: execution
          ? {
              dataset: execution.base_replay.dataset,
              candles: execution.base_replay.candles,
            }
          : null,
      };
    }),
  );
  const dimensions = Object.fromEntries(
    DIMENSIONS.map((dimension) => [
      dimension,
      rows.map((row) => ({ identity: row.identity, value: row[dimension] })),
    ]),
  ) as Record<ProjectionDimension, unknown>;
  return {
    dimensions,
    marketEvidence: rows.map((row) => ({
      identity: row.identity,
      value: row.market_evidence,
    })),
  };
}

function experimentManifestMatchesInput(
  experiment: InternalPaperReplayExperimentInput,
) {
  if (
    experiment.experiment_version !== INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION
  ) {
    return false;
  }
  const rebuilt = buildInternalPaperReplayExperimentManifest({
    experiment_id: experiment.manifest.experiment_id,
    frozen_at: experiment.manifest.frozen_at,
    baseline_fingerprint: experiment.manifest.baseline_fingerprint,
    evaluation_charter_fingerprint:
      experiment.manifest.evaluation_charter_fingerprint,
    primary_outcome_horizon_minutes:
      experiment.manifest.primary_outcome_horizon_minutes,
    baseline: experiment.baseline,
    candidate: experiment.candidate,
    partitions: experiment.manifest.sessions.map(({ trading_date, partition }) => ({
      trading_date,
      partition,
    })),
  });
  return rebuilt?.manifest_digest === experiment.manifest.manifest_digest;
}

function opportunityPopulation(manifest: InternalPaperReplayExperimentInput["manifest"]) {
  return manifest.sessions.map(
    ({
      sequence,
      trading_date,
      session_open,
      session_close,
      partition,
      opportunity_set_digest,
      opportunity_count,
      baseline_session_input_digest,
    }) => ({
      sequence,
      trading_date,
      session_open,
      session_close,
      partition,
      opportunity_set_digest,
      opportunity_count,
      baseline_session_input_digest,
    }),
  );
}

function partitionBindings(
  manifest: InternalPaperReplayExperimentInput["manifest"],
) {
  return PARTITIONS.map((partition) => {
    const sessions = manifest.sessions.filter(
      (session) => session.partition === partition,
    );
    return {
      partition,
      trading_dates: sessions.map(({ trading_date }) => trading_date),
      opportunity_count: sessions.reduce(
        (sum, { opportunity_count: count }) => sum + count,
        0,
      ),
    };
  });
}

function interventionIsBound(
  variant: InternalPaperCounterfactualVariantInput,
) {
  const baseline = corpusProjections(variant.experiment.baseline);
  const candidate = corpusProjections(variant.experiment.candidate);
  const dimension = variant.intervention_dimension;
  const baselineSelected = digest(baseline.dimensions[dimension]);
  const candidateSelected = digest(candidate.dimensions[dimension]);
  if (baselineSelected === candidateSelected) return false;

  if (dimension === "admission") return true;
  if (
    digest(baseline.dimensions.admission) !==
      digest(candidate.dimensions.admission) ||
    digest(baseline.marketEvidence) !== digest(candidate.marketEvidence)
  ) {
    return false;
  }
  return DIMENSIONS.filter(
    (item) => item !== "admission" && item !== dimension,
  ).every(
    (item) =>
      digest(baseline.dimensions[item]) === digest(candidate.dimensions[item]),
  );
}

/**
 * Freezes a family before any child result is inspected. Each alternative must
 * use the exact same baseline, opportunity population, account budget and
 * cost/fill policy. Mechanical alternatives may change only their declared
 * intervention dimension; admission alternatives retain explicit no-trade and
 * rejected opportunities in the shared denominator.
 */
export function buildInternalPaperCounterfactualFamilyManifest(
  input: InternalPaperCounterfactualFamilyManifestInput,
): InternalPaperCounterfactualFamilyManifest | null {
  if (
    !UUID_PATTERN.test(input.family_id) ||
    !explicitInstant(input.frozen_at) ||
    !nonemptyText(input.cost_fill_scenario_id) ||
    input.variants.length < 2 ||
    input.variants.length > 8 ||
    new Set(input.variants.map(({ variant_id }) => variant_id)).size !==
      input.variants.length ||
    input.variants.some(
      ({ variant_id, intervention_dimension, experiment }) =>
        !UUID_PATTERN.test(variant_id) ||
        !DIMENSIONS.includes(intervention_dimension) ||
        !experimentManifestMatchesInput(experiment) ||
        Date.parse(input.frozen_at) < Date.parse(experiment.manifest.frozen_at),
    )
  ) {
    return null;
  }

  const ordered = [...input.variants].sort((left, right) =>
    left.variant_id.localeCompare(right.variant_id),
  );
  const first = ordered[0]!;
  const baselineInputDigest = digest(first.experiment.baseline);
  const opportunity = opportunityPopulation(first.experiment.manifest);
  const populationDigest = digest(opportunity);
  const sharedAccountDigest = digest(first.experiment.baseline.account);
  const sharedExecutionDigest = digest(
    first.experiment.baseline.execution_policy,
  );
  const candidateMarketEvidenceDigests = ordered.map((variant) =>
    digest(corpusProjections(variant.experiment.candidate).marketEvidence),
  );

  if (
    ordered.some((variant) => {
      const { experiment } = variant;
      return (
        digest(experiment.baseline) !== baselineInputDigest ||
        digest(opportunityPopulation(experiment.manifest)) !== populationDigest ||
        experiment.manifest.baseline_fingerprint !==
          first.experiment.manifest.baseline_fingerprint ||
        experiment.manifest.evaluation_charter_fingerprint !==
          first.experiment.manifest.evaluation_charter_fingerprint ||
        experiment.manifest.source_lineage_digest !==
          first.experiment.manifest.source_lineage_digest ||
        experiment.manifest.baseline.account_policy_digest !==
          sharedAccountDigest ||
        experiment.manifest.candidate.account_policy_digest !==
          sharedAccountDigest ||
        experiment.manifest.baseline.execution_policy_digest !==
          sharedExecutionDigest ||
        experiment.manifest.candidate.execution_policy_digest !==
          sharedExecutionDigest ||
        !interventionIsBound(variant)
      );
    }) ||
    new Set(
      ordered.map(({ experiment }) => experiment.manifest.candidate.corpus_id),
    ).size !== ordered.length ||
    new Set(
      ordered.map(
        ({ experiment }) => experiment.manifest.candidate.corpus_manifest_digest,
      ),
    ).size !== ordered.length ||
    new Set(
      ordered.map(({ experiment }) =>
        digest(experiment.manifest.candidate.policy_lineage),
      ),
    ).size !== ordered.length ||
    new Set(candidateMarketEvidenceDigests).size !== 1
  ) {
    return null;
  }

  const variants = ordered.map((variant, index) => {
    const baselineProjection = corpusProjections(variant.experiment.baseline);
    const candidateProjection = corpusProjections(variant.experiment.candidate);
    const dimension = variant.intervention_dimension;
    return {
      variant_id: variant.variant_id,
      intervention_dimension: dimension,
      experiment_id: variant.experiment.manifest.experiment_id,
      experiment_manifest_digest: variant.experiment.manifest.manifest_digest,
      candidate_corpus_id: variant.experiment.candidate.corpus_id,
      candidate_corpus_manifest_digest:
        variant.experiment.candidate.manifest.manifest_digest,
      candidate_policy_lineage_digest: digest(
        variant.experiment.manifest.candidate.policy_lineage,
      ),
      candidate_input_digest: digest(variant.experiment.candidate),
      candidate_market_evidence_digest: candidateMarketEvidenceDigests[index]!,
      baseline_intervention_digest: digest(
        baselineProjection.dimensions[dimension],
      ),
      candidate_intervention_digest: digest(
        candidateProjection.dimensions[dimension],
      ),
      portfolio_identity: digest({
        family_id: input.family_id,
        variant_id: variant.variant_id,
        candidate_corpus_id: variant.experiment.candidate.corpus_id,
        candidate_input_digest: digest(variant.experiment.candidate),
      }),
    } satisfies InternalPaperCounterfactualVariantBinding;
  });

  const unsigned = {
    manifest_version: INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_MANIFEST_VERSION,
    family_id: input.family_id,
    frozen_at: input.frozen_at,
    cost_fill_scenario_id: input.cost_fill_scenario_id.trim(),
    portfolio_isolation: "pure_replay_per_variant_no_shared_capital_v1" as const,
    shared_baseline: {
      corpus_id: first.experiment.baseline.corpus_id,
      corpus_manifest_digest:
        first.experiment.baseline.manifest.manifest_digest,
      corpus_input_digest: baselineInputDigest,
      account_policy_digest: sharedAccountDigest,
      execution_policy_digest: sharedExecutionDigest,
      source_lineage_digest: first.experiment.manifest.source_lineage_digest,
      experiment_baseline_fingerprint:
        first.experiment.manifest.baseline_fingerprint,
      evaluation_charter_fingerprint:
        first.experiment.manifest.evaluation_charter_fingerprint,
      opportunity_population_digest: populationDigest,
      opportunity_count: opportunity.reduce(
        (sum, { opportunity_count: count }) => sum + count,
        0,
      ),
    },
    partitions: partitionBindings(first.experiment.manifest),
    variants,
  } as const;
  return { ...unsigned, manifest_digest: digest(unsigned) };
}

function blocked(
  input: InternalPaperCounterfactualFamilyInput,
  reasons: InternalPaperCounterfactualFamilyBlockReason[],
  blockedVariantId: string | null = null,
): InternalPaperCounterfactualFamilyResult {
  return terminal({
    result_version: INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_RESULT_VERSION,
    family_version: INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION,
    status: "blocked" as const,
    reason_codes: Array.from(new Set(reasons)).sort(),
    family_id: UUID_PATTERN.test(input.manifest.family_id)
      ? input.manifest.family_id
      : null,
    manifest_digest: SHA256_PATTERN.test(input.manifest.manifest_digest)
      ? input.manifest.manifest_digest
      : null,
    blocked_variant_id: blockedVariantId,
    authority: AUTHORITY,
  });
}

export function verifyInternalPaperCounterfactualFamilyDigest(
  result: InternalPaperCounterfactualFamilyResult,
) {
  const { result_digest: resultDigest, ...payload } = result;
  return SHA256_PATTERN.test(resultDigest) && digest(payload) === resultDigest;
}

/**
 * Reruns every frozen child experiment independently. No state is shared among
 * candidate portfolios, and a missing reject/no-trade denominator blocks the
 * family instead of silently comparing only executed positions.
 */
export function runInternalPaperCounterfactualFamily(
  input: InternalPaperCounterfactualFamilyInput,
): InternalPaperCounterfactualFamilyResult {
  if (
    input.family_version !== INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION ||
    input.manifest.manifest_version !==
      INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_MANIFEST_VERSION ||
    !UUID_PATTERN.test(input.manifest.family_id)
  ) {
    return blocked(input, ["counterfactual_family_identity_invalid"]);
  }
  if (
    !SHA256_PATTERN.test(input.manifest.manifest_digest) ||
    digest(manifestWithoutDigest(input.manifest)) !== input.manifest.manifest_digest
  ) {
    return blocked(input, ["counterfactual_family_manifest_digest_mismatch"]);
  }
  const rebuilt = buildInternalPaperCounterfactualFamilyManifest({
    family_id: input.manifest.family_id,
    frozen_at: input.manifest.frozen_at,
    cost_fill_scenario_id: input.manifest.cost_fill_scenario_id,
    variants: input.variants,
  });
  if (!rebuilt || rebuilt.manifest_digest !== input.manifest.manifest_digest) {
    return blocked(input, ["counterfactual_family_manifest_input_mismatch"]);
  }

  const byId = new Map(input.variants.map((variant) => [variant.variant_id, variant]));
  const results: InternalPaperCounterfactualVariantResult[] = [];
  let sharedBaselineResultDigest: string | null = null;
  for (const binding of input.manifest.variants) {
    const variant = byId.get(binding.variant_id)!;
    const result = runInternalPaperReplayExperiment(variant.experiment);
    if (result.status !== "completed") {
      return blocked(
        input,
        ["counterfactual_variant_experiment_blocked"],
        binding.variant_id,
      );
    }
    if (
      sharedBaselineResultDigest !== null &&
      sharedBaselineResultDigest !== result.baseline_result_digest
    ) {
      return blocked(input, ["shared_baseline_result_mismatch"], binding.variant_id);
    }
    sharedBaselineResultDigest = result.baseline_result_digest;

    const partitionBindingsByName = new Map(
      input.manifest.partitions.map((partition) => [partition.partition, partition]),
    );
    if (
      result.partitions.some((partition) => {
        const expected = partitionBindingsByName.get(partition.partition);
        return (
          !expected ||
          partition.baseline.decision_count !== expected.opportunity_count ||
          partition.candidate.decision_count !== expected.opportunity_count
        );
      })
    ) {
      return blocked(
        input,
        ["counterfactual_variant_opportunity_denominator_mismatch"],
        binding.variant_id,
      );
    }

    results.push({
      variant_id: binding.variant_id,
      intervention_dimension: binding.intervention_dimension,
      portfolio_identity: binding.portfolio_identity,
      experiment_id: result.experiment_id,
      experiment_result_digest: result.result_digest,
      baseline_result_digest: result.baseline_result_digest,
      candidate_result_digest: result.candidate_result_digest,
      partitions: result.partitions.map((partition) => ({
        ...partition,
        opportunity_count:
          partitionBindingsByName.get(partition.partition)!.opportunity_count,
      })),
    });
  }

  return terminal({
    result_version: INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_RESULT_VERSION,
    family_version: INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION,
    status: "completed" as const,
    reason_codes: [] as [],
    scientific_disposition:
      "replay_counterfactual_family_not_strategy_accepted" as const,
    family_id: input.manifest.family_id,
    manifest_digest: input.manifest.manifest_digest,
    shared_baseline_result_digest: sharedBaselineResultDigest!,
    variants: results,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}
