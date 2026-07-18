import { createHash } from "node:crypto";

export const PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_raw_process_completion_evidence_contract",
  contractId: "ture.execution.pure-raw-process-completion-evidence-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.raw-process-completion-evidence.fixture-boundary.v1",
  sourceSpawnContractId: "ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1",
  sourceSpawnContractVersion: 1,
  purpose: "first_live_read_only_staging_preflight",
  platform: "macos",
  fixtureOnly: true,
  observedLiveProcess: false,
  authoritativeLive: false,
  authority: "none",
} as const);

export const PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY = deepFreeze({
  policyId: "pure_raw_process_completion_evidence_contract_policy_v1",
  policyVersion: 1,
  stdoutMaxBytes: 16384,
  stderrMaxBytes: 16384,
  combinedMaxBytes: 32768,
  outputRepresentation: "canonical_utf8_text_only",
  invalidUtf8TextRetained: false,
  shellAllowed: false,
  pathLookupAllowed: false,
  inheritedEnvironmentAllowed: false,
  credentialUseAllowed: false,
  networkUseAllowed: false,
  observerAuthorityAllowed: false,
  cliVersionInterpretationAllowed: false,
  authorizationConsumptionAllowed: false,
  runtimeActivationAllowed: false,
  retryAllowed: false,
  fallbackAllowed: false,
  toctouEliminationClaimAllowed: false,
} as const);

export const PURE_RAW_PROCESS_COMPLETION_FINGERPRINT_DOMAINS = deepFreeze({
  identity: "ture:pure-raw-process-completion-evidence-contract:identity:v1",
  policy: "ture:pure-raw-process-completion-evidence-contract:policy:v1",
  evidence: "ture:pure-raw-process-completion-evidence-contract:evidence:v1",
  result: "ture:pure-raw-process-completion-evidence-contract:result:v1",
} as const);

export type RawProcessCompletionCategory =
  | "spawn_failed_before_process_creation"
  | "process_created_normal_zero_exit"
  | "process_created_non_zero_exit"
  | "process_created_signal_termination"
  | "child_process_error"
  | "stdout_stream_error"
  | "stderr_stream_error"
  | "stdout_output_limit_exceeded"
  | "stderr_output_limit_exceeded"
  | "combined_output_limit_exceeded"
  | "invalid_output_encoding"
  | "unexpected_stream_chunk"
  | "process_close_without_exit"
  | "internally_terminal_process_death_unconfirmed"
  | "malformed_completion_evidence";

export type RawProcessCompletionLifecycleState =
  | "spawn_failed_before_process_creation"
  | "process_created_terminal_close_observed"
  | "process_created_terminal_close_without_exit"
  | "process_created_terminal_error"
  | "process_created_terminal_overflow"
  | "process_created_terminal_invalid_output"
  | "process_created_internal_terminal_death_unconfirmed"
  | "malformed_completion_evidence";

export type RawProcessCompletionReason =
  | "accepted"
  | "spawn_failed_before_process_creation"
  | "process_created_normal_zero_exit"
  | "process_created_non_zero_exit"
  | "process_created_signal_termination"
  | "child_process_error"
  | "stdout_stream_error"
  | "stderr_stream_error"
  | "stdout_output_limit_exceeded"
  | "stderr_output_limit_exceeded"
  | "combined_output_limit_exceeded"
  | "invalid_output_encoding"
  | "unexpected_stream_chunk"
  | "process_close_without_exit"
  | "internally_terminal_process_death_unconfirmed"
  | "input_shape_rejected"
  | "unknown_field"
  | "unsupported_kind"
  | "unsupported_version"
  | "invalid_identity_or_policy"
  | "invalid_fixture_classification"
  | "production_live_claim_rejected"
  | "authority_claim_rejected"
  | "invalid_timestamp"
  | "invalid_fingerprint"
  | "invalid_enum"
  | "invalid_byte_count"
  | "byte_count_mismatch"
  | "output_limit_exceeded"
  | "output_retention_rejected"
  | "invalid_utf8_state"
  | "process_state_contradiction"
  | "spawn_state_contradiction"
  | "exit_close_contradiction"
  | "signal_code_contradiction"
  | "termination_state_contradiction"
  | "death_confirmation_contradiction"
  | "overflow_state_contradiction"
  | "stream_error_contradiction"
  | "terminal_state_contradiction"
  | "retry_rejected"
  | "fallback_rejected"
  | "toctou_claim_rejected"
  | "runtime_activation_claim_rejected"
  | "malformed_completion_evidence";

export type RawProcessCompletionEvidenceInput = Readonly<{
  contractKind: "pure_raw_process_completion_evidence_contract";
  contractVersion: 1;
  boundaryId: typeof PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.boundaryId;
  sourceSpawnContractId: typeof PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.sourceSpawnContractId;
  sourceSpawnContractVersion: 1;
  sourceSpawnFingerprint: string;
  boundarySessionId: string;
  purpose: "first_live_read_only_staging_preflight";
  toolIdentity: "git";
  platform: "macos";
  policyId: typeof PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.policyId;
  policyVersion: 1;
  canonicalExecutablePath: "/usr/bin/git";
  fixedArgvIdentity: "git_version_argv_v1";
  argv: readonly ["--version"];
  spawnAttemptId: string;
  evidenceTimestamp: string;
  provenanceClassification: "fixture_synthetic";
  fixtureLiveClassification: "fixture_only_not_live_observation";
  spawnAttempted: boolean;
  processCreated: boolean;
  spawnErrorObserved: boolean;
  spawnErrorReason: "none" | "spawn_exception" | "child_process_error";
  processStartedObserved: boolean;
  exitObserved: boolean;
  exitCode: number | null;
  signalObserved: boolean;
  signal: string | null;
  closeObserved: boolean;
  closeCode: number | null;
  closeSignal: string | null;
  completionTerminal: boolean;
  completionCategory: RawProcessCompletionCategory;
  completionReason: RawProcessCompletionReason;
  stdoutByteCount: number;
  stderrByteCount: number;
  combinedByteCount: number;
  stdoutText: string | null;
  stderrText: string | null;
  utf8Valid: boolean;
  stdoutOverflow: boolean;
  stderrOverflow: boolean;
  combinedOverflow: boolean;
  stdoutStreamError: boolean;
  stderrStreamError: boolean;
  unexpectedStreamChunk: boolean;
  terminationRequested: boolean;
  terminationSignal: "SIGKILL" | null;
  terminationRequestSucceeded: boolean | null;
  processDeathConfirmed: boolean;
  processDeathConfirmationSource: "none" | "close_event_after_termination";
  lifecycleState: RawProcessCompletionLifecycleState;
  eventOrderClassification: "spawn_error_without_process" | "spawn_then_exit_then_close" | "spawn_then_close_without_exit" | "spawn_then_internal_terminal";
  terminalSettlementTimestamp: string;
  settledExactlyOnce: boolean;
  retryCount: 0;
  fallbackAttempted: false;
  shellUsed: false;
  pathLookupUsed: false;
  inheritedEnvironmentUsed: false;
  credentialsUsed: false;
  networkUsed: false;
  observerAuthorityGranted: false;
  cliVersionInterpreted: false;
  authorizationConsumed: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
}>;

