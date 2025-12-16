'use client';

import { Button } from './ui/button';

export function CopyMessageButton({ message }: { message: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    alert('Message copied! Ready to share on WhatsApp');
  };

  return (
    <Button variant="primary" className="w-full" onClick={handleCopy}>
      📱 Copy WhatsApp Message
    </Button>
  );
}
