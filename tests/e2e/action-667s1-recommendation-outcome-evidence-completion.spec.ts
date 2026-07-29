import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import {
  RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
  projectRepositoryOwnedRecommendationOutcomeV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-projection-successor-v1";
import {
  createSyntheticRecommendationOutcomeProjectionFixtureV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-projection-successor-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BOUNDARY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_TAXONOMY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
  completeRepositoryOwnedRecommendationOutcomeEvidenceV1,
  independentlyVerifyRecommendationOutcomeEvidenceCompletionV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1";
import {
  buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV1,
  buildSyntheticRecommendationOutcomeEvidenceCompletionInteropV1,
  createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-fixtures-v1";

const repositoryRoot = resolve(__dirname, "../..");

function complete(
  fixture = createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1(),
) {
  return completeRepositoryOwnedRecommendationOutcomeEvidenceV1(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
}

test("S.1 versions a closed taxonomy and diagnostic-only boundary", () => {
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_TAXONOMY_V1).toEqual([
    "completed",
    "incomplete",
    "conflicting",
    "not_point_in_time_safe",
    "unmappable",
  ]);
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BOUNDARY_V1).toEqual({
    diagnostic_only: true,
    shadow_only: true,
    read_only: true,
    real_outcome_source_accessed: false,
    canonical_performance_eligible: false,
    automatic_model_input_allowed: false,
    automatic_training_allowed: false,
    automatic_promotion_allowed: false,
    causal_claimed: false,
    live_ranking_effect: false,
  });
});

test("externally verified evidence closes exactly eighteen gaps", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const result = complete(fixture);
  expect(result.taxonomy, JSON.stringify(result.reason_codes)).toBe(
    "completed",
  );
  expect(result.closed_gap_codes).toEqual(
    RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
  );
  expect(result.completed_projection).not.toBeNull();
  expect(result.authority_binding.verification_status).toBe("verified");
  expect(fixture.authority_read_count()).toBe(1);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.completed_projection)).toBe(true);
});

test("each missing external closure remains incomplete with no projection", () => {
  for (const gapCode of RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1) {
    const fixture =
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
        mutate_bundle: (bundle) => {
          bundle.gap_closures = bundle.gap_closures.filter(
            (closure) => closure.gap_code !== gapCode,
          );
        },
        recompute_bundle_after_mutation: true,
      });
    const result = complete(fixture);
    expect(result.taxonomy, gapCode).toBe("incomplete");
    expect(result.reason_codes, gapCode).toContain(
      "all_eighteen_gap_closures_required",
    );
    expect(result.completed_projection, gapCode).toBeNull();
  }
});

test("caller-declared canonical authority is rejected before authority reads", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const result = completeRepositoryOwnedRecommendationOutcomeEvidenceV1(
    {
      ...fixture.request,
      canonical_authority: true,
      expected_trust_root_digest: "a".repeat(64),
    },
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(result.taxonomy).toBe("unmappable");
  expect(result.reason_codes).toContain("$request:closed_schema_violation");
  expect(fixture.authority_read_count()).toBe(0);
});

test("self-consistent trust-root replacement fails against external authority", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        bundle.external_authority_root_digest = "a".repeat(64);
        bundle.completed_projection.external_authority_root_digest =
          "a".repeat(64);
      },
      recompute_bundle_after_mutation: true,
      mutate_registry: (registry) => {
        registry.expected_trust_root_digest = "a".repeat(64);
      },
    });
  const result = complete(fixture);
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toEqual([
    "external_trust_or_lineage_root_mismatch",
  ]);
});

test("self-consistent model lineage replacement fails against external root", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        bundle.model.lineage_digest = "b".repeat(64);
        bundle.completed_projection.point_in_time.predictor_projection_digest =
          "b".repeat(64);
      },
      recompute_bundle_after_mutation: true,
    });
  const result = complete(fixture);
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toEqual([
    "external_trust_or_lineage_root_mismatch",
  ]);
});

test("immutable opportunity membership is digest-bound", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        bundle.opportunity_set.membership_digest = "c".repeat(64);
      },
      recompute_bundle_after_mutation: true,
    });
  const result = complete(fixture);
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toContain(
    "completed_projection_membership_binding_mismatch",
  );
  expect(result.completed_projection).toBeNull();
});

test("nanosecond source, receive, finalization and evaluation ordering is exact", () => {
  const exactBoundary = complete(
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1(),
  );
  expect(exactBoundary.taxonomy).toBe("completed");

  const unsafe = complete(
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        bundle.instants.source_unix_ns = (
          BigInt(bundle.instants.outcome_end_unix_ns) - BigInt(1)
        ).toString();
      },
      recompute_bundle_after_mutation: true,
    }),
  );
  expect(unsafe.taxonomy).toBe("not_point_in_time_safe");
  expect(unsafe.reason_codes).toEqual([
    "completion_evidence_temporal_order_invalid",
  ]);
  expect(unsafe.completed_projection).toBeNull();
});