export type RawProcessCompletionEvidence = RawProcessCompletionEvidenceInput & Readonly<{
  contractIdentityFingerprint: string;
  policyFingerprint: string;
  observedLiveProcess: false;
  processHandleExposed: false;
  processIdAuthority: "none";
  observerCapability: "none";
  cliVersionAuthority: "none";
  credentialAuthority: "none";
  networkAuthority: "none";
  apiAuthority: "none";
  uiAuthority: "none";
  runnerAuthority: "none";
  tradingAuthority: "none";
  avanzaAuthority: "none";
  persistenceAuthority: "none";
  deploymentAuthority: "none";
  evidenceFingerprintAlgorithm: "sha256";
  evidenceFingerprint: string;
}>;

export type RawProcessCompletionResult = Readonly<{
  resultKind: "pure_raw_process_completion_evidence_contract_result";
  resultVersion: 1;
  contractId: typeof PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId;
  status: "accepted_fixture_raw_completion_evidence" | "blocked_fail_closed";
  fixtureOnly: true;
  observedLiveProcess: false;
  authoritativeLive: false;
  authority: "none";
  cliVersionInterpreted: false;
  runtimeActivated: false;
  blockingReasons: readonly RawProcessCompletionReason[];
  evidence: RawProcessCompletionEvidence | null;
  resultFingerprintAlgorithm: "sha256";
  resultFingerprint: string;
}>;

const INPUT_KEYS = [
  "contractKind",
  "contractVersion",
  "boundaryId",
  "sourceSpawnContractId",
  "sourceSpawnContractVersion",
  "sourceSpawnFingerprint",
  "boundarySessionId",
  "purpose",
  "toolIdentity",
  "platform",
  "policyId",
  "policyVersion",
  "canonicalExecutablePath",
  "fixedArgvIdentity",
  "argv",
  "spawnAttemptId",
  "evidenceTimestamp",
  "provenanceClassification",
  "fixtureLiveClassification",
  "spawnAttempted",
  "processCreated",
  "spawnErrorObserved",
  "spawnErrorReason",
  "processStartedObserved",
  "exitObserved",
  "exitCode",
  "signalObserved",
  "signal",
  "closeObserved",
  "closeCode",
  "closeSignal",
  "completionTerminal",
  "completionCategory",
  "completionReason",
  "stdoutByteCount",
  "stderrByteCount",
  "combinedByteCount",
  "stdoutText",
  "stderrText",
  "utf8Valid",
  "stdoutOverflow",
  "stderrOverflow",
  "combinedOverflow",
  "stdoutStreamError",
  "stderrStreamError",
  "unexpectedStreamChunk",
  "terminationRequested",
  "terminationSignal",
  "terminationRequestSucceeded",
  "processDeathConfirmed",
  "processDeathConfirmationSource",
  "lifecycleState",
  "eventOrderClassification",
  "terminalSettlementTimestamp",
  "settledExactlyOnce",
  "retryCount",
  "fallbackAttempted",
  "shellUsed",
  "pathLookupUsed",
  "inheritedEnvironmentUsed",
  "credentialsUsed",
  "networkUsed",
  "observerAuthorityGranted",
  "cliVersionInterpreted",
  "authorizationConsumed",
  "runtimeActivated",
  "toctouEliminated",
  "authority",
] as const satisfies readonly (keyof RawProcessCompletionEvidenceInput)[];

const CATEGORIES = new Set<RawProcessCompletionCategory>([
  "spawn_failed_before_process_creation",
  "process_created_normal_zero_exit",
  "process_created_non_zero_exit",
  "process_created_signal_termination",
  "child_process_error",
  "stdout_stream_error",
  "stderr_stream_error",
  "stdout_output_limit_exceeded",
  "stderr_output_limit_exceeded",
  "combined_output_limit_exceeded",
  "invalid_output_encoding",
  "unexpected_stream_chunk",
  "process_close_without_exit",
  "internally_terminal_process_death_unconfirmed",
  "malformed_completion_evidence",
]);

const LIFECYCLE_STATES = new Set<RawProcessCompletionLifecycleState>([
  "spawn_failed_before_process_creation",
  "process_created_terminal_close_observed",
  "process_created_terminal_close_without_exit",
  "process_created_terminal_error",
  "process_created_terminal_overflow",
  "process_created_terminal_invalid_output",
  "process_created_internal_terminal_death_unconfirmed",
  "malformed_completion_evidence",
]);

const COMPLETION_REASONS = new Set<RawProcessCompletionReason>([
  "accepted",
  "spawn_failed_before_process_creation",
  "process_created_normal_zero_exit",
  "process_created_non_zero_exit",
  "process_created_signal_termination",
  "child_process_error",
  "stdout_stream_error",
  "stderr_stream_error",
  "stdout_output_limit_exceeded",
  "stderr_output_limit_exceeded",
  "combined_output_limit_exceeded",
  "invalid_output_encoding",
  "unexpected_stream_chunk",
  "process_close_without_exit",
  "internally_terminal_process_death_unconfirmed",
  "input_shape_rejected",
  "unknown_field",
  "unsupported_kind",
  "unsupported_version",
  "invalid_identity_or_policy",
  "invalid_fixture_classification",
  "production_live_claim_rejected",
  "authority_claim_rejected",
  "invalid_timestamp",
  "invalid_fingerprint",
  "invalid_enum",
  "invalid_byte_count",
  "byte_count_mismatch",
  "output_limit_exceeded",
  "output_retention_rejected",
  "invalid_utf8_state",
  "process_state_contradiction",
  "spawn_state_contradiction",
  "exit_close_contradiction",
  "signal_code_contradiction",
  "termination_state_contradiction",
  "death_confirmation_contradiction",
  "overflow_state_contradiction",
  "stream_error_contradiction",
  "terminal_state_contradiction",
  "retry_rejected",
  "fallback_rejected",
  "toctou_claim_rejected",
  "runtime_activation_claim_rejected",
  "malformed_completion_evidence",
]);

