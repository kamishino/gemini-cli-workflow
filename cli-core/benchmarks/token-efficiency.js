const fs = require("fs-extra");
const path = require("upath");

async function runBenchmark() {
  const rulesDir = path.join(process.cwd(), ".gemini/rules");
  const resultsFile = path.join(process.cwd(), "BENCHMARK_RESULTS.md");

  if (!(await fs.pathExists(rulesDir))) {
    console.error(
      "Error: .gemini/rules directory not found. Run sync-all first.",
    );
    return;
  }

  const files = await fs.readdir(rulesDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const pairs = [
    {
      name: "Error Recovery",
      core: "std-error-recovery-core.md",
      lib: "std-error-recovery-lib.md",
    },
    {
      name: "Anti-Hallucination",
      core: "std-anti-hallucination-core.md",
      lib: "std-anti-hallucination-lib.md",
    },
    {
      name: "Flow Checkpoints",
      core: "flow-checkpoint-core.md",
      lib: "flow-checkpoint-lib.md",
    },
    {
      name: "Flow Reflection",
      core: "flow-reflection-core.md",
      lib: "flow-reflection-lib.md",
    },
    { name: "Global Task ID", core: "std-id-core.md", lib: "std-id-lib.md" },
    {
      name: "Flow Validation",
      core: "flow-validation-core.md",
      lib: "flow-validation-lib.md",
    },
    {
      name: "Fast Track",
      core: "flow-fast-track-core.md",
      lib: "flow-fast-track-lib.md",
    },
    {
      name: "Context Intelligence",
      core: "main-context-intelligence-core.md",
      lib: "main-context-intelligence-lib.md",
    },
  ];

  let totalBeforeChars = 0;
  let totalAfterChars = 0;
  const benchmarkData = [];

  for (const pair of pairs) {
    const corePath = path.join(rulesDir, pair.core);
    const libPath = path.join(rulesDir, pair.lib);

    if ((await fs.pathExists(corePath)) && (await fs.pathExists(libPath))) {
      const coreContent = await fs.readFile(corePath, "utf8");
      const libContent = await fs.readFile(libPath, "utf8");

      const coreSize = coreContent.length;
      const libSize = libContent.length;
      const beforeSize = coreSize + libSize;
      const afterSize = coreSize;

      totalBeforeChars += beforeSize;
      totalAfterChars += afterSize;

      benchmarkData.push({
        name: pair.name,
        before: beforeSize,
        after: afterSize,
        saved: beforeSize - afterSize,
        percent: ((1 - afterSize / beforeSize) * 100).toFixed(1) + "%",
      });
    }
  }

  const beforeTokens = Math.round(totalBeforeChars / 4);
  const afterTokens = Math.round(totalAfterChars / 4);
  const totalSavedTokens = beforeTokens - afterTokens;
  const totalSavedPercent =
    ((1 - afterTokens / beforeTokens) * 100).toFixed(1) + "%";

  let markdown = `# 📊 Token Efficiency Benchmark Results

`;
  markdown += `**Date:** ${new Date().toISOString()}
`;
  markdown += `**Methodology:** Character-to-Token Ratio (4:1 proxy).

`;

  markdown += `## 🚀 Overall Savings
`;
  markdown += `- **Before (Combined):** ~${beforeTokens} tokens
`;
  markdown += `- **After (Atomic Core):** ~${afterTokens} tokens
`;
  markdown += `- **Total Saved:** **${totalSavedTokens} tokens** (${totalSavedPercent})

`;

  markdown += `## 📝 Detailed Comparison (Characters)

`;
  markdown += `| Rule Set | Before (Core+Lib) | After (Core Only) | Savings | % Saved |
`;
  markdown += `| :--- | :--- | :--- | :--- | :--- |
`;

  benchmarkData.forEach((row) => {
    markdown += `| ${row.name} | ${row.before} | ${row.after} | ${row.saved} | ${row.percent} |
`;
  });

  markdown += `
---

`;
  markdown += `## 💡 Insight
`;
  markdown += `Việc tách nhỏ các rule giúp giảm tải cho Context Window ngay từ bước khởi đầu. AI chỉ nạp bản Core (Mandates) mặc định. Bản Library (Patterns) sẽ được nạp thông qua cơ chế Self-healing khi thực sự cần thiết.
`;

  await fs.writeFile(resultsFile, markdown);
  console.log(`✅ Benchmark complete. Results saved to ${resultsFile}`);
}

runBenchmark().catch(console.error);
