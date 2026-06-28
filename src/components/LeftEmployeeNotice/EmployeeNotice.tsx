import React from 'react';
import { Employee, formatDateBengali, toBanglaNumber } from '../../types/LeftNoticeDataType';
import { PrintSignatureRow } from '../common/AuthorizationBlock';
import type { AuthorizationState } from '../common/AuthorizationBlock';
import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from '../../utils/printCSS';


interface Props {
  employee: Employee;
  title: string;
  content?: React.ReactNode;
  hideDefaultFooter?: boolean;
  noticeType?: 'notice1' | 'notice2' | 'notice3';
  /** Authority signature block — sourced from the shared Authorization panel.
   *  "Prepared By" is always hidden for this module (single-signatory-style
   *  approval chain); the user picks which of Authorized 1/2, Approved 1/2
   *  to show via the same visibility checkboxes used by other modules. */
  authorization?: AuthorizationState;
}

export const NoticeLetter: React.FC<Props> = ({ 
  employee, 
  title, 
  content, 
  hideDefaultFooter = false,
  authorization,
  noticeType 
}) => {

const copyList = [
  'শ্রমিকের ব্যক্তিগত নথি।',
  'সংশ্লিষ্ট ব্যক্তি।'
];


// Get dates based on notice type
const getNoticeDates = () => {
  switch (noticeType) {
    case 'notice1':
      return {
        absenceDate: formatDateBengali(employee.absenceStartDate || ''),
        noticeDate: formatDateBengali(employee.firstNoticeDate || '')
      };
    case 'notice2':
      return {
        absenceDate: formatDateBengali(employee.absenceStartDate || ''),
        firstNoticeDate: formatDateBengali(employee.firstNoticeDate || ''),
        noticeDate: formatDateBengali(employee.secondNoticeDate || '')
      };
    case 'notice3':
      return {
        absenceDate: formatDateBengali(employee.absenceStartDate || ''),
        firstNoticeDate: formatDateBengali(employee.firstNoticeDate || ''),
        secondNoticeDate: formatDateBengali(employee.secondNoticeDate || ''),
        noticeDate: formatDateBengali(employee.thirdNoticeDate || '')
      };
    default:
      return {};
  }
};

  const dates = getNoticeDates();

  // Dynamic content based on notice type
  const getDynamicContent = () => {
    if (content) return content;

    switch (noticeType) {
      case 'notice1':
        return (
          <div className="space-y-4">
            <div>
              <p className="font-bold underline">বিষয় : বাংলাদেশ শ্রম আইন ২০০৬ এর ২৭ (৩ক) ধারা মোতাবেক ব্যাখ্যা প্রদান সহ চাকুরীতে যোগদানের জন্য নোটিশ।</p>
            </div>

            <p>জনাব/জনাবা,</p>

            <p className="text-justify">
              আপনি গত <span className="font-bold underline">{dates.absenceDate}</span> ইং তারিখ থেকে কারখানা কর্তৃপক্ষের বিনা অনুমতিতে কর্মস্থলে অনুপস্থিত রয়েছেন। আপনার এরূপ অনুপস্থিতি বাংলাদেশ শ্রম আইন ২০০৬ এর ২৭ (৩ক) ধারার আওতায় পড়ে।
            </p>

            <p className="text-justify">
              সুতরাং অত্র পত্র প্রাপ্তির ১০ (দশ) দিনের মধ্যে আপনার অনুপস্থিতির কারণ ব্যাখ্যা সহ কাজে যোগদানের জন্য আপনাকে নির্দেশ দেয়া হলো।
            </p>

            <p className="text-justify">
              আপনার লিখিত জবাব উক্ত সময়ের মধ্যে নিম্নস্বাক্ষরকারীর নিকট অবশ্যই পৌঁছাতে হবে। অন্যথায় কর্তৃপক্ষ আপনার বিরুদ্ধে প্রয়োজনীয় আইনানুগ ব্যবস্থা নিতে বাধ্য হবে।
            </p>
          </div>
        );

      case 'notice2':
        return (
          <div className="space-y-4 text-justify">
            <div>
              <p className="font-bold underline">বিষয় : বাংলাদেশ শ্রম আইন ২০০৬ এর ২৭ (৩ক) ধারা মোতাবেক আত্মপক্ষ সমর্থনের সুযোগ প্রদান প্রসঙ্গে।</p>
            </div>

            <p>জনাব/জনাবা,</p>

            <p>
              আপনি গত <span className="font-bold underline">{dates.absenceDate}</span> ইং তারিখ থেকে কারখানা কর্তৃপক্ষের বিনা অনুমতিতে কর্মস্থলে অনুপস্থিত রয়েছেন। এ প্রেক্ষিতে কারখানা কর্তৃপক্ষ আপনার স্থায়ী ও বর্তমান ঠিকানায় রেজিস্ট্রি ডাকযোগে গত <span className="font-bold underline">{dates.firstNoticeDate}</span> ইং তারিখে বিনানুমতিতে চাকুরীতে অনুপস্থিতির কারণ ব্যাখ্যা সহ কাজে যোগদানের জন্য পত্র প্রেরণ করা হয়। কিন্তু অদ্যবধি আপনি উপরোক্ত বিষয়ে কোন ধরণের লিখিত ব্যাখ্যা প্রদান করেন নাই অথবা চাকুরীতেও যোগদান করেন নাই।
            </p>

            <p>
              অতএব, অত্র পত্র প্রাপ্তির ০৭ (সাত) দিনের মধ্যে আত্মপক্ষ সমর্থন সহ কাজে যোগদান করিতে আপনাকে নির্দেশ দেয়া গেল।
            </p>

            <p>
              উক্ত সময়ের মধ্যে আপনি আত্মপক্ষ সমর্থনের জবাব সহ কাজে যোগদান করতে ব্যর্থ হলে বাংলাদেশ শ্রম আইন ২০০৬ এর ২৭ (৩ক) ধারা অনুযায়ী আপনি স্বেচ্ছায় চাকুরী থেকে ইস্তফা গ্রহণ করেছেন বলে গণ্য হবে।
            </p>
          </div>
        );

      case 'notice3':
        return (
          <div className="space-y-4 text-justify">
            <div>
              <p className="font-bold underline">বিষয় : বাংলাদেশ শ্রম আইন ২০০৬ এর ২৭ (৩ক) ধারা মোতাবেক শ্রমিক কর্তৃক স্বেচ্ছায় চাকুরী হইতে ইস্তফা প্রসঙ্গে।</p>
            </div>

            <p>জনাব/জনাবা,</p>

            <p>
              আপনি গত <span className="font-bold underline">{dates.absenceDate}</span> ইং তারিখ হতে অদ্যবধি পর্যন্ত কর্তৃপক্ষের বিনা অনুমতিতে কর্মস্থলে অনুপস্থিত থাকার আপনাকে গত <span className="font-bold underline">{dates.firstNoticeDate}</span> ইং তারিখে একটি পত্রের মাধ্যমে ১০ (দশ) দিনের সময় দিয়ে চাকুরীতে যোগদান সহ ব্যাখ্যা প্রদান করতে বলা হয়েছিল। কিন্তু আপনি নির্ধারিত সময়ের মধ্যে কর্মস্থলে উপস্থিত হননি এবং কোন ব্যাখ্যা প্রদান করেননি।
            </p>

            <p>
              তথাপি কর্তৃপক্ষ গত <span className="font-bold underline">{dates.secondNoticeDate}</span> ইং তারিখে আর একটি পত্রের মাধ্যমে আপনাকে আরো ৭ (সাত) দিনের সময় দিয়ে আত্মপক্ষ সমর্থন সহ চাকুরীতে যোগদানের জন্য পুনরায় নির্দেশ প্রদান করেন। তৎসত্ত্বেও আপনি নির্ধারিত সময়ের মধ্যে আত্মপক্ষ করেননি এবং যোগদান করেননি।
            </p>

            <p>
              সুতরাং বাংলাদেশ শ্রম আইন, ২০০৬ এর ২৭ (৩ক) ধারা অনুযায়ী অনুপস্থিত দিন থেকে আপনি চাকুরী হতে স্বেচ্ছায় ইস্তফা গ্রহণ করেছেন বলে গণ্য করা হলো।
            </p>

            <p>
              অতএব, আপনার বকেয়া মজুরী ও আইনানুগ পাওনা (যদি থাকে) যে কোন কর্মদিবসে অফিস চলাকালীন সময়ে কারখানার হিসাব শাখা থেকে গ্রহণ করার জন্য নির্দেশ দেয়া গেল।
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 shadow-lg print:shadow-none print:w-full print:max-w-none rounded-lg print:rounded-none">
      
      <div className="print-content leading-relaxed">
        
        {/* ==================== HEADER SECTION (Company Name & Address ONLY) ==================== */}
        <header className="print-header">
          {(employee.companyName || employee.companyAddress) && (
            <div className="text-center border-b-2 border-blue-500 pb-3 print:border-black company-header">
              {employee.companyName && (
                <h1 className="text-lg sm:text-xl font-bold text-blue-900 print:text-black mb-1 company-name">
                  {employee.companyName}
                </h1>
              )}
              {employee.companyAddress && (
                <p className="text-sm sm:text-base text-gray-700 print:text-black company-address">
                  {employee.companyAddress}
                </p>
              )}
            </div>
          )}
        </header>

        {/* ==================== BODY SECTION (Everything Except Header & Footer) ==================== */}
        <main className="print-body space-y-3 mt-4">
          
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-center underline decoration-2">
            "রেজিস্টার্ড ডাকযোগে প্রেরিত" 
          </h1>

          {/* Notice Date */}
          {dates.noticeDate && (
            <div className="text-right text-sm sm:text-base">
              <p>
                <span className="font-semibold text-blue-700 print:text-black">({title})</span> <br />
                <span className="font-semibold text-gray-700 print:text-black">তারিখ:</span>{" "}
                <span className="font-semibold text-gray-700 print:text-black">{toBanglaNumber(dates.noticeDate)} ইং</span>
              </p>
            </div>
          )}

          {/* Formal Address */}
          <div className="text-sm sm:text-base">
            <p className="font-semibold">প্রতি,</p>
          </div>

          {/* Employee Information Grid */}
          <div className="p-2 sm:p-3 print:p-0 employee-info-section">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 employee-grid">

              {/* Column 1 - Personal Info */}
              <div className="space-y-1 employee-column">
                <h3 className="font-bold text-base border-b-2 border-black pb-1 mb-1 print:border-black">
                  ব্যক্তিগত তথ্য
                </h3>
                <p className="text-sm"><span className="font-semibold">নাম:</span> {employee.name || '-'}</p>
                <p className="text-sm"><span className="font-semibold">পিতার নাম:</span> {employee.fatherName || '-'}</p>
                {employee.motherName && (
                  <p className="text-sm"><span className="font-semibold">মাতার নাম:</span> {employee.motherName}</p>
                )}
                <p className="text-sm"><span className="font-semibold">পদবী:</span> {employee.designation || '-'}</p>
                <p className="text-sm"><span className="font-semibold">কার্ড নং:</span> {employee.cardNo || '-'}</p>
                <p className="text-sm"><span className="font-semibold">সেকশন:</span> {employee.section || '-'}</p>
                {employee.joiningDate && (
                  <p className="text-sm"><span className="font-semibold">যোগদানের তারিখ:</span> {formatDateBengali(employee.joiningDate)}</p>
                )}
              </div>

              {/* Column 2 - Present Address */}
              <div className="space-y-1 employee-column">
                <h3 className="font-bold text-base border-b-2 border-black pb-1 mb-1 print:border-black">
                  বর্তমান ঠিকানা
                </h3>
{employee.presentAddress.houseNo && <p className="text-xs sm:text-sm">বাড়ি: {employee.presentAddress.houseNo}</p>}
                {employee.presentAddress.village && <p className="text-xs sm:text-sm">গ্রাম: {employee.presentAddress.village}</p>}
                {employee.presentAddress.postOffice && <p className="text-xs sm:text-sm">ডাকঘর: {employee.presentAddress.postOffice}</p>}
                {employee.presentAddress.thana && <p className="text-xs sm:text-sm">থানা: {employee.presentAddress.thana}</p>}
                {employee.presentAddress.district && <p className="text-xs sm:text-sm">জেলা: {employee.presentAddress.district}</p>}
              </div>

              {/* Column 3 - Permanent Address */}
              <div className="space-y-1 employee-column">
                <h3 className="font-bold text-base border-b-2 border-black pb-1 mb-1 print:border-black">
                  স্থায়ী ঠিকানা
                </h3>
{employee.permanentAddress.houseNo && <p className="text-xs sm:text-sm">বাড়ি: {employee.permanentAddress.houseNo}</p>}
                {employee.permanentAddress.village && <p className="text-xs sm:text-sm">গ্রাম: {employee.permanentAddress.village}</p>}
                {employee.permanentAddress.postOffice && <p className="text-xs sm:text-sm">ডাকঘর: {employee.permanentAddress.postOffice}</p>}
                {employee.permanentAddress.thana && <p className="text-xs sm:text-sm">থানা: {employee.permanentAddress.thana}</p>}
                {employee.permanentAddress.district && <p className="text-xs sm:text-sm">জেলা: {employee.permanentAddress.district}</p>}
              </div>

            </div>
          </div>

          {/* Notice Content */}
          <div className="text-sm sm:text-base whitespace-pre-wrap print:text-base mt-4">
            {getDynamicContent()}
          </div>

          {/* Copy List */}
          {noticeType && (
            <div className="mt-6">
              <p className="font-bold underline mb-2">অনুলিপি:</p>
              <ol className="space-y-1 text-sm sm:text-base">
                {copyList.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="font-semibold">
                      {toBanglaNumber(String(index + 1))}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </main>

        {/* ==================== FOOTER SECTION (Authority Info ONLY) ==================== */}
        {/* Authority signature block — "Prepared By" always hidden for this
            module (hidePrepared), but Authorized 1/2 and Approved 1/2 remain
            fully user-selectable via the same visibility checkboxes used by
            other modules. PrintSignatureRow lays these out dynamically:
            1 selected -> left-aligned; 2+ -> spread left to right. */}
        {noticeType && (
          <div className="mt-12">
            <p className="font-bold underline">কর্তৃপক্ষের নির্দেশক্রমে</p>
          </div>
        )}

        {noticeType && authorization && (
          <footer className="print-footer mt-4">
            <PrintSignatureRow value={authorization} lang="bn" hidePrepared />
          </footer>
        )}

      </div>

      {/* PRINT STYLES */}
      <style>{`
        ${BASE_PRINT_CSS}
        ${PAGE_A4_PORTRAIT}
        @media print {
          @page { margin: 0.5in 0.6in; }
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; box-sizing: border-box; }
          .print-content { position: absolute !important; left: 0 !important;
            top: 0 !important; width: 100%; max-width: 100%; }

          /* Force the Employee Information grid to 3 side-by-side columns in
             print — Tailwind's lg:grid-cols-3 breakpoint is evaluated against
             viewport width, which print engines often don't honor reliably,
             causing the grid to fall back to its grid-cols-1 default and
             stack into 3 separate rows instead of columns. */
          .employee-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12pt !important;
          }
          .employee-column { break-inside: avoid !important; page-break-inside: avoid !important; }

          /* Keep the whole notice on a single printed page — avoid forced
             breaks splitting the letter across pages. */
          .print-content { page-break-inside: avoid !important; }
        }
      `}</style>
    </div>
  );
};