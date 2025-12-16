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
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">SundayPay</h1>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Captain Login</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-6">
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
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
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Players don't need to login. Just use the match link.
          </p>
        </div>
      </div>
    </>
  );
}
