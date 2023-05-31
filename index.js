#!/usr/bin/env node

const copyfiles = require('copyfiles')
const zip = require('bestzip')
const path = require('path')
const fs = require('fs-extra')

const projectDir = process.cwd()
const pkg = fs.readJsonSync(projectDir + '/package.json')
const projectName = pkg.name

const targetDir = 'deploy'

copyfiles(['**/*', `${targetDir}/${projectName}`], { exclude: ['node_modules/**/*', targetDir + '/**/*', '*.json', '*.yaml', '*.lock'] }, (err) => {
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
