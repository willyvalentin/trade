import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  buildSyntheticRecommendationOutcomeEvidenceCompletionInteropV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1";
import {
  buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV2,
  createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-fixtures-v2";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUDGETS_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_PROVENANCE_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_SNAPSHOT_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
  canonicalizeRecommendationOutcomeEvidencePlainDataV2,
  completeRepositoryOwnedRecommendationOutcomeEvidenceV2,
  independentlyVerifyRecommendationOutcomeEvidenceCompletionV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v2";

const repositoryRoot = resolve(__dirname, "../..");
const shaFile = (path: string) =>
  createHash("sha256")
    .update(readFileSync(resolve(repositoryRoot, path)))
    .digest("hex");
const complete = (
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2
  >,
) =>
  completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );

test("V2 versions the authority snapshot, provenance and fixed budgets", () => {
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2).toBe(
    "repository_owned_recommendation_outcome_evidence_completion_v2",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_SNAPSHOT_V2).toBe(
    "repository_owned_recommendation_outcome_evidence_authority_snapshot_v2",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_PROVENANCE_V2).toBe(
    "repository_owned_recommendation_outcome_evidence_provenance_v2",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUDGETS_V2).toEqual({
    max_depth: 64,
    max_nodes: 20_000,
    max_total_keys: 50_000,
    max_array_length: 4_096,
    max_string_bytes: 1_048_576,
  });
});

test("S.1 and S.2 predecessor bytes remain immutable", () => {
  const expected: Record<string, string> = {
    "docs/action-667s1-recommendation-outcome-evidence-completion.md":
      "ada186c35b4b74105de3c9e74155dd46950d28dbca286df4dd5c23632202aad9",
    "docs/evidence/action-667s1-recommendation-outcome-evidence-completion-synthetic-golden.json":
      "b49a27289341dd0fd6708677690479921970e7ae1da64d10ca1ba647912a3715",
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-fixtures-v1.ts":
      "f8607aa06cd795b17a61a277c05f67b7a75f095dfaf1c7de20115a33d89945a2",
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1.ts":
      "2bd493c56cf5982af2cd2d28d7efc76252e0e7b6e79f477dfd06d8a57a9c5a86",
    "tests/e2e/action-667s1-recommendation-outcome-evidence-completion.spec.ts":
      "738b4404b72fb5605634964a4f2bcf0ecb0e7e8b2cf79700684d114c5d3a4729",
    "docs/evidence/action-667s2-outcome-evidence-completion-freeze-manifest.json":
      "efd2b033b1f68be15c3b4de0c9531b833c9c5daf14b3b915394acaa63b915015",
    "docs/evidence/action-667s2-outcome-evidence-completion-independent-review.json":
      "efb9326c2e85cea725573c03aa40f84463ee3d5e36ffcc50586f4785fbd7e89e",
    "tests/e2e/action-667s2-outcome-evidence-completion-adversarial-review.spec.ts":
      "289751e6bd9e7dd013cd01baef850e88ab96b7b938fbe5cdd72b09a122cc2283",
  };
  for (const [path, digest] of Object.entries(expected)) {
    expect(shaFile(path), path).toBe(digest);
  }
});

test("S2-001 closes callback mutation by using the pre-callback anchor snapshot", () => {
  const pristine =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  const trusted = structuredClone(
    pristine.authority.expected_registry_anchor,
  );
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      mutate_anchor_before_read: (anchor) => {
        anchor.registry_digest = "f".repeat(64);
      },
      mutate_anchor_during_read: (anchor) => {
        Object.assign(anchor, trusted);
      },
    });
  const result = complete(fixture);
  expect(result.taxonomy).not.toBe("completed");
  expect(result.authority_snapshot.registry_digest).toBe("f".repeat(64));
  expect(fixture.authority_read_count()).toBe(1);
});

test("valid authority is read exactly once and downstream bytes are frozen", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  const result = complete(fixture);
  expect(result.taxonomy).toBe("completed");
  expect(fixture.authority_read_count()).toBe(1);
  expect(Object.isFrozen(result.authority_snapshot)).toBe(true);
  expect(Object.isFrozen(result.completed_projection)).toBe(true);
  expect(Object.isFrozen(result)).toBe(true);
});

test("authority proxies and accessors fail closed without leaking exceptions", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  const proxyAuthority = new Proxy(
    {},
    {
      ownKeys() {
        throw new Error("private authority proxy detail");
      },
    },
  );
  const proxyResult =
    completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: proxyAuthority as never,
      },
    );
  expect(proxyResult.taxonomy).toBe("incomplete");
  expect(JSON.stringify(proxyResult)).not.toContain("private authority");

  let accessorReads = 0;
  const accessorAuthority: Record<string, unknown> = {};
  Object.defineProperty(accessorAuthority, "authority_version", {
    enumerable: true,
    get() {
      accessorReads += 1;
      return RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2;
    },
  });
  Object.defineProperty(accessorAuthority, "expected_registry_anchor", {
    enumerable: true,
    value: fixture.authority.expected_registry_anchor,
  });
  Object.defineProperty(accessorAuthority, "read_completion_material", {
    enumerable: true,
    value: fixture.authority.read_completion_material,
  });
  const accessorResult =
    completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: accessorAuthority as never,
      },
    );
  expect(accessorResult.taxonomy).toBe("incomplete");
  expect(accessorReads).toBe(0);
});

