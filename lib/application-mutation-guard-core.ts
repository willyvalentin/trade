import { applicationCanonicalProductionOrigin } from "@/lib/application-platform-contract";

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
        | "runtime_url_missing"
        | "runtime_url_malformed"
        | "runtime_url_mismatch";
    }
  | { status: "unavailable"; category: "origin_configuration_unavailable" };

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

type NormalizedOrigin =
  | { status: "present"; origin: string }
  | { status: "missing" }
  | { status: "malformed" };

export type ApplicationProductionOriginDecision = Readonly<{
  status: "allowed" | "forbidden" | "unavailable";
  reason:
    | "allowed"
    | "configured_origin_missing"
    | "configured_origin_malformed"
    | "configured_origin_mismatch"
    | "runtime_url_missing"
    | "runtime_url_malformed"
    | "runtime_url_mismatch"
    | "request_origin_missing"
    | "request_origin_malformed"
    | "request_origin_mismatch";
  configured_origin: string | null;
  runtime_origin: string | null;
  request_origin: string | null;
}>;

function normalizedOrigin(
  value: string | null | undefined,
  options: { requireHttps?: boolean } = {},
): NormalizedOrigin {
  if (!value || value.length > 300) return { status: "missing" };
  if (value !== value.trim() || value === "null" || value.includes(",")) {
    return { status: "malformed" };
  }
  try {
    const parsed = new URL(value);
    if (
      parsed.origin === "null" ||
      parsed.username ||
      parsed.password ||
      (options.requireHttps && parsed.protocol !== "https:")
    ) {
      return { status: "malformed" };
    }
    return { status: "present", origin: parsed.origin };
  } catch {
    return { status: "malformed" };
  }
}

function originValue(result: NormalizedOrigin) {
  return result.status === "present" ? result.origin : null;
}

export function configuredApplicationOrigin(
  environment: Record<string, string | undefined> = process.env,
) {
  const configured = normalizedOrigin(environment.TURE_APPLICATION_ORIGIN, {
    requireHttps: true,
  });
  return originValue(configured);
}

export function applicationDeploymentContext(
  environment: Record<string, string | undefined> = process.env,
) {
  if (environment.NODE_ENV !== "production") return "local_development" as const;
  const configured = configuredApplicationOrigin(environment);
  const runtime = originValue(normalizedOrigin(environment.URL, { requireHttps: true }));
  return configured && runtime === configured
    ? "production"
    : "production_context_unobserved" as const;
}

export function evaluateApplicationProductionOrigin(input: Readonly<{
  requestOrigin: string | null;
  configuredApplicationOrigin: string | undefined;
  runtimeApplicationUrl: string | undefined;
}>): ApplicationProductionOriginDecision {
  const configured = normalizedOrigin(input.configuredApplicationOrigin, {
    requireHttps: true,
  });
  const runtime = normalizedOrigin(input.runtimeApplicationUrl, { requireHttps: true });
  const request = normalizedOrigin(input.requestOrigin);
  const base = {
    configured_origin: originValue(configured),
    runtime_origin: originValue(runtime),
    request_origin: originValue(request),
  };

  if (configured.status === "missing") {
    return { status: "unavailable", reason: "configured_origin_missing", ...base };
  }
  if (configured.status === "malformed") {
    return { status: "unavailable", reason: "configured_origin_malformed", ...base };
  }
  if (configured.origin !== applicationCanonicalProductionOrigin) {
    return { status: "unavailable", reason: "configured_origin_mismatch", ...base };
  }
  if (runtime.status === "missing") {
    return { status: "forbidden", reason: "runtime_url_missing", ...base };
  }
  if (runtime.status === "malformed") {
    return { status: "forbidden", reason: "runtime_url_malformed", ...base };
  }
  if (runtime.origin !== configured.origin) {
    return { status: "forbidden", reason: "runtime_url_mismatch", ...base };
  }
  if (request.status === "missing") {
    return { status: "forbidden", reason: "request_origin_missing", ...base };
  }
  if (request.status === "malformed") {
    return { status: "forbidden", reason: "request_origin_malformed", ...base };
  }
  if (request.origin !== configured.origin) {
    return { status: "forbidden", reason: "request_origin_mismatch", ...base };
  }
  return { status: "allowed", reason: "allowed", ...base };
}

