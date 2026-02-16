---
name: bench-and-validate
description: Use this skill when completing code changes that may affect CLI performance. It runs benchmarks, compares against history, and alerts on performance regressions before committing.
order: 30
---

# 🏎️ Bench & Validate Skill

Ensures code changes don't introduce performance regressions by integrating benchmark runs into the validation loop.

## When to Activate

- After implementing changes to CLI commands or logic modules
- When modifying file I/O, parsing, or transpilation logic
- Before creating a release
- When user mentions "performance", "slow", "optimize", "benchmark"

## Prerequisites

- Existing benchmark suites in `cli-core/benchmarks/`
- `BenchmarkRunner` class in `cli-core/benchmarks/runner.js`
- Benchmark history in `.kamiflow/benchmarks.json` (auto-created)

---

## Workflow

### Step 1: Run Benchmarks

Execute the benchmark dashboard:

```bash
node cli-core/bin/kami.js perf --compare
```

This will:

1. Run all benchmark suites (config loading, transpiler, CLI startup)
2. Save results to `.kamiflow/benchmarks.json`
3. Compare against the previous run

### Step 2: Analyze Results

Review the output for:

| Signal              | Meaning                | Action              |
| :------------------ | :--------------------- | :------------------ |
| `↓ X% faster`       | Performance improved   | ✅ No action needed |
| `≈ no change`       | Within 5% margin       | ✅ No action needed |
| `↑ X% slower`       | Performance regression | ⚠️ Investigate      |
| `⚠️ exceeded 500ms` | Threshold breach       | 🔴 Must optimize    |

### Step 3: Decision Matrix

- **All green:** Proceed with commit
- **Regression < 10%:** Note in commit message, proceed
- **Regression > 10%:** Investigate root cause before committing
- **Threshold breach:** STOP. Optimize the affected code path

### Step 4: View Trends (Optional)

If you need historical context:

```bash
node cli-core/bin/kami.js perf --history 20
```

Shows sparkline trend charts for each benchmark over the last N runs.

---

## Integration with KamiFlow Phases

| Phase              | When to Run                                  |
| :----------------- | :------------------------------------------- |
| Phase 5 (Validate) | After all tests pass, run `perf --compare`   |
| Phase 6 (Reflect)  | Include perf data in reflection notes        |
| Phase 7 (Release)  | Run full benchmark suite before version bump |

---

## References

- [BenchmarkRunner](file:///c:/Users/toanh/Desktop/Projects/gemini-cli-workflow/cli-core/benchmarks/runner.js) — Core benchmark engine
- [bench-dashboard.js](file:///c:/Users/toanh/Desktop/Projects/gemini-cli-workflow/cli-core/logic/bench-dashboard.js) — Dashboard logic
