import { businessAnalystService } from '../services/businessAnalystService';
import { talentRoundService } from '../services/talentRoundService';
import { BALevel } from '../types';

export const createSampleData = () => {
  try {
    // Business Analysis - Principal
    const baPrincipal = businessAnalystService.create({
      firstName: 'Amara',
      lastName: 'Okafor',
      email: 'amara.okafor@company.com',
      employeeNo: 'EMP001',
      profession: 'Business Analysis',
      level: BALevel.PRINCIPAL,
      department: 'Business Analysis',
      startDate: new Date('2019-01-15')
    });

    // Business Analysis - Leads
    const baLead1 = businessAnalystService.create({
      firstName: 'Wei',
      lastName: 'Chen',
      email: 'wei.chen@company.com',
      employeeNo: 'EMP002',
      profession: 'Business Analysis',
      level: BALevel.LEAD,
      lineManagerId: baPrincipal.id,
      department: 'Business Analysis',
      startDate: new Date('2020-03-10')
    });

    const baLead2 = businessAnalystService.create({
      firstName: 'Fatima',
      lastName: 'Al-Rashid',
      email: 'fatima.alrashid@company.com',
      employeeNo: 'EMP003',
      profession: 'Business Analysis',
      level: BALevel.LEAD,
      lineManagerId: baPrincipal.id,
      department: 'Business Analysis',
      startDate: new Date('2020-07-20')
    });

    // Business Analysis - Seniors
    const baSenior1 = businessAnalystService.create({
      firstName: 'Jamal',
      lastName: 'Thompson',
      email: 'jamal.thompson@company.com',
      employeeNo: 'EMP004',
      profession: 'Business Analysis',
      level: BALevel.SENIOR,
      lineManagerId: baLead1.id,
      department: 'Business Analysis',
      startDate: new Date('2021-02-01')
    });

    const baSenior2 = businessAnalystService.create({
      firstName: 'Priya',
      lastName: 'Desai',
      email: 'priya.desai@company.com',
      employeeNo: 'EMP005',
      profession: 'Business Analysis',
      level: BALevel.SENIOR,
      lineManagerId: baLead2.id,
      department: 'Business Analysis',
      startDate: new Date('2021-05-15')
    });

    // Business Analysis - Intermediates
    businessAnalystService.create({
      firstName: 'Yuki',
      lastName: 'Tanaka',
      email: 'yuki.tanaka@company.com',
      employeeNo: 'EMP006',
      profession: 'Business Analysis',
      level: BALevel.INTERMEDIATE,
      lineManagerId: baSenior1.id,
      department: 'Business Analysis',
      startDate: new Date('2022-01-10')
    });

    businessAnalystService.create({
      firstName: 'Aisha',
      lastName: 'Hassan',
      email: 'aisha.hassan@company.com',
      employeeNo: 'EMP007',
      profession: 'Business Analysis',
      level: BALevel.INTERMEDIATE,
      lineManagerId: baSenior2.id,
      department: 'Business Analysis',
      startDate: new Date('2022-04-20')
    });

    // Business Analysis - Consultants
    businessAnalystService.create({
      firstName: 'Diego',
      lastName: 'Fernandez',
      email: 'diego.fernandez@company.com',
      employeeNo: 'EMP008',
      profession: 'Business Analysis',
      level: BALevel.CONSULTANT,
      lineManagerId: baSenior1.id,
      department: 'Business Analysis',
      startDate: new Date('2023-02-01')
    });

    businessAnalystService.create({
      firstName: 'Zara',
      lastName: 'Nguyen',
      email: 'zara.nguyen@company.com',
      employeeNo: 'EMP009',
      profession: 'Business Analysis',
      level: BALevel.CONSULTANT,
      lineManagerId: baSenior2.id,
      department: 'Business Analysis',
      startDate: new Date('2023-09-01')
    });

    // Product - Principal
    const prodPrincipal = businessAnalystService.create({
      firstName: 'Kwame',
      lastName: 'Mensah',
      email: 'kwame.mensah@company.com',
      employeeNo: 'EMP010',
      profession: 'Product',
      level: BALevel.PRINCIPAL,
      department: 'Product',
      startDate: new Date('2019-02-01')
    });

    // Product - Leads
    const prodLead1 = businessAnalystService.create({
      firstName: 'Mei',
      lastName: 'Wong',
      email: 'mei.wong@company.com',
      employeeNo: 'EMP011',
      profession: 'Product',
      level: BALevel.LEAD,
      lineManagerId: prodPrincipal.id,
      department: 'Product',
      startDate: new Date('2020-04-15')
    });

    const prodLead2 = businessAnalystService.create({
      firstName: 'Ravi',
      lastName: 'Kumar',
      email: 'ravi.kumar@company.com',
      employeeNo: 'EMP012',
      profession: 'Product',
      level: BALevel.LEAD,
      lineManagerId: prodPrincipal.id,
      department: 'Product',
      startDate: new Date('2020-08-10')
    });

    // Product - Seniors
    const prodSenior1 = businessAnalystService.create({
      firstName: 'Lucia',
      lastName: 'Rodriguez',
      email: 'lucia.rodriguez@company.com',
      employeeNo: 'EMP013',
      profession: 'Product',
      level: BALevel.SENIOR,
      lineManagerId: prodLead1.id,
      department: 'Product',
      startDate: new Date('2021-03-20')
    });

    const prodSenior2 = businessAnalystService.create({
      firstName: 'Tariq',
      lastName: 'Ahmed',
      email: 'tariq.ahmed@company.com',
      employeeNo: 'EMP014',
      profession: 'Product',
      level: BALevel.SENIOR,
      lineManagerId: prodLead2.id,
      department: 'Product',
      startDate: new Date('2021-06-15')
    });

    // Product - Intermediates
    businessAnalystService.create({
      firstName: 'Leila',
      lastName: 'Moradi',
      email: 'leila.moradi@company.com',
      employeeNo: 'EMP015',
      profession: 'Product',
      level: BALevel.INTERMEDIATE,
      lineManagerId: prodSenior1.id,
      department: 'Product',
      startDate: new Date('2022-02-10')
    });

    businessAnalystService.create({
      firstName: 'Kofi',
      lastName: 'Addo',
      email: 'kofi.addo@company.com',
      employeeNo: 'EMP016',
      profession: 'Product',
      level: BALevel.INTERMEDIATE,
      lineManagerId: prodSenior2.id,
      department: 'Product',
      startDate: new Date('2022-05-20')
    });

    // Product - Consultants
    businessAnalystService.create({
      firstName: 'Ayesha',
      lastName: 'Khan',
      email: 'ayesha.khan@company.com',
      employeeNo: 'EMP017',
      profession: 'Product',
      level: BALevel.CONSULTANT,
      lineManagerId: prodSenior1.id,
      department: 'Product',
      startDate: new Date('2023-03-01')
    });

    businessAnalystService.create({
      firstName: 'Mateo',
      lastName: 'Silva',
      email: 'mateo.silva@company.com',
      employeeNo: 'EMP018',
      profession: 'Product',
      level: BALevel.CONSULTANT,
      lineManagerId: prodSenior2.id,
      department: 'Product',
      startDate: new Date('2023-10-01')
    });

    // Delivery - Principal
    const delPrincipal = businessAnalystService.create({
      firstName: 'Chioma',
      lastName: 'Nwosu',
      email: 'chioma.nwosu@company.com',
      employeeNo: 'EMP019',
      profession: 'Delivery',
      level: BALevel.PRINCIPAL,
      department: 'Delivery',
      startDate: new Date('2019-03-01')
    });

    // Delivery - Leads
    const delLead1 = businessAnalystService.create({
      firstName: 'Rahul',
      lastName: 'Patel',
      email: 'rahul.patel@company.com',
      employeeNo: 'EMP020',
      profession: 'Delivery',
      level: BALevel.LEAD,
      lineManagerId: delPrincipal.id,
      department: 'Delivery',
      startDate: new Date('2020-05-10')
    });

    const delLead2 = businessAnalystService.create({
      firstName: 'Noor',
      lastName: 'Al-Sayed',
      email: 'noor.alsayed@company.com',
      employeeNo: 'EMP021',
      profession: 'Delivery',
      level: BALevel.LEAD,
      lineManagerId: delPrincipal.id,
      department: 'Delivery',
      startDate: new Date('2020-09-15')
    });

    // Delivery - Seniors
    const delSenior1 = businessAnalystService.create({
      firstName: 'Kenji',
      lastName: 'Yamamoto',
      email: 'kenji.yamamoto@company.com',
      employeeNo: 'EMP022',
      profession: 'Delivery',
      level: BALevel.SENIOR,
      lineManagerId: delLead1.id,
      department: 'Delivery',
      startDate: new Date('2021-04-10')
    });

    const delSenior2 = businessAnalystService.create({
      firstName: 'Yasmin',
      lastName: 'Ibrahim',
      email: 'yasmin.ibrahim@company.com',
      employeeNo: 'EMP023',
      profession: 'Delivery',
      level: BALevel.SENIOR,
      lineManagerId: delLead2.id,
      department: 'Delivery',
      startDate: new Date('2021-07-20')
    });

    // Delivery - Intermediates
    businessAnalystService.create({
      firstName: 'Andre',
      lastName: 'Santos',
      email: 'andre.santos@company.com',
      employeeNo: 'EMP024',
      profession: 'Delivery',
      level: BALevel.INTERMEDIATE,
      lineManagerId: delSenior1.id,
      department: 'Delivery',
      startDate: new Date('2022-03-15')
    });

    businessAnalystService.create({
      firstName: 'Sana',
      lastName: 'Rahman',
      email: 'sana.rahman@company.com',
      employeeNo: 'EMP025',
      profession: 'Delivery',
      level: BALevel.INTERMEDIATE,
      lineManagerId: delSenior2.id,
      department: 'Delivery',
      startDate: new Date('2022-06-10')
    });

    // Delivery - Consultants
    businessAnalystService.create({
      firstName: 'Thabo',
      lastName: 'Mokoena',
      email: 'thabo.mokoena@company.com',
      employeeNo: 'EMP026',
      profession: 'Delivery',
      level: BALevel.CONSULTANT,
      lineManagerId: delSenior1.id,
      department: 'Delivery',
      startDate: new Date('2023-04-01')
    });

    businessAnalystService.create({
      firstName: 'Ming',
      lastName: 'Li',
      email: 'ming.li@company.com',
      employeeNo: 'EMP027',
      profession: 'Delivery',
      level: BALevel.CONSULTANT,
      lineManagerId: delSenior2.id,
      department: 'Delivery',
      startDate: new Date('2023-11-01')
    });

    // Engineering - Principal
    const engPrincipal = businessAnalystService.create({
      firstName: 'Adewale',
      lastName: 'Ogunlesi',
      email: 'adewale.ogunlesi@company.com',
      employeeNo: 'EMP028',
      profession: 'Engineering',
      level: BALevel.PRINCIPAL,
      department: 'Engineering',
      startDate: new Date('2019-04-01')
    });

    // Engineering - Leads
    const engLead1 = businessAnalystService.create({
      firstName: 'Hina',
      lastName: 'Tanaka',
      email: 'hina.tanaka@company.com',
      employeeNo: 'EMP029',
      profession: 'Engineering',
      level: BALevel.LEAD,
      lineManagerId: engPrincipal.id,
      department: 'Engineering',
      startDate: new Date('2020-06-15')
    });

    const engLead2 = businessAnalystService.create({
      firstName: 'Omar',
      lastName: 'Hassan',
      email: 'omar.hassan@company.com',
      employeeNo: 'EMP030',
      profession: 'Engineering',
      level: BALevel.LEAD,
      lineManagerId: engPrincipal.id,
      department: 'Engineering',
      startDate: new Date('2020-10-10')
    });

    // Engineering - Seniors
    const engSenior1 = businessAnalystService.create({
      firstName: 'Lakshmi',
      lastName: 'Krishnan',
      email: 'lakshmi.krishnan@company.com',
      employeeNo: 'EMP031',
      profession: 'Engineering',
      level: BALevel.SENIOR,
      lineManagerId: engLead1.id,
      department: 'Engineering',
      startDate: new Date('2021-05-10')
    });

    const engSenior2 = businessAnalystService.create({
      firstName: 'Carlos',
      lastName: 'Morales',
      email: 'carlos.morales@company.com',
      employeeNo: 'EMP032',
      profession: 'Engineering',
      level: BALevel.SENIOR,
      lineManagerId: engLead2.id,
      department: 'Engineering',
      startDate: new Date('2021-08-15')
    });

    // Engineering - Intermediates
    businessAnalystService.create({
      firstName: 'Samir',
      lastName: 'Nasser',
      email: 'samir.nasser@company.com',
      employeeNo: 'EMP033',
      profession: 'Engineering',
      level: BALevel.INTERMEDIATE,
      lineManagerId: engSenior1.id,
      department: 'Engineering',
      startDate: new Date('2022-04-10')
    });

    businessAnalystService.create({
      firstName: 'Nia',
      lastName: 'Williams',
      email: 'nia.williams@company.com',
      employeeNo: 'EMP034',
      profession: 'Engineering',
      level: BALevel.INTERMEDIATE,
      lineManagerId: engSenior2.id,
      department: 'Engineering',
      startDate: new Date('2022-07-15')
    });

    // Engineering - Consultants
    businessAnalystService.create({
      firstName: 'Xin',
      lastName: 'Zhang',
      email: 'xin.zhang@company.com',
      employeeNo: 'EMP035',
      profession: 'Engineering',
      level: BALevel.CONSULTANT,
      lineManagerId: engSenior1.id,
      department: 'Engineering',
      startDate: new Date('2023-05-01')
    });

    businessAnalystService.create({
      firstName: 'Amina',
      lastName: 'Diallo',
      email: 'amina.diallo@company.com',
      employeeNo: 'EMP036',
      profession: 'Engineering',
      level: BALevel.CONSULTANT,
      lineManagerId: engSenior2.id,
      department: 'Engineering',
      startDate: new Date('2023-12-01')
    });

    // Cyber - Principal
    const cyberPrincipal = businessAnalystService.create({
      firstName: 'Adeola',
      lastName: 'Adeyemi',
      email: 'adeola.adeyemi@company.com',
      employeeNo: 'EMP037',
      profession: 'Cyber',
      level: BALevel.PRINCIPAL,
      department: 'Cyber Security',
      startDate: new Date('2019-05-01')
    });

    // Cyber - Leads
    const cyberLead1 = businessAnalystService.create({
      firstName: 'Ismail',
      lastName: 'Youssef',
      email: 'ismail.youssef@company.com',
      employeeNo: 'EMP038',
      profession: 'Cyber',
      level: BALevel.LEAD,
      lineManagerId: cyberPrincipal.id,
      department: 'Cyber Security',
      startDate: new Date('2020-07-10')
    });

    const cyberLead2 = businessAnalystService.create({
      firstName: 'Mei-Lin',
      lastName: 'Park',
      email: 'meilin.park@company.com',
      employeeNo: 'EMP039',
      profession: 'Cyber',
      level: BALevel.LEAD,
      lineManagerId: cyberPrincipal.id,
      department: 'Cyber Security',
      startDate: new Date('2020-11-15')
    });

    // Cyber - Seniors
    const cyberSenior1 = businessAnalystService.create({
      firstName: 'Javon',
      lastName: 'Jackson',
      email: 'javon.jackson@company.com',
      employeeNo: 'EMP040',
      profession: 'Cyber',
      level: BALevel.SENIOR,
      lineManagerId: cyberLead1.id,
      department: 'Cyber Security',
      startDate: new Date('2021-06-10')
    });

    const cyberSenior2 = businessAnalystService.create({
      firstName: 'Sanaa',
      lastName: 'Mohammed',
      email: 'sanaa.mohammed@company.com',
      employeeNo: 'EMP041',
      profession: 'Cyber',
      level: BALevel.SENIOR,
      lineManagerId: cyberLead2.id,
      department: 'Cyber Security',
      startDate: new Date('2021-09-20')
    });

    // Cyber - Intermediates
    businessAnalystService.create({
      firstName: 'Arjun',
      lastName: 'Reddy',
      email: 'arjun.reddy@company.com',
      employeeNo: 'EMP042',
      profession: 'Cyber',
      level: BALevel.INTERMEDIATE,
      lineManagerId: cyberSenior1.id,
      department: 'Cyber Security',
      startDate: new Date('2022-05-15')
    });

    businessAnalystService.create({
      firstName: 'Camila',
      lastName: 'Gomez',
      email: 'camila.gomez@company.com',
      employeeNo: 'EMP043',
      profession: 'Cyber',
      level: BALevel.INTERMEDIATE,
      lineManagerId: cyberSenior2.id,
      department: 'Cyber Security',
      startDate: new Date('2022-08-10')
    });

    // Cyber - Consultants
    businessAnalystService.create({
      firstName: 'Kwesi',
      lastName: 'Boateng',
      email: 'kwesi.boateng@company.com',
      employeeNo: 'EMP044',
      profession: 'Cyber',
      level: BALevel.CONSULTANT,
      lineManagerId: cyberSenior1.id,
      department: 'Cyber Security',
      startDate: new Date('2023-06-01')
    });

    businessAnalystService.create({
      firstName: 'Rina',
      lastName: 'Sato',
      email: 'rina.sato@company.com',
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