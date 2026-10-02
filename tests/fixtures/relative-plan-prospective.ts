import { buildRelativePlanProspectivePlan, RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION, relativePlanCanonicalBuildIdentity } from "@/lib/server/relative-plan-prospective-comparison";
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
export function prospectiveReceipt() {
  const plan = buildRelativePlanProspectivePlan(prospectiveInput, prospectiveFrozenAt);
  if (!plan) throw new Error("fixture plan invalid");
  return { contract_version: RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION,
    freeze_id: "22222222-2222-4222-8222-222222222222", owner_user_id: prospectiveOwner,
    frozen_at: prospectiveFrozenAt, plan };
}
