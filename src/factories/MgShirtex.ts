// ─────────────────────────────────────────────────────────────────────────────
// MG SHIRTEX LTD. — Complete factory definition
// Edit ONLY this file to update anything about MG SHIRTEX across the entire app.
// ─────────────────────────────────────────────────────────────────────────────

import type { FactoryConfig } from './FactoryTypes';

export const MG_SHIRTEX: FactoryConfig = {

  // ════════════════════════════════════════════════════════════════════════════
  // IDENTITY
  // ════════════════════════════════════════════════════════════════════════════
  id:        'mg_shirtex',
  nameEn:    'MG SHIRTEX LTD.',
  nameBn:    'এমজি শার্টেক্স লিমিটেড',
  addressEn: '32, Lakshmipura, Chandana, Joydebpur, Gazipur-1700',
  addressBn: '৩২, লক্ষ্মীপুরা, চন্দনা, জয়দেবপুর, গাজীপুর-১৭০০।',
  spreadsheetId: '19vrtziPadEt4LzAn_qGvhl87elzsoxZmQ1qvNQY_2wg',
  active:    true,

  // ── Database: MG Shirtex uses Google Sheets ───────────────────────────────
  db: {
    adapter:       'sheets',
    spreadsheetId: '19vrtziPadEt4LzAn_qGvhl87elzsoxZmQ1qvNQY_2wg',
    sheetsUrl:     'https://script.google.com/macros/s/AKfycbzax0PfqWK1Gy6Iuj5rA9_LnacP3BQbr6dh_mUfab-UeKRTWtc1h7haSuiFQP8WMV9J/exec',
    sheetsKey:     'Saiful@1985',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // AUTHORITIES  (used in increment bills, settlements, requisitions, etc.)
  // ════════════════════════════════════════════════════════════════════════════
  authorities: {
    honorableChairman: {
      name:          'ড. রুবানা হক',
      nameEn:        'Dr. Rubana Huq',
      designation:   'চেয়ারম্যান',
      designationEn: 'Chairman',
      email:         '',
      phone:         '',
    },
    honorableMD: {
      name:          'নাবিদুল হক',
      nameEn:        'Navidul Huq',
      designation:   'ব্যবস্থাপনা পরিচালক',
      designationEn: 'Managing Director',
      email:         '',
      phone:         '',
    },
    factoryHead: {
      name:          'পাঞ্জাব আলী',
      nameEn:        'Md. Panzab Ali',
      designation:   'কারখানা প্রধান',
      designationEn: 'Sr. Manager (Factory)',
      email:         '',
      phone:         '',
    },
    hrManager: {
      name:          'সাইফুল ইসলাম',
      nameEn:        'Saiful Islam',
      designation:   'ব্যবস্থাপক (মানবসম্পদ, প্রশাসন ও কমপ্লায়েন্স)',
      designationEn: 'Manager (HR, Admin & Compliance)',
      email:         '',
      phone:         '',
    },
    hoHrHead: {
      name:          'মোঃ একরামুল হক',
      nameEn:        'Md. Ekramul Haque',
      designation:   'সিনিয়র ব্যবস্থাপক (প্রধান কার্যালয় এইচআর ও কমপ্লায়েন্স)',
      designationEn: 'Sr. Manager (HO HR & Compliance)',
      email:         '',
      phone:         '',
    },
    headOfOperations: {
      name:          'মোঃ রেহান ইদ্রিসী',
      nameEn:        'Md. Rehan Idrisee',
      designation:   'অপারেশনের প্রধান',
      designationEn: 'Head of Operations',
      email:         '',
      phone:         '',
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MEETING AUTHORITIES  (Bengali — shown on meeting minutes signature blocks)
  // ════════════════════════════════════════════════════════════════════════════
  meetingAuthorities: [
    { name: 'পাঞ্জাব আলী',   designation: 'কারখানা প্রধান' },
    { name: 'সাইফুল ইসলাম', designation: 'ব্যবস্থাপক (মানবসম্পদ, প্রশাসন ও সম্মতি)' },
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // COMMITTEES  (used in meeting minutes module)
  // ════════════════════════════════════════════════════════════════════════════

  // ════════════════════════════════════════════════════════════════════════════
  // WORKER GUIDELINE — HR policy data (salary, leave, overtime, environment)
  // Uses the new WorkerGuideline interface (split probation, split notice,
  // two lunch shifts, string numerals for Bengali display).
  // ════════════════════════════════════════════════════════════════════════════
  workerGuideline: {
    salary: {
      basicSalary:       6700,
      houseRent:         3350,
      medicalAllowance:   750,
      transport:          450,
      foodAllowance:     1250,
      total:            12500,
    },
    workingHoursPerDay:    '৮',
    maxOvertimeHours:      '২',
    overtimeFormula:       'মূলবেতন ÷ ২০৮ × ২ × অতিরিক্ত কাজের ঘণ্টা',
    probationMonthsSkill:  '৩',
    probationMonthsUnSkill:'৬',
    noticePeriodDaysOwner:  { permanent: 120, temporary: 30, other: 14 },
    noticePeriodDaysWorker: { permanent: 60,  temporary: 30 },
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
    salaryPaymentDays: '৭',
    lunchScheduleOne:  'দুপুর ১:০০ টা থেকে ২:০০ টা',
    lunchScheduleTwo:  'দুপুর ১:৩০ টা থেকে ২:৩০ টা',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // WORKER GUIDELINE PROFILE  (section 1 — কারখানা পরিচিতি, section 17 hotlines, footer)
  // workerGuidelineTopics is not set → all 32 topics are shown for this factory.
  // ════════════════════════════════════════════════════════════════════════════
  workerProfile: {
    establishedYear:   '২০০৫',
    totalFloors:       6,
    totalWorkers:      1197,
    totalShifts:       1,
    totalSewingLines:  9,
    totalBathrooms:    78,
    dailyProduction:   13461,
    monthlyProduction: 350000,
    yearlyProduction:  4200000,
    welfareOfficers: [
      { name: 'নাজনীন নাহার', designation: 'ওয়েলফেয়ার অফিসার' },
    ],
    hotlines: [
      { label: 'অভিযোগ (HO)', number: '01730319917' },
      { label: 'অভিযোগ',      number: '01323522190' },
      { label: 'নিরাপত্তা',   number: '01861393111' },
      { label: 'পরিবেশ',      number: '01946825593' },
    ],
    buyers:       ['H & M', 'Primark', 'Springfield', 'TMS', 'ZXY'],
    productTypes: ['Mens Shirt', 'Ladies Shirt', 'Boys Shirt', 'Casual Shirt'],
    sections:     ['Cutting', 'Sewing', 'Finishing', 'Quality', 'Button', 'Packing'],
  },

  committees: [
    {
      id:                     'safety',
      name:                   'নিরাপত্তা কমিটি',
      chairperson:            'নাজনীন নাহার',
      chairpersonGender:      'মহিলা',
      chairpersonDesignation: 'ওয়েলফেয়ার অফিসার',
      chairpersonDept:        'এইচ আর এডমিন এন্ড কমপ্লায়েন্স বিভাগ',
      secretary:              'মোঃ নয়ন আহমেদ',
      secretaryGender:        'পুরুষ',
      secretaryDesignation:   'এক্সিকিউটিভ',
      secretaryDept:          'ফায়ার এন্ড সেইফটি',
      establishDate:          '2024-07-07',
      members: [
        { name: 'রাজীব ঘোষ',        gender: 'পুরুষ',  designation: 'উপ-ব্যবস্থাপক',          section: 'সেলাই বিভাগ' },
        { name: 'রাহুল কর্মকার',      gender: 'পুরুষ',  designation: 'সহঃ ইঞ্জিনিয়ার',        section: 'মেইনটেন্যান্স বিভাগ' },
        { name: 'লিপি হালদার',        gender: 'মহিলা', designation: 'নার্স',                   section: 'এইচ আর এডমিন এন্ড কমপ্লায়েন্স বিভাগ' },
        { name: 'মোঃ শফিকুল ইসলাম',  gender: 'পুরুষ',  designation: 'কোয়ালিটি ইন্সপেক্টর',   section: 'কোয়ালিটি বিভাগ' },
        { name: 'মোছাঃ নাজমা',        gender: 'মহিলা', designation: 'অপারেটর',                 section: 'সেলাই বিভাগ' },
        { name: 'মোছাঃ রাবেয়া',       gender: 'মহিলা', designation: 'সহঃ ফিনিশিং',            section: 'ফিনিশিং' },
        { name: 'রোকসানা আক্তার',     gender: 'মহিলা', designation: 'অপারেটর',                 section: 'নিরাপত্তা বিভাগ' },
        { name: 'মোঃ মনির হোসেন',     gender: 'পুরুষ',  designation: 'আয়রন ম্যান',             section: 'সেলাই বিভাগ' },
      ],
    },

    {
      id:                     'participation',
      name:                   'অংশগ্রহণ কমিটি',
      chairperson:            'মোঃ সাইফুল ইসলাম',
      chairpersonGender:      'পুরুষ',
      chairpersonDesignation: 'ব্যবস্থাপক',
      chairpersonDept:        'মানবসম্পদ বিভাগ',
      secretary:              'মোঃ ছায়রুল ইসলাম',
      secretaryGender:        'পুরুষ',
      secretaryDesignation:   'সুপারভাইজার',
      secretaryDept:          'এইচআর বিভাগ',
      establishDate:          '2021-06-20',
      members: [
        { name: 'মোঃ সাইফুল ইসলাম',        gender: 'পুরুষ',  designation: 'সুপারভাইজার',            section: 'সেলাই বিভাগ' },
        { name: 'নাসিমা আক্তার',             gender: 'মহিলা', designation: 'অপারেটর',                 section: 'ফিনিশিং বিভাগ' },
        { name: 'মোঃ ইমরান হোসেন',          gender: 'পুরুষ',  designation: 'লাইন চিফ',               section: 'কাটিং বিভাগ' },
        { name: 'তানিয়া বেগম',               gender: 'মহিলা', designation: 'অপারেটর',                 section: 'সেলাই বিভাগ' },
        { name: 'মোঃ মাসুদ রানা',           gender: 'পুরুষ',  designation: 'টেকনিশিয়ান',            section: 'মেইনটেন্যান্স' },
        { name: 'ফাতেমা খাতুন',              gender: 'মহিলা', designation: 'হেল্পার',                 section: 'সেলাই বিভাগ' },
        { name: 'মোঃ রাকিবুল হাসান',        gender: 'পুরুষ',  designation: 'আইটি অফিসার',           section: 'আইটি বিভাগ' },
        { name: 'শামীমা আক্তার',             gender: 'মহিলা', designation: 'অপারেটর',                 section: 'কোয়ালিটি বিভাগ' },
        { name: 'মোঃ আল আমিন',              gender: 'পুরুষ',  designation: 'স্টোর অ্যাসিস্ট্যান্ট', section: 'স্টোর বিভাগ' },
        { name: 'জেসমিন আক্তার',             gender: 'মহিলা', designation: 'অপারেটর',                 section: 'ফিনিশিং বিভাগ' },
      ],
    },

    {
      id:                     'cba',
      name:                   'ট্রেড ইউনিয়ন (সিবিএ) কমিটি',
      chairperson:            'মোঃ শফিকুল ইসলাম',
      chairpersonGender:      'পুরুষ',
      chairpersonDesignation: 'কোয়ালিটি ইন্সপেক্টর',
      chairpersonDept:        'কোয়ালিটি বিভাগ',
      secretary:              'মোসাম্মৎ ডলি বেগম',
      secretaryGender:        'মহিলা',
      secretaryDesignation:   'অপারেটর',
      secretaryDept:          'সেলাই বিভাগ',
      establishDate:          '2023-03-23',
      members: [
        { name: 'মোঃ সেলিম খান',     gender: 'পুরুষ',  designation: 'অপারেটর',        section: 'সেলাই বিভাগ' },
        { name: 'মোঃ গিয়াস উদ্দিন',  gender: 'পুরুষ',  designation: 'অপারেটর',        section: 'সেলাই বিভাগ' },
        { name: 'মোছাঃ রহিমা বেগম',  gender: 'মহিলা', designation: 'অপারেটর',        section: 'সেলাই বিভাগ' },
        { name: 'মোছাঃ হাসি আক্তার', gender: 'মহিলা', designation: 'অপারেটর',        section: 'কাটিং বিভাগ' },
        { name: 'মনিরুজ্জামান',       gender: 'পুরুষ',  designation: 'সিনিঃ অপারেটর', section: 'সেলাই বিভাগ' },
        { name: 'মোঃ বিপুল মন্ডল',   gender: 'পুরুষ',  designation: 'অপারেটর',        section: 'সেলাই বিভাগ' },
      ],
    },

    {
      id:                     'canteen',
      name:                   'ক্যান্টিন কমিটি',
      chairperson:            'নাজনীন নাহার',
      chairpersonGender:      'মহিলা',
      chairpersonDesignation: 'ওয়েলফেয়ার অফিসার',
      chairpersonDept:        'এইচ আর এডমিন এন্ড কমপ্লায়েন্স বিভাগ',
      secretary:              'শাহ মোঃ ছায়রুল ইসলাম',
      secretaryGender:        'পুরুষ',
      secretaryDesignation:   'সহকারী ব্যবস্থাপক',
      secretaryDept:          'এইচ আর এডমিন এন্ড কমপ্লায়েন্স বিভাগ',
      establishDate:          '2022-12-22',
      members: [
        { name: 'মোঃ ফরিদ আহমেদ',        gender: 'পুরুষ',  designation: 'জুনিঃ সুপারভাইজার',        section: 'সেলাই বিভাগ' },
        { name: 'নাসির হোসেন',             gender: 'পুরুষ',  designation: 'অপারেটর',                   section: 'সেলাই বিভাগ' },
        { name: 'মোছাঃ শাহানাজ শানু',     gender: 'মহিলা', designation: 'সিঃ অপারেটর',              section: 'সেলাই বিভাগ' },
        { name: 'মোঃ আইয়ুব আলী',         gender: 'পুরুষ',  designation: 'সিঃ কোয়ালিটি ইন্সপেক্টর', section: 'কোয়ালিটি বিভাগ' },
        { name: 'সুস্মিতা রানী মজুমদার', gender: 'মহিলা', designation: 'সুপারভাইজার',               section: 'সেলাই বিভাগ' },
        { name: 'মোছাঃ ডলি আক্তার',      gender: 'মহিলা', designation: 'অপারেটর',                   section: 'সেলাই বিভাগ' },
      ],
    },

    {
      id:                     'harassment',
      name:                   'অভিযোগ ও হয়রানি প্রতিরোধ কমিটি',
      chairperson:            'নাজনীন নাহার',
      chairpersonGender:      'মহিলা',
      chairpersonDesignation: 'ওয়েলফেয়ার অফিসার',
      chairpersonDept:        'এইচআর এডমিন এন্ড কমপ্লায়েন্স বিভাগ',
      secretary:              'কুলসুম',
      secretaryGender:        'মহিলা',
      secretaryDesignation:   'কোয়ালিটি ইন্সপেক্টর',
      secretaryDept:          'কোয়ালিটি বিভাগ',
      establishDate:          '2019-05-19',
      members: [
        { name: 'মোঃ শফিকুল ইসলাম',   gender: 'পুরুষ',  designation: 'কোয়ালিটি ইন্সপেক্টর', section: 'কোয়ালিটি বিভাগ' },
        { name: 'মোছাঃ শিল্পি আক্তার', gender: 'মহিলা', designation: 'অপারেটর',               section: 'সেলাই বিভাগ' },
        { name: 'রওশনা আরা',           gender: 'মহিলা', designation: 'সহঃ ব্যবস্থাপক',        section: 'ফিনিশিং বিভাগ' },
        { name: 'আমেনা দেওয়ান',        gender: 'মহিলা', designation: 'আইনজীবি',               section: 'লেবারকোট' },
        { name: 'মোঃ ছায়রুল ইসলাম',   gender: 'পুরুষ',  designation: 'সহ-ব্যবস্থাপক',        section: 'এইচআর এডমিন এন্ড কমপ্লায়েন্স বিভাগ' },
      ],
    },
  ],
};