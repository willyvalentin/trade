export type BrowserAgentPlanReadinessStatus =
  | "current_ture_readiness"
  | "mock_harness_next"
  | "blocked_for_avanza"
  | "future_policy_gated";

export type BrowserAgentPhaseStatus =
  | "current"
  | "planned"
  | "blocked"
  | "future";

export type BrowserAgentSide = "BUY" | "SELL" | "BOTH";

export type BrowserAgentCapability = {
  capability_id: string;
  label: string;
  side: BrowserAgentSide;
  status:
    | "available_in_ture"
    | "planned_mock_only"
    | "blocked_until_verified"
    | "future_policy_gated"
    | "forbidden";
  description: string;
};

export type BrowserAgentMilestone = {
  milestone_id: string;
  label: string;
  status: "complete" | "planned" | "blocked" | "future";
  description: string;
};

export type BrowserAgentRequiredInput = {
  input_id: string;
  label: string;
  side: BrowserAgentSide;
  required_for_phase: string;
  source: string;
  status: "available" | "assumed" | "missing" | "future";
};

export type BrowserAgentRequiredDomBlock = {
  dom_id: string;
  side: BrowserAgentSide;
  label: string;
  required_for_phase: string;
  expected_attribute: 'data-agent-readable="true"';
  status: "implemented" | "expected";
};

export type BrowserAgentHardStop = {
  hard_stop_id: string;
  label: string;
  severity: "warning" | "critical";
  applies_to: BrowserAgentSide;
  remediation: string;
};

export type BrowserAgentHumanCheckpoint = {
  checkpoint_id: string;
  label: string;
  applies_to: BrowserAgentSide;
  required_before: string;
  description: string;
};

export type BrowserAgentForbiddenAction = {
  action_id: string;
  label: string;
  applies_to: BrowserAgentSide;
  reason: string;
};

export type BrowserAgentVerificationDependency = {
  dependency_id: string;
  label: string;
  status: "available" | "assumed" | "not_verified" | "blocked";
  required_before_phase: string;
  description: string;
};

export type BrowserAgentOpenQuestion = {
  question_id: string;
  label: string;
  phase: string;
  status: "open" | "deferred";
  recommendation: string;
};

export type BrowserAgentPhase = {
  phase_id: string;
  phase_number: number;
  title: string;
  status: BrowserAgentPhaseStatus;
  summary: string;
  milestones: BrowserAgentMilestone[];
  capabilities: BrowserAgentCapability[];
  required_inputs: BrowserAgentRequiredInput[];
  required_dom_blocks: string[];
  hard_stops: string[];
  human_checkpoints: string[];
};

export type BrowserAgentPrototypePlan = {
  plan_id: string;
  plan_version: "2.0";
  plan_kind: "browser_agent_prototype_plan";
  created_at: string;
  overall_readiness_status: BrowserAgentPlanReadinessStatus;
  current_phase_id: string;
  current_phase_label: string;
  next_recommended_action: string;
  why_avanza_is_not_ready_yet: string;
  safety_status: string;
  can_run_real_broker_agent: false;
  can_submit_broker_order: false;
  can_handle_credentials: false;
  can_click_final_buy_or_sell: false;
  phases: BrowserAgentPhase[];
  required_dom_blocks: BrowserAgentRequiredDomBlock[];
  hard_stops: BrowserAgentHardStop[];
  human_checkpoints: BrowserAgentHumanCheckpoint[];
  forbidden_actions: BrowserAgentForbiddenAction[];
  verification_dependencies: BrowserAgentVerificationDependency[];
  open_questions: BrowserAgentOpenQuestion[];
  audit_events: {
    generated: "browser_agent_prototype_plan_generated";
    copied: "browser_agent_prototype_plan_copied";
  };
};

export type BuildBrowserAgentPrototypePlanInput = {
  createdAt?: string;
};

