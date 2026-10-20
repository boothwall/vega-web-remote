const HOLD_MS = 600;
const LIT_MS = 1200;
const NAMES = {
  up: "Up", down: "Down", left: "Left", right: "Right", ok: "OK", back: "Back", home: "Home", menu: "Menu",
  playpause: "Play/pause", rewind: "Rewind", fastforward: "Fast-forward", previous: "Previous", next: "Next",
};
const SHORTCUTS = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", Enter: "ok",
  Backspace: "back", Escape: "home", m: "menu", M: "menu", " ": "playpause", "[": "previous", "]": "next",
};
const TEXT = /^[A-Za-z0-9 @._-]{1,64}$/;

const $ = (selector) => document.querySelector(selector);
const picker = $("#device");
const line = $("#line");
const toast = $("#toast");
const sheet = $("#keys");
const ok = $(".ok");
const input = $("#text");

let latest = 0;
let unlit = 0;
let retry = null;

const device = () => picker.value;
const setState = (state) => (document.body.dataset.state = state);

function setEnabled(on) {
  document.querySelectorAll("[data-key], #type button").forEach((b) => (b.disabled = !on));
  input.disabled = !on;
  picker.disabled = !on;
}

function showToast(message, again) {
  $("#toast-text").textContent = message;
  retry = again;
  toast.hidden = false;
}

async function loadDevices() {
  setState("loading");
  setEnabled(false);
  toast.hidden = true;
  picker.replaceChildren(new Option("Searching…"));
  line.textContent = "Looking for devices…";
  const list = await fetch("/devices").then((r) => (r.ok ? r.json() : [])).catch(() => null);
  if (list === null) {
    picker.replaceChildren(new Option("No device"));
    setState("error");
    line.textContent = "The remote's server isn't running";
    return showToast("Can't reach the remote's server. Is vega-web-remote still running?", loadDevices);
  }
  if (!list.length) {
    picker.replaceChildren(new Option("No device"));
    line.textContent = "No device found";
    return setState("empty");
  }
  const previous = device();
  picker.replaceChildren(...list.map((name) => new Option(name, name)));
  if (list.includes(previous)) picker.value = previous;
  setEnabled(true);
  setState("idle");
  line.textContent = "Ready";
}

/** Sends one action and reports it in the status line, the LED and, on failure, a toast. */
async function send({ label, state = "pressed", request, button }) {
  const id = ++latest;
  const name = device();
  const started = performance.now();
  button?.classList.add("is-pressed");
  navigator.vibrate?.(10);
  const res = await request(name).catch(() => null);
  const ms = Math.round(performance.now() - started);
  setTimeout(() => button?.classList.remove("is-pressed"), Math.max(0, 160 - ms));
  if (id !== latest) return res?.ok;
  ok.classList.remove("is-holding");
  ok.style.setProperty("--hold", 0);
  const again = () => send({ label, state, request, button });
  if (res?.ok) {
    toast.hidden = true;
    setState(state);
    line.textContent = `${label} · ${ms} ms`;
    clearTimeout(unlit);
    unlit = setTimeout(() => id === latest && setState("idle"), LIT_MS);
    return true;
  }
  setState("error");
  if (!res) {
    line.textContent = "The remote's server isn't running";
    showToast("Can't reach the remote's server. Is vega-web-remote still running?", again);
  } else if (res.status === 400) {
    line.textContent = `${name} isn't listed any more`;
    showToast(`${name} isn't in vega device list any more.`, loadDevices);
  } else {
    line.textContent = `${name} didn't respond`;
    showToast(`${name} didn't respond. Is it still running?`, again);
  }
  return false;
}

function press(key, hold = "short", button = document.querySelector(`[data-key="${key}"]${hold === "long" ? "[data-hold]" : ":not([data-hold])"}`)) {
  if (button?.disabled) return;
  const label = hold === "long" ? "OK held" : NAMES[key];
  const url = (name) => `/press/${key}?hold=${hold}&device=${encodeURIComponent(name)}`;
  if (hold === "long") {
    setState("hold");
    line.textContent = "Holding OK…";
  }
  return send({ label, request: (name) => fetch(url(name), { method: "POST" }), button });
}

// OK: a tap is a short press; holding it for HOLD_MS fills the ring and sends a long press.
let holdStart = 0;
let holdFrame = 0;
const stopHold = () => {
  cancelAnimationFrame(holdFrame);
  holdStart = 0;
};
ok.addEventListener("pointerdown", (event) => {
  if (ok.disabled || event.button !== 0) return;
  ok.setPointerCapture?.(event.pointerId);
  holdStart = performance.now();
  ok.classList.add("is-holding");
  const tick = () => {
    const progress = Math.min(1, (performance.now() - holdStart) / HOLD_MS);
    ok.style.setProperty("--hold", progress);
    if (progress >= 0.25 && document.body.dataset.state !== "hold") {
      setState("hold");
      line.textContent = "Holding OK…";
    }
    if (progress < 1) holdFrame = requestAnimationFrame(tick);
    else {
      stopHold();
      press("ok", "long", ok);
    }
  };
  holdFrame = requestAnimationFrame(tick);
});
ok.addEventListener("pointerup", () => {
  if (!holdStart) return;
  stopHold();
  ok.classList.remove("is-holding");
  ok.style.setProperty("--hold", 0);
  press("ok");
});
ok.addEventListener("pointercancel", () => {
  stopHold();
  ok.classList.remove("is-holding");
  ok.style.setProperty("--hold", 0);
  if (document.body.dataset.state === "hold") {
    setState("idle");
    line.textContent = "Ready";
  }
});
ok.addEventListener("contextmenu", (event) => event.preventDefault());

document.querySelectorAll("[data-key]").forEach((button) =>
  button.addEventListener("click", (event) => {
    // Pointer presses on OK are handled above; this is for assistive tech and other synthetic clicks.
    if (button === ok && event.detail !== 0) return;
    press(button.dataset.key, button.dataset.hold ?? "short");
  }),
);

$("#type").addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value;
  if (!TEXT.test(text)) {
    line.textContent = "Letters, digits, space and @ . _ - only, up to 64";
    return input.focus();
  }
  const sent = await send({
    label: `Typed “${text}”`,
    state: "text",
    request: (name) => fetch(`/text?device=${encodeURIComponent(name)}`, { method: "POST", body: text }),
  });
  if (sent) input.value = "";
});

picker.addEventListener("change", () => {
  picker.blur();
  line.textContent = "Ready";
});
$("#again").addEventListener("click", loadDevices);
$("#retry").addEventListener("click", () => {
  toast.hidden = true;
  retry?.();
});
$("#help").addEventListener("click", () => sheet.showModal());

addEventListener("keydown", (event) => {
  if (sheet.open || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
  if (event.key === "?") {
    event.preventDefault();
    return sheet.showModal();
  }
  const key = SHORTCUTS[event.key];
  if (!key) return;
  event.preventDefault();
  press(key, key === "ok" && event.shiftKey ? "long" : "short");
});

loadDevices();
