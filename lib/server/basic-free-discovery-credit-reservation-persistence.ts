import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  basicFreeDiscoveryCreditReservationBeginRpcName,
  basicFreeDiscoveryCreditReservationContractVersion,
  basicFreeDiscoveryCreditReservationFinalizeRpcName,
  basicFreeDiscoveryCreditReservationRpcName,
  createBasicFreeDiscoveryCreditReservationStore,
  type BasicFreeDiscoveryCreditReservationDatabase,
  type BasicFreeDiscoveryCreditReservationInput,
} from "@/lib/basic-free-discovery-credit-reservation-store";
import { getServerSupabaseClient } from "@/lib/supabase-server";

function first<T>(value: T[] | T | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function database(
  client: SupabaseClient,
): BasicFreeDiscoveryCreditReservationDatabase {
  return {
    async claim(input) {
      const { data, error } = await client.rpc(
        basicFreeDiscoveryCreditReservationRpcName,
        {
          p_claim_id: input.claim_id,
          p_execution_fingerprint: input.execution_fingerprint,
          p_owner_user_id: input.owner_user_id,
          p_trading_date: input.trading_date,
          p_minute_bucket: input.minute_bucket,
          p_requested_credits: input.requested_credits,
          p_declared_daily_credit_budget: input.declared_daily_credit_budget,
          p_declared_per_minute_credit_budget:
            input.declared_per_minute_credit_budget,
          p_expected_contract_version:
            basicFreeDiscoveryCreditReservationContractVersion,
        },
      );
      return { data: first(data), error };
    },
    async beginAttempt(input) {
      const { data, error } = await client.rpc(
        basicFreeDiscoveryCreditReservationBeginRpcName,
        {
          p_claim_id: input.claim_id,
          p_execution_fingerprint: input.execution_fingerprint,
          p_expected_contract_version:
            basicFreeDiscoveryCreditReservationContractVersion,
        },
      );
      return { data: first(data), error };
    },
    async finalize(input) {
      const { data, error } = await client.rpc(
        basicFreeDiscoveryCreditReservationFinalizeRpcName,
        {
          p_claim_id: input.claim_id,
          p_execution_fingerprint: input.execution_fingerprint,
          p_expected_contract_version:
            basicFreeDiscoveryCreditReservationContractVersion,
          p_terminal_status: input.status,
          p_finalized_at: input.finalized_at,
        },
      );
      return { data: first(data), error };
    },
  };
}

function store() {
  const supabase = getServerSupabaseClient();
  return createBasicFreeDiscoveryCreditReservationStore(
    supabase.client ? database(supabase.client) : null,
  );
}

export function prepareBasicFreeDiscoveryCreditReservation(
  input: BasicFreeDiscoveryCreditReservationInput,
) {
  return store().prepare(input);
}

export function finalizeBasicFreeDiscoveryCreditReservation(input: {
  claim_id: string;
  execution_fingerprint: string;
  status: "completed" | "failed";
  finalized_at: string;
}) {
  return store().finalize(input);
}
