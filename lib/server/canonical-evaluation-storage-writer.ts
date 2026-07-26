import "server-only";

import { createHash } from "node:crypto";

import {
  CANONICAL_EVALUATION_PERSISTENCE_CONTRACT_VERSION,
  CANONICAL_EVALUATION_STORAGE_PAYLOAD_VERSION,
  buildCanonicalEvaluationStoragePayload,
  type CanonicalEvaluationPersistenceEnvelope,
  type CanonicalEvaluationStoragePayload,
} from "@/lib/canonical-evaluation-persistence-contract";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export const CANONICAL_EVALUATION_LINEAGE_CONTRACT_VERSION =
  "canonical_evaluation_lineage_v1" as const;
export const CANONICAL_EVALUATION_STORAGE_WRITER_VERSION =
  "canonical_evaluation_storage_writer_v1" as const;
export const CANONICAL_EVALUATION_STORAGE_RELATION =
  "canonical_evaluation_decisions" as const;
export const CANONICAL_EVALUATION_WRITER_FEATURE_FLAG =
  "TURE_CANONICAL_EVALUATION_WRITER_ENABLED" as const;
export const CANONICAL_EVALUATION_WRITER_KILL_SWITCH =
  "TURE_CANONICAL_EVALUATION_WRITER_KILL_SWITCH" as const;

export type CanonicalEvaluationStorageInsert = {
  storage_contract_version: typeof CANONICAL_EVALUATION_STORAGE_PAYLOAD_VERSION;
  envelope_contract_version: typeof CANONICAL_EVALUATION_PERSISTENCE_CONTRACT_VERSION;
  lineage_contract_version: typeof CANONICAL_EVALUATION_LINEAGE_CONTRACT_VERSION;
  canonical_identity: string;
  semantic_payload_sha256: string;
  idempotency_key: string;
  producer_decision_id: string;
  source_namespace: string;
  decision_timestamp: string;
  decision_kind: CanonicalEvaluationStoragePayload["decision_kind"];
  sample_type: CanonicalEvaluationStoragePayload["sample_type"];
  candidate_id: string | null;
  scan_run_id: string | null;
  scan_run_fingerprint: string | null;
  batch_id: string | null;
  batch_fingerprint: string | null;
  snapshot_id: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  numeric_confidence: number | null;
  confidence_label: string | null;
  engine_version: string;
  scoring_version: string;
  ranking_version: string;
  setup_taxonomy_version: string;
  confidence_contract_version: string;
  evaluator_version: string;
  provider_contract_version: string;
  git_commit: string;
  build_identity: string;
  regime_at_decision: string | null;
  sector_at_decision: string | null;
  provider: string | null;
  provider_source_timestamp: string | null;
  freshness: string | null;
  candle_interval: string | null;
  expected_candle_count: number | null;
  observed_candle_count: number | null;
  coverage_reason_codes: string[];
  evaluator_input_identity: string | null;
  primary_horizon: CanonicalEvaluationStoragePayload["primary_horizon"];
  primary_outcome_id: string | null;
  diagnostic_outcome_ids: string[];
  reproducible: boolean;
  quality_metrics_eligible: boolean;
  lineage_json: CanonicalEvaluationStoragePayload["lineage_json"];
  versions_json: CanonicalEvaluationStoragePayload["versions_json"];
  decision_context_json: CanonicalEvaluationStoragePayload["decision_context_json"];
  provider_context_json: CanonicalEvaluationStoragePayload["provider_context_json"];
  evaluation_json: CanonicalEvaluationStoragePayload["evaluation_json"];
  replay_metadata_json: CanonicalEvaluationStoragePayload["replay_metadata_json"];
  diagnostic_horizons_json: CanonicalEvaluationStoragePayload["evaluation_json"]["horizons"];
  persistence_envelope: CanonicalEvaluationPersistenceEnvelope;
};

export type CanonicalEvaluationStoragePayloadValidation =
  | {
      status: "ready";
      ok: true;
      payload: CanonicalEvaluationStoragePayload;
      insert: CanonicalEvaluationStorageInsert;
      semantic_payload_sha256: string;
      reason_codes: [];
    }
  | {
      status: "rejected_unmappable";
      ok: false;
      payload: null;
      insert: null;
      semantic_payload_sha256: null;
      reason_codes: string[];
    };

