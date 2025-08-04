import { BALevel, CreateBARequest } from '../types';

export interface CSVParseResult {
  success: boolean;
  data: CreateBARequest[];
  errors: string[];
  warnings: string[];
}

export interface CSVRow {
  firstName: string;
  lastName: string;
  email?: string;
  level: string;
  startDate?: string;
  lineManagerName?: string;
}

export function parseCSV(csvContent: string): CSVParseResult {
  const lines = csvContent.trim().split('\n');
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: CreateBARequest[] = [];

  if (lines.length < 2) {
    return {
      success: false,
      data: [],
      errors: ['CSV file must contain a header row and at least one data row'],
      warnings: []
    };
  }

  // Parse header
  const header = lines[0].split(',').map(col => col.trim().toLowerCase());
  const requiredColumns = ['firstname', 'lastname', 'level'];
  const optionalColumns = ['email', 'startdate', 'linemanagername'];
  
  // Validate required columns
  const missingColumns = requiredColumns.filter(col => !header.includes(col));
  if (missingColumns.length > 0) {
    return {
      success: false,
      data: [],
      errors: [`Missing required columns: ${missingColumns.join(', ')}`],
      warnings: []
    };
  }

  // Parse data rows
  const managerEmailMap = new Map<string, string>(); // baEmail -> managerEmail
  
  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1;
    const values = parseCSVRow(lines[i]);
    
    if (values.length !== header.length) {
      errors.push(`Row ${rowNumber}: Expected ${header.length} columns, got ${values.length}`);
      continue;
    }

    const row: Record<string, string> = {};
    header.forEach((col, index) => {
      row[col] = values[index]?.trim() || '';
    });

    // Validate required fields
    if (!row.firstname) {
      errors.push(`Row ${rowNumber}: firstName is required`);
      continue;
    }
    if (!row.lastname) {
      errors.push(`Row ${rowNumber}: lastName is required`);
      continue;
    }
    if (!row.level) {
      errors.push(`Row ${rowNumber}: level is required`);
      continue;
    }

    // Validate level
    const validLevels = Object.values(BALevel);
    if (!validLevels.includes(row.level as BALevel)) {
      errors.push(`Row ${rowNumber}: Invalid level "${row.level}". Must be one of: ${validLevels.join(', ')}`);
      continue;
    }

    // Validate email format if provided
    if (row.email && !isValidEmail(row.email)) {
      errors.push(`Row ${rowNumber}: Invalid email format "${row.email}"`);
      continue;
    }

    // Validate start date format if provided
    let startDate: Date | undefined;
    if (row.startdate) {
      const parsedDate = parseDate(row.startdate);
      if (!parsedDate) {
        errors.push(`Row ${rowNumber}: Invalid date format "${row.startdate}". Use YYYY-MM-DD format`);
        continue;
      }
      startDate = parsedDate;
    }

    // Store line manager name for later resolution
    if (row.linemanagername) {
      managerEmailMap.set(row.email || `${row.firstname}.${row.lastname}@temp`, row.linemanagername);
    }

    const baData: CreateBARequest = {
      firstName: row.firstname,
      lastName: row.lastname,
      email: row.email || undefined,
      level: row.level as BALevel,
      department: undefined,
      startDate,
      lineManagerId: undefined // Will be resolved later
    };

    data.push(baData);
  }

  return {
    success: errors.length === 0,
    data,
    errors,
    warnings,
    managerEmailMap
  } as CSVParseResult & { managerEmailMap: Map<string, string> };
}

function parseCSVRow(row: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  values.push(current);
  
  return values;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function parseDate(dateString: string): Date | null {
  // Support YYYY-MM-DD format
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  
  const [, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  // Validate the date is real
  if (date.getFullYear() !== parseInt(year) || 
      date.getMonth() !== parseInt(month) - 1 || 
      date.getDate() !== parseInt(day)) {
    return null;
  }
  
  return date;
}

export function resolveLineManagers(
  baData: CreateBARequest[], 
  existingBAs: Array<{ id: string; email?: string; firstName: string; lastName: string }>,
  managerNameMap: Map<string, string>
): { resolved: CreateBARequest[]; errors: string[] } {
  const errors: string[] = [];
  const resolved: CreateBARequest[] = [];
  
  // Create name to BA mapping for existing BAs
  const nameToBA = new Map<string, string>();
  
  // Add existing BAs
  existingBAs.forEach(ba => {
    const fullName = `${ba.firstName} ${ba.lastName}`.toLowerCase();
    nameToBA.set(fullName, ba.id);
  });
  
  // Create name to email mapping for new BAs in this batch
  const nameToEmailInBatch = new Map<string, string>();
  baData.forEach(ba => {
    const fullName = `${ba.firstName} ${ba.lastName}`.toLowerCase();
    if (ba.email) {
      nameToEmailInBatch.set(fullName, ba.email);
    }
  });
  
  // Process each BA
  baData.forEach((ba, index) => {
    const baKey = ba.email || `${ba.firstName}.${ba.lastName}@temp`;
    const managerName = managerNameMap.get(baKey);
    
    if (managerName) {
      const managerNameLower = managerName.toLowerCase();
      const managerId = nameToBA.get(managerNameLower);
      
      if (managerId) {
        // Manager exists in existing BAs
        resolved.push({ ...ba, lineManagerId: managerId });
      } else {
        // Check if manager is in the same CSV batch
        const managerEmailInBatch = nameToEmailInBatch.get(managerNameLower);
        if (managerEmailInBatch) {
          // Manager will be created in the same batch - resolve later
          resolved.push({ ...ba, lineManagerId: 'RESOLVE_LATER:' + managerEmailInBatch });
        } else {
          // Check if manager name matches any BA in current batch (even without email)
          const managerInBatch = baData.find(otherBA => 
            `${otherBA.firstName} ${otherBA.lastName}`.toLowerCase() === managerNameLower
          );
          
          if (managerInBatch) {
            // Use temporary identifier for resolution
            const tempKey = `${managerInBatch.firstName}.${managerInBatch.lastName}@temp`;
            resolved.push({ ...ba, lineManagerId: 'RESOLVE_LATER:' + tempKey });
          } else {
            errors.push(`Row ${index + 2}: Line manager "${managerName}" not found`);
            resolved.push(ba); // Add without manager
          }
        }
      }
    } else {
      resolved.push(ba);
    }
  });
  
  return { resolved, errors };
}