# packtor

Copy given files and folders to a directory and create its zip.

**Note:**

Following files and folders are excluded by default.

* Dot files and folders
* `node_modules` folder
* `bower_components` folder

## Install

```sh
npm install --save-dev packtor
```
## Example

In `package.json` scripts:

```json
...
"packtor": {
  "destFolder": "deploy",
  "files" : [
		"**/*",
		"!tests/**/*",
		"!*.json",
		"!*.lock",
		"!*.yaml"
	]
},
...
"scripts": {
  ...
  "deploy": "packtor"
}
```

## Defaults

- **destFolder**: `deploy`
- **createZip**: `true`
- **files**: `['**/*', '!node_modules/**/*', '!bower_components/**/*']`