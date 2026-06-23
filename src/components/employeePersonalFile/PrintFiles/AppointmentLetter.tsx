// AppointmentLetter.tsx (Enhanced & Modern)

import React from 'react';
import { EmployeeFormData, getAppointmentConditions, AppointmentCondition } from '../../../types/employee.types';

// ============= INTERFACES =============

interface DocumentProps {
  formData: EmployeeFormData;
}

interface FieldItem {
  label: string;
  value: string;
}

// ============= UTILITIES =============

/**
 * Format date to DD/MM/YYYY
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

// ============= SUB-COMPONENTS =============

/**
 * Logo Header Component
 */
const LogoHeader: React.FC<Pick<EmployeeFormData, 'companyName' | 'companyAddress'>> = ({ 
  companyName, 
  companyAddress 
}) => (
  <div className="text-center mb-6 border-b-4 border-gray-800 pb-4 print:border-b-2">
    <div className="flex items-center justify-center gap-6 mb-3">
      {/* <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-gray-200 flex items-center justify-center text-xs border-2 border-gray-400 rounded-lg shadow-md print:shadow-none">
        <span className="font-bold text-gray-600">LOGO</span>
      </div> */}
      <div className="text-left">
        <h1 className="text-3xl font-bold tracking-wide text-gray-800 print:text-2xl">
          {companyName || 'Company Name'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {companyAddress || 'Company Address'}
        </p>
      </div>
    </div>
    <div className="bg-gray-100 py-2 px-4 rounded-lg inline-block print:bg-transparent">
      <p className="text-2xl font-bold text-gray-800 underline decoration-2 print:text-xl">
        নিয়োগ পত্র
      </p>
      <p className="text-xs text-gray-600 mt-1">(Appointment Letter)</p>
    </div>
  </div>
);

/**
 * Reference Information Component
 */
const ReferenceInfo: React.FC<DocumentProps> = ({ formData }) => (
  <div className="mb-6">
    <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-4 rounded-lg border-l-4 border-blue-600 print:bg-white print:border-l-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Section */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <span className="font-bold text-gray-700 whitespace-nowrap">সূত্র নং:</span>
            <span className="font-semibold text-gray-900">
              একটি কার্ড/কর্মচারী/কর্মী/{formData.employeeId || '---'}
            </span>
          </div>
        </div>

        {/* Right Section - Date */}
        <div className="text-right">
          <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 print:shadow-none">
            <span className="font-bold text-gray-700">তারিখ: </span>
            <span className="font-semibold text-gray-900">
              {formatDate(formData.joiningDate) || '---'} ইং
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* প্রতি Section */}
    <div className="mt-4 pl-4">
      <p className="text-base font-bold text-gray-800 mb-2">প্রতি,</p>
    </div>
  </div>
);

/**
 * Address Details Table Component
 */
const AddressDetailsTable: React.FC<DocumentProps> = ({ formData }) => {
  const presentAddress: FieldItem[] = [
    { label: 'নাম', value: formData.fullName || '---' },
    { label: 'গ্রাম', value: formData.presentVillage || '---' },
    { label: 'ডাকঘর', value: formData.presentPostOffice || '---' },
    { label: 'থানা', value: formData.presentThana || '---' },
    { label: 'জেলা', value: formData.presentDistrict || '---' },
  ];

  const permanentAddress: FieldItem[] = [
    { label: 'নাম', value: formData.fullName || '---' },
    { label: 'পিতার নাম', value: formData.fatherName || '---' },
    { label: 'গ্রাম', value: formData.permanentVillage || '---' },
    { label: 'থানা', value: formData.permanentThana || '---' },
    { label: 'জেলা', value: formData.permanentDistrict || '---' },
  ];

  const AddressColumn: React.FC<{ fields: FieldItem[]; side: 'present' | 'permanent' }> = ({ fields, side }) => (
    <div className={`p-4 space-y-1.5 ${side === 'present' ? 'border-r-2 border-gray-800 print:border-r' : ''}`}>
      {fields.map((item, idx) => (
        <p key={idx} className="flex items-start text-sm">
          <span className="font-bold text-gray-700 w-24 shrink-0">{item.label}:</span>
          <span className="text-gray-900">{item.value}</span>
        </p>
      ))}
    </div>
  );

  return (
    <div className="border-2 border-gray-800 rounded-lg overflow-hidden mb-6 shadow-sm print:shadow-none print:rounded-none">
      <div className="grid grid-cols-2 border-b-2 border-gray-800 bg-gradient-to-r from-blue-100 to-gray-100 print:bg-gray-100">
        <div className="p-3 text-center font-bold border-r-2 border-gray-800 text-gray-800">
          বর্তমান ঠিকানা
        </div>
        <div className="p-3 text-center font-bold text-gray-800">
          স্থায়ী ঠিকানা
        </div>
      </div>
      <div className="grid grid-cols-2 bg-white">
        <AddressColumn fields={presentAddress} side="present" />
        <AddressColumn fields={permanentAddress} side="permanent" />
      </div>
    </div>
  );
};

/**
 * Employee Details Section
 */
