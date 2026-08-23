// Records the operator's explicit authority for the next private implementation
// step. This is policy metadata only: it neither creates a client nor invokes a
// command, transaction, database, provider, broker, route, or deployment.
import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_CONTRACT_VERSION,
} from "@/lib/transactional-recommendation-position-writer-admission-bundle-contract";

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION_VERSION =
  "transactional_recommendation_position_writer_implementation_authority_decision_v1" as const;

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_REQUIREMENTS =
  Object.freeze([
    "explicit_operator_authorization_is_recorded",
    "exact_main_admission_bundle_delivery_precedes_implementation",
    "private_server_adapter_is_the_only_writer_surface",
    "owner_bound_transactional_command_remains_the_only_durable_effect_path",
    "idempotent_created_or_replayed_result_is_required",
    "no_client_side_or_broker_execution_surface_is_introduced",
  ] as const);

export type TransactionalRecommendationPositionWriterImplementationAuthorityDecision = {
  decisionVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION_VERSION;
  admissionBundleContractVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_CONTRACT_VERSION;
  requirements: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_REQUIREMENTS;
  explicitOperatorAuthorizationRecorded: true;
  privateServerAdapterImplementationAuthorized: true;
  ownerBoundTransactionalCommandIntegrationAuthorized: true;
  runtimeActivationMayBeDeliveredThroughNormalProtectedReview: true;
  clientSideWriterAuthorized: false;
  brokerOperationAuthorizedByThisDecision: false;
  externalEffectExecutedByThisDecision: false;
};

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION =
  Object.freeze({
    decisionVersion:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION_VERSION,
    admissionBundleContractVersion:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_CONTRACT_VERSION,
    requirements:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_REQUIREMENTS,
    explicitOperatorAuthorizationRecorded: true,
    privateServerAdapterImplementationAuthorized: true,
    ownerBoundTransactionalCommandIntegrationAuthorized: true,
    runtimeActivationMayBeDeliveredThroughNormalProtectedReview: true,
    clientSideWriterAuthorized: false,
    brokerOperationAuthorizedByThisDecision: false,
    externalEffectExecutedByThisDecision: false,
  } as const satisfies TransactionalRecommendationPositionWriterImplementationAuthorityDecision);
