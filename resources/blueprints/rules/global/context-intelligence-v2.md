---
name: context-intelligence-v2
type: rule
description: v2.0 protocol for loading 60-80% project awareness from public git-tracked files
group: global
order: 85
---

# 🧠 Context Intelligence v2.0 Protocol

> **Goal:** Enable 60-80% project awareness across all machines using only git-tracked public files (PROJECT_CONTEXT.md, ROADMAP.md).

---

## 1. CORE PHILOSOPHY

**"Public-First Architecture"** - Intelligence must persist across all development machines without database dependency.

**Design Principles:**
1. **Public-First:** PROJECT_CONTEXT.md + ROADMAP.md provide 60-80% awareness alone
2. **Private-Optional:** Archive/tasks/ideas folders enhance but don't gate functionality
3. **Export-Before-Hide:** Always export intelligence to public files before archiving
4. **Incremental Updates:** Append to ROADMAP, don't regenerate from scratch
5. **Cross-Machine Consistency:** Same AI awareness on all PCs via git
6. **No Database Needed:** All intelligence is git-tracked text files

---

## 2. PUBLIC FILE INTELLIGENCE EXTRACTION

### Step 1: Load PROJECT_CONTEXT.md

**Read full file and extract:**

1. **Project Identity:**
   - Goal, Current Phase, Key Tech Stack
   - Tour completion status

2. **Active Context (The "Now"):**
   - Last Completed Action (what was just finished)
   - Current Focus (what we're working on)
   - Next Step (what's next)

3. **Session State (v2.0 section if exists):**
   - Active Work summary
   - Discovery Pipeline status (counts + topics)
   - Checkpoints (paused workflows)
   - Quality Metrics snapshot
   - Follow-Up Queue (next actions)
   - Tech Debt Flagged

4. **Knowledge Map:**
   - Core Architecture (directory structure)
   - User-Facing components
   - DevOps & CI/CD setup
   - Plugin System

**Mental Model Building:**
- Tech Stack Verification: Note all libraries/frameworks mentioned
- Architecture Understanding: Build directory structure mental map
- Current State: Understand what's in progress vs completed
- Quality Baseline: Note validation rates, error patterns

### Step 2: Load ROADMAP.md

**Read full file and extract:**

1. **Strategic Achievements:**
   - Recent completions (last 5-10)
   - Value delivered per achievement
   - Quality metrics (if present)
   - Lessons learned

2. **Current Focus:**
   - Active Phase/Version
   - Strategic Status summary

3. **Growth Levers:**
   - Strategic initiatives suggested
   - Market opportunities identified

4. **Timeline & Progress:**
   - Completed tasks
   - In Progress tasks
   - Backlog items

5. **Quality Metrics (v2.0):**
   - Validation pass rate
   - Hallucination incidents
   - Error auto-resolution rate
   - Tech debt score
   - Checkpoint resumes

6. **Market Intelligence (if exists):**
   - Discovery pipeline status
   - Competitive insights

**Strategic Alignment:**
- Goal Understanding: What is this project trying to achieve?
- Progress Context: How far along are we?
- Quality Status: Are we maintaining high standards?
- Market Position: What differentiates us?

### Step 3: Cross-Reference & Validation

**Consistency Check:**
1. Compare PROJECT_CONTEXT "Last Action" with ROADMAP "Current Focus"
2. Verify active tasks align between files
3. Check if quality metrics are consistent
4. Note any staleness (last updated dates)

**60-80% Awareness Checkpoint:**
- ✅ Project goals clear
- ✅ Tech stack understood
- ✅ Current work context loaded
- ✅ Strategic direction aligned
- ✅ Quality baseline established
- ✅ Next actions identified

---

## 3. OPTIONAL PRIVATE FOLDER ENRICHMENT

**If available locally** (graceful degradation if missing):

### Scan Active Tasks (Optional)
- Directory: `{{KAMI_WORKSPACE}}tasks/`
- Purpose: Enrich active work understanding
- Cross-check with PROJECT_CONTEXT Session State

### Scan Discovery Pipeline (Optional)
- Directories: 
  - `{{KAMI_WORKSPACE}}ideas/discovery/`
  - `{{KAMI_WORKSPACE}}ideas/backlog/`
  - `{{KAMI_WORKSPACE}}ideas/draft/`
- Purpose: Verify discovery counts from PROJECT_CONTEXT
- Note any new ideas not yet documented

### Check Checkpoints (Optional)
- Directory: `{{KAMI_WORKSPACE}}.kamiflow/checkpoints/`
- Purpose: Verify paused workflows from Session State
- Identify resume opportunities

### Scan Recent Archive (Optional)
- Directory: `{{KAMI_WORKSPACE}}archive/`
- Purpose: Enrich recent completion context
- Verify achievements match ROADMAP

**Rule:** If folders don't exist, **skip gracefully**. Public files provide sufficient context.

---

## 4. SESSION READINESS REPORT FORMAT

After loading intelligence, report status using this format:

```markdown
## 🧠 Context Synchronization Complete

**Intelligence Loaded:** 60-80% project awareness achieved from public files.

**Sources:**
- ✅ PROJECT_CONTEXT.md (Project identity, active context, session state)
- ✅ ROADMAP.md (Strategic achievements, growth levers, quality metrics)
- [Private folder status: Available/Unavailable/Partial]

**Project Understanding:**
- **Goal:** [From PROJECT_CONTEXT]
- **Phase:** [From PROJECT_CONTEXT]
- **Tech Stack:** [Key technologies from PROJECT_CONTEXT]
- **Last Action:** [From PROJECT_CONTEXT Active Context]
- **Current Focus:** [From PROJECT_CONTEXT Active Context]
- **Next Step:** [From PROJECT_CONTEXT Active Context]

**Strategic Context:**
- **Recent Achievements:** [Count] documented in ROADMAP
- **Quality Metrics:** [Validation rate if available]
- **Discovery Pipeline:** [Discovery count] discoveries, [Backlog count] in backlog
- **Tech Debt:** [Count] items flagged

**Session State:**
- **Active Work:** [From PROJECT_CONTEXT Session State]
- **Follow-Up Queue:** [Count] actions
- **Checkpoints:** [Count] paused workflows

---
**Status:** Ready to process requests with full context. Cross-machine consistency: ✅
```

---

## 5. CONTEXT QUALITY VALIDATION

**Before proceeding, verify:**

1. **Critical Sections Present:**
   - PROJECT_CONTEXT.md exists and has "Active Context"
   - ROADMAP.md exists and has "Strategic Achievements"
   - Tech stack is documented
   - At least one recent achievement visible

2. **Data Freshness:**
   - Check "Last Updated" timestamps
   - Warn if PROJECT_CONTEXT > 7 days old
   - Suggest `/kamiflow:ops:save-context` if stale

3. **Missing Data Handling:**
   - If Session State missing: Limited active work context
   - If Quality Metrics missing: Quality tracking not available
   - If Growth Levers missing: Strategic opportunities not documented

**Warning Format:**
```markdown
⚠️ **Context Quality Warnings:**
- PROJECT_CONTEXT last updated [X] days ago (consider refresh)
- Session State section missing (run /kamiflow:ops:save-context)
- ROADMAP has unfilled placeholders (run /kamiflow:ops:roadmap)
```

---

## 6. CROSS-MACHINE CONSISTENCY RULES

**Success Criteria:**
- ✅ Works identically across all PCs
- ✅ No dependency on private folder availability
- ✅ 60-80% awareness from public files alone
- ✅ Private folders enhance but don't gate functionality
- ✅ All data sources are git-tracked or ephemeral

**Verification Checklist:**
- [ ] Loaded PROJECT_CONTEXT.md successfully
- [ ] Loaded ROADMAP.md successfully
- [ ] Extracted current context and strategic direction
- [ ] Noted private folder availability (optional)
- [ ] Built mental model of project state
- [ ] Ready to process user requests with full awareness

---

## 7. INTEGRATION WITH COMMANDS

**All KamiFlow commands should:**
1. Include `context-sync.md` PARTIAL (brief mandate)
2. Reference this rule for detailed intelligence loading protocol
3. Report context quality warnings if detected
4. Work gracefully when private folders unavailable

**Export Commands** (RAM → Disk):
- save-context-logic: Session state to PROJECT_CONTEXT
- archive-logic: Task value to ROADMAP before archiving
- roadmap-logic: Incremental achievement aggregation

**Import Commands** (Disk → RAM):
- wake-logic: 60-80% awareness restoration
- All commands via context-sync.md: Pre-execution context loading

---

**Status:** Active for v2.0 and beyond ✅
