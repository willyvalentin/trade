import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  continuousIntelligenceShadowCanaryManualAuthorizationConsumeRpcName,
  continuousIntelligenceShadowCanaryManualAuthorizationAdmitExecutionRpcName,
  continuousIntelligenceShadowCanaryManualAuthorizationIssueRpcName,
  continuousIntelligenceShadowCanaryManualAuthorizationTableName,
  continuousIntelligenceShadowCanaryManualAuthorizationTtlSeconds,
  parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord,
  type ContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
  type ContinuousIntelligenceShadowCanaryManualAuthorizationRecord,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  buildContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord,
  continuousIntelligenceShadowCanaryManualAuthorizationAdmitExecutionWithLeaseRpcName,
  continuousIntelligenceShadowCanaryManualAuthorizationIssueWithLeaseRpcName,
  type ContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord,
} from "@/lib/continuous-intelligence-shadow-canary-manual-execution-lease";
import { continuousIntelligenceShadowCanaryClaimTableName } from "@/lib/continuous-intelligence-shadow-canary-claim-store";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export type ContinuousIntelligenceShadowCanaryManualAuthorizationIssueResult =
  | {
      status: "issued";
      authorization: ContinuousIntelligenceShadowCanaryManualAuthorizationRecord;
    }
  | {
      status: "already_issued" | "conflicting_active_authorization" | "unavailable";
      authorization: ContinuousIntelligenceShadowCanaryManualAuthorizationRecord | null;
    };

export type ContinuousIntelligenceShadowCanaryManualAuthorizationConsumeResult = {
  status:
    | "consumed"
    | "already_consumed"
    | "expired"
    | "revoked"
    | "identity_mismatch"
    | "invalid_token"
    | "unavailable";
  authorization: ContinuousIntelligenceShadowCanaryManualAuthorizationRecord | null;
};

type ManualAuthorizationDatabase = {
  issue: (input: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding & {
    authorization_id: string;
    token_hash: string;
    issued_at: string;
    expires_at: string;
  }) => Promise<{ data: unknown; error: { code?: string } | null }>;
  consume: (input: {
    authorization_id: string;
    authorization_token: string;
    request_fingerprint: string;
    execution_id: string;
    claim_id: string;
  }) => Promise<{ data: unknown; error: { code?: string } | null }>;
  admitExecution: (input: {
    authorization_id: string;
    authorization_token: string;
    request_fingerprint: string;
    execution_id: string;
    claim_id: string;
    utc_day: string;
  }) => Promise<{ data: unknown; error: { code?: string } | null }>;
  issueWithLease: (input: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding & {
    authorization_id: string;
    execution_lease_id: string;
    token_hash: string;
    issued_at: string;
    expires_at: string;
  }) => Promise<{ data: unknown; error: { code?: string } | null }>;
  admitExecutionWithLease: (input: {
    authorization_id: string;
    authorization_token: string;
    execution_lease_id: string;
    request_fingerprint: string;
    execution_id: string;
    claim_id: string;
    utc_day: string;
  }) => Promise<{ data: unknown; error: { code?: string } | null }>;
  readAuthorization: (authorization_id: string) => Promise<{ data: unknown; error: { code?: string } | null }>;
  readClaim: (claim_id: string) => Promise<{ data: unknown; error: { code?: string } | null }>;
};

