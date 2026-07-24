# Action 464 - Confidence Calibration Recommendation Advisory Projection Operator Input Capture and Preview Activation Approval Gate

## Purpose

Capture and validate the operator inputs required before any later preview deployment or activation approval for the Confidence Calibration Recommendation Advisory Projection runtime preview consumer.

Action 464 is an approval gate only. It does not deploy, activate, configure, persist, replay, call providers, call Supabase, modify runtime code, modify environment values, or apply confidence.

## Scope

This action freezes:

- the exact operator-input schema
- missing-input behavior
- target preview environment policy
- authorized-user/access policy
- preview duration and expiry policy
- flag activation contract
- evidence and telemetry boundaries
- failure thresholds
- owner requirements
- authority confirmations
- deployment-candidate isolation requirements
- readiness and activation decisions

## Authoritative Dependencies

- Action 459 static release gate
- Action 460 observation-only runtime-preview integration contract
- Action 461 disabled runtime preview consumer implementation
- Action 462 independent runtime preview consumer verification
- Action 463 preview deployment readiness gate
- Action 309 post-recovery safety guard
- Actions 318-320 static branch/package guards

## Action 463 Readiness Result

Action 463 returned:

- readiness decision: `ready_with_conditions`
- deployment candidate decision: `candidate_ready_with_conditions`
- deployment status: `not_authorized_not_required_not_performed`
- runtime preview state: `runtime_preview_waiting_for_operator_inputs`
- deployment candidate isolation: unresolved
- operator inputs: unresolved

## Release Classification

The release classification remains:

`confidence_calibration_recommendation_advisory_projection_pure_static_verified`

Action 464 does not modify that classification.

## Current Runtime-Preview State

`runtime_preview_waiting_for_operator_inputs`

Action 464 does not advance this state.

## Explicit Non-Goals

Action 464 must not:

- deploy preview
- deploy production
- enable the preview flag
- modify environment variables
- modify Netlify
- create a branch deploy
- link a site
- request credentials
- create deployment artifacts
- modify runtime code
- modify preview UI
- modify the projection adapter
- modify Recommendation Engine behavior
- add routes
- add persistence
- add replay
- add providers or Supabase
- apply confidence
- create feedback
- change ranking, scanner, publication, execution, Add Trade, risk, or position sizing
- advance runtime preview

## Operator-Input Schema

Bounded static schema:

```json
{
  "target_preview_environment": "string",
  "environment_classification": "non_production_preview",
  "authorized_preview_users": "string[] | null",
  "access_control_mechanism": "string",
  "preview_start_condition": "string",
  "maximum_preview_duration_minutes": "number",
  "preview_flag_value": "true",
  "development_diagnostics_enabled": false,
  "evidence_retention": "none | bounded_manual_summary",
  "telemetry_policy": "none | existing_aggregate_only",
  "acceptable_failure_threshold": {
    "recommendation_render_failures": 0,
    "original_confidence_mutation_events": 0,
    "confidence_application_events": 0,
    "ranking_scanner_publication_execution_effects": 0,
    "add_trade_risk_sizing_effects": 0,
    "production_exposure_events": 0,
    "unauthorized_access_events": 0,
    "raw_data_exposure_events": 0,
    "route_provider_supabase_persistence_replay_feedback_events": 0,
    "kill_switch_failures": 0,
    "preview_unavailable_events_allowed": "number"
  },
  "rollback_owner": "string",
  "kill_switch_owner": "string",
  "deployment_operator": "string",
  "observation_owner": "string",
  "original_confidence_remains_authoritative": true,
  "confidence_application_authorized": false,
  "proposed_confidence_affects_runtime_behavior": false,
  "production_activation_authorized": false,
  "persistent_projection_evidence_authorized": false,
  "deployment_readiness_explicitly_approved": "boolean",
  "deployment_candidate_isolated": "boolean",
  "deployment_candidate_inventory_hash": "string | null"
}
```

The schema must not include credentials, tokens, passwords, environment secrets, private keys, full user records, production data, Recommendation data, advisory payloads, or projection payloads.

## Target Preview Environment

No concrete target preview environment was supplied to Action 464.

The future value must be an exact non-production preview environment identifier.

## Environment Classification

Required exact classification:

`non_production_preview`

Production, production domains, main production deployment, ambiguous labels, localhost presented as deployed preview, production-inherited environments, and unknown access boundaries are unresolved or rejected.

## Preview URL Or Environment Identifier Policy

The preview URL or environment identifier must be:

- exact
- non-production
- bounded to the approved access mechanism
- not the production custom domain
- not inferred from production configuration

No URL was supplied to Action 464.

## Authorized-User Boundary

No authorized preview users were supplied to Action 464.

Future access must use one bounded policy:

- named internal users
- existing authenticated internal team
- protected deployment with platform access control
- bounded private preview URL accessible only to approved operators

