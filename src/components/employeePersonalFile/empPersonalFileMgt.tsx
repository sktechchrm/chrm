import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from '../../utils/printCSS';
import React, { useState, ChangeEvent } from 'react';
import { FaUser, FaFileAlt, FaDownload, FaCreditCard, FaUsers, FaCalendar } from 'react-icons/fa';

interface EmpFileMgtFormData {
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
  presentAddress: string;
  permanentAddress: string;
  mobile: string;
  email: string;
  employeeId: string;
  designation: string;
  department: string;
  joiningDate: string;
  salary: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyMobile: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeNid: string;
  nomineeAddress: string;
  nomineePercentage: string;
  education: string;
  institution: string;
  companyName: string;
  companyAddress: string;
  cardNo: string;
  idNo: string;
  proximityNumber: string;
  grade: string;
  sectionLine: string;
  fixedSalary: string;
  height: string;
  weight: string;
  identificationMark: string;
  birthRegistrationNo: string;
  passportNumber: string;
  presentUnion: string;
  presentVillage: string;
  presentPostOffice: string;
  presentThana: string;
  presentDistrict: string;
  presentDivision: string;
  permanentUnion: string;
  permanentVillage: string;
  permanentPostOffice: string;
  permanentThana: string;
  permanentDistrict: string;
  permanentDivision: string;
  spouseName: string;
  spouseBloodGroup: string;
  spousePhone: string;
  spouseProfession: string;
  spouseDob: string;
  spouseEducation: string;
  numberOfSons: string;
  numberOfDaughters: string;
  educationGroup: string;
  educationResult: string;
  educationBoard: string;
  passingYear: string;
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
  supervisorName: string;
  supervisorOrg: string;
  supervisorProfession: string;
  supervisorDesignation: string;
  supervisorAddress: string;
  supervisorRelation: string;
  supervisorPhone: string;
  tinNumber: string;
  bankName: string;
  bankAccountNo: string;
  bankBranch: string;
  emergencyProfession: string;
  jobSource: string;
  localRepresentative: string;
}

interface AgeData {
  years: number;
  months: number;
  days: number;
}

type DocType = 'appointment' | 'nominee' | 'age' | 'idcard' | 'personal' | null;

