// NomineeForm.tsx

import React from 'react';
import { EmployeeFormData } from '../../../types/employee.types';

interface DocumentProps {
  formData: EmployeeFormData;
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const NomineeForm: React.FC<DocumentProps> = ({ formData }) => (
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

export default NomineeForm;