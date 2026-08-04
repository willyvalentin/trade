import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
  createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
  type MarketContextDiagnosticContextOutcomeAuthorityV1,
  type MarketContextDiagnosticContextOutcomeJoinRequestV1,
} from "./diagnostic-context-outcome-join-v1";
import {
  createSyntheticContextOutcomeJoinFixtureV1,
} from "./diagnostic-context-outcome-join-fixtures-v1";
import {
  createMarketContextDiagnosticContextOutcomeJoinV2,
} from "./diagnostic-context-outcome-join-v2";
import {
  DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
  captureDiagnosticDecisionOutcomeHandoffV2,
} from "./diagnostic-decision-outcome-handoff-capture-v2";
import {
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_MATERIAL_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_VERIFIER_V1,
  admitMarketContextDiagnosticOutcomeSourceV1,
  type MarketContextDiagnosticOutcomeSourceAuthorityV1,
  type MarketContextDiagnosticOutcomeSourceMaterialV1,
  type MarketContextDiagnosticOutcomeSourceRegistryV1,
} from "./diagnostic-outcome-source-admission-v1";
import {
  createSyntheticOutcomeSourceAdmissionFixtureV1,
} from "./diagnostic-outcome-source-admission-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_INPUT_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1,
  computeRecommendationOutcomeProjectionDigestV1,
  projectRepositoryOwnedRecommendationOutcomeV1,
  type RecommendationOutcomeProjectionAuthorityV1,
  type RecommendationOutcomeProjectionInputV1,
  type RecommendationOutcomeProjectionMaterialV1,
  type RecommendationOutcomeProjectionRegistryV1,
  type RecommendationOutcomeProjectionRequestV1,
} from "./recommendation-outcome-projection-successor-v1";

export const RECOMMENDATION_OUTCOME_PROJECTION_FIXTURES_V1 =
  "repository_owned_recommendation_outcome_projection_fixtures_v1" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

export type SyntheticRecommendationOutcomeProjectionFixtureOptionsV1 = {
  observed_input_override?: unknown;
  mutate_input?: (input: Record<string, unknown>) => void;
  mutate_registry?: (
    registry: RecommendationOutcomeProjectionRegistryV1,
  ) => void;
  mutate_material?: (
    material: RecommendationOutcomeProjectionMaterialV1,
  ) => void;
  mutate_request?: (
    request: RecommendationOutcomeProjectionRequestV1,
  ) => void;
  material_override?: unknown;
  anchor_override?: Partial<
    RecommendationOutcomeProjectionAuthorityV1["expected_registry_anchor"]
  >;
  throw_on_read?: boolean;
};

export function createSyntheticCurrentRecommendationOutcomeRowV1(
  suffix = "001",
) {
  return {
    id: `synthetic-shaped-outcome-${suffix}`,
    snapshot_id: `synthetic-shaped-snapshot-${suffix}`,
    snapshot_fingerprint: `synthetic-fingerprint-${suffix}`,
    recommendation_id: `synthetic-shaped-recommendation-${suffix}`,
    ticker: "SYNTH",
    side: "long",
    recommended_at: "2026-07-28T14:30:00.000Z",
    evaluated_at: "2026-07-28T16:00:00.000Z",
    horizon: "60m",
    status: "target_before_stop",
    entry: 100,
    stop: 99,
    target: 102,
    entry_triggered: true,
    entry_triggered_at: "2026-07-28T14:35:00.000Z",
    target_hit: true,
    target_hit_at: "2026-07-28T15:45:00.000Z",
    stop_hit: false,
    stop_hit_at: null,
    first_terminal_event: "target_hit",
    best_price_after_recommendation: 102.5,
    worst_price_after_recommendation: 99.5,
    best_r: 2.5,
    worst_r: -0.5,
    eod_price: 102.25,
    eod_r: 2.25,
    current_price: 102.25,
    current_r: 2.25,
    max_favorable_excursion: 2.5,
    max_adverse_excursion: -0.5,
    time_to_entry_minutes: 5,
    time_to_target_minutes: 75,
    time_to_stop_minutes: null,
    source: "snapshot_only",
    provider: "synthetic-provider-label",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: {
      synthetic_fixture: true,
      contains_real_outcome: false,
    },
    created_at: "2026-07-28T16:00:00.000Z",
    updated_at: "2026-07-28T16:00:00.000Z",
  };
}

