# 💡 Idea Sandbox Commands

These commands manage the lifecycle of raw ideas in the KamiFlow ecosystem.

## /kamiflow:core:draft

Generate a new idea draft in the `ideas/draft/` directory.

```toml
[command]
name = "kamiflow:core:draft"
description = "Create a new raw idea draft in the sandbox"

[[command.args]]
name = "title"
description = "The title of the idea"
required = true

[[command.steps]]
name = "initialize_draft"
description = "Creating draft file from template"
run_shell_command = "node cli-core/bin/kami.js create-idea \"{{args.title}}\""
```

## /kamiflow:core:analyze

Analyze the current idea draft using multiple AI Personas.

```toml
[command]
name = "kamiflow:core:analyze"
description = "Deeply analyze the current idea with AI Personas"

[[command.steps]]
name = "read_idea"
description = "Reading the current file content"
read_file = "{{current_file}}"

[[command.steps]]
name = "brainstorm"
description = "Generating multi-dimensional feedback"
# This is a meta-prompt step handled by the AI
message = """
Please analyze the idea in {{current_file}} using the following Personas:
1. **Steve Jobs (The Critic):** Focus on simplicity, elegance, and brutal honesty.
2. **The Engineer (The Pragmatic):** Focus on technical feasibility, scalability, and edge cases.
3. **The User (The Minimalist):** Focus on immediate benefit and ease of use.

After analysis, suggest updated tags (feasibility 1-5, priority) and labels (action: refine/implement/discard).
Format the output as a Markdown comment to be appended to the file.
"""

[[command.steps]]
name = "update_metadata"
description = "Updating labels and tags based on analysis"
# Handled by the AI in the loop
```

## /kamiflow:core:promote

Move an idea from `draft/` to `backlog/` status.

```toml
[command]
name = "kamiflow:core:promote"
description = "Move an idea from draft to backlog"

[[command.steps]]
name = "relocate_file"
description = "Moving file to ideas/backlog/"
run_shell_command = "node cli-core/bin/kami.js promote-idea \"{{current_file}}\""
```

```