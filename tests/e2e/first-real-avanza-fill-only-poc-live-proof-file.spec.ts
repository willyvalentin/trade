import { expect, test } from "@playwright/test";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildFirstRealAvanzaFillOnlyPocLiveProofDocument,
  firstRealAvanzaFillOnlyPocQuantityBasedProofFilePath,
  writeFirstRealAvanzaFillOnlyPocLiveProofFile,
} from "../../lib/first-real-avanza-fill-only-poc-live-proof-file";

const structuredRunnerFixture = {
  status: "final_live_execute_attempt_explicit_invocation_trigger_aborted",
  trigger_plan_created: false,
  selected_input_strategy: "quantity_based",
  preflight_or_visible_state_verification_result: {
    ok: true,
    account_visible: "Valentin Labs KF",
    instrument_visible: "GameStop",
  },
  quantity_fill_attempted: true,
  quantity_fill_verified: false,
  quantity_candidate_diagnostics_if_failed: {
    quantity_candidate_count: 1,
    selected_candidate: {
      tied_to_antal_label_or_volume: true,
      candidate_disabled: false,
      candidate_readonly: false,
      candidate_hidden: false,
    },
    before_value_normalized: "",
    after_value_normalized: "",
    readback_source_used: "input.value",
    expected_normalized: "1",
    observed_normalized: "",
    exact_blocker_reason: "readback_mismatch",
  },
  price_fill_attempted: false,
  price_fill_verified: false,
  total_read: null,
  total_valid: false,
  evidence_ids: ["visible-state-1"],
  stopped_before_granska_kop: true,
  no_review_modal: true,
  no_final_confirmation: true,
  no_order_placement: true,
  errors_blockers_warnings: {
    blockers: ["runner:quantity_fill_failed"],
    warnings: [],
    errors: [],
  },
};

const successfulStructuredRunnerFixture = {
  ...structuredRunnerFixture,
  status: "final_live_execute_attempt_explicit_invocation_trigger_plan_created",
  trigger_plan_created: true,
  quantity_fill_verified: true,
  price_fill_attempted: true,
  price_fill_verified: true,
  total_read: 438.05,
  total_valid: true,
  evidence_ids: [
    "visible-state-1",
    "quantity-filled-1",
    "price-filled-1",
    "total-read-1",
    "stopped-before-review-1",
  ],
  errors_blockers_warnings: {
    blockers: [],
    warnings: [],
    errors: [],
  },
};

const structuredRunnerWithBridgeDiagnostics = {
  ...structuredRunnerFixture,
  quantity_candidate_diagnostics_if_failed: null,
  runner_calls: [
    {
      method: "verifyVisibleOrderFormState",
      ok: true,
      evidence_id: "visible-state-1",
      observed_total_amount_sek: null,
      note: "Approved visible order-form state verified.",
      diagnostics: {
        bridge_action: "verifyVisibleOrderFormState",
        bridge_status: "ok",
      },
    },
    {
      method: "fillQuantityField",
      ok: false,
      evidence_id: null,
      observed_total_amount_sek: null,
      note: "quantity field did not confirm the approved value.",
      diagnostics: {
        bridge_action: "fillQuantityField",
        bridge_status: "aborted",
        report: {
          attempted_quantity_fill: true,
          quantity_fill_verified: false,
        },
        blockers: ["quantity_field_fill_failed"],
        errors: ["quantity_field_fill_failed"],
        warnings: [],
        metadata: {
          quantity_candidate_count: 1,
          quantity_selected_candidate: {
            tied_to_antal_label_or_volume: true,
            candidate_kind: "input",
          },
          quantity_candidate_hidden: false,
          quantity_candidate_disabled: false,
          quantity_candidate_readonly: false,
          quantity_before_value_normalized: "",
          quantity_after_value_normalized: "",
          quantity_readback_source_used: "input.value",
          quantity_expected_normalized: "1",
          quantity_observed_normalized: "",
          exact_blocker_reason: "readback_mismatch",
        },
      },
    },
  ],
};

