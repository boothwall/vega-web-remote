import { createServer } from "node:http";

import { pressCommand, textCommand } from "./keys.mjs";
import { page } from "./page.mjs";

const MAX_BODY = 1024;
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Whether the request comes from this page on this machine. The Host check stops DNS rebinding;
 * the Origin check stops another site in the same browser posting presses here.
 */
function fromThisPage(req) {
  const host = req.headers.host ?? "";
  const origin = req.headers.origin;
  try {
    if (!LOCAL_HOSTNAMES.has(new URL(`http://${host}`).hostname)) return false;
  } catch {
    return false;
  }
  return origin === undefined || origin === `http://${host}`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY) reject(new Error("body too large"));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

/**
 * The remote's HTTP server. `run(device, command)` sends an inputd-cli command; `devices()` lists
 * the devices to choose from. Every device and command is checked here first.
 */
export function createRemoteServer({ run, devices }) {
  const send = async (res, device, command) => {
    if (!command || !(await devices()).includes(device)) return res.writeHead(400).end();
    try {
      await run(device, command);
      res.writeHead(204).end();
    } catch (error) {
      console.error(`${device}: ${error.message}`);
      res.writeHead(502).end();
    }
  };

  return createServer(async (req, res) => {
    if (!fromThisPage(req)) return res.writeHead(403).end();
    const url = new URL(req.url ?? "/", "http://localhost");
    const device = url.searchParams.get("device") ?? "";
    const press = url.pathname.match(/^\/press\/(\w+)$/);
    if (req.method === "POST" && press)
      return send(res, device, pressCommand(press[1], url.searchParams.get("hold") ?? "short"));
    if (req.method === "POST" && url.pathname === "/text") {
      const text = await readBody(req).catch(() => null);
      return send(res, device, textCommand(text));
    }
    if (req.method === "GET" && url.pathname === "/devices") {
      const list = await devices().catch(() => []);
      return res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(list));
    }
    if (req.method === "GET" && url.pathname === "/")
      return res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(page);
    res.writeHead(404).end();
  });
}
