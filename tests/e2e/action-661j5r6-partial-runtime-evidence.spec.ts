import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  parseTerminalFileRebuildV1,
  verifyTerminalFileRebuildV1,
} from "../../lib/action-661j5r6-terminal-boundary-result-protocol-rebuild-v1.mjs";

const root = process.cwd();
const evidenceRoot = join(
  root,
  "docs/recovery/action-661j5r6/runtime-evidence",
);

function fileSha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("duplicate containment A/B is valid historical partial runtime evidence", () => {
  const paths = [
    "duplicate_containment_history-run-a/run-a.duplicate-containment-history-a.duplicate_containment_history.terminal-boundary-rebuild-v1.json",
    "duplicate_containment_history-run-b/run-b.duplicate-containment-history-b.duplicate_containment_history.terminal-boundary-rebuild-v1.json",
  ];
  const files = paths.map((path) =>
    parseTerminalFileRebuildV1(
      readFileSync(join(evidenceRoot, path), "utf8"),
    ),
  );
  for (const file of files) {
    verifyTerminalFileRebuildV1(file);
    expect(file.record.evidence.diagnostic.sqlstate).toBe("P0001");
    expect(file.record.evidence.diagnostic.reason).toBe(
      "Action 661J refuses incident or duplicate containment history",
    );
    expect(file.record.evidence.prestate.combined_digest).toBe(
      file.record.evidence.poststate.combined_digest,
    );
  }
  expect(files.map((file) => file.record.evidence_digest)).toEqual([
    "83e287da559f5a24a10a5ab7194e29411fae08aeb355a25cd932501bc8e139ee",
    "83e287da559f5a24a10a5ab7194e29411fae08aeb355a25cd932501bc8e139ee",
  ]);
  expect(files.map((file) => file.canonical_file_digest)).toEqual([
    "9d58e561d3595261cc65f53ce6e8fe7df360a4041838363fb9f4ea9ff1c34b83",
    "edc1dee7ae7acfb14c8691f8596e2fecd07ff8f41fb42f23c0abb6f79685c82c",
  ]);
});

test("unknown ACL stopped after diagnostic and before result emission", () => {
  const directory = join(evidenceRoot, "unknown_acl_state-run-a");
  const diagnostic = JSON.parse(
    readFileSync(join(directory, "diagnostic-sidecar.json"), "utf8"),
  );
  expect(diagnostic.sqlstate).toBe("P0001");
  expect(diagnostic.reason).toBe(
    "Action 661J refuses unknown or column ACL state for historical_candles",
  );
  expect(diagnostic.diagnostic_digest).toBe(
    "f332e81cbfb55ab038ad8280e31f150a3bc4a252957813c3687ab7360f211202",
  );
  expect(
    existsSync(
      join(
        directory,
        "run-a.unknown-acl-state-a.unknown_acl_state.terminal-boundary-rebuild-v1.json",
      ),
    ),
  ).toBe(false);
  expect(
    existsSync(
      join(
        evidenceRoot,
        "action-661j5r6-sixteen-shard-aggregate.rebuild-v1.json",
      ),
    ),
  ).toBe(false);
});

test("failure report is closed as non-certified and predecessor bytes remain", () => {
  const report = JSON.parse(
    readFileSync(join(evidenceRoot, "runtime-failure-report.json"), "utf8"),
  );
  expect(report.classification).toBe("historical_partial_runtime_evidence");
  expect(report.no_retry_preserved).toBe(true);
  expect(report.not_part_of_runtime_certification).toBe(true);
  expect(report.fixture_progress_after_failure).toBe("20/28");
  expect(fileSha256(
    join(
      root,
      "docs/recovery/action-661j5r5/runtime-evidence/runtime-certification-report.json",
    ),
  )).toBe(
    "e50153f7efc2390e5bf85ae517bf0dc93ae6b571bd51a4b7f0dc1c30b2e1c91e",
  );
});
