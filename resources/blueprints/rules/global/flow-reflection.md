---
name: flow-reflection
type: RULE
description: Strategic reflection and exit protocol for Phase 4
group: execution
order: 60
---

# 🎯 Protocol: Strategic Exit & Reflection

> **Purpose:** Transform task completion from "done" to "done with wisdom" through structured reflection and quality gates.

---

## 1. Pre-Exit Quality Gate

### The Commitment Checklist

**MANDATORY: All items must PASS before proceeding to reflection.**

```markdown
## 🔒 Quality Gate Checklist

- [ ] **All Tests Pass** (if TDD applied)
  - Unit tests: 100% pass rate
  - Integration tests: All critical paths verified
  - Command: `npm test`

- [ ] **No Lint Errors**
  - ESLint: 0 errors (warnings acceptable)
  - TOML validator: All .toml files valid
  - Command: `npm run lint`

- [ ] **TOML Validation Clean** (if .toml modified)
  - All command files parse correctly
  - No triple-slash escape issues
  - Command: `node cli-core/validators/toml-validator.js`

- [ ] **Documentation Updated**
  - README.md reflects new features (if public-facing)
  - API.md updated (if API changed)
  - ROADMAP.md checkboxes marked (if applicable)

- [ ] **No Unaddressed TODOs**
  - Search: `grep -r "TODO\|FIXME\|HACK" <modified files>`
  - Either fix or create follow-up task
  - Document deferred items in reflection

- [ ] **Module Size Limit**
  - No file exceeds 300 lines (KamiFlow standard)
  - If exceeded: Refactor or justify in reflection
  - Command: `wc -l <files>`

- [ ] **Git Status Clean**
  - No uncommitted changes to non-task files
  - All task artifacts in proper directories
  - Command: `git status`
```

**Gate Logic:**
```
IF any item FAILS:
  → STOP immediately
  → Fix the issue
  → Re-run checklist
  → Only proceed when all PASS

IF all items PASS:
  → Proceed to Strategic Reflection (Step 2)
```

---

## 2. Strategic Reflection Template

### Purpose
Transform implementation experience into actionable insights for future tasks.

### Reflection Report Format

```markdown
# 🧠 Strategic Reflection: Task [ID]

**Task:** [ID]-[slug]
**Completed:** [YYYY-MM-DD HH:MM]
**Duration:** [X hours/days]
**Complexity:** [Low/Medium/High]

---

## 1. Value Delivered 💎

**One-Sentence Impact:**
[What changed? What problem is now solved?]

**Examples:**
- "Users can now authenticate via OAuth2, reducing signup friction by 80%."
- "Blueprint caching reduces transpiler load time from 2.5s to 0.3s."
- "Plugin marketplace infrastructure enables community extensions."

**Measurable Outcomes (if applicable):**
- Performance: [Before] → [After]
- User Impact: [Metric improvement]
- Code Quality: [Coverage increase, debt reduction]

---

## 2. Technical Debt Assessment 🏗️

**Debt Level:** [None | Minor | Significant]

**Details:**
[What was compromised for speed? What shortcuts were taken?]

**None Example:**
"No technical debt. All edge cases handled, tests comprehensive, code follows standards."

**Minor Example:**
"Input validation is basic (type checks only). Advanced validation (regex, range checks) deferred to Task 108."

**Significant Example:**
"Used synchronous file operations for MVP. Needs async refactor in Task 110 to handle large files (>1MB)."

**Payback Plan:**
- [ ] [Action item to address debt]
- [ ] [Estimated in Task ID or timeframe]

---

## 3. Lessons Learned 🎓

**Key Insight #1: [What Went Well]**
[What approach, tool, or decision accelerated progress?]

**Example:**
"Lock 3 (Legacy Awareness) prevented duplicate code. Reconnaissance found existing `sanitizePath()` function, saved 2 hours."

**Key Insight #2: [What Could Be Improved]**
[What friction occurred? What would you do differently next time?]

**Example:**
"TOML triple-slash escaping caused 3 validation failures. Lesson: Always use triple-single-quotes for prompts."

**Bonus Insight (optional):**
[Surprising discovery, pattern recognized, or tool recommendation]

---

## 4. Follow-up Tasks 📋

**Dependencies Created:**
- [ ] Task [ID]: [Brief description of necessary follow-up]
- [ ] Task [ID]: [Another dependency]

**Improvements Identified:**
- [ ] [Optional enhancement for future consideration]
- [ ] [Another improvement idea]

**None Example:**
"No follow-up tasks. Feature is complete and self-contained."

**With Follow-ups Example:**
"- [ ] Task 109: Add email notification for OAuth failures
 - [ ] Task 110: Refactor to async file operations
 - [ ] Improvement: Consider adding OAuth provider analytics"

---

## 5. Risk Assessment 🚨

**Regression Risk:** [Low | Medium | High]

**Explanation:**
[What could break? What areas are fragile?]

**Low Example:**
"New feature is isolated in separate module. No changes to core logic. Regression risk minimal."

**High Example:**
"Modified core transpiler logic. High risk of affecting all blueprint processing. Requires thorough testing in production."

**Mitigation:**
[What safeguards are in place?]
- Tests cover X% of new code
- Feature flag: `enableNewFeature = false` (default off)
- Monitoring: Track error rates in production

---

## 6. Reflection Summary (Auto-Generated)

**For ROADMAP.md {{ACHIEVEMENTS}}:**
```
- ✅ [Task ID]: [slug] - [One-sentence value delivered]
```

**For Git Commit Body:**
```
Value: [One-sentence impact]
Tech Debt: [None/Minor/Significant]
Follow-up: [Task IDs or "None"]
```
```

