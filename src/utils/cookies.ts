export const CONSENT_COOKIE_NAME = 'livesim_cookie_consent';

/**
 * Resolves the cookie domain from the VITE_COOKIE_DOMAIN environment variable.
 */
export function getCookieDomain(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_COOKIE_DOMAIN) {
    return import.meta.env.VITE_COOKIE_DOMAIN;
  }
  return '';
}

/**
 * Sets the consent cookie using CONSENT_COOKIE_NAME and Domain taken from VITE_COOKIE_DOMAIN.
 */
export function setConsentCookie(value: 'accepted' | 'rejected'): void {
  if (typeof document === 'undefined') return;

  const domain = getCookieDomain();
  const domainPart = domain ? `; domain=${domain}` : '';
  const securePart = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  const maxAge = 365 * 24 * 60 * 60; // 365 days (1 year)

  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}; path=/${domainPart}; max-age=${maxAge}; SameSite=Lax${securePart}`;

  // Keep localStorage synchronized for resilience across browsers
  try {
    localStorage.setItem(CONSENT_COOKIE_NAME, value);
  } catch (e) {}
}

/**
 * Retrieves the current consent state from document.cookie or localStorage.
 */
export function getConsentCookie(): string | null {
  if (typeof document === 'undefined') return null;

  // 1. Read directly from document.cookie
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE_NAME}=([^;]*)`));
  if (match) {
    return decodeURIComponent(match[1]);
  }

  // 2. Check localStorage fallback
  try {
    return localStorage.getItem(CONSENT_COOKIE_NAME);
  } catch (e) {
    return null;
  }
}