export type CanonicalEvaluationStorageReadback = {
  canonical_identity: string;
  semantic_payload_sha256: string;
  persistence_envelope: CanonicalEvaluationPersistenceEnvelope;
};

export type CanonicalEvaluationStorageDryRunDiagnostic =
  | {
      status: "would_insert";
      ok: true;
      would_write: false;
      insert: CanonicalEvaluationStorageInsert;
      existing: null;
      reason_codes: [];
    }
  | {
      status: "idempotent_no_effect";
      ok: true;
      would_write: false;
      insert: CanonicalEvaluationStorageInsert;
      existing: CanonicalEvaluationStorageReadback;
      reason_codes: ["same_identity_same_semantic_payload"];
    }
  | {
      status: "semantic_conflict";
      ok: false;
      would_write: false;
      insert: CanonicalEvaluationStorageInsert;
      existing: CanonicalEvaluationStorageReadback;
      reason_codes: string[];
    }
  | {
      status: "rejected_unmappable";
      ok: false;
      would_write: false;
      insert: null;
      existing: CanonicalEvaluationStorageReadback | null;
      reason_codes: string[];
    };

export type CanonicalEvaluationWriterGateEnvironment = Partial<
  Record<
    | typeof CANONICAL_EVALUATION_WRITER_FEATURE_FLAG
    | typeof CANONICAL_EVALUATION_WRITER_KILL_SWITCH,
    string | undefined
  >
>;

export type CanonicalEvaluationWriterGate = {
  status: "open" | "feature_flag_disabled" | "kill_switch_engaged";
  open: boolean;
  feature_flag_enabled: boolean;
  kill_switch_engaged: boolean;
};

export type CanonicalEvaluationStorageDatabaseReadResult =
  | {
      status: "found";
      row: CanonicalEvaluationStorageReadback;
    }
  | {
      status: "not_found";
      row: null;
    }
  | {
      status: "error";
      row: null;
      error_code: string;
    };

export type CanonicalEvaluationStorageDatabaseInsertResult =
  | {
      status: "inserted";
    }
  | {
      status: "unique_conflict";
    }
  | {
      status: "error";
      error_code: string;
    };

export type CanonicalEvaluationStorageDatabase = {
  readByCanonicalIdentity(
    canonicalIdentity: string,
  ): Promise<CanonicalEvaluationStorageDatabaseReadResult>;
  insert(
    value: CanonicalEvaluationStorageInsert,
  ): Promise<CanonicalEvaluationStorageDatabaseInsertResult>;
};

export type CanonicalEvaluationStorageWriterOptions = {
  env?: CanonicalEvaluationWriterGateEnvironment;
  database?: CanonicalEvaluationStorageDatabase | null;
  databaseFactory?: () => CanonicalEvaluationStorageDatabase | null;
};

export type CanonicalEvaluationStorageWriterStatus =
  | "inserted"
  | "idempotent_no_effect"
  | "semantic_conflict"
  | "rejected_unmappable"
  | "feature_flag_disabled"
  | "kill_switch_engaged"
  | "service_unavailable"
  | "database_error";

export type CanonicalEvaluationStorageWriterResult = {
  status: CanonicalEvaluationStorageWriterStatus;
  ok: boolean;
  writer_version: typeof CANONICAL_EVALUATION_STORAGE_WRITER_VERSION;
  target_relation: typeof CANONICAL_EVALUATION_STORAGE_RELATION;
  canonical_identity: string | null;
  semantic_payload_sha256: string | null;
  feature_flag_enabled: boolean;
  kill_switch_engaged: boolean;
  database_read_performed: boolean;
  insert_attempted: boolean;
  inserted: boolean;
  overwritten: false;
  update_attempted: false;
  delete_attempted: false;
  provider_called: false;
  route_called: false;
  reason_codes: string[];
};

type SupabaseErrorLike = {
  code?: string | null;
};

type SupabaseReadResponse = {
  data: CanonicalEvaluationStorageReadback | null;
  error: SupabaseErrorLike | null;
};

type SupabaseInsertResponse = {
  error: SupabaseErrorLike | null;
};

