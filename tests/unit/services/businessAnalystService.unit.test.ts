import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BALevel } from '../../../src/types';

// Mock the entire storage module
const mockSaveToStorage = vi.fn();
const mockLoadFromStorage = vi.fn(() => []);
const mockGenerateId = vi.fn();

vi.mock('../../../src/utils/storage', () => ({
  STORAGE_KEYS: {
    BUSINESS_ANALYSTS: 'tt_business_analysts'
  },
  saveToStorage: mockSaveToStorage,
  loadFromStorage: mockLoadFromStorage,
  generateId: mockGenerateId
}));

// Mock validation module
const mockValidateBAData = vi.fn(() => []);
vi.mock('../../../src/utils/validation', () => ({
  validateBAData: mockValidateBAData
}));

describe('BusinessAnalystService - Unit Tests', () => {
  let BusinessAnalystServiceImpl: any;
  let service: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    mockLoadFromStorage.mockReturnValue([]);
    mockGenerateId.mockReturnValue('test-id-123');
    mockValidateBAData.mockReturnValue([]);
    
    // Dynamic import to get fresh instance after mocking
    const module = await import('../../../src/services/businessAnalystService');
    BusinessAnalystServiceImpl = module.businessAnalystService.constructor;
    service = new BusinessAnalystServiceImpl();
  });

  describe('constructor', () => {
    it('should load data on initialization', () => {
      expect(mockLoadFromStorage).toHaveBeenCalledWith('tt_business_analysts');
    });

    it('should initialize with empty array when no stored data', () => {
      mockLoadFromStorage.mockReturnValueOnce([]);
      const newService = new BusinessAnalystServiceImpl();
      expect(newService.getAll()).toEqual([]);
    });

    it('should initialize with stored data when available', () => {
      const storedData = [
        { id: '1', firstName: 'John', lastName: 'Doe', level: BALevel.SENIOR, isActive: true }
      ];
      mockLoadFromStorage.mockReturnValueOnce(storedData);
      const newService = new BusinessAnalystServiceImpl();
      expect(newService.getAll()).toEqual(storedData);
    });
  });

  describe('create', () => {
    const validBAData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      level: BALevel.SENIOR,
      department: 'Technology'
    };

    it('should create BA with valid data', () => {
      const result = service.create(validBAData);

      expect(mockValidateBAData).toHaveBeenCalledWith(validBAData);
      expect(mockGenerateId).toHaveBeenCalled();
      expect(mockSaveToStorage).toHaveBeenCalled();
      
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

    it('should trim whitespace from string fields', () => {
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

    it('should handle optional fields correctly', () => {
      const minimalData = {
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      };

      const result = service.create(minimalData);

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.level).toBe(BALevel.SENIOR);
      expect(result.email).toBeUndefined();
      expect(result.department).toBeUndefined();
    });

    it('should throw error when validation fails', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        level: BALevel.SENIOR
      };
      
      mockValidateBAData.mockReturnValueOnce(['First name is required']);

      expect(() => service.create(invalidData))
        .toThrow('Validation failed: First name is required');
    });

    it('should throw error when line manager does not exist', () => {
      const dataWithInvalidManager = {
        ...validBAData,
        lineManagerId: 'non-existent-id'
      };

      expect(() => service.create(dataWithInvalidManager))
        .toThrow('Line manager not found');
    });

    it('should allow valid line manager reference', () => {
      // First create a manager
      const manager = service.create({
        firstName: 'Manager',
        lastName: 'Boss',
        level: BALevel.PRINCIPAL
      });

      // Then create subordinate
      const subordinateData = {
        ...validBAData,
        lineManagerId: manager.id
      };

      const result = service.create(subordinateData);
      expect(result.lineManagerId).toBe(manager.id);
    });

    it('should save data after creation', () => {
      service.create(validBAData);
      
      expect(mockSaveToStorage).toHaveBeenCalledWith(
        'tt_business_analysts',
        expect.any(Array)
      );
    });
  });

  describe('getAll', () => {
    it('should return empty array when no data', () => {
      const result = service.getAll();
      expect(result).toEqual([]);
    });

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
      expect(result).toContainEqual(ba1);
      expect(result).toContainEqual(ba2);
      
      // Ensure it's a copy, not the original array
      expect(result).not.toBe(service['businessAnalysts']);
    });

    it('should return immutable copy', () => {
      service.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      const result1 = service.getAll();
      const result2 = service.getAll();
      
      expect(result1).not.toBe(result2); // Different array instances
      expect(result1).toEqual(result2); // But same content
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

    it('should return null for empty string id', () => {
      const result = service.getById('');
      expect(result).toBeNull();
    });

    it('should find correct BA among multiple', () => {
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

      expect(service.getById(ba1.id)).toEqual(ba1);
      expect(service.getById(ba2.id)).toEqual(ba2);
      expect(service.getById('wrong-id')).toBeNull();
    });
  });

  describe('getByLevel', () => {
    beforeEach(() => {
      service.create({ firstName: 'John', lastName: 'Doe', level: BALevel.SENIOR });
      service.create({ firstName: 'Jane', lastName: 'Smith', level: BALevel.SENIOR });
      service.create({ firstName: 'Bob', lastName: 'Johnson', level: BALevel.PRINCIPAL });
      service.create({ firstName: 'Alice', lastName: 'Wilson', level: BALevel.CONSULTANT });
    });

    it('should return all BAs of specified level', () => {
      const seniors = service.getByLevel(BALevel.SENIOR);
      expect(seniors).toHaveLength(2);
      expect(seniors.every((ba: any) => ba.level === BALevel.SENIOR)).toBe(true);
    });

    it('should return empty array for level with no BAs', () => {
      const intermediates = service.getByLevel(BALevel.INTERMEDIATE);
      expect(intermediates).toEqual([]);
    });

    it('should return single BA for level with one BA', () => {
      const principals = service.getByLevel(BALevel.PRINCIPAL);
      expect(principals).toHaveLength(1);
      expect(principals[0].level).toBe(BALevel.PRINCIPAL);
    });

    it('should include only active BAs', () => {
      // Deactivate one senior
      const seniors = service.getByLevel(BALevel.SENIOR);
      service.deactivate(seniors[0].id);

      const activeSeniors = service.getByLevel(BALevel.SENIOR);
      expect(activeSeniors).toHaveLength(1);
      expect(activeSeniors.every((ba: any) => ba.isActive)).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should deactivate existing business analyst', () => {
      const ba = service.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      expect(ba.isActive).toBe(true);

      const result = service.deactivate(ba.id);
      expect(result).toBe(true);

      const deactivatedBA = service.getById(ba.id);
      expect(deactivatedBA?.isActive).toBe(false);
    });

    it('should return false for non-existent id', () => {
      const result = service.deactivate('non-existent-id');
      expect(result).toBe(false);
    });

    it('should update updatedAt timestamp', () => {
      const ba = service.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      const originalUpdatedAt = ba.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        service.deactivate(ba.id);
        const deactivatedBA = service.getById(ba.id);
        expect(deactivatedBA?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 1);
    });

    it('should save data after deactivation', () => {
      const ba = service.create({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.SENIOR
      });

      // Clear mock to isolate deactivation call
      mockSaveToStorage.mockClear();

      service.deactivate(ba.id);
      
      expect(mockSaveToStorage).toHaveBeenCalledWith(
        'tt_business_analysts',
        expect.any(Array)
      );
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

      // Create BA without this manager
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

    it('should include only active direct reports', () => {
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

      // Deactivate one report
      service.deactivate(report1.id);

      const activeReports = service.getDirectReports(manager.id);
      expect(activeReports).toHaveLength(1);
      expect(activeReports[0]).toEqual(service.getById(report2.id));
    });
  });
});