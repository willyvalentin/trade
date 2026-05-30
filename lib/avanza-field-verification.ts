import type {
  AvanzaVerificationNoteFieldKey,
  AvanzaVerificationNotesState,
} from "./avanza-field-verification-notes";

export type AvanzaFieldVerificationSide = "BUY" | "SELL";

export type AvanzaFieldVerificationStatus =
  | "verified"
  | "assumed"
  | "unknown"
  | "mismatch"
  | "blocked";

export type AvanzaFieldVerificationField = {
  field_id: string;
  label: string;
  expected_purpose: string;
  side: AvanzaFieldVerificationSide;
  status: AvanzaFieldVerificationStatus;
  critical: boolean;
  manually_verified: boolean;
  verified_label: string | null;
  verified_selector: string | null;
  verification_note: string;
};

export type AvanzaFieldVerificationStep = {
  step_id: string;
  label: string;
  status: AvanzaFieldVerificationStatus;
  human_only: boolean;
  stop_before_this_step: boolean;
  note: string;
};

export type AvanzaFieldVerificationWarning = {
  warning_id: string;
  message: string;
};

export type AvanzaFieldVerificationBlocker = {
  blocker_id: string;
  message: string;
};

export type AvanzaFieldVerificationRequirement =
  | "manual_verify_exact_avanza_labels"
  | "manual_verify_stable_selectors"
  | "manual_verify_account_selector"
  | "manual_verify_instrument_matching"
  | "manual_verify_quantity_field"
  | "manual_verify_price_or_order_type_field"
  | "manual_verify_order_summary"
  | "stop_before_final_confirmation"
  | "human_final_buy_sell_confirmation";

export type AvanzaFieldVerificationAllowedAction =
  | "read_ture_handoff_package"
  | "navigate_to_avanza_after_user_is_logged_in"
  | "locate_manually_verified_fields_only"
  | "fill_verified_allowed_fields_only"
  | "stop_before_final_confirmation"
  | "report_mismatches";

export type AvanzaFieldVerificationForbiddenAction =
  | "click_final_buy"
  | "click_final_sell"
  | "submit_broker_order"
  | "handle_credentials_or_login"
  | "bypass_missing_verification"
  | "fill_unknown_or_unverified_critical_fields"
  | "continue_on_unknown_broker_ui_state";

export type AvanzaFieldVerificationReport = {
  report_id: string;
  report_version: "1.0";
  report_kind: "avanza_field_verification_report";
  created_at: string;
  side: AvanzaFieldVerificationSide;
  broker: "AVANZA";
  source: "add_trade_modal" | "close_trade_modal";
  handoff_session_id: string | null;
  payload_id: string | null;
  command_id: string | null;
  form_mapping_preview_id: string | null;
  overall_status: "ready" | "warning" | "blocked";
  verified_count: number;
  assumed_count: number;
  unknown_count: number;
  blocked_count: number;
  mismatch_count: number;
  can_future_agent_prepare_form: boolean;
  can_future_agent_submit_order: false;
  human_final_confirmation_required: true;
  manual_notes_applied: boolean;
  notes_source: "none" | "localStorage/manual";
  notes_updated_at: string | null;
  verified_from_manual_notes_count: number;
  exact_labels_verified: boolean;
  selectors_verified: boolean;
  fields: AvanzaFieldVerificationField[];
  steps: AvanzaFieldVerificationStep[];
  requirements: AvanzaFieldVerificationRequirement[];
  warnings: AvanzaFieldVerificationWarning[];
  blockers: AvanzaFieldVerificationBlocker[];
  allowed_future_prepare_only_actions: AvanzaFieldVerificationAllowedAction[];
  forbidden_actions: AvanzaFieldVerificationForbiddenAction[];
  safety_summary: string;
};

type BuildAvanzaFieldVerificationReportInput = {
  handoffSessionId?: string | null;
  payloadId?: string | null;
  commandId?: string | null;
  formMappingPreviewId?: string | null;
  createdAt?: string;
  exactLabelsVerified?: boolean;
  selectorsVerified?: boolean;
  accountSelectorVerified?: boolean;
  unsafeToContinue?: boolean;
  manualVerificationNotes?: AvanzaVerificationNotesState | null;
};