const BUY_DOM_BLOCKS: BrowserAgentRequiredDomBlock[] = [
  domBlock("trade-execution-payload-json", "BUY", "Buy execution payload"),
  domBlock("trade-agent-handoff-command-json", "BUY", "Buy agent handoff command"),
  domBlock("trade-agent-hard-stop-contract-json", "BUY", "Buy hard stop contract"),
  domBlock("trade-agent-form-mapping-preview-json", "BUY", "Buy form mapping preview"),
  domBlock(
    "trade-broker-fill-capture-agent-spec-json",
    "BUY",
    "Broker fill capture agent spec",
  ),
  domBlock(
    "trade-ture-fill-autofill-contract-json",
    "BUY",
    "Ture fill autofill contract",
  ),
  domBlock("trade-fill-capture-review-json", "BUY", "Fill capture review"),
  domBlock(
    "trade-ture-agent-completion-policy-json",
    "BUY",
    "Ture agent completion policy",
  ),
  domBlock(
    "trade-avanza-buy-field-verification-json",
    "BUY",
    "Avanza buy field verification",
  ),
];

const SELL_DOM_BLOCKS: BrowserAgentRequiredDomBlock[] = [
  domBlock("trade-sell-execution-payload-json", "SELL", "Sell execution payload"),
  domBlock(
    "trade-sell-agent-handoff-command-json",
    "SELL",
    "Sell agent handoff command",
  ),
  domBlock("trade-sell-hard-stop-contract-json", "SELL", "Sell hard stop contract"),
  domBlock(
    "trade-sell-form-mapping-preview-json",
    "SELL",
    "Sell form mapping preview",
  ),
  domBlock(
    "trade-broker-exit-capture-agent-spec-json",
    "SELL",
    "Broker exit capture agent spec",
  ),
  domBlock(
    "trade-ture-exit-autofill-contract-json",
    "SELL",
    "Ture exit autofill contract",
  ),
  domBlock("trade-exit-capture-review-json", "SELL", "Exit capture review"),
  domBlock(
    "trade-ture-exit-completion-policy-json",
    "SELL",
    "Ture exit completion policy",
  ),
  domBlock(
    "trade-avanza-sell-field-verification-json",
    "SELL",
    "Avanza sell field verification",
  ),
];

function domBlock(
  dom_id: string,
  side: BrowserAgentSide,
  label: string,
): BrowserAgentRequiredDomBlock {
  return {
    dom_id,
    side,
    label,
    required_for_phase: "phase_1_local_mock_broker_dry_run_harness",
    expected_attribute: 'data-agent-readable="true"',
    status: "implemented",
  };
}

export function buildBrowserAgentPrototypePlan(
  input: BuildBrowserAgentPrototypePlanInput = {},
): BrowserAgentPrototypePlan {
  const createdAt = normalizeIsoTimestamp(input.createdAt);
  const requiredDomBlocks = [...BUY_DOM_BLOCKS, ...SELL_DOM_BLOCKS];
  const hardStops = buildHardStops();
  const humanCheckpoints = buildHumanCheckpoints();
  const forbiddenActions = buildForbiddenActions();

  return {
    plan_id: `browser-agent-prototype-plan-v2-${createdAt.slice(0, 10)}`,
    plan_version: "2.0",
    plan_kind: "browser_agent_prototype_plan",
    created_at: createdAt,
    overall_readiness_status: "mock_harness_next",
    current_phase_id: "phase_0_current_ture_readiness",
    current_phase_label: "Phase 0 - Current Ture readiness",
    next_recommended_action: "Build a local mock broker dry run harness.",
    why_avanza_is_not_ready_yet:
      "Avanza fields, labels, selectors, and screen states are not manually verified.",
    safety_status:
      "Real broker execution remains human-only. No browser agent runtime, broker automation, or order submission is enabled.",
    can_run_real_broker_agent: false,
    can_submit_broker_order: false,
    can_handle_credentials: false,
    can_click_final_buy_or_sell: false,
    phases: buildPhases(requiredDomBlocks, hardStops),
    required_dom_blocks: requiredDomBlocks,
    hard_stops: hardStops,
    human_checkpoints: humanCheckpoints,
    forbidden_actions: forbiddenActions,
    verification_dependencies: buildVerificationDependencies(),
    open_questions: buildOpenQuestions(),
    audit_events: {
      generated: "browser_agent_prototype_plan_generated",
      copied: "browser_agent_prototype_plan_copied",
    },
  };
}

export function browserAgentPrototypePlanJson(
  plan: BrowserAgentPrototypePlan,
): string {
  return JSON.stringify(plan, null, 2);
}

