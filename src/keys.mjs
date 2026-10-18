/** Remote buttons by name, as inputd-cli knows them. Nothing else ever reaches the device. */
export const KEYS = Object.freeze({
  up: "KEY_UP",
  down: "KEY_DOWN",
  left: "KEY_LEFT",
  right: "KEY_RIGHT",
  ok: "KEY_ENTER",
  back: "KEY_BACK",
  home: "KEY_HOMEPAGE",
  menu: "KEY_MENU",
  playpause: "KEY_PLAYPAUSE",
  rewind: "KEY_REWIND",
  fastforward: "KEY_FASTFORWARD",
  previous: "KEY_PREVIOUSSONG",
  next: "KEY_NEXTSONG",
});

export const HOLDS = Object.freeze(["short", "long"]);

const TEXT = /^[A-Za-z0-9 @._-]{1,64}$/;

/** The inputd-cli command for a button press, or null for an unknown button or hold. */
export function pressCommand(name, hold = "short") {
  const key = Object.hasOwn(KEYS, name) ? KEYS[name] : null;
  if (!key || !HOLDS.includes(hold)) return null;
  return `inputd-cli button_press ${key} ${hold}`;
}

/**
 * The inputd-cli command that types `text`, or null. The device runs it through a shell, so only
 * plain characters pass and the text goes in single quotes.
 */
export function textCommand(text) {
  return typeof text === "string" && TEXT.test(text) ? `inputd-cli send_text '${text}'` : null;
}