const BOOLEAN_INPUT_KEYS = [
  "spawnAttempted",
  "processCreated",
  "spawnErrorObserved",
  "processStartedObserved",
  "exitObserved",
  "signalObserved",
  "closeObserved",
  "completionTerminal",
  "utf8Valid",
  "stdoutOverflow",
  "stderrOverflow",
  "combinedOverflow",
  "stdoutStreamError",
  "stderrStreamError",
  "unexpectedStreamChunk",
  "terminationRequested",
  "processDeathConfirmed",
  "settledExactlyOnce",
  "fallbackAttempted",
  "shellUsed",
  "pathLookupUsed",
  "inheritedEnvironmentUsed",
  "credentialsUsed",
  "networkUsed",
  "observerAuthorityGranted",
  "cliVersionInterpreted",
  "authorizationConsumed",
  "runtimeActivated",
  "toctouEliminated",
] as const satisfies readonly (keyof RawProcessCompletionEvidenceInput)[];

const STRING_INPUT_KEYS = [
  "contractKind",
  "boundaryId",
  "sourceSpawnContractId",
  "sourceSpawnFingerprint",
  "boundarySessionId",
  "purpose",
  "toolIdentity",
  "platform",
  "policyId",
  "canonicalExecutablePath",
  "fixedArgvIdentity",
  "spawnAttemptId",
  "evidenceTimestamp",
  "provenanceClassification",
  "fixtureLiveClassification",
  "spawnErrorReason",
  "completionCategory",
  "completionReason",
  "processDeathConfirmationSource",
  "lifecycleState",
  "eventOrderClassification",
  "terminalSettlementTimestamp",
  "authority",
] as const satisfies readonly (keyof RawProcessCompletionEvidenceInput)[];

const NUMBER_INPUT_KEYS = [
  "contractVersion",
  "sourceSpawnContractVersion",
  "policyVersion",
  "stdoutByteCount",
  "stderrByteCount",
  "combinedByteCount",
  "retryCount",
] as const satisfies readonly (keyof RawProcessCompletionEvidenceInput)[];

const NULLABLE_STRING_INPUT_KEYS = [
  "signal",
  "closeSignal",
  "stdoutText",
  "stderrText",
  "terminationSignal",
] as const satisfies readonly (keyof RawProcessCompletionEvidenceInput)[];

const NULLABLE_NUMBER_INPUT_KEYS = [
  "exitCode",
  "closeCode",
] as const satisfies readonly (keyof RawProcessCompletionEvidenceInput)[];

const NULLABLE_BOOLEAN_INPUT_KEYS = [
  "terminationRequestSucceeded",
] as const satisfies readonly (keyof RawProcessCompletionEvidenceInput)[];

type ExactCodeRule = "zero" | "non_zero" | "same_as_exit" | null;
type ExactSignalRule = "none" | "present" | "same_as_signal";
type OutputRule = "retained_text_allowed" | "empty_text_only" | "null_text_only";

type CategoryStateRule = Readonly<{
  completionReason: RawProcessCompletionReason;
  lifecycleState: RawProcessCompletionLifecycleState;
  eventOrderClassification: RawProcessCompletionEvidenceInput["eventOrderClassification"];
  spawnAttempted: true;
  processCreated: boolean;
  spawnErrorObserved: boolean;
  spawnErrorReason: RawProcessCompletionEvidenceInput["spawnErrorReason"];
  processStartedObserved: boolean;
  exitObserved: boolean;
  exitCode: ExactCodeRule;
  signalObserved: boolean;
  signal: ExactSignalRule;
  closeObserved: boolean;
  closeCode: ExactCodeRule;
  closeSignal: ExactSignalRule;
  stdoutStreamError: boolean;
  stderrStreamError: boolean;
  unexpectedStreamChunk: boolean;
  stdoutOverflow: boolean;
  stderrOverflow: boolean;
  combinedOverflow: boolean;
  utf8Valid: boolean;
  terminationRequested: boolean;
  terminationSignal: "SIGKILL" | null;
  terminationRequestSucceeded: boolean | null;
  processDeathConfirmed: boolean;
  processDeathConfirmationSource: RawProcessCompletionEvidenceInput["processDeathConfirmationSource"];
  outputRule: OutputRule;
}>;

