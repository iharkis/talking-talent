import { BusinessAnalyst, BALevel, CreateBARequest, BusinessAnalystService, OrgChartNode } from '../types';
import { STORAGE_KEYS, saveToStorage, loadFromStorage, generateId } from '../utils/storage';
import { validateBAData } from '../utils/validation';
import { parseCSV, resolveLineManagers } from '../utils/csvParser';

class BusinessAnalystServiceImpl implements BusinessAnalystService {
  private businessAnalysts: BusinessAnalyst[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.businessAnalysts = loadFromStorage<BusinessAnalyst>(STORAGE_KEYS.BUSINESS_ANALYSTS);
  }

  private saveData(): void {
    saveToStorage(STORAGE_KEYS.BUSINESS_ANALYSTS, this.businessAnalysts);
  }

  getAll(): BusinessAnalyst[] {
    return [...this.businessAnalysts];
  }

  getById(id: string): BusinessAnalyst | null {
    return this.businessAnalysts.find(ba => ba.id === id) || null;
  }

  create(data: CreateBARequest): BusinessAnalyst {
    const validationErrors = validateBAData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    if (data.lineManagerId && !this.getById(data.lineManagerId)) {
      throw new Error('Line manager not found');
    }

    const now = new Date();
    const newBA: BusinessAnalyst = {
      id: generateId(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email?.trim(),
      level: data.level,
      lineManagerId: data.lineManagerId,
      department: data.department?.trim(),
      startDate: data.startDate,
      lastPromotionDate: undefined,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    this.businessAnalysts.push(newBA);
    this.saveData();
    return newBA;
  }

  update(id: string, data: Partial<CreateBARequest>): BusinessAnalyst | null {
    const baIndex = this.businessAnalysts.findIndex(ba => ba.id === id);
    if (baIndex === -1) return null;

    const existingBA = this.businessAnalysts[baIndex];
    const updatedData = { ...existingBA, ...data };

    const validationErrors = validateBAData({
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      email: updatedData.email,
      level: updatedData.level,
      lineManagerId: updatedData.lineManagerId,
      department: updatedData.department,
      startDate: updatedData.startDate
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    if (data.lineManagerId && data.lineManagerId !== id && !this.getById(data.lineManagerId)) {
      throw new Error('Line manager not found');
    }

    if (this.wouldCreateCircularReference(id, data.lineManagerId)) {
      throw new Error('Cannot create circular reporting relationship');
    }

    const updatedBA: BusinessAnalyst = {
      ...existingBA,
      ...data,
      updatedAt: new Date()
    };

    this.businessAnalysts[baIndex] = updatedBA;
    this.saveData();
    return updatedBA;
  }

  deactivate(id: string): boolean {
    const baIndex = this.businessAnalysts.findIndex(ba => ba.id === id);
    if (baIndex === -1) return false;

    this.businessAnalysts[baIndex] = {
      ...this.businessAnalysts[baIndex],
      isActive: false,
      updatedAt: new Date()
    };

    this.saveData();
    return true;
  }

  getOrgChart(): OrgChartNode[] {
    const activeBAs = this.businessAnalysts.filter(ba => ba.isActive);
    const rootBAs = activeBAs.filter(ba => !ba.lineManagerId);
    
    return rootBAs.map(ba => this.buildOrgChartNode(ba, activeBAs, 0));
  }

  getByLevel(level: BALevel): BusinessAnalyst[] {
    return this.businessAnalysts.filter(ba => ba.level === level && ba.isActive);
  }

  getDirectReports(managerId: string): BusinessAnalyst[] {
    return this.businessAnalysts.filter(ba => ba.lineManagerId === managerId && ba.isActive);
  }

  private buildOrgChartNode(ba: BusinessAnalyst, allBAs: BusinessAnalyst[], depth: number): OrgChartNode {
    const children = allBAs
      .filter(child => child.lineManagerId === ba.id)
      .map(child => this.buildOrgChartNode(child, allBAs, depth + 1));

    return { ba, children, depth };
  }

  private wouldCreateCircularReference(baId: string, newManagerId?: string): boolean {
    if (!newManagerId || newManagerId === baId) return false;

    const visited = new Set<string>();
    let currentId: string | undefined = newManagerId;

    while (currentId && !visited.has(currentId)) {
      if (currentId === baId) return true;
      
      visited.add(currentId);
      const manager = this.getById(currentId);
      currentId = manager?.lineManagerId;
    }

    return false;
  }

  bulkCreate(csvContent: string): { success: boolean; created: number; errors: string[]; warnings: string[] } {
    const parseResult = parseCSV(csvContent) as any;
    
    if (!parseResult.success) {
      return {
        success: false,
        created: 0,
        errors: parseResult.errors,
        warnings: parseResult.warnings
      };
    }

    const errors: string[] = [...parseResult.errors];
    const warnings: string[] = [...parseResult.warnings];
    const createdBAs: BusinessAnalyst[] = [];
    const emailToIdMap = new Map<string, string>();

    // Resolve line managers
    const existingBAs = this.getAll().map(ba => ({
      id: ba.id,
      email: ba.email,
      firstName: ba.firstName,
      lastName: ba.lastName
    }));

    const { resolved, errors: resolveErrors } = resolveLineManagers(
      parseResult.data,
      existingBAs,
      parseResult.managerEmailMap
    );

    errors.push(...resolveErrors);

    // First pass: create BAs without line managers
    const basWithTempManagers: Array<{ ba: BusinessAnalyst; tempManagerEmail?: string }> = [];
    
    for (const baData of resolved) {
      try {
        let lineManagerId = baData.lineManagerId;
        let tempManagerEmail: string | undefined;

        // Handle temporary manager references
        if (lineManagerId?.startsWith('RESOLVE_LATER:')) {
          tempManagerEmail = lineManagerId.replace('RESOLVE_LATER:', '');
          lineManagerId = undefined;
        }

        const newBA = this.create({
          ...baData,
          lineManagerId
        });

        createdBAs.push(newBA);
        
        if (newBA.email) {
          emailToIdMap.set(newBA.email.toLowerCase(), newBA.id);
        }

        if (tempManagerEmail) {
          basWithTempManagers.push({ ba: newBA, tempManagerEmail });
        }

      } catch (error) {
        const rowNumber = resolved.indexOf(baData) + 2;
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Second pass: resolve temporary manager references
    for (const { ba, tempManagerEmail } of basWithTempManagers) {
      if (tempManagerEmail) {
        let managerId = emailToIdMap.get(tempManagerEmail.toLowerCase());
        
        // If not found by email, try to find by temporary key (firstName.lastName@temp)
        if (!managerId && tempManagerEmail.endsWith('@temp')) {
          const tempName = tempManagerEmail.replace('@temp', '');
          const [firstName, lastName] = tempName.split('.');
          const matchingBA = createdBAs.find(createdBA => 
            createdBA.firstName.toLowerCase() === firstName?.toLowerCase() && 
            createdBA.lastName.toLowerCase() === lastName?.toLowerCase()
          );
          managerId = matchingBA?.id;
        }
        
        if (managerId) {
          try {
            this.update(ba.id, { lineManagerId: managerId });
          } catch (error) {
            warnings.push(`Could not assign line manager for ${ba.firstName} ${ba.lastName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      created: createdBAs.length,
      errors,
      warnings
    };
  }
}

export const businessAnalystService = new BusinessAnalystServiceImpl();