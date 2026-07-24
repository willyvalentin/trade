import {
  BROKER_RESULT_SOURCE_CLASSIFICATION_RULES,
  BROKER_RESULT_SOURCE_CLASSIFICATIONS,
  type BrokerResultSourceCapabilityFlags,
  type BrokerResultSourceClassification,
  type BrokerResultSourceClassificationMetadata,
  type BrokerResultSourceClassificationRule,
} from "@/lib/broker-result-source-classification";

export const BROKER_RESULT_SOURCE_USAGES = [
  "candidate_preview",
  "execution_record_creation",
  "persistence",
  "trade_mutation",
] as const;

export type BrokerResultSourceUsage =
  (typeof BROKER_RESULT_SOURCE_USAGES)[number];

export const BROKER_RESULT_SOURCE_CLASSIFICATION_REJECTION_REASONS = [
  "unsupported_source_classification",
  "policy_metadata_missing",
  "source_not_candidate_preview_capable",
  "source_not_creation_capable",
  "source_not_persistence_capable",
  "source_not_trade_mutation_capable",
] as const;

export type BrokerResultSourceClassificationRejectionReason =
  (typeof BROKER_RESULT_SOURCE_CLASSIFICATION_REJECTION_REASONS)[number];

export const BROKER_RESULT_SOURCE_CLASSIFICATION_WARNINGS = [
  "policy_metadata_only_not_runtime_enforcement",
  "allowed_does_not_enable_persistence",
  "allowed_does_not_enable_trade_mutation",
  "broker_confirmed_requires_additional_persistence_gates",
  "production_safe_candidate_requires_server_write_boundary",
  "source_metadata_missing",
] as const;

export type BrokerResultSourceClassificationWarning =
  (typeof BROKER_RESULT_SOURCE_CLASSIFICATION_WARNINGS)[number];

export type ValidateBrokerResultSourceForUsageInput = {
  classification: BrokerResultSourceClassification | string | null | undefined;
  intendedUsage: BrokerResultSourceUsage;
  metadata?: BrokerResultSourceClassificationMetadata | null;
};

export type BrokerResultSourceClassificationValidationResult = {
  allowed: boolean;
  classification: BrokerResultSourceClassification | null;
  intendedUsage: BrokerResultSourceUsage;
  rejectionReasons: BrokerResultSourceClassificationRejectionReason[];
  warnings: BrokerResultSourceClassificationWarning[];
  policyRule: BrokerResultSourceClassificationRule | null;
  capabilityFlags: BrokerResultSourceCapabilityFlags | null;
  metadata: BrokerResultSourceClassificationMetadata | null;
};

function isBrokerResultSourceClassification(
  value: string | null | undefined,
): value is BrokerResultSourceClassification {
  return BROKER_RESULT_SOURCE_CLASSIFICATIONS.includes(
    value as BrokerResultSourceClassification,
  );
}

function uniqueValues<T extends string>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

function capabilityForUsage(
  flags: BrokerResultSourceCapabilityFlags,
  usage: BrokerResultSourceUsage,
): boolean {
  switch (usage) {
    case "candidate_preview":
      return flags.allowsCandidatePreview;
    case "execution_record_creation":
      return flags.allowsExecutionRecordCreation;
    case "persistence":
      return flags.allowsPersistence;
    case "trade_mutation":
      return flags.allowsTradeMutation;
  }
}

function rejectionForUsage(
  usage: BrokerResultSourceUsage,
): BrokerResultSourceClassificationRejectionReason {
  switch (usage) {
    case "candidate_preview":
      return "source_not_candidate_preview_capable";
    case "execution_record_creation":
      return "source_not_creation_capable";
    case "persistence":
      return "source_not_persistence_capable";
    case "trade_mutation":
      return "source_not_trade_mutation_capable";
  }
}

function warningsForKnownClassification(input: {
  allowed: boolean;
  classification: BrokerResultSourceClassification;
  intendedUsage: BrokerResultSourceUsage;
  metadata: BrokerResultSourceClassificationMetadata | null;
}): BrokerResultSourceClassificationWarning[] {
  const warnings: BrokerResultSourceClassificationWarning[] = [
    "policy_metadata_only_not_runtime_enforcement",
  ];

  if (!input.metadata) {
    warnings.push("source_metadata_missing");
  }

  if (input.classification === "broker_confirmed") {
    warnings.push("broker_confirmed_requires_additional_persistence_gates");
  }

  if (
    input.classification === "production_safe_candidate" &&
    input.intendedUsage === "persistence"
  ) {
    warnings.push("production_safe_candidate_requires_server_write_boundary");
  }

  if (input.allowed && input.intendedUsage === "persistence") {
    warnings.push("allowed_does_not_enable_persistence");
  }

  if (input.allowed && input.intendedUsage === "trade_mutation") {
    warnings.push("allowed_does_not_enable_trade_mutation");
  }

  return uniqueValues(warnings);
}

export function validateBrokerResultSourceForUsage(
  input: ValidateBrokerResultSourceForUsageInput,
): BrokerResultSourceClassificationValidationResult {
  const metadata = input.metadata ?? null;
  const rawClassification = input.classification ?? null;

  if (!isBrokerResultSourceClassification(rawClassification)) {
    return {
      allowed: false,
      classification: null,
      intendedUsage: input.intendedUsage,
      rejectionReasons: ["unsupported_source_classification"],
      warnings: ["policy_metadata_only_not_runtime_enforcement"],
      policyRule: null,
      capabilityFlags: null,
      metadata,
    };
  }

  const classification = rawClassification;
  const policyRule = BROKER_RESULT_SOURCE_CLASSIFICATION_RULES[classification];

  if (!policyRule) {
    return {
      allowed: false,
      classification,
      intendedUsage: input.intendedUsage,
      rejectionReasons: ["policy_metadata_missing"],
      warnings: ["policy_metadata_only_not_runtime_enforcement"],
      policyRule: null,
      capabilityFlags: null,
      metadata,
    };
  }

  const allowed = capabilityForUsage(
    policyRule.capabilityFlags,
    input.intendedUsage,
  );

  return {
    allowed,
    classification,
    intendedUsage: input.intendedUsage,
    rejectionReasons: allowed ? [] : [rejectionForUsage(input.intendedUsage)],
    warnings: warningsForKnownClassification({
      allowed,
      classification,
      intendedUsage: input.intendedUsage,
      metadata,
    }),
    policyRule,
    capabilityFlags: policyRule.capabilityFlags,
    metadata,
  };
}
