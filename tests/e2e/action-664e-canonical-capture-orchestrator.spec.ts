import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import {
  action664eBrokenLineageInput,
  action664eDuplicateHorizonInput,
  action664eMissingDecisionInput,
  action664eProviderGapInput,
  action664eResearchInput,
  action664eSampleConflictInput,
  action664eSemanticCollisionInput,
  action664eVisibleInput,
} from "@/lib/canonical-evaluation-capture-fixtures";
import {
  captureCompletedRecommendationOutcomeBundle,
  executeCanonicalEvaluationCapturePlan,
  prepareCompletedRecommendationOutcomeCapture,
  type CanonicalEvaluationCaptureDatabase,
  type CanonicalEvaluationCaptureReadbackResult,
} from "@/lib/server/canonical-evaluation-capture-orchestrator";
import {
  CANONICAL_EVALUATION_WRITER_FEATURE_FLAG,
  CANONICAL_EVALUATION_WRITER_KILL_SWITCH,
  type CanonicalEvaluationStorageDatabaseInsertResult,
  type CanonicalEvaluationStorageDatabaseReadResult,
  type CanonicalEvaluationStorageInsert,
} from "@/lib/server/canonical-evaluation-storage-writer";

const enabledEnvironment = {
  [CANONICAL_EVALUATION_WRITER_FEATURE_FLAG]: "true",
  [CANONICAL_EVALUATION_WRITER_KILL_SWITCH]: "false",
} as const;

class MemoryCaptureDatabase implements CanonicalEvaluationCaptureDatabase {
  readonly scope = "disposable_local_postgres" as const;
  readonly rows = new Map<string, CanonicalEvaluationStorageInsert>();
  identityReads = 0;
  inserts = 0;
  fullReadbacks = 0;
  tamperReadback:
    | ((row: CanonicalEvaluationStorageInsert) => CanonicalEvaluationStorageInsert)
    | null = null;

  async readByCanonicalIdentity(
    canonicalIdentity: string,
  ): Promise<CanonicalEvaluationStorageDatabaseReadResult> {
    this.identityReads += 1;
    const row = this.rows.get(canonicalIdentity);
    return row
      ? {
          status: "found",
          row: {
            canonical_identity: row.canonical_identity,
            semantic_payload_sha256: row.semantic_payload_sha256,
            persistence_envelope: structuredClone(
              row.persistence_envelope,
            ),
          },
        }
      : { status: "not_found", row: null };
  }

  async insert(
    value: CanonicalEvaluationStorageInsert,
  ): Promise<CanonicalEvaluationStorageDatabaseInsertResult> {
    this.inserts += 1;
    if (this.rows.has(value.canonical_identity)) {
      return { status: "unique_conflict" };
    }
    this.rows.set(value.canonical_identity, structuredClone(value));
    return { status: "inserted" };
  }

  async readCanonicalEvaluation(
    canonicalIdentity: string,
  ): Promise<CanonicalEvaluationCaptureReadbackResult> {
    this.fullReadbacks += 1;
    const row = this.rows.get(canonicalIdentity);
    if (!row) return { status: "not_found", row: null };
    const readback = structuredClone(row);
    return {
      status: "found",
      row: this.tamperReadback
        ? this.tamperReadback(readback)
        : readback,
    };
  }
}

function allFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory() ? allFiles(path) : [path];
  });
}

test("visible completed bundle prepares the full B→C→D chain without horizon inflation", () => {
  const before = structuredClone(action664eVisibleInput);
  const result = prepareCompletedRecommendationOutcomeCapture(
    action664eVisibleInput,
  );

  expect(result.status).toBe("would_insert");
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.plan.projection.projection.source).toBe(
    "recommendation_outcome_bundle",
  );
  expect(result.plan.envelope.sample_type).toBe("visible");
  expect(result.plan.envelope.evaluation.quality_metrics_eligible).toBe(true);
  expect(result.plan.envelope.evaluation.primary_selection).toMatchObject({
    status: "selected",
    primary_horizon: "60m",
    canonical_outcome_count: 1,
  });
  expect(result.plan.storage_payload.evaluation_json.horizons).toHaveLength(3);
  expect(result.plan.storage_payload.canonical_identity).toBe(
    result.plan.envelope.canonical_identity,
  );
  expect(action664eVisibleInput).toEqual(before);
});

test("completed research-only bundle is quality-eligible without becoming visible", () => {
  const result = prepareCompletedRecommendationOutcomeCapture(
    action664eResearchInput,
  );

  expect(result.status).toBe("would_insert");
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.plan.envelope.sample_type).toBe("research_only");
  expect(result.plan.envelope.evaluation.quality_metrics_eligible).toBe(true);
  expect(result.plan.envelope.evaluation.primary_outcome_id).toContain("60m");
});

test("incomplete provider coverage is classified before any database construction", async () => {
  let factoryCalls = 0;
  const result = await captureCompletedRecommendationOutcomeBundle(
    action664eProviderGapInput,
    {
      env: enabledEnvironment,
      mode: "capture",
      databaseFactory: () => {
        factoryCalls += 1;
        return new MemoryCaptureDatabase();
      },
    },
  );

  expect(result.status).toBe("incomplete_not_quality_eligible");
  expect(result.database_activity).toEqual({
    client_constructions: 0,
    identity_reads: 0,
    full_readbacks: 0,
    insert_attempts: 0,
  });
  expect(factoryCalls).toBe(0);
});

