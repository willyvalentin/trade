import { dirname, resolve } from "node:path";

export const SYNTHETIC_ROOT_V2 = "/synthetic-action-661j5n2a-root";
export const SYNTHETIC_RELATIVE_PATH_V2 =
  "docs/recovery/action-661j5r10/final-freeze-manifest.json";

function providerError(code, message = "provider-controlled-secret-message") {
  const error = new Error(message);
  error.code = code;
  return error;
}

function stat({
  ctimeNs = 1_000_000n,
  dev = 7n,
  ino,
  kind,
  mode = kind === "regular" ? 33188n : 16877n,
  mtimeNs = 1_000_000n,
  size = 0n,
}) {
  return {
    ctimeMs: ctimeNs / 1_000_000n,
    ctimeNs,
    dev,
    ino,
    isDirectory: () => kind === "directory",
    isFile: () => kind === "regular",
    isSymbolicLink: () => kind === "symlink",
    mode,
    mtimeMs: mtimeNs / 1_000_000n,
    mtimeNs,
    size,
  };
}

export function createSyntheticDescriptorProviderV2(options = {}) {
  const bytes = Buffer.from(options.bytes ?? "synthetic-certified-bytes");
  const absoluteFile = resolve(SYNTHETIC_ROOT_V2, SYNTHETIC_RELATIVE_PATH_V2);
  const paths = [SYNTHETIC_ROOT_V2];
  let current = absoluteFile;
  const ancestors = [];
  while (current !== SYNTHETIC_ROOT_V2) {
    ancestors.push(current);
    current = dirname(current);
  }
  paths.push(...ancestors.reverse());
  const identities = new Map();
  for (let index = 0; index < paths.length; index += 1) {
    const path = paths[index];
    identities.set(path, stat({
      ino: BigInt(100 + index),
      kind: path === absoluteFile ? "regular" : "directory",
      size: path === absoluteFile ? BigInt(bytes.length) : 0n,
    }));
  }

  const tracking = {
    close_attempts: 0,
    descriptors: new Set(),
    double_close_attempts: 0,
    fstat_calls: 0,
    lstat_calls: new Map(),
    open_calls: 0,
    read_calls: 0,
    read_started: false,
    replacement_after_open: false,
  };
  const descriptor = 41;
  let opened = false;

  function maybeThrow(stage) {
    if (options.provider_error_stage === stage) {
      throw providerError(options.provider_error_code ?? "EIO");
    }
  }

  const provider = Object.freeze({
    close(value) {
      tracking.close_attempts += 1;
      maybeThrow("close");
      if (!tracking.descriptors.has(value)) {
        tracking.double_close_attempts += 1;
        throw providerError("EBADF");
      }
      tracking.descriptors.delete(value);
    },
    fstat(value) {
      tracking.fstat_calls += 1;
      maybeThrow(tracking.fstat_calls === 1 ? "descriptor_fstat" : "post_read_fstat");
      if (!tracking.descriptors.has(value)) throw providerError("EBADF");
      const base = identities.get(absoluteFile);
      if (options.descriptor_inode_drift && tracking.fstat_calls === 1) {
        return { ...base, ino: base.ino + 1n };
      }
      if (options.post_read_mutation && tracking.fstat_calls > 1) {
        const sizeDelta = options.post_read_mutation === "truncate" ? -1n : 1n;
        return {
          ...base,
          ctimeNs: base.ctimeNs + 1n,
          mtimeNs: base.mtimeNs + 1n,
          size: base.size + sizeDelta,
        };
      }
      return base;
    },
    lstat(path) {
      const count = (tracking.lstat_calls.get(path) ?? 0) + 1;
      tracking.lstat_calls.set(path, count);
      if (path === SYNTHETIC_ROOT_V2 && count === 1) maybeThrow("root_validation");
      if (path !== SYNTHETIC_ROOT_V2) maybeThrow("lstat");
      const base = identities.get(path);
      if (!base) throw providerError("ENOENT");
      if (
        options.ancestor_swap &&
        opened &&
        path === resolve(SYNTHETIC_ROOT_V2, "docs")
      ) return { ...base, ino: base.ino + 50n };
      if (options.final_path_swap && opened && path === absoluteFile) {
        return { ...base, ino: base.ino + 50n };
      }
      return base;
    },
    nofollow_flag: 131072,
    open(path) {
      tracking.open_calls += 1;
      maybeThrow("open");
      if (options.swap_to_symlink_before_open) throw providerError("ELOOP");
      if (path !== absoluteFile) throw providerError("ENOENT");
      opened = true;
      tracking.descriptors.add(descriptor);
      return descriptor;
    },
    readonly_flag: 0,
    read(value, target, offset, length, position) {
      tracking.read_calls += 1;
      tracking.read_started = true;
      maybeThrow("descriptor_read");
      if (!tracking.descriptors.has(value)) throw providerError("EBADF");
      if (options.replace_after_open) tracking.replacement_after_open = true;
      const count = Math.min(length, bytes.length - position);
      if (count <= 0) return 0;
      bytes.copy(target, offset, position, position + count);
      return count;
    },
    realpath(path) {
      maybeThrow("root_validation");
      return options.root_alias ? `${path}/alias` : path;
    },
  });

  return Object.freeze({
    bytes,
    provider,
    relative_path: SYNTHETIC_RELATIVE_PATH_V2,
    repository_root: SYNTHETIC_ROOT_V2,
    tracking,
  });
}
