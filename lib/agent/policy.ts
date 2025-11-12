import { KNOWLEDGE_BASE } from '@/data/knowledge-base';
import { Base44Conversation, Base44Message } from '@/lib/base44/types';

type ScoredMatch = {
  entryId: string;
  score: number;
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .split(/[^a-z0-9]+/u)
    .filter(Boolean);
}

function scoreMessageAgainstEntry(message: string, entryKeywords: string[]) {
  if (entryKeywords.length === 0) return 0.2;
  const tokens = tokenize(message);
  const keywordTokens = entryKeywords.map(tokenize).flat();
  const matches = tokens.reduce((count, token) => {
    if (keywordTokens.includes(token)) {
      return count + 1;
    }
    return count;
  }, 0);

  return matches > 0 ? matches / keywordTokens.length : 0;
}

function findBestKnowledgeEntry(message: string): ScoredMatch | null {
  const matches = KNOWLEDGE_BASE.map(entry => ({
    entryId: entry.id,
    score: scoreMessageAgainstEntry(message, entry.keywords)
  })).sort((a, b) => b.score - a.score);

  const top = matches[0];
  if (!top || top.score < 0.15) {
    return {
      entryId: 'fallback',
      score: 0.15
    };
  }

  return top;
}

export interface GeneratedReply {
  content: string;
  entryId: string;
  confidence: number;
  summary: string;
  suggestedTags: string[];
}

function inferTags(entryId: string, fallback: string[]): string[] {
  const entry = KNOWLEDGE_BASE.find(item => item.id === entryId);
  if (!entry) return fallback;
  return entry.tags;
}

function buildSummary(conversation: Base44Conversation, reply: string): string {
  const participantName =
    conversation.participants?.find(participant => participant.role === 'customer')?.name ??
    'client';
  return `${participantName} • ${reply.slice(0, 64)}${reply.length > 64 ? '…' : ''}`;
}

export function generateReply(
  conversation: Base44Conversation,
  lastUserMessage: Base44Message
): GeneratedReply {
  const match = findBestKnowledgeEntry(lastUserMessage.content);

  const entry = KNOWLEDGE_BASE.find(item => item.id === (match?.entryId ?? 'fallback'));
  const responseText = entry?.response ?? KNOWLEDGE_BASE.find(item => item.id === 'fallback')!.response;

  return {
    content: responseText,
    entryId: entry?.id ?? 'fallback',
    confidence: match?.score ?? 0.1,
    summary: buildSummary(conversation, responseText),
    suggestedTags: inferTags(entry?.id ?? 'fallback', [])
  };
}
