import { createHash } from "node:crypto";

import {
  classifyChangeSet,
  parseNameStatusZ,
} from "./rel-00-ci-b1-change-classifier.mjs";

const revisionPattern = /^[0-9a-f]{40}$/;
const digestPattern = /^[0-9a-f]{64}$/;
const typedArrayByteLengthGetter = Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Uint8Array.prototype),
  "byteLength",
)?.get;

export const shadowReconciliationPolicy = Object.freeze({
  contract_version: "trade.rel00.ci-b3.shadow-reconciliation.v1",
  required_b2_contract_version:
    "trade.rel00.ci-b2.raw-name-status-acquisition.v1",
  parser_contract_version: "trade.rel00.ci-b1.change-classification.v1",
  maximum_raw_name_status_bytes: 1024 * 1024,
  maximum_legacy_label_count: 32,
  maximum_legacy_label_length: 160,
  legacy_label_charset: "printable_ascii_exact_no_normalization",
});

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const key of Reflect.ownKeys(value)) {
    deepFreeze(value[key], seen);
  }
  return Object.freeze(value);
}

function frozenReceipt(value) {
  return deepFreeze(value);
}

function broadContainment(reason) {
  return frozenReceipt({
    contract_version: shadowReconciliationPolicy.contract_version,
    outcome: "broad_containment_required",
    reason,
    input_binding: null,
    reparse: null,
    legacy_label_snapshot: null,
    reconciliation_status: "not_comparable_non_authoritative",
    effective_tier: 3,
    effective_disposition: "broad_containment",
    manual_review_required: true,
    metadata_verified: false,
    reference_verified: false,
    import_graph_verified: false,
    owned_test_mapping_verified: false,
    fast_path_eligible: false,
    activation_eligible: false,
    selector_connected: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
  });
}

function readB2Observation(observation) {
  if (!observation || typeof observation !== "object") {
    return { ok: false, reason: "b2_observation_not_object" };
  }

  try {
    if (Array.isArray(observation)) {
      return { ok: false, reason: "b2_observation_not_object" };
    }
    return {
      ok: true,
      value: {
        contract_version: observation.contract_version,
        outcome: observation.outcome,
        reason: observation.reason,
        base_revision: observation.base_revision,
        expected_revision: observation.expected_revision,
        merge_base: observation.merge_base,
        raw_name_status_length: observation.raw_name_status_length,
        raw_name_status_sha256: observation.raw_name_status_sha256,
        raw_name_status_z: observation.raw_name_status_z,
        effective_tier: observation.effective_tier,
        effective_disposition: observation.effective_disposition,
        manual_review_required: observation.manual_review_required,
        metadata_verified: observation.metadata_verified,
        reference_verified: observation.reference_verified,
        import_graph_verified: observation.import_graph_verified,
        owned_test_mapping_verified: observation.owned_test_mapping_verified,
        fast_path_eligible: observation.fast_path_eligible,
        activation_eligible: observation.activation_eligible,
        selector_connected: observation.selector_connected,
        execution_plan_emitted: observation.execution_plan_emitted,
        mergeability_decision: observation.mergeability_decision,
      },
    };
  } catch {
    return { ok: false, reason: "b2_observation_property_access_failed" };
  }
}

function canonicalRevision(value) {
  return typeof value === "string" && revisionPattern.test(value);
}

function validAuthorityFlags(snapshot) {
  return (
    snapshot.effective_tier === 3 &&
    snapshot.effective_disposition === "broad_containment" &&
    snapshot.manual_review_required === true &&
    snapshot.metadata_verified === false &&
    snapshot.reference_verified === false &&
    snapshot.import_graph_verified === false &&
    snapshot.owned_test_mapping_verified === false &&
    snapshot.fast_path_eligible === false &&
    snapshot.activation_eligible === false &&
    snapshot.selector_connected === false &&
    snapshot.execution_plan_emitted === false &&
    snapshot.mergeability_decision === false
  );
}

function validB2Observation(snapshot) {
  if (
    snapshot.contract_version !==
      shadowReconciliationPolicy.required_b2_contract_version ||
    snapshot.outcome !== "acquired" ||
    snapshot.reason !== null
  ) {
    return { ok: false, reason: "b2_contract_or_outcome_invalid" };
  }
  if (
    !canonicalRevision(snapshot.base_revision) ||
    !canonicalRevision(snapshot.expected_revision) ||
    !canonicalRevision(snapshot.merge_base)
  ) {
    return { ok: false, reason: "b2_revision_binding_invalid" };
  }
  if (
    !Number.isSafeInteger(snapshot.raw_name_status_length) ||
    snapshot.raw_name_status_length <= 0 ||
    snapshot.raw_name_status_length >
      shadowReconciliationPolicy.maximum_raw_name_status_bytes ||
    typeof snapshot.raw_name_status_sha256 !== "string" ||
    !digestPattern.test(snapshot.raw_name_status_sha256)
  ) {
    return { ok: false, reason: "b2_raw_binding_invalid" };
  }
  if (!validAuthorityFlags(snapshot)) {
    return { ok: false, reason: "b2_authority_flags_invalid" };
  }

  let rawBytes;
  try {
    if (!(snapshot.raw_name_status_z instanceof Uint8Array)) {
      return { ok: false, reason: "b2_raw_bytes_invalid" };
    }
    const actualByteLength = typedArrayByteLengthGetter?.call(
      snapshot.raw_name_status_z,
    );
    if (
      !Number.isSafeInteger(actualByteLength) ||
      actualByteLength > shadowReconciliationPolicy.maximum_raw_name_status_bytes ||
      actualByteLength !== snapshot.raw_name_status_length
    ) {
      return { ok: false, reason: "b2_raw_length_mismatch" };
    }
    rawBytes = new Uint8Array(snapshot.raw_name_status_z);
  } catch {
    return { ok: false, reason: "b2_raw_bytes_invalid" };
  }
  if (rawBytes.length !== snapshot.raw_name_status_length) {
    return { ok: false, reason: "b2_raw_length_mismatch" };
  }

  let actualDigest;
  try {
    actualDigest = createHash("sha256").update(rawBytes).digest("hex");
  } catch {
    return { ok: false, reason: "b2_raw_digest_unavailable" };
  }
  if (actualDigest !== snapshot.raw_name_status_sha256) {
    return { ok: false, reason: "b2_raw_digest_mismatch" };
  }

  return { ok: true, raw_bytes: rawBytes };
}

