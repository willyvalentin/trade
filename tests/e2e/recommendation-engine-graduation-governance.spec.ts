import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("recommendation intelligence remains the product gate before autonomy", () => {
  const roadmap = source("docs/ture-master-roadmap.md");
  const governance = source("docs/roadmap-operating-governance.md");
  const ledger = source("docs/ture-current-state-ledger.md");

  expect(roadmap).toContain("Recommendation-engine graduation gate");
  expect(roadmap).toContain("eligible discovery population");
  expect(roadmap).toContain("held-out and walk-forward windows");
  expect(roadmap).toContain("reversible IF-5 promotion");
  expect(roadmap).toContain("post-promotion monitoring");
  expect(roadmap).toContain("A daily\n   candidate is not required");
  expect(roadmap).toContain("must not become a parallel product track");

  expect(governance).toContain(
    "Recommendation-engine graduation gate enforcement",
  );
  expect(governance).toContain(
    "`not_met`, `evidence_incomplete` or\n`passed`",
  );
  expect(governance).toContain(
    "Changing the graduation criteria to admit the observed\nresult is prohibited",
  );
  expect(governance).toContain("It may not add or activate broker authority");

  expect(ledger).toContain(
    "Recommendation-engine graduation gate — `not_met`",
  );
  expect(ledger).toContain("predeclared\nforward cohort has not yet completed");
  expect(ledger).toContain("no IF-5 promotion decision");
  expect(ledger).toContain(
    "new autonomous\npaper, broker or execution product expansion stays blocked",
  );
  expect(ledger).toContain("`no_trade` remains a valid decision");
});
