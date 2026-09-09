import { timingSafeEqual } from "node:crypto";

import type { Config } from "@netlify/functions";

import {
  executePositionVersionLineageV2WriterPrivatePostgresqlRollbackProof,
} from "../../lib/server/position-version-lineage-v2-writer-private-postgresql-transport";
import {
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
} from "../../lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract";
import { buildPositionVersionLineageV2WriterCanonicalCommandDigest } from "../../lib/server/position-version-lineage-v2-writer-canonical-command-digest";

declare const Netlify: Readonly<{
  env: Readonly<{
    get: (name: string) => string | undefined;
  }>;
}>;

const proofTokenHeader = "x-ture-b03-proof-token";
const proofTokenSecret = "TURE_ACTION_666IZ_B03_ROLLBACK_PROOF_TOKEN" as const;
const owner = "0166617a-6661-4d00-8000-000000000001" as const;
const recommendation = "0166617a-6661-4d00-8000-000000000002" as const;
const canonicalToken = /^[a-f0-9]{64}$/;
const noStoreHeaders = { "Cache-Control": "no-store" };

export const config: Config = {
  path: "/.netlify/functions/action-666iz-b03-rollback-proof",
};

function unavailable() {
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: noStoreHeaders,
  });
}

function configuredToken() {
  const token = Netlify.env.get(proofTokenSecret);
  return typeof token === "string" && canonicalToken.test(token) ? token : null;
}

function isAuthorized(suppliedToken: string | null, expectedToken: string) {
  return (
    typeof suppliedToken === "string" &&
    suppliedToken.length === expectedToken.length &&
    canonicalToken.test(suppliedToken) &&
    timingSafeEqual(Buffer.from(suppliedToken), Buffer.from(expectedToken))
  );
}

/**
 * Temporary, draft-preview-only staging proof. It accepts no body or database
 * identifier, exposes no receipt fields and must be deleted before merge.
 */
export default async function action666izB03RollbackProof(request: Request) {
  if (request.method !== "POST") return unavailable();

  const token = configuredToken();
  if (!token || !isAuthorized(request.headers.get(proofTokenHeader), token)) {
    return unavailable();
  }

  const canonicalCommandDigest = buildPositionVersionLineageV2WriterCanonicalCommandDigest({
    authenticated_server_owner: owner,
    contract_version:
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
    opaque_recommendation_reference: recommendation,
    routine_signature:
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
  });

  try {
    await executePositionVersionLineageV2WriterPrivatePostgresqlRollbackProof({
      authenticatedServerOwner: owner,
      canonicalCommandDigest,
      opaqueRecommendationReference: recommendation,
    });
    return new Response(JSON.stringify({ outcome: "rolled_back" }), {
      status: 200,
      headers: noStoreHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Staging proof unavailable" }), {
      status: 503,
      headers: noStoreHeaders,
    });
  }
}