function captureLegacyLabels(legacyLabels) {
  if (legacyLabels === undefined) {
    return {
      ok: true,
      snapshot: {
        status: "not_supplied",
        labels: [],
      },
    };
  }

  try {
    if (!Array.isArray(legacyLabels)) {
      return { ok: false, reason: "legacy_label_snapshot_invalid" };
    }
    if (legacyLabels.length > shadowReconciliationPolicy.maximum_legacy_label_count) {
      return { ok: false, reason: "legacy_label_snapshot_invalid" };
    }
    const labels = [];
    const seen = new Set();
    for (let index = 0; index < legacyLabels.length; index += 1) {
      const label = legacyLabels[index];
      if (
        typeof label !== "string" ||
        label.length === 0 ||
        label.length > shadowReconciliationPolicy.maximum_legacy_label_length ||
        !/^[\x20-\x7e]+$/.test(label) ||
        seen.has(label)
      ) {
        return { ok: false, reason: "legacy_label_snapshot_invalid" };
      }
      seen.add(label);
      labels.push(label);
    }
    return {
      ok: true,
      snapshot: {
        status: "captured_non_authoritative_not_comparable",
        labels,
      },
    };
  } catch {
    return { ok: false, reason: "legacy_label_snapshot_invalid" };
  }
}

function projectRecord(record) {
  return {
    status: record.status,
    old_path: record.old_path,
    new_path: record.new_path,
    similarity_score: record.similarity_score,
  };
}

function projectConsideredPath(path) {
  return {
    path: path.path,
    side: path.side,
    matched_rules: [...path.matched_rules],
  };
}

function reparseRawBytes(rawBytes) {
  try {
    const records = parseNameStatusZ(new Uint8Array(rawBytes));
    const classification = classifyChangeSet(records);
    if (
      classification.effective_tier !== 3 ||
      classification.effective_disposition !== "broad_containment" ||
      classification.manual_review_required !== true ||
      classification.fast_path_eligible !== false ||
      classification.activation_eligible !== false
    ) {
      return { ok: false, reason: "b1_containment_invariant_invalid" };
    }
    return {
      ok: true,
      reparse: {
        parser_contract_version: shadowReconciliationPolicy.parser_contract_version,
        invariant: "tier_3_broad_containment",
        records: records.map(projectRecord),
        classes: [...classification.classes],
        considered_paths: classification.considered_paths.map(projectConsideredPath),
      },
    };
  } catch {
    return { ok: false, reason: "b1_reparse_or_classification_failed" };
  }
}

/**
 * Creates a source-only, non-authoritative reconciliation receipt. It neither
 * selects tests nor invokes Git; callers must treat every output as Tier 3.
 */
export function buildShadowReconciliationReceipt(
  ciB2Observation,
  legacyLabels = undefined,
) {
  const captured = readB2Observation(ciB2Observation);
  if (!captured.ok) {
    return broadContainment(captured.reason);
  }

  const valid = validB2Observation(captured.value);
  if (!valid.ok) {
    return broadContainment(valid.reason);
  }

  const legacy = captureLegacyLabels(legacyLabels);
  if (!legacy.ok) {
    return broadContainment(legacy.reason);
  }

  const reparsed = reparseRawBytes(valid.raw_bytes);
  if (!reparsed.ok) {
    return broadContainment(reparsed.reason);
  }

  return frozenReceipt({
    contract_version: shadowReconciliationPolicy.contract_version,
    outcome: "shadow_receipt_created",
    reason: null,
    input_binding: {
      base_revision: captured.value.base_revision,
      expected_revision: captured.value.expected_revision,
      merge_base: captured.value.merge_base,
      raw_name_status_length: captured.value.raw_name_status_length,
      raw_name_status_sha256: captured.value.raw_name_status_sha256,
    },
    reparse: reparsed.reparse,
    legacy_label_snapshot: legacy.snapshot,
    reconciliation_status: "not_comparable_non_authoritative",
    effective_tier: 3,
    effective_disposition: "broad_containment",
    manual_review_required: true,
    metadata_verified: false,
    reference_verified: false,
    import_graph_verified: false,
    owned_test_mapping_verified: false,
    fast_path_eligible: false,
    activation_eligible: false,
    selector_connected: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
  });
}
