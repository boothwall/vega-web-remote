# Contributing

Thanks for taking a look. Issues and pull requests are welcome, especially from anyone building apps for Vega OS.

## Getting set up

You need Node 20 or later. There is nothing to install: the project has no dependencies and no build step.

```sh
git clone https://github.com/boothwall/vega-web-remote.git
cd vega-web-remote
npm test     # runs node --test
npm start    # serves the remote at http://localhost:4400
```

The tests don't need the Vega SDK or a device; they use a fake device list and a fake runner. To press real keys you need the `vega` CLI and a device, as described in [Requirements](README.md#requirements). The Virtual Device is the easiest one to test against.

## How the code is organised

| File | What it does |
| --- | --- |
| `bin/vega-web-remote.mjs` | The command: reads `--port` and `--vega`, finds the CLI and starts the server |
| `src/keys.mjs` | The button allowlist and the text rule. Builds every `inputd-cli` command |
| `src/device.mjs` | Runs the `vega` CLI with `execFile`, parses `vega device list`, caches the list |
| `src/server.mjs` | The HTTP server: Host and Origin checks, the routes, the 400/403/502 answers |
| `src/page.mjs` | The page: inlines `src/ui/` into one HTML response at startup |
| `src/ui/` | `index.html`, `base.css` (layout and states), `remote.css` (every colour, as tokens) and `app.js` (presses, hold, status, toasts) |
| `test/*.test.mjs` | `node:test` tests, one file per source file |

## Ground rules

- **No dependencies.** Node's standard library covers everything here, and it keeps `npx` fast. If you think something needs a package, open an issue first.
- **Anything that widens what reaches the device needs a test.** A new button goes into `KEYS` in `src/keys.mjs` with a test. A change to the text rule needs tests that try to break out of the quotes (see `test/keys.test.mjs`).
- **Keep the server local.** It listens on `127.0.0.1` and refuses other hostnames and other sites' pages. Please don't add options that open it up.
- **Arguments go to `execFile`, never a shell.**
- Keep comments short, and only where something isn't obvious. `.editorconfig` has the formatting basics.

## Before you open a pull request

```sh
npm test
```

CI runs the same tests on Node 20, 22 and 24. If you change the page or what gets sent, please also try it on a Virtual Device or a Fire TV in developer mode and say which one in the pull request. A screenshot helps for page changes.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`fix:`, `feat:`, `docs:` and so on). Add a line under `[Unreleased]` in [CHANGELOG.md](CHANGELOG.md) for anything a user would notice.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By taking part you agree to it.
