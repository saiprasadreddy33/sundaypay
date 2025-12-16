'use client';

import { Button } from './ui/button';
import { markPlayerPaidAction } from '@/app/actions/match';

export function MarkPaidButton({ playerId, matchId }: { playerId: string; matchId: string }) {
  const handleMark = async () => {
    const result = await markPlayerPaidAction(playerId, matchId);
    if (result.error) {
      alert(result.error);
    } else {
      window.location.reload();
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleMark}>
      Mark Paid
    </Button>
  );
}
