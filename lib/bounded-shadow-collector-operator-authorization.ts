import {
  boundedShadowCollectorExecutionProofAuthorizationLimits,
  boundedShadowCollectorExecutionProofAuthorizationRouteMarker,
  boundedShadowCollectorExecutionProofAuthorizationRoutePath,
  boundedShadowCollectorExecutionProofFingerprint,
  type BoundedShadowCollectorExecutionProofRequest,
} from "@/lib/bounded-shadow-collector-execution-proof";

export const boundedShadowCollectorOperatorAuthorizationContractVersion =
  "bounded_shadow_collector_operator_authorization_v1" as const;

type AuthorizationStatus = "issued" | "consuming" | "consumed";

type AuthorizationRecord = {
  token_hash: string;
  request_fingerprint: string;
  issued_at: string;
  expires_at: string;
  status: AuthorizationStatus;
};

export type BoundedShadowCollectorOperatorAuthorizationLease = {
  token_hash: string;
  request_fingerprint: string;
};

export type BoundedShadowCollectorOperatorAuthorizationIssueResult =
  | {
      ok: true;
      token: string;
      request_fingerprint: string;
      issued_at: string;
      expires_at: string;
      ttl_seconds: 60;
    }
  | {
      ok: false;
      blocker: "authorization_capacity_unavailable" | "authorization_generation_failed";
    };

export type BoundedShadowCollectorOperatorAuthorizationBeginResult =
  | { ok: true; lease: BoundedShadowCollectorOperatorAuthorizationLease }
  | {
      ok: false;
      blocker:
        | "operator_authorization_required"
        | "operator_authorization_invalid"
        | "operator_authorization_expired"
        | "operator_authorization_mismatch"
        | "operator_authorization_already_consumed"
        | "operator_authorization_in_use";
    };

type StoreOptions = {
  now?: () => Date;
  token_generator?: () => string;
  hash_token?: (token: string) => Promise<string>;
};

