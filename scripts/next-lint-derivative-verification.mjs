import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const vendor = path.join(root, "vendor/eslint-plugin-next");
const upstreamIntegrity = "sha512-eCR9RcLTZrVS+K3+VOhi0xMdUUGNuriCHHhU1ZoABC/QQ/Gp0OWbLKQxV2/9DkmihYdYRcQWFmZXW8M1AMUXYw==";

function originalFiles() {
  const provenance = JSON.parse(readFileSync(path.join(vendor, "PROVENANCE.json"), "utf8"));
  assert.equal(provenance.upstream.name, "@next/eslint-plugin-next");
  assert.equal(provenance.upstream.version, "16.3.8");
  assert.equal(provenance.upstream.integrity, upstreamIntegrity);
  assert.equal(provenance.upstream.tarball, "https://registry.npmjs.org/@next/eslint-plugin-next/-/eslint-plugin-next-16.3.8.tgz");
  const archive = Buffer.from(provenance.upstream.archive_base64, "base64");
  assert.equal("sha512-" + createHash("sha512").update(archive).digest("base64"), upstreamIntegrity);
  const tar = gunzipSync(archive, { maxOutputLength: 256 * 1024 });
  const files = new Map();
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    const name = header.subarray(0, 100).toString().replace(/\0.*$/, "");
    if (!name) break;
    assert.ok(name.startsWith("package/") && !name.includes(".."));
    const size = Number.parseInt(header.subarray(124, 136).toString().replace(/\0.*$/, "").trim(), 8);
    assert.ok(Number.isSafeInteger(size) && size >= 0 && offset + 512 + size <= tar.length);
    assert.equal(String.fromCharCode(header[156]), "0");
    files.set(name.slice(8), tar.subarray(offset + 512, offset + 512 + size));
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return { files, provenance };
}

export function verifyNextLintDerivative() {
  const { files, provenance } = originalFiles();
  const upstream = JSON.parse(files.get("package.json").toString());
  assert.equal(upstream.name, "@next/eslint-plugin-next");
  assert.equal(upstream.version, "16.3.8");
  assert.deepEqual(provenance.modified_paths, ["package.json", "dist/utils/get-root-dirs.js"]);
  const originalDist = [...files.keys()].filter(name => name.startsWith("dist/")).sort();
  const installed = path.dirname(require.resolve("@next/eslint-plugin-next/package.json"));
  const configurationRequire = createRequire(require.resolve("eslint-config-next"));
  assert.equal(path.dirname(configurationRequire.resolve("@next/eslint-plugin-next/package.json")), installed);
  let preserved = 0;
  for (const directory of [vendor, installed]) {
    const currentDist = readdirSync(path.join(directory, "dist"), { recursive: true, withFileTypes: true })
      .filter(entry => entry.isFile())
      .map(entry => path.relative(directory, path.join(entry.parentPath, entry.name))).sort();
    assert.deepEqual(currentDist, originalDist);
    for (const relative of originalDist) {
      if (relative === "dist/utils/get-root-dirs.js") continue;
      assert.deepEqual(readFileSync(path.join(directory, relative)), files.get(relative), relative);
      preserved++;
    }
    const manifest = JSON.parse(readFileSync(path.join(directory, "package.json"), "utf8"));
    assert.equal(manifest.version, "16.3.8-ture.1");
    assert.equal(manifest.private, true);
    assert.equal(manifest.main, upstream.main);
    assert.equal(manifest.types, upstream.types);
    assert.deepEqual(manifest.dependencies, {
      "@eslint-community/eslint-utils": "4.9.1", "brace-expansion": "5.0.12",
      "glob-parent": "6.0.2", "picomatch": "4.0.4",
    });
  }
  assert.deepEqual(readFileSync(path.join(installed, "dist/utils/get-root-dirs.js")),
    readFileSync(path.join(vendor, "dist/utils/get-root-dirs.js")));
  const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const lintConfig = readFileSync(path.join(root, "eslint.config.mjs"), "utf8");
  const vendorIgnore = '    // Compiled, provenance-verified third-party rule bytes; not application source.\n    "vendor/eslint-plugin-next/dist/**",\n';
  assert.equal(lintConfig.split(vendorIgnore).length, 2);
  assert.equal(createHash("sha256").update(lintConfig.replace(vendorIgnore, "")).digest("hex"),
    "53065bd014f2b6fb89dc5f1a84cd37053217cbec71be6f15c3958a3b3bc4143c");
  assert.deepEqual(packageJson.overrides, { "@next/eslint-plugin-next": "$@next/eslint-plugin-next" });
  assert.equal(packageJson.devDependencies["@next/eslint-plugin-next"], "file:vendor/eslint-plugin-next");
  assert.equal(packageJson.dependencies.next, "16.3.8");
  assert.equal(packageJson.devDependencies["eslint-config-next"], "16.3.8");
  const lock = JSON.parse(readFileSync(path.join(root, "package-lock.json"), "utf8"));
  assert.deepEqual(Object.keys(lock.packages).filter(name => /node_modules\/(?:fast-glob|micromatch|braces)$/.test(name)), []);
  return { upstream: upstream.name + "@" + upstream.version, integrity: upstreamIntegrity,
    derivative: "16.3.8-ture.1", original_dist_files: originalDist.length,
    preserved_dist_files_per_copy: preserved / 2, installed_verified: true };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(JSON.stringify(verifyNextLintDerivative()) + "\n");
}