export function createSyntheticCurrentRecommendationEvaluationRowV1(
  suffix = "001",
) {
  return {
    id: `synthetic-persisted-outcome-${suffix}`,
    snapshot_id: `synthetic-persisted-snapshot-${suffix}`,
    snapshot_fingerprint: `synthetic-persisted-fingerprint-${suffix}`,
    recommendation_id: `synthetic-persisted-recommendation-${suffix}`,
    ticker: "SYNTH",
    recommended_at: "2026-07-28T14:30:00.000Z",
    evaluated_at: "2026-07-28T16:00:00.000Z",
    horizon: "60m",
    status: "target_before_stop",
    entry_triggered: true,
    target_hit: true,
    stop_hit: false,
    first_terminal_event: "target_hit",
    best_price: 102.5,
    worst_price: 99.5,
    best_r: 2.5,
    worst_r: -0.5,
    eod_price: 102.25,
    eod_r: 2.25,
    payload_json: {
      side: "long",
      data_completeness: "complete",
      synthetic_fixture: true,
      contains_real_outcome: false,
    },
    warnings_json: [],
    created_at: "2026-07-28T16:00:00.000Z",
    updated_at: "2026-07-28T16:00:00.000Z",
  };
}

function buildProjectionInput() {
  const q1 = createSyntheticOutcomeSourceAdmissionFixtureV1();
  const source = q1.source_payload;
  const input: RecommendationOutcomeProjectionInputV1 = {
    projection_version: RECOMMENDATION_OUTCOME_PROJECTION_INPUT_V1,
    producer_owner: structuredClone(source.producer),
    source_contract: {
      schema_version: source.schema_version,
      contract_version: source.contract_version,
    },
    external_authority_root_digest:
      q1.registry.expected_trust_root_digest,
    source_snapshot: {
      identity: source.source_identity,
      digest: sha(source),
    },
    decision: {
      recommendation_id: "synthetic-recommendation-001",
      external_decision_id:
        source.decision_identity.external_decision_id,
      instrument_id: source.decision_identity.instrument_id,
    },
    opportunity_set: {
      identity: source.opportunity_set.identity,
      membership_digest: source.opportunity_set.membership_digest,
      immutable: true,
    },
    outcome: structuredClone(source.outcome),
    lineage: {
      identity: source.lineage.identity,
      source_lineage_digest: sha({
        source_identity: source.source_identity,
        source_contract: source.contract_version,
      }),
      evaluator_lineage_digest:
        source.lineage.evaluator_lineage_digest,
      outcome_lineage_digest: source.lineage.outcome_lineage_digest,
      provider_source: source.lineage.provider_source,
      provider_version: source.lineage.provider_version,
      context_lineage_digest:
        source.point_in_time.context_snapshot_digest,
    },
    instants: {
      decision_unix_ns: source.instants.decision_unix_ns,
      outcome_start_unix_ns: source.instants.outcome_start_unix_ns,
      outcome_end_unix_ns: source.instants.outcome_end_unix_ns,
      outcome_finalization_unix_ns:
        source.instants.outcome_finalization_unix_ns,
      capture_unix_ns: source.instants.capture_unix_ns,
      evidence_cutoff_unix_ns: source.instants.cutoff_unix_ns,
    },
    finality: structuredClone(source.finality) as {
      status: "final";
      proof_identity: string;
      proof_digest: string;
    },
    completeness: {
      status: "complete",
      proof_identity: "synthetic-completeness-proof-001",
      proof_digest: source.completeness.evidence_digest,
    },
    read_only_projection: {
      identity: "synthetic-read-only-outcome-projection-001",
      projection_digest: "0".repeat(64),
      mode: "read_only",
      writes_permitted: false,
      persistence_permitted: false,
    },
    point_in_time: structuredClone(source.point_in_time),
    q1_interop: {
      p2a_capture_request: structuredClone(source.p2a_capture_request),
      p2a_registry_anchor: structuredClone(source.p2a_registry_anchor),
      p2a_authority_material: structuredClone(
        source.p2a_authority_material,
      ),
    },
  };
  input.read_only_projection.projection_digest =
    computeRecommendationOutcomeProjectionDigestV1(input);
  return { input, q1 };
}

function refreshProjectionDigest(value: unknown) {
  const candidate = value as RecommendationOutcomeProjectionInputV1;
  if (
    candidate &&
    typeof candidate === "object" &&
    candidate.read_only_projection &&
    typeof candidate.read_only_projection === "object"
  ) {
    candidate.read_only_projection.projection_digest =
      computeRecommendationOutcomeProjectionDigestV1(candidate);
  }
}

