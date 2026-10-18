import assert from "node:assert/strict";
import { test } from "node:test";

import { pressCommand, textCommand } from "../src/keys.mjs";

test("builds button presses only for known buttons and holds", () => {
  assert.equal(pressCommand("ok"), "inputd-cli button_press KEY_ENTER short");
  assert.equal(pressCommand("ok", "long"), "inputd-cli button_press KEY_ENTER long");
  assert.equal(pressCommand("next"), "inputd-cli button_press KEY_NEXTSONG short");
  for (const [name, hold] of [["power", "short"], ["toString", "short"], ["ok", "superLong"]])
    assert.equal(pressCommand(name, hold), null);
});

test("types only plain text, quoted for the device shell", () => {
  assert.equal(textCommand("hello world"), "inputd-cli send_text 'hello world'");
  for (const text of ["", "x'; reboot", "$(id)", "a`b`", "line\nbreak", "x".repeat(65), 42])
    assert.equal(textCommand(text), null);
});
