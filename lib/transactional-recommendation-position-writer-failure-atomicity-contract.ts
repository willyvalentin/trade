// Static, source-only metadata for a future writer failure boundary. It
// declares closed admission conditions only; no storage, transaction, route,
// worker or runtime operation is implemented or invoked here.

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_CONTRACT_VERSION =
  "transactional_recommendation_position_writer_failure_atomicity_contract_v1" as const;

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_REQUIREMENTS =
  Object.freeze([
    "rejected_or_aborted_command_has_no_position_effect",
    "rejected_or_aborted_command_has_no_history_effect",
    "failed_reservation_never_claims_created_or_replayed_result",
    "transaction_failure_is_contained_before_result_visibility",
    "retry_cannot_materialize_a_prior_partial_effect",
    "failure_projection_preserves_owner_boundary",
  ] as const);

export type TransactionalRecommendationPositionWriterFailureAtomicityContract = {
  contractVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_CONTRACT_VERSION;
  requirements: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_REQUIREMENTS;
  rejectedCommandChecked: false;
  abortedCommandChecked: false;
  noPositionEffectVerified: false;
  noHistoryEffectVerified: false;
  failedReservationContained: false;
  retryPartialEffectRejected: false;
  ownerBoundFailureProjectionAdmitted: false;
  databaseOperationPresent: false;
  runtimeWiringPresent: false;
  productionAuthorityGranted: false;
};

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_CONTRACT =
  Object.freeze({
    contractVersion:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_CONTRACT_VERSION,
    requirements:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_REQUIREMENTS,
    rejectedCommandChecked: false,
    abortedCommandChecked: false,
    noPositionEffectVerified: false,
    noHistoryEffectVerified: false,
    failedReservationContained: false,
    retryPartialEffectRejected: false,
    ownerBoundFailureProjectionAdmitted: false,
    databaseOperationPresent: false,
    runtimeWiringPresent: false,
    productionAuthorityGranted: false,
  } as const satisfies TransactionalRecommendationPositionWriterFailureAtomicityContract);
