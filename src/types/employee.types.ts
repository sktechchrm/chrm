import { FACTORY_NAME_EN, FACTORY_NAME_BN, FACTORY_ADDRESS_EN, FACTORY_ADDRESS_BN, FACTORY_REGISTRY } from '../config/factory';
// employee.types.ts (Optimized & Standard)

// ============= INTERFACES =============

/** Central employee record type used throughout the personal file module. */
export const generateEntryId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export interface EducationEntry {
  id: string;
  education: string;
  institution: string;
  educationGroup: string;
  educationResult: string;
  educationBoard: string;
  passingYear: string;
}

export interface PreviousJobEntry {
  id: string;
  prevCompanyName: string;
  prevServicePeriod: string;
  prevDesignation: string;
  prevSection: string;
  prevCompanyPhone: string;
  prevStartDate: string;
  prevEndDate: string;
  prevLeaveReason: string;
  prevRefName: string;
  prevRefPhone: string;
}

export interface EmployeeFormData {
  /** Document date — shown/edited via ModuleShell's header date picker */
  date: string;
  // Personal Information
  fullName: string;
  fullNameBengali: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  maritalStatus: string;
  nationality: string;
  religion: string;
  nid: string;
  
  // Contact Information
  presentAddress: string;
  permanentAddress: string;
  mobile: string;
  email: string;
  
  // Present Address Details
  presentUnion: string;
  presentVillage: string;
  presentPostOffice: string;
  presentThana: string;
  presentDistrict: string;
  presentDivision: string;
  
  // Permanent Address Details
  permanentUnion: string;
  permanentVillage: string;
  permanentPostOffice: string;
  permanentThana: string;
  permanentDistrict: string;
  permanentDivision: string;
  
  // Employment Information
  employeeId: string;
  designation: string;
  department: string;
  joiningDate: string;
  salary: string;
  cardNo: string;
  idNo: string;
  proximityNumber: string;
  grade: string;
  sectionLine: string;
  fixedSalary: string;
  probationEndDate: string;
  
  // Salary Components
  basicSalary: string;
  houseRent: string;
  medicalAllowance: string;
  transportAllowance: string;
  foodAllowance: string;
  
  // Physical Information
  height: string;
  weight: string;
  identificationMark: string;
  
  // Documents
  birthRegistrationNo: string;
  passportNumber: string;
  tinNumber: string;
  
  // Spouse Information
  spouseName: string;
  spouseBloodGroup: string;
  spousePhone: string;
  spouseProfession: string;
  spouseDob: string;
  spouseEducation: string;
  numberOfSons: string;
  numberOfDaughters: string;
  
  // Education — multiple entries supported
  educationHistory: EducationEntry[];
  
  // Previous Employment — multiple entries supported
  previousJobs: PreviousJobEntry[];
  
  // Emergency Contact
  emergencyName: string;
  emergencyRelation: string;
  emergencyMobile: string;
  emergencyProfession: string;
  
  // Nominee Information
  nomineeName: string;
  nomineeRelation: string;
  nomineeNid: string;
  nomineeAddress: string;
  nomineePercentage: string;
  nomineeProfession: string;
  nomineeUnion: string;
  nomineeVillage: string;
  nomineePostOffice: string;
  nomineeThana: string;
  nomineeDistrict: string;
  nomineeDob: string;
  nomineePhone: string;
  nomineeEducation: string;
  nomineeBloodGroup: string;
  
  // Supervisor/Reference
  supervisorName: string;
  supervisorOrg: string;
  supervisorProfession: string;
  supervisorDesignation: string;
  supervisorAddress: string;
  supervisorRelation: string;
  supervisorPhone: string;
  
  // Banking
  bankName: string;
  bankAccountNo: string;
  bankBranch: string;
  
  // Company
  companyName: string;
  companyAddress: string;
  
  // Other
  jobSource: string;
  localRepresentative: string;
  greeting: string;
}

export interface AgeData {
  years: number;
  months: number;
  days: number;
}

export interface DocumentProps {
  formData: EmployeeFormData;
}

export interface SalaryBreakdown {
  basic: string;
  houseRent: string;
  medical: string;
  transport: string;
  food: string;
  total: string;
}

