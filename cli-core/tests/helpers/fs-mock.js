/**
 * File System Mocking Utilities
 */

const fs = require('fs-extra');
const path = require('upath');

/**
 * Create a mock file system structure
 * @param {Object} structure - Nested object representing directory structure
 * @param {string} basePath - Base path for the structure
 */
async function createMockFs(structure, basePath) {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);
    
    if (typeof content === 'string') {
      // It's a file
      await fs.ensureFile(fullPath);
      await fs.writeFile(fullPath, content, 'utf8');
    } else if (typeof content === 'object' && content !== null) {
      // It's a directory
      await fs.ensureDir(fullPath);
      await createMockFs(content, fullPath);
    }
  }
}

/**
 * Clean up mock file system
 */
async function cleanupMockFs(basePath) {
  if (await fs.pathExists(basePath)) {
    await fs.remove(basePath);
  }
}

/**
 * Create a temporary test directory
 */
async function createTempDir(prefix = 'kamiflow-test-') {
  const os = require('os');
  const tmpDir = path.join(os.tmpdir(), `${prefix}${Date.now()}`);
  await fs.ensureDir(tmpDir);
  return tmpDir;
}

/**
 * Mock fs-extra methods for testing
 */
function createFsMock() {
  const mockFiles = new Map();
  
  return {
    pathExists: jest.fn(async (filePath) => mockFiles.has(filePath)),
    readFile: jest.fn(async (filePath, encoding) => {
      const content = mockFiles.get(filePath);
      if (!content) throw new Error(`File not found: ${filePath}`);
      return content;
    }),
    writeFile: jest.fn(async (filePath, content) => {
      mockFiles.set(filePath, content);
    }),
    readJson: jest.fn(async (filePath) => {
      const content = mockFiles.get(filePath);
      if (!content) throw new Error(`File not found: ${filePath}`);
      return JSON.parse(content);
    }),
    writeJson: jest.fn(async (filePath, data) => {
      mockFiles.set(filePath, JSON.stringify(data, null, 2));
    }),
    ensureDir: jest.fn(async () => {}),
    ensureFile: jest.fn(async () => {}),
    remove: jest.fn(async (filePath) => {
      mockFiles.delete(filePath);
    }),
    copy: jest.fn(async (src, dest) => {
      const content = mockFiles.get(src);
      if (content) mockFiles.set(dest, content);
    }),
    _mockFiles: mockFiles // Expose for testing
  };
}

module.exports = {
  createMockFs,
  cleanupMockFs,
  createTempDir,
  createFsMock
};
