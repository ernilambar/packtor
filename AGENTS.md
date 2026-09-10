# AGENTS.md

## Overview

Packtor is a Node.js CLI and API that copies files and folders to an output directory and optionally creates a zip. It uses plain JavaScript ES modules, `node:test` for tests, and neostandard (via ESLint) for linting.

## Setup

- Requires Node.js >= 22.
- Install dependencies:

```sh
npm ci
```

- Zip tests need `unzip` on PATH (already present on macOS; on Linux CI it is installed explicitly).
- If your shell sets `NODE_ENV=production`, npm skips dev dependencies; use `NODE_ENV=development npm ci` locally.

## Commands

```sh
npm test            # run tests with node --test
npm run lint        # lint with ESLint (neostandard)
npm run lint:fix    # auto-fix lint/format issues
node --check index.js src/*.js test/*.js   # syntax check (no separate typecheck/build step)
```

There is no build step: the package ships plain JS.

## Conventions

- Use ES modules and the `node:` prefix for builtins (for example `node:fs`, `node:path`).
- Keep runtime logic in `src/`; `index.js` is only the CLI entry point.
- Read user config from `.packtorrc.json`, not from a `packtor` key in `package.json`.
- Export functions with a `packtor` prefix from `src/utils.js` and keep them focused on one task.
- Follow neostandard style (no semicolons, two-space indent) and add `node:test` tests for any behavior change.

## Quality gate

Run these commands in order and confirm each exits with code 0 before declaring a task complete:

```sh
npm ci
npm run lint
npm test
```
