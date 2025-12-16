'use client';

import { Button } from './ui/button';
import { closeMatchAction } from '@/app/actions/match';

export function CloseMatchButton({ matchId }: { matchId: string }) {
  const handleClose = async () => {
    if (!confirm('Close this match? No more players can join.')) return;

    const result = await closeMatchAction(matchId);
    if (result.error) {
      alert(result.error);
    } else {
      window.location.reload();
    }
  };

  return (
    <Button variant="danger" className="w-full" onClick={handleClose}>
      Close Match
    </Button>
  );
}
