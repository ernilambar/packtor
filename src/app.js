import { createRequire } from 'module'
import { existsSync, readFileSync } from 'node:fs'
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
  files: ['**/*']
}

const ALWAYS_EXCLUDES_BASE = [
  'node_modules/**/*',
  '.git/**/*'
]

const KNOWN_KEYS = new Set(['destFolder', 'createZip', 'files'])

function validateSettings (packageSettings, settings) {
  for (const key of Object.keys(packageSettings)) {
    if (!KNOWN_KEYS.has(key)) {
      console.warn(`Warning: unknown config key "${key}" in .packtorrc.json`)
    }
  }
  if (!Array.isArray(settings.files)) {
    throw new Error('"files" must be an array')
  }
  if (typeof settings.destFolder !== 'string') {
    throw new Error('"destFolder" must be a string')
  }
  if (typeof settings.createZip !== 'boolean') {
    throw new Error('"createZip" must be a boolean')
  }
}

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

  const rcPath = path.join(cwd, '.packtorrc.json')
  let packageSettings = {}
  if (existsSync(rcPath)) {
    try {
      packageSettings = JSON.parse(readFileSync(rcPath, 'utf8'))
    } catch (err) {
      const e = new Error('Unable to parse .packtorrc.json')
      e.cause = err
      throw e
    }
  }

  const settings = { ...DEFAULT_OPTIONS, ...packageSettings }
  validateSettings(packageSettings, settings)
  return { pkg, projectDir: cwd, projectName: pkg.name, settings }
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
  console.log('Files copied!')

  if (settings.createZip) {
    await createZip({
      source: `${projectName}/*`,
      destination: `${projectName}.zip`,
      cwd: uxfy(path.join(projectDir, targetDir))
    })
  }
}

export { packtor }
