import { createHash } from "node:crypto";

import { stableMarketContextTradePreparationJsonV2 } from "./trade-to-candle-preparation-v2";

export const MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_ADMISSION_V1 =
  "market_context_databento_dataset_discovery_admission_v1" as const;
export const MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_POLICY_V1 =
  "market_context_databento_dataset_discovery_policy_2026_07_27_v1" as const;

const targetDataset = "EQUS.MINI";
const datasetIdPattern = /^[A-Z0-9]+(?:\.[A-Z0-9-]+)+$/;

export type DatabentoDatasetDiscoveryResponseV1 = {
  http_status: number;
  runtime_value: unknown;
};

export type DatabentoDatasetDiscoveryAdmissionInputV1 = {
  contract_version:
    typeof MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_ADMISSION_V1;
  policy_version:
    typeof MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_POLICY_V1;
  target_dataset: typeof targetDataset;
  sdk_catalog_discovery: {
    method: "metadata.list_datasets";
    parameter_mode: "range_less_catalog_membership" | "ranged_filter";
    parameters: {
      start_date: null | string;
      end_date: null | string;
    };
    response: DatabentoDatasetDiscoveryResponseV1;
  };
  raw_http_comparison:
    | {
        status: "not_performed";
      }
    | {
        status: "provided";
        method: "metadata.list_datasets";
        parameter_mode: "range_less_catalog_membership";
        response: DatabentoDatasetDiscoveryResponseV1;
      };
  range_and_entitlement_boundary: {
    policy:
      "validate_separately_with_get_dataset_range_and_get_dataset_condition";
    catalog_membership_does_not_attest_range_coverage: true;
  };
  dataset_specific_support: {
    evidence_role: "corroboration_only_cannot_override_catalog_membership";
    schemas_endpoint_success: boolean;
    range_endpoint_success: boolean;
    conditions_endpoint_success: boolean;
    symbology_endpoint_success: boolean;
    cost_endpoint_success: boolean;
    size_endpoint_success: boolean;
  };
};

export type DatabentoDatasetListInspectionV1 =
  | {
      status: "valid_dataset_list";
      dataset_count: number;
      unique_dataset_count: number;
      sorted_list_sha256: string;
      exact_ascii_membership: boolean;
      exact_membership_count: number;
      normalized_lookalike_count: number;
    }
  | {
      status: "invalid_dataset_list";
      error_codes: string[];
      dataset_count: number | null;
      sorted_list_sha256: string | null;
      exact_ascii_membership: false;
      exact_membership_count: number;
      normalized_lookalike_count: number;
    };

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizedNearTarget(value: string) {
  return value.normalize("NFKC").trim().toUpperCase() === targetDataset;
}

export function inspectDatabentoDatasetListV1(
  response: DatabentoDatasetDiscoveryResponseV1,
): DatabentoDatasetListInspectionV1 {
  const errors = new Set<string>();
  if (
    !Number.isInteger(response?.http_status) ||
    response.http_status < 200 ||
    response.http_status >= 300
  ) {
    errors.add("dataset_discovery_http_status_not_success");
  }
  const runtime = response?.runtime_value;
  if (
    !Array.isArray(runtime) ||
    runtime.some((value) => typeof value !== "string")
  ) {
    return {
      status: "invalid_dataset_list",
      error_codes: [
        ...errors,
        "dataset_discovery_response_not_list_of_strings",
      ].sort((left, right) => left.localeCompare(right)),
      dataset_count: null,
      sorted_list_sha256: null,
      exact_ascii_membership: false,
      exact_membership_count: 0,
      normalized_lookalike_count: 0,
    };
  }
  const values = runtime as string[];
  if (values.length === 0) {
    errors.add("dataset_discovery_list_empty");
  }
  if (new Set(values).size !== values.length) {
    errors.add("dataset_discovery_duplicate_dataset_id");
  }
  if (values.some((value) => !datasetIdPattern.test(value))) {
    errors.add("dataset_discovery_noncanonical_dataset_id");
  }
  const exactMembershipCount = values.filter(
    (value) => value === targetDataset,
  ).length;
  const normalizedLookalikeCount = values.filter(
    (value) =>
      value !== targetDataset && normalizedNearTarget(value),
  ).length;
  if (exactMembershipCount !== 1) {
    errors.add("dataset_discovery_exact_membership_missing");
  }
  if (normalizedLookalikeCount > 0) {
    errors.add("dataset_discovery_normalized_lookalike_present");
  }
  const sorted = [...values].sort((left, right) =>
    left.localeCompare(right),
  );
  const sortedListSha256 = sha256(
    stableMarketContextTradePreparationJsonV2(sorted),
  );
  if (errors.size > 0) {
    return {
      status: "invalid_dataset_list",
      error_codes: [...errors].sort((left, right) =>
        left.localeCompare(right),
      ),
      dataset_count: values.length,
      sorted_list_sha256: sortedListSha256,
      exact_ascii_membership: false,
      exact_membership_count: exactMembershipCount,
      normalized_lookalike_count: normalizedLookalikeCount,
    };
  }
  return {
    status: "valid_dataset_list",
    dataset_count: values.length,
    unique_dataset_count: values.length,
    sorted_list_sha256: sortedListSha256,
    exact_ascii_membership: true,
    exact_membership_count: 1,
    normalized_lookalike_count: 0,
  };
}

