import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildCanonicalEvaluationStoragePayload,
  type CanonicalEvaluationPersistenceEnvelope,
  type CanonicalPersistenceResult,
} from "@/lib/canonical-evaluation-persistence-contract";
import {
  action664cHistoricalEnvelopeResult,
  action664cNoTradeEnvelopeResult,
  action664cRejectedEnvelopeResult,
  action664cResearchEnvelopeResult,
  action664cShadowEnvelopeResult,
  action664cVisibleEnvelopeResult,
} from "@/lib/canonical-evaluation-persistence-fixtures";
import {
  CANONICAL_EVALUATION_WRITER_FEATURE_FLAG,
  CANONICAL_EVALUATION_WRITER_KILL_SWITCH,
  createCanonicalEvaluationSupabaseDatabase,
  diagnoseCanonicalEvaluationStorageWrite,
  digestCanonicalEvaluationSemanticPayload,
  resolveCanonicalEvaluationWriterGate,
  serializeCanonicalEvaluationSemanticPayload,
  validateCanonicalEvaluationStorageWritePayload,
  writeCanonicalEvaluationStorage,
  type CanonicalEvaluationStorageDatabase,
  type CanonicalEvaluationStorageDatabaseInsertResult,
  type CanonicalEvaluationStorageDatabaseReadResult,
  type CanonicalEvaluationStorageInsert,
  type CanonicalEvaluationStorageReadback,
} from "@/lib/server/canonical-evaluation-storage-writer";

const migrationPath =
  "supabase/migrations/20260726001000_create_canonical_evaluation_decisions.sql";
const migration = readFileSync(migrationPath, "utf8");

const envelopeResults = [
  action664cVisibleEnvelopeResult,
  action664cResearchEnvelopeResult,
  action664cShadowEnvelopeResult,
  action664cHistoricalEnvelopeResult,
  action664cRejectedEnvelopeResult,
  action664cNoTradeEnvelopeResult,
] as const;

function readyEnvelope(
  result: CanonicalPersistenceResult<CanonicalEvaluationPersistenceEnvelope>,
) {
  expect(result.status).toBe("ready");
  expect(result.value).not.toBeNull();
  return structuredClone(result.value!);
}

function readyStorage(
  result: CanonicalPersistenceResult<CanonicalEvaluationPersistenceEnvelope>,
) {
  const storage = buildCanonicalEvaluationStoragePayload(
    readyEnvelope(result),
  );
  expect(storage.status).toBe("ready");
  expect(storage.value).not.toBeNull();
  return structuredClone(storage.value!);
}

const enabledEnvironment = {
  [CANONICAL_EVALUATION_WRITER_FEATURE_FLAG]: "true",
  [CANONICAL_EVALUATION_WRITER_KILL_SWITCH]: "false",
} as const;

class MemoryDatabase implements CanonicalEvaluationStorageDatabase {
  readonly rows = new Map<string, CanonicalEvaluationStorageReadback>();
  readCount = 0;
  insertCount = 0;

  async readByCanonicalIdentity(
    canonicalIdentity: string,
  ): Promise<CanonicalEvaluationStorageDatabaseReadResult> {
    this.readCount += 1;
    const row = this.rows.get(canonicalIdentity);
    return row
      ? { status: "found", row: { ...row } }
      : { status: "not_found", row: null };
  }

  async insert(
    value: CanonicalEvaluationStorageInsert,
  ): Promise<CanonicalEvaluationStorageDatabaseInsertResult> {
    this.insertCount += 1;
    if (this.rows.has(value.canonical_identity)) {
      return { status: "unique_conflict" };
    }
    this.rows.set(value.canonical_identity, {
      canonical_identity: value.canonical_identity,
      semantic_payload_sha256: value.semantic_payload_sha256,
      persistence_envelope: structuredClone(value.persistence_envelope),
    });
    return { status: "inserted" };
  }
}

function filesRecursively(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory() ? filesRecursively(path) : [path];
  });
}

