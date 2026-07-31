import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V1,
  buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV1,
  buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV1,
  createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1,
  reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_ENVELOPE_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_SNAPSHOT_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1,
  computeRecommendationOutcomeEvidenceAdmissionResultDigestV1,
  admitRecommendationOutcomeEvidenceV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-v1";

const repositoryRoot = resolve(__dirname, "../..");
const implementationPath = resolve(
  repositoryRoot,
  "lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-v1.ts",
);
const fixturesPath = resolve(
  repositoryRoot,
  "lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-fixtures-v1.ts",
);
const goldenPath = resolve(
  repositoryRoot,
  "docs/evidence/action-667u1-recommendation-outcome-evidence-admission-synthetic-golden.json",
);

function admit(
  fixture = createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1(),
) {
  return admitRecommendationOutcomeEvidenceV1(fixture.candidate_json, {
    enabled: true,
    kill_switch: false,
    trusted_authority_json: fixture.trusted_authority_json,
  });
}

function scenario(id: string) {
  return buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV1()
    .scenarios.find((entry) => entry.id === id);
}

function expectNonIssuedZeroWork(
  result: ReturnType<typeof admitRecommendationOutcomeEvidenceV1>,
) {
  expect(result.taxonomy).not.toBe("admitted");
  expect(result.admission_request_constructed).toBe(false);
  expect(result.t_v4_rebuild_called).toBe(false);
  expect(result.downstream_digest_work).toBe(false);
  expect(result.t_v4_result_digest).toBeNull();
  expect(result.admitted_snapshot_digest).toBeNull();
}

test("U.1 exposes a versioned V4-only admission contract", () => {
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_v1",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_ENVELOPE_V1).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_envelope_v1",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_AUTHORITY_V1).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_authority_v1",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_SNAPSHOT_V1).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_snapshot_v1",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V1).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_fixtures_v1",
  );
});

test("final T V4 evidence is independently rebuilt and admitted", () => {
  const result = admit();
  expect(result.taxonomy).toBe("admitted");
  expect(result.reason_codes).toEqual([]);
  expect(result.t_v4_result_digest).toMatch(/^[a-f0-9]{64}$/);
  expect(result.eighteen_gap_binding_digest).toMatch(/^[a-f0-9]{64}$/);
  expect(result.admitted_snapshot_digest).toMatch(/^[a-f0-9]{64}$/);
  expect(result.admission_request_constructed).toBe(true);
  expect(result.t_v4_rebuild_called).toBe(true);
  expect(result.downstream_digest_work).toBe(true);
  expect(computeRecommendationOutcomeEvidenceAdmissionResultDigestV1(result))
    .toBe(result.result_digest);
});

test("candidate is read once into a deep-frozen parser-owned snapshot", () => {
  const result = admit();
  expect(result.audit).toEqual(expect.objectContaining({
    candidate_input_read_count: 1,
    candidate_descriptor_pass_count: 1,
    candidate_getter_execution_count: 0,
    candidate_proxy_hook_execution_count: 0,
    candidate_callback_execution_count: 0,
    trusted_authority_read_count: 1,
    caller_input_reread_count: 0,
    candidate_snapshot_deep_frozen: true,
    verified_snapshot_only_downstream: true,
  }));
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.audit)).toBe(true);
});

test("proxy/getter/callback objects are rejected without hook execution", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  let ownKeysCalls = 0;
  let getterCalls = 0;
  const candidate = new Proxy(
    Object.defineProperty({}, "evidence", {
      get: () => {
        getterCalls += 1;
        return fixture.candidate_json;
      },
    }),
    {
      ownKeys: () => {
        ownKeysCalls += 1;
        return [];
      },
    },
  );
  const result = admitRecommendationOutcomeEvidenceV1(candidate, {
    enabled: true,
    kill_switch: false,
    trusted_authority_json: fixture.trusted_authority_json,
  });
  expectNonIssuedZeroWork(result);
  expect(ownKeysCalls).toBe(0);
  expect(getterCalls).toBe(0);
  expect(result.reason_codes).toContain(
    "admission_candidate:canonical_json_string_required",
  );
});

test("V1 through V3 and unknown T versions are rejected", () => {
  for (
    const id of [
      "historical_v1_rejected",
      "historical_v2_rejected",
      "historical_v3_rejected",
      "unknown_version_rejected",
    ]
  ) {
    const entry = scenario(id);
    expect(entry).toBeDefined();
    expect(entry?.taxonomy).toBe("unmappable");
    expect(entry?.admission_request_constructed).toBe(false);
    expect(entry?.t_v4_rebuild_called).toBe(false);
    expect(entry?.downstream_digest_work).toBe(false);
  }
});

test("every non-issued T taxonomy stops before admission construction", () => {
  for (
    const id of [
      "incomplete_non_issued_zero_work",
      "conflicting_non_issued_zero_work",
      "unsafe_non_issued_zero_work",
      "unmappable_non_issued_zero_work",
    ]
  ) {
    const entry = scenario(id);
    expect(entry).toBeDefined();
    expect(entry?.taxonomy).not.toBe("admitted");
    expect(entry?.admission_request_constructed).toBe(false);
    expect(entry?.t_v4_rebuild_called).toBe(false);
    expect(entry?.downstream_digest_work).toBe(false);
    expect(entry?.trusted_authority_read_count).toBe(0);
  }
});

test("all eighteen completion gaps are explicitly bound without inference", () => {
  expect(RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1).toHaveLength(18);
  const admitted = admit();
  expect(admitted.eighteen_gap_binding_digest).toMatch(/^[a-f0-9]{64}$/);
  const tampered = scenario("eighteen_gap_tamper");
  expect(tampered?.taxonomy).toBe("conflicting");
  expect(tampered?.reason_codes).toContain(
    "all_eighteen_gap_bindings_required_without_inference",
  );
});

