import { base44AuthedFetch } from '@/lib/base44/with-session';
import { Base44Agent, Base44Paginated } from '@/lib/base44/types';
import { AutomationPanel } from '@/components/automation/automation-panel';
import { notFound } from 'next/navigation';

async function loadAgents() {
  try {
    const response = await base44AuthedFetch<Base44Paginated<Base44Agent>>('/agents');
    return response.data;
  } catch {
    return null;
  }
}

export default async function AutomationPage() {
  const agents = await loadAgents();
  if (!agents) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Automatisation IA</h2>
        <p className="text-sm text-slate-500">
          Planifiez, pilotez et auditez les réponses automatiques générées par l’agent SafeGuardian.
        </p>
      </div>
      <AutomationPanel agents={agents} />
    </div>
  );
}
