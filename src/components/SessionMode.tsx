import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import { businessAnalystService } from '../services/businessAnalystService';
import { talentRoundService } from '../services/talentRoundService';
import { BusinessAnalyst, TalentRound, Review, CreateReviewRequest, PromotionReadiness } from '../types';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/date';
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  Plus,
  Trash2,
  ArrowLeft
} from 'lucide-react';

export function SessionMode() {
  const [activeRounds, setActiveRounds] = useState<TalentRound[]>([]);
  const [selectedRound, setSelectedRound] = useState<TalentRound | null>(null);
  const [businessAnalysts, setBusinessAnalysts] = useState<BusinessAnalyst[]>([]);
  const [currentBAIndex, setCurrentBAIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [currentFormData, setCurrentFormData] = useState<CreateReviewRequest | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newAction, setNewAction] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRound && businessAnalysts.length > 0) {
      loadSessionData();
    }
  }, [selectedRound, businessAnalysts]);

  useEffect(() => {
    if (sessionActive && businessAnalysts.length > 0 && currentBAIndex < businessAnalysts.length) {
      loadCurrentBAForm();
    }
  }, [sessionActive, currentBAIndex, businessAnalysts]);

  const loadData = () => {
    const rounds = talentRoundService.getActive();
    const bas = businessAnalystService.getAll().filter(ba => ba.isActive);
    
    setActiveRounds(rounds);
    setBusinessAnalysts(bas);
    
    if (rounds.length === 1) {
      setSelectedRound(rounds[0]);
    }
  };

  const loadSessionData = () => {
    if (!selectedRound) return;
    
    const roundReviews = reviewService.getByRound(selectedRound.id);
    const reviewsMap: Record<string, Review> = {};
    
    roundReviews.forEach(review => {
      reviewsMap[review.businessAnalystId] = review;
    });
    
    setReviews(reviewsMap);
  };

  const loadCurrentBAForm = () => {
    if (!selectedRound || !businessAnalysts[currentBAIndex]) return;
    
    const currentBA = businessAnalysts[currentBAIndex];
    const existingReview = reviews[currentBA.id];
    
    if (existingReview) {
      setCurrentFormData({
        roundId: selectedRound.id,
        businessAnalystId: currentBA.id,
        wellbeingConcerns: existingReview.wellbeingConcerns,
        performanceConcerns: existingReview.performanceConcerns,
        developmentOpportunities: existingReview.developmentOpportunities,
        promotionReadiness: existingReview.promotionReadiness,
        actions: existingReview.actions,
        generalNotes: existingReview.generalNotes
      });
    } else {
      setCurrentFormData({
        roundId: selectedRound.id,
        businessAnalystId: currentBA.id,
        wellbeingConcerns: { hasIssues: false },
        performanceConcerns: { hasIssues: false },
        developmentOpportunities: { hasOpportunities: false },
        promotionReadiness: PromotionReadiness.NOT_READY,
        actions: [],
        generalNotes: ''
      });
    }
    setHasUnsavedChanges(false);
  };

  const updateFormData = (updates: Partial<CreateReviewRequest>) => {
    if (!currentFormData) return;
    
    setCurrentFormData({ ...currentFormData, ...updates });
    setHasUnsavedChanges(true);
  };

  const saveCurrentReview = useCallback(() => {
    if (!currentFormData || !businessAnalysts[currentBAIndex]) return;
    
    try {
      const currentBA = businessAnalysts[currentBAIndex];
      const existingReview = reviews[currentBA.id];
      
      if (existingReview) {
        const updatedReview = reviewService.update(existingReview.id, currentFormData);
        if (updatedReview) {
          setReviews(prev => ({ ...prev, [currentBA.id]: updatedReview }));
        }
      } else {
        const newReview = reviewService.create(currentFormData);
        setReviews(prev => ({ ...prev, [currentBA.id]: newReview }));
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save review');
    }
  }, [currentFormData, businessAnalysts, currentBAIndex, reviews]);

  const navigateNext = () => {
    if (hasUnsavedChanges) {
      saveCurrentReview();
    }
    
    if (currentBAIndex < businessAnalysts.length - 1) {
      setCurrentBAIndex(currentBAIndex + 1);
    }
  };

  const navigatePrevious = () => {
    if (hasUnsavedChanges) {
      saveCurrentReview();
    }
    
    if (currentBAIndex > 0) {
      setCurrentBAIndex(currentBAIndex - 1);
    }
  };

  const jumpToBA = (index: number) => {
    if (hasUnsavedChanges) {
      saveCurrentReview();
    }
    setCurrentBAIndex(index);
  };

  const startSession = () => {
    if (!selectedRound) return;
    setSessionActive(true);
    setCurrentBAIndex(0);
  };

  const endSession = () => {
    if (hasUnsavedChanges) {
      saveCurrentReview();
    }
    setSessionActive(false);
  };

  const addAction = () => {
    if (!currentFormData || !newAction.trim()) return;
    
    updateFormData({
      actions: [...(currentFormData.actions || []), newAction.trim()]
    });
    setNewAction('');
  };

  const removeAction = (index: number) => {
    if (!currentFormData) return;
    
    updateFormData({
      actions: (currentFormData.actions || []).filter((_, i) => i !== index)
    });
  };

  const getCompletionStats = () => {
    const completed = Object.values(reviews).filter(r => r.isComplete).length;
    const total = businessAnalysts.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getPreviousReview = (ba: BusinessAnalyst) => {
    const allReviews = reviewService.getByBA(ba.id);
    const completedReviews = allReviews.filter(r => r.isComplete && r.roundId !== selectedRound?.id);
    return completedReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  };

  if (activeRounds.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Active Rounds</h3>
          <p className="mt-2 text-sm text-gray-500">
            You need to create and activate a talent round before starting a session.
          </p>
        </div>
      </div>
    );
  }

  if (!sessionActive) {
    const stats = getCompletionStats();
    
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Mode</h1>
          <p className="mt-1 text-sm text-gray-500">
            Streamlined interface for live Talking Talent sessions
          </p>
        </div>

        {activeRounds.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Active Round
            </label>
            <select
              value={selectedRound?.id || ''}
              onChange={(e) => {
                const round = activeRounds.find(r => r.id === e.target.value);
                setSelectedRound(round || null);
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900">{businessAnalysts.length}</div>
                  <div className="text-sm text-gray-600">Business Analysts</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-gray-600">Completed Reviews</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div 
                  className="h-3 bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={startSession}
                  disabled={businessAnalysts.length === 0}
                  className={cn(
                    'flex items-center px-6 py-3 rounded-lg font-medium',
                    businessAnalysts.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  )}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!currentFormData || !businessAnalysts[currentBAIndex]) {
    return <div>Loading...</div>;
  }

  const currentBA = businessAnalysts[currentBAIndex];
  const previousReview = getPreviousReview(currentBA);
  const currentReview = reviews[currentBA.id];
  const isComplete = currentReview?.isComplete || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={endSession}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Session Mode: {selectedRound?.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentBAIndex + 1} of {businessAnalysts.length} • {currentBA.firstName} {currentBA.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isComplete && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Complete</span>
                </div>
              )}
              {hasUnsavedChanges && (
                <div className="flex items-center text-orange-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">Unsaved</span>
                </div>
              )}
              <button
                onClick={saveCurrentReview}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentBAIndex + 1) / businessAnalysts.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-80 bg-white border-r h-screen overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Business Analysts</h3>
            <div className="space-y-1">
              {businessAnalysts.map((ba, index) => {
                const review = reviews[ba.id];
                const isCurrentBA = index === currentBAIndex;
                
                return (
                  <button
                    key={ba.id}
                    onClick={() => jumpToBA(index)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-colors',
                      isCurrentBA
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {ba.firstName} {ba.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ba.level}
                        </div>
                      </div>
                      <div>
                        {review?.isComplete ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : review ? (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <div className="h-4 w-4 border border-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 text-gray-400 mr-3" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentBA.firstName} {currentBA.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {currentBA.level} {currentBA.department && `• ${currentBA.department}`}
                  </p>
                </div>
              </div>

              {previousReview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Previous Review</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>Promotion Readiness: {previousReview.promotionReadiness}</div>
                    {previousReview.wellbeingConcerns.hasIssues && (
                      <div>Wellbeing: {previousReview.wellbeingConcerns.details}</div>
                    )}
                    {previousReview.performanceConcerns.hasIssues && (
                      <div>Performance: {previousReview.performanceConcerns.details}</div>
                    )}
                    {previousReview.actions.length > 0 && (
                      <div>Actions: {previousReview.actions.join(', ')}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={currentFormData.wellbeingConcerns.hasIssues}
                      onChange={(e) => updateFormData({
                        wellbeingConcerns: {
                          ...currentFormData.wellbeingConcerns,
                          hasIssues: e.target.checked,
                          details: e.target.checked ? currentFormData.wellbeingConcerns.details : undefined
                        }
                      })}
                      className="mr-3 h-4 w-4"
                    />
                    <label className="font-medium text-gray-900">
                      Wellbeing Concerns
                    </label>
                  </div>
                  {currentFormData.wellbeingConcerns.hasIssues && (
                    <textarea
                      value={currentFormData.wellbeingConcerns.details || ''}
                      onChange={(e) => updateFormData({
                        wellbeingConcerns: {
                          ...currentFormData.wellbeingConcerns,
                          details: e.target.value
                        }
                      })}
                      placeholder="Describe concerns..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={currentFormData.performanceConcerns.hasIssues}
                      onChange={(e) => updateFormData({
                        performanceConcerns: {
                          ...currentFormData.performanceConcerns,
                          hasIssues: e.target.checked,
                          details: e.target.checked ? currentFormData.performanceConcerns.details : undefined
                        }
                      })}
                      className="mr-3 h-4 w-4"
                    />
                    <label className="font-medium text-gray-900">
                      Performance Concerns
                    </label>
                  </div>
                  {currentFormData.performanceConcerns.hasIssues && (
                    <textarea
                      value={currentFormData.performanceConcerns.details || ''}
                      onChange={(e) => updateFormData({
                        performanceConcerns: {
                          ...currentFormData.performanceConcerns,
                          details: e.target.value
                        }
                      })}
                      placeholder="Describe concerns..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={currentFormData.developmentOpportunities.hasOpportunities}
                      onChange={(e) => updateFormData({
                        developmentOpportunities: {
                          ...currentFormData.developmentOpportunities,
                          hasOpportunities: e.target.checked,
                          details: e.target.checked ? currentFormData.developmentOpportunities.details : undefined
                        }
                      })}
                      className="mr-3 h-4 w-4"
                    />
                    <label className="font-medium text-gray-900">
                      Development Opportunities
                    </label>
                  </div>
                  {currentFormData.developmentOpportunities.hasOpportunities && (
                    <textarea
                      value={currentFormData.developmentOpportunities.details || ''}
                      onChange={(e) => updateFormData({
                        developmentOpportunities: {
                          ...currentFormData.developmentOpportunities,
                          details: e.target.value
                        }
                      })}
                      placeholder="Describe opportunities..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-medium text-gray-900 mb-3">
                  Promotion Readiness
                </label>
                <div className="flex flex-wrap gap-4">
                  {Object.values(PromotionReadiness).map(readiness => (
                    <label key={readiness} className="flex items-center">
                      <input
                        type="radio"
                        name="promotionReadiness"
                        value={readiness}
                        checked={currentFormData.promotionReadiness === readiness}
                        onChange={(e) => updateFormData({
                          promotionReadiness: e.target.value as PromotionReadiness
                        })}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{readiness}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-medium text-gray-900 mb-3">
                  Action Items
                </label>
                <div className="space-y-2 mb-3">
                  {(currentFormData.actions || []).map((action, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={action}
                        onChange={(e) => {
                          const newActions = [...(currentFormData.actions || [])];
                          newActions[index] = e.target.value;
                          updateFormData({ actions: newActions });
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
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    placeholder="Add action item..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
                  />
                  <button
                    type="button"
                    onClick={addAction}
                    className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  General Notes
                </label>
                <textarea
                  value={currentFormData.generalNotes}
                  onChange={(e) => updateFormData({ generalNotes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={navigatePrevious}
                disabled={currentBAIndex === 0}
                className={cn(
                  'flex items-center px-4 py-2 rounded-lg',
                  currentBAIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <button
                onClick={navigateNext}
                disabled={currentBAIndex === businessAnalysts.length - 1}
                className={cn(
                  'flex items-center px-4 py-2 rounded-lg',
                  currentBAIndex === businessAnalysts.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}