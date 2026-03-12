const path = require('path')
const fs = require('fs')
const os = require('os')
const { execSync } = require('child_process')

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

  expect(exitCode).not.toBe(0)
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

  expect(exitCode).not.toBe(0)
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
  expect(fs.existsSync(deployPath)).toBe(true)
  expect(fs.readFileSync(path.join(deployPath, 'foo.txt'), 'utf8')).toBe('fixture content')
  expect(fs.existsSync(path.join(cwd, 'deploy', 'fixture-app.zip'))).toBe(false)
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
    expect(err.status).toBeDefined()
  }

  const deployDir = path.join(cwd, 'deploy', 'zip-app')
  expect(fs.existsSync(deployDir)).toBe(true)
  expect(fs.readFileSync(path.join(deployDir, 'bar.txt'), 'utf8')).toBe('bar')
  const zipPath = path.join(cwd, 'deploy', 'zip-app.zip')
  if (zipCreated && fs.existsSync(zipPath)) {
    expect(fs.statSync(zipPath).size).toBeGreaterThan(0)
  }
  fs.rmSync(cwd, { recursive: true, force: true })
})
