import type { Config, Context } from "@netlify/functions";
import { timingSafeEqual } from "node:crypto";

const tokenHeader = "x-ai02-preview-attestation-token";
const expectedSiteName = "trade-vl";

export const config: Config = {
  path: "/api/diagnostics/ai02-preview-route-attestation",
  method: "POST",
};

function response(body: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function unavailable() {
  return response({ error: "not_found" }, 404);
}

function tokensMatch(candidate: string | null, expected: string | undefined) {
  if (!candidate || !expected) return false;

  const candidateBytes = Buffer.from(candidate, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");

  return (
    candidateBytes.byteLength === expectedBytes.byteLength &&
    timingSafeEqual(candidateBytes, expectedBytes)
  );
}

function isExpectedPreview(context: Context) {
  return (
    context.deploy.context === "deploy-preview" &&
    context.site.name?.trim().toLowerCase() === expectedSiteName
  );
}

/**
 * One-purpose, branch-preview transport attestation. It deliberately has no
 * dependency on application routes, a data store, or external data.
 */
export default async function ai02PreviewRouteAttestation(
  request: Request,
  context: Context,
) {
  if (request.method !== "POST" || !isExpectedPreview(context)) {
    return unavailable();
  }

  const expectedToken = Netlify.env.get("AI02_PREVIEW_ATTESTATION_TOKEN");
  if (!tokensMatch(request.headers.get(tokenHeader), expectedToken)) {
    return unavailable();
  }

  return response({
    environment: "staging",
    operation: "ai02_preview_route_attestation",
    result: "preview_route_attested",
    credential_values: "not_returned",
    database_activity: "not_performed",
    provider_data_access: "not_performed",
    application_runtime_binding: "not_performed",
  });
}
