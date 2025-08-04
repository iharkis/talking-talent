import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import { businessAnalystService } from '../services/businessAnalystService';
import { talentRoundService } from '../services/talentRoundService';
import { BusinessAnalyst, TalentRound, Review, CreateReviewRequest, PromotionReadiness, RoundStatus } from '../types';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/date';
import { ClipboardList, User, Calendar, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';

export function ReviewEntry() {
  const [activeRounds, setActiveRounds] = useState<TalentRound[]>([]);
  const [selectedRound, setSelectedRound] = useState<TalentRound | null>(null);
  const [businessAnalysts, setBusinessAnalysts] = useState<BusinessAnalyst[]>([]);
  const [selectedBA, setSelectedBA] = useState<BusinessAnalyst | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRound && selectedBA) {
      const review = reviewService.getByBAAndRound(selectedBA.id, selectedRound.id);
      setExistingReview(review);
      setShowForm(true);
    }
  }, [selectedRound, selectedBA]);

  const loadData = () => {
    const rounds = talentRoundService.getActive();
    const bas = businessAnalystService.getAll().filter(ba => ba.isActive);
    
    setActiveRounds(rounds);
    setBusinessAnalysts(bas);
    
    if (rounds.length === 1) {
      setSelectedRound(rounds[0]);
    }
  };

  const handleReviewSubmit = (data: CreateReviewRequest) => {
    try {
      if (existingReview) {
        reviewService.update(existingReview.id, data);
      } else {
        reviewService.create(data);
      }
      
      const updatedReview = reviewService.getByBAAndRound(selectedBA!.id, selectedRound!.id);
      setExistingReview(updatedReview);
      setShowForm(false);
      setSelectedBA(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const getBAReviewStatus = (ba: BusinessAnalyst) => {
    if (!selectedRound) return null;
    const review = reviewService.getByBAAndRound(ba.id, selectedRound.id);
    return review?.isComplete ? 'completed' : review ? 'draft' : 'pending';
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft': return <ClipboardList className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50';
      case 'draft': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  if (activeRounds.length === 0) {
    return (
      <div>
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-hippo-dark-text">No Active Rounds</h3>
          <p className="mt-2 text-sm text-hippo-dark-text/60">
            You need to create and activate a talent round before you can enter reviews.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
        <h1 className="text-3xl font-semibold text-hippo-dark-text">Review Entry</h1>
        <p className="mt-2 text-hippo-dark-text/70">
          Enter individual reviews for business analysts
        </p>
      </div>

      {activeRounds.length > 1 && (
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Active Round
          </label>
          <select
            value={selectedRound?.id || ''}
            onChange={(e) => {
              const round = activeRounds.find(r => r.id === e.target.value);
              setSelectedRound(round || null);
              setSelectedBA(null);
              setShowForm(false);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a round...</option>
            {activeRounds.map(round => (
              <option key={round.id} value={round.id}>
                {round.name} - Due {formatDate(round.deadline)}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedRound && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedRound.name}
              </h3>
              <span className="text-sm text-gray-500">
                Due: {formatDate(selectedRound.deadline)}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid gap-4">
              {businessAnalysts.map(ba => {
                const status = getBAReviewStatus(ba);
                
                return (
                  <div
                    key={ba.id}
                    className={cn(
                      'bg-hippo-light-gray/20 rounded-hippo-subtle p-4 cursor-pointer transition-all hover:shadow-sm',
                      getStatusColor(status),
                      selectedBA?.id === ba.id ? 'ring-2 ring-blue-500' : ''
                    )}
                    onClick={() => {
                      setSelectedBA(ba);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {ba.firstName} {ba.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ba.level} {ba.department && `• ${ba.department}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(status)}
                        <span className="ml-2 text-sm font-medium capitalize text-gray-700">
                          {status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {businessAnalysts.length === 0 && (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No business analysts</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add business analysts before creating reviews.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && selectedBA && selectedRound && (
        <ReviewForm
          ba={selectedBA}
          round={selectedRound}
          existingReview={existingReview}
          onSubmit={handleReviewSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedBA(null);
          }}
        />
      )}
    </div>
  );
}

interface ReviewFormProps {
  ba: BusinessAnalyst;
  round: TalentRound;
  existingReview: Review | null;
  onSubmit: (data: CreateReviewRequest) => void;
  onCancel: () => void;
}

function ReviewForm({ ba, round, existingReview, onSubmit, onCancel }: ReviewFormProps) {
  const [formData, setFormData] = useState<CreateReviewRequest>({
    roundId: round.id,
    businessAnalystId: ba.id,
    wellbeingConcerns: existingReview?.wellbeingConcerns || { hasIssues: false },
    performanceConcerns: existingReview?.performanceConcerns || { hasIssues: false },
    developmentOpportunities: existingReview?.developmentOpportunities || { hasOpportunities: false },
    promotionReadiness: existingReview?.promotionReadiness || PromotionReadiness.NOT_READY,
    actions: existingReview?.actions || [],
    generalNotes: existingReview?.generalNotes || ''
  });

  const [newAction, setNewAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addAction = () => {
    if (newAction.trim()) {
      setFormData({
        ...formData,
        actions: [...(formData.actions || []), newAction.trim()]
      });
      setNewAction('');
    }
  };

  const removeAction = (index: number) => {
    setFormData({
      ...formData,
      actions: (formData.actions || []).filter((_, i) => i !== index)
    });
  };

  const getPreviousReview = () => {
    const allReviews = reviewService.getByBA(ba.id);
    const completedReviews = allReviews.filter(r => r.isComplete && r.roundId !== round.id);
    return completedReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  };

  const previousReview = getPreviousReview();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Review: {ba.firstName} {ba.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {ba.level} • {round.name}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {previousReview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Previous Review Context</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>Promotion Readiness: {previousReview.promotionReadiness}</div>
                {previousReview.wellbeingConcerns.hasIssues && (
                  <div>Wellbeing Concerns: {previousReview.wellbeingConcerns.details}</div>
                )}
                {previousReview.performanceConcerns.hasIssues && (
                  <div>Performance Concerns: {previousReview.performanceConcerns.details}</div>
                )}
                {previousReview.actions.length > 0 && (
                  <div>Previous Actions: {previousReview.actions.join(', ')}</div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={formData.wellbeingConcerns.hasIssues}
                    onChange={(e) => setFormData({
                      ...formData,
                      wellbeingConcerns: {
                        ...formData.wellbeingConcerns,
                        hasIssues: e.target.checked,
                        details: e.target.checked ? formData.wellbeingConcerns.details : undefined
                      }
                    })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Wellbeing Concerns
                  </label>
                </div>
                {formData.wellbeingConcerns.hasIssues && (
                  <textarea
                    value={formData.wellbeingConcerns.details || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      wellbeingConcerns: {
                        ...formData.wellbeingConcerns,
                        details: e.target.value
                      }
                    })}
                    placeholder="Describe the wellbeing concerns..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={formData.performanceConcerns.hasIssues}
                    onChange={(e) => setFormData({
                      ...formData,
                      performanceConcerns: {
                        ...formData.performanceConcerns,
                        hasIssues: e.target.checked,
                        details: e.target.checked ? formData.performanceConcerns.details : undefined
                      }
                    })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Performance Concerns
                  </label>
                </div>
                {formData.performanceConcerns.hasIssues && (
                  <textarea
                    value={formData.performanceConcerns.details || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      performanceConcerns: {
                        ...formData.performanceConcerns,
                        details: e.target.value
                      }
                    })}
                    placeholder="Describe the performance concerns..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={formData.developmentOpportunities.hasOpportunities}
                    onChange={(e) => setFormData({
                      ...formData,
                      developmentOpportunities: {
                        ...formData.developmentOpportunities,
                        hasOpportunities: e.target.checked,
                        details: e.target.checked ? formData.developmentOpportunities.details : undefined
                      }
                    })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Development Opportunities
                  </label>
                </div>
                {formData.developmentOpportunities.hasOpportunities && (
                  <textarea
                    value={formData.developmentOpportunities.details || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      developmentOpportunities: {
                        ...formData.developmentOpportunities,
                        details: e.target.value
                      }
                    })}
                    placeholder="Describe the development opportunities..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promotion Readiness
              </label>
              <div className="flex space-x-4">
                {Object.values(PromotionReadiness).map(readiness => (
                  <label key={readiness} className="flex items-center">
                    <input
                      type="radio"
                      name="promotionReadiness"
                      value={readiness}
                      checked={formData.promotionReadiness === readiness}
                      onChange={(e) => setFormData({
                        ...formData,
                        promotionReadiness: e.target.value as PromotionReadiness
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{readiness}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Items
              </label>
              <div className="space-y-2">
                {(formData.actions || []).map((action, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={action}
                      onChange={(e) => {
                        const newActions = [...(formData.actions || [])];
                        newActions[index] = e.target.value;
                        setFormData({ ...formData, actions: newActions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    placeholder="Add new action item..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
                  />
                  <button
                    type="button"
                    onClick={addAction}
                    className="btn-hippo-cta p-2"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                General Notes
              </label>
              <textarea
                value={formData.generalNotes}
                onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
                rows={4}
                placeholder="Additional notes and observations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={(e) => handleSubmit(e as any)}
            className="btn-hippo-cta text-sm"
          >
            Save Review
          </button>
        </div>
      </div>
    </div>
  );
}