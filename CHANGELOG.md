
## [v2.55.0] - 2026-02-12

### 🚀 Features
- feat(ui): optimize Agentic Recall with stylized Memory Cards (Task 158) (f20b52a)


## [v2.54.0] - 2026-02-12

### 🚀 Features
- feat(ops): implement Autonomous Chronicler with Git Conflict Guard (Task 157) (f1288a4)
- feat: Implement WorkflowEngine to orchestrate Sniper Model lifecycle, manage task states, enforce gates, and persist data in a new workspace database. (593068a)


## [v2.53.0] - 2026-02-12

### 🚀 Features
- feat(rules): enforce Fact-Check Gate and Assumed Answer transparency (Task 156) (3b0de43)


## [v2.52.0] - 2026-02-12

### 🚀 Features
- feat(logic): implement Hybrid Memory Fusion for automated recall (Task 155) (ddb8763)


## [v2.51.0] - 2026-02-11

### 🚀 Features
- feat(logic): implement Resilient Knowledge Graph with Self-healing and TDD (Task 154) (bc24070)
- feat(logic): implement Global Fallback for Knowledge Graph portability (Task 152) (0deef1f)
- feat(ui): implement Hybrid Knowledge Graph Visualization (Task 151) (80e7c9f)
- feat(logic): upgrade Knowledge Graph to v2.0 with Native SQLite FTS5 (Task 150) (e324876)
- feat(logic): implement WorkflowEngine for state-driven orchestration (Task 149) (20b66f8)

### 🐛 Fixes
- fix(ui): resolve node not found error in Knowledge Graph visualization (Task 153) (fcf63ad)

## [v2.47.0] - 2026-02-10

### 🚀 Features

- feat(integration): implemented AntiGravity IDE bridge via .agent/workflows (kamiflow, release, sync)
- feat(infrastructure): implemented Dockefile and Compose support for Sync Backend
- feat(devops): added Portainer support for container management

### 🔧 Improvements

- improvement(quality): enforced strict markdownlint rules on blueprints
- improvement(docs): fixed MD040 code block language tags in all blueprint files

## [v2.38.1] - 2026-02-01

### 🔧 Improvements

- fix(blueprints): corrected step numbering sequence in idea-logic.md PHASE 2
- improvement(consistency): renumbered PHASE 2 steps from 5-9 to 4-8 for continuous flow

### 📝 Technical Details

**Problem:** Step sequence in idea-logic.md had a gap:

- PHASE 1 ended at Step 3
- PHASE 2 started at Step 5 (missing Step 4)
- Created confusion in workflow sequence

**Solution:**

- Renumbered PHASE 2 steps: Step 5→4, Step 6→5, Step 7→6, Step 8→7, Step 9→8
- Creates continuous sequence: PHASE 0 (0.1-0.3) → PHASE 1 (1-3) → PHASE 2 (4-8)

**Files Modified:**

- `resources/blueprints/commands/core/idea-logic.md`
- Re-transpiled to `dist/.gemini/commands/kamiflow/core/idea.toml`

### 🎯 Impact

- **Workflow Clarity:** Continuous step numbering 0.1 → 0.2 → 0.3 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
- **Better Documentation:** No missing steps in the sequence
- **Consistency:** Aligns with other command workflows

## [v2.38.0] - 2026-01-31

### 🔧 Improvements

