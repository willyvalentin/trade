export const AVANZA_VERIFICATION_NOTES_STORAGE_KEY =
  "trade-avanza-field-verification-notes-v1";

export type AvanzaVerificationNoteSide = "BUY" | "SELL";

export type AvanzaVerificationNoteFieldKey =
  | "instrument_search"
  | "order_side_buy"
  | "order_side_sell"
  | "quantity"
  | "price_type"
  | "limit_price"
  | "price_reference_or_limit"
  | "currency_market_context"
  | "account_selector"
  | "order_review_summary"
  | "final_buy_confirmation_button"
  | "final_sell_confirmation_button"
  | "stop_before_final_confirmation_guard";

export type AvanzaVerificationNoteStatus =
  | "unverified"
  | "verified"
  | "mismatch"
  | "needs_review"
  | "deprecated";

export type AvanzaVerificationCriticality =
  | "critical"
  | "important"
  | "optional"
  | "forbidden_final_confirmation";

export type AvanzaVerificationNoteSource =
  | "manual_observation"
  | "screenshot_reference"
  | "dom_inspection"
  | "user_note";

export type AvanzaFieldVerificationNote = {
  note_id: string;
  side: AvanzaVerificationNoteSide;
  field_key: AvanzaVerificationNoteFieldKey;
  display_label: string;
  expected_generic_label: string;
  actual_avanza_label: string;
  selector_or_data_testid_note: string;
  screenshot_reference: string;
  notes: string;
  source: AvanzaVerificationNoteSource;
  status: AvanzaVerificationNoteStatus;
  criticality: AvanzaVerificationCriticality;
  verified_at: string;
  verified_by: string;
  updated_at: string;
};

export type AvanzaVerificationNotesState = {
  state_version: "1.0";
  updated_at: string;
  notes: AvanzaFieldVerificationNote[];
  safety: {
    local_storage_only: true;
    no_browser_control: true;
    no_avanza_automation: true;
    no_order_submission: true;
    final_confirmation_human_only: true;
  };
};

export type AvanzaVerificationNotesBlocker = {
  blocker_id: string;
  side: AvanzaVerificationNoteSide | "BOTH";
  message: string;
};

export type AvanzaVerificationNotesWarning = {
  warning_id: string;
  side: AvanzaVerificationNoteSide | "BOTH";
  message: string;
};

export type AvanzaVerificationNotesSummary = {
  verified_critical_fields_count: number;
  missing_critical_fields_count: number;
  mismatch_count: number;
  needs_review_count: number;
  buy_verified_critical_fields_count: number;
  buy_missing_critical_fields_count: number;
  sell_verified_critical_fields_count: number;
  sell_missing_critical_fields_count: number;
  can_future_agent_prepare_buy_form: boolean;
  can_future_agent_prepare_sell_form: boolean;
  can_future_agent_submit_order: false;
  human_final_confirmation_required: true;
};

export type AvanzaVerificationNotesValidation = {
  status: "ready" | "needs_review" | "blocked" | "unverified";
  summary: AvanzaVerificationNotesSummary;
  blockers: AvanzaVerificationNotesBlocker[];
  warnings: AvanzaVerificationNotesWarning[];
};

type FieldDefinition = {
  side: AvanzaVerificationNoteSide;
  field_key: AvanzaVerificationNoteFieldKey;
  display_label: string;
  expected_generic_label: string;
  criticality: AvanzaVerificationCriticality;
};

const buyPrepareRequiredFieldKeys: AvanzaVerificationNoteFieldKey[] = [
  "instrument_search",
  "order_side_buy",
  "quantity",
  "price_type",
  "limit_price",
  "account_selector",
  "order_review_summary",
  "stop_before_final_confirmation_guard",
];

const sellPrepareRequiredFieldKeys: AvanzaVerificationNoteFieldKey[] = [
  "instrument_search",
  "order_side_sell",
  "quantity",
  "price_type",
  "price_reference_or_limit",
  "account_selector",
  "order_review_summary",
  "stop_before_final_confirmation_guard",
];

