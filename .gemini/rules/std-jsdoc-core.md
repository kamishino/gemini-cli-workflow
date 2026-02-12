---
name: std-jsdoc-core
type: RULE
description: JSDoc standards and conventions for the codebase.
group: local
order: 20
---

# 📜 JSDoc Standards (Compressed)

## 1. Mandates
- **Public Functions:** MUST have JSDoc.
- **Private Functions:** JSDoc required if logic is complex.
- **Classes:** Document constructor parameters.
- **Types:** Use TypeScript-style annotations.

## 2. Basic Template
```javascript
/**
 * [One-line description]
 * @param {Type} paramName - [Description]
 * @returns {Type} [Description]
 */
```

## 3. Common Types
- `{string}`, `{number}`, `{boolean}`, `{Object}`, `{Array<T>}`.
- `{Promise<T>}` for async functions.
- `@typedef {Object} Name` for complex structures.

## 4. Class Pattern
```javascript
/**
 * [Class description]
 * @class
 */
class Example {
  /** @param {Type} param */
  constructor(param) {}
}
```

## 5. Checklist
- [ ] JSDoc present on all public exports.
- [ ] Param types specified.
- [ ] Async functions marked `@async`.
- [ ] `@typedef` used for reuse.
