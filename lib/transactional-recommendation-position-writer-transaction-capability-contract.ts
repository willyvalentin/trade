// Static, source-only transaction-capability contract. This module declares
// future admission requirements only; it contains no database adapter, client,
// transaction implementation, persistence operation, route or runtime call.

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_CAPABILITY_CONTRACT_VERSION =
  "transactional_recommendation_position_writer_transaction_capability_contract_v1" as const;

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_PHASES =
  Object.freeze([
    "authenticated_server_owner_context",
    "single_private_transaction_capability",
    "durable_recommendation_lock",
    "durable_idempotency_binding_check",
    "owner_bound_position_and_history_mutation",
    "commit_before_result_observation",
    "closed_rollback_on_failure",
  ] as const);

export type TransactionalRecommendationPositionWriterTransactionCapabilityContract = {
  contractVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_CAPABILITY_CONTRACT_VERSION;
  phases: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_PHASES;
  adapterSelected: false;
  adapterInvocationPresent: false;
  authenticatedServerOwnerContextAdmitted: false;
  transactionCapabilityAdmitted: false;
  transactionBeginAdmitted: false;
  durableRecommendationLockAdmitted: false;
  durableIdempotencyReadAdmitted: false;
  ownerBoundPositionMutationAdmitted: false;
  ownerBoundHistoryAppendAdmitted: false;
  transactionCommitAdmitted: false;
  rollbackResultMayBeObserved: false;
  individualEffectOperationPresent: false;
  databaseOperationPresent: false;
  runtimeWiringPresent: false;
  productionAuthorityGranted: false;
};

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_CAPABILITY_CONTRACT =
  Object.freeze({
    contractVersion:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_CAPABILITY_CONTRACT_VERSION,
    phases: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_PHASES,
    adapterSelected: false,
    adapterInvocationPresent: false,
    authenticatedServerOwnerContextAdmitted: false,
    transactionCapabilityAdmitted: false,
    transactionBeginAdmitted: false,
    durableRecommendationLockAdmitted: false,
    durableIdempotencyReadAdmitted: false,
    ownerBoundPositionMutationAdmitted: false,
    ownerBoundHistoryAppendAdmitted: false,
    transactionCommitAdmitted: false,
    rollbackResultMayBeObserved: false,
    individualEffectOperationPresent: false,
    databaseOperationPresent: false,
    runtimeWiringPresent: false,
    productionAuthorityGranted: false,
  } as const satisfies TransactionalRecommendationPositionWriterTransactionCapabilityContract);