export interface WageComponents {
  basicWage: number;
  houseRent: number;
  dailyBasic: number;
  dailyGross: number;
  hourlyOvertimeRate: number;
}

export interface AppointmentCondition {
  id: string | number;
  title: string;
  content: string;
  subConditions?: SubCondition[];
}

export interface SubCondition {
  key: string;
  value: string;
}

export type DocType = 'appointment' | 'nominee' | 'age' | 'idcard' | 'personal' | 'leftnotice' | null;

// ============= CONSTANTS =============

const DEFAULT_SALARY = 13500;
const DEFAULT_MEDICAL = 750;
const DEFAULT_TRANSPORT = 450;
const DEFAULT_FOOD = 1250;

const WORKING_DAYS_PER_MONTH = 30;
const WORKING_HOURS_PER_MONTH = 208;
const OVERTIME_MULTIPLIER = 2;
const HOUSE_RENT_PERCENTAGE = 0.5;
const BASIC_WAGE_DIVISOR = 1.5;

// ============= INITIAL DATA =============

/** @deprecated Use EmployeeFormData. Kept for internal compatibility. */
export type FormData = EmployeeFormData;

export const initialFormData: EmployeeFormData = {
  date: '',
  // Personal
  fullName: '',
  fullNameBengali: '',
  fatherName: '',
  motherName: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  maritalStatus: '',
  nationality: 'Bangladeshi',
  religion: '',
  nid: '',
  
  // Contact
  presentAddress: '',
  permanentAddress: '',
  mobile: '',
  email: '',
  
  // Present Address
  presentUnion: '',
  presentVillage: '',
  presentPostOffice: '',
  presentThana: '',
  presentDistrict: '',
  presentDivision: '',
  
  // Permanent Address
  permanentUnion: '',
  permanentVillage: '',
  permanentPostOffice: '',
  permanentThana: '',
  permanentDistrict: '',
  permanentDivision: '',
  
  // Employment
  employeeId: '',
  designation: '',
  department: '',
  joiningDate: '',
  salary: String(DEFAULT_SALARY),
  cardNo: '',
  idNo: '',
  proximityNumber: '',
  grade: '',
  sectionLine: '',
  fixedSalary: '',
  probationEndDate: '',
  
  // Salary Components
  basicSalary: '',
  houseRent: '',
  medicalAllowance: String(DEFAULT_MEDICAL),
  transportAllowance: String(DEFAULT_TRANSPORT),
  foodAllowance: String(DEFAULT_FOOD),
  
  // Physical
  height: '',
  weight: '',
  identificationMark: '',
  
  // Documents
  birthRegistrationNo: '',
  passportNumber: '',
  tinNumber: '',
  
  // Spouse
  spouseName: '',
  spouseBloodGroup: '',
  spousePhone: '',
  spouseProfession: '',
  spouseDob: '',
  spouseEducation: '',
  numberOfSons: '0',
  numberOfDaughters: '0',
  
  // Education — multiple entries supported
  educationHistory: [],
  
  // Previous Employment — multiple entries supported
  previousJobs: [],
  
  // Emergency
  emergencyName: '',
  emergencyRelation: '',
  emergencyMobile: '',
  emergencyProfession: '',
  
  // Nominee
  nomineeName: '',
  nomineeRelation: '',
  nomineeNid: '',
  nomineeAddress: '',
  nomineePercentage: '100',
  nomineeProfession: '',
  nomineeUnion: '',
  nomineeVillage: '',
  nomineePostOffice: '',
  nomineeThana: '',
  nomineeDistrict: '',
  nomineeDob: '',
  nomineePhone: '',
  nomineeEducation: '',
  nomineeBloodGroup: '',
  
  // Supervisor
  supervisorName: '',
  supervisorOrg: '',
  supervisorProfession: '',
  supervisorDesignation: '',
  supervisorAddress: '',
  supervisorRelation: '',
  supervisorPhone: '',
  
  // Banking
  bankName: '',
  bankAccountNo: '',
  bankBranch: '',
  
  // Company
  companyName: FACTORY_NAME_EN,  // from factory config
  companyAddress: '32, Lakshmipura, Chandana, Joydevpur, Gazipur-1700',
  
  // Other
  jobSource: '',
  localRepresentative: '',
  greeting: 'জনাব/জনাবা,',
};

