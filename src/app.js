import { createRequire } from 'module'
import { packtorGetIncludes, packtorGetExcludes, packtorClearDir, packtorCopier, packtorZipper } from './utils.js'
import pkgUxfy from 'unixify'
const uxfy = pkgUxfy

const packtor = () => {
  const cwd = uxfy(process.cwd())

  const require = createRequire(import.meta.url)
  let pkg
  try {
    pkg = require(uxfy(cwd + '/package.json'))
  } catch (err) {
    console.error('Unable to load package.json')
    process.exit(1)
  }

  if (!pkg.name) {
    console.error('package.json must contain a "name" field')
    process.exit(1)
  }

  const projectDir = cwd
  const projectName = pkg.name

  // Default options.
  const defaultOptions = {
    destFolder: 'deploy',
    createZip: true,
    files: ['**/*', '!node_modules/**/*', '!bower_components/**/*']
  }

  const packageSettings = pkg.packtor ?? {}
  const settings = { ...defaultOptions, ...packageSettings }

  const targetDir = settings.destFolder

  const alwaysExcludes = [
    `${targetDir}/**/*`,
    'node_modules/**/*',
    'bower_components/**/*'
  ]

  // Clear target directory.
  packtorClearDir(targetDir)

  // Prepare includes and excludes.
  const include = packtorGetIncludes(settings.files)
  let exclude = packtorGetExcludes(settings.files)

  exclude = exclude.concat(alwaysExcludes)

  exclude = exclude.filter((item, index, arr) => arr.indexOf(item) === index)

  // Copy files and folders.
  packtorCopier([...include, `${targetDir}/${projectName}`], { exclude }, (err) => {
    if (err) {
      console.error('Error occurred while copying:', err)
      process.exit(1)
    }

    if (settings.createZip) {
      packtorZipper({
        source: `${projectName}/*`,
        destination: `${projectName}.zip`,
        cwd: uxfy(projectDir + '/' + targetDir)
      })
    }
  })
}

export { packtor }
