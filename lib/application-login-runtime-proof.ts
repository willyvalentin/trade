import { isIP } from "node:net";

import { evaluateApplicationAuthenticationOrigin } from "@/lib/application-mutation-guard-core";

function normalizedIp(value: string | null) {
  const candidate = value?.trim() ?? "";
  if (
    !candidate ||
    candidate.length > 80 ||
    candidate.includes(",") ||
    isIP(candidate) === 0
  ) {
    return null;
  }
  return candidate.toLowerCase();
}

export async function resolveTrustedLoginIdentity(
  request: Request,
  environment: Record<string, string | undefined> = process.env,
) {
  const production = environment.NODE_ENV === "production";
  const platformIdentity = normalizedIp(
    request.headers.get("x-nf-client-connection-ip"),
  );
  if (production) return platformIdentity;

  // Local development may use x-real-ip in tests. X-Forwarded-For is never a
  // trusted identity source because callers can supply it directly.
  return platformIdentity ?? normalizedIp(request.headers.get("x-real-ip"));
}

export async function buildApplicationLoginRuntimeProof(
  request: Request,
  environment: Record<string, string | undefined> = process.env,
) {
  if (
    environment.TURE_LOGIN_RUNTIME_PROOF_ENABLED !== "true" ||
    environment.NODE_ENV !== "production" ||
    evaluateApplicationAuthenticationOrigin(request, environment).status !== "allowed"
  ) {
    return null;
  }

  const identity = await resolveTrustedLoginIdentity(request, environment);
  return Object.freeze({
    contract_version: "application_login_runtime_proof_v1",
    trusted_header_present: request.headers.has("x-nf-client-connection-ip"),
    trusted_identity_valid: identity !== null,
    runtime_type: "next_node_route_handler",
    header_value_returned: false,
    client_identity_returned: false,
  });
}
