// ReviewEntry is kept as a standalone fallback route (/reviews).
// The primary review entry flow is via the My Team panel.
import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import { businessAnalystService } from '../services/businessAnalystService';
import { talentRoundService } from '../services/talentRoundService';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { BusinessAnalyst, TalentRound, Review, CreateReviewRequest } from '../types';
import { ReviewForm } from './ReviewForm';
import { formatDate } from '../utils/date';
import { User, Calendar, AlertCircle, CheckCircle, ClipboardList } from 'lucide-react';
import { cn } from '../utils/cn';

export function ReviewEntry() {
  const [activeRounds, setActiveRounds] = useState<TalentRound[]>([]);
  const [selectedRound, setSelectedRound] = useState<TalentRound | null>(null);
  const [businessAnalysts, setBusinessAnalysts] = useState<BusinessAnalyst[]>([]);
  const [selectedBA, setSelectedBA] = useState<BusinessAnalyst | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { currentUser, isPeople, isManager, isIndividual } = useCurrentUser();

  useEffect(() => { loadData(); }, [currentUser]);

  useEffect(() => {
    if (selectedRound && selectedBA) {
      setExistingReview(reviewService.getByBAAndRound(selectedBA.id, selectedRound.id));
      setShowForm(true);
    }
  }, [selectedRound, selectedBA]);

  const loadData = () => {
    const rounds = talentRoundService.getActive();
    setActiveRounds(rounds);
    if (rounds.length === 1) setSelectedRound(rounds[0]);

    if (!currentUser) { setBusinessAnalysts([]); return; }
    if (isPeople) {
      setBusinessAnalysts(businessAnalystService.getAll().filter(ba => ba.isActive));
    } else if (isManager) {
      setBusinessAnalysts(businessAnalystService.getReportingTree(currentUser.businessAnalystId));
    } else {
      const self = businessAnalystService.getById(currentUser.businessAnalystId);
      setBusinessAnalysts(self ? [self] : []);
    }
  };

  const handleSubmit = (data: CreateReviewRequest) => {
    try {
      if (existingReview) {
        reviewService.update(existingReview.id, data);
      } else {
        reviewService.create(data);
      }
      setExistingReview(reviewService.getByBAAndRound(selectedBA!.id, selectedRound!.id));
      setShowForm(false);
      setSelectedBA(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const getStatus = (ba: BusinessAnalyst) => {
    if (!selectedRound) return null;
    const r = reviewService.getByBAAndRound(ba.id, selectedRound.id);
    return r?.isComplete ? 'completed' : r ? 'draft' : 'pending';
  };

  if (activeRounds.length === 0) {
    return (
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-hippo-dark-text">No active rounds</h3>
        <p className="mt-2 text-sm text-hippo-dark-text/60">A round must be active before reviews can be entered.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
        <h1 className="text-3xl font-semibold text-hippo-dark-text">Conversations</h1>
        <p className="mt-2 text-hippo-dark-text/70">Enter TT reviews for your team</p>
      </div>

      {activeRounds.length > 1 && (
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select round</label>
          <select
            value={selectedRound?.id || ''}
            onChange={(e) => { setSelectedRound(activeRounds.find(r => r.id === e.target.value) || null); setSelectedBA(null); setShowForm(false); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Choose a round...</option>
            {activeRounds.map(r => <option key={r.id} value={r.id}>{r.name} — Due {formatDate(r.deadline)}</option>)}
          </select>
        </div>
      )}

      {selectedRound && (
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{selectedRound.name}</h3>
            <span className="text-sm text-gray-500">Due {formatDate(selectedRound.deadline)}</span>
          </div>
          <div className="p-6 grid gap-3">
            {businessAnalysts.map(ba => {
              const status = getStatus(ba);
              return (
                <div
                  key={ba.id}
                  onClick={() => setSelectedBA(ba)}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                    status === 'completed' ? 'border-green-200 bg-green-50' :
                    status === 'draft' ? 'border-yellow-200 bg-yellow-50' :
                    'border-gray-200 bg-white',
                    selectedBA?.id === ba.id && 'ring-2 ring-blue-500'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{ba.firstName} {ba.lastName}</div>
                      <div className="text-sm text-gray-500">{ba.level}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {status === 'completed' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                     status === 'draft' ? <ClipboardList className="h-4 w-4 text-yellow-600" /> :
                     <AlertCircle className="h-4 w-4 text-gray-400" />}
                    <span className="capitalize">{status || 'Pending'}</span>
                  </div>
                </div>
              );
            })}
            {businessAnalysts.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">No team members found.</div>
            )}
          </div>
        </div>
      )}

      {showForm && selectedBA && selectedRound && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <ReviewForm
              ba={selectedBA}
              round={selectedRound}
              existingReview={existingReview}
              readOnly={isIndividual}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setSelectedBA(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
