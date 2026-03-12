import path from 'path'
import fs from 'fs'
import os from 'os'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { test } from 'node:test'
import assert from 'node:assert'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const indexPath = path.join(__dirname, '..', 'index.js')

/**
 * List entry names in a zip file (requires unzip on PATH, e.g. macOS/Linux).
 * Parses unzip -l output; date/time format varies by OS (e.g. DD-MM-YYYY on macOS, YYYY-MM-DD on Linux).
 * @param {string} zipPath Path to .zip file
 * @returns {string[]} Entry names (files and dirs) in the zip
 */
function listZipEntries (zipPath) {
  const out = execSync(`unzip -l "${zipPath}"`, { encoding: 'utf8' })
  const lines = out.split('\n')
  const entries = []
  for (const line of lines) {
    const m = line.match(/^\s*\d+\s+\S+\s+\S+\s{2,}(.+)$/)
    if (m) entries.push(m[1].trim())
  }
  return entries
}

function runPacktor (cwd) {
  return execSync(`node "${indexPath}"`, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  })
}

test('packtor CLI exits with error when package.json has no "name" field', () => {
  const cwd = path.join(os.tmpdir(), `packtor-no-name-${Date.now()}`)
  fs.mkdirSync(cwd, { recursive: true })
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({ version: '1.0.0' })
  )

  let exitCode
  try {
    runPacktor(cwd)
    exitCode = 0
  } catch (err) {
    exitCode = err.status
  }

  assert.notStrictEqual(exitCode, 0)
  fs.rmSync(cwd, { recursive: true })
})

test('packtor CLI exits with error when package.json is missing', () => {
  const cwd = path.join(os.tmpdir(), `packtor-no-pkg-${Date.now()}`)
  fs.mkdirSync(cwd, { recursive: true })

  let exitCode
  try {
    runPacktor(cwd)
    exitCode = 0
  } catch (err) {
    exitCode = err.status
  }

  assert.notStrictEqual(exitCode, 0)
  fs.rmSync(cwd, { recursive: true })
})

test('packtor CLI creates deploy dir and copies files', () => {
  const cwd = path.join(os.tmpdir(), `packtor-integration-${Date.now()}`)
  fs.mkdirSync(cwd, { recursive: true })
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({
      name: 'fixture-app',
      packtor: { createZip: false }
    })
  )
  fs.writeFileSync(path.join(cwd, 'foo.txt'), 'fixture content')

  runPacktor(cwd)

  const deployPath = path.join(cwd, 'deploy', 'fixture-app')
  assert.strictEqual(fs.existsSync(deployPath), true)
  assert.strictEqual(fs.readFileSync(path.join(deployPath, 'foo.txt'), 'utf8'), 'fixture content')
  assert.strictEqual(fs.existsSync(path.join(cwd, 'deploy', 'fixture-app.zip')), false)
  fs.rmSync(cwd, { recursive: true })
})

test('packtor CLI copies mix of files and folders to deploy', () => {
  const cwd = path.join(os.tmpdir(), `packtor-mix-${Date.now()}`)
  fs.mkdirSync(cwd, { recursive: true })
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({
      name: 'mix-app',
      packtor: { createZip: false }
    })
  )
  fs.writeFileSync(path.join(cwd, 'README.md'), '# mix')
  fs.writeFileSync(path.join(cwd, 'index.js'), 'console.log("hi")')
  fs.mkdirSync(path.join(cwd, 'lib'), { recursive: true })
  fs.writeFileSync(path.join(cwd, 'lib', 'util.js'), 'export {}')
  fs.mkdirSync(path.join(cwd, 'config'), { recursive: true })
  fs.writeFileSync(path.join(cwd, 'config', 'default.json'), '{"env":"dev"}')

  runPacktor(cwd)

  const deployPath = path.join(cwd, 'deploy', 'mix-app')
  assert.strictEqual(fs.existsSync(deployPath), true)
  assert.strictEqual(fs.readFileSync(path.join(deployPath, 'README.md'), 'utf8'), '# mix')
  assert.strictEqual(fs.readFileSync(path.join(deployPath, 'index.js'), 'utf8'), 'console.log("hi")')
  assert.strictEqual(fs.readFileSync(path.join(deployPath, 'lib', 'util.js'), 'utf8'), 'export {}')
  assert.strictEqual(fs.readFileSync(path.join(deployPath, 'config', 'default.json'), 'utf8'), '{"env":"dev"}')
  fs.rmSync(cwd, { recursive: true })
})

test('packtor CLI creates deploy and attempts zip by default', () => {
  const cwd = path.join(os.tmpdir(), `packtor-zip-${Date.now()}`)
  fs.mkdirSync(cwd, { recursive: true })
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({ name: 'zip-app' })
  )
  fs.writeFileSync(path.join(cwd, 'bar.txt'), 'bar')

  let zipCreated = false
  try {
    runPacktor(cwd)
    zipCreated = true
  } catch (err) {
    assert.ok(err.status !== undefined)
  }

  const deployDir = path.join(cwd, 'deploy', 'zip-app')
  assert.strictEqual(fs.existsSync(deployDir), true)
  assert.strictEqual(fs.readFileSync(path.join(deployDir, 'bar.txt'), 'utf8'), 'bar')
  const zipPath = path.join(cwd, 'deploy', 'zip-app.zip')
  if (zipCreated && fs.existsSync(zipPath)) {
    assert.ok(fs.statSync(zipPath).size > 0)
  }
  fs.rmSync(cwd, { recursive: true, force: true })
})

test('packtor CLI zip file contains given files and folders', () => {
  const prefix = 'zip-contents-app'
  const expectedInZip = [
    `${prefix}/root.txt`,
    `${prefix}/lib/helper.js`,
    `${prefix}/lib/utils/helper.js`,
    `${prefix}/config/default.json`,
    `${prefix}/config/env/production.json`
  ]

  const cwd = path.join(os.tmpdir(), `packtor-zip-contents-${Date.now()}`)
  fs.mkdirSync(cwd, { recursive: true })
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({ name: 'zip-contents-app', packtor: { createZip: true } })
  )
  fs.writeFileSync(path.join(cwd, 'root.txt'), 'root')
  fs.mkdirSync(path.join(cwd, 'lib', 'utils'), { recursive: true })
  fs.writeFileSync(path.join(cwd, 'lib', 'helper.js'), '// helper')
  fs.writeFileSync(path.join(cwd, 'lib', 'utils', 'helper.js'), '// nested helper')
  fs.mkdirSync(path.join(cwd, 'config', 'env'), { recursive: true })
  fs.writeFileSync(path.join(cwd, 'config', 'default.json'), '{}')
  fs.writeFileSync(path.join(cwd, 'config', 'env', 'production.json'), '{"env":"production"}')

  runPacktor(cwd)

  const zipPath = path.join(cwd, 'deploy', 'zip-contents-app.zip')
  assert.strictEqual(fs.existsSync(zipPath), true, 'zip file should exist')
  assert.ok(fs.statSync(zipPath).size > 0, 'zip file should not be empty')

  const entries = listZipEntries(zipPath)
  const entrySet = new Set(entries)
  const missing = expectedInZip.filter((name) => !entrySet.has(name))
  assert.strictEqual(
    missing.length,
    0,
    `zip must contain all expected files. Missing: ${missing.join(', ')}. Got: ${entries.sort().join(', ')}`
  )
  assert.ok(entrySet.has(`${prefix}/root.txt`), 'zip must include root-level files')
  assert.ok(entrySet.has(`${prefix}/config/env/production.json`), 'zip must include deeply nested files')
  fs.rmSync(cwd, { recursive: true, force: true })
})
