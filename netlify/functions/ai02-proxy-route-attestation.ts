import type { Config, Context } from "@netlify/functions";
import { timingSafeEqual } from "node:crypto";

const tokenHeader = "x-ai02-proxy-route-attestation-token";
const expectedSiteName = "trade-vl";

export const config: Config = {
  // This is intentionally inside proxy.ts's existing public automation prefix.
  // The temporary function is never intended to merge to main.
  path: "/api/automation/ai02-proxy-route-attestation",
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
 * One-purpose proof that the existing Next proxy allowlist passes a custom
 * function route. It deliberately has no application, data, or provider path.
 */
export default async function ai02ProxyRouteAttestation(
  request: Request,
  context: Context,
) {
  if (request.method !== "POST" || !isExpectedPreview(context)) {
    return unavailable();
  }

  const expectedToken = Netlify.env.get("AI02_PROXY_ROUTE_ATTESTATION_TOKEN");
  if (!tokensMatch(request.headers.get(tokenHeader), expectedToken)) {
    return unavailable();
  }

  return response({
    environment: "staging",
    operation: "ai02_proxy_route_attestation",
    result: "proxy_route_attested",
    credential_values: "not_returned",
    database_activity: "not_performed",
    provider_data_access: "not_performed",
    application_runtime_binding: "not_performed",
  });
}
