import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1,
} from "./recommendation-outcome-evidence-completion-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
  completeRepositoryOwnedRecommendationOutcomeEvidenceV2,
  type RecommendationOutcomeEvidenceAuthorityV2,
  type RecommendationOutcomeEvidenceCompletionRequestV2,
} from "./recommendation-outcome-evidence-completion-v2";
import {
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
} from "./recommendation-outcome-evidence-completion-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_FIXTURES_V2 =
  "repository_owned_recommendation_outcome_evidence_completion_fixtures_v2" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

export type SyntheticRecommendationOutcomeEvidenceCompletionOptionsV2 = {
  row_suffix?: string;
  reverse_closure_order?: boolean;
  remove_gap_code?: string;
  duplicate_first_closure?: boolean;
  add_unknown_closure_field?: boolean;
  mutate_material?: (material: Record<string, unknown>) => void;
  mutate_anchor_before_read?: (
    anchor: Record<string, unknown>,
  ) => void;
  mutate_anchor_during_read?: (
    anchor: Record<string, unknown>,
  ) => void;
  material_override?: unknown;
  throw_on_read?: boolean;
};

export function createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2(
  options: SyntheticRecommendationOutcomeEvidenceCompletionOptionsV2 = {},
) {
  const predecessor =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      row_suffix: options.row_suffix,
    });
  const material = structuredClone(
    predecessor.material,
  ) as unknown as Record<string, unknown>;
  const bundle = material.observed_evidence_bundle as {
    gap_closures: Array<Record<string, unknown>>;
  };
  if (options.reverse_closure_order) {
    bundle.gap_closures.reverse();
  }
  if (options.remove_gap_code) {
    bundle.gap_closures = bundle.gap_closures.filter(
      (closure) => closure.gap_code !== options.remove_gap_code,
    );
  }
  if (options.duplicate_first_closure) {
    bundle.gap_closures.push(
      structuredClone(bundle.gap_closures[0]),
    );
  }
  if (options.add_unknown_closure_field) {
    bundle.gap_closures[0].caller_verified = true;
  }
  options.mutate_material?.(material);

  const request: RecommendationOutcomeEvidenceCompletionRequestV2 = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
    completion_identity: predecessor.request.completion_identity,
    expected_repository_row_identity:
      predecessor.request.expected_repository_row_identity,
    expected_evidence_bundle_identity:
      predecessor.request.expected_evidence_bundle_identity,
  };
  const anchor = structuredClone(
    predecessor.authority.expected_registry_anchor,
  ) as unknown as Record<string, unknown>;
  options.mutate_anchor_before_read?.(anchor);
  let reads = 0;
  const authority: RecommendationOutcomeEvidenceAuthorityV2 = {
    authority_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2,
    expected_registry_anchor:
      anchor as unknown as RecommendationOutcomeEvidenceAuthorityV2["expected_registry_anchor"],
    read_completion_material: () => {
      reads += 1;
      options.mutate_anchor_during_read?.(anchor);
      if (options.throw_on_read) {
        throw new Error("synthetic private completion source detail");
      }
      return structuredClone(
        options.material_override ?? material,
      );
    },
  };
  return {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_FIXTURES_V2,
    predecessor,
    request,
    material,
    authority,
    authority_read_count: () => reads,
  };
}

function matrixCase(
  id: string,
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2
  >,
  enabled = true,
  killSwitch = false,
) {
  const result =
    completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
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

export function buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV2(
  options: { reverse_input_order?: boolean } = {},
) {
  const fixtures: Array<
    [
      string,
      ReturnType<
        typeof createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2
      >,
    ]
  > = [
    [
      "completed_all_eighteen_gaps",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2(),
    ],
    [
      "completed_reordered_set",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
        reverse_closure_order: true,
      }),
    ],
    ...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1.map(
      (gapCode) =>
        [
          `incomplete:${gapCode}`,
          createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
            remove_gap_code: gapCode,
          }),
        ] as [
          string,
          ReturnType<
            typeof createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2
          >,
        ],
    ),
    [
      "incomplete_duplicate_closure",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
        duplicate_first_closure: true,
      }),
    ],
    [
      "incomplete_unknown_closure_field",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
        add_unknown_closure_field: true,
      }),
    ],
    [
      "conflicting_registry",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
        mutate_material: (material) => {
          (
            material.registry as Record<string, unknown>
          ).expected_trust_root_digest = "a".repeat(64);
        },
      }),
    ],
    [
      "not_point_in_time_safe",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
        mutate_material: (material) => {
          const bundle = material.observed_evidence_bundle as {
            instants: Record<string, string>;
          };
          bundle.instants.source_unix_ns =
            bundle.instants.decision_unix_ns;
        },
      }),
    ],
  ];
  const ordered = options.reverse_input_order
    ? [...fixtures].reverse()
    : fixtures;
  const scenarios = ordered
    .map(([id, fixture]) => matrixCase(id, fixture))
    .sort((left, right) => left.id.localeCompare(right.id));
  const defaultOffFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  scenarios.push(
    matrixCase("disabled_zero_work", defaultOffFixture, false, false),
  );
  const killSwitchFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  scenarios.push(
    matrixCase("kill_switch_zero_work", killSwitchFixture, true, true),
  );
  scenarios.sort((left, right) => left.id.localeCompare(right.id));
  const taxonomyCounts = scenarios.reduce<Record<string, number>>(
    (counts, scenario) => {
      counts[scenario.taxonomy] =
        (counts[scenario.taxonomy] ?? 0) + 1;
      return counts;
    },
    {},
  );
  return {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_FIXTURES_V2,
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
    scenario_count: scenarios.length,
    taxonomy_counts: taxonomyCounts,
    closed_gap_count:
      RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1.length,
    scenarios,
    result_digest: sha({
      scenarios,
      taxonomy_counts: taxonomyCounts,
    }),
  };
}