function defaultTokenGenerator() {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function defaultHashToken(token: string) {
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createBoundedShadowCollectorOperatorAuthorizationStore(
  options: StoreOptions = {},
) {
  const records = new Map<string, AuthorizationRecord>();
  let pendingIssuanceCount = 0;
  const now = options.now ?? (() => new Date());
  const tokenGenerator = options.token_generator ?? defaultTokenGenerator;
  const hashToken = options.hash_token ?? defaultHashToken;

  const cleanupExpired = () => {
    const currentTime = now().getTime();
    for (const [tokenHash, record] of records) {
      if (Date.parse(record.expires_at) <= currentTime) records.delete(tokenHash);
    }
  };

  const reserveIssuanceCapacity = () => {
    cleanupExpired();
    if (
      records.size + pendingIssuanceCount >=
      boundedShadowCollectorExecutionProofAuthorizationLimits.max_records
    ) {
      return false;
    }
    pendingIssuanceCount += 1;
    return true;
  };

  return {
    async issue(request: BoundedShadowCollectorExecutionProofRequest): Promise<BoundedShadowCollectorOperatorAuthorizationIssueResult> {
      if (!reserveIssuanceCapacity()) {
        return { ok: false, blocker: "authorization_capacity_unavailable" };
      }
      try {
        const issued = now();
        const token = tokenGenerator();
        const tokenHash = await hashToken(token);
        if (records.has(tokenHash)) {
          return { ok: false, blocker: "authorization_generation_failed" };
        }
        const expires = new Date(
          issued.getTime() + boundedShadowCollectorExecutionProofAuthorizationLimits.ttl_ms,
        );
        const requestFingerprint = boundedShadowCollectorExecutionProofFingerprint(request);
        records.set(tokenHash, {
          token_hash: tokenHash,
          request_fingerprint: requestFingerprint,
          issued_at: issued.toISOString(),
          expires_at: expires.toISOString(),
          status: "issued",
        });
        return {
          ok: true,
          token,
          request_fingerprint: requestFingerprint,
          issued_at: issued.toISOString(),
          expires_at: expires.toISOString(),
          ttl_seconds: 60,
        };
      } catch {
        return { ok: false, blocker: "authorization_generation_failed" };
      } finally {
        pendingIssuanceCount -= 1;
      }
    },
    async begin(
      token: string | null,
      request: BoundedShadowCollectorExecutionProofRequest,
    ): Promise<BoundedShadowCollectorOperatorAuthorizationBeginResult> {
      if (!token) return { ok: false, blocker: "operator_authorization_required" };
      const tokenHash = await hashToken(token);
      const record = records.get(tokenHash);
      if (!record) return { ok: false, blocker: "operator_authorization_invalid" };
      const currentTime = now().getTime();
      if (Date.parse(record.expires_at) <= currentTime) {
        records.delete(tokenHash);
        return { ok: false, blocker: "operator_authorization_expired" };
      }
      if (record.request_fingerprint !== boundedShadowCollectorExecutionProofFingerprint(request)) {
        return { ok: false, blocker: "operator_authorization_mismatch" };
      }
      if (record.status === "consumed") {
        return { ok: false, blocker: "operator_authorization_already_consumed" };
      }
      if (record.status === "consuming") {
        return { ok: false, blocker: "operator_authorization_in_use" };
      }
      record.status = "consuming";
      return {
        ok: true,
        lease: { token_hash: tokenHash, request_fingerprint: record.request_fingerprint },
      };
    },
    consume(lease: BoundedShadowCollectorOperatorAuthorizationLease) {
      const record = records.get(lease.token_hash);
      if (record && record.request_fingerprint === lease.request_fingerprint) {
        record.status = "consumed";
      }
    },
    snapshot() {
      cleanupExpired();
      return {
        record_count: records.size,
        issued_count: [...records.values()].filter((record) => record.status === "issued").length,
        consuming_count: [...records.values()].filter((record) => record.status === "consuming").length,
        consumed_count: [...records.values()].filter((record) => record.status === "consumed").length,
        pending_issuance_count: pendingIssuanceCount,
        max_records: boundedShadowCollectorExecutionProofAuthorizationLimits.max_records,
      } as const;
    },
  };
}

export type BoundedShadowCollectorOperatorAuthorizationDiagnostics = {
  contract_version: typeof boundedShadowCollectorOperatorAuthorizationContractVersion;
  route_marker: typeof boundedShadowCollectorExecutionProofAuthorizationRouteMarker;
  route_path: typeof boundedShadowCollectorExecutionProofAuthorizationRoutePath;
  route_present: true;
  status: "not_observed";
  latest_safe_observed_result: null;
  ttl_seconds: 60;
  single_use: true;
  request_bound: true;
  process_local_only: true;
  durable: false;
  browser_route_invocation: false;
  token_present_in_diagnostics: false;
  no_effect_boundary: string;
};

export function buildBoundedShadowCollectorOperatorAuthorizationDiagnostics(): BoundedShadowCollectorOperatorAuthorizationDiagnostics {
  return {
    contract_version: boundedShadowCollectorOperatorAuthorizationContractVersion,
    route_marker: boundedShadowCollectorExecutionProofAuthorizationRouteMarker,
    route_path: boundedShadowCollectorExecutionProofAuthorizationRoutePath,
    route_present: true,
    status: "not_observed",
    latest_safe_observed_result: null,
    ttl_seconds: 60,
    single_use: true,
    request_bound: true,
    process_local_only: true,
    durable: false,
    browser_route_invocation: false,
    token_present_in_diagnostics: false,
    no_effect_boundary:
      "No browser invocation, provider call, runtime reservation, cache mutation, persistence, schedule, recommendation, scanner, ranking, confidence, execution, or broker effect.",
  };
}

export const boundedShadowCollectorOperatorAuthorizationStore =
  createBoundedShadowCollectorOperatorAuthorizationStore();
