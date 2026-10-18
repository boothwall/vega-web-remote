import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { createRemoteServer } from "../src/server.mjs";

const sent = [];
let failNext = false;
const server = createRemoteServer({
  run: async (device, command) => {
    if (failNext) {
      failNext = false;
      throw new Error("device offline");
    }
    sent.push([device, command]);
  },
  devices: async () => ["VirtualDevice"],
});
let base;

before(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const post = (path, body) => fetch(base + path, { method: "POST", body });

test("presses a known button on a listed device", async () => {
  assert.equal((await post("/press/right?device=VirtualDevice")).status, 204);
  assert.equal((await post("/press/ok?device=VirtualDevice&hold=long")).status, 204);
  assert.deepEqual(sent.splice(0), [
    ["VirtualDevice", "inputd-cli button_press KEY_RIGHT short"],
    ["VirtualDevice", "inputd-cli button_press KEY_ENTER long"],
  ]);
});

test("refuses unknown buttons, holds, devices and unsafe text", async () => {
  for (const path of [
    "/press/power?device=VirtualDevice",
    "/press/ok?device=VirtualDevice&hold=forever",
    "/press/ok?device=Other",
  ])
    assert.equal((await post(path)).status, 400);
  assert.equal((await post("/text?device=VirtualDevice", "x'; reboot")).status, 400);
  assert.deepEqual(sent, []);
});

test("types text and reports a device failure as 502", async () => {
  assert.equal((await post("/text?device=VirtualDevice", "hello")).status, 204);
  assert.deepEqual(sent.splice(0), [["VirtualDevice", "inputd-cli send_text 'hello'"]]);
  failNext = true;
  assert.equal((await post("/press/back?device=VirtualDevice")).status, 502);
});

test("serves the page and the device list", async () => {
  const page = await fetch(base + "/");
  assert.match(await page.text(), /Vega web remote/);
  assert.deepEqual(await (await fetch(base + "/devices")).json(), ["VirtualDevice"]);
  assert.equal((await fetch(base + "/elsewhere")).status, 404);
});
