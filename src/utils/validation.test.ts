import { describe, it, expect, beforeEach } from 'vitest';
import { validateBAData, validateRoundData, validateReviewData } from './validation';
import { BALevel } from '../types';

describe('Validation Utils', () => {
  describe('validateBAData', () => {
    it('should return no errors for valid BA data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        level: BALevel.SENIOR,
        department: 'Technology',
      };

      const errors = validateBAData(validData);
      expect(errors).toEqual([]);
    });

    it('should require first name', () => {
      const data = {
        firstName: '',
        lastName: 'Doe',
        level: BALevel.SENIOR,
      };

      const errors = validateBAData(data);
      expect(errors).toContain('First name is required');
    });

    it('should require last name', () => {
      const data = {
        firstName: 'John',
        lastName: '',
        level: BALevel.SENIOR,
      };

      const errors = validateBAData(data);
      expect(errors).toContain('Last name is required');
    });

    it('should require valid level', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        level: 'INVALID_LEVEL' as any,
      };

      const errors = validateBAData(data);
      expect(errors).toContain('Valid level is required');
    });

    it('should validate email format when provided', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        level: BALevel.SENIOR,
      };

      const errors = validateBAData(data);
      expect(errors).toContain('Valid email address is required');
    });

    it('should accept valid email format', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        level: BALevel.SENIOR,
      };

      const errors = validateBAData(data);
      expect(errors).not.toContain('Valid email address is required');
    });

    it('should trim whitespace from names', () => {
      const data = {
        firstName: '  ',
        lastName: '  ',
        level: BALevel.SENIOR,
      };

      const errors = validateBAData(data);
      expect(errors).toContain('First name is required');
      expect(errors).toContain('Last name is required');
    });
  });

  describe('validateRoundData', () => {
    const futureDate = new Date('2025-12-31');

    it('should return no errors for valid round data', () => {
      const validData = {
        name: 'Q4 2024 Review',
        quarter: 'Q4',
        year: 2024,
        deadline: futureDate,
        description: 'Annual review round',
      };

      const errors = validateRoundData(validData);
      expect(errors).toEqual([]);
    });

    it('should require round name', () => {
      const data = {
        name: '',
        quarter: 'Q4',
        year: 2024,
        deadline: futureDate,
      };

      const errors = validateRoundData(data);
      expect(errors).toContain('Round name is required');
    });

    it('should require quarter', () => {
      const data = {
        name: 'Q4 2024 Review',
        quarter: '',
        year: 2024,
        deadline: futureDate,
      };

      const errors = validateRoundData(data);
      expect(errors).toContain('Quarter is required');
    });

    it('should require valid year', () => {
      const data = {
        name: 'Q4 2024 Review',
        quarter: 'Q4',
        year: 2010, // Too old
        deadline: futureDate,
      };

      const errors = validateRoundData(data);
      expect(errors).toContain('Valid year is required');
    });

    it('should reject future years beyond 2050', () => {
      const data = {
        name: 'Q4 2024 Review',
        quarter: 'Q4',
        year: 2055,
        deadline: futureDate,
      };

      const errors = validateRoundData(data);
      expect(errors).toContain('Valid year is required');
    });

    it('should require deadline', () => {
      const data = {
        name: 'Q4 2024 Review',
        quarter: 'Q4',
        year: 2024,
        deadline: null as any,
      };

      const errors = validateRoundData(data);
      expect(errors).toContain('Deadline is required');
    });

    it('should reject past deadlines', () => {
      const pastDate = new Date('2020-01-01');
      const data = {
        name: 'Q4 2024 Review',
        quarter: 'Q4',
        year: 2024,
        deadline: pastDate,
      };

      const errors = validateRoundData(data);
      expect(errors).toContain('Deadline cannot be in the past');
    });

    it('should allow today as deadline', () => {
      const today = new Date();
      const data = {
        name: 'Q4 2024 Review',
        quarter: 'Q4',
        year: 2024,
        deadline: today,
      };

      const errors = validateRoundData(data);
      expect(errors).not.toContain('Deadline cannot be in the past');
    });
  });

  describe('validateReviewData', () => {
    const baseReviewData = {
      roundId: 'round-1',
      businessAnalystId: 'ba-1',
      wellbeingConcerns: { hasIssues: false },
      performanceConcerns: { hasIssues: false },
      developmentOpportunities: { hasOpportunities: false },
      promotionReadiness: 'Ready' as const,
    };

    it('should return no errors for valid review data', () => {
      const errors = validateReviewData(baseReviewData);
      expect(errors).toEqual([]);
    });

    it('should require roundId', () => {
      const data = { ...baseReviewData, roundId: '' };
      const errors = validateReviewData(data);
      expect(errors).toContain('Round ID is required');
    });

    it('should require businessAnalystId', () => {
      const data = { ...baseReviewData, businessAnalystId: '' };
      const errors = validateReviewData(data);
      expect(errors).toContain('Business Analyst ID is required');
    });

    it('should require wellbeing details when issues are indicated', () => {
      const data = {
        ...baseReviewData,
        wellbeingConcerns: { hasIssues: true, details: '' },
      };
      const errors = validateReviewData(data);
      expect(errors).toContain('Wellbeing concerns details are required when issues are indicated');
    });

    it('should require performance details when issues are indicated', () => {
      const data = {
        ...baseReviewData,
        performanceConcerns: { hasIssues: true, details: '' },
      };
      const errors = validateReviewData(data);
      expect(errors).toContain('Performance concerns details are required when issues are indicated');
    });

    it('should require development details when opportunities are indicated', () => {
      const data = {
        ...baseReviewData,
        developmentOpportunities: { hasOpportunities: true, details: '' },
      };
      const errors = validateReviewData(data);
      expect(errors).toContain('Development opportunities details are required when opportunities are indicated');
    });

    it('should not require details when no issues/opportunities are indicated', () => {
      const data = {
        ...baseReviewData,
        wellbeingConcerns: { hasIssues: false },
        performanceConcerns: { hasIssues: false },
        developmentOpportunities: { hasOpportunities: false },
      };
      const errors = validateReviewData(data);
      expect(errors).toEqual([]);
    });

    it('should accept valid details when issues are indicated', () => {
      const data = {
        ...baseReviewData,
        wellbeingConcerns: { hasIssues: true, details: 'Burnout concerns' },
        performanceConcerns: { hasIssues: true, details: 'Missing deadlines' },
        developmentOpportunities: { hasOpportunities: true, details: 'Leadership training' },
      };
      const errors = validateReviewData(data);
      expect(errors).toEqual([]);
    });
  });
});