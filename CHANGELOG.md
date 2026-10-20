# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-10-20

A new look: the remote now looks and reads like a TV remote.

### Changed

- The keys sit in a remote body in the order of a TV remote: the D-pad and OK, then Back, Home and Menu, then Rewind, Play/Pause and Fast-forward, then Previous, Hold OK and Next. It is the same column on a phone and on a desktop.
- The title is a wordmark: a ring mark, **Vega** in bold, then web remote.
- One status line replaces the error text: the last press and its round trip (**Right · 41 ms**), **Holding OK…**, or what went wrong.
- The text field is called **Type on the TV**, and text it won't accept says why instead of being sent.

### Added

- Hold OK on the remote for 0.6 seconds for a long press; a ring fills around it as you hold. **Hold OK** and Shift+Enter still work.
- A pilot light on the remote: blue when a press lands, red when it fails.
- A message with **Retry** when the device doesn't answer, when it has left `vega device list`, or when the remote's server has stopped.
- A loading state while devices are listed, and a how-to with **Search again** when there are none.
- `?` opens a sheet with every keyboard shortcut.
- Visible focus rings, labels on every icon key, a short vibration on phones that support it, and no motion when your system asks for reduced motion.
- A quiet footer at the bottom of the page linking to BoothWall, and the remote's ring icon in the browser tab.

### Fixed

- Keyboard shortcuts no longer fire while the device picker has focus, or with Cmd, Ctrl or Alt held, so browser shortcuts work.

## [0.1.0] - 2026-10-20

The first release, made during the Build, Ship, Shape: Amazon Developer Hackathon.

### Added

- A remote control in the browser for the Vega Virtual Device and Fire TV devices in developer mode, served at http://localhost:4400.
- D-pad, OK, a held OK (long press), Back, Home and Menu.
- Media keys on one row: Previous, Rewind, Play/Pause, Fast-forward and Next.
- Text entry: letters, digits, spaces and `@._-`, up to 64 characters.
- Keyboard shortcuts for the D-pad, OK and held OK, Back, Home, Menu, Play/Pause, Previous and Next.
- A device picker filled from `vega device list`.
- `--port` and `--vega` options. The `vega` CLI is found in `~/vega/bin` or on your `PATH`.
- Runs straight from GitHub with `npx`. No dependencies; Node 20 or later.
- Tests with `node:test`, and CI on Node 20, 22 and 24.

### Security

- The server listens on `127.0.0.1` only.
- Only allowlisted buttons and holds, and only devices `vega device list` reports, are accepted.
- Commands go to `execFile`, never a local shell. Typed text is restricted and single-quoted, because the device runs it through a shell.
- Requests need a local Host header and, when the browser sends one, a matching Origin, so other web pages and DNS-rebound hostnames can't press keys.

[Unreleased]: https://github.com/boothwall/vega-web-remote/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/boothwall/vega-web-remote/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/boothwall/vega-web-remote/releases/tag/v0.1.0
