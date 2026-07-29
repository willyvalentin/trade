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
  DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1,
  DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
  DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
  captureDiagnosticDecisionOutcomeHandoffBatchV1,
  captureDiagnosticDecisionOutcomeHandoffV1,
  createDiagnosticOutcomeSourceRegistryV1,
  type DiagnosticDecisionOutcomeCaptureRequestV1,
  type DiagnosticOutcomeSourceAuthorityV1,
  type DiagnosticOutcomeSourceNamespaceV1,
  type DiagnosticOutcomeSourceRegistryV1,
} from "./diagnostic-decision-outcome-handoff-capture-v1";

export const DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_SYNTHETIC_FIXTURES_V1 =
  "diagnostic_decision_outcome_capture_synthetic_fixtures_v1" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

const DECISION_TIMESTAMP = "2026-01-05T15:30:00.000000000Z";
const DECISION_UNIX_NS = (
  BigInt(Date.parse("2026-01-05T15:30:00.000Z")) *
  BigInt(1_000_000)
).toString();

type SyntheticSourcePayloadsV1 = ReturnType<
  typeof buildSyntheticSourcePayloadsV1
>;

export function buildSyntheticSourcePayloadsV1() {
  return {
    decision_source: {
      schema_version: "synthetic_decision_source_v1",
      source_identity: "synthetic-decision-source-001",
      external_decision_id: "synthetic-decision-001",
      decision_timestamp: DECISION_TIMESTAMP,
      instrument_id: "SPY",
      context_snapshot_identity: "synthetic-context-snapshot-001",
      context_snapshot_digest: sha("synthetic-context-snapshot-digest"),
      latest_finalized_bucket_unix_ns:
        (BigInt(DECISION_UNIX_NS) - BigInt(2_000_000_000)).toString(),
      source_timestamp: "2026-01-05T15:29:59.999999999Z",
    },
    opportunity_set_source: {
      schema_version: "synthetic_opportunity_set_source_v1",
      source_identity: "synthetic-opportunity-source-001",
      opportunity_set_identity: "synthetic-opportunity-set-001",
      completeness: "complete",
      membership: [
        { instrument_id: "QQQ", ordinal: 0 },
        { instrument_id: "SPY", ordinal: 1 },
        { instrument_id: "XLK", ordinal: 2 },
      ],
    },
    evaluator_outcome_source: {
      schema_version: "synthetic_evaluator_outcome_source_v1",
      source_identity: "synthetic-outcome-source-001",
      outcome_identity: "synthetic-outcome-001",
      external_decision_id: "synthetic-decision-001",
      instrument_id: "SPY",
      baseline_version: "synthetic-baseline-v1",
      candidate_version: "synthetic-candidate-v1",
      evaluator_identity: "synthetic-evaluator",
      evaluator_version: "synthetic-evaluator-v1",
      outcome_window: {
        definition: "decision_plus_1ns_through_60m",
        start_timestamp: "2026-01-05T15:30:00.000000001Z",
        end_timestamp: "2026-01-05T16:30:00.000000000Z",
      },
      completion: {
        status: "completed",
        completion_timestamp: "2026-01-05T16:30:00.000000000Z",
        evidence_digest: sha("synthetic-completion-evidence"),
      },
      capture_timestamp: "2026-01-05T16:30:00.000000001Z",
      evaluator_run_digest: sha("synthetic-evaluator-run"),
      definitions: {
        target: "synthetic_target_definition_v1",
        stop: "synthetic_stop_definition_v1",
        diagnostic_horizon: "synthetic_60m_horizon_v1",
      },
      realized_outcome: {
        label: "diagnostic_target_observed",
        value: "0.50",
        unit: "R",
      },
      membership: {
        opportunity_set_identity: "synthetic-opportunity-set-001",
        dataset: "synthetic-outcome-dataset-v1",
      },
    },
    provider_context_source: {
      schema_version: "synthetic_provider_context_source_v1",
      source_identity: "synthetic-provider-source-001",
      provider_source: "synthetic-provider",
      provider_version: "synthetic-provider-v1",
      source_timestamp: "2026-01-05T16:30:00.000000000Z",
      evaluator_lineage_digest: sha("synthetic-evaluator-lineage"),
      outcome_lineage_digest: sha("synthetic-outcome-lineage"),
    },
    cost_slippage_source: {
      schema_version: "synthetic_cost_slippage_source_v1",
      source_identity: "synthetic-cost-source-001",
      status: "declared",
      cost_model_version: "synthetic-cost-v1",
      slippage_model_version: "synthetic-slippage-v1",
      provenance_digest: sha("synthetic-cost-slippage-provenance"),
    },
  };
}

