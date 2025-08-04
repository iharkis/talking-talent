import { DataExportService } from '../types';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';
import { format } from 'date-fns';

class DataExportServiceImpl implements DataExportService {
  exportAll(): { success: boolean; data?: string; filename: string; error?: string } {
    try {
      const exportData = {
        businessAnalysts: loadFromStorage(STORAGE_KEYS.BUSINESS_ANALYSTS),
        talentRounds: loadFromStorage(STORAGE_KEYS.TALENT_ROUNDS),
        reviews: loadFromStorage(STORAGE_KEYS.REVIEWS),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const dataString = JSON.stringify(exportData, null, 2);
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `talking-talent-export_${timestamp}.json`;

      return {
        success: true,
        data: dataString,
        filename
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  importData(jsonString: string): { success: boolean; imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    try {
      const data = JSON.parse(jsonString);
      
      if (!this.validateImportData(data)) {
        errors.push('Invalid import data format');
        return { success: false, imported: 0, errors };
      }

      if (data.businessAnalysts && Array.isArray(data.businessAnalysts)) {
        try {
          saveToStorage(STORAGE_KEYS.BUSINESS_ANALYSTS, data.businessAnalysts);
          imported += data.businessAnalysts.length;
        } catch (error) {
          errors.push('Failed to import business analysts');
        }
      }

      if (data.talentRounds && Array.isArray(data.talentRounds)) {
        try {
          saveToStorage(STORAGE_KEYS.TALENT_ROUNDS, data.talentRounds);
          imported += data.talentRounds.length;
        } catch (error) {
          errors.push('Failed to import talent rounds');
        }
      }

      if (data.reviews && Array.isArray(data.reviews)) {
        try {
          saveToStorage(STORAGE_KEYS.REVIEWS, data.reviews);
          imported += data.reviews.length;
        } catch (error) {
          errors.push('Failed to import reviews');
        }
      }

      return {
        success: errors.length === 0,
        imported,
        errors
      };
    } catch (error) {
      errors.push('Invalid JSON format');
      return { success: false, imported: 0, errors };
    }
  }

  private validateImportData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    const hasValidArrays = ['businessAnalysts', 'talentRounds', 'reviews'].some(
      key => data[key] && Array.isArray(data[key])
    );

    return hasValidArrays;
  }
}

export const dataExportService = new DataExportServiceImpl();