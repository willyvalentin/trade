export type ApplicationMutationOriginResult =
  | { status: "allowed" }
  | {
      status: "forbidden";
      code:
        | "application_authentication_deploy_context_forbidden"
        | "application_mutation_deploy_context_forbidden"
        | "application_mutation_origin_required"
        | "application_mutation_origin_invalid";
    }
  | { status: "unavailable"; code: "application_mutation_origin_configuration_unavailable" };

export type ApplicationAuthenticationOriginResult =
  | { status: "allowed"; category: "allowed" }
  | {
      status: "forbidden";
      category:
        | "missing_origin"
        | "malformed_origin"
        | "origin_mismatch"
        | "non_production_context_denied";
    }
  | { status: "unavailable"; category: "origin_configuration_unavailable" };

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function normalizedOrigin(value: string | null | undefined) {
  if (!value || value.length > 300) return null;
  try {
    const origin = new URL(value).origin;
    return origin === "null" ? null : origin;
  } catch {
    return null;
  }
}

function suppliedBrowserOrigin(value: string | null) {
  if (value === null || value.length === 0 || value !== value.trim()) {
    return { status: "missing" as const };
  }
  if (value.length > 300 || value === "null" || value.includes(",")) {
    return { status: "malformed" as const };
  }

  try {
    const parsed = new URL(value);
    if (
      parsed.origin === "null" ||
      parsed.origin !== value ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    ) {
      return { status: "malformed" as const };
    }
    return { status: "valid" as const, origin: parsed.origin };
  } catch {
    return { status: "malformed" as const };
  }
}

export function configuredApplicationOrigin(
  environment: Record<string, string | undefined> = process.env,
) {
  const value = environment.TURE_APPLICATION_ORIGIN;
  if (typeof value !== "string" || value.length === 0 || value.length > 300 || value !== value.trim()) {
    return null;
  }
  try {
    const parsed = new URL(value);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash ||
      parsed.origin !== value
    ) {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

export function applicationDeploymentContext(
  environment: Record<string, string | undefined> = process.env,
) {
  if (environment.NODE_ENV !== "production") return "local_development" as const;
  if (environment.CONTEXT === "production") return "production" as const;
  if (environment.CONTEXT === "deploy-preview") return "deploy_preview" as const;
  if (environment.CONTEXT === "branch-deploy") return "branch_deploy" as const;
  return "production_context_unobserved" as const;
}

export function evaluateApplicationAuthenticationOrigin(
  request: Request,
  environment: Record<string, string | undefined> = process.env,
): ApplicationAuthenticationOriginResult {
  const suppliedOrigin = suppliedBrowserOrigin(request.headers.get("origin"));

  if (environment.NODE_ENV === "production") {
    if (environment.CONTEXT !== "production") {
      return { status: "forbidden", category: "non_production_context_denied" };
    }

    const configuredOrigin = configuredApplicationOrigin(environment);
    if (!configuredOrigin) {
      return { status: "unavailable", category: "origin_configuration_unavailable" };
    }

    if (suppliedOrigin.status === "missing") {
      return { status: "forbidden", category: "missing_origin" };
    }
    if (suppliedOrigin.status === "malformed") {
      return { status: "forbidden", category: "malformed_origin" };
    }
    return suppliedOrigin.origin === configuredOrigin
      ? { status: "allowed", category: "allowed" }
      : { status: "forbidden", category: "origin_mismatch" };
  }

  const requestOrigin = normalizedOrigin(request.url);
  if (suppliedOrigin.status === "missing") {
    return { status: "forbidden", category: "missing_origin" };
  }
  if (suppliedOrigin.status === "malformed") {
    return { status: "forbidden", category: "malformed_origin" };
  }
  return requestOrigin && suppliedOrigin.origin === requestOrigin
    ? { status: "allowed", category: "allowed" }
    : { status: "forbidden", category: "origin_mismatch" };
}

export function authenticationOriginFailureResponse(
  request: Request,
  environment: Record<string, string | undefined> = process.env,
) {
  const result = evaluateApplicationAuthenticationOrigin(request, environment);
  if (result.status === "allowed") return null;

  const code = {
    missing_origin: "application_authentication_origin_required",
    malformed_origin: "application_authentication_origin_malformed",
    origin_mismatch: "application_authentication_origin_invalid",
    origin_configuration_unavailable:
      "application_mutation_origin_configuration_unavailable",
    non_production_context_denied:
      "application_authentication_deploy_context_forbidden",
  }[result.category];

  return Response.json(
    {
      error: "Application authentication origin is not permitted.",
      code,
      origin_category: result.category,
    },
    {
      status: result.status === "unavailable" ? 503 : 403,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export function applicationOriginReadiness(
  request?: Request,
  environment: Record<string, string | undefined> = process.env,
) {
  const configured =
    typeof environment.TURE_APPLICATION_ORIGIN === "string" &&
    environment.TURE_APPLICATION_ORIGIN.length > 0;
  const origin = configuredApplicationOrigin(environment);
  const requestOrigin = request ? normalizedOrigin(request.url) : null;
  return {
    configured,
    valid: Boolean(origin),
    expected_host_match: request ? Boolean(origin && requestOrigin === origin) : false,
  };
}

export function evaluateApplicationMutationOrigin(
  request: Request,
  environment: Record<string, string | undefined> = process.env,
): ApplicationMutationOriginResult {
  if (!unsafeMethods.has(request.method.toUpperCase())) return { status: "allowed" };

  const requestOrigin = normalizedOrigin(request.url);
  const suppliedOrigin = suppliedBrowserOrigin(request.headers.get("origin"));
  if (suppliedOrigin.status === "missing") {
    return { status: "forbidden", code: "application_mutation_origin_required" };
  }
  if (suppliedOrigin.status === "malformed") {
    return { status: "forbidden", code: "application_mutation_origin_invalid" };
  }

  if (environment.NODE_ENV !== "production") {
    return requestOrigin && suppliedOrigin.origin === requestOrigin
      ? { status: "allowed" }
      : { status: "forbidden", code: "application_mutation_origin_invalid" };
  }

  if (environment.CONTEXT !== "production") {
    return {
      status: "forbidden",
      code: "application_mutation_deploy_context_forbidden",
    };
  }

  const configuredOrigin = configuredApplicationOrigin(environment);
  if (!configuredOrigin) {
    return {
      status: "unavailable",
      code: "application_mutation_origin_configuration_unavailable",
    };
  }

  return requestOrigin === configuredOrigin && suppliedOrigin.origin === configuredOrigin
    ? { status: "allowed" }
    : { status: "forbidden", code: "application_mutation_origin_invalid" };
}
