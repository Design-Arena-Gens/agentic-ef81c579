import { NextResponse } from 'next/server';
import { z } from 'zod';
import { base44Login } from '@/lib/base44/http';
import { persistSession } from '@/lib/auth/session';
import { Base44Error, parseBase44Error } from '@/lib/base44/errors';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  turnstileToken: z.string().optional()
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'invalid_request',
        message: 'Les identifiants fournis sont invalides.',
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const loginResponse = await base44Login(parsed.data);
    persistSession({
      accessToken: loginResponse.access_token,
      refreshToken: loginResponse.refresh_token
    });

    return NextResponse.json({
      user: loginResponse.user
    });
  } catch (error) {
    const parsedError = parseBase44Error(error);
    const status = parsedError.status ?? 500;
    const message =
      status === 401
        ? 'Impossible de se connecter. Vérifiez vos identifiants.'
        : parsedError.message;
    return NextResponse.json(
      {
        error: 'login_failed',
        message,
        detail: parsedError.detail
      },
      { status }
    );
  }
}
