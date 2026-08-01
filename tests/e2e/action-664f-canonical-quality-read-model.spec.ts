import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import {
  action664fAllSampleRows,
  action664fAmbiguousRow,
  action664fDuplicateHorizonRow,
  action664fNonReproducibleRow,
  action664fParityMismatchRow,
  action664fProviderGapRow,
  action664fResearchRow,
  action664fTamperedEnvelopeRow,
  action664fVisibleRow,
  cloneAction664fRows,
} from "@/lib/canonical-evaluation-quality-read-model-fixtures";
import {
  CANONICAL_EVALUATION_READ_COLUMN_LIST,
  buildCanonicalEvaluationQualityReadModel,
  createCanonicalEvaluationReadOnlyRepository,
} from "@/lib/server/canonical-evaluation-quality-read-model";

function filesRecursively(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? filesRecursively(path) : [path];
  });
}

test("read repository exposes one bounded SELECT path and no mutation methods", async () => {
  const operations: string[] = [];
  const builder = {
    gte(column: string, value: string) {
      operations.push(`gte:${column}:${value}`);
      return this;
    },
    lt(column: string, value: string) {
      operations.push(`lt:${column}:${value}`);
      return this;
    },
    in(column: string, values: string[]) {
      operations.push(`in:${column}:${values.join("|")}`);
      return this;
    },
    order(column: string, options: { ascending: boolean }) {
      operations.push(`order:${column}:${options.ascending}`);
      return this;
    },
    async limit(value: number) {
      operations.push(`limit:${value}`);
      return { data: [action664fVisibleRow], error: null };
    },
  };
  const repository = createCanonicalEvaluationReadOnlyRepository({
    from(table) {
      operations.push(`from:${table}`);
      return {
        select(columns) {
          operations.push(`select:${columns}`);
          return builder;
        },
      };
    },
  });

  const result = await repository.selectCanonicalEvaluations({
    decided_at_or_after: "2026-07-08T00:00:00.000Z",
    decided_before: "2026-07-09T00:00:00.000Z",
    sample_types: ["visible"],
    limit: 100,
  });

  expect(repository.access).toBe("select_only");
  expect(result.status).toBe("ok");
  expect(operations).toEqual([
    "from:canonical_evaluation_decisions",
    `select:${CANONICAL_EVALUATION_READ_COLUMN_LIST}`,
    "gte:decision_timestamp:2026-07-08T00:00:00.000Z",
    "lt:decision_timestamp:2026-07-09T00:00:00.000Z",
    "in:sample_type:visible",
    "order:decision_timestamp:true",
    "limit:100",
  ]);
  expect(Object.keys(repository).sort()).toEqual([
    "access",
    "relation",
    "selectCanonicalEvaluations",
  ]);
  expect(JSON.stringify(repository)).not.toMatch(/insert|update|delete|schema/i);
});

test("repository rejects an unbounded or excessive read before client access", async () => {
  let clientCalls = 0;
  const repository = createCanonicalEvaluationReadOnlyRepository({
    from() {
      clientCalls += 1;
      throw new Error("client must not be used");
    },
  });

  const result = await repository.selectCanonicalEvaluations({
    decided_at_or_after: "2026-07-08T00:00:00.000Z",
    decided_before: "2026-07-09T00:00:00.000Z",
    limit: 10_001,
  });

  expect(result).toEqual({
    status: "error",
    rows: [],
    reason_codes: ["invalid_read_limit"],
  });
  expect(clientCalls).toBe(0);
});

test("all six sample types produce one named cohort row per identity", () => {
  const model = buildCanonicalEvaluationQualityReadModel(
    action664fAllSampleRows,
  );

  expect(model.candidates).toHaveLength(6);
  expect(model.diagnostics.unique_canonical_identities).toBe(6);
  expect(new Set(model.candidates.map((row) => row.canonical_identity)).size).toBe(
    6,
  );
  expect(
    Object.fromEntries(
      model.candidates.map((row) => [row.sample_type, row.cohort]),
    ),
  ).toEqual({
    visible: "visible_recommendation_quality",
    research_only: "research_only_recommendation_quality",
    shadow: "shadow_recommendation_quality",
    historical_synthetic:
      "historical_synthetic_recommendation_quality",
    rejected_candidate: "rejected_candidate_counterfactual",
    no_trade: "no_trade_counterfactual",
  });
});

