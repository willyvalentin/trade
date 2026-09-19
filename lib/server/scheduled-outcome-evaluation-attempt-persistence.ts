import "server-only";

import type { Database, Json } from "@/lib/supabase-database.types";
import {
  SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION,
  scheduledOutcomeEvaluationAttemptFromRow,
  type ScheduledOutcomeEvaluationAttempt,
  type ScheduledOutcomeEvaluationReceipt,
} from "@/lib/scheduled-outcome-evaluation-receipt";
import { getServerSupabaseClient } from "@/lib/supabase-server";

type ScheduledOutcomeEvaluationAttemptInsert =
  Database["public"]["Tables"]["scheduled_outcome_evaluation_attempts"]["Insert"];

export type ScheduledOutcomeEvaluationAttemptClaim =
  | { status: "claimed"; attempt: ScheduledOutcomeEvaluationAttempt }
  | {
      status: "already_claimed" | "already_finalized";
      attempt: ScheduledOutcomeEvaluationAttempt;
    }
  | { status: "unavailable"; attempt: null };

export type ScheduledOutcomeEvaluationAttemptFinalization =
  | { status: "finalized"; attempt: ScheduledOutcomeEvaluationAttempt }
  | { status: "already_finalized"; attempt: ScheduledOutcomeEvaluationAttempt }
  | { status: "unavailable"; attempt: null };

function parsedAttempt(value: unknown) {
  return scheduledOutcomeEvaluationAttemptFromRow(value);
}

async function readAttempt({
  ownerUserId,
  attemptFingerprint,
}: {
  ownerUserId: string;
  attemptFingerprint: string;
}) {
  const { client } = getServerSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("scheduled_outcome_evaluation_attempts")
      .select("*")
      .eq("owner_user_id", ownerUserId)
      .eq("attempt_fingerprint", attemptFingerprint)
      .maybeSingle();

    if (error || !data) return null;
    return parsedAttempt(data);
  } catch {
    return null;
  }
}

/**
 * Claims the durable scheduler slot before the outcome route loads snapshots
 * or invokes the candle provider. A duplicate delivery reads the prior state
 * and must return without repeating market-data work.
 */
export async function claimScheduledOutcomeEvaluationAttempt({
  ownerUserId,
  attemptFingerprint,
  marketDate,
  scheduledSlotAt,
  routeReceivedAt,
  request,
}: {
  ownerUserId: string;
  attemptFingerprint: string;
  marketDate: string;
  scheduledSlotAt: string;
  routeReceivedAt: string;
  request: Record<string, unknown>;
}): Promise<ScheduledOutcomeEvaluationAttemptClaim> {
  const { client } = getServerSupabaseClient();
  if (!client) return { status: "unavailable", attempt: null };

  const record: ScheduledOutcomeEvaluationAttemptInsert = {
    contract_version: SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION,
    attempt_fingerprint: attemptFingerprint,
    owner_user_id: ownerUserId,
    market_date: marketDate,
    scheduled_slot_at: scheduledSlotAt,
    route_received_at: routeReceivedAt,
    status: "claimed",
    request_json: request as Json,
    receipt_json: {},
  };
  let inserted: ScheduledOutcomeEvaluationAttempt | null = null;
  try {
    const { data, error } = await client
      .from("scheduled_outcome_evaluation_attempts")
      .insert(record)
      .select("*")
      .maybeSingle();

    inserted = !error ? parsedAttempt(data) : null;
  } catch {
    // An ambiguous transport failure must not allow a second attempt to reach
    // the provider. The exact durable read below decides whether it is safe.
  }
  if (inserted) return { status: "claimed", attempt: inserted };

  // PostgREST reports a normal unique race as an insert error. Read the exact
  // owner-bound row rather than treating an ambiguous write as permission to
  // perform provider work again.
  const existing = await readAttempt({ ownerUserId, attemptFingerprint });
  if (!existing) return { status: "unavailable", attempt: null };

  return {
    status: existing.status === "claimed" ? "already_claimed" : "already_finalized",
    attempt: existing,
  };
}

export async function finalizeScheduledOutcomeEvaluationAttempt({
  ownerUserId,
  attemptFingerprint,
  receipt,
}: {
  ownerUserId: string;
  attemptFingerprint: string;
  receipt: ScheduledOutcomeEvaluationReceipt;
}): Promise<ScheduledOutcomeEvaluationAttemptFinalization> {
  const { client } = getServerSupabaseClient();
  if (!client) return { status: "unavailable", attempt: null };

  let finalized: ScheduledOutcomeEvaluationAttempt | null = null;
  try {
    const { data, error } = await client
      .from("scheduled_outcome_evaluation_attempts")
      .update({
        status: receipt.status,
        receipt_json: receipt as unknown as Json,
        finalized_at: receipt.completed_at,
        updated_at: receipt.completed_at,
      })
      .eq("owner_user_id", ownerUserId)
      .eq("attempt_fingerprint", attemptFingerprint)
      .eq("status", "claimed")
      .select("*")
      .maybeSingle();

    finalized = !error ? parsedAttempt(data) : null;
  } catch {
    // Read the exact row below. A finalization transport failure is never
    // treated as permission to retry this scheduled provider slot.
  }
  if (finalized) return { status: "finalized", attempt: finalized };

  const existing = await readAttempt({ ownerUserId, attemptFingerprint });
  if (!existing || existing.status === "claimed") {
    return { status: "unavailable", attempt: null };
  }

  return { status: "already_finalized", attempt: existing };
}