test("migration version is singular and documents the separate Track 1 reservation", () => {
  const migrations = readdirSync("supabase/migrations").filter((name) =>
    name.startsWith("20260726001000"),
  );

  expect(migrations).toEqual([
    "20260726001000_create_canonical_evaluation_decisions.sql",
  ]);
  expect(migration).toContain(
    "Track 1 separately reserves\n-- the immediately preceding version 20260726000000",
  );
});

test("migration creates the hybrid one-row-per-decision storage model", () => {
  expect(migration).toContain(
    "create table public.canonical_evaluation_decisions",
  );
  expect(migration).toContain("persistence_envelope jsonb not null");
  expect(migration).toContain("diagnostic_horizons_json jsonb not null");
  expect(migration).toContain(
    "diagnostic_horizons_json = evaluation_json -> 'horizons'",
  );
  expect(migration).not.toMatch(
    /create table public\.canonical_evaluation_(?:outcomes|horizons)/,
  );
});

test("migration is server-owned, RLS-contained, zero-policy, and append-only", () => {
  expect(migration).toContain(
    "alter table public.canonical_evaluation_decisions owner to postgres",
  );
  expect(migration).toContain(
    "alter table public.canonical_evaluation_decisions enable row level security",
  );
  expect(migration).not.toMatch(/\bcreate policy\b/i);
  expect(migration).toContain(
    "revoke all privileges on table public.canonical_evaluation_decisions",
  );
  expect(migration).toContain(
    "from public, anon, authenticated, service_role",
  );
  expect(migration).toContain(
    "grant select, insert on table public.canonical_evaluation_decisions",
  );
  expect(migration).not.toMatch(
    /grant\s+(?:[^;]*\bupdate\b|[^;]*\bdelete\b)[^;]*canonical_evaluation_decisions/i,
  );
  expect(migration).toContain(
    "before update or delete on public.canonical_evaluation_decisions",
  );
});

test("migration constrains identity, samples, confidence, versions, lineage, and envelope", () => {
  for (const constraint of [
    "ce_decisions_identity_ck",
    "ce_decisions_identity_unique",
    "ce_decisions_sample_type_ck",
    "ce_decisions_confidence_ck",
    "ce_decisions_git_commit_ck",
    "ce_decisions_coverage_ck",
    "ce_decisions_quality_versions_ck",
    "ce_decisions_lineage_ck",
    "ce_decisions_envelope_consistency_ck",
  ]) {
    expect(migration).toContain(`constraint ${constraint}`);
  }

  for (const sampleType of [
    "visible",
    "research_only",
    "shadow",
    "historical_synthetic",
    "rejected_candidate",
    "no_trade",
  ]) {
    expect(migration).toContain(`'${sampleType}'`);
  }
});

test("migration provides bounded query and idempotency indexes", () => {
  for (const index of [
    "ce_decisions_evaluator_input_uidx",
    "ce_decisions_decision_timestamp_idx",
    "ce_decisions_sample_timestamp_idx",
    "ce_decisions_candidate_idx",
    "ce_decisions_scan_run_idx",
    "ce_decisions_batch_idx",
    "ce_decisions_snapshot_idx",
    "ce_decisions_recommendation_idx",
    "ce_decisions_lineage_gin_idx",
    "ce_decisions_horizons_gin_idx",
  ]) {
    expect(migration).toContain(`index ${index}`);
  }
});

test("all six ready Action 664C sample types build deterministic inserts", () => {
  const validations = envelopeResults.map((result) =>
    validateCanonicalEvaluationStorageWritePayload(readyStorage(result)),
  );

  expect(validations.map((item) => item.status)).toEqual(
    Array(6).fill("ready"),
  );
  expect(
    validations.map((item) => item.ok && item.insert.sample_type),
  ).toEqual([
    "visible",
    "research_only",
    "shadow",
    "historical_synthetic",
    "rejected_candidate",
    "no_trade",
  ]);
  expect(
    validations.every(
      (item) =>
        item.ok &&
        /^[0-9a-f]{64}$/.test(item.semantic_payload_sha256) &&
        item.insert.persistence_envelope.contract_version ===
          "canonical_evaluation_persistence_v1",
    ),
  ).toBe(true);
});