const EmployeeDetails: React.FC<DocumentProps> = ({ formData }) => (
  <div className="mb-6 bg-blue-50 p-5 rounded-lg border border-blue-200 print:bg-white print:border-gray-300">
    <h3 className="font-bold text-lg mb-3 text-gray-800 border-b-2 border-blue-300 pb-2 print:border-gray-300">
      নিয়োগ বিবরণ:
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
      <div className="flex items-start">
        <span className="font-bold text-gray-700 w-32 shrink-0">নাম:</span>
        <span className="text-gray-900">{formData.fullName || '---'}</span>
      </div>
      <div className="flex items-start">
        <span className="font-bold text-gray-700 w-32 shrink-0">আইডি নং:</span>
        <span className="text-gray-900">
          {formData.cardNo ? `MGSL ${formData.cardNo}` : (formData.employeeId || '---')}
        </span>
      </div>
      <div className="flex items-start">
        <span className="font-bold text-gray-700 w-32 shrink-0">পদবী:</span>
        <span className="text-gray-900">{formData.designation || '---'}</span>
      </div>
      <div className="flex items-start">
        <span className="font-bold text-gray-700 w-32 shrink-0">বিভাগ:</span>
        <span className="text-gray-900">{formData.department || formData.sectionLine || '---'}</span>
      </div>
      <div className="flex items-start md:col-span-2">
        <span className="font-bold text-gray-700 w-32 shrink-0">যোগদানের তারিখ:</span>
        <span className="text-gray-900">{formatDate(formData.joiningDate) || '---'} ইং</span>
      </div>
    </div>
  </div>
);

/**
 * Single Condition Renderer Component
 */
const ConditionItem: React.FC<{ condition: AppointmentCondition; index: number }> = ({ condition, index }) => {
  // Salary breakdown table (Condition #2)
  if (condition.id === 2 && condition.subConditions) {
    return (
      <div className="mb-3">
        <p className="font-bold mb-2 text-gray-800">
          {condition.title}:
        </p>
        <div className="ml-6 bg-gray-50 p-3 rounded-lg border border-gray-200 print:bg-white">
          <table className="w-full max-w-md">
            <tbody>
              {condition.subConditions.map((sub, idx) => (
                <tr
                  key={idx}
                  className={sub.key === 'মোট' ? 'border-t-2 border-gray-800 font-bold' : ''}
                >
                  <td className={`py-1 text-gray-700 ${sub.key === 'মোট' ? 'pt-2 font-bold' : ''}`}>
                    {sub.key}
                  </td>
                  <td className={`text-right pr-2 text-gray-900 ${sub.key === 'মোট' ? 'font-bold' : ''}`}>
                    : {sub.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Conditions with sub-conditions (bulleted list)
  if (condition.subConditions) {
    return (
      <div className="mb-3">
        <p className="font-bold text-gray-800">
          {condition.title}
          {condition.content && `: ${condition.content}`}
        </p>
        <div className="ml-6 space-y-1 mt-1">
          {condition.subConditions.map((sub, idx) => (
            <p key={idx} className="text-gray-700 flex items-start">
              {/* <span className="mr-2">•</span> */}
              <span>{sub.key} {sub.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }

  // Regular text conditions
  return (
    <p className="mb-2 text-gray-700">
      <strong className="text-gray-800">
        {condition.title}
        {condition.content && ':'}
      </strong>{' '}
      {condition.content}
    </p>
  );
};

/**
 * Terms and Conditions Component
 */
const TermsAndConditions: React.FC<{ conditions: AppointmentCondition[] }> = ({ conditions }) => (
  <div className="mb-8">
    {/* <h3 className="font-bold text-lg mb-4 text-gray-800 bg-gray-100 p-3 rounded-lg border-l-4 border-blue-600 print:bg-gray-50 print:border-l-2">
      শর্তাবলী:
    </h3> */}
    <div className="space-y-2 pl-2">
      {conditions.map((condition, index) => (
        <ConditionItem key={condition.id} condition={condition} index={index} />
      ))}
    </div>
  </div>
);

/**
 * Signature Section Component
 */
const SignatureSection: React.FC = () => {
  const signatures = [
    { label: 'স্বাক্ষর : শ্রমিক', subLabel: '(Employee Signature)' },
    { label: 'স্বাক্ষর : কর্তৃপক্ষ', subLabel: '(Authority Signature)' }
  ];

  return (
    <div className="flex justify-between items-end mt-12 pt-6 border-t-2 border-gray-800">
      {signatures.map((signature, idx) => (
        <div key={idx} className="text-center">
          <div className="h-16" />
          <div className="border-t-2 border-gray-800 w-48 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-800">{signature.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{signature.subLabel}</p>
        </div>
      ))}
    </div>
  );
};

// ============= MAIN COMPONENT =============

/**
 * Appointment Letter Document
 */
const AppointmentLetter: React.FC<DocumentProps> = ({ formData }) => {
  const conditions = getAppointmentConditions(formData);

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto text-sm shadow-lg print:shadow-none">
      <LogoHeader 
        companyName={formData.companyName} 
        companyAddress={formData.companyAddress} 
      />
      
      <ReferenceInfo formData={formData} />
      
      <AddressDetailsTable formData={formData} />
      
      <EmployeeDetails formData={formData} />
      
      <TermsAndConditions conditions={conditions} />
      
      <SignatureSection />

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentLetter;