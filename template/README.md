# {{PROJECT_NAME}}

Repositorio orientado a mantener pruebas automatizadas de la plataforma usando Playwright, con documentación por módulo para evitar cobertura duplicada y hacer más clara la evolución de la suite.

## Objetivo del repo

- Centralizar pruebas E2E de la plataforma.
- Organizar la cobertura por módulo y pantalla.
- Documentar qué escenarios ya están automatizados y cuáles siguen pendientes.
- Reducir duplicación de casos y priorizar pruebas con valor real.

## Estructura del proyecto

```text
.github/workflows/     # CI
.opencode/             # agentes y comandos para el flujo de trabajo de tests
  agents/              # definiciones de subagentes
  commands/            # comandos disponibles
test/                  # pruebas y documentación por módulo
  example/
    example.test.ts    # suite Playwright del módulo
    example.doc.md     # contexto y matriz de escenarios
playwright.config.ts   # configuración global de Playwright
AGENTS.md              # reglas del proyecto para generación/mantenimiento de tests
```

## Documentación breve

Cada pantalla debe mantener dos archivos:

- `[page].test.*`: pruebas automatizadas de esa pantalla.
- `[page].doc.md`: contexto funcional y tabla única de escenarios.

## Instalación

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Instalar navegadores de Playwright:

   ```bash
   pnpm exec playwright install chromium
   ```

3. Copiar `.env.example` a `.env` y completar las variables de plataforma:

   ```bash
   cp .env.example .env
   ```

4. Ejecutar la suite:

   ```bash
   pnpm test
   ```

## Scripts principales

| Comando | Uso |
| --- | --- |
| `pnpm test` | Ejecuta la suite Playwright en modo headless. No abre el navegador visualmente. |
| `pnpm test:headed` | Ejecuta la suite con el navegador visible. Útil para debugging visual. |
| `pnpm test:ui` | Abre la interfaz interactiva de Playwright para correr, inspeccionar y depurar tests. |