const EmployeeFileSystem: React.FC = () => {
  const [formData, setFormData] = useState<EmpFileMgtFormData>({
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
    presentAddress: '',
    permanentAddress: '',
    mobile: '',
    email: '',
    employeeId: '',
    designation: '',
    department: '',
    joiningDate: '',
    salary: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyMobile: '',
    nomineeName: '',
    nomineeRelation: '',
    nomineeNid: '',
    nomineeAddress: '',
    nomineePercentage: '100',
    education: '',
    institution: '',
    companyName: 'ABC Corporation Ltd.',
    companyAddress: 'Dhaka, Bangladesh',
    cardNo: '',
    idNo: '',
    proximityNumber: '',
    grade: '',
    sectionLine: '',
    fixedSalary: '',
    height: '',
    weight: '',
    identificationMark: '',
    birthRegistrationNo: '',
    passportNumber: '',
    presentUnion: '',
    presentVillage: '',
    presentPostOffice: '',
    presentThana: '',
    presentDistrict: '',
    presentDivision: '',
    permanentUnion: '',
    permanentVillage: '',
    permanentPostOffice: '',
    permanentThana: '',
    permanentDistrict: '',
    permanentDivision: '',
    spouseName: '',
    spouseBloodGroup: '',
    spousePhone: '',
    spouseProfession: '',
    spouseDob: '',
    spouseEducation: '',
    numberOfSons: '0',
    numberOfDaughters: '0',
    educationGroup: '',
    educationResult: '',
    educationBoard: '',
    passingYear: '',
    prevCompanyName: '',
    prevServicePeriod: '',
    prevDesignation: '',
    prevSection: '',
    prevCompanyPhone: '',
    prevStartDate: '',
    prevEndDate: '',
    prevLeaveReason: '',
    prevRefName: '',
    prevRefPhone: '',
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
    supervisorName: '',
    supervisorOrg: '',
    supervisorProfession: '',
    supervisorDesignation: '',
    supervisorAddress: '',
    supervisorRelation: '',
    supervisorPhone: '',
    tinNumber: '',
    bankName: '',
    bankAccountNo: '',
    bankBranch: '',
    emergencyProfession: '',
    jobSource: '',
    localRepresentative: '',
  });

  const [activeDoc, setActiveDoc] = useState<DocType>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateAge = (dob: string): AgeData => {
    if (!dob) return { years: 0, months: 0, days: 0 };
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    
    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return { years, months, days };
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const AppointmentLetter: React.FC = () => (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{formData.companyName}</h1>
        <p className="text-sm">{formData.companyAddress}</p>
      </div>
      
      <div className="mb-6">
        <p className="text-right mb-4">Date: {formatDate(formData.joiningDate)}</p>
        <p className="mb-2">To,</p>
        <p className="font-semibold">{formData.fullName}</p>
        <p>{formData.presentAddress}</p>
      </div>
      
      <div className="mb-6">
        <p className="font-bold text-center underline mb-4">APPOINTMENT LETTER</p>
      </div>
      
      <div className="space-y-4 text-justify">
        <p>Dear {formData.fullName},</p>
        
        <p>We are pleased to inform you that you have been selected for the position of <strong>{formData.designation}</strong> in our <strong>{formData.department}</strong> department.</p>
        
        <p>Your employment will commence from <strong>{formatDate(formData.joiningDate)}</strong>.</p>
        
        <p><strong>Terms and Conditions:</strong></p>
        <ul className="list-disc ml-8 space-y-2">
          <li>Designation: {formData.designation}</li>
          <li>Department: {formData.department}</li>
          <li>Employee ID: {formData.employeeId}</li>
          <li>Monthly Salary: BDT {formData.salary}</li>
          <li>Joining Date: {formatDate(formData.joiningDate)}</li>
        </ul>
        
        <p>You are required to report to the HR Department on your joining date with all necessary documents.</p>
        
        <p>We welcome you to our organization and wish you success in your new role.</p>
      </div>
      
      <div className="mt-16 flex justify-between">
        <div>
          <p className="mb-1">Sincerely,</p>
          <div className="border-t border-black w-48 mt-12"></div>
          <p className="text-sm">Authorized Signatory</p>
          <p className="text-sm font-semibold">{formData.companyName}</p>
        </div>
        
        <div className="text-right">
          <div className="border-t border-black w-48 mt-12"></div>
          <p className="text-sm">Employee Signature</p>
          <p className="text-sm">{formData.fullName}</p>
        </div>
      </div>
    </div>
  );

  const NomineeForm: React.FC = () => (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{formData.companyName}</h1>
        <p className="text-sm">{formData.companyAddress}</p>
        <h2 className="text-xl font-bold mt-4 underline">NOMINEE FORM</h2>
      </div>
      
      <div className="space-y-6">
        <div className="border-2 border-gray-800 p-6">
          <h3 className="font-bold mb-4 text-lg">Employee Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Employee Name:</p>
              <p className="font-semibold">{formData.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employee ID:</p>
              <p className="font-semibold">{formData.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Designation:</p>
              <p className="font-semibold">{formData.designation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department:</p>
              <p className="font-semibold">{formData.department}</p>
            </div>
          </div>
        </div>
        
        <div className="border-2 border-gray-800 p-6">
          <h3 className="font-bold mb-4 text-lg">Nominee Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nominee Name:</p>
                <p className="font-semibold">{formData.nomineeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relation with Employee:</p>
                <p className="font-semibold">{formData.nomineeRelation}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">NID Number:</p>
              <p className="font-semibold">{formData.nomineeNid}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Address:</p>
              <p className="font-semibold">{formData.nomineeAddress}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Percentage of Share:</p>
              <p className="font-semibold">{formData.nomineePercentage}%</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <p className="mb-2">I hereby nominate the above-mentioned person as my nominee for all benefits and claims.</p>
          <p className="mb-8">Date: {formatDate(formData.joiningDate)}</p>
          
          <div className="flex justify-between mt-16">
            <div>
              <div className="border-t-2 border-black w-48"></div>
              <p className="text-sm mt-2">Employee Signature</p>
              <p className="text-sm">{formData.fullName}</p>
            </div>
            
            <div>
              <div className="border-t-2 border-black w-48"></div>
              <p className="text-sm mt-2">Nominee Signature</p>
              <p className="text-sm">{formData.nomineeName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AgeEstimation: React.FC = () => {
    const age = calculateAge(formData.dateOfBirth);
    
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{formData.companyName}</h1>
          <p className="text-sm">{formData.companyAddress}</p>
          <h2 className="text-xl font-bold mt-4 underline">AGE ESTIMATION CERTIFICATE</h2>
        </div>
        
        <div className="border-2 border-gray-800 p-8 space-y-6">
          <div className="text-center mb-6">
            <p className="text-lg">This is to certify that</p>
            <p className="text-2xl font-bold my-2">{formData.fullName}</p>
            <p className="text-lg">Employee ID: {formData.employeeId}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">Date of Birth:</p>
              <p className="text-xl font-bold">{formatDate(formData.dateOfBirth)}</p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">As on Today:</p>
              <p className="text-xl font-bold">{new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-2 border-blue-300 p-6 rounded-lg text-center">
            <p className="text-lg mb-2">Current Age:</p>
            <div className="flex justify-center gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-blue-600">{age.years}</p>
                <p className="text-sm">Years</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-600">{age.months}</p>
                <p className="text-sm">Months</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-600">{age.days}</p>
                <p className="text-sm">Days</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p><strong>Father's Name:</strong> {formData.fatherName}</p>
            <p><strong>Mother's Name:</strong> {formData.motherName}</p>
            <p><strong>National ID:</strong> {formData.nid}</p>
            <p><strong>Nationality:</strong> {formData.nationality}</p>
          </div>
        </div>
        
        <div className="mt-12 text-right">
          <div className="border-t-2 border-black w-48 ml-auto"></div>
          <p className="text-sm mt-2">Authorized Signatory</p>
          <p className="text-sm font-semibold">{formData.companyName}</p>
          <p className="text-sm">Date: {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>
    );
  };

  const IdCard: React.FC = () => (
    <div className="bg-white p-8 max-w-2xl mx-auto">
      <div className="border-4 border-blue-600 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">{formData.companyName}</h2>
            <p className="text-xs">EMPLOYEE IDENTITY CARD</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-gray-800">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-300 rounded flex items-center justify-center flex-shrink-0">
                <FaUser size={48} className="text-gray-500" />
              </div>
              
              <div className="flex-1 space-y-1">
                <p className="font-bold text-lg">{formData.fullName}</p>
                <p className="text-sm"><strong>ID:</strong> {formData.employeeId}</p>
                <p className="text-sm"><strong>Designation:</strong> {formData.designation}</p>
                <p className="text-sm"><strong>Department:</strong> {formData.department}</p>
                <p className="text-sm"><strong>Blood Group:</strong> {formData.bloodGroup}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs"><strong>Issue Date:</strong> {formatDate(formData.joiningDate)}</p>
              <div className="mt-3 border-t border-gray-400 w-32">
                <p className="text-xs mt-1">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 border-t-4 border-blue-600">
          <h3 className="font-bold mb-3 text-center">Emergency Contact</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {formData.emergencyName}</p>
            <p><strong>Relation:</strong> {formData.emergencyRelation}</p>
            <p><strong>Mobile:</strong> {formData.emergencyMobile}</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-xs"><strong>Address:</strong> {formData.companyAddress}</p>
            <p className="text-xs mt-2"><strong>Contact:</strong> {formData.mobile}</p>
          </div>
          
          <p className="text-xs text-center mt-4 text-gray-600">
            If found, please return to the above address
          </p>
        </div>
      </div>
    </div>
  );

const PersonalInfoSheet: React.FC = () => (
  <div className="bg-white p-8 max-w-4xl mx-auto text-gray-900 print:p-0">
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold uppercase">{formData.companyName}</h1>
      <p className="text-sm">{formData.companyAddress}</p>
      <h2 className="text-xl font-bold mt-4 underline decoration-2 underline-offset-4">PERSONAL INFORMATION SHEET</h2>
    </div>

    <div className="space-y-4">
      {/* 1. Office Identification */}
      <div className="border border-gray-800 p-3">
        <h3 className="font-bold bg-gray-100 p-1 mb-2 text-sm border-b border-gray-800">OFFICE IDENTIFICATION</h3>
        <div className="grid grid-cols-3 gap-y-2 text-sm">
          <div><strong>Employee ID:</strong> {formData.employeeId}</div>
          <div><strong>Card No:</strong> {formData.cardNo}</div>
          <div><strong>ID No:</strong> {formData.idNo}</div>
          <div><strong>Proximity No:</strong> {formData.proximityNumber}</div>
          <div><strong>Grade:</strong> {formData.grade}</div>
          <div><strong>Section/Line:</strong> {formData.sectionLine}</div>
        </div>
      </div>

      {/* 2. Personal Information */}
      <div className="border border-gray-800 p-3">
        <h3 className="font-bold bg-gray-100 p-1 mb-2 text-sm border-b border-gray-800">PERSONAL INFORMATION</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="col-span-2"><strong>Full Name (Eng):</strong> {formData.fullName}</div>
          <div className="col-span-2"><strong>Full Name (Ben):</strong> {formData.fullNameBengali}</div>
          <div><strong>Father's Name:</strong> {formData.fatherName}</div>
          <div><strong>Mother's Name:</strong> {formData.motherName}</div>
          <div><strong>Date of Birth:</strong> {formatDate(formData.dateOfBirth)}</div>
          <div><strong>Gender:</strong> {formData.gender}</div>
          <div><strong>Blood Group:</strong> {formData.bloodGroup}</div>
          <div><strong>Marital Status:</strong> {formData.maritalStatus}</div>
          <div><strong>Nationality:</strong> {formData.nationality}</div>
          <div><strong>Religion:</strong> {formData.religion}</div>
          <div><strong>National ID:</strong> {formData.nid}</div>
          <div><strong>Birth Reg. No:</strong> {formData.birthRegistrationNo}</div>
          <div><strong>Passport No:</strong> {formData.passportNumber}</div>
          <div><strong>TIN Number:</strong> {formData.tinNumber}</div>
          <div><strong>Height:</strong> {formData.height}</div>
          <div><strong>Weight:</strong> {formData.weight}</div>
          <div className="col-span-2"><strong>Identification Mark:</strong> {formData.identificationMark}</div>
        </div>
      </div>

      {/* 3. Spouse & Family */}
      <div className="border border-gray-800 p-3">
        <h3 className="font-bold bg-gray-100 p-1 mb-2 text-sm border-b border-gray-800">SPOUSE & FAMILY DETAILS</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div><strong>Spouse Name:</strong> {formData.spouseName}</div>
          <div><strong>Spouse Phone:</strong> {formData.spousePhone}</div>
          <div><strong>Profession:</strong> {formData.spouseProfession}</div>
          <div><strong>Education:</strong> {formData.spouseEducation}</div>
          <div><strong>Spouse DOB:</strong> {formatDate(formData.spouseDob)}</div>
          <div><strong>Spouse Blood:</strong> {formData.spouseBloodGroup}</div>
          <div><strong>No. of Sons:</strong> {formData.numberOfSons}</div>
          <div><strong>No. of Daughters:</strong> {formData.numberOfDaughters}</div>
        </div>
      </div>

      {/* 4. Contact Information */}
      <div className="border border-gray-800 p-3">
        <h3 className="font-bold bg-gray-100 p-1 mb-2 text-sm border-b border-gray-800">CONTACT INFORMATION</h3>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Mobile:</strong> {formData.mobile}</div>
            <div><strong>Email:</strong> {formData.email}</div>
          </div>
          <div className="border-t pt-2">
            <p className="font-semibold mb-1 italic">Present Address:</p>
            <p>{formData.presentAddress}</p>
            <p className="text-xs text-gray-600">
              Union: {formData.presentUnion}, Village: {formData.presentVillage}, P.O: {formData.presentPostOffice}, 
              Thana: {formData.presentThana}, Dist: {formData.presentDistrict}, Div: {formData.presentDivision}
            </p>
          </div>
          <div className="border-t pt-2">
            <p className="font-semibold mb-1 italic">Permanent Address:</p>
            <p>{formData.permanentAddress}</p>
            <p className="text-xs text-gray-600">
              Union: {formData.permanentUnion}, Village: {formData.permanentVillage}, P.O: {formData.permanentPostOffice}, 
              Thana: {formData.permanentThana}, Dist: {formData.permanentDistrict}, Div: {formData.permanentDivision}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Employment & Education */}
      <div className="border border-gray-800 p-3">
        <h3 className="font-bold bg-gray-100 p-1 mb-2 text-sm border-b border-gray-800">EMPLOYMENT & EDUCATION</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
          <div><strong>Designation:</strong> {formData.designation}</div>
          <div><strong>Department:</strong> {formData.department}</div>
          <div><strong>Joining Date:</strong> {formatDate(formData.joiningDate)}</div>
          <div><strong>Monthly Salary:</strong> {formData.salary}</div>
          <div><strong>Fixed Salary:</strong> {formData.fixedSalary}</div>
          <div><strong>Job Source:</strong> {formData.jobSource}</div>
          <div className="col-span-2 border-t mt-1 pt-1">
            <strong>Education:</strong> {formData.education} ({formData.educationGroup}) - {formData.educationBoard}
            <br />
            <strong>Institution:</strong> {formData.institution} | <strong>Passing Year:</strong> {formData.passingYear} | <strong>Result:</strong> {formData.educationResult}
          </div>
        </div>
      </div>

      {/* 6. Previous Experience */}
      <div className="border border-gray-800 p-3">
        <h3 className="font-bold bg-gray-100 p-1 mb-2 text-sm border-b border-gray-800">PREVIOUS EXPERIENCE</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div><strong>Company:</strong> {formData.prevCompanyName}</div>
          <div><strong>Duration:</strong> {formData.prevServicePeriod}</div>
          <div><strong>Designation:</strong> {formData.prevDesignation}</div>
          <div><strong>Reason for Leave:</strong> {formData.prevLeaveReason}</div>
          <div><strong>Ref Name:</strong> {formData.prevRefName}</div>
          <div><strong>Ref Phone:</strong> {formData.prevRefPhone}</div>
        </div>
      </div>

      {/* 7. Banking & Nominee */}
      <div className="border border-gray-800 p-3">
        <h3 className="font-bold bg-gray-100 p-1 mb-2 text-sm border-b border-gray-800">BANKING & NOMINEE</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div><strong>Bank:</strong> {formData.bankName} ({formData.bankBranch})</div>
          <div><strong>A/C No:</strong> {formData.bankAccountNo}</div>
          <div className="col-span-2 border-t mt-1 pt-1">
            <strong>Nominee:</strong> {formData.nomineeName} ({formData.nomineeRelation}) - {formData.nomineePercentage}%
            <br />
            <strong>Address:</strong> {formData.nomineeAddress}
          </div>
        </div>
      </div>

      {/* 8. Emergency & Reference */}
      <div className="border border-gray-800 p-3">
        <h3 className="font-bold bg-gray-100 p-1 mb-2 text-sm border-b border-gray-800">EMERGENCY & REFERENCE</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div><strong>Emergency Contact:</strong> {formData.emergencyName} ({formData.emergencyRelation})</div>
          <div><strong>Phone:</strong> {formData.emergencyMobile}</div>
          <div className="col-span-2 border-t mt-1 pt-1">
            <strong>Supervisor Ref:</strong> {formData.supervisorName} | {formData.supervisorOrg}
            <br />
            <strong>Supervisor Phone:</strong> {formData.supervisorPhone} | <strong>Relation:</strong> {formData.supervisorRelation}
          </div>
        </div>
      </div>
    </div>

    {/* Signatures */}
    <div className="flex justify-between mt-16 px-4">
      <div className="text-center">
        <div className="border-t border-black w-48"></div>
        <p className="text-xs font-bold mt-1">EMPLOYEE SIGNATURE</p>
        <p className="text-[10px]">Date: {formatDate(formData.joiningDate)}</p>
      </div>

      <div className="text-center">
        <div className="border-t border-black w-48"></div>
        <p className="text-xs font-bold mt-1">HR / MANAGER SIGNATURE</p>
        <p className="text-[10px]">Date: {new Date().toLocaleDateString('en-GB')}</p>
      </div>
    </div>
  </div>
);

  const handlePrint = () => {
    window.print();
  };

  const renderDocument = () => {
    switch(activeDoc) {
      case 'appointment':
        return <AppointmentLetter />;
      case 'nominee':
        return <NomineeForm />;
      case 'age':
        return <AgeEstimation />;
      case 'idcard':
        return <IdCard />;
      case 'personal':
        return <PersonalInfoSheet />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
            Employee Personal File Management System
          </h1>
          
          {!activeDoc ? (
            <div className="space-y-6">
            {/* Company Information */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="companyAddress" placeholder="Company Address" value={formData.companyAddress} onChange={handleInputChange} className="border rounded px-3 py-2" />
                </div>
            </div>

            {/* Office & Identification */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Office & Identification</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" name="cardNo" placeholder="Card No" value={formData.cardNo} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="idNo" placeholder="ID No" value={formData.idNo} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="proximityNumber" placeholder="Proximity Number" value={formData.proximityNumber} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="employeeId" placeholder="Employee ID *" value={formData.employeeId} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="grade" placeholder="Grade" value={formData.grade} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="sectionLine" placeholder="Section/Line" value={formData.sectionLine} onChange={handleInputChange} className="border rounded px-3 py-2" />
                </div>
            </div>

            {/* Personal Information */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="fullName" placeholder="Full Name (English) *" value={formData.fullName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="fullNameBengali" placeholder="Full Name (Bengali)" value={formData.fullNameBengali} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="border rounded px-3 py-2">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="border rounded px-3 py-2">
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="border rounded px-3 py-2">
                    <option value="">Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                </select>
                <input type="text" name="nationality" placeholder="Nationality" value={formData.nationality} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="religion" placeholder="Religion" value={formData.religion} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="nid" placeholder="National ID Number" value={formData.nid} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="birthRegistrationNo" placeholder="Birth Registration No" value={formData.birthRegistrationNo} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="passportNumber" placeholder="Passport Number" value={formData.passportNumber} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="height" placeholder="Height (Inches)" value={formData.height} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="weight" placeholder="Weight (KG)" value={formData.weight} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="identificationMark" placeholder="Identification Mark" value={formData.identificationMark} onChange={handleInputChange} className="border rounded px-3 py-2" />
                </div>
            </div>

            {/* Spouse & Family Details */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Spouse & Family Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="spouseName" placeholder="Spouse Name" value={formData.spouseName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="date" name="spouseDob" value={formData.spouseDob} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="spouseBloodGroup" placeholder="Spouse Blood Group" value={formData.spouseBloodGroup} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="spouseProfession" placeholder="Spouse Profession" value={formData.spouseProfession} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="tel" name="spousePhone" placeholder="Spouse Mobile" value={formData.spousePhone} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="spouseEducation" placeholder="Spouse Education" value={formData.spouseEducation} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="number" name="numberOfSons" placeholder="Number of Sons" value={formData.numberOfSons} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="number" name="numberOfDaughters" placeholder="Number of Daughters" value={formData.numberOfDaughters} onChange={handleInputChange} className="border rounded px-3 py-2" />
                </div>
            </div>

            {/* Contact Information (Address Details) */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Contact & Address Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="border rounded px-3 py-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                <div className="space-y-2">
                    <h3 className="font-medium">Present Address</h3>
                    <input type="text" name="presentAddress" placeholder="Full Address" value={formData.presentAddress} onChange={handleInputChange} className="border rounded px-3 py-2 w-full" />
                    <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="presentUnion" placeholder="Union/Municipality" value={formData.presentUnion} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" name="presentVillage" placeholder="Village" value={formData.presentVillage} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" name="presentPostOffice" placeholder="Post Office" value={formData.presentPostOffice} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" name="presentThana" placeholder="Thana" value={formData.presentThana} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" name="presentDistrict" placeholder="District" value={formData.presentDistrict} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" name="presentDivision" placeholder="Division" value={formData.presentDivision} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-medium">Permanent Address</h3>
                    <input type="text" name="permanentAddress" placeholder="Full Address" value={formData.permanentAddress} onChange={handleInputChange} className="border rounded px-3 py-2 w-full" />
                    <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="permanentUnion" placeholder="Union" value={formData.permanentUnion} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" name="permanentVillage" placeholder="Village" value={formData.permanentVillage} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" name="permanentPostOffice" placeholder="Post Office" value={formData.permanentPostOffice} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" name="permanentThana" placeholder="Thana" value={formData.permanentThana} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" name="permanentDistrict" placeholder="District" value={formData.permanentDistrict} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" name="permanentDivision" placeholder="Division" value={formData.permanentDivision} onChange={handleInputChange} className="border rounded px-2 py-1 text-sm" />
                    </div>
                </div>
                </div>
            </div>

            {/* Employment Information */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Employment Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="designation" placeholder="Designation *" value={formData.designation} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="number" name="salary" placeholder="Monthly Salary" value={formData.salary} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="fixedSalary" placeholder="Fixed Salary" value={formData.fixedSalary} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="jobSource" placeholder="Job Source" value={formData.jobSource} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="localRepresentative" placeholder="Local Representative" value={formData.localRepresentative} onChange={handleInputChange} className="border rounded px-3 py-2" />
                </div>
            </div>

            {/* Educational Information */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Educational Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="education" placeholder="Highest Education" value={formData.education} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="institution" placeholder="Institution Name" value={formData.institution} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="educationGroup" placeholder="Group/Subject" value={formData.educationGroup} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="educationResult" placeholder="Result/GPA" value={formData.educationResult} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="educationBoard" placeholder="Board/University" value={formData.educationBoard} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="passingYear" placeholder="Passing Year" value={formData.passingYear} onChange={handleInputChange} className="border rounded px-3 py-2" />
                </div>
            </div>

            {/* Previous Experience */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Previous Experience</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="prevCompanyName" placeholder="Company Name" value={formData.prevCompanyName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="prevDesignation" placeholder="Designation" value={formData.prevDesignation} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="prevServicePeriod" placeholder="Service Period" value={formData.prevServicePeriod} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="prevSection" placeholder="Section/Dept" value={formData.prevSection} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="tel" name="prevCompanyPhone" placeholder="Company Phone" value={formData.prevCompanyPhone} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="prevLeaveReason" placeholder="Reason for Leaving" value={formData.prevLeaveReason} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="prevRefName" placeholder="Reference Officer Name" value={formData.prevRefName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="tel" name="prevRefPhone" placeholder="Reference Officer Phone" value={formData.prevRefPhone} onChange={handleInputChange} className="border rounded px-3 py-2" />
                </div>
            </div>

            {/* Emergency & Banking */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Emergency Contact & Banking</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" name="emergencyName" placeholder="Emergency Contact Name" value={formData.emergencyName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="emergencyRelation" placeholder="Relation" value={formData.emergencyRelation} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="tel" name="emergencyMobile" placeholder="Mobile Number" value={formData.emergencyMobile} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="bankName" placeholder="Bank Name" value={formData.bankName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="bankAccountNo" placeholder="Account Number" value={formData.bankAccountNo} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="bankBranch" placeholder="Branch Name" value={formData.bankBranch} onChange={handleInputChange} className="border rounded px-3 py-2" />
                </div>
            </div>

            {/* Nominee Information */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Nominee Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="nomineeName" placeholder="Nominee Name" value={formData.nomineeName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="nomineeRelation" placeholder="Relation with Employee" value={formData.nomineeRelation} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="nomineeNid" placeholder="Nominee NID Number" value={formData.nomineeNid} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="number" name="nomineePercentage" placeholder="Percentage of Share" value={formData.nomineePercentage} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="nomineeEducation" placeholder="Nominee Education" value={formData.nomineeEducation} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="nomineeProfession" placeholder="Nominee Profession" value={formData.nomineeProfession} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="nomineeAddress" placeholder="Full Nominee Address" value={formData.nomineeAddress} onChange={handleInputChange} className="border rounded px-3 py-2 md:col-span-2" />
                </div>
            </div>

            {/* Supervisor (Reference) */}
            <div className="border-2 border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Supervisor / Reference (mycvt)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="supervisorName" placeholder="Supervisor Name" value={formData.supervisorName} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="supervisorOrg" placeholder="Organization Name" value={formData.supervisorOrg} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="supervisorDesignation" placeholder="Designation" value={formData.supervisorDesignation} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="tel" name="supervisorPhone" placeholder="Mobile Number" value={formData.supervisorPhone} onChange={handleInputChange} className="border rounded px-3 py-2" />
                <input type="text" name="supervisorRelation" placeholder="Relationship" value={formData.supervisorRelation} onChange={handleInputChange} className="border rounded px-3 py-2 md:col-span-2" />
                </div>
            </div>

            {/* Generate Documents */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-700 text-center">Generate Documents</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <button onClick={() => setActiveDoc('appointment')} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition">
                    <FaFileAlt size={32} /> <span className="text-sm">Appointment Letter</span>
                </button>
                <button onClick={() => setActiveDoc('nominee')} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition">
                    <FaUsers size={32} /> <span className="text-sm">Nominee Form</span>
                </button>
                <button onClick={() => setActiveDoc('age')} className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition">
                    <FaCalendar size={32} /> <span className="text-sm">Age Estimation</span>
                </button>
                <button onClick={() => setActiveDoc('idcard')} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition">
                    <FaCreditCard size={32} /> <span className="text-sm">ID Card</span>
                </button>
                <button onClick={() => setActiveDoc('personal')} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition">
                    <FaUser size={32} /> <span className="text-sm">Personal Info Sheet</span>
                </button>
                </div>
            </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex justify-between items-center no-print">
                <button
                  onClick={() => setActiveDoc(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  ← Back to Form
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition"
                >
                  <FaDownload size={20} />
                  Print / Save PDF
                </button>
              </div>
              
              <div className="print-area">
                {renderDocument()}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        ${BASE_PRINT_CSS}
        ${PAGE_A4_PORTRAIT}
        @media print {
          .print-area {
            margin: 0;
            padding: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeFileSystem;