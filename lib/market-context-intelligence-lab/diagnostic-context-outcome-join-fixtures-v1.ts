import {
  DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
} from "./databento-explicit-nanosecond-instant-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_POINT_IN_TIME_POLICY_V1,
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V2,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_RESULT_V2,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2,
  type MarketContextDiagnosticContextSnapshotV2,
} from "./diagnostic-context-feature-snapshot-v2";
import {
  MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1,
} from "./diagnostic-context-trusted-source-registry-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_HANDOFF_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1,
  createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
  createMarketContextDiagnosticContextOutcomeJoinBatchV1,
  createMarketContextDiagnosticContextOutcomeJoinV1,
  marketContextDiagnosticOutcomeBundleDigestV1,
  type MarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
  type MarketContextDiagnosticContextOutcomeAuthorityV1,
  type MarketContextDiagnosticContextOutcomeJoinRequestV1,
  type MarketContextDiagnosticContextSnapshotHandoffV1,
  type MarketContextDiagnosticOutcomeBundleHandoffV1,
} from "./diagnostic-context-outcome-join-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_SYNTHETIC_FIXTURES_V1 =
  "market_context_diagnostic_context_outcome_synthetic_fixtures_v1" as const;

const DECISION_UNIX_NS = (
  BigInt(Date.parse("2026-01-05T15:30:00.000Z")) * BigInt(1_000_000)
).toString();
const LATEST_FINALIZED_UNIX_NS = (
  BigInt(DECISION_UNIX_NS) - BigInt(2_000_000_000)
).toString();

function sha(value: unknown) {
  return marketContextDiagnosticContextSha256V1(value);
}

function rehash<T extends Record<string, unknown>>(
  value: T,
  digestField: string,
) {
  const material = Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== digestField),
  );
  return {
    ...value,
    [digestField]: sha(material),
  } as T;
}

export function rehashSyntheticContextSnapshotV2(
  snapshot: MarketContextDiagnosticContextSnapshotV2,
) {
  return rehash(
    snapshot as unknown as Record<string, unknown>,
    "feature_snapshot_digest",
  ) as unknown as MarketContextDiagnosticContextSnapshotV2;
}

export function rehashSyntheticContextHandoffV1(
  handoff: MarketContextDiagnosticContextSnapshotHandoffV1,
) {
  return rehash(
    handoff as unknown as Record<string, unknown>,
    "handoff_digest",
  ) as unknown as MarketContextDiagnosticContextSnapshotHandoffV1;
}

export function rehashSyntheticOutcomeBundleV1(
  bundle: MarketContextDiagnosticOutcomeBundleHandoffV1,
) {
  const membership = [...bundle.opportunity_set.membership].sort(
    (left, right) =>
      left.ordinal - right.ordinal ||
      left.instrument_id.localeCompare(right.instrument_id),
  );
  const withMembership = {
    ...bundle,
    opportunity_set: {
      ...bundle.opportunity_set,
      membership,
      membership_digest: sha(membership),
    },
  };
  const material = Object.fromEntries(
    Object.entries(withMembership).filter(([key]) => key !== "bundle_digest"),
  ) as Omit<MarketContextDiagnosticOutcomeBundleHandoffV1, "bundle_digest">;
  return {
    ...withMembership,
    bundle_digest: marketContextDiagnosticOutcomeBundleDigestV1(material),
  };
}

