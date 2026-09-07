import type { Config, Context } from "@netlify/functions";
import { timingSafeEqual } from "node:crypto";

const proofTokenHeader = "x-ai02-preflight-token";

export const config: Config = {
  path: "/.netlify/functions/ai02-nonsecret-preflight",
  method: "GET",
};

function tokensMatch(candidate: string | null, expected: string | undefined) {
  if (!candidate || !expected) return false;

  const candidateBytes = Buffer.from(candidate, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  return (
    candidateBytes.byteLength === expectedBytes.byteLength &&
    timingSafeEqual(candidateBytes, expectedBytes)
  );
}

function unavailable() {
  return new Response(JSON.stringify({ error: "not_found" }), {
    status: 404,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
}

/**
 * Temporary AI-02.16 deploy-preview receipt endpoint. It opens no database
 * connection and invokes no provider, evaluator, writer, route or adapter.
 */
export default async function ai02NonsecretPreflight(
  request: Request,
  context: Context,
) {
  if (request.method !== "GET" || context.deploy.context !== "deploy-preview") {
    return unavailable();
  }

  const proofToken = Netlify.env.get("AI02_PREFLIGHT_PROOF_TOKEN");
  if (!tokensMatch(request.headers.get(proofTokenHeader), proofToken)) {
    return unavailable();
  }

  const credentialPresence = Netlify.env.get("TWELVE_DATA_API_KEY")
    ? "present"
    : "absent";
  const applicationOwnerPreflight =
    Netlify.env.get("AI02_APPLICATION_OWNER_PREFLIGHT_CONFIRMED") === "confirmed"
      ? "confirmed"
      : "not_confirmed";

  return new Response(
    JSON.stringify({
      environment: "staging",
      source_relation: "public.recommendation_outcomes",
      existing_source_availability: "no_completed_bundle_available",
      credential_presence: credentialPresence,
      application_owner_preflight: applicationOwnerPreflight,
      deploy_preview_transport: "available",
      credential_values: "not_returned",
      credential_names: "not_returned",
      application_owner_identifier: "not_returned",
      deploy_identifier_or_url: "not_returned",
      source_rows: "not_returned",
      staging_connection: "not_opened",
      provider_evaluator: "not_invoked",
      branch_adapter: "not_deployed",
      outcome_persistence: "not_admitted",
      active_evidence_migration: "not_admitted",
      active_evidence_write: "not_admitted",
      offline_dataset: "not_admitted",
      offline_evaluation: "not_admitted",
      runtime_binding: "not_admitted",
      broker_binding: "not_admitted",
      production_binding: "not_admitted",
    }),
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}
