import "server-only";

import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";
import {
  INTERNAL_PAPER_OBSERVER_VERSION,
  internalPaperObserverFromUnknown,
} from "@/lib/internal-paper-observer";
import { getServerSupabaseClient } from "@/lib/supabase-server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const internalPaperAccountIdEnvironmentKey =
  "TURE_INTERNAL_PAPER_ACCOUNT_ID" as const;

export function getConfiguredInternalPaperAccountId(
  environment: Record<string, string | undefined> = process.env,
) {
  const value = environment[internalPaperAccountIdEnvironmentKey]?.trim().toLowerCase();
  return value && UUID_PATTERN.test(value) ? value : null;
}

export async function readInternalPaperObserver(
  ownerUserId: string,
  environment: Record<string, string | undefined> = process.env,
) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  const accountId = getConfiguredInternalPaperAccountId(environment);
  if (!owner || !accountId) {
    return {
      status: "not_configured",
      reason: owner ? "account_id_missing" : "owner_identity_invalid",
    } as const;
  }

  const { client } = getServerSupabaseClient();
  if (!client) return { status: "unavailable" } as const;

  const { data, error } = await client.rpc(
    "app_read_internal_paper_observer_v2",
    {
      p_owner_user_id: owner,
      p_account_id: accountId,
      p_observer_version: INTERNAL_PAPER_OBSERVER_VERSION,
    },
  );
  if (error) return { status: "unavailable" } as const;

  const observer = internalPaperObserverFromUnknown(data, {
    owner_user_id: owner,
    account_id: accountId,
  });
  return observer
    ? { status: "available", data: observer } as const
    : { status: "failed" } as const;
}
