'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { markPlayerPaidAction, markPlayerPendingAction } from '@/app/actions/match';

interface MarkPaidButtonProps {
  playerId: string;
  matchId: string;
  paid: boolean;
}

export function MarkPaidButton({ playerId, matchId, paid }: MarkPaidButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (paid) {
      const confirmReset = window.confirm(
        'Mark this player as pending again? Use this only if the payment was made by mistake.'
      );
      if (!confirmReset) return;
    }

    setLoading(true);
    try {
      const result = paid
        ? await markPlayerPendingAction(playerId, matchId)
        : await markPlayerPaidAction(playerId, matchId);

      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update player payment status:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={paid ? 'outline' : 'primary'}
      size="sm"
      onClick={handleClick}
      loading={loading}
    >
      {paid ? 'Mark Pending' : 'Mark Paid'}
    </Button>
  );
}
