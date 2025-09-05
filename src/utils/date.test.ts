import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatDateForInput, getDaysUntilDeadline, isOverdue } from './date';

describe('Date Utils', () => {
  const testDate = new Date('2024-08-10T14:30:00.000Z');
  const testDateString = '2024-08-10T14:30:00.000Z';

  describe('formatDate', () => {
    it('should format Date object to DD/MM/YYYY', () => {
      const result = formatDate(testDate);
      expect(result).toBe('10/08/2024');
    });

    it('should format date string to DD/MM/YYYY', () => {
      const result = formatDate(testDateString);
      expect(result).toBe('10/08/2024');
    });

    it('should handle different dates correctly', () => {
      const newYear = new Date('2024-01-01T00:00:00.000Z');
      const result = formatDate(newYear);
      expect(result).toBe('01/01/2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format Date object to DD/MM/YYYY HH:mm', () => {
      const result = formatDateTime(testDate);
      expect(result).toBe('10/08/2024 14:30');
    });

    it('should format date string to DD/MM/YYYY HH:mm', () => {
      const result = formatDateTime(testDateString);
      expect(result).toBe('10/08/2024 14:30');
    });

    it('should handle midnight correctly', () => {
      const midnight = new Date('2024-08-10T00:00:00.000Z');
      const result = formatDateTime(midnight);
      expect(result).toBe('10/08/2024 00:00');
    });
  });

  describe('formatDateForInput', () => {
    it('should format Date object to YYYY-MM-DD for HTML inputs', () => {
      const result = formatDateForInput(testDate);
      expect(result).toBe('2024-08-10');
    });

    it('should format date string to YYYY-MM-DD for HTML inputs', () => {
      const result = formatDateForInput(testDateString);
      expect(result).toBe('2024-08-10');
    });

    it('should handle single digit days and months', () => {
      const singleDigits = new Date('2024-01-05T00:00:00.000Z');
      const result = formatDateForInput(singleDigits);
      expect(result).toBe('2024-01-05');
    });
  });

  describe('getDaysUntilDeadline', () => {
    it('should calculate positive days for future dates', () => {
      const futureDate = new Date('2024-08-15T00:00:00.000Z'); // 5 days from test date
      const result = getDaysUntilDeadline(futureDate);
      expect(result).toBe(5);
    });

    it('should calculate negative days for past dates', () => {
      const pastDate = new Date('2024-08-05T00:00:00.000Z'); // 5 days before test date
      const result = getDaysUntilDeadline(pastDate);
      expect(result).toBe(-5);
    });

    it('should return 0 for same day', () => {
      const sameDay = new Date('2024-08-10T00:00:00.000Z');
      const result = getDaysUntilDeadline(sameDay);
      expect(result).toBe(0);
    });

    it('should handle date strings', () => {
      const futureDateString = '2024-08-15T00:00:00.000Z';
      const result = getDaysUntilDeadline(futureDateString);
      expect(result).toBe(5);
    });
  });

  describe('isOverdue', () => {
    it('should return false for future dates', () => {
      const futureDate = new Date('2024-08-15T00:00:00.000Z');
      const result = isOverdue(futureDate);
      expect(result).toBe(false);
    });

    it('should return true for past dates', () => {
      const pastDate = new Date('2024-08-05T00:00:00.000Z');
      const result = isOverdue(pastDate);
      expect(result).toBe(true);
    });

    it('should return false for today', () => {
      const today = new Date('2024-08-10T00:00:00.000Z');
      const result = isOverdue(today);
      expect(result).toBe(false);
    });

    it('should handle date strings', () => {
      const pastDateString = '2024-08-05T00:00:00.000Z';
      const result = isOverdue(pastDateString);
      expect(result).toBe(true);
    });
  });
});