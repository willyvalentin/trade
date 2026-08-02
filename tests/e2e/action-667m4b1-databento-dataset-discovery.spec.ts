import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_ADMISSION_V1,
  MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_POLICY_V1,
  evaluateDatabentoDatasetDiscoveryAdmissionV1,
  inspectDatabentoDatasetListV1,
  type DatabentoDatasetDiscoveryAdmissionInputV1,
} from "../../lib/market-context-intelligence-lab/databento-dataset-discovery-admission-v1";
import { stableMarketContextTradePreparationJsonV2 } from "../../lib/market-context-intelligence-lab/trade-to-candle-preparation-v2";

const repositoryRoot = resolve(process.cwd());
const rangeLessDatasets = [
  "EQUS.MINI",
  "GLBX.MDP3",
  "XNAS.ITCH",
];

function inputFixture(): DatabentoDatasetDiscoveryAdmissionInputV1 {
  return {
    contract_version:
      MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_ADMISSION_V1,
    policy_version:
      MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_POLICY_V1,
    target_dataset: "EQUS.MINI",
    sdk_catalog_discovery: {
      method: "metadata.list_datasets",
      parameter_mode: "range_less_catalog_membership",
      parameters: {
        start_date: null,
        end_date: null,
      },
      response: {
        http_status: 200,
        runtime_value: structuredClone(rangeLessDatasets),
      },
    },
    raw_http_comparison: {
      status: "not_performed",
    },
    range_and_entitlement_boundary: {
      policy:
        "validate_separately_with_get_dataset_range_and_get_dataset_condition",
      catalog_membership_does_not_attest_range_coverage: true,
    },
    dataset_specific_support: {
      evidence_role:
        "corroboration_only_cannot_override_catalog_membership",
      schemas_endpoint_success: true,
      range_endpoint_success: true,
      conditions_endpoint_success: true,
      symbology_endpoint_success: true,
      cost_endpoint_success: true,
      size_endpoint_success: true,
    },
  };
}

function errorCodes(result: unknown) {
  const value = result as {
    status?: string;
    error_codes?: unknown;
  };
  expect(value.status).toBe("not_admitted");
  expect(Array.isArray(value.error_codes)).toBe(true);
  return value.error_codes as string[];
}

