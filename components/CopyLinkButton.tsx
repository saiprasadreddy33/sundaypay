'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
  };

  return (
    <Button variant="secondary" className="w-full" onClick={handleCopy}>
      {copied ? '✓ Copied' : '📋 Copy Link'}
    </Button>
  );
}
