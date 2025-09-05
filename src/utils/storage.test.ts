import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveToStorage, loadFromStorage, generateId, STORAGE_KEYS } from './storage';

describe('Storage Utils', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    vi.clearAllMocks();
  });

  describe('STORAGE_KEYS', () => {
    it('should have all required keys', () => {
      expect(STORAGE_KEYS.BUSINESS_ANALYSTS).toBe('tt_business_analysts');
      expect(STORAGE_KEYS.TALENT_ROUNDS).toBe('tt_talent_rounds');
      expect(STORAGE_KEYS.REVIEWS).toBe('tt_reviews');
      expect(STORAGE_KEYS.APP_CONFIG).toBe('tt_app_config');
    });
  });

  describe('saveToStorage', () => {
    it('should save data to localStorage', () => {
      const testData = [{ id: '1', name: 'Test' }];
      const key = 'test_key';

      saveToStorage(key, testData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(testData)
      );
    });

    it('should handle empty arrays', () => {
      const testData: any[] = [];
      const key = 'test_key';

      saveToStorage(key, testData);

      expect(localStorage.setItem).toHaveBeenCalledWith(key, '[]');
    });

    it('should throw error when localStorage fails', () => {
      const testData = [{ id: '1', name: 'Test' }];
      const key = 'test_key';

      // Mock localStorage to throw an error
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => saveToStorage(key, testData)).toThrow('Storage quota exceeded or localStorage unavailable');
    });
  });

  describe('loadFromStorage', () => {
    it('should load data from localStorage', () => {
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

    it('should return empty array when data is not an array', () => {
      const key = 'test_key';

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({ notAnArray: true }));

      const result = loadFromStorage(key);

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON gracefully', () => {
      const key = 'test_key';

      vi.mocked(localStorage.getItem).mockReturnValue('invalid json');

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
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate IDs of expected length', () => {
      const id = generateId();
      expect(id.length).toBe(9);
    });

    it('should generate IDs with valid characters', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });
});