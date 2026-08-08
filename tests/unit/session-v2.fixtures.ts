import { createHash } from "node:crypto";

export const transitionFacts = () => ({
  now: 100,
  predecessor: {
    session_id: "session-1", principal_id: "principal-1", registry_version: "registry-v3", protocol_version: "v2",
    claims_digest: "claims-ok", snapshot_id: "snapshot-1", registry_metadata_valid: true,
    registry_snapshot_expires_at: 200, family_expires_at: 200, idle_expires_at: 200, handle_expires_at: 200,
    key_status: "available", principal_status: "active", evidence: { hmac_valid: true },
  },
  successor: {
    session_id: "session-1", principal_id: "principal-1", registry_version: "registry-v3", protocol_version: "v2",
    snapshot_id: "snapshot-1", issued_at: 100, expires_at: 200,
  },
  receipt: { predecessor_session_id: "session-1", successor_session_id: "session-1", rotation_grace_until: 200 },
});

export const cryptoInput = () => {
  const binding = {
    binding_version: "binding-v2", session_id: "session-1", principal_id: "principal-1", registry_version: "registry-v3",
    snapshot_id: "snapshot-1", claims_digest: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", expires_at: "200", key_id: "key-r10-1",
  };
  const chunks: Buffer[] = [Buffer.from("trade.session.v2.binding.v2"), Buffer.from([0]), Buffer.from("session-v2-binding-snapshot-v2"), Buffer.from([0])];
  for (const field of ["binding_version", "session_id", "principal_id", "registry_version", "snapshot_id", "claims_digest", "expires_at", "key_id"] as const) {
    const bytes = Buffer.from(binding[field], "utf8");
    chunks.push(Buffer.from(field), Buffer.from([0]), Buffer.from(String(bytes.length)), Buffer.from([0]), bytes, Buffer.from("\n"));
  }
  return { binding, provenance: {
    provenance_version: "provenance-v2", snapshot_id: "snapshot-1", provenance_id: "provenance-1", registry_version: "registry-v3",
    key_id: "key-r10-1", principal_id: "principal-1", binding_digest: createHash("sha256").update(Buffer.concat(chunks)).digest("base64url"),
  } };
};

export const syntheticKeys = () => ({
  provenance_hmac: { "key-r10-1": Uint8Array.from({ length: 32 }, (_value, index) => index + 1) },
});

export const hostileVersionFixtures = () => {
  const inheritedProtocol = Object.assign(Object.create({ protocol: "trade.session.v2" }) as Record<string, unknown>, { version: "v2" });
  const accessorProtocol: Record<string, unknown> = { version: "v2" };
  Object.defineProperty(accessorProtocol, "protocol", { enumerable: true, get: () => "trade.session.v2" });
  const getTrap = new Proxy({ protocol: "wrong", version: "wrong" }, {
    get(target, key, receiver) {
      if (key === "protocol") return "trade.session.v2";
      if (key === "version") return "v2";
      return Reflect.get(target, key, receiver);
    },
  });
  return { inheritedProtocol, accessorProtocol, getTrap };
};

export const hostileKeyringFixtures = () => {
  const key = Uint8Array.from({ length: 32 }, (_value, index) => index + 1);
  const inheritedDomain = Object.create({ provenance_hmac: { "key-r10-1": key } }) as Record<string, unknown>;
  const accessorDomain: Record<string, unknown> = {};
  Object.defineProperty(accessorDomain, "provenance_hmac", { enumerable: true, get: () => ({ "key-r10-1": key }) });
  const malformedMaterial = { provenance_hmac: { "key-r10-1": 7 } };
  return { inheritedDomain, accessorDomain, malformedMaterial };
};
