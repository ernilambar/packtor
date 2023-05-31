#!/usr/bin/env node

const copyfiles = require('copyfiles')

copyfiles(['**/*', 'deploy/date-today-nepali'], { exclude: ['node_modules/**/*', 'deploy/**/*', '*.json', '*.yaml', '*.lock'] }, (err) => {
  if (err) {
    console.log('Error occurred while copying', err)
  }
  console.log('Copied.')
})
