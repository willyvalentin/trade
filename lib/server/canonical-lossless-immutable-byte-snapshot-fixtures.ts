import "server-only";

import {
  action666cxCanonicalEnvelope,
  action666cxCanonicalReadbackBytes,
} from "@/lib/server/canonical-callback-free-atomic-observation-fixtures";
import {
  runCanonicalLosslessImmutableByteSnapshot,
  type CanonicalLosslessImmutableByteSnapshotExecution,
} from "@/lib/server/canonical-lossless-immutable-byte-snapshot";

export function action666cyCanonicalEnvelope(request: unknown) {
  return action666cxCanonicalEnvelope(request);
}

export function action666cyCanonicalBytes(request: unknown) {
  return action666cxCanonicalReadbackBytes(request);
}

export function action666cyReadback(
  input: unknown,
): CanonicalLosslessImmutableByteSnapshotExecution {
  return runCanonicalLosslessImmutableByteSnapshot(input, true, false);
}

export function action666cyTerminal(input: unknown) {
  const terminal = action666cyReadback(input).terminal_result;
  if (terminal === null) throw new Error("action_666cy_terminal_unavailable");
  return terminal;
}

export function action666cyGoldenScenarios() {
  const canonical = action666cyCanonicalEnvelope(BigInt(1));
  const reversed = JSON.stringify(
    Object.fromEntries(Object.entries(JSON.parse(canonical)).reverse()),
  );
  const mismatch = JSON.stringify({
    ...JSON.parse(canonical),
    envelope_digest: "0".repeat(64),
  });
  const scenarios = [
    { name: "canonical_string", input: canonical },
    { name: "canonical_bytes", input: action666cyCanonicalBytes(BigInt(1)) },
    { name: "invalid_utf8_ff", input: new Uint8Array([0xff]) },
    { name: "invalid_utf8_fe", input: new Uint8Array([0xfe]) },
    { name: "malformed_json", input: "{" },
    { name: "noncanonical_order", input: reversed },
    { name: "digest_mismatch", input: mismatch },
  ] as const;
  return scenarios.map(({ name, input }) => {
    const terminal = action666cyTerminal(input);
    return {
      name,
      terminal_status: terminal.terminal_status,
      integrity_verified: terminal.integrity_verified,
      provenance_verified: terminal.provenance_verified,
      authority_status: terminal.authority_status,
      trusted: terminal.trusted,
      admitted: terminal.admitted,
      raw_byte_sha256:
        terminal.raw_byte_observation?.raw_byte_sha256 ?? null,
      raw_byte_observation_digest:
        terminal.raw_byte_observation?.observation_digest ?? null,
      terminal_identity: terminal.terminal_identity,
      failure_identity: terminal.failure_identity,
      reason_codes: terminal.reason_codes,
    };
  });
}
