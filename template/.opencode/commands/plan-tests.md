---
description: Orchestrate requirement analysis, context mapping, exploration, and test-case planning without editing files.
agent: test-orchestrator
subtask: true
---

Plan useful test cases for this requirement: $ARGUMENTS

Rules:
- Ask only the minimum blocking question if the requirement is ambiguous.
- Map module/page/doc/test context first.
- Explore existing coverage before proposing anything.
- Use runtime exploration only when behavior cannot be inferred safely from docs/tests.
- Return only useful, non-duplicate cases in a simple table.
- Do not modify `.doc.md` or `.test.*` files.
