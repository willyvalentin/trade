import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import {
  stableMarketContextDiagnosticContextJsonV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1";
import {
  buildSyntheticRecommendationOutcomeProjectionGoldenMatrixV1,
  buildSyntheticRecommendationOutcomeProjectionInteropV1,
  createSyntheticCurrentRecommendationOutcomeRowV1,
  createSyntheticRecommendationOutcomeProjectionFixtureV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-projection-successor-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_BOUNDARY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_TAXONOMY_V1,
  independentlyVerifyRecommendationOutcomeProjectionV1,
  projectRepositoryOwnedRecommendationOutcomeV1,
  type RecommendationOutcomeProjectionAuthorityV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-projection-successor-v1";

const repositoryRoot = resolve(__dirname, "../..");

function recursivelyFrozen(value: unknown): boolean {
  if (value === null || typeof value !== "object") return true;
  return (
    Object.isFrozen(value) &&
    Object.values(value).every((child) => recursivelyFrozen(child))
  );
}

function project(
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeProjectionFixtureV1
  >,
) {
  return projectRepositoryOwnedRecommendationOutcomeV1(fixture.request, {
    enabled: true,
    kill_switch: false,
    authority: fixture.authority,
  });
}

test("R.2 versions a closed taxonomy and diagnostic read-only boundary", () => {
  expect(RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1).toBe(
    "repository_owned_recommendation_outcome_projection_successor_v1",
  );
  expect(RECOMMENDATION_OUTCOME_PROJECTION_TAXONOMY_V1).toEqual([
    "bindable",
    "not_bindable",
    "conflicting",
    "not_point_in_time_safe",
    "unmappable",
  ]);
  expect(RECOMMENDATION_OUTCOME_PROJECTION_BOUNDARY_V1).toEqual({
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

test("fully synthetic repository-owned successor is bindable and deeply frozen", () => {
  const fixture =
    createSyntheticRecommendationOutcomeProjectionFixtureV1();
  const result = project(fixture);
  expect(result.taxonomy).toBe("bindable");
  expect(result.reason_codes).toEqual([
    "repository_owned_outcome_projection_bindable",
  ]);
  expect(result.bindable_projection?.q1_source_payload_digest).toMatch(
    /^[a-f0-9]{64}$/,
  );
  expect(result.authority_binding.verification_status).toBe("verified");
  expect(fixture.authority_read_count()).toBe(1);
  expect(recursivelyFrozen(result)).toBe(true);
});

test("current repository-shaped rows remain not_bindable without inference", () => {
  const fixture =
    createSyntheticRecommendationOutcomeProjectionFixtureV1({
      observed_input_override:
        createSyntheticCurrentRecommendationOutcomeRowV1(),
    });
  const result = project(fixture);
  expect(result.taxonomy).toBe("not_bindable");
  expect(result.bindable_projection).toBeNull();
  expect(result.reason_codes).toEqual([
    "completeness_proof_missing",
    "cryptographic_lineage_missing",
    "evaluator_identity_version_missing",
    "external_authority_root_missing",
    "finality_proof_missing",
    "immutable_membership_missing",
    "nanosecond_capture_instant_missing",
    "nanosecond_decision_instant_missing",
    "nanosecond_evidence_cutoff_missing",
    "nanosecond_outcome_finalization_instant_missing",
    "nanosecond_outcome_interval_missing",
    "predictor_point_in_time_binding_missing",
    "producer_owner_missing",
    "q1_interop_material_missing",
    "read_only_projection_missing",
    "recommendation_decision_identity_missing",
    "source_contract_version_missing",
    "source_snapshot_identity_digest_missing",
  ]);
});

test("each mandatory missing projection section has an exact reason code", () => {
  const cases = [
    ["producer_owner", "producer_owner_missing"],
    ["source_contract", "source_contract_version_missing"],
    ["external_authority_root_digest", "external_authority_root_missing"],
    ["source_snapshot", "source_snapshot_identity_digest_missing"],
    ["decision", "recommendation_decision_identity_missing"],
    ["opportunity_set", "immutable_membership_missing"],
    ["outcome", "evaluator_identity_version_missing"],
    ["finality", "finality_proof_missing"],
    ["completeness", "completeness_proof_missing"],
    ["lineage", "cryptographic_lineage_missing"],
    ["instants", "nanosecond_decision_instant_missing"],
    ["read_only_projection", "read_only_projection_missing"],
    ["point_in_time", "predictor_point_in_time_binding_missing"],
    ["q1_interop", "q1_interop_material_missing"],
  ] as const;
  for (const [field, reason] of cases) {
    const fixture =
      createSyntheticRecommendationOutcomeProjectionFixtureV1({
        mutate_input: (input) => {
          delete input[field];
        },
      });
    const result = project(fixture);
    expect(result.taxonomy, field).toBe("not_bindable");
    expect(result.reason_codes, field).toContain(reason);
    expect(result.bindable_projection, field).toBeNull();
  }
});

test("external authority cannot be caller-injected or self-substituted", () => {
  const fixture =
    createSyntheticRecommendationOutcomeProjectionFixtureV1();
  const injectedRequest = {
    ...fixture.request,
    expected_external_authority_root_digest: "a".repeat(64),
  };
  const injected = projectRepositoryOwnedRecommendationOutcomeV1(
    injectedRequest,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(injected.taxonomy).toBe("unmappable");
  expect(injected.reason_codes).toContain(
    "$request:closed_schema_violation",
  );

  const substituted =
    createSyntheticRecommendationOutcomeProjectionFixtureV1({
      mutate_input: (input) => {
        input.external_authority_root_digest = "b".repeat(64);
      },
    });
  const result = project(substituted);
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toEqual([
    "external_authority_root_mismatch",
  ]);
});

test("malformed nested Q.1/P.2A authority material cannot be called bindable", () => {
  const fixture =
    createSyntheticRecommendationOutcomeProjectionFixtureV1({
      mutate_input: (input) => {
        const q1 = input.q1_interop as {
          p2a_registry_anchor: {
            registry_snapshot_digest: string;
          };
        };
        q1.p2a_registry_anchor.registry_snapshot_digest = "c".repeat(64);
      },
    });
  const result = project(fixture);
  expect(result.taxonomy).toBe("not_bindable");
  expect(result.reason_codes).toContain(
    "q1_interop_material:source_registry_anchor_mismatch",
  );
});

test("nanosecond temporal boundary is exact and never uses float conversion", () => {
  const exactBoundary =
    createSyntheticRecommendationOutcomeProjectionFixtureV1({
      mutate_input: (input) => {
        const instants = input.instants as Record<string, string>;
        instants.outcome_start_unix_ns = instants.decision_unix_ns;
      },
    });
  expect(project(exactBoundary).taxonomy).toBe(
    "not_point_in_time_safe",
  );

  const plusOne =
    createSyntheticRecommendationOutcomeProjectionFixtureV1({
      mutate_input: (input) => {
        const instants = input.instants as Record<string, string>;
        instants.outcome_start_unix_ns = (
          BigInt(instants.decision_unix_ns) + BigInt(1)
        ).toString();
      },
    });
  expect(project(plusOne).taxonomy).toBe("bindable");
});

test("distinct rejected observed inputs cannot collide", () => {
  const left =
    createSyntheticRecommendationOutcomeProjectionFixtureV1({
      observed_input_override:
        createSyntheticCurrentRecommendationOutcomeRowV1("left"),
    });
  const right =
    createSyntheticRecommendationOutcomeProjectionFixtureV1({
      observed_input_override:
        createSyntheticCurrentRecommendationOutcomeRowV1("right"),
    });
  const leftResult = project(left);
  const rightResult = project(right);
  expect(leftResult.taxonomy).toBe(rightResult.taxonomy);
  expect(leftResult.reason_codes).toEqual(rightResult.reason_codes);
  expect(leftResult.failure_identity_digest).not.toBe(
    rightResult.failure_identity_digest,
  );
  expect(leftResult.result_digest).not.toBe(rightResult.result_digest);
});

test("post-verification mutation cannot alter a frozen result and rerun fails closed", () => {
  const fixture =
    createSyntheticRecommendationOutcomeProjectionFixtureV1();
  const first = project(fixture);
  const firstBytes =
    stableMarketContextDiagnosticContextJsonV1(first);
  const observed = fixture.material
    .observed_projection_input as {
    source_snapshot: { identity: string };
  };
  observed.source_snapshot.identity = "synthetic-post-verification-drift";
  expect(stableMarketContextDiagnosticContextJsonV1(first)).toBe(
    firstBytes,
  );
  const second = project(fixture);
  expect(second.taxonomy).toBe("conflicting");
  expect(second.reason_codes).toContain(
    "observed_projection_input_digest_mismatch",
  );
});

test("independent rebuild accepts exact output and rejects self-consistent tampering", () => {
  const fixture =
    createSyntheticRecommendationOutcomeProjectionFixtureV1();
  const result = project(fixture);
  expect(
    independentlyVerifyRecommendationOutcomeProjectionV1(
      result,
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    ),
  ).toBe(true);
  const tampered = structuredClone(result);
  tampered.taxonomy = "conflicting";
  tampered.reason_codes = ["self_consistent_caller_tampering"];
  tampered.result_digest = "f".repeat(64);
  expect(
    independentlyVerifyRecommendationOutcomeProjectionV1(
      tampered,
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    ),
  ).toBe(false);
});

test("unsupported runtime values and lookup exceptions are sanitized fail-closed", () => {
  const unsupported =
    createSyntheticRecommendationOutcomeProjectionFixtureV1({
      material_override: {
        value: BigInt(1),
      },
    });
  const unsupportedResult = project(unsupported);
  expect(unsupportedResult.taxonomy).toBe("unmappable");
  expect(JSON.stringify(unsupportedResult)).not.toContain("BigInt");

  const thrown =
    createSyntheticRecommendationOutcomeProjectionFixtureV1({
      throw_on_read: true,
    });
  const thrownResult = project(thrown);
  expect(thrownResult.taxonomy).toBe("not_bindable");
  expect(thrownResult.reason_codes).toEqual([
    "projection_authority_lookup_failed_sanitized",
  ]);
  expect(JSON.stringify(thrownResult)).not.toContain(
    "synthetic private source detail",
  );
});

test("default-off and kill switch perform zero request, clone, authority, projection, or digest work", () => {
  for (const mode of ["disabled", "kill_switch"] as const) {
    let requestReads = 0;
    let anchorReads = 0;
    let authorityReads = 0;
    const request = {};
    Object.defineProperty(request, "contract_version", {
      enumerable: true,
      get: () => {
        requestReads += 1;
        throw new Error("request must not be read");
      },
    });
    const authority: RecommendationOutcomeProjectionAuthorityV1 = {
      authority_version: RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
      get expected_registry_anchor():
        RecommendationOutcomeProjectionAuthorityV1["expected_registry_anchor"] {
        anchorReads += 1;
        throw new Error("anchor must not be read");
      },
      read_projection_material: () => {
        authorityReads += 1;
        throw new Error("material must not be read");
      },
    };
    const result = projectRepositoryOwnedRecommendationOutcomeV1(
      request,
      {
        enabled: mode !== "disabled",
        kill_switch: mode === "kill_switch",
        authority,
      },
    );
    expect(requestReads).toBe(0);
    expect(anchorReads).toBe(0);
    expect(authorityReads).toBe(0);
    expect(result.bindable_projection).toBeNull();
  }
});

test("full synthetic successor passes Q.1, P.2A, and O.2A without special cases", () => {
  const interop =
    buildSyntheticRecommendationOutcomeProjectionInteropV1();
  expect(interop.projection.taxonomy).toBe("bindable");
  expect(interop.q1_admission.taxonomy).toBe("ready");
  expect(interop.p2a_capture.taxonomy).toBe("captured");
  expect(interop.o2a_join.taxonomy).toBe("joined");
  expect(
    interop.o2a_join.predictor_projection?.predictor_digest,
  ).not.toBe(interop.o2a_join.label_projection?.label_digest);
});

test("synthetic golden matrix is deterministic and repository evidence is parity-bound", () => {
  const matrix =
    buildSyntheticRecommendationOutcomeProjectionGoldenMatrixV1();
  const evidence = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667r2-recommendation-outcome-projection-synthetic-golden.json",
      ),
      "utf8",
    ),
  ) as {
    contract_version: string;
    case_count: number;
    matrix_digest: string;
    taxonomy_counts: Record<string, number>;
    interop: Record<string, string>;
    synthetic_only: boolean;
    real_outcome_source_accessed: boolean;
  };
  const taxonomyCounts = Object.fromEntries(
    RECOMMENDATION_OUTCOME_PROJECTION_TAXONOMY_V1.map((taxonomy) => [
      taxonomy,
      matrix.cases.filter((entry) => entry.taxonomy === taxonomy).length,
    ]),
  );
  expect(evidence.contract_version).toBe(
    RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
  );
  expect(evidence.case_count).toBe(matrix.case_count);
  expect(evidence.matrix_digest).toBe(matrix.matrix_digest);
  expect(evidence.taxonomy_counts).toEqual(taxonomyCounts);
  expect(evidence.interop).toEqual(matrix.interop);
  expect(evidence.synthetic_only).toBe(true);
  expect(evidence.real_outcome_source_accessed).toBe(false);
});

test("fixed R.2 cross-process digest", () => {
  const matrix =
    buildSyntheticRecommendationOutcomeProjectionGoldenMatrixV1({
      reverse_input_order:
        process.env.ACTION_667R2_INPUT_ORDER === "reverse",
    });
  console.log(`ACTION_667R2_TZ_DIGEST=${matrix.matrix_digest}`);
  console.log(
    `ACTION_667R2_SUMMARY=${JSON.stringify({
      case_count: matrix.case_count,
      matrix_digest: matrix.matrix_digest,
      taxonomy_counts: Object.fromEntries(
        RECOMMENDATION_OUTCOME_PROJECTION_TAXONOMY_V1.map(
          (taxonomy) => [
            taxonomy,
            matrix.cases.filter((entry) => entry.taxonomy === taxonomy)
              .length,
          ],
        ),
      ),
      interop: matrix.interop,
    })}`,
  );
  expect(matrix.case_count).toBe(24);
});

test("UTC A/B, Stockholm reverse, and New York are byte-identical", () => {
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
        "tests/e2e/action-667r2-recommendation-outcome-projection-successor.spec.ts",
        "--grep",
        "fixed R.2 cross-process digest",
        "--reporter=line",
        "--output",
        `/private/tmp/action-667r2-${index}-${timezone.replaceAll("/", "-")}`,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          ACTION_667R2_INPUT_ORDER: order,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
        timeout: 120_000,
      },
    );
    expect(child.status, child.stderr).toBe(0);
    return child.stdout.match(/ACTION_667R2_TZ_DIGEST=([a-f0-9]{64})/)?.[1];
  });
  expect(digests.every((digest) => digest?.length === 64)).toBe(true);
  expect(new Set(digests).size).toBe(1);
});

test("R.2 scope has no provider, DB, writer, persistence, live, dependency, or 665/666 import", () => {
  const paths = [
    "lib/market-context-intelligence-lab/recommendation-outcome-projection-successor-v1.ts",
    "lib/market-context-intelligence-lab/recommendation-outcome-projection-successor-fixtures-v1.ts",
  ];
  const source = paths.map((path) => readFileSync(path, "utf8")).join("\n");
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:@databento|supabase|database|writer|persistence|scanner|publication|action-665|action-666)[^"']*["']/i,
  );
  expect(source).not.toContain("DATABENTO_API_KEY");
  expect(source).not.toMatch(/\bfetch\s*\(/);
  expect(source).not.toMatch(/\bprocess\.env\b/);
  expect(source).not.toMatch(
    /\b(writeFile|appendFile|createWriteStream|createClient|connect)\s*\(/,
  );
});
