import assert from "node:assert/strict";
import { request } from "node:http";
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

/** A raw request, so the test can set Host and Origin the way a browser would. */
const raw = (path, headers) =>
  new Promise((resolve, reject) =>
    request(base + path, { method: "POST", headers }, (res) => resolve(res.statusCode))
      .on("error", reject)
      .end(),
  );

test("refuses presses from other sites and other hostnames", async () => {
  const port = new URL(base).port;
  const path = "/press/home?device=VirtualDevice";
  assert.equal(await raw(path, { origin: "https://example.com" }), 403);
  assert.equal(await raw(path, { origin: "null" }), 403);
  assert.equal(await raw(path, { host: `rebound.example.com:${port}` }), 403);
  assert.deepEqual(sent, []);
  assert.equal(await raw(path, { host: `localhost:${port}`, origin: `http://localhost:${port}` }), 204);
  assert.deepEqual(sent.splice(0), [["VirtualDevice", "inputd-cli button_press KEY_HOMEPAGE short"]]);
});

test("answers 502 and keeps serving when the device list fails", async () => {
  const broken = createRemoteServer({
    run: async () => assert.fail("nothing should run"),
    devices: async () => {
      throw new Error("spawn vega ENOENT");
    },
  });
  await new Promise((resolve) => broken.listen(0, "127.0.0.1", resolve));
  const at = `http://127.0.0.1:${broken.address().port}`;
  try {
    assert.equal((await fetch(at + "/press/ok?device=VirtualDevice", { method: "POST" })).status, 502);
    assert.deepEqual(await (await fetch(at + "/devices")).json(), []);
    assert.equal((await fetch(at + "/")).status, 200);
  } finally {
    broken.close();
  }
});