type CanonicalEvaluationSupabaseClient = {
  from(table: typeof CANONICAL_EVALUATION_STORAGE_RELATION): {
    select(
      columns: "canonical_identity,semantic_payload_sha256,persistence_envelope",
    ): {
      eq(column: "canonical_identity", value: string): {
        maybeSingle(): PromiseLike<SupabaseReadResponse>;
      };
    };
    insert(
      value: CanonicalEvaluationStorageInsert,
    ): PromiseLike<SupabaseInsertResponse>;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function canonicalJsonValue(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("canonical JSON does not accept non-finite numbers");
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => canonicalJsonValue(item));
  }

  if (!isRecord(value)) {
    throw new TypeError("canonical JSON accepts only JSON-compatible values");
  }

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalJsonValue(value[key])]),
  );
}

export function serializeCanonicalEvaluationSemanticPayload(
  envelope: CanonicalEvaluationPersistenceEnvelope,
): string {
  return JSON.stringify(canonicalJsonValue(envelope));
}

export function digestCanonicalEvaluationSemanticPayload(
  envelope: CanonicalEvaluationPersistenceEnvelope,
): string {
  return createHash("sha256")
    .update(serializeCanonicalEvaluationSemanticPayload(envelope), "utf8")
    .digest("hex");
}

export function verifyCanonicalEvaluationStorageInsertDigest(
  insert: CanonicalEvaluationStorageInsert,
) {
  return (
    fullSha256(insert.semantic_payload_sha256) &&
    digestCanonicalEvaluationSemanticPayload(insert.persistence_envelope) ===
      insert.semantic_payload_sha256
  );
}

export function verifyCanonicalEvaluationStorageReadbackDigest(
  readback: CanonicalEvaluationStorageReadback,
) {
  return (
    fullSha256(readback.semantic_payload_sha256) &&
    readback.persistence_envelope.canonical_identity ===
      readback.canonical_identity &&
    digestCanonicalEvaluationSemanticPayload(readback.persistence_envelope) ===
      readback.semantic_payload_sha256
  );
}

function fullSha256(value: string) {
  return /^[a-f0-9]{64}$/.test(value);
}

function buildInsert(
  payload: CanonicalEvaluationStoragePayload,
): CanonicalEvaluationStorageInsert {
  const envelope = structuredClone(payload.envelope_json);

  return {
    storage_contract_version: payload.storage_contract_version,
    envelope_contract_version: envelope.contract_version,
    lineage_contract_version: CANONICAL_EVALUATION_LINEAGE_CONTRACT_VERSION,
    canonical_identity: payload.canonical_identity,
    semantic_payload_sha256:
      digestCanonicalEvaluationSemanticPayload(envelope),
    idempotency_key: payload.idempotency_key,
    producer_decision_id: payload.producer_decision_id,
    source_namespace: payload.source_namespace,
    decision_timestamp: payload.decision_timestamp,
    decision_kind: payload.decision_kind,
    sample_type: payload.sample_type,
    candidate_id: payload.candidate_id,
    scan_run_id: payload.scan_run_id,
    scan_run_fingerprint: payload.scan_run_fingerprint,
    batch_id: payload.batch_id,
    batch_fingerprint: payload.batch_fingerprint,
    snapshot_id: payload.snapshot_id,
    snapshot_fingerprint: payload.snapshot_fingerprint,
    recommendation_id: payload.recommendation_id,
    numeric_confidence: payload.numeric_confidence,
    confidence_label: payload.confidence_label,
    engine_version: payload.engine_version,
    scoring_version: payload.scoring_version,
    ranking_version: payload.ranking_version,
    setup_taxonomy_version: payload.setup_taxonomy_version,
    confidence_contract_version: payload.confidence_contract_version,
    evaluator_version: payload.evaluator_version,
    provider_contract_version: payload.provider_contract_version,
    git_commit: payload.git_commit,
    build_identity: payload.build_identity,
    regime_at_decision: payload.regime_at_decision,
    sector_at_decision: payload.sector_at_decision,
    provider: payload.provider,
    provider_source_timestamp: payload.provider_source_timestamp,
    freshness: payload.freshness,
    candle_interval: payload.candle_interval,
    expected_candle_count: payload.expected_candle_count,
    observed_candle_count: payload.observed_candle_count,
    coverage_reason_codes: [...payload.coverage_reason_codes],
    evaluator_input_identity: payload.evaluator_input_identity,
    primary_horizon: payload.primary_horizon,
    primary_outcome_id: payload.primary_outcome_id,
    diagnostic_outcome_ids: [...payload.diagnostic_outcome_ids],
    reproducible: envelope.evaluation.reproducible,
    quality_metrics_eligible: envelope.evaluation.quality_metrics_eligible,
    lineage_json: structuredClone(payload.lineage_json),
    versions_json: structuredClone(payload.versions_json),
    decision_context_json: structuredClone(payload.decision_context_json),
    provider_context_json: structuredClone(payload.provider_context_json),
    evaluation_json: structuredClone(payload.evaluation_json),
    replay_metadata_json: payload.replay_metadata_json
      ? structuredClone(payload.replay_metadata_json)
      : null,
    diagnostic_horizons_json: structuredClone(
      payload.evaluation_json.horizons,
    ),
    persistence_envelope: envelope,
  };
}

