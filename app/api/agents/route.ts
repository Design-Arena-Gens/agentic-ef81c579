import { NextResponse } from 'next/server';
import { base44AuthedFetch } from '@/lib/base44/with-session';
import { Base44Agent, Base44Paginated } from '@/lib/base44/types';
import { parseBase44Error } from '@/lib/base44/errors';

export async function GET() {
  try {
    const response = await base44AuthedFetch<Base44Paginated<Base44Agent>>('/agents');
    return NextResponse.json(response);
  } catch (error) {
    const parsed = parseBase44Error(error);
    return NextResponse.json(
      {
        error: 'agents_fetch_failed',
        message: parsed.message,
        detail: parsed.detail
      },
      { status: parsed.status ?? 500 }
    );
  }
}
