import { expect, test } from "@playwright/test";

import goldenReport from "@/docs/action-666cs-golden-non-forgeable-observation-authority-report.json";
import {
  action666csAlternativeRootEnvelopeJson,
  action666csAuthorityEnvelope,
  action666csAuthorityEnvelopeJson,
  action666csAuthorityPayload,
  action666csCrossSessionEnvelopeJson,
  action666csDependencies,
  action666csDuplicateKeyEnvelopeJson,
  action666csIssue,
  action666csMalformedNestedRequest,
  action666csRequest,
  action666csSemanticDriftRequest,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import {
  CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID,
  CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ARTIFACT_ROLES,
  CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_STATUSES,
  CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION,
  CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION,
  CANONICAL_NON_FORGEABLE_MAX_ENVELOPE_UTF8_BYTES,
  CANONICAL_NON_FORGEABLE_NESTED_REQUEST_BUDGETS,
  CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_DIGEST,
  CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_ROOT_DIGEST,
  CANONICAL_NON_FORGEABLE_PINNED_NESTED_SCHEMA_DIGEST,
  CANONICAL_NON_FORGEABLE_PINNED_SEMANTIC_SCOPE_DIGEST,
  DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ENABLED,
  DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH,
  canonicalNonForgeableBindingSnapshotIssuanceDigest,
  canonicalNonForgeableIssuerAuthorityEnvelopeJson,
  canonicalNonForgeableIssuerAuthorityPayloadDigest,
  canonicalNonForgeableNestedRequestSchemaDigest,
  createCanonicalNonForgeableBindingSnapshotIssuanceHarness,
  verifyCanonicalNonForgeableBindingSnapshotIssuanceResult,
  type CanonicalNonForgeableBindingSnapshotIssuanceResult,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance";
import {
  action666bqSelfConsistentReplacementDependencies,
} from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures";

test.describe.configure({ timeout: 120_000 });

function activeHarness(
  dependencies = action666csDependencies(),
) {
  return createCanonicalNonForgeableBindingSnapshotIssuanceHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies,
  });
}

function recompute(
  value: CanonicalNonForgeableBindingSnapshotIssuanceResult,
) {
  const changed = structuredClone(value);
  const projection = structuredClone(changed);
  delete (
    projection as Partial<CanonicalNonForgeableBindingSnapshotIssuanceResult>
  ).issuance_digest;
  changed.issuance_digest =
    canonicalNonForgeableBindingSnapshotIssuanceDigest(projection);
  return changed;
}

