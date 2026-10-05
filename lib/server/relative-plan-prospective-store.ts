import "server-only";
import { buildRelativePlanProspectivePlan, verifiedRelativePlanProspectiveFreeze,
  relativePlanSemanticJson, RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION,
  type RelativePlanProspectivePlan, type RelativePlanProspectiveFreeze } from "@/lib/server/relative-plan-prospective-comparison";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export type RelativePlanProspectiveDatabase = {
  read(owner: string): Promise<unknown>;
  freeze(plan: RelativePlanProspectivePlan): Promise<unknown>;
};
export type RelativePlanProspectiveStoreResult = {
  status: "available" | "not_found" | "frozen" | "already_frozen" | "conflicting" | "unavailable" | "invalid_request";
  receipt: RelativePlanProspectiveFreeze | null;
  blocker: string | null;
};
const unavailable = (): RelativePlanProspectiveStoreResult => ({ status: "unavailable", receipt: null,
  blocker: "relative_plan_prospective_storage_unavailable_or_invalid" });

function decode(value: unknown, owner: string): RelativePlanProspectiveStoreResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return unavailable();
  const row = value as Record<string, unknown>;
  if (row.status === "not_found" && row.receipt === null) return { status: "not_found", receipt: null,
    blocker: "relative_plan_prospective_freeze_missing" };
  if (row.status === "conflicting" && row.receipt === null) return { status: "conflicting", receipt: null,
    blocker: "different_relative_plan_comparison_already_frozen" };
  if (!["available", "frozen", "already_frozen"].includes(String(row.status)) ||
    !row.receipt || typeof row.receipt !== "object" || Array.isArray(row.receipt)) return unavailable();
  const raw = row.receipt as Record<string, unknown>;
  const parsedAt = typeof raw.frozen_at === "string" ? Date.parse(raw.frozen_at) : NaN;
  if (!Number.isFinite(parsedAt)) return unavailable();
  const receipt = verifiedRelativePlanProspectiveFreeze({ ...raw, frozen_at: new Date(parsedAt).toISOString() }, owner);
  return receipt ? { status: row.status as "available" | "frozen" | "already_frozen", receipt, blocker: null } : unavailable();
}

export function createRelativePlanProspectiveStore(database: RelativePlanProspectiveDatabase | null) {
  const read = async (owner: string): Promise<RelativePlanProspectiveStoreResult> => {
    if (!database || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(owner)) return unavailable();
    try { return decode(await database.read(owner), owner); } catch { return unavailable(); }
  };
  return {
    read,
    async freeze(input: unknown, owner: string, now: Date): Promise<RelativePlanProspectiveStoreResult> {
      const prior = await read(owner);
      if (prior.status === "unavailable" || prior.status === "conflicting") return prior;
      if (!Number.isFinite(now.getTime())) return unavailable();
      if (prior.receipt) {
        const originalInput = { owner_user_id: prior.receipt.plan.owner_user_id,
          source_revision: prior.receipt.plan.source_revision, windows: prior.receipt.plan.windows };
        // Exact idempotent readback of an already stored policy is not a NEW
        // freeze. Preserve old receipts after producer-version changes.
        if (relativePlanSemanticJson(input) === relativePlanSemanticJson(originalInput)) {
          return { ...prior, status: "already_frozen" };
        }
      }
      // An idempotent request is rebuilt at the ORIGINAL database freeze, so
      // restarting after training begins can read the same immutable plan.
      const plan = buildRelativePlanProspectivePlan(input, prior.receipt?.frozen_at ?? now.toISOString());
      if (!plan || plan.owner_user_id !== owner) return { status: "invalid_request", receipt: null,
        blocker: "relative_plan_prospective_definition_invalid_or_retroactive" };
      if (prior.receipt) return relativePlanSemanticJson(prior.receipt.plan) === relativePlanSemanticJson(plan)
        ? { ...prior, status: "already_frozen" } : { status: "conflicting", receipt: null,
          blocker: "different_relative_plan_comparison_already_frozen" };
      try {
        const result = decode(await database!.freeze(plan), owner);
        if (!result.receipt || !["frozen", "already_frozen"].includes(result.status)) return result;
        const readback = await read(owner);
        // A write acknowledgement is not acceptance: verify exact committed
        // readback, including server/database time, before returning a freeze.
        if (!readback.receipt || relativePlanSemanticJson(readback.receipt) !== relativePlanSemanticJson(result.receipt) ||
          relativePlanSemanticJson(readback.receipt.plan) !== relativePlanSemanticJson(plan)) return unavailable();
        return result;
      } catch { return unavailable(); }
    },
  };
}

export function relativePlanProspectiveStore() {
  const { client } = getServerSupabaseClient();
  return createRelativePlanProspectiveStore(client ? {
    async read(owner) {
      const { data, error } = await client.rpc("read_relative_plan_prospective_comparison_v1", {
        p_owner_user_id: owner, p_expected_contract_version: RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION });
      if (error) throw new Error("prospective_read_failed");
      return data;
    },
    async freeze(plan) {
      const { data, error } = await client.rpc("freeze_relative_plan_prospective_comparison_v1", {
        p_owner_user_id: plan.owner_user_id, p_plan: plan,
        p_expected_contract_version: RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION });
      if (error) throw new Error("prospective_freeze_failed");
      return data;
    },
  } : null);
}
