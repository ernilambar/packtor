#!/usr/bin/env node

const copyfiles = require('copyfiles')
const zip = require('bestzip')
const path = require('path')

copyfiles(['**/*', 'deploy/date-today-nepali'], { exclude: ['node_modules/**/*', 'deploy/**/*', '*.json', '*.yaml', '*.lock'] }, (err) => {
  if (err) {
    console.log('Error occurred while copying', err)
  }

  console.log('Copied.')

  zip({
	  source: 'date-today-nepali/*',
	  destination: 'date-today-nepali.zip',
	  cwd: path.join(process.cwd(), 'deploy')
  }).then(function () {
	  console.log('Zip created!')
  }).catch(function (err) {
	  console.error(err.stack)
	  process.exit(1)
  })
})
