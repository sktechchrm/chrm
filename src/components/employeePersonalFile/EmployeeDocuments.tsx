// EmployeeDocuments.tsx

import React from 'react';
import { FaUser } from 'react-icons/fa';
import { EmployeeFormData, AgeData } from './employee.types';

// Utility Functions
export const calculateAge = (dob: string): AgeData => {
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

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

// Document Components
interface DocumentProps {
  formData: EmployeeFormData;
}

export const AppointmentLetter: React.FC<DocumentProps> = ({ formData }) => (
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

export const NomineeForm: React.FC<DocumentProps> = ({ formData }) => (
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

export const AgeEstimation: React.FC<DocumentProps> = ({ formData }) => {
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

export const IdCard: React.FC<DocumentProps> = ({ formData }) => (
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

export const PersonalInfoSheet: React.FC<DocumentProps> = ({ formData }) => (
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

export const LeftWorkerNotice: React.FC<DocumentProps> = ({ formData }) => (
  <div className="bg-white p-8 max-w-4xl mx-auto">
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold">{formData.companyName}</h1>
      <p className="text-sm">{formData.companyAddress}</p>
    </div>
    
    <div className="mb-6">
      <p className="text-right mb-4">Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
    
    <div className="mb-6">
      <p className="font-bold text-center underline mb-4 text-red-600" role="alert">SHOW CAUSE NOTICE</p>
      <p className="font-bold text-center text-lg mb-4">অনুমতি ছাড়া কাজ ছেড়ে যাওয়া</p>
    </div>
    
    <div className="mb-4">
      <p className="mb-2">To,</p>
      <p className="font-semibold">{formData.fullName}</p>
      <p>Employee ID: {formData.employeeId}</p>
      <p>Designation: {formData.designation}</p>
      <p>Department: {formData.department}</p>
      <p>Address: {formData.presentAddress}</p>
    </div>
    
    <div className="mb-6">
      <p className="font-bold mb-2">Subject: Show Cause Notice for Unauthorized Absence from Work</p>
    </div>
    
    <div className="space-y-4 text-justify">
      <p>Dear {formData.fullName},</p>
      
      <p>It has come to our attention that you have been absent from your duties without prior permission or intimation to the management. Your unauthorized absence is a serious violation of company policy and work discipline.</p>
      
      <p><strong>Details of Absence:</strong></p>
      <ul className="list-disc ml-8 space-y-2">
        <li>Last Working Day: {formatDate(formData.joiningDate)}</li>
        <li>Days of Unauthorized Absence: _____ days (to be filled)</li>
        <li>Notice Issued Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</li>
      </ul>
      
      <p>As per company rules and regulations, leaving work without permission is considered a breach of employment terms and may lead to serious disciplinary action including termination of employment.</p>
      
      <p><strong>Show Cause Requirements:</strong></p>
      <p>You are hereby required to submit a written explanation within <strong>7 (seven) days</strong> from the date of receipt of this notice, explaining:</p>
      <ol className="list-decimal ml-8 space-y-2">
        <li>The reason for your unauthorized absence</li>
        <li>Why disciplinary action should not be taken against you</li>
        <li>Any supporting documents or evidence for your absence</li>
      </ol>
      
      <p className="font-semibold text-red-600" role="alert">Failure to respond to this notice within the specified time will be treated as an admission of misconduct, and the management will be free to take appropriate action as deemed fit, which may include termination of your employment without any further notice.</p>
      
      <p>You are advised to report to the HR Department immediately upon receipt of this notice to discuss this matter.</p>
      
      <p>This is issued for your information and necessary action.</p>
    </div>
    
    <div className="mt-16 flex justify-between">
      <div>
        <div className="border-t-2 border-black w-48 mt-12"></div>
        <p className="text-sm mt-2">Authorized Signatory</p>
        <p className="text-sm font-semibold">{formData.companyName}</p>
        <p className="text-sm">HR Department</p>
      </div>
    </div>
    
    <div className="mt-8 border-t-2 border-gray-400 pt-4">
      <p className="text-sm font-semibold mb-2">Acknowledgment of Receipt:</p>
      <p className="text-sm mb-4">I acknowledge that I have received this Show Cause Notice on ________________</p>
      <div className="flex justify-between items-end">
        <div>
          <div className="border-t-2 border-black w-48"></div>
          <p className="text-sm mt-2">Employee Signature</p>
          <p className="text-sm">{formData.fullName}</p>
        </div>
        <div>
          <p className="text-sm">Date: ______________</p>
        </div>
      </div>
    </div>
  </div>
);