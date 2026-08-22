const provenance = "{\"contract_version\":\"action_666dm_market_observation_provenance_v1\",\"instrument_identity\":\"instrument:XSTO:SE0000000001\",\"market_data_contract_version\":\"action_666dm_market_observation_provenance_v1\",\"market_data_digest\":\"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\",\"market_data_observation_identity\":\"market_observation:v1:608e88b3f88251b68a42ef273f52c841adc4444dbd0638e6bb995de3e3c1f370\",\"market_data_observed_at\":\"2026-08-22T12:00:00.123456789Z\",\"provenance_digest\":\"e94a92044fc8e445e1316a4d505ec9ac673e2c4673ef485417a9f298d753e181\",\"side_effects_performed\":false,\"source_identity\":\"market_source:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"}";

function canonicalInput(
  currentPriceUnits: string,
  decisionRequestedAt = "2026-08-22T12:00:04.999999999Z",
  monitorObservedAt = "2026-08-22T12:00:04.999999999Z",
): string {
  return `{"contract_version":"action_666do_market_price_attestation_input_v1","current_price_units":${JSON.stringify(currentPriceUnits)},"decision_requested_at":${JSON.stringify(decisionRequestedAt)},"market_observation_provenance":${JSON.stringify(provenance)},"monitor_observed_at":${JSON.stringify(monitorObservedAt)}}`;
}

export const action666doCanonicalInput = canonicalInput("1234500");

export const action666doAdversarialInputs = Object.freeze({
  reordered: `{"current_price_units":"1234500","contract_version":"action_666do_market_price_attestation_input_v1","decision_requested_at":"2026-08-22T12:00:04.999999999Z","market_observation_provenance":${JSON.stringify(provenance)},"monitor_observed_at":"2026-08-22T12:00:04.999999999Z"}`,
  zeroPrice: canonicalInput("0"),
  leadingZeroPrice: canonicalInput("01234500"),
  oversizedPrice: canonicalInput("170141183460469231731687303715884105728"),
  staleMarketData: canonicalInput(
    "1234500",
    "2026-08-22T12:00:05.123456789Z",
    "2026-08-22T12:00:04.999999999Z",
  ),
});
