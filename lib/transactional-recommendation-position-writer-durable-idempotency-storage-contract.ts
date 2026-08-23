// Static, source-only durable-idempotency metadata. It lists future admission
// requirements but provides no storage adapter, read/write operation,
// transaction implementation, route, worker or runtime invocation.

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_STORAGE_CONTRACT_VERSION =
  "transactional_recommendation_position_writer_durable_idempotency_storage_contract_v1" as const;

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_REQUIREMENTS =
  Object.freeze([
    "immutable_durable_idempotency_record",
    "complete_six_member_command_binding",
    "owner_bound_recommendation_scope",
    "same_transaction_replay_or_conflict_decision",
    "commit_before_created_or_replayed_result",
  ] as const);

export type TransactionalRecommendationPositionWriterDurableIdempotencyStorageContract = {
  contractVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_STORAGE_CONTRACT_VERSION;
  requirements: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_REQUIREMENTS;
  storageAdapterSelected: false;
  durableStorageReadPresent: false;
  durableStorageWritePresent: false;
  immutableRecordAdmitted: false;
  completeCommandBindingAdmitted: false;
  ownerBoundRecommendationScopeAdmitted: false;
  replayDecisionAdmitted: false;
  conflictDecisionAdmitted: false;
  sameTransactionReservationAdmitted: false;
  resultObservationAdmitted: false;
  databaseOperationPresent: false;
  runtimeWiringPresent: false;
  productionAuthorityGranted: false;
};

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_STORAGE_CONTRACT =
  Object.freeze({
    contractVersion:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_STORAGE_CONTRACT_VERSION,
    requirements:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_REQUIREMENTS,
    storageAdapterSelected: false,
    durableStorageReadPresent: false,
    durableStorageWritePresent: false,
    immutableRecordAdmitted: false,
    completeCommandBindingAdmitted: false,
    ownerBoundRecommendationScopeAdmitted: false,
    replayDecisionAdmitted: false,
    conflictDecisionAdmitted: false,
    sameTransactionReservationAdmitted: false,
    resultObservationAdmitted: false,
    databaseOperationPresent: false,
    runtimeWiringPresent: false,
    productionAuthorityGranted: false,
  } as const satisfies TransactionalRecommendationPositionWriterDurableIdempotencyStorageContract);
