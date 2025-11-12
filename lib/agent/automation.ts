import { base44AuthedFetch } from '@/lib/base44/with-session';
import {
  Base44Conversation,
  Base44Message,
  Base44Paginated
} from '@/lib/base44/types';
import { generateReply } from './policy';
import { Base44Error } from '@/lib/base44/errors';

export interface AutomationResult {
  conversationId: string;
  replySent: boolean;
  reason?: string;
  entryId?: string;
  confidence?: number;
}

export async function fetchOpenConversations(agentId: string) {
  const response = await base44AuthedFetch<Base44Paginated<Base44Conversation>>(
    `/agents/${encodeURIComponent(agentId)}/conversations?status=open&limit=50`
  );
  return response.data;
}

export async function fetchConversation(
  agentId: string,
  conversationId: string
) {
  return base44AuthedFetch<Base44Conversation>(
    `/agents/${encodeURIComponent(agentId)}/conversations/${encodeURIComponent(conversationId)}`
  );
}

function extractLastUserMessage(conversation: Base44Conversation): Base44Message | null {
  const ordered = [...(conversation.messages ?? [])].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    const message = ordered[index];
    const role = (message.role ?? message.sender_type ?? '') as string;
    if (['user', 'customer', 'external_user'].includes(role)) {
      return message;
    }
    if (role === 'assistant' || role === 'agent') {
      break;
    }
  }
  return null;
}

export async function sendReply(params: {
  agentId: string;
  conversationId: string;
  message: string;
}) {
  return base44AuthedFetch(
    `/agents/${encodeURIComponent(params.agentId)}/conversations/${encodeURIComponent(
      params.conversationId
    )}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({
        role: 'assistant',
        content: params.message
      })
    }
  );
}

export async function runAutomationOnConversation(params: {
  agentId: string;
  conversationId: string;
}): Promise<AutomationResult> {
  const conversation = await fetchConversation(params.agentId, params.conversationId);
  if (!conversation.messages || conversation.messages.length === 0) {
    return {
      conversationId: conversation.id,
      replySent: false,
      reason: 'Aucun message dans la conversation'
    };
  }

  const lastMessage = extractLastUserMessage(conversation);
  if (!lastMessage) {
    return {
      conversationId: conversation.id,
      replySent: false,
      reason: 'Dernier message non émis par un utilisateur'
    };
  }

  const lastMessageDate = new Date(lastMessage.created_at).getTime();
  const lastConversationMessageDate = new Date(
    conversation.messages[conversation.messages.length - 1].created_at
  ).getTime();

  if (lastConversationMessageDate > lastMessageDate) {
    return {
      conversationId: conversation.id,
      replySent: false,
      reason: 'Une réponse existe déjà après le dernier message client'
    };
  }

  const reply = generateReply(conversation, lastMessage);
  await sendReply({
    agentId: params.agentId,
    conversationId: conversation.id,
    message: reply.content
  });

  return {
    conversationId: conversation.id,
    replySent: true,
    entryId: reply.entryId,
    confidence: reply.confidence
  };
}

export async function runAutomationSweep(agentId: string) {
  const conversations = await fetchOpenConversations(agentId);
  const results: AutomationResult[] = [];

  for (const conversation of conversations) {
    try {
      const outcome = await runAutomationOnConversation({
        agentId,
        conversationId: conversation.id
      });
      results.push(outcome);
    } catch (error) {
      const detail =
        error instanceof Base44Error ? error.message : 'Erreur inconnue lors du traitement';
      results.push({
        conversationId: conversation.id,
        replySent: false,
        reason: detail
      });
    }
  }

  return results;
}
