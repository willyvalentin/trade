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

export const cryptoInput = () => ({
  binding: {
    binding_version: "binding-v2", session_id: "session-1", principal_id: "principal-1", registry_version: "registry-v3",
    snapshot_id: "snapshot-1", claims_digest: "claims-digest-1", expires_at: "200", key_id: "key-r10-1",
  },
  provenance: {
    provenance_version: "provenance-v2", snapshot_id: "snapshot-1", provenance_id: "provenance-1", registry_version: "registry-v3",
    key_id: "key-r10-1", principal_id: "principal-1", binding_digest: "binding-digest-1",
  },
});

export const syntheticKeys = () => ({
  provenance_hmac: { "key-r10-1": "r10-synthetic-provenance-hmac-key" },
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
  const inheritedDomain = Object.create({ provenance_hmac: { "key-r10-1": "r10-synthetic-provenance-hmac-key" } }) as Record<string, unknown>;
  const accessorDomain: Record<string, unknown> = {};
  Object.defineProperty(accessorDomain, "provenance_hmac", { enumerable: true, get: () => ({ "key-r10-1": "r10-synthetic-provenance-hmac-key" }) });
  const malformedMaterial = { provenance_hmac: { "key-r10-1": 7 } };
  return { inheritedDomain, accessorDomain, malformedMaterial };
};
