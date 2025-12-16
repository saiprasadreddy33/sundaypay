'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createMatchAction } from '@/app/actions/match';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { getNextSunday } from '@/lib/utils';
import Link from 'next/link';

interface FeeItem {
  title: string;
  amount: string;
}

export default function CreateMatchPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast, ToastComponent } = useToast();

  // Form state
  const [date, setDate] = useState(getNextSunday());
  const [upiId, setUpiId] = useState('');
  const [reminderDays, setReminderDays] = useState('2');

  // Fee breakdown mode
  const [useDetailed, setUseDetailed] = useState(true);
  const [playerCount, setPlayerCount] = useState('');
  const [feeItems, setFeeItems] = useState<FeeItem[]>([
    { title: '', amount: '' }
  ]);
  const [manualAmount, setManualAmount] = useState('');

  const addFeeItem = () => {
    setFeeItems([...feeItems, { title: '', amount: '' }]);
  };

  const removeFeeItem = (index: number) => {
    setFeeItems(feeItems.filter((_, i) => i !== index));
  };

  const updateFeeItem = (index: number, field: 'title' | 'amount', value: string) => {
    const updated = [...feeItems];
    updated[index][field] = value;
    setFeeItems(updated);
  };

  const calculatePerHeadFee = (): number => {
    if (!useDetailed) {
      return parseFloat(manualAmount) || 0;
    }

    const playerCountNum = parseInt(playerCount);
    if (!playerCountNum || playerCountNum === 0) return 0;

    const totalCost = feeItems.reduce((sum, item) => {
      const amount = parseFloat(item.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return Math.ceil(totalCost / playerCountNum);
  };

  const perHeadFee = calculatePerHeadFee();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!upiId || !date) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (useDetailed && (!playerCount || parseInt(playerCount) === 0)) {
      showToast('Please enter number of players', 'error');
      return;
    }

    if (!useDetailed && (!manualAmount || parseFloat(manualAmount) === 0)) {
      showToast('Please enter match fee', 'error');
      return;
    }

    if (perHeadFee === 0) {
      showToast('Match fee must be greater than 0', 'error');
      return;
    }

    const data: any = {
      date,
      fee_amount: perHeadFee,
      upi_id: upiId,
      reminder_after_days: parseInt(reminderDays),
    };

    if (useDetailed) {
      data.fee_breakdown = {
        player_count: parseInt(playerCount),
        items: feeItems
          .filter(item => item.title && item.amount)
          .map(item => ({
            title: item.title,
            amount: parseFloat(item.amount),
          })),
        is_detailed: true,
      };
    }

    startTransition(async () => {
      const result = await createMatchAction(data);
      if (result.error) {
        showToast(result.error, 'error');
      } else if (result.success && result.matchId) {
        showToast('Match created successfully!', 'success');
        router.push(`/match/${result.matchId}/admin`);
      }
    });
  };

  return (
    <>
      {ToastComponent}
      <div className="min-h-screen pb-20">
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#050914]/80 border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Setup</p>
              <h1 className="text-xl font-semibold text-slate-50">Create match</h1>
            </div>
          </div>
        </header>

        <main
          className="max-w-4xl mx-auto p-4"
          aria-label="Create a new match and calculate fees"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)] p-5">
              <Input
                type="date"
                label="Match Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)] p-5">
              <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wide">
                Fee Calculation Mode
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={useDetailed ? 'primary' : 'outline'}
                  onClick={() => setUseDetailed(true)}
                  className="flex-1"
                >
                  Detailed Breakdown
                </Button>
                <Button
                  type="button"
                  variant={!useDetailed ? 'primary' : 'outline'}
                  onClick={() => setUseDetailed(false)}
                  className="flex-1"
                >
                  Enter Total
                </Button>
              </div>
            </div>

            {useDetailed && (
              <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)] p-5 space-y-4">
                <Input
                  type="number"
                  label="Number of Players"
                  placeholder="e.g., 16"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(e.target.value)}
                  required
                  min="1"
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Cost Items
                  </label>
                  <div className="space-y-3">
                    {feeItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="e.g., Ground fee"
                          value={item.title}
                          onChange={(e) => updateFeeItem(index, 'title', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateFeeItem(index, 'amount', e.target.value)}
                          className="w-32"
                        />
                        {feeItems.length > 1 && (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeFeeItem(index)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeeItem}
                    className="mt-3 w-full"
                  >
                    + Add Item
                  </Button>
                </div>

                {/* Calculated Fee Display */}
                {playerCount && parseInt(playerCount) > 0 && (
                  <div className="border border-cyan-400/20 bg-cyan-500/5 rounded-xl p-4">
                    <p className="text-sm text-slate-300 mb-1">Match fee per head</p>
                    <p className="text-3xl font-bold text-cyan-100">
                      ₹{perHeadFee}
                    </p>
                    {feeItems.some(item => item.title && item.amount) && (
                      <div className="mt-3 pt-3 border-t border-white/10 text-sm space-y-1">
                        {feeItems
                          .filter(item => item.title && item.amount)
                          .map((item, idx) => (
                            <div key={idx} className="flex justify-between text-slate-200/80">
                              <span>{item.title}:</span>
                              <span className="font-semibold">₹{item.amount}</span>
                            </div>
                          ))}
                        <div className="flex justify-between pt-2 border-t border-white/10 font-semibold text-slate-50">
                          <span>Total</span>
                          <span>
                            ₹
                            {feeItems.reduce(
                              (sum, item) => sum + (parseFloat(item.amount) || 0),
                              0
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!useDetailed && (
              <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)] p-5 space-y-4">
                <Input
                  type="number"
                  label="Match Fee Per Player"
                  placeholder="e.g., 350"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>
            )}

            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)] p-5">
              <Input
                type="text"
                label="Your UPI ID"
                placeholder="e.g., captain@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
              <p className="text-xs text-slate-400 mt-2">
                Players will pay to this UPI ID
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)] p-5">
              <Input
                type="number"
                label="Send Reminder After (days)"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                required
                min="0"
                max="14"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isPending}
              disabled={perHeadFee === 0}
            >
              Create Match Link
            </Button>
          </form>
        </main>
      </div>
    </>
  );
}