## Access-Control Mechanism

No access-control mechanism was supplied to Action 464.

Unrestricted public access, anonymous activation, query-string gating, user self-enrollment, localStorage activation, cookie bypass, and vague "internal" descriptions are not approved.

## Preview Start Condition

No preview start condition was supplied to Action 464.

Future start condition must be exact and must occur only after candidate isolation, validation, access confirmation, rollback confirmation, and explicit approval.

## Preview Duration

No preview duration was supplied to Action 464.

Future duration must be:

- positive
- integer minutes
- explicitly bounded
- no longer than one business day for the first preview
- tied to an expiry procedure

Recommended maximum is `480` minutes, but Action 464 does not silently choose this value.

## Preview Expiry Behavior

At expiry:

- disable or remove the preview flag
- verify preview UI is hidden
- stop observation
- retain only approved bounded evidence
- require a new approval for extension

## Preview Flag Activation Value

Flag:

`CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`

Future activation value may only be exact lowercase `true` in the approved non-production preview environment.

Action 464 does not set it.

## Development-Diagnostics Decision

Recommended first-preview value:

`development_diagnostics_enabled: false`

No concrete operator decision was supplied. Diagnostics that expose raw hashes, raw issues, lineage, full Recommendation data, full advisory data, environment values, or raw JSON dumps are not permitted without a separate gate.

## Evidence-Retention Policy

No evidence-retention policy was supplied.

Permitted values:

- `none`
- `bounded_manual_summary`

## Manual Observation Policy

A bounded manual summary may include:

- preview environment identifier
- preview duration
- authorized access model
- aggregate number of preview renders
- aggregate unavailable count
- Recommendation details remained operational: yes/no
- confidence application events: 0
- behavior-effect events: 0
- unauthorized access events: 0
- raw-data exposure events: 0
- kill switch tested: yes/no
- rollback outcome
- final preview decision

It must not include Recommendation identifiers, tickers tied to projection outputs, confidence values, proposed confidence values, fingerprints, hashes, advisory IDs, projection IDs, warnings/issues, lineage, personal data, or sensitive screenshots.

## Telemetry Policy

Recommended value:

`telemetry_policy: none`

Permitted values:

- `none`
- `existing_aggregate_only`

Any telemetry expansion requires a separate gate.

## Acceptable Failure Threshold

No concrete failure threshold was supplied.

Mandatory zero-tolerance thresholds:

- Recommendation render failures: 0
- original-confidence mutation: 0
- confidence application: 0
- ranking/scanner/publication/execution effects: 0
- Add Trade/risk/sizing effects: 0
- production exposure: 0
- unauthorized access: 0
- raw-data exposure: 0
- route/provider/Supabase/persistence/replay/feedback events: 0
- kill-switch failures: 0

An explicit bounded maximum for preview unavailable events is required.

## Rollback Owner

No rollback owner was supplied.

The future value must be non-empty and exact.

## Kill-Switch Owner

No kill-switch owner was supplied.

The future value must be non-empty and exact.

## Deployment Operator

No deployment operator was supplied.

The future value must be non-empty and exact.

## Observation Owner

No observation owner was supplied.

The future value must be non-empty and exact.

## Escalation Owner If Applicable

No escalation owner was supplied. If the preview plan needs escalation handling, the owner must be exact and non-empty.

## Confidence-Authority Confirmation

Required:

- original Recommendation confidence remains authoritative: `true`
- proposed confidence may affect ranking/scanner/publication/execution: `false`

No concrete confirmation was supplied to Action 464.

## No-Confidence-Application Confirmation

Required:

- confidence application authorized: `false`

No concrete confirmation was supplied to Action 464.

## Production-Prohibition Confirmation

Required:

- production activation authorized: `false`

No concrete confirmation was supplied to Action 464.

## Explicit Deployment-Readiness Approval

No explicit deployment-readiness approval was supplied.

Future deployment approval must be exact and must not imply activation.

## Deployment-Candidate Isolation Status

Current status:

`not_isolated`

The current broader worktree remains dirty and contains unrelated unclassified files. Deployment cannot be approved from this candidate.

## Candidate File Inventory Policy

Future candidate must include only:

- approved preview implementation files
- approved Recommendation details integration
- required existing dependencies
- approved Action artifacts where repository policy requires them
- separately approved unrelated work, if deliberately included

## Unclassified-File Policy

Current unresolved counts from Action 463:

- 317 unclassified changed files
- 39 unclassified post-trade files

They must be excluded by an isolated candidate or independently approved file by file.

## Action 318-320 Guard Policy

Actions 318-320 must pass on the isolated candidate or every reported file must receive separate approval. Action 464 does not broadly allowlist unrelated files.

## Candidate Integrity Policy

Future candidate must have:

