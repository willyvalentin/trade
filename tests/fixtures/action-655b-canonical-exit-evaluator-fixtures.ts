import { createHash } from "node:crypto";

type PlainRecord = Record<string, unknown>;

const policyId = "server_primary_exit_policy";
const policyIdentity = "tm_exit_policy:v3:server_primary_exit_policy:2";
const policyDigest = "746fb35346a353752cc01a38d76a2b6e5593b41f8e7e078d746ebfd221c496cf";

export const action655gFixtureTraversalMatrix = Object.freeze({
  stage10: Object.freeze([
    "/contract_version",
    "/position_snapshot/contract_version",
    "/position_snapshot/position_identity",
    "/position_snapshot/position_version",
    "/position_snapshot/durable_recommendation_uuid",
    "/position_snapshot/durable_recommendation_version",
    "/position_snapshot/recommendation_identity",
    "/position_snapshot/recommendation_normative_digest",
    "/position_snapshot/instrument_identity",
    "/position_snapshot/side",
    "/position_snapshot/status",
    "/position_snapshot/opened_at",
    "/position_snapshot/snapshot_at",
    "/position_snapshot/price_scale",
    "/position_snapshot/tick_size_price_units",
    "/position_snapshot/quantity_scale",
    "/position_snapshot/lot_size_quantity_units",
    "/position_snapshot/total_quantity_units",
    "/position_snapshot/remaining_quantity_units",
    "/position_snapshot/entry_price_units",
    "/position_snapshot/initial_stop_price_units",
    "/position_snapshot/initial_risk_price_units",
    "/position_snapshot/current_stop_price_units",
    "/position_snapshot/invalidation_price_units",
    "/position_snapshot/target_1_price_units",
    "/position_snapshot/target_2_price_units",
    "/position_snapshot/position_snapshot_digest",
    "/monitor_observation/contract_version",
    "/monitor_observation/observation_identity",
    "/monitor_observation/position_identity",
    "/monitor_observation/position_version",
    "/monitor_observation/position_snapshot_digest",
    "/monitor_observation/instrument_identity",
    "/monitor_observation/observed_at",
    "/monitor_observation/market_data_contract_version",
    "/monitor_observation/market_data_observation_identity",
    "/monitor_observation/market_data_observed_at",
    "/monitor_observation/market_data_digest",
    "/monitor_observation/current_price_units",
    "/monitor_observation/session_state",
    "/monitor_observation/observation_digest",
    "/decision_requested_at",
    "/evaluation_request_identity",
    "/input_digest",
  ] as const),
  stage11: Object.freeze([
    "/position_snapshot/position_identity",
    "/position_snapshot/position_version",
    "/position_snapshot/durable_recommendation_uuid",
    "/position_snapshot/durable_recommendation_version",
    "/position_snapshot/recommendation_identity",
    "/position_snapshot/recommendation_normative_digest",
    "/position_snapshot/instrument_identity",
    "/position_snapshot/side",
    "/position_snapshot/status",
    "/position_snapshot/opened_at",
    "/position_snapshot/snapshot_at",
    "/position_snapshot/price_scale",
    "/position_snapshot/tick_size_price_units",
    "/position_snapshot/quantity_scale",
    "/position_snapshot/lot_size_quantity_units",
    "/position_snapshot/total_quantity_units",
    "/position_snapshot/remaining_quantity_units",
    "/position_snapshot/entry_price_units",
    "/position_snapshot/initial_stop_price_units",
    "/position_snapshot/initial_risk_price_units",
    "/position_snapshot/current_stop_price_units",
    "/position_snapshot/invalidation_price_units",
    "/position_snapshot/target_1_price_units",
    "/position_snapshot/target_2_price_units",
    "/position_snapshot/position_snapshot_digest",
    "/monitor_observation/observation_identity",
    "/monitor_observation/position_identity",
    "/monitor_observation/position_version",
    "/monitor_observation/position_snapshot_digest",
    "/monitor_observation/instrument_identity",
    "/monitor_observation/observed_at",
    "/monitor_observation/market_data_contract_version",
    "/monitor_observation/market_data_observation_identity",
    "/monitor_observation/market_data_observed_at",
    "/monitor_observation/market_data_digest",
    "/monitor_observation/current_price_units",
    "/monitor_observation/session_state",
    "/monitor_observation/observation_digest",
    "/decision_requested_at",
    "/evaluation_request_identity",
    "/input_digest",
  ] as const),
});

