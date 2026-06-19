---
description: Explore a screen, URL, or flow and propose only useful non-duplicate tests.
agent: test-explorer
subtask: true
---

Explore this target for test opportunities: $ARGUMENTS

Follow the repository testing workflow and AGENTS.md rules.
This command is exploration only: do not modify `.doc.md` or `.test.*` files.
If you detect that a doc or test should change, report it and stop for user approval.
If you cannot identify the target page/module or cannot find the base `.doc.md` / `.test.*` files, stop and tell the user you are blocked because the base files are missing or unclear.
Ask whether this is a module, a page inside another module, part of another flow, or a new page that needs base files created.
Read the relevant `.doc.md` coverage context before evaluating existing tests.
Before proposing coverage, inspect whether the target flow has functional variants such as multiple export/import/download formats, menu sub-actions, filter-dependent behavior, or empty/error states.
If the flow has variants, reflect them explicitly in the proposed scenarios instead of collapsing them into one generic case.
If the contract is ambiguous, call out the exact missing detail that prevents reliable test design.
Summarize current coverage, detect real gaps, reject duplicates, and propose only high-value new test cases.