---

## 3. Lineage Management Protocol

### Purpose
Clean up task artifacts and update project state for next session.

### Step 3.1: Archive Current Task

**Command:**
```bash
node cli-core/bin/kami.js archive [ID] --force
```

**What Happens:**
- Move `tasks/[ID]-*.md` files to `archive/YYYY-MM-DD_[ID]_[slug]/`
- Preserve all S1-S4 artifacts
- Update archive index
- Free up `tasks/` directory for active work

**Verification:**
```bash
ls tasks/       # Should not contain archived task files
ls archive/     # Should contain new dated folder
```

---

### Step 3.2: Update ROADMAP.md

**File:** `{{KAMI_WORKSPACE}}ROADMAP.md`

**Placeholders to Replace:**

1. **{{ACHIEVEMENTS}}**
   ```markdown
   Replace with:
   - ✅ [YYYY-MM-DD] Task [ID]: [slug] - [One-sentence value]
   ```

2. **{{GROWTH_LEVERS}}**
   ```markdown
   Replace with follow-up tasks from reflection:
   - [ ] Task [ID]: [Description]
   - [ ] Task [ID]: [Description]
   
   If no follow-ups:
   - Continue optimizing core workflow stability
   ```

**Example Update:**
```markdown
## 🏁 Strategic Achievements
- ✅ 2024-01-30 Task 042: oauth-integration - Users can now authenticate via OAuth2
- ✅ 2024-01-29 Task 041: blueprint-cache - Transpiler load time reduced by 87%

## 🚀 AI-Suggested Growth Levers
- [ ] Task 043: Email notifications for OAuth failures
- [ ] Task 044: Async file operations for large blueprint processing
```

---

### Step 3.3: Update PROJECT_CONTEXT.md

**File:** `{{KAMI_WORKSPACE}}PROJECT_CONTEXT.md`

**Section to Update:** `## 2. Active Context (The "Now")`

**Fields to Modify:**

1. **Last Completed Action:**
   ```markdown
   [One-sentence summary of what was just completed] (Task [ID])
   ```

2. **Current Focus:**
   ```markdown
   [What's the next priority area or phase?]
   ```

3. **Next Step:**
   ```markdown
   [Specific next action or task to tackle]
   ```

**Example Update:**
```markdown
## 2. Active Context (The "Now")

- **Last Completed Action:** Implemented OAuth2 authentication with Google/GitHub providers (Task 042)
- **Current Focus:** Performance optimization and caching enhancements
- **Next Step:** Build async file operation refactor (Task 044)
```

---

## 4. Atomic Commit Protocol

### Conventional Commit Format

**Structure:**
```
<type>(<scope>): <subject> (Task <ID>)

<body - reflection summary>

<footer - metadata>
```

### Components

**Type:** (from Conventional Commits)
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `docs`: Documentation only
- `test`: Test additions/changes
- `chore`: Tooling, deps, config

**Scope:** (functional area)
- `auth`, `cache`, `cli`, `plugin`, `workflow`, etc.

**Subject:** (imperative, lowercase, no period)
- 50 chars max
- Example: `add oauth2 authentication support`

