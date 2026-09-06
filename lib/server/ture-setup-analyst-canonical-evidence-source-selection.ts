import "server-only";

export const TURE_SETUP_ANALYST_CANONICAL_EVIDENCE_SOURCE_SELECTION_VERSION =
  "ture_setup_analyst_canonical_evidence_source_selection_v1" as const;

export type TureSetupAnalystCanonicalEvidenceSourceSelectionAuthority = Readonly<{
  mode: "server_only_canonical_evidence_source_selection";
  may_read_repository: false;
  may_access_staging: false;
  may_access_production: false;
  may_perform_io: false;
  may_persist_source_evidence: false;
  may_form_offline_dataset: false;
  may_run_offline_evaluation: false;
  may_invoke_model: false;
  may_bind_runtime: false;
  may_change_canonical_recommendation: false;
  may_change_ranking: false;
  may_change_execution_eligibility: false;
  may_change_position_state: false;
  may_change_risk_settings: false;
  may_place_or_cancel_orders: false;
  may_submit_broker_instructions: false;
}>;

export const TURE_SETUP_ANALYST_CANONICAL_EVIDENCE_SOURCE_SELECTION_AUTHORITY: TureSetupAnalystCanonicalEvidenceSourceSelectionAuthority =
  Object.freeze({
    mode: "server_only_canonical_evidence_source_selection",
    may_read_repository: false,
    may_access_staging: false,
    may_access_production: false,
    may_perform_io: false,
    may_persist_source_evidence: false,
    may_form_offline_dataset: false,
    may_run_offline_evaluation: false,
    may_invoke_model: false,
    may_bind_runtime: false,
    may_change_canonical_recommendation: false,
    may_change_ranking: false,
    may_change_execution_eligibility: false,
    may_change_position_state: false,
    may_change_risk_settings: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type SelectTureSetupAnalystCanonicalEvidenceSourceInput = Readonly<{
  proposal: Readonly<{
    environment: "staging";
    relation: "public.canonical_evaluation_decisions";
    sample_type: "historical_synthetic";
    source_kind: "append_only_canonical_decision";
    canonical_identity: "required";
    immutable_lineage: "required";
    versioned_reproducibility: "required";
    complete_primary_outcome: "required";
    persistence_envelope: "required";
    writer_binding: "not_admitted";
    runtime_binding: "not_admitted";
    evaluation_binding: "not_admitted";
  }>;
}>;

export type TureSetupAnalystCanonicalEvidenceSourceSelection = Readonly<{
  selection_version: typeof TURE_SETUP_ANALYST_CANONICAL_EVIDENCE_SOURCE_SELECTION_VERSION;
  mode: "server_only_canonical_evidence_source_selection";
  selection_status: "source_contract_selected";
  selected_source: Readonly<{
    environment: "staging";
    relation: "public.canonical_evaluation_decisions";
    sample_type: "historical_synthetic";
    source_kind: "append_only_canonical_decision";
  }>;
  required_evidence: readonly [
    "canonical_identity",
    "immutable_lineage",
    "versioned_reproducibility",
    "complete_primary_outcome",
    "persistence_envelope",
  ];
  canonical_evidence_disposition: "not_admitted";
  next_gate: "separately_authorized_staging_append_only_receipt_proof";
  authority: TureSetupAnalystCanonicalEvidenceSourceSelectionAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["proposal"] as const;
const proposalKeys = [
  "canonical_identity",
  "complete_primary_outcome",
  "environment",
  "evaluation_binding",
  "immutable_lineage",
  "persistence_envelope",
  "relation",
  "runtime_binding",
  "sample_type",
  "source_kind",
  "versioned_reproducibility",
  "writer_binding",
] as const;

function hasExactOwnDataKeys(
  value: unknown,
  keys: readonly string[],
): value is PlainRecord {
  try {
    if (!value || typeof value !== "object" || !Object.isFrozen(value)) {
      return false;
    }
    if (Object.getPrototypeOf(value) !== Object.prototype) return false;
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key !== "string")) return false;
    if (ownKeys.length !== keys.length) return false;
    if (![...ownKeys].every((key) => keys.includes(key as never))) return false;
    return ownKeys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return Boolean(
        descriptor &&
          descriptor.enumerable &&
          Object.prototype.hasOwnProperty.call(descriptor, "value"),
      );
    });
  } catch {
    return false;
  }
}

function ownData(value: PlainRecord, key: string): unknown {
  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

function hasRequiredProposalShape(value: unknown): boolean {
  if (!hasExactOwnDataKeys(value, proposalKeys)) return false;

  return (
    ownData(value, "environment") === "staging" &&
    ownData(value, "relation") === "public.canonical_evaluation_decisions" &&
    ownData(value, "sample_type") === "historical_synthetic" &&
    ownData(value, "source_kind") === "append_only_canonical_decision" &&
    ownData(value, "canonical_identity") === "required" &&
    ownData(value, "immutable_lineage") === "required" &&
    ownData(value, "versioned_reproducibility") === "required" &&
    ownData(value, "complete_primary_outcome") === "required" &&
    ownData(value, "persistence_envelope") === "required" &&
    ownData(value, "writer_binding") === "not_admitted" &&
    ownData(value, "runtime_binding") === "not_admitted" &&
    ownData(value, "evaluation_binding") === "not_admitted"
  );
}

export function selectTureSetupAnalystCanonicalEvidenceSource(
  input: SelectTureSetupAnalystCanonicalEvidenceSourceInput,
): TureSetupAnalystCanonicalEvidenceSourceSelection {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst canonical evidence source selection input.");
  }

  if (!hasRequiredProposalShape(ownData(input, "proposal"))) {
    throw new TypeError("Invalid Ture Setup Analyst canonical evidence source selection input.");
  }

  return Object.freeze({
    selection_version: TURE_SETUP_ANALYST_CANONICAL_EVIDENCE_SOURCE_SELECTION_VERSION,
    mode: "server_only_canonical_evidence_source_selection",
    selection_status: "source_contract_selected",
    selected_source: Object.freeze({
      environment: "staging",
      relation: "public.canonical_evaluation_decisions",
      sample_type: "historical_synthetic",
      source_kind: "append_only_canonical_decision",
    }),
    required_evidence: Object.freeze([
      "canonical_identity",
      "immutable_lineage",
      "versioned_reproducibility",
      "complete_primary_outcome",
      "persistence_envelope",
    ]) as TureSetupAnalystCanonicalEvidenceSourceSelection["required_evidence"],
    canonical_evidence_disposition: "not_admitted",
    next_gate: "separately_authorized_staging_append_only_receipt_proof",
    authority: TURE_SETUP_ANALYST_CANONICAL_EVIDENCE_SOURCE_SELECTION_AUTHORITY,
  });
}
