type PreviewFlagEnvironment = Readonly<Record<string, string | undefined>>;

function defaultEnvironment(): PreviewFlagEnvironment {
  if (typeof process === "undefined") return {};
  return process.env;
}

function defaultRuntime(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env.NODE_ENV;
}

export function isConfidenceCalibrationProjectionPreviewEnabled(
  environment: PreviewFlagEnvironment = defaultEnvironment(),
  runtime: string | undefined = defaultRuntime(),
): boolean {
  if (runtime === "production") return false;

  const rawValue =
    environment.CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED;

  if (rawValue === undefined || rawValue === "") return false;

  return rawValue === "true";
}
