import path from 'path'
import fs from 'fs'
import os from 'os'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { test } from 'node:test'
import assert from 'node:assert'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const indexPath = path.join(__dirname, '..', 'index.js')

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