export function createSyntheticRecommendationOutcomeProjectionFixtureV1(
  options: SyntheticRecommendationOutcomeProjectionFixtureOptionsV1 = {},
) {
  const base = buildProjectionInput();
  let observedInput: unknown =
    options.observed_input_override ?? structuredClone(base.input);
  if (options.mutate_input) {
    const mutable = structuredClone(observedInput) as Record<
      string,
      unknown
    >;
    options.mutate_input(mutable);
    observedInput = mutable;
    refreshProjectionDigest(observedInput);
  }
  let registry: RecommendationOutcomeProjectionRegistryV1 = {
    registry_version: RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
    registry_identity: "synthetic-recommendation-projection-registry-001",
    expected_external_authority_root_digest:
      base.q1.registry.expected_trust_root_digest,
    projection_entry: {
      projection_identity:
        base.input.read_only_projection.identity,
      source_snapshot_identity: base.input.source_snapshot.identity,
      observed_input_digest: sha(observedInput),
      verifier_identity: RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1,
      verifier_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    },
  };
  if (options.mutate_registry) {
    const mutable = structuredClone(registry);
    options.mutate_registry(mutable);
    registry = mutable;
  }
  const material: RecommendationOutcomeProjectionMaterialV1 = {
    material_version: RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1,
    registry: structuredClone(registry),
    observed_projection_input: structuredClone(observedInput),
  };
  options.mutate_material?.(material);
  const request: RecommendationOutcomeProjectionRequestV1 = {
    contract_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    projection_identity: registry.projection_entry.projection_identity,
    expected_source_snapshot_identity:
      registry.projection_entry.source_snapshot_identity,
  };
  options.mutate_request?.(request);
  const anchor = {
    registry_identity: registry.registry_identity,
    registry_version: RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
    registry_digest: sha(registry),
    ...options.anchor_override,
  };
  let authorityReadCount = 0;
  const authority: RecommendationOutcomeProjectionAuthorityV1 = {
    authority_version: RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
    expected_registry_anchor: anchor,
    read_projection_material: () => {
      authorityReadCount += 1;
      if (options.throw_on_read) {
        throw new Error("synthetic private source detail");
      }
      return structuredClone(options.material_override ?? material);
    },
  };
  return {
    fixture_version: RECOMMENDATION_OUTCOME_PROJECTION_FIXTURES_V1,
    request,
    observed_input: observedInput,
    registry,
    material,
    authority,
    authority_read_count: () => authorityReadCount,
    q1_fixture: base.q1,
  };
}

function q1AuthorityForProjectedPayload(
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeProjectionFixtureV1
  >,
  projectedPayload: NonNullable<
    ReturnType<
      typeof projectRepositoryOwnedRecommendationOutcomeV1
    >["bindable_projection"]
  >["q1_source_payload"],
) {
  const registry: MarketContextDiagnosticOutcomeSourceRegistryV1 = {
    ...structuredClone(fixture.q1_fixture.registry),
    producer: structuredClone(projectedPayload.producer),
    source: {
      namespace: "diagnostic_outcome_source",
      schema_version: projectedPayload.schema_version,
      contract_version: projectedPayload.contract_version,
      payload_identity: projectedPayload.source_identity,
      payload_digest: sha(projectedPayload),
      verifier_identity:
        MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_VERIFIER_V1,
      verifier_version:
        MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
    },
  };
  const material: MarketContextDiagnosticOutcomeSourceMaterialV1 = {
    material_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_MATERIAL_V1,
    registry: structuredClone(registry),
    observed_source_payload: structuredClone(projectedPayload),
  };
  const authority: MarketContextDiagnosticOutcomeSourceAuthorityV1 = {
    authority_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
    expected_registry_anchor: {
      registry_identity: registry.registry_identity,
      registry_version:
        MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
      registry_digest: sha(registry),
    },
    read_admission_material: () => structuredClone(material),
  };
  return authority;
}

