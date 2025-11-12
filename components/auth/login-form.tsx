/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message ?? 'Connexion échouée.');
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion échouée.');
      setLoading(false);
    }
  };

  return (
    <Card className={cn('max-w-md border-slate-200 shadow-lg shadow-brand-950/5', className)}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="SafeGuardian" className="h-10 w-10" />
          <div>
            <CardTitle>Connexion SafeGuardian AI</CardTitle>
            <CardDescription>
              Accédez au centre de contrôle de l’agent IA autonome.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Email professionnel
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              required
              value={email}
              autoComplete="email"
              onChange={event => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              autoComplete="current-password"
              onChange={event => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" loading={loading}>
            Se connecter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
