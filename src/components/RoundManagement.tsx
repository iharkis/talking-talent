import { useState, useEffect } from 'react';
import { talentRoundService } from '../services/talentRoundService';
import { TalentRound, RoundStatus, CreateRoundRequest, RoundSummary } from '../types';
import { formatDate, formatDateTime, formatDateForInput, getDaysUntilDeadline, isOverdue } from '../utils/date';
import { cn } from '../utils/cn';
import { Plus, Calendar, Play, Check, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

export function RoundManagement() {
  const [rounds, setRounds] = useState<TalentRound[]>([]);
  const [roundSummaries, setRoundSummaries] = useState<Record<string, RoundSummary>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingRound, setEditingRound] = useState<TalentRound | null>(null);

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = () => {
    const allRounds = talentRoundService.getAll();
    setRounds(allRounds);

    const summaries: Record<string, RoundSummary> = {};
    allRounds.forEach(round => {
      if (round.status !== RoundStatus.DRAFT) {
        summaries[round.id] = talentRoundService.getRoundSummary(round.id);
      }
    });
    setRoundSummaries(summaries);
  };

  const handleCreateOrUpdate = (data: CreateRoundRequest) => {
    try {
      if (editingRound) {
        talentRoundService.update(editingRound.id, data);
      } else {
        talentRoundService.create(data);
      }
      loadRounds();
      setShowForm(false);
      setEditingRound(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleActivate = (id: string) => {
    try {
      talentRoundService.activate(id);
      loadRounds();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to activate round');
    }
  };

  const handleComplete = (id: string) => {
    if (confirm('Are you sure you want to complete this round? This action cannot be undone.')) {
      try {
        talentRoundService.complete(id);
        loadRounds();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to complete round');
      }
    }
  };

  const getStatusIcon = (status: RoundStatus) => {
    switch (status) {
      case RoundStatus.DRAFT: return Clock;
      case RoundStatus.ACTIVE: return Play;
      case RoundStatus.COMPLETED: return Check;
    }
  };

  const getStatusColor = (status: RoundStatus) => {
    switch (status) {
      case RoundStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case RoundStatus.ACTIVE: return 'bg-blue-100 text-blue-800';
      case RoundStatus.COMPLETED: return 'bg-green-100 text-green-800';
    }
  };

  const getDeadlineStatus = (deadline: Date, status: RoundStatus) => {
    if (status === RoundStatus.COMPLETED) return null;
    
    const daysRemaining = getDaysUntilDeadline(deadline);
    if (daysRemaining < 0) {
      return { text: `${Math.abs(daysRemaining)} days overdue`, color: 'text-red-600', icon: AlertTriangle };
    } else if (daysRemaining <= 3) {
      return { text: `${daysRemaining} days left`, color: 'text-orange-600', icon: AlertTriangle };
    } else if (daysRemaining <= 7) {
      return { text: `${daysRemaining} days left`, color: 'text-yellow-600', icon: Clock };
    }
    return { text: `${daysRemaining} days left`, color: 'text-green-600', icon: Clock };
  };

  return (
    <div className="space-y-6">
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-hippo-dark-text">Talent Rounds</h1>
            <p className="mt-2 text-hippo-dark-text/70">
              Manage quarterly review rounds and track progress
            </p>
          </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-hippo flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Round
        </button>
        </div>
      </div>

      <div className="grid gap-6">
        {rounds.length === 0 ? (
          <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-hippo-dark-text">No talent rounds</h3>
            <p className="mt-1 text-sm text-hippo-dark-text/60">
              Get started by creating your first talent round.
            </p>
          </div>
        ) : (
          rounds.map(round => {
            const StatusIcon = getStatusIcon(round.status);
            const deadlineStatus = getDeadlineStatus(round.deadline, round.status);
            const summary = roundSummaries[round.id];

            return (
              <div key={round.id} className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {round.name}
                        </h3>
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(round.status)
                        )}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {round.status}
                        </span>
                        {deadlineStatus && (
                          <span className={cn(
                            'ml-2 inline-flex items-center text-xs font-medium',
                            deadlineStatus.color
                          )}>
                            <deadlineStatus.icon className="w-3 h-3 mr-1" />
                            {deadlineStatus.text}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Period:</span>
                          <div>{round.quarter} {round.year}</div>
                        </div>
                        <div>
                          <span className="font-medium">Deadline:</span>
                          <div>{formatDate(round.deadline)}</div>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <div>{formatDateTime(round.createdAt)}</div>
                        </div>
                        {round.completedAt && (
                          <div>
                            <span className="font-medium">Completed:</span>
                            <div>{formatDateTime(round.completedAt)}</div>
                          </div>
                        )}
                      </div>

                      {round.description && (
                        <p className="mt-3 text-sm text-gray-600">{round.description}</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {round.status === RoundStatus.DRAFT && (
                        <>
                          <button
                            onClick={() => {
                              setEditingRound(round);
                              setShowForm(true);
                            }}
                            className="text-gray-600 hover:text-gray-900 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleActivate(round.id)}
                            className="btn-hippo-cta text-sm"
                          >
                            Activate
                          </button>
                        </>
                      )}
                      
                      {round.status === RoundStatus.ACTIVE && summary && (
                        <button
                          onClick={() => handleComplete(round.id)}
                          disabled={summary.completionPercentage < 100}
                          className={cn(
                            'px-3 py-1 text-sm rounded-lg',
                            summary.completionPercentage >= 100
                              ? 'btn-hippo-cta'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed px-3 py-1 text-sm rounded-lg'
                          )}
                        >
                          Complete Round
                        </button>
                      )}
                    </div>
                  </div>

                  {summary && (
                    <div className="mt-6 border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Progress Summary
                        </h4>
                        <span className="text-sm font-medium text-gray-900">
                          {summary.completionPercentage}% Complete
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
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

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">{summary.totalBAs}</div>
                          <div className="text-gray-600">Total BAs</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-semibold text-green-600">{summary.completedReviews}</div>
                          <div className="text-gray-600">Completed</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-lg font-semibold text-orange-600">{summary.pendingReviews}</div>
                          <div className="text-gray-600">Pending</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <RoundForm
          round={editingRound}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditingRound(null);
          }}
        />
      )}
    </div>
  );
}

interface RoundFormProps {
  round: TalentRound | null;
  onSubmit: (data: CreateRoundRequest) => void;
  onCancel: () => void;
}

function RoundForm({ round, onSubmit, onCancel }: RoundFormProps) {
  const [formData, setFormData] = useState<CreateRoundRequest>({
    name: round?.name || '',
    quarter: round?.quarter || 'Q1',
    year: round?.year || new Date().getFullYear(),
    deadline: round?.deadline || new Date(),
    description: round?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {round ? 'Edit Talent Round' : 'Create Talent Round'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Round Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Q1 2024 Talking Talent"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quarter</label>
              <select
                value={formData.quarter}
                onChange={(e) => setFormData({...formData, quarter: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {quarters.map(quarter => (
                  <option key={quarter} value={quarter}>{quarter}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deadline</label>
            <input
              type="date"
              required
              value={formatDateForInput(formData.deadline)}
              onChange={(e) => setFormData({...formData, deadline: new Date(e.target.value)})}
              min={formatDateForInput(new Date())}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Today: {formatDate(new Date())}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              placeholder="Additional details about this round..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-hippo-dark-text bg-hippo-light-gray/50 hover:bg-hippo-light-gray rounded-hippo border border-hippo-light-gray transition-all duration-400"
          >
            Cancel
          </button>
          <button
            onClick={(e) => handleSubmit(e as any)}
            className="btn-hippo-cta text-sm"
          >
            {round ? 'Update' : 'Create'} Round
          </button>
        </div>
      </div>
    </div>
  );
}