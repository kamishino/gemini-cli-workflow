---
name: std-command-core
type: RULE
description: Prompt-Only TOML standard and PowerShell enforcement
group: global
order: 100
---

# 📜 COMMAND STANDARD & OS ENFORCEMENT

> **Purpose:** Ensure consistent command design and reliable system interactions across different environments, with a focus on Windows optimization.

---

## ⚡ 1. Prompt-Only TOML Standard

To maximize the reasoning and tool-calling capabilities of Gemini CLI, all command definitions MUST follow the **Prompt-Only** standard.

### 🚫 Forbidden Pattern
Do NOT use `[[steps]]` for complex logic. It makes commands rigid and hard to debug.

### ✅ Recommended Pattern
Define the entire logic, tool instructions, and expected outcomes inside a single `prompt` block.

**Example Structure:**
```toml
description = "Summarize the current file"
group = "utility"
order = 10
prompt = '''
You are the "Summarizer". 

1. **Context:** Read the current file using `read_file`.
2. **Analysis:** Summarize the main points into a 3-bullet list.
3. **Response:** Output the summary in a professional tone.
'''
```

---

## 🖥️ 2. Windows PowerShell Protocol (win32)

When executing `run_shell_command` on **Windows**, you MUST prioritize **PowerShell** syntax over Bash/Unix commands.

### 🔄 Command Mapping Table

| Task | Bash (Unix) | PowerShell (win32) |
| :--- | :--- | :--- |
| Create Directory | `mkdir -p folder` | `New-Item -ItemType Directory -Force -Path folder` |
| Create File | `touch file.md` | `New-Item -ItemType File -Force -Path file.md` |
| Delete File/Folder | `rm -rf path` | `Remove-Item -Path path -Force -Recurse` |
| Copy | `cp -r src dest` | `Copy-Item -Path src -Destination dest -Recurse -Force` |
| Move | `mv src dest` | `Move-Item -Path src -Destination dest -Force` |
| List Files | `ls -la` | `Get-ChildItem -Force` |
| Search Text | `grep "text" file` | `Select-String -Pattern "text" -Path file` |

### ⚠️ Critical Note on Shell Separators
PowerShell does NOT support `&&` for command chaining in older versions. Use `;` or run commands sequentially in separate tool calls if possible.

---

## ✅ 3. Validation Checklist
- [ ] Command is a `.toml` file.
- [ ] No `[[steps]]` used for core logic.
- [ ] Shell commands use PowerShell syntax (if on Windows).
- [ ] All multiline strings use triple quotes `'''`.