export const action655bFrozenDigestVectors = Object.freeze({
  policy: {
    positive: policyDigest,
    alternate_field_name: "660e5d41b8a2268c461e5f0a2385dc807e2564201f7f630db380300ab17a1717",
    altered_projection: "89b3327005321a84c047861d077648a02baa493111df2d97261bcf8232d2a487",
    reordered_raw: "757d043c1e6a765abb4a63e4a88630d3864949dfa44d4caf579d0da4e08c8777",
  },
  provenance: {
    positive: "1351cd913fa2bae9db8145809679a48b0da9491018819a2f1b53a29314194bcc",
    altered_decision_requested_at: "8faa48feb18f8726e5acbe0a43e3cf74a59015be7bad1bb1481a6ae8fec3571a",
    altered_observation_identity: "483693571de512c36d31d746dc4dcbabbe5b6e6ebfa4098aa279f5691d2c675a",
    altered_policy_digest: "a7c7563185c6e7352a3efb5ad4e965f0fa8e1c8024a44738418dd4b24165e3be",
    altered_recommendation_uuid: "e2da73e275ec33b0ffc37a5f45fa832105c47d8b46cb127f231ac31b9919a8b0",
    altered_recommendation_version: "a23ff06adc74d5e70880c537f107e118c1c8e424e3d469c5dc66314cae3af547",
  },
  decision: {
    identity: "tm_exit_decision:v4:beb83712b4080d43952274f5fc46a76b5236bb2b9a2ac3c7990c22c9304377ba",
    positive: {
      decision: "6cfa14bb3ee7fb4084d2a9d67504d20cfee6057fe39bd4b376a1f9e1b88edd38",
      invalid: "c0eb00743c9739fcec72858ad19e957830faf479320c4aa4c3da2062a3cffd42",
      noneligible: "fcf5cd83c9013111eb7203d6d9710628ece39f20a8244fa91540b5d50a578a1a",
      refused: "05aa2a55d7bb8deaec8622b82f42e19b63e70baa92f83e224967d781a1aa7705",
    },
    mutation: {
      altered_decision_requested_at: "05379b6864463ad791fe90e862579ca976fc6cfeac85cb5c03735df9e2790ad1",
      altered_observation_identity: "f423a6fd7962c8740cb9ebb4128927d5c60f5093a355609d4d851507137f5c4a",
      altered_policy_digest: "44b0b2931fe78036f7545ea5aec4636343e24932d9e6f3103a3b2b3251ad4d3d",
      altered_recommendation_uuid: "29334fe0f3eac828c1b67ba51192847ad384536a5d02a0c044fd26f84fc592d6",
      altered_recommendation_version: "70812fd5b13351137e398b02d0431c4301aa2efabafb89cd9d67fe692186bb42",
      altered_result_discriminator: "a7513a45a7d19ef8f01532943da58be4eb998c45473cb4971fced04003e29523",
      reordered_raw: "94e22d55ee51896ace0d79b59563c840b6853b6ef927e70ae65e07da90a609d9",
    },
  },
});