test("projection temporal and proof bindings cannot drift from evidence", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        bundle.completed_projection.instants.capture_unix_ns = (
          BigInt(bundle.instants.evaluation_unix_ns) + BigInt(1)
        ).toString();
      },
      recompute_bundle_after_mutation: true,
    });
  const result = complete(fixture);
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toContain(
    "completed_projection_temporal_binding_mismatch",
  );
});

test("different rejected observed inputs have distinct forensic identities", () => {
  const left = complete(
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      row_suffix: "forensic-a",
      mutate_bundle: (bundle) => {
        bundle.gap_closures = bundle.gap_closures.slice(1);
      },
      recompute_bundle_after_mutation: true,
    }),
  );
  const right = complete(
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      row_suffix: "forensic-b",
      mutate_bundle: (bundle) => {
        bundle.gap_closures = bundle.gap_closures.slice(1);
      },
      recompute_bundle_after_mutation: true,
    }),
  );
  expect(left.taxonomy).toBe("incomplete");
  expect(right.taxonomy).toBe("incomplete");
  expect(left.reason_codes).toEqual(right.reason_codes);
  expect(left.failure_identity_digest).not.toBe(
    right.failure_identity_digest,
  );
  expect(left.result_digest).not.toBe(right.result_digest);
});

test("unsupported values and authority exceptions are sanitized fail-closed", () => {
  const malformed = complete(
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      observed_bundle_override: { unsupported: BigInt(1) },
    }),
  );
  expect(malformed.taxonomy).toBe("unmappable");
  expect(JSON.stringify(malformed)).not.toContain("BigInt");

  const thrownFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      throw_on_read: true,
    });
  const thrown = complete(thrownFixture);
  expect(thrown.taxonomy).toBe("incomplete");
  expect(thrown.reason_codes).toEqual([
    "completion_authority_lookup_failed_sanitized",
  ]);
  expect(JSON.stringify(thrown)).not.toContain(
    "synthetic private completion source detail",
  );
});

test("default-off and kill switch perform zero request or authority work", () => {
  for (const mode of ["disabled", "kill_switch"] as const) {
    let requestReads = 0;
    let authorityReads = 0;
    const request = new Proxy(
      {},
      {
        get() {
          requestReads += 1;
          throw new Error("request must not be read");
        },
        ownKeys() {
          requestReads += 1;
          throw new Error("request must not be cloned");
        },
      },
    );
    const result =
      completeRepositoryOwnedRecommendationOutcomeEvidenceV1(request, {
        enabled: mode !== "disabled",
        kill_switch: mode === "kill_switch",
        authority: {
          authority_version:
            "repository_owned_recommendation_outcome_evidence_authority_v1",
          expected_registry_anchor: {
            registry_identity: "must-not-read",
            registry_version:
              "repository_owned_recommendation_outcome_evidence_registry_v1",
            registry_digest: "0".repeat(64),
            expected_trust_root_digest: "0".repeat(64),
            expected_lineage_root_digest: "0".repeat(64),
          },
          read_completion_material: () => {
            authorityReads += 1;
            throw new Error("must not read");
          },
        },
      });
    expect(result.taxonomy).toBe("incomplete");
    expect(requestReads).toBe(0);
    expect(authorityReads).toBe(0);
  }
});

test("independent rebuild accepts exact result and rejects tampering", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const result = complete(fixture);
  const verificationFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  expect(
    independentlyVerifyRecommendationOutcomeEvidenceCompletionV1(
      result,
      verificationFixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: verificationFixture.authority,
      },
    ),
  ).toBe(true);
  const tampered = structuredClone(result);
  tampered.reason_codes = ["self_consistent_completion_tampering"];
  tampered.result_digest = "d".repeat(64);
  const tamperedFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  expect(
    independentlyVerifyRecommendationOutcomeEvidenceCompletionV1(
      tampered,
      tamperedFixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: tamperedFixture.authority,
      },
    ),
  ).toBe(false);
});

test("completed projection passes R.2, Q.1, P.2A and O.2A unchanged", () => {
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceCompletionInteropV1();
  expect(interop.completion.taxonomy).toBe("completed");
  expect(interop.projection.contract_version).toBe(
    RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
  );
  expect(interop.projection.taxonomy).toBe("bindable");
  expect(interop.q1_admission.taxonomy).toBe("ready");
  expect(interop.p2a_capture.taxonomy).toBe("captured");
  expect(interop.o2a_join.taxonomy).toBe("joined");
  expect(
    interop.o2a_join.predictor_projection?.predictor_digest,
  ).not.toBe(interop.o2a_join.label_projection?.label_digest);
});

