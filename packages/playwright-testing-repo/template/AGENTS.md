# AGENTS.md

## Purpose

This project uses AI to generate and maintain automated tests.
The AI must work module by module and avoid duplicate coverage.

## Test organization

- Tests are grouped by module.
- Each module contains one or more pages/screens.
- Each page must have these files:
  - `module/page/[page].test.*`
  - `module/page/[page].doc.md`

Example:

```text
users/
  login/
    login.test.ts
    login.doc.md
```

## Meaning of each file

### `[page].test.*`
- Contains the automated tests for that page.
- Must cover only valuable scenarios for that page.
- Must not repeat cases already covered in the same module unless there is a clear reason.

### `[page].doc.md`
- Contains lightweight context for the page.
- Documents what was already tested.
- Helps the AI understand current coverage before proposing new tests.

Required structure:

```md
## <Page name>

Short lightweight context for the page.

### Descripción breve

One short paragraph describing the page purpose.

### Contexto funcional relevante

- Relevant functional notes for the page
- Authentication or access requirements
- Main controls, actions, or important UI behavior
- Environment/config notes when relevant

### Escenarios

| id | objetivo | validacion esperada | impacto para la pantalla | riesgo sobre datos | integracion en test |
| --- | --- | --- | --- | --- | --- |
| 1 | ... | ... | alto/medio/bajo | alto/medio/bajo | activo/pendiente/deprecado |
```

## Mandatory AI workflow before creating tests

Before adding or proposing tests, the AI must:

1. Explore the target module.
2. Read the page `.doc.md` files and existing tests.
3. Identify which scenarios are already covered.
4. Evaluate proposed tests against existing coverage.
5. Reject duplicated or low-value tests.
6. Only then suggest or implement new tests.

## Anti-duplication rule

The AI must not create or suggest tests just for quantity.
