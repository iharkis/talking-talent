export const STORAGE_KEYS = {
  BUSINESS_ANALYSTS: 'tt_business_analysts',
  TALENT_ROUNDS: 'tt_talent_rounds',
  REVIEWS: 'tt_reviews',
  APP_CONFIG: 'tt_app_config'
} as const;

export const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    throw new Error('Storage quota exceeded or localStorage unavailable');
  }
};

export const loadFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return [];
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};