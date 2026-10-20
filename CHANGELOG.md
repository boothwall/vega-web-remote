# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/<OWNER>/vega-web-remote/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/<OWNER>/vega-web-remote/releases/tag/v0.1.0
