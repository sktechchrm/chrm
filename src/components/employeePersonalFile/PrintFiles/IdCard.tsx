// IdCard.tsx

import React from 'react';
import { FaUser } from 'react-icons/fa';
import { EmployeeFormData } from '../../../types/employee.types';

interface DocumentProps {
  formData: EmployeeFormData;
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const IdCard: React.FC<DocumentProps> = ({ formData }) => (
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

export default IdCard;