test("missing producer ID, sample conflict, duplicate horizon, and broken lineage fail before write", () => {
  expect(
    prepareCompletedRecommendationOutcomeCapture(
      action664eMissingDecisionInput,
    ),
  ).toMatchObject({
    status: "unmappable",
    reason_codes: ["missing_explicit_producer_decision_id"],
  });
  expect(
    prepareCompletedRecommendationOutcomeCapture(
      action664eSampleConflictInput,
    ).status,
  ).toBe("conflicting");
  expect(
    prepareCompletedRecommendationOutcomeCapture(
      action664eDuplicateHorizonInput,
    ),
  ).toMatchObject({
    status: "conflicting",
    reason_codes: ["duplicate_60m_outcome"],
  });
  expect(
    prepareCompletedRecommendationOutcomeCapture(
      action664eBrokenLineageInput,
    ),
  ).toMatchObject({
    status: "unmappable",
    reason_codes: ["missing_explicit_batch_lineage"],
  });
});

test("default-off flag produces zero client constructions, reads, and writes", async () => {
  let factoryCalls = 0;
  const result = await captureCompletedRecommendationOutcomeBundle(
    action664eVisibleInput,
    {
      env: {},
      mode: "capture",
      databaseFactory: () => {
        factoryCalls += 1;
        return new MemoryCaptureDatabase();
      },
    },
  );

  expect(result).toMatchObject({
    status: "disabled",
    database_activity: {
      client_constructions: 0,
      identity_reads: 0,
      full_readbacks: 0,
      insert_attempts: 0,
    },
  });
  expect(factoryCalls).toBe(0);
});

test("kill switch produces zero client constructions, reads, and writes", async () => {
  let factoryCalls = 0;
  const result = await captureCompletedRecommendationOutcomeBundle(
    action664eVisibleInput,
    {
      env: {
        [CANONICAL_EVALUATION_WRITER_FEATURE_FLAG]: "true",
      },
      mode: "capture",
      databaseFactory: () => {
        factoryCalls += 1;
        return new MemoryCaptureDatabase();
      },
    },
  );

  expect(result).toMatchObject({
    status: "kill_switch_engaged",
    database_activity: {
      client_constructions: 0,
      identity_reads: 0,
      full_readbacks: 0,
      insert_attempts: 0,
    },
  });
  expect(factoryCalls).toBe(0);
});

test("diagnostic mode reports would-insert without constructing a client", async () => {
  let factoryCalls = 0;
  const result = await captureCompletedRecommendationOutcomeBundle(
    action664eVisibleInput,
    {
      env: enabledEnvironment,
      databaseFactory: () => {
        factoryCalls += 1;
        return new MemoryCaptureDatabase();
      },
    },
  );

  expect(result.status).toBe("would_insert");
  expect(result.database_activity).toEqual({
    client_constructions: 0,
    identity_reads: 0,
    full_readbacks: 0,
    insert_attempts: 0,
  });
  expect(factoryCalls).toBe(0);
});

test("test-activated visible capture inserts locally and returns complete adapter parity", async () => {
  const database = new MemoryCaptureDatabase();
  const result = await captureCompletedRecommendationOutcomeBundle(
    action664eVisibleInput,
    {
      env: enabledEnvironment,
      mode: "capture",
      databaseFactory: () => database,
    },
  );

  expect(result.status).toBe("inserted");
  expect(result.ok).toBe(true);
  expect(result.database_activity).toEqual({
    client_constructions: 1,
    identity_reads: 1,
    full_readbacks: 1,
    insert_attempts: 1,
  });
  expect(result.parity).toEqual({
    status: "matched",
    canonical_identity_equal: true,
    sample_type_equal: true,
    confidence_equal: true,
    lineage_equal: true,
    versions_equal: true,
    primary_outcome_equal: true,
    quality_eligibility_equal: true,
    diagnostic_horizon_count_equal: true,
    difference_codes: [],
  });
  expect(database.rows.size).toBe(1);
});

test("research-only capture also round-trips through the existing 664B adapter", async () => {
  const database = new MemoryCaptureDatabase();
  const result = await captureCompletedRecommendationOutcomeBundle(
    action664eResearchInput,
    {
      env: enabledEnvironment,
      mode: "capture",
      databaseFactory: () => database,
    },
  );

  expect(result.status).toBe("inserted");
  expect(result.parity.status).toBe("matched");
  expect(database.rows.values().next().value?.sample_type).toBe(
    "research_only",
  );
});

