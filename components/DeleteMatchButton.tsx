'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function DeleteMatchButton({ action }: { action: () => Promise<any> }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Delete this match? This will remove all players linked to it.')) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await action();
      if (result?.success) {
        // Refresh the page to show updated dashboard
        router.refresh();
      } else if (result?.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete match');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      onClick={handleClick}
      disabled={submitting}
      aria-label="Delete match"
    >
      Delete
    </Button>
  );
}
