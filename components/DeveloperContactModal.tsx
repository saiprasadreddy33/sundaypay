'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Modal } from './ui/modal';

export function DeveloperContactModal({ phone }: { phone?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);

  if (!phone) {
    return (
      <div className="text-xs text-slate-500 pt-2 pb-8">
        Set NEXT_PUBLIC_DEVELOPER_PHONE to show the developer number.
      </div>
    );
  }

  return (
    <>
      <div className="text-xs text-slate-500 pt-2 pb-8">
        Need help?{' '}
        <button
          onClick={() => {
            setIsOpen(true);
            setRevealed(false);
          }}
          className="text-cyan-200 font-semibold hover:text-cyan-100 transition-colors"
        >
          Click here
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
        <div className="space-y-6 text-center">
          <div>
            <h3 className="text-xl font-semibold text-slate-50 mb-2">Contact Developer</h3>
            <p className="text-sm text-slate-200/85">Click to reveal the phone number</p>
          </div>

          {!revealed ? (
            <Button
              size="lg"
              onClick={() => setRevealed(true)}
              className="w-full"
            >
              Reveal Phone Number
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-cyan-500/20 border border-cyan-400/25 rounded-lg p-4">
                <p className="text-xs text-slate-300 mb-2">Developer Phone</p>
                <a
                  href={`tel:${phone}`}
                  className="text-2xl font-bold text-cyan-100 hover:text-cyan-50 transition-colors font-mono"
                >
                  {phone}
                </a>
              </div>
              <Button
                size="md"
                onClick={() => window.location.href = `tel:${phone}`}
                className="w-full"
              >
                📞 Call Now
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
