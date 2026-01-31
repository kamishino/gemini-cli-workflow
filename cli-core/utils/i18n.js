/**
 * Internationalization (i18n) Utility
 * Provides translation support for KamiFlow CLI
 */

const fs = require("fs-extra");
const path = require("upath");

class I18n {
  constructor() {
    this.translations = {};
    this.currentLanguage = "en";
    this.fallbackLanguage = "en";
    this.loaded = false;
  }

  /**
   * Load translations from locale files
   */
  async load() {
    if (this.loaded) return;

    const localesDir = path.join(__dirname, "../locales");

    try {
      // Load English (fallback)
      const enPath = path.join(localesDir, "en.json");
      if (await fs.pathExists(enPath)) {
        this.translations.en = await fs.readJson(enPath);
      }

      // Load Vietnamese
      const viPath = path.join(localesDir, "vi.json");
      if (await fs.pathExists(viPath)) {
        this.translations.vi = await fs.readJson(viPath);
      }

      this.loaded = true;
    } catch (error) {
      console.error("Failed to load translations:", error.message);
      // Continue with empty translations
    }
  }

  /**
   * Set current language
   * @param {string} lang - Language code (en, vi)
   */
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
    }
  }

  /**
   * Get current language from environment or config
   */
  async detectLanguage() {
    // Priority: KAMI_LANG env var > config > default
    const envLang = process.env.KAMI_LANG;
    if (envLang && this.translations[envLang]) {
      this.currentLanguage = envLang;
      return;
    }

    // Try to load from config
    try {
      const { ConfigManager } = require("../logic/config-manager");
      const config = new ConfigManager();
      const configLang = await config.get("language");

      // Only process if configLang exists and is a string
      if (configLang && typeof configLang === "string") {
        // Map config values to language codes
        const langMap = {
          english: "en",
          vietnamese: "vi",
          en: "en",
          vi: "vi",
        };

        const mappedLang = langMap[configLang.toLowerCase()];
        if (mappedLang && this.translations[mappedLang]) {
          this.currentLanguage = mappedLang;
        }
      }
    } catch (error) {
      // Ignore config errors, use default
    }
  }

  /**
   * Translate a key with parameter substitution
   * @param {string} key - Translation key (e.g., 'cli.error.commandNotFound')
   * @param {object} params - Parameters for substitution (e.g., { command: 'test' })
   * @returns {string} Translated string
   */
  t(key, params = {}) {
    // Get translation from current language or fallback
    let text = this.translations[this.currentLanguage]?.[key] || this.translations[this.fallbackLanguage]?.[key] || key;

    // Replace parameters ({{param}} format)
    if (params && typeof params === "object") {
      Object.entries(params).forEach(([param, value]) => {
        const regex = new RegExp(`{{${param}}}`, "g");
        text = text.replace(regex, String(value));
      });
    }

    return text;
  }

  /**
   * Check if a translation key exists
   * @param {string} key - Translation key
   * @returns {boolean}
   */
  has(key) {
    return !!(this.translations[this.currentLanguage]?.[key] || this.translations[this.fallbackLanguage]?.[key]);
  }

  /**
   * Get all keys for current language
   * @returns {string[]}
   */
  getKeys() {
    return Object.keys(this.translations[this.currentLanguage] || {});
  }

  /**
   * Get supported languages
   * @returns {string[]}
   */
  getSupportedLanguages() {
    return Object.keys(this.translations);
  }
}

// Singleton instance
const i18n = new I18n();

/**
 * Initialize i18n system
 * Must be called before using translations
 */
async function initI18n() {
  await i18n.load();
  await i18n.detectLanguage();
}

/**
 * Translate a key (shorthand)
 * @param {string} key - Translation key
 * @param {object} params - Parameters
 * @returns {string}
 */
function t(key, params) {
  return i18n.t(key, params);
}

module.exports = {
  i18n,
  initI18n,
  t,
};
