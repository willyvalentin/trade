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

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const restrictedNetlifyContexts = new Set(["deploy-preview", "branch-deploy"]);

function normalizedOrigin(value: string | null | undefined) {
  if (!value || value.length > 300) return null;
  try {
    const origin = new URL(value).origin;
    return origin === "null" ? null : origin;
  } catch {
    return null;
  }
}

export function configuredApplicationOrigin() {
  const value = process.env.TURE_APPLICATION_ORIGIN;
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

export function evaluateApplicationAuthenticationOrigin(request: Request): ApplicationMutationOriginResult {
  if (process.env.NODE_ENV !== "production") return { status: "allowed" };
  if (restrictedNetlifyContexts.has(process.env.CONTEXT ?? "")) {
    return {
      status: "forbidden",
      code: "application_authentication_deploy_context_forbidden",
    };
  }

  const configuredOrigin = configuredApplicationOrigin();
  if (!configuredOrigin) {
    return {
      status: "unavailable",
      code: "application_mutation_origin_configuration_unavailable",
    };
  }

  return normalizedOrigin(request.url) === configuredOrigin
    ? { status: "allowed" }
    : { status: "forbidden", code: "application_mutation_origin_invalid" };
}

export function applicationOriginReadiness(request?: Request) {
  const configured = typeof process.env.TURE_APPLICATION_ORIGIN === "string" && process.env.TURE_APPLICATION_ORIGIN.length > 0;
  const origin = configuredApplicationOrigin();
  const requestOrigin = request ? normalizedOrigin(request.url) : null;
  return {
    configured,
    valid: Boolean(origin),
    expected_host_match: request ? Boolean(origin && requestOrigin === origin) : false,
  };
}

export function evaluateApplicationMutationOrigin(request: Request): ApplicationMutationOriginResult {
  if (!unsafeMethods.has(request.method.toUpperCase())) return { status: "allowed" };

  const requestOrigin = normalizedOrigin(request.url);
  const suppliedOrigin = normalizedOrigin(request.headers.get("origin"));
  if (!suppliedOrigin) {
    return { status: "forbidden", code: "application_mutation_origin_required" };
  }

  if (process.env.NODE_ENV !== "production") {
    return requestOrigin && suppliedOrigin === requestOrigin
      ? { status: "allowed" }
      : { status: "forbidden", code: "application_mutation_origin_invalid" };
  }

  if (restrictedNetlifyContexts.has(process.env.CONTEXT ?? "")) {
    return {
      status: "forbidden",
      code: "application_mutation_deploy_context_forbidden",
    };
  }

  const configuredOrigin = configuredApplicationOrigin();
  if (!configuredOrigin) {
    return {
      status: "unavailable",
      code: "application_mutation_origin_configuration_unavailable",
    };
  }

  return requestOrigin === configuredOrigin && suppliedOrigin === configuredOrigin
    ? { status: "allowed" }
    : { status: "forbidden", code: "application_mutation_origin_invalid" };
}