function fail(errors: Set<string>) {
  return {
    status: "not_admitted" as const,
    contract_version:
      MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_ADMISSION_V1,
    error_codes: [...errors].sort((left, right) =>
      left.localeCompare(right),
    ),
    dataset_membership_verified: false as const,
    dataset_specific_support_overrode_membership: false as const,
    batch_submission_authorized: false as const,
    download_authorized: false as const,
    normalization_authorized: false as const,
    replay_authorized: false as const,
    canonical_binding_ready: false as const,
    live_ranking_effect: false as const,
  };
}

export function evaluateDatabentoDatasetDiscoveryAdmissionV1(
  input: unknown,
) {
  const errors = new Set<string>();
  try {
    const value = input as DatabentoDatasetDiscoveryAdmissionInputV1;
    const before = stableMarketContextTradePreparationJsonV2(value);
    if (
      value?.contract_version !==
        MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_ADMISSION_V1 ||
      value?.policy_version !==
        MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_POLICY_V1 ||
      value?.target_dataset !== targetDataset
    ) {
      errors.add("dataset_discovery_contract_invalid");
    }
    const sdk = value?.sdk_catalog_discovery;
    if (
      sdk?.method !== "metadata.list_datasets" ||
      sdk?.parameter_mode !== "range_less_catalog_membership" ||
      sdk?.parameters?.start_date !== null ||
      sdk?.parameters?.end_date !== null
    ) {
      errors.add(
        "range_filtered_discovery_not_valid_for_catalog_membership",
      );
    }
    const sdkInspection = inspectDatabentoDatasetListV1(
      sdk?.response,
    );
    if (sdkInspection.status !== "valid_dataset_list") {
      for (const code of sdkInspection.error_codes) {
        errors.add(code);
      }
    }
    const raw = value?.raw_http_comparison;
    if (raw?.status === "provided") {
      if (
        raw.method !== "metadata.list_datasets" ||
        raw.parameter_mode !== "range_less_catalog_membership"
      ) {
        errors.add("raw_http_discovery_contract_invalid");
      }
      const rawInspection = inspectDatabentoDatasetListV1(
        raw.response,
      );
      if (rawInspection.status !== "valid_dataset_list") {
        errors.add("raw_http_dataset_membership_invalid");
      } else if (
        sdkInspection.status !== "valid_dataset_list" ||
        rawInspection.sorted_list_sha256 !==
          sdkInspection.sorted_list_sha256
      ) {
        errors.add("sdk_raw_http_dataset_discovery_disagreement");
      }
    } else if (raw?.status !== "not_performed") {
      errors.add("raw_http_comparison_status_invalid");
    }
    if (
      value?.range_and_entitlement_boundary?.policy !==
        "validate_separately_with_get_dataset_range_and_get_dataset_condition" ||
      value.range_and_entitlement_boundary
        .catalog_membership_does_not_attest_range_coverage !== true
    ) {
      errors.add("dataset_range_entitlement_boundary_invalid");
    }
    if (
      value?.dataset_specific_support?.evidence_role !==
      "corroboration_only_cannot_override_catalog_membership"
    ) {
      errors.add("dataset_specific_support_role_invalid");
    }
    if (
      stableMarketContextTradePreparationJsonV2(value) !== before
    ) {
      errors.add("dataset_discovery_input_mutated");
    }
    if (errors.size > 0) {
      return fail(errors);
    }
    const support = value.dataset_specific_support;
    return {
      status: "dataset_membership_admitted" as const,
      contract_version:
        MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_ADMISSION_V1,
      policy_version:
        MARKET_CONTEXT_DATABENTO_DATASET_DISCOVERY_POLICY_V1,
      target_dataset: targetDataset,
      membership_source:
        "range_less_metadata.list_datasets_exact_ascii" as const,
      dataset_count: sdkInspection.dataset_count,
      sorted_list_sha256: sdkInspection.sorted_list_sha256,
      dataset_membership_verified: true as const,
      range_and_entitlement_remain_separate_gates: true as const,
      dataset_specific_support_overrode_membership: false as const,
      corroborating_endpoint_success_count: [
        support.schemas_endpoint_success,
        support.range_endpoint_success,
        support.conditions_endpoint_success,
        support.symbology_endpoint_success,
        support.cost_endpoint_success,
        support.size_endpoint_success,
      ].filter(Boolean).length,
      metadata_inferred: false as const,
      batch_submission_authorized: false as const,
      download_authorized: false as const,
      normalization_authorized: false as const,
      replay_authorized: false as const,
      canonical_binding_ready: false as const,
      live_ranking_effect: false as const,
    };
  } catch {
    errors.add("dataset_discovery_malformed_runtime_input");
    return fail(errors);
  }
}
