import { NextResponse } from 'next/server';
import { z } from 'zod';
import { base44AuthedFetch } from '@/lib/base44/with-session';
import { Base44Conversation, Base44Paginated } from '@/lib/base44/types';
import { parseBase44Error } from '@/lib/base44/errors';

const querySchema = z.object({
  agentId: z.string().min(1),
  status: z.enum(['open', 'closed', 'pending', 'snoozed']).optional(),
  search: z.string().optional()
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    agentId: url.searchParams.get('agentId'),
    status: url.searchParams.get('status') ?? undefined,
    search: url.searchParams.get('search') ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'invalid_query',
        message: 'Paramètres de requête invalides.',
        detail: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const params = new URLSearchParams();
  if (parsed.data.status) {
    params.set('status', parsed.data.status);
  }
  if (parsed.data.search) {
    params.set('q', parsed.data.search);
  }
  params.set('limit', '50');

  const path = `/agents/${encodeURIComponent(parsed.data.agentId)}/conversations?${params.toString()}`;

  try {
    const response = await base44AuthedFetch<Base44Paginated<Base44Conversation>>(path);
    return NextResponse.json(response);
  } catch (error) {
    const parsedError = parseBase44Error(error);
    return NextResponse.json(
      {
        error: 'conversations_fetch_failed',
        message: parsedError.message,
        detail: parsedError.detail
      },
      { status: parsedError.status ?? 500 }
    );
  }
}