const CATEGORY_STATE_RULES = deepFreeze({
  spawn_failed_before_process_creation: {
    completionReason: "spawn_failed_before_process_creation",
    lifecycleState: "spawn_failed_before_process_creation",
    eventOrderClassification: "spawn_error_without_process",
    spawnAttempted: true,
    processCreated: false,
    spawnErrorObserved: true,
    spawnErrorReason: "spawn_exception",
    processStartedObserved: false,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: false,
    closeCode: null,
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "empty_text_only",
  },
  process_created_normal_zero_exit: {
    completionReason: "process_created_normal_zero_exit",
    lifecycleState: "process_created_terminal_close_observed",
    eventOrderClassification: "spawn_then_exit_then_close",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: true,
    exitCode: "zero",
    signalObserved: false,
    signal: "none",
    closeObserved: true,
    closeCode: "same_as_exit",
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "retained_text_allowed",
  },
  process_created_non_zero_exit: {
    completionReason: "process_created_non_zero_exit",
    lifecycleState: "process_created_terminal_close_observed",
    eventOrderClassification: "spawn_then_exit_then_close",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: true,
    exitCode: "non_zero",
    signalObserved: false,
    signal: "none",
    closeObserved: true,
    closeCode: "same_as_exit",
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "retained_text_allowed",
  },
  process_created_signal_termination: {
    completionReason: "process_created_signal_termination",
    lifecycleState: "process_created_terminal_close_observed",
    eventOrderClassification: "spawn_then_exit_then_close",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: true,
    exitCode: null,
    signalObserved: true,
    signal: "present",
    closeObserved: true,
    closeCode: null,
    closeSignal: "same_as_signal",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "retained_text_allowed",
  },
  child_process_error: {
    completionReason: "child_process_error",
    lifecycleState: "process_created_terminal_error",
    eventOrderClassification: "spawn_then_internal_terminal",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: true,
    spawnErrorReason: "child_process_error",
    processStartedObserved: true,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: false,
    closeCode: null,
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "empty_text_only",
  },
  stdout_stream_error: {
    completionReason: "stdout_stream_error",
    lifecycleState: "process_created_terminal_error",
    eventOrderClassification: "spawn_then_internal_terminal",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: false,
    closeCode: null,
    closeSignal: "none",
    stdoutStreamError: true,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "empty_text_only",
  },
  stderr_stream_error: {
    completionReason: "stderr_stream_error",
    lifecycleState: "process_created_terminal_error",
    eventOrderClassification: "spawn_then_internal_terminal",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: false,
    closeCode: null,
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: true,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "empty_text_only",
  },
  stdout_output_limit_exceeded: {
    completionReason: "stdout_output_limit_exceeded",
    lifecycleState: "process_created_terminal_overflow",
    eventOrderClassification: "spawn_then_internal_terminal",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: false,
    closeCode: null,
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: true,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: true,
    terminationSignal: "SIGKILL",
    terminationRequestSucceeded: true,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "null_text_only",
  },
  stderr_output_limit_exceeded: {
    completionReason: "stderr_output_limit_exceeded",
    lifecycleState: "process_created_terminal_overflow",
    eventOrderClassification: "spawn_then_internal_terminal",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: false,
    closeCode: null,
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: true,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: true,
    terminationSignal: "SIGKILL",
    terminationRequestSucceeded: true,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "null_text_only",
  },
  combined_output_limit_exceeded: {
    completionReason: "combined_output_limit_exceeded",
    lifecycleState: "process_created_terminal_overflow",
    eventOrderClassification: "spawn_then_internal_terminal",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: false,
    closeCode: null,
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: true,
    utf8Valid: true,
    terminationRequested: true,
    terminationSignal: "SIGKILL",
    terminationRequestSucceeded: true,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "null_text_only",
  },
  invalid_output_encoding: {
    completionReason: "invalid_output_encoding",
    lifecycleState: "process_created_terminal_invalid_output",
    eventOrderClassification: "spawn_then_internal_terminal",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: false,
    closeCode: null,
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: false,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "null_text_only",
  },
  unexpected_stream_chunk: {
    completionReason: "unexpected_stream_chunk",
    lifecycleState: "process_created_terminal_error",
    eventOrderClassification: "spawn_then_internal_terminal",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: false,
    closeCode: null,
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: true,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "empty_text_only",
  },
  process_close_without_exit: {
    completionReason: "process_close_without_exit",
    lifecycleState: "process_created_terminal_close_without_exit",
    eventOrderClassification: "spawn_then_close_without_exit",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: true,
    closeCode: "zero",
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "retained_text_allowed",
  },
  internally_terminal_process_death_unconfirmed: {
    completionReason: "internally_terminal_process_death_unconfirmed",
    lifecycleState: "process_created_internal_terminal_death_unconfirmed",
    eventOrderClassification: "spawn_then_internal_terminal",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: false,
    exitCode: null,
    signalObserved: false,
    signal: "none",
    closeObserved: false,
    closeCode: null,
    closeSignal: "none",
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    utf8Valid: true,
    terminationRequested: true,
    terminationSignal: "SIGKILL",
    terminationRequestSucceeded: true,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    outputRule: "empty_text_only",
  },
} as const satisfies Record<Exclude<RawProcessCompletionCategory, "malformed_completion_evidence">, CategoryStateRule>);

export function buildPureRawProcessCompletionEvidence(input: unknown): RawProcessCompletionResult {
  const reasons = validateRawProcessCompletionEvidenceInput(input);
  const evidence = reasons.length === 0 ? buildEvidence(input as RawProcessCompletionEvidenceInput) : null;
  return buildResult(evidence, reasons);
}

export function validateRawProcessCompletionEvidenceInput(input: unknown): readonly RawProcessCompletionReason[] {
  if (!isPlainDataObject(input)) return ["input_shape_rejected"];
  const reasons: RawProcessCompletionReason[] = [];
  const keys = Object.keys(input);
  if (keys.length !== INPUT_KEYS.length || keys.some((key) => !(INPUT_KEYS as readonly string[]).includes(key))) reasons.push("unknown_field");
  if (INPUT_KEYS.some((key) => !(key in input))) reasons.push("input_shape_rejected");
  if (reasons.includes("input_shape_rejected")) return sorted(reasons);
  const candidate = input as Partial<RawProcessCompletionEvidenceInput>;
  validatePrimitiveSchema(candidate, reasons);
  validateArgv(candidate.argv, reasons);
  validateIdentity(candidate, reasons);
  validateScalars(candidate, reasons);
  validateCountsAndOutput(candidate, reasons);
  validateState(candidate, reasons);
  return sorted(reasons);
}

export function buildCanonicalRawCompletionFixtureInput(
  category: RawProcessCompletionCategory = "process_created_normal_zero_exit",
  patch: Partial<RawProcessCompletionEvidenceInput> = {},
): RawProcessCompletionEvidenceInput {
  const base: RawProcessCompletionEvidenceInput = {
    contractKind: "pure_raw_process_completion_evidence_contract",
    contractVersion: 1,
    boundaryId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.boundaryId,
    sourceSpawnContractId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.sourceSpawnContractId,
    sourceSpawnContractVersion: 1,
    sourceSpawnFingerprint: "a".repeat(64),
    boundarySessionId: "raw-completion-session-001",
    purpose: "first_live_read_only_staging_preflight",
    toolIdentity: "git",
    platform: "macos",
    policyId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.policyId,
    policyVersion: 1,
    canonicalExecutablePath: "/usr/bin/git",
    fixedArgvIdentity: "git_version_argv_v1",
    argv: ["--version"],
    spawnAttemptId: "spawn-attempt-001",
    evidenceTimestamp: "2026-07-17T11:30:00.000Z",
    provenanceClassification: "fixture_synthetic",
    fixtureLiveClassification: "fixture_only_not_live_observation",
    spawnAttempted: true,
    processCreated: true,
    spawnErrorObserved: false,
    spawnErrorReason: "none",
    processStartedObserved: true,
    exitObserved: true,
    exitCode: 0,
    signalObserved: false,
    signal: null,
    closeObserved: true,
    closeCode: 0,
    closeSignal: null,
    completionTerminal: true,
    completionCategory: "process_created_normal_zero_exit",
    completionReason: "process_created_normal_zero_exit",
    stdoutByteCount: 19,
    stderrByteCount: 0,
    combinedByteCount: 19,
    stdoutText: "git version 2.45.1\n",
    stderrText: "",
    utf8Valid: true,
    stdoutOverflow: false,
    stderrOverflow: false,
    combinedOverflow: false,
    stdoutStreamError: false,
    stderrStreamError: false,
    unexpectedStreamChunk: false,
    terminationRequested: false,
    terminationSignal: null,
    terminationRequestSucceeded: null,
    processDeathConfirmed: false,
    processDeathConfirmationSource: "none",
    lifecycleState: "process_created_terminal_close_observed",
    eventOrderClassification: "spawn_then_exit_then_close",
    terminalSettlementTimestamp: "2026-07-17T11:30:00.000Z",
    settledExactlyOnce: true,
    retryCount: 0,
    fallbackAttempted: false,
    shellUsed: false,
    pathLookupUsed: false,
    inheritedEnvironmentUsed: false,
    credentialsUsed: false,
    networkUsed: false,
    observerAuthorityGranted: false,
    cliVersionInterpreted: false,
    authorizationConsumed: false,
    runtimeActivated: false,
    toctouEliminated: false,
    authority: "none",
  };
  return deepFreeze({
    ...base,
    ...categoryDefaults(category),
    ...patch,
  });
}

