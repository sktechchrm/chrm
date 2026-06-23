// ==================== MEETING MINUTES TYPES (GLOBAL STANDARD) ====================

export interface Attendee {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  attendanceStatus: 'Present' | 'Absent';
  committeeRole?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface Decision {
  id: string;
  description: string;
  madeBy: string;
}

export interface AgendaItem {
  id: string;
  itemNumber: string; // e.g., "1.0", "2.1"
  topic: string;
  presenter: string;
  timeAllocated: string; // e.g., "15 mins"
  discussion: string;
  decisions: Decision[];
  actionItems: ActionItem[];
}

export interface MeetingMinutes {
  // Header Information
  organizationName: string;
  organizationAddress: string;
  department: string;
  
  // Meeting Details
  meetingTitle: string;
  meetingEstablishDate: string; // Meeting/Committee establishment date
  meetingType: 'মাসিক' | 'দ্বি-মাসিক' | 'ত্রৈমাসিক' | 'অর্ধ-বার্ষিক' | 'বার্ষিক' | 'বিশেষ' | 'অত্যাবশ্যক' | 'বোর্ড' | 'কমিটি' | 'প্রকল্প' | 'দল' | 'অন্যান্য';
  meetingNumber: string; // e.g., "MIN-2024-001"
  noticeDate: string; // Date when notice was issued
  meetingDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  virtualMeetingLink: string;
  meetingImage: string; // Base64 or URL of meeting photo
  
  // Participants
  chairperson: string;
  secretary: string;
  attendees: Attendee[];
  
  // Meeting Content
  previousMinutesReference: string; // Reference to previous meeting minutes
  previousMinutesApproval: 'Approved' | 'Approved with Amendments' | 'Rejected' | 'N/A';
  previousMinutesRejectionDetails: string; // Details when status is "Rejected"
  agendaItems: AgendaItem[];
  
  // Additional Notes
  generalNotes: string;  // Opening speech / remarks (উদ্বোধনী)
  closingNotes: string;  // Closing speech / remarks (সমাপনী)
  annexures: string[]; // List of attached documents
  
  // Next Meeting
  nextMeetingDate: string;
  nextMeetingTime: string;
  nextMeetingVenue: string;
  
  // Signatures & Approval (7 LEVELS — Prepared By is always hidden, never
  // shown via a user toggle; President + Secretary added per module spec)
  preparedBy: string;
  preparedByDesignation: string;
  preparedDate: string;
  
  reviewedBy: string;
  reviewedByDesignation: string;
  reviewedDate: string;
  
  approvedBy: string;
  approvedByDesignation: string;
  approvedDate: string;

  authority1: string;
  authority1Designation: string;
  authority1Date: string;

  authority2: string;
  authority2Designation: string;
  authority2Date: string;

  // Approval Chain Visibility Toggles (5 TOGGLES)
  showPreparedBy: boolean;
  showReviewedBy: boolean;
  showApprovedBy: boolean;
  showAuthority1: boolean; 
  showAuthority2: boolean;
  
