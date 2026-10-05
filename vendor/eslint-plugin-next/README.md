# Ture-maintained Next lint plugin

This is a local MIT-licensed derivative, not an official Next.js release.
The source is exactly the published `@next/eslint-plugin-next@16.3.8` artifact,
retained with its SHA-512 integrity in PROVENANCE.json. All dist files except
`utils/get-root-dirs.js` retain their upstream bytes, including every rule,
severity, configuration, export and type declaration.

The sole behavior change replaces root-directory acquisition with an explicit
bounded filesystem adapter and pinned picomatch, glob-parent and brace-expansion
(a different, audited package from braces). The actual vulnerable
fast-glob / micromatch / braces chain is removed, not renamed or omitted from
the audit. No install-time patch or network-fetched moving branch is used.
The ordinary full npm audit and protected release requirements remain active.

The derivative is a direct local file dev dependency. The npm override references
that dependency so both direct consumers and eslint-config-next resolve it from
the repository root, not relative to the dependent package's installation path.
The upstream Next application and eslint-config-next versions remain 16.3.8.
The root lint config ignores only this compiled third-party dist directory;
application lint rules remain unchanged.

The native consumer baseline was captured from the integrity-verified original
at the real CLI working directory, not an import-time cwd mock. It covers 103
root settings and their actual ESLint internal-link diagnostics. Malformed
ordinary patterns retain their original behavior. Deliberately abusive input
fails the lint invocation explicitly: at most 10,000 pattern characters,
100 nested delimiters, 1,000 delimiters, 1,000 expanded patterns and 100,000
filesystem entries per glob. A directory-symlink cycle also fails explicitly.
No partial root list or silently truncated expansion is accepted.

The adapter's task classification and traversal compatibility follow fast-glob's
MIT-licensed behavior. Its Denis Malinochkin copyright/permission notice is
retained in LICENSE-FAST-GLOB; the fast-glob package itself is not installed.

Maintain this only until an official compatible package passes the original
root-directory and complete release acceptance. Then remove the override and
this directory in one reviewed change. Do not publish this package to npm.