export function validateCanonicalEvaluationStorageWritePayload(
  input: unknown,
): CanonicalEvaluationStoragePayloadValidation {
  let candidate: CanonicalEvaluationStoragePayload;

  try {
    candidate = structuredClone(input) as CanonicalEvaluationStoragePayload;
  } catch {
    return {
      status: "rejected_unmappable",
      ok: false,
      payload: null,
      insert: null,
      semantic_payload_sha256: null,
      reason_codes: ["payload_not_structured_cloneable"],
    };
  }

  if (!isRecord(candidate) || !isRecord(candidate.envelope_json)) {
    return {
      status: "rejected_unmappable",
      ok: false,
      payload: null,
      insert: null,
      semantic_payload_sha256: null,
      reason_codes: ["canonical_envelope_missing"],
    };
  }

  try {
    const rebuilt = buildCanonicalEvaluationStoragePayload(
      candidate.envelope_json,
    );

    if (!rebuilt.value || rebuilt.status !== "ready") {
      return {
        status: "rejected_unmappable",
        ok: false,
        payload: null,
        insert: null,
        semantic_payload_sha256: null,
        reason_codes: [
          "canonical_envelope_not_ready",
          ...rebuilt.diagnostics.map((item) => item.code),
        ].sort(),
      };
    }

    if (
      serializeCanonicalEvaluationSemanticPayload(
        rebuilt.value.envelope_json,
      ) !== serializeCanonicalEvaluationSemanticPayload(candidate.envelope_json)
    ) {
      return {
        status: "rejected_unmappable",
        ok: false,
        payload: null,
        insert: null,
        semantic_payload_sha256: null,
        reason_codes: ["canonical_envelope_rebuild_mismatch"],
      };
    }

    if (
      JSON.stringify(canonicalJsonValue(rebuilt.value)) !==
      JSON.stringify(canonicalJsonValue(candidate))
    ) {
      return {
        status: "rejected_unmappable",
        ok: false,
        payload: null,
        insert: null,
        semantic_payload_sha256: null,
        reason_codes: ["storage_projection_tampered"],
      };
    }

    const payload = structuredClone(rebuilt.value);
    const insert = buildInsert(payload);

    return {
      status: "ready",
      ok: true,
      payload,
      insert,
      semantic_payload_sha256: insert.semantic_payload_sha256,
      reason_codes: [],
    };
  } catch {
    return {
      status: "rejected_unmappable",
      ok: false,
      payload: null,
      insert: null,
      semantic_payload_sha256: null,
      reason_codes: ["canonical_payload_validation_failed_closed"],
    };
  }
}

export function diagnoseCanonicalEvaluationStorageWrite(
  input: unknown,
  existing: CanonicalEvaluationStorageReadback | null,
): CanonicalEvaluationStorageDryRunDiagnostic {
  const validation = validateCanonicalEvaluationStorageWritePayload(input);

  if (!validation.ok) {
    return {
      status: "rejected_unmappable",
      ok: false,
      would_write: false,
      insert: null,
      existing: existing ? { ...existing } : null,
      reason_codes: [...validation.reason_codes],
    };
  }

  if (!existing) {
    return {
      status: "would_insert",
      ok: true,
      would_write: false,
      insert: structuredClone(validation.insert),
      existing: null,
      reason_codes: [],
    };
  }

  const readback = { ...existing };
  if (!verifyCanonicalEvaluationStorageReadbackDigest(readback)) {
    return {
      status: "semantic_conflict",
      ok: false,
      would_write: false,
      insert: structuredClone(validation.insert),
      existing: structuredClone(readback),
      reason_codes: ["stored_envelope_digest_mismatch"],
    };
  }
  if (
    readback.canonical_identity === validation.insert.canonical_identity &&
    readback.semantic_payload_sha256 ===
      validation.insert.semantic_payload_sha256
  ) {
    return {
      status: "idempotent_no_effect",
      ok: true,
      would_write: false,
      insert: structuredClone(validation.insert),
      existing: readback,
      reason_codes: ["same_identity_same_semantic_payload"],
    };
  }

  return {
    status: "semantic_conflict",
    ok: false,
    would_write: false,
    insert: structuredClone(validation.insert),
    existing: readback,
    reason_codes: ["same_identity_different_semantic_payload"],
  };
}