export function buildSyntheticContextSnapshotV2(
  taxonomy: MarketContextDiagnosticContextSnapshotV2["taxonomy"] = "mapped",
) {
  const context =
    taxonomy === "mapped"
      ? {
          regime_classification: "neutral_balanced",
          evidence_strength: "moderate",
          calibrated_probability: false as const,
          regime_components: {
            trend: "neutral",
            risk: "balanced",
            volatility: "normal",
            breadth: "mixed",
          },
          sector_contexts: [
            {
              sector: "XLK",
              classification: "strong",
              rankability: "rankable",
            },
          ],
          sector_rankability: {
            rankable_count: 11,
            not_rankable_count: 0,
          },
          breadth: {
            state: "mixed",
            not_full_market_breadth: true as const,
            declared_sector_etf_count: 11 as const,
          },
          volatility_and_context: {
            volatility_state: "normal",
            intraday_context: "neutral",
            multi_day_context: "neutral",
            spy_qqq_agreement: "agree",
          },
          available_candle_window: {
            session_id: "2026-01-05",
            finalized_minute_count: 60,
            observed_candle_count: 780,
            prior_session_count: 5,
            current_full_day_aggregation_used: false as const,
          },
          gaps_and_coverage: {
            explicit_gap_count: 0,
            benchmark_gap_count: 0,
            sector_gap_count: 0,
            coverage: { state: "complete" },
            freshness: { state: "fresh" },
            forward_fill_used: false as const,
            pending_buckets_counted_as_missing: false as const,
          },
          provider_context_timestamps: [
            {
              source_timestamp: "2026-01-05T15:29:57.000000000Z",
              received_timestamp: "2026-01-05T15:29:57.000000100Z",
            },
          ],
          reason_codes: ["synthetic_context_fixture"],
          quality_flags: ["diagnostic_only"],
        }
      : null;
  const material = {
    contract_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
    result_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_RESULT_V2,
    envelope_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_ENVELOPE_V2,
    taxonomy,
    decision_identity: {
      external_decision_id: "synthetic-decision-001",
      session_id: "2026-01-05",
      symbol_identity: "SPY",
      opportunity_set_identity: "synthetic-opportunity-set-001",
    },
    decision_unix_ns: DECISION_UNIX_NS,
    decision_source: {
      contract: "synthetic_decision_bundle_v1",
      version: "synthetic_decision_bundle_2026_v1",
    },
    point_in_time: {
      policy_version:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_POINT_IN_TIME_POLICY_V1,
      latest_finalized_bucket_unix_ns: LATEST_FINALIZED_UNIX_NS,
      provider_timestamp_after_decision_count: 0,
      future_input_points_passed_to_core: 0,
      record_finalization_violation_count: 0,
      current_full_day_aggregation_used: false,
      excluded_future_candle_count: 2,
      excluded_future_gap_count: 1,
      excluded_later_session_row_count: 13,
      finalization_policy_version:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2,
      candle_bucket_end_after_finalized_boundary_count: 0,
      finalization_timestamp_after_decision_count: 0,
      pending_buckets_counted_as_missing: false as const,
    },
    context,
    identities: {
      trusted_source_registry: {
        authority_version:
          MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1,
        registry_identity: "synthetic-n2a-source-registry-v1",
        registry_version:
          MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1,
        registry_digest: sha("synthetic-n2a-source-registry"),
        verification_status: "verified" as const,
      },
      normalized_dataset: {
        identity: "synthetic-normalized-dataset-v1",
        dataset_digest: sha("synthetic-normalized-dataset"),
        output_tree_digest: sha("synthetic-normalized-output-tree"),
        lineage_digest: sha("synthetic-normalized-lineage"),
        manifest_digest: sha("synthetic-normalized-manifest"),
      },
      replay: {
        identity: "synthetic-replay-dataset-v1",
        dataset_digest: sha("synthetic-replay-dataset"),
        output_tree_digest: sha("synthetic-replay-output-tree"),
        manifest_digest: sha("synthetic-replay-manifest"),
        core_evidence_digest: sha("synthetic-replay-core-evidence"),
      },
      source_decision_sha256: sha("synthetic-source-decision"),
      calendar: {
        identity: "synthetic-xnys-calendar-v1",
        digest: sha("synthetic-xnys-calendar"),
      },
      policy_bundle: {
        diagnostic_candle_policy: "synthetic_diagnostic_candle_policy_v1",
        replay_contract: "synthetic_replay_contract_v1",
        replay_schedule: "synthetic_replay_schedule_v1",
        market_context_contract:
          "market_context_intelligence_v2",
        market_context_thresholds:
          "market_context_intelligence_thresholds_2026_07_26_v2",
        watermark_policy: "synthetic_provisional_watermark_v1",
        provisional_watermark_ns: "2000000000",
        watermark_status: "empirically_unvalidated" as const,
        instant_parser:
          DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      },
    },
    reason_codes:
      taxonomy === "mapped"
        ? ["synthetic_context_fixture"]
        : [`synthetic_${taxonomy}`],
    boundary: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
    compatibility: {
      predecessor_contract:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
      predecessor_snapshots_implicitly_remediated: false as const,
    },
  };
  return {
    ...material,
    feature_snapshot_digest: sha(material),
  } satisfies MarketContextDiagnosticContextSnapshotV2;
}

