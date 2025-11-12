import { notFound } from 'next/navigation';
import { base44AuthedFetch } from '@/lib/base44/with-session';
import { Base44Agent, Base44Paginated } from '@/lib/base44/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KNOWLEDGE_BASE } from '@/data/knowledge-base';
import { Badge } from '@/components/ui/badge';

async function loadAgents() {
  try {
    const response = await base44AuthedFetch<Base44Paginated<Base44Agent>>('/agents');
    return response.data;
  } catch {
    return null;
  }
}

export default async function DashboardOverviewPage() {
  const agents = await loadAgents();
  if (!agents) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Agents SafeGuardian</h2>
        <p className="text-sm text-slate-500">
          Vue consolidée de vos agents, canaux de diffusion et statut de disponibilité.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map(agent => (
            <Card key={agent.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{agent.name}</span>
                  <Badge
                    className={
                      agent.status === 'active'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }
                  >
                    {agent.status === 'active' ? 'Actif' : 'En veille'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>{agent.description ?? 'Agent connecté à SafeGuardian.'}</p>
                {agent.channels && agent.channels.length > 0 ? (
                  <div>
                    <p className="font-medium text-slate-700">Canaux connectés</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {agent.channels.map(channel => (
                        <Badge
                          key={channel.type}
                          className={
                            channel.enabled
                              ? 'border-brand-200 bg-brand-50 text-brand-700'
                              : 'border-slate-200 bg-slate-100 text-slate-600'
                          }
                        >
                          {channel.type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">Playbooks IA disponibles</h2>
        <p className="text-sm text-slate-500">
          Base de connaissances utilisée par l’agent autonome pour guider les réponses en direct.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {KNOWLEDGE_BASE.map(entry => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="text-base">{entry.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">{entry.description}</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mots-clés
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.keywords.length > 0 ? (
                      entry.keywords.map(keyword => (
                        <Badge key={keyword} className="bg-slate-100 text-slate-600">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600">Catch-all</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
