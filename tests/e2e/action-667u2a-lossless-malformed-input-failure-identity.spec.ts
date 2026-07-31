import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V2,
  buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2,
  buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV2,
  createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-fixtures-v2";
import {
  admitRecommendationOutcomeEvidenceV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FAILURE_IDENTITY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_OBSERVATION_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS,
  admitRecommendationOutcomeEvidenceV2,
  computeRecommendationOutcomeEvidenceAdmissionFailureIdentityV2,
  computeRecommendationOutcomeEvidenceAdmissionObservationDigestV2,
  computeRecommendationOutcomeEvidenceAdmissionResultDigestV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-v2";

const repositoryRoot = resolve(__dirname, "../..");
const goldenPath = resolve(
  repositoryRoot,
  "docs/evidence/action-667u2a-lossless-malformed-input-failure-identity-synthetic-golden.json",
);

function admit(candidate: unknown, authority: unknown) {
  return admitRecommendationOutcomeEvidenceV2(candidate, authority, {
    enabled: true,
    kill_switch: false,
  });
}

function scenario(id: string) {
  return buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2()
    .scenarios.find((entry) => entry.id === id);
}

test("V2 exposes versioned lossless observation and failure identities", () => {
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_v2",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_OBSERVATION_V2).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_observation_v2",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FAILURE_IDENTITY_V2).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_failure_identity_v2",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V2).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_fixtures_v2",
  );
});

test("U2-001 is reproduced against U.1 and closed by V2 for candidates", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const malformedA = "{\"candidate_a\":";
  const malformedB = "{\"candidate_b\":";
  const v1A = admitRecommendationOutcomeEvidenceV1(malformedA, {
    enabled: true,
    kill_switch: false,
    trusted_authority_json: fixture.authority_input,
  });
  const v1B = admitRecommendationOutcomeEvidenceV1(malformedB, {
    enabled: true,
    kill_switch: false,
    trusted_authority_json: fixture.authority_input,
  });
  expect(v1A.failure_identity_digest).toBe(v1B.failure_identity_digest);
  expect(v1A.result_digest).toBe(v1B.result_digest);

  const v2A = admit(malformedA, fixture.authority_input);
  const v2B = admit(malformedB, fixture.authority_input);
  expect(v2A.reason_codes).toEqual(v2B.reason_codes);
  expect(v2A.observations.candidate.exact_utf8_sha256).not.toBe(
    v2B.observations.candidate.exact_utf8_sha256,
  );
  expect(v2A.observations.candidate.observation_digest).not.toBe(
    v2B.observations.candidate.observation_digest,
  );
  expect(v2A.failure_identity_digest).not.toBe(v2B.failure_identity_digest);
  expect(v2A.result_digest).not.toBe(v2B.result_digest);
});

test("U2-001 is reproduced against U.1 and closed by V2 for authority", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const malformedA = "{\"authority_a\":";
  const malformedB = "{\"authority_b\":";
  const v1A = admitRecommendationOutcomeEvidenceV1(
    fixture.candidate_input,
    {
      enabled: true,
      kill_switch: false,
      trusted_authority_json: malformedA,
    },
  );
  const v1B = admitRecommendationOutcomeEvidenceV1(
    fixture.candidate_input,
    {
      enabled: true,
      kill_switch: false,
      trusted_authority_json: malformedB,
    },
  );
  expect(v1A.failure_identity_digest).toBe(v1B.failure_identity_digest);
  expect(v1A.result_digest).toBe(v1B.result_digest);

  const v2A = admit(fixture.candidate_input, malformedA);
  const v2B = admit(fixture.candidate_input, malformedB);
  expect(v2A.reason_codes).toEqual(v2B.reason_codes);
  expect(v2A.observations.authority.observation_digest).not.toBe(
    v2B.observations.authority.observation_digest,
  );
  expect(v2A.failure_identity_digest).not.toBe(v2B.failure_identity_digest);
  expect(v2A.result_digest).not.toBe(v2B.result_digest);
});

