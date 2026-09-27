import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const readDoc = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

test("master roadmap makes one complete quality hypothesis the active order", () => {
  const roadmap = readDoc("docs/ture-master-roadmap.md");

  expect(roadmap).toContain("#### Recommendation-quality acceleration rule");
  expect(roadmap).toContain(
    "must close the next missing link in one frozen recommendation-quality hypothesis",
  );
  expect(roadmap).toMatch(/decide `continue`,\s+`narrow` or `reject`/);
  expect(roadmap).toMatch(
    /OPEN hours prioritize the exact forward\s+observations the active hypothesis needs/,
  );
});

test("operating governance rejects unrelated readiness ahead of quality evidence", () => {
  const governance = readDoc("docs/roadmap-operating-governance.md");

  expect(governance).toContain("### Intelligence work-selection gate");
  expect(governance).toMatch(
    /point-in-time input → same-population challenger → immutable decision →\s+canonical outcome/,
  );
  expect(governance).toMatch(
    /A negative result is\s+progress because it prevents an unsupported policy/,
  );
  expect(governance).toMatch(
    /do not spend OPEN capacity on unrelated infrastructure without a reproduced\s+blocker/,
  );
});

test("current-state ledger names the active quality chain and its promotion gate", () => {
  const ledger = readDoc("docs/ture-current-state-ledger.md");

  expect(ledger).toContain("### Now / Next / Blocked selection — 2026-09-27");
  expect(ledger).toContain("finish the clock-neutral IF-3b hypothesis end to end");
  expect(ledger).toMatch(/live-policy promotion until complete attributable\s+held-out\/forward evidence exists/);
  expect(ledger).toMatch(
    /paper\/broker expansion until\s+IF-5 demonstrates sustained useful recommendation quality/,
  );
});
