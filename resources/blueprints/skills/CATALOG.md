# 📚 KamiFlow Skills Catalog

Curated list of community skills compatible with KamiFlow and Gemini CLI.

**Last Updated:** 2026-02-02

---

## 🎯 Quick Install

```bash
# Gemini CLI native install
gemini /skills install <github-url>

# KamiFlow install (with audit)
/kamiflow:p-agents:add <github-url>
```

---

## ⭐ Official Team Skills (Highest Quality)

### Vercel Engineering

| Skill | Description | Install |
|-------|-------------|---------|
| **react-best-practices** | React patterns and best practices | `vercel-labs/agent-skills/skills/react-best-practices` |
| **web-design-guidelines** | UI/UX design standards | `vercel-labs/agent-skills/skills/web-design-guidelines` |
| **composition-patterns** | React component composition | `vercel-labs/agent-skills/skills/composition-patterns` |
| **next-best-practices** | Next.js recommended patterns | `vercel-labs/next-skills/skills/next-best-practices` |
| **next-cache-components** | Next.js caching strategies | `vercel-labs/next-skills/skills/next-cache-components` |
| **next-upgrade** | Upgrade Next.js projects | `vercel-labs/next-skills/skills/next-upgrade` |
| **react-native-skills** | React Native best practices | `vercel-labs/agent-skills/skills/react-native-skills` |

### Cloudflare

| Skill | Description | Install |
|-------|-------------|---------|
| **agents-sdk** | Build stateful AI agents | `cloudflare/skills/agents-sdk` |
| **wrangler** | Workers, KV, R2, D1, Vectorize | `cloudflare/skills/wrangler` |
| **durable-objects** | Stateful coordination | `cloudflare/skills/durable-objects` |
| **web-perf** | Core Web Vitals audit | `cloudflare/skills/web-perf` |
| **building-mcp-server** | Build MCP servers on Cloudflare | `cloudflare/skills/building-mcp-server-on-cloudflare` |

### Supabase

| Skill | Description | Install |
|-------|-------------|---------|
| **postgres-best-practices** | PostgreSQL best practices | `supabase/agent-skills/skills/supabase-postgres-best-practices` |

### Trail of Bits (Security)

| Skill | Description | Install |
|-------|-------------|---------|
| **security-audit** | Security vulnerability analysis | `trailofbits/skills/security` |

### Stripe

| Skill | Description | Install |
|-------|-------------|---------|
| **stripe-integration** | Payments integration | `stripe/agent-skills` |

### Expo

| Skill | Description | Install |
|-------|-------------|---------|
| **expo-skills** | React Native with Expo | `expo/agent-skills` |

---

## 🔧 Development & Testing (Community)

### Test-Driven Development

| Skill | Description | KamiFlow Alignment |
|-------|-------------|-------------------|
| **test-driven-development** | TDD workflow | ✅ Aligns with Sniper Model |
| **systematic-debugging** | Methodical debugging | ✅ Error Recovery Protocol |
| **verification-before-completion** | Pre-completion validation | ✅ Phase 4 Validation |
| **root-cause-tracing** | Bug investigation | ✅ Anti-Hallucination |

**Install:** `obra/superpowers/skills/<skill-name>`

### Git Workflow

| Skill | Description | Install |
|-------|-------------|---------|
| **finishing-a-development-branch** | Complete Git branches | `obra/superpowers/skills/finishing-a-development-branch` |
| **requesting-code-review** | Initiate code reviews | `obra/superpowers/skills/requesting-code-review` |
| **receiving-code-review** | Process feedback | `obra/superpowers/skills/receiving-code-review` |
| **using-git-worktrees** | Manage multiple worktrees | `obra/superpowers/skills/using-git-worktrees` |
| **dev-agent-skills** | Git/GitHub workflows | `fvadicamo/dev-agent-skills` |

### Automation & Testing

| Skill | Description | Install |
|-------|-------------|---------|
| **playwright-skill** | Browser automation | `lackeyjb/playwright-skill` |
| **screenshots** | Marketing screenshots | `Shpigford/skills/screenshots` |
| **ios-simulator-skill** | iOS Simulator control | `conorluddy/ios-simulator-skill` |

---

## 🏗️ Infrastructure & DevOps

| Skill | Description | Install |
|-------|-------------|---------|
| **terraform-skill** | Terraform IaC | `antonbabenko/terraform-skill` |
| **aws-skills** | AWS development | `zxkane/aws-skills` |
| **postgres** | PostgreSQL queries | `sanjay3290/ai-skills/skills/postgres` |

---

## 🎨 UI/UX Design

| Skill | Description | Install |
|-------|-------------|---------|
| **ui-skills** | Interface building guidelines | `ibelick/ui-skills` |
| **ui-ux-pro-max-skill** | UI/UX design patterns | `nextlevelbuilder/ui-ux-pro-max-skill` |

---

## 🔍 Research & Productivity

| Skill | Description | Install |
|-------|-------------|---------|
| **deep-research** | Gemini Deep Research Agent | `sanjay3290/ai-skills/skills/deep-research` |
| **changelog-generator** | Git commits to release notes | `ComposioHQ/awesome-claude-skills/changelog-generator` |

---

## 🛡️ Security

| Skill | Description | Install |
|-------|-------------|---------|
| **ffuf-claude-skill** | Web fuzzing with ffuf | `jthack/ffuf_claude_skill` |
| **rootly-incident-responder** | AI incident response | `Rootly-AI-Labs/rootly-incident-responder` |

---

## 📦 KamiFlow Native Skills

These skills are built specifically for KamiFlow:

| Skill | Location | Description |
|-------|----------|-------------|
| **kamiflow-sniper-assist** | `resources/blueprints/skills/` | Sniper Model workflow assistant |

---

## 🔗 Skill Registries

- [Awesome Agent Skills](https://github.com/VoltAgent/awesome-agent-skills) - 200+ curated skills
- [skills.sh](https://skills.sh/) - Community skill registry
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)
- [Cloudflare Skills](https://github.com/cloudflare/skills)
- [obra/superpowers](https://github.com/obra/superpowers) - Development workflow skills

---

## ✅ Compatibility Notes

| Agent | Skill Format | Notes |
|-------|-------------|-------|
| Gemini CLI | `SKILL.md` | Native support |
| Claude Code | `SKILL.md` | Native support |
| Cursor | `.cursorrules` | Convert via `skillkit translate` |
| Windsurf | `.windsurfrules` | Convert via `skillkit translate` |
| Codex | `SKILL.md` | Native support |

---

## 🆕 Contributing

To add a skill to this catalog:

1. Verify compatibility with Gemini CLI
2. Test with KamiFlow workflow
3. Submit PR with skill details