**Task ID:**
- `(Task 042)` for traceability

**Body:** (reflection summary)
```
Value: [One-sentence impact from reflection]
Tech Debt: [None/Minor/Significant]
Follow-up: [Task IDs or "None"]

[Optional: Additional context or breaking changes]
```

**Footer:** (optional)
- `Closes #issue-number`
- `BREAKING CHANGE: description`

---

### Example Commits

**Example 1: Feature with No Debt**
```
feat(auth): add oauth2 authentication support (Task 042)

Value: Users can now authenticate via OAuth2, reducing signup friction by 80%
Tech Debt: None
Follow-up: Task 043 (email notifications)

Implements Google and GitHub OAuth providers with JWT token generation.
All edge cases handled, 95% test coverage.
```

**Example 2: Performance with Minor Debt**
```
perf(cache): implement blueprint caching system (Task 041)

Value: Transpiler load time reduced from 2.5s to 0.3s (87% improvement)
Tech Debt: Minor - Cache invalidation is time-based only, not content-hash-based
Follow-up: Task 045 (content-aware cache invalidation)

Uses LRU cache with TTL and file mtime validation.
```

**Example 3: Refactor with Significant Debt**
```
refactor(transpiler): add parallel blueprint processing (Task 040)

Value: Batch blueprint processing now 3x faster with concurrency control
Tech Debt: Significant - Error handling in parallel mode needs hardening
Follow-up: Task 046 (robust error recovery in parallel mode)

BREAKING CHANGE: Transpiler constructor now requires cache instance.
Migration: Update all Transpiler instantiations to pass BlueprintCache.
```

---

## 5. Execution Checklist (Phase 4 Summary)

**Use this as a quick reference during Strategic Exit:**

```markdown
## 🎯 Phase 4: Strategic Exit Checklist

**Step 4.1: Quality Gate**
- [ ] All tests pass
- [ ] No lint errors
- [ ] TOML validation clean
- [ ] Documentation updated
- [ ] No unaddressed TODOs
- [ ] Module sizes < 300 lines

**Step 4.2: Reflection**
- [ ] Value delivered (1-sentence)
- [ ] Technical debt assessed
- [ ] Lessons learned documented
- [ ] Follow-up tasks listed

**Step 4.3: Lineage**
- [ ] Task archived: `kami archive [ID] --force`
- [ ] ROADMAP.md updated (achievements, growth levers)
- [ ] PROJECT_CONTEXT.md updated (active context)

**Step 4.4: Commit**
- [ ] Conventional commit format
- [ ] Reflection summary in body
- [ ] Traceability: (Task [ID])
- [ ] Git push complete

**Final Verification:**
- [ ] `git log -1` shows correct commit message
- [ ] `ls tasks/` does not show archived task
- [ ] ROADMAP.md reflects new achievement
```

---

## 6. Automation Opportunities

### Future Enhancement Ideas

**Auto-Reflection:**
- Parse git diff to suggest value statement
- Analyze TODO comments for debt assessment
- Count test additions for quality metrics

**Auto-Lineage:**
- Script to replace ROADMAP placeholders
- Template-based PROJECT_CONTEXT updates
- Git hooks for commit message validation

**Current State:**
- Manual execution via `/kamiflow:dev:superlazy` Phase 4
- AI generates reflection using this template
- Human reviews and confirms before commit

---

## 7. Integration Points

### Called By
- `/kamiflow:dev:superlazy` (Phase 4)
- `/kamiflow:dev:lazy` (after validation)
- Manual invocation for task completion

### Depends On
- `@.gemini/rules/flow-validation.md` (must pass before reflection)
- `cli-core/bin/kami.js archive` command
- Git working directory

### Outputs
- Reflection report (markdown document)
- Updated ROADMAP.md
- Updated PROJECT_CONTEXT.md
- Git commit with conventional format

---

## ✅ Success Criteria

**Phase 4 is successful when:**
1. Quality gate catches all defects before shipping
2. Reflection provides actionable insights (not generic fluff)
3. Lineage management keeps project state accurate
4. Commits are traceable and semantic
5. Future contributors understand what was built and why

---

## 🔗 Related Protocols

- `@.gemini/rules/flow-validation.md` - Validation before reflection
- `@.gemini/rules/error-recovery.md` - Handling Phase 4 failures
- `@.gemini/rules/flow-execution.md` - Strategic Atomic Exit reference
