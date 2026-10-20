import assert from "node:assert/strict";
import { test } from "node:test";

import { KEYS } from "../src/keys.mjs";
import { page } from "../src/page.mjs";

test("the page inlines its styles and script", () => {
  assert.doesNotMatch(page, /\/\*css\*\/|\/\*js\*\//);
  assert.match(page, /--led-press/);
  assert.match(page, /loadDevices\(\);/);
});

test("every button the server accepts is on the page", () => {
  for (const name of Object.keys(KEYS)) assert.match(page, new RegExp(`data-key="${name}"`), name);
});

test("the footer links to BoothWall in a new tab, without an opener, under one label", () => {
  assert.match(page, /<a href="https:\/\/oss\.boothwall\.com" target="_blank" rel="noopener" aria-label="Built while making BoothWall, a live photo wall for Fire TV">/);
});
