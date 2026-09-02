let lastCapturedError: unknown = null;

if (typeof process !== "undefined") {
  process.on?.("uncaughtException", (err) => {
    lastCapturedError = err;
  });
  process.on?.("unhandledRejection", (err) => {
    lastCapturedError = err;
  });
}

export function consumeLastCapturedError(): unknown {
  const err = lastCapturedError;
  lastCapturedError = null;
  return err;
}
