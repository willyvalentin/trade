import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function manualObservationSlice(source: string) {
  const start = source.indexOf("function buildOrderFormPreflightCheck");
  const end = source.indexOf("function liveFillOnlyRunnerEnabled");

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

test.describe("Avanza localhost bridge manual observation preflight", () => {
  test("documents the explicit manual observation runbook", () => {
    const doc = readRepoFile(
      "docs/first-real-avanza-fill-only-poc-manual-browser-observation-mode.md",
    );

    expect(doc).toContain(
      "first_real_avanza_fill_only_poc_manual_browser_observation_mode_added",
    );
    expect(doc).toContain("GET /preflight/avanza-order-form");
    expect(doc).toContain(
      "AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE=cdp_readonly",
    );
    expect(doc).toContain("curl -sS http://127.0.0.1:47831/health");
    expect(doc).toContain("curl -sS http://127.0.0.1:47831/self-check");
    expect(doc).toContain(
      "curl -sS http://127.0.0.1:47831/preflight/avanza-order-form",
    );
    expect(doc).toContain(
      "curl -sS http://127.0.0.1:47831/preflight/avanza-order-form/field-discovery",
    );
    expect(doc).toContain("zero `quantity` candidates");
    expect(doc).toContain("visibility/bounding-box presence without coordinates");
    expect(doc).toContain("no field fill");
    expect(doc).toContain("no click");
    expect(doc).toContain("no order placement");
    expect(doc).toContain("no cookie read");
    expect(doc).toContain("no localStorage read");
    expect(doc).toContain("no sessionStorage read");
  });

  test("keeps the bridge endpoint GET-only and observation-only", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");
    const slice = manualObservationSlice(source);

    expect(source).toContain('request.method === "GET"');
    expect(source).toContain('url.pathname === "/preflight/avanza-order-form"');
    expect(source).not.toContain(
      'request.method === "POST" && url.pathname === "/preflight/avanza-order-form"',
    );

    expect(slice).toContain("manualObservationOnly: true");
    expect(slice).toContain("noFieldFill: true");
    expect(slice).toContain("noAmountFill: true");
    expect(slice).toContain("noPriceFill: true");
    expect(slice).toContain("noClick: true");
    expect(slice).toContain("noReviewClick: true");
    expect(slice).toContain("noFinalConfirmClick: true");
    expect(slice).toContain("noBrokerSubmission: true");
    expect(slice).toContain("noCredentialsHandling: true");
    expect(slice).toContain("noCookiesRead: true");
    expect(slice).toContain("noLocalStorageRead: true");
    expect(slice).toContain("noSessionStorageRead: true");
    expect(slice).not.toMatch(/fillAmountField|fillPriceField/);
    expect(slice).not.toMatch(/\.click\s*\(|\.fill\s*\(|Bekräfta.*click/i);
    expect(slice).not.toMatch(
      /localStorage\s*\.|sessionStorage\s*\.|document\.cookie/i,
    );
  });

  test("adds field discovery as GET-only observation with sanitized metadata", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");
    const slice = manualObservationSlice(source);

    expect(source).toContain(
      'url.pathname === "/preflight/avanza-order-form/field-discovery"',
    );
    expect(source).not.toContain(
      'request.method === "POST" && url.pathname === "/preflight/avanza-order-form/field-discovery"',
    );
    expect(slice).toContain("function createOrderFormFieldDiscoveryResponse");
    expect(slice).toContain("function buildOrderFormFieldDiscoveryExpression");
    expect(slice).toContain("function discoverAvanzaOrderFormFieldsWithCdp");
    expect(slice).toContain("fieldDiscoveryOnly: true");
    expect(slice).toContain("noFieldFill: true");
    expect(slice).toContain("noQuantityFill: true");
    expect(slice).toContain("noClick: true");
    expect(slice).toContain("noReviewClick: true");
    expect(slice).toContain("noFinalConfirmClick: true");
    expect(slice).toContain("noBrokerSubmission: true");
    expect(slice).toContain("noCredentialsHandling: true");
    expect(slice).toContain("noCookiesRead: true");
    expect(slice).toContain("noLocalStorageRead: true");
    expect(slice).toContain("noSessionStorageRead: true");
    expect(slice).toContain("noRawPageTextReturned: true");
    expect(slice).toContain("noRawDomReturned: true");
    expect(slice).toContain("quantity candidates is diagnostic");
    expect(slice).toContain("field_group_guess");
    expect(slice).toContain("visible_label_nearby");
    expect(slice).toContain("visible_bounding_box_present");
    expect(slice).toContain("inside_buy_side_order_form_region");
    expect(slice).not.toMatch(/\.click\s*\(|\.fill\s*\(|submit\s*\(/i);
    expect(slice).not.toMatch(
      /localStorage\s*\.|sessionStorage\s*\.|document\.cookie/i,
    );
  });

  test("adds bridge-hosted in-process quantity trigger behind explicit gates", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");

    expect(source).toContain(
      "AVANZA_LOCALHOST_BRIDGE_ENABLE_IN_PROCESS_TRIGGER",
    );
    expect(source).toContain("function inProcessLiveFillOnlyTriggerEnabled");
    expect(source).toContain("ENABLE_IN_PROCESS_TRIGGER_VALUE");
    expect(source).toContain(
      'url.pathname ===\n      "/live-fill-only-runner/run-approved-quantity-based-fill-only-trigger"',
    );
    expect(source).toContain("exact_trigger_phrase:missing_or_mismatched");
    expect(source).toContain("input_strategy:not_quantity_based");
    expect(source).toContain("in_process_trigger_env:not_enabled");
    expect(source).toContain("FINAL_LIVE_EXECUTE_ATTEMPT_TRIGGER_PHRASE");
    expect(source).toContain("quantity:mismatch");
    expect(source).toContain("price:mismatch");
    expect(source).toContain("stop_before:not_granska_kop");
  });

  test("in-process quantity trigger reuses only the approved fill-only sequence", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");
    const start = source.indexOf(
      "async function runInProcessApprovedQuantityBasedFillOnlyTrigger",
    );
    const end = source.indexOf(
      "async function buildLiveFillOnlyRunnerEndpointResponse",
    );
    const slice = source.slice(start, end);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(slice).toContain('const approvedInputStrategy = "quantity_based"');
    expect(slice).toContain(
      "await verifyLiveFillOnlyVisibleState(approvedInputStrategy)",
    );
    expect(slice).toContain('"fillQuantityField"');
    expect(slice).toContain('"quantity"');
    expect(slice).toContain("APPROVED_LIVE_FILL_ONLY_VALUES.quantity");
    expect(slice).toContain("APPROVED_LIVE_FILL_ONLY_VALUES.quantityText");
    expect(slice).toContain("{ approvedInputStrategy }");
    expect(slice).toContain(
      "fillQuantityCallSite: LIVE_FILL_ONLY_IN_PROCESS_QUANTITY_CALL_SITE",
    );
    expect(slice).toContain('"fillPriceField"');
    expect(slice).toContain('"price"');
    expect(slice).toContain("APPROVED_LIVE_FILL_ONLY_VALUES.priceUsd");
    expect(slice).toContain("APPROVED_LIVE_FILL_ONLY_VALUES.priceUsdText");
    expect(slice).toContain(
      "await readLiveFillOnlyTotalAmount(approvedInputStrategy)",
    );
    expect(slice).toContain("await captureLiveFillOnlyEvidence");
    expect(slice).toContain(
      "await stopLiveFillOnlyBeforeReview(approvedInputStrategy)",
    );
    expect(slice).not.toContain("fillAmountField");
    expect(slice).not.toMatch(
      /clickGranskaKop|openReviewModal|clickBekrafta|clickConfirm|submitOrder|placeOrder|confirmOrder/,
    );
  });

  test("in-process quantity trigger writes sanitized proof files for success and abort", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");

    expect(source).toContain(
      "QUANTITY_BASED_LIVE_FILL_ONLY_PROOF_FILE_PATH",
    );
    expect(source).toContain("writeInProcessLiveFillOnlyProofFile");
    expect(source).toContain("mkdirSync(dirname(resolvedProofFilePath)");
    expect(source).toContain("writeFileSync(");
    expect(source).toContain("quantity_candidate_diagnostics_if_failed");
    expect(source).toContain("quantity_selected_selector");
    expect(source).toContain("quantity_selected_id");
    expect(source).toContain("price_selected_selector");
    expect(source).toContain("price_selected_id");
    expect(source).toContain("no_order_placement: true");
    expect(source).toContain("proofSensitiveKeyPattern");
    expect(source).toContain("[omitted-sensitive-or-raw-observation]");
    expect(source).toContain("no_raw_page_text: true");
    expect(source).toContain("no_credentials_cookies_storage_or_session_data: true");
  });

  test("in-process quantity trigger uses quantity strategy and stable inputVolume targeting", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");
    const start = source.indexOf("function buildLiveFillOnlySetFieldExpression");
    const end = source.indexOf("async function getSingleAvanzaCdpTarget");
    const setFieldSlice = source.slice(start, end);
    const resolverStart = source.indexOf(
      "function liveFillOnlyStableFieldResolverSource",
    );
    const resolverEnd = source.indexOf(
      "function buildLiveFillOnlyStableFieldProbeExpression",
    );
    const resolverSlice = source.slice(resolverStart, resolverEnd);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(resolverStart).toBeGreaterThanOrEqual(0);
    expect(resolverEnd).toBeGreaterThan(resolverStart);
    expect(source).toContain("function liveFillOnlyApprovedInputStrategy");
    expect(source).toContain("function liveFillOnlyStableFieldResolverSource");
    expect(setFieldSlice).toContain("return `(async () => {");
    expect(source).toContain(
      'const LIVE_FILL_ONLY_FILL_QUANTITY_IMPLEMENTATION_ID =\n  "stable_resolver_v1"',
    );
    expect(source).toContain(
      'const LIVE_FILL_ONLY_IN_PROCESS_QUANTITY_CALL_SITE =\n  "in_process_quantity_based_trigger"',
    );
    expect(source).toContain('action === "fillQuantityField" ? "quantity_based"');
    expect(source).toContain(
      "liveFillOnlyFieldReadbackMetadata(\n    after,\n    approvedInputStrategy",
    );
    expect(setFieldSlice).toContain('quantity: "input#inputVolume"');
    expect(setFieldSlice).toContain("resolveStableOrderField(field)");
    expect(setFieldSlice).toContain("let stableResolved;");
    expect(setFieldSlice).toContain(
      "stableResolved = resolveStableOrderField(field);",
    );
    expect(setFieldSlice).toContain('reason: "stable_resolver_exception"');
    expect(setFieldSlice).toContain("resolver_not_invoked: false");
    expect(setFieldSlice).toContain("stableResolved.element");
    expect(setFieldSlice).toContain(
      "field === \"quantity\" && stableIdAccepted",
    );
    expect(setFieldSlice).toContain("? stableIdCandidate");
    expect(setFieldSlice).toContain("? stableResolved.element");
    expect(resolverSlice).toContain('document.getElementById(definition.id)');
    expect(resolverSlice).toContain('document.querySelector(definition.selector)');
    expect(resolverSlice).toContain("byId ?? bySelector");
    expect(resolverSlice).toContain('id: "inputVolume"');
    expect(resolverSlice).toContain('selector: "input#inputVolume"');
    expect(resolverSlice).toContain('expectedInputmode: "numeric"');
    expect(setFieldSlice).toContain("stable_id_accepted: stableIdAccepted");
    expect(setFieldSlice).toContain(
      "stable_field_resolver_version: stableResolved.metadata.stable_field_resolver_version",
    );
    expect(setFieldSlice).toContain(
      "fill_used_shared_stable_resolver: stableResolved.metadata.fill_used_shared_stable_resolver",
    );
    expect(setFieldSlice).toContain(
      "resolver_not_invoked: false",
    );
    expect(setFieldSlice).toContain(
      'shared_resolver_function_name: "resolveStableOrderField"',
    );
    expect(setFieldSlice).toContain("shared_resolver_invoked: true");
    expect(setFieldSlice).toContain(
      "inside_buy_side_order_form_region_required: false",
    );
    expect(resolverSlice).toContain(
      'return "stable_id_not_found"',
    );
    expect(resolverSlice).toContain(
      'return "stable_id_found_but_not_input"',
    );
    expect(resolverSlice).toContain(
      'return "stable_id_found_but_hidden"',
    );
    expect(resolverSlice).toContain(
      'return "stable_id_found_but_disabled"',
    );
    expect(resolverSlice).toContain(
      'return "stable_id_found_but_readonly"',
    );
    expect(resolverSlice).toContain(
      'return "stable_id_found_but_wrong_inputmode"',
    );
    expect(resolverSlice).toContain(
      'return "stable_id_found_but_rejected_by_scope"',
    );
    expect(setFieldSlice).toContain(
      '"stable_id_found_and_accepted_but_set_failed"',
    );
    expect(setFieldSlice).toContain(
      'meta.selected_field_group === "quantity"',
    );
    expect(source).toContain("const sharedStableResolverUsed =");
    expect(source).toContain("const pageSideResolverReported =");
    expect(source).toContain("result.fill_used_shared_stable_resolver === true");
    expect(source).toContain(
      'typeof result.stable_field_resolver_version === "string"',
    );
    expect(source).toContain('const blocker = "shared_stable_resolver_not_used"');
    expect(source).toContain("...fillQuantityDiagnostics");
    expect(source).toContain(
      "fill_quantity_implementation_id:\n            LIVE_FILL_ONLY_FILL_QUANTITY_IMPLEMENTATION_ID",
    );
    expect(source).toContain("fill_quantity_call_site: fillQuantityCallSite");
    expect(source).toContain(
      "shared_resolver_function_name:\n            result.shared_resolver_function_name ?? \"resolveStableOrderField\"",
    );
    expect(source).toContain(
      "pageSideResolverReported ? result.shared_resolver_invoked === true : null",
    );
    expect(source).toContain(
      "result.resolver_not_invoked === true ? true : null",
    );
    expect(source).toContain(
      "Aborted because fillQuantityField did not report the shared stable field resolver metadata.",
    );
  });

  test("hardens readTotalAmount with total discovery retry and strict cap gating", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");
    const totalExpressionStart = source.indexOf(
      "function buildLiveFillOnlyTotalDiscoveryExpression",
    );
    const totalExpressionEnd = source.indexOf(
      "function buildLiveFillOnlySetFieldExpression",
    );
    const totalExpressionSlice = source.slice(
      totalExpressionStart,
      totalExpressionEnd,
    );
    const totalReadStart = source.indexOf(
      "async function readLiveFillOnlyTotalAmount",
    );
    const totalReadEnd = source.indexOf(
      "async function captureLiveFillOnlyEvidence",
    );
    const totalReadSlice = source.slice(totalReadStart, totalReadEnd);

    expect(totalExpressionStart).toBeGreaterThanOrEqual(0);
    expect(totalExpressionEnd).toBeGreaterThan(totalExpressionStart);
    expect(totalReadStart).toBeGreaterThanOrEqual(0);
    expect(totalReadEnd).toBeGreaterThan(totalReadStart);
    expect(totalExpressionSlice).toContain(
      'const TOTAL_READER_VERSION = "avanza_live_fill_only_total_reader_v4"',
    );
    expect(totalExpressionSlice).toContain("GLOBAL_TOTAL_READER_TERMS");
    expect(totalExpressionSlice).toContain('"omxs30"');
    expect(totalExpressionSlice).toContain('"djus"');
    expect(totalExpressionSlice).toContain('"börsen idag"');
    expect(totalExpressionSlice).toContain('"logga ut"');
    expect(totalExpressionSlice).toContain('"hoppa till huvudinnehållet"');
    expect(totalExpressionSlice).toContain('"spara & investera"');
    expect(totalExpressionSlice).toContain('"bolån"');
    expect(totalExpressionSlice).toContain('"pension"');
    expect(totalExpressionSlice).toContain('"lär dig mer"');
    expect(totalExpressionSlice).toContain("ORDER_TOTAL_READER_TERMS");
    expect(totalExpressionSlice).toContain('"totalt belopp"');
    expect(totalExpressionSlice).toContain('"courtage"');
    expect(totalExpressionSlice).toContain('"valuta"');
    expect(totalExpressionSlice).toContain('"sek"');
    expect(totalExpressionSlice).toContain('"usd"');
    expect(totalExpressionSlice).toContain("AVAILABLE_BUYING_POWER_TERMS");
    expect(totalExpressionSlice).toContain('"tillg. för köp"');
    expect(totalExpressionSlice).toContain('"tillgängligt för köp"');
    expect(totalExpressionSlice).toContain('"på kontot"');
    expect(totalExpressionSlice).toContain('"handla på konto"');
    expect(totalExpressionSlice).toContain('"köpkraft"');
    expect(totalExpressionSlice).toContain('"köputrymme"');
    expect(totalExpressionSlice).toContain('"kontosaldo"');
    expect(totalExpressionSlice).toContain('"saldo"');
    expect(totalExpressionSlice).toContain("MAX_ORDER_TOTAL_TEXT_LENGTH");
    expect(totalExpressionSlice).toContain('document.querySelector("input#inputVolume")');
    expect(totalExpressionSlice).toContain('document.querySelector("input#inputPrice")');
    expect(totalExpressionSlice).toContain('document.querySelector("input#inputAmount")');
    expect(totalExpressionSlice).toContain("findOrderPanel");
    expect(totalExpressionSlice).toContain("scopedToOrderPanel");
    expect(totalExpressionSlice).toContain("distanceToOrderInputs");
    expect(totalExpressionSlice).toContain("collectCandidates");
    expect(totalExpressionSlice).toContain("total_candidate_count");
    expect(totalExpressionSlice).toContain("total_candidate_count_before_scope_filter");
    expect(totalExpressionSlice).toContain("rejected_global_candidate_count");
    expect(totalExpressionSlice).toContain("rejected_unscoped_candidate_count");
    expect(totalExpressionSlice).toContain("selected_total_candidate_metadata");
    expect(totalExpressionSlice).toContain("selected_total_candidate_is_order_scoped");
    expect(totalExpressionSlice).toContain("selected_total_candidate_rejection_reason");
    expect(totalExpressionSlice).toContain("selected_total_candidate_distance_to_order_inputs");
    expect(totalExpressionSlice).toContain("selected_total_candidate_contains_global_terms");
    expect(totalExpressionSlice).toContain("selected_total_candidate_contains_available_buying_power_terms");
    expect(totalExpressionSlice).toContain("selected_total_candidate_contains_order_terms");
    expect(totalExpressionSlice).toContain("nearby_sanitized_labels");
    expect(totalExpressionSlice).toContain("total_text_unparsable");
    expect(totalExpressionSlice).toContain("total_parsed_zero_or_negative");
    expect(totalExpressionSlice).toContain(
      "total_element_not_found_or_not_order_scoped",
    );
    expect(totalExpressionSlice).toContain("total_element_found_but_empty");
    expect(totalExpressionSlice).toContain("global_header_or_market_text");
    expect(totalExpressionSlice).toContain(
      "total_candidate_is_available_buying_power_not_order_total",
    );
    expect(totalExpressionSlice).toContain("broad_page_container_or_text_too_large");
    expect(totalExpressionSlice).toContain("outside_order_form_scope");
    expect(totalExpressionSlice).toContain("missing_order_total_terms");
    expect(totalExpressionSlice).toContain("const candidates = allCandidates.filter((candidate) => candidate.is_order_scoped === true)");
    expect(totalExpressionSlice).toContain(
      "total_recalculation_delayed_or_uncertain",
    );
    expect(totalExpressionSlice).toContain(
      "for (let attempt = 1; attempt <= 4 && latest.total_valid !== true; attempt += 1)",
    );
    expect(totalExpressionSlice).toContain(
      "await new Promise((resolve) => window.setTimeout(resolve, 150))",
    );
    expect(totalExpressionSlice).toContain("no_fill: true");
    expect(totalExpressionSlice).toContain("no_click: true");
    expect(totalExpressionSlice).toContain("no_submit_or_order_placement: true");
    expect(totalExpressionSlice).not.toMatch(/\.click\s*\(|\.fill\s*\(|submit\s*\(/i);
    expect(totalExpressionSlice).not.toMatch(
      /localStorage\s*\.|sessionStorage\s*\.|document\.cookie/i,
    );
    expect(totalReadSlice).toContain(
      "if (!liveFillOnlyApprovedFieldsVerified(observed, approvedInputStrategy))",
    );
    expect(totalReadSlice).toContain(
      "buildLiveFillOnlyTotalDiscoveryExpression()",
    );
    expect(totalReadSlice.indexOf("field_readback_not_verified_before_total"))
      .toBeLessThan(totalReadSlice.indexOf("buildLiveFillOnlyTotalDiscoveryExpression()"));
    expect(totalReadSlice).toContain("total_validation_blocked_before_cap_check");
    expect(totalReadSlice).toContain("liveFillOnlyTotalReadInvalid(observed, total)");
    expect(totalReadSlice).toContain("total > APPROVED_LIVE_FILL_ONLY_VALUES.capSek");
    expect(source).toContain("total_candidate_count:");
    expect(source).toContain("rejected_global_candidate_count:");
    expect(source).toContain("rejected_available_buying_power_candidate_count:");
    expect(source).toContain("rejected_unscoped_candidate_count:");
    expect(source).toContain("selected_total_candidate_metadata:");
    expect(source).toContain("selected_total_candidate_is_order_scoped:");
    expect(source).toContain("selected_total_candidate_rejection_reason:");
    expect(source).toContain("selected_total_candidate_distance_to_order_inputs:");
    expect(source).toContain("selected_total_candidate_contains_global_terms:");
    expect(source).toContain("selected_total_candidate_contains_available_buying_power_terms:");
    expect(source).toContain("selected_total_candidate_contains_order_terms:");
    expect(source).toContain("total_retry_count:");
    expect(source).toContain("total_final_blocker_reason:");
  });

  test("adds no-fill stable field probe on the same fill target resolver", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");
    const start = source.indexOf(
      "function buildLiveFillOnlyStableFieldProbeExpression",
    );
    const end = source.indexOf("async function getSingleAvanzaCdpTarget");
    const probeSlice = source.slice(start, end);
    const resolverStart = source.indexOf(
      "function liveFillOnlyStableFieldResolverSource",
    );
    const resolverEnd = source.indexOf(
      "function buildLiveFillOnlyStableFieldProbeExpression",
    );
    const resolverSlice = source.slice(resolverStart, resolverEnd);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(resolverStart).toBeGreaterThanOrEqual(0);
    expect(resolverEnd).toBeGreaterThan(resolverStart);
    expect(source).toContain(
      'url.pathname === "/live-fill-only-runner/debug/stable-field-probe"',
    );
    expect(source).not.toContain(
      'request.method === "POST" &&\n    url.pathname === "/live-fill-only-runner/debug/stable-field-probe"',
    );
    expect(source).toContain("await buildLiveFillOnlyStableFieldProbeResponse()");
    expect(source).toContain("liveFillOnlyRunnerGate(\"stableFieldProbe\")");
    expect(source).toContain("evaluateInSingleAvanzaTarget(\n      buildLiveFillOnlyStableFieldProbeExpression()");
    expect(source).toContain("${liveFillOnlyStableFieldResolverSource()}");
    expect(probeSlice).toContain("resolveStableOrderField(field)");
    expect(resolverSlice).toContain('document.getElementById(definition.id)');
    expect(resolverSlice).toContain('document.querySelector(definition.selector)');
    expect(resolverSlice).toContain('id: "inputVolume"');
    expect(resolverSlice).toContain('selector: "input#inputVolume"');
    expect(probeSlice).toContain("accepted_by_fill_quantity_field");
    expect(probeSlice).toContain("stable_field_resolver_version");
    expect(probeSlice).toContain("fill_used_shared_stable_resolver");
    expect(resolverSlice).toContain("inside_buy_side_order_form_region_required: false");
    expect(probeSlice).toContain("no_fill: true");
    expect(probeSlice).toContain("no_click: true");
    expect(probeSlice).toContain("no_submit_or_order_placement: true");
    expect(probeSlice).not.toMatch(/\.click\s*\(|\.fill\s*\(|submit\s*\(/i);
    expect(probeSlice).not.toMatch(
      /localStorage\s*\.|sessionStorage\s*\.|document\.cookie/i,
    );
  });

  test("has no stale bridge-side fillQuantityField implementation without shared resolver diagnostics", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");
    const fillQuantityOccurrences = Array.from(
      source.matchAll(/"fillQuantityField"/g),
    ).map((match) => match.index ?? -1);
    const directEndpointStart = source.indexOf(
      'url.pathname === "/live-fill-only-runner/fill-quantity"',
    );
    const endpointBuilderStart = source.indexOf(
      'if (action === "fillQuantityField")',
    );
    const inProcessStart = source.indexOf(
      "async function runInProcessApprovedQuantityBasedFillOnlyTrigger",
    );
    const fillHelperStart = source.indexOf("async function fillLiveFillOnlyField");
    const setExpressionStart = source.indexOf(
      "function buildLiveFillOnlySetFieldExpression",
    );
    const setExpressionEnd = source.indexOf(
      "function liveFillOnlyStableFieldResolverSource",
    );
    const setExpressionSlice = source.slice(setExpressionStart, setExpressionEnd);

    expect(fillQuantityOccurrences.length).toBeGreaterThan(0);
    expect(directEndpointStart).toBeGreaterThanOrEqual(0);
    expect(endpointBuilderStart).toBeGreaterThanOrEqual(0);
    expect(inProcessStart).toBeGreaterThanOrEqual(0);
    expect(fillHelperStart).toBeGreaterThanOrEqual(0);
    expect(setExpressionStart).toBeGreaterThanOrEqual(0);
    expect(setExpressionEnd).toBeGreaterThan(setExpressionStart);
    expect(source).toContain(
      'await buildLiveFillOnlyRunnerEndpointResponse("fillQuantityField", payload)',
    );
    expect(source).toContain(
      'await fillLiveFillOnlyField(\n      "fillQuantityField",\n      "quantity"',
    );
    expect(source).toContain(
      "fillQuantityCallSite: LIVE_FILL_ONLY_IN_PROCESS_QUANTITY_CALL_SITE",
    );
    expect(setExpressionSlice).toContain("resolveStableOrderField(field)");
    expect(setExpressionSlice).toContain("stableResolved.element");
    expect(setExpressionSlice).toContain(
      "fill_used_shared_stable_resolver: stableResolved.metadata.fill_used_shared_stable_resolver",
    );
    expect(source).toContain("shared_stable_resolver_not_used");
    expect(source).not.toMatch(/function\s+fillQuantityField\s*\(/);
    expect(source).not.toMatch(/const\s+fillQuantityField\s*=\s*(?!.*fillLiveFillOnlyField)/);
  });
});
