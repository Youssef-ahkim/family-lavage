/**
 * Safe client-side utility to read a cookie value by its name.
 * Prevents substring matching issues (e.g. matching "pb_logged_in" inside another cookie name).
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}