- refactor(blueprints): fixed heading hierarchy in transpiled command files
- improvement(ux): added visual separator between context-sync and command logic sections
- refactor(structure): renumbered all command logic headings to continue from context-sync (## 4+)
- improvement(readability): eliminated duplicate heading numbers in generated TOML files

### 📝 Technical Details

**Problem:** Command files had conflicting heading numbers:

- context-sync.md used ## 0-3
- All 29 logic files restarted at ## 1-3
- Result: Confusing hierarchy with duplicate section numbers

**Solution:**

- Added `---` separator at end of context-sync.md
- Renumbered all logic file headings to ## 4, ## 5, ## 6, etc.
- Creates single continuous hierarchy in transpiled files

**Files Modified:** 30 blueprint files (1 context-sync + 29 logic files)

- Core: 4 files
- Dev: 7 files
- Ops: 7 files (with corrected subsection numbers)
- Plugins: 11 files

### 🎯 Impact

- **Better Navigation:** Clear content hierarchy in all 28 commands
- **Professional Output:** No duplicate section numbers
- **Visual Clarity:** Separator distinguishes system context from command logic

## [v2.37.0] - 2026-01-31

### 🚀 Features

- feat(v2.0): complete KamiFlow 2.0 public-file-first architecture implementation
- feat(docs): comprehensive documentation reorganization - consolidated all docs into `resources/` as SSOT
- feat(context): created context-intelligence-v2 rule for 60-80% project awareness from public files
- feat(blueprints): refactored context-sync.md to brief system instruction (251 → 61 lines)

### 📚 Documentation

- docs(architecture): created `resources/architecture/` for ADRs and design documents
- docs(reorganization): moved all content from `docs/` to `resources/docs/` and `resources/architecture/`
- docs(structure): established clear separation between user docs and architecture docs
- docs(adr): migrated 3 Architecture Decision Records to `resources/architecture/adr/`
- docs(enhancement): moved KAMIFLOW_ENHANCEMENTS_V2.md to architecture folder

### 🔧 Improvements

- refactor(context-sync): extracted detailed v2.0 protocol to separate rule file
- refactor(placeholders): replaced custom placeholders with instructional text for AI guidance
- refactor(p-swarm): updated plugin documentation to reflect v2.1+ deferral decision
- improvement(blueprints): added ideas/draft folder references to roadmap and save-context logic
- improvement(validation): strict enforcement of YAML frontmatter requirement in blueprints

### 🧹 Chores

- chore(cleanup): removed empty `docs/` folder after migration
- chore(standards): enforced strict `resources/blueprints/` naming conventions

## [v2.36.1] - 2026-01-31

### ✅ Tests

- test: hardened logger test suite with defensive console spy handling and improved error resilience (cfb8d64)

### 🎨 Code Quality

- style: standardized code formatting with Prettier and improved config manager robustness (3bcda11)

## [v2.36.0] - 2026-01-31

### 🚀 Features

- feat(ci/cd): implemented comprehensive release automation and Docker infrastructure (da8e224)
- feat(perf): implemented high-performance blueprint caching and parallel transpilation engine (9e1924e)
- feat(security): hardened CLI initialization, fs-vault path validation, and safe-exec shell handling (040264c)
- feat(core): implemented i18n infrastructure, hardened fs-vault security, and improved installation resilience (83f609d)
- feat(plugins): enhance p-market plugin with ROADMAP integration and competitor analysis
- feat(plugins): implement /kamiflow:p-market:analyze-all for batch discovery curation
- feat(docs): comprehensive v2.0 documentation update (validation, anti-hallucination, checkpoints)
- feat(templates): enhance all templates with v2.0 awareness and metrics
- feat(scripts): update sync/version scripts for v2.0 protocol tracking

### 📚 Documentation

- docs(v2): add V2_MIGRATION_GUIDE.md for seamless upgrade
- docs(overview): document all 5 v2.0 enhancements with examples
- docs(getting-started): add Phase 0.5, validation loop, and checkpoint sections
- docs(power-user): add checkpoint management guide
- docs(troubleshooting): add v2.0 specific issues and solutions

### 🧹 Chores & Others

- chore(release): prepare for v2.36.0 official release
- chore(templates): standardize v2.0 quality metrics across templates

## [v2.35.0] - 2026-01-30

### 🚀 Features

- feat(core): implement high-fidelity config sync and standardized transparent SSOT infrastructure (Tasks 102-104) (bf852e2)
- feat(config): implemented intelligent config sync and hardened CLI UX (Task 101) (a1fc313)

## [v2.34.0] - 2026-01-30

### 🚀 Features

- feat(ops): implemented intelligent onboarding concierge (Task 100) (34c77b3)
- feat(rules): implemented execution discipline, gated automation, and high-risk TDD (Task 099) (017221e)
- feat(ui): implemented intelligent sorting for batch summary tables (Task 098) (ec5953f)
- feat(core): implemented high-performance concurrent engine with atomic writes and summary reporting (Task 097) (51cb36c)
- feat(core): implemented centralized rotational backup hub and aligned doctor/healer (Task 096) (bc9c7bc)
- feat(config): implemented schema-first configuration with Zod validation and functional categorization (Task 095) (e437bd8)
- feat(core): implemented existence-aware seeding and context protection (Task 094) (11792ab)

### 🐛 Fixes

- fix(resources): fixed import bugs and aligned constitution across templates (Task 093) (369624c)

## [v2.33.0] - 2026-01-30

### 🚀 Features

- feat(updater): implemented intelligent sync engine with silent checks and safety guards (Task 092) (9f0106f)

## [v2.32.0] - 2026-01-30

### 🚀 Features

- feat(core): implemented universal POSIX path handling with upath (Task 091) (1acaa64)
- feat(rules): classified rules into Global/Local and upgraded Transpiler for selective distribution (Task 090) (6356f76)
- feat(rules): implemented the industrial constitution - comprehensive rules overhaul (Task 089) (4fa9cce)

## [v2.31.0] - 2026-01-30

### 🚀 Features

- feat(resources): re-organized agents/rules and refreshed gemini.md template (Task 087) (89d6d90)
- feat(core): optimized cli-core with Logger, Config caching and unified paths (Task 085) (47993b8)

### 🧹 Chores & Others

- chore(docs): synchronized gemini.md template and improved build pipeline (Task 088) (91cfacc)
- docs: implemented interactive configuration guide and starter seed (Task 086) (d37219b)

## [v2.30.0] - 2026-01-30

### 🚀 Features

- feat(docs): implemented dynamic documentation with multi-environment sync (Task 083) (7199106)
- feat(core): implemented Stealth Suite cleanup and auto-build automation (Task 082) (8231962)
- feat(installer): implemented permanent alias and multi-mode initialization (Task 081) (edfc61a)

### 🧹 Chores & Others

- chore(release): prepare for v2.30.0 - update roadmap (fccc7ed)
- chore(git): enforced LF line endings and re-anchored README documentation (07b71f1)

## [v2.29.0] - 2026-01-30

### 🚀 Features

- feat(blueprints): unified blueprints structure and performed logic audit (Task 079) (06476a7)
- feat(resources): recovered deleted documentation and migrated to resources/docs/ (Task 077) (f0cdc2a)
- feat(docs): aligned master templates and root instructions with canonical paths (Task 076) (a33ccaa)
- feat(core): unified flat workspace structure and canonical paths (Task 075) (3850c9e)
- feat(core): automated project template assembly for distribution (Task 074) (92d8e1f)
- feat(core): centralized workspace path management with EnvironmentManager (Task 073) (8f7da4a)
- feat(core): implemented Pure Factory Architecture with multi-target transpilation (Task 072) (c23d689)
- feat(templates): synced project templates with new blueprint and semantic rule architecture (bfc9155)
- feat(core): standardized rule naming convention with semantic prefixes (Task 067) (cf40be5)

### 🐛 Fixes

- fix(blueprints): implemented self-healing paths and standardized nested code blocks (Task 080) (5c776c8)
- fix(installer): ensured docs/blueprint and required directories are copied during init (c9f68d4)

### 🧹 Chores & Others

- chore(release): prepare for v2.29.0 - update roadmap and scripts (03435c4)
- docs: harmonized documentation, fixed emojis, and updated paths (Task 078) (906eff3)

## [v2.28.0] - 2026-01-29

### 🚀 Features

- feat(core): grand architecture refactor for universal transpiler (Task 066) (2eda19c)
- feat(core): implement universal atomic transpiler for multi-agent support (Task 065) (83070bb)
- feat(config): implement hierarchical configuration system (Task 064) (19db667)

## [v2.27.0] - 2026-01-29

### 🚀 Features

- feat(seed): implement seed hub v2 with smart incubator and quality gating (Task 063) (0a4133c)

### 🐛 Fixes

- fix(seed): sync p-market discovery workflow and folder structure (Task 063) (1c0b2ed)

### 🧹 Chores & Others

- docs(core): grand documentation audit and prompt standardization (83c6160)

## [v2.26.0] - 2026-01-29

### 🚀 Features

- feat(docs): implement intelligent doc auditor and healer (Task 061) (64c4552)

### 🧹 Chores & Others

- legal: setup MIT license and trademark policy (Task 062) (37c574f)

## [v2.25.0] - 2026-01-29

### 🚀 Features

- feat(automation): implement saiyan and supersaiyan modes for autonomous execution (Task 058) (f61b1ce)

### 🧹 Chores & Others

- docs(wiki): sync command reference with v2.24 features (Task 060) (eb6a21d)
- docs: refresh documentation ecosystem for v2.24 (Task 059) (ec0cac3)
- refactor(commands): standardize toml prompts for architecture consistency (Task 057) (643f114)

## [v2.24.0] - 2026-01-29

### 🚀 Features

- feat(archive): implement non-interactive mode and ai optimization (Task 056) (5955261)
- feat(release): implement atomic polish (roadmap & docs sync) (Task 054) (8b1e45e)

### 🧹 Chores & Others

- chore(root): cleanup redundant npm config files (Task 055) (8d2da30)

## [v2.22.0] - 2026-01-28

### 🚀 Features

- feat(p-swarm): implement sub-agent swarm engine with concurrency locks (0794e48)
- feat(p-market): implement market planner and improvement engine (9d6b17d)

## [v2.21.1] - 2026-01-28

### 🚀 Features

- feat(docs): overhaul documentation fidelity and implement interactive wiki features (f000aa3)

## [v2.21.0] - 2026-01-28

### 🚀 Features

- feat(installer): align scaffolding and templates with dogfooding experience (36cee3c)
- feat(autopilot): implement Intelligent SuperLazy and Roadmap SSOT (9075c78)
- feat(core): implement workflow harmonizer and suffix integrity (5cc2de3)

### 🧹 Chores & Others

- docs: update roadmap and project context for v2.20.0 (b92690d)

## [v2.20.0] - 2026-01-28

### 🚀 Features

- feat(p-agents): implement multi-agent collaboration bridge with safe audit gate (1cbcbca)

## [v2.19.0] - 2026-01-28

### 🚀 Features

- feat(core): implement Unified Idea-to-Task Supply Chain (41fd35d)
- feat(docs): upgrade roadmap to a Strategic PO Dashboard (6f31ecc)
- feat(seed): upgrade to Seed Hub v2 with Prepend History and AI-driven UX (0270ab3)

### 🐛 Fixes

- fix(core): remove sync markers and switch to direct imports to eliminate ImportProcessor errors (e638a58)

## [v2.18.0] - 2026-01-28

### 🚀 Features

- feat(rules): enforce Prompt-Only standard and PowerShell protocol (c28b03b)
- feat(core): implement Universal Plugin Sync and Prompt-Only standard (0f30651)
- feat(core): standardize Seed Hub plugin and create Plugin Blueprint (11cf79c)
- feat(docs): integrate Seed Hub (Experiments) branding and documentation (3380e7f)
- feat(core): implement Idea Sandbox (The Lab) with /draft and /analyze commands (5edafc5)

### 🐛 Fixes

- fix(core): fix ImportProcessor tokens in GEMINI.md and update templates (2dc16b6)

## [v2.17.1] - 2026-01-27

### 🚀 Features

- feat(core): implement Hidden Core architecture v3.0 and self-healing portals (db9f1eb)

### 🧹 Chores & Others

- docs(audit): finalize system health report for v2.17.0 architecture (d1bf1f8)

## [v2.17.0] - 2026-01-27

### 🚀 Features

- feat(core): implement Hidden Core architecture v3.0 and self-healing portals (db9f1eb)

## [v2.16.7] - 2026-01-27

### 🧹 Chores & Others

- refactor(rules): consolidate manifesto and coding styles into high-density SSOT and upgrade tech-stack engine (190d301)

## [v2.16.6] - 2026-01-27

### 🧹 Chores & Others

- refactor(rules): consolidate execution rules to SSOT and implement strict instruction tone (003e451)

## [v2.16.5] - 2026-01-27

### 🧹 Chores & Others

- refactor(core): consolidate knowledge base into rules and optimize distribution for linked mode (f470044)

## [v2.16.4] - 2026-01-27

### 🐛 Fixes

- fix(docs): patch command sync bug and refactor terminal guide for power users (1024faf)

## [v2.16.3] - 2026-01-27

### 🚀 Features

- feat(branding): implement aesthetic centered header with custom badges and banner placeholder (6a81c8d)

## [v2.16.2] - 2026-01-27

### 🚀 Features

- feat(docs): implement interactive OS Navigator and Global Navbar across all pages (f59d25e)

## [v2.16.1] - 2026-01-27

### 🚀 Features

- feat(docs): overhaul documentation to Encyclopedia-style Wiki and simplify README (42ceb47)

## [v2.16.0] - 2026-01-27

### 🚀 Features

- feat(cli): standardize brand to kamiflow and implement flow-based commands with config engine (924d12b)
- feat(install): implement universal bash installer for Mac and Linux and update docs (1958190)

## [v2.15.9] - 2026-01-26

### 🚀 Features

- feat(docs): standardized all artifacts to english and improved TOML string safety (6a50e77)

## [v2.15.8] - 2026-01-26

### 🚀 Features

- feat(core): upgrade BUILD engine to Senior Architect standard with Subtasks and TDD (1243c52)
- feat(docs): categorize command documentation by logic flow and implement grouped markers (8b39aa0)

### 🐛 Fixes

- fix(scripts): improve version sync regex to prevent string accumulation in PROJECT_CONTEXT.md (1abbcfa)

## [v2.15.7] - 2026-01-26

### 🚀 Features

- feat(docs): categorize command documentation by logic flow and implement grouped markers (8b39aa0)

## [v2.15.7] - 2026-01-26

### 🚀 Features

- feat(docs): implement smart command-doc synchronizer and placeholders (7f62377)
- feat(core): implement structured diagnostic retention in S1-IDEA (12c5b26)
- feat(core): implement universal TOML quality gate and auto-healing for all AI agents (005f295)

### 🐛 Fixes

- fix(docs): repair command list regex and populate full command reference (a3c38ec)

## [v2.15.4] - 2026-01-26

### 🚀 Features

- feat(ops): implement interactive mentor system with /help and /tour commands (e6db1e1)

## [v2.15.3] - 2026-01-26

### 🚀 Features

- feat(ops): implement smart onboarding protocol in /wake command (27aeb2a)

### 🐛 Fixes

- fix(ops): use forward slashes and ultra-safe TOML syntax in wake.toml (df0de82)
- fix(cli): update next steps instruction to use modular wake command (48058d8)

## [v2.15.2] - 2026-01-26

### 🐛 Fixes

- fix(docs): correct modular command separators and sync v2.15.1 standards (e461da4)

### 🧹 Chores & Others

- docs: refactor onboarding documents with dual-track track and modular syntax (5d80272)

## [v2.15.1] - 2026-01-26

### 🐛 Fixes

- fix(config): strip BOM characters from TOML files to fix parser error (d6d2d34)

## [v2.15.0] - 2026-01-26

### 🚀 Features

- feat(workflow): implement modular command architecture and context synchronization preamble (039c3a3)

## [v2.14.0] - 2026-01-26

### 🚀 Features

- feat(workflow): implement self-healing wake logic and enhanced version sync (8d9019a)

## [v2.13.0] - 2026-01-26

### 🚀 Features

- feat(workflow): implement session language selection and revise guard (96b37dd)

### 🐛 Fixes

- fix(scripts): use date-based tag sorting to correct changelog range (4441b36)

## [v2.12.0] - 2026-01-26

### 🚀 Features

- feat(dist): implement universal cross-os installer via npx (c8e98e8)

### 🐛 Fixes

- fix(scripts): exclude release commits from changelog generation (c74c02a)

# Changelog


## [v2.43.0] - 2026-02-05

### 🐛 Fixes
- fix(system): restored system integrity and protected token documentation (Task 109) (7e616ce)

### 🧹 Chores & Others
- refactor(rules): standardized all rule naming and metadata (Task 108) (a4037f9)
- refactor(rules): completed universal rule modularity and fixed sync-docs script (Task 107) (2b5f736)
- test(rules): verified Token efficiency savings via benchmark (Task 106) (6d4d2ae)
- refactor(rules): optimized Token usage by splitting rules into core and library modules (Task 105) (edbd129)


## [v2.39.0] - 2026-02-02

### 🚀 Features
- feat(v2.39): add skills, pnpm monorepo, MoSCoW/Risk frameworks, CRISP doc (a1432a8)
- feat(v2.40): add Jest config, deprecate dashboard, and expand skills documentation (542ca2a)
- feat(skills): add Sniper Model assistant skill and integrate skills into core workflow (v2.40) (51ea96d)
- feat(blueprints): add Fast Track classification and Bridge output modes to Sniper workflow (v2.39) (8372e5c)
- feat(core): integrate cascade architecture into sniper model (e89ddf1)
- feat(architecture): add comprehensive Cascade request processing analysis and KamiFlow integration guide (21f2007)
- feat(v2.0): complete KamiFlow 2.0 implementation and documentation reorganization (de37d1a)
- feat(kamiflow): enhanced v2.0 context synchronization and validation protocols across Sniper workflow (2cbb3b4)
- feat(blueprints): enhanced the p-market commands and reflected the document v2.0 (1be18ec)
- feat(blueprints): implemented comprehensive anti-hallucination verification and error recovery protocols across Sniper workflow (2e31960)
- feat(blueprints): enhanced anti-hallucination safeguards and validation protocols across Sniper workflow (468e9e1)
- feat(ci/cd): implemented comprehensive release automation and Docker infrastructure (da8e224)
- feat(perf): implemented high-performance blueprint caching and parallel transpilation engine (9e1924e)
- feat(security): hardened CLI initialization, fs-vault path validation, and safe-exec shell handling (040264c)
- feat(core): implemented i18n infrastructure, hardened fs-vault security, and improved installation resilience (83f609d)

### 🐛 Fixes
- fix(blueprints): corrected step numbering sequence in idea-logic.md PHASE 2 from 5-9 to 4-8 for continuous workflow (5acaa72)

### 🧹 Chores & Others
- chore(release): 2.39.0 [Task 026] - Cascade Architecture Integration (4e1874d)
- chore(release): 2.38.0 (dddccbd)
- chore(release): 2.37.0 (4224fb1)
- chore(release): 2.36.1 (7ca0862)
- chore(release): 2.36.0 (22d6c89)
- docs(core): streamlined GEMINI.md and enhanced bridge/resume protocols with v2.0 validation and anti-hallucination safeguards (5f70e06)
- refactor(blueprints): fix heading hierarchy in command files (v2.38.0) (d1bc5a3)
- test: hardened logger test suite with defensive console spy handling and improved error resilience (cfb8d64)
- style: standardized code formatting with Prettier and improved config manager robustness (3bcda11)

All notable changes to this project will be documented in this file.

## [v2.11.0] - 2026-01-26

### 🚀 Features

- feat(cli): implement smart release command and versioning workflow (5ca60a0)

## [v2.10.1] - 2026-01-26

### 🚀 Features

- feat(workflow): implement native npm version sync and changelog automation (9723a93)
- feat(core): integrate TOML validator and fix command escaping syntax (b80bd4e)
- feat(core): implement gated sniper workflow for lazy modes (3fe9880)
- feat(core): implement atomic exit protocol for autonomous builder (ccba642)
- feat(core): enforce documentation synchronization in sniper workflow (9f6a151)
- feat(cli): implement universal update command and conflict guard (4145cd2)
- feat(dist): implement zero-friction one-liner installer (49115ea)
- feat(cli): implement self-healing engine and autonomous onboarding (f2b7982)
- feat(cli): transform kamiflow into global npm utility (5201b18)
- feat(onboarding): implement smart seed v2.0 with same-window continuation (c0ac1f7)
- feat(onboarding): implement self-relocating bootstrapper and integration choice (6680d00)
- feat(onboarding): implement universal smart bootstrapper script and update links (f815c7d)
- feat(core): standardize documentation structure and implement hybrid portal (e66b687)
- feat(submodule): implement intelligent bootstrapper and symlink portal system (7223a10)
- feat(logic): implement smart session logic and logical guard for idea phase (6109c24)
- feat(sync): implement unified global sync with readme showcase (1ccdbc2)
- feat(id): implement global id tracker with recursive archive scanning (8bd9f35)
- feat(superlazy): implement smart validator loop with self-healing (0abf8e5)
- feat(archive): implement smart archive system and refactor sync cleanup (4018799)
- feat(idea): implement two-phase diagnostic interview workflow (8843d7f)
- feat(sync): implement smart git sync logic with dirty tree detection (8b17d7c)
- feat(sniper): implement fused 3-step kernel with 3-layer locks (c065ef6)
- feat(autopilot): implement lazy and superlazy modes for automated development (b91a5ef)
- feat(recovery): implement session recovery protocol with wake command and lazy checks (777b0b7)
- feat(sync): implement git amend strategy for clean documentation commits (aa9cf05)
- feat(bridge): implement optimized S1-S4 naming and auto-handoff protocol (ef8872e)
- feat(quality): add integrated quality gates to task workflow (856e803)
- feat(cook): replace verify command with interactive cook command (ebb35b9)
- feat: release KamiFlow Template v1.1 - Centralized Docs & Starter Templates (0bb0544)
- feat(starter): add project initialization templates and config (602bad5)
- feat: implement centralized document management in /tasks/ (75daaad)
- feat: release KamiFlow Template v1.0 (d3f75a9)

### 🐛 Fixes

- fix: upgrade command definitions with enhanced validation and file output (d43215f)
- fix: embed markdown prompts into TOML command definitions (373b2cc)

### 🧹 Chores & Others

- chore(standard): global english standardization and language tokenization (b92dfb2)
- chore(cleanup): remove legacy commands and complete sniper transition (0ee3672)
- chore(bridge): Update handoff logs with the naming convention (d067e85)
- chore: enforce strict bilingual language protocol (aa7b720)
- chore: final polish for v1.0 release (593969e)
- docs(fix): add .\ prefix for PowerShell compatibility in command examples (3d4b4fa)
- docs(onboarding): implement multi-track integration guide and troubleshooting (b5a34eb)
- docs(protocols): sync documentation with Sniper Model and Validator Loop (4ef6539)
- refactor: migrate custom commands to TOML format (90f7f65)
