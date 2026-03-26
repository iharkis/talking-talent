import { useState, useEffect, useCallback } from 'react';
import { talentRoundService } from '../services/talentRoundService';
import { reviewService } from '../services/reviewService';
import { businessAnalystService } from '../services/businessAnalystService';
import { BusinessAnalyst, TalentRound, Review, PromotionReadiness, TTRating } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, TrendingUp, Users, Calendar, Star } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/date';

interface PersonWithReview {
  ba: BusinessAnalyst;
  review: Review | null;
  managerName: string;
}

export function SessionView() {
  const [activeRound, setActiveRound] = useState<TalentRound | null>(null);
  const [people, setPeople] = useState<PersonWithReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterComplete, setFilterComplete] = useState<'all' | 'complete' | 'incomplete'>('all');

  useEffect(() => {
    const rounds = talentRoundService.getActive();
    const round = rounds[0] || null;
    setActiveRound(round);

    if (!round) return;

    const allBAs = businessAnalystService.getAll().filter(ba => ba.isActive);
    const reviews = reviewService.getByRound(round.id);

    const list: PersonWithReview[] = allBAs
      .sort((a, b) => `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`))
      .map(ba => {
        const manager = ba.lineManagerId ? businessAnalystService.getById(ba.lineManagerId) : null;
        return {
          ba,
          review: reviews.find(r => r.businessAnalystId === ba.id) || null,
          managerName: manager ? `${manager.firstName} ${manager.lastName}` : '—',
        };
      });

    setPeople(list);
  }, []);

  const filtered = people.filter(p => {
    if (filterComplete === 'complete') return p.review?.isComplete;
    if (filterComplete === 'incomplete') return !p.review?.isComplete;
    return true;
  });

  const current = filtered[currentIndex] || null;
  const completedCount = people.filter(p => p.review?.isComplete).length;

  const prev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const next = () => setCurrentIndex(i => Math.min(filtered.length - 1, i + 1));

  const handleSaveOutcome = (reviewId: string, ttRating: TTRating | undefined, ttFeedbackNotes: string | undefined) => {
    const updated = reviewService.updateTTOutcome(reviewId, ttRating, ttFeedbackNotes);
    if (!updated) return;
    setPeople(prev => prev.map(p =>
      p.review?.id === reviewId ? { ...p, review: updated } : p
    ));
  };

  if (!activeRound) {
    return (
      <div className="space-y-6">
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
          <h1 className="text-3xl font-semibold text-hippo-dark-text">Session View</h1>
        </div>
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-hippo-dark-text">No active round</h3>
          <p className="mt-1 text-sm text-hippo-dark-text/60">Create and activate a round to run a session.</p>
          <a href="/rounds" className="mt-4 inline-flex items-center btn-hippo text-sm">Go to Rounds</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-hippo-dark-text">Session View</h1>
            <p className="mt-1 text-hippo-dark-text/70">{activeRound.name} · Due {formatDate(activeRound.deadline)}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <div className="text-xl font-bold text-hippo-dark-text">{people.length}</div>
              <div className="text-xs text-hippo-dark-text/60">Total</div>
            </div>
            <div className="bg-green-50 rounded-lg px-4 py-2">
              <div className="text-xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-hippo-dark-text/60">Submitted</div>
            </div>
            <div className="bg-amber-50 rounded-lg px-4 py-2">
              <div className="text-xl font-bold text-amber-600">{people.length - completedCount}</div>
              <div className="text-xs text-hippo-dark-text/60">Outstanding</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mt-4 flex gap-2">
          {(['all', 'complete', 'incomplete'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilterComplete(f); setCurrentIndex(0); }}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filterComplete === f
                  ? 'bg-hippo-dark-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f === 'all' ? 'All' : f === 'complete' ? 'Submitted' : 'Outstanding'}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-500 self-center">{filtered.length} showing</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-500">No people match the current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Person list sidebar */}
          <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle overflow-hidden lg:col-span-1">
            <div className="px-4 py-3 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {filtered.length} people
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {filtered.map(({ ba, review }, i) => (
                <button
                  key={ba.id}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50',
                    currentIndex === i && 'bg-hippo-dark-blue/5 border-l-2 border-l-hippo-dark-blue'
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-hippo-dark-blue/10 flex items-center justify-center text-hippo-dark-blue text-xs font-semibold flex-shrink-0">
                    {ba.firstName[0]}{ba.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-hippo-dark-text truncate">{ba.firstName} {ba.lastName}</div>
                    <div className="text-xs text-hippo-dark-text/50">{ba.level}</div>
                  </div>
                  {review?.ttRating
                    ? <Star className="h-4 w-4 text-hippo-dark-blue flex-shrink-0" />
                    : review?.isComplete && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Main review card */}
          <div className="lg:col-span-3 space-y-4">
            {current && (
              <>
                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <span className="text-sm text-gray-500">{currentIndex + 1} of {filtered.length}</span>
                  <button
                    onClick={next}
                    disabled={currentIndex === filtered.length - 1}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <ReviewCard person={current} onSaveOutcome={handleSaveOutcome} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  person: { ba, review, managerName },
  onSaveOutcome,
}: {
  person: PersonWithReview;
  onSaveOutcome: (reviewId: string, ttRating: TTRating | undefined, ttFeedbackNotes: string | undefined) => void;
}) {
  const [ttRating, setTtRating] = useState<TTRating | undefined>(review?.ttRating);
  const [ttFeedbackNotes, setTtFeedbackNotes] = useState(review?.ttFeedbackNotes || '');

  // Sync local state when a different person is selected
  const reviewId = review?.id;
  useEffect(() => {
    setTtRating(review?.ttRating);
    setTtFeedbackNotes(review?.ttFeedbackNotes || '');
  }, [reviewId]);

  const handleRatingChange = (rating: TTRating | undefined) => {
    setTtRating(rating);
    if (review) onSaveOutcome(review.id, rating, ttFeedbackNotes || undefined);
  };

  const handleNotesBlur = () => {
    if (review) onSaveOutcome(review.id, ttRating, ttFeedbackNotes || undefined);
  };

  if (!review) {
    return (
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-8 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-400 mb-3" />
        <h3 className="font-semibold text-hippo-dark-text">{ba.firstName} {ba.lastName}</h3>
        <p className="mt-1 text-sm text-hippo-dark-text/60">{ba.level}{ba.profession ? ` · ${ba.profession}` : ''}</p>
        <p className="mt-4 text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-2 inline-block">
          No review submitted yet
        </p>
      </div>
    );
  }

  const promotionColor = review.promotionReadiness === PromotionReadiness.READY
    ? 'bg-green-100 text-green-800'
    : review.promotionReadiness === PromotionReadiness.NEAR_READY
    ? 'bg-blue-100 text-blue-800'
    : 'bg-gray-100 text-gray-700';

  const hasConcerns = review.wellbeingConcerns.hasIssues || review.performanceConcerns.hasIssues || review.retentionConcerns?.hasIssues;

  return (
    <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle overflow-hidden">
      {/* Person header */}
      <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-hippo-dark-blue text-hippo-white flex items-center justify-center font-bold text-lg">
            {ba.firstName[0]}{ba.lastName[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-hippo-dark-text">{ba.firstName} {ba.lastName}</h2>
            <p className="text-sm text-hippo-dark-text/60">
              {ba.level}{ba.profession ? ` · ${ba.profession}` : ''} · Manager: {managerName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('px-3 py-1 rounded-full text-sm font-medium', promotionColor)}>
            {review.promotionReadiness}
            {review.promotionTimeframe && ` · ${review.promotionTimeframe}`}
          </span>
          {hasConcerns && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Concerns flagged
            </span>
          )}
          {review.isComplete && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Submitted
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Concerns */}
        {(review.wellbeingConcerns.hasIssues || review.performanceConcerns.hasIssues ||
          review.developmentOpportunities.hasOpportunities || review.retentionConcerns?.hasIssues) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {review.wellbeingConcerns.hasIssues && (
              <ConcernCard label="Wellbeing" detail={review.wellbeingConcerns.details} color="red" />
            )}
            {review.performanceConcerns.hasIssues && (
              <ConcernCard label="Performance" detail={review.performanceConcerns.details} color="orange" />
            )}
            {review.developmentOpportunities.hasOpportunities && (
              <ConcernCard label="Development" detail={review.developmentOpportunities.details} color="blue" />
            )}
            {review.retentionConcerns?.hasIssues && (
              <ConcernCard label="Retention" detail={review.retentionConcerns.details} color="purple" />
            )}
          </div>
        )}

        {/* Actions */}
        {review.actions.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Action items
            </h4>
            <ul className="space-y-1">
              {review.actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 mt-0.5 flex-shrink-0">·</span>{a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {review.generalNotes && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.generalNotes}</p>
          </div>
        )}

        {!review.wellbeingConcerns.hasIssues && !review.performanceConcerns.hasIssues &&
         !review.developmentOpportunities.hasOpportunities && !review.retentionConcerns?.hasIssues &&
         review.actions.length === 0 && !review.generalNotes && (
          <p className="text-sm text-gray-400 italic">No concerns, actions or notes recorded.</p>
        )}

        {/* Session outcome — set during the TT meeting */}
        <div className="border-t pt-5 mt-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
            <Star className="h-3.5 w-3.5" /> Session outcome
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
              <select
                value={ttRating || ''}
                onChange={(e) => handleRatingChange((e.target.value as TTRating) || undefined)}
                className={cn(
                  'w-full max-w-xs px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-hippo-dark-blue focus:border-transparent',
                  ttRating ? 'border-hippo-dark-blue/40 bg-hippo-dark-blue/5 font-medium' : 'border-gray-300'
                )}
              >
                <option value="">— Not yet rated —</option>
                {Object.values(TTRating).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Feedback notes <span className="text-gray-400 font-normal">(shown to individual)</span></label>
              <textarea
                value={ttFeedbackNotes}
                onChange={(e) => setTtFeedbackNotes(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Key messages to share with this person..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-hippo-dark-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConcernCard({ label, detail, color }: { label: string; detail?: string; color: 'red' | 'orange' | 'blue' | 'purple' }) {
  const colors = {
    red: 'border-red-200 bg-red-50',
    orange: 'border-orange-200 bg-orange-50',
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
  };
  const labelColors = {
    red: 'text-red-700',
    orange: 'text-orange-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700',
  };
  return (
    <div className={cn('rounded-lg border p-3', colors[color])}>
      <div className={cn('text-xs font-semibold uppercase tracking-wide mb-1', labelColors[color])}>{label}</div>
      {detail ? <p className="text-sm text-gray-700">{detail}</p> : <p className="text-sm text-gray-400 italic">Flagged, no detail provided</p>}
    </div>
  );
}
