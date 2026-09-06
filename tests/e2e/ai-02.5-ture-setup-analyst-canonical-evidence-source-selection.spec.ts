import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-canonical-evidence-source-selection.ts";
const docPath =
  "docs/ai-02.5-ture-setup-analyst-canonical-evidence-source-selection.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.5-ture-setup-analyst-canonical-evidence-source-selection.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedSelection = {
  selectTureSetupAnalystCanonicalEvidenceSource(input: unknown): {
    readonly selection_status: string;
    readonly selected_source: {
      readonly environment: string;
      readonly relation: string;
      readonly sample_type: string;
    };
    readonly required_evidence: readonly string[];
    readonly canonical_evidence_disposition: string;
    readonly next_gate: string;
    readonly authority: {
      readonly may_access_staging: boolean;
      readonly may_persist_source_evidence: boolean;
      readonly may_form_offline_dataset: boolean;
      readonly may_run_offline_evaluation: boolean;
      readonly may_bind_runtime: boolean;
    };
  };
};

function loadSelection(): LoadedSelection {
  const transpiled = ts.transpileModule(source(sourcePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: sourcePath,
  }).outputText;
  const sandbox = {
    Object,
    Reflect,
    TypeError,
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: sourcePath });
  return sandbox.exports as LoadedSelection;
}

function validInput(overrides: Record<string, unknown> = {}) {
  return Object.freeze({
    proposal: Object.freeze({
      environment: "staging",
      relation: "public.canonical_evaluation_decisions",
      sample_type: "historical_synthetic",
      source_kind: "append_only_canonical_decision",
      canonical_identity: "required",
      immutable_lineage: "required",
      versioned_reproducibility: "required",
      complete_primary_outcome: "required",
      persistence_envelope: "required",
      writer_binding: "not_admitted",
      runtime_binding: "not_admitted",
      evaluation_binding: "not_admitted",
      ...overrides,
    }),
  });
}

test("AI-02.5 selects only the bounded future canonical evidence-source contract", () => {
  const selection = loadSelection();

  const result = selection.selectTureSetupAnalystCanonicalEvidenceSource(
    validInput(),
  );

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.selected_source)).toBe(true);
  expect(Object.isFrozen(result.required_evidence)).toBe(true);
  expect(result).toMatchObject({
    selection_status: "source_contract_selected",
    selected_source: {
      environment: "staging",
      relation: "public.canonical_evaluation_decisions",
      sample_type: "historical_synthetic",
    },
    required_evidence: [
      "canonical_identity",
      "immutable_lineage",
      "versioned_reproducibility",
      "complete_primary_outcome",
      "persistence_envelope",
    ],
    canonical_evidence_disposition: "not_admitted",
    next_gate: "separately_authorized_staging_append_only_receipt_proof",
    authority: {
      may_access_staging: false,
      may_persist_source_evidence: false,
      may_form_offline_dataset: false,
      may_run_offline_evaluation: false,
      may_bind_runtime: false,
    },
  });
});

test("AI-02.5 fails closed for widened, live, legacy and asserted-admitted proposals", () => {
  const selection = loadSelection();

  for (const invalid of [
    validInput({ environment: "production" }),
    validInput({ relation: "private.ai_02_legacy_outcome_evidence" }),
    validInput({ sample_type: "visible" }),
    validInput({ writer_binding: "admitted" }),
    validInput({ runtime_binding: "admitted" }),
    validInput({ evaluation_binding: "admitted" }),
    validInput({ unexpected: "widened" }),
  ]) {
    expect(() =>
      selection.selectTureSetupAnalystCanonicalEvidenceSource(invalid),
    ).toThrow(TypeError);
  }
});

test("AI-02.5 rejects mutable, accessor-backed and faulting proxy proposals", () => {
  const selection = loadSelection();
  const mutable = { ...validInput().proposal };
  const accessorProposal = Object.freeze(
    Object.defineProperty({}, "environment", {
      enumerable: true,
      get() {
        throw new Error("must not read accessor proposal");
      },
    }),
  );
  const faultingProxy = new Proxy(
    {},
    {
      isExtensible() {
        throw new Error("must not inspect proxy input");
      },
    },
  );

  expect(() =>
    selection.selectTureSetupAnalystCanonicalEvidenceSource(
      Object.freeze({ proposal: mutable }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    selection.selectTureSetupAnalystCanonicalEvidenceSource(
      Object.freeze({ proposal: accessorProposal }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    selection.selectTureSetupAnalystCanonicalEvidenceSource(faultingProxy),
  ).toThrow(TypeError);
});

test("AI-02.5 remains server-only, source-only and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/does not make legacy history canonical/i);
  expect(doc).toMatch(/not_admitted/);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