export const avanzaVerificationFieldDefinitions: FieldDefinition[] = [
  buyField("instrument_search", "Instrument / Search", "Instrument search field", "critical"),
  buyField("order_side_buy", "KÖP side/action", "Buy order side/action", "critical"),
  buyField("quantity", "Antal / Quantity", "Quantity field", "critical"),
  buyField("price_type", "Price type / Order type", "Price type selector", "important"),
  buyField("limit_price", "Limit price", "Limit or reference price field", "critical"),
  buyField(
    "currency_market_context",
    "Currency / market context",
    "Visible currency or market context",
    "important",
  ),
  buyField("account_selector", "Account selector", "Account selector if visible", "important"),
  buyField("order_review_summary", "Order review summary", "Broker order summary/review step", "critical"),
  buyField(
    "final_buy_confirmation_button",
    "Final KÖP confirmation button",
    "Final buy confirmation button",
    "forbidden_final_confirmation",
  ),
  buyField(
    "stop_before_final_confirmation_guard",
    "Stop-before-final-confirmation guard",
    "Guard that requires stopping before final confirmation",
    "critical",
  ),
  sellField("instrument_search", "Instrument / Search", "Instrument search field", "critical"),
  sellField("order_side_sell", "SÄLJ side/action", "Sell order side/action", "critical"),
  sellField("quantity", "Antal / Quantity", "Quantity field", "critical"),
  sellField("price_type", "Price type / Order type", "Price type selector", "important"),
  sellField(
    "price_reference_or_limit",
    "Price reference / limit",
    "Sell price reference or limit field",
    "critical",
  ),
  sellField(
    "currency_market_context",
    "Currency / market context",
    "Visible currency or market context",
    "important",
  ),
  sellField("account_selector", "Account selector", "Account selector if visible", "important"),
  sellField("order_review_summary", "Order review summary", "Broker order summary/review step", "critical"),
  sellField(
    "final_sell_confirmation_button",
    "Final SÄLJ confirmation button",
    "Final sell confirmation button",
    "forbidden_final_confirmation",
  ),
  sellField(
    "stop_before_final_confirmation_guard",
    "Stop-before-final-confirmation guard",
    "Guard that requires stopping before final confirmation",
    "critical",
  ),
];

export function createDefaultAvanzaVerificationNotesState(
  now = new Date(),
): AvanzaVerificationNotesState {
  const timestamp = now.toISOString();

  return {
    state_version: "1.0",
    updated_at: timestamp,
    notes: avanzaVerificationFieldDefinitions.map((definition) =>
      createDefaultNote(definition, timestamp),
    ),
    safety: {
      local_storage_only: true,
      no_browser_control: true,
      no_avanza_automation: true,
      no_order_submission: true,
      final_confirmation_human_only: true,
    },
  };
}

export function normalizeAvanzaVerificationNote(
  value: unknown,
): AvanzaFieldVerificationNote {
  const raw = isRecord(value) ? value : {};
  const side = raw.side === "SELL" ? "SELL" : "BUY";
  const fieldKey = normalizeFieldKey(raw.field_key, side);
  const definition = findDefinition(side, fieldKey);
  const criticality =
    definition.criticality === "forbidden_final_confirmation"
      ? "forbidden_final_confirmation"
      : normalizeCriticality(raw.criticality, definition.criticality);

  return {
    note_id: stringValue(raw.note_id) || `${side}_${fieldKey}`,
    side,
    field_key: fieldKey,
    display_label: stringValue(raw.display_label) || definition.display_label,
    expected_generic_label:
      stringValue(raw.expected_generic_label) ||
      definition.expected_generic_label,
    actual_avanza_label: stringValue(raw.actual_avanza_label),
    selector_or_data_testid_note: stringValue(raw.selector_or_data_testid_note),
    screenshot_reference: stringValue(raw.screenshot_reference),
    notes: stringValue(raw.notes),
    source: normalizeSource(raw.source),
    status: normalizeStatus(raw.status),
    criticality,
    verified_at: stringValue(raw.verified_at),
    verified_by: stringValue(raw.verified_by),
    updated_at: stringValue(raw.updated_at) || new Date().toISOString(),
  };
}

