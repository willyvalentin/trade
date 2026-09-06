import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  WHY_MOVE_EVIDENCE_ENVELOPE_VERSION,
  validateWhyMoveEvidenceEnvelope,
} from "../../lib/whymove-evidence-envelope";

const modulePath = join(process.cwd(), "lib/whymove-evidence-envelope.ts");
const docPath = join(process.cwd(), "docs/cat-00.1-whymove-evidence-envelope-contract.md");

function validEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    envelope_id: "whymove:fixture:001",
    decision_snapshot_id: "decision:snapshot:001",
    decision_at: "2026-09-06T05:00:00.000Z",
    evidence: [
      {
        evidence_id: "lead:001",
        source_role: "discovery_lead",
        source_id: "massive_news",
        captured_at: "2026-09-06T04:54:00.000Z",
        effective_at: "2026-09-06T04:53:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: ["primary:001"],
      },
      {
        evidence_id: "primary:001",
        source_role: "primary_evidence",
        source_id: "sec_edgar",
        captured_at: "2026-09-06T04:55:00.000Z",
        effective_at: "2026-09-06T04:52:00.000Z",
        available_at_decision: true,
        direction: "positive",
        primary_evidence_ids: [],
      },
    ],
    ...overrides,
  };
}

test("CAT-00.1 validates paired source-only evidence but never admits it", () => {
  const first = validateWhyMoveEvidenceEnvelope(validEnvelope());
  const second = validateWhyMoveEvidenceEnvelope(validEnvelope());

  expect(first).toEqual(second);
  expect(first).toEqual({
    version: WHY_MOVE_EVIDENCE_ENVELOPE_VERSION,
    disposition: "evidence_validated_not_admitted",
    reasons: [],
    normalized_evidence: [
      expect.objectContaining({
        evidence_id: "lead:001",
        source_role: "discovery_lead",
        source_id: "massive_news",
        primary_evidence_ids: ["primary:001"],
      }),
      expect.objectContaining({
        evidence_id: "primary:001",
        source_role: "primary_evidence",
        source_id: "sec_edgar",
      }),
    ],
  });
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.reasons)).toBe(true);
  expect(Object.isFrozen(first.normalized_evidence)).toBe(true);
  expect(Object.isFrozen(first.normalized_evidence[0].primary_evidence_ids)).toBe(true);
});

test("CAT-00.1 fails closed for discovery-only, unpaired, conflicting and future evidence", () => {
  const discoveryOnly = validEnvelope({ evidence: [validEnvelope().evidence[0]] });
  const unpaired = validEnvelope({
    evidence: [
      { ...validEnvelope().evidence[0], primary_evidence_ids: ["primary:missing"] },
      validEnvelope().evidence[1],
    ],
  });
  const conflicting = validEnvelope({
    evidence: [
      validEnvelope().evidence[0],
      validEnvelope().evidence[1],
      { ...validEnvelope().evidence[1], evidence_id: "primary:002", source_id: "fda", direction: "negative" },
    ],
  });
  const future = validEnvelope({
    evidence: [
      validEnvelope().evidence[0],
      { ...validEnvelope().evidence[1], effective_at: "2026-09-06T05:00:01.000Z" },
    ],
  });

  expect(validateWhyMoveEvidenceEnvelope(discoveryOnly).disposition).toBe(
    "not_admitted_missing_primary_evidence",
  );
  expect(validateWhyMoveEvidenceEnvelope(unpaired).disposition).toBe(
    "not_admitted_unpaired_discovery_lead",
  );
  expect(validateWhyMoveEvidenceEnvelope(conflicting).disposition).toBe(
    "not_admitted_conflicting_primary_evidence",
  );
  expect(validateWhyMoveEvidenceEnvelope(future).disposition).toBe(
    "not_admitted_not_point_in_time_safe",
  );
});

test("CAT-00.1 rejects duplicate IDs, role/source mismatches and hostile accessors without invoking them", () => {
  const duplicate = validEnvelope({
    evidence: [validEnvelope().evidence[0], { ...validEnvelope().evidence[1], evidence_id: "lead:001" }],
  });
  const mismatch = validEnvelope({
    evidence: [{ ...validEnvelope().evidence[0], source_id: "sec_edgar" }, validEnvelope().evidence[1]],
  });
  const unexpected = validEnvelope({
    evidence: [{ ...validEnvelope().evidence[0], extra_field: "forbidden" }, validEnvelope().evidence[1]],
  });
  let getterReads = 0;
  const hostileLead = {
    evidence_id: "lead:hostile",
    source_role: "discovery_lead",
    source_id: "finnhub_company_news",
    captured_at: "2026-09-06T04:54:00.000Z",
    effective_at: "2026-09-06T04:53:00.000Z",
    available_at_decision: true,
    direction: "positive",
    primary_evidence_ids: ["primary:001"],
  } as Record<string, unknown>;
  Object.defineProperty(hostileLead, "direction", {
    enumerable: true,
    get() {
      getterReads += 1;
      return "positive";
    },
  });
  const hostile = validEnvelope({ evidence: [hostileLead, validEnvelope().evidence[1]] });

  expect(validateWhyMoveEvidenceEnvelope(duplicate)).toMatchObject({
    disposition: "invalid_input",
    reasons: ["duplicate_evidence_id"],
  });
  expect(validateWhyMoveEvidenceEnvelope(mismatch)).toMatchObject({
    disposition: "invalid_input",
    reasons: ["source_role_mismatch"],
  });
  expect(validateWhyMoveEvidenceEnvelope(unexpected)).toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
  });
  expect(validateWhyMoveEvidenceEnvelope(hostile)).toMatchObject({
    disposition: "invalid_input",
    reasons: ["accessor_or_non_plain_input"],
  });
  expect(getterReads).toBe(0);
});

test("CAT-00.1 remains an I/O-free contract rather than an external adapter", () => {
  const source = readFileSync(modulePath, "utf8");
  const doc = readFileSync(docPath, "utf8");

  for (const forbidden of [
    "fetch(",
    "process.env",
    "createClient",
    "supabase",
    "openai",
    "netlify",
    "broker",
    "axios",
  ]) {
    expect(source.toLowerCase()).not.toContain(forbidden.toLowerCase());
  }
  expect(doc).toContain("There is no network or provider call");
  expect(doc).toContain("does not reopen any Milestone B gate");
});
