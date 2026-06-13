# Changelog

## [2.0.0] - 2026-06-13

* Breaking - Config moved from `package.json` `packtor` key to `.packtorrc.json`.
* Changed - `files` now uses whitelist semantics; `node_modules` and `.git` are always excluded implicitly.

## [1.0.4] - 2026-03-12

* Added - Tests for mixed files/folders and zip contents; CI installs unzip on Linux.
* Fixed - Zip includes root-level files; listing parser works on macOS and Linux.

## [1.0.3] - 2026-03-11

* Added - Introduced tests.
* Update - Updated dependencies.

## [1.0.0]

* Added - Deploy dir copy with include/exclude patterns; optional zip; CLI and API.
