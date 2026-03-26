import { useState } from 'react';
import { reviewService } from '../services/reviewService';
import { BusinessAnalyst, TalentRound, Review, CreateReviewRequest, PromotionReadiness } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export interface ReviewFormProps {
  ba: BusinessAnalyst;
  round: TalentRound;
  existingReview: Review | null;
  readOnly?: boolean;
  onSubmit: (data: CreateReviewRequest) => void;
  onCancel: () => void;
}

export function ReviewForm({ ba, round, existingReview, readOnly = false, onSubmit, onCancel }: ReviewFormProps) {
  const [formData, setFormData] = useState<CreateReviewRequest>({
    roundId: round.id,
    businessAnalystId: ba.id,
    wellbeingConcerns: existingReview?.wellbeingConcerns || { hasIssues: false },
    performanceConcerns: existingReview?.performanceConcerns || { hasIssues: false },
    developmentOpportunities: existingReview?.developmentOpportunities || { hasOpportunities: false },
    promotionReadiness: existingReview?.promotionReadiness || PromotionReadiness.NOT_READY,
    promotionTimeframe: existingReview?.promotionTimeframe || '',
    actions: existingReview?.actions || [],
    generalNotes: existingReview?.generalNotes || '',
  });

  const [newAction, setNewAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addAction = () => {
    if (newAction.trim()) {
      setFormData({ ...formData, actions: [...(formData.actions || []), newAction.trim()] });
      setNewAction('');
    }
  };

  const removeAction = (index: number) => {
    setFormData({ ...formData, actions: (formData.actions || []).filter((_, i) => i !== index) });
  };

  const previousReview = (() => {
    const all = reviewService.getByBA(ba.id);
    return all
      .filter(r => r.isComplete && r.roundId !== round.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
  })();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white flex-shrink-0">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {ba.firstName} {ba.lastName}
          </h3>
          <p className="text-sm text-gray-500">{ba.level}{ba.profession ? ` · ${ba.profession}` : ''} · {round.name}</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 rounded">
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {readOnly && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            This review is completed by your manager. You can view it but cannot make changes.
          </div>
        )}

        {previousReview && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Previous round context</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>Promotion readiness: <span className="font-medium">{previousReview.promotionReadiness}</span></div>
              {previousReview.wellbeingConcerns.hasIssues && <div>Wellbeing: {previousReview.wellbeingConcerns.details}</div>}
              {previousReview.performanceConcerns.hasIssues && <div>Performance: {previousReview.performanceConcerns.details}</div>}
              {previousReview.actions.length > 0 && <div>Actions: {previousReview.actions.join(', ')}</div>}
            </div>
          </div>
        )}

        <form id="review-form" onSubmit={handleSubmit}>
          <fieldset disabled={readOnly} className="space-y-6 disabled:opacity-60 disabled:pointer-events-none">

            {/* Wellbeing */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.wellbeingConcerns.hasIssues}
                  onChange={(e) => setFormData({
                    ...formData,
                    wellbeingConcerns: { hasIssues: e.target.checked, details: e.target.checked ? formData.wellbeingConcerns.details : undefined }
                  })}
                />
                Wellbeing concerns
              </label>
              {formData.wellbeingConcerns.hasIssues && (
                <textarea
                  value={formData.wellbeingConcerns.details || ''}
                  onChange={(e) => setFormData({ ...formData, wellbeingConcerns: { ...formData.wellbeingConcerns, details: e.target.value } })}
                  placeholder="Describe the wellbeing concerns..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Performance */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.performanceConcerns.hasIssues}
                  onChange={(e) => setFormData({
                    ...formData,
                    performanceConcerns: { hasIssues: e.target.checked, details: e.target.checked ? formData.performanceConcerns.details : undefined }
                  })}
                />
                Performance concerns
              </label>
              {formData.performanceConcerns.hasIssues && (
                <textarea
                  value={formData.performanceConcerns.details || ''}
                  onChange={(e) => setFormData({ ...formData, performanceConcerns: { ...formData.performanceConcerns, details: e.target.value } })}
                  placeholder="Describe the performance concerns..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Development */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.developmentOpportunities.hasOpportunities}
                  onChange={(e) => setFormData({
                    ...formData,
                    developmentOpportunities: { hasOpportunities: e.target.checked, details: e.target.checked ? formData.developmentOpportunities.details : undefined }
                  })}
                />
                Development opportunities
              </label>
              {formData.developmentOpportunities.hasOpportunities && (
                <textarea
                  value={formData.developmentOpportunities.details || ''}
                  onChange={(e) => setFormData({ ...formData, developmentOpportunities: { ...formData.developmentOpportunities, details: e.target.value } })}
                  placeholder="Describe the development opportunities..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Promotion readiness */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Promotion readiness</label>
              <div className="flex flex-wrap gap-4 mb-3">
                {Object.values(PromotionReadiness).map(r => (
                  <label key={r} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="promotionReadiness"
                      value={r}
                      checked={formData.promotionReadiness === r}
                      onChange={() => setFormData({ ...formData, promotionReadiness: r })}
                    />
                    {r}
                  </label>
                ))}
              </div>
              {(formData.promotionReadiness === PromotionReadiness.READY || formData.promotionReadiness === PromotionReadiness.NEAR_READY) && (
                <input
                  type="text"
                  value={formData.promotionTimeframe || ''}
                  onChange={(e) => setFormData({ ...formData, promotionTimeframe: e.target.value })}
                  placeholder="Timeframe, e.g. 6–12 months"
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action items</label>
              <div className="space-y-2">
                {(formData.actions || []).map((action, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={action}
                      onChange={(e) => {
                        const next = [...(formData.actions || [])];
                        next[i] = e.target.value;
                        setFormData({ ...formData, actions: next });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button type="button" onClick={() => removeAction(i)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    placeholder="Add action item..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
                  />
                  <button type="button" onClick={addAction} className="btn-hippo-cta p-2">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">General notes</label>
              <textarea
                value={formData.generalNotes || ''}
                onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
                rows={4}
                placeholder="Additional notes and observations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          </fieldset>
        </form>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 border-t bg-white flex justify-end gap-3">
        {readOnly ? (
          <button type="button" onClick={onCancel} className="btn-hippo text-sm">Close</button>
        ) : (
          <>
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
              Cancel
            </button>
            <button type="submit" form="review-form" className="btn-hippo-cta text-sm">
              Save review
            </button>
          </>
        )}
      </div>
    </div>
  );
}
