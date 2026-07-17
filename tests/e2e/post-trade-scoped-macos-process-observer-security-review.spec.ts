import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFixtureProcessGroupCapability,
  buildFixtureProcessInstanceCapability,
  buildFixtureProcessNode,
  buildFixtureWithChild,
  buildObservationFixtureFingerprint,
  buildObservationRequestFingerprint,
  buildProcessGroupCapabilityFingerprint,
  buildProcessInstanceCapabilityFingerprint,
  buildScopedObserverCompatibilitySummary,
  buildScopedProcessObservationFixture,
  buildScopedProcessObservationRequest,
  observeScopedMacosProcessFixture,
  validateProcessGroupCapability,
  validateProcessInstanceCapability,
  validateScopedProcessObservationFixture,
  validateScopedProcessObservationRequest,
} from "../../lib/post-trade-scoped-macos-process-observer-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-scoped-macos-process-observer-core.ts";
const serverPath = "lib/post-trade-scoped-macos-process-observer.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function rehash(input: Record<string, unknown>, fingerprintKey: string, algorithmKey: string, build: (input: unknown) => string) {
  const core = { ...input };
  delete core[fingerprintKey];
  delete core[algorithmKey];
  return { ...core, [algorithmKey]: "sha256", [fingerprintKey]: build(core) };
}

function requestFixture() {
  const processCapability = buildFixtureProcessInstanceCapability();
  const groupCapability = buildFixtureProcessGroupCapability(processCapability);
  const request = buildScopedProcessObservationRequest(processCapability, groupCapability);
  const fixture = buildScopedProcessObservationFixture(request);
  return { processCapability, groupCapability, request, fixture };
}

function errorsOf(result: { ok: true } | { ok: false; errors: readonly string[] }) {
  return result.ok ? [] : result.errors;
}

