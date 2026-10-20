import { readFileSync } from "node:fs";

const read = (name) => readFileSync(new URL(`./ui/${name}`, import.meta.url), "utf8");

/** The remote page, one self-contained HTML response: the UI files inlined at startup. */
export const page = read("index.html")
  .replace("/*css*/", () => read("base.css") + read("remote.css"))
  .replace("/*js*/", () => read("app.js"));
