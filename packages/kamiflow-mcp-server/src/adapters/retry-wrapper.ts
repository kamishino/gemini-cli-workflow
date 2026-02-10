/**
 * Retry wrapper with exponential backoff
 * Retries 2-3 times, then throws with logs
 */

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { 
    maxAttempts = 3, 
    delayMs = 1000, 
    backoffMultiplier = 2 
  } = options;
  
  const logs: string[] = [];
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logs.push(`[Attempt ${attempt}/${maxAttempts}] Starting operation...`);
      const result = await operation();
      logs.push(`[Attempt ${attempt}/${maxAttempts}] ✅ Success`);
      return result;
    } catch (error) {
      lastError = error as Error;
      logs.push(`[Attempt ${attempt}/${maxAttempts}] ❌ Failed: ${(error as Error).message}`);
      
      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        logs.push(`[Attempt ${attempt}/${maxAttempts}] ⏳ Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
    }
  }
  
  // All attempts failed - throw with logs
  const errorMessage = `Operation failed after ${maxAttempts} attempts.\n\nExecution Logs:\n${logs.join('\n')}\n\nFinal Error: ${lastError?.message || 'Unknown error'}`;
  throw new Error(errorMessage);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
