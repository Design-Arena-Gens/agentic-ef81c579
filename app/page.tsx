import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { readSession } from '@/lib/auth/session';

export default function HomePage() {
  const session = readSession();
  if (session.accessToken) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="mx-auto w-full max-w-xl">
        <LoginForm />
        <p className="mt-6 text-center text-sm text-slate-600">
          Entrez vos identifiants SafeGuardian pour piloter l’agent IA en direct.
        </p>
      </div>
    </div>
  );
}
