import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { updateProfileAction, updatePasswordAction } from '@/app/actions/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default async function ProfilePage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('captain_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const defaultName = profile?.display_name || user.email?.split('@')[0] || 'Captain';
  const defaultTeam = profile?.team_name || '';

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#050914]/80 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Settings</p>
            <h1 className="text-lg font-semibold text-slate-50">Captain Profile</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              ← Back to dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main
        className="max-w-3xl mx-auto px-4 pt-8"
        aria-label="Edit captain profile"
      >
        <div className="space-y-6">
          <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
            <CardHeader>
              <CardTitle>Edit your details</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateProfileAction} className="space-y-5">
                <Input
                  name="display_name"
                  label="Captain name"
                  defaultValue={defaultName}
                  required
                />
                <Input
                  name="team_name"
                  label="Team name"
                  defaultValue={defaultTeam}
                  placeholder="e.g., Sunday Warriors"
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="md">
                    Save profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
            <CardHeader>
              <CardTitle>Update password</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updatePasswordAction} className="space-y-5">
                <Input
                  type="password"
                  name="password"
                  label="New password"
                  placeholder="Enter a new password"
                  required
                  autoComplete="new-password"
                />
                <Input
                  type="password"
                  name="confirm_password"
                  label="Confirm new password"
                  placeholder="Re-enter new password"
                  required
                  autoComplete="new-password"
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="md" variant="primary">
                    Update password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


