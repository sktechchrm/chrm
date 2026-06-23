// ─────────────────────────────────────────────────────────────────────────────
// REPORT CONFIG — Config-driven column and filter definitions per module
//
// Adding a new module to reports:
//   1. Add an entry to REPORT_CONFIGS
//   2. Define columns (key maps to Google Sheets column names)
//   3. Define filters (fields shown in the top filter bar)
// ─────────────────────────────────────────────────────────────────────────────

import type { DbModule as SheetModule } from '../../business/DataUseCases';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'badge';

export interface ReportColumn {
  key:       string;          // Maps to Google Sheets column name
  label:     string;          // Column header displayed
  type:      ColumnType;
  sortable?: boolean;
  width?:    number;          // px hint for table layout
  /** For badge type — maps value → color */
  badgeMap?: Record<string, { bg: string; text: string }>;
  /** Format value before displaying */
  format?:   (val: string | number) => string;
}

export interface ReportFilter {
  key:         string;        // Record field to filter on
  label:       string;
  type:        'text' | 'date' | 'select';
  options?:    { value: string; label: string }[];
}

export interface ReportConfig {
  module:      SheetModule;
  labelBn:     string;        // Bangla label
  labelEn:     string;
  icon:        string;        // Emoji
  columns:     ReportColumn[];
  filters:     ReportFilter[];
  /** Fields to show in the detail modal — defaults to all columns */
  detailFields?: { key: string; label: string; span?: number }[];
}

// ── Currency formatter ────────────────────────────────────────────────────────

export const formatCurrency = (val: string | number): string => {
  const n = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(n)) return '—';
  return `৳ ${n.toLocaleString('en-BD')}`;
};