export function buildSyntheticRecommendationOutcomeProjectionInteropV1() {
  const fixture =
    createSyntheticRecommendationOutcomeProjectionFixtureV1();
  const projection = projectRepositoryOwnedRecommendationOutcomeV1(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  if (!projection.bindable_projection) {
    throw new Error("synthetic_recommendation_projection_not_bindable");
  }
  const q1Payload = projection.bindable_projection.q1_source_payload;
  const q1Admission = admitMarketContextDiagnosticOutcomeSourceV1(
    fixture.q1_fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: q1AuthorityForProjectedPayload(fixture, q1Payload),
    },
  );
  if (!q1Admission.ready_handoff) {
    throw new Error("synthetic_recommendation_projection_q1_not_ready");
  }
  const capture = captureDiagnosticDecisionOutcomeHandoffV2(
    q1Admission.ready_handoff.p2a_capture_request,
    {
      enabled: true,
      kill_switch: false,
      authority: {
        authority_version: DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
        expected_registry_anchor:
          q1Admission.ready_handoff.p2a_authority
            .expected_registry_anchor,
        read_capture_material: () =>
          structuredClone(
            q1Admission.ready_handoff?.p2a_authority
              .authority_material,
          ),
      },
    },
  );
  if (!capture.bundle) {
    throw new Error("synthetic_recommendation_projection_p2a_failed");
  }
  const context = createSyntheticContextOutcomeJoinFixtureV1();
  const outcomeHandoff = capture.bundle.outcome_handoff;
  const o2aRegistry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity:
        "synthetic-r2-to-o2a-authority-registry-v1",
      context_authority: context.registry.context_authority,
      outcome_authority: {
        ...context.registry.outcome_authority,
        evaluator_version: outcomeHandoff.versions.evaluator,
        evaluator_lineage_digest:
          outcomeHandoff.lineage.evaluator_lineage_digest,
      },
      context_handoff_digests: {
        [context.context_handoff.snapshot_identity]:
          context.context_handoff.handoff_digest,
      },
      outcome_bundle_digests: {
        [outcomeHandoff.outcome_identity]:
          outcomeHandoff.bundle_digest,
      },
    });
  const o2aAuthority: MarketContextDiagnosticContextOutcomeAuthorityV1 = {
    authority_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1,
    expected_registry_anchor: {
      registry_identity: o2aRegistry.registry_identity,
      registry_version:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
      registry_digest: o2aRegistry.registry_digest,
    },
    read_registry: () => structuredClone(o2aRegistry),
    read_context_handoff: (identity) =>
      identity === context.context_handoff.snapshot_identity
        ? {
            status: "resolved" as const,
            handoff: structuredClone(context.context_handoff),
          }
        : { status: "not_found" as const },
    read_outcome_bundle: (identity) =>
      identity === outcomeHandoff.outcome_identity
        ? {
            status: "resolved" as const,
            bundle: structuredClone(outcomeHandoff),
          }
        : { status: "not_found" as const },
  };
  const o2aRequest: MarketContextDiagnosticContextOutcomeJoinRequestV1 = {
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
    external_join_id: "synthetic-r2-to-o2a-join-001",
    context_snapshot_identity:
      context.context_handoff.snapshot_identity,
    outcome_identity: outcomeHandoff.outcome_identity,
    decision_reference: {
      external_decision_id:
        outcomeHandoff.decision_identity.external_decision_id,
      decision_unix_ns:
        outcomeHandoff.decision_identity.decision_unix_ns,
      instrument_id: outcomeHandoff.decision_identity.instrument_id,
      opportunity_set_identity: outcomeHandoff.opportunity_set.identity,
    },
  };
  const joined = createMarketContextDiagnosticContextOutcomeJoinV2(
    o2aRequest,
    {
      enabled: true,
      kill_switch: false,
      authority: o2aAuthority,
    },
  );
  return { projection, q1_admission: q1Admission, p2a_capture: capture, o2a_join: joined };
}

function matrixCase(
  id: string,
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeProjectionFixtureV1
  >,
  enabled = true,
  killSwitch = false,
) {
  const result = projectRepositoryOwnedRecommendationOutcomeV1(
    fixture.request,
    {
      enabled,
      kill_switch: killSwitch,
      authority: fixture.authority,
    },
  );
  return {
    id,
    taxonomy: result.taxonomy,
    reason_codes: result.reason_codes,
    failure_identity_digest: result.failure_identity_digest,
    result_digest: result.result_digest,
  };
}

function missingFieldFixture(key: string) {
  return createSyntheticRecommendationOutcomeProjectionFixtureV1({
    mutate_input: (input) => {
      delete input[key];
    },
  });
}

