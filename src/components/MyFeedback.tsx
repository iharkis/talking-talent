import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import { talentRoundService } from '../services/talentRoundService';
import { businessAnalystService } from '../services/businessAnalystService';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Review, TalentRound } from '../types';
import { Star, AlertCircle, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/date';

interface RoundFeedback {
  round: TalentRound;
  review: Review;
}

export function MyFeedback() {
  const { currentUser } = useCurrentUser();
  const [feedbackItems, setFeedbackItems] = useState<RoundFeedback[]>([]);
  const [myName, setMyName] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const me = businessAnalystService.getById(currentUser.businessAnalystId);
    if (me) setMyName(`${me.firstName} ${me.lastName}`);

    const allReviews = reviewService.getByBA(currentUser.businessAnalystId);
    const allRounds = talentRoundService.getAll();

    const items: RoundFeedback[] = allReviews
      .filter(r => r.isComplete)
      .map(r => {
        const round = allRounds.find(ro => ro.id === r.roundId);
        return round && round.ratingsShared ? { round, review: r } : null;
      })
      .filter((x): x is RoundFeedback => x !== null)
      .sort((a, b) => new Date(b.round.createdAt).getTime() - new Date(a.round.createdAt).getTime());

    setFeedbackItems(items);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-sm font-medium text-hippo-dark-text">No user selected</h3>
        <p className="mt-1 text-sm text-hippo-dark-text/60">Go to Settings to select who you are.</p>
        <a href="/settings" className="mt-4 inline-flex items-center btn-hippo text-sm">Go to Settings</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
        <h1 className="text-3xl font-semibold text-hippo-dark-text">My Feedback</h1>
        <p className="mt-1 text-hippo-dark-text/70">{myName} · Your Talking Talent feedback across rounds</p>
      </div>

      {feedbackItems.length === 0 ? (
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-hippo-dark-text">No feedback yet</h3>
          <p className="mt-1 text-sm text-hippo-dark-text/60">
            Your Talking Talent rating will appear here once your people team has shared results.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackItems.map(({ round, review }) => (
            <FeedbackCard key={review.id} round={round} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ round, review }: { round: TalentRound; review: Review }) {
  const ratingColor = review.ttRating === 'Exceeding Expectations'
    ? 'bg-green-100 text-green-800 border-green-200'
    : review.ttRating === 'Meeting Expectations'
    ? 'bg-blue-100 text-blue-800 border-blue-200'
    : review.ttRating === 'Not Meeting Expectations'
    ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="font-semibold text-hippo-dark-text">{round.name}</span>
          <span className="text-sm text-hippo-dark-text/50">· {round.quarter} {round.year}</span>
        </div>
        {review.ttRating && (
          <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border', ratingColor)}>
            <Star className="h-3.5 w-3.5" />
            {review.ttRating}
          </span>
        )}
      </div>

      <div className="p-6">
        {review.ttFeedbackNotes ? (
          <div className="bg-hippo-dark-blue/5 border border-hippo-dark-blue/20 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-hippo-dark-blue uppercase tracking-wide mb-2 flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> Feedback
            </h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.ttFeedbackNotes}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No feedback notes recorded for this round.</p>
        )}
      </div>
    </div>
  );
}
