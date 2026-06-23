// --- টাইপ সংজ্ঞা ---

export interface HistoryEntry {
  status: string;
  note: string;
  by: string;
  at: string;
}

export interface Grievance {
  ID: string;
  Name: string;
  EmployeeID: string;
  Department: string;
  Category: string;
  Description: string;
  Urgency: string;
  Status: string;
  History: string | HistoryEntry[];
  SubmittedAt: string;
  UpdatedAt: string;
}

// Single canonical definition — includes anonymous used by SubmitView
export interface SubmitForm {
  name: string;
  employeeId: string;
  department: string;
  category: string;
  description: string;
  urgency: string;
  anonymous: boolean;
}

export interface ApiResponse {
  success: boolean;
  data?: Grievance | Grievance[];
  id?: string;
  message?: string;
}

export interface ApiParams {
  [key: string]: string;
}

export interface ApiPostBody {
  action: string;
  [key: string]: unknown;
}

export interface FlowStep {
  status: string;
  icon: string;
  label: string;
  color: string;
}

export interface UrgencyColor {
  bg: string;
  text: string;
  border: string;
}

export interface UpdateForm {
  status: string;
  note: string;
  by: string;
}

export interface UpdateMsg {
  type: "success" | "error";
  text: string;
}

export interface FlowBoardProps {
  grievance: Grievance;
}
