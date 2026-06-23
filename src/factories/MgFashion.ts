// ─────────────────────────────────────────────────────────────────────────────
// MG FASHION LIMITED — Factory definition (demo / placeholder)
// Status: active: true — sub-factory of MG SHIRTEX LTD.
// When this factory goes live:
//   1. Set active: true
//   2. Replace all placeholder values with real data
//   3. Add users in src/auth/users.ts with factoryId: 'mg_fashion'
// ─────────────────────────────────────────────────────────────────────────────

import type { FactoryConfig } from './FactoryTypes';

export const MG_FASHION: FactoryConfig = {

  // ════════════════════════════════════════════════════════════════════════════
  // IDENTITY
  // ════════════════════════════════════════════════════════════════════════════
  id:         'mg_fashion',
  nameEn:     'MG FASHION LIMITED',
  nameBn:     'এমজি ফ্যাশন লিমিটেড',
  addressEn:  'Pubail, Gazipur',
  addressBn:  'পূবাইল, গাজীপুর',
  spreadsheetId: '1W7QI4W21TskVlJx5bxp0cnEgAlb9mxGLIPjtAS1KZAI',
  active:     true,
  db: { 
    adapter:   'sheets',
    spreadsheetId: '1W7QI4W21TskVlJx5bxp0cnEgAlb9mxGLIPjtAS1KZAI',
    sheetsUrl:     'https://script.google.com/macros/s/AKfycbzax0PfqWK1Gy6Iuj5rA9_LnacP3BQbr6dh_mUfab-UeKRTWtc1h7haSuiFQP8WMV9J/exec',
    sheetsKey:     'Saiful@1985',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // AUTHORITIES  (replace with real names when active)
  // ════════════════════════════════════════════════════════════════════════════
  authorities: {
    factoryHead: {
      name:           'কারখানা প্রধানের নাম',
      nameEn:         'Factory Head Name',
      designation:    'কারখানা প্রধান',
      designationEn:  'Factory Head',
    },
    hrManager: {
      name:           'এইচআর ব্যবস্থাপকের নাম',
      nameEn:         'HR Manager Name',
      designation:    'ব্যবস্থাপক (মানবসম্পদ)',
      designationEn:  'Manager (HR & Compliance)',
    },
    hoHrHead: {
      name:           'প্রধান কার্যালয় এইচআর প্রধানের নাম',
      nameEn:         'HO HR Head Name',
      designation:    'সিনিয়র ব্যবস্থাপক (এইচআর)',
      designationEn:  'Sr. Manager (HO HR & Compliance)',
    },
    headOfOperations: {
      name:           'পরিচালন প্রধানের নাম',
      nameEn:         'Head of Operations Name',
      designation:    'পরিচালন প্রধান',
      designationEn:  'Head of Operations',
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MEETING AUTHORITIES  (replace with real names when active)
  // ════════════════════════════════════════════════════════════════════════════
  meetingAuthorities: [
    { name: 'কারখানা প্রধানের নাম',     designation: 'কারখানা প্রধান' },
    { name: 'এইচআর ব্যবস্থাপকের নাম', designation: 'ব্যবস্থাপক (মানবসম্পদ)' },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // COMMITTEES  (demo structure — replace with real data when active)
  // ════════════════════════════════════════════════════════════════════════════
  committees: [
    {
      id: 'safety', name: 'নিরাপত্তা কমিটি',
      chairperson: 'সভাপতির নাম', chairpersonGender: 'পুরুষ',
      chairpersonDesignation: 'পদবী', chairpersonDept: 'বিভাগ',
      secretary: 'সম্পাদকের নাম', secretaryGender: 'পুরুষ',
      secretaryDesignation: 'পদবী', secretaryDept: 'বিভাগ',
      establishDate: '', members: [],
    },
    {
      id: 'participation', name: 'অংশগ্রহণ কমিটি',
      chairperson: 'সভাপতির নাম', chairpersonGender: 'পুরুষ',
      chairpersonDesignation: 'পদবী', chairpersonDept: 'বিভাগ',
      secretary: 'সম্পাদকের নাম', secretaryGender: 'পুরুষ',
      secretaryDesignation: 'পদবী', secretaryDept: 'বিভাগ',
      establishDate: '', members: [],
    },
    {
      id: 'cba', name: 'ট্রেড ইউনিয়ন (সিবিএ) কমিটি',
      chairperson: 'সভাপতির নাম', chairpersonGender: 'পুরুষ',
      chairpersonDesignation: 'পদবী', chairpersonDept: 'বিভাগ',
      secretary: 'সম্পাদকের নাম', secretaryGender: 'মহিলা',
      secretaryDesignation: 'পদবী', secretaryDept: 'বিভাগ',
      establishDate: '', members: [],
    },
    {
      id: 'canteen', name: 'ক্যান্টিন কমিটি',
      chairperson: 'সভাপতির নাম', chairpersonGender: 'মহিলা',
      chairpersonDesignation: 'পদবী', chairpersonDept: 'বিভাগ',
      secretary: 'সম্পাদকের নাম', secretaryGender: 'পুরুষ',
      secretaryDesignation: 'পদবী', secretaryDept: 'বিভাগ',
      establishDate: '', members: [],
    },
    {
      id: 'harassment', name: 'অভিযোগ ও হয়রানি প্রতিরোধ কমিটি',
      chairperson: 'সভাপতির নাম', chairpersonGender: 'মহিলা',
      chairpersonDesignation: 'পদবী', chairpersonDept: 'বিভাগ',
      secretary: 'সম্পাদকের নাম', secretaryGender: 'মহিলা',
      secretaryDesignation: 'পদবী', secretaryDept: 'বিভাগ',
      establishDate: '', members: [],
    },
  ],


  // ════════════════════════════════════════════════════════════════════════════
  // WORKER GUIDELINE HR CONFIG — salary, leave, working hours, notice periods.
  // Edit here to update the Worker Guideline page for this factory.
  // ════════════════════════════════════════════════════════════════════════════
  workerGuidelineConfig: {
    salary: {
      basicSalary:       6700,
      houseRent:         3350,
      medicalAllowance:   750,
      transport:          450,
      foodAllowance:     1250,
      total:            12500,
    },
    workingHoursPerDay:  8,
    maxOvertimeHours:    2,
    overtimeFormula:     'মূলবেতন ÷ ২০৮ × ২ × অতিরিক্ত কাজের ঘণ্টা',
    probationMonths:     3,
    noticePeriodDays: { permanent: 60, temporary: 30, other: 14 },
    leave: {
      casualLeave:    10,
      sickLeave:      14,
      annualLeave:    14,
      festivalLeave:  11,
      maternityLeave: 112,
      hajjLeave:      30,
    },
    environmentTargets: {
      ghgReductionPct:   30,
      waterReductionPct: 25,
      wasteReductionPct: 25,
      targetYear:        2030,
    },
    salaryPaymentDays: 7,
    lunchBreakStart:   '১:০০',
    lunchBreakEnd:     '২:০০',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // WORKER GUIDELINE PROFILE  (replace placeholder values with real data)
  // ════════════════════════════════════════════════════════════════════════════
  workerProfile: {
    establishedYear:   '২০১২',
    totalFloors:       5,
    totalWorkers:      900,
    totalShifts:       1,
    totalSewingLines:  8,
    totalBathrooms:    65,
    dailyProduction:   10000,
    monthlyProduction: 300000,
    yearlyProduction:  3600000,
    welfareOfficers: [
      { name: 'ওয়েলফেয়ার অফিসার', designation: 'ওয়েলফেয়ার অফিসার' },
    ],
    hotlines: [
      { label: 'হট লাইন', number: '01700000001' },
    ],
    buyers:       ['H & M', 'Springfield', 'Primark'],
    productTypes: ['Man Shirt', 'Ladies Shirt', 'Boys Shirt'],
    sections:     ['Cutting', 'Sewing', 'Finishing', 'Quality', 'Packing'],
  },
};