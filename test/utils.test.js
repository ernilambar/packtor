import path from 'path'
import fs from 'fs'
import os from 'os'
import { test } from 'node:test'
import assert from 'node:assert'
import * as utils from '../src/utils.js'

test('Get includes files from the list', () => {
  const sourceFiles = ['a.txt', 'b.txt', '!c.txt']
  const includeFiles = utils.packtorGetIncludes(sourceFiles)
  const expectedFiles = ['a.txt', 'b.txt']
  assert.deepStrictEqual(includeFiles, expectedFiles)
})

test('Get excludes files from the list', () => {
  const sourceFiles = ['a.txt', '!b.txt', '!c.txt']
  const excludeFiles = utils.packtorGetExcludes(sourceFiles)
  const expectedFiles = ['b.txt', 'c.txt']
  assert.deepStrictEqual(excludeFiles, expectedFiles)
})

test('packtorGetExcludes returns empty array when no exclusions', () => {
  const sourceFiles = ['a.txt', 'b.txt']
  assert.deepStrictEqual(utils.packtorGetExcludes(sourceFiles), [])
})

test('packtorClearDir creates dir and removes existing content', () => {
  const dir = path.join(os.tmpdir(), `packtor-clear-${Date.now()}`)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'stale.txt'), 'x')
  assert.strictEqual(fs.existsSync(path.join(dir, 'stale.txt')), true)

  utils.packtorClearDir(dir)

  assert.strictEqual(fs.existsSync(dir), true)
  assert.strictEqual(fs.readdirSync(dir).length, 0)
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
  assert.strictEqual(fs.readFileSync(path.join(destDir, 'hello.txt'), 'utf8'), 'hello')
  fs.rmSync(cwd, { recursive: true })
  fs.rmSync(destDir, { recursive: true })
})