test("pre-parse observations bind exact UTF-8 length and SHA-256", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const malformed = "{\"label\":\"å\",\"tail\":";
  const result = admit(malformed, fixture.authority_input);
  const observed = result.observations.candidate;
  expect(observed.primitive_type_tag).toBe("string");
  expect(observed.string_code_unit_length).toBe(malformed.length);
  expect(observed.utf8_byte_length).toBe(Buffer.byteLength(malformed, "utf8"));
  expect(observed.exact_utf8_sha256).toBe(
    createHash("sha256").update(Buffer.from(malformed, "utf8")).digest("hex"),
  );
  expect(observed.parse_stage).toBe("json_parse");
  expect(observed.sanitized_reason_codes).toEqual([
    "candidate:malformed_json_sanitized",
  ]);
  expect(observed.observation_digest).toBe(
    computeRecommendationOutcomeEvidenceAdmissionObservationDigestV2(
      observed,
    ),
  );
});

test("candidate and authority roles domain-separate identical bytes", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const result = admit(fixture.candidate_input, fixture.candidate_input);
  const candidate = result.observations.candidate;
  const authority = result.observations.authority;
  expect(candidate.exact_utf8_sha256).toBe(authority.exact_utf8_sha256);
  expect(candidate.role).toBe("candidate");
  expect(authority.role).toBe("authority");
  expect(candidate.observation_digest).not.toBe(authority.observation_digest);
});

test("empty, truncated, invalid and valid-schema-invalid inputs stay distinct", () => {
  const ids = [
    "empty_candidate",
    "truncated_candidate_a",
    "truncated_candidate_b",
    "invalid_json_token",
    "valid_json_invalid_schema",
  ];
  const entries = ids.map(scenario);
  expect(entries.every(Boolean)).toBe(true);
  expect(new Set(entries.map((entry) =>
    entry?.candidate.observation_digest
  )).size).toBe(ids.length);
  expect(new Set(entries.map((entry) => entry?.result_digest)).size).toBe(
    ids.length,
  );
  expect(scenario("valid_json_invalid_schema")?.candidate.parse_stage).toBe(
    "schema_delegation_ready",
  );
});

test("Unicode normalization, NUL and invalid surrogate cases are lossless", () => {
  const nfc = scenario("unicode_nfc_truncated");
  const nfd = scenario("unicode_nfd_truncated");
  expect(nfc?.candidate.exact_utf8_sha256).not.toBe(
    nfd?.candidate.exact_utf8_sha256,
  );

  const nul = scenario("embedded_nul_candidate");
  expect(nul?.candidate.parse_stage).toBe("json_parse");
  const high = scenario("unpaired_high_surrogate");
  const low = scenario("unpaired_low_surrogate");
  const escaped = scenario("escaped_unpaired_surrogate");
  expect(high?.candidate.exact_code_unit_sha256).not.toBe(
    low?.candidate.exact_code_unit_sha256,
  );
  expect(high?.candidate.observation_digest).not.toBe(
    low?.candidate.observation_digest,
  );
  expect(escaped?.candidate.parse_stage).toBe("bounded_validation");
  expect(new Set([high?.result_digest, low?.result_digest, escaped?.result_digest]).size)
    .toBe(3);
});

test("candidate byte budget accepts minus one/exact and rejects plus one", () => {
  const below = scenario("candidate_budget_minus_one");
  const exact = scenario("candidate_budget_exact");
  const above = scenario("candidate_budget_plus_one");
  const maximum =
    RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS.candidate
      .max_utf8_bytes;
  expect(below?.candidate.utf8_byte_length).toBe(maximum - 1);
  expect(exact?.candidate.utf8_byte_length).toBe(maximum);
  expect(above?.candidate.utf8_byte_length).toBe(maximum + 1);
  expect(below?.taxonomy).toBe("admitted");
  expect(exact?.taxonomy).toBe("admitted");
  expect(above?.taxonomy).toBe("unmappable");
  expect(above?.reason_codes).toContain(
    "candidate:utf8_byte_budget_exceeded",
  );
});

