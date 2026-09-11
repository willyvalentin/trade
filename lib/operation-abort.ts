export class OperationAbortedError extends Error {
  constructor(message = "Operation stopped because its time budget was exhausted.") {
    super(message);
    this.name = "OperationAbortedError";
  }
}

export function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new OperationAbortedError();
  }
}

export function waitForAbortableDelay(ms: number, signal?: AbortSignal) {
  throwIfAborted(signal);

  if (!signal) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new OperationAbortedError());
    };

    signal.addEventListener("abort", onAbort, { once: true });
  });
}