export function buildSyntheticContextHandoffV1(
  snapshot: MarketContextDiagnosticContextSnapshotV2,
) {
  const material = {
    handoff_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_HANDOFF_V1,
    snapshot_identity: "synthetic-context-snapshot-001",
    snapshot,
    snapshot_verifier: {
      contract:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
      version: "synthetic_n2a_snapshot_verifier_v1",
      evidence_digest: sha("synthetic-n2a-verification-evidence"),
    },
  };
  return {
    ...material,
    handoff_digest: sha(material),
  } satisfies MarketContextDiagnosticContextSnapshotHandoffV1;
}

export function buildSyntheticOutcomeBundleV1(
  status: "completed" | "pending" = "completed",
) {
  const membership = [
    { instrument_id: "QQQ", ordinal: 0 },
    { instrument_id: "SPY", ordinal: 1 },
    { instrument_id: "XLK", ordinal: 2 },
  ];
  const material = {
    handoff_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1,
    outcome_identity: "synthetic-outcome-001",
    decision_identity: {
      external_decision_id: "synthetic-decision-001",
      decision_unix_ns: DECISION_UNIX_NS,
      instrument_id: "SPY",
    },
    opportunity_set: {
      identity: "synthetic-opportunity-set-001",
      completeness: "complete" as const,
      membership,
      membership_digest: sha(membership),
    },
    versions: {
      baseline: "synthetic-baseline-v1",
      candidate: "synthetic-candidate-v1",
      evaluator: "synthetic-evaluator-v1",
    },
    outcome_window: {
      definition: "decision_plus_1ns_through_60m",
      start_timestamp: "2026-01-05T15:30:00.000000001Z",
      end_timestamp: "2026-01-05T16:30:00.000000000Z",
    },
    outcome_completion: {
      status,
      completion_timestamp:
        status === "completed"
          ? "2026-01-05T16:30:00.000000000Z"
          : null,
      evidence_digest: sha(`synthetic-completion-${status}`),
    },
    evaluation: {
      capture_timestamp: "2026-01-05T16:30:00.000000001Z",
      evaluator_run_digest: sha("synthetic-evaluator-run"),
    },
    definitions: {
      target: "synthetic_target_definition_v1",
      stop: "synthetic_stop_definition_v1",
      diagnostic_horizon: "synthetic_60m_horizon_v1",
    },
    cost_slippage: {
      status: "declared" as const,
      cost_model_version: "synthetic-cost-v1",
      slippage_model_version: "synthetic-slippage-v1",
      provenance_digest: sha("synthetic-cost-slippage-provenance"),
    },
    lineage: {
      provider_source: "synthetic-provider",
      provider_version: "synthetic-provider-v1",
      evaluator_lineage_digest: sha("synthetic-evaluator-lineage"),
      outcome_lineage_digest: sha("synthetic-outcome-lineage"),
    },
    membership: {
      period: "synthetic-period-2026-01",
      cohort: "synthetic-cohort-a",
      dataset: "synthetic-outcome-dataset-v1",
    },
    later_observed_outcome: {
      label: "diagnostic_target_observed",
      value: "0.50",
      unit: "R",
    },
  };
  return {
    ...material,
    bundle_digest: marketContextDiagnosticOutcomeBundleDigestV1(material),
  } satisfies MarketContextDiagnosticOutcomeBundleHandoffV1;
}

export type SyntheticContextOutcomeFixtureOptionsV1 = {
  context_taxonomy?: MarketContextDiagnosticContextSnapshotV2["taxonomy"];
  outcome_status?: "completed" | "pending";
  mutate_context?: (
    snapshot: MarketContextDiagnosticContextSnapshotV2,
  ) => void;
  mutate_outcome?: (
    bundle: MarketContextDiagnosticOutcomeBundleHandoffV1,
  ) => void;
  mutate_request?: (
    request: MarketContextDiagnosticContextOutcomeJoinRequestV1,
  ) => void;
};

