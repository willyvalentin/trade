import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1,
  completeRepositoryOwnedRecommendationOutcomeEvidenceV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1";
import {
  createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-fixtures-v1";

function complete(
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1
  >,
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

const repositoryRoot = resolve(__dirname, "../..");
const canonicalJson = (value: unknown): string =>
  Array.isArray(value)
    ? `[${value.map(canonicalJson).join(",")}]`
    : value !== null && typeof value === "object"
      ? `{${Object.keys(value)
          .sort()
          .map(
            (key) =>
              `${JSON.stringify(key)}:${canonicalJson(
                (value as Record<string, unknown>)[key],
              )}`,
          )
          .join(",")}}`
      : JSON.stringify(value);

test("freeze manifest binds exactly five immutable normative artifacts", () => {
  const manifestPath = resolve(
    repositoryRoot,
    "docs/evidence/action-667s2-outcome-evidence-completion-freeze-manifest.json",
  );
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const inventory = manifest.normative_artifacts
    .map((artifact: { path: string; sha256: string }) => {
      const bytes = readFileSync(resolve(repositoryRoot, artifact.path));
      expect(
        createHash("sha256").update(bytes).digest("hex"),
        artifact.path,
      ).toBe(artifact.sha256);
      return {
        path: artifact.path,
        sha256: artifact.sha256,
      };
    })
    .sort(
      (
        left: { path: string },
        right: { path: string },
      ) => left.path.localeCompare(right.path),
    );
  expect(inventory).toHaveLength(5);
  expect(
    createHash("sha256")
      .update(JSON.stringify(inventory))
      .digest("hex"),
  ).toBe(
    "c5d969e48029539109b7f4cf0e7ca39ebc573d0572e9b3d11c897717cab52e99",
  );
  const { freeze_digest: freezeDigest, ...freezeBasis } = manifest;
  expect(
    createHash("sha256")
      .update(canonicalJson(freezeBasis))
      .digest("hex"),
  ).toBe(freezeDigest);
});

test("S2-001 reproduces mutable authority-anchor TOCTOU acceptance", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const authority = fixture.authority;
  const trustedAnchor = structuredClone(
    authority.expected_registry_anchor,
  );
  const originalRead = authority.read_completion_material;
  authority.expected_registry_anchor.registry_identity =
    "pre-read-untrusted-registry";
  authority.expected_registry_anchor.registry_digest = "f".repeat(64);
  authority.expected_registry_anchor.expected_trust_root_digest =
    "e".repeat(64);
  authority.expected_registry_anchor.expected_lineage_root_digest =
    "d".repeat(64);
  let reads = 0;
  authority.read_completion_material = () => {
    reads += 1;
    Object.assign(authority.expected_registry_anchor, trustedAnchor);
    return originalRead();
  };

  const result = complete(fixture);
  expect(reads).toBe(1);
  expect(result.taxonomy).toBe("completed");
  expect(result.authority_binding.expected_registry_digest).toBe(
    trustedAnchor.registry_digest,
  );
});

test("S2-001 reproduces unsanitized authority-anchor proxy failure", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const authority = {
    ...fixture.authority,
    expected_registry_anchor: new Proxy(
      fixture.authority.expected_registry_anchor,
      {
        get() {
          throw new Error("private authority proxy detail");
        },
      },
    ),
  };

  expect(() =>
    completeRepositoryOwnedRecommendationOutcomeEvidenceV1(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority,
      },
    ),
  ).toThrow("private authority proxy detail");
});

test("S2-002 reproduces unbounded recursive canonicalization failure", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  let extreme: Record<string, unknown> = {};
  for (let depth = 0; depth < 25_000; depth += 1) {
    extreme = { child: extreme };
  }
  const request = {
    ...fixture.request,
    extreme,
  };

  expect(() =>
    completeRepositoryOwnedRecommendationOutcomeEvidenceV1(request, {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    }),
  ).toThrow();
});

test("S2-003 reproduces closure-order result-digest drift", () => {
  const canonical =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const reordered =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        bundle.gap_closures.reverse();
      },
      recompute_bundle_after_mutation: true,
    });

  const canonicalResult = complete(canonical);
  const reorderedResult = complete(reordered);
  expect(canonicalResult.taxonomy).toBe("completed");
  expect(reorderedResult.taxonomy).toBe("completed");
  expect(reorderedResult.closed_gap_codes).toEqual(
    canonicalResult.closed_gap_codes,
  );
  expect(reorderedResult.result_digest).not.toBe(
    canonicalResult.result_digest,
  );
});