export function normalizeAvanzaVerificationNotesState(
  value: unknown,
): AvanzaVerificationNotesState {
  const defaults = createDefaultAvanzaVerificationNotesState();
  const raw = isRecord(value) ? value : {};
  const inputNotes = Array.isArray(raw.notes) ? raw.notes : [];
  const normalizedInputNotes = inputNotes.map(normalizeAvanzaVerificationNote);
  const notesByKey = new Map(
    normalizedInputNotes.map((note) => [`${note.side}_${note.field_key}`, note]),
  );

  return {
    state_version: "1.0",
    updated_at: stringValue(raw.updated_at) || defaults.updated_at,
    notes: defaults.notes.map((defaultNote) => {
      const stored = notesByKey.get(`${defaultNote.side}_${defaultNote.field_key}`);
      return stored
        ? {
            ...defaultNote,
            ...stored,
            criticality:
              defaultNote.criticality === "forbidden_final_confirmation"
                ? "forbidden_final_confirmation"
                : stored.criticality,
          }
        : defaultNote;
    }),
    safety: defaults.safety,
  };
}

export function summarizeAvanzaVerificationNotes(
  state: AvanzaVerificationNotesState,
): AvanzaVerificationNotesSummary {
  const relevantCritical = state.notes.filter((note) =>
    note.side === "BUY"
      ? buyPrepareRequiredFieldKeys.includes(note.field_key)
      : sellPrepareRequiredFieldKeys.includes(note.field_key),
  );
  const verifiedCritical = relevantCritical.filter(
    (note) => note.status === "verified",
  );
  const missingCritical = relevantCritical.filter(
    (note) => note.status !== "verified",
  );
  const buyCritical = relevantCritical.filter((note) => note.side === "BUY");
  const sellCritical = relevantCritical.filter((note) => note.side === "SELL");
  const buyMissingCritical = buyCritical.filter(
    (note) => note.status !== "verified",
  );
  const sellMissingCritical = sellCritical.filter(
    (note) => note.status !== "verified",
  );
  const buyMismatchCount = state.notes.filter(
    (note) => note.side === "BUY" && note.status === "mismatch",
  ).length;
  const sellMismatchCount = state.notes.filter(
    (note) => note.side === "SELL" && note.status === "mismatch",
  ).length;

  return {
    verified_critical_fields_count: verifiedCritical.length,
    missing_critical_fields_count: missingCritical.length,
    mismatch_count: state.notes.filter((note) => note.status === "mismatch").length,
    needs_review_count: state.notes.filter(
      (note) => note.status === "needs_review",
    ).length,
    buy_verified_critical_fields_count: buyCritical.length - buyMissingCritical.length,
    buy_missing_critical_fields_count: buyMissingCritical.length,
    sell_verified_critical_fields_count:
      sellCritical.length - sellMissingCritical.length,
    sell_missing_critical_fields_count: sellMissingCritical.length,
    can_future_agent_prepare_buy_form:
      buyMissingCritical.length === 0 && buyMismatchCount === 0,
    can_future_agent_prepare_sell_form:
      sellMissingCritical.length === 0 && sellMismatchCount === 0,
    can_future_agent_submit_order: false,
    human_final_confirmation_required: true,
  };
}

