import fs from "node:fs";
import { SESSION_V2_CONTRACT } from "../../lib/auth/session-v2-contract";
import { SESSION_V2_FOUNDATION } from "../../lib/auth/session-v2-verification";
import { cryptoInput, hostileKeyringFixtures, hostileVersionFixtures, syntheticKeys, transitionFacts } from "./session-v2.fixtures";

type CaseResult = { id: string; pass: boolean; thrown: boolean; error?: string };
type MutableRecord = Record<string, unknown>;

const cases: CaseResult[] = [];
const run = (id: string, check: () => boolean): void => {
  try {
    cases.push({ id, pass: check(), thrown: false });
  } catch (error: unknown) {
    cases.push({ id, pass: false, thrown: true, error: error instanceof Error ? error.name : "unknown" });
  }
};
const write = (root: MutableRecord, dotted: string, value: unknown): void => {
  const parts = dotted.split(".");
  let current: unknown = root;
  for (const part of parts.slice(0, -1)) {
    if (current === null || typeof current !== "object") throw new Error(`invalid test path: ${dotted}`);
    current = (current as MutableRecord)[part];
  }
  if (current === null || typeof current !== "object") throw new Error(`invalid test path: ${dotted}`);
  const finalPart = parts[parts.length - 1];
  if (finalPart === undefined) throw new Error(`empty test path: ${dotted}`);
  (current as MutableRecord)[finalPart] = value;
};
const asMutable = <T extends object>(value: T): MutableRecord => value as MutableRecord;
const revoked = <T extends object>(value: T): T => {
  const controlled = Proxy.revocable(value, {});
  controlled.revoke();
  return controlled.proxy as T;
};
const frozenMutationIsRejected = (mutate: () => void): boolean => {
  try {
    mutate();
    return false;
  } catch (error: unknown) {
    return error instanceof TypeError;
  }
};

const mutationByPredicate: Readonly<Record<string, readonly [string, unknown]>> = {
  predecessor: ["predecessor.claims_digest", "claims-bad"],
  successor: ["successor.principal_id", "principal-other"],
  receipt: ["receipt.predecessor_session_id", "session-other"],
  snapshot_binding: ["successor.snapshot_id", "snapshot-other"],
  registry_metadata: ["predecessor.registry_metadata_valid", false],
  time_equation: ["successor.issued_at", 201],
  future_time: ["successor.issued_at", 101],
  registry_snapshot_expiry: ["predecessor.registry_snapshot_expires_at", 100],
  family_expiry: ["predecessor.family_expires_at", 100],
  idle_expiry: ["predecessor.idle_expires_at", 100],
  handle_expiry: ["predecessor.handle_expires_at", 100],
  key_availability: ["predecessor.key_status", "unavailable"],
  hmac_integrity: ["predecessor.evidence.hmac_valid", false],
  principal_revocation: ["predecessor.principal_status", "revoked"],
  rotation_grace: ["receipt.rotation_grace_until", 100],
};

run("default_off", () => SESSION_V2_FOUNDATION.verifySession({ session_id: "forged" }).code === "authority_unavailable");
run("closed_version", () =>
  SESSION_V2_FOUNDATION.validateVersion({ protocol: "trade.session.v2", version: "v2" }).ok &&
  !SESSION_V2_FOUNDATION.validateVersion({ protocol: "trade.session.v1", version: "v1" }).ok &&
  !SESSION_V2_FOUNDATION.validateVersion({ protocol: "trade.session.v2", version: "v3" }).ok,
);

for (const row of SESSION_V2_CONTRACT.precedence.rows) {
  run(`row:${row.predicate_id}`, () => {
    const patch = mutationByPredicate[row.predicate_id];
    if (!patch) return false;
    const input = transitionFacts();
    write(asMutable(input), patch[0], patch[1]);
    const actual = SESSION_V2_FOUNDATION.evaluateTransition(input);
    return actual.code === row.result_code && actual.ordinal === row.ordinal;
  });
}

