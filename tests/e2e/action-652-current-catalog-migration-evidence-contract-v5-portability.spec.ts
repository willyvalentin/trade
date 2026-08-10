import { cpSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const sourceUrl = new URL("../../lib/server/action-652-current-catalog-migration-evidence-contract-v5.mts", import.meta.url);
const primaryOracleUrl = new URL("./action-652-current-catalog-migration-evidence-contract-v5.spec.ts", import.meta.url);
const independentOracleUrl = new URL("./action-652-current-catalog-migration-evidence-contract-v5-independent.spec.ts", import.meta.url);
const source = readFileSync(sourceUrl, "utf8");
const oracleSource = `${readFileSync(primaryOracleUrl, "utf8")}\n${readFileSync(independentOracleUrl, "utf8")}`;
const results: Array<{ name: string; passed: boolean }> = [];
let uncontrolled = 0;

async function check(name: string, operation: () => boolean | Promise<boolean>) {
  let passed = false;
  try { passed = await operation(); } catch { uncontrolled += 1; }
  results.push({ name, passed });
}
function relocate(): string {
  const target = mkdtempSync(join(tmpdir(), "action-652-contract-relocation-"));
  cpSync(new URL("../../lib", import.meta.url), join(target, "lib"), { recursive: true });
  cpSync(new URL("../../docs", import.meta.url), join(target, "docs"), { recursive: true });
  return target;
}
async function importRelocated(target: string, nonce: string): Promise<boolean> {
  const modulePath = join(target, "lib/server/action-652-current-catalog-migration-evidence-contract-v5.mts");
  try { await import(`${pathToFileURL(modulePath).href}?case=${nonce}`); return true; } catch { return false; }
}

await check("executable source has no absolute private tmp authority", () => !source.includes("/private/tmp/"));
await check("executable source has no absolute user path", () => !source.includes("/Users/"));
await check("executable source has no Ajv dependency", () => !/\bAjv\b|createRequire/.test(source));
await check("executable source derives assets from import meta url", () => source.includes("new URL(\"../../docs/evidence/action-652-current-catalog-migration-contract-v5/\", import.meta.url)"));
await check("oracle sources have no absolute authority roots", () => !oracleSource.includes("/private/tmp/") && !oracleSource.includes("/Users/"));
await check("typescript sources are not nochecked", () => !source.includes("@ts-nocheck") && !oracleSource.includes("@ts-nocheck"));
await check("clean relocation imports with colocated assets", async () => { const target = relocate(); try { return await importRelocated(target, "baseline"); } finally { rmSync(target, { recursive: true, force: true }); } });
await check("missing production registry fails closed", async () => { const target = relocate(); try { renameSync(join(target, "docs/evidence/action-652-current-catalog-migration-contract-v5/contract-registry-v5.json"), join(target, "missing-registry.json")); return !(await importRelocated(target, "missing-registry")); } finally { rmSync(target, { recursive: true, force: true }); } });
await check("production registry substitution fails closed", async () => { const target = relocate(); try { const file = join(target, "docs/evidence/action-652-current-catalog-migration-contract-v5/contract-registry-v5.json"); const bytes = readFileSync(file); bytes[bytes.length - 2] ^= 1; writeFileSync(file, bytes); return !(await importRelocated(target, "registry-substitution")); } finally { rmSync(target, { recursive: true, force: true }); } });
await check("catalog schema substitution fails closed", async () => { const target = relocate(); try { const file = join(target, "docs/evidence/action-652-current-catalog-migration-contract-v5/catalog-structural-schema-v5.json"); const bytes = readFileSync(file); bytes[bytes.length - 2] ^= 1; writeFileSync(file, bytes); return !(await importRelocated(target, "catalog-schema-substitution")); } finally { rmSync(target, { recursive: true, force: true }); } });
await check("migration schema substitution fails closed", async () => { const target = relocate(); try { const file = join(target, "docs/evidence/action-652-current-catalog-migration-contract-v5/migration-structural-schema-v5.json"); const bytes = readFileSync(file); bytes[bytes.length - 2] ^= 1; writeFileSync(file, bytes); return !(await importRelocated(target, "migration-schema-substitution")); } finally { rmSync(target, { recursive: true, force: true }); } });
await check("identity manifest substitution fails closed", async () => { const target = relocate(); try { const file = join(target, "docs/evidence/action-652-current-catalog-migration-contract-v5/registry-identities.json"); const value = JSON.parse(readFileSync(file, "utf8")); value.production.sha256 = "f".repeat(64); writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); return !(await importRelocated(target, "identity-substitution")); } finally { rmSync(target, { recursive: true, force: true }); } });
await check("cwd does not select authority", async () => { const before = process.cwd(); const target = relocate(); const cwd = mkdtempSync(join(tmpdir(), "action-652-hostile-cwd-")); try { process.chdir(cwd); return await importRelocated(target, "cwd"); } finally { process.chdir(before); rmSync(cwd, { recursive: true, force: true }); rmSync(target, { recursive: true, force: true }); } });
await check("asset authority path set is closed", () => source.includes("assetUrl(identities.production.path)") && ["catalog-structural-schema-v5.json", "migration-structural-schema-v5.json", "registry-identities.json"].every((name) => source.includes(name)));
await check("production and schema digests remain embedded", () => ["9ca9dcbc53e5ac1c4dc3ccf825168104278c82a202c90f6b93da801a5fd1ec10", "15acbd74bcbcc940d519d50df6f5ef819f988f76f114e897a0735e9a62f717c5", "382a06f40dff33abd705426c74a1864a9a897bf6e35c80a2ce71d28a963bc8bc"].every((digest) => source.includes(digest)));

const failures = results.filter((entry) => !entry.passed);
console.log(JSON.stringify({ total: results.length, passed: results.length - failures.length, failed: failures.length, uncontrolled_exceptions: uncontrolled, failures: failures.map((entry) => entry.name) }, null, 2));
if (failures.length || uncontrolled) process.exit(1);