function categoryDefaults(category: RawProcessCompletionCategory): Partial<RawProcessCompletionEvidenceInput> {
  if (category === "spawn_failed_before_process_creation") {
    return {
      processCreated: false,
      spawnErrorObserved: true,
      spawnErrorReason: "spawn_exception",
      processStartedObserved: false,
      exitObserved: false,
      exitCode: null,
      closeObserved: false,
      closeCode: null,
      completionCategory: category,
      completionReason: category,
      stdoutByteCount: 0,
      combinedByteCount: 0,
      stdoutText: "",
      lifecycleState: "spawn_failed_before_process_creation",
      eventOrderClassification: "spawn_error_without_process",
    };
  }
  if (category === "process_created_non_zero_exit") return { completionCategory: category, completionReason: category, exitCode: 1, closeCode: 1 };
  if (category === "process_created_signal_termination") {
    return { completionCategory: category, completionReason: category, exitCode: null, signalObserved: true, signal: "SIGTERM", closeCode: null, closeSignal: "SIGTERM" };
  }
  if (category === "child_process_error") {
    return { completionCategory: category, completionReason: category, spawnErrorObserved: true, spawnErrorReason: "child_process_error", exitObserved: false, exitCode: null, closeObserved: false, closeCode: null, stdoutText: "", stdoutByteCount: 0, combinedByteCount: 0, lifecycleState: "process_created_terminal_error", eventOrderClassification: "spawn_then_internal_terminal" };
  }
  if (category === "stdout_stream_error") return errorCategory(category, { stdoutStreamError: true });
  if (category === "stderr_stream_error") return errorCategory(category, { stderrStreamError: true });
  if (category === "stdout_output_limit_exceeded") return overflowCategory(category, { stdoutOverflow: true, stdoutByteCount: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.stdoutMaxBytes + 1, combinedByteCount: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.stdoutMaxBytes + 1 });
  if (category === "stderr_output_limit_exceeded") return overflowCategory(category, { stdoutByteCount: 0, stderrOverflow: true, stderrByteCount: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.stderrMaxBytes + 1, combinedByteCount: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.stderrMaxBytes + 1 });
  if (category === "combined_output_limit_exceeded") return overflowCategory(category, { combinedOverflow: true, stdoutByteCount: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.stdoutMaxBytes, stderrByteCount: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.stderrMaxBytes + 1, combinedByteCount: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.combinedMaxBytes + 1 });
  if (category === "invalid_output_encoding") return errorCategory(category, { utf8Valid: false, stdoutText: null, stderrText: null, stdoutByteCount: 4, combinedByteCount: 4, lifecycleState: "process_created_terminal_invalid_output" });
  if (category === "unexpected_stream_chunk") return errorCategory(category, { unexpectedStreamChunk: true });
  if (category === "process_close_without_exit") {
    return { completionCategory: category, completionReason: category, exitObserved: false, exitCode: null, closeCode: 0, lifecycleState: "process_created_terminal_close_without_exit", eventOrderClassification: "spawn_then_close_without_exit" };
  }
  if (category === "internally_terminal_process_death_unconfirmed") {
    return errorCategory(category, { terminationRequested: true, terminationSignal: "SIGKILL", terminationRequestSucceeded: true, processDeathConfirmed: false, lifecycleState: "process_created_internal_terminal_death_unconfirmed" });
  }
  if (category === "malformed_completion_evidence") return { completionCategory: category, lifecycleState: "malformed_completion_evidence", completionReason: "malformed_completion_evidence" };
  return {};
}

function errorCategory(category: RawProcessCompletionCategory, patch: Partial<RawProcessCompletionEvidenceInput>): Partial<RawProcessCompletionEvidenceInput> {
  return {
    completionCategory: category,
    completionReason: category,
    exitObserved: false,
    exitCode: null,
    closeObserved: false,
    closeCode: null,
    stdoutText: "",
    stdoutByteCount: 0,
    combinedByteCount: 0,
    lifecycleState: "process_created_terminal_error",
    eventOrderClassification: "spawn_then_internal_terminal",
    ...patch,
  };
}

function overflowCategory(category: RawProcessCompletionCategory, patch: Partial<RawProcessCompletionEvidenceInput>): Partial<RawProcessCompletionEvidenceInput> {
  return {
    completionCategory: category,
    completionReason: category,
    exitObserved: false,
    exitCode: null,
    closeObserved: false,
    closeCode: null,
    stdoutText: null,
    stderrText: null,
    lifecycleState: "process_created_terminal_overflow",
    eventOrderClassification: "spawn_then_internal_terminal",
    terminationRequested: true,
    terminationSignal: "SIGKILL",
    terminationRequestSucceeded: true,
    ...patch,
  };
}

function validateIdentity(input: Partial<RawProcessCompletionEvidenceInput>, reasons: RawProcessCompletionReason[]) {
  if (input.contractKind !== "pure_raw_process_completion_evidence_contract") reasons.push("unsupported_kind");
  if (input.contractVersion !== 1 || input.sourceSpawnContractVersion !== 1 || input.policyVersion !== 1) reasons.push("unsupported_version");
  if (
    input.boundaryId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.boundaryId
    || input.sourceSpawnContractId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.sourceSpawnContractId
    || input.policyId !== PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.policyId
    || input.purpose !== "first_live_read_only_staging_preflight"
    || input.toolIdentity !== "git"
    || input.platform !== "macos"
    || input.canonicalExecutablePath !== "/usr/bin/git"
    || input.fixedArgvIdentity !== "git_version_argv_v1"
    || !isExactVersionArgv(input.argv)
  ) reasons.push("invalid_identity_or_policy");
  if (!isSha256(input.sourceSpawnFingerprint)) reasons.push("invalid_fingerprint");
  if (input.provenanceClassification !== "fixture_synthetic" || input.fixtureLiveClassification !== "fixture_only_not_live_observation") reasons.push("invalid_fixture_classification");
}