- exact file inventory
- deterministic metadata-only inventory hash
- no unexpected untracked files
- no unresolved merge state
- no generated deployment artifacts
- no secrets
- no environment files containing values

## Operator-Input Validation

Every supplied input must be checked for:

- presence
- correct type
- bounded value
- no secrets
- internal consistency
- non-production compliance
- zero-confidence-application compliance
- candidate-isolation compliance

## Missing-Input Behavior

Missing input remains unresolved. Safe defaults may be documented, but they do not count as supplied operator decisions.

## Malformed-Input Behavior

Malformed input remains unresolved or blocked. It must not be repaired silently.

## Conflicting-Input Behavior

Conflicts block or remain unresolved. Examples:

- environment classified preview but production domain supplied
- confidence application false but ranking use authorized
- evidence policy none but persistent telemetry requested
- duration bounded but no expiry or owner exists
- deployment approved but candidate not isolated
- production prohibited but production environment selected

## Safe Defaults

Safe defaults:

- preview hidden
- flag disabled
- diagnostics disabled
- no telemetry expansion
- no persistence
- no replay
- no provider or Supabase access
- no confidence application
- no deployment
- no activation

## Preview Deployment Approval Boundary

Action 464 does not approve deployment. A later action may approve deployment only if readiness reaches `ready`.

## Preview Activation Approval Boundary

Action 464 does not approve activation. A later separate action must approve flag activation after deployment has passed its own gate.

## Kill-Switch Procedure

If preview is later activated and any stop condition occurs:

1. disable or remove the preview flag,
2. verify preview UI is hidden,
3. stop observation,
4. retain only approved bounded evidence,
5. do not repair while preview remains enabled.

## Rollback Procedure

Ordinary rollback is disabling/removing the flag. It must require no data cleanup and no migration. Code rollback is secondary fallback only.

## Observation Procedure

Observation must remain bounded to aggregate status and safety facts. It must not collect raw Recommendation, advisory, projection, lineage, user, provider, Supabase, or secret data.

## Stop-Condition Procedure

Stop immediately if:

- Recommendation rendering fails
- original confidence mutates
- confidence is applied
- ranking, scanner, publication, execution, Add Trade, risk, or sizing is affected
- production exposure occurs
- unauthorized access occurs
- raw data exposure occurs
- route/provider/Supabase/persistence/replay/feedback occurs
- kill switch fails
- unclassified files are discovered in the candidate

## Evidence Cleanup

No persistent projection evidence is approved. If bounded manual summary is chosen, delete any temporary raw notes used to compile it.

## Expiry Procedure

At expiry, disable the flag, verify the preview is hidden, stop observation, preserve only approved bounded evidence, and require a new approval for extension.

## Post-Preview Verification Requirement

A later post-preview verification action must confirm:

- preview was bounded
- preview stopped
- flag disabled
- no confidence application
- no ranking/scanner/publication/execution/Add Trade/risk/sizing effect
- no persistence/replay/provider/Supabase/feedback
- no raw data retained

## Approval Vocabulary

Readiness vocabulary:

- `ready`
- `ready_with_conditions`
- `blocked`

Activation vocabulary:

- `activation_approved_for_future_action`
- `activation_approved_with_conditions`
- `activation_not_approved`

## Approval Decision

Readiness:

`ready_with_conditions`

Activation:

`activation_approved_with_conditions`

This does not deploy or enable the flag.

## Passed Conditions

- Action 463 readiness result is preserved
- release classification is unchanged
- schema is frozen
- missing inputs remain unresolved
- no invented values are used
- production environment is rejected
- uncontrolled public access is rejected
- duration must be bounded
- flag contract is exact
- evidence and telemetry policies are bounded
- zero-tolerance failure thresholds are required
- owner requirements are explicit
- deployment candidate isolation remains required
- no candidate inventory hash is invented
- deployment and activation remain future actions

## Failed Conditions

None for this static gate.

## Unresolved Conditions

- target preview environment unresolved
- authorized preview users/access boundary unresolved
- preview start condition unresolved
- preview duration unresolved
- evidence-retention policy unresolved
- telemetry policy unresolved
- acceptable failure threshold unresolved
- rollback owner unresolved
- kill-switch owner unresolved
- deployment operator unresolved
- observation owner unresolved
- authority confirmations unresolved
- deployment-readiness approval unresolved
- deployment candidate isolation unresolved
- candidate inventory hash absent
- 317 unclassified changed files require isolation or approval
- 39 unclassified post-trade files require isolation or approval

## Next Permitted Action

`action_465_preview_candidate_isolation_and_operator_input_completion`

This next action should only complete missing inputs and isolate the deployment candidate. It must not deploy or activate.

## Deployment Status

`not_authorized_not_required_not_performed`

## Runtime-Preview State

`runtime_preview_waiting_for_operator_inputs`

