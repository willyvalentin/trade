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
  buildSyntheticSourcePayloadsV1,
} from "./diagnostic-decision-outcome-handoff-capture-fixtures-v1";
import {
  DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2,
  DIAGNOSTIC_OUTCOME_AUTHORITY_MATERIAL_V2,
  DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
  captureDiagnosticDecisionOutcomeHandoffV2,
  createDiagnosticOutcomeSourceRegistryV2,
  type DiagnosticDecisionOutcomeCaptureRequestV2,
  type DiagnosticOutcomeAuthorityMaterialV2,
  type DiagnosticOutcomeSourceAuthorityV2,
  type DiagnosticOutcomeSourceNamespaceV2,
  type DiagnosticOutcomeSourceRegistryV2,
} from "./diagnostic-decision-outcome-handoff-capture-v2";

export const DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_SYNTHETIC_FIXTURES_V2 =
  "diagnostic_decision_outcome_capture_synthetic_fixtures_v2" as const;

const SOURCE_NAMESPACES = [
  "decision_source",
  "opportunity_set_source",
  "evaluator_outcome_source",
  "provider_context_source",
  "cost_slippage_source",
] as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

type SyntheticSourcePayloadsV2 = ReturnType<
  typeof buildSyntheticSourcePayloadsV1
>;

export type SyntheticDiagnosticCaptureFixtureOptionsV2 = {
  mutate_payloads?: (payloads: SyntheticSourcePayloadsV2) => void;
  mutate_request?: (
    request: DiagnosticDecisionOutcomeCaptureRequestV2,
  ) => void;
  mutate_registry?: (registry: DiagnosticOutcomeSourceRegistryV2) => void;
  mutate_material?: (material: DiagnosticOutcomeAuthorityMaterialV2) => void;
  material_override?: unknown;
  anchor_override?: Partial<
    DiagnosticOutcomeSourceAuthorityV2["expected_registry_anchor"]
  >;
  on_authority_read?: (
    material: DiagnosticOutcomeAuthorityMaterialV2,
  ) => unknown;
};

