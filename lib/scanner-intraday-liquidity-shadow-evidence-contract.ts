export const SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION_V1 =
  "scanner_intraday_liquidity_shadow_evidence_capture_v1" as const;

export const SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION =
  "scanner_intraday_liquidity_shadow_evidence_capture_v2" as const;

export const SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSIONS =
  Object.freeze([
    SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION_V1,
    SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION,
  ] as const);

export function isScannerIntradayLiquidityShadowEvidenceCaptureVersion(
  value: unknown,
) {
  return SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSIONS.some(
    (version) => version === value,
  );
}
