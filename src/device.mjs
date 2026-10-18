import { execFile } from "node:child_process";

const TIMEOUT_MS = 15_000;

function vega(cli, args) {
  return new Promise((resolve, reject) =>
    execFile(cli, args, { timeout: TIMEOUT_MS }, (error, stdout, stderr) =>
      error ? reject(new Error((stderr || error.message).trim())) : resolve(stdout),
    ),
  );
}

/** Devices `vega device list` reports, by name (e.g. VirtualDevice or a Fire TV serial). */
export function parseDevices(output) {
  return output
    .split("\n")
    .map((line) => line.match(/^(\S+) : /)?.[1])
    .filter(Boolean);
}

export const listDevices = (cli) => vega(cli, ["device", "list"]).then(parseDevices);

/** Remembers `load()`'s answer for `ttlMs`, so a burst of presses lists devices once. */
export function cached(load, ttlMs, now = Date.now) {
  let value = null;
  let at = -Infinity;
  return async () => {
    if (value === null || now() - at > ttlMs) {
      value = await load();
      at = now();
    }
    return value;
  };
}

/** Runs an inputd-cli command on the device. Arguments go straight to execFile, never a shell. */
export const runOnDevice = (cli, device, command) =>
  vega(cli, ["device", "run-cmd", "--device", device, "--command", command]);
