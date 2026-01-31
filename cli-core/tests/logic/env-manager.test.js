/**
 * Unit Tests for EnvironmentManager
 * Target Coverage: 90%
 */

const { EnvironmentManager } = require('../../logic/env-manager');
const { mockConfig } = require('../helpers/fixtures');
const path = require('upath');

// Mock ConfigManager
jest.mock('../../logic/config-manager');
const { ConfigManager } = require('../../logic/config-manager');

describe('EnvironmentManager', () => {
  let envManager;
  let mockConfigManager;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock ConfigManager
    mockConfigManager = {
      get: jest.fn()
    };
    ConfigManager.mockImplementation(() => mockConfigManager);
    
    envManager = new EnvironmentManager('/test/project');
  });

  describe('Constructor', () => {
    it('should resolve absolute project root', () => {
      const manager = new EnvironmentManager('/test/project');
      expect(manager.projectRoot).toBe('/test/project');
    });

    it('should handle relative paths by resolving to absolute', () => {
      const manager = new EnvironmentManager('relative/path');
      expect(path.isAbsolute(manager.projectRoot)).toBe(true);
    });

    it('should detect when called from cli-core directory', () => {
      const cliCorePath = '/test/project/cli-core';
      const manager = new EnvironmentManager(cliCorePath);
      expect(manager.projectRoot).toBe('/test/project');
    });

    it('should create ConfigManager instance', () => {
      expect(envManager.configManager).toBeDefined();
      expect(ConfigManager).toHaveBeenCalledWith('/test/project');
    });
  });

  describe('getEnv', () => {
    it('should return "production" when KAMI_ENV is "production"', async () => {
      process.env.KAMI_ENV = 'production';
      const result = await envManager.getEnv();
      expect(result).toBe('production');
    });

    it('should return "production" when KAMI_ENV is "prod"', async () => {
      process.env.KAMI_ENV = 'prod';
      const result = await envManager.getEnv();
      expect(result).toBe('production');
    });

    it('should return "development" when KAMI_ENV is "development"', async () => {
      process.env.KAMI_ENV = 'development';
      const result = await envManager.getEnv();
      expect(result).toBe('development');
    });

    it('should return "development" when KAMI_ENV is "dev"', async () => {
      process.env.KAMI_ENV = 'dev';
      const result = await envManager.getEnv();
      expect(result).toBe('development');
    });

    it('should fallback to NODE_ENV if KAMI_ENV not set', async () => {
      delete process.env.KAMI_ENV;
      process.env.NODE_ENV = 'production';
      const result = await envManager.getEnv();
      expect(result).toBe('production');
    });

    it('should use config value when env vars not set', async () => {
      delete process.env.KAMI_ENV;
      delete process.env.NODE_ENV;
      mockConfigManager.get.mockResolvedValue('production');

      const result = await envManager.getEnv();
      
      expect(result).toBe('production');
      expect(mockConfigManager.get).toHaveBeenCalledWith('currentEnv');
    });

    it('should default to "development" when nothing is set', async () => {
      delete process.env.KAMI_ENV;
      delete process.env.NODE_ENV;
      mockConfigManager.get.mockResolvedValue(undefined);

      const result = await envManager.getEnv();
      
      expect(result).toBe('development');
    });
  });

  describe('getEnvConfig', () => {
    it('should return development config for dev environment', async () => {
      process.env.KAMI_ENV = 'development';
      const mockEnvs = {
        development: { workspaceRoot: './.kamiflow', outputTargets: ['.'] },
        production: { workspaceRoot: './.kamiflow', outputTargets: ['dist'] }
      };
      mockConfigManager.get.mockResolvedValue(mockEnvs);

      const result = await envManager.getEnvConfig();
      
      expect(result).toEqual(mockEnvs.development);
    });

    it('should return production config for prod environment', async () => {
      process.env.KAMI_ENV = 'production';
      const mockEnvs = {
        development: { workspaceRoot: './.kamiflow', outputTargets: ['.'] },
        production: { workspaceRoot: './.kamiflow', outputTargets: ['dist'] }
      };
      mockConfigManager.get.mockResolvedValue(mockEnvs);

      const result = await envManager.getEnvConfig();
      
      expect(result).toEqual(mockEnvs.production);
    });

    it('should fallback to development config if current env not found', async () => {
      process.env.KAMI_ENV = 'unknown';
      const mockEnvs = {
        development: { workspaceRoot: './.kamiflow', outputTargets: ['.'] }
      };
      mockConfigManager.get
        .mockResolvedValueOnce(undefined) // currentEnv
        .mockResolvedValueOnce(mockEnvs); // environments

      const result = await envManager.getEnvConfig();
      
      expect(result).toEqual(mockEnvs.development);
    });
  });

  describe('getWorkspacePrefix', () => {
    beforeEach(async () => {
      process.env.KAMI_ENV = 'development';
    });

    it('should return canonical format with leading ./ and trailing /', async () => {
      mockConfigManager.get.mockResolvedValue({
        development: { workspaceRoot: './.kamiflow', outputTargets: ['.'] }
      });

      const result = await envManager.getWorkspacePrefix();
      
      expect(result).toBe('./.kamiflow/');
      expect(result.startsWith('./')).toBe(true);
      expect(result.endsWith('/')).toBe(true);
    });

    it('should add leading ./ if missing', async () => {
      mockConfigManager.get.mockResolvedValue({
        development: { workspaceRoot: '.kamiflow', outputTargets: ['.'] }
      });

      const result = await envManager.getWorkspacePrefix();
      
      expect(result).toBe('./.kamiflow/');
    });

    it('should convert leading / to ./', async () => {
      mockConfigManager.get.mockResolvedValue({
        development: { workspaceRoot: '/.kamiflow', outputTargets: ['.'] }
      });

      const result = await envManager.getWorkspacePrefix();
      
      expect(result).toBe('./.kamiflow/');
    });

    it('should add trailing / if missing', async () => {
      mockConfigManager.get.mockResolvedValue({
        development: { workspaceRoot: './.kamiflow', outputTargets: ['.'] }
      });

      const result = await envManager.getWorkspacePrefix();
      
      expect(result.endsWith('/')).toBe(true);
    });

    it('should handle nested paths correctly', async () => {
      mockConfigManager.get.mockResolvedValue({
        development: { workspaceRoot: '.kamiflow/nested', outputTargets: ['.'] }
      });

      const result = await envManager.getWorkspacePrefix();
      
      expect(result).toBe('./.kamiflow/nested/');
    });
  });

  describe('getAbsoluteWorkspacePath', () => {
    it('should return absolute path to workspace', async () => {
      process.env.KAMI_ENV = 'development';
      mockConfigManager.get.mockResolvedValue({
        development: { workspaceRoot: './.kamiflow', outputTargets: ['.'] }
      });

      const result = await envManager.getAbsoluteWorkspacePath();
      
      expect(path.isAbsolute(result)).toBe(true);
      expect(result).toContain('.kamiflow');
    });

    it('should resolve relative workspace paths', async () => {
      process.env.KAMI_ENV = 'development';
      mockConfigManager.get.mockResolvedValue({
        development: { workspaceRoot: './workspace', outputTargets: ['.'] }
      });

      const result = await envManager.getAbsoluteWorkspacePath();
      
      expect(path.isAbsolute(result)).toBe(true);
      expect(result).toContain('workspace');
    });
  });

  describe('getOutputTargets', () => {
    it('should return array of absolute output paths', async () => {
      process.env.KAMI_ENV = 'development';
      mockConfigManager.get.mockResolvedValue({
        development: { workspaceRoot: './.kamiflow', outputTargets: ['.', 'dist'] }
      });

      const result = await envManager.getOutputTargets();
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
      expect(path.isAbsolute(result[0])).toBe(true);
      expect(path.isAbsolute(result[1])).toBe(true);
    });

    it('should resolve relative output targets', async () => {
      process.env.KAMI_ENV = 'production';
      mockConfigManager.get.mockResolvedValue({
        production: { workspaceRoot: './.kamiflow', outputTargets: ['dist', 'build/output'] }
      });

      const result = await envManager.getOutputTargets();
      
      expect(result[0]).toContain('dist');
      expect(result[1]).toContain('build');
      expect(result[1]).toContain('output');
    });

    it('should handle single output target', async () => {
      process.env.KAMI_ENV = 'development';
      mockConfigManager.get.mockResolvedValue({
        development: { workspaceRoot: './.kamiflow', outputTargets: ['.'] }
      });

      const result = await envManager.getOutputTargets();
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
    });
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.KAMI_ENV;
    delete process.env.NODE_ENV;
  });
});
