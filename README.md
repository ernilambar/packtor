# packtor

Copy files and folders to a directory and create a zip.

## Install

```sh
npm install --save-dev packtor
```

## Usage

Add a `.packtorrc.json` to your project root:

```json
{
  "destFolder": "deploy",
  "createZip": true,
  "files": [
    "src/**/*",
    "includes/**/*",
    "*.php",
    "readme.txt",
    "!src/tests/**/*"
  ]
}
```

Add a script to `package.json`:

```json
"scripts": {
  "pack": "packtor"
}
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| **destFolder** | `deploy` | Output directory (always excluded from copy). |
| **createZip** | `true` | Create a zip of the copied files. |
| **files** | `['**/*']` | Whitelist of glob patterns to copy. Prefix with `!` to exclude. |

The following are always excluded regardless of `files`: `node_modules`, `.git`, and `destFolder`.

## Migrating from v1

Move the `packtor` key from `package.json` into a new `.packtorrc.json` file.

**Before (`package.json`):**

```json
"packtor": {
  "files": [
    "**/*",
    "!*.js",
    "!package.json",
    "!*.lock"
  ]
}
```

**After (`.packtorrc.json`):**

```json
{
  "files": [
    "src/**/*",
    "includes/**/*",
    "*.php",
    "readme.txt"
  ]
}
```