function sourceIdentity(
  payloads: SyntheticSourcePayloadsV1,
  namespace: DiagnosticOutcomeSourceNamespaceV1,
) {
  return payloads[namespace].source_identity;
}

export type SyntheticDiagnosticCaptureFixtureOptionsV1 = {
  mutate_payloads?: (payloads: SyntheticSourcePayloadsV1) => void;
  mutate_request?: (
    request: DiagnosticDecisionOutcomeCaptureRequestV1,
  ) => void;
  mutate_registry?: (registry: DiagnosticOutcomeSourceRegistryV1) => void;
  observed_payload_overrides?: Partial<
    Record<DiagnosticOutcomeSourceNamespaceV1, unknown>
  >;
  missing_sources?: DiagnosticOutcomeSourceNamespaceV1[];
  registry_override?: unknown;
  anchor_override?: Partial<
    DiagnosticOutcomeSourceAuthorityV1["expected_registry_anchor"]
  >;
};

export function createSyntheticDiagnosticCaptureFixtureV1(
  options: SyntheticDiagnosticCaptureFixtureOptionsV1 = {},
) {
  const payloads = buildSyntheticSourcePayloadsV1();
  options.mutate_payloads?.(payloads);
  let registry = createDiagnosticOutcomeSourceRegistryV1({
    registry_identity: "synthetic-outcome-source-registry-001",
    producer: {
      identity: "synthetic-evaluator",
      version: "synthetic-evaluator-v1",
    },
    expected_trust_root_digest: sha("synthetic-outcome-trust-root"),
    validity: {
      effective_from_unix_ns:
        (BigInt(DECISION_UNIX_NS) - BigInt(86_400_000_000_000)).toString(),
      effective_until_unix_ns:
        (BigInt(DECISION_UNIX_NS) + BigInt(86_400_000_000_000)).toString(),
    },
    sources: Object.fromEntries(
      (
        [
          "decision_source",
          "opportunity_set_source",
          "evaluator_outcome_source",
          "provider_context_source",
          "cost_slippage_source",
        ] as const
      ).map((namespace) => [
        namespace,
        {
          namespace,
          schema_version: payloads[namespace].schema_version,
          payload_identity: sourceIdentity(payloads, namespace),
          payload_digest: sha(payloads[namespace]),
          verifier_identity: `synthetic-${namespace}-verifier`,
          verifier_version: "synthetic-source-verifier-v1",
        },
      ]),
    ) as DiagnosticOutcomeSourceRegistryV1["sources"],
  });
  options.mutate_registry?.(registry);
  if (options.mutate_registry) {
    const material = Object.fromEntries(
      Object.entries(registry).filter(([key]) => key !== "registry_digest"),
    );
    registry = {
      ...registry,
      registry_digest: sha(material),
    };
  }
  const request: DiagnosticDecisionOutcomeCaptureRequestV1 = {
    contract_version:
      DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1,
    capture_identity: "synthetic-capture-001",
    period: "synthetic-period-2026-01",
    cohort: "synthetic-cohort-a",
    source_references: {
      decision_source_identity:
        payloads.decision_source.source_identity,
      opportunity_set_source_identity:
        payloads.opportunity_set_source.source_identity,
      evaluator_outcome_source_identity:
        payloads.evaluator_outcome_source.source_identity,
      provider_context_source_identity:
        payloads.provider_context_source.source_identity,
      cost_slippage_source_identity:
        payloads.cost_slippage_source.source_identity,
    },
  };
  options.mutate_request?.(request);
  const missing = new Set(options.missing_sources ?? []);
  const observed = {
    ...payloads,
    ...options.observed_payload_overrides,
  };
  const anchor = {
    registry_identity: registry.registry_identity,
    registry_version: DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
    registry_digest: registry.registry_digest,
    ...options.anchor_override,
  };
  const authority: DiagnosticOutcomeSourceAuthorityV1 = {
    authority_version: DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
    expected_registry_anchor: anchor,
    read_registry: () =>
      structuredClone(options.registry_override ?? registry),
    read_source: (namespace, identity) => {
      if (
        missing.has(namespace) ||
        identity !== sourceIdentity(payloads, namespace)
      ) {
        return { status: "not_found" as const };
      }
      return {
        status: "resolved" as const,
        payload: structuredClone(observed[namespace]),
      };
    },
  };
  return {
    fixture_version:
      DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_SYNTHETIC_FIXTURES_V1,
    request,
    payloads,
    registry,
    authority,
  };
}

