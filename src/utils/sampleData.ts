import { businessAnalystService } from '../services/businessAnalystService';
import { talentRoundService } from '../services/talentRoundService';
import { BALevel } from '../types';

export const createSampleData = () => {
  try {
    // Business Analysis - Principal
    const baPrincipal = businessAnalystService.create({
      firstName: 'Sarah',
      lastName: 'Thompson',
      email: 'sarah.thompson@company.com',
      employeeNo: 'EMP001',
      profession: 'Business Analysis',
      level: BALevel.PRINCIPAL,
      department: 'Business Analysis',
      startDate: new Date('2019-01-15')
    });

    // Business Analysis - Leads
    const baLead1 = businessAnalystService.create({
      firstName: 'Jamal',
      lastName: 'Clarke',
      email: 'jamal.clarke@company.com',
      employeeNo: 'EMP002',
      profession: 'Business Analysis',
      level: BALevel.LEAD,
      lineManagerId: baPrincipal.id,
      department: 'Business Analysis',
      startDate: new Date('2020-03-10')
    });

    const baLead2 = businessAnalystService.create({
      firstName: 'Emma',
      lastName: 'Davies',
      email: 'emma.davies@company.com',
      employeeNo: 'EMP003',
      profession: 'Business Analysis',
      level: BALevel.LEAD,
      lineManagerId: baPrincipal.id,
      department: 'Business Analysis',
      startDate: new Date('2020-07-20')
    });

    // Business Analysis - Seniors
    const baSenior1 = businessAnalystService.create({
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@company.com',
      employeeNo: 'EMP004',
      profession: 'Business Analysis',
      level: BALevel.SENIOR,
      lineManagerId: baLead1.id,
      department: 'Business Analysis',
      startDate: new Date('2021-02-01')
    });

    const baSenior2 = businessAnalystService.create({
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@company.com',
      employeeNo: 'EMP005',
      profession: 'Business Analysis',
      level: BALevel.SENIOR,
      lineManagerId: baLead2.id,
      department: 'Business Analysis',
      startDate: new Date('2021-05-15')
    });

    // Business Analysis - Intermediates
    businessAnalystService.create({
      firstName: 'Oliver',
      lastName: 'Hughes',
      email: 'oliver.hughes@company.com',
      employeeNo: 'EMP006',
      profession: 'Business Analysis',
      level: BALevel.INTERMEDIATE,
      lineManagerId: baSenior1.id,
      department: 'Business Analysis',
      startDate: new Date('2022-01-10')
    });

    businessAnalystService.create({
      firstName: 'Sophie',
      lastName: 'Clarke',
      email: 'sophie.clarke@company.com',
      employeeNo: 'EMP007',
      profession: 'Business Analysis',
      level: BALevel.INTERMEDIATE,
      lineManagerId: baSenior2.id,
      department: 'Business Analysis',
      startDate: new Date('2022-04-20')
    });

    // Business Analysis - Consultants
    businessAnalystService.create({
      firstName: 'Daniel',
      lastName: 'Foster',
      email: 'daniel.foster@company.com',
      employeeNo: 'EMP008',
      profession: 'Business Analysis',
      level: BALevel.CONSULTANT,
      lineManagerId: baSenior1.id,
      department: 'Business Analysis',
      startDate: new Date('2023-02-01')
    });

    businessAnalystService.create({
      firstName: 'Leila',
      lastName: 'Ali',
      email: 'leila.ali@company.com',
      employeeNo: 'EMP009',
      profession: 'Business Analysis',
      level: BALevel.CONSULTANT,
      lineManagerId: baSenior2.id,
      department: 'Business Analysis',
      startDate: new Date('2023-09-01')
    });

    // Product - Principal
    const prodPrincipal = businessAnalystService.create({
      firstName: 'David',
      lastName: 'Harrison',
      email: 'david.harrison@company.com',
      employeeNo: 'EMP010',
      profession: 'Product',
      level: BALevel.PRINCIPAL,
      department: 'Product',
      startDate: new Date('2019-02-01')
    });

    // Product - Leads
    const prodLead1 = businessAnalystService.create({
      firstName: 'Rachel',
      lastName: 'Taylor',
      email: 'rachel.taylor@company.com',
      employeeNo: 'EMP011',
      profession: 'Product',
      level: BALevel.LEAD,
      lineManagerId: prodPrincipal.id,
      department: 'Product',
      startDate: new Date('2020-04-15')
    });

    const prodLead2 = businessAnalystService.create({
      firstName: 'Thomas',
      lastName: 'Wright',
      email: 'thomas.wright@company.com',
      employeeNo: 'EMP012',
      profession: 'Product',
      level: BALevel.LEAD,
      lineManagerId: prodPrincipal.id,
      department: 'Product',
      startDate: new Date('2020-08-10')
    });

    // Product - Seniors
    const prodSenior1 = businessAnalystService.create({
      firstName: 'Jessica',
      lastName: 'Mitchell',
      email: 'jessica.mitchell@company.com',
      employeeNo: 'EMP013',
      profession: 'Product',
      level: BALevel.SENIOR,
      lineManagerId: prodLead1.id,
      department: 'Product',
      startDate: new Date('2021-03-20')
    });

    const prodSenior2 = businessAnalystService.create({
      firstName: 'Amir',
      lastName: 'Hassan',
      email: 'amir.hassan@company.com',
      employeeNo: 'EMP014',
      profession: 'Product',
      level: BALevel.SENIOR,
      lineManagerId: prodLead2.id,
      department: 'Product',
      startDate: new Date('2021-06-15')
    });

    // Product - Intermediates
    businessAnalystService.create({
      firstName: 'Katie',
      lastName: 'Phillips',
      email: 'katie.phillips@company.com',
      employeeNo: 'EMP015',
      profession: 'Product',
      level: BALevel.INTERMEDIATE,
      lineManagerId: prodSenior1.id,
      department: 'Product',
      startDate: new Date('2022-02-10')
    });

    businessAnalystService.create({
      firstName: 'Benjamin',
      lastName: 'Morgan',
      email: 'benjamin.morgan@company.com',
      employeeNo: 'EMP016',
      profession: 'Product',
      level: BALevel.INTERMEDIATE,
      lineManagerId: prodSenior2.id,
      department: 'Product',
      startDate: new Date('2022-05-20')
    });

    // Product - Consultants
    businessAnalystService.create({
      firstName: 'Amy',
      lastName: 'Stevens',
      email: 'amy.stevens@company.com',
      employeeNo: 'EMP017',
      profession: 'Product',
      level: BALevel.CONSULTANT,
      lineManagerId: prodSenior1.id,
      department: 'Product',
      startDate: new Date('2023-03-01')
    });

    businessAnalystService.create({
      firstName: 'Nina',
      lastName: 'Okonkwo',
      email: 'nina.okonkwo@company.com',
      employeeNo: 'EMP018',
      profession: 'Product',
      level: BALevel.CONSULTANT,
      lineManagerId: prodSenior2.id,
      department: 'Product',
      startDate: new Date('2023-10-01')
    });

    // Delivery - Principal
    const delPrincipal = businessAnalystService.create({
      firstName: 'Victoria',
      lastName: 'Green',
      email: 'victoria.green@company.com',
      employeeNo: 'EMP019',
      profession: 'Delivery',
      level: BALevel.PRINCIPAL,
      department: 'Delivery',
      startDate: new Date('2019-03-01')
    });

    // Delivery - Leads
    const delLead1 = businessAnalystService.create({
      firstName: 'Marcus',
      lastName: 'Johnson',
      email: 'marcus.johnson@company.com',
      employeeNo: 'EMP020',
      profession: 'Delivery',
      level: BALevel.LEAD,
      lineManagerId: delPrincipal.id,
      department: 'Delivery',
      startDate: new Date('2020-05-10')
    });

    const delLead2 = businessAnalystService.create({
      firstName: 'Hannah',
      lastName: 'Brown',
      email: 'hannah.brown@company.com',
      employeeNo: 'EMP021',
      profession: 'Delivery',
      level: BALevel.LEAD,
      lineManagerId: delPrincipal.id,
      department: 'Delivery',
      startDate: new Date('2020-09-15')
    });

    // Delivery - Seniors
    const delSenior1 = businessAnalystService.create({
      firstName: 'Arjun',
      lastName: 'Sharma',
      email: 'arjun.sharma@company.com',
      employeeNo: 'EMP022',
      profession: 'Delivery',
      level: BALevel.SENIOR,
      lineManagerId: delLead1.id,
      department: 'Delivery',
      startDate: new Date('2021-04-10')
    });

    const delSenior2 = businessAnalystService.create({
      firstName: 'Amelia',
      lastName: 'White',
      email: 'amelia.white@company.com',
      employeeNo: 'EMP023',
      profession: 'Delivery',
      level: BALevel.SENIOR,
      lineManagerId: delLead2.id,
      department: 'Delivery',
      startDate: new Date('2021-07-20')
    });

    // Delivery - Intermediates
    businessAnalystService.create({
      firstName: 'Jordan',
      lastName: 'Miller',
      email: 'jordan.miller@company.com',
      employeeNo: 'EMP024',
      profession: 'Delivery',
      level: BALevel.INTERMEDIATE,
      lineManagerId: delSenior1.id,
      department: 'Delivery',
      startDate: new Date('2022-03-15')
    });

    businessAnalystService.create({
      firstName: 'Chloe',
      lastName: 'Adams',
      email: 'chloe.adams@company.com',
      employeeNo: 'EMP025',
      profession: 'Delivery',
      level: BALevel.INTERMEDIATE,
      lineManagerId: delSenior2.id,
      department: 'Delivery',
      startDate: new Date('2022-06-10')
    });

    // Delivery - Consultants
    businessAnalystService.create({
      firstName: 'Jack',
      lastName: 'Turner',
      email: 'jack.turner@company.com',
      employeeNo: 'EMP026',
      profession: 'Delivery',
      level: BALevel.CONSULTANT,
      lineManagerId: delSenior1.id,
      department: 'Delivery',
      startDate: new Date('2023-04-01')
    });

    businessAnalystService.create({
      firstName: 'Lily',
      lastName: 'Walker',
      email: 'lily.walker@company.com',
      employeeNo: 'EMP027',
      profession: 'Delivery',
      level: BALevel.CONSULTANT,
      lineManagerId: delSenior2.id,
      department: 'Delivery',
      startDate: new Date('2023-11-01')
    });

    // Engineering - Principal
    const engPrincipal = businessAnalystService.create({
      firstName: 'Robert',
      lastName: 'Edwards',
      email: 'robert.edwards@company.com',
      employeeNo: 'EMP028',
      profession: 'Engineering',
      level: BALevel.PRINCIPAL,
      department: 'Engineering',
      startDate: new Date('2019-04-01')
    });

    // Engineering - Leads
    const engLead1 = businessAnalystService.create({
      firstName: 'Jennifer',
      lastName: 'Walsh',
      email: 'jennifer.walsh@company.com',
      employeeNo: 'EMP029',
      profession: 'Engineering',
      level: BALevel.LEAD,
      lineManagerId: engPrincipal.id,
      department: 'Engineering',
      startDate: new Date('2020-06-15')
    });

    const engLead2 = businessAnalystService.create({
      firstName: 'Omar',
      lastName: 'Ali',
      email: 'omar.ali@company.com',
      employeeNo: 'EMP030',
      profession: 'Engineering',
      level: BALevel.LEAD,
      lineManagerId: engPrincipal.id,
      department: 'Engineering',
      startDate: new Date('2020-10-10')
    });

    // Engineering - Seniors
    const engSenior1 = businessAnalystService.create({
      firstName: 'Lisa',
      lastName: 'Campbell',
      email: 'lisa.campbell@company.com',
      employeeNo: 'EMP031',
      profession: 'Engineering',
      level: BALevel.SENIOR,
      lineManagerId: engLead1.id,
      department: 'Engineering',
      startDate: new Date('2021-05-10')
    });

    const engSenior2 = businessAnalystService.create({
      firstName: 'Raj',
      lastName: 'Singh',
      email: 'raj.singh@company.com',
      employeeNo: 'EMP032',
      profession: 'Engineering',
      level: BALevel.SENIOR,
      lineManagerId: engLead2.id,
      department: 'Engineering',
      startDate: new Date('2021-08-15')
    });

    // Engineering - Intermediates
    businessAnalystService.create({
      firstName: 'Matthew',
      lastName: 'Price',
      email: 'matthew.price@company.com',
      employeeNo: 'EMP033',
      profession: 'Engineering',
      level: BALevel.INTERMEDIATE,
      lineManagerId: engSenior1.id,
      department: 'Engineering',
      startDate: new Date('2022-04-10')
    });

    businessAnalystService.create({
      firstName: 'Wei',
      lastName: 'Chen',
      email: 'wei.chen@company.com',
      employeeNo: 'EMP034',
      profession: 'Engineering',
      level: BALevel.INTERMEDIATE,
      lineManagerId: engSenior2.id,
      department: 'Engineering',
      startDate: new Date('2022-07-15')
    });

    // Engineering - Consultants
    businessAnalystService.create({
      firstName: 'Grace',
      lastName: 'Martin',
      email: 'grace.martin@company.com',
      employeeNo: 'EMP035',
      profession: 'Engineering',
      level: BALevel.CONSULTANT,
      lineManagerId: engSenior1.id,
      department: 'Engineering',
      startDate: new Date('2023-05-01')
    });

    businessAnalystService.create({
      firstName: 'Fatima',
      lastName: 'Ahmed',
      email: 'fatima.ahmed@company.com',
      employeeNo: 'EMP036',
      profession: 'Engineering',
      level: BALevel.CONSULTANT,
      lineManagerId: engSenior2.id,
      department: 'Engineering',
      startDate: new Date('2023-12-01')
    });

    // Cyber - Principal
    const cyberPrincipal = businessAnalystService.create({
      firstName: 'Katherine',
      lastName: 'Edwards',
      email: 'katherine.edwards@company.com',
      employeeNo: 'EMP037',
      profession: 'Cyber',
      level: BALevel.PRINCIPAL,
      department: 'Cyber Security',
      startDate: new Date('2019-05-01')
    });

    // Cyber - Leads
    const cyberLead1 = businessAnalystService.create({
      firstName: 'Benjamin',
      lastName: 'Harris',
      email: 'benjamin.harris@company.com',
      employeeNo: 'EMP038',
      profession: 'Cyber',
      level: BALevel.LEAD,
      lineManagerId: cyberPrincipal.id,
      department: 'Cyber Security',
      startDate: new Date('2020-07-10')
    });

    const cyberLead2 = businessAnalystService.create({
      firstName: 'Aisha',
      lastName: 'Mohammed',
      email: 'aisha.mohammed@company.com',
      employeeNo: 'EMP039',
      profession: 'Cyber',
      level: BALevel.LEAD,
      lineManagerId: cyberPrincipal.id,
      department: 'Cyber Security',
      startDate: new Date('2020-11-15')
    });

    // Cyber - Seniors
    const cyberSenior1 = businessAnalystService.create({
      firstName: 'William',
      lastName: 'Cook',
      email: 'william.cook@company.com',
      employeeNo: 'EMP040',
      profession: 'Cyber',
      level: BALevel.SENIOR,
      lineManagerId: cyberLead1.id,
      department: 'Cyber Security',
      startDate: new Date('2021-06-10')
    });

    const cyberSenior2 = businessAnalystService.create({
      firstName: 'Yuki',
      lastName: 'Tanaka',
      email: 'yuki.tanaka@company.com',
      employeeNo: 'EMP041',
      profession: 'Cyber',
      level: BALevel.SENIOR,
      lineManagerId: cyberLead2.id,
      department: 'Cyber Security',
      startDate: new Date('2021-09-20')
    });

    // Cyber - Intermediates
    businessAnalystService.create({
      firstName: 'George',
      lastName: 'Mason',
      email: 'george.mason@company.com',
      employeeNo: 'EMP042',
      profession: 'Cyber',
      level: BALevel.INTERMEDIATE,
      lineManagerId: cyberSenior1.id,
      department: 'Cyber Security',
      startDate: new Date('2022-05-15')
    });

    businessAnalystService.create({
      firstName: 'Zainab',
      lastName: 'Khan',
      email: 'zainab.khan@company.com',
      employeeNo: 'EMP043',
      profession: 'Cyber',
      level: BALevel.INTERMEDIATE,
      lineManagerId: cyberSenior2.id,
      department: 'Cyber Security',
      startDate: new Date('2022-08-10')
    });

    // Cyber - Consultants
    businessAnalystService.create({
      firstName: 'Lucy',
      lastName: 'Bennett',
      email: 'lucy.bennett@company.com',
      employeeNo: 'EMP044',
      profession: 'Cyber',
      level: BALevel.CONSULTANT,
      lineManagerId: cyberSenior1.id,
      department: 'Cyber Security',
      startDate: new Date('2023-06-01')
    });

    businessAnalystService.create({
      firstName: 'Liam',
      lastName: 'Hughes',
      email: 'liam.hughes@company.com',
      employeeNo: 'EMP045',
      profession: 'Cyber',
      level: BALevel.CONSULTANT,
      lineManagerId: cyberSenior2.id,
      department: 'Cyber Security',
      startDate: new Date('2024-01-01')
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