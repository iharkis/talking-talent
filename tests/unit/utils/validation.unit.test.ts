import { describe, it, expect } from 'vitest';
import { validateBAData, validateRoundData, validateReviewData } from '../../../src/utils/validation';
import { BALevel, PromotionReadiness } from '../../../src/types';

describe('validation.ts - Unit Tests', () => {
  describe('validateBAData', () => {
    const validBAData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      level: BALevel.SENIOR,
      department: 'Technology'
    };

    it('should return no errors for valid data', () => {
      const errors = validateBAData(validBAData);
      expect(errors).toEqual([]);
    });

    it('should require first name', () => {
      const data = { ...validBAData, firstName: '' };
      const errors = validateBAData(data);
      expect(errors).toContain('First name is required');
    });

    it('should require first name even with whitespace', () => {
      const data = { ...validBAData, firstName: '   ' };
      const errors = validateBAData(data);
      expect(errors).toContain('First name is required');
    });

    it('should require last name', () => {
      const data = { ...validBAData, lastName: '' };
      const errors = validateBAData(data);
      expect(errors).toContain('Last name is required');
    });

    it('should require last name even with whitespace', () => {
      const data = { ...validBAData, lastName: '   ' };
      const errors = validateBAData(data);
      expect(errors).toContain('Last name is required');
    });

    it('should validate email format when provided', () => {
      const data = { ...validBAData, email: 'invalid-email' };
      const errors = validateBAData(data);
      expect(errors).toContain('Valid email address is required');
    });

    it('should accept valid email formats', () => {
      const testEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstname+lastname@company.org'
      ];

      testEmails.forEach(email => {
        const data = { ...validBAData, email };
        const errors = validateBAData(data);
        expect(errors).not.toContain('Valid email address is required');
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain'
      ];

      invalidEmails.forEach(email => {
        const data = { ...validBAData, email };
        const errors = validateBAData(data);
        expect(errors).toContain('Valid email address is required');
      });
    });

    it('should require valid level', () => {
      const data = { ...validBAData, level: 'INVALID_LEVEL' as any };
      const errors = validateBAData(data);
      expect(errors).toContain('Valid level is required');
    });

    it('should accept all valid BA levels', () => {
      Object.values(BALevel).forEach(level => {
        const data = { ...validBAData, level };
        const errors = validateBAData(data);
        expect(errors).not.toContain('Valid level is required');
      });
    });

    it('should allow optional email field', () => {
      const data = { ...validBAData };
      delete data.email;
      const errors = validateBAData(data);
      expect(errors).toEqual([]);
    });
  });

  describe('validateRoundData', () => {
    const validRoundData = {
      name: 'Q1 2025 Review',
      quarter: 'Q1',
      year: 2025,
      deadline: new Date('2025-12-31'),
      description: 'Annual review'
    };

    it('should return no errors for valid data', () => {
      const errors = validateRoundData(validRoundData);
      expect(errors).toEqual([]);
    });

    it('should require round name', () => {
      const data = { ...validRoundData, name: '' };
      const errors = validateRoundData(data);
      expect(errors).toContain('Round name is required');
    });

    it('should require round name even with whitespace', () => {
      const data = { ...validRoundData, name: '   ' };
      const errors = validateRoundData(data);
      expect(errors).toContain('Round name is required');
    });

    it('should require quarter', () => {
      const data = { ...validRoundData, quarter: '' };
      const errors = validateRoundData(data);
      expect(errors).toContain('Quarter is required');
    });

    it('should require quarter even with whitespace', () => {
      const data = { ...validRoundData, quarter: '   ' };
      const errors = validateRoundData(data);
      expect(errors).toContain('Quarter is required');
    });

    it('should validate year range - too old', () => {
      const data = { ...validRoundData, year: 2019 };
      const errors = validateRoundData(data);
      expect(errors).toContain('Valid year is required');
    });

    it('should validate year range - too far future', () => {
      const data = { ...validRoundData, year: 2051 };
      const errors = validateRoundData(data);
      expect(errors).toContain('Valid year is required');
    });

    it('should accept valid year range', () => {
      const validYears = [2020, 2025, 2030, 2050];
      
      validYears.forEach(year => {
        const data = { ...validRoundData, year };
        const errors = validateRoundData(data);
        expect(errors).not.toContain('Valid year is required');
      });
    });

    it('should require deadline', () => {
      const data = { ...validRoundData, deadline: null as any };
      const errors = validateRoundData(data);
      expect(errors).toContain('Deadline is required');
    });

    it('should reject past deadlines', () => {
      const pastDate = new Date('2020-01-01');
      const data = { ...validRoundData, deadline: pastDate };
      const errors = validateRoundData(data);
      expect(errors).toContain('Deadline cannot be in the past');
    });

    it('should accept today as deadline', () => {
      const today = new Date();
      const data = { ...validRoundData, deadline: today };
      const errors = validateRoundData(data);
      expect(errors).not.toContain('Deadline cannot be in the past');
    });

    it('should accept future deadlines', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const data = { ...validRoundData, deadline: futureDate };
      const errors = validateRoundData(data);
      expect(errors).not.toContain('Deadline cannot be in the past');
    });
  });

  describe('validateReviewData', () => {
    const validReviewData = {
      roundId: 'round-1',
      businessAnalystId: 'ba-1',
      wellbeingConcerns: { hasIssues: false },
      performanceConcerns: { hasIssues: false },
      developmentOpportunities: { hasOpportunities: false },
      promotionReadiness: PromotionReadiness.READY
    };

    it('should return no errors for valid data', () => {
      const errors = validateReviewData(validReviewData);
      expect(errors).toEqual([]);
    });

    it('should require roundId', () => {
      const data = { ...validReviewData, roundId: '' };
      const errors = validateReviewData(data);
      expect(errors).toContain('Round ID is required');
    });

    it('should require businessAnalystId', () => {
      const data = { ...validReviewData, businessAnalystId: '' };
      const errors = validateReviewData(data);
      expect(errors).toContain('Business Analyst ID is required');
    });

    it('should require wellbeing details when issues are flagged', () => {
      const data = {
        ...validReviewData,
        wellbeingConcerns: { hasIssues: true, details: '' }
      };
      const errors = validateReviewData(data);
      expect(errors).toContain('Wellbeing concerns details are required when issues are indicated');
    });

    it('should require wellbeing details even with whitespace when issues are flagged', () => {
      const data = {
        ...validReviewData,
        wellbeingConcerns: { hasIssues: true, details: '   ' }
      };
      const errors = validateReviewData(data);
      expect(errors).toContain('Wellbeing concerns details are required when issues are indicated');
    });

    it('should require performance details when issues are flagged', () => {
      const data = {
        ...validReviewData,
        performanceConcerns: { hasIssues: true, details: '' }
      };
      const errors = validateReviewData(data);
      expect(errors).toContain('Performance concerns details are required when issues are indicated');
    });

    it('should require development details when opportunities are flagged', () => {
      const data = {
        ...validReviewData,
        developmentOpportunities: { hasOpportunities: true, details: '' }
      };
      const errors = validateReviewData(data);
      expect(errors).toContain('Development opportunities details are required when opportunities are indicated');
    });

    it('should not require details when no issues/opportunities are flagged', () => {
      const data = {
        ...validReviewData,
        wellbeingConcerns: { hasIssues: false },
        performanceConcerns: { hasIssues: false },
        developmentOpportunities: { hasOpportunities: false }
      };
      const errors = validateReviewData(data);
      expect(errors).toEqual([]);
    });

    it('should accept valid details when issues/opportunities are flagged', () => {
      const data = {
        ...validReviewData,
        wellbeingConcerns: { hasIssues: true, details: 'High stress levels' },
        performanceConcerns: { hasIssues: true, details: 'Missed deadlines' },
        developmentOpportunities: { hasOpportunities: true, details: 'Leadership training' }
      };
      const errors = validateReviewData(data);
      expect(errors).toEqual([]);
    });

    it('should handle multiple validation errors', () => {
      const data = {
        ...validReviewData,
        roundId: '',
        businessAnalystId: '',
        wellbeingConcerns: { hasIssues: true, details: '' }
      };
      const errors = validateReviewData(data);
      
      expect(errors).toContain('Round ID is required');
      expect(errors).toContain('Business Analyst ID is required');
      expect(errors).toContain('Wellbeing concerns details are required when issues are indicated');
      expect(errors).toHaveLength(3);
    });
  });
});