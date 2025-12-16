import { requireAuth } from '@/lib/auth';
import { getMatchDetailsForAdmin } from '@/app/actions/player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import { CopyMessageButton } from '@/components/CopyMessageButton';
import { MarkPaidButton } from '@/components/MarkPaidButton';
import { CloseMatchButton } from '@/components/CloseMatchButton';

async function MatchAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const { match, players, error } = await getMatchDetailsForAdmin(id);
  // const developerPhone = process.env.NEXT_PUBLIC_DEVELOPER_PHONE;

  if (error || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-danger">{error || 'Match not found'}</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paidCount = players?.filter(p => p.paid).length || 0;
  const totalPlayers = players?.length || 0;
  const totalCollected = paidCount * match.fee_amount;
  const isOpen = match.status === 'open';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const matchLink = `${siteUrl}/match/${match.id}`;

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#050914]/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Admin</p>
              <h1 className="text-base font-semibold text-slate-50">Match Admin</h1>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 whitespace-nowrap">{formatDate(match.date)}</p>
        </div>
      </header>

      <main
        className="max-w-4xl mx-auto px-4 py-6 space-y-4"
        aria-label="Match administration view"
      >
        <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Match Status</CardTitle>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  isOpen
                    ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/30'
                    : 'bg-white/5 text-slate-300 border border-white/10'
                }`}
              >
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between sm:block">
                <div>
                  <p className="text-lg font-semibold text-slate-50">
                    {paidCount} / {totalPlayers}
                  </p>
                  <p className="text-xs text-slate-400">Paid</p>
                </div>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-lg font-semibold text-emerald-200">
                  {formatCurrency(totalCollected)}
                </p>
                <p className="text-xs text-slate-400">Collected</p>
              </div>
            </div>

            {/* Progress Bar */}
            {totalPlayers > 0 && (
              <div className="mt-4">
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                    style={{
                      width: `${Math.round((paidCount / totalPlayers) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/10 text-sm text-slate-200/85 space-y-1">
              <p>Fee per player: <span className="font-semibold">{formatCurrency(match.fee_amount)}</span></p>
              <p>UPI ID: <span className="font-mono text-xs">{match.upi_id}</span></p>
              {!isOpen && (
                <p className="text-xs text-amber-300/90 mt-1">
                  This match is closed. You can review payments but cannot mark new players as paid.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
          <CardHeader>
            <CardTitle>Share Match Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Match Link:</p>
              <p className="text-sm font-mono break-all text-slate-50">{matchLink}</p>
            </div>

            <CopyLinkButton link={matchLink} />

            {match.share_message && (
              <>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <p className="text-xs text-slate-400 mb-2">WhatsApp Message:</p>
                  <pre className="text-sm whitespace-pre-wrap font-sans text-slate-50">
                    {match.share_message}
                  </pre>
                </div>
                <CopyMessageButton message={match.share_message} />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
          <CardHeader>
            <CardTitle>Players ({totalPlayers})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players && players.map((player) => (
                <div
                  key={player.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="w-full sm:w-auto">
                    <p className="font-medium">{player.player_name}</p>
                    <p className="text-xs text-slate-400">
                      Joined: {new Date(player.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        player.paid ? 'bg-success/20 text-success' : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {player.paid ? '✓ Paid' : 'Pending'}
                    </span>
                    {isOpen && (
                      <MarkPaidButton
                        playerId={player.id}
                        matchId={match.id}
                        paid={player.paid}
                      />
                    )}
                  </div>
                </div>
              ))}
              {(!players || players.length === 0) && (
                <p className="text-center text-slate-400 py-4">
                  No players yet. Share the match link!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {isOpen && (
          <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
            <CardContent className="py-4 flex flex-col gap-3">
              <CloseMatchButton matchId={match.id} />
              {/* <div className="text-xs text-slate-400">
                Need help? {developerPhone ? (
                  <a className="text-cyan-200 font-semibold" href={`tel:${developerPhone}`}>
                    Call the developer ({developerPhone})
                  </a>
                ) : (
                  'Set NEXT_PUBLIC_DEVELOPER_PHONE to show the developer number.'
                )}
              </div> */}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default MatchAdminPage;
