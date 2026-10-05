import "server-only";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { relativePlanSemanticJson, verifiedRelativePlanProspectiveFreeze } from "@/lib/server/relative-plan-prospective-comparison";
import { RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION, verifiedRelativePlanCharterResultReceipt,
  type RelativePlanCharterResult, type RelativePlanCharterResultReceipt } from "@/lib/server/relative-plan-charter-result";

type Database = { read(owner: string, freezeId: string): Promise<unknown>; finalize(result: RelativePlanCharterResult): Promise<unknown> };
export type RelativePlanCharterResultStoreResult = {
  status: "available" | "not_found" | "finalized" | "already_finalized" | "conflicting" | "unavailable" | "not_ready";
  receipt: RelativePlanCharterResultReceipt | null; blocker: string | null;
};
const unavailable = (): RelativePlanCharterResultStoreResult => ({ status: "unavailable", receipt: null,
  blocker: "relative_plan_charter_result_storage_unavailable_or_invalid" });
function databaseInstant(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  const suffix = value.slice(-6), offset = value.endsWith("Z") ? 0 : (suffix[0] === "+" ? 1 : -1) *
    (Number(suffix.slice(1,3)) * 60 + Number(suffix.slice(4)));
  return new Date(parsed + offset * 60000).toISOString().slice(0,19) === value.slice(0,19)
    ? new Date(parsed).toISOString() : null;
}
function decode(value: unknown, freeze: unknown, owner: string): RelativePlanCharterResultStoreResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return unavailable();
  const row = value as Record<string, unknown>;
  if (Object.keys(row).length !== 2 || !Object.hasOwn(row,"status") || !Object.hasOwn(row,"receipt")) return unavailable();
  if (row.receipt === null) {
    if (row.status === "not_found") return { status: "not_found", receipt: null, blocker: "durably_finalized_full_charter_result_required" };
    if (row.status === "not_ready") return { status: "not_ready", receipt: null, blocker: "relative_plan_database_forward_maturity_not_reached" };
    if (row.status === "conflicting") return { status: "conflicting", receipt: null, blocker: "different_original_charter_result_already_finalized" };
    return unavailable();
  }
  if (!["available","finalized","already_finalized"].includes(String(row.status)) ||
    typeof row.receipt !== "object" || Array.isArray(row.receipt)) return unavailable();
  const raw = row.receipt as Record<string, unknown>;
  const finalizedAt = databaseInstant(raw.finalized_at);
  if (!finalizedAt) return unavailable();
  const receipt = verifiedRelativePlanCharterResultReceipt({ ...raw, finalized_at: finalizedAt },freeze,owner);
  return receipt ? { status: row.status as "available" | "finalized" | "already_finalized", receipt, blocker: null } : unavailable();
}
export function createRelativePlanCharterResultStore(database: Database | null) {
  const read = async (freezeValue: unknown, owner: string): Promise<RelativePlanCharterResultStoreResult> => {
    const freeze = verifiedRelativePlanProspectiveFreeze(freezeValue,owner);
    if (!database || !freeze) return unavailable();
    try { return decode(await database.read(owner,freeze.freeze_id),freeze,owner); } catch { return unavailable(); }
  };
  return { read,
    async finalize(result: RelativePlanCharterResult, freeze: unknown, owner: string): Promise<RelativePlanCharterResultStoreResult> {
      if (!database || !verifiedRelativePlanProspectiveFreeze(freeze,owner) || result.owner_user_id !== owner) return unavailable();
      try {
        const response = await database.finalize(result);
        if (!response || typeof response !== "object" || Array.isArray(response)) return unavailable();
        const ack = response as Record<string,unknown>;
        if (Object.keys(ack).length !== 2 || !Object.hasOwn(ack,"status") || !Object.hasOwn(ack,"receipt")) return unavailable();
        if (ack.receipt === null) return decode(response,freeze,owner);
        if (!["finalized","already_finalized"].includes(String(ack.status)) ||
          !ack.receipt || typeof ack.receipt !== "object" || Array.isArray(ack.receipt)) return unavailable();
        const raw = ack.receipt as Record<string,unknown>, finalizedAt = databaseInstant(raw.finalized_at);
        if (!finalizedAt) return unavailable();
        // A write acknowledgement is not evidence. Independently replay the
        // separately read committed capsule once, then bind the entire ack to
        // it. Do not waste a second full replay of an uncommitted response.
        const committed = await read(freeze,owner);
        return committed.receipt && relativePlanSemanticJson(committed.receipt) === relativePlanSemanticJson({ ...raw,finalized_at:finalizedAt }) &&
          relativePlanSemanticJson(committed.receipt.result) === relativePlanSemanticJson(result)
          ? { ...committed,status:ack.status as "finalized" | "already_finalized" } : unavailable();
      } catch { return unavailable(); }
    },
  };
}
export function relativePlanCharterResultStore() {
  const { client } = getServerSupabaseClient();
  return createRelativePlanCharterResultStore(client ? {
    async read(owner,freezeId) {
      const { data,error } = await client.rpc("read_relative_plan_charter_result_v1", {
        p_owner_user_id: owner, p_prospective_freeze_id: freezeId, p_expected_contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION });
      if (error) throw new Error("relative_plan_result_read_failed");
      return data;
    },
    async finalize(result) {
      const { data,error } = await client.rpc("finalize_relative_plan_charter_result_v1", {
        p_owner_user_id: result.owner_user_id, p_prospective_freeze_id: result.prospective_freeze_id,
        p_result: result, p_expected_contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION });
      if (error) throw new Error("relative_plan_result_finalization_failed");
      return data;
    },
  } : null);
}
