import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  METADATA_DISCOVERY_SQL,
  OTHER_DOMAINS_SQL,
  RUNTIME_COLLECTOR_PATH,
  RUNTIME_COLLECTOR_VERSION,
} from "../../lib/action-661j5r3-postgres-runtime-collector-rebuild-v1.mjs";

const root = process.cwd();

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("runtime baseline is pinned to exact durable-base migration bytes", () => {
  const manifest = JSON.parse(
    readFileSync(
      join(root, "scripts/action-661j5r3-runtime-baseline-rebuild-v1.json"),
      "utf8",
    ),
  ) as {
    base_commit: string;
    historical_requirement_source: {
      used_as_byte_authority: boolean;
    };
    manifest_version: string;
    migrations: Array<{ path: string; sha256: string; version: string }>;
  };
  expect(manifest.manifest_version).toBe(
    "action_661j5r3_runtime_baseline_rebuild_v1",
  );
  expect(manifest.base_commit).toBe(
    "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33",
  );
  expect(manifest.historical_requirement_source.used_as_byte_authority).toBe(
    false,
  );
  expect(manifest.migrations).toHaveLength(31);
  for (const migration of manifest.migrations) {
    expect(sha256(join(root, migration.path)), migration.path).toBe(
      migration.sha256,
    );
  }
});

test("runtime migration has a new rebuild identity and exact terminal checks", () => {
  const path = join(
    root,
    "scripts/action-661j5r3-runtime-migration-rebuild-v1.sql",
  );
  const source = readFileSync(path, "utf8");
  expect(sha256(path)).not.toBe(
    "73a0b4b75e57c4e76c58bc774f8bde9bd2010ba0740c6a0b10d424c5c49c9abd",
  );
  expect(source).toContain("Action 661J.5R.3 rebuild_v1 runtime migration");
  expect(source).toContain("Action 661J refuses forbidden migration history");
  expect(source).toContain(
    "Action 661J unexpected target relation state for %",
  );
  expect(source).toContain("format('public.%I', target_name)::regclass");
});

test("runtime collector is metadata-first and structurally read-only", () => {
  expect(RUNTIME_COLLECTOR_VERSION).toBe(
    "action_661j5r3_postgres_runtime_collector_rebuild_v1",
  );
  expect(RUNTIME_COLLECTOR_PATH).toBe(
    "lib/action-661j5r3-postgres-runtime-collector-rebuild-v1.mjs",
  );
  for (const sql of [METADATA_DISCOVERY_SQL, OTHER_DOMAINS_SQL]) {
    expect(sql).toMatch(/^with |^select /);
    expect(sql).not.toMatch(
      /\b(?:insert|update|delete|alter|drop|create|grant|revoke|truncate|copy)\b/i,
    );
  }
  expect(METADATA_DISCOVERY_SQL).toContain("'missing'");
  expect(METADATA_DISCOVERY_SQL).toContain("'non_table'");
  expect(METADATA_DISCOVERY_SQL).toContain("'wrong_owner'");
  expect(OTHER_DOMAINS_SQL).toContain("'trigger_catalog'");
});

test("runtime orchestrator fixes four runs and diagnostic-before-policy order", () => {
  const source = readFileSync(
    join(root, "scripts/action-661j5r3-runtime-certify-rebuild-v1.mjs"),
    "utf8",
  );
  expect(source.match(/scenario_id: "forbidden_history"/g)).toHaveLength(2);
  expect(source.match(/scenario_id: "missing_target"/g)).toHaveLength(2);
  expect(source).toContain("action_661j5r3.runtime_attempt_retried");
  expect(source).toContain("persist_diagnostic");
  expect(source.indexOf("persist_diagnostic")).toBeLessThan(
    source.indexOf("buildMixedAbAggregateRebuildV1(files)"),
  );
  expect(source).toContain("docker\", [\"rm\", \"-f\", container]");
  expect(source).toContain("output_already_exists");
});