function first(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

function database(client: SupabaseClient): ManualAuthorizationDatabase {
  return {
    async issue(input) {
      const { data, error } = await client.rpc(
        continuousIntelligenceShadowCanaryManualAuthorizationIssueRpcName,
        {
          p_authorization_id: input.authorization_id,
          p_token_hash: input.token_hash,
          p_issued_at: input.issued_at,
          p_expires_at: input.expires_at,
          p_request_fingerprint: input.request_fingerprint,
          p_execution_id: input.execution_id,
          p_claim_id: input.claim_id,
          p_ticker: input.ticker,
          p_interval: input.interval,
          p_requested_start: input.requested_start,
          p_requested_end: input.requested_end,
          p_calendar_contract_version: input.calendar_contract_version,
          p_calendar_fingerprint: input.calendar_fingerprint,
          p_budget_policy_version: input.budget_policy_version,
          p_policy_total_credits: input.policy_total_credits,
          p_policy_hard_reserve_credits: input.policy_hard_reserve_credits,
          p_policy_normal_planned_max_credits: input.policy_normal_planned_max_credits,
          p_estimated_credits: input.estimated_credits,
          p_canary_contract_version: input.canary_contract_version,
          p_claim_contract_version: input.claim_contract_version,
          p_deployment_commit: input.deployment_commit,
          p_deployment_build_marker: input.deployment_build_marker,
          p_purpose: input.purpose,
        },
      );
      return { data: first(data), error };
    },
    async consume(input) {
      const { data, error } = await client.rpc(
        continuousIntelligenceShadowCanaryManualAuthorizationConsumeRpcName,
        {
          p_authorization_id: input.authorization_id,
          p_authorization_token: input.authorization_token,
          p_request_fingerprint: input.request_fingerprint,
          p_execution_id: input.execution_id,
          p_claim_id: input.claim_id,
        },
      );
      return { data: first(data), error };
    },
    async admitExecution(input) {
      const { data, error } = await client.rpc(
        continuousIntelligenceShadowCanaryManualAuthorizationAdmitExecutionRpcName,
        {
          p_authorization_id: input.authorization_id,
          p_authorization_token: input.authorization_token,
          p_request_fingerprint: input.request_fingerprint,
          p_execution_id: input.execution_id,
          p_claim_id: input.claim_id,
          p_utc_day: input.utc_day,
        },
      );
      return { data: first(data), error };
    },
    async issueWithLease(input) {
      const { data, error } = await client.rpc(
        continuousIntelligenceShadowCanaryManualAuthorizationIssueWithLeaseRpcName,
        {
          p_authorization_id: input.authorization_id,
          p_execution_lease_id: input.execution_lease_id,
          p_token_hash: input.token_hash,
          p_issued_at: input.issued_at,
          p_expires_at: input.expires_at,
          p_request_fingerprint: input.request_fingerprint,
          p_execution_id: input.execution_id,
          p_claim_id: input.claim_id,
          p_ticker: input.ticker,
          p_interval: input.interval,
          p_requested_start: input.requested_start,
          p_requested_end: input.requested_end,
          p_calendar_contract_version: input.calendar_contract_version,
          p_calendar_fingerprint: input.calendar_fingerprint,
          p_budget_policy_version: input.budget_policy_version,
          p_policy_total_credits: input.policy_total_credits,
          p_policy_hard_reserve_credits: input.policy_hard_reserve_credits,
          p_policy_normal_planned_max_credits: input.policy_normal_planned_max_credits,
          p_estimated_credits: input.estimated_credits,
          p_canary_contract_version: input.canary_contract_version,
          p_claim_contract_version: input.claim_contract_version,
          p_deployment_commit: input.deployment_commit,
          p_deployment_build_marker: input.deployment_build_marker,
          p_purpose: input.purpose,
        },
      );
      return { data: first(data), error };
    },
    async admitExecutionWithLease(input) {
      const { data, error } = await client.rpc(
        continuousIntelligenceShadowCanaryManualAuthorizationAdmitExecutionWithLeaseRpcName,
        {
          p_authorization_id: input.authorization_id,
          p_authorization_token: input.authorization_token,
          p_execution_lease_id: input.execution_lease_id,
          p_request_fingerprint: input.request_fingerprint,
          p_execution_id: input.execution_id,
          p_claim_id: input.claim_id,
          p_utc_day: input.utc_day,
        },
      );
      return { data: first(data), error };
    },
    async readAuthorization(authorizationId) {
      const { data, error } = await client
        .from(continuousIntelligenceShadowCanaryManualAuthorizationTableName)
        .select("authorization_id,contract_version,purpose,token_hash,issued_at,expires_at,consumed_at,authorization_status:status,request_fingerprint,execution_id,claim_id,ticker,market_interval:interval,requested_start,requested_end,calendar_contract_version,calendar_fingerprint,budget_policy_version,policy_total_credits,policy_hard_reserve_credits,policy_normal_planned_max_credits,estimated_credits,canary_contract_version,claim_contract_version,deployment_commit,deployment_build_marker")
        .eq("authorization_id", authorizationId)
        .maybeSingle();
      return { data, error };
    },
    async readClaim(claimId) {
      const { data, error } = await client
        .from(continuousIntelligenceShadowCanaryClaimTableName)
        .select("status")
        .eq("claim_id", claimId)
        .maybeSingle();
      return { data, error };
    },
  };
}

function operationOutcome(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  return typeof raw.outcome === "string" ? raw.outcome : null;
}

function serviceDatabase() {
  const supabase = getServerSupabaseClient();
  return supabase.client ? database(supabase.client) : null;
}

export function generateContinuousIntelligenceShadowCanaryManualAuthorizationToken() {
  return randomBytes(32).toString("base64url");
}

export function hashContinuousIntelligenceShadowCanaryManualAuthorizationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueContinuousIntelligenceShadowCanaryManualAuthorization(input: {
  binding: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding;
  authorization_id: string;
  raw_token: string;
  now: Date;
  db?: ManualAuthorizationDatabase | null;
}): Promise<ContinuousIntelligenceShadowCanaryManualAuthorizationIssueResult> {
  const db = input.db === undefined ? serviceDatabase() : input.db;
  if (!db || input.raw_token.length < 32) return { status: "unavailable", authorization: null };
  const issuedAt = input.now.toISOString();
  const expiresAt = new Date(input.now.getTime() + continuousIntelligenceShadowCanaryManualAuthorizationTtlSeconds * 1000).toISOString();
  try {
    const result = await db.issue({
      ...input.binding,
      authorization_id: input.authorization_id,
      token_hash: hashContinuousIntelligenceShadowCanaryManualAuthorizationToken(input.raw_token),
      issued_at: issuedAt,
      expires_at: expiresAt,
    });
    if (result.error || !result.data) return { status: "unavailable", authorization: null };
    const outcome = operationOutcome(result.data);
    const authorization = parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord(result.data);
    if (outcome === "issued" && authorization) return { status: "issued", authorization };
    if (outcome === "already_issued" && authorization) return { status: "already_issued", authorization };
    if (outcome === "conflicting_active_authorization") return { status: "conflicting_active_authorization", authorization: null };
  } catch {
    // Durable authorization must fail closed.
  }
  return { status: "unavailable", authorization: null };
}

export async function issueContinuousIntelligenceShadowCanaryManualAuthorizationWithLease(input: {
  binding: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding;
  authorization_id: string;
  execution_lease_id: string;
  raw_token: string;
  now: Date;
  db?: ManualAuthorizationDatabase | null;
}): Promise<ContinuousIntelligenceShadowCanaryManualAuthorizationIssueResult & {
  lease: ContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord | null;
}> {
  const db = input.db === undefined ? serviceDatabase() : input.db;
  if (!db || input.raw_token.length < 32) return { status: "unavailable", authorization: null, lease: null };
  const issuedAt = input.now.toISOString();
  const expiresAt = new Date(input.now.getTime() + continuousIntelligenceShadowCanaryManualAuthorizationTtlSeconds * 1000).toISOString();
  try {
    const result = await db.issueWithLease({
      ...input.binding,
      authorization_id: input.authorization_id,
      execution_lease_id: input.execution_lease_id,
      token_hash: hashContinuousIntelligenceShadowCanaryManualAuthorizationToken(input.raw_token),
      issued_at: issuedAt,
      expires_at: expiresAt,
    });
    if (result.error || !result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
      return { status: "unavailable", authorization: null, lease: null };
    }
    const raw = result.data as Record<string, unknown>;
    const outcome = typeof raw.outcome === "string" ? raw.outcome : null;
    const authorizationId = typeof raw.authorization_id === "string" ? raw.authorization_id : null;
    const leaseId = typeof raw.execution_lease_id === "string" ? raw.execution_lease_id : null;
    const responseIssuedAt = typeof raw.issued_at === "string" ? raw.issued_at : null;
    const responseExpiresAt = typeof raw.expires_at === "string" ? raw.expires_at : null;
    if (
      (outcome !== "issued" && outcome !== "already_issued") ||
      authorizationId !== input.authorization_id ||
      !leaseId || !responseIssuedAt || !responseExpiresAt ||
      raw.authorization_status !== "issued" || raw.lease_status !== "issued"
    ) {
      return { status: outcome === "conflicting_active_authorization" ? outcome : "unavailable", authorization: null, lease: null };
    }
    const authorization = parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord({
      ...input.binding,
      authorization_id: authorizationId,
      issued_at: responseIssuedAt,
      expires_at: responseExpiresAt,
      consumed_at: null,
      authorization_status: "issued",
      market_interval: input.binding.interval,
    });
    const lease = buildContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord({
      binding: input.binding,
      authorization_id: authorizationId,
      execution_lease_id: leaseId,
      issued_at: responseIssuedAt,
      expires_at: responseExpiresAt,
      status: "issued",
    });
    if (!authorization || !lease) return { status: "unavailable", authorization: null, lease: null };
    return { status: outcome, authorization, lease };
  } catch {
    // The authorization and lease must be created together or not at all.
  }
  return { status: "unavailable", authorization: null, lease: null };
}

export async function consumeContinuousIntelligenceShadowCanaryManualAuthorization(input: {
  authorization_id: string;
  raw_token: string;
  request_fingerprint: string;
  execution_id: string;
  claim_id: string;
  db?: ManualAuthorizationDatabase | null;
}): Promise<ContinuousIntelligenceShadowCanaryManualAuthorizationConsumeResult> {
  const db = input.db === undefined ? serviceDatabase() : input.db;
  if (!db || !input.raw_token) return { status: "unavailable", authorization: null };
  try {
    const result = await db.consume({
      authorization_id: input.authorization_id,
      authorization_token: input.raw_token,
      request_fingerprint: input.request_fingerprint,
      execution_id: input.execution_id,
      claim_id: input.claim_id,
    });
    if (result.error || !result.data) return { status: "unavailable", authorization: null };
    const outcome = operationOutcome(result.data);
    const authorization = parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord(result.data);
    if (
      outcome === "consumed" || outcome === "already_consumed" || outcome === "expired" ||
      outcome === "revoked" || outcome === "identity_mismatch" || outcome === "invalid_token"
    ) return { status: outcome, authorization };
  } catch {
    // No raw database errors leave the server boundary.
  }
  return { status: "unavailable", authorization: null };
}

export async function admitContinuousIntelligenceShadowCanaryManualExecution(input: {
  authorization_id: string;
  raw_token: string;
  request_fingerprint: string;
  execution_id: string;
  claim_id: string;
  utc_day: string;
  db?: ManualAuthorizationDatabase | null;
}) {
  const db = input.db === undefined ? serviceDatabase() : input.db;
  if (!db || !input.raw_token) return { status: "unavailable" as const };
  try {
    const result = await db.admitExecution({
      authorization_id: input.authorization_id,
      authorization_token: input.raw_token,
      request_fingerprint: input.request_fingerprint,
      execution_id: input.execution_id,
      claim_id: input.claim_id,
      utc_day: input.utc_day,
    });
    if (result.error || !result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
      return { status: "unavailable" as const };
    }
    const status = (result.data as Record<string, unknown>).admission_status;
    if (
      status === "attempt_started" || status === "already_admitted" || status === "authorization_expired" ||
      status === "authorization_replayed" || status === "identity_mismatch" || status === "daily_limit_reached"
    ) return { status };
  } catch {
    // Atomic admission must fail closed without returning database details.
  }
  return { status: "unavailable" as const };
}

export async function admitContinuousIntelligenceShadowCanaryManualExecutionWithLease(input: {
  authorization_id: string;
  raw_token: string;
  execution_lease_id: string;
  request_fingerprint: string;
  execution_id: string;
  claim_id: string;
  utc_day: string;
  db?: ManualAuthorizationDatabase | null;
}) {
  const db = input.db === undefined ? serviceDatabase() : input.db;
  if (!db || !input.raw_token || !input.execution_lease_id) return { status: "unavailable" as const };
  try {
    const result = await db.admitExecutionWithLease({
      authorization_id: input.authorization_id,
      authorization_token: input.raw_token,
      execution_lease_id: input.execution_lease_id,
      request_fingerprint: input.request_fingerprint,
      execution_id: input.execution_id,
      claim_id: input.claim_id,
      utc_day: input.utc_day,
    });
    if (result.error || !result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
      return { status: "unavailable" as const };
    }
    const status = (result.data as Record<string, unknown>).admission_status;
    if (
      status === "attempt_started" || status === "already_admitted" || status === "authorization_expired" ||
      status === "authorization_replayed" || status === "identity_mismatch" || status === "daily_limit_reached"
    ) return { status };
  } catch {
    // Atomic authorization, lease, and claim admission fails closed.
  }
  return { status: "unavailable" as const };
}

export async function readContinuousIntelligenceShadowCanaryManualAuthorization(input: {
  authorization_id: string;
  raw_token: string;
  db?: ManualAuthorizationDatabase | null;
}) {
  const db = input.db === undefined ? serviceDatabase() : input.db;
  if (!db || !input.raw_token) return { status: "unavailable" as const, authorization: null };
  try {
    const result = await db.readAuthorization(input.authorization_id);
    if (result.error) return { status: "unavailable" as const, authorization: null };
    const raw = result.data;
    const authorization = parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord(raw);
    if (!authorization) return { status: "invalid_token" as const, authorization: null };
    const tokenHash = raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>).token_hash
      : null;
    if (tokenHash !== hashContinuousIntelligenceShadowCanaryManualAuthorizationToken(input.raw_token)) {
      return { status: "invalid_token" as const, authorization: null };
    }
    return { status: "available" as const, authorization };
  } catch {
    return { status: "unavailable" as const, authorization: null };
  }
}

export async function readContinuousIntelligenceShadowCanaryManualAuthorizationClaimConflict(input: {
  claim_id: string;
  db?: ManualAuthorizationDatabase | null;
}) {
  const db = input.db === undefined ? serviceDatabase() : input.db;
  if (!db) return { status: "unavailable" as const, active_conflict: true };
  try {
    const result = await db.readClaim(input.claim_id);
    if (result.error) return { status: "unavailable" as const, active_conflict: true };
    const row = result.data;
    if (row === null) return { status: "available" as const, active_conflict: false };
    const raw = typeof row === "object" && row !== null && !Array.isArray(row)
      ? row as Record<string, unknown>
      : null;
    if (!raw || typeof raw.status !== "string") return { status: "unavailable" as const, active_conflict: true };
    return {
      status: "available" as const,
      active_conflict: raw.status === "claimed" || raw.status === "attempted",
    };
  } catch {
    return { status: "unavailable" as const, active_conflict: true };
  }
}

export type { ManualAuthorizationDatabase };
