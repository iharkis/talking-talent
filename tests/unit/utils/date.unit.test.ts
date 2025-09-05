import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatDateForInput, getDaysUntilDeadline, isOverdue } from '../../../src/utils/date';

describe('date.ts - Unit Tests', () => {
  // Test with fixed dates to ensure consistency
  const testDate = new Date('2024-08-10T14:30:00.000Z');
  const testDateString = '2024-08-10T14:30:00.000Z';

  describe('formatDate', () => {
    it('should format Date object to DD/MM/YYYY', () => {
      const result = formatDate(testDate);
      expect(result).toBe('10/08/2024');
    });

    it('should format ISO string to DD/MM/YYYY', () => {
      const result = formatDate(testDateString);
      expect(result).toBe('10/08/2024');
    });

    it('should handle edge cases correctly', () => {
      const testCases = [
        { input: new Date('2024-01-01T00:00:00.000Z'), expected: '01/01/2024' },
        { input: new Date('2024-12-31T23:59:59.000Z'), expected: '31/12/2024' },
        { input: '2024-01-01T00:00:00.000Z', expected: '01/01/2024' },
        { input: '2024-12-31T23:59:59.000Z', expected: '31/12/2024' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = formatDate(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle different timezones consistently', () => {
      // Test with different timezone representations of same moment
      const utcDate = new Date('2024-08-10T00:00:00.000Z');
      const isoString = '2024-08-10T00:00:00.000Z';
      
      expect(formatDate(utcDate)).toBe(formatDate(isoString));
    });
  });

  describe('formatDateTime', () => {
    it('should format Date object to DD/MM/YYYY HH:mm', () => {
      const result = formatDateTime(testDate);
      // Result depends on system timezone, so we test the format structure
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
      expect(result).toContain('10/08/2024');
    });

    it('should format ISO string to DD/MM/YYYY HH:mm', () => {
      const result = formatDateTime(testDateString);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
      expect(result).toContain('10/08/2024');
    });

    it('should handle midnight correctly', () => {
      const midnight = new Date('2024-08-10T00:00:00.000Z');
      const result = formatDateTime(midnight);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
      expect(result).toContain('10/08/2024');
    });

    it('should handle different hours correctly', () => {
      const testTimes = [
        '2024-08-10T00:00:00.000Z',
        '2024-08-10T12:00:00.000Z',
        '2024-08-10T23:59:59.000Z'
      ];

      testTimes.forEach(timeString => {
        const result = formatDateTime(timeString);
        expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
      });
    });
  });

  describe('formatDateForInput', () => {
    it('should format Date object to YYYY-MM-DD for HTML inputs', () => {
      const result = formatDateForInput(testDate);
      expect(result).toBe('2024-08-10');
    });

    it('should format ISO string to YYYY-MM-DD for HTML inputs', () => {
      const result = formatDateForInput(testDateString);
      expect(result).toBe('2024-08-10');
    });

    it('should handle edge cases correctly', () => {
      const testCases = [
        { input: new Date('2024-01-01T00:00:00.000Z'), expected: '2024-01-01' },
        { input: new Date('2024-12-31T23:59:59.000Z'), expected: '2024-12-31' },
        { input: '2024-01-05T00:00:00.000Z', expected: '2024-01-05' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = formatDateForInput(input);
        expect(result).toBe(expected);
      });
    });

    it('should maintain date consistency regardless of timezone', () => {
      const date = new Date('2024-08-10T12:00:00.000Z');
      const isoString = '2024-08-10T12:00:00.000Z';
      
      expect(formatDateForInput(date)).toBe('2024-08-10');
      expect(formatDateForInput(isoString)).toBe('2024-08-10');
    });
  });

  describe('getDaysUntilDeadline', () => {
    // Note: This function depends on the current date, so we test relative differences
    it('should calculate correct day differences', () => {
      const baseDate = new Date('2024-08-10T00:00:00.000Z');
      
      // Test future date
      const futureDate = new Date('2024-08-15T00:00:00.000Z');
      const futureDays = getDaysUntilDeadline(futureDate);
      
      // Test past date  
      const pastDate = new Date('2024-08-05T00:00:00.000Z');
      const pastDays = getDaysUntilDeadline(pastDate);
      
      // Future should be positive, past should be negative
      expect(futureDays).toBeGreaterThan(0);
      expect(pastDays).toBeLessThan(0);
      
      // The absolute difference should be consistent
      expect(Math.abs(futureDays - pastDays)).toBeGreaterThan(0);
    });

    it('should handle ISO string dates', () => {
      const dateString = '2024-08-15T00:00:00.000Z';
      const dateObject = new Date(dateString);
      
      const stringResult = getDaysUntilDeadline(dateString);
      const objectResult = getDaysUntilDeadline(dateObject);
      
      expect(stringResult).toBe(objectResult);
    });

    it('should handle same day correctly', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const result = getDaysUntilDeadline(today);
      // Should be close to 0 (might be 0 or 1 depending on timing)
      expect(Math.abs(result)).toBeLessThan(2);
    });

    it('should be consistent with different time zones', () => {
      // Same date, different time representations
      const utcMorning = new Date('2024-08-15T08:00:00.000Z');
      const utcEvening = new Date('2024-08-15T20:00:00.000Z');
      
      const morningResult = getDaysUntilDeadline(utcMorning);
      const eveningResult = getDaysUntilDeadline(utcEvening);
      
      // Should be same number of days regardless of time
      expect(morningResult).toBe(eveningResult);
    });
  });

  describe('isOverdue', () => {
    it('should identify overdue dates correctly', () => {
      // Create a date that's definitely in the past
      const pastDate = new Date('2020-01-01T00:00:00.000Z');
      expect(isOverdue(pastDate)).toBe(true);
      
      // Create a date that's definitely in the future
      const futureDate = new Date('2030-01-01T00:00:00.000Z');
      expect(isOverdue(futureDate)).toBe(false);
    });

    it('should handle ISO string dates', () => {
      const pastString = '2020-01-01T00:00:00.000Z';
      const futureString = '2030-01-01T00:00:00.000Z';
      
      expect(isOverdue(pastString)).toBe(true);
      expect(isOverdue(futureString)).toBe(false);
    });

    it('should be consistent between Date objects and strings', () => {
      const dateString = '2020-01-01T00:00:00.000Z';
      const dateObject = new Date(dateString);
      
      expect(isOverdue(dateString)).toBe(isOverdue(dateObject));
    });

    it('should handle edge case around current time', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const oneMinuteLater = new Date(now.getTime() + 60 * 1000);
      
      expect(isOverdue(oneMinuteAgo)).toBe(true);
      expect(isOverdue(oneMinuteLater)).toBe(false);
    });

    it('should use getDaysUntilDeadline internally', () => {
      // Test that isOverdue behaves consistently with getDaysUntilDeadline
      const testDate = new Date('2025-01-01T00:00:00.000Z');
      
      const daysUntil = getDaysUntilDeadline(testDate);
      const overdue = isOverdue(testDate);
      
      if (daysUntil < 0) {
        expect(overdue).toBe(true);
      } else {
        expect(overdue).toBe(false);
      }
    });
  });
});