export function resolveCanonicalEvaluationWriterGate(
  env: CanonicalEvaluationWriterGateEnvironment =
    process.env as CanonicalEvaluationWriterGateEnvironment,
): CanonicalEvaluationWriterGate {
  const featureFlagEnabled =
    env[CANONICAL_EVALUATION_WRITER_FEATURE_FLAG] === "true";
  const killSwitchEngaged =
    env[CANONICAL_EVALUATION_WRITER_KILL_SWITCH] !== "false";

  if (!featureFlagEnabled) {
    return {
      status: "feature_flag_disabled",
      open: false,
      feature_flag_enabled: false,
      kill_switch_engaged: killSwitchEngaged,
    };
  }

  if (killSwitchEngaged) {
    return {
      status: "kill_switch_engaged",
      open: false,
      feature_flag_enabled: true,
      kill_switch_engaged: true,
    };
  }

  return {
    status: "open",
    open: true,
    feature_flag_enabled: true,
    kill_switch_engaged: false,
  };
}

function baseWriterResult(
  validation: CanonicalEvaluationStoragePayloadValidation,
  gate: CanonicalEvaluationWriterGate,
): Omit<
  CanonicalEvaluationStorageWriterResult,
  "status" | "ok" | "reason_codes"
> {
  return {
    writer_version: CANONICAL_EVALUATION_STORAGE_WRITER_VERSION,
    target_relation: CANONICAL_EVALUATION_STORAGE_RELATION,
    canonical_identity: validation.ok
      ? validation.insert.canonical_identity
      : null,
    semantic_payload_sha256: validation.ok
      ? validation.semantic_payload_sha256
      : null,
    feature_flag_enabled: gate.feature_flag_enabled,
    kill_switch_engaged: gate.kill_switch_engaged,
    database_read_performed: false,
    insert_attempted: false,
    inserted: false,
    overwritten: false,
    update_attempted: false,
    delete_attempted: false,
    provider_called: false,
    route_called: false,
  };
}

function sanitizeDatabaseErrorCode(value: unknown): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(value)) {
    return "database_error";
  }
  return value;
}

export function createCanonicalEvaluationSupabaseDatabase(
  client: CanonicalEvaluationSupabaseClient,
): CanonicalEvaluationStorageDatabase {
  return {
    async readByCanonicalIdentity(canonicalIdentity) {
      const { data, error } = await client
        .from(CANONICAL_EVALUATION_STORAGE_RELATION)
        .select(
          "canonical_identity,semantic_payload_sha256,persistence_envelope",
        )
        .eq("canonical_identity", canonicalIdentity)
        .maybeSingle();

      if (error) {
        return {
          status: "error",
          row: null,
          error_code: sanitizeDatabaseErrorCode(error.code),
        };
      }

      if (!data) {
        return { status: "not_found", row: null };
      }

      return {
        status: "found",
        row: {
          canonical_identity: data.canonical_identity,
          semantic_payload_sha256: data.semantic_payload_sha256,
          persistence_envelope: structuredClone(data.persistence_envelope),
        },
      };
    },

    async insert(value) {
      const { error } = await client
        .from(CANONICAL_EVALUATION_STORAGE_RELATION)
        .insert(value);

      if (!error) {
        return { status: "inserted" };
      }

      if (error.code === "23505") {
        return { status: "unique_conflict" };
      }

      return {
        status: "error",
        error_code: sanitizeDatabaseErrorCode(error.code),
      };
    },
  };
}

function defaultCanonicalEvaluationStorageDatabase():
  CanonicalEvaluationStorageDatabase | null {
  const { client } = getServerSupabaseClient();
  if (!client) return null;

  return createCanonicalEvaluationSupabaseDatabase(
    client as unknown as CanonicalEvaluationSupabaseClient,
  );
}