export function validateAvanzaVerificationNotes(
  state: AvanzaVerificationNotesState,
): AvanzaVerificationNotesValidation {
  const summary = summarizeAvanzaVerificationNotes(state);
  const blockers: AvanzaVerificationNotesBlocker[] = [];
  const warnings: AvanzaVerificationNotesWarning[] = [];

  if (summary.buy_missing_critical_fields_count > 0) {
    blockers.push({
      blocker_id: "buy_critical_fields_missing",
      side: "BUY",
      message: "Buy-side critical Avanza fields are not fully verified.",
    });
  }

  if (summary.sell_missing_critical_fields_count > 0) {
    blockers.push({
      blocker_id: "sell_critical_fields_missing",
      side: "SELL",
      message: "Sell-side critical Avanza fields are not fully verified.",
    });
  }

  if (summary.mismatch_count > 0) {
    blockers.push({
      blocker_id: "verification_mismatches",
      side: "BOTH",
      message: "One or more Avanza field notes are marked mismatch.",
    });
  }

  if (summary.needs_review_count > 0) {
    warnings.push({
      warning_id: "notes_need_review",
      side: "BOTH",
      message: "One or more Avanza field notes need review before prototype use.",
    });
  }

  const verifiedFinalButtons = state.notes.filter(
    (note) =>
      note.criticality === "forbidden_final_confirmation" &&
      note.status === "verified",
  );

  if (verifiedFinalButtons.length > 0) {
    warnings.push({
      warning_id: "final_button_verified_not_clickable",
      side: "BOTH",
      message:
        "Verified final KÖP/SÄLJ buttons remain human-only. Verification does not permit agent clicking.",
    });
  }

  const hasAnyVerifiedCritical = summary.verified_critical_fields_count > 0;
  const status =
    blockers.length > 0
      ? hasAnyVerifiedCritical
        ? "blocked"
        : "unverified"
      : warnings.length > 0
        ? "needs_review"
        : "ready";

  return {
    status,
    summary,
    blockers,
    warnings,
  };
}

export function avanzaVerificationNotesJson(
  state: AvanzaVerificationNotesState,
): string {
  return JSON.stringify(state, null, 2);
}

function buyField(
  field_key: AvanzaVerificationNoteFieldKey,
  display_label: string,
  expected_generic_label: string,
  criticality: AvanzaVerificationCriticality,
): FieldDefinition {
  return {
    side: "BUY",
    field_key,
    display_label,
    expected_generic_label,
    criticality,
  };
}

function sellField(
  field_key: AvanzaVerificationNoteFieldKey,
  display_label: string,
  expected_generic_label: string,
  criticality: AvanzaVerificationCriticality,
): FieldDefinition {
  return {
    side: "SELL",
    field_key,
    display_label,
    expected_generic_label,
    criticality,
  };
}

function createDefaultNote(
  definition: FieldDefinition,
  timestamp: string,
): AvanzaFieldVerificationNote {
  return {
    note_id: `${definition.side}_${definition.field_key}`,
    side: definition.side,
    field_key: definition.field_key,
    display_label: definition.display_label,
    expected_generic_label: definition.expected_generic_label,
    actual_avanza_label: "",
    selector_or_data_testid_note: "",
    screenshot_reference: "",
    notes: "",
    source: "user_note",
    status: "unverified",
    criticality: definition.criticality,
    verified_at: "",
    verified_by: "",
    updated_at: timestamp,
  };
}

function normalizeFieldKey(
  value: unknown,
  side: AvanzaVerificationNoteSide,
): AvanzaVerificationNoteFieldKey {
  if (typeof value === "string") {
    const definition = avanzaVerificationFieldDefinitions.find(
      (item) => item.side === side && item.field_key === value,
    );

    if (definition) {
      return definition.field_key;
    }
  }

  return side === "BUY" ? "instrument_search" : "instrument_search";
}

function findDefinition(
  side: AvanzaVerificationNoteSide,
  fieldKey: AvanzaVerificationNoteFieldKey,
) {
  return (
    avanzaVerificationFieldDefinitions.find(
      (definition) =>
        definition.side === side && definition.field_key === fieldKey,
    ) ??
    avanzaVerificationFieldDefinitions.find(
      (definition) => definition.side === side,
    ) ??
    avanzaVerificationFieldDefinitions[0]
  );
}

function normalizeStatus(value: unknown): AvanzaVerificationNoteStatus {
  if (
    value === "verified" ||
    value === "mismatch" ||
    value === "needs_review" ||
    value === "deprecated"
  ) {
    return value;
  }

  return "unverified";
}

function normalizeCriticality(
  value: unknown,
  fallback: AvanzaVerificationCriticality,
): AvanzaVerificationCriticality {
  if (
    value === "critical" ||
    value === "important" ||
    value === "optional" ||
    value === "forbidden_final_confirmation"
  ) {
    return value;
  }

  return fallback;
}

function normalizeSource(value: unknown): AvanzaVerificationNoteSource {
  if (
    value === "manual_observation" ||
    value === "screenshot_reference" ||
    value === "dom_inspection"
  ) {
    return value;
  }

  return "user_note";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}
