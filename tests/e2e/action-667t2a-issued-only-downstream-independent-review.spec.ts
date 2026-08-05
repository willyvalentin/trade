import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV2,
  buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2,
  createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2,
  reproduceT2001AgainstV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v2";
import {
  independentlyVerifyRecommendationOutcomeEvidenceIssuanceV2,
  issueRecommendationOutcomeEvidenceV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v2";

const repositoryRoot = resolve(__dirname, "../..");
const sha = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
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
const issue = (
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2
  >,
) =>
  issueRecommendationOutcomeEvidenceV2(fixture.request, {
    enabled: true,
    kill_switch: false,
    authority: fixture.authority,
  });

test("successor refreeze binds five normative bytes and canonical digest", () => {
  const manifest = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667t2a-issued-only-downstream-invocation-refreeze-manifest.json",
      ),
      "utf8",
    ),
  );
  const inventory = manifest.successor.normative_artifacts
    .map((artifact: { path: string; sha256: string }) => {
      expect(
        sha(readFileSync(resolve(repositoryRoot, artifact.path))),
        artifact.path,
      ).toBe(artifact.sha256);
      return { path: artifact.path, sha256: artifact.sha256 };
    })
    .sort(
      (left: { path: string }, right: { path: string }) =>
        left.path.localeCompare(right.path),
    );
  expect(inventory).toHaveLength(5);
  expect(sha(JSON.stringify(inventory))).toBe(
    manifest.successor.normative_inventory_digest,
  );
  const { freeze_digest: freezeDigest, ...basis } = manifest;
  expect(sha(canonicalJson(basis))).toBe(freezeDigest);
});

test("T.1 and T.2 predecessor artifacts remain byte-identical", () => {
  const expected = {
    "docs/action-667t1-recommendation-outcome-evidence-issuance.md":
      "ee5ab2baa333867a59292c1b1780113707efd7b53ee68313dffc9d96aeda72e5",
    "docs/evidence/action-667t1-recommendation-outcome-evidence-issuance-synthetic-golden.json":
      "bd132dad2edec66414443c96601db71b0c42c97ece3558ca25a0a179dd7c45eb",
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v1.ts":
      "824d4577a0cc685f46d76ca6564ad3948c6c9e6ad7550ee97867f379e422d65e",
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v1.ts":
      "cd32b719a7ad40237d17db281902a12bfdb417683ff2474af076be25a2a4496f",
    "tests/e2e/action-667t1-recommendation-outcome-evidence-issuance.spec.ts":
      "5bcb713b1b2cc5f6727183bb2c6cab3c63bb45e9f5e3a1a217a8aa9fc305862d",
    "docs/evidence/action-667t2-outcome-evidence-issuance-freeze-manifest.json":
      "7dbebc78b0ff98be6f8a8b6477d158c296f40f07d57f328256d5d7bf9542d487",
    "docs/evidence/action-667t2-outcome-evidence-issuance-independent-review.json":
      "f3db938dbb6b601f8dcbd85375f48d4442d86aa15b3e8ff90b6f5acce3564f9c",
  };
  for (const [path, digest] of Object.entries(expected)) {
    expect(sha(readFileSync(resolve(repositoryRoot, path))), path).toBe(
      digest,
    );
  }
});

test("independent rereview evidence is canonical and approves without findings", () => {
  const evidence = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667t2a-issued-only-downstream-invocation-independent-rereview.json",
      ),
      "utf8",
    ),
  );
  const {
    review_evidence_digest: reviewEvidenceDigest,
    ...basis
  } = evidence;
  expect(sha(canonicalJson(basis))).toBe(reviewEvidenceDigest);
  expect(evidence.finding_counts).toEqual({
    blocker: 0,
    major: 0,
    minor: 0,
    nit: 0,
  });
  expect(evidence.findings).toEqual([]);
  expect(evidence.decision).toMatchObject({
    independent_rereview_approved: true,
    local_checkpoint_ready: true,
    remediation_performed_during_rereview: false,
  });
});

test("clean-room review reproduces T2-001 and closes every non-issued path", () => {
  expect(reproduceT2001AgainstV1()).toEqual(
    expect.objectContaining({
      taxonomy: "incomplete",
      downstream_digest_exposed: true,
    }),
  );
  const fixtures = [
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      remove_first_closure: true,
    }),
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      conflict_registry: true,
    }),
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      unsafe_source_instant: true,
    }),
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      material_override: ["malformed"],
    }),
  ];
  for (const fixture of fixtures) {
    const result = issue(fixture);
    expect(result.taxonomy).not.toBe("issued");
    expect(result.downstream_activity).toEqual({
      s2a_request_construction_count: 0,
      s2a_call_count: 0,
      s2a_result_digest_work_count: 0,
    });
    expect("s2a_completion_result_digest" in result).toBe(false);
    expect(
      independentlyVerifyRecommendationOutcomeEvidenceIssuanceV2(result),
    ).toEqual(expect.objectContaining({ verified: true }));
  }
});

test("clean-room review verifies issued-only S.2A invocation and full interop", () => {
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2();
  expect(interop.issuance.downstream_activity).toEqual({
    s2a_request_construction_count: 1,
    s2a_call_count: 1,
    s2a_result_digest_work_count: 1,
  });
  expect({
    t2a: interop.issuance.taxonomy,
    s2a: interop.completion.taxonomy,
    r2: interop.projection.taxonomy,
    q1: interop.q1_admission.taxonomy,
    p2a: interop.p2a_capture.taxonomy,
    o2a: interop.o2a_join.taxonomy,
  }).toEqual({
    t2a: "issued",
    s2a: "completed",
    r2: "bindable",
    q1: "ready",
    p2a: "captured",
    o2a: "joined",
  });
});

test("clean-room review verifies rejected observations remain forensic and distinct", () => {
  const first = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      material_override: ["malformed-a"],
    }),
  );
  const second = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      material_override: ["malformed-b"],
    }),
  );
  expect(first.failure_identity_digest)
    .not.toBe(second.failure_identity_digest);
  expect(first.result_digest).not.toBe(second.result_digest);
  expect(
    first.observed_input_provenance.sections.find(
      (section) => section.namespace === "issuance_material",
    ),
  ).toEqual(expect.objectContaining({ disposition: "malformed" }));
});

test("clean-room review verifies deterministic golden and diagnostic boundaries", () => {
  const forward =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV2();
  const reverse =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV2({
      reverse_input_order: true,
    });
  expect(forward.result_digest).toBe(reverse.result_digest);
  expect(forward.result_digest).toBe(
    "deacc459b2672d76ad9e8f55ab873c933ad6c919737094f7ad4df34a2ef39e80",
  );
  expect(forward).toMatchObject({
    synthetic_only: true,
    real_outcome_source_accessed: false,
  });
});

test("clean-room review finds no provider, database, writer, or live import", () => {
  const source = [
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v2.ts",
    "lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v2.ts",
  ].map((path) =>
    readFileSync(resolve(repositoryRoot, path), "utf8")
  ).join("\n");
  expect(source).not.toMatch(
    /from\s+["'][^"']*(databento|provider|database|supabase|prisma|live|writer)/i,
  );
  expect(source).not.toMatch(
    /(DATABENTO_API_KEY|GH_TOKEN|GITHUB_TOKEN|process\.env)/,
  );
});
