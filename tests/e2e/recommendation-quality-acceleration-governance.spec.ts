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

  const activeSelection = ledger.split("**Local vertical implementation evidence")[0];
  expect(activeSelection).toContain("## Active Now / Next / Blocked");
  expect(activeSelection).toContain("IF-2b → IF-4 research-source slice");
  expect(activeSelection).toContain("Preserve\nthe eight-member denominator and unobservable candidates");
  expect(activeSelection).toContain("Graduation remains `not_met`");
  expect(ledger).toMatch(/live-policy promotion until complete attributable\s+held-out\/forward evidence exists/);
  expect(ledger).toMatch(
    /paper\/broker expansion until\s+IF-5 demonstrates sustained useful recommendation quality/,
  );
});

test("Oct 2 reconciliation keeps incomplete experiments separate from recommendation learning", () => {
  const roadmap = readDoc("docs/ture-master-roadmap.md");
  const governance = readDoc("docs/roadmap-operating-governance.md");
  expect(roadmap).toContain("Learning-to-improvement loop — 2026-10-02");
  expect(roadmap).toMatch(/Predeclare its baseline, original\s+population, point-in-time information/);
  expect(roadmap).toContain("unresolved members remain missing, not\nlosses");
  expect(roadmap).toContain("Do not repeat an identical test\nwithout a verified correction or a newly frozen question");
  expect(governance).toContain("`evidence_incomplete` disposition");
  expect(governance).toMatch(/Independent CLOSED intelligence work may continue while\s+the missing OPEN evidence is collected/);
  expect(governance).toContain("A provider/data rejection is not an evaluated `no_trade`");
  expect(roadmap).toContain("This reconciliation selects no new experiment, data source, provider budget");
});
