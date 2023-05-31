#!/usr/bin/env node

const copyfiles = require('copyfiles')

const inputFolder = ['app/**/*.*', 'assets/**/*.*', 'build/**/*.*', 'gb-block/**/*.*', 'languages/**/*.*', 'vendor/**/*.*', 'date-today-nepali.php', 'readme.txt']
const outputFolder = 'deploy/date-today-nepali'

copyfiles([...inputFolder, outputFolder], {}, (err) => {
  if (err) {
    console.log('Error occurred while copying', err)
  }
  console.log('folder(s) copied to destination')
})
