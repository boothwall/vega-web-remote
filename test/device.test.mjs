import assert from "node:assert/strict";
import { test } from "node:test";

import { cached, parseDevices } from "../src/device.mjs";

test("reads device names from `vega device list`", () => {
  const output = `Found the following devices:
VirtualDevice : tv - aarch64 - OS - amazon-116d907db50ada5d
G4N1AB2345 : tv - armv7 - OS - amazon-0123456789abcdef
`;
  assert.deepEqual(parseDevices(output), ["VirtualDevice", "G4N1AB2345"]);
  assert.deepEqual(parseDevices("No devices found"), []);
});

test("lists devices once per time window", async () => {
  let calls = 0;
  let clock = 0;
  const devices = cached(async () => [`device-${++calls}`], 1000, () => clock);
  assert.deepEqual(await devices(), ["device-1"]);
  clock = 900;
  assert.deepEqual(await devices(), ["device-1"]);
  clock = 2000;
  assert.deepEqual(await devices(), ["device-2"]);
});
