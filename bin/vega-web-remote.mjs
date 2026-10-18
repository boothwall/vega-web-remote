#!/usr/bin/env node
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { cached, listDevices, runOnDevice } from "../src/device.mjs";
import { createRemoteServer } from "../src/server.mjs";

const HELP = `Usage: vega-web-remote [--port 4400] [--vega <path to the vega CLI>]

A remote control for the Vega Virtual Device and Fire TV devices in developer mode,
in your browser. Serves on localhost only.`;

const { values } = parseArgs({
  options: {
    port: { type: "string", default: "4400" },
    vega: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help) {
  console.info(HELP);
  process.exit(0);
}

const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Not a port: ${values.port}`);
  process.exit(1);
}

const installed = join(homedir(), "vega", "bin", "vega");
const cli = values.vega ?? (existsSync(installed) ? installed : "vega");

createRemoteServer({
  run: (device, command) => runOnDevice(cli, device, command),
  devices: cached(() => listDevices(cli), 10_000),
}).listen(port, "127.0.0.1", () => console.info(`Vega web remote: http://localhost:${port}`));
