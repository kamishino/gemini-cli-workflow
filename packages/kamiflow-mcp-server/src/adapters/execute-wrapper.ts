/**
 * Combined retry + log capture wrapper
 * Retries 3 times, captures logs on error only
 */

import { withRetry } from './retry-wrapper.js';
import { captureLogs, LogCaptureResult } from './log-capture.js';

export interface AdapterResult<T> {
  success: boolean;
  result: T | null;
  message: string;
  logs: string[];
  error?: Error;
}

export async function executeWithRetryAndLogs<T>(
  operation: () => Promise<T>,
  successMessage?: string
): Promise<AdapterResult<T>> {
  let capturedLogs: string[] = [];
  let finalError: Error | null = null;
  let finalResult: T | null = null;
  
  try {
    await withRetry(async () => {
      const captureResult = await captureLogs(operation);
      
      if (!captureResult.success) {
        capturedLogs = captureResult.logs;
        throw captureResult.error!;
      }
      
      finalResult = captureResult.result;
    }, {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2
    });
    
    return {
      success: true,
      result: finalResult,
      message: successMessage || '✅ Operation completed successfully',
      logs: [], // No logs on success
      error: undefined
    };
    
  } catch (error) {
    finalError = error as Error;
    
    return {
      success: false,
      result: null,
      message: `❌ ${finalError.message}`,
      logs: capturedLogs,
      error: finalError
    };
  }
}