type ManualNotesApplicationSummary = {
  notesApplied: boolean;
  notesUpdatedAt: string | null;
  verifiedFromManualNotesCount: number;
  missingVerifiedDateCount: number;
};

const allowedActions: AvanzaFieldVerificationAllowedAction[] = [
  "read_ture_handoff_package",
  "navigate_to_avanza_after_user_is_logged_in",
  "locate_manually_verified_fields_only",
  "fill_verified_allowed_fields_only",
  "stop_before_final_confirmation",
  "report_mismatches",
];

const forbiddenActions: AvanzaFieldVerificationForbiddenAction[] = [
  "click_final_buy",
  "click_final_sell",
  "submit_broker_order",
  "handle_credentials_or_login",
  "bypass_missing_verification",
  "fill_unknown_or_unverified_critical_fields",
  "continue_on_unknown_broker_ui_state",
];

const requirements: AvanzaFieldVerificationRequirement[] = [
  "manual_verify_exact_avanza_labels",
  "manual_verify_stable_selectors",
  "manual_verify_account_selector",
  "manual_verify_instrument_matching",
  "manual_verify_quantity_field",
  "manual_verify_price_or_order_type_field",
  "manual_verify_order_summary",
  "stop_before_final_confirmation",
  "human_final_buy_sell_confirmation",
];

function safeIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function makeField({
  fieldId,
  label,
  expectedPurpose,
  side,
  status = "assumed",
  critical = true,
  note,
}: {
  fieldId: string;
  label: string;
  expectedPurpose: string;
  side: AvanzaFieldVerificationSide;
  status?: AvanzaFieldVerificationStatus;
  critical?: boolean;
  note?: string;
}): AvanzaFieldVerificationField {
  return {
    field_id: fieldId,
    label,
    expected_purpose: expectedPurpose,
    side,
    status,
    critical,
    manually_verified: status === "verified",
    verified_label: null,
    verified_selector: null,
    verification_note:
      note ??
      "Exact Avanza label/selector has not been manually verified yet.",
  };
}

function noteKeyForReportField(
  side: AvanzaFieldVerificationSide,
  fieldId: string,
): AvanzaVerificationNoteFieldKey | null {
  if (fieldId === "order_side") {
    return side === "BUY" ? "order_side_buy" : "order_side_sell";
  }

  if (fieldId === "limit_price") {
    return side === "BUY" ? "limit_price" : "price_reference_or_limit";
  }

  if (fieldId === "order_summary_review") {
    return "order_review_summary";
  }

  if (fieldId === `final_${side.toLowerCase()}_confirmation_button`) {
    return side === "BUY"
      ? "final_buy_confirmation_button"
      : "final_sell_confirmation_button";
  }

  if (
    fieldId === "instrument_search" ||
    fieldId === "quantity" ||
    fieldId === "price_type" ||
    fieldId === "currency_market_context" ||
    fieldId === "account_selector" ||
    fieldId === "stop_before_final_confirmation_guard"
  ) {
    return fieldId;
  }

  return null;
}

function isFinalConfirmationField(field: AvanzaFieldVerificationField) {
  return field.field_id === "final_buy_confirmation_button" ||
    field.field_id === "final_sell_confirmation_button";
}

function isPrepareCriticalField(field: AvanzaFieldVerificationField) {
  return field.critical && !isFinalConfirmationField(field);
}

