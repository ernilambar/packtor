import { existsSync, mkdirSync } from 'fs'

import { rimrafSync } from 'rimraf'

const packtorGetIncludes = (files) => {
  return files.filter(file => !file.startsWith('!'))
}

const packtorGetExcludes = (files) => {
  const list = files.filter(file => file.startsWith('!'))

  const output = []

  list.forEach(element => output.push(element.slice(1)))

  return output
}

const packtorClearDir = (dir) => {
  if (existsSync(dir)) {
    rimrafSync(dir)
  }

  mkdirSync(dir, { recursive: true })
}

export { packtorGetIncludes, packtorGetExcludes, packtorClearDir }