test("visible metrics use one deterministic 60m primary and keep two diagnostics", () => {
  const model = buildCanonicalEvaluationQualityReadModel([
    action664fVisibleRow,
  ]);
  const candidate = model.candidates[0];

  expect(candidate.eligibility_status).toBe("eligible");
  expect(candidate.primary_horizon).toBe("60m");
  expect(candidate.terminal_outcome).toBe("target_before_stop");
  expect(candidate.r_result).toBe(2);
  expect(candidate.mfe_r).toBe(2.33);
  expect(candidate.mae_r).toBe(-0.33);
  expect(candidate.target_before_stop).toBe("yes");
  expect(candidate.diagnostic_horizons.map((row) => row.horizon).sort()).toEqual(
    ["15m", "30m"],
  );
  expect(model.candidates).toHaveLength(1);
  expect(model.standard_visible_quality_identity_count).toBe(1);
});

test("research-only remains eligible only in its named non-visible cohort", () => {
  const model = buildCanonicalEvaluationQualityReadModel([
    action664fVisibleRow,
    action664fResearchRow,
  ]);
  const research = model.candidates.find(
    (candidate) => candidate.sample_type === "research_only",
  );

  expect(research?.eligibility_status).toBe("eligible");
  expect(research?.cohort).toBe("research_only_recommendation_quality");
  expect(research?.standard_visible_quality_eligible).toBe(false);
  expect(model.standard_visible_quality_identity_count).toBe(1);
  expect(model.standard_visible_quality_identities).toEqual([
    action664fVisibleRow.canonical_identity,
  ]);
});

test("rejected and no-trade never enter ordinary visible quality", () => {
  const model = buildCanonicalEvaluationQualityReadModel(
    action664fAllSampleRows,
  );
  const counterfactuals = model.candidates.filter((candidate) =>
    ["rejected_candidate", "no_trade"].includes(candidate.sample_type),
  );

  expect(counterfactuals).toHaveLength(2);
  expect(
    counterfactuals.map((candidate) => candidate.eligibility_status),
  ).toEqual([
    "counterfactual_not_evaluable",
    "counterfactual_not_evaluable",
  ]);
  expect(counterfactuals.every((row) => !row.standard_visible_quality_eligible))
    .toBe(true);
  expect(model.standard_visible_quality_identity_count).toBe(1);
});

test("provider gap is incomplete and cannot enter standard metrics", () => {
  const model = buildCanonicalEvaluationQualityReadModel([
    action664fProviderGapRow,
  ]);
  const candidate = model.candidates[0];

  expect(candidate.eligibility_status).toBe("incomplete");
  expect(candidate.standard_visible_quality_eligible).toBe(false);
  expect(candidate.reason_codes).toContain("no_complete_primary_horizon");
});

test("same-candle target/stop ambiguity is explicit", () => {
  const model = buildCanonicalEvaluationQualityReadModel([
    action664fAmbiguousRow,
  ]);
  const candidate = model.candidates[0];

  expect(candidate.eligibility_status).toBe("ambiguous");
  expect(candidate.terminal_outcome).toBe("ambiguous_same_candle");
  expect(candidate.r_result).toBeNull();
  expect(candidate.reason_codes).toEqual([
    "target_and_stop_same_candle_ambiguous",
  ]);
});

test("missing excursion evidence makes a complete outcome non-reproducible", () => {
  const model = buildCanonicalEvaluationQualityReadModel([
    action664fNonReproducibleRow,
  ]);
  const candidate = model.candidates[0];

  expect(candidate.eligibility_status).toBe("non_reproducible");
  expect(candidate.reproducible).toBe(false);
  expect(candidate.reason_codes).toContain("missing_mfe_r");
});