function applyManualNotesToFields({
  side,
  fields,
  notesState,
}: {
  side: AvanzaFieldVerificationSide;
  fields: AvanzaFieldVerificationField[];
  notesState?: AvanzaVerificationNotesState | null;
}): {
  fields: AvanzaFieldVerificationField[];
  summary: ManualNotesApplicationSummary;
  warnings: AvanzaFieldVerificationWarning[];
  blockers: AvanzaFieldVerificationBlocker[];
} {
  if (!notesState) {
    return {
      fields,
      summary: {
        notesApplied: false,
        notesUpdatedAt: null,
        verifiedFromManualNotesCount: 0,
        missingVerifiedDateCount: 0,
      },
      warnings: [],
      blockers: [],
    };
  }

  let verifiedFromManualNotesCount = 0;
  let missingVerifiedDateCount = 0;
  const warnings: AvanzaFieldVerificationWarning[] = [];
  const blockers: AvanzaFieldVerificationBlocker[] = [];
  const notesByField = new Map(
    notesState.notes
      .filter((note) => note.side === side)
      .map((note) => [note.field_key, note]),
  );

  const appliedFields = fields.map((field) => {
    const noteKey = noteKeyForReportField(side, field.field_id);
    const note = noteKey ? notesByField.get(noteKey) : undefined;

    if (!note) {
      return field;
    }

    const noteLabel = note.actual_avanza_label.trim();
    const noteSelector = note.selector_or_data_testid_note.trim();
    const noteText = note.notes.trim();
    const noteSource = note.source;
    const noteVerifiedAt = note.verified_at.trim();
    const noteSummary = [
      noteText,
      noteSource ? `Manual source: ${noteSource}.` : "",
      noteVerifiedAt ? `Verified at: ${noteVerifiedAt}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (note.status === "verified" && noteLabel && noteSource) {
      if (!noteVerifiedAt) {
        missingVerifiedDateCount += 1;
        warnings.push({
          warning_id: `${side.toLowerCase()}_${field.field_id}_verified_date_missing`,
          message: `${field.label} has a verified manual note, but no verified date is recorded.`,
        });
      }

      if (isFinalConfirmationField(field)) {
        return {
          ...field,
          status: "blocked" as const,
          manually_verified: true,
          verified_label: noteLabel,
          verified_selector: noteSelector || null,
          verification_note:
            noteSummary ||
            "Final confirmation boundary was manually observed, but remains human-only.",
        };
      }

      verifiedFromManualNotesCount += 1;
      return {
        ...field,
        status: "verified" as const,
        manually_verified: true,
        verified_label: noteLabel,
        verified_selector: noteSelector || null,
        verification_note:
          noteSummary || "Field was manually verified from local notes.",
      };
    }

    if (note.status === "mismatch") {
      blockers.push({
        blocker_id: `${side.toLowerCase()}_${field.field_id}_manual_note_mismatch`,
        message: `${field.label} is marked mismatch in manual Avanza notes.`,
      });

      return {
        ...field,
        status: "mismatch" as const,
        manually_verified: false,
        verified_label: noteLabel || null,
        verified_selector: noteSelector || null,
        verification_note:
          noteSummary ||
          "Manual Avanza notes mark this field as a mismatch.",
      };
    }

    if (note.status === "needs_review") {
      warnings.push({
        warning_id: `${side.toLowerCase()}_${field.field_id}_manual_note_needs_review`,
        message: `${field.label} needs review in manual Avanza notes.`,
      });

      const status: AvanzaFieldVerificationStatus =
        field.status === "assumed" ? "assumed" : "unknown";

      return {
        ...field,
        status,
        manually_verified: false,
        verified_label: noteLabel || null,
        verified_selector: noteSelector || null,
        verification_note:
          noteSummary || "Manual Avanza notes require review for this field.",
      };
    }

    if (note.status === "deprecated") {
      warnings.push({
        warning_id: `${side.toLowerCase()}_${field.field_id}_manual_note_deprecated`,
        message: `${field.label} is marked deprecated in manual Avanza notes.`,
      });

      const status: AvanzaFieldVerificationStatus = field.critical
        ? "blocked"
        : "unknown";

      return {
        ...field,
        status,
        manually_verified: false,
        verified_label: noteLabel || null,
        verified_selector: noteSelector || null,
        verification_note:
          noteSummary || "Manual Avanza notes mark this field as deprecated.",
      };
    }

    return field;
  });

  return {
    fields: appliedFields,
    summary: {
      notesApplied: true,
      notesUpdatedAt: notesState.updated_at || null,
      verifiedFromManualNotesCount,
      missingVerifiedDateCount,
    },
    warnings,
    blockers,
  };
}

function fieldSet(side: AvanzaFieldVerificationSide) {
  const action = side === "BUY" ? "KÖP" : "SÄLJ";
  return [
    makeField({
      fieldId: "instrument_search",
      label: "Instrument / Search",
      expectedPurpose: "Locate the expected ticker/instrument.",
      side,
      status: "assumed",
    }),
    makeField({
      fieldId: "order_side",
      label: `Side / Action ${action}`,
      expectedPurpose: `Confirm the broker form is set to ${action}.`,
      side,
      status: "assumed",
    }),
    makeField({
      fieldId: "quantity",
      label: "Antal / Quantity",
      expectedPurpose: "Enter the planned share quantity.",
      side,
      status: "unknown",
    }),
    makeField({
      fieldId: "price_type",
      label: "Order type / Price type",
      expectedPurpose: "Confirm market/limit behavior before any preparation.",
      side,
      status: "unknown",
    }),
    makeField({
      fieldId: "limit_price",
      label: "Limit price / Price reference",
      expectedPurpose: "Enter or review limit/price reference when applicable.",
      side,
      status: "unknown",
    }),
    makeField({
      fieldId: "currency_market_context",
      label: "Currency / Market context",
      expectedPurpose: "Read visible currency and market context.",
      side,
      status: "unknown",
      critical: false,
    }),
    makeField({
      fieldId: "account_selector",
      label: "Account selector",
      expectedPurpose: "Confirm the intended account without changing accounts unexpectedly.",
      side,
      status: "unknown",
    }),
    makeField({
      fieldId: "order_summary_review",
      label: "Order summary / Review step",
      expectedPurpose: "Read final review data before stopping.",
      side,
      status: "unknown",
    }),
    makeField({
      fieldId: `final_${side.toLowerCase()}_confirmation_button`,
      label: `Final ${action} confirmation button`,
      expectedPurpose: "Human-only final broker confirmation.",
      side,
      status: "blocked",
      note:
        "Final Avanza confirmation is intentionally forbidden for any agent.",
    }),
    makeField({
      fieldId: "stop_before_final_confirmation_guard",
      label: "Stop-before-final-confirmation guard",
      expectedPurpose: "Agent must stop before final broker confirmation.",
      side,
      status: "assumed",
      note:
        "Policy requires stopping before final confirmation, but Avanza UI fields/selectors remain unverified.",
    }),
  ];
}

function stepSet(side: AvanzaFieldVerificationSide) {
  const action = side === "BUY" ? "KÖP" : "SÄLJ";
  return [
    {
      step_id: "open_order_ticket",
      label: "Open order ticket",
      status: "unknown" as const,
      human_only: false,
      stop_before_this_step: false,
      note: "Future agent may only use this after manual verification.",
    },
    {
      step_id: "fill_verified_fields",
      label: "Fill verified fields",
      status: "blocked" as const,
      human_only: false,
      stop_before_this_step: false,
      note: "Critical fields are not yet manually verified.",
    },
    {
      step_id: "review_order_summary",
      label: "Review order summary",
      status: "unknown" as const,
      human_only: false,
      stop_before_this_step: false,
      note: "Order summary labels/selectors are not yet verified.",
    },
    {
      step_id: `final_${side.toLowerCase()}_confirmation`,
      label: `Final ${action} confirmation`,
      status: "blocked" as const,
      human_only: true,
      stop_before_this_step: true,
      note: `Agent must never click final ${action}.`,
    },
  ];
}

function buildReport({
  side,
  source,
  input,
}: {
  side: AvanzaFieldVerificationSide;
  source: AvanzaFieldVerificationReport["source"];
  input: BuildAvanzaFieldVerificationReportInput;
}): AvanzaFieldVerificationReport {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const baseFields = fieldSet(side);
  const steps = stepSet(side);
  const manualNotesApplication = applyManualNotesToFields({
    side,
    fields: baseFields,
    notesState: input.manualVerificationNotes,
  });
  const fields = manualNotesApplication.fields;
  const prepareCriticalFields = fields.filter(isPrepareCriticalField);
  const prepareCriticalFieldsVerified = prepareCriticalFields.every(
    (field) => field.status === "verified",
  );
  const quantityVerified =
    fields.find((field) => field.field_id === "quantity")?.status === "verified";
  const priceOrOrderTypeVerified =
    fields.find((field) => field.field_id === "price_type")?.status ===
      "verified" &&
    fields.find((field) => field.field_id === "limit_price")?.status ===
      "verified";
  const instrumentVerified =
    fields.find((field) => field.field_id === "instrument_search")?.status ===
    "verified";
  const accountSelectorVerified =
    input.accountSelectorVerified === true ||
    fields.find((field) => field.field_id === "account_selector")?.status ===
      "verified";
  const exactLabelsVerified =
    input.exactLabelsVerified === true || prepareCriticalFieldsVerified;
  const selectorsVerified =
    input.selectorsVerified === true ||
    prepareCriticalFieldsVerified;
  const nonFinalBlockingFields = fields.filter(
    (field) =>
      !isFinalConfirmationField(field) &&
      (field.status === "blocked" || field.status === "mismatch"),
  );
  const blockers: AvanzaFieldVerificationBlocker[] = [
    ...manualNotesApplication.blockers,
    ...(!exactLabelsVerified
      ? [
          {
            blocker_id: "exact_avanza_labels_selectors_not_verified",
            message: "Exact Avanza labels/selectors are not manually verified.",
          },
        ]
      : []),
    ...(!selectorsVerified
      ? [
          {
            blocker_id: "unknown_broker_ui_state",
            message:
              "Broker UI state is unknown until selectors and current UI are manually verified.",
          },
        ]
      : []),
    ...(!accountSelectorVerified
      ? [
          {
            blocker_id: "account_selector_ambiguous",
            message: "Account selector behavior is not manually verified.",
          },
        ]
      : []),
    ...(!quantityVerified
      ? [
          {
            blocker_id: "quantity_field_unverified",
            message: "Quantity field is not manually verified.",
          },
        ]
      : []),
    ...(!priceOrOrderTypeVerified
      ? [
          {
            blocker_id: "price_order_type_field_unverified",
            message: "Price/order type field is not manually verified.",
          },
        ]
      : []),
    ...(!instrumentVerified
      ? [
          {
            blocker_id: "instrument_mismatch_risk",
            message: "Instrument matching remains a risk until verified in Avanza UI.",
          },
        ]
      : []),
    ...nonFinalBlockingFields.map((field) => ({
      blocker_id: `${field.field_id}_blocked_or_mismatch`,
      message: `${field.label} is ${field.status} and cannot be used for prepare-only readiness.`,
    })),
    {
      blocker_id: "final_confirmation_button_required_human_only",
      message: `Final Avanza ${side === "BUY" ? "KÖP" : "SÄLJ"} confirmation is human-only.`,
    },
    ...(input.unsafeToContinue
      ? [
          {
            blocker_id: "unsafe_to_continue",
            message: "Unsafe-to-continue flag is active.",
          },
        ]
      : []),
  ];
  const warnings: AvanzaFieldVerificationWarning[] = [
    ...manualNotesApplication.warnings,
    ...(manualNotesApplication.summary.notesApplied
      ? [
          {
            warning_id: "manual_notes_applied_prepare_only",
            message:
              "Manual verification can allow prepare-only readiness, but never order submission.",
          },
        ]
      : [
          {
            warning_id: "generic_field_mapping_only",
            message: "Current form mappings use generic broker field concepts.",
          },
        ]),
    ...(fields.some((field) => field.manually_verified && field.verified_selector)
      ? []
      : [
          {
            warning_id: "no_stable_selectors_recorded",
            message:
              "No stable Avanza selectors are recorded; manual labels can inform readiness but selectors still need review before browser-agent use.",
          },
        ]),
    {
      warning_id: "final_confirmation_boundary_human_only",
      message: `Final Avanza ${side === "BUY" ? "KÖP" : "SÄLJ"} remains human-only even if its boundary is documented.`,
    },
  ];
  const verifiedCount = fields.filter((field) => field.status === "verified").length;
  const assumedCount = fields.filter((field) => field.status === "assumed").length;
  const unknownCount = fields.filter((field) => field.status === "unknown").length;
  const blockedCount = fields.filter((field) => field.status === "blocked").length;
  const mismatchCount = fields.filter((field) => field.status === "mismatch").length;
  const prepareBlockingBlockers = blockers.filter(
    (blocker) =>
      blocker.blocker_id !== "final_confirmation_button_required_human_only",
  );
  const canFutureAgentPrepareForm =
    prepareBlockingBlockers.length === 0 && prepareCriticalFieldsVerified;
  const overallStatus =
    prepareBlockingBlockers.length > 0
      ? "blocked"
      : canFutureAgentPrepareForm
        ? "warning"
        : warnings.length > 0
          ? "warning"
          : "ready";
  const preparedSteps = steps.map((step) => {
    if (step.step_id === "fill_verified_fields" && canFutureAgentPrepareForm) {
      return {
        ...step,
        status: "verified" as const,
        note:
          "Critical prepare-only fields are manually verified from local notes.",
      };
    }

    if (step.step_id === "review_order_summary" && canFutureAgentPrepareForm) {
      return {
        ...step,
        status: "verified" as const,
        note: "Order summary/review boundary is manually verified from local notes.",
      };
    }

    return step;
  });

  return {
    report_id: `avanza_${side.toLowerCase()}_field_verification_${safeIdPart(
      input.payloadId,
    )}_${safeIdPart(createdAt)}`,
    report_version: "1.0",
    report_kind: "avanza_field_verification_report",
    created_at: createdAt,
    side,
    broker: "AVANZA",
    source,
    handoff_session_id: input.handoffSessionId ?? null,
    payload_id: input.payloadId ?? null,
    command_id: input.commandId ?? null,
    form_mapping_preview_id: input.formMappingPreviewId ?? null,
    overall_status: overallStatus,
    verified_count: verifiedCount,
    assumed_count: assumedCount,
    unknown_count: unknownCount,
    blocked_count: blockedCount,
    mismatch_count: mismatchCount,
    can_future_agent_prepare_form: canFutureAgentPrepareForm,
    can_future_agent_submit_order: false,
    human_final_confirmation_required: true,
    manual_notes_applied: manualNotesApplication.summary.notesApplied,
    notes_source: manualNotesApplication.summary.notesApplied
      ? "localStorage/manual"
      : "none",
    notes_updated_at: manualNotesApplication.summary.notesUpdatedAt,
    verified_from_manual_notes_count:
      manualNotesApplication.summary.verifiedFromManualNotesCount,
    exact_labels_verified: exactLabelsVerified,
    selectors_verified: selectorsVerified,
    fields,
    steps: preparedSteps,
    requirements,
    warnings,
    blockers,
    allowed_future_prepare_only_actions: allowedActions,
    forbidden_actions: forbiddenActions,
    safety_summary:
      canFutureAgentPrepareForm
        ? "Manual Avanza notes support prepare-only readiness. Future agents must stop before final confirmation and must never submit orders."
        : "Exact Avanza fields are not yet fully manually verified. Future agents must not use unverified critical fields and must never submit orders.",
  };
}

export function applyAvanzaVerificationNotesToReport(
  report: AvanzaFieldVerificationReport,
  notes: AvanzaVerificationNotesState | null,
): AvanzaFieldVerificationReport {
  return buildReport({
    side: report.side,
    source: report.source,
    input: {
      handoffSessionId: report.handoff_session_id,
      payloadId: report.payload_id,
      commandId: report.command_id,
      formMappingPreviewId: report.form_mapping_preview_id,
      createdAt: report.created_at,
      manualVerificationNotes: notes,
    },
  });
}

export function buildBuyAvanzaFieldVerificationReport(
  input: BuildAvanzaFieldVerificationReportInput,
): AvanzaFieldVerificationReport {
  return buildReport({
    side: "BUY",
    source: "add_trade_modal",
    input,
  });
}

export function buildSellAvanzaFieldVerificationReport(
  input: BuildAvanzaFieldVerificationReportInput,
): AvanzaFieldVerificationReport {
  return buildReport({
    side: "SELL",
    source: "close_trade_modal",
    input,
  });
}

export function avanzaFieldVerificationReportJson(
  report: AvanzaFieldVerificationReport,
) {
  return JSON.stringify(report, null, 2);
}
