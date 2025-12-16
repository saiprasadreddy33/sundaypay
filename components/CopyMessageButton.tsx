'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export function CopyMessageButton({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
  };

  return (
    <Button variant="primary" className="w-full" onClick={handleCopy}>
      {copied ? '✓ Copied' : '📱 Copy WhatsApp Message'}
    </Button>
  );
}
