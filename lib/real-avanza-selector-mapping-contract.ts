export type RealAvanzaSelectorClassification =
  | "read_only"
  | "future_fill_candidate"
  | "future_click_candidate"
  | "forbidden_final_action"
  | "human_verify_required"
  | "deferred";

export type RealAvanzaSelectorStability = "high" | "medium" | "low";

export type RealAvanzaFirstPocBehavior =
  | "allowed_read"
  | "allowed_fill_after_approval"
  | "allowed_click_after_separate_approval"
  | "block"
  | "forbidden";

export type RealAvanzaSelectorStage =
  | "first_fill_only"
  | "search_stage"
  | "review_stage"
  | "sell_stage"
  | "order_type_stage";

export type RealAvanzaSelectorMappingEntry = {
  key: string;
  label: string;
  visibleText?: readonly string[];
  selector: string;
  fallbackSelectors?: readonly string[];
  component?: string;
  formControlName?: string;
  meaning: string;
  classifications: readonly RealAvanzaSelectorClassification[];
  stability: RealAvanzaSelectorStability;
  firstPocBehavior: RealAvanzaFirstPocBehavior;
  stages: readonly RealAvanzaSelectorStage[];
  requiredForFirstFillOnlyPoc?: boolean;
  hardStop?: boolean;
  avoidSelectors?: readonly string[];
  riskNotes: readonly string[];
};

export const realAvanzaSelectorClassificationLabels = {
  read_only: "Read only",
  future_fill_candidate: "Future fill candidate",
  future_click_candidate: "Future click candidate",
  forbidden_final_action: "Forbidden final action",
  human_verify_required: "Human verification required",
  deferred: "Deferred",
} as const satisfies Record<RealAvanzaSelectorClassification, string>;

export const realAvanzaDisallowedStableSelectorStrategies = [
  "_ngcontent-*",
  "_nghost-*",
  "generated Angular ids",
  "generated ids such as aza-select-id-3",
  "generated-*",
  "#list-item-link-0",
] as const;

export const realAvanzaPreferredStableSelectorStrategies = [
  "data-e2e attributes",
  "visible labels",
  "semantic attributes",
  "formcontrolname values",
  "stable custom component names",
] as const;

