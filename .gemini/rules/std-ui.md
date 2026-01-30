# 📜 Rule: Industrial UI & Interface Standards

> **Goal:** Maintain a consistent, professional "voice" and visual identity for KamiFlow.

---

## 1. 🛑 NON-NEGOTIABLES
- **NO Raw Console:** Use of `console.log` or `console.error` is forbidden if `cli-core/utils/logger.js` is available.
- **Icon Integrity:** Every status message MUST use the standard KamiFlow iconography.
- **Silent Failures:** Every process MUST provide visual feedback (Info -> Success/Error).

## 2. 🎨 LOGGER METHODS
Always use the `Logger` singleton:

| Method | Use Case | Icon | Color |
| :--- | :--- | :---: | :--- |
| `header(text)` | Major process start | N/A | Cyan Separator |
| `info(text)` | General progress | ℹ️ | Blue |
| `success(text)`| Task completed | ✅ | Green |
| `warn(text)` | Non-blocking issue | ⚠️ | Yellow |
| `error(text)` | Blocking failure | ❌ | Red (Bold) |
| `hint(text)` | Sub-details/Paths | N/A | Gray |

## 3. 🛡️ ERROR HANDLING
- **User Mode:** Display only the message and a helpful hint.
- **Dev Mode:** Display stack trace only if `process.env.KAMI_DEBUG === 'true'`.
- **Wrapper:** Always wrap main logic in the `execute(title, action)` helper found in `kami.js`.

## 4. 🧠 AI BEHAVIOR
When generating CLI logic:
1. Import `const logger = require('../utils/logger');`.
2. Use `logger.info()` for steps.
3. Use `logger.success()` for completion.
