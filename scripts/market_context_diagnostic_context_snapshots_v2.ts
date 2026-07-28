import { resolve } from "node:path";

import {
  buildMarketContextDiagnosticContextFixtureResultV2,
} from "../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-fixtures-v2";
import {
  stableMarketContextDiagnosticContextJsonV1,
} from "../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1";

const repositoryRoot = resolve(process.cwd());
const inputOrder =
  process.env.ACTION_667N2A_INPUT_ORDER === "reverse"
    ? "reverse"
    : "canonical";
const result = buildMarketContextDiagnosticContextFixtureResultV2({
  repo_root: repositoryRoot,
  input_order: inputOrder,
});

process.stdout.write(
  `${stableMarketContextDiagnosticContextJsonV1(result)}\n`,
);
