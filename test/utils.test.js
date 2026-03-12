const path = require('path')
const fs = require('fs')
const os = require('os')
const utils = require('.././src/utils')

test('Get includes files from the list', () => {
  const sourceFiles = ['a.txt', 'b.txt', '!c.txt']
  const includeFiles = utils.packtorGetIncludes(sourceFiles)
  const expectedFiles = ['a.txt', 'b.txt']
  expect(includeFiles).toStrictEqual(expectedFiles)
})

test('Get excludes files from the list', () => {
  const sourceFiles = ['a.txt', '!b.txt', '!c.txt']
  const excludeFiles = utils.packtorGetExcludes(sourceFiles)
  const expectedFiles = ['b.txt', 'c.txt']
  expect(excludeFiles).toStrictEqual(expectedFiles)
})

test('packtorGetExcludes returns empty array when no exclusions', () => {
  const sourceFiles = ['a.txt', 'b.txt']
  expect(utils.packtorGetExcludes(sourceFiles)).toStrictEqual([])
})

test('packtorClearDir creates dir and removes existing content', () => {
  const dir = path.join(os.tmpdir(), `packtor-clear-${Date.now()}`)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'stale.txt'), 'x')
  expect(fs.existsSync(path.join(dir, 'stale.txt'))).toBe(true)

  utils.packtorClearDir(dir)

  expect(fs.existsSync(dir)).toBe(true)
  expect(fs.readdirSync(dir)).toHaveLength(0)
  fs.rmSync(dir, { recursive: true })
})

test('packtorCopierAsync copies files to destination', async () => {
  const cwd = path.join(os.tmpdir(), `packtor-copy-src-${Date.now()}`)
  const destDir = path.join(os.tmpdir(), `packtor-copy-dest-${Date.now()}`)
  fs.mkdirSync(cwd, { recursive: true })
  const testFile = path.join(cwd, 'hello.txt')
  fs.writeFileSync(testFile, 'hello')
  const originalCwd = process.cwd()
  process.chdir(cwd)

  await utils.packtorCopierAsync(['hello.txt'], destDir, {})

  process.chdir(originalCwd)
  expect(fs.readFileSync(path.join(destDir, 'hello.txt'), 'utf8')).toBe('hello')
  fs.rmSync(cwd, { recursive: true })
  fs.rmSync(destDir, { recursive: true })
})