export function buildSyntheticRecommendationOutcomeProjectionGoldenMatrixV1(
  options: { reverse_input_order?: boolean } = {},
) {
  const fixtures = [
    [
      "bindable_successor",
      createSyntheticRecommendationOutcomeProjectionFixtureV1(),
    ],
    [
      "current_recommendation_outcome_not_bindable",
      createSyntheticRecommendationOutcomeProjectionFixtureV1({
        observed_input_override:
          createSyntheticCurrentRecommendationOutcomeRowV1(),
      }),
    ],
    [
      "current_evaluation_outcome_not_bindable",
      createSyntheticRecommendationOutcomeProjectionFixtureV1({
        observed_input_override:
          createSyntheticCurrentRecommendationEvaluationRowV1(),
      }),
    ],
    ["producer_owner_missing", missingFieldFixture("producer_owner")],
    [
      "source_contract_version_missing",
      missingFieldFixture("source_contract"),
    ],
    [
      "external_authority_root_missing",
      missingFieldFixture("external_authority_root_digest"),
    ],
    [
      "source_snapshot_identity_digest_missing",
      missingFieldFixture("source_snapshot"),
    ],
    [
      "recommendation_decision_identity_missing",
      missingFieldFixture("decision"),
    ],
    [
      "immutable_membership_missing",
      missingFieldFixture("opportunity_set"),
    ],
    [
      "evaluator_identity_version_missing",
      missingFieldFixture("outcome"),
    ],
    ["finality_proof_missing", missingFieldFixture("finality")],
    ["completeness_proof_missing", missingFieldFixture("completeness")],
    ["cryptographic_lineage_missing", missingFieldFixture("lineage")],
    ["nanosecond_instants_missing", missingFieldFixture("instants")],
    [
      "read_only_projection_missing",
      missingFieldFixture("read_only_projection"),
    ],
    [
      "predictor_point_in_time_binding_missing",
      missingFieldFixture("point_in_time"),
    ],
    [
      "q1_interop_material_missing",
      missingFieldFixture("q1_interop"),
    ],
    [
      "temporal_order_not_safe",
      createSyntheticRecommendationOutcomeProjectionFixtureV1({
        mutate_input: (input) => {
          const instants = input.instants as Record<string, string>;
          instants.outcome_start_unix_ns = instants.decision_unix_ns;
        },
      }),
    ],
    [
      "external_authority_root_conflicting",
      createSyntheticRecommendationOutcomeProjectionFixtureV1({
        mutate_input: (input) => {
          input.external_authority_root_digest = "a".repeat(64);
        },
      }),
    ],
    [
      "failure_collision_a",
      createSyntheticRecommendationOutcomeProjectionFixtureV1({
        observed_input_override:
          createSyntheticCurrentRecommendationOutcomeRowV1("a"),
      }),
    ],
    [
      "failure_collision_b",
      createSyntheticRecommendationOutcomeProjectionFixtureV1({
        observed_input_override:
          createSyntheticCurrentRecommendationOutcomeRowV1("b"),
      }),
    ],
    [
      "unmappable_runtime_value",
      createSyntheticRecommendationOutcomeProjectionFixtureV1({
        observed_input_override: ["unsupported"],
      }),
    ],
  ] as const;
  const cases = fixtures.map(([id, fixture]) => matrixCase(id, fixture));
  cases.push(
    matrixCase(
      "disabled_zero_work",
      createSyntheticRecommendationOutcomeProjectionFixtureV1(),
      false,
      false,
    ),
    matrixCase(
      "kill_switch_zero_work",
      createSyntheticRecommendationOutcomeProjectionFixtureV1(),
      true,
      true,
    ),
  );
  if (options.reverse_input_order) cases.reverse();
  cases.sort((left, right) => left.id.localeCompare(right.id));
  const interop = buildSyntheticRecommendationOutcomeProjectionInteropV1();
  const material = {
    fixture_version: RECOMMENDATION_OUTCOME_PROJECTION_FIXTURES_V1,
    synthetic_only: true,
    real_outcome_source_accessed: false,
    real_outcome_capture_performed: false,
    real_outcome_join_performed: false,
    case_count: cases.length,
    cases,
    interop: {
      projection_taxonomy: interop.projection.taxonomy,
      q1_admission_taxonomy: interop.q1_admission.taxonomy,
      p2a_capture_taxonomy: interop.p2a_capture.taxonomy,
      o2a_join_taxonomy: interop.o2a_join.taxonomy,
    },
  };
  return {
    ...material,
    matrix_digest: sha(material),
  };
}
