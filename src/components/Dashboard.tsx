import { useState, useEffect } from 'react';
import { talentRoundService } from '../services/talentRoundService';
import { businessAnalystService } from '../services/businessAnalystService';
import { TalentRound, RoundSummary } from '../types';
import { formatDate, getDaysUntilDeadline, isOverdue } from '../utils/date';
import { cn } from '../utils/cn';
import { Calendar, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const [activeRounds, setActiveRounds] = useState<TalentRound[]>([]);
  const [roundSummaries, setRoundSummaries] = useState<Record<string, RoundSummary>>({});
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [totalBAs, setTotalBAs] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const rounds = talentRoundService.getActive();
    const deadlines = talentRoundService.getUpcomingDeadlines();
    const allBAs = businessAnalystService.getAll().filter(ba => ba.isActive);
    
    setActiveRounds(rounds);
    setUpcomingDeadlines(deadlines);
    setTotalBAs(allBAs.length);

    const summaries: Record<string, RoundSummary> = {};
    rounds.forEach(round => {
      summaries[round.id] = talentRoundService.getRoundSummary(round.id);
    });
    setRoundSummaries(summaries);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-blue-600 bg-blue-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDeadlineColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return 'text-red-600 bg-red-100';
    if (daysRemaining <= 3) return 'text-orange-600 bg-orange-100';
    if (daysRemaining <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Performance management system overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalBAs}</p>
              <p className="text-sm text-gray-500">Active Business Analysts</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{activeRounds.length}</p>
              <p className="text-sm text-gray-500">Active Rounds</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(roundSummaries).reduce((sum, s) => sum + s.completedReviews, 0)}
              </p>
              <p className="text-sm text-gray-500">Completed Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{upcomingDeadlines.length}</p>
              <p className="text-sm text-gray-500">Upcoming Deadlines</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Active Rounds</h3>
          </div>
          <div className="p-6">
            {activeRounds.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active rounds</p>
            ) : (
              <div className="space-y-4">
                {activeRounds.map(round => {
                  const summary = roundSummaries[round.id];
                  if (!summary) return null;

                  return (
                    <div key={round.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{round.name}</h4>
                        <span className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          getStatusColor(summary.completionPercentage)
                        )}>
                          {summary.completionPercentage}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mb-3">
                        <span>{round.quarter} {round.year}</span>
                        <span>Due: {formatDate(round.deadline)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            'h-2 rounded-full transition-all',
                            summary.completionPercentage >= 100 ? 'bg-green-500' :
                            summary.completionPercentage >= 75 ? 'bg-blue-500' :
                            summary.completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          style={{ width: `${summary.completionPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>{summary.completedReviews} completed</span>
                        <span>{summary.pendingReviews} pending</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
          </div>
          <div className="p-6">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 5).map(item => (
                  <div key={item.roundId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.roundName}</p>
                      <p className="text-sm text-gray-500">{formatDate(item.deadline)}</p>
                    </div>
                    <div className="flex items-center">
                      {item.daysRemaining < 0 && (
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getDeadlineColor(item.daysRemaining)
                      )}>
                        {item.daysRemaining < 0 
                          ? `${Math.abs(item.daysRemaining)} days overdue`
                          : `${item.daysRemaining} days left`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}