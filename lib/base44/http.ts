import { NextResponse } from 'next/server';
import { BASE44_API_ROOT } from './config';
import { Base44Error } from './errors';
import { Base44LoginResponse } from './types';

export interface Base44RequestOptions extends RequestInit {
  accessToken?: string | null;
  skipAuth?: boolean;
}

export async function base44Fetch<T = unknown>(
  path: string,
  { accessToken, skipAuth, headers, ...init }: Base44RequestOptions = {}
): Promise<T> {
  const url = `${BASE44_API_ROOT}${path}`;
  const requestHeaders = new Headers(headers ?? {});

  if (!skipAuth) {
    if (!accessToken) {
      throw new Base44Error('Authentification requise', 401);
    }
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  if (init.body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    headers: requestHeaders
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJSON = contentType.includes('application/json');
  const payload = isJSON ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload
        ? (payload as { message?: string }).message
        : null) ?? response.statusText ?? 'Erreur API Base44';
    throw new Base44Error(message, response.status, payload);
  }

  return payload as T;
}

export async function base44Login(params: {
  email: string;
  password: string;
  turnstileToken?: string;
}): Promise<Base44LoginResponse> {
  return base44Fetch<Base44LoginResponse>(`/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      ...(params.turnstileToken ? { turnstile_token: params.turnstileToken } : {})
    }),
    skipAuth: true
  });
}

export async function base44RefreshToken(refreshToken: string) {
  return base44Fetch<Base44LoginResponse>(`/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({
      refresh_token: refreshToken
    }),
    skipAuth: true
  });
}

export function unauthorizedResponse(message = 'Authentification requise') {
  return NextResponse.json(
    {
      error: 'unauthorized',
      message
    },
    { status: 401 }
  );
}
