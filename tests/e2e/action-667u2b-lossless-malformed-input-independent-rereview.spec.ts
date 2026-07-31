import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2,
  buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV2,
  createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-fixtures-v2";
import {
  admitRecommendationOutcomeEvidenceV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS,
  admitRecommendationOutcomeEvidenceV2,
  computeRecommendationOutcomeEvidenceAdmissionFailureIdentityV2,
  computeRecommendationOutcomeEvidenceAdmissionObservationDigestV2,
  computeRecommendationOutcomeEvidenceAdmissionResultDigestV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-v2";

const repositoryRoot = resolve(__dirname, "../..");
const expectedNormativeDigest =
  "afbf7ab65e7ee35d3ca8097427ff2f15a717caec2662a929915690d42e611e98";
const expectedGoldenDigest =
  "c16ed6b8a0003eb1eb13e6715497c2c5377b802578f58918cb0bb69efe4fe2db";
const preservationRef =
  "refs/codex-preservation/action-667u2a-20260731T094224Z";
const normativeArtifacts = [
  {
    path: "docs/action-667u2a-lossless-malformed-input-failure-identity-successor.md",
    sha256: "b50bef594dec132d743500607048bf1e6f573348f391b15f93d00c7ac8af77e3",
  },
  {
    path: "docs/evidence/action-667u2a-lossless-malformed-input-failure-identity-synthetic-golden.json",
    sha256: "a3851c909b76611081ce365187254f2c890b96650e3601e5820cad1dc1989bbb",
  },
  {
    path: "lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-fixtures-v2.ts",
    sha256: "3de269a235a268b2fb5d3389e511a439cdd097b85c36b412d2b9851e391d9c19",
  },
  {
    path: "lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-v2.ts",
    sha256: "3de4fb65ff22baa14524a26bea9bb33eefca74672b86695ac38bb9581a96d6d0",
  },
  {
    path: "tests/e2e/action-667u2a-lossless-malformed-input-failure-identity.spec.ts",
    sha256: "4e341a410fc46fd0bc0d0611be399a201f2d964a49f09326b9e9649ce247e093",
  },
] as const;

const shaBytes = (value: Buffer | string) =>
  createHash("sha256").update(value).digest("hex");
const admit = (candidate: unknown, authority: unknown) =>
  admitRecommendationOutcomeEvidenceV2(candidate, authority, {
    enabled: true,
    kill_switch: false,
  });
const matrix = () =>
  buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2();
const scenario = (id: string) =>
  matrix().scenarios.find((entry) => entry.id === id);

test("refreeze authority binds exactly five preserved U.2A artifacts", () => {
  const inventory = normativeArtifacts.map((artifact) => {
    const bytes = readFileSync(resolve(repositoryRoot, artifact.path));
    expect(shaBytes(bytes), artifact.path).toBe(artifact.sha256);
    const preserved = spawnSync(
      "git",
      ["show", `${preservationRef}:${artifact.path}`],
      { cwd: repositoryRoot, encoding: "buffer" },
    );
    expect(preserved.status, preserved.stderr.toString()).toBe(0);
    expect(Buffer.compare(bytes, preserved.stdout), artifact.path).toBe(0);
    return artifact;
  }).sort((left, right) => left.path.localeCompare(right.path));
  expect(inventory).toHaveLength(5);
  expect(shaBytes(JSON.stringify(inventory))).toBe(expectedNormativeDigest);
  expect(
    JSON.parse(readFileSync(resolve(repositoryRoot, normativeArtifacts[1].path), "utf8"))
      .result_digest,
  ).toBe(expectedGoldenDigest);
});

test("U2-001 candidate and authority collisions reproduce only in U.1", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const candidateA = "{\"candidate_a\":";
  const candidateB = "{\"candidate_b\":";
  const u1CandidateA = admitRecommendationOutcomeEvidenceV1(candidateA, {
    enabled: true,
    kill_switch: false,
    trusted_authority_json: fixture.authority_input,
  });
  const u1CandidateB = admitRecommendationOutcomeEvidenceV1(candidateB, {
    enabled: true,
    kill_switch: false,
    trusted_authority_json: fixture.authority_input,
  });
  expect(u1CandidateA.failure_identity_digest).toBe(
    u1CandidateB.failure_identity_digest,
  );
  expect(u1CandidateA.result_digest).toBe(u1CandidateB.result_digest);
  expect(admit(candidateA, fixture.authority_input).failure_identity_digest)
    .not.toBe(admit(candidateB, fixture.authority_input).failure_identity_digest);

  const authorityA = "{\"authority_a\":";
  const authorityB = "{\"authority_b\":";
  const u1AuthorityA = admitRecommendationOutcomeEvidenceV1(
    fixture.candidate_input,
    {
      enabled: true,
      kill_switch: false,
      trusted_authority_json: authorityA,
    },
  );
  const u1AuthorityB = admitRecommendationOutcomeEvidenceV1(
    fixture.candidate_input,
    {
      enabled: true,
      kill_switch: false,
      trusted_authority_json: authorityB,
    },
  );
  expect(u1AuthorityA.failure_identity_digest).toBe(
    u1AuthorityB.failure_identity_digest,
  );
  expect(u1AuthorityA.result_digest).toBe(u1AuthorityB.result_digest);
  expect(admit(fixture.candidate_input, authorityA).failure_identity_digest)
    .not.toBe(admit(fixture.candidate_input, authorityB).failure_identity_digest);
});

