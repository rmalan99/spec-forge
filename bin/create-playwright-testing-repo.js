#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import process from 'node:process'

const args = process.argv.slice(2)

const updateMode = args.includes('--update')
const migrateMode = args.includes('--migrate')
const force = args.includes('--force')

let targetArg
if (updateMode || migrateMode) {
  const flagIndex = args.findIndex(a => a === '--update' || a === '--migrate')
  targetArg = args[flagIndex + 1] || '.'
} else {
  targetArg = args[0] && !args[0].startsWith('-') ? args[0] : 'playwright-testing-repo'
}

const packageRoot = resolve(dirname(new URL(import.meta.url).pathname), '..')
const templateDir = join(packageRoot, 'template')
const targetDir = resolve(process.cwd(), targetArg)
const rawProjectName = targetArg === '.' ? basename(process.cwd()) : basename(targetDir)
const projectName = sanitizeName(rawProjectName || 'playwright-testing-repo')

const packageJsonPath = join(packageRoot, 'package.json')
const packageVersion = JSON.parse(readFileSync(packageJsonPath, 'utf8')).version || '0.0.0'

const managedFiles = [
  '.opencode/agents/context-mapper.md',
  '.opencode/agents/playwright-explorer.md',
  '.opencode/agents/test-explorer.md',
  '.opencode/agents/test-integrator.md',
  '.opencode/agents/test-orchestrator.md',
  '.opencode/commands/explore.md',
  '.opencode/commands/integrate.md',
  '.opencode/commands/map-context.md',
  '.opencode/commands/plan-tests.md',
  '.opencode/commands/runtime-explore.md',
  'AGENTS.md',
  'playwright.config.ts',
  '.env.example',
  '.github/workflows/ci.yml',
  'package.json',
]

if (updateMode || migrateMode) {
  const mode = updateMode ? 'update' : 'migrate'

  if (!existsSync(targetDir)) {
    fail(`Target directory does not exist: ${targetArg}`)
  }

  const metaPath = join(targetDir, '.template-meta.json')
  if (!existsSync(metaPath)) {
    fail(
      `Target does not look like a generated project (missing .template-meta.json).\n` +
      `Run without --update/--migrate to create a new project, or run --migrate to create missing managed files after ensuring the project was created by this template.`
    )
  }

  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  if (!['create-playwright-testing-repo', 'playwright-testing-repo'].includes(meta.templateName)) {
    fail(`Target .template-meta.json has unexpected template name: ${meta.templateName}`)
  }

  log(`Starting ${mode} for ${targetDir}`)

  for (const relPath of managedFiles) {
    const templatePath = join(templateDir, relPath)
    const targetPath = join(targetDir, relPath)

    if (!existsSync(templatePath)) {
      log(`Warning: missing template file ${relPath}, skipping`)
      continue
    }

    if (relPath === 'package.json') {
      if (existsSync(targetPath)) {
        mergePackageJson(targetPath, templatePath)
        log(`Updated ${relPath}`)
      } else if (migrateMode) {
        copyFileWithTokens(templatePath, targetPath, { projectName })
        log(`Created ${relPath}`)
      } else {
        log(`Skipped ${relPath} (does not exist in target; use --migrate to create)`)
      }
    } else {
      const isCreating = !existsSync(targetPath)
      copyFileWithTokens(templatePath, targetPath, { projectName })
      log(`${isCreating ? 'Created' : 'Updated'} ${relPath}`)
    }
  }

  // Always refresh metadata for migrate; for update we keep existing metadata unless migrate
  if (migrateMode) {
    writeMeta(targetDir, packageVersion, managedFiles)
    log(`Refreshed .template-meta.json`)
  }

  log(`${mode === 'update' ? 'Update' : 'Migrate'} complete`)
  process.exit(0)
}

// Create mode
if (existsSync(targetDir)) {
  const stats = statSync(targetDir)
  if (!stats.isDirectory()) {
    fail(`Target exists and is not a directory: ${targetArg}`)
  }

  const hasFiles = readdirSync(targetDir).length > 0
  if (hasFiles && !force) {
    fail(`Target directory is not empty: ${targetArg}. Use --force to continue.`)
  }
} else {
  mkdirSync(targetDir, { recursive: true })
}

copyTemplate(templateDir, targetDir, { projectName })
writeMeta(targetDir, packageVersion, managedFiles)

log(`Template created at ${targetDir}`)
log('Next steps:')
log(`  cd ${targetArg === '.' ? '.' : targetArg}`)
log('  pnpm install')
log('  pnpm exec playwright install chromium')
log('  cp .env.example .env')

function copyTemplate(sourceDir, destinationDir, variables) {
  cpSync(sourceDir, destinationDir, {
    recursive: true,
    dereference: true,
  })

  replaceTokens(destinationDir, variables)
}

function copyFileWithTokens(source, destination, variables) {
  const destDir = dirname(destination)
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true })
  }
  const content = readFileSync(source, 'utf8')
  const replaced = content.replaceAll('{{PROJECT_NAME}}', variables.projectName)
  writeFileSync(destination, replaced)
}

function mergePackageJson(existingPath, templatePath) {
  const existing = JSON.parse(readFileSync(existingPath, 'utf8'))
  const template = JSON.parse(readFileSync(templatePath, 'utf8'))

  const merged = { ...existing }

  const knownScripts = ['test', 'test:headed', 'test:ui']
  merged.scripts = merged.scripts || {}
  for (const key of knownScripts) {
    if (template.scripts?.[key] !== undefined) {
      merged.scripts[key] = template.scripts[key]
    }
  }

  if (template.packageManager) {
    merged.packageManager = template.packageManager
  }

  const knownDeps = ['@playwright/test', 'dotenv']
  merged.devDependencies = merged.devDependencies || {}
  for (const key of knownDeps) {
    if (template.devDependencies?.[key] !== undefined) {
      merged.devDependencies[key] = template.devDependencies[key]
    }
  }

  writeFileSync(existingPath, JSON.stringify(merged, null, 2) + '\n')
}

function writeMeta(dir, version, files) {
  const meta = {
    templateName: 'playwright-testing-repo',
    templateVersion: version,
    managedFiles: files,
  }
  writeFileSync(join(dir, '.template-meta.json'), JSON.stringify(meta, null, 2) + '\n')
}

function replaceTokens(currentPath, variables) {
  const stats = statSync(currentPath)

  if (stats.isDirectory()) {
    for (const entry of readdirSync(currentPath)) {
      replaceTokens(join(currentPath, entry), variables)
    }
    return
  }

  const content = readFileSync(currentPath, 'utf8')
  const replaced = content.replaceAll('{{PROJECT_NAME}}', variables.projectName)
  writeFileSync(currentPath, replaced)
}

function sanitizeName(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-{2,}/g, '-')
}

function log(message) {
  process.stdout.write(`${message}\n`)
}

function fail(message) {
  process.stderr.write(`Error: ${message}\n`)
  process.exit(1)
}
