// leftIndex.ts
export interface Address {
  houseNo: string;   // বাড়ি/বাড়ি নং/রাস্তা
  village: string;
  postOffice: string;
  thana: string;
  district: string;
}

export interface Employee {
  name: string;
  fatherName: string;
  motherName?: string;
  gender?: string;
  husbandName?: string;
  designation: string;
  cardNo: string;
  section: string;
  /** Document date — shown/edited via ModuleShell's header date picker */
  date?: string;
  joiningDate?: string;
  absenceStartDate?: string;
  firstNoticeDate?: string;
  secondNoticeDate?: string;
  thirdNoticeDate?: string;
  presentAddress: Address;
  permanentAddress: Address;
  companyName: string;        
  companyAddress: string;     
}

export const initialEmployee: Employee = {
  name: '',
  fatherName: '',
  motherName: '',
  gender: '',
  husbandName: '',
  designation: '',
  cardNo: '',
  section: '',
  date: '',
  joiningDate: '',
  absenceStartDate: '',
  firstNoticeDate: '',
  secondNoticeDate: '',
  thirdNoticeDate: '',
  companyName: '',        
  companyAddress: '',      
  presentAddress: {
    houseNo: '',
    village: '',
    postOffice: '',
    thana: '',
    district: ''
  },
  permanentAddress: {
    houseNo: '',
    village: '',
    postOffice: '',
    thana: '',
    district: ''
  }
};

// Convert English number characters to Bangla digits
export const toBanglaNumber = (input: string | number): string => {
  const banglaDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
  return input
    .toString()
    .split("")
    .map(d => {
      const n = parseInt(d);
      return isNaN(n) ? d : banglaDigits[n]; // keep non-numeric characters as-is
    })
    .join("");
};

// Format a date string as DD/MM/YYYY in Bangla digits
export const formatDateBengali = (dateString: string | undefined | null): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  // Format as DD/MM/YYYY
  const formatted = `${day}/${month}/${year}`;
  // Convert all digits to Bangla
  return toBanglaNumber(formatted);
};


// /utils/dateHelpers.ts
export interface DateParts {
  day?: string;
  month?: string;
  year?: string;
}

export const buildDateISO = ({ day, month, year }: DateParts): string => {
  if (!day || !month || !year) return '';

  const d = Number(day);
  const m = Number(month);
  const y = Number(year);

  if (
    Number.isNaN(d) ||
    Number.isNaN(m) ||
    Number.isNaN(y) ||
    d < 1 || d > 31 ||
    m < 1 || m > 12 ||
    y < 1900 || y > 2100
  ) {
    return '';
  }

  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const testDate = new Date(iso);
  if (isNaN(testDate.getTime())) return '';

  return iso;
};




// Helper function to format address
export const formatAddress = (address: Address): string => {
  const parts = [
    address.houseNo && `বাড়ি: ${address.houseNo}`,
    address.village && `গ্রাম: ${address.village}`,
    address.postOffice && `ডাকঘর: ${address.postOffice}`,
    address.thana && `থানা: ${address.thana}`,
    address.district && `জেলা: ${address.district}`
  ].filter(Boolean);
  
  return parts.join(', ');
};