import { requireAuth } from '@/lib/auth';
import { getDashboardMatches, deleteMatchAction } from '@/app/actions/match';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { logoutAction } from '@/app/actions/auth';
import Link from 'next/link';
import { DeleteMatchButton } from '@/components/DeleteMatchButton';

export default async function DashboardPage() {
  await requireAuth();
  const { matches, error } = await getDashboardMatches();

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 sticky top-0 z-10 shadow-sm border-b border-gray-800">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-base font-medium text-white">SundayPay</h1>
            <p className="text-xs text-gray-400">Captain Dashboard</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-800 hover:text-white">
              Logout
            </Button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Create Match Button */}
        <Link href="/create-match">
          <Button size="md" className="w-full bg-gray-900 hover:bg-gray-800 text-white">
            Create New Match
          </Button>
        </Link>

        {/* Matches List */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Last 4 Weeks</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {matches && matches.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-gray-500 text-sm">
                No matches yet. Create your first match!
              </CardContent>
            </Card>
          )}

          {matches && matches.map((match) => {
            const isOpen = match.status === 'open';
            const paidPercentage = match.total_players > 0
              ? Math.round((match.paid_count / match.total_players) * 100)
              : 0;

            return (
              <Card key={match.id} className="hover:shadow-md transition-shadow border border-gray-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm font-medium text-gray-900">{formatDate(match.date)}</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(match.fee_amount)} per player
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          isOpen
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                      {/* <DeleteMatchButton action={deleteMatchAction.bind(null, match.id)} /> */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {match.paid_count} / {match.total_players}
                      </p>
                      <p className="text-xs text-gray-500">Paid</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        {formatCurrency(match.total_collected)}
                      </p>
                      <p className="text-xs text-gray-500">Collected</p>
                    </div>
                  </div>

                  {match.total_players > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-gray-900 h-1 rounded-full transition-all"
                          style={{ width: `${paidPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Link href={`/match/${match.id}/admin`}>
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">Manage</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
