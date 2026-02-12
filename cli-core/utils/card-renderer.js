const chalk = require('chalk');

/**
 * CardRenderer - Zero-dependency box drawing utility for KamiFlow
 * Focuses on Aesthetics + Utility in terminal environments.
 */
class CardRenderer {
  constructor() {
    this.chars = {
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
      horizontal: '─',
      vertical: '│'
    };
  }

  /**
   * Render a stylized card for memory recall
   */
  renderCard(data, options = {}) {
    const termWidth = process.stdout.columns || 80;
    const padding = 2;
    const cardWidth = Math.min(80, termWidth - 4);
    const contentWidth = cardWidth - (padding * 2) - 2;

    const color = options.color || 'blue';
    const chalkColor = chalk[color] || chalk.blue;
    const label = options.label ? ` ${options.label} ` : '';

    let output = '';

    // 1. Top Border
    const title = ` Task ${data.id}: ${data.title} `;
    let headerLine = title;
    if (this.getVisualWidth(title) > contentWidth) {
      headerLine = Array.from(title).slice(0, contentWidth - 3).join('') + '...';
    }
    const headerVisualWidth = this.getVisualWidth(headerLine);
    const headerRepetition = cardWidth - headerVisualWidth - 3;
    output += chalkColor(this.chars.topLeft + this.chars.horizontal + chalk.bold(headerLine) + this.chars.horizontal.repeat(Math.max(0, headerRepetition)) + this.chars.topRight) + '\n';

    // 2. Metadata Line
    if (label) {
      const labelVisualWidth = this.getVisualWidth(label);
      const labelRepetition = cardWidth - labelVisualWidth - (padding * 2) - 2;
      output += chalkColor(this.chars.vertical) + ' '.repeat(padding) + chalk.bgWhite.black(label) + ' '.repeat(Math.max(0, labelRepetition)) + ' '.repeat(padding) + chalkColor(this.chars.vertical) + '\n';
    }

    // 3. Snippet Content
    const cleanSnippet = (data.snippet || '')
      .replace(/<mark>/g, '')
      .replace(/<\/mark>/g, '')
      .replace(/\|/g, '•')
      .replace(/\n/g, ' ')
      .trim();
    
    const snippetLines = this.wrapText(cleanSnippet, contentWidth);
    snippetLines.slice(0, 3).forEach(line => {
      const visualWidth = this.getVisualWidth(line);
      const paddingNeeded = contentWidth - visualWidth;
      output += chalkColor(this.chars.vertical) + ' '.repeat(padding) + chalk.gray(line) + ' '.repeat(Math.max(0, paddingNeeded)) + ' '.repeat(padding) + chalkColor(this.chars.vertical) + '\n';
    });

    // 4. Path Link
    let pathLine = `📂 ./${data.path}`;
    if (this.getVisualWidth(pathLine) > contentWidth) {
        pathLine = Array.from(pathLine).slice(0, contentWidth - 3).join('') + '...';
    }
    const visualPathWidth = this.getVisualWidth(pathLine);
    const pathPaddingNeeded = contentWidth - visualPathWidth;
    output += chalkColor(this.chars.vertical) + ' '.repeat(padding) + chalk.dim(pathLine) + ' '.repeat(Math.max(0, pathPaddingNeeded)) + ' '.repeat(padding) + chalkColor(this.chars.vertical) + '\n';

    // 5. Bottom Border
    output += chalkColor(this.chars.bottomLeft + this.chars.horizontal.repeat(cardWidth - 2) + this.chars.bottomRight) + '\n';

    return output;
  }

  /**
   * Calculate visual width of string (handles emojis)
   */
  getVisualWidth(str) {
    let width = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.codePointAt(i);
      if (code > 0xFFFF) {
        width += 2;
        i++; // skip surrogate pair
      } else if (code >= 0x2000 && code <= 0x2FFF) {
        width += 2;
      } else {
        width += 1;
      }
    }
    return width;
  }

  /**
   * Simple text wrapper to prevent box breaking
   */
  wrapText(text, width) {
    const lines = [];
    let currentLine = '';
    const words = text.split(' ');

    for (const word of words) {
      if (this.getVisualWidth(currentLine + ' ' + word) <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }
}

module.exports = new CardRenderer();