function validatePrimitiveSchema(input: Partial<RawProcessCompletionEvidenceInput>, reasons: RawProcessCompletionReason[]) {
  for (const key of BOOLEAN_INPUT_KEYS) {
    if (typeof input[key] !== "boolean") reasons.push("input_shape_rejected");
  }
  for (const key of STRING_INPUT_KEYS) {
    if (typeof input[key] !== "string") reasons.push("input_shape_rejected");
  }
  for (const key of NUMBER_INPUT_KEYS) {
    if (typeof input[key] !== "number" || !Number.isFinite(input[key])) reasons.push("input_shape_rejected");
  }
  for (const key of NULLABLE_STRING_INPUT_KEYS) {
    if (typeof input[key] !== "string" && input[key] !== null) reasons.push("input_shape_rejected");
  }
  for (const key of NULLABLE_NUMBER_INPUT_KEYS) {
    if (typeof input[key] !== "number" && input[key] !== null) reasons.push("input_shape_rejected");
  }
  for (const key of NULLABLE_BOOLEAN_INPUT_KEYS) {
    if (typeof input[key] !== "boolean" && input[key] !== null) reasons.push("input_shape_rejected");
  }
}

function validateArgv(input: unknown, reasons: RawProcessCompletionReason[]) {
  if (!isExactVersionArgv(input)) reasons.push("invalid_identity_or_policy");
  if (!Array.isArray(input)) return;
  if (Object.getPrototypeOf(input) !== Array.prototype) reasons.push("input_shape_rejected");
  if (Object.getOwnPropertySymbols(input).length > 0) reasons.push("input_shape_rejected");
  const descriptors = Object.getOwnPropertyDescriptors(input);
  const ownNames = Object.getOwnPropertyNames(input).sort();
  if (JSON.stringify(ownNames) !== JSON.stringify(["0", "length"])) reasons.push("input_shape_rejected");
  if (descriptors["0"]?.get || descriptors["0"]?.set) reasons.push("input_shape_rejected");
  if (!Object.prototype.hasOwnProperty.call(input, "0")) reasons.push("input_shape_rejected");
}

function validateScalars(input: Partial<RawProcessCompletionEvidenceInput>, reasons: RawProcessCompletionReason[]) {
  if (!isIsoTimestamp(input.evidenceTimestamp) || !isIsoTimestamp(input.terminalSettlementTimestamp)) reasons.push("invalid_timestamp");
  if (typeof input.boundarySessionId !== "string" || input.boundarySessionId.length === 0 || typeof input.spawnAttemptId !== "string" || input.spawnAttemptId.length === 0) reasons.push("input_shape_rejected");
  if (!CATEGORIES.has(input.completionCategory as RawProcessCompletionCategory)) reasons.push("invalid_enum");
  if (!LIFECYCLE_STATES.has(input.lifecycleState as RawProcessCompletionLifecycleState)) reasons.push("invalid_enum");
  if (!COMPLETION_REASONS.has(input.completionReason as RawProcessCompletionReason)) reasons.push("invalid_enum");
  if (!["spawn_error_without_process", "spawn_then_exit_then_close", "spawn_then_close_without_exit", "spawn_then_internal_terminal"].includes(String(input.eventOrderClassification))) reasons.push("invalid_enum");
  if (!["none", "spawn_exception", "child_process_error"].includes(String(input.spawnErrorReason))) reasons.push("invalid_enum");
  if (!["none", "close_event_after_termination"].includes(String(input.processDeathConfirmationSource))) reasons.push("invalid_enum");
  if (input.signal !== null && !/^SIG[A-Z0-9]+$/u.test(String(input.signal))) reasons.push("invalid_enum");
  if (input.closeSignal !== null && !/^SIG[A-Z0-9]+$/u.test(String(input.closeSignal))) reasons.push("invalid_enum");
  if (input.terminationSignal !== null && input.terminationSignal !== "SIGKILL") reasons.push("invalid_enum");
}

function validateCountsAndOutput(input: Partial<RawProcessCompletionEvidenceInput>, reasons: RawProcessCompletionReason[]) {
  const stdoutBytes = input.stdoutByteCount;
  const stderrBytes = input.stderrByteCount;
  const combinedBytes = input.combinedByteCount;
  if (!isSafeByteCount(stdoutBytes) || !isSafeByteCount(stderrBytes) || !isSafeByteCount(combinedBytes)) {
    reasons.push("invalid_byte_count");
    return;
  }
  if (combinedBytes !== stdoutBytes + stderrBytes) reasons.push("byte_count_mismatch");
  if (stdoutBytes > PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.stdoutMaxBytes && input.stdoutOverflow !== true && input.completionCategory !== "combined_output_limit_exceeded") reasons.push("output_limit_exceeded");
  if (stderrBytes > PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.stderrMaxBytes && input.stderrOverflow !== true && input.completionCategory !== "combined_output_limit_exceeded") reasons.push("output_limit_exceeded");
  if (combinedBytes > PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.combinedMaxBytes && input.combinedOverflow !== true) reasons.push("output_limit_exceeded");
  if (typeof input.stdoutText === "string" && Buffer.byteLength(input.stdoutText, "utf8") !== stdoutBytes) reasons.push("byte_count_mismatch");
  if (typeof input.stderrText === "string" && Buffer.byteLength(input.stderrText, "utf8") !== stderrBytes) reasons.push("byte_count_mismatch");
  if (input.utf8Valid === false && (input.stdoutText !== null || input.stderrText !== null)) reasons.push("invalid_utf8_state");
  if ((input.stdoutOverflow || input.stderrOverflow || input.combinedOverflow) && (input.stdoutText !== null || input.stderrText !== null)) reasons.push("output_retention_rejected");
  if (input.completionCategory === "invalid_output_encoding" && input.utf8Valid !== false) reasons.push("invalid_utf8_state");
}

