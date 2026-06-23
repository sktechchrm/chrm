// LeftWorkerNotice.tsx

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

const LeftWorkerNotice: React.FC<DocumentProps> = ({ formData }) => (
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

export default LeftWorkerNotice;