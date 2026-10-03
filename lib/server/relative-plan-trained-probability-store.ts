import "server-only";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { verifiedRelativePlanProspectiveFreeze, relativePlanSemanticJson } from "@/lib/server/relative-plan-prospective-comparison";
import { verifiedRelativePlanTrainedProbabilityReceipt, RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION,
  type RelativePlanTrainedProbabilityModel, type RelativePlanTrainedProbabilityReceipt } from "@/lib/server/relative-plan-trained-probability-model";

type Database = {
  read(owner: string, freezeId: string): Promise<unknown>;
  materialize(model: RelativePlanTrainedProbabilityModel): Promise<unknown>;
  confirm(owner: string, freezeId: string): Promise<unknown>;
};
export type RelativePlanTrainedProbabilityStoreResult = {
  status: "available" | "not_found" | "pending_confirmation" | "materialized" | "already_materialized" | "conflicting" | "unavailable" | "not_ready";
  receipt: RelativePlanTrainedProbabilityReceipt | null;
  blocker: string | null;
};
const unavailable = (): RelativePlanTrainedProbabilityStoreResult => ({ status: "unavailable", receipt: null,
  blocker: "trained_probability_storage_unavailable_or_invalid" });
function databaseInstant(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  const suffix = value.slice(-6), offset = value.endsWith("Z") ? 0 : (suffix[0] === "+" ? 1 : -1) *
    (Number(suffix.slice(1, 3)) * 60 + Number(suffix.slice(4)));
  return new Date(parsed + offset * 60000).toISOString().slice(0, 19) === value.slice(0, 19)
    ? new Date(parsed).toISOString() : null;
}
function decode(value: unknown, freeze: unknown, owner: string): RelativePlanTrainedProbabilityStoreResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return unavailable();
  const row = value as Record<string, unknown>;
  if (Object.keys(row).length !== 2 || !Object.hasOwn(row, "status") || !Object.hasOwn(row, "receipt")) return unavailable();
  if (row.receipt === null) {
    if (row.status === "not_found") return { status: "not_found", receipt: null, blocker: "durably_frozen_training_probability_model_required" };
    if (row.status === "pending_confirmation") return { status: "pending_confirmation", receipt: null,
      blocker: "training_probability_committed_pre_forward_read_required" };
    if (row.status === "conflicting") return { status: "conflicting", receipt: null, blocker: "different_training_probability_model_already_materialized" };
    if (row.status === "not_ready") return { status: "not_ready", receipt: null, blocker: "training_probability_database_clock_outside_materialization_window" };
    return unavailable();
  }
  if (!["available", "materialized", "already_materialized"].includes(String(row.status)) ||
    typeof row.receipt !== "object" || Array.isArray(row.receipt)) return unavailable();
  const raw = row.receipt as Record<string, unknown>;
  // Normalize Postgres timestamptz serialization, never invent an absent clock.
  const materialized = databaseInstant(raw.materialized_at), confirmed = databaseInstant(raw.committed_read_at);
  if (!materialized || !confirmed) return unavailable();
  const receipt = verifiedRelativePlanTrainedProbabilityReceipt({ ...raw, materialized_at: materialized,
    committed_read_at: confirmed }, freeze, owner);
  return receipt ? { status: row.status as "available" | "materialized" | "already_materialized", receipt, blocker: null } : unavailable();
}