test("range-less exact ASCII membership is admitted without granting authorization", () => {
  const input = inputFixture();
  const before = stableMarketContextTradePreparationJsonV2(input);
  const result =
    evaluateDatabentoDatasetDiscoveryAdmissionV1(input);
  expect(result).toMatchObject({
    status: "dataset_membership_admitted",
    membership_source:
      "range_less_metadata.list_datasets_exact_ascii",
    dataset_membership_verified: true,
    range_and_entitlement_remain_separate_gates: true,
    dataset_specific_support_overrode_membership: false,
    corroborating_endpoint_success_count: 6,
    batch_submission_authorized: false,
    download_authorized: false,
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
  expect(stableMarketContextTradePreparationJsonV2(input)).toBe(
    before,
  );
});

test("ranged discovery cannot be reused as catalog membership", () => {
  const rangeLess = inspectDatabentoDatasetListV1({
    http_status: 200,
    runtime_value: rangeLessDatasets,
  });
  const ranged = inspectDatabentoDatasetListV1({
    http_status: 200,
    runtime_value: ["GLBX.MDP3", "XNAS.ITCH"],
  });
  expect(rangeLess.sorted_list_sha256).not.toBe(
    ranged.sorted_list_sha256,
  );
  const input = inputFixture();
  input.sdk_catalog_discovery.parameter_mode = "ranged_filter";
  input.sdk_catalog_discovery.parameters = {
    start_date: "2026-07-20",
    end_date: "2026-07-25",
  };
  input.sdk_catalog_discovery.response.runtime_value = [
    "GLBX.MDP3",
    "XNAS.ITCH",
  ];
  expect(
    errorCodes(
      evaluateDatabentoDatasetDiscoveryAdmissionV1(input),
    ),
  ).toContain(
    "range_filtered_discovery_not_valid_for_catalog_membership",
  );
});

test("whitespace and Unicode lookalike dataset IDs fail closed", () => {
  for (const lookalike of [
    "EQUS.MINI ",
    "ＥＱＵＳ.ＭＩＮＩ",
  ]) {
    const input = inputFixture();
    input.sdk_catalog_discovery.response.runtime_value = [
      lookalike,
      "GLBX.MDP3",
    ];
    const codes = errorCodes(
      evaluateDatabentoDatasetDiscoveryAdmissionV1(input),
    );
    expect(codes).toContain(
      "dataset_discovery_exact_membership_missing",
    );
    expect(codes).toContain(
      "dataset_discovery_normalized_lookalike_present",
    );
  }
});

test("malformed response and duplicate IDs are rejected", () => {
  const malformed = inputFixture();
  malformed.sdk_catalog_discovery.response.runtime_value = {
    datasets: rangeLessDatasets,
  };
  expect(
    errorCodes(
      evaluateDatabentoDatasetDiscoveryAdmissionV1(malformed),
    ),
  ).toContain("dataset_discovery_response_not_list_of_strings");

  const duplicate = inputFixture();
  duplicate.sdk_catalog_discovery.response.runtime_value = [
    ...rangeLessDatasets,
    "EQUS.MINI",
  ];
  expect(
    errorCodes(
      evaluateDatabentoDatasetDiscoveryAdmissionV1(duplicate),
    ),
  ).toContain("dataset_discovery_duplicate_dataset_id");
});

test("SDK and raw HTTP disagreement cannot be admitted", () => {
  const input = inputFixture();
  input.raw_http_comparison = {
    status: "provided",
    method: "metadata.list_datasets",
    parameter_mode: "range_less_catalog_membership",
    response: {
      http_status: 200,
      runtime_value: [...rangeLessDatasets, "OPRA.PILLAR"],
    },
  };
  expect(
    errorCodes(
      evaluateDatabentoDatasetDiscoveryAdmissionV1(input),
    ),
  ).toContain("sdk_raw_http_dataset_discovery_disagreement");
});

test("missing membership remains blocked despite all dataset-specific endpoints succeeding", () => {
  const input = inputFixture();
  input.sdk_catalog_discovery.response.runtime_value = [
    "GLBX.MDP3",
    "XNAS.ITCH",
  ];
  expect(
    errorCodes(
      evaluateDatabentoDatasetDiscoveryAdmissionV1(input),
    ),
  ).toContain("dataset_discovery_exact_membership_missing");
  expect(
    input.dataset_specific_support,
  ).toMatchObject({
    schemas_endpoint_success: true,
    range_endpoint_success: true,
    conditions_endpoint_success: true,
    symbology_endpoint_success: true,
    cost_endpoint_success: true,
    size_endpoint_success: true,
  });
});

test("input ordering is deterministic", () => {
  const first = inputFixture();
  const second = inputFixture();
  second.sdk_catalog_discovery.response.runtime_value = [
    ...rangeLessDatasets,
  ].reverse();
  expect(
    evaluateDatabentoDatasetDiscoveryAdmissionV1(first),
  ).toEqual(
    evaluateDatabentoDatasetDiscoveryAdmissionV1(second),
  );
});

test("B.1 evidence digest, readable report and no-effect statuses are in parity", () => {
  const evidencePath =
    "docs/evidence/action-667m4b1-databento-dataset-discovery-remediation.json";
  const evidence = JSON.parse(
    readFileSync(resolve(repositoryRoot, evidencePath), "utf8"),
  ) as {
    evidence_digest: string;
    decision_material: {
      statuses: Record<string, boolean>;
    };
  };
  const calculated = createHash("sha256")
    .update(
      stableMarketContextTradePreparationJsonV2(
        evidence.decision_material,
      ),
    )
    .digest("hex");
  expect(evidence.evidence_digest).toBe(calculated);
  const doc = readFileSync(
    resolve(
      repositoryRoot,
      "docs/action-667m4b1-databento-dataset-discovery-contract-remediation.md",
    ),
    "utf8",
  );
  expect(doc).toContain(calculated);
  for (const [key, value] of Object.entries(
    evidence.decision_material.statuses,
  )) {
    expect(doc).toContain(`${key}: ${String(value)}`);
  }
});

test("B.1 module has no credential, provider client, batch, timeseries, database, replay or live import", () => {
  const source = readFileSync(
    resolve(
      repositoryRoot,
      "lib/market-context-intelligence-lab/databento-dataset-discovery-admission-v1.ts",
    ),
    "utf8",
  );
  for (const forbidden of [
    "DATABENTO_API_KEY",
    "submit_job",
    "timeseries.get_range",
    "batch.download",
    "fetch(",
    "axios",
    "supabase",
    "shadow-replay",
    "scanner",
    "recommendation",
  ]) {
    expect(source.toLowerCase()).not.toContain(
      forbidden.toLowerCase(),
    );
  }
  expect(source).not.toContain("from \"databento");
});