test("malformed candidate collision matrix binds exact observed bytes", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const values = [
    "",
    "{",
    "{\"a\":",
    "{\"b\":",
    "{invalid}",
    "{\"nul\":\u0000}",
    "{\"nfc\":\"é\"",
    "{\"nfd\":\"é\"",
  ];
  const results = values.map((value) => admit(value, fixture.authority_input));
  expect(new Set(results.map((result) =>
    result.observations.candidate.observation_digest
  )).size).toBe(values.length);
  expect(new Set(results.map((result) => result.failure_identity_digest)).size)
    .toBe(values.length);
  expect(new Set(results.map((result) => result.result_digest)).size).toBe(
    values.length,
  );
  for (let index = 0; index < values.length; index += 1) {
    const observed = results[index].observations.candidate;
    expect(observed.utf8_byte_length).toBe(
      Buffer.byteLength(values[index], "utf8"),
    );
    expect(observed.exact_utf8_sha256).toBe(
      shaBytes(Buffer.from(values[index], "utf8")),
    );
    expect(observed.parse_stage).toBe("json_parse");
  }
});

test("malformed authority collision matrix binds exact observed bytes", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const values = ["", "{", "{\"authority_a\":", "{\"authority_b\":"];
  const results = values.map((value) => admit(fixture.candidate_input, value));
  expect(new Set(results.map((result) =>
    result.observations.authority.observation_digest
  )).size).toBe(values.length);
  expect(new Set(results.map((result) => result.failure_identity_digest)).size)
    .toBe(values.length);
  expect(new Set(results.map((result) => result.result_digest)).size).toBe(
    values.length,
  );
  for (let index = 0; index < values.length; index += 1) {
    expect(results[index].observations.authority.exact_utf8_sha256).toBe(
      shaBytes(Buffer.from(values[index], "utf8")),
    );
  }
});

test("candidate and authority observations are role-domain-separated", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const result = admit(fixture.candidate_input, fixture.candidate_input);
  expect(result.observations.candidate.exact_utf8_sha256).toBe(
    result.observations.authority.exact_utf8_sha256,
  );
  expect(result.observations.candidate.observation_digest).not.toBe(
    result.observations.authority.observation_digest,
  );
  expect(result.observations.candidate.role).toBe("candidate");
  expect(result.observations.authority.role).toBe("authority");
});

test("invalid schema, Unicode, NUL and surrogate distinctions fail closed", () => {
  const ids = [
    "valid_json_invalid_schema",
    "unicode_nfc_truncated",
    "unicode_nfd_truncated",
    "embedded_nul_candidate",
    "unpaired_high_surrogate",
    "unpaired_low_surrogate",
    "escaped_unpaired_surrogate",
  ];
  const entries = ids.map(scenario);
  expect(entries.every(Boolean)).toBe(true);
  expect(entries.every((entry) => entry?.taxonomy !== "admitted")).toBe(true);
  expect(new Set(entries.map((entry) => entry?.candidate.observation_digest)).size)
    .toBe(ids.length);
  expect(scenario("unpaired_high_surrogate")?.candidate.exact_utf8_sha256)
    .toBe(scenario("unpaired_low_surrogate")?.candidate.exact_utf8_sha256);
  expect(scenario("unpaired_high_surrogate")?.candidate.exact_code_unit_sha256)
    .not.toBe(scenario("unpaired_low_surrogate")?.candidate.exact_code_unit_sha256);
});

test("candidate and authority budgets are exact at minus/equal/plus one", () => {
  for (const [role, maximum] of [
    ["candidate", RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS.candidate.max_utf8_bytes],
    ["authority", RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS.authority.max_utf8_bytes],
  ] as const) {
    const below = scenario(`${role}_budget_minus_one`);
    const exact = scenario(`${role}_budget_exact`);
    const above = scenario(`${role}_budget_plus_one`);
    expect(below?.[role].utf8_byte_length).toBe(maximum - 1);
    expect(exact?.[role].utf8_byte_length).toBe(maximum);
    expect(above?.[role].utf8_byte_length).toBe(maximum + 1);
    expect(below?.taxonomy).toBe("admitted");
    expect(exact?.taxonomy).toBe("admitted");
    expect(above?.taxonomy).not.toBe("admitted");
  }
  expect(scenario("bounded_parse_depth_exceeded")?.reason_codes).toContain(
    "candidate:bounded_validation:depth_budget_exceeded",
  );
});

test("parser and caller-controlled text is sanitized", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const marker = "CALLER_MESSAGE_MUST_NOT_ESCAPE_U2B";
  const candidate = admit(`{\"${marker}\":`, fixture.authority_input);
  const authority = admit(fixture.candidate_input, `{\"${marker}\":`);
  expect(JSON.stringify(candidate)).not.toContain(marker);
  expect(JSON.stringify(authority)).not.toContain(marker);
  expect(candidate.reason_codes).toEqual([
    "candidate:malformed_json_sanitized",
  ]);
  expect(authority.reason_codes).toEqual([
    "authority:malformed_json_sanitized",
  ]);
});