test("authority byte budget accepts minus one/exact and rejects plus one", () => {
  const below = scenario("authority_budget_minus_one");
  const exact = scenario("authority_budget_exact");
  const above = scenario("authority_budget_plus_one");
  const maximum =
    RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS.authority
      .max_utf8_bytes;
  expect(below?.authority.utf8_byte_length).toBe(maximum - 1);
  expect(exact?.authority.utf8_byte_length).toBe(maximum);
  expect(above?.authority.utf8_byte_length).toBe(maximum + 1);
  expect(below?.taxonomy).toBe("admitted");
  expect(exact?.taxonomy).toBe("admitted");
  expect(above?.taxonomy).toBe("conflicting");
  expect(above?.reason_codes).toContain(
    "authority:utf8_byte_budget_exceeded",
  );
});

test("bounded iterative parse validation rejects depth exhaustion", () => {
  const entry = scenario("bounded_parse_depth_exceeded");
  expect(entry?.taxonomy).toBe("unmappable");
  expect(entry?.candidate.parse_stage).toBe("bounded_validation");
  expect(entry?.reason_codes).toContain(
    "candidate:bounded_validation:depth_budget_exceeded",
  );
});

test("parser exceptions are sanitized and raw attacker text never escapes", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const marker = "CALLER_CONTROLLED_PARSER_MESSAGE_667U2A";
  const result = admit(`{"${marker}":`, fixture.authority_input);
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain(marker);
  expect(result.reason_codes).toEqual([
    "candidate:malformed_json_sanitized",
  ]);
});

test("object, proxy and coercion hooks are rejected without execution", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  let ownKeys = 0;
  let getter = 0;
  let coercion = 0;
  const input = new Proxy(
    Object.defineProperties({}, {
      payload: {
        enumerable: true,
        get() {
          getter += 1;
          return fixture.candidate_input;
        },
      },
      toString: {
        value() {
          coercion += 1;
          return fixture.candidate_input;
        },
      },
    }),
    {
      ownKeys() {
        ownKeys += 1;
        return [];
      },
    },
  );
  const result = admit(input, fixture.authority_input);
  expect(result.taxonomy).toBe("unmappable");
  expect(ownKeys).toBe(0);
  expect(getter).toBe(0);
  expect(coercion).toBe(0);
  expect(result.audit).toEqual(expect.objectContaining({
    candidate_input_read_count: 1,
    authority_input_read_count: 0,
    candidate_getter_execution_count: 0,
    proxy_hook_execution_count: 0,
    coercion_hook_execution_count: 0,
    caller_callback_execution_count: 0,
    caller_input_reread_count: 0,
  }));
});

test("non-issued inputs preserve zero authority and downstream work", () => {
  const entry = scenario("non_issued_zero_work");
  expect(entry?.taxonomy).not.toBe("admitted");
  expect(entry?.audit).toEqual(expect.objectContaining({
    candidate_input_read_count: 1,
    authority_input_read_count: 0,
    admission_request_constructed: false,
    t_v4_rebuild_called: false,
    downstream_digest_work: false,
  }));
});

test("T V4 authority, eighteen gaps and closed taxonomy remain preserved", () => {
  expect(RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1).toHaveLength(18);
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const admitted = admit(fixture.candidate_input, fixture.authority_input);
  expect(admitted.taxonomy).toBe("admitted");
  expect(admitted.eighteen_gap_binding_digest).toMatch(/^[a-f0-9]{64}$/);
  expect(admitted.audit).toEqual(expect.objectContaining({
    candidate_input_read_count: 1,
    authority_input_read_count: 1,
    caller_input_reread_count: 0,
    canonical_snapshots_deep_frozen: true,
    verified_snapshot_only_downstream: true,
  }));
  const allowed = new Set([
    "admitted",
    "rejected",
    "conflicting",
    "not_point_in_time_safe",
    "unmappable",
  ]);
  for (
    const entry of
      buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2()
        .scenarios
  ) {
    expect(allowed.has(entry.taxonomy), entry.id).toBe(true);
  }
});

