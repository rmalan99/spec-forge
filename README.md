# @mouseinyl-/spec-forge

Creá una base de testing con Playwright sin arrancar desde cero. **Spec Forge** genera una estructura inicial con documentación por pantalla, CI, un sistema agéntico dentro de `.opencode` y una forma controlada de actualizar el template.

## Objetivo

Este paquete existe para resolver un problema concreto: cuando armás una suite E2E desde cero, terminás repitiendo la misma base.

La idea es dejar resuelta esa base para que puedas enfocarte en:

- escribir pruebas con valor real
- documentar cobertura por pantalla
- trabajar con un sistema agéntico integrado dentro de `.opencode`
- mantener el template actualizado sin romper customizaciones propias

## Cómo funciona

El comando principal es este:

```bash
npx @mouseinyl-/spec-forge my-tests
```

Ese comando crea una carpeta nueva con una estructura lista para trabajar.

### Qué genera

```text
my-tests/
|-- README.md
|-- package.json
|-- playwright.config.ts
|-- .env.example
|-- .gitignore
|-- AGENTS.md
|-- .github/
|   `-- workflows/
|       `-- ci.yml
|-- .opencode/
|   |-- agents/
|   `-- commands/
|-- test/
|   `-- example/
|       |-- example.doc.md
|       `-- example.test.ts
`-- .template-meta.json
```

## Cómo funciona `.opencode`

Spec Forge deja preparada la carpeta `.opencode` como contenedor del **sistema agéntico del proyecto**.

El punto importante es este: **no es opencode lo que “hace las cosas” por sí mismo**. Lo que organiza y ejecuta el trabajo es el sistema definido dentro de `.opencode`, usando comandos y agentes especializados.

En otras palabras: `.opencode` es donde vive la configuración operativa de ese sistema dentro del repo.

## Cómo funciona el sistema agéntico

El sistema se apoya en dos piezas principales:

- **comandos**: marcan la intención del trabajo
- **agentes**: ejecutan una responsabilidad concreta dentro de ese flujo

La secuencia esperada no es “escribir tests de una”. Primero hay que entender el contexto, revisar cobertura existente, explorar el comportamiento real y recién después integrar pruebas nuevas.

### 1. Comandos: el punto de entrada

Los archivos en `.opencode/commands/` representan el tipo de trabajo que querés iniciar.

Por ejemplo:

- explorar un módulo
- mapear contexto
- planificar pruebas
- integrar escenarios aprobados

Eso ayuda a que la IA no actúe a ciegas. Cada comando arranca un flujo distinto según la necesidad.

### 2. Agentes: especialistas con un rol claro

Los archivos en `.opencode/agents/` definen agentes con responsabilidades separadas.

En vez de tener una sola IA haciendo todo mezclado, el sistema divide el trabajo en especialistas:

- uno entiende contexto
- otro explora comportamiento real
- otro detecta duplicaciones o huecos
- otro integra pruebas
- otro coordina el flujo general

### 3. Orquestación: primero entender, después tocar

El objetivo del sistema agéntico es ordenar la forma de trabajo:

1. entender el módulo
2. mapear archivos y cobertura
3. explorar la pantalla o flujo real
4. decidir si realmente faltan pruebas valiosas
5. integrar solo lo que aporta cobertura útil

Eso reduce problemas típicos como:

- tests duplicados
- cobertura de poco valor
- cambios sin contexto
- automatización apurada
- ruptura de convenciones del proyecto

### 4. Resumen mental rápido

| Pieza | Rol |
| --- | --- |
| `.opencode/commands/` | Punto de entrada del flujo |
| `.opencode/agents/` | Especialistas por responsabilidad |
| `.opencode/` | Carpeta donde vive la configuración del sistema agéntico del repo |

**Playwright puede correr sin `.opencode`**. La carpeta existe para quienes quieran usar ese sistema agéntico dentro del proyecto.

### Agentes incluidos