test("external authority root cannot be replaced by the candidate", () => {
  const mismatch = scenario("trusted_authority_mismatch");
  expect(mismatch?.taxonomy).toBe("conflicting");
  expect(mismatch?.reason_codes).toContain(
    "external_t_v4_authority_anchor_mismatch",
  );
});

test("supplied result digests are rebuilt rather than trusted", () => {
  const tampered = scenario("supplied_digest_tamper");
  expect(tampered?.taxonomy).toBe("conflicting");
  expect(tampered?.reason_codes).toContain(
    "independent_t_v4_digest_rebuild_mismatch",
  );
  expect(tampered?.t_v4_rebuild_called).toBe(true);
});

test("lineage, membership and temporal finality remain V4-bound", () => {
  const lineage = scenario("lineage_tamper");
  expect(lineage?.taxonomy).not.toBe("admitted");
  const unsafe = scenario("unsafe_non_issued_zero_work");
  expect(unsafe?.taxonomy).toBe("not_point_in_time_safe");
  expect(unsafe?.admission_request_constructed).toBe(false);
});

test("closed envelope schema rejects additional caller authority claims", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  const candidate = {
    ...fixture.candidate,
    caller_declared_canonical: true,
  };
  const result = admitRecommendationOutcomeEvidenceV1(
    reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
      candidate as never,
    ),
    {
      enabled: true,
      kill_switch: false,
      trusted_authority_json: fixture.trusted_authority_json,
    },
  );
  expectNonIssuedZeroWork(result);
  expect(result.reason_codes).toContain(
    "admission_candidate:closed_schema_violation",
  );
});

test("failure provenance separates equal-reason rejected observations", () => {
  const a = scenario("failure_collision_observation_a");
  const b = scenario("failure_collision_observation_b");
  expect(a?.reason_codes).toEqual(b?.reason_codes);
  expect(a?.failure_identity_digest).not.toBe(b?.failure_identity_digest);
  expect(a?.result_digest).not.toBe(b?.result_digest);
});

test("exact duplicate admission is pure and idempotent", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  const first = admit(fixture);
  const second = admit(fixture);
  expect(second).toEqual(first);
  expect(second.result_digest).toBe(first.result_digest);
  expect(second.admitted_snapshot_digest).toBe(
    first.admitted_snapshot_digest,
  );
});

test("default-off and kill switch perform zero input/authority/downstream work", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  for (
    const dependencies of [
      { enabled: false, kill_switch: false },
      { enabled: true, kill_switch: true },
    ]
  ) {
    const result = admitRecommendationOutcomeEvidenceV1(
      fixture.candidate_json,
      {
        ...dependencies,
        trusted_authority_json: fixture.trusted_authority_json,
      },
    );
    expectNonIssuedZeroWork(result);
    expect(result.audit.candidate_input_read_count).toBe(0);
    expect(result.audit.trusted_authority_read_count).toBe(0);
  }
});

test("malformed input fails closed with sanitized deterministic identity", () => {
  const entry = scenario("malformed_json");
  expect(entry?.taxonomy).toBe("unmappable");
  expect(entry?.reason_codes).toEqual([
    "admission_candidate:malformed_json_sanitized",
  ]);
  expect(entry?.failure_identity_digest).toMatch(/^[a-f0-9]{64}$/);
});

test("full synthetic V4 to S.2A/R.2/Q.1/P.2A/O.2A interop passes", () => {
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV1();
  expect(interop.t_v4_admission.taxonomy).toBe("admitted");
  expect(interop.s2a_completion.taxonomy).toBe("completed");
  expect(interop.r2_projection.taxonomy).toBe("bindable");
  expect(interop.q1_admission.taxonomy).toBe("ready");
  expect(interop.p2a_capture.taxonomy).toBe("captured");
  expect(interop.o2a_join.taxonomy).toBe("joined");
});

test("golden matrix is deterministic under reversed input order", () => {
  const forward =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV1();
  const reverse =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV1({
      reverse_input_order: true,
    });
  expect(reverse).toEqual(forward);
  expect(forward.scenario_count).toBe(18);
  expect(forward.taxonomy_counts.admitted).toBe(1);
  expect(forward.interop).toEqual({
    t_v4_admission_taxonomy: "admitted",
    s2a_completion_taxonomy: "completed",
    r2_projection_taxonomy: "bindable",
    q1_admission_taxonomy: "ready",
    p2a_capture_taxonomy: "captured",
    o2a_join_taxonomy: "joined",
  });
});

test("checked-in golden report has exact JSON parity", () => {
  const expected =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV1();
  const observed = JSON.parse(readFileSync(goldenPath, "utf8"));
  expect(observed).toEqual(expected);
});

test("boundary remains diagnostic, read-only and non-promotable", () => {
  expect(admit()).toEqual(expect.objectContaining({
    diagnostic_only: true,
    shadow_only: true,
    read_only: true,
    real_outcome_source_accessed: false,
    official_ohlcv: false,
    canonical_performance_eligible: false,
    automatic_model_input_allowed: false,
    automatic_training_allowed: false,
    automatic_promotion_allowed: false,
    causal_claimed: false,
    live_ranking_effect: false,
  }));
});

test("U scope has no provider, DB, writer, persistence or live imports", () => {
  const source = [
    readFileSync(implementationPath, "utf8"),
    readFileSync(fixturesPath, "utf8"),
  ].join("\n");
  expect(source).not.toMatch(/@supabase|databento|from ["']openai["']/);
  expect(source).not.toMatch(/lib\/server|persistence|migration|live-ranking/);
  expect(source).not.toContain("Action 665");
  expect(source).not.toContain("Action 666");
  expect(source).toContain(
    "RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4",
  );
});