const orderedRows = [...SESSION_V2_CONTRACT.precedence.rows].sort((left, right) => left.ordinal - right.ordinal);
for (let index = 0; index < orderedRows.length - 1; index += 1) {
  const first = orderedRows[index];
  const second = orderedRows[index + 1];
  if (!first || !second) continue;
  run(`boundary:${first.ordinal}-${second.ordinal}`, () => {
    const firstPatch = mutationByPredicate[first.predicate_id];
    const secondPatch = mutationByPredicate[second.predicate_id];
    if (!firstPatch || !secondPatch) return false;
    const input = transitionFacts();
    write(asMutable(input), secondPatch[0], secondPatch[1]);
    write(asMutable(input), firstPatch[0], firstPatch[1]);
    return SESSION_V2_FOUNDATION.evaluateTransition(input).ordinal === first.ordinal;
  });
}

const binding = SESSION_V2_FOUNDATION.projectEvidence("binding", cryptoInput(), syntheticKeys());
const provenance = SESSION_V2_FOUNDATION.projectEvidence("provenance", cryptoInput(), syntheticKeys());
run("binding_golden", () => binding.ok && binding.digest === "0293b1dbee15164176cbe11c5c4e18087a395f2555e6564868bfdd3b629dd53f");
run("provenance_golden", () => provenance.ok && provenance.digest === "868b2b8545316134d3a204f1daa2a596a3de07a281b7395b79f4aeb6e4c707b6");

const cryptoMutations: readonly { id: string; projection: "binding" | "provenance"; mutate: (input: MutableRecord, keys: MutableRecord) => boolean }[] = [
  { id: "missing_segment", projection: "binding", mutate: (input) => { delete (input.binding as MutableRecord).claims_digest; return true; } },
  { id: "reordered_segment", projection: "binding", mutate: () => frozenMutationIsRejected(() => (SESSION_V2_CONTRACT.crypto.projections[0]?.segments as unknown as string[]).reverse()) },
  { id: "substituted_snapshot", projection: "binding", mutate: (input) => { write(input, "binding.snapshot_id", "snapshot-other"); return true; } },
  { id: "wrong_frame", projection: "binding", mutate: () => frozenMutationIsRejected(() => { (SESSION_V2_CONTRACT.crypto.projections[0] as unknown as { frame: string }).frame = "wrong"; }) },
  { id: "wrong_version", projection: "binding", mutate: () => frozenMutationIsRejected(() => { (SESSION_V2_CONTRACT.crypto.projections[0] as unknown as { version: string }).version = "wrong"; }) },
  { id: "wrong_key_domain", projection: "provenance", mutate: (_input, keys) => { delete (keys.provenance_hmac as MutableRecord)["key-r10-1"]; return true; } },
  { id: "wrong_byte_type", projection: "binding", mutate: (input) => { write(input, "binding.expires_at", 200); return true; } },
  { id: "altered_canonical_bytes", projection: "provenance", mutate: (input) => { write(input, "provenance.binding_digest", "x\u0000y"); return true; } },
];
for (const vector of cryptoMutations) {
  run(`crypto:${vector.id}`, () => {
    const input = asMutable(cryptoInput());
    const keys = asMutable(syntheticKeys());
    const baseline = SESSION_V2_FOUNDATION.projectEvidence(vector.projection, input, keys);
    const mutationApplied = vector.mutate(input, keys);
    const actual = SESSION_V2_FOUNDATION.projectEvidence(vector.projection, input, keys);
    if (["reordered_segment", "wrong_frame", "wrong_version"].includes(vector.id)) {
      return mutationApplied && baseline.ok && actual.ok && baseline.digest === actual.digest;
    }
    return mutationApplied && (!actual.ok || (vector.id === "substituted_snapshot" && baseline.ok && actual.ok && baseline.digest !== actual.digest));
  });
}