// ============= UTILITY FUNCTIONS =============

/**
 * Safe number parser with fallback
 */
const parseNumber = (value: string | number, fallback: number = 0): number => {
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Format number to 2 decimal places
 */
const formatCurrency = (value: number): string => {
  return value.toFixed(2);
};

/**
 * Calculate wage components from total monthly wage
 */
export const calculateWageComponents = (
  totalMonthlyWage: number,
  foodAllowance: number,
  medicalAllowance: number,
  transportAllowance: number
): WageComponents => {
  if (totalMonthlyWage <= 0) {
    return {
      basicWage: 0,
      houseRent: 0,
      dailyBasic: 0,
      dailyGross: 0,
      hourlyOvertimeRate: 0
    };
  }

  const totalAllowances = foodAllowance + medicalAllowance + transportAllowance;
  const basic = (totalMonthlyWage - totalAllowances) / BASIC_WAGE_DIVISOR;
  const house = basic * HOUSE_RENT_PERCENTAGE;
  const dailyBasic = basic / WORKING_DAYS_PER_MONTH;
  const dailyGross = totalMonthlyWage / WORKING_DAYS_PER_MONTH;
  const hourlyOvertimeRate = (basic / WORKING_HOURS_PER_MONTH) * OVERTIME_MULTIPLIER;

  return {
    basicWage: parseFloat(formatCurrency(basic)),
    houseRent: parseFloat(formatCurrency(house)),
    dailyBasic: parseFloat(formatCurrency(dailyBasic)),
    dailyGross: parseFloat(formatCurrency(dailyGross)),
    hourlyOvertimeRate: parseFloat(formatCurrency(hourlyOvertimeRate))
  };
};

/**
 * Get calculated salary breakdown
 */
export const getSalaryBreakdown = (formData: EmployeeFormData): SalaryBreakdown => {
  const totalSalary = parseNumber(formData.salary);
  const food = parseNumber(formData.foodAllowance);
  const medical = parseNumber(formData.medicalAllowance);
  const transport = parseNumber(formData.transportAllowance);

  const components = calculateWageComponents(totalSalary, food, medical, transport);

  return {
    basic: formatCurrency(components.basicWage),
    houseRent: formatCurrency(components.houseRent),
    medical: formatCurrency(medical),
    transport: formatCurrency(transport),
    food: formatCurrency(food),
    total: formatCurrency(totalSalary)
  };
};

/**
 * Calculate probation end date (3 months from joining)
 */
const calculateProbationEndDate = (joiningDate: string): string => {
  if (!joiningDate) return '';
  const date = new Date(joiningDate);
  date.setMonth(date.getMonth() + 3);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

/**
 * Format date to DD/MM/YYYY
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

// ============= APPOINTMENT CONDITIONS =============

export const getAppointmentConditions = (formData: EmployeeFormData): AppointmentCondition[] => {
  const salary = getSalaryBreakdown(formData);
  const joiningDateFormatted = formatDate(formData.joiningDate);
  const probationEnd = formData.probationEndDate 
    ? formatDate(formData.probationEndDate)
    : calculateProbationEndDate(formData.joiningDate);

  return [
    {
      id: 'greeting',
      title: 'জনাব/জনাবা,',
      content: ''
    },
    {
      id: 'recruit',
      title: '**',
      content: `আপনার ${joiningDateFormatted} ইং তারিখের আবেদন ও কর্তৃপক্ষের সাথে সাক্ষাতকারের ভিত্তিতে আপনাকে ${formData.companyName} এ ${formData.department} বিভাগে ${formData.designation} পদে ৪ নং গ্রেড এ ${joiningDateFormatted} ইং তারিখ থেকে নিম্নোক্ত শর্তে নিয়োগ প্রদান করা হল, শর্তাবলী অনুযায়ী কর্মরত থাকিবেন।`
    },
    {
      id: 'terms-header',
      title: 'শর্তাবলী :',
      content: ''

    },
    {
      id: 1,
      title: '২. শিক্ষানবিশকাল',
      content: `দক্ষ শ্রমিকের ক্ষেত্রে '${joiningDateFormatted}' ইং থেকে '${probationEnd}' ইং তারিখ পর্যন্ত ৩ (তিন) মাস সময় শিক্ষানবীশকাল। অধিকন্তু, দক্ষতা প্রমান না করিতে পারিলে কর্তৃপক্ষ আরও ৩ (তিন) মাস সময় শিক্ষানবীশকাল হিসাবে বৃদ্ধি করিতে পারিবেন। উল্লেখ্য যে অদক্ষ শ্রমিকের ক্ষেত্রে তফসিল "খ" এর অধিন শ্রমিকের শিক্ষানবীশকাল হবে ৬ (ছয়) মাস।`
    },
    {
      id: 2,
      title: '৩. মাসিক বেতন বিবরণ',
      content: '',
      subConditions: [
        { key: 'ক) মূল বেতন', value: `${salary.basic} টাকা` },
        { key: 'খ) বাড়ী ভাড়া ভাতা ৫০%', value: `${salary.houseRent} টাকা` },
        { key: 'গ) চিকিৎসা ভাতা', value: `${salary.medical} টাকা` },
        { key: 'ঘ) যাতায়াত ভাতা', value: `${salary.transport} টাকা` },
        { key: 'ঙ) খাদ্য ভাতা', value: `${salary.food} টাকা` },
        { key: 'মোট', value: `${salary.total} টাকা` }
      ]
    },
    {
      id: 3,
      title: '৪. ছুটি',
      content: 'সাপ্তাহিক ছুটি: শুক্রবার, নৈমিত্তিক ছুটি: পূর্ণ বেতনে বছরে ১০ (দশ) দিন, অসুস্থতা ছুটি: পূর্ণ বেতনে বছরে ১৪ (চৌদ্দ) দিন, অর্জিত ছুটি: প্রতি ১৮ (আঠারো) কর্মদিবসের জন্য ০১ (এক) দিন এবং উৎসব ছুটি: কমপক্ষে বছরে ১১ (এগার) দিন। মাতৃকল্যাণ ছুটি: প্রসবের পূর্বে ৬০ (ষাট) দিন এবং প্রসবের দিন সহ প্রসব পরবর্তী ৬০ (ষাট) দিন, মোট ১২০ (এক শত বিশ দিন)।'
    },
    {
      id: 4,
      title: '৫. কর্ম সময়',
      content: 'সাধারণ কর্ম সময় দৈনিক ০৮ (আট) ঘন্টা, প্রতিষ্ঠানের প্রয়োজনে অতিরিক্ত কাজ করলে মূল মজুরির দ্বিগুন হারে কোম্পানী নীতিমালা অনুযায়ী সমন্বয় করা হবে।'
    },
    {
      id: 5,
      title: '৬. অভিযোগ',
      content: 'অভিযোগ বাক্সে আপনার অভিযোগ লিখিতভাবে জানাইতে পারেন।'
    },
    {
      id: 6,
      title: '৭. চাকুরীর অবসান (Termination of Service)',
      content: '',
      subConditions: [
        { 
          key: '(ক) মালিক কর্তৃক চাকুরীর অবসান করা হইলে', 
          value: 'মাসিক মজুরীর ভিত্তিতে নিয়োজিত স্থায়ী শ্রমিকের ক্ষেত্রে ১২০ (একশত বিশ) দিনের নোটিশ এবং অস্থায়ী শ্রমিকের ক্ষেত্রে ৩০ (ত্রিশ) দিনের নোটিশ প্রদান করা হইবে। অন্যথায় নোটিশ মেয়াদের সমপরিমাণ মজুরী প্রদান করিতে বাধ্য থাকিবেন।' 
        },
        { 
          key: '(খ) শ্রমিক কর্তৃক চাকুরীর অবসান', 
          value: 'স্থায়ী শ্রমিক ৬০ (ষাট) দিনের নোটিশ এবং অস্থায়ী শ্রমিক ৩০ (ত্রিশ) দিনের নোটিশ নিয়োগকর্তাকে প্রদান করিবেন। অন্যথায় নোটিশ মেয়াদের সমপরিমাণ মজুরী ফেরৎ দিতে বাধ্য থাকিবেন।' 
        }
      ]
    },
    {
      id: 7,
      title: '৮. শাস্তি',
      content: 'কর্তৃপক্ষ বিশেষ অবস্থার পরিপ্রেক্ষিতে নিম্নলিখিত যে কোন শাস্তি প্রদান করিতে পারেঃ',
      subConditions: [
        { key: 'ক)', value: 'অনধিক এক বৎসরের জন্য পদোন্নতি বা মজুরী বৃদ্ধি বন্ধ;' },
        { key: 'খ)', value: 'জরিমানা;' },
        { key: 'গ)', value: 'অনধিক সাত দিন পর্যন্ত বিনা মজুরীতে সাময়িক বরখাস্ত;' },
        { key: 'ঘ)', value: 'ভৎসনা বা সতর্কীকরণ।' }
      ]
    },
    {
      id: 8,
      title: '৯. মাসিক মজুরী',
      content: 'মাসিক মজুরী মাস শেষ হওয়ার পরবর্তী ০৭ (সাত) কর্মদিবসের মধ্যে পরিশোধ করা হয়।'
    },
    {
      id: 9,
      title: '১০. বদলী',
      content: 'কোম্পানীর প্রয়োজনে অন্য যে কোন কারখানায় বদলী করিতে পারিবে।'
    },
    {
      id: 10,
      title: '১১. মধ্যাহ্ন বিরতি',
      content: 'মধ্যাহ্ন বিরতি ১ ঘন্টা, স্ব-স্ব office ব্যবস্থাপনা অনুযায়ী।'
    },
    {
      id: 11,
      title: '১২. ঠিকানা পরিবর্তন',
      content: 'আপনার ঠিকানা পরিবর্তন করিলে ০৭ (সাত) দিনের মধ্যে অফিসকে লিখিতভাবে জানাইতে হইবে।'
    },
    {
      id: 12,
      title: '১৩. উৎসব বোনাস',
      content: 'বছরে দুটি উৎসব বোনাস প্রদান করা হয় (মোট বেতনের ৫০%), যা চাকুরীর বয়স ছয় মাস পূর্ণ হইলে প্রাপ্য হইবে।'
    },
    {
      id: 13,
      title: '১৪. বেতন বৃদ্ধি',
      content: 'মূল বেতনের ৯% হারে প্রতি বৎসরে একবার বেতন বৃদ্ধি করা হয়।'
    },
    {
      id: 14,
      title: '১৫. হাজিরা বোনাস',
      content: 'হাজিরা বোনাস ৭২৫ টাকা। তবে দুইদিনের অধিক লেট বা বিনা অনুমতিতে অনুপস্থিত থাকিলে ইহা প্রাপ্য হইবে না।'
    },
    {
      id: 15,
      title: '১৬. চাকরি বিধি',
      content: 'নিয়োগের যাবতীয় শর্ত প্রতিষ্ঠানে বিদ্যমান চাকরি বিধি ও প্রচলিত শ্রম আইন অনুযায়ী পরিচালিত হইবে।'
    },
    {
      id: 16,
      title: 'সম্মতি',
      content: 'আমি সুস্থ ও সজ্ঞানে উল্লেখিত শর্তে সম্মত হয়ে নিয়োগ পত্রে স্বাক্ষর করিলাম এবং ১ (এক) কপি অনুলিপি গ্রহণ করিলাম।'
    }
  ];
};

// ============= STATIC DATA =============

export const STATIC_DATA = {
  // Dynamically built from FACTORY_REGISTRY — all active factories included automatically.
  // Adding a new factory file updates this list with no changes required here.
  companyOptions: FACTORY_REGISTRY
    .filter(f => f.active)
    .flatMap(f => [f.nameEn, f.nameBn]),
  addressOptions: FACTORY_REGISTRY
    .filter(f => f.active)
    .flatMap(f => [f.addressEn, f.addressBn]),
  bengaliMonths: [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ],
  benefitInstallments: [
    { value: 'প্রথম কিস্তি', label: 'প্রথম কিস্তি' },
    { value: 'দ্বিতীয় কিস্তি', label: 'দ্বিতীয় কিস্তি' },
  ],
  benefitTypes: [
    { value: 'দিন', label: 'দিন' },
    { value: 'টাকা', label: 'টাকা' },
  ],
} as const;