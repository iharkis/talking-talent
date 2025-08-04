import { businessAnalystService } from '../services/businessAnalystService';
import { talentRoundService } from '../services/talentRoundService';
import { BALevel } from '../types';

export const createSampleData = () => {
  try {
    const principal = businessAnalystService.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      level: BALevel.PRINCIPAL,
      department: 'Digital Transformation',
      startDate: new Date('2020-01-15')
    });

    const lead1 = businessAnalystService.create({
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@company.com',
      level: BALevel.LEAD,
      lineManagerId: principal.id,
      department: 'Digital Transformation',
      startDate: new Date('2021-03-10')
    });

    const lead2 = businessAnalystService.create({
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.davis@company.com',
      level: BALevel.LEAD,
      lineManagerId: principal.id,
      department: 'Operations',
      startDate: new Date('2021-07-20')
    });

    businessAnalystService.create({
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@company.com',
      level: BALevel.SENIOR,
      lineManagerId: lead1.id,
      department: 'Digital Transformation',
      startDate: new Date('2022-02-01')
    });

    businessAnalystService.create({
      firstName: 'Lisa',
      lastName: 'Brown',
      email: 'lisa.brown@company.com',
      level: BALevel.SENIOR,
      lineManagerId: lead1.id,
      department: 'Digital Transformation',
      startDate: new Date('2022-05-15')
    });

    businessAnalystService.create({
      firstName: 'Alex',
      lastName: 'Taylor',
      email: 'alex.taylor@company.com',
      level: BALevel.INTERMEDIATE,
      lineManagerId: lead2.id,
      department: 'Operations',
      startDate: new Date('2023-01-10')
    });

    businessAnalystService.create({
      firstName: 'Jordan',
      lastName: 'Miller',
      email: 'jordan.miller@company.com',
      level: BALevel.INTERMEDIATE,
      lineManagerId: lead2.id,
      department: 'Operations',
      startDate: new Date('2023-03-20')
    });

    businessAnalystService.create({
      firstName: 'Casey',
      lastName: 'Anderson',
      email: 'casey.anderson@company.com',
      level: BALevel.CONSULTANT,
      lineManagerId: lead1.id,
      department: 'Digital Transformation',
      startDate: new Date('2023-09-01')
    });

    const nextQuarter = new Date();
    nextQuarter.setMonth(nextQuarter.getMonth() + 3);

    talentRoundService.create({
      name: 'Q1 2024 Talking Talent',
      quarter: 'Q1',
      year: 2024,
      deadline: nextQuarter,
      description: 'Quarterly review focusing on career development and promotion readiness'
    });

    return { success: true, message: 'Sample data created successfully' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to create sample data' 
    };
  }
};