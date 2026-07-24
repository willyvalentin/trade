export const BROKER_RESULT_SOURCE_CLASSIFICATIONS = [
  "preview_only",
  "dev_fixture",
  "mock_broker",
  "dry_run",
  "local_diagnostics",
  "broker_confirmed",
  "production_safe_candidate",
] as const;

export type BrokerResultSourceClassification =
  (typeof BROKER_RESULT_SOURCE_CLASSIFICATIONS)[number];

export type BrokerResultSourceCapabilityFlags = {
  allowsCandidatePreview: boolean;
  allowsExecutionRecordCreation: boolean;
  allowsPersistence: boolean;
  allowsTradeMutation: boolean;
};

export type BrokerResultSourceClassificationRule = {
  classification: BrokerResultSourceClassification;
  description: string;
  capabilityFlags: BrokerResultSourceCapabilityFlags;
  persistenceBlockedReason: string | null;
  tradeMutationBlockedReason: string;
  productionSafe: boolean;
};

export type BrokerResultSourceClassificationMetadata = {
  classification: BrokerResultSourceClassification;
  sourceName?: string | null;
  sourceEnvironment?: "local_dev" | "staging" | "production" | null;
  provenanceLabel?: string | null;
  evidenceFingerprint?: string | null;
  captureId?: string | null;
  requestId?: string | null;
  brokerOrderId?: string | null;
  brokerConfirmationId?: string | null;
  metadata?: Record<string, unknown>;
};

// Policy metadata only. These constants do not enforce validation,
// persistence, capture, conversion, or trade mutation behavior.
export const BROKER_RESULT_SOURCE_CLASSIFICATION_RULES = {
  preview_only: {
    classification: "preview_only",
    description:
      "BrokerExecutionResult-shaped display or mapping output that is explicitly preview-only.",
    capabilityFlags: {
      allowsCandidatePreview: true,
      allowsExecutionRecordCreation: false,
      allowsPersistence: false,
      allowsTradeMutation: false,
    },
    persistenceBlockedReason:
      "Preview-only broker result sources are not confirmed broker executions.",
    tradeMutationBlockedReason:
      "Preview-only broker result sources must never mutate trade state.",
    productionSafe: false,
  },
  dev_fixture: {
    classification: "dev_fixture",
    description:
      "Controlled fixture data used for UI QA and dev-only preview flows.",
    capabilityFlags: {
      allowsCandidatePreview: true,
      allowsExecutionRecordCreation: false,
      allowsPersistence: false,
      allowsTradeMutation: false,
    },
    persistenceBlockedReason:
      "Dev fixtures can preview candidate shape only and must keep safeToPersist=false.",
    tradeMutationBlockedReason:
      "Dev fixtures must never mutate live, history, or broker-derived trade state.",
    productionSafe: false,
  },
  mock_broker: {
    classification: "mock_broker",
    description:
      "Data from dev mock broker pages, mock confirmations, or converted dev mock broker results.",
    capabilityFlags: {
      allowsCandidatePreview: true,
      allowsExecutionRecordCreation: false,
      allowsPersistence: false,
      allowsTradeMutation: false,
    },
    persistenceBlockedReason:
      "Mock broker data is test/dev diagnostics and is not production broker evidence.",
    tradeMutationBlockedReason:
      "Mock broker data must never mutate production trade state.",
    productionSafe: false,
  },
  dry_run: {
    classification: "dry_run",
    description:
      "Dry-run insert route, dry-run client helper, or dry-run UI preview output.",
    capabilityFlags: {
      allowsCandidatePreview: false,
      allowsExecutionRecordCreation: false,
      allowsPersistence: false,
      allowsTradeMutation: false,
    },
    persistenceBlockedReason:
      "Dry-run results validate route/client/UI behavior only and are not broker results.",
    tradeMutationBlockedReason:
      "Dry-run results are no-write/no-mutation by definition.",
    productionSafe: false,
  },
  local_diagnostics: {
    classification: "local_diagnostics",
    description:
      "Local bridge responses, agent diagnostics, execution audit diagnostics, and Settings-only records.",
    capabilityFlags: {
      allowsCandidatePreview: false,
      allowsExecutionRecordCreation: false,
      allowsPersistence: false,
      allowsTradeMutation: false,
    },
    persistenceBlockedReason:
      "Local diagnostics are troubleshooting data, not broker-confirmed execution evidence.",
    tradeMutationBlockedReason:
      "Local diagnostics must never mutate trade state.",
    productionSafe: false,
  },
  broker_confirmed: {
    classification: "broker_confirmed",
    description:
      "Future broker-originating sanitized evidence that passed confirmation evidence requirements.",
    capabilityFlags: {
      allowsCandidatePreview: true,
      allowsExecutionRecordCreation: true,
      allowsPersistence: false,
      allowsTradeMutation: false,
    },
    persistenceBlockedReason:
      "Broker-confirmed evidence still requires creation validation, persistence validation, schema readiness, duplicate lookup, and server-only write approval.",
    tradeMutationBlockedReason:
      "Broker confirmation does not automatically mutate trade state.",
    productionSafe: false,
  },
  production_safe_candidate: {
    classification: "production_safe_candidate",
    description:
      "Future confirmed broker-originating candidate that passed all creation, persistence, schema, security, and idempotency gates.",
    capabilityFlags: {
      allowsCandidatePreview: true,
      allowsExecutionRecordCreation: true,
      allowsPersistence: true,
      allowsTradeMutation: false,
    },
    persistenceBlockedReason: null,
    tradeMutationBlockedReason:
      "Trade mutation remains a separate boundary even for production-safe persistence candidates.",
    productionSafe: true,
  },
} as const satisfies Record<
  BrokerResultSourceClassification,
  BrokerResultSourceClassificationRule
>;

export type BrokerResultSourceClassificationRules =
  typeof BROKER_RESULT_SOURCE_CLASSIFICATION_RULES;
