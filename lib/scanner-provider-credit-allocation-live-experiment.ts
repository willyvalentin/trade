import {
  CURRENT_DECISION_STRATEGY_ID,
  CURRENT_DECISION_STRATEGY_VERSION,
  CURRENT_SYMBOL_SELECTION_POLICY_ID,
  CURRENT_SYMBOL_SELECTION_POLICY_VERSION,
} from "@/lib/decision-strategy-registry";
import {
  SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
  SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
} from "@/lib/scanner-provider-credit-allocation-shadow";
import {
  BASIC_FREE_SCHEDULED_SCAN_PER_MINUTE_CREDIT_CAP,
  BASIC_FREE_SCHEDULED_SCAN_SCANNER_CREDITS,
} from "@/lib/scheduled-scan-ticker-cap";

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_VERSION =
  "scanner_provider_credit_allocation_live_experiment_v1" as const;
export const SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT_VERSION =
  "scanner_provider_credit_allocation_live_experiment_contract_v1" as const;

export type ScannerProviderCreditAllocationExperimentArm =
  | "baseline"
  | "challenger";

const slots = Object.freeze([
  Object.freeze({
    slot_utc: "2026-10-01T14:30:00.000Z",
    arm: "baseline" as const,
    pair: 1,
  }),
  Object.freeze({
    slot_utc: "2026-10-01T14:45:00.000Z",
    arm: "challenger" as const,
    pair: 1,
  }),
  Object.freeze({
    slot_utc: "2026-10-01T15:30:00.000Z",
    arm: "challenger" as const,
    pair: 2,
  }),
  Object.freeze({
    slot_utc: "2026-10-01T15:45:00.000Z",
    arm: "baseline" as const,
    pair: 2,
  }),
  Object.freeze({
    slot_utc: "2026-10-01T17:00:00.000Z",
    arm: "baseline" as const,
    pair: 3,
  }),
  Object.freeze({
    slot_utc: "2026-10-01T17:15:00.000Z",
    arm: "challenger" as const,
    pair: 3,
  }),
]);

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT =
  Object.freeze({
    contract_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT_VERSION,
    experiment_id: "provider_credit_allocation_switchback_2026_10_01_v2",
    evidence_mode: "prospective_live_data_fitness_switchback" as const,
    trading_date: "2026-10-01",
    expires_at_utc: "2026-10-01T17:30:00.000Z",
    slot_duration_minutes: 15,
    slots,
    baseline_policy_version: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    challenger_policy_version:
      SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    rollback_policy_version: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    scanner_provider_credit_cap: BASIC_FREE_SCHEDULED_SCAN_SCANNER_CREDITS,
    total_provider_credit_cap_per_attempt:
      BASIC_FREE_SCHEDULED_SCAN_PER_MINUTE_CREDIT_CAP,
    max_attempts: slots.length,
    max_total_provider_credits:
      slots.length * BASIC_FREE_SCHEDULED_SCAN_PER_MINUTE_CREDIT_CAP,
    population: Object.freeze({
      decision_strategy_id: CURRENT_DECISION_STRATEGY_ID,
      decision_strategy_version: CURRENT_DECISION_STRATEGY_VERSION,
      symbol_selection_policy_id: CURRENT_SYMBOL_SELECTION_POLICY_ID,
      symbol_selection_policy_version:
        CURRENT_SYMBOL_SELECTION_POLICY_VERSION,
      selection_mode: "scheduled_rotating" as const,
      expected_candidates_per_attempt: 8,
      exact_population_fingerprint_required: true,
      non_terminal_attempts_retained_in_denominator: true,
    }),
    decision_metrics: Object.freeze({
      primary: Object.freeze([
        "rankable_candidate_fraction",
        "candidates_receiving_provider_credit",
        "late_candidates_without_provider_credit",
      ]),
      guardrails: Object.freeze([
        "reserved_provider_credits",
        "provider_rate_limit_or_timeout",
        "terminal_receipt_available",
        "stale_or_incomplete_publication_count",
      ]),
      secondary: Object.freeze([
        "fully_rankable_candidate_fraction",
        "canonical_outcome_coverage",
      ]),
      recommendation_quality_claim: "not_authorized_by_this_experiment" as const,
    }),
    stop_conditions: Object.freeze({
      consecutive_operational_failures: 2,
      any_credit_cap_breach: true,
      any_lineage_or_population_fingerprint_failure: true,
      any_stale_or_incomplete_publication: true,
      revision_or_contract_drift: true,
    }),
  });

