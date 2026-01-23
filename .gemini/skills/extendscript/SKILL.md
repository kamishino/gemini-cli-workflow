# 🎨 SKILL: Adobe ExtendScript Automation (ES3)
Description: Expert knowledge for scripting Adobe Illustrator/Photoshop/InDesign.

## 1. ⚠️ The Environment (Time Travel to 1999)
*   **Engine:** ExtendScript (based on ES3).
*   **Reality Check:** No `JSON`, No `Array.map`, No `console.log`.
*   **Execution:** Synchronous & Blocking.

## 2. 🛑 STRICT CONSTRAINTS
*   **FORBIDDEN:** `const`, `let`, `=>` (Arrow Func), template literals `` ` ``.
*   **MANDATORY:** Use `var`. Use `function name() {}`.
*   **UI:** Use `ScriptUI` for interfaces.

## 3. 🏗️ Architecture: The IIFE Pattern
To prevent polluting the global Adobe namespace (which persists between script runs), ALWAYS wrap code in an IIFE.

```javascript
(function(thisObj) {
    // 1. Shims & Polyfills (Required)
    //@include "lib/json2.js"
    
    // 2. Constants
    var SETTINGS = {
        DEBUG: true,
        UNIT_MM: 2.834645
    };

    // 3. Main Logic
    function main() {
        if (app.documents.length === 0) {
            alert("Please open a document.");
            return;
        }
        // Your logic here
    }

    // 4. Execution
    try {
        main();
    } catch(e) {
        alert("Error: " + e.message + "\nLine: " + e.line);
    }
})(this);
```

## 4. 🧠 Best Practices
*   **Units:** Adobe internal logic uses *Points*. Always convert: `mm * 2.834645 = pt`.
*   **Pathfinder Fix:** When scripting pathfinder operations in Illustrator, items often lose reference.
    *   *Fix:* Select -> Execute Command -> Redraw() -> Get Selection again.
*   **User Interaction:** Always allow an "Undo" group.
    ```javascript
    app.executeMenuCommand("undo"); // Or wrap in strict undo group
    ```