test("candidate and authority accessors, proxies and coercions execute zero", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  let getterCount = 0;
  let proxyCount = 0;
  let coercionCount = 0;
  const hostile = new Proxy(
    Object.defineProperties({}, {
      value: {
        enumerable: true,
        get() {
          getterCount += 1;
          return fixture.candidate_input;
        },
      },
      toString: {
        value() {
          coercionCount += 1;
          return fixture.candidate_input;
        },
      },
    }),
    {
      ownKeys() {
        proxyCount += 1;
        return [];
      },
    },
  );
  expect(admit(hostile, fixture.authority_input).taxonomy).toBe("unmappable");
  expect(admit(fixture.candidate_input, hostile).taxonomy).toBe("conflicting");
  expect({ getterCount, proxyCount, coercionCount }).toEqual({
    getterCount: 0,
    proxyCount: 0,
    coercionCount: 0,
  });
});

test("observation, failure and result digests independently rebuild", () => {
  for (const entry of matrix().scenarios) {
    const fixture =
      createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
    const source = entry.id.startsWith("malformed_authority")
      ? admit(
          fixture.candidate_input,
          entry.id.endsWith("a") ? "{\"authority_a\":" : "{\"authority_b\":",
        )
      : null;
    if (!source) continue;
    expect(source.observations.candidate.observation_digest).toBe(
      computeRecommendationOutcomeEvidenceAdmissionObservationDigestV2(
        source.observations.candidate,
      ),
    );
    expect(source.observations.authority.observation_digest).toBe(
      computeRecommendationOutcomeEvidenceAdmissionObservationDigestV2(
        source.observations.authority,
      ),
    );
    expect(source.failure_identity_digest).toBe(
      computeRecommendationOutcomeEvidenceAdmissionFailureIdentityV2(source),
    );
    expect(source.result_digest).toBe(
      computeRecommendationOutcomeEvidenceAdmissionResultDigestV2(source),
    );
  }
});

test("single-read immutable snapshots are the only downstream material", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const result = admit(fixture.candidate_input, fixture.authority_input);
  expect(result.taxonomy).toBe("admitted");
  expect(result.audit).toEqual(expect.objectContaining({
    candidate_input_read_count: 1,
    authority_input_read_count: 1,
    candidate_getter_execution_count: 0,
    authority_getter_execution_count: 0,
    caller_input_reread_count: 0,
    canonical_snapshots_deep_frozen: true,
    verified_snapshot_only_downstream: true,
  }));
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.observations)).toBe(true);
  expect(Object.isFrozen(result.observations.candidate)).toBe(true);
  expect(Object.isFrozen(result.observations.authority)).toBe(true);
});

test("non-issued, default-off and kill-switch paths retain zero downstream work", () => {
  const nonIssued = scenario("non_issued_zero_work");
  expect(nonIssued?.audit).toEqual(expect.objectContaining({
    authority_input_read_count: 0,
    admission_request_constructed: false,
    t_v4_rebuild_called: false,
    downstream_digest_work: false,
  }));
  for (const id of ["default_off", "kill_switch"]) {
    expect(scenario(id)?.audit).toEqual(expect.objectContaining({
      candidate_input_read_count: 0,
      authority_input_read_count: 0,
      admission_request_constructed: false,
      t_v4_rebuild_called: false,
      downstream_digest_work: false,
    }));
  }
});

test("full final-T-V4 through O.2A synthetic interoperability remains exact", () => {
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV2();
  expect({
    admission: interop.admission.taxonomy,
    completion: interop.s2a_completion.taxonomy,
    projection: interop.r2_projection.taxonomy,
    source: interop.q1_admission.taxonomy,
    capture: interop.p2a_capture.taxonomy,
    join: interop.o2a_join.taxonomy,
  }).toEqual({
    admission: "admitted",
    completion: "completed",
    projection: "bindable",
    source: "ready",
    capture: "captured",
    join: "joined",
  });
});

test("golden evidence is cross-process, cross-TZ and reverse-order identical", () => {
  const forward = matrix();
  expect(
    buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2({
      reverse_input_order: true,
    }),
  ).toEqual(forward);
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
  expect(forward.result_digest).toBe(expectedGoldenDigest);
});

test("reviewed scope has no real-source, provider, DB, writer or persistence path", () => {
  const sources = [
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-v2.ts",
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-fixtures-v2.ts",
  ].map((path) => readFileSync(resolve(repositoryRoot, path), "utf8")).join("\n");
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
    expect(sources).not.toContain(forbidden);
  }
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  expect(admit(fixture.candidate_input, fixture.authority_input)).toEqual(
    expect.objectContaining({
      diagnostic_only: true,
      shadow_only: true,
      read_only: true,
      real_outcome_source_accessed: false,
      canonical_performance_eligible: false,
      automatic_model_input_allowed: false,
      live_ranking_effect: false,
    }),
  );
});
