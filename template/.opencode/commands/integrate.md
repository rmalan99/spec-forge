---
description: Implement approved pending doc scenarios as modular tests and validate the target page coverage.
agent: test-integrator
subtask: true
---

Integrate approved test scenarios for this target: $1
Approved scenario ids or range: $2

Follow the repository workflow in AGENTS.md.
If you cannot identify the target page/module or cannot find the base `.doc.md` / `.test.*` files, stop and tell the user you are blocked because the base files are missing or unclear.
Ask whether this is a module, a page inside another module, part of another flow, or a new page that needs base files created.
Read the target `.doc.md` first, then the existing `.test.*`.
Implement only the approved scenario ids, update the `.doc.md` integration status, and validate the target page/module tests.
If modifying or deleting an existing test would be required, stop and notify the user before changing it.
