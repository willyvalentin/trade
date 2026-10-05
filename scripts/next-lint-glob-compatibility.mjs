import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(repositoryRoot, "package.json"));

// Each comparison starts modules at the real modeled CLI cwd. No import-time
// cwd substitution, no production service, and no downloaded oracle in CI.
export function runRootDirectoryCompatibility({ referenceRoot, candidateRoot, adversarial = false } = {}) {
  const fixture = realpathSync(mkdtempSync(path.join(os.tmpdir(), "ture-lint-root-")));
  const cwd = path.join(fixture, "workspace");
  try {
    for (const relative of [
      "workspace/apps/web/pages", "workspace/apps/web/public/child",
      "workspace/apps/mobile/app", "workspace/apps/.hidden/pages",
      "workspace/packages/blog/pages", "workspace/packages/store/pages",
      "workspace/empty", "external-site/pages",
      "workspace/apps/site1/pages", "workspace/apps/site2/pages", "workspace/apps/site3/pages",
      "workspace/apps/paren(site)/pages", "workspace/apps/{literal}/pages",
      "workspace/pages", "workspace/src/pages", "workspace/app",
      "workspace/ranges/app01/pages", "workspace/ranges/app02/pages", "workspace/ranges/app03/pages",
      "workspace/letters/appa/pages", "workspace/letters/appb/pages", "workspace/letters/appc/pages",
    ]) mkdirSync(path.join(fixture, relative), { recursive: true });
    for (const relative of [
      "apps/web/pages/index.js", "apps/web/pages/contact.js",
      "apps/mobile/app/page.js", "packages/blog/pages/index.js",
      "pages/contact.js", "src/pages/contact.js", "apps/.hidden/pages/contact.js",
      "ranges/app01/pages/contact.js", "letters/appa/pages/contact.js",
    ]) writeFileSync(path.join(cwd, relative), "export default function Page() { return null; }\n");
    writeFileSync(path.join(cwd, "apps/not-a-directory"), "fixture\n");
    symlinkSync("web", path.join(cwd, "apps/web-alias"), "dir");
    symlinkSync("missing", path.join(cwd, "apps/broken"), "dir");
    const cases = [
      { name: "default", rootDir: undefined },
      ...[".", "./", "apps/web", "./apps/web", "apps/web/", "apps/*", "apps/**",
        "apps/**/", "apps/w?b", "apps/[wm]*", "apps/{web,mobile}",
        "apps/!(mobile)", "apps/@(web|mobile)", "apps/.hidden", "apps/**/.hidden",
        "packages/*", "does-not-exist", "apps/not-a-directory", "!apps/web",
        "../external-site", "apps\\web", "", "apps/{broken", "apps/[broken",
        "./apps/*", "./apps/**", "apps//web", "apps//*/", "apps/web/../mobile",
        "apps/*/pages", "apps/**/pages", "apps/{web,mobile}/**", "apps/{web,mobile}/*",
        "{apps/*,packages/*}", "{packages/*,apps/*}", "{apps/web,packages/blog}",
        "apps/{web,web,mobile}", "apps/{web,{mobile,.hidden}}", "apps/{,web}/pages",
        "apps/site{1..3}", "apps/site{3..1}", "apps/site{1..3..2}", "apps/{web,site1}",
        "apps/{web*,site*}", "apps/?(web|mobile)", "apps/+(web|mobile)",
        "apps/*(web|mobile)", "apps/(web|mobile)", "apps/[!w]*", "apps/[!w]*/**",
        "apps/.*", "apps/.hidden/**", "apps/web-alias", "apps/web-alias/**",
        "apps/broken", "apps/broken/**", "apps/paren(site)", "apps/{literal}",
        "{,apps/web}", "{.,apps/web}", "{apps/web,apps/*}", "{apps/*,apps/web}",
        "{apps/*,**/pages}", "../*/pages", "./../external-site", "apps/../apps/*",
        "**", "**/", "**/pages", "./**/pages", "apps/**/public/**",
        "!apps/*", "!!apps/web", "apps/{malformed,", "apps/@(malformed",
        "{apps/*,!apps/mobile}", "{apps/**,!apps/web/**}", "{apps/**,!apps/.hidden}",
        "{apps/web,!apps/web}", "{apps/web,../external-site}",
        "{../external-site,apps/web}", "{./apps/web,../external-site}",
        "{packages/blog,apps/web,packages/store}", "{apps/mobile,packages/blog,apps/web}",
        "{./apps/*,../external-site/*}", "{apps/**,!apps/**/pages}",
        "ranges/app{01..03}", "apps/{web,,mobile}", "apps/{web,web}/*",
        "ranges/app{03..01}", "ranges/app{01..03..2}", "letters/app{a..c}",
        "letters/app{c..a}", "letters/app{a..c..2}",
      ].map((rootDir) => ({ name: rootDir || "empty-pattern", rootDir })),
      { name: "absolute-literal", rootDir: path.join(cwd, "apps/web") },
      { name: "absolute-glob", rootDir: `${cwd}/apps/*` },
      { name: "array", rootDir: ["apps/*", "packages/*"] },
      { name: "array-preserves-duplicates", rootDir: ["apps/web", "apps/web"] },
      { name: "array-negative-is-separate", rootDir: ["apps/*", "!apps/mobile"] },
      { name: "array-nonstrings", rootDir: [false, null, 1, "apps/web"] },
      { name: "empty-array", rootDir: [] },
      { name: "nonstring", rootDir: 1 },
    ];
    const candidate = candidateRoot
      ? path.join(candidateRoot, "dist/utils/get-root-dirs.js")
      : require.resolve("@next/eslint-plugin-next/dist/utils/get-root-dirs.js");
    const reference = referenceRoot && path.join(referenceRoot, "dist/utils/get-root-dirs.js");
    if (adversarial) {
      if (reference) throw new Error("Do not run the vulnerable original on adversarial input");
      mkdirSync(path.join(cwd, "cycle"));
      symlinkSync(".", path.join(cwd, "cycle/self"), "dir");
      cases.splice(0, cases.length, ...[
        ["nesting", "{".repeat(2000) + "a,b" + "}".repeat(2000)],
        ["expansion", "{a,b}".repeat(100)],
        ["length", "x".repeat(10001)],
        ["rewrite", "{a}" + "}".repeat(3000) + ",z}"],
        ["cycle", "cycle/**"],
      ].map(([name, rootDir]) => ({ name, rootDir })));
    }
    const child = `
      const input = JSON.parse(process.argv[1]);
      console.warn = () => {};
      const {Linter} = require(input.eslint);
      const modules = input.modules.map(p => ({
        getRootDirs:require(p).getRootDirs,
        plugin:require(require('node:path').join(require('node:path').dirname(p),'../index.js'))
      }));
      const rows = input.cases.map(c => ({name:c.name, results:modules.map(fn => {
        try {
          const settings={next:{rootDir:c.rootDir}};
          const roots=fn.getRootDirs({cwd:process.cwd(),settings});
          const messages=new Linter({cwd:process.cwd()}).verify(
            'const Page=()=> <><a href="/contact">Contact</a><a href="https://example.org">External</a><a href="/not-a-page">Missing</a></>;',
            [{languageOptions:{parserOptions:{ecmaFeatures:{jsx:true}}},settings,
              plugins:{'@next/next':fn.plugin},rules:{'@next/next/no-html-link-for-pages':'error'}}],
            {filename:'component.js'}
          ).map(({ruleId,severity,message,line,column})=>({ruleId,severity,message,line,column}));
          return { roots, messages };
        }
        catch(e) { return { error:{name:e.name,message:e.message} }; }
      })}));
      process.stdout.write(JSON.stringify(rows));
    `;
    const processResult = spawnSync(process.execPath, ["-e", child, JSON.stringify({
      modules: reference ? [reference, candidate] : [candidate], cases, eslint:require.resolve('eslint'),
    })], { cwd, encoding: "utf8", timeout: 15000, maxBuffer: 2 * 1024 * 1024 });
    if (processResult.status !== 0) throw new Error(processResult.stderr || String(processResult.error));
    const rows = JSON.parse(processResult.stdout.replaceAll(cwd, "$CWD"));
    return { rows, comparedAgainstOriginal: Boolean(reference),
      differences: reference ? rows.filter(row => JSON.stringify(row.results[0]) !== JSON.stringify(row.results[1])) : [] };
  } finally {
    // Only the exact proof-owned mkdtemp directory is removed.
    rmSync(fixture, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runRootDirectoryCompatibility(process.argv[2] === "--adversarial"
    ? { adversarial: true } : { referenceRoot: process.argv[2], candidateRoot: process.argv[3] });
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  if (result.differences.length) process.exitCode = 1;
}
