'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginAction } from '@/app/actions/auth';
import { useToast } from '@/components/ui/toast';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
        showToast(result.error, 'error');
      }
    });
  };

  return (
    <>
      {ToastComponent}
      <main className="min-h-screen flex items-center justify-center p-4" aria-labelledby="login-title">
        <section className="w-full max-w-md rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)] p-6">
          <header className="text-center mb-6">
            <p className="pill justify-center mx-auto mb-3">Captain Login</p>
            <h1 id="login-title" className="text-2xl font-semibold text-slate-50 mb-2">
              SundayPay
            </h1>
            <p className="text-xs text-slate-400">Log in to manage your weekly matches</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="captain@example.com"
              required
              autoComplete="email"
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="border border-rose-400/30 text-rose-100 px-4 py-3 rounded-xl text-sm bg-rose-500/5">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isPending}
            >
              Login
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-4">
            Players don&apos;t need to log in. They can just use the match link.
          </p>
        </section>
      </main>
    </>
  );
}
