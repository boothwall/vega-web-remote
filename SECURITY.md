# Security

vega-web-remote runs commands on a TV device for you, so reports about it are very welcome.

Please report anything you find privately through GitHub: open the repo's **Security** tab and choose **Report a vulnerability**. Don't open a public issue for it.

## What counts

Anything that lets something other than you, at the remote's own page, act on the device. For example:

- another web page, another user or another machine sending presses or text through the remote
- a command reaching the device other than `inputd-cli button_press` with an allowlisted button, or `inputd-cli send_text` with plain text
- typed text breaking out of its quotes on the device
- the server running something on your computer other than the `vega` CLI

Useful to include: what you found, how to reproduce it, and your Node version, Vega CLI version and operating system. I'll reply as soon as I can and credit you in the fix unless you'd rather stay anonymous.

## Supported versions

Fixes go into `main` and the next release. Only the latest release is maintained.
