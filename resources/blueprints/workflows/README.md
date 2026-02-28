# Workflow Blueprints (SSOT)

This directory is the semantic SSOT for workflow logic.

## Design

- `*.md` (or `core/*.md` in future): canonical workflow content.
- `registry.json`: canonical workflow listing and metadata.
- `profiles/targets/*.md`: runtime capability overlays (Antigravity, OpenCode, Gemini-CLI, Codex-CLI).
- `profiles/models/*.md`: model behavior overlays (default, codex, etc.).

## Rendering

Use `packages/antigravity-kit/scripts/render-workflows.js` (or `npm run build` in `packages/antigravity-kit`) to render target-aware workflow templates.

Default rendering is non-destructive:

- Existing legacy workflow files are preserved unless they are AGK-managed.
- Set `AGK_FORCE_WORKFLOW_SYNC=1` during build to force overwrite.

## Placeholder Contract

Canonical workflows may use these optional placeholders:

- `{{WORKFLOW_ID}}`
- `{{TARGET_PROFILE}}`
- `{{MODEL_PROFILE}}`
- `{{TARGET_OVERLAY}}` (or `{{TARGET_BLOCK}}`)
- `{{MODEL_OVERLAY}}` (or `{{MODEL_BLOCK}}`)
