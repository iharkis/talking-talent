import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

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

// Mock data helpers
export const createMockBA = (overrides = {}) => ({
  id: 'test-ba-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  level: 'Senior',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockRound = (overrides = {}) => ({
  id: 'test-round-1',
  name: 'Q1 2024 Review',
  quarter: 'Q1',
  year: 2024,
  deadline: new Date('2024-03-31'),
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
  promotionReadiness: 'Ready',
  actions: ['Complete certification'],
  isComplete: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export * from '@testing-library/react';
export { customRender as render };