run("inherited_protocol_rejected", () => !SESSION_V2_FOUNDATION.validateVersion(hostileVersionFixtures().inheritedProtocol).ok);
run("accessor_protocol_rejected", () => !SESSION_V2_FOUNDATION.validateVersion(hostileVersionFixtures().accessorProtocol).ok);
run("get_proxy_protocol_noninfluential", () => !SESSION_V2_FOUNDATION.validateVersion(hostileVersionFixtures().getTrap).ok);
run("inherited_key_domain_rejected", () => !SESSION_V2_FOUNDATION.projectEvidence("provenance", cryptoInput(), hostileKeyringFixtures().inheritedDomain).ok);
run("accessor_key_domain_rejected", () => !SESSION_V2_FOUNDATION.projectEvidence("provenance", cryptoInput(), hostileKeyringFixtures().accessorDomain).ok);
run("wrong_key_runtime_type_rejected", () => !SESSION_V2_FOUNDATION.projectEvidence("provenance", cryptoInput(), hostileKeyringFixtures().malformedMaterial).ok);
run("prototype_pollution_rejected", () => {
  Object.defineProperty(Object.prototype, "provenance_hmac", { configurable: true, value: { "key-r10-1": "r10-synthetic-provenance-hmac-key" } });
  try {
    return !SESSION_V2_FOUNDATION.projectEvidence("provenance", cryptoInput(), {}).ok;
  } finally {
    delete (Object.prototype as Record<string, unknown>).provenance_hmac;
  }
});