export function createSyntheticContextOutcomeJoinFixtureV1(
  options: SyntheticContextOutcomeFixtureOptionsV1 = {},
) {
  let snapshot: MarketContextDiagnosticContextSnapshotV2 =
    buildSyntheticContextSnapshotV2(
    options.context_taxonomy ?? "mapped",
  );
  options.mutate_context?.(snapshot);
  snapshot = rehashSyntheticContextSnapshotV2(snapshot);
  const contextHandoff = buildSyntheticContextHandoffV1(snapshot);

  let outcomeBundle: MarketContextDiagnosticOutcomeBundleHandoffV1 =
    buildSyntheticOutcomeBundleV1(options.outcome_status ?? "completed");
  options.mutate_outcome?.(outcomeBundle);
  outcomeBundle = rehashSyntheticOutcomeBundleV1(outcomeBundle);

  const registry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity: "synthetic-context-outcome-authority-registry-v1",
      context_authority: {
        registry_identity:
          snapshot.identities.trusted_source_registry.registry_identity ??
          "invalid",
        registry_version:
          MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1,
        registry_digest:
          snapshot.identities.trusted_source_registry.registry_digest ?? "",
        verifier_version: contextHandoff.snapshot_verifier.version,
      },
      outcome_authority: {
        outcome_contract_version:
          MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1,
        verifier_version: "synthetic-outcome-verifier-v1",
        evaluator_version: "synthetic-evaluator-v1",
        evaluator_lineage_digest: sha("synthetic-evaluator-lineage"),
        authority_digest: sha("synthetic-outcome-authority"),
      },
      context_handoff_digests: {
        [contextHandoff.snapshot_identity]: contextHandoff.handoff_digest,
      },
      outcome_bundle_digests: {
        [outcomeBundle.outcome_identity]: outcomeBundle.bundle_digest,
      },
    });
  const authority: MarketContextDiagnosticContextOutcomeAuthorityV1 = {
    authority_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1,
    expected_registry_anchor: {
      registry_identity: registry.registry_identity,
      registry_version:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
      registry_digest: registry.registry_digest,
    },
    read_registry: () => structuredClone(registry),
    read_context_handoff: (identity) =>
      identity === contextHandoff.snapshot_identity
        ? { status: "resolved" as const, handoff: structuredClone(contextHandoff) }
        : { status: "not_found" as const },
    read_outcome_bundle: (identity) =>
      identity === outcomeBundle.outcome_identity
        ? { status: "resolved" as const, bundle: structuredClone(outcomeBundle) }
        : { status: "not_found" as const },
  };
  const request: MarketContextDiagnosticContextOutcomeJoinRequestV1 = {
    contract_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
    external_join_id: "synthetic-join-001",
    context_snapshot_identity: contextHandoff.snapshot_identity,
    outcome_identity: outcomeBundle.outcome_identity,
    decision_reference: {
      external_decision_id:
        snapshot.decision_identity.external_decision_id,
      decision_unix_ns: snapshot.decision_unix_ns,
      instrument_id: "SPY",
      opportunity_set_identity:
        outcomeBundle.opportunity_set.identity,
    },
  };
  options.mutate_request?.(request);
  return {
    fixture_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_SYNTHETIC_FIXTURES_V1,
    request,
    snapshot,
    context_handoff: contextHandoff,
    outcome_bundle: outcomeBundle,
    registry,
    authority,
  };
}