export function evaluateApplicationAuthenticationOrigin(
  request: Request,
  environment: Record<string, string | undefined> = process.env,
): ApplicationAuthenticationOriginResult {
  if (environment.NODE_ENV === "production") {
    const decision = evaluateApplicationProductionOrigin({
      requestOrigin: request.headers.get("origin"),
      configuredApplicationOrigin: environment.TURE_APPLICATION_ORIGIN,
      runtimeApplicationUrl: environment.URL,
    });
    if (decision.status === "allowed") return { status: "allowed", category: "allowed" };
    if (decision.status === "unavailable") {
      return { status: "unavailable", category: "origin_configuration_unavailable" };
    }
    switch (decision.reason) {
      case "runtime_url_missing":
      case "runtime_url_malformed":
      case "runtime_url_mismatch":
        return { status: "forbidden", category: decision.reason };
      case "request_origin_missing":
        return { status: "forbidden", category: "missing_origin" };
      case "request_origin_malformed":
        return { status: "forbidden", category: "malformed_origin" };
      case "request_origin_mismatch":
        return { status: "forbidden", category: "origin_mismatch" };
      default:
        return { status: "forbidden", category: "runtime_url_malformed" };
    }
  }

  const requestOrigin = normalizedOrigin(request.url);
  const suppliedOrigin = normalizedOrigin(request.headers.get("origin"));
  if (suppliedOrigin.status === "missing") {
    return { status: "forbidden", category: "missing_origin" };
  }
  if (suppliedOrigin.status === "malformed") {
    return { status: "forbidden", category: "malformed_origin" };
  }
  return requestOrigin.status === "present" && suppliedOrigin.origin === requestOrigin.origin
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
    runtime_url_missing:
      "application_authentication_deploy_context_forbidden",
    runtime_url_malformed:
      "application_authentication_deploy_context_forbidden",
    runtime_url_mismatch:
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
  const runtime = originValue(normalizedOrigin(environment.URL, { requireHttps: true }));
  const requestOrigin = request ? originValue(normalizedOrigin(request.url)) : null;
  return {
    configured,
    valid: Boolean(origin),
    runtime_url_valid: Boolean(runtime),
    runtime_matches_configured: Boolean(origin && runtime === origin),
    expected_host_match: request ? Boolean(origin && requestOrigin === origin) : false,
  };
}

export function evaluateApplicationMutationOrigin(
  request: Request,
  environment: Record<string, string | undefined> = process.env,
): ApplicationMutationOriginResult {
  if (!unsafeMethods.has(request.method.toUpperCase())) return { status: "allowed" };

  if (environment.NODE_ENV !== "production") {
    const requestOrigin = normalizedOrigin(request.url);
    const suppliedOrigin = normalizedOrigin(request.headers.get("origin"));
    if (suppliedOrigin.status === "missing") {
      return { status: "forbidden", code: "application_mutation_origin_required" };
    }
    if (suppliedOrigin.status === "malformed") {
      return { status: "forbidden", code: "application_mutation_origin_invalid" };
    }
    return requestOrigin.status === "present" && suppliedOrigin.origin === requestOrigin.origin
      ? { status: "allowed" }
      : { status: "forbidden", code: "application_mutation_origin_invalid" };
  }

  const decision = evaluateApplicationProductionOrigin({
    requestOrigin: request.headers.get("origin"),
    configuredApplicationOrigin: environment.TURE_APPLICATION_ORIGIN,
    runtimeApplicationUrl: environment.URL,
  });
  if (decision.status === "unavailable") {
    return {
      status: "unavailable",
      code: "application_mutation_origin_configuration_unavailable",
    };
  }
  if (decision.status === "allowed") return { status: "allowed" };
  if (
    decision.reason === "runtime_url_missing" ||
    decision.reason === "runtime_url_malformed" ||
    decision.reason === "runtime_url_mismatch"
  ) {
    return {
      status: "forbidden",
      code: "application_mutation_deploy_context_forbidden",
    };
  }
  return { status: "forbidden", code: "application_mutation_origin_invalid" };
}