test("normalized parity mismatch and tampered envelope fail closed", () => {
  const normalized = buildCanonicalEvaluationQualityReadModel([
    action664fParityMismatchRow,
  ]).candidates[0];
  const envelope = buildCanonicalEvaluationQualityReadModel([
    action664fTamperedEnvelopeRow,
  ]).candidates[0];

  expect(normalized.eligibility_status).toBe("parity_mismatch");
  expect(normalized.reason_codes).toContain(
    "normalized_regime_at_decision_mismatch",
  );
  expect(envelope.eligibility_status).toBe("parity_mismatch");
  expect(envelope.reason_codes).toEqual([
    "semantic_payload_digest_mismatch",
  ]);
});

test("duplicate horizon is conflicting without implicit deduplication", () => {
  const model = buildCanonicalEvaluationQualityReadModel([
    action664fDuplicateHorizonRow,
  ]);
  const candidate = model.candidates[0];

  expect(candidate.eligibility_status).toBe("conflicting");
  expect(candidate.reason_codes).toContain("horizon_inflation_detected");
  expect(candidate.reason_codes).toContain("duplicate_60m_horizon");
  expect(model.diagnostics.horizon_inflation_count).toBe(1);
  expect(model.diagnostics.warning_codes).toContain(
    "horizon_inflation_detected",
  );
  expect(candidate.standard_visible_quality_eligible).toBe(false);
});

test("duplicated canonical identity emits one conflicting row and warning", () => {
  const model = buildCanonicalEvaluationQualityReadModel([
    action664fVisibleRow,
    structuredClone(action664fVisibleRow),
  ]);

  expect(model.candidates).toHaveLength(1);
  expect(model.candidates[0].eligibility_status).toBe("conflicting");
  expect(model.diagnostics.total_input_rows).toBe(2);
  expect(model.diagnostics.unique_canonical_identities).toBe(1);
  expect(model.diagnostics.duplicate_identity_count).toBe(1);
  expect(model.diagnostics.warning_codes).toContain(
    "duplicated_canonical_identity",
  );
});

test("coverage diagnostics separate cohort, sample, window, and day", () => {
  const model = buildCanonicalEvaluationQualityReadModel(
    action664fAllSampleRows,
  );

  expect(
    model.diagnostics.by_cohort.visible_recommendation_quality,
  ).toMatchObject({ expected: 1, eligible: 1, excluded: 0 });
  expect(model.diagnostics.by_sample_type.no_trade).toMatchObject({
    expected: 1,
    counterfactual_not_evaluable: 1,
    excluded: 1,
  });
  expect(model.diagnostics.by_window.morning).toMatchObject({
    expected: 2,
    eligible: 2,
  });
  expect(model.diagnostics.unique_days).toBeGreaterThan(0);
  expect(model.diagnostics.unique_tickers).toBeGreaterThan(0);
  expect(model.diagnostics.aggregate_publication).toEqual({
    cohort: null,
    denominator: null,
    publishable: false,
    reason_codes: [
      "aggregate_cohort_undefined",
      "aggregate_denominator_undefined",
    ],
  });
});

test("read model replay is deterministic and input-immutable", () => {
  const input = cloneAction664fRows(action664fAllSampleRows);
  const before = JSON.stringify(input);
  const first = buildCanonicalEvaluationQualityReadModel(input);
  const second = buildCanonicalEvaluationQualityReadModel(input);

  expect(first).toEqual(second);
  expect(JSON.stringify(input)).toBe(before);
});

test("read model remains absent from existing live consumers", () => {
  const source = readFileSync(
    "lib/server/canonical-evaluation-quality-read-model.ts",
    "utf8",
  );

  expect(source).toContain('import "server-only"');
  expect(source).not.toMatch(/\.(?:insert|update|delete|upsert)\s*\(/);

  const importers = ["app", "components", "scripts"]
    .flatMap(filesRecursively)
    .filter((path) => /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(path))
    .filter((path) =>
      readFileSync(path, "utf8").includes(
        "canonical-evaluation-quality-read-model",
      ),
    );
  expect(importers).toEqual([]);
});
