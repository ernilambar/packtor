#!/usr/bin/env node

const copyfiles = require('copyfiles')
const zip = require('bestzip')
const path = require('path')
const fs = require('fs-extra')

const unixify = require('unixify')

const cwd = unixify(process.cwd())

const projectDir = cwd
const pkg = fs.readJsonSync(path.join(projectDir, 'package.json'))

const projectName = pkg.name

const defaultOptions = {
  destFolder: 'deploy',
  files: ['**/*', '!node_modules/**/*', '!bower_components/**/*']
}

const packageSettings = pkg.packtor

const settings = Object.assign(defaultOptions, packageSettings)

const targetDir = settings.destFolder

const packtorGetIncludes = (files) => {
  return files.filter(file => !file.startsWith('!'))
}

const packtorGetExcludes = (files) => {
  const list = files.filter(file => file.startsWith('!'))

  const output = []

  list.forEach(element => output.push(element.slice(1)))

  return output
}

const alwaysExcludes = [
  'node_modules/**/*',
  'bower_components/**/*'
]

const include = packtorGetIncludes(settings.files)
let exclude = packtorGetExcludes(settings.files)

exclude = exclude.concat(alwaysExcludes)

exclude = exclude.filter((item, index, arr) => arr.indexOf(item) === index)

copyfiles([...include, `${targetDir}/${projectName}`], { exclude }, (err) => {
  if (err) {
    console.log('Error occurred while copying', err)
  }

  zip({
	  source: `${projectName}/*`,
	  destination: `${projectName}.zip`,
	  cwd: path.join(projectDir, targetDir)
  }).then(function () {
	  console.log('Zip created!')
  }).catch(function (err) {
	  console.error(err.stack)
	  process.exit(1)
  })
})
