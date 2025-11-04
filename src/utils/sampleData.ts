import { businessAnalystService } from '../services/businessAnalystService';
import { talentRoundService } from '../services/talentRoundService';
import { BALevel } from '../types';

export const createSampleData = () => {
  try {
    // Business Analysis - Principal
    const baPrincipal = businessAnalystService.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      employeeNo: 'EMP001',
      profession: 'Business Analysis',
      level: BALevel.PRINCIPAL,
      department: 'Business Analysis',
      startDate: new Date('2019-01-15')
    });

    // Business Analysis - Leads
    const baLead1 = businessAnalystService.create({
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@company.com',
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
      firstName: 'Alex',
      lastName: 'Taylor',
      email: 'alex.taylor@company.com',
      employeeNo: 'EMP006',
      profession: 'Business Analysis',
      level: BALevel.INTERMEDIATE,
      lineManagerId: baSenior1.id,
      department: 'Business Analysis',
      startDate: new Date('2022-01-10')
    });

    businessAnalystService.create({
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@company.com',
      employeeNo: 'EMP007',
      profession: 'Business Analysis',
      level: BALevel.INTERMEDIATE,
      lineManagerId: baSenior2.id,
      department: 'Business Analysis',
      startDate: new Date('2022-04-20')
    });

    // Business Analysis - Consultants
    businessAnalystService.create({
      firstName: 'Casey',
      lastName: 'Anderson',
      email: 'casey.anderson@company.com',
      employeeNo: 'EMP008',
      profession: 'Business Analysis',
      level: BALevel.CONSULTANT,
      lineManagerId: baSenior1.id,
      department: 'Business Analysis',
      startDate: new Date('2023-02-01')
    });

    businessAnalystService.create({
      firstName: 'Riley',
      lastName: 'Brooks',
      email: 'riley.brooks@company.com',
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
      lastName: 'Thompson',
      email: 'david.thompson@company.com',
      employeeNo: 'EMP010',
      profession: 'Product',
      level: BALevel.PRINCIPAL,
      department: 'Product',
      startDate: new Date('2019-02-01')
    });

    // Product - Leads
    const prodLead1 = businessAnalystService.create({
      firstName: 'Rachel',
      lastName: 'Kim',
      email: 'rachel.kim@company.com',
      employeeNo: 'EMP011',
      profession: 'Product',
      level: BALevel.LEAD,
      lineManagerId: prodPrincipal.id,
      department: 'Product',
      startDate: new Date('2020-04-15')
    });

    const prodLead2 = businessAnalystService.create({
      firstName: 'Tom',
      lastName: 'Hughes',
      email: 'tom.hughes@company.com',
      employeeNo: 'EMP012',
      profession: 'Product',
      level: BALevel.LEAD,
      lineManagerId: prodPrincipal.id,
      department: 'Product',
      startDate: new Date('2020-08-10')
    });

    // Product - Seniors
    const prodSenior1 = businessAnalystService.create({
      firstName: 'Nina',
      lastName: 'Rodriguez',
      email: 'nina.rodriguez@company.com',
      employeeNo: 'EMP013',
      profession: 'Product',
      level: BALevel.SENIOR,
      lineManagerId: prodLead1.id,
      department: 'Product',
      startDate: new Date('2021-03-20')
    });

    const prodSenior2 = businessAnalystService.create({
      firstName: 'Oliver',
      lastName: 'Wright',
      email: 'oliver.wright@company.com',
      employeeNo: 'EMP014',
      profession: 'Product',
      level: BALevel.SENIOR,
      lineManagerId: prodLead2.id,
      department: 'Product',
      startDate: new Date('2021-06-15')
    });

    // Product - Intermediates
    businessAnalystService.create({
      firstName: 'Maya',
      lastName: 'Singh',
      email: 'maya.singh@company.com',
      employeeNo: 'EMP015',
      profession: 'Product',
      level: BALevel.INTERMEDIATE,
      lineManagerId: prodSenior1.id,
      department: 'Product',
      startDate: new Date('2022-02-10')
    });

    businessAnalystService.create({
      firstName: 'Ethan',
      lastName: 'Moore',
      email: 'ethan.moore@company.com',
      employeeNo: 'EMP016',
      profession: 'Product',
      level: BALevel.INTERMEDIATE,
      lineManagerId: prodSenior2.id,
      department: 'Product',
      startDate: new Date('2022-05-20')
    });

    // Product - Consultants
    businessAnalystService.create({
      firstName: 'Zoe',
      lastName: 'Lewis',
      email: 'zoe.lewis@company.com',
      employeeNo: 'EMP017',
      profession: 'Product',
      level: BALevel.CONSULTANT,
      lineManagerId: prodSenior1.id,
      department: 'Product',
      startDate: new Date('2023-03-01')
    });

    businessAnalystService.create({
      firstName: 'Lucas',
      lastName: 'Baker',
      email: 'lucas.baker@company.com',
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
      lastName: 'Foster',
      email: 'marcus.foster@company.com',
      employeeNo: 'EMP020',
      profession: 'Delivery',
      level: BALevel.LEAD,
      lineManagerId: delPrincipal.id,
      department: 'Delivery',
      startDate: new Date('2020-05-10')
    });

    const delLead2 = businessAnalystService.create({
      firstName: 'Hannah',
      lastName: 'Clarke',
      email: 'hannah.clarke@company.com',
      employeeNo: 'EMP021',
      profession: 'Delivery',
      level: BALevel.LEAD,
      lineManagerId: delPrincipal.id,
      department: 'Delivery',
      startDate: new Date('2020-09-15')
    });

    // Delivery - Seniors
    const delSenior1 = businessAnalystService.create({
      firstName: 'Daniel',
      lastName: 'Scott',
      email: 'daniel.scott@company.com',
      employeeNo: 'EMP022',
      profession: 'Delivery',
      level: BALevel.SENIOR,
      lineManagerId: delLead1.id,
      department: 'Delivery',
      startDate: new Date('2021-04-10')
    });

    const delSenior2 = businessAnalystService.create({
      firstName: 'Amelia',
      lastName: 'Cooper',
      email: 'amelia.cooper@company.com',
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
      firstName: 'Ryan',
      lastName: 'Phillips',
      email: 'ryan.phillips@company.com',
      employeeNo: 'EMP026',
      profession: 'Delivery',
      level: BALevel.CONSULTANT,
      lineManagerId: delSenior1.id,
      department: 'Delivery',
      startDate: new Date('2023-04-01')
    });

    businessAnalystService.create({
      firstName: 'Lily',
      lastName: 'Turner',
      email: 'lily.turner@company.com',
      employeeNo: 'EMP027',
      profession: 'Delivery',
      level: BALevel.CONSULTANT,
      lineManagerId: delSenior2.id,
      department: 'Delivery',
      startDate: new Date('2023-11-01')
    });

    // Engineering - Principal
    const engPrincipal = businessAnalystService.create({
      firstName: 'Andrew',
      lastName: 'Mitchell',
      email: 'andrew.mitchell@company.com',
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
      firstName: 'Robert',
      lastName: 'Hayes',
      email: 'robert.hayes@company.com',
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
      lastName: 'Brown',
      email: 'lisa.brown@company.com',
      employeeNo: 'EMP031',
      profession: 'Engineering',
      level: BALevel.SENIOR,
      lineManagerId: engLead1.id,
      department: 'Engineering',
      startDate: new Date('2021-05-10')
    });

    const engSenior2 = businessAnalystService.create({
      firstName: 'Kevin',
      lastName: 'Murphy',
      email: 'kevin.murphy@company.com',
      employeeNo: 'EMP032',
      profession: 'Engineering',
      level: BALevel.SENIOR,
      lineManagerId: engLead2.id,
      department: 'Engineering',
      startDate: new Date('2021-08-15')
    });

    // Engineering - Intermediates
    businessAnalystService.create({
      firstName: 'Sophia',
      lastName: 'Reed',
      email: 'sophia.reed@company.com',
      employeeNo: 'EMP033',
      profession: 'Engineering',
      level: BALevel.INTERMEDIATE,
      lineManagerId: engSenior1.id,
      department: 'Engineering',
      startDate: new Date('2022-04-10')
    });

    businessAnalystService.create({
      firstName: 'Jacob',
      lastName: 'Powell',
      email: 'jacob.powell@company.com',
      employeeNo: 'EMP034',
      profession: 'Engineering',
      level: BALevel.INTERMEDIATE,
      lineManagerId: engSenior2.id,
      department: 'Engineering',
      startDate: new Date('2022-07-15')
    });

    // Engineering - Consultants
    businessAnalystService.create({
      firstName: 'Mia',
      lastName: 'Bennett',
      email: 'mia.bennett@company.com',
      employeeNo: 'EMP035',
      profession: 'Engineering',
      level: BALevel.CONSULTANT,
      lineManagerId: engSenior1.id,
      department: 'Engineering',
      startDate: new Date('2023-05-01')
    });

    businessAnalystService.create({
      firstName: 'Noah',
      lastName: 'Gray',
      email: 'noah.gray@company.com',
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
      lastName: 'Price',
      email: 'benjamin.price@company.com',
      employeeNo: 'EMP038',
      profession: 'Cyber',
      level: BALevel.LEAD,
      lineManagerId: cyberPrincipal.id,
      department: 'Cyber Security',
      startDate: new Date('2020-07-10')
    });

    const cyberLead2 = businessAnalystService.create({
      firstName: 'Charlotte',
      lastName: 'Ross',
      email: 'charlotte.ross@company.com',
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
      firstName: 'Isabella',
      lastName: 'Morgan',
      email: 'isabella.morgan@company.com',
      employeeNo: 'EMP041',
      profession: 'Cyber',
      level: BALevel.SENIOR,
      lineManagerId: cyberLead2.id,
      department: 'Cyber Security',
      startDate: new Date('2021-09-20')
    });

    // Cyber - Intermediates
    businessAnalystService.create({
      firstName: 'Mason',
      lastName: 'Bell',
      email: 'mason.bell@company.com',
      employeeNo: 'EMP042',
      profession: 'Cyber',
      level: BALevel.INTERMEDIATE,
      lineManagerId: cyberSenior1.id,
      department: 'Cyber Security',
      startDate: new Date('2022-05-15')
    });

    businessAnalystService.create({
      firstName: 'Ava',
      lastName: 'Collins',
      email: 'ava.collins@company.com',
      employeeNo: 'EMP043',
      profession: 'Cyber',
      level: BALevel.INTERMEDIATE,
      lineManagerId: cyberSenior2.id,
      department: 'Cyber Security',
      startDate: new Date('2022-08-10')
    });

    // Cyber - Consultants
    businessAnalystService.create({
      firstName: 'Liam',
      lastName: 'Stewart',
      email: 'liam.stewart@company.com',
      employeeNo: 'EMP044',
      profession: 'Cyber',
      level: BALevel.CONSULTANT,
      lineManagerId: cyberSenior1.id,
      department: 'Cyber Security',
      startDate: new Date('2023-06-01')
    });

    businessAnalystService.create({
      firstName: 'Emma',
      lastName: 'Watson',
      email: 'emma.watson@company.com',
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