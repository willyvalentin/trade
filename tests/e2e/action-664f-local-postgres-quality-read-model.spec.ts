import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

import { expect, test } from "@playwright/test";

import {
  action664fAmbiguousRow,
  action664fDuplicateHorizonRow,
  action664fHistoricalRow,
  action664fNoTradeRow,
  action664fNonReproducibleRow,
  action664fParityMismatchRow,
  action664fProviderGapRow,
  action664fRejectedRow,
  action664fShadowRow,
  action664fTamperedEnvelopeRow,
} from "@/lib/canonical-evaluation-quality-read-model-fixtures";
import {
  buildCanonicalEvaluationStoragePayload,
} from "@/lib/canonical-evaluation-persistence-contract";
import {
  action664eResearchInput,
  action664eVisibleInput,
} from "@/lib/canonical-evaluation-capture-fixtures";
import {
  captureCompletedRecommendationOutcomeBundle,
  type CanonicalEvaluationCaptureDatabase,
  type CanonicalEvaluationCaptureReadbackResult,
} from "@/lib/server/canonical-evaluation-capture-orchestrator";
import {
  CANONICAL_EVALUATION_READ_COLUMN_LIST,
  buildCanonicalEvaluationQualityReadModel,
  type CanonicalEvaluationReadOnlyRepository,
  type CanonicalEvaluationReadQuery,
  type CanonicalEvaluationReadResult,
} from "@/lib/server/canonical-evaluation-quality-read-model";
import {
  CANONICAL_EVALUATION_WRITER_FEATURE_FLAG,
  CANONICAL_EVALUATION_WRITER_KILL_SWITCH,
  writeCanonicalEvaluationStorage,
  type CanonicalEvaluationStorageDatabaseInsertResult,
  type CanonicalEvaluationStorageDatabaseReadResult,
  type CanonicalEvaluationStorageInsert,
} from "@/lib/server/canonical-evaluation-storage-writer";

const baselineCommit = "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33";
const migrationPath =
  "supabase/migrations/20260726001000_create_canonical_evaluation_decisions.sql";
const relation = "public.canonical_evaluation_decisions";
const enabledEnvironment = {
  [CANONICAL_EVALUATION_WRITER_FEATURE_FLAG]: "true",
  [CANONICAL_EVALUATION_WRITER_KILL_SWITCH]: "false",
} as const;

