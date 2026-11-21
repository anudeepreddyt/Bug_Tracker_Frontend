/**
 * Decode JWT payload safely without third-party dependencies.
 * Matches JWTService.java claims: sub (username), iat, exp.
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds; add 5s buffer
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds + 5;
}

export function extractUsernameFromToken(token) {
  const payload = decodeJwtPayload(token);
  return payload?.sub || null;
}

export function getTokenRemainingMs(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return 0;
  return Math.max(0, payload.exp * 1000 - Date.now());
}
