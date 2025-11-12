import { readSession, persistSession } from '@/lib/auth/session';
import { Base44Error } from './errors';
import { base44Fetch, base44RefreshToken } from './http';

export interface CallWithSessionOptions<T> {
  action: (tokens: { accessToken: string; refreshToken: string }) => Promise<T>;
  allowUnauthenticated?: boolean;
}

export async function callWithBase44Session<T>({
  action,
  allowUnauthenticated = false
}: CallWithSessionOptions<T>): Promise<T> {
  const { accessToken, refreshToken } = readSession();

  if (!accessToken || !refreshToken) {
    if (allowUnauthenticated) {
      return action({ accessToken: '', refreshToken: '' });
    }
    throw new Base44Error('Authentification requise', 401);
  }

  try {
    return await action({ accessToken, refreshToken });
  } catch (error) {
    if (error instanceof Base44Error && error.status === 401) {
      const refreshed = await base44RefreshToken(refreshToken);
      persistSession({
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token
      });
      return action({
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token
      });
    }

    throw error;
  }
}

export async function base44AuthedFetch<T>(
  path: string,
  init?: Omit<RequestInit, 'headers'> & { headers?: HeadersInit }
): Promise<T> {
  return callWithBase44Session({
    action: async ({ accessToken }) =>
      base44Fetch<T>(path, {
        ...init,
        accessToken
      })
  });
}