test("S2-002 closes deep recursion with deterministic depth rejection", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  let extreme: Record<string, unknown> = {};
  for (let depth = 0; depth < 25_000; depth += 1) {
    extreme = { child: extreme };
  }
  const result =
    completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
      { ...fixture.request, extreme },
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    );
  expect(result.taxonomy).toBe("unmappable");
  expect(result.reason_codes).toContain(
    "bounded_validation:depth_budget_exceeded",
  );
  expect(fixture.authority_read_count()).toBe(0);
});

test("cycles, material accessors and hostile proxies are sanitized", () => {
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  const cycleResult =
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(cycle);
  expect(cycleResult.ok).toBe(false);
  expect(cycleResult.reason_codes.some((code) =>
    code.includes("repeated_or_cyclic_reference"),
  )).toBe(true);

  let accessorReads = 0;
  const accessor: Record<string, unknown> = {};
  Object.defineProperty(accessor, "secret", {
    enumerable: true,
    get() {
      accessorReads += 1;
      return "must-not-read";
    },
  });
  const accessorResult =
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(accessor);
  expect(accessorResult.ok).toBe(false);
  expect(accessorReads).toBe(0);

  const proxy = new Proxy(
    {},
    {
      ownKeys() {
        throw new Error("private material proxy detail");
      },
    },
  );
  const proxyResult =
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(proxy);
  expect(proxyResult.ok).toBe(false);
  expect(JSON.stringify(proxyResult)).not.toContain("private material");
});

test("fixed node, key, array and string budgets fail closed", () => {
  const tooManyNodes = {
    values: Array.from({ length: 4_096 }, (_, index) => ({
      index,
      a: index,
      b: index,
      c: index,
      d: index,
    })),
  };
  expect(
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(
      tooManyNodes,
    ).reason_codes,
  ).toContain("bounded_validation:node_budget_exceeded");
  expect(
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(
      { values: Array(4_097).fill(null) },
    ).reason_codes,
  ).toContain("bounded_validation:array_budget_exceeded");
  expect(
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(
      { value: "x".repeat(1_048_577) },
    ).reason_codes,
  ).toContain("bounded_validation:string_budget_exceeded");
});

test("S2-003 closes set-order drift with identical completed digests", () => {
  const canonical =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  const reordered =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      reverse_closure_order: true,
    });
  const canonicalResult = complete(canonical);
  const reorderedResult = complete(reordered);
  expect(canonicalResult.taxonomy).toBe("completed");
  expect(reorderedResult.taxonomy).toBe("completed");
  expect(reorderedResult.closed_gap_codes).toEqual(
    [...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1],
  );
  expect(reorderedResult.result_digest).toBe(
    canonicalResult.result_digest,
  );
});

test("closures enforce closed fields, uniqueness and all eighteen codes", () => {
  const fixtures = [
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      duplicate_first_closure: true,
    }),
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      remove_gap_code:
        RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1[0],
    }),
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      add_unknown_closure_field: true,
    }),
  ];
  for (const fixture of fixtures) {
    expect(complete(fixture).taxonomy).not.toBe("completed");
  }
});

test("S2-004 binds actual rejected row, bundle and evidence materials", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      mutate_material: (material) => {
        (
          material.registry as Record<string, unknown>
        ).registry_identity = "invalid-registry";
        (
          material.observed_repository_row as Record<string, unknown>
        ).name = "observed-row-a";
        (
          material.observed_evidence_bundle as Record<string, unknown>
        ).bundle_identity = "observed-bundle-a";
      },
    });
  const result = complete(fixture);
  expect(result.taxonomy).not.toBe("completed");
  const byNamespace = Object.fromEntries(
    result.observed_input_provenance.sections.map((section) => [
      section.namespace,
      section,
    ]),
  );
  expect(byNamespace.repository_row.disposition).toBe(
    "present_rejected",
  );
  expect(byNamespace.evidence_bundle.disposition).toBe(
    "present_rejected",
  );
  expect(byNamespace.repository_row.observed_digest).toMatch(
    /^[a-f0-9]{64}$/,
  );
  expect(byNamespace.evidence_bundle.observed_digest).toMatch(
    /^[a-f0-9]{64}$/,
  );
});

test("different rejected row and bundle observations have distinct failure identities", () => {
  const build = (suffix: string) =>
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      mutate_material: (material) => {
        (
          material.registry as Record<string, unknown>
        ).registry_identity = "invalid-registry";
        (
          material.observed_repository_row as Record<string, unknown>
        ).name = `observed-row-${suffix}`;
        (
          material.observed_evidence_bundle as Record<string, unknown>
        ).bundle_identity = `observed-bundle-${suffix}`;
      },
    });
  const first = complete(build("a"));
  const second = complete(build("b"));
  expect(first.taxonomy).toBe(second.taxonomy);
  expect(first.failure_identity_digest).not.toBe(
    second.failure_identity_digest,
  );
  expect(first.result_digest).not.toBe(second.result_digest);
});

