import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'

const binPath = new URL('./create-playwright-testing-repo.js', import.meta.url).pathname

function run(args, cwd) {
  const cmd = `node ${binPath} ${args.join(' ')}`
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' })
}

function runThrows(args, cwd) {
  const cmd = `node ${binPath} ${args.join(' ')}`
  try {
    execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' })
    return null
  } catch (e) {
    return e
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

describe('create mode', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'ptr-test-'))
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it('scaffolds expected files and metadata', () => {
    const target = join(tmpDir, 'my-project')
    run([target], tmpDir)

    assert(existsSync(target))
    assert(existsSync(join(target, '.template-meta.json')))
    assert(existsSync(join(target, 'package.json')))
    assert(existsSync(join(target, 'playwright.config.ts')))
    assert(existsSync(join(target, 'AGENTS.md')))
    assert(existsSync(join(target, '.env.example')))
    assert(existsSync(join(target, '.gitignore')))
    assert(existsSync(join(target, 'README.md')))
    assert(existsSync(join(target, '.github/workflows/ci.yml')))
    assert(existsSync(join(target, '.opencode/agents/test-explorer.md')))
    assert(existsSync(join(target, 'test/example/example.test.ts')))

    const meta = readJson(join(target, '.template-meta.json'))
    assert.strictEqual(meta.templateName, 'playwright-testing-repo')
    assert.ok(meta.templateVersion)
    assert.ok(Array.isArray(meta.managedFiles))
    assert(meta.managedFiles.includes('package.json'))
  })

  it('replaces project name token in package.json and README', () => {
    const target = join(tmpDir, 'my-project')
    run([target], tmpDir)

    const pkg = readJson(join(target, 'package.json'))
    assert.strictEqual(pkg.name, 'my-project')

    const readme = readFileSync(join(target, 'README.md'), 'utf8')
    assert(readme.includes('my-project'))
  })

  it('fails on non-empty directory without --force', () => {
    const target = join(tmpDir, 'existing')
    mkdirSync(target, { recursive: true })
    writeFileSync(join(target, 'something.txt'), 'x')

    const err = runThrows([target], tmpDir)
    assert(err)
    assert(err.stdout.includes('not empty') || err.stderr.includes('not empty'))
  })

  it('allows non-empty directory with --force', () => {
    const target = join(tmpDir, 'existing')
    mkdirSync(target, { recursive: true })
    writeFileSync(join(target, 'something.txt'), 'x')

    run([target, '--force'], tmpDir)
    assert(existsSync(join(target, '.template-meta.json')))
    assert(existsSync(join(target, 'something.txt')))
  })
})

describe('update mode', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'ptr-test-'))
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it('preserves custom package.json fields while refreshing managed fields', () => {
    const target = join(tmpDir, 'project')
    run([target], tmpDir)

    const pkgPath = join(target, 'package.json')
    const original = readJson(pkgPath)
    original.customField = 'preserve-me'
    original.scripts.custom = 'echo custom'
    original.devDependencies.typescript = '^5.0.0'
    writeFileSync(pkgPath, JSON.stringify(original, null, 2) + '\n')

    // Mutate a managed file to prove it gets refreshed
    const agentsPath = join(target, 'AGENTS.md')
    writeFileSync(agentsPath, 'stale content')

    run(['--update', target], tmpDir)

    const updated = readJson(pkgPath)
    assert.strictEqual(updated.customField, 'preserve-me')
    assert.strictEqual(updated.scripts.custom, 'echo custom')
    assert.strictEqual(updated.devDependencies.typescript, '^5.0.0')
    assert(updated.scripts.test)
    assert(updated.devDependencies['@playwright/test'])

    const agents = readFileSync(agentsPath, 'utf8')
    assert(agents.includes('Purpose'))
    assert(!agents.includes('stale content'))
  })

  it('skips package.json if missing in target', () => {
    const target = join(tmpDir, 'project')
    run([target], tmpDir)
    rmSync(join(target, 'package.json'))

    const out = run(['--update', target], tmpDir)
    assert(out.includes('Skipped package.json'))
  })

  it('fails if target is missing', () => {
    const err = runThrows(['--update', 'missing'], tmpDir)
    assert(err)
    assert(err.stderr.includes('does not exist') || err.stdout.includes('does not exist'))
  })

  it('fails if target lacks .template-meta.json', () => {
    const target = join(tmpDir, 'nope')
    mkdirSync(target, { recursive: true })
    const err = runThrows(['--update', target], tmpDir)
    assert(err)
    assert(err.stderr.includes('missing .template-meta.json') || err.stdout.includes('missing .template-meta.json'))
  })

  it('accepts legacy templateName create-playwright-testing-repo', () => {
    const target = join(tmpDir, 'legacy')
    run([target], tmpDir)
    const metaPath = join(target, '.template-meta.json')
    const meta = readJson(metaPath)
    meta.templateName = 'create-playwright-testing-repo'
    writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n')

    const out = run(['--update', target], tmpDir)
    assert(out.includes('Update complete'))
  })
})

describe('migrate mode', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'ptr-test-'))
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it('recreates missing managed files and refreshes metadata', () => {
    const target = join(tmpDir, 'project')
    run([target], tmpDir)

    rmSync(join(target, 'AGENTS.md'))
    rmSync(join(target, 'playwright.config.ts'))
    rmSync(join(target, 'package.json'))

    const metaPath = join(target, '.template-meta.json')
    const oldMeta = readJson(metaPath)
    oldMeta.managedFiles = ['fake-file']
    writeFileSync(metaPath, JSON.stringify(oldMeta, null, 2) + '\n')

    const out = run(['--migrate', target], tmpDir)
    assert(out.includes('Created AGENTS.md'))
    assert(out.includes('Created playwright.config.ts'))
    assert(out.includes('Created package.json'))
    assert(out.includes('Refreshed .template-meta.json'))
    assert(out.includes('Migrate complete'))

    const meta = readJson(metaPath)
    assert.strictEqual(meta.templateName, 'playwright-testing-repo')
    assert.ok(meta.managedFiles.includes('AGENTS.md'))
    assert.ok(meta.managedFiles.includes('package.json'))
  })

  it('fails if target is missing', () => {
    const err = runThrows(['--migrate', 'missing'], tmpDir)
    assert(err)
    assert(err.stderr.includes('does not exist') || err.stdout.includes('does not exist'))
  })

  it('fails if target lacks .template-meta.json', () => {
    const target = join(tmpDir, 'nope')
    mkdirSync(target, { recursive: true })
    const err = runThrows(['--migrate', target], tmpDir)
    assert(err)
    assert(err.stderr.includes('missing .template-meta.json') || err.stdout.includes('missing .template-meta.json'))
  })
})