export const realAvanzaSelectorMapping: readonly RealAvanzaSelectorMappingEntry[] = [
  {
    key: "open_search_button",
    label: "Open search button",
    visibleText: ["Sök"],
    selector: 'button[data-e2e="menuSearchButton"]',
    fallbackSelectors: ['button[aria-label="Sök"]'],
    component: "aza-search-link",
    meaning: "Opens the Avanza search panel.",
    classifications: ["future_click_candidate", "deferred"],
    stability: "high",
    firstPocBehavior: "block",
    stages: ["search_stage"],
    riskNotes: [
      "Search-stage click is deferred unless separately approved.",
      "Not required for first fill-only POC if the human opens the instrument.",
    ],
  },
  {
    key: "search_input",
    label: "Search input",
    visibleText: ["Sök", "Vad letar du efter?"],
    selector: 'input[data-e2e="search-query"]',
    fallbackSelectors: ["input#search-input"],
    meaning: "Search query field.",
    classifications: ["future_fill_candidate", "deferred"],
    stability: "high",
    firstPocBehavior: "block",
    stages: ["search_stage"],
    riskNotes: ["Search input is deferred until search-stage approval."],
  },
  {
    key: "search_result_row",
    label: "Search result row",
    visibleText: ["GameStop (GME)", "Aktie | E-Handel"],
    selector: 'a[href*="/aktier/om-aktien.html/194698/gamestop"]',
    fallbackSelectors: ['a[aria-label*="GameStop (GME)"]'],
    component: "aza-search-list-item",
    meaning: "Navigates to the specific instrument result.",
    classifications: ["future_click_candidate", "deferred"],
    stability: "medium",
    firstPocBehavior: "block",
    stages: ["search_stage"],
    avoidSelectors: ["#list-item-link-0"],
    riskNotes: [
      "Instrument-specific href can be stable for that instrument but is not a generic selector.",
      "Verify exact intended instrument before any navigation.",
    ],
  },
  {
    key: "instrument_market_info_panel",
    label: "Instrument/order market info panel",
    visibleText: ["GameStop"],
    selector: '[data-e2e="orderMarketInfoPanel"]',
    fallbackSelectors: [
      'aza-order-market-info-summary[data-e2e="orderMarketInfoPanel"]',
    ],
    component: "aza-order-market-info-summary",
    meaning: "Read-only instrument and market verification panel.",
    classifications: ["read_only", "human_verify_required"],
    stability: "high",
    firstPocBehavior: "allowed_read",
    stages: ["first_fill_only"],
    requiredForFirstFillOnlyPoc: true,
    riskNotes: ["Must match expected instrument before any future fill."],
  },
  {
    key: "account_selector_collapsed",
    label: "Account selector collapsed",
    visibleText: ["Handla på konto"],
    selector: 'button[aria-haspopup="listbox"]',
    component: "aza-select",
    meaning: "Read-only selected account trigger near the account label.",
    classifications: ["read_only", "human_verify_required"],
    stability: "medium",
    firstPocBehavior: "allowed_read",
    stages: ["first_fill_only"],
    requiredForFirstFillOnlyPoc: true,
    avoidSelectors: ["#aza-select-id-3", "aza-select-id-3"],
    riskNotes: [
      "Use label/ARIA relationship near Handla på konto.",
      "Do not change account automatically.",
    ],
  },
  {
    key: "account_selected_option",
    label: "Account selected option",
    selector: 'aza-select-option[role="option"][aria-selected="true"]',
    component: "aza-select-option",
    meaning: "Read-only selected account option if account list is open.",
    classifications: ["read_only", "human_verify_required"],
    stability: "medium",
    firstPocBehavior: "allowed_read",
    stages: ["first_fill_only"],
    riskNotes: [
      "Verify selected account only.",
      "Never select a different account automatically.",
    ],
  },
  {
    key: "side_switch_buy_state",
    label: "Side switch buy state",
    visibleText: ["Byt till sälj", "Granska köp"],
    selector: 'button[data-e2e="switchSideButton"][aria-label="Byt till sälj"]',
    component: "aza-switch-side-button",
    meaning: "If the switch says Byt till sälj, current form side is buy.",
    classifications: ["read_only", "human_verify_required"],
    stability: "high",
    firstPocBehavior: "allowed_read",
    stages: ["first_fill_only"],
    requiredForFirstFillOnlyPoc: true,
    riskNotes: ["Do not click the switch."],
  },
  {
    key: "side_switch_sell_state",
    label: "Side switch sell state",
    visibleText: ["Byt till köp", "Granska sälj"],
    selector: 'button[data-e2e="switchSideButton"][aria-label="Byt till köp"]',
    component: "aza-switch-side-button",
    meaning: "If the switch says Byt till köp, current form side is sell.",
    classifications: ["deferred", "human_verify_required"],
    stability: "high",
    firstPocBehavior: "block",
    stages: ["sell_stage"],
    riskNotes: ["First real Avanza fill-only POC is buy-only."],
  },
  {
    key: "amount_input",
    label: "Amount / Belopp i SEK input",
    visibleText: ["Belopp i SEK"],
    selector: 'input[data-e2e="inputAmount"]',
    fallbackSelectors: ["input#inputAmount"],
    formControlName: "amount",
    meaning: "Amount-based sizing field in SEK.",
    classifications: ["future_fill_candidate", "human_verify_required"],
    stability: "high",
    firstPocBehavior: "allowed_fill_after_approval",
    stages: ["first_fill_only"],
    requiredForFirstFillOnlyPoc: true,
    riskNotes: [
      "Recommended first sizing mode because cap is SEK.",
      "Do not fill amount and quantity blindly at the same time.",
      "Do not use steppers.",
    ],
  },
  {
    key: "quantity_input",
    label: "Quantity / Antal input",
    visibleText: ["Antal"],
    selector: 'input[data-e2e="inputVolume"]',
    fallbackSelectors: ["input#inputVolume"],
    formControlName: "volume",
    meaning: "Quantity-based sizing field.",
    classifications: ["future_fill_candidate", "human_verify_required"],
    stability: "high",
    firstPocBehavior: "allowed_fill_after_approval",
    stages: ["first_fill_only"],
    riskNotes: [
      "Only allowed if quantity-based mode is explicitly approved.",
      "Do not click Välj alla på kontot.",
      "Do not use steppers.",
      "Block if total cap is exceeded.",
    ],
  },
  {
    key: "price_input",
    label: "Price / Kurs i USD input",
    visibleText: ["Kurs i USD"],
    selector: 'input[data-e2e="inputPrice"]',
    fallbackSelectors: ["input#inputPrice"],
    formControlName: "price",
    meaning: "Limit price field.",
    classifications: ["future_fill_candidate", "human_verify_required"],
    stability: "high",
    firstPocBehavior: "allowed_fill_after_approval",
    stages: ["first_fill_only"],
    requiredForFirstFillOnlyPoc: true,
    riskNotes: [
      "Verify currency label is expected.",
      "Do not use steppers.",
    ],
  },
  {
    key: "order_type_limit_checked",
    label: "Advanced/Limit order type",
    visibleText: ["Avancerad"],
    selector: 'input[type="radio"][value="Limit"]',
    fallbackSelectors: [
      'mint-toggle-switch-option[data-e2e="selectOrderTypeOption_Limit"]',
    ],
    component: "aza-select-order-type",
    meaning: "Limit/Avancerad selected state.",
    classifications: ["read_only", "human_verify_required"],
    stability: "high",
    firstPocBehavior: "allowed_read",
    stages: ["first_fill_only"],
    requiredForFirstFillOnlyPoc: true,
    riskNotes: ["First POC requires this checked; do not change order type automatically."],
  },
  {
    key: "order_type_stop_loss",
    label: "Stop Loss order type",
    visibleText: ["Stop Loss"],
    selector: 'mint-toggle-switch-option[data-e2e="selectOrderTypeOption_StopLossAbsolute"]',
    meaning: "Stop Loss order type option.",
    classifications: ["deferred"],
    stability: "high",
    firstPocBehavior: "block",
    stages: ["order_type_stage"],
    riskNotes: ["Deferred and blocked for first POC."],
  },
  {
    key: "order_type_glidande",
    label: "Glidande order type",
    visibleText: ["Glidande"],
    selector: 'mint-toggle-switch-option[data-e2e="selectOrderTypeOption_StopLossDelta"]',
    meaning: "Trailing stop order type option.",
    classifications: ["deferred"],
    stability: "high",
    firstPocBehavior: "block",
    stages: ["order_type_stage"],
    riskNotes: ["Deferred and blocked for first POC."],
  },
  {
    key: "order_type_active_indicator",
    label: "Active order-type indicator",
    selector: 'div[data-e2e="active-indicator"]',
    meaning: "Supplemental selected-order-type indicator.",
    classifications: ["read_only"],
    stability: "medium",
    firstPocBehavior: "allowed_read",
    stages: ["first_fill_only"],
    riskNotes: ["Supplemental verification only; do not use as sole proof."],
  },
  {
    key: "fees_total",
    label: "Fees / Avgifter",
    visibleText: ["Avgifter"],
    selector: '[data-e2e="totalFees"]',
    meaning: "Read-only fee display.",
    classifications: ["read_only", "human_verify_required"],
    stability: "high",
    firstPocBehavior: "allowed_read",
    stages: ["first_fill_only"],
    riskNotes: [
      "Fees can be preliminary.",
      "Do not use fees as cap source alone.",
    ],
  },
  {
    key: "total_amount",
    label: "Total amount / Totalt belopp inkl. avgifter",
    visibleText: ["Totalt belopp inkl. avgifter"],
    selector: 'output[data-e2e="expandOrderAmount"]',
    component: "aza-order-total",
    meaning: "Primary read-only UI cap verification field.",
    classifications: ["read_only", "human_verify_required"],
    stability: "high",
    firstPocBehavior: "allowed_read",
    stages: ["first_fill_only"],
    requiredForFirstFillOnlyPoc: true,
    riskNotes: [
      "Parse SEK amount conservatively.",
      "Block if total cannot be parsed.",
      "Block if total exceeds the approved 1,000 SEK cap.",
      "FX/preliminary totals require human verification.",
    ],
  },
  {
    key: "expanded_fee_fx_details",
    label: "Expanded fee/FX details",
    visibleText: ["Courtage", "Valutaväxling", "Preliminär växlingskurs"],
    selector: "aza-order-summary",
    fallbackSelectors: [".accordion-section-body"],
    meaning: "Read-only expanded fee and FX details.",
    classifications: ["read_only", "human_verify_required"],
    stability: "medium",
    firstPocBehavior: "allowed_read",
    stages: ["review_stage"],
    riskNotes: [
      "Read-only human verification.",
      "Block if ambiguity affects cap.",
    ],
  },
  {
    key: "review_buy_button",
    label: "Review buy button / Granska köp",
    visibleText: ["Granska köp"],
    selector: 'button[data-e2e="orderButton"][data-mint-button-theme="buy"]',
    meaning: "Opens buy confirmation modal; not final submit.",
    classifications: ["future_click_candidate", "deferred"],
    stability: "high",
    firstPocBehavior: "block",
    stages: ["review_stage"],
    riskNotes: [
      "Blocked for first fill-only POC.",
      "Review-stage click requires separate explicit approval.",
    ],
  },
  {
    key: "review_sell_button",
    label: "Review sell button / Granska sälj",
    visibleText: ["Granska sälj"],
    selector: 'button[data-e2e="orderButton"][data-mint-button-theme="sell"]',
    meaning: "Opens sell confirmation modal; not final submit.",
    classifications: ["deferred"],
    stability: "high",
    firstPocBehavior: "block",
    stages: ["sell_stage", "review_stage"],
    riskNotes: ["Sell is deferred and blocked for first POC."],
  },
  {
    key: "confirmation_modal",
    label: "Confirmation modal/dialog",
    selector: "form.order-screen-content.order-dialog",
    fallbackSelectors: ["mint-card"],
    meaning: "Review-stage modal content.",
    classifications: ["read_only", "deferred"],
    stability: "medium",
    firstPocBehavior: "block",
    stages: ["review_stage"],
    riskNotes: [
      "First fill-only POC should not open modal.",
      "Future review-stage POC may only read/verify and cancel.",
    ],
  },
  {
    key: "final_confirm_button",
    label: "Final confirm button general",
    selector: 'button[data-e2e="confirmOrderButton"]',
    meaning: "Final broker submit button.",
    classifications: ["forbidden_final_action"],
    stability: "high",
    firstPocBehavior: "forbidden",
    stages: ["review_stage"],
    hardStop: true,
    riskNotes: ["Always forbidden. Never click."],
  },
  {
    key: "final_confirm_buy_button",
    label: "Final confirm buy button / Bekräfta köp",
    visibleText: ["Bekräfta köp"],
    selector: 'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
    meaning: "Final buy broker submit.",
    classifications: ["forbidden_final_action"],
    stability: "high",
    firstPocBehavior: "forbidden",
    stages: ["review_stage"],
    hardStop: true,
    riskNotes: ["Always forbidden. Never click."],
  },
  {
    key: "final_confirm_sell_button",
    label: "Final confirm sell button / Bekräfta sälj",
    visibleText: ["Bekräfta sälj"],
    selector: 'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
    meaning: "Final sell broker submit.",
    classifications: ["forbidden_final_action"],
    stability: "high",
    firstPocBehavior: "forbidden",
    stages: ["review_stage", "sell_stage"],
    hardStop: true,
    riskNotes: ["Always forbidden. Never click."],
  },
  {
    key: "cancel_button",
    label: "Cancel / Avbryt",
    visibleText: ["Avbryt"],
    selector: 'button[data-e2e="orderConfirmCancelLink"]',
    fallbackSelectors: ["button.order-dialog-cancel"],
    meaning: "Review modal cancel/exit button.",
    classifications: ["future_click_candidate", "deferred"],
    stability: "medium",
    firstPocBehavior: "block",
    stages: ["review_stage"],
    riskNotes: [
      "Safer than confirm, but still a real Avanza click.",
      "Only allowed in future review-stage POC after explicit approval.",
    ],
  },
] as const;

export const realAvanzaForbiddenFinalSelectors = realAvanzaSelectorMapping
  .filter((entry) => entry.hardStop === true)
  .map((entry) => entry.selector);

export const realAvanzaFirstFillOnlyRequiredSelectorKeys =
  realAvanzaSelectorMapping
    .filter((entry) => entry.requiredForFirstFillOnlyPoc === true)
    .map((entry) => entry.key);

export const realAvanzaDeferredSelectorKeys = realAvanzaSelectorMapping
  .filter((entry) => entry.firstPocBehavior === "block")
  .map((entry) => entry.key);

export function findRealAvanzaSelectorMappingEntry(key: string) {
  return realAvanzaSelectorMapping.find((entry) => entry.key === key) ?? null;
}
