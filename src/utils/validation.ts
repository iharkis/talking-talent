import { BALevel, CreateBARequest, CreateRoundRequest, CreateReviewRequest } from '../types';

export const validateBAData = (data: CreateBARequest): string[] => {
  const errors: string[] = [];
  
  if (!data.firstName.trim()) {
    errors.push('First name is required');
  }
  
  if (!data.lastName.trim()) {
    errors.push('Last name is required');
  }
  
  if (!Object.values(BALevel).includes(data.level)) {
    errors.push('Valid level is required');
  }
  
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Valid email address is required');
  }
  
  return errors;
};

export const validateRoundData = (data: CreateRoundRequest): string[] => {
  const errors: string[] = [];
  
  if (!data.name.trim()) {
    errors.push('Round name is required');
  }
  
  if (!data.quarter.trim()) {
    errors.push('Quarter is required');
  }
  
  if (!data.year || data.year < 2020 || data.year > 2050) {
    errors.push('Valid year is required');
  }
  
  if (!data.deadline) {
    errors.push('Deadline is required');
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const deadlineDate = new Date(data.deadline);
    deadlineDate.setHours(0, 0, 0, 0); // Set to start of deadline day
    
    if (deadlineDate < today) {
      errors.push('Deadline cannot be in the past');
    }
  }
  
  return errors;
};

export const validateReviewData = (data: CreateReviewRequest): string[] => {
  const errors: string[] = [];
  
  if (!data.roundId) {
    errors.push('Round ID is required');
  }
  
  if (!data.businessAnalystId) {
    errors.push('Business Analyst ID is required');
  }
  
  if (data.wellbeingConcerns.hasIssues && !data.wellbeingConcerns.details?.trim()) {
    errors.push('Wellbeing concerns details are required when issues are indicated');
  }
  
  if (data.performanceConcerns.hasIssues && !data.performanceConcerns.details?.trim()) {
    errors.push('Performance concerns details are required when issues are indicated');
  }
  
  if (data.developmentOpportunities.hasOpportunities && !data.developmentOpportunities.details?.trim()) {
    errors.push('Development opportunities details are required when opportunities are indicated');
  }
  
  return errors;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};