function normalizeIsoTimestamp(value: string | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function buildPhases(
  requiredDomBlocks: BrowserAgentRequiredDomBlock[],
  hardStops: BrowserAgentHardStop[],
): BrowserAgentPhase[] {
  return [
    {
      phase_id: "phase_0_current_ture_readiness",
      phase_number: 0,
      title: "Current Ture readiness",
      status: "current",
      summary:
        "Ture has machine-readable payloads, commands, hard stops, mappings, capture specs, autofill contracts, completion policies, partial accounting, and Avanza field verification reports. No browser agent exists.",
      milestones: [
        milestone("machine_readable_contracts", "Machine-readable DOM contracts exist", "complete"),
        milestone("prepare_only_safety", "Prepare-only safety contracts exist", "complete"),
        milestone("no_agent_runtime", "No browser agent runtime exists", "complete"),
      ],
      capabilities: [
        capability(
          "generate_ture_contracts",
          "Generate Ture execution and safety contracts",
          "BOTH",
          "available_in_ture",
        ),
        capability(
          "real_broker_execution",
          "Real broker execution",
          "BOTH",
          "forbidden",
        ),
      ],
      required_inputs: [
        input(
          "ture_contract_state",
          "Existing Ture contract state",
          "BOTH",
          "phase_0_current_ture_readiness",
          "Ture UI and local helper builders",
          "available",
        ),
      ],
      required_dom_blocks: requiredDomBlocks.map((block) => block.dom_id),
      hard_stops: [],
      human_checkpoints: [],
    },
    {
      phase_id: "phase_1_local_mock_broker_dry_run_harness",
      phase_number: 1,
      title: "Local Mock Broker Dry Run Harness",
      status: "planned",
      summary:
        "A future agent reads Ture DOM JSON, opens a local mock broker form, fills mock fields, stops before mock final confirmation, and returns mock fill data to Ture in dev mode only.",
      milestones: [
        milestone("read_ture_dom_json", "Read Ture DOM JSON", "planned"),
        milestone("fill_mock_form", "Fill local mock broker form", "planned"),
        milestone("stop_before_mock_final_confirmation", "Stop before mock final confirmation", "planned"),
        milestone("mock_fill_recordkeeping", "Return mock fill data to Ture dev fields", "planned"),
      ],
      capabilities: [
        capability(
          "mock_prepare_form",
          "Prepare mock broker order form",
          "BOTH",
          "planned_mock_only",
        ),
        capability(
          "mock_fill_capture",
          "Capture mock broker fill data",
          "BOTH",
          "planned_mock_only",
        ),
      ],
      required_inputs: [
        input(
          "mock_broker_form",
          "Local mock broker form",
          "BOTH",
          "phase_1_local_mock_broker_dry_run_harness",
          "Future local dev harness",
          "future",
        ),
      ],
      required_dom_blocks: requiredDomBlocks.map((block) => block.dom_id),
      hard_stops: ["missing_dom_contract", "unsafe_to_continue"],
      human_checkpoints: ["user_reviews_mock_final_confirmation"],
    },
    {
      phase_id: "phase_2_agent_dry_run_validation",
      phase_number: 2,
      title: "Agent dry-run validation",
      status: "planned",
      summary:
        "Validate hard stops, mapping confidence, unknown UI behavior, ticker/side/quantity/price matching, partial fills/exits, and audit timeline behavior without Avanza.",
      milestones: [
        milestone("validate_hard_stops", "Validate hard stops", "planned"),
        milestone("validate_mapping_confidence", "Validate mapping confidence", "planned"),
        milestone("validate_partial_execution", "Validate partial fill and exit handling", "planned"),
        milestone("validate_audit_timeline", "Validate audit timeline", "planned"),
      ],
      capabilities: [
        capability(
          "dry_run_validation",
          "Dry-run browser-agent behavior against mock UI",
          "BOTH",
          "planned_mock_only",
        ),
      ],
      required_inputs: [
        input(
          "dry_run_results",
          "Dry-run validation results",
          "BOTH",
          "phase_2_agent_dry_run_validation",
          "Future mock harness run logs",
          "future",
        ),
      ],
      required_dom_blocks: requiredDomBlocks.map((block) => block.dom_id),
      hard_stops: hardStops.map((stop) => stop.hard_stop_id),
      human_checkpoints: ["user_reviews_dry_run_results"],
    },
    {
      phase_id: "phase_3_avanza_manual_field_verification",
      phase_number: 3,
      title: "Avanza manual field verification",
      status: "blocked",
      summary:
        "The user manually documents real Avanza labels, steps, screenshots, notes, and selectors if safe. Critical fields must move from assumed or unknown to verified before any prepare-only Avanza agent test.",
      milestones: [
        milestone("document_buy_fields", "Document Avanza buy fields", "blocked"),
        milestone("document_sell_fields", "Document Avanza sell fields", "blocked"),
        milestone("verify_stop_before_final_confirmation", "Verify final confirmation stop guard", "blocked"),
      ],
      capabilities: [
        capability(
          "verified_avanza_field_mapping",
          "Use manually verified Avanza fields",
          "BOTH",
          "blocked_until_verified",
        ),
      ],
      required_inputs: [
        input(
          "manual_avanza_field_notes",
          "Manual Avanza field verification notes",
          "BOTH",
          "phase_3_avanza_manual_field_verification",
          "Human verification outside Ture",
          "missing",
        ),
      ],
      required_dom_blocks: [
        "trade-avanza-buy-field-verification-json",
        "trade-avanza-sell-field-verification-json",
      ],
      hard_stops: [
        "field_verification_not_sufficient",
        "unknown_broker_ui_state",
        "final_confirmation_button_reached",
      ],
      human_checkpoints: ["user_manually_verifies_avanza_fields"],
    },
    {
      phase_id: "phase_4_avanza_prepare_only_prototype",
      phase_number: 4,
      title: "Avanza prepare-only prototype",
      status: "future",
      summary:
        "After user initiation and manual login, a future agent may fill only verified allowed fields and must stop before final Avanza confirmation. The human manually clicks final KÖP or SÄLJ.",
      milestones: [
        milestone("user_initiated_avanza_prepare", "User initiates Avanza prepare-only run", "future"),
        milestone("fill_verified_fields_only", "Fill verified allowed fields only", "future"),
        milestone("stop_before_final_confirmation", "Stop before final Avanza confirmation", "future"),
        milestone("post_confirmation_fill_capture", "Read post-confirmation fill data after human confirmation", "future"),
      ],
      capabilities: [
        capability(
          "avanza_prepare_only",
          "Prepare verified Avanza order form fields only",
          "BOTH",
          "blocked_until_verified",
        ),
        capability(
          "post_confirmation_capture",
          "Capture fill data after manual Avanza confirmation",
          "BOTH",
          "future_policy_gated",
        ),
      ],
      required_inputs: [
        input(
          "verified_avanza_fields",
          "Verified Avanza fields and stop guard",
          "BOTH",
          "phase_4_avanza_prepare_only_prototype",
          "Avanza field verification report",
          "missing",
        ),
      ],
      required_dom_blocks: requiredDomBlocks.map((block) => block.dom_id),
      hard_stops: hardStops.map((stop) => stop.hard_stop_id),
      human_checkpoints: [
        "user_initiates_buy_or_sell_in_ture",
        "user_manually_confirms_final_buy_or_sell_in_avanza",
      ],
    },
    {
      phase_id: "phase_5_future_ture_side_completion_policy_gate",
      phase_number: 5,
      title: "Future Ture-side completion policy gate",
      status: "future",
      summary:
        "A future agent may complete Ture-side recordkeeping only if the user initiated the action, manual Avanza confirmation happened, broker fill data is verified, review status is ready, completion policy allows it, no blockers exist, and audit metadata can be written.",
      milestones: [
        milestone("policy_allowed_completion", "Completion policy allows future Ture completion", "future"),
        milestone("audit_metadata_written", "Audit metadata can be written", "future"),
        milestone("human_review_fallback", "Human review fallback remains available", "future"),
      ],
      capabilities: [
        capability(
          "future_ture_recordkeeping_completion",
          "Complete Ture-side recordkeeping after strict policy approval",
          "BOTH",
          "future_policy_gated",
        ),
      ],
      required_inputs: [
        input(
          "completion_policy_decision",
          "Ture-side completion policy decision",
          "BOTH",
          "phase_5_future_ture_side_completion_policy_gate",
          "Ture agent completion policy",
          "available",
        ),
      ],
      required_dom_blocks: [
        "trade-ture-agent-completion-policy-json",
        "trade-ture-exit-completion-policy-json",
      ],
      hard_stops: [
        "missing_manual_broker_confirmation",
        "broker_status_not_filled_after_confirmation",
        "partial_fill_or_exit_requires_human_review",
        "unsafe_to_continue",
      ],
      human_checkpoints: ["user_reviews_ture_recordkeeping"],
    },
  ];
}

function milestone(
  milestone_id: string,
  label: string,
  status: BrowserAgentMilestone["status"],
): BrowserAgentMilestone {
  return {
    milestone_id,
    label,
    status,
    description: label,
  };
}

function capability(
  capability_id: string,
  label: string,
  side: BrowserAgentSide,
  status: BrowserAgentCapability["status"],
): BrowserAgentCapability {
  return {
    capability_id,
    label,
    side,
    status,
    description: label,
  };
}

function input(
  input_id: string,
  label: string,
  side: BrowserAgentSide,
  required_for_phase: string,
  source: string,
  status: BrowserAgentRequiredInput["status"],
): BrowserAgentRequiredInput {
  return {
    input_id,
    label,
    side,
    required_for_phase,
    source,
    status,
  };
}

function buildHardStops(): BrowserAgentHardStop[] {
  return [
    hardStop("missing_dom_contract", "Missing DOM contract", "critical", "BOTH"),
    hardStop("expired_payload", "Expired payload", "critical", "BOTH"),
    hardStop("handoff_integrity_failure", "Handoff integrity failure", "critical", "BOTH"),
    hardStop("hard_stop_contract_not_pass", "Hard stop contract not pass", "critical", "BOTH"),
    hardStop("field_verification_not_sufficient", "Field verification not sufficient", "critical", "BOTH"),
    hardStop("unknown_broker_ui_state", "Unknown broker UI state", "critical", "BOTH"),
    hardStop("ticker_mismatch", "Ticker mismatch", "critical", "BOTH"),
    hardStop("side_mismatch", "Side mismatch", "critical", "BOTH"),
    hardStop("quantity_mismatch", "Quantity mismatch", "critical", "BOTH"),
    hardStop("price_mismatch", "Price mismatch", "critical", "BOTH"),
    hardStop(
      "broker_status_not_filled_after_confirmation",
      "Broker status is not filled after confirmation",
      "critical",
      "BOTH",
    ),
    hardStop(
      "partial_fill_or_exit_requires_human_review",
      "Partial fill or exit requires human review",
      "warning",
      "BOTH",
    ),
    hardStop(
      "missing_manual_broker_confirmation",
      "Missing manual broker confirmation",
      "critical",
      "BOTH",
    ),
    hardStop("credentials_login_required", "Credentials or login required", "critical", "BOTH"),
    hardStop(
      "final_confirmation_button_reached",
      "Final confirmation button reached",
      "critical",
      "BOTH",
    ),
    hardStop("unsafe_to_continue", "Unsafe to continue", "critical", "BOTH"),
  ];
}

function hardStop(
  hard_stop_id: string,
  label: string,
  severity: BrowserAgentHardStop["severity"],
  applies_to: BrowserAgentSide,
): BrowserAgentHardStop {
  return {
    hard_stop_id,
    label,
    severity,
    applies_to,
    remediation: "Stop immediately and require human review.",
  };
}

function buildHumanCheckpoints(): BrowserAgentHumanCheckpoint[] {
  return [
    checkpoint(
      "user_chooses_add_trade_or_prepare_buy_order",
      "User chooses ADD TRADE / Prepare Buy Order in Ture",
      "BUY",
      "buy_order_prepare",
    ),
    checkpoint(
      "user_manually_confirms_final_kop_in_avanza",
      "User manually confirms final KÖP in Avanza",
      "BUY",
      "broker_buy_confirmation",
    ),
    checkpoint(
      "user_chooses_prepare_sell_order_or_close_trade",
      "User chooses Prepare Sell Order / Close Trade in Ture",
      "SELL",
      "sell_order_prepare",
    ),
    checkpoint(
      "user_manually_confirms_final_salj_in_avanza",
      "User manually confirms final SÄLJ in Avanza",
      "SELL",
      "broker_sell_confirmation",
    ),
    checkpoint(
      "user_reviews_ture_recordkeeping",
      "User reviews Ture recordkeeping until future policy explicitly allows completion",
      "BOTH",
      "ture_recordkeeping",
    ),
  ];
}

function checkpoint(
  checkpoint_id: string,
  label: string,
  applies_to: BrowserAgentSide,
  required_before: string,
): BrowserAgentHumanCheckpoint {
  return {
    checkpoint_id,
    label,
    applies_to,
    required_before,
    description: label,
  };
}

function buildForbiddenActions(): BrowserAgentForbiddenAction[] {
  return [
    forbidden("click_avanza_kop", "Click Avanza KÖP", "BUY"),
    forbidden("click_avanza_salj", "Click Avanza SÄLJ", "SELL"),
    forbidden("submit_real_broker_order", "Submit any real broker order", "BOTH"),
    forbidden("handle_credentials_login", "Handle credentials or login", "BOTH"),
    forbidden("bypass_hard_stops", "Bypass hard stops", "BOTH"),
    forbidden("fill_unverified_critical_fields", "Fill unverified critical fields", "BOTH"),
    forbidden("guess_missing_values", "Guess missing values", "BOTH"),
    forbidden("alter_ture_trade_plan_to_force_match", "Alter Ture trade plan to force a match", "BOTH"),
    forbidden("continue_on_unknown_broker_ui", "Continue on unknown broker UI", "BOTH"),
    forbidden("hide_mismatches", "Hide mismatches", "BOTH"),
    forbidden(
      "auto_save_ture_without_future_policy",
      "Auto-save Ture unless future policy explicitly allows and app enables it",
      "BOTH",
    ),
  ];
}

function forbidden(
  action_id: string,
  label: string,
  applies_to: BrowserAgentSide,
): BrowserAgentForbiddenAction {
  return {
    action_id,
    label,
    applies_to,
    reason: "Forbidden by Ture browser-agent safety policy.",
  };
}

function buildVerificationDependencies(): BrowserAgentVerificationDependency[] {
  return [
    {
      dependency_id: "avanza_field_labels",
      label: "Manual Avanza field labels",
      status: "not_verified",
      required_before_phase: "phase_4_avanza_prepare_only_prototype",
      description: "Exact Avanza buy/sell labels are still assumed or unknown.",
    },
    {
      dependency_id: "avanza_selectors",
      label: "Manual Avanza selectors",
      status: "not_verified",
      required_before_phase: "phase_4_avanza_prepare_only_prototype",
      description: "No real Avanza selectors are encoded or invented.",
    },
    {
      dependency_id: "mock_broker_harness",
      label: "Local mock broker harness",
      status: "blocked",
      required_before_phase: "phase_1_local_mock_broker_dry_run_harness",
      description: "The next recommended implementation step is a local mock broker dry run harness.",
    },
    {
      dependency_id: "ture_completion_policy",
      label: "Ture-side completion policy",
      status: "available",
      required_before_phase: "phase_5_future_ture_side_completion_policy_gate",
      description: "Policy exists, but automatic completion is not enabled.",
    },
  ];
}

function buildOpenQuestions(): BrowserAgentOpenQuestion[] {
  return [
    {
      question_id: "mock_broker_form_shape",
      label: "What local mock broker form shape should Phase 1 use?",
      phase: "phase_1_local_mock_broker_dry_run_harness",
      status: "open",
      recommendation: "Build the smallest local mock form that mirrors Ture's generic buy/sell field mappings.",
    },
    {
      question_id: "avanza_verification_artifacts",
      label: "Which manual Avanza verification artifacts are acceptable?",
      phase: "phase_3_avanza_manual_field_verification",
      status: "open",
      recommendation: "Use human-authored labels, notes, and safe screenshots if allowed. Do not store credentials.",
    },
    {
      question_id: "partial_execution_policy",
      label: "When should partial fills/exits remain human-only?",
      phase: "phase_5_future_ture_side_completion_policy_gate",
      status: "deferred",
      recommendation: "Keep partial execution under human review until accounting and UI support are proven end to end.",
    },
  ];
}
