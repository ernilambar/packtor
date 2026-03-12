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
 * Copies files and directories (callback API).
 *
 * @param {string[]} include Source patterns to copy.
 * @param {string} destPath Destination path (last element for copyfiles).
 * @param {Object} config Configuration (e.g. { exclude }).
 * @param {Function} cb Callback (err).
 */
const packtorCopier = (include, destPath, config, cb) => {
  const paths = [...include, destPath]
  copyfiles(paths, config, cb)
}

/**
 * Copies files and directories (Promise API).
 *
 * @param {string[]} include Source patterns to copy.
 * @param {string} destPath Destination path (last element for copyfiles).
 * @param {Object} config Configuration (e.g. { exclude }).
 * @returns {Promise<void>} Resolves when copy is done; rejects on error.
 */
const packtorCopierAsync = (include, destPath, config) => {
  const paths = [...include, destPath]
  return new Promise((resolve, reject) => {
    copyfiles(paths, config, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

/**
 * Create zip.
 *
 * @param {Object} config Configuration.
 * @returns {Promise<void>} Resolves when zip is created; rejects on error.
 */
const packtorZipper = (config) => {
  return bestzip(config).then(function () {
    console.log('Zip created!')
  })
}

export { packtorGetIncludes, packtorGetExcludes, packtorClearDir, packtorCopier, packtorCopierAsync, packtorZipper }
