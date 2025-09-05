import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { businessAnalystService } from '../services/businessAnalystService';
import { talentRoundService } from '../services/talentRoundService';
import { reviewService } from '../services/reviewService';
import { BALevel, PromotionReadiness } from '../types';

// Mock all services to ensure clean state
vi.mock('../utils/storage', () => ({
  STORAGE_KEYS: {
    BUSINESS_ANALYSTS: 'tt_business_analysts',
    TALENT_ROUNDS: 'tt_talent_rounds',
    REVIEWS: 'tt_reviews',
    APP_CONFIG: 'tt_app_config'
  },
  saveToStorage: vi.fn(),
  loadFromStorage: vi.fn(() => []),
  generateId: (() => {
    let counter = 0;
    return () => `test-id-${++counter}`;
  })()
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear service data
    if (businessAnalystService['businessAnalysts']) {
      businessAnalystService['businessAnalysts'] = [];
    }
    if (talentRoundService['talentRounds']) {
      talentRoundService['talentRounds'] = [];
    }
    if (reviewService['reviews']) {
      reviewService['reviews'] = [];
    }
  });

  describe('Business Analyst Management Workflow', () => {
    it('should create, update, and manage business analysts', () => {
      // Create a business analyst
      const baData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        level: BALevel.SENIOR,
        department: 'Technology'
      };

      const newBA = businessAnalystService.create(baData);
      
      expect(newBA).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        level: BALevel.SENIOR,
        department: 'Technology',
        isActive: true
      });

      // Verify it's in the list
      const allBAs = businessAnalystService.getAll();
      expect(allBAs).toHaveLength(1);
      expect(allBAs[0]).toEqual(newBA);

      // Update the business analyst
      const updatedBA = businessAnalystService.update(newBA.id, {
        level: BALevel.PRINCIPAL,
        department: 'Digital'
      });

      expect(updatedBA).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.PRINCIPAL,
        department: 'Digital'
      });

      // Create a manager-subordinate relationship
      const managerData = {
        firstName: 'Manager',
        lastName: 'Boss',
        level: BALevel.PRINCIPAL
      };

      const manager = businessAnalystService.create(managerData);

      // Update subordinate to report to manager
      const subordinateUpdate = businessAnalystService.update(newBA.id, {
        lineManagerId: manager.id
      });

      expect(subordinateUpdate?.lineManagerId).toBe(manager.id);

      // Verify org chart structure
      const orgChart = businessAnalystService.getOrgChart();
      expect(orgChart).toHaveLength(1); // One root node (manager)
      expect(orgChart[0].ba).toEqual(manager);
      expect(orgChart[0].children).toHaveLength(1);
      expect(orgChart[0].children[0].ba.id).toBe(newBA.id);
    });

    it('should handle business analyst deactivation', () => {
      const ba = businessAnalystService.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      // Verify BA is active
      expect(ba.isActive).toBe(true);

      // Deactivate BA
      const result = businessAnalystService.deactivate(ba.id);
      expect(result).toBe(true);

      // Verify BA is now inactive
      const deactivatedBA = businessAnalystService.getById(ba.id);
      expect(deactivatedBA?.isActive).toBe(false);
    });
  });

  describe('Talent Round Management Workflow', () => {
    it('should create and manage talent rounds', () => {
      // Create a talent round
      const roundData = {
        name: 'Q1 2024 Review',
        quarter: 'Q1',
        year: 2024,
        deadline: new Date('2024-03-31'),
        description: 'Annual performance review'
      };

      const newRound = talentRoundService.create(roundData);
      
      expect(newRound).toMatchObject({
        name: 'Q1 2024 Review',
        quarter: 'Q1',
        year: 2024,
        status: 'Draft'
      });

      // Activate the round
      const activatedRound = talentRoundService.activate(newRound.id);
      expect(activatedRound?.status).toBe('Active');

      // Get active rounds
      const activeRounds = talentRoundService.getActive();
      expect(activeRounds).toHaveLength(1);
      expect(activeRounds[0]).toEqual(activatedRound);

      // Complete the round
      const completedRound = talentRoundService.complete(newRound.id);
      expect(completedRound?.status).toBe('Completed');
      expect(completedRound?.completedAt).toBeInstanceOf(Date);
    });

    it('should generate round summary correctly', () => {
      // Create BAs and round
      const ba1 = businessAnalystService.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      const ba2 = businessAnalystService.create({
        firstName: 'Jane',
        lastName: 'Smith',
        level: BALevel.PRINCIPAL
      });

      const round = talentRoundService.create({
        name: 'Test Round',
        quarter: 'Q1',
        year: 2024,
        deadline: new Date('2024-03-31')
      });

      // Create reviews
      reviewService.create({
        roundId: round.id,
        businessAnalystId: ba1.id,
        wellbeingConcerns: { hasIssues: false },
        performanceConcerns: { hasIssues: false },
        developmentOpportunities: { hasOpportunities: true, details: 'Leadership skills' },
        promotionReadiness: PromotionReadiness.READY
      });

      reviewService.create({
        roundId: round.id,
        businessAnalystId: ba2.id,
        wellbeingConcerns: { hasIssues: false },
        performanceConcerns: { hasIssues: false },
        developmentOpportunities: { hasOpportunities: false },
        promotionReadiness: PromotionReadiness.NOT_READY
      });

      // Get round summary
      const summary = talentRoundService.getRoundSummary(round.id);
      
      expect(summary).toMatchObject({
        roundId: round.id,
        totalBAs: 2,
        completedReviews: 0, // Neither review is marked complete
        pendingReviews: 2,
        completionPercentage: 0
      });

      expect(summary.reviewsByLevel[BALevel.SENIOR]).toMatchObject({
        total: 1,
        completed: 0
      });

      expect(summary.reviewsByLevel[BALevel.PRINCIPAL]).toMatchObject({
        total: 1,
        completed: 0
      });
    });
  });

  describe('Review Management Workflow', () => {
    it('should create and manage reviews', () => {
      // Setup data
      const ba = businessAnalystService.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      const round = talentRoundService.create({
        name: 'Test Round',
        quarter: 'Q1',
        year: 2024,
        deadline: new Date('2024-03-31')
      });

      // Create review
      const reviewData = {
        roundId: round.id,
        businessAnalystId: ba.id,
        wellbeingConcerns: { hasIssues: true, details: 'Stress concerns' },
        performanceConcerns: { hasIssues: false },
        developmentOpportunities: { hasOpportunities: true, details: 'Leadership training' },
        promotionReadiness: PromotionReadiness.NEAR_READY,
        promotionTimeframe: '6-12 months',
        actions: ['Complete certification', 'Attend leadership course'],
        generalNotes: 'Strong performer with growth potential'
      };

      const review = reviewService.create(reviewData);
      
      expect(review).toMatchObject({
        roundId: round.id,
        businessAnalystId: ba.id,
        wellbeingConcerns: { hasIssues: true, details: 'Stress concerns' },
        performanceConcerns: { hasIssues: false },
        developmentOpportunities: { hasOpportunities: true, details: 'Leadership training' },
        promotionReadiness: PromotionReadiness.NEAR_READY,
        isComplete: false
      });

      // Update review
      const updatedReview = reviewService.update(review.id, {
        retentionConcerns: { hasIssues: false },
        reviewNotes: 'Additional review notes',
        recommendations: ['Consider for promotion next cycle']
      });

      expect(updatedReview).toMatchObject({
        retentionConcerns: { hasIssues: false },
        reviewNotes: 'Additional review notes',
        recommendations: ['Consider for promotion next cycle']
      });

      // Get review by BA and round
      const foundReview = reviewService.getByBAAndRound(ba.id, round.id);
      expect(foundReview).toEqual(updatedReview);
    });

    it('should track historical trends', () => {
      const ba = businessAnalystService.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      // Create multiple rounds and reviews for trend analysis
      const round1 = talentRoundService.create({
        name: 'Q1 2023 Review',
        quarter: 'Q1',
        year: 2023,
        deadline: new Date('2023-03-31')
      });

      const round2 = talentRoundService.create({
        name: 'Q3 2023 Review',
        quarter: 'Q3',
        year: 2023,
        deadline: new Date('2023-09-30')
      });

      // Create reviews showing improvement over time
      reviewService.create({
        roundId: round1.id,
        businessAnalystId: ba.id,
        wellbeingConcerns: { hasIssues: true, details: 'High stress' },
        performanceConcerns: { hasIssues: true, details: 'Missing deadlines' },
        developmentOpportunities: { hasOpportunities: true, details: 'Time management' },
        promotionReadiness: PromotionReadiness.NOT_READY,
        actions: ['Time management training']
      });

      reviewService.create({
        roundId: round2.id,
        businessAnalystId: ba.id,
        wellbeingConcerns: { hasIssues: false },
        performanceConcerns: { hasIssues: false },
        developmentOpportunities: { hasOpportunities: true, details: 'Leadership skills' },
        promotionReadiness: PromotionReadiness.READY,
        actions: ['Leadership course']
      });

      // Get historical trend
      const trend = reviewService.getHistoricalTrend(ba.id);
      
      expect(trend.baId).toBe(ba.id);
      expect(trend.reviews).toHaveLength(2);
      expect(trend.trend).toBe('Improving'); // Should detect improvement
      
      // Check review data
      const firstReview = trend.reviews.find(r => r.roundName === 'Q1 2023 Review');
      const secondReview = trend.reviews.find(r => r.roundName === 'Q3 2023 Review');
      
      expect(firstReview?.promotionReadiness).toBe(PromotionReadiness.NOT_READY);
      expect(secondReview?.promotionReadiness).toBe(PromotionReadiness.READY);
    });
  });

  describe('End-to-End Workflow', () => {
    it('should handle complete talent management workflow', () => {
      // 1. Create business analysts
      const manager = businessAnalystService.create({
        firstName: 'Sarah',
        lastName: 'Manager',
        level: BALevel.PRINCIPAL,
        department: 'Technology'
      });

      const ba1 = businessAnalystService.create({
        firstName: 'John',
        lastName: 'Developer',
        level: BALevel.SENIOR,
        lineManagerId: manager.id
      });

      const ba2 = businessAnalystService.create({
        firstName: 'Jane',
        lastName: 'Analyst',
        level: BALevel.INTERMEDIATE,
        lineManagerId: manager.id
      });

      // 2. Create talent round
      const round = talentRoundService.create({
        name: 'Q1 2024 Performance Review',
        quarter: 'Q1',
        year: 2024,
        deadline: new Date('2024-03-31')
      });

      const activatedRound = talentRoundService.activate(round.id);
      expect(activatedRound?.status).toBe('Active');

      // 3. Create reviews for each BA
      const review1 = reviewService.create({
        roundId: round.id,
        businessAnalystId: ba1.id,
        wellbeingConcerns: { hasIssues: false },
        performanceConcerns: { hasIssues: false },
        developmentOpportunities: { hasOpportunities: true, details: 'Technical leadership' },
        promotionReadiness: PromotionReadiness.READY,
        actions: ['Lead next project', 'Mentor junior developers']
      });

      const review2 = reviewService.create({
        roundId: round.id,
        businessAnalystId: ba2.id,
        wellbeingConcerns: { hasIssues: false },
        performanceConcerns: { hasIssues: false },
        developmentOpportunities: { hasOpportunities: true, details: 'Advanced analytics skills' },
        promotionReadiness: PromotionReadiness.NEAR_READY,
        promotionTimeframe: '3-6 months',
        actions: ['Complete advanced SQL course', 'Work on complex analysis project']
      });

      // 4. Complete reviews
      reviewService.update(review1.id, { 
        isComplete: true,
        completedAt: new Date(),
        reviewNotes: 'Excellent performance, ready for promotion'
      });

      reviewService.update(review2.id, { 
        isComplete: true,
        completedAt: new Date(),
        reviewNotes: 'Strong progress, needs more experience'
      });

      // 5. Generate round summary
      const summary = talentRoundService.getRoundSummary(round.id);
      
      expect(summary).toMatchObject({
        totalBAs: 2,
        completedReviews: 2,
        pendingReviews: 0,
        completionPercentage: 100
      });

      // 6. Complete the round
      const completedRound = talentRoundService.complete(round.id);
      expect(completedRound?.status).toBe('Completed');

      // 7. Verify all data is properly linked
      const ba1Reviews = reviewService.getByBA(ba1.id);
      const ba2Reviews = reviewService.getByBA(ba2.id);
      const roundReviews = reviewService.getByRound(round.id);

      expect(ba1Reviews).toHaveLength(1);
      expect(ba2Reviews).toHaveLength(1);
      expect(roundReviews).toHaveLength(2);

      // 8. Verify organizational structure
      const orgChart = businessAnalystService.getOrgChart();
      expect(orgChart).toHaveLength(1);
      expect(orgChart[0].ba).toEqual(manager);
      expect(orgChart[0].children).toHaveLength(2);
    });
  });
});