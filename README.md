# packtor

Copy files and folders to a directory and create a zip.

## Install

```sh
npm install --save-dev packtor
```

## Usage

Add to `package.json`:

```json
"packtor": {
  "destFolder": "deploy",
  "files": ["**/*", "!tests/**/*", "!*.json"]
},
"scripts": {
  "deploy": "packtor"
}
```

## Options

| Option       | Default | Description                    |
| ------------ | ------- | ------------------------------ |
| **destFolder** | `deploy` | Output directory (always excluded from copy). |
| **createZip** | `true`   | Create a zip of the copied files. |
| **files**     | `['**/*', '!node_modules/**/*', '!bower_components/**/*']` | Glob include/exclude (`!` = exclude). |

By default dot files/folders, `node_modules`, and `bower_components` are not copied.
