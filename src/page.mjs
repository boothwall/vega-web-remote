export const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vega web remote</title>
<style>
  :root { color-scheme: dark; --accent:#ff9900; --line:rgb(255 255 255/.14); --pad:rgb(255 255 255/.06); }
  * { box-sizing:border-box; }
  body { margin:0; min-height:100dvh; display:grid; place-items:center; background:#0b0d12; color:#fff;
         font:600 15px/1.4 ui-sans-serif,system-ui,sans-serif; }
  main { display:grid; gap:20px; justify-items:center; padding:24px; width:min(360px,100%); }
  header { display:flex; gap:10px; align-items:center; width:100%; justify-content:space-between; }
  h1 { margin:0; font-size:18px; }
  select, input { background:var(--pad); color:#fff; border:1px solid var(--line); border-radius:10px;
                  padding:8px 10px; font:inherit; }
  .pad { position:relative; width:250px; height:250px; border-radius:50%; border:1px solid var(--line);
         background:var(--pad); }
  button { border:0; cursor:pointer; color:#fff; background:transparent; font:inherit; border-radius:999px; }
  button:active { transform:scale(.95); }
  button.sent { outline:2px solid var(--accent); }
  .arrow { position:absolute; width:60px; height:60px; font-size:26px; }
  .up { top:6px; left:95px } .down { bottom:6px; left:95px } .left { left:6px; top:95px } .right { right:6px; top:95px }
  .ok { position:absolute; inset:68px; background:var(--accent); color:#111; font-size:20px; }
  .row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; width:100%; }
  .row button { height:52px; border:1px solid var(--line); background:var(--pad); font-size:19px; }
  form { display:flex; gap:8px; width:100%; } form input { flex:1; }
  .send { padding:0 16px; border:1px solid var(--line); background:var(--pad); border-radius:10px; }
  p { margin:0; color:#8a8fa3; font-size:12px; text-align:center; }
  #status { min-height:18px; color:#ff8a80; }
</style></head><body><main>
  <header><h1>Vega web remote</h1><select id="device" aria-label="Device"></select></header>
  <div class="pad">
    <button class="arrow up" data-key="up" aria-label="Up">▲</button>
    <button class="arrow left" data-key="left" aria-label="Left">◀</button>
    <button class="ok" data-key="ok">OK</button>
    <button class="arrow right" data-key="right" aria-label="Right">▶</button>
    <button class="arrow down" data-key="down" aria-label="Down">▼</button>
  </div>
  <div class="row">
    <button data-key="back" aria-label="Back">↩</button>
    <button data-key="home" aria-label="Home">⌂</button>
    <button data-key="menu" aria-label="Menu">☰</button>
    <button data-key="ok" data-hold="long" aria-label="Hold OK">OK⋯</button>
  </div>
  <div class="row">
    <button data-key="previous" aria-label="Previous">⏮</button>
    <button data-key="rewind" aria-label="Rewind">⏪</button>
    <button data-key="playpause" aria-label="Play or pause">⏯</button>
    <button data-key="fastforward" aria-label="Fast forward">⏩</button>
  </div>
  <div class="row"><button data-key="next" aria-label="Next" style="grid-column:4">⏭</button></div>
  <form id="type"><input name="text" maxlength="64" placeholder="Type on the device" autocomplete="off"><button class="send" type="submit" aria-label="Send text">⏎</button></form>
  <p>Keyboard: arrows, Enter (Shift+Enter holds), Backspace, Escape (Home), M (Menu), Space, [ and ]</p>
  <p id="status" role="status"></p>
</main><script>
  const deviceSelect = document.getElementById("device");
  const status = document.getElementById("status");
  const device = () => encodeURIComponent(deviceSelect.value);
  const report = (ok) => { status.textContent = ok ? "" : "Couldn't reach the device. Is it running in developer mode?"; };

  fetch("/devices").then((r) => r.json()).then((list) => {
    deviceSelect.replaceChildren(...list.map((name) => new Option(name, name)));
    if (!list.length) status.textContent = "No device found. Start the Virtual Device or connect a Fire TV.";
  });

  async function press(key, hold = "short") {
    const button = document.querySelector('[data-key="' + key + '"]' + (hold === "long" ? '[data-hold]' : ':not([data-hold])'));
    button?.classList.add("sent");
    const res = await fetch("/press/" + key + "?hold=" + hold + "&device=" + device(), { method: "POST" }).catch(() => null);
    button?.classList.remove("sent");
    report(res?.ok);
  }

  document.querySelectorAll("[data-key]").forEach((b) =>
    b.addEventListener("click", () => press(b.dataset.key, b.dataset.hold ?? "short")));

  document.getElementById("type").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = event.target.elements.text;
    const res = await fetch("/text?device=" + device(), { method: "POST", body: input.value }).catch(() => null);
    report(res?.ok);
    if (res?.ok) input.value = "";
  });

  const map = { ArrowUp:"up", ArrowDown:"down", ArrowLeft:"left", ArrowRight:"right", Enter:"ok",
                Backspace:"back", Escape:"home", m:"menu", " ":"playpause", "[":"previous", "]":"next" };
  addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || !map[event.key]) return;
    event.preventDefault();
    press(map[event.key], event.key === "Enter" && event.shiftKey ? "long" : "short");
  });
</script></body></html>`;
