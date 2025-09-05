import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BALevel } from '../types';

// Mock the storage module
const mockSaveToStorage = vi.fn();
const mockLoadFromStorage = vi.fn(() => []);
const mockGenerateId = vi.fn(() => 'test-id-123');

vi.mock('../utils/storage', () => ({
  STORAGE_KEYS: {
    BUSINESS_ANALYSTS: 'tt_business_analysts'
  },
  saveToStorage: mockSaveToStorage,
  loadFromStorage: mockLoadFromStorage,
  generateId: mockGenerateId
}));

describe('BusinessAnalystService', () => {
  let service: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    mockLoadFromStorage.mockReturnValue([]);
    // Dynamic import to get fresh instance after mocking
    const { businessAnalystService } = await import('./businessAnalystService');
    service = businessAnalystService;
    // Clear any existing data
    service['businessAnalysts'] = [];
  });

  describe('create', () => {
    const validBAData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      level: BALevel.SENIOR,
      department: 'Technology'
    };

    it('should create a new business analyst with valid data', () => {
      const result = service.create(validBAData);

      expect(result).toMatchObject({
        id: 'test-id-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        level: BALevel.SENIOR,
        department: 'Technology',
        isActive: true
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should trim whitespace from names and email', () => {
      const dataWithWhitespace = {
        ...validBAData,
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: '  john.doe@example.com  ',
        department: '  Technology  '
      };

      const result = service.create(dataWithWhitespace);

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.department).toBe('Technology');
    });

    it('should throw error for invalid data', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        level: BALevel.SENIOR
      };

      expect(() => service.create(invalidData)).toThrow('Validation failed: First name is required');
    });

    it('should throw error when line manager does not exist', () => {
      const dataWithInvalidManager = {
        ...validBAData,
        lineManagerId: 'non-existent-id'
      };

      expect(() => service.create(dataWithInvalidManager)).toThrow('Line manager not found');
    });
  });

  describe('getAll', () => {
    it('should return copy of all business analysts', () => {
      const ba1 = service.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      const ba2 = service.create({
        firstName: 'Jane',
        lastName: 'Smith',
        level: BALevel.PRINCIPAL
      });

      const result = service.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(ba1);
      expect(result[1]).toEqual(ba2);
      
      // Ensure it's a copy, not the original array
      expect(result).not.toBe(service['businessAnalysts']);
    });
  });

  describe('getById', () => {
    it('should return business analyst by id', () => {
      const ba = service.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      const result = service.getById(ba.id);
      expect(result).toEqual(ba);
    });

    it('should return null for non-existent id', () => {
      const result = service.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing business analyst', () => {
      const ba = service.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      const updatedBA = service.update(ba.id, {
        firstName: 'Johnny',
        level: BALevel.PRINCIPAL
      });

      expect(updatedBA?.firstName).toBe('Johnny');
      expect(updatedBA?.level).toBe(BALevel.PRINCIPAL);
      expect(updatedBA?.lastName).toBe('Doe'); // Unchanged
      expect(updatedBA?.updatedAt.getTime()).toBeGreaterThan(ba.updatedAt.getTime());
    });

    it('should return null for non-existent id', () => {
      const result = service.update('non-existent-id', { firstName: 'Johnny' });
      expect(result).toBeNull();
    });

    it('should throw error for invalid update data', () => {
      const ba = service.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      expect(() => service.update(ba.id, { firstName: '' })).toThrow('Validation failed');
    });
  });

  describe('deactivate', () => {
    it('should deactivate existing business analyst', () => {
      const ba = service.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      const result = service.deactivate(ba.id);
      expect(result).toBe(true);

      const deactivatedBA = service.getById(ba.id);
      expect(deactivatedBA?.isActive).toBe(false);
    });

    it('should return false for non-existent id', () => {
      const result = service.deactivate('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getByLevel', () => {
    beforeEach(() => {
      service.create({ firstName: 'John', lastName: 'Doe', level: BALevel.SENIOR });
      service.create({ firstName: 'Jane', lastName: 'Smith', level: BALevel.SENIOR });
      service.create({ firstName: 'Bob', lastName: 'Johnson', level: BALevel.PRINCIPAL });
    });

    it('should return all business analysts of specified level', () => {
      const seniors = service.getByLevel(BALevel.SENIOR);
      expect(seniors).toHaveLength(2);
      expect(seniors.every((ba: any) => ba.level === BALevel.SENIOR)).toBe(true);
    });

    it('should return empty array for level with no BAs', () => {
      const consultants = service.getByLevel(BALevel.CONSULTANT);
      expect(consultants).toEqual([]);
    });
  });

  describe('getDirectReports', () => {
    it('should return direct reports of a manager', () => {
      const manager = service.create({
        firstName: 'Manager',
        lastName: 'Boss',
        level: BALevel.PRINCIPAL
      });

      const report1 = service.create({
        firstName: 'Report',
        lastName: 'One',
        level: BALevel.SENIOR,
        lineManagerId: manager.id
      });

      const report2 = service.create({
        firstName: 'Report',
        lastName: 'Two',
        level: BALevel.SENIOR,
        lineManagerId: manager.id
      });

      // Create another BA without this manager
      service.create({
        firstName: 'Other',
        lastName: 'BA',
        level: BALevel.SENIOR
      });

      const reports = service.getDirectReports(manager.id);
      expect(reports).toHaveLength(2);
      expect(reports).toContainEqual(report1);
      expect(reports).toContainEqual(report2);
    });

    it('should return empty array for manager with no reports', () => {
      const manager = service.create({
        firstName: 'Manager',
        lastName: 'Boss',
        level: BALevel.PRINCIPAL
      });

      const reports = service.getDirectReports(manager.id);
      expect(reports).toEqual([]);
    });

    it('should return empty array for non-existent manager', () => {
      const reports = service.getDirectReports('non-existent-id');
      expect(reports).toEqual([]);
    });
  });
});