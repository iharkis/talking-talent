import { Review, CreateReviewRequest, ReviewService, HistoricalTrend, PromotionReadiness } from '../types';
import { STORAGE_KEYS, saveToStorage, loadFromStorage, generateId } from '../utils/storage';
import { validateReviewData } from '../utils/validation';

class ReviewServiceImpl implements ReviewService {
  private reviews: Review[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.reviews = loadFromStorage<Review>(STORAGE_KEYS.REVIEWS);
  }

  private saveData(): void {
    saveToStorage(STORAGE_KEYS.REVIEWS, this.reviews);
  }

  getAll(): Review[] {
    return [...this.reviews];
  }

  getById(id: string): Review | null {
    return this.reviews.find(review => review.id === id) || null;
  }

  create(data: CreateReviewRequest): Review {
    const validationErrors = validateReviewData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const existingReview = this.getByBAAndRound(data.businessAnalystId, data.roundId);
    if (existingReview) {
      throw new Error('Review already exists for this BA and round');
    }

    const now = new Date();
    const newReview: Review = {
      id: generateId(),
      roundId: data.roundId,
      businessAnalystId: data.businessAnalystId,
      reviewerId: data.reviewerId,
      wellbeingConcerns: {
        hasIssues: data.wellbeingConcerns.hasIssues,
        details: data.wellbeingConcerns.details?.trim()
      },
      performanceConcerns: {
        hasIssues: data.performanceConcerns.hasIssues,
        details: data.performanceConcerns.details?.trim()
      },
      developmentOpportunities: {
        hasOpportunities: data.developmentOpportunities.hasOpportunities,
        details: data.developmentOpportunities.details?.trim()
      },
      promotionReadiness: data.promotionReadiness,
      actions: data.actions?.filter(action => action.trim()) || [],
      generalNotes: data.generalNotes?.trim(),
      isComplete: this.isReviewComplete(data),
      createdAt: now,
      updatedAt: now
    };

    if (newReview.isComplete) {
      newReview.completedAt = now;
    }

    this.reviews.push(newReview);
    this.saveData();
    return newReview;
  }

  update(id: string, data: Partial<CreateReviewRequest>): Review | null {
    const reviewIndex = this.reviews.findIndex(review => review.id === id);
    if (reviewIndex === -1) return null;

    const existingReview = this.reviews[reviewIndex];
    const updatedData = {
      roundId: data.roundId || existingReview.roundId,
      businessAnalystId: data.businessAnalystId || existingReview.businessAnalystId,
      reviewerId: data.reviewerId || existingReview.reviewerId,
      wellbeingConcerns: data.wellbeingConcerns || existingReview.wellbeingConcerns,
      performanceConcerns: data.performanceConcerns || existingReview.performanceConcerns,
      developmentOpportunities: data.developmentOpportunities || existingReview.developmentOpportunities,
      promotionReadiness: data.promotionReadiness || existingReview.promotionReadiness,
      actions: data.actions || existingReview.actions,
      generalNotes: data.generalNotes || existingReview.generalNotes
    };

    const validationErrors = validateReviewData(updatedData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const now = new Date();
    const isComplete = this.isReviewComplete(updatedData);
    
    const updatedReview: Review = {
      ...existingReview,
      ...data,
      isComplete,
      completedAt: isComplete && !existingReview.isComplete ? now : existingReview.completedAt,
      updatedAt: now
    };

    this.reviews[reviewIndex] = updatedReview;
    this.saveData();
    return updatedReview;
  }

  getByRound(roundId: string): Review[] {
    return this.reviews.filter(review => review.roundId === roundId);
  }

  getByBA(baId: string): Review[] {
    return this.reviews.filter(review => review.businessAnalystId === baId);
  }

  getByBAAndRound(baId: string, roundId: string): Review | null {
    return this.reviews.find(
      review => review.businessAnalystId === baId && review.roundId === roundId
    ) || null;
  }

  getHistoricalTrend(baId: string): HistoricalTrend {
    const baReviews = this.getByBA(baId);
    
    if (baReviews.length === 0) {
      return {
        baId,
        reviews: [],
        trend: 'New'
      };
    }

    const reviewData = baReviews
      .filter(review => review.isComplete)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(review => ({
        roundName: `Round ${review.roundId}`,
        date: review.createdAt,
        promotionReadiness: review.promotionReadiness,
        concerns: {
          wellbeing: review.wellbeingConcerns.hasIssues,
          performance: review.performanceConcerns.hasIssues
        },
        actionCount: review.actions.length
      }));

    const trend = this.calculateTrend(reviewData);

    return {
      baId,
      reviews: reviewData,
      trend
    };
  }

  private isReviewComplete(data: CreateReviewRequest | Partial<CreateReviewRequest>): boolean {
    if (!data.promotionReadiness) return false;
    
    if (data.wellbeingConcerns?.hasIssues && !data.wellbeingConcerns.details?.trim()) {
      return false;
    }
    
    if (data.performanceConcerns?.hasIssues && !data.performanceConcerns.details?.trim()) {
      return false;
    }
    
    if (data.developmentOpportunities?.hasOpportunities && !data.developmentOpportunities.details?.trim()) {
      return false;
    }

    return true;
  }

  private calculateTrend(reviews: HistoricalTrend['reviews']): HistoricalTrend['trend'] {
    if (reviews.length < 2) return 'New';

    const recent = reviews.slice(-2);
    const [previous, current] = recent;

    const promotionReadinessScore = (readiness: PromotionReadiness): number => {
      switch (readiness) {
        case PromotionReadiness.READY: return 3;
        case PromotionReadiness.NEAR_READY: return 2;
        case PromotionReadiness.NOT_READY: return 1;
        default: return 1;
      }
    };

    const previousScore = promotionReadinessScore(previous.promotionReadiness);
    const currentScore = promotionReadinessScore(current.promotionReadiness);

    const concernsChanged = (
      previous.concerns.wellbeing !== current.concerns.wellbeing ||
      previous.concerns.performance !== current.concerns.performance
    );

    if (currentScore > previousScore || (!concernsChanged && current.actionCount < previous.actionCount)) {
      return 'Improving';
    } else if (currentScore < previousScore || concernsChanged) {
      return 'Declining';
    } else {
      return 'Stable';
    }
  }
}

export const reviewService = new ReviewServiceImpl();