function validateState(input: Partial<RawProcessCompletionEvidenceInput>, reasons: RawProcessCompletionReason[]) {
  validateCategoryState(input, reasons);
  if (input.processCreated === false && input.processStartedObserved === true) reasons.push("process_state_contradiction");
  if (input.processCreated === false && (input.exitObserved === true || input.closeObserved === true)) reasons.push("process_state_contradiction");
  if (input.processCreated === false && (input.exitCode !== null || input.signal !== null || input.closeCode !== null || input.closeSignal !== null)) reasons.push("process_state_contradiction");
  if (input.processStartedObserved === false && input.processCreated === true) reasons.push("process_state_contradiction");
  if (input.spawnErrorObserved === true && input.completionCategory === "process_created_normal_zero_exit") reasons.push("spawn_state_contradiction");
  if (input.spawnErrorObserved === true && input.processCreated === true && input.spawnErrorReason === "spawn_exception") reasons.push("spawn_state_contradiction");
  if (input.spawnErrorObserved === false && input.spawnErrorReason !== "none") reasons.push("spawn_state_contradiction");
  if (input.closeObserved === false && input.completionCategory === "process_created_normal_zero_exit") reasons.push("exit_close_contradiction");
  if (input.exitObserved === false && (input.exitCode !== null || input.signal !== null || input.signalObserved === true)) reasons.push("exit_close_contradiction");
  if (input.closeObserved === false && (input.closeCode !== null || input.closeSignal !== null)) reasons.push("exit_close_contradiction");
  if (input.exitCode !== null && input.closeCode !== null && input.exitCode !== input.closeCode) reasons.push("exit_close_contradiction");
  if (input.completionTerminal !== true) reasons.push("terminal_state_contradiction");
  if (input.exitCode !== null && input.signal !== null) reasons.push("signal_code_contradiction");
  if (input.signalObserved === true && input.signal === null) reasons.push("signal_code_contradiction");
  if (input.signalObserved === false && input.signal !== null) reasons.push("signal_code_contradiction");
  if (input.closeSignal !== null && input.signal !== null && input.closeSignal !== input.signal) reasons.push("signal_code_contradiction");
  if (input.closeCode !== null && input.closeSignal !== null) reasons.push("signal_code_contradiction");
  if (input.terminationRequested === false && input.terminationSignal !== null) reasons.push("termination_state_contradiction");
  if (input.terminationRequested === false && input.terminationRequestSucceeded !== null) reasons.push("termination_state_contradiction");
  if (input.terminationRequested === true && input.terminationRequestSucceeded !== true) reasons.push("termination_state_contradiction");
  if (input.terminationRequested === true && input.terminationSignal !== "SIGKILL") reasons.push("termination_state_contradiction");
  if (input.processDeathConfirmed === true && input.processDeathConfirmationSource !== "close_event_after_termination") reasons.push("death_confirmation_contradiction");
  if (input.processDeathConfirmed === false && input.processDeathConfirmationSource !== "none") reasons.push("death_confirmation_contradiction");
  if (input.completionCategory === "internally_terminal_process_death_unconfirmed" && input.processDeathConfirmed === true) reasons.push("death_confirmation_contradiction");
  if (input.stdoutOverflow && !["stdout_output_limit_exceeded", "combined_output_limit_exceeded"].includes(String(input.completionCategory))) reasons.push("overflow_state_contradiction");
  if (input.stderrOverflow && !["stderr_output_limit_exceeded", "combined_output_limit_exceeded"].includes(String(input.completionCategory))) reasons.push("overflow_state_contradiction");
  if (input.combinedOverflow && input.completionCategory !== "combined_output_limit_exceeded") reasons.push("overflow_state_contradiction");
  if ([input.stdoutOverflow, input.stderrOverflow, input.combinedOverflow].filter(Boolean).length > 1) reasons.push("overflow_state_contradiction");
  if (input.stdoutStreamError && input.completionCategory !== "stdout_stream_error") reasons.push("stream_error_contradiction");
  if (input.stderrStreamError && input.completionCategory !== "stderr_stream_error") reasons.push("stream_error_contradiction");
  if (input.unexpectedStreamChunk && input.completionCategory !== "unexpected_stream_chunk") reasons.push("stream_error_contradiction");
  if (input.settledExactlyOnce !== true) reasons.push("terminal_state_contradiction");
  if (input.retryCount !== 0) reasons.push("retry_rejected");
  if (input.fallbackAttempted !== false) reasons.push("fallback_rejected");
  if (input.shellUsed || input.pathLookupUsed || input.inheritedEnvironmentUsed || input.credentialsUsed || input.networkUsed || input.observerAuthorityGranted || input.cliVersionInterpreted || input.authorizationConsumed || input.runtimeActivated) reasons.push("authority_claim_rejected");
  if (input.runtimeActivated) reasons.push("runtime_activation_claim_rejected");
  if (input.toctouEliminated !== false) reasons.push("toctou_claim_rejected");
  if (input.authority !== "none") reasons.push("authority_claim_rejected");
  if (input.provenanceClassification !== "fixture_synthetic") reasons.push("production_live_claim_rejected");
  if (input.completionCategory === "malformed_completion_evidence") reasons.push("malformed_completion_evidence");
}

function validateCategoryState(input: Partial<RawProcessCompletionEvidenceInput>, reasons: RawProcessCompletionReason[]) {
  const category = input.completionCategory as RawProcessCompletionCategory;
  if (category === "malformed_completion_evidence") {
    reasons.push("malformed_completion_evidence");
    return;
  }
  if (!CATEGORIES.has(category)) return;
  const rule = CATEGORY_STATE_RULES[category as Exclude<RawProcessCompletionCategory, "malformed_completion_evidence">];
  if (input.completionReason !== rule.completionReason) reasons.push("invalid_enum");
  if (input.lifecycleState !== rule.lifecycleState || input.eventOrderClassification !== rule.eventOrderClassification) reasons.push("terminal_state_contradiction");
  if (input.spawnAttempted !== rule.spawnAttempted) reasons.push("spawn_state_contradiction");
  if (input.processCreated !== rule.processCreated || input.processStartedObserved !== rule.processStartedObserved) reasons.push("process_state_contradiction");
  if (input.spawnErrorObserved !== rule.spawnErrorObserved || input.spawnErrorReason !== rule.spawnErrorReason) reasons.push("spawn_state_contradiction");
  if (input.exitObserved !== rule.exitObserved || !matchesCodeRule(input.exitCode, rule.exitCode, input.exitCode)) reasons.push("exit_close_contradiction");
  if (input.closeObserved !== rule.closeObserved || !matchesCodeRule(input.closeCode, rule.closeCode, input.exitCode)) reasons.push("exit_close_contradiction");
  if (input.signalObserved !== rule.signalObserved || !matchesSignalRule(input.signal, rule.signal, input.signal)) reasons.push("signal_code_contradiction");
  if (!matchesSignalRule(input.closeSignal, rule.closeSignal, input.signal)) reasons.push("signal_code_contradiction");
  if (
    input.stdoutStreamError !== rule.stdoutStreamError
    || input.stderrStreamError !== rule.stderrStreamError
    || input.unexpectedStreamChunk !== rule.unexpectedStreamChunk
  ) reasons.push("stream_error_contradiction");
  if (
    input.stdoutOverflow !== rule.stdoutOverflow
    || input.stderrOverflow !== rule.stderrOverflow
    || input.combinedOverflow !== rule.combinedOverflow
  ) reasons.push("overflow_state_contradiction");
  if (input.utf8Valid !== rule.utf8Valid) reasons.push("invalid_utf8_state");
  if (
    input.terminationRequested !== rule.terminationRequested
    || input.terminationSignal !== rule.terminationSignal
    || input.terminationRequestSucceeded !== rule.terminationRequestSucceeded
  ) reasons.push("termination_state_contradiction");
  if (
    input.processDeathConfirmed !== rule.processDeathConfirmed
    || input.processDeathConfirmationSource !== rule.processDeathConfirmationSource
  ) reasons.push("death_confirmation_contradiction");
  if (!matchesOutputRule(input, rule.outputRule)) reasons.push("output_retention_rejected");
}

