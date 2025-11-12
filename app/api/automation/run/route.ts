import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runAutomationSweep, runAutomationOnConversation } from '@/lib/agent/automation';
import { parseBase44Error } from '@/lib/base44/errors';

const runSchema = z.object({
  agentId: z.string().min(1),
  conversationId: z.string().optional()
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = runSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'invalid_payload',
        message: 'Paramètres invalides pour le lancement de la réponse automatique.',
        detail: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    if (parsed.data.conversationId) {
      const result = await runAutomationOnConversation({
        agentId: parsed.data.agentId,
        conversationId: parsed.data.conversationId
      });
      return NextResponse.json({ results: [result] });
    }

    const results = await runAutomationSweep(parsed.data.agentId);
    return NextResponse.json({ results });
  } catch (error) {
    const parsedError = parseBase44Error(error);
    return NextResponse.json(
      {
        error: 'automation_failed',
        message: parsedError.message,
        detail: parsedError.detail
      },
      { status: parsedError.status ?? 500 }
    );
  }
}