test("idempotent retry retains one row and reports no-effect with parity", async () => {
  const database = new MemoryCaptureDatabase();
  const options = {
    env: enabledEnvironment,
    mode: "capture" as const,
    databaseFactory: () => database,
  };
  const first = await captureCompletedRecommendationOutcomeBundle(
    action664eVisibleInput,
    options,
  );
  const retry = await captureCompletedRecommendationOutcomeBundle(
    action664eVisibleInput,
    options,
  );

  expect(first.status).toBe("inserted");
  expect(retry.status).toBe("idempotent_no_effect");
  expect(retry.parity.status).toBe("matched");
  expect(retry.database_activity.insert_attempts).toBe(0);
  expect(database.rows.size).toBe(1);
  expect(database.inserts).toBe(1);
});

test("same identity with different semantics conflicts without overwrite", async () => {
  const database = new MemoryCaptureDatabase();
  const options = {
    env: enabledEnvironment,
    mode: "capture" as const,
    databaseFactory: () => database,
  };
  await captureCompletedRecommendationOutcomeBundle(
    action664eVisibleInput,
    options,
  );
  const storedBefore = structuredClone(
    database.rows.values().next().value!,
  );
  const conflict = await captureCompletedRecommendationOutcomeBundle(
    action664eSemanticCollisionInput,
    options,
  );

  expect(conflict.status).toBe("semantic_conflict");
  expect(conflict.database_activity).toMatchObject({
    identity_reads: 1,
    full_readbacks: 0,
    insert_attempts: 0,
  });
  expect(database.rows.size).toBe(1);
  expect(database.rows.values().next().value).toEqual(storedBefore);
});

test("tampered prepared envelope is rejected before database construction", async () => {
  const preparation = prepareCompletedRecommendationOutcomeCapture(
    action664eVisibleInput,
  );
  expect(preparation.ok).toBe(true);
  if (!preparation.ok) return;
  const tampered = structuredClone(preparation.plan);
  tampered.envelope.provider_context.reason_codes.push(
    "tampered_before_write",
  );
  let factoryCalls = 0;

  const result = await executeCanonicalEvaluationCapturePlan(tampered, {
    env: enabledEnvironment,
    mode: "capture",
    databaseFactory: () => {
      factoryCalls += 1;
      return new MemoryCaptureDatabase();
    },
  });

  expect(result.status).toBe("conflicting");
  expect(result.reason_codes).toContain("prepared_envelope_tampered");
  expect(result.database_activity).toEqual({
    client_constructions: 0,
    identity_reads: 0,
    full_readbacks: 0,
    insert_attempts: 0,
  });
  expect(factoryCalls).toBe(0);
});

test("tampered stored envelope is detected by canonical readback validation", async () => {
  const database = new MemoryCaptureDatabase();
  database.tamperReadback = (row) => {
    row.persistence_envelope.provider_context = {
      ...row.persistence_envelope.provider_context,
      provider: "tampered-stored-provider",
    };
    return row;
  };
  const result = await captureCompletedRecommendationOutcomeBundle(
    action664eVisibleInput,
    {
      env: enabledEnvironment,
      mode: "capture",
      databaseFactory: () => database,
    },
  );

  expect(result.status).toBe("conflicting");
  expect(result.parity.status).toBe("conflicting");
  expect(result.parity.difference_codes).toContain(
    "stored_payload_not_canonical",
  );
  expect(result.writer_result?.status).toBe("inserted");
  expect(database.rows.size).toBe(1);
});

test("a non-local database boundary is rejected before reads or writes", async () => {
  const database = new MemoryCaptureDatabase();
  const notLocal = database as CanonicalEvaluationCaptureDatabase & {
    scope: string;
  };
  Object.defineProperty(notLocal, "scope", {
    value: "staging",
    configurable: true,
  });
  const result = await captureCompletedRecommendationOutcomeBundle(
    action664eVisibleInput,
    {
      env: enabledEnvironment,
      mode: "capture",
      databaseFactory: () =>
        notLocal as unknown as CanonicalEvaluationCaptureDatabase,
    },
  );

  expect(result.status).toBe("unmappable");
  expect(result.reason_codes).toEqual([
    "disposable_local_postgres_database_required",
  ]);
  expect(database.identityReads).toBe(0);
  expect(database.inserts).toBe(0);
  expect(database.fullReadbacks).toBe(0);
});

test("orchestrator remains absent from all existing live consumers", () => {
  const importToken = "canonical-evaluation-capture-orchestrator";
  const matches = [...allFiles("app"), ...allFiles("lib")]
    .filter((path) => /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(path))
    .filter(
      (path) =>
        path !==
          "lib/server/canonical-evaluation-capture-orchestrator.ts" &&
        path !== "lib/canonical-evaluation-capture-fixtures.ts" &&
        path !==
          "lib/canonical-evaluation-quality-read-model-fixtures.ts" &&
        readFileSync(path, "utf8").includes(importToken),
    );

  expect(matches).toEqual([]);
});

test("orchestrator source has no provider, route, scanner, or default database fallback", () => {
  const source = readFileSync(
    "lib/server/canonical-evaluation-capture-orchestrator.ts",
    "utf8",
  );

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).not.toMatch(/getServerSupabaseClient|createClient\(/);
  expect(source).not.toMatch(/\bfetch\(|provider_call|run-scan|scanner/i);
  expect(source).toContain('"disposable_local_postgres"');
  expect(source).toContain('options.mode !== "capture"');
});
