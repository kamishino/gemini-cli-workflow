/**
 * Type declarations for @kamiflow/cli-core
 * Since cli-core is JavaScript, we declare the module here
 */

declare module '@kamiflow/cli-core' {
  // Logger
  export const logger: {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    hint: (...args: any[]) => void;
    header: (...args: any[]) => void;
    success: (...args: any[]) => void;
  };

  // i18n
  export const i18n: {
    setLanguage: (lang: string) => void;
  };

  // Installer
  export class Installer {
    initialize(projectPath: string, options: any): Promise<void>;
  }

  // Doctor
  export class Doctor {
    run(projectPath: string, options: any): Promise<any>;
  }

  // Updater
  export class Updater {
    runUpdate(projectPath: string, options: any): Promise<any>;
  }

  // ConfigManager
  export class ConfigManager {
    set(key: string, value: string, isGlobal: boolean): Promise<boolean>;
    get(key: string): Promise<any>;
    list(): Promise<any[]>;
    syncLocalConfig(): Promise<any>;
  }

  // Saiyan
  export class Saiyan {
    runSaiyanMode(input: string, options: any): Promise<any>;
  }

  // SuperSaiyan
  export class SuperSaiyan {
    runSuperSaiyan(source?: string): Promise<any>;
  }

  // Version
  export const version: string;
}