export type ScannerProviderCreditAllocationLiveExperimentAdmission = Readonly<{
  experiment_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_VERSION;
  status: "disabled" | "blocked" | "admitted";
  reason_codes: readonly string[];
  contract: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT;
  slot: (typeof slots)[number] | null;
  selected_policy_version:
    | typeof SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION
    | typeof SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION;
  expected_revision: string | null;
  authority: Readonly<{
    can_select_allocation_policy: boolean;
    can_call_provider: false;
    can_change_ranking_or_publication: false;
    can_lower_threshold: false;
    can_publish_candidate: false;
    can_execute_broker_action: false;
  }>;
}>;

function normalizedRevision(value: unknown) {
  if (typeof value !== "string") return null;
  const revision = value.trim().toLowerCase();
  return /^[0-9a-f]{40}$/.test(revision) ? revision : null;
}

function admissionResult({
  status,
  reasonCodes,
  slot,
  expectedRevision,
}: {
  status: ScannerProviderCreditAllocationLiveExperimentAdmission["status"];
  reasonCodes: string[];
  slot: (typeof slots)[number] | null;
  expectedRevision: string | null;
}): ScannerProviderCreditAllocationLiveExperimentAdmission {
  const selectedPolicyVersion =
    status === "admitted" && slot?.arm === "challenger"
      ? SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION
      : SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION;

  return Object.freeze({
    experiment_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_VERSION,
    status,
    reason_codes: Object.freeze(reasonCodes),
    contract: SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT,
    slot,
    selected_policy_version: selectedPolicyVersion,
    expected_revision: expectedRevision,
    authority: Object.freeze({
      can_select_allocation_policy: status === "admitted",
      can_call_provider: false as const,
      can_change_ranking_or_publication: false as const,
      can_lower_threshold: false as const,
      can_publish_candidate: false as const,
      can_execute_broker_action: false as const,
    }),
  });
}

export function resolveScannerProviderCreditAllocationLiveExperiment(input: {
  enabled: boolean;
  experimentId: string | null | undefined;
  scheduledSlotUtc: string | null | undefined;
  now: Date;
  expectedRevision: string | null | undefined;
  deployedRevision: string | null | undefined;
}): ScannerProviderCreditAllocationLiveExperimentAdmission {
  const contract = SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT;
  const expectedRevision = normalizedRevision(input.expectedRevision);
  if (!input.enabled) {
    return admissionResult({
      slot: null,
      expectedRevision,
      status: "disabled",
      reasonCodes: ["live_allocation_experiment_disabled"],
    });
  }

  const reasonCodes: string[] = [];
  if (input.experimentId !== contract.experiment_id) {
    reasonCodes.push("live_allocation_experiment_id_mismatch");
  }
  const slot = contract.slots.find(
    (candidate) => candidate.slot_utc === input.scheduledSlotUtc,
  ) ?? null;
  if (!slot) reasonCodes.push("live_allocation_experiment_slot_not_declared");

  const nowMs = input.now.getTime();
  const slotMs = slot ? new Date(slot.slot_utc).getTime() : Number.NaN;
  const slotExpiresMs = slotMs + contract.slot_duration_minutes * 60 * 1000;
  if (
    !Number.isFinite(nowMs) ||
    !Number.isFinite(slotMs) ||
    nowMs < slotMs ||
    nowMs >= slotExpiresMs
  ) {
    reasonCodes.push("live_allocation_experiment_outside_slot_window");
  }
  if (Number.isFinite(nowMs) && nowMs >= new Date(contract.expires_at_utc).getTime()) {
    reasonCodes.push("live_allocation_experiment_expired");
  }

  const deployedRevision = normalizedRevision(input.deployedRevision);
  if (!expectedRevision || !deployedRevision) {
    reasonCodes.push("live_allocation_experiment_revision_missing");
  } else if (expectedRevision !== deployedRevision) {
    reasonCodes.push("live_allocation_experiment_revision_mismatch");
  }

  if (reasonCodes.length > 0) {
    return admissionResult({
      status: "blocked",
      reasonCodes,
      slot,
      expectedRevision,
    });
  }

  return admissionResult({
    status: "admitted",
    reasonCodes: ["live_allocation_experiment_exact_slot_admitted"],
    slot,
    expectedRevision,
  });
}
