---
description: Test - TDD workflow for writing tests first, then implementing code to pass them
---

# /test — TDD Workflow

Write tests first, then implement code to make them pass. Red -> Green -> Refactor.

## Runtime Notes

{{TARGET_OVERLAY}}

{{MODEL_OVERLAY}}

**Intent triggers** — This workflow activates when you say things like:

- "Write tests for..."
- "TDD this feature"
- "Add test coverage for..."
- "Create a test suite for..."

## When to Use

- Building new behavior where safety and confidence are critical.
- Reproducing bugs before implementing fixes.
- Increasing coverage on risky modules before refactoring.

---

## Steps

// turbo

1. **Context Load**
   - Read `.memory/context.md` to understand the project state.
   - Identify the testing framework used (Jest, Vitest, Node test runner, Playwright).
   - Check existing test patterns in the codebase.

2. **Define Test Cases**
   - List the behaviors to test:
     - ✅ Happy path (expected behavior)
     - ⚠️ Edge cases (boundary values, empty inputs)
     - ❌ Error cases (invalid input, network failures)
   - 🛑 STOP & WAIT for user to confirm test cases.

// turbo

3. **Write Failing Tests (RED)**
   - Write all test cases with proper descriptions.
   - Use `should [behavior] when [condition]` naming convention.
   - Run the tests — they should ALL FAIL.
   - Show the failing test output as proof.

4. **Implement Code (GREEN)**
   - Write the minimum code to make each test pass.
   - Run tests after each implementation to track progress.
   - Do NOT optimize yet — just make it work.

// turbo

5. **Refactor (REFACTOR)**
   - Clean up the implementation while keeping all tests green.
   - Extract shared logic, improve naming, remove duplication.
   - Run tests one final time to confirm everything still passes.

6. **Coverage Report**
   - Show the final test results and coverage.
   - Identify any untested paths.
   - 🛑 STOP & WAIT: Ask user if additional coverage is needed.

---

## Related Workflows

| Next Step  | When                                                  |
| :--------- | :---------------------------------------------------- |
| `/review`  | Ready for code review after tests pass                |
| `/debug`   | A test is failing and you can't figure out why        |
| `/develop` | Continue building the feature with full test coverage |
