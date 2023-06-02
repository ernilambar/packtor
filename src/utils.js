import bestzip from 'bestzip'
import copyfiles from 'copyfiles'
import { existsSync, mkdirSync } from 'fs'
import { rimrafSync } from 'rimraf'

/**
 * Return files to be included from the list of files.
 *
 * @param  {string[]} files List of files.
 * @return {string[]} Filtered list of files.
 */
const packtorGetIncludes = (files) => {
  return files.filter(file => !file.startsWith('!'))
}

/**
 * Return files to be excluded from the list of files.
 *
 * @param  {string[]} files List of files.
 * @return {string[]} Filtered list of files.
 */
const packtorGetExcludes = (files) => {
  const list = files.filter(file => file.startsWith('!'))

  const output = []

  list.forEach(element => output.push(element.slice(1)))

  return output
}

/**
 * Delete given directory and its contents.
 *
 * @param {string} dir Directory.
 */
const packtorClearDir = (dir) => {
  if (existsSync(dir)) {
    rimrafSync(dir)
  }

  mkdirSync(dir, { recursive: true })
}

/**
 * Copies files and directories.
 *
 * @param {Object} config Configuration.
 */
const packtorCopier = (paths, config, cb) => {
  copyfiles(paths, config, cb)
}
/**

 * Create zip.
 *
 * @param {Object} config Configuration.
 */
const packtorZipper = (config) => {
  bestzip(config).then(function () {
    console.log('Zip created!')
  }).catch(function (err) {
    console.error(err.stack)
  })
}

export { packtorGetIncludes, packtorGetExcludes, packtorClearDir, packtorCopier, packtorZipper }