export function createSyntheticDiagnosticCaptureFixtureV2(
  options: SyntheticDiagnosticCaptureFixtureOptionsV2 = {},
) {
  const payloads = buildSyntheticSourcePayloadsV1();
  options.mutate_payloads?.(payloads);
  const decisionUnixNs =
    BigInt(Date.parse("2026-01-05T15:30:00.000Z")) * BigInt(1_000_000);
  let registry = createDiagnosticOutcomeSourceRegistryV2({
    registry_identity: "synthetic-outcome-source-registry-v2-001",
    producer: {
      identity: "synthetic-evaluator",
      version: "synthetic-evaluator-v1",
    },
    expected_trust_root_digest: sha("synthetic-outcome-trust-root"),
    validity: {
      effective_from_unix_ns:
        (decisionUnixNs - BigInt(86_400_000_000_000)).toString(),
      effective_until_unix_ns:
        (decisionUnixNs + BigInt(86_400_000_000_000)).toString(),
    },
    sources: Object.fromEntries(
      SOURCE_NAMESPACES.map((namespace) => [
        namespace,
        {
          namespace,
          schema_version: payloads[namespace].schema_version,
          payload_identity: payloads[namespace].source_identity,
          payload_digest: sha(payloads[namespace]),
          verifier_identity: `synthetic-${namespace}-verifier`,
          verifier_version: "synthetic-source-verifier-v2",
        },
      ]),
    ) as DiagnosticOutcomeSourceRegistryV2["sources"],
  });
  if (options.mutate_registry) {
    const mutable = structuredClone(registry);
    options.mutate_registry(mutable);
    registry = mutable;
  }
  const materialRegistry = structuredClone(registry);
  const material: DiagnosticOutcomeAuthorityMaterialV2 = {
    material_version: DIAGNOSTIC_OUTCOME_AUTHORITY_MATERIAL_V2,
    registry: materialRegistry,
    source_payloads: structuredClone(payloads),
  };
  options.mutate_material?.(material);
  const request: DiagnosticDecisionOutcomeCaptureRequestV2 = {
    contract_version: DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2,
    capture_identity: "synthetic-capture-v2-001",
    period: "synthetic-period-2026-01",
    cohort: "synthetic-cohort-a",
    source_references: {
      decision_source_identity: payloads.decision_source.source_identity,
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
  const anchor = {
    registry_identity: registry.registry_identity,
    registry_version: registry.registry_version,
    registry_snapshot_digest: sha(registry),
    ...options.anchor_override,
  };
  let authorityReadCount = 0;
  const authority: DiagnosticOutcomeSourceAuthorityV2 = {
    authority_version: DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
    expected_registry_anchor: anchor,
    read_capture_material: () => {
      authorityReadCount += 1;
      return options.on_authority_read
        ? options.on_authority_read(material)
        : (options.material_override ?? material);
    },
  };
  return {
    fixture_version:
      DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_SYNTHETIC_FIXTURES_V2,
    request,
    payloads,
    registry,
    material,
    authority,
    authority_read_count: () => authorityReadCount,
  };
}

export function buildSyntheticCaptureToO2AInteropV2() {
  const captureFixture = createSyntheticDiagnosticCaptureFixtureV2();
  const captureResult = captureDiagnosticDecisionOutcomeHandoffV2(
    captureFixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: captureFixture.authority,
    },
  );
  if (!captureResult.bundle) {
    throw new Error("synthetic_v2_capture_fixture_not_captured");
  }
  const contextFixture = createSyntheticContextOutcomeJoinFixtureV1();
  const outcomeHandoff = captureResult.bundle.outcome_handoff;
  const registry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity:
        "synthetic-p2a-to-o2a-authority-registry-v1",
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
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
    external_join_id: "synthetic-p2a-to-o2a-join-001",
    context_snapshot_identity:
      contextFixture.context_handoff.snapshot_identity,
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
  const joinResult = createMarketContextDiagnosticContextOutcomeJoinV2(
    request,
    {
      enabled: true,
      kill_switch: false,
      authority,
    },
  );
  return {
    capture_fixture: captureFixture,
    capture_result: captureResult,
    o2a_request: request,
    o2a_registry: registry,
    o2a_authority: authority,
    o2a_result: joinResult,
  };
}

export function buildSyntheticDiagnosticCaptureGoldenMatrixV2(
  options: { reverse_input_order?: boolean } = {},
) {
  const fixtures = [
    ["valid_captured_bundle", createSyntheticDiagnosticCaptureFixtureV2()],
    [
      "incomplete_membership",
      createSyntheticDiagnosticCaptureFixtureV2({
        mutate_payloads: (payloads) => {
          payloads.opportunity_set_source.completeness = "partial";
        },
      }),
    ],
    [
      "future_capture",
      createSyntheticDiagnosticCaptureFixtureV2({
        mutate_payloads: (payloads) => {
          payloads.evaluator_outcome_source.capture_timestamp =
            "2026-01-05T16:29:59.999999999Z";
        },
      }),
    ],
    [
      "registry_root_substitution",
      createSyntheticDiagnosticCaptureFixtureV2({
        anchor_override: {
          registry_snapshot_digest: sha("substituted-registry-root"),
        },
      }),
    ],
    [
      "self_consistent_source_mutation",
      createSyntheticDiagnosticCaptureFixtureV2({
        mutate_material: (material) => {
          const decision = material.source_payloads
            .decision_source as Record<string, unknown>;
          decision.instrument_id = "QQQ";
          material.registry.sources.decision_source.payload_digest =
            sha(decision);
        },
      }),
    ],
  ] as const;
  const cases = fixtures.map(([id, fixture]) => {
    const result = captureDiagnosticDecisionOutcomeHandoffV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    );
    return {
      id,
      taxonomy: result.taxonomy,
      reason_codes: result.reason_codes,
      registry_snapshot_digest:
        result.registry_snapshot_binding.registry_snapshot_digest,
      authority_material_digest:
        result.registry_snapshot_binding.authority_material_digest,
      terminal_capture_digest: result.terminal_capture_digest,
    };
  });
  if (options.reverse_input_order) cases.reverse();
  cases.sort((left, right) => left.id.localeCompare(right.id));
  const interop = buildSyntheticCaptureToO2AInteropV2();
  const material = {
    fixture_version:
      DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_SYNTHETIC_FIXTURES_V2,
    case_count: cases.length,
    cases,
    o2a_interop: {
      capture_taxonomy: interop.capture_result.taxonomy,
      join_taxonomy: interop.o2a_result.taxonomy,
      predictor_digest:
        interop.o2a_result.predictor_projection?.predictor_digest ?? null,
      label_digest:
        interop.o2a_result.label_projection?.label_digest ?? null,
    },
  };
  return {
    ...material,
    matrix_digest: sha(material),
  };
}

export function sourceNamespaceIdentityV2(
  payloads: SyntheticSourcePayloadsV2,
  namespace: DiagnosticOutcomeSourceNamespaceV2,
) {
  return payloads[namespace].source_identity;
}
