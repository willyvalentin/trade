export const TWELVE_DATA_RESPONSE_IDENTITY_VERSION =
  "twelve_data_response_identity_v1" as const;

export type TwelveDataResponseIdentity = {
  contract_version: typeof TWELVE_DATA_RESPONSE_IDENTITY_VERSION;
  digest_algorithm: "sha256";
  payload_sha256: string;
  payload_byte_length: number;
};

const SHA256_DIGEST = /^sha256:[a-f0-9]{64}$/;

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

/**
 * Parses the deliberately narrow, privacy-preserving identity retained for an
 * actual Twelve Data response. It contains neither the raw response nor any
 * request material, and it is not an upstream API-version claim.
 */
export function twelveDataResponseIdentityFromUnknown(
  value: unknown,
): TwelveDataResponseIdentity | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const payloadSha256 = textOrNull(raw.payload_sha256);
  const payloadByteLength = raw.payload_byte_length;

  if (
    raw.contract_version !== TWELVE_DATA_RESPONSE_IDENTITY_VERSION ||
    raw.digest_algorithm !== "sha256" ||
    !payloadSha256 ||
    !SHA256_DIGEST.test(payloadSha256) ||
    typeof payloadByteLength !== "number" ||
    !Number.isSafeInteger(payloadByteLength) ||
    payloadByteLength < 0
  ) {
    return null;
  }

  return {
    contract_version: TWELVE_DATA_RESPONSE_IDENTITY_VERSION,
    digest_algorithm: "sha256",
    payload_sha256: payloadSha256,
    payload_byte_length: payloadByteLength,
  };
}

export function twelveDataResponseIdentityFromSha256({
  digestHex,
  payloadByteLength,
}: {
  digestHex: string;
  payloadByteLength: number;
}): TwelveDataResponseIdentity {
  const identity = twelveDataResponseIdentityFromUnknown({
    contract_version: TWELVE_DATA_RESPONSE_IDENTITY_VERSION,
    digest_algorithm: "sha256",
    payload_sha256: `sha256:${digestHex.toLowerCase()}`,
    payload_byte_length: payloadByteLength,
  });

  if (!identity) {
    throw new Error("Unable to create a valid Twelve Data response identity.");
  }

  return identity;
}

/**
 * Creates the retained identity from the bytes already received by Ture. This
 * helper makes no network request and retains no bytes after producing the
 * digest, so it is safe to share between server capture and provider-free
 * verification.
 */
export async function twelveDataResponseIdentityFromPayloadBytes(
  payloadBytes: Uint8Array,
): Promise<TwelveDataResponseIdentity> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    payloadBytes.slice().buffer,
  );
  const digestHex = Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");

  return twelveDataResponseIdentityFromSha256({
    digestHex,
    payloadByteLength: payloadBytes.byteLength,
  });
}