| Agente | Función principal | Cuándo usarlo |
| --- | --- | --- |
| `test-orchestrator` | Coordina el flujo general de trabajo sobre un módulo o pantalla. | Cuando necesitás ordenar una tarea grande y decidir el siguiente paso. |
| `context-mapper` | Mapea contexto, archivos relevantes y cobertura existente. | Cuando primero necesitás entender el módulo antes de proponer o tocar tests. |
| `playwright-explorer` | Explora la UI y el comportamiento funcional con foco en Playwright. | Cuando querés inspeccionar flujos reales de pantalla antes de automatizar. |
| `test-explorer` | Analiza cobertura actual y detecta huecos o duplicaciones. | Cuando querés decidir si realmente hace falta agregar nuevas pruebas. |
| `test-integrator` | Implementa o integra escenarios ya definidos. | Cuando ya sabés qué pruebas tienen valor y querés llevarlas al código. |

### Comandos incluidos

| Comando | Función |
| --- | --- |
| `explore` | Inicia exploración funcional y técnica del módulo objetivo. |
| `runtime-explore` | Explora comportamiento en ejecución para entender mejor la pantalla o flujo. |
| `map-context` | Reúne contexto, archivos y cobertura existente antes de cambiar nada. |
| `plan-tests` | Ordena escenarios y ayuda a decidir qué pruebas valen la pena. |
| `integrate` | Lleva escenarios aprobados a implementación/integración. |

## Flujo principal

### 1. Crear un proyecto nuevo

```bash
npx @mouseinyl-/spec-forge my-tests
```

Después entrás al proyecto e instalás dependencias:

```bash
cd my-tests
pnpm install
pnpm exec playwright install chromium
cp .env.example .env
```

### 2. Actualizar un proyecto ya creado

Si el template mejora y querés traer esos cambios sin destruir lo tuyo:

```bash
npx @mouseinyl-/spec-forge --update .
```

Esto refresca archivos gestionados por el template y preserva tus campos propios del `package.json`.

### 3. Migrar un proyecto existente

Si además querés recrear archivos faltantes y refrescar metadata:

```bash
npx @mouseinyl-/spec-forge --migrate .
```

> `--migrate` no es un migrador mágico. Es una versión más fuerte de `--update`: actualiza archivos gestionados, refresca `.template-meta.json` y recrea archivos faltantes del template.

## Qué actualiza `--update` / `--migrate`

Estos archivos se consideran gestionados por el template:

- `.opencode/agents/*`
- `.opencode/commands/*`
- `AGENTS.md`
- `playwright.config.ts`
- `.env.example`
- `.github/workflows/ci.yml`

En `package.json` no pisa todo el archivo. Solo actualiza claves conocidas:

- `scripts.test`
- `scripts.test:headed`
- `scripts.test:ui`
- `packageManager`
- `devDependencies.@playwright/test`
- `devDependencies.dotenv`

Tus campos propios se conservan.

## Soporte

### Entornos con soporte

Aunque el template usa una carpeta llamada `.opencode`, lo que realmente se soporta es el **sistema agéntico preparado para un entorno LLM específico**.

Hoy el soporte está así:

| Entorno | Estado de soporte | Notas |
| --- | --- | --- |
| `opencode` | Oficial | Entorno soportado actualmente para comandos, agentes y estructura incluida en el template. |
| `codex` | No soportado por ahora | Puede reutilizar parte del repo, pero no tiene soporte oficial. |
| `cursor` | No soportado por ahora | Puede reutilizar parte del repo, pero no tiene soporte oficial. |
| Otros | No soportado por ahora | No se garantiza compatibilidad ni mantenimiento. |

**Soporte oficial actual: solo `opencode`.**

Este template está pensado para trabajar con el sistema definido en `.opencode` dentro de `opencode`.
Incluye comandos, configuración y estructura orientada a ese entorno.

Si lo usás fuera de `opencode`, parte del template puede seguir sirviendo, pero el soporte formal del paquete está enfocado únicamente en:

- `opencode`
- el sistema agéntico definido dentro de `.opencode`
- `.opencode/agents`
- `.opencode/commands`
- el flujo de trabajo previsto para ese entorno

## Desarrollo local

Si querés probar el CLI localmente desde este repo:

```bash
node bin/create-playwright-testing-repo.js my-tests
node bin/create-playwright-testing-repo.js --update .
node bin/create-playwright-testing-repo.js --migrate .
```

## Tests del paquete

El paquete incluye tests automatizados del CLI:

```bash
node --test bin/create-playwright-testing-repo.test.js
```

## Idea central

**Spec Forge** busca que arranques con una base consistente y evites repetir setup innecesario.
