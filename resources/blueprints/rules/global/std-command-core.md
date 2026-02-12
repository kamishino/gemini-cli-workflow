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

| Task               | Bash (Unix)        | PowerShell (win32)                                      | Notes              |
| :----------------- | :----------------- | :------------------------------------------------------ | :----------------- |
| Create Directory   | `mkdir -p folder`  | `New-Item -ItemType Directory -Force -Path folder`      |                    |
| Create File        | `touch file.md`    | `New-Item -ItemType File -Force -Path file.md`          |                    |
| Delete File/Folder | `rm -rf path`      | `Remove-Item -Path path -Force -Recurse`                | **NEVER use -rf**  |
| Copy               | `cp -r src dest`   | `Copy-Item -Path src -Destination dest -Recurse -Force` |                    |
| Move               | `mv src dest`      | `Move-Item -Path src -Destination dest -Force`          |                    |
| List Files         | `ls -la`           | `Get-ChildItem -Force`                                  |                    |
| Search Text        | `grep "text" file` | `Select-String -Pattern "text" -Path file`              | **NEVER use grep** |

### 🚫 FORBIDDEN ON WINDOWS (win32)

1.  **NO `&&`:** PowerShell 5.1 does NOT support `&&`. Use `;` or separate commands.
2.  **NO `grep`:** Use `Select-String`.
3.  **NO `rm -rf`:** Use `Remove-Item -Force -Recurse`.
4.  **NO `ls`:** Use `Get-ChildItem`.
5.  **NO `touch`:** Use `New-Item -ItemType File`.

### ⚠️ Critical Note on Shell Separators

PowerShell does NOT support `&&` for command chaining in older versions (5.1). You MUST use `;` or run commands sequentially in separate tool calls.

---

## ✅ 3. Validation Checklist

- [ ] Command is a `.toml` file.
- [ ] No `[[steps]]` used for core logic.
- [ ] Shell commands use PowerShell syntax (if on Windows).
- [ ] All multiline strings use triple quotes `'''`.
