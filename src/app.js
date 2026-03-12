import { createRequire } from 'module'
import path from 'node:path'
import {
  packtorGetIncludes,
  packtorGetExcludes,
  packtorClearDir,
  packtorCopierAsync,
  packtorZipper
} from './utils.js'
import pkgUxfy from 'unixify'
const uxfy = pkgUxfy

const DEFAULT_OPTIONS = {
  destFolder: 'deploy',
  createZip: true,
  files: ['**/*', '!node_modules/**/*', '!bower_components/**/*']
}

const ALWAYS_EXCLUDES_BASE = [
  'node_modules/**/*',
  'bower_components/**/*'
]

/**
 * Load and validate package.json from cwd. Throws on error.
 *
 * @param {string} cwd Current working directory (unixified).
 * @returns {{ pkg: object, projectDir: string, projectName: string, settings: object }}
 */
function loadPackageConfig (cwd) {
  const require = createRequire(import.meta.url)
  let pkg
  try {
    pkg = require(uxfy(path.join(cwd, 'package.json')))
  } catch (err) {
    const e = new Error('Unable to load package.json')
    e.cause = err
    throw e
  }

  if (!pkg.name) {
    throw new Error('package.json must contain a "name" field')
  }

  const projectDir = cwd
  const projectName = pkg.name
  const packageSettings = pkg.packtor ?? {}
  const settings = { ...DEFAULT_OPTIONS, ...packageSettings }

  return { pkg, projectDir, projectName, settings }
}

/**
 * Build include and exclude file patterns from settings and target dir.
 *
 * @param {object} settings Packtor settings (must have .files and .destFolder).
 * @param {string} targetDir Resolved target directory (e.g. settings.destFolder).
 * @returns {{ include: string[], exclude: string[] }}
 */
function buildFilePatterns (settings, targetDir) {
  const alwaysExcludes = [
    `${targetDir}/**/*`,
    ...ALWAYS_EXCLUDES_BASE
  ]
  const include = packtorGetIncludes(settings.files)
  let exclude = packtorGetExcludes(settings.files)
  exclude = exclude.concat(alwaysExcludes)
  exclude = [...new Set(exclude)]
  return { include, exclude }
}

/**
 * Copy files to destination using include/exclude patterns.
 *
 * @param {string[]} include Include patterns.
 * @param {string} destPath Destination path.
 * @param {string[]} exclude Exclude patterns.
 * @returns {Promise<void>}
 */
async function copyFiles (include, destPath, exclude) {
  await packtorCopierAsync(include, destPath, { exclude })
}

/**
 * Create zip from source glob in cwd.
 *
 * @param {object} options Options for bestzip: source, destination, cwd.
 * @returns {Promise<void>}
 */
async function createZip (options) {
  await packtorZipper(options)
}

/**
 * Main entry: load config, clear target, copy files, optionally create zip.
 * Same CLI/config contract; single entry point.
 *
 * @returns {Promise<void>}
 */
async function packtor () {
  const cwd = uxfy(process.cwd())

  const { projectDir, projectName, settings } = loadPackageConfig(cwd)
  const targetDir = settings.destFolder

  packtorClearDir(targetDir)

  const { include, exclude } = buildFilePatterns(settings, targetDir)
  const destPath = path.join(targetDir, projectName)

  await copyFiles(include, destPath, exclude)

  if (settings.createZip) {
    await createZip({
      source: `${projectName}/*`,
      destination: `${projectName}.zip`,
      cwd: uxfy(path.join(projectDir, targetDir))
    })
  }
}

export { packtor }
