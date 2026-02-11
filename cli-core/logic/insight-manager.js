const fs = require('fs-extra');
const path = require('upath');
const chalk = require('chalk');
const { EnvironmentManager } = require('./env-manager');
const { WorkspaceIndex } = require('./workspace-index');

class InsightManager {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.envManager = new EnvironmentManager(projectRoot);
    this.index = new WorkspaceIndex(projectRoot);
  }

  async getPaths() {
    const workspaceRoot = await this.envManager.getAbsoluteWorkspacePath();
    return {
      archive: path.join(workspaceRoot, 'archive'),
      context: path.join(workspaceRoot, 'PROJECT_CONTEXT.md'),
      root: workspaceRoot
    };
  }

  async extractFromArchive(taskId) {
    const paths = await this.getPaths();
    if (!fs.existsSync(paths.archive)) return [];
    const archiveFolders = await fs.readdir(paths.archive);
    const taskFolder = archiveFolders.find(f => f.includes(`_${taskId}_`));
    if (!taskFolder) return [];
    
    const taskPath = path.join(paths.archive, taskFolder);
    const files = await fs.readdir(taskPath);
    const handoffFile = files.find(f => f.includes('-S4-HANDOFF-') || f.endsWith('-reflection.md') || f === 'reflection.md');
    if (!handoffFile) return [];
    
    const content = await fs.readFile(path.join(taskPath, handoffFile), 'utf8');

    // Knowledge Graph: Extract relationships
    await this.index.initialize();
    const relatedTasks = this.extractRelationships(content);
    for (const targetId of relatedTasks) {
        if (targetId !== taskId) {
            this.index.addRelationship(taskId, targetId, 'references', { source_folder: taskFolder });
        }
    }
    await this.index.save();

    const lessonsMatch = content.match(/## .*?(?:Lessons Learned|Strategic Reflection)[\s\S]*?(?=##|$)/i);
    if (!lessonsMatch) return [];
    
    const lessonsContent = lessonsMatch[0];
    const insights = [];
    
    // Strategy 1: Bullet points
    const lines = lessonsContent.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
    for (const line of lines) {
      let cleanLine = line.trim().replace(/^[*-]\s*/, '').trim();
      cleanLine = cleanLine.replace(/^[*-]\s*/, '').trim(); 
      if (cleanLine.length < 10 || cleanLine.toLowerCase().includes("lessons learned")) continue;

      const labelMatch = cleanLine.match(/^\*\*([^*:]+):\*\*\s*(.*)/i);
      let label = labelMatch ? labelMatch[1].trim() : cleanLine.split(':')[0].replace(/\*\*/g, '').trim();
      let wisdom = labelMatch ? `**${label}:** ${labelMatch[2].trim()}` : cleanLine;
      
      insights.push({ id: taskId, category: this.deduceCategory(taskFolder, wisdom), pattern: this.cleanLabel(label), wisdom: wisdom });
    }

    // Strategy 2: Key Insight headers
    const keyInsightMatches = lessonsContent.match(/\*\*Key Insight(?:\s*#\d+)?:\s*(.*?)\*\*\n(.*?)(?=\n\n|\n##|$)/gi);
    if (keyInsightMatches) {
        keyInsightMatches.forEach(m => {
            const mParts = m.match(/\*\*Key Insight(?:\s*#\d+)?:\s*(.*?)\*\*\n(.*)/i);
            if (mParts) {
                const label = mParts[1].trim();
                const wisdom = mParts[2].trim();
                insights.push({ id: taskId, category: this.deduceCategory(taskFolder, wisdom), pattern: this.cleanLabel(label), wisdom: `**${label}:** ${wisdom}` });
            }
        });
    }

    return insights;
  }

  cleanLabel(label) {
      let clean = label.replace(/\*\*/g, '').replace(/\*/g, '').replace(/Key Insight(?:\s*#\d+)?:\s*/i, '').replace(/:$/, '').trim();
      if (clean.length > 60) clean = clean.substring(0, 60) + '...';
      return clean;
  }

  deduceCategory(taskFolder, text) {
      let category = 'General';
      const textToScan = (taskFolder + " " + text).toLowerCase();
      if (textToScan.includes('sync')) category = 'Sync';
      else if (textToScan.includes('ui') || textToScan.includes('design') || textToScan.includes('aesthetics')) category = 'UI';
      else if (textToScan.includes('config')) category = 'Config';
      else if (textToScan.includes('logic')) category = 'Logic';
      else if (textToScan.includes('rule') || textToScan.includes('manifesto') || textToScan.includes('blueprint')) category = 'Rules';
      else if (textToScan.includes('cli') || textToScan.includes('command')) category = 'CLI';
      return category;
  }

  async syncToContext(insights) {
    if (!insights || insights.length === 0) return;
    const paths = await this.getPaths();
    if (!await fs.pathExists(paths.context)) return;
    
    let content = await fs.readFile(paths.context, 'utf8');
    const sectionHeader = '## ?? Project Wisdom: Strategic Patterns';
    if (!content.includes(sectionHeader)) { content += `\n\n${sectionHeader}\n`; }

    const parts = content.split(sectionHeader);
    let preSection = parts[0];
    let wisdomSection = parts[1] || "";

    const categoryTableMap = {};
    const tableHeader = '| ID | Pattern | Wisdom | Source |';
    const tableSeparator = '| :--- | :--- | :--- | :--- |';

    const catBlocks = wisdomSection.split('### #');
    catBlocks.forEach(block => {
        if (!block.trim()) return;
        const lines = block.trim().split('\n');
        const category = lines[0].trim();
        categoryTableMap[category] = lines.slice(1).filter(l => l.trim().startsWith('|') && !l.includes('ID | Pattern') && !l.includes(':---'));
    });

    for (const insight of insights) {
        if (!categoryTableMap[insight.category]) categoryTableMap[insight.category] = [];
        const safePattern = insight.pattern.replace(/\|/g, '\\|');
        const safeWisdom = insight.wisdom.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
        
        // Skip duplicate entries or near-empty ones
        if (safePattern.length < 3) continue;
        
        const duplicateKey = `| ${insight.id} | ${safePattern.substring(0, 20)}`;
        if (!categoryTableMap[insight.category].some(r => r.includes(duplicateKey))) {
            categoryTableMap[insight.category].push(`| ${insight.id} | ${safePattern} | ${safeWisdom} | Task ${insight.id} |`);
        }
    }

    let newWisdomSection = "";
    Object.keys(categoryTableMap).sort().forEach(cat => {
        if (categoryTableMap[cat].length > 0) {
            newWisdomSection += `\n### #${cat}\n${tableHeader}\n${tableSeparator}\n${categoryTableMap[cat].join('\n')}\n`;
        }
    });

    await fs.writeFile(paths.context, preSection.trim() + "\n\n" + sectionHeader + "\n" + newWisdomSection);
  }

  /**
   * Extract Task IDs from content using Regex
   */
  extractRelationships(content) {
      const taskRegex = /\bTask\s+(\d{3})\b/gi;
      const matches = [...content.matchAll(taskRegex)];
      return [...new Set(matches.map(m => m[1]))];
  }

  /**
   * Display related tasks from the Knowledge Graph
   */
  async displayGraph(taskId) {
      await this.index.initialize();
      const neighbors = this.index.getNeighbors(taskId);
      
      if (neighbors.length === 0) {
          console.log(chalk.gray(`\n💭 No graph relationships found for Task ${taskId}.`));
          return;
      }

      console.log(chalk.cyan(`\n🔄 Knowledge Graph: Related to Task ${taskId}`));
      neighbors.forEach(n => {
          const direction = n.direction === 'out' ? '→' : '←';
          console.log(chalk.gray(`   ${direction} [Task ${n.node}] (${n.rel_type})`));
      });
  }
}
module.exports = InsightManager;