for (const trap of ["getPrototypeOf", "getOwnPropertyDescriptor", "ownKeys"] as const) {
  run(`proxy:${trap}:fail_closed`, () => {
    const handler: ProxyHandler<object> = { [trap]: () => { throw new Error(`hostile_${trap}`); } };
    const actual = SESSION_V2_FOUNDATION.validateVersion(new Proxy({ protocol: "trade.session.v2", version: "v2" }, handler));
    return actual.ok === false;
  });
}
run("proxy:get:no_direct_read", () => {
  let reads = 0;
  const proxy = new Proxy({ protocol: "trade.session.v2", version: "v2" }, { get() { reads += 1; throw new Error("get_should_not_run"); } });
  const actual = SESSION_V2_FOUNDATION.validateVersion(proxy);
  return actual.ok === true && reads === 0;
});
run("proxy:has:no_in_operator", () => {
  let checks = 0;
  const proxy = new Proxy({ protocol: "trade.session.v2", version: "v2" }, { has() { checks += 1; throw new Error("has_should_not_run"); } });
  const actual = SESSION_V2_FOUNDATION.validateVersion(proxy);
  return actual.ok === true && checks === 0;
});
run("compound_hostile_input_fail_closed", () => {
  const input = new Proxy(cryptoInput(), { getOwnPropertyDescriptor() { throw new Error("descriptor"); } });
  const keyring = new Proxy(syntheticKeys(), { ownKeys() { throw new Error("keys"); } });
  const actual = SESSION_V2_FOUNDATION.projectEvidence("provenance", input, keyring);
  return actual.ok === false;
});
run("revoked_top_level_version_fail_closed", () => !SESSION_V2_FOUNDATION.validateVersion(revoked({ protocol: "trade.session.v2", version: "v2" })).ok);
run("revoked_protocol_value_rejected", () => !SESSION_V2_FOUNDATION.validateVersion({ protocol: revoked({ value: "trade.session.v2" }), version: "v2" }).ok);
run("revoked_version_value_rejected", () => !SESSION_V2_FOUNDATION.validateVersion({ protocol: "trade.session.v2", version: revoked({ value: "v2" }) }).ok);
run("revoked_transition_input_fail_closed", () => !SESSION_V2_FOUNDATION.evaluateTransition(revoked(transitionFacts())).ok);
run("revoked_claim_value_rejected", () => {
  const input = transitionFacts();
  input.predecessor.claims_digest = revoked({ digest: "claims-ok" }) as unknown as string;
  return !SESSION_V2_FOUNDATION.evaluateTransition(input).ok;
});
run("revoked_evidence_record_fail_closed", () => {
  const input = transitionFacts();
  input.predecessor.evidence = revoked({ hmac_valid: true }) as unknown as { hmac_valid: boolean };
  return !SESSION_V2_FOUNDATION.evaluateTransition(input).ok;
});
run("revoked_nested_array_fail_closed", () => {
  const input = transitionFacts();
  input.predecessor.evidence = revoked([]) as unknown as { hmac_valid: boolean };
  return !SESSION_V2_FOUNDATION.evaluateTransition(input).ok;
});
run("revoked_keyring_fail_closed", () => !SESSION_V2_FOUNDATION.projectEvidence("provenance", cryptoInput(), revoked(syntheticKeys())).ok);
run("revoked_key_domain_fail_closed", () => !SESSION_V2_FOUNDATION.projectEvidence("provenance", cryptoInput(), { provenance_hmac: revoked({ "key-r10-1": "r10-synthetic-provenance-hmac-key" }) }).ok);
run("revoked_nested_projection_record_fail_closed", () => {
  const input = cryptoInput();
  input.binding = revoked(input.binding);
  return !SESSION_V2_FOUNDATION.projectEvidence("binding", input, syntheticKeys()).ok;
});
run("revocation_during_prototype_check_fail_closed", () => {
  const control: { revoke?: () => void } = {};
  const controlled = Proxy.revocable({ protocol: "trade.session.v2", version: "v2" }, {
    getPrototypeOf() { control.revoke?.(); return Object.prototype; },
  });
  control.revoke = controlled.revoke;
  return !SESSION_V2_FOUNDATION.validateVersion(controlled.proxy).ok;
});
run("revocation_during_own_keys_fail_closed", () => {
  const control: { revoke?: () => void } = {};
  const controlled = Proxy.revocable({ protocol: "trade.session.v2", version: "v2" }, {
    ownKeys() { control.revoke?.(); return ["protocol", "version"]; },
  });
  control.revoke = controlled.revoke;
  return !SESSION_V2_FOUNDATION.validateVersion(controlled.proxy).ok;
});
run("revocation_during_descriptor_fail_closed", () => {
  const control: { revoke?: () => void } = {};
  const controlled = Proxy.revocable({ protocol: "trade.session.v2", version: "v2" }, {
    getOwnPropertyDescriptor(target, key) {
      control.revoke?.();
      return Object.getOwnPropertyDescriptor(target, key);
    },
  });
  control.revoke = controlled.revoke;
  return !SESSION_V2_FOUNDATION.validateVersion(controlled.proxy).ok;
});
run("nonmutation_determinism", () => {
  const input = transitionFacts();
  const before = JSON.stringify(input);
  const first = SESSION_V2_FOUNDATION.evaluateTransition(input);
  const second = SESSION_V2_FOUNDATION.evaluateTransition(input);
  return before === JSON.stringify(input) && JSON.stringify(first) === JSON.stringify(second);
});
const source = fs.readFileSync(new URL("../../lib/auth/session-v2-verification.ts", import.meta.url), "utf8");
run("no_runtime_wiring_or_direct_untrusted_reads", () => !/fetch\(|process\.env|cookie|route|supabase|broker|mint|sign|syntheticKeyring\[|domain\[|value\.protocol|value\.version/.test(source));

const output: { artifact: string; executed: number; passed: number; throws: number; cases: CaseResult[]; ok: boolean } = {
  artifact: "session-v2-remediated-fixture-oracle",
  executed: cases.length,
  passed: cases.filter((entry) => entry.pass).length,
  throws: cases.filter((entry) => entry.thrown).length,
  cases,
  ok: false,
};
output.ok = output.executed === output.passed && output.throws === 0;
fs.writeFileSync(new URL("../../../fixture-oracle-results.json", import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ executed: output.executed, passed: output.passed, throws: output.throws, ok: output.ok })}\n`);
process.exitCode = output.ok ? 0 : 1;
