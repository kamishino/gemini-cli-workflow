/**
 * Unit Tests for TOML Validator
 * Target Coverage: 80%
 */

const { validateTomlFile, validateTomlFiles } = require('../../validators/toml-validator');
const { mockToml } = require('../helpers/fixtures');
const { createTempDir, cleanupMockFs } = require('../helpers/fs-mock');
const fs = require('fs-extra');
const path = require('upath');

describe('TOML Validator', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await createTempDir('toml-test-');
  });

  afterEach(async () => {
    await cleanupMockFs(tempDir);
  });

  describe('validateTomlFile', () => {
    it('should validate valid TOML file', async () => {
      const validToml = mockToml();
      const filePath = path.join(tempDir, 'valid.toml');
      await fs.writeFile(filePath, validToml, 'utf8');

      const result = await validateTomlFile(filePath);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect invalid TOML syntax', async () => {
      const invalidToml = `description = "Test\nprompt = unclosed string`;
      const filePath = path.join(tempDir, 'invalid.toml');
      await fs.writeFile(filePath, invalidToml, 'utf8');

      const result = await validateTomlFile(filePath);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle non-existent file', async () => {
      const result = await validateTomlFile('/nonexistent/file.toml');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File not found');
    });

    it('should validate required fields exist', async () => {
      const missingFields = `prompt = "test"`;
      const filePath = path.join(tempDir, 'missing.toml');
      await fs.writeFile(filePath, missingFields, 'utf8');

      const result = await validateTomlFile(filePath);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('description'))).toBe(true);
    });
  });

  describe('validateTomlFiles', () => {
    it('should validate all TOML files in directory', async () => {
      const tomlDir = path.join(tempDir, 'commands');
      await fs.ensureDir(tomlDir);
      
      await fs.writeFile(path.join(tomlDir, 'test1.toml'), mockToml(), 'utf8');
      await fs.writeFile(path.join(tomlDir, 'test2.toml'), mockToml(), 'utf8');

      const result = await validateTomlFiles(tomlDir);
      
      expect(result.total).toBe(2);
      expect(result.valid).toBe(2);
      expect(result.invalid).toBe(0);
    });

    it('should count invalid files correctly', async () => {
      const tomlDir = path.join(tempDir, 'commands');
      await fs.ensureDir(tomlDir);
      
      await fs.writeFile(path.join(tomlDir, 'valid.toml'), mockToml(), 'utf8');
      await fs.writeFile(path.join(tomlDir, 'invalid.toml'), 'bad syntax [[[', 'utf8');

      const result = await validateTomlFiles(tomlDir);
      
      expect(result.total).toBe(2);
      expect(result.valid).toBe(1);
      expect(result.invalid).toBe(1);
    });

    it('should recursively search subdirectories', async () => {
      const tomlDir = path.join(tempDir, 'commands');
      await fs.ensureDir(path.join(tomlDir, 'core'));
      await fs.ensureDir(path.join(tomlDir, 'dev'));
      
      await fs.writeFile(path.join(tomlDir, 'core', 'test1.toml'), mockToml(), 'utf8');
      await fs.writeFile(path.join(tomlDir, 'dev', 'test2.toml'), mockToml(), 'utf8');

      const result = await validateTomlFiles(tomlDir);
      
      expect(result.total).toBe(2);
    });

    it('should handle empty directory', async () => {
      const emptyDir = path.join(tempDir, 'empty');
      await fs.ensureDir(emptyDir);

      const result = await validateTomlFiles(emptyDir);
      
      expect(result.total).toBe(0);
      expect(result.valid).toBe(0);
      expect(result.invalid).toBe(0);
    });
  });
});
