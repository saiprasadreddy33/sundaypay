import { requireAuth } from '@/lib/auth';
import { getDashboardMatches } from '@/app/actions/match';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { logoutAction } from '@/app/actions/auth';
import Link from 'next/link';
import { DeveloperContactModal } from '@/components/DeveloperContactModal';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { matches, error } = await getDashboardMatches();

  const developerPhone = process.env.NEXT_PUBLIC_DEVELOPER_PHONE;

  const { data: profile } = await supabase
    .from('captain_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const captainName = profile?.display_name || user.email || 'Captain';
  const teamName = profile?.team_name || 'Your team';

  return (
    <div className="min-h-screen pb-20">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.08),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.08),transparent_30%)]" />

      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#050914]/80 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="pill flex-shrink-0 text-center">Captain Dashboard</div>
          </div>
          <div className="flex items-center gap-2 w-full justify-center sm:w-auto sm:flex-shrink-0 sm:justify-end">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Edit profile
              </Button>
            </Link>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="w-full sm:w-auto">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main
        className="relative max-w-5xl mx-auto px-4 pt-8 space-y-6"
        aria-label="Captain dashboard overview and matches"
      >
        <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)] p-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Welcome back, {captainName}</p>
              <h2 className="text-2xl font-semibold text-slate-50">{teamName}</h2>
            </div>
            <Link href="/create-match">
              <Button size="md" className="w-full md:w-auto">
                Create New Match
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Last 4 weeks</p>
              <h2 className="text-lg font-semibold text-slate-50">Match timeline</h2>
            </div>
            <div className="text-sm text-slate-400">Recent to older</div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-400/30 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)] text-rose-100 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {matches && matches.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-slate-400 text-sm">
                No matches yet. Create your first match!
              </CardContent>
            </Card>
          )}

          {matches && matches.map((match) => {
            const isOpen = match.status === 'open';
            const paidPercentage = match.total_players > 0
              ? Math.round((match.paid_count / match.total_players) * 100)
              : 0;

            return (
              <Card key={match.id} className="hover-lift border border-white/10 bg-white/5">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <CardTitle className="text-base">{formatDate(match.date)}</CardTitle>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatCurrency(match.fee_amount)} per player
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          isOpen
                            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}
                      >
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-50">
                        {match.paid_count} / {match.total_players}
                      </p>
                      <p className="text-xs text-slate-400">Paid</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-emerald-200">
                        {formatCurrency(match.total_collected)}
                      </p>
                      <p className="text-xs text-slate-400">Collected</p>
                    </div>
                  </div>

                  {match.total_players > 0 && (
                    <div className="space-y-2">
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                          style={{ width: `${paidPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">{paidPercentage}% collected</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-end">
                    <Link href={`/match/${match.id}/admin`} className="w-full sm:w-auto">
                      <Button size="sm" className="w-full sm:w-auto">Manage Match</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <DeveloperContactModal phone={developerPhone} />
        </div>
      </main>
    </div>
  );
}
