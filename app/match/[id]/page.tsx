'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { getMatchDetails, joinMatchAction, markSelfPaidAction } from '@/app/actions/player';
import { formatDate, formatCurrency } from '@/lib/utils';
import { generateUPILink } from '@/lib/upi';
import { Match, MatchPlayer } from '@/lib/types';
import { DeveloperContactModal } from '@/components/DeveloperContactModal';

type PlayerState = 'initial' | 'joining' | 'joined' | 'paying' | 'confirming' | 'paid';

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showToast, ToastComponent } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<MatchPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [state, setState] = useState<PlayerState>('initial');
  const [playerName, setPlayerName] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState('');

  useEffect(() => {
    loadMatchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMatchData = async () => {
    setLoading(true);
    const result = await getMatchDetails(id);

    if (result.error || !result.match) {
      setError(result.error || 'Match not found');
      setLoading(false);
      return;
    }

    setMatch(result.match);
    setPlayers(result.players || []);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!match || match.status !== 'open') {
      showToast('This match is closed. You cannot join now.', 'error');
      return;
    }
    if (!playerName.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }

    setState('joining');
    const result = await joinMatchAction({
      matchId: id,
      playerName: playerName.trim(),
    });

    if (result.error) {
      showToast(result.error, 'error');
      setState('initial');
    } else if (result.success && result.playerId) {
      setCurrentPlayerId(result.playerId);
      setState('joined');
      showToast('Joined successfully!', 'success');
      loadMatchData();
    }
  };

  const handlePayNow = () => {
    if (!match) return;

    // Check if device supports UPI (mobile detection)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // On mobile, try to open UPI app silently
      const upiLink = generateUPILink({
        upiId: match.upi_id,
        name: 'Cricket Match',
        amount: match.fee_amount,
        transactionNote: `Match fee - ${formatDate(match.date)}`,
      });

      // Use a hidden iframe to avoid triggering browser errors
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = upiLink;
      document.body.appendChild(iframe);

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }

    // Always show manual payment UI after attempting UPI
    setState('confirming');
  };

  const handleMarkPaid = async () => {
    const result = await markSelfPaidAction({
      playerId: currentPlayerId,
      matchId: id,
    });

    if (result.error) {
      showToast(result.error, 'error');
    } else {
      setState('paid');
      showToast('Payment marked! Thank you!', 'success');
      loadMatchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏏</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-danger">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match) return null;

  const paidCount = players.filter(p => p.paid).length;
  const totalPlayers = players.length;
  const developerPhone = process.env.NEXT_PUBLIC_DEVELOPER_PHONE;
  const isOpen = match.status === 'open';

  return (
    <>
      {ToastComponent}
      <div className="min-h-screen pb-20">
        <header className="bg-gradient-to-r from-cyan-500/20 via-emerald-500/10 to-transparent text-white px-4 py-5 sm:p-6 border-b border-white/10 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <p className="pill justify-center mx-auto">Player View</p>
            <h1 className="text-lg font-semibold">Match Details</h1>
            <h2 className="text-2xl font-bold text-slate-50">Cricket Match</h2>
            <p className="text-lg text-slate-200/85">{formatDate(match.date)}</p>
            {!isOpen && (
              <p className="text-xs font-medium text-amber-200/90">
                This match is closed. You can only view the details.
              </p>
            )}
          </div>
        </header>

        <main
          className="max-w-2xl mx-auto px-4 py-5 space-y-4"
          aria-label="Player match details and actions"
        >
          <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
            <CardHeader>
              <CardTitle>Match Details</CardTitle>
            </CardHeader>
            <CardContent>
              {match.fee_breakdown?.is_detailed && match.fee_breakdown.items.length > 0 ? (
                <div className="space-y-2">
                  {match.fee_breakdown.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-slate-200/85">
                      <span>{item.title}:</span>
                      <span className="font-semibold text-slate-50">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/10 flex justify-between font-semibold text-lg text-cyan-100">
                    <span>Match fee per head:</span>
                    <span className="text-cyan-100">{formatCurrency(match.fee_amount)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-3xl font-bold text-cyan-100">{formatCurrency(match.fee_amount)}</p>
                  <p className="text-sm text-slate-400">per player</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle>Players</CardTitle>
                <span className="text-sm font-normal text-slate-400">
                  {paidCount} / {totalPlayers} paid
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <span className="font-medium w-full sm:w-auto">{player.player_name}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium w-full sm:w-auto text-center ${
                        player.paid
                          ? 'bg-success/20 text-success'
                          : 'bg-warning/20 text-warning'
                      }`}
                    >
                      {player.paid ? '✓ Paid' : 'Pending'}
                    </span>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-center text-slate-400 py-4">
                    No players yet. Be the first!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {isOpen && state === 'initial' && (
            <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
              <CardHeader>
                <CardTitle>Join Match</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">Enter your name to join this match</p>
                <Input
                  placeholder="Your Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                />
                <Button size="lg" className="w-full" onClick={handleJoin}>
                  Join Match
                </Button>
              </CardContent>
            </Card>
          )}

          {isOpen && state === 'joined' && (
            <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center bg-emerald-500/10 border border-emerald-400/25 rounded-lg p-4">
                  <p className="text-success font-semibold mb-2">✓ Joined Successfully!</p>
                  <p className="text-sm text-slate-200/85">Welcome, {playerName}!</p>
                </div>
                <p className="text-slate-300">
                  Pay <span className="font-bold text-cyan-100">{formatCurrency(match.fee_amount)}</span> to proceed
                </p>
                <Button size="lg" className="w-full" onClick={handlePayNow}>
                  Pay Now via UPI
                </Button>
              </CardContent>
            </Card>
          )}

          {isOpen && state === 'confirming' && (
            <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-cyan-500/10 border border-cyan-400/25 rounded-lg p-4">
                  <p className="text-sm font-semibold text-cyan-100 mb-3">Send payment to:</p>
                  <div className="bg-white/10 p-3 rounded border border-white/10 mb-3">
                    <p className="text-xs text-slate-300">UPI ID</p>
                    <p className="text-lg font-mono font-bold text-slate-50">{match.upi_id}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/10 p-3 rounded border border-white/10">
                      <p className="text-xs text-slate-300">Amount</p>
                      <p className="text-lg font-bold text-cyan-100">{formatCurrency(match.fee_amount)}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded border border-white/10">
                      <p className="text-xs text-slate-300">For</p>
                      <p className="text-sm font-semibold text-slate-50">Cricket Match</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <p className="text-sm text-slate-300">After sending the payment:</p>
                  <Button
                    size="lg"
                    className="w-full"
                    variant="primary"
                    onClick={handleMarkPaid}
                  >
                    ✓ Payment Done - Confirm
                  </Button>
                  <Button
                    size="lg"
                    className="w-full"
                    variant="outline"
                    onClick={handlePayNow}
                  >
                    Try UPI App Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {state === 'paid' && (
            <Card className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)]">
              <CardHeader>
                <CardTitle>All Done!</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-xl font-semibold text-success mb-2">Payment Confirmed!</p>
                <p className="text-slate-200/85">Thank you, {playerName}!</p>
                <p className="text-sm text-slate-400 mt-4">
                  See you on {formatDate(match.date)}
                </p>
              </CardContent>
            </Card>
          )}

          <DeveloperContactModal phone={developerPhone} />
        </main>
      </div>
    </>
  );
}