test("independent rebuild rejects self-consistent terminal tampering", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  const result = complete(fixture);
  const rebuiltFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  expect(
    independentlyVerifyRecommendationOutcomeEvidenceCompletionV2(
      result,
      rebuiltFixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: rebuiltFixture.authority,
      },
    ),
  ).toBe(true);
  const tampered = structuredClone(result);
  tampered.reason_codes = ["caller_verified"];
  tampered.result_digest = "a".repeat(64);
  const tamperedFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  expect(
    independentlyVerifyRecommendationOutcomeEvidenceCompletionV2(
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

test("V2 completed projection preserves R.2 to O.2A interoperability", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  const result = complete(fixture);
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceCompletionInteropV1();
  expect(result.taxonomy).toBe("completed");
  expect(result.completed_projection).toEqual(
    interop.completion.completed_projection,
  );
  expect(interop.projection.taxonomy).toBe("bindable");
  expect(interop.q1_admission.taxonomy).toBe("ready");
  expect(interop.p2a_capture.taxonomy).toBe("captured");
  expect(interop.o2a_join.taxonomy).toBe("joined");
});

test("default-off and kill switch perform zero request or authority work", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  let requestReads = 0;
  const request: Record<string, unknown> = {};
  Object.defineProperty(request, "contract_version", {
    enumerable: true,
    get() {
      requestReads += 1;
      return RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2;
    },
  });
  const disabled =
    completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
      request,
      {
        enabled: false,
        kill_switch: false,
        authority: fixture.authority,
      },
    );
  const killed =
    completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
      request,
      {
        enabled: true,
        kill_switch: true,
        authority: fixture.authority,
      },
    );
  expect(disabled.authority_snapshot.disposition).toBe(
    "not_read_default_off",
  );
  expect(killed.authority_snapshot.disposition).toBe(
    "not_read_kill_switch",
  );
  expect(requestReads).toBe(0);
  expect(fixture.authority_read_count()).toBe(0);
});

test("golden matrix is deterministic under reversed construction order", () => {
  const forward =
    buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV2();
  const reverse =
    buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV2({
      reverse_input_order: true,
    });
  expect(reverse).toEqual(forward);
  expect(forward.scenario_count).toBe(26);
  expect(forward.closed_gap_count).toBe(18);
});

test("fixed S.2A cross-process digest", () => {
  const matrix =
    buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV2({
      reverse_input_order:
        process.env.ACTION_667S2A_INPUT_ORDER === "reverse",
    });
  console.log(`ACTION_667S2A_TZ_DIGEST=${matrix.result_digest}`);
  expect(matrix.result_digest).toBe(
    "1a295e2aac7534fc6a22eccb9511f6a11ea76d7887f8ab07311b1d3b252922f7",
  );
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
        "tests/e2e/action-667s2a-outcome-evidence-completion-remediation.spec.ts",
        "--grep",
        "fixed S.2A cross-process digest",
        "--reporter=line",
        "--output",
        `/private/tmp/action-667s2a-${index}-${timezone.replaceAll("/", "-")}`,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          ACTION_667S2A_INPUT_ORDER: order,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
        timeout: 120_000,
      },
    );
    expect(child.status, child.stderr).toBe(0);
    return child.stdout.match(
      /ACTION_667S2A_TZ_DIGEST=([a-f0-9]{64})/,
    )?.[1];
  });
  expect(digests.every((digest) => digest?.length === 64)).toBe(true);
  expect(new Set(digests).size).toBe(1);
});

test("V2 golden evidence matches generated matrix and digest", () => {
  const evidence = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667s2a-outcome-evidence-completion-v2-synthetic-golden.json",
      ),
      "utf8",
    ),
  );
  const matrix =
    buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV2();
  expect(evidence.matrix_digest).toBe(matrix.result_digest);
  expect(evidence.scenario_count).toBe(matrix.scenario_count);
  expect(evidence.taxonomy_counts).toEqual(matrix.taxonomy_counts);
  expect(evidence.closed_gap_count).toBe(matrix.closed_gap_count);
  expect(evidence.completed_canonical_digest).toBe(
    matrix.scenarios.find(
      (scenario) => scenario.id === "completed_all_eighteen_gaps",
    )?.result_digest,
  );
  expect(evidence.completed_reordered_digest).toBe(
    matrix.scenarios.find(
      (scenario) => scenario.id === "completed_reordered_set",
    )?.result_digest,
  );
});

test("S.2A implementation has no provider, DB, writer or live dependency", () => {
  const paths = [
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v2.ts",
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-fixtures-v2.ts",
  ];
  const forbidden = [
    "DATABENTO_API_KEY",
    "timeseries.get_range",
    "submit_job",
    "createClient(",
    "drizzle",
    "prisma",
    "supabase",
    "from \"@/lib/live",
    "from \"./live",
  ];
  for (const path of paths) {
    const source = readFileSync(resolve(repositoryRoot, path), "utf8");
    for (const token of forbidden) {
      expect(source, `${path}:${token}`).not.toContain(token);
    }
  }
});
