const provenance = "{\"contract_version\":\"action_666dm_market_observation_provenance_v1\",\"instrument_identity\":\"instrument:XSTO:SE0000000001\",\"market_data_contract_version\":\"action_666dm_market_observation_provenance_v1\",\"market_data_digest\":\"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\",\"market_data_observation_identity\":\"market_observation:v1:608e88b3f88251b68a42ef273f52c841adc4444dbd0638e6bb995de3e3c1f370\",\"market_data_observed_at\":\"2026-08-22T12:00:00.123456789Z\",\"provenance_digest\":\"e94a92044fc8e445e1316a4d505ec9ac673e2c4673ef485417a9f298d753e181\",\"side_effects_performed\":false,\"source_identity\":\"market_source:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"}";

export const action666dnCanonicalInput = `{\"contract_version\":\"action_666dn_market_observation_readback_input_v1\",\"decision_requested_at\":\"2026-08-22T12:00:04.999999999Z\",\"market_observation_provenance\":${JSON.stringify(provenance)},\"monitor_observed_at\":\"2026-08-22T12:00:04.999999999Z\"}`;

function canonicalInput(
  decisionRequestedAt: string,
  monitorObservedAt: string,
  marketObservationProvenance = provenance,
): string {
  return `{\"contract_version\":\"action_666dn_market_observation_readback_input_v1\",\"decision_requested_at\":${JSON.stringify(decisionRequestedAt)},\"market_observation_provenance\":${JSON.stringify(marketObservationProvenance)},\"monitor_observed_at\":${JSON.stringify(monitorObservedAt)}}`;
}

export const action666dnAdversarialInputs = Object.freeze({
  reordered: `{\"monitor_observed_at\":\"2026-08-22T12:00:04.999999999Z\",\"contract_version\":\"action_666dn_market_observation_readback_input_v1\",\"decision_requested_at\":\"2026-08-22T12:00:04.999999999Z\",\"market_observation_provenance\":${JSON.stringify(provenance)}}`,
  invalidProvenance: canonicalInput(
    "2026-08-22T12:00:04.999999999Z",
    "2026-08-22T12:00:04.999999999Z",
    "{}",
  ),
  invalidObservedAt: canonicalInput(
    "2026-08-22T12:00:04.999999999+00:00",
    "2026-08-22T12:00:04.999999999Z",
  ),
  futureMarketData: canonicalInput(
    "2026-08-22T12:00:00.123456789Z",
    "2026-08-22T12:00:00.123456788Z",
  ),
  futureObservation: canonicalInput(
    "2026-08-22T12:00:04.999999999Z",
    "2026-08-22T12:00:05.000000000Z",
  ),
  staleObservation: canonicalInput(
    "2026-08-22T12:00:05.123456789Z",
    "2026-08-22T12:00:00.123456789Z",
  ),
  staleMarketData: canonicalInput(
    "2026-08-22T12:00:05.123456789Z",
    "2026-08-22T12:00:04.999999999Z",
  ),
});
