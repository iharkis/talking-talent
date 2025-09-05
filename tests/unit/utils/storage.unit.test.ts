import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveToStorage, loadFromStorage, generateId, STORAGE_KEYS } from '../../../src/utils/storage';

describe('storage.ts - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('STORAGE_KEYS', () => {
    it('should have all required constant keys', () => {
      expect(STORAGE_KEYS.BUSINESS_ANALYSTS).toBe('tt_business_analysts');
      expect(STORAGE_KEYS.TALENT_ROUNDS).toBe('tt_talent_rounds');
      expect(STORAGE_KEYS.REVIEWS).toBe('tt_reviews');
      expect(STORAGE_KEYS.APP_CONFIG).toBe('tt_app_config');
    });

    it('should have consistent prefix pattern', () => {
      Object.values(STORAGE_KEYS).forEach(key => {
        expect(key).toMatch(/^tt_/);
      });
    });

    it('should have unique keys', () => {
      const keys = Object.values(STORAGE_KEYS);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('saveToStorage', () => {
    it('should save simple array to localStorage', () => {
      const testData = [{ id: '1', name: 'Test' }];
      const key = 'test_key';

      saveToStorage(key, testData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(testData)
      );
    });

    it('should save empty array to localStorage', () => {
      const testData: any[] = [];
      const key = 'test_key';

      saveToStorage(key, testData);

      expect(localStorage.setItem).toHaveBeenCalledWith(key, '[]');
    });

    it('should save complex objects to localStorage', () => {
      const testData = [
        { 
          id: '1', 
          name: 'Complex Object',
          nested: { prop: 'value' },
          array: [1, 2, 3],
          date: new Date('2024-01-01').toISOString()
        }
      ];
      const key = 'test_key';

      saveToStorage(key, testData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(testData)
      );
    });

    it('should handle serialization of different data types', () => {
      const testData = [
        { string: 'text', number: 42, boolean: true, null: null }
      ];
      const key = 'test_key';

      saveToStorage(key, testData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(testData)
      );
    });

    it('should throw descriptive error when localStorage fails', () => {
      const testData = [{ id: '1', name: 'Test' }];
      const key = 'test_key';

      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => saveToStorage(key, testData))
        .toThrow('Storage quota exceeded or localStorage unavailable');
    });

    it('should handle different localStorage error types', () => {
      const testData = [{ id: '1', name: 'Test' }];
      const key = 'test_key';

      // Test quota exceeded error
      vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });
      expect(() => saveToStorage(key, testData))
        .toThrow('Storage quota exceeded or localStorage unavailable');

      // Test security error
      vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
        throw new Error('SecurityError');
      });
      expect(() => saveToStorage(key, testData))
        .toThrow('Storage quota exceeded or localStorage unavailable');
    });
  });

  describe('loadFromStorage', () => {
    it('should load valid array from localStorage', () => {
      const testData = [{ id: '1', name: 'Test' }];
      const key = 'test_key';

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(testData));

      const result = loadFromStorage(key);

      expect(localStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toEqual(testData);
    });

    it('should return empty array when no data exists', () => {
      const key = 'test_key';

      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const result = loadFromStorage(key);

      expect(result).toEqual([]);
    });

    it('should return empty array when data is undefined', () => {
      const key = 'test_key';

      vi.mocked(localStorage.getItem).mockReturnValue(undefined as any);

      const result = loadFromStorage(key);

      expect(result).toEqual([]);
    });

    it('should return empty array when stored data is not an array', () => {
      const key = 'test_key';
      const nonArrayData = { notAnArray: true };

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(nonArrayData));

      const result = loadFromStorage(key);

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON gracefully', () => {
      const key = 'test_key';

      vi.mocked(localStorage.getItem).mockReturnValue('invalid json {');

      const result = loadFromStorage(key);

      expect(result).toEqual([]);
    });

    it('should handle localStorage errors gracefully', () => {
      const key = 'test_key';

      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const result = loadFromStorage(key);

      expect(result).toEqual([]);
    });

    it('should preserve data types correctly', () => {
      const testData = [
        { 
          string: 'text', 
          number: 42, 
          boolean: true, 
          null: null,
          array: [1, 2, 3],
          nested: { prop: 'value' }
        }
      ];
      const key = 'test_key';

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(testData));

      const result = loadFromStorage(key);

      expect(result).toEqual(testData);
    });

    it('should handle empty string data', () => {
      const key = 'test_key';

      vi.mocked(localStorage.getItem).mockReturnValue('');

      const result = loadFromStorage(key);

      expect(result).toEqual([]);
    });

    it('should handle empty array correctly', () => {
      const key = 'test_key';

      vi.mocked(localStorage.getItem).mockReturnValue('[]');

      const result = loadFromStorage(key);

      expect(result).toEqual([]);
    });
  });

  describe('generateId', () => {
    it('should generate string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const id = generateId();
        expect(ids.has(id)).toBe(false); // Should not have duplicates
        ids.add(id);
      }

      expect(ids.size).toBe(iterations);
    });

    it('should generate IDs of consistent length', () => {
      const ids = Array.from({ length: 100 }, () => generateId());
      const lengths = ids.map(id => id.length);
      const uniqueLengths = new Set(lengths);
      
      // All IDs should be the same length
      expect(uniqueLengths.size).toBe(1);
      expect(lengths[0]).toBe(9); // Expected length based on implementation
    });

    it('should generate IDs with valid characters', () => {
      const ids = Array.from({ length: 100 }, () => generateId());
      
      ids.forEach(id => {
        // Should only contain alphanumeric characters (base36)
        expect(id).toMatch(/^[a-z0-9]+$/);
      });
    });

    it('should not generate empty IDs', () => {
      const ids = Array.from({ length: 100 }, () => generateId());
      
      ids.forEach(id => {
        expect(id.length).toBeGreaterThan(0);
        expect(id.trim()).toBe(id); // No whitespace
      });
    });

    it('should have good distribution of characters', () => {
      const ids = Array.from({ length: 1000 }, () => generateId());
      const allChars = ids.join('');
      
      // Should contain both letters and numbers
      expect(allChars).toMatch(/[a-z]/);
      expect(allChars).toMatch(/[0-9]/);
      
      // Should have reasonable character distribution
      const uniqueChars = new Set(allChars);
      expect(uniqueChars.size).toBeGreaterThan(20); // Should use most base36 chars
    });
  });
});