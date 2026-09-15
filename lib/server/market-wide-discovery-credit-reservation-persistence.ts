import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createMarketWideDiscoveryCreditReservationStore,
  marketWideDiscoveryCreditReservationBeginRpcName,
  marketWideDiscoveryCreditReservationContractVersion,
  marketWideDiscoveryCreditReservationFinalizeRpcName,
  marketWideDiscoveryCreditReservationRpcName,
  type MarketWideDiscoveryCreditReservationDatabase,
  type MarketWideDiscoveryCreditReservationInput,
} from "@/lib/market-wide-discovery-credit-reservation-store";
import { getServerSupabaseClient } from "@/lib/supabase-server";

function first<T>(value: T[] | T | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function database(
  client: SupabaseClient,
): MarketWideDiscoveryCreditReservationDatabase {
  return {
    async claim(input) {
      const { data, error } = await client.rpc(
        marketWideDiscoveryCreditReservationRpcName,
        {
          p_claim_id: input.claim_id,
          p_execution_fingerprint: input.execution_fingerprint,
          p_owner_user_id: input.owner_user_id,
          p_trading_date: input.trading_date,
          p_requested_credits: input.requested_credits,
          p_declared_daily_credit_budget:
            input.declared_daily_credit_budget,
          p_expected_contract_version:
            marketWideDiscoveryCreditReservationContractVersion,
        },
      );
      return { data: first(data), error };
    },
    async beginAttempt(input) {
      const { data, error } = await client.rpc(
        marketWideDiscoveryCreditReservationBeginRpcName,
        {
          p_claim_id: input.claim_id,
          p_execution_fingerprint: input.execution_fingerprint,
          p_expected_contract_version:
            marketWideDiscoveryCreditReservationContractVersion,
        },
      );
      return { data: first(data), error };
    },
    async finalize(input) {
      const { data, error } = await client.rpc(
        marketWideDiscoveryCreditReservationFinalizeRpcName,
        {
          p_claim_id: input.claim_id,
          p_execution_fingerprint: input.execution_fingerprint,
          p_expected_contract_version:
            marketWideDiscoveryCreditReservationContractVersion,
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
  return createMarketWideDiscoveryCreditReservationStore(
    supabase.client ? database(supabase.client) : null,
  );
}

export function prepareMarketWideDiscoveryCreditReservation(
  input: MarketWideDiscoveryCreditReservationInput,
) {
  return store().prepare(input);
}

export function finalizeMarketWideDiscoveryCreditReservation(input: {
  claim_id: string;
  execution_fingerprint: string;
  status: "completed" | "failed";
  finalized_at: string;
}) {
  return store().finalize(input);
}
