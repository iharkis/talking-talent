import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BALevel, PromotionReadiness } from '../../src/types';

// Custom render function that includes common providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock data helpers for consistent testing
export const createMockBA = (overrides = {}) => ({
  id: 'test-ba-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  level: BALevel.SENIOR,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockRound = (overrides = {}) => ({
  id: 'test-round-1',
  name: 'Q1 2025 Review',
  quarter: 'Q1',
  year: 2025,
  deadline: new Date('2025-03-31'),
  status: 'Active',
  createdBy: 'admin',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockReview = (overrides = {}) => ({
  id: 'test-review-1',
  roundId: 'test-round-1',
  businessAnalystId: 'test-ba-1',
  wellbeingConcerns: { hasIssues: false },
  performanceConcerns: { hasIssues: false },
  developmentOpportunities: { hasOpportunities: true, details: 'Leadership skills' },
  retentionConcerns: { hasIssues: false },
  promotionReadiness: PromotionReadiness.READY,
  actions: ['Complete certification'],
  isComplete: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Mock data collections
export const createMockBAList = (count = 3) => {
  return Array.from({ length: count }, (_, i) => 
    createMockBA({
      id: `test-ba-${i + 1}`,
      firstName: `User${i + 1}`,
      lastName: `Test${i + 1}`,
      email: `user${i + 1}@example.com`,
      level: Object.values(BALevel)[i % Object.values(BALevel).length]
    })
  );
};

export const createMockRoundList = (count = 2) => {
  return Array.from({ length: count }, (_, i) => 
    createMockRound({
      id: `test-round-${i + 1}`,
      name: `Q${i + 1} 2025 Review`,
      quarter: `Q${i + 1}`,
    })
  );
};

export const createMockReviewList = (count = 2) => {
  return Array.from({ length: count }, (_, i) => 
    createMockReview({
      id: `test-review-${i + 1}`,
      businessAnalystId: `test-ba-${i + 1}`,
      promotionReadiness: Object.values(PromotionReadiness)[i % Object.values(PromotionReadiness).length]
    })
  );
};

// Validation test data helpers
export const createValidBAData = (overrides = {}) => ({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  level: BALevel.SENIOR,
  department: 'Technology',
  ...overrides,
});

export const createValidRoundData = (overrides = {}) => ({
  name: 'Q1 2025 Review',
  quarter: 'Q1',
  year: 2025,
  deadline: new Date('2025-03-31'),
  description: 'Annual review',
  ...overrides,
});

export const createValidReviewData = (overrides = {}) => ({
  roundId: 'round-1',
  businessAnalystId: 'ba-1',
  wellbeingConcerns: { hasIssues: false },
  performanceConcerns: { hasIssues: false },
  developmentOpportunities: { hasOpportunities: false },
  promotionReadiness: PromotionReadiness.READY,
  ...overrides,
});

// Test constants
export const TEST_CONSTANTS = {
  DATES: {
    PAST_DATE: new Date('2020-01-01'),
    CURRENT_DATE: new Date('2024-08-10T10:00:00.000Z'), // From setup.ts
    FUTURE_DATE: new Date('2025-12-31'),
  },
  IDS: {
    VALID_ID: 'test-id-123',
    INVALID_ID: 'non-existent-id',
    EMPTY_ID: '',
  },
  EMAILS: {
    VALID: 'test@example.com',
    INVALID: 'invalid-email',
  }
};

// Common test patterns
export const expectValidationError = (errors: string[], message: string) => {
  expect(errors).toContain(message);
};

export const expectNoValidationErrors = (errors: string[]) => {
  expect(errors).toEqual([]);
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };