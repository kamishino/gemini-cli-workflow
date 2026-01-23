# 💅 SKILL: Design Systems & Tokens
Description: Professional workflow for converting Figma Tokens into Code.

## 1. 🔄 The Pipeline Logic
1.  **Source:** Figma (Tokens Studio) -> Export as `tokens.json`.
2.  **Transform:** `style-dictionary` or custom script.
3.  **Target:** CSS Variables (`:root { ... }`) or SCSS Maps.

## 2. 🎨 Naming Convention (Semantic > Primitive)
*   ❌ **Bad (Primitive):** `--color-blue-500`, `--font-size-16`
*   ✅ **Good (Semantic):** `--color-action-primary`, `--text-body-medium`
*   *Why?* You can change "Blue" to "Purple" without renaming variables across the entire codebase.

## 3. 📂 Structure
```text
styles/
├── abstract/
│   ├── _variables.scss  # Primitive values (Do not use directly)
│   └── _tokens.scss     # Semantic mappings
├── base/
│   ├── _reset.scss
│   └── _typography.scss
└── main.scss            # Import sequence matters!
```

## 4. 🛡️ Golden Snippets

### CSS Variable Mapping
```scss
:root {
  /* Primitives */
  --blue-500: #3b82f6;
  
  /* Semantic Tokens (Use these!) */
  --bg-primary: #ffffff;
  --text-action: var(--blue-500);
  --radius-card: 8px;
}

[data-theme='dark'] {
  --bg-primary: #1f2937;
  /* Automatic Dark Mode Support via Token swapping */
}
```

## 5. 🛑 Rules
*   **NEVER** hardcode HEX/RGB in components. Always use `var(--token)`.
*   **Mobile First:** Default styles are Mobile. Use `@media (min-width: ...)` for larger screens.
