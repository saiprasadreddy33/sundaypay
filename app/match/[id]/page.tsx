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
  }, []);

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

  return (
    <>
      {ToastComponent}
      <div className="min-h-screen pb-20 bg-white">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 border-b border-gray-800">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-lg font-semibold mb-1">Match Details</h1>
            <h1 className="text-2xl font-bold mb-2">Cricket Match</h1>
            <p className="text-lg opacity-90">{formatDate(match.date)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Match Details */}
          <Card>
            <CardHeader>
              <CardTitle>Match Details</CardTitle>
            </CardHeader>
            <CardContent>
              {match.fee_breakdown?.is_detailed && match.fee_breakdown.items.length > 0 ? (
                <div className="space-y-2">
                  {match.fee_breakdown.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.title}:</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold text-lg">
                    <span>Match fee per head:</span>
                    <span className="text-primary">{formatCurrency(match.fee_amount)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{formatCurrency(match.fee_amount)}</p>
                  <p className="text-sm text-gray-500">per player</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Players List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Players</CardTitle>
                <span className="text-sm font-normal text-gray-500">
                  {paidCount} / {totalPlayers} paid
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{player.player_name}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        player.paid
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {player.paid ? '✓ Paid' : 'Pending'}
                    </span>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No players yet. Be the first!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Player Actions */}
          {state === 'initial' && (
            <Card>
              <CardHeader>
                <CardTitle>Join Match</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Enter your name to join this match</p>
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

          {state === 'joined' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center bg-success/5 border border-success rounded-lg p-4">
                  <p className="text-success font-semibold mb-2">✓ Joined Successfully!</p>
                  <p className="text-sm text-gray-600">Welcome, {playerName}!</p>
                </div>
                <p className="text-gray-600">
                  Pay <span className="font-bold text-primary">{formatCurrency(match.fee_amount)}</span> to proceed
                </p>
                <Button size="lg" className="w-full" onClick={handlePayNow}>
                  Pay Now via UPI
                </Button>
              </CardContent>
            </Card>
          )}

          {state === 'confirming' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-3">Send payment to:</p>
                  <div className="bg-white p-3 rounded border border-blue-200 mb-3">
                    <p className="text-xs text-gray-600">UPI ID</p>
                    <p className="text-lg font-mono font-bold text-gray-900">{match.upi_id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <p className="text-xs text-gray-600">Amount</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(match.fee_amount)}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <p className="text-xs text-gray-600">For</p>
                      <p className="text-sm font-semibold text-gray-900">Cricket Match</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-3">After sending the payment:</p>
                  <Button
                    size="lg"
                    className="w-full"
                    variant="primary"
                    onClick={handleMarkPaid}
                  >
                    ✓ Payment Done - Confirm
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  variant="outline"
                  onClick={handlePayNow}
                >
                  Try UPI App Again
                </Button>
              </CardContent>
            </Card>
          )}

          {state === 'paid' && (
            <Card>
              <CardHeader>
                <CardTitle>All Done!</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-xl font-semibold text-success mb-2">Payment Confirmed!</p>
                <p className="text-gray-600">Thank you, {playerName}!</p>
                <p className="text-sm text-gray-500 mt-4">
                  See you on {formatDate(match.date)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
