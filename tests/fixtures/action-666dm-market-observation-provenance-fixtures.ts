export const action666dmCanonicalInput = "{\"contract_version\":\"action_666dm_market_observation_input_v1\",\"instrument_identity\":\"instrument:XSTO:SE0000000001\",\"source_identity\":\"market_source:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"source_observed_at\":\"2026-08-22T12:00:00.123456789Z\",\"source_payload_digest\":\"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\"}";

export const action666dmExpectedProvenance = Object.freeze({
  contract_version: "action_666dm_market_observation_provenance_v1",
  instrument_identity: "instrument:XSTO:SE0000000001",
  market_data_contract_version: "action_666dm_market_observation_provenance_v1",
  market_data_digest: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  market_data_observation_identity: "market_observation:v1:608e88b3f88251b68a42ef273f52c841adc4444dbd0638e6bb995de3e3c1f370",
  market_data_observed_at: "2026-08-22T12:00:00.123456789Z",
  provenance_digest: "e94a92044fc8e445e1316a4d505ec9ac673e2c4673ef485417a9f298d753e181",
  side_effects_performed: false,
  source_identity: "market_source:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});

export const action666dmAdversarialCanonicalInputs = Object.freeze({
  reordered: "{\"source_payload_digest\":\"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\",\"contract_version\":\"action_666dm_market_observation_input_v1\",\"instrument_identity\":\"instrument:XSTO:SE0000000001\",\"source_identity\":\"market_source:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"source_observed_at\":\"2026-08-22T12:00:00.123456789Z\"}",
  sourceIdentity: "{\"contract_version\":\"action_666dm_market_observation_input_v1\",\"instrument_identity\":\"instrument:XSTO:SE0000000001\",\"source_identity\":\"market_source:v1:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\",\"source_observed_at\":\"2026-08-22T12:00:00.123456789Z\",\"source_payload_digest\":\"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\"}",
  observedAt: "{\"contract_version\":\"action_666dm_market_observation_input_v1\",\"instrument_identity\":\"instrument:XSTO:SE0000000001\",\"source_identity\":\"market_source:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"source_observed_at\":\"2026-08-22T12:00:00.123456789+00:00\",\"source_payload_digest\":\"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\"}",
  yearZero: "{\"contract_version\":\"action_666dm_market_observation_input_v1\",\"instrument_identity\":\"instrument:XSTO:SE0000000001\",\"source_identity\":\"market_source:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"source_observed_at\":\"0000-01-01T00:00:00.000000000Z\",\"source_payload_digest\":\"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\"}",
  instrumentIdentity: "{\"contract_version\":\"action_666dm_market_observation_input_v1\",\"instrument_identity\":\"not-an-instrument\",\"source_identity\":\"market_source:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"source_observed_at\":\"2026-08-22T12:00:00.123456789Z\",\"source_payload_digest\":\"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\"}",
});
