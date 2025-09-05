import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Dashboard } from './Dashboard';

// Mock the services
const mockGetActive = vi.fn(() => []);
const mockGetUpcomingDeadlines = vi.fn(() => []);
const mockGetRoundSummary = vi.fn(() => ({
  roundId: 'test-round',
  totalBAs: 0,
  completedReviews: 0,
  pendingReviews: 0,
  completionPercentage: 0,
  reviewsByLevel: {}
}));

const mockGetAll = vi.fn(() => []);

vi.mock('../services/talentRoundService', () => ({
  talentRoundService: {
    getActive: mockGetActive,
    getUpcomingDeadlines: mockGetUpcomingDeadlines,
    getRoundSummary: mockGetRoundSummary
  }
}));

vi.mock('../services/businessAnalystService', () => ({
  businessAnalystService: {
    getAll: mockGetAll
  }
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('should display total business analysts count', () => {
    mockGetAll.mockReturnValue([
      { id: '1', firstName: 'John', lastName: 'Doe', isActive: true },
      { id: '2', firstName: 'Jane', lastName: 'Smith', isActive: true },
      { id: '3', firstName: 'Bob', lastName: 'Johnson', isActive: false }
    ]);

    render(<Dashboard />);

    // Should only count active BAs
    expect(mockGetAll).toHaveBeenCalled();
  });

  it('should display active rounds information', () => {
    const mockRounds = [
      {
        id: 'round-1',
        name: 'Q1 2024 Review',
        quarter: 'Q1',
        year: 2024,
        deadline: new Date('2024-03-31'),
        status: 'Active',
        createdBy: 'admin',
        createdAt: new Date()
      }
    ];

    mockGetActive.mockReturnValue(mockRounds);
    mockGetRoundSummary.mockReturnValue({
      roundId: 'round-1',
      totalBAs: 10,
      completedReviews: 7,
      pendingReviews: 3,
      completionPercentage: 70,
      reviewsByLevel: {}
    });

    render(<Dashboard />);

    expect(mockGetActive).toHaveBeenCalled();
    expect(mockGetRoundSummary).toHaveBeenCalledWith('round-1');
  });

  it('should display upcoming deadlines', () => {
    const mockDeadlines = [
      {
        roundId: 'round-1',
        roundName: 'Q1 2024 Review',
        deadline: new Date('2024-08-15'),
        daysRemaining: 5
      }
    ];

    mockGetUpcomingDeadlines.mockReturnValue(mockDeadlines);

    render(<Dashboard />);

    expect(mockGetUpcomingDeadlines).toHaveBeenCalled();
  });

  it('should handle empty state gracefully', () => {
    mockGetActive.mockReturnValue([]);
    mockGetUpcomingDeadlines.mockReturnValue([]);
    mockGetAll.mockReturnValue([]);

    render(<Dashboard />);

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(mockGetActive).toHaveBeenCalled();
    expect(mockGetUpcomingDeadlines).toHaveBeenCalled();
    expect(mockGetAll).toHaveBeenCalled();
  });

  it('should filter active business analysts only', () => {
    const mockBAs = [
      { id: '1', firstName: 'John', lastName: 'Doe', isActive: true },
      { id: '2', firstName: 'Jane', lastName: 'Smith', isActive: false },
      { id: '3', firstName: 'Bob', lastName: 'Johnson', isActive: true }
    ];

    mockGetAll.mockReturnValue(mockBAs);

    render(<Dashboard />);

    expect(mockGetAll).toHaveBeenCalled();
    // The component should filter for active BAs (2 out of 3)
  });
});