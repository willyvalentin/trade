export const TRADE_AUTH_COOKIE = "trade_auth";
export const applicationSessionContractVersion =
  "ture_application_session_v2_owner_bound" as const;
export const applicationSessionMaxAgeSeconds = 8 * 60 * 60;
export const applicationOwnerUserIdEnvironmentKey =
  "TURE_APPLICATION_OWNER_USER_ID" as const;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ApplicationSessionPayload = {
  version: typeof applicationSessionContractVersion;
  role: "trusted_operator";
  owner_user_id: string;
  issued_at: number;
  expires_at: number;
};

export function normalizeApplicationOwnerUserId(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return uuidPattern.test(normalized) ? normalized : null;
}

export function getConfiguredApplicationOwnerUserId(
  environment: Record<string, string | undefined> = process.env,
) {
  return normalizeApplicationOwnerUserId(
    environment[applicationOwnerUserIdEnvironmentKey],
  );
}

function encodeBase64Url(value: Uint8Array) {
  let binary = "";

  for (const byte of value) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    return null;
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  try {
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function sessionSecret() {
  const password = process.env.TRADE_APP_PASSWORD;

  return typeof password === "string" && password.length > 0 ? password : null;
}

async function sessionKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`ture:application-session:${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(payload: string, secret: string) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await sessionKey(secret),
    new TextEncoder().encode(payload),
  );

  return encodeBase64Url(new Uint8Array(signature));
}

function parsePayload(value: string): ApplicationSessionPayload | null {
  const encoded = decodeBase64Url(value);

  if (!encoded) {
    return null;
  }

  try {
    const parsed = JSON.parse(new TextDecoder().decode(encoded)) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const payload = parsed as Partial<ApplicationSessionPayload>;
    const issuedAt = payload.issued_at;
    const expiresAt = payload.expires_at;
    if (
      payload.version !== applicationSessionContractVersion ||
      payload.role !== "trusted_operator" ||
      !normalizeApplicationOwnerUserId(payload.owner_user_id) ||
      typeof issuedAt !== "number" ||
      typeof expiresAt !== "number" ||
      !Number.isSafeInteger(issuedAt) ||
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= issuedAt ||
      expiresAt - issuedAt > applicationSessionMaxAgeSeconds
    ) {
      return null;
    }

    return payload as ApplicationSessionPayload;
  } catch {
    return null;
  }
}

export type ApplicationSessionVerification =
  | { status: "authenticated"; owner_user_id: string; expires_at: number }
  | {
      status:
        | "missing"
        | "malformed"
        | "expired"
        | "invalid_signature"
        | "configuration_missing";
    };

export async function createApplicationSession(now = new Date()) {
  const secret = sessionSecret();
  const ownerUserId = getConfiguredApplicationOwnerUserId();

  if (!secret || !ownerUserId || !Number.isFinite(now.getTime())) {
    return null;
  }

  const issuedAt = Math.floor(now.getTime() / 1000);
  const payload: ApplicationSessionPayload = {
    version: applicationSessionContractVersion,
    role: "trusted_operator",
    owner_user_id: ownerUserId,
    issued_at: issuedAt,
    expires_at: issuedAt + applicationSessionMaxAgeSeconds,
  };
  const encodedPayload = encodeBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  );

  return `${encodedPayload}.${await sign(encodedPayload, secret)}`;
}

export async function verifyApplicationSession(
  value: string | undefined,
  now = new Date(),
): Promise<ApplicationSessionVerification> {
  const secret = sessionSecret();
  const configuredOwnerUserId = getConfiguredApplicationOwnerUserId();

  if (!secret || !configuredOwnerUserId) {
    return { status: "configuration_missing" };
  }

  if (!value) {
    return { status: "missing" };
  }

  const [encodedPayload, encodedSignature, ...remainder] = value.split(".");
  if (!encodedPayload || !encodedSignature || remainder.length > 0) {
    return { status: "malformed" };
  }

  const signature = decodeBase64Url(encodedSignature);
  const payload = parsePayload(encodedPayload);
  if (!signature || !payload || !Number.isFinite(now.getTime())) {
    return { status: "malformed" };
  }

  const validSignature = await crypto.subtle.verify(
    "HMAC",
    await sessionKey(secret),
    signature,
    new TextEncoder().encode(encodedPayload),
  );

  if (!validSignature) {
    return { status: "invalid_signature" };
  }

  if (payload.expires_at <= Math.floor(now.getTime() / 1000)) {
    return { status: "expired" };
  }

  if (payload.owner_user_id !== configuredOwnerUserId) {
    return { status: "invalid_signature" };
  }

  return {
    status: "authenticated",
    owner_user_id: payload.owner_user_id,
    expires_at: payload.expires_at,
  };
}

export function applicationSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: applicationSessionMaxAgeSeconds,
  };
}

// Kept only for legacy test fixtures until they migrate to createApplicationSession.
export async function getTradeAuthToken(password: string) {
  const data = new TextEncoder().encode(`trade-auth:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashBytes = Array.from(new Uint8Array(hashBuffer));

  return hashBytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
