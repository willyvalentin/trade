import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  CANONICAL_POSITION_LINEAGE_PROJECTION_VERSION,
  CanonicalPositionLineageProjectionError,
  projectCanonicalPositionLineage,
} from "@/lib/server/canonical-position-lineage-projection";

const repositoryRoot = path.resolve(__dirname, "../..");
const modulePath = "lib/server/canonical-position-lineage-projection.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const positionId = "7d444840-e29b-41d4-a716-446655440000";
const recommendationId = "550e8400-e29b-41d4-a716-446655440000";
const recommendationDigest = "a".repeat(64);
const stateDigest = "b".repeat(64);

function command(overrides: Record<string, unknown> = {}) {
  const position = {
    durable_recommendation_version: 4,
    owner_user_id: owner,
    position_id: positionId,
    position_version: 3,
    recommendation_id: recommendationId,
    recommendation_identity: "rec_decision:v1:trusted%20source:decision-7:1722506400000",
    recommendation_normative_digest: recommendationDigest,
  };

  return {
    authenticated_server_owner: owner,
    history: { ...position, position_state_digest: stateDigest },
    position,
    ...overrides,
  };
}

test("B-01 rebuilds a detached immutable projection only for exact owner-bound lineage", () => {
  const input = command();
  const result = projectCanonicalPositionLineage(input);

  expect(result).toEqual({
    contract_version: CANONICAL_POSITION_LINEAGE_PROJECTION_VERSION,
    history_identity: `${positionId}:${owner}:3`,
    owner_user_id: owner,
    position_id: positionId,
    position_state_digest: stateDigest,
    position_version: 3,
    recommendation_id: recommendationId,
    recommendation_identity: "rec_decision:v1:trusted%20source:decision-7:1722506400000",
    recommendation_normative_digest: recommendationDigest,
    recommendation_version: 4,
  });
  expect(Object.isFrozen(result)).toBe(true);

  input.position.position_version = 9;
  input.history.position_state_digest = "c".repeat(64);
  expect(result.position_version).toBe(3);
  expect(result.position_state_digest).toBe(stateDigest);
});

test("B-01 refuses owner, version, recommendation and digest substitution", () => {
  const invalidInputs = [
    command({ authenticated_server_owner: recommendationId }),
    command({ history: { ...command().history, position_version: 2 } }),
    command({ history: { ...command().history, recommendation_id: positionId } }),
    command({ position: { ...command().position, recommendation_normative_digest: "C".repeat(64) } }),
  ];

  for (const input of invalidInputs) {
    expect(() => projectCanonicalPositionLineage(input)).toThrow(
      CanonicalPositionLineageProjectionError,
    );
  }
});

test("B-01 rejects widened, accessor-backed and proxy-backed DTOs without a fallback", () => {
  const widened = { ...command(), extra: true };
  const accessorBacked = command();
  Object.defineProperty(accessorBacked.position, "position_version", {
    enumerable: true,
    get: () => 3,
  });
  const proxyBacked = new Proxy(command(), {
    getOwnPropertyDescriptor() {
      throw new Error("unexpected proxy traversal");
    },
  });

  for (const input of [widened, accessorBacked, proxyBacked]) {
    expect(() => projectCanonicalPositionLineage(input)).toThrow(
      "invalid_canonical_position_lineage_projection_input",
    );
  }
});

test("B-01 stays server-only and unbound to storage, transport, routes and UI", async () => {
  const source = await readFile(path.join(repositoryRoot, modulePath), "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  for (const forbidden of [
    "@supabase",
    "getServerSupabaseClient",
    "fetch(",
    "process.env",
    "app/api",
    "route.ts",
    "node:crypto",
    'from "pg"',
  ]) {
    expect(source).not.toContain(forbidden);
  }
});
