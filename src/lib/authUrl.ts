// Stable public URL used for auth email redirects.
// When the app is opened from the Lovable editor/preview, window.location.origin
// becomes an internal *.lovableproject.com host, which sends users to a broken
// page after clicking auth email links. Always use the published domain instead.
const PUBLIC_APP_URL = 'https://elliotscalendar.lovable.app';

/**
 * Returns the base URL that should be used for auth email redirects.
 * Prefers the current origin only if it's the published domain or a custom
 * domain (i.e. NOT the internal preview/editor host).
 */
export function getAuthRedirectBase(): string {
  if (typeof window === 'undefined') return PUBLIC_APP_URL;
  const origin = window.location.origin;
  if (
    origin.includes('lovableproject.com') ||
    origin.includes('id-preview--') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  ) {
    return PUBLIC_APP_URL;
  }
  return origin;
}

export function getResetPasswordRedirect(): string {
  return `${getAuthRedirectBase()}/reset-password`;
}