test("failure and result digests rebuild independently and reject tampering", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const result = admit("{invalid-json}", fixture.authority_input);
  expect(result.failure_identity_digest).toBe(
    computeRecommendationOutcomeEvidenceAdmissionFailureIdentityV2(result),
  );
  expect(result.result_digest).toBe(
    computeRecommendationOutcomeEvidenceAdmissionResultDigestV2(result),
  );
  const tampered = structuredClone(result);
  tampered.observations.candidate.exact_utf8_sha256 = "f".repeat(64);
  expect(
    computeRecommendationOutcomeEvidenceAdmissionObservationDigestV2(
      tampered.observations.candidate,
    ),
  ).not.toBe(tampered.observations.candidate.observation_digest);
  expect(
    computeRecommendationOutcomeEvidenceAdmissionResultDigestV2(tampered),
  ).not.toBe(tampered.result_digest);
});

test("default-off and kill switch perform zero observed or downstream work", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  for (
    const controls of [
      { enabled: false, kill_switch: false },
      { enabled: true, kill_switch: true },
    ]
  ) {
    const result = admitRecommendationOutcomeEvidenceV2(
      fixture.candidate_input,
      fixture.authority_input,
      controls,
    );
    expect(result.audit).toEqual(expect.objectContaining({
      candidate_input_read_count: 0,
      authority_input_read_count: 0,
      admission_request_constructed: false,
      t_v4_rebuild_called: false,
      downstream_digest_work: false,
    }));
    expect(result.observations.candidate.disposition).toBe("not_observed");
    expect(result.observations.authority.disposition).toBe("not_observed");
  }
});

test("full V4 through S.2A/R.2/Q.1/P.2A/O.2A interop remains intact", () => {
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV2();
  expect(interop.admission.taxonomy).toBe("admitted");
  expect(interop.s2a_completion.taxonomy).toBe("completed");
  expect(interop.r2_projection.taxonomy).toBe("bindable");
  expect(interop.q1_admission.taxonomy).toBe("ready");
  expect(interop.p2a_capture.taxonomy).toBe("captured");
  expect(interop.o2a_join.taxonomy).toBe("joined");
});

test("golden matrix is reversed-order, cross-process and cross-TZ deterministic", () => {
  const forward =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2();
  const reverse =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2({
      reverse_input_order: true,
    });
  expect(reverse).toEqual(forward);
  const script = [
    "const m=await import('./lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-fixtures-v2.ts');",
    "const f=m.default?.buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2??m.buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2;",
    "process.stdout.write(JSON.stringify(f()));",
  ].join("");
  const outputs = ["UTC", "Europe/Stockholm", "America/New_York"].map(
    (timezone) => {
      const child = spawnSync(
        process.execPath,
        ["--import", "jiti/register", "-e", script],
        {
          cwd: repositoryRoot,
          encoding: "utf8",
          env: { ...process.env, TZ: timezone },
          maxBuffer: 8 * 1024 * 1024,
        },
      );
      expect(child.status, child.stderr).toBe(0);
      return child.stdout;
    },
  );
  expect(new Set(outputs).size).toBe(1);
  expect(JSON.parse(outputs[0])).toEqual(forward);
});

test("checked-in synthetic golden report has exact runtime parity", () => {
  expect(JSON.parse(readFileSync(goldenPath, "utf8"))).toEqual(
    buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2(),
  );
});

test("implementation remains read-only, diagnostic and dependency-neutral", () => {
  const result = admit(
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2()
      .candidate_input,
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2()
      .authority_input,
  );
  expect(result).toEqual(expect.objectContaining({
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
  const source = readFileSync(
    resolve(
      repositoryRoot,
      "lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-v2.ts",
    ),
    "utf8",
  );
  for (
    const forbidden of [
      "@supabase/",
      "fetch(",
      "axios",
      "prisma",
      "drizzle",
      "writeFile",
      "appendFile",
      "recommendation-store",
      "live-ranking",
    ]
  ) {
    expect(source).not.toContain(forbidden);
  }
});
