import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

import { ConfidenceCalibrationProjectionPreview } from "../../components/recommendations/ConfidenceCalibrationProjectionPreview";
import {
  buildConfidenceCalibrationProjectionPreview,
  mapConfidenceCalibrationProjectionPreviewResult,
  type ConfidenceCalibrationProjectionPreviewResult,
} from "../../lib/confidence-calibration-recommendation-advisory-projection-preview";
import { isConfidenceCalibrationProjectionPreviewEnabled } from "../../lib/confidence-calibration-recommendation-advisory-projection-preview-flag";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.md";
const verifierPath =
  "scripts/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification-verify.mjs";
const adapterPath =
  "lib/confidence-calibration-recommendation-advisory-projection-preview.ts";
const componentPath =
  "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx";
const modalPath = "components/recommendations/RecommendationDetailsModal.tsx";
const containerPath =
  "components/recommendations/RecommendationCardContainer.tsx";
const flagPath =
  "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts";
const projectionPath =
  "lib/confidence-calibration-recommendation-advisory-projection.ts";

test.setTimeout(300000);

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function walk(relativePath: string): string[] {
  const start = join(root, relativePath);
  if (!existsSync(start)) return [];

  return readdirSync(start)
    .flatMap((name) => {
      if ([".git", ".next", "node_modules", "coverage", "test-results"].includes(name)) {
        return [];
      }

      const full = join(start, name);
      const stat = statSync(full);
      const childRelative = join(relativePath, name);
      return stat.isDirectory() ? walk(childRelative) : [childRelative];
    })
    .sort();
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function runVerifier() {
  return JSON.parse(
    execFileSync("node", [verifierPath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  );
}

function baseProjection(overrides: Record<string, unknown> = {}) {
  return {
    status: "projection_ready",
    status_label: "Projection ready",
    projection_id: "projection_test",
    advisory_id: "advisory_test",
    recommendation_original_confidence_basis_points: 5000,
    advisory_proposed_delta_basis_points: 125,
    advisory_proposed_confidence_basis_points: 5125,
    warnings: [],
    issues: [],
    recommendation_confidence_unchanged: true,
    non_authoritative: true,
    application_eligible: false,
    applied: false,
    ranking_affected: false,
    scanner_affected: false,
    publication_affected: false,
    execution_affected: false,
    ...overrides,
  } as never;
}

const unavailableStatuses = [
  "projection_insufficient_evidence",
  "blocked_invalid_input",
  "blocked_confidence_mismatch",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_advisory_result",
  "blocked_unsupported_status",
];

const disabledFlagVariants: Array<[string, string | undefined]> = [
  ["undefined", undefined],
  ["empty", ""],
  ["false", "false"],
  ["zero", "0"],
  ["one", "1"],
  ["uppercase true", "TRUE"],
  ["titlecase true", "True"],
  ["leading space true", " true"],
  ["trailing space true", "true "],
  ["newline true", "true\n"],
  ["tab true", "true\t"],
  ["arbitrary text", "enabled"],
];

test.describe("Action 462 independent runtime preview consumer verification", () => {
  test("documents and verifies the independent audit decision", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("**Readiness Decision**");
    expect(doc).toContain("ready_with_conditions");
    expect(doc).toContain("not_authorized_not_required_not_performed");

    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.runtime_preview_status).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(report.deployment_status).toBe(
      "not_authorized_not_required_not_performed",
    );
    expect(report.failed_conditions).toEqual([]);
  });

  test("audits flag semantics, production disablement, and bypass prevention", () => {
    for (const [label, value] of disabledFlagVariants) {
      expect(
        isConfidenceCalibrationProjectionPreviewEnabled(
          { CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: value },
          "test",
        ),
        label,
      ).toBe(false);
    }

    expect(
      isConfidenceCalibrationProjectionPreviewEnabled(
        { CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "true" },
        "test",
      ),
    ).toBe(true);
    expect(
      isConfidenceCalibrationProjectionPreviewEnabled(
        { CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "true" },
        "production",
      ),
    ).toBe(false);

    const environment = {
      CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED: "true",
    };
    const before = { ...environment };
    isConfidenceCalibrationProjectionPreviewEnabled(environment, "test");
    expect(environment).toEqual(before);

    const flagSource = read(flagPath);
    expect(flagSource).not.toMatch(
      /localStorage|sessionStorage|location|URLSearchParams|document\.cookie|window\.|globalThis|profile|database/i,
    );
    expect(flagSource).not.toContain("NEXT_PUBLIC");
  });

  test("audits exact runtime projection call-site ownership", () => {
    const runtimeFiles = [...walk("app"), ...walk("components"), ...walk("lib")]
      .filter((file) => /\.(ts|tsx|js|jsx)$/.test(file))
      .filter((file) => file !== projectionPath);

    const callSites = runtimeFiles.flatMap((file) =>
      Array.from(
        {
          length: countMatches(
            read(file),
            /\bbuildConfidenceCalibrationRecommendationProjection\s*\(/g,
          ),
        },
        () => file,
      ),
    );

    expect(callSites).toEqual([adapterPath]);
    expect(read(componentPath)).not.toContain(
      "buildConfidenceCalibrationRecommendationProjection",
    );
    expect(read("app/trade-app.tsx")).not.toContain(
      "ConfidenceCalibrationProjectionPreview",
    );
  });

  test("audits adapter mappings, unavailable mappings, and unsafe effect flags", () => {
    expect(
      mapConfidenceCalibrationProjectionPreviewResult(
        baseProjection({ status: "projection_ready" }),
      ).status,
    ).toBe("preview_ready");
    expect(
      mapConfidenceCalibrationProjectionPreviewResult(
        baseProjection({
          status: "projection_ready_with_warnings",
          warnings: [{ code: "duplicate_mapper_row_identity" }],
        }),
      ).status,
    ).toBe("preview_ready_with_warnings");
    expect(
      mapConfidenceCalibrationProjectionPreviewResult(
        baseProjection({ status: "projection_no_adjustment" }),
      ).status,
    ).toBe("preview_no_adjustment");

    for (const status of unavailableStatuses) {
      const result = mapConfidenceCalibrationProjectionPreviewResult(
        baseProjection({ status }),
      );
      expect(result.status, status).toBe("preview_unavailable");
      expect(result.proposed_preview_confidence_basis_points).toBeNull();
    }

    expect(
      mapConfidenceCalibrationProjectionPreviewResult(
        baseProjection({ status: "unknown_projection_status" }),
      ).status,
    ).toBe("preview_unavailable");
    expect(
      mapConfidenceCalibrationProjectionPreviewResult(
        baseProjection({ status: undefined }),
      ).status,
    ).toBe("preview_unavailable");

    for (const [flag, unsafeValue] of [
      ["recommendation_confidence_unchanged", false],
      ["non_authoritative", false],
      ["application_eligible", true],
      ["applied", true],
      ["ranking_affected", true],
      ["scanner_affected", true],
      ["publication_affected", true],
      ["execution_affected", true],
      ["application_eligible", "false"],
      ["applied", "false"],
    ] as const) {
      expect(
        mapConfidenceCalibrationProjectionPreviewResult(
          baseProjection({ [flag]: unsafeValue }),
        ).status,
        flag,
      ).toBe("preview_unavailable");
    }
  });

  test("audits disabled short-circuit, malformed input handling, determinism, and non-mutation", () => {
    const explosive = new Proxy(
      {},
      {
        get() {
          throw new Error("projection_input_should_not_be_touched");
        },
      },
    );

    const disabled = buildConfidenceCalibrationProjectionPreview({
      preview_enabled: false,
      recommendation: explosive as never,
      advisory: explosive as never,
      configuration: explosive as never,
    });
    expect(disabled.status).toBe("preview_disabled");

    expect(
      buildConfidenceCalibrationProjectionPreview({
        preview_enabled: true,
        recommendation: null,
        advisory: null,
        configuration: null,
      }).status,
    ).toBe("preview_unavailable");

    expect(
      buildConfidenceCalibrationProjectionPreview({
        preview_enabled: true,
        recommendation: {} as never,
        advisory: {} as never,
        configuration: {} as never,
      }).status,
    ).toBe("preview_unavailable");

    const projection = baseProjection({ status: "projection_ready" });
    const before = JSON.stringify(projection);
    const first = mapConfidenceCalibrationProjectionPreviewResult(projection);
    const second = mapConfidenceCalibrationProjectionPreviewResult(projection);
    expect(first).toEqual(second);
    expect(JSON.stringify(projection)).toBe(before);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.warnings)).toBe(true);
  });

  test("audits UI visibility, copy, controls, warnings, and raw-data exposure", () => {
    const componentSource = read(componentPath);
    const adapterSource = read(adapterPath);
    const modalSource = read(modalPath);
    const containerSource = read(containerPath);

    const disabledPreview: ConfidenceCalibrationProjectionPreviewResult = {
      status: "preview_disabled",
      status_label: "Calibration preview disabled",
      original_recommendation_confidence_basis_points: null,
      proposed_preview_delta_basis_points: null,
      proposed_preview_confidence_basis_points: null,
      warnings: [],
      preview_only: true,
      not_applied: true,
      recommendation_confidence_unchanged: true,
      non_authoritative: true,
      application_eligible: false,
      applied: false,
      ranking_affected: false,
      scanner_affected: false,
      publication_affected: false,
      execution_affected: false,
    };

    expect(ConfidenceCalibrationProjectionPreview({ preview: null })).toBeNull();
    expect(
      ConfidenceCalibrationProjectionPreview({ preview: disabledPreview }),
    ).toBeNull();
    expect(
      ConfidenceCalibrationProjectionPreview({
        preview: {
          ...disabledPreview,
          status: "preview_unavailable",
          status_label: "Calibration preview unavailable",
        },
      }),
    ).not.toBeNull();

    for (const phrase of [
      "CALIBRATION PREVIEW",
      "Preview only — not applied",
      "Original Recommendation confidence remains active",
      "ORIGINAL CONFIDENCE",
      "SUGGESTED PREVIEW ADJUSTMENT",
      "SUGGESTED PREVIEW CONFIDENCE",
      "No adjustment suggested",
      "Calibration preview unavailable",
    ]) {
      expect(componentSource).toContain(phrase);
    }

    expect(componentSource).not.toMatch(
      /\b(Apply|Accept|Use|Save|Confirm|Override|Recalculate|Retry|Trade|Add Trade|Execute|Buy|Sell)\b/,
    );
    expect(componentSource).not.toMatch(
      /Updated confidence|New confidence|Final confidence|Applied confidence|Recommended confidence is now|Use this confidence/,
    );
    expect(componentSource).not.toMatch(
      /advisory_sha256|projection_sha256|snapshot_fingerprint|lineage|JSON\.stringify|process\.env|configuration_version/,
    );
    expect(adapterSource).toContain("Calibration warning");
    expect(modalSource).toContain("<ConfidenceCalibrationProjectionPreview");
    expect(modalSource).toContain("Recommendation Decision Stack");
    expect(containerSource).toContain("confidenceCalibrationProjectionPreview");
  });

  test("audits route, persistence, replay, provider, Supabase, feedback, behavior isolation, and deployment absence", () => {
    const report = runVerifier();
    expect(report.no_effect_results).toMatchObject({
      route_created: false,
      background_job_created: false,
      persistence_created: false,
      replay_created: false,
      provider_access_created: false,
      supabase_access_created: false,
      feedback_created: false,
      confidence_application_created: false,
      ranking_changed: false,
      scanner_changed: false,
      publication_changed: false,
      execution_changed: false,
      add_trade_changed: false,
      risk_changed: false,
      position_sizing_changed: false,
    });
    expect(report.kill_switch_and_rollback).toMatchObject({
      exact_true_to_disabled_hides_preview: true,
      no_persisted_state_to_cleanup: true,
      no_migration_cleanup_required: true,
      remount_restores_hidden_state: true,
    });
    expect(report.deployment_status).toBe(
      "not_authorized_not_required_not_performed",
    );
    expect(report.consumer_inventory_unclassified).toEqual([]);
  });

  test("keeps Actions 459, 460, and 461 healthy under independent verification", () => {
    const report = runVerifier();
    expect(report.checks.action459_healthy).toBe(true);
    expect(report.checks.action460_healthy).toBe(true);
    expect(report.checks.action461_healthy).toBe(true);
    expect(report.source_integrity.implementation_sources_unchanged).toBe(true);
    expect(report.flag_audit.current_environment_enabled).toBe(false);
    expect(report.call_site_audit.runtime_projection_call_site_count).toBe(1);
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toContain(
      "preview_deployment_readiness_gate_remains_outstanding",
    );
  });
});