test("semantic serialization is deterministic and does not mutate input", () => {
  const envelope = readyEnvelope(action664cVisibleEnvelopeResult);
  const before = structuredClone(envelope);
  const reordered = Object.fromEntries(
    Object.entries(envelope).reverse(),
  ) as CanonicalEvaluationPersistenceEnvelope;

  expect(serializeCanonicalEvaluationSemanticPayload(envelope)).toBe(
    serializeCanonicalEvaluationSemanticPayload(reordered),
  );
  expect(digestCanonicalEvaluationSemanticPayload(envelope)).toBe(
    digestCanonicalEvaluationSemanticPayload(reordered),
  );
  expect(envelope).toEqual(before);
});

test("tampered and non-ready payloads fail closed", () => {
  const payload = readyStorage(action664cVisibleEnvelopeResult);
  const tampered = structuredClone(payload);
  tampered.numeric_confidence = 0.01;

  expect(validateCanonicalEvaluationStorageWritePayload(tampered)).toMatchObject({
    status: "rejected_unmappable",
    reason_codes: ["storage_projection_tampered"],
  });
  expect(
    validateCanonicalEvaluationStorageWritePayload({ sample_type: "visible" }),
  ).toMatchObject({
    status: "rejected_unmappable",
    reason_codes: ["canonical_envelope_missing"],
  });
});

test("dry-run/readback diagnostics distinguish insert, no-effect, and conflict", () => {
  const payload = readyStorage(action664cVisibleEnvelopeResult);
  const validation = validateCanonicalEvaluationStorageWritePayload(payload);
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;

  expect(diagnoseCanonicalEvaluationStorageWrite(payload, null).status).toBe(
    "would_insert",
  );
  expect(
    diagnoseCanonicalEvaluationStorageWrite(payload, {
      canonical_identity: validation.insert.canonical_identity,
      semantic_payload_sha256: validation.insert.semantic_payload_sha256,
      persistence_envelope: structuredClone(
        validation.insert.persistence_envelope,
      ),
    }).status,
  ).toBe("idempotent_no_effect");
  expect(
    diagnoseCanonicalEvaluationStorageWrite(payload, {
      canonical_identity: validation.insert.canonical_identity,
      semantic_payload_sha256: "0".repeat(64),
      persistence_envelope: structuredClone(
        validation.insert.persistence_envelope,
      ),
    }).status,
  ).toBe("semantic_conflict");
});

test("writer is locked by default and does not create a database client", async () => {
  let databaseFactoryCalls = 0;
  const result = await writeCanonicalEvaluationStorage(
    readyStorage(action664cVisibleEnvelopeResult),
    {
      env: {},
      databaseFactory: () => {
        databaseFactoryCalls += 1;
        return new MemoryDatabase();
      },
    },
  );

  expect(resolveCanonicalEvaluationWriterGate({})).toEqual({
    status: "feature_flag_disabled",
    open: false,
    feature_flag_enabled: false,
    kill_switch_engaged: true,
  });
  expect(result).toMatchObject({
    status: "feature_flag_disabled",
    database_read_performed: false,
    insert_attempted: false,
    inserted: false,
  });
  expect(databaseFactoryCalls).toBe(0);
});

test("kill switch independently blocks an enabled feature flag", async () => {
  let databaseFactoryCalls = 0;
  const result = await writeCanonicalEvaluationStorage(
    readyStorage(action664cVisibleEnvelopeResult),
    {
      env: {
        [CANONICAL_EVALUATION_WRITER_FEATURE_FLAG]: "true",
      },
      databaseFactory: () => {
        databaseFactoryCalls += 1;
        return new MemoryDatabase();
      },
    },
  );

  expect(result).toMatchObject({
    status: "kill_switch_engaged",
    feature_flag_enabled: true,
    kill_switch_engaged: true,
    database_read_performed: false,
    insert_attempted: false,
  });
  expect(databaseFactoryCalls).toBe(0);
});

