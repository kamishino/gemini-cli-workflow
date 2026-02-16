/**
 * Blueprint Caching System
 * Provides in-memory caching for blueprint files to improve transpiler performance
 */

const fs = require("fs-extra");
const path = require("upath");
const crypto = require("crypto");

class BlueprintCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxAge = options.maxAge || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100; // Max number of cached items
    this.hits = 0;
    this.misses = 0;
    this.enabled = options.enabled !== false;
  }

  /**
   * Generate cache key from file path and modification time
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} Cache key
   */
  async generateKey(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const mtime = stats.mtime.getTime();
      const hash = crypto
        .createHash("md5")
        .update(`${filePath}:${mtime}`)
        .digest("hex");
      return hash;
    } catch (error) {
      // If file doesn't exist or can't be read, return path-based key
      return crypto.createHash("md5").update(filePath).digest("hex");
    }
  }

  /**
   * Get cached item
   * @param {string} filePath - File path to lookup
   * @returns {Promise<any|null>} Cached data or null
   */
  async get(filePath) {
    if (!this.enabled) return null;

    const key = await this.generateKey(filePath);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data;
  }

  /**
   * Set cache entry
   * @param {string} filePath - File path
   * @param {any} data - Data to cache
   */
  async set(filePath, data) {
    if (!this.enabled) return;

    const key = await this.generateKey(filePath);

    // Enforce max size by removing oldest entries
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      filePath,
    });
  }

  /**
   * Check if file is cached and valid
   * @param {string} filePath - File path
   * @returns {Promise<boolean>}
   */
  async has(filePath) {
    if (!this.enabled) return false;

    const key = await this.generateKey(filePath);
    const entry = this.cache.get(key);

    if (!entry) return false;

    // Check expiration
    return Date.now() - entry.timestamp <= this.maxAge;
  }

  /**
   * Invalidate specific cache entry
   * @param {string} filePath - File path
   */
  async invalidate(filePath) {
    const key = await this.generateKey(filePath);
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(2) : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`,
      enabled: this.enabled,
    };
  }

  /**
   * Enable caching
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable caching
   */
  disable() {
    this.enabled = false;
    this.clear();
  }

  /**
   * Prune expired entries
   */
  prune() {
    const now = Date.now();
    const toDelete = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        toDelete.push(key);
      }
    }

    toDelete.forEach((key) => this.cache.delete(key));
    return toDelete.length;
  }
}

// Singleton instance for global use
const globalCache = new BlueprintCache();

module.exports = {
  BlueprintCache,
  globalCache,
};
