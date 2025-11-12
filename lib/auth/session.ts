import { cookies } from 'next/headers';

const ACCESS_COOKIE = 'sg_access_token';
const REFRESH_COOKIE = 'sg_refresh_token';

export interface Base44Session {
  accessToken: string | null;
  refreshToken: string | null;
}

export function readSession(): Base44Session {
  const store = cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value ?? null;
  const refreshToken = store.get(REFRESH_COOKIE)?.value ?? null;
  return { accessToken, refreshToken };
}

export function persistSession({
  accessToken,
  refreshToken,
  accessMaxAge = 60 * 60,
  refreshMaxAge = 60 * 60 * 24 * 14
}: {
  accessToken: string;
  refreshToken: string;
  accessMaxAge?: number;
  refreshMaxAge?: number;
}) {
  const store = cookies();

  store.set({
    name: ACCESS_COOKIE,
    value: accessToken,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: accessMaxAge
  });

  store.set({
    name: REFRESH_COOKIE,
    value: refreshToken,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshMaxAge
  });
}

export function clearSession() {
  const store = cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
