'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Base44Agent, Base44Conversation } from '@/lib/base44/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, sleep } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface ConversationsManagerProps {
  agents: Base44Agent[];
}

type ConversationStatus = 'open' | 'pending' | 'snoozed' | 'closed';

async function fetchConversations(agentId: string, status: ConversationStatus) {
  const params = new URLSearchParams({
    agentId,
    status
  });

  const response = await fetch(`/api/conversations?${params.toString()}`);
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.message ?? 'Impossible de charger les conversations.');
  }

  const data = (await response.json()) as { data: Base44Conversation[] };
  return data.data;
}

async function fetchConversation(agentId: string, conversationId: string) {
  const params = new URLSearchParams({
    agentId
  });

  const response = await fetch(`/api/conversations/${conversationId}?${params.toString()}`);
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.message ?? 'Impossible de charger la conversation.');
  }

  const data = (await response.json()) as Base44Conversation;
  return data;
}

function useConversations(agentId: string, status: ConversationStatus) {
  return useQuery({
    queryKey: ['conversations', agentId, status],
    queryFn: () => fetchConversations(agentId, status),
    refetchInterval: 15_000
  });
}

function useConversation(agentId: string, conversationId: string | null) {
  return useQuery({
    queryKey: ['conversation', agentId, conversationId],
    queryFn: () => fetchConversation(agentId, conversationId as string),
    enabled: Boolean(conversationId),
    refetchInterval: 10_000
  });
}

