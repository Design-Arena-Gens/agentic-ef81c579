import Image from 'next/image';
import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readSession } from '@/lib/auth/session';
import { LogoutButton } from '@/components/auth/logout-button';

const navigation = [
  { name: 'Vue d’ensemble', href: '/dashboard' },
  { name: 'Conversations', href: '/dashboard/conversations' },
  { name: 'Automatisation', href: '/dashboard/automation' },
  { name: 'Base de connaissances', href: '/dashboard/knowledge' }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const session = readSession();
  if (!session.accessToken) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-72 flex-shrink-0 border-r border-slate-200 bg-white xl:block">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <Image src="/logo.svg" alt="SafeGuardian" width={40} height={40} className="h-10 w-10" />
          <div>
            <p className="text-sm font-semibold text-slate-900">SafeGuardian AI</p>
            <p className="text-xs text-slate-500">Console IA illimitée</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-4 py-6">
          {navigation.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-4 pb-6">
          <LogoutButton variant="secondary" className="w-full">
            Se déconnecter
          </LogoutButton>
        </div>
      </aside>
      <main className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Centre de contrôle IA</h1>
            <p className="text-sm text-slate-500">
              Supervisez et automatisez les réponses clients SafeGuardian.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LogoutButton variant="secondary">Déconnexion</LogoutButton>
          </div>
        </header>
        <div className="px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