test("cycles, accessors, and hostile material proxies fail closed", () => {
  const cycleFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const cycleMaterial = structuredClone(cycleFixture.material);
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  cycleMaterial.observed_evidence_bundle = cycle;
  cycleFixture.authority.read_completion_material = () => cycleMaterial;
  expect(complete(cycleFixture).taxonomy).toBe("unmappable");

  const accessorFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const accessorMaterial = structuredClone(accessorFixture.material);
  let accessorReads = 0;
  const accessor = {};
  Object.defineProperty(accessor, "secret", {
    enumerable: true,
    get() {
      accessorReads += 1;
      return "must-not-read";
    },
  });
  accessorMaterial.observed_evidence_bundle = accessor;
  accessorFixture.authority.read_completion_material = () =>
    accessorMaterial;
  expect(complete(accessorFixture).taxonomy).toBe("unmappable");
  expect(accessorReads).toBe(0);

  const proxyFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const proxyMaterial = structuredClone(proxyFixture.material);
  proxyMaterial.observed_evidence_bundle = new Proxy(
    {},
    {
      ownKeys() {
        throw new Error("private observed proxy detail");
      },
    },
  );
  proxyFixture.authority.read_completion_material = () => proxyMaterial;
  const proxyResult = complete(proxyFixture);
  expect(proxyResult.taxonomy).toBe("unmappable");
  expect(JSON.stringify(proxyResult)).not.toContain(
    "private observed proxy detail",
  );
});

test("duplicate, missing, extra, and conflicting closures fail closed", () => {
  const fixtures = [
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        bundle.gap_closures.push(
          structuredClone(bundle.gap_closures[0]),
        );
      },
      recompute_bundle_after_mutation: true,
    }),
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        bundle.gap_closures.pop();
      },
      recompute_bundle_after_mutation: true,
    }),
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        (
          bundle.gap_closures[0] as unknown as Record<string, unknown>
        ).unexpected = true;
      },
      recompute_bundle_after_mutation: true,
    }),
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        bundle.gap_closures[1] = {
          ...structuredClone(bundle.gap_closures[0]),
          evidence_digest: "a".repeat(64),
        };
      },
      recompute_bundle_after_mutation: true,
    }),
  ];

  for (const fixture of fixtures) {
    const result = complete(fixture);
    expect(result.taxonomy).not.toBe("completed");
    expect(result.completed_projection).toBeNull();
  }
});

test("recursive caller claims and post-verification mutation are rejected", () => {
  const claimFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_bundle: (bundle) => {
        (
          bundle.explanation as unknown as Record<string, unknown>
        ).canonical = true;
      },
      recompute_bundle_after_mutation: true,
    });
  const claimResult = complete(claimFixture);
  expect(claimResult.taxonomy).toBe("conflicting");
  expect(claimResult.completed_projection).toBeNull();

  const validFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const validResult = complete(validFixture);
  expect(validResult.taxonomy).toBe("completed");
  expect(Object.isFrozen(validResult)).toBe(true);
  expect(Object.isFrozen(validResult.completed_projection)).toBe(true);
  const digest = validResult.result_digest;
  validFixture.material.observed_repository_row = {
    replaced_after_verification: true,
  };
  expect(validResult.result_digest).toBe(digest);
});

test("S2-004 records nested observations as absent after registry rejection", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
      mutate_registry: (registry) => {
        (
          registry as unknown as Record<string, unknown>
        ).unexpected = true;
      },
    });
  const result = complete(fixture);
  expect(result.taxonomy).toBe("unmappable");
  const row = result.observed_input_provenance.sections.find(
    (section) => section.namespace === "repository_row",
  );
  const bundle = result.observed_input_provenance.sections.find(
    (section) => section.namespace === "evidence_bundle",
  );
  expect(row?.disposition).toBe("absent");
  expect(bundle?.disposition).toBe("absent");
  expect(result.observed_input_provenance.sections[0].disposition).toBe(
    "verified",
  );
});

test("adversarial review matrix is closed and version-bound", () => {
  expect(
    RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1,
  ).toBe(
    "repository_owned_recommendation_outcome_evidence_authority_v1",
  );
  console.log(
    "ACTION_667S2_ADVERSARIAL_FINDINGS=" +
      JSON.stringify({
        blocker: 0,
        major: 3,
        minor: 1,
        nit: 0,
        finding_ids: ["S2-001", "S2-002", "S2-003", "S2-004"],
      }),
  );
});
