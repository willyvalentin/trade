import "server-only";

import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";
import {
  buildObservationCycleReadback,
  type ObservationCycleReadback,
} from "@/lib/observation-cycle-receipt";
import {
  unavailableObservationSeriesEvidenceReadback,
  type ObservationSeriesEvidenceReadback,
} from "@/lib/observation-series-evidence";
import { buildObservationSeriesEvidenceReadback } from "@/lib/server/observation-series-evidence-builder";
import {
  OBSERVATION_SERIES_CONTROL_VERSION,
  observationSeriesControlFromUnknown,
} from "@/lib/observation-series-control";
import { getServerSupabaseClient } from "@/lib/supabase-server";

const MAX_SERIES_WINDOW_ROWS = 100;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/**
 * Reads the latest persisted observation-series claim, then reloads its exact
 * half-open window with count-checked queries. It is deliberately independent
 * of the current environment flags so a cleaned-up series remains auditable.
 */
export async function readLatestObservationSeriesEvidence(
  ownerUserId: string,
): Promise<ObservationSeriesEvidenceReadback> {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  const { client } = getServerSupabaseClient();
  if (!client || !owner) {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_evidence_server_unavailable",
    );
  }

  const latestAttemptResult = await client
    .from("scheduled_scan_attempts")
    .select(
      "attempt_fingerprint,source,mode,scheduled_function_fired_at,utc_timestamp,payload_json",
    )
    .eq("source", "netlify_scheduled_function")
    .eq("mode", "scheduled")
    .contains("payload_json", {
      observation_series_control: {
        control_version: OBSERVATION_SERIES_CONTROL_VERSION,
      },
    })
    .order("scheduled_function_fired_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(1)
    .maybeSingle();
  if (latestAttemptResult.error) {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_latest_claim_read_failed",
    );
  }
  if (!latestAttemptResult.data) {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_claim_not_retained",
    );
  }

  const payload = objectOrNull(latestAttemptResult.data.payload_json);
  const control = observationSeriesControlFromUnknown(
    payload?.observation_series_control,
  );
  if (!control || !control.starts_at_utc || !control.expires_at_utc) {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_latest_claim_invalid",
    );
  }

  const [attemptResult, receiptResult] = await Promise.all([
    client
      .from("scheduled_scan_attempts")
      .select(
        "attempt_fingerprint,source,mode,scheduled_function_fired_at,utc_timestamp,payload_json",
        { count: "exact" },
      )
      .eq("source", "netlify_scheduled_function")
      .eq("mode", "scheduled")
      .gte("scheduled_function_fired_at", control.starts_at_utc)
      .lt("scheduled_function_fired_at", control.expires_at_utc)
      .order("scheduled_function_fired_at", { ascending: true })
      .limit(MAX_SERIES_WINDOW_ROWS),
    client
      .from("observation_cycle_receipts")
      .select(
        "receipt_version,cycle_fingerprint,owner_user_id,source_attempt_fingerprint,trigger_kind,cycle_status,disposition,observation_policy_version,scheduled_slot_at,triggered_at,route_received_at,finalized_at,scan_run_fingerprint,receipt_json,updated_at",
        { count: "exact" },
      )
      .eq("owner_user_id", owner)
      .gte("scheduled_slot_at", control.starts_at_utc)
      .lt("scheduled_slot_at", control.expires_at_utc)
      .order("scheduled_slot_at", { ascending: true })
      .limit(MAX_SERIES_WINDOW_ROWS),
  ]);

  if (
    attemptResult.error ||
    receiptResult.error ||
    attemptResult.count === null ||
    receiptResult.count === null ||
    attemptResult.count !== (attemptResult.data ?? []).length ||
    receiptResult.count !== (receiptResult.data ?? []).length
  ) {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_window_read_incomplete",
    );
  }

  const cycleReadback: ObservationCycleReadback = buildObservationCycleReadback(
    receiptResult.data ?? [],
  );
  return buildObservationSeriesEvidenceReadback({
    ownerUserId: owner,
    control,
    scheduledAttemptRows: attemptResult.data ?? [],
    observationCycleReadback: cycleReadback,
    now: new Date(),
  });
}
