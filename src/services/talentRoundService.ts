import { TalentRound, RoundStatus, CreateRoundRequest, TalentRoundService, RoundSummary, BALevel } from '../types';
import { STORAGE_KEYS, saveToStorage, loadFromStorage, generateId } from '../utils/storage';
import { validateRoundData } from '../utils/validation';
import { getDaysUntilDeadline } from '../utils/date';
import { businessAnalystService } from './businessAnalystService';

class TalentRoundServiceImpl implements TalentRoundService {
  private talentRounds: TalentRound[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.talentRounds = loadFromStorage<TalentRound>(STORAGE_KEYS.TALENT_ROUNDS);
  }

  private saveData(): void {
    saveToStorage(STORAGE_KEYS.TALENT_ROUNDS, this.talentRounds);
  }

  getAll(): TalentRound[] {
    return [...this.talentRounds];
  }

  getById(id: string): TalentRound | null {
    return this.talentRounds.find(round => round.id === id) || null;
  }

  create(data: CreateRoundRequest): TalentRound {
    const validationErrors = validateRoundData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const existingRound = this.talentRounds.find(
      round => round.quarter === data.quarter && round.year === data.year
    );
    if (existingRound) {
      throw new Error('A round already exists for this quarter and year');
    }

    const now = new Date();
    const newRound: TalentRound = {
      id: generateId(),
      name: data.name.trim(),
      quarter: data.quarter.trim(),
      year: data.year,
      deadline: data.deadline,
      status: RoundStatus.DRAFT,
      createdBy: 'system',
      createdAt: now,
      description: data.description?.trim()
    };

    this.talentRounds.push(newRound);
    this.saveData();
    return newRound;
  }

  update(id: string, data: Partial<CreateRoundRequest>): TalentRound | null {
    const roundIndex = this.talentRounds.findIndex(round => round.id === id);
    if (roundIndex === -1) return null;

    const existingRound = this.talentRounds[roundIndex];
    if (existingRound.status === RoundStatus.COMPLETED) {
      throw new Error('Cannot edit completed rounds');
    }

    const updatedData = { ...existingRound, ...data };
    const validationErrors = validateRoundData({
      name: updatedData.name,
      quarter: updatedData.quarter,
      year: updatedData.year,
      deadline: updatedData.deadline,
      description: updatedData.description
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const updatedRound: TalentRound = {
      ...existingRound,
      ...data
    };

    this.talentRounds[roundIndex] = updatedRound;
    this.saveData();
    return updatedRound;
  }

  activate(id: string): TalentRound | null {
    const roundIndex = this.talentRounds.findIndex(round => round.id === id);
    if (roundIndex === -1) return null;

    const round = this.talentRounds[roundIndex];
    if (round.status !== RoundStatus.DRAFT) {
      throw new Error('Only draft rounds can be activated');
    }

    this.talentRounds[roundIndex] = {
      ...round,
      status: RoundStatus.ACTIVE
    };

    this.saveData();
    return this.talentRounds[roundIndex];
  }

  complete(id: string): TalentRound | null {
    const roundIndex = this.talentRounds.findIndex(round => round.id === id);
    if (roundIndex === -1) return null;

    const round = this.talentRounds[roundIndex];
    if (round.status !== RoundStatus.ACTIVE) {
      throw new Error('Only active rounds can be completed');
    }

    const summary = this.getRoundSummary(id);
    if (summary.completionPercentage < 100) {
      throw new Error('Cannot complete round with incomplete reviews');
    }

    this.talentRounds[roundIndex] = {
      ...round,
      status: RoundStatus.COMPLETED,
      completedAt: new Date()
    };

    this.saveData();
    return this.talentRounds[roundIndex];
  }

  getActive(): TalentRound[] {
    return this.talentRounds.filter(round => round.status === RoundStatus.ACTIVE);
  }

  getRoundSummary(id: string): RoundSummary {
    const round = this.getById(id);
    if (!round) {
      throw new Error('Round not found');
    }

    const allBAs = businessAnalystService.getAll().filter(ba => ba.isActive);
    const allReviews = loadFromStorage<any>(STORAGE_KEYS.REVIEWS);
    const roundReviews = allReviews.filter((review: any) => review.roundId === id);

    const reviewsByLevel: Record<BALevel, { total: number; completed: number }> = {
      [BALevel.PRINCIPAL]: { total: 0, completed: 0 },
      [BALevel.LEAD]: { total: 0, completed: 0 },
      [BALevel.SENIOR]: { total: 0, completed: 0 },
      [BALevel.INTERMEDIATE]: { total: 0, completed: 0 },
      [BALevel.CONSULTANT]: { total: 0, completed: 0 }
    };

    allBAs.forEach(ba => {
      reviewsByLevel[ba.level].total++;
      const review = roundReviews.find(r => r.businessAnalystId === ba.id);
      if (review && review.isComplete) {
        reviewsByLevel[ba.level].completed++;
      }
    });

    const totalBAs = allBAs.length;
    const completedReviews = roundReviews.filter(r => r.isComplete).length;
    const pendingReviews = totalBAs - completedReviews;
    const completionPercentage = totalBAs > 0 ? Math.round((completedReviews / totalBAs) * 100) : 0;

    return {
      roundId: id,
      totalBAs,
      completedReviews,
      pendingReviews,
      completionPercentage,
      reviewsByLevel
    };
  }

  getUpcomingDeadlines(): { roundId: string; roundName: string; deadline: Date; daysRemaining: number }[] {
    const activeRounds = this.getActive();
    
    return activeRounds
      .map(round => ({
        roundId: round.id,
        roundName: round.name,
        deadline: round.deadline,
        daysRemaining: getDaysUntilDeadline(round.deadline)
      }))
      .filter(item => item.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }
}

export const talentRoundService = new TalentRoundServiceImpl();