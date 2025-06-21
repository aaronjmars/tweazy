import { PaymentContext } from '@/lib/payment';

/**
 * Generates a random session ID for anonymous users
 */
function generateAnonymousSessionId(): string {
  // Generate a random string using crypto.getRandomValues for better randomness
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for server-side or older browsers
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Gets or creates an anonymous session ID stored in sessionStorage
 * This ensures the same anonymous user keeps their conversation during the browser session
 * but gets a new ID when they open a new tab/window or restart the browser
 */
function getAnonymousSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: generate a new ID each time
    return generateAnonymousSessionId();
  }

  const storageKey = 'tambo-anonymous-session-id';
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = generateAnonymousSessionId();
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

/**
 * Generates a unique context key for Tambo threads based on user's wallet address
 * This ensures each user has their own isolated conversation history
 */
export function generateUserContextKey(
  paymentContext: PaymentContext | null,
  isWalletReady: boolean,
  baseKey: string = 'tambo-template'
): string {
  if (!isWalletReady || !paymentContext) {
    // Generate unique session ID for anonymous users
    const anonymousId = getAnonymousSessionId();
    return `${baseKey}-anonymous-${anonymousId}`;
  }

  // Use wallet address as unique identifier
  const userAddress = paymentContext.userAddress ||
                     paymentContext.walletInfo?.address ||
                     paymentContext.smartWalletInfo?.address;

  if (userAddress) {
    return `${baseKey}-${userAddress.toLowerCase()}`;
  }

  // Fallback to anonymous session if no address is available
  const anonymousId = getAnonymousSessionId();
  return `${baseKey}-anonymous-${anonymousId}`;
}

/**
 * Hook to get the current user's context key
 */
export function useUserContextKey(baseKey: string = 'tambo-template'): string {
  // This would need to be implemented with the wallet context
  // For now, we'll keep the logic in the component
  return baseKey;
}
