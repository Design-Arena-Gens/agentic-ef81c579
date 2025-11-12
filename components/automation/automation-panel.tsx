'use client';

import { useState } from 'react';
import { Base44Agent } from '@/lib/base44/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KNOWLEDGE_BASE } from '@/data/knowledge-base';

interface AutomationPanelProps {
  agents: Base44Agent[];
}

export function AutomationPanel({ agents }: AutomationPanelProps) {
  const [agentId, setAgentId] = useState(agents[0]?.id ?? '');
  const [automationLogs, setAutomationLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAutomation = async () => {
    setIsRunning(true);
    setAutomationLogs([]);
    try {
      const response = await fetch('/api/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message ?? 'Impossible de lancer l’automatisation.');
      }
      const data = (await response.json()) as {
        results: {
          conversationId: string;
          replySent: boolean;
          reason?: string;
          confidence?: number;
          entryId?: string;
        }[];
      };

      const lines = data.results.map(result =>
        result.replySent
          ? `✅ Conversation ${result.conversationId} répondue (confiance ${(result.confidence ?? 0).toFixed(
              2
            )} • playbook ${result.entryId})`
          : `⚠️ ${result.conversationId}: ${result.reason ?? 'raison inconnue'}`
      );

      setAutomationLogs(lines);
    } catch (error) {
      setAutomationLogs([
        error instanceof Error
          ? error.message
          : 'Échec lors du lancement de l’automatisation.'
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Planification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Agent cible
            </label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={agentId}
              onChange={event => setAgentId(event.target.value)}
            >
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Routine recommandée</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Scan toutes les 2 minutes des conversations ouvertes</li>
              <li>Réponse automatique si le dernier message vient du client</li>
              <li>Tagging automatique selon le playbook identifié</li>
            </ul>
          </div>
          <Button onClick={runAutomation} loading={isRunning}>
            Lancer une itération complète
          </Button>
          <p className="text-xs text-slate-500">
            Pour un déclenchement continu, programmez un cron Vercel sur <code>/api/automation/run</code>.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logs temps réel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {automationLogs.length === 0 ? (
              <p className="text-sm text-slate-500">
                Lancez une itération pour afficher les actions IA en cours.
              </p>
            ) : (
              <ul className="space-y-1 text-sm text-slate-700">
                {automationLogs.map((line, index) => (
                  <li key={`${line}-${index}`} className="rounded bg-slate-100 px-3 py-2">
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Playbooks utilisés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {KNOWLEDGE_BASE.map(entry => (
              <div key={entry.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{entry.title}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {entry.tags.join(' • ')}
                    </p>
                  </div>
                  <Badge className="bg-brand-50 text-brand-700">#{entry.id}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-600">{entry.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
