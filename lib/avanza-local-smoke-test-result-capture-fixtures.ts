import {
  buildAvanzaLocalSmokeTestChecklist,
  buildAvanzaLocalSmokeTestResultCapture,
  type AvanzaLocalSmokeTestArea,
  type AvanzaLocalSmokeTestChecklistItemStatus,
  type AvanzaLocalSmokeTestResultCapture,
  type AvanzaLocalSmokeTestResultCaptureInput,
  type AvanzaLocalSmokeTestResultStatus,
} from "./avanza-local-smoke-test-result-capture";

export type AvanzaLocalSmokeTestResultCaptureFixtureId =
  | "login_ready_checklist"
  | "login_passed_safe_result"
  | "login_failed_safe_result"
  | "order_prep_ready_checklist"
  | "order_prep_passed_to_review_ready_safe_result"
  | "order_prep_unsafe_stop_final_click_attempted"
  | "order_prep_blocked_missing_instrument_verification"
  | "settlement_checklist_not_started"
  | "full_operator_run_manual_review_required"
  | "forbidden_raw_credentials_evidence"
  | "forbidden_cookies_session_evidence"
  | "forbidden_unredacted_screenshot_evidence"
  | "production_readiness_forbidden";

export type AvanzaLocalSmokeTestResultCaptureFixture = {
  fixtureId: AvanzaLocalSmokeTestResultCaptureFixtureId;
  label: string;
  expectedStatus: AvanzaLocalSmokeTestResultStatus;
  result: AvanzaLocalSmokeTestResultCapture;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

function statusesForArea(
  area: AvanzaLocalSmokeTestArea,
  status: AvanzaLocalSmokeTestChecklistItemStatus,
) {
  return Object.fromEntries(
    buildAvanzaLocalSmokeTestChecklist({ area }).map((item) => [
      item.itemId,
      status,
    ]),
  );
}

function fixture(
  fixtureId: AvanzaLocalSmokeTestResultCaptureFixtureId,
  label: string,
  expectedStatus: AvanzaLocalSmokeTestResultStatus,
  input: AvanzaLocalSmokeTestResultCaptureInput,
): AvanzaLocalSmokeTestResultCaptureFixture {
  return {
    fixtureId,
    label,
    expectedStatus,
    result: buildAvanzaLocalSmokeTestResultCapture({
      ...input,
      resultId: `fixture-${fixtureId}`,
      now: fixtureNow,
      status: input.status ?? expectedStatus,
    }),
  };
}

export const avanzaLocalSmokeTestResultCaptureFixtures:
  AvanzaLocalSmokeTestResultCaptureFixture[] = [
    fixture("login_ready_checklist", "Login ready checklist", "ready_to_run", {
      area: "login",
      safeObservations: ["Login checklist is ready for safe local capture."],
    }),
    fixture(
      "login_passed_safe_result",
      "Login passed safe result",
      "passed",
      {
        area: "login",
        itemStatuses: statusesForArea("login", "passed"),
        safeObservations: [
          "Safe runner status reached expected login state.",
          "No credential values were logged.",
          "No cookies/session were exported.",
        ],
      },
    ),
    fixture("login_failed_safe_result", "Login failed safe result", "failed", {
      area: "login",
      itemStatuses: {
        ...statusesForArea("login", "passed"),
        login_expected_state_reached: "failed",
      },
      blockedReasonsList: ["Expected login state was not reached."],
      safeObservations: ["Failure captured from safe runner status only."],
    }),
    fixture(
      "order_prep_ready_checklist",
      "Order-prep ready checklist",
      "ready_to_run",
      {
        area: "order_prep",
        safeObservations: [
          "Order-prep checklist is ready for safe local capture.",
        ],
      },
    ),
    fixture(
      "order_prep_passed_to_review_ready_safe_result",
      "Order-prep passed to review-ready safe result",
      "passed",
      {
        area: "order_prep",
        itemStatuses: statusesForArea("order_prep", "passed"),
        safeObservations: [
          "Search opened, instrument selected, and instrument verified.",
          "Order fields prepared with redacted values.",
          "Review-ready outcome captured; final human action remains required.",
        ],
      },
    ),
    fixture(
      "order_prep_unsafe_stop_final_click_attempted",
      "Order-prep unsafe stop final click attempted",
      "unsafe_stop",
      {
        area: "order_prep",
        itemStatuses: {
          ...statusesForArea("order_prep", "passed"),
          order_final_buy_sell_not_clicked: "failed",
        },
        forbiddenEvidence: {
          order_final_buy_sell_not_clicked: ["final_click_proof"],
        },
        blockedReasons: {
          order_final_buy_sell_not_clicked:
            "Unexpected final click risk or final-click proof was reported.",
        },
        safeObservations: [
          "Unsafe stop recorded before any further local smoke work.",
        ],
      },
    ),
    fixture(
      "order_prep_blocked_missing_instrument_verification",
      "Order-prep blocked by missing instrument verification",
      "blocked",
      {
        area: "order_prep",
        itemStatuses: {
          ...statusesForArea("order_prep", "passed"),
          order_instrument_verified: "blocked",
        },
        blockedReasons: {
          order_instrument_verified:
            "Instrument identity was not verified before order prep.",
        },
      },
    ),
    fixture(
      "settlement_checklist_not_started",
      "Settlement checklist not started",
      "not_started",
      {
        area: "settlement",
        status: "not_started",
        safeObservations: [
          "Settlement checklist is recorded as not started; no document read.",
        ],
      },
    ),
    fixture(
      "full_operator_run_manual_review_required",
      "Full operator run manual review required",
      "manual_review_required",
      {
        area: "full_operator_run",
        itemStatuses: {
          ...statusesForArea("full_operator_run", "passed"),
          settlement_no_document_read_yet: "not_applicable",
          settlement_no_ocr: "not_applicable",
          settlement_no_extraction: "not_applicable",
          settlement_no_reconciliation_write: "not_applicable",
        },
        warningsList: [
          "Manual review required before deciding whether more local smoke work is appropriate.",
        ],
      },
    ),
    fixture(
      "forbidden_raw_credentials_evidence",
      "Forbidden raw credentials evidence",
      "unsafe_stop",
      {
        area: "login",
        forbiddenEvidence: {
          login_no_credentials_logged: ["raw_credentials"],
        },
        blockedReasons: {
          login_no_credentials_logged:
            "Raw credential evidence must be removed and never stored.",
        },
      },
    ),
    fixture(
      "forbidden_cookies_session_evidence",
      "Forbidden cookies/session evidence",
      "unsafe_stop",
      {
        area: "login",
        forbiddenEvidence: {
          login_no_cookies_session_exported: ["cookies", "session_tokens"],
        },
        blockedReasons: {
          login_no_cookies_session_exported:
            "Cookies/session evidence must be removed and never stored.",
        },
      },
    ),
    fixture(
      "forbidden_unredacted_screenshot_evidence",
      "Forbidden unredacted screenshot evidence",
      "unsafe_stop",
      {
        area: "order_prep",
        forbiddenEvidence: {
          order_no_account_order_ids_logged: [
            "account_numbers",
            "order_ids",
          ],
        },
        warnings: {
          order_no_account_order_ids_logged:
            "Unredacted screenshots are forbidden because they may contain account or order identifiers.",
        },
      },
    ),
    fixture(
      "production_readiness_forbidden",
      "Production readiness forbidden",
      "blocked",
      {
        area: "full_operator_run",
        status: "blocked",
        blockedReasonsList: ["Production readiness claim is forbidden."],
        safeObservations: [
          "Local smoke capture is evidence only and cannot claim production readiness.",
        ],
      },
    ),
  ];
