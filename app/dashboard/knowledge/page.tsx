import { KNOWLEDGE_BASE } from '@/data/knowledge-base';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Base de connaissances IA</h2>
        <p className="text-sm text-slate-500">
          Ajustez les playbooks utilisés par l’agent SafeGuardian pour générer des réponses autonomes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {KNOWLEDGE_BASE.map(entry => (
          <Card key={entry.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{entry.title}</span>
                <Badge className="bg-brand-50 text-brand-700">#{entry.id}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{entry.description}</p>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mots-clés détectés
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
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Réponse générée
                </p>
                <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {entry.response}
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