export function buildSyntheticContextOutcomeGoldenMatrixV1() {
  const valid = createSyntheticContextOutcomeJoinFixtureV1();
  const insufficient = createSyntheticContextOutcomeJoinFixtureV1({
    context_taxonomy: "insufficient_data",
  });
  const conflicting = createSyntheticContextOutcomeJoinFixtureV1({
    context_taxonomy: "conflicting",
  });
  const pending = createSyntheticContextOutcomeJoinFixtureV1({
    outcome_status: "pending",
  });
  const futureContext = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_context: (snapshot) => {
      snapshot.point_in_time.latest_finalized_bucket_unix_ns = (
        BigInt(snapshot.decision_unix_ns) + BigInt(1)
      ).toString();
    },
  });
  const unfinalized = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_context: (snapshot) => {
      snapshot.point_in_time
        .candle_bucket_end_after_finalized_boundary_count = 1;
    },
  });
  const identityMismatch = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_request: (request) => {
      request.decision_reference.opportunity_set_identity =
        "other-opportunity-set";
    },
  });
  const evaluatorMismatch = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_outcome: (bundle) => {
      bundle.lineage.evaluator_lineage_digest = sha(
        "unexpected-evaluator-lineage",
      );
    },
  });
  const malformedTimestamp = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_outcome: (bundle) => {
      bundle.outcome_window.start_timestamp = "2026-01-05T15:30:00";
    },
  });
  const unmappableOutcome = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_request: (request) => {
      request.outcome_identity = "unregistered-outcome";
    },
  });
  const substitutedRegistry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity: "synthetic-substituted-registry",
      context_authority: valid.registry.context_authority,
      outcome_authority: valid.registry.outcome_authority,
      context_handoff_digests:
        valid.registry.context_handoff_digests,
      outcome_bundle_digests:
        valid.registry.outcome_bundle_digests,
    });
  const tamperedOutcome = structuredClone(valid.outcome_bundle);
  tamperedOutcome.later_observed_outcome.value = "999.00";
  const rehashedTamperedOutcome =
    rehashSyntheticOutcomeBundleV1(tamperedOutcome);
  const cases = [
    {
      id: "valid_joined_row",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        valid.request,
        { enabled: true, kill_switch: false, authority: valid.authority },
      ),
    },
    {
      id: "insufficient_context_snapshot",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        insufficient.request,
        {
          enabled: true,
          kill_switch: false,
          authority: insufficient.authority,
        },
      ),
    },
    {
      id: "conflicting_context_snapshot",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        conflicting.request,
        {
          enabled: true,
          kill_switch: false,
          authority: conflicting.authority,
        },
      ),
    },
    {
      id: "incomplete_outcome",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        pending.request,
        { enabled: true, kill_switch: false, authority: pending.authority },
      ),
    },
    {
      id: "outcome_not_yet_complete",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        pending.request,
        { enabled: true, kill_switch: false, authority: pending.authority },
      ),
    },
    {
      id: "future_context_observation",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        futureContext.request,
        {
          enabled: true,
          kill_switch: false,
          authority: futureContext.authority,
        },
      ),
    },
    {
      id: "unfinalized_context_bucket",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        unfinalized.request,
        {
          enabled: true,
          kill_switch: false,
          authority: unfinalized.authority,
        },
      ),
    },
    {
      id: "decision_opportunity_identity_mismatch",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        identityMismatch.request,
        {
          enabled: true,
          kill_switch: false,
          authority: identityMismatch.authority,
        },
      ),
    },
    {
      id: "outcome_evaluator_lineage_mismatch",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        evaluatorMismatch.request,
        {
          enabled: true,
          kill_switch: false,
          authority: evaluatorMismatch.authority,
        },
      ),
    },
    {
      id: "registry_root_substitution",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        valid.request,
        {
          enabled: true,
          kill_switch: false,
          authority: cloneSyntheticAuthorityWithRegistryV1(
            valid,
            substitutedRegistry,
          ),
        },
      ),
    },
    {
      id: "self_consistently_recomputed_tampering",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        valid.request,
        {
          enabled: true,
          kill_switch: false,
          authority: {
            ...valid.authority,
            read_outcome_bundle: () => ({
              status: "resolved" as const,
              bundle: structuredClone(rehashedTamperedOutcome),
            }),
          },
        },
      ),
    },
    {
      id: "malformed_or_ambiguous_timestamp",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        malformedTimestamp.request,
        {
          enabled: true,
          kill_switch: false,
          authority: malformedTimestamp.authority,
        },
      ),
    },
    {
      id: "unmappable_outcome_reference",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        unmappableOutcome.request,
        {
          enabled: true,
          kill_switch: false,
          authority: unmappableOutcome.authority,
        },
      ),
    },
    {
      id: "default_off",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        valid.request,
        { enabled: false, kill_switch: false, authority: valid.authority },
      ),
    },
    {
      id: "kill_switch",
      result: createMarketContextDiagnosticContextOutcomeJoinV1(
        valid.request,
        { enabled: true, kill_switch: true, authority: valid.authority },
      ),
    },
  ];
  const duplicateResults =
    createMarketContextDiagnosticContextOutcomeJoinBatchV1(
      [valid.request, structuredClone(valid.request)],
      { enabled: true, kill_switch: false, authority: valid.authority },
    );
  cases.push({
    id: "duplicate_join_identity",
    result: duplicateResults[0]!,
  });
  const material = {
    fixture_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_SYNTHETIC_FIXTURES_V1,
    case_count: cases.length,
    cases: cases.map(({ id, result }) => ({
      id,
      taxonomy: result.taxonomy,
      reason_codes: result.reason_codes,
      result_digest: result.result_digest,
    })),
  };
  return {
    ...material,
    matrix_digest: sha(material),
  };
}

export function cloneSyntheticAuthorityWithRegistryV1(
  fixture: ReturnType<typeof createSyntheticContextOutcomeJoinFixtureV1>,
  registry: MarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
) {
  return {
    ...fixture.authority,
    read_registry: () => structuredClone(registry),
  } satisfies MarketContextDiagnosticContextOutcomeAuthorityV1;
}
