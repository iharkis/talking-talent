export class AppError extends Error {
  public code: string;
  public userMessage?: string;
  
  constructor(
    message: string,
    code: string = 'GENERIC_ERROR',
    userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;  
    this.userMessage = userMessage;
  }
}

export const handleError = (error: unknown, userFriendlyMessage?: string): string => {
  console.error('Application error:', error);
  
  if (error instanceof AppError) {
    return error.userMessage || error.message;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('localStorage')) {
      return 'Storage is full or unavailable. Please clear some space and try again.';
    }
    
    if (error.message.includes('Validation failed')) {
      return error.message;
    }
    
    return userFriendlyMessage || 'An unexpected error occurred. Please try again.';
  }
  
  return userFriendlyMessage || 'An unexpected error occurred. Please try again.';
};

export const validateRequired = (value: unknown, fieldName: string): void => {
  if (value === null || value === undefined || value === '') {
    throw new AppError(`${fieldName} is required`, 'VALIDATION_ERROR');
  }
};

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    throw new AppError('Invalid email address', 'VALIDATION_ERROR');
  }
};

export const validateDate = (date: Date | string, fieldName: string): void => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      throw new AppError(`${fieldName} must be a valid date`, 'VALIDATION_ERROR');
    }
  } catch {
    throw new AppError(`${fieldName} must be a valid date`, 'VALIDATION_ERROR');
  }
};