import { base44AuthedFetch } from '@/lib/base44/with-session';
import { Base44Agent, Base44Paginated } from '@/lib/base44/types';
import { ConversationsManager } from '@/components/conversations/conversations-manager';
import { notFound } from 'next/navigation';

async function loadAgents() {
  try {
    const response = await base44AuthedFetch<Base44Paginated<Base44Agent>>('/agents');
    return response.data;
  } catch {
    return null;
  }
}

export default async function ConversationsPage() {
  const agents = await loadAgents();
  if (!agents) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Conversations en direct</h2>
        <p className="text-sm text-slate-500">
          Filtrez, inspectez et répondez instantanément aux demandes des clients SafeGuardian.
        </p>
      </div>
      <ConversationsManager agents={agents} />
    </div>
  );
}
