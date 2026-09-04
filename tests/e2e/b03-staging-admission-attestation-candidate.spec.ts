import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  B03_STAGING_ADMISSION_ATTESTATION_CANDIDATE_VERSION,
  B03StagingAdmissionAttestationCandidateError,
  createB03StagingAdmissionAttestationCandidate,
} from "@/lib/server/b03-staging-admission-attestation-candidate";

const repositoryRoot = path.resolve(__dirname, "../..");
const modulePath = "lib/server/b03-staging-admission-attestation-candidate.ts";

function candidate(overrides: Record<string, unknown> = {}) {
  return {
    attestation_version: B03_STAGING_ADMISSION_ATTESTATION_CANDIDATE_VERSION,
    private_transport_criteria_reference:
      "private_transport_criteria_ref:ref_b03transport001",
    protected_material_provenance_reference:
      "material_provenance_ref:ref_b03material001",
    rollback_containment_plan_reference:
      "rollback_containment_plan_ref:ref_b03rollback001",
    staging_principal_reference: "staging_principal_ref:ref_b03principal001",
    staging_scope_reference: "staging_scope_ref:ref_b03scope000001",
    target_environment: "staging",
    writer_grant_matrix_reference:
      "writer_grant_matrix_ref:ref_b03grantmatrix01",
    ...overrides,
  };
}

test("B-03 rebuilds only a frozen value-free candidate with default-deny authority", () => {
  const input = candidate();
  const result = createB03StagingAdmissionAttestationCandidate(input);

  expect(result).toEqual({
    attestation_version: B03_STAGING_ADMISSION_ATTESTATION_CANDIDATE_VERSION,
    authority: {
      production: "not_authorized",
      remote_connection: "not_authorized",
      runtime_binding: "not_authorized",
      writer_invocation: "not_authorized",
    },
    private_transport_criteria_reference:
      "private_transport_criteria_ref:ref_b03transport001",
    protected_material_provenance_reference:
      "material_provenance_ref:ref_b03material001",
    remote_staging_admission: "not_admitted",
    review_status: "candidate_requires_independent_review",
    rollback_containment_plan_reference:
      "rollback_containment_plan_ref:ref_b03rollback001",
    staging_principal_reference: "staging_principal_ref:ref_b03principal001",
    staging_scope_reference: "staging_scope_ref:ref_b03scope000001",
    target_environment: "staging",
    writer_grant_matrix_reference:
      "writer_grant_matrix_ref:ref_b03grantmatrix01",
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.authority)).toBe(true);

  input.target_environment = "production";
  expect(result.target_environment).toBe("staging");
  expect(result.remote_staging_admission).toBe("not_admitted");
});

test("B-03 rejects production, missing prerequisites and non-reference material", () => {
  const missingRollback = candidate();
  delete (missingRollback as Partial<typeof missingRollback>)
    .rollback_containment_plan_reference;

  const invalidInputs = [
    candidate({ target_environment: "production" }),
    missingRollback,
    candidate({
      protected_material_provenance_reference:
        "material_provenance_ref:sk_live_123456789012",
    }),
    candidate({
      writer_grant_matrix_reference:
        "writer_grant_matrix_ref:ref_TOO_SHORT",
    }),
  ];

  for (const input of invalidInputs) {
    expect(() => createB03StagingAdmissionAttestationCandidate(input)).toThrow(
      B03StagingAdmissionAttestationCandidateError,
    );
  }
});

test("B-03 rejects widened, accessor-backed and proxy-backed candidates", () => {
  const widened = { ...candidate(), extra: true };
  const accessorBacked = candidate();
  Object.defineProperty(accessorBacked, "target_environment", {
    enumerable: true,
    get: () => "staging",
  });
  const proxyBacked = new Proxy(candidate(), {
    getOwnPropertyDescriptor() {
      throw new Error("unexpected proxy traversal");
    },
  });

  for (const input of [widened, accessorBacked, proxyBacked]) {
    expect(() => createB03StagingAdmissionAttestationCandidate(input)).toThrow(
      "invalid_b03_staging_admission_attestation_candidate",
    );
  }
});

test("B-03 stays server-only and unbound to secrets, remote clients, routes and UI", async () => {
  const source = await readFile(path.join(repositoryRoot, modulePath), "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  for (const forbidden of [
    "@supabase",
    "getServerSupabaseClient",
    "fetch(",
    "process.env",
    "app/api",
    "route.ts",
    'from "pg"',
    "netlify",
  ]) {
    expect(source).not.toContain(forbidden);
  }
});
