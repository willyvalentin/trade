import { expect, test } from "@playwright/test";
import { buildRelativePlanProspectivePlan, relativePlanProspectiveCharter,
  relativePlanSemanticFingerprint, verifiedRelativePlanProspectiveFreeze } from "@/lib/server/relative-plan-prospective-comparison";
import { scannerClockPriorShadowEvaluationCharterDefinition } from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";

import { prospectiveOwner, prospectiveFrozenAt, prospectiveInput, prospectiveReceipt } from "../fixtures/relative-plan-prospective";

test("prospective normalized-input comparison preserves the complete existing quality charter", () => {
  const plan = prospectiveReceipt().plan;
  expect(Object.keys(plan)).toHaveLength(15);
  const charter = relativePlanProspectiveCharter();
  for (const field of ["thresholds", "concentration_limits", "feasibility_inputs", "evaluation_window", "setup_slices", "regime_slices"] as const) {
    expect(charter[field]).toEqual(scannerClockPriorShadowEvaluationCharterDefinition[field]);
  }
  expect(plan.model_version).toBe("relative_plan_context_shadow_v1");
  expect(plan.charter_fingerprint).toBe(relativePlanSemanticFingerprint(charter));
  expect(plan.enrollment).toMatchObject({ primary_k: 3, held_out_decisions: 30, walk_forward_decisions: 30,
    missing_outcomes: "retained_in_enrolled_denominator", historical_decisions: "excluded_not_retroactively_admitted" });
  expect(Object.values(plan.authority).every(value => value === false)).toBe(true);
  expect(plan.calibration.ordinal_scores_are_probabilities).toBe(false);
  expect(plan.reproduction_basis).toBe("retained_normalized_inputs_and_original_geometry_only");
  expect(plan.upstream_provider_version).toBe("unavailable_disclosed");
});

test("semantic identity survives JSONB key ordering and uses original authoritative freeze time", () => {
  const receipt = prospectiveReceipt();
  const reordered = JSON.parse(JSON.stringify(receipt, (_key, value) => value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).reverse()) : value));
  expect(verifiedRelativePlanProspectiveFreeze(reordered, prospectiveOwner)).toEqual(receipt);
  expect(buildRelativePlanProspectivePlan(prospectiveInput, "2026-10-02T22:00:00.000Z")?.plan_fingerprint).toBe(receipt.plan.plan_fingerprint);
  expect(verifiedRelativePlanProspectiveFreeze(receipt, "33333333-3333-4333-8333-333333333333")).toBeNull();
});

test("retroactive, overlapping, short-embargo, oversized and noncanonical windows fail closed", () => {
  const changed = (field: "training" | "held_out" | "walk_forward", patch: Record<string, string>) => ({
    ...prospectiveInput, windows: { ...prospectiveInput.windows, [field]: { ...prospectiveInput.windows[field], ...patch } },
  });
  for (const input of [
    changed("training", { start_at: prospectiveFrozenAt }),
    changed("training", { end_at: prospectiveInput.windows.training.start_at }),
    changed("held_out", { start_at: "2026-10-09T20:59:59.999Z" }),
    changed("walk_forward", { start_at: "2026-10-23T20:59:59.999Z" }),
    changed("walk_forward", { end_at: "2027-10-02T21:00:00.000Z" }),
    changed("training", { start_at: "2026-10-05T13:30:00Z" }),
    { ...prospectiveInput, authority: { publication: true } },
    { ...prospectiveInput, source_revision: { ...prospectiveInput.source_revision, extra: "value" } },
    { ...prospectiveInput, owner_user_id: "invalid" },
    { ...prospectiveInput, source_revision: { commit_ref: "fixture-not-a-commit", build_identity: "b".repeat(24) } },
  ]) expect(buildRelativePlanProspectivePlan(input, prospectiveFrozenAt)).toBeNull();
});

test("a mutated charter, population, policy, authority or identity cannot masquerade as a durable freeze", () => {
  const receipt = prospectiveReceipt();
  for (const plan of [
    { ...receipt.plan, charter: { ...receipt.plan.charter, thresholds: { ...receipt.plan.charter.thresholds, minimum_precision_at_k: 0.1 } } },
    { ...receipt.plan, enrollment: { ...receipt.plan.enrollment, missing_outcomes: "discard" } },
    { ...receipt.plan, authority: { ...receipt.plan.authority, promotion: true } },
    { ...receipt.plan, model_fingerprint: "a".repeat(64) },
    { ...receipt.plan, reproduction_basis: "raw_provider_replay" },
    { ...receipt.plan, charter_fingerprint: "c".repeat(64) },
    { ...receipt.plan, plan_fingerprint: "c".repeat(64) },
    { ...receipt.plan, owner_user_id: "33333333-3333-4333-8333-333333333333" },
  ]) expect(verifiedRelativePlanProspectiveFreeze({ ...receipt, plan }, prospectiveOwner)).toBeNull();
  expect(verifiedRelativePlanProspectiveFreeze({ ...receipt, frozen_at: prospectiveInput.windows.training.start_at }, prospectiveOwner)).toBeNull();
  expect(verifiedRelativePlanProspectiveFreeze({ ...receipt, contract_version: "recommendation_learning_baseline_freeze_v1" }, prospectiveOwner)).toBeNull();
});
