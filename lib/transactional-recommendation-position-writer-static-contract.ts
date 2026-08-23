// Static contract metadata only. This module declares the future private
// transactional recommendation-to-position writer boundary. It does not
// implement a transaction, persistence, authentication, routing, queue work,
// provider activity, broker activity, or any runtime invocation.

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_STATIC_CONTRACT_VERSION =
  "transactional_recommendation_position_writer_static_contract_v1" as const;

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_COMMAND_CONTRACT_VERSION =
  "action_655a2_recommendation_position_command_v2" as const;

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IDEMPOTENCY_BINDING =
  Object.freeze([
    "durable_recommendation_uuid",
    "durable_recommendation_version",
    "recommendation_identity",
    "recommendation_normative_digest",
    "position_identity",
    "canonical_command_digest",
  ] as const);

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_RESULT_DISPOSITIONS =
  Object.freeze([
    "created",
    "replayed",
    "conflict",
    "recommendation_binding_conflict",
    "stale_recommendation_version",
    "refused",
    "rolled_back",
  ] as const);

export type TransactionalRecommendationPositionWriterStaticContract = {
  contractVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_STATIC_CONTRACT_VERSION;
  commandContractVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_COMMAND_CONTRACT_VERSION;
  authenticatedServerOwnerRequired: true;
  clientOwnerProjectionAuthoritative: false;
  requiresOnePrivateTransactionCapability: true;
  requiresExactLockedRecommendation: true;
  requiresCompleteIdempotencyBindingBeforePositionWrite: true;
  positionInitialHistoryVersion: 1;
  resultAvailableBeforeCommit: false;
  partialWritePermitted: false;
  implementationPresent: false;
  runtimeWiringPresent: false;
  routePresent: false;
  databaseOperationPresent: false;
  providerOperationPresent: false;
  brokerOperationPresent: false;
  deploymentAuthorityGranted: false;
  idempotencyBinding: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IDEMPOTENCY_BINDING;
  resultDispositions: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_RESULT_DISPOSITIONS;
};

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_STATIC_CONTRACT =
  Object.freeze({
    contractVersion:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_STATIC_CONTRACT_VERSION,
    commandContractVersion:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_COMMAND_CONTRACT_VERSION,
    authenticatedServerOwnerRequired: true,
    clientOwnerProjectionAuthoritative: false,
    requiresOnePrivateTransactionCapability: true,
    requiresExactLockedRecommendation: true,
    requiresCompleteIdempotencyBindingBeforePositionWrite: true,
    positionInitialHistoryVersion: 1,
    resultAvailableBeforeCommit: false,
    partialWritePermitted: false,
    implementationPresent: false,
    runtimeWiringPresent: false,
    routePresent: false,
    databaseOperationPresent: false,
    providerOperationPresent: false,
    brokerOperationPresent: false,
    deploymentAuthorityGranted: false,
    idempotencyBinding:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IDEMPOTENCY_BINDING,
    resultDispositions:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_RESULT_DISPOSITIONS,
  } as const satisfies TransactionalRecommendationPositionWriterStaticContract);
