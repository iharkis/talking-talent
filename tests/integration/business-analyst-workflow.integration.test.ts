import { describe, it, expect, beforeEach, vi } from 'vitest';
import { businessAnalystService } from '../../src/services/businessAnalystService';
import { BALevel } from '../../src/types';

// Mock storage at module level
vi.mock('../../src/utils/storage', () => ({
  STORAGE_KEYS: {
    BUSINESS_ANALYSTS: 'tt_business_analysts',
    TALENT_ROUNDS: 'tt_talent_rounds', 
    REVIEWS: 'tt_reviews',
    APP_CONFIG: 'tt_app_config'
  },
  saveToStorage: vi.fn(),
  loadFromStorage: vi.fn(() => []),
  generateId: (() => {
    let counter = 0;
    return () => `integration-ba-${++counter}`;
  })()
}));

describe('Business Analyst Workflow - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear service data
    if (businessAnalystService['businessAnalysts']) {
      businessAnalystService['businessAnalysts'] = [];
    }
  });

  describe('Complete BA Lifecycle', () => {
    it('should handle full CRUD workflow for business analysts', () => {
      // CREATE: Add new BA
      const newBAData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        level: BALevel.SENIOR,
        department: 'Technology'
      };

      const createdBA = businessAnalystService.create(newBAData);
      
      expect(createdBA).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        level: BALevel.SENIOR,
        department: 'Technology',
        isActive: true
      });
      expect(createdBA.id).toBeTruthy();
      expect(createdBA.createdAt).toBeInstanceOf(Date);
      expect(createdBA.updatedAt).toBeInstanceOf(Date);

      // READ: Verify BA exists in system
      const retrievedBA = businessAnalystService.getById(createdBA.id);
      expect(retrievedBA).toEqual(createdBA);

      const allBAs = businessAnalystService.getAll();
      expect(allBAs).toHaveLength(1);
      expect(allBAs[0]).toEqual(createdBA);

      // UPDATE: Modify BA details
      const updatedBA = businessAnalystService.update(createdBA.id, {
        level: BALevel.PRINCIPAL,
        department: 'Digital Innovation'
      });

      expect(updatedBA).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        level: BALevel.PRINCIPAL,
        department: 'Digital Innovation'
      });
      expect(updatedBA?.updatedAt.getTime()).toBeGreaterThan(createdBA.updatedAt.getTime());

      // DELETE (Deactivate): Remove BA from active roster
      const deactivationResult = businessAnalystService.deactivate(createdBA.id);
      expect(deactivationResult).toBe(true);

      const deactivatedBA = businessAnalystService.getById(createdBA.id);
      expect(deactivatedBA?.isActive).toBe(false);
    });
  });

  describe('Organizational Hierarchy Management', () => {
    it('should manage complex organizational structures', () => {
      // Create organizational hierarchy
      const ceo = businessAnalystService.create({
        firstName: 'CEO',
        lastName: 'Leader',
        level: BALevel.PRINCIPAL,
        department: 'Executive'
      });

      const director1 = businessAnalystService.create({
        firstName: 'Director',
        lastName: 'One',
        level: BALevel.PRINCIPAL,
        department: 'Technology',
        lineManagerId: ceo.id
      });

      const director2 = businessAnalystService.create({
        firstName: 'Director', 
        lastName: 'Two',
        level: BALevel.PRINCIPAL,
        department: 'Operations',
        lineManagerId: ceo.id
      });

      const manager1 = businessAnalystService.create({
        firstName: 'Manager',
        lastName: 'Alpha',
        level: BALevel.LEAD,
        department: 'Technology',
        lineManagerId: director1.id
      });

      const analyst1 = businessAnalystService.create({
        firstName: 'Analyst',
        lastName: 'Beta',
        level: BALevel.SENIOR,
        department: 'Technology',
        lineManagerId: manager1.id
      });

      const analyst2 = businessAnalystService.create({
        firstName: 'Analyst',
        lastName: 'Gamma',
        level: BALevel.INTERMEDIATE,
        department: 'Operations', 
        lineManagerId: director2.id
      });

      // Test organizational chart generation
      const orgChart = businessAnalystService.getOrgChart();
      
      expect(orgChart).toHaveLength(1); // One root (CEO)
      expect(orgChart[0].ba).toEqual(ceo);
      expect(orgChart[0].depth).toBe(0);
      expect(orgChart[0].children).toHaveLength(2); // Two directors

      // Test direct reports functionality
      const ceoReports = businessAnalystService.getDirectReports(ceo.id);
      expect(ceoReports).toHaveLength(2);
      expect(ceoReports).toContainEqual(director1);
      expect(ceoReports).toContainEqual(director2);

      const director1Reports = businessAnalystService.getDirectReports(director1.id);
      expect(director1Reports).toHaveLength(1);
      expect(director1Reports[0]).toEqual(manager1);

      const manager1Reports = businessAnalystService.getDirectReports(manager1.id);
      expect(manager1Reports).toHaveLength(1);
      expect(manager1Reports[0]).toEqual(analyst1);

      // Test level-based filtering
      const principals = businessAnalystService.getByLevel(BALevel.PRINCIPAL);
      expect(principals).toHaveLength(3);
      expect(principals).toContainEqual(ceo);
      expect(principals).toContainEqual(director1);
      expect(principals).toContainEqual(director2);

      const seniors = businessAnalystService.getByLevel(BALevel.SENIOR);
      expect(seniors).toHaveLength(1);
      expect(seniors[0]).toEqual(analyst1);
    });

    it('should handle organizational changes and restructuring', () => {
      // Initial structure
      const manager = businessAnalystService.create({
        firstName: 'Manager',
        lastName: 'Original',
        level: BALevel.LEAD
      });

      const analyst1 = businessAnalystService.create({
        firstName: 'Analyst',
        lastName: 'One',
        level: BALevel.SENIOR,
        lineManagerId: manager.id
      });

      const analyst2 = businessAnalystService.create({
        firstName: 'Analyst',
        lastName: 'Two', 
        level: BALevel.SENIOR,
        lineManagerId: manager.id
      });

      // Verify initial structure
      expect(businessAnalystService.getDirectReports(manager.id)).toHaveLength(2);

      // Create new manager
      const newManager = businessAnalystService.create({
        firstName: 'Manager',
        lastName: 'New',
        level: BALevel.LEAD
      });

      // Transfer one analyst to new manager
      const transferredAnalyst = businessAnalystService.update(analyst1.id, {
        lineManagerId: newManager.id
      });

      expect(transferredAnalyst?.lineManagerId).toBe(newManager.id);

      // Verify new structure
      expect(businessAnalystService.getDirectReports(manager.id)).toHaveLength(1);
      expect(businessAnalystService.getDirectReports(newManager.id)).toHaveLength(1);

      // Promote analyst to remove from hierarchy
      businessAnalystService.update(analyst2.id, {
        level: BALevel.LEAD,
        lineManagerId: undefined
      });

      // Verify final structure
      expect(businessAnalystService.getDirectReports(manager.id)).toHaveLength(0);
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should maintain data integrity across operations', () => {
      // Create test data
      const manager = businessAnalystService.create({
        firstName: 'Manager',
        lastName: 'Test',
        level: BALevel.LEAD
      });

      const analyst = businessAnalystService.create({
        firstName: 'Analyst',
        lastName: 'Test',
        level: BALevel.SENIOR,
        lineManagerId: manager.id
      });

      // Test validation prevents invalid operations
      expect(() => businessAnalystService.create({
        firstName: '',
        lastName: 'Invalid',
        level: BALevel.SENIOR
      })).toThrow('Validation failed');

      expect(() => businessAnalystService.create({
        firstName: 'Valid',
        lastName: 'Name',
        level: BALevel.SENIOR,
        lineManagerId: 'non-existent-manager'
      })).toThrow('Line manager not found');

      // Test update validation
      expect(() => businessAnalystService.update(analyst.id, {
        firstName: ''
      })).toThrow('Validation failed');

      // Test referential integrity maintained
      const managerReports = businessAnalystService.getDirectReports(manager.id);
      expect(managerReports).toHaveLength(1);
      expect(managerReports[0]).toEqual(analyst);

      // Deactivate manager - analyst relationship should remain
      businessAnalystService.deactivate(manager.id);
      
      const updatedAnalyst = businessAnalystService.getById(analyst.id);
      expect(updatedAnalyst?.lineManagerId).toBe(manager.id);
      expect(updatedAnalyst?.isActive).toBe(true);

      // But manager should not appear in active reports
      const activeReports = businessAnalystService.getDirectReports(manager.id);
      expect(activeReports).toHaveLength(0); // Manager is inactive
    });

    it('should handle concurrent operations safely', () => {
      // Simulate concurrent BA creation
      const batchSize = 10;
      const basData = Array.from({ length: batchSize }, (_, i) => ({
        firstName: `User${i}`,
        lastName: `Test${i}`,
        level: Object.values(BALevel)[i % Object.values(BALevel).length],
        email: `user${i}@example.com`
      }));

      // Create all BAs
      const createdBAs = batchSize.map(data => businessAnalystService.create(data));

      // Verify all were created correctly
      expect(createdBAs).toHaveLength(batchSize);
      expect(businessAnalystService.getAll()).toHaveLength(batchSize);

      // Verify unique IDs
      const ids = createdBAs.map(ba => ba.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(batchSize);

      // Verify all are active
      const activeBAs = businessAnalystService.getAll().filter(ba => ba.isActive);
      expect(activeBAs).toHaveLength(batchSize);

      // Batch operations
      const levelGroups = Object.values(BALevel).reduce((acc, level) => {
        acc[level] = businessAnalystService.getByLevel(level);
        return acc;
      }, {} as Record<BALevel, any[]>);

      // Verify level distribution
      const totalInLevels = Object.values(levelGroups).reduce((sum, group) => sum + group.length, 0);
      expect(totalInLevels).toBe(batchSize);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle edge cases gracefully', () => {
      // Empty system operations
      expect(businessAnalystService.getAll()).toEqual([]);
      expect(businessAnalystService.getById('non-existent')).toBeNull();
      expect(businessAnalystService.getDirectReports('non-existent')).toEqual([]);
      expect(businessAnalystService.deactivate('non-existent')).toBe(false);

      // Level filtering with no matches
      expect(businessAnalystService.getByLevel(BALevel.CONSULTANT)).toEqual([]);

      // Operations on empty state
      expect(businessAnalystService.getOrgChart()).toEqual([]);

      // Create BA and test edge cases
      const ba = businessAnalystService.create({
        firstName: 'Test',
        lastName: 'User',
        level: BALevel.SENIOR
      });

      // Update non-existent
      expect(businessAnalystService.update('non-existent', { firstName: 'New' })).toBeNull();

      // Self-reference prevention (if implemented)
      expect(() => businessAnalystService.update(ba.id, {
        lineManagerId: ba.id
      })).toThrow(); // Should prevent self-reference
    });
  });
});