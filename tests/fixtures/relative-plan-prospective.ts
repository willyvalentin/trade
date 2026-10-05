import { buildRelativePlanProspectivePlan, RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION, relativePlanCanonicalBuildIdentity,
  relativePlanSemanticFingerprint } from "@/lib/server/relative-plan-prospective-comparison";
// Exact independently retained pre-v4 identity. Never relabel old evidence
// with the current publication policy or rewrite its frozen fingerprints.
export const retainedV3Publication = {
  policy_version: "selective_top_3_strong_valid_v3_preserve_explicit_no_trade",
  build_marker: "selective_top_3_v3_2026_09_17",
  build_identity: "action_148_publish_path_v1:selective_top_3_strong_valid_v3_preserve_explicit_no_trade:selective_top_3_v3_2026_09_17",
} as const;
export const prospectiveOwner = "11111111-1111-4111-8111-111111111111";
export const prospectiveFrozenAt = "2026-10-02T21:00:00.000Z";
export const prospectiveInput = {
  owner_user_id: prospectiveOwner,
  source_revision: { commit_ref: "a".repeat(40), build_identity: relativePlanCanonicalBuildIdentity, deploy_id: "b".repeat(24) },
  windows: {
    training: { start_at: "2026-10-05T13:30:00.000Z", end_at: "2026-10-09T20:00:00.000Z" },
    held_out: { start_at: "2026-10-12T13:30:00.000Z", end_at: "2026-10-23T20:00:00.000Z" },
    walk_forward: { start_at: "2026-10-26T13:30:00.000Z", end_at: "2026-11-06T21:00:00.000Z" },
  },
};
export function prospectiveReceipt(options: { publicationPolicy?: "current" | "retained_v3" } = {}) {
  const current = buildRelativePlanProspectivePlan(prospectiveInput, prospectiveFrozenAt);
  if (!current) throw new Error("fixture plan invalid");
  let plan = current;
  if (options.publicationPolicy === "retained_v3") {
    const { plan_fingerprint: _currentFingerprint, ...body } = current;
    void _currentFingerprint;
    const retained = { ...body, source_revision: { ...body.source_revision,
      build_identity: retainedV3Publication.build_identity } };
    plan = { ...retained, plan_fingerprint: relativePlanSemanticFingerprint(retained) };
  }
  return { contract_version: RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION,
    freeze_id: "22222222-2222-4222-8222-222222222222", owner_user_id: prospectiveOwner,
    frozen_at: prospectiveFrozenAt, plan };
}
