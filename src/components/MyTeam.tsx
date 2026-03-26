import { useState, useEffect, useCallback } from 'react';
import { businessAnalystService } from '../services/businessAnalystService';
import { talentRoundService } from '../services/talentRoundService';
import { reviewService } from '../services/reviewService';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ReviewForm } from './ReviewForm';
import { BusinessAnalyst, TalentRound, Review, CreateReviewRequest, HistoricalTrend } from '../types';
import {
  Users, AlertCircle, CheckCircle, Clock, X,
  TrendingUp, TrendingDown, Minus, Calendar, Star, Share2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/date';

// ─── Org tree builder ──────────────────────────────────────────────────────────

interface TeamMemberRow {
  ba: BusinessAnalyst;
  depth: number;
  isSubteamHead: boolean;
}

function buildTree(rootId: string, allBAs: BusinessAnalyst[], depth = 0): TeamMemberRow[] {
  const rows: TeamMemberRow[] = [];
  for (const ba of allBAs.filter(b => b.lineManagerId === rootId)) {
    const hasChildren = allBAs.some(b => b.lineManagerId === ba.id);
    rows.push({ ba, depth, isSubteamHead: hasChildren });
    rows.push(...buildTree(ba.id, allBAs, depth + 1));
  }
  return rows;
}

// ─── Main component ────────────────────────────────────────────────────────────

type PanelView = 'review' | 'history';

export function MyTeam() {
  const { currentUser, isIndividual, isManager, isPeople } = useCurrentUser();
  const [rows, setRows] = useState<TeamMemberRow[]>([]);
  const [activeRound, setActiveRound] = useState<TalentRound | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Panel state
  const [selectedBA, setSelectedBA] = useState<BusinessAnalyst | null>(null);
  const [panelView, setPanelView] = useState<PanelView>('review');
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [historicalTrend, setHistoricalTrend] = useState<HistoricalTrend | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => { loadData(); }, [currentUser]);

  const loadData = useCallback(() => {
    const activeRounds = talentRoundService.getActive();
    const round = activeRounds[0] || null;
    setActiveRound(round);
    if (round) setReviews(reviewService.getByRound(round.id));

    if (!currentUser) { setRows([]); return; }

    const allActive = businessAnalystService.getAll().filter(ba => ba.isActive);
    if (isPeople) {
      setRows(allActive.map(ba => ({ ba, depth: 0, isSubteamHead: false })));
    } else if (isManager) {
      setRows(buildTree(currentUser.businessAnalystId, allActive));
    } else {
      const self = businessAnalystService.getById(currentUser.businessAnalystId);
      setRows(self ? [{ ba: self, depth: 0, isSubteamHead: false }] : []);
    }
  }, [currentUser, isPeople, isManager]);

  const openPanel = (ba: BusinessAnalyst) => {
    setSelectedBA(ba);
    setPanelView('review');
    setSavedBanner(false);
    if (activeRound) {
      setExistingReview(reviewService.getByBAAndRound(ba.id, activeRound.id));
    }
    setHistoricalTrend(reviewService.getHistoricalTrend(ba.id));
  };

  const closePanel = () => {
    setSelectedBA(null);
    setSavedBanner(false);
  };

  const handleReviewSubmit = (data: CreateReviewRequest) => {
    try {
      if (existingReview) {
        reviewService.update(existingReview.id, data);
      } else {
        reviewService.create(data);
      }
      const updated = reviewService.getByBAAndRound(selectedBA!.id, activeRound!.id);
      setExistingReview(updated);
      // Refresh the reviews list so status badges update
      setReviews(reviewService.getByRound(activeRound!.id));
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleMarkDelivered = (reviewId: string) => {
    reviewService.markFeedbackDelivered(reviewId);
    const updated = reviewService.getByBAAndRound(selectedBA!.id, activeRound!.id);
    setExistingReview(updated);
    setReviews(reviewService.getByRound(activeRound!.id));
  };

  const getReview = (baId: string) => reviews.find(r => r.businessAnalystId === baId);

  const capturedCount = rows.filter(r => !!getReview(r.ba.id)).length;
  const completedCount = rows.filter(r => getReview(r.ba.id)?.isComplete).length;
  const roundSummary = activeRound ? talentRoundService.getRoundSummary(activeRound.id) : null;
  const ratingsShared = activeRound?.ratingsShared ?? false;
  const pendingDeliveryCount = ratingsShared
    ? rows.filter(r => { const rev = getReview(r.ba.id); return rev?.ttRating && !rev.feedbackDelivered; }).length
    : 0;

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
          <h1 className="text-3xl font-semibold text-hippo-dark-text">My Team</h1>
        </div>
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-hippo-dark-text">No user selected</h3>
          <p className="mt-1 text-sm text-hippo-dark-text/60">Go to Settings to select who you are.</p>
          <a href="/settings" className="mt-4 inline-flex items-center btn-hippo text-sm">Go to Settings</a>
        </div>
      </div>
    );
  }

  const scopeLabel = isPeople ? 'All consultants' : isManager ? 'Your full reporting tree' : 'Your profile';

  return (
    <div className="space-y-6">

      {/* Active round banner */}
      {activeRound ? (
        <div className="bg-hippo-dark-blue text-hippo-white rounded-hippo-subtle px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 opacity-70 flex-shrink-0" />
            <div>
              <div className="font-semibold">{activeRound.name}</div>
              <div className="text-sm opacity-70">Deadline: {formatDate(activeRound.deadline)}</div>
            </div>
          </div>
          {roundSummary && (
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center hidden sm:block">
                <div className="font-bold text-lg">{roundSummary.completionPercentage}%</div>
                <div className="opacity-60">overall</div>
              </div>
              <div className="text-center hidden sm:block">
                <div className="font-bold text-lg">{completedCount}/{rows.length}</div>
                <div className="opacity-60">your team</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-hippo-subtle px-6 py-4 text-sm text-amber-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          No active round. {isPeople && <a href="/rounds" className="underline ml-1">Create one in Rounds.</a>}
        </div>
      )}

      {/* Ratings ready to share banner */}
      {ratingsShared && !isIndividual && pendingDeliveryCount > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-hippo-subtle px-6 py-4 flex items-center gap-3">
          <Share2 className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-purple-900">Ratings are ready to share</div>
            <div className="text-sm text-purple-700">{pendingDeliveryCount} team member{pendingDeliveryCount !== 1 ? 's' : ''} still to receive their rating. Open each person to share and mark as delivered.</div>
          </div>
        </div>
      )}
      {ratingsShared && !isIndividual && pendingDeliveryCount === 0 && rows.some(r => getReview(r.ba.id)?.ttRating) && (
        <div className="bg-green-50 border border-green-200 rounded-hippo-subtle px-6 py-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="text-sm text-green-800 font-medium">All ratings have been delivered.</div>
        </div>
      )}

      {/* Header */}
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-hippo-dark-text">My Team</h1>
            <p className="mt-1 text-hippo-dark-text/70">{scopeLabel}</p>
          </div>
          {activeRound && rows.length > 0 && (
            <div className="flex gap-4 text-center">
              <div className="bg-gray-50 rounded-lg px-4 py-2">
                <div className="text-xl font-bold text-hippo-dark-text">{rows.length}</div>
                <div className="text-xs text-hippo-dark-text/60">Total</div>
              </div>
              <div className="bg-blue-50 rounded-lg px-4 py-2 hidden sm:block">
                <div className="text-xl font-bold text-blue-600">{capturedCount}</div>
                <div className="text-xs text-hippo-dark-text/60">In progress</div>
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-2 hidden sm:block">
                <div className="text-xl font-bold text-green-600">{completedCount}</div>
                <div className="text-xs text-hippo-dark-text/60">Complete</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team list */}
      {rows.length === 0 ? (
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-hippo-dark-text">No team members found</h3>
        </div>
      ) : isPeople ? (
        <PeopleTable rows={rows} reviews={reviews} activeRound={activeRound} onSelect={openPanel} />
      ) : (
        <HierarchyList rows={rows} reviews={reviews} activeRound={activeRound} isFlat={isIndividual} onSelect={openPanel} />
      )}

      {/* Slide-over panel */}
      {selectedBA && (
        <SlideOverPanel
          ba={selectedBA}
          round={activeRound}
          existingReview={existingReview}
          panelView={panelView}
          setPanelView={setPanelView}
          historicalTrend={historicalTrend}
          savedBanner={savedBanner}
          readOnly={isIndividual}
          ratingsShared={ratingsShared}
          onSubmit={handleReviewSubmit}
          onMarkDelivered={handleMarkDelivered}
          onClose={closePanel}
        />
      )}
    </div>
  );
}

// ─── Slide-over panel ──────────────────────────────────────────────────────────

interface PanelProps {
  ba: BusinessAnalyst;
  round: TalentRound | null;
  existingReview: Review | null;
  panelView: PanelView;
  setPanelView: (v: PanelView) => void;
  historicalTrend: HistoricalTrend | null;
  savedBanner: boolean;
  readOnly: boolean;
  ratingsShared: boolean;
  onSubmit: (data: CreateReviewRequest) => void;
  onMarkDelivered: (reviewId: string) => void;
  onClose: () => void;
}

function SlideOverPanel({ ba, round, existingReview, panelView, setPanelView, historicalTrend, savedBanner, readOnly, ratingsShared, onSubmit, onMarkDelivered, onClose }: PanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* Tabs */}
        <div className="flex border-b flex-shrink-0">
          <button
            onClick={() => setPanelView('review')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              panelView === 'review'
                ? 'border-b-2 border-hippo-dark-blue text-hippo-dark-blue'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            TT Review
          </button>
          <button
            onClick={() => setPanelView('history')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              panelView === 'history'
                ? 'border-b-2 border-hippo-dark-blue text-hippo-dark-blue'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            History
          </button>
          <button onClick={onClose} className="px-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {savedBanner && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-2 text-sm text-green-700 flex items-center gap-2 flex-shrink-0">
            <CheckCircle className="h-4 w-4" /> Review saved successfully
          </div>
        )}

        {/* TT Rating section — visible to managers/people once ratings have been shared */}
        {ratingsShared && existingReview?.ttRating && (
          <div className="border-b flex-shrink-0 px-6 py-4 bg-purple-50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" /> TT Rating
                </div>
                <div className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border',
                  existingReview.ttRating === 'Exceeding Expectations' ? 'bg-green-100 text-green-800 border-green-200' :
                  existingReview.ttRating === 'Meeting Expectations' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-red-100 text-red-800 border-red-200'
                )}>
                  {existingReview.ttRating}
                </div>
                {existingReview.ttFeedbackNotes && (
                  <p className="mt-2 text-sm text-gray-700">{existingReview.ttFeedbackNotes}</p>
                )}
              </div>
              {existingReview.feedbackDelivered ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                  <CheckCircle className="h-4 w-4" /> Delivered
                </span>
              ) : (
                !readOnly && (
                  <button
                    onClick={() => onMarkDelivered(existingReview.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Mark as delivered
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {panelView === 'review' ? (
          round ? (
            <ReviewForm
              ba={ba}
              round={round}
              existingReview={existingReview}
              readOnly={readOnly}
              onSubmit={onSubmit}
              onCancel={onClose}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500 p-6 text-center">
              No active round. Reviews can only be entered during an active round.
            </div>
          )
        ) : (
          <HistoryPanel ba={ba} trend={historicalTrend} onClose={onClose} />
        )}
      </div>
    </>
  );
}

// ─── History panel content ─────────────────────────────────────────────────────

function HistoryPanel({ ba, trend, onClose }: { ba: BusinessAnalyst; trend: HistoricalTrend | null; onClose: () => void }) {
  const trendIcon = trend?.trend === 'Improving' ? TrendingUp :
                    trend?.trend === 'Declining' ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendColor = trend?.trend === 'Improving' ? 'text-green-600' :
                     trend?.trend === 'Declining' ? 'text-red-600' : 'text-gray-500';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
        <div>
          <h3 className="font-semibold text-gray-900">{ba.firstName} {ba.lastName}</h3>
          <p className="text-sm text-gray-500">{ba.level}{ba.profession ? ` · ${ba.profession}` : ''}</p>
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
            <TrendIcon className="h-4 w-4" />
            {trend.trend}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!trend || trend.reviews.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            No completed reviews yet.
          </div>
        ) : (
          <div className="space-y-4">
            {[...trend.reviews].reverse().map((r, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">{r.roundName}</div>
                  <div className="text-xs text-gray-500">{formatDate(new Date(r.date))}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    r.promotionReadiness === 'Ready' ? 'bg-green-100 text-green-800' :
                    r.promotionReadiness === 'Near Ready' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-700'
                  )}>
                    {r.promotionReadiness}
                  </span>
                  {r.concerns.wellbeing && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Wellbeing</span>}
                  {r.concerns.performance && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">Performance</span>}
                </div>

                {r.actions.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Actions</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {r.actions.map((a, j) => <li key={j} className="flex items-start gap-1"><span className="text-gray-400 mt-0.5">·</span>{a}</li>)}
                    </ul>
                  </div>
                )}

                {r.generalNotes && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Notes</div>
                    <p className="text-sm text-gray-700">{r.generalNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-6 py-4 border-t">
        <button onClick={onClose} className="btn-hippo text-sm w-full">Close</button>
      </div>
    </div>
  );
}

// ─── Hierarchy list ────────────────────────────────────────────────────────────

interface ListProps {
  rows: TeamMemberRow[];
  reviews: Review[];
  activeRound: TalentRound | null;
  isFlat: boolean;
  onSelect: (ba: BusinessAnalyst) => void;
}

function HierarchyList({ rows, reviews, activeRound, isFlat, onSelect }: ListProps) {
  const getReview = (baId: string) => reviews.find(r => r.businessAnalystId === baId);

  return (
    <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle overflow-hidden">
      {rows.map((row, i) => {
        const { ba, depth, isSubteamHead } = row;
        const review = getReview(ba.id);
        const isComplete = review?.isComplete;
        const hasStarted = !!review;
        const showDivider = !isFlat && depth === 0 && i > 0;

        return (
          <div key={ba.id}>
            {showDivider && <div className="h-px bg-gray-100 mx-6" />}
            <button
              onClick={() => onSelect(ba)}
              className={cn(
                'w-full flex items-center justify-between py-3 pr-6 hover:bg-gray-50 transition-colors text-left',
                depth === 0 ? 'pl-6' : depth === 1 ? 'pl-12' : 'pl-20',
                isSubteamHead && depth > 0 && 'pt-4'
              )}
            >
              <div className="flex items-center min-w-0">
                {!isFlat && depth > 0 && <span className="text-gray-300 mr-2 flex-shrink-0 text-sm">└</span>}
                <div className={cn(
                  'flex-shrink-0 rounded-full flex items-center justify-center font-semibold',
                  isSubteamHead && !isFlat ? 'h-9 w-9 bg-hippo-dark-blue text-hippo-white text-sm' : 'h-8 w-8 bg-hippo-dark-blue/10 text-hippo-dark-blue text-xs'
                )}>
                  {ba.firstName[0]}{ba.lastName[0]}
                </div>
                <div className="ml-3 min-w-0">
                  <div className={cn('text-sm text-hippo-dark-text', isSubteamHead && !isFlat ? 'font-semibold' : 'font-medium')}>
                    {ba.firstName} {ba.lastName}
                  </div>
                  <div className="text-xs text-hippo-dark-text/50">{ba.level}{ba.profession ? ` · ${ba.profession}` : ''}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                {activeRound ? (
                  <span className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
                    isComplete ? 'bg-green-100 text-green-800' : hasStarted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                  )}>
                    {isComplete ? <><CheckCircle className="h-3 w-3" /> Complete</> :
                     hasStarted ? <><Clock className="h-3 w-3" /> In progress</> :
                     <><Clock className="h-3 w-3" /> Not started</>}
                  </span>
                ) : <span className="text-xs text-gray-400">No active round</span>}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── People table ──────────────────────────────────────────────────────────────

interface TableProps {
  rows: TeamMemberRow[];
  reviews: Review[];
  activeRound: TalentRound | null;
  onSelect: (ba: BusinessAnalyst) => void;
}

function PeopleTable({ rows, reviews, activeRound, onSelect }: TableProps) {
  const getReview = (baId: string) => reviews.find(r => r.businessAnalystId === baId);
  const getManagerName = (id?: string) => {
    if (!id) return '—';
    const m = businessAnalystService.getById(id);
    return m ? `${m.firstName} ${m.lastName}` : '—';
  };

  return (
    <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle overflow-hidden">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Level</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Manager</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(({ ba }) => {
            const review = getReview(ba.id);
            const isComplete = review?.isComplete;
            const hasStarted = !!review;
            return (
              <tr key={ba.id} onClick={() => onSelect(ba)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-hippo-dark-blue/10 flex items-center justify-center text-hippo-dark-blue text-xs font-semibold flex-shrink-0">
                      {ba.firstName[0]}{ba.lastName[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-hippo-dark-text">{ba.firstName} {ba.lastName}</div>
                      {ba.profession && <div className="text-xs text-hippo-dark-text/50">{ba.profession}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm text-hippo-dark-text/70 hidden md:table-cell">{ba.level}</td>
                <td className="px-6 py-3 text-sm text-hippo-dark-text/70 hidden lg:table-cell">{getManagerName(ba.lineManagerId)}</td>
                <td className="px-6 py-3">
                  {activeRound ? (
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
                      isComplete ? 'bg-green-100 text-green-800' : hasStarted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                    )}>
                      {isComplete ? <><CheckCircle className="h-3 w-3" /> Complete</> :
                       hasStarted ? <><Clock className="h-3 w-3" /> In progress</> :
                       <><Clock className="h-3 w-3" /> Not started</>}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
