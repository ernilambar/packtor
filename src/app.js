import { createRequire } from 'module'
import { packtorGetIncludes, packtorGetExcludes, packtorClearDir, packtorCopier, packtorZipper } from './utils.js'
import pkgUxfy from 'unixify'
const uxfy = pkgUxfy

const packtor = () => {
  const cwd = uxfy(process.cwd())

  const require = createRequire(import.meta.url)
  const pkg = require(uxfy(cwd + '/package.json'))

  const projectDir = cwd

  const projectName = pkg.name

  // Default options.
  const defaultOptions = {
    destFolder: 'deploy',
    createZip: true,
    files: ['**/*', '!node_modules/**/*', '!bower_components/**/*']
  }

  const packageSettings = pkg.packtor

  const settings = Object.assign(defaultOptions, packageSettings)

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
      console.log('Error occurred while copying', err)
      process.exit()
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
