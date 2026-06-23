// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE PERSONAL DATA — Centralized shared type
//
// This is the canonical personal data shape shared across ALL modules.
// Source of truth: the `employees` sheet in Google Sheets.
//
// When a user types a Card No in any module's search bar, this type is
// returned from the employees sheet and used to auto-fill the module form.
// ─────────────────────────────────────────────────────────────────────────────

export interface EmployeePersonalData {
  // ── Identity ──────────────────────────────────────────────────────────────
  cardNo:          string;   // Primary search key
  employeeId:      string;   // Secondary ID (proximity/RFID number)
  fullName:        string;   // English name
  fullNameBengali: string;   // Bengali name
  fatherName:      string;
  motherName:      string;
  gender:          string;
  dateOfBirth:     string;
  nid:             string;   // National ID
  mobile:          string;
  email:           string;

  // ── Employment ────────────────────────────────────────────────────────────
  designation:     string;
  department:      string;   // Also called "section" in some modules
  joiningDate:     string;   // DOJ
  grade:           string;

  // ── Salary (gross breakdown) ──────────────────────────────────────────────
  basicSalary:          string;
  houseRent:            string;
  medicalAllowance:     string;
  transportAllowance:   string;
  foodAllowance:        string;
  grossSalary:          string;  // = basicSalary × 1.5 + allowances

  // ── Address ───────────────────────────────────────────────────────────────
  presentAddress:   string;
  permanentAddress: string;
}

/** Empty template — used as initial state before a search */
export const EMPTY_PERSONAL_DATA: EmployeePersonalData = {
  cardNo:          '',
  employeeId:      '',
  fullName:        '',
  fullNameBengali: '',
  fatherName:      '',
  motherName:      '',
  gender:          '',
  dateOfBirth:     '',
  nid:             '',
  mobile:          '',
  email:           '',
  designation:     '',
  department:      '',
  joiningDate:     '',
  grade:           '',
  basicSalary:     '',
  houseRent:       '',
  medicalAllowance:'',
  transportAllowance:'',
  foodAllowance:   '',
  grossSalary:     '',
  presentAddress:  '',
  permanentAddress:'',
};

/**
 * Maps an EmployeeFormData (from the PersonalFile module) to the
 * shared EmployeePersonalData shape.
 * Called when saving an employee so other modules can retrieve it.
 */
export function toPersonalData(emp: Record<string, string>): EmployeePersonalData {
  const basic    = parseFloat(emp.basicSalary   || '0');
  const house    = parseFloat(emp.houseRent     || '0');
  const med      = parseFloat(emp.medicalAllowance  || '0');
  const trans    = parseFloat(emp.transportAllowance|| '0');
  const food     = parseFloat(emp.foodAllowance || '0');
  const gross    = basic + house + med + trans + food;

  return {
    cardNo:           emp.cardNo          || '',
    employeeId:       emp.idNo            || emp.employeeId || '',
    fullName:         emp.fullName        || '',
    fullNameBengali:  emp.fullNameBengali || '',
    fatherName:       emp.fatherName      || '',
    motherName:       emp.motherName      || '',
    gender:           emp.gender          || '',
    dateOfBirth:      emp.dateOfBirth     || '',
    nid:              emp.nid             || '',
    mobile:           emp.mobile          || '',
    email:            emp.email           || '',
    designation:      emp.designation     || '',
    department:       emp.department      || emp.sectionLine || '',
    joiningDate:      emp.joiningDate     || '',
    grade:            emp.grade           || '',
    basicSalary:      String(basic   || emp.basicSalary   || ''),
    houseRent:        String(house   || emp.houseRent     || ''),
    medicalAllowance: String(med     || emp.medicalAllowance  || ''),
    transportAllowance:String(trans  || emp.transportAllowance|| ''),
    foodAllowance:    String(food    || emp.foodAllowance || ''),
    grossSalary:      String(gross   || emp.salary        || ''),
    presentAddress:   emp.presentAddress  || '',
    permanentAddress: emp.permanentAddress|| '',
  };
}