function textLiteral(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function command(
  executable: string,
  args: string[],
  options: { input?: string; allowFailure?: boolean } = {},
) {
  const result = spawnSync(executable, args, {
    encoding: "utf8",
    input: options.input,
  });
  if (!options.allowFailure && result.status !== 0) {
    throw new Error(
      `${executable} failed: ${(
        result.stderr ||
        result.stdout ||
        "unknown error"
      ).trim()}`,
    );
  }
  return result;
}

function applySql(container: string, sql: string) {
  command(
    "docker",
    [
      "exec",
      "-i",
      container,
      "psql",
      "-X",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-q",
    ],
    { input: sql },
  );
}

function selectHistoricalBaselineMigrations() {
  command("git", ["cat-file", "-e", `${baselineCommit}^{commit}`]);
  const paths = command("git", [
    "ls-tree",
    "-r",
    "--name-only",
    baselineCommit,
    "supabase/migrations",
  ])
    .stdout.trim()
    .split("\n")
    .filter((path) => path.endsWith(".sql"));

  expect(paths).not.toContain(migrationPath);
  return paths;
}

class DisposablePostgresQualityDatabase
  implements CanonicalEvaluationCaptureDatabase, CanonicalEvaluationReadOnlyRepository
{
  readonly scope = "disposable_local_postgres" as const;
  readonly relation = "canonical_evaluation_decisions" as const;
  readonly access = "select_only" as const;

  constructor(private readonly container: string) {}

  private sql(statement: string, allowFailure = false) {
    return command(
      "docker",
      [
        "exec",
        "-i",
        this.container,
        "psql",
        "-X",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-qAt",
        "-c",
        statement,
      ],
      { allowFailure },
    );
  }

  async readByCanonicalIdentity(
    canonicalIdentity: string,
  ): Promise<CanonicalEvaluationStorageDatabaseReadResult> {
    const output = this.sql(`
      set role service_role;
      select jsonb_build_object(
        'canonical_identity', canonical_identity,
        'semantic_payload_sha256', semantic_payload_sha256,
        'persistence_envelope', persistence_envelope
      )::text
      from ${relation}
      where canonical_identity = ${textLiteral(canonicalIdentity)};
    `).stdout.trim();
    return output
      ? { status: "found", row: JSON.parse(output) }
      : { status: "not_found", row: null };
  }

  async insert(
    value: CanonicalEvaluationStorageInsert,
  ): Promise<CanonicalEvaluationStorageDatabaseInsertResult> {
    const columns = Object.keys(value);
    const payload = textLiteral(JSON.stringify(value));
    const result = this.sql(
      `
        set role service_role;
        with payload as (
          select *
          from jsonb_populate_record(
            null::public.canonical_evaluation_decisions,
            ${payload}::jsonb
          )
        )
        insert into ${relation} (${columns.join(",")})
        select ${columns.join(",")} from payload;
      `,
      true,
    );
    if (result.status === 0) return { status: "inserted" };
    if (`${result.stderr}\n${result.stdout}`.includes("identity_unique")) {
      return { status: "unique_conflict" };
    }
    throw new Error(
      `local_postgres_insert_failed:${result.stderr || result.stdout}`,
    );
  }

  async readCanonicalEvaluation(
    canonicalIdentity: string,
  ): Promise<CanonicalEvaluationCaptureReadbackResult> {
    const rows = await this.selectCanonicalEvaluations({
      decided_at_or_after: "2000-01-01T00:00:00.000Z",
      decided_before: "2100-01-01T00:00:00.000Z",
      limit: 10_000,
    });
    if (rows.status !== "ok") {
      return { status: "error", row: null, error_code: "local_read_error" };
    }
    const row = rows.rows.find(
      (candidate) => candidate.canonical_identity === canonicalIdentity,
    );
    return row ? { status: "found", row } : { status: "not_found", row: null };
  }

  async selectCanonicalEvaluations(
    query: CanonicalEvaluationReadQuery,
  ): Promise<CanonicalEvaluationReadResult> {
    const sampleClause =
      query.sample_types && query.sample_types.length > 0
        ? `and sample_type = any(array[${query.sample_types
            .map(textLiteral)
            .join(",")}]::text[])`
        : "";
    const output = this.sql(`
      set role service_role;
      select coalesce(jsonb_agg(
        to_jsonb(decision)
        - 'id'
        - 'created_at'
        - 'decision_timestamp'
        - 'provider_source_timestamp'
        || jsonb_build_object(
          'decision_timestamp',
          to_char(
            decision_timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
          ),
          'provider_source_timestamp',
          case
            when provider_source_timestamp is null then null
            else to_char(
              provider_source_timestamp at time zone 'UTC',
              'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            )
          end
        )
        order by decision_timestamp, canonical_identity
      ), '[]'::jsonb)::text
      from (
        select ${CANONICAL_EVALUATION_READ_COLUMN_LIST}
        from ${relation}
        where decision_timestamp >= ${textLiteral(query.decided_at_or_after)}::timestamptz
          and decision_timestamp < ${textLiteral(query.decided_before)}::timestamptz
          ${sampleClause}
        order by decision_timestamp, canonical_identity
        limit ${query.limit}
      ) decision;
    `).stdout.trim();
    return {
      status: "ok",
      rows: JSON.parse(output) as CanonicalEvaluationStorageInsert[],
      reason_codes: [],
    };
  }
}

async function seedThroughWriter(
  database: DisposablePostgresQualityDatabase,
  row: CanonicalEvaluationStorageInsert,
) {
  const storage = buildCanonicalEvaluationStoragePayload(
    row.persistence_envelope,
  );
  expect(storage.status).toBe("ready");
  if (!storage.value) throw new Error("fixture_storage_not_ready");
  const result = await writeCanonicalEvaluationStorage(storage.value, {
    env: enabledEnvironment,
    database,
  });
  expect(result.status).toBe("inserted");
}

test("local PostgreSQL read model preserves one identity row and isolated cohorts", async () => {
  test.setTimeout(120_000);
  const container = `ture-action-664f-${randomUUID().slice(0, 12)}`;

  try {
    command("docker", [
      "run",
      "-d",
      "--rm",
      "--name",
      container,
      "-e",
      "POSTGRES_PASSWORD=postgres",
      "postgres:16-alpine",
    ]);
    const database = new DisposablePostgresQualityDatabase(container);

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const ready = command(
        "docker",
        [
          "exec",
          "-i",
          container,
          "psql",
          "-X",
          "-U",
          "postgres",
          "-d",
          "postgres",
          "-qAt",
          "-c",
          "select 1;",
        ],
        { allowFailure: true },
      );
      if (ready.status === 0) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
        const stableReady = command(
          "docker",
          [
            "exec",
            "-i",
            container,
            "psql",
            "-X",
            "-U",
            "postgres",
            "-d",
            "postgres",
            "-qAt",
            "-c",
            "select 1;",
          ],
          { allowFailure: true },
        );
        if (stableReady.status === 0) break;
      }
      if (attempt === 59) throw new Error("local PostgreSQL not ready");
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
    }

    applySql(
      container,
      "create extension if not exists pgcrypto; create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;",
    );
    const baselineMigrations = selectHistoricalBaselineMigrations();
    expect(baselineMigrations).not.toContain(migrationPath);
    for (const path of baselineMigrations) {
      applySql(
        container,
        command("git", ["show", `${baselineCommit}:${path}`]).stdout,
      );
    }
    applySql(container, readFileSync(migrationPath, "utf8"));

    const captureOptions = {
      env: enabledEnvironment,
      mode: "capture" as const,
      databaseFactory: () => database,
    };
    const visible = await captureCompletedRecommendationOutcomeBundle(
      action664eVisibleInput,
      captureOptions,
    );
    const research = await captureCompletedRecommendationOutcomeBundle(
      action664eResearchInput,
      captureOptions,
    );
    expect(visible.status).toBe("inserted");
    expect(research.status).toBe("inserted");

    for (const row of [
      action664fShadowRow,
      action664fHistoricalRow,
      action664fRejectedRow,
      action664fNoTradeRow,
      action664fProviderGapRow,
      action664fAmbiguousRow,
      action664fNonReproducibleRow,
    ]) {
      await seedThroughWriter(database, row);
    }

    for (const row of [
      action664fDuplicateHorizonRow,
      action664fParityMismatchRow,
      action664fTamperedEnvelopeRow,
    ]) {
      expect((await database.insert(row)).status).toBe("inserted");
    }

    const read = await database.selectCanonicalEvaluations({
      decided_at_or_after: "2026-01-01T00:00:00.000Z",
      decided_before: "2027-01-01T00:00:00.000Z",
      limit: 100,
    });
    expect(read.status).toBe("ok");
    if (read.status !== "ok") return;

    const model = buildCanonicalEvaluationQualityReadModel(read.rows);
    expect(model.candidates).toHaveLength(12);
    expect(model.diagnostics.unique_canonical_identities).toBe(12);
    expect(model.standard_visible_quality_identity_count).toBe(1);
    expect(model.standard_visible_quality_identities).toEqual([
      visible.canonical_identity,
    ]);
    expect(
      model.candidates.find((row) => row.sample_type === "research_only")
        ?.cohort,
    ).toBe("research_only_recommendation_quality");
    expect(
      model.candidates
        .filter((row) =>
          ["rejected_candidate", "no_trade"].includes(row.sample_type),
        )
        .every((row) => !row.standard_visible_quality_eligible),
    ).toBe(true);
    expect(
      model.candidates.find(
        (row) =>
          row.canonical_identity ===
          action664fProviderGapRow.canonical_identity,
      )?.eligibility_status,
    ).toBe("incomplete");
    expect(
      model.candidates.find(
        (row) => row.canonical_identity === action664fAmbiguousRow.canonical_identity,
      )?.eligibility_status,
    ).toBe("ambiguous");
    expect(
      model.candidates.find(
        (row) =>
          row.canonical_identity ===
          action664fNonReproducibleRow.canonical_identity,
      )?.eligibility_status,
    ).toBe("non_reproducible");
    expect(
      model.candidates.find(
        (row) =>
          row.canonical_identity ===
          action664fDuplicateHorizonRow.canonical_identity,
      )?.eligibility_status,
    ).toBe("conflicting");
    expect(
      model.candidates.find(
        (row) =>
          row.canonical_identity ===
          action664fParityMismatchRow.canonical_identity,
      )?.eligibility_status,
    ).toBe("parity_mismatch");
    expect(
      model.candidates.find(
        (row) =>
          row.canonical_identity ===
          action664fTamperedEnvelopeRow.canonical_identity,
      )?.eligibility_status,
    ).toBe("parity_mismatch");
  } finally {
    spawnSync("docker", ["rm", "-f", container], { encoding: "utf8" });
  }
});
