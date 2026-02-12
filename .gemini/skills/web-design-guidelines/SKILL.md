---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel-labs (adapted for KamiFlow)
  version: "1.0.0"
  kamiflow-alignment: Indie Builder aesthetic, "Aesthetics + Utility" philosophy
order: 60
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## Overview

This skill enforces modern web design best practices aligned with KamiFlow's "Aesthetics + Utility" philosophy for Indie Builders.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```text
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:

1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.

## Core Principles (Quick Reference)

While the full guidelines should be fetched, these are the core principles:

### Visual Hierarchy

- **Contrast:** Ensure sufficient contrast ratios (WCAG AA minimum)
- **Spacing:** Consistent spacing using design tokens
- **Typography:** Clear hierarchy with limited font variations

### Accessibility

- **Semantic HTML:** Use proper elements (`<button>`, `<nav>`, `<main>`)
- **ARIA Labels:** Provide context for screen readers
- **Keyboard Navigation:** All interactions keyboard-accessible
- **Focus States:** Visible focus indicators

### Performance

- **Image Optimization:** Use modern formats (WebP, AVIF)
- **Lazy Loading:** Defer off-screen content
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1

### Responsiveness

- **Mobile-First:** Design for mobile, enhance for desktop
- **Breakpoints:** Consistent breakpoint system
- **Touch Targets:** Minimum 44x44px for touch

### Consistency

- **Design Tokens:** Use CSS variables for colors, spacing, typography
- **Component Patterns:** Reusable, composable components
- **State Handling:** Consistent loading, error, empty states

## KamiFlow Integration

This skill supports the Indie Builder persona:

| Principle                | KamiFlow Alignment          |
| ------------------------ | --------------------------- |
| **Aesthetics + Utility** | Beautiful AND functional UI |
| **Ship Fast**            | Guidelines prevent rework   |
| **Professional**         | Modern, polished interfaces |

### When to Use

- Before `/kamiflow:core:build` for UI features
- During code review for frontend changes
- When creating new components
- Before production deployment

### Output Format

```text
src/components/Button.tsx:15 - Missing focus state styles
src/pages/Home.tsx:42 - Image missing alt text
src/styles/globals.css:8 - Contrast ratio below WCAG AA (3.2:1, needs 4.5:1)
```

## Related Skills

- `test-driven-development` - Test UI interactions
- `verification-before-completion` - Verify accessibility before shipping
