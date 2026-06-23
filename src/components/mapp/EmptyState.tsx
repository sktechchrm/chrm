import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

const EmptyState: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center border border-gray-100">
      <FaExclamationCircle className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">
        কোন ফলাফল পাওয়া যায়নি
      </h3>
      <p className="text-gray-500 text-sm md:text-base">
        অনুগ্রহ করে অন্য শব্দ দিয়ে খুঁজুন
      </p>
      <p className="text-gray-400 text-xs md:text-sm mt-2">
        No results found. Please try different keywords.
      </p>
    </div>
  );
};

export default EmptyState;