test("enabled writer requires an explicitly injected database", async () => {
  const result = await writeCanonicalEvaluationStorage(
    readyStorage(action664cVisibleEnvelopeResult),
    { env: enabledEnvironment },
  );

  expect(result).toMatchObject({
    status: "service_unavailable",
    database_read_performed: false,
    insert_attempted: false,
    inserted: false,
    reason_codes: ["service_role_database_unavailable"],
  });

  const source = readFileSync(
    "lib/server/canonical-evaluation-storage-writer.ts",
    "utf8",
  );
  expect(source).not.toMatch(/getServerSupabaseClient|defaultCanonicalEvaluationStorageDatabase/);
  expect(source).toContain("options.databaseFactory?.()");
});

test("enabled writer fails closed when an injected database factory throws", async () => {
  let databaseFactoryCalls = 0;
  const result = await writeCanonicalEvaluationStorage(
    readyStorage(action664cVisibleEnvelopeResult),
    {
      env: enabledEnvironment,
      databaseFactory: () => {
        databaseFactoryCalls += 1;
        throw new Error("test-only database factory failure");
      },
    },
  );

  expect(result).toMatchObject({
    status: "service_unavailable",
    database_read_performed: false,
    insert_attempted: false,
    inserted: false,
    reason_codes: ["service_role_database_unavailable"],
  });
  expect(databaseFactoryCalls).toBe(1);
});

test("enabled local writer inserts once and treats exact retry as no-effect", async () => {
  const database = new MemoryDatabase();
  const payload = readyStorage(action664cVisibleEnvelopeResult);
  const first = await writeCanonicalEvaluationStorage(payload, {
    env: enabledEnvironment,
    database,
  });
  const second = await writeCanonicalEvaluationStorage(payload, {
    env: enabledEnvironment,
    database,
  });

  expect(first).toMatchObject({
    status: "inserted",
    inserted: true,
    insert_attempted: true,
    overwritten: false,
  });
  expect(second).toMatchObject({
    status: "idempotent_no_effect",
    inserted: false,
    insert_attempted: false,
    overwritten: false,
  });
  expect(database.insertCount).toBe(1);
  expect(database.rows.size).toBe(1);
});

test("same identity with different valid semantics is an explicit conflict", async () => {
  const database = new MemoryDatabase();
  const firstPayload = readyStorage(action664cVisibleEnvelopeResult);
  const changedEnvelope = structuredClone(firstPayload.envelope_json);
  changedEnvelope.decision_context.reason_codes = [
    ...changedEnvelope.decision_context.reason_codes,
    "semantic-change-fixture",
  ].sort();
  const changedPayloadResult =
    buildCanonicalEvaluationStoragePayload(changedEnvelope);
  expect(changedPayloadResult.status).toBe("ready");
  const changedPayload = changedPayloadResult.value!;

  await writeCanonicalEvaluationStorage(firstPayload, {
    env: enabledEnvironment,
    database,
  });
  const conflict = await writeCanonicalEvaluationStorage(changedPayload, {
    env: enabledEnvironment,
    database,
  });

  expect(conflict).toMatchObject({
    status: "semantic_conflict",
    inserted: false,
    insert_attempted: false,
    overwritten: false,
    reason_codes: ["same_identity_different_semantic_payload"],
  });
  expect(database.insertCount).toBe(1);
  expect(database.rows.size).toBe(1);
});

