# Anti-Patterns & Mistakes Learned

> Auto-updated when the same error occurs 3+ times. AI reads this to avoid repeating mistakes.

<!--
FORMAT:
- **[Category]:** [Instruction to avoid the error]. (Learned [YYYY-MM-DD])

CATEGORIES: Shell, Import, Syntax, Logic, Config, Test, Path, Type
-->

- **[Shell]:** Do NOT use Unix syntax (`&&`, `grep`, `rm -rf`) on Windows/PowerShell.
  Use `;` instead of `&&`, `Select-String` instead of `grep`, `Remove-Item` instead of `rm -rf`.
  (Learned 2026-02-09)

- **[Shell]:** Do NOT use `Copy-Item src dst` without checking if dest dir exists first.
  Use `fs.ensureDir()` before copying, or `Copy-Item -Force` with `-Recurse` as needed.
  (Learned 2026-02-19)

- **[Config]:** Do NOT assume `agk` smart default only needs to check `.agent/`.
  Always check BOTH `.agent/` AND `.gemini/rules/` — either means the project is initialized.
  (Learned 2026-02-19)

- **[Docs]:** Always verify Markdown list numbering (1, 2, 3...) when injecting new steps
  to avoid duplicate or out-of-order numbers. (Learned 2026-02-09)

- **[Import]:** Do NOT assume a script has `run()` exported without checking.
  Always verify `module.exports = { run }` exists before routing via `bin/index.js`.
  (Learned 2026-02-19)

- **[Logic]:** Do NOT let `.memory/` files stay as empty templates.
  Run `/sync` at the end of every session to keep memory current.
  (Learned 2026-02-19)

- **[Path]:** Do NOT hardcode absolute paths in generated code or templates.
  Always use `path.join(__dirname, ...)` or `process.cwd()` for dynamic resolution.
  (Learned 2026-02-19)

- **[Docs]:** Do NOT leave JSDoc comment blocks outdated when adding new commands.
  Update the comment block in `bin/index.js` whenever a new command is added to the router.
  (Learned 2026-02-19)