const structuredRunnerWithConnectivityFailure = {
  ...structuredRunnerFixture,
  quantity_fill_attempted: false,
  quantity_fill_verified: false,
  price_fill_attempted: false,
  price_fill_verified: false,
  errors_blockers_warnings: {
    blockers: ["runner:visible_state_mismatch"],
    warnings: [],
    errors: [],
  },
  runner_calls: [
    {
      method: "verifyVisibleOrderFormState",
      ok: false,
      evidence_id: null,
      observed_total_amount_sek: null,
      note: "bridge_unreachable",
      diagnostics: {
        bridge_action: "verifyVisibleOrderFormState",
        bridge_status: "bridge_unreachable",
        blockers: ["bridge_unreachable"],
        errors: ["bridge_unreachable"],
        warnings: [],
        metadata: {
          bridge_base_url: "http://127.0.0.1:47831",
          method_attempted: "verifyVisibleOrderFormState",
          endpoint_attempted:
            "/live-fill-only-runner/verify-visible-order-form-state",
          attempt_count: 3,
          failure_type: "connection_error",
          failure_happened_before_request_accepted: true,
          request_accepted: false,
          fill_method_attempted: false,
          required_endpoint_allowed: true,
        },
      },
    },
  ],
};

test.describe("first real Avanza fill-only POC proof file", () => {
  test("builds a quantity-based proof document with the full structured runner result", () => {
    const proof = buildFirstRealAvanzaFillOnlyPocLiveProofDocument({
      timestamp: "2026-07-02T22:15:00.000Z",
      selected_input_strategy: "quantity_based",
      structured_runner_result: successfulStructuredRunnerFixture,
    });

    expect(proof.proof_file_path).toBe(
      firstRealAvanzaFillOnlyPocQuantityBasedProofFilePath,
    );
    expect(proof.result_status).toBe(
      "quantity_based_live_fill_attempt_result_captured",
    );
    expect(proof.run_marked_successful).toBe(true);
    expect(proof.structured_runner_result).toMatchObject({
      quantity_fill_attempted: true,
      quantity_fill_verified: true,
      price_fill_attempted: true,
      total_valid: true,
      no_order_placement: true,
    });
  });

  test("does not mark captured aborted results as successful", () => {
    const proof = buildFirstRealAvanzaFillOnlyPocLiveProofDocument({
      selected_input_strategy: "quantity_based",
      structured_runner_result: structuredRunnerFixture,
    });

    expect(proof.result_status).toBe(
      "quantity_based_live_fill_attempt_result_captured",
    );
    expect(proof.run_marked_successful).toBe(false);
    expect(proof.structured_runner_result).toMatchObject({
      status: "final_live_execute_attempt_explicit_invocation_trigger_aborted",
      quantity_fill_attempted: true,
      quantity_fill_verified: false,
      errors_blockers_warnings: {
        blockers: ["runner:quantity_fill_failed"],
      },
    });
  });

  test("preserves wrapper runner-call diagnostics into aborted quantity proof fields", () => {
    const proof = buildFirstRealAvanzaFillOnlyPocLiveProofDocument({
      selected_input_strategy: "quantity_based",
      structured_runner_result: structuredRunnerWithBridgeDiagnostics,
    });

    expect(proof.structured_runner_result).toMatchObject({
      quantity_candidate_diagnostics_if_failed: {
        quantity_candidate_count: 1,
        selected_quantity_candidate_metadata: {
          tied_to_antal_label_or_volume: true,
        },
        candidate_hidden: false,
        candidate_disabled: false,
        candidate_readonly: false,
        before_value: "",
        after_attempted_value: "",
        readback_source: "input.value",
        expected_normalized_value: "1",
        observed_normalized_value: "",
        exact_internal_blocker_reason: "readback_mismatch",
      },
      bridge_runner_call_diagnostics: {
        fillQuantityField: {
          bridge_action: "fillQuantityField",
          bridge_status: "aborted",
          blockers: ["quantity_field_fill_failed"],
          metadata: {
            quantity_candidate_count: 1,
            exact_blocker_reason: "readback_mismatch",
          },
        },
      },
    });
  });

  test("preserves bridge connectivity diagnostics when the run aborts before fill", () => {
    const proof = buildFirstRealAvanzaFillOnlyPocLiveProofDocument({
      selected_input_strategy: "quantity_based",
      structured_runner_result: structuredRunnerWithConnectivityFailure,
    });

    expect(proof.run_marked_successful).toBe(false);
    expect(proof.structured_runner_result).toMatchObject({
      bridge_runner_call_diagnostics: {
        verifyVisibleOrderFormState: {
          bridge_action: "verifyVisibleOrderFormState",
          bridge_status: "bridge_unreachable",
          blockers: ["bridge_unreachable"],
          metadata: {
            bridge_base_url: "http://127.0.0.1:47831",
            method_attempted: "verifyVisibleOrderFormState",
            endpoint_attempted:
              "/live-fill-only-runner/verify-visible-order-form-state",
            attempt_count: 3,
            failure_type: "connection_error",
            failure_happened_before_request_accepted: true,
            request_accepted: false,
            fill_method_attempted: false,
            required_endpoint_allowed: true,
          },
        },
      },
    });
  });

  test("excludes raw page text, cookies, storage, session, BankID, and credential material", () => {
    const proof = buildFirstRealAvanzaFillOnlyPocLiveProofDocument({
      selected_input_strategy: "quantity_based",
      structured_runner_result: {
        ...structuredRunnerFixture,
        raw_page_text: "raw visible page text must not persist",
        cookie: "cookie must not persist",
        localStorage: "local storage must not persist",
        sessionStorage: "session storage must not persist",
        BankID: "bankid must not persist",
        credentials: "credentials must not persist",
      },
    });

    const serialized = JSON.stringify(proof);

    expect(serialized).not.toContain("raw visible page text must not persist");
    expect(serialized).not.toContain("cookie must not persist");
    expect(serialized).not.toContain("local storage must not persist");
    expect(serialized).not.toContain("session storage must not persist");
    expect(serialized).not.toContain("bankid must not persist");
    expect(serialized).not.toContain("credentials must not persist");
    expect(serialized).toContain("[omitted-sensitive-or-raw-observation]");
  });

  test("marks truncated or unverifiable stdout as not successful", () => {
    const proof = buildFirstRealAvanzaFillOnlyPocLiveProofDocument({
      selected_input_strategy: "quantity_based",
      structured_runner_result: structuredRunnerFixture,
      stdout_truncated_or_unverifiable: true,
    });

    expect(proof.result_status).toBe(
      "quantity_based_live_fill_attempt_result_truncated_or_unverifiable",
    );
    expect(proof.run_marked_successful).toBe(false);
    expect(proof.safety_confirmations.not_successful_when_stdout_truncated).toBe(
      true,
    );
  });

  test("writes the local proof file without adding any live browser capability", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "avanza-proof-"));
    const proofPath = join(tempDir, "latest-quantity-based-result.json");

    const proof = writeFirstRealAvanzaFillOnlyPocLiveProofFile(
      {
        timestamp: "2026-07-02T22:15:00.000Z",
        selected_input_strategy: "quantity_based",
        structured_runner_result: structuredRunnerFixture,
      },
      proofPath,
    );

    const persisted = JSON.parse(readFileSync(proofPath, "utf8")) as typeof proof;

    expect(persisted).toEqual(proof);
    expect(persisted.safety_confirmations).toMatchObject({
      no_avanza_access: true,
      no_field_fill: true,
      no_click: true,
      no_review_or_final_or_submit: true,
      no_order_placement: true,
    });
  });
});