test.describe("scoped macOS process observer static security review regressions", () => {
  test("runtime capability provenance rejects structurally identical cloned process capabilities", () => {
    const capability = buildFixtureProcessInstanceCapability();
    const clone = { ...capability };

    expect(validateProcessInstanceCapability(capability).ok).toBe(true);
    expect(errorsOf(validateProcessInstanceCapability(clone))).toContain("capability_untrusted_provenance");
  });

  test("runtime capability provenance rejects structurally identical cloned group capabilities", () => {
    const processCapability = buildFixtureProcessInstanceCapability();
    const groupCapability = buildFixtureProcessGroupCapability(processCapability);
    const clone = { ...groupCapability };

    expect(validateProcessGroupCapability(groupCapability, processCapability).ok).toBe(true);
    expect(errorsOf(validateProcessGroupCapability(clone, processCapability))).toContain("process_group_capability_untrusted_provenance");
  });

  test("cloned capabilities cannot be rehashed into a trusted request", () => {
    const { processCapability, groupCapability } = requestFixture();
    const clonedProcess = { ...processCapability };
    const clonedGroup = { ...groupCapability };
    const forgedRequestCore = {
      ...buildScopedProcessObservationRequest(processCapability, groupCapability),
      processInstanceCapability: clonedProcess,
      processGroupCapability: clonedGroup,
    };
    const forgedRequest = rehash(forgedRequestCore, "requestFingerprint", "requestFingerprintAlgorithm", buildObservationRequestFingerprint);

    const errors = errorsOf(validateScopedProcessObservationRequest(forgedRequest));

    expect(errors).toContain("capability_untrusted_provenance");
    expect(errors).toContain("process_group_capability_untrusted_provenance");
  });

  test("capability types remain noninterchangeable even when fingerprints are present", () => {
    const processCapability = buildFixtureProcessInstanceCapability();
    const groupCapability = buildFixtureProcessGroupCapability(processCapability);

    expect(validateProcessInstanceCapability(groupCapability).ok).toBe(false);
    expect(validateProcessGroupCapability(processCapability, processCapability).ok).toBe(false);
  });

  test("recursive prohibited process keys are rejected inside requests", () => {
    const { request } = requestFixture();
    const forged = rehash(
      { ...request, reviewPayload: { nested: { pgid: "123" } } },
      "requestFingerprint",
      "requestFingerprintAlgorithm",
      buildObservationRequestFingerprint,
    );

    expect(errorsOf(validateScopedProcessObservationRequest(forged))).toContain("prohibited_process_identifier");
  });

  test("recursive prohibited process keys are rejected inside fixtures", () => {
    const { request, fixture } = requestFixture();
    const forged = rehash(
      { ...fixture, reviewPayload: { nested: { pid: "123" } } },
      "fixtureFingerprint",
      "fixtureFingerprintAlgorithm",
      buildObservationFixtureFingerprint,
    );

    expect(errorsOf(validateScopedProcessObservationFixture(forged, request))).toContain("prohibited_process_identifier");
  });

  test("recursive prohibited process keys are rejected inside capability-shaped inputs", () => {
    const capability = buildFixtureProcessInstanceCapability();
    const forged = rehash(
      { ...capability, reviewPayload: { commandLine: "open https://example.invalid" } },
      "capabilityFingerprint",
      "capabilityFingerprintAlgorithm",
      buildProcessInstanceCapabilityFingerprint,
    );

    expect(errorsOf(validateProcessInstanceCapability(forged))).toContain("prohibited_process_identifier");
  });

  test("recursive prohibited process keys are rejected inside group capability-shaped inputs", () => {
    const processCapability = buildFixtureProcessInstanceCapability();
    const groupCapability = buildFixtureProcessGroupCapability(processCapability);
    const forged = rehash(
      { ...groupCapability, reviewPayload: { executablePath: "/Users/example/bin/tool" } },
      "capabilityFingerprint",
      "capabilityFingerprintAlgorithm",
      buildProcessGroupCapabilityFingerprint,
    );

    expect(errorsOf(validateProcessGroupCapability(forged, processCapability))).toContain("prohibited_process_identifier");
  });

  test("direct child relationship missing from child observation set fails closed", () => {
    const { request, fixture } = requestFixture();
    const child = buildFixtureProcessNode({
      nodeRef: "fixture_process_node_child_review_001",
      role: "direct_child",
      semanticKind: "generic_child",
      parentState: undefined,
      parentCapabilityFingerprint: undefined,
    });
    const forged = buildScopedProcessObservationFixture(request, {
      nodes: [fixture.nodes[0], child],
      relationships: [{ parentNodeRef: fixture.parentNodeRef, childNodeRef: child.nodeRef, relation: "direct_child" }],
      childObservationSet: { completeness: "modeled_complete", directChildNodeRefs: [] },
      descendantObservationSet: { completeness: "modeled_complete", descendantNodeRefs: [child.nodeRef] },
    });

    expect(errorsOf(validateScopedProcessObservationFixture(forged, request))).toContain("incomplete_direct_child_state");
  });

  test("complete fixture evidence stays nonauthoritative and cannot prove containment or termination", () => {
    const { request, fixture } = requestFixture();
    const result = observeScopedMacosProcessFixture({ request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });

    expect(result.authority).toBe("fixture_structural_only");
    expect(result.observedLive).toBe(false);
    expect(result.authoritativeLive).toBe(false);
    expect(result.containmentEvidence.provesContainment).toBe(false);
    expect(result.terminationVerificationEvidence.provesTermination).toBe(false);
  });

  test("incomplete empty child observations are ambiguous rather than treated as zero children", () => {
    const { request, fixture } = requestFixture();
    const incomplete = buildScopedProcessObservationFixture(request, {
      childObservationSet: { ...fixture.childObservationSet, completeness: "modeled_incomplete" },
    });

    const result = observeScopedMacosProcessFixture({ request, fixture: incomplete, evaluatedAt: "2026-07-17T10:00:05.000Z" });

    expect(result.structuralDisposition).toBe("ambiguous_fixture");
    expect(result.completeness).toBe("incomplete_direct_child_state");
  });

  test("semantic child classifications fail closed for browser gui opener helper daemon and unknown categories", () => {
    for (const semanticKind of ["browser", "gui_application", "url_opener", "credential_helper", "daemon_candidate", "unknown"] as const) {
      const { request } = requestFixture();
      const result = observeScopedMacosProcessFixture({
        request,
        fixture: buildFixtureWithChild(semanticKind, {}, request),
        evaluatedAt: "2026-07-17T10:00:05.000Z",
      });

      expect(result.structuralDisposition).toBe("blocked_fixture");
      expect(result.authority).toBe("fixture_structural_only");
    }
  });

  test("compatibility is informational and cannot enable live execution or runner readiness", () => {
    const compatibility = buildScopedObserverCompatibilitySummary();

    expect(compatibility.processExecutor).toBe("compatible");
    expect(compatibility.liveDriverDesign).toBe("fixture_observer_structurally_compatible_but_not_live_driver_enabling");
    expect(compatibility.runner).toBe("fixture_observer_structurally_compatible_but_not_live_runner_enabling");
    expect(compatibility.enablesProcessStart).toBe(false);
    expect(compatibility.enablesPreflightRunner).toBe(false);
  });

  test("result fingerprints bind trust-critical fields and change when evidence posture changes", () => {
    const { request, fixture } = requestFixture();
    const compatible = observeScopedMacosProcessFixture({ request, fixture, evaluatedAt: "2026-07-17T10:00:05.000Z" });
    const blocked = observeScopedMacosProcessFixture({
      request,
      fixture: buildFixtureWithChild("browser", {}, request),
      evaluatedAt: "2026-07-17T10:00:05.000Z",
    });

    expect(compatible.resultFingerprint).not.toBe(blocked.resultFingerprint);
    expect(compatible.observerPolicyFingerprint).toBe(blocked.observerPolicyFingerprint);
  });

  test("live-looking fixture authority claims are rejected", () => {
    const { request, fixture } = requestFixture();
    const claimedLive = rehash(
      { ...fixture, observedLive: true, authoritativeLive: true },
      "fixtureFingerprint",
      "fixtureFingerprintAlgorithm",
      buildObservationFixtureFingerprint,
    );

    const errors = errorsOf(validateScopedProcessObservationFixture(claimedLive, request));

    expect(errors).toContain("fixture_claimed_live_observation");
    expect(errors).toContain("fixture_claimed_live_authority");
  });

  test("observer implementation files contain no prohibited process or runtime access imports", () => {
    const implementation = `${source(corePath)}\n${source(serverPath)}`;

    expect(implementation).not.toMatch(/child_process|node:child_process|spawn\(|exec\(|execFile\(|fork\(|proc_pidinfo|libproc|pgrep|pkill|killall|process\.pid|process\.ppid|process\.env|process\.argv|process\.execPath/u);
    expect(implementation).not.toMatch(/\bps\b|\bkill\b|\bsysctl\b|\blsof\b|\blaunchctl\b|\bosascript\b|\bopen\b/u);
    expect(implementation).not.toMatch(/node:fs|from ['"]fs['"]|fs\/promises|fetch\(|setTimeout\(|setInterval\(|Worker\(|node:worker_threads/u);
  });

  test("observer implementation files contain no dangerous positive live-proof semantics", () => {
    const implementation = `${source(corePath)}\n${source(serverPath)}`;

    expect(implementation).not.toMatch(/contained: true|terminated: true|safe: true|authoritativeLive: true|observedLive: true|provesContainment: true|provesTermination: true|enablesProcessStart: true|enablesPreflightRunner: true/u);
  });

  test("server-only observer boundary is not imported by API route or Trade UI", () => {
    expect(source(apiPath)).not.toContain("post-trade-scoped-macos-process-observer");
    expect(source(tradeUiPath)).not.toContain("post-trade-scoped-macos-process-observer");
  });
});
