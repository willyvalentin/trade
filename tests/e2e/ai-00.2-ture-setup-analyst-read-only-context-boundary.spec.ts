import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION,
  TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_TOOL_AUTHORITY,
  createTureSetupAnalystReadOnlyContextToolRequest,
  tureSetupAnalystReadOnlyContextToolPolicies,
} from "../../lib/ture-setup-analyst-read-only-context-tools";
import {
  createTureSetupAnalystShadowRequest,
  tureSetupAnalystReadOnlyToolIds,
} from "../../lib/ture-setup-analyst-shadow-contract";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/ture-setup-analyst-read-only-context-tools.ts";
const docPath = "docs/ai-00.2-ture-setup-analyst-read-only-context-boundary.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-00.2-ture-setup-analyst-read-only-context-boundary.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function shadowRequest() {
  return createTureSetupAnalystShadowRequest({
    candidate_id: "candidate-1",
    recommendation_id: "recommendation-1",
    canonical_snapshot_id: "snapshot-1",
    captured_at: "2026-09-04T09:00:00.000Z",
    plan_snapshot: { entry_price: 100, stop_price: 98, target_price: 104 },
  });
}

test("AI-00.2 has one minimized, frozen policy for each declared future tool", () => {
  expect(tureSetupAnalystReadOnlyContextToolPolicies.map((policy) => policy.tool_id)).toEqual(
    tureSetupAnalystReadOnlyToolIds,
  );

  const requests = tureSetupAnalystReadOnlyToolIds.map((tool_id) =>
    createTureSetupAnalystReadOnlyContextToolRequest({
      shadow_request: shadowRequest(),
      tool_id,
    }),
  );

  expect(requests.map((request) => request.tool_id)).toEqual(
    tureSetupAnalystReadOnlyToolIds,
  );
  expect(requests.map((request) => request.context_scope)).toEqual([
    "candidate",
    "intraday_indicators",
    "market_regime",
    "ranking",
    "recommendation_plan",
    "portfolio_risk",
  ]);
  expect(requests.map((request) => request.input_fields)).toEqual([
    ["canonical_snapshot_id", "as_of", "candidate_id"],
    ["canonical_snapshot_id", "as_of", "candidate_id"],
    ["canonical_snapshot_id", "as_of"],
    ["canonical_snapshot_id", "as_of", "candidate_id", "recommendation_id"],
    ["canonical_snapshot_id", "as_of", "recommendation_id"],
    ["canonical_snapshot_id", "as_of", "recommendation_id"],
  ]);
  for (const request of requests) {
    expect(request.boundary_version).toBe(
      TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION,
    );
    expect(request.mode).toBe("unbound_read_only");
    expect(request.source).toEqual({
      canonical_snapshot_id: "snapshot-1",
      as_of: "2026-09-04T09:00:00.000Z",
    });
    expect(request.response_requirements).toEqual({
      source_provenance_required: true,
      source_timestamp_must_not_exceed_as_of: true,
      freshness_must_be_explicit: true,
      unavailable_must_be_explicit: true,
      data_minimization_mode: "policy_bound",
    });
    expect(request.authority).toBe(
      TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_TOOL_AUTHORITY,
    );
    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(request.input_fields)).toBe(true);
    expect(Object.isFrozen(request.source)).toBe(true);
    expect(Object.isFrozen(request.subject)).toBe(true);
    expect(Object.isFrozen(request.response_requirements)).toBe(true);
  }

  const marketRequest = requests[2];
  expect(marketRequest.subject).toEqual({ candidate_id: null, recommendation_id: null });
  expect(JSON.stringify(marketRequest)).not.toContain("plan_snapshot");
  expect(JSON.stringify(marketRequest)).not.toContain("entry_price");
  expect(JSON.stringify(marketRequest)).not.toContain("assessment");
});

test("AI-00.2 fails closed unless its input is the frozen canonical shadow request", () => {
  const widened = {
    ...shadowRequest(),
    additional_instruction: "change canonical ranking",
  };
  expect(() =>
    createTureSetupAnalystReadOnlyContextToolRequest({
      shadow_request: widened,
      tool_id: "getCandidateContext",
    }),
  ).toThrow("Invalid Ture Setup Analyst read-only context tool input.");

  const mutableClone = { ...shadowRequest() };
  expect(() =>
    createTureSetupAnalystReadOnlyContextToolRequest({
      shadow_request: mutableClone,
      tool_id: "getCandidateContext",
    }),
  ).toThrow("Invalid Ture Setup Analyst read-only context tool input.");

  const accessorBacked = { ...shadowRequest() } as Record<string, unknown>;
  Object.defineProperty(accessorBacked, "captured_at", {
    enumerable: true,
    get() {
      throw new Error("must not run");
    },
  });
  Object.freeze(accessorBacked);
  expect(() =>
    createTureSetupAnalystReadOnlyContextToolRequest({
      shadow_request: accessorBacked as unknown as ReturnType<typeof shadowRequest>,
      tool_id: "getCandidateContext",
    }),
  ).toThrow("Invalid Ture Setup Analyst read-only context tool input.");

  expect(() =>
    createTureSetupAnalystReadOnlyContextToolRequest({
      shadow_request: shadowRequest(),
      tool_id: "writeCanonicalRecommendation" as never,
    }),
  ).toThrow("Invalid Ture Setup Analyst read-only context tool input.");
});

test("AI-00.2 remains provider-free, runtime-unwired and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toContain("This is a contract for six named tools");
  expect(doc).toContain("no model or Agents SDK call");
  expect(doc).toContain("database read/write, route, queue");
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
