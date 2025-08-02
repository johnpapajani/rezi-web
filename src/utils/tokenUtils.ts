export interface JwtPayload {
  exp?: number;
  [key: string]: any;
}

export const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
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
};

export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwt(token);
  if (!payload?.exp) {
    return true;
  }
  const current = Math.floor(Date.now() / 1000);
  return payload.exp < current;
};

export const getRefreshTimeout = (token: string): number => {
  const payload = parseJwt(token);
  if (!payload?.exp) {
    return 0;
  }
  const current = Math.floor(Date.now() / 1000);
  const millisUntilExpiry = (payload.exp - current) * 1000;
  const refreshMillis = millisUntilExpiry - 60 * 1000; // refresh 1 minute early
  return refreshMillis > 0 ? refreshMillis : 0;
};
