// Static, source-controlled preflight for selecting a concrete owner-bound
// command port. It records the admissibility state observed by the authorised
// catalog readback; it never constructs a database client or invokes a port.

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT_VERSION =
  "transactional_recommendation_position_writer_owner_bound_command_port_preflight_v1" as const;

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT_REQUIREMENTS =
  Object.freeze([
    "server_only_security_definer_boundary_with_fixed_search_path",
    "service_role_only_command_execution",
    "locked_owner_scoped_recommendation_with_durable_version",
    "canonical_recommendation_identity_and_normative_digest",
    "position_lineage_copy_with_initial_position_version",
    "append_only_owner_scoped_position_history_insert",
    "one_transaction_for_current_position_history_and_recommendation_state",
    "retry_replays_the_same_owner_bound_durable_effect",
  ] as const);

export type TransactionalRecommendationPositionWriterOwnerBoundCommandPortPreflight = {
  contractVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT_VERSION;
  requirements: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT_REQUIREMENTS;
  existingV1SecurityBoundaryRetained: true;
  existingV1HasFixedSearchPath: true;
  existingV1IsServiceRoleOnly: true;
  positionVersionHistoryRelationPresent: true;
  recommendationDurableLineagePresent: false;
  positionDurableLineagePresent: false;
  existingV1WritesAppendOnlyHistory: false;
  existingV1ProvesPairedEffectAtomicity: false;
  existingV1CommandAdmissible: false;
  concreteCommandPortBindingAdmitted: false;
  databaseOperationPresent: false;
  runtimeWiringPresent: false;
  productionAuthorityGranted: false;
};

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT =
  Object.freeze({
    contractVersion:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT_VERSION,
    requirements:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT_REQUIREMENTS,
    existingV1SecurityBoundaryRetained: true,
    existingV1HasFixedSearchPath: true,
    existingV1IsServiceRoleOnly: true,
    positionVersionHistoryRelationPresent: true,
    recommendationDurableLineagePresent: false,
    positionDurableLineagePresent: false,
    existingV1WritesAppendOnlyHistory: false,
    existingV1ProvesPairedEffectAtomicity: false,
    existingV1CommandAdmissible: false,
    concreteCommandPortBindingAdmitted: false,
    databaseOperationPresent: false,
    runtimeWiringPresent: false,
    productionAuthorityGranted: false,
  } as const satisfies TransactionalRecommendationPositionWriterOwnerBoundCommandPortPreflight);
