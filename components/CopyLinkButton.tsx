'use client';

import { Button } from './ui/button';

export function CopyLinkButton({ link }: { link: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    alert('Link copied!');
  };

  return (
    <Button variant="secondary" className="w-full" onClick={handleCopy}>
      📋 Copy Link
    </Button>
  );
}