async function sendAssistantMessage(params: {
  agentId: string;
  conversationId: string;
  content: string;
}) {
  const response = await fetch(`/api/conversations/${params.conversationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: params.agentId,
      content: params.content,
      role: 'assistant'
    })
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.message ?? 'Échec de l’envoi de la réponse.');
  }
}

async function triggerAutomation(agentId: string, conversationId?: string) {
  const response = await fetch('/api/automation/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId,
      conversationId
    })
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.message ?? 'Impossible de lancer l’IA.');
  }
  return (await response.json()) as {
    results: {
      conversationId: string;
      replySent: boolean;
      reason?: string;
      confidence?: number;
      entryId?: string;
    }[];
  };
}

const STATUS_OPTIONS: { value: ConversationStatus; label: string }[] = [
  { value: 'open', label: 'Ouvertes' },
  { value: 'pending', label: 'En attente' },
  { value: 'snoozed', label: 'Snoozed' },
  { value: 'closed', label: 'Clôturées' }
];

export function ConversationsManager({ agents }: ConversationsManagerProps) {
  const [agentId, setAgentId] = useState(() => agents[0]?.id ?? '');
  const [status, setStatus] = useState<ConversationStatus>('open');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [automationResult, setAutomationResult] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: conversations, isLoading, error, refetch } = useConversations(agentId, status);
  const { data: conversationDetails, isFetching: loadingConversation } = useConversation(
    agentId,
    selectedConversation
  );

  useEffect(() => {
    if (!selectedConversation && conversations && conversations.length > 0) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  const sortedMessages = useMemo(() => {
    if (!conversationDetails?.messages) return [];
    return [...conversationDetails.messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [conversationDetails]);

  const lastMessage = sortedMessages.at(-1);
  const lastRole = (lastMessage?.role ?? lastMessage?.sender_type ?? '') as string;
  const isLastMessageFromUser = ['user', 'customer', 'external_user'].includes(lastRole);

  const handleSend = async () => {
    if (!messageDraft.trim() || !selectedConversation) return;
    setIsSending(true);
    setAutomationResult(null);
    try {
      await sendAssistantMessage({
        agentId,
        conversationId: selectedConversation,
        content: messageDraft.trim()
      });
      setMessageDraft('');
      await queryClient.invalidateQueries({ queryKey: ['conversation', agentId, selectedConversation] });
      await queryClient.invalidateQueries({ queryKey: ['conversations', agentId, status] });
    } catch (err) {
      setAutomationResult(err instanceof Error ? err.message : 'Échec de la réponse.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAutomation = async (conversationId?: string) => {
    setIsSending(true);
    setAutomationResult(null);
    try {
      const result = await triggerAutomation(agentId, conversationId ?? selectedConversation ?? undefined);
      const [first] = result.results;
      if (first) {
        setAutomationResult(
          first.replySent
            ? `Réponse IA envoyée • Confiance ${(first.confidence ?? 0).toFixed(2)} • Playbook ${first.entryId}`
            : `IA non déclenchée : ${first.reason ?? 'raison inconnue'}`
        );
      }
      await sleep(500);
      await queryClient.invalidateQueries({ queryKey: ['conversation', agentId, selectedConversation] });
      await queryClient.invalidateQueries({ queryKey: ['conversations', agentId, status] });
    } catch (err) {
      setAutomationResult(err instanceof Error ? err.message : 'Impossible de lancer l’IA.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Agent
              </label>
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={agentId}
                onChange={event => {
                  setAgentId(event.target.value);
                  setSelectedConversation(null);
                }}
              >
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition',
                    status === option.value
                      ? 'border-brand-200 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button variant="secondary" className="w-full" onClick={() => refetch()}>
              Rafraîchir
            </Button>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="space-y-2 pt-5">
            {isLoading ? (
              <p className="text-sm text-slate-500">Chargement des conversations…</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Erreur.'}</p>
            ) : conversations && conversations.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {conversations.map(conversation => (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={cn(
                        'w-full rounded-lg px-3 py-3 text-left transition',
                        selectedConversation === conversation.id
                          ? 'bg-brand-50'
                          : 'hover:bg-slate-100'
                      )}
                    >
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                        <span>{conversation.subject ?? 'Conversation sans sujet'}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(conversation.updated_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {conversation.tags && conversation.tags.length > 0
                          ? conversation.tags.join(', ')
                          : 'Aucun tag'}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Aucune conversation pour ce filtre.</p>
            )}
          </CardContent>
        </Card>
        <Button
          variant="primary"
          loading={isSending}
          onClick={() => handleAutomation()}
        >
          Lancer l’IA sur toutes les conversations ouvertes
        </Button>
        {automationResult ? (
          <p className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {automationResult}
          </p>
        ) : null}
      </div>

      <Card className="flex flex-col">
        <CardContent className="flex flex-1 flex-col gap-4 pt-5">
          {loadingConversation ? (
            <p className="text-sm text-slate-500">Chargement de la conversation…</p>
          ) : conversationDetails ? (
            <>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {conversationDetails.subject ?? 'Conversation client'}
                </h3>
                <p className="text-sm text-slate-500">
                  Dernière mise à jour{' '}
                  {new Date(conversationDetails.updated_at).toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
                {sortedMessages.map(message => (
                  <div
                    key={message.id}
                    className={cn(
                      'max-w-[80%] rounded-lg border px-3 py-2 text-sm shadow-sm',
                      message.role === 'assistant' || message.sender_type === 'assistant'
                        ? 'ml-auto border-brand-200 bg-brand-50 text-brand-900'
                        : 'border-white bg-white text-slate-700'
                    )}
                  >
                    <p className="font-medium">
                      {message.sender_name ??
                        (message.role === 'assistant' ? 'SafeGuardian IA' : 'Client')}
                    </p>
                    <p className="mt-1 whitespace-pre-line">{message.content}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(message.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Textarea
                  placeholder={
                    isLastMessageFromUser
                      ? "Écrire une réponse ou laissez l’IA répondre automatiquement…"
                      : 'Le client attend une action supplémentaire ?'
                  }
                  value={messageDraft}
                  onChange={event => setMessageDraft(event.target.value)}
                  rows={5}
                />
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleAutomation(selectedConversation ?? undefined)}
                    loading={isSending}
                  >
                    Laisser l’IA répondre
                  </Button>
                  <Button type="button" onClick={handleSend} loading={isSending || !isLastMessageFromUser}>
                    Envoyer
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Sélectionnez une conversation.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
