/**
 * Type declarations for @kamiflow/cli-core
 * Since cli-core is JavaScript, we declare the module here
 */

declare module '@kamiflow/cli-core' {
  // Logger
  const logger: {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    hint: (...args: any[]) => void;
    header: (...args: any[]) => void;
    success: (...args: any[]) => void;
  };

  // i18n
  const i18n: {
    setLanguage: (lang: string) => void;
  };

  // Installer (exports functions, not a class)
  const Installer: {
    initializeProject: (projectPath: string, options: any) => Promise<void>;
    getGeneStorePath: () => string;
  };

  // Doctor
  class Doctor {
    run(projectPath: string, options: any): Promise<any>;
  }

  // Updater
  class Updater {
    runUpdate(projectPath: string, options: any): Promise<any>;
  }

  // ConfigManager
  class ConfigManager {
    set(key: string, value: string, isGlobal: boolean): Promise<boolean>;
    get(key: string): Promise<any>;
    list(): Promise<any[]>;
    syncLocalConfig(): Promise<any>;
  }

  // Saiyan
  class Saiyan {
    runSaiyanMode(input: string, options: any): Promise<any>;
  }

  // SuperSaiyan
  class SuperSaiyan {
    runSuperSaiyan(source?: string): Promise<any>;
  }

  // Version
  const version: string;

  // Default export containing all modules
  const cliCore: {
    logger: typeof logger;
    i18n: typeof i18n;
    Installer: typeof Installer;
    Doctor: typeof Doctor;
    Updater: typeof Updater;
    ConfigManager: typeof ConfigManager;
    Saiyan: typeof Saiyan;
    SuperSaiyan: typeof SuperSaiyan;
    version: typeof version;
  };

  export default cliCore;
}