test.describe("Action 666CS current-main non-forgeable observation authority", () => {
  test("freezes the taxonomy, budgets, pins and five-file foundation", () => {
    expect(CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_STATUSES).toEqual([
      "issued",
      "incomplete",
      "conflicting",
      "not_point_in_time_safe",
      "rollback_rejected",
    ]);
    expect(
      Object.isFrozen(
        CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_STATUSES,
      ),
    ).toBe(true);
    expect(
      Object.keys(
        CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ARTIFACT_ROLES,
      ),
    ).toHaveLength(5);
    expect(
      CANONICAL_NON_FORGEABLE_NESTED_REQUEST_BUDGETS.inherited_policy
        .max_depth,
    ).toBe(128);
    expect(CANONICAL_NON_FORGEABLE_MAX_ENVELOPE_UTF8_BYTES).toBe(32_768);
    expect(CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_DIGEST).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_ROOT_DIGEST).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(CANONICAL_NON_FORGEABLE_PINNED_NESTED_SCHEMA_DIGEST).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(CANONICAL_NON_FORGEABLE_PINNED_SEMANTIC_SCOPE_DIGEST).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ENABLED).toBe(
      false,
    );
    expect(
      DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH,
    ).toBe(true);
    expect(goldenReport).toMatchObject({
      contract_version:
        CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION,
      authority_digest: CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_DIGEST,
      authority_root_digest:
        CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_ROOT_DIGEST,
      nested_schema_digest:
        CANONICAL_NON_FORGEABLE_PINNED_NESTED_SCHEMA_DIGEST,
      semantic_scope_digest:
        CANONICAL_NON_FORGEABLE_PINNED_SEMANTIC_SCOPE_DIGEST,
      performance_claimed: false,
    });
  });

  test("binds one canonical signed raw-JSON authority envelope", () => {
    expect(action666csAuthorityEnvelope).toMatchObject({
      envelope_version:
        CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION,
      payload: {
        authority_session_identity:
          CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID,
        expected_authority_digest:
          CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_DIGEST,
        expected_authority_root_digest:
          CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_ROOT_DIGEST,
        expected_nested_schema_digest:
          CANONICAL_NON_FORGEABLE_PINNED_NESTED_SCHEMA_DIGEST,
        expected_semantic_scope_digest:
          CANONICAL_NON_FORGEABLE_PINNED_SEMANTIC_SCOPE_DIGEST,
      },
      signature_algorithm: "ed25519_sha256_canonical_json_v1",
    });
    expect(action666csAuthorityEnvelope.signature_base64).toMatch(
      /^[A-Za-z0-9+/]{86}==$/,
    );
    expect(
      canonicalNonForgeableIssuerAuthorityPayloadDigest(
        action666csAuthorityPayload,
      ),
    ).toBe(action666csAuthorityPayload.authority_payload_digest);
    expect(
      canonicalNonForgeableNestedRequestSchemaDigest(action666csRequest),
    ).toBe(CANONICAL_NON_FORGEABLE_PINNED_NESTED_SCHEMA_DIGEST);
    expect(
      canonicalNonForgeableIssuerAuthorityEnvelopeJson(
        Object.fromEntries(
          Object.entries(action666csAuthorityEnvelope).reverse(),
        ),
      ),
    ).toBe(action666csAuthorityEnvelopeJson);
  });

  test("is literal-default-off and kill-switch fail-closed with zero reads", () => {
    let reads = 0;
    const dependencies = action666csDependencies();
    dependencies.authority_dependency.read_signed_authority_envelope_json =
      () => {
        reads += 1;
        throw new Error("must_not_read");
      };
    const disabled =
      createCanonicalNonForgeableBindingSnapshotIssuanceHarness({
        enabled: false,
        kill_switch_engaged: false,
        dependencies,
      });
    const killed =
      createCanonicalNonForgeableBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: true,
        dependencies,
      });
    const omitted =
      createCanonicalNonForgeableBindingSnapshotIssuanceHarness();
    expect(disabled).toMatchObject({ status: "disabled", issue: null });
    expect(killed).toMatchObject({
      status: "kill_switch_engaged",
      issue: null,
    });
    expect(omitted).toMatchObject({ status: "disabled", issue: null });
    expect(reads).toBe(0);
    for (const harness of [disabled, killed, omitted]) {
      expect(harness.counters).toMatchObject({
        request_reads: 0,
        envelope_reads: 0,
        predecessor_executions: 0,
      });
    }
  });

  test("rejects nonliteral and extra active option shells", () => {
    for (const input of [
      {
        enabled: 1,
        kill_switch_engaged: false,
        dependencies: action666csDependencies(),
      },
      {
        enabled: true,
        kill_switch_engaged: 0,
        dependencies: action666csDependencies(),
      },
      { enabled: true, kill_switch_engaged: false },
      {
        enabled: true,
        kill_switch_engaged: false,
        dependencies: action666csDependencies(),
        extra: true,
      },
    ]) {
      const harness =
        createCanonicalNonForgeableBindingSnapshotIssuanceHarness(
          input as never,
        );
      expect(harness.issue).toBeNull();
    }
  });

  test("issues through CS to CQ, BD, AX, AJ, AC, V and AQ", () => {
    const harness = activeHarness();
    expect(harness.status).toBe("ready");
    const issued = harness.issue!(action666csRequest);
    expect(issued).toMatchObject({
      issuance_version:
        CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION,
      status: "issued",
      nested_schema_closed: true,
      authority_signature_verified: true,
      authority_pins_verified: true,
      runtime_provenance_verified: true,
      predecessor_result_verified: true,
      authority_digest: CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_DIGEST,
      authority_root_digest:
        CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_ROOT_DIGEST,
      shadow_only: true,
      live_impact: false,
      persistence_performed: false,
      automatic_model_change_allowed: false,
      automatic_promotion_allowed: false,
      external_ai_canonical_truth_authority: false,
      synthetic_evidence: true,
      not_publishable: true,
    });
    expect(issued.predecessor_result).toMatchObject({
      status: "issued",
      binding_backed_replay_verified: true,
    });
    expect(
      verifyCanonicalNonForgeableBindingSnapshotIssuanceResult({
        request: action666csRequest,
        result: issued,
        harness,
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });
    expect(harness.counters).toMatchObject({
      request_reads: 1,
      envelope_reads: 1,
      authority_envelope_verification_attempts: 1,
      predecessor_harness_constructions: 1,
      predecessor_executions: 1,
      predecessor_rebuilds: 1,
    });
  });

  test("reads the external signed envelope exactly once per issuance", () => {
    const dependencies = action666csDependencies();
    const original =
      dependencies.authority_dependency
        .read_signed_authority_envelope_json;
    let reads = 0;
    dependencies.authority_dependency.read_signed_authority_envelope_json =
      function (this: unknown) {
        expect(this).toBeUndefined();
        reads += 1;
        return original();
      };
    const harness = activeHarness(dependencies);
    expect(harness.issue!(action666csRequest).status).toBe("issued");
    expect(reads).toBe(1);
  });

  test("rejects a self-consistent alternative root without signature authority", () => {
    const result = action666csIssue(
      action666csRequest,
      action666csDependencies(action666csAlternativeRootEnvelopeJson()),
    );
    expect(result).toMatchObject({
      status: "conflicting",
      authority_signature_verified: false,
      authority_pins_verified: false,
      predecessor_result: null,
      predecessor_result_verified: false,
      reason_codes: ["non_forgeable_external_authority_unverified"],
    });
  });

  test("rejects a separately minted self-consistent CQ authority", () => {
    const dependencies = action666csDependencies();
    dependencies.predecessor_dependencies =
      action666bqSelfConsistentReplacementDependencies();
    const result = action666csIssue(action666csRequest, dependencies);
    expect(result).toMatchObject({
      status: "conflicting",
      authority_signature_verified: true,
      authority_pins_verified: true,
      predecessor_result_verified: true,
      reason_codes: ["non_forgeable_predecessor_authority_mismatch"],
    });
    expect(result.predecessor_result?.status).toBe("conflicting");
  });

  test("rejects cross-session, duplicate-key and bad-signature envelopes", () => {
    const badSignature = structuredClone(
      action666csAuthorityEnvelope,
    ) as {
      envelope_version: typeof action666csAuthorityEnvelope.envelope_version;
      payload: typeof action666csAuthorityPayload;
      signature_algorithm: typeof action666csAuthorityEnvelope.signature_algorithm;
      signature_base64: string;
    };
    badSignature.signature_base64 = `${badSignature.signature_base64.slice(0, -3)}A==`;
    const cases = [
      action666csCrossSessionEnvelopeJson(),
      action666csDuplicateKeyEnvelopeJson(),
      canonicalNonForgeableIssuerAuthorityEnvelopeJson(badSignature),
      "{",
    ];
    for (const raw of cases) {
      const result = action666csIssue(
        action666csRequest,
        action666csDependencies(raw),
      );
      expect(result.status, raw.slice(0, 20)).toBe("conflicting");
      expect(result.predecessor_result).toBeNull();
      expect(result.authority_signature_verified).toBe(false);
    }
  });

  test("rejects an oversized envelope before parsing or predecessor work", () => {
    const oversized = "x".repeat(
      CANONICAL_NON_FORGEABLE_MAX_ENVELOPE_UTF8_BYTES + 1,
    );
    const harness = activeHarness(action666csDependencies(oversized));
    const result = harness.issue!(action666csRequest);
    expect(result.status).toBe("conflicting");
    expect(result.predecessor_result).toBeNull();
    expect(harness.counters).toMatchObject({
      envelope_reads: 1,
      envelope_byte_validations: 1,
      envelope_parses: 0,
      authority_envelope_verification_attempts: 0,
      predecessor_executions: 0,
    });
  });

  test("contains authority reader failure without predecessor work", () => {
    const dependencies = action666csDependencies();
    dependencies.authority_dependency.read_signed_authority_envelope_json =
      () => {
        throw new Error("external_reader_failed");
      };
    const harness = activeHarness(dependencies);
    expect(() => harness.issue!(action666csRequest)).not.toThrow();
    expect(harness.issue!(action666csRequest)).toMatchObject({
      status: "conflicting",
      predecessor_result: null,
      reason_codes: ["non_forgeable_authority_read_failed"],
    });
    expect(harness.counters.predecessor_executions).toBe(0);
  });

  test("rejects malformed nested requests before external authority access", () => {
    const cases: unknown[] = [
      {},
      action666csMalformedNestedRequest("a"),
      action666csMalformedNestedRequest("b"),
      { ...structuredClone(action666csRequest), unexpected: true },
    ];
    for (const request of cases) {
      let reads = 0;
      const dependencies = action666csDependencies();
      dependencies.authority_dependency.read_signed_authority_envelope_json =
        () => {
          reads += 1;
          return action666csAuthorityEnvelopeJson;
        };
      const harness = activeHarness(dependencies);
      expect(() => harness.issue!(request)).not.toThrow();
      const invalid = harness.issue!(request);
      expect(invalid.status).toBe("incomplete");
      expect(invalid.predecessor_result).toBeNull();
      expect(reads).toBe(0);
    }
  });

  test("rejects semantic request drift before external authority access", () => {
    for (const marker of ["semantic-drift-a", "semantic-drift-b"]) {
      let reads = 0;
      const dependencies = action666csDependencies();
      dependencies.authority_dependency.read_signed_authority_envelope_json =
        () => {
          reads += 1;
          return action666csAuthorityEnvelopeJson;
        };
      const harness = activeHarness(dependencies);
      const result = harness.issue!(
        action666csSemanticDriftRequest(marker),
      );
      expect(result).toMatchObject({
        status: "incomplete",
        reason_codes: ["non_forgeable_request_signed_scope_mismatch"],
        predecessor_result: null,
      });
      expect(reads).toBe(0);
    }
  });

  test("rejects proxies and accessors without invoking caller hooks", () => {
    let trapReads = 0;
    const proxy = new Proxy(structuredClone(action666csRequest), {
      get() {
        trapReads += 1;
        throw new Error("proxy_get_executed");
      },
      ownKeys() {
        trapReads += 1;
        throw new Error("proxy_own_keys_executed");
      },
    });
    const accessor = structuredClone(
      action666csRequest,
    ) as unknown as Record<string, unknown>;
    Object.defineProperty(accessor, "issuance_identity", {
      enumerable: true,
      get() {
        trapReads += 1;
        throw new Error("accessor_executed");
      },
    });
    for (const request of [proxy, accessor]) {
      const harness = activeHarness();
      expect(() => harness.issue!(request)).not.toThrow();
      expect(harness.issue!(request).status).toBe("incomplete");
      expect(harness.counters.envelope_reads).toBe(0);
    }
    expect(trapReads).toBe(0);
  });

  test("bounds extreme nesting before envelope access and never recurses", () => {
    const root: Record<string, unknown> = {};
    let cursor = root;
    for (let index = 0; index < 20_000; index += 1) {
      const next: Record<string, unknown> = {};
      cursor.next = next;
      cursor = next;
    }
    const harness = activeHarness();
    expect(() => harness.issue!(root)).not.toThrow();
    expect(harness.issue!(root)).toMatchObject({
      status: "incomplete",
      predecessor_result: null,
    });
    expect(harness.counters.envelope_reads).toBe(0);
  });

  test("canonicalizes reordered valid requests without semantic drift", () => {
    const reordered = Object.fromEntries(
      Object.entries(structuredClone(action666csRequest)).reverse(),
    );
    const original = action666csIssue();
    const changed = action666csIssue(reordered);
    expect(changed.status).toBe("issued");
    expect(changed.request_digest).toBe(original.request_digest);
    expect(changed.issuance_digest).toBe(original.issuance_digest);
  });

  test("captures dependency callbacks and pins at harness construction", () => {
    const dependencies = action666csDependencies();
    const harness = activeHarness(dependencies);
    dependencies.authority_dependency.read_signed_authority_envelope_json =
      () => action666csAlternativeRootEnvelopeJson();
    dependencies.predecessor_dependencies.issuer_authority_dependency.expected_authority_digest =
      "f".repeat(64);
    dependencies.predecessor_dependencies.issuer_authority_dependency.read_expected_authority =
      () => {
        throw new Error("mutated_predecessor_reader");
      };
    expect(harness.issue!(action666csRequest).status).toBe("issued");
  });

  test("keeps verifier authority private to the originating harness", () => {
    const harness = activeHarness();
    const issued = harness.issue!(action666csRequest);
    const copiedHarness = { ...harness };
    const copiedResult = structuredClone(issued);
    expect(
      verifyCanonicalNonForgeableBindingSnapshotIssuanceResult({
        request: action666csRequest,
        result: copiedResult,
        harness: copiedHarness,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["non_forgeable_harness_unrecognized"],
    });
  });

  test("does not grant verifier authority to malformed request diagnostics", () => {
    const harness = activeHarness();
    const invalid = harness.issue!({});
    expect(
      verifyCanonicalNonForgeableBindingSnapshotIssuanceResult({
        request: {},
        result: invalid,
        harness,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["non_forgeable_invalid_request_not_authoritative"],
    });
  });

  test("rejects a tampered result even after public digest recomputation", () => {
    const harness = activeHarness();
    const issued = harness.issue!(action666csRequest);
    const changed = structuredClone(issued);
    changed.authority_pins_verified = false;
    const forged = recompute(changed);
    expect(forged.issuance_digest).not.toBe(issued.issuance_digest);
    expect(
      verifyCanonicalNonForgeableBindingSnapshotIssuanceResult({
        request: action666csRequest,
        result: forged,
        harness,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["non_forgeable_result_rebuild_mismatch"],
    });
  });

  test("contains post-import mutable-global drift on the full issue path", () => {
    const harness = activeHarness();
    let issued: CanonicalNonForgeableBindingSnapshotIssuanceResult | null =
      null;
    let thrown: unknown = null;
    const originals = {
      parse: JSON.parse,
      freeze: Object.freeze,
      sort: Array.prototype.sort,
      charCodeAt: String.prototype.charCodeAt,
      weakMapGet: WeakMap.prototype.get,
      regexpExec: RegExp.prototype.exec,
      structuredClone: globalThis.structuredClone,
    };
    try {
      JSON.parse = () => {
        throw new Error("poisoned_json_parse");
      };
      Object.freeze = ((value: object) => value) as typeof Object.freeze;
      Array.prototype.sort = function () {
        throw new Error("poisoned_array_sort");
      };
      String.prototype.charCodeAt = function () {
        throw new Error("poisoned_char_code");
      };
      WeakMap.prototype.get = function () {
        throw new Error("poisoned_weak_map_get");
      };
      RegExp.prototype.exec = function () {
        throw new Error("poisoned_regexp_exec");
      };
      globalThis.structuredClone = (() => {
        throw new Error("poisoned_structured_clone");
      }) as typeof structuredClone;
      try {
        issued = harness.issue!(action666csRequest);
      } catch (error) {
        thrown = error;
      }
    } finally {
      JSON.parse = originals.parse;
      Object.freeze = originals.freeze;
      Array.prototype.sort = originals.sort;
      String.prototype.charCodeAt = originals.charCodeAt;
      WeakMap.prototype.get = originals.weakMapGet;
      RegExp.prototype.exec = originals.regexpExec;
      globalThis.structuredClone = originals.structuredClone;
    }
    expect(thrown).toBeNull();
    expect(issued).toMatchObject({
      issuance_version:
        CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION,
    });
    expect(Object.isFrozen(issued)).toBe(true);
    expect(JSON.stringify(issued)).not.toContain("poisoned_");
  });
});
