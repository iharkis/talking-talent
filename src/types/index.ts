export const BALevel = {
  PRINCIPAL: 'Principal',
  LEAD: 'Lead',
  SENIOR: 'Senior', 
  INTERMEDIATE: 'Intermediate',
  CONSULTANT: 'Consultant'
} as const;

export type BALevel = typeof BALevel[keyof typeof BALevel];

export const RoundStatus = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  COMPLETED: 'Completed'
} as const;

export type RoundStatus = typeof RoundStatus[keyof typeof RoundStatus];

export const PromotionReadiness = {
  READY: 'Ready',
  NEAR_READY: 'Near Ready',
  NOT_READY: 'Not Ready'
} as const;

export type PromotionReadiness = typeof PromotionReadiness[keyof typeof PromotionReadiness];

export interface BusinessAnalyst {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  level: BALevel;
  lineManagerId?: string;
  department?: string;
  startDate?: Date;
  lastPromotionDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TalentRound {
  id: string;
  name: string;
  quarter: string;
  year: number;
  deadline: Date;
  status: RoundStatus;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  description?: string;
}

export interface Review {
  id: string;
  roundId: string;
  businessAnalystId: string;
  reviewerId?: string;
  wellbeingConcerns: {
    hasIssues: boolean;
    details?: string;
  };
  performanceConcerns: {
    hasIssues: boolean;
    details?: string;
  };
  developmentOpportunities: {
    hasOpportunities: boolean;
    details?: string;
  };
  promotionReadiness: PromotionReadiness;
  actions: string[];
  generalNotes?: string;
  isComplete: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBARequest {
  firstName: string;
  lastName: string;
  email?: string;
  level: BALevel;
  lineManagerId?: string;
  department?: string;
  startDate?: Date;
}

export interface CreateRoundRequest {
  name: string;
  quarter: string;
  year: number;
  deadline: Date;
  description?: string;
}

export interface CreateReviewRequest {
  roundId: string;
  businessAnalystId: string;
  reviewerId?: string;
  wellbeingConcerns: {
    hasIssues: boolean;
    details?: string;
  };
  performanceConcerns: {
    hasIssues: boolean;
    details?: string;
  };
  developmentOpportunities: {
    hasOpportunities: boolean;
    details?: string;
  };
  promotionReadiness: PromotionReadiness;
  actions?: string[];
  generalNotes?: string;
}

export interface RoundSummary {
  roundId: string;
  totalBAs: number;
  completedReviews: number;
  pendingReviews: number;
  completionPercentage: number;
  reviewsByLevel: Record<BALevel, {
    total: number;
    completed: number;
  }>;
}

export interface HistoricalTrend {
  baId: string;
  reviews: {
    roundName: string;
    date: Date;
    promotionReadiness: PromotionReadiness;
    concerns: {
      wellbeing: boolean;
      performance: boolean;
    };
    actionCount: number;
  }[];
  trend: 'Improving' | 'Stable' | 'Declining' | 'New';
}

export interface OrgChartNode {
  ba: BusinessAnalyst;
  children: OrgChartNode[];
  depth: number;
}

export interface BusinessAnalystService {
  getAll(): BusinessAnalyst[];
  getById(id: string): BusinessAnalyst | null;
  create(data: CreateBARequest): BusinessAnalyst;
  update(id: string, data: Partial<CreateBARequest>): BusinessAnalyst | null;
  deactivate(id: string): boolean;
  getOrgChart(): OrgChartNode[];
  getByLevel(level: BALevel): BusinessAnalyst[];
  getDirectReports(managerId: string): BusinessAnalyst[];
}

export interface TalentRoundService {
  getAll(): TalentRound[];
  getById(id: string): TalentRound | null;
  create(data: CreateRoundRequest): TalentRound;
  update(id: string, data: Partial<CreateRoundRequest>): TalentRound | null;
  activate(id: string): TalentRound | null;
  complete(id: string): TalentRound | null;
  getActive(): TalentRound[];
  getRoundSummary(id: string): RoundSummary;
  getUpcomingDeadlines(): { roundId: string; roundName: string; deadline: Date; daysRemaining: number }[];
}

export interface ReviewService {
  getAll(): Review[];
  getById(id: string): Review | null;
  create(data: CreateReviewRequest): Review;
  update(id: string, data: Partial<CreateReviewRequest>): Review | null;
  getByRound(roundId: string): Review[];
  getByBA(baId: string): Review[];
  getByBAAndRound(baId: string, roundId: string): Review | null;
  getHistoricalTrend(baId: string): HistoricalTrend;
}

export interface DataExportService {
  exportAll(): { success: boolean; data?: string; filename: string; error?: string };
  importData(jsonString: string): { success: boolean; imported: number; errors: string[] };
}