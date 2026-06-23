import React from 'react';
import { FaBalanceScale, FaInfoCircle, FaPhone } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 text-white py-10 md:py-12 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaBalanceScale className="w-7 h-7" />
            <p className="font-bold text-xl md:text-2xl">
              বাংলাদেশ শ্রম আইন ২০০৬
            </p>
          </div>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed max-w-3xl mx-auto mb-6">
            এই অ্যাপ্লিকেশনটি শিক্ষামূলক উদ্দেশ্যে তৈরি করা হয়েছে। সর্বশেষ সংশোধনী
            ২০১৮ (শ্রম আইন) এবং ২০২২ (শ্রম বিধিমালা) অন্তর্ভুক্ত রয়েছে।
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <FaInfoCircle className="w-5 h-5 text-emerald-200" />
              <h3 className="font-semibold text-lg">গুরুত্বপূর্ণ তথ্য</h3>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed">
              এই গাইডটি সাধারণ তথ্যের জন্য প্রদান করা হয়েছে। নির্দিষ্ট আইনি
              পরামর্শের জন্য শ্রম আইনজীবী বা শ্রম অধিদপ্তরের সাথে যোগাযোগ করুন।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <FaPhone className="w-5 h-5 text-emerald-200" />
              <h3 className="font-semibold text-lg">যোগাযোগ</h3>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed">
              শ্রম অধিদপ্তর, বাংলাদেশ
              <br />
              ওয়েবসাইট: www.dol.gov.bd
              <br />
              হটলাইন: ১৬৩৩৩
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-600/30 text-center">
          <p className="text-emerald-200 text-sm">
            © ২০২৬ বাংলাদেশ শ্রমিক অধিকার গাইড | Bangladesh Labor Rights Guide
          </p>
          <p className="text-emerald-300 text-xs mt-2">
            সর্বশেষ হালনাগাদ: ফেব্রুয়ারি ২০২৬ | Last Updated: February 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;