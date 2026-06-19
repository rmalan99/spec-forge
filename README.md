# @mouseinyl-/spec-forge

Forjá en minutos una base sólida de testing con Playwright: estructura lista para escalar, documentación por pantalla, `.opencode`, CI y un flujo seguro de `update`/`migrate` para evolucionar el template sin romper customizaciones.

## Uso

### Crear un proyecto nuevo

```bash
npx @mouseinyl-/spec-forge my-tests
```

También se puede probar localmente desde este repo:

```bash
node packages/playwright-testing-repo/bin/create-playwright-testing-repo.js my-tests
```

### Actualizar un proyecto existente

Aplica actualizaciones seguras de los archivos gestionados por la plantilla sin destruir cambios propios del usuario:

```bash
node packages/playwright-testing-repo/bin/create-playwright-testing-repo.js --update .
```

### Migrar un proyecto existente

Es un superconjunto de `--update`. Además de actualizar archivos gestionados, refresca la metadata y crea archivos gestionados que falten:

```bash
node packages/playwright-testing-repo/bin/create-playwright-testing-repo.js --migrate .
```

> **Nota:** `--migrate` no es un migrador universal. Es un alias honesto de `--update` que también refresca `.template-meta.json` y crea archivos gestionados ausentes. Si el proyecto no fue generado por esta plantilla, ambos modos fallarán con un mensaje claro.

## Qué genera (modo crear)

- `README.md`
- `package.json`
- `playwright.config.ts`
- `.env.example`
- `.gitignore`
- `AGENTS.md`
- `.github/workflows/ci.yml`
- `.opencode/` (agentes y comandos para el flujo de trabajo de tests)
- `test/example/example.doc.md`
- `test/example/example.test.ts`
- `.template-meta.json` (metadata de la plantilla para futuras actualizaciones)

## Qué actualiza (modo update / migrate)

Archivos gestionados que se sobreescriben:
- `.opencode/agents/*`
- `.opencode/commands/*`
- `AGENTS.md`
- `playwright.config.ts`
- `.env.example`
- `.github/workflows/ci.yml`

`package.json` se fusiona de forma segura: solo se actualizan los campos conocidos (`scripts` `test`/`test:headed`/`test:ui`, `packageManager`, y `devDependencies` `@playwright/test` + `dotenv`). Los campos añadidos por el usuario se preservan.

## Flags

| Flag | Descripción |
| --- | --- |
| `--force` | Permite crear en un directorio no vacío (solo modo crear) |
| `--update <dir>` | Aplica actualizaciones seguras de archivos gestionados |
| `--migrate <dir>` | Como `--update`, pero también refresca metadata y crea archivos gestionados que falten |

## Tests

El paquete incluye tests automatizados del CLI que cubren creación, actualización, migración y compatibilidad hacia atrás:

```bash
node --test bin/create-playwright-testing-repo.test.js
```

## Tagline

**Spec Forge** convierte una idea de suite E2E en un repo mantenible: menos setup repetido, más foco en cobertura útil.
