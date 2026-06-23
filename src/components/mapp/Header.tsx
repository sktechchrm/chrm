import React from 'react';
import { FaBook } from 'react-icons/fa';

const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <FaBook className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              শ্রমিক অধিকার গাইড
            </h1>
            <p className="text-emerald-50 text-xs md:text-sm mt-1">
              Bangladesh Labor Rights Guide
            </p>
          </div>
        </div>
        <p className="text-emerald-50 text-sm md:text-base leading-relaxed max-w-3xl">
          বাংলাদেশ শ্রম আইন ২০০৬ ও শ্রম বিধিমালা ২০১৫ অনুযায়ী সম্পূর্ণ তথ্য
        </p>
      </div>
    </div>
  );
};

export default Header;