  // Distribution
  distributionList: string[];
}

export interface MeetingMinutesManagerProps {
  setCurrentPage?: (page: string) => void;
}

export interface MeetingMinutesFormProps {
  minutes: MeetingMinutes;
  setMinutes: (data: MeetingMinutes) => void;
}

export interface MeetingMinutesViewProps {
  minutes: MeetingMinutes;
  printOption?: 'all' | 'basic' | 'attendance' | 'agenda' | 'notice';
}

// ==================== CONSTANTS ====================

export const MEETING_TYPES = [
  'মাসিক',
  'দ্বি-মাসিক',
  'ত্রৈমাসিক',
  'অর্ধ-বার্ষিক',
  'বার্ষিক',
  'বিশেষ',
  'অত্যাবশ্যক',
  'বোর্ড',
  'কমিটি',
  'প্রকল্প',
  'দল',
  'অন্যান্য'
] as const;

export const ATTENDANCE_STATUS = [
  'Present',
  'Absent',
] as const;

export const PRIORITY_LEVELS = [
  'High',
  'Medium',
  'Low'
] as const;

export const ACTION_STATUS = [
  'Pending',
  'In Progress',
  'Completed'
] as const;

export const APPROVAL_STATUS = [
  'Approved',
  'Approved with Amendments',
  'Rejected',
  'N/A'
] as const;

// ==================== FACTORY / COMMITTEE TYPES ====================

export type Gender = 'মহিলা' | 'পুরুষ';

// NEW: Committee Member Interface
export interface CommitteeMember {
  name: string;
  gender: Gender;
  designation: string;
  section: string;
}

// NEW: Authority Interface (for factories)
export interface Authority {
  name: string;
  designation: string;
}

// UPDATED: Committee Interface with Full Details (matching MG.ts)
export interface Committee {
  id: string;
  name: string;
  chairperson: string;
  chairpersonGender: Gender;
  chairpersonDesignation?: string; 
  chairpersonDept?: string;        
  secretary: string;
  secretaryGender: Gender;
  secretaryDesignation?: string;   
  secretaryDept?: string;          
  establishDate?: string;          
  members?: CommitteeMember[];     
}

// UPDATED: Factory Interface with Authorities Array (matching MG.ts)
export interface Factory {
  id: string;
  name: string;
  address: string;
  authorities?: Authority[];
  committees: Committee[];
}

// ALL_FACTORIES comes from the central factory registry — no Index.ts needed.
export { ALL_FACTORIES } from '../../factories/FactoryRegistry';

import { ALL_FACTORIES as _AF } from '../../factories/FactoryRegistry';
export const FACTORY_OPTIONS   = _AF.map(f => ({ id: f.id, name: f.name, address: f.address }));
export const COMMITTEE_OPTIONS = _AF.flatMap(f =>
  f.committees.map(c => ({ id: `${f.id}__${c.id}`, name: c.name, chairperson: c.chairperson, secretary: c.secretary }))
);

// ==================== INITIAL STATE ====================

export const INITIAL_MEETING_STATE: MeetingMinutes = {
  organizationName: "",
  organizationAddress: "",
  department: "",
  
  meetingTitle: "",
  meetingEstablishDate: "",
  meetingType: "মাসিক",
  meetingNumber: "",
  noticeDate: new Date().toISOString().split('T')[0],
  meetingDate: new Date().toISOString().split('T')[0],
  startTime: "",
  endTime: "",
  venue: "",
  virtualMeetingLink: "",
  meetingImage: "",
  
  chairperson: "",
  secretary: "",
  attendees: [],
  
  previousMinutesReference: "",
  previousMinutesApproval: "N/A",
  previousMinutesRejectionDetails: "",
  agendaItems: [],
  
  generalNotes: "",
  closingNotes: "",
  annexures: [],
  
  nextMeetingDate: "",
  nextMeetingTime: "",
  nextMeetingVenue: "",
  
  preparedBy: "",
  preparedByDesignation: "",
  preparedDate: new Date().toISOString().split('T')[0],
  
  reviewedBy: "",
  reviewedByDesignation: "",
  reviewedDate: "",
  
  approvedBy: "",
  approvedByDesignation: "",
  approvedDate: "",

  authority1: "",
  authority1Designation: "কারখানা প্রধান",
  authority1Date: "",

  authority2: "",
  authority2Designation: "ব্যবস্থাপক (মানবসম্পদ, প্রশাসন ও সম্মতি)",
  authority2Date: "",

  showPreparedBy: true,
  showReviewedBy: true,
  showApprovedBy: true,
  showAuthority1: true, 
  showAuthority2: true,
  
  distributionList: [],
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format date to DD MMM YYYY (e.g., 08 Feb 2026)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Format date to full format (e.g., Sunday, 08 February 2026)
 */
export const formatDateFull = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format time to 12-hour format (e.g., 02:30 PM)
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Calculate meeting duration
 */
export const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return '';
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  
  // Handle case where meeting goes past midnight
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const diffMinutes = endMinutes - startMinutes;
  
  if (diffMinutes <= 0) return '';
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get attendance summary
 */
export const getAttendanceSummary = (attendees: Attendee[]): {
  present: number;
  absent: number;
  total: number;
  presentPercentage: number;
} => {
  const present = attendees.filter(a => a.attendanceStatus === 'Present').length;
  const absent = attendees.filter(a => a.attendanceStatus === 'Absent').length;
  const total = attendees.length;
  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
  
  return { present, absent, total, presentPercentage };
};

/**
 * Get action items summary
 */
export const getGenderSummary = (
  members: { gender: 'মহিলা' | 'পুরুষ' }[]
): {
  male: number;
  female: number;
  total: number;
  femalePercentage: number;
  malePercentage: number;
} => {
  const male = members.filter(m => m.gender === 'পুরুষ').length;
  const female = members.filter(m => m.gender === 'মহিলা').length;
  const total = members.length;

  const femalePercentage =
    total > 0 ? Math.round((female / total) * 100) : 0;

  const malePercentage =
    total > 0 ? Math.round((male / total) * 100) : 0;

  return {
    male,
    female,
    total,
    femalePercentage,
    malePercentage,
  };
};

export const getActionItemsSummary = (agendaItems: AgendaItem[]): {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
} => {
  const allActionItems = agendaItems.flatMap(item => item.actionItems);
  
  return {
    total: allActionItems.length,
    pending: allActionItems.filter(a => a.status === 'Pending').length,
    inProgress: allActionItems.filter(a => a.status === 'In Progress').length,
    completed: allActionItems.filter(a => a.status === 'Completed').length,
    highPriority: allActionItems.filter(a => a.priority === 'High').length,
    mediumPriority: allActionItems.filter(a => a.priority === 'Medium').length,
    lowPriority: allActionItems.filter(a => a.priority === 'Low').length,
  };
};

/**
 * Get decisions summary
 */
export const getDecisionsSummary = (agendaItems: AgendaItem[]): {
  total: number;
  byAgendaItem: { topic: string; count: number }[];
} => {
  const allDecisions = agendaItems.flatMap(item => item.decisions);
  
  const byAgendaItem = agendaItems.map(item => ({
    topic: item.topic,
    count: item.decisions.length,
  })).filter(item => item.count > 0);
  
  return { total: allDecisions.length, byAgendaItem };
};

/**
 * Generate meeting reference number
 */
export const generateMeetingNumber = (prefix: string = 'MIN'): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}-${random}`;
};

/**
 * Validate meeting minutes
 */
export const validateMeetingMinutes = (minutes: MeetingMinutes): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!minutes.organizationName?.trim()) errors.push('Organization name is required');
  if (!minutes.meetingTitle?.trim())     errors.push('Meeting title is required');
  if (!minutes.noticeDate)                 errors.push('Notice date is required');
  if (!minutes.meetingDate)              errors.push('Meeting date is required');
  if (!minutes.startTime)               errors.push('Start time is required');
  if (!minutes.endTime)                 errors.push('End time is required');
  if (!minutes.venue?.trim())           errors.push('Venue is required');
  if (!minutes.chairperson?.trim())     errors.push('Chairperson is required');
  if (!minutes.secretary?.trim())       errors.push('Secretary is required');

  if (minutes.attendees.length === 0) {
    errors.push('At least one attendee is required');
  } else {
    minutes.attendees.forEach((att, i) => {
      if (!att.name?.trim())        errors.push(`Attendee ${i + 1}: Name is required`);
      if (!att.designation?.trim()) errors.push(`Attendee ${i + 1}: Designation is required`);
    });
  }

  // Validate rejection details if status is "Rejected"
  if (minutes.previousMinutesApproval === 'Rejected' && !minutes.previousMinutesRejectionDetails?.trim()) {
    errors.push('Rejection details are required when previous minutes are rejected');
  }

  if (minutes.startTime && minutes.endTime) {
    const [sh, sm] = minutes.startTime.split(':').map(Number);
    const [eh, em] = minutes.endTime.split(':').map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
      errors.push('End time must be after start time');
    }
  }

  return { isValid: errors.length === 0, errors };
};