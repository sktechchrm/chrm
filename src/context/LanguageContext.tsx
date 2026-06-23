// src/context/LanguageContext.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared translation keys for all bill components.
// Both PaymentBill (Final Settlement) and MaternityBenefitBill use this.
//
// Added maternity-specific keys:
//   maternityBill, idCard, aliveChildren, noticedDate, deliveryDate,
//   leaveStart, leaveEnd, benefits, maternityBenefit, earnedWage,
//   totalPayable, inWords, takaOnly, eligibility, taka
//
// Added final-settlement keys (2025-06):
//   layOffCompensation, gratuityCompensation
// ─────────────────────────────────────────────────────────────────────────────

export const translations = {
  bn: {
    // ── Company / header ────────────────────────────────────────────────────
    paymentBill:          'কর্মীর চূড়ান্ত পাওনা বিল',
    maternityBill:        'মাতৃত্বকালীন সুবিধা বিল',
    companyName:          'কোম্পানির নাম',
    address:              '',  // dynamically set from factory.addressBn

    // ── Employee info ────────────────────────────────────────────────────────
    empDetails:           'কর্মীর অফিসিয়াল তথ্য',
    employeeName:         'কর্মীর নাম',
    idCard:               'আইডি নং',
    designation:          'পদবী',
    section:              'বিভাগ',
    aliveChildren:        'জীবিত সন্তান সংখ্যা',

    // ── Service / dates ──────────────────────────────────────────────────────
    terminationType:      'চাকরি বিচ্ছেদের ধরন',
    date:                 'বিল ইস্যুর তারিখ',
    dateEndSign:          'ইং',
    joiningDate:          'নিয়োগের তারিখ',
    lastAttendance:       'সর্বশেষ উপস্থিতি',
    noticedDate:          'নোটিশের তারিখ',
    deliveryDate:         'সম্ভাব্য প্রসবের তারিখ',
    leaveStart:           'মাতৃত্বকালীন ছুটি শুরু',
    leaveEnd:             'মাতৃত্বকালীন ছুটি শেষ',
    serviceDuration:      'চাকরির মেয়াদকাল',
    years:                'বছর',
    months:               'মাস',
    days:                 'দিন',
    benefitYears:         'মোট সুবিধাপ্রাপ্ত বছর',

    // ── Wage fields ──────────────────────────────────────────────────────────
    totalMonthlyWage:     'মাসিক মোট মজুরি',
    basicWage:            'মাসিক মূল মজুরি',
    houseRent:            'বাড়ি ভাড়া',
    foodAllowance:        'খাদ্য ভাতা',
    medicalAllowance:     'চিকিৎসা ভাতা',
    transportAllowance:   'যাতায়াত ভাতা',
    dailyBasic:           'দৈনিক মূল মজুরি',
    dailyGross:           'দৈনিক মোট মজুরি',

    // ── Amounts / currency ───────────────────────────────────────────────────
    description:          'বিবরণ',
    amount:               'টাকা',
    taka:                 'টাকা',
    takaOnly:             'টাকা মাত্র',
    inWords:              'কথায়',

    // ── Final settlement earnings ────────────────────────────────────────────
    earnings:             'প্রাপ্য',
    lastMonthSalary:      'সর্বশেষ মাসের বেতন',
    lastMonthOvertime:    'সর্বশেষ মাসের অতিরিক্ত কর্মঘন্টা',
    hours:                'ঘন্টা',
    earnedLeave:          'অর্জিত ছুটি',
    serviceCompensation:  'চাকরি অবসানজনিত ক্ষতিপূরণ',
    deathCompensation:    'মৃত্যুজনিত ক্ষতিপূরণ',
    layOffCompensation:   'লে-অফ ক্ষতিপূরণ (১৬)',
    gratuityCompensation: 'গ্র্যাচুইটি',
    noticePay:            'নোটিশ পে',
    others:               'অন্যান্য',
    otherBenefits:        'অন্যান্য',
    totalEarnings:        'মোট প্রাপ্য (A)',

    // ── Final settlement deductions ──────────────────────────────────────────
    deductions:           'কর্তন',
    advanceDeduction:     'অগ্রিম গ্রহণ বাবদ কর্তন',
    noticeDeduction:      'নোটিশ বাবদ কর্তন',
    otherDeduction:       'অন্যান্য কর্তন',
    totalDeductions:      'মোট কর্তন (B)',
    netPayable:           'সর্বমোট প্রাপ্য (A-B)',

    // ── Maternity benefit specific ───────────────────────────────────────────
    benefits:             'প্রাপ্য সুবিধা',
    maternityBenefit:     'প্রসূতি কল্যাণ সুবিধা',
    earnedWage:           'বর্তমান মাসের প্রাপ্য মজুরি',
    totalPayable:         'সর্বমোট প্রাপ্য',
    eligibility:          'সুবিধা প্রাপ্তির ধরণ',

    // ── Signatures / footer ──────────────────────────────────────────────────
    preparedBy:           'প্রস্তুতকারি',
    checkedBy:            'নিরীক্ষণকারী',
    approvedBy:           'অনুমোদনকারী',
    receivedAmount:       'উপরোক্ত হিসাবের বিবরণ দেখে ও বুঝে আমি সজ্ঞানে ঠাণ্ডা মস্তিষ্কে উপরোল্লেখিত টাকা গ্রহণ করিলাম। এক্ষেত্রে কোম্পানির নিকট আমার বা আমার মনোনীত ব্যাক্তি বা উত্তরাধীকারের আর কোন দাবি/পাওনা রইল না।',
    receiverSignature:    'গ্রহণকারীর স্বাক্ষর',
    printBill:            'প্রিন্ট করুন',
    rcvdate:              'তারিখ:.........................',
  },

  en: {
    // ── Company / header ────────────────────────────────────────────────────
    paymentBill:          'Employees Final Settlement Bill',
    maternityBill:        'Maternity Benefit Bill',
    companyName:          'Company Name',
    address:              '',  // dynamically set from factory.addressEn

    // ── Employee info ────────────────────────────────────────────────────────
    empDetails:           'Employee Official Details',
    employeeName:         'Employee Name',
    idCard:               'ID / Card No',
    designation:          'Designation',
    section:              'Section',
    aliveChildren:        'Number of Alive Children',

    // ── Service / dates ──────────────────────────────────────────────────────
    terminationType:      'Types of Job Separation',
    date:                 'Bill Issue Date',
    dateEndSign:          '',
    joiningDate:          'Joining Date',
    lastAttendance:       'Last Attendance',
    noticedDate:          'Notice Date',
    deliveryDate:         'Expected Delivery Date',
    leaveStart:           'Maternity Leave Start',
    leaveEnd:             'Maternity Leave End',
    serviceDuration:      'Service Duration',
    years:                'Years',
    months:               'Months',
    days:                 'Days',
    benefitYears:         'Total Benefit Years',

    // ── Wage fields ──────────────────────────────────────────────────────────
    totalMonthlyWage:     'Total Monthly Wage',
    basicWage:            'Monthly Basic Wage',
    houseRent:            'House Rent',
    foodAllowance:        'Food Allowance',
    medicalAllowance:     'Medical Allowance',
    transportAllowance:   'Transport Allowance',
    dailyBasic:           'Daily Basic Wage',
    dailyGross:           'Daily Gross Wage',

    // ── Amounts / currency ───────────────────────────────────────────────────
    description:          'Description',
    amount:               'Taka',
    taka:                 'Taka',
    takaOnly:             'Taka Only',
    inWords:              'In Words',

    // ── Final settlement earnings ────────────────────────────────────────────
    earnings:             'EARNINGS',
    lastMonthSalary:      'Last Month Salary',
    lastMonthOvertime:    'Last Month Overtime',
    hours:                'Hours',
    earnedLeave:          'Earned Leave',
    serviceCompensation:  'Service Compensation',
    deathCompensation:    'Death Compensation',
    layOffCompensation:   'Lay-off Compensation (Sec 16)',
    gratuityCompensation: 'Gratuity',
    noticePay:            'Notice Pay',
    others:               'Others',
    otherBenefits:        'Others',
    totalEarnings:        'Total Earnings (A)',

    // ── Final settlement deductions ──────────────────────────────────────────
    deductions:           'DEDUCTIONS',
    advanceDeduction:     'Deduction for Advance Payment',
    noticeDeduction:      'Deduction for Notice Period',
    otherDeduction:       'Other Deduction',
    totalDeductions:      'Total Deductions (B)',
    netPayable:           'Net Payable (A-B)',

    // ── Maternity benefit specific ───────────────────────────────────────────
    benefits:             'BENEFITS',
    maternityBenefit:     'Maternity Benefit',
    earnedWage:           'Current Month Wage',
    totalPayable:         'Total Payable',
    eligibility:          'Eligibility Status',

    // ── Signatures / footer ──────────────────────────────────────────────────
    preparedBy:           'Prepared By',
    checkedBy:            'Checked By',
    approvedBy:           'Approved By',
    receivedAmount:       'After reviewing and understanding the above calculation, I consciously accept the stated amount. I or my nominee or my heirs have no further claims against the company.',
    receiverSignature:    "Receiver's Signature",
    printBill:            'Print Bill',
    rcvdate:              'Date:..........................',
  },
} as const;