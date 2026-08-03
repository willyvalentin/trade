import { resolve } from "node:path";

import {
  buildMarketContextDiagnosticContextFixtureResultV1,
} from "../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-fixtures-v1";
import {
  stableMarketContextDiagnosticContextJsonV1,
} from "../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1";

function option(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const inputOrder =
  option("--input-order") === "reverse" ? "reverse" : "canonical";
const result = buildMarketContextDiagnosticContextFixtureResultV1({
  repo_root: resolve(option("--repo") ?? process.cwd()),
  replay_root: option("--replay-root"),
  input_order: inputOrder,
});

const receipt = {
  contract_version: result.contract_version,
  adapter_version: result.adapter_version,
  decision_count: result.decision_count,
  taxonomy_counts: result.taxonomy_counts,
  external_roots: result.external_roots,
  calendar: result.calendar,
  external_trust_root_digest: result.external_trust_root_digest,
  source_inventory_digest: result.source_inventory_digest,
  canonical_result_digest: result.canonical_result_digest,
};

process.stdout.write(`${stableMarketContextDiagnosticContextJsonV1(receipt)}\n`);