export async function writeCanonicalEvaluationStorage(
  input: unknown,
  options: CanonicalEvaluationStorageWriterOptions = {},
): Promise<CanonicalEvaluationStorageWriterResult> {
  const validation = validateCanonicalEvaluationStorageWritePayload(input);
  const gate = resolveCanonicalEvaluationWriterGate(options.env);
  const base = baseWriterResult(validation, gate);

  if (!validation.ok) {
    return {
      ...base,
      status: "rejected_unmappable",
      ok: false,
      reason_codes: [...validation.reason_codes],
    };
  }

  if (gate.status === "feature_flag_disabled") {
    return {
      ...base,
      status: "feature_flag_disabled",
      ok: false,
      reason_codes: ["writer_feature_flag_disabled"],
    };
  }

  if (gate.status === "kill_switch_engaged") {
    return {
      ...base,
      status: "kill_switch_engaged",
      ok: false,
      reason_codes: ["writer_kill_switch_engaged"],
    };
  }

  if (!verifyCanonicalEvaluationStorageInsertDigest(validation.insert)) {
    return {
      ...base,
      status: "rejected_unmappable",
      ok: false,
      reason_codes: ["application_preinsert_digest_recomputation_failed"],
    };
  }

  const database =
    options.database ??
    options.databaseFactory?.() ??
    defaultCanonicalEvaluationStorageDatabase();

  if (!database) {
    return {
      ...base,
      status: "service_unavailable",
      ok: false,
      reason_codes: ["service_role_database_unavailable"],
    };
  }

  const firstRead = await database.readByCanonicalIdentity(
    validation.insert.canonical_identity,
  );
  const readBase = { ...base, database_read_performed: true };

  if (firstRead.status === "error") {
    return {
      ...readBase,
      status: "database_error",
      ok: false,
      reason_codes: [firstRead.error_code],
    };
  }

  const diagnostic = diagnoseCanonicalEvaluationStorageWrite(
    validation.payload,
    firstRead.row,
  );

  if (diagnostic.status === "idempotent_no_effect") {
    return {
      ...readBase,
      status: "idempotent_no_effect",
      ok: true,
      reason_codes: [...diagnostic.reason_codes],
    };
  }

  if (diagnostic.status === "semantic_conflict") {
    return {
      ...readBase,
      status: "semantic_conflict",
      ok: false,
      reason_codes: [...diagnostic.reason_codes],
    };
  }

  if (diagnostic.status !== "would_insert") {
    return {
      ...readBase,
      status: "rejected_unmappable",
      ok: false,
      reason_codes: [...diagnostic.reason_codes],
    };
  }

  const insertResult = await database.insert(
    structuredClone(validation.insert),
  );
  const insertBase = { ...readBase, insert_attempted: true };

  if (insertResult.status === "inserted") {
    return {
      ...insertBase,
      status: "inserted",
      ok: true,
      inserted: true,
      reason_codes: [],
    };
  }

  if (insertResult.status === "error") {
    return {
      ...insertBase,
      status: "database_error",
      ok: false,
      reason_codes: [insertResult.error_code],
    };
  }

  const collisionRead = await database.readByCanonicalIdentity(
    validation.insert.canonical_identity,
  );

  if (collisionRead.status === "error") {
    return {
      ...insertBase,
      status: "database_error",
      ok: false,
      reason_codes: [collisionRead.error_code],
    };
  }

  const collisionDiagnostic = diagnoseCanonicalEvaluationStorageWrite(
    validation.payload,
    collisionRead.row,
  );

  if (collisionDiagnostic.status === "idempotent_no_effect") {
    return {
      ...insertBase,
      status: "idempotent_no_effect",
      ok: true,
      reason_codes: [
        "unique_race_resolved",
        ...collisionDiagnostic.reason_codes,
      ].sort(),
    };
  }

  if (collisionDiagnostic.status === "semantic_conflict") {
    return {
      ...insertBase,
      status: "semantic_conflict",
      ok: false,
      reason_codes: [
        "unique_race_resolved",
        ...collisionDiagnostic.reason_codes,
      ].sort(),
    };
  }

  return {
    ...insertBase,
    status: "database_error",
    ok: false,
    reason_codes: ["unique_conflict_without_readback"],
  };
}