function buildEvidence(input: RawProcessCompletionEvidenceInput): RawProcessCompletionEvidence {
  const core = {
    ...input,
    contractIdentityFingerprint: fingerprint(PURE_RAW_PROCESS_COMPLETION_FINGERPRINT_DOMAINS.identity, PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY),
    policyFingerprint: fingerprint(PURE_RAW_PROCESS_COMPLETION_FINGERPRINT_DOMAINS.policy, PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY),
    observedLiveProcess: false,
    processHandleExposed: false,
    processIdAuthority: "none",
    observerCapability: "none",
    cliVersionAuthority: "none",
    credentialAuthority: "none",
    networkAuthority: "none",
    apiAuthority: "none",
    uiAuthority: "none",
    runnerAuthority: "none",
    tradingAuthority: "none",
    avanzaAuthority: "none",
    persistenceAuthority: "none",
    deploymentAuthority: "none",
  } satisfies Omit<RawProcessCompletionEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  return deepFreeze({
    ...core,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: fingerprint(PURE_RAW_PROCESS_COMPLETION_FINGERPRINT_DOMAINS.evidence, core),
  } satisfies RawProcessCompletionEvidence);
}

function buildResult(evidence: RawProcessCompletionEvidence | null, reasons: readonly RawProcessCompletionReason[]): RawProcessCompletionResult {
  const resultCore = {
    resultKind: "pure_raw_process_completion_evidence_contract_result",
    resultVersion: 1,
    contractId: PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY.contractId,
    status: evidence ? "accepted_fixture_raw_completion_evidence" : "blocked_fail_closed",
    fixtureOnly: true,
    observedLiveProcess: false,
    authoritativeLive: false,
    authority: "none",
    cliVersionInterpreted: false,
    runtimeActivated: false,
    blockingReasons: evidence ? ["accepted"] : sorted(reasons),
    evidence,
  } satisfies Omit<RawProcessCompletionResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...resultCore,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(PURE_RAW_PROCESS_COMPLETION_FINGERPRINT_DOMAINS.result, resultCore),
  } satisfies RawProcessCompletionResult);
}

function isPlainDataObject(input: unknown): input is Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return false;
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (Object.getOwnPropertySymbols(input).length > 0) return false;
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") return false;
    if (descriptor.get || descriptor.set || !descriptor.enumerable) return false;
  }
  for (const key in input) if (!Object.prototype.hasOwnProperty.call(input, key)) return false;
  return !Object.values(input).some((value) => typeof value === "function");
}

function isExactVersionArgv(input: unknown): input is readonly ["--version"] {
  if (!Array.isArray(input)) return false;
  if (Object.getPrototypeOf(input) !== Array.prototype) return false;
  if (input.length !== 1) return false;
  if (!Object.prototype.hasOwnProperty.call(input, "0")) return false;
  if (input[0] !== "--version") return false;
  if (Object.getOwnPropertySymbols(input).length > 0) return false;
  const descriptors = Object.getOwnPropertyDescriptors(input);
  if (descriptors["0"]?.get || descriptors["0"]?.set) return false;
  return JSON.stringify(Object.getOwnPropertyNames(input).sort()) === JSON.stringify(["0", "length"]);
}

function matchesCodeRule(value: number | null | undefined, rule: ExactCodeRule, exitCode: number | null | undefined): boolean {
  if (rule === null) return value === null;
  if (typeof value !== "number" || !Number.isSafeInteger(value)) return false;
  if (rule === "zero") return value === 0;
  if (rule === "non_zero") return value !== 0;
  return typeof exitCode === "number" && Number.isSafeInteger(exitCode) && value === exitCode;
}

function matchesSignalRule(value: string | null | undefined, rule: ExactSignalRule, signal: string | null | undefined): boolean {
  if (rule === "none") return value === null;
  if (rule === "present") return typeof value === "string" && /^SIG[A-Z0-9]+$/u.test(value);
  return typeof value === "string" && value === signal;
}

function matchesOutputRule(input: Partial<RawProcessCompletionEvidenceInput>, rule: OutputRule): boolean {
  if (rule === "retained_text_allowed") {
    return (typeof input.stdoutText === "string" || input.stdoutText === null) && (typeof input.stderrText === "string" || input.stderrText === null);
  }
  if (rule === "empty_text_only") {
    return input.stdoutText === "" && input.stderrText === "" && input.stdoutByteCount === 0 && input.stderrByteCount === 0 && input.combinedByteCount === 0;
  }
  return input.stdoutText === null && input.stderrText === null;
}

function isSafeByteCount(input: unknown): input is number {
  return typeof input === "number" && Number.isSafeInteger(input) && input >= 0;
}

function isSha256(input: unknown): boolean {
  return typeof input === "string" && /^[a-f0-9]{64}$/u.test(input);
}

function isIsoTimestamp(input: unknown): boolean {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(input)) return false;
  const parsed = Date.parse(input);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === input;
}

function sorted<T extends string>(input: readonly T[]): readonly T[] {
  return [...new Set(input)].sort();
}

function fingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(canonicalize(input))}`).digest("hex");
}

function canonicalize(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(canonicalize);
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, canonicalize(value)]));
  }
  return input;
}

function deepFreeze<T>(input: T): T {
  if (input && typeof input === "object") {
    Object.freeze(input);
    for (const value of Object.values(input as Record<string, unknown>)) deepFreeze(value);
  }
  return input;
}
