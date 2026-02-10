/**
 * Capture cli-core logs only on error
 * Silences logs on success (as requested)
 */

import { logger } from '@kamiflow/cli-core';

export interface LogCaptureResult<T> {
  result: T | null;
  logs: string[];
  success: boolean;
  error?: Error;
}

export async function captureLogs<T>(
  operation: () => Promise<T>
): Promise<LogCaptureResult<T>> {
  const logs: string[] = [];
  
  // Store original logger methods
  const originalInfo = logger.info;
  const originalWarn = logger.warn;
  const originalError = logger.error;
  const originalDebug = logger.debug || (() => {});
  const originalHint = (logger as any).hint || (() => {});
  const originalHeader = (logger as any).header || (() => {});
  const originalSuccess = (logger as any).success || (() => {});
  
  // Override logger methods to capture
  logger.info = (...args: any[]) => {
    logs.push(`[INFO] ${args.join(' ')}`);
  };
  
  logger.warn = (...args: any[]) => {
    logs.push(`[WARN] ${args.join(' ')}`);
  };
  
  logger.error = (...args: any[]) => {
    logs.push(`[ERROR] ${args.join(' ')}`);
  };
  
  (logger as any).debug = (...args: any[]) => {
    logs.push(`[DEBUG] ${args.join(' ')}`);
  };
  
  (logger as any).hint = (...args: any[]) => {
    logs.push(`[HINT] ${args.join(' ')}`);
  };
  
  (logger as any).header = (...args: any[]) => {
    logs.push(`[HEADER] ${args.join(' ')}`);
  };
  
  (logger as any).success = (...args: any[]) => {
    logs.push(`[SUCCESS] ${args.join(' ')}`);
  };
  
  try {
    const result = await operation();
    
    // Restore original methods
    restoreLoggers();
    
    return {
      result,
      logs: [], // No logs on success (as requested)
      success: true
    };
  } catch (error) {
    // Restore original methods
    restoreLoggers();
    
    return {
      result: null,
      logs,
      success: false,
      error: error as Error
    };
  }
  
  function restoreLoggers() {
    logger.info = originalInfo;
    logger.warn = originalWarn;
    logger.error = originalError;
    (logger as any).debug = originalDebug;
    (logger as any).hint = originalHint;
    (logger as any).header = originalHeader;
    (logger as any).success = originalSuccess;
  }
}
