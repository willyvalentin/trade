import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createScannerClockPriorShadowForwardDecisionReceiptStore,
  scannerClockPriorShadowForwardDecisionPlanReadRpcName,
  scannerClockPriorShadowForwardDecisionPlanRecordRpcName,
  scannerClockPriorShadowForwardDecisionReceiptContractVersion,
  scannerClockPriorShadowForwardDecisionResultReadRpcName,
  scannerClockPriorShadowForwardDecisionResultRecordRpcName,
  type ScannerClockPriorShadowForwardDecisionReceiptDatabase,
} from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import type {
  ScannerClockPriorShadowForwardDecisionPlan,
  ScannerClockPriorShadowForwardDecisionResult,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";
import { getServerSupabaseClient } from "@/lib/supabase-server";

function only<T>(value: T[] | T | null) {
  return Array.isArray(value) ? value.length === 1 ? value[0] ?? null : null : value;
}

function database(
  client: SupabaseClient,
): ScannerClockPriorShadowForwardDecisionReceiptDatabase {
  return {
    async recordPlan(plan) {
      const { data, error } = await client.rpc(
        scannerClockPriorShadowForwardDecisionPlanRecordRpcName,
        {
          p_owner_user_id: plan.owner_user_id,
          p_plan_fingerprint: plan.plan_fingerprint,
          p_plan_json: plan,
          p_expected_receipt_contract_version:
            scannerClockPriorShadowForwardDecisionReceiptContractVersion,
        },
      );
      return { data: only(data), error };
    },
    async readPlans(ownerUserId) {
      const { data, error } = await client.rpc(
        scannerClockPriorShadowForwardDecisionPlanReadRpcName,
        {
          p_owner_user_id: ownerUserId,
          p_expected_receipt_contract_version:
            scannerClockPriorShadowForwardDecisionReceiptContractVersion,
        },
      );
      return { data: Array.isArray(data) ? data : null, error };
    },
    async recordResult(input) {
      const { data, error } = await client.rpc(
        scannerClockPriorShadowForwardDecisionResultRecordRpcName,
        {
          p_owner_user_id: input.owner_user_id,
          p_plan_id: input.plan_id,
          p_plan_fingerprint: input.plan_fingerprint,
          p_result_fingerprint: input.result_fingerprint,
          p_decision_result: input.decision_result,
          p_expected_receipt_contract_version:
            scannerClockPriorShadowForwardDecisionReceiptContractVersion,
        },
      );
      return { data: only(data), error };
    },
    async readResults(ownerUserId) {
      const { data, error } = await client.rpc(
        scannerClockPriorShadowForwardDecisionResultReadRpcName,
        {
          p_owner_user_id: ownerUserId,
          p_expected_receipt_contract_version:
            scannerClockPriorShadowForwardDecisionReceiptContractVersion,
        },
      );
      return { data: Array.isArray(data) ? data : null, error };
    },
  };
}

function store() {
  const supabase = getServerSupabaseClient();
  return createScannerClockPriorShadowForwardDecisionReceiptStore(
    supabase.client ? database(supabase.client) : null,
  );
}

export function recordScannerClockPriorShadowForwardDecisionPlan(
  plan: ScannerClockPriorShadowForwardDecisionPlan,
) {
  return store().recordPlan(plan);
}

export function readScannerClockPriorShadowForwardDecisionPlans(
  ownerUserId: string,
) {
  return store().readPlans(ownerUserId);
}

export function recordScannerClockPriorShadowForwardDecisionResult(input: {
  owner_user_id: string;
  plan_id: string;
  decision_result: ScannerClockPriorShadowForwardDecisionResult;
}) {
  return store().recordResult(input);
}

export function readScannerClockPriorShadowForwardDecisionResults(
  ownerUserId: string,
) {
  return store().readResults(ownerUserId);
}
