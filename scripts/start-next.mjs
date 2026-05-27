#!/usr/bin/env node
// scripts/start-next.mjs
//
// Cross-platform launcher for `next start`.
//
// Why this file exists:
//   The previous package.json `start` script used POSIX shell
//   parameter-expansion (`next start -p ${PORT:-3000}`) so that Hostinger's
//   Node panel could inject a custom $PORT. That string is valid only in
//   bash/zsh; on Windows PowerShell or cmd.exe the literal `${PORT:-3000}`
//   reaches `next start` as the port argument, Next can't parse it as a
//   number, and the process exits with an error.
//
// What this file does:
//   1. Reads PORT from the environment (Hostinger / Vercel / etc. inject it).
//   2. Falls back to 3000 if PORT is empty or not a positive integer.
//   3. Spawns `next start -p <port>` using the local node_modules binary,
//      inheriting stdio so logs stream straight through.
//   4. Exits with the same exit code as the child — so PM2 / Hostinger's
//      Node runner see the right success/failure signal.
//
// Behaviour matches bash's `${PORT:-3000}` (use the variable unless it's
// missing / empty) and adds basic input sanity (rejects non-numeric ports,
// rejects port 0, rejects > 65535). Anything weird falls back to 3000
// instead of crashing — friendlier than the bash original.

import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

/** Resolve the port to use. */
function resolvePort() {
  const raw = process.env.PORT?.trim();
  if (!raw) return 3000;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0 || n > 65535) {
    console.warn(
      `[start-next] PORT="${raw}" is not a valid port; falling back to 3000.`,
    );
    return 3000;
  }
  return n;
}

/** Path to the local Next CLI binary, with .cmd suffix on Windows. */
function resolveNextBin() {
  const binDir = path.join(PROJECT_ROOT, "node_modules", ".bin");
  return process.platform === "win32"
    ? path.join(binDir, "next.cmd")
    : path.join(binDir, "next");
}

const port = resolvePort();
const nextBin = resolveNextBin();

console.log(`[start-next] launching: ${nextBin} start -p ${port}`);

const child = spawn(nextBin, ["start", "-p", String(port)], {
  cwd: PROJECT_ROOT,
  stdio: "inherit",
  // Windows .cmd shims require shell:true to be invokable through spawn;
  // on POSIX the binary is a real executable, so shell:false is safer.
  shell: process.platform === "win32",
  env: process.env,
});

// Forward common termination signals so PM2/systemd shutdown stays clean.
const forward = (sig) => () => {
  if (!child.killed) child.kill(sig);
};
process.on("SIGINT", forward("SIGINT"));
process.on("SIGTERM", forward("SIGTERM"));
process.on("SIGHUP", forward("SIGHUP"));

child.on("exit", (code, signal) => {
  if (signal) {
    // Mirror the child's signal exit by re-raising on ourselves where possible,
    // falling back to a non-zero exit code otherwise.
    process.exit(typeof code === "number" ? code : 1);
  }
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  console.error("[start-next] failed to launch next:", err);
  process.exit(1);
});
