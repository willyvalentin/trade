import "server-only";

import { getConfiguredApplicationOwnerUserId } from "@/lib/application-session-core";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export type ApplicationOwnerPrincipalVerification =
  | { status: "verified"; owner_user_id: string }
  | {
      status:
        | "configuration_missing"
        | "identity_provider_unavailable"
        | "owner_not_found";
    };

export async function verifyConfiguredApplicationOwnerPrincipal(): Promise<ApplicationOwnerPrincipalVerification> {
  const ownerUserId = getConfiguredApplicationOwnerUserId();
  if (!ownerUserId) return { status: "configuration_missing" };

  const { client } = getServerSupabaseClient();
  if (!client) return { status: "identity_provider_unavailable" };

  const { data, error } = await client.auth.admin.getUserById(ownerUserId);
  if (error) return { status: "identity_provider_unavailable" };
  if (!data.user || data.user.id.toLowerCase() !== ownerUserId) {
    return { status: "owner_not_found" };
  }

  return { status: "verified", owner_user_id: ownerUserId };
}