export function buildSyntheticCaptureToO2AInteropV1() {
  const captureFixture = createSyntheticDiagnosticCaptureFixtureV1();
  const captureResult =
    captureDiagnosticDecisionOutcomeHandoffV1(
      captureFixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: captureFixture.authority,
      },
    );
  if (!captureResult.bundle) {
    throw new Error("synthetic_capture_fixture_not_captured");
  }
  const contextFixture = createSyntheticContextOutcomeJoinFixtureV1();
  const outcomeHandoff = captureResult.bundle.outcome_handoff;
  const registry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity:
        "synthetic-p1-to-o2a-authority-registry-v1",
      context_authority: contextFixture.registry.context_authority,
      outcome_authority: {
        ...contextFixture.registry.outcome_authority,
        evaluator_version: outcomeHandoff.versions.evaluator,
        evaluator_lineage_digest:
          outcomeHandoff.lineage.evaluator_lineage_digest,
      },
      context_handoff_digests: {
        [contextFixture.context_handoff.snapshot_identity]:
          contextFixture.context_handoff.handoff_digest,
      },
      outcome_bundle_digests: {
        [outcomeHandoff.outcome_identity]:
          outcomeHandoff.bundle_digest,
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
      identity === contextFixture.context_handoff.snapshot_identity
        ? {
            status: "resolved" as const,
            handoff: structuredClone(contextFixture.context_handoff),
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
  const request: MarketContextDiagnosticContextOutcomeJoinRequestV1 = {
    contract_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
    external_join_id: "synthetic-p1-to-o2a-join-001",
    context_snapshot_identity:
      contextFixture.context_handoff.snapshot_identity,
    outcome_identity: outcomeHandoff.outcome_identity,
    decision_reference: {
      external_decision_id:
        outcomeHandoff.decision_identity.external_decision_id,
      decision_unix_ns:
        outcomeHandoff.decision_identity.decision_unix_ns,
      instrument_id: outcomeHandoff.decision_identity.instrument_id,
      opportunity_set_identity:
        outcomeHandoff.opportunity_set.identity,
    },
  };
  const joinResult =
    createMarketContextDiagnosticContextOutcomeJoinV2(request, {
      enabled: true,
      kill_switch: false,
      authority,
    });
  return {
    capture_fixture: captureFixture,
    capture_result: captureResult,
    o2a_request: request,
    o2a_registry: registry,
    o2a_authority: authority,
    o2a_result: joinResult,
  };
}

export function buildSyntheticDiagnosticCaptureGoldenMatrixV1(
  options: { reverse_input_order?: boolean } = {},
) {
  const valid = createSyntheticDiagnosticCaptureFixtureV1();
  const incompleteMembership =
    createSyntheticDiagnosticCaptureFixtureV1({
      mutate_payloads: (payloads) => {
        payloads.opportunity_set_source.completeness = "partial";
      },
    });
  const missingCompletion =
    createSyntheticDiagnosticCaptureFixtureV1({
      mutate_payloads: (payloads) => {
        payloads.evaluator_outcome_source.completion = {
          ...payloads.evaluator_outcome_source.completion,
          status: "pending",
          completion_timestamp: null as unknown as string,
        };
      },
    });
  const futureCapture = createSyntheticDiagnosticCaptureFixtureV1({
    mutate_payloads: (payloads) => {
      payloads.evaluator_outcome_source.capture_timestamp =
        "2026-01-05T16:29:59.999999999Z";
    },
  });
  const evaluatorMismatch =
    createSyntheticDiagnosticCaptureFixtureV1({
      mutate_payloads: (payloads) => {
        payloads.evaluator_outcome_source.evaluator_version =
          "synthetic-other-evaluator-v1";
      },
    });
  const missingOutcome = createSyntheticDiagnosticCaptureFixtureV1({
    missing_sources: ["evaluator_outcome_source"],
  });
  const unmappable = createSyntheticDiagnosticCaptureFixtureV1({
    mutate_request: (request) => {
      request.source_references.decision_source_identity =
        "synthetic-unregistered-decision-source";
    },
  });
  const invalidPayloadA =
    createSyntheticDiagnosticCaptureFixtureV1({
      observed_payload_overrides: {
        decision_source: {
          malformed: "alpha",
        },
      },
    });
  const invalidPayloadB =
    createSyntheticDiagnosticCaptureFixtureV1({
      observed_payload_overrides: {
        decision_source: {
          malformed: "beta",
        },
      },
    });
  const substitutedRegistry =
    createDiagnosticOutcomeSourceRegistryV1({
      registry_identity: "synthetic-substituted-registry",
      producer: valid.registry.producer,
      expected_trust_root_digest: sha("substituted-root"),
      validity: valid.registry.validity,
      sources: valid.registry.sources,
    });
  const captureCaseFixtures = [
    ["valid_captured_bundle", valid],
    ["incomplete_membership", incompleteMembership],
    ["missing_outcome_completion", missingCompletion],
    ["future_capture", futureCapture],
    ["evaluator_mismatch", evaluatorMismatch],
    ["missing_outcome_source", missingOutcome],
    ["unmappable_source_identity", unmappable],
    ["invalid_payload_alpha", invalidPayloadA],
    ["invalid_payload_beta", invalidPayloadB],
    [
      "registry_substitution",
      createSyntheticDiagnosticCaptureFixtureV1({
        registry_override: substitutedRegistry,
      }),
    ],
  ] as const;
  const captureCases = captureCaseFixtures.map(([id, fixture]) => ({
    id,
    result: captureDiagnosticDecisionOutcomeHandoffV1(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    ),
  }));
  const duplicate = captureDiagnosticDecisionOutcomeHandoffBatchV1(
    [valid.request, structuredClone(valid.request)],
    {
      enabled: true,
      kill_switch: false,
      authority: valid.authority,
    },
  )[0];
  const collisionRequest = structuredClone(valid.request);
  collisionRequest.cohort = "synthetic-cohort-conflicting";
  const collision = captureDiagnosticDecisionOutcomeHandoffBatchV1(
    [valid.request, collisionRequest],
    {
      enabled: true,
      kill_switch: false,
      authority: valid.authority,
    },
  )[0];
  const secondCaptureRequest = structuredClone(valid.request);
  secondCaptureRequest.capture_identity = "synthetic-capture-002";
  const duplicateDecision =
    captureDiagnosticDecisionOutcomeHandoffBatchV1(
      [valid.request, secondCaptureRequest],
      {
        enabled: true,
        kill_switch: false,
        authority: valid.authority,
      },
    )[0];
  const unreadable = () =>
    new Proxy(
      {},
      {
        get() {
          throw new Error("zero_work_boundary_read");
        },
        ownKeys() {
          throw new Error("zero_work_boundary_enumeration");
        },
      },
    );
  const defaultOff = captureDiagnosticDecisionOutcomeHandoffV1(
    unreadable(),
    { enabled: false, kill_switch: false },
  );
  const killSwitch = captureDiagnosticDecisionOutcomeHandoffV1(
    unreadable(),
    { enabled: true, kill_switch: true },
  );
  const results = [
    ...captureCases,
    { id: "duplicate_capture", result: duplicate },
    { id: "duplicate_decision", result: duplicateDecision },
    { id: "self_consistent_capture_collision", result: collision },
    { id: "default_off_zero_work", result: defaultOff },
    { id: "kill_switch_zero_work", result: killSwitch },
  ];
  if (options.reverse_input_order) results.reverse();
  const interop = buildSyntheticCaptureToO2AInteropV1();
  const rejectedInterop = createMarketContextDiagnosticContextOutcomeJoinV2(
    {
      ...interop.o2a_request,
      outcome_identity: "synthetic-unregistered-outcome",
    },
    {
      enabled: true,
      kill_switch: false,
      authority: interop.o2a_authority,
    },
  );
  const canonicalCases = results
    .map(({ id, result }) => ({
      id,
      taxonomy: result.taxonomy,
      reason_codes: result.reason_codes,
      terminal_capture_digest: result.terminal_capture_digest,
      failure_identity_digest: result.failure_identity_digest,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  return {
    fixture_version:
      DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_SYNTHETIC_FIXTURES_V1,
    case_count: canonicalCases.length,
    cases: canonicalCases,
    o2a_interop: {
      capture_taxonomy: interop.capture_result.taxonomy,
      join_taxonomy: interop.o2a_result.taxonomy,
      predictor_digest:
        interop.o2a_result.predictor_projection?.predictor_digest ??
        null,
      label_digest:
        interop.o2a_result.label_projection?.label_digest ?? null,
      rejected_capture_join_taxonomy: rejectedInterop.taxonomy,
    },
    matrix_digest: sha({
      cases: canonicalCases,
      o2a_interop: {
        capture_taxonomy: interop.capture_result.taxonomy,
        join_taxonomy: interop.o2a_result.taxonomy,
        rejected_capture_join_taxonomy: rejectedInterop.taxonomy,
      },
    }),
  };
}