export function createRelativePlanTrainedProbabilityStore(database: Database | null) {
  const read = async (freezeValue: unknown, owner: string): Promise<RelativePlanTrainedProbabilityStoreResult> => {
    const freeze = verifiedRelativePlanProspectiveFreeze(freezeValue, owner);
    if (!database || !freeze) return unavailable();
    try { return decode(await database.read(owner, freeze.freeze_id), freeze, owner); } catch { return unavailable(); }
  };
  const confirmPending = async (freezeValue: unknown, owner: string): Promise<RelativePlanTrainedProbabilityStoreResult> => {
    const freeze = verifiedRelativePlanProspectiveFreeze(freezeValue, owner);
    if (!freeze || !database) return unavailable();
    const prior = await read(freeze, owner);
    if (prior.receipt) return { ...prior, status: "already_materialized" };
    if (prior.status !== "pending_confirmation") return prior;
    try {
      const result = decode(await database.confirm(owner, freeze.freeze_id), freeze, owner);
      if (!result.receipt || !["materialized", "already_materialized"].includes(result.status)) return result;
      const committed = await read(freeze, owner);
      return committed.receipt && relativePlanSemanticJson(committed.receipt) === relativePlanSemanticJson(result.receipt)
        ? result : unavailable();
    } catch { return unavailable(); }
  };
  return {
    read,
    // Resume the original already committed capsule, never refit from mutable
    // history after a lost write acknowledgement. SQL still enforces cutoff.
    confirmPending,
    async materialize(model: RelativePlanTrainedProbabilityModel, freezeValue: unknown,
      owner: string, now: Date): Promise<RelativePlanTrainedProbabilityStoreResult> {
      const prior = await read(freezeValue, owner);
      if (!["not_found", "pending_confirmation"].includes(prior.status)) {
        if (!prior.receipt) return prior;
        return relativePlanSemanticJson(prior.receipt.trained_model) === relativePlanSemanticJson(model)
          ? { ...prior, status: "already_materialized" } : { status: "conflicting", receipt: null,
            blocker: "different_training_probability_model_already_materialized" };
      }
      if (!Number.isFinite(now.getTime()) || !verifiedRelativePlanTrainedProbabilityReceipt({
        contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION,
        materialization_id: "11111111-1111-4111-8111-111111111111", owner_user_id: owner,
        materialized_at: now.toISOString(), committed_read_at: now.toISOString(), trained_model: model }, freezeValue, owner)) return { status: "not_ready", receipt: null,
          blocker: "training_probability_complete_pre_forward_candidate_invalid" };
      try {
        let result = decode(await database!.materialize(model), freezeValue, owner);
        // This MUST be a second RPC/transaction after materialization commits.
        // A statement timestamp inside the writing transaction is not proof
        // that forward consumers could see the model before their cutoff.
        if (result.status === "pending_confirmation") result = decode(await database!.confirm(owner, model.prospective_freeze_id), freezeValue, owner);
        if (!result.receipt || !["materialized", "already_materialized"].includes(result.status)) return result;
        const committed = await read(freezeValue, owner);
        // A successful write acknowledgement alone is not persisted evidence.
        if (!committed.receipt || relativePlanSemanticJson(committed.receipt) !== relativePlanSemanticJson(result.receipt) ||
          relativePlanSemanticJson(committed.receipt.trained_model) !== relativePlanSemanticJson(model)) return unavailable();
        return result;
      } catch { return unavailable(); }
    },
  };
}

export function relativePlanTrainedProbabilityStore() {
  const { client } = getServerSupabaseClient();
  return createRelativePlanTrainedProbabilityStore(client ? {
    async read(owner, freezeId) {
      const { data, error } = await client.rpc("read_relative_plan_trained_probability_model_v1", {
        p_owner_user_id: owner, p_prospective_freeze_id: freezeId,
        p_expected_contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION });
      if (error) throw new Error("training_probability_read_failed");
      return data;
    },
    async materialize(model) {
      const { data, error } = await client.rpc("materialize_relative_plan_trained_probability_model_v1", {
        p_owner_user_id: model.owner_user_id, p_prospective_freeze_id: model.prospective_freeze_id,
        p_trained_model: model, p_expected_contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION });
      if (error) throw new Error("training_probability_materialization_failed");
      return data;
    },
    async confirm(owner, freezeId) {
      const { data, error } = await client.rpc("confirm_relative_plan_trained_probability_model_v1", {
        p_owner_user_id: owner, p_prospective_freeze_id: freezeId,
        p_expected_contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION });
      if (error) throw new Error("training_probability_confirmation_failed");
      return data;
    },
  } : null);
}
