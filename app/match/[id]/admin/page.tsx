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
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 sticky top-0 z-10 shadow-sm border-b border-gray-800">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-800 hover:text-white">
                ← Back
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-medium">Match Admin</h1>
            </div>
          </div>
          <p className="text-xs opacity-70">{formatDate(match.date)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Match Status Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Match Status</CardTitle>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  isOpen
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {paidCount} / {totalPlayers}
                </p>
                <p className="text-xs text-gray-500">Paid</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">
                  {formatCurrency(totalCollected)}
                </p>
                <p className="text-xs text-gray-500">Collected</p>
              </div>
            </div>

            {/* Progress Bar */}
            {totalPlayers > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-gray-900 h-1 rounded-full transition-all"
                    style={{
                      width: `${Math.round((paidCount / totalPlayers) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
              <p>Fee per player: <span className="font-semibold">{formatCurrency(match.fee_amount)}</span></p>
              <p>UPI ID: <span className="font-mono text-xs">{match.upi_id}</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Share Link Card */}
        <Card>
          <CardHeader>
            <CardTitle>Share Match Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Match Link:</p>
              <p className="text-sm font-mono break-all text-gray-700">{matchLink}</p>
            </div>

            <CopyLinkButton link={matchLink} />

            {match.share_message && (
              <>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">WhatsApp Message:</p>
                  <pre className="text-sm whitespace-pre-wrap font-sans text-gray-700">
                    {match.share_message}
                  </pre>
                </div>
                <CopyMessageButton message={match.share_message} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Players List */}
        <Card>
          <CardHeader>
            <CardTitle>Players ({totalPlayers})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players && players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{player.player_name}</p>
                    <p className="text-xs text-gray-500">
                      Joined: {new Date(player.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.paid ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                        ✓ Paid
                      </span>
                    ) : (
                      <>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                          Pending
                        </span>
                        <MarkPaidButton playerId={player.id} matchId={match.id} />
                      </>
                    )}
                  </div>
                </div>
              ))}
              {(!players || players.length === 0) && (
                <p className="text-center text-gray-500 py-4">
                  No players yet. Share the match link!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {isOpen && (
          <Card>
            <CardContent className="py-4">
              <CloseMatchButton matchId={match.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default MatchAdminPage;
