import { NextResponse } from 'next/server';
import { z } from 'zod';
import { base44AuthedFetch } from '@/lib/base44/with-session';
import { Base44Conversation } from '@/lib/base44/types';
import { parseBase44Error } from '@/lib/base44/errors';

const paramsSchema = z.object({
  conversationId: z.string().min(1)
});

const querySchema = z.object({
  agentId: z.string().min(1)
});

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json(
      {
        error: 'invalid_conversation_id',
        message: 'Identifiant de conversation invalide.',
        detail: parsedParams.error.flatten()
      },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const parsedQuery = querySchema.safeParse({
    agentId: url.searchParams.get('agentId')
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error: 'invalid_query',
        message: 'Paramètres de requête invalides.',
        detail: parsedQuery.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const conversation = await base44AuthedFetch<Base44Conversation>(
      `/agents/${encodeURIComponent(parsedQuery.data.agentId)}/conversations/${encodeURIComponent(
        parsedParams.data.conversationId
      )}`
    );
    return NextResponse.json(conversation);
  } catch (error) {
    const parsedError = parseBase44Error(error);
    return NextResponse.json(
      {
        error: 'conversation_fetch_failed',
        message: parsedError.message,
        detail: parsedError.detail
      },
      { status: parsedError.status ?? 500 }
    );
  }
}

const sendMessageSchema = z.object({
  agentId: z.string().min(1),
  content: z.string().min(1),
  role: z.enum(['assistant', 'system', 'user']).default('assistant')
});

export async function POST(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  const payload = await request.json().catch(() => null);
  const parsedBody = sendMessageSchema.safeParse(payload);
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: 'invalid_payload',
        message: 'Corps de requête invalide.',
        detail: parsedBody.error.flatten()
      },
      { status: 400 }
    );
  }

  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json(
      {
        error: 'invalid_conversation_id',
        message: 'Identifiant de conversation invalide.',
        detail: parsedParams.error.flatten()
      },
      { status: 400 }
    );
  }

  const path = `/agents/${encodeURIComponent(parsedBody.data.agentId)}/conversations/${encodeURIComponent(
    parsedParams.data.conversationId
  )}/messages`;

  try {
    const response = await base44AuthedFetch(path, {
      method: 'POST',
      body: JSON.stringify({
        content: parsedBody.data.content,
        role: parsedBody.data.role
      })
    });

    return NextResponse.json(response);
  } catch (error) {
    const parsedError = parseBase44Error(error);
    return NextResponse.json(
      {
        error: 'send_failed',
        message: parsedError.message,
        detail: parsedError.detail
      },
      { status: parsedError.status ?? 500 }
    );
  }
}