test("non-completed terminal results never expose an R.2 projection", () => {
  const matrix =
    buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV1();
  expect(
    matrix.cases
      .filter((entry) => entry.taxonomy !== "completed")
      .every((entry) => entry.failure_identity_digest !== null),
  ).toBe(true);
  for (const gapCode of RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1) {
    const result = complete(
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
        mutate_bundle: (bundle) => {
          bundle.gap_closures = bundle.gap_closures.filter(
            (closure) => closure.gap_code !== gapCode,
          );
        },
        recompute_bundle_after_mutation: true,
      }),
    );
    expect(result.completed_projection).toBeNull();
  }
});

test("synthetic golden matrix is deterministic and evidence-bound", () => {
  const matrix =
    buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV1();
  const evidence = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667s1-recommendation-outcome-evidence-completion-synthetic-golden.json",
      ),
      "utf8",
    ),
  ) as {
    contract_version: string;
    case_count: number;
    matrix_digest: string;
    taxonomy_counts: Record<string, number>;
    interop: Record<string, string>;
    original_gap_count: number;
    synthetic_only: boolean;
    real_outcome_source_accessed: boolean;
  };
  expect(evidence.contract_version).toBe(
    RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
  );
  expect(evidence.case_count).toBe(matrix.case_count);
  expect(evidence.matrix_digest).toBe(matrix.matrix_digest);
  expect(evidence.taxonomy_counts).toEqual(matrix.taxonomy_counts);
  expect(evidence.interop).toEqual(matrix.interop);
  expect(evidence.original_gap_count).toBe(18);
  expect(evidence.synthetic_only).toBe(true);
  expect(evidence.real_outcome_source_accessed).toBe(false);
});

test("fixed S.1 cross-process digest", () => {
  const matrix =
    buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV1({
      reverse_input_order:
        process.env.ACTION_667S1_INPUT_ORDER === "reverse",
    });
  console.log(`ACTION_667S1_TZ_DIGEST=${matrix.matrix_digest}`);
  console.log(
    `ACTION_667S1_SUMMARY=${JSON.stringify({
      case_count: matrix.case_count,
      matrix_digest: matrix.matrix_digest,
      taxonomy_counts: matrix.taxonomy_counts,
      interop: matrix.interop,
    })}`,
  );
  expect(matrix.case_count).toBe(27);
});

test("UTC A/B, Stockholm reverse and New York are byte-identical", () => {
  test.setTimeout(180_000);
  const runs = [
    ["UTC", "canonical"],
    ["UTC", "canonical"],
    ["Europe/Stockholm", "reverse"],
    ["America/New_York", "canonical"],
  ] as const;
  const digests = runs.map(([timezone, order], index) => {
    const child = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        "tests/e2e/action-667s1-recommendation-outcome-evidence-completion.spec.ts",
        "--grep",
        "fixed S.1 cross-process digest",
        "--reporter=line",
        "--output",
        `/private/tmp/action-667s1-${index}-${timezone.replaceAll("/", "-")}`,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          ACTION_667S1_INPUT_ORDER: order,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
        timeout: 120_000,
      },
    );
    expect(child.status, child.stderr).toBe(0);
    return child.stdout.match(/ACTION_667S1_TZ_DIGEST=([a-f0-9]{64})/)?.[1];
  });
  expect(digests.every((digest) => digest?.length === 64)).toBe(true);
  expect(new Set(digests).size).toBe(1);
});

test("S.1 scope has no provider, DB, writer, persistence, live or dependency import", () => {
  const paths = [
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1.ts",
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-fixtures-v1.ts",
  ];
  const source = paths.map((path) => readFileSync(path, "utf8")).join("\n");
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:@databento|supabase|database|writer|persistence|scanner|publication|action-665|action-666)[^"']*["']/i,
  );
  expect(source).not.toContain("DATABENTO_API_KEY");
  expect(source).not.toMatch(/\b(fetch|WebSocket|EventSource)\s*\(/);
});

test("the five-artifact S.1 scope is exact", () => {
  const expected = [
    "docs/action-667s1-recommendation-outcome-evidence-completion.md",
    "docs/evidence/action-667s1-recommendation-outcome-evidence-completion-synthetic-golden.json",
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-fixtures-v1.ts",
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1.ts",
    "tests/e2e/action-667s1-recommendation-outcome-evidence-completion.spec.ts",
  ];
  expect(expected).toHaveLength(5);
  const projectionFixture =
    createSyntheticRecommendationOutcomeProjectionFixtureV1();
  const r2 = projectRepositoryOwnedRecommendationOutcomeV1(
    projectionFixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: projectionFixture.authority,
    },
  );
  expect(r2.taxonomy).toBe("bindable");
});
