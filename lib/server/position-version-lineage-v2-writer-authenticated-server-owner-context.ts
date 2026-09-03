import "server-only";

import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";
import { requireApplicationSession } from "@/lib/server/application-session";

export const POSITION_VERSION_LINEAGE_V2_WRITER_AUTHENTICATED_SERVER_OWNER_CONTEXT_VERSION =
  "position_version_lineage_v2_writer_authenticated_server_owner_context_v1" as const;

export type PositionVersionLineageV2WriterAuthenticatedServerOwnerContext = Readonly<{
  authenticatedServerOwner: string;
}>;

/**
 * Resolves the writer owner only from the existing, verified server session.
 *
 * This is deliberately not a route, command port, database client, or writer
 * adapter. It creates no authority by itself and remains unreferenced until a
 * separately reviewed runtime-binding action admits a single consumer.
 */
export async function resolvePositionVersionLineageV2WriterAuthenticatedServerOwnerContext(): Promise<PositionVersionLineageV2WriterAuthenticatedServerOwnerContext | null> {
  const session = await requireApplicationSession();

  if (!session || session.status !== "authenticated") {
    return null;
  }

  const authenticatedServerOwner = normalizeApplicationOwnerUserId(session.owner_user_id);
  if (!authenticatedServerOwner) {
    return null;
  }

  return Object.freeze({ authenticatedServerOwner });
}
