# Packtor

> Copy files and folders to the given directory and create a zip.

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