export function canonicalizeAction655bFixture(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalizeAction655bFixture).join(",")}]`;
  const record = value as PlainRecord;
  const keys = Object.keys(record).sort((left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8")));
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalizeAction655bFixture(record[key])}`).join(",")}}`;
}

export function digestAction655bFixture(value: unknown): string {
  return createHash("sha256").update(canonicalizeAction655bFixture(value), "utf8").digest("hex");
}

const privatePolicy = Object.freeze({
  contract_version: "action_655a2_exit_policy_v2",
  enabled: true,
  effective_at: "2026-01-01T00:00:00.000000000Z",
  expires_at: "9999-12-31T23:59:59.999999999Z",
  maximum_future_skew_ns: "0",
  maximum_market_data_age_ns: "5000000000",
  maximum_observation_age_ns: "5000000000",
  minimum_remaining_lots: "1",
  move_stop_to_entry_offset_ticks: "0",
  partial_exit_denominator: "2",
  partial_exit_numerator: "1",
  policy_id: policyId,
  policy_version: 2,
  profit_protection_r_denominator: "1",
  profit_protection_r_numerator: "1",
  reason_priority: ["hard_stop", "invalidation", "session_close", "final_target", "first_target_partial", "profit_protection_stop_move", "hold"],
  session_exit_states: ["closing", "closed"],
});

function frame(contractVersion: string, domain: string, projection: PlainRecord) {
  return { contract_version: contractVersion, domain, projection };
}

function basePosition(): PlainRecord {
  return {
    contract_version: "action_655a6_position_snapshot_v3",
    position_identity: "11111111-1111-4111-8111-111111111111",
    position_version: 3,
    durable_recommendation_uuid: "22222222-2222-4222-8222-222222222222",
    durable_recommendation_version: 7,
    recommendation_identity:
      "rec_decision:v1:recommendation_snapshot:golden%3Adecision%3A001:1783517520000",
    recommendation_normative_digest: "c".repeat(64),
    instrument_identity: "instrument:XSTO:SE0000000001",
    side: "long",
    status: "open",
    opened_at: "2026-08-04T09:00:00.000000000Z",
    snapshot_at: "2026-08-04T11:59:58.000000000Z",
    price_scale: 0,
    tick_size_price_units: "1",
    quantity_scale: 0,
    lot_size_quantity_units: "2",
    total_quantity_units: "20",
    remaining_quantity_units: "10",
    entry_price_units: "100",
    initial_stop_price_units: "90",
    initial_risk_price_units: "10",
    current_stop_price_units: "90",
    invalidation_price_units: "85",
    target_1_price_units: "120",
    target_2_price_units: "130",
    position_snapshot_digest: "",
  };
}

function baseObservation(): PlainRecord {
  return {
    contract_version: "action_655a2_monitor_observation_v2",
    observation_identity: `tm_observation:v2:${"3".repeat(64)}`,
    position_identity: "",
    position_version: 0,
    position_snapshot_digest: "",
    instrument_identity: "",
    observed_at: "2026-08-04T11:59:59.500000000Z",
    market_data_contract_version: "synthetic_market_data_observation_v1",
    market_data_observation_identity: `market_observation:v1:${"5".repeat(64)}`,
    market_data_observed_at: "2026-08-04T11:59:59.000000000Z",
    market_data_digest: "6".repeat(64),
    current_price_units: "105",
    session_state: "open",
    observation_digest: "",
  };
}

function without(record: PlainRecord, key: string): PlainRecord {
  return Object.fromEntries(Object.entries(record).filter(([name]) => name !== key));
}

export type Action655bFixtureOverrides = Readonly<{
  position?: Readonly<PlainRecord>;
  observation?: Readonly<PlainRecord>;
  decision_requested_at?: string;
}>;

export function buildAction655bCanonicalInput(
  overrides: Action655bFixtureOverrides = {},
): string {
  const position: PlainRecord = { ...basePosition(), ...(overrides.position ?? {}) };
  position.position_snapshot_digest = digestAction655bFixture(frame(
    "action_655a6_position_snapshot_digest_v3",
    "trade_management_position_snapshot_digest_v2",
    without(position, "position_snapshot_digest"),
  ));
  const observation: PlainRecord = {
    ...baseObservation(),
    position_identity: position.position_identity,
    position_version: position.position_version,
    position_snapshot_digest: position.position_snapshot_digest,
    instrument_identity: position.instrument_identity,
    ...(overrides.observation ?? {}),
  };
  observation.observation_digest = digestAction655bFixture(frame(
    "action_655a2_monitor_observation_digest_v2",
    "trade_management_monitor_observation_digest_v2",
    without(observation, "observation_digest"),
  ));
  const input: PlainRecord = {
    contract_version: "action_655a6_exit_evaluation_input_v4",
    position_snapshot: position,
    monitor_observation: observation,
    decision_requested_at: overrides.decision_requested_at ?? "2026-08-04T12:00:00.000000000Z",
    evaluation_request_identity: "",
    input_digest: "",
  };
  input.evaluation_request_identity = `tm_exit_request:v4:${digestAction655bFixture(frame(
    "action_655a6_exit_evaluation_request_identity_v4",
    "trade_management_exit_evaluation_request_identity_v3",
    {
      decision_requested_at: input.decision_requested_at,
      observation_digest: observation.observation_digest,
      observation_identity: observation.observation_identity,
      policy_digest: policyDigest,
      policy_id: policyId,
      policy_identity: policyIdentity,
      policy_version: 2,
      position_identity: position.position_identity,
      position_snapshot_digest: position.position_snapshot_digest,
      position_version: position.position_version,
    },
  ))}`;
  input.input_digest = digestAction655bFixture(frame(
    "action_655a6_exit_evaluation_input_digest_v4",
    "trade_management_exit_evaluation_input_digest_v3",
    without(input, "input_digest"),
  ));
  return canonicalizeAction655bFixture(input);
}

export function mutateAction655bCanonicalInput(
  canonicalInput: string,
  mutate: (input: PlainRecord) => void,
): string {
  const parsed = JSON.parse(canonicalInput) as PlainRecord;
  mutate(parsed);
  return canonicalizeAction655bFixture(parsed);
}

export function replaceAction655bRawToken(canonicalInput: string, exactNeedle: string, replacement: string): string {
  const selected = canonicalInput.lastIndexOf(exactNeedle);
  if (selected < 0) throw new Error("fixture token is absent");
  return `${canonicalInput.slice(0, selected)}${replacement}${canonicalInput.slice(selected + exactNeedle.length)}`;
}

export function buildAction655bExactUtf8BudgetInput(targetBytes: 65_535 | 65_536 | 65_537): string {
  const nonNfcValue = "e\u0301".repeat(21_069);
  const baseline = buildAction655bCanonicalInput({
    observation: { market_data_contract_version: nonNfcValue },
  });
  const prefixBytes = targetBytes - Buffer.byteLength(baseline, "utf8");
  if (prefixBytes < 0) throw new Error("fixture_budget_underflow");
  return buildAction655bCanonicalInput({
    observation: { market_data_contract_version: `${"m".repeat(prefixBytes)}${nonNfcValue}` },
  });
}

export const action655bRuleInputs = Object.freeze({
  hard_stop: buildAction655bCanonicalInput({ observation: { current_price_units: "90" } }),
  invalidation: buildAction655bCanonicalInput({
    position: { initial_stop_price_units: "80", initial_risk_price_units: "20", current_stop_price_units: "80" },
    observation: { current_price_units: "85" },
  }),
  session_close: buildAction655bCanonicalInput({ observation: { current_price_units: "105", session_state: "closing" } }),
  final_target: buildAction655bCanonicalInput({ observation: { current_price_units: "130" } }),
  first_target_partial: buildAction655bCanonicalInput({ observation: { current_price_units: "120" } }),
  profit_protection_stop_move: buildAction655bCanonicalInput({ observation: { current_price_units: "110" } }),
  hold: buildAction655bCanonicalInput({ observation: { current_price_units: "105" } }),
});

export const action655bShortInputs = Object.freeze({
  profit_protection: buildAction655bCanonicalInput({
    position: {
      side: "short",
      initial_stop_price_units: "110",
      initial_risk_price_units: "10",
      current_stop_price_units: "110",
      invalidation_price_units: "115",
      target_1_price_units: "80",
      target_2_price_units: "70",
    },
    observation: { current_price_units: "90" },
  }),
  unfavorable_hold: buildAction655bCanonicalInput({
    position: {
      side: "short",
      initial_stop_price_units: "110",
      initial_risk_price_units: "10",
      current_stop_price_units: "110",
      invalidation_price_units: "115",
      target_1_price_units: "80",
      target_2_price_units: "70",
    },
    observation: { current_price_units: "105" },
  }),
});

export const action655bBoundaryInputs = Object.freeze({
  default_off: action655bRuleInputs.hold,
  noneligible_exit_pending: buildAction655bCanonicalInput({ position: { status: "exit_pending" } }),
  noneligible_closed: buildAction655bCanonicalInput({ position: { status: "closed" } }),
  stale_observation: buildAction655bCanonicalInput({
    observation: {
      observed_at: "2026-08-04T11:59:55.000000000Z",
      market_data_observed_at: "2026-08-04T11:59:55.000000000Z",
    },
  }),
  observation_age_maximum_minus_one: buildAction655bCanonicalInput({
    observation: {
      observed_at: "2026-08-04T11:59:55.000000001Z",
      market_data_observed_at: "2026-08-04T11:59:55.000000001Z",
    },
  }),
  observation_age_maximum_plus_one: buildAction655bCanonicalInput({
    observation: {
      observed_at: "2026-08-04T11:59:54.999999999Z",
      market_data_observed_at: "2026-08-04T11:59:54.999999999Z",
    },
  }),
  market_data_age_maximum_minus_one: buildAction655bCanonicalInput({
    observation: { market_data_observed_at: "2026-08-04T11:59:55.000000001Z" },
  }),
  market_data_age_maximum: buildAction655bCanonicalInput({
    observation: { market_data_observed_at: "2026-08-04T11:59:55.000000000Z" },
  }),
  market_data_age_maximum_plus_one: buildAction655bCanonicalInput({
    observation: { market_data_observed_at: "2026-08-04T11:59:54.999999999Z" },
  }),
  future_observation: buildAction655bCanonicalInput({
    observation: { observed_at: "2026-08-04T12:00:00.000000001Z" },
  }),
  future_market_data: buildAction655bCanonicalInput({
    observation: { market_data_observed_at: "2026-08-04T11:59:59.500000001Z" },
  }),
  tick_lot_rounding: buildAction655bCanonicalInput({
    position: { lot_size_quantity_units: "4", total_quantity_units: "20", remaining_quantity_units: "12" },
    observation: { current_price_units: "120" },
  }),
  partial_not_representable: buildAction655bCanonicalInput({
    position: { total_quantity_units: "2", remaining_quantity_units: "2" },
    observation: { current_price_units: "120" },
  }),
  overflow_integer: buildAction655bCanonicalInput({
    position: {
      total_quantity_units: (BigInt(1) << BigInt(127)).toString(),
      remaining_quantity_units: (BigInt(1) << BigInt(127)).toString(),
    },
  }),
  unsafe_version: buildAction655bCanonicalInput({ position: { position_version: Number.MAX_SAFE_INTEGER + 1 } }),
});

const missingNestedBeforeLaterSibling = mutateAction655bCanonicalInput(action655bRuleInputs.hold, (input) => {
  delete (input.position_snapshot as PlainRecord).position_identity;
  delete input.monitor_observation;
});
const wrongNestedVersionBeforeMissingFields = mutateAction655bCanonicalInput(action655bRuleInputs.hold, (input) => {
  const position = input.position_snapshot as PlainRecord;
  position.contract_version = "wrong";
  delete position.position_identity;
  delete input.monitor_observation;
});

export const action655gReviewOracleCases = Object.freeze([
  Object.freeze({
    name: "root_contract_version_before_missing_sibling",
    input: canonicalizeAction655bFixture({ contract_version: "wrong" }),
    expected: Object.freeze({ error_code: "unsupported_contract_version", error_path: "/contract_version" }),
  }),
  Object.freeze({
    name: "nested_required_before_later_root_sibling",
    input: missingNestedBeforeLaterSibling,
    expected: Object.freeze({ error_code: "missing_required_input", error_path: "/position_snapshot/position_identity" }),
  }),
  Object.freeze({
    name: "nested_contract_version_before_nested_and_root_missing",
    input: wrongNestedVersionBeforeMissingFields,
    expected: Object.freeze({ error_code: "unsupported_contract_version", error_path: "/position_snapshot/contract_version" }),
  }),
  Object.freeze({
    name: "position_numeric_domain_before_observation_numeric_domain",
    input: buildAction655bCanonicalInput({ position: { price_scale: 9 }, observation: { position_version: 0 } }),
    expected: Object.freeze({ error_code: "numeric_domain_invalid", error_path: "/position_snapshot/price_scale" }),
  }),
] as const);

export const action655bExpectedSerializedResults = Object.freeze({
  hold: Object.freeze({
    canonical_byte_length: 1690,
    canonical_sha256: "5e1c37f994581a537eae8ffd2c4e0bf1b432e09f057386b2caed19a6813f46e6",
    decision_digest: "cb40c85aa8a31a5049bfd92d3992f9a25bc93bf8b8cae828dd3e0d455c2f35d8",
    result_digest: "e167aeb9b06d6fc35eea128b3b7efb0cac6bb5593de7da6f04b0441ac99f23a4",
  }),
});

export const action655bTargetMatrixInputs = Object.freeze({
  neither: buildAction655bCanonicalInput({ position: { target_1_price_units: null, target_2_price_units: null } }),
  target_1_only: buildAction655bCanonicalInput({ position: { target_2_price_units: null } }),
  both: action655bRuleInputs.hold,
  target_2_only: buildAction655bCanonicalInput({ position: { target_1_price_units: null } }),
});

export const action655bFrozenVectorFrames = Object.freeze({
  policy: {
    contract_version: "action_655a6_exit_policy_digest_frame_v3",
    domain: "trade_management_exit_policy_v2",
    policy_id: policyId,
    policy_identity: policyIdentity,
    projection: privatePolicy,
  },
  provenance: {
    contract_version: "action_655a6_exit_provenance_digest_v1",
    domain: "trade_management_exit_provenance_digest_v1",
    projection: {
      decision_requested_at: "2026-08-04T12:00:00.000000000Z",
      durable_recommendation_uuid: "22222222-2222-4222-8222-222222222222",
      durable_recommendation_version: 7,
      evaluation_request_identity: `tm_exit_request:v4:${"e".repeat(64)}`,
      input_digest: "f".repeat(64),
      instrument_identity: "instrument:XSTO:SE0000000001",
      market_data_contract_version: "synthetic_market_data_observation_v1",
      market_data_digest: "6".repeat(64),
      market_data_observation_identity: `market_observation:v1:${"5".repeat(64)}`,
      market_data_observed_at: "2026-08-04T11:59:59.000000000Z",
      observation_digest: "4".repeat(64),
      observation_identity: `tm_observation:v2:${"3".repeat(64)}`,
      observed_at: "2026-08-04T11:59:59.500000000Z",
      policy_digest: policyDigest,
      policy_id: policyId,
      policy_identity: policyIdentity,
      policy_version: 2,
      position_identity: "11111111-1111-4111-8111-111111111111",
      position_snapshot_digest: "a".repeat(64),
      position_version: 3,
      recommendation_identity:
        "rec_decision:v1:recommendation_snapshot:golden%3Adecision%3A001:1783517520000",
      recommendation_normative_digest: "c".repeat(64),
    },
  },
});
