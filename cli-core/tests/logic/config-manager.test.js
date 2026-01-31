/**
 * Unit Tests for ConfigManager
 * Target Coverage: 80%
 */

const { ConfigManager } = require('../../logic/config-manager');
const { mockConfig, mockProjectPaths } = require('../helpers/fixtures');
const { createFsMock } = require('../helpers/fs-mock');
const path = require('upath');
const os = require('os');

// Mock fs-extra
jest.mock('fs-extra');
const fs = require('fs-extra');

describe('ConfigManager', () => {
  let configManager;
  let mockPaths;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockPaths = mockProjectPaths();
    configManager = new ConfigManager(mockPaths.projectRoot);
  });

  describe('Constructor', () => {
    it('should initialize with correct paths', () => {
      expect(configManager.paths).toBeDefined();
      expect(configManager.paths.default).toContain('default-config.json');
      expect(configManager.paths.global).toContain('.kami-flow');
      expect(configManager.paths.local).toContain('.kamirc.json');
    });

    it('should initialize cache as null', () => {
      expect(configManager.cache).toBeNull();
    });
  });

  describe('loadLayer', () => {
    it('should load existing JSON file', async () => {
      const testData = { language: 'english' };
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(testData);

      const result = await configManager.loadLayer('/test/config.json');
      
      expect(result).toEqual(testData);
      expect(fs.pathExists).toHaveBeenCalledWith('/test/config.json');
      expect(fs.readJson).toHaveBeenCalledWith('/test/config.json');
    });

    it('should return empty object for non-existent file', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await configManager.loadLayer('/test/missing.json');
      
      expect(result).toEqual({});
      expect(fs.readJson).not.toHaveBeenCalled();
    });

    it('should return empty object on read error', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockRejectedValue(new Error('Parse error'));

      const result = await configManager.loadLayer('/test/bad.json');
      
      expect(result).toEqual({});
    });
  });

  describe('resolveValue', () => {
    it('should resolve simple key', () => {
      const obj = { language: 'english' };
      const result = configManager.resolveValue(obj, 'language');
      expect(result).toBe('english');
    });

    it('should resolve nested key with dot notation', () => {
      const obj = { plugins: { seed: { minFeasibility: 0.7 } } };
      const result = configManager.resolveValue(obj, 'plugins.seed.minFeasibility');
      expect(result).toBe(0.7);
    });

    it('should return undefined for missing key', () => {
      const obj = { language: 'english' };
      const result = configManager.resolveValue(obj, 'missing');
      expect(result).toBeUndefined();
    });

    it('should return undefined for missing nested key', () => {
      const obj = { plugins: {} };
      const result = configManager.resolveValue(obj, 'plugins.seed.minFeasibility');
      expect(result).toBeUndefined();
    });
  });

  describe('applyLegacyAdapter', () => {
    it('should migrate old dotted key to new structure', () => {
      const oldConfig = {
        'seed.minFeasibility': 0.8,
        language: 'english'
      };

      const result = configManager.applyLegacyAdapter(oldConfig);
      
      expect(result.plugins.seed.minFeasibility).toBe(0.8);
      expect(result['seed.minFeasibility']).toBeUndefined();
      expect(result.language).toBe('english');
    });

    it('should preserve existing structure if no migration needed', () => {
      const newConfig = {
        language: 'english',
        plugins: {
          seed: { minFeasibility: 0.7 }
        }
      };

      const result = configManager.applyLegacyAdapter(newConfig);
      
      expect(result).toEqual(newConfig);
    });

    it('should not overwrite existing plugins structure', () => {
      const config = {
        'seed.minFeasibility': 0.8,
        plugins: {
          other: { value: 1 }
        }
      };

      const result = configManager.applyLegacyAdapter(config);
      
      expect(result.plugins.seed.minFeasibility).toBe(0.8);
      expect(result.plugins.other.value).toBe(1);
    });
  });

  describe('loadAll', () => {
    it('should merge configurations from all layers', async () => {
      const defaultConfig = { language: 'english', maxRetries: 3 };
      const globalConfig = { language: 'vietnamese' };
      const localConfig = { maxRetries: 5 };

      fs.pathExists.mockResolvedValue(true);
      fs.readJson
        .mockResolvedValueOnce(defaultConfig)
        .mockResolvedValueOnce(globalConfig)
        .mockResolvedValueOnce(localConfig);

      const result = await configManager.loadAll();
      
      expect(result.language).toBe('vietnamese'); // Global overrides default
      expect(result.maxRetries).toBe(5); // Local overrides all
    });

    it('should cache result after first load', async () => {
      const defaultConfig = mockConfig();
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(defaultConfig);

      const result1 = await configManager.loadAll();
      const result2 = await configManager.loadAll();
      
      expect(result1).toBe(result2); // Same object reference
      expect(fs.readJson).toHaveBeenCalledTimes(3); // Only called once for 3 layers
    });

    it('should apply legacy adapter to each layer', async () => {
      const localConfig = { 'seed.minFeasibility': 0.9 };
      
      fs.pathExists.mockResolvedValue(true);
      fs.readJson
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(localConfig);

      const result = await configManager.loadAll();
      
      expect(result.plugins.seed.minFeasibility).toBe(0.9);
    });
  });

  describe('get', () => {
    it('should get simple config value', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(mockConfig());

      const value = await configManager.get('language');
      
      expect(value).toBe('english');
    });

    it('should get nested config value with dot notation', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(mockConfig());

      const value = await configManager.get('plugins.seed.minFeasibility');
      
      expect(value).toBe(0.7);
    });

    it('should return undefined for missing key', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(mockConfig());

      const value = await configManager.get('nonexistent');
      
      expect(value).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set local config value', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(mockConfig());
      fs.writeJson.mockResolvedValue(undefined);

      const result = await configManager.set('language', 'vietnamese', false);
      
      expect(result).toBe(true);
      expect(fs.writeJson).toHaveBeenCalledWith(
        configManager.paths.local,
        expect.objectContaining({ language: 'vietnamese' }),
        { spaces: 2 }
      );
    });

    it('should set global config value when global flag is true', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({});
      fs.writeJson.mockResolvedValue(undefined);
      fs.ensureDir.mockResolvedValue(undefined);

      const result = await configManager.set('language', 'vietnamese', true);
      
      expect(result).toBe(true);
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeJson).toHaveBeenCalledWith(
        configManager.paths.global,
        expect.objectContaining({ language: 'vietnamese' }),
        { spaces: 2 }
      );
    });

    it('should support nested key setting with dot notation', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(mockConfig());
      fs.writeJson.mockResolvedValue(undefined);

      await configManager.set('plugins.seed.minFeasibility', '0.8', false);
      
      expect(fs.writeJson).toHaveBeenCalledWith(
        configManager.paths.local,
        expect.objectContaining({
          plugins: expect.objectContaining({
            seed: expect.objectContaining({
              minFeasibility: 0.8
            })
          })
        }),
        { spaces: 2 }
      );
    });

    it('should invalidate cache after setting', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(mockConfig());
      fs.writeJson.mockResolvedValue(undefined);

      // Load first to populate cache
      await configManager.loadAll();
      expect(configManager.cache).not.toBeNull();

      // Set value should clear cache
      await configManager.set('language', 'vietnamese', false);
      expect(configManager.cache).toBeNull();
    });
  });

  describe('syncLocalConfig', () => {
    it('should add missing keys from default config', async () => {
      const localConfig = { language: 'english' }; // Missing many keys
      const defaultConfig = mockConfig();

      fs.pathExists.mockResolvedValue(true);
      fs.readJson
        .mockResolvedValueOnce(defaultConfig)
        .mockResolvedValueOnce(localConfig);
      fs.writeJson.mockResolvedValue(undefined);

      const report = await configManager.syncLocalConfig();
      
      expect(report.success).toBe(true);
      expect(report.added.length).toBeGreaterThan(0);
      expect(report.added).toContain('strategy');
      expect(report.added).toContain('maxRetries');
    });

    it('should detect orphaned keys not in schema', async () => {
      const localConfig = {
        ...mockConfig(),
        obsoleteKey: 'value',
        'old.dotted.key': 'value'
      };
      const defaultConfig = mockConfig();

      fs.pathExists.mockResolvedValue(true);
      fs.readJson
        .mockResolvedValueOnce(defaultConfig)
        .mockResolvedValueOnce(localConfig);
      fs.writeJson.mockResolvedValue(undefined);

      const report = await configManager.syncLocalConfig();
      
      expect(report.orphaned.length).toBeGreaterThan(0);
      expect(report.orphaned).toContain('obsoleteKey');
    });

    it('should preserve existing values when syncing', async () => {
      const localConfig = { language: 'vietnamese', maxRetries: 10 };
      const defaultConfig = mockConfig();

      fs.pathExists.mockResolvedValue(true);
      fs.readJson
        .mockResolvedValueOnce(defaultConfig)
        .mockResolvedValueOnce(localConfig);
      fs.writeJson.mockResolvedValue(undefined);

      await configManager.syncLocalConfig();
      
      expect(fs.writeJson).toHaveBeenCalledWith(
        configManager.paths.local,
        expect.objectContaining({
          language: 'vietnamese', // Preserved
          maxRetries: 10 // Preserved
        }),
        { spaces: 2 }
      );
    });
  });

  describe('list', () => {
    it('should list all config values with sources', async () => {
      const defaultConfig = { language: 'english', maxRetries: 3 };
      const globalConfig = { language: 'vietnamese' };
      const localConfig = { maxRetries: 5 };

      fs.pathExists.mockResolvedValue(true);
      fs.readJson
        .mockResolvedValueOnce(defaultConfig)
        .mockResolvedValueOnce(globalConfig)
        .mockResolvedValueOnce(localConfig);

      const result = await configManager.list();
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      const languageEntry = result.find(item => item.Key === 'language');
      expect(languageEntry.Value).toBe('vietnamese');
      expect(languageEntry.Source).toBe('Global');
      
      const retriesEntry = result.find(item => item.Key === 'maxRetries');
      expect(retriesEntry.Value).toBe(5);
      expect(retriesEntry.Source).toBe('Local');
    });
  });

  describe('getGlobalState and setGlobalState', () => {
    it('should get global state value', async () => {
      const globalState = { lastUpdateCheck: '2024-01-01', cached_max_id: 100 };
      
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(globalState);

      const value = await configManager.getGlobalState('cached_max_id');
      
      expect(value).toBe(100);
    });

    it('should set global state value', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({});
      fs.writeJson.mockResolvedValue(undefined);
      fs.ensureDir.mockResolvedValue(undefined);

      const result = await configManager.setGlobalState('cached_max_id', 105);
      
      expect(result).toBe(true);
      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('global-state.json'),
        expect.objectContaining({ cached_max_id: 105 }),
        { spaces: 2 }
      );
    });
  });
});
