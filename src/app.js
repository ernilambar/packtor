import copyfiles from 'copyfiles'
import bestzip from 'bestzip'

import pkgUxfy from 'unixify'

import { createRequire } from 'module'

import { packtorGetIncludes, packtorGetExcludes, packtorClearDir } from './utils.js'
const uxfy = pkgUxfy

const packtor = () => {
  const cwd = uxfy(process.cwd())

  const require = createRequire(import.meta.url)
  const pkg = require(uxfy(cwd + '/package.json'))

  const projectDir = cwd

  const projectName = pkg.name

  const defaultOptions = {
    destFolder: 'deploy',
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

  const include = packtorGetIncludes(settings.files)
  let exclude = packtorGetExcludes(settings.files)

  exclude = exclude.concat(alwaysExcludes)

  exclude = exclude.filter((item, index, arr) => arr.indexOf(item) === index)

  copyfiles([...include, `${targetDir}/${projectName}`], { exclude }, (err) => {
    if (err) {
      console.log('Error occurred while copying', err)
      process.exit()
    }

    bestzip({
      source: `${projectName}/*`,
      destination: `${projectName}.zip`,
      cwd: uxfy(projectDir + '/' + targetDir)
    }).then(function () {
      console.log('Zip created!')
    }).catch(function (err) {
      console.error(err.stack)
      process.exit()
    })
  })
}

export { packtor }
