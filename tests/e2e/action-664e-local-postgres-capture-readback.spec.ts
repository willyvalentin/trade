import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

import { expect, test } from "@playwright/test";

import {
  action664eResearchInput,
  action664eSemanticCollisionInput,
  action664eVisibleInput,
} from "@/lib/canonical-evaluation-capture-fixtures";
import {
  captureCompletedRecommendationOutcomeBundle,
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

class DisposablePostgresCaptureDatabase
  implements CanonicalEvaluationCaptureDatabase
{
  readonly scope = "disposable_local_postgres" as const;

  constructor(private readonly container: string) {}

  private sql(statement: string, allowFailure = false) {
    const result = spawnSync(
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
      { encoding: "utf8" },
    );
    if (!allowFailure && result.status !== 0) {
      throw new Error(
        (result.stderr || result.stdout || "local SQL failed").trim(),
      );
    }
    return result;
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
    const statement = `
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
    `;
    const result = this.sql(statement, true);
    if (result.status === 0) return { status: "inserted" };
    if (
      `${result.stderr}\n${result.stdout}`.includes(
        "ce_decisions_identity_unique",
      )
    ) {
      return { status: "unique_conflict" };
    }
    return { status: "error", error_code: "local_postgres_insert_error" };
  }

  async readCanonicalEvaluation(
    canonicalIdentity: string,
  ): Promise<CanonicalEvaluationCaptureReadbackResult> {
    const output = this.sql(`
      set role service_role;
      select (
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
      )::text
      from ${relation} decision
      where canonical_identity = ${textLiteral(canonicalIdentity)};
    `).stdout.trim();

    return output
      ? {
          status: "found",
          row: JSON.parse(output) as CanonicalEvaluationStorageInsert,
        }
      : { status: "not_found", row: null };
  }
}

function command(
  executable: string,
  args: string[],
  options: { input?: string } = {},
) {
  const result = spawnSync(executable, args, {
    encoding: "utf8",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(
      `${executable} failed: ${(
        result.stderr ||
        result.stdout ||
        "unknown error"
      ).trim()}`,
    );
  }
  return result.stdout;
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
    .trim()
    .split("\n")
    .filter((path) => path.endsWith(".sql"));

  expect(paths).not.toContain(migrationPath);
  return paths;
}

test("completed bundles capture and read back through canonical adapters in disposable PostgreSQL", async () => {
  test.setTimeout(120_000);
  const container = `ture-action-664e-${randomUUID().slice(0, 12)}`;

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
    const database = new DisposablePostgresCaptureDatabase(container);

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const ready = spawnSync(
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
        { encoding: "utf8" },
      );
      if (ready.status === 0) {
        Atomics.wait(
          new Int32Array(new SharedArrayBuffer(4)),
          0,
          0,
          250,
        );
        const stableReady = spawnSync(
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
          { encoding: "utf8" },
        );
        if (stableReady.status === 0) break;
      }
      if (attempt === 59) throw new Error("local PostgreSQL not ready");
      Atomics.wait(
        new Int32Array(new SharedArrayBuffer(4)),
        0,
        0,
        250,
      );
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
        command("git", ["show", `${baselineCommit}:${path}`]),
      );
    }
    applySql(container, readFileSync(migrationPath, "utf8"));

    const options = {
      env: enabledEnvironment,
      mode: "capture" as const,
      databaseFactory: () => database,
    };
    const visible = await captureCompletedRecommendationOutcomeBundle(
      action664eVisibleInput,
      options,
    );
    const retry = await captureCompletedRecommendationOutcomeBundle(
      action664eVisibleInput,
      options,
    );
    const conflict = await captureCompletedRecommendationOutcomeBundle(
      action664eSemanticCollisionInput,
      options,
    );
    const research = await captureCompletedRecommendationOutcomeBundle(
      action664eResearchInput,
      options,
    );

    expect(
      visible.status,
      JSON.stringify(visible),
    ).toBe("inserted");
    expect(visible.parity.status).toBe("matched");
    expect(retry.status).toBe("idempotent_no_effect");
    expect(retry.parity.status).toBe("matched");
    expect(conflict.status).toBe("semantic_conflict");
    expect(conflict.database_activity.insert_attempts).toBe(0);
    expect(research.status).toBe("inserted");
    expect(research.parity.status).toBe("matched");

    const count = command("docker", [
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
      `set role service_role; select count(*)::text from ${relation};`,
    ]).trim();
    expect(count).toBe("2");
  } finally {
    spawnSync("docker", ["rm", "-f", container], { encoding: "utf8" });
  }
});
