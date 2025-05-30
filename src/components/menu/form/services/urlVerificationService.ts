
/**
 * Service for verifying URL accessibility with retry logic
 */
export class UrlVerificationService {
  private static readonly DEFAULT_TIMEOUT = 3000; // 3 seconds
  private static readonly DEFAULT_MAX_RETRIES = 3;

  /**
   * Verifies if a URL is accessible with retry logic
   */
  static async verifyUrlWithRetry(
    url: string, 
    maxRetries: number = this.DEFAULT_MAX_RETRIES
  ): Promise<boolean> {
    console.log('🔍 UrlVerification - Starting verification with retry logic for:', url);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 UrlVerification - Attempt ${attempt}/${maxRetries}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);

        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log(`🔍 UrlVerification - ✅ Verification successful on attempt ${attempt}`);
          return true;
        } else {
          console.warn(`🔍 UrlVerification - ⚠️ Failed on attempt ${attempt}, status:`, response.status);
        }

      } catch (error) {
        console.warn(`🔍 UrlVerification - ⚠️ Error on attempt ${attempt}:`, error);

        if (attempt < maxRetries) {
          // Exponential backoff
          const waitTime = Math.pow(2, attempt) * 500;
          console.log(`🔍 UrlVerification - Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    console.error('🔍 UrlVerification - ❌ Verification failed after all retries');
    return false;
  }

  /**
   * Quick verification without retries (for immediate checks)
   */
  static async quickVerify(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('🔍 UrlVerification - Quick verify failed:', error);
      return false;
    }
  }
}