export const formatDate = (val: string | number): string => {
  if (!val) return '—';
  try {
    return new Date(String(val)).toLocaleDateString('en-BD', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return String(val); }
};

// ── Configs ───────────────────────────────────────────────────────────────────

export const REPORT_CONFIGS: ReportConfig[] = [
  // ── Employees ─────────────────────────────────────────────────────────────
  {
    module:  'employees',
    labelBn: 'কর্মী ব্যক্তিগত ফাইল',
    labelEn: 'Employee Personal File',
    icon:    '👤',
    columns: [
      { key: 'cardNo',      label: 'কার্ড নং',   type: 'text',     sortable: true,  width: 90  },
      { key: 'fullName',    label: 'নাম',         type: 'text',     sortable: true,  width: 160 },
      { key: 'designation', label: 'পদবী',        type: 'text',     sortable: true,  width: 140 },
      { key: 'department',  label: 'বিভাগ',       type: 'text',     sortable: true,  width: 120 },
      { key: 'joiningDate', label: 'যোগদানের তারিখ', type: 'date',  sortable: true,  width: 120, format: formatDate },
      { key: 'grossSalary', label: 'মোট বেতন',   type: 'currency', sortable: true,  width: 110, format: formatCurrency },
      { key: 'mobile',      label: 'মোবাইল',      type: 'text',                      width: 120 },
      {
        key: 'status', label: 'অবস্থা', type: 'badge', sortable: true, width: 90,
        badgeMap: {
          Active:   { bg: '#dcfce7', text: '#15803d' },
          Inactive: { bg: '#fee2e2', text: '#dc2626' },
          Left:     { bg: '#fef9c3', text: '#a16207' },
        },
      },
      { key: 'savedAt',   label: 'সংরক্ষণ তারিখ', type: 'date', format: formatDate, width: 130 },
    ],
    filters: [
      { key: 'cardNo',      label: 'কার্ড নং',    type: 'text' },
      { key: 'fullName',    label: 'নাম',          type: 'text' },
      { key: 'designation', label: 'পদবী',         type: 'text' },
      { key: 'department',  label: 'বিভাগ',        type: 'text' },
      { key: 'joiningDate', label: 'যোগদান তারিখ', type: 'date' },
      { key: 'status',      label: 'অবস্থা',       type: 'select', options: [
        { value: 'Active',   label: 'Active'   },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Left',     label: 'Left'     },
      ]},
    ],
    detailFields: [
      { key: 'cardNo',           label: 'কার্ড নং'      },
      { key: 'fullName',         label: 'নাম (ইংরেজি)', span: 2 },
      { key: 'fullNameBengali',  label: 'নাম (বাংলা)',  span: 2 },
      { key: 'designation',      label: 'পদবী'          },
      { key: 'department',       label: 'বিভাগ'         },
      { key: 'joiningDate',      label: 'যোগদানের তারিখ'},
      { key: 'dateOfBirth',      label: 'জন্ম তারিখ'    },
      { key: 'mobile',           label: 'মোবাইল'        },
      { key: 'nid',              label: 'জাতীয় পরিচয়পত্র' },
      { key: 'fatherName',       label: 'পিতার নাম'     },
      { key: 'motherName',       label: 'মাতার নাম'     },
      { key: 'presentAddress',   label: 'বর্তমান ঠিকানা', span: 3 },
      { key: 'basicSalary',      label: 'মূল বেতন'      },
      { key: 'houseRent',        label: 'বাড়িভাড়া'     },
      { key: 'medicalAllowance', label: 'চিকিৎসা ভাতা'  },
      { key: 'transportAllowance',label:'যাতায়াত ভাতা' },
      { key: 'foodAllowance',    label: 'খাদ্য ভাতা'    },
      { key: 'grossSalary',      label: 'মোট বেতন'      },
    ],
  },

  // ── Final Settlement ───────────────────────────────────────────────────────
  {
    module:  'settlements',
    labelBn: 'চূড়ান্ত পাওনা',
    labelEn: 'Final Settlement',
    icon:    '📋',
    columns: [
      { key: 'cardNo',          label: 'কার্ড নং',       type: 'text',     sortable: true, width: 90  },
      { key: 'employeeName',    label: 'নাম',             type: 'text',     sortable: true, width: 160 },
      { key: 'designation',     label: 'পদবী',            type: 'text',                    width: 140 },
      { key: 'terminationType', label: 'বিচ্ছেদের ধরন',  type: 'badge',    sortable: true, width: 150,
        badgeMap: {
          'চাকুরী অবসান (২৬)': { bg: '#fee2e2', text: '#dc2626' },
          'ছাঁটাই (২০)':        { bg: '#ffedd5', text: '#ea580c' },
          'অবসর (২৮)':          { bg: '#dbeafe', text: '#1d4ed8' },
          'ইস্তফা (২৭)':        { bg: '#fef9c3', text: '#a16207' },
          'মৃত্যু (১৯)':        { bg: '#f3f4f6', text: '#374151' },
        },
      },
      { key: 'settlementDate',  label: 'তারিখ',           type: 'date',     sortable: true, width: 110, format: formatDate },
      { key: 'serviceYears',    label: 'চাকরি (বছর)',     type: 'number',   sortable: true, width: 100 },
      { key: 'totalWage',       label: 'মোট বেতন',        type: 'currency',                 width: 110, format: formatCurrency },
      { key: 'finalTotal',      label: 'চূড়ান্ত পাওনা',  type: 'currency', sortable: true, width: 120, format: formatCurrency },
      { key: 'savedBy',         label: 'সংরক্ষণকারী',     type: 'text',                    width: 110 },
    ],
    filters: [
      { key: 'cardNo',          label: 'কার্ড নং',       type: 'text'   },
      { key: 'employeeName',    label: 'নাম',             type: 'text'   },
      { key: 'terminationType', label: 'বিচ্ছেদের ধরন',  type: 'select', options: [
        { value: 'চাকুরী অবসান (২৬)', label: 'চাকুরী অবসান'  },
        { value: 'ছাঁটাই (২০)',        label: 'ছাঁটাই'          },
        { value: 'অবসর (২৮)',          label: 'অবসর'            },
        { value: 'ইস্তফা (২৭)',        label: 'ইস্তফা'          },
      ]},
      { key: 'settlementDate',  label: 'তারিখ',           type: 'date'   },
    ],
    detailFields: [
      { key: 'cardNo',              label: 'কার্ড নং'         },
      { key: 'employeeName',        label: 'নাম',        span: 2 },
      { key: 'designation',         label: 'পদবী'              },
      { key: 'joiningDate',         label: 'যোগদানের তারিখ'   },
      { key: 'lastAttendance',      label: 'শেষ উপস্থিতি'     },
      { key: 'settlementDate',      label: 'নিষ্পত্তির তারিখ' },
      { key: 'terminationType',     label: 'বিচ্ছেদের ধরন'    },
      { key: 'serviceYears',        label: 'চাকরির মেয়াদ'    },
      { key: 'basicWage',           label: 'মূল মজুরি'         },
      { key: 'totalWage',           label: 'মোট মজুরি'         },
      { key: 'earnedLeave',         label: 'অর্জিত ছুটি'      },
      { key: 'serviceCompensation', label: 'চাকরি ক্ষতিপূরণ'  },
      { key: 'noticePay',           label: 'নোটিশ পে'          },
      { key: 'advanceDeduction',    label: 'অগ্রিম কর্তন'     },
      { key: 'finalTotal',          label: 'সর্বমোট পাওনা', span: 3 },
    ],
  },

  // ── Maternity ─────────────────────────────────────────────────────────────
  {
    module:  'maternity',
    labelBn: 'মাতৃত্ব সুবিধা',
    labelEn: 'Maternity Benefit',
    icon:    '🤱',
    columns: [
      { key: 'cardNo',        label: 'কার্ড নং',         type: 'text',     sortable: true, width: 90  },
      { key: 'employeeName',  label: 'নাম',               type: 'text',     sortable: true, width: 160 },
      { key: 'designation',   label: 'পদবী',              type: 'text',                    width: 140 },
      { key: 'department',    label: 'বিভাগ',             type: 'text',                    width: 110 },
      { key: 'deliveryDate',  label: 'প্রসবের তারিখ',    type: 'date',     sortable: true, width: 120, format: formatDate },
      { key: 'installment',   label: 'কিস্তি',            type: 'badge',    sortable: true, width: 110,
        badgeMap: {
          'প্রথম কিস্তি':  { bg: '#dbeafe', text: '#1d4ed8' },
          'দ্বিতীয় কিস্তি': { bg: '#dcfce7', text: '#15803d' },
        },
      },
      { key: 'monthlyWage',   label: 'মাসিক মজুরি',      type: 'currency',                width: 110, format: formatCurrency },
      { key: 'totalBenefit',  label: 'মোট সুবিধা',       type: 'currency', sortable: true, width: 120, format: formatCurrency },
    ],
    filters: [
      { key: 'cardNo',       label: 'কার্ড নং',          type: 'text' },
      { key: 'employeeName', label: 'নাম',                type: 'text' },
      { key: 'installment',  label: 'কিস্তি',             type: 'select', options: [
        { value: 'প্রথম কিস্তি',    label: 'প্রথম কিস্তি'    },
        { value: 'দ্বিতীয় কিস্তি', label: 'দ্বিতীয় কিস্তি' },
      ]},
      { key: 'deliveryDate', label: 'প্রসবের তারিখ',     type: 'date' },
    ],
    detailFields: [
      { key: 'cardNo',       label: 'কার্ড নং'         },
      { key: 'employeeName', label: 'নাম',        span: 2 },
      { key: 'designation',  label: 'পদবী'              },
      { key: 'department',   label: 'বিভাগ'             },
      { key: 'joiningDate',  label: 'যোগদানের তারিখ'   },
      { key: 'deliveryDate', label: 'প্রসবের তারিখ'    },
      { key: 'children',     label: 'জীবিত সন্তান'     },
      { key: 'monthlyWage',  label: 'মাসিক মজুরি'      },
      { key: 'dailyWage',    label: 'দৈনিক মজুরি'      },
      { key: 'preBenefit',   label: '১ম কিস্তি (৬০ দিন)' },
      { key: 'postBenefit',  label: '২য় কিস্তি (৫৯ দিন)' },
      { key: 'totalBenefit', label: 'মোট সুবিধা', span: 3 },
    ],
  },

  // ── Left Worker Notice ─────────────────────────────────────────────────────
  {
    module:  'leftnotice',
    labelBn: 'অনুপস্থিতির নোটিশ',
    labelEn: 'Left Worker Notice',
    icon:    '📝',
    columns: [
      { key: 'cardNo',         label: 'কার্ড নং',      type: 'text',  sortable: true, width: 90  },
      { key: 'employeeName',   label: 'নাম',            type: 'text',  sortable: true, width: 160 },
      { key: 'designation',    label: 'পদবী',           type: 'text',                 width: 140 },
      { key: 'department',     label: 'বিভাগ',          type: 'text',                 width: 110 },
      { key: 'absentFrom',     label: 'অনুপস্থিত থেকে', type: 'date', sortable: true, width: 130, format: formatDate },
      { key: 'totalAbsentDays',label: 'মোট দিন',        type: 'number',sortable: true, width: 90  },
      { key: 'noticeType',     label: 'নোটিশ ধরন',     type: 'badge', sortable: true, width: 110,
        badgeMap: {
          notice1: { bg: '#fef9c3', text: '#a16207' },
          notice2: { bg: '#ffedd5', text: '#ea580c' },
          notice3: { bg: '#fee2e2', text: '#dc2626' },
        },
      },
      { key: 'savedAt',        label: 'তারিখ',          type: 'date',  sortable: true, width: 110, format: formatDate },
    ],
    filters: [
      { key: 'cardNo',       label: 'কার্ড নং',    type: 'text'   },
      { key: 'employeeName', label: 'নাম',          type: 'text'   },
      { key: 'noticeType',   label: 'নোটিশ ধরন',   type: 'select', options: [
        { value: 'notice1', label: '১ম নোটিশ' },
        { value: 'notice2', label: '২য় নোটিশ' },
        { value: 'notice3', label: 'চূড়ান্ত নোটিশ' },
      ]},
      { key: 'absentFrom',   label: 'অনুপস্থিতির তারিখ', type: 'date' },
    ],
    detailFields: [
      { key: 'cardNo',         label: 'কার্ড নং'       },
      { key: 'employeeName',   label: 'নাম',      span: 2 },
      { key: 'designation',    label: 'পদবী'            },
      { key: 'department',     label: 'বিভাগ'           },
      { key: 'absentFrom',     label: 'অনুপস্থিতি শুরু'},
      { key: 'absentTo',       label: 'অনুপস্থিতি শেষ' },
      { key: 'totalAbsentDays',label: 'মোট অনুপস্থিত'  },
      { key: 'noticeType',     label: 'নোটিশ ধরন'      },
      { key: 'notes',          label: 'মন্তব্য',  span: 3 },
    ],
  },

  // ── Requisitions ──────────────────────────────────────────────────────────
  {
    module:  'requisitions',
    labelBn: 'রিকুইজিশন',
    labelEn: 'Staff Requisition',
    icon:    '📦',
    columns: [
      { key: 'id',          label: 'আইডি',          type: 'text',  sortable: true, width: 130 },
      { key: 'subject',     label: 'বিষয়',           type: 'text',  sortable: true, width: 200 },
      { key: 'date',        label: 'তারিখ',           type: 'date',  sortable: true, width: 110, format: formatDate },
      { key: 'preparedBy',  label: 'প্রস্তুতকারী',   type: 'text',                 width: 130 },
      { key: 'department',  label: 'বিভাগ',           type: 'text',                 width: 110 },
      { key: 'totalItems',  label: 'আইটেম সংখ্যা',   type: 'number',sortable: true, width: 100 },
      { key: 'status',      label: 'অবস্থা',          type: 'badge', sortable: true, width: 100,
        badgeMap: {
          Pending:  { bg: '#fef9c3', text: '#a16207' },
          Approved: { bg: '#dcfce7', text: '#15803d' },
          Rejected: { bg: '#fee2e2', text: '#dc2626' },
        },
      },
    ],
    filters: [
      { key: 'subject',    label: 'বিষয়',    type: 'text'   },
      { key: 'preparedBy', label: 'প্রস্তুতকারী', type: 'text' },
      { key: 'date',       label: 'তারিখ',    type: 'date'   },
      { key: 'status',     label: 'অবস্থা',   type: 'select', options: [
        { value: 'Pending',  label: 'Pending'  },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' },
      ]},
    ],
    detailFields: [
      { key: 'id',         label: 'আইডি'              },
      { key: 'subject',    label: 'বিষয়',       span: 2 },
      { key: 'date',       label: 'তারিখ'              },
      { key: 'preparedBy', label: 'প্রস্তুতকারী'      },
      { key: 'approvedBy', label: 'অনুমোদনকারী'       },
      { key: 'department', label: 'বিভাগ'              },
      { key: 'purpose',    label: 'উদ্দেশ্য',    span: 3 },
      { key: 'status',     label: 'অবস্থা'             },
    ],
  },

  // ── Salary Increments ──────────────────────────────────────────────────────
  {
    module:  'increments',
    labelBn: 'বেতন বৃদ্ধি',
    labelEn: 'Salary Increment',
    icon:    '💰',
    columns: [
      { key: 'cardNo',          label: 'কার্ড নং',       type: 'text',     sortable: true, width: 90  },
      { key: 'employeeName',    label: 'নাম',             type: 'text',     sortable: true, width: 160 },
      { key: 'designation',     label: 'পদবী',            type: 'text',                    width: 140 },
      { key: 'effectiveDate',   label: 'কার্যকর তারিখ',  type: 'date',     sortable: true, width: 120, format: formatDate },
      { key: 'oldTotal',        label: 'পূর্বের বেতন',   type: 'currency',                width: 110, format: formatCurrency },
      { key: 'newTotal',        label: 'নতুন বেতন',      type: 'currency',                width: 110, format: formatCurrency },
      { key: 'incrementAmount', label: 'বৃদ্ধির পরিমাণ', type: 'currency', sortable: true, width: 120, format: formatCurrency },
      { key: 'incrementPercent',label: 'বৃদ্ধি %',        type: 'number',   sortable: true, width: 80  },
    ],
    filters: [
      { key: 'cardNo',        label: 'কার্ড নং',       type: 'text' },
      { key: 'employeeName',  label: 'নাম',             type: 'text' },
      { key: 'effectiveDate', label: 'কার্যকর তারিখ',  type: 'date' },
    ],
    detailFields: [
      { key: 'cardNo',           label: 'কার্ড নং'         },
      { key: 'employeeName',     label: 'নাম',        span: 2 },
      { key: 'designation',      label: 'পদবী'              },
      { key: 'department',       label: 'বিভাগ'             },
      { key: 'effectiveDate',    label: 'কার্যকর তারিখ'    },
      { key: 'oldBasic',         label: 'পূর্বের মূল'      },
      { key: 'oldTotal',         label: 'পূর্বের মোট'      },
      { key: 'newBasic',         label: 'নতুন মূল'         },
      { key: 'newTotal',         label: 'নতুন মোট'         },
      { key: 'incrementAmount',  label: 'বৃদ্ধির পরিমাণ'  },
      { key: 'incrementPercent', label: 'বৃদ্ধি %'          },
      { key: 'reason',           label: 'কারণ',       span: 3 },
    ],
  },

  // ── Meeting Minutes ────────────────────────────────────────────────────────
  {
    module:  'meetings',
    labelBn: 'সভার কার্যবিবরণী',
    labelEn: 'Meeting Minutes',
    icon:    '🤝',
    columns: [
      { key: 'id',            label: 'আইডি',            type: 'text',  sortable: true, width: 130 },
      { key: 'meetingTitle',  label: 'সভার শিরোনাম',   type: 'text',  sortable: true, width: 200 },
      { key: 'meetingDate',   label: 'সভার তারিখ',      type: 'date',  sortable: true, width: 120, format: formatDate },
      { key: 'venue',         label: 'স্থান',            type: 'text',                 width: 140 },
      { key: 'chairperson',   label: 'সভাপতি',          type: 'text',  sortable: true, width: 140 },
      { key: 'attendeeCount', label: 'উপস্থিত',         type: 'number',sortable: true, width: 80  },
      { key: 'language',      label: 'ভাষা',             type: 'badge',                width: 80,
        badgeMap: {
          বাংলা:   { bg: '#dbeafe', text: '#1d4ed8' },
          English: { bg: '#f3f4f6', text: '#374151' },
        },
      },
    ],
    filters: [
      { key: 'meetingTitle', label: 'সভার শিরোনাম', type: 'text' },
      { key: 'chairperson',  label: 'সভাপতি',       type: 'text' },
      { key: 'meetingDate',  label: 'সভার তারিখ',   type: 'date' },
    ],
    detailFields: [
      { key: 'meetingTitle',    label: 'সভার শিরোনাম', span: 3 },
      { key: 'meetingDate',     label: 'সভার তারিখ'          },
      { key: 'venue',           label: 'স্থান'                },
      { key: 'language',        label: 'ভাষা'                 },
      { key: 'chairperson',     label: 'সভাপতি'               },
      { key: 'secretary',       label: 'সম্পাদক'              },
      { key: 'attendeeCount',   label: 'উপস্থিত সংখ্যা'     },
      { key: 'nextMeetingDate', label: 'পরবর্তী সভার তারিখ'  },
    ],
  },
];

/** Look up a config by module name */
export const getReportConfig = (module: string): ReportConfig | undefined =>
  REPORT_CONFIGS.find(c => c.module === module);