test("unique race is read back and resolved without overwrite", async () => {
  const payload = readyStorage(action664cVisibleEnvelopeResult);
  const validation = validateCanonicalEvaluationStorageWritePayload(payload);
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;

  let reads = 0;
  const database: CanonicalEvaluationStorageDatabase = {
    async readByCanonicalIdentity() {
      reads += 1;
      if (reads === 1) return { status: "not_found", row: null };
      return {
        status: "found",
        row: {
          canonical_identity: validation.insert.canonical_identity,
          semantic_payload_sha256: validation.insert.semantic_payload_sha256,
          persistence_envelope: structuredClone(
            validation.insert.persistence_envelope,
          ),
        },
      };
    },
    async insert() {
      return { status: "unique_conflict" };
    },
  };

  const result = await writeCanonicalEvaluationStorage(payload, {
    env: enabledEnvironment,
    database,
  });

  expect(result).toMatchObject({
    status: "idempotent_no_effect",
    insert_attempted: true,
    inserted: false,
    overwritten: false,
  });
  expect(result.reason_codes).toEqual([
    "same_identity_same_semantic_payload",
    "unique_race_resolved",
  ]);
});

test("Supabase adapter exposes SELECT and INSERT only", async () => {
  const operations: string[] = [];
  const client = {
    from(table: string) {
      operations.push(`from:${table}`);
      return {
        select(columns: string) {
          operations.push(`select:${columns}`);
          return {
            eq(column: string, value: string) {
              operations.push(`eq:${column}:${value}`);
              return {
                async maybeSingle() {
                  return { data: null, error: null };
                },
              };
            },
          };
        },
        async insert() {
          operations.push("insert");
          return { error: null };
        },
      };
    },
  };

  const database = createCanonicalEvaluationSupabaseDatabase(
    client as Parameters<typeof createCanonicalEvaluationSupabaseDatabase>[0],
  );
  const payload = readyStorage(action664cVisibleEnvelopeResult);
  const validation = validateCanonicalEvaluationStorageWritePayload(payload);
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;

  await database.readByCanonicalIdentity(validation.insert.canonical_identity);
  await database.insert(validation.insert);

  expect(operations).toEqual([
    "from:canonical_evaluation_decisions",
    "select:canonical_identity,semantic_payload_sha256,persistence_envelope",
    `eq:canonical_identity:${validation.insert.canonical_identity}`,
    "from:canonical_evaluation_decisions",
    "insert",
  ]);
  expect(JSON.stringify(operations)).not.toMatch(/update|delete/i);
});

test("no live consumer imports the Action 664D writer", () => {
  const inactiveReadinessImporters = new Set([
    "lib/canonical-evaluation-quality-read-model-fixtures.ts",
    "lib/server/canonical-evaluation-capture-orchestrator.ts",
    "lib/server/canonical-evaluation-quality-read-model.ts",
  ]);
  const matches = [...filesRecursively("app"), ...filesRecursively("lib")]
    .filter((path) => /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(path))
    .filter(
      (path) =>
        path !== "lib/server/canonical-evaluation-storage-writer.ts" &&
        !inactiveReadinessImporters.has(path) &&
        readFileSync(path, "utf8").includes(
          "canonical-evaluation-storage-writer",
        ),
    );

  expect(matches).toEqual([]);
});

test("local PostgreSQL harness is scoped to Docker and an immutable pre-target baseline", () => {
  const harness = readFileSync(
    "scripts/action-664d-local-postgres-matrix.mjs",
    "utf8",
  );

  expect(harness).toContain('"postgres:16-alpine"');
  expect(harness).toContain('const baselineCommit = "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33"');
  expect(harness).toContain('["cat-file", "-e", `${baselineCommit}^{commit}`]');
  expect(harness).toContain('["show", `${baselineCommit}:${path}`]');
  expect(harness).toContain("20260726001000_create_canonical_evaluation_decisions.sql");
  expect(harness).toContain("production_interaction: false");
  expect(harness).not.toContain("origin/main");
  expect(harness).not.toMatch(/supabase\s+(?:db|migration|link|push)/i);
  expect(harness).not.toMatch(/postgres(?:ql)?:\/\//i);
});
