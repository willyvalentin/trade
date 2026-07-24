import "server-only";

import { isIP } from "node:net";

import { evaluateApplicationAuthenticationOrigin } from "@/lib/application-mutation-guard-core";
import { getServerSupabaseClient } from "@/lib/supabase-server";

type SharedLoginAdmission =
  | { status: "allowed"; identity_digest: string | null }
  | { status: "limited"; retry_after_seconds: number }
  | { status: "unavailable" };

type LoginAbuseRpcRow = {
  allowed?: unknown;
  retry_after_seconds?: unknown;
  result_code?: unknown;
};

type LocalBucket = { failures: number; expires_at: number };
const localDevelopmentBuckets = new Map<string, LocalBucket>();
const localWindowMs = 15 * 60 * 1000;

function localReserve(identityDigestValue: string | null, now = Date.now()): SharedLoginAdmission {
  const keys = ["global", ...(identityDigestValue ? [`client:${identityDigestValue}`] : [])];
  const limits = [100, ...(identityDigestValue ? [5] : [])];
  const buckets = keys.map((key) => {
    const previous = localDevelopmentBuckets.get(key);
    return previous && previous.expires_at > now
      ? previous
      : { failures: 0, expires_at: now + localWindowMs };
  });
  const blockedIndex = buckets.findIndex((bucket, index) => bucket.failures >= limits[index]!);
  if (blockedIndex !== -1) {
    return {
      status: "limited",
      retry_after_seconds: Math.max(1, Math.ceil((buckets[blockedIndex]!.expires_at - now) / 1000)),
    };
  }
  keys.forEach((key, index) => {
    localDevelopmentBuckets.set(key, { ...buckets[index]!, failures: buckets[index]!.failures + 1 });
  });
  return { status: "allowed", identity_digest: identityDigestValue };
}

function localFinalizeSuccess(identityDigestValue: string | null) {
  for (const key of ["global", ...(identityDigestValue ? [`client:${identityDigestValue}`] : [])]) {
    const bucket = localDevelopmentBuckets.get(key);
    if (bucket) localDevelopmentBuckets.set(key, { ...bucket, failures: Math.max(0, bucket.failures - 1) });
  }
  return true;
}

function normalizedIp(value: string | null) {
  const candidate = value?.trim() ?? "";
  if (!candidate || candidate.length > 80 || candidate.includes(",") || isIP(candidate) === 0) {
    return null;
  }
  return candidate.toLowerCase();
}

export async function resolveTrustedLoginIdentity(request: Request) {
  const production = process.env.NODE_ENV === "production";
  const platformIdentity = normalizedIp(request.headers.get("x-nf-client-connection-ip"));
  if (production) return platformIdentity;

  // Local development may use x-real-ip in tests. X-Forwarded-For is never a
  // trusted identity source because callers can supply it directly.
  return platformIdentity ?? normalizedIp(request.headers.get("x-real-ip"));
}

export async function buildApplicationLoginRuntimeProof(request: Request) {
  if (
    process.env.TURE_LOGIN_RUNTIME_PROOF_ENABLED !== "true" ||
    process.env.NODE_ENV !== "production" ||
    evaluateApplicationAuthenticationOrigin(request).status !== "allowed"
  ) {
    return null;
  }

  const identity = await resolveTrustedLoginIdentity(request);
  return Object.freeze({
    contract_version: "application_login_runtime_proof_v1",
    trusted_header_present: request.headers.has("x-nf-client-connection-ip"),
    trusted_identity_valid: identity !== null,
    runtime_type: "next_node_route_handler",
    header_value_returned: false,
    client_identity_returned: false,
  });
}

async function identityDigest(identity: string | null) {
  if (!identity) return null;
  const bytes = new TextEncoder().encode(`ture:login-abuse:v1:${identity}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function passwordsMatch(expected: string, supplied: string) {
  const encoder = new TextEncoder();
  const [expectedDigest, suppliedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
    crypto.subtle.digest("SHA-256", encoder.encode(supplied)),
  ]);
  const expectedBytes = new Uint8Array(expectedDigest);
  const suppliedBytes = new Uint8Array(suppliedDigest);
  let difference = expectedBytes.length ^ suppliedBytes.length;
  for (let index = 0; index < Math.max(expectedBytes.length, suppliedBytes.length); index += 1) {
    difference |= (expectedBytes[index] ?? 0) ^ (suppliedBytes[index] ?? 0);
  }
  return difference === 0;
}

function parseAdmissionRow(value: unknown): SharedLoginAdmission | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;
  const raw = row as LoginAbuseRpcRow;
  if (raw.allowed === true && raw.result_code === "reserved" && raw.retry_after_seconds === 0) {
    return { status: "allowed", identity_digest: null };
  }
  if (
    raw.allowed === false &&
    raw.result_code === "rate_limited" &&
    typeof raw.retry_after_seconds === "number" &&
    Number.isInteger(raw.retry_after_seconds) &&
    raw.retry_after_seconds > 0 &&
    raw.retry_after_seconds <= 900
  ) {
    return { status: "limited", retry_after_seconds: raw.retry_after_seconds };
  }
  return null;
}

export async function reserveSharedLoginAttempt(request: Request): Promise<SharedLoginAdmission> {
  const identity = await resolveTrustedLoginIdentity(request);
  const digest = await identityDigest(identity);
  const { client } = getServerSupabaseClient();
  if (!client) {
    return process.env.NODE_ENV === "production"
      ? { status: "unavailable" }
      : localReserve(digest);
  }

  try {
    const { data, error } = await client.rpc("app_login_abuse_reserve", {
      p_client_identity_digest: digest,
    });
    if (error) return { status: "unavailable" };
    const parsed = parseAdmissionRow(data);
    return parsed?.status === "allowed"
      ? { ...parsed, identity_digest: digest }
      : parsed ?? { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

export async function finalizeSharedLoginSuccess(identityDigestValue: string | null) {
  const { client } = getServerSupabaseClient();
  if (!client) return process.env.NODE_ENV === "production" ? false : localFinalizeSuccess(identityDigestValue);
  try {
    const { data, error } = await client.rpc("app_login_abuse_finalize_success", {
      p_client_identity_digest: identityDigestValue,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}

export const applicationLoginAbuseControlContract = {
  per_identity_failures: 5,
  global_failures: 100,
  window_seconds: 900,
  identity_storage: "sha256_digest_only",
  production_identity_header: "x-nf-client-connection-ip",
  unavailable_behavior: "fail_closed",
} as const;

export function resetDevelopmentLoginAbuseControlForTests() {
  localDevelopmentBuckets.clear();
}
