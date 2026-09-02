import { createServerFn } from "@tanstack/react-start";

// The passcode lives only in this server-only module. Because this file is
// imported by a `createServerFn` handler, its source (including the string
// below) is never included in the client JS bundle — unlike a plain
// client-side `if (pass === "admin123")` check, which ships the secret to
// every browser and can be read straight out of devtools.
//
// This is still a demo-grade check (single shared passcode, no sessions,
// no rate limiting) — swap in real auth before this ever holds real data.
const ADMIN_PASSCODE = "admin123";

export const checkAdminPasscode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (typeof data !== "object" || data === null || !("passcode" in data)) {
      throw new Error("Missing passcode");
    }
    const { passcode } = data as { passcode: unknown };
    if (typeof passcode !== "string") {
      throw new Error("Passcode must be a string");
    }
    return { passcode };
  })
  .handler(async ({ data }) => {
    return { ok: data.passcode === ADMIN_PASSCODE };
  });
