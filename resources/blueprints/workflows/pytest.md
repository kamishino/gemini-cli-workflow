---
description: Pytest - Python testing workflow with pytest, fixtures, and coverage
---

# /pytest — Python Testing Workflow

Structured testing with pytest: write fixtures, parametrize, measure coverage.

## Runtime Notes

{{TARGET_OVERLAY}}

{{MODEL_OVERLAY}}

**Intent triggers** — This workflow activates when you say things like:

- "Write pytest coverage for..."
- "Set up pytest fixtures"
- "Run Python testing workflow"
- "Improve Python test reliability"

## When to Use

- Python projects using pytest as the primary test runner.
- Adding fixtures and parametrized tests for business logic.
- Enforcing coverage goals before review/release.

---

## Steps

// turbo

1. **Setup**
   - Verify pytest is installed: `pip install pytest pytest-cov`.
   - Check existing test structure and conventions.
   - Identify the module to test.

2. **Test Plan**
   - List behaviors to test (happy path, edge cases, error cases).
   - Identify fixtures needed (database, API mocks, file system).
   - 🛑 STOP & WAIT for user confirmation.

// turbo

3. **Write Fixtures**
   - Create `conftest.py` with shared fixtures.
   - Use `@pytest.fixture` with appropriate scope (function/module/session).
   - Mock external dependencies with `unittest.mock` or `pytest-mock`.

4. **Write Tests**
   - Naming: `test_<behavior>_when_<condition>`.
   - Use `@pytest.mark.parametrize` for testing multiple inputs.
   - One assertion per test (ideally).

// turbo

5. **Run & Coverage**
   - Run: `pytest -v --cov=<module> --cov-report=term-missing`.
   - Fix any failures.
   - Target: 80%+ coverage on business logic.

6. **Review**
   - Show coverage report.
   - Identify untested paths.
   - 🛑 STOP & WAIT for user review.

---

## Related Workflows

| Workflow  | When to Use                                        |
| :-------- | :------------------------------------------------- |
| `/test`   | Polyglot or non-Python workflows using generic TDD |
| `/review` | Validate test quality before merge                 |
| `/debug`  | Investigate flaky or failing pytest suites         |
